---
source_document: PRD_DFMS_v1.0.md
source_sections: User Personas & Stakeholders, Internal Users, External Users
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
---

# User Personas & Stakeholders

## Internal Users (Organization-side)

### Administrative Roles

| Persona / Role | Key Responsibilities |
| --- | --- |
| **Super Admin** | Tenant onboarding, subscription control, role templates, system security, compliance monitoring |
| **Tenant Admin** | User onboarding, role assignment, master data setup, account recovery |
| **Department Admin** | Department-level user management (Transport, Distribution, QC, Fleet, Procurement) |

### Transport & Distribution

| Persona / Role | Key Responsibilities |
| --- | --- |
| **Commercial Officer** | Product requisition for port transfers, CNF clearance approval |
| **Distribution Officer (DO)** | Create TR from FG product requisitions with source/destination quantity planning |
| **Distribution Manager (DM)** | PR validation and approval, capacity override, PR → TR conversion |
| **Procurement Officer** | Port transfer requisition review/approval, TR creation, stock/capacity checks |
| **Transport Planner (TP)** | TO creation, vehicle & driver assignment, vendor bidding trigger |
| **Transport Distribution Officer** | Vehicle, driver, helper assignment for own fleet; vendor management for vendor fleet |

### POI Operations

| Persona / Role | Key Responsibilities |
| --- | --- |
| **Gate Man** | Gate-in/out logging, document verification, discrepancy logging |
| **Scaling Operator** | Scale-in/out entry, queue token generation, command center notification |
| **Command Center Officer** | Vehicle queue monitoring, loading/unloading assignment |
| **Loading Supervisor** | Load start/end tracking, coordination with QC |
| **Unloading Supervisor** | Unload start/end tracking, QC trigger |

### Quality Control

| Persona / Role | Key Responsibilities |
| --- | --- |
| **QC Inspector (Physical)** | Physical inspection, sampling, evidence capture |
| **QC Lab Personnel** | Lab test execution, result entry, report upload |
| **QC Supervisor / Manager** | QC pass/fail approval, escalation handling, QC analytics |

### Fleet & Finance

| Persona / Role | Key Responsibilities |
| --- | --- |
| **Driver Supervisor** | Driver-vehicle handover checklist, driver/helper attendance, availability status |
| **Accounts / Finance Officer** | Trip costing review, invoice approval, ERP sync |

---

## External Users (Outside Organization)

| Persona / Role | Key Responsibilities |
| --- | --- |
| **Vendor Admin** | Vendor profile management, bid participation, invoice submission |
| **Vendor Driver** | Trip execution via mobile app (uses Driver Mobile App with vendor-specific access) |
| **Vendor Helper** | Assist vendor driver during loading/unloading |

---

## Mobile App Users

| Persona | Mobile App | Key Features |
| --- | --- | --- |
| **Driver** | Driver Mobile App | Trip assignment, navigation, status updates, POD capture, fuel logging |
| **QC Supervisor** | QC Mobile App | QC event queue, inspection checklist, sample creation, lab test tracking, evidence capture |
| **Vendor** | Vendor Mobile App | Available bids, bid submission, assigned TOs, active trip tracking, trip history |

---

## Role Framework

| Role Category | Purpose | Access Level |
| --- | --- | --- |
| **Admin Roles** | Platform and organization control | Full system access (configurable via RBAC) |
| **Operations Roles** | Transport, distribution, gate, QC execution | Module-based task access |
| **Compliance Roles** | QC, audit, approvals | Role + workflow driven (approval rights) |
| **Finance Roles** | Costing, invoicing, reconciliation | Restricted, approval-based |
| **External Roles** | Vendors, drivers, agents | Isolated access via portal/mobile (vendor-specific data only) |

---

## User Journey Examples

### Transport Planner Journey
1. Reviews approved TRs in TR dashboard
2. Creates TO with vehicle quantity split
3. Assigns own fleet vehicle or triggers vendor bidding
4. Monitors trip execution in command center
5. Reviews trip completion and POD

### Driver Journey
1. Receives trip assignment notification (mobile app)
2. Views trip details (route, product, pickup/drop)
3. Starts trip, navigates to pickup POI
4. Updates status at milestones (gate-in, loading, in-transit, drop, gate-out)
5. Captures POD (signature + photos)
6. Submits trip completion

### QC Supervisor Journey
1. Views pending QC events in QC queue (mobile app)
2. Selects QC event, completes inspection checklist
3. Creates sample with QR label
4. Requests lab test
5. Reviews lab test results
6. Makes QC decision (Pass/Fail/Recheck)
7. Evidence photos uploaded

### Vendor Journey
1. Receives bid invitation notification (mobile app)
2. Reviews TO details (route, product, vehicle requirements)
3. Submits competitive bid with pricing
4. Wins bid, receives TO assignment
5. Assigns driver, vehicle, helper
6. Monitors trip execution
7. Reviews completed trip, submits invoice

---

## Summary

DFMS serves a **diverse user base** spanning:
- **Internal users** (20+ operational roles) across transport, distribution, POI operations, QC, and finance
- **External users** (vendors, vendor drivers) via dedicated portals and mobile apps
- **Administrative users** (Super Admin, Tenant Admin, Department Admins) for platform management

Each role has **task-specific access** enforced via RBAC, ensuring users see only relevant features and data for their responsibilities.
