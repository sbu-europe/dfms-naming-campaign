---
jira_key: DFS-078
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-02
title: POI Geofencing Boundary Management — Radius on POI Master
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
**I want to** define a geofence radius (metres) for each Point of Interest  
**So that** vehicle arrival and departure can be detected automatically when entering or leaving a facility.

*(PRD §6.5.7)*

---

## Business Context

### Why geofence configuration matters

Depots, feed mills, ports, and warehouses need different boundary sizes. A single fixed radius cannot serve a tight port berth and a large mill compound. Geofence configuration sits on **POI master data**; the tracking engine and Live GPS read the current radius.

Without a radius:

- Arrival / departure events have no boundary to evaluate (GPS-03)
- Live GPS cannot draw meaningful geofence circles
- Geofence dwell cannot be calculated (GPS-04)

### How geofence config flows

```
Tenant Admin opens POI → sets Geofence Radius (m)
  → Live GPS draws the circle immediately
  → Arrival/departure engine uses current radius on each GPS update
```

1. Tenant Admin opens **POI master data** → selects a POI → sets **Geofence Radius (m)**.
2. Live GPS and GPS-03 read the **current** radius at evaluation / display time — changes apply **immediately** for live trips and map display (no “wait until next trip”).
3. Historical `GeofenceEvent` records are **not deleted** when a radius changes.

### Geofence definition (Phase 1)

| Attribute | Rule |
|-----------|------|
| Shape | Circle only |
| Center | POI latitude / longitude |
| Radius | Metres on POI master — **one active geofence per POI** |
| Effect of change | Immediate for live trips and map display |
| Who can change | Tenant Admin / users authorised to edit POI master |

PRD cites a configurable range (e.g. 50–1000 m). Product intent: radius is required for geofenced operations; enforce sensible min/max as validation matures.

Only **Active** POIs with coordinates participate in map and operational geofencing. Changing coordinates or radius updates the boundary used by GPS monitoring. Yard “gate dwell” is separate from geofence dwell (see GPS-04).

---

## Acceptance Criteria

### AC-1 — Radius on POI master

- Tenant Admin defines/edits a geofence **radius in metres** per POI from POI master data admin (standard POI edit — not a separate geofence object).
- Geofence is a **circle** centred on the POI latitude/longitude; **one active geofence per POI**.
- Validation enforces a sane min/max range (agreed with PO; PRD example 50–1000 m).
- Only **Active** POIs with coordinates participate in operational and map geofencing.

### AC-2 — Immediate effect on live trips and map

- Radius (and coordinate) changes take effect **immediately** for live trips and Live GPS map circles — no restart, cache flush, or trip re-creation.
- GPS-03 reads the current radius at evaluation time on each GPS update.

### AC-3 — Access and history preservation

- Roles with POI write (Tenant Admin / authorised config) can edit the radius; other roles that can view POI see radius as read-only context.
- Changing radius does **not** delete historical arrival/departure (`GeofenceEvent`) records.
- Change history is covered by **general POI / audit** behaviour — this story does **not** require a dedicated geofence-only audit surface.

### Out of scope (explicit)

- Dedicated geofence-only API + delete UX (configure via POI edit today).
- Dedicated geofence-specific audit log UI.
- Per-POI dwell threshold on master and tenant-level dwell-default settings — Phase 1 exceptions use **planned dwell on the TO** ([GPS-04](GPS-04-dwell-time-tracking.md)).

---

## API Endpoints

Geofence radius lives on the POI resource. Phase 1 delivery is **POI read/write** (admin form and/or standard POI API), not a standalone geofence object.

```http
# Read — authorised roles that can view POI master
GET /api/v1/pois/{poi_id}/
# Response includes geofence radius (and lat/lng), e.g.:
{
  "id": "...",
  "name": "...",
  "latitude": 23.81,
  "longitude": 90.41,
  "geofence_radius_m": 200,
  "is_active": true
}

GET /api/v1/pois/
# List includes geofence radius so Live GPS / maps can draw circles

# Write — roles with POI write (Tenant Admin / authorised config)
PATCH /api/v1/pois/{poi_id}/
# Update geofence_radius_m (and/or coordinates) via standard POI update;
# engine and Live GPS read the new values immediately
```

> There is no separate user write for derived tracking fields. Radius is master-data configuration; arrival/departure and dwell are calculated by downstream engines.

### Deferred / out of scope APIs

These paths were previously sketched for a dedicated geofence surface and dwell-threshold config. They are **not** Sprint Phase 1 acceptance for GPS-02:

```http
PATCH  /api/v1/pois/{poi_id}/geofence/                  # dedicated geofence-only mutate + delete UX
DELETE /api/v1/pois/{poi_id}/geofence/                  # dedicated radius removal with confirm token
GET    /api/v1/tenant/settings/dwell-threshold/         # tenant-default dwell threshold
PATCH  /api/v1/tenant/settings/dwell-threshold/         # tenant-default dwell threshold
# Per-POI dwell_threshold_minutes on POI — deferred; see GPS-04 planned dwell
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| View POI including radius | Roles that can view POI master |
| Edit geofence radius | Roles with POI write (Tenant Admin / authorised config) |

> Operational roles may **read** radius as POI context (e.g. Live GPS drawing circles) but do not edit it. Dedicated geofence delete confirmation UX and dwell-threshold configuration actions are out of scope for this story.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-02-1 | Geofence radius admin | AC-1: radius field + validation on POI admin; circle / one-active rule | High | Not started |
| GPS-02-2 | Immediate-effect verification | AC-2: live trips + map use current radius after change | Medium | Not started |
| GPS-02-3 | Access & history preservation | AC-3: POI-write gating; historical events preserved; general POI audit sufficient | High | Not started |

---

## Definition of Done

- [ ] Radius configurable per POI with validation, circle centre, and one-active rule (AC-1)
- [ ] Live-trip and map immediate effect demonstrated (AC-2)
- [ ] Only POI-write roles can edit radius; historical events preserved on change (AC-3)
- [ ] No Sprint AC requiring dedicated geofence API/delete UX, dedicated geofence audit UI, or per-POI dwell threshold (out of scope)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| POI master data | Requires | Radius field and admin UX on POI ([poi-management](../../../../05-modules/02-master-data/poi-management.md)) |
| GPS-03 arrival/departure | Enables | Engine evaluates against current POI radius |
| GPS-04 dwell | Enables | Geofence dwell uses arrival/departure pairs at the configured boundary |
| Live GPS / maps | Enables | Map draws geofence circles from POI radius |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 1 SP | PRD: §6.5.7 | Jira: DFS-078 | Last Updated: 2026-08-06*
