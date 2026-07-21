---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 12 — Gate In (Destination) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 12 — Gate In (Destination) — E2E Scenario Plan

**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (destination working site)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination Gateman records Gate-In | TO **Driving Towards Destination**. As **Gateman** (destination POI working site), record Gate-In. TO **At Destination** (`at_destination`). | P0 | Planned |
| TC02 | Gate-In blocked before Driving Towards Destination | TO still at source yard. Blocked. | P0 | Planned |
| TC03 | Vehicle registration validated | Mismatching reg blocked. | P1 | Planned |
| TC04 | Mandatory field validation | Blank required field blocked. | P0 | Planned |
| TC05 | RBAC — Unloading Personnel denied Gate-In | Unloading role cannot Gate-In add. | P0 | Planned |
| TC06 | Audit destination Gate-In | User + timestamp logged. | P1 | Planned |

## Implementation Notes

- **Original ID map:** RM_113–RM_118 → TC01–TC06.
