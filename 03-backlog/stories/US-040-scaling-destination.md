---
title: Scaling/Weighing at Destination POI
story_id: US-040
phase: phase-1
module: Operations (Scaling)
priority: High
status: Pending
epic: Scaling / Weight Management
epic_id: EPIC-012
epic_name: Scaling / Weight Management
sprint: Sprint 12
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../05-modules/04-poi-operations/scaling-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-039-scaling-source.md
  - US-042-unloading-operations.md
dependencies:
  - US-037-gate-in-destination.md
tags: [operations, scaling, weighing, destination, high-priority]
---

# US-040: Scaling/Weighing at Destination POI

## User Story

**As a** Scaling Operator  
**I want to** record scale-out weight to calculate net load

## Business Context

Scaling at destination ensures:
- **Delivery Verification**: Confirm received quantity matches shipped quantity
- **Loss Detection**: Identify product loss during transit
- **Quality Control**: Trigger QC if weight variance detected
- **Dispute Resolution**: Documented weight evidence
- **Billing Reconciliation**: Verify invoice quantity

**Weighing Process**:
```
Loaded Weight (Gross) → Unloading → Empty Weight (Tare) → Net Weight = Gross - Tare
```

**Weight Reconciliation**:
- Compare destination net weight with source net weight
- Flag variance if difference > 2%

---

## Acceptance Criteria

### AC-1: Gross Weight (Loaded Vehicle at Destination)
- [ ] System SHALL record gross weight with:
  - Trip ID *
  - Loaded weight (KG) * (from weighbridge)
  - Weighbridge ID *
  - Timestamp *
- [ ] System SHALL display source net weight for comparison

### AC-2: Tare Weight (Empty Vehicle after Unloading)
- [ ] System SHALL record tare weight
- [ ] System SHALL auto-calculate net weight = gross - tare
- [ ] System SHALL compare with source net weight

### AC-3: Weight Reconciliation
- [ ] System SHALL calculate variance:
  - Variance = Destination Net - Source Net
  - Variance % = (Variance / Source Net) × 100
- [ ] System SHALL flag if variance > 2%
- [ ] System SHALL require investigation for high variance
- [ ] System SHALL trigger QC if variance significant

### AC-4: Weight Slip Generation
- [ ] System SHALL generate destination weight slip
- [ ] System SHALL include:
  - Destination weights
  - Source weights (for comparison)
  - Variance calculation
  - Reconciliation status

---

## Functional Requirements

### FR-001: Weighbridge Integration
- [Critical] Integration with destination weighbridge
- [Critical] Manual weight entry (fallback)
- [High] Real-time weight capture

### FR-002: Reconciliation Logic
- [Critical] Variance calculation
- [High] Threshold-based flagging
- [High] QC trigger automation
- [Medium] Loss reason capture

---

## Business Rules

### BR-DEST-SCALE-001: Variance Threshold
- Flag if variance > 2% of source net weight
- **Enforcement**: Percentage calculation

### BR-DEST-SCALE-002: QC Trigger
- Trigger QC if variance > 5%
- **Enforcement**: Automated workflow

### BR-DEST-SCALE-003: Acceptance
- Destination can reject delivery if variance > 10% (without prior notice)
- **Enforcement**: Business rule

---

## Data Model

```typescript
// Uses same ScalingRecord model
ScalingRecord {
  // ... existing fields ...
  
  // Destination-specific
  source_net_weight_kg: Decimal (reference)
  destination_net_weight_kg: Decimal (computed)
  weight_variance_kg: Decimal (computed)
  weight_variance_percentage: Decimal (computed)
  
  reconciliation_status: Enum (
    Matched,
    Minor_Variance,
    Significant_Variance,
    Under_Investigation
  )
  
  variance_reason: Text (nullable)
  qc_triggered: Boolean
}
```

---

## UI/UX Requirements

### Weight Reconciliation Display
```
┌─────────────────────────────────────────┐
│ Scaling - Destination                   │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│ Product: Live Broiler                   │
│                                         │
│ SOURCE WEIGHT (Reference):              │
│ Net Weight: 520 KG                      │
│                                         │
│ DESTINATION WEIGHT:                     │
│ Gross (Loaded): [3015] KG               │
│ Tare (Empty): [2500] KG                 │
│ Net Weight: 515 KG                      │
│                                         │
│ RECONCILIATION:                         │
│ Variance: -5 KG (-0.96%) ✅             │
│ Status: Matched (within 2% threshold)   │
│                                         │
│ ✅ No QC required                       │
│                                         │
│ [Record Weights] [Generate Slip]        │
└─────────────────────────────────────────┘
```

### High Variance Alert
```
┌─────────────────────────────────────────┐
│ ⚠️ Significant Weight Variance          │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0042                │
│                                         │
│ Source Net Weight: 520 KG               │
│ Destination Net Weight: 480 KG          │
│ Variance: -40 KG (-7.69%) 🔴            │
│                                         │
│ ⚠️ Variance exceeds 5% threshold        │
│ QC inspection will be triggered         │
│                                         │
│ Possible Reasons:                       │
│ ⚪ Product loss during transit          │
│ ⚪ Spillage/leakage                     │
│ ⚪ Theft                                │
│ ⚪ Weighbridge calibration issue        │
│ ⚪ Other (specify)                      │
│                                         │
│ Reason: *                               │
│ ┌─────────────────────────────────────┐ │
│ │ Some product spillage observed      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Report & Trigger QC]          │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/scaling-records/destination
Body: {
  trip_id, poi_id, weighbridge_id,
  gross_weight_kg, tare_weight_kg
}
Response: {
  scaling_record, net_weight_kg,
  source_net_weight_kg, variance_kg,
  variance_percentage, reconciliation_status,
  qc_triggered
}
```

---

## Testing Scenarios

### Happy Path
1. Record gross weight → Saved
2. Unloading complete → Record tare weight
3. Net weight calculated → Variance < 2%
4. Reconciliation matched → No QC needed

### Edge Cases
1. **Variance 2-5%**: Flagged, minor variance
2. **Variance > 5%**: QC triggered
3. **Variance > 10%**: Rejection option

---

## Dependencies

### Prerequisites
- ✅ US-037: Gate-In at Destination
- ✅ US-039: Scaling at Source (for comparison)

### Enables
- → US-042: Unloading Operations
- → US-044: QC Lab Testing (if variance high)

---

## Definition of Done
- [ ] Destination weighing functional
- [ ] Variance calculation accurate
- [ ] Reconciliation logic working
- [ ] QC trigger automation
- [ ] Weight slip generation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 12  
**Priority**: High

