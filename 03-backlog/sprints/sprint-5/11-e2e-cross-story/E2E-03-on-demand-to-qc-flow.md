---
journey_id: E2E-03
title: On-Demand TO — Gate Creation → Product Line Items → QC Flag → Unloading
sprint: Sprint 5
stories_involved:
  - GT-02
  - LD-01
  - QC-01
  - CC-01
feedback_items:
  - FB-001
  - FB-006
  - FB-007
owner: QA Lead
status: Pending
---

# E2E-03 — On-Demand TO QC Flow

## Why This Journey Exists

GT-02 creates TOs at the gate without a planner TO. These gate-created TOs introduce product line items at origin (FB-007), which must flow into loading/unloading capture (FB-001) and then trigger QC based on the product-line `qc_required` flag (FB-006). This chain was impossible to test end-to-end in Sprint 4 because GT-02-12 (multi product line items) was Pending and QC-01-13 (`qc_required` flag trigger) was also Pending.

This journey confirms the three feedback items are handled as a connected system.

---

## Pre-conditions

- Gateman account at a POI configured for inbound RM (Supplier PO path)
- At least one product configured with `qc_required = True` and one with `qc_required = False`
- L/U points configured at the destination POI
- CC Officer and QC Supervisor accounts exist at the POI

---

## Scripted Path — Supplier PO (RM Inbound)

### Step 1 — Gateman creates on-demand RM TO with multiple product line items

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Gateman | Opens Supplier PO wizard | Document path selection available |
| Gateman | Fills PO number, supplier name, driver contact, remarks | Form accepts input |
| Gateman | Adds multiple product line items: Product A (`qc_required = True`) and Product B (`qc_required = False`) with quantities and QC flags (FB-007) | Each line item captured with product, quantity, and `qc_required` flag |
| Gateman | Submits | Gate-created RM TO created with unique TO number; `source = GATE`; `transfer_type = RM_SUPPLIER_INBOUND`; QC linkage flag derived from product line items; gate-in session linked |

### Step 2 — On-demand TO visible in Transport Orders

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Transport Planner | Opens Transport Orders list | Gate-created TO visible with `source = GATE` filter |

### Step 3 — Scale and CC

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Scaling Operator | Scale-in for the vehicle | CC queue updated |
| CC Officer | Views queue | Vehicle appears with RM product context |
| CC Officer | Flags TO for QC — system evaluates `qc_required` on product line items (FB-006) | Flag applied because Product A has `qc_required = True`; CC does not assign unloading point |

### Step 4 — QC decision

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| QC Supervisor | Views QC queue; TO visible because at least one product line has `qc_required = True` | QC not triggered for a TO where all products have `qc_required = False` |
| QC Supervisor | Creates sample + records Pass | CC unblocked for unloading point assignment |

### Step 5 — Unloading with product line items

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Unloading Personnel | Records unload start/end per product line item (FB-001) | Product A quantity and Product B quantity captured separately; not one aggregate |

### Step 6 — Chain completion

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Scaling Operator | Scale-out | Net weight calculated |
| Gateman | Gate-out | Guard matrix passes |
| Driver | POD submitted | TO moves to `completed` |
| Transport Planner | Closure | RM inbound closure rules satisfied; TO → `closed` |

---

## Negative Case — all products `qc_required = False`

| Step | Scenario | Expected Outcome |
|------|----------|-----------------|
| Step 3 | Gateman creates on-demand TO with only products where `qc_required = False` | CC does NOT flag TO for QC; bay assignment available immediately after scale-in; QC queue does not show this vehicle |

---

## Definition of Done

- [ ] Steps 1–6 complete without error in staging
- [ ] Multiple product line items captured at gate creation (FB-007)
- [ ] Each product line item captured separately at unloading (FB-001)
- [ ] QC triggered only when at least one product line has `qc_required = True` (FB-006)
- [ ] Negative case verified — no QC for all-non-required products
- [ ] No regression in GT-02-13, LD-01-10, QC-01-14, CC-01-12

---

*Stories: GT-02 · LD-01 · QC-01 · CC-01 | Feedback: FB-001, FB-006, FB-007 | Sprint 5*
