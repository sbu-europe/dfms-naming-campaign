---
module: 04-requisitions
specification: Finished Goods Product Requisition (Depot Officer) - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: PR-01, FB-007, DFS-032
source_spec: ../../05-modules/04-requisitions/product-requisition-management.md
amendment_spec: ../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-07-15
playwright_mcp: true
---

# Finished Goods — Depot Officer Product Requisition - E2E Scenario Plan (Django Admin SSR)

Scope: **Depot Officer** creating and viewing **Finished Goods** Product Requisitions via Django Admin portal navigation. Yard menu presence is covered for FB-007 RBAC smoke only; yard operational workflows are out of scope.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & RBAC

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Depot Officer sees permitted portal sections | As **Depot Officer** (`depot.officer1@yopmail.com`), log in at `/admin/login/`, select working site if prompted, then verify sidebar shows **Dashboard**, **Requisition** (with child **Finished Goods**), **Gate**, **Scaling**, **Command Center**, **Loading**, and **Unloading**. **Finished Goods** must appear under **Requisition**, not as a sibling top-level heading. Assert restricted headings are absent (e.g. **Transport**, **Distribution**, **Procurement**, **Master Data**, **Vendors**, **Port Shipments**, **QC Checkpoint**). | P0 | Planned |
| TC02 | Depot Officer denied restricted module URLs | As **Depot Officer**, attempt direct navigation to restricted admin paths (e.g. `/admin/transport/`, Distribution / Procurement / Master Data / Vendors / Users changelists, Port Shipments `/admin/requisitions/portshipmentproxy/`, QC Checkpoint). Expect access denied: login redirect, permission denied / 403 page, or empty non-usable admin — module must not be operable. | P0 | Planned |
| TC03 | Open Add FG Product Requisition form | As **Depot Officer**, open **Requisition → Finished Goods** (`/admin/requisitions/productrequisition/`), click **Add Product Requisition** (or equivalent add link). Assert add form loads at `/admin/requisitions/productrequisition/add/`. | P0 | Planned |

## Destination POI (FB-007)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Destination POI pre-filled and read-only | As **Depot Officer** on the Add PR form, assert **Destination POI** is pre-filled with the officer’s primary assigned operational POI and the control is disabled / read-only (no usable dropdown change). Value must match the officer’s `UserOperationalPOI` primary assignment (seed example: **ctg-depot** / `CTG-001` when that is the assigned site). | P0 | Planned |
| TC05 | Each Depot Officer sees only own Destination POI | Using two Depot Officers with **distinct** primary `UserOperationalPOI` assignments (e.g. `depot.officer1` → CTG-001 / ctg-depot and `depot.officer2` → CTG-002 / ctg-depot-02 — confirm in DB before run), each opens Add PR and sees only their own POI pre-filled and locked. No cross-POI selection is possible. | P0 | Planned |

## Add form composition

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Add PR form shows implemented create fields | As **Depot Officer** on Add PR, assert visible create fields/sections: **Urgency**, **Destination POI** (locked), **Preferred delivery date & time**, **Special instructions**, product line-item inline (**Product** select, quantity, UOM/weight read-only displays), and destination stock/capacity panel when available. Do **not** require **Requester Name** / **Requester Department** / **Remarks** on the add form (those appear on the change form after save). | P0 | Planned |
| TC07 | Capacity / stock panel is informational | On Add PR with Destination POI set, assert **Destination POI — Stock & Capacity** (or equivalent) panel is visible and read-only; it does not block clicking **Submit Requisition** when other required data is valid. | P1 | Planned |

## Submit happy path

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Submit PR with valid mandatory data | As **Depot Officer** on Add PR: select at least one active **Finished Goods** product in the line inline, enter positive **Product quantity**, choose **Urgency** (or keep default **Normal**), set **Preferred delivery date & time** to a future datetime, leave **Special instructions** as needed, click **Submit Requisition**. Assert success message, generated `pr_number` (e.g. `PR-FG-…`), and status badge **Submitted** (`submitted`). | P0 | Planned |
| TC09 | Optional special instructions | Fill mandatory fields and line items, leave **Special instructions** blank, click **Submit Requisition**. Assert PR still submits successfully with status `submitted`. | P1 | Planned |
| TC10 | Urgency options | On Add PR, open **Urgency** and assert choices **Normal**, **High**, and **Critical** are available. | P1 | Planned |

## Submit validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Block submit with zero product lines | As **Depot Officer** on Add PR, fill Destination POI (locked), Urgency, and Preferred delivery datetime, leave line items empty, click **Submit Requisition**. Expected: submission blocked with validation that at least one product line is required; no `submitted` PR created. *Known gap:* current admin may still create the PR — treat unexpected create as FAIL (product defect). | P0 | Planned |
| TC12 | Block blank Preferred delivery date & time | Add a valid product line and Urgency, leave **Preferred delivery date & time** blank, click **Submit Requisition**. Assert field error (**Required before submission.** or equivalent) and PR not submitted. | P0 | Planned |
| TC13 | Block Preferred delivery date in the past | Add a valid line, set Preferred delivery to yesterday (or earlier), click **Submit Requisition**. Expected: past datetime rejected and PR not submitted. *Known gap:* current admin may accept past dates — treat unexpected create as FAIL (product defect). | P0 | Planned |

## Product line items

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Selecting FG product autofills denormalised fields | On a line row, choose a valid FG product from the **Product** dropdown (not free-text item code). Assert denormalised / display fields populate (item code, name, category, sub-category, packing type, UOM, weight per unit as applicable) and remain read-only where the admin marks them read-only. | P0 | Planned |
| TC15 | Invalid product selection rejected | Attempt to submit / save a line with an invalid product value (non-choice / tampered option). Assert Django rejects with choice validation (e.g. not one of the available choices); dependent autofill fields do not show a valid FG product. | P1 | Planned |
| TC16 | Quantity must be positive | On a line, enter quantity `0` and then a negative value (e.g. `-5`), attempt **Submit Requisition**. Expected: both rejected with validation. *Known gap:* admin model currently allows `0` default — treat unexpected acceptance as FAIL (product defect). | P1 | Planned |
| TC17 | Multiple product lines on one PR | Add three different valid FG products with positive quantities, **Submit Requisition**. Assert one PR with three line items and status `submitted`. | P0 | Planned |
| TC18 | Remove a line before submit | Add two lines, delete / remove one via inline delete, **Submit Requisition**. Assert only the remaining line is persisted on the submitted PR. | P0 | Planned |

## Post-submit list & lock

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC19 | Submitted PR visible on own list | After TC08 (or equivalent), open **Finished Goods** changelist. Assert the new PR appears for the requesting Depot Officer with status **Submitted** (`submitted`). | P0 | Planned |
| TC20 | Submitted PR is locked for Depot Officer | Open a PR with status `submitted` as the creating Depot Officer. Expected: core fields and line quantities are read-only / non-editable; no meaningful edit path except allowed owner actions defined in UI (e.g. cancel if shown). *Known gap:* urgency and/or line quantities may still be editable — treat unexpected mutability as FAIL (product defect). | P0 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Depot Officer FG PR create / list / view lock, Dest POI scoping, portal RBAC smoke for FB-007 menus.
- Out of scope: Feed Mill Officer variants (mirror later), Distribution Officer TR creation, Transport / TO, Port Shipments, yard Gate/Scale/CC/Load/Unload operational steps beyond menu visibility, REST API, XSS/SQLi injection suites.
- Out of scope (low MCP value): blank Urgency — field defaults to **Normal** (`Urgency.NORMAL`); empty urgency is not a realistic UI path.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `depot.officer1@yopmail.com` / `Nourish@1234!` |
| Second actor (TC05) | `depot.officer2@yopmail.com` / `Nourish@1234!` |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Working site | Select seed POI when bar shows **Working site — Required** (e.g. `ctg-depot`) |

### Master data prerequisites

- At least two active seed POIs (`CTG-001` / ctg-depot, `CTG-002` / ctg-depot-02).
- TC05 requires **distinct** primary `UserOperationalPOI` for the two Depot Officers — verify before run; if both share one POI, assign distinct sites (Tenant Admin) rather than inventing non-seed names (no Dhaka/Cumilla).
- At least three active Finished Goods products selectable on the PR line inline (prior MCP runs used codes such as `FG-F-01` / `FG-F-02` when seeded).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| FG changelist | `/admin/requisitions/productrequisition/` — `admin:requisitions_productrequisition_changelist` |
| FG add | `/admin/requisitions/productrequisition/add/` — `admin:requisitions_productrequisition_add` |
| Submit | button **Submit Requisition** (`name="_submit_requisition"`) |
| Draft | **Save as Draft** (`name="_save"`) — not required for P0 happy path |
| Dest POI | `#id_destination_poi` disabled for POI-scoped requesters |
| Line product | inline `select[id$="-product"]` + `admin/js/pr_line_item_autofill.js` |

Prefer accessibility snapshot selectors over brittle CSS. Hide Django Debug Toolbar overlays before clicking Save/Submit if they intercept pointer events.

### Status & wipe notes

- Assert UI badge **Submitted** and persisted enum `submitted` (not draft).
- `pr_number` is system-generated (`PR-FG-YYYYMMDD-####`); it cannot use `MCP-` code prefix. Track created PRs by `pr_number` / requester / date for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md` or schema cleanup of MCP-session records.
- Prefer one `RUN_ID` per MCP session for any free-text remarks/special-instructions content (`MCP PR <RUN_ID>`).

### Known implementation alignment / gaps

| Topic | Spec / scenario expectation | Current admin (`apps/requisitions/admin.py`) |
|-------|-----------------------------|-----------------------------------------------|
| Dest POI | Pre-filled, read-only for depot/feed-mill (FB-007 v2) | `disabled=True` + queryset limited to assigned POI |
| Add form requester fields | Older scenarios expected Requester Name/Dept on create | Only on **Change** fieldsets |
| Optional text on create | Often called Remarks | Add form uses **Special instructions**; **Remarks** on change |
| Product entry | Free-text Item Code autofill | **Product** ModelChoice dropdown + JS autofill |
| Empty line submit | Must block (TC11) | *Known gap* — may still create PR |
| Past preferred delivery (TC13) | Must block | *Known gap* — may accept |
| Post-submit lock (TC20) | Fully locked | *Known gap* — urgency / quantities may remain editable |
| Urgency blank | Required empty | Defaults to Normal — not exercised |

### Original ID map (FG_DO → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_DO_001 | TC01 | Fixed menu tree (FG under Requisition; Dashboard included) |
| FG_DO_002 | TC02 | Admin URL denial; flexible deny assertion |
| FG_DO_003 | TC03 | Unchanged intent |
| FG_DO_004 + FG_DO_005 | TC04 | Merged (pre-fill + read-only) |
| FG_DO_006 | TC05 | Seed POIs instead of Dhaka/Cumilla |
| FG_DO_007 | TC06 | Matches Add fieldsets |
| FG_DO_008 | TC08 | Product select + **Submit Requisition** |
| FG_DO_009 | TC11 | Kept; known gap |
| FG_DO_010 | — | Dropped (Urgency default) |
| FG_DO_011 | TC12 | Unchanged intent |
| FG_DO_012 | TC13 | Kept; known gap |
| FG_DO_013 | TC14 | Dropdown + autofill |
| FG_DO_014 | TC15 | Choice validation wording |
| FG_DO_015 | TC16 | Kept; known gap risk |
| FG_DO_016 | TC17 | Unchanged intent |
| FG_DO_017 | TC18 | Unchanged intent |
| FG_DO_018 | TC19 | Unchanged intent |
| FG_DO_019 | TC20 | Kept; known gap |
| FG_DO_020 | TC10 | Unchanged intent |
| FG_DO_021 | TC09 | **Special instructions** (not Remarks on add) |
| FG_DO_022 | — | Dropped (not MCP E2E; security elsewhere) |
| — | TC07 | Added (capacity panel, prior MCP PASS) |

### Suggested next step

Run Playwright MCP against this file (TC01–TC08 first), persist results under `tests/e2e/playwright-mcp/fg-do-pr-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
