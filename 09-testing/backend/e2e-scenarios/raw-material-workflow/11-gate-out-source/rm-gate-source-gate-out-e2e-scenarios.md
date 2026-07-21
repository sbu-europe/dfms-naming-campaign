---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 11 — Gate Out (Source) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 11 — Gate Out (Source) — E2E Scenario Plan

**Navigation:** Gate → **Vehicle Exit (Gate-Out)** → Add

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gate-Out after Source Scale-Out | Sub-state **Scale Out (Source)**. As **Gateman**, record **Gate-Out**. TO status **Driving Towards Destination**. | P0 | Planned |
| TC02 | Gate-Out blocked before Scale-Out | Scale-Out not recorded. Blocked. | P0 | Planned |
| TC03 | Discrepancy remarks at Gate-Out | Enter remarks; assert on visit history. | P1 | Planned |
| TC04 | RBAC — Loading Personnel denied Gate-Out | Loading role cannot Gate-Out. | P0 | Planned |
| TC05 | Audit Gate-Out | User + timestamp on Gate-Out record. | P1 | Planned |
| TC06 | Main status Driving Towards Destination | After TC01, TO shows **Driving Towards Destination** on TP queue. | P0 | Planned |

## Implementation Notes

- **Original ID map:** RM_107–RM_112 → TC01–TC06.
