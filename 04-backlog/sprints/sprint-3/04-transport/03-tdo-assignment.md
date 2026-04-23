---
jira_key: DFS-040
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 3"
story_id: ~
title: Transport — TDO Vehicle, Driver, Helper & ETA Assignment
epic: Transport
status: Pending
story_points: 8
assignee: ~
---

# TO-02 — Transport: TDO Vehicle, Driver, Helper & ETA Assignment

## User Story

**As a** Transport Distribution Officer — Own Fleet (TDO)  
**I want to** assign available vehicles, drivers, and helpers to Own Fleet TOs and set ETA  
**So that** trips can be executed using internal resources and drivers can see their assignments

**As a** Transport Distribution Officer — Vendor Fleet (TDO)  
**I want to** assign contractual vendors to Vendor Fleet TOs  
**So that** TOs can be executed via pre-agreed vendor partnerships with rates applied automatically

## Business Context

Once the Transport Planner creates TOs (TO-01), they are automatically routed to the appropriate TDO queue by fleet type. The TDO then assigns the physical resources:

- **Own Fleet TDO**: Assigns vehicle, driver, helper(s), and ETA from the internal fleet pool
- **Vendor Fleet TDO**: Assigns a contractual vendor; rates are applied automatically from the backend (not entered manually)

After assignment, the TO is `Ready for Dispatch`. Drivers can see their assigned TOs in their account.

## Acceptance Criteria

### AC-1: TDO Own Fleet — Assignment Queue
- [ ] TDO (Own Fleet) sees all TOs with fleet type = OWN and status `Created`
- [ ] Filters: Source POI, Destination POI, Vehicle Type, TR Type (FG / Port), Urgency, Planned Delivery Date
- [ ] Columns: TO Number, Parent TR, Source POI, Destination POI, Quantity, Vehicle Type, Planned Delivery Date, Urgency

### AC-2: Own Fleet — Vehicle Assignment
- [ ] TDO selects a vehicle from available own-fleet vehicles:
  - Filtered by: Status = Available, Vehicle Type matching TO requirement, assigned POI near source
- [ ] System shows: Registration, Type, Capacity, Current POI, Last Trip Date, expiring documents (insurance / fitness certificate)
- [ ] System prevents assigning: vehicles Under Maintenance, vehicles already On active Trip
- [ ] One vehicle per TO

### AC-3: Own Fleet — Driver Assignment
- [ ] TDO selects a driver from available pool
- [ ] Only Available drivers shown — Status = Available, not On Trip, **not On Leave**, valid license
- [ ] System prevents assigning drivers with expired licenses
- [ ] **One driver cannot be assigned to multiple active TOs** simultaneously — conflict check enforced
- [ ] Driver linked to assigned vehicle on this TO

### AC-4: Helper Assignment (Optional)
- [ ] TDO optionally assigns one or more helpers from available pool (Status = Available, not On Trip)
- [ ] Helpers linked to driver + TO
- [ ] Conflict check: helper not already assigned to a conflicting active TO

### AC-5: ETA Assignment
- [ ] TDO enters **Estimated Time of Arrival (ETA)** at destination (date + time)
- [ ] ETA pre-suggested based on planned delivery date + route estimated duration (from MDM-02)
- [ ] ETA stored on TO and visible to all stakeholders

### AC-6: TO Status Transitions (Own Fleet)
- [ ] On vehicle + driver assignment: TO status → `Assigned`
- [ ] On ETA confirmed: TO status → `Ready for Dispatch`
- [ ] All assignment actions audit logged

### AC-7: TDO Vendor Fleet — Assignment Queue
- [ ] TDO (Vendor Fleet) sees all TOs with fleet type = VENDOR and status `Created`
- [ ] Same filters as Own Fleet queue

### AC-8: Vendor Fleet — Contractual Vendor Assignment
- [ ] TDO selects a contractual vendor from the active vendor list (MDM-03, vendor_type = CONTRACTUAL)
- [ ] Vendor list shows: Company Name, Fleet Info, Contact
- [ ] **Contractual rates are applied automatically from the backend** — TDO does not enter rates manually; rates are system-controlled and hidden from vendor view
- [ ] TDO may enter vendor's vehicle registration and driver name (manual entry or linked from vendor fleet records)
- [ ] TO status → `Assigned to Vendor` → `Ready for Dispatch`

### AC-9: Driver Account — Assigned TO List
- [ ] Driver logs into their account and sees a list of TOs assigned to them
- [ ] Each TO shows: TO Number, Source POI, Destination POI, Product(s), Quantity, Planned Delivery Date, ETA, Status
- [ ] Driver can view TO details: route, special instructions, contact information
- [ ] List shows only Active and upcoming TOs

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TO-02-1 | Vehicle assignment API (PATCH /transport-orders/{to_id}/vehicle) — available check, maintenance check, active trip conflict check | DFS-040-1 | Pending |
| TO-02-2 | Driver assignment API (PATCH /transport-orders/{to_id}/driver) — On Leave check, license expiry check, multi-active-TO conflict check | DFS-040-2 | Pending |
| TO-02-3 | Helper assignment API (PATCH /transport-orders/{to_id}/helpers) with conflict check | DFS-040-3 | Pending |
| TO-02-4 | ETA assignment API (PATCH /transport-orders/{to_id}/eta) with pre-suggestion from MDM-02 route duration | DFS-040-4 | Pending |
| TO-02-5 | Vehicle availability API (GET /vehicles/available?vehicle_type=&poi_id=) with expiry flags | DFS-040-5 | Pending |
| TO-02-6 | Driver availability API (GET /drivers/available) — excludes On Trip, On Leave, expired license | DFS-040-6 | Pending |
| TO-02-7 | Helper availability API (GET /helpers/available) | DFS-040-7 | Pending |
| TO-02-8 | Vendor assignment API (PATCH /transport-orders/{to_id}/vendor) — contractual vendor only; auto-apply rate from backend | DFS-040-8 | Pending |
| TO-02-9 | Contractual rate auto-application service — pulls pre-agreed rate from MDM-03, applies to TO cost record | DFS-040-9 | Pending |
| TO-02-10 | TO status transitions: Created → Assigned → Ready for Dispatch | DFS-040-10 | Pending |
| TO-02-11 | Driver account: assigned TO list API (GET /drivers/me/transport-orders) | DFS-040-11 | Pending |
| TO-02-12 | TDO Own Fleet assignment queue UI (list with filters, sort) | DFS-040-12 | Pending |
| TO-02-13 | Own Fleet TO assignment form UI — vehicle picker (with expiry flags), driver picker, helper picker, ETA input | DFS-040-13 | Pending |
| TO-02-14 | TDO Vendor Fleet assignment queue UI | DFS-040-14 | Pending |
| TO-02-15 | Vendor Fleet TO assignment form UI — contractual vendor picker, manual vehicle/driver entry; no rate input (auto-applied) | DFS-040-15 | Pending |
| TO-02-16 | Driver account UI — assigned TO list with TO detail view | DFS-040-16 | Pending |

## API Endpoints

```
PATCH  /api/v1/transport-orders/{to_id}/vehicle    Body: { vehicle_id }
PATCH  /api/v1/transport-orders/{to_id}/driver     Body: { driver_id }
PATCH  /api/v1/transport-orders/{to_id}/helpers    Body: { helper_ids[] }
PATCH  /api/v1/transport-orders/{to_id}/eta        Body: { eta_datetime }
PATCH  /api/v1/transport-orders/{to_id}/vendor     Body: { vendor_id, vehicle_registration?, driver_name? }

GET    /api/v1/vehicles/available?vehicle_type=&poi_id=&ownership=OWN
GET    /api/v1/drivers/available
GET    /api/v1/helpers/available

GET    /api/v1/drivers/me/transport-orders         # Driver's assigned TO list
GET    /api/v1/transport-orders/{to_id}            # TO detail
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View Own Fleet TO assignment queue | TDO (Own Fleet) |
| Assign vehicle / driver / helpers / ETA | TDO (Own Fleet) |
| View Vendor Fleet TO assignment queue | TDO (Vendor Fleet) |
| Assign contractual vendor to TO | TDO (Vendor Fleet) |
| View own assigned TOs | Driver |

- Own Fleet TDO and Vendor Fleet TDO are separate role specialisations — each sees only their queue
- Contractual rates are auto-applied from backend; TDO does not enter rates manually; rates hidden from vendor
- Driver sees only TOs assigned to them; read-only

## Dependencies

- **Requires**: TO-01 (created TOs routed by fleet type), MDM-05 (Vehicles), MDM-06 (Drivers), MDM-07 (Helpers), MDM-03 (Vendors + rates), MDM-02 (Routes for ETA suggestion)
- **Enables**: Trip lifecycle (Sprint 4), vehicle + driver status tracking

## Definition of Done

- [ ] Own Fleet assignment: vehicle (with maintenance + active trip conflict check), driver (On Leave + license + multi-active-TO conflict check), helper(s) (conflict check), ETA
- [ ] Vendor Fleet assignment: contractual vendor selection; rates auto-applied from backend (not manually entered)
- [ ] TO status transitions: Created → Assigned → Ready for Dispatch
- [ ] Driver account: assigned TO list visible to driver
- [ ] Audit logging on all assignment actions
- [ ] Unit tests > 80%
- [ ] UAT: TDO (Own Fleet) assigns vehicle + driver + helper + ETA; driver sees TO in their account
- [ ] UAT: TDO (Vendor Fleet) assigns contractual vendor; rate is applied automatically
- [ ] UAT: System blocks assignment of a driver who is On Leave or already assigned to an active TO
