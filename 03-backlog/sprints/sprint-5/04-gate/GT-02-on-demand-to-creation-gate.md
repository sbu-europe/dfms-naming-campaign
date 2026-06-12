---
jira_key: DFS-062
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: GT-02
title: Gate — On-Demand TO Creation (Dealer DO & Supplier PO)
epic: Gate Operations
status: In Progress
story_points: 8
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - GT-02-12
  - GT-02-13
feedback_items:
  - FB-001
  - FB-007
source: ../../../sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md
---

# GT-02 — On-Demand TO Creation at Gate (Sprint 5 Carry-over)

> **Full story context, business rules, Dealer/Supplier paths, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md`](../../../sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Status | Sprint 5 Work | Priority |
|---|----------|------|--------|---------------|----------|
| GT-02-12 | On-demand TO creation supports adding **multiple product line items** | DFS-062-12 | Done | Both Dealer DO (FG outbound) and Supplier PO (RM inbound) paths must allow the gateman to add N product line items per TO. Each item: product, quantity, and `qc_required` flag. Model changes + admin form + API payload update. Closes FB-001, FB-006 (product-line QC flag), FB-007. | High |
| GT-02-13 | E2E test coverage | ~ | Not done | Validate Dealer DO and Supplier PO on-demand TO creation with multiple product line items, RBAC enforcement, gate linkage, and downstream compatibility with LD-01 and QC-01 | Medium |

---

## Feedback Items

### FB-007 — Multiple product line items on on-demand TO

**AC Amendment** (GT-02 AC-1 / AC-2): Both Dealer DO and Supplier PO on-demand TO creation must support adding multiple product line items. Each line item carries: product reference, quantity, and `qc_required` boolean. A TO without at least one product line item must not be saveable.

> **Status**: Done

### FB-001 — Product line items flow into loading/unloading

**Impact on GT-02**: `qc_required` metadata on GT-02 product line items is consumed by QC-01 trigger logic (QC-01-13 / FB-006) and by LD-01 per-item capture (LD-01-9). GT-02-12 is the root enabler for both.

> **Status**: Done

---

## Open DoD Items (from Sprint 4)

- [x] Gate-created TO appears in Transport Orders list with `source=GATE` filter
- [x] FG dealer path runs stock check stub (manual confirm + audit) when inventory module not ready
- [x] Only Gate role can create on-demand TOs; Transport Planner gets read-only access; unrelated role receives 403
- [ ] UAT: dealer vehicle with DO → gate TO with product line items created → proceeds through scale/load/gate-out
- [ ] UAT: supplier vehicle with PO → gate TO with product line items created → inbound flags + QC Required flag per item set
- [x] RBAC unit tests: gate role can create; unrelated role cannot

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Multiple product line items supported on both Dealer DO and Supplier PO on-demand TO creation (GT-02-12, FB-007)
- [x] Each product line item carries `qc_required` flag (connects to QC-01-13 and LD-01-9)
- [x] RBAC enforced: Gate role only for creation; Transport Planner read-only (AC-4)
- [ ] E2E sub-task GT-02-13 passes in staging; covers product line items and RBAC

---

*Sprint 4 completion: ~80% | Sprint 5 target: 100% | Jira: DFS-062*
