---
jira_key: DFS-080
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-04
title: Dwell Time Tracking — Planned, Gate & Geofence Visibility
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
**I want to** see planned, gate, and geofence dwell for source and destination POIs on a transport order
**So that** I can compare plan vs actual, identify bottlenecks, and assess delays without relying on a single clock source.

*(PRD §6.5.9)*

---

## Business Context

### Why dwell time matters

In the DFMS context, **dwell** is how long a vehicle spends at a facility. For this module, the business needs three complementary perspectives on the same stop:
- **Planned** dwell from TO planning.
- **Real Time (Gate)** dwell from gate-in / gate-out operations.
- **Geofence time** from GPS arrival / departure at the POI boundary.

This lets planners compare operational reality against plan and distinguish yard-process delays from GPS-derived movement events.

### How dwell time flows

1. **Planned dwell** is defined on the transport order milestone.
2. **Gate dwell** is derived from yard-operation timestamps where those events exist.
3. **Geofence dwell** is calculated from GPS arrival and departure events at source and destination POIs.
4. **Transport Planner / TDO views** the three dwell values together under the TO's planned milestone context to compare plan vs actual.

### Dwell glossary

| Name | Meaning | Source |
|------|---------|--------|
| **Planned** | Planned time at source / destination from TO planning | TO / planning fields |
| **Real Time (Gate)** | Gate-out minus gate-in | Gate / operations |
| **Geofence time** | Departure minus arrival at the POI geofence | GPS entry / exit events |

All three may appear for both **Source** and **Destination** legs on the transport order.

---

## Acceptance Criteria

### AC-1 — Geofence dwell calculation

- On a `DEPARTURE` event, geofence dwell is auto-calculated as `departure_timestamp − arrival_timestamp` for that vehicle/POI visit.
- Calculation applies to both **source** and **destination** POIs in the same operational scope as GPS arrival/departure.
- Geofence dwell is system-calculated from event timestamps; users do not manually write or override it.

### AC-2 — Three-way dwell visibility on the TO

- The transport order milestone view shows **Planned**, **Real Time (Gate)**, and **Geofence time** together for relevant source and destination stops.
- Users can compare planned vs gate vs geofence dwell without leaving the TO context.
- Gate dwell and geofence dwell are shown as distinct values because they answer different operational questions.

### AC-3 — Exception comparison scope

- Phase 1 exception visibility is limited to comparing **actual dwell vs planned dwell** on the transport order.
- If actual dwell exceeds planned dwell, the overrun is visible in the TO context for planner review.
- This story does **not** require in-fence proactive alerts, POI-level dwell thresholds, or a separate exception centre.

---

## API Endpoints

```http
# Geofence-event history for a transport order
GET /api/v1/maps/transport-orders/{to_id}/geofence-events
Response includes geofence dwell fields derived from arrival/departure events, e.g.:
{
  "to_id": "TO-123",
  "events": [
    {
      "poi_role": "source",
      "event_type": "DEPARTURE",
      "arrival_timestamp": "2026-08-06T05:10:00Z",
      "departure_timestamp": "2026-08-06T06:05:00Z",
      "dwell_seconds": 3300
    }
  ]
}

# Transport-order timeline / milestone surface
GET /api/v1/transport-orders/{to_id}/timeline
Response includes milestone-level dwell comparison where available, e.g.:
{
  "to_id": "TO-123",
  "milestones": [
    {
      "poi_role": "source",
      "planned_dwell_seconds": 3600,
      "gate_dwell_seconds": 3900,
      "geofence_dwell_seconds": 3300,
      "planned_vs_actual_status": "within_plan"
    }
  ]
}
```

> There is no write endpoint for dwell data. Planned dwell comes from TO planning, gate dwell comes from operational timestamps, and geofence dwell is calculated by the system from GPS arrival/departure events.

---

## Functional Notes

- There is no user write action for geofence dwell; it is derived from GPS arrival/departure events.
- Planned dwell comes from TO planning data.
- Gate dwell comes from gate operation timestamps where available.
- The story outcome is primarily a **business visibility** feature in the transport-order context, not a standalone reporting module.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View dwell on TO / history | Transport Planner, TDO — Own Fleet, TDO — Vendor Fleet, Tenant Admin |
| Manually set geofence dwell | **Nobody** — calculated from events |

> Vendor-fleet TDOs can see dwell for TOs in their scope (vendor trips). Gate staff, scaling operators, and other yard roles do not use this TO-level dwell visibility surface; they operate through their own module-specific screens.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-04-1 | Geofence dwell calculation | AC-1: compute on departure from arrival/departure event pair | High | Not started |
| GPS-04-2 | TO milestone visibility | AC-2: show planned, gate, and geofence dwell together | High | Not started |
| GPS-04-3 | Planned vs actual comparison | AC-3: show when actual dwell exceeds planned dwell on the TO | Medium | Not started |
| GPS-04-4 | History / summary exposure | Surface dwell in TO history/summary where relevant | Medium | Not started |

---

## Definition of Done

- [ ] Geofence dwell auto-calculated on departure for source and destination stays (AC-1)
- [ ] Planned, gate, and geofence dwell visible together on the TO (AC-2)
- [ ] Planned vs actual dwell comparison visible in the TO context (AC-3)
- [ ] No manual dwell-entry workflow exists for users (AC-1)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-03 events | Upstream | Arrival/departure pairs are the geofence dwell input |
| TO planned milestones | Upstream | Source of planned dwell baseline |
| Gate timestamps | Upstream | Source of real-time gate dwell where captured |
| GPS-05 dashboard / history | Consumer | May surface dwell summaries when that surface uses the same data |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 2 SP | PRD: §6.5.9, §6.5.6 | Jira: DFS-080 | Last Updated: 2026-08-06*
