---
jira_key: DFS-078
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-02
title: POI Geofencing Boundary Management — Tenant Admin Configuration
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 1
assignee: ~
prd_refs:
  - "§6.5.7 POI Geofencing Boundary Management"
phase: Phase 1
---

# GPS-02 — POI Geofencing Boundary Management

## User Story

**As a** Tenant Admin
**I want to** define and manage geofence boundaries (radius in meters) for each Point of Interest (POI) — depots, feed mills, and port berths — from within the POI master data admin
**So that** vehicle arrival and departure events are detected automatically, and I can tune boundaries per facility without involving the development team.

**As a** Tenant Admin
**I want to** also configure a dwell time threshold per POI
**So that** the system can flag vehicles that stay too long at a loading or unloading point, allowing supervisors to intervene before an operational delay cascades.

---

## Business Context

### Why geofence configuration matters

DFMS moves goods across multiple facilities — a coastal port berth (where unloading takes 4–6 hours and the geofence radius needs to be tight to distinguish berths), a large feed mill compound (where the truck queue stretches well outside the gates), and a smaller depot. A single fixed boundary radius cannot serve all three.

PRD §6.5.7 assigns geofence configuration to the **Tenant Admin** — the role responsible for all master data and configuration within the tenant. This story gives that admin the configuration surface. Without it:
- GPS-03 (geofence engine) has no radius to evaluate against → no arrival/departure events are fired.
- GPS-04 (dwell tracking) has no threshold to flag → no exception alerts.
- GPS-05 (maps dashboard) cannot display geofence zone circles → the map is bare POI markers only.

### How geofence config flows operationally

1. Tenant Admin opens **POI master data** → selects a POI → sets **Geofence Radius (m)** and **Dwell Time Threshold (minutes)**.
2. GPS-03 engine reads the current radius **at evaluation time** (not cached at trip start) — so changes take effect for live trips immediately.
3. GPS-04 reads the configured threshold to flag in-progress and completed stays that exceed the limit.
4. Historical `GeofenceEvent` records are **never deleted** when a radius is removed — the boundary change is audited and the historical events remain.

### Governance rationale

Geofence radius changes affect real-time event detection. A misconfigured radius (e.g., too large at a port) could suppress ARRIVAL events for vehicles that never actually entered the facility. Therefore:
- **Only Tenant Admin** and platform configuration roles can modify geofences — operational users (gate staff, transport planners) see the radius as read-only context.
- Every change is audit-logged (who, when, old → new radius) — PRD §6.2.7 and §10.3 mandate immutable audit trails for all configuration mutations.
- Geofence deletion requires **explicit confirmation** to prevent accidental removal.

---

## Acceptance Criteria

### AC-1 — Radius-based geofence definition

- Tenant Admin defines/edits a geofence **radius in meters** per POI from POI master data admin; validation enforces a sane range (min/max agreed with PO).
- Geofence is linked to the POI master record — **one active geofence per POI** at a time.

### AC-2 — Immediate effect

- Radius changes take effect **immediately for live trips** — the engine (GPS-03) reads the current radius at evaluation time; no restart, cache flush, or trip re-creation needed. Verified by changing a radius while a (mock) vehicle is near the boundary.

### AC-3 — Governance

- Only Tenant Admin / authorized configuration roles can create, modify, or remove a geofence; other roles see read-only values.
- Every change audit-logged: who, when, POI, old → new radius.
- Geofence **deletion (radius removal) requires explicit confirmation** and writes an audit entry; deletion stops new event detection but never deletes historical `GeofenceEvent` records.

### AC-4 — Dwell threshold configuration

- Configurable **dwell time threshold** per POI plus a tenant-level default; same RBAC and audit rules as the radius. Consumed by GPS-04 exception flagging.

---

## API Endpoints

Geofence configuration lives on the POI resource. No standalone geofence object: the radius and threshold are fields on the POI master record, with a dedicated PATCH surface for admin mutation and change audit.

```
# Read (accessible to authorized roles — see Access & Permissions below)
GET    /api/v1/pois/{poi_id}/                           # POI detail incl. geofence_radius_m and dwell_threshold_minutes
GET    /api/v1/pois/                                    # POI list incl. geofence radius (GPS-05 reads this for map circles)

# Write — Tenant Admin only
PATCH  /api/v1/pois/{poi_id}/geofence/                  # set/update radius_m and/or dwell_threshold_minutes; old→new audit written
DELETE /api/v1/pois/{poi_id}/geofence/                  # remove radius (requires confirmation token); audit written; historical events preserved

# Tenant-level dwell default
GET    /api/v1/tenant/settings/dwell-threshold/         # read current tenant-default threshold
PATCH  /api/v1/tenant/settings/dwell-threshold/         # update tenant-default; Tenant Admin only
```

> The `DELETE` endpoint must accept a `confirm=true` query param or body flag — a bare DELETE without confirmation returns 400. This enforces the explicit-confirmation requirement in AC-3.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View POI geofence radius and dwell threshold | All authenticated roles (read-only in their context) |
| Create or update geofence radius per POI | Tenant Admin |
| Delete (remove) geofence radius | Tenant Admin (with explicit confirmation) |
| Configure dwell time threshold per POI | Tenant Admin |
| Configure tenant-level default dwell threshold | Tenant Admin |
| View geofence change audit log | Tenant Admin |

> Operational roles (Transport Planner, TDO, Gate Staff, etc.) can **read** the geofence radius as part of POI context but cannot modify it. The GPS-05 dashboard uses the radius to draw geofence circles — this is a read operation by the dashboard service, not a user action.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-02-1 | Geofence radius admin | AC-1: radius field + validation on POI admin, one-active rule | High | Not started |
| GPS-02-2 | Immediate-effect verification | AC-2: engine reads live config; boundary-change test | Medium | Not started |
| GPS-02-3 | RBAC, audit & delete confirmation | AC-3: config-role gating, change audit, confirmed deletion | High | Not started |
| GPS-02-4 | Dwell threshold config | AC-4: per-POI threshold + tenant default | Medium | Not started |

---

## Definition of Done

- [ ] Radius configurable per POI with validation and one-active rule (AC-1)
- [ ] Live-trip immediate effect demonstrated (AC-2)
- [ ] All changes audited; deletion confirmed + audited; history preserved (AC-3)
- [ ] Dwell thresholds configurable and readable by GPS-04 (AC-4)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| POI master data | Extends | `lat`/`lng` exist (Sprint 4); radius + threshold fields added here |
| GPS-03 geofence engine | Consumer | Reads radius at evaluation time (AC-2 contract) |
| GPS-04 dwell tracking | Consumer | Reads thresholds (AC-4) |
| AUD-01 audit framework | Integration | Geofence config changes should emit the AUD-01 unified audit standard directly |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 1 SP | PRD: §6.5.7 | Jira: DFS-078 | Last Updated: 2026-06-15*
