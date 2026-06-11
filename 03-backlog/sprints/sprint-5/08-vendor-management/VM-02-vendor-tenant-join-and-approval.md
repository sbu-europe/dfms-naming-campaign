---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-02
title: Vendor ↔ Tenant Join + Approval + Vendor Type Scoping
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-02-8
  - VM-02-9
feedback_items:
  - FB-017
source: ../../../sprint-4/08-vendor-management/VM-02-vendor-tenant-join-and-approval.md
---

# VM-02 — Vendor Tenant Join & Approval (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-02-vendor-tenant-join-and-approval.md`](../../../sprint-4/08-vendor-management/VM-02-vendor-tenant-join-and-approval.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-02-8 | Tenant Admin approve UI + API — enforce **exactly one** vendor type (`CONTRACTUAL` or `NON_CONTRACTUAL`) per approval | Done | UI: mutually exclusive radio or single-select; API: reject payload with both types selected or neither selected; validation error clear. Demo noted both types could be selected simultaneously. | High | FB-017 |
| VM-02-9 | E2E test coverage | Pending | Validate tenant directory, join request, approve/reject decisions, vendor-type scoping, tenant data access gates | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Exactly one vendor type enforced on approval: UI and API reject ambiguous payloads (VM-02-8, FB-017)
- [ ] E2E sub-task VM-02-9 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
