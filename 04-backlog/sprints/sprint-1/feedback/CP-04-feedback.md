---
story: CP-04
story_title: Account Activation Flow for New Users via Invitation Link
jira_key: DFS-015
sprint: "Sprint 1"
feedback_date: 2026-03-31
recorded_by: Development Team
status: Open
---

# Feedback: CP-04 — Account Activation via Invitation Link

## FB-001 — Invitation URL: Email Pre-filled and Non-Editable

| Field | Value |
|-------|-------|
| **Source** | Internal |
| **Raised by** | DFMS Team |
| **Priority** | High |
| **Status** | Open |

When a Tenant Admin sends an invitation, the email included in the activation URL should be pre-filled **and locked** (non-editable) on the set-password page. Currently the email field is pre-populated via `?email=` query param but the user can modify it before submitting.

**Expected Behaviour:**
- Activation link: `https://<tenant>.dfms.app/activate/?token=<token>&email=<addr>`
- Email field on the activation page is read-only — rendered as plain text or a `disabled` input
- Form submission uses the email embedded in the token (server-side), not the value from the input — prevents tampering even if HTML is manipulated

**Acceptance Criteria Added:**
- [ ] Email field on the activation page is displayed as read-only (non-editable)
- [ ] Server validates email against the token record, not the submitted form value
- [ ] Attempting to submit a modified email returns a 400 error

---

## Action Items

| # | Action | Description | Jira Sub-task | Source | Priority | Status |
|---|--------|-------------|---------------|--------|----------|--------|
| FB-001 | Lock email field on activation page | Email should be read-only and validated server-side against the token | DFS-015-13 | Internal | High | Open |
| — | Resend Invitation | Add "Resend Invitation" action on user management list — regenerates the token, resets the 7-day Redis TTL, and resends the invitation email | DFS-015-11 | Scope | High | Pending |
| — | Bulk CSV Invitation | Implement `POST /api/users/invite/bulk/` — parse CSV, validate rows, create invitations in batch, return per-row success/failure report | DFS-015-12 | Scope | Medium | Pending |

---

## Notes

- Pending scope items (DFS-015-11, DFS-015-12) are also tracked in the [CP-04 story](../client-portal/CP-04-account-activation-invitation.md) under `sub_tasks`
- DFS-015-13 (FB-001) is a security fix and should be prioritised before the next client demo
- Bulk CSV invitation is a dependency for large client onboardings (e.g., Nourish rollout with 50+ operational users)
