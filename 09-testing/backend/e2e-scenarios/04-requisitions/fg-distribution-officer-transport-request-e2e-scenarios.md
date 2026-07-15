---
module: 04-requisitions
specification: Finished Goods Transport Request (Distribution Officer) - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TR-01, DFS-032
source_spec: ../../05-modules/04-requisitions/product-requisition-management.md
last_updated: 2026-07-15
playwright_mcp: true
---

# Finished Goods — Distribution Officer Transport Request - E2E Scenario Plan (Django Admin SSR)

Scope: **Distribution Officer** reviewing submitted **Finished Goods** Product Requisitions and creating **Transport Requests (TRs)** via Django Admin portal navigation. Distribution Manager approval actions are covered only as a cross-role routing assertion; full DM approve/reject suite is out of scope.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & PR queue

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Distribution Officer sees FG PR review queue | As **Distribution Officer** (`distribution.officer1@yopmail.com`), log in at `/admin/login/`, select working site if prompted, open **Distribution → Product requisitions** (`/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS`). Assert sidebar shows **Distribution** with children **Product requisitions** and **Transport requests**. On the changelist, assert DO-focused columns: **PR number**, **Status**, **Urgency**, **Destination POI**, preferred delivery, total weight / remaining, and **Create transport request** action for submitted (or in-progress with remaining) rows. Do **not** require a denormalized Product + Quantity column. | P0 | Planned |
| TC02 | Open submitted PR and view line details | As **Distribution Officer**, open a submitted FG PR from the queue (or change view). Assert detail shows Destination POI, Urgency, Preferred delivery, and product line items (item code / name, category as shown, quantity, UOM/weight). Prefer exact admin labels over PRD field names. | P0 | Planned |
| TC03 | PR queue filters by Status and Urgency | As **Distribution Officer** on the FG PR changelist with multiple rows, apply **Status** filter and **Urgency** filter (implemented `list_filter`). Assert the list updates for each. Do **not** assert POI or Product Category sidebar filters — those are not implemented on this admin. Optional: use search by `pr_number` if needed. | P1 | Planned |

## TR create happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Create TR with mandatory fields against submitted PR | Prerequisite: a submitted FG PR with remaining quantity (create via Depot Officer first if needed). As **Distribution Officer**, click **Create TR** / **Create Transport Request** (from PR queue link, PR change form, or **Transport requests → Add** → Select PR). On create form: choose **Source POI** (active POI different from destination context), set **Delivery Date**, enter positive **Allocate** quantity on at least one line (≤ Remaining), optional **Remarks**, click **Create Transport Request**. Assert success, generated `tr_number` (e.g. `TR-FG-…`), and status badge **Pending Approval** (`pending_approval`). Do **not** require Vehicle Type or Number of Vehicles on this form (moved to TO). | P0 | Planned |
| TC05 | Destination POI inherited and not editable on create | On the TR create form for an FG PR, assert Destination POI is displayed from the source PR (header/meta) and there is no editable Destination POI control for the DO to change it. | P0 | Planned |
| TC06 | Source stock / capacity panel after Source POI select | On TR create, select a **Source POI**. Assert source POI stock/capacity panel appears (or updates) when snapshot data exists; panel is informational and does not replace mandatory validation. | P1 | Planned |

## Validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Block TR create without Source POI | As **Distribution Officer** on TR create: leave **Source POI** blank, fill Delivery Date and a valid Allocate qty, click **Create Transport Request**. Assert Source POI required validation; TR not created. | P0 | Planned |
| TC08 | Block blank Delivery Date | Leave **Delivery Date** blank, fill Source POI and Allocate qty, submit. Assert field required validation; TR not created. | P0 | Planned |
| TC09 | Block allocate quantity exceeding remaining | On a PR line with Remaining R, enter Allocate = R + N (N > 0), fill other required fields, submit. Assert allocation validation blocks create (service/UI: allocated quantity cannot exceed remaining). TR not created. | P0 | Planned |
| TC10 | Block submit with zero allocation on all lines | Fill Source POI and Delivery Date, leave all Allocate values at `0` (or empty), submit. Assert non-field error that at least one product line needs allocated quantity; TR not created. | P0 | Planned |
| TC11 | Block Delivery Date in the past | Set **Delivery Date** to yesterday (or earlier), fill Source POI and valid Allocate, submit. Expected: past date rejected and TR not created. *Known gap:* current `TRCreateAdminForm` may accept past dates — treat unexpected create as FAIL (product defect). | P1 | Planned |

## Partial & multiple allocation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC12 | Create TR with partial quantity | On a PR with Remaining R, allocate approximately 50% of R on a line, submit. Assert TR created with status `pending_approval`. On PR queue/detail, remaining quantity decreases; PR remains creatable for further TRs while remaining > 0. | P0 | Planned |
| TC13 | Multiple TRs until full allocation | On a PR with Remaining R (e.g. 100 units): create TR-1 allocating ~60% , then TR-2 allocating the rest. Assert both TRs created. After full allocation, attempting **Create TR** again shows fully-allocated warning / no remaining path and does not create another TR. | P0 | Planned |

## RBAC & routing

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Distribution Officer cannot approve own TR | After TC04 (or equivalent), as the same **Distribution Officer** open the created TR change view (`pending_approval`). Assert **Approve**, **Approve with Modifications**, and **Reject** action links are **not** shown (those require `dm_can_act` / Distribution Manager). Bulk approve/reject actions must also be unavailable to DO. | P0 | Planned |
| TC15 | Submitted TR appears in Distribution Manager queue | After TC04, note `tr_number`. Log out; log in as **Distribution Manager** (`distribution.manager1@yopmail.com`). Open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`). Assert the TR is listed with status **Pending Approval** (`pending_approval`) and DM review actions are available when the TR is opened. | P0 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: DO FG PR queue view, TR create/validation, partial/multi allocation, SoD (no self-approve), DM queue visibility after submit.
- Out of scope: DM approve/reject happy path & capacity modification flows; Transport Planner TO create; Vehicle Type / Number of Vehicles (removed from TR — covered under TO scenarios); Port Consignment TRs (Procurement Officer); Depot Officer PR create suite (separate plan); REST API; XSS/SQLi.
- Out of scope (not implemented on PR admin): POI filter and Product Category filter on the review queue.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `distribution.officer1@yopmail.com` / `Nourish@1234!` |
| Cross-role (TC15) | `distribution.manager1@yopmail.com` / `Nourish@1234!` |
| PR fixture creator | `depot.officer1@yopmail.com` / `Nourish@1234!` (submit FG PR before TR cases) |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Working site | Select seed POI when prompted (e.g. `ctg-depot`) |

### Master data prerequisites

- Active seed Destination POI for Depot Officer PR (e.g. `CTG-001` / ctg-depot).
- At least one other active Source POI for TR (e.g. `CTG-002` / ctg-depot-02) — Source ≠ Destination.
- At least one active FG product with positive quantity on a **Submitted** PR (`submitted`) with remaining allocation > 0.
- For TC13: prefer a PR with a single-line remaining quantity large enough to split into two allocations (or two lines with remaining).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| DO PR queue | `/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS` — menu **Distribution → Product requisitions** |
| TR list (FG) | `/admin/requisitions/transportrequisition/?tr_type=FG` — menu **Distribution → Transport requests** |
| Select PR | `/admin/requisitions/transportrequisition/select-pr/` — `admin:requisitions_transportrequisition_select_pr` |
| Create from PR | `/admin/requisitions/transportrequisition/create-from-pr/<pr_pk>/` — `admin:requisitions_transportrequisition_create_from_pr` |
| Submit create | button **Create Transport Request** |
| Mandatory create fields | **Source POI** (`#id_source_poi`), **Delivery Date** (`#id_delivery_date`), line **Allocate** inputs (prefix `line_<uuid>-allocated_quantity`) |
| Optional | **Remarks** |
| Not on TR create | Vehicle Type, Number of Vehicles / vehicles_required |

Prefer accessibility snapshot selectors over brittle CSS. Hide Django Debug Toolbar overlays before clicking submit if they intercept pointer events.

### Status & wipe notes

- Assert UI badge **Pending Approval** and persisted enum `pending_approval`.
- `tr_number` / `pr_number` are system-generated (`TR-FG-…`, `PR-FG-…`); they cannot use `MCP-` code prefix. Track by number / creator / session date for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`.
- Prefer one `RUN_ID` per MCP session for free-text Remarks (`MCP TR <RUN_ID>`).

### Known implementation alignment / gaps

| Topic | Older FG_DIST expectation | Current admin |
|-------|---------------------------|---------------|
| Queue columns | PR ID, Requester POI, Product, Quantity, Urgency | DO list: PR #, status, urgency, **Destination POI**, delivery, weight/remaining, Create TR |
| Filters | POI + Product Category | `list_filter = ("status", "urgency")` only |
| Mandatory TR fields | Source POI, Transfer Qty, Delivery Date, Vehicle Type, # Vehicles | Source POI, Delivery Date, per-line **Allocate**; vehicles removed (`0009_remove_transportrequisition_vehicles_required`) |
| Transfer Quantity label | Single Transfer Quantity | **Allocate** per PR line vs Remaining |
| Past Delivery Date (TC11) | Must block | *Known gap* — may accept |
| Self-approve | No Approve for DO | `dm_can_act` false for DO — Approve/Reject hidden |

### Original ID map (FG_DIST → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_DIST_001 | TC01 | Fixed columns to DO admin list_display |
| FG_DIST_002 | TC02 | Detail asserts aligned to admin labels |
| FG_DIST_003 | TC03 | Status + Urgency only; dropped POI/Category filters |
| FG_DIST_004 | TC04 | Dropped Vehicle Type / # Vehicles |
| FG_DIST_005 | TC07 | Unchanged intent (Source POI required) |
| FG_DIST_006 | TC09 | Wording: Allocate ≤ Remaining |
| FG_DIST_007 | TC12 | Partial Allocate |
| FG_DIST_008 | TC11 | Kept; known gap |
| FG_DIST_009 | — | Dropped (vehicles not on TR; cover under TO) |
| FG_DIST_010 | TC14 | Unchanged intent |
| FG_DIST_011 | TC13 | Unchanged intent |
| FG_DIST_012 | TC15 | Explicit DM login + FG TR queue |
| — | TC05 | Added (Dest POI inherited) |
| — | TC06 | Added (source stock panel) |
| — | TC08 | Added (blank Delivery Date) |
| — | TC10 | Added (zero allocation blocked) |

### Suggested next step

Run Playwright MCP against this file (TC01 → TC04 first, then validations TC07–TC10, then TC12–TC15), persist results under `tests/e2e/playwright-mcp/fg-do-tr-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
