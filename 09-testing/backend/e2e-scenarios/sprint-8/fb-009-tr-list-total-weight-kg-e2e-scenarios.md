---
module: sprint-8
specification: FB-009 — TR List shows Total Weight (KG) instead of Total Quantity for Distribution & Procurement roles — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-009, DR-02, PC-02
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-8/improvements/04-transport-requests.md
implementation_reference:
  - ../../../../../apps/requisitions/admin.py (TransportRequisitionAdmin.get_list_display, total_weight_kg_display)
  - ../../../../../apps/core/portal_navigation.py (distribution_transport_requests, procurement_transport_requests)
last_updated: 2026-08-07
last_mcp_run: 2026-08-07
last_mcp_verdict: 5/5 Pass
artifacts: tests/e2e/playwright-mcp/fb-009-tr-list-total-weight-kg-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-009 — TR List Total Weight (KG) — E2E Scenario Plan (Django Admin SSR)

> **2026-08-07 — All 5 test cases passed** (TC01–TC05). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-07 · **5/5 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-009-tr-list-total-weight-kg-artifacts/RESULTS.md)  
**Accounts:** `distribution.officer1` · `distribution.manager1` · `procurement.officer1` · `transport.planner1` (`.nourish@yopmail.com`) · **RUN_ID:** `85258276`

**Improvement:** [FB-009](../../../../03-backlog/phase-1/sprints/sprint-8/improvements/04-transport-requests.md#fb-009--tr-list-show-total-weight-kg-instead-of-total-quantity-for-distribution--procurement-roles)

**AC (assert after fix):**

1. For **Distribution Officer**, **Distribution Manager**, and **Procurement Officer**, the Transport Request changelist SHALL show a **Total Weight (KG)** column **instead of** **Total Quantity** / **Total Qty**.
2. Column header and cell values use KG (value suffix `kg`, consistent with PR weight totals).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Filename note:** Distinct from [`fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md`](./fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md) (Sprint 8 improvements **FB-001**, legacy sprint-7 FB-009 numbering).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actors | **Distribution Officer** `distribution.officer1.nourish@yopmail.com` · **Distribution Manager** `distribution.manager1.nourish@yopmail.com` · **Procurement Officer** `procurement.officer1.nourish@yopmail.com` · optional **Transport Planner** `transport.planner1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| FG TR | At least one FG TR visible to DO (own) / DM (all FG) with ≥1 line item and known `weight_per_unit` so list weight ≠ empty `—`. Prefer existing seed TR or create via **Create Transport Request** on a Submitted PR. |
| Port TR | At least one Port Consignment TR owned by Procurement Officer with ≥1 line item (create from Submitted Port Shipment if needed). |
| Wipe | Prefer remarks / RUN_ID `MCP-FB009TR-` only if creating new fixtures; do not wipe unrelated seed TRs. |

---

## A — Distribution Officer / Manager (FG TR list)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | DO TR list shows Total Weight (KG) header | As **Distribution Officer** (`distribution.officer1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`). Assert `#result_list` column headers include **Total Weight (KG)** (or exact post-fix label matching admin `short_description`). Assert headers do **not** include **Total Qty** or **Total Quantity**. | P0 | Pass |
| TC02 | DO TR list cell shows kg weight | Still as Distribution Officer on the same changelist, locate a TR row with line allocations. Assert the Total Weight cell shows a numeric value with unit **`kg`** (e.g. `1,250 kg`), not a bare item-count without unit, and not `—` when lines exist. Optionally spot-check: displayed kg ≈ Σ(`allocated_quantity` × `weight_per_unit`) for that TR’s lines (read from TR change form / PR lines if needed). | P0 | Pass |
| TC03 | DM TR list shows Total Weight (KG) | As **Distribution Manager** (`distribution.manager1.nourish@yopmail.com`), open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`). Assert **Total Weight (KG)** column present; **Total Qty** / **Total Quantity** absent; at least one row cell ends with `kg`. | P0 | Pass |

## B — Procurement Officer (Port Consignment TR list)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | PO Port TR list shows Total Weight (KG) | As **Procurement Officer** (`procurement.officer1.nourish@yopmail.com`), open **Procurement → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=PORT_CONSIGNMENT`). Assert changelist shows **Total Weight (KG)** and does not show **Total Qty** / **Total Quantity**; a Port TR with lines shows a `kg` value. | P0 | Pass |

## C — Scope guard (Transport Planner)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Planner TR queue unchanged by FB-009 | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), open **Transport → Transport requests** (`/admin/requisitions/transportrequisition/`). Assert planner columns remain planner-oriented (e.g. **Transport Orders** / **Create transport order** present as today). Do **not** require FB-011 **Remaining Weight** here — only confirm FB-009 does not regress planner list into a DO-style **Total Quantity** column. | P1 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-07 | **5/5** | Playwright MCP; RUN_ID `85258276`. Reassigned `TR-FG-20260717-0001` → DO, `TR-PORT-20260710-0002` → PO for list visibility. |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **changelist** columns for DO / DM / PO Transport Requests.
- Out of scope: TR **change form** / line-item weight columns (**FB-010**); Transport Planner **Remaining Weight** (**FB-011**); TO creation; REST API; Playwright script implementation (this file is the plan only).

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
| Planner TR queue | `/admin/requisitions/transportrequisition/` |
| Table | `#result_list` · header row `thead th` · cells under weight column |

### Known story ↔ code alignment (post-impl)

- `TransportRequisitionAdmin.total_weight_kg_display` sums `allocated_quantity × weight_per_unit` and renders `{format_qty(total_kg)} kg` with header **Total Weight (KG)**.
- `get_list_display` includes that column for DO, DM, and the default branch used by Procurement Officer; Transport Planner / tenant-admin branch omits it (uses TO links / Create TO).
- Stored model field `total_quantity` remains UOM allocation sum (change-form field; FB-010 covers details weight).
- Unit: `tests/unit/test_requisitions/test_fb009_tr_list_total_weight.py`.

### Suggested next step

Suite signed off. Optional: restore original `requested_by` on fixture TRs if ownership reassignment should not persist.
