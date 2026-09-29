---
module: sprint-8
specification: FB-012 — TO Creation Allocated Quantity Per Product shows Remaining Quantity — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: FB-012, TO-01
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/05-transport-planner.md
implementation_reference:
  - ../../../../../templates/admin/transport/transportorder/create_from_tr.html (Allocate Quantities per Product table; TR Total Weight; horizontal scroll)
  - ../../../../../apps/transport/admin.py (TransportOrderAdmin.create_from_tr_view — remaining_quantity, tr_total_weight_display)
  - ../../../../../apps/transport/services.py (TOLineAllocationService.remaining_for_tr_line)
last_updated: 2026-08-07
last_mcp_run: 2026-08-07
last_mcp_verdict: 8/8 Pass
artifacts: tests/e2e/playwright-mcp/fb-012-to-creation-remaining-quantity-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-012 — TO Creation Remaining Quantity — E2E Scenario Plan (Django Admin SSR)

> **2026-08-07 — All 8 test cases passed** (TC01–TC08). Suite signed off via Playwright MCP against Nourish admin (v1.1 display polish).

**Last MCP run:** 2026-08-07 · **8/8 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-012-to-creation-remaining-quantity-artifacts/RESULTS.md)  
**Accounts:** `transport.planner1` (`.nourish@yopmail.com`) · **RUN_ID:** `28E2EEB2`

**Improvement:** [FB-012](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/05-transport-planner.md#fb-012--to-creation-details--allocated-quantity-per-product-shall-show-remaining-quantity)

**Sibling:** [FB-011 Planner TR list Remaining Weight](./fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md) (list-level kg remainder; this plan is per-product qty on TO create).

**AC (assert after fix):**

1. On **Create Transport Order** (`create-from-tr`), the **Allocate Quantities per Product** table SHALL display a **Remaining Quantity** column.
2. Remaining Quantity = TR line qty − qty already allocated to non-cancelled TOs − qty entered for this create (× **Number of TOs** when > 1), and SHALL update as the planner enters allocate qty.
3. Remaining Quantity cell format SHALL match **Already Allocated**: `{qty} {UOM}` plus quiet line `≈ {weight_per_unit} kg/unit`.
4. TR snapshot header SHALL show **Total Weight** as `{mt} MT ({kg} kg)` (line UOM × weight_per_unit), not bag-count labeled as kg.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **UI labels (code):** Section = **Allocate Quantities per Product**; allocate column = **Allocate for This TO** / **Allocate per TO** (multi). Story wording “Allocated Quantity Per Product” maps to this section.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Transport Planner** `transport.planner1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Unallocated TR | TR in planner creatable status with ≥1 line, **Already Allocated** = **—** — remaining qty equals **TR Qty** (same UOM). Prefer `TR-FG-20260624-0002`. |
| Partial TR | TR with ≥1 non-cancelled TO allocating part of a line — Prefer `TR-FG-20260717-0001`. |
| Wipe | Prefer notes / RUN_ID `MCP-FB012RQ-` only if creating new TOs; do not wipe unrelated seed TRs. |

---

## A — Column presence & display format

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Remaining Quantity column on allocate table | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Transport → Transport requests**, pick a creatable TR, click **Create TO** (or open `/admin/transport/transportorder/create-from-tr/<tr_uuid>/`). Assert section **Allocate Quantities per Product** and table headers include **Remaining Quantity** (alongside **TR Qty**, **Already Allocated**, **Allocate for This TO**). Assert allocate table is inside a horizontal scroll wrapper (`.to-alloc-scroll`). | P0 | Pass |
| TC02 | Remaining cell matches Already Allocated format | Still on create-from-tr for a TR with ≥1 product line and known `weight_per_unit`, assert each Remaining Quantity cell shows **`{qty} {UOM}`** on the primary line (e.g. `5 Bags`) and a quiet secondary line **`≈ {weight_per_unit} kg/unit`** — same pattern as **Already Allocated** (not qty alone with UOM on a separate line only). | P0 | Pass |
| TC08 | TR snapshot Total Weight MT (kg) | On the same create-from-tr page, assert TR header label is **Total Weight** (not **Total Quantity**) and value matches `{mt} MT ({kg} kg)` (e.g. `0.650 MT (649.990 kg)`), derived from Σ(TR line qty × weight_per_unit), not `tr.total_quantity` bag count. | P0 | Pass |

## B — Value correctness (load + live update)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Unallocated line — remaining equals TR Qty | As Transport Planner on create-from-tr for a TR line with **Already Allocated** = **—**, note **TR Qty** and Remaining primary qty. Assert remaining qty equals TR Qty (UOM on same line). Leave **Allocate for This TO** at `0`. | P0 | Pass |
| TC04 | Partially allocated line — remaining = TR − already | As Transport Planner, open create-from-tr for a partially allocated TR. For a partial line, assert Remaining qty ≈ **TR Qty** − **Already Allocated** qty (UOM), strictly less than TR Qty, and Remaining cell still shows `≈ … kg/unit`. | P0 | Pass |
| TC05 | Remaining decreases when allocate qty entered | On create-from-tr (**Number of TOs** = `1`), note initial Remaining. Enter a positive **Allocate for This TO** less than remaining. Assert Remaining updates live to initial − entered qty **and** still shows `{qty} {UOM}` + kg/unit line. Clear to `0` and assert remaining restores. | P0 | Pass |

## C — Multi-TO & validation edge

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Multi-TO — remaining accounts for Number of TOs | As Transport Planner on create-from-tr, set **Number of TOs** to `2`. Enter allocate qty `Q` on a line with initial remaining `R` where `2×Q ≤ R`. Assert Remaining updates to `R − 2×Q` with UOM still shown. Do not submit if only checking display. | P1 | Pass |
| TC07 | Over-allocate still blocked server-side | As Transport Planner, enter allocate qty that exceeds Remaining (single TO). Click **Create Transport Order**. Assert form does not succeed: error about exceeding remaining available; stay on create-from-tr. | P1 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-07 | **8/8** | v1.1 re-run RUN_ID `28E2EEB2`. Format parity + Total Weight + scroll. `TR-FG-20260624-0002`, `TR-FG-20260717-0001`. |
| 2026-08-07 | **7/7** | Prior run RUN_ID `F0309923` (pre display-format / Total Weight polish). |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: create-from-tr **Remaining Quantity** column (presence, Already Allocated–style format, live update), TR header **Total Weight** `MT (kg)`, allocate table horizontal scroll.
- Out of scope: Planner TR list **Remaining Weight (KG)** (**FB-011**); TO details PR line items (**FB-013**); REST API.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Passwords | `Nourish@1234!` |
| Credentials file | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Item | Value |
|------|--------|
| Planner TR queue | `/admin/requisitions/transportrequisition/` |
| Create TO from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| Section | `.to-section` · **Allocate Quantities per Product** |
| Scroll / table | `.to-alloc-scroll` · `.to-alloc-table` · `[data-remaining-value]` · `.to-alloc-input` |
| TR header weight | `.to-tr-meta__item` · **Total Weight** · `tr_total_weight_display` |
| Submit | **Create Transport Order** (`#submit-btn`) |

### Known story ↔ code alignment (post-impl)

- Remaining cell: `{qty} {UOM}` + `≈ {wpu} kg/unit` (parity with Already Allocated); live JS appends UOM via `data-uom`.
- TR header: **Total Weight** = `format_qty(mt) MT (format_qty(kg) kg)` from Σ(line qty × wpu); not `tr.total_quantity`.
- Allocate table wrapped in `.to-alloc-scroll` (`overflow-x: auto`, `min-width: 920px`).
- Live remaining = max(0, base − allocate × **Number of TOs**); server still uses `TOLineAllocationService.remaining_for_tr_line`.

### Suggested next step

Suite signed off (v1.1).
