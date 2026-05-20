---
last_updated: 2026-05-13
---

# Vendor Mobile — Post-Award: Driver/Vehicle/Helper Submission

> **Applies to:** **Both** Contractual and Non-Contractual vendors. This is the common execution-handoff step (VM-07) — the form and rules are **identical** regardless of how the TO got assigned. Only the **entry point** differs.

## Purpose

After receiving a TO assignment — by **winning a bid** (Non-Contractual) **or** by **direct contractual assignment** (Contractual) — the vendor must:

1. **Review TO / bid requirement context** (vehicle type, capacity, route, slot).
2. **Confirm** specific vehicle, driver, helper details against this TO **before** trip start.

**Phase 1 rule:** Vendors do **not** manage driver/vehicle master lists. Capture is a **per-TO** confirmation (not a reusable fleet profile). This applies equally to both vendor types.

> **Out of scope on this screen:** POD, GRN copy, and Invoice uploads are **NOT** part of the pre-trip post-award form. All three vendor document uploads are gated server-side to `to_status=COMPLETED` and happen later, from the **Completed Trip Details** screen (see [`08-completed-trip-history.md`](08-completed-trip-history.md)).

## Entry points (per vendor type)

> Phase 1 vendor mobile has **no notifications**. Both entry points are reached by the vendor opening the relevant tab and refreshing.

| Vendor type for this tenant | Entry point |
|---|---|
| **Contractual** | Vendor opens Assigned TOs tab → TO with `assignment_type=CONTRACTUAL` appears on refresh → TO Details → "Confirm Vehicle & Driver" |
| **Non-Contractual** | Vendor opens Bids tab → bid card flips to "Won" on refresh → vendor opens Assigned TOs tab → TO with `assignment_type=BID_WON` appears → TO Details → "Confirm Vehicle & Driver" |

Once inside this screen, **the form is identical** for both types.

## Submission workflow

```
1. Vendor opens an assigned TO (Assigned TOs tab → TO Details)
2. Vendor reviews surfaced TO / bid requirement context:
   - For BID_WON: shows route, product, required vehicle type/capacity, winning_bid_amount, awarded_vehicle_count
   - For CONTRACTUAL: shows route, product, required vehicle type/capacity, awarded_vehicle_count
                     (rate hidden — see 05-assigned-tos-list.md)
3. Vendor taps "Confirm Vehicle & Driver" (gate: required before trip start)
4. App displays confirmation form (per-TO one-off — Phase 1, **no document uploads on this screen**):
   - **Mandatory:**
     - Vehicle info: number, type, capacity
     - Driver info: name, phone
   - **Optional:**
     - Driver NID/License *(optional — may be added later via the update flow)*
     - Helpers — zero or more *(optional — each helper, if provided, captures name + NID)*
5. App validates:
   - Vehicle capacity >= TO required capacity
   - Vehicle type matches TO required vehicle type
   - All mandatory fields filled: vehicle number + type + capacity, driver name + phone
   - Optional fields (driver NID/License, helpers) are accepted if blank/empty; if provided, each helper entry must have **both** name and NID
6. Vendor confirms details
7. System marks TO as READY_FOR_DISPATCH (or equivalent)
8. Trip can be dispatched/started
9. **After trip `COMPLETED`** the vendor can upload **POD, GRN copy, and Invoice** from the Completed Trip Details screen (`08-completed-trip-history.md`). Server hard-blocks all three doc-type uploads before Completed.
```

## Update flow (post-confirmation)

- Vendor MAY update vehicle/driver/helper details against the same TO (e.g. breakdown, driver swap).
- Updates **require a reason** (free-text mandatory).
- Each update is logged (who/when/what changed/reason).
- **Substitution events emit Transport-visible event** (operational visibility for TDO/Transport Dept).
- See VM-07 acceptance criteria for the full update contract.

## Document upload rules (recap)

**All three vendor doc uploads are gated to `to_status=COMPLETED`. None of them appear on this pre-trip post-award form** — they live on the Completed Trip Details screen (`08-completed-trip-history.md`).

| Document | When uploadable | Vendor type | Notes |
|---|---|---|---|
| **POD** *(vendor record copy)* | **Only after** `to_status=COMPLETED` | Both | Required when TO/tenant policy mandates a vendor POD upload; uploaded from Completed Trip Details. Driver-side POD (DM-01) is a separate artifact captured by the driver at closure. |
| **GRN copy** | **Only after** `to_status=COMPLETED` | Both | Required when applicable to the delivery flow; uploaded from Completed Trip Details. |
| **Invoice** | **Only after** `to_status=COMPLETED` | Both | Uploaded from Completed Trip Details. |

Server hard-blocks all three before `COMPLETED` regardless of `doc_type`.

## Data model (example)

> This payload covers the **pre-trip post-award confirmation only** (vehicle / driver / helper). Vendor document uploads (POD, GRN copy, Invoice) are a separate post-Completed payload — see `08-completed-trip-history.md`.

```typescript
interface PostAwardAssignment {
  to_id: string;
  vendor_id: string;
  tenant_id: string;

  // Entry-point context (informational, not editable here)
  assignment_type: 'BID_WON' | 'CONTRACTUAL';

  // Required capture (VM-07) — mandatory fields
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_capacity_tons: number;

  // Optional capture (VM-07) — may be omitted at confirmation, added later via update flow
  driver_nid_or_license?: string;                 // optional
  helpers?: Array<{ name: string; nid: string }>; // optional; if present, name + nid both required per entry

  // Audit
  assigned_by: string;                                          // vendor user id
  assigned_at: Date;
  assigned_via: 'MOBILE_APP' | 'WEB_PORTAL';
  last_update_reason?: string;                                  // mandatory on PATCH
}
```

## Backlog refs

- VM-07 (vehicle/driver confirmation, updates with reason, audit, POD/GRN/invoice gating).
- VM-08 (lifecycle status that gates invoice upload).
- Feature context: [TEVF-03](../../../03-backlog/sprints/sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md).
