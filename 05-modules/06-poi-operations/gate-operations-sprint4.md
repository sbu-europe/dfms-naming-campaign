---
module: 06-poi-operations
specification: Gate Operations (Sprint 4 — TO-Centric)
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-16
changelog: "v2.1 — added §4.5 full TO status chain per lane; revised §5.1 gate-out guard matrix with TO status prerequisites; updated GateOutAdmin queryset restriction"
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
        ├── Vehicle Registration: required text input (max 15 chars)
        ├── Document Category: radio buttons
        │     ├── Supplier (PO) / Port → Inbound QC Workflow
        │     ├── Dealer (DO) → Outbound FG Workflow
        │     ├── Distributor (PO/DO) → Outbound FG Workflow
        │     └── Internal Transfer (TO/Challan) → TO-Linked Workflow
        │
        ├── Document Number: challan/TO/PO/DO number (text input)
        ├── Product Details: gate-in item (item code lookup)
        ├── Quantity: decimal (nullable — empty vehicles)
        ├── Date/Time: auto-set to now (editable within 1 hour)
        ├── Driver: Name + Contact (text inputs)
        ├── Party Name: text input (supplier/dealer/distributor)
        ├── Project / From Info: text input
        ├── Remarks: text area (optional — discrepancies, visual inspection)
        │
        └── [Submit Gate-In]
              └─► Create GateVisitSession + GateIn record
                    └─► Validate TO status per flow lane (§4.0); advance TO.status → at_source / at_destination
                          └─► Emit GATE_IN event to TLS-01 timeline
                                └─► Redirect: Active Visits

Operations → Gate → Vehicle Exit (Gate-Out)
  └─► Exit Form
        ├── TO Lookup: TO Number input
        │     └─► Fetch GateVisitSession (must exist, no GateOut record yet)
        │
        ├── Guard Matrix (auto-validated by backend per flow type):
        │     ├── FG outbound: scale-out completed + loading completed
        │     ├── FG inbound: scale-out completed + unloading completed
        │     ├── RM inbound: scale-out completed + unloading completed + QC not failed
        │     └── ✗ Blocked: error message with missing step
        │
        ├── Exit Remarks: text area (optional)
        └── [Submit Gate-Out]
              └─► Create GateOut record on GateVisitSession
                    └─► Update TO.execution_state
                          └─► Emit GATE_OUT event to TLS-01 timeline
                                └─► Remove from Active Visits → Visit History

Operations → Gate → On-Demand TO Wizard (GT-02)
  └─► Triggered from Entry Form when TO not found
        ├── Step 1: Path Type
        │     ├── Dealer DO Outbound (FG delivery to dealer)
        │     └── Supplier PO Inbound (RM receipt from supplier)
        │
        ├── Step 2: Document & Party Details
        │     ├── Document Number (DO# or PO#)
        │     ├── Party: Dealer (dropdown) or Supplier (dropdown)
        │     ├── Product: item code lookup (MDM-01)
        │     ├── Expected Quantity (MT)
        │     ├── Driver Name, Driver Contact (manual entry)
        │     └── Remarks
        │
        ├── Step 3: Routing
        │     ├── Source POI: 
        │     │     ├── Dealer DO: auto-set to current gate POI (depot/factory)
        │     │     └── Supplier PO: Supplier site (FK from party)
        │     ├── Destination POI:
        │     │     ├── Dealer DO: Dealer site (FK from party)
        │     │     └── Supplier PO: current gate POI (factory/depot)
        │     └── Vehicle Type: default = 'Covered Truck' (editable)
        │
        └── [Create TO & Gate-In]
              └─► Backend:
                    ├─► Create TransportOrder:
                    │     ├─► source = 'GATE'
                    │     ├─► transfer_type = 'FG_DEALER_OUTBOUND' (Dealer) or 'RM_SUPPLIER_INBOUND' (Supplier)
                    │     └─► Emit TO_CREATED event to TLS-01
                    │
                    └─► Create GateVisitSession + GateIn (gate_in_at = now)
                          └─► Success: redirect to Active Visits
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

### 2.1 GateVisitSession (new model — extends `TenantAwareModel`)

The session container that tracks a vehicle's full visit lifecycle at a POI.

```python
GateVisitSession(TenantAwareModel) {
    id: UUID (PK)

    # Core links
    transport_order: FK → TransportOrder (nullable)  # null until TO linked (on-demand may link after creation)
    poi: FK → POI                                    # Gate location
    vehicle: FK → Vehicle                            # Vehicle for this visit

    # Status
    status: enum ['active', 'closed']                # closed when GateOut record created

    # Metadata
    created_by: FK → User (Gateman)
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Cannot create a new active session for same vehicle at same POI if one already exists
- Status transitions: `active` → `closed` (on gate-out creation)

### 2.2 GateIn (new model — extends `TenantAwareModel`)

Separate model capturing all gate-in details per PRD §6.10.1.

```python
GateIn(TenantAwareModel) {
    id: UUID (PK)

    # Links
    gate_visit_session: FK → GateVisitSession (OneToOne)
    transport_order: FK → TransportOrder (nullable)  # linked TO (planner or gate-created)
    vehicle: FK → Vehicle

    # Document context (per PRD §6.10.1)
    document_category: enum [
        'supplier_po',          # Supplier (PO) → Inbound QC Workflow
        'port',                 # Port → Inbound QC Workflow
        'dealer_do',            # Dealer (DO) → Outbound FG Workflow
        'distributor',          # Distributor (PO/DO) → Outbound FG Workflow
        'internal_transfer'     # Internal Transfer (TO/Challan) → TO-Linked Workflow
    ]
    document_number: string (max 50)    # challan/TO/PO/DO number

    # Gate-in fields (per PRD)
    product_details: text (nullable)    # gate-in item description
    quantity: Decimal (nullable)        # nullable for empty vehicles
    gate_in_at: DateTime                # entry timestamp
    driver_name: string (max 100)
    driver_contact: string (max 20)
    party_name: string (max 200, nullable)
    project_from_info: string (max 200, nullable)
    remarks: text (nullable)            # discrepancy notes

    # Metadata
    created_by: FK → User (Gateman)
    created_at: DateTime
    updated_at: DateTime
}
```

### 2.3 GateOut (new model — extends `TenantAwareModel`)

Separate model capturing gate-out details with guard matrix enforcement.

```python
GateOut(TenantAwareModel) {
    id: UUID (PK)

    # Links
    gate_visit_session: FK → GateVisitSession (OneToOne)
    transport_order: FK → TransportOrder
    vehicle: FK → Vehicle

    # Gate-out timestamps
    gate_out_at: DateTime               # exit timestamp

    # Clearance flags (computed on save_model validation)
    scale_out_completed: boolean
    loading_completed: boolean (nullable)     # FG outbound
    unloading_completed: boolean (nullable)   # FG inbound, RM inbound
    qc_not_failed: boolean (nullable)         # RM inbound only

    # Remarks
    remarks: text (nullable)            # gateman notes at exit

    # Metadata
    created_by: FK → User (Gateman)
    created_at: DateTime
    updated_at: DateTime
}
```

**Guard matrix enforcement in `save_model`**:
- FG outbound: `scale_out_completed` AND `loading_completed` required
- FG inbound: `scale_out_completed` AND `unloading_completed` required
- RM inbound: `scale_out_completed` AND `unloading_completed` AND `qc_not_failed` required
- On save: sets `GateVisitSession.status = 'closed'`

### 2.4 GateActivityLog (new model — extends `TenantAwareModel`)

Audit log for all gate operations (GT-01-12).

```python
GateActivityLog(TenantAwareModel) {
    id: UUID (PK)

    # Context
    gate_visit_session: FK → GateVisitSession (nullable)
    poi: FK → POI
    action: enum [
        'gate_in',
        'gate_out',
        'remark_added',
        'on_demand_to_created'
    ]

    # Audit fields
    actor: FK → User
    timestamp: DateTime
    details: JSONField (nullable)       # action-specific payload (document category, TO number, etc.)

    # Metadata
    created_at: DateTime
}
```

### 2.5 Extensions to TransportOrder (existing model — GT-02)

New fields for Sprint 4 gate-originated TOs:

```python
TransportOrder {
    # ... existing fields ...

    source: enum ['PLANNER', 'GATE']
    # Sprint 3 TOs = 'PLANNER'; GT-02 TOs = 'GATE'

    transfer_type: enum [
        'FG_DEALER_OUTBOUND',       # Dealer DO → finished goods outbound
        'RM_SUPPLIER_INBOUND',      # Supplier PO → raw material inbound
    ] (nullable)
    # Only set for gate-originated TOs; planner TOs use existing flow_type
}
```

---

## 3. Document Category Routing (GT-01 AC-2)

At gate-in, the **document category** determines which operational flow the visit is routed to:

| Document Category | Operational Flow | QC Required | Sprint 4 Status |
|-------------------|-----------------|:-----------:|-----------------|
| `Supplier (PO)` | Inbound QC Workflow | Yes | **Feature flag** |
| `Port` | Inbound QC Workflow | Yes | **Feature flag** |
| `Dealer (DO)` | Outbound FG Workflow | No | **Feature flag** |
| `Distributor (PO/DO)` | Outbound FG Workflow | No | **Feature flag** |
| `Internal Transfer (TO/Challan)` | TO-Linked Workflow | No (unless RM) | **E2E priority** |

**Sprint 4 E2E prioritises Internal Transfer (TO/Challan)** — this path aligns with TLS-01 and POD-01 end-to-end flows. Supplier and Dealer/Distributor flows are toggled by **feature flag** per GT-01 Business Context.

### Routing logic (service layer)

```python
def resolve_operational_flow(document_category: str) -> str:
    routing = {
        'supplier_po': 'inbound_qc',
        'port': 'inbound_qc',
        'dealer_do': 'outbound_fg',
        'distributor': 'outbound_fg',
        'internal_transfer': 'to_linked',
    }
    return routing[document_category]
```

Feature flag check wraps the gate-in service: if the resolved flow is not `to_linked` and the flag is off, the gate-in is rejected with a user-facing message.

---

## 4. Gate-In Flow (GT-01)

### 4.0 TO eligibility for gate-in entry (flow lane × `TransportOrder.status`)

Gate-in for **planner-created / TO-linked** visits is allowed only when the TO is in the **lane-specific in-transit status** that follows driver execution start (DM-01 §6.8.1.7). This is the yard counterpart to the driver’s first post-dispatch transition (`Dispatched` → in transit).

| Flow lane (`TransportOrder.flow_lane`) | Gate POI must match | Required `TransportOrder.status` before gate-in | After successful gate-in (`TO.status` →) |
|----------------------------------------|---------------------|--------------------------------------------------|------------------------------------------|
| **FG outbound** (`fg_outbound`) | `origin_poi` | `in_transit_source` (In Transit – Source) | `at_source` |
| **FG inbound** (`fg_inbound`) | `destination_poi` | `in_transit_destination` (In Transit – Destination) | `at_destination` |
| **RM inbound** (`rm_inbound`) | `destination_poi` | `in_transit_destination` (In Transit – Destination) | `at_destination` |

**Canonical constants** (single source of truth — shared with driver start transitions in `apps/transport/constants.py`):

```python
# Gate-in: TO must already be in transit before yard records physical entry.
GATE_IN_ELIGIBLE_TO_STATUSES: dict[str, list[str]] = {
    FlowLane.FG_OUTBOUND: [TOStatus.IN_TRANSIT_SOURCE],
    FlowLane.FG_INBOUND: [TOStatus.IN_TRANSIT_DESTINATION],
    FlowLane.RM_INBOUND: [TOStatus.IN_TRANSIT_DESTINATION],
}

# Post gate-in: advance TLS-01 execution status (yard actor).
GATE_IN_SUCCESS_TO_STATUS: dict[str, str] = {
    FlowLane.FG_OUTBOUND: TOStatus.AT_SOURCE,
    FlowLane.FG_INBOUND: TOStatus.AT_DESTINATION,
    FlowLane.RM_INBOUND: TOStatus.AT_DESTINATION,
}
```

**Service-layer validation** (`apps/operations/gate/services.py` — `GateInService`):

```python
def validate_to_eligible_for_gate_in(
    to: TransportOrder,
    *,
    gate_poi_id,
) -> None:
    """
    Raises ValidationError with a gateman-readable message when:
    - flow_lane is missing or unknown
    - TO.status is not in GATE_IN_ELIGIBLE_TO_STATUSES[flow_lane]
    - gate_poi is not the correct leg POI for the lane (origin vs destination)
    - an active GateVisitSession already exists for this TO at this POI
    """
```

**Exemptions**

- **GT-02 on-demand TO**: gate-in is recorded in the same transaction as TO creation (`status='created'`). Eligibility rules above apply only to **existing** planner TOs looked up at the gate.
- **Feature-flagged Dealer/Supplier paths** without a pre-existing TO: eligibility is satisfied by creating the TO first (GT-02), then gate-in.

**Typical sequence (FG outbound at source)**

```
Ready for Dispatch → (supervisor dispatch) → Dispatched
  → (driver: execution started) → in_transit_source
    → (gateman: gate-in at origin POI) → at_source → scale-in → …
```

### 4.1 TO-First Entry (Planner TO exists — Internal Transfer path)

```
Gateman opens Gate-In form
  └─► Enters vehicle registration (required)
        └─► Selects document category: Internal Transfer (TO/Challan)
              └─► Enters TO/Challan number (or selects TO via autocomplete — queryset pre-filtered)
                    └─► Backend lookup: TransportOrder.objects.get(to_number=...)
                          ├─► If found:
                          │     ├─► GateInService.validate_to_eligible_for_gate_in(to, gate_poi_id=session POI)
                          │     │     ├─► flow_lane + status in GATE_IN_ELIGIBLE_TO_STATUSES
                          │     │     └─► POI = origin (FG outbound) or destination (FG/RM inbound)
                          │     ├─► Validate vehicle matches assigned vehicle on TO (warn + supervisor override if mismatch)
                          │     ├─► Pre-fill: product details, quantity from TO
                          │     ├─► Gateman enters: driver name, driver contact, party name, project/from info, remarks
                          │     └─► [Submit Gate-In]
                          │           └─► Create GateVisitSession + GateIn record
                          │                 └─► GateInService.record_gate_in(to):
                          │                       ├─► TO.status → GATE_IN_SUCCESS_TO_STATUS[flow_lane]
                          │                       └─► Emit GATE_IN event (TLS-01 timeline; actor=gate)
                          │                             └─► Log GateActivityLog(action='gate_in')
                          │                                   └─► Success redirect: Active Visits
                          │
                          └─► If not found:
                                └─► Error: "TO not found. [Create On-Demand TO]" button enabled (GT-02)
                          └─► If found but wrong status / POI:
                                └─► ValidationError, e.g. "TO must be In Transit – Source at this POI before gate-in (FG outbound)."
```

### 4.2 Dealer/Supplier Entry (feature-flagged — GT-02 on-demand path)

```
Gateman opens Gate-In form
  └─► Enters vehicle registration (required)
        └─► Selects document category: Dealer (DO) or Supplier (PO)
              └─► Feature flag check:
                    ├─► If flag OFF: "This document category is not yet enabled. Contact admin."
                    └─► If flag ON:
                          └─► Enters DO/PO number
                                └─► System checks for existing TO
                                      ├─► If TO exists: proceed with standard gate-in
                                      └─► If no TO: [Create On-Demand TO] → GT-02 wizard
```

### 4.3 On-Demand TO Creation (GT-02)

```
Gateman clicks [Create On-Demand TO] from Gate-In form
  └─► GT-02 Wizard opens
        ├─► Step 1: Path Type selection
        │     ├─► Dealer DO Outbound (FG delivery to dealer)
        │     └─► Supplier PO Inbound (RM receipt from supplier)
        │
        ├─► Step 2: Document & Party Details
        │     ├─► Dealer DO path:
        │     │     ├─► DO Number (required)
        │     │     ├─► Dealer Name (dropdown from MDM)
        │     │     ├─► FG Product (item code lookup)
        │     │     ├─► Planned Quantity (MT)
        │     │     ├─► Driver Name, Driver Contact
        │     │     └─► Remarks (optional)
        │     │
        │     └─► Supplier PO path:
        │           ├─► PO Number (required)
        │           ├─► Supplier Name (dropdown from MDM)
        │           ├─► RM Product (item code lookup)
        │           ├─► Expected Quantity (MT)
        │           ├─► Driver Name, Driver Contact
        │           └─► Remarks (optional)
        │
        ├─► Step 3: Routing (auto-derived from path type)
        │     ├─► Dealer DO:
        │     │     ├─► Source POI: current gate POI (depot/factory)
        │     │     └─► Destination POI: Dealer site (FK from party)
        │     └─► Supplier PO:
        │           ├─► Source POI: Supplier site (FK from party)
        │           └─► Destination POI: current gate POI (factory/depot)
        │
        └─► [Create TO & Gate-In]
              └─► Backend:
                    ├─► Create TransportOrder:
                    │     ├─► to_number = auto-generate ('TO-YYYYMMDD-XXXX')
                    │     ├─► source = 'GATE'
                    │     ├─► transfer_type = 'FG_DEALER_OUTBOUND' or 'RM_SUPPLIER_INBOUND'
                    │     ├─► fleet_type = 'own' (default)
                    │     ├─► status = 'created'
                    │     ├─► origin_poi, destination_poi from wizard
                    │     ├─► allocated_quantity_mt = expected_quantity_mt
                    │     ├─► QC linkage flag set (Supplier PO path)
                    │     └─► No TR link, no TDO assignment required
                    │
                    ├─► Emit TO_CREATED lifecycle event (TLS-01)
                    │
                    ├─► Feature-flagged stock check stub (Dealer path — AC-3):
                    │     └─► If inventory module ready: validate FG stock availability
                    │     └─► Otherwise: manual confirm + audit log
                    │
                    ├─► Create GateVisitSession + GateIn (gate_in_at = now)
                    │
                    └─► Log GateActivityLog(action='on_demand_to_created')
                          └─► Success: redirect to Active Visits
```

---

## 4.5 Full TO status chain per lane (gate-in → gate-out)

The table below is the authoritative per-lane TO status progression for the **yard chain**. Every module (Gate, Scale, Command Center, Loading, QC) advances `TO.status` one step by calling the TLS-01 event ingest service — no module skips steps.

| Step | FG outbound | FG inbound | RM inbound |
|------|------------|-----------|-----------|
| Pre-gate-in (driver started) | `in_transit_source` | `in_transit_destination` | `in_transit_destination` |
| **Gate-in recorded** (GT-01) | → `at_source` | → `at_destination` | → `at_destination` |
| Scale-in completed (SC-01) | `at_source` (sub: scale_in) | `at_destination` (sub: scale_in) | `at_destination` (sub: scale_in) |
| **Scale-in → CC queue release** | sub: waiting_cc | sub: waiting_cc | sub: waiting_cc → **CC flags for QC** |
| **QC: sample + pass** (RM only) | — | — | sub: `qc_passed` (QC records Pass/Fail only) |
| CC assigns L/U point (CC-01) | `at_source` (sub: `assigned_loading_point`) | `at_destination` (sub: `assigned_unloading_point`) | `at_destination` (sub: `assigned_unloading_point`; **after QC Pass**) |
| Loading completed (LD-01) | sub: loading_completed | — | — |
| Unloading completed (LD-01) | — | sub: unloading_completed | sub: unloading_completed |
| Scale-out completed (SC-01) | → `in_transit_destination` | → `delivered_unloaded` | → `delivered_unloaded` |
| **Gate-out recorded** (GT-01) | sub: gate_out_source (FG outbound origin gate exit → vehicle now **in_transit_destination**) | sub: gate_out_destination | sub: gate_out_destination |
| POD submitted + closure (POD-01) | → `completed` → `closed` | → `completed` → `closed` | → `completed` → `closed` |

**Key notes:**

- **FG outbound**: After scale-out at the source POI the TO advances to `in_transit_destination`. The vehicle leaves the source gate and will arrive at destination (where it is an **FG inbound** visit). The gate-out at source records `gate_out_source` sub-state.
- **RM inbound / FG inbound**: After scale-out the TO advances to `delivered_unloaded`. Gate-out at destination records `gate_out_destination` sub-state.
- **RM inbound QC**: Command Center flags the TO for QC visibility *before* assigning an unloading point. QC Supervisor records Pass/Fail; on Pass the **CC Officer** assigns the unloading point (CC-01). If QC fails, gate-out is blocked (see §9.4).
- Sub-states above are carried in `TOStatusTransitionLog.to_sub_state` (TLS-01 schema) and are not exposed as top-level `TO.status` values.

---

## 5. Gate-Out Flow (GT-01)

### 5.1 Guard Matrix (GT-01 AC-3)

| Flow Lane | Scale-Out Completed | Loading Completed | Unloading Completed | QC Not Failed |
|-----------|:-------------------:|:-----------------:|:-------------------:|:-------------:|
| **FG outbound** | ✓ Required | ✓ Required | — | — |
| **FG inbound** | ✓ Required | — | ✓ Required | — |
| **RM inbound** | ✓ Required | — | ✓ Required | ✓ Required |

**TO.status required for gate-out lookup (GateOutAdmin queryset filter)**:

| Flow Lane | Gate-out available when `TO.status` is |
|-----------|----------------------------------------|
| FG outbound (at origin) | `in_transit_destination` (scale-out at source has already advanced the status) |
| FG inbound (at destination) | `delivered_unloaded` |
| RM inbound (at destination) | `delivered_unloaded` |

### 5.2 Exit Validation & Clearance Checks

```
Gateman opens Gate-Out form
  └─► Enters TO Number
        └─► Backend lookup: GateVisitSession with active status + matching TO + no GateOut record
              ├─► If not found: Error "No active visit for this TO"
              │
              └─► If found:
                    ├─► Display visit summary: Vehicle, Driver, Gate-In Time, Dwell Time, Current TO Status
                    │
                    ├─► Guard Matrix Checks (GateOutService — called from save_model):
                    │     │
                    │     ├─► FG Outbound:
                    │     │     ├─► Scale-out completed? → WeighingSession.scale_out_completed = True
                    │     │     └─► Loading completed? → LoadEvent.end_datetime not null
                    │     │
                    │     ├─► FG Inbound:
                    │     │     ├─► Scale-out completed? → WeighingSession.scale_out_completed = True
                    │     │     └─► Unloading completed? → UnloadEvent.end_datetime not null
                    │     │
                    │     └─► RM Inbound:
                    │           ├─► Scale-out completed? → WeighingSession.scale_out_completed = True
                    │           ├─► Unloading completed? → UnloadEvent.end_datetime not null
                    │           └─► QC not failed? → QCDecision.decision != 'fail' (must exist + passed)
                    │
                    │     └─► Any check fails → ValidationError naming the blocking step
                    │
                    ├─► Gateman enters exit remarks (optional)
                    │
                    └─► [Submit Gate-Out]
                          └─► Create GateOut record (gate_out_at = now, clearance flags, remarks)
                                └─► GateVisitSession.status = 'closed'
                                      └─► GateOutService.record_gate_out(to, poi):
                                            ├─► FG outbound at origin POI:
                                            │     └─► Emit GATE_OUT_SOURCE event (TLS-01)
                                            │           (TO already at in_transit_destination from scale-out step)
                                            └─► FG inbound / RM inbound at destination POI:
                                                  └─► Emit GATE_OUT_DESTINATION event (TLS-01)
                                                        └─► Log GateActivityLog(action='gate_out')
                                                              └─► Remove from Active Visits → Visit History
```

---

## 6. Django Admin Configuration

### 6.1 GateInAdmin (GT-01-2, GT-01-3)

Uses `TenantOnlyAdminMixin`. **Business rules live in `GateInService`**; admin stays thin (validate → delegate → message user).

**Change Form**:
- `autocomplete_fields = ["transport_order", "vehicle"]` (or raw `to_number` + hidden FK pattern if UX prefers challan field)
- **TO queryset restriction** — `formfield_for_foreignkey` on `transport_order`:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "transport_order":
        poi = get_gate_poi_for_request(request)  # tenant + gateman's assigned POI
        kwargs["queryset"] = (
            TransportOrder.objects.filter(tenant=request.tenant)
            .filter(
                Q(flow_lane=FlowLane.FG_OUTBOUND, origin_poi=poi, status=TOStatus.IN_TRANSIT_SOURCE)
                | Q(
                    flow_lane__in=(FlowLane.FG_INBOUND, FlowLane.RM_INBOUND),
                    destination_poi=poi,
                    status=TOStatus.IN_TRANSIT_DESTINATION,
                )
            )
            .exclude(
                gate_visit_sessions__poi=poi,
                gate_visit_sessions__status=GateVisitStatus.ACTIVE,
            )
            .select_related("origin_poi", "destination_poi", "assigned_vehicle")
            .order_by("-updated_at")
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only helpers on change form** (after TO selected): `flow_lane_badge`, `to_status_badge`, `eligible_gate_in_hint` (e.g. “FG outbound — requires In Transit – Source at origin POI”)
- Vehicle registration validation in `save_model` → `GateInService.validate_vehicle_match(...)` (warn + supervisor override on mismatch)
- Document category routing → `GateInService.resolve_operational_flow(...)`:
  - `Internal Transfer` → active (Sprint 4 E2E)
  - `Dealer (DO)` / `Supplier (PO)` / `Distributor` → feature-flag gated
- Inline for gate-in items (product, quantity)
- `save_model`:
  1. `GateInService.validate_to_eligible_for_gate_in(to, gate_poi_id=...)`
  2. `GateInService.create_visit_and_gate_in(...)` — sets `gate_in_at`, creates `GateVisitSession`, advances `TO.status`, emits TLS-01 event
  3. `GateActivityLog` via service (not duplicated in admin)
- `clean()` on `GateInAdminForm` mirrors service rules for immediate form errors (admin double-validation pattern used elsewhere in DFMS)

**List View**:
- Columns: TO Number, Vehicle Registration, Document Category, Gate-In Time, Driver Name, Party Name, Created By
- Filters: `document_category`, `gate_in_at` (date range), `poi`
- Search: TO number, Vehicle registration, Document number

**Detail View**:
- Read-only: TO (link), Vehicle (link), POI
- Editable (within 1 hour): Gate-In Time
- Read-only after 1 hour: all timestamps
- Remarks: editable by Gateman who created the record

### 6.2 GateOutAdmin (GT-01-4)

Uses `TenantOnlyAdminMixin`. **Business rules live in `GateOutService`**; admin stays thin.

**Change Form**:
- **GateVisitSession / TO queryset restriction** — `formfield_for_foreignkey` shows only sessions with `status='active'` and no existing GateOut, scoped to the gateman's POI:

```python
def formfield_for_foreignkey(self, db_field, request, **kwargs):
    if db_field.name == "gate_visit_session":
        poi = get_gate_poi_for_request(request)
        kwargs["queryset"] = (
            GateVisitSession.objects.filter(poi=poi, status=GateVisitStatus.ACTIVE)
            .exclude(gate_out__isnull=False)
            .select_related("transport_order", "vehicle")
            .order_by("-created_at")
        )
    return super().formfield_for_foreignkey(db_field, request, **kwargs)
```

- **Read-only info panel**: on selecting a session, display Vehicle, Driver, Gate-In Time, Dwell Time, Current TO Status badge, Guard Matrix status (✓/pending per lane)
- Guard matrix enforcement in `save_model` → `GateOutService.validate_guard_matrix(session)`:
  - FG outbound: `WeighingSession.scale_out_completed` + `LoadEvent.end_datetime not null`
  - FG inbound: `WeighingSession.scale_out_completed` + `UnloadEvent.end_datetime not null`
  - RM inbound: all of above + `QCDecision.decision = 'pass'` (must exist and be pass)
- `get_readonly_fields` locks completed records (once GateOut saved, all fields read-only)

**List View**:
- Columns: TO Number, Vehicle, Gate-Out Time, Scale-Out Done, Loading/Unloading Done, QC Status, Created By
- Filters: `gate_out_at` (date range), `poi`
- Search: TO number, Vehicle registration

**Detail View**:
- Clearance flags displayed: Scale-Out (✓/✗), Loading (✓/✗/N/A), Unloading (✓/✗/N/A), QC (✓/✗/N/A)
- Read-only: all fields after gate-out is recorded
- Custom admin action: **"View TO Timeline"** (redirect to TLS-01 timeline view)

### 6.3 GateVisitSession Admin

**List View**:
- Columns: TO Number, Vehicle, POI, Status (Active/Closed), Gate-In Time (from GateIn), Gate-Out Time (from GateOut), Dwell Time (computed), Created By
- Filters: `poi`, `status`, creation date range
- Search: TO number, Vehicle registration

**Status Badge**:
- Green: Closed (GateOut record exists)
- Yellow: Active (no GateOut record)

**Detail View**:
- Read-only: TO (link), Vehicle (link), POI, Status
- Inline: GateIn (read-only), GateOut (read-only), related ScaleRecord, BayAssignment, LoadingOperation

### 6.4 OnDemandTOAdmin (GT-02-2, GT-02-3)

Uses `TenantOnlyAdminMixin`.

**Dealer DO form** (GT-02-2):
- `save_model` creates FG TO with `transfer_type=FG_DEALER_OUTBOUND`
- Generates unique TO number
- Links to gate-in stub/session

**Supplier PO form** (GT-02-3):
- `save_model` creates RM TO with `transfer_type=RM_SUPPLIER_INBOUND`
- Sets QC linkage flag
- Links to gate session

### 6.5 GateActivityLog Admin (GT-01-12)

**List View**:
- Columns: Action, POI, Actor, Timestamp, Session (link), Details (truncated)
- Filters: `action`, `poi`, `timestamp` (date range)
- Search: Actor name, Session ID

**Detail View**:
- Read-only: all fields
- JSON details rendered as formatted key-value pairs

---

## 7. API Endpoints

### 7.1 Gate-In (GT-01-5, GT-01-6)

```http
POST   /api/v1/gate/gate-in
       → Create gate-in record
       → Body: {
           vehicle_registration: "DHK-1234" (required),
           document_category: "internal_transfer" | "supplier_po" | "dealer_do" | "distributor" | "port",
           document_number: "TO-20260512-0042",
           product_details: "FG Item A" (nullable),
           quantity: 50.0 (nullable),
           driver_name: "John Doe",
           driver_contact: "+8801712345678",
           party_name: "ABC Corp" (nullable),
           project_from_info: "Factory A" (nullable),
           remarks: "Vehicle front bumper dent noted" (nullable)
         }
       → Validations (TO-linked):
           - `GateInService.validate_to_eligible_for_gate_in` (§4.0): lane × status × POI
           - Vehicle registration match (warn / override policy)
           - No duplicate active visit at POI
       → Side effects:
           - Create GateVisitSession + GateIn
           - `TO.status` → `GATE_IN_SUCCESS_TO_STATUS[flow_lane]` (if TO-linked)
           - Emit GATE_IN event to TLS-01
           - Create GateActivityLog entry
       → Response: {
           gate_in_id,
           gate_visit_session_id,
           transport_order: {to_number, status} (nullable),
           gate_in_at,
           document_category,
           message: "Gate-in recorded."
         }

GET    /api/v1/gate/gate-in?date=&vehicle=&doc_category=&to_number=&search=
       → List gate-in records
       → Filters: date (date range), vehicle (registration), doc_category, to_number, search (text)
       → Response: paginated list of gate-in records

GET    /api/v1/gate/gate-in/{gate_in_id}
       → Gate-in detail
```

### 7.2 Gate-Out (GT-01-7, GT-01-8)

```http
POST   /api/v1/gate/gate-out
       → Record gate-out with guard matrix enforcement
       → Body: {
           gate_visit_session_id: UUID,
           remarks: "All clear" (nullable)
         }
       → Validations (guard matrix per flow type):
           - FG outbound: scale-out completed + loading completed
           - FG inbound: scale-out completed + unloading completed
           - RM inbound: scale-out completed + unloading completed + QC not failed
       → Side effects:
           - Create GateOut record
           - Update GateVisitSession.status = 'closed'
           - Update TO.execution_state
           - Emit GATE_OUT event to TLS-01
           - Create GateActivityLog entry
       → Response: {
           gate_out_id,
           gate_visit_session_id,
           gate_out_at,
           dwell_time_minutes: 120,
           clearance: {scale_out: true, loading: true, qc: null},
           message: "Gate-out recorded."
         }

GET    /api/v1/gate/gate-out?date=&vehicle=&search=
       → List gate-out records

GET    /api/v1/gate/gate-out/{gate_out_id}
       → Gate-out detail
```

### 7.3 Visit Session (GT-01)

```http
GET    /api/v1/gate/visit-sessions/{session_id}
       → Full visit session detail (GateIn + GateOut + timeline)
       → Response: {
           session_id,
           status: "active" | "closed",
           transport_order: {to_number, status, execution_state},
           vehicle: {registration},
           gate_in: {gate_in_at, document_category, document_number, driver_name, ...},
           gate_out: {gate_out_at, clearance, remarks} (nullable),
           dwell_time_minutes,
           activity_log: [...]
         }
```

### 7.4 On-Demand TO Creation (GT-02-4, GT-02-5, GT-02-6)

```http
POST   /api/v1/gate/on-demand-to/dealer
       → Create FG TO from Dealer DO
       → Body: {
           do_number: "DO-2026-1234",
           dealer_name: "ABC Dealer",
           product_id: UUID,
           planned_quantity_mt: 50.0,
           driver_name: "John Doe",
           driver_contact: "+8801712345678",
           remarks: "Urgent delivery" (nullable)
         }
       → Side effects:
           - Create TransportOrder (source='GATE', transfer_type='FG_DEALER_OUTBOUND')
           - Feature-flagged stock check (AC-3): stub with manual confirm if inventory module not ready
           - Create GateVisitSession + GateIn
           - Emit TO_CREATED event to TLS-01
           - Create GateActivityLog(action='on_demand_to_created')
       → Response: {
           transport_order: {to_id, to_number, transfer_type: "FG_DEALER_OUTBOUND"},
           gate_visit_session_id,
           gate_in_at,
           message: "Dealer TO created and gate-in recorded."
         }

POST   /api/v1/gate/on-demand-to/supplier
       → Create RM TO from Supplier PO
       → Body: {
           po_number: "PO-2026-5678",
           supplier_name: "XYZ Supplier",
           product_id: UUID,
           expected_quantity_mt: 25.0,
           driver_name: "Jane Doe",
           driver_contact: "+8801798765432",
           remarks: "Scheduled delivery" (nullable)
         }
       → Side effects:
           - Create TransportOrder (source='GATE', transfer_type='RM_SUPPLIER_INBOUND')
           - Set QC linkage flag for inbound workflow
           - Create GateVisitSession + GateIn
           - Emit TO_CREATED event to TLS-01
           - Create GateActivityLog(action='on_demand_to_created')
       → Response: {
           transport_order: {to_id, to_number, transfer_type: "RM_SUPPLIER_INBOUND"},
           gate_visit_session_id,
           gate_in_at,
           message: "Supplier TO created and gate-in recorded."
         }

GET    /api/v1/gate/on-demand-to?source=GATE&transfer_type=&date=&search=
       → List on-demand TOs
       → Filters: source (default GATE), transfer_type (FG_DEALER_OUTBOUND / RM_SUPPLIER_INBOUND), date, search

GET    /api/v1/gate/on-demand-to/{to_id}
       → On-demand TO detail
```

---

## 8. Business Rules

### 8.0 TO status eligibility for gate-in (GT-01 — TO-linked)

| Flow lane | Gate-in allowed when `TO.status` is | Gate POI | Blocked example message |
|-----------|-------------------------------------|----------|-------------------------|
| FG outbound | `in_transit_source` | `origin_poi` | “TO is not In Transit – Source. Driver must start execution before gate-in.” |
| FG inbound | `in_transit_destination` | `destination_poi` | “TO is not In Transit – Destination.” |
| RM inbound | `in_transit_destination` | `destination_poi` | Same as FG inbound |

- Constants: `GATE_IN_ELIGIBLE_TO_STATUSES` / `GATE_IN_SUCCESS_TO_STATUS` in `apps/transport/constants.py` (§4.0).
- **Do not** gate on `Ready for Dispatch` or `Dispatched` alone — driver must complete the first in-transit milestone first.
- Wrong POI for lane (e.g. FG outbound TO selected at destination gate): reject with POI-specific message.
- Same validation in **admin**, **REST API**, and any future Gateman UI (single service).

### 8.1 Gate-In Fields (per PRD §6.10.1)

| Field | Required | Notes |
|-------|:--------:|-------|
| Vehicle Registration | ✓ | Max 15 chars, alphanumeric + dash |
| Document Category | ✓ | Enum: supplier_po, port, dealer_do, distributor, internal_transfer |
| Document Number | ✓ | Challan/TO/PO/DO number (max 50 chars) |
| Product Details | — | Gate-in item description |
| Quantity | — | Nullable for empty vehicles |
| Date/Time | ✓ | Auto-set to now |
| Driver Name | ✓ | Max 100 chars |
| Driver Contact | ✓ | Valid phone format |
| Party Name | — | Supplier/dealer/distributor name |
| Project / From Info | — | Source context |
| Remarks | — | Discrepancies, visual inspection notes |

### 8.2 Gate-Out Guard Matrix (GT-01 AC-3)

| Flow Lane | Scale-Out Completed | Loading Completed | Unloading Completed | QC Not Failed |
|-----------|:-------------------:|:-----------------:|:-------------------:|:-------------:|
| FG outbound | ✓ | ✓ | — | — |
| FG inbound | ✓ | — | ✓ | — |
| RM inbound | ✓ | — | ✓ | ✓ |

Clearance check on gate-out:
- If any required condition not met → ValidationError, gate-out blocked
- Gateman sees error message identifying the missing step

### 8.3 On-Demand TO Defaults (GT-02)

**Dealer DO path** (AC-1 — `transfer_type=FG_DEALER_OUTBOUND`):
- `source = 'GATE'`
- `transfer_type = 'FG_DEALER_OUTBOUND'`
- `origin_poi = current_gate_poi` (depot/factory)
- `destination_poi = dealer_site` (from party FK)
- `fleet_type = 'own'` (default)
- `status = 'created'`, `execution_state = 'gate_in_source'`
- No TR link, no TDO assignment required
- Feature-flagged stock check: validate FG inventory availability when stock service exists; otherwise stub with manual confirm + audit

**Supplier PO path** (AC-2 — `transfer_type=RM_SUPPLIER_INBOUND`):
- `source = 'GATE'`
- `transfer_type = 'RM_SUPPLIER_INBOUND'`
- `origin_poi = supplier_site` (from party FK)
- `destination_poi = current_gate_poi` (factory/depot)
- `fleet_type = 'own'` (default)
- `status = 'created'`, `execution_state = 'gate_in_destination'`
- QC linkage flag set for inbound workflow
- No TR link, no TDO assignment required

### 8.4 Duplicate Visit Prevention

- System checks: "Does an active GateVisitSession already exist for this vehicle at this POI?"
- If yes: Error "Vehicle already gate-in at this POI. Complete gate-out first."
- If no: Proceed with gate-in

### 8.5 Feature Flag Gating

Sprint 4 E2E prioritises **Internal Transfer (TO/Challan)**. Other document category paths are behind a feature flag:

| Document Category | Feature Flag | Default |
|-------------------|-------------|---------|
| Internal Transfer (TO/Challan) | None (always active) | Active |
| Dealer (DO) | `gate.dealer_do_enabled` | Off |
| Supplier (PO) | `gate.supplier_po_enabled` | Off |
| Distributor (PO/DO) | `gate.distributor_enabled` | Off |
| Port | `gate.port_enabled` | Off |

---

## 9. Integration Points

### 9.1 With Transport Lifecycle (TLS-01)

**Gate events write to timeline**:
- Gate-in: Emit `GATE_IN` lifecycle event with timestamp and actor (GT-01-9)
- Gate-out: Emit `GATE_OUT` lifecycle event with timestamp and actor (GT-01-9)
- On-demand TO creation: Emit `TO_CREATED` lifecycle event (GT-02-8)

### 9.2 With Scaling (SC-01)

**Gate-in triggers scale queue**:
- After gate-in, visit appears in Scaling Operator's queue (SC-01)
- Scale-in creates `ScaleRecord(gate_visit_session=visit)`

**Gate-out requires scale-out**:
- Guard matrix checks `ScaleRecord.scale_out_at not null`

### 9.3 With Command Center (CC-01)

**Post-scale queue visibility**:
- After scale-in, visit appears in Command Center queue (CC-01)
- CC assigns bay (BayAssignment → gate_visit_session FK)

### 9.4 With QC (QC-01)

**QC requirement enforcement (RM inbound only)**:
- Gate-out guard matrix checks `TOQCCheckpoint.qc_passed != False`
- If QC failed or pending, gate-out blocked: "QC decision pending or failed. Cannot exit."

### 9.5 With Driver Mobile (DM-01)

**Prerequisite chain**:
- Supervisor dispatch → `Dispatched`
- Driver **execution started** (DM-01) → `in_transit_source` (FG outbound) or `in_transit_destination` (FG/RM inbound) — see `FIRST_DRIVER_TRANSITION` in `apps/transport/constants.py`
- Only then is the TO eligible for **gate-in** (§4.0)

**Milestone complementarity**:
- Driver mobile does **not** replace yard gate-in for TLS-01 yard steps; gateman records authoritative gate-in via admin/API (GT-01)
- Both actors write to `TOExecutionEvent` timeline (TLS-01); gate-in advances `TO.status` to `at_source` / `at_destination`

---

## 10. Permissions & RBAC

### 10.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
Operations.Gate.Entry.Create
Operations.Gate.Exit.Write
Operations.Gate.Entry.Read
Operations.Gate.Remarks.Write
Operations.Gate.OnDemandTO.CreateDealer
Operations.Gate.OnDemandTO.CreateSupplier
```

### 10.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.Gate.View
Menu.Gate.OnDemandTO.View
```

### 10.3 Role → Permission Mapping

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

## 11. Validation Rules

### 11.1 Gate-In

- Vehicle registration required (max 15 chars, alphanumeric + dash)
- Document category required (must be valid enum value)
- Document number required (max 50 chars)
- For TO-linked flow:
  - TO must exist with `flow_lane` set
  - **Status gate (§4.0 / §8.0):**
    - FG outbound → `status == in_transit_source` and gate POI == `origin_poi`
    - FG inbound → `status == in_transit_destination` and gate POI == `destination_poi`
    - RM inbound → `status == in_transit_destination` and gate POI == `destination_poi`
  - On success → `TO.status` advances to `at_source` or `at_destination` per lane
  - Vehicle should match assigned vehicle on TO (warn + supervisor override)
- Cannot gate-in if active GateVisitSession already exists for same vehicle (or same TO) at same POI
- Feature-flagged categories rejected if flag is off

### 11.2 Gate-Out

- GateVisitSession must exist with status 'active' (no GateOut record)
- Guard matrix must pass per flow type (see §8.2)
- Scale-out must be done (`ScaleRecord.scale_out_at not null`)
- Loading/unloading must be done (per flow type)
- QC must not have failed (RM inbound only)

### 11.3 On-Demand TO (GT-02)

- Reference number required (DO# or PO#, unique per tenant per path type)
- Party (Dealer/Supplier) must exist in MDM
- Product must exist (MDM-01)
- Expected quantity > 0
- Driver name required (max 100 chars)
- Driver contact required (valid phone format)

---

## 12. Reports & Dashboards (Phase 2)

### 12.1 Gate Performance Metrics

- Average dwell time (gate-in to gate-out) per POI
- Peak entry hours (histogram)
- On-demand TO percentage (gate vs planner)
- Gate-out clearance block reasons (top 5)

### 12.2 Discrepancy Log

- Remarks containing keywords: "damage", "shortage", "discrepancy"
- Exportable for audit

---

## 13. Dependencies

### Upstream
- `05-transport`: TransportOrder model
- `02-master-data`: POI, Vehicle, Driver, Dealer, Supplier, Product

### Downstream
- `06-poi-operations/scaling`: Scale-in (SC-01)
- `06-poi-operations/command-center`: Queue visibility (CC-01)
- `06-poi-operations/qc`: QC checkpoint enforcement (QC-01)
- `05-transport/lifecycle`: Timeline events (TLS-01), closure (POD-01)

---

## 14. Sprint 4 Story Mapping

### GT-01 — Gate-In, Gate-Out & Remarks

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| GT-01-1 | Models + migration | GateVisitSession + GateIn + GateOut models (FK to TO, Vehicle; document category enum, remarks, driver fields) |
| GT-01-2 | GateInAdmin | TO autocomplete filtered by §4.0 eligibility; `GateInService` in `save_model`; lane/status badges; document category routing |
| GT-01-3 | GateInAdmin inline | Gate-in items (product, quantity); `save_model` sets timestamp + creates GateVisitSession |
| GT-01-4 | GateOutAdmin | Guard matrix in `save_model`; `get_readonly_fields` locks completed records |
| GT-01-5 | Gate-in REST API (POST) | Create gate-in with TO lookup + §4.0 status/POI validation + vehicle validation |
| GT-01-6 | Gate-in list/detail API (GET) | Filters: date, vehicle, doc_category, to_number, search |
| GT-01-7 | Gate-out REST API (POST) | Create gate-out with guard matrix enforcement |
| GT-01-8 | Gate-out list/detail API (GET) | Filters: date, vehicle, search |
| GT-01-9 | TLS-01 event emission | Emit GATE_IN / GATE_OUT events on save |
| GT-01-10 | Gateman UI | Fast-entry gate-in form |
| GT-01-11 | Gateman UI | Gate-out form with guard status indicators |
| GT-01-12 | GateActivityLog | Audit logging on gate-in, gate-out, and remarks |

### GT-02 — On-Demand TO Creation

| Sub-task | Scope | Implementation Focus |
|----------|-------|----------------------|
| GT-02-1 | Model extensions | `source=GATE` field, `transfer_type` enum on TO + migration |
| GT-02-2 | OnDemandTOAdmin (Dealer) | `save_model` creates FG TO with `transfer_type=FG_DEALER_OUTBOUND` |
| GT-02-3 | OnDemandTOAdmin (Supplier) | `save_model` creates RM TO with `transfer_type=RM_SUPPLIER_INBOUND` + QC flag |
| GT-02-4 | Dealer TO REST API (POST) | Validates DO number, dealer, product, quantity |
| GT-02-5 | Supplier TO REST API (POST) | Validates PO number, supplier, product, expected quantity |
| GT-02-6 | On-demand TO list/detail API (GET) | Filters: source=GATE, transfer_type, date, search |
| GT-02-7 | Session ↔ TO linkage service | Associates GateVisitSession with newly created TO |
| GT-02-8 | TLS-01 event emission | Emit `TO_CREATED` lifecycle event on gate-originated TO |
| GT-02-9 | Inventory/QC hooks | Feature-flagged stock check stub (Dealer); QC linkage flag (Supplier) |
| GT-02-10 | Gateman wizard UI | Dealer vs Supplier path selection, form fields, validation |
| GT-02-11 | GateOnDemandActivityLog | Audit logging on TO creation, linkage, validation overrides |

---

**Last Updated**: 2026-05-16  
**Related Modules**: [05-transport](../05-transport/README.md), [06-poi-operations](./README.md), [03-users/driver-interface](../03-users/driver-interface-sprint4.md)
