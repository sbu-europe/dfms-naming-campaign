---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 15 — Command Center (Destination) Bay Assignment — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01, QC-01
source_spec: ../../../../../05-modules/06-yard-operations/command-center-queue.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 15 — Command Center (Destination) — Bay & Unloading Point — E2E Scenario Plan

**Navigation:** Command Center → **Bay Assignment** → Add (destination site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC views QC-passed queue | Sub-state **Waiting for Command Center** after QC Pass (or non-QC Scale-In). CC queue lists TO. | P0 | Planned |
| TC02 | Add Bay Assignment — select TO, unloading point | **Bay Assignment → Add**, select TO (details auto-populate read-only), select **Unloading Point**, save. Sub-state **Assigned Unloading Point**. | P0 | Planned |
| TC03 | Bay Assignment blocked for QC Fail | TO with QC **Fail**. Assignment blocked / TO not in eligible queryset. | P0 | Planned |
| TC04 | Bay Assignment blocked while Sampling Started | QC decision not yet submitted (sub-state **Sampling Started**). Blocked. | P0 | Planned |
| TC05 | Multiple unloading points | Assign two unloading points; both tracked. | P1 | Planned |
| TC06 | Non-QC product proceeds without QC steps | Non-QC RM TO after Scale-In → **Waiting for Command Center** → bay assignment succeeds without QC sample. | P0 | Planned |
| TC07 | RBAC — Driver denied destination Bay Assignment | Driver blocked. | P0 | Planned |
| TC08 | Audit destination bay assignment | User + timestamp on assignment record. | P1 | Planned |

## Implementation Notes

- **Original ID map:** RM_141–RM_148 → TC01–TC08.
