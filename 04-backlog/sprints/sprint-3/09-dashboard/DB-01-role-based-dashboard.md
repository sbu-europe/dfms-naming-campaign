---
story_id: DB-01
title: Role-Based Dashboard (Universal Landing Page)
epic: Dashboard
sprint: Sprint 3
story_points: 5
priority: P1
status: Pending
jira: DFS-043
author: Product
last_updated: 2026-05-05
---

# DB-01 — Role-Based Dashboard (Universal Landing Page)

## Problem Statement

Every tenant user lands on `/admin/` after login, which currently shows the raw Django admin index — a confusing table of registered models that is meaningless for operational roles. There is no shared landing page. The current `MENU_TENANT_ADMIN_DASHBOARD_VIEW` permission is assigned only to the Tenant Admin role, leaving all operational roles without a dashboard entry point.

## Goal

Provide **one dashboard URL** (`/admin/`) that every tenant user can access after login. The page layout and KPI widgets shown are **dynamically scoped to the user's role** — a depot officer sees their own PR activity, a distribution manager sees the pending TR approval queue, a transport planner sees available TRs awaiting planning, etc.

---

## Acceptance Criteria

### AC-1 — Universal access
- All active `is_staff` tenant users can access `/admin/` without a 403.
- The dashboard is the **default landing page** after login (Django admin root).
- No role has a blank or error page as their home screen.

### AC-2 — Role-scoped widget set
Each role sees a dashboard composed of the widgets defined in the **Widget Matrix** below. Widgets a role doesn't have access to are simply not rendered (no empty placeholders, no error state).

### AC-3 — Permission gate
- A new permission code `Menu.Dashboard.View` is added and assigned to **every operational role** in `role_seed_data.py`.
- The existing `Menu.TenantAdminDashboard.View` remains for Tenant Admin (full admin index).
- Non-staff or platform-schema requests return 403 as usual.

### AC-4 — Navigation
- The sidebar "Dashboard" item (currently Tenant Admin only) is updated to use `Menu.Dashboard.View` so all roles see it.
- The URL remains `/admin/`.

### AC-5 — Data freshness
- All KPI counts are **live queries** (no caching in v1); page loads reflect current DB state.
- Response time target: < 1 second for typical tenant data volumes (< 10,000 records per model).

---

## Widget Matrix (Role → Widgets)

> Widget IDs are stable identifiers used in the template include system.

| Widget ID | Label | Roles that see it | Data source |
|-----------|-------|-------------------|-------------|
| `my_draft_prs` | My Draft PRs | `depot_officer`, `feed_mill_officer` | `ProductRequisition` where `requested_by=user`, `status=DRAFT`, `pr_type=FINISHED_GOODS` |
| `my_submitted_prs` | My Submitted PRs | `depot_officer`, `feed_mill_officer` | Same model, `status=SUBMITTED` |
| `my_inprogress_prs` | My In-Progress PRs | `depot_officer`, `feed_mill_officer` | Same model, `status=IN_PROGRESS` |
| `my_draft_shipments` | My Draft Port Shipments | `commercial_officer` | `ProductRequisition` where `requested_by=user`, `status=DRAFT`, `pr_type=PORT_CONSIGNMENT` |
| `my_submitted_shipments` | My Submitted Shipments | `commercial_officer` | Same model, `status=SUBMITTED` |
| `pending_fg_prs` | Pending FG Requisitions | `distribution_officer`, `distribution_manager` | `ProductRequisition` where `pr_type=FINISHED_GOODS`, `status=SUBMITTED` |
| `pending_tr_approvals` | Pending TR Approvals | `distribution_manager` | `TransportRequisition` where `tr_type=FG`, `status=PENDING_APPROVAL` |
| `my_active_trs` | My Active TRs | `distribution_officer` | `TransportRequisition` where `created_by=user`, `status__in=[PENDING_APPROVAL, APPROVED]` |
| `pending_port_shipments` | Port Shipments Awaiting TR | `procurement_officer` | `ProductRequisition` where `pr_type=PORT_CONSIGNMENT`, `status=SUBMITTED`, no TR created yet |
| `my_port_trs` | My Port TRs | `procurement_officer` | `TransportRequisition` where `created_by=user`, `tr_type=PORT_CONSIGNMENT` |
| `available_fg_trs` | FG TRs Available for Planning | `transport_planner` | `TransportRequisition` where `tr_type=FG`, `status=APPROVED` |
| `available_port_trs` | Port TRs Available for Planning | `transport_planner` | `TransportRequisition` where `tr_type=PORT_CONSIGNMENT`, `status=SUBMITTED` |
| `open_tos` | Open Transport Orders | `transport_planner`, `tdo_own_fleet`, `tdo_vendor_fleet` | `TransportOrder` where `status__in=[CREATED, ASSIGNED]` |
| `my_assigned_tos` | My Assigned TOs | `driver` | `TransportOrder` where `driver=user`, `status=ASSIGNED` |
| `tenant_summary` | Tenant Summary (all KPIs) | `tenant_admin` | Aggregate counts: users, PRs, TRs, TOs |

---

## Widget Design

Each widget is a **card** with:
- **Icon** (Bootstrap Icon)
- **Label** (e.g. "Pending FG Requisitions")
- **Count** (large number, highlighted)
- **Link** → the relevant admin list URL pre-filtered (e.g. `?status=SUBMITTED`)
- **Empty state**: if count = 0, show "All clear" with a muted style (not hidden)

Widgets are grouped into a **responsive grid** (3 columns on desktop, 1 on mobile) using Django admin's existing CSS variables for light/dark mode compatibility.

---

## Role → Widget Groups

```
depot_officer / feed_mill_officer
  ├── my_draft_prs          (Draft PRs)
  ├── my_submitted_prs      (Submitted PRs)
  └── my_inprogress_prs     (In-Progress PRs)

commercial_officer
  ├── my_draft_shipments    (Draft Port Shipments)
  └── my_submitted_shipments (Submitted Shipments)

distribution_officer
  ├── pending_fg_prs        (FG PR queue — view only)
  └── my_active_trs         (Own TRs)

distribution_manager
  ├── pending_fg_prs        (All submitted FG PRs)
  └── pending_tr_approvals  (Pending TR approvals)

procurement_officer
  ├── pending_port_shipments (Port Shipments needing a TR)
  └── my_port_trs           (Own Port Consignment TRs)

transport_planner
  ├── available_fg_trs      (FG TRs ready to plan)
  ├── available_port_trs    (Port TRs ready to plan)
  └── open_tos              (Open TOs)

tdo_own_fleet / tdo_vendor_fleet
  └── open_tos              (Open TOs — own queue)

driver
  └── my_assigned_tos       (My assigned TOs)

tenant_admin
  └── tenant_summary        (Full tenant KPI summary)
```

---

## Technical Implementation

### 1. Permission — `role_seed_data.py`
Add `PermissionCodes.MENU_DASHBOARD_VIEW` to every operational role. Update `portal_navigation.py` so the **Dashboard** menu item uses `permission_any: [MENU_DASHBOARD_VIEW, MENU_TENANT_ADMIN_DASHBOARD_VIEW]`.

### 2. Dashboard view — `apps/core/portal_views.py` (or `admin.py` override)
Override the Django admin index (`AdminSite.index`) or register a custom URL at `/admin/` that:
- Calls `has_permission(request)` — active staff, not platform tenant.
- Resolves the user's roles.
- Builds a `widgets` context list by checking role codes.
- Renders `templates/admin/dashboard.html`.

### 3. Template — `templates/admin/dashboard.html`
Extends `admin/base_site.html`. Renders widget cards in a CSS grid. Each widget is a partial include (`templates/admin/widgets/_card.html`).

### 4. Widget data helper — `apps/core/dashboard_service.py`
```python
def get_dashboard_widgets(user) -> list[dict]:
    """Return a list of widget dicts for the user's roles."""
    widgets = []
    roles = set(user.user_roles.values_list("role__role_code", flat=True))

    if roles & {"depot_officer", "feed_mill_officer"}:
        widgets += _fg_requester_widgets(user)
    if "commercial_officer" in roles:
        widgets += _commercial_widgets(user)
    if "distribution_officer" in roles:
        widgets += _distribution_officer_widgets(user)
    if "distribution_manager" in roles:
        widgets += _distribution_manager_widgets(user)
    if "procurement_officer" in roles:
        widgets += _procurement_widgets(user)
    if "transport_planner" in roles:
        widgets += _transport_planner_widgets(user)
    if roles & {"tdo_own_fleet", "tdo_vendor_fleet"}:
        widgets += _tdo_widgets(user)
    if "driver" in roles:
        widgets += _driver_widgets(user)
    if getattr(user, "is_tenant_admin", False):
        widgets += _tenant_admin_widgets()

    return widgets
```

Each private function returns a list of `{"id", "label", "icon", "count", "url", "color"}` dicts.

### 5. RBAC seed update
Add `MENU_DASHBOARD_VIEW` to:
- `depot_officer`, `feed_mill_officer`, `commercial_officer`
- `procurement_officer`, `distribution_officer`, `distribution_manager`
- `transport_planner`, `tdo_own_fleet`, `tdo_vendor_fleet`
- `driver`, `driver_helper`, `driver_supervisor`
- `gateman`, `scaling_operator`, `loading_personnel`, `unloading_personnel`
- `qc_inspector_physical`, `qa_lab_technician`
- `account_officer`

Roles with no specific widgets (e.g. `gateman`) see a minimal "Welcome" dashboard with no KPI cards.

---

## Out of Scope (Sprint 3)

- Charts / graphs (bar, line) — deferred to Reports sprint
- Real-time push updates (WebSocket) — Sprint 5+
- Notifications panel on dashboard — separate story
- Drill-down modals from widget cards — link to list view is sufficient
- Mobile-responsive layout polish — Sprint 4 mobile app story

---

## Definition of Done

- [ ] `MENU_DASHBOARD_VIEW` added to `PermissionCodes` and all operational roles in seed
- [ ] `seed_dfms_rbac` run; permission cache cleared for all tenants
- [ ] `portal_navigation.py` Dashboard item uses `MENU_DASHBOARD_VIEW` (all roles see it)
- [ ] `dashboard_service.py` implemented with all widget helper functions
- [ ] `admin/dashboard.html` template renders widget grid; light + dark mode tested
- [ ] Django admin root (`/admin/`) renders the custom dashboard for all non-platform staff
- [ ] Tenant Admin still has full Django admin index (unchanged behaviour)
- [ ] All widget counts verified correct against live DB
- [ ] No 403 for any active `is_staff` tenant user hitting `/admin/`
