---
sprint: Sprint 3
title: Product Requisition, Transport Requests & Transport Orders
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 68
status: Not Started
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 3 — Product Requisition, Transport Requests & Transport Orders

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`04-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 10 |
| Total Story Points | 68 |
| Status | Not Started |
| Epics | Requisition, Distribution, Procurement, Transport, QA & Testing, DevOps & Infrastructure |

---

## Menu Structure & Role Access

| Menu | Sub-menu | Actor | Key Action |
|------|----------|-------|------------|
| **Requisition** | Finished Goods | Depot / Feed Mill Officer | Create FG Product Requisition (PR) |
| **Requisition** | Raw Materials | Depot / Feed Mill Officer | Create RM Product Requisition (PR) |
| **Distribution** | Product Requisitions | Distribution Officer | View FG PR queue, navigate to TR creation |
| **Distribution** | Transport Requests | Distribution Officer / Distribution Manager | Create TR(s) against FG PR; DM approves |
| **Procurement** | Product Requisitions | Procurement Officer | View RM PR queue, navigate to TR creation |
| **Procurement** | Transport Requests | Procurement Officer | Create TR(s) against RM PR (no approval step) |
| **Transport** | Transport Requests → Finished Goods | Transport Planner | Review FG TRs, submit vehicle/type requirements |
| **Transport** | Transport Requests → Raw Materials | Transport Planner | Review RM TRs, submit vehicle/type + C&F clearance |
| **Transport** | Transport Orders | Transport Planner / TDO | Create TOs against TRs; TDO assigns vehicle/driver/helper/ETA |

---

## Epic: Requisition

> Two PR types exist. **Finished Goods PRs** are raised by Depot/Feed Mill Officers and route to Distribution. **Port Consignment PRs** are raised by Commercial Officers with full LC and shipment documentation, and route to Procurement. PRs are the demand signal that drives the downstream TR → Transport workflow.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [FG Product Requisition](01-requisition/PR-01-fg-product-requisition.md) | PR-01 | DFS-032 | 5 | Pending |
| 2 | [Port Consignment (LC-Based) Product Requisition](01-requisition/PR-02-rm-product-requisition.md) | PR-02 | DFS-033 | 5 | Pending |

**Sub-total**: 10 SP

---

## Epic: Distribution

> Distribution Officers view FG Product Requisitions and create Transport Requests (TRs) against them, selecting the source POI per TR. The Destination is fixed from the PR. Total TR quantities are validated against the PR quantity — overflow is prevented. Distribution Manager approves (and optionally modifies) TRs before they reach Transport Planning.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Distribution — FG Product Requisitions View](02-distribution/DR-01-fg-product-requisitions.md) | DR-01 | DFS-034 | 2 | Pending |
| 2 | [Distribution — Transport Request Creation & Manager Approval](02-distribution/DR-02-transport-requests.md) | DR-02 | DFS-035 | 8 | Pending |

**Sub-total**: 10 SP

---

## Epic: Procurement

> Procurement Officers view RM Product Requisitions and create Transport Requests against them, selecting the source POI per TR. The Destination is fixed from the PR. Total TR quantities are validated against the PR quantity. **No manager approval step** — submitted TRs are immediately available for Transport Planning.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Procurement — RM Product Requisitions View](03-procurement/PC-01-rm-product-requisitions.md) | PC-01 | DFS-036 | 2 | Pending |
| 2 | [Procurement — Transport Request Creation](03-procurement/PC-02-transport-requests.md) | PC-02 | DFS-037 | 6 | Pending |

**Sub-total**: 8 SP

---

## Epic: Transport

> Transport Planners review a unified queue of FG and RM Transport Requests, submit vehicle/type requirements (and for RM: Raw C&F Clearance Note/Approval), then create Transport Orders (TOs) against each TR. TDOs assign vehicle, driver, helpers, and ETA to each TO. Drivers see their assigned TOs in their account.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Transport Requests Queue (FG & Port Consignment)](04-transport/01-transport-requests-queue.md) | TRQ-01 | DFS-038 | 3 | Pending |
| 2 | [Transport Order Creation](04-transport/02-transport-orders.md) | TO-01 | DFS-039 | 8 | Pending |
| 3 | [TDO Vehicle, Driver, Helper & ETA Assignment](04-transport/03-tdo-assignment.md) | TO-02 | DFS-040 | 8 | Pending |

**Sub-total**: 19 SP

---

## End-to-End Flow This Sprint Delivers

```
[Depot/Feed Mill Officer]
         ↓
  PR-01: FG Product Requisition     PR-02: RM Product Requisition
  (Dest: POI dropdown)               (Dest: POI dropdown)
         ↓                                      ↓
[Distribution Officer]                [Procurement Officer]
  DR-01: View FG PR queue              PC-01: View RM PR queue
         ↓                                      ↓
  DR-02: Create TR(s) against PR       PC-02: Create TR(s) against PR
  (Source: POI dropdown)               (Source: POI dropdown)
  (Dest: inherited from PR)            (Dest: inherited from PR)
  [Qty overflow → blocked]             [Qty overflow → blocked]
         ↓                                      ↓
  Distribution Manager approves TR     TR directly available (no approval)
         ↓                                      ↓
  ←──────────── Available for Transport Planning ────────────→
                              ↓
               [Transport Planner]
         TRQ-01: Review TR queue (FG + RM tabs)
         Submit: Qty of vehicles, Vehicle Type
         For RM: + Raw C&F Clearance Note/Approval
                              ↓
               TO-01: Create TO(s) against TR
               (Own Fleet / Vendor Fleet mode)
               [Qty overflow → blocked]
                              ↓
               [Transport Distribution Officer (TDO)]
         TO-02: Assign Vehicle + Driver + Helper(s) + ETA
                              ↓
               [Driver Account]
               Driver sees assigned TO list
                              ↓
               (Sprint 4: Trip Lifecycle — Dispatch, In-Transit, POD)
```

---

## Dependency Map

```
PR-01 (FG PR)     ──→  DR-01 (Distribution PR queue)
                        └──→  DR-02 (FG TR creation + DM approval)
                                └──→  TRQ-01 (Transport Requests queue)

PR-02 (RM PR)     ──→  PC-01 (Procurement PR queue)
                        └──→  PC-02 (RM TR creation, no approval)
                                └──→  TRQ-01 (Transport Requests queue)

TRQ-01            ──→  TO-01 (TO creation)
                        └──→  TO-02 (TDO assignment + Driver view)
```

**Prerequisites from Sprint 2**:
- MDM-04 (POI) — source/destination POI selection in PR and TR forms
- MDM-01 (Product) — product selection (FG / RM type gating)
- MDM-02 (Route) — route distance/duration shown in TR assessment, ETA suggestion in TO-02
- MDM-03 (Vendor) — vendor selection in TO-02 vendor fleet assignment
- MDM-05 / MDM-06 / MDM-07 (Vehicle / Driver / Helper) — fleet assignment in TO-02

---

## Epic: QA & Testing

> Automated test suite covering all Sprint 1 & 2 features — unit tests (pytest), API integration tests, Playwright UI end-to-end tests, code coverage enforcement, and SonarQube static analysis setup.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Automated Test Suite — Sprint 1 & 2 Features](05-qa-testing/QA-01-automated-test-suite-sprint-1-2.md) | QA-01 | DFS-041 | 13 | Pending |

**Sub-total**: 13 SP

---

## Epic: DevOps & Infrastructure

> AWS shared dev environment — full stack deployed on AWS with Terraform IaC, CI/CD pipeline, HTTPS, S3, SES, and CloudWatch observability.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [AWS Dev Environment — Up & Running](06-devops/DEVOPS-01-aws-dev-environment.md) | DEVOPS-01 | DFS-042 | 8 | Pending |

**Sub-total**: 8 SP

---

## Pending Items

> No carry-overs into Sprint 3 at planning time.

---

## Demo Feedback

> No demo feedback recorded for Sprint 3 yet.

---

## Notes

- **PR and TR are distinct entities**: A Product Requisition (PR) is the demand signal raised by Depot/Feed Mill Officers. A Transport Request (TR) is the operational breakdown created by Distribution or Procurement Officers against a PR.
- **Destination is always inherited from PR to TR** — each TR for the same PR goes to the same destination. Only the Source POI varies per TR (allowing multi-source fulfillment of one PR).
- **Quantity overflow guard** applies at two levels: TR creation against PR (total TRs must not exceed PR qty), and TO creation against TR (total TOs must not exceed TR qty).
- **No Procurement Manager approval** for RM TRs — unlike FG TRs which require Distribution Manager approval, Procurement TRs go directly to Transport Planning on submission.
- **Raw C&F Clearance Note/Approval** is an RM-specific field that the Transport Planner must confirm before or during Transport Order creation for RM TRs.
- **TDO assigns all physical resources** (vehicle, driver, helpers, ETA) — this is a separate step from the Transport Planner creating the TO structure.
- **Driver mobile view** delivers assigned TO list visibility to drivers — dispatch and trip lifecycle features follow in Sprint 4.
- Jira Epics: `DFS-040` (Requisition), `DFS-041` (Distribution), `DFS-042` (Procurement), `DFS-043` (Transport)
