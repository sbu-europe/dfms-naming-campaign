---
module: 01-core
specification: Role-Scoped Dashboard KPI Widgets (DB-01 extension)
version: 1.0
phase: Phase 1
sprint: Sprint 5
last_updated: 2026-09-22
changelog: "v1.1 — TUM-06: widgets follow working role only (no union)."
related_stories: DB-01, TUM-06
depends_on: YARD-01, GT-01, SC-01, CC-01, LD-01, QC-01, DS-01
enables: Operational landing UX, GPS-01 (complementary — map dashboard is separate)
---

# Role-Scoped Dashboard KPI Widgets (DB-01 Extension)

## Overview

Extend the **admin home dashboard** (`GET /admin/`) with role-specific KPI widget cards for operational users who currently see an empty “Use the menu on the left” welcome state.

**Module path**: `apps/core/dashboard_service.py` (primary), `config/admin.py` (context injection), `templates/admin/index.html` (rendering)

**Out of scope for this spec** (separate deliverables):

| Item | Spec / module |
|------|----------------|
| Map-based GPS transport dashboard | GPS-01 (`/dashboard/`, `/api/v1/maps/dashboard`) |
| Tenant Admin org-wide KPI dashboard | Already implemented (`get_tenant_stats`) |
| Platform Super Admin dashboard | Already implemented (`get_platform_stats`) |
| QA Lab Technician, Driver Helper, Account Officer widgets | Explicitly excluded — menu-only landing |
| Removing `Menu.Dashboard.View` from excluded roles | Optional follow-up; not required for v1 |

### Problem statement

21 seeded operational roles have `Menu.Dashboard.View`. Nine role groups already receive KPI widgets via `get_role_widgets()`. **Eight roles** still land on an empty dashboard despite having daily work queues in POI-scoped or fleet admin screens. Operators must discover work through the sidebar instead of at login.

### Success criteria

1. Each in-scope role sees **actionable KPI cards** on `/admin/` with counts deep-linked to the correct pre-filtered admin list.
2. **POI-scoped operators** see counts **only for their assigned working POI** — never tenant-wide leakage.
3. **Unscoped supervisors** (Gate Supervisor) see tenant-wide aggregates.
4. **Fail-closed**: user with POI-scoped role but no `UserOperationalPOI` assignment → all widgets show `0` (or empty-state icon), plus a visible POI assignment warning.
5. Widget queries reuse the **same filter semantics** as the corresponding `YardAdminBase` admin `get_queryset()` — no divergent business rules.
6. Dashboard render never breaks admin index (existing try/except pattern preserved).

---

## 0. Menu & landing behaviour

```
Sidebar → Overview → Dashboard  (/admin/)
                              │
                              ├─ Tenant Admin     → org KPI cards (existing)
                              ├─ Super Admin      → platform KPI cards (existing)
                              ├─ 9 role groups    → role widgets (existing)
                              └─ 8 roles (this)   → POI/fleet-scoped widgets (new)
```

### Role scope matrix

| Role | Dashboard access | Widget scope | In v1? |
|------|:----------------:|--------------|:------:|
| Command Center Officer | `Menu.Dashboard.View` | **POI-scoped** | ✓ |
| Gateman | `Menu.Dashboard.View` | **POI-scoped** | ✓ |
| Gate Supervisor | `Menu.Dashboard.View` | **Tenant-wide** | ✓ |
| Scaling Operator | `Menu.Dashboard.View` | **POI-scoped** | ✓ |
| Loading Personnel | `Menu.Dashboard.View` | **POI-scoped** + SOURCE leg | ✓ |
| Unloading Personnel | `Menu.Dashboard.View` | **POI-scoped** + DESTINATION leg | ✓ |
| QC Inspector – Physical | `Menu.Dashboard.View` | **POI-scoped** + DESTINATION leg (RM) | ✓ |
| Driver Supervisor | `Menu.Dashboard.View` | **Tenant-wide** (fleet) | ✓ |
| QA Lab Technician | `Menu.Dashboard.View` | None (empty welcome) | ✗ |
| Driver Helper | `Menu.Dashboard.View` | None (empty welcome) | ✗ |
| Account Officer | `Menu.Dashboard.View` | None (empty welcome) | ✗ |

**POI-scoped role catalog** (authoritative): `apps/users/yard_constants.POI_SCOPED_ROLE_CODES`

**Unscoped yard roles**: `gate_supervisor`, `tenant_admin` (`YARD_UNSCOPED_ROLE_CODES`)

---

## 1. Architecture

### 1.1 Current flow

```
config/admin.py::patched_index
  └─ get_role_widgets(request.user)     # no request, no POI context today
       └─ templates/admin/index.html   # renders role_widgets grid
```

### 1.2 Target flow

```
config/admin.py::patched_index
  └─ get_role_widgets(request.user, request=request)
       ├─ resolve_role_codes(user)
       ├─ resolve_dashboard_scope(user, request)   # new: POI | tenant-wide | none
       ├─ per-role widget builders (8 new + 9 existing unchanged)
       └─ return list[WidgetDict] + optional scope_meta

templates/admin/index.html
  └─ render widgets + optional "Working at: {POI name}" banner
```

### 1.3 Widget dict contract (unchanged)

```python
{
    "id": str,           # stable identifier
    "label": str,        # display label
    "icon": str,         # Bootstrap Icon (without bi- prefix)
    "count": int,        # KPI value
    "url": str,          # deep-link to pre-filtered admin changelist
    "color": str,        # primary | success | warning | danger | info | muted
    "urgency": bool,     # highlight card when count > 0
}
```

### 1.4 New shared infrastructure

| Component | Path | Responsibility |
|-----------|------|----------------|
| `DashboardScope` | `apps/core/dashboard_scope.py` (new) | Dataclass: `mode` (`poi` \| `tenant`), `poi_id`, `poi_name`, `role_code`, `yard_leg` hint |
| `resolve_dashboard_scope(user, request)` | same | Mirrors `YardAdminBase._scope_poi_id` + unscoped role detection |
| `scope_qs(qs, scope, *, yard_poi_lookup)` | same | Apply POI filter or pass-through for tenant-wide |
| Per-domain query helpers | `apps/core/dashboard_queries/` (new package, optional) | Thin count functions per module — keeps `dashboard_service.py` readable |

**Design rule**: widget count functions MUST call the same queryset helpers used by admin (extract shared filters where duplication would drift). Prefer importing existing admin queryset utilities over re-implementing filters inline.

### 1.5 POI resolution (must match YARD-01)

Resolution order (`apps/operations/yard_poi.py`):

1. Session `dfms_active_poi_id` or `?active_poi=<uuid>` (validated against user's assignments)
2. Primary `UserOperationalPOI` for the operator role

**Fail-closed**: POI-scoped role + `poi_id is None` → return `[]` widgets with `scope_meta.warning = NO_POI_MESSAGE` (reuse `YardAdminBase.NO_POI_MESSAGE`).

---

## 2. Widget catalog

### 2.1 Command Center Officer — POI-scoped

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `cc_waiting_queue` | Vehicles Waiting in Queue | `QueueEntry` at POI, `status=waiting` | `/admin/operations/queueentry/?status__exact=waiting` (+ POI filter param if supported) |
| `cc_awaiting_bay` | Awaiting Bay Assignment | Waiting entries without active `BayAssignment` | CC queue filtered |
| `cc_qc_blocked` | Awaiting QC Clearance | Waiting + `requires_qc=True` + `qc_passed` is null | CC queue filtered |
| `cc_assigned_today` | Bay Assignments Today | `BayAssignment` at POI, `created_at__date=today` | `/admin/operations/bayassignment/` |
| `cc_active_trips_at_poi` | Active Trips at Site | `Trip` with active `GateVisitSession` at POI | `/admin/transport/trip/` |

**Leg policy**: use `yard_leg_for_queue_entry()` where leg-specific CC work applies.

---

### 2.2 Gateman — POI-scoped

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `gate_active_visits` | Active Gate Visits | `GateVisitSession` `status=active`, `poi_id=scope` | `/admin/operations/gatevisitsession/` |
| `gate_awaiting_in` | Awaiting Gate-In | Lane-eligible TOs without active visit at gate POI | Gate In add / eligible TO list |
| `gate_awaiting_out` | Awaiting Gate-Out | Active visits passing `compute_clearance` for gate-out | Gate Out list |
| `gate_ondemand_today` | On-Demand TOs Today | `GateActivityLog` `action=on_demand_to_created`, today, at POI | Activity log |

**Reference admin**: `apps/operations/gate/admin.py` — `GateAdminBase._scope_poi_id`, `gate_eligible_transport_orders_queryset(gate_poi_id=…)`.

---

### 2.3 Gate Supervisor — tenant-wide

All Gateman widgets **without POI filter**, plus:

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `gate_sv_awaiting_scale_in` | Awaiting Scale-In (all sites) | Visits at POI pending scale-in (aggregate) | Scaling / visits |
| `gate_sv_in_yard` | Vehicles in Yard | Active visits not gate-out complete | Visit sessions |
| `gate_sv_qc_holds` | QC Holds in Yard | Entries in `awaiting_qc` / `qc_in_progress` | Gate entries / visits |

**Note**: Gate Supervisor is in `YARD_UNSCOPED_ROLE_CODES` — never filter to a single POI unless user explicitly selects one (future: POI picker).

---

### 2.4 Scaling Operator — POI-scoped

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `scale_awaiting_in` | Awaiting Scale-In | Active visits at POI eligible for scale-in (`_eligible_sessions_qs`) | `/admin/operations/scalein/add/` |
| `scale_awaiting_out` | Awaiting Scale-Out | Sessions at POI with scale-in done, scale-out pending | `/admin/operations/scaleout/add/` |
| `scale_open_tokens` | Open Queue Tokens | `QueueToken` `status ∈ {waiting, assigned}`, POI | `/admin/operations/queuetoken/` |
| `scale_tokens_today` | Tokens Issued Today | `QueueToken` created today at POI | Queue tokens list |

**Reference admin**: `apps/operations/scaling/admin.py` — `_eligible_sessions_qs(poi_id)`, `yard_poi_lookup = "weighing_session__poi_id"`.

---

### 2.5 Loading Personnel — POI-scoped + SOURCE leg

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `load_in_progress` | Loads In Progress | `LoadEvent` open (`end_datetime` null), source leg at POI | `/admin/operations/loadevent/` |
| `load_bays_assigned` | Bays Assigned (Awaiting Start) | `BayAssignment` at POI, source leg, no completed load | Bay assignments |
| `load_completed_today` | Completed Loads Today | `LoadEvent` ended today, source leg at POI | Load events |
| `load_open_tos` | Open TOs at My Site | TOs with active source visit + loading-eligible sub-state | Transport orders |

**Filters** (must match `LoadEventAdmin`):

- `queue_entry__queue_token__weighing_session__yard_leg = YardLeg.SOURCE`
- `flow_lane = fg_outbound` (via TO join)

---

### 2.6 Unloading Personnel — POI-scoped + DESTINATION leg

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `unload_in_progress` | Unloads In Progress | `UnloadEvent` open, destination leg at POI | `/admin/operations/unloadevent/` |
| `unload_bays_assigned` | Bays Awaiting Unload | Bay assigned, destination leg, no unload event | Bay assignments |
| `unload_completed_today` | Completed Unloads Today | `UnloadEvent` ended today at destination POI | Unload events |
| `unload_qc_blocked` | RM Awaiting QC Clearance | `QueueEntry` waiting + QC blocked, destination POI | CC queue |

**Filters** (must match `UnloadEventAdmin`):

- `yard_leg = DESTINATION`
- `flow_lane ∈ {fg_inbound, rm_inbound}`

---

### 2.7 QC Inspector – Physical — POI-scoped + DESTINATION leg

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `qc_no_decision` | QC Queue (No Decision) | `QCCheckpointSample` on TOs at destination POI without active `QCCheckpointDecision` | `/admin/quality/qccheckpointsample/` |
| `qc_awaiting_inspection` | Awaiting Physical Inspection | Visits/entries `status=awaiting_qc` at POI | QC checkpoint queue |
| `qc_in_progress` | QC In Progress | `status=qc_in_progress` at POI | QC queue |
| `qc_failed_reinspect` | QC Failed (Re-inspect) | `status=qc_failed` at POI | QC queue filtered |
| `qc_cc_blocked` | CC Queue Blocked on QC | `QueueEntry` waiting + QC not passed at POI | CC queue |

**Reference admin**: `apps/quality/checkpoint/admin.py` — `_scope_poi_id`.

---

### 2.8 Driver Supervisor — tenant-wide

| Widget ID | Label | Query | Deep link |
|-----------|-------|-------|-----------|
| `ds_pending_dispatch` | Pending Pre-Dispatch Inspections | `VehicleInspection` `purpose=pre_dispatch`, `status=pending` | `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/` |
| `ds_pending_maintenance` | Maintenance Clearance Pending | `purpose=maintenance_clearance`, `status=pending` | Inspection queue |
| `ds_rejected` | Rejected Inspections | `status=rejected` | Inspection history |
| `ds_on_leave_today` | Drivers on Leave Today | `DriverLeave` covering today, not cancelled | `/admin/fleet_supervisor/driverleave/` |
| `ds_no_attendance_today` | No Attendance Today | Active drivers minus `DriverAttendance` for today | Attendance admin |
| `ds_open_tos` | Open TOs Awaiting Assignment | `TransportOrder` `status=created` | `/admin/transport/transportorder/` |

**Note**: Driver Supervisor is **not** in `POI_SCOPED_ROLE_CODES`. v1 is tenant-wide. Optional v2: filter attendance widgets by supervisor's depot POI if `UserOperationalPOI` is added for this role.

---

## 3. Multi-role users (TUM-06)

A user may hold multiple **assigned** operational roles. The dashboard uses the **working role** only (Select Role / session `dfms_working_role_code`) — **no widget union**, no merge, no “cap at 8”.

`get_role_widgets` / `resolve_dashboard_scope` must resolve the same working role as `get_primary_role_code`. Single-role users are unchanged (Select Role hidden).

See [multi-role-assignment-implementation-plan.md](../03-users/multi-role-assignment-implementation-plan.md).

---

## 4. UI requirements

### 4.1 Widget grid (existing)

Reuse `dfms-stat-grid` / `dfms-stat-card` in `templates/admin/index.html`. No new CSS required.

### 4.2 POI context banner (new)

When `scope_meta.mode == "poi"` and `poi_name` is set, show below page header:

```
Working at: Dhaka Depot — Gate 1
```

When `scope_meta.warning` is set (no POI assigned):

```
⚠ Your account has no site assigned for this role. Contact your Tenant Admin.
```

Style: reuse existing warning banner patterns from `custom.css` / gate admin messages.

### 4.3 Page title

Keep existing behaviour: operational users see **“Welcome”** (not “Dashboard”). Tenant Admin sees **“Dashboard”**.

---

## 5. Implementation plan

### Phase 1 — Foundation

| Task | Files |
|------|-------|
| Add `DashboardScope` + `resolve_dashboard_scope()` | `apps/core/dashboard_scope.py` |
| Pass `request` into `get_role_widgets()` | `config/admin.py`, `dashboard_service.py` |
| Add `scope_meta` to admin context | `config/admin.py`, `templates/admin/index.html` |

### Phase 2 — Yard operators

| Task | Role widgets |
|------|--------------|
| Extract shared POI count helpers from gate/scaling/CC admin querysets | Gateman, Gate Supervisor |
| Implement CC + Scaling widgets | CC Officer, Scaling Operator |
| Implement Loading + Unloading widgets (leg-aware) | Loading/Unloading Personnel |
| Implement QC widgets | QC Inspector |

### Phase 3 — Fleet

| Task | Role widgets |
|------|--------------|
| Driver Supervisor widget builder | Driver Supervisor |

### Phase 4 — Hardening

| Task | Notes |
|------|-------|
| Performance: ensure ≤ 8 COUNT queries per dashboard load | Count queries only; no instance iteration |
| Per-widget error isolation | Catch per-widget failures; return `count=0`; log warning — do not break page |
| Document widget IDs in this spec | Stable identifiers for widget dict `id` fields |

---

## 6. Performance & reliability

| Constraint | Approach |
|------------|----------|
| Max queries per dashboard | ≤ 8 COUNT queries (one per widget); acceptable for admin home |
| Query failure on one widget | Catch per-widget; return `count=0` for that card; log warning — do not break page |
| Caching | None in v1 (counts must be fresh enough for operational use) |
| N+1 | Count queries only — no instance iteration |

---

## 7. Security

| Risk | Mitigation |
|------|------------|
| POI data leakage via widgets | Reuse `resolve_dashboard_scope()` fail-closed; never count tenant-wide for POI-scoped roles |
| Deep-link URL bypass | Admin changelists already enforce `YardAdminBase.get_queryset()` — widgets are navigation hints only |
| Cross-tenant | `TenantOnlyAdminMixin` / tenant schema — unchanged |

---

## 8. Dependencies & prerequisites

| Prerequisite | Status (Jun 2026) | Blocking? |
|--------------|-------------------|-----------|
| `UserOperationalPOI` model | Shipped (`apps/users/models.py`) | Yes for POI roles |
| `yard_poi.py` resolution | Shipped | Yes |
| `YardAdminBase` | Shipped (`apps/operations/admin_base.py`) | Yes — filter parity |
| Gate admin (GT-01) | Shipped | Yes for gate widgets |
| Scaling admin (SC-01) | Shipped | Yes for scaling widgets |
| CC admin (CC-01) | Shipped | Yes for CC widgets |
| Loading/Unloading admin (LD-01) | Shipped | Yes |
| QC Checkpoint admin (QC-01) | Shipped | Yes |
| Fleet Supervisor admin (DS-01) | Shipped | Yes for driver supervisor |

---

## 9. Acceptance criteria

- [ ] **AC-1**: Command Center Officer at POI A sees queue counts for POI A only; POI B data excluded.
- [ ] **AC-2**: Gateman without `UserOperationalPOI` sees warning banner and zero-count widgets (not tenant data).
- [ ] **AC-3**: Gate Supervisor sees aggregated counts across all tenant POIs.
- [ ] **AC-4**: Loading Personnel widgets count only SOURCE-leg FG outbound work at assigned POI.
- [ ] **AC-5**: Unloading Personnel widgets count only DESTINATION-leg inbound work at assigned POI.
- [ ] **AC-6**: QC Inspector widgets reflect destination POI RM inbound QC queue only.
- [ ] **AC-7**: Driver Supervisor sees fleet inspection and attendance KPIs tenant-wide.
- [ ] **AC-8**: QA Lab Technician, Driver Helper, Account Officer unchanged (empty welcome).
- [ ] **AC-9**: Each widget card links to a pre-filtered admin view showing the counted records.
- [ ] **AC-10**: Admin index render succeeds when any underlying app module raises (graceful degradation).
- [ ] **AC-11**: Existing 9 role-group widgets behaviour unchanged.

---

## 10. Out of scope / future work

| Item | Notes |
|------|-------|
| GPS map dashboard (GPS-01) | Complementary; TP/TDO/Tenant Admin |
| POI picker on dashboard for supervisors | Session `dfms_active_poi_id` already supported in `yard_poi.py` |
| Depot Officer PR widgets filtered by assigned POI | Separate story — currently `requested_by=user` only |
| Real-time WebSocket refresh | v1 is page-load counts only |
| REST API for widgets | Admin SSR only in Phase 1 |
| Remove dashboard menu from excluded roles | Product decision |

---

## 11. File change summary

| File | Change |
|------|--------|
| `apps/core/dashboard_scope.py` | **New** — scope resolution |
| `apps/core/dashboard_service.py` | Extend `get_role_widgets(user, request=None)`; add 8 widget builders |
| `apps/core/dashboard_queries/` | **New** (optional) — shared count functions |
| `config/admin.py` | Pass `request` to `get_role_widgets`; inject `dashboard_scope_meta` |
| `templates/admin/index.html` | POI banner + warning message |

---

## 12. Related documents

- `docs/poi-scoped-operational-roles.md` — YARD-01 architecture
- `apps/core/dashboard_service.py` — DB-01 existing implementation
- `DFMS-product-context/05-modules/06-poi-operations/gate-operations-sprint4.md`
- `DFMS-product-context/05-modules/06-poi-operations/scaling-operations-sprint4.md`
- `DFMS-product-context/03-backlog/phase-1/sprints/sprint-5/12-gps-maps-dashboard/` — GPS dashboard (separate)

---

## 13. Story breakdown

| Story | Title |
|-------|-------|
| DB-01-1 | Dashboard scope resolution + POI banner |
| DB-01-2 | Gateman + Gate Supervisor widgets |
| DB-01-3 | Scaling Operator widgets |
| DB-01-4 | Command Center Officer widgets |
| DB-01-5 | Loading + Unloading Personnel widgets |
| DB-01-6 | QC Inspector widgets |
| DB-01-7 | Driver Supervisor widgets |
| DB-01-8 | Performance pass + per-widget error isolation |
