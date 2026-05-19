---
module: 06-poi-operations
specification: Gate Operations (Sprint 4 — TO-Centric)
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-19
changelog: "v2.4 — project_from_info required + origin_poi prefill; §6.1.1 visit summary card (GateVisitSummaryWidget); v2.3 — YARD-01 integration; v2.2 — GT-02 on-demand TO.status; v2.1 — §4.5 chain, §5.1 guards"
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
        ├── Transport Order: autocomplete (eligible in-transit TOs only)
        │     └─► On select, **visit summary card** (read-only; §6.1.1) shows:
        │           ├── Transport order — `to_number`
        │           ├── Gate POI — resolved POI for this visit (`origin_poi` / `destination_poi` per §4.0)
        │           ├── Vehicle — `TransportOrder.vehicle` (or vendor registration)
        │           ├── Product — TO line items → PR product codes/names
        │           ├── Quantity — `allocated_quantity` or sum of TO line allocations
        │           ├── Driver — assigned driver (own fleet) or `vendor_driver_name`
        │           ├── Driver contact — driver `contact_number` or vendor `phone`
        │           └── Project / From (source) — `TransportOrder.origin_poi` label (`{poi_code} — {name}`)
        │
        ├── Document Category: radio buttons
        │     ├── Supplier (PO) / Port → Inbound QC Workflow
        │     ├── Dealer (DO) → Outbound FG Workflow
        │     ├── Distributor (PO/DO) → Outbound FG Workflow
        │     └── Internal Transfer (TO/Challan) → TO-Linked Workflow
        │
        ├── Document Number: from TO (`gate_document_number` or `to_number`) — not manual on TO-linked path
        ├── Date/Time: auto-set to now (editable within 1 hour)
        ├── Party Name: text input (supplier/dealer/distributor)
        ├── Project / From Info: text input — **required on TO-linked submit**; default from `TransportOrder.origin_poi` (§6.1.1); gateman may edit before submit
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
        ├── Step 3: Routing (auto-derived — not entered on admin/API)
        │     ├── Source POI:
        │     │     ├── Dealer DO: current gate POI (session)
        │     │     └── Supplier PO: Supplier `site_poi` (Master Data)
        │     ├── Destination POI:
        │     │     ├── Dealer DO: Dealer `site_poi` (Master Data)
        │     │     └── Supplier PO: current gate POI (session)
        │     └── Vehicle: registration at yard (admin wizard field / gate-in flow §4.2)
        │
        └── [Create TO & Gate-In]
              └─► Backend:
                    ├─► Create TransportOrder:
                    │     ├─► source = 'GATE'
                    │     ├─► transfer_type = 'FG_DEALER_OUTBOUND' (Dealer) or 'RM_SUPPLIER_INBOUND' (Supplier)
                    │     ├─► status = 'created' (initial; see §4.3 for post gate-in status)
                    │     └─► Emit TO_CREATED event to TLS-01
                    │
                    └─► Create GateVisitSession + GateIn (gate_in_at = now)
                          ├─► TO.status → GATE_IN_SUCCESS_TO_STATUS[flow_lane] (same transaction)
                          │     ├─► Dealer DO (FG outbound): `at_source`
                          │     └─► Supplier PO (RM inbound): `at_destination`
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

    # YARD-01: visit leg (set at gate-in time by gate_services.create_gate_in)
    yard_leg: CharField ['source', 'destination', '']
    # 'source'      → session.poi == to.origin_poi  (FG outbound load path)
    # 'destination' → session.poi == to.destination_poi  (FG/RM inbound unload path)
    # ''            → blank for GT-02 on-demand where leg cannot be determined at creation

    # Metadata
    created_by: FK → User (Gateman)
    created_at: DateTime
    updated_at: DateTime
}
```

**Constraints**:
- Cannot create a new active session for same vehicle at same POI if one already exists
- Status transitions: `active` → `closed` (on gate-out creation)
- `yard_leg` is set in `gate_services.create_gate_in()` inside the same `atomic()` block as session creation; downstream modules (SC-01, CC-01, LD-01) filter by `yard_leg` — they must guard against blank with `if session.yard_leg`

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
    project_from_info: string (max 200)  # PRD "Project From Information"; TO-linked: default origin_poi label
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

- **GT-02 on-demand TO**: gate-in is recorded in the **same atomic transaction** as TO creation. The TO is inserted with `status='created'`, then `record_gate_in_status` advances it via `GATE_IN_SUCCESS_TO_STATUS` (§4.0) — eligibility rules above apply only to **existing** planner TOs looked up at the gate (`skip_to_eligibility=True` in code).
  - **Dealer DO** (`flow_lane=fg_outbound`): persisted status after success → **`at_source`**
  - **Supplier PO** (`flow_lane=rm_inbound`): persisted status after success → **`at_destination`**
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
  └─► Selects document category: Internal Transfer (TO/Challan)
        └─► Selects Transport Order (autocomplete — in-transit TOs only, §4.0)
              ├─► Gate POI resolved from TO (not entered manually):
              │     ├─► FG outbound + in_transit_source → origin_poi
              │     └─► FG/RM inbound + in_transit_destination → destination_poi
              ├─► Vehicle pre-filled from TransportOrder.vehicle (supervisor may override mismatch)
              ├─► Product, quantity, driver, contact, document number — from TO via service (`extract_gate_in_context_from_to`); not typed on add form
              ├─► **Project / From Info** — default `{origin_poi.poi_code} — {origin_poi.name}`; required on submit; editable if yard uses informal project labels
              ├─► Gateman enters: party name (optional), remarks (optional)
              └─► [Submit Gate-In]
                    ├─► GateInService.validate_to_eligible_for_gate_in(to, gate_poi_id=resolved POI)
                    ├─► GateInService.validate_vehicle_match(to, vehicle)
                    └─► Create GateVisitSession + GateIn
                          ├─► TO.status → GATE_IN_SUCCESS_TO_STATUS[flow_lane]
                          └─► Emit GATE_IN + GateActivityLog → Active Visits
              └─► If TO ineligible / not in autocomplete:
                    └─► ValidationError (wrong status, POI, or active visit exists)
              └─► If TO not found:
                    └─► [Create On-Demand TO] (GT-02)
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
                    │     ├─► origin_poi, destination_poi from resolve_on_demand_routing
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
                    │     └─► record_gate_in_status → GATE_IN_SUCCESS_TO_STATUS[flow_lane]:
                    │           ├─► Dealer DO (FG outbound): `created` → **`at_source`**
                    │           └─► Supplier PO (RM inbound): `created` → **`at_destination`**
                    │
                    └─► Log GateActivityLog(action='on_demand_to_created')
                          └─► Success: redirect to Active Visits (TO already at yard execution status above)
```

**GT-02 TO.status after create & gate-in (authoritative)**

| Path | `flow_lane` | Initial insert | After gate-in (persisted) |
|------|-------------|------------------|---------------------------|
| Dealer DO Outbound | `fg_outbound` | `created` | **`at_source`** |
| Supplier PO Inbound | `rm_inbound` | `created` | **`at_destination`** |

Implementation: `gate_services.create_on_demand_to_and_gate_in` → `create_gate_in(..., skip_to_eligibility=True)` → `record_gate_in_status`. On-demand TOs **do not** pass through `in_transit_source` / `in_transit_destination` (planner/driver steps are skipped).

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

- **GT-02 on-demand entry**: Dealer DO and Supplier PO paths create the TO at `created` and gate-in in one transaction; the TO is already at **`at_source`** (FG outbound) or **`at_destination`** (RM inbound) before scale-in — see §4.3. They skip the “Pre-gate-in (driver started)” row in the table above.
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

### UI — design system consistency (required)

All gate operator admin screens must match the **existing DFMS Django admin shell** (Sprint 1 PAP-01). Reuse patterns from `apps/operations/gate/admin.py`, requisitions, and transport admin — do not introduce parallel CSS, badge colours, or pagination markup.

| Asset | Purpose |
|-------|---------|
| `static/admin/css/custom.css` | Design tokens (`--dfms-*`), light/dark via `[data-theme="dark"]`, tables (`#result_list`), cards (`.module`), buttons (`dfms-btn-*`), pagination, forms |
| `static/admin/js/dfms_theme.js` | Light/dark toggle; persists `dfms-admin-theme` in `localStorage` |
| `templates/admin/base_site.html` | Base shell and asset includes |
| `templates/admin/dynamic_pagination_changelist.html` | Changelist per-page control (`DynamicPaginationMixin` via `TenantOnlyAdminMixin` / `YardAdminBase`) |
| `DFMS-product-context/07-design-system/02-components/data-display.md` | Badge modifier catalogue |
| `.cursor/rules/django-admin-draft-submit.mdc` | Draft/submit buttons, breadcrumbs, standard button classes |

**Required patterns**

1. **Mixin stack**: `GateAdminBase` → `YardAdminBase` → `TenantOnlyAdminMixin` → `DynamicPaginationMixin`. Keep default `change_list_template` unless extending `admin/dynamic_pagination_changelist.html`.
2. **Status badges**: `format_html` + `dfms-badge--{modifier}` + Bootstrap Icons (`bi-*`, `font-size:10px`). Map lane/visit/TO states to modifiers in `data-display.md` (e.g. `dfms-badge--under-planning`, `dfms-badge--fulfilled`). No inline hex colours.
3. **Buttons** (custom `change_form.html` only): `dfms-btn-secondary`, `dfms-btn-save`, `dfms-btn-draft`, `dfms-btn-add` per `custom.css` and `django-admin-draft-submit.mdc`.
4. **Tables & changelist**: Use default `#result_list` and `.module` styling. **Exception — TO visit summary card** on Gate-In add (§6.1.1): scoped styles in `templates/admin/operations/gatein/change_form.html` using DFMS tokens (`--dfms-primary`, `--body-bg`); same pattern as other ops readonly panels (QC `to_context_panel` references gate markup). Do not add new global card systems.
5. **Pagination**: Use the shared per-page dropdown; do not replace with custom paginator UI.
6. **Light/dark mode**: CSS variables only (`var(--dfms-grey-*)`, `var(--body-bg)`, etc.). Verify changelist, change form, badges, and guard-matrix panels in both themes.
7. **Custom templates**: Extend `admin/change_form.html` or `admin/dynamic_pagination_changelist.html`; no extra stylesheets beyond `custom.css`.

### 6.0 YARD-01 integration: admin base and POI resolution

`GateAdminBase` inherits `YardAdminBase` from `apps/operations/admin_base.py` (YARD-01 Step 5). This means:

- `operator_role_code = "gateman"`, `supervisor_role_codes = {"gate_supervisor"}`
- `_scope_poi_id` continues to call `get_gate_poi_for_request(request)` first (session key + URL param) then falls through to `yard_poi.get_working_poi_for_request(request, role_code="gateman")` when session is empty
- **`default_gate_poi_for_user` no longer queries `InvitationToken.invitee`** — that field does not exist and the query silently failed. It now reads `UserOperationalPOI` (YARD-01 Step 2). The legacy `dfms_gate_poi_id` session key is aliased to the new `dfms_active_poi_id` key for one release.
- `has_delete_permission` → `False` (all gate records are audit entries)
- All existing `GateInAdmin`, `GateOutAdmin`, `GateVisitSessionAdmin`, `GateOnDemandTORequestAdmin` are **unchanged** in their fieldsets, list_display, and save_model logic.

**Backward compatibility**: existing gateman sessions keep working. Session key `dfms_gate_poi_id` is read as a fallback in `gate_poi.py`'s refactored `default_gate_poi_for_user`.

### 6.1 GateInAdmin (GT-01-2, GT-01-3)

Uses `GateAdminBase` (→ `YardAdminBase`). **Business rules live in `GateInService`**; admin stays thin (validate → delegate → message user).

**Change Form (add)**:
- Field order: **Transport Order** → **visit summary card** (§6.1.1) → gate-in details (`document_category`, `gate_in_at`, `party_name`, `project_from_info`, `remarks`). Vehicle and cargo/driver fields are TO-derived (hidden on add; applied in `clean()`).
- **Gate POI is not a user-editable field** on add — `GateInService.resolve_gate_poi_for_to(to)` sets it on submit:
  - FG outbound + `in_transit_source` → `origin_poi`
  - FG/RM inbound + `in_transit_destination` → `destination_poi`
- `autocomplete_fields = ["transport_order", "vehicle"]` — POI removed from autocomplete.
- **TO queryset** — shared helper `gate_eligible_transport_orders_queryset(gate_poi_id=…)` used by `GateInAdmin.formfield_for_foreignkey`, `TransportOrderAdmin.get_queryset` / `get_search_results` (gate-in autocomplete), and `to_prefill` JSON endpoint:
  - Eligible statuses per §4.0 (`in_transit_source` / `in_transit_destination`).
  - Gateman: optional `gate_poi_id` from session scopes TOs whose resolved gate POI matches.
  - Gate supervisor: unscoped eligible TOs across tenant POIs.
  - Excludes TOs with an active `GateVisitSession`.
- **Live pre-fill** — `GET …/gatein/to-prefill/<to_id>/` → `build_gate_in_prefill_payload(to)`; `static/admin/js/gatein_to_prefill.js` refreshes the visit summary card and writes `#id_project_from_info` when the TO changes (see §6.1.1).
- **Project / From Info (TO-linked)** — required on submit. Default = display label of `TransportOrder.origin_poi` (`{poi_code} — {name}`). Also set server-side in `GateInAdminForm.clean()` via `extract_gate_in_context_from_to` when the client omits it. Gateman may override the text field before submit. GT-02 on-demand: Dealer DO → current gate POI label; Supplier PO → `supplier.site_poi` label (the shipment origin).

```python
# apps/operations/gate/gate_services.py
def resolve_gate_poi_for_to(to: TransportOrder) -> POI: ...
def gate_eligible_transport_orders_queryset(*, gate_poi_id=None): ...
def build_gate_in_prefill_payload(to: TransportOrder) -> dict: ...  # §6.1.1
def extract_gate_in_context_from_to(to: TransportOrder) -> GateInTOContext: ...
# GateInTOContext includes project_from_info (origin_poi label) after v2.4
# YARD-01: set yard_leg inside create_gate_in() atomic block
# yard_leg = YardLeg.SOURCE if to.origin_poi_id == poi.pk else YardLeg.DESTINATION
```

- **Detail view**: optional `flow_lane_badge`, `to_status_badge` on change form
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

### 6.1.1 Visit summary card (TO prefill UI — implemented pattern)

Gate-In **add** uses a read-only **visit summary card** so the gateman sees all TO-derived context in one place before entering party/remarks. Reuse this pattern for other yard screens that anchor on a TO (e.g. scale-in, loading assignment — see `docs/poi-scoped-operational-roles.md`).

**Reference implementation (do not duplicate markup elsewhere without copying this structure):**

| Piece | Path |
|-------|------|
| Widget HTML shell | `apps/operations/gate/widgets.py` — `GateVisitSummaryWidget` |
| Form field (add only) | `apps/operations/gate/forms.py` — `visit_summary` on `GateInAdminForm` |
| Fieldset placement | `apps/operations/gate/admin.py` — Visit fieldset: `transport_order`, `visit_summary` |
| Scoped CSS | `templates/admin/operations/gatein/change_form.html` — `.gate-visit-summary*` |
| Live refresh | `static/admin/js/gatein_to_prefill.js` |
| JSON endpoint | `GateInAdmin.to_prefill_view` → `build_gate_in_prefill_payload` |

**Visual design (matches existing backend):**

- Card container: `.gate-visit-summary` — 2px border, 8px radius, light gradient using `var(--dfms-primary)` at 8% mix; `box-shadow` from primary token.
- Header: `.gate-visit-summary__header` — uppercase label, Bootstrap Icon `bi-truck-front`, primary colour.
- Hint: `.gate-visit-summary__hint` — quiet body text (“Select a transport order above…”).
- Warning strip: `.gate-visit-summary__warning` — amber `#fef3c7` / `#92400e` when prefill returns `warning` (e.g. incomplete driver on TO).
- Grid: `.gate-visit-summary__grid` — 3 columns desktop, 1 column below 900px; product row spans 2 columns (`.gate-visit-summary__cell--wide`).
- Cell typography: label 0.75rem uppercase; value 1.25rem bold; vehicle value 1.5rem primary-dark.
- States: `.gate-visit-summary--empty` (placeholder `—`, primary border) → `.gate-visit-summary--ready` (success border/shadow after successful prefill).
- **No new global CSS file** — styles live only in the gate-in `change_form.html` `{% block extrastyle %}` on add.

**Card cells (left → right, top → bottom):**

| Cell ID | Label | Source |
|---------|-------|--------|
| `gate-summary-to` | Transport order | `to.to_number` |
| `gate-summary-poi` | Gate POI | `resolve_gate_poi_for_to(to)` → `{code} — {name}` |
| `gate-summary-vehicle` | Vehicle | `vehicle` FK or `vendor_vehicle_registration` |
| `gate-summary-product` | Product | TO line items (wide cell) |
| `gate-summary-quantity` | Quantity | `allocated_quantity` / line sum + UOM |
| `gate-summary-driver` | Driver | Assigned driver or vendor driver name |
| `gate-summary-contact` | Driver contact | Driver / vendor phone |
| `gate-summary-origin` | Project / From (source) | `origin_poi` → `{code} — {name}` *(v2.4 — add to widget + JS)* |

**Fields hidden on add** (values applied in `GateInAdminForm.clean()` / service, not typed twice):

`vehicle`, `product_details`, `quantity`, `driver_name`, `driver_contact`, `document_number` — CSS `display: none` in `change_form.html`.

**`project_from_info` stays visible** in the “Gate-in details” fieldset; JS pre-fills `#id_project_from_info` from the payload; server enforces default + required on submit.

**Prefill endpoint payload** (`build_gate_in_prefill_payload`):

```json
{
  "to_number": "TO-20260512-0042",
  "poi_label": "DEP01 — Dhaka Depot",
  "origin_poi_label": "FM01 — Narayanganj Feed Mill",
  "project_from_info": "FM01 — Narayanganj Feed Mill",
  "vehicle_label": "DHK-1234",
  "product_details": "FG-001 — Layer Feed (50 MT)",
  "quantity_label": "50 MT",
  "driver_name": "Karim Ahmed",
  "driver_contact": "+8801712345678",
  "warning": ""
}
```

- `origin_poi_label` and `project_from_info` use the same string (origin POI display label).
- `warning` non-empty → show warning strip; gateman may still proceed only if remaining validation passes (e.g. fix driver on TO first).

**JS behaviour** (`gatein_to_prefill.js`):

1. Read URL template from `#gate-prefill-config[data-prefill-url-template]` (placeholder `__TO_ID__`).
2. On `#id_transport_order` change / Select2 select / clear → `GET` prefill URL.
3. Update all `gate-summary-*` cells; toggle `--empty` / `--ready`.
4. Set `#id_project_from_info` to `data.project_from_info` when present (do not clear on empty TO — leave last value or blank per product rule; prefer clear on Select2 clear).
5. Supervisor vehicle override checkbox unchanged (`gatein-vehicle-override` body class).

**REST API (GT-01-5):** TO-linked POST may omit `project_from_info`; service defaults from `origin_poi` before persist. If sent, stored as provided. Required non-blank after defaulting for TO-linked creates.

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

### 6.4 On-Demand TO — Django admin (`GateOnDemandTORequestAdmin`, GT-02)

**Implementation:** `apps/operations/gate/admin.py` — `GateOnDemandTORequestAdmin` with `GateOnDemandTOAdminForm`. One add form; `path_type` selects Dealer DO vs Supplier PO (GT-02-2 / GT-02-3 behaviour in a single admin).

Uses `TenantOnlyAdminMixin`. Staging model `GateOnDemandTORequest` records the wizard payload and links to created `TransportOrder` + `GateVisitSession` (read-only on change).

**Add form fieldsets (gateman input only):**

| Fieldset | Fields |
|----------|--------|
| Path type | `path_type` (`dealer_do` / `supplier_po`) |
| Document & party | `document_number`, `dealer` *or* `supplier`, `product`, `quantity_mt`, `driver_name`, `driver_contact`, `remarks` |
| Vehicle | `vehicle_registration` (free text; format validated, no MDM lookup) |

**Not on the form (derived in `GateOnDemandTOAdminForm.clean` / `save_model` via `gate_services.resolve_on_demand_routing`):**

| Derived | Rule |
|---------|------|
| `gate_poi` | Current gate from session (`get_gate_poi_for_request`) |
| `source_poi` | Dealer DO → `gate_poi`; Supplier PO → `supplier.site_poi` |
| `destination_poi` | Dealer DO → `dealer.site_poi`; Supplier PO → `gate_poi` |
| `vehicle` / visit reg | Stored on `TransportOrder.vendor_vehicle_registration` and gate visit records; optional `Vehicle` FK only for TO-linked gate-in |
| `project_from_info` on `GateIn` | Dealer DO → gate POI label; Supplier PO → `supplier.site_poi` label (same `{code} — {name}` format) |

**Master Data prerequisite:** Dealer and Supplier records must have **`site_poi`** set (`master_data.Dealer` / `Supplier.site_poi` FK). Otherwise validation fails with a clear message to configure Site POI in MDM.

**`save_model`:** calls `gate_services.create_on_demand_to_and_gate_in` (FG `transfer_type=FG_DEALER_OUTBOUND` or RM `RM_SUPPLIER_INBOUND`, gate-in in same transaction, `GateActivityLog` `on_demand_to_created`). On success the linked `TransportOrder.status` is **`at_source`** (Dealer DO) or **`at_destination`** (Supplier PO) — not `created` (see §4.3).

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
           project_from_info: "FM01 — Narayanganj Feed Mill" (optional in body; required after default for TO-linked),
           remarks: "Vehicle front bumper dent noted" (nullable)
         }
       → TO-linked defaults:
           - When `transport_order` resolved: if `project_from_info` blank → `{origin_poi.poi_code} — {origin_poi.name}`
       → Validations (TO-linked):
           - `GateInService.validate_to_eligible_for_gate_in` (§4.0): lane × status × POI
           - `project_from_info` non-blank after defaulting
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
           dealer_id: UUID,
           product_id: UUID,
           planned_quantity_mt: 50.0,
           driver_name: "John Doe",
           driver_contact: "+8801712345678",
           vehicle_registration: "DHK-1234",
           gate_poi_id: UUID (optional — session/default gate),
           remarks: "Urgent delivery" (nullable)
         }
       → Routing: source_poi = gate_poi; destination_poi = dealer.site_poi (not in body)
       → Side effects:
           - Create TransportOrder (source='GATE', transfer_type='FG_DEALER_OUTBOUND', initial status='created')
           - Create GateVisitSession + GateIn; advance TO.status → **at_source** (GATE_IN_SUCCESS_TO_STATUS)
           - Feature-flagged stock check (AC-3): stub with manual confirm if inventory module not ready
           - Emit TO_CREATED event to TLS-01
           - Create GateActivityLog(action='on_demand_to_created')
       → Response: {
           transport_order: {to_id, to_number, transfer_type: "FG_DEALER_OUTBOUND", status: "at_source"},
           gate_visit_session_id,
           gate_in_at,
           message: "Dealer TO created and gate-in recorded."
         }

POST   /api/v1/gate/on-demand-to/supplier
       → Create RM TO from Supplier PO
       → Body: {
           po_number: "PO-2026-5678",
           supplier_id: UUID,
           product_id: UUID,
           expected_quantity_mt: 25.0,
           driver_name: "Jane Doe",
           driver_contact: "+8801798765432",
           vehicle_registration: "DHK-5678",
           gate_poi_id: UUID (optional),
           remarks: "Scheduled delivery" (nullable)
         }
       → Routing: source_poi = supplier.site_poi; destination_poi = gate_poi (not in body)
       → Side effects:
           - Create TransportOrder (source='GATE', transfer_type='RM_SUPPLIER_INBOUND', initial status='created')
           - Set QC linkage flag for inbound workflow
           - Create GateVisitSession + GateIn; advance TO.status → **at_destination** (GATE_IN_SUCCESS_TO_STATUS)
           - Emit TO_CREATED event to TLS-01
           - Create GateActivityLog(action='on_demand_to_created')
       → Response: {
           transport_order: {to_id, to_number, transfer_type: "RM_SUPPLIER_INBOUND", status: "at_destination"},
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
| Project / From Info | ✓ (TO-linked) | Default `TransportOrder.origin_poi` label (`{poi_code} — {name}`); shown on visit summary card; editable text field; GT-02 defaults per §4.2 routing |
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
- `destination_poi = dealer.site_poi` (Master Data FK on `Dealer`; required)
- `fleet_type = 'own'` (default)
- `status = 'created'`, `execution_state = 'gate_in_source'`
- No TR link, no TDO assignment required
- Feature-flagged stock check: validate FG inventory availability when stock service exists; otherwise stub with manual confirm + audit

**Supplier PO path** (AC-2 — `transfer_type=RM_SUPPLIER_INBOUND`):
- `source = 'GATE'`
- `transfer_type = 'RM_SUPPLIER_INBOUND'`
- `origin_poi = supplier.site_poi` (Master Data FK on `Supplier`; required)
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
| GT-01-13 | YARD-01 integration | Set `yard_leg` in `create_gate_in()`; `GateAdminBase` → `YardAdminBase`; fix `InvitationToken.invitee` bug in `gate_poi.py` via `UserOperationalPOI` |

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
