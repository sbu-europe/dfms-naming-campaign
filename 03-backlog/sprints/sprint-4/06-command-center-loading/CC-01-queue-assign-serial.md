---
jira_key: DFS-056
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: CC-01
title: Command Center — Queue, Bay Assignment & Waiting Serial
epic: Command Center
status: Pending
story_points: 8
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.12.1 Queue Monitoring – View Waiting Vehicles (Phase 1)"
  - "§6.12.2 Loading/Unloading Assignments (Phase 1)"
  - "§6.12.4 Assign Waiting Serial (Phase 1)"
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 1)"
---

# CC-01 — Queue, Bay Assignment & Waiting Serial

## User Story

**As a** Command Center Officer  
**I want to** see post-scale vehicles, assign them to loading/unloading points, and issue waiting serials  
**So that** yard congestion is controlled and loading crews know what to expect

## Business Context

**§6.12.3** Assignment **push notifications** are Phase 3 — this story uses **live UI** visibility for loading/unloading personnel (and optional in-app banner).

## Acceptance Criteria

### AC-1: Eligible queue
- [ ] Only vehicles with **completed scale-in** and **not yet assigned** to an active bay appear in waiting queue
- ~~Auto-refresh without manual reload (polling or websocket)~~ — **Not in scope** (waiting serials may change on refresh; manual reload will not be supported)

### AC-2: Queue card content
- [ ] Shows: vehicle number, P.C. code, item, scale-in datetime, product type, gross/net (if available), TO/challan ref, urgency

### AC-3: Bay assignment
- [ ] Officer assigns vehicle to **loading or unloading** point; assignment considers product type, vehicle type, urgency (manual selection with **warnings** if mismatch — automation = later)
- [ ] Assignment immediately visible to operational roles with access to that bay view
- [ ] Sprint 4 lane expectations:
  - FG outbound → assign to loading point
  - FG inbound / RM inbound → assign to unloading point

### AC-4: Waiting serial
- [ ] Unique **waiting serial per loading point** per vehicle; immutable after issue; issuer + timestamp audit

### AC-5: TLS integration
- [ ] Assignment updates **TO** sub-state (e.g. Assigned to Loading Point) per §6.8.5 naming alignment

### AC-6: Raw-material QC checkpoint trigger
- [ ] For **raw-material** TOs, Command Center updates TO sub-state to make it visible to QC Supervisor (per TLS-01 lifecycle; e.g. `QC Started`)
- [ ] Command Center does **not** assign unloading point for raw-material TOs **until QC Pass** — after Pass, **CC Officer** assigns unloading point via `[Assign Bay]` (QC-01 records Pass/Fail only)
- [ ] QC capture is in **QC-01**; this story flags TO for QC and assigns unloading point **after** QC Pass (same bay/serial flow as FG inbound)
- [ ] For **finished-goods inbound unloading** assignments, system records unload path states without mandatory QC checkpoint in Sprint 4

### AC-7: Command center at one site (YARD-01)
- [ ] Officer queue and assignment screens show only vehicles at **their assigned site**
- [ ] For raw-material trips, queue shows whether **QC has passed** so bay assignment stays blocked until pass
- [ ] Waiting serial can be issued as soon as bay is assigned without data-entry dead ends

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CC-01-1 | Queue, bay assignment, and waiting serial records — including QC-passed flag for raw material (**YARD-01**) | DFS-056-1 | Pending |
| CC-01-2 | Command center queue screen — vehicles at officer’s site only; fed from scale-in | DFS-056-2 | Pending |
| CC-01-3 | Bay assignment screen — loading/unloading points at same site only (**LUP-01**); updates TO yard step | DFS-056-3 | Pending |
| CC-01-4 | WaitingSerialAdmin — read-only after issue, issuer + timestamp audit fields | DFS-056-4 | Pending |
| CC-01-5 | Queue list API (GET with filters: product type, urgency, status) | DFS-056-5 | Pending |
| CC-01-6 | Bay assignment API (POST — assign vehicle to L/U point) | DFS-056-6 | Pending |
| CC-01-7 | Waiting serial issuance API (POST — generate immutable serial per loading point) | DFS-056-7 | Pending |
| CC-01-8 | "My bay" read API for loading personnel (GET — current assignments for a given L/U point) | DFS-056-8 | Pending |
| CC-01-9 | Command Center UI — queue view, assignment form, serial issuance | DFS-056-9 | Pending |
| CC-01-10 | RM QC trigger service — update TO sub-state for QC visibility on raw-material TOs (AC-6 handoff) | DFS-056-10 | Pending |
| CC-01-11 | TLS-01 event emission — emit sub-state transitions on assignment + serial issuance | DFS-056-11 | Pending |

## API Endpoints

```
GET    /api/v1/command-center/queue?product_type=&urgency=&status=        # Eligible vehicles (scale-in complete, not assigned)
POST   /api/v1/command-center/assignments                                 # Assign vehicle to L/U point
GET    /api/v1/command-center/assignments?loading_point=&status=           # List assignments (filterable)
POST   /api/v1/command-center/waiting-serials                             # Issue waiting serial for a loading point
GET    /api/v1/command-center/waiting-serials?loading_point=               # List serials by loading point
GET    /api/v1/command-center/my-bay?loading_point_id=                    # Loading personnel — current bay assignments
```

## Access & Permissions

| Action | Role |
|--------|------|
| View queue / assign vehicle | Command Center Officer |
| Issue waiting serial | Command Center Officer |
| View "my bay" assignments | Loading / Unloading Personnel |
| View queue (read-only) | Transport Supervisor, Tenant Admin |

## Dependencies

- **Requires**: SC-01, TLS-01, **YARD-01**, **LUP-01** (at least one active L/U point per POI used in UAT)

## Definition of Done

- [ ] QueueEntry, BayAssignment, and WaitingSerial models created with migrations passing `makemigrations --check`
- [ ] Queue list shows only vehicles with completed scale-in and no active assignment (AC-1)
- [ ] Queue card displays vehicle number, P.C. code, item, scale-in datetime, product type, weight, TO ref, urgency (AC-2)
- [ ] Bay assignment validates product type / vehicle type against L/U point and shows warning on mismatch (AC-3)
- [ ] Assignment is immediately visible on the "my bay" view for loading/unloading personnel
- [ ] Waiting serial is unique per loading point, immutable after issue, with issuer + timestamp audit (AC-4)
- [ ] Assignment emits TLS-01 sub-state transition (e.g. `Assigned to Loading Point`) on the TO (AC-5)
- [ ] RM TOs: Command Center updates TO sub-state for QC visibility; does NOT assign unloading point (AC-6)
- [ ] FG inbound TOs: unload path states recorded without mandatory QC checkpoint
- [ ] Audit log entry created on every assignment and serial issuance
- [ ] Officer sees only their site’s queue; other depots’ vehicles never listed (AC-7)
- [ ] Raw-material bay assignment blocked until QC pass is reflected on the queue (AC-7)
- [ ] UAT: assign vehicle → loading screen shows assignment without email/push
