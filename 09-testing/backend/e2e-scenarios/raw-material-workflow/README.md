---
section: 09-testing/backend/e2e-scenarios/raw-material-workflow
title: Raw Materials Workflow — E2E Scenario Plans
version: 1.0
last_updated: 2026-08-17
last_mcp_run: 2026-08-17
last_mcp_verdict: "Happy-path chain Closed (RUN_ID=C4E217A8); §1 12/12 Pass; §2 TC04 Fail (past delivery date)"
---

# Raw Materials (RM) Workflow — E2E Scenarios

End-to-end scenario plans for the **Raw Materials (Port Consignment → TR → TO → yard)** workflow. Covers **Own Fleet** and **Vendor Fleet** (Phase 1). Each section targets **Playwright MCP** against Django Admin SSR unless noted.

**Workflow reference:** Source-first driver routing · QC-gated destination unloading (v3 **QC Queue** / **Add QC**; FB-013 Fail does not block CC assign) · TP-led Own Fleet planning · stock reduces at **Loading Completed** (source) · stock increases at **Unloading Completed** only after **QC Pass**.

**How to run:** [`playwright-mcp-runbook.md`](./playwright-mcp-runbook.md) — dependency-ordered suites, `RUN_ID` / `state.json`, wipe notes.

**Isolated fixtures:** [`mcp-playwright-rm-fixture-seed.md`](../../../05-modules/testing-plan/mcp-playwright-rm-fixture-seed.md) — `make seed-mcp-rm RUN_ID=…` for session sandbox `MCP-S/D-<RUN_ID>` (port → mill).

**Credentials:** `docs/testing/playwright-mcp-credentials.yaml`

## Sections

| Section | Topic | Actors | Scenario plan |
|---------|-------|--------|---------------|
| 1 — Port Shipment | Port Shipment registration | Commercial Officer | [`01-port-shipment/rm-commercial-officer-port-shipment-e2e-scenarios.md`](./01-port-shipment/rm-commercial-officer-port-shipment-e2e-scenarios.md) |
| 2 — TR Creation | Port Consignment TR from Port Shipment | Procurement Officer | [`02-tr-creation/rm-procurement-officer-port-tr-e2e-scenarios.md`](./02-tr-creation/rm-procurement-officer-port-tr-e2e-scenarios.md) |
| 3 — TO Creation & Live Map | Transport Order (Port Consignment) | Transport Planner | [`03-to-creation/rm-transport-planner-to-creation-e2e-scenarios.md`](./03-to-creation/rm-transport-planner-to-creation-e2e-scenarios.md) |
| 4 — TO Planning | Own Fleet assignment & milestones | Transport Planner | [`04-to-planning/rm-transport-planner-to-planning-e2e-scenarios.md`](./04-to-planning/rm-transport-planner-to-planning-e2e-scenarios.md) |
| 5 — Dispatch | Dispatch queue release | Driver Supervisor | [`05-dispatch/rm-driver-supervisor-dispatch-e2e-scenarios.md`](./05-dispatch/rm-driver-supervisor-dispatch-e2e-scenarios.md) |
| 6 — Trip Start | My Trips / trip start | Driver | [`06-trip-start/rm-driver-trip-start-e2e-scenarios.md`](./06-trip-start/rm-driver-trip-start-e2e-scenarios.md) |
| 7 — Gate In (Source) | Source gate-in | Gateman | [`07-gate-in-source/rm-gate-source-gate-in-e2e-scenarios.md`](./07-gate-in-source/rm-gate-source-gate-in-e2e-scenarios.md) |
| 8 — Scale In/Out (Source) | Source weighing | Scaling Operator | [`08-scaling-source/rm-scaling-source-scale-in-out-e2e-scenarios.md`](./08-scaling-source/rm-scaling-source-scale-in-out-e2e-scenarios.md) |
| 9 — Command Center (Source) | Bay / loading point assignment | Command Center Officer | [`09-command-center-source/rm-command-center-source-bay-assignment-e2e-scenarios.md`](./09-command-center-source/rm-command-center-source-bay-assignment-e2e-scenarios.md) |
| 10 — Loading (Source) | Start/end loading | Loading Personnel | [`10-loading-source/rm-loading-source-e2e-scenarios.md`](./10-loading-source/rm-loading-source-e2e-scenarios.md) |
| 11 — Gate Out (Source) | Source gate-out | Gateman | [`11-gate-out-source/rm-gate-source-gate-out-e2e-scenarios.md`](./11-gate-out-source/rm-gate-source-gate-out-e2e-scenarios.md) |
| 12 — Gate In (Destination) | Destination gate-in | Gateman | [`12-gate-in-destination/rm-gate-destination-gate-in-e2e-scenarios.md`](./12-gate-in-destination/rm-gate-destination-gate-in-e2e-scenarios.md) |
| 13 — Scale In/Out (Destination) | Destination weighing + QC flag | Scaling Operator | [`13-scaling-destination/rm-scaling-destination-scale-in-out-e2e-scenarios.md`](./13-scaling-destination/rm-scaling-destination-scale-in-out-e2e-scenarios.md) |
| 14 — QC Checkpoint | QC Queue + Add QC (v3; Save Draft) | QC Inspector | [`14-qc-checkpoint/rm-qc-inspector-checkpoint-e2e-scenarios.md`](./14-qc-checkpoint/rm-qc-inspector-checkpoint-e2e-scenarios.md) |
| 15 — Command Center (Destination) | Bay / unloading point assignment | Command Center Officer | [`15-command-center-destination/rm-command-center-destination-bay-assignment-e2e-scenarios.md`](./15-command-center-destination/rm-command-center-destination-bay-assignment-e2e-scenarios.md) |
| 16 — Unloading (Destination) | Start/continue/end unloading | Unloading Personnel | [`16-unloading-destination/rm-unloading-destination-e2e-scenarios.md`](./16-unloading-destination/rm-unloading-destination-e2e-scenarios.md) |
| 17 — Gate Out (Destination) | Gate-out + auto TO closure | Gateman | [`17-gate-out-destination/rm-gate-destination-gate-out-e2e-scenarios.md`](./17-gate-out-destination/rm-gate-destination-gate-out-e2e-scenarios.md) |

**Case counts (legacy spreadsheet IDs):** §1: 12 · §2: 14 · §3: 11 · §4: 13 · §5: 10 · §6: 6 · §7–17: 110 · **Total: 176** (`RM_001`–`RM_176`)

## Naming convention

- Root: `09-testing/backend/e2e-scenarios/raw-material-workflow/`
- Section folder: `NN-<short-name>/`
- Plan file: `rm-<actor(s)>-<feature>-e2e-scenarios.md`
- Internal IDs: `TC01`, `TC02`, … per plan; legacy `RM_*` IDs in **Original ID map** inside each plan

## Suggested MCP run order

1. Sections 1–2 (Port Shipment → Port TR) — fixture chain for `TR-PORT-…` / `PS-…`
2. Section 3–4 (TO create/plan) → Section 5–6 (dispatch + trip start)
3. Sections 7–11 source yard leg on one RM TO (`flow_lane = rm_inbound`)
4. Sections 12–17 destination yard leg (QC path when product is QC-enabled) → **Closed**
