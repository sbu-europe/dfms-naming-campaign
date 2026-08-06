---
module: 03-users
specification: Mandatory onboarding OTP — invitation module spec
version: 2.0
phase: Phase 1
status: Draft — pre-implementation spec (not yet built)
last_updated: 2026-08-06
related_stories: US-005
related_cr: CR-003
implementation_reference:
  - nourish-backend/apps/users/invitation_service.py
---

# Mandatory onboarding OTP — module spec

> **Purpose**: Implementation spec for [CR-003](../../11-change-requests/CR-003-mandatory-onboarding-otp.md), written **before** the code change so engineering has a concrete contract to build against and product/QA have a concrete contract to verify against.
>
> **Scope**: Onboarding OTP during user invitation/activation only, made **unconditional** — independent of `otp_type`. **`otp_type` and login 2FA are out of scope and are not modified.** `AuthService._get_login_2fa_setting()`, `admin_login_requires_otp()`, `apps/core/admin_otp.py`, the `CreateInvitationSerializer.otp_type` field, `InviteUserForm.otp_type`, and the bulk-import `otp_type` CSV column are all **untouched** by this spec.

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
| Entry points touched | — | **Only `invitation_service.py`.** API serializer, Django admin form, bulk CSV import are not modified |
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

### 3.3 `resend_activation_otp()`

**Decision**: resend becomes unconditional too — it generates a fresh OTP regardless of whether the invitation had one before. This means a legacy invitation (created pre-rollout, never had `activation_otp_hash`) gets **upgraded** to requiring OTP the moment someone resends it, even though it didn't require OTP at creation.

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
    ...
```

The rest of the function is unchanged — it already generates a fresh OTP, overwrites `activation_otp_hash`/`activation_otp_expires_at`, resets `activation_otp_attempts=0`, and redelivers on `invitation.invite_channel`. Removing the guard simply means this code path is no longer skippable — every resend now leaves the invitation with a live `activation_otp_hash`, whether or not it had one before.

**Consequence**: after this resend, `activate_invitation()`'s gate (`if inv.activation_otp_hash:`, §3.4) now evaluates to "required" for that invitation, even though it didn't at creation time. The invitee must verify OTP on their next activation attempt, regardless of what the invitation looked like before the resend.

### 3.3.1 Resend flow, step by step

Two entry points call `resend_activation_otp()`:
- **Invitee-facing**: `POST /api/v1/users/invitations/{token}/otp/resend/` → `InvitationActivationOtpResendView` (invitee clicks "Resend code" on the activation page).
- **Admin-facing**: the "Reinvite selected users" admin action (`UserAdmin`/`InviteUserAdmin`, `admin.py:574, 1886`) → `resend_invitation()`, which can also trigger a fresh OTP.

**Normal case (invitation already has an OTP, created after rollout, or a legacy invitation already upgraded by a prior resend):**
1. Look up `InvitationToken` by `token`; `is_valid()` check (not expired/cancelled/activated) → `INV-410-EXPIRED` if invalid.
2. Cooldown check against `last_resent_at` vs `OTP_RESEND_COOLDOWN_SECONDS` (120s default) → `INV-429-OTP-COOLDOWN` if too soon.
3. Generate a new 6-digit OTP, hash it, overwrite `activation_otp_hash`/`activation_otp_expires_at` (fresh `OTP_EXPIRY_MINUTES` window from now), reset `activation_otp_attempts=0`, stamp `last_resent_at=now`.
4. Redeliver on the invitation's **original `invite_channel`** — never switches channel (phone → `shorten_for_sms()` + SMS; email → full activation URL). The invitee's previous OTP is now dead, since its hash has been overwritten.

**Legacy invitation case (no `activation_otp_hash` yet, created before rollout, never resent):**
Same four steps run unchanged — nothing in the function branches on "does this invitation already have an OTP." Step 3 populates `activation_otp_hash` **for the first time**. From that point on, `activate_invitation()`'s gate (§3.4) sees a populated hash and requires OTP verification — even though this same invitation didn't require it a moment before the resend.

**What never changes between the two cases**: cooldown enforcement, expiry window, attempt-reset, and channel selection are identical regardless of whether this is the invitation's first-ever OTP or its fifth resend. There is no "is this a first-time legacy upgrade" special case anywhere in the function — the unconditional generate/overwrite/redeliver logic handles both situations identically, which is what makes this a small, low-risk change rather than a branchy one.

### 3.4 `activate_invitation()`

**Before**: branches into "OTP required" vs. "skip straight to password" based on `_otp_requires_verification(inv.otp_type)`.

**After**: branch on `if inv.activation_otp_hash:` instead — same two-way structure (verified-already / legacy-inline-otp_code / missing-otp-error), just keyed off token state instead of `otp_type`.

### 3.5 What does *not* change

- `CreateInvitationSerializer` (`otp_type` field, choices, default) — untouched.
- `InviteUserForm` (`otp_type` dropdown) — untouched.
- `import_configs.py` (`otp_type` CSV column, validation, sample rows) — untouched.
- `AuthService._get_login_2fa_setting()`, `admin_login_requires_otp()`, `apps/core/admin_otp.py` — untouched.
- `_otp_requires_verification(otp_type)` helper function itself — can remain in the codebase unused-by-onboarding (still potentially useful elsewhere), or be left as dead code for a later cleanup; not required to be deleted for this spec to be correct.

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
6. **Legacy pending invitation, then resent**: resend generates a fresh OTP for an invitation that didn't have one; the invitee must now verify OTP to activate — confirms the upgrade-on-resend behavior.
7. **Cooldown still applies on legacy resend**: `OTP_RESEND_COOLDOWN_SECONDS` is still enforced even on the first-ever resend of a legacy invitation (no special exemption for the "first" resend).
8. **Django admin, API, bulk CSV import**: all three remain visually/functionally identical (no field removed, no dropdown removed, no CSV column removed) — this is a "nothing changed here" regression check, not a new-behavior check.

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

Single self-contained change to `apps/users/invitation_service.py`. No coordination needed across multiple entry points (unlike earlier drafts of this spec) since the serializer/admin/import surfaces are untouched.

---

**Last Updated**: 2026-08-06
**Version**: 2.0
