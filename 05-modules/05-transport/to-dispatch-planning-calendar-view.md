---
module: 05-transport
specification: TO-03 — TO Dispatch Planning (Calendar View)
version: 1.7
phase: Phase 2
sprint: Sprint 10
status: Implemented
last_updated: 2026-09-24
changelog: "v1.7 — All own-fleet statuses in the period set (including execution / closed / cancelled); bar fill colour by TO status; monthly axis is Teams-style (weekday + date, weekend shade, today circle). v1.6 — Bar also shows TO status (existing dfms-badge). v1.5 — DFMS admin design system. v1.4 — Vehicle column = registration + capacity + current operational_status. v1.3 — Bar = TO number + start → dest. departure. v1.2 — No idle bars. v1.1 — Own-fleet only."
primary_surface: Django admin (custom read-only view under Transport)
problem_owner: Transport Planner / Tenant Admin / Tenant Super Admin
related_stories: TO-03
prd_refs:
  - "§ TO Dispatch Planning (Calendar View) — DFMS_Product_Requirements_Document_v3.md"
  - "02-domain/02-requirements/03-functional-requirements/functional-requirements-summary.md § 3.9"
amends: transport-order-management.md, vehicle-planning-view.md
new_permission: MENU_TO_DISPATCH_PLANNING_VIEW
django_apps: [apps/transport, apps/master_data, apps/core, apps/users, apps/requisitions]
ui_contract: DFMS admin design system (static/admin/css/custom.css; Vehicle Planning / portal lists). Prototype is behaviour reference only.
story: ../../03-backlog/phase-2/sprints/sprint-10/02-TO Dispatch Planning Calendar View/TO-03-to-dispatch-planning-calendar-view.md
---

# TO Dispatch Planning — Calendar View

## Overview

Planners already create TOs (TO-01) and assign vehicle, driver, helpers, and planned milestones (TO-02 / Vehicle Planning). There is no **vehicle-lane** view of that plan: the TO list is tabular, and Vehicle Planning is one vehicle at a time.

This story adds **Transport → TO dispatch planning**: a **read-only resource calendar**. Vehicles are rows; time is the axis; each **own-fleet** TO with a planned window is a bar on its vehicle (any lifecycle status). It does not create, assign, or change status or quantity. Assignment stays on TO detail and Vehicle Planning.

**Own fleet only.** Lanes are `master_data.Vehicle` (own-fleet master). The period set is `fleet_type=OWN`. Vendor TOs never appear in KPIs, result count, filters, or bars — there is no fleet-type filter. This amends TO-03 AC-2 / AC-3 (own-vs-vendor chrome, fleet-type select, Own fleet KPI).

**No idle bars.** Empty time between TOs stays blank. Do not paint dashed idle gaps (amends TO-03 AC-2 / BR-TO03-006).

**UI contract:** follow the **existing DFMS admin design system** — same tokens, badges, search, filters, breadcrumbs, and buttons as Vehicle Planning and other portal lists (`static/admin/css/custom.css`, `admin/base_site.html`). **Pagination is the existing portal list pager** (`resolve_admin_list_pagination`, `.dfms-pagination-parent`, `?p=` + `?per_page=` with `15/25/50/100/200`, session-remembered size) — same control as Vehicle Planning / changelists. Do not invent a calendar-specific pager or a fixed page size. Do **not** copy prototype-only chrome (theme toggle, custom palette, non-DFMS cards). Vehicle-first lanes stay; the PRD month-grid sketch is out of scope. The HTML prototype is a **behaviour/reference** sketch only.

**This is a new admin GET view over existing models.** No new table, no Celery, no REST endpoint.

```
Transport Planner / Tenant Admin
    │
    ├─► [1] GET  /admin/transport/to-dispatch-planning/
    │         Vehicle-lane calendar for the requested period + filters
    │         GET only — query params drive view / date / filters / page
    │
    ├─► [2] Click a bar
    │         Client-side drawer (payload already on the page)
    │         Footer: Open TO detail / Open parent TR (existing screens)
    │
    └─► [3] Previous / Next / Today / date picker / Daily|Weekly|Monthly / Filters
              Same URL, new GET params — lanes + KPIs reload
```

---

## 1. Architecture

### 1.1 Surfaces

| Surface | Role | Writes? |
|---|---|---|
| TO dispatch planning calendar | New | **Never** |
| Transport orders list / change | Existing | Unchanged |
| Vehicle planning | Existing | Unchanged |

Header links on the calendar page go to those two existing screens. The calendar itself has no POST.

### 1.2 Request / response

One Django admin view, one template. Period, view mode, filters, and vehicle-lane pagination are **GET query params** so refresh, back, and shared URLs work.

| Param | Values | Default |
|---|---|---|
| `view` | `daily` / `weekly` / `monthly` | `weekly` |
| `date` | `YYYY-MM-DD` (anchor in tenant TZ) | today (`Asia/Dhaka`) |
| `q` | search string | empty |
| `transfer_type` | `FG` / `PORT_CONSIGNMENT` | empty |
| `urgency` | `normal` / `high` / `critical` | empty |
| `assignment` | `unassigned` / `assigned` / `confirmed` | empty |
| `vehicle_type` | `VehicleType` value | empty |
| `p` | page (1-indexed) | `1` |
| `per_page` | `15` / `25` / `50` / `100` / `200` | portal default `25` |

No `drawer_to` write endpoint. Bar click opens a drawer from JSON already rendered on the page (`data-to` / a `bars_json` blob).

### 1.3 Layout (locked)

Daily, weekly, and monthly are the **same resource calendar**: vehicles left, time across.

```
┌──────── header: title, links to Vehicle planning + All transport orders ─┐
│  result count (filtered period TOs, includes unassigned)                 │
│  [Daily] [Weekly] [Monthly]   ⟨ prev   period label   next ⟩  Today  📅  │
│  4 KPI cards                                                             │
│  Filters + legend                                                        │
├──────── vehicle col ──────┬──────── time axis ───────────────────────────┤
│ DHK-1234                  │  [ TO-20260924-0001  Assigned  8:00 AM – 2:00 PM ] │
│ 10 MT                     │                                              │
│ Scheduled                 │                                              │
└───────────────────────────┴──────────────────────────────────────────────┘
```

Vehicle column (left): **registration**, **capacity** (`capacity` + `capacity_unit`, or `—`), **current** `operational_status` (`get_operational_status_display()` — No Active TO / Scheduled / In-transit / Under Maintenance). Do **not** show `N TO(s)`, `M concurrent`, or a derived **Free** badge.

Bar copy (on the lane): **TO number** + **TO status** + **planned start** → **planned destination departure** (tenant TZ, 12-hour). Example: `TO-20260924-0001  Assigned  8:00 AM – 2:00 PM`. Status uses the existing `_to_badge` / `transport_order_display_status` chip (same as the TO list). The drawn bar uses the two datetimes. **Bar fill colour is keyed by `TransportOrder.status`** (see §4.4) so Assigned, At Source, Closed, Cancelled, etc. are distinguishable without opening the drawer.

| Mode | Axis | Labels |
|---|---|---|
| Daily | 24 hour ticks | **12-hour** (`12 AM` … `11 AM`, `12 PM` … `11 PM`) |
| Weekly | 7 day columns | **Sun–Sat** weekday + date; today = filled circle; Sat/Sun shaded |
| Monthly | one column per day of the month | **Teams-style header**: weekday abbr + date number (`Tue` / `1`); today = filled circle; Sat/Sun shaded; Sunday = week boundary. Bars **snap to calendar days**. Vehicle-first stays — not a TO month-grid. |

### 1.4 Two querysets (do not collapse)

| Set | What it is | Used for |
|---|---|---|
| **Period TOs** | **Own-fleet** TOs (any status) whose planned window overlaps the visible range, after search/filters | Result count, 4 KPIs, bar payload |
| **Vehicle lanes** | Paginated own-fleet `Vehicle` rows | Left-hand rows |

Always `fleet_type=OWN` on the period queryset (hard filter, not a UI control). Bars are period TOs that have a `Vehicle` FK **and** whose vehicle is on the current page. Unassigned **own-fleet** TOs stay in KPIs / result count and never become a bar.

**Vehicle type** is the only TO filter that also changes listed vehicle rows. Search, transfer type, urgency, and assignment filter TOs only — empty vehicles still appear on the page.

### 1.5 Why no new model

`TransportOrder.vehicle`, `planned_start_at`, and `planned_destination_departure_at` already store the plan. A `CalendarEvent` / `VehicleLane` table would drift from the TO. Stack depth is derived at read time. Empty time between bars is just empty — **do not** draw idle spans.

---

## 2. Data Models

**No new model. No new field.** Reuse:

| Need | Source |
|---|---|
| TO number, status, allocated qty | `transport.TransportOrder` (`fleet_type` is always `OWN` on this page) |
| Planned bar window + label | `planned_start_at` → `planned_destination_departure_at` |
| Vehicle / driver / helpers | `vehicle`, `driver`, `helpers` M2M |
| Origin / destination | `origin_poi`, `destination_poi` |
| Parent TR, urgency, FG vs Port | `tr` → `requisitions.TransportRequisition` (`tr_number`, `urgency`, `tr_type`) |
| Vehicle row | `master_data.Vehicle` (`registration_number`, `vehicle_type`, `capacity`, `capacity_unit`, `operational_status`) |
| Driver label | `driver.user.full_name` |
| Helper label | `helper.full_name` |

### 2.1 Period-set statuses (v1.7)

The period set is **not** gated on planning-only statuses. Any own-fleet TO with a valid planned window is included: `created`, `under_planning`, `assigned`, `ready_for_dispatch`, **and** execution / closed / cancelled (`driving_towards_*`, `at_source`, `loaded_pickup_completed`, `at_destination`, `completed`, `closed`, `cancelled`, …).

`PLANNING_ELIGIBLE_STATUSES` remains **only** as the assignment-filter “not yet Ready” bucket (§2.2). Do **not** put it on `period_tos_queryset`.

Amends TO-03 AC-2 / BR-TO03-001 (was planning-eligible only).

### 2.2 Assignment filter (BR-TO03-007)

Among **period TOs** only. Execution / closed TOs match **neither** `assigned` nor `confirmed` (they still appear when the filter is empty):

| Filter | Meaning |
|---|---|
| `unassigned` | `vehicle_id IS NULL` |
| `assigned` | `vehicle_id` set **and** status ∈ `{created, under_planning, assigned}` (not yet Ready for dispatch) |
| `confirmed` | status = `ready_for_dispatch` |

### 2.3 Transfer-type filter

Story: **FG / Port consignment** → `tr.tr_type` (`FG` / `PORT_CONSIGNMENT`). Do **not** use `TransportOrder.transfer_type` (that is gate on-demand: dealer outbound / supplier inbound).

TOs with no parent TR drop out of this filter when it is set.

### 2.4 Vehicle column

| Shown | Source |
|---|---|
| Registration | `registration_number` |
| Capacity | `capacity` + `capacity_unit` (e.g. `10 MT`); `—` if capacity is null |
| Current status | `operational_status` as stored now (`no_active_to`, `scheduled`, `in_transit`, `under_maintenance`) — use `get_operational_status_display()` |

Do **not** show `N TO(s)`, `M concurrent`, or a calendar-derived **Free** label. Status is the vehicle’s current master value, not “does this lane have a bar in range?”.

`Vehicle.objects` already excludes soft-deletes (`deleted_at`). **Do not** copy Vehicle Planning’s `is_active=True` filter — under-maintenance vehicles are often `is_active=False` in master data, and they still appear.

Include: non-deleted vehicles except `operational_status=inactive` (decommissioned). Include empty and under-maintenance.

---

## 3. Query design

All datetimes in the DB are UTC (`USE_TZ`). Period bounds are computed in **`Asia/Dhaka`**, then converted to UTC for the overlap filter.

### 3.1 Visible range

| View | Range (tenant TZ) |
|---|---|
| Daily | `[date 00:00, date+1 00:00)` |
| Weekly | Sunday 00:00 of the week that contains `date` → next Sunday 00:00. **Sunday-start**, not Python’s Monday-start `weekday()`. |
| Monthly | first of month 00:00 → first of next month 00:00 |

### 3.2 Period overlap (BR-TO03-001)

A TO is in the period set when it is **own-fleet**, **any status**, **both** planned endpoints are set, **and**:

```
planned_start_at < range_end
AND planned_destination_departure_at > range_start
```

(standard half-open overlap). If either field is null, or start > dest departure, **omit** the TO from the period set. **Do not** fall back to `planned_destination_arrival_at` or deprecated `eta_datetime`.

```python
period_tos = (
    TransportOrder.objects.filter(
        fleet_type=FleetType.OWN,
        planned_start_at__isnull=False,
        planned_destination_departure_at__isnull=False,
        planned_start_at__lt=range_end_utc,
        planned_destination_departure_at__gt=range_start_utc,
    )
    .filter(planned_start_at__lte=F("planned_destination_departure_at"))
    .select_related(
        "tr",
        "vehicle",
        "driver__user",
        "origin_poi",
        "destination_poi",
    )
    .prefetch_related("helpers")
)
```

Then apply search + the four selects in Python/ORM on this queryset (see §3.4). `fleet_type` is already locked to `OWN` — do not add a UI filter for it.

### 3.3 Why an optional index (not a new table)

`planned_start_at` / `planned_destination_departure_at` exist (FB-006 / FB-008) but have **no index**. The overlap filter will sequential-scan own-fleet TOs that have both endpoints.

**Schema change:** none required for correctness.

**Optional performance migration** (tenant schema, `apps/transport` only) if planners have thousands of open TOs:

```python
# apps/transport/migrations/00xx_to03_planned_window_index.py
migrations.AddIndex(
    model_name="transportorder",
    index=models.Index(
        fields=["fleet_type", "status", "planned_start_at", "planned_destination_departure_at"],
        name="idx_to_planning_window",
    ),
)
```

Skip this in v1 if the tenant TO volume is small; add it when the page is slow. No data backfill.

**RBAC “migration”:** adding `MENU_TO_DISPATCH_PLANNING_VIEW` is **not** a Django schema migration. It is a public-schema catalog row created by `manage.py seed_dfms_rbac` (same as every other `PermissionCodes` entry). See §6.

### 3.4 Search and filters

Search `q` (icontains, OR):

- `to_number`
- `tr__tr_number`
- `vehicle__registration_number`
- `driver__user__first_name`, `driver__user__last_name`
- `origin_poi__name`, `destination_poi__name`

| Filter | ORM |
|---|---|
| `transfer_type` | `tr__tr_type=…` |
| `urgency` | `tr__urgency=…` |
| `assignment` | see §2.2 |
| `vehicle_type` | TOs: `vehicle_type=…` **or** (when assigned) `vehicle__vehicle_type=…` — pick **TO.vehicle_type** as the source of truth (set at create). Vehicle lanes: `Vehicle.vehicle_type=…` |

Clear = drop all filter/search params; keep `view`, `date`, `p`, `per_page`.

### 3.5 Vehicle lanes query

```python
vehicles_qs = (
    Vehicle.objects.exclude(operational_status=OperationalStatus.INACTIVE)
    .order_by("registration_number")
)
if vehicle_type:
    vehicles_qs = vehicles_qs.filter(vehicle_type=vehicle_type)

page, per_page = resolve_admin_list_pagination(
    request, session_key="per_page_transport.to_dispatch_planning"
)
paginator = Paginator(vehicles_qs, per_page)
page_obj = paginator.get_page(page)
```

Prefetch bars for **this page only**:

```python
page_ids = [v.pk for v in page_obj.object_list]
bars = [to for to in period_tos if to.vehicle_id in page_ids]
# group by vehicle_id in the service — do not N+1
```

KPIs and result count use the **full** filtered `period_tos`, not the current page.

### 3.6 KPI aggregations (one pass)

Compute from the filtered period list (or one `aggregate` + `Count(distinct)`):

| Card | Rule |
|---|---|
| **TOs in period** | `len(period_tos)` — same number as the header result count |
| **Parent TRs** | distinct non-null `tr_id` |
| **Unassigned** | `vehicle_id is None` (own-fleet TOs with no vehicle) |
| **Critical urgency** | `tr.urgency == critical` |

No **Own fleet** card — every period TO is already own-fleet, so it would duplicate TOs in period.

---

## 4. Service layer

New module: `apps/transport/to_dispatch_planning.py` (pure functions, no `HttpRequest` writes). Keep the view thin: parse GET → call service → `TemplateResponse`.

### 4.1 Period bounds

```python
def calendar_range(view: str, anchor: date, *, tz) -> tuple[datetime, datetime]:
    """Return (start, end) in `tz`, half-open. Weekly is Sunday–Saturday."""
```

Convert both to UTC before the ORM filter.

### 4.2 Bar geometry

Bar window = `[planned_start_at, planned_destination_departure_at]` clipped to the visible range. Same pair as the on-bar label.

**Monthly snap:** convert the clipped window to tenant-local dates; the bar occupies every day column from `local_start.date()` through `local_end.date()` inclusive (if end is exactly 00:00, that day is excluded — half-open).

**Weekly / monthly:** snap the clipped window onto **whole day columns** (same half-open local-date rule as monthly). A same-day TO fills that day’s cell (inset chip), not a minute-thin sliver across the week/month.

**Daily:** CSS `left` / `width` as `%` of the visible range (minutes from `range_start` / total minutes). Clamp to `[0, 100]`.

Bar chrome on the lane (required, visible without hover):

| Piece | Field |
|---|---|
| TO number | `to_number` |
| TO status | `transport_order_display_status` / `_to_badge` (any lifecycle label) |
| Start time | `planned_start_at` (tenant TZ, 12-hour) |
| End time | `planned_destination_departure_at` (tenant TZ, 12-hour) |

Format: `{to_number}  {status}  {start} – {dest_departure}` e.g. `TO-20260924-0001  Assigned  8:00 AM – 2:00 PM`. Full fields live in tooltip + drawer.

### 4.3 Stack (per vehicle, visible range)

Sort that vehicle’s bars by `planned_start_at`.

**Stack (greedy interval colouring):** assign each bar to the first lane whose last `end` ≤ this bar’s `start`. Overlapping bars get different lanes; they must not paint on top of each other. Do **not** put stack depth or TO count on the vehicle column.

**No idle bars.** Leave the empty span between non-overlapping TOs blank. Do not compute union gaps, do not paint dashed “idle” segments, and do not put idle in the legend. Empty vehicle → no bars; the left column still shows capacity + current `operational_status`.

### 4.4 Bar chrome

All bars are own-fleet. No own-vs-vendor left-border, no fleet colour in the legend.

**Status fill** (class `todp-bar--{status}` with `_` → `-`, from raw `TransportOrder.status`):

| Status | Bar class | Fill |
|---|---|---|
| `created` | `todp-bar--created` | Grey |
| `under_planning` | `todp-bar--under-planning` | Amber |
| `assigned` | `todp-bar--assigned` | Purple (`--dfms-primary`) |
| `ready_for_dispatch` | `todp-bar--ready-for-dispatch` | Green |
| `driving_towards_source` | `todp-bar--driving-towards-source` | Blue |
| `at_source` | `todp-bar--at-source` | Indigo |
| `loaded_pickup_completed` | `todp-bar--loaded-pickup-completed` | Cyan |
| `driving_towards_destination` | `todp-bar--driving-towards-destination` | Violet |
| `at_destination` | `todp-bar--at-destination` | Teal |
| `delivered_unloaded` | `todp-bar--delivered-unloaded` | Green |
| `in_progress` | `todp-bar--in-progress` | Blue (legacy) |
| `completed` | `todp-bar--completed` | Dark green |
| `bill_disbursed` | `todp-bar--bill-disbursed` | Dark teal |
| `closed` | `todp-bar--closed` | Slate |
| `cancelled` | `todp-bar--cancelled` | Red (`--dfms-danger`) |

Critical urgency (`tr.urgency == critical`) → red outline on top of the fill. Reuse `.dfms-badge--urgency-*` in the drawer.

### 4.5 Drawer payload (read-only)

Built in the service from the TO already in memory. Fields:

| Drawer row | Source |
|---|---|
| Note | `"Read-only in calendar view."` |
| Status | existing `transport_order_display_status` / `_to_badge` |
| Assignment | unassigned / assigned / confirmed (§2.2) |
| Urgency | `tr.get_urgency_display()` or `—` |
| Vehicle | `vehicle.registration_number` or `Unassigned` |
| Vehicle type | `get_vehicle_type_display()` |
| Driver | `driver.user.full_name` or `"Driver not assigned"` |
| Helper | comma-separated `helpers.full_name` or `—` |
| Source / dest POI | `origin_poi.name` / `destination_poi.name` |
| Allocated qty | `allocated_quantity` |
| Planned start | `planned_start_at` |
| Planned dest. arrival | `planned_destination_arrival_at` |
| Planned dest. departure | `planned_destination_departure_at` (bar end) |

Footer URLs (GET links, existing screens):

- Open TO detail → `admin:transport_transportorder_change`
- Open parent TR → `admin:requisitions_transportrequisition_change` (hide if `tr_id` is null)

Tooltip: TO number, TO status, TR number, planned start → planned dest. departure, origin → destination, driver (or “Driver not assigned”).

---

## 5. Admin integration

Follow Vehicle Planning: register standalone admin URLs in `TransportConfig.ready`, wrap with `admin.site.admin_view`.

### 5.1 URLs

| Name | Path | Purpose |
|---|---|---|
| `admin:transport_to_dispatch_planning` | `/admin/transport/to-dispatch-planning/` | Calendar (GET) |

No nested `/transport/transportorder/…` alias unless a later redirect is needed. Do **not** hang this off `TransportOrderAdmin.get_urls()` — Vehicle Planning already showed that nested admin URLs are awkward; it moved to `apps.py`.

View responsibilities:

1. Reject platform tenant (`_is_platform_tenant_request`) → message + redirect `admin:index`.
2. RBAC gate (§6) → `PermissionDenied` or redirect TO changelist.
3. Parse GET (§1.2). Invalid `view` / `date` → defaults, no 500.
4. Call the service. **No** `TransportOrder.objects.update`, **no** `save()`, **no** assignment service.
5. `TemplateResponse` + `admin.site.each_context`.

### 5.2 Menu

`apps/core/portal_navigation.py` — Transport section, **after Vehicle planning**:

```python
{
    "id": "to_dispatch_planning",
    "label": "TO dispatch planning",
    "url": "/admin/transport/to-dispatch-planning/",
    "icon": "calendar3",
    "permission_any": [PermissionCodes.MENU_TO_DISPATCH_PLANNING_VIEW],
    "role_any": ["transport_planner"],
    "role_exclude": ["driver_supervisor"],
},
```

Breadcrumb: **Home › Transport › Calendar-View**. Home → `admin:index`. Do **not** link `admin:app_list` (operational roles 403). “Transport” in the crumb can be plain text or the TO changelist — same rule as Vehicle Planning (`_base.html`).

Header actions (existing URLs, unchanged screens):

- Vehicle planning → `admin:transport_vehicle_planning`
- All transport orders → `admin:transport_transportorder_changelist`

---

## 6. RBAC

AC-5: Transport Planner, Tenant Admin, Tenant Super Admin see the item. Other roles do not unless the permission is granted.

### 6.1 New permission

```python
# apps/core/constants_rbac.py  (next to MENU_VEHICLE_PLANNING_VIEW)
MENU_TO_DISPATCH_PLANNING_VIEW = "Menu.Transport.TODispatchPlanning.View"
```

Add the same tuple to `PERMISSION_DEFINITIONS` in `apps/core/role_seed_data.py`:

```python
(
    PermissionCodes.MENU_TO_DISPATCH_PLANNING_VIEW,
    "View Transport → TO dispatch planning",
    "Menu",
    "global",
),
```

**Why `PERMISSION_DEFINITIONS`:** `tenant_admin` and `tenant_super_admin` are filled from this list (`_apply_tenant_admin_catalog_permissions`). Skipping it is why `MENU_VEHICLE_PLANNING_VIEW` is missing from the catalog today — do not repeat that.

Also append the code to the `transport_planner` seed list. `role_any: ["transport_planner"]` is a belt-and-suspenders so a tenant that has not re-run seed still sees the item for that working role.

Re-seed: `manage.py seed_dfms_rbac` (no `--reset` unless the operator intends a full wipe). No tenant-schema migration.

`_item_visible` already returns True for `is_super_admin` and `is_tenant_admin`. `tenant_super_admin` sets **both** `is_tenant_super_admin` and `is_tenant_admin` (`sync_tenant_admin_flags_from_role`).

### 6.2 View gate

```python
def user_can_view_to_dispatch_planning(user) -> bool:
    if getattr(user, "is_super_admin", False) or getattr(user, "is_tenant_admin", False):
        return True
    if user_is_transport_planner(user):
        return True
    perms = set(user.get_all_permissions() or [])
    return PermissionCodes.MENU_TO_DISPATCH_PLANNING_VIEW in perms
```

Platform Super Admin on a **tenant** schema follows the existing portal bypass (`is_super_admin`). Platform schema itself never shows operational Transport nav.

Working-role (TUM-06): `user_is_transport_planner` / `_user_has_role` already use the working role. A dual-hat user only sees this menu when the working role is Transport Planner (or they hold the explicit permission / tenant-admin flag).

### 6.3 Read-only invariant (BR-TO03-004)

The view module must not import `TDOAssignmentService` for writes. Tests assert the request is GET and that `TransportOrder.save` / `Vehicle.save` are not called. Drawer links are `<a href>` to existing change views.

---

## 7. Templates

New templates under `templates/admin/transport/to_dispatch_planning/`, `{% extends "admin/base_site.html" %}`. **Match the live portal**, not the prototype HTML.

Reuse what Vehicle Planning and changelists already use:

| Concern | Reuse |
|---|---|
| Page chrome | `admin/base_site.html`, `.dfms-page-header` |
| Search | `.dfms-search-wrap` / `#changelist` toolbar (same as `select_vehicle.html`) |
| Filters | `#changelist-filter` / portal filter panel pattern |
| Status / urgency | existing `dfms-badge--*` / `_to_badge` / urgency badges |
| Operational status | same badge mapping as Vehicle master / Vehicle Planning |
| Pagination | `resolve_admin_list_pagination` + `.dfms-pagination-parent` |
| Buttons / links | `dfms-btn-save`, `dfms-btn-secondary` |
| Icons | Bootstrap-icons already on `base_site.html` (`bi-*`) |
| Breadcrumbs | Home → this page; never `admin:app_list` |

No new CSS framework. Calendar-only rules (lane grid, bar `left`/`width`, today column, drawer) may live in a small `to_dispatch_planning.css` using **existing CSS variables** (`--dfms-*`). Do not invent a second colour system.

| File | Purpose |
|---|---|
| `calendar.html` | Shell, KPIs, filters, legend, lanes, drawer markup |
| optional `_lane.html` | One vehicle row + stacked bars |
| optional `_drawer.html` | Read-only definition list + footer links |
| `static/admin/css/to_dispatch_planning.css` | Grid, bar, today column, drawer |
| `static/admin/js/to_dispatch_planning.js` | Drawer open/close (X, backdrop, Escape), selected-bar emphasize / others dim. **No fetch POST.** |

Pagination: copy Vehicle Planning — `resolve_admin_list_pagination` + the `dfms-pagination-parent` markup from `select_vehicle.html` (per-page select `15–200`, `?p=`).

Filter UI: a “Filters” panel with search + four selects (transfer type, urgency, assignment, vehicle type) + **Clear**. No fleet-type select. Legend: urgency, assignment badges, **TO status colour swatches**, “bar = planned start → dest. departure”. No idle swatch. No fleet colours.

**Monthly axis (Teams-inspired, still vehicle-first):** each day column shows weekday abbr + date number; today is a filled circle on the date; Sat/Sun columns are shaded; Sunday has a stronger left border (week start). Widen month columns (~56px) and allow horizontal scroll. Narrow month bars may hide the badge + time and keep the TO number (full copy stays in tooltip / drawer).

Today mark: weekly and monthly highlight today’s column (circle + column wash). Daily may show a “now” line; not required by AC if the 24 ticks are correct.

---

## 8. What we are not building

| Out of scope | Why |
|---|---|
| New `Calendar*` model / write APIs | Plan already lives on the TO |
| Celery / cache warming | One page query is enough |
| REST calendar API | Admin SSR only (P0) |
| Drag-and-drop / create-from-calendar | BR-TO03-004 |
| Unassigned TOs on the timeline | Locked PO decision |
| Vendor-fleet TOs (period set, KPIs, bars) | Vehicle-wise calendar; `fleet_type=OWN` only |
| Vendor-fleet vehicle rows | No `Vehicle` master for vendor trucks |
| Fleet-type filter / Own fleet KPI / own-vs-vendor chrome | Redundant once the page is own-fleet only |
| Capacity utilization bars | Out of story |
| Idle / dashed gap bars | Locked: empty time between TOs stays blank (amends TO-03 AC-2 / BR-TO03-006) |
| GPS / FVM-03 idle hours | Different clock; not this page |
| TO-centric month grid | Vehicle-first wins; monthly is still vehicles × day columns (Teams **header**, not a month cell grid) |
| Theme toggle / prototype-only chrome | Not in the live admin design system |
| Changing Vehicle Planning or the TO list | AC / DoD |

---

## 9. Unit test plan

New: `tests/unit/test_transport/test_to_dispatch_planning.py`. Prefer testing the service with real/in-memory datetimes; mock ORM in the view the same way as `test_vehicle_planning.py`.

| # | Case | Assert |
|---|---|---|
| 1 | Period overlap | TO fully inside, overlapping start, overlapping end → included; fully before/after → excluded |
| 2 | Null / inverted window | missing `planned_start_at` or dest. departure, or start > dest departure → omitted |
| 3 | Status set | `created` / `under_planning` / `assigned` / `ready_for_dispatch` **and** execution / closed / `cancelled` in when the window overlaps; bar `status_class` = `todp-bar--{status}` |
| 3b | Monthly ticks | weekday names + date numbers; Sep 2026 starts `Tue` / `1`; today + weekend flags |
| 4 | Unassigned omitted from lanes | no `vehicle` → in result count + Unassigned KPI; `vehicle_id` not in any lane’s bars |
| 5 | Vendor excluded | `fleet_type=VENDOR` (with or without a `Vehicle` FK) → absent from period set, KPIs, and every lane |
| 6 | Bar window + label | geometry uses `planned_start_at` → `planned_destination_departure_at`; label includes `to_number` + TO status badge + those two times |
| 7 | Monthly snap | bar occupying two local dates spans two day columns |
| 8 | Daily labels | 24 ticks, `12 AM` … `11 PM` |
| 9 | Weekly bounds | Sunday–Saturday in `Asia/Dhaka` |
| 10 | Overlap stack | two overlapping TOs → two visual lanes; vehicle column has **no** concurrent / N TO(s) label |
| 11 | No idle bar | two non-overlapping bars → empty space between them; context/HTML has no idle span |
| 12 | Vehicle column | shows registration, capacity+unit, and current `operational_status`; `under_maintenance` + `is_active=False` still listed; no Free badge |
| 13 | Filters | transfer type, urgency, assignment, vehicle type + search; no `fleet_type` param; Clear drops filters; vehicle type changes vehicle queryset |
| 14 | Assignment filter | unassigned / assigned / confirmed match §2.2 |
| 15 | KPIs | four cards match the filtered period set (not the current vehicle page) |
| 16 | Pagination | `resolve_admin_list_pagination` session key; page 2 vehicles differ; KPI count unchanged |
| 17 | RBAC | planner + tenant admin allowed; gateman / driver denied; platform tenant redirected |
| 18 | No writes | GET handler never calls `TransportOrder.save` / assignment services |
| 19 | URLs | reverse `admin:transport_to_dispatch_planning` == `/admin/transport/to-dispatch-planning/` |
| 20 | Nav | item visible for `transport_planner` working role; hidden for `driver_supervisor` |

View tests can assert template name + context keys (`kpis`, `lanes`, `period_label`, `legend` implied by context). Drawer HTML can be a simple context-flag test (`drawer_note == "Read-only in calendar view."`).

---

## 10. Implementation order

| # | Step | Why this order | Story |
|---|---|---|---|
| 1 | This spec (done) | Do not start Django from the story file alone | TO-03-1 |
| 2 | Query helpers: range, overlap, filters, KPIs | Everything else is a consumer | TO-03-2 |
| 3 | Stack + bar geometry | Needed before the template can render lanes | TO-03-3 |
| 4 | Admin URL + GET view + pagination | Empty lanes first, then bars | TO-03-3, TO-03-6 |
| 5 | Templates: axis, lanes, bars, today | Visual contract | TO-03-3 |
| 6 | Filters + KPI cards + legend | Same queryset as §2 | TO-03-4 |
| 7 | Drawer JS + Open TO / Open TR | Read-only, last UI piece | TO-03-5 |
| 8 | Permission + seed + portal nav + view gate | Menu last so the page exists first | TO-03-6 |
| 9 | Tests in §9 | Lock overlap / unassigned / no-write | TO-03-7 |
| 10 | Optional window index | Only if the page is slow | — |

Do **not** ship step 2 without step 8 in the same PR if the URL is reachable — otherwise the route exists with no menu/RBAC. URL + gate + menu go together.

---

## 11. Files changed

| File | Change | Why |
|---|---|---|
| `apps/transport/to_dispatch_planning.py` **(new)** | Range, overlap QS, filters, KPIs, stack, drawer DTOs | Keep calendar math out of `admin.py` |
| `apps/transport/to_dispatch_planning_views.py` **(new)** | GET view, platform/RBAC, pagination, `TemplateResponse` | Same split as `vehicle_planning_views.py` |
| `apps/transport/apps.py` | Register `/admin/transport/to-dispatch-planning/` | Established custom-admin pattern |
| `apps/core/constants_rbac.py` | `MENU_TO_DISPATCH_PLANNING_VIEW` | New menu capability |
| `apps/core/role_seed_data.py` | Add to `PERMISSION_DEFINITIONS` + `transport_planner` | Tenant admin catalog + planner grant |
| `apps/core/portal_navigation.py` | Transport item | AC-1 / AC-5 |
| `templates/admin/transport/to_dispatch_planning/calendar.html` **(new)** | Page | DFMS admin layout |
| `static/admin/css/to_dispatch_planning.css` **(new)** | Lanes / bars / drawer | Avoid bloating `custom.css` |
| `static/admin/js/to_dispatch_planning.js` **(new)** | Drawer only | No writes |
| `tests/unit/test_transport/test_to_dispatch_planning.py` **(new)** | §9 | DoD |
| `apps/transport/migrations/00xx_…` **(optional)** | Window index | Performance only |

**Do not change:** `TDOAssignmentService`, Vehicle Planning views/templates, TO changelist, `Vehicle.operational_status` writers, FVM hour services.

---

## 12. Traps

1. **Monday-start weeks** — AC requires Sun–Sat. `datetime.weekday()` is Monday=0. Write an explicit Sunday-start helper and test it.
2. **`is_active=True` copy-paste** from Vehicle Planning drops under-maintenance trucks.
3. **Paginating TOs** — lanes are vehicles; KPIs ignore the page.
4. **Dest. arrival as bar end** — story used arrival; this plan uses **dest. departure**. Do not fall back to `eta_datetime`.
5. **Idle bars / prototype chrome** — do not add dashed gaps or a custom palette “to match the prototype.” Empty time stays empty; UI matches the live admin.
6. **Vendor TOs in KPIs** — do not count them. Period set is `fleet_type=OWN` only; a vendor TO with a leftover `Vehicle` FK still must not draw.
7. **`TO.transfer_type` for FG/Port** — wrong field; use `tr.tr_type`.
8. **POST “for convenience”** — any write fails AC-5. Drawer is client-side.
9. **Catalog-only permission** — must be in `PERMISSION_DEFINITIONS` so tenant admin / tenant super admin receive it on seed.
10. **`admin:app_list` breadcrumb** — 403 for Transport Planner.
11. **Planning-only status gate** — v1.7 shows execution / closed / cancelled. Do not re-add `status__in=PLANNING_ELIGIBLE_STATUSES` on the period queryset.
12. **Monthly day numbers only** — axis must include weekday names (Teams-style). Do not revert to `1…31` with no `Sun`/`Mon`.

---

## 13. Related documentation

| Doc | Role |
|---|---|
| [TO-03 story](../../03-backlog/phase-2/sprints/sprint-10/02-TO%20Dispatch%20Planning%20Calendar%20View/TO-03-to-dispatch-planning-calendar-view.md) | AC, BRs. **This plan wins** on own-fleet-only, no idle bars, bar = start → dest. departure, vehicle column = capacity + current status (no concurrent / Free), **all statuses + status colours**, and **Teams-style monthly header**. |
| [Sprint folder](../../03-backlog/phase-2/sprints/sprint-10/02-TO%20Dispatch%20Planning%20Calendar%20View/README.md) | Epic index |
| `docs/prototypes/to-dispatch-planning-calendar.html` | Behaviour/reference sketch only — **not** the visual SSOT |
| [vehicle-planning-view.md](./vehicle-planning-view.md) | Write surface this calendar does **not** replace |
| [transport-order-management-v2.md](./transport-order-management-v2.md) | Planned milestones / assignment rules |
| [trip-management.md](./trip-management.md) | TO status lifecycle |
| Archived US-071 | Historical; this plan + live DFMS admin win on conflicts |

---

## Locked decisions (do not re-open)

From TO-03 PO table. Re-open only if the PO changes the story.

| ID | Decision |
|----|----------|
| L1 | Vehicle-first only. No TO month-grid. No vehicle-wise toggle. |
| L2 | Period set is **own-fleet only** (`fleet_type=OWN`). Bars only for those TOs that also have a `Vehicle` FK. Unassigned own-fleet TOs count in KPIs / result / filters only. Vendor TOs are out of this page. |
| L3 | Bar label = `to_number` + TO status + `planned_start_at` → `planned_destination_departure_at`. Bar window is those two datetimes. Monthly snaps to days. |
| L4 | Daily = 24 × 12-hour ticks. Weekly = Sun–Sat. Monthly = one column per day with weekday + date (Teams-style header). Still vehicle-first. |
| L5 | Click = read-only drawer. Calendar never writes. |
| L6 | No vendor vehicle rows, no fleet-type filter, no Own fleet KPI, no own-vs-vendor bar chrome. VP-01 not required; overlapping bars still stack visually. |
| L7 | No idle bars. Empty time between a vehicle’s TOs is blank (not a dashed idle span). |
| L8 | Vehicle column = registration + capacity + current `operational_status`. No `N TO(s)`, no concurrent, no Free badge. Portal list pagination. Empty and under-maintenance vehicles still appear. |
| L9 | UI is consistent with the existing DFMS admin (Vehicle Planning, changelists, `custom.css`). Prototype is not the design source of truth. |
| L10 | Period set includes **all own-fleet statuses** (planning, execution, closed, cancelled) when the planned window overlaps. Bar fill colour maps 1:1 from `TO.status`. Amends the original planning-eligible-only gate. |

