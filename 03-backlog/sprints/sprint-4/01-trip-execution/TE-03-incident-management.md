---
jira_key: DFS-044
jira_type: Story
jira_epic: DFS-043
jira_sprint: "Sprint 4"
story_id: US-023
title: Incident Management & Exception Handling
epic: Trip Execution
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-023-incident-management.md
---

# TE-03 — Incident Management & Exception Handling

## User Story

**As a** Driver / Transport Planner  
**I want to** report and track incidents that occur during a trip  
**So that** exceptions are documented, escalated appropriately, and do not get lost or unresolved

## Business Context

Incidents interrupt normal trip flow — breakdowns, accidents, route diversions, cargo damage, theft, or delays beyond threshold. This story provides the mechanism to report, categorise, and resolve exceptions with a full audit trail, without blocking the trip from eventually completing.

## Acceptance Criteria

### AC-1: Incident Reporting
- [ ] Driver (via mobile) or Planner can raise an incident against an active trip
- [ ] Incident form captures:
  - Incident type (enum): Breakdown, Accident, Route Diversion, Cargo Damage, Theft, Weather Delay, Other
  - Description (free text)
  - Location (lat/lng or POI reference)
  - Photo attachments (optional, up to 5 images)
  - Severity: Low / Medium / High / Critical
- [ ] Incident auto-linked to trip and current trip state

### AC-2: Trip State on Incident
- [ ] Trip flagged with `Incident Reported` alongside current state (non-blocking overlay — trip can still progress)
- [ ] `Critical` severity incidents: trip state transitions to `Incident Hold` — cannot progress until resolved
- [ ] Planner notified immediately on any incident with severity ≥ Medium

### AC-3: Incident Escalation
- [ ] System auto-escalates incident to Operations Manager if not acknowledged within:
  - High → 30 minutes
  - Critical → 10 minutes
- [ ] Escalation log maintained

### AC-4: Incident Resolution
- [ ] Planner / Ops Manager can resolve an incident with:
  - Resolution type: Resolved On Road, Tow & Swap Vehicle, Cargo Offloaded, Reported to Authorities, Closed Without Action
  - Resolution notes
- [ ] On resolution of `Incident Hold`, trip state restored; normal transitions re-enabled
- [ ] Resolution logged with resolver ID + timestamp

### AC-5: Incident Dashboard
- [ ] Operations view of all open incidents — filterable by severity, trip, incident type
- [ ] SLA timer visible for unacknowledged incidents
- [ ] Resolved incidents archived with full history

### AC-6: Audit Trail
- [ ] Incident open, acknowledged, escalated, resolved — all events timestamped with actor

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TE-03-1 | Incident model — trip FK, type, severity, location, description, photos, status, history | DFS-044-1 | Pending |
| TE-03-2 | Incident report API (POST /trips/{id}/incidents) | DFS-044-2 | Pending |
| TE-03-3 | Incident list + detail API (GET /incidents, GET /incidents/{id}) | DFS-044-3 | Pending |
| TE-03-4 | Trip `Incident Hold` state + restore flow on resolution | DFS-044-4 | Pending |
| TE-03-5 | Auto-escalation Celery task — SLA timers for High/Critical incidents | DFS-044-5 | Pending |
| TE-03-6 | Incident resolution API (POST /incidents/{id}/resolve) | DFS-044-6 | Pending |
| TE-03-7 | Incident dashboard UI — open incidents with severity badges and SLA timers | DFS-044-7 | Pending |
| TE-03-8 | Photo attachment upload (S3/media storage) | DFS-044-8 | Pending |

## API Endpoints

```
POST  /api/v1/trips/{id}/incidents
Body: { type, severity, description, location, photo_ids }
Response: 201 + incident object

GET   /api/v1/incidents?trip_id=&severity=&status=&page=
GET   /api/v1/incidents/{id}

POST  /api/v1/incidents/{id}/acknowledge
POST  /api/v1/incidents/{id}/resolve
Body: { resolution_type, resolution_notes }
```

## Dependencies

- **Requires**: TE-02 (Trip Lifecycle — incident attached to trip)
- **Used by**: Sprint 10 Driver Mobile (driver-side incident reporting)

## Definition of Done

- [ ] Incident reporting with all fields and photo attachment
- [ ] `Incident Hold` blocks trip progression until resolved
- [ ] Auto-escalation Celery task with SLA timers
- [ ] Incident dashboard with open incidents and SLA countdown
- [ ] Unit tests > 80%
- [ ] UAT: Driver reports a Critical incident → trip enters Hold → Ops resolves → trip resumes
