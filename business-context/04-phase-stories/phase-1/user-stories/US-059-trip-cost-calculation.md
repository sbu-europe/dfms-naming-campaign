---
title: Trip Cost Calculation & Analysis
story_id: US-059
phase: phase-1
module: Trip Costing
priority: High
status: Pending
epic: Financial Management
sprint: Sprint 17
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-core-operations/trip-management.md
related_stories:
  - US-060-profitability-analysis.md
  - US-058-fuel-management.md
  - US-029-vendor-payment-management.md
dependencies:
  - US-025-trip-closure-pod.md
tags: [costing, financial, trip-cost, high-priority]
---

# US-059: Trip Cost Calculation & Analysis

## User Story

**As an** Accounts or Financial Officer and Transport Planner  
**I want to** record and review trip-level costs for each completed TOs so that I can analyze delivery expenses, compare own vs vendor costs, and prepare accurate invoices

## Business Context

Trip costing enables:
- **Cost Transparency**: Know true cost per trip
- **Profitability Analysis**: Compare cost vs revenue
- **Budget Control**: Track actual vs planned costs
- **Pricing Decisions**: Data-driven rate setting
- **Vendor Comparison**: Compare own fleet vs vendor costs

**Cost Components**:
- Fuel cost
- Driver/helper wages
- Vehicle depreciation
- Maintenance allocation
- Toll/parking fees
- Vendor payment (if applicable)
- Overhead allocation

---

## Acceptance Criteria

### AC-1: Cost Component Capture
- [ ] System SHALL capture cost components:
  - **Fuel Cost**: From fuel entries or estimated
  - **Labor Cost**: Driver + helper wages (hourly or per trip)
  - **Vehicle Cost**: Depreciation per km
  - **Maintenance**: Allocated per km
  - **Tolls/Fees**: Actual expenses
  - **Vendor Payment**: If vendor fleet used
  - **Overhead**: Allocated percentage
- [ ] System SHALL allow manual cost entry for missing data

### AC-2: Automatic Cost Calculation (per PRD)
- [ ] System SHALL generate a Trip Cost record once a Trip is created
- [ ] System SHALL allow manual entry of:
  - Fuel cost
  - Vendor Trip Charge (If Vendor Fleet used)
  - Maintenance Allocation (Manual – applicable for Own Fleet)
  - Toll / Ferry / Parking (Manual – applicable for Own Fleet)
  - Other Operational Changes
- [ ] System SHALL calculate:
  - Total Trip Cost
  - Cost per KM
- [ ] System SHALL differentiate Own Fleet vs Vendor Fleet costing

### AC-3: Cost Breakdown Display
- [ ] System SHALL display cost breakdown:
  - Fuel: BDT X (Y%)
  - Labor: BDT X (Y%)
  - Vehicle: BDT X (Y%)
  - Other: BDT X (Y%)
  - Total: BDT X
- [ ] System SHALL show cost per km
- [ ] System SHALL compare with estimated cost

### AC-4: Cost Variance Analysis
- [ ] System SHALL calculate variance:
  - Actual cost vs estimated cost
  - Variance amount and percentage
- [ ] System SHALL flag high variance (> 20%)
- [ ] System SHALL require variance explanation if > 20%

### AC-5: Cost Reports
- [ ] System SHALL generate cost reports:
  - Trip-wise cost report
  - Route-wise average cost
  - Vehicle-wise cost analysis
  - Driver-wise cost analysis
  - Period-wise cost summary
- [ ] System SHALL allow exporting reports

---

## Functional Requirements

### FR-001: Cost Calculation Engine
- [Critical] Automatic cost calculation
- [Critical] Multi-component costing
- [High] Cost estimation (for planning)
- [Medium] ML-based cost prediction

### FR-002: Cost Data Collection
- [Critical] Integration with fuel management
- [High] Integration with vendor payments
- [High] Manual cost entry
- [Medium] Toll/expense tracking

### FR-003: Reporting & Analytics
- [High] Standard cost reports
- [High] Cost variance analysis
- [Medium] Cost trend analysis
- [Medium] Benchmarking

---

## Business Rules

### BR-COST-001: Cost Components
- Minimum components: Fuel + Labor + Vehicle
- **Enforcement**: Calculation logic

### BR-COST-002: Variance Threshold
- Flag if variance > 20% of estimated cost
- **Enforcement**: Percentage calculation

### BR-COST-003: Cost Allocation
- Overhead: 10% of direct costs (configurable)
- **Enforcement**: Configuration setting

---

## Data Model

```typescript
TripCost {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  // Cost components
  fuel_cost: Decimal
  driver_cost: Decimal
  helper_cost: Decimal
  vehicle_depreciation_cost: Decimal
  maintenance_allocation_cost: Decimal
  toll_fees: Decimal
  parking_fees: Decimal
  vendor_payment: Decimal (nullable)
  overhead_cost: Decimal
  other_costs: Decimal
  
  total_cost: Decimal (computed)
  cost_per_km: Decimal (computed)
  
  // Estimation & variance
  estimated_cost: Decimal (nullable)
  cost_variance: Decimal (computed)
  cost_variance_percentage: Decimal (computed)
  
  variance_explanation: Text (nullable)
  
  // Calculation metadata
  calculation_method: Enum (Automatic, Manual, Hybrid)
  calculated_at: Timestamp
  calculated_by: UUID (FK to User, nullable)
}

CostConfiguration {
  id: UUID (PK)
  
  // Per km rates
  fuel_cost_per_km_by_vehicle_type: JSON
  depreciation_cost_per_km_by_vehicle_type: JSON
  maintenance_cost_per_km_by_vehicle_type: JSON
  
  // Labor rates
  driver_hourly_rate: Decimal
  helper_hourly_rate: Decimal
  
  // Overhead
  overhead_percentage: Decimal
  
  updated_at: Timestamp
}
```

---

## UI/UX Requirements

### Trip Cost Breakdown
```
┌─────────────────────────────────────────┐
│ Trip Cost: TRIP-20260211-0042           │
├─────────────────────────────────────────┤
│ Route: Bhaluka → Mirpur (45 km)         │
│ Duration: 3.5 hours                     │
│ Fleet: Own Fleet                        │
│                                         │
│ COST BREAKDOWN:                         │
│ ┌─────────────────────────────────────┐ │
│ │ Fuel:         BDT 500  (25%)  ████  │ │
│ │ Driver:       BDT 350  (18%)  ███   │ │
│ │ Helper:       BDT 200  (10%)  ██    │ │
│ │ Vehicle:      BDT 450  (23%)  ████  │ │
│ │ Maintenance:  BDT 225  (11%)  ██    │ │
│ │ Tolls:        BDT 100  (5%)   █     │ │
│ │ Overhead:     BDT 183  (9%)   ██    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ TOTAL COST:     BDT 2,008               │
│ Cost per KM:    BDT 44.62               │
│                                         │
│ VARIANCE:                               │
│ Estimated:      BDT 2,000               │
│ Actual:         BDT 2,008               │
│ Variance:       +BDT 8 (+0.4%) ✅       │
│                                         │
│ [View Details] [Export Report]          │
└─────────────────────────────────────────┘
```

### High Variance Alert
```
┌─────────────────────────────────────────┐
│ ⚠️ High Cost Variance Detected          │
├─────────────────────────────────────────┤
│ Trip: TRIP-20260211-0050                │
│                                         │
│ Estimated Cost: BDT 2,000               │
│ Actual Cost: BDT 2,500                  │
│ Variance: +BDT 500 (+25%) 🔴            │
│                                         │
│ Variance Explanation Required:          │
│ ┌─────────────────────────────────────┐ │
│ │ Unexpected detour due to road       │ │
│ │ closure, added 15 km to trip        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Submit Explanation]                    │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Calculate trip cost (auto-triggered on trip completion)
POST /api/v1/trip-costs/calculate
Body: {trip_id}
Response: {trip_cost, cost_breakdown}

// Get trip cost
GET /api/v1/trips/{trip_id}/cost
Response: {trip_cost, cost_breakdown, variance}

// Update cost component (manual entry)
PATCH /api/v1/trip-costs/{trip_cost_id}
Body: {component: 'toll_fees', amount: 100}

// Get cost reports
GET /api/v1/trip-costs/reports
Query: ?report_type=route_wise&date_from=2026-01-01

// Get cost configuration
GET /api/v1/cost-configuration
PATCH /api/v1/cost-configuration
```

---

## Testing Scenarios

### Happy Path
1. Trip completed → Cost auto-calculated
2. View cost breakdown → All components displayed
3. Variance < 20% → No alert

### Edge Cases
1. **Variance > 20%**: Explanation required
2. **Missing fuel data**: Use estimated cost
3. **Vendor trip**: Use vendor payment as primary cost

---

## Dependencies

### Prerequisites
- ✅ US-025: Trip Closure with POD
- ✅ US-058: Fuel Management (fuel cost)
- ✅ US-029: Vendor Payment (vendor cost)

### Enables
- → US-060: Profitability Analysis
- → Pricing decisions
- → Cost control

---

## Definition of Done
- [ ] Cost calculation engine functional
- [ ] All cost components captured
- [ ] Cost breakdown display
- [ ] Variance analysis working
- [ ] Cost reports generation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 17  
**Priority**: High

