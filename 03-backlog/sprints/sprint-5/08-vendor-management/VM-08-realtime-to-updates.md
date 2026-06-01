---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-08
title: Real-Time TO Updates in Vendor Portal
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-08-3
  - VM-08-4
  - VM-08-5
feedback_items:
  - FB-013
source: ../../../sprint-4/08-vendor-management/VM-08-realtime-to-updates.md
---

# VM-08 — Real-Time TO Updates (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-08-realtime-to-updates.md`](../../../sprint-4/08-vendor-management/VM-08-realtime-to-updates.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Sprint 4 Exit | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-08-3 | Vendor Mobile — subscribe or poll strategy + in-app refresh on foreground | Partial | Finalise and implement refresh strategy (polling or subscribe); in-app refresh when vendor brings app to foreground | Medium | — |
| VM-08-4 | TO lifecycle events — emit/consume status transitions so Vendor Portal lifecycle views (VM-03-9) stay in sync | Pending | TO status transition events emitted from TLS-01 and consumed by vendor portal lifecycle views; closed-trip visibility also covered | High | FB-013 |
| VM-08-5 | E2E test coverage | Pending | Validate vendor-scoped TO updates, delta refresh/polling, lifecycle event propagation, closed-trip visibility | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Refresh strategy implemented; in-app foreground refresh works (VM-08-3)
- [ ] TO lifecycle events emitted and vendor portal lifecycle views stay in sync (VM-08-4, FB-013)
- [ ] E2E sub-task VM-08-5 passes in staging

---

*Sprint 4 completion: ~55% | Sprint 5 target: 100%*
