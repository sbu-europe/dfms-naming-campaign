---
last_updated: 2026-05-13
---

# Vendor Mobile — Tracks: Completed Trip History

> **Applies to:** Both Contractual and Non-Contractual vendors. Rate fields are rendered conditionally based on `assignment_type`.

## Completed trip history

**Purpose:** Provide vendors with access to historical trip data for **document uploads (POD, GRN copy, Invoice)**, invoicing, performance analysis, and record-keeping.

### Document upload gate (POD + GRN copy + Invoice)

**All three vendor doc uploads are gated to `to_status=COMPLETED`.** This screen (and its **Completed Trip Details** drill-down) is the **only** vendor mobile surface where these uploads happen — they are **not** available in the pre-trip post-award form (`06-post-award-driver-vehicle-submission.md`).

- The Completed Trip Details screen shows an **Uploads** section with three upload affordances:
  - **Upload POD** *(vendor record copy)* — required when TO/tenant policy mandates it.
  - **Upload GRN copy** — required when applicable to the delivery flow.
  - **Upload Invoice**.
- Server hard-blocks any upload request (any `doc_type`) before the TO reaches `COMPLETED`; the vendor app SHOULD disable the upload affordances until then.
- Multiple POD / GRN uploads are allowed; invoice is a single upload (server policy may differ — defer to VM-07).
- **Driver-side POD (DM-01 / POD-01)** is captured at trip closure by the driver in a separate app and gates **TO closure**. The vendor's POD here is a **record-copy** that happens **after** the TO is already Completed; the two are distinct artifacts.

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

  // Documents — all gated to to_status=COMPLETED; uploaded from this screen (VM-07).
  has_pod: boolean;        // vendor's POD record copy (separate from driver POD in DM-01)
  has_grn_copy: boolean;
  has_invoice: boolean;
  pod_attachments?: Array<{ file_id: string; uploaded_at: Date }>;
  grn_copy_attachments?: Array<{ file_id: string; uploaded_at: Date }>;
  invoice_attachment?: { file_id: string; uploaded_at: Date };

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
- **Uploads section (Completed Trip Details):** three upload affordances — **POD**, **GRN copy**, **Invoice**. All three enabled only when `to_status=COMPLETED` (server-enforced; client SHOULD also disable until then).
- **Download POD / GRN / Invoice:** vendor can download previously-uploaded attachments (if present).

### Use cases

| Use case | Contractual | Non-Contractual |
|---|---|---|
| **POD / GRN / Invoice uploads** | Same — **all three gated to Completed**, uploaded here | Same — **all three gated to Completed**, uploaded here |
| Operational record / PODs (download) | Same — accessible | Same — accessible |
| **Cost / margin self-tracking** | Not visible in app (vendor knows their contract off-app) | Visible — `bid_amount` retained on each trip |
| Performance review (on-time, QC) | Same | Same |
| Dispute resolution | Same — POD + trip details available | Same |

### Backlog refs

- VM-03 (visibility scoping), VM-07 (POD/GRN/Invoice upload contract — **all three gated to Completed**), VM-08 (status terminal `COMPLETED`/`CLOSED` that opens the upload gate).

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Completed history/details | `lib/presentation/feature/trips/` | `.../transport-orders/` (lifecycle filters) |

Maestro: `.maestro/flows/trips/`.
