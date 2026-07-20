---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 9 — Command Center (Source) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01, FB-001
source_spec: ../../../../05-modules/06-yard-operations/command-center.md
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 9 — Command Center (Source) — Bay & Loading Assignment — E2E Scenario Plan

**Navigation:** Command Center → **Queue** → **Assign loading point** (`/admin/operations/bayassignment/add/?queue_entry=<uuid>`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | CC sees vehicles waiting after Scale-In | As **Command Center Officer** (`command.center.officer1@yopmail.com`), open **Command Center → Queue** (`?status__exact=waiting`). Assert TO/queue entry from Section 8 visible. | P0 | Planned |
| TC02 | Assign Bay and Loading Point | From queue row, **Assign loading point**. Select **loading_unloading_point** line(s), save. Assert assignment active; sub-state **Assigned Loading Point**. | P0 | Planned |
| TC03 | Multi-point loading assignment | Assign two loading points to same visit (FB-001 multi-point). Both assignments tracked; progress column shows partial completion. | P1 | Planned |
| TC04 | Loading Personnel queue visibility (rewrite alert) | *Rewrite FG_CC_S_004: no push notifications in admin. After TC02, as **Loading Personnel**, open **Loading → Start Loading** — assigned bay appears in queue table / deep link `?bay_assignment=`.* | P1 | Planned |
| TC05 | Assign Waiting Serial | With multiple waiting entries, use **Waiting Serials** / serial ordering controls to assign next vehicle. | P1 | Planned |
| TC06 | RBAC — Driver denied | Driver cannot access Bay Assignment add. | P0 | Planned |
| TC07 | Audit bay assignment | BayAssignment record with user + timestamp + queue entry. | P1 | Planned |

## Implementation Notes

- CC officer needs `Transport.TO.Read` + operational POI.
- Stock check at assign is **warning only**, never blocks.
- **Original ID map:** FG_CC_S_001–007 → TC01–TC07.
