---
module: 09-tracking
specification: Dwell Time Tracking
prd_refs: ["§6.5.9 Dwell Time Tracking"]
related_stories: [GPS-04]
status: Delivered (core)
last_updated: 2026-08-06
---

# Dwell Time Tracking

## User Story

**As a** Transport Planner / Transport Distribution Officer  
**I want to** see how long vehicles stay at source and destination POIs  
**So that** I can spot bottlenecks and compare plan vs actual without relying on a single clock source.

## Business Context

**Dwell** is how long a vehicle spends at a facility. Excessive dwell often means loading delays, congestion, or documentation holds. PRD §6.5.9 requires dwell under the TO **Planned Milestone** view using three complementary sources — not GPS alone.

**Flow:**

```
Arrival logged → vehicle inside facility
  → Departure logged → geofence dwell = exit − entry
    → Operator compares Planned vs Gate vs Geofence on the TO
```

## Dwell glossary (do not conflate)

| Name | Meaning | Source |
|------|---------|--------|
| **Planned** | Planned time at source / destination from TO planning | TO / planning fields |
| **Real Time (Gate)** | Gate-out − gate-in (yard operations) | Gate / operations |
| **Geofence time** | Departure − Arrival at POI geofence | GPS entry / exit events |

All three may appear for **Source** and **Destination** legs on the TO.

## What is delivered vs gap

| Capability | Status | Notes |
|------------|--------|-------|
| Auto geofence dwell from entry/exit | **Done** | On departure event |
| Planned / Gate / Geofence on TO milestones | **Done** | |
| Visible on trip / history summary | **Done** | Live GPS history summary + TO admin |
| Flag when actual dwell exceeds **planned** | **Done** | Comparison on TO admin |
| Per-POI dwell threshold on POI master | **Not done** | Intentionally not used in Phase 1 |
| In-fence alerts / exception reporting pipeline | **Not done** | Deferred |
| Aggregated POI dwell reporting suite | **Partial** | Data available; full reporting deferred |

## Access & Permissions

| Action | Role |
|--------|------|
| View dwell on TO / history | Roles that can view the TO / Live GPS history |
| Manually set geofence dwell | **Nobody** — calculated from events |

## Business rules

- Geofence dwell uses entry and exit timestamps from [vehicle-arrival-departure.md](vehicle-arrival-departure.md).
- Gate dwell and geofence dwell answer different questions; both are valid.
- Phase 1 exception visibility is **planned vs actual** on the TO — not a separate push-notification exception centre.
- Dwell for operational GPS events follows origin/destination evaluation (same scope as arrival/departure).

## Dependencies

- **Requires:** Arrival/departure events (GPS-03), gate timestamps where used, TO planned milestones  
- **Enables:** Ops bottleneck analysis; Feeds Maps Dashboard flags when that surface ships  

## Related

- [Arrival / departure](vehicle-arrival-departure.md) · [Live GPS](live-gps-monitoring.md) · [Module hub](README.md)  
- Feedback: Sprint 6 FB-031 (planned + gate + geofence together)  
- Story: GPS-04  
