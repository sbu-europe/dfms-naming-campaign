---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-03
title: Business Category can be cleared when editing a tenant
module: Tenant Management
severity: Medium
status: Done
story_points: 1
assignee: Farhan Tanvir (farhanT23)
reported_date: 2026-06-19
confirmed_date: 2026-06-19
fixed_date: 2026-06-19
related_stories:
  - PAP-05 (tenant onboarding — Sprint 1)
  - PAP-06 (tenant management — Sprint 1)
affected_surfaces:
  - Platform Admin — tenant edit screen
---

# BUG-03 — Business Category can be cleared when editing a tenant

## Summary

**Business Category** is a mandatory field when a Super Admin **creates** a new organisation in Platform Admin. When **editing** an existing organisation, the same field could be left empty and the record was saved successfully with no validation message.

This created inconsistent rules between create and edit, and could leave organisation records without a business category on file.

**Status: Done** — fixed 2026-06-19 by Farhan Tanvir (farhanT23).

---

## Steps to Reproduce

1. Log in to Platform Admin as Super Admin.
2. Create a new organisation and select a valid **Business Category** (e.g. Manufacturing, Distribution, FMCG, Agro, or Other).
3. Save the organisation.
4. Open the same organisation for editing.
5. Clear **Business Category** (select the blank option in the dropdown).
6. Click **Save** / **Update**.

### Actual result (before fix)

The organisation is updated successfully. **Business Category** is stored as empty.

### Expected result

The system blocks the save, shows a clear validation message on **Business Category** (same as on create), and does not allow the organisation to be saved without a selected category.

---

## Impact

- **Incomplete records** — organisations may exist without a business category, even though the field is required at onboarding.
- **Reporting and filtering** — list filters and reports that rely on business category may miss or misclassify affected organisations.
- **Inconsistent experience** — Super Admins are told the field is mandatory when creating an organisation but can remove it later without warning.
- **Operational risk** — downstream decisions that assume every organisation has a category may be based on incomplete data.

---

## Root Cause

**Business Category** was enforced as mandatory when **adding** a new organisation but was **not** enforced when **editing** an existing organisation. The edit screen therefore accepted an empty value that the create screen would reject.

### Verification (2026-06-19)

| Flow | Clear Business Category | Outcome (before fix) |
|------|-------------------------|----------------------|
| Create organisation | Attempt to save without selection | Blocked — validation message shown. |
| Edit organisation | Clear field and Save | **Allowed** — organisation updated; category removed. |

### Resolution (2026-06-19)

| Flow | Clear Business Category | Outcome (after fix) |
|------|-------------------------|---------------------|
| Create organisation | Attempt to save without selection | Blocked — *This field is required.* |
| Edit organisation | Clear field and Save | Blocked — same validation message; record not updated. |
| Edit organisation | Select a valid category and Save | Allowed — category stored correctly. |

---

## Acceptance Criteria

### AC-1 — Edit screen requires Business Category

- [x] Editing an organisation and clearing **Business Category** blocks save and shows a clear validation message on that field.
- [x] The message is understandable to a non-technical user (e.g. *This field is required.*).

### AC-2 — Valid selection still accepted

- [x] Editing an organisation and choosing a valid **Business Category** continues to work as today.
- [x] Changing from one valid category to another is allowed.

### AC-3 — Create behaviour unchanged

- [x] Creating an organisation without **Business Category** is still rejected as today.
- [x] Creating an organisation with a valid **Business Category** is still allowed.

### AC-4 — Other edit rules unchanged

- [x] All other edit-time validation rules (organisation name, contact details, subscription settings, etc.) continue to behave as before.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-03-1 | Require Business Category when editing an organisation in Platform Admin | High | Done |
| BUG-03-2 | Confirm create flow still requires Business Category correctly | High | Done |
| BUG-03-3 | Confirm validation message is clear and shown on the Business Category field | Medium | Done |
| BUG-03-4 | Record test evidence for blank and valid category scenarios on edit | Medium | Done |

---

## Test Plan

- [x] **Manual** — Create organisation with a valid Business Category → edit → clear Business Category → Save → validation error on Business Category; record not updated.
- [x] **Manual** — Edit organisation → select a different valid Business Category → Save → succeeds; new category stored correctly.
- [x] **Manual** — Create organisation without Business Category → still rejected (no regression).
- [x] **Manual** — Verify other edit validations (e.g. contact phone, organisation name) still work and are unaffected.

---

## Definition of Done

- [x] All acceptance criteria met.
- [x] Test plan completed and results recorded.
- [x] Create-flow requirement for Business Category unchanged.
- [x] Ticket status updated to **Done**.

---

## Notes

- The field is labelled **Business Category** in Platform Admin (under Organisation). Options: Manufacturing, Distribution, FMCG, Agro, Other.
- This ticket covers **editing an existing organisation** in Platform Admin. Organisation creation already treats the field as mandatory.
- Business Category is used for filtering the organisation list in Platform Admin; empty values may affect search and filter accuracy.
