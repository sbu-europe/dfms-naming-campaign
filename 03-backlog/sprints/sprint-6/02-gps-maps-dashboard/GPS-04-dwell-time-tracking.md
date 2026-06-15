---
jira_key: DFS-080
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-04
title: Dwell Time Tracking — Calculation, Visibility & Threshold Exceptions
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 2
assignee: ~
prd_refs:
  - "§6.5.9 Dwell Time Tracking"
  - "§6.5.6 Geofencing and POI Tracking"
phase: Phase 1
---

# GPS-04 — Dwell Time Tracking

## User Story

**As a** Transport Planner and Transport Distribution Officer
**I want to** see how long each vehicle stayed at its source POI (for loading) and destination POI (for unloading)
**So that** I can identify which facilities are causing operational bottlenecks and escalate before a delay cascades into a missed delivery window.

**As a** Transport Planner
**I want the** system to flag vehicles that are still inside a POI geofence beyond the configured dwell time threshold
**So that** I am proactively alerted to a loading or unloading delay — before the vehicle has even departed.

*(PRD §6.5.9)*

---

## Business Context

### Why dwell time is a key operational metric

In the DFMS context, **dwell time** is the duration a vehicle spends inside a facility's geofence boundary between arrival and departure. Excessive dwell at a feed mill or depot typically indicates:
- Loading crew shortage or equipment failure (at source).
- Congestion or documentation hold (at destination).
- Unauthorized driver stop (on-route POI visits).

Without dwell measurement, transport planners have no data to support decisions like "increase the truck turn-around target at POI X" or "raise a case with the depot manager about slow loading." PRD §6.5.9 mandates automatic dwell calculation as a Phase 1 deliverable — it is part of the operational efficiency case for DFMS.

### How dwell time flows

1. **GPS-03 fires ARRIVAL** → a dwell record for this vehicle/POI/trip visit is opened with `arrival_timestamp`.
2. **Vehicle remains inside** → a **Celery periodic task** checks in-progress stays against the POI's configured threshold (GPS-02 AC-4). If the threshold is exceeded **before departure**, an exception flag is raised and visible on the GPS-05 KPI bar and the trip timeline — the planner can act without waiting for the vehicle to leave.
3. **GPS-03 fires DEPARTURE** → dwell record is closed: `dwell_seconds = departure_timestamp − arrival_timestamp`. If the completed stay exceeded the threshold, the dwell record is also marked as an exception.
4. **Transport Planner views** → dwell time appears on the TO timeline (with the departure event) and the geofence-event history API (GPS-03 AC-4). Aggregated POI-level dwell metrics (avg/max, visit counts, exception counts) are available for reporting.

### Multiple visits

A single vehicle may visit the same POI more than once within a trip (e.g. a vehicle re-entering the source depot after a rejected load). Each visit produces a **separate dwell record** — the calculation is per ARRIVAL→DEPARTURE pair, not per trip.

### Edge cases that must be handled explicitly

| Edge case | Rule |
|-----------|------|
| Vehicle starts inside a geofence (no preceding ARRIVAL within this trip) | Dwell start = trip start timestamp; flagged as "estimated — no ARRIVAL event" |
| Trip completed while vehicle still inside geofence | Dwell closed at trip-completion timestamp; flagged as "trip ended in fence" |
| GPS signal lost during dwell | Last known position used; flag set on dwell record: "signal lost — dwell may be underestimated" |
| Engine restart during an open dwell | Resume from Redis presence state; do not create a duplicate ARRIVAL |
| Negative dwell (clock skew / out-of-order events) | Clamp to zero; log warning; never store negative values |

All rules must be documented in code and referenced in the coverage report.

---

## Acceptance Criteria

### AC-1 — Dwell calculation

- On a `DEPARTURE` event, dwell time is auto-calculated as `departure_timestamp − arrival_timestamp` for that vehicle/POI/trip and stored against the geofence event pair.
- Calculation covers **both source and destination POIs** of a trip; multiple visits to the same POI within one trip produce separate dwell records.
- Edge cases defined and handled: missing arrival (event starts mid-fence after signal loss), trip completed while still in fence, engine restart — rules documented, no unbounded or negative dwell values.

### AC-2 — Visibility

- Dwell time visible per trip: on the TO timeline (with the departure event) and in the geofence-event history API (GPS-03 AC-4).
- Dwell time visible per POI: aggregation view (avg/max dwell, visit count, exception count over a date range) available to authorized roles — admin report view or dashboard widget (GPS-05).

### AC-3 — Threshold exceptions

- A periodic task flags vehicles whose **in-progress** stay exceeds the POI's configured threshold (GPS-02 AC-4) — the flag must not wait for departure.
- Completed stays exceeding the threshold are marked as exceptions on the dwell record.
- Exceptions are flagged for reporting: queryable per POI/per trip, surfaced in the GPS-05 KPI bar, and visible on the trip timeline.

---

## API Endpoints

```
# Dwell summary per trip (embedded in geofence-event history — GPS-03 AC-4 endpoint)
GET   /api/v1/maps/transport-orders/{to_id}/geofence-events
      Response includes: dwell_seconds, is_exception, dwell_status (in_progress|completed|signal_lost|trip_ended_in_fence)

# Per-POI dwell aggregation report (for Transport Planner / Tenant Admin visibility)
GET   /api/v1/maps/pois/{poi_id}/dwell-report
      ?from=ISO8601&to=ISO8601                             # date range
      Response: { poi_id, poi_name, avg_dwell_seconds, max_dwell_seconds,
                  visit_count, exception_count, visits: [...] }

# Active dwell exceptions (in-progress stays exceeding threshold — feeds GPS-05 KPI bar)
GET   /api/v1/maps/dwell-exceptions/active
      Response: list of { vehicle_id, poi_id, poi_name, arrival_timestamp,
                          dwell_seconds_so_far, threshold_seconds, trip_id, to_id }

# Trip timeline — dwell appears on DEPARTURE event (existing TLS-01 endpoint, extended)
GET   /api/v1/transport-orders/{to_id}/timeline
```

> There is no write endpoint for dwell data. Dwell records are created and closed by the engine (GPS-03 events + Celery task), never by a user action.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View dwell time per trip (timeline + geofence-event history) | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| View per-POI dwell aggregation report | Transport Planner, Tenant Admin |
| View active dwell threshold exceptions | Transport Planner, TDO — Own Fleet, Tenant Admin |
| View dwell exception indicators on GPS-05 KPI bar | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| Configure dwell threshold per POI | Tenant Admin (via GPS-02) |
| Write / close dwell records | **System only** — engine and Celery task; no user write surface |

> Vendor-fleet TDOs can see dwell for TOs in their scope (vendor trips). Gate staff, scaling operators, and other yard roles do not have access to the dwell aggregation or exception APIs — they see their own queues via module-specific screens.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-04-1 | Dwell calculation | AC-1: compute on departure; source + destination; multi-visit; edge-case rules | High | Not started |
| GPS-04-2 | Threshold exception task | AC-3: periodic in-fence check + completed-stay marking | High | Not started |
| GPS-04-3 | Trip-level visibility | AC-2: timeline + event-history exposure | Medium | Not started |
| GPS-04-4 | Per-POI aggregation | AC-2: avg/max/visits/exceptions report view | Medium | Not started |

---

## Definition of Done

- [ ] Dwell auto-calculated on departure for source and destination stays (AC-1)
- [ ] Edge-case rules documented and tested (AC-1)
- [ ] In-progress threshold breach flagged before departure (AC-3)
- [ ] Dwell + exceptions visible per trip and per POI (AC-2, AC-3)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-03 events | Upstream | Arrival/departure pairs are the calculation input |
| GPS-02 thresholds | Upstream | Per-POI threshold + tenant default |
| GPS-05 dashboard | Consumer | KPI bar + POI panel surface dwell/exceptions |
| Celery | Infra | Periodic threshold task |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 2 SP | PRD: §6.5.9, §6.5.6 | Jira: DFS-080 | Last Updated: 2026-06-15*
