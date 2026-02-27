---
title: Scaling/Weighing at Source POI
story_id: US-039
phase: phase-1
module: Operations (Scaling)
priority: High
status: Pending
epic: Weighing Operations
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 12
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-operations-support/scaling-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-040-scaling-destination.md
  - US-041-loading-operations.md
dependencies:
  - US-035-gate-in-source.md
tags: [operations, scaling, weighing, source, high-priority]
---

# US-039: Scaling/Weighing at Source POI

## User Story

**As a** Scaling Operator  
**I want to** record vehicle weight so that accurate load calculations can be made

## Business Context

Scaling at source ensures:
- **Accurate Quantity**: Measure actual loaded weight
- **Billing Accuracy**: Invoice based on actual weight
- **Compliance**: Meet regulatory requirements
- **Dispute Prevention**: Documented weight evidence
- **Overload Prevention**: Ensure vehicle capacity not exceeded

**Weighing Process**:
```
Empty Weight (Tare) → Loading → Loaded Weight (Gross) → Net Weight = Gross - Tare
```

---

## Acceptance Criteria

### AC-1: Tare Weight (Empty Vehicle)
- [ ] System SHALL record tare weight with:
  - Trip ID *
  - Empty weight (KG) * (from weighbridge)
  - Weighbridge ID *
  - Timestamp * (auto-captured)
  - Operator name *
  - Photos (optional)
- [ ] System SHALL validate weight is reasonable (> 0, < max vehicle weight)

### AC-2: Gross Weight (Loaded Vehicle)
- [ ] System SHALL record gross weight with:
  - Trip ID *
  - Loaded weight (KG) * (from weighbridge)
  - Weighbridge ID *
  - Timestamp * (auto-captured)
  - Photos (optional)
- [ ] System SHALL validate gross > tare

### AC-3: Net Weight Calculation
- [ ] System SHALL auto-calculate net weight = gross - tare
- [ ] System SHALL compare net weight with planned quantity
- [ ] System SHALL flag variance if difference > 5%
- [ ] System SHALL update trip with actual loaded quantity

### AC-4: Overload Detection
- [ ] System SHALL check if net weight > vehicle capacity
- [ ] System SHALL prevent loading if overloaded
- [ ] System SHALL require supervisor approval for overload

### AC-5: Weight Slip Generation
- [ ] System SHALL generate weight slip (PDF) with:
  - Trip details
  - Tare, gross, net weights
  - Timestamps
  - Operator signature
- [ ] System SHALL allow printing weight slip
- [ ] System SHALL attach slip to trip documents

---

## Functional Requirements

### FR-001: Weighbridge Integration
- [Critical] Integration with digital weighbridge (API/serial)
- [Critical] Manual weight entry (fallback)
- [High] Real-time weight capture
- [Medium] Weighbridge calibration tracking

### FR-002: Weight Validation
- [Critical] Weight range validation
- [High] Variance detection
- [High] Overload prevention
- [Medium] Historical weight comparison

### FR-003: Documentation
- [Critical] Weight slip generation
- [High] Photo capture
- [Medium] Digital signature

---

## Business Rules

### BR-SCALE-001: Weighing Sequence
- Tare weight must be recorded before gross weight
- **Enforcement**: Sequence validation

### BR-SCALE-002: Variance Threshold
- Flag if variance > 5% of planned quantity
- **Enforcement**: Percentage calculation

### BR-SCALE-003: Overload Limit
- Net weight must not exceed vehicle capacity
- **Enforcement**: Capacity check

---

## Data Model

```typescript
ScalingRecord {
  id: UUID (PK)
  trip_id: UUID (FK)
  poi_id: UUID (FK)
  location_type: Enum (Source, Destination)
  
  weighbridge_id: String
  
  tare_weight_kg: Decimal
  tare_timestamp: Timestamp
  tare_operator: UUID (FK to User)
  tare_photos: JSON (nullable)
  
  gross_weight_kg: Decimal
  gross_timestamp: Timestamp
  gross_operator: UUID (FK to User)
  gross_photos: JSON (nullable)
  
  net_weight_kg: Decimal (computed)
  planned_quantity_kg: Decimal
  variance_kg: Decimal (computed)
  variance_percentage: Decimal (computed)
  
  is_overloaded: Boolean (computed)
  overload_approved_by: UUID (FK, nullable)
  
  weight_slip_url: String (nullable)
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### Tare Weight Entry
```
┌─────────────────────────────────────────┐
│ Scaling - Tare Weight (Empty)           │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Vehicle: DM-11-1234 (Covered Van, 5 MT) │
│                                         │
│ Weighbridge: [WB-01          ▼]         │
│                                         │
│ Empty Weight: *                         │
│ [2500] KG                               │
│ [🔄 Capture from Weighbridge]           │
│                                         │
│ Timestamp: 09:10 AM (auto)              │
│ Operator: Kamal Hossain                 │
│                                         │
│ Photos: [📷 Add Photos] (0/2)           │
│                                         │
│ [Cancel]              [Record Tare]     │
└─────────────────────────────────────────┘
```

### Gross Weight Entry
```
┌─────────────────────────────────────────┐
│ Scaling - Gross Weight (Loaded)         │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler                   │
│ Planned Quantity: 500 KG                │
│                                         │
│ Tare Weight: 2,500 KG ✅                │
│                                         │
│ Loaded Weight: *                        │
│ [3020] KG                               │
│ [🔄 Capture from Weighbridge]           │
│                                         │
│ Net Weight: 520 KG                      │
│ Variance: +20 KG (+4%) ✅ Within limit  │
│                                         │
│ Vehicle Capacity: 5,000 KG              │
│ Load: 520 KG (10.4%) ✅ Not overloaded  │
│                                         │
│ [Cancel]              [Record Gross]    │
└─────────────────────────────────────────┘
```

### Weight Slip (Generated PDF)
```
┌─────────────────────────────────────────┐
│ [Company Logo]   WEIGHT SLIP            │
├─────────────────────────────────────────┤
│ Slip No: WS-20260211-0042               │
│ Date: February 11, 2026                 │
│ Location: Bhaluka Warehouse             │
│                                         │
│ TRIP DETAILS:                           │
│ Trip ID: TRIP-20260211-0042             │
│ Vehicle: DM-11-1234                     │
│ Product: Live Broiler                   │
│                                         │
│ WEIGHT DETAILS:                         │
│ Tare Weight (Empty):    2,500 KG        │
│ Time: 09:10 AM                          │
│                                         │
│ Gross Weight (Loaded):  3,020 KG        │
│ Time: 09:40 AM                          │
│                                         │
│ Net Weight (Product):     520 KG        │
│ Planned Quantity:         500 KG        │
│ Variance: +20 KG (+4%)                  │
│                                         │
│ Weighbridge: WB-01                      │
│ Operator: Kamal Hossain                 │
│                                         │
│ Signature: _______________              │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Record tare weight
POST /api/v1/scaling-records/tare
Body: {
  trip_id, poi_id, weighbridge_id,
  tare_weight_kg, tare_operator_id
}

// Record gross weight
POST /api/v1/scaling-records/gross
Body: {
  trip_id, gross_weight_kg
}
Response: {
  scaling_record, net_weight_kg,
  variance_kg, variance_percentage,
  is_overloaded
}

// Generate weight slip
GET /api/v1/scaling-records/{scaling_record_id}/weight-slip
Response: PDF file
```

---

## Testing Scenarios

### Happy Path
1. Record tare weight → Saved
2. Loading complete → Record gross weight
3. Net weight calculated → Within variance
4. Weight slip generated → PDF available

### Edge Cases
1. **Variance > 5%**: Flagged for review
2. **Overloaded**: Blocked, supervisor approval required
3. **Gross < Tare**: Validation error

---

## Dependencies

### Prerequisites
- ✅ US-035: Gate-In at Source

### Enables
- → US-041: Loading Operations
- → US-036: Gate-Out at Source

---

## Definition of Done
- [ ] Tare/gross weight entry functional
- [ ] Net weight calculation accurate
- [ ] Variance detection working
- [ ] Overload prevention working
- [ ] Weight slip generation
- [ ] Weighbridge integration (or manual entry)
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 12  
**Priority**: High

