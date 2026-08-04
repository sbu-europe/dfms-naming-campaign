---
module: 09-tracking
specification: GPS-based vehicle maintenance (Phase 2 stub)
version: 0.1
phase: Phase 2
last_updated: 2026-07-24
ssot: true
prd_sections: [6.5.10]
status: Not started
---

# GPS-Based Vehicle Maintenance — Phase 2 Stub (SSOT)

**PRD §6.5.10** is **out of Phase 1 scope**. This stub exists so the tracking module remains complete as SSOT and agents do not invent Phase 1 delivery for maintenance-from-GPS.

---

## PRD intent (not implemented)

- Cumulative distance from GPS / IoT odometer (device-capability dependent)
- Distance since last service; remaining distance to next service
- Configurable maintenance thresholds (e.g. 5k / 10k / 20k km)
- Usage indicators: average daily distance, high-load route frequency, idle vs movement ratio
- Associate GPS mileage with vehicle maintenance records

---

## Phase 1 reality

| Item | Status |
|------|--------|
| GPS odometer → maintenance workflow | **Not implemented** |
| Fleet supervisor / DS-01 maintenance | Separate module — **manual / operational**, not GPS-odometer driven |
| `TripActivitySegment.route_length_km` / engine hours | Trip activity metrics only — **not** maintenance thresholds |

See: [../08-fleet-management/vehicle-management.md](../08-fleet-management/vehicle-management.md), fleet supervisor docs.

---

## When Phase 2 starts

1. Create Sprint backlog story under GPS / Fleet (link here).
2. Define device capability matrix (which trackers expose reliable odometer).
3. Extend this stub into a full module spec; update [prd-as-built.md](prd-as-built.md) §6.5.10 to Partial/Done.

**Do not** mark §6.5.10 Done based on Live GPS or activity segments alone.
