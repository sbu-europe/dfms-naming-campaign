---
title: Password & Account Reset
story_id: US-067
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
  - US-066-otp-verification.md
  - US-068-account-deactivation.md
dependencies: []
tags: [security, password, reset, authentication, critical]
---

# US-067: Password & Account Reset

## User Story

**As an** Admin User  
**I want to** reset my password securely  
**So that** I can regain access to my account

## Business Context

Password reset functionality is essential for:
- Users who forget their passwords
- Security incidents requiring password changes
- Account recovery
- Supporting users with low digital literacy through admin-assisted reset

The system must support both self-service and admin-assisted reset to accommodate all user types.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL support admin-assisted password reset (preferred for low literacy users)
- [ ] System SHALL generate 6-digit OTP for admin-assisted reset (10-minute validity)
- [ ] System SHALL require admin justification remarks for assisted reset
- [ ] System SHALL log all assisted resets with admin ID and timestamp
- [ ] System SHALL support self-service password reset via forgot password link
- [ ] System SHALL send reset link valid for 15 minutes
- [ ] System SHALL enforce password complexity rules
- [ ] System SHALL terminate all active sessions on password reset
- [ ] System SHALL send confirmation email after successful reset
- [ ] System SHALL log all password reset attempts with timestamp, user ID, IP address

### Should Have (High)
- [ ] System SHOULD support mobile prompt for password reset
- [ ] System SHOULD provide password strength meter during reset
- [ ] System SHOULD enforce rate limiting (max 3 reset requests per hour per user)
- [ ] System SHOULD send email notification after password change

### Nice to Have (Medium)
- [ ] System MAY support security questions as alternative reset method
- [ ] System MAY provide password reset history

## Functional Requirements

### FR-067-001: Admin-Assisted Password Reset
- [Critical] System SHALL allow Super Admin and Tenant Admin to trigger assisted reset
- [Critical] System SHALL require offline identity verification by admin
- [Critical] System SHALL generate 6-digit OTP valid for 10 minutes
- [Critical] System SHALL require admin to provide justification remarks
- [Critical] System SHALL communicate OTP to user (admin provides OTP)
- [Critical] System SHALL allow user to enter OTP to reset password
- [Critical] System SHALL log all assisted resets with:
  - Admin ID
  - User ID
  - Timestamp
  - Justification remarks
  - IP address
- [High] System SHALL require admin approval for sensitive accounts
- [High] System SHALL send notification to user about assisted reset

### FR-067-002: Self-Service Password Reset
- [Critical] System SHALL provide "Forgot Password" link on login page
- [Critical] System SHALL require email or mobile number input
- [Critical] System SHALL send password reset link via email (valid 15 minutes)
- [Critical] System SHALL send password reset OTP via SMS (if mobile provided)
- [Critical] System SHALL require OTP verification before allowing password reset
- [Critical] System SHALL enforce password complexity rules:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- [Critical] System SHALL require password confirmation
- [High] System SHALL provide password strength meter
- [High] System SHALL support mobile app password reset

### FR-067-003: Password Reset Process
- [Critical] System SHALL validate reset link/OTP before allowing password change
- [Critical] System SHALL check reset link expiration (15 minutes)
- [Critical] System SHALL validate password complexity
- [Critical] System SHALL prevent reuse of last 3 passwords
- [Critical] System SHALL update password in database (hashed)
- [Critical] System SHALL terminate all active user sessions
- [Critical] System SHALL require user to login with new password
- [High] System SHALL send confirmation email after successful reset

### FR-067-004: Password Reset Logging
- [Critical] System SHALL log all password reset attempts:
  - User ID
  - Method (admin-assisted|self-service)
  - Timestamp
  - IP address
  - Device ID
  - Status (success|failure)
  - Failure reason (if applicable)
- [Critical] System SHALL log admin-assisted resets with admin ID and justification
- [High] System SHALL provide reset history per user
- [High] System SHALL generate audit reports

### FR-067-005: Rate Limiting & Security
- [Critical] System SHALL enforce rate limiting (max 3 reset requests per hour per user)
- [Critical] System SHALL block reset requests after rate limit exceeded
- [Critical] System SHALL validate reset link/OTP uniqueness
- [High] System SHALL detect suspicious reset patterns
- [High] System SHALL require additional verification for suspicious activity

## Business Rules

### BR-067-001: Admin-Assisted Reset
- Only Super Admin and Tenant Admin can trigger assisted reset
- Admin must verify user identity offline before reset
- OTP valid for 10 minutes
- Admin must provide justification remarks (mandatory)
- All assisted resets logged for audit

### BR-067-002: Self-Service Reset
- Reset link valid for 15 minutes
- OTP valid for 10 minutes
- Maximum 3 reset requests per hour per user
- Password must meet complexity requirements
- Cannot reuse last 3 passwords

### BR-067-003: Password Complexity
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be common password (dictionary check)

### BR-067-004: Session Management
- All active sessions terminated on password reset
- User must login with new password
- Previous sessions cannot be used after reset

## Data Model

### Password Reset Entity
```yaml
PasswordReset:
  reset_id: string (unique)
  user_id: string (FK)
  reset_token: string (unique, hashed)
  otp_code: string (hashed, optional)
  reset_method: string (admin_assisted|self_service)
  admin_id: string (FK, optional - for admin-assisted)
  justification: string (optional - for admin-assisted)
  status: string (pending|completed|expired|cancelled)
  created_at: datetime
  expires_at: datetime
  completed_at: datetime (optional)
  ip_address: string
  device_id: string
```

### Password Reset Log Entity
```yaml
PasswordResetLog:
  log_id: string (unique)
  reset_id: string (FK)
  user_id: string (FK)
  reset_method: string
  admin_id: string (FK, optional)
  status: string (success|failure)
  ip_address: string
  device_id: string
  user_agent: string
  timestamp: datetime
  failure_reason: string (optional)
```

## UI/UX Requirements

### Forgot Password Page
- Email/mobile input field
- "Send Reset Link" button
- Instructions text
- Rate limit warning (if applicable)

### Password Reset Page
- Reset link validation
- OTP input fields (email + SMS)
- New password input with strength meter
- Password confirmation input
- "Reset Password" button
- Expiration countdown

### Admin-Assisted Reset Form
- User search/selection
- Identity verification checklist
- Justification textarea (mandatory)
- "Generate Reset OTP" button
- OTP display (for admin to communicate)
- Reset completion confirmation

## API Endpoints

### POST /api/v1/auth/password/reset/request
- Request password reset (self-service)
- Request body: email or mobile
- Response: reset_token, expires_at

### POST /api/v1/auth/password/reset/verify
- Verify reset OTP
- Request body: reset_token, email_otp, sms_otp
- Response: verified (boolean)

### POST /api/v1/auth/password/reset
- Reset password
- Request body: reset_token, new_password, password_confirm
- Response: success message

### POST /api/v1/admin/users/{user_id}/password/reset
- Admin-assisted password reset
- Request body: justification, verify_identity (boolean)
- Response: otp_code, expires_at

### GET /api/v1/admin/password-reset/logs
- Get password reset logs
- Query params: user_id, date_from, date_to, method
- Response: array of log entries

## Non-Functional Requirements

- **Performance**: Reset link generation < 200ms
- **Security**: Reset tokens must be cryptographically secure
- **Scalability**: Support 1000+ concurrent reset requests
- **Availability**: Password reset service must be 99.9% available
- **Rate Limiting**: Max 3 requests per hour per user

## Testing Scenarios

### TC-067-001: Self-Service Password Reset
1. User clicks "Forgot Password"
2. User enters email
3. Verify reset link sent
4. User clicks reset link
5. User verifies OTPs
6. User sets new password
7. Verify password updated
8. Verify all sessions terminated

### TC-067-002: Admin-Assisted Reset
1. Admin selects user for reset
2. Admin verifies identity offline
3. Admin provides justification
4. System generates OTP
5. Admin communicates OTP to user
6. User enters OTP and sets password
7. Verify password updated
8. Verify reset logged

### TC-067-003: Reset Link Expiration
1. Request password reset
2. Wait 15 minutes (or simulate)
3. Attempt to use reset link
4. Verify reset rejected (expired)

### TC-067-004: Rate Limiting
1. Request password reset 3 times within 1 hour
2. Attempt 4th reset request
3. Verify request blocked (rate limit)

### TC-067-005: Password Complexity
1. Attempt to set weak password
2. Verify validation error
3. Set password meeting complexity rules
4. Verify password accepted

## Dependencies

- **US-066**: OTP Verification System (uses OTP)
- **Email Service**: For reset link delivery
- **SMS Gateway**: For OTP delivery

## Definition of Done

- [ ] Admin-assisted reset implemented
- [ ] Self-service reset implemented
- [ ] Password complexity validation implemented
- [ ] Session termination on reset implemented
- [ ] Reset logging implemented
- [ ] Rate limiting implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.6: Password & Account Reset

**Last Updated**: February 13, 2026  
**Status**: Pending Review

