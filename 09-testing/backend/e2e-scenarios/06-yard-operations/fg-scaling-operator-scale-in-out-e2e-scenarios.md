---
module: 06-yard-operations
specification: Finished Goods Scaling Operator Scale-In / Scale-Out - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: SC-01, TLS-01, YARD-01, FB-001, STK-01
source_spec: ../../05-modules/06-poi-operations/scaling-operations-sprint4.md
last_updated: 2026-07-16
playwright_mcp: true
---

# Finished Goods — Scaling Operator Scale-In / Scale-Out - E2E Scenario Plan (Django Admin SSR)

Scope: **Scaling Operator** performing TO-linked **Scale-In**, **Scale-Out**, and **Queue Token** print for **FG outbound** yard legs (source and destination) via Django Admin. Covers Active-visit eligibility after gate-in, mandatory P.C. code + weight fields, CC sub-state after scale-in, loading/unloading gates on scale-out, net-weight display, immutability, and stock-trigger negatives (scale-out must not mutate stock). Command Center bay assignment, loading/unloading completion, and gate-out are **fixtures** except where scale-out clearance depends on them.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & eligibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Scaling Operator sees Scaling menu | As **Scaling Operator** (`scaling.operator1@yopmail.com`), log in at `/admin/login/`, select **working site** when prompted (must match `UserOperationalPOI` primary assignment). Assert sidebar **Scaling** shows **Scale-In** (`/admin/operations/scalein/add/`), **Scale-Out** (`/admin/operations/scaleout/add/`), **Queue Tokens** (`/admin/operations/queuetoken/`), and **Gate Passes** (`/admin/operations/scaleout/`). Assert planning / distribution write menus absent. | P0 | Planned |
| TC02 | Source Scale-In lists only gate-in-complete visits at working POI | Prerequisite: FG outbound Own Fleet TO with **source Gate-In** done → status **`at_source`**, yard leg **source**, origin POI = scaling.operator1 working site; another TO still **`driving_towards_source`** (no gate-in) and/or at a different POI exists. As **scaling.operator1** on Scale-In add, open **Active visit (TO / vehicle)**. Assert eligible visit label (`{to_number} — {registration}`) appears; pre–gate-in / wrong-POI TOs are absent. *Rewrite:* picker is the add-form ModelChoiceField — not Gate **Active Visits** changelist. | P0 | Planned |
| TC03 | Destination Scale-In lists only visits after destination Gate-In | Prerequisite: same chain at destination POI with status **`at_destination`** (destination gate-in done). As Scaling Operator scoped to **destination** working site (reassign `UserOperationalPOI` / working site before run — only `scaling.operator1` is seeded), open Scale-In add. Assert only **`at_destination`** visits at that POI appear; visits still **`driving_towards_destination`** do not. | P0 | Planned |

## Scale-In validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Scale-In blocked without P.C. code or Weight (MT) | As **scaling.operator1** on Scale-In add with an eligible Active visit selected: (1) leave **Pc code** blank, fill **Weight (MT)**, Save; (2) fill **Pc code**, leave **Weight (MT)** blank, Save. Assert each attempt stays on add form with required-field errors; no success message; no new Scale-In / Queue Token row. *Rewrite:* UI labels are **Pc code** / **Weight (MT)** — not legacy “Gross Weight (MT)”. | P0 | Planned |
| TC05 | Scale-In Weight (MT) rejects non-numeric input | As **scaling.operator1** on Scale-In add, enter **Weight (MT)** = `abc`, fill **Pc code**, Save. Assert Django DecimalField validation error; no Scale-In created. *Known gap:* `0` and negative values are **not** rejected by `ScaleInService` / model validators today — do **not** assert rejection of `0`/`-10` as PASS criteria; treat unexpected positive-only enforcement as product change to re-baseline. | P1 | Planned |
| TC06 | Duplicate active P.C. code blocked at same POI | Prerequisite: prior Scale-In at same POI left a Queue Token **Waiting** / **Assigned** with P.C. code `MCP-PC-{RUN_ID}`. As **scaling.operator1**, attempt Scale-In for another eligible visit with the same **Pc code**. Assert error (e.g. **P.C. code '…' is already in use at this site.**); no second token. | P1 | Planned |

## Scale-In happy path & Queue Token

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Successful source Scale-In → Waiting for Command Center | Prerequisite: eligible source visit (`at_source`). As **scaling.operator1**, select Active visit, enter unique **Pc code** (`MCP-PC-{RUN_ID}`), **Weight (MT)** (e.g. `40`), Save. Assert success **Scale-in recorded. P.C. Code: …. Queue token issued (waiting).** Open linked TO: sub-state badge **Waiting for Command Center** (`waiting_cc`) — CC auto-queue after brief `scale_in_source`. Assert Scale-Ins list shows `pc_code`, weight, timestamp. | P0 | Planned |
| TC08 | Printable Queue Token PDF for P.C. code | After TC07, open **Queue Tokens**, search/filter by `MCP-PC-{RUN_ID}`. Select the token, run admin action **Print Token**. Assert PDF download (`queue-token-{pc_code}.pdf`) with **vehicle** registration, **P.C. code**, **TO number**, and **product type FG** (not a free-text “item name” line). Token status **Waiting**. | P0 | Planned |
| TC09 | Successful destination Scale-In → Waiting for Command Center | Prerequisite: destination gate-in complete (`at_destination`). As Scaling Operator at destination site, complete Scale-In as TC07 with a new `MCP-PC-D-{RUN_ID}`. Assert success message + TO sub-state **Waiting for Command Center** (`waiting_cc`). | P0 | Planned |

## Scale-Out validation & gates

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Source Scale-Out blocked until all loading points complete | Prerequisite: source Scale-In done; CC assigned **multiple** loading points; at least one LoadEvent not finished (`end_datetime` null) / `CCService.all_assignments_complete_for_visit` false. As **scaling.operator1** on Scale-Out add, open **Pending session (TO / vehicle)** — visit **may still appear** (pending `WeighingSession`). Select it, enter **Weight (MT)**, Save. Assert error **Loading is not yet complete…** (all assigned loading points); no Scale-Out; `scale_out_completed` remains false. *Rewrite:* not “hidden from list until ready” — blocked at save. | P0 | Planned |
| TC11 | Scale-Out blocked without Weight (MT) | Prerequisite: loading complete; pending WeighingSession at site. As **scaling.operator1** on Scale-Out add, select session, leave **Weight (MT)** blank, Save. Assert required-field error. *Rewrite:* label is **Weight (MT)** (scale-out weight), not “Tare Weight”. | P0 | Planned |
| TC12 | Scale-Out auto-calculates Net Weight as absolute difference | Prerequisite: Scale-In **Weight (MT)** = `40`; loading complete. As **scaling.operator1**, enter Scale-Out **Weight (MT)** = `10`, Save. Assert success **Scale-out recorded. Net Weight: 30.000 MT. Gate Pass issued.** On Scale-Out change, **Net weight mt** = `30` (readonly). | P0 | Planned |
| TC13 | Scale-Out when second weight exceeds Scale-In weight (abs net) | Prerequisite: Scale-In weight = `10`; loading complete. Enter Scale-Out **Weight (MT)** = `15`, Save. *Known gap:* service uses `abs(scale_in − scale_out)` — **no** “tare cannot exceed gross” rejection. Assert success with **Net Weight: 5.000 MT** (current behaviour). Treat a hard block as FAIL only if product later adds the legacy rule (then re-baseline). | P1 | Planned |
| TC14 | Destination Scale-Out blocked until all unloading points complete | Prerequisite: destination Scale-In done; multi-point unload incomplete. As Scaling Operator at destination on Scale-Out add, select pending session, Save with weight. Assert error **Unloading is not yet complete…**; no Scale-Out. | P0 | Planned |

## Scale-Out happy path & immutability

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC15 | Successful source Scale-Out → Scale Out (Source) sub-state | Prerequisite: all source loading complete. As **scaling.operator1**, complete Scale-Out with valid weight. Assert success + Gate Pass message; TO sub-state **Scale Out (Source)** (`scale_out_source`); canonical TO status remains **`at_source`** (not advanced by SC-01). Queue Token status **Closed**. Gate-Out clearance for Scale-out becomes **complete** (gateman fixture can exit). | P0 | Planned |
| TC16 | Successful destination Scale-Out → Scale Out (Destination) — not Completed | Prerequisite: all destination unloading complete. As Scaling Operator at destination, complete Scale-Out. Assert success; TO sub-state **Scale Out (Destination)** (`scale_out_dest`); TO status remains **`at_destination`** — **not** `completed` / `closed`. *Rewrite:* terminal close is destination **Gate-Out** (GT-01), not scale-out. | P0 | Planned |
| TC17 | Scale-In / Scale-Out weights immutable after save | After TC07, open Scale-In change URL — **Pc code**, **Weight (MT)**, discrepancy fields are readonly (locked from create, not only after scale-out). After TC15/TC16, open Scale-Out change — **Weight (MT)** / **Net weight mt** readonly. Assert no editable weight controls; Save must not alter stored weights. | P0 | Planned |

## Stock logic (cross-role; scale-out must not mutate)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC18 | Source POI stock does not move on Scale-Out | Prerequisite: after loading completed (stock deduction already applied) and after TC15 source Scale-Out. As **Tenant Admin** (`admin@yopmail.com`), open **POI Stock Movement Log** (`/admin/operations/poistockmovementlog/`), filter by TO. Assert a **Loading Source Deduction** (`LOADING_SOURCE_DEDUCTION`) row exists from load-complete; assert **no new** `SCALE_OUT_SOURCE_DEDUCTION` (or equivalent scale-out stock event) timestamped at Scale-Out. Optionally compare `POIStock.current_stock_mt` before/after Scale-Out — unchanged. *Rewrite:* scaling operator has no stock menu — use tenant admin. | P1 | Planned |
| TC19 | Destination POI stock does not move on Scale-Out | After unloading completed + TC16 destination Scale-Out, as **admin@yopmail.com**, assert **Unloading Destination Addition** (`UNLOADING_DESTINATION_ADDITION`) from unload-complete and **no** scale-out destination stock addition at Scale-Out time. | P1 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Scaling Operator FG outbound source + destination Scale-In/Out, Active-visit eligibility, P.C. code + Weight (MT), Queue Token print, loading/unloading scale-out gates, net weight, immutability, stock non-mutation at scale-out (via tenant admin).
- Out of scope: CC bay assignment UI, Load/Unload start-complete UI (fixtures), Gate-In/Out suites, QC flagged path, RM inbound, XSS/SQLi, email/push, physical weighbridge integration, Gate Pass PDF content deep-assert (action exists; optional smoke).
- Upstream fixtures: `fg-gateman-gate-in-out-e2e-scenarios.md`, `fg-transport-planner-transport-order-e2e-scenarios.md`, `fg-driver-supervisor-dispatch-e2e-scenarios.md`, `fg-driver-my-trips-e2e-scenarios.md`; CC + loading/unloading personnel for scale-out unlock.

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Scaling Operator | `scaling.operator1@yopmail.com` | Scale-In / Scale-Out / Queue Tokens at assigned POI |
| Tenant Admin | `admin@yopmail.com` | TC18–TC19 stock movement log |
| Gateman (source / dest) | `gateman1@yopmail.com`, `gateman2@yopmail.com` | Fixture: gate-in before scale-in |
| Command Center / Loading / Unloading | `command.center.officer1@yopmail.com` (if seeded), `loading.personnel1@yopmail.com`, `unloading.personnel1@yopmail.com` | Fixture: unlock scale-out |

Passwords: `docs/testing/playwright-mcp-credentials.yaml`. **Confirm `UserOperationalPOI` before run** — only one scaling operator is seeded; destination leg requires working-site / POI reassignment to the TO destination (same pattern as single-role yard scoping).

### Fixture chain (FG outbound E2E)

1. PR → TR approve → TO Own Fleet → DS release → Driver Trip Start → `driving_towards_source`.
2. Gateman1 → source Gate-In → `at_source`.
3. **Scaling** → source Scale-In → `waiting_cc` + Queue Token.
4. CC assign loading point(s) → Loading complete (all points) → stock deduction.
5. **Scaling** → source Scale-Out → `scale_out_source` (status stays `at_source`).
6. Gateman1 → source Gate-Out → `driving_towards_destination`.
7. Gateman2 → destination Gate-In → `at_destination`.
8. **Scaling** (dest POI) → destination Scale-In → `waiting_cc`.
9. CC + Unloading complete (all points) → stock addition.
10. **Scaling** → destination Scale-Out → `scale_out_dest` (status stays `at_destination`).
11. Gateman2 → destination Gate-Out → `closed` (out of suite except as clearance consumer).

Prefer one `RUN_ID` per MCP session; use `MCP-PC-{RUN_ID}` for wipe-friendly P.C. codes. Track system `to_number` for wipe (`.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| Scale-In add | `/admin/operations/scalein/add/` — **Scaling → Scale-In** |
| Scale-Out add | `/admin/operations/scaleout/add/` — **Scaling → Scale-Out** |
| Queue Tokens | `/admin/operations/queuetoken/` — action **Print Token** |
| Gate Passes / Scale-Out list | `/admin/operations/scaleout/` — action **Print Gate Pass** |
| Scale-In visit field | **Active visit (TO / vehicle)** |
| Scale-Out session field | **Pending session (TO / vehicle)** |
| Weight fields | **Weight (MT)** on both Scale-In (`scale_in_weight_mt`) and Scale-Out (`scale_out_weight_mt`) |
| P.C. code | **Pc code** (fieldset title **Weight & P.C. Code**) |
| Stock movement log | `/admin/operations/poistockmovementlog/` (tenant admin) |

### Status & wipe notes

| Step | TO status / sub-state | Display |
|------|----------------------|---------|
| Pre source scale-in | status `at_source` | At Source |
| After source scale-in (+ CC) | sub `waiting_cc` | Waiting for Command Center |
| After source scale-out | sub `scale_out_source`; status still `at_source` | Scale Out (Source) |
| Pre dest scale-in | status `at_destination` | At Destination |
| After dest scale-in (+ CC) | sub `waiting_cc` | Waiting for Command Center |
| After dest scale-out | sub `scale_out_dest`; status still `at_destination` | Scale Out (Destination) |

### Known implementation alignment / drift

| Topic | Legacy FG_SCL expectation | Current admin / services |
|-------|---------------------------|--------------------------|
| Visit picker | “Active Visit list” | Scale-In **Active visit (TO / vehicle)** ModelChoiceField scoped by `_eligible_sessions_qs` |
| Weight labels | Gross / Tare Weight (MT) | Both forms: **Weight (MT)** (`scale_in_weight_mt` / `scale_out_weight_mt`) |
| Scale-out eligibility UX | Hidden until loading/unloading done | Pending session **listed**; `ScaleOutService` blocks at save |
| Dest scale-out status | TO **Completed** | Sub-state only; status stays `at_destination`; close on gate-out |
| Tare > Gross | Rejected | `net = abs(diff)` — accepted |
| Positive weight | Reject 0 / negative | No MinValueValidator — only blank / non-decimal blocked |
| Immutability | After Scale-Out confirmed | Scale-In/Out change forms fully readonly from create |
| Queue Token PDF | vehicle, item name, PC | vehicle, **product_type FG/RM**, pc_code, TO — no item name |
| Stock at scale-out | Unchanged (assert on POI stock) | Mutations on load/unload complete (STK v3); scaling role cannot open stock admin |

### Original ID map

| Legacy ID | Verdict | Rewritten TC | Notes |
|-----------|---------|--------------|-------|
| FG_SCL_001 | Rewrite | TC02 | Active visit picker + POI/`at_source` scoping |
| FG_SCL_002 | Rewrite | TC02 | Pre–gate-in TO absent from picker |
| FG_SCL_003 | Rewrite | TC04 | Pc code + Weight (MT) required |
| FG_SCL_004 | Rewrite | TC05 | Non-numeric only; demote 0/− as known gap |
| FG_SCL_005 | Rewrite | TC07 | Ends at `waiting_cc` via CCService |
| FG_SCL_006 | Rewrite | TC08 | Print Token action; FG product_type not item name |
| FG_SCL_007 | Rewrite | TC10 | Listed but save-blocked until all loading complete |
| FG_SCL_008 | Rewrite | TC11 | Weight (MT) required |
| FG_SCL_009 | Rewrite | TC12 | abs(scale_in − scale_out); success message Net Weight |
| FG_SCL_010 | Demote | TC13 | P1 known gap — abs allows second weight > first |
| FG_SCL_011 | Rewrite | TC15 | `scale_out_source`; status stays `at_source` |
| FG_SCL_012 | Rewrite | TC18 | Tenant admin movement log |
| FG_SCL_013 | Rewrite | TC03 | Destination eligibility |
| FG_SCL_014 | Keep | TC09 | Destination → `waiting_cc` |
| FG_SCL_015 | Rewrite | TC14 | Unloading gate at save |
| FG_SCL_016 | Rewrite | TC16 | Not Completed — `scale_out_dest` + `at_destination` |
| FG_SCL_017 | Rewrite | TC19 | Unload trigger, not scale-out |
| FG_SCL_018 | Rewrite | TC17 | Readonly from Scale-In create onward |
| — | Add | TC01 | Menu / nav smoke |
| — | Add | TC06 | Duplicate active P.C. code |

### Suggested MCP run order

Run TC01 → TC02 → TC04 → TC05 → TC07 → TC08 → TC06 (second visit) → TC10 (before load complete) → finish loading fixture → TC11 → TC12 → TC15 → TC17 (source) → TC18 → advance to destination → TC03 → TC09 → TC14 → finish unload → TC13 or TC16 → TC17 (dest) → TC19. Persist results under `tests/e2e/playwright-mcp/fg-scale-in-out-artifacts/RESULTS.md`; screenshot failures as `<TC-ID>-failure.png`.
