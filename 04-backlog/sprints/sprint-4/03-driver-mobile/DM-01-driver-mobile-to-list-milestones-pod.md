---
jira_key: DFS-053
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DM-01
title: Driver Mobile — TO List, Execution Milestones & POD
epic: Driver Mobile
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.16.1.1 Trip Management (Trip Assignment & Navigation) (Phase 1)"
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) — driver confirms delivery in app"
  - "§6.8.1.7 Fleet Availability Validation (Own Fleet) (Phase 1 — enforced on execution start)"
  - "Mobile Interface Requirements — Driver Mobile Interface (Technical)"
---

# DM-01 — Driver Mobile — TO List, Milestones & POD

## User Story

**As a** Driver  
**I want to** see **my assigned TOs** (once TDO sets **Ready for Dispatch**), record execution milestones, and capture POD  
**So that** operations have traceable execution evidence against the **TO** created in Sprint 3

## Business Context

Implements **§6.16.1.1** (Phase 1) **without** map, external navigation, or background GPS in **this sprint backlog** (explicitly deferred — see Sprint 4 README). **Mobile Interface Requirements** still apply where relevant: offline-safe **read** of assigned TO detail; photo compression for POD.

**§6.8.1.7**: re-validate vehicle/driver availability on **first driver execution action** (e.g. “execution started”), unless tech design chooses an earlier enforcement point coordinated with TLS-01.

**Out of Sprint 4 scope for DM-01:** fuel entry (**§6.6.2.x** Phase 2); **live map / turn-by-turn / background location**.

## Acceptance Criteria

### AC-1: TO list & detail
- [ ] Driver sees **only TOs assigned to them** with status **`Ready for Dispatch`** or downstream execution states (**TLS-01 / §6.8.5** naming)
- [ ] Detail shows: TO reference, pickup POI, drop POI, product type, quantity, urgency, special instructions (**from TO**)

### AC-2: Execution milestones
- [ ] Driver can record allowed milestones when **§6.8.5** / TLS-01 permits (e.g. execution started, arrived at source, arrived at destination — exact set reconciled with yard events; prefer **gate/scale as source of truth** for yard-bound arrivals when integrated)
- [ ] Milestone PATCH fails with stable error when **§6.8.1.7** fails (vehicle unavailable, driver on leave, vehicle under maintenance, etc.)

### AC-3: POD capture
- [ ] Driver submits **POD** with **photo** (optional signature if product confirms) **linked to the TO**
- [ ] Upload retry; **offline**: queue POD payload and sync when online *(MVP: clear “pending sync” state)*

### AC-4: Technical NFRs (Sprint 4)
- [ ] Photo auto-compress before upload
- [ ] No map deep links, no continuous/background GPS in Sprint 4 deliverables

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DM-01-1 | Driver **TO** list + detail API (scoped to auth driver) | DFS-053-1 | Pending |
| DM-01-2 | Milestone PATCH APIs + TLS-01 integration | DFS-053-2 | Pending |
| DM-01-3 | POD upload API + media storage | DFS-053-3 | Pending |
| DM-01-4 | Mobile/responsive UI shell + offline queue | DFS-053-4 | Pending |

## Dependencies

- **Requires**: TO-02 (assignment + TDO may set **Ready for Dispatch**), **TLS-01**
- **Parallel**: GT-01, SC-01 (yard may authoritatively set “at source” — document single source of truth)

## Definition of Done

- [ ] UAT: driver completes POD photo on completed TO; visible on **TO** timeline
- [ ] Security: driver cannot access other drivers’ TOs
- [ ] Automated tests for API authorization
