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

# Sprint 3 — Requisition (FG), Port Shipments, Transport Requests & Transport Orders

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`04-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 10 |
| Total Story Points | 68 |
| Status | Not Started |
| Epics | Requisition (FG), Port Shipments, Distribution, Procurement, Transport, QA & Testing, DevOps & Infrastructure |

---

## Menu Structure & Role Access


### Requisition *(Finished Goods only)*

> **Requisition** in the product means **internal FG demand** (Depot / Feed Mill). **Port Shipments** use a **separate top-level menu** — do not place import registration under Requisition.

| Sub-menu | Can View | Can Create | Can Edit (Draft) | Can Cancel |
|----------|----------|------------|------------------|------------|
| Finished Goods | Depot / Feed Mill Officer (own PRs) | Depot / Feed Mill Officer | Depot / Feed Mill Officer | Depot / Feed Mill Officer (before TR created) |

**Key rules:**
- **Destination POI** pre-filled from user's assigned POI (editable); **Source POI** not on PR — defined by Distribution at TR creation
- Depot / Feed Mill Officers **only** see **Requisition → Finished Goods** (no access to **Port Shipments**)

### Port Shipments *(import / inbound cargo — own top-level menu)*

| Area | Can View | Can Create | Can Edit (Draft) | Can Cancel |
|------|----------|------------|------------------|------------|
| Port Shipments (list, register, detail) | Commercial Officer (own records) | Commercial Officer | Commercial Officer | Commercial Officer (before TR created) |

**Key rules:**
- **Not a requisition** — Commercial Officers **register import shipments** (data transcribed from external systems). Shipment ref `PS-PORT-…`
- **Source Port** and **destination POIs** are **not** on the shipment record; Procurement sets Port source and per-destination TR allocation (PC-02)
- Commercial Officers **only** see **Port Shipments** (+ relevant Procurement read/create TR as designed) — **no** access to **Requisition → Finished Goods**
- Mandatory LC + shipment fields (BL, LC, Vessel, Voyage, Container, C&F Agent, POL, ETA) and Arrival Notice before submit

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
| Port Shipments *(queue)* | Procurement Officer | — | — | — |
| Transport Requests | Procurement Officer (own TRs) | Procurement Officer | — | — |

**Key rules:**
- Procurement Officer sees all submitted **Port Shipments** (registered by Commercial Officers)
- Each TR specifies: Source POI (Port), Destination POI (any active POI — per-TR allocation), and quantity for that destination
- Multiple TRs can be created for one Port Shipment (typically one per destination); total TR quantity must not exceed shipment line totals — overflow is blocked
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

## Epic: Requisition (Finished Goods)

> **Requisition** menu: **FG Product Requisitions** only — internal demand from Depot/Feed Mill Officers → Distribution.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [FG Product Requisition](01-requisition/PR-01-fg-product-requisition.md) | PR-01 | DFS-032 | 5 | Pending |

**Sub-total**: 5 SP

---

## Epic: Port Shipments

> **Port Shipments** is a **separate top-level menu** (sibling to Requisition, not a sub-menu). Commercial Officers register **import cargo** from external systems → Procurement → TR → TO.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Port Shipment (Import) Registration](01-port-shipments/PR-02-port-shipment.md) | PR-02 | DFS-033 | 5 | Pending |

**Sub-total**: 5 SP

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

> Procurement Officers view **Port Shipments** (registered by Commercial Officers) and create **Transport Requests** to plan distribution — typically one TR per destination POI. Source POI is always a Port (per TR). Destination POI is defined **per TR** (any active POI). Total TR allocations must not exceed the **Port Shipment** line quantities. **No manager approval** — submitted TRs go straight to Transport Planning; **Transport Orders** are created later by the Transport Planner (TO-01).

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Procurement — Port Shipments Queue (View)](03-procurement/PC-01-rm-product-requisitions.md) | PC-01 | DFS-036 | 2 | Pending |
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
│  REQUISITION (FG)                    PORT SHIPMENTS (separate top-level menu)                │
│                                                                                              │
│  Depot/Feed Mill Officer             Commercial Officer                                     │
│  └── Requisition > Finished Goods   └── Port Shipments > Register / list                   │
│      Create FG PR                        Import shipment (LC + RM lines; no POIs on record)  │
│      (dest: pre-filled/editable; no source)                                                  │
└──────────────────────────────┬───────────────────────────────┬──────────────────────────────┘
                               │                               │
                   FG PR submitted                   Port Shipment submitted
                       │                                       │
         ┌─────────────▼──────┐              ┌────────────────▼───────────────────┐
         │  DISTRIBUTION      │              │  PROCUREMENT                        │
         │  Distribution      │              │  Procurement Officer                │
         │  Officer           │              │  ├── Port Shipments (queue)         │
         │  ├── Product Reqs  │              │  │   (import registrations)         │
         │  │   (view FG PRs) │              │  └── Transport Requests             │
         │  └── Transport Reqs│              │      Create TR(s) vs shipment       │
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

PR-02 (Port Shipment) ──→  PC-01 (Procurement shipment queue)
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
| TR creation against FG PR | Sum of all TRs for a PR must not exceed PR total quantity | Creation blocked with error if overflow |
| TR creation against Port Shipment | Sum of all TR allocations must not exceed shipment line quantities | Creation blocked with error if overflow |
| TO creation against TR | Sum of all TOs for a TR must not exceed TR total quantity | Creation blocked with error if overflow |

---

## Role Summary

| Role | Module Access | Key Permissions |
|------|--------------|-----------------|
| Depot / Feed Mill Officer | Requisition → Finished Goods | Create FG PRs; view own PRs |
| Commercial Officer | **Port Shipments** (top-level) | Register import shipments; view own records (no Requisition/FG access) |
| Distribution Officer | Distribution | View FG PR queue; create FG TRs |
| Distribution Manager | Distribution | View all FG TRs pending approval; approve / modify / reject TRs |
| Procurement Officer | Procurement | View Port Shipment queue; create RM TRs for destination breakdown (no approval needed) |
| Transport Planner | Transport | View TR queue (FG + RM tabs); submit planning details; create TOs |
| Transport Distribution Officer (TDO) | Transport | Assign vehicle / driver / helpers / ETA to TOs |
| Driver | Driver Account | View own assigned TO list |

---

## Notes

- **Navigation**: **Requisition** = **Finished Goods only**. **Port Shipments** = **dedicated top-level menu** for Commercial Officers (import registration — not nested under Requisition). **TR** = operational breakdown: Distribution vs FG PRs; Procurement vs Port Shipments.
- **FG TRs**: Destination is inherited from the PR (read-only on TR form). Source POI is selected per TR — enabling multi-source fulfillment of one PR.
- **Port Consignment TRs** (transport type): Destination is defined per TR by Procurement (any active POI) — not on the shipment record. Source is always a Port POI. **TOs** are created by the Transport Planner after planning inputs (TRQ-01 / TO-01).
- **Quantity overflow guard**: TR allocations vs parent FG PR or Port Shipment totals; TO quantities vs TR totals.
- **No Procurement Manager approval** for Port Consignment TRs — unlike FG TRs which require Distribution Manager approval, Procurement TRs go directly to Transport Planning on submission.
- **Raw C&F Clearance Note/Approval** is an RM-specific field the Transport Planner must confirm at planning input submission (before TO creation). It is captured as a Yes/No confirmation that the clearance has been obtained.
- **TDO assigns all physical resources** (vehicle, driver, helpers, ETA) — this is a separate step from the Transport Planner creating the TO structure.
- **Driver mobile view** delivers assigned TO list visibility — dispatch and trip lifecycle features follow in Sprint 4.
- Jira Epics: `DFS-043` (Requisition), `DFS-044` (Distribution), `DFS-045` (Procurement), `DFS-046` (Transport) — **note**: story IDs `DFS-032`–`DFS-042` are individual story/task keys; epic keys above are separate.
- Story IDs in Transport table: TRQ-01=DFS-038, TO-01=DFS-039, TO-02=DFS-040 are story-level keys, not epic keys.
