---
title: Sprint 8 — Feedback Resolution Tracker
source_sprint: Sprint 8
total_items: 2
resolved: 2
in_progress: 0
open: 0
---

# Sprint 8 — Feedback Resolution Tracker

Client feedback captured during Sprint 8.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

> **Not in this tracker:** workflow / display items live in [`improvements/`](./improvements/README.md) (FB-001–FB-028).

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [FB-001](#fb-001--vehicle-master-data--show-wheel-information-beside-capacity) | Vehicle master: show wheel information beside capacity | Master Data · Vehicles · TO assignment | Medium | Resolved |
| [FB-002](#fb-002--user--driver--last_name-optional) | User & Driver: last_name optional | Users / Drivers · Invite · Bulk I/O | Medium | Resolved |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| Medium | 2 | 2 | 0 |
| **Total** | **2** | **2** | **0** |

---

## FB-001 — Vehicle master data: show wheel information beside capacity

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-08-13 |
| **Affected Stories** | US-053 / Vehicle master data ([`vehicle-master-data.md`](../../../../05-modules/02-master-data/vehicle-master-data.md)); own-fleet TO capacity fit ([`own-fleet-vehicle-capacity-validation.md`](../../../../05-modules/05-transport/own-fleet-vehicle-capacity-validation.md)); `VehicleAdmin` list (`display_capacity`); `vehicle_assignment_label`; capacity snapshot (`to_capacity_fit_panel`, create-from-TR `#dfms-create-vehicle-capacity`) |
| **Closing Sub-tasks** | FB-001-1 — Vehicle **changelist** **Wheels** column after **Capacity** · FB-001-2 — Create/edit: same Basic Information row as capacity + unit · FB-001-3 — TO vehicle picker shows wheels beside capacity · FB-001-4 — Vehicle capacity snapshot shows wheels beside capacity |
| **AC Amendment** | Vehicle master **list** SHALL display **wheels** as a sibling column after **Capacity** (not merged). Create/edit SHALL show wheels on the **same row** as capacity + unit. **TO own-fleet vehicle picker** (change-form autocomplete + create-from-TR select) SHALL show wheels **beside capacity** in the option label. **Vehicle capacity snapshot** (TO change-form **Load vs vehicle capacity** panel + create-from-TR capacity line) SHALL show wheels **beside** the capacity value. Blank wheels SHALL render as `—` (not `0`); on picker labels, omit the wheels segment when blank. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented 2026-08-13: `display_wheels` after Capacity; Basic Information same-row grouping; `vehicle_assignment_label` appends capacity + wheels; snapshot panel + create-from-TR line. |

### Client feedback observation

Ops need to see the vehicle's **wheel information** next to **capacity**, not only capacity — including **while choosing a vehicle on a TO** and on the **vehicle capacity snapshot**.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-001) |
|--------|---------|-------------------|
| Vehicle changelist | Capacity column; wheels not shown | **Wheels column immediately after Capacity** |
| Create / edit | Wheels on next row in Basic Information | **Same row** as capacity + unit |
| TO vehicle picker | `REG - status` only (`vehicle_assignment_label`) | **Capacity + wheels in the option label** |
| TO capacity snapshot (change form) | Panel cell **Vehicle capacity** = load only | **Wheels cell beside Vehicle capacity** |
| Create-from-TR capacity line | `Vehicle capacity: 10.000 MT` | **Wheels beside that value** |
| Blank wheels | Optional; omitted on list | `—` on list/snapshot; omit wheels segment on picker labels |

### Investigation — where to show wheels (2026-08-13)

**Field already stored:** `Vehicle.number_of_wheels` (`PositiveSmallIntegerField`, optional / nullable). Capacity is independent (`capacity` + `capacity_unit` MT/KG) — PRD’s “capacity derived from wheel count” is **not** implemented; wheels and capacity are two values, not one.

---

**1. Master Data → Vehicles changelist** (`/admin/master_data/vehicle/`) — FB-001-1

Current `list_display`: Registration, Chassis, Type, Body, Fuel, **Capacity**, Brand, Assigned POI, Operational status, Active. Wheels omitted.

| Option | Placement | Verdict |
|--------|-----------|---------|
| **A — sibling column** | New **Wheels** column immediately after **Capacity** | **Do this.** |
| B — merge into Capacity | e.g. `10.000 MT · 6 wheels` | Reject on list/panel (different units). |

Add `display_wheels` after `display_capacity`; null → `—`.

**2. Vehicle add / change** — FB-001-2

`_FS_BASIC_INFO`: `(capacity, capacity_unit)` on one row; `number_of_wheels` on the next. Put all three on one row:

```python
("capacity", "capacity_unit", "number_of_wheels")
```

**3. TO while choosing vehicle** — FB-001-3 (in scope)

One shared label: `vehicle_assignment_label` in `apps/transport/assignment_labels.py`. Today: `{registration} - {status}`. Used by:

| Surface | Widget | How label is applied |
|---------|--------|----------------------|
| TO **change** form Own Fleet **Vehicle** | Autocomplete (`#id_vehicle`) | `TransportAssignmentAutocompleteJsonView` → `vehicle_assignment_label` |
| **Create TO from TR** Own Fleet **Vehicle** | Native `<select>` | `CreateTOForm` + `vehicle_options[].label` |

Append capacity then wheels (dropdowns cannot have a sibling column):

```
DH-1234 - Scheduled · 10.000 MT · 6 wheels
```

Reuse `vehicle_capacity_display` for the capacity segment. Blank wheels: omit `· N wheels` (do not show `· 0` or `· —`). Missing capacity: omit capacity segment or show `—` only if both are blank.

**4. Vehicle capacity snapshot** — FB-001-4 (in scope)

Two snapshots; both show load capacity only today.

| Snapshot | Where | Current | Expected |
|----------|-------|---------|----------|
| **Load vs vehicle capacity** panel | TO change form, Own Fleet Assignment (`to_capacity_fit_panel.html`) | Grid: TO load · **Vehicle capacity** · Utilization | Add **Wheels** cell immediately after **Vehicle capacity** (`—` if blank) |
| Create-from-TR capacity line | Under vehicle select (`#dfms-create-vehicle-capacity`) | `Vehicle capacity: 10.000 MT` | `Vehicle capacity: 10.000 MT · 6 wheels` (or `· —`) |

Implementation hooks:

- Panel JSON: `_capacity_fit_change_context` already overrides `vehicle_capacity_display` per vehicle; add `wheels_display`. `change_form.html` `updatePanel()` sets `#dfms-capacity-vehicle-cap` — add `#dfms-capacity-wheels`.
- Create-from-TR: `vehicle_capacity_json` / `vehicle_options` include only `capacity_display`; add `wheels_display` and render beside the capacity span.

Do **not** change fit math (`assess_capacity_fit`) — wheels are display-only.

---

**Out of scope unless client expands further:**

| Screen | Why skip |
|--------|----------|
| Vehicle Planning list / board | Assignment board, not TO picker / MDM list |
| Vehicle bulk import CSV | `number_of_wheels` already optional |
| Vehicle detail API | Already includes `number_of_wheels` |

**Recommended layout (ops glance):**

```
Changelist:     … Fuel | Capacity | Wheels | Brand …
Add/change:     [Capacity] [Unit] [Number of wheels]
TO picker:      DH-1234 - Scheduled · 10.000 MT · 6 wheels
Snapshot panel: TO load | Vehicle capacity | Wheels | Utilization
Create-from-TR: Vehicle capacity: 10.000 MT · 6 wheels
```

### Closing checklist

- [x] FB-001-1 — Vehicle changelist shows number of wheels beside capacity
- [x] FB-001-2 — Create/edit keeps wheels grouped with capacity
- [x] FB-001-3 — TO vehicle picker shows wheels beside capacity
- [x] FB-001-4 — Vehicle capacity snapshot shows wheels beside capacity

---

## FB-002 — User & Driver: last_name optional

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-08-13 |
| **Affected Stories** | Staff invite (`/admin/users/invitation/`); User change; Driver add (`/admin/users/driver/`); User & Driver bulk import |
| **Closing Sub-tasks** | FB-002-1 — Staff invite / User add & change: `last_name` optional · FB-002-2 — Driver add: `last_name` optional · FB-002-3 — User and Driver bulk import: `last_name` optional (blank allowed) |
| **AC Amendment** | **User** and **Driver** `last_name` SHALL be **optional** on invite, create, change, and bulk import. **First name remains required.** Blank last name SHALL persist as empty (no synthetic placeholder such as `Member` / `User`). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented 2026-08-13: `User.last_name` blank; invite/driver forms optional; activation first-name-only; no `Member` placeholder; User/Driver CSV `last_name` optional. Plan: [`optional-last-name-fb002.md`](../../../../05-modules/03-users/optional-last-name-fb002.md). |

### Client feedback observation

User and Driver last name should not be mandatory.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Staff invite last name | Required | **Optional** |
| User change last name | Required (model / form) | **Optional** |
| Driver add last name | Required | **Optional** |
| User / Driver bulk import last name | Required column | **Optional**; blank allowed |
| First name | Required | Unchanged — **required** |
| Blank last name stored as | N/A (rejected) | Empty string (no placeholder) |

### Implementation plan

Moved to [`05-modules/03-users/optional-last-name-fb002.md`](../../../../05-modules/03-users/optional-last-name-fb002.md).

### Closing checklist

- [x] FB-002-1 — Staff invite / User add & change: last_name optional
- [x] FB-002-2 — Driver add: last_name optional
- [x] FB-002-3 — User and Driver bulk import: last_name optional
