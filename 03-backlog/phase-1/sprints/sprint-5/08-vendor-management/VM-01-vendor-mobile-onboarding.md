---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-01
title: Vendor Mobile Onboarding — Self-Registration, Docs & Company Profile
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-01-7
  - VM-01-9
  - VM-01-10
  - VM-01-11
  - VM-01-12
feedback_items:
  - FB-010
  - FB-011
  - FB-012
source: ../../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md
---

# VM-01 — Vendor Mobile Onboarding (Sprint 5 Carry-over)

> **Full story context, registration rules, document gating, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md`](../../../../sprint-4/08-vendor-management/VM-01-vendor-mobile-onbiorading.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-01-7 | Complete audit logging — registration attempts, document/profile mutations | Done | Ensure every registration attempt (success and failure), document upload, and profile change writes an audit record with user, timestamp, outcome | Medium | — |
| VM-01-9 | OTP verification on registration and sensitive account actions | Done | Implement OTP send/verify on: (1) vendor self-registration, (2) password change, (3) account deletion. OTP via SMS/email; configurable expiry. Backend + Vendor Mobile. | High | FB-010 |
| VM-01-10 | Forgot password + password reset flow | Done | Request link/OTP → token expiry → set new password. Available from Vendor Mobile login screen. Vendor email used as identifier. | High | FB-011 |
| VM-01-11 | Delete account from Profile — confirmation, soft-delete policy, audit trail | Done | Profile section action: confirm deletion → apply soft-delete or deactivation; vendor cannot log in after delete; historical bid/trip records retained for audit; audit log entry. | Medium | FB-012 |
| VM-01-12 | E2E test coverage | Pending | Validate registration, mandatory document gating, tenant join handoff, OTP verification, password recovery, and delete account flows | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Audit logging complete on registration attempts and document/profile mutations (VM-01-7)
- [x] OTP verification on registration and sensitive actions (VM-01-9, FB-010)
- [x] Forgot password + password reset flow (VM-01-10, FB-011)
- [x] Delete account with soft-delete policy and audit trail (VM-01-11, FB-012)
- [ ] E2E sub-task VM-01-12 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
