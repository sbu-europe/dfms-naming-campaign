---
module: 09-tracking
specification: GPS Tracking / Live GPS — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: Live GPS fleet, TO-centric history, GT06 ingest
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md
last_updated: 2026-08-04
playwright_mcp: true
suite: live-gps
last_mcp_run: 2026-08-04
last_mcp_verdict: 33/33 Pass + 7/7 TO checkpoints
artifacts: tests/e2e/playwright-mcp/live-gps-artifacts/
---

# GPS Tracking — Live GPS — E2E Scenario Plan (Django Admin)

**Navigation:** Transport → **Live GPS** (`/admin/tracking/live-gps/`)

> **2026-08-04 — Suite strengthened & re-signed:** Parts A–C + Part D with **real FG yards** (gate-in/out, scale, CC, load/unload → Closed via dest Gate-Out). TO admin checkpoints `GPS_LG_TO_01–07` Pass. FG TO `TO-20260804-0005`.  
> **Last MCP run:** [RESULTS.md](../../../../../tests/e2e/playwright-mcp/live-gps-artifacts/RESULTS.md) · Account: `admin.nourish@yopmail.com` · RUN_ID `A12ED295`

Scope: Mock GT06 packets + registered vehicles (IMEI match), fleet list (speed colours, TO#, operational status), ⋮ menu actions, and **TO-centric History**. Part D requires a **Finished Goods Workflow** TO through real source/dest yards (Gate-In/Out, scale, CC, load/unload) with **TO change-page** validation at each checkpoint, then Live GPS fleet/history asserts.

Target runner: **Playwright MCP** (`docs/guides/playwright-mcp-admin.md`).

> **Out of scope:** ⋮ → **Send command** (device command path not working / not under test).

> **MCP tip:** Fleet card ⋮ (Actions) is **hover-visible only** — hover the row before clicking.
---

## Accounts & stack

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary | Tenant Admin `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Alternate | Transport Planner `transport.planner1.nourish@yopmail.com` / `Nourish@1234!` |
| Stack | `web`, `redis`, `gt06-ingest`, `celery_worker` (+ beat for sync) |

---

## Fixture strategy (wipe-friendly)

Prefer MCP-prefixed data so local wipe is safe. Do **not** assert against shared demo plates (`DH-GA-*`, `DH-QA-*`) for sign-off.

| Mode | Seed | Vehicle | Wipe |
|------|------|---------|------|
| **A — GPS sandbox** | Dedicated MCP GPS seed (when available) *or* bind IMEI + packets on an MCP vehicle | e.g. `MCP-VEH-<RUN_ID>` / `MCP-V-<RUN_ID>` | Wipe MCP rows + Redis IMEI keys |
| **B — FG served TO** | `make seed-mcp-fg RUN_ID=<8hex>` + **full FG §§1–18** (real yards → Closed); see Part D | Manifest `MCP-V-<RUN_ID>` | `make wipe-mcp-fg RUN_ID=…` |

**Hard rule:** `vehicle.gps_tracker_id` (IMEI) **must match** GT06 packets or the truck will not appear live on the map.

**Naming contract (GPS-created rows):**

| Field | Pattern |
|-------|---------|
| Run ID | 8 uppercase hex |
| Vehicle reg | `MCP-VEH-<RUN_ID>` or FG `MCP-V-<RUN_ID>` |
| POIs (if GPS-only) | `MCP-GPS-S-<RUN_ID>`, `MCP-GPS-D-<RUN_ID>` |
| Driver email | `mcp.gps.drv.<run_id_lower>@example.com` (or FG MCP driver) |

**Packet notes:**

- Moving ≥ `MOVING_SPEED_KMH` (3) → green; speed 0 short stop → yellow; parked ≥ 30 min or offline/stale → red.
- History parked/stopped use same speed floor; stopped ≥ 5 min, parked ≥ 30 min.
- Overspeed default limit **60 kph** (`GPS_OVERSPEED_LIMIT_KMH`).
- Prefer **backdated** Redis/Postgres points for parked/idle — do not wait 30 minutes in MCP.

---

## Part A — Seed & fleet list

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| GPS_LG_001 | Vehicle + IMEI on map | Seed/register vehicle with IMEI; inject live packets. Open Live GPS. Assert vehicle in fleet list with position; live-map `device_id` matches IMEI. | P0 | Pass |
| GPS_LG_002 | Speed — driving (green) | Packets speed ≥ 3 kph. Assert green speed dot + non-zero kph on fleet card. | P0 | Pass |
| GPS_LG_003 | Speed — stopped (yellow) | Speed 0, stop &lt; 30 min. Assert yellow dot + `0 kph`. | P0 | Pass |
| GPS_LG_004 | Speed — parked / signal lost (red) | Stop ≥ 30 min **or** stale/offline. Assert red dot. | P0 | Pass |
| GPS_LG_005 | TO number visible when assigned | Non-terminal TO on vehicle. Assert `TO-…` under registration. | P0 | Pass |
| GPS_LG_006 | Status — No Active TO | No non-terminal TO. Assert **No Active TO**; no active TO#. | P0 | Pass |
| GPS_LG_007 | Status — In-transit | Vehicle executing TO. Assert **In-transit** (+ TO lifecycle label when present). | P0 | Pass |
| GPS_LG_008 | Status — Scheduled | TO assigned / ready, not yet in execution. Assert **Scheduled**. | P1 | Pass |
| GPS_LG_009 | Status — Under Maintenance | Vehicle marked Under Maintenance. Assert **Under Maintenance**. | P1 | Pass |

---

## Part B — Fleet ⋮ menu (no Send command)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| GPS_LG_010 | Open ⋮ options | Click ⋮ on fleet row. Assert: Show history last hour / today / yesterday; Show TO; Show vehicle; Vehicle Planning; Follow. **Do not** test Send command. | P0 | Pass |
| GPS_LG_011 | History last hour | ⋮ → Show history last hour. Assert History tab; range ≈ last 60 minutes. | P0 | Pass |
| GPS_LG_012 | History today | ⋮ → Show history today. Assert today’s window loads. | P0 | Pass |
| GPS_LG_013 | History yesterday | ⋮ → Show history yesterday (data or empty-state). | P2 | Pass |
| GPS_LG_014 | Show TO | ⋮ → Show TO (when TO assigned). Assert admin TO change page. | P0 | Pass |
| GPS_LG_015 | Show vehicle | ⋮ → Show vehicle. Assert vehicle change page. | P1 | Pass |
| GPS_LG_016 | Vehicle Planning | ⋮ → Vehicle Planning. Assert planning board for vehicle. | P1 | Pass |
| GPS_LG_017 | Follow | ⋮ → Follow. Assert follow panel opens. | P1 | Pass |

---

## Part C — History (date range, activity, graph, playback)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| GPS_LG_018 | History by date range | History → Today / Yesterday / Last hour / custom. Assert listed TOs and **No active TO** periods fall only inside the selected window. | P0 | Pass |
| GPS_LG_019 | Select TO → activity detail | Open a served TO. Assert Drive / Stopped / Parked cards; geofence entry/exit / dwell when events exist. | P0 | Pass |
| GPS_LG_020 | Activity matches graph | Same TO window: activity card times align with speed chart and map path (shared point series). | P0 | Pass |
| GPS_LG_021 | Open TO from history | **Open TO** on activity header → TO admin page with correct details. | P0 | Pass |
| GPS_LG_022 | Started / Duration / Distance | TO activity header: STARTED, DURATION, DISTANCE present and plausible vs trip GPS. | P0 | Pass |
| GPS_LG_023 | Segments vs packets | Scripted drive → stop → drive (and parked if ≥30 min). Assert activity types match packet phases. | P0 | Pass |
| GPS_LG_024 | Overspeed on graph | Packets &gt; overspeed limit. Assert red overspeed markers on history graph. | P0 | Pass |
| GPS_LG_025 | Playback controls | Play advances cursor/speed; Stop freezes; **1x** (and higher) changes pace. | P0 | Pass |

---

## Part D — FG MCP vehicle that served a TO (real FG workflow + Live GPS)

Uses Finished Goods fixtures and the **Finished Goods Workflow** chain — GPS assertions live here; yard/TO mechanics follow [`finished-goods-workflow/`](../finished-goods-workflow/) + [`playwright-mcp-runbook.md`](../finished-goods-workflow/playwright-mcp-runbook.md).

### Hard rules (sign-off)

1. **No status shortcuts:** Do **not** mark Part D Pass by only setting `TransportOrder.status` / `operational_status` in the DB (e.g. force `closed`). Closure must come from **destination Gate-Out (§18)** (admin MCP or the same gate/scale/CC/load services the yard UI uses).
2. **Real yard legs required:** Source §§7–12 (Gate-In → Scale-In → CC → Loading → Scale-Out → Gate-Out) and destination §§13–18 (Gate-In → … → Gate-Out → auto **Closed**) must run. Acceptable execution: Playwright MCP per FG section plans **or** lifecycle helpers that call `create_gate_in` / `create_gate_out` / scale / CC / load-unload services (`run_source_yard` / `run_dest_yard`). Not acceptable: skip yards and jump to Closed.
3. **TO admin validation required:** At each checkpoint below, open `/admin/transport/transportorder/<id>/change/` (or Transport → Transport Orders → row) and assert **status badge / field** matches the expected lifecycle label. Record `to_number` + observed status in RESULTS.
4. **IMEI bind** before live packets; inject GT06 during the trip (move/stop/overspeed; geofence MCP-S↔MCP-D when possible); sync so History has points.

### Preconditions

| Step | Action |
|------|--------|
| 1 | `make seed` if needed; `make seed-mcp-fg RUN_ID=<8hex>` — use manifest POIs/products/vehicle/driver only |
| 2 | Bind IMEI on `MCP-V-<RUN_ID>` (`gps_tracker_id` = packet IMEI) |
| 3 | Execute FG §§1–6 → **Driving Towards Source** (PR→TR→approve→TO→dispatch→Trip Start) |
| 4 | Execute FG §§7–12 source yard → **Driving Towards Destination** |
| 5 | Execute FG §§13–18 dest yard → **Closed** (via dest Gate-Out) |
| 6 | Inject / sync GT06 during legs (before Live GPS history asserts) |
| 7 | After suite: `make wipe-mcp-fg RUN_ID=…` (+ clear Redis IMEI) |

Handles: `fg-mcp-<RUN_ID>.json`, `fg-chain-state.json` / `live-gps-artifacts/fg-gps-<RUN_ID>.json` (`to_number`, vehicle, POIs, checkpoint statuses).

### TO admin checkpoints (must pass before / with Live GPS asserts)

Open TO change page after each stage. Assert displayed status (label or enum) and that `to_number`, vehicle `MCP-V-<RUN_ID>`, origin `MCP-S-…`, dest `MCP-D-…` remain correct.

| Checkpoint ID | After FG section | Expected TO status (admin) | Also check | Status |
|---------------|------------------|----------------------------|------------|--------|
| GPS_LG_TO_01 | §6 Trip Start | **Driving Towards Source** | Trip exists; vehicle/driver assigned | Pass |
| GPS_LG_TO_02 | §7 Source Gate-In | **At Source** | Gate visit / gate-in recorded for source POI | Pass |
| GPS_LG_TO_03 | §10 Loading Completed | **At Source** + sub-state **Loading Completed** (or equivalent) | Source stock movement plausible | Pass |
| GPS_LG_TO_04 | §12 Source Gate-Out | **Driving Towards Destination** | Source gate-out recorded | Pass |
| GPS_LG_TO_05 | §13 Dest Gate-In | **At Destination** | Dest gate-in recorded | Pass |
| GPS_LG_TO_06 | §16 Unloading Completed | **At Destination** + sub-state **Unloading Completed** (or equivalent) | Dest stock ↑ | Pass |
| GPS_LG_TO_07 | §18 Dest Gate-Out | **Closed** (auto — no TP manual Close) | Fleet vehicle **No Active TO**; TO read-only | Pass |

### Live GPS cases (Part D)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| GPS_LG_026 | FG vehicle on Live GPS | After §6+packets (before or during yards): fleet lists `MCP-V-<RUN_ID>` with live position. | P0 | Pass |
| GPS_LG_027 | FG TO on fleet while executing | While TO non-terminal (e.g. after §6 or mid-yard): assert `to_number` on card; status **In-transit** (or matching operational label). Cross-check same `to_number` on TO admin (GPS_LG_TO_01+). | P0 | Pass |
| GPS_LG_028 | History lists FG served TO | After enough GPS history: timeline shows FG `to_number` with `MCP-S-…` → `MCP-D-…`. | P0 | Pass |
| GPS_LG_029 | No active TO gaps around FG TO | Idle before/after TO in range: **No active TO** periods accurate; no overlap with TO window. | P0 | Pass |
| GPS_LG_030 | FG TO activity full detail | Open TO detail: Drive / Stopped / Parked match packets; geofence/dwell when seeded. | P0 | Pass |
| GPS_LG_031 | FG activity ↔ graph ↔ Open TO | Activity aligns with graph; **Open TO** → admin TO with status consistent with latest checkpoint; STARTED / DURATION / DISTANCE plausible. | P0 | Pass |
| GPS_LG_032 | FG overspeed + playback | Overspeed markers if injected; Play/Stop/1x work on that TO history. | P0 | Pass |
| GPS_LG_033 | Post-Closed FG history | **Only after GPS_LG_TO_07 (real §18 Closed):** History still shows served TO; fleet **No Active TO**; TO admin still **Closed**. | P0 | Pass |

---

## Implementation notes (Playwright MCP)

### URLs & APIs

| Item | Value |
|------|--------|
| Page | `/admin/tracking/live-gps/` |
| Live map | `GET /api/v1/tracking/live-map/` |
| TO timeline | `GET /api/v1/tracking/vehicle-to-history/` |
| Chart | `GET /api/v1/tracking/vehicle-history/` |
| Activity | `GET /api/v1/tracking/vehicle-history-summary/` |
| Idle | `vehicle-idle-summary` / `vehicle-idle-history` |
| Geofence | `GET /api/v1/tracking/geofence-events/` |

Prefer fleet/history **DOM** + API checks; map canvas is weak for a11y snapshots. Failures → `tests/e2e/playwright-mcp/live-gps-artifacts/<TC-ID>-failure.png`.

### Suggested run order

| Mode | Cases | When |
|------|-------|------|
| **Fleet smoke** | GPS_LG_001–017 | MCP vehicle + live packets |
| **History core** | GPS_LG_018–025 | Same vehicle with history windows |
| **FG TO checkpoints** | GPS_LG_TO_01–07 | During FG §§6–18; assert on TO admin change page |
| **FG Live GPS** | GPS_LG_026–033 | After IMEI packets; 033 only after GPS_LG_TO_07 Closed |

### Related FG plans

- Full yard/TO chain: [`finished-goods-workflow/README.md`](../finished-goods-workflow/README.md) + [runbook](../finished-goods-workflow/playwright-mcp-runbook.md).
- FG §4 TC01–TC03: Live GPS **page access / RBAC** only — not packet-backed history.

### Known gaps

| Gap | Note |
|-----|------|
| No `make seed-mcp-gps` yet | Use FG vehicle + IMEI bind, or extend seeder before Mode A sign-off |
| FG seeder omits `gps_tracker_id` | Explicit bind required for Part D |
| Send command | Excluded |
| Prior Part D shortcut | 2026-08-04 early runs used force-`closed` / trip-start-only — **invalid** for strengthened Part D |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-04 | **33/33 + 7/7 TO** | Part D re-run with real FG yards (`create_gate_in/out`, scale, CC, load/unload). TO `TO-20260804-0005` Closed via dest Gate-Out. Admin TO change+changelist + Live GPS 026–033. See RESULTS. |
| 2026-08-04 | *(invalidated)* | Earlier Part D used force-`closed` / trip-start-only — superseded by row above. |

---

## ID map (prior chat / FG draft → this plan)

| Prior | This plan |
|-------|-----------|
| LG_GPS_001–009 | GPS_LG_001–009 |
| LG_GPS_010–015 (menu; no Send) | GPS_LG_010–017 |
| LG_GPS_017–024 | GPS_LG_018–025 |
| FG_LG_001–027 (removed from FG §19) | GPS_LG_026–033 (+ Parts A–C) |
| LG_GPS_016 / Send command | **Not tested** |
