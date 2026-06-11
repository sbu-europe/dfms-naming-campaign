---
jira_key: DFS-064
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: QC-01
title: Raw-Material QC — Sampling & Pass/Fail Decision
epic: Lifecycle
status: In Progress
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - QC-01-4
  - QC-01-5
  - QC-01-6
  - QC-01-12
  - QC-01-13
  - QC-01-14
feedback_items:
  - FB-006
source: ../../../sprint-4/07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md
---

# QC-01 — Raw-Material QC — Sampling & Pass/Fail Decision (Sprint 5 Carry-over)

> **Full story context, QC workflow, resample/override rules, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md`](../../../sprint-4/07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority | Status |
|---|----------|------|---------------|---------------|----------|--------|
| QC-01-4 | Complete resample admin action — cancel active CC-01 unloading assignment; return TO to QC queue | DFS-064-4 | Partial | Full cancellation service call to CC-01; write timeline event with reason/remarks; verify TO returns to QC queue visible to QC Supervisor | High | Done |
| QC-01-5 | Complete override-to-failed admin action — cancel active CC-01 unloading assignment; timeline event with previous decision audit | DFS-064-5 | Partial | Override sets `qc_passed = False`; cancels unloading assignment; writes timeline event including previous decision in audit payload | High | Done |
| QC-01-6 | Complete QC sample creation API (POST) | DFS-064-6 | Partial | `POST /api/v1/transport-orders/{to_id}/qc/samples` — requires CC-01 QC flag active; validates entry condition (AC-1); writes timeline event | High | Done |
| QC-01-12 | Complete TLS-01 event emission for all QC actions + POD-01 closure gate integration | DFS-064-12 | Partial | All QC actions (sample created, decision, resample, override) must write `TOStatusTransitionLog` via `record_yard_sub_state()`; POD-01 `ClosureRuleEngine` must read latest QC decision correctly | High | Done |
| QC-01-13 | QC trigger depends on **product-line `qc_required` flag** — not only broad RM classification (FB-006) | DFS-064-13 | Pending | Update CC-01 QC flag trigger and QC entry condition check: read `product_line.qc_required` on TO line items. If at least one line item has `qc_required = True`, QC is required. If all items have `qc_required = False`, skip QC flow entirely. | High | Done |
| QC-01-14 | E2E test coverage | ~ | Pending | Validate RM QC sample, Pass/Fail decisions, resample and override flows, unloading cancellation, POD closure gate | Medium | Not done |

---

## Feedback Item — FB-006

**AC Amendment** (QC-01 AC-1): The QC entry condition check must evaluate `product_line.qc_required` at the TO product line item level. System must not rely solely on broad RM classification when individual line items carry their own QC requirement. This also means a gate-created Supplier PO TO (GT-02) can carry a mix of QC-required and non-required items — QC is triggered if **any** item requires it.

> **Status**: Done

---

## Open DoD Items (from Sprint 4)

- [x] Resample during unloading: QC Supervisor can trigger resample; cancels active CC-01 unloading assignment (AC-4)
- [x] Override to failed during unloading: cancels active CC-01 unloading assignment; timeline event with previous decision (AC-5)
- [x] All QC events written to TO timeline via TLS-01 (AC-6)
- [ ] UAT: sample → Pass → CC Officer assigns unloading point (not QC Supervisor)
- [ ] UAT: resample or override to Fail during unloading → CC-01 unloading assignment cancelled
- [ ] UAT: Fail blocks TO closure; Pass allows closure

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Resample admin action fully cancels CC-01 unloading assignment; writes timeline event (QC-01-4)
- [x] Override-to-failed admin action cancels CC-01 assignment; writes timeline event with previous decision audit (QC-01-5)
- [x] QC sample creation API complete with entry condition validation and timeline event (QC-01-6)
- [x] All QC actions emit TLS-01 timeline events; POD-01 closure gate reads latest QC decision (QC-01-12)
- [x] QC trigger based on `product_line.qc_required` flag (QC-01-13, FB-006)
- [ ] E2E sub-task QC-01-14 passes in staging

---

*Sprint 4 completion: ~70% | Sprint 5 target: 100% | Jira: DFS-064*
