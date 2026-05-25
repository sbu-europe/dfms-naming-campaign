# Sprint 4 — Own-Fleet Yard & Field Execution (TO-Centric)

| | |
|---|---|
| **Sprint Dates** | 2026-05-07 → 2026-05-21 |
| **Total Story Points** | 91 SP |
| **Evidence-Based Done** | ~63 SP |
| **Remaining** | ~28 SP |
| **Overall Completion** | ~70% *(weighted by AC / sub-task evidence; 0 stories formally marked Done)* |

---

## Epic: Driver Supervisor & Crew Operations

> Goal: Driver Supervisor validates vehicle readiness, manages dispatch release / maintenance clearance, and keeps driver availability truthful before TO execution.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Vehicle licence, health & handover checklists](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DFS-050 | ~75% | 5 |
| [Driver state, attendance & leave](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | DFS-051 | ~70% | 5 |
| **Subtotal** | | | **10** |

---

## Epic: Driver Mobile *(Phase 1 — no map / location)*

> Goal: Assigned drivers can see ready TOs, respect the supervisor dispatch gate, progress lane-aware execution milestones, and capture POD without GPS / navigation scope.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [TO list, execution milestones & POD capture](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | DFS-053 | ~80% | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Yard Foundation

> Goal: POI-scoped yard roles resolve their working site, source/destination visit, and current yard step through one shared rule set.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Yard foundation — operator site assignment & shared yard rules](10-yard-foundation/YARD-01-poi-scoped-yard-platform.md) | DFS-065 | ~75% | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Gate Operations

> Goal: Gate users record source / destination gate-in and gate-out events, discrepancy remarks, and on-demand TO creation where a planner TO does not exist.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Gate-in, gate-out & discrepancy remarks](04-gate/GT-01-gate-in-out-remarks.md) | DFS-054 | ~70% | 8 |
| [On-demand TO creation — Dealer DO & Supplier PO](04-gate/GT-02-on-demand-to-creation-gate.md) | DFS-062 | ~80% | 8 |
| **Subtotal** | | | **16** |

---

## Epic: Scaling / Weighing

> Goal: Weighbridge operators capture scale-in / scale-out weights and P.C. codes against the same TO execution chain consumed by Command Center.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Scale-in, P.C. code capture & scale-out](05-scaling/SC-01-scale-in-out-queue-token.md) | DFS-055 | ~70% | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Command Center & Loading / Unloading

> Goal: Command Center assigns vehicles to POI loading / unloading points, manages waiting serials, and captures load / unload start-end evidence.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Loading & unloading points — create & maintain per POI](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | DFS-063 | ~55% | 5 |
| [Queue monitoring, bay assignment & waiting serial](06-command-center-loading/CC-01-queue-assign-serial.md) | DFS-056 | ~55% | 8 |
| [Load / unload start-end capture](06-command-center-loading/LD-01-load-unload-timestamps.md) | DFS-057 | ~85% | 5 |
| **Subtotal** | | | **18** |

---

## Epic: Lifecycle, POD & QC

> Goal: The Transport Order carries execution, yard, closure, POD, and raw-material QC checkpoints without creating a separate Trip record.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [TO lifecycle — execution, yard step & timeline audit](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | DFS-059 | ~65% | 13 |
| [TO closure — POD & gate-out linkage](07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md) | DFS-060 | ~55% | 5 |
| [Raw-material QC — sampling & pass/fail decision](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md) | DFS-064 | ~70% | 5 |
| **Subtotal** | | | **23** |

---

## Epic: Vendor Management *(planning context — not counted in 91 SP own-fleet total)*

> Goal: Keep vendor onboarding, bidding, tenant join, and vendor-fleet TO execution traceability visible while Sprint 4 delivery remains focused on own-fleet yard execution.

| Story / Context | Jira | Status | SP |
|-----------------|------|--------|----|
| [Vendor Mobile onboarding — self-registration, docs & company profile](08-vendor-management/VM-01-vendor-mobile-onbiorading.md) | ~ | ~70% | 8 |
| [Vendor ↔ tenant join, approval & vendor type scoping](08-vendor-management/VM-02-vendor-tenant-join-and-approval.md) | ~ | ~85% | 5 |
| [Vendor portal views — active bids, active trips & completed trips](08-vendor-management/VM-03-vendor-portal-views.md) | ~ | ~70% | 5 |
| [TDO publish TO to bidding portal](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md) | ~ | ~75% | 8 |
| [Bid submission windows + structured bid payload](08-vendor-management/VM-05-bid-submission.md) | ~ | ~55% | 6 |
| [Bid evaluation — compare, award & winning log](08-vendor-management/VM-06-bid-evaluation.md) | ~ | ~65% | 8 |
| [Vehicle-driver confirmation + post-completion uploads](08-vendor-management/VM-07-vehicle-driver-submission.md) | ~ | ~60% | 8 |
| [Real-time TO updates in vendor portal](08-vendor-management/VM-08-realtime-to-updates.md) | ~ | ~55% | 5 |
| [TEVF-01 — contractual vendor assignment](09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md) | ~ | ~50% | 3 |
| [TEVF-02 — non-contractual bidding workflow](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) | ~ | ~45% | 3 |
| [TEVF-03 — vendor execution & confirmation](09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md) | ~ | 0% | 3 |
| **Subtotal** | | **~62% vendor-context completion** | **62** |

Reference context: [Vendor management context index](08-vendor-management/README.md), [Vendor Mobile context](08-vendor-management/VENDOR-MOBILE-CONTEXT.md), and [TO execution — vendor fleet context](09-to-execution-vendor-fleet/README.md).

---

## Pending Items

### Scope Carry-overs (original sprint scope, not yet done)

| Item | Story | Jira Sub-task | Priority |
|------|-------|---------------|----------|
| Dispatch / checklist audit coverage, under-maintenance rollback alignment, return-to-service audit, and UAT evidence | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DFS-050-7 / 12 / 14 / 17 | High |
| Driver state board gaps, TLS auto-state hooks, complete audit trail, separate Attendance / Leave menus, and UAT evidence | [DS-02](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | DFS-051-6 / 10 / 17 / 18 | High |
| Driver TO detail completeness, ownership/security tests, lane transition tests, and single Trip Start action | [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | DFS-053-5 / 12 | High |
| Existing yard invite and gate-visit backfill; all waiting-work screens filtering by current yard step | [YARD-01](10-yard-foundation/YARD-01-poi-scoped-yard-platform.md) | DFS-065-1 / 3 / 4 | High |
| Gate document-category routing, TLS event emission, gateman UI completion, and end-to-end UAT | [GT-01](04-gate/GT-01-gate-in-out-remarks.md) | DFS-054-3 / 9 / 10 / 11 | High |
| On-demand TO product line items, stock-check stub, RBAC enforcement, and Dealer / Supplier UAT | [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | DFS-062-12 | High |
| Scale-in / scale-out API completion, queue-slip print content, immutability guards, and TLS event verification | [SC-01](05-scaling/SC-01-scale-in-out-queue-token.md) | DFS-055-5 / 6 / 8 / 9 | Medium |
| L/U point APIs, audit logging, UAT seed data, and frontend field dictionary | [LUP-01](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | DFS-063-4 / 5 / 6 / 7 / 8 | Medium |
| Queue, bay assignment, waiting serial, and "my bay" APIs / UI are still the main Command Center delivery gap | [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md) | DFS-056-5 / 6 / 7 / 8 / 9 | High |
| Load / unload audit logging and product-line-item-wise capture | [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md) | DFS-057-9 | High |
| Timeline / status APIs, transition validation, sub-state clearing, admin inline, and automated lifecycle tests | [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | DFS-059-2 / 4 / 7 / 8 / 10 | High |
| Auto-close trigger, closure APIs, closure dashboard / exceptions list, and closure audit trail | [POD-01](07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md) | DFS-060-6 / 7 / 8 / 9 / 10 | High |
| QC entry condition, resample / override completeness, all-event timeline audit, and product-line QC flag trigger | [QC-01](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md) | DFS-064-4 / 5 / 6 / 12 / 13 | High |
| E2E QA story still needs definition for the full TO-centric yard chain | Cross-epic | — | Medium |

### From Demo Feedback (new / clarified scope — queued for Sprint 4 hardening or Sprint 5 refinement)

| Item | Story | Source | Priority |
|------|-------|--------|----------|
| Loading / unloading must capture product line items, not one aggregate quantity | [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | Client demo | High |
| TO details must show complete timestamp history for lifecycle status and yard sub-state changes | [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | Client demo | High |
| Replace driver "In Transit Source / Destination" buttons with one lane-aware Trip Start action | [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | Client demo | High |
| Align TO state sequence: Created → Assigned → Ready for Dispatch → driver Trip Start | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | Client demo | High |
| Waiting serial must support multiple vehicles per L/U point and reset daily at 12:00 AM | [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [LUP-01](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | Client demo | High |
| QC trigger must read product-line `QC Required`, not only broad raw-material classification | [QC-01](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md), [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | Client demo | High |
| Attendance and Leave Management should be separate Driver Supervisor menu items | [DS-02](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | Client demo | Medium |
| Maintenance-clearance inspections should show "Maintenance Completed" in inspection history | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | Client demo | Medium |
| Vendor mobile security / account flows: OTP, forgot password, reset password, delete account | [VM-01](08-vendor-management/VM-01-vendor-mobile-onbiorading.md) | Client demo | High |
| Vendor bidding constraints: one vehicle per TO, single route per publish, clearer bid UX, and exactly one vendor type per tenant approval | [VM-02](08-vendor-management/VM-02-vendor-tenant-join-and-approval.md), [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md), [VM-05](08-vendor-management/VM-05-bid-submission.md), [VM-06](08-vendor-management/VM-06-bid-evaluation.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) | Client demo | High |

### Deferred Scope (explicitly not Sprint 4 delivery)

| Item | Affects | Target |
|------|---------|--------|
| Live map, GPS, background location, and navigation | Driver mobile / visibility | Later sprint |
| Trip costing (§6.8.8) | Transport execution / finance | Later sprint |
| Incident, halt, re-delivery workflow (§6.8.6) | TO lifecycle | Phase 2 |
| Detailed physical / lab QC sub-workflows beyond yes-no QC decision | QC | Later sprint |
| Push notifications for command center assignment / loading / unloading alerts | Yard operations | Phase 3 |
| Vendor billing, claims, rating, and advanced bid probability | Vendor management | Phase 2 / Phase 3 |

---

## Demo Feedback (Sprint 4 — 2026-05-21)

> Source: Sprint 4 demo feedback log — client / stakeholder review.

| # | Feedback | Source | Affects | Priority | Status | Feedback File |
|---|----------|--------|---------|----------|--------|---------------|
| FB-001 | Loading and unloading product entry must be captured product-line-item wise | Client | [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | High | Open | [feedback.md](feedback.md) |
| FB-002 | TO details page must show timestamp history for every lifecycle status and yard sub-state | Client | [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [LD-01](06-command-center-loading/LD-01-load-unload-timestamps.md) | High | Open | [feedback.md](feedback.md) |
| FB-003 | Replace driver-facing In Transit Source / Destination actions with one Trip Start button | Client | [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | High | Open | [feedback.md](feedback.md) |
| FB-004 | Reconcile TO sequence: Created → Assigned → Ready for Dispatch → driver execution | Client | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md), [DM-01](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [TLS-01](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | High | Needs alignment | [feedback.md](feedback.md) |
| FB-005 | L/U point serials must support multiple vehicles and reset daily at 12:00 AM | Client | [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [LUP-01](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | High | Open | [feedback.md](feedback.md) |
| FB-006 | QC trigger must depend on product-line QC Required flag | Client | [QC-01](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md), [CC-01](06-command-center-loading/CC-01-queue-assign-serial.md), [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | High | Open | [feedback.md](feedback.md) |
| FB-007 | On-demand TO creation must support multiple product line items | Client | [GT-02](04-gate/GT-02-on-demand-to-creation-gate.md) | High | Open | [feedback.md](feedback.md) |
| FB-008 | Driver Supervisor Attendance and Leave Management must be separate menu items | Client | [DS-02](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | Medium | Open | [feedback.md](feedback.md) |
| FB-009 | Maintenance-clearance record should show Maintenance Completed in inspection history | Client | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | Medium | Pending clarification | [feedback.md](feedback.md) |
| FB-010 | Vendor OTP verification on registration and sensitive account actions | Client | [VM-01](08-vendor-management/VM-01-vendor-mobile-onbiorading.md) | High | Open | [feedback.md](feedback.md) |
| FB-011 | Vendor forgot password and password reset flow | Client | [VM-01](08-vendor-management/VM-01-vendor-mobile-onbiorading.md) | High | Open | [feedback.md](feedback.md) |
| FB-012 | Vendor delete account from Profile with confirmation, soft-delete policy, and audit | Client | [VM-01](08-vendor-management/VM-01-vendor-mobile-onbiorading.md) | Medium | Open | [feedback.md](feedback.md) |
| FB-013 | Vendor portal needs vendor-facing TO lifecycle management | Client | [VM-03](08-vendor-management/VM-03-vendor-portal-views.md), [VM-08](08-vendor-management/VM-08-realtime-to-updates.md), [TEVF-03](09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md) | High | Open | [feedback.md](feedback.md) |
| FB-014 | Vendor app lists should auto-refresh when switching Active Bids / Active Trips / Completed Trips tabs | Client | [VM-03](08-vendor-management/VM-03-vendor-portal-views.md) | Medium | Open | [feedback.md](feedback.md) |
| FB-015 | Bid view UX needs clearer TDO / publish context, winner indication, and bidding-window labels | Client | [VM-05](08-vendor-management/VM-05-bid-submission.md), [VM-06](08-vendor-management/VM-06-bid-evaluation.md) | Medium | Open | [feedback.md](feedback.md) |
| FB-016 | A TO cannot hold more than one vehicle; publish and bid flows must enforce one vehicle | Client | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md), [VM-05](08-vendor-management/VM-05-bid-submission.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) | High | Open | [feedback.md](feedback.md) |
| FB-017 | Tenant Admin must choose exactly one vendor type: Contractual or Non-Contractual | Client | [VM-02](08-vendor-management/VM-02-vendor-tenant-join-and-approval.md) | High | Open | [feedback.md](feedback.md) |
| FB-018 | TDO should capture bid requirement form before TO creation / publish | Client | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md), [TEVF-02](09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md) | High | Open | [feedback.md](feedback.md) |
| FB-019 | Bid publish must allow only one route per session | Client | [VM-04](08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md) | Medium | Open | [feedback.md](feedback.md) |

---

## Technical Highlights

- Sprint 4 remains **TO-centric**: operational events, yard steps, driver milestones, POD, and QC attach to the Transport Order created in Sprint 3; the Trip-instantiation story was removed.
- TDO assignment / **Ready for Dispatch** makes the TO visible to the driver; Driver Supervisor release moves it into **Dispatched**, after which driver execution can begin.
- Yard execution chain is aligned as Gate → Scale → Command Center → Loading / Unloading → QC where applicable → POD / Gate-out closure.
- POI-scoped access is a core control: gate, scale, command center, loading, unloading, and QC operators should see only work for their assigned site.
- `TransportOrder.status`, `TransportOrder.sub_state`, and `TOStatusTransitionLog` provide the lifecycle backbone; remaining risk is API exposure, reset-boundary behavior, and test coverage.
- Own-fleet availability (§6.8.1.7) is enforced for tenant-managed fleet and must not be mixed with vendor offered vehicle counts.
- Vendor-fleet execution is retained as planning context through the vendor management and TEVF documents, not as the primary own-fleet delivery thread.

---

## Modules / Context Packs

The following Sprint 4 folders provide supporting context beyond the main story tables:

- [Dispatch note — Trip removed from Sprint 4 backlog](02-dispatch-trip/README.md)
- [Vendor management context](08-vendor-management/README.md)
- [Vendor mobile context](08-vendor-management/VENDOR-MOBILE-CONTEXT.md)
- [TO execution — vendor fleet context](09-to-execution-vendor-fleet/README.md)
- [Sprint 4 demo feedback](feedback.md)

---

**Sprint Lead**: ~  
**Last Updated**: 2026-05-25  
**Next**: Sprint 5 (TBD)
