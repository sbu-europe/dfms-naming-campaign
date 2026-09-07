---
module: 11-reporting
specification: Vehicle Report
version: 1.1
phase: Phase 2
sprint: Sprint 10
last_updated: 2026-09-07
related_stories: [VR-01, VR-02, VR-03, FHI-04]
design_reference: ../../../../example-prototypes/fleet-operations.html (Fleet Overview tab)
aggregates_from:
  - ../08-fleet-management/fuel-management.md
  - ../08-fleet-management/fleet-health-inspection.md
  - ../02-master-data/vehicle-master-data.md
---

# Vehicle Report (Reports → Vehicle Report)

## Overview

**Vehicle Report** is a read-only reporting surface under the portal **Reports** menu. It shows fleet-wide and per-vehicle **health information**: operational status, compliance (fitness/insurance), fuel performance (km/L, distance, cost), and **fleet health inspection** alerts.

**Separation of concerns:**

| Surface | Purpose | Sprint 10 |
|---------|---------|-----------|
| **Transport → Vehicle Planning** | TO assignment (vehicle-centric board) | Unchanged — v1 spec only |
| **Fleet Operations → Fleet Overview** | Prototype preview of VR-02 cards | [`fleet-operations.html`](../../../../example-prototypes/fleet-operations.html) |
| **Reports → Vehicle Report** | Production fuel, inspection, compliance | VR-01 – VR-03, FHI-04 |

Prototype **Fleet Overview** (fuel, distance, ৳/km per vehicle) maps to **VR-02** in production — not embedded in Vehicle Planning.

---

## 1. Portal navigation

```
Reports                          ← new top-level section
└── Vehicle Report               ← VR-01
    ├── Fleet overview (cards)   ← VR-02
    └── Vehicle detail           ← VR-03 (drill-down)
```

**Permission:** `MENU_VEHICLE_REPORT_VIEW`  
**Roles:** `transport_planner`, `driver_supervisor`, `tenant_admin`

**URL pattern (admin):**
- Overview: `/admin/reports/vehicle-report/`
- Detail: `/admin/reports/vehicle-report/<vehicle_id>/`

---

## 2. Aggregation service

```python
# apps/vehicle_health/services/vehicle_report.py
# (or apps/reporting/services/vehicle_report.py)

class VehicleReportService:
    def build_list(self, queryset, fuel_period_days: int = 30) -> list[VehicleReportSummary]: ...
    def build_detail(self, vehicle_id: UUID, fuel_period_days: int = 30) -> VehicleReportDetail: ...
```

No new source of truth — aggregates `Vehicle`, `FuelEntry`, `VehicleCheckpointState` (inspections), compliance fields.

---

## 3. DTOs

### 3.1 Summary (overview cards — VR-02)

```typescript
interface VehicleReportSummary {
  vehicle: {
    id: string;
    registration_number: string;
    model_name: string;
    fuel_type: string;
    operational_status: string;
    driver_name: string | null;
  };
  odometer_km: number | null;
  fuel: {
    entry_count: number;
    last_kmpl: number | null;
    avg_kmpl: number | null;
    total_distance_km: number | null;
    total_cost_bdt: number;
    cost_per_km: number | null;
    anomaly: boolean;
  };
  inspection: {
    overdue_count: number;
    due_soon_count: number;
    failed_count: number;
  };
  compliance: {
    has_issue: boolean;  // any expired or expiring soon
  };
  alert_level: 'none' | 'warning' | 'critical';
}
```

### 3.2 Detail (VR-03)

```typescript
interface VehicleReportDetail extends VehicleReportSummary {
  compliance: {
    fitness_expiry: Date | null;
    insurance_expiry: Date | null;
    fitness_status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
    insurance_status: 'valid' | 'expiring_soon' | 'expired' | 'missing';
  };
  fuel: {
    entry_count: number;
    last_kmpl: number | null;
    avg_kmpl: number | null;
    total_liters: number;
    total_cost_bdt: number;
    last_fill_datetime: Date | null;
    anomaly: boolean;
    anomaly_message?: string;
    recent_entries: FuelEntrySummary[];  // last N rows
  };
  inspection: {
    overdue: InspectionCheckpointItem[];
    due_soon: InspectionCheckpointItem[];
    valid: InspectionCheckpointItem[];
  };
  alerts: string[];  // human-readable banner messages
}
```

---

## 4. UI — Fleet overview (VR-02)

Matches prototype **Fleet Overview** (VR-02):

- **Stats strip:** own fleet count, fuel entries (period), fuel anomalies, inspection overdue (optional)
- **Card grid:** per-vehicle — last/avg km/L, distance, fuel cost, ৳/km, inspection alerts, anomaly chip
- **Filters:** search, “has alerts”, fuel period (default 30 days)
- **Click card** → detail view

---

## 5. UI — Vehicle detail (VR-03)

Sections (read-only):

1. **Header** — vehicle identity + alert banners  
2. **Compliance** — fitness / insurance with status chips  
3. **Fuel** — period stats (km/L, distance, cost, ৳/km) + recent entries table  
4. **Inspection** — checkpoint table with last checked, next due, status (FHI-04)  

Optional footer link: “Open Vehicle Planning” (if user has `MENU_VEHICLE_PLANNING_VIEW`) — navigates to standard planning board without embedding health data there.

---

## 6. API

```
GET /api/v1/reports/vehicles/?fuel_period_days=30&page=1&has_alerts=true
GET /api/v1/reports/vehicles/{id}/?fuel_period_days=30
```

---

## 7. Out of scope (Sprint 10)

- Garage inventory, workshop jobs, parts expiry / installations (deferred)
- TO assignment on report pages
- Export CSV/PDF (later reporting sprint)
- Changes to Vehicle Planning landing or board templates

---

## 8. Related specs

- [`fleet-health-inspection.md`](../08-fleet-management/fleet-health-inspection.md) — inspection checkpoint source data
- [`fuel-management.md`](../08-fleet-management/fuel-management.md) — fuel entry source data
- [`vehicle-planning-view.md`](../05-transport/vehicle-planning-view.md) — TO assignment (unchanged)

---

**Last Updated**: 2026-09-07  
**Sprint**: Sprint 10 (VR-01 – VR-03, FHI-04)
