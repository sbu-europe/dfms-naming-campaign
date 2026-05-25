---
jira_key: DFS-050
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DS-01
title: Driver Supervisor — Vehicle Licence, Health & Handover Checklists
epic: Driver Supervisor & Crew
status: Pending
story_points: 5
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.6.1.2 Vehicle License and Health Management (Phase 1)"
---

# DS-01 — Vehicle Licence, Health & Handover Checklists

## User Story

**As a** Driver Supervisor  
**I want to** optionally run a full vehicle inspection checklist after TDO (Own Fleet) has assigned vehicle, driver, helper(s), and ETA to a TO, then either release the TO to **Dispatch** or, if inspection fails, park the vehicle in **Under Maintenance** and send the TO back for replanning  
**So that** dispatch is not blocked when inspection is unnecessary or waived, while unsafe vehicles are removed from service with a clear audit trail and the TO is returned to **Under Planning** for TDO to reassign resources

**As a** Driver Supervisor  
**I want to** see all vehicles currently in **Under Maintenance**, re-run the daily inspection checklist after repairs, and — when the vehicle passes — set it back to **Available** for TDO assignment  
**So that** maintained vehicles re-enter the fleet only after a documented sign-off, without relying on master-data admin or informal status changes

## Business Context

PRD §6.6.1.2 (Phase 1) separates **operational readiness** from master registration (MDM-05, Sprint 2). This story refines **who** moves an assigned TO toward execution and **how** the vehicle checklist fits in.

**Upstream handover (TDO — Own Fleet)**  
Before the Driver Supervisor acts, the TDO (Own Fleet) must complete assignment on the TO: **vehicle**, **driver**, **helper(s)**, and **ETA**. Until those are recorded, the TO is not in the Driver Supervisor’s dispatch-readiness queue.

**Driver Supervisor — gate to Dispatch**  
Once the TO is fully assigned, the Driver Supervisor is responsible for progressing it toward **Dispatch** (releasing the TO for operational dispatch / driver execution — align exact status label with TO and Trip models, e.g. transition into the dispatch-released state used by DM/driver apps).

**Decision before Dispatch: checklist or skip**  
Immediately before setting the TO to **Dispatch**, the Driver Supervisor **chooses**:

| Choice | Behaviour |
|--------|-----------|
| **Skip checklist** | Supervisor may transition the TO to **Dispatch** without opening or submitting a checklist. No inspection record is required for that path. |
| **Proceed with checklist** | Supervisor completes the predefined daily inspection for the **vehicle in the context of this TO** (all items, remarks as defined in AC-1). After all items are reviewed, the supervisor records an outcome: |

**Outcome when checklist was used**

| Outcome | Vehicle | Transport Order (TO) |
|---------|---------|----------------------|
| **Vehicle OK** | Remains in normal operational status (no maintenance flag from this flow). | Supervisor may transition TO to **Dispatch**. |
| **Vehicle not OK** | Vehicle status → **Under Maintenance** (excluded from new TDO assignment until cleared). | TO status → **Under Planning** — assignment is effectively rolled back for replanning; TDO must reassign vehicle, driver, helper, and ETA when a substitute vehicle is available. |

**Implementation alignment (for dev / PO)**  
- Today’s codebase may use `Assigned` → `Ready for Dispatch` before execution; this story allows **either** retaining `Ready for Dispatch` as an optional intermediate **or** collapsing so the supervisor’s “Dispatch” action is the single gate after `Assigned` — **confirm** with transport-order and trip state diagrams.  
- **Under Planning** on the TO is the **business** target when inspection fails; if the TO entity has no `under_planning` enum yet, map to the agreed technical state (e.g. extend `TOStatus`, or equivalent rollback to a planning queue) without changing the business rule above.  
- **Under Maintenance** spelling is canonical for the vehicle master / operational flag.

**Return to service (Driver Supervisor — maintenance queue)**  
Vehicles enter **Under Maintenance** from this story’s inspection **not OK** path, from `POST …/under-maintenance`, or from master-data rules (e.g. `is_active=False`). The Driver Supervisor needs a dedicated view of **under-maintenance** vehicles (same POI / own-fleet scope as other supervisor queues) to close the loop:

| Step | Behaviour |
|------|-----------|
| **List** | Supervisor sees vehicles with `operational_status` = **Under Maintenance** (registration, fleet/POI, date flagged, last inspection outcome if any). |
| **Re-inspect** | Supervisor starts a **new** daily inspection for that vehicle using the **same predefined checklist** (AC-1). Context is **return-to-service** — no TO in **Ready for Dispatch** is required or created. |
| **Pass** | On **Vehicle OK** (all items reviewed per AC-1 rules): vehicle `operational_status` → **Available**; inspection stored with type/context indicating **maintenance clearance** (distinct from pre-dispatch inspection on a TO). |
| **Fail** | On **Vehicle not OK**: vehicle **remains** **Under Maintenance**; inspection rejected with reason; vehicle stays excluded from TDO assignment. |

**Product rules (return-to-service)**  
- Clearing maintenance is **only** via a **passed** re-inspection on this path (no “set available” without checklist completion).  
- Vehicles with `is_active=False` in MDM may still appear in the list for visibility but **cannot** be set to **Available** until reactivated in master data — surface a clear blocking message.  
- Re-inspection does **not** auto-reassign any TO; TDO replans **Under Planning** orders separately when a substitute or this vehicle is ready.

## Acceptance Criteria

### AC-1: Predefined daily inspection checklist
- [x] System provides a **single generalised daily inspection checklist** (no short-distance / long-distance distinction) — `apps/fleet_supervisor` + migration `0002_seed_checklist.py`
- [x] The checklist is predefined with the following sections and items; each item has a **Remarks** field (per-line on `ChecklistResponse`; template text on `ChecklistItem` where seeded):

| Section | # | Item |
|---------|---|------|
| **Engine** | 1 | Engine Oil |
| | 2 | Air Filter |
| | 3 | Fuel Pump |
| | 4 | Fuel System |
| | 5 | Brake System |
| | 6 | R.P.M |
| | 7 | Brake Oil |
| | 8 | Radiator Water |
| | 9 | Air System |
| **Clutch** | 1 | Ease in Engagement |
| | 2 | Lubrications |
| | 3 | Paddle Free Play |
| | 4 | Clutch Master Cylinder |
| | 5 | Clutch Release Cylinder |
| | 6 | Clutch Paddle |
| **Gear Box** | 1 | Different Types |
| | 2 | Temperature |
| | 3 | Noise |
| | 4 | Oil Leakage |
| | 5 | Gear Shifting |
| **Container** | 1 | Inside of Container |
| | 2 | Container Door |
| | 3 | Container Floor |
| | 4 | Rear Bumper |
| | 5 | Mudguard R/S |
| | 6 | Air Cutter |
| **Electric** | 1 | Head Light R/S |
| | 2 | Battery Water |
| | 3 | Parking Light Front RS & LS |
| | 4 | Parking Light Rear RS & LS |
| | 5 | Indicator Light Front RS & LS |
| | 6 | Indicator Light Rear RS & LS |
| | 7 | Back Light RS & LS |
| | 8 | Brake Light RS & LS |
| | 9 | Fuse Board |
| | 10 | Alternator |
| | 11 | Self |
| | 12 | Cabin Light |
| | 13 | Container Inside Light |
| **Chassis** | 1 | Chassis |
| | 2 | Chassis Nut & Bolt |
| | 3 | All U Bolt |
| | 4 | Leaf Spring |
| | 5 | Leaf Spring Hanger |
| **Cabin** | 1 | Door RS & LS |
| | 2 | Door Lock RS & LS |
| | 3 | Foot Rest RS & LS |
| | 4 | Looking Glass RS & LS |
| | 5 | Door Glass RS & LS |
| | 6 | Cabin Ventilator Glass |
| | 7 | Windshield |
| | 8 | Front Bumper |
| | 9 | Front Plastic Bonnet |
| | 10 | Driver and Helper Sit |

- [x] Checklist sections and items are **predefined and immutable** — no user can modify them (`ReadOnlyFleetAdmin` on reference models)

### AC-2: Preconditions, optional checklist, and transition to Dispatch
- [x] A TO appears in the **Driver Supervisor dispatch-readiness queue** when the TO is **`ready_for_dispatch`** (after TDO flow has assigned vehicle, driver, helpers, and ETA — see `TDOAssignmentService` / transport). **Note:** implementation uses **Ready for Dispatch**, not “Assigned-only”; see mismatch report below.
- [x] Driver Supervisor may transition the TO to **Dispatch** **without** completing a checklist (**skip path**) — `supervisor_dispatch_intent(..., "skip_inspection")` / admin dispatch queue
- [x] If the supervisor **chooses** the checklist path: they complete the daily inspection for the **vehicle + TO** context — remarks per item — then **complete** (vehicle OK path) or **reject** with reason (vehicle not OK path). Per-line outcomes are **`ok` / `issue` / `na`** on `ChecklistResponse` (not a single “Vehicle OK” button; completion implies OK for dispatch).
- [x] On **Vehicle OK** (checklist path): completing inspection transitions TO to **Dispatched** (`complete_inspection` → `dispatch_to_after_ready`)
- [ ] On **skip path**: no inspection payload is required; **mandatory audit field** recording that checklist was skipped (who / when) is **not** implemented in `fleet_supervisor` services beyond TO/trip status transitions — see mismatch report
- [x] Each **completed** checklist submission stores: vehicle ID, TO ID, item-level remarks and status (`ChecklistResponse`), supervisor and timestamps on `VehicleInspection`; full row history retained in DB (section is implied via `ChecklistItem` → `ChecklistSection`)

### AC-3: Vehicle status — Under Maintenance & TO → Under Planning
- [x] When checklist outcome is **Vehicle not OK** (`reject_inspection`): vehicle → **Under Maintenance**; linked TO → **`under_planning`**; vehicle/driver cleared; helpers cleared
- [x] Vehicle in **Under Maintenance** is **excluded** from new TDO assignment (`TDOAssignmentService.assign_vehicle`)
- [x] Partial checklist save is allowed (admin/API can save responses while **pending**); **Dispatch** and **reject** finalisation only when completeness / business rules are met (`complete_inspection` / `reject_inspection`)

### AC-4: Under Maintenance vehicle list (Driver Supervisor)
- [x] Driver Supervisor has a **maintenance queue** listing vehicles with `operational_status` = **Under Maintenance**, scoped to **own fleet / supervisor POI** (consistent with inspection dispatch queue).
- [x] Each row shows at minimum: vehicle registration (or display ID), operational status, **since** (when status became under maintenance, or last status-change timestamp), and **last inspection** summary (date, outcome: rejected / n/a if none).
- [x] List supports **search/filter** by registration (and POI if multi-site supervisors exist).
- [x] Vehicles flagged under maintenance only via MDM `is_active=False` appear with an indicator that **master-data reactivation** is required before return-to-service.

### AC-5: Re-inspection and return to Available
- [x] From the maintenance queue, supervisor can **start re-inspection** for a selected vehicle — creates a new `VehicleInspection` using the **same checklist template** (AC-1); inspection purpose/context = **maintenance clearance** (no linked TO required).
- [x] Supervisor completes all checklist items (remarks + per-line `ok` / `issue` / `na` as AC-2); partial save allowed while **pending**.
- [x] On **Vehicle OK** (complete re-inspection): vehicle `operational_status` → **Available**; vehicle is **eligible** again for TDO assignment pickers; inspection record retained with supervisor, timestamps, and item-level responses.
- [x] On **Vehicle not OK** (reject re-inspection): vehicle **stays** **Under Maintenance**; `rejection_reason` captured; no TO or dispatch side-effects.
- [ ] **Audit**: maintenance clearance (pass) and failed re-inspection (reject) are logged (who, when, vehicle ID, inspection ID) — align with DS-01-14.

## Sub-tasks

| # | Sub-task | Jira | Status | Notes |
|---|----------|------|--------|-------|
| DS-01-1 | `ChecklistSection` + `ChecklistItem` models + data migration to seed all 7 sections and predefined items | DFS-050-1 | **Done** | - |
| DS-01-2 | `VehicleInspection` + `ChecklistResponse` models — FK to TO, vehicle, supervisor; optional linkage when checklist skipped; response stores item + remarks + outcome | DFS-050-2 | **Done** | No `VehicleInspection` row on skip path; inspection only when checklist started |
| DS-01-3 | `VehicleInspectionAdmin` — queue: TOs **Assigned** with vehicle, driver, helper, ETA populated (Own Fleet); filters/search as before | DFS-050-3 | **Done** | Queue is **`ready_for_dispatch`**, not Assigned-only |
| DS-01-4 | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` (all items per section); readonly after completion; separate action or flag for **skip checklist → Dispatch** | DFS-050-4 | **Done** | Skip via dispatch queue; checklist via inline + `_submit_inspection` |
| DS-01-5 | Status transitions: **skip** → TO to **Dispatch** (or agreed intermediate); **checklist OK** → TO to **Dispatch**; validate guards vs `TO_STATUS_TRANSITIONS` | DFS-050-5 | **Done** | Both paths to **dispatched** from `ready_for_dispatch` |
| DS-01-6 | Checklist completion with **Vehicle not OK** — persist outcome, set vehicle **Under Maintenance**, transition TO → **Under Planning** (or mapped enum); reason / notes if required by policy | DFS-050-6 | **Done** | `reject_inspection` + reject reason |
| DS-01-7 | Remove or repurpose old “reject → TO stays Assigned” path unless retained for non-maintenance declines; `VehicleAdmin.mark_under_maintenance` + TO rollback service aligned to **Under Planning** | DFS-050-7 | **Pending** | Inspection reject uses **Under Planning**; `mark_vehicle_under_maintenance` still resets **`assigned`** TOs → **`created`** (not Under Planning) |
| DS-01-8 | Inspection / dispatch queue API — `GET` queue (Assigned + full assignment + Own Fleet) | DFS-050-8 | **Done** | `GET …/inspections/queue` filters **`ready_for_dispatch`**; own-fleet + vehicle flagged in payload |
| DS-01-9 | APIs: submit checklist + outcome; **POST** skip-dispatch or **PATCH** TO dispatch with `checklist_skipped: true` (single contract to be agreed) | DFS-050-9 | **Done** | `POST /api/v1/transport-orders/<to_id>/dispatch` body `{"intent":"skip_inspection"|"start_inspection"}`; checklist via `PATCH …/responses` + `POST …/approve` |
| DS-01-10 | Inspection detail API — `GET /api/v1/inspections/{inspection_id}` | DFS-050-10 | **Done** | `PATCH …/responses`, `POST …/approve` |
| DS-01-11 | Deprecate or merge **reject** API with **not OK** + maintenance path | DFS-050-11 | **Done** | `POST …/reject` kept as named endpoint; behaviour matches “not OK” |
| DS-01-12 | **Under Maintenance** API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance` + TO → **Under Planning** (replace “reset to Created” where story supersedes) | DFS-050-12 | **Pending** | API exists; linked **`assigned`** TOs → **`created`**, not **Under Planning** |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template` (read-only) | DFS-050-13 | **Done** | - |
| DS-01-14 | Audit logging: checklist submissions, skip-dispatch, OK / not OK outcomes, Under Maintenance | DFS-050-14 | **Pending** | `log_crud_update` only on `mark_vehicle_under_maintenance`; no audit helper calls on skip/complete/reject |
| DS-01-15 | **Under Maintenance** vehicle list — admin view + `GET` API (own-fleet / POI scope); columns per AC-4 | DFS-050-15 | **Done** | - |
| DS-01-16 | **Re-inspection** flow — start maintenance-clearance inspection (no TO); reuse checklist responses + complete/reject services with purpose flag | DFS-050-16 | **Done** | - |
| DS-01-17 | **Return to Available** — guard `is_active=False`; audit event | DFS-050-17 | **Pending** | MDM guard done; central audit remains pending (DS-01-14) |
| DS-01-18 | Vehicle status update from **Under Maintenance** to **Available** on passed maintenance-clearance re-inspection | DFS-050-18 | **Done** | Applies only after completed checklist; no TO or dispatch side-effects |

## API Endpoints (implemented — `apps/fleet_supervisor/urls.py`)

```
GET    /api/v1/checklist-template
GET    /api/v1/inspections/queue                     # TOs ready_for_dispatch (not Assigned-only)
POST   /api/v1/transport-orders/<uuid:to_id>/dispatch # {"intent":"skip_inspection"|"start_inspection"}
GET    /api/v1/inspections/<uuid:inspection_id>
PATCH  /api/v1/inspections/<uuid:inspection_id>/responses
POST   /api/v1/inspections/<uuid:inspection_id>/approve
POST   /api/v1/inspections/<uuid:inspection_id>/reject
POST   /api/v1/vehicles/<uuid:vehicle_id>/under-maintenance
```

### API Endpoints (planned — maintenance return-to-service)

```
GET    /api/v1/vehicles/under-maintenance              # maintenance queue (AC-4)
POST   /api/v1/vehicles/<uuid:vehicle_id>/re-inspection # start maintenance-clearance inspection (AC-5)
# Reuse existing inspection APIs for responses / approve / reject once inspection_id exists:
PATCH  /api/v1/inspections/<uuid:inspection_id>/responses
POST   /api/v1/inspections/<uuid:inspection_id>/approve   # → vehicle Available (AC-5)
POST   /api/v1/inspections/<uuid:inspection_id>/reject     # → vehicle stays Under Maintenance (AC-5)
```

> **Contract note:** `approve` on a maintenance-clearance inspection must **not** dispatch a TO; it only transitions vehicle to **Available**. Distinguish inspection `purpose` (or nullable `transport_order`) in API payloads and admin.

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View dispatch-readiness / inspection queue (own POI) | Driver Supervisor |
| Skip checklist and set TO to Dispatch | Driver Supervisor |
| Complete daily inspection checklist and record OK / not OK | Driver Supervisor |
| Mark vehicle Under Maintenance (from inspection not OK) | Driver Supervisor |
| View **Under Maintenance** vehicle list (maintenance queue) | Driver Supervisor |
| Start re-inspection and clear vehicle to **Available** (after passed checklist) | Driver Supervisor |
| View inspection history (read-only) | Driver Supervisor, TDO, Dispatch Manager |
| View vehicle status board | Driver Supervisor, TDO (read-only) |

## Dependencies

- **Requires**: MDM-05 (vehicles), TO-02 — TDO (Own Fleet) assigns **vehicle**, **driver**, **helper**, **ETA**; TO in **Assigned** (or agreed equivalent)
- **Requires**: Product/technical decision on TO state model for **Under Planning** vs existing `created` / new enum; Trip/TO alignment for **Dispatch**
- **Enables**: DM-01 and driver execution — **update** downstream gates: execution may require “supervisor-released to Dispatch” rather than “checklist completed” only
- **Related**: TDO assignment pickers must respect **Available** only — return-to-service unblocks the same exclusion introduced in AC-3

## Definition of Done

- [x] **Checklist seeded**: all 7 sections and items via data migration — `0002_seed_checklist.py`
- [x] **Queue rule**: supervisor queue lists TOs in **`ready_for_dispatch`** (implies TDO completed assignment including ETA upstream); queue view does **not** assert helpers populated
- [x] **Skip path**: supervisor can set TO to **Dispatch** without checklist — **no** dedicated “checklist_skipped” audit record (see AC-2)
- [x] **Checklist OK path**: full responses + complete → TO **Dispatched**
- [x] **Not OK path**: vehicle **Under Maintenance**; TO **`under_planning`**; crew cleared; vehicle excluded from assignment pickers
- [ ] **Audit trail**: central audit service coverage for skip, checklist completion, reject — **not** implemented (only vehicle under-maintenance action logs in places)
- [ ] **Automated tests**: dedicated tests for fleet_supervisor inspection/dispatch transitions — **not** found in repo
- [ ] **UAT — skip**: (manual QA / not evidenced in repo)
- [ ] **UAT — OK**: (manual QA / not evidenced in repo)
- [ ] **UAT — maintenance**: (manual QA / not evidenced in repo)
- [x] **Maintenance queue**: supervisor sees all **Under Maintenance** vehicles for their scope (AC-4)
- [x] **Re-inspection pass**: full checklist → vehicle **Available**; vehicle appears in TDO assignment (AC-5)
- [x] **Re-inspection fail**: vehicle stays **Under Maintenance**; reason recorded (AC-5)
- [x] **MDM guard**: inactive vehicle cannot be cleared to **Available** without reactivation message (AC-5)
