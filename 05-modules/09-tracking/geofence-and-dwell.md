---
module: 09-tracking
specification: Geofence product rules & dwell glossary
version: 1.0
phase: Phase 1
last_updated: 2026-07-24
ssot: true
prd_sections: [6.5.6, 6.5.7, 6.5.8, 6.5.9]
---

# Geofence & Dwell — Product Rules (SSOT)

Authoritative rules for POI geofencing and dwell. If backlog stories (GPS-02…04) or `apps/tracking/GEOFENCE_IMPLEMENTATION.md` disagree, **this document + code win**.

---

## 1. Geofence definition

| Attribute | As-built |
|-----------|----------|
| Shape | Circle only |
| Center | `POI.latitude`, `POI.longitude` |
| Radius | `POI.geofence_radius_meters` (DB default **200**) |
| Detection buffer | `GEOFENCE_DETECTION_BUFFER_METERS` (default **20**) added to radius |
| Inside test | `haversine(vehicle, center) ≤ radius + buffer` |
| One active geofence | Single radius field on POI (no multi-geofence entity) |
| Immediate effect | Each evaluation / live-map poll reads current DB radius (no radius cache) |

**Code:** `apps/tracking/geofence_service.py` — `haversine_distance_m`, `effective_geofence_radius_m`, `is_inside_geofence`

**Master data:** `apps/master_data/models.py` — `POI.geofence_radius_meters`  
**Admin:** Tenant users with `MasterData.POI.Write` can edit radius on POI form.  
**Not built:** dedicated `PATCH /api/v1/pois/{id}/geofence`, delete confirmation UX, geofence-specific audit log.  
**Partial:** `GEOFENCE_RADIUS_MIN` / `MAX` settings exist but are **not enforced** on the model/serializer.

---

## 2. Which POIs are evaluated? (critical product rule)

### Live map display

- Shows **all active, geocoded POIs** with geofence circles.
- Each vehicle row may include `inside_pois[]` / `inside_geofence` against those POIs.

### Event engine (ENTRY / EXIT logging)

On each GPS tick for a **trip**, `GeofenceService` evaluates **only**:

1. Transport order **origin** POI  
2. Transport order **destination** POI  
3. Plus any of those already marked **inside** in Redis (so EXIT can be detected)

There is **no** fallback that evaluates every active POI for event logging.

> **PRD wording** (“geofence for all active POIs”) is satisfied for **map display / boundary definition**.  
> **Operational arrival/departure/dwell events** are scoped to the trip’s **source and destination** POIs.

**Code:** `GeofenceService._transport_order_geofence_poi_ids` / `_pois_for_evaluation`

### Off-trip / idle vehicles

- Idle GPS trail/history is supported.
- Idle geofence event evaluation helpers are **no-ops** — no off-trip `GeofenceEvent` pipeline in Phase 1.

---

## 3. Events

| Event | `event_type` | When | Persisted fields |
|-------|--------------|------|------------------|
| Arrival | `entry` | Transition outside → inside | trip, transport_order, vehicle, poi, event_at, lat/lng, distance_m |
| Departure | `exit` | Transition inside → outside | same + **`dwell_minutes`** |

- Model: `GeofenceEvent` (`apps/tracking/models.py`)
- Presence: Redis `GeofencePresenceStore` (inside flag + entry timestamp)
- Append-only style usage; admin is **read-only**
- APIs: `GET /api/v1/tracking/geofence-events/`, `GET /api/v1/tracking/geofence-check/`

### Trip auto-transition (as-built)

On **entry** at origin/destination while trip is en-route:

| POI | New trip status |
|-----|-----------------|
| TO origin | `ARRIVED_AT_SOURCE` |
| TO destination | `ARRIVED_AT_DESTINATION` |

### What is **not** written

- `gps_tracking.is_geofence_event` is **not** set on entry/exit (column reserved; tests assert no marker rows). Events live only in `geofence_event`.
- TLS-01 timeline rows are **not** emitted from geofence events (deferred).

---

## 4. Dwell glossary (do not conflate)

DFMS uses **two different “dwell” concepts**:

| Name | Definition | Source | Typical UI |
|------|------------|--------|------------|
| **Geofence dwell** | Exit timestamp − entry timestamp at a POI geofence | `GeofenceEvent` ENTRY/EXIT | Live GPS history cards; TO admin “Geofence time” tier |
| **Gate dwell** | Gate-out − gate-in (yard operations) | Gate / operations module | TO admin “Real time (Gate)” tier |

**Planned dwell** on a TO leg is a planning threshold (from TO/TR planning), **not** a POI master geofence threshold.

### Calculation (geofence)

```
dwell_minutes = max(0, floor((exit_at − entry_at) / 60))
```

- Prefer Redis `entry_at`; else last ENTRY row for trip+POI.
- Aggregated view: `apps/tracking/dwell_timeline_service.py` — Planned / Actual(Gate) / GPS tiers for source and destination.

---

## 5. Dwell threshold / exceptions — product decision

| Approach | Status |
|----------|--------|
| Per-POI dwell threshold on POI master (GPS-02) | **Not implemented** — intentionally not used |
| `GeofenceEvent.dwell_threshold_breached` + `GEOFENCE_DWELL_THRESHOLD_MINUTES` | **Removed** (migration `0011_remove_geofenceevent_dwell_threshold_breached`) |
| Flag vs **planned** dwell on TO admin | **Implemented** — `dwell_timeline_admin_legs()` sets `dwell_exceeded` when gate or geofence dwell **>** planned minutes |
| In-fence periodic alerts / reporting exceptions pipeline (GPS-04) | **Not implemented** |

**Phase 1 product rule:** dwell exceptions visible in TO admin Planned Milestones comparison only. No alert notifications from geofence dwell.

---

## 6. Presence tracking (POI ↔ vehicle)

| Capability | Status |
|------------|--------|
| Vehicle currently inside which POIs | **Done** on live-map (`inside_pois`) |
| List of vehicles currently inside POI X | **Missing** (GPS-05-5) |
| Live entry time + duration-so-far on map | **Missing** on payload (Redis has entry for engine only) |

---

## 7. Related documents

- Matrix: [prd-as-built.md](prd-as-built.md)
- Architecture: [gt06-server.md](gt06-server.md)
- POI master (radius field): [../02-master-data/poi-management.md](../02-master-data/poi-management.md)
- Gate dwell (ops): [../06-poi-operations/gate-management.md](../06-poi-operations/gate-management.md)
