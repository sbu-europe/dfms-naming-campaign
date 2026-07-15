---
module: 04-requisitions
specification: Product Requisition Management
version: 1.1
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
sprint: Sprint 3
last_updated: 2026-05-07
related_stories: DFS-032 (PR-01), DFS-033 (PR-02)
jira_epic: DFS-040
---

# Product Requisition Management Specification

## Overview

The **Requisition** specification covers **Finished Goods (FG) Product Requisitions** only. **Port Shipments** (import registration) are a **separate top-level application menu** — not a sub-menu under Requisition; see the same file’s Port Shipment sections and `procurement-management.md` for the handoff to Procurement. Technically, Port Shipment may still persist as `PORT_CONSIGNMENT` on a shared model until a dedicated resource exists.

A submitted **FG PR** triggers Distribution TR creation. A submitted **Port Shipment** triggers Procurement TR creation (destination breakdown), then Transport Planning creates **Transport Orders**.

**Module path**: `apps/requisitions/`  
**Dependencies**: MDM-01 (Product Master), MDM-04 (POI Master), `01-foundation` (RBAC)  
**Enables**: Distribution TR creation, Procurement TR creation, Transport Planning

---

## 0. Menu Structure & Navigation

**Requisition** exposes **one sub-menu: Finished Goods**. **Port Shipments** is a **sibling top-level item** in the app shell (not nested under Requisition). Each role only sees the module they need.

```
Sidebar
├── Requisition
│     └── Finished Goods                    [Depot Officer / Feed Mill Officer only]
│           ├── PR List                     — own PRs; filter by status / date / search
│           ├── Create FG PR                — header + multi-line product table + capacity widget
│           └── PR Detail                   — read-only after submit; actions: Edit (Draft) / Submit / Cancel
│
└── Port Shipments   (separate top-level — NOT under Requisition)
      ├── Shipment List                     [Commercial Officer only]
      ├── Register Port Shipment            — LC/shipment + RM cargo lines + Arrival Notice
      └── Shipment Detail                 — Edit (Draft) / Submit / Cancel / Upload Document
```

### Role → menu mapping

| Role | Requisition (FG) | Port Shipments (top-level) |
|------|-------------------|----------------------------|
| Depot / Feed Mill Officer | ✓ | ✗ |
| Commercial Officer | ✗ | ✓ |

### Screen hierarchy

```
Finished Goods sub-menu
  PR List (GET /product-requisitions?type=FG)
    └── [+ Create] ──► Create FG PR
                          └── [Submit] ──► PR Detail (Submitted)
    └── [row click] ──► PR Detail
                          ├── [Edit]   ──► Edit FG PR    (Draft only)
                          ├── [Submit] ──► PR Detail (Submitted)
                          └── [Cancel] ──► PR Detail (Cancelled)

Port Shipments (top-level module — not under Requisition)
  List (GET /product-requisitions?type=PORT)
    └── [+ Create] ──► Register Port Shipment
                          ├── [Save Draft] ──► Shipment Detail (Draft)
                          └── [Submit]     ──► Shipment Detail (Submitted)
    └── [row click] ──► Shipment Detail
                          ├── [Edit]            ──► Edit (Draft only)
                          ├── [Upload Document] ──► (attach Arrival Notice; available in Draft + Submitted)
                          ├── [Submit]          ──► Shipment Detail (Submitted)
                          └── [Cancel]          ──► Shipment Detail (Cancelled)
```

---

## 1. PR Types & Routing

### 1.1 PR Type Overview

| Attribute | FG PR (PR-01) | Port Shipment (PR-02) |
|-----------|--------------|------------------------|
| Domain | Internal demand requisition | Import shipment registration (data from external systems) |
| Creator role | Depot / Feed Mill Officer | Commercial Officer |
| Product type gate | Finished Goods only | Raw Materials (cargo lines) only |
| Source POI on record | Not captured — set by Distribution at TR creation | Not captured — Port chosen per TR by Procurement |
| Destination POI on record | Pre-filled from requester's assigned POI (editable) | Not captured — allocation per TR by Procurement |
| Routes to | Distribution department | Procurement department |
| TR approval required | Yes — Distribution Manager | No — TRs immediately Available for Transport Planning |
| Reference number | `PR-FG-YYYYMMDD-XXXX` | `PS-PORT-YYYYMMDD-XXXX` (domain); may map to existing `pr_number` field |
| Extra mandatory fields | None beyond header | LC + shipment documentation + Arrival Notice attachment |

### 1.2 End-to-End Flow

```
FG PR (Depot/Feed Mill Officer)
  └─ Draft → Submitted → (In Progress when TR created) → Fulfilled / Cancelled
             ↓
        Distribution Officer views FG PR queue
        Creates TR(s) vs PR (Source POI per TR; Dest from PR)
        Distribution Manager approves/rejects TR
        TR → Available for Transport Planning

Port Shipment (Commercial Officer)
  └─ Draft → Submitted → (In Progress when TR created) → Fulfilled / Cancelled
             ↓
        Procurement Officer opens **top-level Port Shipments** (org-wide submitted list)
        Reviews LC + shipment details
        Creates TR(s) vs shipment (Source: Port POI; Dest per TR — destination allocation)
        No approval step → TR immediately Available for Transport Planning → TO creation by Transport Planner
```

---

## 2. Data Model

### 2.1 ProductRequisition (Header)

```typescript
ProductRequisition {
  pr_id: UUID                          // Primary Key
  pr_number: string                    // FG: PR-FG-YYYYMMDD-XXXX; Port Shipment: PS-PORT-YYYYMMDD-XXXX (or legacy PR-PORT until migrated)
  pr_type: enum ['FINISHED_GOODS', 'PORT_CONSIGNMENT']

  // Requester (auto-filled from logged-in user)
  requester_id: UUID                   // FK → User
  requester_name: string               // Denormalised snapshot
  requester_department: string         // Denormalised snapshot

  // FG PR: destination POI (pre-filled from user's assigned POI, editable)
  // Port Shipment: null — allocation defined at TR level by Procurement
  destination_poi_id: UUID (nullable)  // FK → POI

  // Scheduling
  preferred_delivery_datetime: DateTime  // Required

  // Priority
  urgency: enum ['Normal', 'High', 'Critical']  // Default: Normal

  // Notes
  special_instructions: string (nullable)  // FG PR label
  remarks: string (nullable)               // Port Shipment / FG notes (same field)

  // Port Shipment only — LC & Shipment Documentation
  bill_of_lading_number: string (nullable)
  lc_number: string (nullable)
  vessel_name: string (nullable)
  voyage_name: string (nullable)
  container_numbers: string[] (nullable)  // Array / JSON — multiple entries supported
  cnf_agent_name: string (nullable)
  point_of_loading: string (nullable)
  estimated_time_of_arrival: DateTime (nullable)

  // Status
  status: enum ['Draft', 'Submitted', 'In Progress', 'Fulfilled', 'Cancelled']

  // Cancellation
  cancellation_reason: string (nullable)
  cancelled_at: DateTime (nullable)
  cancelled_by: UUID (nullable)

  // Metadata
  tenant_id: UUID
  created_by: UUID
  created_at: DateTime
  updated_by: UUID (nullable)
  updated_at: DateTime
}
```

### 2.2 ProductRequisitionLineItem

```typescript
ProductRequisitionLineItem {
  line_item_id: UUID
  pr_id: UUID                         // FK → ProductRequisition

  // Product (resolved via Product Item Code lookup from MDM-01)
  product_id: UUID                    // FK → Product
  product_item_code: string           // Entry key; triggers auto-fill
  product_name: string                // Auto-filled from MDM-01 (snapshot)
  product_category: string            // Auto-filled — 'Finished Goods' (FG) or 'Raw Material' (RM)
  product_sub_category: string (nullable)  // Auto-filled from MDM-01 (snapshot)
  type_of_packing: string (nullable)  // Auto-filled from MDM-01 standard_pack_size

  // Quantity
  unit_of_measure: enum ['Bags', 'Tons', 'KG', 'Liters', 'Cartons', 'Pieces']
  product_quantity: Decimal            // Number of units in selected UOM
  weight_per_unit: Decimal             // Per unit in selected UOM (kg)

  // Calculated
  total_weight_kg: Decimal             // product_quantity × weight_per_unit (auto-calculated)

  // Port Shipment only
  // Informational target location at line-item level (before Procurement defines allocation at TR)
  target_poi_id: UUID (nullable)       // FK → POI

  // Line order — auto-assigned sequentially on save; guaranteed unique per requisition
  line_number: Integer   // auto-incremented: max(existing line_numbers) + 1 on INSERT
}
```

### 2.3 PRDocument (Port Shipment — Arrival Notice)

```typescript
PRDocument {
  document_id: UUID
  pr_id: UUID                         // FK → ProductRequisition
  document_type: enum ['ArrivalNotice', 'Other']
  file_name: string
  file_url: string                    // Secure storage URL (S3 / equivalent)
  uploaded_by: UUID
  uploaded_at: DateTime
}
```

### 2.4 PRCalculations

```
Grand Total Weight = SUM(line_item.total_weight_kg) for all line items on a PR
Total Weight per line item = product_quantity × weight_per_unit
```

These values are computed by the service layer on save and stored as denormalised fields for efficient display.

---

## 3. PR Number Auto-Generation

### 3.1 Format

| Record type | Format | Example |
|---------|--------|---------|
| Finished Goods PR | `PR-FG-YYYYMMDD-XXXX` | `PR-FG-20260422-0001` |
| Port Shipment | `PS-PORT-YYYYMMDD-XXXX` | `PS-PORT-20260422-0001` |

### 3.2 Generation Logic

```python
def generate_pr_number(pr_type: str, tenant_id: UUID) -> str:
    prefix = 'PR-FG' if pr_type == 'FINISHED_GOODS' else 'PS-PORT'
    date_str = datetime.today().strftime('%Y%m%d')
    
    # Sequence resets per type per tenant per day
    sequence = (
        ProductRequisition.objects
        .filter(tenant_id=tenant_id, pr_type=pr_type,
                created_at__date=date.today())
        .count() + 1
    )
    
    return f"{prefix}-{date_str}-{sequence:04d}"
```

The number is generated atomically at the point of Draft save to prevent duplicates.

---

## 4. PR Status Lifecycle

### 4.1 Status Transitions

```
Draft ──────────────► Submitted ──► In Progress ──► Fulfilled
  │                       │
  └── Cancelled            └── Cancelled (before any TR created)
```

| Status | Description | Editable by Requester |
|--------|-------------|----------------------|
| `Draft` | Saved but not submitted | Yes — all fields |
| `Submitted` | Submitted; visible to Distribution/Procurement | No |
| `In Progress` | At least one TR created against this PR | No |
| `Fulfilled` | All PR quantity covered by fulfilled TRs | No |
| `Cancelled` | Cancelled by requester (or admin override) | No |

### 4.2 Transition Rules

```typescript
Status Rules:
  Draft → Submitted:
    - All required header fields must be valid
    - Port Shipment: all LC + shipment fields mandatory; Arrival Notice must be attached
    - At least one line item required

  Submitted → In Progress:
    - Triggered automatically when the first TR is created against this PR (by Distribution/Procurement)

  In Progress → Fulfilled:
    - Triggered automatically when total TR quantity equals PR total quantity and all TRs are fulfilled

  Submitted | Draft → Cancelled:
    - Requester can cancel if no TRs exist against the PR
    - PRs with active TRs cannot be cancelled without admin override
    - Cancellation reason is required

  In Progress → Cancelled (admin override only):
    - Admin provides override reason
    - All active TRs against the PR must be reviewed
```

---

## 5. Role Gates & Access Control

### 5.1 PR Type Restrictions

| Role | Can Create | Menu visible | Menu hidden |
|------|------------|--------------|-------------|
| Depot / Feed Mill Officer | FG PR only | **Requisition → Finished Goods** | **Port Shipments** (top-level) |
| Commercial Officer | Port Shipment only | **Port Shipments** (top-level) | **Requisition** (entire FG module) |

The `pr_type` is auto-selected and read-only based on the user's role. Attempting to create the wrong type via API returns `403 Forbidden`.

### 5.2 Action Permissions

| Action | Depot / Feed Mill Officer | Commercial Officer |
|--------|--------------------------|-------------------|
| Create FG PR | ✓ | ✗ |
| Register Port Shipment | ✗ | ✓ |
| Edit own Draft PR | ✓ | ✓ |
| View own PR list | ✓ | ✓ |
| Cancel own PR (before TR) | ✓ | ✓ |
| View PR detail | ✓ (own) | ✓ (own) |

### 5.3 Downstream Access

| Role | Access |
|------|--------|
| Distribution Officer | View all submitted FG PRs queue |
| Distribution Manager | View all FG TRs pending approval |
| Procurement Officer | **Port Shipments** (top-level) — all submitted (read/plan) |

---

## 6. FG PR — Specific Behaviour (PR-01)

### 6.1 Header Fields

| Field | Type | Notes |
|-------|------|-------|
| Requisition Type | Auto: `FINISHED_GOODS` | Read-only; set from role |
| Requester Name | Auto-filled | From `request.user` |
| Requester Department | Auto-filled | From user profile |
| Destination POI | Dropdown (active POIs) | Pre-filled from user's assigned POI; editable |
| Preferred Delivery Date & Time | DateTime | Required |
| Urgency | Enum | Normal / High / Critical |
| Special Instructions | Text | Optional |

### 6.2 Destination POI Pre-fill

```python
def get_default_destination_poi(user) -> POI | None:
    """
    Returns the POI assigned to the logged-in user's profile.
    The officer can override this with any active POI from the dropdown.
    """
    return getattr(user.profile, 'assigned_poi', None)
```

Only `is_active=True` POIs appear in the destination dropdown.

### 6.3 Inventory Capacity Snapshot (Informational Widget)

Displayed on the PR creation form for the selected Destination POI. Read-only and informational — does not block submission.

```typescript
CapacitySnapshot {
  poi_name: string
  total_capacity_mt: Decimal
  current_stock_mt: Decimal
  free_capacity_mt: Decimal        // total_capacity - current_stock
  projected_inbound_mt: Decimal    // PR grand total weight (live update as line items change)
  will_exceed_capacity: boolean    // Warning shown in yellow if true
}
```

**Note**: Capacity data depends on POI capacity tracking being available from POI Management (MDM-04). If unavailable, widget shows a graceful "capacity data unavailable" state rather than blocking.

---

## 7. Port Shipment (Import) Registration — Specific Behaviour (PR-02)

### 7.1 Header Fields

| Field | Type | Notes |
|-------|------|-------|
| Record / technical type | Auto: `PORT_CONSIGNMENT` | Read-only; Commercial Officer role; user-facing label **Port Shipment** |
| Requester Name | Auto-filled | From `request.user` |
| Requester Department | Auto-filled | From user profile |
| Preferred Delivery Date & Time | DateTime | Required |
| Urgency | Enum | Normal / High / Critical |
| Remarks | Text | Optional |

Source Port and destination POIs are **not** captured on the shipment record (set on TRs by Procurement).

### 7.2 LC & Shipment Documentation (Mandatory before Submit)

All fields below are required at submission time. They can be left blank during Draft.

| Field | Type | Notes |
|-------|------|-------|
| Bill of Lading (BL) Number | String | Required on submit |
| LC Number | String | Required on submit |
| Vessel Name | String | Required on submit |
| Voyage Name | String | Required on submit |
| Container Number(s) | String[] | Required on submit; multiple entries supported |
| C&F Agent Name | String | Required on submit |
| Point of Loading (POL) | String | Required on submit |
| Estimated Time of Arrival (ETA) | DateTime | Required on submit |

### 7.3 Arrival Notice Document (Mandatory before Submit)

```typescript
Upload Rules:
  - File type: PDF, JPEG, PNG accepted
  - Max file size: 10 MB
  - Mandatory: yes — PR cannot be submitted without at least one Arrival Notice
  - Storage: Secure file storage (S3 or equivalent), linked via PRDocument record
  - Downloadable: yes, by the uploader and Procurement Officers
```

### 7.4 RM Product Gate

Port Shipment line items only accept products with `product_type = 'RawMaterial'`. Entering a Finished Goods item code returns a validation error: `"Only Raw Material products are allowed on a Port Shipment"`.

### 7.5 Line Item POI Field

Each RM line item may capture an optional `target_poi_id` — intended destination. This is **informational only** on the shipment record; Procurement defines authoritative allocation when creating TRs.

---

## 8. Product Item Code Lookup

### 8.1 Lookup Behaviour

When the user enters a **Product Item Code** in a line item row:

```typescript
OnItemCodeEntry(item_code: string) {
  const product = await GET /api/v1/products?item_code={item_code}&is_active=true

  if (found) {
    AutoFill({
      product_name: product.product_name,
      product_category: product.product_type === 'FinishedGoods' ? 'Finished Goods' : 'Raw Material',
      product_sub_category: product.sub_category?.sub_category_name ?? null,
      type_of_packing: product.standard_pack_size ?? null,
    })
  } else {
    ShowError('Product Item Code not found or inactive')
    ClearLineItemFields()
  }
}
```

### 8.2 Product Gate per PR Type

| PR Type | Allowed Product Types | Error if Wrong |
|---------|----------------------|----------------|
| FG PR | `FinishedGoods` only | "Only Finished Goods products can be added to an FG Requisition" |
| Port Shipment | `RawMaterial` only | "Only Raw Material products are allowed on a Port Shipment" |

### 8.3 Manual Entry Fields (after auto-fill)

After product auto-fill, the user manually enters:

| Field | Notes |
|-------|-------|
| Unit of Measure (UOM) | From product master (Bags / Tons / KG / Liters / Cartons / Pieces); readonly on PR line |
| Product Quantity | Number of units in selected UOM |
| Weight per Unit | Weight in kg per unit of selected UOM |

System auto-calculates: `Total Weight (kg) = Product Quantity × Weight per Unit`

---

## 9. Quantity Overflow Protection

### 9.1 PR → TR Overflow Rule

When Distribution/Procurement create TRs against a PR:

```typescript
Validation:
  sum_of_all_tr_quantities_for_pr + new_tr_quantity <= pr_total_weight
  
  IF overflow:
    BLOCK TR creation
    RETURN 409 Conflict:
      {
        "error": "TR quantity exceeds remaining PR balance",
        "pr_total_weight_kg": <value>,
        "allocated_weight_kg": <value>,
        "remaining_weight_kg": <value>,
        "requested_weight_kg": <value>
      }
```

### 9.2 TR → TO Overflow Rule

When Transport Planner creates TOs against a TR (enforced in the Transport module):

```typescript
sum_of_all_to_quantities_for_tr + new_to_quantity <= tr_total_quantity
```

---

## 10. Audit Trail

All PR lifecycle events are logged.

```typescript
PRActivityLog {
  log_id: UUID
  pr_id: UUID
  action: enum [
    'Created', 'Saved_Draft', 'Submitted', 'Line_Item_Added',
    'Line_Item_Removed', 'Document_Uploaded', 'Cancelled',
    'Status_Changed'
  ]
  changed_by: UUID
  timestamp: DateTime
  previous_status: string (nullable)
  new_status: string (nullable)
  details: JSON (nullable)  // e.g. cancellation reason, field changes
}
```

Audit logs are immutable — append-only. They are queryable via `GET /api/v1/product-requisitions/{pr_id}/audit-trail`.

---

## 11. API Endpoints

All endpoints require authentication. Tenant context is resolved from the authenticated user.

### 11.1 Product Requisitions

| Method | Endpoint | Description | Auth / Role |
|--------|----------|-------------|-------------|
| `POST` | `/api/v1/product-requisitions` | Create PR (Draft or Submit) | Depot/Feed Mill Officer, Commercial Officer |
| `GET` | `/api/v1/product-requisitions` | List PRs | Role-filtered (own PRs for creators; queue view for Distribution/Procurement) |
| `GET` | `/api/v1/product-requisitions/{pr_id}` | Get PR detail | Owner + downstream roles |
| `PATCH` | `/api/v1/product-requisitions/{pr_id}` | Edit Draft PR | Owner only (Draft status required) |
| `POST` | `/api/v1/product-requisitions/{pr_id}/submit` | Submit Draft → Submitted | Owner only |
| `POST` | `/api/v1/product-requisitions/{pr_id}/cancel` | Cancel PR with reason | Owner only (before TR created) |
| `GET` | `/api/v1/product-requisitions/{pr_id}/audit-trail` | PR activity log | Owner + admin |

### 11.2 PR Documents (Port Shipment)

| Method | Endpoint | Description | Auth / Role |
|--------|----------|-------------|-------------|
| `POST` | `/api/v1/product-requisitions/{pr_id}/documents` | Upload Arrival Notice | Owner (Commercial Officer) |
| `GET` | `/api/v1/product-requisitions/{pr_id}/documents` | List documents | Owner + Procurement Officer |
| `GET` | `/api/v1/product-requisitions/{pr_id}/documents/{doc_id}` | Download / view document | Owner + Procurement Officer |

### 11.3 Query Parameters for List Endpoint

```
GET /api/v1/product-requisitions
  ?type=FG|PORT          # Filter by PR type
  &status=               # Draft | Submitted | In Progress | Fulfilled | Cancelled
  &date_from=            # ISO date
  &date_to=              # ISO date
  &search=               # PR number, product name, LC number
  &page=                 # Pagination
  &per_page=             # Default 20
```

### 11.4 Request / Response Shapes

**Create FG PR (POST `/api/v1/product-requisitions`)**
```json
{
  "pr_type": "FINISHED_GOODS",
  "destination_poi_id": "uuid",
  "preferred_delivery_datetime": "2026-05-01T09:00:00Z",
  "urgency": "Normal",
  "special_instructions": "Handle with care",
  "line_items": [
    {
      "product_item_code": "FG-001",
      "unit_of_measure": "Bags",
      "product_quantity": 500,
      "weight_per_unit": 50
    }
  ],
  "save_as_draft": false
}
```

**Register Port Shipment (POST `/api/v1/product-requisitions`, `type=PORT_CONSIGNMENT`)**
```json
{
  "pr_type": "PORT_CONSIGNMENT",
  "preferred_delivery_datetime": "2026-05-10T00:00:00Z",
  "urgency": "High",
  "remarks": "Urgent shipment",
  "bill_of_lading_number": "BL-2026-001",
  "lc_number": "LC-2026-XYZ",
  "vessel_name": "MV Fortune Star",
  "voyage_name": "V-002",
  "container_numbers": ["CONT-001", "CONT-002"],
  "cnf_agent_name": "ABC Shipping Co.",
  "point_of_loading": "Singapore",
  "estimated_time_of_arrival": "2026-05-08T06:00:00Z",
  "line_items": [
    {
      "product_item_code": "RM-SOYA-001",
      "unit_of_measure": "Tons",
      "product_quantity": 200,
      "weight_per_unit": 1000,
      "target_poi_id": "uuid"
    }
  ],
  "save_as_draft": false
}
```

**Cancel PR (POST `/api/v1/product-requisitions/{pr_id}/cancel`)**
```json
{
  "cancellation_reason": "Demand fulfilled by alternate source"
}
```

---

## 12. Business Rules

### 12.1 PR Type Gate

```
Depot/Feed Mill Officer:
  - pr_type is always FINISHED_GOODS
  - Can only add FinishedGoods products to line items
  - Port Shipment form/endpoint returns 403

Commercial Officer:
  - pr_type is always PORT_CONSIGNMENT
  - Can only add RawMaterial products to line items
  - FG PR form/endpoint returns 403
```

### 12.2 Draft vs Submit Validation

```
On Draft Save:
  - Required: pr_type, preferred_delivery_datetime, urgency
  - FG: destination_poi_id required (pre-filled default applied if not overridden)
  - At least 0 line items allowed in draft (can save empty draft)
  - No LC/shipment validation enforced

On Submit:
  - All Draft Save rules apply
  - At least 1 line item required
  - Each line item: product_item_code, unit_of_measure, product_quantity, weight_per_unit all required
  - Port Shipment additionally:
    - All 8 LC/shipment fields required
    - At least 1 Arrival Notice document uploaded
```

### 12.3 PR Immutability After Submission

```
Once status = Submitted:
  - Requester cannot edit most fields
  - EXCEPTION: Urgency field remains editable by the requester (Depot/Feed Mill Officer)
    even after submission — operational priority can change after the PR is raised
  - Requester can only Cancel (if no TRs exist)
  - Distribution/Procurement can read but not edit the PR
  - Only status transitions are permitted (system-driven: Submitted → In Progress → Fulfilled)
```

### 12.4 Line Item Total Weight

```
total_weight_kg per line item = product_quantity × weight_per_unit
Grand total weight = SUM(all line items total_weight_kg)

Both values stored in DB (denormalised) and recalculated on every line item change.
```

### 12.5 Unique PR Number

```
PR numbers are unique per tenant.
Sequence counter resets per PR type per tenant per day.
Generated atomically using DB-level sequence or select_for_update to prevent race conditions.
```

---

## 13. Django Admin SSR Implementation

### 13.1 Admin Class Hierarchy

The admin implementation uses a shared base class `_PRBaseAdmin` with two concrete classes registered against proxy models:

```
ProductRequisition (model)
  ├── ProductRequisitionAdmin     — registered for FG PRs (pr_type=FINISHED_GOODS)
  └── PortShipmentAdmin           — registered for PortShipmentProxy (pr_type=PORT_CONSIGNMENT)
```

Both share the `_PRBaseAdmin` logic for inline management and readonly-field role detection.

### 13.2 Role-Based Readonly Fields

Fields transition to read-only after submission for the requester, with **one exception**:

```python
def get_readonly_fields(self, request, obj=None):
    # After submission, all fields locked EXCEPT urgency for the requester
    if obj and obj.status != PRStatus.DRAFT:
        if _is_requester_role(request):
            # urgency remains editable — operational priority can change post-submission
            return [f for f in all_fields if f != 'urgency']
        return all_fields  # downstream roles (Distribution, Procurement) are fully read-only
```

### 13.3 Inline Line Items

`PRLineItemInline` and `PRDocumentInline` are attached to both admin classes. For the **Procurement Officer** role, both inlines are enforced strictly read-only:

```python
_is_readonly_role = ("procurement_officer",)

def get_formset(self, request, obj=None, **kwargs):
    role = get_primary_role_code(request.user)
    if role in self._is_readonly_role:
        kwargs["form"] = forms.ModelForm  # prevents custom form overriding prefix
    return super().get_formset(request, obj, **kwargs)
```

The CSS rule `[id^="line_items-"] td > p` was scoped to `td.original > p` to prevent inline row content from being hidden for read-only viewers.

### 13.4 PR Type-Conditional Fieldsets

Admin uses `get_fieldsets` to conditionally show/hide Port Shipment LC fields based on `pr_type`:
- FG PR: shows **Requisition Details**, **Product Line Items**
- Port Shipment: additionally shows **LC & Shipment Documentation**, **Documents**

### 13.5 `line_number` Auto-Assignment

`PRLineItem.save()` auto-assigns `line_number` using `_state.adding` guard to prevent `IntegrityError` on Port Shipment inline saves:

```python
def save(self, *args, **kwargs):
    if self._state.adding and not self.line_number:
        max_line = PRLineItem.objects.filter(requisition=self.requisition)\
                       .aggregate(m=Max('line_number'))['m'] or 0
        self.line_number = max_line + 1
    super().save(*args, **kwargs)
```

### 13.6 Naming Conventions

`verbose_name` and `verbose_name_plural` on the `ProductRequisition` model omit the `(FG)` suffix:
- `verbose_name = "Product Requisition"` (was `"Product Requisition (FG)"`)
- `verbose_name_plural = "Product Requisitions"` (was `"Product Requisitions (FG)"`)

Field `verbose_name` values set explicitly for acronym correctness: `"PR number"`, `"PR type"`, `"target POI"`, `"destination POI"`.

---

## 14. Unit Testing Strategy

### 14.1 Coverage Targets

- **Models / Business Logic**: 90%+
- **API / Views**: 85%+
- **Serializers / Validators**: 90%+

### 14.2 Core Test Cases

**Model & Validation Tests**
- FG PR creation with valid FinishedGoods line items succeeds
- FG PR creation with RawMaterial line item fails validation
- Port Shipment registration with valid RM line items succeeds
- Port Shipment registration with FG line item fails validation
- PR number uniqueness per tenant per type per day
- PR number sequence increments correctly (no gaps within a day)
- Total weight auto-calculation: `product_quantity × weight_per_unit`
- Grand total weight across multiple line items

**Status Lifecycle Tests**
- Draft save allows partial data (no line items)
- Submit from Draft fails without mandatory fields
- Port PR submit fails if Arrival Notice not uploaded
- Port PR submit fails if any LC field is missing
- Status cannot go backward (e.g., Submitted → Draft)
- Cancel from Draft succeeds
- Cancel from Submitted succeeds when no TRs exist
- Cancel from In Progress blocked without admin override

**Role Gate Tests**
- Depot/Feed Mill Officer cannot create PORT_CONSIGNMENT PR → 403
- Commercial Officer cannot create FINISHED_GOODS PR → 403
- Depot/Feed Mill Officer adding RM product code returns validation error

**API Tests**
- `GET /product-requisitions` returns only own PRs for requester roles
- `GET /product-requisitions` returns correct queue for Distribution/Procurement roles
- `POST /product-requisitions/{id}/submit` with missing fields returns 400 with field-level errors
- `POST /product-requisitions/{id}/cancel` with active TRs returns 409

**Overflow Tests**
- TR creation that would exceed PR quantity is blocked with descriptive 409 error

**Audit Trail Tests**
- Submit action generates audit log entry
- Cancel action generates audit log entry with cancellation reason

### 14.3 Test Factories

```python
# factory_boy factories
class FGRequisitionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductRequisition
    pr_type = 'FINISHED_GOODS'
    urgency = 'Normal'
    status = 'Draft'
    # ...

class PortRequisitionFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ProductRequisition
    pr_type = 'PORT_CONSIGNMENT'
    # LC fields provided via subfactory or traits
```

---

## 15. Indexes for Performance

```sql
-- Core lookups
CREATE INDEX idx_pr_tenant_type_status ON product_requisitions(tenant_id, pr_type, status);
CREATE INDEX idx_pr_tenant_requester ON product_requisitions(tenant_id, requester_id);
CREATE INDEX idx_pr_number ON product_requisitions(pr_number, tenant_id);
CREATE INDEX idx_pr_created_at ON product_requisitions(created_at DESC);
CREATE INDEX idx_pr_destination_poi ON product_requisitions(destination_poi_id);

-- Line items
CREATE INDEX idx_pr_line_item_pr ON pr_line_items(pr_id);
CREATE INDEX idx_pr_line_item_product ON pr_line_items(product_id);

-- Documents
CREATE INDEX idx_pr_document_pr ON pr_documents(pr_id);
```

---

## 16. Integration Points

### 16.1 Upstream Dependencies

| Module | Usage |
|--------|-------|
| MDM-01 (Product Master) | Product Item Code lookup; product type gate; auto-fill of name, category, sub-category, packing |
| MDM-04 (POI Master) | Destination POI dropdown (FG PR); capacity snapshot widget; POI for Port PR TRs |
| `01-foundation` (RBAC) | Role gates for PR type; requester auto-fill from user profile |

### 16.2 Downstream Consumers

| Module | Interaction |
|--------|-------------|
| Distribution (DR-01) | Reads submitted FG PRs queue; creates TRs against FG PRs |
| Procurement (PC-01) | **Port Shipments** top-level org view — [PC-01 story](../../03-backlog/sprints/sprint-3/04-procurement/PC-01-rm-product-requisitions.md) |
| Procurement (PC-02) | TR destination breakdown from Port Shipment / Procurement list — [PC-02 story](../../03-backlog/sprints/sprint-3/04-procurement/PC-02-transport-requests.md) |
| Transport Planning (TRQ-01 / TO-01) | `05-transport` — [Sprint 3 transport epic](../../03-backlog/sprints/sprint-3/README.md) — unified TR queue then TO creation |

### 16.3 Events Emitted (for downstream)

```typescript
PRSubmitted {
  pr_id: UUID
  pr_type: 'FINISHED_GOODS' | 'PORT_CONSIGNMENT'
  tenant_id: UUID
  timestamp: DateTime
}

PRStatusChanged {
  pr_id: UUID
  previous_status: string
  new_status: string
  timestamp: DateTime
}
```

---

## 17. Related Documentation

- **[Product Master Data Management](../02-master-data/product-master-data-management.md)** — Product Item Code lookup, product type (FG/RM), UOM
- **[POI Management](../02-master-data/poi-management.md)** — Destination POI, capacity snapshot
- **[Sprint 3 README](../../03-backlog/sprints/sprint-3/README.md)** — Menu structure, role access matrix, end-to-end workflow
- **[PR-01: FG Product Requisition Story](../../03-backlog/sprints/sprint-3/01-requisition/PR-01-fg-product-requisition.md)**
- **[PR-02: Port Shipment (Import) Registration](../../03-backlog/sprints/sprint-3/02-port-shipments/PR-02-port-shipment.md)**

**Related Jira Keys**:
- DFS-032 — FG Product Requisition
- DFS-033 — Port Shipment (Import) Registration
- DFS-040 — Requisition Epic

**Source**: PRD_DFMS_v1.0.md — Requisition module sections
