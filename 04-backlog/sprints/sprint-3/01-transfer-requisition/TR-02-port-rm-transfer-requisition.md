---
jira_key: DFS-033
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: US-010
title: Port Consignment / Raw Materials Transfer Requisition
epic: Transfer Requisition
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-010-port-transfer-requisition.md
---

# TR-02 — Port Consignment / Raw Materials (RM) Transfer Requisition

## User Story

**As a** Commercial Team (LC Shipment) / Procurement Officer  
**I want to** create a Port Consignment Transfer Requisition for raw materials arriving at port  
**So that** RM imports can be transported to warehouses with LC documentation, customs tracking, and routing to the Procurement approval workflow

## Business Context

Port Consignment TRs handle Raw Material imports (Maize, Soybean, Vitamins) arriving at Chittagong / Mongla port. They differ from FG TRs in:

- **Source**: Always a Port POI
- **Products**: Raw Materials (RM) only
- **Documentation**: LC number, Bill of Lading, vessel details, C&F agent, customs status
- **Approval route**: Procurement approval (US-012 / TR-05), not Distribution

**Port TR flow**:
```
Procurement Officer creates Port TR → Stock/Capacity validation (TR-03) → Procurement Approval (TR-05) → Available for Planning
```

## Acceptance Criteria

### AC-1: Port TR Creation Form
- [ ] Procurement Officer can create Port TR with:
  - Transfer Type: Port Consignment Transfer
  - Source POI (Port only — filtered from active POIs by type = Port)
  - Destination POI (Warehouse / Factory)
  - Product (RM products only — from MDM-01)
  - Quantity (with UOM)
  - **LC Number** (mandatory)
  - Bill of Lading Number
  - Vessel Name + Voyage Name
  - Container Number(s) (multi-entry)
  - C&F Agent Name
  - Point of Loading (POL)
  - Estimated Time of Arrival (ETA)
  - Customs Status (Pending Clearance / Cleared)
  - Arrival Notice Attachment (file upload)
  - Requested Delivery Date + Priority
- [ ] System auto-generates TR number: `TR-PORT-YYYYMMDD-XXXX`
- [ ] Only Port-type POIs selectable as Source; only RM products selectable

### AC-2: LC & Shipping Documentation
- [ ] LC number stored and displayed on TR
- [ ] All uploaded documents (Arrival Notice) stored securely and linked to TR
- [ ] Documents downloadable from TR detail view

### AC-3: Customs Status Tracking
- [ ] Customs Status displayed and updatable: Pending / In Progress / Cleared
- [ ] Customs status change audit logged
- [ ] TR cannot be dispatched to transport if Customs Status ≠ Cleared (configurable)

### AC-4: Status Lifecycle & Audit
- [ ] Same lifecycle as FG TR: Draft → Submitted → Pending Approval → Approved / Rejected
- [ ] All actions audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TR-02-1 | Extend TransferRequisition model — Port-specific fields (LC, BoL, vessel, C&F, customs) | DFS-033-1 | Pending |
| TR-02-2 | Port TR creation API — type = PORT_CONSIGNMENT, RM-only product gate, Port-only source POI gate | DFS-033-2 | Pending |
| TR-02-3 | TR number auto-generation: `TR-PORT-YYYYMMDD-XXXX` | DFS-033-3 | Pending |
| TR-02-4 | Document upload for Arrival Notice (S3/blob storage, linked to TR) | DFS-033-4 | Pending |
| TR-02-5 | Customs status update API + audit log | DFS-033-5 | Pending |
| TR-02-6 | Port TR creation UI — LC + shipping document section | DFS-033-6 | Pending |
| TR-02-7 | Customs status badge + update control on TR detail page | DFS-033-7 | Pending |

## API Endpoints

```
POST   /api/v1/transfer-requisitions                   # Create Port TR (type=PORT_CONSIGNMENT)
PATCH  /api/v1/transfer-requisitions/{tr_id}/customs   # Update customs status
POST   /api/v1/transfer-requisitions/{tr_id}/documents # Upload Arrival Notice
GET    /api/v1/transfer-requisitions/{tr_id}/documents
```

## Dependencies

- **Requires**: MDM-04 (POI with Port type), MDM-01 (Product Master with RM type), TR-01 (shared TR model)
- **Enables**: TR-05 (Procurement Approval), TP-01 (TR Assessment after approval)

## Definition of Done

- [ ] Port TR creation with all LC and shipping documentation fields
- [ ] Document upload and storage working
- [ ] Customs status tracking with audit log
- [ ] Port-only source and RM-only product gates enforced
- [ ] Unit tests > 80%
- [ ] UAT: Procurement Officer can create Port TR with LC documents
