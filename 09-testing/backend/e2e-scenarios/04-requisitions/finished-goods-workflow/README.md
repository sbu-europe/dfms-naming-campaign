---
section: 09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow
title: Finished Goods Workflow — E2E Scenario Plans
version: 1.1
last_updated: 2026-07-20
---

# Finished Goods Workflow — E2E Scenarios

End-to-end scenario plans for the Finished Goods (FG) requisition-to-delivery workflow, grouped by workflow section. Each section maps to the PRD / test-suite section numbering and targets **Playwright MCP** against Django Admin SSR unless noted.

**How to run:** [`playwright-mcp-runbook.md`](./playwright-mcp-runbook.md) — dependency-ordered suites (`01-pr-artifacts` → … → `13-18-dest-yard-artifacts`), OTP skip, `RUN_ID` / `state.json`, wipe notes.

**Isolated fixtures:** [`mcp-playwright-fg-fixture-seed.md`](../../../../../05-modules/testing-plan/mcp-playwright-fg-fixture-seed.md) — session `MCP-S/D-<RUN_ID>` sandbox (`seed-mcp-fg` / `wipe-mcp-fg`); do not bind the chain to leftover `CTG-*` data.

## Sections

| Section | Topic | Actors | Scenario plan |
|---------|-------|--------|---------------|
| 1 — PR Creation | Product Requisition | Depot Officer, Feed Mill Officer | [`01-pr-creation/fg-depot-feed-mill-officer-product-requisition-pr-creation-e2e-scenarios.md`](./01-pr-creation/fg-depot-feed-mill-officer-product-requisition-pr-creation-e2e-scenarios.md) |
| 2 — TR Creation | Transport Request | Distribution Officer | [`../fg-distribution-officer-transport-request-e2e-scenarios.md`](../fg-distribution-officer-transport-request-e2e-scenarios.md) |
| 3 — TR Approval | Transport Request | Distribution Manager | [`../fg-distribution-manager-transport-request-approval-e2e-scenarios.md`](../fg-distribution-manager-transport-request-approval-e2e-scenarios.md) |
| 4 — TO Creation & Planning | Transport Order, Live GPS | Transport Planner | [`../../05-transport/fg-transport-planner-transport-order-e2e-scenarios.md`](../../05-transport/fg-transport-planner-transport-order-e2e-scenarios.md) |
| 5 — Dispatch | Transport Order | Driver Supervisor | [`../../08-fleet-management/fg-driver-supervisor-dispatch-e2e-scenarios.md`](../../08-fleet-management/fg-driver-supervisor-dispatch-e2e-scenarios.md) |
| 6 — Trip Start | My Trips | Driver | [`../../08-fleet-management/fg-driver-my-trips-e2e-scenarios.md`](../../08-fleet-management/fg-driver-my-trips-e2e-scenarios.md) |
| 7 — Gate In (Source) | Gate | Gateman | [`../../06-yard-operations/fg-gate-source-gate-in-e2e-scenarios.md`](../../06-yard-operations/fg-gate-source-gate-in-e2e-scenarios.md) |
| 8 — Scale In (Source) | Scaling | Scaling Operator | [`../../06-yard-operations/fg-scaling-source-scale-in-out-e2e-scenarios.md`](../../06-yard-operations/fg-scaling-source-scale-in-out-e2e-scenarios.md) (TC01–TC08) |
| 9 — Command Center (Source) | Bay / loading assignment | Command Center Officer | [`../../06-yard-operations/fg-command-center-source-bay-assignment-e2e-scenarios.md`](../../06-yard-operations/fg-command-center-source-bay-assignment-e2e-scenarios.md) |
| 10 — Loading (Source) | Loading | Loading Personnel | [`../../06-yard-operations/fg-loading-source-e2e-scenarios.md`](../../06-yard-operations/fg-loading-source-e2e-scenarios.md) |
| 11 — Scale Out (Source) | Scaling | Scaling Operator | [`../../06-yard-operations/fg-scaling-source-scale-in-out-e2e-scenarios.md`](../../06-yard-operations/fg-scaling-source-scale-in-out-e2e-scenarios.md) (TC09–TC16) |
| 12 — Gate Out (Source) | Gate | Gateman | [`../../06-yard-operations/fg-gate-source-gate-out-e2e-scenarios.md`](../../06-yard-operations/fg-gate-source-gate-out-e2e-scenarios.md) |
| 13 — Gate In (Destination) | Gate | Gateman | [`../../06-yard-operations/fg-gate-destination-gate-in-e2e-scenarios.md`](../../06-yard-operations/fg-gate-destination-gate-in-e2e-scenarios.md) |
| 14 — Scale In (Destination) | Scaling | Scaling Operator | [`../../06-yard-operations/fg-scaling-destination-scale-in-out-e2e-scenarios.md`](../../06-yard-operations/fg-scaling-destination-scale-in-out-e2e-scenarios.md) (TC01–TC06) |
| 15 — Command Center (Destination) | Bay / unloading assignment | Command Center Officer | [`../../06-yard-operations/fg-command-center-destination-bay-assignment-e2e-scenarios.md`](../../06-yard-operations/fg-command-center-destination-bay-assignment-e2e-scenarios.md) |
| 16 — Unloading (Destination) | Unloading | Unloading Personnel | [`../../06-yard-operations/fg-unloading-destination-e2e-scenarios.md`](../../06-yard-operations/fg-unloading-destination-e2e-scenarios.md) |
| 17 — Scale Out (Destination) | Scaling | Scaling Operator | [`../../06-yard-operations/fg-scaling-destination-scale-in-out-e2e-scenarios.md`](../../06-yard-operations/fg-scaling-destination-scale-in-out-e2e-scenarios.md) (TC07–TC13) |
| 18 — Gate Out (Destination) | Gate + auto TO closure | Gateman | [`../../06-yard-operations/fg-gate-destination-gate-out-e2e-scenarios.md`](../../06-yard-operations/fg-gate-destination-gate-out-e2e-scenarios.md) |

**Case counts (legacy spreadsheet IDs):** §1: 15 · §2: 15 · §3: 12 · §4: 31 · §5: 10 · §6: 6 · §7–18: 69 · **Total: 158**

## Naming convention

- Section folder (where used): `NN-<short-name>/` under `finished-goods-workflow/`
- Cross-module files: `fg-<actor(s)>-<feature>-e2e-scenarios.md` under `04-requisitions/`, `05-transport/`, `06-yard-operations/`, `08-fleet-management/`
- Internal IDs: `TC01`, `TC02`, … with legacy `FG_*` IDs in **Original ID map** inside each plan

## Suggested MCP run order

Full procedure (artifacts folders, actors, exit statuses, resume/wipe): **[`playwright-mcp-runbook.md`](./playwright-mcp-runbook.md)**.

1. Sections 1–3 (PR → TR → DM approve) — fixture chain for `TR-FG-…`
2. Section 4 (TO create/plan) → Section 5–6 (dispatch + trip start)
3. Sections 7–12 source yard leg on one TO
4. Sections 13–18 destination yard leg → **Closed**

Credentials: `docs/testing/playwright-mcp-credentials.yaml`
