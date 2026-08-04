---
module: sprint-7
specification: FB-002 — Product line item label includes subcategory when present — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-002
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
last_updated: 2026-07-30
last_mcp_run: 2026-07-30
last_mcp_verdict: 7/7 Pass
artifacts: tests/e2e/playwright-mcp/fb-002-product-line-item-label-artifacts/
playwright_mcp: true
---

# Sprint 7 — FB-002 — Product line item label (subcategory) — E2E Scenario Plan (Django Admin SSR)

> **2026-07-30 — All 7 test cases passed** (TC01–TC07). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-30 · **7/7 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-002-product-line-item-label-artifacts/RESULTS.md)  
**Accounts:** `depot.officer1`, `commercial.officer1`, `gateman1` (`.nourish@yopmail.com`)

**Feedback:** [FB-002](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-002--product-line-item-label-should-include-subcategory-when-present)  
**Implemented helper:** `apps.master_data.display.product_line_item_label`

**Label format (assert exactly; em dash `—`):**

| Product | Expected option text |
|---------|----------------------|
| Has subcategory | `[item_code] product_name — category_name — sub_category_name` |
| No subcategory | `[item_code] product_name — category_name` |

**In-scope surfaces (code-wired):**

1. FG / Port Shipment **Product** line dropdown (`ProductChoiceField` on PR / RM cargo inlines)
2. Gate **On-Demand TO Request** add — **Product lines** product `<select>` (form + `gate_products_by_type` JSON)

Out of scope: `Product.__str__` (`name (sku)`), loading/bay `code — name` helpers, REST serializers.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites (before TC01)

Create (or reuse wipe-friendly `MCP-` fixtures) under tenant **nourish**:

| Alias | Fields (minimum) |
|-------|------------------|
| **CAT-FG** | Active FG `ProductCategory` — e.g. name `MCP FB002 Feed` |
| **SUB-FG** | Active `ProductSubCategory` under **CAT-FG** — e.g. name `MCP FB002 Broiler` |
| **PROD-WITH-SUB** | Active FG `Product`: `product_item_code` e.g. `MCP-FB002-W`, name e.g. `MCP FB002 With Sub`, category **CAT-FG**, sub_category **SUB-FG**, UOM suitable for PR |
| **PROD-NO-SUB** | Active FG `Product`: code e.g. `MCP-FB002-N`, name e.g. `MCP FB002 No Sub`, category **CAT-FG**, **sub_category blank** |
| **CAT-RM** / **SUB-RM** / **PROD-RM-WITH-SUB** | Same pattern for Raw Material (Port Shipment + Gate RM path) |

Expected labels (substitute real codes/names from seed):

- With sub: `[MCP-FB002-W] MCP FB002 With Sub — MCP FB002 Feed — MCP FB002 Broiler`
- No sub: `[MCP-FB002-N] MCP FB002 No Sub — MCP FB002 Feed`

Wipe prefix: `MCP-FB002-` / `MCP FB002`.

---

## A — Finished Goods PR line product dropdown

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | FG PR dropdown includes subcategory when present | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), log in at `/admin/login/`, set working site if prompted, open **Requisition → Finished Goods → Add Product Requisition** (`/admin/requisitions/productrequisition/add/`). On the product line inline, open the **Product** `<select>`. Assert an `<option>` for **PROD-WITH-SUB** whose visible text equals `[code] name — category — subcategory` (em dash). Do not submit. | P0 | Pass |
| TC02 | FG PR dropdown omits subcategory when absent | Same session/form as TC01 (or re-open Add PR). Assert **PROD-NO-SUB** option text equals `[code] name — category` only — no trailing `— <subcategory>`. | P0 | Pass |

## B — Port Shipment (RM) line product dropdown

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Port Shipment RM dropdown includes subcategory when present | As **Commercial Officer** (`commercial.officer1.nourish@yopmail.com`), open **Procurement → Port Shipments → Add** (`/admin/requisitions/portshipmentproxy/add/`). On **RM Cargo Line Items**, open **Product**. Assert **PROD-RM-WITH-SUB** option text is `[code] name — category — subcategory`. | P0 | Pass |

## C — Gate On-Demand TO product lines

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | On-Demand TO FG product select includes subcategory | As **Gateman** (`gateman1.nourish@yopmail.com`) or **POI Admin** (`poi.admin1.nourish@yopmail.com`) with Gate On-Demand write, open **Gate → On-Demand TO Requests → Add** (`/admin/operations/gateondemandtorequest/add/`). Set **Product type** to **Finished Goods** so product lines load. On first **Product lines** row, open **Product**. Assert **PROD-WITH-SUB** label equals `[code] name — category — subcategory`. | P0 | Pass |
| TC05 | On-Demand TO FG product select omits subcategory when absent | Same add form as TC04. Assert **PROD-NO-SUB** option text equals `[code] name — category` only. | P0 | Pass |
| TC06 | On-Demand RM path uses same label helper | On Add On-Demand TO, set **Product type** to **Raw Material**. Assert **PROD-RM-WITH-SUB** option text matches `[code] name — category — subcategory` (same helper as PR/Port). | P1 | Pass |

## D — Cross-surface consistency

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Same product label on PR and Gate On-Demand | Capture the exact **PROD-WITH-SUB** option string from TC01 (FG PR) and TC04 (Gate On-Demand FG). Assert the two strings are identical. | P1 | Pass |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: option **text** on product dropdowns listed above; format with/without subcategory.
- Out of scope: submitting PR/On-Demand TO; Product master CRUD; Bay Assignment / loading TO detail panels (different label helpers — not FB-002 wiring); API.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| FG PR actor | `depot.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Port Shipment actor | `commercial.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Gate On-Demand actor | `gateman1.nourish@yopmail.com` or `poi.admin1.nourish@yopmail.com` / `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Surface | Path |
|---------|------|
| FG PR add | `/admin/requisitions/productrequisition/add/` |
| Port Shipment add | `/admin/requisitions/portshipmentproxy/add/` |
| On-Demand TO add | `/admin/operations/gateondemandtorequest/add/` |
| PR/Port product control | line inline `select` for field **product** (e.g. `select[name$="-product"]`) |
| Gate product control | `#gate-on-demand-lines` table **Product** column `select` |
| Gate products JSON | `#gate-products-by-type` (`json_script`) — optional assert that embedded labels match helper |

### Known implementation alignment

- Helper: `product_line_item_label` — subcategory appended only when `sub_category_id` and non-empty `sub_category_name`.
- Separator is Unicode em dash `—` (U+2014), not hyphen `-`.
- Querysets `select_related("category", "sub_category")` on these dropdowns.
- Unit coverage: `tests/unit/test_master_data/test_product_line_item_label.py`.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-30 | **7/7** | All test cases passed (Playwright MCP). Seeded `MCP-FB002-*` FG/RM products; asserted dropdown option text on PR, Port Shipment, and Gate On-Demand. |
