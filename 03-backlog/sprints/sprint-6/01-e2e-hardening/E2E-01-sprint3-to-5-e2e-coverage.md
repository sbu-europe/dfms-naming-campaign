---
jira_key: DFS-072
jira_type: Story
jira_sprint: "Sprint 6"
carry_from: "Sprint 5"
story_id: E2E-01
title: E2E Hardening — End-to-End Test Coverage for Sprint 3 → Sprint 5 Scope
epic: E2E Hardening
status: Planned
story_points: 21
assignee: ~
carry_subtasks:
  - DS-01-19
  - DS-02-19
  - DM-01-13
  - GT-01-14
  - GT-02-13
  - SC-01-14
  - LUP-01-9
  - CC-01-12
  - LD-01-10
  - TLS-01-11
  - POD-01-11
  - QC-01-14
  - YARD-01-8
  - VM-01-12
  - VM-02-9
  - VM-03-11
  - VM-04-13
  - VM-05-11
  - VM-06-10
  - VM-07-6
  - VM-08-5
  - TEVF-01-8
  - TEVF-02-6
  - TEVF-03-5
source: ../../sprint-5/completion-report.md
---

# E2E-01 — End-to-End Test Coverage for Sprint 3 → Sprint 5 Scope

> All 23 story-level E2E sub-tasks were deferred from Sprint 5 as a conscious capacity trade-off
> ([Sprint 5 completion report § Carry-Forward](../../sprint-5/completion-report.md)).
> Sprint 6 runs them as a **dedicated E2E hardening track**, extended backwards to cover
> Sprint 3 flows (PR, TR, TO, port shipments) that never received story-level E2E sub-tasks.

---

## User Stories

**As a** Tech Lead
**I want** every Sprint 3–5 story verified by an automated or scripted E2E pass
**So that** Phase 1 UAT starts from a known-good baseline — without relying on manual developer spot-checks or demo sessions as the quality gate.

**As a** Product Owner
**I want** a published E2E coverage report before UAT begins
**So that** I can confidently sign off that the system behaves end-to-end as specified in the PRD, and that any defects found in UAT are new regressions rather than known unfixed issues.

---

## Business Context

### Why a dedicated E2E hardening sprint is needed

DFMS Phase 1 spans 19+ stories delivered across Sprints 3–5: gate operations, scaling, command center, loading/unloading, QC, POD closure, vendor management (8 VM stories), vendor-fleet execution (3 TEVF stories), driver supervisor, stock management, and the role dashboard. Each story was shipped with unit tests and manual QA — but no cross-story automated journey tests exist yet.

UAT will be run by customer stakeholders who expect the system to work end-to-end across the full operational flow: a product requisition raised in the office becoming a delivery recorded at the destination, with every intermediate step captured in the trip timeline and audit log. If E2E journeys are not verified before UAT, any cross-module integration bug discovered during UAT becomes a sprint-disrupting emergency fix that could delay Phase 1 acceptance.

Sprint 6 front-loads this risk by dedicating the 23 deferred story-level sub-tasks and 9 new cross-module journey scenarios to a single harness, with a published coverage report before the UAT package is handed to the customer.

### What "E2E" means in this context

E2E tests in DFMS are **journey tests** — they simulate a real operational flow from the perspective of one or more roles, calling real API endpoints against a seeded staging environment (Docker Compose stack). They are not unit tests and not browser-based UI automation. They exercise:

- **RBAC**: does each role see what it should? Does a vendor see contracted rates (they must not)?
- **Status machine correctness**: can a TO only be dispatched after pre-conditions are met? Does a QC fail correctly block unloading?
- **Cross-module integration**: does a stock reservation set in TR correctly reduce stock when the scale-out happens in a later step?
- **Audit trail**: does the timeline contain every expected TLS-01 event in the right order?

### Seed data strategy

The E2E seed data pack (E2E-01-1) is designed to be **shared with UAT-01-4** — same tenants, same POIs, same vehicles, same vendor accounts. This means E2E and UAT testers work against the same known world, and a UAT scenario can reference the exact same setup steps as the E2E test.

### Scope boundary

E2E-01 does **not** include:
- GPS E2E scenario — that runs on this harness but is owned by GPS-05-9.
- UAT execution with the customer — that is a post-sprint activity (UAT-01).
- New feature development — any defect found that requires >0.5 SP of fix goes to the owning story's backlog, not silent scope growth in E2E-01.

---

## Acceptance Criteria

### AC-1 — Harness & Environment

- An agreed E2E execution approach exists and is documented: test runner, target environment (staging via `docker compose`), authentication strategy per role, and deterministic seed data.
- Seed data pack provisions: ≥2 POIs with L/U points, vehicles with drivers, an approved contractual vendor and an approved non-contractual vendor, product master data, and stock baselines (reusable by UAT-01-4).
- E2E suite is runnable as a single command and produces a machine-readable pass/fail summary.
- Suite is wired into CI (or a documented manual cadence if CI execution time is prohibitive — decision recorded).

### AC-2 — Story-Level E2E Sub-tasks (carry-over)

- All 23 carried sub-tasks listed in the frontmatter pass in staging.
- Each carried sub-task validates the scope defined in its owning story's Sprint 5 file (e.g. DS-01-19 validates checklist skip/approval/rejection, maintenance rollback to `under_planning`, return-to-service).
- A failed sub-task raises a defect against the owning story; the sub-task is only marked done when the defect is fixed and the test passes.

### AC-3 — Journey: FG Outbound Own-Fleet (Sprint 3 → 5 spine)

End-to-end pass of: Depot Officer raises PR → DO creates TR (source POI selection) → DM approves (stock reservation, capacity warning path) → TP creates TO/Trip and assigns vehicle + driver → pre-dispatch checklist → dispatch → driver Trip Start (lane-aware) → source gate-in → scale-in (P.C. code) → CC queue → bay assignment (stock guard) → loading per line item → scale-out (stock deduction) → gate-out → in-transit → destination gate-in → unloading → POD upload → auto-closure. Timeline (`GET …/timeline`) shows every TLS-01 event in order.

### AC-4 — Journey: RM Inbound Port Shipment

Port shipment registration → TR → TO → gate-in → scale-in → QC sampling → **both** QC outcomes verified: pass (destination stock credit, unload proceeds) and fail → resample (CC assignment cancelled, timeline events with audit payload) → closure.

### AC-5 — Journey: On-Demand TO at Gate

Gateman creates on-demand TO for Dealer DO and Supplier PO paths with **multiple product line items** (product, qty, `qc_required` flag); `qc_required` line item correctly triggers QC; per-line-item load/unload capture verified.

### AC-6 — Journey: Vendor Fleet (Non-Contractual + Contractual)

- Non-contractual: vendor registration with OTP → forgot-password path → tenant join → tenant approval (exactly one vendor type) → TDO creates TOs → bundles into Bid (`bid_number`) → vendor lists Bids, submits with `participating_to_ids`, withdraws and re-submits → TDO evaluates and awards per-TO → vehicle-driver submission (validation rules) → Start Trip → yard progress visible in vendor portal without vendor action → Complete Trip at `delivered_unloaded` → closure **without POD** (vendor-fleet closure rule).
- Contractual: direct assignment with capacity split → execution handoff → closure. Contracted rate **never visible** on any vendor-facing response (RBAC assertion).

### AC-7 — Journey: Stock Lifecycle (STK-01)

TR approval increments reservation → scale-out deducts current + reserved stock with movement log → QC pass credits destination → `GET /api/v1/pois/{poi_id}/stock-snapshot` reflects each step with correct RBAC per role; CC bay assignment returns 409 on insufficient stock; underflow logs `STOCK_UNDERFLOW_WARNING` without blocking.

### AC-8 — Dashboard Verification (DB-01 closeout)

For each operational role, DB-01 KPI card counts match the underlying work screens for the same seed state (closes the DB-01 "PO live walkthrough" partial AC from Sprint 5). Site-scoped user with no site shows fail-closed zeros + warning.

### AC-9 — Coverage Report

`E2E-01-coverage-report.md` published in this folder: per-story pass/fail matrix (all 23 carried sub-tasks + journeys), defects raised/fixed, known gaps with owner and target. Reviewed with Tech Lead + PO.

---

## Access & Permissions (test role matrix)

E2E-01 is a **testing story** — it does not create new API endpoints. However, it must verify the following access rules for every journey:

| Test assertion | Roles exercised |
|----------------|-----------------|
| FG outbound journey | Depot Officer, Distribution Manager, Transport Planner, TDO, Driver Supervisor, Driver, Gateman, Scaling Op, CC Officer, Loading Op |
| RM inbound journey | Commercial Officer, TP, TDO, Gateman, Scaling Op, QC Inspector |
| On-demand TO at gate | Gateman (only role that can create on-demand TO) |
| Vendor non-contractual journey | TDO — Vendor Fleet, Vendor (external), Gate/Scale/CC/Unloading for yard steps |
| Stock lifecycle | Distribution Manager (TR approval), Scaling Op (scale-out), TP (stock snapshot read) |
| Dashboard verification | One user per operational role, plus site-scoped user |
| RBAC negative assertions | Vendor cannot see contracted rate; Gateman cannot access maps dashboard; Vendor cannot access own-fleet operations |

> The E2E harness must authenticate as each role using seeded test users. Secrets (test user credentials) are injected via environment variables — not hardcoded in test code.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| E2E-01-1 | Harness foundation | Runner choice, staging strategy, role auth fixtures, seed data pack, single-command execution, CI wiring decision | High | Not started |
| E2E-01-2 | FG outbound own-fleet journey | AC-3 — PR → TR → TO → yard execution → closure with timeline assertion | High | Not started |
| E2E-01-3 | RM inbound port shipment journey | AC-4 — including QC pass and fail/resample branches | High | Not started |
| E2E-01-4 | On-demand TO journey | AC-5 — Dealer DO + Supplier PO, multi line items, QC trigger | High | Not started |
| E2E-01-5 | Vendor non-contractual journey | AC-6 — registration → Bid → award → execution → closure without POD | High | Not started |
| E2E-01-6 | Vendor contractual journey | AC-6 — assignment → handoff → closure; rate hidden | Medium | Not started |
| E2E-01-7 | Stock lifecycle journey | AC-7 — reservation → deduction → credit → snapshot/RBAC/guards | Medium | Not started |
| E2E-01-8 | Dashboard verification | AC-8 — KPI counts vs work screens per role | Medium | Not started |
| E2E-01-9 | Coverage report | AC-9 — matrix, defects, gaps; TL + PO review | Medium | Not started |

### Carried story-level E2E sub-tasks (executed under this story)

| Group | Sub-tasks |
|-------|-----------|
| Own-fleet operations | DS-01-19, DS-02-19, DM-01-13, GT-01-14, GT-02-13, SC-01-14, LUP-01-9, CC-01-12, LD-01-10, TLS-01-11, POD-01-11, QC-01-14, YARD-01-8 |
| Vendor management | VM-01-12, VM-02-9, VM-03-11, VM-04-13, VM-05-11, VM-06-10, VM-07-6, VM-08-5 |
| Vendor-fleet execution | TEVF-01-8, TEVF-02-6, TEVF-03-5 |

> Scope of each carried sub-task: see the owning story file in [`sprint-5/`](../../sprint-5/README.md). The GPS E2E scenario (GPS-05-9, superseding Sprint 5's GPS-01-13) is tracked inside [GPS-05](../02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) but runs on this harness. STK-01-11 is absorbed by E2E-01-7.

---

## Definition of Done

- [ ] Harness runnable as one command against staging with seeded data (E2E-01-1)
- [ ] All 23 carried story-level E2E sub-tasks pass (AC-2)
- [ ] All journey scenarios E2E-01-2 → E2E-01-8 pass (AC-3 … AC-8)
- [ ] Defects found are fixed or explicitly accepted by PO with a target
- [ ] `E2E-01-coverage-report.md` published and reviewed (AC-9)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Sprint 5 functional scope merged | Upstream | All journeys exercise `feat/sprint-5` deliverables on the integration branch |
| Staging environment | Ops | Docker-compose stack incl. Redis, Celery, GT06 mock for GPS-01-13 |
| UAT-01 seed data pack | Shared | E2E-01-1 seed data is reused by UAT-01-4 — coordinate format |
| Vendor app (VAPP-01) | Consumer | Vendor journeys validate the same APIs the release build calls |

---

*Epic: E2E Hardening | Phase: 1 | Sprint 6: 21 SP | Jira: DFS-072 | Last Updated: 2026-06-15*
