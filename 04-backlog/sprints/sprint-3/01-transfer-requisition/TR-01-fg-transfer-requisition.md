---
jira_key: DFS-032
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: ~
title: Finished Goods (FG) Transfer Requisition
epic: Transfer Requisition
status: Pending
story_points: 5
assignee: ~
---

# TR-01 — Finished Goods (FG) Transfer Requisition

## User Story

**As a** Distribution Officer (DO)  
**I want to** create a Finished Goods Transfer Requisition from a source depot/factory to a destination depot  
**So that** finished products can be moved to where they are needed with proper documentation and routing to the approval workflow

## Business Context

FG Transfer Requisitions are the most common TR type — moving Finished Goods (Broiler Feed, Layer Feed, DOC, etc.) between POIs. This is the foundational TR creation flow that all approval and transport planning workflows build upon.

**FG TR flow**:
```
DO creates FG TR → Stock/Capacity validation (TR-03) → Distribution Approval (TR-04) → Available for Planning
```

**Key differences from Port TR**: Source is a depot/factory (not a port), products are Finished Goods (not RM), no LC/customs documentation required, routes to Distribution approval (not Procurement).

## Acceptance Criteria

### AC-1: FG TR Creation Form
- [ ] Distribution Officer can create FG TR with:
  - Transfer Type: Finished Goods Transfer (auto-selected or chosen from type config)
  - Source POI (select from active depots / feed mills / factories)
  - Destination POI (select from active depots / dealers)
  - Product (select from active FG products — sourced from MDM-01)
  - Quantity (with UOM)
  - Requested Delivery Date (required)
  - Priority (Critical / High / Normal)
  - Vehicle Type Requirement (optional, auto-suggested from product transport config)
  - Special Instructions (optional)
- [ ] System auto-generates TR number: `TR-FG-YYYYMMDD-XXXX`
- [ ] Only Active POIs and Active FG products selectable
- [ ] Stock and capacity snapshot displayed on form (informational — from TR-03)

### AC-2: Multi-line TR
- [ ] TR can include multiple product line items (e.g., Broiler Starter Feed + Layer Feed in one TR)
- [ ] Each line item has independent quantity and product
- [ ] Total weight estimated across all line items

### AC-3: TR Status Lifecycle
- [ ] Initial status: `Draft` → `Submitted` → `Pending Approval` → `Approved` / `Rejected`
- [ ] TR can be saved as Draft and submitted later
- [ ] Submitted TR locked from editing by DO (until rejected back)

### AC-4: TR List View
- [ ] DO can see their own TRs with status filter, date filter, search
- [ ] Status badges: Draft, Submitted, Pending Approval, Approved, Rejected, Cancelled

### AC-5: TR Cancellation
- [ ] DO can cancel Draft or Submitted TRs
- [ ] Cancellation reason required
- [ ] Approved TRs cannot be cancelled by DO (requires admin override)

### AC-6: Audit Trail
- [ ] All TR create, submit, edit, cancel actions audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TR-01-1 | TransferRequisition model + migration (header fields, status, line items, audit) | DFS-032-1 | Pending |
| TR-01-2 | FG TR creation API (POST) with multi-line support | DFS-032-2 | Pending |
| TR-01-3 | TR number auto-generation: `TR-FG-YYYYMMDD-XXXX` | DFS-032-3 | Pending |
| TR-01-4 | Draft save → Submit workflow with status transitions | DFS-032-4 | Pending |
| TR-01-5 | Active-only POI and FG product gate in TR form selectors | DFS-032-5 | Pending |
| TR-01-6 | TR list view API (GET with filters: status, date, search) | DFS-032-6 | Pending |
| TR-01-7 | TR detail view API | DFS-032-7 | Pending |
| TR-01-8 | TR cancellation API with reason | DFS-032-8 | Pending |
| TR-01-9 | TR creation UI — form with multi-line product table + stock snapshot widget | DFS-032-9 | Pending |
| TR-01-10 | TR list + detail UI | DFS-032-10 | Pending |

## API Endpoints

```
POST   /api/v1/transfer-requisitions                   # Create TR (Draft or Submit)
GET    /api/v1/transfer-requisitions?type=FG&status=&date_from=&date_to=&search=
GET    /api/v1/transfer-requisitions/{tr_id}
PATCH  /api/v1/transfer-requisitions/{tr_id}           # Edit Draft
POST   /api/v1/transfer-requisitions/{tr_id}/submit    # Submit for approval
POST   /api/v1/transfer-requisitions/{tr_id}/cancel    # Cancel with reason
```

## Dependencies

- **Requires**: MDM-04 (POI), MDM-01 (Product Master), US-004 (RBAC)
- **Enables**: TR-03 (Stock & Capacity Validation), TR-04 (Distribution Approval), TP-01 (TR Assessment)

## Definition of Done

- [ ] FG TR creation with multi-line products
- [ ] Draft save + submit workflow
- [ ] TR number auto-generation
- [ ] Status lifecycle enforced
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: DO can create and submit 5+ FG TRs
