---
story: CP-03
story_title: 2FA — Email OTP (3-Step Secure Login for Tenant Admin)
jira_key: DFS-014
sprint: "Sprint 1"
feedback_date: 2026-03-31
recorded_by: Development Team
status: Open
---

# Feedback: CP-03 — 2FA Email OTP Login

## FB-004 — OTP: Trusted Device — Skip OTP on Known Browser

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Priority** | High |
| **Status** | Open |

Requiring OTP on every login is disruptive for users who log in multiple times a day from the same device. OTP should only be triggered for a **new device or new browser** — once a device is trusted, subsequent logins from that browser should skip the OTP step.

**Expected Behaviour:**
- On successful OTP verification, set a long-lived `dfms_trusted_device` cookie (30-day TTL) containing a signed device token
- On subsequent logins from the same browser: if the cookie is valid and the device token exists in Redis → skip OTP, create session directly
- If the cookie is absent, expired, or the token has been revoked → require OTP as normal
- Users can view and revoke trusted devices from their account settings

**Acceptance Criteria Added:**
- [ ] After successful OTP, set `dfms_trusted_device=<signed_token>` cookie with 30-day max-age
- [ ] On login: check for trusted device cookie before deciding whether to trigger OTP
- [ ] Valid trusted device cookie → skip OTP, log in directly
- [ ] Invalid / missing / revoked cookie → trigger OTP as normal
- [ ] Trusted device tokens stored in Redis with 30-day TTL (key: `trusted_device:<user_id>:<token>`)
- [ ] User can view all trusted devices and revoke individual ones from account settings

> Also affects [PAP-03 — Platform Admin 2FA OTP](../platform-admin-portal/PAP-03-platform-admin-2fa-otp.md).
> See `DECISIONS.md` — "Trusted Device Cookie for OTP Skip" for rationale and trade-offs.

---

## FB-005 — OTP Channel: Configurable Email or Phone OTP per User

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Priority** | High |
| **Status** | Open |

Currently, OTP is always sent by email. The client requires the ability to configure, per user, whether the OTP is delivered by **email** or **phone (SMS)**. The Tenant Admin should be able to set the OTP channel for each user through the user management interface.

**Expected Behaviour:**
- `User` model gains an `otp_channel` field: `email` (default) or `sms`
- Tenant Admin can set `otp_channel` per user when inviting or editing a user
- At login time, the system reads `user.otp_channel` and dispatches the OTP to the correct channel:
  - `email` → existing `send_otp_notification` Celery task
  - `sms` → new `send_otp_sms` Celery task via SMS gateway (e.g. Twilio / AWS SNS)
- OTP format, TTL, and verification logic remain identical regardless of channel

**Acceptance Criteria Added:**
- [ ] `User` model has `otp_channel` field (`email` | `sms`), default `email`
- [ ] Tenant Admin can set `otp_channel` per user in the invite form and user edit form
- [ ] On login, system routes OTP dispatch based on `user.otp_channel`
- [ ] SMS OTP is dispatched via a Celery task wrapping the configured SMS gateway
- [ ] If SMS delivery fails, system falls back to email and logs the failure
- [ ] OTP verification flow is identical regardless of channel (same endpoint, same Redis key pattern)
- [ ] Tenant Admin cannot change their own OTP channel (security constraint — requires Super Admin approval)

> Also affects CP-06 (OTP Channel Configuration — new story, not yet scoped in sprint). SMS gateway provider to be confirmed with client. Implementation should abstract the provider behind a `NotificationChannel` interface.
> See `DECISIONS.md` — "OTP Channel Abstraction" for trade-offs.

---

## Action Items

| # | Action | Description | Jira Sub-task | Source | Priority | Status |
|---|--------|-------------|---------------|--------|----------|--------|
| FB-004 | Trusted device cookie — skip OTP on known browser | Set 30-day signed cookie post-OTP; check on subsequent logins; allow revocation | DFS-014-10 | Client | High | Open |
| FB-005 | Configurable OTP channel per user (email \| SMS) | Add `otp_channel` field to User; route OTP dispatch at login based on user preference | DFS-014-11 | Client | High | Open |

---

## Notes

- FB-004 also applies to [PAP-03](../platform-admin-portal/PAP-03-platform-admin-2fa-otp.md) (Super Admin login) — the same trusted device mechanism should be used on both portals
- FB-005 introduces a dependency on an SMS gateway — provider selection must be confirmed before implementation begins
- Both items are new scope beyond the original CP-03 story and should be tracked as separate Jira sub-tasks / linked stories
