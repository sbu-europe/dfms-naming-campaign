---
module: 08-fleet-management
specification: Garage Inventory & Workshop
version: 1.0
phase: Phase 2
sprint: Sprint 10
last_updated: 2026-09-01
related_stories: [INV-01, INV-02, INV-03, WM-01, WM-02]
design_reference: ../../../../example-prototypes/fleet-operations.html
supersedes: ../02-master-data/vehicle-part-catalog.md
---

# Garage Inventory & Workshop

## Overview

Garage inventory models **where parts and consumables are stored**, **who manages stock**, and **how quantity changes** when vehicles are repaired.

| Concept | Description |
|---------|-------------|
| **Garage POI** | POI with `poi_type = GARAGE` — each garage has its own stock |
| **Inventory Item** | Tenant master catalog (vehicle parts, machinery, consumables) |
| **Garage Stock** | Quantity on hand per `(garage_poi, inventory_item)` |
| **Inventory Movement** | Append-only ledger (receipt, issue-to-job, adjustment) |
| **Workshop Job** | Repair event; internal jobs issue parts from garage stock |
| **Vehicle Part Installation** | On job complete — expiry tracking for `VEHICLE_PART` lines |

**Roles:**
- **Tenant Admin / Transport Planner** — inventory item catalog; view all garages
- **Workshop Supervisor** — receive stock, workshop jobs, stock view/adjust for **assigned garage(s)**
- **Driver Supervisor** — fuel only (unchanged); may view Vehicle Report

**Consumers:** Vehicle Report (parts expiry), vehicle `operational_status` (under maintenance).

---

## 1. Architecture

```
POI (GARAGE) ──┐
               ├── GarageStock ── InventoryMovement (ledger)
InventoryItem ─┘         │
                         ▼
                  WorkshopJob + WorkshopJobPartLine
                         │
                         ▼ (on complete, VEHICLE_PART lines)
                  VehiclePartInstallation
                         │
                         ▼
                  VehicleReportDetail.parts
```

**Principle:** Stock changes only via `InventoryMovement` records. Workshop jobs create `ISSUE_TO_JOB` movements — never edit `GarageStock` directly without a movement.

---

## 2. Garage POI (INV-01)

Extend `POIType` with **`GARAGE`**.

```typescript
// Existing POI + new enum value
POIType.GARAGE = 'garage'
```

Workshop Supervisor users are **scoped to assigned garage POI(s)** (same pattern as gate operator POI scope).

---

## 3. Inventory Item catalog (INV-02)

**Location:** Master Data → Inventory Items (`master_data.InventoryItem` or `vehicle_health.InventoryItem`)

```typescript
interface InventoryItem {
  id: string;
  tenant_id: string;
  sku_code: string;                 // unique per tenant
  name: string;
  item_type: 'VEHICLE_PART' | 'MACHINERY' | 'CONSUMABLE' | 'OTHER';
  unit_of_measure: string;            // pcs, L, kg, set, kit
  default_lifespan_days?: number;    // VEHICLE_PART → installation expiry
  default_lifespan_km?: number;
  is_active: boolean;
}
```

**Managed by:** `transport_planner`, `tenant_admin`.

**Suggested seeds:**

| SKU | Name | Type | UOM | Days | km |
|-----|------|------|-----|------|-----|
| VP-OIL-001 | Engine Oil 15W-40 | VEHICLE_PART | L | 180 | 10,000 |
| VP-FLT-002 | Oil Filter | VEHICLE_PART | pcs | 180 | 10,000 |
| VP-BRK-003 | Brake Pads (Front) | VEHICLE_PART | set | 365 | 30,000 |

---

## 4. Garage stock & movements (INV-03)

### 4.1 `GarageStock`

```typescript
interface GarageStock {
  id: string;
  garage_poi_id: string;
  inventory_item_id: string;
  quantity_on_hand: number;
  reorder_level?: number;
}
```

Unique: `(garage_poi_id, inventory_item_id)`.

### 4.2 `InventoryMovement`

```typescript
type MovementType =
  | 'RECEIPT'
  | 'ISSUE_TO_JOB'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'RETURN_FROM_JOB';   // optional — WM-03 later

interface InventoryMovement {
  id: string;
  garage_poi_id: string;
  inventory_item_id: string;
  movement_type: MovementType;
  quantity_delta: number;           // + in, − out
  quantity_after: number;
  reference_type?: 'WORKSHOP_JOB' | 'MANUAL';
  reference_id?: string;
  notes?: string;
  created_by_id: string;
  created_at: Date;
}
```

### 4.3 Receive stock flow

1. Workshop Supervisor selects assigned Garage POI
2. Selects `InventoryItem` from catalog
3. Enters quantity (+ optional notes)
4. System: `RECEIPT` movement → increase `GarageStock`

### 4.4 Stock adjustment

`ADJUSTMENT_IN` / `ADJUSTMENT_OUT` with mandatory reason. Roles: `workshop_supervisor` (own garage), `tenant_admin` (all).

---

## 5. Workshop job (WM-01, WM-02)

### 5.1 `WorkshopJob`

```typescript
interface WorkshopJob {
  id: string;
  job_ref: string;                  // e.g. MJ-2026-0042
  vehicle_id: string;
  garage_poi_id?: string;           // null for external workshop
  workshop_type: 'INTERNAL' | 'EXTERNAL';
  external_location_name?: string;  // external only
  category: 'PREVENTIVE' | 'BREAKDOWN' | 'ACCIDENT' | 'INSPECTION';
  problem_description: string;
  datetime_in: Date;
  estimated_hours?: number;
  estimated_cost_bdt?: number;
  actual_start?: Date;
  actual_end?: Date;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  outsourced_cost_bdt?: number;
  misc_cost_bdt?: number;
  entered_by_id: string;
}
```

### 5.2 `WorkshopJobPartLine`

```typescript
interface WorkshopJobPartLine {
  id: string;
  workshop_job_id: string;
  inventory_item_id: string;
  quantity_issued: number;
  unit_cost_bdt?: number;           // optional snapshot at issue
}
```

### 5.3 Create job (internal)

1. Select Garage POI (assigned), Vehicle, category, problem, datetime in
2. Add part lines from **this garage's** stock with available qty shown
3. **Hard block** if `quantity_issued > quantity_on_hand`
4. On save:
   - `ISSUE_TO_JOB` movements per line
   - `WorkshopJob` status `IN_PROGRESS`
   - `Vehicle.operational_status = under_maintenance`
   - Vehicle excluded from TR/TO assignment

### 5.4 External workshop

No stock issue. `outsourced_cost_bdt` recorded. Vehicle still → `under_maintenance`.

### 5.5 Complete job (WM-02)

1. Enter `actual_end` (required)
2. On complete:
   - Job → `COMPLETED`
   - Vehicle → `no_active_to` (or available per V2 model)
   - For each part line where `item_type = VEHICLE_PART`: create/replace `VehiclePartInstallation`

---

## 6. Vehicle part installation (WM-02)

```typescript
interface VehiclePartInstallation {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  inventory_item_id: string;        // was part_type_id in deprecated VP spec
  workshop_job_id?: string;
  installed_date: Date;
  installed_odometer_km?: number;
  expiry_date?: Date;
  expiry_odometer_km?: number;
  status: 'ACTIVE' | 'REPLACED' | 'EXPIRED';
  replaced_at?: Date;
  notes?: string;
  created_by_id: string;
  created_at: Date;
}
```

**Rules:**
- Created on workshop job **completion** (not manual install in Sprint 10 admin — optional later for Tenant Admin)
- At most one **ACTIVE** installation per `(vehicle_id, inventory_item_id)` for vehicle parts
- Auto-expiry from `InventoryItem` defaults + job completion date/odometer

### 6.1 Expiry status (`PartExpiryService`)

| Status | Condition |
|--------|-----------|
| **expired** | Today > `expiry_date` **OR** `current_odometer ≥ expiry_odometer_km` |
| **expiring_soon** | ≤ 30 days to expiry **OR** ≤ 500 km to expiry odometer |
| **valid** | Otherwise |

Defaults: `EXPIRING_SOON_DAYS = 30`, `EXPIRING_SOON_KM = 500`.

---

## 7. Admin portal navigation

```
Master Data
└── Inventory Items              ← INV-02

Garage Operations                ← Workshop Supervisor
├── Garage Stock                 ← INV-03
├── Receive Stock                ← INV-03
├── Workshop Jobs                ← WM-01, WM-02
└── Workshop Job Entry

Fleet Operations
└── Log Fuel Entry               ← FM-01 (Driver Supervisor)

Reports
└── Vehicle Report               ← VR-01–03
```

Prototype: [`fleet-operations.html`](../../../../example-prototypes/fleet-operations.html)

---

## 8. API

```
# Master catalog
GET/POST   /api/v1/inventory-items/
GET/PATCH  /api/v1/inventory-items/{id}/

# Garage stock (scoped to supervisor's garage)
GET        /api/v1/garages/{poi_id}/stock/
POST       /api/v1/garages/{poi_id}/stock/receive/
POST       /api/v1/garages/{poi_id}/stock/adjust/
GET        /api/v1/garages/{poi_id}/stock/movements/

# Workshop
POST       /api/v1/workshop-jobs/
PATCH      /api/v1/workshop-jobs/{id}/complete/
GET        /api/v1/workshop-jobs/?garage_poi_id=&status=

# Installations (read + created via job complete)
GET        /api/v1/vehicles/{id}/part-installations/
```

---

## 9. Permissions (proposed)

| Code | Roles |
|------|-------|
| `inventory.item.manage` | tenant_admin, transport_planner |
| `garage.stock.view` | workshop_supervisor (assigned), tenant_admin, transport_planner |
| `garage.stock.receive` | workshop_supervisor (assigned) |
| `garage.stock.adjust` | workshop_supervisor (assigned), tenant_admin |
| `workshop.job.manage` | workshop_supervisor (assigned) |

---

## 10. Out of scope (Sprint 10)

- Purchase orders / supplier integration
- Inter-garage stock transfer
- Job cancel with auto stock return (WM-03)
- Barcode scanning
- Machinery depreciation

---

## 11. Relation to compliance documents

| Concern | Model |
|---------|-------|
| Legal compliance (fitness, insurance) | `Vehicle.fitness_expiry`, `insurance_expiry` |
| Service parts on vehicle | `VehiclePartInstallation` (from workshop jobs) |
| Stock on shelf | `GarageStock` at Garage POI |

---

## 12. Related specs

- [`poi-management.md`](../02-master-data/poi-management.md) — POI model; add `GARAGE` type
- [`fuel-management.md`](fuel-management.md) — fuel entry (separate role)
- [`vehicle-report.md`](../11-reporting/vehicle-report.md) — parts expiry aggregation
- [`vehicle-planning-view.md`](../05-transport/vehicle-planning-view.md) — TO assignment unchanged

---

**Last Updated**: 2026-09-01  
**Sprint**: Sprint 10 (INV-01 – WM-02)
