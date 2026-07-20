---
module: 08-fleet-management
specification: Finished Goods Workflow — Section 5 — Driver Supervisor Dispatch — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-004, FB-011, DM-01
source_spec: ../../../../../05-modules/08-fleet-management/driver-supervisor-dispatch.md
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 5 — Driver Supervisor — Dispatch — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Fleet → **Dispatch queue** (`/admin/fleet_supervisor/vehicleinspection/dispatch-queue/`)

Scope: **Driver Supervisor** releasing **Assigned** Own Fleet TOs to **Ready for Dispatch**, with FB-011 concurrency guards on driver/vehicle conflicts.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Dispatch queue visibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Supervisor sees Assigned TOs in dispatch queue | As **Driver Supervisor** (`driver.supervisor1@yopmail.com`), open **Fleet → Dispatch queue**. Assert TO from Section 4 (status **Assigned**, vehicle + driver set) appears with `to_number`, vehicle, driver metadata. | P0 | Planned |
| TC07 | Queue shows driver/vehicle dispatch eligibility | On dispatch queue rows, assert `data-dispatch-eligible` / block reason text distinguishes **Available** vs **Active on another TO** (FB-011 meta column). | P1 | Planned |

## Dispatch happy path & guards

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | Dispatch TO when driver and vehicle are free | TO **Assigned**; driver/vehicle not serving another in-progress TO. Select TO → **Ready for dispatch** (bulk action or per-row confirm). Assert status **Ready for Dispatch** (`ready_for_dispatch`). | P0 | Planned |
| TC03 | Block dispatch when driver active on another TO | Driver on TO-1 in yard/in-progress; TO-2 **Assigned** same driver. Attempt dispatch TO-2. Expected: blocked with message driver engaged on active TO. | P0 | Planned |
| TC04 | Block dispatch when vehicle active on another TO | Same as TC03 for vehicle resource. | P0 | Planned |
| TC05 | Dispatch allowed after prior TO closed | Complete TO-1 lifecycle to **Closed** (Sections 6–18). Retry dispatch TO-2 sharing resources — succeeds → **Ready for Dispatch**. | P1 | Planned |
| TC06 | Cannot dispatch non-Assigned TO | TO still **Created** (planning incomplete). Assert absent from dispatch queue or dispatch action disabled with reason. | P0 | Planned |

## RBAC & audit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | RBAC — only Driver Supervisor dispatches | As **Transport Planner**, open dispatch queue URL or TO **Ready for dispatch** control. Expected: permission denied / control hidden (`action_ready_for_dispatch` removed for planner). | P0 | Planned |
| TC09 | Audit captures successful dispatch | After TC02, Tenant Admin TO **History** shows dispatch transition / log message. *Rewrite FG_DS_009 — admin History not tenant Audit Logs.* | P1 | Planned |
| TC10 | Blocked dispatch attempt observable | After TC03 failure, assert error message on screen; optional History note. *Rewrite FG_DS_010: blocked attempts may not write AuditLog — assert UI error only unless log confirmed.* | P2 | Planned |

## Implementation Notes

### Fixtures

- Section 4 TO in **Assigned** with own-fleet driver (`driver1@yopmail.com`) and vehicle.
- For conflict cases: second TO sharing resources, first TO advanced to driving/yard status.

### URLs

| Item | Value |
|------|--------|
| Dispatch queue | `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/` |
| Per-TO confirm | `/admin/transport/transportorder/<pk>/confirm-ready-for-dispatch/` |
| Bulk action | changelist **Ready for dispatch** |

### Original ID map (FG_DS → TC)

| Legacy | TC | Verdict |
|--------|-----|---------|
| FG_DS_001 | TC01 | Keep |
| FG_DS_002 | TC02 | Keep |
| FG_DS_003 | TC03 | Keep |
| FG_DS_004 | TC04 | Keep |
| FG_DS_005 | TC05 | Keep (chain) |
| FG_DS_006 | TC06 | Keep |
| FG_DS_007 | TC07 | Keep |
| FG_DS_008 | TC08 | Keep |
| FG_DS_009 | TC09 | Rewrite |
| FG_DS_010 | TC10 | Demote |

### Suggested next step

Artifacts: `tests/e2e/playwright-mcp/fg-ds-dispatch-artifacts/RESULTS.md`.
