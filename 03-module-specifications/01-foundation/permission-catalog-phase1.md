---
module: 01-foundation
specification: Phase 1 Permission Catalog
version: 1.0
phase: Phase 1
related_to: rbac.md
last_updated: 2026-04-07
related_stories: US-004, US-005, US-007, US-008, US-009
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
| `UserMgmt.User.Create` | Invite new users | Tenant Admin, Department Admin |
| `UserMgmt.User.Read` | View user list and profiles | Tenant Admin, Department Admin |
| `UserMgmt.User.Update` | Modify user details | Tenant Admin, Department Admin |
| `UserMgmt.User.Deactivate` | Suspend/deactivate users | Tenant Admin |
| `UserMgmt.User.Reactivate` | Reactivate suspended users | Tenant Admin |
| `UserMgmt.User.BulkInvite` | Bulk CSV invitation | Tenant Admin |
| `UserMgmt.User.ResetPassword` | Admin-assisted password reset | Tenant Admin, Department Admin |
| `UserMgmt.User.Unlock` | Unlock locked accounts | Tenant Admin |
| `UserMgmt.User.Export` | Export user list | Tenant Admin |

### UserMgmt.Role

| Permission | Description | Roles |
|------------|-------------|-------|
| `UserMgmt.Role.Read` | View available roles | Tenant Admin, Department Admin |
| `UserMgmt.Role.Assign` | Assign roles to users | Tenant Admin, Department Admin |
| `UserMgmt.Role.UpdatePermissions` | Modify role permissions | Tenant Admin |

### UserMgmt.AuditLog

| Permission | Description | Roles |
|------------|-------------|-------|
| `UserMgmt.AuditLog.Read` | View audit logs and dashboard | Super Admin, Tenant Admin |
| `UserMgmt.AuditLog.Export` | Export audit logs (CSV, JSON) | Super Admin, Tenant Admin |

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
| `Requisition.TR.Create` | Create Transport Requisitions | Depot Manager, Feed Mill Manager, Commercial Officer |
| `Requisition.TR.Read` | View TR list and details | Distribution, Procurement, Transport roles |
| `Requisition.TR.Update` | Modify TR details | Creator (draft only) |
| `Requisition.TR.Cancel` | Cancel a TR | Creator, Tenant Admin |
| `Requisition.TR.Export` | Export TR data | Tenant Admin, Department Admins |

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
| `Reports.Report.Create` | Generate custom reports | Tenant Admin, Department Admins |
| `Reports.Report.Read` | View reports | Tenant Admin, Department Admins |
| `Reports.Report.Export` | Export reports | Tenant Admin, Department Admins |

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
| **Department Admin** | `UserMgmt.User.{Create,Read,Update}`, `MasterData.*.{Read}`, Department-specific modules |
| **Operational User** | Feature-specific permissions based on assigned role |

For the full per-role permission mapping, see the [RBAC specification](rbac.md).
