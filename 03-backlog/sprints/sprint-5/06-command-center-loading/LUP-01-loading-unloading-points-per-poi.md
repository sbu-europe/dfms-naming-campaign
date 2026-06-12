---
jira_key: DFS-063
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: LUP-01
title: Loading & Unloading Points — Create & Maintain per POI
epic: Command Center
status: In Progress
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - LUP-01-2
  - LUP-01-4
  - LUP-01-5
  - LUP-01-6
  - LUP-01-7
  - LUP-01-8
  - LUP-01-9
feedback_items:
  - FB-005
source: ../../../sprint-4/06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md
---

# LUP-01 — Loading & Unloading Points per POI (Sprint 5 Carry-over)

> **Full story context, business rules, model definition, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md`](../../../sprint-4/06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority | Status |
|---|----------|------|---------------|---------------|----------|--------|
| LUP-01-2 | Complete `LoadingUnloadingPointAdmin` standalone form — save_model validates unique code per POI + active POI check | DFS-063-2 | Partial | Finish `save_model` validation: reject duplicate `short_code` within POI; reject creation under inactive POI | Medium | Done |
| LUP-01-4 | Create L/U point API (POST) | DFS-063-4 | Not done | `POST /api/v1/pois/{poi_id}/loading-unloading-points` — create point under POI; returns created point with validation errors on duplicate code or inactive POI | Medium | Done |
| LUP-01-5 | List-by-POI API (GET) | DFS-063-5 | Not done | `GET /api/v1/pois/{poi_id}/loading-unloading-points?type=&is_active=` — consumed by CC-01 and LD-01; filterable by operation type and active status | Medium | Done |
| LUP-01-6 | Update API (PATCH) | DFS-063-6 | Not done | `PATCH /api/v1/loading-unloading-points/{id}` — update name, status (activate/deactivate), notes | Medium | Done |
| LUP-01-7 | Audit logging — create / update / deactivate (who, when, what changed) | DFS-063-7 | Not done | Implement audit log entries on every L/U point mutation; align with AC-3 | Medium | Done |
| LUP-01-8 | UAT seed data — at least two POIs with multiple L/U points | DFS-063-8 | Not done | Add seed/fixture with 2+ POIs having both `LOAD` and `UNLOAD` type points; required for CC-01 and LD-01 UAT | Medium | Done |
| LUP-01-9 | E2E test coverage | ~ | Pending | Validate POI-scoped L/U point creation, activation/deactivation, list consumption by CC-01 and LD-01, audit logging | Medium | Not done |

---

## Open AC Items (from Sprint 4 DoD)

- [x] Audit log records who/when/what on every create, update, and deactivate action (AC-3)
- [x] List-by-POI API returns points filterable by operation type and active status (AC-4)
- [x] Validation errors returned for duplicate short code within a POI and for inactive/invalid POI (AC-4)
- [x] At least two POIs in UAT each have multiple L/U points; CC-01 retrieves the list
- [x] Field dictionary documented and shared with frontend for CC-01/LD-01 integration

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Admin form `save_model` validates unique short code per POI and rejects inactive POI (LUP-01-2)
- [x] Create, list-by-POI, and update APIs implemented and returning correct validation errors (LUP-01-4, 5, 6)
- [x] Audit log on all mutations (LUP-01-7)
- [x] UAT seed data with 2+ POIs and multiple L/U points per POI (LUP-01-8)
- [ ] E2E sub-task LUP-01-9 passes in staging

---

*Sprint 4 completion: ~55% | Sprint 5 target: 100% | Jira: DFS-063*
