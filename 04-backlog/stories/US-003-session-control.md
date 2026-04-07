---
title: Session Control
story_id: US-003
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
  - US-002-multi-factor-auth.md
  - US-009-user-activity-audit-logs.md
dependencies:
  - US-001-user-login-account-lockout.md
tags: [foundation, session, security, critical]
---

# US-003: Session Control

## User Story

**As a** System Admin user  
**I want to** control user sessions  
**So that** inactive sessions do not pose security risks

## Business Context

Session control ensures that idle sessions are automatically terminated. The system must:
- Track each active session with IP address and device details
- Automatically log out users after 30 minutes of inactivity
- Reset the inactivity timer upon any user interaction (clicks, scrolling, keyboard input)

---

## Acceptance Criteria

### AC-1: Session Tracking
- [ ] System SHALL track each active session with associated IP address and device details
- [ ] System SHALL display active sessions in Admin dashboard (where applicable)
- [ ] System SHALL support session termination by Admin

### AC-2: Inactivity Timeout
- [ ] System SHALL automatically log out the user after 30 minutes of inactivity
- [ ] System SHALL reset the inactivity timer upon any user interaction (clicks, scrolling, keyboard input)
- [ ] System SHALL warn user before session expiry (e.g., 5 minutes before)

### AC-3: Session Security
- [ ] System SHALL invalidate session on password change
- [ ] System SHALL support "Log out from all devices" for Admin

---

## Functional Requirements

### FR-001: Session Management
- [Critical] Track active sessions with IP and device
- [Critical] 30-minute inactivity timeout
- [Critical] Activity-based timer reset

### FR-002: Admin Session Control
- [High] View active sessions per user
- [High] Force logout capability

---

## Business Rules

### BR-AUTH-006: Inactivity Timeout
- Session expires after 30 minutes of no user interaction
- **Enforcement**: Session middleware

### BR-AUTH-007: Activity Reset
- Clicks, scrolling, keyboard input reset inactivity timer
- **Enforcement**: Client-side activity tracking + server heartbeat

---

## Data Model

```typescript
Session {
  session_id: UUID
  user_id: UUID
  ip_address: string
  device_id: string (nullable)
  user_agent: string
  last_activity_at: DateTime
  created_at: DateTime
  expires_at: DateTime
}
```

---

## UI/UX Requirements

### Session Warning Modal
```
┌─────────────────────────────────────────┐
│ Session Expiring Soon                    │
├─────────────────────────────────────────┤
│ Your session will expire in 5 minutes    │
│ due to inactivity.                       │
│                                         │
│ [Stay Logged In]  [Log Out]              │
└─────────────────────────────────────────┘
```

### Admin Session Dashboard
- List active sessions per user (IP, device, last activity)
- "Log out from all devices" action
- "Terminate session" per session row

---

## API Endpoints

```typescript
GET /api/v1/sessions/me
Response: { session_id, last_activity_at, expires_at }

POST /api/v1/sessions/heartbeat
Body: {}
Response: { last_activity_at }

GET /api/v1/admin/users/{user_id}/sessions
Response: { sessions: [{ session_id, ip, device, last_activity }] }

POST /api/v1/admin/users/{user_id}/sessions/terminate
Body: { session_id? }  // omit to terminate all
Response: { success }
```

---

## Testing Scenarios

### Happy Path
1. User interacts with app → Inactivity timer resets
2. Warning at 25 min → User clicks "Stay Logged In" → Timer resets

### Edge Cases
1. **30 min inactivity**: Session expired, redirect to login
2. **Password change**: All sessions invalidated
3. **Admin force logout**: User session terminated
4. **Concurrent sessions**: Each tracked independently

---

## Dependencies

### Prerequisites
- ✅ US-001: User Login & Account Lockout

### Enables
- → US-009: User Activity & Audit Logs (session events)

---

## Definition of Done
- [ ] Session tracking with IP and device
- [ ] 30-minute inactivity timeout
- [ ] Activity-based timer reset
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
