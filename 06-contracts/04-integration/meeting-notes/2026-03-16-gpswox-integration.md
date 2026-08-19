---
title: GPS/VTS Integration — GPSWOX Provider Confirmation
meeting_date: 2026-03-16
recorded_by: Nishat (BS23)
status: confirmed
related_contract: ../gps-vts-integration.yaml
related_story: ../../../_meta/archive/backlog-stories-pre-sprint2/US-026-realtime-map-dashboard.md
---

# Meeting Notes — GPSWOX GPS/VTS Integration

**Date**: 16 March 2026  
**Location**: Virtual

## Participants

| Organisation | Name | Role |
|-------------|------|------|
| Brainstation-23 | Mahfuz | Tech Lead |
| Brainstation-23 | Nishat | Business Analyst |
| Brainstation-23 | Afridi | Developer |
| Nourish | Sadman | Product Owner / Operations |
| Nourish | Antu | GPS Tracker Operator |

---

## Current VTS Stack (Confirmed)

Nourish is already operating a live Vehicle Tracking System:

| Component | Detail |
|-----------|--------|
| **Software Provider** | GPSWOX — https://www.gpswox.com/ |
| **Dashboard URL** | http://206.189.141.206 |
| **Hardware Device** | Concox GT06-ND |
| **Hardware Spec** | https://www.gpswox.com/en/supported-gps-trackers/jimi-iot-concox/concox-gt06-nd |
| **Data Path** | Device → GSM/GPRS → GPSWOX platform → (API) → DFMS |

---

## Integration Scope — Agreed Boundary

**Nourish retains full ownership of:**
- Device installation, configuration, and firmware
- GPSWOX platform dashboard and device management
- SIM card and connectivity management

**DFMS will only:**
- Consume GPS data from GPSWOX via API (read-only)
- Use data for trip management, map display, and geofence-triggered status updates
- Display live location on the Command Centre map dashboard

> **Decision**: DFMS is a GPS data consumer, not a VTS operator.

---

## Confirmed Map View Data Fields

The following fields are required for DFMS map display and were confirmed in the meeting:

| Field | Description |
|-------|-------------|
| `latitude` | Current vehicle latitude (decimal degrees) |
| `longitude` | Current vehicle longitude (decimal degrees) |
| `speed` | Current speed in km/h |
| `overspeed` | Boolean flag — true if speed exceeds configured threshold on GPSWOX |

Additionally expected from the GPSWOX platform (standard fields):

| Field | Description |
|-------|-------------|
| `heading` | Bearing in degrees (0–359) |
| `timestamp` | UTC timestamp of last GPS fix |
| `ignition_status` | `on` / `off` |

---

## Map Configuration Requirements

| Setting | Value |
|---------|-------|
| Map type | Terrain view (not satellite or roadmap) |
| Initial zoom level | ~100 km radius (to show regional fleet movements) |
| Update frequency | Every 30 seconds (consistent with existing architecture spec) |

---

## Open Actions

| # | Action | Owner | Due |
|---|--------|-------|-----|
| 1 | Contact GPSWOX via email to **request API access credentials** (API key, base URL, available endpoints) | Antu (Nourish) | ASAP |
| 2 | Review Concox GT06-ND hardware capabilities to determine if **GPS data can be pulled directly** (TCP/UDP) if GPSWOX API access is denied or rate-limited | Mahfuz (BS23) | Before next sprint planning |

> **Note on Action 2**: The Concox GT06-ND supports raw TCP/IP data push to a custom server. This is a fallback path only — the preferred integration is via the GPSWOX REST API.

---

## Suggested Features (From Sadman)

These were proposed during the meeting. They are **not in current scope** and require feasibility validation before being added to the backlog.

### 1. Vehicle Assignment Optimisation

**Concept**: When assigning a vehicle to a transport requisition, sort the available vehicle list by real-time distance from the pickup POI rather than alphabetically or by default order.

**Feasibility assessment (preliminary)**:
- Requires `GET /vehicles/{id}/location` for all available vehicles simultaneously
- Distance calculation: Haversine formula (already used in POI geofencing)
- Feasible once GPSWOX API is live and response times are confirmed
- Risk: API rate limits if many vehicles are queried in parallel — may need batch endpoint or caching strategy
- **Status**: Pending API access confirmation; add to backlog after feasibility confirmed

### 2. Upcoming Vehicle Availability Forecasting

**Concept**: Predict when vehicles currently on trips will become available for new assignments, to support planning and scheduling.

**Feasibility assessment (preliminary)**:
- Requires: current vehicle location + destination POI coordinates + estimated travel time (Maps API)
- Combined with trip ETA from the trip management module
- Data dependencies: GPSWOX live location, Maps API ETA, trip state from DFMS DB
- Significant complexity — treat as a Phase 2+ feature
- **Status**: Requires data dependency validation; flagged for feasibility study before backlog entry

---

## Key Decisions Recorded

| # | Decision |
|---|----------|
| D1 | Integration is **API-first** via GPSWOX REST API. Hardware direct-pull (Concox TCP/UDP) is fallback only. |
| D2 | DFMS does **not** manage GPS devices or GPSWOX configuration — Nourish retains full control. |
| D3 | `overspeed` is a **display field only** in Phase 1. It will not trigger trip state changes automatically. |
| D4 | Map type is **terrain view** with initial zoom at ~100 km radius. |
| D5 | Vehicle assignment optimisation and availability forecasting are **deferred** — not in current sprint scope. |
| D6 | API contract (`gps-vts-integration.yaml`) will use the GPSWOX dashboard IP as a provisional base URL; exact API paths to be updated once Antu receives API documentation from GPSWOX. |

---

## Impact on Existing Documentation

| Document | Change Required |
|----------|----------------|
| `06-contracts/04-integration/gps-vts-integration.yaml` | Update server URL, add `overspeed` field, add provider metadata |
| `04-architecture/01-system-design/integration/external-systems.md` | Replace generic GPS section with GPSWOX-specific details |
| `08-development-guides/01-backend/05-services/integrations.md` | Update `GPSService` with GPSWOX settings keys and `overspeed` field |
| `03-backlog/02-stories/US-026-realtime-map-dashboard.md` | Add GPSWOX as confirmed data source, overspeed field, terrain map config |

---

## Next Meeting

To be scheduled after Antu receives API documentation from GPSWOX.  
**Agenda**: Review API endpoints, authentication method, rate limits, and confirm contract paths.
