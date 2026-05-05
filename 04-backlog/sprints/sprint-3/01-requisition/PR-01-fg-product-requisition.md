---
jira_key: DFS-032
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: ~
title: Finished Goods (FG) Product Requisition
epic: Requisition
status: In Progress
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
- [x] Depot / Feed Mill Officer can create a FG PR with the following header fields:
  - [x] **Requisition Type**: Finished Goods (auto-selected; `pr_type=FINISHED_GOODS` set on save via `ProductRequisitionAdmin.save_model`)
  - [x] **Requester Name**: Auto-filled from logged-in user (read-only) — set in `_PRBaseAdmin.save_model`
  - [x] **Requester Department**: Auto-filled from logged-in user (read-only) — set in `_PRBaseAdmin.save_model`
  - [x] **Destination POI**: Editable dropdown (FK to `master_data.POI`)
  - [x] **Preferred Delivery Date & Time** (required)
  - [x] **Urgency**: Normal / High / Critical
  - [x] **Special Instructions** (optional)
- [x] System auto-generates PR number: `PR-FG-YYYYMMDD-XXXX` — implemented in `apps/requisitions/numbering.py`, called from `_PRBaseAdmin.save_model`
- [ ] Only Active POIs selectable as Destination — POI filtering not yet restricted to `is_active=True`
- [x] **Source POI is not captured on the PR** — field not present on `ProductRequisition` model

### AC-2: Product Line Items
- [x] PR supports multiple product line items — `PRLineItem` model with FK to `ProductRequisition`; `PRLineItemInline` in Django Admin
- [x] Each line item is entered via **Product autocomplete dropdown** (searchable by name, SKU, item code); on selection auto-populates:
  - [x] **Product Item Code** (readonly, filled from MDM via `pr_line_item_autofill.js` + `product_detail_api`)
  - [x] **Product Name** (readonly, auto-filled)
  - [x] **Product Category** (readonly, auto-filled from `product.category.category_name`)
  - [x] **Product Sub-Category** (readonly, auto-filled from `product.sub_category.sub_category_name`)
  - [x] **Type of Packing** (readonly, auto-filled from `product.standard_pack_size`)
- [x] Each line item requires manual entry of:
  - [x] **Unit of Measure (UOM)**: Bags / Tons / Cartons / Pieces
  - [x] **Product Quantity**
  - [x] **Weight per Unit** (pre-filled from MDM if available, editable)
- [x] System auto-calculates **Total Weight** per line item: `Quantity × Weight per Unit` — computed in `PRLineItem.save()`
- [x] Grand total weight computed across all line items — `ProductRequisition._recompute_totals()` called on every line item save/delete

### AC-3: PR Status Lifecycle
- [x] Initial status: `Draft` — model default is `draft`
- [x] PR can be saved as Draft and submitted later — Save as Draft / Submit Requisition buttons on form; `submitted_at` set on submit
- [x] Submitted PR is locked from editing by requester — `get_readonly_fields` makes all fields readonly for non-draft status
- [x] On submission, PR becomes visible to the Distribution department — `get_queryset` filters by role: distribution roles see submitted/in-progress PRs

### AC-4: PR List View
- [x] List view available at `/admin/requisitions/productrequisition/` with `status`, `urgency` filters and `pr_number`/`requester_name` search
- [x] Officer sees only their own PRs — `_PRBaseAdmin.get_queryset` falls through to `qs.filter(requested_by=user)` for depot/feed_mill officers
- [x] Status badges (visual) — colour-coded badges via `status_badge` method
- [ ] "In Progress" status tied to TR creation — not yet auto-updated

### AC-5: PR Cancellation
- [x] Officer can cancel Draft or Submitted PRs — "Cancel Requisition" button on change form links to `cancel_view`; bulk `action_cancel_prs` also available
- [x] Cancellation reason required — `_CancelReasonForm` enforces min 5 chars via dedicated cancel confirmation page
- [x] PRs with active TRs cannot be cancelled — guard in both `cancel_view` and `_do_cancel_prs` checks active TR statuses

### AC-6: Inventory Capacity Snapshot (Informational)
- [ ] Form displays inventory capacity snapshot for the **Destination POI** — not yet implemented (depends on inventory/stock module)

### AC-7: Audit Trail
- [x] `PRActivityLog` model exists with action, changed_by, previous/new status, details fields
- [x] Audit entries created on create, update, submit, and cancel via `_log_pr_activity` called from `save_model` and `cancel_view`

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PR-01-1 | ProductRequisition model + migration (header fields, line items with item code/auto-fill fields, status, audit) | DFS-032-1 | Done |
| PR-01-2 | FG PR creation API (POST) with multi-line support | DFS-032-2 | Pending |
| PR-01-3 | PR number auto-generation: `PR-FG-YYYYMMDD-XXXX` | DFS-032-3 | Done |
| PR-01-4 | Draft save → Submit workflow with status transitions | DFS-032-4 | Done |
| PR-01-5 | Destination POI pre-fill from logged-in user's assigned POI; editable — dropdown of all active POIs | DFS-032-5 | Done |
| PR-01-6 | Product autocomplete + auto-populates Name, Category, Sub-Category, Packing Type, Weight from MDM-01 | DFS-032-6 | Done |
| PR-01-7 | Total weight calculation per line item (Qty × Weight per Unit) and grand total | DFS-032-7 | Done |
| PR-01-8 | Destination POI inventory capacity snapshot widget (read-only, informational) | DFS-032-8 | Pending |
| PR-01-9 | FG-only role gate — Depot/Feed Mill Officers cannot create Port Shipments | DFS-032-9 | Done |
| PR-01-10 | PR list view API (GET with filters: status, date, search) | DFS-032-10 | Pending |
| PR-01-11 | PR detail view API | DFS-032-11 | Pending |
| PR-01-12 | PR cancellation API with reason | DFS-032-12 | Pending |
| PR-01-13 | PR creation UI — Django Admin form with inline line items, product autocomplete, autofill JS | DFS-032-13 | Done |
| PR-01-14 | PR list + detail UI | DFS-032-14 | Done |

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

- [x] FG PR creation with multi-line products (Django Admin + `PRLineItemInline`)
- [x] Product autocomplete lookup auto-fills Name, Category, Sub-Category, Packing Type, Weight per Unit from MDM-01
- [x] UOM selection + Quantity + Weight per Unit + auto-calculated Total Weight per line item and grand total
- [x] Draft save + submit workflow — Save as Draft / Submit Requisition buttons; `submitted_at` set; form locked after submit
- [x] PR number auto-generation (`PR-FG-YYYYMMDD-XXXX`)
- [ ] Destination POI pre-filled from user's assigned POI; editable to active POIs only
- [ ] Role gate enforced — only FG PR type available to Depot/Feed Mill Officers
- [ ] Status lifecycle enforced (lock on submit, TR-triggered status transitions)
- [ ] Inventory capacity snapshot displayed for destination POI
- [ ] Audit logging on create/submit/edit/cancel
- [ ] Unit tests > 80%
- [ ] UAT: Depot/Feed Mill Officer can create and submit 5+ FG PRs
