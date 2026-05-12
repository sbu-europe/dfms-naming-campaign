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
| DS-01-1 | Checklist section/item models + seed predefined items | DFS-050-1 | Pending |
| DS-01-2 | Supervisor inspection queue API (TOs in `Assigned` status with vehicle+driver) | DFS-050-2 | Pending |
| DS-01-3 | Supervisor checklist completion API + TO status → `Ready for Dispatch` transition | DFS-050-3 | Pending |
| DS-01-4 | Vehicle → Under Maintenance action + TO reassignment guard | DFS-050-4 | Pending |
| DS-01-5 | Supervisor UI — inspection queue + checklist form + vehicle status board | DFS-050-5 | Pending |

## Access & Permissions

| Action | Role |
|--------|------|
| Complete daily inspection checklist for TO | Driver Supervisor |
| Mark vehicle Under Maintenance | Driver Supervisor |
| View vehicle status board | Driver Supervisor |

## Dependencies

- **Requires**: MDM-05 (vehicles), TO-02 (assigned TO + vehicle + driver link — provides `Assigned` status trigger)
- **Enables**: DM-01 (checklist completion gates **first driver execution action** — TO must be `Ready for Dispatch` before driver can act)

## Definition of Done

- [ ] PRD §6.6.1.2 acceptance criteria met for predefined checklist, supervisor completion, TO status transition, Under Maintenance
- [ ] Audit log on all supervisor checklist submissions and Under Maintenance decisions
- [ ] Unit tests for status transition guards (`Assigned` → `Ready for Dispatch`, Under Maintenance → TO reassignment)
- [ ] UAT: TDO assigns vehicle+driver → supervisor completes checklist → TO status becomes `Ready for Dispatch`
- [ ] UAT: supervisor marks vehicle Under Maintenance → vehicle excluded from future assignment, linked TO reset to `Created`
