---
module: sprint-8
specification: FB-014 — My Trips details Cargo table shows Allocated Weight with Allocated Quantity (MT / kg) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-014, DM-01
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/06-driver-mobile.md
implementation_reference:
  - ../../../../../apps/transport/admin_driver.py (DriverTransportOrderAdmin.product_summary / product_summary_display)
  - ../../../../../apps/transport/services.py (TOLineAllocationService.line_total_kg)
  - ../../../../../apps/core/portal_navigation.py (Trips › My Trips)
last_updated: 2026-08-07
playwright_mcp: true
---

# Sprint 8 — FB-014 — My Trips Cargo Allocated Weight — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-014](../../../../03-backlog/sprints/sprint-8/improvements/06-driver-mobile.md#fb-014--my-trips-details--cargo-table-shall-show-allocated-weight-with-allocated-quantity)

**Sibling:** [FG driver My Trips / trip start](../finished-goods-workflow/06-trip-start/fg-driver-my-trips-e2e-scenarios.md) (lifecycle only; no cargo weight AC).

**AC (assert after fix):**

1. On **My Trips** detail (**Cargo** / **Product / quantity**), the cargo table SHALL show **Allocated Quantity** and **Allocated Weight**.
2. **Allocated Weight** cell format SHALL be `{mt} MT ({kg} kg)` (same style as create-from-tr **Total Weight** / **Allocating TO Load**), e.g. `0.025 MT (24.999 kg)`.
3. Per-line kg = `allocated_quantity × weight_per_unit` via `TOLineAllocationService.line_total_kg`; mt = kg ÷ 1000.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Display decision:** Story FB-014-2 says “labelled (KG)”; product direction for this improvement is dual **`x MT (y kg)`**, not kg-only (unlike FB-009/010 list/detail).

> **Naming:** This plan is improvements **FB-014** (driver My Trips). Distinct from [`fb-014-product-bulk-remove-amount-column-e2e-scenarios.md`](./fb-014-product-bulk-remove-amount-column-e2e-scenarios.md) (improvements **FB-006**).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Driver** `driver1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` (`driver_1`) |
| Fixture TO | At least one **My Trips** TO assigned to `driver1` with ≥1 TO line item and known `weight_per_unit` (prefer FG bag line so qty × wpu → non-trivial kg). Open any assigned trip from the list if seed ownership already set. |
| Multi-line (TC03) | Prefer a TO with ≥2 line items when available; otherwise Skip TC03 with note. |
| Wipe | Prefer existing assigned seed TOs; do not wipe unrelated trips. If creating fixtures, remarks / RUN_ID prefix `MCP-FB014MT-`. |

---

## A — Cargo columns & format (Driver)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Cargo table shows Allocated Quantity and Allocated Weight | As **Driver** (`driver1.nourish@yopmail.com`), log in at `/admin/login/`. Open **Trips → My Trips** (`/admin/transport/drivertransportorder/?assigned_driver=me`). Open a trip change form with line items (`/admin/transport/drivertransportorder/<uuid>/change/`). In the **Cargo** fieldset, locate the cargo listing table under **Product / quantity**. Assert column headers include **Allocated quantity** (or **Allocated Quantity**) and **Allocated Weight**. Assert at least one data row shows a numeric allocated quantity (unchanged behaviour). | P0 | Planned |
| TC02 | Allocated Weight uses x MT (y kg) format | Still on the same My Trips detail, for a line with known `weight_per_unit`, assert the **Allocated Weight** cell matches `{format_qty(mt)} MT ({format_qty(kg)} kg)` where `kg = allocated_quantity × weight_per_unit` and `mt = kg / 1000` (e.g. `1` bag × `24.999` → `0.025 MT (24.999 kg)`). Assert the cell is not empty / not only `—` when quantity and wpu yield positive kg. Assert units appear as **`MT`** and **`kg`** in that dual form (not kg-only like FB-009). | P0 | Planned |
| TC03 | Multi-line cargo — each row has weight | As Driver on a multi-line assigned TO (if available), assert each visible cargo row has an **Allocated Weight** cell in `{mt} MT ({kg} kg)` form (or `—` only when that line’s computed kg is zero). | P1 | Planned |

## B — Quantity preserved

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Allocated Quantity still shown alongside weight | Still as Driver on a TO with lines, assert **Allocated Quantity** remains visible in the same cargo table as **Allocated Weight** — FB-014 adds weight; it does not remove quantity. | P0 | Planned |

## C — Access smoke

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Driver reaches My Trips detail Cargo | As Driver, from **My Trips** changelist click into an assigned TO and assert `#content-main` shows the **Cargo** section with the product/quantity table (smoke that the surface under test is the admin My Trips detail used by drivers). | P1 | Planned |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Not run yet. |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR **My Trips** (`DriverTransportOrder`) change form **Cargo** table columns and weight display format.
- Out of scope: Driver mobile REST/`driver_presenter` cargo JSON; Transport Planner create-from-tr; TR list/detail weight (FB-009/010/011); trip lifecycle transitions; Playwright script implementation (this file is the plan only).

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
| My Trips changelist | `/admin/transport/drivertransportorder/?assigned_driver=me` · `admin:transport_drivertransportorder_changelist` |
| My Trips detail | `/admin/transport/drivertransportorder/<uuid>/change/` · `admin:transport_drivertransportorder_change` |
| Cargo table | `#content-main` · fieldset **Cargo** · readonly **Product / quantity** · `table.listing` with `thead th` / row `td.num` |
| Tab filter (optional) | `?tls_status_tab=awaiting_dispatch` / `in_progress` / `completed` |

### Known story ↔ code alignment (post-impl)

- `DriverTransportOrderAdmin.product_summary` table columns: **Product**, **Pack Size**, **UOM**, **Allocated quantity**, **Allocated Weight**.
- Weight: `TOLineAllocationService.line_total_kg` → `_format_allocated_weight_mt_kg` → `{mt} MT ({kg} kg)`.
- Unit: `tests/unit/test_transport/test_fb014_my_trips_cargo_allocated_weight.py`.

### Suggested next step

Run this plan via Playwright MCP (`playwright-mcp-admin` / `run-playwright-mcp-scenarios`).
