---
title: Sprint 6 Feedback — Fleet & Driver Supervisor
module: 06-fleet-supervisor
menu: Fleet / Driver Supervisor
parent: ./README.md
---

# Fleet & Driver Supervisor

**Admin menu / area:** Fleet / Driver Supervisor  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-023](#fb-023--driver-attendance-form-remove-redundant-date-field) | Driver Attendance form: remove redundant Date field | Medium | Resolved |

---

## FB-023 — Driver Attendance form: remove redundant Date field

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-17 |
| **Affected Stories** | DS-02 ([`driver-supervisor-operations.md`](../../../../05-modules/08-fleet-management/driver-supervisor-operations.md)) — Driver Attendance (DS-02-7 / DS-02-18) |
| **Closing Sub-tasks** | FB-023-1 — TBD |
| **AC Amendment** | Driver Attendance **admin create/edit form** SHALL **not** show a separate **Date** field. Attendance date is derived from **`entry_datetime`** only (same rule as REST `POST /api/v1/driver-attendance`, which already omits `date` from the request body). The `date` column remains in the database for uniqueness `(driver, date)` and changelist display, but is **read-only or hidden** on the form — operators enter **entry** and **exit** datetimes only. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `DriverAttendance` model has both `date` and `entry_datetime` (`apps/fleet_supervisor/models.py`). Admin form uses `fields = "__all__"`, exposing redundant date entry. API create path already derives `date` from `entry_datetime`. |

### Client feedback observation

The Driver Attendance screen asks for an extra **Date** field in addition to entry/exit times. Operations want that additional date input removed — one datetime capture is enough.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-023) |
|--------|---------|-------------------|
| Admin form fields | `date`, `entry_datetime`, `exit_datetime`, … | **No** editable `date` — entry/exit datetimes only |
| Attendance date storage | User may set `date` independently of entry time | `date` derived from `entry_datetime` on save |
| API behaviour | `date` derived server-side | Unchanged |
| Changelist / reports | Shows `date` column | Unchanged |

---
