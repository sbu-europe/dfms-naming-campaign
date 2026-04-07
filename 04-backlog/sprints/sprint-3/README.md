---
sprint: Sprint 3
title: Transfer Requisition, Transport Planning & Transport Orders
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 49
status: Not Started
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 3 — Transfer Requisition, Transport Planning & Transport Orders

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`04-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 10 |
| Total Story Points | 49 |
| Status | Not Started |
| Epics | Transfer Requisition, Transport Planning, Transport Order |

---

## Epic: Transfer Requisition

> End-to-end TR creation (FG + Port/RM), stock & capacity validation, and approval workflows routing approved TRs to Transport Planners.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Finished Goods (FG) Transfer Requisition](01-transfer-requisition/TR-01-fg-transfer-requisition.md) | TR-01 | DFS-032 | 5 | Pending |
| 2 | [Port Consignment / RM Transfer Requisition](01-transfer-requisition/TR-02-port-rm-transfer-requisition.md) | TR-02 | DFS-033 | 5 | Pending |
| 3 | [Stock & Capacity Validation](01-transfer-requisition/TR-03-stock-capacity-validation.md) | TR-03 | DFS-034 | 3 | Pending |
| 4 | [Distribution Approval Workflow (FG TR)](01-transfer-requisition/TR-04-distribution-approval.md) | TR-04 | DFS-035 | 5 | Pending |
| 5 | [Procurement Approval Workflow (Port / RM TR)](01-transfer-requisition/TR-05-procurement-approval.md) | TR-05 | DFS-036 | 5 | Pending |

**Sub-total**: 23 SP

---

## Epic: Transport Planning

> TR assessment queue for Transport Planners + real-time fleet, driver, and helper availability.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [TR Assessment by Transport Planner](02-transport-planning/TP-01-tr-assessment.md) | TP-01 | DFS-037 | 5 | Pending |
| 2 | [Fleet Availability & Transport Planning](02-transport-planning/TP-02-fleet-availability-planning.md) | TP-02 | DFS-038 | 5 | Pending |

**Sub-total**: 10 SP

---

## Epic: Transport Order

> TO creation with TR quantity allocation (single & multi-TO), own fleet vehicle/driver assignment, and vendor direct assignment.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [TO Creation — Single & Multi-TO per TR](03-transport-order/TO-01-to-creation.md) | TO-01 | DFS-039 | 8 | Pending |
| 2 | [TO — Own Fleet Vehicle & Driver Assignment](03-transport-order/TO-02-to-own-fleet-assignment.md) | TO-02 | DFS-040 | 8 | Pending |
| 3 | [TO — Vendor Fleet Direct Assignment](03-transport-order/TO-03-vendor-direct-assignment.md) | TO-03 | DFS-041 | 5 | Pending |

**Sub-total**: 21 SP (+ 5 SP carry-over from Sprint 2 if any)

---

## End-to-End Flow This Sprint Delivers

```
[Distribution Officer]           [Procurement Officer]
        ↓                                  ↓
   TR-01: FG TR                   TR-02: Port/RM TR
        ↓                                  ↓
   TR-03: Stock & Capacity Validation (informational)
        ↓                                  ↓
   TR-04: Distribution Approval    TR-05: Procurement Approval
        ↓                                  ↓
   ←──────── Available for Planning ────────→
                        ↓
              TP-01: TR Assessment Queue
                        ↓
              TP-02: Fleet Availability Check
                        ↓
              TO-01: Create TO(s) from TR
                        ↓
         ┌──────────────┴──────────────┐
         ↓                             ↓
  TO-02: Own Fleet                TO-03: Vendor Fleet
  Vehicle + Driver Assignment     Direct Assignment
         ↓                             ↓
  ←──────────── Dispatched ────────────→
         ↓ (Sprint 4: Trip Lifecycle)
```

---

## Dependency Map

```
TR-01 (FG TR)          ─→  TR-03 (Stock Validation)  ─→  TR-04 (Distribution Approval)
TR-02 (Port/RM TR)     ─→  TR-03 (Stock Validation)  ─→  TR-05 (Procurement Approval)
TR-04 + TR-05          ─→  TP-01 (Assessment Queue)
TP-01 + TP-02          ─→  TO-01 (TO Creation)
TO-01 (fleet_type=OWN)      ─→  TO-02 (Own Fleet Assignment)
TO-01 (fleet_type=VENDOR)   ─→  TO-03 (Vendor Direct Assignment)
```

**Prerequisites from Sprint 2**:
- MDM-04 (POI) — source/dest POI selection in TR forms
- MDM-01 (Product) — product selection (FG / RM gating) in TR forms
- MDM-02 (Route) — route distance/duration shown in TP-01
- MDM-03 (Vendor) — vendor selection in TO-03
- MDM-05/06/07 (Vehicle/Driver/Helper) — fleet assignment in TP-02, TO-02

---

## Pending Items

> No carry-overs into Sprint 3 at planning time.

---

## Demo Feedback

> No demo feedback recorded for Sprint 3 yet.

---

## Notes

- **TR-01 and TR-02 share the same `TransferRequisition` model** — TR-01 should be built first as it establishes the base model; TR-02 extends it with Port-specific fields
- **TR-03 (Stock & Capacity Validation)** is a shared service — its widgets are embedded in TR-01 and TR-02 forms and re-run at approval time in TR-04 / TR-05
- **TP-02 (Fleet Availability)** is a prerequisite for TO-02 and TO-03, and used inline by TP-01 — should be built before or in parallel with TP-01
- **US-062 (Helper Assignment)** is incorporated into TP-02 rather than as a standalone story since helpers are part of the fleet resource pool
- Jira Epics: `DFS-040` (Transfer Requisition), `DFS-041` (Transport Planning), `DFS-042` (Transport Order)
