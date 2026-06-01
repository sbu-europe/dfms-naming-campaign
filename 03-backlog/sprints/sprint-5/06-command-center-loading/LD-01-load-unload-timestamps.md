---
jira_key: DFS-057
jira_type: Story
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: LD-01
title: Loading & Unloading — Start/End Timestamps
epic: Command Center
status: Carry-over
story_points: 5
assignee: Farhan Tanvir(farhanT23)
carry_subtasks:
  - LD-01-9
  - LD-01-10
feedback_items:
  - FB-001
  - FB-002
source: ../../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md
---

# LD-01 — Load / Unload Start–End Timestamps (Sprint 5 Carry-over)

> **Full story context, business rules, QC handoff context, and implemented sub-tasks live in Sprint 4:**
> [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md)
>
> This file contains **only the open items** that carry into Sprint 5.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Jira | Sprint 4 Exit | Sprint 5 Work | Priority |
|---|----------|------|---------------|---------------|----------|
| LD-01-9 | Loading and unloading input captured **per product line item** | DFS-057-9 | Pending | Add product line item capture to load and unload events. Each line item (product reference + bags + weight) must be recorded separately. Model change: `LoadEventLineItem` / `UnloadEventLineItem` linked to `LoadEvent` / `UnloadEvent`. API payload updated. Closes FB-001. | High |
| LD-01-10 | E2E test coverage | ~ | Pending | Validate load/unload start-end capture, assigned bay dependency, product-line-item quantities per event, and TLS sub-state events | Medium |

---

## Feedback Items

### FB-001 — Product line item capture on loading / unloading

**AC Amendment** (LD-01 AC-1 / AC-2): Loading and unloading operators must enter quantities **per product line item** in the TO, not one aggregate quantity. The load/unload APIs must accept an array of line items (`[{product_id, bags, weight}]`). Each item stored as a separate record linked to the parent load/unload event.

### FB-002 — Timestamp history on TO details page

**Impact on LD-01**: Loading Started, Loading Completed, Unloading Started, Unloading Completed TLS sub-state events must be visible on `GET …/timeline`. These are emitted by LD-01-8 (Done in Sprint 4); confirm they appear correctly in the full timeline API once TLS-01-7 is implemented.

---

## Open DoD Items (from Sprint 4)

- [ ] `LoadEvent` and `UnloadEvent` models created with migrations (noted partial in Sprint 4 DoD)
- [ ] Audit log entry on every load and unload event
- [ ] UAT: load start/end at source POI; unload start/end at destination POI for full E2E flow

---

## Sprint 5 Definition of Done (remaining items only)

- [ ] Product line item capture on load events: model, admin, and API updated (LD-01-9, FB-001)
- [ ] Product line item capture on unload events: model, admin, and API updated (LD-01-9, FB-001)
- [ ] Audit log on every load/unload event
- [ ] Load/unload timeline events visible on `GET …/timeline` after TLS-01-7 lands (FB-002)
- [ ] E2E sub-task LD-01-10 passes in staging

---

*Sprint 4 completion: ~85% | Sprint 5 target: 100% | Jira: DFS-057*
