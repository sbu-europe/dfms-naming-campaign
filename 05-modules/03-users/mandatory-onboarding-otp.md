---
module: 03-users
specification: Mandatory onboarding OTP — invitation module spec
version: 2.2
phase: Phase 1
status: Implemented
last_updated: 2026-08-06
related_stories: US-005
related_cr: CR-003
implementation_reference:
  - nourish-backend/apps/users/invitation_service.py
  - nourish-backend/apps/users/web_views.py
---

# Mandatory onboarding OTP — module spec

> **Purpose**: Implementation spec for [CR-003](../../11-change-requests/CR-003-mandatory-onboarding-otp.md), written **before** the code change so engineering has a concrete contract to build against and product/QA have a concrete contract to verify against.
>
> **Scope**: Onboarding OTP during user invitation/activation only, made **unconditional** — independent of `otp_type`. **`otp_type` and login 2FA are out of scope and are not modified.** `AuthService._get_login_2fa_setting()`, `admin_login_requires_otp()`, `apps/core/admin_otp.py`, the `CreateInvitationSerializer.otp_type` field, `InviteUserForm.otp_type`, and the bulk-import `otp_type` CSV column are all **untouched** by this spec.

> **v2.1 revision note**: v2.0 incorrectly stated that the admin-facing "Reinvite selected users" action reaches OTP generation through `resend_activation_otp()`. It doesn't — `resend_invitation()` has its own independent, inline OTP block. v2.0's diff also carried a latent bug: the delivery-channel branch inside `resend_activation_otp()` keyed off `otp_type` rather than `invite_channel`, which would misroute OTP delivery for phone-only legacy invitations once the `otp_type` gate was removed. §3.3–§3.3.2 below are rewritten to fix both: a shared `_regenerate_and_dispatch_activation_otp()` helper now owns channel selection (keyed on `invite_channel`), and the admin resend path gets its own explicit, unconditional-generation edit.
>
> **v2.2 revision note**: §3.5 originally scoped this change to `invitation_service.py` only, on the assumption that the SSR activation page (`apps/users/web_views.py`) already read OTP-required state generically. It doesn't — `activate_account()` independently re-derived "is OTP required" from `inv.otp_type`, the same coupling this spec exists to remove. Left unpatched, invitees clicked the activation link and landed directly on the password-set step, skipping OTP entirely, because `otp_type` defaults to `none`. §3.6 (new) documents the required `web_views.py` fix — same "token state, not `otp_type`" gate (§4), plus the same `invite_channel`-not-`otp_type` channel-selection fix as §3.3. This file is now in scope; status moves to **Implemented**.

---

## 1. Why `otp_type` cannot be the mechanism for this change

An earlier draft of this spec proposed deriving `otp_type` from `invite_channel` (removing `none` as a reachable value) to force onboarding OTP on for everyone. That approach was rejected: `otp_type` is also the data source `AuthService._get_login_2fa_setting()` reads for the **separate** login-2FA mechanism. Forcing `otp_type` to never be `none` would have made login 2FA mandatory for every new user as a side effect — even though no login-2FA code changed. Since login 2FA must remain fully unaffected, `otp_type` must remain untouched and `none` must remain a reachable value for it.

**Resolution**: decouple the two mechanisms completely. Onboarding OTP becomes unconditionally required by the activation flow itself — it stops reading `otp_type` at all. `otp_type` keeps its current job (admin-settable, defaults to `none`, read only by login 2FA) with zero changes.

---

## 2. Behavior change summary

| | Today (shipped) | After this spec |
|---|---|---|
| `otp_type` | Admin-settable, defaults `none`, drives both onboarding-OTP gating and login 2FA | **Unchanged.** Still admin-settable, still defaults `none`, still drives login 2FA only — no longer read by onboarding OTP at all |
| Onboarding OTP generation | Only generated `if _otp_requires_verification(otp_type)` | **Always generated**, on every new `InvitationToken`, regardless of `otp_type` |
| Onboarding OTP verification | Only required `if _otp_requires_verification(otp_type)` | **Always required** if the token has an activation OTP configured (see §4 gate) |
| Admin choice | `invite_channel` + `otp_type` (two fields) | **Unchanged** — still two fields; `otp_type` keeps meaning "login 2FA setting," unrelated to the now-mandatory onboarding OTP |
| Entry points touched | — | **`invitation_service.py` (§3) and `web_views.py` (§3.6).** API serializer, Django admin form, bulk CSV import are not modified |
| Activation flow (`/activate/?token=…`) | Step 1 (OTP) optional depending on `otp_type` | Step 1 (OTP) always present for tokens created after this ships |

---

## 3. Implementation — `apps/users/invitation_service.py` only

### 3.1 `_create_token_and_dispatch()`

**Before** (conditional on `otp_type`):
```python
otp_plain = None
activation_otp_hash = ""
activation_otp_expires_at = None
if _otp_requires_verification(otp_type):
    otp_plain = _generate_otp()
    activation_otp_hash = _hash_otp(otp_plain)
    activation_otp_expires_at = timezone.now() + timedelta(
        minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10)
    )
```

**After** (unconditional):
```python
otp_plain = _generate_otp()
activation_otp_hash = _hash_otp(otp_plain)
activation_otp_expires_at = timezone.now() + timedelta(
    minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10)
)
```

`otp_type` is still accepted as a parameter and still stored on the created `InvitationToken` row exactly as today (it's the caller-supplied value from the admin's `otp_type` choice, untouched) — this function simply stops branching on it to decide whether to generate an activation OTP. Delivery is already keyed off `invite_channel` (email vs SMS dispatch), so no change needed there — `activation_otp=otp_plain` now simply always carries a real value instead of sometimes being `None`.

### 3.2 `verify_invitation_otp()`

**Before**:
```python
if not _otp_requires_verification(inv.otp_type):
    raise ValidationError(
        {"detail": "This invitation does not require OTP verification.", "code": "INV-400-OTP"},
    )
```

**After**:
```python
if not inv.activation_otp_hash or not inv.activation_otp_expires_at:
    raise ValidationError(
        {"detail": "This invitation does not require OTP verification.", "code": "INV-400-OTP"},
    )
```

This reuses the existing "OTP is not configured for this invitation" check that already exists a few lines below (previously redundant with the `otp_type` gate) as the **sole** gate. For every token created after this ships, `activation_otp_hash` is always populated (per §3.1), so this check always passes. For pre-rollout tokens (see §5), it correctly reports "not required."

### 3.3 Shared helper: `_regenerate_and_dispatch_activation_otp()`

**Decision**: resend becomes unconditional across both resend entry points (§3.3.1, §3.3.2) — each generates a fresh OTP regardless of whether the invitation had one before. This means a legacy invitation (created pre-rollout, never had `activation_otp_hash`) gets **upgraded** to requiring OTP the moment anyone resends it, even though it didn't require OTP at creation.

Rather than repeat the generate/overwrite/redeliver logic in each of the two resend functions, factor it into one new private helper in `invitation_service.py`, used by both:

```python
def _regenerate_and_dispatch_activation_otp(
    *, invitation: InvitationToken, schema_name: str, sync_email: bool = False
) -> None:
    now = timezone.now()
    otp_plain = _generate_otp()
    invitation.activation_otp_hash = _hash_otp(otp_plain)
    invitation.activation_otp_expires_at = now + timedelta(
        minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10)
    )
    invitation.activation_otp_attempts = 0

    invite_url = _build_activation_url(invitation.token, schema_name)
    name = invitation.invited_by.full_name if invitation.invited_by else "DFMS"

    if invitation.invite_channel == InvitationToken.InviteChannel.PHONE:
        if not invitation.phone_number:
            raise ValidationError(
                {"phone_number": "Invitation has no phone number for OTP SMS."},
                code="INV-400-PHONE",
            )
        from apps.notifications.sms import send_activation_otp_sms

        # SMS only — email keeps the full activation URL (AUTH-01 shortener plan §4).
        sms_url = shorten_for_sms(
            target_url=invite_url, token=invitation.token, expires_at=invitation.expires_at
        )
        send_activation_otp_sms(to_phone=invitation.phone_number, otp=otp_plain, activation_url=sms_url)
        return

    if sync_email:
        _dispatch_staff_invitation_email(
            to_email=invitation.email, invite_url=invite_url,
            invited_by_name=name, activation_otp=otp_plain, schema_name=schema_name,
        )
    else:
        _queue_staff_invitation_email(
            to_email=invitation.email, invite_url=invite_url,
            invited_by_name=name, activation_otp=otp_plain, schema_name=schema_name,
        )
```

**Fix vs. the shipped `resend_activation_otp()` body this replaces**: the current code picks SMS-vs-email delivery off `invitation.otp_type == PHONE`, not `invitation.invite_channel == PHONE`. That's harmless today only because the current guard (`if not _otp_requires_verification(otp_type): raise ...`) makes the function unreachable whenever `otp_type=none`, and `_validate_otp_type_for_channel` never allows `otp_type=email` on a phone-channel invite — so today's only reachable phone case is `otp_type=phone`, which happens to match. Once resend becomes unconditional (the entire point of this spec), a phone-channel invitation with `otp_type=none` — the default, and the common case once OTP is mandatory regardless of `otp_type` — would reach this logic, fail an `otp_type == PHONE` check, and fall into the **email** branch against an invitee who may have no email address at all (phone-only invites are supported by `_resolve_invite_identity`). The helper above keys off `invite_channel` instead, matching `_create_token_and_dispatch()` (§3.1) and the untouched dispatch logic already inside `resend_invitation()` (§3.3.2).

### 3.3.1 `resend_activation_otp()` (invitee-facing)

`POST /api/v1/users/invitations/{token}/otp/resend/` → `InvitationActivationOtpResendView` (invitee clicks "Resend code" on the activation page).

**Before**:
```python
def resend_activation_otp(*, invitation: InvitationToken, schema_name: str, sync_email: bool = False) -> None:
    if not _otp_requires_verification(invitation.otp_type):
        raise ValidationError("OTP resend is not available for this invitation.", code="INV-400-OTP")
    if not invitation.is_valid():
        raise ValidationError("Invitation is no longer valid.", code="INV-410-EXPIRED")
    ...
```

**After**:
```python
def resend_activation_otp(*, invitation: InvitationToken, schema_name: str, sync_email: bool = False) -> None:
    # No otp_type / activation_otp_hash gate — resend always (re)generates an OTP.
    if not invitation.is_valid():
        raise ValidationError("Invitation is no longer valid.", code="INV-410-EXPIRED")
    now = timezone.now()
    if invitation.last_resent_at and (now - invitation.last_resent_at).total_seconds() < getattr(
        settings, "OTP_RESEND_COOLDOWN_SECONDS", 120
    ):
        raise ValidationError(
            {"detail": "Please wait before requesting another OTP."},
            code="INV-429-OTP-COOLDOWN",
        )
    invitation.last_resent_at = now
    _regenerate_and_dispatch_activation_otp(invitation=invitation, schema_name=schema_name, sync_email=sync_email)
    invitation.save(
        update_fields=[
            "activation_otp_hash",
            "activation_otp_expires_at",
            "activation_otp_attempts",
            "last_resent_at",
            "updated_at",
        ]
    )
```

Removing the guard means this code path is no longer skippable — every resend now leaves the invitation with a live `activation_otp_hash`, whether or not it had one before.

**Consequence**: after this resend, `activate_invitation()`'s gate (`if inv.activation_otp_hash:`, §3.4) now evaluates to "required" for that invitation, even though it didn't at creation time. The invitee must verify OTP on their next activation attempt, regardless of what the invitation looked like before the resend.

### 3.3.2 `resend_invitation()` (admin-facing "Reinvite selected users")

The "Reinvite selected users" admin action (`UserAdmin`/`InviteUserAdmin`, `admin.py:574, 1886`) calls `resend_invitation()` — **not** `resend_activation_otp()`. v2.0 of this spec incorrectly stated both resend surfaces funnel through the same function; they don't. `resend_invitation()` has its own independent, inline OTP-generation block, gated the same old way, that must be edited on its own or the admin "Reinvite" action will keep silently skipping OTP generation for `otp_type=none` invitations after this ships.

**Before** (`invitation_service.py:965-972`):
```python
otp_plain = None
if _otp_requires_verification(invitation.otp_type):
    otp_plain = _generate_otp()
    invitation.activation_otp_hash = _hash_otp(otp_plain)
    invitation.activation_otp_expires_at = now + timedelta(
        minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10)
    )
    invitation.activation_otp_attempts = 0
```

**After**:
```python
otp_plain = _generate_otp()
invitation.activation_otp_hash = _hash_otp(otp_plain)
invitation.activation_otp_expires_at = now + timedelta(
    minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10)
)
invitation.activation_otp_attempts = 0
```

This function's own dispatch logic (a few lines further down) already branches on `invitation.invite_channel`, not `otp_type` — it does not have the §3.3 channel-selection bug and does not need to move to the shared helper. Only its generation gate needs to become unconditional, matching §3.3.1. The rest of `resend_invitation()` (cooldown check, status checks, audit logging) is unchanged.

### 3.3.3 Resend flow, step by step

**Normal case (invitation already has an OTP, created after rollout, or a legacy invitation already upgraded by a prior resend), either entry point:**
1. Look up `InvitationToken` by `token`; `is_valid()` check (not expired/cancelled/activated) → `INV-410-EXPIRED` if invalid.
2. Cooldown check against `last_resent_at` vs the relevant cooldown setting → `INV-429-...-COOLDOWN` if too soon.
3. Generate a new 6-digit OTP, hash it, overwrite `activation_otp_hash`/`activation_otp_expires_at` (fresh `OTP_EXPIRY_MINUTES` window from now), reset `activation_otp_attempts=0`, stamp `last_resent_at=now`.
4. Redeliver on the invitation's **original `invite_channel`** — never switches channel (phone → `shorten_for_sms()` + SMS; email → full activation URL). The invitee's previous OTP is now dead, since its hash has been overwritten.

**Legacy invitation case (no `activation_otp_hash` yet, created before rollout, never resent):**
Same four steps run unchanged — nothing branches on "does this invitation already have an OTP." Step 3 populates `activation_otp_hash` **for the first time**. From that point on, `activate_invitation()`'s gate (§3.4) sees a populated hash and requires OTP verification — even though this same invitation didn't require it a moment before the resend.

**What never changes between the two cases, and between the two entry points**: cooldown enforcement, expiry window, attempt-reset, and channel selection (now uniformly keyed on `invite_channel` per §3.3) are identical regardless of whether this is the invitation's first-ever OTP or its fifth resend, or whether the invitee or an admin triggered it. There is no "is this a first-time legacy upgrade" special case anywhere — the unconditional generate/overwrite/redeliver logic handles both situations identically, which is what keeps this a small, low-risk change rather than a branchy one.

### 3.4 `activate_invitation()`

**Before**: branches into "OTP required" vs. "skip straight to password" based on `_otp_requires_verification(inv.otp_type)`.

**After**: branch on `if inv.activation_otp_hash:` instead — same two-way structure (verified-already / legacy-inline-otp_code / missing-otp-error), just keyed off token state instead of `otp_type`.

### 3.5 What does *not* change

- `CreateInvitationSerializer` (`otp_type` field, choices, default) — untouched.
- `InviteUserForm` (`otp_type` dropdown) — untouched.
- `import_configs.py` (`otp_type` CSV column, validation, sample rows) — untouched.
- `AuthService._get_login_2fa_setting()`, `admin_login_requires_otp()`, `apps/core/admin_otp.py` — untouched.
- `_otp_requires_verification(otp_type)` helper function itself — can remain in the codebase unused-by-onboarding (still potentially useful elsewhere), or be left as dead code for a later cleanup; not required to be deleted for this spec to be correct.

### 3.6 `apps/users/web_views.py` — `activate_account()` (added in v2.2)

The SSR activation page (`GET/POST /activate/?token=…`) independently decided whether to show the OTP step, using its own copy of the `otp_type` gate this spec removes from `invitation_service.py`. Left as-is, it silently defeats §3.1–§3.4: the service always generates an OTP, but the page skips straight to the password step because `otp_type` defaults to `none`. Three spots inside `activate_account()` need the same "token state, not `otp_type`" fix (§4):

**Before** (`requires_otp` / destination / channel derivation):
```python
otp_channel = inv.otp_type  # none | email | phone
requires_otp = (
    otp_channel in (InvitationToken.OtpType.EMAIL, InvitationToken.OtpType.PHONE)
    and not inv.otp_verified
    and not _otp_verified_in_session(request, token)
)
otp_destination = (
    inv.phone_number
    if otp_channel == InvitationToken.OtpType.PHONE
    else inv.email
)
otp_via_phone = otp_channel == InvitationToken.OtpType.PHONE
```

**After**:
```python
# Onboarding OTP is mandatory whenever the token has one configured
# (CR-003) — independent of otp_type, which only drives login 2FA.
requires_otp = (
    bool(inv.activation_otp_hash)
    and not inv.otp_verified
    and not _otp_verified_in_session(request, token)
)
otp_via_phone = inv.invite_channel == InvitationToken.InviteChannel.PHONE
otp_destination = inv.phone_number if otp_via_phone else inv.email
```

`otp_destination`/`otp_via_phone` move from `otp_type` to `invite_channel` for the same reason as §3.3: `invite_channel` is what actually determines where the OTP was delivered, and a phone-channel invitation with `otp_type=none` (now the common case) would otherwise mis-display an email destination.

**Resend step** (`step == "resend_otp"`): the pre-check `if otp_channel not in (EMAIL, PHONE): return "OTP is not enabled for this invitation."` is deleted outright. It's not replaced by an `activation_otp_hash` check because `resend_activation_otp()` (§3.3.1) no longer has a "not available" failure mode to guard against — resend is unconditional, so gating the page in front of it is redundant and (for `otp_type=none` invitations) actively wrong.

**Step-2 re-check** (defense against a direct POST that skips step 1):

**Before**:
```python
if (
    otp_channel in (InvitationToken.OtpType.EMAIL, InvitationToken.OtpType.PHONE)
    and not inv.otp_verified
    and not _otp_verified_in_session(request, token)
):
```

**After**:
```python
if (
    inv.activation_otp_hash
    and not inv.otp_verified
    and not _otp_verified_in_session(request, token)
):
```

No other part of `web_views.py` reads `otp_type`; `otp_channel` is removed as a local entirely once these three call sites are updated.

---

## 4. The gate: token state, not `otp_type`

The core design decision is that onboarding-OTP-required is now determined by **"does this `InvitationToken` have an activation OTP configured"** (`activation_otp_hash` populated), not by `otp_type`. This single change achieves two things at once:

1. Makes onboarding OTP unconditional for all new invitations, since `_create_token_and_dispatch()` now always populates the hash.
2. Provides backward compatibility for free (see §5) — no date cutoff, no new column, no flag needed.

---

## 5. Backward compatibility

Pending `InvitationToken` rows created **before** this ships never had `activation_otp_hash` populated (old conditional logic only set it when `otp_type != none`, which was most invitations' default). After this ships:
- Those pre-existing pending rows still have `activation_otp_hash=""` — the new gate (`if inv.activation_otp_hash:`) correctly evaluates to "OTP not required" for them, so they activate exactly as before **if the invitee activates without ever triggering a resend**.
- Invitations **created after deploy** always require OTP from the start.
- Invitations **created before deploy** stay OTP-free **unless someone resends them** (admin clicking "Reinvite," or the invitee requesting a fresh code) — per §3.3, resend is unconditional and will generate an OTP for the first time on a legacy invitation, upgrading it to OTP-required from that point forward. This is a deliberate, explicit exception to "no retroactive change": legacy invitations are grandfathered only until the next resend touches them.

No migration, no backfill, no date-based special-casing required — the existing empty state of `activation_otp_hash` on old rows is itself the marker, and it naturally clears the moment a resend happens.

---

## 6. Test scenarios to add (E2E)

Target: `09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md`

1. **Email invite → mandatory OTP**: admin invites via email (any `otp_type` value, including `none`); invitee cannot reach password-set without first verifying OTP.
2. **Phone invite → mandatory OTP**: same, via SMS OTP.
3. **`otp_type=none` invitation still requires onboarding OTP**: confirms the decoupling — `otp_type` no longer controls onboarding OTP at all.
4. **Login 2FA regression**: create invitations with each `otp_type` value; confirm `AuthService._get_login_2fa_setting()` behavior for the resulting users is byte-for-byte identical to pre-CR-003 behavior. This is the key regression check proving true decoupling.
5. **Legacy pending invitations, no resend**: an invitation created before this ships, never resent, still activates without an OTP step.
6. **Legacy pending invitation, then resent (invitee-facing)**: resend via `resend_activation_otp()` generates a fresh OTP for an invitation that didn't have one; the invitee must now verify OTP to activate — confirms the upgrade-on-resend behavior.
7. **Legacy pending invitation, then reinvited by admin**: admin "Reinvite selected users" action on an `otp_type=none` invitation (via `resend_invitation()`) also generates a fresh OTP going forward — confirms §3.3.2's fix, i.e. that the admin path is not silently exempt from mandatory OTP.
8. **Phone-channel, `otp_type=none` invitation, resent (either entry point)**: OTP is delivered via SMS to `invitation.phone_number`, not misrouted to an email dispatch attempt — regression check for the §3.3 channel-selection fix (delivery keyed on `invite_channel`, not `otp_type`).
9. **Cooldown still applies on legacy resend**: the relevant cooldown setting is still enforced even on the first-ever resend of a legacy invitation, on both entry points (no special exemption for the "first" resend).
10. **Django admin, API, bulk CSV import**: all three remain visually/functionally identical (no field removed, no dropdown removed, no CSV column removed) — this is a "nothing changed here" regression check, not a new-behavior check.
11. **SSR activation page (`/activate/?token=…`), `otp_type=none` invitation**: `GET` shows the OTP step (not the password step) for any invitation with `activation_otp_hash` populated, regardless of `otp_type` — regression check for §3.6.
12. **SSR activation page, phone-channel invitation**: OTP destination shown on the page is the invitation's phone number, and `otp_via_phone` is true, keyed off `invite_channel` — regression check for §3.6's channel-selection fix, mirroring scenario 8 for the web layer.

---

## 7. Decision: resend upgrades legacy invitations to mandatory OTP

**Resolved**: resend on a legacy invitation (no `activation_otp_hash`) generates one and requires it going forward — see §3.3. This was chosen over "leave legacy invitations OTP-free forever," accepting that it is a real behavior change for any in-flight invitation an admin resends after this ships. Product/QA should be aware: **the safest legacy invitations from a security standpoint are ones nobody resends** — but any admin action to reinvite/resend after rollout closes that gap immediately for that invitation.

---

## 8. Explicitly not covered by this spec

- `otp_type` field itself, on any surface (API, admin, CSV) — zero changes.
- Login 2FA (`AuthService._get_login_2fa_setting()`, `admin_login_requires_otp()`, `apps/core/admin_otp.py`) — no changes, no new behavior, not touched.
- Driver/Helper invitation (they aren't invited through this subsystem at all — see `STAFF_INVITATION_FORBIDDEN_ROLE_CODES`).

---

## 9. Rollout

Two-file change, both under `apps/users/`:
- `invitation_service.py`, touching four functions: `_create_token_and_dispatch()` (§3.1), `verify_invitation_otp()` (§3.2), `resend_activation_otp()` and `resend_invitation()` (§3.3.1–3.3.2, both routed through the new §3.3 shared helper), and `activate_invitation()` (§3.4).
- `web_views.py`, touching `activate_account()`'s three `otp_type`-derived call sites (§3.6) — required for the mandatory OTP step to actually surface on the SSR activation page; without it, the service-layer change is invisible to invitees.

No coordination needed across multiple entry points at the API/admin/CSV layer (unlike earlier drafts of this spec) since those surfaces are untouched.

**Status**: implemented and unit-tested (`tests/unit/test_users/test_invitation_service.py`, `tests/unit/test_users/test_invitation_shortlink_wiring.py`); §6 E2E scenarios 1–12 still to be added to `09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md`.

---

**Last Updated**: 2026-08-06
**Version**: 2.2
