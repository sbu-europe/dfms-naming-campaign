---
title: Sprint 8 Improvements — Gate Operations
module: 07-gate-operations
menu: Gate · Vehicle Entry (Gate-In) · Vehicle Exit (Gate-Out) · On-Demand TO
parent: ./README.md
---

# Gate Operations

**Admin menu / area:** Gate · Vehicle Entry (Gate-In) · Vehicle Exit (Gate-Out) · On-Demand TO  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-016](#fb-016--gate-out-form--remove-non-updating-clearance-status-panel) | Gate-Out form: remove non-updating Clearance Status panel | Medium | Resolved |
| [FB-017](#fb-017--gate-in-add--remove-project--from-from-to-snapshot--readonly-project-from-info) | Gate-In add: remove Project / From from TO snapshot; readonly Project From Info | Medium | Resolved |
| [FB-020](#fb-020--on-demand-to-create--optional-gate-in-datetime-option-a) | On-Demand TO create: optional Gate-in date/time (Option A) | High | In Progress |
| [FB-026](#fb-026--dwell-time--show-hms-format-instead-of-minutes-only) | Dwell time: show H.m.s format instead of minutes only | Medium | Resolved |

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

---

## FB-020 — On-Demand TO create: optional Gate-in date/time (Option A)

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-09 |
| **Affected Stories** | [GT-02](../../sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md) (On-Demand TO at gate); related [GT-01](../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) status advance on gate-in |
| **Closing Sub-tasks** | FB-020-1 — Split service: TO-only create vs optional gate-in · FB-020-2 — Admin optional **Gate-in date/time** on On-Demand TO Add · FB-020-3 — API optional `gate_in_at` on dealer/supplier create · FB-020-4 — Unit tests for both branches (created-only vs gated-in) · FB-020-5 — Align [gate-operations-sprint4.md](../../../../05-modules/06-poi-operations/gate-operations-sprint4.md) (§0 / §4.3 / §4.5 / §6.4 / §7.4) with Option A · FB-020-6 — E2E scenario plan + MCP run · FB-020-7 — Option B: deferred gate-in on On-Demand change when TO still `created` |
| **AC Amendment** | On **Gate → On-Demand TO → Add**, **Gate-in date/time** SHALL be **optional**. If empty, the system creates the on-demand Transport Order (and audit row) and leaves `TO.status` = **`created`** with **no** gate visit / gate-in. If filled, the system creates the TO **and** records gate-in at that timestamp in the same submit, then advances status via existing gate-in success rules (**`at_source`** for dealer FG outbound; **`at_destination`** for supplier RM inbound). If created without gate-in, the On-Demand **change** form SHALL allow recording **Gate-in date/time** later (Option B) while the TO remains **`created`** and no visit exists; after deferred gate-in, dealer FG SHALL be **`at_source`**. |
| **Status** | In Progress |
| **Priority** | High |
| **Notes** | **Option A** = decide on create submit. **Option B** = create-now / gate-in-later on the On-Demand change form (same `gate_in_on_demand_to` helper). Still out of scope: showing gate-sourced TOs on normal Gate-In picker; changing supplier post-gate-in target to `at_source`. Default the create field to **empty** (explicit opt-in to gate-in). Module spec updated to **v2.11** ahead of code (spec-first). |

### Improvement observation

Today On-Demand TO create always calls `create_on_demand_to_and_gate_in` → TO + gate-in + status advance in one shot (`gate_in_at=now`). Operators need to create an on-demand TO that can remain **Created** until a gate-in datetime is supplied on the **same** create form.

### Current vs expected behaviour

| Aspect | Current (before) | Expected (FB-020 / Option A) |
|--------|------------------|------------------------------|
| Create always gate-ins | Yes (`timezone.now()`) | Only if **Gate-in date/time** is filled |
| TO status after create (no datetime) | N/A (always gated) | **`created`** |
| TO status after create (with datetime) | `at_source` / `at_destination` | Same, using provided `gate_in_at` |
| `gate_visit_sessions` / `gate_ins` | Always written | Only when datetime filled |
| `GateOnDemandTORequest.gate_visit_session` | Always set | Null when TO-only; set when gated |
| On-Demand change after create | Read-only | If still `created` / no visit: editable **Gate-in** (Option B); else read-only |
| Normal Gate-In picker | Excludes `source=GATE` | Unchanged |

### UX (admin)

- Menu: **Gate → On-Demand TO → Add** (`/admin/operations/gateondemandtorequest/add/`)
- New field: **Gate-in date/time** (`DateTimeField`, optional)
- Help text (suggested): *Leave blank to create the TO only (status Created). Fill to record gate-in and move the TO into the yard.*
- Success messages:
  - No datetime → `On-demand TO {n} created.`
  - With datetime → `On-demand TO {n} created and gate-in recorded.`
- Field default: **empty** (do not auto-fill `now` unless product later asks)

### Implementation plan — what to change

#### 1. Service layer (`apps/operations/gate/gate_services.py`)

| Change | Detail |
|--------|--------|
| Split `create_on_demand_to_and_gate_in` | Extract **`create_on_demand_to(...)`**: validate lines, create `TransportOrder` (`status=created`, `source=GATE`, …), bulk line items, set `requires_qc`, `record_transition` → created, create `GateOnDemandTORequest` with **`gate_visit_session=null`**. |
| Gate-in helper | Extract **`gate_in_on_demand_to(to, *, gate_in_at, actor, …)`**: call existing `create_gate_in(..., gate_in_at=gate_in_at, skip_to_eligibility=True, …)` so status uses `record_gate_in_status` + `GATE_IN_SUCCESS_TO_STATUS` (FG → `at_source`, RM → `at_destination`). |
| Orchestrator | Keep a thin `create_on_demand_to_and_gate_in(..., gate_in_at=None)` (or rename callers): `to, row = create_on_demand_to(...)`; **if** `gate_in_at`: run gate-in, link `row.gate_visit_session`, save; else return `gate_in=None`. Single `@transaction.atomic`. |
| Return type | `(TransportOrder, GateIn \| None, GateOnDemandTORequest)` — callers must handle `gate_in is None`. |

Do **not** invent new status rules; reuse existing gate-in success maps.

#### 2. Admin form + ModelAdmin

| File | Change |
|------|--------|
| `apps/operations/gate/forms.py` | On `GateOnDemandTOAdminForm`, add optional non-model `gate_in_at = forms.DateTimeField(required=False, …)`. Pass through `cleaned_data` (no model column required). |
| `apps/operations/gate/admin.py` | Add `gate_in_at` to **ADD_FIELDSETS** (e.g. Vehicle / Gate-in section). In `save_model`, pass `cleaned.get("gate_in_at")` into the orchestrator. Branch success `messages`. Keep `if change: return` (read-only after create). |
| Template | Usually no change; use Django admin datetime widget. Update `change_form.html` only if help text / layout needs it. |

#### 3. REST API (parity)

| File | Change |
|------|--------|
| `apps/operations/gate/serializers.py` | Optional `gate_in_at` on `DealerOnDemandTOSerializer` and `SupplierOnDemandTOSerializer` (`DateTimeField`, `required=False`, `allow_null=True`). |
| `apps/operations/gate/views_sprint4.py` | Pass `gate_in_at` into orchestrator; response may omit visit / note when TO-only. |

#### 4. Tests

| Area | Cases |
|------|--------|
| Service | No `gate_in_at` → TO `created`, no `GateIn` / active session, request `gate_visit_session` null |
| Service | With `gate_in_at` → `GateIn.gate_in_at` matches; dealer → `at_source`; supplier → `at_destination` |
| Form | Field optional; valid datetime accepted |
| Regression | Active-visit / plate checks run only when gate-in path executes |

Suggested locations: extend `tests/unit/test_operations/test_gate_on_demand_form.py`; add/extend service tests for the split orchestrator.

#### 5. Product / module docs

| File | Change |
|------|--------|
| [`gate-operations-sprint4.md`](../../../../05-modules/06-poi-operations/gate-operations-sprint4.md) | **v2.11** — optional `gate_in_at` in §0 wizard, §4.0 exemption, §4.3 flow + status table, §4.5 note, §6.4 admin fieldsets/`save_model`, §7.4 API body/responses (**done in tracker prep**; keep in sync if impl diverges) |
| Admin `change_form.html` help | Update “create TO and gate-in in one step” copy to match optional gate-in |

#### 6. Explicitly out of scope (other)

- Including `source=GATE` + `created` TOs in normal Gate-In admin picker
- Changing supplier post-gate-in status from `at_destination` to `at_source`
- Auto-defaulting the datetime widget to `now` (unless product revises Notes)

### Closing checklist

- [x] FB-020-1 — Service split: TO-only create + optional `gate_in_on_demand_to`; orchestrator accepts `gate_in_at=None`
- [x] FB-020-2 — Admin Add: optional **Gate-in date/time**; messages; empty default; help-text update
- [x] FB-020-3 — API: optional `gate_in_at` on dealer/supplier on-demand create
- [x] FB-020-4 — Unit tests for created-only vs gated-in branches (dealer + supplier status targets)
- [x] FB-020-5 — Module spec `gate-operations-sprint4.md` v2.11 Option A wording (§0 / §4.0 / §4.3 / §4.5 / §6.4 / §7.4)
- [ ] FB-020-6 — E2E: [fb-020-on-demand-to-optional-gate-in-e2e-scenarios.md](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-020-on-demand-to-optional-gate-in-e2e-scenarios.md) + MCP RESULTS after impl
- [x] FB-020-7 — Option B: deferred gate-in on On-Demand change (Created + no visit) → dealer FG **`at_source`**

### Implementation order

1. Module spec align (FB-020-5) — **done**  
2. Service split + unit tests (FB-020-1, FB-020-4) — **done**  
3. Admin field + messages + help text (FB-020-2) — **done**  
4. API field (FB-020-3) — **done**  
5. Smoke both paths on `/admin/operations/gateondemandtorequest/add/`  
6. E2E MCP suite (FB-020-6)

---

## FB-026 — Dwell time: show H.m.s format instead of minutes only

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-10 |
| **Affected Stories** | [GT-01](../../sprint-4/04-gate/GT-01-gate-in-out-remarks.md) (Gate visit dwell); related [GPS-04](../../sprint-6/02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md) (TO Planned / Gate / Geofence dwell matrix) |
| **Closing Sub-tasks** | FB-026-1 — Compute dwell with second precision (not `// 60` only) · FB-026-2 — Shared formatter: display as **H.m.s** (hours.minutes.seconds) · FB-026-3 — Gate Visit list / CSV / visit API `dwell_time_display` use H.m.s · FB-026-4 — TO dwell timeline matrix (`dwell_display`) use same H.m.s · FB-026-5 — Unit tests for formatter edge cases (0s, sub-hour, multi-hour) |
| **AC Amendment** | Dwell time SHALL be shown in **H.m.s** format (hours.minutes.seconds), e.g. `1.05.30` for 1 hour 5 minutes 30 seconds. Surfaces that today show minutes-only (or “X hours Y minutes” / `{n} min`) SHALL use this format. Numeric minutes fields (e.g. API `dwell_time_minutes`) may remain for consumers that need a minute value. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Shared helpers in `apps/operations/gate/dwell.py`: `compute_dwell_seconds`, `format_dwell_hms` → `H.MM.SS` (zero-padded minutes/seconds, e.g. `1.05.30`). Gate Visit list/CSV/API display use seconds; `dwell_time_minutes` unchanged. TO dwell matrix uses the same formatter (timestamp delta when both ends exist). |

### Improvement observation

Dwell time is shown in minutes format only. Operators need **H.m.s** so short and long dwells are readable with second-level detail.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-026) |
|--------|---------|-------------------|
| Gate Visit list **Dwell time** | “45 minutes” / “2 hours 5 minutes” | **H.m.s** (e.g. `0.45.12`, `2.05.00`) |
| Gate visit CSV / API `dwell_time_display` | Same minutes wording | Same **H.m.s** |
| TO Planned Milestones dwell cells | `{n} min` | Same **H.m.s** |
| Precision | Whole minutes (`total_seconds() // 60`) | Include seconds |

### Closing checklist

- [x] FB-026-1 — Second-precision dwell duration from gate-in → gate-out (or now)
- [x] FB-026-2 — Shared **H.m.s** display formatter
- [x] FB-026-3 — Gate Visit list / CSV / `dwell_time_display` use H.m.s
- [x] FB-026-4 — TO dwell timeline matrix `dwell_display` use H.m.s
- [x] FB-026-5 — Unit tests for formatter (zero, sub-hour, multi-hour)
