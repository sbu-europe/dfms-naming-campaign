---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 10 — Loading (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: LD-01, STK-01
source_spec: ../../../../../05-modules/06-yard-operations/loading-operations.md
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 10 — Loading (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Loading → **Start Loading** (`/admin/operations/loadevent/add/`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Loading at assigned point | TO sub-state **Assigned Loading Point**. As **Loading Personnel** (`loading.personnel1@yopmail.com`), **Start Loading** for bay; submit. Sub-state **Loading Started**; start timestamp recorded. | P0 | Planned |
| TC02 | End Loading at point | On in-progress load, open complete form, set **end_datetime**, line quantities, submit. End timestamp saved. | P0 | Planned |
| TC03 | Loading Completed — single point | One loading point: after End Loading, sub-state **Loading Completed**. | P0 | Planned |
| TC04 | Multi-point — not complete until all points done | Two points: end point 1 only → sub-state stays **Loading Started**. | P0 | Planned |
| TC05 | Multi-point — complete when last point ends | End point 2 after point 1 done → **Loading Completed**. | P0 | Planned |
| TC06 | Independent timestamps per point | Two points started/ended at different times; each retains own timestamps. | P1 | Planned |
| TC07 | Source stock reduces on Loading Completed | Note source POI **Current stock** before/after TC03/TC05; assert decrease by loaded qty (FG outbound source). | P0 | Planned |
| TC08 | Cannot start without CC assignment | TO **Waiting for Command Center** — Start Loading blocked. | P0 | Planned |
| TC09 | RBAC — Driver denied | Driver cannot access Loading add. | P0 | Planned |
| TC10 | Audit load events | LoadEvent rows for start/end per point visible to supervisor/admin. | P1 | Planned |

## Implementation Notes

- **Original ID map:** FG_LOAD_001–010 → TC01–TC10.
