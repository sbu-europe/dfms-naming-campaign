---
jira_key: DFS-060
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: POD-01
title: TO Closure — POD & Gate-Out Linkage
epic: Lifecycle
status: Carry-over
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - POD-01-6
  - POD-01-7
  - POD-01-8
  - POD-01-9
  - POD-01-10
  - POD-01-11
source: ../../../sprint-4/07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md
---

# POD-01 — TO Closure — POD & Gate-Out Linkage (Sprint 5 Carry-over)

> **Full story context, lane-specific closure rules, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md`](../../../sprint-4/07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| POD-01-6 | Auto-close trigger — signal/hook that evaluates closure rules when any prerequisite is fulfilled | DFS-060-6 | Not done | Implement post-save signal/hook on POD upload, gate-out, QC pass, and unload completion. When the final lane-specific prerequisite is met, system transitions TO → `closed` automatically without manual intervention | High |
| POD-01-7 | Closure attempt API (POST) — validate lane-specific rules and transition TO to `closed` or return blocking reasons | DFS-060-7 | Not done | `POST /api/v1/transport-orders/{to_id}/close` — 200 on success; 422 with explicit blocking reason list when prerequisites unmet | High |
| POD-01-8 | Closure status API (GET) — checklist state and blocking reasons | DFS-060-8 | Not done | `GET /api/v1/transport-orders/{to_id}/closure-status` — returns per-flag checklist state (pod_uploaded, scale_out_done, gate_out_done, loading_complete, unloading_complete, qc_passed) and list of unmet prerequisites | High |
| POD-01-9 | Planner closure UI — closure dashboard with checklist progress, manual close button, exceptions list | DFS-060-9 | Not done | Django Admin: `TOClosureAdmin` list view with closure checklist flags per TO + exceptions changelist filtered to TOs blocked from closing; manual close action with prerequisite guard | High |
| POD-01-10 | Audit logging on closure attempts — success and blocked attempts with actor, timestamp, blocking reasons | DFS-060-10 | Partial | Complete audit logging: every closure attempt (success or blocked) must log actor, timestamp, lane, and blocking reasons | High |
| POD-01-11 | E2E test coverage | ~ | Pending | Validate POD upload gate, scale-out/gate-out prerequisites, closure blocking reasons, auto-close trigger, audit trail | Medium |

---

## Closure Rule Reference (from Sprint 4 — unchanged)

| Lane | Required prerequisites before closure |
|------|--------------------------------------|
| FG outbound | loading complete + scale-out + gate-out + POD |
| FG inbound | unloading complete + scale-out + gate-out + POD |
| RM inbound | unloading complete + sampling done + QC pass + scale-out + gate-out + POD |

---

## Open DoD Items (from Sprint 4)

- [ ] POST closure API returns 200 on success or 422 with explicit blocking reasons
- [ ] Auto-close trigger fires when final prerequisite fulfilled without manual intervention
- [ ] Django Admin shows closure checklist per TO and exceptions list
- [ ] Every closure attempt (success or blocked) audit-logged
- [ ] UAT: FG inbound TO closes only after unload + scale-out + gate-out + POD
- [ ] UAT: RM inbound TO closes only after unload + sampling + QC pass + scale-out + gate-out + POD

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Auto-close trigger implemented; fires correctly on last prerequisite event (POD-01-6)
- [ ] Closure attempt API returns 200 or 422 with blocking reasons (POD-01-7)
- [ ] Closure status API returns full checklist state per lane (POD-01-8)
- [ ] Planner closure dashboard + exceptions list in Django Admin (POD-01-9)
- [ ] Audit logging complete on all closure attempts (POD-01-10)
- [ ] E2E sub-task POD-01-11 passes in staging

---

*Sprint 4 completion: ~55% | Sprint 5 target: 100% | Jira: DFS-060*
