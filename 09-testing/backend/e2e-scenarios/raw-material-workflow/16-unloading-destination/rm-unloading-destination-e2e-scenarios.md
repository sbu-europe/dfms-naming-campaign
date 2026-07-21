---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 16 — Unloading (Destination) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: LD-01, STK-01, QC-01
source_spec: ../../../../../05-modules/06-yard-operations/loading-unloading.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 16 — Unloading (Destination) — E2E Scenario Plan

**Navigation:** Unloading → **Unloading Operations** / queue actions

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Unloading at assigned point | Sub-state **Assigned Unloading Point**. As **Unloading Personnel** (`unloading.personnel1.nourish@yopmail.com`), **Start Unloading**. Sub-state **Unloading Started**. | P0 | Planned |
| TC02 | Continue Unloading progress log | In progress, **Continue Unloading** logs interim progress without completing sub-state. | P1 | Planned |
| TC03 | End Unloading at point | **End Unloading** records end timestamp. | P0 | Planned |
| TC04 | Unloading Completed — single point | One point: after End → **Unloading Completed**. | P0 | Planned |
| TC05 | Multi-point — incomplete until all done | Two points; end point 1 only → stays **Unloading Started**. | P0 | Planned |
| TC06 | Multi-point — complete after final point | End point 2 → **Unloading Completed**. | P0 | Planned |
| TC07 | Independent timestamps per unloading point | Each point retains own start/continue/end times. | P1 | Planned |
| TC08 | Destination stock increases only after QC Pass + Unloading Completed | QC **Pass** fixture: note dest stock before unload; after all points complete, stock increased. | P0 | Planned |
| TC09 | Unloading blocked without CC assignment | **Waiting for Command Center** without unloading point. Blocked. | P0 | Planned |
| TC10 | RBAC — Driver denied Unloading | Driver blocked. | P0 | Planned |
| TC11 | Unloading blocked for QC-Failed TO | QC **Fail**: **Start Unloading** blocked. | P0 | Planned |
| TC12 | Audit unloading events per point | Log entries for start/continue/end + overall Unloading Completed. | P1 | Planned |

## Implementation Notes

- Stock rule: destination stock **only** after **Unloading Completed** AND **QC Pass** (QC-enabled products).
- **Original ID map:** RM_149–RM_160 → TC01–TC12.
