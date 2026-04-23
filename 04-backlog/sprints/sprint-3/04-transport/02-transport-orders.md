---
jira_key: DFS-039
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 3"
story_id: ~
title: Transport — Transport Order Creation
epic: Transport
status: Pending
story_points: 8
assignee: ~
---

# TO-01 — Transport: Transport Order Creation

## User Story

**As a** Transport Planner  
**I want to** create one or more Transport Orders (TOs) against a Transport Request, splitting quantity across fleet types as needed  
**So that** each TO is a concrete dispatch unit routed to the correct TDO for vehicle and driver assignment

## Business Context

Transport Orders are the executable units of transport work. A single TR may require multiple TOs — e.g., a TR for 500 tons may be split across 3 own-fleet TOs and 2 vendor-fleet TOs. The Transport Planner creates TOs after submitting planning inputs on the TR (TRQ-01). All product-related attributes are inherited from the TR and are read-only on the TO.

Each TO is tagged as **Own Fleet** or **Vendor Fleet** and is automatically routed to the appropriate TDO:
- Own Fleet → TDO (Own Fleet) for vehicle/driver assignment
- Vendor Fleet → TDO (Vendor Fleet) for vendor assignment

**TO flow**:
```
TR under planning (planning inputs submitted) → Transport Planner creates TO(s) → Auto-routed to TDO by fleet type → TDO assigns resources (TO-02)
```

## Acceptance Criteria

### AC-1: TO Creation from TR
- [ ] Transport Planner can create TOs only from TRs with planning inputs submitted (status `Under Planning`)
- [ ] All product-related attributes inherited from TR and displayed read-only:
  - **For FG TOs**: Product Item Code, Product Name, Product Category + Sub-Category, Type of Packing, Quantity, Weight per Unit, Source POI, Destination POI, Delivery Date, Vehicles Required, Vehicle Type
  - **For Port Consignment TOs**: All FG fields plus BL Number, LC Number, Voyage Name, Vessel Name, Container Number, C&F Agent Name, POL, ETA, Arrival Notice Attachment, Commodity, Destination Breakdown Plan
- [ ] Transport Planner inputs per TO:
  - **Fleet Type**: Own Fleet / Vendor Fleet
  - **Allocated Quantity** (≤ remaining TR quantity — load split per TO)
  - **Planned Delivery Date & Time**
  - **For Port Consignment TOs additionally**: C&F Clearance Note (confirmation field)
- [ ] System displays **Own Fleet vs Vendor Fleet availability count** to support the planner's fleet type decision
- [ ] System auto-generates TO number: `TO-YYYYMMDD-XXXX`
- [ ] A TO cannot be tagged as both fleet types simultaneously

### AC-2: TR Quantity Allocation Validation
- [ ] System tracks per TR: Total TR Quantity, Allocated (sum of TOs), Remaining
- [ ] TO quantity must not exceed Remaining TR quantity → **block creation if overflowed**, with clear error
- [ ] Remaining quantity shown on the TO creation form in real time
- [ ] TR status auto-updates:
  - First TO created → `Partially Allocated`
  - All quantity allocated → `Fully Allocated`

### AC-3: Multi-TO per TR
- [ ] After creating first TO, "Create Another TO" available while remaining qty > 0
- [ ] Each TO can have a different Fleet Type (mix Own + Vendor Fleet TOs against same TR)
- [ ] Each TO references parent TR ID
- [ ] TR detail shows all linked TOs with their fleet type, allocated qty, and status

### AC-4: TO Routing by Fleet Type
- [ ] On creation, TO is automatically forwarded to the appropriate TDO queue:
  - Fleet Type = OWN → visible to TDO (Own Fleet) for vehicle/driver assignment
  - Fleet Type = VENDOR → visible to TDO (Vendor Fleet) for vendor assignment

### AC-5: TO Status Lifecycle
- [ ] Initial TO status: `Created` → forwarded to TDO → `Assigned` → `Ready for Dispatch`

### AC-6: Audit Trail
- [ ] TO create / cancel actions logged with planner + timestamp

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TO-01-1 | TransportOrder model + migration (TR FK, fleet type, allocated qty, planned delivery date, status, audit) | DFS-039-1 | Pending |
| TO-01-2 | TO creation API (POST) — planning inputs gate + TR quantity allocation validation | DFS-039-2 | Pending |
| TO-01-3 | TO number auto-generation: `TO-YYYYMMDD-XXXX` | DFS-039-3 | Pending |
| TO-01-4 | TR quantity tracking service — allocated, remaining, status auto-update | DFS-039-4 | Pending |
| TO-01-5 | Multi-TO workflow — remaining quantity tracking + "Create Another TO" | DFS-039-5 | Pending |
| TO-01-6 | Fleet availability count display (own fleet available + vendor fleet available) on TO creation form | DFS-039-6 | Pending |
| TO-01-7 | TO routing on creation: own fleet → TDO Own Fleet queue; vendor fleet → TDO Vendor Fleet queue | DFS-039-7 | Pending |
| TO-01-8 | TO list API (GET /transport-orders?tr_id=&fleet_type=&status=) | DFS-039-8 | Pending |
| TO-01-9 | TR detail view — linked TOs section with fleet type, allocated qty, and status | DFS-039-9 | Pending |
| TO-01-10 | TO creation form UI — read-only TR fields (FG fields; + LC/shipment fields for Port), fleet type selector, qty input, planned delivery date, fleet counts, C&F note for Port | DFS-039-10 | Pending |
| TO-01-11 | TO list + detail UI | DFS-039-11 | Pending |

## API Endpoints

```
POST  /api/v1/transport-orders
Body: { tr_id, fleet_type, allocated_quantity, planned_delivery_datetime, cf_clearance_note? (Port only) }
Response: 201 Created + TO object

GET   /api/v1/transport-orders?tr_id=&fleet_type=&status=&page=
GET   /api/v1/transport-orders/{to_id}
POST  /api/v1/transport-orders/{to_id}/cancel

GET   /api/v1/fleet/availability?vehicle_type=&poi_id=    # Own + vendor fleet counts for planning
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View TO list | Transport Planner, TDO |
| Create TO against a TR | Transport Planner |
| Cancel TO | Transport Planner |

- TO creation requires TR planning inputs to have been submitted (blocked otherwise)
- All product-related fields are read-only, inherited from TR
- TDO does not create TOs — their role begins after TO creation (resource assignment in TO-02)
- Total allocated TO quantity across all TOs for one TR must not exceed TR quantity — overflow blocked

## Dependencies

- **Requires**: TRQ-01 (planning inputs submitted on TR), MDM-05/06 (fleet availability counts)
- **Enables**: TO-02 (TDO vehicle/driver/vendor assignment on each TO)

## Definition of Done

- [ ] TO creation gated on planning inputs submitted for the parent TR
- [ ] All product fields inherited read-only from TR (FG fields + LC/shipment fields for Port TOs)
- [ ] Fleet type selection (Own / Vendor); fleet availability counts shown
- [ ] C&F Clearance Note input shown for Port Consignment TOs
- [ ] TR quantity overflow validation — blocked if allocated qty exceeds remaining TR qty
- [ ] Multi-TO per TR with fleet type mix
- [ ] TO auto-routed to correct TDO queue by fleet type on creation
- [ ] TR status auto-updates (Partially / Fully Allocated)
- [ ] TO number generation and TR linking
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: Transport Planner splits one FG TR into 2 TOs (own + vendor); both routed to respective TDO queues
- [ ] UAT: Transport Planner creates Port Consignment TO with C&F Clearance Note
