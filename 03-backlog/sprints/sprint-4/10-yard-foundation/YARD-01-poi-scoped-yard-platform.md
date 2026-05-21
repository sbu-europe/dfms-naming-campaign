---
jira_key: DFS-065
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: YARD-01
title: Yard Foundation — Operator Site Assignment & Shared Yard Rules
epic: Yard Foundation
status: In Progress
story_points: 8
assignee: ~
prd_refs:
  - "§6.5.1 Point Of Interest (POI) Setup (Phase 1)"
  - "§6.12.1 Queue Monitoring – View Waiting Vehicles (Phase 1)"
  - "§6.10.1 Gate-In Entry (Phase 1)"
  - "§6.11.1 Scale-In (Weight Entry) (Phase 1)"
  - "§7.1.9 Gate, Weighing, Command Center & QC Operations"
---

# YARD-01 — Yard Foundation (Operator Site & Shared Rules)

## User Story

**As** gateman, scaling_operator, command_center_officer, loading_personnel, unloading_personnel, or qc_inspector_physical  
**I want** the system to know which site I work at and whether the vehicle is at the start or end of its trip  
**So that** I only see work for my depot, loading and unloading rules stay correct, and two depots never share the same queue by mistake

## Business Context

Each POI-scoped yard role (`gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`) works at **one physical site (POI)**. A transport order may visit **two sites** on one trip (load at origin, unload at destination). Users at Site A must never see vehicles waiting at Site B.

Gate (`gateman`) already works in practice, but site assignment for the other roles is weak. They need the **same foundation** before their screens go live: who works where, which part of the trip applies, and a single set of rules for what each role may do.

**Out of scope for this story:** mobile apps for these roles, choosing between multiple sites in one session (unless added later).

## Acceptance Criteria

### AC-1: Assign each POI-scoped role to a site
- [x] Tenant admin can record which **POI** each yard user works at, per **role_code** (`gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`)
- [x] One user may have more than one site over time; one site is marked **primary** where relevant
- [x] When a user is invited to a site, that assignment is created automatically
- [ ] Existing invite data is carried over once so current gate users are not left without a site

### AC-2: Resolve “my working site” for every yard screen
- [x] When a user with a POI-scoped yard role opens a yard screen, the system uses their **assigned site** (or an explicit site choice if the product allows it later)
- [x] If no site can be determined, the user sees **no other depots’ vehicles** and a clear message to contact admin — not the whole company list
- [x] Gate behaviour for current gate users stays the same after this change

### AC-3: Record whether the visit is at origin or destination
- [x] At gate-in, the system records whether this visit is at the **source** or **destination** POI for that transport order
- [x] Loading, unloading, and command center use this — they do not guess from POI names alone
- [ ] Existing gate visits are updated so historical data is consistent

### AC-4: Show current yard step on the transport order
- [x] Each transport order has a **current yard step** visible to gateman, scaling_operator, command_center_officer, loading_personnel, unloading_personnel, and qc_inspector_physical (e.g. waiting for command center, flagged for QC, loading in progress, QC passed)
- [x] The step updates when gate, scale, command center, loading, unloading, or QC acts — and appears on the TO timeline for audit
- [ ] Command center, QC, and loading screens filter waiting work by this step (not by digging through old log entries)
- [x] The yard step clears when the trip moves to the next major status (e.g. left source for destination)

### AC-5: One shared pattern for all POI-scoped yard screens
- [x] Gate, scale, command center, loading, unloading, and QC screens use the **same rules** for “only my site” and unscoped supervisors (`gate_supervisor`, `tenant_admin`) can see more
- [x] One reference table defines, per product lane and per source/destination visit, which actions are allowed (gate, weigh, assign bay, load, unload, QC sample, QC decision)
- [x] Gate screens remain usable with no regression for `gateman` and `gate_supervisor`

### AC-6: Data needed by command center, loading, and QC
- [x] Command center queue can record **whether QC has passed** for raw-material vehicles (not applicable for finished-goods lanes)
- [x] Unloading records can show when an unload was **cancelled because QC ordered a resample**
- [x] Waiting serial numbers link cleanly to bay assignment without blocking data entry

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| YARD-01-1 | Operator-to-site assignment — admin maintenance, invite flow, one-time migration from existing invites | DFS-065-1 | Partial |
| YARD-01-2 | Working-site resolution for all yard roles; safe empty lists when unassigned | DFS-065-2 | Done |
| YARD-01-3 | Source vs destination flag on gate visit; backfill for existing visits | DFS-065-3 | Partial |
| YARD-01-4 | Current yard step on transport order; sync with lifecycle timeline (**TLS-01**) | DFS-065-4 | Partial |
| YARD-01-5 | Shared yard screen rules (from gate pattern); gate regression check | DFS-065-5 | Done |
| YARD-01-6 | Single policy: allowed actions by lane and by source vs destination visit | DFS-065-6 | Done |
| YARD-01-7 | Command center / unloading / QC data fields agreed in AC-6 | DFS-065-7 | Done |
| YARD-01-8 | UAT: gateman (or other POI-scoped role) at Site A cannot see Site B queue or visits | DFS-065-8 | Not done |

## Access & Permissions

| Action | Role |
|--------|------|
| Assign users to operational POIs | Tenant Admin, Department Admin |
| View own site assignment | gateman, scaling_operator, command_center_officer, loading_personnel, unloading_personnel, qc_inspector_physical |

## Dependencies

- **Requires**: POI master data (Sprint 2); **TLS-01** for TO status and timeline (coordinate yard-step field with TLS-01)
- **Blocks**: **SC-01**, **CC-01**, **LD-01**, **QC-01** screens for scaling_operator, command_center_officer, loading_personnel, unloading_personnel, and qc_inspector_physical
- **Works with**: **GT-01** (source/destination on gate-in; gate uses formal site assignment)

## Definition of Done

- [ ] Tenant admin can assign and change operational POIs per role_code; invites create assignments
- [x] Users with a POI-scoped yard role but no assignment see no cross-site data and a clear admin message
- [ ] Every new gate-in records source vs destination; existing visits corrected
- [ ] Transport order shows current yard step; yard screens filter on it
- [x] gateman, scaling_operator, command_center_officer, loading_personnel, unloading_personnel, and qc_inspector_physical follow the same site-scoping pattern
- [x] Raw-material QC pass/fail visible to command_center_officer queue; resample cancels unload as designed
- [ ] UAT: two depots — gateman (or other POI-scoped role) at Depot A never sees Depot B work in yard screens
