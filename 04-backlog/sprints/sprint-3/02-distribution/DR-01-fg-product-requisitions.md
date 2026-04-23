---
jira_key: DFS-034
jira_type: Story
jira_epic: DFS-041
jira_sprint: "Sprint 3"
story_id: ~
title: Distribution — FG Product Requisitions View
epic: Distribution
status: Pending
story_points: 2
assignee: ~
---

# DR-01 — Distribution: Finished Goods Product Requisitions View

## User Story

**As a** Distribution Officer  
**I want to** see all submitted Finished Goods Product Requisitions in a queue  
**So that** I can review demand from depots/feed mills and create Transport Requests to fulfil them

## Business Context

The Distribution module surfaces FG PRs (created by Depot/Feed Mill Officers in the Requisition module) to the Distribution team. The Distribution Officer reviews PRs and creates Transport Requests (TRs) against them. The Distribution Manager also views this queue to monitor demand alongside their TR approval queue.

**Flow**:
```
PR-01 (FG PR submitted) → Distribution Officer reviews queue → Creates TR(s) via DR-02 → Distribution Manager approves TR(s) via DR-02
```

## Acceptance Criteria

### AC-1: FG PR Queue
- [ ] Distribution Officer and Distribution Manager see all FG PRs with status `Submitted` or `In Progress`
- [ ] Filters: POI (Destination POI), Product Category, Delivery Date, Urgency, Status
- [ ] Sort: Delivery Date (ascending default), Urgency, Submission Date
- [ ] Columns: PR Number, Requester, Destination POI, Product(s), Total Quantity, Urgency, Delivery Date, Status, Actions

### AC-2: PR Detail View
- [ ] Full PR details: product line items (Item Code, Name, Category, Sub-Category, Packing, UOM, Qty, Weight per Unit, Total Weight), destination POI, urgency, delivery date & time, special instructions, requester name, requester department, submission date
- [ ] Real-time capacity snapshot for destination POI: Total Capacity, Current Stock, Free Capacity, Projected Utilization after this PR
- [ ] List of TRs already created against this PR with their statuses and allocated quantities
- [ ] Remaining quantity to be covered (Total PR Qty − Sum of TR Quantities)

### AC-3: Navigation to TR Creation
- [ ] "Create Transport Request" action button available on PR detail page
- [ ] Button disabled if PR is already Fully Allocated or Cancelled

### AC-4: PR Status Visibility
- [ ] Status badges on queue: Submitted, In Progress, Fully Allocated, Fulfilled, Cancelled

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DR-01-1 | FG PR queue API for Distribution (GET /product-requisitions?type=FG) with POI + Product Category filters | DFS-034-1 | Pending |
| DR-01-2 | PR detail view with full product line items, destination capacity snapshot, linked TRs, remaining quantity | DFS-034-2 | Pending |
| DR-01-3 | FG PR queue UI (list with filters, sort, status badges) | DFS-034-3 | Pending |
| DR-01-4 | PR detail UI (capacity snapshot widget for destination POI, linked TRs section, "Create TR" button) | DFS-034-4 | Pending |

## API Endpoints

```
GET  /api/v1/product-requisitions?type=FG&status=SUBMITTED,IN_PROGRESS&destination_poi=&product_category=&sort=delivery_date
GET  /api/v1/product-requisitions/{pr_id}
GET  /api/v1/product-requisitions/{pr_id}/transport-requests    # Linked TRs + remaining qty
GET  /api/v1/pois/{poi_id}/capacity                             # Destination capacity snapshot
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View FG PR queue | Distribution Officer, Distribution Manager |
| View PR detail + linked TRs + capacity snapshot | Distribution Officer, Distribution Manager |
| Navigate to TR creation | Distribution Officer |

- No Source POI filter — Source POI does not exist on the PR (it is defined at TR creation)
- Capacity snapshot displayed is for the Destination POI from the PR

## Dependencies

- **Requires**: PR-01 (FG Product Requisition), MDM-04 (POI capacity)
- **Enables**: DR-02 (Transport Request creation against this PR)

## Definition of Done

- [ ] FG PR queue visible to Distribution Officer and Distribution Manager with POI + Product Category filters
- [ ] PR detail showing full product line items, destination capacity snapshot, linked TRs, and remaining quantity
- [ ] "Create TR" button navigates to DR-02 form pre-filled with PR data
- [ ] Unit tests > 80%
- [ ] UAT: Distribution Officer views a submitted FG PR, sees capacity snapshot, and navigates to create TR
