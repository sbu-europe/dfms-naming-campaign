---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-03
title: Vendor Portal Views — Active Bids / Active Trips / Completed Trips
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-03-8
  - VM-03-9
  - VM-03-10
  - VM-03-11
feedback_items:
  - FB-013
  - FB-014
source: ../../../sprint-4/08-vendor-management/VM-03-vendor-portal-views.md
---

# VM-03 — Vendor Portal Views (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-03-vendor-portal-views.md`](../../../sprint-4/08-vendor-management/VM-03-vendor-portal-views.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Sprint 4 Exit | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-03-8 | Integration tests — vendor A `NON_CONTRACTUAL`@T1 + `CONTRACTUAL`@T2 sees independent surfaces | Pending | Write integration tests: vendor approved at two tenants with different types sees correct isolated views per tenant | Medium | — |
| VM-03-9 | TO lifecycle management in Vendor Portal | Pending | Add vendor-facing TO lifecycle screens: states (assigned / in progress / completed / closed), TO detail view, allowed actions per state. Vendor sees only their own TOs per tenant. | High | FB-013 |
| VM-03-10 | App auto-refresh on tab change | Pending | When vendor switches Active Bids / Active Trips / Completed Trips tabs, lists refresh from server automatically (not only on manual pull-to-refresh) | Medium | FB-014 |
| VM-03-11 | E2E test coverage | Pending | Validate active bids, active trips, completed trips, tenant-scoped visibility, lifecycle views, and tab auto-refresh | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Multi-tenant isolation integration tests pass (VM-03-8)
- [ ] TO lifecycle management screens in Vendor Portal (VM-03-9, FB-013)
- [ ] Tab auto-refresh from server on switch (VM-03-10, FB-014)
- [ ] E2E sub-task VM-03-11 passes in staging

---

*Sprint 4 completion: ~70% | Sprint 5 target: 100%*
