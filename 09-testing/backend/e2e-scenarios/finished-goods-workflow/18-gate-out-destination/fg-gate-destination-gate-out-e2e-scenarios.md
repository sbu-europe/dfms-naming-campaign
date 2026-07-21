---
module: 06-yard-operations
specification: Finished Goods Workflow — Sections 18 — Gate Out (Destination) & Auto TO Closure — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-02, FB-004
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 18 — Gate Out (Destination) & Auto Closure — E2E Scenario Plan

**Navigation:** Gate → **Vehicle Exit (Gate-Out)** → Add (destination POI)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Gate-Out after Scale-Out | Destination scale-out complete. Record Gate-Out on active visit. | P0 | Planned |
| TC02 | TO auto-Closed on destination Gate-Out | After TC01, TO status **Closed** immediately — no manual Close action. | P0 | Planned |
| TC03 | Gate-Out blocked before destination Scale-Out | Clearance blocks premature Gate-Out. | P0 | Planned |
| TC04 | No manual Close TO queue for TP | As **Transport Planner**, assert no **Close TO** menu / closure queue; closure only via Gate-Out. | P0 | Planned |
| TC05 | Closed TO read-only | Attempt edit on **Closed** TO — form readonly / save denied. | P0 | Planned |
| TC06 | Driver/Vehicle freed for next dispatch | TO-1 **Closed**; TO-2 same resources **Assigned** — Driver Supervisor can dispatch TO-2 (Section 5 TC05). | P1 | Planned |
| TC07 | Discrepancy remarks at destination Gate-Out | Remarks saved on Gate-Out record. | P1 | Planned |
| TC08 | RBAC — Unloading Personnel denied Gate-Out | Access denied. | P0 | Planned |
| TC09 | Audit Gate-Out + Closed transition | History shows gate-out and closed status. | P1 | Planned |
| TC10 | Bill Disbursed not in FG lifecycle | Review TO status history/badge options on closed FG outbound TO — **Bill Disbursed** must not appear as a lifecycle step for this flow. *Note: enum exists in code for other lanes — assert FG happy path skips it.* | P1 | Planned |

**Original ID map:** FG_GATEOUT_D_001–010 → TC01–TC10.
