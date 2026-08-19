---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Fuel Management System, Fuel Management – Fuel Consumption Tracking, Fuel Management – Fuel Entry System, Fuel Management System
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [vehicle-management, trip-management]
---

# Fuel Management (Phase 2)

## Overview

Fuel Management tracks vehicle refueling events, fuel consumption, and mileage-based fuel efficiency for **own fleet vehicles**. It enables cost analysis, efficiency monitoring, and identification of anomalies (fuel theft, poor vehicle performance).

**Note:** This is a **Phase 2** feature. Phase 1 focuses on core transport operations; fuel tracking is deferred for later optimization.

### Purpose

- Record refueling events with quantity, cost, and mileage
- Calculate fuel consumption per kilometer
- Monitor fuel efficiency trends per vehicle
- Support fuel cost allocation to trips/departments
- Detect anomalies (excessive consumption, potential theft)
- Provide data for budgeting and cost control

---

## Fuel Entry System

### Purpose

Enable drivers or supervisors to log refueling events with supporting documentation.

### Fuel Entry Workflow

```
1. Driver refuels vehicle at gas station
2. Driver records fuel entry:
   - Vehicle (from dropdown or scan)
   - Fuel quantity (liters)
   - Fuel cost (amount paid)
   - Current odometer reading (km)
   - Refueling date/time
   - Upload receipt photo
   - Upload odometer photo (proof of mileage)
3. System validates:
   - Vehicle exists and is own fleet (not vendor)
   - Odometer reading > previous reading (no backdating)
4. System stores fuel entry
5. System calculates:
   - Distance since last refuel (current odo - previous odo)
   - Fuel consumption (liters / distance = L/km)
   - Cost per km (fuel cost / distance)
```

### Data Model

```typescript
interface FuelEntry {
  fuel_entry_id: string;
  vehicle_id: string;
  
  // Fuel Details
  fuel_quantity_liters: number;
  fuel_cost: number;
  fuel_currency: 'BDT' | 'USD';
  fuel_type: 'DIESEL' | 'PETROL' | 'CNG';
  
  // Mileage
  odometer_reading_km: number;      // Current reading
  distance_since_last_refuel_km?: number; // Calculated
  
  // Fuel Efficiency
  fuel_consumption_kmpl?: number;   // Km per liter (calculated)
  cost_per_km?: number;             // Fuel cost per km
  
  // Documentation
  receipt_image_url?: string;       // Fuel receipt photo
  odometer_image_url?: string;      // Odometer reading photo
  
  // Refueling Details
  refueling_date: Date;
  refueling_location?: string;      // Gas station name/location
  
  // Entry Context
  entered_by: string;               // Driver or Supervisor
  entry_type: 'DRIVER_ENTRY' | 'SUPERVISOR_ENTRY';
  
  // Metadata
  created_at: Date;
  tenant_id: string;
}
```

### Fuel Consumption Calculation

```typescript
function calculateFuelConsumption(fuel_entry: FuelEntry, previous_entry: FuelEntry): number {
  const distance_km = fuel_entry.odometer_reading_km - previous_entry.odometer_reading_km;
  
  if (distance_km <= 0) {
    throw new Error('Invalid odometer reading: must be greater than previous reading');
  }
  
  const fuel_liters = fuel_entry.fuel_quantity_liters;
  const fuel_consumption_kmpl = distance_km / fuel_liters;
  
  return fuel_consumption_kmpl; // Km per liter
}
```

---

## Fuel Consumption Tracking

### Purpose

Monitor vehicle fuel efficiency over time to identify trends, anomalies, and optimization opportunities.

### Consumption Metrics

```typescript
interface VehicleFuelMetrics {
  vehicle_id: string;
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  
  // Fuel Usage
  total_fuel_liters: number;
  total_fuel_cost: number;
  
  // Distance
  total_distance_km: number;
  
  // Efficiency
  average_fuel_consumption_kmpl: number;
  average_cost_per_km: number;
  
  // Anomaly Detection
  consumption_variance_percentage: number; // Deviation from baseline
  anomaly_flag: boolean;
  anomaly_reason?: string;            // e.g., "Fuel consumption 30% above average"
}
```

### Fuel Efficiency Benchmarks

**Expected Fuel Consumption (Baseline):**
- **Light Truck (3-5 tons):** 8-12 km/liter
- **Medium Truck (7-10 tons):** 6-8 km/liter
- **Heavy Truck (15-20 tons):** 4-6 km/liter

**Anomaly Detection:**
```typescript
function detectFuelAnomaly(vehicle: Vehicle, current_kmpl: number): boolean {
  const baseline_kmpl = getBaselineFuelConsumption(vehicle.vehicle_type);
  const variance = ((current_kmpl - baseline_kmpl) / baseline_kmpl) * 100;
  
  // Anomaly if consumption >20% worse than baseline
  return variance < -20; // Negative variance = higher consumption (worse efficiency)
}
```

---

## Fuel Entry by Role

### Driver Entry (Mobile App)

**Use Case:** Driver refuels during trip and logs immediately.

**Workflow:**
1. Driver opens mobile app → "Log Fuel Entry"
2. Vehicle auto-selected (current assignment)
3. Driver enters fuel quantity, cost
4. Driver takes photo of receipt
5. Driver takes photo of odometer
6. Submit → Entry saved

### Supervisor Entry (Desktop/Mobile)

**Use Case:** Supervisor logs fuel on behalf of driver (bulk entry, retrospective).

**Workflow:**
1. Supervisor selects vehicle
2. Enters fuel details (from manual records or receipts)
3. Uploads supporting documents
4. Submit → Entry saved (marked as supervisor entry)

---

## Integration Points

### Upstream: Vehicle Management
- Fuel entries linked to vehicles
- Odometer readings update vehicle mileage

### Downstream: Trip Management (Phase 2+)
- Fuel cost allocated to trips (fuel consumed during trip)
- Trip-specific fuel efficiency tracking

---

## Key Design Decisions

### Why Phase 2?
**Rationale:**
- Core transport operations (Phase 1) higher priority
- Fuel tracking requires mature trip data (historical mileage)
- Allows time for GPS integration (automated mileage capture)

### Why Photo Upload for Receipt/Odometer?
**Rationale:**
- Prevents fraud (proof of refueling and mileage)
- Audit trail (receipt verification)
- Dispute resolution (driver claims vs actual costs)

### Why Own Fleet Only?
**Rationale:**
- Vendor vehicles managed by vendors (fuel costs their responsibility)
- Own fleet cost optimization focus
- Simplified scope for Phase 2 implementation

---

## Related User Stories (Phase 2)
- US-095: Fuel Entry System
- US-096: Fuel Consumption Tracking
- US-097: Fuel Efficiency Reports

---

## Summary

Fuel Management (Phase 2) provides:
- **Fuel Entry System:** Driver/supervisor logging with photo documentation
- **Consumption Tracking:** Mileage-based fuel efficiency calculation
- **Anomaly Detection:** Identify excessive consumption or potential theft
- **Cost Analysis:** Fuel cost per km, trip-level allocation
- **Efficiency Monitoring:** Trends, benchmarks, optimization opportunities

Fuel Management supports cost control and efficiency optimization for own fleet operations.
