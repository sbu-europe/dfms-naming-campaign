---
module: 05-transport
specification: Finished Goods Workflow — Section 4 — Transport Planner TO Creation & Planning — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TO-01, TRQ-01, FB-004, FB-011
source_spec: ../../../../05-modules/05-transport/transport-order-management.md
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 4 — Transport Planner — TO Creation & Planning — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Transport → **Live GPS** (4A) · **Transport requests** → **Create TO** / **Transport orders** → **Add** (4B–4C) · **Vehicle planning** (alternate assign path)

Scope: **Transport Planner** creating and planning Own Fleet TOs against DM-approved FG TRs. Vendor fleet happy path smoke only where noted. Yard execution and Driver Supervisor dispatch are Sections 5–6.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## 4A — Live Map Dashboard (pre-planning visibility)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | TP can access Live Map Dashboard | As **Transport Planner** (`transport.planner1@yopmail.com`), open **Transport → Live GPS** (`/admin/tracking/live-gps/`). Assert page title **Live GPS** loads (map container present). *GPS marker fidelity depends on seed tracking data — assert page access, not live coordinates.* | P1 | Planned |
| TC02 | Live Map vehicle detail panel | On Live GPS, if seeded markers exist, click a vehicle marker. Assert side/detail panel shows vehicle identifier and status fields. *Demote to smoke if no GPS seed.* | P2 | Planned |
| TC03 | RBAC — Live Map denied to Depot Officer | As **Depot Officer** (`depot.officer1@yopmail.com`), assert **Live GPS** menu absent; direct `/admin/tracking/live-gps/` → permission denied or redirect. | P0 | Planned |

## 4B — TO creation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | TP selects Available-for-Planning TR | With TR in **Available for Transport Planning** (Section 3), as TP open **Transport orders → Add** → select TR (`/admin/transport/transportorder/select-tr/`). Click **Continue**. Assert **Create Transport Order** form at `create-from-tr/<tr_id>/` with TR summary (Source/Destination POI, Total Quantity, Delivery Date) and **Allocate Quantities per Product** table (read-only product lines with editable **Allocate**). | P0 | Planned |
| TC05 | TP creates single TO (Own Fleet) | On create-from-TR: **Number of TOs** = 1, **Fleet type** = **Own Fleet**, select **Vehicle type**, allocate full remaining TR qty, future **Planned delivery date/time**, click **Create Transport Order**. Assert `to_number` created; status **Created** (`created`). | P0 | Planned |
| TC06 | TP creates multiple TOs (split quantity) | Same TR with qty 100: **Number of TOs** = 2, allocate 60 and 40 per TO (via per-line allocate × count rules). Assert two `TO-…` records, each **Created**, quantities sum to TR allocation. | P0 | Planned |
| TC07 | Allocated TO qty cannot exceed TR remaining | TR with 50 units remaining: attempt allocate 70 on create form. Expected: validation `exceeds remaining` / save blocked. | P0 | Planned |
| TC08 | Fleet Type — Own Fleet or Vendor Fleet only | Open **Fleet type** dropdown on create-from-TR. Assert exactly **Own Fleet** and **Vendor Fleet** (`OWN` / `VENDOR`). | P0 | Planned |
| TC09 | Vehicle Type and Vehicle optional at TO creation (Own Fleet) | **Fleet type** = Own Fleet; leave **Vehicle** blank; select **Vehicle type**; valid allocation; save. Assert TO **Created** successfully. | P0 | Planned |
| TC10 | Product fields inherited read-only from TR | On create-from-TR allocation table, assert product code/name, UOM, TR qty columns are display-only (not free-text editable product master fields). | P0 | Planned |
| TC11 | TO status Created immediately (not Draft) | After successful save, assert status badge **Created** — no **Draft** status or **Save as Draft** button on TO create path. | P0 | Planned |
| TC12 | Fleet availability (API / advisory) | *Rewrite FG_TP_012: admin create form shows **Vehicle capacity** under vehicle dropdown; fleet count panel is API `GET /api/v1/fleet/availability` — not a dedicated MCP panel. Assert vehicle dropdown populates for selected type; optional API check out of MCP scope.* | P2 | Planned |
| TC13 | TO cannot be created without valid TR | As TP, navigate to `/admin/transport/transportorder/create-from-tr/<random-uuid>/`. Expected: 404 or error redirect — no TO created. *Rewrite from API-only FG_TP_013.* | P1 | Planned |
| TC14 | Single Fleet Type per TO | On create form, **Fleet type** is a single-select radio/select — cannot post both OWN and VENDOR for one TO. | P0 | Planned |
| TC15 | Mandatory fields on TO creation | Leave **Fleet type** or **Vehicle type** (when required) blank; submit. Expected: field errors; no TO created. **Number of TOs** must be ≥ 1. | P0 | Planned |
| TC16 | New TO appears in TP planning queue | After TC05, open **Transport → Transport orders**. Assert new `to_number` with TR reference, **Own Fleet**, allocated qty/weight, status **Created**. | P0 | Planned |

## 4C — TO planning (Own Fleet)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC17 | TP enters all 5 planned milestone datetimes | Open **Created** Own Fleet TO change form. In **Planned Milestones** fieldset, enter **Trip start** + matrix **Arrival/Departure** at **Source** and **Destination** (5 datetime fields). Save. Assert values persist on reload. | P0 | Planned |
| TC18 | Chronological validation on planned milestones | Enter **Planned source departure** before **Planned source arrival**. Save with full assignment intent. Expected: validation error on milestone sequence. | P1 | Planned |
| TC19 | Driver status visible in assignment dropdown | Open **Driver** dropdown on TO change form. Assert options show driver name + status suffix (e.g. Available / On Trip). | P1 | Planned |
| TC20 | Vehicle status visible in assignment dropdown | Open **Vehicle** dropdown. Assert registration + operational status (e.g. No Active TO / In Transit). | P1 | Planned |
| TC21 | Assign available Driver and free Vehicle | Select active **Vehicle** (not under maintenance) and **Driver** (not on leave); save. Assert assignments persisted on TO. | P0 | Planned |
| TC22 | Assign Helper to TO | Select **Helpers** (M2M) on Own Fleet Assignment fieldset; save. Assert helper linked. | P1 | Planned |
| TC23 | TO stays Created until planning complete | Assign **Vehicle** only (no driver / incomplete milestones); save. Assert status remains **Created** (not **Assigned**). | P0 | Planned |
| TC24 | TO becomes Assigned when Vehicle + Driver + 5 milestones complete | Complete vehicle, driver, and all five planned datetimes; save. Assert status auto-promotes to **Assigned** (`assigned`) per `sync_own_fleet_assignment_status`. | P0 | Planned |
| TC25 | Under-maintenance vehicles excluded | Vehicle with maintenance flag inactive in queryset — assert not selectable in **Vehicle** dropdown. | P1 | Planned |
| TC26 | On-leave drivers excluded | Driver on leave — assert absent from **Driver** dropdown or blocked on save with validation error. | P1 | Planned |
| TC27 | Double-booking allowed for future planning (FB-011) | With Driver/Vehicle active on TO-1, assign same resources to TO-2 in **Created**; save succeeds. *Dispatch conflict enforced later at Driver Supervisor release (Section 5).* | P1 | Planned |
| TC28 | Partial planning persists across sessions | Save TO with only **Trip start** filled; re-open TO. Assert previously entered milestone retained. | P1 | Planned |
| TC29 | Incomplete planning blocks Assigned transition | Driver assigned, vehicle missing (or milestones incomplete); assert status stays **Created** and readiness panel lists missing fields. | P0 | Planned |
| TC30 | RBAC — Own Fleet planning TP-only | As **Driver Supervisor** (`driver.supervisor1@yopmail.com`), attempt TO change form assignment fields on Own Fleet TO. Expected: read-only or permission denied — planning is **Transport Planner** (+ tenant admin), not supervisor. | P0 | Planned |
| TC31 | Audit trail for TO create/plan | After TC24, as **Tenant Admin**, open TO **History** and verify **Added** + **Changed** log entries for create and assignment. *Rewrite FG_TP_031: per-field Audit Logs menu not written for admin SSR.* | P1 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Prerequisites

- Approved FG TR (**Available for Transport Planning**) from Section 3.
- Seed vehicles (`CTG-…`), drivers (`driver1@yopmail.com` profile), helpers, vehicle types.

### Key URLs

| Action | Path |
|--------|------|
| Select TR | `/admin/transport/transportorder/select-tr/` |
| Create from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| TO changelist | `/admin/transport/transportorder/` |
| Vehicle planning | `/admin/transport/vehicle-planning/` |
| Live GPS | `/admin/tracking/live-gps/` |

### Known gaps / rewrites

| Legacy | Note |
|--------|------|
| FG_TP_012 | Fleet count panel — API only; vehicle dropdown capacity hint on form |
| FG_TP_013 | Rewritten to invalid `create-from-tr` UUID |
| FG_TP_030 | Driver Supervisor denied TO planning write |
| TR vehicle count | Never on TR — use **Number of TOs** (1–20) |

### Original ID map

| Legacy | TC | Verdict |
|--------|-----|---------|
| FG_TP_001–003 | TC01–TC03 | Keep / demote TC02 |
| FG_TP_004–016 | TC04–TC16 | Keep; TC12 rewrite |
| FG_TP_017–031 | TC17–TC31 | Keep; TC31 rewrite |

### Suggested next step

Chain after Section 3 approval; artifacts `tests/e2e/playwright-mcp/fg-tp-to-artifacts/RESULTS.md`.
