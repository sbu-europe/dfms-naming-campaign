---
title: OTP Verification System
story_id: US-066
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Security & Authentication
sprint: Sprint 2
story_points: 5
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-065-user-invitation-activation.md
  - US-067-password-account-reset.md
dependencies: []
tags: [security, otp, verification, authentication, critical]
---

# US-066: OTP Verification System

## User Story

**As a** System Administrator  
**I want to** verify user identity through OTP  
**So that** only legitimate users can access the system

## Business Context

OTP (One-Time Password) verification is critical for:
- User account activation
- Password reset
- Two-factor authentication (2FA)
- Secure operations requiring additional verification

This ensures security and prevents unauthorized access.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL send email OTP as 6-digit numeric code
- [ ] System SHALL send SMS OTP as 6-digit numeric code
- [ ] System SHALL require both OTPs verified before account activation
- [ ] System SHALL set OTP validity to 10 minutes
- [ ] System SHALL enforce 2-minute cooldown before resend
- [ ] System SHALL allow maximum 3 verification attempts
- [ ] System SHALL trigger 15-minute lockout after 3 failed attempts
- [ ] System SHALL log all attempts with timestamp, IP, device ID
- [ ] System SHALL make logs exportable for audit
- [ ] System SHALL enforce rate limiting (max 5 OTP requests per hour per user)

### Should Have (High)
- [ ] System SHOULD support voice OTP (optional)
- [ ] System SHOULD display OTP expiration countdown
- [ ] System SHOULD send OTP via multiple channels (email + SMS)
- [ ] System SHOULD support OTP for specific operations (sensitive actions)

### Nice to Have (Medium)
- [ ] System MAY support TOTP (Time-based OTP) apps
- [ ] System MAY support backup codes
- [ ] System MAY provide OTP delivery status tracking

## Functional Requirements

### FR-066-001: OTP Generation
- [Critical] System SHALL generate 6-digit numeric OTP
- [Critical] System SHALL ensure OTP uniqueness and randomness
- [Critical] System SHALL set OTP expiration to 10 minutes
- [Critical] System SHALL link OTP to specific user and operation
- [High] System SHALL support multiple OTP types (email, SMS, voice)
- [High] System SHALL generate separate OTPs for email and SMS

### FR-066-002: OTP Delivery
- [Critical] System SHALL send email OTP via email service
- [Critical] System SHALL send SMS OTP via SMS gateway
- [Critical] System SHALL include OTP code in message
- [Critical] System SHALL include expiration time in message
- [High] System SHALL support multiple delivery channels
- [High] System SHALL track delivery status

### FR-066-003: OTP Verification
- [Critical] System SHALL validate OTP code against stored value
- [Critical] System SHALL check OTP expiration
- [Critical] System SHALL check OTP usage status (used/unused)
- [Critical] System SHALL allow maximum 3 verification attempts
- [Critical] System SHALL lock account after 3 failed attempts (15 minutes)
- [High] System SHALL support case-insensitive OTP entry
- [High] System SHALL auto-verify on correct entry

### FR-066-004: OTP Resend
- [Critical] System SHALL enforce 2-minute cooldown before resend
- [Critical] System SHALL generate new OTP on resend
- [Critical] System SHALL invalidate previous OTP on resend
- [Critical] System SHALL enforce rate limiting (5 per hour)
- [High] System SHALL track resend count
- [High] System SHALL send notification on resend

### FR-066-005: OTP Logging & Audit
- [Critical] System SHALL log all OTP operations:
  - Generation: timestamp, user_id, operation_type, delivery_method
  - Verification: timestamp, user_id, IP_address, device_id, status (success/failure)
  - Resend: timestamp, user_id, resend_count
- [Critical] System SHALL capture IP address and device ID
- [Critical] System SHALL make logs exportable (CSV, JSON)
- [High] System SHALL provide log search and filtering
- [High] System SHALL generate audit reports

## Business Rules

### BR-066-001: OTP Format
- OTP must be 6-digit numeric code
- OTP must be randomly generated
- OTP must be unique per user-operation combination

### BR-066-002: OTP Validity
- OTP valid for 10 minutes from generation
- OTP single-use only (invalidated after verification)
- Expired OTP cannot be verified

### BR-066-003: Verification Attempts
- Maximum 3 verification attempts per OTP
- Failed attempts reset on successful verification
- Account locked for 15 minutes after 3 failed attempts
- Lockout applies to all OTP operations for that user

### BR-066-004: Resend Rules
- Minimum 2-minute cooldown between resends
- Maximum 5 OTP requests per hour per user
- New OTP invalidates previous OTP
- Resend count tracked for audit

### BR-066-005: Rate Limiting
- Maximum 5 OTP requests per hour per user
- Rate limit applies across all OTP types
- Exceeding limit blocks further requests for 1 hour
- Rate limit reset after 1 hour

## Data Model

### OTP Entity
```yaml
OTP:
  otp_id: string (unique)
  user_id: string (FK, optional - for account activation)
  email: string
  mobile: string
  otp_code: string (hashed)
  otp_type: string (email|sms|both)
  operation_type: string (activation|password_reset|2fa|sensitive_action)
  status: string (pending|verified|expired|invalidated)
  generated_at: datetime
  expires_at: datetime
  verified_at: datetime (optional)
  verification_attempts: integer
  ip_address: string (optional)
  device_id: string (optional)
```

### OTP Verification Log Entity
```yaml
OTPVerificationLog:
  log_id: string (unique)
  otp_id: string (FK)
  user_id: string (FK, optional)
  verification_code: string (hashed)
  status: string (success|failure)
  ip_address: string
  device_id: string
  user_agent: string
  verified_at: datetime
  failure_reason: string (optional)
```

## UI/UX Requirements

### OTP Entry Form
- Display operation context (e.g., "Account Activation")
- Email OTP input field (6 digits)
- SMS OTP input field (6 digits)
- "Verify" button
- "Resend OTP" link (with cooldown timer)
- Expiration countdown display
- Error messages for invalid/expired OTP

### OTP Resend Interface
- "Resend OTP" button (disabled during cooldown)
- Cooldown countdown timer
- Success message on resend
- Rate limit warning if exceeded

### OTP Admin Dashboard
- OTP generation statistics
- Verification success/failure rates
- Failed attempt alerts
- Rate limit violations
- Export logs functionality

## API Endpoints

### POST /api/v1/otp/generate
- Generate OTP for user
- Request body: email, mobile, operation_type
- Response: otp_id, expires_at, delivery_status

### POST /api/v1/otp/verify
- Verify OTP code
- Request body: otp_id, email_otp, sms_otp
- Response: verified (boolean), access_token (if applicable)

### POST /api/v1/otp/{otp_id}/resend
- Resend OTP
- Request body: otp_type (email|sms|both)
- Response: new_otp_id, expires_at

### GET /api/v1/otp/{otp_id}/status
- Get OTP status
- Response: status, expires_at, attempts_remaining

### GET /api/v1/admin/otp/logs
- Get OTP verification logs
- Query params: user_id, date_from, date_to, status
- Response: array of log entries

### POST /api/v1/admin/otp/logs/export
- Export OTP logs
- Request body: filters, format (csv|json)
- Response: file download

## Non-Functional Requirements

- **Performance**: OTP generation < 100ms, delivery < 5 seconds
- **Security**: OTP codes must be hashed in database
- **Scalability**: Support 10,000+ concurrent OTP requests
- **Availability**: OTP service must be 99.9% available
- **Reliability**: OTP delivery success rate > 95%

## Testing Scenarios

### TC-066-001: OTP Generation & Delivery
1. Request OTP for user activation
2. Verify OTP generated (6 digits)
3. Verify email OTP sent
4. Verify SMS OTP sent
5. Verify expiration set to 10 minutes

### TC-066-002: OTP Verification Success
1. Generate OTP
2. Enter correct OTP codes
3. Verify OTP validated successfully
4. Verify OTP marked as used
5. Verify operation proceeds

### TC-066-003: OTP Verification Failure
1. Generate OTP
2. Enter incorrect OTP (attempt 1)
3. Enter incorrect OTP (attempt 2)
4. Enter incorrect OTP (attempt 3)
5. Verify account locked for 15 minutes

### TC-066-004: OTP Expiration
1. Generate OTP
2. Wait 10 minutes (or simulate)
3. Attempt verification
4. Verify verification rejected (expired)

### TC-066-005: OTP Resend
1. Generate OTP
2. Request resend (before cooldown)
3. Verify resend blocked
4. Wait 2 minutes
5. Request resend
6. Verify new OTP generated and sent
7. Verify old OTP invalidated

### TC-066-006: Rate Limiting
1. Generate 5 OTPs within 1 hour
2. Attempt 6th OTP generation
3. Verify request blocked (rate limit)
4. Wait 1 hour
5. Verify OTP generation allowed

## Dependencies

- **Email Service**: For email OTP delivery
- **SMS Gateway**: For SMS OTP delivery
- **US-065**: User Invitation & Activation (uses OTP)
- **US-067**: Password & Account Reset (uses OTP)

## Definition of Done

- [ ] OTP generation service implemented
- [ ] Email OTP delivery integrated
- [ ] SMS OTP delivery integrated
- [ ] OTP verification logic implemented
- [ ] OTP resend functionality implemented
- [ ] Rate limiting implemented
- [ ] Audit logging implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.4: OTP Verification System

**Last Updated**: February 13, 2026  
**Status**: Pending Review

