---
jira_key: DFS-036
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: ~
title: Procurement — Port Consignment Product Requisitions View
epic: Procurement
status: Pending
story_points: 2
assignee: ~
---

# PC-01 — Procurement: Port Consignment Product Requisitions View

## User Story

**As a** Procurement Officer  
**I want to** see all submitted Port Consignment Product Requisitions with full LC and shipment details  
**So that** I can review inbound RM shipments and create destination-wise Transport Requests for each allocation

## Business Context

The Procurement module surfaces Port Consignment PRs (created by Commercial Officers in the Requisition module) to the Procurement team. Unlike the Distribution flow where the DO creates TRs against a PR with a pre-known destination, the Procurement Officer's task here is to define a **Destination Breakdown Plan** — allocating the total incoming quantity across one or more destination POIs — and creating a TR per destination.

**Flow**:
```
PR-02 (Port Consignment PR submitted by Commercial Officer) → Procurement Officer reviews queue + views LC/shipment details → Creates TR(s) with destination breakdown via PC-02 → TRs available for Transport Planning
```

## Acceptance Criteria

### AC-1: Port Consignment PR Queue
- [ ] Procurement Officer sees all Port Consignment PRs with status `Submitted` or `In Progress`
- [ ] Filters: Vessel Name, LC Number, ETA (date range), Urgency, Status
- [ ] Sort: ETA (ascending default), Urgency, Submission Date
- [ ] Columns: PR Number, LC Number, BL Number, Vessel Name, ETA, Total Quantity, Urgency, Submitted By, Status, Actions

### AC-2: PR Detail View — Shipment Reference + Line Items
- [ ] Full shipment reference details displayed:
  - PR ID, Bill of Lading (BL) Number, LC Number, Vessel Name, Voyage Name, Container Number(s), C&F Agent Name, Point of Loading (POL), Estimated Time of Arrival (ETA)
  - Arrival Notice Attachment (downloadable)
  - Remarks from Commercial Officer
- [ ] Product line items table per RM Item Code:
  - Product Item Code, Product Name, Product Category, Product Sub-Category, Type of Packing, UOM, Product Quantity, Weight per Unit, Total Calculated Weight, Urgency
- [ ] Inventory capacity snapshot for each potential destination POI (informational)
- [ ] List of TRs already created against this PR (destination breakdown plan) with statuses and allocated quantities
- [ ] Remaining quantity yet to be allocated

### AC-3: Navigation to Destination Breakdown / TR Creation
- [ ] "Create Destination Breakdown / Transport Request" button available on PR detail page
- [ ] Button disabled if PR is already Fully Allocated or Cancelled

### AC-4: PR Status Visibility
- [ ] Status badges on queue: Submitted, In Progress, Fully Allocated, Fulfilled, Cancelled

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PC-01-1 | Port Consignment PR queue API (GET /product-requisitions?type=PORT_CONSIGNMENT) with LC, vessel, ETA, urgency filters | DFS-036-1 | Pending |
| PC-01-2 | PR detail view API — full shipment fields + product line items + capacity snapshots + linked TRs + remaining qty | DFS-036-2 | Pending |
| PC-01-3 | Arrival Notice document download endpoint | DFS-036-3 | Pending |
| PC-01-4 | Port Consignment PR queue UI (list with filters, sort, status badges; LC/ETA/vessel columns) | DFS-036-4 | Pending |
| PC-01-5 | PR detail UI (shipment reference section, product line items, capacity snapshot, linked TRs, "Create TR" button) | DFS-036-5 | Pending |

## API Endpoints

```
GET  /api/v1/product-requisitions?type=PORT_CONSIGNMENT&status=SUBMITTED,IN_PROGRESS&sort=eta
GET  /api/v1/product-requisitions/{pr_id}
GET  /api/v1/product-requisitions/{pr_id}/transport-requests    # Linked TRs + remaining qty
GET  /api/v1/product-requisitions/{pr_id}/documents             # Arrival Notice download
GET  /api/v1/pois/{poi_id}/capacity                             # Destination capacity snapshot
```

## Access & Permissions

> Full menu structure and role-access matrix: [`00-sprint-design.md`](../00-sprint-design.md)

| Action | Role |
|--------|------|
| View Port Consignment PR queue | Procurement Officer |
| View PR detail (LC/shipment fields + product lines) | Procurement Officer |
| Download Arrival Notice attachment | Procurement Officer |
| Navigate to TR / destination breakdown creation | Procurement Officer |

- Procurement Officer sees PRs raised by Commercial Officers — read-only on the PR itself
- No Procurement Manager role in this workflow
- Source POI (Port) and Destination POIs are not on the PR — defined at TR creation (PC-02)

## Dependencies

- **Requires**: PR-02 (Port Consignment Product Requisition by Commercial Officer)
- **Enables**: PC-02 (Procurement destination breakdown + TR creation against this PR)

## Definition of Done

- [ ] Port Consignment PR queue visible to Procurement Officer with LC/vessel/ETA filters
- [ ] PR detail showing full shipment reference, all product line items, Arrival Notice download, linked TRs, remaining quantity
- [ ] "Create TR" button navigates to PC-02 destination breakdown form pre-filled with PR data
- [ ] Unit tests > 80%
- [ ] UAT: Procurement Officer views a Port Consignment PR with full LC details, downloads Arrival Notice, and navigates to create destination breakdown
