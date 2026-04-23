---
jira_key: DFS-032
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: ~
title: Finished Goods (FG) Product Requisition
epic: Requisition
status: Pending
story_points: 5
assignee: ~
---

# PR-01 — Finished Goods (FG) Product Requisition

## User Story

**As a** Depot / Feed Mill Officer  
**I want to** raise a Finished Goods Product Requisition (PR) specifying the product, quantity, and destination POI  
**So that** the Distribution department is notified of demand and can plan Transport Requests accordingly

## Business Context

Finished Goods PRs originate from Depot or Feed Mill Officers who identify a need to move FG products (Broiler Feed, Layer Feed, DOC, etc.) to another POI. The PR is the authoritative demand signal that drives the entire downstream Distribution → Transport workflow.

**FG PR flow**:
```
Depot/Feed Mill Officer creates FG PR → Distribution receives PR → Distribution Officer creates TR(s) against PR → Distribution Manager approves TR → Transport Planning
```

**Key distinctions**:
- Creator: Depot / Feed Mill Officer (not Distribution)
- Product type: Finished Goods only
- **Destination POI**: pre-filled from the requester's assigned POI but editable — officer can change it if needed
- **Source POI**: not defined at this stage — the Distribution team defines source POI(s) when creating Transport Requests against this PR
- No approval step on the PR itself — it is submitted directly for Distribution to act on

## Acceptance Criteria

### AC-1: FG PR Header Fields
- [ ] Depot / Feed Mill Officer can create a FG PR with the following header fields:
  - **Requisition Type**: Finished Goods (auto-selected; restricted by user role — Depot/Feed Mill Officers can only create FG PRs)
  - **Requester Name**: Auto-filled from logged-in user (read-only)
  - **Requester Department**: Auto-filled from logged-in user (read-only)
  - **Destination POI**: Pre-filled from the requester's assigned POI — editable; officer can select a different active POI from the dropdown if needed
  - **Preferred Delivery Date & Time** (required)
  - **Urgency**: Normal / High / Critical
  - **Special Instructions** (optional)
- [ ] System auto-generates PR number: `PR-FG-YYYYMMDD-XXXX`
- [ ] Only Active POIs selectable as Destination
- [ ] **Source POI is not captured on the PR** — it is defined by the Distribution team when creating Transport Requests against this PR

### AC-2: Product Line Items
- [ ] PR supports multiple product line items (e.g., Broiler Starter + Layer Feed in one PR)
- [ ] Each line item is entered via **Product Item Code** which on valid entry auto-populates:
  - **Product Name** (from MDM-01)
  - **Product Category** — auto-filled as "Finished Goods"
  - **Product Sub-Category** (from MDM-01)
  - **Type of Packing**: Pallet / Drum / Roll (from MDM-01)
- [ ] Each line item requires manual entry of:
  - **Unit of Measure (UOM)**: Bags / Tons / Cartons / Pieces
  - **Product Quantity** (number of units in selected UOM)
  - **Weight per Unit** (in the selected UOM)
- [ ] System auto-calculates **Total Weight** per line item: Quantity × Weight per Unit
- [ ] Grand total weight computed across all line items

### AC-3: PR Status Lifecycle
- [ ] Initial status: `Draft` → `Submitted`
- [ ] PR can be saved as Draft and submitted later
- [ ] Submitted PR is locked from editing by requester (until rejected back or cancelled)
- [ ] On submission, PR becomes visible to the Distribution department

### AC-4: PR List View
- [ ] Officer can see their own PRs with status filter, date filter, search
- [ ] Status badges: Draft, Submitted, In Progress, Fulfilled, Cancelled
- [ ] "In Progress" means at least one TR has been created against this PR

### AC-5: PR Cancellation
- [ ] Officer can cancel Draft or Submitted PRs (before any TR is created)
- [ ] Cancellation reason required
- [ ] PRs with active TRs cannot be cancelled without admin override

### AC-6: Inventory Capacity Snapshot (Informational)
- [ ] Form displays inventory capacity snapshot for the **Destination POI** (requester's own POI):
  - Total capacity, current stock level, free capacity
  - Warning if capacity will be exceeded after this PR quantity (yellow)
- [ ] Widget is read-only and informational — does not block submission

### AC-7: Audit Trail
- [ ] All PR create, submit, edit, cancel actions audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PR-01-1 | ProductRequisition model + migration (header fields, line items with item code/auto-fill fields, status, audit) | DFS-032-1 | Pending |
| PR-01-2 | FG PR creation API (POST) with multi-line support | DFS-032-2 | Pending |
| PR-01-3 | PR number auto-generation: `PR-FG-YYYYMMDD-XXXX` | DFS-032-3 | Pending |
| PR-01-4 | Draft save → Submit workflow with status transitions | DFS-032-4 | Pending |
| PR-01-5 | Destination POI pre-fill from logged-in user's assigned POI; editable — dropdown of all active POIs | DFS-032-5 | Pending |
| PR-01-6 | Product Item Code lookup — auto-populates Name, Category, Sub-Category, Packing Type from MDM-01 | DFS-032-6 | Pending |
| PR-01-7 | Total weight calculation per line item (Qty × Weight per Unit) and grand total | DFS-032-7 | Pending |
| PR-01-8 | Destination POI inventory capacity snapshot widget (read-only, informational) | DFS-032-8 | Pending |
| PR-01-9 | FG-only role gate — Depot/Feed Mill Officers cannot create Port Shipments | DFS-032-9 | Pending |
| PR-01-10 | PR list view API (GET with filters: status, date, search) | DFS-032-10 | Pending |
| PR-01-11 | PR detail view API | DFS-032-11 | Pending |
| PR-01-12 | PR cancellation API with reason | DFS-032-12 | Pending |
| PR-01-13 | PR creation UI — header fields + multi-line product table (item code entry, auto-fill, UOM, qty, weight) + capacity widget | DFS-032-13 | Pending |
| PR-01-14 | PR list + detail UI | DFS-032-14 | Pending |

## API Endpoints

```
POST   /api/v1/product-requisitions                          # Create PR (Draft or Submit)
GET    /api/v1/product-requisitions?type=FG&status=&date_from=&date_to=&search=
GET    /api/v1/product-requisitions/{pr_id}
PATCH  /api/v1/product-requisitions/{pr_id}                  # Edit Draft
POST   /api/v1/product-requisitions/{pr_id}/submit           # Submit PR
POST   /api/v1/product-requisitions/{pr_id}/cancel           # Cancel with reason
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View FG PR list (own) | Depot / Feed Mill Officer |
| Create FG PR | Depot / Feed Mill Officer |
| Edit Draft PR | Depot / Feed Mill Officer |
| Cancel PR (before TR created) | Depot / Feed Mill Officer |

- Destination POI is pre-filled from the user's assigned POI but is editable (officer can change to any active POI)
- Source POI is not captured on the PR — defined later by the Distribution team on Transport Requests
- Role gate: Depot/Feed Mill Officers can only create FG PRs — Port Shipment (import) flow is hidden/disabled for this role

## Dependencies

- **Requires**: MDM-04 (POI), MDM-01 (Product Master), US-004 (RBAC — Depot/Feed Mill Officer role)
- **Enables**: DR-01 (Distribution Transport Request creation against this PR)

## Definition of Done

- [ ] FG PR creation with multi-line products
- [ ] Product Item Code lookup auto-fills Name, Category, Sub-Category, Packing Type
- [ ] UOM selection (Bags / Tons / Cartons / Pieces) + Quantity + Weight per Unit + auto-calculated Total Weight
- [ ] Draft save + submit workflow
- [ ] PR number auto-generation
- [ ] Destination POI pre-filled from user's assigned POI; editable to any active POI
- [ ] Role gate enforced — only FG PR type available to Depot/Feed Mill Officers
- [ ] Status lifecycle enforced
- [ ] Inventory capacity snapshot displayed for destination POI
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: Depot/Feed Mill Officer can create and submit 5+ FG PRs with different source POIs
