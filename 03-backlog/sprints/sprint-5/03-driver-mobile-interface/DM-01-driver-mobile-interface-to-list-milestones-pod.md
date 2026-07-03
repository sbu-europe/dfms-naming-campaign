---
jira_key: DFS-053
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: DM-01
title: Driver Mobile — TO List, Execution Milestones & POD
epic: Driver Mobile
status: In Progress
story_points: 8
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - DM-01-5
  - DM-01-12
  - DM-01-13
feedback_items:
  - FB-002
  - FB-003
  - FB-004
source: ../../../sprint-4/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md
---

# DM-01 — Driver Mobile — TO List, Milestones & POD (Sprint 5 Carry-over)

> **Full story context, lane-aware execution logic, POD AC, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md`](../../../sprint-4/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority | Status |
|---|----------|------|---------------|---------------|----------|--------|
| DM-01-5 | Driver TO detail API — complete `flow_lane`, status/sub-state, pickup/drop POI, product, qty, urgency, instructions, `allowed_next_transitions` (lane-filtered) | DFS-053-5 | Partial | Complete the response payload; ensure `allowed_next_transitions` is lane-filtered (RM inbound excludes source-leg statuses) | High | Done |
| DM-01-12 | **Trip Start** button — single lane-aware action replacing In Transit Source / Destination buttons | DFS-053-12 | Done | Replace two-button pattern with one **Trip Start** action. On press, advance TO to `in_transit_source` (FG outbound) or `in_transit_destination` (RM/FG inbound) based on `flow_lane` | High | Done |
| DM-01-13 | E2E test coverage | ~ | Not done | Validate driver TO list/detail, Trip Start per lane, milestone transitions, POD upload, access guards (non-owned TO returns 404) | Medium | Not done |

---

## Feedback Items

### FB-003 — Replace In Transit buttons with single Trip Start

**AC Amendment** (DM-01 AC-2): Remove separate "In Transit Source" and "In Transit Destination" driver action buttons. Replace with a single **Trip Start** action that advances the TO to the correct lane-aware status. UI must not expose the raw status name to the driver — use "Trip Start" as the label regardless of lane.

> **Status**: Done

### FB-004 — Align TO state sequence (cross-story)

**Impact on DM-01**: The driver must not see execution actions until TO is in `dispatched`. Trip Start button appears only when `can_execute = true`. Confirm cross-story alignment with DS-01 and TLS-01 (FB-004).

> **Status**: Done

### FB-002 — Timestamp history visible on TO details page

**Impact on DM-01**: Driver TO detail API must link to TLS-01 timeline (`GET …/timeline`). Full timestamp history (gate-in, loading, QC events) readable by driver on the TO detail screen. Closed by TLS-01-7 / TLS-01-8 — no new DM-01 sub-task required.

> **Status**: Done

---

## Sprint 5 Definition of Done (remaining items only)

- [x] TO detail API returns complete payload: `flow_lane`, status, sub_state, pickup/drop POI, product, qty, urgency, special instructions, `allowed_next_transitions` (lane-filtered) (DM-01-5)
- [x] Driver list API scoped to authenticated driver only; 404 for non-owned TOs (security gap from Sprint 4 DoD)
- [x] **Trip Start** button implemented; lane-aware transition fires correctly for FG outbound and RM/FG inbound (DM-01-12, FB-003)
- [x] FB-004 alignment: `can_execute()` returns `False` for planning statuses (`created`, `assigned`, `ready_for_dispatch`); Trip Start only enabled at `dispatched`; verified with DS-01 and TLS-01
- [x] Unit tests: dispatch gate (`can_execute`), planning-status guard, lane-specific Trip Start matrix (FB-004 tests added in `test_driver_state_machine.py`)
- [ ] E2E sub-task DM-01-13 passes in staging

---

*Sprint 4 completion: ~80% | Sprint 5 target: 100% | Jira: DFS-053*
