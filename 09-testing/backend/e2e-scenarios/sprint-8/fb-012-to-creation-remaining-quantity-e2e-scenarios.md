---
module: sprint-8
specification: FB-012 — TO Creation Allocated Quantity Per Product shows Remaining Quantity — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-012, TO-01
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md
implementation_reference:
  - ../../../../../templates/admin/transport/transportorder/create_from_tr.html (Allocate Quantities per Product table)
  - ../../../../../apps/transport/admin.py (TransportOrderAdmin.create_from_tr_view)
  - ../../../../../apps/transport/services.py (TOLineAllocationService.remaining_for_tr_line)
last_updated: 2026-08-07
last_mcp_run: 2026-08-07
last_mcp_verdict: 7/7 Pass
artifacts: tests/e2e/playwright-mcp/fb-012-to-creation-remaining-quantity-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-012 — TO Creation Remaining Quantity — E2E Scenario Plan (Django Admin SSR)

> **2026-08-07 — All 7 test cases passed** (TC01–TC07). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-07 · **7/7 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-012-to-creation-remaining-quantity-artifacts/RESULTS.md)  
**Accounts:** `transport.planner1` (`.nourish@yopmail.com`) · **RUN_ID:** `F0309923`

**Improvement:** [FB-012](../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md#fb-012--to-creation-details--allocated-quantity-per-product-shall-show-remaining-quantity)

**Sibling:** [FB-011 Planner TR list Remaining Weight](./fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md) (list-level kg remainder; this plan is per-product qty on TO create).

**AC (assert after fix):**

1. On **Create Transport Order** (`create-from-tr`), the **Allocate Quantities per Product** table SHALL display a **Remaining Quantity** column.
2. Remaining Quantity = TR line qty − qty already allocated to non-cancelled TOs − qty entered for this create (× **Number of TOs** when > 1), and SHALL update as the planner enters allocate qty.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **UI labels (code):** Section = **Allocate Quantities per Product**; allocate column = **Allocate for This TO** / **Allocate per TO** (multi). Story wording “Allocated Quantity Per Product” maps to this section.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Transport Planner** `transport.planner1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Unallocated TR | TR in planner creatable status (`available_for_transport_planning` / `under_planning` / `partially_allocated`) with ≥1 line, **Already Allocated** = **—** / 0 — remaining should equal **TR Qty**. Prefer reuse of FB-011 unallocated TR (e.g. `TR-FG-20260624-0002`) if still available. |
| Partial TR | TR with ≥1 non-cancelled TO allocating only part of a line — **Already Allocated** > 0 and Remaining = TR Qty − Already Allocated at load. Prefer `TR-FG-20260717-0001` if still partial. |
| Wipe | Prefer notes / RUN_ID `MCP-FB012RQ-` only if creating new TOs; cancel or leave test TOs; do not wipe unrelated seed TRs. |

---

## A — Column presence (TO create)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Remaining Quantity column on allocate table | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Transport → Transport requests**, pick a creatable TR, click **Create TO** / **Create transport order** (or open `/admin/transport/transportorder/create-from-tr/<tr_uuid>/`). Assert section **Allocate Quantities per Product** and table headers include **Remaining Quantity** (alongside **TR Qty**, **Already Allocated**, **Allocate for This TO**). | P0 | Pass |
| TC02 | Remaining cell shows numeric UOM qty | Still on create-from-tr for a TR with ≥1 product line, assert each product row’s Remaining Quantity cell shows a non-negative number (optionally with UOM), not blank when the line has TR Qty > 0. | P0 | Pass |

## B — Value correctness (load + live update)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Unallocated line — remaining equals TR Qty | As Transport Planner on create-from-tr for a TR line with **Already Allocated** empty/**—**, note **TR Qty** and **Remaining Quantity**. Assert remaining equals TR Qty (same numeric tolerance as `floatformat`). Leave **Allocate for This TO** at `0`. | P0 | Pass |
| TC04 | Partially allocated line — remaining = TR − already | As Transport Planner, open create-from-tr for a TR that already has active TO line allocation. For a partial line, assert **Remaining Quantity** ≈ **TR Qty** − **Already Allocated** (UOM), and is strictly less than TR Qty. | P0 | Pass |
| TC05 | Remaining decreases when allocate qty entered | On create-from-tr (single TO, **Number of TOs** = `1`), note initial Remaining for a line. Enter a positive **Allocate for This TO** value less than remaining (e.g. half). Assert **Remaining Quantity** updates live to initial − entered qty (without submit). Optionally clear input back to `0` and assert remaining restores. | P0 | Pass |

## C — Multi-TO & validation edge

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Multi-TO — remaining accounts for Number of TOs | As Transport Planner on create-from-tr, set **Number of TOs** to `2`. Enter allocate qty `Q` on a line with initial remaining `R` where `2×Q ≤ R`. Assert Remaining updates to `R − 2×Q` (or documented equivalent). Do not submit if only checking display. | P1 | Pass |
| TC07 | Over-allocate still blocked server-side | As Transport Planner, enter allocate qty that exceeds Remaining (single TO). Click **Create Transport Order**. Assert form does not succeed: error about exceeding remaining available, and no new TO for this attempt (or success message absent). | P1 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-07 | **7/7** | Playwright MCP; RUN_ID `F0309923`. Used `TR-FG-20260624-0002` (unallocated), `TR-FG-20260717-0001` (partial). No TO created (TC07 rejected). |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **Create Transport Order from TR** allocate table — **Remaining Quantity** column presence, load-time value, and live update vs allocate / to_count.
- Out of scope: Planner TR list **Remaining Weight (KG)** (**FB-011**); TO details PR line items (**FB-013**); REST API; Playwright script implementation (this file is the plan only).

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
| Planner TR queue | `/admin/requisitions/transportrequisition/` · `admin:requisitions_transportrequisition_changelist` |
| Create TO from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` · `admin:transport_transportorder_create_from_tr` |
| Section | `.to-section` heading **Allocate Quantities per Product** |
| Table | `.to-alloc-table` · header **Remaining Quantity** · allocate inputs `.to-alloc-input` |
| Submit | **Create Transport Order** / **Create Transport Orders** (`#submit-btn`) |

### Known story ↔ code alignment (post-impl)

- Story says **Allocated Quantity Per Product**; template section is **Allocate Quantities per Product**.
- Table columns: **TR Qty**, **Already Allocated**, **Remaining Quantity**, **Allocate for This TO** / **Allocate per TO**.
- Load remaining = TR line qty − non-cancelled TO allocations (`remaining_quantity` on line in `create_from_tr_view`).
- Live JS: remaining = max(0, base − allocate × **Number of TOs**); floored at 0 for display.
- Server validation still uses `TOLineAllocationService.remaining_for_tr_line` (unchanged).

### Suggested next step

Suite signed off. Optional: mark FB-012 Resolved on the improvements tracker after product sign-off.
