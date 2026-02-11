---
title: QC Supervisor Mobile Interface
story_id: US-061
phase: phase-1
module: Mobile Applications
priority: High
status: Pending
epic: Mobile Apps
sprint: Sprint 18
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
related_stories:
  - US-044-qc-lab-testing.md
  - US-045-qc-sample-collection.md
  - US-051-qc-checklist-management.md
dependencies:
  - US-044-qc-lab-testing.md
tags: [mobile, qc, supervisor, high-priority]
---

# US-061: QC Supervisor Mobile Interface

## User Story

**As a** QC Supervisor  
**I want to** conduct quality inspections using a mobile interface  
**So that** I can perform QC activities efficiently at the inspection site

## Business Context

Mobile QC interface enables:
- **On-site Inspection**: Conduct QC at gate/warehouse
- **Real-time Data Entry**: Immediate recording of results
- **Photo Evidence**: Capture defects on-site
- **Efficiency**: Eliminate paper-based processes
- **Traceability**: Timestamp all QC activities

**Key Use Cases**:
- Pre-unloading QC notification
- Sample collection with QR code
- Visual inspection checklist
- Photo capture of defects
- Lab test request creation
- Sample tracking

---

## Acceptance Criteria

### AC-1: QC Notification & Context
- [ ] System SHALL notify QC Supervisor when:
  - Vehicle assigned for unloading
  - Unloading about to begin
  - QC required for specific product
- [ ] System SHALL display QC context:
  - POI From/To
  - Supplier/Dealer
  - Challan number
  - Date & time
  - Item name
  - Quantity
  - Vehicle details

### AC-2: Sample Collection (Mobile)
- [ ] System SHALL allow creating samples with:
  - Unload item code
  - Sample quantity
  - Sampling location (multiple sides)
  - Sampling start time
  - Sampling end time
  - Inspector remarks (mandatory)
  - Photos (multiple)
- [ ] System SHALL generate unique QR code per sample
- [ ] System SHALL allow printing QR label from mobile

### AC-3: Visual Inspection Checklist
- [ ] System SHALL display product-specific checklist
- [ ] System SHALL adapt checklist based on product category
- [ ] System SHALL allow marking items:
  - Pass/Fail/N/A
  - Comments per item
  - Photos for failed items
- [ ] System SHALL calculate overall inspection score

### AC-4: Physical & Nutritional Analysis Entry
- [ ] System SHALL allow entering:
  - Physical analysis (text)
  - Nutritional analysis (text)
  - Final result (QC Pass/Fail/Auto-Pass)
  - Inspector remarks (mandatory)
- [ ] System SHALL validate required fields

### AC-5: Lab Test Request
- [ ] System SHALL allow creating lab test request:
  - Sample ID (QR scan)
  - Test type
  - Priority
  - Sample send date & time
- [ ] System SHALL track sample status

### AC-6: Photo Capture & Upload
- [ ] System SHALL allow capturing photos:
  - Multiple photos per sample
  - Photo annotation
  - Automatic timestamp
  - Geolocation tagging
- [ ] System SHALL compress photos for mobile upload
- [ ] System SHALL support offline photo storage

### AC-7: Offline Mode
- [ ] System SHALL work offline for:
  - Sample collection
  - Checklist execution
  - Photo capture
- [ ] System SHALL sync data when online
- [ ] System SHALL show sync status

---

## Functional Requirements

### FR-001: Mobile-Optimized UI
- [Critical] Responsive web interface (mobile-first)
- [Critical] Touch-friendly controls
- [High] Camera integration
- [High] QR code scanning
- [Medium] Native app (future)

### FR-002: QC Workflow
- [Critical] Sample collection flow
- [Critical] Checklist execution
- [High] Lab test request
- [High] Photo management

### FR-003: Offline Capability
- [High] Offline data entry
- [High] Background sync
- [Medium] Conflict resolution

---

## Business Rules

### BR-QC-MOB-001: Mandatory Remarks
- Inspector remarks required for sample creation
- **Enforcement**: Form validation

### BR-QC-MOB-002: Photo Evidence
- Photos mandatory for failed checklist items
- **Enforcement**: Validation check

### BR-QC-MOB-003: Timestamp Accuracy
- All timestamps must be accurate (device time validation)
- **Enforcement**: Server time check

---

## Data Model

```typescript
// Same entities as US-044, US-045, US-051
// Mobile interface is a view/interaction layer

MobileSession {
  id: UUID (PK)
  user_id: UUID (FK)
  device_id: String
  
  session_start: Timestamp
  session_end: Timestamp (nullable)
  
  is_online: Boolean
  last_sync: Timestamp
  pending_sync_items: JSON
}
```

---

## UI/UX Requirements

### QC Dashboard (Mobile)
```
┌─────────────────────────────────────────┐
│ ☰  QC Dashboard        🔔 (3)  [User]   │
├─────────────────────────────────────────┤
│ 🔴 Pending QC (5)                       │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TRIP-20260211-0042                  │ │
│ │ Live Broiler • 515 KG               │ │
│ │ Bhaluka → Mirpur                    │ │
│ │ Vehicle: DM-11-1234                 │ │
│ │ Status: Arrived at Destination      │ │
│ │                                     │ │
│ │ [Start Inspection]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TRIP-20260211-0050                  │ │
│ │ Feed • 1,000 KG                     │ │
│ │ [Start Inspection]                  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 🟢 Completed Today (8)                  │
│ [View All]                              │
│                                         │
│ ⚠️ Offline Mode • Sync Pending (2)      │
└─────────────────────────────────────────┘
```

### Sample Collection (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Sample Collection                     │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler (515 KG)          │
│                                         │
│ Sample Quantity: *                      │
│ [2] KG                                  │
│                                         │
│ Sampling Location:                      │
│ ☑ Front  ☑ Middle  ☑ Rear              │
│                                         │
│ Sampling Start: *                       │
│ [10:30 AM] [Set Now]                    │
│                                         │
│ Sampling End: *                         │
│ [10:45 AM] [Set Now]                    │
│                                         │
│ Inspector Remarks: *                    │
│ ┌─────────────────────────────────────┐ │
│ │ Sample collected from multiple      │ │
│ │ locations. Birds appear healthy.    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Photos: (3/5)                           │
│ [📷] [📷] [📷] [+]                      │
│                                         │
│ Sample ID: SMP-20260211-0042            │
│ [QR Code displayed]                     │
│                                         │
│ [Print Label] [Create Sample]           │
└─────────────────────────────────────────┘
```

### Visual Inspection Checklist (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Visual Inspection                     │
├─────────────────────────────────────────┤
│ Sample: SMP-20260211-0042               │
│ Product: Live Broiler                   │
│                                         │
│ 1. Bird Activity Level: *               │
│    ⚪ Pass  ⚪ Fail  ⚪ N/A              │
│    [💬 Add Comment]                     │
│                                         │
│ 2. Feather Condition: *                 │
│    ⚪ Pass  ⚪ Fail  ⚪ N/A              │
│                                         │
│ 3. Eye Clarity: *                       │
│    ⚪ Pass  ❌ Fail  ⚪ N/A              │
│    [📷 Photo Required]                  │
│    Comment: "Some birds with cloudy    │
│    eyes, possible infection"            │
│                                         │
│ 4. Weight Uniformity: *                 │
│    ⚪ Pass  ⚪ Fail  ⚪ N/A              │
│                                         │
│ Overall Score: 3/4 (75%)                │
│                                         │
│ [Save Draft] [Complete Inspection]      │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// QC Mobile Dashboard
GET /api/v1/mobile/qc/dashboard
Response: {pending_qc, completed_today, alerts}

// Sample Collection (same as US-045)
POST /api/v1/qc-samples
Body: {trip_id, sample_quantity, sampling_locations, ...}

// Checklist Execution (same as US-051)
POST /api/v1/qc-checklist-executions
Body: {trip_id, checklist_template_id, checklist_items}

// Photo Upload
POST /api/v1/qc-photos/upload
Body: FormData (multipart)

// Offline Sync
POST /api/v1/mobile/sync
Body: {pending_items: [...]}
```

---

## Testing Scenarios

### Happy Path
1. Receive QC notification → Open mobile app
2. Start inspection → Context displayed
3. Collect sample → QR code generated
4. Execute checklist → All items marked
5. Upload photos → Photos saved
6. Complete inspection → Data synced

### Edge Cases
1. **Offline mode**: Data saved locally, synced later
2. **Poor network**: Photos queued for upload
3. **Device time incorrect**: Server time used

---

## Dependencies

### Prerequisites
- ✅ US-044: QC Lab Testing
- ✅ US-045: QC Sample Collection
- ✅ US-051: QC Checklist Management

### Enables
- → Efficient on-site QC
- → Real-time data capture
- → Reduced paperwork

---

## Definition of Done
- [ ] Mobile-responsive UI functional
- [ ] Sample collection working
- [ ] Checklist execution working
- [ ] Photo capture and upload
- [ ] QR code generation and scanning
- [ ] Offline mode working
- [ ] Background sync functional
- [ ] Unit tests > 85%
- [ ] UAT approved (on mobile devices)

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 18  
**Priority**: High

