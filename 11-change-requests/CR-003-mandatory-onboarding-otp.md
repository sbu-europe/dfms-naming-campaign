# Change Request: Mandatory onboarding OTP

**CR Number**: CR-003
**To**: DFMS Product Context Team
**From**: Backend / Product implementation (Nourish)
**Date**: 2026-08-06
**Priority**: High
**Category**: Business / Technical
**Status**: 📝 Draft

---

## 📋 Executive Summary

Today, the one-time OTP verification step during invitation activation (click link → verify OTP → set password) is **optional**, gated by `InvitationToken.otp_type` (`none`/`email`/`phone`) — a field the tenant admin sets per invitation. This CR makes that onboarding OTP step **mandatory for every invitation**, delivered on whichever channel (`email`/`phone`) the invitation used — **without touching `otp_type` at all**.

**Why `otp_type` is left alone**: `otp_type` is also the data source for the existing, separate login-2FA mechanism (`AuthService._get_login_2fa_setting()`). If onboarding OTP were made mandatory by forcing `otp_type` to always be `email`/`phone` (never `none`), every newly-onboarded user would automatically get login 2FA turned on too, as an unintended side effect — because both features would be reading the same field. Login 2FA must remain unaffected by this CR, and `none` must remain a reachable value for it. The fix is to **decouple the two mechanisms**: onboarding OTP becomes unconditionally required by the activation flow itself, independent of whatever value `otp_type` holds; `otp_type` keeps functioning exactly as it does today for login 2FA, completely untouched.

**Impact**: Every invitee must verify an OTP before setting a password, regardless of channel. `otp_type`, the invite form, the API contract, and the bulk-import CSV column are **all unchanged** — this is a smaller, more contained change than earlier drafts of this CR proposed.

**Status note**: Not yet implemented in `nourish-backend`. This CR documents the agreed design ahead of implementation.

---

## 🎯 Purpose

**Background**: `05-modules/03-users/staff-invite-login-password-channels.md` (CR-002) documents `otp_type` as the field controlling onboarding OTP. It is also, separately and pre-existing, the field `AuthService._get_login_2fa_setting()` reads for login 2FA.

**Problem Statement**: Onboarding OTP is easy to skip (any invitation with `otp_type=none`, including via bulk CSV import), weakening identity verification at activation. An earlier draft of this CR attempted to fix this by deriving `otp_type` from `invite_channel` and removing `none` as a reachable value — but `otp_type` is shared with login 2FA, so that approach would have silently made login 2FA mandatory for every new user as an unintended side effect, which is out of scope and unacceptable.

---

## 🔍 Current State (before this CR)

- `InvitationToken.otp_type` — admin-settable input (API, Django admin `InviteUserForm`, bulk CSV import), defaults to `none`. Read by:
  1. **Onboarding**: `_create_token_and_dispatch()` only generates an activation OTP `if _otp_requires_verification(otp_type)`; `verify_invitation_otp()` and `activate_invitation()` only require OTP verification under the same condition.
  2. **Login 2FA** (separate, pre-existing, unaffected by this CR): `AuthService._get_login_2fa_setting()` reads the same field.
- Because both features key off one field, an admin's `otp_type` choice today simultaneously decides "does this invitee need to verify OTP at signup" **and** "will this user be challenged for OTP on every future login."

**Affected Documents** (to be updated once implemented):
- `05-modules/03-users/staff-invite-login-password-channels.md` — invite §2.1 OTP-type table (clarify onboarding OTP is now unconditional; §3.3 login 2FA unchanged)
- `03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-005-user-invitation-activation.md` — OTP requirement scope
- `09-testing/backend/e2e-scenarios/users/user-invitation-activation-e2e-scenarios.md` — add mandatory-onboarding-OTP scenarios

---

## 📝 Proposed Changes (design agreed, not yet implemented)

### Change 1: Onboarding OTP becomes unconditional, decoupled from `otp_type`

**File**: `nourish-backend/apps/users/invitation_service.py`

**Description**: Onboarding OTP generation and verification are no longer gated by `_otp_requires_verification(otp_type)`. Every invitation gets an activation OTP generated and delivered on its `invite_channel`, regardless of what `otp_type` is set to.

**Rationale**: Achieves "every invitee verifies OTP before setting a password" without reading or depending on `otp_type` in any way — so login 2FA, which reads that same field for an unrelated purpose, is genuinely unaffected, not just untouched in name.

**Details**:
- `_create_token_and_dispatch()`: always generate `activation_otp_hash`/`activation_otp_expires_at`/`activation_otp_attempts=0` for every new `InvitationToken`, regardless of the `otp_type` value passed through (that value continues to be stored on the row exactly as today, purely for login 2FA's later use — this function does not change what it stores there, only stops using it to decide whether to generate an activation OTP).
- Delivery channel for the activation OTP is `invite_channel` (email vs SMS), which the dispatch code already branches on — no change needed to the email/SMS dispatch functions themselves, since they already accept `activation_otp=otp_plain` and will now simply always receive a non-`None` value.
- `verify_invitation_otp()`: remove the `_otp_requires_verification(inv.otp_type)` gate. Replace with a check on **whether this token actually has an activation OTP configured** — `if not inv.activation_otp_hash: ...` — which doubles as the backward-compatibility mechanism (see Backward Compatibility below).
- `resend_activation_otp()`: remove its gate entirely — resend **always** (re)generates an OTP, regardless of prior state. This means a legacy invitation (created before this ships, no `activation_otp_hash`) gets upgraded to requiring OTP the moment it is resent, even though it didn't require OTP at creation. This is a deliberate, agreed exception to "no retroactive change" — legacy invitations stay OTP-free only until the next resend touches them.
- `activate_invitation()`: remove the "otp not required → skip straight to password" branch entirely for tokens that have `activation_otp_hash` set; tokens without one (never resent legacy invitations) keep working exactly as before.
- **`otp_type` itself: zero changes.** Serializer, Django admin `InviteUserForm`, and bulk CSV import (`apps/users/import_configs.py`) are **not modified** — the field keeps its current input, defaults, and validation, and keeps driving login 2FA exactly as it does today.

**How resend behaves (both entry points — invitee "Resend code" and admin "Reinvite")**:
1. Validate invitation is still `is_valid()` (not expired/cancelled/activated).
2. Enforce cooldown (`OTP_RESEND_COOLDOWN_SECONDS`, 120s default) since the last resend.
3. Generate a fresh OTP, overwrite `activation_otp_hash`/`activation_otp_expires_at`, reset `activation_otp_attempts=0`, stamp `last_resent_at`.
4. Redeliver on the invitation's original `invite_channel` — never switches channel.

This sequence runs identically whether the invitation already had an OTP or not — there is no special case for "first time this invitation gets an OTP." That's precisely what makes a legacy invitation (created pre-rollout, no `activation_otp_hash`) get upgraded to OTP-required the moment anyone resends it: step 3 populates the hash for the first time, and from then on `activate_invitation()` requires it.

---

## 📊 Summary of Changes

| File | Change Type | Description |
|------|-------------|-------------|
| `nourish-backend/apps/users/invitation_service.py` | **UPDATE** | Onboarding OTP generation/verification made unconditional; gate switches from `otp_type` to "does this token have an activation OTP configured" |
| `nourish-backend/apps/users/invitation_serializers.py` | **NOT TOUCHED** | `otp_type` field unchanged |
| `nourish-backend/apps/users/admin.py` | **NOT TOUCHED** | `InviteUserForm.otp_type` dropdown unchanged |
| `nourish-backend/apps/users/import_configs.py` | **NOT TOUCHED** | `otp_type` CSV column unchanged |
| `nourish-backend/apps/users/services.py` | **NOT TOUCHED** | Login 2FA out of scope, unaffected — including its continued reliance on `otp_type` |
| `nourish-backend/apps/core/admin_otp.py` | **NOT TOUCHED** | Login 2FA out of scope |
| `05-modules/03-users/staff-invite-login-password-channels.md` | **UPDATE (pending)** | Clarify onboarding OTP is unconditional; §3.3 login 2FA section unchanged |

---

## ✅ Benefits

1. **Consistent onboarding verification**: every invited user, on any channel, verifies OTP before setting a password.
2. **True decoupling, not just documentation**: login 2FA is unaffected in actual data flow, not just untouched in the diff — it keeps reading `otp_type` exactly as before, with `none` still fully reachable.
3. **Smaller, safer change**: touches one file (`invitation_service.py`) instead of the serializer/admin/import surfaces — less code to review, no admin UX change, no CSV template change.
4. **Backward compatible by construction**: gating onboarding OTP on "does this token have an activation OTP configured" (rather than a date cutoff or new flag) means pre-rollout pending invitations — which never had an activation OTP generated — continue activating exactly as before, with no special-casing required.

---

## 🔄 Impact Assessment

### Breaking Changes
- **Onboarding only**: every *newly created* invitation now requires OTP verification before password-set, regardless of `otp_type`.
- **No login impact**: login 2FA behavior, for any user, is unchanged — `otp_type` keeps meaning exactly what it means today for that mechanism.

### Backward Compatibility
- Existing **pending** `InvitationToken` rows created before this ships have no `activation_otp_hash` set (under the old conditional logic) — they continue to activate without an OTP step **as long as they are never resent**. No retroactive re-issuance, no broken in-flight invitations, for invitations left untouched.
- **Exception**: resending a legacy invitation (admin "Reinvite," or an invitee-triggered resend) generates an OTP for the first time and upgrades that invitation to OTP-required from that point on — a deliberate, agreed behavior change, not an oversight. Any legacy invitation an admin resends after rollout immediately requires OTP.
- `otp_type`, the invite form, the API contract, and CSV templates are unchanged — no client-facing breaking change on any of those surfaces.

### Implementation Repos Impact
- `nourish-backend`: `apps/users/invitation_service.py` only.
- No changes to `invitation_serializers.py`, `admin.py`, `import_configs.py`, `services.py`, or `apps/core/admin_otp.py`.
- No mobile/frontend contract changes.

---

## 📅 Timeline

**Requested Completion**: TBD.

**Proposed Schedule**:
- Ship the `invitation_service.py` change as a single, self-contained PR.
- Review: confirm the "has `activation_otp_hash`" gate correctly distinguishes pre-rollout vs post-rollout tokens in a full regression pass against pending invitations created before deploy.

---

## 👥 Reviewers Needed

- Backend engineering (nourish-backend)

---

## 📝 Approval

**Status**: 📝 Draft
**Approved By**: _________________
**Date**: _________________
**Comments**: _________________

---

## 🔗 Related Documents

- [CR-002](./CR-002-staff-phone-invite-login-password.md) — establishes the email/phone invite-channel model this CR builds on
- [staff-invite-login-password-channels.md](../05-modules/03-users/staff-invite-login-password-channels.md)
- [mandatory-onboarding-otp.md](../05-modules/03-users/mandatory-onboarding-otp.md) — module spec
- US-005 (User invitation & activation)

---

**Last Updated**: 2026-08-06
**Version**: 3.0
