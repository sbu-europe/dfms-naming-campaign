---
module: 08-fleet-management
specification: Fuel Management
version: 2.1
phase: Phase 2
sprint: Sprint 10
source_document: example-prototypes/fleet-operations.html
source_sections: Fuel Entry (Log), Fuel History, Fleet Dashboard (fuel metrics only)
last_updated: 2026-08-31
related_stories: [FM-01, FM-02, FM-03, FM-04, FM-05]
design_reference: ../../../../example-prototypes/fleet-operations.html
context_vs_prd:
  - "Roles: Driver + Driver Supervisor (not Workshop Supervisor per PRD §6.8.2)"
  - "Fuel quantity: gauge before/after (not direct liters input per PRD)"
  - "Required photos: gauge before + after (PRD: receipt + mileage only)"
  - "Mileage: odometer-based (GPS deferred per PRD §6.8.3)"
---

# Fuel Management (Phase 2)

## Overview

Fuel Management tracks refueling events for **own-fleet vehicles** using a **gauge before/after** intake model. It enables mileage-based fuel efficiency (km/L), cost analysis (৳/km), and anomaly detection against vehicle-type baselines.

**Roles:**
- **Driver** — logs fuel via mobile app for **assigned vehicle only** (`DRIVER_ENTRY`). Vehicle, datetime, location (GPS), and fuel type are **auto-captured**; driver enters gauge readings, cost, odometer, and photos.
- **Driver Supervisor** — logs fuel via admin portal during **pre-trip vehicle checks** (`SUPERVISOR_ENTRY`). Selects vehicle, manually enters refueling date and location, may update vehicle info (e.g. odometer), and enters all fuel intake data.

**Design source of truth:** [`example-prototypes/fleet-operations.html`](../../../../example-prototypes/fleet-operations.html) — Fuel tabs. Fleet Overview (fuel/distance/cost cards) maps to **Reports → Vehicle Report** ([`vehicle-report.md`](../11-reporting/vehicle-report.md)), not Vehicle Planning.

---

## 1. Fuel Entry Workflows

### 1.1 Driver Supervisor — pre-trip / manual entry

Used before trip/TO execution when the supervisor verifies the vehicle and records (or corrects) fuel data.

```
1. Supervisor opens Fuel Entry (admin portal)
2. Supervisor SELECTS vehicle from own-fleet picker
3. Vehicle context panel loads: registration, driver, odometer, last fuel entry
4. Supervisor may UPDATE vehicle info (e.g. current_odometer_reading) — audit-logged
5. Supervisor MANUALLY enters:
   - Refueling date * (and optional time)
   - Location / pump name * (manual text)
   - Fuel before/after (L) + gauge photos *
   - Fuel cost, current odometer *
   - Fuel type (auto from vehicle; editable)
   - Receipt, odometer photos; notes
6. System validates, calculates metrics, saves SUPERVISOR_ENTRY
```

### 1.2 Driver — mobile entry (auto-captured context)

```
1. Driver opens app → Log Fuel Entry
2. AUTO: assigned vehicle (read-only), fuel type (read-only from vehicle)
3. Driver enters: gauge before/after + photos, cost, odometer, supporting photos
4. On submit AUTO:
   - refueling_datetime = submit timestamp
   - location = device GPS (lat/lng + optional reverse-geocode label)
5. System validates, calculates metrics, saves DRIVER_ENTRY
```

### 1.3 Shared validation & calculation

Both paths share:
- After > Before; odometer > last entry; own fleet only; gauge photos required
- FM-03 calculations; FM-05 anomaly flag
- `vehicle.current_odometer_reading` updated on save

---

## 1a. Field Behaviour Summary

| Field | Driver Supervisor | Driver (mobile) |
|-------|-------------------|-----------------|
| Vehicle | Selectable picker * | Pre-selected (assigned), read-only |
| Refueling datetime | Manual (date *; optional time) | Auto at submit |
| Location | Manual text * (`location_source: MANUAL`) | Device GPS (`location_source: DEVICE_GPS`) |
| Fuel type | Auto from vehicle; editable | Auto from vehicle; read-only |
| Gauge before/after, cost, odometer | Manual entry | Manual entry |
| Vehicle info update | Allowed before/during entry | Not on this screen |

---

## 2. Data Model

```typescript
interface FuelEntry {
  id: string;
  tenant_id: string;
  vehicle_id: string;

  // Gauge-based intake (Sprint 10)
  fuel_before_liters: number;
  fuel_after_liters: number;
  fuel_quantity_liters: number;       // computed: after - before (override optional)

  fuel_cost: number;
  fuel_type: 'DIESEL' | 'PETROL' | 'CNG';

  odometer_reading_km: number;
  distance_since_last_refuel_km?: number | null;
  fuel_consumption_kmpl?: number | null;
  cost_per_km?: number | null;
  cost_per_liter?: number | null;

  gauge_before_image_url: string;     // required
  gauge_after_image_url: string;      // required
  receipt_image_url?: string;
  odometer_image_url?: string;

  refueling_datetime: Date;           // supervisor: manual; driver: auto at submit
  refueling_location?: string;          // supervisor: manual pump name (required)
  location_latitude?: number;         // driver: from device GPS
  location_longitude?: number;
  location_source: 'MANUAL' | 'DEVICE_GPS';

  entered_by_id: string;
  entry_type: 'DRIVER_ENTRY' | 'SUPERVISOR_ENTRY';
  anomaly_flag: boolean;
  quantity_override_note?: string;    // if supervisor overrides auto calc

  notes?: string;
  created_at: Date;
}
```

**Backend:** `apps/vehicle_health/models.py` — `FuelEntry` (proposed Sprint 10 app).

---

## 3. Consumption Calculations

```typescript
function calculateFuelMetrics(
  entry: FuelEntry,
  previous: FuelEntry | null
): Partial<FuelEntry> {
  const liters = entry.fuel_after_liters - entry.fuel_before_liters;

  if (!previous) {
    return {
      fuel_quantity_liters: liters,
      distance_since_last_refuel_km: null,
      fuel_consumption_kmpl: null,
      cost_per_km: null,
      cost_per_liter: entry.fuel_cost / liters,
    };
  }

  const distance = entry.odometer_reading_km - previous.odometer_reading_km;
  if (distance <= 0) throw new Error('Odometer must exceed previous reading');

  return {
    fuel_quantity_liters: liters,
    distance_since_last_refuel_km: distance,
    fuel_consumption_kmpl: distance / liters,
    cost_per_km: entry.fuel_cost / distance,
    cost_per_liter: entry.fuel_cost / liters,
  };
}
```

**First entry:** distance and km/L are null — baseline established from the second fill onward.

---

## 4. Anomaly Detection

| Vehicle Type | Baseline avg (km/L) | Anomaly if km/L < |
|--------------|---------------------|-------------------|
| Light Truck (3–5 t) | 10 | 8.0 |
| Medium Truck (7–10 t) | 7 | 5.6 |
| Heavy Truck (15–20 t) | 5 | 4.0 |

Anomaly when calculated km/L is **>20% below** baseline average. Entry is **saved** with `anomaly_flag = true` (flag-only, not blocked).

---

## 5. Fuel History

Admin **Fuel History** view (Driver Supervisor): filter by vehicle, stats strip (total entries, liters, cost, avg km/L, anomaly count), table newest-first. See FM-04.

---

## 6. Integration Points

| Consumer | Usage |
|----------|-------|
| [`vehicle-report.md`](../11-reporting/vehicle-report.md) | Last km/L, avg km/L, fuel cost, anomaly for Vehicle Report |
| `Vehicle.current_odometer_reading` | Updated on each fuel entry |
| [`driver-mobile.md`](../09-mobile-apps/driver-mobile.md) | FM-02 mobile entry |
| Trip costing (future) | Fuel cost allocation — not Sprint 10 |

---

## 7. Permissions (proposed)

| Code | Role |
|------|------|
| `fuel.entry.create` | Driver (own vehicle), Driver Supervisor |
| `fuel.history.view` | Driver Supervisor |
| `fuel.entry.view_own` | Driver (own entries) |

---

## 8. Out of Scope (Sprint 10)

- Fuel budget tracking
- GPS-based mileage
- Trip-level fuel cost
- Bulk CSV import, fuel card integration
- Workshop / maintenance timeline

---

**Last Updated**: 2026-08-31  
**Sprint**: Sprint 10 (FM-01 – FM-05)
