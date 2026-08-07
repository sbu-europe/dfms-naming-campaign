---
module: sprint-8
specification: FB-015 — TO Creation Allocating TO Load live sum in MT (kg) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-015, TO-01, FB-012
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md
implementation_reference:
  - ../../../../../templates/admin/transport/transportorder/create_from_tr.html (Allocate Quantities per Product; Allocating TO Load)
  - ../../../../../apps/transport/admin.py (TransportOrderAdmin.create_from_tr_view)
last_updated: 2026-08-07
playwright_mcp: true
---

# Sprint 8 — FB-015 — TO Creation Allocating TO Load — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-015](../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md#fb-015--to-creation--allocating-to-load-live-sum-in-mt-kg)

**Sibling:** [FB-012 Remaining Quantity](./fb-012-to-creation-remaining-quantity-e2e-scenarios.md) (same create-from-tr page).

**AC (assert after fix):**

1. Create-from-tr **Allocate Quantities per Product** SHALL show **Allocating TO Load**.
2. Load = Σ(allocate qty × weight_per_unit) × **Number of TOs**, displayed as `{mt} MT ({kg} kg)` (same style as TR **Total Weight**).
3. Value updates live when allocate inputs or **Number of TOs** change; **`—`** when combined load is zero.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Decision:** Batch total (**× Number of TOs**), not per-TO only.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Transport Planner** `transport.planner1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Creatable TR | Prefer `TR-FG-20260624-0002` (single line, known wpu ≈ 24.999) and/or `TR-FG-20260717-0001` (two lines) |
| Wipe | Do not submit TOs unless a TC requires it; prefer display-only checks |

---

## A — Presence & empty state

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Allocating TO Load label present | As **Transport Planner**, open create-from-tr for a creatable TR. Assert **Allocate Quantities per Product** section shows label **Allocating TO Load** (near allocate table footer / below table). | P0 | Planned |
| TC02 | Zero allocate shows em dash | Still on create-from-tr with **Number of TOs** = `1` and all **Allocate for This TO** = `0`. Assert Allocating TO Load value is **`—`** (not `0 MT (0 kg)`). | P0 | Planned |

## B — Live sum (single TO)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Single line allocate → MT (kg) | On create-from-tr for a single-line TR (e.g. `TR-FG-20260624-0002`), note kg/unit from the allocate quiet line. Enter allocate qty `1` (**Number of TOs** = `1`). Assert Allocating TO Load ≈ `0.025 MT (24.999 kg)` (or `format_qty(wpu/1000) MT (format_qty(wpu) kg)`). | P0 | Planned |
| TC04 | Multi-line sum | On create-from-tr for a multi-line TR (e.g. `TR-FG-20260717-0001`), enter positive allocate qty on ≥2 lines. Assert load kg ≈ Σ(qtyᵢ × wpuᵢ) and display matches `{mt} MT ({kg} kg)`. | P0 | Planned |
| TC05 | Clear allocate restores em dash | After TC03 (or similar), set allocate back to `0`. Assert Allocating TO Load returns to **`—`**. | P1 | Planned |

## C — × Number of TOs (batch total)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Number of TOs doubles load | On create-from-tr, set allocate so single-TO load is known (e.g. `1` bag → ~24.999 kg). Set **Number of TOs** to `2`. Assert Allocating TO Load ≈ **2×** that kg (e.g. `0.050 MT (49.998 kg)`), not the per-TO-only value. | P0 | Planned |
| TC07 | Changing TO count updates without retyping allocate | With allocate qty held constant and **Number of TOs** changed from `2` → `1`, assert load halves back to the single-TO value (live update on to_count alone). | P1 | Planned |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Not run yet (impl pending). |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: create-from-tr **Allocating TO Load** presence, format, live updates, **× Number of TOs** batch math.
- Out of scope: Remaining Quantity (**FB-012**); TO details PR lines (**FB-013**); REST API.

### Admin URLs & selectors

| Item | Value |
|------|--------|
| Create TO from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| Allocate inputs | `.to-alloc-input` |
| Number of TOs | `#id_to_count` |
| Load display | Label **Allocating TO Load** · value node (impl: e.g. `#allocating-to-load-value`) |

### Known decisions (pre-impl)

- Formula: `kg = Σ(qty × wpu) × to_count`; `mt = kg / 1000`.
- Format: `{format_qty(mt)} MT ({format_qty(kg)} kg)` — match TR Total Weight.
- Empty: **`—`** when kg ≈ 0.

### Suggested next step

Implement Allocating TO Load on `create_from_tr.html`, then run this plan via Playwright MCP.
