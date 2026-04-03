---
task_id: CP-06
title: OTP Channel Configuration — Email or SMS per User
epic: Client Portal
sprint: Sprint 2 — Master Data, User Management & POI
type: Story
priority: High
status: Backlog
story_points: 5
assignee: ~
origin: Sprint 1 Demo Feedback
feedback_ref: FB-005
related_stories:
  - CP-03-2fa-email-otp-login.md
  - US-002-multi-factor-auth.md
---

# CP-06 — OTP Channel Configuration — Email or SMS per User

## Origin

Raised as client feedback during the Sprint 1 demo. See [FB-005](FEEDBACK.md#fb-005--otp-channel-configurable-email-or-phone-otp-per-user).

---

## User Story

**As a** Tenant Admin  
**I want** to configure whether each user receives their OTP via email or SMS  
**So that** users who don't have reliable email access during work hours can authenticate via their mobile phone instead

---

## Description

Currently OTP is always dispatched by email. This is insufficient for operational users (gate operators, warehouse staff, drivers) who may be on the floor without easy email access but always have their mobile phone.

The Tenant Admin should be able to assign an OTP delivery channel (`email` or `sms`) to each user. The OTP generation, verification, and expiry logic remains the same — only the delivery mechanism changes.

The SMS gateway provider (e.g. Twilio, AWS SNS) must be abstracted behind a `NotificationChannel` interface so the provider can be swapped in future without touching OTP business logic.

---

## Acceptance Criteria

### Must Have
- [ ] `User` model has an `otp_channel` field — choices: `email` (default), `sms`
- [ ] Tenant Admin can set `otp_channel` per user from the invite form and the user edit form
- [ ] At login time, system reads `user.otp_channel` and routes the OTP dispatch accordingly:
  - `email` → existing `send_otp_notification` Celery task (no change)
  - `sms` → new `send_otp_sms` Celery task via configured SMS gateway
- [ ] OTP verification endpoint, TTL (10 min), resend cooldown (60s), and lockout logic are unchanged regardless of channel
- [ ] If SMS delivery fails, system falls back to email, logs the failure, and notifies the user on the OTP page ("Sent to your email instead — SMS delivery failed")

### Should Have
- [ ] Tenant Admin cannot change their own `otp_channel` (requires Super Admin approval — security constraint)
- [ ] SMS gateway is configured via environment variables (`SMS_PROVIDER`, `SMS_API_KEY`, `SMS_SENDER_ID`)
- [ ] Tenant Admin can see each user's current OTP channel in the user list view

### Nice to Have
- [ ] Per-tenant default OTP channel (if Tenant Admin doesn't set per-user, falls back to tenant default)
- [ ] OTP delivery confirmation status shown in audit logs (delivered / failed)

---

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| CP-06-1 | Add `otp_channel` field to `User` model — `CharField(choices=[('email','Email'),('sms','SMS')], default='email')` | Pending |
| CP-06-2 | Create and run migration for `otp_channel` field | Pending |
| CP-06-3 | Add `otp_channel` selector to the user invite form (CP-04) and user edit form in the tenant portal | Pending |
| CP-06-4 | Refactor `_send_otp()` in `apps/users/services.py` — after generating OTP, check `user.otp_channel` and call the appropriate Celery task | Pending |
| CP-06-5 | Create `send_otp_sms` Celery task in `apps/notifications/tasks.py` — accept `user_id`, `otp_code`, `schema_name`; wrap user lookup in `schema_context`; call SMS gateway client | Pending |
| CP-06-6 | Create `apps/notifications/sms.py` — `SMSClient` abstraction with `send(phone_number, message)` method; implement Twilio (or configured provider) backend | Pending |
| CP-06-7 | Add SMS gateway env vars to `.env.example`: `SMS_PROVIDER`, `SMS_API_KEY`, `SMS_FROM_NUMBER` | Pending |
| CP-06-8 | Implement SMS → email fallback: catch delivery exception in `send_otp_sms`, log failure, dispatch `send_otp_notification` (email) instead | Pending |
| CP-06-9 | Show fallback message on OTP page: "We couldn't reach your phone. A code has been sent to your email instead." | Pending |
| CP-06-10 | Add `otp_channel` column to user list view in tenant portal (icon: envelope / phone) | Pending |
| CP-06-11 | Write unit tests: `otp_channel=email` → email task called; `otp_channel=sms` → SMS task called; SMS failure → email fallback | Pending |

---

## Technical Details

### Dispatch Routing

```python
# apps/users/services.py — _send_otp()

if user.otp_channel == 'sms':
    send_otp_sms.delay(user.id, otp_code, schema_name=connection.schema_name)
else:
    send_otp_notification.delay(user.id, otp_code, schema_name=connection.schema_name)
```

### SMS Client Abstraction

```python
# apps/notifications/sms.py

class SMSClient:
    def send(self, phone_number: str, message: str) -> bool:
        """Returns True on success, raises SMSDeliveryError on failure."""
        ...

class TwilioSMSClient(SMSClient):
    ...
```

### OTP Message Format

```
Your DFMS verification code is: 748291
This code expires in 10 minutes. Do not share it with anyone.
```

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SMS_PROVIDER` | Gateway name | `twilio` |
| `SMS_API_KEY` | API key / auth token | `ACxxxxxxxx` |
| `SMS_API_SECRET` | Auth secret (Twilio) | `your_auth_token` |
| `SMS_FROM_NUMBER` | Sender number (E.164) | `+8801XXXXXXXXX` |

---

## Definition of Done

- User with `otp_channel=email` → OTP delivered by email (existing behaviour unchanged)
- User with `otp_channel=sms` → OTP delivered by SMS within 30 seconds
- SMS failure → OTP delivered by email; failure logged; user sees fallback message on OTP page
- Tenant Admin sets `otp_channel` per user from invite and edit forms
- All OTP verification, TTL, resend, and lockout behaviour is identical regardless of channel
