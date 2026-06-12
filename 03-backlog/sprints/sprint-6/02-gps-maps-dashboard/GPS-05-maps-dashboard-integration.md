---
jira_key: DFS-081
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-05
title: Maps Dashboard & TO/PR Integration — Map UI, APIs & RBAC
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 4
assignee: ~
prd_refs:
  - "§6.5.4 Integration & Linkage – Map Layer Integration (TO + Live GPS)"
  - "§6.8.2 Transport Dashboard – Map-Based Dashboard"
  - "§9.2 Map & Routing APIs"
phase: Phase 1
supersedes: "Sprint 5 GPS-01 (DFS-070) demo gaps — POI map layer, degraded-mode verification, and PO sign-off fold in here"
---

# GPS-05 — Maps Dashboard & TO/PR Integration

---

## Acceptance Criteria

### AC-1 — Map dashboard

The vehicle tracking dashboard displays:

- All **active POIs** on the map with **geofence boundaries as colored zones** (radius circles) — closes the Sprint 5 AC-S5-3 gap.
- **Vehicle positions relative to POIs**, live-updating at the configured refresh interval (GPS-01 AC-3), with signal-lost styling.
- **Active trips with source/destination POIs highlighted**; selecting a trip focuses its vehicle and route context.
- **KPI widget bar**: vehicles moving / idle / at POI, active trips, signal-lost count, dwell threshold violations (GPS-04).

### AC-2 — `/api/v1/maps/**` API surface

- `GET /api/v1/maps/dashboard` — vehicles (position, status, trip ref), active POIs + geofence zones, active trips, KPI widget data.
- `GET /api/v1/maps/vehicles/{id}/panel` — vehicle context side panel: registration, current trip (TO/Trip ref), status, last update, current/last POI, today's activity.
- `GET /api/v1/maps/transport-orders/{id}/route` — TO/Trip-centric view: source/destination POIs highlighted, current vehicle position, arrival/departure history.
- (Geofence-event history endpoint delivered by GPS-03 AC-4 completes the family.)

### AC-3 — POI presence panel

- Per-POI view (map popup or panel) lists **vehicles currently within the geofence** with entry time and duration so far — reading GPS-03 presence state (§6.5.4 POI-Vehicle Relationship Tracking).

### AC-4 — RBAC

| Role | Dashboard access |
|------|------------------|
| Tenant Admin | Full read access |
| Transport Planner (TP) | Own-fleet vehicles, all POIs, all TOs |
| TDO — Own Fleet | Own-fleet vehicles |
| TDO — Vendor Fleet | Vendor-fleet TOs |

- `MapsDashboardPermission` enforced on every `/api/v1/maps/**` endpoint; 403 for unauthorized roles; unit tests cover all four roles plus a negative role (e.g. gateman).

### AC-5 — Degraded mode (Sprint 5 closeout)

- On provider/API failure the map shows last successful positions with a visible **degraded-mode banner**; no white-screen. Verified in UAT and recorded — closes the Sprint 5 AC-S5-4 gap.

### AC-6 — TO / PR linkage verification (no rebuild expected)

- TO/Trip creation form offers **source POI and destination POI dropdowns** — verify existing Sprint 3 behaviour; record evidence.
- PR form pre-populates POI information and displays **real-time stock level for the source POI** and **capacity availability for the destination POI** — verify STK-01 (Sprint 5) covers this; close any display gaps found (gap > 1 SP becomes a raised backlog item, not silent scope growth).

### AC-7 — E2E scenario & PO sign-off

- End-to-end pass on the E2E-01 harness with a mock GPS feed: vehicle approaches source POI → `ARRIVAL` on timeline → dwell accrues → threshold flag fires → `DEPARTURE` + dwell calculated → dashboard, vehicle panel, route view, and POI presence panel all reflect each step (covers GPS-01 → GPS-05 jointly).
- **PO walkthrough of the production dashboard signed off** — supersedes the demo sign-off left open by the Sprint 5 story.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-05-1 | Dashboard API | AC-2: `GET /api/v1/maps/dashboard` | High | Not started |
| GPS-05-2 | Dashboard UI | AC-1: map layers incl. POI markers + geofence circles, trip highlighting, KPI bar; Live GPS page extend/supersede decision recorded | High | Not started |
| GPS-05-3 | Vehicle panel API | AC-2: `GET /api/v1/maps/vehicles/{id}/panel` | High | Not started |
| GPS-05-4 | TO route API | AC-2: `GET /api/v1/maps/transport-orders/{id}/route` | Medium | Not started |
| GPS-05-5 | POI presence panel | AC-3: in-fence vehicle list with entry time + duration | Medium | Not started |
| GPS-05-6 | RBAC | AC-4: `MapsDashboardPermission` + role matrix tests | High | Not started |
| GPS-05-7 | Degraded mode | AC-5: banner on provider failure; UAT verification recorded | Medium | Not started |
| GPS-05-8 | TO/PR linkage verification | AC-6: verify Sprint 3 POI dropdowns + STK-01 stock/capacity display; record evidence | Medium | Not started |
| GPS-05-9 | E2E scenario + PO sign-off | AC-7: full GPS journey on the E2E-01 harness; PO walkthrough sign-off | Medium | Not started |

---

## Definition of Done

- [ ] Dashboard shows POIs, geofence zones, live vehicles, highlighted active trips, KPI bar (AC-1)
- [ ] All three `/api/v1/maps/**` endpoints live with documented payloads (AC-2)
- [ ] POI presence panel correct against engine state (AC-3)
- [ ] RBAC matrix enforced with passing role tests (AC-4)
- [ ] Degraded-mode banner verified in UAT (AC-5)
- [ ] TO/PR linkage evidence recorded; gaps closed or raised (AC-6)
- [ ] E2E scenario passes; PO sign-off recorded (AC-7)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| GPS-01 / GPS-02 / GPS-03 / GPS-04 | Upstream | Dashboard assembles all four — schedule last in the epic |
| STK-01 stock snapshot | Reads | AC-6 PR-form verification |
| E2E-01 harness | Shared | GPS-05-9 runs on the Sprint 6 E2E foundation |
| PO availability | Review | AC-7 walkthrough sign-off near sprint end |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 4 SP | PRD: §6.5.4, §6.8.2, §9.2 | Jira: DFS-081 | Last Updated: 2026-06-12*
