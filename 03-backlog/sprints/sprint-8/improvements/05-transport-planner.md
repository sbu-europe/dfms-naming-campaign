---
title: Sprint 8 Improvements — Transport Planner
module: 05-transport-planner
menu: Transport · Transport Requests · Transport Orders
parent: ./README.md
---

# Transport Planner

**Admin menu / area:** Transport · Transport Requests · Transport Orders  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-011](#fb-011--transport-planner-tr-list--display-remaining-weight-kg-for-planning) | Transport Planner TR List: display Remaining Weight (KG) for planning | High | Resolved |
| [FB-012](#fb-012--to-creation-details--allocated-quantity-per-product-shall-show-remaining-quantity) | TO Creation details: Allocated Quantity Per Product shall show Remaining Quantity | High | Resolved |
| [FB-013](#fb-013--to-details-after-creation--pr-line-items-table-not-showing) | TO details after creation: PR line items table not showing | High | Open |

---

## FB-011 — Transport Planner TR List: display Remaining Weight (KG) for planning

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TRQ-01](../../sprint-3/05-transport/01-transport-requests-queue.md) (Transport Requests Queue) |
| **Closing Sub-tasks** | FB-011-1 — Add **Remaining Weight (KG)** column to the Transport Planner **TR list** · FB-011-2 — Remaining Weight = TR total weight minus weight already allocated to TOs (planning remainder) |
| **AC Amendment** | The Transport Planner **TR list** SHALL display **Remaining Weight (KG)** so planners can see how much weight is still available for planning / TO allocation. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Distinct from FB-009 (DO/DM/PO Total Weight). Planner needs the **remaining** (unallocated) weight, not only the TR total. |

### Improvement observation

Transport Planner **TR List** needs to display **Remaining Weight (KG)** for planning.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-011) |
|--------|---------|-------------------|
| TR list (Transport Planner) | Remaining Weight (KG) not shown | **Remaining Weight (KG)** column for planning |

### Closing checklist

- [x] FB-011-1 — Remaining Weight (KG) column on Transport Planner TR list
- [x] FB-011-2 — Value reflects unallocated / remaining weight for planning

---

## FB-012 — TO Creation details: Allocated Quantity Per Product shall show Remaining Quantity

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (Transport Order Creation) |
| **Closing Sub-tasks** | FB-012-1 — On **TO Creation** details, in **Allocated Quantity Per Product**, add a **Remaining Quantity** column · FB-012-2 — Remaining Quantity updates as allocated qty is entered (TR product qty − allocated across TOs / this TO) |
| **AC Amendment** | On the **TO Creation** details page, the **Allocated Quantity Per Product** section SHALL display a **Remaining Quantity** column so the planner can see how much quantity is left to allocate per product. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Complements FB-011 (remaining weight on TR list) with remaining **quantity** at TO creation time. |

### Improvement observation

On **TO Creation Details**, **Allocated Quantity Per Product** shall display a **Remaining Quantity** column.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-012) |
|--------|---------|-------------------|
| Allocated Quantity Per Product | Remaining Quantity missing | **Remaining Quantity** column displayed |

### Closing checklist

- [x] FB-012-1 — Remaining Quantity column on Allocated Quantity Per Product (TO creation)
- [x] FB-012-2 — Remaining Quantity reflects unallocated qty per product

---

## FB-013 — TO details after creation: PR line items table not showing

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [TO-01](../../sprint-3/05-transport/02-transport-orders.md) (TO detail after creation) |
| **Closing Sub-tasks** | FB-013-1 — After TO creation, the **TO details** page SHALL render the **PR line items** table · FB-013-2 — Table shows the linked PR/TR product line items expected on the detail view (no blank / missing section) |
| **AC Amendment** | After a Transport Order is created, the **TO details** page SHALL display the **PR line items** table. The table MUST NOT be missing or empty solely because the TO has been created. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Bug: PR line items table fails to show on TO details after creation. Confirm data source (PR vs TR line items) matches the designed detail layout and fix the render/query path. |

### Improvement observation

**PR line items table is not showing** after TO creation inside the details page.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-013) |
|--------|---------|-------------------|
| TO details — PR line items table (post-create) | Not showing | **Visible** with expected PR/TR line items |

### Closing checklist

- [ ] FB-013-1 — PR line items table renders on TO details after creation
- [ ] FB-013-2 — Line items content correct (linked PR/TR products)
