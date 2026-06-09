---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 5"
story_id: DB-01
title: Role-Scoped Operational Dashboard — KPI Work Queues at Login
epic: Core Platform & Landing Experience
status: In Progress
story_points: 13
assignee: Farhan Tanvir(farhanT23)
phase: Phase 1
prd_context:
  - ../../../05-modules/01-core/role-dashboard-kpi-widgets.md
depends_on:
  - YARD-01
  - GT-01
  - SC-01
  - CC-01
  - LD-01
  - QC-01
  - DS-01
related_stories:
  - GPS-01
---

# DB-01 — Role-Scoped Operational Dashboard — KPI Work Queues at Login

## User Story

**As a** Command Center Officer, Gateman, Gate Supervisor, Scaling Operator, Loading Personnel, Unloading Personnel, QC Inspector – Physical, or Driver Supervisor  
**I want to** see my current work queues and priorities as soon as I open the Dashboard  
**So that** I can start the right task immediately instead of hunting through menus to find what needs attention

---

## Role Catalogue

### Site-scoped roles (counts limited to assigned working site)

| Role | What the user should see at a glance |
|------|--------------------------------------|
| **Command Center Officer** | Vehicles waiting in queue; vehicles awaiting bay assignment; vehicles blocked on QC clearance; bay assignments made today; active trips currently at the site |
| **Gateman** | Active gate visits; vehicles awaiting gate-in; vehicles awaiting gate-out; on-demand transport orders created today at the gate |
| **Scaling Operator** | Vehicles awaiting scale-in; vehicles awaiting scale-out; open queue tokens; tokens issued today |
| **Loading Personnel** | Loads in progress; bays assigned but load not yet started; loads completed today; open outbound transport orders at the site (finished-goods, loading side) |
| **Unloading Personnel** | Unloads in progress; bays awaiting unload; unloads completed today; inbound raw material blocked on QC clearance |
| **QC Inspector – Physical** | Samples awaiting a QC decision; vehicles awaiting physical inspection; inspections in progress; failed QC awaiting re-inspection; command-center queue entries blocked on QC |

### Organisation-wide roles (counts across all sites)

| Role | What the user should see at a glance |
|------|--------------------------------------|
| **Gate Supervisor** | All gateman metrics aggregated across sites, plus: vehicles awaiting scale-in (all sites); vehicles currently in yard; QC holds in yard |
| **Driver Supervisor** | Pending pre-dispatch vehicle inspections; maintenance clearance inspections pending; rejected inspections; drivers on leave today; drivers with no attendance recorded today; open transport orders awaiting driver assignment |

### Roles unchanged (no KPI cards in v1)

QA Lab Technician · Driver Helper · Account Officer

---

## Business Rules

1. **Single role per user** — dashboard content matches the user’s one assigned operational role.
2. **Site assignment is mandatory for site-scoped roles** — if no site is assigned, the user sees a warning and all counts read zero. The system must **not** fall back to showing organisation-wide data.
3. **Counts must match work screens** — a number on the dashboard must reflect the same population of records the user would see on the corresponding operational screen. Operators must trust the dashboard.
4. **Supervisors see the big picture** — Gate Supervisor and Driver Supervisor are not limited to a single site in v1.
5. **Loading vs unloading context** — Loading Personnel see outbound loading work at the source side of the site. Unloading Personnel and QC Inspector see inbound / destination-side work. Counts must not mix these contexts.
6. **Navigation, not authorisation** — cards help users find work quickly; access control on each screen remains unchanged.
7. **Resilience** — if one metric cannot be calculated, the dashboard still loads; the affected card shows zero rather than breaking the page.

---

## Acceptance Criteria

### AC-1: Site-scoped queue visibility
- [ ] A Command Center Officer assigned to Site A sees queue counts for Site A only; Site B vehicles are not included in any card.

### AC-2: Unassigned site operator (fail-closed)
- [ ] A Gateman with no site assignment sees a visible warning message and all cards show zero — not organisation-wide totals.

### AC-3: Gate Supervisor — cross-site oversight
- [ ] A Gate Supervisor sees gate and yard metrics aggregated across all sites in the tenant.

### AC-4: Loading Personnel — correct work context
- [ ] Loading Personnel cards reflect outbound finished-goods loading work at their assigned site only (source-side loading), not inbound or other sites.

### AC-5: Unloading Personnel — correct work context
- [ ] Unloading Personnel cards reflect inbound unloading work at their assigned site only (destination-side), not outbound loading or other sites.

### AC-6: QC Inspector — destination inbound focus
- [ ] QC Inspector cards reflect physical QC work for inbound raw material at their assigned destination site.

### AC-7: Driver Supervisor — fleet-wide oversight
- [ ] Driver Supervisor sees inspection, attendance, leave, and open-order metrics across the whole organisation.

### AC-8: Excluded roles unchanged
- [ ] QA Lab Technician, Driver Helper, and Account Officer still see the existing empty welcome message with no KPI cards.

### AC-9: Actionable navigation
- [ ] Each KPI card links to the screen where the user can act on those records; the list shown matches what was counted.

### AC-10: Dashboard always loads
- [ ] The Dashboard page opens successfully even when individual metrics are temporarily unavailable.

### AC-11: No regression for existing roles
- [ ] Depot Officer, Commercial Officer, Distribution roles, Procurement, Transport Planner, TDO, and Driver dashboards behave exactly as before.

### AC-12: Site context banner
- [ ] Site-scoped users with a valid assignment see **“Working at: [Site name]”** on the Dashboard.

---

## Sub-tasks

| # | Sub-task | Description | Priority |
|---|----------|-------------|----------|
| DB-01-1 | Site context on Dashboard | Show working-site banner; show assignment warning when site is missing; establish scoping rules for site vs organisation-wide roles | High |
| DB-01-2 | Gateman & Gate Supervisor cards | Gate visit, gate-in/out, on-demand order, and cross-site yard oversight metrics | High |
| DB-01-3 | Scaling Operator cards | Scale-in, scale-out, open tokens, and today’s token issuance | High |
| DB-01-4 | Command Center Officer cards | Queue, bay assignment, QC-blocked, today’s assignments, active trips at site | High |
| DB-01-5 | Loading & Unloading Personnel cards | In-progress work, bays awaiting action, completed today, role-appropriate blocked queues | High |
| DB-01-6 | QC Inspector cards | Decision queue, awaiting inspection, in progress, failed/re-inspect, CC blocked on QC | High |
| DB-01-7 | Driver Supervisor cards | Inspections, maintenance clearance, rejections, leave, attendance gaps, open orders | High |
| DB-01-8 | Quality & resilience pass | Verify counts align with work screens; confirm dashboard survives partial failures; confirm no regression for existing role dashboards | Medium |

---

## Dependencies

| Prerequisite | Why it matters |
|--------------|----------------|
| **YARD-01** — Site assignment for operational roles | Site-scoped users must have a defined working site |
| **GT-01** — Gate operations | Gate visit and gate-in/out queues |
| **SC-01** — Scaling / weighing | Scale-in, scale-out, and queue token work |
| **CC-01** — Command Center & bay assignment | Queue and bay metrics |
| **LD-01** — Loading & unloading | Load/unload progress and bay readiness |
| **QC-01** — Physical QC checkpoint | QC inspection and clearance queues |
| **DS-01** — Driver Supervisor | Fleet inspection, attendance, and leave |

**Related (not blocking):** GPS-01 map dashboard — complementary product; different audience and use case.

---

## Definition of Done

- [ ] All eight in-scope roles have role-appropriate KPI cards on the Dashboard
- [ ] Site-scoped counts never include other sites’ data
- [ ] Unassigned site operators see warning + zero counts (fail-closed)
- [ ] Gate Supervisor and Driver Supervisor see organisation-wide metrics as specified
- [ ] Each card navigates to the correct filtered work screen
- [ ] Excluded roles and existing office-role dashboards unchanged
- [ ] Product owner confirms dashboard counts match operational work screens during a live walkthrough

---

*Sprint 5 · Epic: Core Platform · Module spec: `05-modules/01-core/role-dashboard-kpi-widgets.md`*
