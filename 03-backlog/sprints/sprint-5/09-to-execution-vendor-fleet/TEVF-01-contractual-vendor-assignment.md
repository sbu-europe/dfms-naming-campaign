---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: TEVF-01
title: Contractual Vendor Assignment (TDO – Vendor Fleet)
epic: TO Execution — Vendor Fleet
status: Carry-over
carry_subtasks:
  - TEVF-01-2
  - TEVF-01-8
source: ../../../sprint-4/09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md
---

# TEVF-01 — Contractual Vendor Assignment (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md`](../../../sprint-4/09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority |
|---|----------|---------------|---------------|----------|
| TEVF-01-2 | Assignment persistence — TO↔vendor link with capacity split / multi-vendor rows; FK integrity vs `required_vehicle_count` | Done | Implement TO↔vendor assignment record; capacity split row per vendor; enforce FK integrity against TO `required_vehicle_count` | Medium |
| TEVF-01-8 | E2E test coverage | Pending | Validate contractual vendor assignment, rate hiding (vendor cannot see contracted rate), execution handoff, vendor TO visibility | Medium |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] TO↔vendor assignment persistence with capacity split and FK integrity (TEVF-01-2)
- [x] Contracted rate hidden from vendor-facing screens (rate-hiding rule from Sprint 4 context)
- [ ] E2E sub-task TEVF-01-8 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
