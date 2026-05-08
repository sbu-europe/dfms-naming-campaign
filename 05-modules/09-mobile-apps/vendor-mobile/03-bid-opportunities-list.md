---
last_updated: 2026-05-06
---

# Vendor Mobile — Bids: Bid Opportunities List

## Available Bids View

**Purpose:** Enable vendors to discover transport opportunities for **non-contractual** TOs, scoped to tenants the vendor has joined and been approved for.

### Bid List View (example data model)

```typescript
interface BidOpportunity {
  bid_id: string;
  to_number: string;

  // Route Details
  pickup_poi: {
    name: string;
    address: string;
  };

  drop_poi: {
    name: string;
    address: string;
  };

  distance_km: number;

  // Product Details
  product_name: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  quantity: number;
  unit: string;

  // Vehicle Requirements
  required_vehicle_type: string; // e.g., "HEAVY_TRUCK"
  required_capacity_tons: number;

  // Bidding Details
  bid_open_date: Date;
  bid_close_date: Date;
  time_remaining: string; // e.g., "2 hours 15 mins"

  // Vendor context
  vendor_bid_submitted: boolean;
  vendor_bid_amount?: number;

  // Metadata
  urgency: 'URGENT' | 'NORMAL';
}
```

### UI components

- **List View:** All open bids sorted by urgency and bid close time
- **Filter Buttons:** All Bids / Bids I've Submitted / Urgent Only
- **Search:** By TO number, pickup/drop POI, product name
- **Bid Card:** Tap to view full TO details and go to submission

### Notifications (surface-level)

- **New Bid Published:** Push notification "New bidding opportunity: TO-2026-00456"
- **Bid Closing Soon:** Alert when 1 hour remaining

