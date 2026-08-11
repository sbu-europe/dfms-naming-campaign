---
module: 04-requisitions
specification: Finished Goods Workflow — Section 2 — Transport Request (TR) Creation (Distribution Officer) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DR-02, FB-018
source_spec: ../../../../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 14/15 Pass · 1 Fail
artifacts: tests/e2e/playwright-mcp/02-tr-create-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 2 — Distribution Officer — TR Creation — E2E Scenario Plan (Django Admin SSR)

**Last MCP run:** 2026-08-11 · **14/15 Pass · 1 Fail** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/02-tr-create-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/02-tr-create-artifacts/RESULTS.md)  
**Accounts:** `distribution.officer1.nourish@yopmail.com`.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **14/15** | TC03 FAIL: past delivery date accepted (known gap). See RESULTS.md. |


**Navigation:** Distribution → **Product requisitions** (Create TR on a Submitted PR) **or** Distribution → **Transport requests** → **Add** (select PR)

Scope: **Distribution Officer** creating Finished Goods Transport Requests against Submitted / In Progress PRs via the custom `create-from-pr` admin view. DM approval, Transport Order creation, and API-only flows are out of scope except RBAC smoke (DO must not approve).

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & TR creation entry

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Distribution Officer can open TR creation against a Submitted PR | As **Distribution Officer** (`distribution.officer1@yopmail.com`), log in at `/admin/login/`. Open **Distribution → Product requisitions** (`/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS`). Locate a PR with status **Submitted** (or **In Progress** with remaining qty) and click **Create TR** (or open PR change view and use **Create Transport Request**). Assert URL is `/admin/requisitions/transportrequisition/create-from-pr/<pr_uuid>/` with PR header showing `pr_number`, **Destination POI**, **Urgency**, **Requested Delivery**, and **Allocate Quantities** table pre-populated from PR line items (product code/name, UOM, Requested, Remaining). | P0 | Pass |

## Source POI & capacity panels

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | Source POI is selectable via dropdown | With TR creation form open (TC01), open **Source POI** (`#id_source_poi`). Assert dropdown lists active seed POIs (e.g. `ctg-depot`, `ctg-depot-02`). Select a POI **different from** the PR Destination POI; assert selection persists. | P0 | Pass |
| TC08 | Capacity snapshot shown for source and destination POIs | With TR creation form open, assert **Destination POI — Stock & Capacity** panel is visible in the PR header area showing **Total capacity**, **Current stock**, and **Free capacity** (FB-018 — three fields only). Select a **Source POI**; assert **Source POI — Stock & Capacity** panel appears/updates (`#dfms-source-poi-stock-panel` / `poi_stock_panel.js`). | P0 | Pass |

## Submit validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Delivery Date in the past is rejected | With TR creation form open, select valid Source POI, set **Delivery Date** (`#id_delivery_date`) to yesterday, allocate a positive quantity on one line, click **Create Transport Request**. Expected: validation error; TR not created. *Known gap (confirmed 2026-07-15 MCP): past dates are currently accepted — treat unexpected `TR-FG-…` create as FAIL.* | P0 | Fail |
| TC07 | Allocated quantity cannot exceed remaining PR quantity | Against a PR line with Remaining = 30 (or read **Remaining** column on form), attempt allocate `50` and submit with valid Source POI and future Delivery Date. Expected: error `Allocation of … exceeds remaining quantity …` (from `PRAllocationService.check_overflow`); TR not created. | P0 | Pass |
| TC10 | Mandatory fields enforced on TR creation | With TR creation form open, leave **Source POI** blank and/or clear **Delivery Date**, allocate a positive qty, click **Create Transport Request**. Expected: HTML5 `required` and/or Django `.errorlist` blocks submit; no `TR-FG-…` created. Also verify zero allocation on all lines surfaces `Enter an allocated quantity for at least one product line.` | P0 | Pass |

## Allocation & multi-TR

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Partial quantity allocation leaves PR balance | Against a submitted PR with line Remaining = 100 units (create MCP fixture if needed), create TR with allocated quantity = 40. Assert success message with `tr_number`, TR status **Pending Approval**. Re-open PR changelist/detail or TR create form: **Remaining** on that line shows 60; **Create TR** link still available. | P0 | Pass |
| TC05 | Multiple TRs until PR fully allocated | Starting from TC04 PR (100 units, 40 already allocated), create second TR allocating remaining 60. Assert second TR created. Assert PR **Remaining** = 0 / **Fully allocated** in changelist `remaining_qty_display`; no further **Create TR** action on that PR. | P0 | Pass |
| TC06 | System blocks TR when no remaining quantity | Against a fully allocated PR (TC05), attempt **Create TR** via changelist link or direct `/admin/requisitions/transportrequisition/create-from-pr/<pr_uuid>/`. Expected: warning `… fully allocated — no remaining quantity` and redirect to PR (no create form). | P0 | Pass |

## Submit happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Submitted TR sets status Pending Approval | Fill TR form with valid Source POI ≠ Destination, future Delivery Date, positive allocation, optional Remarks (`MCP TR <RUN_ID>`). Click **Create Transport Request**. Assert success toast, generated `tr_number` (`TR-FG-…`), and on TR changelist/change view status badge **Pending Approval** (`pending_approval`) — routed to Distribution Manager queue (not yet approved). | P0 | Pass |

## PR line items & queue filters

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | PR line-item details visible during TR creation | Against a PR with **multiple product line items**, open TR creation. Assert **Allocate Quantities** table lists every line with product code/name, UOM, Requested, Remaining, and per-line **Allocate** input; partial line selection allowed (other lines may stay 0). | P0 | Pass |
| TC12 | PR review queue filters (implemented subset) | As **Distribution Officer** on **Distribution → Product requisitions**, assert right-hand filters **By status** and **By urgency** only (`list_filter = status, urgency`). Apply `status=submitted` and `urgency=normal` URL params; assert changelist updates. *Rewrite from legacy FG_DIST_012: admin has no POI, Product Category, or Transfer Type filters on this changelist — treat unexpected filter sidebar labels as spec drift / FAIL if product adds them later.* | P1 | Pass |

## RBAC, audit & data isolation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | RBAC — Distribution Officer cannot approve own TR | After TC09 (TR **Pending Approval** created by DO), stay logged in as **Distribution Officer**. Open TR change view. Assert **Approve**, **Reject**, and **Approve with Modifications** actions are absent; changelist has no bulk Approve/Reject actions. | P0 | Pass |
| TC14 | Audit trail captures TR creation event | After TC09, as **Tenant Admin** (`admin@yopmail.com`), open TR change view **History** (`/admin/requisitions/transportrequisition/<pk>/history/`) or Django admin log for the TR. Assert an **Added** entry references the `tr_number` with user matching the Distribution Officer and recent timestamp. *Rewrite from legacy FG_DIST_014: admin SSR create uses `log_addition` (admin History), not tenant **Master Data → Audit Logs** (`/admin/audit/auditlog/`) unless created via REST API.* | P1 | Pass |
| TC15 | Data isolation — cross-tenant PR not accessible | In single-tenant MCP: as **Distribution Officer**, attempt direct navigation to `create-from-pr/<random-uuid>/` for a UUID not in tenant. Expected: 404 / permission denied — no TR created. *Rewrite from legacy FG_DIST_015 (API cross-tenant): full Tenant A vs Tenant B isolation requires multi-tenant fixture or API suite outside default MCP nourish seed — demote to P2 if only one tenant is available.* | P2 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: DO FG TR create-from-PR, Source POI selection, line allocation (partial/multi), capacity panels, PR queue triage columns, DO RBAC (no approve), admin History smoke.
- Out of scope: DM approve/reject (see [`03-tr-approval/fg-distribution-manager-transport-request-approval-e2e-scenarios.md`](../03-tr-approval/fg-distribution-manager-transport-request-approval-e2e-scenarios.md)), Transport Order creation, Port Consignment TRs, REST API tampering, notification/email delivery.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `distribution.officer1@yopmail.com` / `Nourish@1234!` |
| Tenant Admin (TC14) | `admin@yopmail.com` / `NourishAdmin@1234!` |
| PR fixture author (setup) | `depot.officer1@yopmail.com` / `Nourish@1234!` |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Working site | Not required for Distribution Officer (no POI switcher in seed) |

### Master data prerequisites

- At least one **Submitted** FG PR with remaining quantity (create via Depot Officer Add PR flow or reuse seed).
- At least two active POIs for Source POI selection (`CTG-001` / ctg-depot, `CTG-002` / ctg-depot-02).
- PR Destination POI must differ from chosen Source POI (`TRService.create_fg_tr` enforces).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| DO PR queue | `/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS` |
| DO TR queue | `/admin/requisitions/transportrequisition/?tr_type=FG` |
| Add TR (step 1) | `/admin/requisitions/transportrequisition/add/` → redirects to `select-pr/` |
| Create from PR | `/admin/requisitions/transportrequisition/create-from-pr/<pr_uuid>/` |
| Source POI | `#id_source_poi` |
| Delivery Date | `#id_delivery_date` |
| Line allocate | `input[name^="line_"][name$="-allocated_quantity"]` |
| Submit | button **Create Transport Request** |
| Create TR (changelist) | link **Create TR** on PR row (`create_tr_link`) |

Prefer accessibility snapshot selectors over brittle CSS. Hide Django Debug Toolbar overlays before clicking submit if they intercept pointer events.

### Status & wipe notes

- Assert TR UI badge **Pending Approval** and persisted enum `pending_approval`.
- `tr_number` is system-generated (`TR-FG-YYYYMMDD-####`); track by `tr_number` / remarks (`MCP TR <RUN_ID>`) for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`.
- After partial TR, PR status may advance **Submitted** → **In Progress** (`post_save` signal).

### Known implementation alignment / gaps

| Topic | Scenario expectation | Current admin (`apps/requisitions/admin.py`) |
|-------|---------------------|-----------------------------------------------|
| Entry | Create TR on Submitted PR | `create_tr_link` when status `submitted` / `in_progress`; `create_tr_view` |
| Source POI | Active POI dropdown | `POI.objects.filter(is_active=True)` |
| Past delivery (TC03) | Must reject | *Known gap* — no `clean_delivery_date`; MCP run 2026-07-15 confirmed defect |
| Overflow (TC07) | Block > remaining | `PRAllocationService.check_overflow` |
| Full alloc (TC06) | Block create | Redirect + `fully allocated — no remaining quantity` |
| Capacity (TC08) | Source + dest panels | `poi_stock_panel.html` — Total / Current / Free (FB-018) |
| TR status (TC09) | Pending Approval | `TRStatus.PENDING_APPROVAL` on `create_fg_tr` |
| PR filters (TC12) | Status + urgency only | `list_filter = ("status", "urgency")` — no POI/category/transfer type |
| DO approve (TC13) | Hidden | `dm_can_act` only for distribution_manager |
| Audit (TC14) | Creation logged | `log_addition` → admin History; API path → `AuditLog` |
| Cross-tenant (TC15) | Blocked | `TenantOnlyAdminMixin` + schema isolation; MCP needs second tenant for full AC |

### Original ID map (FG_DIST → this plan)

| Legacy | This file | Verdict |
|--------|-----------|---------|
| FG_DIST_001 | TC01 | Keep |
| FG_DIST_002 | TC02 | Keep |
| FG_DIST_003 | TC03 | Keep; known gap (past date) |
| FG_DIST_004 | TC04 | Keep |
| FG_DIST_005 | TC05 | Keep |
| FG_DIST_006 | TC06 | Keep |
| FG_DIST_007 | TC07 | Keep |
| FG_DIST_008 | TC08 | Keep |
| FG_DIST_009 | TC09 | Keep (button label **Create Transport Request**) |
| FG_DIST_010 | TC10 | Keep |
| FG_DIST_011 | TC11 | Keep |
| FG_DIST_012 | TC12 | Rewrite (status/urgency filters only) |
| FG_DIST_013 | TC13 | Keep |
| FG_DIST_014 | TC14 | Rewrite (admin History vs tenant Audit Logs) |
| FG_DIST_015 | TC15 | Rewrite (UUID/tenant boundary; API cross-tenant → P2) |

### Suggested next step

Run Playwright MCP against this file (TC01–TC10, TC12–TC13 first), persist results under `tests/e2e/playwright-mcp/fg-do-tr-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
