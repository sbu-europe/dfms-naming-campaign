---
module: 06-yard-operations
specification: Finished Goods Command Center Officer Bay Assignment - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: CC-01, FB-001, SC-01, LD-01, TLS-01
source_spec: ../../05-modules/06-poi-operations/command-center-loading-sprint4.md
last_updated: 2026-07-16
playwright_mcp: true
---

# Finished Goods — Command Center Officer Bay Assignment - E2E Scenario Plan (Django Admin SSR)

Scope: **Command Center Officer** viewing the **CC Queue**, creating **Bay Assignments** (loading + unloading points), verifying auto-issued **Waiting Serials**, and confirming the assigned visit appears for **Loading** / **Unloading** personnel. Covers FG outbound source leg (after source Scale-In) and destination leg (after destination Scale-In). Scale-In / Gate / Load-complete / Unload-complete remain **fixtures** except where CC eligibility depends on them.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & queue eligibility

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Command Center Officer sees Command Center menu | As **Command Center Officer** (`command.center.officer1@yopmail.com`), log in at `/admin/login/`, select **working site** when prompted (must match `UserOperationalPOI` primary assignment). Assert sidebar **Command Center** shows **Queue** (`/admin/operations/queueentry/?status__exact=waiting`), **Bay Assignments** (`/admin/operations/bayassignment/`), and **Waiting Serials** (`/admin/operations/waitingserial/`). Assert **Loading** / **Unloading** headings are absent for this role (`role_exclude`). | P0 | Planned |
| TC02 | Queue lists TOs Waiting for Command Center after source Scale-In | Prerequisite: FG outbound Own Fleet TO with source Gate-In + source Scale-In done → TO sub-state **Waiting for Command Center** (`waiting_cc`); QueueEntry status **Waiting**. As **command.center.officer1**, open **Command Center → Queue**. Assert the TO appears with columns **TO Number**, **TO Sub-state** badge **Waiting for Command Center**, **Vehicle**, **Status** **Waiting**, and row action **Assign loading/unloading point**. *Rewrite:* nav label is **Queue**, not legacy “Bay Assignment section”; portal querystring filters `status__exact=waiting`. | P0 | Planned |
| TC03 | Transport order dropdown excludes visits without Scale-In | Prerequisite: one TO still **`at_source`** without Scale-In (no QueueEntry); one TO after Scale-In with QueueEntry **Waiting**. As **command.center.officer1**, open **Bay Assignments → Add** (`/admin/operations/bayassignment/add/`) or queue action **Assign loading/unloading point**. Open **Transport order** (`queue_entry`) dropdown. Assert scaled-in visit label (`{to_number} — {registration} — {pc_code} …`) appears; the pre–Scale-In TO does **not** appear (no QueueEntry / not in `bay_assignable_queue_entries`). | P0 | Planned |

## Bay assignment happy path (loading)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | TO details auto-populate when Transport order selected | As **command.center.officer1** on Bay Assignment add, select an eligible **Transport order**. Assert **TO details** panel shows implemented fields: **TO number**, **TLS status**, **Flow lane**, **Yard sub-state**, **Vehicle (gate)**, **Gross weight scale-in (MT)**, **Origin POI**, **Destination POI**, **Allocated qty**, **QC (queue)**. *Rewrite:* panel does **not** show free-text product name or driver name — do not assert those. | P0 | Planned |
| TC05 | Assign Loading Point → Assigned Loading Point + waiting serial | Prerequisite: source Scale-In done; TO sub-state `waiting_cc`; at least one active **Loading** `LoadingUnloadingPoint` at the working POI. Prefer queue row action **Assign loading/unloading point** (prefills `?queue_entry=`). Select a **Loading / Unloading Point** with operation type **Loading**, click **Save assignments**. Assert success **Bay assigned. Waiting serial: {LUP}-{YYYYMMDD}-{seq}**. Redirect to Queue changelist. Open linked TO: sub-state **Assigned Loading Point** (`assigned_loading_point`). Open **Bay Assignments**: row shows TO, LUP, **Op Type** Loading, **Serial**, `is_active` true, **assigned_by**. *Rewrite:* button is **Save assignments**, not “Save”; LUP is one MDM model filtered by op type — not a separate “Loading Point” admin. | P0 | Planned |
| TC06 | Waiting serial unique, visible, non-editable | After TC05, open the Bay Assignment change form: **Serial** (`serial_display`) is readonly. Open **Waiting Serials** (`/admin/operations/waitingserial/`): row shows `serial_number`, TO Number, Point, issued_at, issued_by; no Add. Assert format `{short_code}-{YYYYMMDD}-{nnn}` and uniqueness (second assignment to a different LUP on same visit gets a different serial). | P0 | Planned |
| TC07 | Assigned visit visible to Loading Personnel at that point | After TC05, log in as **Loading Personnel** (`loading.personnel1@yopmail.com`) at the same working POI. Assert sidebar shows **Loading → Start Loading** (`/admin/operations/loadevent/add/`) and **does not** show **Command Center**. On Start Loading add: select the assigned **loading point**, then assert the visit appears in the **queue at point** table (serial order) with the waiting serial / TO from TC05. *Rewrite:* visibility is LD Start Loading queue — not the CC Queue. | P0 | Planned |

## Bay assignment happy path (unloading)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Assign Unloading Point after destination Scale-In | Prerequisite: destination Gate-In + destination Scale-In done → `waiting_cc` at destination POI; active **Unloading** LUP at that POI. As **command.center.officer1** scoped to **destination** working site (reassign `UserOperationalPOI` / working site before run if only one CC seed), open Queue → **Assign loading/unloading point**, select an **Unloading** point, **Save assignments**. Assert success message with waiting serial; TO sub-state **Assigned Unloading Point** (`assigned_unloading_point`); Bay Assignments **Op Type** Unloading. | P0 | Planned |
| TC09 | Assigned visit visible to Unloading Personnel at that point | After TC08, log in as **Unloading Personnel** (`unloading.personnel1@yopmail.com`) at destination POI. Assert **Unloading → Start Unloading** (`/admin/operations/unloadevent/add/`); Command Center absent. Select the assigned unloading point; assert TO / waiting serial appears in the point queue table. | P0 | Planned |

## Negatives & audit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Save blocked without Loading / Unloading Point | As **command.center.officer1** on Bay Assignment add with Transport order selected, leave LUP row empty (or remove all rows), click **Save assignments**. Assert stays on form with validation (e.g. select at least one loading/unloading point); no new Bay Assignment / Waiting Serial; TO remains `waiting_cc`. | P0 | Planned |
| TC11 | Bay assignment recorded on TO Execution timeline | After TC05 (or TC08), as **command.center.officer1** (or `admin@yopmail.com` if TO change is awkward), open the Transport Order change page. In **Execution timeline** inline, assert a row with To sub-state **Assigned Loading Point** or **Assigned Unloading Point**, `source_module` **command_center**, notes matching **Bay assigned: {short_code} ({serial})**, and actor / timestamp. *Rewrite:* no dedicated “Audit Logs” admin for Bay Assignment — timeline is the domain audit surface. Do **not** require a standalone Audit Log menu for CC officer. | P1 | Planned |
| TC12 | Add second loading point on same visit (FB-001) | Prerequisite: TC05 done; visit QueueEntry status **Assigned**; another distinct Loading LUP at same POI. From Queue, use **Add loading/unloading point**, select the second LUP, **Save assignments**. Assert success **Bays assigned** / second waiting serial; Assignments progress advances; first serial unchanged. Optional: Loading Personnel sees both points’ queues independently. | P1 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: CC Officer Queue / Bay Assignments / Waiting Serials, loading + unloading LUP assignment, waiting serial issuance, LD/ULD personnel queue visibility, TO timeline audit substitute, multi-LUP add (P1).
- Out of scope: Scale-In/Out UI (fixture), Gate-In/Out, Load/Unload start-complete beyond queue visibility, QC Pass/Fail UI (except noting pending blocks assignment), stock warning on assign (service sets `stock_warning` but admin does **not** display it — do not assert stock block), push/email notifications, REST Command Center dashboard stub, XSS/SQLi.
- Upstream fixtures: `fg-gateman-gate-in-out-e2e-scenarios.md`, `fg-scaling-operator-scale-in-out-e2e-scenarios.md` (through Scale-In → `waiting_cc`), plus TO/dispatch/driver chain as for yard suites.

### Roles & credentials

| Actor | Seed email | Use |
|-------|------------|-----|
| Command Center Officer | `command.center.officer1@yopmail.com` | Queue, Bay Assignments, Waiting Serials |
| Loading Personnel | `loading.personnel1@yopmail.com` | TC07 Start Loading queue |
| Unloading Personnel | `unloading.personnel1@yopmail.com` | TC09 Start Unloading queue |
| Scaling Operator | `scaling.operator1@yopmail.com` | Fixture: Scale-In before CC |
| Gateman | `gateman1@yopmail.com`, `gateman2@yopmail.com` | Fixture: Gate-In |
| Tenant Admin | `admin@yopmail.com` | Optional: TO timeline if needed |

Passwords: `docs/testing/playwright-mcp-credentials.yaml`. **Confirm `UserOperationalPOI` before run** — destination leg (TC08–TC09) may require working-site / POI reassignment for the single seeded CC officer.

### Fixture chain (FG outbound E2E)

1. PR → TR approve → TO Own Fleet → DS release → Driver Trip Start → `driving_towards_source`.
2. Gateman1 → source Gate-In → `at_source`.
3. Scaling → source Scale-In → `waiting_cc` + Queue Token + QueueEntry.
4. **CC (this suite)** → assign Loading LUP(s) → `assigned_loading_point` + Waiting Serial(s).
5. Loading personnel → Start/Complete Loading (fixture after TC07) → stock deduction.
6. Scaling → source Scale-Out → Gate-Out → destination Gate-In → destination Scale-In → `waiting_cc`.
7. **CC** → assign Unloading LUP → `assigned_unloading_point` (TC08–TC09).
8. Unloading complete → destination Scale-Out / Gate-Out (out of suite).

Prefer one `RUN_ID` per MCP session. Track system `to_number` / waiting serials for wipe (`.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`).

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| CC Queue | `/admin/operations/queueentry/?status__exact=waiting` — **Command Center → Queue** |
| Bay Assignments | `/admin/operations/bayassignment/` |
| Bay Assignment add | `/admin/operations/bayassignment/add/` (optional `?queue_entry=<uuid>`) |
| Waiting Serials | `/admin/operations/waitingserial/` (read-only) |
| Queue row action | **Assign loading/unloading point** / **Add loading/unloading point** |
| Form field | **Transport order** (`queue_entry`) |
| LUP formset | **Loading / Unloading Point** + **Add loading/unloading point** |
| Submit | **Save assignments** |
| Success | `Bay assigned. Waiting serial: …` / `Bays assigned (N). Waiting serials: …` |
| Start Loading | `/admin/operations/loadevent/add/` — pick point → queue table |
| Start Unloading | `/admin/operations/unloadevent/add/` |
| TO audit | Transport Order change → **Execution timeline** |

### Status & wipe notes

| Step | TO status / sub-state | Display |
|------|----------------------|---------|
| After source Scale-In | sub `waiting_cc` | Waiting for Command Center |
| After loading bay assign | sub `assigned_loading_point`; QueueEntry `assigned` | Assigned Loading Point |
| After dest Scale-In | sub `waiting_cc` | Waiting for Command Center |
| After unloading bay assign | sub `assigned_unloading_point` | Assigned Unloading Point |

QueueEntry statuses: `waiting` / `assigned` / `completed` (completed hidden from Queue queryset).

### Known implementation alignment / drift

| Topic | Legacy FG_CC expectation | Current admin / services |
|-------|--------------------------|--------------------------|
| Entry surface | “Bay Assignment section” | **Command Center → Queue** (+ Bay Assignments list) |
| Create CTA | +Add Bay Assignment | Queue **Assign loading/unloading point** or Bay Assignments Add |
| Point model | Separate Loading vs Unloading screens | One `LoadingUnloadingPoint`; op type LOAD/UNLOAD filters options |
| Auto-populate | vehicle, product, weight, driver | TO number, TLS, lane, sub-state, vehicle, gross scale-in, POIs, qty, QC — **no driver/product name** |
| Eligibility | Scale-In completed | QueueEntry exists via Scale-In; TO without Scale-In never in dropdown |
| Loading visibility | “queue for that Loading Point” | **Start Loading** point → serial queue (CC nav excluded for loading_personnel) |
| Audit | Dedicated Audit Log | **Execution timeline** on TO (`source_module=command_center`) |
| Stock | Block assign if insufficient | Warning-only in service; **not shown** in admin UI |
| Multi-LUP | Single point implied | FB-001 formset; visit stays assignable until all points complete |

### Original ID map

| Legacy ID | Verdict | Rewritten TC | Notes |
|-----------|---------|--------------|-------|
| FG_CC_001 | Rewrite | TC02 | Queue + `waiting_cc`; not “Bay Assignment section” |
| FG_CC_002 | Rewrite | TC05 | Save assignments + LOAD LUP → `assigned_loading_point` |
| FG_CC_003 | Rewrite | TC04 | Implemented TO details fields only |
| FG_CC_004 | Rewrite | TC03 | No QueueEntry without Scale-In |
| FG_CC_005 | Rewrite | TC06 | Auto serial; Waiting Serials read-only |
| FG_CC_006 | Rewrite | TC07 | Loading Personnel Start Loading queue |
| FG_CC_007 | Rewrite | TC08 | UNLOAD LUP → `assigned_unloading_point` |
| FG_CC_008 | Rewrite | TC09 | Unloading Personnel Start Unloading queue |
| FG_CC_009 | Rewrite | TC11 | TO Execution timeline substitute (P1) |
| — | Add | TC01 | Menu / nav smoke |
| — | Add | TC10 | Blank LUP negative |
| — | Add | TC12 | FB-001 second LUP (P1) |

### Suggested MCP run order

Run TC01 → fixture Scale-In → TC02 → TC03 → TC04 → TC10 (before save) → TC05 → TC06 → TC07 → (optional TC12) → advance destination Scale-In → TC08 → TC09 → TC11. Persist results under `tests/e2e/playwright-mcp/fg-cc-bay-assignment-artifacts/RESULTS.md`; screenshot failures as `<TC-ID>-failure.png`.
