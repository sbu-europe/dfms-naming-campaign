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

> **As a Transport Planner and Transport Distribution Officer**, I want to track how long vehicles stay at POIs so that bottlenecks and inefficiencies can be identified. *(PRD §6.5.9)*

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

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 2 SP | PRD: §6.5.9, §6.5.6 | Jira: DFS-080 | Last Updated: 2026-06-12*
