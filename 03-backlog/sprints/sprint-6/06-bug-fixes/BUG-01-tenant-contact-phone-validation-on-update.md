---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-01
title: Contact Phone validation missing on tenant update
module: Tenant Management
severity: Medium
status: Done
story_points: 1
assignee: Farhan Tanvir (farhanT23)
reported_date: 2026-06-18
confirmed_date: 2026-06-18
fixed_date: 2026-06-18
related_stories:
  - PAP-05 (tenant onboarding — Sprint 1)
  - PAP-06 (tenant management — Sprint 1)
affected_surfaces:
  - Platform Admin — tenant edit screen
  - Tenant update via platform API (secondary)
---

# BUG-01 — Contact Phone validation missing on tenant update

## Summary

Contact Phone is validated when **creating** a tenant in Platform Admin, but **not** when **editing** an existing tenant. Invalid values (letters, special characters, wrong digit count) can be saved on update without a validation message.

**Status: Done** — fixed 2026-06-18 by Farhan Tanvir (farhanT23).

---

## Steps to Reproduce

1. Log in to Platform Admin as Super Admin.
2. Create a tenant with a valid Contact Phone (e.g. `+8801812345678`).
3. Open the tenant for editing.
4. Change **Contact Phone** to an invalid value (e.g. `abc123!!!`, `01812345678`, or `not-a-phone`).
5. Click **Save**.

### Actual result (before fix)

The tenant is updated successfully. The invalid Contact Phone is saved.

### Expected result

The system rejects the save, displays a clear validation message on the Contact Phone field (same as on create), and does not save the invalid value.

---

## Impact

- **Data integrity** — invalid contact numbers can be stored for a tenant.
- **Communication** — features that use the contact number may fail or behave incorrectly.
- **Inconsistent experience** — create enforces valid phone format; edit does not.

---

## Root Cause

Validation for Contact Phone is applied when **adding** a new tenant but is **not** applied when **editing** an existing tenant. The edit screen therefore accepts values that the create screen would reject.

### Verification (2026-06-18)

| Flow | Invalid value `abc123!!!` | Outcome (before fix) |
|------|---------------------------|----------------------|
| Create tenant | Rejected | Validation message shown. |
| Edit tenant | **Accepted** | Save succeeds; invalid value is stored. |

### Resolution (2026-06-18)

| Flow | Invalid value `abc123!!!` | Outcome (after fix) |
|------|---------------------------|---------------------|
| Create tenant | Rejected | *Enter a valid phone number (e.g. +8801XXXXXXXXX).* |
| Edit tenant | Rejected | Same validation message; record not updated. |
| API update (`PATCH`) | Rejected | 400 with same validation message. |

---

## Acceptance Criteria

### AC-1 — Edit screen validates Contact Phone

- [x] Editing a tenant and entering an invalid Contact Phone blocks save and shows the same validation message as on create.
- [x] Valid phone numbers are accepted (including common formatted entry such as spaces or dashes).
- [x] Leaving Contact Phone blank remains allowed (field is optional).

### AC-2 — Create behaviour unchanged

- [x] Creating a tenant still rejects invalid Contact Phone values as today.

### AC-3 — Consistent rules across update paths (recommended)

- [x] Tenant update API applies the same Contact Phone rules as create.

---

## Proposed Fix

1. Apply the same Contact Phone validation on the tenant **edit** screen as on **create**.
2. Apply the same rules wherever tenant contact details can be updated, so behaviour is consistent.
3. Add checks (manual and automated) so invalid numbers cannot be saved on update again.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-01-1 | Enforce Contact Phone validation on tenant edit in Platform Admin | High | Done |
| BUG-01-2 | Verify create flow still validates Contact Phone correctly | High | Done |
| BUG-01-3 | Align tenant update API with the same Contact Phone rules (if in scope) | Medium | Done |
| BUG-01-4 | Record test evidence that edit rejects invalid numbers and accepts valid ones | Medium | Done |

---

## Test Plan

- [x] **Manual** — Create tenant with valid phone → edit → enter `abc123!!!` → Save → validation error on Contact Phone; record not updated.
- [x] **Manual** — Edit tenant → enter `+8801812345678` → Save → succeeds; number stored correctly.
- [x] **Manual** — Edit tenant → clear Contact Phone → Save → succeeds (optional field).
- [x] **Manual** — Create tenant with invalid phone → still rejected (no regression).
- [x] **API** — Attempt to update contact phone with an invalid value → request rejected with a clear error.

---

## Definition of Done

- [x] All acceptance criteria met.
- [x] Test plan completed and results recorded.
- [x] Create-flow validation unchanged.
- [x] Ticket status updated to **Done**.

---

## Notes

- The field is labelled **Contact Phone** in Platform Admin (under Contact). Reports may refer to it as "Contact Number".
- On create, the initial tenant admin phone is also validated; that section is not shown on edit. This ticket is about **Contact Phone** on the edit screen.
- Validation message: *Enter a valid phone number (e.g. +8801XXXXXXXXX).*
