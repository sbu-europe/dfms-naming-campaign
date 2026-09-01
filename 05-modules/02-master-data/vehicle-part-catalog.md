---
module: 02-master-data
specification: Vehicle Part Catalog & Installations
version: 1.0
phase: Phase 2
sprint: Sprint 10
last_updated: 2026-08-31
related_stories: [VP-01, VP-02, VP-03]
design_reference: ../../../../example-prototypes/fuel-management.html (Fleet Dashboard — parts alerts concept)
---

# Vehicle Part Catalog & Installations

## Overview

Vehicle **parts** track consumable and service items installed on a vehicle (engine oil, filters, brake pads) with **date and/or mileage expiry**. This is distinct from **compliance documents** on the `Vehicle` record (`fitness_expiry`, `insurance_expiry`).

**Roles:** Transport Planner, Tenant Admin (catalog + install/replace).

**Consumers:** [`vehicle-health-snapshot.md`](../08-fleet-management/vehicle-health-snapshot.md) (Vehicle Planning), vehicle admin.

---

## 1. Architecture

```
VehiclePartType (catalog — master_data)
        │
        ▼
VehiclePartInstallation (operational — vehicle_health)
        │
        ▼
PartExpiryService → status: valid | expiring_soon | expired
        │
        ▼
VehicleReportDetail.parts
```

---

## 2. Catalog — `VehiclePartType`

**Location:** Master Data → Vehicle Parts (`master_data.VehiclePartType`)

```typescript
interface VehiclePartType {
  id: string;
  tenant_id: string;
  name: string;                      // "Engine Oil", "Brake Pads (Front)"
  category?: 'CONSUMABLE' | 'SAFETY' | 'ELECTRICAL' | 'OTHER';
  default_lifespan_days?: number;    // e.g. 180
  default_lifespan_km?: number;      // e.g. 10000
  is_active: boolean;
}
```

At least one lifespan default recommended for auto-expiry on install.

**Suggested seed values:**

| Part | Days | km |
|------|------|-----|
| Engine Oil | 180 | 10,000 |
| Air Filter | 365 | 20,000 |
| Brake Pads (Front) | 365 | 30,000 |

---

## 3. Installation — `VehiclePartInstallation`

**Location:** `vehicle_health.VehiclePartInstallation` — linked from Vehicle admin

```typescript
interface VehiclePartInstallation {
  id: string;
  tenant_id: string;
  vehicle_id: string;
  part_type_id: string;

  installed_date: Date;
  installed_odometer_km?: number;

  expiry_date?: Date;
  expiry_odometer_km?: number;

  status: 'ACTIVE' | 'REPLACED' | 'EXPIRED';
  replaced_at?: Date;
  replaced_by_installation_id?: string;

  notes?: string;
  created_by_id: string;
  created_at: Date;
}
```

**Rules:**
- At most **one ACTIVE** installation per `(vehicle_id, part_type_id)`.
- **Replace:** mark old `REPLACED`, create new `ACTIVE` row.
- On install, auto-calc expiry from catalog defaults if not manually set:
  - `expiry_date = installed_date + default_lifespan_days`
  - `expiry_odometer_km = installed_odometer_km + default_lifespan_km`
- Default `installed_odometer_km` from latest fuel entry or `Vehicle.current_odometer_reading`.

---

## 4. Expiry Status

Computed by `PartExpiryService` (not stored):

| Status | Condition |
|--------|-----------|
| **expired** | Today > `expiry_date` **OR** `current_odometer ≥ expiry_odometer_km` |
| **expiring_soon** | ≤ 30 days to expiry **OR** ≤ 500 km to expiry odometer |
| **valid** | Otherwise |

Expired if **either** date or mileage threshold is breached.

Configurable defaults: `EXPIRING_SOON_DAYS = 30`, `EXPIRING_SOON_KM = 500`.

---

## 5. Admin UX

| Surface | Purpose |
|---------|---------|
| Master Data → Vehicle Parts | Catalog CRUD (VP-01) |
| Vehicle change form → Parts tab | Active installations, install/replace (VP-02) |
| Vehicle changelist filter | Has expired / expiring soon parts (VP-03) |

---

## 6. API

```
GET/POST   /api/v1/vehicle-part-types/
GET/PATCH  /api/v1/vehicle-part-types/{id}/

GET        /api/v1/vehicles/{id}/part-installations/
POST       /api/v1/vehicles/{id}/part-installations/
POST       /api/v1/vehicles/{id}/part-installations/{id}/replace/
```

Each installation row includes computed `status`, `days_remaining`, `km_remaining`.

---

## 7. Permissions (proposed)

| Code | Roles |
|------|-------|
| `vehicle_part.catalog.manage` | tenant_admin, transport_planner |
| `vehicle_part.installation.manage` | tenant_admin, transport_planner |

---

## 8. Relation to Compliance Documents

| Concern | Model | Sprint 10 |
|---------|-------|-----------|
| Legal compliance (fitness, insurance) | `Vehicle.fitness_expiry`, `insurance_expiry` | Shown in planning snapshot compliance strip |
| Service parts (oil, filters, pads) | `VehiclePartInstallation` | Full catalog + expiry in this spec |

Do not merge these into one table — different lifecycles and owners.

---

**Last Updated**: 2026-08-31  
**Sprint**: Sprint 10 (VP-01 – VP-03)
