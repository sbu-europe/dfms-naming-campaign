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
**I want to** allocate inbound RM quantities from a **Port Shipment** across destination POIs and create **Transport Requests** (one per destination)  
**So that** distribution is planned per POI; TRs feed Transport Planning where **Transport Orders** are created for execution

## Business Context

A **Port Shipment** (PR-02) holds total incoming RM cargo. Procurement **plans distribution** by creating TRs: each TR is one port-to-destination leg with quantity allocation per RM line. This is the procurement breakdown plan.

After TRs are submitted, they are immediately **Available for Transport Planning**. The Transport Planner then submits planning inputs and creates **Transport Orders (TOs)** against each TR (TO-01 / TRQ-01) — Procurement does not create TOs in this story.

**TR flow**:
```
Procurement opens Port Shipment → Creates TR(s): Port source + destination POI + per-line quantities → Submit → Available for Transport Planning → (later) TO creation
```

## Acceptance Criteria

### AC-1: Destination Breakdown / TR Creation Form
- [ ] Procurement creates a TR from a specific **Port Shipment** with:
  - **Linked Port Shipment**: Pre-filled and read-only (Shipment Ref + BL, LC, Vessel, Voyage, Container, C&F Agent, POL, ETA, Arrival Notice)
  - **Source POI**: Port-type POI only (MDM-04)
  - **Destination POI**: Dropdown of **all active POIs** (no type filter)
  - **Quantity allocation**: Per RM line — amount to this destination (≤ remaining unallocated for that line on the shipment)
  - **Delivery date**: Pre-filled from shipment; editable
  - **Remarks** (optional)
- [ ] TR number: `TR-PORT-YYYYMMDD-XXXX`
- [ ] Shipment reference fields read-only on TR form
- [ ] Submit blocked until allocations complete for this TR

### AC-2: Quantity Validation
- [ ] Per shipment: total line qty vs sum of TR allocations; block overflow
- [ ] Clear error if allocation exceeds remaining
- [ ] Real-time remaining qty per line on form
- [ ] Partial allocation supported — additional TRs for other destinations later

### AC-3: Multi-TR per Shipment
- [ ] "Add another destination" when remaining qty > 0
- [ ] Each TR has a distinct destination POI (for a given planning step)
- [ ] TRs share source Port and linked **Port Shipment**
- [ ] Shipment detail shows full breakdown: all TRs, destinations, quantities

### AC-4: TR Status (No Approval)
- [ ] On submit: **Available for Transport Planning** immediately (no manager approval)
- [ ] No Draft — submit on creation (or single-step save+submit as per implementation)

### AC-5: TR List (Procurement)
- [ ] Procurement sees own TRs with shipment ref, source, destination, quantities, status
- [ ] Filter by shipment, status, destination, date

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PC-02-1 | TransportRequest model — `PORT_CONSIGNMENT` type; link to parent shipment; Port-only source | DFS-037-1 | Pending |
| PC-02-2 | POST TR — validation vs remaining shipment quantities | DFS-037-2 | Pending |
| PC-02-3 | TR number `TR-PORT-YYYYMMDD-XXXX` | DFS-037-3 | Pending |
| PC-02-4 | Submit → Available for Transport Planning | DFS-037-4 | Pending |
| PC-02-5 | GET TR list for Procurement (`type=PORT_CONSIGNMENT`) | DFS-037-5 | Pending |
| PC-02-6 | TR detail — read-only shipment fields from linked Port Shipment | DFS-037-6 | Pending |
| PC-02-7 | UI — shipment context, Port source, destination POI (all active), per-line allocation | DFS-037-7 | Pending |
| PC-02-8 | TR list + detail UI | DFS-037-8 | Pending |

## API Endpoints

```
POST   /api/v1/transport-requests
Body:  { pr_id (linked Port Shipment), type: "PORT_CONSIGNMENT", source_poi_id (Port), destination_poi_id, quantity_lines[], delivery_date, remarks? }

GET    /api/v1/transport-requests?pr_id=&type=PORT_CONSIGNMENT&status=&page=
GET    /api/v1/transport-requests/{tr_id}
POST   /api/v1/transport-requests/{tr_id}/cancel
```

## Access & Permissions

> Menu and roles: [`../README.md`](../README.md)

| Action | Role |
|--------|------|
| Create TR (destination breakdown) against a Port Shipment | Procurement Officer |
| View own TR list | Procurement Officer |
| Cancel TR | Procurement Officer |

- Vehicle count/type captured at TRQ-01, not here
- **TO creation** is out of scope — Transport Planner (TO-01)

## Dependencies

- **Requires**: PR-02 (Port Shipment), MDM-04 (POI — Port filter for source)
- **Enables**: TRQ-01 (Port Consignment / RM TR tab in planning queue)

## Definition of Done

- [ ] TR creation with Port source and per-line allocation; overflow guard vs shipment totals
- [ ] Read-only shipment context on TR
- [ ] Multi-TR per shipment supported
- [ ] Submit → Available for Transport Planning
- [ ] Unit tests > 80%
- [ ] UAT: Two TRs from one Port Shipment (two destinations); both appear in Transport Planning queue
