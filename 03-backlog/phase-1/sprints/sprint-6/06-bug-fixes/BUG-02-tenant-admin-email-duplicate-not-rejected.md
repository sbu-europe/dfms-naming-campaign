---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-02
title: Duplicate Admin Email allowed when creating a tenant
module: Tenant Management
severity: High
status: Open
story_points: 2
assignee: ~
reported_date: 2026-06-18
confirmed_date: 2026-06-18
fixed_date: ~
related_stories:
  - PAP-05 (tenant onboarding — Sprint 1)
  - PAP-06 (tenant management — Sprint 1)
affected_surfaces:
  - Platform Admin — tenant creation screen
---

# BUG-02 — Duplicate Admin Email allowed when creating a tenant

## Summary

When a Super Admin creates a new organisation (tenant) in Platform Admin, the system accepts an **Admin Email** that is already in use for another organisation. No validation message is shown, and the new organisation is created successfully.

Per product rules, each organisation’s initial admin email must be **unique across the platform** — the same address must not be assigned to more than one organisation.

**Status: Open** — confirmed 2026-06-18.

---

## Steps to Reproduce

1. Log in to Platform Admin as Super Admin.
2. Create a new organisation and enter an **Admin Email** that is already used by another organisation (e.g. an address already assigned when a previous organisation was created).
3. Complete the remaining required fields and click **Save** / **Create**.

### Actual result

The new organisation is created successfully. The duplicate Admin Email is accepted with no error.

### Expected result

The system blocks creation, shows a clear validation message on the **Admin Email** field (e.g. *Email already registered*), and does not create the organisation until a unique address is provided.

---

## Impact

- **Account conflicts** — the same email address may be linked to more than one organisation’s admin account.
- **User management** — invitations, activation, and password recovery for that email become ambiguous across organisations.
- **Data integrity** — platform-wide identity rules are not enforced at the point of onboarding.
- **Trust and support** — operators may believe each admin email is unique when it is not.

---

## Observed behaviour

| Check | Outcome |
|-------|---------|
| Create organisation with a new, unused Admin Email | Allowed — organisation created. |
| Create organisation with an Admin Email already used by another organisation | **Allowed** — organisation created; no validation message. |
| Product rule: Admin Email unique platform-wide | **Not enforced** on create. |

---

## Acceptance Criteria

### AC-1 — Duplicate Admin Email rejected on create

- [ ] Creating an organisation with an Admin Email that is already registered for another organisation blocks save and shows a clear validation message on **Admin Email**.
- [ ] The message is understandable to a non-technical user (e.g. *Email already registered*).

### AC-2 — Unique Admin Email still accepted

- [ ] Creating an organisation with an Admin Email that is not already in use continues to work as today.

### AC-3 — Consistent treatment of the same address

- [ ] The same email address is treated as a duplicate regardless of capitalisation (e.g. `Admin@Example.com` and `admin@example.com` are considered the same).

### AC-4 — Required fields unchanged

- [ ] All other create-time validation rules (organisation name, phone format where applicable, etc.) continue to behave as before.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-02-1 | Reject duplicate Admin Email when creating an organisation in Platform Admin | High | Open |
| BUG-02-2 | Confirm a new, unique Admin Email can still be used without regression | High | Open |
| BUG-02-3 | Confirm validation message is clear and shown on the Admin Email field | Medium | Open |
| BUG-02-4 | Record test evidence for duplicate and unique email scenarios | Medium | Open |

---

## Test Plan

- [ ] **Manual** — Note an Admin Email already used by an existing organisation → create a new organisation with the same address → Save → validation error on Admin Email; organisation not created.
- [ ] **Manual** — Create an organisation with a new, unused Admin Email → Save → succeeds.
- [ ] **Manual** — Attempt create with the same address in different letter case → rejected with the same validation message.
- [ ] **Manual** — Verify other create validations (e.g. organisation name, phone) still work and are unaffected.

---

## Definition of Done

- [ ] All acceptance criteria met.
- [ ] Test plan completed and results recorded.
- [ ] No regression on successful organisation creation with a valid, unique Admin Email.
- [ ] Ticket status updated to **Done**.

---

## Notes

- The field is labelled **Admin Email** in Platform Admin (under Tenant Admin on the create screen). It is also used as the organisation contact email when Contact Email is left blank.
- This ticket covers **organisation creation** only. Changing an existing organisation’s contact details is out of scope unless the same duplicate rule is already specified elsewhere.
- Duplicate Admin Email addresses have been observed in test environments with multiple organisations sharing the same address.
