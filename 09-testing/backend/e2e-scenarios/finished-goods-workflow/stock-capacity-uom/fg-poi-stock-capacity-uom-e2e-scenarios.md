---
module: 06-poi-operations
specification: POI Stock — Current Stock & Free Capacity accuracy across product UOM line items — Playwright E2E Scenario Plan
version: 1.2
phase: Phase 1
related_stories: STK-01 v3, FB-012, FB-018, LD-01-9
source_spec: ../../../../../05-modules/06-poi-operations/stock-operations-v3-loading-unload-trigger.md
last_updated: 2026-07-22
playwright_mcp: true
---

# POI Stock — Current Stock & Free Capacity by UOM Line Item — E2E Scenario Plan (Django Admin SSR)

**Purpose:** For **each product UOM** used on PR/TR/TO line items, prove that:

1. Operator enters quantity **in that product’s UOM** (bags, pieces, cartons, tons, kg, liters).
2. Stock mutation always converts to **MT** via Product master `weight_per_unit` (KG), never stores raw UOM as if it were MT.
3. **Current stock** and **Free capacity** stay in MT with `free = total − current`.

**Canonical conversion (all UOMs — same formula):**

```
stock_mt = qty_in_product_uom × weight_per_unit_kg ÷ 1000
```

| Product UOM | Operator enters (load/unload) | MDM `weight_per_unit` (KG) | Line → stock MT |
|-------------|-------------------------------|----------------------------|-----------------|
| **Bag** | **Actual bags** | product value (e.g. 50) | `bags × wpu ÷ 1000` |
| **Pieces** | **Actual pieces** | product value (e.g. 25) | `pieces × wpu ÷ 1000` |
| **Cartons** | **Actual cartons** | product value (e.g. 20) | `cartons × wpu ÷ 1000` |
| **Ton** | **Actual tons** (qty in tons) | **1000** (1 ton = 1000 KG) | `tons × 1000 ÷ 1000` = tons as MT |
| **KG** | **Actual KG** (qty in kilograms) | **1** | `kg × 1 ÷ 1000` |
| **Liters** | **Actual liters** | **1** (1 L ≈ 1 KG for stock) | `liters × 1 ÷ 1000` |

```
free_capacity_mt = storage_capacity_mt − current_stock_mt
operational_mt   = Σ (line stock_mt)   # one LoadEvent / UnloadEvent
```

Examples: `5.5` tons → **5.500** MT; `250` KG → **0.250** MT; `1500` liters → **1.500** MT.

**Runner:** Playwright MCP per [`../playwright-mcp-runbook.md`](../playwright-mcp-runbook.md).

**Surfaces:** POI list (`/admin/master_data/poi/`), POIStock (`/admin/operations/poistock/`), movement log (`/admin/operations/poistockmovementlog/`), PR stock panel, Loading/Unloading complete (`#ld-line-capture`).

---

## Fixture products (create once per `RUN_ID`)

As **Tenant Admin**, create FG products under **Master Data → Products** (SKU/name prefix `MCP-STK-<RUN_ID>-…`). Default FG seeder only ships Bag@50 — these are required for non-Bag cases.

| Tag | `unit_of_measure` | `weight_per_unit` (KG) | Example operator entry | Expected line MT |
|-----|-------------------|------------------------|------------------------|------------------|
| BAG-50 | Bag | 50 | bags = 200 | **10.000** (`200 × 50 ÷ 1000`) |
| PCS-25 | Pieces | 25 | pieces = 40 | **1.000** (`40 × 25 ÷ 1000`) |
| CTN-20 | Cartons | 20 | cartons = 100 | **2.000** (`100 × 20 ÷ 1000`) |
| TON | Ton | 1000 | tons = 5.5 | **5.500** (`5.5 × 1000 ÷ 1000`) |
| KG | KG | 1 | kg = 250 | **0.250** (`250 × 1 ÷ 1000`) |
| LTR | Liters | 1 | liters = 1500 | **1.500** (`1500 × 1 ÷ 1000`) |

For Ton / KG / Liters, set `weight_per_unit` to the MDM defaults above (admin auto-fill: ton→1000, kg→1, liters→1) even if the field is optional on the form.

Each UOM section below: one PR line with that product → TR → TO → yard through **Loading Completed** / **Unloading Completed**. Record source/dest `T`, `C_before`, `F_before` before the mutation.

---

## A — Capacity identity (UOM-independent baseline)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | POI list Total / Current / Free in MT | As **Tenant Admin** (`admin.nourish@yopmail.com`), open **Master Data → Points of Interest**. For `MCP-S-<RUN_ID>`, assert **Capacity (MT)**, **Current (MT)**, **Free Capacity (MT)** are MT numbers. Record `T`, `C`, `F`. Assert `F = T − C` (±0.001). | P0 | Planned |
| TC02 | POIStock admin matches list | Open `/admin/operations/poistock/` for same POI. Assert current/free match TC01; fields read-only. | P0 | Planned |
| TC03 | PR panel three fields only (FB-018) | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`) on **Add Product Requisition**, assert **Destination POI — Stock & Capacity** shows only **Total capacity**, **Current stock**, **Free capacity** (MT or `—`). No in-transit / projected fields. When capacity set: free = total − current. | P0 | Planned |

---

## B — Bag line item

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | PR Bag line shows UOM + weight autofill | As **Depot Officer** on Add PR, add line with product **BAG-50**. Assert read-only **Unit of measure** = Bag (or Bags), **Weight per unit** = 50, enter **Product quantity** = `200`, assert computed **Total weight** reflects `200 × 50` KG (or equivalent UI). Submit PR. | P0 | Planned |
| TC05 | Load form — Bag uses Actual bags only | TO at **Assigned Loading Point** with Bag line. As **Loading Personnel** (`loading.personnel1.nourish@yopmail.com`), open complete form. Assert `#ld-line-capture` line shows **Actual bags**; **Actual weight (MT)** absent. Expected column shows allocated qty in bags. | P0 | Planned |
| TC06 | Bag load — source current ↓ / free ↑ by converted MT | Record source `C_before`, `F_before`, `T`. Complete loading: **End datetime** + **Actual bags** = `200`. Expected `Δ = 10.000` MT. Assert **Loading Completed**; source **Current stock** = `C_before − 10.000`; **Free capacity** = `F_before + 10.000` = `T − new_current`. Log `LOADING_SOURCE_DEDUCTION` `quantity_mt = 10.000`. Assert stock did **not** drop by 200 (raw bags). | P0 | Planned |
| TC07 | Bag unload — dest current ↑ / free ↓ by same MT | After dest CC assign, record dest `C_before`, `F_before`, `T`. As **Unloading Personnel** (`unloading.personnel1.nourish@yopmail.com`), complete unload with **Actual bags** = `200`. Assert dest current = `C_before + 10.000`; free = `F_before − 10.000` = `T − new_current`. Log `UNLOADING_DESTINATION_ADDITION` `quantity_mt = 10.000`. | P0 | Planned |

---

## C — Pieces line item

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | PR Pieces line UOM autofill | Add PR line with **PCS-25**. Assert UOM **Pieces**, weight per unit **25**. Quantity `40` → total weight `40 × 25` KG. Submit. | P0 | Planned |
| TC09 | Load form — Actual pieces (not bags/weight) | Complete-loading form for Pieces line: label **Actual pieces**; no weight field. | P0 | Planned |
| TC10 | Pieces load — Δ = 40 × 25 / 1000 = 1.000 MT | Complete load with **Actual pieces** = `40`. Source current ↓ **1.000** MT; free ↑ **1.000** MT; free = total − current. Log `quantity_mt = 1.000`. Not ↓40. | P0 | Planned |
| TC11 | Pieces unload — dest +1.000 MT | Unload **Actual pieces** = `40`. Dest current ↑ 1.000; free ↓ 1.000; identity holds. | P0 | Planned |

---

## D — Cartons line item

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC12 | PR Cartons line UOM autofill | PR line **CTN-20**: UOM **Cartons**, weight per unit **20**. Qty `100` → `100 × 20` KG total weight. | P0 | Planned |
| TC13 | Load form — Actual cartons | Capture label **Actual cartons**; weight field absent. | P0 | Planned |
| TC14 | Cartons load — Δ = 100 × 20 / 1000 = 2.000 MT | Complete load **Actual cartons** = `100`. Source current ↓ **2.000**; free ↑ **2.000**; not ↓100. Log `quantity_mt = 2.000`. | P0 | Planned |
| TC15 | Cartons unload — dest +2.000 MT | Unload cartons `100`. Dest current ↑ 2.000; free ↓ 2.000; free = total − current. | P0 | Planned |

---

## E — Ton line item (enter tons → convert to MT)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC16 | PR Ton line — quantity in tons | PR line **TON**: UOM **Ton**/**Tons**; **Weight per unit** = 1000 KG (MDM default). Enter **Product quantity** = `5.5` (tons). Assert total weight KG = `5.5 × 1000`. Submit. | P0 | Planned |
| TC17 | Load form — capture in tons (not pre-converted MT) | Ton line complete form: quantity field labeled for **tons** (e.g. **Actual tons**). Bags/pieces/cartons absent. Operator enters tons, not a separate “already MT” value. | P0 | Planned |
| TC18 | Ton load — tons × 1000 ÷ 1000 → MT | Enter **Actual tons** = `5.5`. Expected `Δ = 5.5 × 1000 ÷ 1000 = 5.500` MT. Source current ↓ **5.500**; free ↑ **5.500**. Log `quantity_mt = 5.500`. | P0 | Planned |
| TC19 | Ton unload — dest +5.500 MT | Unload tons `5.5` → dest current ↑ 5.500; free ↓ 5.500; free = total − current. | P0 | Planned |

---

## F — KG line item (enter KG → convert to MT)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC20 | PR KG line — quantity in kilograms | PR line **KG**: UOM **KG**; **Weight per unit** = 1. Enter quantity `250` (kilograms). Assert total weight KG = `250 × 1`. Submit. | P0 | Planned |
| TC21 | Load form — capture in KG | Complete form label **Actual KG** (or equivalent). Operator enters kilograms. Bags field absent. | P0 | Planned |
| TC22 | KG load — kg × 1 ÷ 1000 → MT | Enter **Actual KG** = `250`. Expected `Δ = 250 × 1 ÷ 1000 = 0.250` MT. Source current ↓ **0.250**; free ↑ **0.250**. Log `quantity_mt = 0.250`. Fail if stock moves by **250** MT (treating KG as MT) or by **0.250** only when operator was told to enter MT. | P0 | Planned |
| TC23 | KG unload — dest +0.250 MT | Unload KG `250` → dest current ↑ 0.250; free ↓ 0.250; identity holds. | P0 | Planned |

---

## G — Liters line item (enter liters → convert to MT)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC24 | PR Liters line — quantity in liters | PR line **LTR**: UOM **Liters**; **Weight per unit** = 1. Enter quantity `1500` (liters). Submit. | P1 | Planned |
| TC25 | Load form — capture in liters | Complete form label **Actual liters**. No bag/piece field. | P1 | Planned |
| TC26 | Liters load — liters × 1 ÷ 1000 → MT | Enter **Actual liters** = `1500`. Expected `Δ = 1500 × 1 ÷ 1000 = 1.500` MT. Source current ↓ **1.500**; free ↑ **1.500**. Log `quantity_mt = 1.500`. Fail if stock moves by 1500 MT. | P1 | Planned |
| TC27 | Liters unload — dest +1.500 MT | Unload liters `1500` → dest current ↑ / free ↓ by 1.500; identity holds. | P1 | Planned |

---

## H — Mixed UOM line items on one TO

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC28 | PR with Bag + Ton + Pieces lines | As Depot Officer, one PR with three lines: BAG-50 qty 100, TON qty 3.25 (tons), PCS-25 qty 40. Assert each line keeps its own UOM / weight-per-unit (50 / 1000 / 25). Submit **Submitted**. | P0 | Planned |
| TC29 | Load form — per-line capture in product UOM | On one LoadEvent complete form, assert: Bag → **Actual bags**; Ton → **Actual tons**; Pieces → **Actual pieces**. | P0 | Planned |
| TC30 | Mixed load — stock = Σ (qty × wpu ÷ 1000) | Capture: bags `100` → `100×50÷1000=5.000`; tons `3.25` → `3.25×1000÷1000=3.250`; pieces `40` → `40×25÷1000=1.000`. Expected `Δ = 9.250` MT. Source current ↓ 9.250; free ↑ 9.250. Log `quantity_mt = 9.250`. Assert not ↓143 raw units. | P0 | Planned |
| TC31 | Mixed unload — dest Σ same MT | Unload same UOM quantities. Dest current ↑ 9.250; free ↓ 9.250; identity holds. | P0 | Planned |
| TC32 | Bag + Cartons only | Bags `50` → 2.500 MT + cartons `50` → 1.000 MT → Δ **3.500** MT. | P1 | Planned |
| TC33 | Ton + KG only | Tons `2` → `2×1000÷1000=2.000` MT + KG `500` → `500×1÷1000=0.500` MT → Δ **2.500** MT on load/unload. Fail if KG `500` is applied as 500 MT. | P1 | Planned |

---

## I — Guards & non-mutation (any UOM)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC34 | Missing line qty blocks complete (Bag) | Bag TO: try complete without **Actual bags**. Assert validation error (e.g. enter number of bags); stock/free unchanged. | P0 | Planned |
| TC35 | Missing tons qty blocks complete (Ton) | Ton TO: try complete without **Actual tons**. Assert error; stock/free unchanged. | P0 | Planned |
| TC36 | Scale-out does not change current/free | After Bag (or any) load, note current/free; complete **Scale Out** with arbitrary weights. Assert current/free unchanged; no new `SCALE_OUT_*` stock logs for this TO. | P0 | Planned |
| TC37 | PR/TR alone does not change capacity | Submit PR + create/approve TR for Bag (or mixed) lines. Dest/source **Current stock** / **Free capacity** unchanged vs pre-PR snapshot. | P1 | Planned |

---

## J — Cross-surface consistency after UOM mutation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC38 | Panels match POI list after Bag load | After TC06, refresh PR dest panel / TR source panel / POI list / POIStock. Assert same **Current stock** and **Free capacity** MT; free = total − current. | P0 | Planned |
| TC39 | Movement log previous/new for unit-count UOM | For a Pieces or Cartons deduction log: `previous_value_mt − quantity_mt = new_value_mt`. | P1 | Planned |
| TC40 | Movement log previous/new for weight UOM | For Ton/KG addition at dest: `previous_value_mt + quantity_mt = new_value_mt`. | P1 | Planned |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- **In scope:** Per-UOM line item (Bag, Pieces, Cartons, Ton, KG, Liters) — PR autofill, load/unload capture labels, MT stock deltas, free-capacity identity, mixed-line rollup, scale-out non-mutation.
- **Out of scope:** In-transit UI fields (FB-018 hidden), RM QC gate, REST API, multi-bay rollup.

### Runbook dependency

Mutations only at §10 **Loading Completed** and §16 **Unloading Completed**.

| Mode | Cases | Approach |
|------|-------|----------|
| **A — Baseline** | TC01–TC03 | After `make seed-mcp-fg RUN_ID=…` |
| **B — One UOM full path** | e.g. TC04–TC07 (Bag) | FG chain §1–16 with Bag product (seeder OK) |
| **C — UOM matrix** | TC08–TC27 | One mini-chain per product tag (or parallel RUN_ID suffixes) |
| **D — Mixed lines** | TC28–TC33 | Single TO with multi-UOM lines |

Artifacts: `tests/e2e/playwright-mcp/stock-capacity-uom-artifacts/` (`RESULTS.md`, `state.json`, `TC##-failure.png`).

### Roles

| Role | Email | Password |
|------|-------|----------|
| Tenant Admin | `admin.nourish@yopmail.com` | `NourishAdmin@1234!` |
| Depot Officer | `depot.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| Loading Personnel | `loading.personnel1.nourish@yopmail.com` | `Nourish@1234!` |
| Unloading Personnel | `unloading.personnel1.nourish@yopmail.com` | `Nourish@1234!` |

Tenant: `http://nourish.dev.dfms.local:8000` — OTP off — wipe via `make wipe-mcp-fg RUN_ID=…`.

### Selectors

| Target | Hint |
|--------|------|
| Stock panel | `[data-k="storage_capacity_mt"]`, `[data-k="current_stock_mt"]`, `[data-k="free_capacity_mt"]` |
| Line capture | `#ld-line-capture` — per-row quantity label + input |
| Movement log | `admin:operations_poistockmovementlog_changelist` — search TO number |

### Assertion rules

1. Tolerance **0.001 MT**.
2. Always re-check `free ≈ total − current` when total is not `—`.
3. Operator entry is always in **product UOM**; stock delta must equal `qty × weight_per_unit_kg ÷ 1000`.
4. Fail if KG/Liters/Ton quantity is applied to `current_stock_mt` without conversion (e.g. enter `250` KG → stock must move **0.250** MT, not 250).
5. Stop on OTP; tag remarks `MCP STK <RUN_ID>`.

### Known implementation drift (assert expected conversion; treat as FAIL if still broken)

Current code/UI (`uom_capture.py` labels + `conversion.line_capture_to_stock_mt` for `WEIGHT_UOMS`) labels the field **Actual weight (MT)** and returns the entered value **as MT with no `÷ 1000`**. That mismatches this plan:

| UOM | This plan expects | Current code likely does |
|-----|-------------------|--------------------------|
| Ton | enter tons → `× 1000 ÷ 1000` | treat entry as MT (happens to match when 1 ton = 1 MT) |
| KG | enter kg → `× 1 ÷ 1000` | treat entry as MT (**wrong** if operator enters kg) |
| Liters | enter liters → `× 1 ÷ 1000` | treat entry as MT (**wrong** if operator enters liters) |

MDM already documents defaults Ton=1000 / KG=1 / Liters=1 KG (`Product.weight_per_unit` help text). Conversion for weight UOMs should reuse the same `qty × wpu ÷ 1000` path as Bag/Pieces/Cartons.

- Product master UOM values: `Bag`, `Pieces`, `Cartons`, `Ton`, `KG`, `Liters`; PR may show `Bags`/`Tons`.
- Section 10/16 plans only smoke ↓/↑; **this plan owns per-UOM numeric accuracy**.

### Suggested MCP prompt

> Create MCP-STK products for Bag/Pieces/Cartons/Ton/KG. Seed FG sandbox. Run TC01–TC03, then Bag path TC04–TC07, then Pieces TC08–TC11. Write `tests/e2e/playwright-mcp/stock-capacity-uom-artifacts/RESULTS.md`; screenshot failures as `TC##-failure.png`.
