---
jira_key: DFS-060
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: POD-01
title: TO Closure — POD & Gate-Out Linkage
epic: Lifecycle
status: Pending
story_points: 5
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) (Phase 1)"
  - "§6.15.4.1 QC Pass/Fail/Auto-Pass Tracking (Phase 1)"
---

# POD-01 — TO Closure — POD & Gate-Out Linkage

## User Story

**As a** Transport Planner  
**I want** a **TO** to close only when POD and operational checkpoints are satisfied  
**So that** compliance matches operational reality

## Business Context

**§6.8.7**: unloading personnel capture bags/weight/unload end; **driver confirms with POD attachment**; **gate-out** recorded; auto-close when **QC Pass + POD**.

For Sprint 4 raw-material scope, QC capture is in **QC-01** and intentionally simplified to:
- sampling completion flag (`sampling_done`: yes/no)
- QC decision flag (`qc_passed`: yes/no)

Detailed physical inspection and lab-process branching from §6.15 remains out of this sprint backlog.

**§6.8.8 Trip costing** is **out of Sprint 4 backlog** — do not implement cost sheets in this story.

All closure rules apply to the **TO** only (no separate Trip id).

## Acceptance Criteria

### AC-1: Unloading confirmation
- [ ] Capture unload end data per **LD-01** at destination; surface on closure checklist

### AC-2: Driver POD
- [ ] **TO** cannot move to **Closed** without **POD artifact** linked (from DM-01)

### AC-3: QC gating
- [ ] If QC outcome exists for **TO**: **QC Fail** blocks closure; **QC Pass** allows closure
- [ ] For raw-material TOs, closure requires sampling checkpoint captured before QC decision

### AC-4: Gate-out
- [ ] Gate-out timestamp required in closure path (**GT-01**)

### AC-5: Auto-close rule
- [ ] Closure matrix is flow-lane aware and auditable:
  - FG outbound: loading complete + scale-out + gate-out + POD
  - FG inbound: unloading complete + scale-out + gate-out + POD
  - RM inbound: unloading complete + sampling done + QC pass + scale-out + gate-out + POD
- [ ] When lane-specific rules are satisfied, system transitions **TO** to **Closed** (sub-state per **§6.8.5**); audit entry

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| POD-01-1 | ClosureChecklist model + migration (per-TO prerequisite flags: pod_uploaded, scale_out_done, gate_out_done, loading_complete, unloading_complete, qc_passed) | DFS-060-1 | Pending |
| POD-01-2 | ClosureRuleEngine service — lane-aware rule evaluation (FG outbound vs FG inbound vs RM inbound) | DFS-060-2 | Pending |
| POD-01-3 | TOClosureAdmin — Django Admin list view showing closure checklist status per TO, filterable by lane and closure readiness | DFS-060-3 | Pending |
| POD-01-4 | TOClosureAdmin manual close action — save_model guard validation enforcing all lane-specific prerequisites before allowing close | DFS-060-4 | Pending |
| POD-01-5 | Exceptions list view — Django Admin changelist filtered to TOs blocked from closing, with blocking-reason column | DFS-060-5 | Pending |
| POD-01-6 | Auto-close trigger — signal/hook that evaluates closure rules when any prerequisite is fulfilled (POD upload, gate-out, QC pass, etc.) | DFS-060-6 | Pending |
| POD-01-7 | Closure attempt API (POST) — validate lane-specific rules and transition TO to Closed or return blocking reasons | DFS-060-7 | Pending |
| POD-01-8 | Closure status API (GET) — return checklist state and blocking reasons for a TO | DFS-060-8 | Pending |
| POD-01-9 | Planner closure UI — closure dashboard with checklist progress, manual close button, exceptions list | DFS-060-9 | Pending |
| POD-01-10 | Audit logging on closure attempts — log success and blocked attempts with actor, timestamp, blocking reasons | DFS-060-10 | Pending |

## API Endpoints

```
POST   /api/v1/transport-orders/{to_id}/close              # Attempt TO closure (validates lane-specific rules)
GET    /api/v1/transport-orders/{to_id}/closure-status      # Closure checklist state + blocking reasons
GET    /api/v1/transport-orders/closure-exceptions           # List TOs blocked from closing (filterable by lane, POI)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View closure checklist status | Transport Planner, TDO, Operations Manager |
| Attempt manual TO closure | Transport Planner |
| View closure exceptions list | Transport Planner, Operations Manager |

- Auto-close triggers run as system actions when prerequisite events are received
- Manual close requires Transport Planner role and all lane-specific prerequisites satisfied

## Dependencies

- **Requires**: DM-01, GT-01, LD-01, TLS-01, QC-01

## Definition of Done

- [ ] ClosureChecklist model persists per-TO prerequisite flags (pod_uploaded, scale_out_done, gate_out_done, loading_complete, unloading_complete, qc_passed)
- [ ] ClosureRuleEngine evaluates lane-specific rules: FG outbound (load + scale-out + gate-out + POD), FG inbound (unload + scale-out + gate-out + POD), RM inbound (unload + sampling + QC pass + scale-out + gate-out + POD)
- [ ] POST closure API returns 200 on success or 422 with explicit blocking reasons when prerequisites are unmet
- [ ] Auto-close trigger fires when the final prerequisite is fulfilled and transitions TO to Closed without manual intervention
- [ ] Missing POD blocks closure for all lanes; missing QC pass blocks closure for RM inbound lane
- [ ] Django Admin shows closure checklist per TO and exceptions list for TOs blocked from closing
- [ ] Every closure attempt (success or blocked) is audit-logged with actor, timestamp, lane, and blocking reasons
- [ ] No §6.8.8 trip costing scope implemented in this story
- [ ] UAT: FG inbound TO closes only after unload + scale-out + gate-out + POD
- [ ] UAT: RM inbound TO closes only after unload + sampling + QC pass + scale-out + gate-out + POD
