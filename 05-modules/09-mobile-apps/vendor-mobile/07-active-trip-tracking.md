---
last_updated: 2026-05-13
---

# Vendor Mobile — Trips: Active Trip Tracking

> **Applies to:** Both Contractual and Non-Contractual vendors. The trip lifecycle does not branch on `assignment_type` — once a TO is in execution, status updates are identical. See [`12-vendor-type-flows.md`](12-vendor-type-flows.md).

## Active trip tracking

**Purpose:** Enable vendors to monitor trip progress in real-time for operational visibility. Vendor is **read-only** on trip / TO status (VM-08).

### Trip tracking view (example data model)

```typescript
interface ActiveTrip {
  trip_id: string;
  to_number: string;

  // Route
  pickup_poi: string;
  drop_poi: string;

  // Status
  trip_status:
    | 'ASSIGNED'
    | 'DISPATCHED'
    | 'IN_TRANSIT'
    | 'ARRIVED_AT_PICKUP'
    | 'LOADING'
    | 'IN_TRANSIT_TO_DROP'
    | 'ARRIVED_AT_DROP'
    | 'UNLOADING'
    | 'COMPLETED';

  // Driver & Vehicle (submitted post-award)
  driver_name: string;
  driver_phone: string;
  vehicle_registration: string;

  // Real-Time Location
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

- **Map View:** Driver location (GPS pin) with route polyline
- **Trip Card:** Status, driver, vehicle, ETA
- **Call Driver Button:** One-tap call to assigned driver
- **Status Timeline:** Completed + pending milestones

### Real-time updates

- Trip status via polling (every 30 seconds)
- GPS location refresh every 1 minute

