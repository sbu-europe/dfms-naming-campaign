---
last_updated: 2026-05-13
---

# Vendor Mobile — Trips: Completed Trip History

> **Applies to:** Both Contractual and Non-Contractual vendors. Rate fields are rendered conditionally based on `assignment_type`.

## Completed trip history

**Purpose:** Provide vendors with access to historical trip data for invoicing, performance analysis, and record-keeping.

### Rate visibility rule

- **`assignment_type=CONTRACTUAL`**: `bid_amount` / payable / contractual rate fields are **HIDDEN** in the list and detail view. The card shows "—" or omits the financial row entirely. `payment_status` is still shown so the vendor can track Invoiced/Paid milestones (without numeric rate).
- **`assignment_type=BID_WON`**: `bid_amount` shows the vendor's own winning bid (per-vehicle awarded × awarded_vehicle_count, or contracted lump per VM-06 award rules).

### Trip history view (example data model)

```typescript
interface CompletedTrip {
  trip_id: string;
  to_number: string;
  to_id: string;
  tenant_id: string;

  // Route
  pickup_poi: string;
  drop_poi: string;

  // Product
  product_name: string;
  quantity_delivered: number;
  unit: string;

  // Driver & Vehicle (submitted post-award in VM-07)
  driver_name: string;
  vehicle_registration: string;

  // Assignment + Financial
  assignment_type: 'BID_WON' | 'CONTRACTUAL';
  bid_amount?: number;                   // ONLY present when assignment_type=BID_WON
  awarded_vehicle_count?: number;        // ONLY present when assignment_type=BID_WON
  payment_status: 'PENDING' | 'INVOICED' | 'PAID';   // shown for BOTH types

  // Performance
  trip_duration_hours: number;
  on_time_delivery: boolean;
  qc_result?: 'PASS' | 'FAIL';

  // Documents (uploaded in VM-07 lifecycle)
  has_pod: boolean;
  has_grn_copy: boolean;
  has_invoice: boolean;

  // Dates
  dispatched_at: Date;
  completed_at: Date;
}
```

### UI components

- **List View:** Completed trips sorted by completion date (recent first).
- **Tenant badge:** Each card shows the tenant the trip ran for.
- **Assignment-type chip:** Each card shows **"Contractual"** or **"Bid Won"**.
- **Filters:**
  - By Date Range (Last 7 Days, Last 30 Days, Custom)
  - By Payment Status (All, Pending, Invoiced, Paid)
  - By Assignment Type (All, Contractual, Bid Won)
- **Trip Card:**
  - For `BID_WON`: shows `bid_amount` and payment_status.
  - For `CONTRACTUAL`: hides numeric rate; shows payment_status only.
- **Download POD:** Download proof of delivery PDF (if uploaded).
- **Upload Invoice:** Available only when `to_status=COMPLETED` and not yet uploaded (server-enforced).

### Use cases

| Use case | Contractual | Non-Contractual |
|---|---|---|
| Operational record / PODs | Same — accessible | Same — accessible |
| Invoice upload | Same — gated to Completed | Same — gated to Completed |
| **Cost / margin self-tracking** | Not visible in app (vendor knows their contract off-app) | Visible — `bid_amount` retained on each trip |
| Performance review (on-time, QC) | Same | Same |
| Dispute resolution | Same — POD + trip details available | Same |

### Backlog refs

- VM-03 (visibility scoping), VM-07 (POD/GRN/invoice lifecycle), VM-08 (status terminal `COMPLETED`/`CLOSED`).
