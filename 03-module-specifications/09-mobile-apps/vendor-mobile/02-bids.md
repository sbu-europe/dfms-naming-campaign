---
last_updated: 2026-05-05
---

# Vendor Mobile Application — Bids (List + Submission)

## Available Bids View

**Purpose:** Enable vendors to discover transport opportunities and submit competitive bids for non-contractual TOs, scoped to tenants the vendor has joined and been approved for.

### Bid List View

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
  required_vehicle_type: string;    // e.g., "HEAVY_TRUCK"
  required_capacity_tons: number;
  
  // Bidding Details
  bid_open_date: Date;
  bid_close_date: Date;
  time_remaining: string;           // e.g., "2 hours 15 mins"
  
  // Bid Status
  vendor_bid_submitted: boolean;    // Has this vendor already bid?
  vendor_bid_amount?: number;       // If already bid
  
  // Metadata
  urgency: 'URGENT' | 'NORMAL';
}
```

**UI Components:**
- **List View:** All open bids sorted by urgency and bid close time
- **Filter Buttons:**
  - All Bids
  - Bids I've Submitted
  - Urgent Only
- **Search:** By TO number, pickup/drop POI, product name
- **Bid Card:** Tap to view full TO details and submit bid

**Notifications:**
- **New Bid Published:** Push notification "New bidding opportunity: TO-2026-00456"
- **Bid Closing Soon:** Alert when 1 hour remaining

---

## Bid Submission

**Purpose:** Allow vendors to submit competitive bids with pricing.

### Bid Submission Workflow

```
1. Vendor taps bid from Available Bids list
2. App displays full TO details:
   - Route (pickup → drop POI)
   - Product (name, quantity, category)
   - Vehicle requirements (type, capacity)
   - Special instructions
   - Distance, estimated duration
3. Vendor taps "Submit Bid" button
4. App displays bid submission form:
   - Bid amount (currency: BDT)
   - Additional notes (optional)
5. Vendor confirms bid
6. App validates:
   - Bid amount > 0
   - Bid submitted before close time
7. App submits bid via API
8. Confirmation: "Bid submitted! You'll be notified if you win."
```

### Bid Data Model

```typescript
interface VendorBidSubmission {
  bid_id: string;
  to_id: string;
  vendor_id: string;
  
  // Bid Details
  bid_amount: number;
  bid_currency: 'BDT';
  additional_notes?: string;
  
  // Submission Metadata
  submitted_at: Date;
  submitted_via: 'MOBILE_APP' | 'WEB_PORTAL';
  
  // Status
  bid_status: 'SUBMITTED' | 'AWARDED' | 'REJECTED' | 'WITHDRAWN';
}
```

### Business Rules

- **One Bid Per TO:** Vendor can only submit one bid per TO (no re-bidding after submission)
- **Immutable Bids:** Once submitted, bid amount cannot be changed (ensures fairness)
- **Blind Bidding:** Vendors cannot see competitors' bid amounts
- **Tenant membership gate:** Vendor can submit bids only for tenants the vendor has joined and been approved for

