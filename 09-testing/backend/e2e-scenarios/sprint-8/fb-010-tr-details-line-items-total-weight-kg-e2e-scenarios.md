---
module: sprint-8
specification: FB-010 — TR Details & line items show Total Weight (KG) and Total Quantity for Distribution & Procurement roles — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-010, DR-02, PC-02
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/04-transport-requests.md
implementation_reference:
  - ../../../../../apps/requisitions/admin.py (TransportRequisitionAdmin fieldsets / total_weight_kg_display, TRLineItemInline)
  - ../../../../../templates/admin/requisitions/transportrequisition/change_form.html
  - ../../../../../apps/core/portal_navigation.py (distribution_transport_requests, procurement_transport_requests)
last_updated: 2026-08-07
last_mcp_run: 2026-08-07
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-010-tr-details-line-items-total-weight-kg-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-010 — TR Details & Line Items Total Weight (KG) — E2E Scenario Plan (Django Admin SSR)

> **2026-08-07 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-07 · **6/6 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-010-tr-details-line-items-total-weight-kg-artifacts/RESULTS.md)  
**Accounts:** `distribution.officer1` · `distribution.manager1` · `procurement.officer1` (`.nourish@yopmail.com`) · **RUN_ID:** `5182CF45`

**Improvement:** [FB-010](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/04-transport-requests.md#fb-010--tr-details--line-items-show-total-weight-kg-and-total-quantity-for-distribution--procurement-roles)

**Sibling:** [FB-009 TR list weight](./fb-009-tr-list-total-weight-kg-e2e-scenarios.md) (changelist only; signed off).

**AC (assert after fix):**

1. For **Distribution Officer**, **Distribution Manager**, and **Procurement Officer**, the TR **change form** (details) SHALL display **Total Weight (KG)** in the header / summary (Delivery / totals area).
2. The TR **line items** tabular inline SHALL display **both** **Total Quantity** and **Total Weight (KG)** columns (quantity alone is insufficient).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actors | **Distribution Officer** `distribution.officer1.nourish@yopmail.com` · **Distribution Manager** `distribution.manager1.nourish@yopmail.com` · **Procurement Officer** `procurement.officer1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| FG TR | At least one FG TR visible to DO (own) / DM (all FG) with ≥1 line item and known `weight_per_unit` so header and line weight ≠ `—`. Reuse FB-009 fixtures if ownership still set; else open any visible TR from list. |
| Port TR | At least one Port Consignment TR owned by Procurement Officer with ≥1 line item. |
| Wipe | Prefer remarks / RUN_ID `MCP-FB010TR-` only if creating new fixtures; do not wipe unrelated seed TRs. |

---

## A — Distribution Officer (FG TR details)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | DO TR details shows Total Weight (KG) | As **Distribution Officer** (`distribution.officer1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`), click a TR with line allocations into the change form (`/admin/requisitions/transportrequisition/<uuid>/change/`). In `#content-main` / Delivery (or totals) fieldset, assert a readonly field labelled **Total Weight (KG)** (or exact admin `short_description`) with a numeric value ending in **`kg`** (not empty / not only `—` when lines exist). | P0 | Pass |
| TC02 | DO TR details still shows Total Quantity | Still on the same DO TR change form, assert **Total Quantity** (header summary field for TR `total_quantity`) remains visible alongside Total Weight — FB-010 adds weight on details; it does not remove quantity from the details summary. | P1 | Pass |
| TC03 | DO line items show Quantity + Weight columns | Still as Distribution Officer on the same change form, locate the **TR line items** tabular inline (`.inline-group` / `#trlineitem_set-group` or equivalent). Assert column headers include **Total Quantity** and **Total Weight (KG)**. Assert at least one data row shows a quantity value and a weight cell ending in **`kg`**. | P0 | Pass |

## B — Distribution Manager (FG TR details)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | DM TR details + lines show weight and quantity | As **Distribution Manager** (`distribution.manager1.nourish@yopmail.com`), open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`), open a FG TR change form with lines. Assert details show **Total Weight (KG)** with a `kg` value, and the line-items table shows both **Total Quantity** and **Total Weight (KG)** with at least one `kg` line cell. | P0 | Pass |

## C — Procurement Officer (Port TR details)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | PO Port TR details + lines show weight and quantity | As **Procurement Officer** (`procurement.officer1.nourish@yopmail.com`), open **Procurement → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=PORT_CONSIGNMENT`), open a Port TR change form with lines. Assert details show **Total Weight (KG)** with a `kg` value, and the line-items table shows both **Total Quantity** and **Total Weight (KG)** with at least one `kg` line cell. | P0 | Pass |

## D — Consistency spot-check

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Header weight aligns with line weights | As Distribution Officer (or DM) on a multi-line TR change form, note the header **Total Weight (KG)** value and the per-line **Total Weight (KG)** cells. Assert header kg equals the sum of visible line kg values (same formatting tolerance as FB-009 list: Σ `allocated_quantity × weight_per_unit`). | P1 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-07 | **6/6** | Playwright MCP; RUN_ID `5182CF45`. Used `TR-FG-20260717-0001` (DO/DM) and `TR-PORT-20260710-0002` (PO). |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **TR change form** summary + **TRLineItem** inline columns for DO / DM / PO.
- Out of scope: TR **changelist** columns (**FB-009**, already covered); Transport Planner **Remaining Weight** (**FB-011**); TO creation; REST API; Playwright script implementation (this file is the plan only).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` (or env equivalent) |
| Login | `/admin/login/` |
| Passwords | `Nourish@1234!` |
| Credentials file | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Item | Value |
|------|--------|
| FG TR changelist | `/admin/requisitions/transportrequisition/?tr_type=FG` · `admin:requisitions_transportrequisition_changelist` |
| Port TR changelist | `/admin/requisitions/transportrequisition/?tr_type=PORT_CONSIGNMENT` |
| TR change form | `/admin/requisitions/transportrequisition/<uuid>/change/` · `admin:requisitions_transportrequisition_change` |
| Main form | `#content-main` · fieldset labels / `.form-row` for Total Weight / Total Quantity |
| Line items | `#trlineitem_set-group` (or `.inline-group` containing TR lines) · `thead th` / row cells |

### Known story ↔ code alignment (post-impl)

- Change form Delivery fieldset includes `total_quantity` and `total_weight_kg_display` (**Total Weight (KG)**).
- `TRLineItemInline` columns: product, pack size, **Total Quantity**, UOM, **Total Weight (KG)**.
- Weight formula: line kg = `allocated_quantity × pr_line_item.weight_per_unit` (default wpu `1`); header = sum of line kg — shared helpers `_tr_line_weight_kg` / `_format_weight_kg_display`.
- Unit: `tests/unit/test_requisitions/test_fb010_tr_details_total_weight.py`.

### Suggested next step

Suite signed off. Optional: mark FB-010 Resolved on the improvements tracker after product sign-off.
