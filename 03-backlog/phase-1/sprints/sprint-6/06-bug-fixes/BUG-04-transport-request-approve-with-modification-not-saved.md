---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-04
title: Approve with Modifications does not save updated Transport Request details
module: Distribution Manager — Transport Request
severity: High
status: Done
story_points: 3
assignee: Farhan Tanvir (farhanT23)
reported_date: 2026-06-19
confirmed_date: 2026-06-19
fixed_date: 2026-06-19
related_stories:
  - PRD §6.7.3.1.2 — Transport Request approval by Distribution Manager
  - E2E-01-2 — FG outbound journey (DM approval step)
affected_surfaces:
  - Distribution Manager — Transport Request review screen
  - Distribution Manager — Approve with Modifications screen
---

# BUG-04 — Approve with Modifications does not save updated Transport Request details

## Summary

When a Distribution Manager reviewed a Transport Request and used **Approve with Modifications**, the request was approved successfully but the updated details were not saved. The approved Transport Request still showed the original information.

Distribution Managers are expected to adjust transfer details — such as delivery date, transfer quantities, and remarks — before approving a request so that transport planning is based on accurate, up-to-date information.

**Status: Done** — fixed 2026-06-19 by Farhan Tanvir (farhanT23).

---

## Steps to Reproduce

1. Log in as **Distribution Manager**.
2. Open a Transport Request that is **Pending Approval**.
3. Change one or more details on the request (for example, delivery date, remarks, loading point, urgency, or vehicle details shown on the review screen).
4. Click **Approve with Modifications**.
5. Complete the approval steps (including mandatory remarks where prompted).
6. Open the approved Transport Request and review the saved details.

### Actual result (before fix)

The approval completed successfully, but the changes made in step 3 were **not reflected** on the approved Transport Request. The original values remained.

### Expected result

When **Approve with Modifications** is used, all changes made by the Distribution Manager during the approval process are saved and visible on the approved Transport Request.

---

## Impact

- **Incorrect transport data** — approved requests may carry outdated delivery dates, quantities, or other details.
- **Operational risk** — transport planning and downstream activities may be based on information the Distribution Manager believed they had corrected.
- **Broken approval workflow** — the purpose of “approve with modifications” is undermined if changes are not retained.
- **Rework and confusion** — staff may need to chase corrections outside the system or raise manual workarounds.
- **Trust in the system** — Distribution Managers may lose confidence that their review actions are recorded correctly.

---

## Observed behaviour

| Scenario | Outcome (before fix) |
|----------|----------------------|
| Distribution Manager changes details on the Transport Request review screen, then uses **Approve with Modifications** | Request is approved; **changes are not saved** |
| Distribution Manager uses **Approve** (without modifications) | Request is approved with original details (expected) |
| Product rule: Distribution Manager may modify transfer quantity, delivery date, and related details before approval | **Not reliably enforced** — modifications were not consistently retained |

### Fields affected (reported)

The following fields appeared editable during review but changes were not consistently saved when approving with modifications:

- Delivery date
- Transfer quantities (per product line)
- Remarks on the Transport Request
- Loading point (source POI)
- Urgency
- Vehicle type and number of vehicles (where shown)

---

## Resolution (2026-06-19)

| Scenario | Outcome (after fix) |
|----------|---------------------|
| Change delivery date on **Approve with Modifications** screen and approve | Revised delivery date is saved on the approved Transport Request |
| Change transfer quantities on **Approve with Modifications** screen and approve | Revised quantities and total are saved on the approved Transport Request |
| Update remarks during approve with modifications | Updated remarks are saved on the Transport Request |
| Fields not supported at approval time (loading point, urgency, vehicle details) | Shown as read-only on the review screen so users are not misled |
| **Approve** without modifications | Request approved with existing details unchanged (no regression) |
| Approve with modifications without mandatory remarks | Action blocked with a clear message |

---

## Acceptance Criteria

### AC-1 — Delivery date is saved

- [x] When a Distribution Manager changes the delivery date and approves with modifications, the approved Transport Request shows the **revised delivery date**.

### AC-2 — Transfer quantities are saved

- [x] When a Distribution Manager changes transfer quantities and approves with modifications, the approved Transport Request shows the **revised quantities** (and correct total).

### AC-3 — Remarks are saved

- [x] When a Distribution Manager updates remarks on the Transport Request and approves with modifications, the approved record shows the **updated remarks** (not only a note in the approval history).

### AC-4 — Other review-time changes are saved or clearly restricted

- [x] Any field shown as editable during Distribution Manager review is either **saved on approve with modifications** or **clearly read-only**, so users are not misled into thinking a change will be kept when it will not.

### AC-5 — Approve without modifications unchanged

- [x] Using **Approve** (without modifications) continues to approve the request with existing details, with no unintended changes.

### AC-6 — Mandatory remarks for modifications

- [x] When modifications are made, the system still requires approval remarks before completing the action.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-04-1 | Ensure delivery date changes are saved when approving with modifications | High | Done |
| BUG-04-2 | Ensure transfer quantity changes are saved when approving with modifications | High | Done |
| BUG-04-3 | Ensure Transport Request remarks and other review-time edits are saved or clearly not editable | High | Done |
| BUG-04-4 | Align review screen behaviour so users cannot change fields that will not be saved | Medium | Done |
| BUG-04-5 | Record test evidence for approve-with-modifications scenarios | Medium | Done |

---

## Test Plan

- [x] **Manual** — Open a pending Transport Request as Distribution Manager → change delivery date → approve with modifications → confirm revised date on approved request.
- [x] **Manual** — Change transfer quantities on one or more product lines → approve with modifications → confirm revised quantities and total on approved request.
- [x] **Manual** — Update remarks on the request → approve with modifications → confirm remarks on the approved request match what was entered.
- [x] **Manual** — Attempt to change loading point, urgency, or vehicle details → confirm outcome matches product rules (saved if editable, or field is not editable).
- [x] **Manual** — Approve without modifications → confirm original details unchanged (no regression).
- [x] **Manual** — Attempt approve with modifications without mandatory remarks → confirm action is blocked with a clear message.

---

## Definition of Done

- [x] All acceptance criteria met.
- [x] Test plan completed and results recorded.
- [x] No regression on standard **Approve** (without modifications).
- [x] Ticket status updated to **Done**.

---

## Notes

- This ticket covers the **Distribution Manager** review and approval of **Finished Goods** Transport Requests in **Pending Approval** status.
- Per product rules, Distribution Managers may review and adjust transfer details before forwarding approved requests to the Transport Department.
- Vehicle planning details may be completed later by Transport Planners; this ticket focuses on changes the Distribution Manager is expected to make at approval time.
