---
title: Sprint 8 Improvements — Product Requisition
module: 03-product-requisition
menu: Requisition / Product Requisitions · Port Shipments
parent: ./README.md
---

# Product Requisition

**Admin menu / area:** Requisition / Product Requisitions · Port Shipments  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-008](#fb-008--pr-locked-from-edit-by-depot--feed-mill--commercial-officers-after-submission) | PR locked from edit by Depot / Feed Mill / Commercial Officers after submission | High | Open |

---

## FB-008 — PR locked from edit by Depot / Feed Mill / Commercial Officers after submission

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [PR-01](../../sprint-3/01-requisition/PR-01-fg-product-requisition.md) (FG Product Requisition); Port Shipment create/edit for Commercial Officer ([PR-02](../../sprint-3/02-port-shipments/PR-02-port-shipment.md)) |
| **Closing Sub-tasks** | FB-008-1 — After **PR submission**, **Depot Officer** and **Feed Mill Officer** cannot update or modify any PR field (including line items) · FB-008-2 — After **Port Shipment / PR submission**, **Commercial Officer** cannot update or modify the submitted record · FB-008-3 — UI: change form renders fully readonly / edit actions hidden for these roles on submitted records; cancel (if still allowed by existing policy) remains separate from edit |
| **AC Amendment** | After a Product Requisition (or Commercial Officer Port Shipment treated as the requisition record) is **submitted**, **Depot Officer**, **Feed Mill Officer**, and **Commercial Officer** SHALL **not** be able to **update or modify** that record. Submitted records SHALL be view-only for these roles. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | PR-01 currently allows **Urgency** to remain editable post-submission (Sprint 3 FB-004). This item **tightens** that behaviour: post-submit edit is disallowed for the listed requester roles. Confirm whether cancel-after-submit remains allowed (existing cancel-before-TR policy) — cancel is not “update/modify” of field values. |

### Improvement observation

From **PR requisition creation**: after submission, Depot Officer, Feed Mill Officer, and Commercial Officer must not be able to update or modify the PR.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-008) |
|--------|---------|-------------------|
| Depot / Feed Mill Officer — submitted FG PR | Some fields (e.g. Urgency) still editable | **No update/modify** — view-only |
| Commercial Officer — submitted Port Shipment / PR | May still allow edit | **No update/modify** — view-only |
| Draft records | Editable by owner | Unchanged |

### Closing checklist

- [ ] FB-008-1 — Depot Officer / Feed Mill Officer: submitted PR fully readonly (no field or line-item edits)
- [ ] FB-008-2 — Commercial Officer: submitted Port Shipment / PR fully readonly
- [ ] FB-008-3 — Hide / disable edit affordances on change form for these roles after submit
