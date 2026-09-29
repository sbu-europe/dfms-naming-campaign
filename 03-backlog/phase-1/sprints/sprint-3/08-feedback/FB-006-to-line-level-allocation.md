---
ref: FB-006
source: Client (post-demo)
sprint_raised: Sprint 3
sprint_resolved: Sprint 3
status: Resolved
priority: High
affects:
  - TransportOrder (apps/transport/models.py)
  - TOLineItem — new model (apps/transport/models.py)
  - TransportOrderAdmin (apps/transport/admin.py)
  - create_from_tr_view (apps/transport/admin.py)
  - templates/admin/transport/transportorder/create_from_tr.html
  - apps/transport/migrations/
---

# FB-006 — Transport Order: Per-Line Product Allocation

## Feedback

> "In the Transport Order creation form, the allocated quantity was a single total figure for the entire TO. We need a breakdown per product line item so that a Challan (delivery note) can later be generated per product line."

## Root Cause

The original TO creation form had a single `allocated_quantity` field (total MT for the TO). There was no per-product breakdown — it was impossible to know how much of each product line item was being covered by a given TO. This blocked future Challan generation, which requires per-product quantities.

## Resolution

### New model: `TOLineItem`

A `TOLineItem` through-model was introduced to link a `TransportOrder` to each `TRLineItem` with a per-line allocated quantity:

```python
class TOLineItem(TenantModel):
    to = models.ForeignKey(TransportOrder, on_delete=models.CASCADE, related_name="line_items")
    tr_line_item = models.ForeignKey(TRLineItem, on_delete=models.CASCADE, related_name="to_allocations")
    allocated_quantity = models.DecimalField(...)  # in UOM (not kg)
```

The `TransportOrder.allocated_quantity` field now stores the **total weight in kg** — calculated as `SUM(line.allocated_quantity × line.tr_line_item.weight_per_unit)` across all `TOLineItem`s at creation time.

### Updated TO creation form

The 2-step creation flow was updated:

**Step 2 — Create TO form** now includes a per-line allocation table:

| Column | Notes |
|--------|-------|
| Product | Name from TR line item |
| UOM | Unit of measure |
| Requested qty (UOM) | Total `TRLineItem.allocated_quantity` |
| Already allocated (UOM + kg) | Sum of existing `TOLineItem.allocated_quantity` for this TR line across other TOs, plus equivalent weight |
| Allocate qty for this TO | Input field (UOM); validated ≤ remaining |
| Weight per unit (kg) | From `PRLineItem.weight_per_unit` |

### Validation

- Per-line: `input ≤ (tr_line_qty − already_allocated_by_other_TOs)`
- Total allocated across all lines must be > 0
- Both checks run server-side in `create_from_tr_view`

### Future Challan generation

Each `TOLineItem` record provides:
- Which product (`tr_line_item → pr_line_item → product`)
- How much (`allocated_quantity` in UOM)
- Equivalent weight (`allocated_quantity × weight_per_unit` kg)

This is sufficient for generating a per-product Challan at dispatch time.

## Database Migration

`apps/transport/migrations/0007_to_line_items.py` — adds the `TOLineItem` table. A `migrations.SeparateDatabaseAndState` wrapper was used to handle a previously dropped field (`transport_requisition` FK on `TransportOrder`) that was already removed from the database but still present in Django's migration history.

## Files Changed

| File | Change |
|------|--------|
| `apps/transport/models.py` | Added `TOLineItem` model |
| `apps/transport/migrations/0007_to_line_items.py` | Migration adding `TOLineItem` table |
| `apps/requisitions/migrations/0006_to_line_items.py` | Companion migration to sync model options on `TransportRequisition` |
| `apps/transport/admin.py` | `create_from_tr_view` rewritten — builds per-line allocation context, validates per-line, creates `TOLineItem` records on save |
| `templates/admin/transport/transportorder/create_from_tr.html` | TO creation form updated with per-line allocation table |
| `05-modules/05-transport/transport-order-management.md` | §2.2 `TOLineItem` model documented; §4.2 creation form table updated |
| `03-backlog/phase-1/sprints/sprint-3/05-transport/02-transport-orders.md` | AC-1 and sub-task TO-01-1 updated to reflect `TOLineItem` |
