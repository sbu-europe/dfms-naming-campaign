---
module: 02-master-data
specification: Vehicles (MD_VEH) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-053
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Vehicles — E2E Scenario Plan

**URL:** `/admin/master_data/vehicle/`

## A — Create & validation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_VEH_001 | Navigate Add Vehicle | Open `/admin/master_data/vehicle/` Add. Assert fieldsets per VehicleAdmin (Basic, Details, Documents, Status; Assignments/Telematics hidden on add). | P2 | Planned |
| MD_VEH_002 | Registration mandatory | Blank registration_number; save blocked. | P0 | Planned |
| MD_VEH_003 | Registration format | Enter invalid format if BD validator exists; assert error or document actual validation. | P1 | Planned |
| MD_VEH_004 | Vehicle Type mandatory | Blank vehicle_type; blocked. | P0 | Planned |
| MD_VEH_005 | Vehicle Type choices | Dropdown matches VehicleType choices. | P2 | Planned |
| MD_VEH_006 | Body Type optional | Leave body_type blank; save with reg+type succeeds (code: blank allowed). | P2 | Planned |
| MD_VEH_007 | Body Type choices when set | Open body_type; assert implemented choices. | P2 | Planned |
| MD_VEH_008 | Fuel Type optional | Leave fuel_type blank; create succeeds. | P2 | Planned |
| MD_VEH_009 | Fuel Type choices | Assert FuelType choices. | P2 | Planned |
| MD_VEH_010 | Capacity optional | Leave capacity/unit blank; create succeeds. | P2 | Planned |
| MD_VEH_011 | Capacity rejects 0/negative when provided | Enter 0/-5; assert validation if enforced. | P0 | Planned |
| MD_VEH_012 | Wheels optional | Leave number_of_wheels blank; succeeds. | P2 | Planned |
| MD_VEH_013 | Wheels rejects invalid when provided | 0/non-numeric rejected if validated. | P1 | Planned |
| MD_VEH_014 | Chassis optional | Leave chassis blank; succeeds. | P2 | Planned |
| MD_VEH_015 | Purchase/year/model/color optional | Leave blank; succeeds. | P3 | Planned |
| MD_VEH_016 | Allowed product category optional | Leave blank; succeeds. | P2 | Planned |
| MD_VEH_017 | GPS tracker optional | Leave gps_tracker_id blank; succeeds. | P2 | Planned |
| MD_VEH_018 | Mileage not editable on create | On Add form, assert odometer/mileage fields absent or non-editable. | P1 | Planned |
| MD_VEH_019 | Assigned driver on change only | On Add, assigned_driver not shown; on Change, can assign if field present. | P2 | Planned |
| MD_VEH_020 | Assigned POI on change only | Same as driver for assigned_poi. | P2 | Planned |
| MD_VEH_021 | Is active defaults True | Default checked Active; operational_status derives to no_active_to. | P2 | Planned |
| MD_VEH_022 | Expiry dates optional | Fitness/insurance blank; succeeds. | P2 | Planned |
| MD_VEH_023 | Remarks optional | Blank remarks; succeeds. | P3 | Planned |
| MD_VEH_024 | Active brands only | Brand autocomplete excludes inactive. | P0 | Planned |
| MD_VEH_025 | Mandatory-only create | Create with registration_number + vehicle_type (+ is_active). Assert list row. | P0 | Planned |
## B — Bulk / read / update / delete / RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_VEH_026 | Import template | Download vehicle CSV template headers. | P2 | Planned |
| MD_VEH_027 | Import valid rows | Import 5 unique regs; succeed. | P1 | Planned |
| MD_VEH_028 | Import inactive/missing brand fails | Invalid brand_name row fails. | P1 | Planned |
| MD_VEH_029 | Import missing required fails | Missing registration/type fails. | P0 | Planned |
| MD_VEH_030 | Export filtered | Export Active filter; CSV matches. | P2 | Planned |
| MD_VEH_031 | Search/filter/sort/pagination | Exercise search, filters, sort, pagination. | P2 | Planned |
| MD_VEH_032 | Update capacity | Edit capacity; save; audit if available. | P1 | Planned |
| MD_VEH_033 | Deactivate excludes from TO planning | Uncheck is_active; vehicle not selectable for new TO. | P0 | Planned |
| MD_VEH_034 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert retained as Inactive for history. | P0 | Planned |
| MD_VEH_035 | Hard delete blocked by TO/Trip | Deps present; hard delete blocked. | P0 | Planned |
| MD_VEH_036 | Depot Officer RBAC | Cannot mutate vehicles. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/master_data/vehicle/`
- Required on create: registration_number, vehicle_type only.
- Wipe prefix: `MCP-MD-<RUN_ID>-`
- Delete SSOT: **Soft delete** = Edit → Inactive; **Hard delete** = Delete + reason when no deps (see delete-operations plan).

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Body/Fuel/Capacity/Wheels | Suite: mandatory | **Optional** in model/admin |
| Soft / hard delete | Soft = Delete action | Soft = **Edit → Inactive**; Hard = Delete + reason when no deps |
