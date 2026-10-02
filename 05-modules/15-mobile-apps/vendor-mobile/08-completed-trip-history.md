---
last_updated: 2026-09-17
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

---

## Post-trip Tenant Rating (VRS-02)

> **Story:** [VRS-02 — Vendor rates tenant (mobile)](../../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md)

When a TO reaches `COMPLETED` / `CLOSED`, the backend automatically creates a **pending `TenantRating`** for the assigned vendor (symmetric to how `VendorRating` is created for the tenant). The vendor is prompted to rate their experience from the Completed Trip Details screen.

### Trigger & visibility

- A **"Rate your experience"** / **"Rate Tenant"** CTA appears in the Completed Trip Details screen when:
  - `to_status == COMPLETED`
  - A pending (not yet submitted) `TenantRating` exists for this TO + vendor
- Once submitted (`is_submitted=True`), the CTA is replaced by a **read-only submitted rating card** showing the vendor's own score, answered questions, and comment.
- Rating is **not** shown for TOs that have no TenantRating row (e.g. non-vendor-fleet TOs where tenant rating is not applicable).

### Rating form (VRS-02)

| Element | Rule |
|---------|------|
| **Overall score** | Required **1–5 star** selector (single control) |
| **Questions** | Exactly **3** randomly selected Yes/No questions from the active TENANT pool, locked on first form load |
| **Answer UI** | **Radio buttons**: Yes · No — each required on submit |
| **Overall comment** | Optional, max 1 000 characters |

### API flow (vendor mobile)

```
GET  /api/v1/vendor/transport-orders/<to_id>/rate-tenant/form/
     → {pending_rating, locked_questions[3]}

POST /api/v1/vendor/transport-orders/<to_id>/rate-tenant/submit/
     Body: { score, answers:[{question_id, answer}×3], overall_comment? }
     → submitted rating with rolling Tenant aggregate update

GET  /api/v1/vendor/transport-orders/<to_id>/rate-tenant/
     → read-only submitted rating (for own-view after submit)
```

### Type interface addition

```typescript
interface CompletedTrip {
  // ... existing fields ...

  // VRS-02 — Tenant Rating (Phase 2)
  tenant_rating?: {
    is_submitted: boolean;
    score?: number;                            // 1–5, present after submit
    overall_comment?: string;
    answers?: Array<{
      question_text: string;
      answer: boolean;                         // true=Yes, false=No
    }>;
    submitted_at?: Date;
  };
}
```

### UI components

- **Completed Trip Details — Rating section:**
  - If `tenant_rating` is absent or `to_status != COMPLETED`: section hidden.
  - If `tenant_rating.is_submitted == false`: show **"Rate Tenant"** primary button.
  - On tap: navigate to **Rate Tenant screen** (star picker → 3 Yes/No radio groups → comment field → Submit).
  - After submit: replace button with **read-only rating card** (star display, Q&A list, comment, submitted date).
- **List View card:** May surface a small "⭐ Rate" badge on cards where `tenant_rating.is_submitted == false` to draw attention.

### Tenant aggregate — join flow integration

Vendors browsing tenants (VM-02 Join Tenant) can see the aggregate `vendor_rating` + `vendor_rating_count` sourced from:

```
GET /api/v1/vendor/tenants/<schema>/rating-summary/
→ { average_rating: "3.82", rating_count: 47 }
```

This provides social proof before a vendor commits to joining a tenant.

### Theme rules (mobile)

Reuse existing Vendor App Flutter `ThemeData` / design tokens:
- Star selector: same widget used elsewhere in the app (or nearest Material/Cupertino equivalent already in-use).
- Yes/No radio groups: `RadioListTile` in existing app style — no new palette or one-off visual language.
- Submit button: existing primary button style.

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Completed history/details | `lib/presentation/feature/trips/` | `.../transport-orders/` (lifecycle filters) |

Maestro: `.maestro/flows/trips/`.
