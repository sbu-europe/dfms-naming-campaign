---
jira_key: DFS-065
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: YARD-01
title: Yard Foundation — Operator Site Assignment & Shared Yard Rules
epic: Yard Foundation
status: In Progress
story_points: 8
assignee: ~
carry_subtasks:
  - YARD-01-1
  - YARD-01-3
  - YARD-01-4
  - YARD-01-8
source: ../../../sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md
---

# YARD-01 — Yard Foundation (Sprint 5 Carry-over)

> **Full story context, operator site assignment rules, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md`](../../../../sprint-4/10-yard-foundation/YARD-01-poi-scoped-yard-platform.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority | Status |
|---|----------|------|---------------|---------------|----------|--------|
| YARD-01-1 | Complete operator-to-site assignment admin + one-time migration from existing invite data | DFS-065-1 | Partial | Finish Tenant Admin UI for assigning users to operational POIs per `role_code`; run one-time migration to carry over existing gate invite data to the formal assignment model | High | Done |
| YARD-01-3 | Complete source vs destination flag on gate-in; backfill existing gate visits | DFS-065-3 | Partial | All new gate-ins record `source` or `destination` visit type. Backfill script for existing gate visits without the flag — document backfill approach and run | High | Done |
| YARD-01-4 | Current yard step on TO; CC/QC/loading screens filter waiting work by `sub_state` | DFS-065-4 | Partial | Ensure command center, QC, and loading screens use `sub_state` filter (not raw log entries) for their waiting-work queues; verify `sub_state` badge visible on TO admin | High | Done |
| YARD-01-8 | E2E test coverage | ~ | Pending | Validate POI-scoped yard access, source/destination visit handling, shared yard rules, and yard-step filtering across all six yard roles | Medium | Not done |

---

## Open DoD Items (from Sprint 4)

- [x] Tenant admin can assign and change operational POIs per role_code; invites create assignments
- [x] Every new gate-in records source vs destination; existing visits corrected (YARD-01-3)
- [x] Transport order shows current yard step; CC/QC/loading screens filter on `sub_state` (YARD-01-4)

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Operator-to-site assignment admin complete; invite flow creates assignment; one-time migration from existing invite data runs cleanly (YARD-01-1)
- [x] All new gate-ins record source/destination; backfill for existing visits applied (YARD-01-3)
- [x] CC, QC, and loading screens filter by `sub_state`; `sub_state` badge on TO admin (YARD-01-4)
- [ ] E2E sub-task YARD-01-8 passes in staging (all six yard roles: gateman, scaling_operator, CC officer, loading, unloading, QC)

---

*Sprint 4 completion: ~75% | Sprint 5 target: 100% | Jira: DFS-065*
