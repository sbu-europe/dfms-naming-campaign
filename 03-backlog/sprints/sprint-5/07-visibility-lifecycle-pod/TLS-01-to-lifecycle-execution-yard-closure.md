---
jira_key: DFS-059
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: TLS-01
title: TO Lifecycle — Execution, Yard Step & Timeline Audit
epic: Lifecycle
status: Carry-over
story_points: 13
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - TLS-01-2
  - TLS-01-4
  - TLS-01-7
  - TLS-01-8
  - TLS-01-10
  - TLS-01-11
feedback_items:
  - FB-002
  - FB-004
source: ../../../sprint-4/07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md
---

# TLS-01 — TO Lifecycle, Execution, Yard Step & Timeline (Sprint 5 Carry-over)

> **Full story context, canonical status model, yard integration matrix, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md`](../../../sprint-4/07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| TLS-01-2 | Complete `TO_STATUS_TRANSITIONS` + driver rules; yard integration matrix fully wired in GT/SC/CC/LD/QC services | DFS-059-2 | Partial | Verify all yard modules emit timeline events in same `atomic()` as domain write per §1.6; confirm `sub_state` cleared on status reset boundaries | High | **Done** — `TO_STATUS_TRANSITIONS` confirmed covering full `created → … → dispatched → in_transit_*` chain; driver rules in `state_machine.py` enforce gate; `from_status` added to `timeline_for_to()` |
| TLS-01-4 | `TOTimelineInline` — TabularInline under `TransportOrderAdmin` (status, sub_state, actor, source_module, created_at) | DFS-059-4 | Not done | Implement `TOTimelineInline` using `TOStatusTransitionLog`; read-only; visible on TO admin change page | Medium |
| TLS-01-7 | Timeline REST API — `GET /api/v1/transport-orders/{to_id}/timeline` | DFS-059-7 | Not done | Return ordered `TOStatusTransitionLog` entries: status, sub_state, source_module, actor, timestamps. This closes FB-002. | High |
| TLS-01-8 | Status REST API — `GET /api/v1/transport-orders/{to_id}/status` | DFS-059-8 | Not done | Return current `status`, `sub_state`, `flow_lane`. Required by DM-01 detail API and by FB-002. | High |
| TLS-01-10 | Complete `apply_to_status_transition()` — `POST /api/v1/transport-orders/{to_id}/transitions` (admin/break-glass) | DFS-059-10 | Partial | Complete validation against `TO_STATUS_TRANSITIONS`; ensure yard modules continue using service helpers directly (not this endpoint) | Medium | **Done** — `apply_to_status_transition()` confirmed in `lifecycle/transition_service.py`; `timeline_for_to` returns `from_status` + `actor_role` + `source_module` for full audit trail |
| TLS-01-11 | E2E test coverage | ~ | Pending | Validate TO lifecycle transitions, yard sub-state audit timeline, invalid-transition guards, status / timeline APIs | Medium |

---

## Feedback Items

### FB-002 — Timestamp history on TO details page

**AC Amendment** (TLS-01 AC-5): `GET …/timeline` must return a full timestamp history for every lifecycle status AND yard sub-state change. Closed by TLS-01-7. The timeline must include: gate-in, scale-in, CC assignment, loading started/completed, unloading started/completed, QC events, scale-out, gate-out, POD, closure.

### FB-004 — Align TO state sequence (cross-story)

**Impact on TLS-01**: `TO_STATUS_TRANSITIONS` must cleanly support `created → assigned → ready_for_dispatch → dispatched → in_transit_*`. The transition graph must not allow driver actions before `dispatched`. Confirm alignment with DS-01 and DM-01. See cross-story journey [E2E-01](../11-e2e-cross-story/E2E-01-to-state-sequence.md).

---

## Open DoD Items (from Sprint 4)

- [x] `TO_STATUS_TRANSITIONS` enforces forward-only canonical status changes (AC-2)
- [ ] TP, TDO, and Driver can view current `status` and `sub_state` (AC-3)
- [x] `maybe_clear_sub_state_on_status()` called on reset boundaries
- [x] Invalid canonical transition returns stable descriptive error
- [ ] Timeline and status GET APIs return `status`, `sub_state`, `flow_lane`
- [ ] `TOStatusTransitionLogAdmin` + timeline inline on TO admin
- [ ] Automated tests: canonical status bumps and sub_state-only paths
- [ ] UAT: TP, TDO, Driver view current status and sub_state

---

## Sprint 5 Definition of Done (remaining items only)

- [x] `TO_STATUS_TRANSITIONS` confirmed: full planning → dispatch → execution graph aligned (TLS-01-2, FB-004)
- [x] `timeline_for_to()` returns `from_status`, `actor_role`, `source_module` per entry (TLS-01-2, FB-004)
- [x] Break-glass `apply_to_status_transition()` in `lifecycle/transition_service.py` validated (TLS-01-10)
- [ ] `TOTimelineInline` visible on TO admin (TLS-01-4)
- [ ] `GET …/timeline` returns full ordered history including yard sub-state events (TLS-01-7, FB-002)
- [ ] `GET …/status` returns current status, sub_state, flow_lane (TLS-01-8)
- [ ] E2E sub-task TLS-01-11 passes in staging

---

*Sprint 4 completion: ~65% | Sprint 5 target: 100% | Jira: DFS-059*
