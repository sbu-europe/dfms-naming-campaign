---
ref: FB-005
source: Client (post-demo)
sprint_raised: Sprint 3
sprint_resolved: Sprint 3
status: Resolved
priority: Low
affects:
  - ProductRequisition (model)
  - ProductRequisitionAdmin (apps/requisitions/admin.py)
  - PortShipmentAdmin (apps/requisitions/admin.py)
---

# FB-005 — Remove Redundant Remarks Field from Product Requisition

## Feedback

> "The Remarks field in the Product Requisition form duplicates the Special Instructions field. Both serve the same purpose (free-text notes from the requester). Please remove Remarks to simplify the form."

## Context

The `ProductRequisition` model had two free-text fields:
- `special_instructions` — labelled "Special Instructions" on FG PRs
- `remarks` — labelled "Remarks", present on both FG PRs and Port Shipments

The client noted that both fields were shown on the FG PR form and that requesters were unsure which to use.

## Resolution

The `remarks` field was removed from the FG PR admin form (`ProductRequisitionAdmin` fieldsets). The `special_instructions` field is retained as the single free-text notes field for FG PRs.

For **Port Shipments**, `remarks` serves a distinct purpose (broker/agent notes, external reference IDs) and is retained under its existing label.

> **Model field**: The `remarks` column was not dropped from the database — the field still exists on the model but is removed from the admin form for FG PRs. This avoids a migration while keeping the field available if needed programmatically or via API.

## Impact

- FG PR form: single notes field — "Special Instructions"
- Port Shipment form: "Remarks" field retained (different context)
- No model migration required
- Existing PRs with data in `remarks` are unaffected (field not deleted)

## Files Changed

| File | Change |
|------|--------|
| `apps/requisitions/admin.py` | Removed `remarks` from `ProductRequisitionAdmin` FG fieldset; retained in `PortShipmentAdmin` fieldset |
