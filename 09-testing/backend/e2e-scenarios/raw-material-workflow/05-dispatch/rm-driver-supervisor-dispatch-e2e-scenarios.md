---
module: 05-transport
specification: Raw Materials Workflow — Section 5 — Driver Supervisor Dispatch — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DS-01, FB-004
source_spec: ../../../../../05-modules/05-transport/driver-supervisor-dispatch.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 5 — Driver Supervisor — Dispatch Queue — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Fleet Operations → **Dispatch Queue** (`/admin/fleet_supervisor/dispatchqueue/`)

Scope: **Driver Supervisor** releasing **Assigned** Own Fleet RM TOs to **Ready for Dispatch** via inspection or skip path.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Driver Supervisor views Assigned RM TOs in Dispatch Queue | RM TO **Assigned** (§4). As **Driver Supervisor** (`driver.supervisor1.nourish@yopmail.com`), open **Fleet Operations → Dispatch Queue**. Assert TO listed with status **Assigned**, vehicle and driver columns. | P0 | Planned |
| TC02 | Both dispatch actions visible | Open RM TO in queue. Assert **Start Inspection and Dispatch** and **Skip Inspection and Dispatch** actions present. | P0 | Planned |
| TC03 | Dispatch via Skip Inspection and Dispatch | Free driver/vehicle (no other active TO). Click **Skip Inspection and Dispatch**; confirm. Assert TO status **Ready for Dispatch** (`ready_for_dispatch`). | P0 | Planned |
| TC04 | Dispatch via Start Inspection and Dispatch | Click **Start Inspection and Dispatch**, complete vehicle inspection checklist, confirm. Assert checklist saved; TO **Ready for Dispatch**. | P0 | Planned |
| TC05 | Dispatch blocked when driver active on another TO | Driver on TO-1 still active; attempt dispatch TO-2 sharing driver. Expected: validation message; dispatch blocked. | P0 | Planned |
| TC06 | Dispatch blocked when vehicle active on another TO | Vehicle on TO-1 still active; attempt dispatch TO-2 sharing vehicle. Expected: validation blocked. | P0 | Planned |
| TC07 | TO-2 dispatchable after TO-1 Closed | Close TO-1 (complete §17). Retry dispatch TO-2 with same driver/vehicle. Assert dispatch succeeds → **Ready for Dispatch**. | P1 | Planned |
| TC08 | Cannot dispatch TO not in Assigned status | TO still **Created** (planning incomplete). Assert dispatch actions absent/disabled. | P0 | Planned |
| TC09 | RBAC — only Driver Supervisor can dispatch | As **Transport Planner** on Assigned RM TO, assert dispatch actions absent. | P0 | Planned |
| TC10 | Audit captures dispatch method | After TC03 or TC04, as **Tenant Admin**, open TO History / dispatch log. Assert dispatch event with user, timestamp, and skip vs inspection path if logged. | P1 | Planned |

## Implementation Notes

- Mirror FG dispatch plan [`finished-goods-workflow/05-dispatch/`](../finished-goods-workflow/05-dispatch/fg-driver-supervisor-dispatch-e2e-scenarios.md) with `flow_lane = rm_inbound`.
- Double-booking at planning (§4) vs dispatch-time conflict (TC05–TC06).

### Original ID map

| Legacy | TC |
|--------|-----|
| RM_051–RM_060 | TC01–TC10 |
