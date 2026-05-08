---
story_id: DB-01
title: Role-Based Dashboard (Universal Landing Page)
epic: Dashboard
sprint: Sprint 3
story_points: 5
priority: P1
status: Delivered
jira: DFS-043
author: Product
last_updated: 2026-05-07
delivered: 2026-05-07
---

# DB-01 — Role-Based Dashboard (Universal Landing Page)

## Problem Statement

Every tenant user lands on `/admin/` after login, which currently shows the raw Django admin index — a confusing table of registered models that is meaningless for operational roles. There is no shared landing page. The current `MENU_TENANT_ADMIN_DASHBOARD_VIEW` permission is assigned only to the Tenant Admin role, leaving all operational roles without a dashboard entry point.

## Goal

Provide **one dashboard URL** (`/admin/`) that every tenant user can access after login. The page layout and KPI widgets shown are **dynamically scoped to the user's role** — a depot officer sees their own PR activity, a distribution manager sees the pending TR approval queue, a transport planner sees available TRs awaiting planning, etc.

---

## Acceptance Criteria

### AC-1 — Universal access
- [x] All active `is_staff` tenant users can access `/admin/` without a 403
- [x] Dashboard is the default landing page after login (Django admin root)
- [x] No role has a blank or error page as their home screen

### AC-2 — Role-scoped widget set
- [x] Each role sees widgets scoped to their role — see Widget Matrix below
- [x] Widgets not applicable to a role are simply not rendered

### AC-3 — Permission gate
- [x] `MENU_DASHBOARD_VIEW` permission code added and assigned to all operational roles
- [x] Tenant Admin retains full Django admin index (unchanged)
- [x] Non-staff / platform-schema requests return 403

### AC-4 — Navigation
- [x] Sidebar "Overview" item visible to all roles via `Menu.Dashboard.View`
- [x] URL remains `/admin/`

### AC-5 — Data freshness
- [x] All KPI counts are live queries (no caching)

---

## Widget Matrix (Role → Widgets)

> Widget IDs are stable identifiers from `dashboard_service.py`. Each widget has: `id`, `label`, `icon` (Bootstrap Icon name), `count`, `url` (pre-filtered admin URL), `color`, `urgency` (bool — tints card when count > 0).

### Depot / Feed Mill Officer

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `my_draft_prs` | Draft Requisitions | `pencil-square` | muted | `ProductRequisition` where `requested_by=user`, `status=DRAFT`, `pr_type=FINISHED_GOODS` |
| `my_submitted_prs` | Submitted Requisitions | `send-check` | primary | Same model, `status=SUBMITTED` |
| `my_inprogress_prs` | In-Progress Requisitions | `arrow-repeat` | warning | Same model, `status=IN_PROGRESS` |
| `my_fulfilled_prs` | Fulfilled Requisitions | `check2-circle` | success | Same model, `status=FULFILLED` |

### Commercial Officer

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `my_draft_shipments` | Draft Port Shipments | `pencil-square` | muted | `ProductRequisition` where `requested_by=user`, `status=DRAFT`, `pr_type=PORT_CONSIGNMENT` |
| `my_submitted_shipments` | Submitted Shipments | `box-arrow-up` | primary | Same model, `status=SUBMITTED` |

### Distribution Officer

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `pending_fg_prs` | Pending FG Requisitions | `inbox` | warning | `ProductRequisition` where `pr_type=FINISHED_GOODS`, `status=SUBMITTED` (org-wide) |
| `my_active_trs` | My Active Transport Requests | `arrow-right-circle` | primary | `TransportRequisition` where `requested_by=user`, `tr_type=FG`, `status__in=[SUBMITTED, PENDING_APPROVAL, APPROVED]` |

### Distribution Manager

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `pending_tr_approvals` | TRs Awaiting Your Approval | `hourglass-split` | danger | `TransportRequisition` where `tr_type=FG`, `status=PENDING_APPROVAL` (org-wide) |
| `pending_fg_prs` | Submitted FG Requisitions | `inbox` | warning | `ProductRequisition` where `pr_type=FINISHED_GOODS`, `status=SUBMITTED` |
| `inprogress_fg_prs` | FG Requisitions In Progress | `arrow-repeat` | primary | Same model, `status=IN_PROGRESS` |
| `approved_trs` | Approved TRs (Awaiting Planning) | `check-circle` | success | `TransportRequisition` where `tr_type=FG`, `status=APPROVED` |

### Procurement Officer

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `shipments_needing_tr` | Shipments Awaiting TR | `box-seam` | danger | `ProductRequisition` `PORT_CONSIGNMENT`, `status=SUBMITTED`, **excluding** those with at least one `TransportRequisition` already |
| `shipments_in_progress` | Shipments In Progress | `arrow-repeat` | warning | Same model, `status=IN_PROGRESS` |
| `my_trs_pending_approval` | My TRs Awaiting Approval | `hourglass-split` | warning | `TransportRequisition` where `requested_by=user`, `tr_type=PORT_CONSIGNMENT`, `status=PENDING_APPROVAL` |
| `my_trs_approved` | My Approved TRs | `check-circle` | success | Same filter, `status=APPROVED` |

> Note: Procurement TRs do not require manager approval — these widgets reflect the status values as-stored (e.g. `APPROVED` = immediately available for planning after submission).

### Transport Planner

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `available_fg_trs` | FG TRs Ready to Plan | `list-task` | primary | `TransportRequisition` where `tr_type=FG`, `status=AVAILABLE_FOR_TRANSPORT_PLANNING` |
| `available_port_trs` | Port TRs Ready to Plan | `list-task` | info | `TransportRequisition` where `tr_type=PORT_CONSIGNMENT`, `status=SUBMITTED` |
| `open_tos` | Open Transport Orders | `truck` | warning | `TransportOrder` where `status__in=[created, assigned]` |

### TDO (Own Fleet & Vendor Fleet)

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `open_tos` | Open Transport Orders | `truck` | primary | `TransportOrder` where `status__in=[created, assigned]` (org-wide) |

### Driver

| Widget ID | Label | Icon | Color | Data source |
|-----------|-------|------|-------|-------------|
| `my_assigned_tos` | My Assigned Transport Orders | `person-badge` | primary | `TransportOrder` where `driver__user=user`, `status=assigned` |

### Tenant Admin

Tenant Admin sees the existing full KPI summary dashboard (platform + tenant aggregate stats via `get_tenant_stats()`). No role widgets are rendered — `get_role_widgets()` returns `[]` for `is_tenant_admin=True`.

---

## Widget Design

Each widget is a **card** rendered in `templates/admin/index.html` (`role_widgets` context block) with:
- **Bootstrap Icon** (`bi-{icon}`)
- **Label** (display text)
- **Count** (large number, colour-tinted when `urgency=True`)
- **Link** → pre-filtered admin changelist URL
- **Empty state**: count = 0 shows "All clear" with muted styling (card still visible)

Widgets rendered in a **responsive CSS grid** using Django admin CSS variables — compatible with light and dark mode.

---

## Role → Widget Groups (actual delivery)

```
depot_officer / feed_mill_officer  (4 widgets)
  ├── my_draft_prs
  ├── my_submitted_prs
  ├── my_inprogress_prs
  └── my_fulfilled_prs

commercial_officer  (2 widgets)
  ├── my_draft_shipments
  └── my_submitted_shipments

distribution_officer  (2 widgets)
  ├── pending_fg_prs
  └── my_active_trs

distribution_manager  (4 widgets)
  ├── pending_tr_approvals        ← shown first (highest urgency)
  ├── pending_fg_prs
  ├── inprogress_fg_prs
  └── approved_trs

procurement_officer  (4 widgets)
  ├── shipments_needing_tr        ← Exists() subquery excludes already-TR'd shipments
  ├── shipments_in_progress
  ├── my_trs_pending_approval
  └── my_trs_approved

transport_planner  (3 widgets)
  ├── available_fg_trs
  ├── available_port_trs
  └── open_tos

tdo_own_fleet / tdo_vendor_fleet  (1 widget)
  └── open_tos

driver  (1 widget)
  └── my_assigned_tos

tenant_admin
  └── (no role widgets — existing KPI summary dashboard unchanged)
```

---

## Technical Implementation (Actual)

### 1. Admin index monkey-patch — `config/admin.py`

The Django admin `index` method is monkey-patched at startup. For tenant schemas, `get_role_widgets(request.user)` is called and injected as `role_widgets` into the template context:

```python
# config/admin.py — patched_index
from apps.core.dashboard_service import get_role_widgets
extra_context["role_widgets"] = get_role_widgets(request.user)
```

Tenant Admin and platform admins are handled separately — they see the existing `get_tenant_stats()` / `get_platform_stats()` KPI dashboard. Role widgets are only rendered for operational users (`is_tenant_admin=False`).

### 2. Widget data helper — `apps/core/dashboard_service.py`

`get_role_widgets(user)` resolves role codes via cross-schema lookup (`public_schema_context`), then calls per-role private functions. Each returns a list of widget dicts:

```python
{"id", "label", "icon", "count", "url", "color", "urgency"}
```

Distribution Manager and Distribution Officer use `elif` — DM widgets take precedence if a user has both roles.

### 3. Template — `templates/admin/index.html`

The existing admin `index.html` template was extended with a `{% if role_widgets %}` block that renders widget cards in a CSS grid. No separate `dashboard.html` file — widgets are injected inline into the standard admin index.

### 4. Sidebar navigation — `apps/core/portal_navigation.py`

The "Overview" sidebar item uses `permission_any: [MENU_DASHBOARD_VIEW, MENU_TENANT_ADMIN_DASHBOARD_VIEW]` so all roles see the entry.

### 5. RBAC seed

`MENU_DASHBOARD_VIEW` added to all operational roles including `tdo_own_fleet`, `tdo_vendor_fleet`, and `driver` (added when those roles were implemented).

---

## Out of Scope (Sprint 3)

- Charts / graphs (bar, line) — deferred to Reports sprint
- Real-time push updates (WebSocket) — Sprint 5+
- Notifications panel on dashboard — separate story
- Drill-down modals from widget cards — link to list view is sufficient
- Mobile-responsive layout polish — Sprint 4 mobile app story

---

## Implementation Notes

### Deviations from original spec

| Spec | Actual |
|------|--------|
| Sidebar heading: "Dashboard" | Labelled **"Overview"** — consistent with sidebar section conventions |
| Separate `dashboard.html` template | Widgets injected inline into existing `templates/admin/index.html` via `{% if role_widgets %}` block |
| `apps/core/portal_views.py` override | Implemented as a monkey-patch on `AdminSite.index` in `config/admin.py` |
| `get_dashboard_widgets()` function name | Built as `get_role_widgets()` in `dashboard_service.py` |
| Distribution Manager: 2 widgets | Delivered with **4 widgets** (added `inprogress_fg_prs` and `approved_trs`) |
| Procurement Officer: 2 widgets | Delivered with **4 widgets** (added `shipments_in_progress` and `my_trs_approved`) |
| Depot/Feed Mill Officer: 3 widgets | Delivered with **4 widgets** (added `my_fulfilled_prs`) |
| `driver` widget added mid-sprint | Added when driver TO access was implemented |
| `tenant_admin` sees `tenant_summary` widget | Tenant Admin uses the existing full KPI stats dashboard — no role widget cards |

### Key files

| File | Purpose |
|------|---------|
| `config/admin.py` | `patched_index` injects `role_widgets` into admin index context |
| `apps/core/dashboard_service.py` | `get_role_widgets(user)` + per-role helper functions |
| `templates/admin/index.html` | Widget card grid rendered inside `{% if role_widgets %}` block |
| `apps/core/portal_navigation.py` | "Overview" sidebar item with `MENU_DASHBOARD_VIEW` |

---

## Definition of Done

- [x] `MENU_DASHBOARD_VIEW` added to `PermissionCodes` and all operational roles in seed
- [x] `portal_navigation.py` "Overview" item uses `MENU_DASHBOARD_VIEW` (all roles see it)
- [x] `dashboard_service.py` implemented with widget helpers for all roles
- [x] `admin/dashboard.html` renders widget grid; light + dark mode compatible
- [x] Django admin root renders custom dashboard for all non-platform staff
- [x] Tenant Admin still has full Django admin index (unchanged)
- [x] All widget counts verified against live DB
- [x] No 403 for any active `is_staff` tenant user hitting `/admin/`
- [ ] Unit tests > 80% — carry-forward (QA sprint)
