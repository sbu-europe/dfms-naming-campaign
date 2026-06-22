---
title: Sprint 6 — Feedback Resolution Tracker
source_sprint: Sprint 5 (Phase 1 demo)
demo_date: 2026-06-22
total_items: 1
resolved: 0
in_progress: 0
open: 1
---

# Sprint 6 — Feedback Resolution Tracker

Client demo feedback from the Sprint 5 / Phase 1 walkthrough (2026-06-22). Each item maps to the story that owns the AC amendment, the specific sub-task that closes it, and resolution status.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

---

## FB-001 — Multiple loading/unloading point assignments per TO visit

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-06-22 |
| **Affected Stories** | [CC-02](07-command-center-feedback/CC-02-multiple-lu-assignments-per-visit.md) (new), [CC-01](../sprint-5/06-command-center-loading/CC-01-queue-assign-serial.md), [LD-01](../sprint-5/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Sprint 4 origin** | [`sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md`](../../sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md), [`sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md`](../../sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Closing Sub-tasks** | CC-02-1, CC-02-2, CC-02-3, CC-02-4, CC-02-5 |
| **AC Amendment** | CC-01 AC-3 / LD-01 AC-1 / AC-2: Command Center must be able to assign **multiple** loading or unloading points to the same TO yard visit (not a single point). The TO advances to `loading_completed` or `unloading_completed` **only after all** assigned points for that leg have been started and completed. Intermediate sub-states (`loading_started`, `unloading_started`) may repeat per point; the terminal sub-state for the leg is emitted once when the last open assignment is closed. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Distinct from [FB-005](../sprint-5/feedback-resolution.md) (resolved Sprint 5): FB-005 allows **multiple vehicles** at the **same** L/U point. FB-001 requires **multiple L/U points** for the **same** vehicle/TO. Current implementation enforces one `BayAssignment` per `QueueEntry` (OneToOne) and emits `loading_completed` / `unloading_completed` on the first point completion — see [command-center-loading-sprint4.md](../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) §3.5. |

### Demo observation

During the Phase 1 demo, the Command Center Officer could assign a vehicle to **only one** loading or unloading point per scale-in visit. Operational reality at large sites (e.g. split loads across bays, partial unload at one berth then another) requires the CCO to assign **as many points as needed** for that visit. Loading/unloading personnel complete work at each assigned point in turn; the vehicle must not be treated as yard-complete for scale-out / gate-out until **every** assigned point is finished.

### Current vs expected behaviour

| Aspect | Current (post Sprint 5) | Expected (FB-001) |
|--------|-------------------------|-------------------|
| Assignments per visit | One `BayAssignment` per `QueueEntry` | One or more `BayAssignment` rows per `QueueEntry` / visit |
| CC assign action | Assigning a point closes the vehicle's single assignment slot | CCO can add further points while earlier assignments are open or completed |
| Queue visibility | Vehicle leaves CC waiting queue after first assignment | Vehicle remains trackable until all leg assignments are complete (or define re-queue rules — see CC-02) |
| `loading_completed` / `unloading_completed` | Emitted when **first** point completes (`LDService.complete_*` → `CCService.mark_completed`) | Emitted only when **all** open assignments for that leg are completed |
| Gate / scale guards | Scale-out may unblock after one point | Scale-out and gate-out guards must respect all assignments complete |

---

## Resolution Summary

| Priority | Count | Closed | Open |
|----------|-------|--------|------|
| High | 1 | 0 | 1 |
| **Total** | **1** | **0** | **1** |

*Created: 2026-06-22 — Sprint 6 demo feedback*
