---
module: testing-plan
specification: Playwright MCP — Finished Goods Isolated Fixture Seed & Wipe
version: 1.1
phase: Phase 1
last_updated: 2026-07-20
changelog: "v1.1 — Explicit seeded-data catalog (fields + default values). v1.0 — Initial plan for session-scoped MCP FG sandbox (seed + wipe)."
related_stories: PR-01, TO-02, YARD-01, DS-01
related_testing: ../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md
credentials: ../../../docs/testing/playwright-mcp-credentials.yaml
human_guide: ../../../docs/guides/playwright-mcp-admin.md
---

# Playwright MCP — Finished Goods Isolated Fixture Seed & Wipe

## Overview

This document is the **backend implementation plan** for a **session-scoped Finished Goods (FG) fixture sandbox** used by Playwright MCP against the [FG workflow runbook](../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md).

**Problem:** Local Nourish DBs accumulate residue (shared POIs, contended drivers/vehicles, drifted stock, incomplete `UserOperationalPOI`). FG MCP runs that bind to `CTG-001` / leftover fleet are flaky and non-reproducible. `scripts/seed-data.py` only seeds **identity/RBAC** (tenants, role users, two drivers) — not FG master/ops eligibility.

**Solution:**

1. Add a **separate** script (same pattern as `scripts/seed-vendor-dev-fixtures.py`) that creates a **closed MCP-owned graph** for one `RUN_ID`.
2. Playwright MCP exercises admin SSR on that graph only (source ≠ destination MCP POIs).
3. After the suite (or on failure), **wipe** only session-owned rows via a manifest — never seed login users and never “whatever looks old.”

**Primary paths:** `scripts/seed-mcp-playwright-fg.py`, Makefile targets, manifest under `tests/e2e/playwright-mcp/`  
**Cross-module models:** `apps/master_data` (POI, Product, Vehicle, LUP), `apps/users` (Driver, UserOperationalPOI), `apps/operations/stock` (POIStock), ops chain under `apps/requisitions` / `apps/transport` / `apps/operations/*` (wipe only)

---

## 0. Scope boundary

| In scope | Out of scope |
|----------|--------------|
| Session fixture **ensure** (Layer 1): MCP POIs, FG products, stock, LUPs, vehicle, MCP driver, UOP binds for YAML actors | Expanding `scripts/seed-data.py` with FG master data |
| Manifest write/read (`fg-mcp-<RUN_ID>.json` + optional `fg-chain-state.json` merge) | Using `CTG-001` / `CTG-002` / `FG-F-01` / shared fleet as the MCP chain sites |
| Manifest-driven **wipe** (Layer 1 assets + UI-created PR/TR/TO/yard for that `RUN_ID`) | Mass tenant wipe; deleting `*.nourish@yopmail.com` seed logins |
| Makefile `seed-mcp-fg` / `wipe-mcp-fg` | Staging/prod seeding |
| Runbook + credentials YAML notes for MCP POI codes | Rewriting all 158 scenario TCs in one pass (scenarios consume manifest; CTG examples become illustrative only) |
| Optional Layer 2 `--bootstrap-to=<status>` (domain services) for yard-only resume | Default pre-creation of full PR→Closed path (UI owns §§1–6 happy path) |
| Wiring wipe skill to prefer this script | Mobile driver app / vendor fleet / port consignments |

### Locked decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Isolation | **Do not engage** existing tenant master/ops data for the MCP FG chain | Reproducible; wipe does not fight shared stock/fleet |
| Source / dest POIs | Create `MCP-S-<RUN_ID>` and `MCP-D-<RUN_ID>` (`poi_code` ≤ 20) | Closed graph; source ≠ dest |
| Login actors | Keep YAML / `seed-data.py` role emails (`*.nourish@yopmail.com`) | Credentials registry stays source of truth |
| UOP | Session **binds** those actors onto MCP POIs; wipe removes **only** seeder-created UOP PKs | Yard queues fail-closed without UOP; don’t permanently steal CTG assignments |
| Trip driver (§6) | Session MCP driver `mcp.drv.<run_id>@example.com` (not dirty `driver1@…`) | Availability + wipe-safe; `Driver.user` PROTECT handled in wipe order |
| Products | MCP FG SKUs (`MCP-FG-<RUN_ID>-1` / `-2`), not `FG-F-01` | Wipe-safe; no shared catalogue contention |
| PR/TR/TO | **Not** created by default ensure | Admin SSR fidelity for §§1–6 |
| Stock | `POIStock` is **POI-level MT** (not per SKU) — set enough MT on source; leave free capacity on dest | Matches `apps/operations/stock/models.py` |
| Script home | `scripts/seed-mcp-playwright-fg.py` — **not** inside `seed-data.py` | Same separation as vendor dev fixtures |

---

## 1. Current vs expected

| Aspect | Current | Expected |
|--------|---------|----------|
| FG MCP prerequisites | Docs assume `CTG-001`/`CTG-002`, products, UOP, free fleet — **not** created by `make seed` | `make seed-mcp-fg RUN_ID=…` creates a private sandbox |
| Driver for My Trips | YAML `driver1.nourish@…` often missing / contended | Manifest MCP driver email for §6 (or document bind of seed driver only if ensure creates it under MCP email) |
| Yard eligibility | Partial / legacy UOP on mixed emails | Dual-POI UOP on MCP-S / MCP-D for gateman, scaling, CC, loading, unloading; depot/feed-mill primary on dest (or as TC requires) |
| After run | Ad-hoc wipe skill heuristics | `make wipe-mcp-fg RUN_ID=…` deletes manifest graph + tagged ops chain |
| Dirty DB | Affects pass/fail | Irrelevant to MCP FG chain |

---

## 2. Naming contract

| Field | Pattern | Example (`RUN_ID=989F50AE`) |
|-------|---------|------------------------------|
| Run ID | 8 uppercase hex | `989F50AE` |
| Source POI code | `MCP-S-<RUN_ID>` | `MCP-S-989F50AE` |
| Dest POI code | `MCP-D-<RUN_ID>` | `MCP-D-989F50AE` |
| POI display name | `MCP <Role> <RUN_ID>` | `MCP Source 989F50AE` |
| Product SKU / item | `MCP-FG-<RUN_ID>-n` | `MCP-FG-989F50AE-1` |
| Product name | `MCP FG <RUN_ID> n` | unique per tenant |
| Category (if created) | `MCP-CAT-FG-<RUN_ID>` (trim to model limits) | wipe with products |
| Vehicle registration | `MCP-V-<RUN_ID>` | ≤ 20 chars |
| Driver email | `mcp.drv.<run_id_lower>@example.com` | never `@yopmail.com` |
| Driver license / contact | unique `MCP-DL-<RUN_ID>`, `+88017…` derived from RUN_ID | avoid collisions |
| LUP short_code | `MCP-L1` / `MCP-U1` (unique per POI) | |
| Free-text on PR/TR/TO | `MCP PR <RUN_ID>`, `MCP TR <RUN_ID>`, `MCP TO <RUN_ID>` | wipe / search |
| Manifest | `tests/e2e/playwright-mcp/fg-mcp-<RUN_ID>.json` | |

**Never** use wipe prefixes on seed login emails. **Never** delete codes outside the manifest / `MCP-` contract for this script.

---

## 3. Data to seed (Layer 1 — ensure)

Examples below use **`RUN_ID=989F50AE`**. Substitute the real session id everywhere `<RUN_ID>` / `<run_id>` appears. All of this is **created by** `seed-mcp-playwright-fg`; none of it may come from leftover `CTG-*` / `FG-F-*` / shared fleet.

### 3.0 Inventory (what gets seeded)

| # | Model | Count | Wipe? |
|---|-------|------:|-------|
| 1 | `POI` (source + dest) | 2 | Yes |
| 2 | `ProductCategory` | 1 | Yes (if unused after product delete) |
| 3 | `Product` (FG) | 2 | Yes |
| 4 | `POIStock` | 2 (one per MCP POI) | Cascades with POI |
| 5 | `LoadingUnloadingPoint` | 2 (LOAD @ source, UNLOAD @ dest) | Yes |
| 6 | `Vehicle` | 1 | Yes |
| 7 | `User` + `UserRole` + `Driver` (MCP trip driver) | 1 | Yes (`mcp.drv.*@example.com` only) |
| 8 | `UserOperationalPOI` | ~10–12 binds | Yes (manifest PKs only) |

**Not seeded by this script** (reuse `make seed` / YAML only):

| Item | Why |
|------|-----|
| Tenant `nourish`, platform | Already from `seed-data.py` |
| Role users (`depot.officer1.nourish@…`, DO, DM, TP, DS, gateman, …) | Login identities from credentials YAML |
| Passwords / RBAC roles | `seed_dfms_rbac` + `seed-data.py` |
| `CTG-001`, `FG-F-01`, existing vehicles | Explicitly out of band — do not reference |
| PR / TR / TO / yard visits | Created by Playwright UI (Layer 1 default) |

```mermaid
flowchart TB
  subgraph identities [Reuse from make seed]
    Roles[YAML role users *.nourish@yopmail.com]
  end
  subgraph sandbox [Owned by seed-mcp-playwright-fg]
    Src[MCP-S-RUN_ID]
    Dst[MCP-D-RUN_ID]
    Cat[MCP FG category]
    Prod[MCP-FG products x2]
    StockS[POIStock source]
    StockD[POIStock dest]
    LUP_L[LOAD LUP]
    LUP_U[UNLOAD LUP]
    Veh[MCP-V vehicle]
    Drv[mcp.drv driver]
    UOP[UserOperationalPOI binds]
  end
  Roles --> UOP
  UOP --> Src
  UOP --> Dst
  Cat --> Prod
  Src --> StockS
  Dst --> StockD
  Src --> LUP_L
  Dst --> LUP_U
  Src --> Veh
```

### 3.1 POIs (2 rows)

| Field | Source POI | Dest POI |
|-------|------------|----------|
| `poi_code` | `MCP-S-989F50AE` | `MCP-D-989F50AE` |
| `name` | `MCP Source 989F50AE` | `MCP Dest 989F50AE` |
| `poi_type` | `depot` | `depot` |
| `classification_type` | `neutral` | `neutral` |
| `address` | `MCP fixture source` | `MCP fixture dest` |
| `city` | `Chattogram` | `Chattogram` |
| `country` | `Bangladesh` | `Bangladesh` |
| `latitude` | `22.3569000` | `22.3700000` |
| `longitude` | `91.7832000` | `91.8000000` |
| `geofence_radius_meters` | `200` | `200` |
| `storage_capacity_mt` | `5000.00` | `5000.00` |
| `capacity_threshold_pct` | `80` | `80` |
| `number_of_gates` | `1` | `1` |
| `number_of_scales` | `1` | `1` |
| `is_active` | `True` | `True` |
| `contact_person` | `MCP Source Contact` | `MCP Dest Contact` |
| `contact_phone` | `+8801710000001` | `+8801710000002` |

`poi_code` max length **20** — pattern `MCP-S-<8 hex>` / `MCP-D-<8 hex>` is required.

### 3.2 Product category (1 row)

| Field | Value |
|-------|-------|
| `category_name` | `MCP FG Cat 989F50AE` |
| `product_type` | `FinishedGoods` |
| (other required category fields) | defaults / minimal valid per model |

Optional: skip `ProductSubCategory` unless forms require it (default **no** subcategory).

### 3.3 Products (2 FG rows)

| Field | Product 1 | Product 2 |
|-------|-----------|-----------|
| `product_sku_code` | `MCP-FG-989F50AE-1` | `MCP-FG-989F50AE-2` |
| `product_item_code` | `MCP-FG-989F50AE-1` | `MCP-FG-989F50AE-2` |
| `product_name` | `MCP FG 989F50AE 1` | `MCP FG 989F50AE 2` |
| `product_type` | `FinishedGoods` | `FinishedGoods` |
| `category` | FK → §3.2 | FK → §3.2 |
| `sub_category` | `null` | `null` |
| `unit_of_measure` | `Bag` | `Bag` |
| `weight_per_unit` | `50.000` (KG) | `50.000` (KG) |
| `requires_qc` | `False` | `False` |
| `is_active` | `True` | `True` |
| `preferred_vehicle_body_type` | blank or match vehicle body | same |
| `description` | `MCP FG fixture` | `MCP FG fixture` |

Used on PR line items during MCP (UI selects these SKUs — not `FG-F-01`).

### 3.4 Stock (2 `POIStock` rows)

`POIStock` is **one aggregate MT per POI** (not per product).

| Field | Source (`MCP-S-…`) | Dest (`MCP-D-…`) |
|-------|--------------------|------------------|
| `poi` | source POI | dest POI |
| `current_stock_mt` | `1000.000` | `100.000` |
| `in_transit_outgoing_mt` | `0` | `0` |
| `in_transit_incoming_mt` | `0` | `0` |

Rationale: source has enough mass for loading deductions; dest has free capacity (`5000 − 100`) for unloading additions. Record before/after in manifest `stock_snapshot`.

### 3.5 Loading / unloading points (2 LUPs)

| Field | Source LOAD | Dest UNLOAD |
|-------|-------------|-------------|
| `poi` | source | dest |
| `name` | `MCP Load Bay 989F50AE` | `MCP Unload Bay 989F50AE` |
| `short_code` | `MCP-L1` | `MCP-U1` |
| `operation_type` | `LOAD` | `UNLOAD` |
| `is_active` | `True` | `True` |
| `notes` | `MCP fixture` | `MCP fixture` |
| `created_by` | `admin.nourish@…` (or any staff user) | same |

Unique on `(poi, short_code)`.

### 3.6 Vehicle (1 row)

| Field | Value |
|-------|-------|
| `registration_number` | `MCP-V-989F50AE` |
| `vehicle_type` | `covered_truck` (or `primemover` if own-fleet picker requires it) |
| `body_type` | match FG preferred body if set; else blank/default allowed |
| `capacity` | `20.000` |
| `capacity_unit` | `MT` (or model enum in use) |
| `operational_status` | `no_active_to` |
| `is_active` | `True` |
| `assigned_poi` | source POI |
| `assigned_driver` | MCP driver (§3.7) optional at ensure time |
| `remarks` | `MCP vehicle 989F50AE` |
| `chassis_number` | `MCP-CH-989F50AE` (unique if set) |

No brand FK required unless validation demands it — create `Brand(brand_name="MCP Brand 989F50AE")` only if needed.

### 3.7 MCP driver (1 User + Driver)

**Do not** use `driver1@yopmail.com` / `driver1.nourish@…` for the chain vehicle.

| Layer | Field | Value |
|-------|-------|-------|
| User | `email` | `mcp.drv.989f50ae@example.com` |
| User | `password` | `Nourish@1234!` |
| User | `first_name` / `last_name` | `MCP` / `Driver989F50AE` |
| User | `employee_id` | `MCP-DRV-989F50AE` |
| User | `is_staff` / `is_active` / `is_email_verified` | `True` |
| UserRole | `role` | public `driver` |
| Driver | `driver_type` | `own` |
| Driver | `contact_number` | unique E.164 e.g. `+8801798950AE` → use digits-only unique: `+8801798950150` derived from RUN_ID |
| Driver | `driving_license_number` | `MCP-DL-989F50AE` |
| Driver | `license_type` | `Heavy` |
| Driver | `license_expiry_date` | `2027-12-31` |
| Driver | `current_state` | `available` |
| Driver | `is_active` | `True` |

§6 My Trips logs in as this email (document in runbook / manifest), not the YAML seed driver.

### 3.8 `UserOperationalPOI` binds (session)

Bind existing **YAML** role users onto MCP POIs. Create rows; store PKs in `uop_ids`.

| # | User email (domain `yopmail.com`) | Role code | POI | `is_primary` |
|---|-----------------------------------|-----------|-----|--------------|
| 1 | `depot.officer1.nourish@…` | `depot_officer` | **dest** `MCP-D-…` | `True` |
| 2 | `feed.mill.officer1.nourish@…` | `feed_mill_officer` | **dest** `MCP-D-…` | `True` (optional; include for TC14) |
| 3 | `gateman1.nourish@…` | `gateman` | source `MCP-S-…` | `True` |
| 4 | `gateman1.nourish@…` | `gateman` | dest `MCP-D-…` | `False` (or second primary per POI rules) |
| 5 | `scaling.operator1.nourish@…` | `scaling_operator` | source | `True` |
| 6 | `scaling.operator1.nourish@…` | `scaling_operator` | dest | `False` |
| 7 | `command.center.officer1.nourish@…` | `command_center_officer` | source | `True` |
| 8 | `command.center.officer1.nourish@…` | `command_center_officer` | dest | `False` |
| 9 | `loading.personnel1.nourish@…` | `loading_personnel` | **source only** | `True` |
| 10 | `unloading.personnel1.nourish@…` | `unloading_personnel` | **dest only** | `True` |

**Not bound by this seeder:** `distribution.officer1`, `distribution.manager1`, `transport.planner1`, `driver.supervisor1` (global ops; no yard POI required).

Leave any pre-existing CTG UOP rows on those users untouched. Wipe removes **only** the PKs listed in the manifest.

Working site in admin: choose **`MCP Source …` / `MCP Dest …`**, never `ctg-depot`.

### 3.9 Idempotency

`get_or_create` / update-in-place by natural keys (`poi_code`, SKU, registration, driver email, `(user, poi, role)`). Re-running ensure for the same `RUN_ID` must not duplicate rows; may refresh stock to defaults in §3.4.

### 3.10 Layer 2 — optional bootstrap (default **off**)

Flag: `--bootstrap-to=<status>` (e.g. `assigned`, `ready_for_dispatch`, `driving_towards_source`).

Creates PR → TR → TO via **domain services** on the MCP graph only (products/POIs/vehicle/driver from §3.1–3.7). Persist numbers in manifest `ops_chain`. Use for Mode C / isolated §§7–18 — **not** default Mode A/B.

---

## 4. Manifest schema

Path: `tests/e2e/playwright-mcp/fg-mcp-<RUN_ID>.json`

```json
{
  "run_id": "989F50AE",
  "schema": "nourish",
  "created_at": "ISO-8601",
  "source_poi": { "id": "…", "poi_code": "MCP-S-989F50AE" },
  "dest_poi": { "id": "…", "poi_code": "MCP-D-989F50AE" },
  "products": [{ "id": "…", "sku": "MCP-FG-989F50AE-1" }],
  "vehicle": { "id": "…", "registration_number": "MCP-V-989F50AE" },
  "driver": { "id": "…", "email": "mcp.drv.989f50ae@example.com" },
  "lups": [{ "id": "…", "short_code": "MCP-L1", "poi_code": "MCP-S-989F50AE" }],
  "uop_ids": ["…"],
  "stock_snapshot": {
    "MCP-S-989F50AE": { "current_stock_mt": "0", "after_ensure_mt": "1000" },
    "MCP-D-989F50AE": { "current_stock_mt": "0", "after_ensure_mt": "100" }
  },
  "ops_chain": {
    "pr_number": null,
    "tr_number": null,
    "to_number": null,
    "remarks_tag": "MCP … 989F50AE"
  }
}
```

After each MCP suite stage, runners **update** `ops_chain` (and may mirror into `fg-chain-state.json` per runbook).

---

## 5. Wipe (Layer 1 + ops chain)

### 5.1 CLI

```bash
# Ensure
python scripts/seed-mcp-playwright-fg.py --run-id 989F50AE
# optional: --source-code / --dest-code overrides (still MCP-prefixed)

# Wipe (require explicit RUN_ID)
python scripts/seed-mcp-playwright-fg.py --wipe --run-id 989F50AE
python scripts/seed-mcp-playwright-fg.py --wipe --run-id 989F50AE --dry-run
```

Makefile (mirror `seed-vendor-dev`):

```make
seed-mcp-fg: ## Seed isolated MCP FG sandbox (RUN_ID=required)
	$(DC_LOCAL) exec -w /app -e PYTHONPATH=/app web \
	  python scripts/seed-mcp-playwright-fg.py --run-id $(RUN_ID)

wipe-mcp-fg: ## Wipe MCP FG sandbox + ops chain for RUN_ID
	$(DC_LOCAL) exec -w /app -e PYTHONPATH=/app web \
	  python scripts/seed-mcp-playwright-fg.py --wipe --run-id $(RUN_ID)
```

### 5.2 Delete order

1. Resolve TO/TR/PR from manifest `ops_chain` and/or remarks/`RUN_ID` search.  
2. Yard children → weighing/gate/CC/load/unload tied to those TOs.  
3. TO → TR → PR (lines, approvals, activity logs).  
4. Seeder `UserOperationalPOI` by `uop_ids`.  
5. MCP LUPs → Vehicle (respect soft-delete) → Driver → User (`mcp.drv.…` only).  
6. MCP Products → MCP categories if unused.  
7. MCP POIs (stock cascades via `POIStock.poi` CASCADE).  
8. Delete or archive manifest file; print BEFORE/AFTER counts.

**Hard bans:** delete any user email ending in `@yopmail.com`; delete `CTG-*`, `SUP-01`, `PORT-01`, non-manifest vehicles.

### 5.3 Skill alignment

Update `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md` to prefer:

> If `fg-mcp-<RUN_ID>.json` exists, run `seed-mcp-playwright-fg.py --wipe --run-id …` (still confirm with user before wipe).

---

## 6. Implementation phases

### Phase A — Script skeleton + Layer 1 ensure

| Step | Work | Verify |
|------|------|--------|
| A1 | Add `scripts/seed-mcp-playwright-fg.py` with argparse, `django.setup()`, `schema_context("nourish")` | `--dry-run` prints plan |
| A2 | Create POIs, category, products, stock, LUPs, vehicle, driver | Codes match §2; `poi_code` length ≤ 20 |
| A3 | UOP binds §3.2 | CC/loading/unloading queues non-empty for MCP POIs |
| A4 | Write manifest | File present under `tests/e2e/playwright-mcp/` |
| A5 | Makefile targets | `make seed-mcp-fg RUN_ID=…` works via compose |

### Phase B — Wipe

| Step | Work | Verify |
|------|------|--------|
| B1 | Implement `--wipe` using manifest | Dry-run lists targets |
| B2 | Ops-chain wipe when numbers present | PR/TR/TO gone; seed users intact |
| B3 | Re-ensure same RUN_ID after wipe | Idempotent clean recreate |

### Phase C — Docs & skills

| Step | Work | Verify |
|------|------|--------|
| C1 | Runbook prerequisites → MCP POIs + `seed-mcp-fg` / `wipe-mcp-fg` | Link to this plan |
| C2 | `docs/guides/playwright-mcp-admin.md` + credentials YAML `fg_mcp_session` block | Agents pick MCP codes from manifest |
| C3 | Wipe skill points at script | Confirm-before-delete preserved |
| C4 | Scenario plans: CTG examples marked illustrative; “use manifest source/dest” | No silent CTG dependency |

### Phase D — Optional bootstrap

| Step | Work | Verify |
|------|------|--------|
| D1 | `--bootstrap-to=` via domain services on MCP graph | Status matches; numbers in manifest |
| D2 | Document Mode C usage in runbook | Yard-only suite can start mid-chain |

---

## 7. Code touchpoint summary

| Path | Change |
|------|--------|
| `scripts/seed-mcp-playwright-fg.py` | **New** — ensure + wipe |
| `Makefile` | `seed-mcp-fg`, `wipe-mcp-fg` |
| `tests/e2e/playwright-mcp/fg-mcp-<RUN_ID>.json` | Generated artifact (gitignored if needed; dir kept) |
| `docs/guides/playwright-mcp-admin.md` | FG session seeder section |
| `docs/testing/playwright-mcp-credentials.yaml` | Optional `fg_mcp_session` defaults |
| `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md` | Prefer script wipe |
| `.cursor/skills/playwright-mcp-admin/SKILL.md` | Prerequisite: seed-mcp-fg |
| FG runbook / README under `09-testing/.../finished-goods-workflow/` | Prerequisites + links |

No production app feature flag required — **dev/local tooling only**.

---

## 8. MCP run procedure (consumers)

1. `make seed` — role logins if missing  
2. `make seed-mcp-fg RUN_ID=…` — create isolated FG graph + write `fg-mcp-<RUN_ID>.json`  
3. Run Playwright MCP against manifest POIs/products/driver (not CTG-*)  
4. `make wipe-mcp-fg RUN_ID=…` — delete that session’s graph + tagged ops chain  

Source/dest for the run: `MCP-S-<RUN_ID>` → `MCP-D-<RUN_ID>`.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| `poi_code` / registration length | Enforce ≤ 20 in script; reject long RUN_ID formats |
| `Product.product_name` unique | Include RUN_ID in name |
| `Driver.user` PROTECT | Wipe Driver then User only for `mcp.drv.*@example.com` |
| Vehicle soft-delete | Use same delete API as admin / hard-delete if soft leaves unique reg blocked |
| UOP unique `(user, poi, role)` | get_or_create; wipe by PK list |
| Partial failure mid-chain | Wipe is idempotent; allow wipe without full ops_chain |
| Scenario docs still say CTG-* | Phase C doc updates; agents follow runbook + manifest |

---

## 10. Definition of Done

- [ ] `scripts/seed-mcp-playwright-fg.py` implements ensure + wipe + dry-run
- [ ] `make seed-mcp-fg` / `make wipe-mcp-fg` documented and working on local compose
- [ ] Manifest written and sufficient for MCP to pick source/dest/products/driver without reading CTG-*
- [ ] Fresh ensure on empty or dirty DB does **not** require CTG-001/002/FG-F-*/shared vehicles
- [ ] Wipe removes MCP graph + tagged ops chain; seed `@yopmail.com` users and non-MCP masters remain
- [ ] FG runbook prerequisites updated to this flow
- [ ] Wipe skill prefers manifest script (still confirm before delete)
- [ ] Optional: Layer 2 bootstrap behind flag only

---

## 11. Related documentation

| Doc | Path |
|-----|------|
| FG MCP runbook | `../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md` |
| FG scenario index | `../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/README.md` |
| MCP admin guide | `../../../docs/guides/playwright-mcp-admin.md` |
| Credentials YAML | `../../../docs/testing/playwright-mcp-credentials.yaml` |
| Identity seed (unchanged role) | `../../../scripts/seed-data.py` |
| Vendor fixture precedent | `../../../scripts/seed-vendor-dev-fixtures.py` |
| Lifecycle service reference (adapt, don’t reuse emails) | `../../../apps/tracking/mock/fg_own_fleet_lifecycle.py` |
| Wipe skill | `../../../.cursor/skills/detect-wipe-mcp-test-data/SKILL.md` |

---

## 12. Implementation TODOs

- [ ] Implement Phase A (ensure + manifest)
- [ ] Implement Phase B (wipe)
- [ ] Implement Phase C (docs/skills/runbook)
- [ ] (Optional) Phase D bootstrap-to status
- [ ] Smoke: ensure → MCP login as depot.officer1 → Add PR shows dest=`MCP-D-…` → wipe
