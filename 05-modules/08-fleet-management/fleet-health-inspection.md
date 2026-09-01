---
module: 08-fleet-management
specification: Fleet Health Inspection
version: 1.0
phase: Phase 2
sprint: Sprint 10
last_updated: 2026-09-01
related_stories: [FHI-01, FHI-02, FHI-03, FHI-04]
design_reference: ../../../../example-prototypes/fleet-operations.html
---

# Fleet Health Inspection

## Overview

**Fleet Health Inspection** is scheduled, checklist-based condition monitoring for own-fleet vehicles. Each **vehicle type** has an **inspection checklist template** (engine, fuel system, brakes, tyres, accessories, etc.). Checkpoints recur on fixed intervals (e.g. 7 days, 30 days, 1 year). Supervisors conduct **inspection rounds**, record pass/attention/fail per checkpoint, and the system updates **last checked**, **next due**, and alert status.

Distinct from:
- **Legal fitness / insurance** — compliance fields on `Vehicle`
- **Workshop jobs** — reactive repair with parts from garage inventory
- **Fuel entry** — consumption tracking

**Roles:**
- **Tenant Admin / Transport Planner** — maintain checklist templates per vehicle type
- **Driver Supervisor** — inspection dashboard, conduct rounds
- **Workshop Supervisor** — may conduct rounds at assigned garage (optional)

**Prototype:** [`fleet-operations.html`](../../../../example-prototypes/fleet-operations.html) — Fleet Inspection section (unified view; Driver Supervisor RBAC in production).

---

## 1. Architecture

```
InspectionChecklistTemplate (per vehicle_type)
    └── InspectionCheckpointTemplate (name, category, interval_days)

VehicleCheckpointState (per vehicle × checkpoint)
    └── last_checked_date, last_result, next_due (computed)

InspectionRound (audit)
    └── InspectionRoundLine (checkpoint, result, notes, odometer_km)
```

---

## 2. Checklist template (FHI-01)

**Location:** Master Data → Inspection Checklists (or Fleet → Checklist Templates)

```typescript
interface InspectionCheckpointTemplate {
  id: string;
  tenant_id: string;
  vehicle_type: string;              // matches Vehicle.type enum
  category: string;                  // Engine, Fuel, Safety, Electrical, Body, Accessories
  name: string;                      // "Brake System", "Engine Oil Level"
  description?: string;
  interval_days: number;             // 7, 30, 365, etc.
  sort_order: number;
  is_active: boolean;
}
```

**Example intervals:**

| Checkpoint | Interval |
|------------|----------|
| Engine oil level, tyres | 7 days |
| Fuel tank & lines, lights | 30 days |
| Fire extinguisher, first aid | 365 days |

---

## 3. Checkpoint state & status (FHI-02)

Per vehicle, per checkpoint template:

```typescript
interface VehicleCheckpointState {
  id: string;
  vehicle_id: string;
  checkpoint_template_id: string;
  last_checked_date: Date | null;
  last_result: 'PASS' | 'ATTENTION' | 'FAIL' | null;
  last_notes?: string;
  last_round_id?: string;
}
```

**Computed status** (`InspectionStatusService`):

| Status | Rule |
|--------|------|
| **overdue** | `today > next_due` or never checked |
| **due_soon** | within 2 days of `next_due` |
| **valid** | otherwise |
| **failed** | flag if `last_result = FAIL` until next passing round |

`next_due = last_checked_date + interval_days` (null last_checked → overdue).

Configurable: `DUE_SOON_DAYS = 2`.

---

## 4. Inspection round (FHI-03)

```typescript
interface InspectionRound {
  id: string;
  round_ref: string;
  vehicle_id: string;
  inspected_at: Date;
  odometer_km?: number;
  notes?: string;
  entered_by_id: string;
}

interface InspectionRoundLine {
  id: string;
  round_id: string;
  checkpoint_template_id: string;
  result: 'PASS' | 'ATTENTION' | 'FAIL';
  notes?: string;
}
```

**On submit:**
- Create `InspectionRound` + lines
- Update `VehicleCheckpointState` per line (`last_checked_date = inspected_at`, `last_result`)
- Recompute dashboard alerts

---

## 5. Admin portal navigation

```
Fleet Operations
├── Fleet Inspection
│   ├── Inspection Dashboard    ← due / overdue / failed
│   ├── Conduct Inspection      ← round entry
│   └── Checklist Templates     ← master (read for supervisors)
├── Fuel …
├── Garage Inventory …
└── Fleet Overview              ← fuel/distance/cost cards (prototype); production → Reports
```

---

## 6. API

```
GET/POST   /api/v1/inspection-checkpoints/?vehicle_type=
GET/PATCH  /api/v1/inspection-checkpoints/{id}/

GET        /api/v1/fleet-inspections/dashboard/?alerts_only=true
POST       /api/v1/vehicles/{id}/inspection-rounds/
GET        /api/v1/vehicles/{id}/inspection-rounds/
GET        /api/v1/vehicles/{id}/checkpoint-states/
```

---

## 7. Vehicle Report integration (FHI-04)

`VehicleReportSummary` and `VehicleReportDetail` include:

```typescript
inspection: {
  overdue_count: number;
  due_soon_count: number;
  failed_count: number;
}
```

Detail view: table of checkpoints with status chips (same as inspection dashboard, read-only).

---

## 8. Permissions (proposed)

| Code | Roles |
|------|------|
| `inspection.template.manage` | tenant_admin, transport_planner |
| `inspection.round.create` | driver_supervisor, workshop_supervisor |
| `inspection.dashboard.view` | driver_supervisor, transport_planner, tenant_admin |

---

## 9. Out of scope (Sprint 10)

- Push/email notifications for overdue checkpoints
- Driver mobile inspection (supervisor admin portal only)
- Photo evidence per checkpoint
- Auto-create workshop job from FAIL result

---

## 10. Related specs

- [`fuel-management.md`](fuel-management.md)
- [`inventory-management.md`](inventory-management.md)
- [`vehicle-report.md`](../11-reporting/vehicle-report.md)
- [`vehicle-master-data.md`](../02-master-data/vehicle-master-data.md) — vehicle type enum

---

**Last Updated**: 2026-09-01  
**Sprint**: Sprint 10 (FHI-01 – FHI-04)
