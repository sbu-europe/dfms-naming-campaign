---
module: 02-master-data
specification: Loading & Unloading Points — POI Sub-Location Master
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-13
related_stories: DFS-063 (LUP-01)
jira_epic: DFS-074
prd_refs:
  - "§6.5.1 Point Of Interest (POI) Setup — operational sites for gate, command center, QC (Phase 1)"
  - "§6.12.2 Loading/Unloading Assignments — assign to specific loading or unloading point / line / bay (Phase 1)"
  - "§6.13.1 / §6.14.1 — timestamps against vehicle and TO in context of operational location (Phase 1)"
---

# Loading & Unloading Points — POI Sub-Location Master

## Overview

**Loading/Unloading Points** are master data entities representing physical sub-locations (bays, lines, docks) **within** a POI (depot, factory, mill, warehouse). They are the assignable targets used by Command Center (CC-01) for bay assignment and by Loading/Unloading personnel (LD-01) for event capture.

This is a **pure master data module** — it defines, configures, and maintains the points. Operational usage (queue management, bay assignment, loading events) lives in `06-poi-operations/command-center-loading-sprint4.md`.

**Module path**: `apps/master_data/` (extends existing master data app — child of POI)  
**Dependencies**: `apps/master_data/` (POI model from MDM-04)  
**Consumed by**: CC-01 (bay assignment), LD-01 (event capture), QC-01 (unloading point assignment on QC Pass)

---

## 1. Data Model

### 1.1 LoadingUnloadingPoint

```python
class OperationType(models.TextChoices):
    LOAD = "LOAD", "Loading"
    UNLOAD = "UNLOAD", "Unloading"


class LoadingUnloadingPoint(TenantAwareModel):
    """
    Physical bay/line/dock within a POI.
    
    Owned by exactly one POI. Short code is unique within a POI.
    Consumed by CC-01 for bay assignment and LD-01 for event capture.
    """

    poi = models.ForeignKey(
        "master_data.POI", on_delete=models.PROTECT,
        related_name="loading_unloading_points",
        verbose_name="POI",
    )

    # Identification
    name = models.CharField(max_length=100, verbose_name="Name / Label")
    short_code = models.CharField(
        max_length=20, verbose_name="Short Code",
        help_text="Unique within POI (e.g. BAY-01, LINE-A)",
    )

    # Type
    operation_type = models.CharField(
        max_length=10, choices=OperationType.choices,
        verbose_name="Operation Type",
    )

    # Status
    is_active = models.BooleanField(default=True)

    # Notes
    notes = models.TextField(blank=True, default="")

    # Audit
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT,
        related_name="created_loading_points",
    )

    class Meta:
        app_label = "master_data"
        db_table = "loading_unloading_points"
        ordering = ["poi", "short_code"]
        verbose_name = "Loading/Unloading Point"
        verbose_name_plural = "Loading/Unloading Points"
        constraints = [
            models.UniqueConstraint(
                fields=["poi", "short_code"],
                name="uq_poi_short_code",
            ),
        ]

    def __str__(self):
        return f"{self.short_code} — {self.name} ({self.poi.name})"
```

**Key constraints**:
- `(poi, short_code)` unique — short code must be unique within POI
- Only **active** POIs allow creation of new active points (`save_model` guard)
- Inactive points: not assignable for new queue rows in CC-01; historical assignments remain readable
- `on_delete=PROTECT` for POI FK — cannot delete POI with child points

---

## 2. Business Rules

### 2.1 Creation Rules

- POI must be **active** (`poi.is_active = True`) to create a new active point
- `short_code` required, alphanumeric + dash/underscore, max 20 chars
- `short_code` must be unique within the POI (DB-level constraint + admin validation)
- `name` required, max 100 chars
- `operation_type` required — one of `LOAD`, `UNLOAD` (each point is either loading-only or unloading-only)
- Within a POI, list ordering is by `short_code` (default model ordering)

### 2.2 Deactivation Rules

- Setting `is_active = False` hides the point from CC-01 assignment dropdowns
- Active assignments (BayAssignment with `assignment_status IN ('assigned', 'started')`) are **not cancelled** — they complete normally
- Historical assignments remain readable
- Cannot hard-delete a point that has associated assignments — soft-deactivate only

### 2.3 Referential Integrity

- CC-01 `BayAssignment` FKs to `LoadingUnloadingPoint` — assignment requires `is_active = True` at assignment time
- LD-01 `LoadEvent` / `UnloadEvent` FKs to `LoadingUnloadingPoint` — denormalized reference to where event occurred
- QC-01 `QCDecision` FKs to `LoadingUnloadingPoint` on QC Pass — QC Supervisor selects from active points

---

## 3. Django Admin Configuration

### 3.1 LoadTenantOnlyAdminMixiningUnloadingPointAdmin (standalone)

**Sub-task**: LUP-01-2

```python
@admin.register(LoadingUnloadingPoint)
class LoadingUnloadingPointAdmin(TenantOnlyAdminMixin, admin.ModelAdmin):
    # ...
```

**List View**:
- Columns: POI, Short Code, Name, Operation Type, Active, Created At
- Filters: `poi`, `operation_type`, `is_active`
- Search: `short_code`, `name`
- Actions: Bulk activate / bulk deactivate

**Detail View**:
- Fields: POI (FK dropdown), Name, Short Code, Operation Type, Is Active, Notes
- `save_model`:
  - Validates `short_code` unique within selected POI
  - Validates POI is active (if creating new active point)
  - Sets `created_by` on creation

**Permissions** (role-gated via `has_*_permission`):
- Tenant Admin, Master Data Manager: full CRUD
- CC Officer, Loading/Unloading Personnel, Transport Supervisor: read-only

### 3.2 LoadingUnloadingPointInline (under POIAdmin)

**Sub-task**: LUP-01-3

```python
class LoadingUnloadingPointInline(_TenantInlineMixin, admin.TabularInline):
    model = LoadingUnloadingPoint
    extra = 1
    fields = ("name", "short_code", "operation_type", "is_active", "notes")
```

- TabularInline on `POIAdmin` for quick point management from POI detail
- Extra: 1 (one empty form for quick add)
- Inherits `_TenantInlineMixin` permission pattern from existing inlines

---

## 4. API Endpoints

```http
POST   /api/v1/pois/{poi_id}/loading-unloading-points
       → Create L/U point under POI
       → Body: {name, short_code, operation_type, is_active, notes}
       → Validations: unique short_code per POI, POI must be active
       → Response: {id, name, short_code, operation_type, ...}

GET    /api/v1/pois/{poi_id}/loading-unloading-points?type=&is_active=
       → List points for a POI (filterable by operation type and active status)
       → Response: [
           {
             id,
             name: "North Loading Bay",
             short_code: "BAY-01",
             operation_type: "LOAD",
             is_active: true,
             notes: null
           }
         ]

GET    /api/v1/loading-unloading-points/{id}
       → Point detail
       → Response: {id, poi, name, short_code, operation_type, is_active, notes}

PATCH  /api/v1/loading-unloading-points/{id}
       → Update point (name, is_active, notes)
       → Body: {name, is_active, notes}
       → Note: short_code and operation_type are immutable after creation
```

**URL registration**: Routes registered in `apps/master_data/urls.py` under the global `/api/v1/` prefix, consistent with existing POI endpoints.

---

## 5. Permissions & RBAC

### 5.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
MasterData.LoadingUnloadingPoint.Write      # Create / update / deactivate
MasterData.LoadingUnloadingPoint.Read       # View list and detail
```

### 5.2 Role → Permission Mapping

| Role | Write | Read |
|------|:-----:|:----:|
| Tenant Admin | ✓ | ✓ |
| Master Data Manager | ✓ | ✓ |
| Command Center Officer | — | ✓ |
| Loading / Unloading Personnel | — | ✓ |
| Transport Supervisor | — | ✓ |
| QC Supervisor | — | ✓ |

### 5.3 Menu Permissions

```python
Menu.MasterData.LoadingUnloadingPoints.View
```

**Menu position**: Master Data → Loading/Unloading Points (alongside POIs, Products, Vehicles, etc.)

---

## 6. Validation Rules

| Rule | Enforcement |
|------|-------------|
| `name` required, max 100 chars | Model field + form |
| `short_code` required, max 20 chars, alphanumeric + dash/underscore | Model field + regex validator |
| `short_code` unique within POI | DB UniqueConstraint + `save_model` |
| `operation_type` required (LOAD / UNLOAD / BOTH) | Model choices |
| POI must be active for new active point | `save_model` guard |
| Cannot delete point with active assignments | Admin `has_delete_permission` guard → soft deactivate |
| Inactive points excluded from CC-01 assignment dropdowns | CC-01 queryset filter |
| Duplicate short_code returns clear error message | API validation response |
| Invalid/inactive POI returns clear error message | API validation response |

---

## 7. Audit Trail

Every create, update, and deactivate action is audit-logged:

| Action | Logged Fields |
|--------|---------------|
| Create | user, timestamp, POI, short_code, operation_type, all fields |
| Update | user, timestamp, changed fields (before/after) |
| Deactivate | user, timestamp, reason (if captured) |

Uses the same audit pattern as other master data entities (`apps.audit` integration).

---

## 8. Seed Data (Dev/Staging)

**Sub-task**: LUP-01-8

At least two POIs in UAT each have multiple L/U points:

| POI | Short Code | Name | Operation Type |
|-----|-----------|------|---------------|
| Feed Mill Alpha | BAY-01 | North Loading Bay | LOAD |
| Feed Mill Alpha | BAY-02 | South Loading Bay | LOAD |
| Feed Mill Alpha | DOCK-01 | RM Receiving Dock | UNLOAD |
| Depot Beta | BAY-A | Main Loading Line | LOAD |
| Depot Beta | BAY-B | Secondary Line | LOAD |
| Depot Beta | DOCK-A | Unloading Dock A | UNLOAD |

---

## 9. Sub-task Reference

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| LUP-01-1 | `LoadingUnloadingPoint` model + migration (FK to POI, name, short_code, operation_type enum, is_active, notes) | DFS-063-1 | Pending |
| LUP-01-2 | `LoadingUnloadingPointAdmin` — standalone with POI FK dropdown, `save_model` validates unique code per POI + active POI check | DFS-063-2 | Pending |
| LUP-01-3 | `LoadingUnloadingPointInline` — TabularInline under POIAdmin for quick point management | DFS-063-3 | Pending |
| LUP-01-4 | Create API (POST — create L/U point under a POI) | DFS-063-4 | Pending |
| LUP-01-5 | List-by-POI API (GET — list active points for a given POI) | DFS-063-5 | Pending |
| LUP-01-6 | Update API (PATCH — update point details, activate/deactivate) | DFS-063-6 | Pending |
| LUP-01-7 | Audit logging on create / update / deactivate | DFS-063-7 | Pending |
| LUP-01-8 | Seed data — at least two POIs with multiple L/U points for UAT | DFS-063-8 | Pending |

---

## 10. Dependencies

### Upstream
- `apps/master_data/` → POI model (MDM-04, Sprint 2)
- `apps/core/` → RBAC, TenantAwareModel, audit

### Downstream (consumers)
- `apps/operations/command_center/` → CC-01: bay assignment target (FK to LoadingUnloadingPoint)
- `apps/operations/loading/` → LD-01: load/unload event location (FK to LoadingUnloadingPoint)
- `apps/quality/checkpoint/` → QC-01: QC Supervisor assigns unloading point on QC Pass (FK to LoadingUnloadingPoint)

---

## 11. Definition of Done

- [ ] `LoadingUnloadingPoint` model created with migration passing `makemigrations --check`
- [ ] Each point is owned by exactly one POI; only active POIs allow new active points
- [ ] Point definition includes name, short code (unique per POI), operation type (LOAD or UNLOAD), active/inactive flag
- [ ] Inactive points are excluded from assignment dropdowns in CC-01; historical assignments remain readable
- [ ] Create/update/deactivate restricted to Tenant Admin and Master Data Manager roles
- [ ] Audit log records who/when/what on every create, update, and deactivate action
- [ ] `LoadingUnloadingPointAdmin` standalone list + detail working with POI filter
- [ ] `LoadingUnloadingPointInline` under POIAdmin renders correctly with add/edit
- [ ] List-by-POI API returns points filterable by operation type and active status
- [ ] Validation errors returned for duplicate short code within a POI and for inactive/invalid POI
- [ ] At least two POIs in UAT each have multiple L/U points; Command Center can retrieve the list
- [ ] Field dictionary documented and shared with frontend for CC-01/LD-01 integration

---

**Last Updated**: 2026-05-13  
**Related Modules**: [poi-management.md](poi-management.md) (parent entity), [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md) (consumer)
