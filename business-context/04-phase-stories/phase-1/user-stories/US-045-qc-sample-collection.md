---
title: QC Sample Collection
story_id: US-045
phase: phase-1
module: Quality Control
priority: High
status: Pending
epic: QC Workflow
sprint: Sprint 14
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-operations-support/qc-workflow.md
related_stories:
  - US-044-qc-lab-testing.md
  - US-046-qc-test-configuration.md
dependencies:
  - US-042-unloading-operations.md
tags: [qc, quality-control, sample-collection, high-priority]
---

# US-045: QC Sample Collection

## User Story

**As a** QC Inspector  
**I want to** collect samples from incoming shipments  
**So that** products can be tested for quality compliance

## Business Context

Sample collection is the first step in QC workflow:
- **Systematic Sampling**: Ensure representative samples
- **Sample Tracking**: Unique sample IDs with QR codes
- **Chain of Custody**: Document sample handling
- **Lab Submission**: Transfer samples to lab for testing

---

## Acceptance Criteria

### AC-1: Sample Collection
- [ ] System SHALL allow creating sample collection record with:
  - Trip ID *
  - Product *
  - Sample quantity *
  - Collection point (gate, warehouse, etc.)
  - Sampling method (random, systematic, etc.)
  - Collector name *
  - Collection timestamp * (auto)
  - Photos (optional)
- [ ] System SHALL auto-generate unique sample ID with QR code

### AC-2: Sample Labeling
- [ ] System SHALL generate sample label with:
  - Sample ID (QR code)
  - Trip/TO number
  - Product name
  - Collection date/time
  - Collector name
- [ ] System SHALL allow printing labels

### AC-3: Sample Submission to Lab
- [ ] System SHALL record lab submission:
  - Lab name/location
  - Submitted by
  - Submission timestamp
  - Expected result date
- [ ] System SHALL update sample status to "In Lab"

### AC-4: Sample Tracking
- [ ] System SHALL track sample status:
  - Collected
  - In Transit to Lab
  - In Lab
  - Testing Complete
  - Disposed
- [ ] System SHALL maintain chain of custody

---

## Functional Requirements

### FR-001: Sample Collection Form
- [Critical] Quick collection form
- [Critical] QR code generation
- [High] Photo capture
- [High] Label printing

### FR-002: Sample Tracking
- [Critical] Status tracking
- [High] Chain of custody logging
- [Medium] Sample location tracking

---

## Business Rules

### BR-SAMPLE-001: Sample ID Format
- Format: SMP-YYYYMMDD-XXXX
- **Enforcement**: Auto-generation

### BR-SAMPLE-002: Mandatory Sampling
- Sampling required for high-risk products (e.g., perishables)
- **Enforcement**: Product configuration

---

## Data Model

```typescript
QCSample {
  id: UUID (PK)
  sample_id: String (unique, QR code)
  trip_id: UUID (FK)
  product_id: UUID (FK)
  
  sample_quantity: Decimal
  collection_point: String
  sampling_method: Enum (Random, Systematic, Stratified)
  
  collected_by: UUID (FK to User)
  collected_at: Timestamp
  collection_photos: JSON (nullable)
  
  status: Enum (
    Collected,
    In_Transit_To_Lab,
    In_Lab,
    Testing_Complete,
    Disposed
  )
  
  lab_name: String (nullable)
  submitted_to_lab_by: UUID (FK, nullable)
  submitted_to_lab_at: Timestamp (nullable)
  expected_result_date: Date (nullable)
  
  qr_code_url: String
  label_printed: Boolean
  
  created_at: Timestamp
}

SampleChainOfCustody {
  id: UUID (PK)
  sample_id: UUID (FK)
  
  action: Enum (Collected, Transferred, Received, Tested, Disposed)
  action_by: UUID (FK to User)
  action_at: Timestamp
  location: String
  notes: Text (nullable)
}
```

---

## UI/UX Requirements

```
┌─────────────────────────────────────────┐
│ QC Sample Collection                    │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler (515 KG)          │
│                                         │
│ Sample Quantity: * [2] KG               │
│                                         │
│ Collection Point:                       │
│ [Mirpur Depot - Gate    ▼]              │
│                                         │
│ Sampling Method:                        │
│ ⚪ Random  ⚪ Systematic  ⚪ Stratified   │
│                                         │
│ Photos: [📷 Add Photos] (0/3)           │
│                                         │
│ Sample ID: SMP-20260211-0042            │
│ [QR Code displayed]                     │
│                                         │
│ [Print Label] [Collect Sample]          │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/qc-samples
Body: {
  trip_id, product_id, sample_quantity,
  collection_point, sampling_method
}
Response: {sample, sample_id, qr_code_url}

POST /api/v1/qc-samples/{sample_id}/submit-to-lab
Body: {lab_name, expected_result_date}

GET /api/v1/qc-samples/{sample_id}/label
Response: PDF label
```

---

## Testing Scenarios

### Happy Path
1. Collect sample → Sample ID generated
2. Print label → Label printed
3. Submit to lab → Status updated

### Edge Cases
1. **Duplicate sample**: Prevented
2. **Missing QR printer**: Manual label option

---

## Dependencies

### Prerequisites
- ✅ US-042: Unloading Operations

### Enables
- → US-044: QC Lab Testing

---

## Definition of Done
- [ ] Sample collection form functional
- [ ] QR code generation working
- [ ] Label printing
- [ ] Lab submission workflow
- [ ] Sample tracking
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 14  
**Priority**: High

