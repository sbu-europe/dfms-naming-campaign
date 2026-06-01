---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-07
title: Vehicle–Driver Confirmation + Post-Completion Uploads
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-07-1
  - VM-07-2
  - VM-07-3
  - VM-07-6
source: ../../../sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md
---

# VM-07 — Vehicle–Driver Submission (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md`](../../../sprint-4/08-vendor-management/VM-07-vehicle-driver-submission.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|---------------|---------------|----------|
| VM-07-1 | `GET` requirement context for TO — merge TO + publish params (VM-04) visible to assigned/winner vendor only | Partial | Complete API: winner or assigned vendor can read TO requirement context; other vendors receive 403 | Medium |
| VM-07-2 | Trip-start gate — block dispatch/start until vehicle–driver confirmation record exists | Partial | Ensure no trip-start transition is possible on vendor-fleet TOs without a confirmed vehicle–driver record | Medium |
| VM-07-3 | `POST .../vehicle-driver` — mandatory fields + vehicle type match + capacity ≥ TO requirement + optional helper list + optional driver NID | Partial | Complete validation: vehicle type must match TO requirement; vehicle capacity ≥ required; helper list optional; driver NID optional | Medium |
| VM-07-6 | E2E test coverage | Pending | Validate vehicle–driver confirmation, trip-start gate, substitution with reason, post-completion uploads, vendor-only access | Medium |

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Requirement context API returns TO + publish params to winner/assigned vendor only (VM-07-1)
- [ ] Trip-start blocked without vehicle–driver confirmation record (VM-07-2)
- [ ] Vehicle–driver POST validates vehicle type + capacity against TO requirement (VM-07-3)
- [ ] E2E sub-task VM-07-6 passes in staging

---

*Sprint 4 completion: ~60% | Sprint 5 target: 100%*
