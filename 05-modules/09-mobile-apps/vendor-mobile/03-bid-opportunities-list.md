---
last_updated: 2026-05-13
---

# Vendor Mobile — Bids: Bid Opportunities List

> **Applies to:** vendors with `vendor_type=NON_CONTRACTUAL` for at least one approved tenant.
> If a vendor is Contractual for **every** approved tenant, the Bids tab is hidden (see `00-navigation-and-information-architecture.md`).

## Available Bids View

**Purpose:** Enable vendors to discover transport opportunities for **non-contractual** TOs, scoped to tenants the vendor has joined and been approved for **as Non-Contractual**.

### Vendor-type gating (server-side enforcement)

The bid list API SHALL filter by:

1. Vendor onboarding complete (VM-01).
2. Membership `status=APPROVED` for the tenant that owns the TO (VM-02).
3. Membership `vendor_type=NON_CONTRACTUAL` for that tenant (VM-02).
4. Vendor not on tenant blacklist (if blacklist exists).
5. Vendor rating ≥ tenant threshold (if rating configured — Phase 2+).

Any TO that does **not** meet all of (1)–(3) MUST NOT appear, even if the vendor has another approved-Non-Contractual tenant.

### Bid List View (example data model)

```typescript
interface BidOpportunity {
  bid_id: string;
  to_number: string;
  tenant_id: string;          // for tenant switcher + badge

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

  // Vehicle Requirements (from TDO publish — VM-04)
  required_vehicle_type: string;       // e.g., "HEAVY_TRUCK"
  required_capacity_tons: number;
  required_vehicle_count: number;      // from VM-04

  // Bidding Details
  bid_open_date: Date;
  bid_close_date: Date;
  time_remaining: string;              // e.g., "2 hours 15 mins"
  reference_rate?: number;             // optional guide rate (VM-04); not binding

  // Vendor context
  vendor_bid_submitted: boolean;
  vendor_bid_status?: 'SUBMITTED' | 'WITHDRAWN' | 'ACCEPTED' | 'REJECTED';
  vendor_bid_amount?: number;          // vendor's own bid only — never competitors'
  vendor_offered_vehicle_count?: number;

  // Metadata
  urgency: 'URGENT' | 'NORMAL';
}
```

### UI components

- **List View:** All open bids sorted by urgency then by bid close time.
- **Tenant badge:** Each card shows the tenant the bid belongs to (since the vendor may be Non-Contractual for multiple tenants).
- **Filter Buttons:** All Bids / Bids I've Submitted / Urgent Only.
- **Search:** By TO number, pickup/drop POI, product name.
- **Bid Card:** Tap → full TO details → go to submission (see `04-bid-submission.md`).

### Status badge on cards

| `vendor_bid_status` | Card badge |
|---|---|
| (none) | "Open — submit bid" |
| `SUBMITTED` | "Submitted" |
| `WITHDRAWN` | "Withdrawn" |
| `ACCEPTED` | "You won" (also surfaces in Assigned TOs tab) |
| `REJECTED` | "Not awarded" |

### Discovery model (no notifications in mobile app)

Phase 1 vendor mobile has **no notifications**. Vendors see new bids by opening the Bids tab (pull-to-refresh or tab focus triggers a list reload). Bid card metadata such as `time_remaining` and `vendor_bid_status` updates on each refresh.

### Bid window updates from TDO (read-only on mobile)

TDO is allowed to update the **bidding window timeline only** for an active session — `bid_open_date` and/or `bid_close_date` (see VM-04 AC-6). When that happens:

- `bid_open_date` and `bid_close_date` on the bid card pick up the new values on the **next list refresh**.
- `time_remaining` recomputes from the new `bid_close_date`.
- If the deadline was **shrunk**, the vendor sees the new (earlier) `bid_close_date`; **already-submitted bids stay valid**.
- If the deadline was **extended**, the vendor sees the new (later) `bid_close_date` and may still submit if they have not already.
- **No other published parameter** (`required_vehicle_type`, `required_capacity_tons`, `required_vehicle_count`, `reference_rate`) changes mid-session — those would only differ on a fresh bid session (after TDO cancel + republish).

### Out of scope on this screen

- Contractual TOs (no bid round) — those appear directly in **Assigned TOs** (see `05-assigned-tos-list.md`).
- Competitor bid amounts (blind bidding — see `11-integration-and-design-decisions.md`).

### Backlog refs

- VM-03 (portal views), VM-04 (TDO publish), VM-05 (bid submission).
- Feature context: [TEVF-02](../../../03-backlog/sprints/sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md).
