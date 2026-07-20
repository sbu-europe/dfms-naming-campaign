---
module: 08-fleet-management
specification: Finished Goods Workflow — Section 6 — Driver Trip Start — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DM-01, TLS-01, FB-004
source_spec: ../../../../../05-modules/08-fleet-management/driver-execution.md
last_updated: 2026-07-20
playwright_mcp: true
---

# Finished Goods Workflow — Section 6 — Driver — Trip Start — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Driver portal → **My Trips** (`/admin/transport/drivertransportorder/`)

Scope: **Driver** viewing assigned TOs and recording **Trip Start** from **Ready for Dispatch**. *Rewrite from legacy mobile-app wording: seeded MCP uses Django Admin **My Trips** proxy (`DriverTransportOrderAdmin`), not a separate mobile binary.*

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Driver sees TO after dispatch | TO **Ready for Dispatch** assigned to `driver1@yopmail.com`. Log in as **Driver** (`driver1@yopmail.com` / `Nourish@1234!`). Open **My Trips**. Assert `to_number` listed with status **Ready for Dispatch**. | P0 | Planned |
| TC02 | Trip start unavailable before dispatch | TO **Assigned** (not dispatched) for same driver. **My Trips** tab **Awaiting Dispatch** may list it; assert **Start trip** / driver transition action absent or `is_dispatch_gated` blocks transition. | P0 | Planned |
| TC03 | Driver starts trip after dispatch | On **Ready for Dispatch** TO, open change view → record allowed driver transition (**Trip start** / driving leg). Assert success; status **Driving Towards Source** (FG outbound) or lane-appropriate driving status. | P0 | Planned |
| TC04 | TO status Driving Towards Source visible to planner | After TC03, as **Transport Planner** or **Driver Supervisor**, open TO changelist/detail. Assert status **Driving Towards Source**. | P0 | Planned |
| TC05 | RBAC — driver sees only own trips | Log in as `driver2@yopmail.com`. Assert TO assigned to `driver1` not in **My Trips** queryset. | P0 | Planned |
| TC06 | Audit trail for trip start | After TC03, Tenant Admin TO **History** shows driver transition log entry with driver user and timestamp. *Rewrite FG_DR_006 — admin History, not tenant Audit Logs.* | P1 | Planned |

## Implementation Notes

### URLs & controls

| Item | Value |
|------|--------|
| My Trips changelist | `/admin/transport/drivertransportorder/` |
| Driver transition | `/admin/transport/drivertransportorder/<pk>/driver-transition/` |
| Tab filter | `?tls_status_tab=awaiting_dispatch` / `in_progress` |

### Prerequisites

- Section 5 TO in **Ready for Dispatch** with `driver1` assigned.

### Original ID map (FG_DR → TC)

| Legacy | TC | Verdict |
|--------|-----|---------|
| FG_DR_001 | TC01 | Rewrite (admin My Trips) |
| FG_DR_002 | TC02 | Keep |
| FG_DR_003 | TC03 | Rewrite (driver-transition view) |
| FG_DR_004 | TC04 | Keep |
| FG_DR_005 | TC05 | Keep |
| FG_DR_006 | TC06 | Rewrite |

### Suggested next step

Artifacts: `tests/e2e/playwright-mcp/fg-driver-trips-artifacts/RESULTS.md`.
