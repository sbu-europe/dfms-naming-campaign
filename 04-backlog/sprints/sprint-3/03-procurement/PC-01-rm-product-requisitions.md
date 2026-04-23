---
jira_key: DFS-036
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: ~
title: Procurement — Port Shipments Queue (View)
epic: Procurement
status: Pending
story_points: 2
assignee: ~
---

# PC-01 — Procurement: Port Shipments Queue (View)

## User Story

**As a** Procurement Officer  
**I want to** see all submitted **Port Shipments** with full LC and shipment details  
**So that** I can review inbound import cargo and create **Transport Requests** per destination POI to plan distribution (leading to **Transport Orders** after Transport Planning)

## Business Context

The Procurement module surfaces **Port Shipments** registered by Commercial Officers (Requisition module → **Port Shipment** flow). These records reflect import data entered from **external systems** into DFMS; they are **not** internal FG requisitions.

Unlike Distribution (FG), the Procurement Officer defines a **destination breakdown plan** — allocating quantities across one or more POIs — by creating **one TR per destination** (PC-02). **Transport Orders** are created later by the Transport Planner from those TRs (TO-01 / TRQ-01).

**Flow**:
```
PR-02 (Port Shipment submitted by Commercial Officer) → Procurement reviews queue + shipment details → Creates TR(s) via PC-02 → TRs available for Transport Planning → TO creation
```

## Acceptance Criteria

### AC-1: Port Shipment Queue
- [ ] Procurement Officer sees all Port Shipments with status `Submitted` or `In Progress`
- [ ] Filters: Vessel Name, LC Number, ETA (date range), Urgency, Status
- [ ] Sort: ETA (ascending default), Urgency, Submission Date
- [ ] Columns: **Shipment Ref** (`PS-PORT-…`), LC Number, BL Number, Vessel Name, ETA, Total Quantity / Weight, Urgency, Entered By, Status, Actions

### AC-2: Shipment Detail — Documentation + Line Items
- [ ] Full shipment reference: Shipment Ref, BL, LC, Vessel, Voyage, Container(s), C&F Agent, POL, ETA
- [ ] Arrival Notice attachment (downloadable)
- [ ] Remarks from Commercial Officer
- [ ] RM line items table (item code, name, category, packing, UOM, qty, weight, line totals)
- [ ] Optional capacity snapshot per candidate destination POI (informational)
- [ ] List of TRs already created against this shipment (destination plan) with statuses and allocated quantities
- [ ] Remaining quantity per line yet to allocate

### AC-3: Navigation to TR / Destination Breakdown
- [ ] "Create destination breakdown / Transport Request" from shipment detail
- [ ] Disabled if shipment is fully allocated or cancelled

### AC-4: Status Visibility
- [ ] Badges: Submitted, In Progress, Fully Allocated, Fulfilled, Cancelled

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PC-01-1 | Queue API — `GET /product-requisitions?type=PORT_CONSIGNMENT` with LC, vessel, ETA, urgency filters | DFS-036-1 | Pending |
| PC-01-2 | Detail API — shipment fields, lines, capacity snapshots, linked TRs, remaining qty | DFS-036-2 | Pending |
| PC-01-3 | Arrival Notice download endpoint | DFS-036-3 | Pending |
| PC-01-4 | Queue UI — filters, sort, badges | DFS-036-4 | Pending |
| PC-01-5 | Detail UI — shipment section, lines, linked TRs, "Create TR" action | DFS-036-5 | Pending |

## API Endpoints

```
GET  /api/v1/product-requisitions?type=PORT_CONSIGNMENT&status=SUBMITTED,IN_PROGRESS&sort=eta
GET  /api/v1/product-requisitions/{id}
GET  /api/v1/product-requisitions/{id}/transport-requests
GET  /api/v1/product-requisitions/{id}/documents
GET  /api/v1/pois/{poi_id}/capacity
```

## Access & Permissions

> Menu and roles: [`../README.md`](../README.md)

| Action | Role |
|--------|------|
| View Port Shipment queue | Procurement Officer |
| View shipment detail; download Arrival Notice | Procurement Officer |
| Open TR creation (PC-02) | Procurement Officer |

- Procurement cannot edit or cancel the shipment record (Commercial Officer ownership)
- Source Port and destinations are set on TRs (PC-02), not on the shipment header

## Dependencies

- **Requires**: PR-02 (Port Shipment registration)
- **Enables**: PC-02 (TR creation / destination breakdown)

## Definition of Done

- [ ] Port Shipment queue with LC / vessel / ETA filters
- [ ] Detail view with full shipment reference, RM lines, Arrival Notice download, linked TRs, remaining qty
- [ ] "Create TR" navigates to PC-02 with shipment context
- [ ] Unit tests > 80%
- [ ] UAT: Procurement opens a submitted shipment and proceeds to destination breakdown
