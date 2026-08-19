---
module: 04-requisitions
specification: Distribution Management
version: 1.1
phase: Phase 1
source_document: DFMS_Product_Requirements_Document_v3.md
sprint: Sprint 3
last_updated: 2026-05-07
related_stories: DFS-034 (DR-01), DFS-035 (DR-02)
jira_epic: DFS-041
---

# Distribution Management Specification

## Overview

The Distribution module bridges the Requisition and Transport Planning layers of the DFMS workflow. It provides the Distribution team with:

1. **FG PR Queue** (DR-01) — Distribution Officers and Distribution Managers view all submitted Finished Goods Product Requisitions and navigate to TR creation.
2. **Transport request management (FG)** (DR-02) — Distribution Officers create **FG** TRs against PRs; Distribution Managers review, optionally modify, and approve or reject TRs before handover to **Transport** planning (TRQ-01).

Distribution handles **Finished Goods PRs only**. **Port Shipments** (import RM cargo registered by Commercial) are handled by the Procurement module.

**Module path**: `apps/requisitions/` (Distribution role views on `TransportRequisition`)  
**Dependencies**: `04-requisitions/product-requisition-management.md` (PR-01), MDM-04 (POI + capacity), `01-foundation` (RBAC)  
**Enables**: Transport Planning (TRQ-01) — approved TRs become `Available for Transport Planning`

---

## 0. Menu Structure & Navigation

The Distribution module exposes **two sub-menus** visible to both Distribution Officers and Distribution Managers. Each sub-menu serves a distinct purpose in the workflow.

```
Sidebar
└── Distribution
      ├── Product requisitions (FG)       [Distribution Officer, Distribution Manager]
      │     ├── FG PR Queue                 — all Submitted / In Progress PRs; filter by POI / category / urgency / date
      │     └── PR Detail                   — line items, capacity snapshot, linked TRs, remaining qty; action: Create TR
      │
      └── Transport requests (FG)         [Distribution Officer (own), Distribution Manager (all pending)]
            ├── TR List                     — DO: own TRs; DM: all Pending Approval TRs
            ├── TR Detail                   — source/dest POIs, capacity snapshots, line quantities, approval panel
            └── (TR creation reached via PR Detail → "Create Transport Request" button)
```

### Role → Sub-menu access

| Role | Product requisitions (FG) | Transport requests (FG) |
|------|---------------------|--------------------|
| Distribution Officer | View queue + PR detail; navigate to Create TR | View own TRs; Create TR (from PR detail) |
| Distribution Manager | View queue + PR detail | View all Pending Approval TRs; Approve / Approve-with-modify / Reject / Request Clarification |

### Screen hierarchy

```
Distribution → Product requisitions (FG)
  FG PR Queue  (GET /product-requisitions?type=FG&status=SUBMITTED,IN_PROGRESS)
    └── [row click] ──► PR Detail
                          ├── Capacity snapshot (destination POI)
                          ├── Linked TRs section
                          └── [Create Transport Request] ──► TR Creation Form   (DO only; disabled if Fully Allocated)

Distribution → Transport requests (FG)
  TR List
    ├── DO view  (GET /transport-requests?created_by=me)
    └── DM view  (GET /transport-requests?status=PENDING_APPROVAL)
    └── [row click] ──► TR Detail
                          ├── Capacity snapshots (source + destination POI)
                          ├── Line item quantities
                          └── Approval panel (DM only)
                                ├── [Approve]                ──► TR → Available for Transport Planning
                                ├── [Approve with Modify]    ──► Modify qty / date + mandatory remarks → Approved
                                ├── [Reject]                 ──► Mandatory remarks → Rejected → DO notified
                                └── [Request Clarification]  ──► Mandatory remarks → TR stays Pending Approval → DO notified

TR Creation Form  (reached from PR Detail)
  Pre-filled: Parent PR, Destination POI, product line items, delivery date
  DO enters:  Source POI, quantity per line, remarks (optional)
  Real-time:  Remaining qty indicator, capacity snapshots (source + dest)
  └── [Submit] ──► TR created (Pending Approval) ──► TR Detail
```

---

## 1. Distribution Workflow

```
FG PR Submitted (PR-01)
       │
       ▼
Distribution Officer
  └── Distribution → Product requisitions (FG) queue
        View submitted FG PRs (DR-01)
        ↓
  └── Create TR(s) against PR (DR-02)
        Source POI: selected per TR
        Destination: inherited from PR (read-only)
        Quantity: per product line — must not exceed remaining PR qty
        TR auto-number: TR-FG-YYYYMMDD-XXXX
        TR status → Pending Approval
        ↓
Distribution Manager
  └── Distribution → Transport requests (FG) approval queue (DR-02)
        Review TR (capacity snapshots for source + dest POI)
        ├── Approve → TR → Available for Transport Planning
        ├── Approve with Modification (mandatory remarks) → TR → Available for Transport Planning
        └── Reject (mandatory remarks) → TR → Rejected → returned to DO
        ↓
Transport Planning (TRQ-01) receives approved TRs
```

### 1.1 Key Design Constraints

- **Source POI is not on the PR** — it is set per TR by the Distribution Officer. Multiple TRs can source from different POIs.
- **Destination POI is inherited from the PR** — read-only on the TR; Distribution cannot change it.
- **No Draft state for TRs** — a TR is submitted directly on creation, immediately entering `Pending Approval`.
- **Vehicle count and type are not set here** — the Transport Planner captures these at TR assessment (TRQ-01).
- **Quantity overflow is hard-blocked** — total TR quantity across all TRs for one PR must not exceed the PR total quantity.
- **Self-approval is blocked** — the Distribution Manager cannot approve a TR that they created.

---

## 2. Data Model

### 2.1 TransportRequest

```typescript
TransportRequest {
  tr_id: UUID                          // Primary Key
  tr_number: string                    // Auto-generated: TR-FG-YYYYMMDD-XXXX

  // Linkage
  pr_id: UUID                          // FK → ProductRequisition (parent PR)
  tr_type: enum ['FINISHED_GOODS']     // Distribution TRs are always FG

  // Locations
  source_poi_id: UUID                  // FK → POI — selected by DO at TR creation
  destination_poi_id: UUID             // FK → POI — inherited from PR (read-only copy)

  // Schedule
  delivery_date: Date                  // Pre-filled from PR; editable by DO (and by DM on modify)

  // Notes
  remarks: string (nullable)           // Optional on creation; mandatory on DM modification or rejection

  // Status
  status: enum [
    'Pending Approval',
    'Approved',
    'Rejected',
    'Available for Transport Planning',
    'Under Planning',
    'Fulfilled',
    'Cancelled'
  ]

  // Approval metadata
  approved_by: UUID (nullable)         // FK → User (Distribution Manager)
  approved_at: DateTime (nullable)
  approval_action: enum ['Approved', 'ApprovedWithModification', 'Rejected'] (nullable)
  approval_remarks: string (nullable)  // Mandatory when action = ApprovedWithModification | Rejected

  // Rejection
  rejected_by: UUID (nullable)
  rejected_at: DateTime (nullable)
  rejection_reason: string (nullable)

  // Metadata
  tenant_id: UUID
  created_by: UUID                     // Distribution Officer
  created_at: DateTime
  updated_by: UUID (nullable)
  updated_at: DateTime
}
```

### 2.2 TransportRequestLineItem

Each TR line item maps 1:1 to a line item in the parent PR but captures the quantity allocated by this TR specifically.

```typescript
TransportRequestLineItem {
  tr_line_item_id: UUID
  tr_id: UUID                          // FK → TransportRequest
  pr_line_item_id: UUID                // FK → ProductRequisitionLineItem (reference)

  // Product snapshot (denormalised from PR line item for display)
  product_id: UUID                     // FK → Product
  product_item_code: string
  product_name: string
  product_category: string
  product_sub_category: string (nullable)
  unit_of_measure: string              // Inherited from PR line item

  // Quantities
  pr_line_quantity: Decimal            // Total quantity on the PR line (informational)
  allocated_quantity: Decimal          // Quantity allocated by this TR for this product line
  allocated_weight_kg: Decimal         // allocated_quantity × weight_per_unit (calculated)

  // Line order
  line_number: Integer
}
```

### 2.3 PRAllocationSummary (Computed / Service Layer)

Not stored as a separate table — computed on demand from TR line items.

```typescript
PRAllocationSummary {
  pr_id: UUID
  pr_line_item_id: UUID
  product_id: UUID
  product_name: string
  pr_quantity: Decimal                 // From PR line item
  total_allocated_quantity: Decimal    // SUM(tr_line_item.allocated_quantity) across all non-cancelled TRs
  remaining_quantity: Decimal          // pr_quantity - total_allocated_quantity
  is_fully_allocated: boolean          // remaining_quantity <= 0
}
```

### 2.4 TRActivityLog (Audit Trail)

```typescript
TRActivityLog {
  log_id: UUID
  tr_id: UUID
  action: enum [
    'Created', 'Submitted', 'Approved', 'ApprovedWithModification',
    'Rejected', 'RequestedClarification', 'Cancelled', 'StatusChanged',
    'QuantityModified', 'DeliveryDateModified'
  ]
  performed_by: UUID
  timestamp: DateTime
  previous_status: string (nullable)
  new_status: string (nullable)
  modified_fields: JSON (nullable)     // e.g. { "allocated_quantity": { "before": 100, "after": 80 } }
  remarks: string (nullable)
}
```

---

## 3. TR Number Auto-Generation

### 3.1 Format

| TR Type | Format | Example |
|---------|--------|---------|
| Finished Goods (Distribution) | `TR-FG-YYYYMMDD-XXXX` | `TR-FG-20260422-0001` |

### 3.2 Generation Logic

```python
def generate_tr_number(tr_type: str, tenant_id: UUID) -> str:
    prefix = 'TR-FG'
    date_str = datetime.today().strftime('%Y%m%d')

    # Sequence resets per type per tenant per day
    sequence = (
        TransportRequest.objects
        .filter(tenant_id=tenant_id, tr_type=tr_type,
                created_at__date=date.today())
        .count() + 1
    )

    return f"{prefix}-{date_str}-{sequence:04d}"
```

Generated atomically at TR creation; unique per tenant.

---

## 4. TR Status Lifecycle

### 4.1 Status Transitions

```
                    ┌──────── Rejected ◄──────────────────────────────┐
                    │           │                                      │
Created             │           │ (returned to DO; PR qty released)    │
    │               │           ▼                                      │
    ▼               │       [DO sees]                             Reject│
Pending Approval ───┤                                                   │
    ▲               │                                        Distribution
    │ (stays in     │                                           Manager
    │  queue)       ├── Request Clarification ──► DO notified; TR stays Pending
    └───────────────┘
                    │
                    └── Approve / Approve w/ Modify ──► Available for Transport Planning
                                                               │
                                                               ▼ (Transport Planner claims)
                                                          Under Planning
                                                               │
                                                               ▼
                                                            Fulfilled
```

Additionally: any TR in `Pending Approval` or `Approved` may be `Cancelled` (by DO or admin).

### 4.2 Transition Rules

| Transition | Trigger | Guard |
|-----------|---------|-------|
| Created → Pending Approval | TR saved by Distribution Officer | Quantity overflow check must pass |
| Pending Approval → Approved | DM approves | `approved_by ≠ created_by` (no self-approval) |
| Pending Approval → ApprovedWithModification | DM modifies + approves | Remarks mandatory; `approved_by ≠ created_by` |
| Pending Approval → Rejected | DM rejects | Rejection reason mandatory; `approved_by ≠ created_by` |
| Pending Approval → Pending Approval (clarification) | DM requests clarification | Remarks mandatory; DO notified; TR stays in queue |
| Approved → Available for Transport Planning | Automatic on approval | None |
| Available for Transport Planning → Under Planning | Transport Planner submits planning details | Transport module |
| Under Planning → Fulfilled | All TOs fulfilled | Transport module |
| Pending Approval / Approved → Cancelled | DO cancels | Admin override required if Under Planning or later |

### 4.3 Post-Rejection Behaviour

When a TR is rejected:
- TR status → `Rejected`
- DO receives in-app notification with the rejection reason
- PR allocation for this TR's quantities is released (remaining qty increases back)
- DO can create a new TR against the same PR if remaining quantity allows

### 4.4 Clarification Request Behaviour

When DM requests clarification:
- TR status remains `Pending Approval` (no status change — TR stays in DM's queue)
- DO receives in-app notification containing the DM's question / remarks
- DO provides context (updates TR remarks or contacts DM), then DM acts (Approve / Approve with Modification / Reject)
- Clarification requests are immutably recorded in the audit log (`action = 'RequestedClarification'`)

---

## 5. Role Gates & Access Control

### 5.1 Action Permissions

| Action | Distribution Officer | Distribution Manager |
|--------|---------------------|---------------------|
| View FG PR queue | ✓ | ✓ |
| View PR detail + linked TRs | ✓ | ✓ |
| Create TR against FG PR | ✓ | ✗ |
| View own TR list | ✓ | — |
| View all Pending Approval TRs | — | ✓ |
| Approve TR | ✗ | ✓ (cannot self-approve) |
| Approve TR with modification | ✗ | ✓ (cannot self-approve) |
| Reject TR | ✗ | ✓ (cannot self-approve) |
| Request clarification on TR | ✗ | ✓ (cannot on own TR) |
| Cancel TR (pre-approval) | ✓ (own) | ✓ |

### 5.2 Queue Visibility Rules

```
Distribution Officer:
  PR Queue: all FG PRs with status IN [Submitted, In Progress]
  TR List: only TRs created_by = current_user

Distribution Manager:
  PR Queue: all FG PRs with status IN [Submitted, In Progress, Fully Allocated]
  TR Approval Queue: all TRs with status = Pending Approval (tr_type = FINISHED_GOODS)
```

---

## 6. FG PR Queue — Distribution View (DR-01)

### 6.1 Queue Columns

| Column | Notes |
|--------|-------|
| PR Number | Link to PR detail |
| Requester | Requester name + department |
| Destination POI | From PR header |
| Product(s) | Summary of product names (first 2 + "n more") |
| Total Quantity | Grand total weight (kg) from PR |
| Urgency | Normal / High / Critical — badge colour |
| Preferred Delivery Date | From PR |
| Status | Submitted / In Progress / Fully Allocated |
| Actions | View Detail / Create TR |

### 6.2 Filters & Sorting

**Filters**:
- Destination POI (dropdown of all POIs)
- Product Category (FG categories dropdown)
- Delivery Date range
- Urgency
- Status

**Sort** (default: Delivery Date ascending):
- Delivery Date
- Urgency (Critical → High → Normal)
- Submission Date

**No Source POI filter** — source POI is not on the PR.

### 6.3 PR Detail View (Distribution view)

Fields displayed:

```
Header:
  PR Number | Status | PR Type | Urgency | Submission Date
  Requester Name | Requester Department
  Destination POI (with capacity snapshot — see §6.4)
  Preferred Delivery Date & Time
  Special Instructions

Product Line Items (table):
  Line # | Item Code | Product Name | Category | Sub-Category | Packing | UOM | Qty | Wt/Unit | Total Wt

Allocation Summary:
  Total PR Quantity (kg)
  Total Allocated across all TRs (kg)
  Remaining Quantity (kg)

Linked TRs Section:
  TR Number | Source POI | Allocated Qty | Status | Created By | Action (view)
```

### 6.4 Destination POI Capacity Snapshot

Displayed on the PR detail view (read-only, informational).

```typescript
CapacitySnapshot {
  poi_name: string
  total_capacity_mt: Decimal
  current_stock_mt: Decimal
  free_capacity_mt: Decimal
  projected_inbound_mt: Decimal        // PR grand total weight (inbound via this PR)
  projected_utilization_pct: Decimal   // (current_stock + projected_inbound) / total_capacity × 100
  will_exceed_capacity: boolean        // Warning shown (yellow) if true
}
```

Capacity data is sourced from POI Management (MDM-04). If unavailable, widget shows a graceful "capacity data unavailable" state — does not block TR creation.

### 6.5 "Create Transport Request" Button

- Visible on PR **changelist** (as `create_tr_link` column) and PR **detail page** for:
  - Distribution Officer (`distribution_officer`)
  - Tenant Admin (always has access to all action buttons)
- Button shown when PR status is `submitted` or `in_progress`
- **Hidden** if PR status is `Fully Allocated`, `Cancelled`, or `Fulfilled`
- Button label: **"Create transport request"** (no abbreviation)
- Navigates to a 2-step TR creation flow: PR picker → TR form pre-filled with PR data

> **Implementation note**: Tenant Admin visibility was added mid-sprint — the initial implementation only showed the button to Distribution Officer. Both `_is_distribution_officer(request)` and `_tenant_admin_allowed(request)` checks were unified in `create_tr_link` computed column and `change_view` extra context.

---

## 7. Transport Request Creation (DR-02)

### 7.1 TR Creation Form Fields

| Field | Source | Editable |
|-------|--------|----------|
| Parent PR Number | Pre-filled from PR | Read-only |
| Destination POI | Inherited from PR | Read-only |
| Product line items (item code, name, category, sub-category, packing, UOM) | Inherited from PR | Read-only |
| Source POI | Active POI dropdown — cannot equal Destination POI | Required |
| Transfer Quantity (per product line) | Entered by DO | Required; overflow-guarded |
| Delivery Date | Pre-filled from PR | Editable |
| Remarks | Free text | Optional (mandatory if DM later modifies) |

**Remaining quantity indicator**: Real-time display of `PR line quantity − already allocated − current entry`. Updates as DO types.

**Capacity snapshots**: Shown for both Source POI and Destination POI during TR creation.

### 7.2 Source POI Constraints

```typescript
Source POI Rules:
  - Must be in is_active = true
  - Must NOT equal destination_poi_id (from PR)
  - No restriction on POI type — DO picks any active POI as source
```

### 7.3 TR Quantity Allocation Validation

```typescript
For each product line item on the TR:

  already_allocated = SUM(
    tr_line_item.allocated_quantity
    WHERE tr_line_item.pr_line_item_id = current_pr_line_item_id
    AND tr.status NOT IN ['Rejected', 'Cancelled']
  )

  available_to_allocate = pr_line_item.product_quantity - already_allocated

  IF new_tr_line_quantity > available_to_allocate:
    BLOCK TR creation
    RETURN 409 Conflict {
      "error": "Quantity exceeds remaining PR allocation",
      "pr_line_quantity": <pr_line_item.product_quantity>,
      "already_allocated": <already_allocated>,
      "available_to_allocate": <available_to_allocate>,
      "requested_quantity": <new_tr_line_quantity>
    }
```

Validation runs per-line-item. A TR is rejected if **any** line item overflows, even if others are within range.

### 7.4 Multi-TR per PR

```
After TR-1 is created (partial allocation):
  PR status → In Progress
  "Remaining Quantity" on PR decreases
  DO can create TR-2 with a different Source POI for the remaining quantity

When all line items are fully allocated (remaining = 0):
  PR status → Fully Allocated
  "Create TR" button disabled on PR detail
```

---

## 8. Distribution Manager Approval (DR-02)

### 8.1 Approval Queue

**Columns**:

| Column | Notes |
|--------|-------|
| TR Number | Link to TR detail |
| Parent PR | PR Number + link |
| Source POI | Source POI name |
| Destination POI | Destination POI name |
| Total Quantity (kg) | Sum of TR line item allocated weights |
| Urgency | Inherited from parent PR |
| Submitted By | Distribution Officer name |
| Submitted Date | TR created_at |

**Filters**:
- Source/Destination POI
- Product Category
- Delivery Date range
- Urgency (inherited from PR)

**Sort** (default: Delivery Date ascending):
- Delivery Date
- Urgency
- Submitted Date

### 8.2 TR Detail View (Manager Review)

```
TR Header:
  TR Number | Status | Parent PR | Submitted By | Submitted Date

Source + Destination:
  Source POI (+ capacity snapshot)
  Destination POI (+ capacity snapshot)

Product Line Items (table):
  Product | Item Code | UOM | PR Qty | Allocated Qty | Allocated Weight (kg)

Schedule:
  Delivery Date

Remarks (if any from DO)
```

Both capacity snapshots (source and destination) are displayed side-by-side during DM review — same widget as §6.4.

### 8.3 Approval Actions

#### Approve

```
POST /api/v1/transport-requests/{tr_id}/approve
Body: { remarks?: string }

Effect:
  TR status: Pending Approval → Approved → Available for Transport Planning (auto-transition)
  Audit log: action=Approved, approved_by, timestamp
  Notification: DO notified (in-app) — "Your TR has been approved"
  Notification: Transport Planners notified — "New TR available for planning"
```

#### Approve with Modification

```
POST /api/v1/transport-requests/{tr_id}/approve-with-modify
Body: {
  quantity_lines?: [{ tr_line_item_id, new_allocated_quantity }],
  delivery_date?: Date,
  remarks: string   // MANDATORY
}

Guard: remarks must not be empty — 400 Bad Request if omitted
Guard: modified quantities must still pass overflow check against PR remaining allocation
Guard: approved_by ≠ created_by

Effect:
  TR line items updated to new quantities
  Delivery date updated if provided
  TR status: Pending Approval → Approved → Available for Transport Planning (auto-transition)
  Audit log: action=ApprovedWithModification, modified_fields JSON, remarks, approver, timestamp
  Notification: DO notified — "Your TR was approved with modifications"
  Notification: Transport Planners notified
```

#### Reject

```
POST /api/v1/transport-requests/{tr_id}/reject
Body: { remarks: string }  // MANDATORY

Guard: remarks must not be empty — 400 Bad Request if omitted
Guard: approved_by ≠ created_by

Effect:
  TR status: Pending Approval → Rejected
  PR allocation released — remaining qty increases back
  Audit log: action=Rejected, rejection_reason, approver, timestamp
  Notification: DO notified — "Your TR has been rejected: {remarks}"
```

#### Request Clarification

```
POST /api/v1/transport-requests/{tr_id}/request-clarification
Body: { remarks: string }  // MANDATORY

Guard: remarks must not be empty — 400 Bad Request if omitted
Guard: tr.created_by ≠ request.user.id

Effect:
  TR status: unchanged (remains Pending Approval)
  Audit log: action=RequestedClarification, remarks, requested_by, timestamp
  Notification: DO notified — "Distribution Manager has requested clarification on TR {tr_number}: {remarks}"
```

### 8.4 Self-Approval Prevention

The system always checks `tr.created_by ≠ request.user.id` before executing any approval action, regardless of role. Returns `403 Forbidden` with message: `"You cannot approve a TR you created"`.

---

## 9. Notifications

| Event | Recipient | Channel | Message |
|-------|-----------|---------|---------|
| TR approved | Distribution Officer (creator) | In-app | "Transport Request {tr_number} has been approved" |
| TR approved with modification | Distribution Officer (creator) | In-app | "Transport Request {tr_number} was approved with modifications. See remarks." |
| TR rejected | Distribution Officer (creator) | In-app | "Transport Request {tr_number} has been rejected: {remarks}" |
| Clarification requested | Distribution Officer (creator) | In-app | "Distribution Manager requested clarification on TR {tr_number}: {remarks}" |
| TR available for planning | All Transport Planners (tenant) | In-app | "New Transport Request {tr_number} is available for planning" |

Notifications are stored in the platform notification table and displayed in the in-app notification bell. Email/SMS is a future enhancement.

---

## 10. API Endpoints

All endpoints require authentication. Tenant context is resolved from the authenticated user.

### 10.1 FG PR Queue (Distribution View)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `GET` | `/api/v1/product-requisitions` | FG PR queue (pass `?type=FG&status=SUBMITTED,IN_PROGRESS`) | Distribution Officer, Distribution Manager |
| `GET` | `/api/v1/product-requisitions/{pr_id}` | PR detail with linked TRs and allocation summary | Distribution Officer, Distribution Manager |
| `GET` | `/api/v1/product-requisitions/{pr_id}/transport-requests` | Linked TRs for a PR + remaining quantity | Distribution Officer, Distribution Manager |
| `GET` | `/api/v1/pois/{poi_id}/capacity` | Capacity snapshot for a POI | Distribution Officer, Distribution Manager |

### 10.2 Transport requests (FG) — API

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| `POST` | `/api/v1/transport-requests` | Create TR against a FG PR | Distribution Officer |
| `GET` | `/api/v1/transport-requests` | List TRs (own for DO; all pending approval for DM) | Distribution Officer, Distribution Manager |
| `GET` | `/api/v1/transport-requests/{tr_id}` | TR detail | Distribution Officer, Distribution Manager |
| `POST` | `/api/v1/transport-requests/{tr_id}/cancel` | Cancel TR | Distribution Officer (own), admin |
| `POST` | `/api/v1/transport-requests/{tr_id}/approve` | Approve TR | Distribution Manager |
| `POST` | `/api/v1/transport-requests/{tr_id}/approve-with-modify` | Approve with modification (qty + date) | Distribution Manager |
| `POST` | `/api/v1/transport-requests/{tr_id}/reject` | Reject TR with mandatory remarks | Distribution Manager |
| `POST` | `/api/v1/transport-requests/{tr_id}/request-clarification` | Request clarification from DO | Distribution Manager |
| `GET` | `/api/v1/transport-requests/{tr_id}/audit-trail` | TR activity log | Distribution Officer (own), Distribution Manager, admin |

### 10.3 Query Parameters

```
GET /api/v1/product-requisitions
  ?type=FG
  &status=SUBMITTED,IN_PROGRESS,FULLY_ALLOCATED
  &destination_poi=<uuid>
  &product_category=<string>
  &urgency=Normal|High|Critical
  &date_from=<ISO date>
  &date_to=<ISO date>
  &sort=delivery_date|urgency|submitted_date
  &page=<int>
  &per_page=<int>   # Default 20

GET /api/v1/transport-requests
  ?pr_id=<uuid>
  &type=FG
  &status=PENDING_APPROVAL|APPROVED|REJECTED|AVAILABLE_FOR_TRANSPORT_PLANNING
  &source_poi=<uuid>
  &destination_poi=<uuid>
  &product_category=<string>
  &date_from=<ISO date>
  &date_to=<ISO date>
  &sort=delivery_date|urgency|submitted_date
  &page=<int>
  &per_page=<int>   # Default 20
```

### 10.4 Request / Response Shapes

**Create TR (POST `/api/v1/transport-requests`)**

```json
{
  "pr_id": "uuid",
  "source_poi_id": "uuid",
  "delivery_date": "2026-05-01",
  "remarks": "Sourcing from Gazipur depot",
  "quantity_lines": [
    {
      "pr_line_item_id": "uuid",
      "allocated_quantity": 300
    },
    {
      "pr_line_item_id": "uuid",
      "allocated_quantity": 100
    }
  ]
}
```

**Approve with Modification (POST `/api/v1/transport-requests/{tr_id}/approve-with-modify`)**

```json
{
  "quantity_lines": [
    { "tr_line_item_id": "uuid", "new_allocated_quantity": 250 }
  ],
  "delivery_date": "2026-05-03",
  "remarks": "Reduced quantity due to source POI stock constraint. Adjusted delivery date."
}
```

**Reject TR (POST `/api/v1/transport-requests/{tr_id}/reject`)**

```json
{
  "remarks": "Source POI does not have sufficient stock. Please revise source selection."
}
```

**Overflow Error Response (409 Conflict)**

```json
{
  "error": "Quantity exceeds remaining PR allocation",
  "detail": [
    {
      "pr_line_item_id": "uuid",
      "product_name": "Broiler Starter Feed",
      "pr_line_quantity": 500,
      "already_allocated": 400,
      "available_to_allocate": 100,
      "requested_quantity": 200
    }
  ]
}
```

---

## 11. Business Rules

### 11.1 Destination POI Immutability

```
Destination POI on a TR is always inherited from the parent PR.
It cannot be changed by the Distribution Officer or Distribution Manager.
```

### 11.2 Source ≠ Destination

```
Source POI must differ from Destination POI.
API returns 400 Bad Request:
  { "error": "Source POI and Destination POI cannot be the same" }
```

### 11.3 Quantity Overflow — Hard Block

```
At TR creation:
  For every product line item:
    allocated_quantity ≤ (pr_line_quantity − already_allocated_across_non_cancelled_trs)
  
  Any overflow → entire TR creation blocked → 409 Conflict

At DM Approve-with-Modification:
  Same check re-run against post-modification values
```

### 11.4 No Draft State for TRs

```
TRs are submitted directly on creation (no Draft → Submit step).
Status at creation = Pending Approval.
Immutable from that point until DM acts.
```

### 11.5 Remarks Requirement

```
Remarks optional: TR creation by DO
Remarks optional: DM pure Approve
Remarks MANDATORY: DM Approve with modification (qty / date changes only — no priority or vehicle requirement changes)
Remarks MANDATORY: DM Reject
Remarks MANDATORY: DM Request Clarification

API returns 400 Bad Request if remarks absent when mandatory.
```

> **Note on approve-with-modify scope**: DM may only modify **quantity per line item** and **delivery date**. Urgency/priority modification is not supported (urgency lives on the PR, not the TR). Vehicle count/type is set by the **Transport Planner** at TRQ-01 — Distribution Manager cannot modify these fields.

### 11.6 TR Cancellation

```
DO can cancel own TRs in status Pending Approval.
DM can cancel any TR in status Pending Approval or Approved.
Cancellation releases the PR allocation for those line items (remaining qty increases).
TRs in Under Planning or later require admin override.
```

### 11.7 PR Status Auto-Updates

```
When first TR is created against a PR → PR status: Submitted → In Progress (auto)
When all PR line quantities are fully allocated → PR status: In Progress → Fully Allocated (auto)
When a TR is cancelled or rejected → Remaining qty restored; PR may revert Fully Allocated → In Progress
When all TRs for a PR are fulfilled → PR status → Fulfilled (auto, from Transport module)
```

### 11.8 Unique TR Number

```
TR numbers are unique per tenant.
Sequence resets per TR type per tenant per day.
Generated atomically using select_for_update to prevent race conditions.
```

---

## 12. Indexes for Performance

```sql
-- Transport requisitions (TR — FG, Port Consignment, …)
CREATE INDEX idx_tr_tenant_type_status ON transport_requests(tenant_id, tr_type, status);
CREATE INDEX idx_tr_pr ON transport_requests(pr_id);
CREATE INDEX idx_tr_source_poi ON transport_requests(source_poi_id);
CREATE INDEX idx_tr_dest_poi ON transport_requests(destination_poi_id);
CREATE INDEX idx_tr_created_by ON transport_requests(created_by, tenant_id);
CREATE INDEX idx_tr_number ON transport_requests(tr_number, tenant_id);
CREATE INDEX idx_tr_created_at ON transport_requests(created_at DESC);
CREATE INDEX idx_tr_approval ON transport_requests(status, approved_by);

-- TR Line Items
CREATE INDEX idx_tr_line_item_tr ON tr_line_items(tr_id);
CREATE INDEX idx_tr_line_item_pr_line ON tr_line_items(pr_line_item_id);
CREATE INDEX idx_tr_line_item_product ON tr_line_items(product_id);

-- Audit
CREATE INDEX idx_tr_audit_tr ON tr_activity_logs(tr_id);
CREATE INDEX idx_tr_audit_ts ON tr_activity_logs(timestamp DESC);
```

---

## 13. Django Admin SSR Implementation

### 13.1 Admin Class Structure

`TransportRequisitionAdmin` is a single class serving multiple roles (`distribution_officer`, `distribution_manager`, `procurement_officer`, `transport_planner`) with tailored fieldsets, permissions, and list columns per role.

The admin lives in `apps/requisitions/admin.py`.

### 13.2 Role-Specific List Columns (`get_list_display`)

| Role | Columns shown |
|------|--------------|
| Distribution Officer | TR#, status, source POI, destination POI, urgency, delivery date, created date |
| Distribution Manager | TR#, status, source POI, destination POI, urgency, delivery date, submitted by |
| Transport Planner | TR#, status, type, source/dest POI, delivery date, vehicles required display, assigned TOs count, create TO button |
| Tenant Admin | Same as Transport Planner (full context) |

### 13.3 Approval Actions

Distribution Manager has two custom `@admin.action` bulk actions on the TR changelist:
- **"✔ Approve Selected"** (green) — calls `TRService.approve()` for each selected `Pending Approval` TR
- **"✘ Reject Selected"** (red) — calls `TRService.reject()` (bulk rejection with shared reason)

Both actions are hidden for all other roles.

### 13.4 Planning Inputs Fieldset Visibility

The **Planning Inputs** fieldset (vehicle type, vehicles required) is conditionally shown/hidden:
- Hidden for: `distribution_officer`, `distribution_manager`, `procurement_officer`
- Shown and editable for: `transport_planner`, `tenant_admin`

```python
def get_fieldsets(self, request, obj=None):
    if _is_distribution_or_procurement(request):
        return fieldsets_without_planning_inputs
    return full_fieldsets
```

### 13.5 FG PR Inline Row Visibility Fix

A scoped CSS fix ensures PR line item rows are visible to read-only roles. The original broad rule `[id^="line_items-"] td > p { display: none }` was narrowed to `td.original > p` — which hides the inline's "object name" paragraph (only shown in the first `td.original` column) without hiding the actual field value `<p>` tags in data columns.

---

## 14. Unit Testing Strategy

### 14.1 Coverage Targets

- **Models / Business Logic**: 90%+
- **API / Views**: 85%+
- **Serializers / Validators**: 90%+

### 14.2 Core Test Cases

**TR Creation Tests**
- DO creates TR against FG PR — success path: TR created, status = Pending Approval
- DO creates TR with quantity equal to remaining PR quantity — succeeds
- DO creates TR with quantity exceeding remaining PR quantity — blocked (409)
- DO creates two TRs for the same PR from different source POIs — both succeed
- DO creates TR with source POI = destination POI — blocked (400)
- DO creates TR against a Cancelled PR — blocked
- DO creates TR against a Fully Allocated PR — blocked
- TR number auto-generation is unique and correctly formatted
- PR status transitions to `In Progress` after first TR creation
- PR status transitions to `Fully Allocated` when remaining qty = 0

**Approval Tests**
- DM approves TR → status = Available for Transport Planning (auto-transition)
- DM approves with modification (qty + delivery date) with remarks → succeeds; line items updated; audit logged
- DM approves with modification without remarks → 400 Bad Request
- DM rejects TR with remarks → status = Rejected; DO notified; PR allocation released
- DM rejects TR without remarks → 400 Bad Request
- DM requests clarification with remarks → TR stays Pending Approval; DO notified; audit logged
- DM requests clarification without remarks → 400 Bad Request
- DM approves TR they created → 403 Forbidden (self-approval block)
- DM modifies quantity beyond available PR allocation → 409 Conflict

**Queue / List Tests**
- `GET /product-requisitions?type=FG` returns only FG PRs for Distribution role
- `GET /transport-requests` for DO returns only own TRs
- `GET /transport-requests` for DM returns all Pending Approval TRs
- Filter by destination_poi, product_category, status, date range all work independently

**Status Propagation Tests**
- TR rejection releases PR allocation; remaining qty restored correctly
- TR cancellation releases PR allocation
- Second TR can be created after first is rejected (up to original PR qty)

**Audit Trail Tests**
- Create, Approve, ApprovedWithModification, Reject, RequestedClarification all generate audit log entries
- Modification audit log contains before/after values in `modified_fields` JSON

**Notification Tests**
- DO receives notification on approve (mock notification service)
- DO receives notification on reject with correct remarks
- Transport Planners receive notification on Available for Transport Planning

### 14.3 Test Factories

```python
class TransportRequestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TransportRequest
    tr_type = 'FINISHED_GOODS'
    status = 'Pending Approval'
    source_poi = factory.SubFactory(POIFactory)
    destination_poi = factory.SubFactory(POIFactory)
    delivery_date = factory.LazyFunction(lambda: date.today() + timedelta(days=7))

class TRLineItemFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = TransportRequestLineItem
    tr = factory.SubFactory(TransportRequestFactory)
    allocated_quantity = factory.Faker('pydecimal', left_digits=3, right_digits=2, positive=True)
```

---

## 15. Integration Points

### 15.1 Upstream Dependencies

| Module / Entity | Usage |
|----------------|-------|
| `product-requisition-management.md` (PR-01) | FG PRs consumed from PR queue; PR allocation tracking; PR status updates |
| MDM-04 (POI Master) | Source/Destination POI selection; capacity snapshot widget |
| `01-foundation` (RBAC) | Distribution Officer / Distribution Manager role gates |

### 15.2 Downstream Consumers

| Module | Interaction |
|--------|-------------|
| Transport Planning (TRQ-01) | Reads TRs with status `Available for Transport Planning` to create TOs |
| Notification service | In-app notifications to DO and Transport Planners on TR status changes |

### 15.3 Events Emitted

```typescript
TRCreated {
  tr_id: UUID
  pr_id: UUID
  tr_type: 'FINISHED_GOODS'
  source_poi_id: UUID
  destination_poi_id: UUID
  tenant_id: UUID
  timestamp: DateTime
}

TRStatusChanged {
  tr_id: UUID
  previous_status: string
  new_status: string
  performed_by: UUID
  timestamp: DateTime
}

TRAvailableForPlanning {
  tr_id: UUID
  tr_number: string
  tenant_id: UUID
  timestamp: DateTime
}
```

---

## 16. Related Documentation

- **[Product Requisition Management](product-requisition-management.md)** — FG PR data model, status lifecycle, PR-01 story
- **[POI Management](../02-master-data/poi-management.md)** — POI capacity snapshot data source
- **[Sprint 3 README](../../03-backlog/sprints/sprint-3/README.md)** — Full role access matrix and end-to-end workflow
- **[DR-01: Distribution FG PR Queue Story](../../03-backlog/sprints/sprint-3/03-distribution/DR-01-fg-product-requisitions.md)**
- **[DR-02: Distribution TR Creation & Approval Story](../../03-backlog/sprints/sprint-3/03-distribution/DR-02-transport-requests.md)**
- **[Permission Catalog Phase 1](../01-foundation/permission-catalog-phase1.md)** — Distribution Officer / Distribution Manager permissions

**Related Jira Keys**:
- DFS-034 — Distribution FG PR Queue
- DFS-035 — Distribution TR Creation & Manager Approval
- DFS-041 — Distribution Epic

**Source**: DFMS_Product_Requirements_Document_v3.md — Distribution module sections
