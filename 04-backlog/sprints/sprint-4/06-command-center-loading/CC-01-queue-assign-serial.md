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
assignee: ~
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
- [ ] Auto-refresh without manual reload (polling or websocket)

### AC-2: Queue card content
- [ ] Shows: vehicle number, P.C. code, item, scale-in datetime, product type, gross/net (if available), TO/challan ref, urgency

### AC-3: Bay assignment
- [ ] Officer assigns vehicle to **loading or unloading** point; assignment considers product type, vehicle type, urgency (manual selection with **warnings** if mismatch — automation = later)
- [ ] Assignment immediately visible to operational roles with access to that bay view

### AC-4: Waiting serial
- [ ] Unique **waiting serial per loading point** per vehicle; immutable after issue; issuer + timestamp audit

### AC-5: TLS integration
- [ ] Assignment updates **TO** sub-state (e.g. Assigned to Loading Point) per §6.8.5 naming alignment

### AC-6: Raw-material QC checkpoint trigger
- [ ] For **raw-material unloading** assignments, system records a sampling/QC checkpoint as required next step in TO timeline (Sprint 4 simplified flow)
- [ ] QC capture itself is handled in **QC-01** (this story only creates the trigger/handoff context)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| CC-01-1 | Integrate assignable targets from **LUP-01** (list by POI; no parallel ad-hoc master) | DFS-056-1 | Pending |
| CC-01-2 | Queue list API + assign bay API | DFS-056-2 | Pending |
| CC-01-3 | Waiting serial issuance API | DFS-056-3 | Pending |
| CC-01-4 | Command Center UI | DFS-056-4 | Pending |
| CC-01-5 | Loading personnel “my bay” read view | DFS-056-5 | Pending |

## Dependencies

- **Requires**: SC-01, TLS-01, **LUP-01** (at least one active L/U point per POI used in UAT)

## Definition of Done

- [ ] UAT: assign vehicle → loading screen shows assignment without email/push
- [ ] Audit on serial issuance
