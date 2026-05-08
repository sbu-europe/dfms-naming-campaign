---
title: Fuel Management & Tracking
story_id: US-058
phase: phase-1
module: Fleet Management
priority: Medium
status: Pending
epic: Fleet Operations
epic_id: EPIC-006
epic_name: Fleet & Vehicle Management
sprint: Sprint 18
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/06-fleet-management/fuel-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-053-vehicle-registration-master-data.md
  - US-057-vehicle-maintenance.md
  - US-060-trip-costing.md
dependencies:
  - US-053-vehicle-registration-master-data.md
  - US-021-trip-lifecycle.md
tags: [fleet, fuel, tracking, medium-priority]
---

# US-058: Fuel Management & Tracking

## User Story

**As a** Driver Supervisor  
**I want to** track fuel consumption so that fuel efficiency and cost can be analyzed

**Additional User Story** (from PRD):
- **As a** Driver, **I want to** record refueling events so that fuel tracking remains accurate

## Business Context

Fuel management enables:
- **Cost Control**: Monitor and reduce fuel costs
- **Efficiency Tracking**: Identify fuel-inefficient vehicles
- **Fraud Prevention**: Detect fuel theft or misuse
- **Budget Planning**: Forecast fuel expenses
- **Performance Metrics**: Calculate fuel efficiency per vehicle/driver

---

## Acceptance Criteria

### AC-1: Fuel Entry Recording (per PRD)
- [ ] System SHALL allow fuel entry with:
  - Fuel quantity *
  - Mileage reading *
  - Receipt image (upload)
- [ ] System SHALL allow Workshop Supervisor to record refueling on behalf of drivers
- [ ] System SHALL allow Driver to record refueling events
- [ ] System SHALL support receipt and mileage photo upload
- [ ] System SHALL validate odometer reading (must be > last reading)

### AC-2: Fuel Consumption Tracking (per PRD)
- [ ] System SHALL track:
  - Mileage
  - Fuel intake
- [ ] System SHALL calculate fuel consumption per kilometer
- [ ] Fuel calculations SHALL rely on last recorded mileage
- [ ] System SHALL calculate:
  - Fuel efficiency (km/liter) per vehicle
  - Fuel cost per km
  - Average fuel consumption per trip
  - Fuel efficiency trend
- [ ] System SHALL compare against vehicle baseline

### AC-3: Fuel Alerts
- [ ] System SHALL trigger alerts for:
  - Low fuel efficiency (< baseline - 20%)
  - Unusually high fuel consumption
  - Frequent refueling (possible leak)
  - Missing fuel receipts
- [ ] System SHALL notify Fleet Manager

### AC-4: Fuel Reports
- [ ] System SHALL generate reports:
  - Fuel consumption by vehicle
  - Fuel cost by vehicle/driver
  - Fuel efficiency trends
  - Monthly fuel expense summary
- [ ] System SHALL allow exporting to Excel/PDF

### AC-5: Fuel Budget Tracking
- [ ] System SHALL allow setting monthly fuel budget
- [ ] System SHALL track actual vs budget
- [ ] System SHALL alert when approaching budget limit (80%)

---

## Functional Requirements

### FR-001: Fuel Entry
- [Critical] Fuel entry form
- [Critical] Receipt upload
- [High] Bulk entry (CSV import)
- [Medium] Integration with fuel card system

### FR-002: Analytics
- [Critical] Fuel efficiency calculation
- [High] Trend analysis
- [High] Anomaly detection
- [Medium] Predictive analytics

### FR-003: Reporting
- [High] Standard reports
- [High] Custom date ranges
- [Medium] Automated monthly reports

---

## Business Rules

### BR-FUEL-001: Fuel Efficiency Baseline
- Covered Van: 8-10 km/liter
- Open Truck: 6-8 km/liter
- **Enforcement**: Vehicle type configuration

### BR-FUEL-002: Anomaly Detection
- Alert if fuel efficiency < (baseline - 20%)
- **Enforcement**: Calculation logic

### BR-FUEL-003: Odometer Validation
- New odometer reading must be > last reading
- **Enforcement**: Validation check

---

## Data Model

```typescript
FuelEntry {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  trip_id: UUID (FK, nullable)
  
  fuel_date: Date
  fuel_station: String
  fuel_type: Enum (Diesel, Petrol, CNG)
  
  quantity_liters: Decimal
  cost: Decimal
  cost_per_liter: Decimal (computed)
  
  odometer_reading: Integer
  distance_since_last_fuel: Integer (computed)
  fuel_efficiency_km_per_liter: Decimal (computed)
  
  receipt_url: String (nullable)
  notes: Text (nullable)
  
  recorded_by: UUID (FK to User)
  created_at: Timestamp
}

VehicleFuelMetrics {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  
  period_start: Date
  period_end: Date
  
  total_fuel_liters: Decimal
  total_fuel_cost: Decimal
  total_distance_km: Integer
  
  avg_fuel_efficiency_km_per_liter: Decimal
  avg_cost_per_km: Decimal
  
  baseline_efficiency: Decimal
  efficiency_variance_percentage: Decimal
  
  calculated_at: Timestamp
}

FuelBudget {
  id: UUID (PK)
  
  month: Date
  budget_amount: Decimal
  actual_spent: Decimal (computed)
  remaining: Decimal (computed)
  utilization_percentage: Decimal (computed)
}
```

---

## UI/UX Requirements

### Fuel Entry Form
```
┌─────────────────────────────────────────┐
│ Record Fuel Entry                       │
├─────────────────────────────────────────┤
│ Vehicle: * [DM-11-1234        ▼]        │
│                                         │
│ Fuel Date: * [2026-02-11]               │
│ Fuel Station: [Padma Oil Station]       │
│                                         │
│ Fuel Type: *                            │
│ ⚪ Diesel  ⚪ Petrol  ⚪ CNG             │
│                                         │
│ Quantity: * [50] Liters                 │
│ Cost: * [5,500] BDT                     │
│ Cost/Liter: 110 BDT (auto)              │
│                                         │
│ Odometer Reading: * [45,250] KM         │
│ Distance Since Last Fuel: 450 KM        │
│ Fuel Efficiency: 9.0 km/L ✅            │
│                                         │
│ Upload Receipt: [📄 Choose File]        │
│                                         │
│ [Cancel]              [Record Fuel]     │
└─────────────────────────────────────────┘
```

### Fuel Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Fuel Management Dashboard                                    │
├──────────────────────────────────────────────────────────────┤
│ Monthly Budget (February 2026):                              │
│ Budget: BDT 150,000  │  Spent: BDT 125,000 (83%) ⚠️         │
│ Remaining: BDT 25,000                                        │
│ ████████████████████░░░░                                     │
│                                                              │
│ Fleet Fuel Efficiency:                                       │
│ Vehicle      Efficiency  Baseline  Variance  Status         │
│ ──────────────────────────────────────────────────────────  │
│ DM-11-1234   9.0 km/L    8-10      +0%       ✅ Good        │
│ DM-11-5678   6.5 km/L    8-10      -19%      ⚠️ Below       │
│ DM-11-9012   5.2 km/L    8-10      -35%      🔴 Poor        │
│                                                              │
│ ⚠️ Alert: DM-11-9012 fuel efficiency critically low          │
│                                                              │
│ [View Detailed Report] [Export to Excel]                     │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Fuel Entries
POST /api/v1/fuel-entries
GET /api/v1/vehicles/{vehicle_id}/fuel-history

// Fuel Metrics
GET /api/v1/vehicles/{vehicle_id}/fuel-metrics
Query: ?period=last_30_days

// Fuel Dashboard
GET /api/v1/fleet/fuel-dashboard
Response: {
  budget, fleet_efficiency, alerts, top_consumers
}

// Fuel Reports
GET /api/v1/fleet/fuel-report
Query: ?date_from=2026-01-01&date_to=2026-02-11&format=pdf
```

---

## Testing Scenarios

### Happy Path
1. Record fuel entry → Entry saved
2. Calculate efficiency → 9.0 km/L (within baseline)
3. Generate report → PDF created

### Edge Cases
1. **Low efficiency**: Alert triggered
2. **Odometer reading < last**: Validation error
3. **Budget exceeded**: Alert sent

---

## Dependencies

### Prerequisites
- ✅ US-001: Vehicle Master Data
- ✅ US-021: Trip Lifecycle (for trip-specific fuel)

### Enables
- → US-060: Trip Costing (fuel cost component)
- → Fuel cost control
- → Efficiency monitoring

---

## Definition of Done
- [ ] Fuel entry functional
- [ ] Efficiency calculation accurate
- [ ] Alerts triggered
- [ ] Reports generation
- [ ] Budget tracking
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 17  
**Priority**: Medium

