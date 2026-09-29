---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-05
title: Bid Submission Windows + Structured Bid Payload
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-05-5
  - VM-05-6
  - VM-05-7
  - VM-05-9
  - VM-05-10
  - VM-05-11
feedback_items:
  - FB-015
  - FB-016
source: ../../../sprint-4/08-vendor-management/VM-05-bid-submission.md
---

# VM-05 — Bid Submission (Sprint 5 Carry-over)

> **Product flow revision (2026-06-09):** Vendor submits against a **Bid** (Bid ID), selecting which TOs in the bundle they can execute via checkmarks. See [**TO-BID-FLOW-REVISION.md**](TO-BID-FLOW-REVISION.md).

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-05-bid-submission.md`](../../../../sprint-4/08-vendor-management/VM-05-bid-submission.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-05-5 | `GET .../bids/{bid_id}` — vendor reads own bid | Done | Implement vendor read-own-bid API; 403 for other vendors' bids | Medium | — |
| VM-05-6 | `DELETE .../bids/{bid_id}` (withdraw) — before close only; status `WITHDRAWN`; no field mutation | Done | Implement withdraw within window; status set to `WITHDRAWN`; no bid data mutation on withdraw; tenant policy flag | Medium | — |
| VM-05-7 | TDO manual close/cancel bidding without award — align session + bid terminal states | Done | TDO can close a bidding session without awarding; all open bids move to `SESSION_CLOSED` state | Medium | — |
| VM-05-9 | Bid view UX — TDO/publish context on bid detail, winner indication, window labels | Done | Vendor mobile bid detail shows: TDO/publish context, bidding window open/close labels, winner badge when session awarded | Medium | FB-015 |
| VM-05-10 | Cap `offered_vehicle_count` to **1** when TO publish enforces single-vehicle model | Done | API rejects `offered_vehicle_count > 1`; UI caps at 1; aligns with VM-04-10 | High | FB-016 |
| VM-05-11 | E2E test coverage | Pending | Validate bid submission, one-bid-per-vendor guard, window enforcement, withdraw policy, winner visibility, one-vehicle cap | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Vendor read-own-bid API; 403 for other vendors (VM-05-5)
- [x] Bid withdrawal within window; `WITHDRAWN` status (VM-05-6)
- [x] TDO manual close without award; terminal bid states (VM-05-7)
- [x] Bid view UX with winner indication and window labels (VM-05-9, FB-015)
- [x] `offered_vehicle_count` capped at 1 (VM-05-10, FB-016)
- [ ] E2E sub-task VM-05-11 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
