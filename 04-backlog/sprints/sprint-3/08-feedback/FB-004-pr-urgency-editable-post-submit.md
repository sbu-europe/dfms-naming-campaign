---
ref: FB-004
source: Client (post-demo)
sprint_raised: Sprint 3
sprint_resolved: Sprint 3
status: Resolved
priority: Medium
affects:
  - ProductRequisition (model)
  - ProductRequisitionAdmin (apps/requisitions/admin.py)
---

# FB-004 — PR Urgency Editable After Submission

## Feedback

> "The requester (Depot / Feed Mill Officer) should be able to change the Urgency field on a submitted Product Requisition. Operational priority can change after the PR has already been raised — for example, an item marked Normal urgency may become Critical due to unexpected stock shortfall."

## Root Cause

`ProductRequisitionAdmin.get_readonly_fields` locked **all** editable fields once the PR status moved past `DRAFT`. This was correct for most fields (product lines, destination POI, delivery date) but overly restrictive for Urgency, which is an operational signal that can legitimately change at any time.

## Resolution

`get_readonly_fields` was updated to exclude `urgency` from the read-only list when the request user is the PR requester role (Depot / Feed Mill Officer), regardless of PR status:

```python
def get_readonly_fields(self, request, obj=None):
    fields = super().get_readonly_fields(request, obj)
    if obj and obj.status != PRStatus.DRAFT and _is_requester_role(request):
        # urgency remains editable post-submission; all other fields locked
        fields = [f for f in fields if f != "urgency"]
    return fields
```

All other fields (product lines, destination POI, delivery date, special instructions) remain fully read-only after submission.

## Impact

- No model change — `urgency` field existed; only the admin form behaviour changed
- No migration required
- Distribution Officer, Distribution Manager, and Procurement Officer views: `urgency` remains read-only (they do not own the PR)
- Downstream: urgency changes are visible immediately on TR creation and Transport Planning queue

## Files Changed

| File | Change |
|------|--------|
| `apps/requisitions/admin.py` | `ProductRequisitionAdmin.get_readonly_fields` — exclude `urgency` for requester role on non-draft PRs |
| `03-module-specifications/04-requisitions/product-requisition-management.md` | §12.3 updated — urgency exception documented in PR immutability rule |
