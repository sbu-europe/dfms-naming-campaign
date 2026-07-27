---
title: Sprint 7 — Feedback Tracker
source_sprint: Sprint 7
total_items: 1
resolved: 0
in_progress: 0
open: 1
---

# Sprint 7 — Feedback Tracker

Client / ops feedback captured during Sprint 7.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [FB-001](#fb-001--transport-planner--driver-supervisor-may-add-drivers-and-use-driver-bulk-importexport) | Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export | Users / Drivers · Fleet | High | Open |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 0 | 1 |
| **Total** | **1** | **0** | **1** |

---

## FB-001 — Transport Planner & Driver Supervisor may add drivers and use driver bulk import/export

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-27 |
| **Affected Stories** | Driver master / profiles (`/admin/users/driver/`); E2E [`drivers-e2e-scenarios.md`](../../../09-testing/backend/e2e-scenarios/02-master-data/drivers-e2e-scenarios.md); role seed (`transport_planner`, `driver_supervisor`) |
| **Closing Sub-tasks** | FB-001-1 — Grant Transport Planner & Driver Supervisor permission to **add** (create) drivers · FB-001-2 — Grant both roles **bulk import** and **bulk export** access on Drivers |
| **AC Amendment** | **Transport Planner** and **Driver Supervisor** SHALL be able to **add drivers** in Admin (same create / invite path as Tenant Admin today). Both roles SHALL also have access to **Driver bulk import** and **Driver bulk export** (template download, validate, import, export). Read/list access remains; delete / hard-deactivate policy stays with Tenant Admin unless product says otherwise. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Today Transport Planner has `MasterData.Driver.Read` only (no Write). Driver Supervisor has no driver master Write and typically reaches Drivers only via fleet autocomplete / attendance-leave. User bulk import/export is tenant-admin gated; Driver bulk import/export follows add/change permission — extending Write to TP + DS should unlock both single create and bulk flows once RBAC + admin gates are aligned. |

### Client feedback observation

Operations need **Transport Planner** and **Driver Supervisor** to onboard drivers themselves — not only Tenant Admin. The same roles should also be able to **bulk import** and **bulk export** drivers so fleet staffing can scale without waiting on a tenant administrator.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-001) |
|--------|---------|-------------------|
| Who can **Add driver** | Tenant Admin (and equivalent privileged admins) | **+ Transport Planner** and **Driver Supervisor** |
| Transport Planner driver perms | Read only (`MASTER_DATA_DRIVER_READ`) | Read **+ Write** (create/update as needed for add) |
| Driver Supervisor driver perms | No driver master Write (fleet ops only) | Read **+ Write** for add (and list/menu as required) |
| Driver **bulk import** | Available to roles with add/change; effectively admin-centric | **Transport Planner** and **Driver Supervisor** can import |
| Driver **bulk export** | Same gate as import | **Transport Planner** and **Driver Supervisor** can export |
| Delete / dangerous ops | Tenant Admin | Unchanged unless separately decided |

### Closing checklist

- [ ] FB-001-1 — Role seed / RBAC: `transport_planner` and `driver_supervisor` can add drivers (`MASTER_DATA_DRIVER_WRITE` + Drivers menu as needed)
- [ ] FB-001-2 — Admin: both roles see and can use Driver **Bulk Import** and **Bulk Export**
- [ ] Verify single Add Driver create/invite still works for Tenant Admin (regression)
- [ ] E2E / manual: TP and DS add one driver; import template; export CSV
