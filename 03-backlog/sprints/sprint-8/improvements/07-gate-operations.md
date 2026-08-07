---
title: Sprint 8 Improvements — Gate Operations
module: 07-gate-operations
menu: Gate · Vehicle Entry (Gate-In) · Vehicle Exit (Gate-Out)
parent: ./README.md
---

# Gate Operations

**Admin menu / area:** Gate · Vehicle Entry (Gate-In) · Vehicle Exit (Gate-Out)  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-016](#fb-016--gate-out-form--remove-non-updating-clearance-status-panel) | Gate-Out form: remove non-updating Clearance Status panel | Medium | Resolved |
| [FB-017](#fb-017--gate-in-add--remove-project--from-from-to-snapshot--readonly-project-from-info) | Gate-In add: remove Project / From from TO snapshot; readonly Project From Info | Medium | Resolved |

---

## FB-016 — Gate-Out form: remove non-updating Clearance Status panel

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-07 |
| **Affected Stories** | [GT-01](../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) (Gate-In / Gate-Out) |
| **Closing Sub-tasks** | FB-016-1 — Remove **Clearance status** readonly panel from Gate-Out add/change form · FB-016-2 — Keep submit-time guard-matrix validation and visit-dropdown Ready/Blocked labels |
| **AC Amendment** | The Gate-Out **Add** form SHALL **not** display a **Clearance status** panel that fails to update when a visit session is selected. Clearance readiness remains visible via visit choice labels; clearance checks continue to run on submit. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Panel was a server-rendered readonly field with no client refresh on visit select — always showed “Select an active visit…”. |

### Improvement observation

On **Gate → Vehicle Exit (Gate-Out) → Add**, **Clearance Status** stayed on “Select an active visit to preview clearance checks.” after selecting a visit — misleading UX with no live preview.

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-016) |
|--------|------------------|-------------------|
| Clearance status panel on Gate-Out add | Shown but never updates after visit select | **Removed** |
| Submit-time clearance / guard matrix | Enforced | Unchanged |
| Visit dropdown Ready / Blocked labels | Shown | Unchanged |

### Closing checklist

- [x] FB-016-1 — Clearance status panel removed from GateOutAdmin add/change fields
- [x] FB-016-2 — `create_gate_out` / `validate_guard_matrix` and visit choice labels retained

---

## FB-017 — Gate-In add: remove Project / From from TO snapshot; readonly Project From Info

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-07 |
| **Affected Stories** | [GT-01](../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) (Gate-In / Gate-Out) |
| **Closing Sub-tasks** | FB-017-1 — Remove **Project / From (source)** from Gate-In add TO visit summary snapshot · FB-017-2 — Make **Project From Info** readonly on Gate-In add (still prefilled from TO origin) |
| **AC Amendment** | The Gate-In **Add** form SHALL **not** duplicate origin in the TO visit summary. **Project From Info** remains on the form, is prefilled from the selected transport order origin POI, and is **not editable**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Snapshot showed the same origin already captured by **Project From Info*** — redundant and editable when it should be TO-derived. |

### Improvement observation

On **Gate → Vehicle Entry (Gate-In) → Add**, selecting a TO showed **Project / From (source)** in the visit summary card while the form already had **Project From Info***, which was still editable.

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-017) |
|--------|------------------|-------------------|
| Project / From in TO visit summary | Shown after TO select | **Removed** |
| Project From Info on Gate-In add | Editable text field | **Readonly**; prefilled from TO origin |
| Submit / TO-linked validation | Enforced | Unchanged |

### Closing checklist

- [x] FB-017-1 — Origin row removed from `GateVisitSummaryWidget` / prefill JS
- [x] FB-017-2 — `project_from_info` readonly on Gate-In add; JS/server still set from TO
