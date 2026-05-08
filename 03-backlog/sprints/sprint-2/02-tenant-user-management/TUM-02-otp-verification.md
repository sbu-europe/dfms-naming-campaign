---
jira_key: DFS-025
jira_type: Story
jira_epic: DFS-029
jira_sprint: "Sprint 2"
story_id: US-006
title: OTP Verification System
epic: Tenant User Management
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-006-otp-verification.md
---

# TUM-02 — OTP Verification System

## User Story

**As a** System Administrator  
**I want to** verify user identity through OTP  
**So that** only legitimate users can access the system

## Business Context

OTP verification is critical for account activation, password reset, and two-factor authentication (2FA). This story extends the basic OTP already implemented in Sprint 1 (login 2FA) to cover all OTP-required flows systematically with a unified service.

## Acceptance Criteria

### AC-1: OTP Generation & Delivery
- [ ] 6-digit numeric OTP via email
- [ ] 6-digit numeric OTP via SMS
- [ ] OTP validity: 10 minutes
- [ ] Rate limiting: max 5 OTP requests per hour per user
- [ ] 2-minute cooldown before resend

### AC-2: OTP Verification
- [ ] Both email and SMS OTP required before account activation
- [ ] Maximum 3 verification attempts
- [ ] 15-minute lockout after 3 failed attempts
- [ ] OTP expiration countdown displayed on UI

### AC-3: OTP Logging & Audit
- [ ] All attempts logged: User ID, operation type, timestamp, IP, device ID, status
- [ ] Logs exportable for audit purposes

### AC-4: Extensibility
- [ ] OTP service used consistently across: account activation (US-005), password reset (US-008), 2FA login (Sprint 1)
- [ ] Voice OTP optional (future)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TUM-02-1 | Unified OTP service (generate, store hashed, validate, expire) | DFS-025-1 | Pending |
| TUM-02-2 | Email OTP delivery integration (email service) | DFS-025-2 | Pending |
| TUM-02-3 | SMS OTP delivery integration (SMS gateway) | DFS-025-3 | Pending |
| TUM-02-4 | Rate limiting (max 5/hour/user) + resend cooldown (2 min) | DFS-025-4 | Pending |
| TUM-02-5 | Attempt tracking — 3 max attempts, 15-min lockout on failure | DFS-025-5 | Pending |
| TUM-02-6 | OTP operation audit logging | DFS-025-6 | Pending |
| TUM-02-7 | OTP verification UI with countdown timer and resend button | DFS-025-7 | Pending |

## API Endpoints

```
POST   /api/v1/otp/send          # Generate and send OTP (email + SMS)
POST   /api/v1/otp/verify        # Verify OTP
POST   /api/v1/otp/resend        # Resend OTP (subject to cooldown)
```

## Dependencies

- **Requires**: Email service, SMS gateway
- **Used By**: TUM-01 (Invitation Activation), TUM-03 (Password Reset), Sprint 1 Login 2FA

## Definition of Done

- [ ] OTP generation, delivery (email + SMS), and verification working
- [ ] Rate limiting and lockout after failed attempts
- [ ] Expiry and cooldown enforced
- [ ] OTP audit logging implemented
- [ ] Unit tests > 80%
- [ ] UAT: OTP flow tested for activation and password reset
