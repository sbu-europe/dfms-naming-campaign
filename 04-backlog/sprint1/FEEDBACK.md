---
source: Sprint 1 Demo
date: 2026-03-31
recorded_by: Development Team
status: Open — queued for Sprint 2 refinement
---

# Sprint 1 Demo — Feedback Log

All feedback items below were raised during or immediately after the Sprint 1 demo. Each item is linked to the affected task file and tagged with its source (Internal / Client).

---

## FB-001 — Invitation URL: Email Pre-filled and Non-Editable

| Field | Value |
|-------|-------|
| **Source** | Internal |
| **Raised by** | DFMS Team |
| **Affects** | [CP-04 — Account Activation & Invitation](CP-04-account-activation-invitation.md) |
| **Priority** | High |
| **Status** | Open |

### Feedback

When a Tenant Admin sends an invitation, the email included in the activation URL should be pre-filled **and locked** (non-editable) on the set-password page. Currently the email field is pre-populated via `?email=` query param but the user can modify it before submitting.

### Expected Behaviour

- Activation link: `https://<tenant>.dfms.app/activate/?token=<token>&email=<addr>`
- Email field on the activation page is read-only — rendered as plain text or a `disabled` input
- Form submission uses the email embedded in the token (server-side), not the value from the input — prevents tampering even if HTML is manipulated

### Acceptance Criteria Added to CP-04

- [ ] Email field on the activation page is displayed as read-only (non-editable)
- [ ] Server validates email against the token record, not the submitted form value
- [ ] Attempting to submit a modified email returns a 400 error

---

## FB-002 — Platform Admin: Resend Invitation Email

| Field | Value |
|-------|-------|
| **Source** | Internal |
| **Raised by** | DFMS Team |
| **Affects** | [PAP-05 — Tenant Onboarding](PAP-05-tenant-onboarding.md) |
| **Priority** | High |
| **Status** | Open |

### Feedback

When the initial welcome email to a Tenant Admin fails to deliver (e.g. SMTP failure, email bounced) or the 72-hour temporary password window expires, the Platform Admin must be able to trigger a resend from the admin panel — without having to re-create the tenant.

### Expected Behaviour

- A "Resend Welcome Email" action appears on the Tenant list/detail view in the platform admin
- Clicking it generates a **new** 12-char temporary password, resets the 72-hour expiry clock, and re-dispatches the welcome email
- The old temporary password is immediately invalidated
- Action is logged to `public.audit_logs`

### Acceptance Criteria Added to PAP-05

- [ ] "Resend Welcome Email" action is available on the `TenantAdmin` list view
- [ ] Action generates a new temporary password (old one is invalidated)
- [ ] Expiry window resets to 72 hours from the time of resend
- [ ] Welcome email is dispatched via Celery (non-blocking)
- [ ] Action is audit-logged

---

## FB-003 — Session Timeout: Extend from 30 Minutes to 24 Hours

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Affects** | [INFRA-04 — Caching & Session Storage](INFRA-04-caching-session-storage.md) |
| **Priority** | Medium |
| **Status** | Open |

### Feedback

The current 30-minute session timeout is too short for operational users who work continuous shifts. Users are frequently logged out mid-task, disrupting workflows (gate operators, warehouse managers, etc.).

### Expected Behaviour

- `SESSION_COOKIE_AGE` changed from `1800` (30 min) to `86400` (24 hours)
- Session is refreshed on every authenticated request (sliding window)
- Applies to both tenant portal sessions and platform admin sessions

### Acceptance Criteria Added to INFRA-04

- [ ] `SESSION_COOKIE_AGE = 86400` (24 hours) set in `config/settings/base.py`
- [ ] `SESSION_SAVE_EVERY_REQUEST = True` to enable sliding window (session refreshes on activity)
- [ ] Session expiry is confirmed in testing: idle for 24 hours logs the user out; active use keeps session alive

---

## FB-004 — OTP: Trusted Device — Skip OTP on Known Browser

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Affects** | [CP-03 — 2FA Email OTP](CP-03-2fa-email-otp-login.md), [PAP-03 — Platform Admin 2FA OTP](PAP-03-platform-admin-2fa-otp.md) |
| **Priority** | High |
| **Status** | Open |

### Feedback

Requiring OTP on every login is disruptive for users who log in multiple times a day from the same device. OTP should only be triggered for a **new device or new browser** — once a device is trusted, subsequent logins from that browser should skip the OTP step.

### Expected Behaviour

- On successful OTP verification, set a long-lived `dfms_trusted_device` cookie (e.g. 30-day TTL) containing a signed device token
- On subsequent logins from the same browser: if the cookie is valid and the device token exists in Redis/DB → skip OTP, create session directly
- If the cookie is absent, expired, or the token has been revoked → require OTP as normal
- Users can view and revoke trusted devices from their account settings

### Acceptance Criteria Added to CP-03 / PAP-03

- [ ] After successful OTP, set `dfms_trusted_device=<signed_token>` cookie with 30-day max-age
- [ ] On login: check for trusted device cookie before deciding whether to trigger OTP
- [ ] Valid trusted device cookie → skip OTP, log in directly
- [ ] Invalid / missing / revoked cookie → trigger OTP as normal
- [ ] Trusted device tokens stored in Redis with 30-day TTL (key: `trusted_device:<user_id>:<token>`)
- [ ] User can view all trusted devices and revoke individual ones from account settings

### Decision Note

See `DECISIONS.md` — "Trusted Device Cookie for OTP Skip" for rationale and trade-offs.

---

## FB-005 — OTP Channel: Configurable Email or Phone OTP per User

| Field | Value |
|-------|-------|
| **Source** | Client (Nourish) |
| **Raised by** | Client team |
| **Affects** | [CP-03 — 2FA Email OTP](CP-03-2fa-email-otp-login.md), [CP-06 — OTP Channel Configuration](CP-06-otp-channel-configuration.md) |
| **Priority** | High |
| **Status** | Open |

### Feedback

Currently, OTP is always sent by email. The client requires the ability to configure, per user, whether the OTP is delivered by **email** or **phone (SMS)**. The Tenant Admin should be able to set the OTP channel for each user through the user management interface.

### Expected Behaviour

- `User` model gains an `otp_channel` field: `email` (default) or `sms`
- Tenant Admin can set `otp_channel` per user when inviting or editing a user
- At login time, the system reads `user.otp_channel` and dispatches the OTP to the correct channel:
  - `email` → existing `send_otp_notification` Celery task
  - `sms` → new `send_otp_sms` Celery task via SMS gateway (e.g. Twilio / AWS SNS)
- OTP format, TTL, and verification logic remain identical regardless of channel

### Acceptance Criteria Added to CP-03 / CP-06

- [ ] `User` model has `otp_channel` field (`email` | `sms`), default `email`
- [ ] Tenant Admin can set `otp_channel` per user in the invite form and user edit form
- [ ] On login, system routes OTP dispatch based on `user.otp_channel`
- [ ] SMS OTP is dispatched via a Celery task wrapping the configured SMS gateway
- [ ] If SMS delivery fails, system falls back to email and logs the failure
- [ ] OTP verification flow is identical regardless of channel (same endpoint, same Redis key pattern)
- [ ] Tenant Admin cannot change their own OTP channel (security constraint — requires Super Admin approval)

### Decision Note

SMS gateway provider to be confirmed with client. Implementation should abstract the provider behind a `NotificationChannel` interface so the gateway can be swapped without changing OTP logic. See `DECISIONS.md` — "OTP Channel Abstraction" for trade-offs.

---

## Summary

| # | Feedback | Source | Affects | Priority | Status |
|---|----------|--------|---------|----------|--------|
| FB-001 | Invitation email non-editable on activation page | Internal | CP-04 | High | Open |
| FB-002 | Platform admin resend welcome email action | Internal | PAP-05 | High | Open |
| FB-003 | Session timeout 30 min → 24 hours | Client | INFRA-04 | Medium | Open |
| FB-004 | OTP skip for trusted device / known browser | Client | CP-03, PAP-03 | High | Open |
| FB-005 | OTP channel configurable per user (email or SMS) | Client | CP-03, CP-06 | High | Open |
