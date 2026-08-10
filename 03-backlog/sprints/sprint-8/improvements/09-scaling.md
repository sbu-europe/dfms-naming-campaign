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
