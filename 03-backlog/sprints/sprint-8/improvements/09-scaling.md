---
title: Sprint 8 Improvements — Scaling
module: 09-scaling
menu: Scaling · Scale-In · Scale-Out
parent: ./README.md
---

# Scaling

**Admin menu / area:** Scaling · Scale-In · Scale-Out  
**Also in scope:** Gate Pass · Queue Token print · CC / QC scale-in weight display  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-022](#fb-022--scale-inout--kg-input--listnet-display-as-mt-kg-option-a) | Scale-In/Out: kg input + list/net display as MT (kg) (Option A) | Medium | Resolved |
| [FB-024](#fb-024--scale-inout--empty-vehicle-on-both--scale-out-list-indicators) | Scale-In/Out: empty vehicle on both + Scale-Out list indicators | Medium | Resolved |

---

## FB-022 — Scale-In/Out: kg input + list/net display as MT (kg) (Option A)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-10 |
| **Affected Stories** | [SC-01](../../../../05-modules/06-poi-operations/scaling-operations-sprint4.md) (Scale-In / Scale-Out); related CC / Gate Pass / Queue Token / QC weight display |
| **Closing Sub-tasks** | FB-022-1 — Shared `kg_to_mt` / `mt_to_kg` / `format_weight_mt_kg_from_mt` helpers · FB-022-2 — Scale-In / Scale-Out **Add**: **Weight (kg)** input; convert ÷1000 into existing `*_mt` columns · FB-022-3 — List / change / net / success message show `{mt} MT ({kg} kg)` · FB-022-4 — Gate Pass + Queue Token print same format · FB-022-5 — CC gross scale-in + QC scale-in display same format · FB-022-6 — API dual-accept `*_kg` (preferred) or `*_mt` · FB-022-7 — Unit tests for conversion + display |
| **AC Amendment** | **Scaling → Scale-In / Scale-Out → Add** SHALL accept weighbridge weight in **kilograms**. Values SHALL be stored in existing `scale_in_weight_mt` / `scale_out_weight_mt` / `net_weight_mt` (MT, 3 dp). Changelist, change form, absolute **Net Weight**, Gate Pass, Queue Token, and CC/QC scale-in weight surfaces SHALL display `{mt} MT ({kg} kg)`. Net remains `abs(scale_in − scale_out)` in MT. No DB column rename (Option A). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Reuses FB-019 style via `apps/transport/display_weight.py`. Admin field id is `#id_weight_kg`. API: `scale_in_weight_kg` / `scale_out_weight_kg` preferred; legacy `*_mt` still accepted. Stock / TO allocated_quantity unchanged. |

### Improvement observation

Operators enter weighbridge readings in **kg**, but Scale-In / Scale-Out forms asked for **MT**, and list/net/print screens showed bare MT numbers. Yard UX should match other cargo weight surfaces: input kg, display **`x MT (y kg)`**.

### Current vs expected behaviour

| Aspect | Before | After (FB-022) |
|--------|--------|----------------|
| Scale-In / Scale-Out Add input | **Weight (MT)** → stored MT | **Weight (kg)** → ÷1000 → stored MT |
| List / change weight columns | Raw MT (e.g. `18.200`) | `18.200 MT (18,200 kg)` |
| Net Weight | Raw MT (absolute) | Absolute net as `{mt} MT ({kg} kg)` |
| Gate Pass / Queue Token | Raw MT labels | Same MT (kg) format |
| CC gross scale-in / QC | Raw MT | Same MT (kg) format |
| API | `*_mt` only | `*_kg` preferred; `*_mt` still accepted |
| DB columns | `*_mt` | Unchanged (Option A) |

### Closing checklist

- [x] FB-022-1 — Shared kg↔MT helpers + `format_weight_mt_kg_from_mt`
- [x] FB-022-2 — Scale-In / Scale-Out Add: Weight (kg) → MT storage
- [x] FB-022-3 — List / change / net / success message: MT (kg)
- [x] FB-022-4 — Gate Pass + Queue Token print: MT (kg)
- [x] FB-022-5 — CC gross scale-in + QC scale-in display: MT (kg)
- [x] FB-022-6 — API dual-accept `*_kg` / `*_mt`
- [x] FB-022-7 — Unit tests (conversion + display / CC / queue token)

---

## FB-024 — Scale-In/Out: empty vehicle on both + Scale-Out list indicators

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-10 |
| **Affected Stories** | [SC-01](../../../../05-modules/06-poi-operations/scaling-operations-sprint4.md) (Scale-In / Scale-Out) |
| **Closing Sub-tasks** | FB-024-1 — `ScaleOut.is_empty_vehicle` column + migration · FB-024-2 — Scale-Out **Add**/change: **Empty vehicle** checkbox (parity with Scale-In) · FB-024-3 — Scale-Out list: indicate Scale-In empty and Scale-Out empty · FB-024-4 — Service + API accept `is_empty_vehicle` on scale-out |
| **AC Amendment** | Either weighing MAY be an empty vehicle (source: empty in / loaded out; destination: loaded in / empty out). **Scale-In** and **Scale-Out** Add forms SHALL each expose an independent **Empty vehicle** flag. **Scale-Out** changelist SHALL show whether Scale-In was empty and/or Scale-Out was empty. Net weight remains `abs(scale_in − scale_out)`; empty flags are operator documentation only (no mutual exclusion). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Scale-In already had `is_empty_vehicle`. Scale-Out previously had no flag and list showed neither side’s empty state. |

### Improvement observation

Empty vehicle could only be marked on Scale-In. At destination the empty weighing is Scale-Out; operators had no way to record that, and the Scale-Out list gave no empty indication for either weighing.

### Current vs expected behaviour

| Aspect | Before | After (FB-024) |
|--------|--------|----------------|
| Scale-In Add empty checkbox | Present | Unchanged |
| Scale-Out Add empty checkbox | Missing | **Empty vehicle** on add + change |
| ScaleOut DB / API | No flag | `is_empty_vehicle` (default False); API accepts same |
| Scale-Out list | Weights only | **Empty (In)** + **Empty (Out)** columns |

### Closing checklist

- [x] FB-024-1 — `ScaleOut.is_empty_vehicle` + migration
- [x] FB-024-2 — Scale-Out admin Add/change: Empty vehicle checkbox
- [x] FB-024-3 — Scale-Out list: Empty (In) / Empty (Out) indicators
- [x] FB-024-4 — `ScaleOutService` + Scale-Out API wire `is_empty_vehicle`
