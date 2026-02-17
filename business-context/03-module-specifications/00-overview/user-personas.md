---
source_document: PRD_DFMS_v1.0.md
source_sections: Internal Users (Organization-side), External Users (Outside Organization), Standard Role Framework (For Any Organization)
extracted_date: 2026-02-13
---

## Internal Users (Organization-side)

| Persona / Role | User Type | Key Responsibilities |
| --- | --- | --- |
| Super Admin | Internal (Platform) | Tenant onboarding, subscription control, role templates, system security, compliance monitoring |
| Tenant Admin | Internal (Organization) | User onboarding, role assignment, master data setup, admin-assisted account recovery |
| Commercial Officer | Internal | Product requisition for Port transfer and CNF clearance approval confirmation |
| Distribution Officer | Internal | Create TR against the FG product requisition requests with Source and Destination wise quantity planning |
| Distribution Manager | Internal | PR validation and approval, capacity override approvals, PR → TR conversion |
| Procurement Officer | Internal | Port Transfer Requisition review and approval and TR creation, stock/capacity checks, coordination with commercial team |
| Transport Planner | Internal | TO creation, vehicle & driver assignment, vendor bidding trigger |
| Transport Distribution Officer (Own Fleet) | Internal | Vehicle, driver and helper assignment |
| Transport Distribution Officer (Vendor Fleet) | Internal | Managing Contractual and Non-contractual vendors for each TO |
| Gate Man | Internal | Gate-in/out logging, document verification, discrepancy logging |
| Scaling Operator | Internal | Scale-in/out entry, queue token generation, command center notification |
| Command Center Officer | Internal | Vehicle queue monitoring, loading/unloading assignment |
| Loading Supervisor | Internal | Load start/end tracking, coordination with QC |
| Unloading Supervisor | Internal | Unload start/end tracking, QC trigger |
| QC Inspector (Physical) | Internal | Physical inspection, sampling, evidence capture |
| QC Lab Personnel | Internal | Lab test execution, result entry, report upload |
| QC Supervisor / Manager | Internal | QC pass/fail approval, escalation handling, QC analytics |
| Accounts / Finance Officer | Internal | Trip costing review, invoice approval, ERP sync |


## External Users (Outside Organization)

| Persona / Role | User Type | Key Responsibilities |
| --- | --- | --- |
| Vendor Admin | External (Partner) | Vendor profile management, bid participation, invoice submission |


## Standard Role Framework (For Any Organization)

| Role Category | Purpose | Configurability |
| --- | --- | --- |
| Admin Roles | Platform and organization control | Fully configurable via RBAC |
| Operations Roles | Transport, distribution, gate, QC execution | Module-based access |
| Compliance Roles | QC, audit, approvals | Role + workflow driven |
| Finance Roles | Costing, invoicing, reconciliation | Restricted, approval-based |
| External Roles | Vendors, drivers, agents | Isolated access via portal/mobile |

# System Architecture & Technical Approach
