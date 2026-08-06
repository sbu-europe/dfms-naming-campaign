---
module: 09-tracking
specification: Maps Dashboard & map surfaces
prd_refs:
  - "§6.5.4 Integration & Linkage – Map Layer Integration (TO + Live GPS)"
  - "§6.9.2 Transport Dashboard – Map-Based Dashboard"
related_stories: [GPS-05, DFS-070]
status: Partial — Live GPS delivered; full Maps Dashboard deferred
last_updated: 2026-08-06
---

# Maps Dashboard & Map Surfaces

## User Story

**As a** Transport Planner / Transport Distribution Officer  
**I want** a real-time map-based operational view of vehicles, TOs, and POIs  
**So that** I can monitor execution status from one place.

## Business Context

The PRD describes a rich **Maps Dashboard** (default landing for TP/TDO, KPIs, POI presence, TO-centric route view). Phase 1 delivered **Live GPS** as the working map for GPS monitoring. This document keeps those surfaces distinct so “map dashboard” language is not confused with what operators have today.

## Surface comparison

| Surface | Audience | Purpose | Status |
|---------|----------|---------|--------|
| **Live GPS** | Tenant Admin, Tenant Super Admin + roles with Live GPS permission | Real-time fleet on active trips; history; geofence circles | **Delivered** |
| **Maps Dashboard** (PRD §6.5.4 / §6.9.2 / GPS-05) | Transport Planner, TDO (Own / Vendor), Tenant Admin | Default landing: KPIs, presence panel, TO highlight, broader RBAC | **Deferred** |
| **Command Center map** | Yard / Command Center roles | Yard operational context | Separate module — not GPS SSOT |

Live GPS detail: [live-gps-monitoring.md](live-gps-monitoring.md).

## §6.5.4 / §6.9.2 — client wants vs status

| Client want | Status | Where it lives today |
|-------------|--------|----------------------|
| POIs on map with geofence zones | **Done** | Live GPS |
| Vehicle positions relative to POIs | **Done** | Live GPS |
| Active trips with source/destination context | **Partial** | On Live GPS vehicle/TO context; full highlight UX deferred |
| Arrival / Departure event logging | **Done** | [vehicle-arrival-departure.md](vehicle-arrival-departure.md) |
| Dwell between arrival and departure | **Done** | [dwell-time-tracking.md](dwell-time-tracking.md) |
| List of vehicles currently inside each POI | **Not done** | Presence panel deferred |
| Entry time + duration-so-far on presence panel | **Not done** | Deferred |
| Map as **default landing** for TP / TDO | **Not done** | Live GPS is a menu page, not default dashboard |
| KPI widgets (active TOs, in transit, idle, halted) | **Not done** | Deferred |
| TO-centric route visualization | **Not done** | Deferred |
| Side panel: vehicle, driver, helper, TO, last GPS | **Partial** | Live GPS panels; full GPS-05 panel set deferred |
| Flags: halted TO, idle threshold, dwell violation | **Partial** | Dwell vs planned on TO; full dashboard flags deferred |

## Access & Permissions (target Maps Dashboard)

| Action | Role (PRD intent) |
|--------|-------------------|
| Open Maps Dashboard as landing | Transport Planner, TDO Own Fleet, TDO Vendor Fleet (RBAC-scoped) |
| See own-fleet vs vendor-fleet markers | Per role / fleet scope |

**As built:** Live GPS uses Live GPS menu permission (and Tenant Admin). Full Maps Dashboard RBAC matrix ships with GPS-05.

## Business rules (when Maps Dashboard ships)

- Only vehicles with a **valid GPS association** appear as live markers.
- If live tracking is unavailable, show **last known** position.
- POI presence and geofence visuals use POI master radius.
- Own vs vendor fleet segregation follows RBAC.

## API family (product)

| Family | Status | Use |
|--------|--------|-----|
| `/api/v1/tracking/**` | **As built** | Live GPS, geofence, history |
| `/api/v1/maps/**` | **Not built** | Future Maps Dashboard |

Until Maps Dashboard ships, product surfaces use **`/api/v1/tracking/`**.

## Dependencies

- **Requires:** Live GPS feed, POI geofences, arrival/departure, dwell (GPS-01…04)  
- **Enables:** Default operational landing for transport roles per PRD  

## Related

- [Live GPS](live-gps-monitoring.md) · [Module hub](README.md)  
- Stories: GPS-05, DFS-070  
