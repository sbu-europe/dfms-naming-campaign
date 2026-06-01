---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: VM-04
title: TDO Publish TO to Bidding Portal
epic: Vendor Management
status: Carry-over
carry_subtasks:
  - VM-04-10
  - VM-04-11
  - VM-04-12
  - VM-04-13
  - VM-04-14
feedback_items:
  - FB-016
  - FB-018
  - FB-019
source: ../../../sprint-4/08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md
---

# VM-04 — TDO Publish TO to Bidding Portal (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md`](../../../sprint-4/08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md)

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Sprint 4 Exit | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| VM-04-10 | Enforce `required_vehicle_count = 1` at publish — server + TDO UI | Pending | Publish API rejects if TO capacity model allows >1 vehicle. TDO UI enforces single-vehicle selection at publish step. | High | FB-016 |
| VM-04-11 | Bid requirement form **before** TO creation — TDO captures transport need / bidding parameters first | Pending | TDO fills bid requirement form (route, vehicle type, bidding window) before TO is created or linked. TO creation happens at or after requirement capture. Product decision: pre-created or created at publish — confirm and document. | High | FB-018 |
| VM-04-12 | Single TR → multiple TOs in one bid session | Pending | From one Transport Requirement, TDO can create multiple TOs linked to one bidding session for non-contractual vendor eligibility and award (aligns with TEVF-02-8) | Medium | — |
| VM-04-13 | E2E test coverage | Pending | Validate publish pre-checks, bidding window edits, cancel/republish, one-vehicle rule, and bid requirement handoff | Medium | — |
| VM-04-14 | Single-route constraint on bid publish | **New — Sprint 5** | Publish UI and API must reject a session that attempts to add more than one route per publish session (FB-019) | Medium | FB-019 |

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] `required_vehicle_count = 1` enforced at publish; API rejects >1 (VM-04-10, FB-016)
- [ ] Bid requirement form captured before TO creation; product decision documented (VM-04-11, FB-018)
- [ ] Single TR → multiple TOs in one bidding session (VM-04-12)
- [ ] Single-route constraint at publish enforced in UI and API (VM-04-14, FB-019)
- [ ] E2E sub-task VM-04-13 passes in staging

---

*Sprint 4 completion: ~75% | Sprint 5 target: 100%*
