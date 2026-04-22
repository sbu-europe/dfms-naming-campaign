---
jira_key: DFS-037
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: ~
title: Procurement — Destination Breakdown & Transport Request Creation
epic: Procurement
status: Pending
story_points: 6
assignee: ~
---

# PC-02 — Procurement: Destination Breakdown & Transport Request Creation

## User Story

**As a** Procurement Officer  
**I want to** define a destination-wise quantity allocation plan against a Port Consignment PR and create Transport Requests per destination  
**So that** each TR represents a confirmed shipment leg from port to a specific receiving POI, and is immediately available for Transport Planning

## Business Context

Port Consignment PRs carry a total incoming RM quantity that must be distributed to one or more destination POIs (warehouses, feed mills, depots). The Procurement Officer creates the **Destination Breakdown Plan** by creating one TR per destination, specifying the Port as Source and a specific POI as Destination for each TR.

Unlike the Distribution flow, **there is no manager approval step** — submitted TRs from Procurement are immediately available for Transport Planning. Vehicle count and type are **not** defined here — those are the Transport Planner's inputs when assessing TRs (TRQ-01).

**TR flow**:
```
Procurement Officer reviews PR → Creates TR(s) with destination breakdown (one TR per destination POI) → Quantity validation → TRs immediately available for Transport Planning
```

## Acceptance Criteria

### AC-1: Destination Breakdown / TR Creation Form
- [ ] Procurement Officer creates a TR from a specific Port Consignment PR with:
  - **Parent PR**: Pre-filled and read-only (PR Number + full shipment reference: BL, LC, Vessel, Voyage, Container, C&F Agent, POL, ETA, Arrival Notice)
  - **Source POI**: Always a Port — filtered to Port-type POIs only (from MDM-04)
  - **Destination POI**: Dropdown of all active POIs (no type filter)
  - **Quantity Allocation**: Per RM product line item — how much of each RM goes to this destination (≤ remaining unallocated PR quantity for that line)
  - **Delivery Date**: Pre-filled from PR; editable
  - **Remarks** (optional)
- [ ] System auto-generates TR number: `TR-PORT-YYYYMMDD-XXXX`
- [ ] All shipment reference fields from PR displayed read-only on the TR form for context
- [ ] TR cannot be submitted without complete mandatory allocation — quantity per line item required

### AC-2: Quantity Validation
- [ ] System tracks per PR: Total PR Quantity per RM line, Total Allocated across all TRs, Remaining
- [ ] If TR quantity causes total allocated to exceed PR quantity for any line → **block TR creation** with clear error
- [ ] Remaining quantity shown on the TR creation form in real time per line item
- [ ] Partial allocation allowed — Procurement Officer can create TR for one destination now and add more TRs for other destinations later

### AC-3: Multi-TR per PR (Multiple Destinations)
- [ ] After creating one TR (for one destination), "Add Another Destination" available if remaining qty > 0
- [ ] Each TR has a different Destination POI
- [ ] All TRs share the same Source POI (Port) and same parent PR
- [ ] PR detail shows the full destination breakdown plan: all TRs with their destinations and allocated quantities

### AC-4: TR Status Lifecycle (No Approval Step)
- [ ] Status: `Submitted` → **directly** `Available for Transport Planning`
- [ ] On submission, TR is immediately visible to Transport Planners — no manager approval gate
- [ ] No Draft state — TR submitted directly on creation

### AC-5: TR List View (Procurement Officer)
- [ ] Procurement Officer sees TRs they created with PR reference, source (Port), destination, allocated quantities, and status
- [ ] Filter by PR, status, destination POI, date

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PC-02-1 | Extend TransportRequest model — PORT_CONSIGNMENT type (reuse DR-02 base; add shipment reference FK, Port-only source gate) | DFS-037-1 | Pending |
| PC-02-2 | Port TR creation API (POST) — Port-only source gate, PR quantity allocation validation per line | DFS-037-2 | Pending |
| PC-02-3 | TR number auto-generation: `TR-PORT-YYYYMMDD-XXXX` | DFS-037-3 | Pending |
| PC-02-4 | Direct submit → Available for Transport Planning (no approval routing) | DFS-037-4 | Pending |
| PC-02-5 | TR list API for Procurement Officer (GET /transport-requests?type=PORT_CONSIGNMENT) | DFS-037-5 | Pending |
| PC-02-6 | TR detail view API — includes read-only shipment reference fields from parent PR | DFS-037-6 | Pending |
| PC-02-7 | TR creation form UI — shipment reference (read-only from PR), Port source selector, destination POI picker, qty allocation per line, remaining qty indicator | DFS-037-7 | Pending |
| PC-02-8 | TR list + detail UI | DFS-037-8 | Pending |

## API Endpoints

```
POST   /api/v1/transport-requests
Body:  { pr_id, type: "PORT_CONSIGNMENT", source_poi_id (Port), destination_poi_id, quantity_lines[], delivery_date, remarks? }
Response: 201 Created + TR object (status = AVAILABLE_FOR_PLANNING on submit)

GET    /api/v1/transport-requests?pr_id=&type=PORT_CONSIGNMENT&status=&page=
GET    /api/v1/transport-requests/{tr_id}
POST   /api/v1/transport-requests/{tr_id}/cancel
```

## Access & Permissions

> Full menu structure and role-access matrix: [`00-sprint-design.md`](../00-sprint-design.md)

| Action | Role |
|--------|------|
| View TR list (own) | Procurement Officer |
| Create TR (destination breakdown) against a Port Consignment PR | Procurement Officer |
| Cancel TR | Procurement Officer |

- Source POI is always a Port (Port-type POIs only — filtered from MDM-04)
- Destination POI is selected per TR from active non-Port POIs
- Vehicle count and vehicle type are **not** captured here — defined by Transport Planner at TRQ-01
- Total TR quantity across all TRs for one PR must not exceed PR quantity — overflow blocked
- **No approval step** — submitted TRs are immediately `Available for Transport Planning`
- No Procurement Manager role in this workflow

## Dependencies

- **Requires**: PR-02 (Port Consignment Product Requisition), MDM-04 (POI — Port-type filter)
- **Enables**: TRQ-01 (Transport Planning queue — Port Consignment TRs appear alongside FG TRs)

## Definition of Done

- [ ] TR creation with Port-only source gate; destination from active non-Port POI dropdown
- [ ] Shipment reference fields from PR displayed read-only on TR form
- [ ] Quantity allocation per line item with overflow validation
- [ ] Multi-TR per PR for multiple destination POIs
- [ ] TR number auto-generation
- [ ] Submit → directly Available for Transport Planning (no approval gate)
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: Procurement Officer creates 2 TRs from one Port PR (two different destinations); both immediately available in Transport Planning queue
