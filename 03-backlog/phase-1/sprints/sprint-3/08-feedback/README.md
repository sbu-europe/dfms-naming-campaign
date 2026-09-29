# Sprint 3 — Demo Feedback

> Feedback collected during and after the Sprint 3 demo. Each item is logged as a numbered entry and triaged to a target sprint for resolution.

---

## Feedback Log

| Ref | Source | Feedback | Affects | Priority | Target Sprint |
|-----|--------|----------|---------|----------|---------------|
| FB-001 | QA / Dev | `IntegrityError: duplicate key uniq_pr_line_number` when creating a Port Shipment with more than one cargo line item — `line_number` defaulted to `1` for all rows | Port Shipment creation (`PortShipmentAdmin`) | Critical | ✅ Fixed Sprint 3 — `a5e95df` |
| FB-002 | QA / Dev | RM Cargo Line Items and Arrival Notices & Documents sections on Port Shipment detail were editable by the Procurement Officer (should be read-only) | `PRLineItemInline`, `PRDocumentInline` | High | ✅ Fixed Sprint 3 — `2137a07` |
| FB-003 | QA / Dev | FG PR line item inline rows not visible for Distribution Officer/Manager (headers showed but table body was empty) — CSS rule `[id^="line_items-"] td > p:not(.help)` was hiding all readonly `<p>` values | `ProductRequisitionAdmin` inline, `custom.css` | High | ✅ Fixed Sprint 3 — `2137a07` |
| [FB-004](FB-004-pr-urgency-editable-post-submit.md) | Client (post-demo) | Requester (Depot / Feed Mill Officer) should be able to change the **Urgency** field on a submitted PR — operational priority can change after raising the requisition | `ProductRequisitionAdmin.get_readonly_fields`, `ProductRequisition` | Medium | ✅ Fixed Sprint 3 |
| [FB-005](FB-005-remove-remarks-field-from-pr.md) | Client (post-demo) | The **Remarks** field on Product Requisition is redundant with **Special Instructions** — client requests removal to avoid confusion | `ProductRequisition` model, `ProductRequisitionAdmin` fieldsets | Low | ✅ Fixed Sprint 3 |
| [FB-006](FB-006-to-line-level-allocation.md) | Client (post-demo) | Transport Order creation form allocated a single total quantity per TO — client requires **per-product-line allocation** so that a **Challan** can be generated per line item later | `TransportOrder`, `TOLineItem` model (new), `create_from_tr_view`, `create_from_tr.html` | High | ✅ Fixed Sprint 3 |

---

## How to Add Feedback

1. Add a row to the table above.
2. For detailed acceptance criteria, create a separate file: `FB-00X-short-title.md`.
3. Link the file in the `Ref` column.
4. Update the target sprint in the sprint plan if the item is accepted as a carry-over.
