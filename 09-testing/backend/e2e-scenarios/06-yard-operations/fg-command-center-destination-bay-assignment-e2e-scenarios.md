---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 15 — Command Center (Destination) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01, FB-001
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 15 — Command Center (Destination) — Bay & Unloading Assignment — E2E Scenario Plan

**Navigation:** Command Center → **Queue** → **Assign unloading point**

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC sees destination waiting queue | After destination Scale-In, TO in **Command Center → Queue** (`waiting`). | P0 | Planned |
| TC02 | Assign Bay and Unloading Point | Save assignment; sub-state **Assigned Unloading Point**. | P0 | Planned |
| TC03 | Multi-point unloading assignment | Two unloading points assigned and tracked independently. | P1 | Planned |
| TC04 | Unloading Personnel queue visibility | *Rewrite notification AC:* Unloading Personnel sees assignment via **Start Unloading** queue / `?bay_assignment=` deep link. | P1 | Planned |
| TC05 | RBAC — Driver denied | Cannot access bay assignment add. | P0 | Planned |
| TC06 | Audit destination assignment | BayAssignment record logged. | P1 | Planned |

**Original ID map:** FG_CC_D_001–006 → TC01–TC06.
