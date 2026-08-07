---
title: Sprint 8 Improvements — Gate Operations
module: 07-gate-operations
menu: Gate · Vehicle Exit (Gate-Out)
parent: ./README.md
---

# Gate Operations

**Admin menu / area:** Gate · Vehicle Exit (Gate-Out)  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-016](#fb-016--gate-out-form--remove-non-updating-clearance-status-panel) | Gate-Out form: remove non-updating Clearance Status panel | Medium | Resolved |

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
