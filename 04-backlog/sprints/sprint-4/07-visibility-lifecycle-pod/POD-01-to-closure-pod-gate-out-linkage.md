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
assignee: ~
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
| POD-01-1 | Closure rule engine + API | DFS-060-1 | Pending |
| POD-01-2 | Planner closure UI + exceptions list | DFS-060-2 | Pending |

## Dependencies

- **Requires**: DM-01, GT-01, LD-01, TLS-01, QC-01

## Definition of Done

- [ ] UAT: FG inbound TO closes only after unload + scale-out + gate-out + POD
- [ ] UAT: missing POD → cannot close; with POD + gate-out + QC pass (RM lane) → **TO** closes
- [ ] No §6.8.8 costing scope in Sprint 4
