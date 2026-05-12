---
jira_key: DFS-054
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: GT-01
title: Gate — Gate-In, Gate-Out & Remarks (TO-Linked + Document Categories)
epic: Gate Operations
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.10.1 Gate-In Entry (Phase 1)"
  - "§6.10.3 Gate-Out Entry (Phase 1)"
  - "§6.10.4 Discrepancy & Remarks Logging (Phase 1)"
---

# GT-01 — Gate-In, Gate-Out & Remarks

## User Story

**As a** Gateman  
**I want to** register gate-in and gate-out against a vehicle with TO/challan context and optional remarks  
**So that** yard, scaling, and command center workflows have an auditable entry record

## Business Context

PRD §6.10.1 captures document categories (Supplier PO, Internal TO/Challan, Dealer DO, etc.). **Sprint 4 E2E** prioritises **Internal Transfer (TO/Challan)** for planner-created TOs. Other categories remain in scope per PRD but can be toggled by feature flag.

**§6.10.2.x** on-demand TO creation (Dealer DO / Supplier PO) is **[GT-02](GT-02-on-demand-to-creation-gate.md)**.

## Acceptance Criteria

### AC-1: Gate-in
- [ ] Gate-in requires **vehicle registration number**; cannot save without it
- [ ] Fields per PRD: document category, challan/TO/PO/DO number (as applicable), product details (gate-in item), quantity (nullable for empty vehicles), date/time, driver name & contact, party name, project/from info, remarks
- [ ] For **TO-linked** flow: lookup TO by number; validate vehicle matches assigned vehicle on TO *(or warn + supervisor override policy — document)*

### AC-2: Routing to operational flow
- [ ] At gate-in, the **document category** captured in AC-1 (per PRD §6.10.1) determines the operational flow the record is routed to — `[High]`:
  - `Supplier (PO)` / Port → **Inbound QC Workflow**
  - `Dealer (DO)` → **Outbound FG Workflow**
  - `Distributor (PO/DO)` → **Outbound FG Workflow** *(same lane as Dealer per PRD §6.10.1 intent)*
  - `Internal Transfer (TO/Challan)` → **TO-Linked Workflow**
- [ ] Sprint 4 E2E prioritises the **Internal Transfer → TO-Linked Workflow** path (aligns with TLS-01/POD-01); Supplier and Dealer/Distributor flows are toggled by feature flag per Business Context

### AC-3: Gate-out
- [ ] Gate-out allowed only when business rules satisfied: **after scale-out** for flows that use scaling
- [ ] Minimum Sprint 4 guard matrix (to align TLS-01/POD-01):
  - FG outbound: scale-out completed + loading completed
  - FG inbound: scale-out completed + unloading completed
  - RM inbound: scale-out completed + unloading completed + QC not failed

### AC-4: Remarks / discrepancy
- [ ] Free-text remarks on gate-in and gate-out events; audit who/when

### AC-5: Linkage to TO
- [ ] Gate events update **TO timeline** (TLS-01) with timestamps

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| GT-01-1 | GateVisitSession + GateIn + GateOut models + migration (FK to TO, Vehicle; document category enum, remarks, driver fields, timestamp fields) | DFS-054-1 | Pending |
| GT-01-2 | GateInAdmin — change form with TO number autocomplete lookup, vehicle registration validation in `save_model`, document category routing logic (Internal Transfer / Dealer / Supplier feature-flag gating) | DFS-054-2 | Pending |
| GT-01-3 | GateInAdmin — inline for gate-in items (product, quantity); `save_model` sets `gate_in_at` timestamp and creates GateVisitSession | DFS-054-3 | Pending |
| GT-01-4 | GateOutAdmin — change form with gate-out guard matrix in `save_model` (checks scale-out completed, loading/unloading completed per flow type); `get_readonly_fields` locks completed records | DFS-054-4 | Pending |
| GT-01-5 | Gate-in REST API (POST) — create gate-in with TO lookup + vehicle validation | DFS-054-5 | Pending |
| GT-01-6 | Gate-in list/detail REST API (GET with filters: date, vehicle, document category, TO number) | DFS-054-6 | Pending |
| GT-01-7 | Gate-out REST API (POST) — create gate-out with guard matrix enforcement | DFS-054-7 | Pending |
| GT-01-8 | Gate-out list/detail REST API (GET) | DFS-054-8 | Pending |
| GT-01-9 | TLS-01 timeline event emission service — emit `GATE_IN` / `GATE_OUT` events on save | DFS-054-9 | Pending |
| GT-01-10 | Gateman UI — fast-entry gate-in form (vehicle reg, TO lookup, document category, remarks); barcode = out of scope | DFS-054-10 | Pending |
| GT-01-11 | Gateman UI — gate-out form with guard status indicators | DFS-054-11 | Pending |
| GT-01-12 | GateActivityLog model + audit logging on gate-in, gate-out, and remarks (user, POI, timestamp, action) | DFS-054-12 | Pending |

## API Endpoints

```
POST   /api/v1/gate/gate-in                                    # Create gate-in (TO lookup + vehicle validation)
GET    /api/v1/gate/gate-in?date=&vehicle=&doc_category=&to_number=&search=
GET    /api/v1/gate/gate-in/{gate_in_id}
POST   /api/v1/gate/gate-out                                   # Create gate-out (guard matrix enforced)
GET    /api/v1/gate/gate-out?date=&vehicle=&search=
GET    /api/v1/gate/gate-out/{gate_out_id}
GET    /api/v1/gate/visit-sessions/{session_id}                # Full visit session (gate-in + gate-out)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| Create gate-in | Gateman |
| Create gate-out | Gateman |
| View gate-in/out list (own POI) | Gateman, Supervisor, Transport Planner |
| Add remarks / discrepancy notes | Gateman |

- Gateman operates within their assigned POI context
- Supervisor override policy for vehicle mismatch warnings (document in tech design)

## Dependencies

- **Requires**: **TLS-01**; **TO** exists and is in a state that permits gate-in (**§6.8.5**, post–Ready for Dispatch as per technical design)
- **Before**: SC-01 (scale-in after gate-in)

## Definition of Done

- [ ] GateVisitSession, GateIn, and GateOut models created with all PRD fields; migration applied cleanly
- [ ] GateInAdmin save_model validates TO exists and vehicle registration matches assigned vehicle on TO
- [ ] Document category captured at gate-in and determines downstream routing (Internal Transfer active; Dealer/Supplier behind feature flag)
- [ ] GateOutAdmin save_model enforces guard matrix: FG outbound requires scale-out + loading complete; inbound requires scale-out + unloading complete; RM inbound additionally requires QC not failed
- [ ] Gate-in and gate-out REST APIs return correct HTTP status codes and validation error messages
- [ ] Free-text remarks can be attached to both gate-in and gate-out events
- [ ] Gate events emit `GATE_IN` / `GATE_OUT` timeline events to TLS-01 with timestamps
- [ ] GateActivityLog records created on every gate-in, gate-out, and remark action with user, POI, and timestamp
- [ ] UAT: vehicle arrives → gate-in → scale-in → … → gate-out happy path completes end-to-end
- [ ] Unit tests cover gate-out guard rules for all three flow types (FG outbound, FG inbound, RM inbound)
- [ ] Gateman can only operate within their assigned POI; unauthorised POI access returns 403
