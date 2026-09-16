---
last_updated: 2026-05-13
---

# Vendor Mobile — Assigned TOs: List & States

> **Applies to:** **Both** Contractual and Non-Contractual vendors. This is the **convergence point** for both vendor-type flows — every assigned TO (from direct assignment OR bid win) lands here.

## Assigned TOs

**Purpose:** Display all TOs assigned to the vendor (either bid wins or contractual allocations), scoped to tenants the vendor has joined and been approved for.

### How TOs land here

| Source | `assignment_type` | Triggered by |
|---|---|---|
| TDO directly assigns TO to a contractual vendor | `CONTRACTUAL` | TEVF-01 (no bidding) |
| TDO awards a bidding session winner (single or part of split award) | `BID_WON` | VM-06 award (via TEVF-02) |

### Rate visibility rules (critical)

- **`assignment_type=CONTRACTUAL`**: rate fields (`winning_bid_amount`, contractual rate, payable amount) are **HIDDEN** from the vendor mobile app and the vendor portal. Backend MUST NOT return these fields for contractual TOs to the vendor surface.
- **`assignment_type=BID_WON`**: `winning_bid_amount` (and optionally `awarded_vehicle_count`) is **visible** to the vendor — it is the vendor's own bid that was accepted.

### Assigned TO list view (example data model)

```typescript
interface AssignedTO {
  to_number: string;
  to_id: string;
  tenant_id: string;                 // for tenant switcher + badge

  // Route
  pickup_poi: string;
  drop_poi: string;
  distance_km: number;

  // Product
  product_name: string;
  quantity: number;
  unit: string;

  // Assignment Type — drives entire UI rendering
  assignment_type: 'BID_WON' | 'CONTRACTUAL';

  // Status
  to_status:
    | 'ASSIGNED'
    | 'DRIVER_ASSIGNED'
    | 'VEHICLE_ASSIGNED'
    | 'READY_FOR_DISPATCH'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CLOSED';

  // Post-Award Requirements (VM-07)
  requires_driver_assignment: boolean;
  requires_vehicle_assignment: boolean;
  vehicle_driver_confirmed: boolean;

  // Dates
  assigned_date: Date;
  expected_pickup_date: Date;

  // Conditional: only present when assignment_type=BID_WON
  winning_bid_amount?: number;
  awarded_vehicle_count?: number;
}
```

### UI components

- **List View:** All assigned TOs sorted by expected pickup date.
- **Filter Buttons:** All / Pending Assignment / In Progress / Completed.
- **Card content (varies by assignment_type):**
  - Status badge, route, product
  - Assignment-type chip: **"Contractual"** or **"Bid Won"**
  - `winning_bid_amount` shown only for `BID_WON`
- **Actions:**
  - "Submit Driver & Vehicle Details" (`vehicle_driver_confirmed=false` and TO needs it) — entry to VM-07 flow
  - "View Trip" (if `to_status` ∈ `READY_FOR_DISPATCH`, `IN_PROGRESS`)

### TO Details screen (entry point to VM-07)

| Section | Contractual | Bid Won |
|---|---|---|
| Route + Product + Vehicle requirements | shown | shown |
| Rate / payable amount | **HIDDEN** | shows `winning_bid_amount` |
| Awarded vehicle count | shown (from contractual allocation) | shown (`awarded_vehicle_count`) |
| "Confirm Vehicle & Driver" CTA | shown if not confirmed | shown if not confirmed |
| POD / GRN / Invoice uploads | **Not on this screen** — all three uploads are gated to `to_status=COMPLETED` and live on **Completed Trip Details** (see `08-completed-trip-history.md`) | same |

### Discovery model (no notifications in mobile app)

Phase 1 vendor mobile has **no notifications**. Vendors see newly assigned TOs (Contractual direct assignment or Bid-Won outcome) by opening the Assigned TOs tab — list reloads on pull-to-refresh or tab focus. TO status transitions (VM-08: Assigned → In Progress → Completed → Closed) are picked up on subsequent refreshes / polling.

### Backlog refs

- VM-03 (visibility), VM-06 (award → BID_WON), TEVF-01 (CONTRACTUAL), VM-07 (next-step gate), VM-08 (status updates).

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Assigned TOs / bundles | `lib/presentation/feature/assigned_tos/` | `.../transport-orders/`, `.../transport-order-bundles/{id}/` |

Maestro: `.maestro/flows/tos/`.
