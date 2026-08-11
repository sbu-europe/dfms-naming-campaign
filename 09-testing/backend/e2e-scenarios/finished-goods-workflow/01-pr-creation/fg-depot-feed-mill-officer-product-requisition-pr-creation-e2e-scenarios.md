---
module: 04-requisitions
specification: Finished Goods Workflow — Section 1 — PR Creation (Depot Officer / Feed Mill Officer) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: PR-01, FB-007, FB-017, FB-018
source_spec: ../../../../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 15/15 Pass
artifacts: tests/e2e/playwright-mcp/01-pr-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 1 — Depot Officer / Feed Mill Officer — PR Creation — E2E Scenario Plan (Django Admin SSR)

> **2026-08-11 — All 15 test cases passed** (TC01–TC15). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-11 · **15/15 Pass** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/01-pr-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/01-pr-artifacts/RESULTS.md)  
**Accounts:** `depot.officer1.nourish@yopmail.com` (+ officer2, feed mill, DO, tenant admin).

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **15/15** | All PR creation cases passed (Playwright MCP). |


**Navigation:** Requisition → Finished Goods → **Add Product Requisition**

Scope: **Depot Officer** and **Feed Mill Officer** creating Finished Goods Product Requisitions via Django Admin portal navigation. Cross-role queue visibility (Distribution Officer) and RBAC smoke only; yard operational workflows are out of scope.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & Add form access

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Open Add FG Product Requisition form | As **Depot Officer** (`depot.officer1@yopmail.com`), log in at `/admin/login/`, select working site if prompted, open **Requisition → Finished Goods** (`/admin/requisitions/productrequisition/`), click **Add Product Requisition**. Assert add form loads at `/admin/requisitions/productrequisition/add/` with **Urgency**, **Destination POI**, **Preferred delivery date & time**, **Special instructions**, product line inline, and **Destination POI — Stock & Capacity** panel showing only **Total capacity**, **Current stock**, and **Free capacity** (FB-018 — no in-transit or projection fields). | P0 | Pass |
| TC02 | Destination POI pre-filled with assigned POI | As **Depot Officer** on Add PR, assert **Destination POI** is pre-filled with the officer's primary `UserOperationalPOI` assignment (FG sandbox: **MCP Dest `<RUN_ID>`** / `MCP-D-<RUN_ID>`; illustrative seed example: **ctg-depot** / `CTG-001`). | P0 | Pass |
| TC03 | Destination POI is read-only for POI-scoped requester | As **Depot Officer** on Add PR, assert **Destination POI** control (`#id_destination_poi`) is disabled — no usable dropdown change or text edit. | P0 | Pass |

## Submit validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Mandatory fields enforced on Submit Requisition | As **Depot Officer** on Add PR, leave **Preferred delivery date & time** blank and product lines empty, click **Submit Requisition**. Assert field-level errors (e.g. **Required before submission.** on preferred delivery) and PR is not created with status **Submitted**. *Known gap:* empty line items may still create a PR — treat unexpected `submitted` create as FAIL. | P0 | Pass |
| TC05 | Product line selection and autofill | As **Depot Officer** on Add PR, select a valid **Finished Goods** product from the line **Product** dropdown (not free text), enter positive **Product quantity**, add a second line with a different product. Assert each line shows read-only **Unit of measure**, **Weight per unit**, and computed **Total weight** after quantity entry. | P0 | Pass |
| TC06 | Quantity rejects zero and negative values | As **Depot Officer** on Add PR with one product line, set **Product quantity** to `0` and click **Submit Requisition**; repeat with `-5`. Expected: validation blocks submit and PR is not **Submitted**. *Known gap:* model default allows `0` — treat unexpected acceptance as FAIL. | P1 | Pass |
| TC07 | Quantity rejects non-numeric input | As **Depot Officer** on Add PR, attempt to enter `abc` in **Product quantity**. Assert browser/type constraint prevents entry or submit surfaces a validation error; PR is not **Submitted**. | P1 | Pass |

## Submit happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Successful submit sets status Submitted | As **Depot Officer** on Add PR: select at least one FG product line with positive quantity, set **Preferred delivery date & time** to a future datetime, click **Submit Requisition**. Assert success message, generated `pr_number` (`PR-FG-…`), and status badge **Submitted** (`submitted`). | P0 | Pass |

## Cross-role queue visibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Submitted PR visible in Distribution Officer PR queue | After TC08 (or equivalent MCP fixture PR), log in as **Distribution Officer** (`distribution.officer1@yopmail.com`), open **Distribution → Product requisitions** (`/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS`). Assert the PR appears with status **Submitted**, correct **Destination POI**, and list columns (`pr_number`, `urgency`, `preferred_delivery_datetime`, `total_weight_display`). | P0 | Pass |

## RBAC & data isolation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Depot Officer denied yard operations menus (FB-017) | As **Depot Officer**, assert sidebar shows **Dashboard** and **Requisition** (child **Finished Goods** only). Assert **Gate**, **Scaling**, **Command Center**, **Loading**, **Unloading**, **QC Checkpoint**, **Transport**, **Distribution**, **Procurement**, **Master Data**, **Vendors**, and **Port Shipments** are absent. *Aligns with legacy FG_DO_010; FB-007 yard access was superseded by FB-017 — yard modules are POI-Admin only.* | P0 | Pass |
| TC11 | Depot Officer cannot create or approve Transport Requests | As **Depot Officer**, assert **Distribution** and **Transport** headings are absent. Attempt direct navigation to `/admin/requisitions/transportrequisition/add/` and TR approval URLs. Expect permission denied / login redirect / non-operable admin — TR create/approve must not be available. | P0 | Pass |
| TC12 | POI data isolation between requesters | Using two Depot Officers with **distinct** primary `UserOperationalPOI` assignments (`depot.officer1` → CTG-001, `depot.officer2` → CTG-002 — verify in DB before run), each opens Add PR and sees only their own POI pre-filled and locked. As `depot.officer1`, open **Finished Goods** changelist and assert PRs created by `depot.officer2` are not listed. | P0 | Pass |

## Audit & role parity

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | PR activity log captures creation and submit | After TC08, as **Tenant Admin** (`admin@yopmail.com`), open **Master Data → Audit Logs** is optional; primary assertion: open `/admin/requisitions/practivitylog/?q={pr_number}` (or PR change view activity if surfaced) and assert entries for `created` and `submitted` with **changed_by** matching the Depot Officer and **requisition** referencing the `pr_number`. *Rewritten from legacy FG_DO_013 — admin path writes `PRActivityLog`, not tenant `AuditLog` CRUD rows.* | P1 | Pass |
| TC14 | Feed Mill Officer follows same PR creation rules | As **Feed Mill Officer** (`feed.mill.officer1@yopmail.com`), open **Requisition → Finished Goods → Add Product Requisition**. Assert **Destination POI** auto-fills with assigned POI and is read-only; submit with valid mandatory data succeeds with status **Submitted**. | P0 | Pass |
| TC15 | Double-click submit does not duplicate PR | As **Depot Officer** on Add PR with valid data, rapidly double-click **Submit Requisition**. Expected: only one PR record with the same payload is created. *Known gap:* no client-side disable on submit button — treat duplicate `pr_number` siblings as FAIL.* | P1 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Depot / Feed Mill Officer FG PR create, Destination POI scoping, Distribution Officer queue visibility, portal RBAC smoke (FB-017 — requester-only menus, no yard ops).
- Out of scope: TR approval workflows, Transport Orders, Port Shipments, yard Gate/Scale/CC/Load/Unload operational steps (POI-Admin per FB-014/FB-017), REST API tampering, XSS/SQLi suites.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `depot.officer1@yopmail.com` / `Nourish@1234!` |
| Second depot actor (TC12) | `depot.officer2@yopmail.com` / `Nourish@1234!` |
| Feed Mill actor (TC14) | `feed.mill.officer1@yopmail.com` / `Nourish@1234!` |
| Distribution actor (TC09) | `distribution.officer1@yopmail.com` / `Nourish@1234!` |
| Tenant Admin (TC13) | `admin@yopmail.com` / `NourishAdmin@1234!` |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Working site | FG sandbox: **MCP Dest …** / **MCP Source …** from `fg-mcp-<RUN_ID>.json` (illustrative legacy: `ctg-depot`) |

### Master data prerequisites

- **Preferred:** `make seed-mcp-fg RUN_ID=…` — dest `MCP-D-<RUN_ID>`, products `MCP-FG-<RUN_ID>-1/2`, UOP binds for depot/feed-mill (see `mcp-playwright-fg-fixture-seed.md`). Pick products/dest from the manifest; do not bind the happy path to leftover `CTG-*` / `FG-F-*`.
- **Illustrative only:** seed POIs `CTG-001` / `CTG-002` and catalogue SKUs `FG-F-01` / `FG-F-02` may appear in older examples — MCP FG runs should use the session manifest instead.
- TC12 (two depot officers, distinct POIs): either bind `depot.officer2` to a second MCP dest for that RUN_ID, or use two seed POIs — verify UOP before run.

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| FG changelist | `/admin/requisitions/productrequisition/` |
| FG add | `/admin/requisitions/productrequisition/add/` |
| DO PR queue | `/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS` |
| Submit | button **Submit Requisition** (`name="_submit_requisition"`) |
| Draft | **Save as Draft** (`name="_save"`) |
| Dest POI | `#id_destination_poi` disabled for POI-scoped requesters |
| Line product | inline `select[id$="-product"]` + `admin/js/pr_line_item_autofill.js` |
| PR activity log | `/admin/requisitions/practivitylog/` |

Prefer accessibility snapshot selectors over brittle CSS. Hide Django Debug Toolbar overlays before clicking Save/Submit if they intercept pointer events.

### Status & wipe notes

- Assert UI badge **Submitted** and persisted enum `submitted`.
- `pr_number` is system-generated (`PR-FG-YYYYMMDD-####`); track by `pr_number` / requester / date for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`.
- Prefer one `RUN_ID` per MCP session for **Special instructions** free text (`MCP PR <RUN_ID>`).
- After suite: `make wipe-mcp-fg RUN_ID=…` when a session manifest exists.
### Known implementation alignment / gaps

| Topic | Scenario expectation | Current admin (`apps/requisitions/admin.py`) |
|-------|---------------------|-----------------------------------------------|
| Dest POI | Pre-filled, read-only for depot/feed-mill | `disabled=True` + queryset limited to assigned POI |
| Submit required | Destination POI + preferred delivery datetime | `ProductRequisitionAdminForm.SUBMIT_REQUIRED` |
| Empty line submit (TC04) | Must block | *Known gap* — may still create PR |
| Quantity zero/negative (TC06) | Must block | *Known gap* — `DecimalField` default `0` |
| Yard menus (TC10) | Hidden per FB-017 | `role_seed_data.py` — depot/feed-mill have `MENU_REQUISITION_FG_VIEW` + `OPERATIONS_STOCK_READ` only |
| Stock panel (TC01) | Total / current / free only (FB-018) | `poi_stock_panel.html` — three fields |
| Tenant audit log (legacy FG_DO_013) | Audit Logs menu | Admin writes `PRActivityLog` only |
| Double submit (TC15) | Single PR | *Known gap* — no submit-button disable |

### Original ID map (FG_DO → this plan)

| Legacy | This file | Verdict |
|--------|-----------|---------|
| FG_DO_001 | TC01 | Keep |
| FG_DO_002 | TC02 | Keep |
| FG_DO_003 | TC03 | Keep |
| FG_DO_004 | TC04 | Rewrite (admin submit-required fields + line gap) |
| FG_DO_005 | TC05 | Rewrite (Product dropdown + autofill, not free-text code) |
| FG_DO_006 | TC06 | Keep; known gap |
| FG_DO_007 | TC07 | Keep |
| FG_DO_008 | TC08 | Keep |
| FG_DO_009 | TC09 | Rewrite (Distribution → Product requisitions queue) |
| FG_DO_010 | TC10 | Keep — FB-017 restores legacy expectation (no yard menus) |
| FG_DO_011 | TC11 | Keep |
| FG_DO_012 | TC12 | Rewrite (changelist isolation + two seed actors, not API fuzz) |
| FG_DO_013 | TC13 | Rewrite (`PRActivityLog` vs tenant Audit Logs) |
| FG_DO_014 | TC14 | Keep |
| FG_DO_015 | TC15 | Keep; P1 known gap |

### Suggested next step

Run Playwright MCP against this file (TC01–TC09 first), persist results under `tests/e2e/playwright-mcp/fg-do-pr-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
