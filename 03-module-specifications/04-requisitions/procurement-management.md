---
module: 04-requisitions
specification: Procurement Management
version: 1.1
phase: Phase 1
sprint: Sprint 3
last_updated: 2026-05-07
related_stories: DFS-036 (PC-01), DFS-037 (PC-02)
jira_epic: DFS-042
---

# Procurement Management Specification

## Overview

The Procurement module gives the **Procurement Officer** visibility into **Port Shipments** — import cargo records registered by Commercial Officers (from external shipment data) — and the ability to create a **Destination Breakdown Plan** by creating one **Transport Request (TR)** per destination POI. **Transport Orders (TOs)** are created later by the Transport Planner from those TRs.

Unlike the Distribution flow, there is **no manager approval step** in Procurement. Submitted TRs are immediately `Available for Transport Planning`.

**Module path**: `apps/requisitions/` (TR type `PORT_CONSIGNMENT`; shipment records may persist as `ProductRequisition` / `PORT_CONSIGNMENT`)  
**Dependencies**: MDM-04 (POI Master — Port-type filter), `04-requisitions/product-requisition-management.md` (PR-02 Port Shipment), `01-foundation` (RBAC)  
**Enables**: `05-transport` Transport Planning queue (Port Consignment / RM TRs appear alongside FG TRs)

---

## 0. Menu Structure & Navigation

```
App shell (Procurement Officer)
├── Port Shipments          — **top-level** — org-wide list of submitted shipments (same module as Commercial; RBAC)
│     └── Shipment Detail   — read-only; Create TR → PC-02
└── Procurement
      └── Transport requests (Port consignment) — TRs this officer created; filter by shipment, destination, status
            ├── TR List
            └── TR Detail / Create
```

> **Port Shipment** triage is **not** a sub-menu under **Procurement** — it uses the shared **Port Shipments** entry point (see `product-requisition-management.md`).

### Screen hierarchy

```
Port Shipments (top-level)
  Org-wide list for Procurement (GET … scope=org)
    └── [row click] ──► Shipment Detail
                          ├── Shipment reference (read-only)
                          ├── RM cargo line items
                          ├── Capacity snapshots (informational)
                          ├── Linked TRs (destination breakdown so far)
                          ├── Remaining quantity per line item
                          └── [Create TR / Destination Breakdown] ──► TR Creation Form
                                                                          └── [Submit] ──► TR Detail

Procurement → Transport requests (module)
  TR List (GET /transport-requests?type=PORT_CONSIGNMENT)
    └── [row click] ──► TR Detail (read-only after submission)
```

---

## 1. Roles & Access

| Role | Port Shipments (top-level) | Procurement → Transport requests |
|------|------------------|--------------------|
| Procurement Officer | **All submitted** shipments (read); detail; Arrival Notice download; **Create TR** | Create/manage own TRs; cancel TR |

> There is **no Procurement Manager** role. No approval gate exists in this workflow.

### Role gate

- Procurement Officer sees **only** Port Shipment records (`PORT_CONSIGNMENT`) — FG PRs are not visible
- Procurement Officer cannot edit or cancel the shipment record (Commercial Officer ownership)
- **RM Cargo Line Items** and **Arrival Notices & Documents** inline sections are strictly read-only for Procurement Officer — no add, edit, or delete actions are available on those rows. This is enforced by adding `"procurement_officer"` to `_is_readonly_role` on `PRLineItemInline` and `PRDocumentInline`, and overriding `get_inline_instances` in `_PRBaseAdmin` to force read-only rendering even when `has_change_permission = False` for the parent
- Source POI is always a **Port-type POI** — enforced server-side; non-Port POIs are excluded from the source dropdown

---

## 2. Data Models

Models live in `apps/requisitions/models.py`. The Procurement flow reuses the same `ProductRequisition` and `TransportRequisition` models used by the Distribution flow, differentiated by `pr_type` and TR number format.

### 2.1 ProductRequisition (Port Shipment — read by Procurement Officer; created by Commercial Officer)

```python
ProductRequisition {
    pr_number: string               # e.g. "PR-20260422-0042"
    pr_type: "procurement"          # Filters this PR to Procurement Officer queue
    status: PRStatus                # See §3 for status lifecycle

    # Port Shipment / import reference (entered at registration by Commercial Officer)
    bl_number: string               # Bill of Lading
    lc_number: string               # Letter of Credit
    vessel_name: string
    voyage_name: string (nullable)
    container_numbers: string       # Comma-separated or JSON list
    cnf_agent_name: string          # C&F Agent
    point_of_loading: string        # POL
    eta: date                       # Estimated Time of Arrival
    arrival_notice: FileField       # Uploadable attachment; downloadable by Procurement Officer

    destination_poi: FK → POI       # Not used for Port Shipments — destination defined per TR
    origin_poi: FK → POI (null)     # Not set on PR; Source (Port) defined per TR

    requested_by: FK → User         # Commercial Officer
    required_date: date
    priority: enum [low, medium, high, critical]
    notes: text

    total_quantity_mt: decimal      # Denormalised sum across RM line items
    total_line_items: int
    submitted_at: datetime (null)
    fulfilled_at: datetime (null)
}
```

### 2.2 PRLineItem (RM cargo lines on a Port Shipment)

```python
PRLineItem {
    requisition: FK → ProductRequisition
    product: FK → Product               # RM product (item code + name + category)
    requested_quantity: decimal         # Total incoming RM quantity for this line
    approved_quantity: decimal (null)
    fulfilled_quantity: decimal         # Incremented as TRs are fulfilled
    uom: string                         # e.g. "mt", "kg"
    notes: text
}
```

### 2.3 TransportRequisition (created by Procurement Officer)

```python
TransportRequisition {
    tr_number: string               # Auto-generated: "TR-PORT-YYYYMMDD-XXXX"
    tr_type: "PORT_CONSIGNMENT"     # Differentiates from FG TRs in Transport Planning
    status: TRStatus                # Submitted → Available for Transport Planning (no approval step)

    source_pr: FK → ProductRequisition   # Parent Port Shipment (technical: PORT_CONSIGNMENT)

    # Shipment reference inherited from PR (read-only on TR form)
    bl_number: string               # Denormalised from PR for TR context
    lc_number: string
    vessel_name: string
    eta: date

    origin_poi: FK → POI            # Always a Port-type POI — gated server-side
    destination_poi: FK → POI       # Specific warehouse / feed mill / depot for this TR

    requested_by: FK → User         # Procurement Officer who created the TR
    required_date: date             # Pre-filled from PR; editable
    notes: text

    # Quantity (per TR — subset of PR total)
    total_quantity_mt: decimal

    # Not set by Procurement Officer — filled by Transport Planner at TRQ-01
    vehicle_type_required: string (blank)
    num_vehicles_required: int (default 0)

    approved_by: null               # No approval step in Procurement flow
    approved_at: null
    rejection_reason: blank
}
```

### 2.4 TRLineItem (quantity allocation per RM product per destination)

Each TR carries per-product quantity allocations to track against the PR line item totals.

```python
TRLineItem {
    transport_requisition: FK → TransportRequisition
    pr_line_item: FK → PRLineItem        # The parent PR line being allocated against
    product: FK → Product
    allocated_quantity: decimal          # How much of this RM goes to this TR's destination
    uom: string
}
```

---

## 3. Status Lifecycles

### 3.1 Port Shipment status (managed by `PRStatus` in `apps/requisitions/constants.py`)

```
Commercial Officer submits PR
        │
        ▼
    SUBMITTED ──────────────────────────────────────────► CANCELLED
        │
        │  (Procurement Officer creates first TR)
        ▼
    IN_PROGRESS  (= procurement_review in current constants)
        │
        │  (All PR quantity fully allocated across TRs)
        ▼
  FULLY_ALLOCATED
        │
        │  (All TRs fulfilled by Transport)
        ▼
    FULFILLED
```

> **Current model note**: `PRStatus` in `constants.py` uses `PROCUREMENT_REVIEW` / `PROCUREMENT_APPROVED`. At implementation time, statuses should be reconciled: the actual Procurement flow has no "approval" state — the transition is `SUBMITTED → IN_PROGRESS → FULLY_ALLOCATED → FULFILLED`. The status displayed in the Procurement queue should be:

| DB value | Display label |
|----------|---------------|
| `submitted` | Submitted |
| `procurement_review` | In Progress |
| `procurement_approved` (or new `fully_allocated`) | Fully Allocated |
| `fulfilled` | Fulfilled |
| `cancelled` | Cancelled |

### 3.2 Port Consignment TR status

```
Procurement Officer fills TR creation form
        │
        ▼
   (no Draft state)
        │
  [Submit TR]
        │
        ▼
    SUBMITTED ──► AVAILABLE_FOR_PLANNING   (immediate — no approval gate)
        │
        ▼
   UNDER_PLANNING  (Transport Planner claims TR at TRQ-01)
        │
        ▼
    ASSIGNED       (TO created against TR)
        │
        ▼
    FULFILLED
        │
   or
        │
        ▼
    CANCELLED      (Procurement Officer can cancel before UNDER_PLANNING)
```

---

## 4. Port Shipment Queue

**URL**: `GET /api/v1/product-requisitions?type=PORT_CONSIGNMENT&status=submitted,in_progress`

### 4.1 List columns

| Column | Field |
|--------|-------|
| PR Number | `pr_number` |
| LC Number | `lc_number` |
| BL Number | `bl_number` |
| Vessel Name | `vessel_name` |
| ETA | `eta` |
| Total Quantity | `total_quantity_mt` (MT) |
| Urgency | `priority` |
| Submitted By | `requested_by.full_name` |
| Status | `status` (badge) |
| Actions | View / Create TR |

### 4.2 Filters

| Filter | Type |
|--------|------|
| Vessel Name | Text search |
| LC Number | Text search |
| ETA | Date range |
| Urgency | Dropdown (low / medium / high / critical) |
| Status | Multi-select (Submitted / In Progress / Fully Allocated / Fulfilled / Cancelled) |

### 4.3 Default sort

ETA ascending (earliest arrival first).

---

## 5. PR Detail View

**URL**: `GET /api/v1/product-requisitions/{pr_id}`

### 5.1 Shipment Reference section (read-only)

| Field | Source |
|-------|--------|
| PR Number | `pr_number` |
| Bill of Lading (BL) | `bl_number` |
| LC Number | `lc_number` |
| Vessel Name | `vessel_name` |
| Voyage Name | `voyage_name` |
| Container Number(s) | `container_numbers` |
| C&F Agent | `cnf_agent_name` |
| Point of Loading (POL) | `point_of_loading` |
| ETA | `eta` |
| Arrival Notice | Download link (if uploaded) |
| Remarks | `notes` |

### 5.2 RM Product Line Items table

| Column | Notes |
|--------|-------|
| Item Code | `product.item_code` |
| Product Name | `product.name` |
| Category | `product.category` |
| Sub-Category | `product.sub_category` |
| Type of Packing | `product.packing_type` |
| UOM | `line_item.uom` |
| PR Quantity | `line_item.requested_quantity` |
| Allocated | Sum of `TRLineItem.allocated_quantity` across all TRs for this line |
| Remaining | `requested_quantity − allocated` |
| Urgency | `line_item` urgency (if per-line), else PR-level `priority` |

### 5.3 Destination Breakdown Plan (linked TRs)

List of TRs already created against this PR:

| Column | Notes |
|--------|-------|
| TR Number | `tr_number` |
| Destination POI | `destination_poi.name` |
| Allocated Qty (MT) | `tr.total_quantity_mt` |
| Status | `tr.status` (badge) |
| Created By | `tr.requested_by.full_name` |
| Actions | View TR detail |

**Summary row**: Total Allocated / Total PR Quantity / Remaining.

### 5.4 Capacity Snapshot (informational)

For each destination POI that has received a TR allocation, display:

```
POI Name            Available Capacity    Last Updated
Chittagong Depot    1,200 MT              2026-04-21 14:30
Gazipur Feed Mill   800 MT                2026-04-21 14:30
```

Data sourced from `GET /api/v1/pois/{poi_id}/capacity` — informational only, does not block TR creation.

### 5.5 Create TR button

- Label: **"Create Destination Breakdown / Transport Request"**
- **Enabled**: PR status is `Submitted` or `In Progress` AND remaining quantity > 0 on at least one line
- **Disabled** with tooltip: PR is `Fully Allocated`, `Fulfilled`, or `Cancelled`

---

## 6. TR Creation Form (Destination Breakdown)

**URL**: `POST /api/v1/transport-requests`

### 6.1 Form layout

```
┌─────────────────────────────────────────────────────────┐
│  Parent PR Reference (read-only)                        │
│  PR Number | LC | BL | Vessel | ETA | Arrival Notice    │
├─────────────────────────────────────────────────────────┤
│  Source POI *              [Port-type POIs only]         │
│  Destination POI *         [Active non-Port POIs]        │
│  Delivery Date *           [Pre-filled from PR ETA]      │
│  Remarks                   [optional]                    │
├─────────────────────────────────────────────────────────┤
│  Quantity Allocation per RM Product                      │
│  ┌──────────┬─────────┬───────────┬─────────┬─────────┐ │
│  │ Product  │ PR Qty  │ Allocated │ Remaining│ This TR│ │
│  ├──────────┼─────────┼───────────┼─────────┼─────────┤ │
│  │ Soy Meal │ 500 MT  │ 200 MT    │ 300 MT  │ [____] │ │
│  │ Palm Oil │ 120 MT  │  0 MT     │ 120 MT  │ [____] │ │
│  └──────────┴─────────┴───────────┴─────────┴─────────┘ │
│                                                          │
│  [Submit TR]        [Cancel]                             │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Field rules

| Field | Required | Notes |
|-------|----------|-------|
| Parent PR | Yes | Read-only; pre-filled from navigation |
| Source POI | Yes | Port-type only; filtered server-side |
| Destination POI | Yes | Non-Port active POIs only |
| Delivery Date | Yes | Default: PR ETA; editable |
| Quantity per line | Yes (at least one) | Cannot exceed remaining unallocated for that line |
| Remarks | No | Free text |

### 6.3 TR number auto-generation

Format: `TR-PORT-YYYYMMDD-XXXX` (e.g. `TR-PORT-20260422-0001`)

Generated server-side on creation via `generate_unique_code("TR-PORT")`.

### 6.4 Submit behaviour

On submit:
1. Server validates: each line `allocated_quantity ≤ remaining` (overflow → 400 error)
2. TR created with `status = SUBMITTED`
3. Status immediately transitions to `AVAILABLE_FOR_PLANNING` (no approval step)
4. TR appears in Transport Planner queue (TRQ-01)
5. PR `total_allocated` recalculated; if fully allocated → PR status → `FULLY_ALLOCATED`
6. Audit log entry written

---

## 7. TR List View (Procurement Officer)

**URL**: `GET /api/v1/transport-requests?type=PORT_CONSIGNMENT`

### 7.1 List columns

| Column | Field |
|--------|-------|
| TR Number | `tr_number` |
| PR Number | `source_pr.pr_number` |
| Source POI (Port) | `origin_poi.name` |
| Destination POI | `destination_poi.name` |
| Allocated Qty (MT) | `total_quantity_mt` |
| Delivery Date | `required_date` |
| Status | `status` (badge) |
| Created At | `created_at` |
| Actions | View / Cancel |

### 7.2 Filters

| Filter | Type |
|--------|------|
| PR Number | Text search |
| Status | Multi-select |
| Destination POI | Dropdown |
| Date range | Created At |

---

## 8. Quantity Overflow Validation

Business rule enforced server-side on TR creation and update:

```
For each line item in the TR:
    total_allocated = SUM(TRLineItem.allocated_quantity)
                      WHERE pr_line_item = this_line
                        AND transport_requisition.status NOT IN (cancelled)

    IF (total_allocated + this_tr_line.allocated_quantity) > pr_line_item.requested_quantity:
        → REJECT with 400: "Allocated quantity for {product.name} exceeds remaining PR quantity
          ({remaining} MT remaining)"
```

Remaining quantity is recalculated and returned in real time via:

```
GET /api/v1/product-requisitions/{pr_id}/transport-requests
Response: {
    "total_pr_quantity_mt": 620,
    "total_allocated_mt": 200,
    "remaining_mt": 420,
    "line_items": [
        { "product_id": "...", "pr_qty": 500, "allocated": 200, "remaining": 300 },
        { "product_id": "...", "pr_qty": 120, "allocated": 0,   "remaining": 120 }
    ],
    "transport_requests": [ ... ]
}
```

---

## 9. Multi-TR per PR (Multiple Destinations)

- After creating one TR, `remaining_mt > 0` means further TRs can be added
- "Add Another Destination" link on TR success screen + PR Detail "Create TR" button
- Each TR has a **different `destination_poi`** (same source port, same linked Port Shipment)
- No limit on number of TRs per PR as long as total allocated ≤ PR quantity
- Once all quantity allocated: PR status → `FULLY_ALLOCATED`; "Create TR" button disabled

---

## 10. Arrival Notice Document

```
POST /api/v1/product-requisitions/{pr_id}/documents     # Upload (Commercial Officer — at PR creation)
GET  /api/v1/product-requisitions/{pr_id}/documents     # List documents
GET  /api/v1/product-requisitions/{pr_id}/documents/{doc_id}/download  # Download
```

- Procurement Officer can **download** Arrival Notice — no upload capability in Procurement module
- Document upload is handled in the Requisition module (PR-02) by the Commercial Officer

---

## 11. API Endpoints

### Port Shipment endpoints (read by Procurement Officer)

```http
GET  /api/v1/product-requisitions
     ?type=PORT_CONSIGNMENT
     &status=submitted,in_progress
     &vessel_name=
     &lc_number=
     &eta_from=&eta_to=
     &priority=
     &page=&page_size=
     → 200 Paginated PR list

GET  /api/v1/product-requisitions/{pr_id}
     → 200 PR detail + line items + shipment reference

GET  /api/v1/product-requisitions/{pr_id}/transport-requests
     → 200 Linked TRs + remaining quantity summary

GET  /api/v1/product-requisitions/{pr_id}/documents
GET  /api/v1/product-requisitions/{pr_id}/documents/{doc_id}/download
     → 200 / 302 Arrival Notice download
```

### Transport Request endpoints (created by Procurement Officer)

```http
POST /api/v1/transport-requests
     Body: {
         "pr_id": "uuid",
         "type": "PORT_CONSIGNMENT",
         "origin_poi_id": "uuid",        // Port-type POI only
         "destination_poi_id": "uuid",   // Non-Port POI
         "required_date": "2026-05-10",
         "line_items": [
             { "pr_line_item_id": "uuid", "product_id": "uuid", "allocated_quantity": 200.0, "uom": "mt" }
         ],
         "notes": "optional"
     }
     → 201 Created { tr_number, status: "available_for_planning", ... }
     → 400 { "detail": "Allocated quantity for Soy Meal exceeds remaining PR quantity (300 MT remaining)" }

GET  /api/v1/transport-requests
     ?type=PORT_CONSIGNMENT&pr_id=&status=&destination_poi_id=&page=
     → 200 Paginated TR list

GET  /api/v1/transport-requests/{tr_id}
     → 200 TR detail (includes read-only shipment reference fields from PR)

POST /api/v1/transport-requests/{tr_id}/cancel
     → 200 { status: "cancelled" }
     → 400 if TR is UNDER_PLANNING or later

GET  /api/v1/pois?type=PORT           // Source POI picker — Port-type filter
GET  /api/v1/pois?type=non_port       // Destination POI picker
GET  /api/v1/pois/{poi_id}/capacity   // Capacity snapshot (informational)
```

---

## 12. Business Rules

| # | Rule | Enforcement |
|---|------|-------------|
| BR-1 | Source POI must be a Port-type POI | Server-side validation on TR creation |
| BR-2 | Destination POI must be a non-Port active POI | Server-side validation on TR creation |
| BR-3 | `SUM(allocated_quantity)` across all non-cancelled TRs for a PR line must not exceed `PR line.requested_quantity` | Service-layer check on TR create/update |
| BR-4 | No Draft state for Procurement TRs — submitted directly | TR created with `SUBMITTED` → immediately `AVAILABLE_FOR_PLANNING` |
| BR-5 | No manager approval step | No approval routing; no `approved_by` / `approved_at` populated in Procurement flow |
| BR-6 | Procurement Officer cannot modify or cancel a PR | PR is read-only for Procurement Officer |
| BR-7 | TR can only be cancelled before status reaches `UNDER_PLANNING` | Cancel endpoint returns 400 if TR is UNDER_PLANNING or later |
| BR-8 | TR number format: `TR-PORT-YYYYMMDD-XXXX` | Auto-generated server-side on creation |
| BR-9 | PR transitions to `FULLY_ALLOCATED` once all line items are fully allocated | Checked after each TR creation |

---

## 13. Audit Trail

Every significant action is written to the audit log.

| Event | Actor | Logged fields |
|-------|-------|---------------|
| PR viewed | Procurement Officer | `pr_id`, `pr_number`, `user_id`, `timestamp` |
| Arrival Notice downloaded | Procurement Officer | `pr_id`, `document_id`, `user_id`, `timestamp` |
| TR created | Procurement Officer | `tr_id`, `tr_number`, `pr_id`, `origin_poi`, `destination_poi`, `line_items[]`, `status`, `timestamp` |
| TR cancelled | Procurement Officer | `tr_id`, `tr_number`, `pr_id`, `reason`, `timestamp` |
| PR status changed | System | `pr_id`, `from_status`, `to_status`, `triggered_by`, `timestamp` |

---

## 14. Django Admin (SSR)

### 14.1 Port Shipments admin (`PortShipmentAdmin`)

Port Shipments are exposed via a `PortShipmentProxy` proxy model registered separately, keeping them distinct from FG PR in the admin sidebar. The admin class `PortShipmentAdmin` inherits from `_PRBaseAdmin`.

Key behaviours:
- `container_numbers` uses a custom `ContainerNumbersWidget` / `ContainerNumbersField` — a dynamic add/remove row list instead of a raw JSON textarea
- `RMCargoLineItemInline` and `PortShipmentDocumentInline` are read-only for the Procurement Officer; editable for the Commercial Officer
- `PortShipmentAdmin` is **not** shown in the Procurement sidebar — Procurement sees Port Shipments via the shared top-level menu (same URL, filtered by `pr_type=PORT_CONSIGNMENT`)
- The `verbose_name` / `verbose_name_plural` for Port Shipment-type records is handled by the `PortShipmentProxy` model

### 14.2 `TransportRequisitionAdmin` (Procurement Officer view)

Procurement Officer sees their own Port Consignment TRs in the "Procurement → Transport requests" section. The same `TransportRequisitionAdmin` class handles both FG and Port Consignment TRs, differentiated by `tr_type` filter and role-gated fieldsets.

No standalone "Procurement TR" admin class was created — role-based `get_fieldsets`, `get_queryset`, and `get_list_display` on `TransportRequisitionAdmin` handle the Procurement Officer's view.

### 14.3 Naming Conventions

`verbose_name` and `verbose_name_plural` on `TransportRequisition` omit the `(TR)` and `(TRs)` suffixes:
- `verbose_name = "Transport Request"` (was `"Transport Request (TR)"`)
- `verbose_name_plural = "Transport Requests"` (was `"Transport Requests (TRs)"`)

Field `verbose_name` values set for acronyms: `"TR number"`, `"TR type"`, `"source POI"`, `"destination POI"`.

---

## 15. Permissions

| Permission code | Description | Assigned to |
|-----------------|-------------|-------------|
| `Procurement.PR.Read` | View org-wide Port Shipment list (top-level menu) and detail | Procurement Officer |
| `Procurement.Document.Download` | Download Arrival Notice attachment | Procurement Officer |
| `Procurement.TR.Create` | Create TR (destination breakdown) against a Port Shipment | Procurement Officer |
| `Procurement.TR.Read` | View own TR list and TR detail | Procurement Officer |
| `Procurement.TR.Cancel` | Cancel own TR (before UNDER_PLANNING) | Procurement Officer |

---

## 16. Testing Strategy

| Layer | Coverage target | Key scenarios |
|-------|----------------|---------------|
| Unit — model | 80% | PR status transitions; quantity denormalisation |
| Unit — service | 80% | Overflow validation (exact boundary); partial allocation; multi-TR |
| API — happy path | PR list with filters; PR detail with shipment reference; TR creation (Port source gated); immediate Available for Planning status | |
| API — error path | TR quantity overflow → 400; non-Port source → 400; cancel after UNDER_PLANNING → 400 | |
| Business rules | BR-1 through BR-9 (see §12) | |
| UAT | Procurement Officer creates 2 TRs from one Port Shipment (two destinations); both immediately in Transport Planning queue | |

---

## 17. Dependencies & Cross-References

| Dependency | Description |
|------------|-------------|
| `04-requisitions/product-requisition-management.md` | PR-02 — Port Shipment registration by Commercial Officer; this spec consumes those records |
| `02-master-data` — MDM-04 (POI Master) | Port-type POI filter for source POI dropdown |
| `02-master-data` — MDM-01 (Product Master) | RM product catalog for line items |
| `05-transport` — TRQ-01 | Transport Planning queue — Port Consignment TRs appear alongside FG TRs after submission |
| `01-foundation/rbac.md` | Procurement Officer role and permission gating |
| `01-foundation/permission-catalog-phase1.md` | `Procurement.*` permission codes |

---

## 18. Related documentation (Sprint 3 backlog)

- **[Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md)** — Full menu, role access, end-to-end flow
- **[PC-01 — Port Shipments org-wide list & detail](../../04-backlog/sprints/sprint-3/04-procurement/PC-01-rm-product-requisitions.md)** (lives under `04-procurement/` in sprint-3; story PC-01)
- **[PC-02 — Procurement transport request creation](../../04-backlog/sprints/sprint-3/04-procurement/PC-02-transport-requests.md)**
