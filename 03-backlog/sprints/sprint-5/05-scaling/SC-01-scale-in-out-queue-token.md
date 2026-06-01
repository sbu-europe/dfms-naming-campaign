---
jira_key: DFS-055
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: SC-01
title: Scaling — Scale-In, P.C. Code Capture & Scale-Out
epic: Scaling / Weighing
status: Carry-over
story_points: 8
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - SC-01-5
  - SC-01-6
  - SC-01-8
  - SC-01-9
  - SC-01-14
source: ../../../sprint-4/05-scaling/SC-01-scale-in-out-queue-token.md
---

# SC-01 — Scale-In, P.C. Code & Scale-Out (Sprint 5 Carry-over)

> **Full story context, weight calculation rules, P.C. code operator-input rules, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/05-scaling/SC-01-scale-in-out-queue-token.md`](../../../sprint-4/05-scaling/SC-01-scale-in-out-queue-token.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| SC-01-5 | Scale-in REST API (POST) — complete gate-in prerequisite enforcement + 409 on duplicate active P.C. code at POI | DFS-055-5 | Partial | Enforce gate-in prerequisite check; return HTTP 409 when P.C. code already exists for an active `waiting`/`assigned` token at the same POI | Medium |
| SC-01-6 | Scale-in list/detail REST API (GET with filters: date, vehicle, TO number, pc_code, status) | DFS-055-6 | Not done | Implement `GET /api/v1/scaling/scale-in` with all filters; `GET /api/v1/scaling/scale-in/{id}` detail endpoint | Medium |
| SC-01-8 | Scale-out detail REST API (GET) — includes net weight and gate-pass data | DFS-055-8 | Partial | Complete `GET /api/v1/scaling/scale-out/{id}` to include computed net weight and all gate-pass printable fields | Medium |
| SC-01-9 | Queue token print template — entered P.C. code, Vehicle Number, Product Type, scale-in datetime, weights, TO reference | DFS-055-9 | Pending | Implement printable queue slip template (browser print CSS acceptable); must include all fields listed in AC-3 | Medium |
| SC-01-14 | E2E test coverage | ~ | Pending | Validate scale-in with P.C. code, queue token creation, CC queue handoff, scale-out, net weight calculation, immutability, print data, and TLS-01 events | Medium |

---

## Open AC Items (from Sprint 4 DoD)

- [ ] `ScaleInAdmin` accepts optional `pc_code`; rejects duplicate active P.C. code at same POI (AC-1 / AC-3)
- [ ] Scale-in and scale-out REST APIs enforce gate-in prerequisite; return correct HTTP codes (SC-01-5)
- [ ] Weight records and P.C. code immutable after scale-out; PATCH/PUT returns 403 on locked sessions
- [ ] UAT: scale-in with P.C. code → slip printed → CC sees vehicle in queue → scale-out → net weight correct → gate pass printed
- [ ] Unit tests: P.C. code duplicate validation, immutability after scale-out, gate-in prerequisite

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Scale-in API enforces gate-in prerequisite; 409 on duplicate active P.C. code at POI (SC-01-5)
- [ ] Scale-in list/detail API with all filters implemented (SC-01-6)
- [ ] Scale-out detail API includes net weight and gate-pass data (SC-01-8)
- [ ] Queue token print template renders all required fields (SC-01-9)
- [ ] E2E sub-task SC-01-14 passes in staging

---

*Sprint 4 completion: ~70% | Sprint 5 target: 100% | Jira: DFS-055*
