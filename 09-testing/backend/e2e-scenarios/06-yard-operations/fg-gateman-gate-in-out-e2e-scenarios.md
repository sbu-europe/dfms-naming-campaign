---
module: 06-yard-operations
specification: Finished Goods Gate-In / Gate-Out (Gateman) - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01, GT-02, TLS-01, FB-004, YARD-01
source_spec: ../../05-modules/06-poi-operations/gate-operations-sprint4.md
last_updated: 2026-07-16
playwright_mcp: true
---

# Finished Goods — Gateman Gate-In / Gate-Out - E2E Scenario Plan (Django Admin SSR)

Scope: **Gateman** at **source (origin)** and **destination** POIs performing TO-linked **Vehicle Entry (Gate-In)** and **Vehicle Exit (Gate-Out)** for **FG outbound** transport orders via Django Admin. Covers TO eligibility scoping, visit-summary prefill, clearance-blocked gate-out, status transitions, auto-closure at destination gate-out, and **Gate Activity Log** / **Transition history** substitutes for legacy Audit Log AC. Scale-in/out, loading/unloading, CC, QC, Driver Trip Start, and on-demand TO (GT-02) are fixture prerequisites or out of scope except where gate-out clearance depends on them.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & POI scoping

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gateman sees Gate menu | As **Gateman** (`gateman1@yopmail.com`), log in at `/admin/login/`, select **working site** when prompted (must match `UserOperationalPOI` primary assignment). Assert sidebar **Gate** shows **Vehicle Entry (Gate-In)** (`/admin/operations/gatein/add/`), **Vehicle Exit (Gate-Out)** (`/admin/operations/gateout/add/`), **Active Visits**, **Visit History**, and **On-Demand TO**. Assert restricted headings absent (e.g. **Transport** planning queues, **Distribution**, **Master Data** write modules). | P0 | Planned |
| TC02 | Source gate-in lists only eligible TOs at origin POI | Prerequisite: FG outbound Own Fleet TO in **`driving_towards_source`** with **origin POI** = gateman1’s working site; another TO ineligible status or at a different POI exists in tenant. As **gateman1** on **Vehicle Entry (Gate-In)** add form, open **Transport order** autocomplete. Assert eligible `to_number` appears; ineligible / wrong-POI TOs are absent. Status filter: **`Driving Towards Source`** (`driving_towards_source`) destined for this origin POI only. | P0 | Planned |
| TC03 | Destination gate-in lists only eligible TOs at destination POI | Prerequisite: same TO chain progressed to **`driving_towards_destination`** (source gate-in + source gate-out fixture). As **Gateman** at **destination POI** (`gateman2@yopmail.com` when seeded to destination depot — confirm `UserOperationalPOI` before run), open **Vehicle Entry (Gate-In)**. Assert only TOs with status **`Driving Towards Destination`** (`driving_towards_destination`) whose **destination POI** matches the working site appear in **Transport order** autocomplete. | P0 | Planned |

## Gate-In validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Gate-In blocked without transport order | As **gateman1** on Gate-In add, leave **Transport order** blank, fill other visible fields if needed, click **Submit Gate-In**. Assert form stays on add page with field error on **Transport order**: **Internal Transfer requires a transport order.** (or equivalent). No success message; no new row on **Active Visits**. | P0 | Planned |
| TC05 | Source gate-out blocked before scale-out clearance | Prerequisite: source gate-in completed (`at_source`), **scale-out not completed** on linked weighing session. As **gateman1** on **Vehicle Exit (Gate-Out)** add, open **Gate visit session** picker. *Rewrite:* visit **may appear** with label suffix **`Blocked: Scale-out not completed.`** (admin lists blocked visits). Select it; **Clearance status** panel shows Scale-out **Pending**. Click **Submit Gate-Out**. Assert error message (e.g. **Scale-out not completed.**) and no gate-out success; TO remains **`at_source`**. | P0 | Planned |
| TC06 | Destination gate-out blocked before destination clearance | Prerequisite: destination gate-in completed (`at_destination`), destination **scale-out / unloading** not complete per clearance matrix. As destination **gateman2** on Gate-Out add, select active visit (label may show **`Blocked: …`**). Assert clearance panel shows pending checks; **Submit Gate-Out** fails with blocking reason; TO stays **`at_destination`**. | P0 | Planned |

## Gate-In happy path & prefill

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Selecting TO prefills visit summary (vehicle & driver) | Prerequisite: eligible TO with assigned vehicle and driver (Own Fleet) or vendor driver on record. As **gateman1** on Gate-In add, select **Transport order**. Assert **visit summary** card (not separate editable fields) shows **vehicle** registration label and **driver name** / **driver contact** matching the TO assignment (JS prefill via `/admin/operations/gatein/to-prefill/<to_id>/`). **Document category** is fixed **Internal Transfer (TO/Challan)** (disabled). | P0 | Planned |
| TC08 | Successful source Gate-In → At Source | Prerequisite: TO in **`driving_towards_source`** at origin. As **gateman1**, select TO, ensure **Project / From Info** populated (defaults from origin POI), click **Submit Gate-In**. Assert success **Gate-in recorded. Vehicle is now in Active Visits.** Open **Active Visits** — session status **Active**. Open linked TO (gateman has read access) or visit detail: TO status badge **At Source** (`at_source`). | P0 | Planned |
| TC09 | Successful destination Gate-In → At Destination | Prerequisite: TO in **`driving_towards_destination`** at destination POI. As **gateman2**, complete Gate-In as TC08. Assert success message; TO status **At Destination** (`at_destination`). | P0 | Planned |

## Gate-Out happy path & auto-closure

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Destination Gate-Out auto-closes TO | Prerequisite: after TC09, complete **destination scale-out** and **unloading** clearance. As **gateman2**, submit Gate-Out on ready visit. Assert gate-out success; TO status **Closed** (`closed`) immediately — no manual closure step. Assert no intermediate **Bill Disbursed** badge on this TO after gate-out. | P0 | Planned |
| TC12 | Transport Planner has no TO closure queue | After TC11, as **Transport Planner** (`transport.planner1@yopmail.com`), open **Transport → Transport orders** and the closed TO change page. Assert status **Closed**; no **Close TO** / closure-queue action required for this FG outbound path (closure panel `show_close_to_control` is for legacy **`completed`** rows only). | P1 | Planned |
| TC13 | Closed TO is read-only | As **gateman2** (or **gateman1**), open the **Closed** TO change URL. Assert fields are read-only; no **Trip Start**, gate, scale, or load actions on this surface. Attempting Gate-In add with this TO must not list it in autocomplete. | P1 | Planned |

## Activity log & lifecycle audit (MCP substitutes)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Gate-In recorded in Gate Activity Log | After TC08, as **gateman1**, open **Gate Activity Log** (`/admin/operations/gateactivitylog/` — dashboard widget **On-Demand TOs Today** links here, or direct URL). Filter/search by session / TO. Assert row with action **Gate In** (`gate_in`), **actor** = gateman1, **POI** = origin site, timestamp present, details include `to_number`. *Rewrite:* legacy **Audit Logs** menu is not on gateman seed (`MENU_AUDIT_LOGS_VIEW` absent). | P1 | Planned |
| TC15 | Gate-out recorded in Gate Activity Log | After TC11, assert **Gate Out** (`gate_out`) row with actor, POI, timestamp, and `to_number` in details. | P1 | Planned |
| TC16 | Auto-closure recorded in TO Transition history | After TC11, open closed TO change page as **gateman2** or **Transport Planner**. Scroll to **Transition history**. Assert transition to **`closed`** with notes referencing gate-out at destination (e.g. **Gate-out at destination — transport order closed**) and `source_module` gate semantics in row content. *Rewrite:* no separate **Closure** row in Gate Activity Log — only `gate_out` action exists. | P1 | Planned |
| TC17 | FG MCP lifecycle excludes Bill Disbursed | On the same closed TO from TC11, read **Transition history** end-to-end (or status badge trail). Assert sequence includes **Created → Assigned → Ready for Dispatch → Driving Towards Source → At Source → Driving Towards Destination → At Destination → Closed** without **Bill Disbursed** (`bill_disbursed`) on this path. *Known gap:* enum and legacy transition graph still define **Bill Disbursed** for old rows — treat appearance on a fresh MCP FG outbound TO as FAIL (product defect). | P2 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Gateman FG outbound source + destination gate-in/out, TO autocomplete eligibility, visit-summary prefill, clearance-blocked gate-out UX, status transitions, destination auto-close, Gate Activity Log, TO transition history for closure.
- Out of scope: GT-02 on-demand TO wizard, gate supervisor vehicle override, XSS/SQLi, email/push notifications, mobile-only flows, global **Audit Logs** menu for gateman, full scale/load/unload/CC/QC scenario suites (use as upstream fixtures only).
- Yard fixture modules: `fg-transport-planner-transport-order-e2e-scenarios.md`, `fg-driver-supervisor-dispatch-e2e-scenarios.md`, `fg-driver-my-trips-e2e-scenarios.md` (Trip Start → `driving_towards_source`).

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Gateman (source POI) | `gateman1@yopmail.com` | Source gate-in/out at **origin POI** |
| Gateman (destination POI) | `gateman2@yopmail.com` | Destination gate-in/out at **destination POI** |
| Transport Planner | `transport.planner1@yopmail.com` | TC12 closure-queue negative |
| Scaling Operator | `scaling.operator1@yopmail.com` | Fixture: scale-out clearance |
| Loading / Unloading personnel | `loading.personnel1@yopmail.com`, `unloading.personnel1@yopmail.com` | Fixture: load/unload clearance when deployed |

Passwords: `docs/testing/playwright-mcp-credentials.yaml`. **Confirm `UserOperationalPOI` primary assignments in DB before run** — map gateman1 → TO **origin POI**, gateman2 → TO **destination POI** (seed examples often feed-mill origin + `ctg-depot` destination; do not assume without DB check).

### Fixture chain (FG outbound E2E)

1. Depot Officer → submitted FG PR.
2. Distribution Officer → TR `pending_approval`.
3. Distribution Manager → approve → `available_for_transport_planning`.
4. Transport Planner → Create TO + Own Fleet assignment (Vehicle, Driver, milestones) → **Assigned**.
5. Driver Supervisor → release → **Ready for Dispatch**.
6. Driver → **Trip Start** → **Driving Towards Source**.
7. **Gateman1** → source Gate-In → **At Source**.
8. Scaling (+ Loading/CC as required) → scale-out complete.
9. Fixture advances TO to `driving_towards_destination` (source gate-out omitted from this suite).
10. **Gateman2** → destination Gate-In → **At Destination**.
11. Scaling (+ Unloading) → destination scale-out complete.
12. **Gateman2** → destination Gate-Out → **Closed**.

Prefer one `RUN_ID` per MCP session; `to_number` is system-generated — track by number / creator for wipe (`.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| Gate-In add | `/admin/operations/gatein/add/` — **Gate → Vehicle Entry (Gate-In)** |
| Gate-Out add | `/admin/operations/gateout/add/` — **Gate → Vehicle Exit (Gate-Out)** |
| Active visits | `/admin/operations/gatevisitsession/?status__exact=active` |
| Gate Activity Log | `/admin/operations/gateactivitylog/` |
| TO read (gateman) | `/admin/transport/transportorder/<uuid>/change/` (read-only) |
| Gate-In submit | **Submit Gate-In** |
| Gate-Out submit | **Submit Gate-Out** |
| Gate-In TO field | **Transport order** (autocomplete; not a plain `<select>`) |
| Gate-Out session field | **Gate visit session** (labels include TO number, status, **Ready for gate-out** or **Blocked: …**) |
| Fixed category | **Internal Transfer (TO/Challan)** on TO-linked gate-in |

### Status & wipe notes

| Step | TO status enum | Display label |
|------|----------------|---------------|
| Pre source gate-in | `driving_towards_source` | Driving Towards Source |
| After source gate-in | `at_source` | At Source |
| After source gate-out | `driving_towards_destination` | Driving Towards Destination |
| After destination gate-in | `at_destination` | At Destination |
| After destination gate-out | `closed` | Closed |

Visit session: **Active** during yard stay; **Closed** after gate-out.

### Known implementation alignment / drift

| Topic | Legacy FG_GATE expectation | Current admin / services |
|-------|---------------------------|---------------------------|
| Gate-out visit picker before scale-out | TO absent from dropdown | Visit **listed** with **Blocked: Scale-out not completed.**; save rejected at submit |
| Vehicle / driver on gate-in | Editable fields auto-populate | Shown in **visit summary** card via `gatein_to_prefill.js`; driver/vehicle model fields hidden on add |
| Audit log | Global Audit Logs | **Gate Activity Log** for gate_in/gate_out; TO **Transition history** for status closure |
| Bill Disbursed | Never in FG lifecycle | Auto-close at destination gate-out; `bill_disbursed` remains in enum for legacy paths only |
| Source vs destination gateman | Distinct roles | Same **`gateman`** role; POI scoping via **working site** / `UserOperationalPOI` |

### Original ID map

| Legacy ID | Verdict | Rewritten TC | Notes |
|-----------|---------|--------------|-------|
| FG_GATE_001 | Rewrite | TC02 | Autocomplete + POI/status scoping |
| FG_GATE_002 | Rewrite | TC04 | Error text **Internal Transfer requires a transport order.** |
| FG_GATE_003 | Rewrite | TC07 | Visit summary prefill, not visible reg/driver fields |
| FG_GATE_004 | Keep | TC08 | Success message + `at_source` |
| FG_GATE_005 | Rewrite | TC14 | Gate Activity Log, not Audit Logs |
| FG_GATE_006 | Rewrite | TC05 | Visit visible but blocked until scale-out |
| FG_GATE_008 | Rewrite | TC15 | Gate Activity Log |
| FG_GATE_009 | Keep | TC09 | Destination gate-in → `at_destination` |
| FG_GATE_010 | Keep | TC03 | Destination POI + status filter |
| FG_GATE_011 | Rewrite | TC06 | Blocked visit label + failed submit |
| FG_GATE_012 | Keep | TC11 | Auto `closed` at destination gate-out |
| FG_GATE_013 | Keep | TC12 | No TP closure queue on FG path |
| FG_GATE_014 | Demote | TC17 | P2 defect hunt — enum still has `bill_disbursed` |
| FG_GATE_015 | Keep | TC13 | Read-only closed TO |
| FG_GATE_016 | Rewrite | TC15 + TC16 | Split gate_out log vs transition-history close |

### Suggested MCP run order

Run TC01 → TC02 → TC04 → TC07 → TC08 → TC14 (source leg) → complete scale/load fixtures → TC05 (negative) → TC15 → advance TO to destination leg → TC03 → TC09 → TC06 (negative) → TC11 → TC12–TC17. Persist results under `tests/e2e/playwright-mcp/fg-gate-in-out-artifacts/RESULTS.md`; screenshot failures as `<TC-ID>-failure.png`.
