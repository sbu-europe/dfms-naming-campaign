---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-06
title: Bid Evaluation — Compare, Award & Winning Log
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-06-1
  - VM-06-2
  - VM-06-3
  - VM-06-7
  - VM-06-8
  - VM-06-9
  - VM-06-10
feedback_items:
  - FB-015
source: ../../../sprint-4/08-vendor-management/VM-06-bid-evaluation.md
---

# VM-06 — Bid Evaluation (Sprint 5 Carry-over)

> **Product flow revision (2026-06-09):** Evaluation is **TO-centric** — expand each TO to see participating vendors; **award per TO** independently. See [**TO-BID-FLOW-REVISION.md**](TO-BID-FLOW-REVISION.md).

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-06-bid-evaluation.md`](../../../../sprint-4/08-vendor-management/VM-06-bid-evaluation.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-06-1 | `GET /api/v1/tdo/transport-orders/{to_id}/bids` — joined bid + vendor metadata; sort by cost, offered count, rating, time | Done | Complete bid list API; ensure sort options work; include vendor metadata in response | Medium | — |
| VM-06-2 | Comparison aggregates — min/avg/max rate; highlight lowest bid | Done | Complete aggregate calculations; lowest bid highlighted in response | Medium | — |
| VM-06-3 | Award validation — Σ `awarded_vehicle_count` ≤ `required_vehicle_count`; per line ≤ vendor `offered_vehicle_count`; session still awardable | Done | Enforce one-winner default when `required_vehicle_count = 1` (aligns with VM-06-9) | Medium | — |
| VM-06-7 | Audit — award decision payload; reject-all reason | Done | Complete audit record on award and reject-all actions | Medium | — |
| VM-06-8 | TDO bid evaluation UX — winner indication, window timeline display, help text | Done | TDO evaluation screen shows clear winner badge on awarded bid; bidding window open/close timeline; UX copy aligned with bid surfaces | Medium | FB-015 |
| VM-06-9 | Single-winner default when `required_vehicle_count = 1` — simplify award UI/validation | Done | When TO has `required_vehicle_count = 1`, award UI shows single-winner selection only; validation prevents multi-vendor award | High | — |
| VM-06-10 | E2E test coverage | Pending | Validate bid comparison, award math, reject-all, winning log, single-winner default, execution handoff | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Bid list API complete with sort and vendor metadata (VM-06-1)
- [x] Comparison aggregates with lowest bid highlighted (VM-06-2)
- [x] Award validation enforces capacity constraints; single-winner default when count = 1 (VM-06-3, VM-06-9)
- [x] Award and reject-all audit logging complete (VM-06-7)
- [x] TDO evaluation UX with winner badge and window timeline (VM-06-8, FB-015)
- [ ] E2E sub-task VM-06-10 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
