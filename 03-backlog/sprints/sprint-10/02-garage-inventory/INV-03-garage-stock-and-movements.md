---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: INV-03
title: Garage Stock, Receive & Movement Ledger
epic: Garage Inventory & Workshop
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Garage Stock + Receive Stock tabs)
related_stories:
  - INV-01-garage-poi-and-supervisor-scope.md
  - INV-02-inventory-item-master-catalog.md
  - WM-01-workshop-job-with-parts-issuance.md
source_docs:
  - ../../../../05-modules/08-fleet-management/inventory-management.md
  - ../../../../example-prototypes/fuel-management.html
module_spec: 05-modules/08-fleet-management/inventory-management.md
---

# INV-03 — Garage Stock, Receive & Movement Ledger

## User Story

**As a** Workshop Supervisor  
**I want to** view garage stock, receive incoming items, and see a movement history  
**So that** I know what is available before issuing parts to a workshop job

## Business Context

Each Garage POI maintains its own `GarageStock` balance. All quantity changes flow through an append-only `InventoryMovement` ledger. Stock is **increased** on receipt and **decreased** when parts are issued to workshop jobs (WM-01).

---

## Acceptance Criteria

### AC-1: Models

- [ ] `GarageStock`: `garage_poi_id`, `inventory_item_id`, `quantity_on_hand`, `reorder_level` (optional). Unique `(garage_poi_id, inventory_item_id)`.
- [ ] `InventoryMovement`: movement type, `quantity_delta`, `quantity_after`, reference to job or manual, audit fields.

### AC-2: Garage Stock UI

- [ ] **Garage Stock** page: filter by assigned Garage POI.
- [ ] Table: SKU, item name, type, UOM, qty on hand, reorder level, status (OK / Low / Out).
- [ ] Low stock when `qty ≤ reorder_level`; out when `qty = 0`.

### AC-3: Receive Stock UI

- [ ] **Receive Stock** form: Garage POI (assigned), Inventory Item, quantity, notes.
- [ ] On submit: `RECEIPT` movement + increase `GarageStock`.
- [ ] Recent movements panel for selected garage.

### AC-4: Stock adjustment

- [ ] `ADJUSTMENT_IN` / `ADJUSTMENT_OUT` with mandatory reason.
- [ ] Workshop Supervisor: own garage only; Tenant Admin: all garages.

### AC-5: Scope & API

- [ ] `GET /api/v1/garages/{poi_id}/stock/` — scoped to supervisor assignment.
- [ ] `POST /api/v1/garages/{poi_id}/stock/receive/`
- [ ] `POST /api/v1/garages/{poi_id}/stock/adjust/`
- [ ] `GET /api/v1/garages/{poi_id}/stock/movements/`

### AC-6: Concurrency

- [ ] Issue and receive operations use row-level lock or atomic update to prevent negative stock.

---

## API Endpoints

```
GET    /api/v1/garages/{poi_id}/stock/
POST   /api/v1/garages/{poi_id}/stock/receive/
POST   /api/v1/garages/{poi_id}/stock/adjust/
GET    /api/v1/garages/{poi_id}/stock/movements/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View garage stock | `workshop_supervisor` (assigned), `tenant_admin`, `transport_planner` |
| Receive stock | `workshop_supervisor` (assigned) |
| Adjust stock | `workshop_supervisor` (assigned), `tenant_admin` |

**Permission codes (proposed):** `garage.stock.view`, `garage.stock.receive`, `garage.stock.adjust`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| INV-03-1 | `GarageStock` + `InventoryMovement` | Models + movement service | High | Not started |
| INV-03-2 | Receive stock UI + API | Receipt flow | High | Not started |
| INV-03-3 | Garage stock list UI | Stock table with low/out status | High | Not started |
| INV-03-4 | Adjustment + movements history | Manual adjust + recent movements panel | Medium | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| INV-01 | Upstream | Garage POI + supervisor scope |
| INV-02 | Upstream | Inventory items for stock rows |
| WM-01 | Downstream | Issue-to-job decreases stock |

---

## Definition of Done

- [ ] Receive stock increases balance with movement record
- [ ] Garage stock page matches prototype intent
- [ ] Scope enforced — supervisor cannot access other garages
- [ ] Unit tests for movement ledger integrity

---

*Epic: Garage Inventory & Workshop | Phase: 2 | Sprint 10: 8 SP | Last Updated: 2026-09-01*
