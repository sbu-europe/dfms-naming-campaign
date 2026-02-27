---
title: Multi-Factor Auth (2FA)
story_id: US-002
phase: phase-1
module: System Foundation
priority: Critical
status: Pending
epic: System Foundation
epic_id: EPIC-001
epic_name: System Foundation
sprint: Sprint 1
story_points: 10
created: 2026-02-23
updated: 2026-02-23
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-001-user-login-account-lockout.md
  - US-003-session-control.md
  - US-006-otp-verification.md
dependencies:
  - US-001-user-login-account-lockout.md
tags: [foundation, auth, mfa, 2fa, security, critical]
---

# US-002: Multi-Factor Auth (2FA)

## User Story

**As an** Tenant Admin user  
**I want to** use 2FA  
**So that** my account has an extra layer of security beyond just password

## Business Context

Multi-factor authentication adds a second verification step for Admin users. The system must:
- Require OTP or authenticator app verification after successful password entry
- Deny access if second-factor verification fails or expires
- Log all 2FA verification outcomes for audit and security monitoring

---

## Acceptance Criteria

### AC-1: 2FA Enforcement
- [ ] System SHALL enforce MFA for Tenant Admin users after valid username/password
- [ ] System SHALL support OTP (one-time password) or authenticator application
- [ ] System SHALL allow access only upon successful second-factor validation
- [ ] System SHALL deny access if second-factor verification fails or expires
- [ ] System SHALL log all 2FA verification outcomes for audit and security monitoring

### AC-2: OTP Delivery
- [ ] System SHALL deliver OTP via email or SMS
- [ ] System SHALL enforce OTP expiry (e.g., 10 minutes)
- [ ] System SHALL support OTP resend with cooldown

### AC-3: Authenticator App
- [ ] System SHALL support TOTP-based authenticator applications
- [ ] System SHALL allow trusted device registration to reduce MFA frequency

---

## Functional Requirements

### FR-001: 2FA Flow
- [Critical] Enforce MFA after password validation for Admin roles
- [Critical] OTP or authenticator verification
- [Critical] Access denial on failed/expired verification

### FR-002: Audit & Monitoring
- [Critical] Log all 2FA verification outcomes
- [High] Exportable audit logs for security review

---

## Business Rules

### BR-AUTH-004: Admin MFA Requirement
- Tenant Admin users MUST complete 2FA before access
- **Enforcement**: Authentication middleware

### BR-AUTH-005: 2FA Verification Logging
- All 2FA attempts (success/failure) must be logged
- **Enforcement**: Audit service

---

## Data Model

```typescript
MFAVerification {
  verification_id: UUID
  user_id: UUID
  method: Enum (otp, authenticator)
  status: Enum (pending, success, failed, expired)
  attempted_at: DateTime
  ip_address: string
  device_id: string (nullable)
}

TrustedDevice {
  device_id: UUID
  user_id: UUID
  device_name: string
  registered_at: DateTime
  last_used_at: DateTime
}
```

---

## UI/UX Requirements

### 2FA Challenge Screen
```
┌─────────────────────────────────────────┐
│ Two-Factor Authentication               │
├─────────────────────────────────────────┤
│ Enter the 6-digit code from your        │
│ authenticator app or email/SMS           │
│                                         │
│ Code: [______]                          │
│                                         │
│ [Verify]  [Use different method]         │
│                                         │
│ Code expires in 9:45                    │
└─────────────────────────────────────────┘
```

### OTP / Authenticator Selection
- Toggle: Email OTP | SMS OTP | Authenticator App
- Resend OTP link with cooldown
- Trust this device checkbox (optional)

---

## API Endpoints

```typescript
POST /api/v1/auth/2fa/challenge
Body: { user_id, session_token }
Response: { challenge_id, methods: ['otp', 'authenticator'], expires_at }

POST /api/v1/auth/2fa/verify
Body: { challenge_id, code, method }
Response: { success, access_token } | { error }

POST /api/v1/auth/2fa/register-device
Body: { device_id, device_name }
Response: { success }
```

---

## Testing Scenarios

### Happy Path
1. Admin logs in with password → 2FA challenge shown → Enters OTP → Access granted
2. Authenticator app verification → Valid TOTP → Access granted

### Edge Cases
1. **Expired OTP**: Deny access, show resend option
2. **Invalid OTP**: Deny access, log failure
3. **Trusted device**: Skip 2FA for registered device (configurable)
4. **2FA bypass attempt**: Block and log

---

## Dependencies

### Prerequisites
- ✅ US-001: User Login & Account Lockout

### Enables
- → US-005: User Invitation & Activation (uses OTP)
- → US-008: Password & Account Reset (uses OTP)

---

## Definition of Done
- [ ] MFA enforcement for Admin roles
- [ ] OTP and authenticator app support
- [ ] 2FA audit logging
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
