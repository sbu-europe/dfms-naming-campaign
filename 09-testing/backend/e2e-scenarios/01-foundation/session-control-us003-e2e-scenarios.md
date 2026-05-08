---
module: 01-foundation
specification: Session Control (US-003) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-003
source_spec: ../../03-backlog/stories/README.mdREADME.mdUS-003-session-control.md
test_implementation_reference: ../../../tests/e2e/modules/01-foundation/test_session_control_us003_e2e.py
last_updated: 2026-05-04
---

# Session Control (US-003) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

These E2E scenarios validate:

- Session metadata endpoints (`/api/v1/sessions/me`, `/api/v1/sessions/heartbeat`)
- Inactivity timeout enforcement (server-side middleware)
- Password change invalidates sessions (refresh token revoked/blacklisted)
- Admin session listing + termination (all devices and single session)
- Access control (non-admin cannot list/terminate sessions)

## E2E constraints (important)

- The suite uses password-first login to obtain JWTs.
- If OTP is required for the login account, the suite skips OTP-dependent paths (non-interactive constraint).

## Test Cases (aligned with implemented automation)

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Sessions “me” returns metadata | Login and call `GET /api/v1/sessions/me` and assert expected session/user fields exist. | P0 | Implemented |
| TC02 | Heartbeat updates activity | Call `POST /api/v1/sessions/heartbeat` and assert last activity is updated (via follow-up read). | P0 | Implemented |
| TC03 | Inactivity timeout blocks API | Force last-active to exceed inactivity threshold and assert authenticated API requests are rejected/unauthorized. | P0 | Implemented |
| TC04 | Password change invalidates refresh token | Change password and assert old refresh token cannot be used to refresh. | P0 | Implemented |
| TC05 | Admin can terminate sessions | As admin, list sessions and terminate all devices and a specific session; assert termination behavior. | P0 | Implemented |
| TC06 | Non-admin cannot list/terminate | As non-admin user, assert forbidden responses for session admin endpoints. | P0 | Implemented |
| TC07 | Terminate unknown session is safe | Terminating an unknown session id returns safe/no-op response (no crash). | P1 | Implemented |

## Implementation Notes

- Automated suite: `tests/e2e/modules/01-foundation/test_session_control_us003_e2e.py`
- The suite uses DB writes to set `last_active_at` and to look up the `UserSession` row for deterministic termination assertions.
