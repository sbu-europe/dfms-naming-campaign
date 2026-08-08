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
| [FB-019](#fb-019--yard-ops-to-aligned-labels--allocated-weight-mt-kg) | Yard ops TO-aligned labels + Allocated Weight MT (kg) | Medium | Open |

---

## FB-019 — Yard ops TO-aligned labels + Allocated Weight MT (kg)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-08 |
| **Affected Stories** | [CC-01](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) (Command Center); Loading / Gate / QC TO context panels |
| **Closing Sub-tasks** | FB-019-1 — CC Bay Assignment TO panel: rename labels + Allocated Weight MT (kg) · FB-019-2 — CC Queue list: rename **Flow Lane** column · FB-019-3 — Loading TO summary: rename Flow Lane / Origin POI / Allocated Qty · FB-019-4 — Gate visit summary: rename **Quantity** → **Allocated Weight**; value always MT (kg) · FB-019-5 — QC TO context / widget: **Origin POI** → **Source POI** · FB-019-6 — Shared weight formatter; unit tests for CC / Gate / Loading label+value |
| **AC Amendment** | Yard / Command Center TO context SHALL use TO-aligned labels (**TO Status**, **Product Classification Type**, **TO Sub-Status**, **Source POI**). Summary cargo weight SHALL be labelled **Allocated Weight** and always display `{mt} MT ({kg} kg)` from TO header kg (never line Bags/UOM). Product line tables may still show per-line Alloc. Qty in UOM. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Display / panel formatting only — do not rename DB fields (`flow_lane`, `origin_poi`, `allocated_quantity`, `status`, `sub_state`). Loading today formats header kg as `{} MT` (incorrect); fix to MT (kg). Gate visit card has no Origin POI row (FB-017); quantity label+value is the Gate part of this item. Scaling list **Flow Lane** columns are out of scope unless pulled in later. |

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

- [ ] FB-019-1 — CC Bay Assignment TO panel: five label renames + Allocated Weight MT (kg)
- [ ] FB-019-2 — CC Queue list column: Flow Lane → Product Classification Type
- [ ] FB-019-3 — Loading TO summary: Flow Lane / Origin POI / Allocated Weight MT (kg)
- [ ] FB-019-4 — Gate visit summary: Quantity → Allocated Weight; value always MT (kg)
- [ ] FB-019-5 — QC TO context / widget: Origin POI → Source POI
- [ ] FB-019-6 — Shared (or reused) MT (kg) formatter; unit tests cover CC / Gate / Loading
