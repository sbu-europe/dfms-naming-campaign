---
last_updated: 2026-06-09
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
1. Vendor taps a bid from Available Bids list (Non-Contractual only) — navigates by `bid_id`
2. App displays bid header (Bid ID) and member TO checklist when `to_count > 1`
3. App displays full TO details (lead TO summary):
   - Route (pickup → drop POI)
   - Product (name, quantity, category)
   - Vehicle requirements (type, capacity, required_vehicle_count)
   - Special instructions
   - Distance, estimated duration
   - Optional reference / guide rate (if provided at VM-04 publish — guidance only)
4. Vendor selects which member TOs they can execute (multi-TO bids only)
5. Vendor taps "Submit Bid" button
6. App displays bid submission form:
   - Proposed cost / rate (mandatory, BDT, > 0) — **one rate covering all selected TOs**
   - Offered vehicle count = number of selected TOs (1 per TO; FB-016)
   - Remarks (optional)
7. Vendor confirms bid
8. App validates client-side:
   - proposed_cost > 0
   - at least one TO selected on multi-TO bids
   - offered_vehicle_count == len(participating_to_ids)
   - submitted_at < bid_close_date
9. App submits via `POST /vendor/tenants/{schema}/bids/{bid_id}/submissions/` with `participating_to_ids[]`
10. Confirmation screen shows Bid ID + selected TO count. Outcome is observed on refresh (`vendor_bid_status` / per-TO award state).
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
  offered_vehicle_count: number;     // equals len(participating_to_ids); 1 per TO (FB-016)
  participating_to_ids: string[];    // required for multi-TO bids
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
- **Immutable after submit (vendor side):** No PATCH/edit endpoint. Default behavior; corrections via withdraw-and-resubmit only if policy enables it.
- **Withdraw policy (optional):** If enabled by tenant policy, vendor can withdraw before `bid_close_date`. Withdrawn bids are retained for audit (`WITHDRAWN`).
- **Late-bid prevention:** Server hard-blocks submissions after the **current effective** `bid_close_date` at request time (including bids submitted in-flight at deadline).
- **TDO may update `bid_open_date` / `bid_close_date` mid-session** (VM-04 AC-6). The vendor mobile uses the **server's authoritative** `bid_close_date` at submit time; a vendor's local cached value is **not authoritative**. If a vendor attempts to submit against a stale (later) cached deadline, the server returns `409` / `400 — bid window closed`. The vendor sees the corrected window on the next list refresh.
- **No other published parameter changes mid-session.** Bid form fields (vehicle type / capacity expectations / `required_vehicle_count`) reflect the parameters fixed at publish time; if TDO needs to change any of those, they must cancel + republish (a new bidding session appears).
- **No vehicle/driver identity at bid time:** Vendor only commits to rate + count. Specific vehicle/driver/helper are captured **post-award** in VM-07 (see `06-post-award-driver-vehicle-submission.md`).

### Backlog refs

- VM-05 (bid submission), VM-04 (publish parameters), VM-06 (evaluation).
- Feature context: [TEVF-02](../../../03-backlog/phase-1/sprints/sprint-4/09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md).

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Bid submit / confirm | `lib/presentation/feature/bids/` | `.../bids/`, `.../bidding-sessions/{id}/bids/` |

Maestro: `.maestro/flows/bids/`.
