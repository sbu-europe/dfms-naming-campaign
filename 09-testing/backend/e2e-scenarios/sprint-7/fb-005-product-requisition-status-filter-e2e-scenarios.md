---
module: sprint-7
specification: FB-005 — Product Requisition list hide Draft from status filter for Distribution Officer — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-005
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
last_updated: 2026-07-30
last_mcp_run: 2026-07-30
last_mcp_verdict: 3/3 Pass
artifacts: tests/e2e/playwright-mcp/fb-005-product-requisition-status-filter-artifacts/
playwright_mcp: true
---

# Sprint 7 — FB-005 — Product Requisition list: hide Draft from status filter for Distribution Officer — E2E Scenario Plan (Django Admin SSR)

> **2026-07-30 — All 3 test cases passed** (TC01–TC03). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-30 · **3/3 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-005-product-requisition-status-filter-artifacts/RESULTS.md)  
**Accounts:** `distribution.officer1`, `depot.officer1` (`.nourish@yopmail.com`)

**Feedback:** [FB-005](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-005--product-requisition-list--hide-draft-from-status-filter-for-distribution-officer)

**AC (assert after fix):**

1. When logged in as **Distribution Officer**, the Product Requisition changelist **status** filter SHALL **not** offer **Draft**.
2. Other roles that own Draft PRs (e.g. **Depot Officer**) SHALL still see **Draft** in the status filter.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## A — Distribution Officer

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | DO status filter omits Draft | As **Distribution Officer** (`distribution.officer1.nourish@yopmail.com`), log in at `/admin/login/`, set working site if prompted, open **Requisition → Finished Goods → Product Requisitions** (`/admin/requisitions/productrequisition/`). In the right-side / filter sidebar status filter (`#changelist-filter` / links under **By status**), assert there is **no** filter option labelled **Draft** (and no `?status__exact=draft` link). Assert at least one other status option remains (e.g. **Submitted**). | P0 | Pass |
| TC02 | DO submitted filter still works | Still as DO on the same changelist, click **Submitted** in the status filter (or navigate `?status__exact=submitted`). Assert the page loads without error and the status filter shows **Submitted** as selected (or results are consistent with submitted-only). | P1 | Pass |

## B — Cross-role (Depot Officer still sees Draft)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Depot Officer status filter includes Draft | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), open `/admin/requisitions/productrequisition/`. Assert the status filter **includes** a **Draft** option (`status__exact=draft` or visible “Draft” link). | P0 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-30 | **3/3** | All test cases passed (Playwright MCP). |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: FG Product Requisition changelist **status** filter options by role.
- Out of scope: Port Shipment filters; hiding Cancelled; Distribution Manager parity; row queryset behaviour (already excludes drafts for DO).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `distribution.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Secondary actor | `depot.officer1.nourish@yopmail.com` / `Nourish@1234!` (TC03) |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Item | Value |
|------|--------|
| Changelist | `/admin/requisitions/productrequisition/` |
| Filter panel | `#changelist-filter` |
| Status Draft link | `a[href*="status__exact=draft"]` or text **Draft** under By status |
| Status Submitted | `a[href*="status__exact=submitted"]` |

### Suggested next step

`tests/e2e/playwright-mcp/fb-005-product-requisition-status-filter-artifacts/` + `run-fb005.js` via Playwright MCP `browser_run_code_unsafe`.
