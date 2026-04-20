---
jira_key: DFS-038
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 3"
story_id: ~
title: Transport — Transport Requests Queue & Planning Input
epic: Transport
status: Pending
story_points: 3
assignee: ~
---

# TRQ-01 — Transport: Transport Requests Queue & Planning Input

## User Story

**As a** Transport Planner  
**I want to** view all approved Transport Requests (FG and Port Consignment) and submit my vehicle/type planning inputs against each TR  
**So that** I can begin creating Transport Orders with the correct fleet allocation

## Business Context

This is the entry point for the Transport module. Once a TR is available for Transport Planning (FG TRs after DM approval; Port Consignment TRs immediately on Procurement submission), they appear in this queue.

The Transport Planner's mandatory first action on a TR is to **submit planning inputs** — number of vehicles required, vehicle type, and for Port Consignment TRs, the C&F Clearance Note/Approval status. **TO creation is blocked until these inputs are submitted.**

**Flow**:
```
TR available for Transport Planning → Transport Planner reviews queue → Submits vehicle qty + vehicle type (+ C&F for Port) → Creates TO(s) against TR
```

## Acceptance Criteria

### AC-1: TR Queue — Finished Goods Tab
- [ ] Transport Planner sees all FG TRs with status `Available for Transport Planning` or `Under Planning`
- [ ] Each FG TR displays:
  - TR ID, Parent PR reference, Product Item Code, Product Category, Type of Packing, Product Quantity, Weight per Unit, Total Calculated Weight, UOM, Urgency, Required Date & Time of Delivery, Source POI (Pickup), Destination POI (Drop)
- [ ] Filters: Date, POI (Source / Destination), Urgency
- [ ] Sort: Delivery Date (ascending default), Urgency

### AC-2: TR Queue — Port Consignment Tab
- [ ] Transport Planner sees all Port Consignment TRs with status `Available for Transport Planning` or `Under Planning`
- [ ] Each Port Consignment TR displays:
  - TR ID, Parent PR reference, Product Item Code, Product Category, BL Number, LC Number, Voyage Name, Vessel Name, Container Number, C&F Agent Name, POL, ETA, Arrival Notice Attachment, Commodity, Tentative Quantity per RM Item Code, Weight/Tonnage, Source (Port) POI (Pickup), Destination POI (Drop), Requested Delivery Date & Time, Destination Breakdown Plan
- [ ] Filters: Date, POI, ETA, Urgency
- [ ] Sort: ETA (ascending default), Urgency

### AC-3: Transport Planner Planning Inputs (Mandatory before TO creation)
- [ ] For **Finished Goods TRs**, Transport Planner submits:
  - **Quantity of Vehicles Required** (numeric)
  - **Vehicle Type** (dropdown — e.g., Covered Truck, Open Truck, Flatbed)
- [ ] For **Port Consignment TRs**, Transport Planner submits:
  - **C&F Clearance Note / Approval** (Yes / No)
  - **Quantity of Vehicles Required** (numeric)
  - **Vehicle Type** (dropdown)
- [ ] System **blocks TO creation** if planning inputs have not been submitted for that TR
- [ ] TR status transitions to `Under Planning` once planning inputs are saved
- [ ] TR locked to that planner's queue once `Under Planning`

### AC-4: Fleet Availability Display
- [ ] On TR detail / planning input form, system displays:
  - **Own Fleet available count** (vehicles matching required type and available status)
  - **Vendor Fleet available count** (active contractual vendors with matching fleet type)
- [ ] This count guides the planner's fleet type decision when creating TOs

### AC-5: Dispatch Deadline Alerts
- [ ] TR flagged as Urgent (badge) if Delivery Date / ETA is within 24 hours
- [ ] TR flagged as Overdue (badge) if Delivery Date / ETA has passed

### AC-6: Audit Trail
- [ ] All planning input submissions (planner ID, timestamp, fields entered) audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TRQ-01-1 | FG TR queue API — GET /transport-requests?type=FG&status=AVAILABLE_FOR_PLANNING,UNDER_PLANNING with date/POI/urgency filters | DFS-038-1 | Pending |
| TRQ-01-2 | Port Consignment TR queue API — GET /transport-requests?type=PORT_CONSIGNMENT with ETA/POI/urgency filters | DFS-038-2 | Pending |
| TRQ-01-3 | Planning inputs submission API: PATCH /transport-requests/{tr_id}/planning — vehicles_required, vehicle_type, cf_clearance (Port only) | DFS-038-3 | Pending |
| TRQ-01-4 | TO creation gate — block if planning inputs not yet submitted on TR | DFS-038-4 | Pending |
| TRQ-01-5 | `Under Planning` status transition + lock to planner | DFS-038-5 | Pending |
| TRQ-01-6 | Fleet availability count service — own fleet available + vendor fleet available (by vehicle type + status) | DFS-038-6 | Pending |
| TRQ-01-7 | Urgency / overdue deadline flag logic | DFS-038-7 | Pending |
| TRQ-01-8 | FG TR queue UI — tab with TR cards, FG-specific fields, filters, urgency badges | DFS-038-8 | Pending |
| TRQ-01-9 | Port Consignment TR queue UI — tab with TR cards, LC/shipment fields, ETA, Arrival Notice link, filters | DFS-038-9 | Pending |
| TRQ-01-10 | Planning input form UI — vehicle qty + type inputs; C&F field for Port; fleet availability counts displayed | DFS-038-10 | Pending |

## API Endpoints

```
GET   /api/v1/transport-requests?type=FG&status=AVAILABLE_FOR_PLANNING,UNDER_PLANNING&poi=&urgency=&sort=delivery_date
GET   /api/v1/transport-requests?type=PORT_CONSIGNMENT&status=AVAILABLE_FOR_PLANNING,UNDER_PLANNING&poi=&urgency=&sort=eta
GET   /api/v1/transport-requests/{tr_id}
PATCH /api/v1/transport-requests/{tr_id}/planning
Body: { vehicles_required, vehicle_type, cf_clearance_approved (PORT only) }
GET   /api/v1/fleet/availability?vehicle_type=&poi_id=    # Own fleet + vendor fleet counts
GET   /api/v1/transport-requests/{tr_id}/transport-orders # Linked TOs + remaining qty
```

## Access & Permissions

> Full menu structure and role-access matrix: [`00-sprint-design.md`](../00-sprint-design.md)

| Action | Role |
|--------|------|
| View FG TR queue tab | Transport Planner |
| View Port Consignment TR queue tab | Transport Planner |
| Submit planning inputs (vehicle qty, type, C&F) | Transport Planner |
| View fleet availability counts | Transport Planner |
| View TR detail + linked TOs | Transport Planner, TDO |

- Planning inputs (vehicle qty + type; C&F for Port) are mandatory before TO creation — system blocks TO creation without them
- C&F Clearance Note/Approval field shown only on Port Consignment TRs
- Fleet availability counts are displayed to guide fleet type decisions, not to block submission

## Dependencies

- **Requires**: DR-02 (approved FG TRs), PC-02 (submitted Port Consignment TRs), MDM-05/06 (fleet availability data)
- **Enables**: TO-01 (Transport Order creation against assessed TR)

## Definition of Done

- [ ] FG TR queue tab with correct fields and filters
- [ ] Port Consignment TR queue tab with LC/shipment fields and ETA sort
- [ ] Planning inputs submission (vehicles qty, type; C&F for Port) — blocks TO creation until complete
- [ ] Fleet availability counts (own + vendor) displayed on planning input form
- [ ] `Under Planning` status transition + planner lock
- [ ] Urgency and overdue flags
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: Transport Planner submits planning inputs on both a FG TR and a Port Consignment TR; TO creation is blocked until inputs are saved
