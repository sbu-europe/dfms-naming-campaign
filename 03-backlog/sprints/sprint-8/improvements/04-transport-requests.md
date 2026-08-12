---
title: Sprint 8 Improvements — Transport Requests (Distribution & Procurement)
module: 04-transport-requests
menu: Distribution / Procurement · Transport Requests
parent: ./README.md
---

# Transport Requests (Distribution & Procurement)

**Admin menu / area:** Distribution / Procurement · Transport Requests  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-009](#fb-009--tr-list-show-total-weight-kg-instead-of-total-quantity-for-distribution--procurement-roles) | TR List: show Total Weight (KG) instead of Total Quantity for Distribution & Procurement roles | Medium | Resolved |
| [FB-010](#fb-010--tr-details--line-items-show-total-weight-kg-and-total-quantity-for-distribution--procurement-roles) | TR Details & line items: show Total Weight (KG) and Total Quantity for Distribution & Procurement roles | Medium | Resolved |

---

## FB-009 — TR List: show Total Weight (KG) instead of Total Quantity for Distribution & Procurement roles

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [DR-02](../../sprint-3/03-distribution/DR-02-transport-requests.md) (FG TRs); [PC-02](../../sprint-3/04-procurement/PC-02-transport-requests.md) (Port Consignment TRs) |
| **Closing Sub-tasks** | FB-009-1 — On TR list for **Distribution Officer**, **Distribution Manager**, and **Procurement Officer**, replace **Total Quantity** (count of items) with **Total Weight (KG)** · FB-009-2 — Column header and value formatting use KG (consistent with requisition weight totals) |
| **AC Amendment** | For **Distribution Officer**, **Distribution Manager**, and **Procurement Officer**, the **Transport Request list** SHALL display a **Total Weight (KG)** column **instead of** **Total Quantity** (count of items). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Applies to the TR list views those roles use under Distribution / Procurement — not the Transport Planner queue (see FB-011 for Remaining Weight on the planner list). |

### Improvement observation

On the TR list for Distribution Officer, Distribution Manager, and Procurement Officer, **Total Weight (KG)** must be shown instead of **Total Quantity** (item count).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-009) |
|--------|---------|-------------------|
| TR list column (DO / DM / PO) | Total Quantity (count of items) | **Total Weight (KG)** |
| Roles in scope | — | Distribution Officer, Distribution Manager, Procurement Officer |

### Closing checklist

- [x] FB-009-1 — List display uses Total Weight (KG) instead of Total Quantity for DO / DM / PO
- [x] FB-009-2 — Header / units labelled as KG

---

## FB-010 — TR Details & line items: show Total Weight (KG) and Total Quantity for Distribution & Procurement roles

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [DR-02](../../sprint-3/03-distribution/DR-02-transport-requests.md); [PC-02](../../sprint-3/04-procurement/PC-02-transport-requests.md) |
| **Closing Sub-tasks** | FB-010-1 — TR **details** page for DO / DM / PO displays **Total Weight (KG)** (header / summary) · FB-010-2 — TR **line items** table displays **both** **Total Quantity** and **Total Weight (KG)** columns |
| **AC Amendment** | For **Distribution Officer**, **Distribution Manager**, and **Procurement Officer**, the **TR details** page SHALL display **Total Weight (KG)**. The **TR line items** table SHALL display **Total Quantity** and **Total Weight (KG)** **both**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Complements FB-009 (list). Details keep quantity for line-level clarity while adding weight; list prefers weight for planning visibility. |

### Improvement observation

On the TR details page for Distribution Officer, Distribution Manager, and Procurement Officer: show **Total Weight (KG)** on the details view, and show **both** Total Quantity and Total Weight (KG) on the TR line items table.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-010) |
|--------|---------|-------------------|
| TR details summary (DO / DM / PO) | Total Weight (KG) missing / incomplete | **Total Weight (KG)** displayed |
| TR line items table | Quantity only (or weight missing) | **Total Quantity** + **Total Weight (KG)** both |

### Closing checklist

- [x] FB-010-1 — TR details page shows Total Weight (KG) for DO / DM / PO
- [x] FB-010-2 — Line items table shows Total Quantity and Total Weight (KG)
