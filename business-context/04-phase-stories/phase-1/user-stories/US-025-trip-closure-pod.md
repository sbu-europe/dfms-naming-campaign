---
title: Trip Closure with Proof of Delivery (POD)
story_id: US-025
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Trip Execution
sprint: Sprint 6
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/trip-management.md
related_stories:
  - US-021-trip-lifecycle.md
  - US-052-driver-mobile-interface.md
dependencies:
  - US-021-trip-lifecycle.md
tags: [transport, trip-closure, pod, critical]
---

# US-025: Trip Closure with Proof of Delivery (POD)

## User Story

**As a** Transport Planner  
**I want** trips to close automatically once delivery and QC are completed

## Business Context

POD is **critical** for:
- **Legal Proof**: Customer received goods
- **Billing**: Invoice can be generated
- **Dispute Resolution**: Evidence of delivery
- **Performance Tracking**: On-time delivery metrics
- **Inventory**: Update stock levels

**POD Components**:
- Recipient signature (digital)
- Recipient name and designation
- Delivery timestamp
- Delivery photos (goods, location)
- Delivered quantity
- Condition notes
- QC report (if applicable)

---

## Acceptance Criteria

### AC-1: POD Capture (Mobile Interface)
- [ ] System SHALL allow driver to capture POD via mobile-responsive web interface
- [ ] System SHALL require:
  - Recipient name *
  - Recipient designation *
  - Digital signature * (touch/stylus)
  - Delivery photo * (at least 1)
  - Delivered quantity *
- [ ] System SHALL optionally capture:
  - Recipient phone
  - Recipient email
  - Additional photos (up to 5 total)
  - Condition notes
  - QC report reference

### AC-2: Digital Signature
- [ ] System SHALL provide signature canvas (touch-enabled)
- [ ] System SHALL allow clearing and redrawing signature
- [ ] System SHALL save signature as image (PNG)
- [ ] System SHALL timestamp signature

### AC-3: Photo Capture
- [ ] System SHALL allow taking photos via camera
- [ ] System SHALL allow selecting from gallery
- [ ] System SHALL compress photos for upload
- [ ] System SHALL support offline mode (queue for sync)
- [ ] System SHALL geo-tag photos with GPS coordinates

### AC-4: Quantity Verification
- [ ] System SHALL display original quantity
- [ ] System SHALL allow confirming full delivery
- [ ] System SHALL allow declaring partial delivery (link to US-022)
- [ ] System SHALL validate delivered quantity ≤ original quantity

### AC-5: Trip Closure
- [ ] System SHALL update trip status to "Completed" after POD capture
- [ ] System SHALL update vehicle status to "Available"
- [ ] System SHALL update driver status to "Available"
- [ ] System SHALL calculate trip metrics:
  - Total duration
  - On-time delivery (yes/no)
  - Delay duration (if any)
- [ ] System SHALL trigger billing workflow

### AC-6: POD Document Generation
- [ ] System SHALL auto-generate POD document (PDF)
- [ ] System SHALL include:
  - Trip details
  - Delivery details
  - Signature
  - Photos
  - Timestamps
- [ ] System SHALL allow downloading POD
- [ ] System SHALL email POD to customer (if configured)

### AC-7: Offline POD Capture
- [ ] System SHALL allow POD capture offline
- [ ] System SHALL queue POD for sync when online
- [ ] System SHALL show sync status
- [ ] System SHALL retry failed uploads

---

## Functional Requirements

### FR-001: POD Capture Form (Mobile)
- [Critical] Mobile-optimized form
- [Critical] Signature canvas
- [Critical] Camera integration
- [High] Offline mode
- [High] GPS auto-capture

### FR-002: POD Document Generation
- [Critical] PDF generation with signature and photos
- [High] Branded template (company logo)
- [Medium] Multi-language support

### FR-003: POD Verification (Back-office)
- [High] POD review queue for TDO
- [High] POD approval/rejection
- [Medium] POD quality check (signature legible, photos clear)

### FR-004: POD Storage & Retrieval
- [Critical] Secure storage (S3/cloud)
- [High] POD search by trip/TO/date
- [Medium] POD archival (after 1 year)

---

## Business Rules

### BR-POD-001: Mandatory Fields
- Recipient name, signature, photo, quantity are mandatory
- **Enforcement**: Form validation

### BR-POD-002: Signature Validity
- Signature canvas must have strokes (not blank)
- **Enforcement**: Canvas validation

### BR-POD-003: Photo Quality
- Photos must be > 100 KB (not too small)
- **Enforcement**: File size check

### BR-POD-004: Trip Closure Gate
- Trip cannot be closed without POD
- **Exception**: Manager override for special cases
- **Enforcement**: Status validation

### BR-POD-005: On-Time Delivery
- On-time if delivered within planned delivery time + 30 min buffer
- **Enforcement**: Timestamp comparison

---

## Data Model

```typescript
ProofOfDelivery {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  recipient_name: String
  recipient_designation: String
  recipient_phone: String (nullable)
  recipient_email: String (nullable)
  
  signature_image_url: String
  signature_captured_at: Timestamp
  
  delivery_photos: JSON (array of URLs)
  delivery_timestamp: Timestamp
  gps_latitude: Decimal
  gps_longitude: Decimal
  
  delivered_quantity: Decimal
  is_full_delivery: Boolean
  condition_notes: Text (nullable)
  qc_report_id: UUID (FK, nullable)
  
  pod_document_url: String (generated PDF)
  
  captured_by: UUID (FK to User/Driver)
  captured_at: Timestamp
  synced_at: Timestamp (nullable)
  
  verified_by: UUID (FK, nullable)
  verified_at: Timestamp (nullable)
}

Trip {
  // ... existing fields ...
  
  pod_id: UUID (FK to ProofOfDelivery, nullable)
  is_on_time_delivery: Boolean (nullable, computed)
}
```

---

## UI/UX Requirements

### POD Capture Form (Mobile)
```
┌─────────────────────────────────────────┐
│ Proof of Delivery                       │
│ Trip: TRIP-20260211-0042                │
├─────────────────────────────────────────┤
│ Recipient Name: *                       │
│ [Karim Ahmed]                           │
│                                         │
│ Designation: *                          │
│ [Warehouse Manager]                     │
│                                         │
│ Phone: (optional)                       │
│ [01711-123456]                          │
│                                         │
│ Delivered Quantity: *                   │
│ [500] KG (Full Delivery ✓)              │
│                                         │
│ Delivery Photos: * (1/5)                │
│ [📷 Take Photo] [🖼️ Gallery]           │
│ [Photo thumbnail]                       │
│                                         │
│ Recipient Signature: *                  │
│ ┌─────────────────────────────────────┐ │
│ │ [Signature Canvas]                  │ │
│ │                                     │ │
│ │                                     │ │
│ └─────────────────────────────────────┘ │
│ [Clear Signature]                       │
│                                         │
│ Condition Notes: (optional)             │
│ ┌─────────────────────────────────────┐ │
│ │ Goods in good condition             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📍 Location: Mirpur Depot               │
│ 🕐 Time: Feb 13, 2026 11:30 AM          │
│                                         │
│ [Submit POD & Close Trip]               │
└─────────────────────────────────────────┘
```

### Generated POD Document (PDF)
```
┌─────────────────────────────────────────┐
│ [Company Logo]   PROOF OF DELIVERY      │
├─────────────────────────────────────────┤
│ POD Number: POD-20260211-0042           │
│ Date: February 13, 2026                 │
│                                         │
│ TRIP DETAILS:                           │
│ Trip ID: TRIP-20260211-0042             │
│ TO Number: TO-20260211-0042             │
│ Route: Bhaluka → Mirpur                 │
│ Product: Live Broiler                   │
│ Quantity: 500 KG                        │
│                                         │
│ DELIVERY DETAILS:                       │
│ Recipient: Karim Ahmed                  │
│ Designation: Warehouse Manager          │
│ Phone: 01711-123456                     │
│ Delivered Quantity: 500 KG (Full)       │
│ Delivery Time: 11:30 AM                 │
│ Location: Mirpur Depot                  │
│                                         │
│ SIGNATURE:                              │
│ [Signature Image]                       │
│                                         │
│ DELIVERY PHOTOS:                        │
│ [Photo 1] [Photo 2]                     │
│                                         │
│ Driver: Rahim Ahmed (01711-654321)      │
│ Vehicle: DM-11-1234                     │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Capture POD
POST /api/v1/trips/{trip_id}/pod
Body: FormData {
  recipient_name, recipient_designation,
  recipient_phone?, recipient_email?,
  signature_image (file),
  delivery_photos[] (files),
  delivered_quantity, condition_notes?,
  gps_location
}
Response: {pod, trip_status: 'Completed', pod_document_url}

// Get POD
GET /api/v1/trips/{trip_id}/pod
Response: {pod, pod_document_url}

// Download POD document
GET /api/v1/pods/{pod_id}/document
Response: PDF file

// Verify POD (TDO)
POST /api/v1/pods/{pod_id}/verify
Body: {verified_by_user_id}
```

---

## Testing Scenarios

### Happy Path
1. Driver completes delivery → Opens POD form
2. Driver captures recipient info, signature, photos → Submits
3. POD saved → Trip status = "Completed"
4. PDF generated → Available for download

### Edge Cases
1. **Offline mode**: POD queued, synced when online
2. **Blank signature**: Validation error
3. **No photos**: Validation error
4. **Partial delivery**: Link to US-022

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle

### Enables
- → Billing/invoicing
- → Performance metrics
- → Dispute resolution

---

## Definition of Done
- [ ] POD capture form functional (mobile)
- [ ] Digital signature working
- [ ] Photo capture and upload
- [ ] Offline mode working
- [ ] PDF generation functional
- [ ] Trip closure on POD submission
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 6  
**Priority**: Critical

