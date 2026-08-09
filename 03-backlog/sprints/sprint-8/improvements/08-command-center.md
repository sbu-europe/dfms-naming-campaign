---
title: Sprint 8 Improvements — Command Center
module: 08-command-center
menu: Command Center · Queue · Bay Assignment (CCO)
parent: ./README.md
---

# Command Center

**Admin menu / area:** Command Center · Queue · Bay Assignment (Command Center Officer)  
**Also in scope:** Loading TO summary · Gate visit quantity · QC TO context  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-019](#fb-019--yard-ops-to-aligned-labels--allocated-weight-mt-kg) | Yard ops TO-aligned labels + Allocated Weight MT (kg) | Medium | Resolved |
| [FB-021](#fb-021--cc-queue-change-form--show-vehicle-scale-in-datetime-product-lines-type--weight) | CC Queue change form: Vehicle, Scale-in Date & Time, Product Lines, Product Type (FG/RM), Weight | High | Resolved |

---

## FB-019 — Yard ops TO-aligned labels + Allocated Weight MT (kg)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-08 |
| **Affected Stories** | [CC-01](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) (Command Center); Loading / Gate / QC TO context panels |
| **Closing Sub-tasks** | FB-019-1 — CC Bay Assignment TO panel: rename labels + Allocated Weight MT (kg) · FB-019-2 — CC Queue list: rename **Flow Lane** column · FB-019-3 — Loading TO summary: rename Flow Lane / Origin POI / Allocated Qty · FB-019-4 — Gate visit summary: rename **Quantity** → **Allocated Weight**; value always MT (kg) · FB-019-5 — QC TO context / widget: **Origin POI** → **Source POI** · FB-019-6 — Shared weight formatter; unit tests for CC / Gate / Loading label+value |
| **AC Amendment** | Yard / Command Center TO context SHALL use TO-aligned labels (**TO Status**, **Product Classification Type**, **TO Sub-Status**, **Source POI**). Summary cargo weight SHALL be labelled **Allocated Weight** and always display `{mt} MT ({kg} kg)` from TO header kg (never line Bags/UOM). Product line tables may still show per-line Alloc. Qty in UOM. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Display / panel formatting only — do not rename DB fields (`flow_lane`, `origin_poi`, `allocated_quantity`, `status`, `sub_state`). Shared helper: `apps/transport/display_weight.py` → `format_allocated_weight_mt_kg`. Loading kg-as-MT mislabel fixed. Gate visit card has no Origin POI row (FB-017). Scaling list **Flow Lane** columns remain out of scope. |

### Improvement observation

Command Center, Loading, Gate, and QC still use TLS / yard wording (**Flow Lane**, **Origin POI**, **Allocated qty** / **Quantity**) and sometimes mix line UOM into the summary quantity. Operators expect TO-aligned labels and a consistent **Allocated Weight** in MT (kg).

### Current vs expected behaviour

#### A. Command Center — Bay Assignment TO details panel

`build_cc_assignment_to_details_html` (`apps/operations/command_center/admin_assignment_details.py`)

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| TLS status | **TLS status** | **TO Status** |
| Flow lane | **Flow lane** | **Product Classification Type** (RM Inbound / FG Outbound) |
| Yard sub-state | **Yard sub-state** | **TO Sub-Status** |
| Origin POI | **Origin POI** | **Source POI** |
| Allocated qty | Line UOM (single) or `kg` (multi) | **Allocated Weight** = `{mt} MT ({kg} kg)` from header kg |
| Product Lines `Alloc. Qty` | Per-line UOM | Unchanged |

#### B. Command Center — Queue list

`QueueEntryAdmin.flow_lane_badge` (`apps/operations/command_center/admin.py`)

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| Column header | **Flow Lane** | **Product Classification Type** |
| Cell badge text | RM Inbound / FG Outbound | Unchanged |

#### C. Loading — TO summary on load/unload forms

`apps/operations/loading/admin.py` summary rows

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| Flow Lane | **Flow Lane** | **Product Classification Type** |
| Origin POI | **Origin POI** | **Source POI** |
| Allocated Qty (TO) | `{kg} MT` (header kg mislabelled as MT) | **Allocated Weight** = `{mt} MT ({kg} kg)` |

#### D. Gate — Visit summary (TO select)

`GateVisitSummaryWidget` + `_quantity_label_from_to` (`apps/operations/gate/`)

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| Field label | **Quantity** | **Allocated Weight** |
| Value | Single line → Bags/UOM; else `kg` | Always `{mt} MT ({kg} kg)` from header kg |
| Origin POI on card | Not shown (FB-017) | N/A — no change |

#### E. QC — TO context panel / prefill widget

`apps/quality/checkpoint/admin.py` · `widgets.py`

| Aspect | Current | Expected (FB-019) |
|--------|---------|-------------------|
| Origin POI | **Origin POI** | **Source POI** |

### Closing checklist

- [x] FB-019-1 — CC Bay Assignment TO panel: five label renames + Allocated Weight MT (kg)
- [x] FB-019-2 — CC Queue list column: Flow Lane → Product Classification Type
- [x] FB-019-3 — Loading TO summary: Flow Lane / Origin POI / Allocated Weight MT (kg)
- [x] FB-019-4 — Gate visit summary: Quantity → Allocated Weight; value always MT (kg)
- [x] FB-019-5 — QC TO context / widget: Origin POI → Source POI
- [x] FB-019-6 — Shared (or reused) MT (kg) formatter; unit tests cover CC / Gate / Loading

---

## FB-021 — CC Queue change form: show Vehicle, Scale-in Date & Time, Product Lines, Product Type (FG/RM), Weight

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-09 |
| **Affected Stories** | [CC-01](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) (Command Center Queue); FR [5.8 Queue Monitoring](../../../../02-domain/02-requirements/03-functional-requirements/functional-requirements-summary.md) |
| **Closing Sub-tasks** | FB-021-1 — Queue **change form**: readonly **Visit / cargo details** panel · FB-021-2 — Panel shows **Vehicle number** (gate → TO → vendor fallbacks) · FB-021-3 — Panel shows **Scale-in Date & Time** from Scale-In · FB-021-4 — Panel shows **Product Type (FG/RM)** + **Product Lines** table · FB-021-5 — Panel shows **Gross weight scale-in (MT)** (+ existing Allocated Weight) · FB-021-6 — Unit tests for shared panel + QueueEntryAdmin field |
| **AC Amendment** | **Command Center → Queue → change** SHALL show a readonly **Visit / cargo details** panel with **Vehicle number**, **Scale-in Date & Time**, **Product Type (FG/RM)**, **Gross weight scale-in (MT)**, and **Product Lines**. Values resolve from gate visit / scale-in / TO. Changelist columns are unchanged. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Reuses `build_cc_assignment_to_details_html` (also Bay Assignment add). Shared panel labels: **Vehicle number**, **Scale-in Date & Time**, **Product Type (FG/RM)** (was Product Classification Type / Vehicle (gate) on that panel). Product Lines include **Total Weight** as `{mt} MT ({kg} kg)` via `TOLineAllocationService.line_total_kg`. Urgency Level still out of scope. |

### Improvement observation

On **Command Center → Queue**, opening a queue entry did not show the visit/cargo context CCO needs: vehicle number, scale-in date & time, product line items, product type (FG / RM), and weight.

### Current vs expected behaviour

| Aspect | Before | After (FB-021) |
|--------|--------|----------------|
| Where shown | Sparse change form (FKs/status only) | Readonly **Visit / cargo details** on Queue change form |
| Vehicle number | Not on change form | Panel row + gate/TO/vendor fallbacks |
| Scale-in Date & Time | Missing | Panel row from `ScaleIn.scale_in_at` |
| Product line items | Missing | Same Product Lines table as Bay Assignment |
| Product Type (FG / RM) | Missing on change form | Panel **Product Type (FG/RM)** + flow-lane badge |
| Weight | Missing on change form | Gross scale-in MT (+ Allocated Weight already in panel) |
| Queue list columns | Unchanged | Unchanged (no new list columns) |

### Closing checklist

- [x] FB-021-1 — Queue change form: Visit / cargo details panel
- [x] FB-021-2 — Vehicle number with fallbacks
- [x] FB-021-3 — Scale-in Date & Time on shared panel
- [x] FB-021-4 — Product Type (FG/RM) + Product Lines
- [x] FB-021-5 — Gross weight scale-in (MT)
- [x] FB-021-6 — Unit tests (panel + QueueEntryAdmin)
