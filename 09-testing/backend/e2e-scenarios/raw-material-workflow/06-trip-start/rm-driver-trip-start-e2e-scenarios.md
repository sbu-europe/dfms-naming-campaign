---
module: 05-transport
specification: Raw Materials Workflow — Section 6 — Driver Trip Start — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TLS-01
source_spec: ../../../../../05-modules/05-transport/transport-order-management.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 6 — Driver — Trip Start — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Driver portal / **My Trips** (admin driver views where implemented)

Scope: **Driver** viewing and starting assigned RM TO after Driver Supervisor dispatch. Primary surface may be driver admin or API — MCP asserts admin-accessible driver trip UI where available.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Driver sees RM TO in My Trips after dispatch | RM TO **Ready for Dispatch** assigned to driver. As **Driver** (`driver1.nourish@yopmail.com`), open **My Trips** / driver TO queue. Assert TO visible with **Ready for Dispatch**. | P0 | Planned |
| TC02 | Driver cannot start trip before dispatch | TO **Assigned** (not dispatched). Assert **Start Trip** absent/disabled. | P0 | Planned |
| TC03 | Driver starts trip after dispatch | On dispatched TO, click **Start Trip**. Assert success; TO status **Driving Towards Source** (`driving_towards_source`) for `rm_inbound`. | P0 | Planned |
| TC04 | RM driver routes to Source POI first | After trip start, assert next leg / navigation context shows **Source POI** (port) as first destination — not destination mill. Confirms source-first RM routing (`FIRST_DRIVER_TRANSITION` for `rm_inbound`). | P0 | Planned |
| TC05 | RBAC — driver sees only own trips | Driver A logged in; TO assigned to Driver B not listed. | P0 | Planned |
| TC06 | Audit captures trip start | After TC03, admin History / milestone log shows trip start with driver user and timestamp. | P1 | Planned |

## Implementation Notes

- *Rewrite RM_061–066:* mobile-native GPS navigation is out of MCP scope — assert status transition and displayed POI labels on admin driver surface.
- Trip start service: `apps/transport/trip_start_service.py` → `driving_towards_source` for `rm_inbound`.

### Original ID map

| Legacy | TC |
|--------|-----|
| RM_061–RM_066 | TC01–TC06 |
