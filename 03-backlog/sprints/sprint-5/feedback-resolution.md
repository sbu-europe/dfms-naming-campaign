---
title: Sprint 5 — Feedback Resolution Tracker
source_sprint: Sprint 4
demo_date: 2026-05-21
total_items: 19
resolved: 0
in_progress: 0
open: 19
---

# Sprint 5 — Feedback Resolution Tracker

All 19 client demo feedback items from Sprint 4 (2026-05-21). Each item maps to the story that owns the AC amendment, the specific sub-task that closes it, and resolution status.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

---

## FB-001 — Product line item capture on loading / unloading

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) |
| **Closing Sub-tasks** | LD-01-9, GT-02-12 |
| **AC Amendment** | LD-01 AC-1 / AC-2: loading and unloading input must be captured per product line item, not one aggregate quantity. GT-02 AC-1 / AC-2: on-demand TO creation must support multiple product line items with product, quantity, and QC-required metadata. |
| **Status** | Open |
| **Notes** | Downstream QC-01 and CC-01 also read product-line QC Required flag (see FB-006). |

---

## FB-002 — Timestamp history on TO details page

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md) |
| **Closing Sub-tasks** | TLS-01-7, TLS-01-8 |
| **AC Amendment** | TLS-01 AC-5: `GET …/timeline` and `GET …/status` must return full timestamp history for every lifecycle status and yard sub-state change (at source, loading started/completed, unloading started/completed, QC events). |
| **Status** | Open |
| **Notes** | TLS-01-7 and TLS-01-8 were both Not Done in Sprint 4. |

---

## FB-003 — Replace In Transit buttons with single Trip Start action

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) |
| **Closing Sub-tasks** | DM-01-12 |
| **AC Amendment** | DM-01 AC-2: replace driver-facing "In Transit Source" and "In Transit Destination" buttons with a single **Trip Start** button. Button advances TO into the correct lane-aware driving status based on `flow_lane`. |
| **Status** | Open |
| **Notes** | Sub-task DM-01-12 was Pending in Sprint 4. |

---

## FB-004 — Align TO state sequence: Created → Assigned → Ready for Dispatch → Trip Start

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) |
| **Closing Sub-tasks** | TLS-01-2, TLS-01-10, DM-01-12 |
| **AC Amendment** | Reconcile TO status sequence across all three stories: `created` → `assigned` (TDO assigns vehicle/driver) → `ready_for_dispatch` (TDO assignment complete) → `dispatched` (DS-01 inspection/skip release) → driver **Trip Start** → lane-aware in-transit status (`in_transit_source` / `in_transit_destination`). Align `TO_STATUS_TRANSITIONS` and driver gate logic. |
| **Status** | **Closed** |
| **Closed by** | `can_execute()` guards planning statuses; `timeline_for_to()` returns `from_status` + actor; `DriverMyTOsView` delegates to driver presenter; dispatch queue template shows Route; 9 new unit tests pass |
| **Notes** | Cross-story alignment — see [E2E-01](11-e2e-cross-story/E2E-01-to-state-sequence.md) for the scripted validation journey. |

---

## FB-005 — Waiting serial must support multiple vehicles per L/U point + daily reset at 12:00 AM

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [LUP-01](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) |
| **Closing Sub-tasks** | CC-01-7 |
| **AC Amendment** | CC-01 AC-4: a loading or unloading point can serve **multiple vehicles simultaneously**. Each vehicle receives a **unique sequential serial per L/U point**. Serial numbers reset daily at **12:00 AM**. |
| **Status** | Open |
| **Notes** | Applies to unloading points as well — CC-01-7 issuance API must be updated with daily-reset logic. |

---

## FB-006 — QC trigger must depend on product-line QC Required flag

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [QC-01](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md), [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) |
| **Closing Sub-tasks** | QC-01-13, CC-01-10 (review) |
| **AC Amendment** | QC-01 AC-1: QC trigger reads `product_line.qc_required` flag, not only broad raw-material TO classification. CC-01 AC-6: QC flag logic updated to consume the same product-line flag. GT-02 AC-2: on-demand TO product line items must carry `qc_required` metadata. |
| **Status** | Open |
| **Notes** | QC-01-13 was Pending in Sprint 4. GT-02-12 (multi product line items) enables this. |

---

## FB-007 — On-demand TO creation must support multiple product line items

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) |
| **Closing Sub-tasks** | GT-02-12 |
| **AC Amendment** | GT-02 AC-1 / AC-2: Dealer DO and Supplier PO on-demand TOs must support multiple product line items per TO (product, quantity, QC-required). Combines with FB-001 and FB-006. |
| **Status** | Open |
| **Notes** | GT-02-12 closes FB-001, FB-006, and FB-007 together. |

---

## FB-008 — Attendance and Leave Management as separate Driver Supervisor menu items

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [DS-02](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) |
| **Closing Sub-tasks** | DS-02-18 |
| **AC Amendment** | DS-02 AC-3 / AC-4 menu note: **Driver Attendance** and **Driver Leave Management** are separate menu items in the Driver Supervisor navigation. Neither is buried under a combined "Driver State" section. |
| **Status** | Open |
| **Notes** | DS-02-18 was Pending in Sprint 4. |

---

## FB-009 — Maintenance-clearance record shows "Maintenance Completed" in inspection history

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) |
| **Closing Sub-tasks** | DS-01-16 (review), DS-01-14 |
| **AC Amendment** | DS-01 AC-5: when a vehicle passes a maintenance-clearance re-inspection and moves to **Available**, the inspection record in the history list shows status **Maintenance Completed** (distinct from a normal pre-dispatch pass). |
| **Status** | Open |
| **Notes** | Pending stakeholder clarification on exact label and history list column. Confirm with product before implementation. |

---

## FB-010 — Vendor OTP verification on registration and sensitive account actions

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-01](08-vendor-management/VM-01-vendor-mobile-onboarding.md) |
| **Closing Sub-tasks** | VM-01-9 |
| **AC Amendment** | VM-01: add OTP verification step on vendor self-registration and on sensitive account actions (password change, account delete). OTP sent via SMS/email; expiry configurable. |
| **Status** | Open |
| **Notes** | VM-01-9 was Pending in Sprint 4. |

---

## FB-011 — Vendor forgot password and password reset flow

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-01](08-vendor-management/VM-01-vendor-mobile-onboarding.md) |
| **Closing Sub-tasks** | VM-01-10 |
| **AC Amendment** | VM-01: implement forgot-password → OTP/link → token expiry → set new password flow on Vendor Mobile and backend auth API. |
| **Status** | Open |
| **Notes** | VM-01-10 was Pending in Sprint 4. |

---

## FB-012 — Vendor delete account from Profile

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-01](08-vendor-management/VM-01-vendor-mobile-onboarding.md) |
| **Closing Sub-tasks** | VM-01-11 |
| **AC Amendment** | VM-01: vendor can initiate account deletion from Profile. System requires confirmation, applies soft-delete or deactivation policy, and records audit trail. Deleted vendor cannot log in; historical bid/trip records retained. |
| **Status** | Open |
| **Notes** | VM-01-11 was Pending in Sprint 4. |

---

## FB-013 — Vendor portal needs TO lifecycle management

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-03](08-vendor-management/VM-03-vendor-portal-views.md), [VM-08](08-vendor-management/VM-08-realtime-to-updates.md), [TEVF-03](09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md) |
| **Closing Sub-tasks** | VM-03-9, VM-08-4, TEVF-03-4 |
| **AC Amendment** | VM-03: add TO lifecycle management screens in Vendor Portal — vendor-facing TO states (assigned / in progress / completed / closed), detail screens, and allowed actions per state. VM-08-4: lifecycle events emitted so portal views stay in sync. |
| **Status** | Open |
| **Notes** | Closes across three stories. Cross-story E2E: [E2E-04](11-e2e-cross-story/E2E-04-vendor-bidding-journey.md). |

---

## FB-014 — Vendor app lists auto-refresh on tab change

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-03](08-vendor-management/VM-03-vendor-portal-views.md) |
| **Closing Sub-tasks** | VM-03-10 |
| **AC Amendment** | VM-03: when user switches between Active Bids, Active Trips, and Completed Trips tabs, the list refreshes from server automatically (not only on manual pull-to-refresh). |
| **Status** | Open |
| **Notes** | VM-03-10 was Pending in Sprint 4. |

---

## FB-015 — Bid view UX: winner indication, window labels, TDO context

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-05](08-vendor-management/VM-05-bid-submission.md), [VM-06](08-vendor-management/VM-06-bid-evaluation.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) |
| **Closing Sub-tasks** | VM-05-9, VM-06-8, TEVF-02-9 |
| **AC Amendment** | VM-05 + VM-06 + TEVF-02: bid detail and evaluation screens show clear winner indication when session is awarded, bidding window labels with open/close dates, and TDO/publish context on vendor mobile and TDO evaluation surfaces. |
| **Status** | Open |
| **Notes** | Pure UX/copy change across three stories. |

---

## FB-016 — TO cannot hold more than one vehicle; enforce at publish and bid

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md), [VM-05](08-vendor-management/VM-05-bid-submission.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) |
| **Closing Sub-tasks** | VM-04-10, VM-05-10, TEVF-02-7 |
| **AC Amendment** | `required_vehicle_count = 1` enforced at publish (VM-04). Vendor `offered_vehicle_count` capped at 1 (VM-05). One-vehicle rule validated end-to-end in TEVF-02. |
| **Status** | Open |
| **Notes** | All three sub-tasks must land in the same sprint for consistent enforcement. |

---

## FB-017 — Tenant Admin must choose exactly one vendor type on approval

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-02](08-vendor-management/VM-02-vendor-tenant-join-and-approval.md) |
| **Closing Sub-tasks** | VM-02-8 |
| **AC Amendment** | VM-02 AC (approval): Tenant Admin cannot select both Contractual and Non-Contractual at once on join approval. UI and API must enforce exactly one vendor type per vendor per tenant. |
| **Status** | Open |
| **Notes** | VM-02-8 was Pending in Sprint 4. Demo noted both types could be selected simultaneously. |

---

## FB-018 — TDO captures bid requirement form before TO creation / publish

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) |
| **Closing Sub-tasks** | VM-04-11, TEVF-02-8 |
| **AC Amendment** | VM-04: TDO captures transport need / bidding parameters in a bid requirement form first; TO is created or linked when requirements are ready to publish. TEVF-02: Single TR → multiple TOs in one bidding session must align with this requirement form flow. |
| **Status** | Open |
| **Notes** | Involves product design decision on whether TO is pre-created or created at publish time. Confirm with product. |

---

## FB-019 — Bid publish must allow only one route per session

| Field | Value |
|-------|-------|
| **Source** | Client demo — 2026-05-21 |
| **Affected Stories** | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md) |
| **Closing Sub-tasks** | VM-04 (no dedicated sub-task yet — add VM-04-14 in Sprint 5) |
| **AC Amendment** | VM-04: publish UI and API validation must reject a session that attempts to add more than one route. Single-route constraint enforced at publish step. |
| **Status** | Open |
| **Notes** | No Sprint 4 sub-task was assigned. Create VM-04-14 as the implementation sub-task. |

---

## Resolution Summary

| Priority | Count | Closed | Open |
|----------|-------|--------|------|
| High | 14 | 0 | 14 |
| Medium | 5 | 0 | 5 |
| **Total** | **19** | **0** | **19** |

*Updated: 2026-06-01 — Sprint 5 planning*
