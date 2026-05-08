---
module: 06-poi-operations
specification: Gate Operations (Sprint 4 — TO-Centric)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
related_stories: DFS-054 (GT-01), DFS-062 (GT-02)
jira_epic: DFS-072
---

# Gate Operations Specification (Sprint 4)

## Overview

The **Gate Operations** specification covers vehicle entry/exit control at POI gates, TO-linked visit tracking, discrepancy remarks, and **on-demand TO creation** for dealer deliveries and supplier receipts that arrive without a planner-created TO.

Sprint 4 gate operations are **TO-centric** — every vehicle visit is anchored to a Transport Order, either assigned by TDO (Sprint 3) or created on-demand at the gate (GT-02). The gate visit becomes the **session container** for the full yard chain (gate → scale → queue → load/unload → scale out → gate out).

**Module path**: `apps/operations/gate/` (extends existing gate app)  
**Dependencies**: `05-transport` (TransportOrder), `02-master-data` (POI, Vehicle, Driver), `01-foundation` (RBAC)  
**Enables**: Scale-in (SC-01), Command Center queue (CC-01), TO lifecycle progression (TLS-01)

---

## 0. Menu Structure & Navigation

```
Sidebar (Gateman)
└── Operations
      └── Gate
            ├── Vehicle Entry (Gate-In)           — primary action: log incoming vehicle + link TO
            │     ├── Entry Form                  — TO lookup, vehicle/driver capture, document validation
            │     └── On-Demand TO Wizard         — [Create TO] button if no planner TO exists
            │
            ├── Vehicle Exit (Gate-Out)           — closure action: log outgoing vehicle + clearance checks
            │     └── Exit Form                   — TO lookup, clearance validation (scale-out, QC pass)
            │
            ├── Active Visits                     — live list of vehicles inside the POI (gate-in but not gate-out)
            │     └── [row click] ──► Visit Detail (read-only timeline)
            │
            └── Visit History                     — searchable log of all gate sessions (filterable by date, TO, vehicle)
                  └── [Export CSV]
```

### Role → menu mapping

| Role | Vehicle Entry | Vehicle Exit | Active Visits | Visit History | On-Demand TO |
|------|:-------------:|:------------:|:-------------:|:-------------:|:------------:|
| Gateman | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gate Supervisor | ✓ | ✓ | ✓ | ✓ | ✓ |
| Tenant Admin | — | — | Read-only | ✓ | — |

### Screen hierarchy

```
Operations → Gate → Vehicle Entry (Gate-In)
  └─► Entry Form
        ├── TO Lookup: TO Number input (search/autocomplete)
        │     ├── If found: display TO summary (product, quantity, source→dest, vehicle assigned)
        │     └── If not found: [Create On-Demand TO] button (GT-02 wizard)
        │
        ├── Vehicle Details: Registration (autofill from TO if found), Driver Name, Driver Contact
        ├── Document Validation:
        │     ├── Document Category: TO/Challan/DO/PO (radio buttons)
        │     ├── Document Number: text input
        │     └── Routing Type: Supplier Inbound / Dealer Outbound / Internal Transfer (dropdown)
        │
        ├── Remarks: text area (optional — discrepancies, visual inspection notes)
        └── [Submit Gate-In]
              └─► Create GateVisitSession (status: gate_in)
                    └─► Update TO.execution_state → 'gate_in_source' or 'gate_in_destination' (depending on POI)
                          └─► Redirect: Active Visits list (new row appears)

Operations → Gate → Vehicle Exit (Gate-Out)
  └─► Exit Form
        ├── TO Lookup: TO Number input
        │     └─► Fetch GateVisitSession (must exist, gate_out_at must be null)
        │
        ├── Clearance Checks (auto-validated by backend):
        │     ├── ✓ Scale-Out Done (ScaleRecord.scale_out_at not null)
        │     ├── ✓ QC Passed (if QC required — TOQCCheckpoint.qc_passed = true)
        │     ├── ✗ Blocked: "Scale-out not completed" (error if scale-out missing)
        │
        ├── Exit Remarks: text area (optional)
        └── [Submit Gate-Out]
              └─► Update GateVisitSession.gate_out_at = now()
                    └─► Update TO.execution_state → 'gate_out_source' or 'gate_out_destination'
                          └─► Remove from Active Visits
                                └─► Redirect: Visit History

Operations → Gate → On-Demand TO Wizard (GT-02)
  └─► Triggered from Entry Form when TO not found
        ├── Step 1: Path Type
        │     ├── Dealer DO Outbound (FG delivery to dealer)
        │     └── Supplier PO Inbound (RM receipt from supplier)
        │
        ├── Step 2: Document & Party Details
        │     ├── Document Number (DO# or PO#)
        │     ├── Party: Dealer (dropdown) or Supplier (dropdown)
        │     ├── Product: item code lookup
        │     ├── Expected Quantity (MT)
        │     └── Driver Name, Driver Contact
        │
        ├── Step 3: Routing
        │     ├── Source POI: auto-set to current gate POI (dealer outbound) or Supplier site (inbound)
        │     ├── Destination POI: dropdown (dealer outbound → dealer site; inbound → factory/depot)
        │
        └── [Create TO & Gate-In]
              └─► Create TransportOrder (source_channel='gate_on_demand', fleet_type='own' default, status='created')
                    └─► Create GateVisitSession (linked to new TO)
                          └─► Redirect: Active Visits (gate-in recorded)
```

---

## 1. Roles & Access

| Role | Gate-In | Gate-Out | On-Demand TO | Visit History |
|------|:-------:|:--------:|:------------:|:-------------:|
| Gateman | ✓ | ✓ | ✓ | ✓ (own POI) |
| Gate Supervisor | ✓ | ✓ | ✓ | ✓ (all POIs) |
| Tenant Admin | — | — | — | ✓ (all POIs) |

---

## 2. Data Model

### 2.1 GateVisitSession (new model)

```python
GateVisitSession {
    visit_id: UUID
    
    # Core links
    transport_order: FK → TransportOrder    # TO-anchored (planner or gate-created)
    poi: FK → POI                           # Gate location
    vehicle: FK → Vehicle                   # Vehicle (from TO or entered manually for on-demand)
    driver: FK → User (nullable)            # Driver (if known)
    
    # Document context
    document_category: enum                 # ['transport_order', 'challan', 'dealer_do', 'supplier_po']
    document_number: string                 # TO number, DO#, PO#, Challan#
    routing_type: enum                      # ['supplier_inbound', 'dealer_outbound', 'internal_transfer', 'port_inbound']
    
    # Visit timestamps
    gate_in_at: DateTime                    # Entry time
    gate_out_at: DateTime (nullable)        # Exit time (null until gate-out)
    
    # Remarks
    gate_in_remarks: text (nullable)        # Gateman notes at entry (discrepancies, damage)
    gate_out_remarks: text (nullable)       # Gateman notes at exit
    
    # Clearance flags (computed on gate-out validation)
    scale_out_done: boolean                 # True if ScaleRecord.scale_out_at exists
    qc_required: boolean                    # True if flow_type = 'rm_inbound'
    qc_passed: boolean (nullable)           # True if TOQCCheckpoint.qc_passed = true (null if not required)
    
    # Metadata
    tenant_id: UUID
    created_by: FK → User (Gateman)
    gate_in_by: FK → User (Gateman)
    gate_out_by: FK → User (Gateman, nullable)
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Unique: `(transport_order, poi, gate_in_at)` — one visit per TO per POI (may have multiple if TO returns for multiple trips)
- `gate_out_at >= gate_in_at` (validation)
- Cannot create gate-out if `gate_out_at` already set

### 2.2 GateOnDemandTORequest (new model — audit log for GT-02)

```python
GateOnDemandTORequest {
    request_id: UUID
    
    # Created TO
    created_transport_order: FK → TransportOrder
    
    # Context
    poi: FK → POI                           # Gate POI where request originated
    path_type: enum                         # ['dealer_do', 'supplier_po']
    
    # Document
    reference_number: string                # DO# or PO#
    party_type: enum                        # ['dealer', 'supplier']
    party: FK → Dealer or Supplier (polymorphic or separate FKs)
    
    # Product & Quantity
    product: FK → Product
    expected_quantity_mt: Decimal
    
    # Driver
    driver_name: string                     # Manual entry (may not be in system)
    driver_contact: string                  # Phone number
    
    # Remarks
    remarks: text (nullable)
    
    # Metadata
    created_by: FK → User (Gateman)
    tenant_id: UUID
    created_at: DateTime
}
```

### 2.3 Extensions to TransportOrder (existing model)

New field for Sprint 4:

```python
TransportOrder {
    # ... existing fields ...
    
    source_channel: enum                    # ['planner', 'gate_on_demand']
                                            # Sprint 3 TOs = 'planner'; GT-02 TOs = 'gate_on_demand'
    
    # Gate-created TOs skip some validations (no TR link, no TDO approval)
}
```

---

## 3. Gate-In Flow (GT-01)

### 3.1 TO-First Entry (Planner TO exists)

```
Gateman opens Gate-In form
  └─► Enters TO Number (search/autocomplete)
        └─► Backend lookup: TransportOrder.objects.get(to_number=...)
              ├─► If found:
              │     ├─► Display TO summary: Product, Quantity, Source→Dest, Vehicle, Driver
              │     ├─► Pre-fill: Vehicle registration, Driver name
              │     ├─► Gateman confirms/edits document category, routing type
              │     ├─► Gateman enters remarks (optional)
              │     └─► [Submit Gate-In]
              │           └─► Create GateVisitSession(transport_order=TO, gate_in_at=now, ...)
              │                 └─► Update TO.execution_state:
              │                       ├─► If POI = TO.origin_poi: 'gate_in_source'
              │                       └─► If POI = TO.destination_poi: 'gate_in_destination'
              │                             └─► Write TOExecutionEvent (TLS-01 timeline)
              │                                   └─► Success redirect: Active Visits
              │
              └─► If not found:
                    └─► Error: "TO not found. [Create On-Demand TO]" button enabled
```

### 3.2 On-Demand TO Creation (GT-02)

```
Gateman clicks [Create On-Demand TO] from Gate-In form
  └─► GT-02 Wizard opens
        ├─► Step 1: Path Type selection (Dealer DO / Supplier PO)
        │
        ├─► Step 2: Document & Party Details
        │     ├─► Document Number (required)
        │     ├─► Party: Dealer or Supplier (dropdown from MDM)
        │     ├─► Product: item code lookup (MDM-01)
        │     ├─► Expected Quantity (MT)
        │     ├─► Driver Name, Driver Contact (manual entry)
        │     └─► Remarks
        │
        ├─► Step 3: Routing
        │     ├─► Source POI: 
        │     │     ├─► Dealer DO: auto-set to current gate POI (depot/factory)
        │     │     └─► Supplier PO: Supplier site (FK from party)
        │     ├─► Destination POI:
        │     │     ├─► Dealer DO: Dealer site (FK from party)
        │     │     └─► Supplier PO: current gate POI (factory/depot)
        │     └─► Vehicle Type: default = 'Covered Truck' (editable)
        │
        └─► [Create TO & Gate-In]
              └─► Backend:
                    ├─► Create TransportOrder:
                    │     ├─► to_number = auto-generate ('TO-YYYYMMDD-XXXX')
                    │     ├─► source_channel = 'gate_on_demand'
                    │     ├─► fleet_type = 'own' (default)
                    │     ├─► flow_type = 'fg_outbound' (Dealer DO) or 'rm_inbound' (Supplier PO)
                    │     ├─► status = 'created'
                    │     ├─► execution_state = 'gate_in_source' or 'gate_in_destination'
                    │     ├─► origin_poi, destination_poi from wizard
                    │     ├─► allocated_quantity_mt = expected_quantity_mt
                    │     └─► no TR link, no TDO assignment required
                    │
                    ├─► Create GateOnDemandTORequest (audit log)
                    │
                    └─► Create GateVisitSession (gate_in_at = now)
                          └─► Success: redirect to Active Visits (TO created + gate-in recorded)
```

---

## 4. Gate-Out Flow (GT-01)

### 4.1 Exit Validation & Clearance Checks

```
Gateman opens Gate-Out form
  └─► Enters TO Number
        └─► Backend lookup: GateVisitSession.objects.get(transport_order__to_number=..., gate_out_at__isnull=True)
              ├─► If not found: Error "No active visit for this TO"
              │
              └─► If found:
                    ├─► Display visit summary: Vehicle, Driver, Gate-In Time, Dwell Time
                    │
                    ├─► Clearance Checks (backend validation):
                    │     ├─► Scale-Out Done:
                    │     │     └─► ScaleRecord.objects.filter(gate_visit_session=visit, scale_out_at__isnull=False).exists()
                    │     │           ├─► If False: raise ValidationError("Scale-out not completed. Vehicle cannot exit.")
                    │     │           └─► If True: ✓ Pass
                    │     │
                    │     └─► QC Passed (if required):
                    │           └─► If visit.qc_required:
                    │                 └─► TOQCCheckpoint.objects.get(transport_order=visit.transport_order).qc_passed
                    │                       ├─► If False or None: raise ValidationError("QC not passed. Vehicle cannot exit.")
                    │                       └─► If True: ✓ Pass
                    │
                    ├─► Gateman enters exit remarks (optional)
                    │
                    └─► [Submit Gate-Out]
                          └─► Update GateVisitSession:
                                ├─► gate_out_at = now()
                                ├─► gate_out_by = current_user
                                └─► gate_out_remarks = form.remarks
                                      └─► Update TO.execution_state:
                                            ├─► If POI = TO.origin_poi: 'gate_out_source'
                                            └─► If POI = TO.destination_poi: 'gate_out_destination'
                                                  └─► Write TOExecutionEvent (TLS-01)
                                                        └─► Success: Remove from Active Visits, add to Visit History
```

---

## 5. Django Admin Configuration

### 5.1 GateVisitSession Admin

**List View**:
- Columns: TO Number, Vehicle, POI, Gate-In Time, Gate-Out Time, Status (Active/Closed), Dwell Time (computed), Created By
- Filters: `poi`, `gate_in_at` (date range), Status (custom filter: gate_out_at null=Active, not null=Closed)
- Search: TO number, Vehicle registration
- Actions: Bulk export CSV

**Status Badge**:
- Green: Closed (gate_out_at not null)
- Yellow: Active (gate_out_at null)

**Detail View**:
- Read-only: TO (link), Vehicle (link), Driver (link), POI
- Timestamps: Gate-In At, Gate-Out At
- Clearance flags: Scale-Out Done (✓/✗), QC Required (✓/✗), QC Passed (✓/✗/N/A)
- Remarks: Gate-In Remarks (read-only), Gate-Out Remarks (read-only)
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01 timeline view)
- Inline: Related records (ScaleRecord, BayAssignment, LoadingOperation) — read-only

**Edit Restrictions**:
- Gate-In Time: editable within 1 hour of creation (for clock adjustments)
- Gate-Out Time: only via Gate-Out form (not direct admin edit)
- Remarks: editable by Gateman who created the record

### 5.2 GateOnDemandTORequest Admin

**List View**:
- Columns: Created TO (link), Path Type, Reference Number, Party, Product, Quantity, Created By, Created At
- Filters: `path_type`, `poi`, `created_at` (date range)
- Search: Reference number, TO number, Party name
- Actions: Bulk export CSV

**Detail View**:
- Read-only: Created TO (link to TO detail), POI, Path Type, Reference Number, Party, Product, Expected Quantity, Driver Name/Contact, Remarks
- Audit trail: Created By, Created At
- Custom admin action: **"View Created TO"** (redirect to TO admin detail)

---

## 6. API Endpoints

### 6.1 Gate-In

```http
POST   /api/v1/gate/entry/
       → Create gate-in visit
       → Body: {
           to_number: "TO-20260506-0042" (optional if on-demand),
           vehicle_registration: "DHK-1234" (required if TO not found),
           driver_name: "John Doe" (optional),
           document_category: "transport_order",
           document_number: "TO-20260506-0042",
           routing_type: "dealer_outbound",
           remarks: "Vehicle front bumper dent noted"
         }
       → Response: {
           visit_id,
           transport_order: {to_number, status},
           gate_in_at,
           message: "Gate-in recorded. Vehicle in Active Visits."
         }
```

### 6.2 Gate-Out

```http
POST   /api/v1/gate/exit/
       → Record gate-out
       → Body: {
           to_number: "TO-20260506-0042",
           exit_remarks: "All clear"
         }
       → Validations:
           - GateVisitSession must exist (gate_out_at = null)
           - Scale-out done
           - QC passed (if required)
       → Response: {
           visit_id,
           gate_out_at,
           dwell_time_minutes: 120,
           message: "Gate-out recorded. Vehicle exited."
         }
```

### 6.3 On-Demand TO Creation (GT-02)

```http
POST   /api/v1/gate/on-demand-to/
       → Create on-demand TO + gate-in
       → Body: {
           path_type: "dealer_do" | "supplier_po",
           reference_number: "DO-2026-1234",
           party_id: UUID (Dealer or Supplier FK),
           product_id: UUID,
           expected_quantity_mt: 50.0,
           driver_name: "John Doe",
           driver_contact: "+8801712345678",
           destination_poi_id: UUID (dealer_do path),
           remarks: "Urgent delivery"
         }
       → Side effects:
           - Create TransportOrder (source_channel='gate_on_demand')
           - Create GateOnDemandTORequest (audit log)
           - Create GateVisitSession (gate_in_at=now)
       → Response: {
           transport_order: {to_id, to_number, flow_type},
           visit: {visit_id, gate_in_at},
           message: "On-demand TO created and gate-in recorded."
         }
```

### 6.4 Active Visits List

```http
GET    /api/v1/gate/active-visits/
       → List all vehicles currently inside POI (gate_out_at null)
       → Filters: ?poi_id=...
       → Response: [
           {
             visit_id,
             transport_order: {to_number, product, quantity},
             vehicle: {registration, type},
             gate_in_at,
             dwell_time_minutes: 45,
             next_step: "scale_in" | "loading" | "qc" | "scale_out",
             clearance_status: {scale_out_done: false, qc_passed: null}
           }
         ]
```

### 6.5 Visit History

```http
GET    /api/v1/gate/visit-history/
       → List all gate visits (completed + active)
       → Filters: ?poi_id=..., ?from_date=..., ?to_date=..., ?to_number=..., ?vehicle_registration=...
       → Response: [
           {
             visit_id,
             transport_order: {to_number},
             vehicle: {registration},
             gate_in_at,
             gate_out_at,
             dwell_time_minutes: 180,
             status: "closed" | "active"
           }
         ]
```

---

## 7. Business Rules

### 7.1 TO Lookup Priority

When gateman enters TO number:
1. Check `TransportOrder` table for exact match
2. If not found, suggest [Create On-Demand TO]
3. If multiple TOs found (edge case), display selection list

### 7.2 Routing Type Mapping to Flow Type

| Routing Type | TO Flow Type | QC Required | Typical Document |
|--------------|--------------|:-----------:|------------------|
| Dealer Outbound | `fg_outbound` | No | Dealer DO |
| Supplier Inbound | `rm_inbound` | Yes | Supplier PO |
| Internal Transfer | `internal_transfer` | No (unless RM) | Challan |
| Port Inbound | `fg_inbound` or `rm_inbound` | RM: Yes, FG: No | Port Consignment |

### 7.3 Gate-Out Clearance Matrix

| Flow Type | Scale-Out | QC Passed | Loading/Unloading Done |
|-----------|:---------:|:---------:|:----------------------:|
| FG Outbound | ✓ Required | Not required | Loading required |
| FG Inbound | ✓ Required | Not required | Unloading required |
| RM Inbound | ✓ Required | ✓ Required | Unloading required |

Clearance check on gate-out:
- If any required condition not met → Error, gate-out blocked
- Gateman sees error message with missing step

### 7.4 On-Demand TO Defaults

**Dealer DO** path:
- `flow_type = 'fg_outbound'`
- `origin_poi = current_gate_poi` (depot/factory)
- `destination_poi = dealer_site` (from party FK)
- `fleet_type = 'own'` (default)
- `status = 'created'`, `execution_state = 'gate_in_source'`
- No TR link, no TDO assignment required

**Supplier PO** path:
- `flow_type = 'rm_inbound'`
- `origin_poi = supplier_site` (from party FK)
- `destination_poi = current_gate_poi` (factory/depot)
- `fleet_type = 'own'` (default)
- `status = 'created'`, `execution_state = 'gate_in_destination'`
- No TR link, no TDO assignment required

### 7.5 Duplicate Visit Prevention

- System checks: "Does an active visit already exist for this TO at this POI?"
- If yes: Error "Vehicle already gate-in for this TO. Complete gate-out first."
- If no: Proceed with gate-in

---

## 8. Integration Points

### 8.1 With Transport Lifecycle (TLS-01)

**Gate events write to timeline**:
- Gate-in: Create `TOExecutionEvent(event_type='gate_in_source' or 'gate_in_destination', to_state=..., actor_user=gateman)`
- Gate-out: Create `TOExecutionEvent(event_type='gate_out_source' or 'gate_out_destination', ...)`

### 8.2 With Scaling (SC-01)

**Gate-in triggers scale queue**:
- After gate-in, visit appears in Scaling Operator's queue (SC-01)
- Scale-in creates `ScaleRecord(gate_visit_session=visit)`

**Gate-out requires scale-out**:
- `GateVisitSession.scale_out_done` flag checked on exit
- Derived from `ScaleRecord.scale_out_at not null`

### 8.3 With Command Center (CC-01)

**Post-scale queue visibility**:
- After scale-in, visit appears in Command Center queue (CC-01)
- CC assigns bay (BayAssignment → gate_visit_session FK)

### 8.4 With QC (QC-01)

**QC requirement enforcement**:
- If `flow_type = 'rm_inbound'`, gate-out checks `TOQCCheckpoint.qc_passed = true`
- If QC failed or pending, gate-out blocked with error: "QC decision pending or failed. Cannot exit."

### 8.5 With Driver Mobile (DM-01)

**Milestone complementarity**:
- Driver may record "Gate In" milestone via mobile (DM-01)
- Gateman records gate-in via admin (GT-01)
- Both write to `TOExecutionEvent` timeline (TLS-01 deduplicates)

---

## 9. Permissions & RBAC

### 9.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
Operations.Gate.Entry.Create
Operations.Gate.Exit.Write
Operations.Gate.Entry.Read
Operations.Gate.Remarks.Write
Operations.Gate.OnDemandTO.CreateDealer
Operations.Gate.OnDemandTO.CreateSupplier
```

### 9.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.Gate.View
Menu.Gate.OnDemandTO.View
```

### 9.3 Role → Permission Mapping

**Gateman**:
- `Operations.Gate.Entry.Create`
- `Operations.Gate.Exit.Write`
- `Operations.Gate.Entry.Read` (own POI only)
- `Operations.Gate.Remarks.Write`
- `Operations.Gate.OnDemandTO.CreateDealer`
- `Operations.Gate.OnDemandTO.CreateSupplier`

**Gate Supervisor**:
- All Gateman permissions
- `Operations.Gate.Entry.Read` (all POIs)

**Tenant Admin**:
- All above permissions (read-only for operations)

---

## 10. Validation Rules

### 10.1 Gate-In

- TO number must exist (if provided) OR on-demand wizard must complete
- Vehicle registration required (max 15 chars, alphanumeric + dash)
- Document category required
- Document number required (max 50 chars)
- Routing type required
- Cannot gate-in if active visit already exists for same TO at same POI

### 10.2 Gate-Out

- Visit must exist (gate_out_at null)
- Scale-out must be done (`ScaleRecord.scale_out_at not null`)
- QC must pass (if required: `TOQCCheckpoint.qc_passed = true`)
- Loading/unloading must be done (per flow type)

### 10.3 On-Demand TO

- Reference number required (unique per tenant per path type)
- Party (Dealer/Supplier) must exist in MDM
- Product must exist (MDM-01)
- Expected quantity > 0
- Driver name required (max 100 chars)
- Driver contact required (valid phone format)
- Destination POI required (dealer DO path)

---

## 11. Reports & Dashboards (Phase 2)

### 11.1 Gate Performance Metrics

- Average dwell time (gate-in to gate-out) per POI
- Peak entry hours (histogram)
- On-demand TO percentage (gate vs planner)
- Gate-out clearance block reasons (top 5)

### 11.2 Discrepancy Log

- Remarks containing keywords: "damage", "shortage", "discrepancy"
- Exportable for audit

---

## 12. Dependencies

### Upstream
- `05-transport`: TransportOrder model
- `02-master-data`: POI, Vehicle, Driver, Dealer, Supplier, Product

### Downstream
- `06-poi-operations/scaling`: Scale-in (SC-01)
- `06-poi-operations/command-center`: Queue visibility (CC-01)
- `06-poi-operations/qc`: QC checkpoint enforcement (QC-01)
- `05-transport/lifecycle`: Timeline events (TLS-01), closure (POD-01)

---

## 13. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **GT-01** | Gate-in, gate-out & discrepancy remarks | GateVisitSession model + clearance validation + admin UI + API endpoints + TLS-01 integration |
| **GT-02** | On-demand TO creation — Dealer DO & Supplier PO | GateOnDemandTORequest model + wizard UI + TO creation service + gate-in trigger |

---

**Last Updated**: 2026-05-06  
**Related Modules**: [05-transport](../05-transport/README.md), [06-poi-operations](./README.md), [03-users/driver-interface](../03-users/driver-interface-sprint4.md)
