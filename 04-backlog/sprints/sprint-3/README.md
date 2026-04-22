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


### Requisition

| Sub-menu | Can View | Can Create | Can Edit (Draft) | Can Cancel |
|----------|----------|------------|------------------|------------|
| Finished Goods | Depot / Feed Mill Officer (own PRs) | Depot / Feed Mill Officer | Depot / Feed Mill Officer | Depot / Feed Mill Officer (before TR created) |
| Port Consignment | Commercial Officer (own PRs) | Commercial Officer | Commercial Officer | Commercial Officer (before TR created) |

**Key rules:**
- **Finished Goods**: Destination POI pre-filled from user's assigned POI (editable); Source POI not captured — defined by Distribution at TR creation
- **Port Consignment**: Source and Destination POIs not captured on PR — source is always a Port; Procurement defines destination allocation at TR creation
- Role gate: Depot/Feed Mill Officers can only create FG PRs; Commercial Officers can only create Port Consignment PRs — each role sees only their sub-menu
- Port Consignment PRs require mandatory LC + shipment fields (BL Number, LC Number, Vessel, Voyage, Container, C&F Agent, POL, ETA) and Arrival Notice attachment before submission

### Distribution

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| Product Requisitions | Distribution Officer, Distribution Manager | — | — | — |
| Transport Requests | Distribution Officer (own TRs), Distribution Manager (all) | Distribution Officer | Distribution Manager | Distribution Manager |

**Key rules:**
- Distribution Officer sees all submitted FG PRs in the Product Requisitions queue
- Distribution Officer creates TRs against a PR — source POI selected per TR; destination inherited from the PR (read-only)
- Multiple TRs can be created for one PR (different source POIs); total TR quantity must not exceed PR quantity — overflow is blocked
- Distribution Manager can approve as-is, approve with modification (qty, date, priority, vehicle requirements), reject with reason, or request clarification
- Approved TRs transition to `Available for Transport Planning`

### Procurement

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| Product Requisitions | Procurement Officer | — | — | — |
| Transport Requests | Procurement Officer (own TRs) | Procurement Officer | — | — |

**Key rules:**
- Procurement Officer sees all submitted **Port Consignment PRs** (raised by Commercial Officers)
- Each TR specifies: Source POI (Port), Destination POI (any active POI — per-TR allocation), and quantity for that destination
- Multiple TRs can be created for one PR (one per destination); total TR quantity must not exceed PR quantity — overflow is blocked
- **No manager approval step** — submitted TRs are immediately `Available for Transport Planning`

### Transport

| Sub-menu | Can View | Can Submit Planning Details |
|----------|---------|-----------------------------|
| Transport Requests → Finished Goods | Transport Planner | Transport Planner |
| Transport Requests → Raw Materials | Transport Planner | Transport Planner |

| Action | Actor |
|--------|-------|
| Create TO(s) against a TR | Transport Planner |
| View all TOs | Transport Planner |
| View own-fleet TOs (Own Fleet queue) | TDO (Own Fleet) |
| View vendor-fleet TOs (Vendor Fleet queue) | TDO (Vendor Fleet) |
| Assign Vehicle / Driver / Helper(s) / ETA | TDO (Own Fleet) |
| Assign Vendor | TDO (Vendor Fleet) |
| View assigned TOs | Driver (own assignments only) |

**Key rules:**
- Transport Planner sees a unified queue of TRs with status `Available for Transport Planning` or `Under Planning`; FG and RM separated into sub-tabs
- Before creating TOs, Transport Planner submits planning details: qty of vehicles, vehicle type, and for RM TRs: Raw C&F Clearance Note/Approval
- Submitting planning details transitions TR to `Under Planning`
- Multiple TOs can be created per TR; total TO quantity must not exceed TR quantity — overflow is blocked
- For Own Fleet TOs: vehicle and driver selected from MDM fleet records; for Vendor Fleet TOs: vendor from contractual list, vehicle/driver entered manually
- Driver logs in and sees only TOs assigned to them

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

> Procurement Officers view Port Consignment Product Requisitions (raised by Commercial Officers) and create Transport Requests against them — one TR per destination POI. The Source POI is always a Port-type POI (selected per TR). The Destination POI is defined **per TR** by the Procurement Officer (any active non-Port POI) — it is **not** inherited from the PR, because Port Consignment PRs capture no destination. Total TR quantity across all TRs for a PR must not exceed the PR total quantity. **No manager approval step** — submitted TRs are immediately available for Transport Planning.

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
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUISITION MODULE                                                                          │
│                                                                                              │
│  Depot/Feed Mill Officer                          Commercial Officer                         │
│  └── Requisition > Finished Goods                 └── Requisition > Port Consignment        │
│      Create FG PR                                     Create Port PR                        │
│      (dest: pre-filled/editable; no source)           (LC + shipment fields; no POIs)       │
└──────────────────────────────┬───────────────────────────────┬──────────────────────────────┘
                               │                               │
                   FG PR submitted                   Port Consignment PR submitted
                       │                                       │
         ┌─────────────▼──────┐              ┌────────────────▼───────────────────┐
         │  DISTRIBUTION      │              │  PROCUREMENT                        │
         │  Distribution      │              │  Procurement Officer                │
         │  Officer           │              │  ├── Product Requisitions           │
         │  ├── Product Reqs  │              │  │   (view Port Consign. PRs)       │
         │  │   (view FG PRs) │              │  └── Transport Requests             │
         │  └── Transport Reqs│              │      Create TR(s) vs PR             │
         │      Create TR(s)  │              │      Source: Port POI               │
         │      Source: POIs  │              │      Dest: per-TR (any active POI)  │
         │      Dest: from PR │              │      [qty overflow → ✗]             │
         │      [qty overflow]│              │      ↓                              │
         │      ↓             │              │  No approval step                   │
         │  Distribution Mgr  │              │  TR → Available for                 │
         │  Approve / Modify  │              │  Transport Planning                 │
         │  Reject / Clarify  │              └─────────────────────────────────────┘
         │      ↓             │
         │  TR → Available    │
         │  for Transport     │
         └─────────┬──────────┘
                   │
                   └──────────────────────────┐
                                              │
         ┌────────────────────────────────────▼────────────────────────────┐
         │  TRANSPORT MODULE                                                │
         │  Transport Planner                                               │
         │  ├── Transport Requests > Finished Goods  (approved FG TRs)     │
         │  └── Transport Requests > Raw Materials   (submitted RM TRs)    │
         │      ↓                                                           │
         │      Submit planning details:                                    │
         │        • Qty of vehicles required                                │
         │        • Vehicle type required                                   │
         │        • [RM only] Raw C&F Clearance Note/Approval              │
         │      TR → Under Planning                                         │
         │      ↓                                                           │
         │  Transport Orders                                                │
         │      Create TO(s) against TR                                     │
         │        • Transport Mode: Own Fleet / Vendor Fleet                │
         │        • Quantity per TO  [overflow → ✗]                        │
         │      ↓                                                           │
         │  Transport Distribution Officer (TDO)                            │
         │      Assign to each TO:                                          │
         │        • Vehicle (from fleet / manual for vendor)                │
         │        • Driver (from pool / manual for vendor)                  │
         │        • Helper(s) (optional)                                    │
         │        • ETA                                                     │
         │      TO → Assigned → Ready for Dispatch                         │
         │      ↓                                                           │
         │  Driver (My Assignments sidebar)                                 │
         │      Driver sees assigned TO list                                │
         └─────────────────────────────────────────────────────────────────┘
                   ↓
         (Sprint 4: Dispatch → In-Transit → POD → Trip Closure)
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

> No demo feedback recorded for Sprint 3 yet. Full feedback log: [`07-feedback/README.md`](07-feedback/README.md)

---

## Quantity Overflow Rules

| Level | Rule | Behaviour |
|-------|------|-----------|
| TR creation against PR | Sum of all TRs for a PR must not exceed PR total quantity | Creation blocked with error if overflow |
| TO creation against TR | Sum of all TOs for a TR must not exceed TR total quantity | Creation blocked with error if overflow |

---

## Role Summary

| Role | Module Access | Key Permissions |
|------|--------------|-----------------|
| Depot / Feed Mill Officer | Requisition → Finished Goods | Create FG PRs; view own PRs |
| Commercial Officer | Requisition → Port Consignment | Create Port Consignment PRs with LC + shipment details; view own PRs |
| Distribution Officer | Distribution | View FG PR queue; create FG TRs |
| Distribution Manager | Distribution | View all FG TRs pending approval; approve / modify / reject TRs |
| Procurement Officer | Procurement | View Port Consignment PR queue; create RM TRs (no approval needed) |
| Transport Planner | Transport | View TR queue (FG + RM tabs); submit planning details; create TOs |
| Transport Distribution Officer (TDO) | Transport | Assign vehicle / driver / helpers / ETA to TOs |
| Driver | Driver Account | View own assigned TO list |

---

## Notes

- **PR and TR are distinct entities**: A Product Requisition (PR) is the demand signal. A Transport Request (TR) is the operational breakdown created by Distribution or Procurement Officers against a PR.
- **FG TRs**: Destination is inherited from the PR (read-only on TR form). Source POI is selected per TR — enabling multi-source fulfillment of one PR.
- **Port Consignment TRs**: Destination is defined per TR by the Procurement Officer (any active POI) — not inherited from the PR. Source is always a Port POI.
- **Quantity overflow guard** applies at two levels: TR creation against PR (total TRs must not exceed PR qty), and TO creation against TR (total TOs must not exceed TR qty).
- **No Procurement Manager approval** for Port Consignment TRs — unlike FG TRs which require Distribution Manager approval, Procurement TRs go directly to Transport Planning on submission.
- **Raw C&F Clearance Note/Approval** is an RM-specific field the Transport Planner must confirm at planning input submission (before TO creation). It is captured as a Yes/No confirmation that the clearance has been obtained.
- **TDO assigns all physical resources** (vehicle, driver, helpers, ETA) — this is a separate step from the Transport Planner creating the TO structure.
- **Driver mobile view** delivers assigned TO list visibility — dispatch and trip lifecycle features follow in Sprint 4.
- Jira Epics: `DFS-043` (Requisition), `DFS-044` (Distribution), `DFS-045` (Procurement), `DFS-046` (Transport) — **note**: story IDs `DFS-032`–`DFS-042` are individual story/task keys; epic keys above are separate.
- Story IDs in Transport table: TRQ-01=DFS-038, TO-01=DFS-039, TO-02=DFS-040 are story-level keys, not epic keys.
