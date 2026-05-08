---
module: 06-poi-operations
specification: Scaling Operations (Sprint 4 — TO-Centric)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
related_stories: DFS-055 (SC-01)
jira_epic: DFS-073
---

# Scaling Operations Specification (Sprint 4)

## Overview

The **Scaling Operations** specification covers vehicle weighing at POI weighbridges — **scale-in** (gross weight), **scale-out** (tare weight), net weight calculation, and **queue token (P.C. code) issuance** for yard management. Every scale event is anchored to a **GateVisitSession** (from GT-01), which in turn links to a **TransportOrder**.

The queue token (P.C. code) is issued after scale-in and used by Command Center (CC-01) to manage the loading/unloading queue. Scale-out is a **clearance gate** for vehicle exit — gate-out (GT-01) cannot proceed until scale-out is complete.

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
              ├── Input: Gross Weight (kg) — manual entry or auto-capture from weighbridge
              ├── Input: Weighbridge ID (dropdown — which weighbridge used)
              ├── Input: Remarks (optional — e.g., "Vehicle overloaded", "Tarp removed for accurate weight")
              └── [Submit Scale-In]
                    └─► Create ScaleRecord (scale_in_at=now, gross_weight_kg=...)
                          └─► Generate QueueToken (pc_code=unique)
                                └─► Print QR code label (pc_code embedded)
                                      └─► Move to Command Center Queue (CC-01)
                                            └─► Success message: "Scale-in recorded. Token: PC-20260506-0042"

Operations → Scaling → Scale-Out Queue
  └─► List: TO Number, Vehicle, Product, Token (P.C. Code), Loading/Unloading Done Time, Status (Pending Scale-Out)
        └─► [row click] ──► Scale-Out Form
              ├── Read-only: TO Summary, Gross Weight (from scale-in), Token (P.C. Code)
              ├── Input: Tare Weight (kg) — manual entry or auto-capture
              ├── Computed: Net Weight (kg) = Gross - Tare (read-only, auto-calculated)
              ├── Input: Weighbridge ID (dropdown)
              ├── Input: Remarks (optional)
              └── [Submit Scale-Out]
                    └─► Update ScaleRecord (scale_out_at=now, tare_weight_kg=..., net_weight_kg=computed)
                          └─► Update GateVisitSession.scale_out_done = True
                                └─► Update QueueToken.is_closed = True
                                      └─► Vehicle eligible for Gate-Out (GT-01)
                                            └─► Success message: "Scale-out recorded. Net weight: 48,500 kg. Vehicle may exit."

Operations → Scaling → Token Issuance
  └─► List: TO Number, Vehicle, Token (P.C. Code), Issued At, Status (Active/Closed)
        └─► [row click] ──► Token Detail
              ├── QR Code preview (pc_code embedded)
              ├── Token metadata: Issued At, Issued By, Status
              └── [Print Token] / [Reprint Token] button
                    └─► Generate PDF label with QR code + TO info
```

---

## 1. Roles & Access

| Role | Scale-In | Scale-Out | Token Issuance | Scale History |
|------|:--------:|:---------:|:--------------:|:-------------:|
| Scaling Operator | ✓ | ✓ | ✓ | ✓ (own POI) |
| Scaling Supervisor | ✓ | ✓ | ✓ | ✓ (all POIs) |

---

## 2. Data Model

### 2.1 ScaleRecord (existing model, extended for Sprint 4)

```python
ScaleRecord {
    scale_id: UUID
    
    # Core links (Sprint 4: TO-first)
    transport_order: FK → TransportOrder    # Denormalized for fast TO timeline queries
    gate_visit_session: FK → GateVisitSession  # Canonical link (visit is the session container)
    poi: FK → POI                           # Weighbridge location
    vehicle: FK → Vehicle                   # Denormalized from visit
    
    # Scale-In
    scale_in_at: DateTime (nullable)        # Timestamp when gross weight recorded
    gross_weight_kg: Decimal (nullable)     # Gross weight (vehicle + cargo)
    scale_in_by: FK → User (nullable)       # Scaling Operator
    scale_in_weighbridge: FK → Weighbridge (nullable)  # Which weighbridge used
    scale_in_remarks: text (nullable)
    
    # Scale-Out
    scale_out_at: DateTime (nullable)       # Timestamp when tare weight recorded
    tare_weight_kg: Decimal (nullable)      # Tare weight (empty vehicle)
    net_weight_kg: Decimal (nullable)       # Net weight (gross - tare) — auto-calculated
    scale_out_by: FK → User (nullable)      # Scaling Operator
    scale_out_weighbridge: FK → Weighbridge (nullable)
    scale_out_remarks: text (nullable)
    
    # Variance tracking (Phase 2)
    expected_weight_kg: Decimal (nullable)  # From TO allocated_quantity_mt × 1000
    weight_variance_kg: Decimal (nullable)  # net_weight_kg - expected_weight_kg
    variance_percent: Decimal (nullable)    # (variance / expected) × 100
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(gate_visit_session)` — one scale record per visit
- `scale_out_at >= scale_in_at` (validation)
- `net_weight_kg = gross_weight_kg - tare_weight_kg` (auto-calculated on scale-out save)

### 2.2 QueueToken (new model)

```python
QueueToken {
    token_id: UUID
    
    # Core links
    transport_order: FK → TransportOrder    # TO for which token issued
    gate_visit_session: FK → GateVisitSession  # Visit session
    scale_record: FK → ScaleRecord          # Scale record that triggered token issuance
    
    # Token identifier
    pc_code: string                         # Unique queue token (format: "PC-YYYYMMDD-XXXX")
    
    # Issuance
    issued_at: DateTime
    issued_by: FK → User (Scaling Operator)
    poi: FK → POI                           # POI where token issued
    
    # Status
    is_closed: boolean                      # False until scale-out; True after scale-out
    
    # QR Code
    qr_code_url: string (nullable)          # Pre-generated QR code image URL (optional)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
}
```

**Constraints**:
- Unique: `pc_code` (globally unique per tenant)
- Unique: `(transport_order, gate_visit_session)` — one token per visit

### 2.3 Weighbridge (new master data model — optional, Phase 2)

```python
Weighbridge {
    weighbridge_id: UUID
    poi: FK → POI                           # Which POI this weighbridge belongs to
    code: string                            # e.g., "WB-01", "WB-02"
    name: string                            # e.g., "North Gate Weighbridge"
    capacity_kg: integer                    # Max capacity (e.g., 60,000 kg)
    is_active: boolean
    
    # Integration (Phase 2)
    is_automated: boolean                   # True if connected to electronic scale
    api_endpoint: string (nullable)         # Webhook URL for auto-capture
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
}
```

---

## 3. Scale-In Flow

### 3.1 Queue Visibility

```
Scaling Operator opens Scale-In Queue (default view)
  └─► Backend query:
        GateVisitSession.objects.filter(
          poi=operator_poi,
          gate_in_at__isnull=False,
          scale_record__scale_in_at__isnull=True  # Not yet scaled in
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
        │     ├─► Gross Weight (kg): manual input (numeric, required)
        │     │     └─► Auto-capture option (Phase 2): [Fetch from Weighbridge] button (if weighbridge.is_automated)
        │     ├─► Weighbridge ID: dropdown (list of active weighbridges at this POI)
        │     └─► Remarks: text area (optional)
        │
        └─► [Submit Scale-In]
              └─► Backend:
                    ├─► Validate: gross_weight_kg > 0, weighbridge exists
                    │
                    ├─► Create or Update ScaleRecord:
                    │     ├─► scale_in_at = now()
                    │     ├─► gross_weight_kg = form.gross_weight
                    │     ├─► scale_in_by = current_user
                    │     ├─► scale_in_weighbridge = form.weighbridge
                    │     └─► scale_in_remarks = form.remarks
                    │
                    ├─► Generate QueueToken:
                    │     ├─► pc_code = "PC-YYYYMMDD-XXXX" (auto-increment per day)
                    │     ├─► issued_at = now()
                    │     ├─► issued_by = current_user
                    │     ├─► is_closed = False
                    │     └─► (Optionally generate QR code image: encode pc_code + TO# + Vehicle registration)
                    │
                    ├─► Update TO.execution_state (if needed):
                    │     └─► If TO.execution_state = 'gate_in_source': → 'scale_in_source'
                    │
                    ├─► Write TOExecutionEvent (TLS-01 timeline):
                    │     └─► event_type = 'scale_in', payload_json = {gross_weight_kg, pc_code}
                    │
                    └─► Response:
                          ├─► Success message: "Scale-in recorded. Token: PC-20260506-0042"
                          ├─► Auto-print token (if printer configured)
                          └─► Remove from Scale-In Queue → appears in Command Center Queue (CC-01)
```

---

## 4. Scale-Out Flow

### 4.1 Queue Visibility

```
Scaling Operator opens Scale-Out Queue
  └─► Backend query:
        GateVisitSession.objects.filter(
          poi=operator_poi,
          scale_record__scale_in_at__isnull=False,  # Already scaled in
          scale_record__scale_out_at__isnull=True,  # Not yet scaled out
          # Loading/unloading must be done (implied by Command Center releasing to scale-out queue)
        ).order_by('scale_record__scale_in_at')
        
  └─► List displays:
        - TO Number
        - Vehicle
        - Product
        - Token (P.C. Code)
        - Gross Weight (from scale-in)
        - Loading/Unloading Done Time
        - [Scale Now] button
```

### 4.2 Scale-Out Recording

```
Operator clicks [Scale Now] on a visit row
  └─► Scale-Out Form opens
        ├─► Read-only section: TO Summary, Gross Weight (from scale-in), Token (P.C. Code)
        │
        ├─► Input section:
        │     ├─► Tare Weight (kg): manual input (numeric, required)
        │     │     └─► Auto-capture option (Phase 2): [Fetch from Weighbridge]
        │     ├─► Weighbridge ID: dropdown
        │     ├─► Computed (read-only): Net Weight (kg) = Gross - Tare (live calculation)
        │     └─► Remarks: text area (optional)
        │
        └─► [Submit Scale-Out]
              └─► Backend:
                    ├─► Validate: tare_weight_kg > 0, tare < gross, weighbridge exists
                    │
                    ├─► Update ScaleRecord:
                    │     ├─► scale_out_at = now()
                    │     ├─► tare_weight_kg = form.tare_weight
                    │     ├─► net_weight_kg = gross_weight_kg - tare_weight_kg (auto-calculated)
                    │     ├─► scale_out_by = current_user
                    │     ├─► scale_out_weighbridge = form.weighbridge
                    │     └─► scale_out_remarks = form.remarks
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
                    │     └─► event_type = 'scale_out', payload_json = {tare_weight_kg, net_weight_kg}
                    │
                    └─► Response:
                          ├─► Success message: "Scale-out recorded. Net weight: 48,500 kg. Vehicle may exit."
                          └─► Remove from Scale-Out Queue → vehicle eligible for Gate-Out (GT-01)
```

---

## 5. Queue Token (P.C. Code) Management

### 5.1 Token Generation

**Format**: `PC-YYYYMMDD-XXXX`
- `PC` = Queue token prefix
- `YYYYMMDD` = Date
- `XXXX` = Auto-increment per day (resets daily)

**Example**: `PC-20260506-0042`

**Service** (`apps/operations/scaling/services/token_service.py`):

```python
def generate_queue_token(transport_order, gate_visit_session, scale_record, issued_by):
    today = date.today()
    # Get last token for today
    last_token = QueueToken.objects.filter(
        tenant=...,
        issued_at__date=today
    ).order_by('-pc_code').first()
    
    if last_token:
        last_seq = int(last_token.pc_code.split('-')[-1])
        new_seq = last_seq + 1
    else:
        new_seq = 1
    
    pc_code = f"PC-{today.strftime('%Y%m%d')}-{new_seq:04d}"
    
    token = QueueToken.objects.create(
        pc_code=pc_code,
        transport_order=transport_order,
        gate_visit_session=gate_visit_session,
        scale_record=scale_record,
        issued_by=issued_by,
        poi=gate_visit_session.poi,
        is_closed=False
    )
    
    # Optional: generate QR code image
    # qr_code_url = generate_qr_code(pc_code + TO.to_number + vehicle.registration)
    # token.qr_code_url = qr_code_url
    # token.save()
    
    return token
```

### 5.2 Token Printing

**Label format** (thermal printer, 4" x 2"):
```
┌────────────────────────────┐
│  Queue Token                │
│  PC-20260506-0042           │
│                             │
│  ████████████████████       │  (QR Code)
│  ████████████████████       │
│  ████████████████████       │
│                             │
│  TO: TO-20260506-0042       │
│  Vehicle: DHK-1234          │
│  Product: Broiler Starter   │
│  Qty: 50 MT                 │
└────────────────────────────┘
```

**Print trigger**:
- Auto-print on scale-in submission (if printer configured)
- Manual reprint from Token Issuance screen

**Implementation**:
- Generate PDF label using `reportlab` or `weasyprint`
- Embed QR code (using `qrcode` library)
- Send to configured printer (via print spooler or direct IP)

---

## 6. Django Admin Configuration

### 6.1 ScaleRecord Admin

**List View**:
- Columns: TO Number, Vehicle, POI, Scale-In Time, Scale-Out Time, Gross Weight, Tare Weight, Net Weight, Status (Pending Scale-Out / Completed)
- Filters: `poi`, `scale_in_at` (date range), Status (custom filter: scale_out_at null=Pending, not null=Completed)
- Search: TO number, Vehicle registration
- Actions: Bulk export CSV

**Status Badge**:
- Green: Completed (scale_out_at not null)
- Yellow: Pending Scale-Out (scale_out_at null)

**Detail View**:
- Read-only: TO (link), Visit (link), Vehicle (link), POI
- Scale-In Section:
  - Scale-In Time, Gross Weight (kg), Weighbridge, Operator, Remarks
- Scale-Out Section:
  - Scale-Out Time, Tare Weight (kg), Net Weight (kg), Weighbridge, Operator, Remarks
- Variance Section (computed):
  - Expected Weight, Net Weight, Variance (kg), Variance (%)
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01)

**Edit Restrictions**:
- Scale-In Time: editable within 1 hour (clock adjustments)
- Gross/Tare Weights: editable by Scaling Supervisor only (audit log required)
- Net Weight: read-only (auto-calculated)

### 6.2 QueueToken Admin

**List View**:
- Columns: Token (P.C. Code), TO Number, Vehicle, Issued At, Issued By, POI, Status (Active/Closed)
- Filters: `is_closed`, `poi`, `issued_at` (date range)
- Search: Token (pc_code), TO number
- Actions: Bulk export CSV, Bulk print tokens

**Status Badge**:
- Green: Closed (scale-out done)
- Blue: Active (awaiting scale-out)

**Detail View**:
- Read-only: Token (P.C. Code), TO (link), Visit (link), Scale Record (link), Issued At, Issued By, POI
- QR Code preview (image widget if qr_code_url exists)
- Custom admin action: **"Print Token"** (generate PDF + send to printer)
- Custom admin action: **"Reprint Token"** (same as print)

---

## 7. API Endpoints

### 7.1 Scale-In Queue

```http
GET    /api/v1/scaling/scale-in-queue/
       → List visits pending scale-in
       → Filters: ?poi_id=...
       → Response: [
           {
             visit_id,
             transport_order: {to_number, product, quantity_mt},
             vehicle: {registration, type},
             gate_in_at,
             waiting_time_minutes: 15
           }
         ]
```

### 7.2 Record Scale-In

```http
POST   /api/v1/scaling/scale-in/
       → Record scale-in event
       → Body: {
           gate_visit_session_id: UUID,
           gross_weight_kg: 52000,
           weighbridge_id: UUID (optional),
           remarks: "Vehicle weighed with tarp"
         }
       → Side effects:
           - Create/update ScaleRecord
           - Generate QueueToken
           - Update TO execution_state
           - Write TOExecutionEvent
       → Response: {
           scale_id,
           token: {pc_code, qr_code_url},
           message: "Scale-in recorded. Token: PC-20260506-0042"
         }
```

### 7.3 Scale-Out Queue

```http
GET    /api/v1/scaling/scale-out-queue/
       → List visits pending scale-out (loading/unloading done)
       → Filters: ?poi_id=...
       → Response: [
           {
             visit_id,
             transport_order: {to_number},
             vehicle: {registration},
             token: {pc_code},
             gross_weight_kg: 52000,
             loading_done_at: "2026-05-06T14:30:00Z"
           }
         ]
```

### 7.4 Record Scale-Out

```http
POST   /api/v1/scaling/scale-out/
       → Record scale-out event
       → Body: {
           scale_id: UUID (from ScaleRecord),
           tare_weight_kg: 3500,
           weighbridge_id: UUID (optional),
           remarks: "Empty vehicle weighed"
         }
       → Validations:
           - tare_weight < gross_weight
           - Scale-in must exist
       → Side effects:
           - Update ScaleRecord (net_weight auto-calculated)
           - Update GateVisitSession.scale_out_done = True
           - Update QueueToken.is_closed = True
           - Update TO execution_state
           - Write TOExecutionEvent
       → Response: {
           scale_id,
           net_weight_kg: 48500,
           message: "Scale-out recorded. Vehicle may exit."
         }
```

### 7.5 Token Detail

```http
GET    /api/v1/scaling/tokens/{token_id}/
       → Token detail with QR code
       → Response: {
           token_id,
           pc_code: "PC-20260506-0042",
           transport_order: {to_number, product},
           vehicle: {registration},
           qr_code_url: "https://.../qr/PC-20260506-0042.png",
           issued_at,
           is_closed
         }

POST   /api/v1/scaling/tokens/{token_id}/print/
       → Generate and print token label
       → Response: {pdf_url: "https://.../labels/PC-20260506-0042.pdf"}
```

---

## 8. Business Rules

### 8.1 Scale-In Recording

- Must follow gate-in (GateVisitSession.gate_in_at not null)
- Cannot scale-in twice for same visit (unique constraint)
- Gross weight must be > 0 and <= weighbridge capacity (if weighbridge FK set)
- Auto-generate queue token on scale-in submission

### 8.2 Scale-Out Recording

- Must follow scale-in (ScaleRecord.scale_in_at not null)
- Cannot scale-out twice for same visit
- Tare weight must be > 0 and < gross weight
- Net weight auto-calculated: `net = gross - tare`
- Scale-out sets `GateVisitSession.scale_out_done = True` (clearance for gate-out)

### 8.3 Queue Token Rules

- One token per visit (unique constraint)
- Token format: `PC-YYYYMMDD-XXXX` (date + auto-increment)
- Token remains active (`is_closed = False`) until scale-out
- Token closed (`is_closed = True`) on scale-out submission

### 8.4 Weight Variance Tracking (Phase 2)

**Expected weight** = TO.allocated_quantity_mt × 1000 (convert MT to kg)
**Variance (kg)** = net_weight_kg - expected_weight_kg
**Variance (%)** = (variance_kg / expected_weight_kg) × 100

**Alerting**:
- If variance% > ±5%: flag for supervisor review
- If variance% > ±10%: block gate-out, require approval

---

## 9. Integration Points

### 9.1 With Gate Operations (GT-01)

**Scale-in prerequisite**:
- Gate-in must complete first (GateVisitSession.gate_in_at not null)
- Scaling Operator sees gate-in visits in Scale-In Queue

**Scale-out clearance**:
- Gate-out (GT-01) validates `GateVisitSession.scale_out_done = True`
- If False, gate-out blocked with error: "Scale-out not completed"

### 9.2 With Command Center (CC-01)

**Queue token usage**:
- After scale-in, token issued → vehicle appears in Command Center queue (CC-01)
- Command Center uses `pc_code` to identify and assign vehicles to bays
- Loading/unloading personnel scan token QR code (Phase 2)

### 9.3 With Transport Lifecycle (TLS-01)

**Timeline events**:
- Scale-in: Create `TOExecutionEvent(event_type='scale_in', payload={gross_weight_kg, pc_code})`
- Scale-out: Create `TOExecutionEvent(event_type='scale_out', payload={tare_weight_kg, net_weight_kg})`

### 9.4 With Loading/Unloading (LD-01)

**Scale-out prerequisite**:
- Loading/unloading must complete before scale-out queue visibility
- Service checks: `LoadingOperation.objects.filter(gate_visit_session=visit, end_at__isnull=False).exists()`

---

## 10. Permissions & RBAC

### 10.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
Operations.Scale.In.Write
Operations.Scale.Out.Write
Operations.Scale.In.Read
Operations.Scale.Out.Read
Operations.Scale.Token.Issue
Operations.Scale.Token.Print
```

### 10.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.Scaling.View
```

### 10.3 Role → Permission Mapping

**Scaling Operator**:
- `Operations.Scale.In.Write`
- `Operations.Scale.Out.Write`
- `Operations.Scale.In.Read` (own POI)
- `Operations.Scale.Out.Read` (own POI)
- `Operations.Scale.Token.Issue`
- `Operations.Scale.Token.Print`

**Scaling Supervisor**:
- All Scaling Operator permissions
- `Operations.Scale.In.Read` (all POIs)
- `Operations.Scale.Out.Read` (all POIs)
- Edit scale records (admin only)

**Tenant Admin**:
- All above permissions (read-only for operations)

---

## 11. Validation Rules

### 11.1 Scale-In

- Gross weight > 0 (required)
- Gross weight <= weighbridge.capacity_kg (if weighbridge FK set)
- Gate-in must exist (GateVisitSession.gate_in_at not null)
- Cannot scale-in if already scaled in (unique constraint)

### 11.2 Scale-Out

- Tare weight > 0 (required)
- Tare weight < gross weight (validation)
- Scale-in must exist (ScaleRecord.scale_in_at not null)
- Cannot scale-out if already scaled out (unique constraint)
- Loading/unloading must be done (service-level check)

### 11.3 Token

- P.C. code must be unique (globally per tenant)
- Cannot issue token without scale-in
- Cannot close token without scale-out

---

## 12. Reports & Dashboards (Phase 2)

### 12.1 Weighbridge Utilization

- Scale events per weighbridge (histogram)
- Average wait time in scale-in queue
- Peak hours (time-of-day chart)

### 12.2 Weight Variance Report

- List of TOs with variance% > ±5%
- Exportable CSV for audit
- Supervisor approval log

---

## 13. Dependencies

### Upstream
- `apps/operations/gate/`: GateVisitSession
- `05-transport`: TransportOrder

### Downstream
- `apps/operations/command_center/`: Queue token usage (CC-01)
- `apps/operations/gate/`: Scale-out clearance (GT-01)
- `05-transport/lifecycle`: Timeline events (TLS-01)

---

## 14. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **SC-01** | Scale-in, queue token (P.C. code) & scale-out | ScaleRecord model + QueueToken model + admin UI + token generation service + QR code printing + API endpoints + TLS-01 integration + GT-01 clearance |

---

**Last Updated**: 2026-05-06  
**Related Modules**: [gate-operations-sprint4.md](./gate-operations-sprint4.md), [command-center-sprint4.md](./command-center-loading-sprint4.md), [05-transport](../05-transport/README.md)
