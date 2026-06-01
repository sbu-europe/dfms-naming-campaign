---
jira_key: DFS-056
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: CC-01
title: Command Center — Queue, Bay Assignment & Waiting Serial
epic: Command Center
status: Carry-over
story_points: 8
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - CC-01-5
  - CC-01-6
  - CC-01-7
  - CC-01-8
  - CC-01-9
  - CC-01-12
feedback_items:
  - FB-005
  - FB-006
source: ../../../sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md
---

# CC-01 — Queue, Bay Assignment & Waiting Serial (Sprint 5 Carry-over)

> **Full story context, business rules, QC handoff logic, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md`](../../../sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| CC-01-5 | Queue list API (GET) — eligible vehicles with filters: product type, urgency, status | DFS-056-5 | Pending | `GET /api/v1/command-center/queue?product_type=&urgency=&status=` — vehicles with completed scale-in and no active assignment | High |
| CC-01-6 | Bay assignment API (POST) — assign vehicle to L/U point | DFS-056-6 | Pending | `POST /api/v1/command-center/assignments` — validate product type / vehicle type against L/U point; warn on mismatch; update TO sub-state | High |
| CC-01-7 | Waiting serial issuance API (POST) — unique serial per L/U point, daily reset | DFS-056-7 | Pending | `POST /api/v1/command-center/waiting-serials` — serial unique per L/U point; multiple vehicles can hold serials for the same point simultaneously; serial counter resets at **12:00 AM daily** (FB-005) | High |
| CC-01-8 | "My bay" read API for loading personnel (GET) | DFS-056-8 | Pending | `GET /api/v1/command-center/my-bay?loading_point_id=` — current assignments for a given L/U point; consumed by loading/unloading personnel screens | High |
| CC-01-9 | Command Center UI — queue view, assignment form, serial issuance | DFS-056-9 | Pending | Complete CC UI: queue list with card content (vehicle, P.C. code, item, scale-in time, product type, weight, urgency, TO ref), bay assignment dropdown, serial issuance action | High |
| CC-01-12 | E2E test coverage | ~ | Pending | Validate queue filtering, bay assignment, waiting serial with daily reset, QC handoff, "my bay" visibility | Medium |

---

## Feedback Items

### FB-005 — Multiple vehicles per L/U point + daily serial reset at 12:00 AM

**AC Amendment** (CC-01 AC-4): A loading or unloading point can serve **multiple vehicles simultaneously**. Each vehicle receives a **unique sequential waiting serial per L/U point**. Serial numbers reset every day at **12:00 AM**. The issuance API (CC-01-7) must implement the daily reset counter. Historical assignments from previous days retain their original serial for audit purposes.

### FB-006 — QC trigger via product-line QC Required flag

**Impact on CC-01**: The RM QC trigger service (CC-01-10, implemented in Sprint 4) must be reviewed against QC-01-13. The flag that marks a TO for QC must originate from `product_line.qc_required` (not just broad RM classification). No new CC-01 sub-task required — confirm CC-01-10 reads the right flag after QC-01-13 lands.

---

## Open DoD Items (from Sprint 4)

- [ ] Queue list shows only vehicles with completed scale-in and no active assignment (AC-1)
- [ ] Queue card displays vehicle number, P.C. code, item, scale-in datetime, product type, weight, TO ref, urgency (AC-2)
- [ ] Bay assignment validates product type / vehicle type against L/U point and shows warning on mismatch (AC-3)
- [ ] Assignment is immediately visible on the "my bay" view for loading/unloading personnel
- [ ] UAT: assign vehicle → loading screen shows assignment without email/push

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Queue list API returns eligible vehicles with all filter parameters (CC-01-5)
- [ ] Bay assignment API validates and updates TO sub-state; mismatch warning returned (CC-01-6)
- [ ] Waiting serial API supports multiple vehicles per L/U point; daily reset at 12:00 AM (CC-01-7, FB-005)
- [ ] "My bay" API returns current assignments for loading/unloading personnel (CC-01-8)
- [ ] CC UI complete: queue view, assignment form, serial issuance (CC-01-9)
- [ ] QC trigger reads `product_line.qc_required` flag (confirm CC-01-10 alignment with QC-01-13)
- [ ] E2E sub-task CC-01-12 passes in staging

---

*Sprint 4 completion: ~55% | Sprint 5 target: 100% | Jira: DFS-056*
