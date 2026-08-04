---
title: Sprint 8 Improvements — Driver Mobile / My Trips
module: 06-driver-mobile
menu: Trips · My Trips · Driver Mobile
parent: ./README.md
---

# Driver Mobile / My Trips

**Admin menu / area:** Trips · My Trips · Driver Mobile  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-014](#fb-014--my-trips-details--cargo-table-shall-show-allocated-weight-with-allocated-quantity) | My Trips details: Cargo table shall show Allocated Weight with Allocated Quantity | Medium | Open |

---

## FB-014 — My Trips details: Cargo table shall show Allocated Weight with Allocated Quantity

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-04 |
| **Affected Stories** | [DM-01](../../sprint-4/03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) (Driver Mobile / My Trips detail); driver TO detail / cargo display |
| **Closing Sub-tasks** | FB-014-1 — On **My Trips** details **Cargo** table, display **Allocated Weight** alongside **Allocated Quantity** (count of items) · FB-014-2 — Weight unit labelled consistently (KG) with other weight columns in the product |
| **AC Amendment** | On the Driver **My Trips** details list / detail **Cargo** table, the system SHALL display **Allocated Weight** as well as **Allocated Quantity** (count of items). |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Applies to Driver Mobile Interface and the admin **My Trips** detail cargo presentation used by drivers. |

### Improvement observation

Driver Mobile Interface — **My Trips** details: **Cargo** table should display **Allocated Weight** as well as **Allocated Quantity** (count of items).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-014) |
|--------|---------|-------------------|
| Cargo table — Allocated Quantity | Shown (count of items) | Unchanged |
| Cargo table — Allocated Weight | Missing | **Displayed** with Allocated Quantity |

### Closing checklist

- [ ] FB-014-1 — Cargo table shows Allocated Weight with Allocated Quantity
- [ ] FB-014-2 — Weight unit labelled (KG) consistently
