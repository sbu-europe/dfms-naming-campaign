---
last_updated: 2026-06-09
sprint_ref: ../../03-backlog/sprints/sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md
---

# Vendor Mobile — Tracks: Active Trip Tracking

> **Applies to:** Both Contractual and Non-Contractual vendors. The trip lifecycle does not branch on `assignment_type` — once a TO is in execution, status updates are identical. See [`12-vendor-type-flows.md`](12-vendor-type-flows.md).
>
> **Canonical status model:** [`VENDOR-TRIP-LIFECYCLE.md`](../../../03-backlog/sprints/sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md)

## Active trip tracking

**Purpose:** Enable vendors to monitor trip progress and perform the **two allowed lifecycle actions** (Start Trip, Complete Trip). All yard/driver intermediate steps are **read-only** for the vendor (VM-08).

### Vendor-initiated actions

| Action | Enabled when | API |
|--------|--------------|-----|
| **Start Trip** | `toStatus == readyForDispatch` and VM-07 confirmed | `POST …/advance-status/` `{ "status": "in_progress" }` |
| **Complete Trip** | `canCompleteVendorTrip == true` (`delivered_unloaded`) | `POST …/advance-status/` `{ "status": "completed" }` |

### Trip tracking view (example data model)

```typescript
interface ActiveTrip {
  trip_id: string;
  to_id: string;
  to_number: string;

  // Route
  pickup_poi: TripPoi;
  drop_poi: TripPoi;

  // TLS-01 execution (backend source of truth)
  execution_status: string;  // e.g. 'driving_towards_source', 'at_source', 'delivered_unloaded'
  sub_state?: string;        // yard overlay e.g. 'loading_started', 'unloading_started'
  flow_lane?: string;        // fg_outbound | fg_inbound | rm_inbound

  // Vendor display layer (mapped from execution_status + sub_state)
  trip_status:
    | 'assigned'
    | 'dispatched'
    | 'inTransit'
    | 'arrivedAtPickup'
    | 'loading'
    | 'inTransitToDrop'
    | 'arrivedAtDrop'
    | 'unloading'
    | 'completed';

  to_status:  // coarse bucket for action gating
    | 'assigned'
    | 'readyForDispatch'
    | 'inProgress'
    | 'completed'
    | 'closed';

  can_complete_vendor_trip: boolean;

  // Driver & Vehicle (submitted post-award — VM-07)
  driver_name: string;
  driver_phone: string;
  vehicle_registration: string;
  helpers?: Array<{ name: string; nid: string }>;

  // Real-Time Location (when available)
  current_location?: { lat: number; lng: number };
  distance_from_pickup_km?: number;
  distance_from_drop_km?: number;
  estimated_arrival_time?: Date;

  // Timestamps
  dispatched_at?: Date;
  pickup_completed_at?: Date;
  drop_completed_at?: Date;
}
```

### UI components

- **Status chip:** Prefer raw `execution_status` label; fall back to `trip_status`
- **4-milestone timeline:** Assigned → Loaded → In transit → Delivered
- **Trip Card:** Status, driver, vehicle, ETA
- **Call Driver Button:** One-tap call to assigned driver
- **Start Trip / Complete Trip:** Primary actions when gated conditions met

### Real-time updates

- Trip status via polling (~30 seconds on active trip detail)
- List refresh on tab switch (VM-03-10) and foreground (VM-08-3)
- Vendor does not push intermediate status changes — yard/driver/system advance TLS-01
