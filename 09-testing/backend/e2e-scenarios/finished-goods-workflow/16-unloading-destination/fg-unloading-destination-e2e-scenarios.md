---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 16 — Unloading (Destination POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: LD-01, STK-01
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 16 — Unloading (Destination POI) — E2E Scenario Plan

**Navigation:** Unloading → **Start Unloading** (`/admin/operations/unloadevent/add/`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Start Unloading at assigned point | Sub-state **Assigned Unloading Point**. **Unloading Personnel** (`unloading.personnel1@yopmail.com`) starts unload → **Unloading Started**. | P0 | Planned |
| TC02 | End Unloading at point | Complete with end datetime + line captures. | P0 | Planned |
| TC03 | Unloading Completed — single point | Sole point ended → **Unloading Completed**. | P0 | Planned |
| TC04 | Multi-point partial — not complete | Point 1 only → remains **Unloading Started**. | P0 | Planned |
| TC05 | Multi-point final completion | Point 2 ends → **Unloading Completed**. | P0 | Planned |
| TC06 | Independent timestamps per unloading point | Per-point start/end retained. | P1 | Planned |
| TC07 | Destination stock increases on Unloading Completed | Destination POI **Current stock** increases; in-transit counters cleared. | P0 | Planned |
| TC08 | Cannot start without CC assignment | **Waiting for Command Center** — blocked. | P0 | Planned |
| TC09 | RBAC — Driver denied | Access denied. | P0 | Planned |
| TC10 | Audit unload events | UnloadEvent start/end rows per point. | P1 | Planned |

**Original ID map:** FG_UNLOAD_001–010 → TC01–TC10.
