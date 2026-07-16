---
module: 08-fleet-management
specification: Finished Goods Driver Supervisor Dispatch Queue & Driver Management - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DS-01, DS-02, FB-004, FB-008, FB-011, DFS-050
source_spec: ../../05-modules/08-fleet-management/driver-supervisor-operations.md
last_updated: 2026-07-15
playwright_mcp: true
---

# Finished Goods — Driver Supervisor Dispatch & Driver Management - E2E Scenario Plan (Django Admin SSR)

Scope: **Driver Supervisor** viewing the **Dispatch queue**, releasing own-fleet **Assigned** TOs via **Start inspection** or **Skip inspection & dispatch**, completing the pre-dispatch checklist, FB-011 active-TO exclusivity on dispatch, plus **Driver Attendance** and **Driver Leave Management**. Gate / Scale / CC / Driver trip start / maintenance clearance queue are out of scope except menu smoke if needed.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & queue

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Driver Supervisor sees Fleet + Driver Management menus | As **Driver Supervisor** (`driver.supervisor1@yopmail.com`), log in at `/admin/login/`, select working site if prompted. Assert sidebar **Fleet operations** shows **Dispatch queue**, **Under Maintenance**, and **Inspection records**. Assert **Driver Management** shows **Driver Attendance** and **Driver Leave Management** as separate rows (not a single combined “Attendance” page). | P0 | Planned |
| TC02 | Dispatch queue lists Assigned own-fleet TOs with vehicle/driver | Prerequisite: at least one **Own Fleet** TO with status **Assigned** (`assigned`), vehicle + driver set, planned milestones complete. As DS, open **Fleet operations → Dispatch queue** (`/admin/fleet_supervisor/vehicleinspection/dispatch-queue/`). Assert page title **Supervisor dispatch queue**. Assert the TO row shows columns **TO**, **Fleet**, **Vehicle**, **Driver**, **Planned dest. arrival**, **Inspection**, **Actions**. Assert Inspection badge **Not started** (or **Pending** if checklist already open). Assert action controls **Start inspection** and **Skip inspection & dispatch** are present when writable. | P0 | Planned |
| TC03 | Non-Assigned TOs do not appear on Dispatch queue | Prerequisite: an Own Fleet TO still **Created** (`created`) or **Under Planning** (`under_planning`) (planning incomplete / not Assigned). As DS, open **Dispatch queue**. Assert that TO’s `to_number` is **absent**. Only `status=assigned` + own fleet + vehicle + driver rows appear (`supervisor_dispatch_queue_queryset`). | P0 | Planned |

## Dispatch happy paths

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Start inspection → Complete inspection & dispatch | Prerequisite: Assigned Own Fleet TO on Dispatch queue, Inspection **Not started**, resources not actively serving elsewhere. As DS: click **Start inspection** (confirm dialog if shown). Assert redirect to pending Vehicle Inspection change form with **Vehicle Checklist** inline (OK / Issue / N/A per line). Optionally adjust line outcomes/remarks. Click **Complete inspection & dispatch** (confirm). Assert success (message may say Released / Dispatched / Ready for Dispatch). Open the TO (Transport orders change/list or re-check queue): status badge **Ready for Dispatch** (`ready_for_dispatch`). Assert TO no longer on Dispatch queue (queue is Assigned-only). | P0 | Planned |
| TC05 | Skip inspection & dispatch | Prerequisite: Assigned Own Fleet TO on Dispatch queue with no pending inspection. As DS: click **Skip inspection & dispatch** (confirm). Assert success message indicating release / ready for dispatch (inspection skipped). Assert TO status **Ready for Dispatch** (`ready_for_dispatch`) and TO gone from Dispatch queue. | P0 | Planned |

## Inspection checklist

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Checklist uses seeded section/item catalogue | From TC04 path (Start inspection), assert checklist lines are the seeded catalogue grouped under sections such as **Engine**, **Clutch**, **Gear Box**, **Container**, **Electric**, **Chassis**, **Cabin** (54 items). Do **not** require legacy PRD fields **Fuel Level**, **Vehicle Condition**, or **Driver Acknowledgement** as form labels. | P0 | Planned |
| TC07 | Save alone does not release TO; Complete does | On a **Pending** pre-dispatch inspection: click ordinary **Save** (without **Complete inspection & dispatch**). Assert inspection remains **Pending** and linked TO stays **Assigned** (`assigned`). Then click **Complete inspection & dispatch** and assert TO → **Ready for Dispatch**. *Note:* response rows are auto-created as **OK** on start (`ensure_checklist_responses_for_inspection`); MCP cannot easily leave “missing” lines via UI alone — assert release is gated on the Complete submit, not blank Fuel Level fields. | P0 | Planned |

## Active-TO exclusivity (FB-011)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Block dispatch when driver/vehicle actively serving elsewhere | Prerequisite: Driver X / Vehicle Y already on TO-A with an actively serving status (`ready_for_dispatch` or later execution status). TO-B is **Assigned** with the same Driver and/or Vehicle and appears on Dispatch queue. As DS on TO-B, attempt **Skip inspection & dispatch** (and/or **Start inspection**). Assert error message(s) matching implemented copy, e.g. `Vehicle <…> is already actively serving another Transport Order.` and/or `Driver <…> is already actively serving another Transport Order.` — **not** the legacy PRD string (“Cannot dispatch until the active TO is completed and closed”). TO-B remains **Assigned**. | P0 | Planned |
| TC09 | Dispatch allowed after previous TO leaves actively-serving set | Prerequisite: after TC08, move prior TO-A out of actively serving statuses (e.g. cancel, or progress to terminal `completed` / `bill_disbursed` / `closed` via fixture roles — document exact path used). As DS, retry **Skip inspection & dispatch** (or Start + Complete) on TO-B. Assert dispatch succeeds and TO-B → **Ready for Dispatch**. | P0 | Planned |
| TC10 | Second dispatch blocked while first TO still Ready for Dispatch | After successful dispatch of TO-A to **Ready for Dispatch**, with same vehicle/driver still on Assigned TO-B: attempt dispatch on TO-B. Assert exclusivity error (same message family as TC08). Optional cross-check as Tenant Admin on **Master Data → Vehicles**: vehicle ops status is **Scheduled** (or **In-transit** after trip start), not a legacy label **Available** / **Active**. DS seed role has no Vehicles master menu — do not require DS to open Vehicles. | P0 | Planned |

## Driver Attendance & Leave

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Record Driver Attendance | As DS, open **Driver Management → Driver Attendance** (`/admin/fleet_supervisor/driverattendance/`), click **Add**. Select a seeded **Driver**, **POI**, set **Entry datetime** and **Exit datetime** (exit after entry), set/confirm **Date**, optional notes with `MCP ATT <RUN_ID>`, save. Assert success and row on changelist with driver, POI, date, entry/exit, computed working hours when both times set. | P0 | Planned |
| TC12 | Register Driver Leave (start/end dates) | As DS, open **Driver Management → Driver Leave Management** (`/admin/fleet_supervisor/driverleave/`), click **Add**. Select a **Driver** who is not blocked by an active TO (service guards leave that starts today/earlier while driver assigned elsewhere). Set **Start date** and **End date** (end ≥ start), optional **Reason** `MCP LV <RUN_ID>`, save. Assert success; list shows leave with status badge **Active** or **Upcoming** (`leave_status`) for the date range. Do **not** assert editing a Driver master “status = On Leave” field on this screen — leave is this model, and driver `current_state` may transition to **On Leave** when start ≤ today. | P0 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: DS Dispatch queue, Start / Skip inspection paths, checklist complete release, Assigned-only queue filter, FB-011 dispatch exclusivity messages, Driver Attendance add, Driver Leave add.
- Out of scope: Maintenance clearance queue workflows, Reject inspection full cascade (optional later), Driver mobile Trip Start, Gate/Scale/CC, TP TO planning creation (fixture via TP), Audit Log UI assertions, XSS/SQLi, email/notification AC, Port/RM variants.
- Dropped: legacy Audit Log path (FG_DS_011) — `driver_supervisor` seed has no `MENU_AUDIT_LOGS_VIEW`; audit writes are best-effort in services and not verifiable as that actor in SSR.

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Driver Supervisor | `driver.supervisor1@yopmail.com` | Primary actor |
| Transport Planner | `transport.planner1@yopmail.com` | Fixture: Own Fleet TO → Assigned (vehicle, driver, milestones) |
| Tenant Admin | `admin@yopmail.com` | Optional: Vehicles ops status check (TC10); cancel/close fixture TOs |
| Upstream PR/TR chain | Depot / Distribution Officer / Manager | Only if no Assigned TO exists yet |

Passwords: `docs/testing/playwright-mcp-credentials.yaml` (`Nourish@1234!` for operational roles).

### Fixture chain

1. Upstream: submitted FG PR → TR → DM approve → Available for Planning (if needed).
2. Transport Planner: Create Own Fleet TO → set Vehicle + Driver + all required planned milestones → **Assigned**.
3. For TC08–TC10: need two Assigned Own Fleet TOs sharing vehicle and/or driver (FB-011 allows planning-stage reuse); then dispatch the first to put resources in `ready_for_dispatch`.
4. Prefer one `RUN_ID` per MCP session for free-text notes (`MCP DS <RUN_ID>`).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| Dispatch queue | `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/` — **Fleet operations → Dispatch queue** |
| Start inspection | submit `action=start_inspection` — button **Start inspection** |
| Skip dispatch | submit `action=skip_inspection` — button **Skip inspection & dispatch** |
| Continue checklist | link **Continue checklist** when Inspection **Pending** |
| Complete & dispatch | `_submit_inspection` — **Complete inspection & dispatch** |
| Inspection records | `/admin/fleet_supervisor/vehicleinspection/` |
| Driver Attendance | `/admin/fleet_supervisor/driverattendance/` |
| Driver Leave | `/admin/fleet_supervisor/driverleave/` |

Queue columns (implemented): TO, Fleet, Vehicle, Driver, Planned dest. arrival, Inspection, Actions — not a free-form “Actions menu” accordion.

### Status & wipe notes

- Assert UI **Ready for Dispatch** and enum `ready_for_dispatch` after successful skip or complete path.
- Queue membership: only `assigned` + `fleet_type=own` + vehicle + driver.
- Actively serving (blocks dispatch): `ready_for_dispatch`, `driving_towards_source`, `at_source`, `loaded_pickup_completed`, `driving_towards_destination`, `at_destination`, `in_progress`.
- `to_number` is system-generated; track by number / session for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`. Attendance / leave rows with `MCP … <RUN_ID>` notes are wipe-friendly.

### Known implementation alignment / gaps

| Topic | Legacy FG_DS expectation | Current admin |
|-------|--------------------------|---------------|
| Nav labels | Fleet Operations → Dispatch Queue | **Fleet operations → Dispatch queue** |
| Action labels | Start Inspection and Dispatch / Skip … / Dispatch | **Start inspection**; then **Complete inspection & dispatch**; **Skip inspection & dispatch** |
| Post-dispatch status | Ready for Dispatch | `ready_for_dispatch` — correct |
| Exclusivity message | Fixed PRD sentence about Active TO | `Vehicle/Driver … is already actively serving another Transport Order.` |
| Checklist fields | Fuel Level, Vehicle Condition, Driver Ack | Seeded 54-item / 7-section catalogue; lines OK/Issue/N/A |
| Incomplete checklist | Block until all items filled | Rows auto-seeded as OK; Complete submit gates release |
| Vehicle availability | “Available” flips off | Ops statuses **No Active TO** / **Scheduled** / **In-transit**; exclusivity enforced at dispatch |
| Leave UX | Set driver status On Leave on Driver Management | Separate **Driver Leave Management** add form (start/end dates) |
| Audit Log | DS-visible Audit Logs | No menu perm on DS seed — dropped |

### Original ID map (FG_DS → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_DS_001 | TC02 | Columns + nav labels matched to `dispatch_queue.html` |
| FG_DS_002 | TC04 | Split Start inspection vs Complete inspection & dispatch |
| FG_DS_003 | TC05 | Button label **Skip inspection & dispatch** |
| FG_DS_004 | TC08 | Implemented exclusivity wording (FB-011) |
| FG_DS_005 | TC09 | Actively-serving exit (not PRD “Closed” only) |
| FG_DS_006 | TC03 | Unchanged intent; wording uses Created/Under Planning |
| FG_DS_007 | TC06 | Seeded checklist catalogue, not Fuel Level triad |
| FG_DS_008 | TC07 | Save vs Complete gate; auto-OK note |
| FG_DS_009 | TC04 / TC05 | Folded into happy-path status asserts |
| FG_DS_010 | TC10 | Exclusivity + optional Scheduled status (not Available) |
| FG_DS_011 | — | Dropped (no DS Audit Log SSR access) |
| FG_DS_012 | TC11 | **Driver Attendance** admin add form |
| FG_DS_013 | TC12 | **Driver Leave Management** add (not driver status field) |
| — | TC01 | Added (portal nav smoke) |

### Suggested next step

Run Playwright MCP against this file (TC01 → TC03, then TC05 skip path, then TC04+TC06+TC07, then TC08–TC10, then TC11–TC12), persist results under `tests/e2e/playwright-mcp/fg-ds-dispatch-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
