---
last_updated: 2026-06-09
---

# Vendor Mobile — Integration & Design Decisions

## Integration points

### Upstream: Vendor Portal Module
- Mobile app syncs with web-based vendor portal (shared backend, same `vendor_type` per-tenant gating).

### Upstream: Vendor Bidding Module *(Non-Contractual path only)*
- Bid opportunities fetched from bidding system, server-filtered by `(vendor_id, tenant_id, vendor_type=NON_CONTRACTUAL)`.
- Bid submissions processed by bidding workflow (immutable after submit; optional withdraw).

### Upstream: TO assignment service *(Contractual path only)*
- TDO direct-assignment events surface as new TOs on the **Assigned TOs** tab with `assignment_type=CONTRACTUAL`; rate fields stripped server-side before returning to vendor.

### Downstream: Trip Management Module (TLS-01)
- Assigned TOs (both `assignment_type` values) reach `ready_for_dispatch` after **VM-07** vehicle/driver/helper confirmation.
- Vendor may **Start Trip** (`ready_for_dispatch` → lane-aware `driving_towards_*`) and **Complete Trip** (`delivered_unloaded` → `completed`) via `POST …/advance-status/`.
- All other TLS-01 transitions (gate, scale, loading, QC, driving legs) are **read-only** for the vendor; observed via VM-08 polling/refresh.
- See [`VENDOR-TRIP-LIFECYCLE.md`](../../../03-backlog/sprints/sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md).

## Key design decisions

### Why mobile app (not just web)?
- Mobile-friendly workflows for time-sensitive bid management.
- Mobile convenience for on-the-go vendor management.
- Better UX for post-award driver/vehicle detail submission (form entry, camera access for docs/POD).

### Why limited offline (not full offline)?
- Bid submission requires real-time validation (bid window open, no duplicates, server-side caps on `offered_vehicle_count`).
- Post-award actions require immediate backend updates (trip creation, dispatch readiness).
- Most vendors have reliable connectivity (office/warehouse environments).

### Why blind bidding?
- Prevents collusion (vendors cannot see competitors' bids).
- Ensures fair competition.
- Industry best practice for procurement.

### Why is `vendor_type` set by the **Tenant Admin** (not the vendor)?
- Vendor type encodes a **commercial relationship** that the tenant owns (contract terms, negotiated rates, fleet expectations). Letting the vendor self-declare would defeat the gating.
- Scoping it **per tenant** (not globally) lets vendors hold different commercial models with different tenants on the same platform — common in real-world logistics ops.
- Mobile shows `vendor_type` as **read-only** in the Tenant Directory and Profile tab.

### Why are contractual rates **hidden** in the mobile app?
- Contractual rates are negotiated and maintained off-app between Tenant and Vendor; exposing them in the app would duplicate (and risk diverging from) the contract record.
- Hiding the rate keeps the app focused on operational execution (vehicle, driver, POD, GRN, invoice) rather than commercial reconciliation.
- The server **MUST NOT** return rate fields for `assignment_type=CONTRACTUAL` TOs to the vendor surface; this is a backend invariant, not a client-side toggle.

### Why does the post-award form (VM-07) work the same for both vendor types?
- Once a TO is `ASSIGNED`, the operational requirements are identical (the truck still has to roll). Keeping a single form/contract reduces surface area for bugs and makes vendor training one path, not two.
- The only thing that differs at this point is **what the vendor sees about money** — see rate-hiding rule above.

### Why a `Bids` tab that is *conditionally hidden* (rather than always-shown disabled)?
- Reduces cognitive load for fully-contractual vendors (they never see a tab they can't use).
- Mixed vendors (NC for some tenants, C for others) still get the tab, filtered to their NC tenants.
- Implemented based on **any approved membership with `vendor_type=NON_CONTRACTUAL`** — re-evaluated on every membership change.


## Code map

| Concern | Doc / code |
|---------|------------|
| Endpoint map | [`../../../04-architecture/09-mobile/03-backend-integration/endpoint-map.md`](../../../04-architecture/09-mobile/03-backend-integration/endpoint-map.md) |
| Feature map | [`../../../04-architecture/09-mobile/04-feature-map.md`](../../../04-architecture/09-mobile/04-feature-map.md) |
| ApiEndpoints | `nourish-vendor-app/data/lib/remote/api_client/api_end_points.dart` |
