---
title: Sprint 7 — Feedback Tracker
source_sprint: Sprint 7
total_items: 1
resolved: 1
in_progress: 0
open: 0
---

# Sprint 7 — Feedback Tracker

Client / ops feedback captured during Sprint 7.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [FB-001](#fb-001--transport-planner--driver-supervisor-may-add-drivers-and-use-driver-bulk-importexport) | Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export | Users / Drivers · Fleet | High | Resolved |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| **Total** | **1** | **1** | **0** |

---

## FB-001 — Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-27 |
| **Affected Stories** | Driver master / profiles (`/admin/users/driver/`); E2E [`drivers-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/02-master-data/drivers-e2e-scenarios.md); role seed (`transport_planner`, `driver_supervisor`) |
| **Closing Sub-tasks** | FB-001-1 — Grant Transport Planner & Driver Supervisor permission to **add** (create) drivers · FB-001-2 — Grant both roles **bulk import** and **bulk export** access on Drivers |
| **AC Amendment** | **Transport Planner** and **Driver Supervisor** SHALL be able to **add drivers** in Admin (same create / invite path as Tenant Admin today). Both roles SHALL also have access to **Driver bulk import** and **Driver bulk export** (template download, validate, import, export). Existing-driver **change form is view-only** (all fields readonly) for TP/DS — only Tenant Admin may edit or hard-delete. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Implemented: role seed grants `MENU_MASTER_DATA_DRIVERS_VIEW` + `MASTER_DATA_DRIVER_READ` + `MASTER_DATA_DRIVER_WRITE` (not Delete) to TP and DS. `DriverAdmin` gates **add** (and bulk I/O via mixin `has_add`) on DFMS Write; **change** and **delete** remain Tenant Admin / Super Admin only so the change form renders readonly for ops. Re-seed with `manage.py seed_dfms_rbac`. |

### Client feedback observation

Operations need **Transport Planner** and **Driver Supervisor** to onboard drivers themselves — not only Tenant Admin. The same roles should also be able to **bulk import** and **bulk export** drivers so fleet staffing can scale without waiting on a tenant administrator. They should **not** edit existing driver profiles via the change form (readonly).

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-001) |
|--------|------------------|-------------------|
| Who can **Add driver** | Tenant Admin only | **+ Transport Planner** and **Driver Supervisor** |
| Change form (existing driver) | Tenant Admin editable | TP/DS **view-only / readonly**; Tenant Admin editable |
| Driver **bulk import / export** | Admin-centric | Unlocked for TP / DS via add permission |
| Hard delete | Tenant Admin | Unchanged (Tenant Admin only) |

### Closing checklist

- [x] FB-001-1 — Role seed / RBAC: `transport_planner` and `driver_supervisor` can add drivers (`MASTER_DATA_DRIVER_WRITE` + Drivers menu)
- [x] FB-001-2 — Admin: both roles see and can use Driver **Bulk Import** and **Bulk Export** (via add → mixin)
- [x] Change form readonly for TP/DS (`has_change_permission` Tenant Admin only)
- [x] Verify Tenant Admin still add/change/delete
- [x] Unit tests: Write holder add+bulk, no change/delete; seed + DS nav
