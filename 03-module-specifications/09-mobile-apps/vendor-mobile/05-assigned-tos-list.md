---
last_updated: 2026-05-06
---

# Vendor Mobile — Assigned TOs: List & States

## Assigned TOs

**Purpose:** Display all TOs assigned to the vendor (either won bids or contractual allocations), scoped to tenants the vendor has joined and been approved for.

### Assigned TO list view (example data model)

```typescript
interface AssignedTO {
  to_number: string;
  to_id: string;

  // Route
  pickup_poi: string;
  drop_poi: string;
  distance_km: number;

  // Product
  product_name: string;
  quantity: number;
  unit: string;

  // Assignment Type
  assignment_type: 'BID_WON' | 'CONTRACTUAL';

  // Status
  to_status:
    | 'ASSIGNED'
    | 'DRIVER_ASSIGNED'
    | 'VEHICLE_ASSIGNED'
    | 'READY_FOR_DISPATCH'
    | 'IN_PROGRESS'
    | 'COMPLETED';

  // Post-Award Requirements
  requires_driver_assignment: boolean;
  requires_vehicle_assignment: boolean;

  // Dates
  assigned_date: Date;
  expected_pickup_date: Date;

  // Bid Details (If BID_WON)
  winning_bid_amount?: number;
}
```

### UI components

- **List View:** All assigned TOs sorted by expected pickup date
- **Filter Buttons:** All / Pending Assignment / In Progress / Completed
- **TO Card:** Shows status, route, product, action buttons
- **Actions:**
  - "Submit Driver & Vehicle Details" (if pending post-award submission)
  - "View Trip" (if in progress)

### Notifications (surface-level)

- **Bid Won:** "Congratulations! You won the bid for TO-2026-00456. Submit driver and vehicle details."
- **Contractual TO Assigned:** "New TO assigned: TO-2026-00789. Review details."

