---
title: User Login & Account Lockout
story_id: US-001
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
  - US-002-multi-factor-auth.md
  - US-003-session-control.md
  - US-004-role-hierarchy.md
dependencies: []
tags: [foundation, auth, login, security, critical]
---

# US-001: User Login & Account Lockout

## User Story

**As a** system user  
**I want to** log in securely with my credentials  
**So that** I can access system features appropriate to my role while protecting against unauthorized access

## Business Context

Secure login and account lockout are foundational security controls. The system must:
- Enforce password masking with show/hide toggle
- Lock accounts after 3 failed login attempts within 15 minutes
- Apply 30-minute lockout period
- Allow Admin to view locked accounts and unlock after offline/phone verification
- Log all unlock actions in the audit trail

---

## Acceptance Criteria

### AC-1: Login & Password Masking
- [ ] System SHALL mask passwords with show/hide toggle
- [ ] System SHALL validate username and password credentials
- [ ] System SHALL display appropriate error messages for invalid credentials

### AC-2: Account Lockout
- [ ] System SHALL enforce lockout rules after 3 failed attempts within 15 minutes
- [ ] System SHALL apply 30-minute lockout period
- [ ] System SHALL prevent login during lockout period
- [ ] System SHALL reset failed-attempt counter upon successful unlock

### AC-3: Admin Unlock
- [ ] System SHALL allow admin visibility of locked accounts
- [ ] System SHALL allow admin manual unlock after offline/phone verification
- [ ] System SHALL allow immediate login after unlock
- [ ] System SHALL log all unlock actions with admin ID, timestamp, and justification

---

## Functional Requirements

### FR-001: Login Flow
- [Critical] Username/password authentication
- [Critical] Password masking with show/hide toggle
- [Critical] Failed attempt tracking and lockout enforcement

### FR-002: Admin Lockout Management
- [Critical] View locked accounts dashboard
- [Critical] Manual unlock with verification
- [High] Audit trail for unlock actions

---

## Business Rules

### BR-AUTH-001: Lockout Threshold
- Lock account after 3 failed attempts within 15-minute window
- **Enforcement**: Authentication service

### BR-AUTH-002: Lockout Duration
- 30-minute lockout period before retry allowed
- **Enforcement**: Authentication service

### BR-AUTH-003: Admin Unlock Verification
- Admin must verify user identity offline/phone before unlock
- **Enforcement**: Manual process, audit log

---

## Data Model

```typescript
User {
  // ... existing fields ...
  failed_login_count: Integer (default: 0)
  last_failed_login_at: DateTime (nullable)
  locked_until: DateTime (nullable)
}

LoginAttempt {
  attempt_id: UUID
  user_id: UUID (nullable)
  username: string
  ip_address: string
  device_id: string (nullable)
  success: Boolean
  attempted_at: DateTime
}

AccountUnlockLog {
  log_id: UUID
  user_id: UUID
  unlocked_by: UUID (admin)
  justification: string
  unlocked_at: DateTime
}
```

---

## UI/UX Requirements

### Login Form
```
┌─────────────────────────────────────────┐
│ Login                                   │
├─────────────────────────────────────────┤
│ Username: [________________]             │
│ Password: [________________] [👁]        │
│                                         │
│ [Login]                                 │
│                                         │
│ ⚠️ Account locked. Try again in 28 min.  │
└─────────────────────────────────────────┘
```

### Admin Locked Accounts Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Locked Accounts                                              │
├──────────────────────────────────────────────────────────────┤
│ User        Locked Until    Failed Attempts  Action          │
│ ───────────────────────────────────────────────────────────  │
│ john.doe    14:30 (18 min)  3               [Unlock]         │
│ jane.smith  15:00 (48 min)  3               [Unlock]         │
└──────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/auth/login
Body: { username, password }
Response: { access_token, user } | { error, locked_until?, attempts_remaining? }

GET /api/v1/admin/locked-accounts
Response: { users: [{ user_id, username, locked_until, failed_count }] }

POST /api/v1/admin/users/{user_id}/unlock
Body: { justification: string }
Response: { success }
```

---

## Testing Scenarios

### Happy Path
1. User enters valid credentials → Login success
2. Admin unlocks locked account after verification → User can login

### Edge Cases
1. **3 failed attempts within 15 min**: Account locked for 30 min
2. **Login during lockout**: Error with locked_until timestamp
3. **Successful login**: Failed-attempt counter reset
4. **Admin unlock without justification**: Validation error

---

## Dependencies

### Prerequisites
- None (foundational story)

### Enables
- → US-002: Multi-Factor Auth (2FA)
- → US-003: Session Control
- → US-004: Role Hierarchy

---

## Definition of Done
- [ ] Login with password masking
- [ ] Account lockout after 3 failed attempts
- [ ] Admin unlock workflow
- [ ] Audit trail for unlock actions
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
