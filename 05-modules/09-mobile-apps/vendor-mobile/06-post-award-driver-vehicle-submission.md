---
last_updated: 2026-05-06
---

# Vendor Mobile — Post-Award: Driver/Vehicle/Helper Submission

## Purpose

After winning a bid (non-contractual) or receiving a contractual TO, the vendor must **see requirement context** for that TO, then **confirm** driver/vehicle/helper execution details before dispatch/trip start.

**Phase 1 rule:** Vendors do **not** manage driver/vehicle master lists. This is a **per-TO** confirmation (not a reusable fleet profile).

## Submission workflow

```
1. Vendor opens an assigned TO
2. Vendor reviews surfaced **TO / bid requirement** context (e.g. vehicle type, capacity expectations)
3. Vendor taps **Confirm driver & vehicle** (or equivalent)
4. App displays confirmation form:
   - Driver info (name, phone, NID/license)
   - Vehicle info (number, type, capacity)
   - Helpers (optional: name + NID)
5. App validates:
   - Vehicle capacity >= TO requirement
   - Vehicle type matches TO requirement
6. Vendor confirms details
7. System marks TO as READY_FOR_DISPATCH (or equivalent)
8. Trip can be dispatched/started
```

## Data model (example)

```typescript
interface PostAwardAssignment {
  to_id: string;
  vendor_id: string;

  driver_name: string;
  driver_phone: string;
  driver_nid_or_license: string;

  vehicle_number: string;
  vehicle_type: string;
  vehicle_capacity_tons: number;

  helpers?: Array<{ name: string; nid: string }>;

  assigned_by: string; // Vendor user ID
  assigned_at: Date;
  assigned_via: 'MOBILE_APP' | 'WEB_PORTAL';
}
```

