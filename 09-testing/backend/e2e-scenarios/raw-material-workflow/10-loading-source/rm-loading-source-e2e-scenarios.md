---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 10 — Loading (Source) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: LD-01, STK-01
source_spec: ../../../../../05-modules/06-yard-operations/loading-unloading.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 10 — Loading (Source) — E2E Scenario Plan

**Navigation:** Loading → **Loading Operations** / queue actions

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Loading at assigned point | Sub-state **Assigned Loading Point**. As **Loading Personnel** (`loading.personnel1.nourish@yopmail.com`), select TO/point, **Start Loading**. Sub-state **Loading Started**; start timestamp recorded. | P0 | Planned |
| TC02 | End Loading at assigned point | Loading in progress. **End Loading**. End timestamp on point. | P0 | Planned |
| TC03 | Loading Completed — single point | One loading point: after End Loading, sub-state **Loading Completed**. | P0 | Planned |
| TC04 | Multi-point — not complete until all points done | Two points; end point 1 only. Sub-state stays **Loading Started**. | P0 | Planned |
| TC05 | Multi-point — complete after final point | End point 2 after point 1 done → **Loading Completed**. | P0 | Planned |
| TC06 | Independent timestamps per loading point | Two points with different start/end times; each retains own timestamps. | P1 | Planned |
| TC07 | Source stock reduces at Loading Completed | Note source POI stock before/after all points complete. Stock reduced by loaded qty; free capacity recalculated. | P0 | Planned |
| TC08 | Loading blocked without CC assignment | Sub-state **Waiting for Command Center**. **Start Loading** blocked. | P0 | Planned |
| TC09 | RBAC — Driver denied Loading | Driver cannot access loading screen. | P0 | Planned |
| TC10 | Audit loading events per point | Admin log: start/end per point + overall Loading Completed. | P1 | Planned |

## Implementation Notes

- **Original ID map:** RM_089–RM_098 → TC01–TC10.
