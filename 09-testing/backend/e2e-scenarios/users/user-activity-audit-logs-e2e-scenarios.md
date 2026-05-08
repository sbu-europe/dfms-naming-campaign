---
module: 12-users
specification: User Activity & Audit Logs (US-009) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-009
source_spec: ../../03-backlog/stories/US-009-user-activity-audit-logs.md
implementation_reference:
  - ../../../apps/audit/models.py
  - ../../../apps/audit/views.py
  - ../../../apps/audit/services.py
  - ../../../apps/master_data/views.py (Vehicle CRUD audit hooks)
  - ../../../apps/users/services.py (login audit hooks)
test_implementation_reference: ../../../tests/e2e/modules/users/test_user_activity_audit_logs_e2e.py
last_updated: 2026-04-28
---

# User Activity & Audit Logs (US-009) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

These E2E scenarios validate the tenant-scoped Audit Logs feature set:

- **Audit log capture** for authentication/security and CRUD activity
- **Audit log retrieval** (list, filter, search, ordering, pagination)
- **Audit log immutability** (no update/delete)
- **Audit log export** (CSV/JSON) with applied filters
- **Access control** (Tenant Admin / Super Admin only)
- **Self-auditing** of audit-log access and export operations

Test implementation: `tests/e2e/modules/users/test_user_activity_audit_logs_e2e.py`

## Test data & assumptions (E2E environment)

- E2E runs against a live environment via `E2E_BASE_URL`.
- Tenant Admin credentials exist in `.env` (`E2E_USER_EMAIL` / `E2E_USER_PASSWORD`).
- A non-admin tenant user exists in `.env` (`E2E_TEST_USER_EMAIL` / `E2E_TEST_USER_PASSWORD`) for permission-negative coverage.
- Where OTP is required for a user, the suite **skips** OTP-dependent paths (non-interactive E2E constraint).

## Test Cases

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | List audit logs (baseline) | Login as Tenant Admin → call `GET /api/v1/admin/audit-logs?limit=25&ordering=-timestamp` → assert paginated envelope + required fields exist for each row (`log_id`, `tenant_id`, `event_type`, `status`, `timestamp`, `action`, `details`). | P0 | Implemented |
| TC02 | Login event is logged | Perform JWT login via `/api/v1/auth/login/password/` (OTP must not be required) → filter `event_type=LOGIN&status=success` (+ search by admin email) → assert a matching `LOGIN` audit row exists. | P0 | Implemented |
| TC03 | Retrieve creates access audit row | List logs → pick a `log_id` → call `GET /api/v1/admin/audit-logs/{log_id}` → assert detail returned → assert an `AUDIT_LOG_ACCESS` audit event exists with `action=AuditLog.View` and `details.log_id={log_id}`. | P0 | Implemented |
| TC04 | Export CSV/JSON and export is audited | Call `POST /api/v1/admin/audit-logs/export` with `format=csv` and filters → assert downloadable CSV → repeat with `format=json` → assert JSON list → assert an `AUDIT_LOG_EXPORT` audit event exists with `action=AuditLog.Export` and `details.format` reflecting the export. | P0 | Implemented |
| TC05 | Audit log immutability enforced | Attempt `PATCH` and `DELETE` against `/api/v1/admin/audit-logs/{log_id}` as Tenant Admin → assert rejected (expected 405/404 depending on router). | P0 | Implemented |
| TC06 | Non-admin forbidden | Login as `E2E_TEST_USER_EMAIL` (non-admin) → call `GET /api/v1/admin/audit-logs` → assert `403` (or `401`). | P0 | Implemented |
| TC07 | Vehicle CREATE event is logged | Create Vehicle via `POST /api/v1/vehicles/` → assert `CREATE` audit log exists for `entity_type=Vehicle`, `entity_id={vehicle_id}`, `action=Vehicle.Create`, `status=success`. | P0 | Implemented |
| TC08 | Vehicle UPDATE event is logged | Create Vehicle → update via `PATCH /api/v1/vehicles/{id}/` → assert `UPDATE` audit log exists for that `entity_id` with `action=Vehicle.Update`. | P0 | Implemented |
| TC09 | Vehicle READ event is logged | Create Vehicle → retrieve via `GET /api/v1/vehicles/{id}/` → assert `READ` audit log exists for that `entity_id` with `action=Vehicle.Read`. | P0 | Implemented |
| TC10 | Vehicle DELETE event is logged | Create Vehicle → delete via `DELETE /api/v1/vehicles/{id}/` → assert `DELETE` audit log exists for that `entity_id` with `action=Vehicle.Delete`. | P0 | Implemented |
| TC11 | Filter combinations (multi-param) | Use combined filters (e.g., `event_type=CREATE&entity_type=Vehicle&status=success&ip_address=...&date_from=...`) and assert all rows match and include the target audit log. | P1 | Implemented |
| TC12 | Full-text search coverage | Search by a created `vehicle_id` and assert returned audit rows include `entity_id={vehicle_id}` (and match expected event types). | P1 | Implemented |
| TC13 | Empty export returns empty dataset | Export with filters expected to yield zero rows → assert CSV is header-only and JSON is `[]` → assert export is still audited as `AUDIT_LOG_EXPORT`. | P1 | Implemented |
| TC14 | OTP-required admin login is skipped | Attempt JWT login via `/api/v1/auth/login/password/`; if API responds with `otp_required=true`, the test must `skip` (non-interactive E2E constraint). Otherwise it must succeed and return JWT. | P1 | Implemented |
| TC15 | Access-event recursion protection | Retrieve a log detail once and assert exactly **one** new `AUDIT_LOG_ACCESS` event is created for that `log_id` (no duplicate/write-loop). | P1 | Implemented |
| TC16 | Large page size | Call `GET /api/v1/admin/audit-logs?limit=100&ordering=-timestamp` and assert response is stable (≤100 results, envelope valid, timestamps are in descending order). | P2 | Implemented |

