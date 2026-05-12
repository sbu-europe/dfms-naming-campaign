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
**I want to** complete a vehicle inspection checklist after vehicle and driver are assigned to a TO, and mark vehicles Under Maintenance when needed  
**So that** only inspected vehicles proceed to dispatch and audit evidence exists for every inspection

## Business Context

PRD §6.6.1.2 (Phase 1) separates **operational readiness** from master registration (MDM-05, Sprint 2). After the TDO assigns a vehicle and driver to a TO (TO-02, Sprint 3 — status `Assigned`), the Driver Supervisor inspects the vehicle using a predefined daily checklist. Successful completion advances the TO to `Ready for Dispatch`. If critical issues are found, the supervisor can mark the vehicle **Under Maintenance**, which unlinks it from the TO and forces reassignment.

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

- [ ] Checklist sections and items are **predefined and immutable** — no user can modify them

### AC-2: Driver Supervisor completes checklist & updates TO status
- [ ] After TDO assigns vehicle + driver to a TO (TO-02, status `Assigned`), the TO appears in the **Driver Supervisor's inspection queue**
- [ ] Driver Supervisor completes the daily inspection checklist for the **vehicle + TO** context — fills remarks per item
- [ ] On successful completion: TO status → `Ready for Dispatch`
- [ ] Each submission stores: vehicle ID, TO ID, section, item, remarks, date/time, submitting supervisor; full history retained
- [ ] If critical issues found, supervisor can **reject** the vehicle — TO remains in `Assigned` and the vehicle is flagged for follow-up

### AC-3: Vehicle status — Under Maintenance
- [ ] After completing the checklist, supervisor can mark the vehicle as **Under Maintenance** if inspection reveals issues requiring repair
- [ ] Vehicle in Under Maintenance is **excluded** from new TDO assignment (aligns with TO-02 rules) and surfaced in supervisor list
- [ ] When a vehicle is marked Under Maintenance while linked to an `Assigned` TO, the TO status → `Created` (vehicle unlinked, TDO must reassign)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DS-01-1 | `ChecklistSection` + `ChecklistItem` models + data migration to seed all 7 sections and predefined items | DFS-050-1 | Pending |
| DS-01-2 | `VehicleInspection` + `ChecklistResponse` models — FK to TO, vehicle, supervisor; response stores item + status + remarks | DFS-050-2 | Pending |
| DS-01-3 | `VehicleInspectionAdmin` — `list_display` (TO ref, vehicle, supervisor, status, date), `list_filter` (status, vehicle), search by TO number; queryset filtered to TOs in `Assigned` status | DFS-050-3 | Pending |
| DS-01-4 | `VehicleInspectionAdmin` — change form with `ChecklistResponseInline` (all items per section), readonly fields for completed inspections | DFS-050-4 | Pending |
| DS-01-5 | `VehicleInspectionAdmin.save_model` — validate all responses filled, set `inspection_completed_at`, transition TO status `Assigned` → `Ready for Dispatch` | DFS-050-5 | Pending |
| DS-01-6 | `VehicleInspectionAdmin` reject action — TO stays `Assigned`, vehicle flagged for follow-up, rejection reason required via `_RejectReasonForm` | DFS-050-6 | Pending |
| DS-01-7 | `VehicleAdmin.mark_under_maintenance` custom action + TO reassignment guard service — `Assigned` TO → `Created`, vehicle unlinked | DFS-050-7 | Pending |
| DS-01-8 | Inspection queue API — `GET /api/v1/inspections/queue` (TOs pending inspection) | DFS-050-8 | Pending |
| DS-01-9 | Checklist submission API — `POST /api/v1/inspections` (submit responses, trigger TO status transition) | DFS-050-9 | Pending |
| DS-01-10 | Inspection detail API — `GET /api/v1/inspections/{inspection_id}` (all responses + metadata) | DFS-050-10 | Pending |
| DS-01-11 | Inspection reject API — `POST /api/v1/inspections/{inspection_id}/reject` (reason required) | DFS-050-11 | Pending |
| DS-01-12 | Under Maintenance API — `POST /api/v1/vehicles/{vehicle_id}/under-maintenance` + TO reset | DFS-050-12 | Pending |
| DS-01-13 | Checklist template API — `GET /api/v1/checklist-template` (read-only sections + items for mobile/frontend) | DFS-050-13 | Pending |
| DS-01-14 | Audit logging on all inspection submissions, rejections, and Under Maintenance decisions | DFS-050-14 | Pending |

## API Endpoints

```
GET    /api/v1/inspections/queue                     # TOs in Assigned status — supervisor inspection queue
POST   /api/v1/inspections                           # Submit completed checklist; triggers TO → Ready for Dispatch
GET    /api/v1/inspections/{inspection_id}           # Inspection detail with all responses
POST   /api/v1/inspections/{inspection_id}/reject    # Reject vehicle; TO stays Assigned; reason required
POST   /api/v1/vehicles/{vehicle_id}/under-maintenance   # Mark vehicle Under Maintenance; resets linked TO to Created
GET    /api/v1/checklist-template                    # Read-only — sections + items (for mobile/frontend rendering)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View inspection queue (own POI) | Driver Supervisor |
| Complete daily inspection checklist for TO | Driver Supervisor |
| Reject vehicle on inspection | Driver Supervisor |
| Mark vehicle Under Maintenance | Driver Supervisor |
| View inspection history (read-only) | Driver Supervisor, TDO, Dispatch Manager |
| View vehicle status board | Driver Supervisor, TDO (read-only) |

## Dependencies

- **Requires**: MDM-05 (vehicles), TO-02 (assigned TO + vehicle + driver link — provides `Assigned` status trigger)
- **Enables**: DM-01 (checklist completion gates **first driver execution action** — TO must be `Ready for Dispatch` before driver can act)

## Definition of Done

- [ ] **Checklist seeded**: all 7 sections and their items exist in the database via data migration — confirmed by running `manage.py migrate` on a clean DB
- [ ] **Admin list view**: `VehicleInspectionAdmin` inspection queue shows only TOs with `Assigned` status; filterable by vehicle, supervisor; search by TO number
- [ ] **Change form works**: `ChecklistResponseInline` renders all checklist items grouped by section; remarks field per item; readonly after completion
- [ ] **Checklist submission correct**: `VehicleInspectionAdmin.save_model` validates all responses → TO status becomes `Ready for Dispatch`; `inspection_completed_at` is set
- [ ] **Rejection path works**: reject action → TO stays `Assigned`; vehicle flagged; rejection reason persisted via `_RejectReasonForm`; supervisor cannot reject without reason
- [ ] **Under Maintenance enforced**: `VehicleAdmin.mark_under_maintenance` action → vehicle no longer appears in TDO assignment vehicle dropdown; linked `Assigned` TO resets to `Created`
- [ ] **Audit trail complete**: every inspection submission, rejection, and Under Maintenance decision records user, timestamp, and before/after state
- [ ] **Unit tests**: status transition guards (`Assigned` → `Ready for Dispatch`, reject path, Under Maintenance → TO reset to `Created`) covered by automated tests
- [ ] **UAT — happy path**: TDO assigns vehicle + driver → supervisor opens checklist → fills all items → saves → TO becomes `Ready for Dispatch`
- [ ] **UAT — rejection path**: supervisor inspects vehicle → rejects with reason → TO stays `Assigned`; vehicle flagged for follow-up
- [ ] **UAT — maintenance path**: supervisor marks vehicle Under Maintenance → vehicle excluded from future assignments; linked TO reset to `Created`; TDO reassigns
