# Sprint 4 — Own-Fleet Yard & Field Execution (TO-Centric)

| | |
|---|---|
| **Sprint Dates** | ~ → ~ |
| **Total Story Points** | 91 SP |
| **Done** | 0 SP |
| **Remaining** | 91 SP *(81 SP in progress, 10 SP pending)* |
| **Overall Completion** | 0% by story status |

---

## Epic: Driver Supervisor & Crew Operations

> Goal: Driver Supervisor can validate vehicle readiness, manage handover checklists, and maintain driver state / attendance before TO execution.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Vehicle licence, health & handover checklists](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DFS-050 | Pending | 5 |
| [Driver state, attendance & leave](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | DFS-051 | Pending | 5 |
| **Subtotal** | | | **10** |

---

## Epic: Driver Mobile *(Phase 1 — no map / location)*

> Goal: Assigned drivers can see their ready TOs, progress execution milestones, and capture POD without introducing live map, GPS, or navigation scope.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [TO list, execution milestones & POD capture](03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md) | DFS-053 | In Progress | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Yard Foundation

> Goal: POI-scoped yard roles resolve their working site, source/destination visit, and current yard step through one shared rule set.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Yard foundation — operator site assignment & shared yard rules](10-yard-foundation/YARD-01-poi-scoped-yard-platform.md) | DFS-065 | In Progress | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Gate Operations

> Goal: Gate users can record source and destination gate-in / gate-out events, discrepancy remarks, and on-demand TO creation where planner TO does not exist.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Gate-in, gate-out & discrepancy remarks](04-gate/GT-01-gate-in-out-remarks.md) | DFS-054 | In Progress | 8 |
| [On-demand TO creation — Dealer DO & Supplier PO](04-gate/GT-02-on-demand-to-creation-gate.md) | DFS-062 | In Progress | 8 |
| **Subtotal** | | | **16** |

---

## Epic: Scaling / Weighing

> Goal: Weighbridge operators can capture scale-in / scale-out weights and queue tokens against the same TO execution chain.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Scale-in, P.C. code capture & scale-out](05-scaling/SC-01-scale-in-out-queue-token.md) | DFS-055 | In Progress | 8 |
| **Subtotal** | | | **8** |

---

## Epic: Command Center & Loading / Unloading

> Goal: Command Center can assign vehicles to POI loading / unloading points, manage waiting serials, and capture load / unload start-end events.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Loading & unloading points — create & maintain per POI](06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | DFS-063 | In Progress | 5 |
| [Queue monitoring, bay assignment & waiting serial](06-command-center-loading/CC-01-queue-assign-serial.md) | DFS-056 | In Progress | 8 |
| [Load / unload start-end capture](06-command-center-loading/LD-01-load-unload-timestamps.md) | DFS-057 | In Progress | 5 |
| **Subtotal** | | | **18** |

---

## Epic: Lifecycle, POD & QC

> Goal: The Transport Order carries execution, yard, closure, POD, and raw-material QC checkpoints without creating a separate Trip record.

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [TO lifecycle — execution, yard step & timeline audit](07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | DFS-059 | In Progress | 13 |
| [TO closure — POD & gate-out linkage](07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md) | DFS-060 | In Progress | 5 |
| [Raw-material QC — sampling & pass/fail decision](07-visibility-lifecycle-pod/QC-01-raw-material-sampling-qc-decision.md) | DFS-064 | In Progress | 5 |
| **Subtotal** | | | **23** |

---

## Epic: Vendor Management *(planning context — not counted in 91 SP own-fleet total)*

> Goal: Keep vendor onboarding, bidding, tenant join, and vendor-fleet TO execution traceability visible while Sprint 4 delivery remains focused on own-fleet yard execution.

| Story / Context | Jira | Status | SP |
|-----------------|------|--------|----|
| [Vendor management context index](08-vendor-management/README.md) | ~ | Draft | ~ |
| [Bid submission windows + structured bid payload](08-vendor-management/VM-05-bid-submission.md) | ~ | Pending | 6 |
| [TO execution — vendor fleet context](09-to-execution-vendor-fleet/README.md) | ~ | In Progress | 9 |

---

## Pending Items

### Scope Carry-overs (original sprint scope, not yet done)

| Item | Story | Jira Sub-task | Priority |
|------|-------|---------------|----------|
| Driver Supervisor checklist release / maintenance-clearance flow still pending at story level | [DS-01](01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DFS-050 | High |
| Driver state, attendance, and leave management still pending at story level | [DS-02](01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | DFS-051 | High |
| Existing yard invite / historical visit backfill remains open within Yard Foundation | [YARD-01](10-yard-foundation/YARD-01-poi-scoped-yard-platform.md) | DFS-065-1 / DFS-065-3 | Medium |
| Command Center, QC, and loading screens must filter waiting work by current yard step | [YARD-01](10-yard-foundation/YARD-01-poi-scoped-yard-platform.md) | DFS-065-4 | High |
| QA / E2E backlog item not yet defined for the TO-centric yard chain | Cross-epic | — | Medium |

### Deferred Scope (explicitly not Sprint 4 delivery)

| Item | Affects | Target |
|------|---------|--------|
| Live map, GPS, background location, and navigation | Driver mobile / visibility | Later sprint |
| Trip costing (§6.8.8) | Transport execution / finance | Later sprint |
| Incident, halt, re-delivery workflow (§6.8.6) | TO lifecycle | Phase 2 |
| Detailed physical / lab QC sub-workflows beyond yes-no QC decision | QC | Later sprint |
| Vendor billing, claims, rating, and advanced bid probability | Vendor management | Phase 2 / Phase 3 |

---

## Demo Feedback (Sprint 4)

> Source: Sprint 4 demo feedback log.

| # | Feedback | Source | Affects | Priority | Status | Feedback File |
|---|----------|--------|---------|----------|--------|---------------|
| — | No demo feedback recorded yet | — | — | — | — | [feedback.md](feedback.md) |

---

## Technical Highlights

- Sprint 4 is **TO-centric**: operational events, yard steps, driver milestones, POD, and QC attach to the Transport Order created in Sprint 3.
- Sprint 3 handoff remains: TDO assignment / Ready for Dispatch makes the TO visible to the assigned driver.
- Yard execution chain is aligned as Gate → Scale → Command Center → Loading / Unloading → QC where applicable → POD / Gate-out closure.
- POI-scoped role access is central to yard screens: gate, scale, command center, loading, unloading, and QC should only see work for their assigned site.
- Own-fleet availability (§6.8.1.7) is enforced for tenant-managed fleet and must not be mixed with vendor offered vehicle counts.
- Vendor-fleet execution is retained as planning context through the vendor management and TEVF documents, not as the primary own-fleet delivery thread.

---

## Modules / Context Packs

The following Sprint 4 folders provide supporting context beyond the main story tables:

- [Dispatch note — Trip removed from Sprint 4 backlog](02-dispatch-trip/README.md)
- [Vendor management context](08-vendor-management/README.md)
- [Vendor mobile context](08-vendor-management/VENDOR-MOBILE-CONTEXT.md)
- [TO execution — vendor fleet context](09-to-execution-vendor-fleet/README.md)

---

**Sprint Lead**: ~  
**Last Updated**: 2026-05-25  
**Next**: Sprint 5 (TBD)
