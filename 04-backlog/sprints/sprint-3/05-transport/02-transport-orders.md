---
jira_key: DFS-039
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 3"
story_id: ~
title: Transport — Transport Order Creation & TDO Assignment
epic: Transport
status: Delivered
story_points: 8
assignee: ~
delivered: 2026-05-07
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
- [x] Transport Planner can create TOs from TRs with status `Under Planning` or `Partially Allocated`
- [x] TR summary shown read-only on creation form (TR number, type, source/dest POI, vehicle type, vehicles required, delivery date)
- [x] Per-line product allocation table in TO creation form — one row per TR line item
- [x] Transport Planner inputs: fleet type, planned delivery date & time, C&F clearance note, notes
- [x] Per-line allocation input (UOM) with "already allocated" column (UOM + kg equivalent)
- [x] System auto-generates TO number: `TO-YYYYMMDD-XXXX`
- [ ] Fleet availability counts (own fleet / vendor fleet) — **carry-forward Sprint 4**
- [ ] C&F Clearance Note required gate for Port Consignment TOs — **currently optional**

### AC-2: TR Quantity Allocation Validation
- [x] `TOLineItem` model tracks per-line allocation (UOM), not just total kg on TO
- [x] Per-line validation: allocated qty ≤ remaining (requested − already allocated to other TOs)
- [x] Total allocated qty across all lines must be > 0
- [x] TR status advances to `Partially Allocated` after first TO created
- [ ] `Fully Allocated` auto-advance when all lines exhausted — **carry-forward Sprint 4**

### AC-3: Multi-TO per TR
- [x] Each TO references parent TR and line items via `TOLineItem`
- [x] TR list and detail show assigned TOs count with link to filtered TO list
- [ ] "Create Another TO" available from success screen — **carry-forward; currently redirect to list**

### AC-4: TO Routing by Fleet Type
- [x] TDO Own Fleet sees own fleet assignment section; vendor section hidden
- [x] TDO Vendor Fleet sees vendor assignment section; own fleet section hidden
- [x] Driver sees own assigned TOs only (filtered queryset)
- [x] Fleet section toggles dynamically on `fleet_type` dropdown change (JS)

### AC-5: TO Status Lifecycle (revised)
- [x] `Created` → `Assigned` → `Ready for Dispatch` (3-state simplified lifecycle)
- [x] `ASSIGNED_TO_VENDOR` removed — single `Assigned` status for both fleet types
- [x] Status auto-advances on save based on assignment completeness (single-pass)
- [x] Status badge styled (colour-coded pill with Bootstrap icon)

### AC-6: TDO Resource Assignment
- [x] TDO Own Fleet: vehicle, driver (select2 autocomplete), helpers (multi-select autocomplete), ETA datetime
- [x] TDO Vendor Fleet: assigned vendor, vehicle registration, driver name
- [x] Read-only access to Vehicles, Drivers, Helpers master data for `tdo_own_fleet`
- [x] Import/Export hidden for TDO read-only users
- [x] `tdo_own_fleet` / `tdo_vendor_fleet` / `driver` roles see Transport Orders in sidebar

### AC-7: Driver Access
- [x] Driver role sees only TOs where `driver = request.user.driver_profile`
- [x] Read-only detail view (no edit permissions)
- [x] Transport Orders menu visible in sidebar for driver role

### AC-8: Urgency on PR
- [x] Requester can edit `urgency` on a submitted PR (all other fields remain locked)

## Sub-tasks

| # | Sub-task | Status | Notes |
|---|----------|--------|-------|
| TO-01-1 | `TransportOrder` model + migration | ✅ Done | `TOLineItem` added for per-line allocation |
| TO-01-2 | TO creation admin view — 2-step (select TR → create form) | ✅ Done | `select_tr_view` + `create_from_tr_view` in admin |
| TO-01-3 | TO number auto-generation | ✅ Done | |
| TO-01-4 | Per-line TR quantity validation | ✅ Done | In `create_from_tr_view` |
| TO-01-5 | Multi-TO per TR | ✅ Partial | Multi-TO works; "Create Another" loop carry-forward |
| TO-01-6 | Fleet availability counts on form | ❌ Carry-forward | |
| TO-01-7 | TDO routing by fleet type | ✅ Done | Role-based fieldset visibility + sidebar |
| TO-01-8 | TO list (admin changelist) | ✅ Done | Role-tailored columns |
| TO-01-9 | TR detail — linked TOs display | ✅ Done | `assigned_tos_display` column |
| TO-01-10 | TO creation form UI (templates) | ✅ Done | `select_tr.html`, `create_from_tr.html` |
| TO-01-11 | TO detail UI — role-based sections + JS toggle | ✅ Done | `change_form.html` with fleet_type JS |
| TO-02 | TDO resource assignment + status auto-advance | ✅ Done | `save_model` in `TransportOrderAdmin` |
| TO-02-D | Driver read-only TO access | ✅ Done | `get_queryset` + permission overrides |

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
