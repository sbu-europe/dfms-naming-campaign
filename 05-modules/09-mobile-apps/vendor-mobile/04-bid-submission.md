---
last_updated: 2026-05-13
---

# Vendor Mobile — Bids: Bid Submission

> **Applies to:** Non-Contractual vendors only (for tenants where the vendor's membership `vendor_type=NON_CONTRACTUAL`).
> Contractual vendors **never** reach this screen — the entry point is hidden in the IA.

## Bid submission

**Purpose:** Allow non-contractual vendors to submit a structured bid (rate + offered vehicle count) for an open bidding session.

### Vendor-type gating

The bid submit endpoint MUST reject (`403`) any request where the calling vendor's membership for the TO's tenant is not `(APPROVED, NON_CONTRACTUAL)`.

### Bid submission workflow

```
1. Vendor taps a bid from Available Bids list (Non-Contractual only)
2. App displays full TO details:
   - Route (pickup → drop POI)
   - Product (name, quantity, category)
   - Vehicle requirements (type, capacity, required_vehicle_count)
   - Special instructions
   - Distance, estimated duration
   - Optional reference / guide rate (if provided at VM-04 publish — guidance only)
3. Vendor taps "Submit Bid" button
4. App displays bid submission form:
   - Proposed cost / rate (mandatory, BDT, > 0)
   - Offered vehicle count (mandatory integer ≥ 1; ≤ server-side max tied to TO demand)
   - Remarks (optional)
5. Vendor confirms bid
6. App validates client-side:
   - proposed_cost > 0
   - offered_vehicle_count >= 1
   - submitted_at < bid_close_date
7. App submits bid via API (server re-validates window + caps)
8. Confirmation screen: "Bid submitted." Outcome is observed by the vendor on the Bids tab (`vendor_bid_status` changes on refresh).
9. Bid is IMMUTABLE after submit (no field edit). Withdraw-before-deadline only if tenant policy allows.
```

### Bid data model (example)

```typescript
interface VendorBidSubmission {
  bid_id: string;
  bidding_session_id: string;
  to_id: string;
  vendor_id: string;
  tenant_id: string;

  // Bid Details (VM-05 contract)
  proposed_cost: number;             // mandatory > 0
  bid_currency: 'BDT';
  offered_vehicle_count: number;     // mandatory integer >= 1
  remarks?: string;                  // optional

  // Submission Metadata
  submitted_at: Date;
  submitted_via: 'MOBILE_APP' | 'WEB_PORTAL';

  // Status (VM-05 / VM-06 lifecycle)
  bid_status: 'SUBMITTED' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED';

  // Award metadata (populated on VM-06 award)
  awarded_vehicle_count?: number;    // <= offered_vehicle_count; set when ACCEPTED
}
```

### Business rules (Phase 1)

- **Tenant membership required:** Submit allowed only for tenants where the vendor is `APPROVED` and `NON_CONTRACTUAL` (per-tenant gate).
- **Blind bidding:** Vendors cannot see competitors' bid amounts or counts.
- **One bid per TO:** Vendor may have at most one bid in a non-terminal state per TO.
- **Immutable after submit:** No PATCH/edit endpoint. Default behavior; corrections via withdraw-and-resubmit only if policy enables it.
- **Withdraw policy (optional):** If enabled by tenant policy, vendor can withdraw before `bid_close_date`. Withdrawn bids are retained for audit (`WITHDRAWN`).
- **Late-bid prevention:** Server hard-blocks submissions after `bid_close_date` (including bids submitted in-flight at deadline).
- **No vehicle/driver identity at bid time:** Vendor only commits to rate + count. Specific vehicle/driver/helper are captured **post-award** in VM-07 (see `06-post-award-driver-vehicle-submission.md`).

### Backlog refs

- VM-05 (bid submission), VM-04 (publish parameters), VM-06 (evaluation).
- Feature context: [TEVF-02](../../../03-backlog/sprints/sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md).
