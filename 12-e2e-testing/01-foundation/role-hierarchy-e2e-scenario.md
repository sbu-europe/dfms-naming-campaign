---
module: 01-foundation
specification: Role Hierarchy (US-004) - Playwright E2E Implementation Plan
version: 1.0
phase: Phase 1
related_stories: US-004
source_spec: ../../03-module-specifications/01-foundation/rbac.md
test_implementation_reference: ../../../tests/e2e/modules/01-foundation/test_rbac_role_hierarchy_e2e.py
last_updated: 2026-04-24
---

# US-004 Role Hierarchy - Playwright E2E Implementation Plan

This document tracks the **implemented** Playwright E2E coverage for the US-004 role hierarchy / RBAC admin workflows.

## Test Cases (Single Table)

| Test Case ID | Area | Role | Test Scenario | Expected portal menu items (IDs) | Priority | Status |
|--------------|------|------|---------------|----------------------------------|----------|--------|
| TC01 | Admin (RBAC) | Tenant Admin | Invite user + assign role via Users admin (single-role UX) | N/A | P0 | Implemented (Pass) |
| TC02 | Admin (RBAC) | Tenant Admin | Change existing user role and verify persistence | N/A | P0 | Implemented (Pass) |
| TC03 | Tenant Portal | Tenant Admin | Role-based portal navigation matches permissions | All menu items (full portal) | P0 | Automated (Implemented) |
| TC04 | Tenant Portal | Depot Officer | Role-based portal navigation matches permissions | `requisitions`, `reports`, plus Master Data items permitted by role matrix | P0 | Automated (Implemented) |
| TC05 | Tenant Portal | Feed Mill Officer | Role-based portal navigation matches permissions | `requisitions`, `reports`, and limited Master Data (Product/Category read) | P0 | Automated (Implemented) |
| TC06 | Tenant Portal | Commercial Officer | Role-based portal navigation matches permissions | `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC07 | Tenant Portal | Procurement Officer | Role-based portal navigation matches permissions | `command_center`, `requisitions`, `transport_orders`, `vendors`, `reports`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC08 | Tenant Portal | Distribution Officer (DO) | Role-based portal navigation matches permissions | `command_center`, `requisitions`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC09 | Tenant Portal | Distribution Manager (DM) | Role-based portal navigation matches permissions | `command_center`, `requisitions`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC10 | Tenant Portal | Transport Planner (TP) | Role-based portal navigation matches permissions | `command_center`, `gate`, `requisitions`, `transport_orders`, `trips`, `reports`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC11 | Tenant Portal | Transport Distribution Officer (TDO) – Own Fleet | Role-based portal navigation matches permissions | `command_center`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC12 | Tenant Portal | Transport Distribution Officer (TDO) – Vendor Fleet | Role-based portal navigation matches permissions | `command_center`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC13 | Tenant Portal | Command Center Officer | Role-based portal navigation matches permissions | `command_center`, `gate`, `requisitions`, `transport_orders`, `trips`, plus Master Data read items granted by role | P0 | Automated (Implemented) |
| TC14 | Tenant Portal | Gateman | Role-based portal navigation matches permissions | `command_center`, `gate` | P0 | Automated (Implemented) |
| TC15 | Tenant Portal | Scaling Operator | Role-based portal navigation matches permissions | `command_center`, `gate`, `trip_costs` | P0 | Automated (Implemented) |
| TC16 | Tenant Portal | Loading Personnel | Role-based portal navigation matches permissions | `command_center`, `gate`, `trips` | P0 | Automated (Implemented) |
| TC17 | Tenant Portal | Unloading Personnel | Role-based portal navigation matches permissions | `command_center`, `gate`, `trips` | P0 | Automated (Implemented) |
| TC18 | Tenant Portal | QC Inspector – Physical | Role-based portal navigation matches permissions | `qc`, `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC19 | Tenant Portal | QA Lab Technician | Role-based portal navigation matches permissions | `qc`, `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC20 | Tenant Portal | Driver Supervisor | Role-based portal navigation matches permissions | `command_center`, `transport_orders`, `trips`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC21 | Tenant Portal | Driver | Role-based portal navigation matches permissions | `trips` | P0 | Automated (Implemented) |
| TC22 | Tenant Portal | Driver Helper | Role-based portal navigation matches permissions | `trips` | P0 | Automated (Implemented) |
| TC23 | Tenant Portal | Account Officer | Role-based portal navigation matches permissions | `requisitions`, `trip_costs`, `vendors`, `reports` | P0 | Automated (Implemented) |

## Tenant Portal — Role-Based Menu Access (Expanded Matrix)

This section adds the missing **tenant portal permission-based access** coverage requested for US-004.

### Preconditions / How tests run

- The E2E suite uses a **tenant-admin** session (from `E2E_USER_EMAIL/E2E_USER_PASSWORD`) to change the role of a separate **test user** (from `E2E_TEST_USER_EMAIL/E2E_TEST_USER_PASSWORD`) in Django Admin.
- After role change, it logs into the **tenant portal** via JWT (`/api/v1/auth/login/password/`) and validates the **portal navigation** (`/api/v1/portal/navigation/`) matches the expected menu for that role.
- Menu definitions are centralized in `apps/core/portal_navigation.py` (permission gated by `Menu.*` and selected Master Data perms).
- Role-permission matrix source is `apps/core/role_seed_data.py` (seed catalog for Phase 1).

### Menu items under test (portal navigation)

| Menu ID | Label | URL | Permission gate (any-of) |
|--------:|-------|-----|--------------------------|
| dashboard | Dashboard | `/dashboard/` | `Menu.TenantAdminDashboard.View` |
| command_center | Command Center | `/operations/command-center/dashboard/` | `Menu.CommandCenter.View` |
| gate | Gate Management | `/operations/gate/` | `Menu.Gate.View` |
| requisitions | Product Requisitions | `/product-requisitions/` | `Menu.Requisitions.View` |
| transport_orders | Transport Orders | `/transport-orders/` | `Menu.TransportOrders.View` |
| trips | Trips | `/trips/` | `Menu.Trips.View` |
| qc | QC Events | `/qc/events/` | `Menu.QC.View` |
| pois | Points of Interest | `/pois/` | `Menu.MasterData.View` OR `Menu.MasterData.POIs.View` OR `MasterData.POI.{Read,Write}` |
| vehicles | Vehicles | `/vehicles/` | `Menu.MasterData.View` OR `Menu.MasterData.Vehicles.View` OR `MasterData.Vehicle.{Read,Write}` |
| drivers | Drivers | `/drivers/` | `Menu.MasterData.View` OR `Menu.MasterData.Drivers.View` OR `MasterData.Driver.{Read,Write}` |
| helpers | Helpers | `/helpers/` | `Menu.MasterData.View` OR `Menu.MasterData.Helpers.View` OR `MasterData.Helper.{Read,Write}` |
| dealers | Dealers | `/dealers/` | `Menu.MasterData.View` OR `Menu.MasterData.Dealers.View` OR `MasterData.Dealer.{Read,Write}` |
| suppliers | Suppliers | `/suppliers/` | `Menu.MasterData.View` OR `Menu.MasterData.Suppliers.View` OR `MasterData.Supplier.{Read,Write}` |
| product_categories | Product Categories | `/products/categories/` | `Menu.MasterData.View` OR `Menu.MasterData.ProductCategories.View` OR `MasterData.ProductCategory.{Read,Write}` |
| products | Products | `/products/` | `Menu.MasterData.View` OR `Menu.MasterData.Products.View` OR `MasterData.Product.{Read,Write}` |
| zones | Zones | `/zones/` | `Menu.MasterData.View` OR `Menu.MasterData.Zones.View` OR `MasterData.Zone.{Read,Write}` |
| routes | Routes | `/routes/` | `Menu.MasterData.View` OR `Menu.MasterData.Routes.View` OR `MasterData.Route.{Read,Write}` |
| trip_costs | Trip Costs | `/costing/trip-costs/` | `Menu.Costing.View` |
| vendors | Vendors | `/vendors/` | `Menu.Vendors.View` |
| reports | Reports | `/reports/` | `Menu.Reports.View` |
| users | Users | `/users/` | `Menu.Users.View` |
| audit_logs | Audit Logs | `/audit-logs/` | `Menu.AuditLogs.View` |
| departments | Departments | `/departments/` | `Menu.Departments.View` |

### Test cases (role × expected portal menu)

| Test Case ID | Role | Expected portal menu items (IDs) | Priority | Status |
|--------------|------|----------------------------------|----------|--------|
| TC03 | Tenant Admin | All menu items (full portal) | P0 | Automated (Implemented) |
| TC04 | Depot Officer | `requisitions`, `reports`, plus Master Data items permitted by role matrix | P0 | Automated (Implemented) |
| TC05 | Feed Mill Officer | `requisitions`, `reports`, and limited Master Data (Product/Category read) | P0 | Automated (Implemented) |
| TC06 | Commercial Officer | `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC07 | Procurement Officer | `command_center`, `requisitions`, `transport_orders`, `vendors`, `reports`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC08 | Distribution Officer (DO) | `command_center`, `requisitions`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC09 | Distribution Manager (DM) | `command_center`, `requisitions`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC10 | Transport Planner (TP) | `command_center`, `gate`, `requisitions`, `transport_orders`, `trips`, `reports`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC11 | Transport Distribution Officer (TDO) – Own Fleet | `command_center`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC12 | Transport Distribution Officer (TDO) – Vendor Fleet | `command_center`, `transport_orders`, `trips`, `reports` | P0 | Automated (Implemented) |
| TC13 | Command Center Officer | `command_center`, `gate`, `requisitions`, `transport_orders`, `trips`, plus Master Data read items granted by role | P0 | Automated (Implemented) |
| TC14 | Gateman | `command_center`, `gate` | P0 | Automated (Implemented) |
| TC15 | Scaling Operator | `command_center`, `gate`, `trip_costs` | P0 | Automated (Implemented) |
| TC16 | Loading Personnel | `command_center`, `gate`, `trips` | P0 | Automated (Implemented) |
| TC17 | Unloading Personnel | `command_center`, `gate`, `trips` | P0 | Automated (Implemented) |
| TC18 | QC Inspector – Physical | `qc`, `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC19 | QA Lab Technician | `qc`, `requisitions`, `reports` | P0 | Automated (Implemented) |
| TC20 | Driver Supervisor | `command_center`, `transport_orders`, `trips`, plus any Master Data items granted by role | P0 | Automated (Implemented) |
| TC21 | Driver | `trips` | P0 | Automated (Implemented) |
| TC22 | Driver Helper | `trips` | P0 | Automated (Implemented) |
| TC23 | Account Officer | `requisitions`, `trip_costs`, `vendors`, `reports` | P0 | Automated (Implemented) |

## What This Automation Validates (US-004 alignment)

- **Role catalog enforcement (predefined roles)**: Role selection is dropdown-driven; tests do not rely on role-name string checks in code, only UI outcomes.
- **Department derivation**: Department is derived from `Role.department` and submitted as a hidden field in invitation flow.
- **Single-role assignment behavior**: The user ends up with one effective operational role in the admin UX and is visible in the Users list.
- **Portal menu gating**: Tenant portal sidebar is generated from stable permission codes (`Menu.*` and Master Data read/write) and reflects the effective role assignment.

## Implementation Notes

- Automated suite: `tests/e2e/modules/01-foundation/test_rbac_role_hierarchy_e2e.py`
- Tenant portal menu suite: `tests/e2e/modules/01-foundation/test_portal_role_menu_access_e2e.py`
- Test data is generated dynamically to avoid collisions in shared environments.
- Admin UI actions use resilient interactions (DOM form submit + keyboard search) to reduce flakiness under debug toolbar overlays.

