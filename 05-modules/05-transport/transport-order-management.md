---
module: 05-transport
specification: Transport Order Management
version: 2.0
phase: Phase 1
sprint: Sprint 3
last_updated: 2026-05-07
related_stories: DFS-039 (TO-01), DFS-040 (TO-02)
jira_epic: DFS-043
---

# Transport Order Management

## Overview

Transport Orders (TOs) are the **executable dispatch units** of the transport workflow. A Transport Planner creates one or more TOs against a Transport Request (TR) once planning inputs have been submitted. A single TR may be split into multiple TOs — for example, a TR for 500 MT may be split across 3 own-fleet TOs and 2 vendor-fleet TOs.

Each TO is tagged as **Own Fleet** or **Vendor Fleet** and routed to the appropriate TDO for resource assignment.

**Module path**: `apps/transport/` — `TransportOrder`, `TOLineItem` models  
**Dependencies**: `transport-requisition-management.md` (TR in `under_planning`), `02-master-data` (Fleet, Vendor), `apps/users` (Driver, Helper)  
**Enables**: Trip dispatch (Sprint 4)

---

## 0. Menu Structure & Navigation

```
Sidebar
├── Transport Planner
│     └── Transport
│           ├── Transport requests    — TR queue (FG + Port Consignment)
│           └── Transport orders      — all TOs; filterable by fleet type, status
│
├── TDO (Own Fleet)
│     └── Transport
│           └── Transport orders      — all TOs (filtered by assignment)
│     └── Master Data
│           ├── Vehicles              — read-only
│           ├── Drivers               — read-only
│           └── Helpers               — read-only
│
├── TDO (Vendor Fleet)
│     └── Transport
│           └── Transport orders      — all TOs
│
└── Driver
      └── Transport
            └── Transport orders      — only TOs assigned to this driver (read-only)
```

### TO creation flow

```
TR List → [Create transport order button] ─────────────────┐
                                                            │
TR Detail → [Create Transport Order button]                 │
  (visible when TR status = Under Planning / Partially Allocated)
                                                            ▼
                                              Step 1: Select TR
                                              (dropdown: Under Planning / Partially Allocated TRs)
                                                            │
                                                            ▼
                                              Step 2: Create TO form
                                              ├── TR summary (read-only)
                                              ├── Fleet type selector (Own / Vendor)
                                              ├── Planned delivery date & time
                                              ├── C&F Clearance Note (optional)
                                              ├── Notes
                                              └── Per-line product allocation table
                                                   ├── Product name + UOM
                                                   ├── Requested qty (UOM)
                                                   ├── Already allocated (UOM + weight kg)
                                                   ├── Allocate qty for this TO (input)
                                                   └── Weight per unit (kg)
                                                            │
                                                            ▼
                                              TO created → redirect to TO list
```

---

## 1. Roles & Access

| Role | View TO List | Create TO | Edit Assignment | View Detail |
|------|:------------:|:---------:|:---------------:|:-----------:|
| Transport Planner | ✓ (all) | ✓ | — | ✓ (read-only assignment) |
| TDO (Own Fleet) | ✓ (all) | — | ✓ (own fleet fields) | ✓ |
| TDO (Vendor Fleet) | ✓ (all) | — | ✓ (vendor fleet fields) | ✓ |
| Driver | ✓ (own assigned only) | — | — | ✓ (read-only) |
| Tenant Admin | ✓ (all) | ✓ | ✓ (all) | ✓ |

---

## 2. Data Model

### 2.1 TransportOrder (`apps/transport/models.py`)

```python
TransportOrder {
    to_number: string                    # Auto-generated: "TO-YYYYMMDD-XXXX"
    status: TOStatus                     # See §3 for lifecycle

    tr: FK → TransportRequisition        # Parent TR (nullable — set on creation)
    fleet_type: enum ['OWN', 'VENDOR']   # Determines TDO section visibility

    origin_poi: FK → POI                 # Inherited from TR.source_poi at creation
    destination_poi: FK → POI            # Inherited from TR.destination_poi at creation

    allocated_quantity: decimal          # Sum of (per-line qty × weight_per_unit) in kg

    planned_delivery_datetime: datetime
    cf_clearance_note: string (blank)

    # Own Fleet assignment (TDO Own Fleet)
    vehicle: FK → Vehicle (null)
    driver: FK → Driver (null)
    helpers: M2M → Helper               # Searchable multi-select (autocomplete)
    eta_datetime: datetime (null)

    # Vendor Fleet assignment (TDO Vendor Fleet)
    assigned_vendor: FK → Vendor (null)
    vendor_vehicle_registration: string (blank)
    vendor_driver_name: string (blank)

    created_by: FK → User               # Transport Planner
    notes: text
}
```

### 2.2 TOLineItem (`apps/transport/models.py`)

Per-line product allocation — links a TO to a specific TR line item:

```python
TOLineItem {
    to: FK → TransportOrder
    tr_line_item: FK → TRLineItem
    allocated_quantity: decimal          # In UOM (not kg)
}
```

This enables:
- Accurate "already allocated" per product line in the TO creation form
- Preventing over-allocation per TR line item
- Full visibility of which products are covered by each TO

### 2.3 TOStatus (`apps/transport/constants.py`)

| DB value | Display label | Set by | Condition |
|----------|---------------|--------|-----------|
| `created` | Created | System (on TO creation) | Initial state |
| `assigned` | Assigned | System (`save_model` auto-advance) | Driver set (own) or vendor set (vendor) |
| `ready_for_dispatch` | Ready for Dispatch | System (`save_model` auto-advance) | Vehicle + driver + ETA set (own) or vendor + registration set (vendor) |
| `cancelled` | Cancelled | Transport Planner | Any time before `ready_for_dispatch` |
| `in_progress` | In Progress | Sprint 4 | Trip dispatched |
| `completed` | Completed | Sprint 4 | Trip completed |

> **Key decision**: `ASSIGNED_TO_VENDOR` status removed — `fleet_type` already distinguishes own vs vendor fleet. A single `ASSIGNED` status covers both.

---

## 3. TO Status Lifecycle

```
Transport Planner creates TO
        │
        ▼
     CREATED ──────────────────────────────────────────────────────► CANCELLED
        │                                                             (any time before assigned)
        │  TDO assigns resources
        ▼
     ASSIGNED  (driver set / vendor set — auto-advance on save)
        │
        │  TDO completes all assignment details
        ▼
  READY FOR DISPATCH  (vehicle + driver + ETA set; or vendor + registration — auto-advance)
        │
        │  Sprint 4: Trip dispatched
        ▼
   IN PROGRESS
        │
        ▼
   COMPLETED
```

**Auto-advance logic** (in `TransportOrderAdmin.save_model`):
- Evaluated in a single pass — filling all fields at once jumps directly to the highest applicable state
- Own Fleet: `vehicle + driver + eta_datetime` → `Ready for Dispatch`; `driver` only → `Assigned`
- Vendor Fleet: `assigned_vendor + vendor_vehicle_registration` → `Ready for Dispatch`; `assigned_vendor` only → `Assigned`

---

## 4. TO Creation Form (Admin)

### 4.1 Step 1 — Select TR

- Dropdown lists TRs with status `Under Planning` or `Partially Allocated`
- Accessible via "Create transport order" button on TR list and TR detail pages

### 4.2 Step 2 — TO form

**Read-only TR context panel:**
- TR number, TR type, source POI → destination POI
- Vehicle type, vehicles required, delivery date

**Planner input fields:**

| Field | Required | Notes |
|-------|----------|-------|
| Fleet type | Yes | Own / Vendor dropdown; toggles assignment section visibility |
| Planned delivery date & time | No | |
| C&F Clearance Note | No | Relevant for Port Consignment TRs |
| Notes | No | |

**Per-line product allocation table:**

| Column | Notes |
|--------|-------|
| Product | Name from `pr_line_item.product` |
| UOM | Unit of measure |
| Requested qty | Total `TRLineItem.allocated_quantity` |
| Already allocated | Sum of existing `TOLineItem.allocated_quantity` for this TR line + equivalent weight in kg |
| Allocate qty for this TO | Input field (UOM); validated ≤ remaining |
| Weight per unit (kg) | From `pr_line_item.weight_per_unit` |

**Validation:**
- Per-line: allocated qty ≤ remaining (TR line qty − already allocated TO qty)
- Total allocated > 0 across all lines required

### 4.3 Submit behaviour

1. Create `TransportOrder` with `status = created`
2. Auto-generate `to_number`
3. Inherit `origin_poi`, `destination_poi` from TR
4. Create `TOLineItem` per line with allocated qty > 0
5. Set `allocated_quantity` on TO = sum of `(line qty × weight_per_unit)` in kg
6. If TR status was `Under Planning` → advance to `Partially Allocated`
7. Redirect to Transport Orders list

---

## 5. TO Detail View (Admin)

### Sections by role

| Section | Transport Planner | TDO Own Fleet | TDO Vendor Fleet | Driver |
|---------|:-----------------:|:-------------:|:----------------:|:------:|
| Identity | ✓ (read-only) | ✓ | ✓ | ✓ |
| Route | ✓ | ✓ | ✓ | ✓ |
| Planner Inputs | ✓ | ✓ (read-only) | ✓ (read-only) | ✓ (read-only) |
| Own Fleet Assignment | — | ✓ (editable) | — | ✓ (read-only) |
| Vendor Fleet Assignment | — | — | ✓ (editable) | — |
| Meta | ✓ | ✓ | ✓ | — |

**Fleet section toggle**: JS on the `fleet_type` dropdown instantly shows/hides the Own/Vendor Assignment sections — no page reload required.

**Status badge**: Colour-coded pill with Bootstrap icon matching TR/PR design system.

---

## 6. Business Rules

| # | Rule | Enforcement |
|---|------|-------------|
| BR-1 | TO can only be created from a TR with status `Under Planning` or `Partially Allocated` | `create_from_tr_view` guard |
| BR-2 | Per-line allocated qty must not exceed remaining available qty for that TR line | View validation loop |
| BR-3 | Total allocation across all lines must be > 0 | View validation |
| BR-4 | Fleet type cannot be changed after assignment begins | Status auto-advance prevents regression |
| BR-5 | C&F Clearance Note shown and available for Port Consignment TOs | Optional field — not enforced at validation |
| BR-6 | `allocated_quantity` on TO stored in kg (UOM qty × weight_per_unit) | Calculated in `create_from_tr_view` |
| BR-7 | TO number format: `TO-YYYYMMDD-XXXX` | Auto-generated on `save()` |
| BR-8 | Driver can only view TOs they are assigned to | `get_queryset` filters by `driver=request.user.driver_profile` |

---

## 7. Permissions & Sidebar Access

| Role | Nav item shown via | Access level |
|------|--------------------|-------------|
| Transport Planner | `permission_any` (Menu.Transport.*.View codes) | Add + view |
| TDO Own Fleet | `role_any: ["tdo_own_fleet"]` in portal_navigation | Change (own fleet fields only) + view |
| TDO Vendor Fleet | `role_any: ["tdo_vendor_fleet"]` | Change (vendor fields only) + view |
| Driver | `role_any: ["driver"]` | View only (own assigned TOs) |
| Tenant Admin | Tenant admin catch-all | Full access |

**Master data read-only access for TDO Own Fleet:**
- Vehicles, Drivers, Helpers appear in sidebar via `role_any: ["tdo_own_fleet"]`
- `VehicleAdmin._tdo_readonly_roles`, `DriverAdmin`/`HelperAdmin` permission overrides
- Import/Export buttons hidden (`changelist_view` override suppresses `has_bulk_import_export`)

---

## 8. Carry-Forward to Sprint 4

| Item | Notes |
|------|-------|
| Vendor admin | `Vendor` model exists; no admin registered yet — `tdo_vendor_fleet` read-only access pending |
| "Create Another TO" flow | Currently redirect to TO list after creation; no in-form loop |
| Fleet availability counts | Informational counts (own fleet available / vendor contracts) not yet shown on creation form |
| TR `Fully Allocated` auto-advance | Currently `Partially Allocated` on first TO; `Fully Allocated` requires manual check or Sprint 4 service |
| Trip dispatch | `In Progress` / `Completed` status transitions — Sprint 4 |
| Cancel TO | No cancel action implemented yet — Sprint 4 |

---

## 9. Dependencies & Cross-References

| Dependency | Description |
|------------|-------------|
| `transport-requisition-management.md` | TR must be `Under Planning` or `Partially Allocated` before TO creation |
| `apps/users` — Driver, Helper | Autocomplete fields on TO assignment; Driver access filtered by `driver_profile` |
| `apps/master_data` — Vehicle | Own fleet assignment dropdown |
| `apps/vendors` — Vendor | Vendor fleet assignment (Sprint 4 admin) |
| `trip-management.md` | Sprint 4 — Trip dispatch after `Ready for Dispatch` |

### Related documentation

- **[Sprint 3 Completion Report](../../03-backlog/sprints/sprint-3/completion-report.md)**
- **[TO-01 backlog story](../../03-backlog/sprints/sprint-3/05-transport/02-transport-orders.md)**
- **[TRQ-01 — TR queue & planning inputs](../../03-backlog/sprints/sprint-3/05-transport/01-transport-requests-queue.md)**
- **[Typography & Label Conventions](../../07-design-system/01-foundation/typography-and-labels.md)**
