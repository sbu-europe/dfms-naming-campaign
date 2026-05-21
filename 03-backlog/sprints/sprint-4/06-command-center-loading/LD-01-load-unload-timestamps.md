---
jira_key: DFS-057
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: LD-01
title: Loading & Unloading — Start/End Timestamps (E2E)
epic: Command Center
status: Pending
story_points: 5
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.13.1 Loading Monitoring – Load Start/End Date & Time Entry (Phase 1)"
  - "§6.14.1 Unload Monitoring – Unload Start/End Date & Time Entry (Phase 1)"
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 1 handoff context)"
---

# LD-01 — Load / Unload Start–End Timestamps

## User Story

**As** Loading or Unloading Personnel  
**I want to** record start and end times, quantities, and seal information  
**So that** **TO** KPIs and PRD closure rules have accurate operational timestamps

## Business Context

**§6.13.2** loading notifications = Phase 3 — excluded. This story is **data capture** at source (load) and destination (unload) for E2E.

For finished-goods inbound TOs (e.g., Port Consignment planner TO lane), unloading timestamps are part of the closure prerequisites in POD-01.

For raw-material TOs, this story provides the unloading event context consumed by **QC-01**.  
Sampling/QC decision capture is intentionally kept in a separate story.

## Acceptance Criteria

### AC-1: Loading
- [ ] Operator selects vehicle assigned for loading at a bay
- [ ] Enter **load start** datetime
- [ ] Enter **load end** datetime with: number of bags loaded, weight, seal number
- [ ] Validate end ≥ start; link to **TO**

### AC-2: Unloading
- [ ] Enter **unload start** and **unload end** with bags unloaded + weight
- [ ] Chronological validation; link to **TO**
- [ ] Applies to both FG inbound and RM inbound lanes; QC handoff remains RM-specific in Sprint 4

### AC-3: QC handoff context (raw-material path)
- [ ] After unload event capture, TO has enough context for **QC-01** to run sampling + QC decision
- [ ] Handoff reference (TO/unload event id) is persisted and auditable

### AC-4: TLS / gate integration
- [ ] Events feed TLS-01 sub-states (Loading Started/Completed; Unloading Started/Completed)

### AC-5: Loading vs unloading by site and trip leg (YARD-01)
- [ ] **Loading** personnel only see outbound trips at **source** site with an assigned loading bay
- [ ] **Unloading** personnel only see inbound trips at **destination** site; raw-material trips without QC pass cannot start unload
- [ ] Loading and unloading are separate menus/roles
- [ ] If QC orders resample or fail during unload, the active unload assignment is cancelled and shown clearly

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| LD-01-1 | Load and unload event records — including flag when unload cancelled for QC resample (**YARD-01**) | DFS-057-1 | Pending |
| LD-01-2 | Loading screen — source-site outbound only, assigned bay required | DFS-057-2 | Pending |
| LD-01-3 | Unloading screen — destination-site inbound only; QC and resample messaging | DFS-057-3 | Pending |
| LD-01-4 | Load start/end API (POST — create load event linked to TO and bay assignment) | DFS-057-4 | Pending |
| LD-01-5 | Unload start/end API (POST — create unload event linked to TO and bay assignment) | DFS-057-5 | Pending |
| LD-01-6 | QC handoff reference API (GET — retrieve unload event context for QC-01 consumption) | DFS-057-6 | Pending |
| LD-01-7 | Operator UI — web form for load/unload event capture (mobile deferred) | DFS-057-7 | Pending |
| LD-01-8 | TLS-01 sub-state emission service — emit Loading Started/Completed, Unloading Started/Completed transitions | DFS-057-8 | Pending |

## API Endpoints

```
POST   /api/v1/load-events                                   # Record load start/end (linked to TO + bay assignment)
GET    /api/v1/load-events?transport_order=&bay_assignment=   # List load events (filterable)
GET    /api/v1/load-events/{id}                               # Load event detail
POST   /api/v1/unload-events                                  # Record unload start/end (linked to TO + bay assignment)
GET    /api/v1/unload-events?transport_order=&bay_assignment=  # List unload events (filterable)
GET    /api/v1/unload-events/{id}                              # Unload event detail
GET    /api/v1/unload-events/{id}/qc-handoff                   # QC handoff context for RM TOs (consumed by QC-01)
```

## Access & Permissions

| Action | Role |
|--------|------|
| Record load start/end | Loading Personnel |
| Record unload start/end | Unloading Personnel |
| View load/unload events | Command Center Officer, Transport Supervisor, Tenant Admin |
| View QC handoff context | QC Supervisor |

## Dependencies

- **Requires**: CC-01 (assignment), TLS-01, **YARD-01**, **LUP-01**
- **Feeds**: QC-01

## Definition of Done

- [ ] LoadEvent and UnloadEvent models created with migrations passing `makemigrations --check`
- [ ] Load event captures start datetime, end datetime, bags loaded, weight, and seal number linked to TO (AC-1)
- [ ] Unload event captures start datetime, end datetime, bags unloaded, and weight linked to TO (AC-2)
- [ ] End datetime ≥ start datetime validation enforced on both load and unload events
- [ ] QC handoff reference (TO + unload event ID) persisted and retrievable for RM TOs (AC-3)
- [ ] TLS-01 sub-state transitions emitted: Loading Started, Loading Completed, Unloading Started, Unloading Completed (AC-4)
- [ ] Load/unload events visible on TO timeline via TLS-01
- [ ] Audit log entry created on every load and unload event
- [ ] Loading only at source for outbound FG; unloading only at destination for inbound lanes (AC-5)
- [ ] UAT: load start/end captured at source POI; unload start/end at destination POI for full E2E flow
