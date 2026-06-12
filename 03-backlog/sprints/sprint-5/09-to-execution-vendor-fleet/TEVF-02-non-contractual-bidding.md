---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: TEVF-02
title: Non-Contractual Vendor — Bidding Workflow
epic: TO Execution — Vendor Fleet
status: Carry-over
carry_subtasks:
  - TEVF-02-5
  - TEVF-02-6
  - TEVF-02-7
  - TEVF-02-8
  - TEVF-02-9
feedback_items:
  - FB-015
  - FB-016
  - FB-018
source: ../../../sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md
---

# TEVF-02 — Non-Contractual Bidding (Sprint 5 Carry-over)

> **Product flow revision (2026-06-09):** Multi-TO bidding uses a **Bid bundle** (same TR) created from the TO list, not a bundle at TO creation. See [**TO-BID-FLOW-REVISION.md**](../08-vendor-management/TO-BID-FLOW-REVISION.md).

> **Full story context lives in Sprint 4:**
> [`sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md`](../../../sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| TEVF-02-5 | Execution handoff — post-award vendor sees outcome + enters VM-07 / VM-08 tracks | Done | After award: VM-07 confirmation → `ready_for_dispatch` → vendor Start Trip (TLS-01) → observe yard progress (VM-08) → Complete Trip at `delivered_unloaded`. See [`VENDOR-TRIP-LIFECYCLE.md`](../08-vendor-management/VENDOR-TRIP-LIFECYCLE.md) | High | — |
| TEVF-02-6 | E2E test coverage | Pending | Validate scripted journey: publish → N bids → window update → award / reject-all; align with TESTING-FLOW.md | Medium | — |
| TEVF-02-7 | One vehicle per TO — publish and bid flows enforce `required_vehicle_count = 1` and `offered_vehicle_count ≤ 1` | Done | End-to-end enforcement: publish (VM-04-10) + bid (VM-05-10) + TEVF-02 journey all cap at 1 vehicle | High | FB-016 |
| TEVF-02-8 | Single TR → multiple TOs in one bid session | Done | From one TR, create multiple TOs under a single bidding session; publish and award to non-contractual vendors; aligns with VM-04-11, VM-04-12 | Medium | FB-018 |
| TEVF-02-9 | Bid view UX — vendor + TDO surfaces show winner, window copy, TDO context | Done | Align with VM-05-9 and VM-06-8; TEVF-02 journey must validate UX on both surfaces | Medium | FB-015 |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Post-award execution handoff to VM-07 and VM-08 tracks (TEVF-02-5)
- [x] One-vehicle-per-TO enforcement across full publish-bid-award chain (TEVF-02-7, FB-016)
- [x] Single TR → multiple TOs in one bidding session (TEVF-02-8, FB-018)
- [x] Bid view UX aligned on both vendor and TDO surfaces (TEVF-02-9, FB-015)
- [ ] E2E sub-task TEVF-02-6 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
