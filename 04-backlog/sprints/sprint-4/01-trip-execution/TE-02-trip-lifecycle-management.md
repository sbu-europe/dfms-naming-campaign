---
jira_key: DFS-043
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 4"
story_id: US-021
title: Trip Lifecycle Management (12 States)
epic: Trip Execution
status: Pending
story_points: 13
assignee: ~
spec_file: ../../../../stories/US-021-trip-lifecycle.md
---

# TE-02 — Trip Lifecycle Management (12 States)

## User Story

**As a** Transport Planner / Operations Manager  
**I want to** track a trip through its complete lifecycle from dispatch to closure  
**So that** every stakeholder has real-time visibility of trip progress, and exceptions are captured at the right stage

## Business Context

A Trip is created automatically when a TO is dispatched (TE-01). This story owns the state machine that governs the entire trip — from vehicle leaving the source to delivery confirmation at the destination. Each state transition is timestamped, role-restricted, and auditable.

The 12-state lifecycle is:

```
Dispatched → Departed Source → In Transit → Arrived Destination →
Gate-In Destination → Unloading → Unloaded → Gate-Out Destination →
Delivery Confirmed → Returning → Returned → Completed
```

Exception states (can occur from several states): `Delayed`, `Incident Reported` (TE-03).

## Acceptance Criteria

### AC-1: Trip State Machine
- [ ] All 12 states implemented with valid transition rules
- [ ] Invalid transitions rejected with descriptive error
- [ ] Each state records: transitioned_by (user), timestamp, optional remarks

### AC-2: State Transitions — Source Side
- [ ] `Dispatched → Departed Source`: Triggered by Driver (mobile) or Planner when vehicle leaves source POI
- [ ] Vehicle gate-out at source recorded (links to Sprint 6 Gate Ops)
- [ ] `Departed Source → In Transit`: Auto-transition on gate-out confirmation or manual trigger

### AC-3: State Transitions — Destination Side
- [ ] `In Transit → Arrived Destination`: Driver/Gate staff triggers on vehicle arriving at destination
- [ ] `Arrived Destination → Gate-In Destination`: Gate staff confirms vehicle entry
- [ ] `Gate-In Destination → Unloading`: Loading crew starts unloading
- [ ] `Unloading → Unloaded`: Unloading completed with quantity confirmed
- [ ] `Unloaded → Gate-Out Destination`: Vehicle exits destination POI
- [ ] `Gate-Out Destination → Delivery Confirmed`: Delivery officer confirms receipt

### AC-4: Return Journey
- [ ] `Delivery Confirmed → Returning`: Driver starts return journey (own fleet)
- [ ] `Returning → Returned`: Vehicle arrives back at source / home POI
- [ ] `Returned → Completed`: Planner closes trip; vehicle + driver status → `Available`

### AC-5: Delay Tracking
- [ ] Planner / system can flag trip as `Delayed` from `In Transit` or `Arrived Destination`
- [ ] Delay reason (enum + free text) required
- [ ] Delay does not block future transitions; trip resumes normal flow
- [ ] ETA recalculated on delay flag

### AC-6: Trip Overview Dashboard
- [ ] Planner can see all active trips with their current state, vehicle, driver, route, ETA
- [ ] Filter by: state, route, driver, vehicle, date range
- [ ] Colour-coded state badges

### AC-7: Audit Trail
- [ ] Full state transition history per trip — who, when, what state, remarks

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TE-02-1 | Trip model — 12-state enum, state history table (state, actor, timestamp, remarks) | DFS-043-1 | Pending |
| TE-02-2 | State machine service — valid transitions map + guard functions | DFS-043-2 | Pending |
| TE-02-3 | State transition API (POST /trips/{id}/transition) — validates, persists, returns updated trip | DFS-043-3 | Pending |
| TE-02-4 | Source-side transitions: Dispatched → Departed → In Transit | DFS-043-4 | Pending |
| TE-02-5 | Destination-side transitions: Arrived → Gate-In → Unloading → Unloaded → Gate-Out → Delivered | DFS-043-5 | Pending |
| TE-02-6 | Return journey transitions: Delivered → Returning → Returned → Completed | DFS-043-6 | Pending |
| TE-02-7 | Delay flag API (POST /trips/{id}/delay) — reason + ETA recalc | DFS-043-7 | Pending |
| TE-02-8 | Vehicle + driver status reset to `Available` on trip `Completed` | DFS-043-8 | Pending |
| TE-02-9 | Trip list API (GET /trips with state/route/driver/vehicle/date filters) | DFS-043-9 | Pending |
| TE-02-10 | Trip overview dashboard UI — state badges, ETA, vehicle/driver info | DFS-043-10 | Pending |
| TE-02-11 | Trip detail page — full state history timeline | DFS-043-11 | Pending |

## API Endpoints

```
POST  /api/v1/trips/{id}/transition
Body: { target_state, remarks }
Response: 200 + updated trip

POST  /api/v1/trips/{id}/delay
Body: { reason_code, reason_text, new_eta }

GET   /api/v1/trips?state=&driver_id=&vehicle_id=&route_id=&from=&to=&page=
GET   /api/v1/trips/{id}
GET   /api/v1/trips/{id}/history
```

## Dependencies

- **Requires**: TE-01 (Trip created on TO dispatch)
- **Feeds into**: TE-03 (Incident Management uses trip state), TC-01 (Partial Delivery), TC-02 (Trip Closure / POD)
- **Used by**: Sprint 6 Gate Ops (gate events trigger state transitions), Sprint 10 Driver Mobile

## Definition of Done

- [ ] All 12 states + invalid transition rejection working
- [ ] Delay flag with ETA recalculation
- [ ] Vehicle/driver released on trip completion
- [ ] Trip list and detail APIs with full history
- [ ] Unit tests covering all transition guards > 80%
- [ ] UAT: Planner walks one trip from `Dispatched` to `Completed` through all 12 states
