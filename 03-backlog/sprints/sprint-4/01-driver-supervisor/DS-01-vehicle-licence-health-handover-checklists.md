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
assignee: ~
prd_refs:
  - "§6.6.1.2 Vehicle License and Health Management (Phase 1)"
---

# DS-01 — Vehicle Licence, Health & Handover Checklists

## User Story

**As a** Driver Supervisor  
**I want to** optionally run a full vehiclea inspection checklist after TDO (Own Fleet) has assigned vehicle, driver, helper, and ETA to a TO, then either release the TO to **Dispatch** or, if inspection fails, park the vehicle in **Under Maintenance** and send the TO back for replanning  
**So that** dispatch is not blocked when inspection is unnecessary or waived, while unsafe vehicles are removed from service with a clear audit trail and the TO is returned to **Under Planning** for TDO to reassign resources

## Business Context

PRD §6.6.1.2 (Phase 1) separates **operational readiness** from master registration (MDM-05, Sprint 2). This story refines **who** moves an assigned TO toward execution and **how** the vehicle checklist fits in.

**Upstream handover (TDO — Own Fleet)**  
Before the Driver Supervisor acts, the TDO (Own Fleet) must complete assignment on the TO: **vehicle**, **driver**, **helper(s)**, and **ETA**. Until those are recorded, the TO is not in the Driver Supervisor’s dispatch-readiness queue.
a
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

## Acceptance Criteria

### AC-1: Predefined daily inspection checklist
- [ ] System provides a **single generalised daily inspection checklist** (no short-distance / long-distance distinction)
- [ ] The checklist is predefined with the following sections and items; each item has a **Remarks** field:

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
| | 2 | Battery Water |a
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
| | 5 | Leaf Spring Hanger |a
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

- [ ] Checklist sections and items are **predefined and immutable** — no user can modify them

### AC-2: Preconditions, optional checklist, and transition to Dispatch
- [ ] A TO appears in the **Driver Supervisor dispatch-readiness queue** only when **TDO (Own Fleet)** has assigned **vehicle**, **driver**, **helper(s)**, and **ETA** and the TO is in the applicable **Assigned** (or equivalent) status
- [ ] Driver Supervisor may transition the TO to **Dispatch** **without** completing a checklist (**skip path**)
- [ ] If the supervisor **chooses** the checklist path: they complete the daily inspection for the **vehicle + TO** context — fills remarks per item — then explicitly records **Vehicle OK** or **Vehicle not OK**
- [ ] On **Vehicle OK** (checklist path): supervisor may transition TO to **Dispatch**
- [ ] On **skip path**: no inspection payload is required; audit should still record *who* dispatched and *when*, and that checklist was skipped (policy: mandatory audit field)
- [ ] Each **completed** checklist submission stores: vehicle ID, TO ID, section, item, remarks, outcome (OK / not OK), date/time, submitting supervisor; full history retained

### AC-3: Vehicle status — Under Maintenance & TO → Under Planning
- [ ] When checklist outcome is **Vehicle not OK**: vehicle → **Under Maintenance**; linked TO → **Under Planning** (vehicle/driver/helper/ETA cleared or marked invalid per data rules so TDO must replan — specify in technical design)
- [ ] Vehicle in **Under Maintenance** is **excluded** from new TDO assignment until returned to service (aligns with TO-02 / fleet rules)
- [ ] Partial checklist save may be allowed as **draft**; **Dispatch** and **Vehicle not OK** finalisation are only allowed when business rules for completeness are met (define in technical design)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DS-01-1 | `ChecklistSection` + `ChecklistItem` models + data migration to seed all 7 sections and predefined items | DFS-050-1 | Pending |
| DS-01-2 | `VehicleInspection` + `ChecklistResponse` models — FK to TO, vehicle, supervisor; optional linkage when checklist skipped; response stores item + remarks + outcome | DFS-050-2 | Pending |
| DS-01-3 | `VehicleInspectionAdmin` — queue: TOs **Assigned** with vehicle, driver, helper, ETA populated (Own Fleet); filters/search as before | DFS-050-3 | Pending |
| DS-01-4 | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` (all items per section); readonly after completion; separate action or flag for **skip checklist → Dispatch** | DFS-050-4 | Pending |
| DS-01-5 | Status transitions: **skip** → TO to **Dispatch** (or agreed intermediate); **checklist OK** → TO to **Dispatch**; validate guards vs `TO_STATUS_TRANSITIONS` | DFS-050-5 | Pending |
| DS-01-6 | Checklist completion with **Vehicle not OK** — persist outcome, set vehicle **Under Maintenance**, transition TO → **Under Planning** (or mapped enum); reason / notes if required by policy | DFS-050-6 | Pending |
| DS-01-7 | Remove or repurpose old “reject → TO stays Assigned” path unless retained for non-maintenance declines; `VehicleAdmin.mark_under_maintenance` + TO rollback service aligned to **Under Planning** | DFS-050-7 | Pending |
| DS-01-8 | Inspection / dispatch queue API — `GET` queue (Assigned + full assignment + Own Fleet) | DFS-050-8 | Pending |
| DS-01-9 | APIs: submit checklist + outcome; **POST** skip-dispatch or **PATCH** TO dispatch with `checklist_skipped: true` (single contract to be agreed) | DFS-050-9 | Pending |
| DS-01-10 | Inspection detail API — `GET /api/v1/inspections/{inspection_id}` | DFS-050-10 | Pending |
| DS-01-11 | Deprecate or merge **reject** API with **not OK** + maintenance path | DFS-050-11 | Pending |
| DS-01-12 | **Under Maintenance** API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance` + TO → **Under Planning** (replace “reset to Created” where story supersedes) | DFS-050-12 | Pending |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template` (read-only) | DFS-050-13 | Pending |
| DS-01-14 | Audit logging: checklist submissions, skip-dispatch, OK / not OK outcomes, Under Maintenance | DFS-050-14 | Pending |

## API Endpoints (draft — reconcile with gateway and TO PATCH contract)
a
```
GET    /api/v1/inspections/queue                     # TOs Assigned, Own Fleet, vehicle+driver+helper+ETA set
GET    /api/v1/checklist-template                    # Read-only — sections + items
POST   /api/v1/inspections                           # Submit completed checklist + outcome (OK → allow dispatch; not OK → maintenance + TO Under Planning)
POST   /api/v1/transport-orders/{to_id}/dispatch     # Supervisor dispatch: optional body { checklist_skipped: true } OR prerequisite inspection OK (contract TBD)
GET    /api/v1/inspections/{inspection_id}           # Inspection detail with all responses
POST   /api/v1/vehicles/{vehicle_id}/under-maintenance   # Mark vehicle Under Maintenance; linked TO → Under Planning (when driven from inspection failure)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|a
| View dispatch-readiness / inspection queue (own POI) | Driver Supervisor |
| Skip checklist and set TO to Dispatch | Driver Supervisor |
| Complete daily inspection checklist and record OK / not OK | Driver Supervisor |
| Mark vehicle Under Maintenance (from inspection not OK) | Driver Supervisor |
| View inspection history (read-only) | Driver Supervisor, TDO, Dispatch Manager |
| View vehicle status board | Driver Supervisor, TDO (read-only) |

## Dependencies

- **Requires**: MDM-05 (vehicles), TO-02 — TDO (Own Fleet) assigns **vehicle**, **driver**, **helper**, **ETA**; TO in **Assigned** (or agreed equivalent)
- **Requires**: Product/technical decision on TO state model for **Under Planning** vs existing `created` / new enum; Trip/TO alignment for **Dispatch**
- **Enables**: DM-01 and driver execution — **update** downstream gates: execution may require “supervisor-released to Dispatch” rather than “checklist completed” only

## Definition of Done

- [ ] **Checklist seeded**: all 7 sections and items via data migration — verified on clean DB
- [ ] **Queue rule**: only TOs with full TDO assignment (vehicle, driver, helper, ETA) appear for Driver Supervisora
- [ ] **Skip path**: supervisor can set TO to **Dispatch** without checklist; audit shows skip
- [ ] **Checklist OK path**: full responses + OK → supervisor can set TO to **Dispatch**
- [ ] **Not OK path**: vehicle **Under Maintenance**; TO **Under Planning**; TDO can reassign; vehicle excluded from assignment pickers
- [ ] **Audit trail**: user, timestamp, before/after state for dispatch, checklist completion, skip, and maintenance outcomes
- [ ] **Automated tests**: transitions for skip, OK, not OK + maintenance + TO rollback
- [ ] **UAT — skip**: TDO assigns all resources → supervisor dispatches without checklist → TO reaches Dispatch
- [ ] **UAT — OK**: TDO assigns → supervisor completes checklist → OK → Dispatch
- [ ] **UAT — maintenance**: TDO assigns → supervisor completes checklist → not OK → vehicle Under Maintenance, TO Under Planning → TDO replans
a