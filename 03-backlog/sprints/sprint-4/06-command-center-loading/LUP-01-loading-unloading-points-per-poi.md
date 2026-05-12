---
jira_key: DFS-063
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: LUP-01
title: Loading & Unloading Points — Create & Maintain per POI
epic: Command Center
status: Pending
story_points: 5
assignee: ~
prd_refs:
  - "§6.5.1 Point Of Interest (POI) Setup — operational sites for gate, command center, QC (Phase 1)"
  - "§6.12.2 Loading/Unloading Assignments — assign to specific loading or unloading point / line / bay (Phase 1)"
  - "§6.13.1 / §6.14.1 — timestamps against vehicle and TO in context of operational location (Phase 1)"
---

# LUP-01 — Loading & Unloading Points (per POI)

## User Story

**As a** Tenant Admin (or authorised master-data role)  
**I want to** create and maintain **loading** and **unloading** points against each **POI**  
**So that** Command Center can assign vehicles to real bays/lines and load/unload logs are tied to an unambiguous physical location

## Business Context

PRD scope states Command Center assigns vehicles to **loading/unloading points** with full timestamp tracking. A **POI** is the depot/factory/mill; **L/U points** are the sub-locations (bay, line, dock ID) inside that site. This story is the **master definition** of those points; CC-01 consumes them for assignment; LD-01 records events **at** the assigned point.

**§6.12.3** push alerts remain out of Sprint 4; visibility is in-app only.

## Acceptance Criteria

### AC-1: Parent POI
- [ ] Each L/U point is **owned by exactly one POI** (tenant-scoped FK)
- [ ] Only **Active** POIs (per §6.5.1) allow creation of new active points
- [ ] POI detail (or linked screen) lists all L/U points for that site

### AC-2: Point definition
- [ ] User creates a point with: **name/label** (required), **short code** (unique per POI), **operation type** = `LOAD` | `UNLOAD` | `BOTH` (default per org policy or required explicit choice)
- [ ] Optional: display order, optional notes, **active/inactive** flag
- [ ] Inactive points: not assignable for **new** queue rows; historical assignments remain readable

### AC-3: RBAC & audit
- [ ] Create/update/deactivate is restricted to roles aligned with **master data** / **Tenant Admin** (same class as POI management per §6.3.1)
- [ ] Audit: who/when/what changed on each point

### AC-4: API contract for downstream stories
- [ ] List endpoints (by POI id) used by Command Center assignment UI and loading personnel "my bay" views
- [ ] Validations return clear errors for duplicate code or invalid POI

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| LUP-01-1 | LoadingUnloadingPoint model + migration (FK to POI, name, short_code, operation_type enum, is_active, display_order, notes) | DFS-063-1 | Pending |
| LUP-01-2 | LoadingUnloadingPointAdmin — list view with POI filter + operation type filter, standalone with POI FK dropdown, save_model validates unique code per POI + active POI check | DFS-063-2 | Pending |
| LUP-01-3 | LoadingUnloadingPointInline — TabularInline under POIAdmin for quick point management from POI detail | DFS-063-3 | Pending |
| LUP-01-4 | Create API (POST — create L/U point under a POI) | DFS-063-4 | Pending |
| LUP-01-5 | List-by-POI API (GET — list active points for a given POI, consumed by CC-01 and LD-01) | DFS-063-5 | Pending |
| LUP-01-6 | Update API (PATCH — update point details, activate/deactivate) | DFS-063-6 | Pending |
| LUP-01-7 | Audit logging on create / update / deactivate (who, when, what changed) | DFS-063-7 | Pending |
| LUP-01-8 | Seed data — at least two POIs with multiple L/U points for UAT | DFS-063-8 | Pending |

## API Endpoints

```
POST   /api/v1/pois/{poi_id}/loading-unloading-points                    # Create L/U point under POI
GET    /api/v1/pois/{poi_id}/loading-unloading-points?type=&is_active=   # List points by POI (filterable)
GET    /api/v1/loading-unloading-points/{id}                             # Point detail
PATCH  /api/v1/loading-unloading-points/{id}                             # Update point (name, status, etc.)
```

## Access & Permissions

| Action | Role |
|--------|------|
| Create / update / deactivate L/U point | Tenant Admin, Master Data Manager |
| View L/U points (list by POI) | Command Center Officer, Loading / Unloading Personnel, Transport Supervisor |

## Dependencies

- **Requires**: Active **POI** master (Sprint 2 **MDM-04** or equivalent implementation).  
- **Blocks**: CC-01 (named assignable targets), LD-01 (point-attributed events).

## Definition of Done

- [ ] LoadingUnloadingPoint model created with migration passing `makemigrations --check`
- [ ] Each point is owned by exactly one POI; only active POIs allow new active points (AC-1)
- [ ] Point definition includes name, short code (unique per POI), operation type (LOAD/UNLOAD/BOTH), active/inactive flag (AC-2)
- [ ] Inactive points are excluded from assignment dropdowns in CC-01; historical assignments remain readable
- [ ] Create/update/deactivate restricted to Tenant Admin and Master Data Manager roles (AC-3)
- [ ] Audit log records who/when/what on every create, update, and deactivate action (AC-3)
- [ ] List-by-POI API returns points filterable by operation type and active status (AC-4)
- [ ] Validation errors returned for duplicate short code within a POI and for inactive/invalid POI (AC-4)
- [ ] At least two POIs in UAT each have multiple L/U points; Command Center can retrieve the list
- [ ] Field dictionary documented and shared with frontend for CC-01/LD-01 integration
