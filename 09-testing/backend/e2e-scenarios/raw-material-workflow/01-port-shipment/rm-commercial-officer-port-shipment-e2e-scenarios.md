---
module: 04-requisitions
specification: Raw Materials Workflow — Section 1 — Port Shipment Registration (Commercial Officer) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: PR-02, PORT-01
source_spec: ../../../../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-08-17
playwright_mcp: true
last_mcp_run: 2026-08-17
last_mcp_verdict: 12/12 Pass
artifacts: tests/e2e/playwright-mcp/rm-01-port-shipment-artifacts/
---

# Raw Materials Workflow — Section 1 — Commercial Officer — Port Shipment Registration — E2E Scenario Plan (Django Admin SSR)

> **2026-08-17 — All 12 test cases passed** (TC01–TC12). Suite signed off via Playwright MCP against Nourish admin (`RUN_ID=C4E217A8`).


**Last MCP run:** 2026-08-17 · **12/12 Pass** · `RUN_ID=C4E217A8`  
**Chain:** `PS-PORT-20260817-0003` → `TR-PORT-20260817-0004` → `TO-20260817-0004` → **Closed**  
**Artifacts:** [`tests/e2e/playwright-mcp/rm-01-port-shipment-artifacts/RESULTS.md`](../../../../../tests/e2e/playwright-mcp/rm-01-port-shipment-artifacts/RESULTS.md)  
**Navigation:** **Port Shipments** → **Add Port Shipment** (`/admin/requisitions/portshipmentproxy/add/`)

Scope: **Commercial Officer** creating and submitting Port Shipments (`pr_type = PORT_CONSIGNMENT`) with LC & Shipping Documentation and RM cargo line items. Procurement TR creation and yard operations are out of scope.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & Add form access

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Commercial Officer can open Add Port Shipment form | As **Commercial Officer** (`commercial.officer1.nourish@yopmail.com`), log in at `/admin/login/`, open **Port Shipments** (`/admin/requisitions/portshipmentproxy/`), click **Add Port Shipment**. Assert add form loads with **LC & Shipping Documentation** fieldset and **RM Cargo Line Items** inline section. | P0 | Pass |

## LC & Shipping Documentation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | LC & Shipping Documentation fields captured on submit | On Add Port Shipment, enter **B/L Number** (`bill_of_lading_number`), **LC Number** (`lc_number`), **Vessel Name**, **Voyage Name**, **Container Number(s)** (`container_numbers`), **C&F Agent Name** (`cnf_agent_name`), **Point of Loading** (`point_of_loading`), **ETA** (`estimated_time_of_arrival`). Add at least one RM cargo line (TC04), click **Submit Port Shipment** (`_submit_shipment`). Assert values persist on change view after redirect. | P0 | Pass |
| TC03 | Mandatory field validation on LC section at submit | On Add Port Shipment, leave **B/L Number** or **LC Number** blank, add a valid RM line item, click **Submit Port Shipment**. Expected: field-level errors (`Required before submission.`) on blank LC fields; record not **Submitted**. *Draft save via **Save as Draft** (`_save`) may succeed with blanks.* | P0 | Pass |

## RM Cargo Line Items

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Commercial Officer can add RM cargo line items | With LC section filled, in **RM Cargo Line Items** inline click **Add another RM Cargo Line Item**, select a **Raw Material** product from dropdown, enter positive **Product quantity** (tentative qty). Save draft or submit. Assert line shows product item code, category, UOM, and quantity on change view. | P0 | Pass |
| TC05 | Multiple RM cargo line items on one Port Shipment | On one Port Shipment add form, add **3** different RM product lines with positive quantities. Submit. Assert all 3 lines listed independently with correct product and qty. | P0 | Pass |
| TC06 | RM cargo quantity rejects zero and negative values | On Add Port Shipment with one RM line, set **Product quantity** to `0` then `-5` and attempt **Submit Port Shipment**. Expected: validation blocks submit; status not **Submitted**. *Known gap:* model may allow `0` on draft — treat unexpected submit as FAIL.* | P1 | Pass |
| TC11 | Port Shipment cannot be submitted without at least one RM line item | Fill all LC mandatory fields, leave RM cargo inline empty, click **Submit Port Shipment**. Expected: validation error requiring at least one cargo line; no **Submitted** status. *Assert inline minimum or server-side guard — treat empty-line submit as FAIL.* | P0 | Pass |

## Identity & auto-fill

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Entered By and Department auto-fill on creation | On Add Port Shipment (new record), assert **Entered By** / **Requester name** and **Department** (`requester_department`) are auto-populated from the logged-in Commercial Officer and are read-only or system-set on change view after first save. *Rewrite RM_007: admin does not expose a separate **Record Type** field — `pr_type` is implicit (`PORT_CONSIGNMENT`); assert menu label **Port Shipments** and generated `pr_number` prefix `PS-…` instead.* | P0 | Pass |

## Submit happy path & cross-role visibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Successful submit sets status Submitted | Complete LC fields + ≥1 RM line, click **Submit Port Shipment**. Assert success message, generated `pr_number` (`PS-…`), status badge **Submitted** (`submitted`), routed to Procurement queue. | P0 | Pass |
| TC09 | Submitted Port Shipment visible to Procurement Officer | After TC08, log in as **Procurement Officer** (`procurement.officer1.nourish@yopmail.com`), open **Procurement → Port Shipments** (`/admin/requisitions/portshipmentproxy/`). Assert new shipment visible with **Submitted** status and correct B/L / vessel / ETA columns. | P0 | Pass |

## RBAC & audit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | RBAC — Commercial Officer cannot create TR from Port Shipment | As **Commercial Officer** on submitted Port Shipment change view, assert **Create TR** action/link is absent. Changelist has no **Create TR** column for Commercial Officer role. | P0 | Pass |
| TC12 | Audit log captures Port Shipment creation event | After TC08, as **Tenant Admin** (`admin.nourish@yopmail.com`), open Port Shipment change view **History** (`/admin/requisitions/portshipmentproxy/<pk>/history/`) or `/admin/requisitions/practivitylog/?q={pr_number}`. Assert **Added** / `submitted` activity with Commercial Officer user and timestamp. *Rewrite RM_012: tenant **Audit Logs** menu may not capture admin SSR creates — primary assertion is admin History / `PRActivityLog`.* | P1 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Commercial Officer Port Shipment create/submit, RM cargo inlines, Procurement queue visibility, CO RBAC (no TR).
- Out of scope: Port TR creation (§2), Transport Orders, yard ops, REST API, notification delivery.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Primary actor | `commercial.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Procurement (TC09) | `procurement.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Tenant Admin (TC12) | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |

### Admin URLs & UI labels

| Action | Path / control |
|--------|----------------|
| CO Port Shipment queue | `/admin/requisitions/portshipmentproxy/` |
| Add Port Shipment | `/admin/requisitions/portshipmentproxy/add/` |
| Submit | button **Submit Port Shipment** (`name="_submit_shipment"`) |
| Draft | button **Save as Draft** (`name="_save"`) |
| RM inline | `RMCargoLineItemInline` — product dropdown limited to `RawMaterial` type |

### Wipe notes

- Track by `pr_number` (`PS-…`) and remarks; use `MCP PS <RUN_ID>` in vessel/B/L fields for wipe detection.

### Original ID map

| Legacy | TC | Verdict |
|--------|-----|---------|
| RM_001 | TC01 | Keep |
| RM_002 | TC02 | Keep |
| RM_003 | TC03 | Keep |
| RM_004 | TC04 | Keep |
| RM_005 | TC05 | Keep |
| RM_006 | TC06 | Keep (demote non-numeric to P1 — browser type=number) |
| RM_007 | TC07 | Rewrite (no Record Type field) |
| RM_008 | TC08 | Keep |
| RM_009 | TC09 | Keep |
| RM_010 | TC10 | Keep |
| RM_011 | TC11 | Keep |
| RM_012 | TC12 | Rewrite (admin History / PRActivityLog) |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-17 | **12/12 Pass** | Playwright MCP; see `tests/e2e/playwright-mcp/rm-01-port-shipment-artifacts/RESULTS.md`. Happy-path chain on MCP sandbox. |
