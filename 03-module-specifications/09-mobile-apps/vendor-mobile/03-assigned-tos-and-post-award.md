---
last_updated: 2026-05-05
---

# Vendor Mobile Application — Assigned TOs and Post-Award Actions

## Assigned TOs

**Purpose:** Display all TOs assigned to the vendor (either won bids or contractual allocations), scoped to tenants the vendor has joined and been approved for.

### Assigned TO List View

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
  to_status: 'ASSIGNED' | 'DRIVER_ASSIGNED' | 'VEHICLE_ASSIGNED' | 'READY_FOR_DISPATCH' | 'IN_PROGRESS' | 'COMPLETED';
  
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

**UI Components:**
- **List View:** All assigned TOs sorted by expected pickup date
- **Filter Buttons:**
  - All / Pending Assignment / In Progress / Completed
- **TO Card:** Shows status, route, product, action buttons
- **Action Buttons:**
  - "Assign Driver & Vehicle" (if pending)
  - "View Trip" (if in progress)

**Notifications:**
- **Bid Won:** "Congratulations! You won the bid for TO-2026-00456. Assign driver and vehicle."
- **Contractual TO Assigned:** "New TO assigned: TO-2026-00789. Review details."

---

## Post-Award Actions: Driver & Vehicle Assignment

**Purpose:** After winning a bid or receiving a contractual TO, vendor must assign a specific driver, vehicle, and helpers (if required) before trip can be dispatched.

### Assignment Workflow

```
1. Vendor taps "Assign Driver & Vehicle" on assigned TO
2. App displays assignment form:
   - Driver info (name, phone, NID/license)
   - Vehicle info (registration/number, type, capacity)
   - Helpers (optional: name + NID)
3. Vendor fills required info
4. App validates:
   - Vehicle capacity >= TO quantity
   - Vehicle type matches TO requirements
5. Vendor submits assignment
6. App updates TO status → 'READY_FOR_DISPATCH'
7. Trip created and assigned to driver
8. Driver receives notification: "New trip assigned: Trip-2026-01234"
```

### Assignment Data Model

```typescript
interface PostAwardAssignment {
  to_id: string;
  vendor_id: string;
  
  // Assignments
  driver_name: string;
  driver_phone: string;
  driver_nid_or_license: string;

  vehicle_number: string;
  vehicle_type: string;
  vehicle_capacity_tons: number;

  helpers?: Array<{ name: string; nid: string }>;
  
  // Metadata
  assigned_by: string;              // Vendor user ID
  assigned_at: Date;
  assigned_via: 'MOBILE_APP' | 'WEB_PORTAL';
}
```

