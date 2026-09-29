---
jira_sprint: "Sprint 5"
carry_from: "Sprint 4"
story_id: TEVF-03
title: Vendor Execution & Confirmation
epic: TO Execution — Vendor Fleet
status: Carry-over
carry_subtasks:
  - TEVF-03-3
  - TEVF-03-4
  - TEVF-03-5
feedback_items:
  - FB-013
source: ../../../sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md
---

# TEVF-03 — Vendor Execution & Confirmation (Sprint 5 Carry-over)

> **Full story context lives in Sprint 4:**
> [`sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md`](../../../../sprint-4/09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md)
>
> **Trip lifecycle & status model:**
> [`../08-vendor-management/VENDOR-TRIP-LIFECYCLE.md`](../08-vendor-management/VENDOR-TRIP-LIFECYCLE.md)

---

## Trip management context (TEVF-03)

Vendor-fleet execution uses **TLS-01 on `TransportOrder.status`**, not the legacy 17-state `Trip` model on the vendor surface.

**Advance-status API** (`POST …/advance-status/`):

| Intent | From | To | Notes |
|--------|------|-----|-------|
| Trip start | `ready_for_dispatch` | `driving_towards_source` (FG outbound) or `driving_towards_destination` (FG/RM inbound) | Requires VM-07 confirmation; `in_progress` accepted as alias |
| Trip complete | `delivered_unloaded` | `completed` | Yard chain must have finished; `can_complete_vendor_trip` flag on API |

Intermediate statuses (`at_source`, `loaded_pickup_completed`, `at_destination`, yard `sub_state` values) are set by driver/yard modules — vendor portal displays them via VM-08 sync.

---

## Sprint 5 Scope — Open Sub-tasks

| # | Sub-task | Current Status | Sprint 5 Work | Priority | Feedback |
|---|----------|---------------|---------------|----------|---------|
| TEVF-03-3 | Contractual path — ensure vendor assignment UI never exposes resolved contractual rate | Done | Confirm rate hiding is applied on all vendor-facing TO and assignment screens for contractual vendors | Medium | — |
| TEVF-03-4 | Vendor portal TO lifecycle — lifecycle screens + tab-change refresh | Done | Per [`VENDOR-TRIP-LIFECYCLE.md`](../08-vendor-management/VENDOR-TRIP-LIFECYCLE.md): lifecycle buckets, TLS-01 execution chips, Start/Complete Trip actions, 4-milestone timeline; tabs refresh on switch. Aligns with VM-03-9 and VM-03-10. | High | FB-013 |
| TEVF-03-5 | E2E test coverage | Pending | Validate vendor execution confirmation, contractual/non-contractual handoffs, lifecycle refresh, completed-trip visibility | Medium | — |

---

## Sprint 5 Definition of Done (remaining items only)

- [x] Contractual rate hidden from all vendor-facing screens (TEVF-03-3)
- [x] Vendor portal TO lifecycle screens with tab-change refresh (TEVF-03-4, FB-013)
- [ ] E2E sub-task TEVF-03-5 passes in staging

---

*Current completion: 100% (E2E pending) | Sprint 5 target: 100%*
