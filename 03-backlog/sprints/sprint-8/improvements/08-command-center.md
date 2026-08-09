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
| [FB-021](#fb-021--cc-queue-list--show-vehicle-scale-in-datetime-product-lines-type--weight) | CC Queue list: show Vehicle, Scale-in Date & Time, Product Lines, Product Type (FG/RM), Weight | High | Open |

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

## FB-021 — CC Queue list: show Vehicle, Scale-in Date & Time, Product Lines, Product Type (FG/RM), Weight

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-09 |
| **Affected Stories** | [CC-01](../../../../05-modules/06-poi-operations/command-center-loading-sprint4.md) (Command Center Queue); FR [5.8 Queue Monitoring](../../../../02-domain/02-requirements/03-functional-requirements/functional-requirements-summary.md) |
| **Closing Sub-tasks** | FB-021-1 — Queue changelist: ensure **Vehicle number** displays for every scaled-in entry · FB-021-2 — Add **Scale-in Date & Time** column (from Scale-In record) · FB-021-3 — Surface **Product line item** details (list and/or row detail) · FB-021-4 — Ensure **Product Type (FG / RM)** is visible (align with Product Classification Type / flow lane) · FB-021-5 — Ensure **Weight** (gross scale-in and/or allocated) is visible and populated · FB-021-6 — Unit / admin smoke coverage for queue list columns |
| **AC Amendment** | **Command Center → Queue** list (and any queue-row detail the operator uses from that list) SHALL show, for each scaled-in vehicle awaiting / in bay assignment: **Vehicle number**, **Scale-in Date & Time**, **Product line item** details, **Product Type (FG / RM)**, and **Weight**. Values SHALL resolve from the linked gate visit / scale-in / TO — not blank “—” when the underlying data exists. |
| **Status** | Open |
| **Priority** | High |
| **Notes** | Today `QueueEntryAdmin.list_display` has Vehicle, Product Classification Type, and Gross Wt (MT), but operators report these details are missing or empty; **Scale-in Date & Time** and **Product line items** are not on the queue list. Prefer fixing data resolution + adding missing columns over a separate screen unless product chooses a detail drawer. Bay Assignment TO panel (`build_cc_assignment_to_details_html`) already has some of this — FR 5.8 requires it on the **Queue** list itself. Urgency Level (also in FR 5.8) is out of scope unless product asks. |

### Improvement observation

On **Command Center → Queue**, the queue list / row details do not reliably show the information CCO needs to prioritize and assign: vehicle number, scale-in date & time, product line items, product type (FG / RM), and weight.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-021) |
|--------|---------|-------------------|
| Vehicle number | Column exists but often not useful / empty for operators | Always show registration from gate visit / vehicle |
| Scale-in Date & Time | Not on Queue list (`waiting_since` ≠ scale-in datetime) | Dedicated **Scale-in Date & Time** from Scale-In |
| Product line items | Not on Queue list | Show line/item summary (or expandable detail) from TO lines |
| Product Type (FG / RM) | Product Classification Type column may be missing/unclear to operators | Clearly show FG / RM (or RM Inbound / FG Outbound) |
| Weight | Gross Wt (MT) column may be empty when scale-in exists | Show scale-in / cargo weight when data exists |

### Closing checklist

- [ ] FB-021-1 — Vehicle number resolved and shown on Queue changelist
- [ ] FB-021-2 — Scale-in Date & Time column added and populated
- [ ] FB-021-3 — Product line item details visible from Queue list
- [ ] FB-021-4 — Product Type (FG / RM) visible and clear
- [ ] FB-021-5 — Weight visible and populated from scale-in / TO
- [ ] FB-021-6 — Tests / admin smoke for the above columns
