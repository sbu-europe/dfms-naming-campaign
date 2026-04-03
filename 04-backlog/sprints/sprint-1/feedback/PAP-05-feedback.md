---
story: PAP-05
story_title: Tenant Onboarding — Register a New Client Organisation
jira_key: DFS-010
sprint: "Sprint 1"
feedback_date: 2026-03-31
recorded_by: Development Team
status: Open
---

# Feedback: PAP-05 — Tenant Onboarding

## FB-002 — Platform Admin: Resend Invitation Email

| Field | Value |
|-------|-------|
| **Source** | Internal |
| **Raised by** | DFMS Team |
| **Priority** | High |
| **Status** | Open |

When the initial welcome email to a Tenant Admin fails to deliver (e.g. SMTP failure, email bounced) or the 72-hour temporary password window expires, the Platform Admin must be able to trigger a resend from the admin panel — without having to re-create the tenant.

**Expected Behaviour:**
- A "Resend Welcome Email" action appears on the Tenant list/detail view in the platform admin
- Clicking it generates a **new** 12-char temporary password, resets the 72-hour expiry clock, and re-dispatches the welcome email
- The old temporary password is immediately invalidated
- Action is logged to `public.audit_logs`

**Acceptance Criteria Added:**
- [ ] "Resend Welcome Email" action is available on the `TenantAdmin` list view
- [ ] Action generates a new temporary password (old one is invalidated)
- [ ] Expiry window resets to 72 hours from the time of resend
- [ ] Welcome email is dispatched via Celery (non-blocking)
- [ ] Action is audit-logged

---

## Action Items

| # | Action | Description | Jira Sub-task | Source | Priority | Status |
|---|--------|-------------|---------------|--------|----------|--------|
| FB-002 | Resend Welcome Email admin action | Generate fresh temp password + reset 72h expiry + resend email, all audit-logged | DFS-010-12 | Internal | High | Pending |
| — | Tenant reactivation | Dedicated action to reactivate a suspended tenant — sets `tenant.status = active` | DFS-010-13 | Scope | High | Pending |
| — | Provisioning progress indicator | Schema creation takes 2–5 seconds; a progress indicator would improve UX | ~ | Scope | Low | Nice to Have |
| — | Subdomain auto-generation | Auto-generate subdomain from organisation name (editable before save) | ~ | Scope | Low | Nice to Have |

---

## Notes

- DFS-010-12 and DFS-010-13 are also tracked in the [PAP-05 story](../platform-admin-portal/PAP-05-tenant-onboarding.md) under `sub_tasks`
- These should be completed before Sprint 1 is marked fully Done in Jira
