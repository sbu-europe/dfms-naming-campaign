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
- `short_code` required, max 20 chars
- `(poi, short_code)` is unique in the database (enforced by `UniqueConstraint`)
- `name` required, max 100 chars
- `operation_type` required — one of `LOAD`, `UNLOAD` (each point is either loading-only or unloading-only)
- Within a POI, list ordering is by `short_code` (default model ordering)

### 2.2 Deactivation Rules

- Setting `is_active = False` marks the point inactive so downstream assignment/event flows should exclude it for new work
- Historical assignments remain readable when downstream systems store references to this point (integration wiring not implemented in this sprint)
- Hard delete behavior is not explicitly prevented at the admin layer in this sprint; deactivation is supported via `is_active` / bulk actions.

### 2.3 Referential Integrity

- Expected downstream consumers:
  - CC-01 `BayAssignment` (FK to `LoadingUnloadingPoint`)
  - LD-01 Load/Unload events (FK to `LoadingUnloadingPoint`)
  - QC-01 QC decisions (FK to `LoadingUnloadingPoint`)
  - Note: these consumer models/endpoints are not implemented in this sprint; this module currently delivers the master data definition and admin UI.

---

## 3. Django Admin Configuration

### 3.1 LoadingUnloadingPointAdmin (standalone)

**Sub-task**: LUP-01-2

```python
@admin.register(LoadingUnloadingPoint)
class LoadingUnloadingPointAdmin(TenantMasterDataAdmin):
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
  - Validates POI is active (if creating a new active point)
  - Sets `created_by` on creation

Note: uniqueness of `short_code` within the selected POI is enforced by the model-level DB constraint; it is not custom-validated in `save_model`.

**Permissions** (role-gated via `has_*_permission`):
- Tenant Admin, Master Data Manager: full CRUD
- CC Officer, Loading/Unloading Personnel, Transport Supervisor: read-only

### 3.2 LoadingUnloadingPointInline (under POIAdmin)

**Sub-task**: LUP-01-3

```python
class LoadingUnloadingPointInline(_LUPInlineMixin, admin.TabularInline):
    model = LoadingUnloadingPoint
    extra = 1
    fields = ("name", "short_code", "operation_type", "is_active", "notes")
```

- TabularInline on `POIAdmin` for quick point management from POI detail
- Extra: 1 (one empty form for quick add)
- Inherits the permission gates from the `POIAdmin` inline mixin pattern

---

## 4. API Endpoints

```http
POST   /api/v1/pois/{poi_id}/loading-unloading-points
GET    /api/v1/pois/{poi_id}/loading-unloading-points
GET    /api/v1/loading-unloading-points/{id}
PATCH  /api/v1/loading-unloading-points/{id}
```

**Status (Sprint 4)**: Not implemented in this codebase yet.
In this sprint the module delivers Django admin UI and the `LoadingUnloadingPoint` model/migration; the DRF routes/viewsets for the API contract are not registered under `apps/master_data/urls.py`.

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
Menu.MasterData.LoadingUnloadingP### AC-4: API contract for downstream stories
- [ ] List endpoints (by POI id) used by Command Center assignment UI and loading personnel "my bay" views
- [ ] Validations return clear errors for duplicate code or invalid POIoints.View
```

**Menu position**: Master Data → Loading/Unloading Points (alongside POIs, Products, Vehicles, etc.)

---

## 6. Validation Rules

| Rule | Enforcement |
|------|-------------|
| `name` required, max 100 chars | Model field + form |
| `short_code` required, max 20 chars | Model field (no regex validator in this sprint) + DB uniqueness |
| `(poi, short_code)` unique | DB `UniqueConstraint` (enforced at persistence time) |
| `operation_type` required (LOAD / UNLOAD) | Model choices |
| POI must be active for new active point | `LoadingUnloadingPointAdmin.save_model` guard |
| Deactivation supported via `is_active` | Admin `is_active` toggle / bulk actions |

---

## 7. Audit Trail

This module stores standard model audit fields:
- `created_by` (set on create via Django admin)
- `created_at` / `updated_at`

In this sprint, detailed CRUD audit logging through `apps.audit.services.log_crud_*` is not implemented for `LoadingUnloadingPoint` (no calls found in the admin/view code).

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
| LUP-01-1 | `LoadingUnloadingPoint` model + migration (FK to POI, name, short_code, operation_type enum, is_active, notes) | DFS-063-1 | Done |
| LUP-01-2 | `LoadingUnloadingPointAdmin` — standalone with POI FK dropdown; `save_model` enforces active-POI for new active points (uniqueness is DB-enforced) | DFS-063-2 | Partial |
| LUP-01-3 | `LoadingUnloadingPointInline` — TabularInline under POIAdmin for quick point management | DFS-063-3 | Done |
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

- [x] `LoadingUnloadingPoint` model created with migration passing `makemigrations --check`
- [x] Each point is owned by exactly one POI; only active POIs allow new active points
- [x] Point definition includes name, short code (unique per POI), operation type (LOAD or UNLOAD), active/inactive flag
- [ ] Inactive points are excluded from assignment dropdowns in CC-01; historical assignments remain readable
- [x] Create/update/deactivate restricted to Tenant Admin and Master Data Manager roles
- [ ] Audit log records who/when/what on every create, update, and deactivate action
- [x] `LoadingUnloadingPointAdmin` standalone list + detail working with POI filter
- [x] `LoadingUnloadingPointInline` under POIAdmin renders correctly with add/edit
- [ ] List-by-POI API returns points filterable by operation type and active status
- [ ] Validation errors returned for duplicate short code within a POI and for inactive/invalid POI (via API contract)
- [ ] At least two POIs in UAT each have multiple L/U points; Command Center can retrieve the list
- [ ] Field dictionary documented and shared with frontend for CC-01/LD-01 integration

---

**Last Updated**: 2026-05-15  
**Related Modules**: [poi-management.md](poi-management.md) (parent entity), [command-center-loading-sprint4.md](../06-poi-operations/command-center-loading-sprint4.md) (consumer)
