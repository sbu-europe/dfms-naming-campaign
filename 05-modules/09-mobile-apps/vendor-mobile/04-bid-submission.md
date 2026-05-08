---
last_updated: 2026-05-06
---

# Vendor Mobile — Bids: Bid Submission

## Bid submission

**Purpose:** Allow vendors to submit bids with pricing for open bidding sessions.

### Bid submission workflow

```
1. Vendor taps a bid from Available Bids list
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

### Bid data model (example)

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

### Business rules (current)

- **Tenant membership required:** Vendor can submit bids only for tenants the vendor has joined and been approved for
- **Blind bidding:** Vendors cannot see competitors' bid amounts
- **One bid per TO:** Vendor can only submit one bid per TO
- **Bid update/withdraw policy:** Must match backend business rules for Phase 1 (edit/withdraw vs immutable)

