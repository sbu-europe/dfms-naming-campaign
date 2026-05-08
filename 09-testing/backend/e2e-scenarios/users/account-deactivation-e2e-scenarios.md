---
module: 12-users
specification: Account Deactivation (US-007) - Playwright E2E Plan
version: 1.0
phase: Phase 1
related_stories: US-007
source_spec: ../../03-backlog/stories/US-007-account-deactivation.md
implementation_reference:
  - ../../../apps/users/account_deactivation_service.py
  - ../../../apps/users/admin.py (UserAdmin: bulk deactivate/reactivate actions)
  - ../../../templates/admin/users/user/deactivate_selected.html
  - ../../../templates/admin/users/user/reactivate_selected.html
test_implementation_reference: ../../../tests/e2e/modules/users/test_account_deactivation_e2e.py
last_updated: 2026-04-27
---

# Account Deactivation (US-007) - Playwright E2E Plan

## Scope (Phase 1, current repo implementation)

- Admin can **temporarily suspend** a user via Django admin bulk action (**Deactivate selected users**).
- Admin can **permanently deactivate** a user via the same bulk action.
- Admin can **reactivate** a temporarily suspended user via Django admin bulk action (**Reactivate selected users**).
- Deactivated users are **blocked from completing API login** (3-step auth flow).

## Not covered / deferred (because not implemented or environment-dependent)

- **Active critical assignment blocking + override** (TO/Trip/approvals/QC): the service currently returns no active assignments in Phase 1 (`_check_active_assignments()` is a stub).
- **Future effective date scheduling**: not exercised in Playwright E2E.
- **Email notification contents**: queueing is best covered via unit/integration tests; E2E does not read outbound email.

## Test Cases

| Test Case ID | Scenario | Description | Priority | Status |
|---|---|---|---:|---|
| TC01 | Temporary suspension blocks login | Create & activate a user (otp_type=none) → bulk-deactivate as **temporary** → verify user shows **Suspended** in admin list and API login completion fails. | P0 | Implemented |
| TC02 | Reactivation restores access | After TC01, bulk-reactivate → verify user shows **Active** in admin list and API login completion succeeds. | P0 | Implemented |
| TC03 | Permanent deactivation blocks reactivation | Create & activate a user → bulk-deactivate as **permanent** → verify login blocked → attempt bulk-reactivate and assert admin surfaces “cannot be reactivated / failed to reactivate”. | P0 | Implemented |
| TC04 | Self-deactivation is blocked | In Users admin list, select the currently logged-in admin user → attempt bulk deactivation and assert the action fails with `DA-400-SELF` and the admin remains Active. | P1 | Implemented |
| TC05 | Already inactive blocks deactivation | Deactivate a user (temporary) → attempt to deactivate again and assert the action fails with `DA-409-ALREADY-INACTIVE`. | P1 | Implemented |
| TC06 | Bulk deactivation with mixed validity reports per-user failures | Select one active user + one already-inactive user in the same bulk deactivation action → assert one succeeds and one fails with `DA-409-ALREADY-INACTIVE` (success + error messages both present). | P1 | Implemented |
| TC07 | Active assignment check + override | Phase-1: assert the admin deactivation flow does not expose override UI and deactivation proceeds (assignment checks are stubbed). | P2 | Implemented |
| TC08 | Cross-tenant isolation | Single-tenant env: assert tenant admin cannot access platform tenant administration routes (isolation boundary). | P2 | Implemented |

