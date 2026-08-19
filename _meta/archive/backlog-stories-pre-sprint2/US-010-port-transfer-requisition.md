---
title: Create Port Consignment Transfer Requisition (TR)
story_id: US-010
phase: phase-1
module: Product Requisition Management
priority: Critical
status: Pending
epic: Product Transfer Requisition Management
epic_id: EPIC-007
epic_name: Product Transfer Requisition Management
sprint: Sprint 4
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-026-realtime-map-dashboard.md
  - US-009-fg-transfer-requisition.md
  - US-012-procurement-approval.md
dependencies:
  - US-005-poi-master-data.md
  - US-006-product-master-data.md
  - US-026-realtime-map-dashboard.md
tags: [requisition, port-consignment, rm, lc, critical]
---

# US-010: Create Port Consignment Transfer Requisition (TR)

## User Story

**As a** Commercial Team (L.C Shipment) / Procurement Officer  
**I want to** create Port Consignment Transfer Requisition so that raw materials from port can be transported to warehouses with proper documentation and distribution breakdown

## Business Context

Port Consignment TRs are created for:
- **Raw Material Import**: Maize, soybean, vitamins arriving at Chittagong/Mongla port
- **LC-based Shipments**: Linked to Letter of Credit documents
- **Customs Clearance**: Requires proper documentation for customs

**Note**: This story focuses on the Port Consignment Transfer Requisition creation workflow. The transfer type selection mechanism is handled by **US-073: Requisition Transfer Type Configuration**, which dynamically controls form fields (including LC and shipping document fields), approval workflow (Procurement approval), and TR generation logic based on the selected transfer type.

Key differences from FG Transfer:
- Source is always a Port
- Products are Raw Materials (RM) only
- Requires LC Number and shipping documents (dynamically loaded via US-073)
- Customs clearance tracking
- Routes to Procurement approval (not Distribution)

---

## Acceptance Criteria

### AC-1: Port TR Creation
- [ ] System SHALL allow Commercial Officer to create Port TR with:
  - Transfer Type: Port Consignment Transfer (selected via US-073: Requisition Transfer Type Configuration)
  - Source POI (Port only)
  - Destination POI (Warehouse/Factory)
  - Product (RM only)
  - Quantity
  - LC Number (mandatory, dynamically required based on transfer type)
  - Bill of Lading Number (dynamically loaded via US-073)
  - Vessel Name, Voyage Name (dynamically loaded via US-073)
  - Container Number(s) (dynamically loaded via US-073)
  - C&F Agent Name (dynamically loaded via US-073)
  - Point of Loading (POL) (dynamically loaded via US-073)
  - Estimated Time of Arrival (ETA) (dynamically loaded via US-073)
  - Customs Status (Pending / Cleared)
  - Requested Delivery Date
  - Priority
  - Arrival Notice Attachment (dynamically loaded via US-073)
- [ ] System SHALL validate all mandatory fields
- [ ] System SHALL auto-generate TR number: `TR-PORT-YYYYMMDD-XXXX`
- [ ] System SHALL dynamically load Port Consignment-specific form fields based on selected transfer type (per US-073)
- [ ] System SHALL route to Procurement approval workflow (per US-073 transfer type logic)

### AC-2: LC & Shipping Documentation
- [ ] System SHALL capture LC details:
  - LC Number (unique per shipment)
  - LC Date
  - Supplier Name
  - Country of Origin
- [ ] System SHALL capture shipping documents:
  - Bill of Lading (B/L) Number
  - Container Numbers (multiple)
  - Vessel Name
  - Arrival Date
- [ ] System SHALL allow uploading documents (PDF, images)

### AC-3: Customs Clearance Tracking
- [ ] System SHALL track customs status:
  - Pending Clearance
  - Clearance In Progress
  - Cleared
  - On Hold
- [ ] System SHALL prevent TO creation until customs cleared
- [ ] System SHALL send alert when clearance delayed

### AC-4: Port-Specific Validation
- [ ] System SHALL validate source POI type = Port
- [ ] System SHALL validate product category = RM
- [ ] System SHALL validate destination is Warehouse/Factory (not Depot/Dealer)
- [ ] System SHALL calculate port demurrage risk (days at port)

---

## Functional Requirements

### FR-001: Port TR Form
- [Critical] Extended form with LC and shipping fields
- [Critical] Document upload capability
- [High] Container number multi-entry (comma-separated or list)
- [High] Customs status dropdown

### FR-002: LC Validation
- [Critical] LC number uniqueness check (per shipment)
- [High] LC expiry date validation
- [Medium] Integration with ERP for LC verification

### FR-003: Customs Tracking
- [Critical] Customs status workflow
- [High] Clearance date capture
- [High] Demurrage calculation (days at port × rate)
- [Medium] Customs document checklist

---

## Business Rules

### BR-PORT-001: RM Products Only
- Only RM category products allowed in Port TR
- **Enforcement**: Product filter

### BR-PORT-002: Port Source Mandatory
- Source POI must be type "Port"
- **Enforcement**: POI type validation

### BR-PORT-003: LC Number Required
- LC Number is mandatory for Port TRs
- **Enforcement**: Form validation

### BR-PORT-004: Customs Clearance Gate
- TO cannot be created until customs status = "Cleared"
- **Enforcement**: Status check during TO creation

### BR-PORT-005: Demurrage Alert
- Alert if shipment at port > 7 days without clearance
- **Enforcement**: Daily cron job

---

## Data Model

```typescript
TransferRequisition {
  // ... existing fields from US-009 ...
  
  // Port-specific fields
  lc_number: String (nullable, mandatory for Port TRs)
  lc_date: Date (nullable)
  supplier_name: String (nullable)
  country_of_origin: String (nullable)
  
  bill_of_lading_number: String (nullable)
  container_numbers: JSON (array of strings, nullable)
  vessel_name: String (nullable)
  arrival_date: Date (nullable)
  
  customs_status: Enum (
    Pending_Clearance,
    Clearance_In_Progress,
    Cleared,
    On_Hold
  ) (nullable, for Port TRs)
  customs_clearance_date: Date (nullable)
  
  demurrage_days: Integer (nullable, computed)
  demurrage_cost: Decimal (nullable)
}

PortTRDocument {
  id: UUID (PK)
  tr_id: UUID (FK)
  
  document_type: Enum (
    LC_Copy,
    Bill_of_Lading,
    Packing_List,
    Invoice,
    Certificate_of_Origin,
    Customs_Declaration,
    Other
  )
  
  file_name: String
  file_url: String
  uploaded_at: Timestamp
  uploaded_by: UUID (FK)
}
```

---

## UI/UX Requirements

### Port TR Creation Form
```
┌─────────────────────────────────────────┐
│ Create Port Consignment TR              │
├─────────────────────────────────────────┤
│ Transfer Type: Port Consignment         │
│                                         │
│ Source POI: *                           │
│ [Chittagong Port              ▼]        │
│                                         │
│ Destination POI: *                      │
│ [Select Warehouse...          ▼]        │
│                                         │
│ LC Details:                             │
│ LC Number: * [LC-2026-001]              │
│ LC Date: [DD/MM/YYYY]                   │
│ Supplier: [ABC Trading Co.]             │
│ Origin: [USA]                           │
│                                         │
│ Shipping Details:                       │
│ B/L Number: [BL-123456]                 │
│ Container(s): [CONT-001, CONT-002]      │
│ Vessel: [MV Cargo Express]              │
│ Arrival Date: [DD/MM/YYYY]              │
│                                         │
│ Customs Status: *                       │
│ ⚪ Pending  ⚪ In Progress  ⚪ Cleared   │
│                                         │
│ Product: [Maize (RM)          ▼]        │
│ Quantity: [1000] MT                     │
│                                         │
│ Upload Documents:                       │
│ [📄 LC Copy] [📄 B/L] [+ Add More]     │
│                                         │
│ [Save as Draft] [Submit for Approval]   │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/transfer-requisitions
Body: {
  transfer_type: 'Port_Consignment',
  lc_number, bill_of_lading_number,
  customs_status, ...
}

POST /api/v1/transfer-requisitions/{tr_id}/documents
Body: FormData (file upload)

PATCH /api/v1/transfer-requisitions/{tr_id}/customs-status
Body: {customs_status: 'Cleared', clearance_date: Date}

GET /api/v1/transfer-requisitions/demurrage-alerts
Response: {trs_at_risk: TR[]}
```

---

## Testing Scenarios

### Happy Path
1. Create Port TR with LC details → TR created
2. Upload LC and B/L documents → Documents stored
3. Update customs status to "Cleared" → TO creation enabled

### Edge Cases
1. **FG product in Port TR**: Validation error
2. **Non-port source**: Validation error
3. **Duplicate LC number**: Warning (same shipment)
4. **TO creation before customs clearance**: Blocked

---

## Dependencies

### Prerequisites
- ✅ US-005: POI Master Data
- ✅ US-006: Product Master Data

### Enables
- → US-012: Procurement Approval
- → US-015: TR Assessment

---

## Definition of Done
- [ ] Port TR creation functional
- [ ] LC and shipping fields working
- [ ] Document upload working
- [ ] Customs status tracking
- [ ] Demurrage calculation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 2  
**Priority**: Critical

