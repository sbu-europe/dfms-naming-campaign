---
module: 06-poi-operations
specification: Scaling Operations (Sprint 4 — TO-Centric)
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-12
related_stories: DFS-055 (SC-01)
jira_epic: DFS-073
---

# Scaling Operations Specification (Sprint 4)

## Overview

The **Scaling Operations** specification covers vehicle weighing at POI weighbridges — **scale-in** (loaded or empty vehicle weight), **scale-out** (remaining weight), net weight calculation, and **queue token (P.C. code) issuance** for yard management. Every weighing session is anchored to a **GateVisitSession** (from GT-01), which in turn links to a **TransportOrder**.

The operator inputs **loaded vehicle weight** and **empty vehicle weight**; the system auto-calculates **net weight** = loaded vehicle weight − empty vehicle weight.

The queue token (P.C. code) is issued after scale-in and used by Command Center (CC-01) to manage the loading/unloading queue. Scale-out is a **clearance gate** for vehicle exit — gate-out (GT-01) cannot proceed until scale-out is complete. After scale-out, weight records are **immutable** (PATCH/PUT returns 403).

**Module path**: `apps/operations/scaling/` (extends existing scaling app)  
**Dependencies**: `apps/operations/gate/` (GateVisitSession), `05-transport` (TransportOrder), `02-master-data` (POI, Vehicle)  
**Enables**: Command Center queue visibility (CC-01), Gate-out clearance (GT-01)

---

## 0. Menu Structure & Navigation

```
Sidebar (Scaling Operator)
└── Operations
      └── Scaling / Weighbridge
            ├── Scale-In Queue                    — vehicles that completed gate-in, awaiting scale-in
            │     └── [row click] ──► Scale-In Form
            │
            ├── Scale-Out Queue                   — vehicles that completed loading/unloading, awaiting scale-out
            │     └── [row click] ──► Scale-Out Form
            │
            ├── Token Issuance                    — print/reprint queue tokens (P.C. codes)
            │     └── [row click] ──► Token Detail (QR code preview + print)
            │
            └── Scale History                     — searchable log of all scale events
                  └── [Export CSV]
```

### Role → menu mapping

| Role | Scale-In Queue | Scale-Out Queue | Token Issuance | Scale History |
|------|:--------------:|:---------------:|:--------------:|:-------------:|
| Scaling Operator | ✓ | ✓ | ✓ | ✓ (own POI) |
| Scaling Supervisor | ✓ | ✓ | ✓ | ✓ (all POIs) |
| Tenant Admin | — | — | — | ✓ (all POIs) |

### Screen hierarchy

```
Operations → Scaling → Scale-In Queue
  └─► List: TO Number, Vehicle, Product, Gate-In Time, Status (Pending Scale-In)
        └─► [row click] ──► Scale-In Form
              ├── Read-only: TO Summary (TO#, Product, Quantity, Vehicle, Driver, Gate-In Time)
              ├── Input: Loaded Vehicle Weight (kg) or Empty Vehicle Weight (kg) — depending on arrival state
              ├── Input: Discrepancy Flags (optional checkboxes — wrong quantity, driver mismatch)
              ├── Input: Remarks (optional)
              └── [Submit Scale-In]
                    └─► Create ScaleIn record (FK to WeighingSession)
                          └─► Generate QueueToken (pc_code=unique serial)
                                └─► Webhook/signal → CC-01 queue feed
                                      └─► Success message: "Scale-in recorded. Token: PC-20260512-0042"

Operations → Scaling → Scale-Out Queue
  └─► List: TO Number, Vehicle, Product, Token (P.C. Code), Loading/Unloading Done Time, Status (Pending Scale-Out)
        └─► [row click] ──► Scale-Out Form
              ├── Read-only: TO Summary, Scale-In Weight, Token (P.C. Code)
              ├── Input: Remaining Weight (kg) — loaded vehicle weight if arrived empty, or empty vehicle weight if arrived loaded
              ├── Computed: Net Weight (kg) = Loaded Vehicle Weight − Empty Vehicle Weight (read-only, auto-calculated)
              ├── Input: Remarks (optional)
              └── [Submit Scale-Out]
                    └─► Create ScaleOut record (FK to WeighingSession)
                          └─► Lock WeighingSession (immutable — PATCH/PUT returns 403)
                                └─► Update GateVisitSession.scale_out_done = True
                                      └─► Update QueueToken.is_closed = True
                                            └─► Gate pass available for print
                                                  └─► Vehicle eligible for Gate-Out (GT-01)

Operations → Scaling → Token Issuance
  └─► List: TO Number, Vehicle, Token (P.C. Code), Issued At, Status (Active/Closed)
        └─► [row click] ──► Token Detail
              ├── Token metadata: Vehicle Number, Product Type (RM/FG), P.C. Code Serial, Issued At, Issued By, Status
              └── [Print Token] / [Reprint Token] button
                    └─► Browser print CSS output
```

---

## 1. Roles & Access

| Role | Scale-In | Scale-Out | Token Issuance | Scale History |
|------|:--------:|:---------:|:--------------:|:-------------:|
| Scaling Operator | ✓ | ✓ | ✓ | ✓ (own POI) |
| Scaling Supervisor | ✓ | ✓ | ✓ | ✓ (all POIs) |

---

## 2. Data Model

All models extend `TenantAwareModel`.

### 2.1 WeighingSession (container model — replaces ScaleRecord)

```python
WeighingSession(TenantAwareModel) {
    id: UUID (pk)

    # Core links
    gate_visit_session: FK → GateVisitSession   # Canonical link (visit is the session container)
    transport_order: FK → TransportOrder         # Denormalized for fast TO timeline queries
    poi: FK → POI                                # Weighbridge location
    vehicle: FK → Vehicle                        # Denormalized from visit

    # State
    status: CharField(choices=[
        'scale_in',    # Scale-in recorded, awaiting scale-out
        'scale_out',   # Scale-out recorded, session complete
    ])

    # Metadata
    created_at: DateTime (auto_now_add)
    updated_at: DateTime (auto_now)
}
```

**Constraints**:
- Unique: `(gate_visit_session)` — one weighing session per visit
- After status = `scale_out`, session is **immutable** (PATCH/PUT returns 403)

### 2.2 ScaleIn (new model — FK to WeighingSession)

```python
ScaleIn(TenantAwareModel) {
    id: UUID (pk)

    # Parent
    weighing_session: OneToOne → WeighingSession

    # Weight capture
    loaded_vehicle_weight_kg: Decimal (nullable)   # Weight if vehicle arrives loaded
    empty_vehicle_weight_kg: Decimal (nullable)     # Weight if vehicle arrives empty
    # Exactly one of the above is populated at scale-in; the other at scale-out

    # Discrepancy flags (per PRD)
    wrong_quantity: Boolean (default=False)
    driver_mismatch: Boolean (default=False)

    # Operator & timestamp
    operator: FK → User                            # Scaling Operator who performed scale-in
    scale_in_at: DateTime                           # When weight was recorded
    remarks: TextField (nullable)

    # Metadata
    created_at: DateTime (auto_now_add)
}
```

**Constraints**:
- At least one of `loaded_vehicle_weight_kg` or `empty_vehicle_weight_kg` must be set
- Unique: `(weighing_session)` — one scale-in per session
- After session status = `scale_out`, this row is **locked from edits**

### 2.3 ScaleOut (new model — FK to WeighingSession)

```python
ScaleOut(TenantAwareModel) {
    id: UUID (pk)

    # Parent
    weighing_session: OneToOne → WeighingSession

    # Weight capture (remaining weight)
    loaded_vehicle_weight_kg: Decimal (nullable)   # Populated if vehicle was empty at scale-in
    empty_vehicle_weight_kg: Decimal (nullable)     # Populated if vehicle was loaded at scale-in

    # Auto-calculated
    net_weight_kg: Decimal                          # = loaded_vehicle_weight − empty_vehicle_weight

    # Operator & timestamp
    operator: FK → User                            # Scaling Operator who performed scale-out
    scale_out_at: DateTime                          # When weight was recorded
    remarks: TextField (nullable)

    # Metadata
    created_at: DateTime (auto_now_add)
}
```

**Constraints**:
- Unique: `(weighing_session)` — one scale-out per session
- `net_weight_kg` = loaded_vehicle_weight − empty_vehicle_weight (auto-calculated across ScaleIn + ScaleOut on save)
- On create: session status → `scale_out`, session becomes immutable

### 2.4 QueueToken (updated — FK to WeighingSession)

```python
QueueToken(TenantAwareModel) {
    id: UUID (pk)

    # Core links
    weighing_session: FK → WeighingSession          # Session that triggered token issuance

    # Token identifier
    pc_code: CharField                              # Auto-generated P.C. code serial number

    # Content (denormalized for print/display)
    vehicle_number: CharField                       # From vehicle registration
    product_type: CharField(choices=['RM', 'FG'])   # Raw Material or Finished Goods

    # Issuance
    issued_at: DateTime (auto_now_add)
    issued_by: FK → User (Scaling Operator)
    poi: FK → POI                                   # POI where token issued

    # Status
    is_closed: Boolean (default=False)              # False until scale-out; True after scale-out

    # Metadata
    created_at: DateTime (auto_now_add)
}
```

**Constraints**:
- Unique: `pc_code` (globally unique per tenant)
- Unique: `(weighing_session)` — one token per session

**Queue entry display fields** (AC-3):
- Vehicle Number
- P.C. Code (Waiting Code)
- Item (Product Type — FG / RM)
- Scale-in Date & Time
- Loaded Vehicle Weight
- Empty Vehicle Weight
- TO / Challan Reference

---

## 3. Scale-In Flow

### 3.1 Queue Visibility

```
Scaling Operator opens Scale-In Queue (default view)
  └─► Backend query:
        GateVisitSession.objects.filter(
          poi=operator_poi,
          gate_in_at__isnull=False,
          weighingsession__isnull=True  # No weighing session yet
        ).order_by('gate_in_at')
        
  └─► List displays:
        - TO Number
        - Vehicle (registration)
        - Product (item code + name)
        - Gate-In Time (how long waiting)
        - [Scale Now] button
```

### 3.2 Scale-In Recording

```
Operator clicks [Scale Now] on a visit row
  └─► Scale-In Form opens (modal or new page)
        ├─► Read-only section: TO Summary (TO#, Product, Quantity, Vehicle, Driver, Gate-In Time)
        │
        ├─► Input section:
        │     ├─► Loaded Vehicle Weight (kg): numeric input (if vehicle arrives loaded)
        │     ├─► Empty Vehicle Weight (kg): numeric input (if vehicle arrives empty)
        │     │     (Exactly one populated at scale-in; the complementary weight captured at scale-out)
        │     ├─► Discrepancy flags: checkboxes (wrong quantity, driver mismatch) — optional
        │     └─► Remarks: text area (optional)
        │
        └─► [Submit Scale-In]
              └─► Backend:
                    ├─► Validate: gate-in exists, at least one weight > 0
                    │
                    ├─► Create WeighingSession:
                    │     ├─► gate_visit_session = visit
                    │     ├─► transport_order = visit.transport_order
                    │     ├─► poi = visit.poi
                    │     ├─► vehicle = visit.vehicle
                    │     └─► status = 'scale_in'
                    │
                    ├─► Create ScaleIn:
                    │     ├─► weighing_session = session
                    │     ├─► loaded_vehicle_weight_kg / empty_vehicle_weight_kg = form input
                    │     ├─► wrong_quantity = form.wrong_quantity
                    │     ├─► driver_mismatch = form.driver_mismatch
                    │     ├─► operator = current_user
                    │     ├─► scale_in_at = now()
                    │     └─► remarks = form.remarks
                    │
                    ├─► Generate QueueToken:
                    │     ├─► pc_code = auto-generated P.C. code serial
                    │     ├─► vehicle_number = vehicle.registration
                    │     ├─► product_type = 'RM' or 'FG' (from TO)
                    │     ├─► issued_by = current_user
                    │     └─► is_closed = False
                    │
                    ├─► Notify CC-01 (webhook/signal):
                    │     └─► Push new queue entry to Command Center
                    │
                    ├─► Update TO.execution_state (if needed):
                    │     └─► If TO.execution_state = 'gate_in_source': → 'scale_in_source'
                    │
                    ├─► Write TOExecutionEvent (TLS-01 timeline):
                    │     └─► event_type = 'SCALE_IN', payload_json = {weight, pc_code, discrepancy_flags}
                    │
                    └─► Response:
                          ├─► Success message: "Scale-in recorded. Token: PC-20260512-0042"
                          └─► Remove from Scale-In Queue → appears in Command Center Queue (CC-01)
```

---

## 4. Scale-Out Flow

### 4.1 Queue Visibility

```
Scaling Operator opens Scale-Out Queue
  └─► Backend query:
        WeighingSession.objects.filter(
          poi=operator_poi,
          status='scale_in',                      # Scale-in done, awaiting scale-out
          scaleout__isnull=True,                   # Not yet scaled out
        ).order_by('scalein__scale_in_at')
        
  └─► List displays:
        - TO Number
        - Vehicle
        - Product
        - Token (P.C. Code)
        - Scale-In Weight (loaded or empty)
        - Loading/Unloading Done Time
        - [Scale Now] button
```

### 4.2 Scale-Out Recording

```
Operator clicks [Scale Now] on a session row
  └─► Scale-Out Form opens
        ├─► Read-only section: TO Summary, Scale-In Weight, Token (P.C. Code)
        │
        ├─► Input section:
        │     ├─► Remaining Weight (kg): numeric input (required)
        │     │     ├─► If vehicle arrived loaded → enters Empty Vehicle Weight (kg)
        │     │     └─► If vehicle arrived empty  → enters Loaded Vehicle Weight (kg)
        │     ├─► Computed (read-only): Net Weight (kg) = Loaded − Empty (live calculation)
        │     └─► Remarks: text area (optional)
        │
        └─► [Submit Scale-Out]
              └─► Backend:
                    ├─► Validate: remaining weight > 0
                    │
                    ├─► Create ScaleOut:
                    │     ├─► weighing_session = session
                    │     ├─► loaded_vehicle_weight_kg / empty_vehicle_weight_kg = remaining weight
                    │     ├─► net_weight_kg = loaded − empty (auto-calculated across ScaleIn + ScaleOut)
                    │     ├─► operator = current_user
                    │     ├─► scale_out_at = now()
                    │     └─► remarks = form.remarks
                    │
                    ├─► Lock session:
                    │     └─► WeighingSession.status = 'scale_out' (immutable — PATCH/PUT returns 403)
                    │
                    ├─► Update GateVisitSession:
                    │     └─► scale_out_done = True (clearance flag for GT-01)
                    │
                    ├─► Update QueueToken:
                    │     └─► is_closed = True
                    │
                    ├─► Update TO.execution_state (if needed):
                    │     └─► If TO.execution_state = 'gate_out_source' pending: → 'scale_out_source'
                    │
                    ├─► Write TOExecutionEvent (TLS-01 timeline):
                    │     └─► event_type = 'SCALE_OUT', payload_json = {remaining_weight, net_weight_kg}
                    │
                    └─► Response:
                          ├─► Success message: "Scale-out recorded. Net weight: 48,500 kg. Vehicle may exit."
                          ├─► Gate pass available for print
                          └─► Remove from Scale-Out Queue → vehicle eligible for Gate-Out (GT-01)
```

---

## 5. Queue Token (P.C. Code) Management

### 5.1 Token Generation

**Format**: Auto-generated P.C. code serial number (unique per tenant).

**Token content** (AC-3):
- Vehicle Number
- Product Type (RM or FG)
- P.C. code serial number

**Service** (`apps/operations/scaling/services/token_service.py`):

```python
def generate_queue_token(weighing_session, issued_by):
    pc_code = generate_pc_code_serial(weighing_session.tenant)

    token = QueueToken.objects.create(
        weighing_session=weighing_session,
        pc_code=pc_code,
        vehicle_number=weighing_session.vehicle.registration,
        product_type=determine_product_type(weighing_session.transport_order),
        issued_by=issued_by,
        poi=weighing_session.poi,
        is_closed=False,
    )

    # Notify CC-01 queue feed
    notify_command_center(weighing_session, token)

    return token
```

### 5.2 Token Printing (Browser Print CSS)

**Printable token** (browser print CSS — desk printer):
```
┌────────────────────────────┐
│  Queue Token                │
│  P.C. Code: <serial>        │
│                             │
│  Vehicle: DHK-1234          │
│  Product Type: FG           │
│  TO / Challan: TO-0042      │
│                             │
│  Scale-in: 2026-05-12 10:30 │
│  Loaded Weight: 52,000 kg   │
│  Empty Weight: —            │
└────────────────────────────┘
```

**Queue entry display** (AC-3):
- Vehicle Number
- P.C. Code (Waiting Code)
- Item (Product Type — FG / RM)
- Scale-in Date & Time
- Loaded Vehicle Weight
- Empty Vehicle Weight
- TO / Challan Reference

---

## 6. Gate Pass (Printable after Scale-Out)

After scale-out, a **printable gate pass** is available via browser print CSS.

**Gate pass content** (AC-4):
- Vehicle Number
- Item Name
- Net Weight
- P.C. Code

**Endpoint**: `GET /api/v1/scaling/scale-out/{scale_out_id}/gate-pass`

**Template** (browser print CSS):
```
┌────────────────────────────┐
│  GATE PASS                  │
│                             │
│  Vehicle: DHK-1234          │
│  Item: Broiler Starter      │
│  Net Weight: 48,500 kg      │
│  P.C. Code: <serial>        │
│                             │
│  Date: 2026-05-12           │
│  Operator: <name>           │
└────────────────────────────┘
```

**Implementation**: HTML template with `@media print` CSS rules for clean desk-printer output.

---

## 7. Django Admin Configuration

All admin classes use `TenantOnlyAdminMixin`.

### 7.1 ScaleInAdmin

**List View**:
- Columns: TO Number, Vehicle, POI, Scale-In Time, Loaded Weight, Empty Weight, Discrepancy Flags, Operator, Status
- Filters: `poi`, `scale_in_at` (date range), discrepancy flags
- Search: TO number, Vehicle registration

**Change Form**:
- Vehicle number lookup
- Gate-in validation in `save_model` — rejects if no completed gate-in for the session
- Weight capture fields (loaded / empty)
- Discrepancy flag checkboxes (wrong quantity, driver mismatch)
- After session status = `scale_out`: all fields read-only via `get_readonly_fields`

### 7.2 ScaleOutAdmin

**List View**:
- Columns: TO Number, Vehicle, POI, Scale-Out Time, Remaining Weight, Net Weight, Operator, Status
- Filters: `poi`, `scale_out_at` (date range)
- Search: TO number, Vehicle registration

**Change Form**:
- Net weight auto-calculation in `save_model` (loaded − empty)
- Immutability enforcement via `get_readonly_fields` for completed sessions
- Gate pass print action

**Status Badges**:
- Green: Completed (scale-out done)
- Yellow: Pending Scale-Out

### 7.3 QueueToken Admin

**List View**:
- Columns: Token (P.C. Code), Vehicle Number, Product Type, TO Number, Issued At, Issued By, POI, Status (Active/Closed)
- Filters: `is_closed`, `poi`, `issued_at` (date range)
- Search: Token (pc_code), TO number, Vehicle number
- Actions: Bulk export CSV

**Status Badge**:
- Green: Closed (scale-out done)
- Blue: Active (awaiting scale-out)

**Detail View**:
- Read-only: Token (P.C. Code), WeighingSession (link), TO (link), Vehicle, Issued At, Issued By, POI
- Custom admin action: **"Print Token"** (browser print CSS)

---

## 8. API Endpoints

### 8.1 Record Scale-In

```http
POST   /api/v1/scaling/scale-in
       → Record scale-in event (gate-in prerequisite enforced)
       → Body: {
           gate_visit_session_id: UUID,
           loaded_vehicle_weight_kg: 52000,     // if vehicle arrives loaded
           empty_vehicle_weight_kg: null,        // or vice versa
           wrong_quantity: false,
           driver_mismatch: false,
           remarks: "optional"
         }
       → Validations:
           - Gate-in must exist for the visit session
           - At least one weight field must be > 0
       → Side effects:
           - Create WeighingSession + ScaleIn
           - Generate QueueToken (P.C. code serial)
           - Webhook/signal to CC-01 queue feed
           - Update TO execution_state
           - Emit SCALE_IN event (TLS-01)
       → Response: {
           weighing_session_id,
           scale_in_id,
           token: {pc_code, vehicle_number, product_type},
           message: "Scale-in recorded. Token: <pc_code>"
         }
```

### 8.2 List/Detail Scale-In

```http
GET    /api/v1/scaling/scale-in?date=&vehicle=&to_number=&status=&search=
       → List scale-in records with filters
       → Response: [{
           scale_in_id,
           weighing_session_id,
           transport_order: {to_number, product, quantity_mt},
           vehicle: {registration},
           loaded_vehicle_weight_kg,
           empty_vehicle_weight_kg,
           discrepancy_flags: {wrong_quantity, driver_mismatch},
           scale_in_at,
           operator,
           token: {pc_code}
         }]

GET    /api/v1/scaling/scale-in/{scale_in_id}
       → Scale-in detail
```

### 8.3 Record Scale-Out

```http
POST   /api/v1/scaling/scale-out
       → Record scale-out event (net weight auto-calculated, records locked)
       → Body: {
           weighing_session_id: UUID,
           loaded_vehicle_weight_kg: null,       // remaining weight — complementary to scale-in
           empty_vehicle_weight_kg: 3500,        // or vice versa
           remarks: "optional"
         }
       → Validations:
           - Scale-in must exist for the session
           - Session must not already be locked (status != 'scale_out')
           - Remaining weight > 0
       → Side effects:
           - Create ScaleOut with net_weight_kg auto-calculated
           - Lock WeighingSession (status → 'scale_out', immutable)
           - Update GateVisitSession.scale_out_done = True
           - Update QueueToken.is_closed = True
           - Update TO execution_state
           - Emit SCALE_OUT event (TLS-01)
       → Response: {
           scale_out_id,
           net_weight_kg: 48500,
           message: "Scale-out recorded. Vehicle may exit."
         }
```

### 8.4 Scale-Out Detail & Gate Pass

```http
GET    /api/v1/scaling/scale-out/{scale_out_id}
       → Scale-out detail including net weight and gate pass data

GET    /api/v1/scaling/scale-out/{scale_out_id}/gate-pass
       → Printable gate pass (HTML with browser print CSS)
       → Content: vehicle number, item name, net weight, P.C. code
```

### 8.5 Queue Tokens (CC-01 Feed)

```http
GET    /api/v1/scaling/queue-tokens?status=waiting&poi=
       → Active queue for CC-01 feed
       → Response: [{
           token_id,
           pc_code,
           vehicle_number,
           product_type,
           scale_in_at,
           loaded_vehicle_weight_kg,
           empty_vehicle_weight_kg,
           to_challan_reference,
           is_closed
         }]

GET    /api/v1/scaling/queue-tokens/{token_id}/print
       → Printable queue token (HTML with browser print CSS)
       → Content: vehicle number, product type, P.C. code serial, weights, TO reference
```

### 8.6 Immutability Enforcement

```http
PATCH  /api/v1/scaling/scale-in/{scale_in_id}
PUT    /api/v1/scaling/scale-in/{scale_in_id}
       → If session status = 'scale_out': returns 403 Forbidden
       → Body: "Weight records are locked after scale-out."

PATCH  /api/v1/scaling/scale-out/{scale_out_id}
PUT    /api/v1/scaling/scale-out/{scale_out_id}
       → Always returns 403 Forbidden (scale-out records are immutable)
```

---

## 9. Business Rules

### 9.1 Scale-In Recording

- Must follow gate-in (GateVisitSession.gate_in_at not null)
- Cannot scale-in twice for same visit (unique constraint on WeighingSession per visit)
- Captures **loaded vehicle weight** (if arrives loaded) OR **empty vehicle weight** (if arrives empty)
- At least one weight must be > 0
- Optional discrepancy flags: wrong quantity, driver mismatch (per PRD)
- Auto-generate queue token on scale-in submission
- Webhook/signal to CC-01 on completion

### 9.2 Scale-Out Recording

- Must follow scale-in (ScaleIn must exist for the session)
- Cannot scale-out twice for same session
- Records the **remaining weight** (complementary to scale-in)
- Net weight auto-calculated: `net = loaded_vehicle_weight − empty_vehicle_weight`
- Scale-out sets `GateVisitSession.scale_out_done = True` (clearance for gate-out)
- After scale-out, **all weight records are immutable** (PATCH/PUT returns 403)

### 9.3 Net Weight Calculation

**Service** (`apps/operations/scaling/services/weight_service.py`):

```python
def calculate_net_weight(scale_in, scale_out):
    loaded = scale_in.loaded_vehicle_weight_kg or scale_out.loaded_vehicle_weight_kg
    empty = scale_in.empty_vehicle_weight_kg or scale_out.empty_vehicle_weight_kg
    return loaded - empty
```

The operator inputs loaded and empty weights across scale-in and scale-out; the system auto-calculates net weight when both are available.

### 9.4 Queue Token Rules

- One token per weighing session (unique constraint)
- P.C. code is an auto-generated serial number (unique per tenant)
- Token content: Vehicle Number, Product Type (RM/FG), P.C. code serial
- Token remains active (`is_closed = False`) until scale-out
- Token closed (`is_closed = True`) on scale-out submission

### 9.5 Immutability Rules

- After scale-out (session status = `scale_out`):
  - ScaleIn row is **locked** from edits
  - ScaleOut row is immutable
  - PATCH/PUT on locked resources returns **403 Forbidden**
  - Admin enforces via `get_readonly_fields` on completed sessions
- No role can edit locked records

### 9.6 Weight Variance Tracking (Phase 2)

**Expected weight** = TO.allocated_quantity_mt × 1000 (convert MT to kg)
**Variance (kg)** = net_weight_kg - expected_weight_kg
**Variance (%)** = (variance_kg / expected_weight_kg) × 100

**Alerting**:
- If variance% > ±5%: flag for supervisor review
- If variance% > ±10%: block gate-out, require approval

---

## 10. CC-01 Queue Feed Integration

On scale-in completion, the system pushes a new queue entry to Command Center (CC-01).

**Mechanism**: Webhook or Django signal fired after ScaleIn + QueueToken creation.

**Signal** (`apps/operations/scaling/signals.py`):

```python
scale_in_completed = Signal()  # sender=ScaleIn, kwargs: weighing_session, queue_token

# Receiver in apps/operations/command_center/
@receiver(scale_in_completed)
def push_to_cc_queue(sender, weighing_session, queue_token, **kwargs):
    # Add entry to CC-01 active queue
    # Trigger websocket/polling refresh for CC operators
    ...
```

**Queue entry pushed to CC-01**:
- Vehicle Number
- P.C. Code
- Item (Product Type)
- Scale-in Date & Time
- Loaded Vehicle Weight
- Empty Vehicle Weight
- TO / Challan Reference

The Command Center queue SHALL refresh automatically (websocket or polling) per AC-2.

---

## 11. Integration Points

### 11.1 With Gate Operations (GT-01)

**Scale-in prerequisite**:
- Gate-in must complete first (GateVisitSession.gate_in_at not null)
- Scaling Operator sees gate-in visits in Scale-In Queue

**Scale-out clearance**:
- Gate-out (GT-01) validates `GateVisitSession.scale_out_done = True`
- If False, gate-out blocked with error: "Scale-out not completed"

### 11.2 With Command Center (CC-01)

**Queue feed**:
- Webhook/signal on scale-in completion pushes new entry to CC-01 queue
- Queue refreshes automatically (websocket/polling)
- Command Center uses `pc_code` to identify and assign vehicles to bays

### 11.3 With Transport Lifecycle (TLS-01)

**Timeline events**:
- Scale-in: Emit `SCALE_IN` event with payload `{weight, pc_code, discrepancy_flags}`
- Scale-out: Emit `SCALE_OUT` event with payload `{remaining_weight, net_weight_kg}`

### 11.4 With Loading/Unloading (LD-01)

**Scale-out prerequisite**:
- Loading/unloading must complete before scale-out queue visibility
- Service checks: `LoadingOperation.objects.filter(gate_visit_session=visit, end_at__isnull=False).exists()`

---

## 12. Permissions & RBAC

### 12.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
Operations.Scale.In.Write
Operations.Scale.Out.Write
Operations.Scale.In.Read
Operations.Scale.Out.Read
Operations.Scale.Token.Issue
Operations.Scale.Token.Print
Operations.Scale.GatePass.Print
```

### 12.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.Scaling.View
```

### 12.3 Role → Permission Mapping

**Scaling Operator**:
- `Operations.Scale.In.Write`
- `Operations.Scale.Out.Write`
- `Operations.Scale.In.Read` (own POI)
- `Operations.Scale.Out.Read` (own POI)
- `Operations.Scale.Token.Issue`
- `Operations.Scale.Token.Print`
- `Operations.Scale.GatePass.Print`

**Scaling Supervisor**:
- All Scaling Operator permissions
- `Operations.Scale.In.Read` (all POIs)
- `Operations.Scale.Out.Read` (all POIs)

**Tenant Admin**:
- All above permissions (read-only for operations)

---

## 13. Validation Rules

### 13.1 Scale-In

- At least one weight (loaded or empty) must be > 0 (required)
- Gate-in must exist (GateVisitSession.gate_in_at not null)
- Cannot scale-in if already scaled in (unique constraint)
- Discrepancy flags are optional boolean fields

### 13.2 Scale-Out

- Remaining weight > 0 (required)
- Scale-in must exist (ScaleIn record for the session)
- Cannot scale-out if already scaled out (unique constraint)
- Net weight auto-calculated: loaded − empty (must be > 0)
- Loading/unloading must be done (service-level check)

### 13.3 Token

- P.C. code must be unique (globally per tenant)
- Cannot issue token without scale-in
- Cannot close token without scale-out

### 13.4 Immutability

- After scale-out, PATCH/PUT on scale-in or scale-out returns 403 Forbidden
- Admin `get_readonly_fields` enforces read-only on completed sessions
- No role can bypass immutability

---

## 14. Sprint 4 Story Mapping

| Story | Scope | Sub-tasks |
|-------|-------|-----------|
| **SC-01** | WeighingSession, ScaleIn, ScaleOut, QueueToken, gate pass, CC-01 feed, immutability | SC-01-1: WeighingSession + ScaleIn + ScaleOut models + migration |
| | | SC-01-2: ScaleInAdmin (gate-in validation, weight capture, discrepancy flags) |
| | | SC-01-3: ScaleOutAdmin (net weight auto-calc, immutability enforcement) |
| | | SC-01-4: QueueToken model + auto-generation (P.C. code serial, FK to WeighingSession) |
| | | SC-01-5: Scale-in REST API (POST — gate-in prerequisite, returns token) |
| | | SC-01-6: Scale-in list/detail REST API (GET with filters) |
| | | SC-01-7: Scale-out REST API (POST — net weight auto-calc, lock records) |
| | | SC-01-8: Scale-out detail REST API (GET — includes net weight, gate pass data) |
| | | SC-01-9: Queue token print template (browser print CSS) |
| | | SC-01-10: Gate pass print template (browser print CSS) |
| | | SC-01-11: CC-01 queue feed integration (webhook/signal on scale-in) |
| | | SC-01-12: Scaling operator UI (scale-in form, scale-out form, session list) |
| | | SC-01-13: TLS-01 event emission (SCALE_IN / SCALE_OUT events) |

---

## 15. Reports & Dashboards (Phase 2)

### 15.1 Weighbridge Utilization

- Scale events per day (histogram)
- Average wait time in scale-in queue
- Peak hours (time-of-day chart)

### 15.2 Weight Variance Report

- List of TOs with variance% > ±5%
- Exportable CSV for audit
- Supervisor approval log

---

## 16. Dependencies

### Upstream
- `apps/operations/gate/`: GateVisitSession
- `05-transport`: TransportOrder

### Downstream
- `apps/operations/command_center/`: Queue token usage + queue feed (CC-01)
- `apps/operations/gate/`: Scale-out clearance (GT-01)
- `05-transport/lifecycle`: Timeline events (TLS-01)

---

**Last Updated**: 2026-05-12  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [command-center-sprint4.md](./command-center-loading-sprint4.md), [05-transport](../05-transport/README.md)
