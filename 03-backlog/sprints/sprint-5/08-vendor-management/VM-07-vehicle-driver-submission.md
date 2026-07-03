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
>
> **Trip lifecycle & status model:**
> [`VENDOR-TRIP-LIFECYCLE.md`](VENDOR-TRIP-LIFECYCLE.md)

---

## Trip management context (VM-07 gate)

VM-07 sits **before** the vendor Start Trip action in the execution chain:

1. Vendor confirms vehicle / driver / helper → TO reaches `ready_for_dispatch`
2. **Trip-start gate (VM-07-2)**: `POST …/advance-status/` (Start Trip) is rejected until confirmation record exists
3. After confirmation, vendor may Start Trip → lane-aware `driving_towards_source` or `driving_towards_destination`
4. Vendor cannot complete until yard chain reaches `delivered_unloaded` (see TEVF-03 / VM-03)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority |
|---|----------|---------------|---------------|----------|
| VM-07-1 | `GET` requirement context for TO — merge TO + publish params (VM-04) visible to assigned/winner vendor only | Done | Complete API: winner or assigned vendor can read TO requirement context; other vendors receive 403 | Medium |
| VM-07-2 | Trip-start gate — block dispatch/start until vehicle–driver confirmation record exists | Done | Ensure no trip-start transition is possible on vendor-fleet TOs without a confirmed vehicle–driver record | Medium |
| VM-07-3 | `POST .../vehicle-driver` — mandatory fields + vehicle type match + capacity ≥ TO requirement + optional helper list + optional driver NID | Done | Complete validation: vehicle type must match TO requirement; vehicle capacity ≥ required; helper list optional; driver NID optional | Medium |
| VM-07-6 | E2E test coverage | Pending | Validate vehicle–driver confirmation, trip-start gate, substitution with reason, post-completion uploads, vendor-only access | Medium |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Requirement context API returns TO + publish params to winner/assigned vendor only (VM-07-1)
- [x] Trip-start blocked without vehicle–driver confirmation record (VM-07-2)
- [x] Vehicle–driver POST validates vehicle type + capacity against TO requirement (VM-07-3)
- [ ] E2E sub-task VM-07-6 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
