---
module: 05-transport
specification: Raw Materials Workflow — Section 3 — Transport Planner TO Creation & Live Map — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TO-02, TRQ-02
source_spec: ../../../../../05-modules/05-transport/transport-order-management.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 3 — Transport Planner — TO Creation (Port Consignment) — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Transport → **Live GPS** (3A) · **Transport orders → Add** → select Port TR (3B)

Scope: **Transport Planner** creating RM / Port Consignment TOs against TRs in **Available for Transport Planning**. Own Fleet planning is §4.

## 3A — Live Map Dashboard

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | TP can access Live Map Dashboard | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), open **Transport → Live GPS** (`/admin/tracking/live-gps/`). Assert page loads with map container. *GPS marker fidelity depends on seed — assert page access.* | P1 | Planned |
| TC02 | Live Map vehicle detail panel | On Live GPS, if markers exist, click a vehicle marker. Assert side panel shows vehicle id and status. *Demote to smoke if no GPS seed.* | P2 | Planned |

## 3B — TO creation (Port Consignment)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | TP selects Port TR for planning | With Port TR **Available for Transport Planning** (§2), as TP open **Transport orders → Add** → `/admin/transport/transportorder/select-tr/`, filter/select Port TR, **Continue**. Assert **Create Transport Order** at `create-from-tr/<tr_id>/` with port consignment header (B/L, LC, vessel, container, cargo qty) read-only. | P0 | Planned |
| TC04 | TP creates single Own Fleet TO | **Number of TOs** = 1, **Fleet type** = **Own Fleet**, select **Vehicle type**, allocate full TR qty, future **Planned delivery date/time**, optional **C&F Clearance Note** if field present. Click **Create Transport Order**. Assert `to_number`; status **Created** (`created`); `flow_lane = rm_inbound`. | P0 | Planned |
| TC05 | TP creates multiple TOs (split quantity) | TR qty 100: **Number of TOs** = 2, allocate 60 and 40. Assert two TOs **Created** with correct quantities. | P0 | Planned |
| TC06 | Sum of TO allocations cannot exceed TR quantity | TR remaining 50: attempt allocate 70. Expected: validation `exceeds remaining`; save blocked. | P0 | Planned |
| TC07 | C&F Clearance Note captured at TO creation | Set **C&F Clearance Note** (Yes/No) on RM TO create form if exposed; save. Assert value on TO change view. *Drop if field not on admin create template — note in RESULTS.* | P1 | Planned |
| TC08 | Fleet Type — Own Fleet or Vendor Fleet only | Open **Fleet type** dropdown. Assert only **Own Fleet** and **Vendor Fleet**. | P0 | Planned |
| TC09 | Port consignment header fields read-only | Attempt to edit B/L or Vessel on create-from-TR. Assert display-only header; allocation table not free-text product entry. | P0 | Planned |
| TC10 | TO status Created immediately after save | After successful save, assert badge **Created** — no Draft state on create path. | P0 | Planned |
| TC11 | Mandatory field validation on TO creation | Leave **Fleet type** or **Number of TOs** blank; submit. Expected: field errors; no TO created. | P0 | Planned |

## Implementation Notes

### Key URLs

| Action | Path |
|--------|------|
| Select TR | `/admin/transport/transportorder/select-tr/` |
| Create from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| TO changelist | `/admin/transport/transportorder/` |
| Live GPS | `/admin/tracking/live-gps/` |

### Prerequisites

- Port TR in `available_for_transport_planning` (§2).

### Original ID map

| Legacy | TC | Verdict |
|--------|-----|---------|
| RM_027 | TC01 | Keep |
| RM_028 | TC02 | Keep (P2) |
| RM_029 | TC03 | Keep |
| RM_030 | TC04 | Keep |
| RM_031 | TC05 | Keep |
| RM_032 | TC06 | Keep |
| RM_033 | TC07 | Keep / demote if field absent |
| RM_034 | TC08 | Keep |
| RM_035 | TC09 | Keep |
| RM_036 | TC10 | Keep |
| RM_037 | TC11 | Keep |
