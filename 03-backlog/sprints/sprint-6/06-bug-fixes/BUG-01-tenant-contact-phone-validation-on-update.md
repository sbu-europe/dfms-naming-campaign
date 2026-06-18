---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-01
title: Contact Phone validation missing on tenant update
module: Tenant Management
severity: Medium
status: Confirmed
story_points: 1
assignee: ~
reported_date: 2026-06-18
confirmed_date: 2026-06-18
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

---

## Steps to Reproduce

1. Log in to Platform Admin as Super Admin.
2. Create a tenant with a valid Contact Phone (e.g. `+8801812345678`).
3. Open the tenant for editing.
4. Change **Contact Phone** to an invalid value (e.g. `abc123!!!`, `01812345678`, or `not-a-phone`).
5. Click **Save**.

### Actual result

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

Confirmed in the development environment:

| Flow | Invalid value `abc123!!!` | Outcome |
|------|---------------------------|---------|
| Create tenant | Rejected | Validation message shown: phone must be a valid international number starting with + (e.g. +8801XXXXXXXXX). |
| Edit tenant | **Accepted** | Save succeeds; invalid value is stored. |

### Secondary gap

If tenant contact details are updated through the platform API (not only the admin edit screen), the same missing validation may allow invalid contact numbers there as well.

---

## Acceptance Criteria

### AC-1 — Edit screen validates Contact Phone

- Editing a tenant and entering an invalid Contact Phone blocks save and shows the same validation message as on create.
- Valid international phone numbers are accepted (including common formatted entry such as spaces or dashes).
- Leaving Contact Phone blank remains allowed (field is optional).

### AC-2 — Create behaviour unchanged

- Creating a tenant still rejects invalid Contact Phone values as today.

### AC-3 — Consistent rules across update paths (recommended)

- Any supported way to update tenant contact details applies the same Contact Phone rules as create.

---

## Proposed Fix

1. Apply the same Contact Phone validation on the tenant **edit** screen as on **create**.
2. Apply the same rules wherever tenant contact details can be updated, so behaviour is consistent.
3. Add checks (manual and automated) so invalid numbers cannot be saved on update again.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-01-1 | Enforce Contact Phone validation on tenant edit in Platform Admin | High | Not started |
| BUG-01-2 | Verify create flow still validates Contact Phone correctly | High | Not started |
| BUG-01-3 | Align tenant update API with the same Contact Phone rules (if in scope) | Medium | Not started |
| BUG-01-4 | Record test evidence that edit rejects invalid numbers and accepts valid ones | Medium | Not started |

---

## Test Plan

- [ ] **Manual** — Create tenant with valid phone → edit → enter `abc123!!!` → Save → validation error on Contact Phone; record not updated.
- [ ] **Manual** — Edit tenant → enter `+8801812345678` → Save → succeeds; number stored correctly.
- [ ] **Manual** — Edit tenant → clear Contact Phone → Save → succeeds (optional field).
- [ ] **Manual** — Create tenant with invalid phone → still rejected (no regression).
- [ ] **API** (if AC-3 in scope) — Attempt to update contact phone with an invalid value → request rejected with a clear error.

---

## Definition of Done

- [ ] All acceptance criteria met.
- [ ] Test plan completed and results recorded.
- [ ] Create-flow validation unchanged.
- [ ] Ticket status updated to **Fixed** when released.

---

## Notes

- The field is labelled **Contact Phone** in Platform Admin (under Contact). Reports may refer to it as "Contact Number".
- On create, the initial tenant admin phone is also validated; that section is not shown on edit. This ticket is about **Contact Phone** on the edit screen.
