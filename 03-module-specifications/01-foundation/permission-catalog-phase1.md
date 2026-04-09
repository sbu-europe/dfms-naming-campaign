---
module: 01-foundation
specification: Phase 1 Permission Catalog
version: 1.0
phase: Phase 1
related_to: rbac.md
related_stories: US-004
last_updated: 2026-04-07
---

# Phase 1 Permission Catalog

**Format**: `Module.Feature.Action`

This document enumerates all permissions available in Phase 1. Each permission follows the `Module.Feature.Action` pattern defined in the [RBAC specification](rbac.md).

---

## Permission Actions Reference

| Action | Code | Description |
|--------|------|-------------|
| Create | C | Create new records |
| Read | R | View/list records |
| Update | U | Modify existing records |
| Delete | D | Remove/archive records |
| Approve | A | Approve workflows |
| Export | E | Export data (CSV/PDF) |
| Assign | AS | Assign resources to entities |
| Configure | CF | Modify system configuration |

---

## Permission Enforcement Model

Permissions are determined by **Role → Permission matrix** and **Access Scope** only. The system evaluates `Role + Access Scope` to determine effective permissions.

- **Role → Permission matrix** (this catalog) is the **sole enforcement authority** for what a user can do.
- **Access Scope** (Global / Local) controls *which records* a user can act on — enforced at the database row-level security and API middleware layers.
- **Self-approval prevention** is a **business rule**, not a permission gate: the system always checks `requester_id ≠ current_user_id` before allowing an approve action, regardless of role.

> **Functional Role Type (Requester / Approver / Executor)** is kept as **role metadata** for UI display, documentation, and filtering. It is **not** an independent runtime permission gate. The permission rows below (Role → Permission) already fully encode what each role can and cannot do.

### Role Metadata Reference

| Role | Functional Type (metadata) | Access Scope |
|------|---------------------------|-------------|
| Depot Officer | Requester | Local |
| Feed Mill Officer | Requester | Local |
| Commercial Officer | Requester | Local |
| Procurement Officer | Approver | Global |
| Distribution Officer (DO) | Executor | Local |
| Distribution Manager (DM) | Approver | Global |
| Transport Planner (TP) | Executor | Global |
| Transport Distribution Officer (TDO) - Own Fleet | Executor | Global |
| Transport Distribution Officer (TDO) - Vendor Fleet | Executor | Global |
| QC Inspector – Physical | Executor | Local |
| QA Lab Technician | Executor | Local |
| Command Center Officer | Executor | Local |
| Loading Personnel | Executor | Local |
| Unloading Personnel | Executor | Local |
| Driver Supervisor | Executor | Local |
| Driver Helper | Executor | Local |

> Access Scope is enforced at runtime. Functional Type is display-only metadata — permission rows in this catalog are the authoritative source for what each role may do.

---

## 1. Platform Administration

### Platform.Tenant

| Permission | Description | Roles |
|------------|-------------|-------|
| `Platform.Tenant.Create` | Provision new tenants | Super Admin |
| `Platform.Tenant.Read` | View tenant list and details | Super Admin |
| `Platform.Tenant.Update` | Modify tenant settings | Super Admin |
| `Platform.Tenant.Suspend` | Suspend/reactivate tenants | Super Admin |
| `Platform.Tenant.Configure` | Configure subscription plans | Super Admin |

### Platform.System

| Permission | Description | Roles |
|------------|-------------|-------|
| `Platform.System.Configure` | Global system settings | Super Admin |
| `Platform.System.Monitor` | View system health and metrics | Super Admin |

---

## 2. User Management

### UserMgmt.User

| Permission | Description | Roles |
|------------|-------------|-------|
| `UserMgmt.User.Create` | Invite new users | Tenant Admin |
| `UserMgmt.User.Read` | View user list and profiles | Tenant Admin |
| `UserMgmt.User.Update` | Modify user details | Tenant Admin |
| `UserMgmt.User.Deactivate` | Suspend/deactivate users | Tenant Admin |
| `UserMgmt.User.Reactivate` | Reactivate suspended users | Tenant Admin |
| `UserMgmt.User.BulkInvite` | Bulk CSV invitation | Tenant Admin |
| `UserMgmt.User.ResetPassword` | Admin-assisted password reset | Tenant Admin |
| `UserMgmt.User.Unlock` | Unlock locked accounts | Tenant Admin |
| `UserMgmt.User.Export` | Export user list | Tenant Admin |

### UserMgmt.Role

| Permission | Description | Roles |
|------------|-------------|-------|
| `UserMgmt.Role.Read` | View available roles | Tenant Admin |
| `UserMgmt.Role.Assign` | Assign roles to users | Tenant Admin |
| `UserMgmt.Role.UpdatePermissions` | Modify role permissions | Tenant Admin |

### UserMgmt.AuditLog

| Permission | Description | Roles |
|------------|-------------|-------|
| `UserMgmt.AuditLog.Read` | View audit logs | Tenant Admin |
| `UserMgmt.AuditLog.Export` | Export audit logs | Tenant Admin |

---

## 3. Master Data

### MasterData.Vehicle

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.Vehicle.Create` | Register new vehicles | Tenant Admin, Fleet Dept Admin |
| `MasterData.Vehicle.Read` | View vehicle list and details | All authenticated |
| `MasterData.Vehicle.Update` | Modify vehicle details | Tenant Admin, Fleet Dept Admin |
| `MasterData.Vehicle.Delete` | Archive vehicles | Tenant Admin |
| `MasterData.Vehicle.Export` | Export vehicle data | Tenant Admin, Fleet Dept Admin |
| `MasterData.Vehicle.BulkImport` | Bulk CSV import | Tenant Admin, Fleet Dept Admin |

### MasterData.Driver

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.Driver.Create` | Register new drivers | Tenant Admin, Fleet Dept Admin |
| `MasterData.Driver.Read` | View driver list and details | All authenticated |
| `MasterData.Driver.Update` | Modify driver details | Tenant Admin, Fleet Dept Admin |
| `MasterData.Driver.Delete` | Archive drivers | Tenant Admin |
| `MasterData.Driver.Export` | Export driver data | Tenant Admin, Fleet Dept Admin |
| `MasterData.Driver.BulkImport` | Bulk CSV import | Tenant Admin, Fleet Dept Admin |

### MasterData.Helper

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.Helper.Create` | Register new helpers | Tenant Admin, Fleet Dept Admin |
| `MasterData.Helper.Read` | View helper list and details | All authenticated |
| `MasterData.Helper.Update` | Modify helper details | Tenant Admin, Fleet Dept Admin |
| `MasterData.Helper.Delete` | Archive helpers | Tenant Admin |

### MasterData.Vendor

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.Vendor.Create` | Register new vendors | Tenant Admin, Procurement Dept Admin |
| `MasterData.Vendor.Read` | View vendor list and details | All authenticated |
| `MasterData.Vendor.Update` | Modify vendor details | Tenant Admin, Procurement Dept Admin |
| `MasterData.Vendor.Delete` | Archive vendors | Tenant Admin |
| `MasterData.Vendor.Export` | Export vendor data | Tenant Admin, Procurement Dept Admin |
| `MasterData.Vendor.BulkImport` | Bulk CSV import | Tenant Admin, Procurement Dept Admin |
| `MasterData.Vendor.Blacklist` | Blacklist/unblacklist vendors | Tenant Admin |

### MasterData.Product

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.Product.Create` | Create product catalog entries | Tenant Admin |
| `MasterData.Product.Read` | View product list | All authenticated |
| `MasterData.Product.Update` | Modify product details | Tenant Admin |

### MasterData.POI

| Permission | Description | Roles |
|------------|-------------|-------|
| `MasterData.POI.Create` | Create Points of Interest | Tenant Admin, Operations Dept Admin |
| `MasterData.POI.Read` | View POI list and details | All authenticated |
| `MasterData.POI.Update` | Modify POI details and geofence | Tenant Admin, Operations Dept Admin |
| `MasterData.POI.Delete` | Archive POIs | Tenant Admin |

---

## 4. Requisition Management

### Requisition.TR

| Permission | Description | Roles |
|------------|-------------|-------|
| `Requisition.TR.Create` | Create Transport Requisitions | Depot Officer, Feed Mill Officer, Commercial Officer |
| `Requisition.TR.Read` | View TR list and details | Distribution, Procurement, Transport roles |
| `Requisition.TR.Update` | Modify TR details | Creator (draft only) |
| `Requisition.TR.Cancel` | Cancel a TR | Creator, Tenant Admin |
| `Requisition.TR.Export` | Export TR data | Tenant Admin |

### Requisition.Approval

| Permission | Description | Roles |
|------------|-------------|-------|
| `Requisition.Approval.Approve` | Approve/reject TRs | Distribution Manager, Procurement Officer |
| `Requisition.Approval.Read` | View approval queue | Approvers |

---

## 5. Transport Management

### Transport.TO

| Permission | Description | Roles |
|------------|-------------|-------|
| `Transport.TO.Create` | Create Transport Orders | Transport Planner |
| `Transport.TO.Read` | View TO list and details | Transport, Distribution, Operations roles |
| `Transport.TO.Update` | Modify TO details | Transport Planner |
| `Transport.TO.Cancel` | Cancel a TO | Transport Planner, Tenant Admin |
| `Transport.TO.Assign` | Assign vehicles/drivers to TOs | Transport Planner, Transport Distribution Officer |
| `Transport.TO.Export` | Export TO data | Tenant Admin, Transport Dept Admin |

### Transport.Trip

| Permission | Description | Roles |
|------------|-------------|-------|
| `Transport.Trip.Read` | View trip details and status | All Operations roles |
| `Transport.Trip.UpdateStatus` | Progress trip through lifecycle states | Gate Operator, Scaling Operator, Loading/Unloading Operator |
| `Transport.Trip.Close` | Close trip with proof of delivery | Transport Distribution Officer |
| `Transport.Trip.Export` | Export trip data | Tenant Admin, Transport Dept Admin |

### Transport.Map

| Permission | Description | Roles |
|------------|-------------|-------|
| `Transport.Map.Read` | View real-time map dashboard | Command Center Officer, Transport Dept Admin |

---

## 6. Gate Operations

### Gate.Entry

| Permission | Description | Roles |
|------------|-------------|-------|
| `Gate.Entry.Create` | Record gate-in entries | Gate Operator |
| `Gate.Entry.Read` | View gate entry log | Gate Operator, Operations Dept Admin |
| `Gate.Entry.Update` | Modify gate entry (corrections) | Gate Operator |

### Gate.Exit

| Permission | Description | Roles |
|------------|-------------|-------|
| `Gate.Exit.Create` | Record gate-out entries | Gate Operator |
| `Gate.Exit.Read` | View gate exit log | Gate Operator, Operations Dept Admin |

### Gate.OnDemandTO

| Permission | Description | Roles |
|------------|-------------|-------|
| `Gate.OnDemandTO.Create` | Create on-demand TOs at gate | Gate Operator |

### Gate.Remarks

| Permission | Description | Roles |
|------------|-------------|-------|
| `Gate.Remarks.Create` | Log remarks on gate events | Gate Operator |
| `Gate.Remarks.Read` | View gate remarks | Operations Dept Admin |

---

## 7. Scaling / Weight Management

### Scaling.Weight

| Permission | Description | Roles |
|------------|-------------|-------|
| `Scaling.Weight.Create` | Record weight measurements | Scaling Operator |
| `Scaling.Weight.Read` | View weight records | Scaling Operator, Operations Dept Admin |
| `Scaling.Weight.Update` | Correct weight entries | Scaling Operator |
| `Scaling.Weight.Export` | Export weight data | Operations Dept Admin |

### Scaling.Queue

| Permission | Description | Roles |
|------------|-------------|-------|
| `Scaling.Queue.Create` | Generate queue tokens | Scaling Operator |
| `Scaling.Queue.Read` | View queue status | Scaling Operator, Operations Dept Admin |

---

## 8. Loading / Unloading

### Operations.Loading

| Permission | Description | Roles |
|------------|-------------|-------|
| `Operations.Loading.Create` | Record loading operations | Loading Personnel |
| `Operations.Loading.Read` | View loading records | Operations Dept Admin, Command Center Officer |
| `Operations.Loading.Update` | Update loading status | Loading Personnel |

### Operations.Unloading

| Permission | Description | Roles |
|------------|-------------|-------|
| `Operations.Unloading.Create` | Record unloading operations | Unloading Personnel |
| `Operations.Unloading.Read` | View unloading records | Operations Dept Admin, Command Center Officer |
| `Operations.Unloading.Update` | Update unloading status | Unloading Personnel |

### Operations.CommandCenter

| Permission | Description | Roles |
|------------|-------------|-------|
| `Operations.CommandCenter.Read` | Monitor all operations | Command Center Officer |
| `Operations.CommandCenter.Assign` | Reassign resources | Command Center Officer |

---

## 9. Quality Control

### QC.Inspection

| Permission | Description | Roles |
|------------|-------------|-------|
| `QC.Inspection.Create` | Create QC inspection records | QC Inspector |
| `QC.Inspection.Read` | View inspection records | QC Dept Admin, QC Inspector |
| `QC.Inspection.Update` | Update inspection results | QC Inspector |

### QC.LabTest

| Permission | Description | Roles |
|------------|-------------|-------|
| `QC.LabTest.Create` | Record lab test results | QA Lab Technician |
| `QC.LabTest.Read` | View lab test results | QC Dept Admin, QC Inspector, QA Lab Technician |
| `QC.LabTest.Update` | Modify lab test results | QA Lab Technician |

### QC.Sample

| Permission | Description | Roles |
|------------|-------------|-------|
| `QC.Sample.Create` | Collect and register samples | QC Inspector |
| `QC.Sample.Read` | View sample records | QC Dept Admin |

### QC.Report

| Permission | Description | Roles |
|------------|-------------|-------|
| `QC.Report.Create` | Generate QC reports | QC Dept Admin |
| `QC.Report.Read` | View QC reports | QC Dept Admin, Tenant Admin |
| `QC.Report.Export` | Export QC reports | QC Dept Admin |

### QC.Config

| Permission | Description | Roles |
|------------|-------------|-------|
| `QC.Config.Create` | Create test configurations and checklists | QC Dept Admin |
| `QC.Config.Read` | View QC configurations | QC Inspector, QA Lab Technician |
| `QC.Config.Update` | Modify test configurations | QC Dept Admin |

---

## 10. Vendor Management

### Vendor.Registration

| Permission | Description | Roles |
|------------|-------------|-------|
| `Vendor.Registration.Approve` | Approve vendor registrations | Procurement Dept Admin |
| `Vendor.Registration.Read` | View registration applications | Procurement Dept Admin, Procurement Officer |

### Vendor.Bidding

| Permission | Description | Roles |
|------------|-------------|-------|
| `Vendor.Bidding.Create` | Submit bids (vendor-side) | Vendor Admin |
| `Vendor.Bidding.Read` | View bids | Transport Planner, Procurement Officer |
| `Vendor.Bidding.Approve` | Accept/reject bids | Transport Planner |

### Vendor.Contract

| Permission | Description | Roles |
|------------|-------------|-------|
| `Vendor.Contract.Create` | Create vendor contracts | Procurement Dept Admin |
| `Vendor.Contract.Read` | View contracts | Procurement roles, Vendor Admin |
| `Vendor.Contract.Update` | Modify contracts | Procurement Dept Admin |

### Vendor.Payment

| Permission | Description | Roles |
|------------|-------------|-------|
| `Vendor.Payment.Create` | Process vendor payments | Accounts Officer |
| `Vendor.Payment.Read` | View payment records | Accounts Officer, Procurement Dept Admin |
| `Vendor.Payment.Approve` | Approve payments | Procurement Dept Admin |
| `Vendor.Payment.Export` | Export payment data | Accounts Officer |

### Vendor.Rating

| Permission | Description | Roles |
|------------|-------------|-------|
| `Vendor.Rating.Create` | Rate vendors | Transport Planner, Operations roles |
| `Vendor.Rating.Read` | View vendor ratings | All authenticated |

---

## 11. Fleet Management

### Fleet.Assignment

| Permission | Description | Roles |
|------------|-------------|-------|
| `Fleet.Assignment.Create` | Assign vehicles/drivers to trips | Transport Planner |
| `Fleet.Assignment.Read` | View assignments | Transport roles |

### Fleet.HelperAssignment

| Permission | Description | Roles |
|------------|-------------|-------|
| `Fleet.HelperAssignment.Create` | Assign helpers to trips | Transport Planner, Driver Supervisor |
| `Fleet.HelperAssignment.Read` | View helper assignments | Transport roles |

### Fleet.Fuel

| Permission | Description | Roles |
|------------|-------------|-------|
| `Fleet.Fuel.Create` | Record fuel entries | Driver Supervisor |
| `Fleet.Fuel.Read` | View fuel records | Fleet Dept Admin, Transport Dept Admin |
| `Fleet.Fuel.Export` | Export fuel data | Fleet Dept Admin |

---

## 12. Trip Costing

### Costing.TripCost

| Permission | Description | Roles |
|------------|-------------|-------|
| `Costing.TripCost.Read` | View trip cost breakdowns | Accounts Officer, Transport Dept Admin |
| `Costing.TripCost.Export` | Export cost reports | Accounts Officer |

### Costing.Invoice

| Permission | Description | Roles |
|------------|-------------|-------|
| `Costing.Invoice.Create` | Generate invoices | Accounts Officer |
| `Costing.Invoice.Read` | View invoices | Accounts Officer, Vendor Admin |
| `Costing.Invoice.Approve` | Approve invoices | Procurement Dept Admin |

---

## 13. Reporting

### Reports.Dashboard

| Permission | Description | Roles |
|------------|-------------|-------|
| `Reports.Dashboard.Read` | View dashboards | All authenticated (scope varies by role) |

### Reports.Report

| Permission | Description | Roles |
|------------|-------------|-------|
| `Reports.Report.Create` | Generate custom reports | Tenant Admin |
| `Reports.Report.Read` | View reports | Tenant Admin |
| `Reports.Report.Export` | Export reports | Tenant Admin |

---

## Summary

| Module | Feature Count | Permission Count |
|--------|---------------|------------------|
| Platform | 2 | 7 |
| UserMgmt | 3 | 14 |
| MasterData | 6 | 30 |
| Requisition | 2 | 7 |
| Transport | 3 | 11 |
| Gate | 4 | 8 |
| Scaling | 2 | 6 |
| Operations | 3 | 8 |
| QC | 5 | 14 |
| Vendor | 5 | 14 |
| Fleet | 3 | 7 |
| Costing | 2 | 5 |
| Reports | 2 | 4 |
| **Total** | **42** | **135** |

---

## Role-Permission Matrix (Summary)

| Role | Permission Scope |
|------|-----------------|
| **Super Admin** | `Platform.*`, `UserMgmt.*` (cross-tenant) |
| **Tenant Admin** | `UserMgmt.*`, `MasterData.*`, `Reports.*` (own tenant) |
| **Operational User** | Feature-specific permissions based on assigned role |

For the full per-role permission mapping, see the [RBAC specification](rbac.md).

---

## Appendix A: Role-Based Menu Access (Jira UI Matrix)

This appendix maps Jira’s **menu/sub-menu access** to DFMS **permission codes**. It is used by the UI to translate navigation items into permission gates.

> **Naming note**: Jira “Tenant Super Admin” is DFMS “Tenant Admin”. Jira “Gateman” is mapped to permissions currently labeled “Gate Operator” in some specs; UI labels should use Jira naming, permission codes remain stable.

### A.1 User Management & Master Data

| Jira Menu | Sub-menu | Expected Permission Codes (examples) |
|---|---|---|
| Tenant Admin Dashboard | - | `Reports.Dashboard.Read` (or dedicated `Admin.Dashboard.Read` if introduced) |
| Master Data Configuration → Dealers | - | `MasterData.Dealer.{Create,Read,Update,Delete}` |
| Master Data Configuration → Suppliers | - | `MasterData.Supplier.{Create,Read,Update,Delete}` |
| Master Data Configuration → POIs | - | `MasterData.POI.{Create,Read,Update,Delete}` |
| PIM → Product Category | - | `MasterData.ProductCategory.{Create,Read,Update,Delete}` |
| PIM → Product Listing | - | `MasterData.Product.{Create,Read,Update,Delete}` |
| Vehicles | - | `MasterData.Vehicle.{Create,Read,Update,Delete}` |
| Helpers | - | `MasterData.Helper.{Create,Read,Update,Delete}` |
| User Management → Drivers Master | - | `MasterData.Driver.{Create,Read,Update,Delete}` + `UserMgmt.User.ResetPassword` (admin-assisted OTP during registration, if applicable) |
| User Management → Users | - | `UserMgmt.User.{Create,Read,Update,Deactivate}` |

### A.2 Core Operations (PR/TR/Planning/Transport)

| Jira Menu | Sub-menu | Expected Permission Codes (examples) |
|---|---|---|
| Product Shipments | Requisition (PR) | `Requisition.PR.{Create,Read,Update,Delete}` |
| Requisition (TR) | - | `Requisition.TR.{Create,Read,Update,Delete}` |
| Shipment Planning | - | `Requisition.Approval.{Read,Approve}` + related update permissions |
| Transport Dashboard | Map | `Transport.Map.Read` |
| Transport Planning | Fleet Management | `Transport.TO.Assign` + `Fleet.Assignment.{Create,Read,Update}` |
| Bid Management | - | `Vendor.Bidding.{Create,Read,Update,Delete,Approve}` |
| Transport Order (TO) | - | `Transport.TO.{Create,Read,Update,Cancel}` |

### A.3 POI Operations (Gate/Scaling/QC/Load-Unload)

| Jira Menu | Sub-menu | Expected Permission Codes (examples) |
|---|---|---|
| Gate Management | Entry/Exit | `Gate.Entry.{Create,Read,Update}` and `Gate.Exit.{Create,Read,Update}` |
| Scale Management | Scale In/Out | `Scaling.Weight.{Create,Read,Update}` |
| Command Center Operations | Queue/Assign | `Operations.CommandCenter.{Read,Assign}` |
| Load & Unload Operations | Load/Unload queues | `Operations.Loading.{Read,Update}` + `Operations.Unloading.{Read,Update}` |
| QC & QA | Sampling/Analysis/Lab | `QC.Sample.{Create,Read,Update,Delete}` + `QC.Inspection.{Read,Update}` + `QC.LabTest.{Read,Update}` |

### A.4 Reporting & Costing

| Jira Menu | Sub-menu | Expected Permission Codes (examples) |
|---|---|---|
| Reports | Transport & Trip | `Reports.Report.{Read,Export}` |
| Reports | Vendor | `Reports.Report.{Read,Export}` |
| Reports | Fleet Performance | `Reports.Report.{Read,Export}` |
| Reports | Costing & Finance | `Reports.Report.{Read,Export}` |
| Costing | Trip Costing | `Costing.TripCost.{Read,Export}` + approval permission (e.g., `Costing.Invoice.Approve`) |

### A.5 Settings

| Jira Menu | Sub-menu | Expected Permission Codes (examples) |
|---|---|---|
| Settings | - | `UserMgmt.User.Update` (profile/settings) or a dedicated `User.Settings.Update` if introduced |
