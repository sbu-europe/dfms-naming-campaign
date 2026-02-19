---
title: Capacity Checking and Warnings
story_id: US-014
phase: phase-1
module: Product Requisition Management
priority: High
status: Pending
epic: Product Requisition Workflow
epic_id: EPIC-004
epic_name: POI Management & Geofencing
sprint: Sprint 3
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/product-requisition-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-009-fg-transfer-requisition.md
  - US-013-stock-validation.md
dependencies:
  - US-009-fg-transfer-requisition.md
  - US-001-vehicle-master-data.md
tags: [requisition, capacity, vehicle, validation, high-priority]
---

# US-014: Capacity Checking and Warnings

## User Story

**As a** Distribution Manager  
**I want the** system to check vehicle capacity requirements and warn if unusual quantities are requested  
**So that** transport planning is realistic and efficient

## Business Context

Capacity checking ensures:
- **Vehicle Availability**: Know how many vehicles needed
- **Cost Estimation**: Estimate transport cost based on vehicle count
- **Feasibility**: Flag unrealistic quantities (too large or too small)
- **Planning**: Help transport planners prepare adequate fleet

Capacity checks:
- **Vehicle Capacity Match**: Compare TR quantity vs typical vehicle capacity
- **Multi-Vehicle Estimation**: Calculate number of vehicles needed
- **Efficiency Warning**: Flag inefficient loads (e.g., 10% of vehicle capacity)

---

## Acceptance Criteria

### AC-1: Vehicle Capacity Calculation
- [ ] System SHALL calculate required vehicle capacity based on:
  - Total weight (KG/MT)
  - Product type (determines vehicle type)
  - Packing type (affects space utilization)
- [ ] System SHALL estimate number of vehicles needed
- [ ] System SHALL suggest vehicle type (Covered Van, Open Truck, etc.)

### AC-2: Capacity Warnings
- [ ] System SHALL warn if:
  - Quantity requires > 5 vehicles (large shipment)
  - Load efficiency < 50% (underutilized vehicle)
  - No suitable vehicle type available in fleet
  - Quantity is unusually high compared to historical TRs
- [ ] System SHALL display warning message with recommendation
- [ ] System SHALL allow proceeding despite warning

### AC-3: Vehicle Type Recommendation
- [ ] System SHALL recommend vehicle type based on:
  - Product handling requirements (from product master)
  - Quantity and weight
  - Route distance
- [ ] System SHALL show available vehicle count per type
- [ ] System SHALL highlight if recommended vehicle type unavailable

### AC-4: Cost Estimation
- [ ] System SHALL estimate transport cost based on:
  - Number of vehicles needed
  - Vehicle type
  - Distance
  - Rate per km (if available)
- [ ] System SHALL display cost range (min-max)
- [ ] System SHALL compare with historical costs for similar TRs

### AC-5: Historical Comparison
- [ ] System SHALL compare TR quantity with:
  - Average quantity for same route
  - Average quantity for same product
  - Maximum/minimum historical quantities
- [ ] System SHALL flag outliers (> 2 standard deviations)

---

## Functional Requirements

### FR-001: Capacity Calculation Engine
- [High] Calculate weight-based capacity requirement
- [High] Consider vehicle type capacity (from vehicle master)
- [Medium] Consider volume-based capacity (for bulky items)
- [Medium] Apply utilization factor (e.g., 85% practical capacity)

### FR-002: Vehicle Type Matching
- [High] Match product requirements to vehicle types
- [High] Check vehicle availability in fleet
- [Medium] Consider route suitability (e.g., heavy trucks for highways only)

### FR-003: Warning System
- [High] Configurable warning thresholds
- [High] Warning message templates
- [Medium] Admin configuration for warning rules

### FR-004: Cost Estimation
- [High] Basic cost calculation (vehicles × distance × rate)
- [Medium] Historical cost comparison
- [Low] ML-based cost prediction (future enhancement)

---

## Business Rules

### BR-CAP-001: Vehicle Capacity Standards
- Covered Van (5 MT): 5000 KG
- Open Truck (10 MT): 10000 KG
- Refrigerated Truck (5 MT): 5000 KG
- **Source**: Vehicle master data

### BR-CAP-002: Load Efficiency Threshold
- Warn if load efficiency < 50%
- **Rationale**: Avoid wasting vehicle capacity
- **Enforcement**: Warning display

### BR-CAP-003: Large Shipment Threshold
- Warn if requires > 5 vehicles
- **Rationale**: May need special planning
- **Enforcement**: Warning display

### BR-CAP-004: Outlier Detection
- Flag if quantity > (mean + 2×std_dev) of historical data
- **Enforcement**: Statistical analysis

---

## Data Model

```typescript
VehicleTypeCapacity {
  vehicle_type: Enum
  standard_capacity_kg: Decimal
  standard_capacity_cbm: Decimal (nullable, for volume)
  practical_utilization_factor: Decimal (default: 0.85)
}

TRCapacityAnalysis {
  id: UUID (PK)
  tr_id: UUID (FK)
  
  total_weight_kg: Decimal
  total_volume_cbm: Decimal (nullable)
  
  recommended_vehicle_type: Enum
  estimated_vehicle_count: Integer
  load_efficiency_percentage: Decimal
  
  warnings: JSON (array of warning objects)
  estimated_cost_min: Decimal (nullable)
  estimated_cost_max: Decimal (nullable)
  
  historical_avg_quantity: Decimal (nullable)
  is_outlier: Boolean
  
  calculated_at: Timestamp
}
```

---

## UI/UX Requirements

### Capacity Analysis Display on TR Form
```
┌─────────────────────────────────────────┐
│ Capacity Analysis                       │
├─────────────────────────────────────────┤
│ Total Weight: 500 KG                    │
│ Recommended Vehicle: Covered Van (5 MT) │
│ Vehicles Needed: 1                      │
│ Load Efficiency: 10% ⚠️                 │
│                                         │
│ ⚠️ Warning: Low Load Efficiency         │
│ This shipment will use only 10% of      │
│ vehicle capacity. Consider:             │
│ • Combining with other TRs              │
│ • Using smaller vehicle (if available)  │
│ • Waiting for more orders               │
│                                         │
│ Estimated Cost: BDT 4,500 - 5,500       │
│ (Based on 45 km × BDT 100-120/km)       │
│                                         │
│ Historical Comparison:                  │
│ • Avg for this route: 800 KG            │
│ • Your quantity: 500 KG (38% below avg) │
│                                         │
│ Available Fleet:                        │
│ • Covered Van (5 MT): 12 available ✅   │
│ • Open Truck (10 MT): 8 available       │
└─────────────────────────────────────────┘
```

### Large Shipment Warning
```
┌─────────────────────────────────────────┐
│ ⚠️ Large Shipment Alert                 │
├─────────────────────────────────────────┤
│ This TR requires 6 vehicles (30 MT).    │
│                                         │
│ Recommendations:                        │
│ • Notify Transport Planner in advance   │
│ • Consider splitting into multiple TRs  │
│ • Verify destination can receive all    │
│                                         │
│ Current Fleet Availability:             │
│ • Covered Van (5 MT): 12 available      │
│ • Need: 6 vehicles                      │
│ • Status: ✅ Sufficient                 │
│                                         │
│ [Cancel] [Proceed with Large Shipment]  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Analyze TR capacity
POST /api/v1/transfer-requisitions/analyze-capacity
Body: {
  line_items: [{product_id, quantity}],
  source_poi_id, destination_poi_id
}
Response: {
  total_weight, recommended_vehicle_type,
  estimated_vehicle_count, load_efficiency,
  warnings: [...],
  estimated_cost: {min, max},
  historical_comparison: {...},
  available_fleet: {...}
}

// Get vehicle type capacities
GET /api/v1/vehicle-types/capacities
Response: {
  vehicle_types: [
    {type, capacity_kg, capacity_cbm, utilization_factor}
  ]
}

// Get historical TR data for comparison
GET /api/v1/transfer-requisitions/historical-stats
Query: ?route={source}-{dest}&product_id={id}
Response: {
  avg_quantity, std_dev, min, max, count
}
```

---

## Testing Scenarios

### Happy Path
1. Create TR with normal quantity → Green, no warnings
2. Create TR with low quantity → Efficiency warning
3. Create TR requiring multiple vehicles → Large shipment warning

### Edge Cases
1. **Extremely large quantity**: Multiple warnings (large shipment + outlier)
2. **Product requires unavailable vehicle type**: Critical warning
3. **No historical data**: Skip comparison, show only capacity analysis
4. **Zero quantity**: Validation error (handled in US-009)

---

## Dependencies

### Prerequisites
- ✅ US-009: FG Transfer Requisition
- ✅ US-001: Vehicle Master Data

### Enables
- → Better TR quality
- → Improved transport planning

---

## Definition of Done
- [ ] Capacity calculation working
- [ ] Vehicle type recommendation
- [ ] Warning system functional
- [ ] Cost estimation displayed
- [ ] Historical comparison working
- [ ] Configurable thresholds
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 3  
**Priority**: High (Quality improvement)

