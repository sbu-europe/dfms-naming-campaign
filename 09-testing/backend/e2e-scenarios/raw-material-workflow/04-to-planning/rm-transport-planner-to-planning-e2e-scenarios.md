---
module: 05-transport
specification: Raw Materials Workflow — Section 4 — Transport Planner Own Fleet TO Planning — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TO-02, FB-008, FB-011
source_spec: ../../../../../05-modules/05-transport/transport-order-management.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 10/13 Pass · 3 Planned
artifacts: tests/e2e/playwright-mcp/rm-03-04-to-artifacts/
---

# Raw Materials Workflow — Section 4 — Transport Planner — Own Fleet TO Planning — E2E Scenario Plan (Django Admin SSR)


**Last MCP run:** 2026-08-17 · **10/13 Pass · 3 Planned** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-03-04-to-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-03-04-to-artifacts/RESULTS.md)  
**Navigation:** Transport → **Transport orders** → open **Created** Own Fleet RM TO

Scope: **Transport Planner** completing Own Fleet assignment for `flow_lane = rm_inbound` TOs — vehicle, driver, helper, **five** planned milestone datetimes. Driver Supervisor dispatch is §5.

## Planned milestones

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | TP enters all 5 planned milestone datetimes | Open **Created** Own Fleet RM TO. In **Planned Milestones**, enter **Planned start**, **Planned source arrival**, **Planned source departure**, **Planned destination arrival**, **Planned destination departure** (5 fields per `required_planned_field_names`). Save. Assert all values persist. | P0 | Pass |
| TC02 | Planned departure cannot precede planned arrival | Enter **Planned source departure** before **Planned source arrival** (or dest pair out of order). Save with full assignment intent. Expected: chronological validation error from `validate_planned_milestone_values`. | P1 | Pass |

## Driver & vehicle assignment

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Driver status visible before assignment | Open **Driver** dropdown. Assert options show name + status suffix (Available / On Trip). | P1 | Pass |
| TC04 | Vehicle status visible before assignment | Open **Vehicle** dropdown. Assert registration + status (No Active TO / In Transit / etc.). | P1 | Pass |
| TC05 | Assign available Driver and free Vehicle | Select active vehicle (not under maintenance) and available driver; save. Assert assignments on TO. | P0 | Pass |
| TC06 | Assign Helper to RM TO | Select **Helpers** M2M; save. Assert helper linked. | P1 | Pass |
| TC07 | TO stays Created until planning complete | Assign **Vehicle** only (no driver / incomplete milestones); save. Assert status remains **Created**. | P0 | Pass |
| TC08 | TO becomes Assigned when Vehicle + Driver + 5 milestones complete | Complete vehicle, driver, all five planned datetimes; save. Assert status **Assigned** (`assigned`) via `sync_own_fleet_assignment_status`. | P0 | Pass |

## Assignment guards & RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Under-maintenance vehicles excluded | Vehicle in maintenance — assert absent from **Vehicle** dropdown or blocked on save. | P1 | Planned |
| TC10 | On-leave drivers excluded | Driver on leave — assert absent or validation error on save. | P1 | Planned |
| TC11 | Double-booking allowed for future planning | Driver/Vehicle on active TO-1: assign same to TO-2 **Created**; save succeeds. Dispatch conflict enforced at §5. | P1 | Planned |
| TC12 | RBAC — Own Fleet planning TP-only | As **Driver Supervisor**, attempt to edit assignment fields on Own Fleet RM TO. Expected: read-only or permission denied. *Rewrite RM_049: no TDO-Own Fleet role — TP owns planning.* | P0 | Pass |
| TC13 | Audit trail for TO create/plan | After TC08, as **Tenant Admin**, open TO **History**. Assert **Added** + **Changed** for create and assignment milestones. | P1 | Pass |

## Implementation Notes

### RM milestone note

`apps/transport/planned_milestones.py` requires **all five** planned fields for RM TOs (matrix UI may hide empty source row styling but fields are required for **Assigned**).

### Original ID map

| Legacy | TC | Verdict |
|--------|-----|---------|
| RM_038 | TC01 | Keep |
| RM_039 | TC02 | Keep |
| RM_040 | TC03 | Keep |
| RM_041 | TC04 | Keep |
| RM_042 | TC05 | Keep |
| RM_043 | TC06 | Keep |
| RM_044 | TC07 | Keep |
| RM_045 | TC08 | Keep |
| RM_046 | TC09 | Keep |
| RM_047 | TC10 | Keep |
| RM_048 | TC11 | Keep |
| RM_049 | TC12 | Keep |
| RM_050 | TC13 | Rewrite (admin History) |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **10/13 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-03-04-to-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
