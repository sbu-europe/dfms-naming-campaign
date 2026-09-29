---
module: sprint-8
specification: FB-011 — Transport Planner TR List displays Remaining Weight (KG) for planning — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-011, TRQ-01
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/05-transport-planner.md
implementation_reference:
  - ../../../../../apps/requisitions/admin.py (TransportRequisitionAdmin.get_list_display for transport_planner)
  - ../../../../../apps/transport/services.py (TOLineAllocationService.remaining_for_tr_line / line_total_kg)
  - ../../../../../apps/core/portal_navigation.py (transport_requests)
last_updated: 2026-08-07
last_mcp_run: 2026-08-07
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-011-transport-planner-tr-list-remaining-weight-kg-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-011 — Transport Planner TR List Remaining Weight (KG) — E2E Scenario Plan (Django Admin SSR)

> **2026-08-07 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-07 · **6/6 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-011-transport-planner-tr-list-remaining-weight-kg-artifacts/RESULTS.md)  
**Accounts:** `transport.planner1` · `distribution.officer1` (`.nourish@yopmail.com`) · **RUN_ID:** `AA0F7636`

**Improvement:** [FB-011](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/05-transport-planner.md#fb-011--transport-planner-tr-list--display-remaining-weight-kg-for-planning)

**Sibling:** [FB-009 TR list Total Weight](./fb-009-tr-list-total-weight-kg-e2e-scenarios.md) (DO/DM/PO only; planner remaining weight is this plan).

**AC (assert after fix):**

1. The Transport Planner **TR list** SHALL display a **Remaining Weight (KG)** column.
2. Remaining Weight = TR total weight (kg) minus weight already allocated to non-cancelled TOs (planning remainder), formatted with unit **`kg`**.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Filename note:** Distinct from [`fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md`](./fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md) (Sprint 8 improvements **FB-003**, legacy sprint-7 FB-011 numbering).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Transport Planner** `transport.planner1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Unallocated TR | At least one TR in planner queue (`available_for_transport_planning` / `under_planning` / `partially_allocated`) with ≥1 line item and **no** (or zero) active TO allocations — remaining weight should equal TR total kg. |
| Partial TR | Prefer a TR with ≥1 active TO that allocates only part of TR quantity (status `partially_allocated`), so remaining kg is **less than** TR total but **> 0**. Create via **Create TO** from planner list if no seed exists. |
| Full TR (optional) | A `fully_allocated` TR in the planner queryset — remaining should be zero / empty display per implemented formatter. |
| Wipe | Prefer remarks / RUN_ID `MCP-FB011RW-` only if creating new TOs; do not wipe unrelated seed TRs/TOs. |

---

## A — Column presence (Transport Planner)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Planner TR list shows Remaining Weight (KG) header | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Transport → Transport requests** (`/admin/requisitions/transportrequisition/`). Assert `#result_list` column headers include **Remaining Weight (KG)** (or exact admin `short_description`). Assert planner-oriented columns still present (**Transport Orders**, **Create transport order** / **Create TO**). | P0 | Pass |
| TC02 | Remaining Weight cell shows kg unit | Still as Transport Planner on the same changelist, locate a TR row with line allocations and no (or incomplete) TO allocation. Assert the Remaining Weight cell shows a numeric value ending in **`kg`** (e.g. `500 kg`), not a bare UOM count, and not missing when lines exist and remainder > 0. | P0 | Pass |

## B — Value correctness (unallocated vs partial)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Unallocated TR — remaining equals total weight | As Transport Planner, identify a TR with **no** active TOs (or **Transport Orders** cell shows **—** / 0). Note Remaining Weight (KG). Open the same TR change form (`/admin/requisitions/transportrequisition/<uuid>/change/`) and note header **Total Weight (KG)**. Assert remaining list value equals details total weight (same formatting tolerance). | P0 | Pass |
| TC04 | Partially allocated TR — remaining less than total | As Transport Planner, open (or create) a TR that already has ≥1 non-cancelled TO allocating only part of the TR. On the planner TR list, assert Remaining Weight (KG) is **strictly less than** the TR’s Total Weight (KG) from the change form, still ends with **`kg`**, and is not equal to the full total. Optionally: remaining ≈ total − Σ(TO `allocated_quantity` in kg for that TR). | P0 | Pass |

## C — Scope guards

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | DO TR list still shows Total Weight (not Remaining) | As **Distribution Officer** (`distribution.officer1.nourish@yopmail.com`), open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`). Assert changelist still shows **Total Weight (KG)** and does **not** require a **Remaining Weight (KG)** column (FB-011 is planner-only). | P1 | Pass |
| TC06 | Fully allocated TR shows zero remainder | As Transport Planner, if a `fully_allocated` TR is visible in the queue, assert Remaining Weight shows **`0 kg`** or the implemented empty display (**`—`**) consistently — not a positive leftover kg. Skip if no fully allocated TR is available in the seed set. | P1 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-07 | **6/6** | Playwright MCP; RUN_ID `AA0F7636`. Used `TR-FG-20260624-0002` (unallocated), `TR-FG-20260717-0001` (partial), `TR-FG-20260713-0001` (`0 kg`). |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **Transport Planner** TR **changelist** Remaining Weight (KG) column and value correctness vs TO allocation.
- Out of scope: DO/DM/PO **Total Weight** (**FB-009** / **FB-010**); TO Creation **Remaining Quantity** column (**FB-012**); TO details PR line items (**FB-013**); REST API; Playwright script implementation (this file is the plan only).

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
| FG TR changelist (DO) | `/admin/requisitions/transportrequisition/?tr_type=FG` |
| TR change form | `/admin/requisitions/transportrequisition/<uuid>/change/` |
| Create TO | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| Table | `#result_list` · header row `thead th` · Remaining Weight cells |

### Known story ↔ code alignment (post-impl)

- Planner `get_list_display` includes `remaining_weight_kg_display` (**Remaining Weight (KG)**) before **Transport Orders** / **Create transport order**.
- Remaining kg = Σ over TR lines of `(TR line qty − Σ non-cancelled TO line qty) × weight_per_unit`.
- Fully allocated shows **`0 kg`** (not `—`); no lines shows **`—`**.
- DO/DM/PO lists still use **Total Weight (KG)** only (no Remaining).
- Changelist queryset prefetches `line_items__to_allocations__to` to avoid N+1.
- Unit: `tests/unit/test_requisitions/test_fb011_tr_list_remaining_weight.py`.

### Suggested next step

Suite signed off. Optional: mark FB-011 Resolved on the improvements tracker after product sign-off.
