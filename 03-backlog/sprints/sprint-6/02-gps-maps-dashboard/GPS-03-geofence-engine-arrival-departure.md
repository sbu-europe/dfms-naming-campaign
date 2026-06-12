---
jira_key: DFS-079
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-03
title: Geofence Engine — Vehicle Arrival & Departure Event Tracking
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 3
assignee: ~
prd_refs:
  - "§6.5.6 Geofencing and POI Tracking"
  - "§6.5.8 Vehicle Arrival Tracking at POI"
phase: Phase 1
---

# GPS-03 — Geofence Engine: Arrival & Departure Event Tracking

## User Stories

> **As a Transport Planner and TDO**, I want to track vehicle entry and exit at POIs so that dwell time and operational delays can be measured accurately. *(PRD §6.5.6)*

> **As a Transport Planner and Transport Distribution Officer**, I want the system to automatically detect vehicle arrival at a POI so that gate-in and operational readiness can be tracked without manual input. *(PRD §6.5.8)*

---

## Acceptance Criteria

### AC-1 — Detection engine

- Each incoming GPS snapshot is evaluated against all active POI geofences (haversine distance vs current radius from GPS-02).
- Per-vehicle presence state held in Redis; **debounce/hysteresis** prevents event flapping when a vehicle hovers on the boundary (rule documented, e.g. N consecutive points or M-second confirmation).
- Engine throughput handles the full fleet at the configured poll interval; evaluation cost documented.

### AC-2 — Arrival & departure events

- Vehicle **enters** a POI geofence → `ARRIVAL` event logged automatically with timestamp; vehicle **exits** → `DEPARTURE` event.
- Events persist in an append-only `GeofenceEvent` model with read-only admin; no edit or delete surface.
- Each event linked to **vehicle ID** always, and to **Trip ID + TO ID** when the vehicle has an active trip (GPS-01 association); off-trip events still recorded against the vehicle.
- Detection accuracy documented as GPS-provider dependent (known-limitations note carried from the Sprint 5 demo).

### AC-3 — Trip timeline integration (TLS-01)

- Arrival and departure events for on-trip vehicles are emitted to the TO timeline **atomically** with the `GeofenceEvent` write; visible via existing `GET …/timeline` ordered with all other lifecycle events.
- Source/destination POI of the TO identified on the event (arrival at source vs destination is distinguishable).

### AC-4 — Event history API

- `GET /api/v1/maps/transport-orders/{id}/geofence-events` returns the TO's geofence event history (event type, POI, vehicle, timestamps, dwell once GPS-04 lands); RBAC consistent with the GPS-05 dashboard permission.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-03-1 | Detection engine | AC-1: haversine evaluation, Redis presence state, debounce rule, throughput check | High | Not started |
| GPS-03-2 | `GeofenceEvent` model | AC-2: append-only model + read-only admin | High | Not started |
| GPS-03-3 | Event linkage | AC-2: vehicle always; Trip/TO when on-trip; source-vs-destination tagging | High | Not started |
| GPS-03-4 | TLS-01 timeline emission | AC-3: atomic emission to TO timeline | High | Not started |
| GPS-03-5 | Event history API | AC-4: geofence-events endpoint + RBAC | Medium | Not started |

---

## Definition of Done

- [ ] Entry/exit detected and debounced for a mock vehicle crossing a boundary (AC-1)
- [ ] `ARRIVAL`/`DEPARTURE` events persisted append-only with full linkage (AC-2)
- [ ] Events appear on the TO timeline in order, atomically with the event write (AC-3)
- [ ] History endpoint returns correct events under RBAC (AC-4)
- [ ] Verified end-to-end on the E2E-01 harness mock GPS feed (with the GPS-05-9 scenario)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 feed | Upstream | Snapshots + trip association are the engine input |
| GPS-02 config | Upstream | Current radius read at evaluation time |
| TLS-01 lifecycle | Integration | Timeline emission (AC-3) |
| GPS-04 / GPS-05 | Consumers | Dwell calc and dashboard read these events |
| Redis | Infra | Presence state |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 3 SP | PRD: §6.5.6, §6.5.8 | Jira: DFS-079 | Last Updated: 2026-06-12*
