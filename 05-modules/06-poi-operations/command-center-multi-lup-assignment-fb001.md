---
module: 06-poi-operations
specification: Command Center — Multiple L/U Point Assignment per Visit (Sprint 6 — FB-001)
version: 1.6
phase: Phase 1
sprint: Sprint 6 (FB-001)
last_updated: 2026-06-24
changelog: "v1.6 — §3.2 and §9.2 amended to match shipped implementation: multi-row LUP formset on BayAssignment add form, batch save via Save assignments, extended cc_queue_entry_details.js (add/remove rows, cross-row LUP exclusion, traffic on select); §15 TODOs reconciled with code. v1.5 — §15 Implementation TODOs added. v1.4 — §9.2.2 design consistency. v1.3 — §3/§9 repeatable form UX detail. v1.0 — Initial FB-001 plan."
related_stories: CC-01 (amendment), LD-01 (minimal hook only), QC-01 (resample side effects)
feedback_items: FB-001
supersedes: command-center-loading-sprint4.md §1.2 (BayAssignment OneToOne), §3.5 (one assignment per visit), §8 (duplicate assignment rule)
baseline_spec: command-center-loading-sprint4.md
feedback_tracker: ../../03-backlog/sprints/sprint-6/feedback-resolution.md
jira_epic: DFS-072
---

# Command Center — Multiple Loading/Unloading Point Assignment (FB-001)

## Overview

This document is the **Sprint 6 implementation plan** for [FB-001](../../03-backlog/sprints/sprint-6/feedback-resolution.md#fb-001--multiple-loadingunloading-point-assignments-per-to-visit). It amends the baseline [Command Center, Loading/Unloading & QC Operations (Sprint 4)](./command-center-loading-sprint4.md) specification.

**Problem (Sprint 6 demo):** After scale-in, the Command Center Officer (CCO) could assign a vehicle to **only one** loading or unloading point per yard visit. Operational reality at large sites requires the CCO to assign **as many distinct points as needed** for one TO at the POI.

**Solution (FB-001 scope):** Extend **CC-01** so the CCO can create **one or more** `BayAssignment` rows per `QueueEntry` (one scale-in visit), each to a **distinct** `LoadingUnloadingPoint` — including **multiple points in one admin submit** via the multi-row add form. Everything downstream continues to work **one assignment at a time** using the existing LD-01 flow.

### Scope boundary

| In scope (FB-001) | Out of scope / unchanged |
|-------------------|--------------------------|
| CC can assign multiple L/U points per TO visit at the POI | Redesign of LD admin screens or start/complete UX |
| Repeatable **Assign / Add point** on CC queue; **multi-row batch assign** on Bay Assignment add form | New load/unload fields, forms, or capture rules |
| `BayAssignment.queue_entry` OneToOne → ForeignKey + unique `(visit, LUP)` | Auto-split of weight/bags across points |
| CC queue shows visit until all assigned points are done | REST/mobile LD two-step (still deferred) |
| Minimal visit-level hooks so first point complete does **not** close the whole visit | Changing how crew pick LUP → queue table → `bay_assignment` |
| Scale-out / gate-out guards aligned with “all points complete” | `LoadingUnloadingPoint.capacity` |

### Loading / unloading completion flow — unchanged

The **current LD-01 per-assignment flow is not redesigned.** For each `BayAssignment` the crew already use ([command-center-loading-sprint4.md](./command-center-loading-sprint4.md) §4.0, §11.9):

1. **Start** — Load/Unload Event → Add: select LUP → serial-ordered queue table → click row → set `bay_assignment` → enter start datetime → Save → `LDService.start_loading` / `start_unloading`.
2. **Complete** — open the same event on change form: enter end datetime, bags/weight/seal (load) or bags/weight (unload) → Save → `LDService.complete_loading` / `complete_unloading`.

That UX, fieldset layout, templates, and **per-assignment** service behaviour (validate times, create/update `LoadEvent` / `UnloadEvent`, emit `loading_started` / `unloading_started` on start) **stay as shipped in Sprint 4 / Sprint 5.**

FB-001 adds **no new LD steps** and **no new LD screens.** Crew simply see **more rows** at different LUPs when CC has assigned the same TO to multiple points.

The **only** LD-touching code changes are **internal hooks** (see §4.2) so that completing one assignment does not incorrectly mark the entire visit complete while other CC assignments are still open. Those hooks do not change what the loading/unloading operator does in admin.

### Distinction from FB-005

| | FB-005 (Sprint 5 — resolved) | FB-001 (Sprint 6 — this doc) |
|---|---|---|
| Cardinality | Many **vehicles** → **one** L/U point | **One vehicle** → many **L/U points** |
| Primary module | CC + LD (serial/concurrency) | **CC-01** (multi-assign) |
| LD flow | Unchanged | **Unchanged** (per assignment) |

### Locked product decisions (2026-06-23)

| Topic | Decision |
|-------|----------|
| Completion order | **Any order** — crew may finish points in any sequence |
| Parallel work | **No** — at most **one** open Load/Unload event per visit at a time (service validation on start only; LD UX unchanged) |
| Same point twice | **No** — one assignment per `(queue_entry, loading_unloading_point)` |
| RM resample / override-fail | **Cancel all** active assignments for the visit |
| QC gate (RM inbound) | After QC Pass only; CC may assign **one or many** unload points before any unloading starts |

**Primary module path:** `apps/operations/command_center/`  
**Minimal touch paths:** `apps/operations/loading/services.py` (visit-aware complete hook), `apps/operations/scaling/services.py`, `apps/operations/gate/clearance.py`, `apps/quality/checkpoint/` (resample cancel-all)

---

## 0. Yard chain — what changes vs what stays

```
Scale-In → QueueEntry                    [unchanged]
  └─► QC (RM, when required)             [unchanged]
  └─► CC assign point(s)                 [FB-001: multi-row batch + repeat queue entry]
        └─► BayAssignment + WaitingSerial per distinct LUP

LD start / complete per assignment       [unchanged UX & per-assignment flow]
  └─► Same LUP → queue table → bay_assignment → start → complete

Visit leg complete / scale-out / gate-out  [minimal hook: all CC assignments done]
```

---

## 1. Data model amendments (CC-01)

### 1.1 BayAssignment — OneToOne → ForeignKey

**Baseline (Sprint 4):** `BayAssignment.queue_entry` is OneToOne — one assignment per visit.

**FB-001:**

```python
BayAssignment(TenantAwareModel) {
    # CHANGED: OneToOneField → ForeignKey
    queue_entry: FK → QueueEntry (related_name='bay_assignments')

    transport_order: FK → TransportOrder          # unchanged
    loading_unloading_point: FK → LoadingUnloadingPoint  # unchanged
    assigned_by: FK → User
    assigned_at: DateTime
    is_active: boolean (default True)             # per assignment (FB-005 semantics unchanged)
    cancelled_at, cancelled_by, cancellation_reason  # unchanged
}
```

**New constraint:**

```python
UniqueConstraint(
    fields=["queue_entry", "loading_unloading_point"],
    name="uq_bay_assignment_queue_entry_lup",
)
```

**Migration:** Alter field + add constraint. Existing 1:1 rows migrate without data loss.

### 1.2 QueueEntry — status semantics (amended)

| Status | Meaning (FB-001) |
|--------|------------------|
| `waiting` | No assignments yet, or visit re-opened after QC resample |
| `assigned` | ≥1 `BayAssignment`; not all assignments fully completed |
| `completed` | All non-cancelled assignments for the visit have completed load/unload events |

### 1.3 Models unchanged

- `WaitingSerial`, `WaitingSerialSequence` — one serial per assignment (FB-005).
- `LoadEvent`, `UnloadEvent` — still FK to **one** `BayAssignment`; one start/complete lifecycle per assignment ([command-center-loading-sprint4.md](./command-center-loading-sprint4.md) §1.4–1.5).
- No new planning/aggregate models.

---

## 2. Visit completion helpers (CC service — supports multi-assign)

Add to `apps/operations/command_center/services.py`:

| Helper | Purpose |
|--------|---------|
| `assignments_for_visit(queue_entry)` | All `BayAssignment` rows for visit |
| `assignment_is_complete(assignment)` | Completed `LoadEvent` or `UnloadEvent` on this assignment |
| `all_assignments_complete_for_visit(queue_entry)` | Every non-cancelled assignment complete; ≥1 assignment exists |
| `visit_has_work_in_progress(queue_entry)` | Any assignment on visit has open Load/Unload event (for start validation only) |

Used by CC assign eligibility, the LD complete hook (§4.2), scale-out, and gate-out — **not** to replace LD start/complete logic.

---

## 3. CC-01 — primary implementation (FB-001)

This section is the **main deliverable.**

### 3.1 Queue dashboard

**Baseline:** List `status=waiting` only; vehicle leaves queue after first assign.

**FB-001:**

```
CC Officer opens Command Center → Queue
  └─► List QueueEntry where status IN ('waiting', 'assigned'), poi=officer's POI
        ├─► Columns: Serial, Token, TO, Vehicle, Flow Lane, Assignments (e.g. 1/2 done), Status
        ├─► [Assign first point] when status=waiting and eligible
        ├─► [Add loading/unloading point] when status=assigned and not all complete
        └─► Row drops when status=completed (all points done)
```

**QC rows:** Unchanged — Awaiting QC when `requires_qc` and QC not passed.

#### 3.1.1 Assignments progress column

New `list_display` column: `assignments_progress` — computed from the visit's `bay_assignments` queryset.

```
total  = visit.bay_assignments.filter(is_active=True).count()   # excludes cancelled
done   = [a for a in active if assignment_is_complete(a)]
display: "{done}/{total} done"   (e.g. "0/1 done", "1/2 done", "2/2 done")
```

When `total == 0` (status=waiting, no assignments yet): show `—`.

#### 3.1.2 Per-row action column (`cc_actions`)

Replace current single "Assign bay" link with conditional actions:

| Visit state | Action shown | Link target |
|-------------|-------------|-------------|
| `waiting`, eligible (QC OK or no QC) | **Assign loading/unloading point** | `/admin/operations/bayassignment/add/?queue_entry={pk}` |
| `assigned`, not all complete | **Add loading/unloading point** | `/admin/operations/bayassignment/add/?queue_entry={pk}` |
| `assigned`, eligible + QC pending (RM) | Awaiting QC badge — no assign link | — |
| `completed` | Row absent from changelist | — |

Both "Assign" and "Add" resolve to the **same `BayAssignmentAdmin` add URL** with `?queue_entry=<pk>`. The label differs ("Assign" vs "Add") but the add page is the same. The form detects whether the visit is `waiting` or `assigned` to switch helper copy (see §3.2.6).

### 3.2 Bay assignment add form — multi-row batch assign (implemented)

The existing `BayAssignmentAdmin` add form (`/admin/operations/bayassignment/add/`) is reused for first and subsequent assignments. **As implemented**, the CCO can assign **one or more distinct LUPs in a single submit** using repeatable rows — not only one point per save.

#### 3.2.1 Entry points

| Trigger | How |
|---------|-----|
| First assignment | CCO clicks "Assign loading/unloading point" on a `waiting` queue entry row |
| Additional assignment | CCO clicks "Add loading/unloading point" on an `assigned` queue entry row (opens same form; may add more points in one batch or one at a time across visits) |
| Direct URL (deep-link) | `/admin/operations/bayassignment/add/?queue_entry=<pk>` — pre-fills TO and shows panels immediately on load |

Pre-filling via `?queue_entry=<pk>` uses Sprint 4 `get_changeform_initial_data` (unchanged).

#### 3.2.2 Transport order (`queue_entry`) select widget

**Baseline (Sprint 4):** queryset filtered to `status=waiting` only.

**FB-001:** `CCService.bay_assignable_queue_entries()` returns `status IN (waiting, assigned)` where the visit is not fully complete. The select widget queryset is updated in `formfield_for_foreignkey`.

- When opened from the queue changelist, the TO is pre-filled; CCO rarely changes it manually.
- When the CCO changes the TO select, AJAX reloads the TO summary panel, rebuilds **all** LUP row dropdowns (via `queue-entry-lups/`), and clears traffic until a row is selected.

The main `ModelForm` on add exposes only `queue_entry` in fieldsets; `loading_unloading_point` is removed from the parent form via `get_form` patch.

#### 3.2.3 Loading / unloading point — repeatable formset rows

**Baseline:** Single `loading_unloading_point` FK on the add form.

**Implemented:** `BayAssignmentLupFormSet` (`prefix=lups`) — one plain `<select>` per row, min 1 / max 20 rows.

| UI element | Behaviour |
|------------|-----------|
| Initial row | One empty LUP dropdown when the form loads |
| **Add loading/unloading point** | Client-side clone of first row; reindexes `lups-N-loading_unloading_point` names and `TOTAL_FORMS` |
| **Remove** | Removes row when >1 row; clears selection when only one row remains |
| **Save assignments** | Custom submit button (`name=_save`); validates formset server-side, then batch-calls `CCService.assign_bay` |

**LUP queryset exclusion (visit):** LUPs already **actively assigned** to the selected visit are excluded server-side:

1. `_lup_queryset_for_queue_entry` — `.exclude(bay_assignments__queue_entry=queue_entry, bay_assignments__is_active=True)`
2. `queue_entry_lups_view` — same exclusion in the AJAX JSON path

**Cross-row exclusion (same submit):** When multiple rows are on the form, `cc_queue_entry_details.js` rebuilds each row's options from the AJAX list but **omits LUPs selected in other rows**, so the same point cannot be picked twice before save. Formset `clean()` also rejects duplicate LUPs.

**Traffic panel:** Selecting a LUP in any row fires `loadLupTraffic(lupId)` and populates `#cc-lup-traffic-panel` for that point (last changed row wins).

#### 3.2.4 TO summary panel — extended with existing assignments sub-section

**Baseline panel (`build_cc_assignment_to_details_html`):** shows a table with TO number, TLS status, flow lane, vehicle, gross weight, origin/destination POI, allocated qty, QC note.

**FB-001 addition:** append a second table — "Assignments for this visit" — below the existing TO details table, whenever the visit has ≥1 existing `BayAssignment`.

```
Assignments for this visit
──────────────────────────────────────────────────────
#  | Point         | Waiting Serial | Status
───┼───────────────┼────────────────┼──────────────────
1  | BAY-01        | WS-042         | In progress
2  | BAY-03        | WS-047         | Not started
```

Columns:

| Column | Source |
|--------|--------|
| `#` | Sequence (1, 2, …) |
| Point | `assignment.loading_unloading_point.short_code` + full name |
| Waiting Serial | `assignment.waiting_serial.serial_number` (from `WaitingSerial`) |
| Status | Derived: `Not started` / `In progress` / `Completed` (from `assignment_is_complete()` / open `LoadEvent`/`UnloadEvent`) |

When no existing assignments (first assignment for this visit): the sub-section is omitted — no "empty" placeholder shown.

The AJAX endpoint (`queue_entry_details_view` → `queue-entry-details/<qe_id>/`) calls `build_cc_assignment_to_details_html(qe)` and returns the HTML. `loadDetails()` in JS replaces `#cc-to-details-panel` innerHTML as before.

#### 3.2.5 LUP traffic panel

`#cc-lup-traffic-panel` loads traffic for the **currently selected row's LUP** via `lup-traffic/<lup_id>/`. `render_queue_table_html` and `CCService.active_assignments_for_lup` are unchanged. Multi-row selection is wired in `cc_queue_entry_details.js` (`bindMultiLupRows`, `onLupSelected`).

#### 3.2.6 Form copy — `cc_visit_is_assigned`

`changeform_view` injects `cc_visit_is_assigned = (queue_entry.status == assigned)`. The template uses it on the **Loading / Unloading Point** fieldset (`#cc-bay-assignment-lups`):

| Visit state | Helper copy |
|-------------|-------------|
| `waiting` | "Choose one or more loading/unloading points for this visit. Use \"Add loading/unloading point\" to assign multiple points before saving." |
| `assigned` | "This transport order already has loading/unloading point(s) assigned. Choose one or more additional points. Points already assigned to this visit are excluded from the dropdowns." |

The "Select TO" fieldset keeps the queue-selection description from `get_fieldsets` (first vs additional wording).

#### 3.2.7 Save path — batch assign

On add, `BayAssignmentAdminForm.clean()` validates `BayAssignmentLupFormSet` and stores `cleaned_data["loading_unloading_points"]`. `save_model` loops each LUP:

```
for lup in loading_unloading_points:
  CCService.assign_bay(queue_entry, lup, actor)
    ├─► Validate: eligible, unique (queue_entry, lup), lane/op_type, POI, point active
    ├─► Create BayAssignment + WaitingSerial (FB-005 serial rules)
    ├─► QueueEntry.status = assigned  ← idempotent
    └─► Emit assigned_loading_point | assigned_unloading_point (per assign)
```

Success message: single serial or `"Bays assigned (N). Waiting serials: …"`. `response_add` redirects to the **CC queue changelist** (`admin:operations_queueentry_changelist`), not the Bay Assignment changelist.

#### 3.2.8 Static assets

Admin JS lives in `static/admin/js/cc_queue_entry_details.js` (cache-busted query param on the template). After changing static files in local Docker, run `collectstatic` so nginx serves the updated bundle from `staticfiles/`.

#### 3.2.9 Visit completion — TO status transition

The visit (queue entry) moves to `completed` **automatically** via the LD complete hook (§4.2A) when the last assignment's Load/Unload Event is completed — **not** via a manual CCO action on the `BayAssignmentAdmin` form. There is no "Mark as Loading/Unloading Completed" button on the CC admin form; completion is driven entirely by the LD crew completing all assigned points sequentially.

Once `QueueEntry.status = completed`, the entry drops off the CC queue changelist and the scale-out guard (`all_assignments_complete_for_visit`) unlocks scale-out.

### 3.3 Lane rules — unchanged

| Flow lane | CC assigns | When |
|-----------|------------|------|
| FG outbound | Load point(s) | After scale-in |
| FG inbound | Unload point(s) | After scale-in |
| RM inbound | Unload point(s) | After QC Pass (if `requires_qc`); immediately after scale-in if not |

CCO may assign multiple points **in one Save assignments submit** (multi-row form) or add more later via another queue action while the visit is open.

### 3.4 FB-001 vs FB-005 summary

| Topic | Rule |
|-------|------|
| Vehicles per LUP | Many (FB-005) — unchanged |
| LUPs per vehicle | **One or more** (FB-001) — distinct LUPs only |
| Waiting serial | One per assignment — unchanged |
| LD start/complete | **Per assignment — unchanged** |

---

## 4. LD-01 — unchanged flow; minimal hooks only

### 4.1 What stays exactly the same

Reference: [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) §4.0, §4.1, §4.2, §6.3, §6.4, §11.9.

| Area | Status |
|------|--------|
| Load/Unload Event **add** form (LUP dropdown → queue table → row click) | **Unchanged** |
| Load/Unload Event **change** form (complete: end datetime, bags, weight, seal) | **Unchanged** |
| `LDService.start_loading` / `start_unloading` per `bay_assignment` | **Unchanged** (see §4.2 for one additive validation) |
| `LoadEvent` / `UnloadEvent` fields and constraints | **Unchanged** |
| Point-first templates, `ld_queue_select.js`, `render_queue_table_html` | **Unchanged** |
| Crew workflow: one `bay_assignment` at a time at a chosen LUP | **Unchanged** |

When CC assigns a TO to BAY-01 and BAY-03, loading/unloading personnel use the **same screens as today** — they pick BAY-01, select the TO row, start and complete; later pick BAY-03, select the same TO row, start and complete.

### 4.2 Minimal hooks (internal — not a flow change)

These small changes prevent multi-assign from breaking yard state. **Do not** add new LD admin steps or alter the start/complete forms.

**A. Complete hook — visit-aware close**

Today `LDService.complete_*` calls `CCService.mark_completed(queue_entry)`, which closes the **entire visit** on the first point. For FB-001:

```
LDService.complete_loading | complete_unloading(event, actor):
  ├─► [UNCHANGED] Validate end_datetime, save event fields, refresh_closure_checklist
  ├─► [UNCHANGED] Per-assignment: assignment.is_active = False
  ├─► [HOOK] If all_assignments_complete_for_visit(queue_entry):
  │           QueueEntry.status = completed
  │           emit loading_completed | unloading_completed (once for the leg)
  └─► [HOOK] Else: do NOT set QueueEntry completed; do NOT emit terminal leg sub-state
```

Per-assignment `loading_started` / `unloading_started` on start — **unchanged.**

**B. Start validation — no parallel work (service only)**

Add to `LDService.start_*` (returns existing-style `ValidationError`; no admin UI change required):

```
if visit_has_work_in_progress(queue_entry):
    raise ValidationError("Complete in-progress work at another point for this visit first.")
```

Operators see the same admin error pattern as other LD validation failures.

**C. No LD admin template/JS changes required**

Existing queue table at each LUP already lists assignments for that point. Disabled rows / new tooltips are **optional** polish, not part of FB-001 scope.

---

## 5. QC-01 side effects (RM resample only)

When multiple unload points were assigned, resample / override-to-fail **cancels all active** `BayAssignment` rows for the visit (not only the bay with the open event). LD start/complete screens unchanged; CCO re-assigns after QC cycle.

See locked decision table in Overview. QC Pass → CC may assign multiple unload points — unchanged rule; assign via multi-row form and/or repeat queue entry.

---

## 6. TLS-01 sub-states

| Event | Rule |
|-------|------|
| `assigned_*_point` | Each CC `assign_bay` — unchanged pattern, repeatable |
| `loading_started` / `unloading_started` | Each LD `start_*` — **unchanged** |
| `loading_completed` / `unloading_completed` | **Once**, when visit hook (§4.2) detects all assignments complete |

---

## 7. Scale-out and gate-out guards (minimal alignment)

Current guards use `.exists()` on any completed event — would unblock after the **first** point when CC assigns multiple. Align with `all_assignments_complete_for_visit` for the visit’s `QueueEntry`.

Files: `apps/operations/scaling/services.py`, `apps/operations/gate/clearance.py`.

**Not an LD flow change** — prevents scale-out/gate-out from opening too early.

---

## 8. Validation rules

### CC-01 (FB-001 — primary)

| Rule | Enforcement |
|------|-------------|
| Multiple distinct LUPs per visit | FK + unique constraint |
| Additional assign while visit open | `eligible_for_bay_assignment` |
| Cannot assign to completed visit | `assign_bay` |
| RM: assign only after QC pass | Unchanged |

### LD-01 (additive only)

| Rule | Enforcement |
|------|-------------|
| Per-assignment start/complete | **Existing rules — unchanged** |
| No parallel open events per visit | `LDService.start_*` validation (§4.2B) |

FB-005 rules — **unchanged.**

---

## 9. Django admin amendments

### 9.1 QueueEntryAdmin (FB-001 — primary)

| Change | File / method | Detail |
|--------|--------------|--------|
| Changelist queryset | `get_queryset` | Include `status__in=[waiting, assigned]` — completed rows drop off automatically |
| `list_display` | `assignments_progress` column | `"{done}/{total} done"` from visit's active `bay_assignments`; `—` when `total == 0` |
| Per-row action | `cc_actions` | `waiting` + eligible → "Assign loading/unloading point" link; `assigned` + not complete → "Add loading/unloading point" link; both link to `/admin/operations/bayassignment/add/?queue_entry={pk}` |
| No change | Changelist search, filters, QC badge | Unchanged |

**No new bulk action** — single-row assign remains via per-row link, consistent with existing UX.

### 9.2 BayAssignmentAdmin (FB-001 — primary)

| Change | File / method | Detail |
|--------|--------------|--------|
| `queue_entry` queryset | `formfield_for_foreignkey` | `bay_assignable_queue_entries()` — `status IN (waiting, assigned)` |
| Add form fields | `get_form`, `ADD_FIELDSETS` | On add: drop `loading_unloading_point` from parent `ModelForm`; fieldsets contain `queue_entry` only |
| Multi-row LUP formset | `BayAssignmentLupLineForm`, `BayAssignmentLupFormSet`, `build_bay_assignment_lup_formset` | Repeatable rows (`prefix=lups`, min 1 / max 20); validated in `BayAssignmentAdminForm.clean()` |
| LUP queryset — server-side | `_lup_queryset_for_queue_entry` | Exclude LUPs with active assignment on visit |
| LUP options — AJAX | `queue_entry_lups_view` | Same visit exclusion; JS applies cross-row exclusion per row |
| TO summary panel | `build_cc_assignment_to_details_html` | "Assignments for this visit" sub-table when active assignments exist |
| Add form template | `change_form.html` | `#cc-bay-assignment-lups` table, Add/Remove buttons, **Save assignments** submit row |
| Form copy | `changeform_view` + template | `cc_visit_is_assigned` switches LUP fieldset helper text |
| `save_model` | **Batch** | Loops `loading_unloading_points` → `CCService.assign_bay` per distinct LUP |
| Post-save redirect | `response_add` | CC queue changelist |
| LUP traffic panel | `lup_traffic_view` + JS | Unchanged endpoint; JS loads traffic on row `change` |
| `cc_queue_entry_details.js` | **Extended** | `bindMultiLupRows`, `refreshMultiLupOptions`, add/remove row DOM, integrates with existing AJAX panels |

#### 9.2.1 `_lup_queryset_for_queue_entry` — exact exclusion

```python
def _lup_queryset_for_queue_entry(self, request, queue_entry):
    # ... existing poi/op_type scoping unchanged ...
    qs = LoadingUnloadingPoint.objects.filter(is_active=True)
    # ... existing op_type + scope filters ...
    if queue_entry:
        # FB-001: exclude LUPs already actively assigned to this visit
        qs = qs.exclude(
            bay_assignments__queue_entry=queue_entry,
            bay_assignments__is_active=True,
        )
    return qs.order_by("short_code")
```

The same exclusion is applied inside `queue_entry_lups_view` (AJAX path) so both initial render and dynamic refresh are consistent.

#### 9.2.2 `build_cc_assignment_to_details_html` — assignments sub-section

The function fetches `queue_entry.bay_assignments.filter(is_active=True).select_related('loading_unloading_point', 'waiting_serial')` internally and, when non-empty, appends a sub-section after the existing TO details table.

**HTML structure** — must be consistent with the existing `cc-bay-assignment-to-summary` panel conventions (see §9.3 Design consistency):

```html
<h4 style="margin:12px 0 6px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--dfms-grey-600);">
  Assignments for this visit
</h4>
<table class="grp-table cc-assignment-list-table" style="width:100%;margin-top:0;">
  <thead>
    <tr>
      <th scope="col">#</th>
      <th scope="col">Point</th>
      <th scope="col">Waiting Serial</th>
      <th scope="col">Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>BAY-01 — Loading Bay 1</td>
      <td><strong>WS-042</strong></td>
      <td><span class="dfms-badge dfms-badge--in-progress">
            <i class="bi bi-hourglass-split" style="font-size:10px;"></i> In progress
          </span></td>
    </tr>
    <tr>
      <td>2</td>
      <td>BAY-03 — Loading Bay 3</td>
      <td><strong>WS-047</strong></td>
      <td><span class="dfms-badge dfms-badge--neutral">
            <i class="bi bi-clock" style="font-size:10px;"></i> Not started
          </span></td>
    </tr>
  </tbody>
</table>
```

**Notes on HTML choices (see §9.3):**

- `h4` with inline styles — `h3` is not used inside `.module` panel body in this codebase; `h4` matches the LD admin sub-section pattern. Inline styles are intentional: this HTML is generated by Python (`format_html`) and injected via AJAX into `#cc-to-details-panel`, not rendered by Django templates, so external CSS would not reliably scope here.
- `grp-table cc-assignment-list-table` — `grp-table` is the project-wide legacy class for in-panel tables (consistent with TO details table and LUP traffic table). `cc-assignment-list-table` is the semantic hook; add minimal CSS in `custom.css` if additional column widths are needed.
- Status labels use **`dfms-badge dfms-badge--{modifier}`** chips — not plain text — to match CC queue changelist status rendering.

**Status badge mapping:**

| Status | Badge modifier | Icon |
|--------|---------------|------|
| Not started | `dfms-badge--neutral` | `bi-clock` |
| In progress | `dfms-badge--in-progress` | `bi-hourglass-split` |
| Completed | `dfms-badge--fulfilled` | `bi-check-circle` |

Status derivation logic (in Python, not JS):

| Status | Condition |
|--------|-----------|
| Not started | No `LoadEvent`/`UnloadEvent` FK on this assignment |
| In progress | Open event exists (`end_datetime` is null) |
| Completed | `assignment_is_complete(assignment)` → True |

This is rendered server-side in `build_cc_assignment_to_details_html`. The AJAX path (`queue_entry_details_view`) returns the full HTML; `loadDetails()` replaces `#cc-to-details-panel` innerHTML as before.

#### 9.2.3 Multi-row LUP formset — template and validation

**Python (`apps/operations/command_center/admin.py`):**

- `BayAssignmentLupLineForm` — `ModelChoiceField` with plain `forms.Select` (not admin autocomplete; safe to clone rows in JS).
- `BaseBayAssignmentLupFormSet.clean()` — requires ≥1 LUP; rejects duplicate LUPs in the same submit.
- `build_bay_assignment_lup_formset(request, admin, queue_entry)` — sets per-row queryset from `_lup_queryset_for_queue_entry`.
- `BayAssignmentAdminForm.clean()` — on add POST, validates formset and sets `cleaned_data["loading_unloading_points"]`.
- `get_form` — patches `request` and `_bay_admin` onto form; removes `loading_unloading_point` field on add.

**Template (`templates/admin/operations/bayassignment/change_form.html`):**

```html
<fieldset id="cc-bay-assignment-lups" class="module aligned">
  {{ lup_formset.management_form }}
  <table class="grp-table cc-lup-lines-table">…rows…</table>
  <button type="button" id="cc-add-lup-row">Add loading/unloading point</button>
</fieldset>
```

Submit row on add only: **Cancel** + **Save assignments** (`dfms-btn-save`).

#### 9.2.4 `cc_queue_entry_details.js` — multi-row extensions

Single file: `static/admin/js/cc_queue_entry_details.js` (loaded from `change_form.html` with cache-bust query param).

| Function | Role |
|----------|------|
| `bindMultiLupRows` | Add/Remove click handlers; row `change` → traffic + option refresh |
| `addLupRow` / `removeLupRow` | Clone/reindex rows; sync `lups-TOTAL_FORMS` |
| `refreshMultiLupOptions` | Fetch `queue-entry-lups/<qe_id>/`; rebuild each row's `<select>`; exclude other rows' selections |
| `loadLupTraffic` | Unchanged AJAX to `lup-traffic/<lup_id>/` |
| `refreshLupOptions` | Delegates to `refreshMultiLupOptions` when `#cc-bay-assignment-lups` is present |

Pattern follows gate on-demand product lines (`gate_on_demand_lines.js`): client-side row clone + server-side formset validation on submit.

### 9.3 LoadEventAdmin / UnloadEventAdmin

**No FB-001 changes required.** Existing point-first add/change forms and fieldsets remain as in [command-center-loading-sprint4.md](./command-center-loading-sprint4.md) §6.3–6.4.

### 9.4 Design consistency requirements

All new UI elements introduced by FB-001 must follow the existing DFMS admin design system (`static/admin/css/custom.css`). No new CSS frameworks or external libraries.

#### Panels and layout

| Element | Rule |
|---------|------|
| Panel shell | `div.module` — same as `cc-bay-assignment-to-summary` and `cc-bay-assignment-lup-traffic` |
| Panel title | `h2` with no extra class — styled globally via `.module h2` (grey-100 background, 11px uppercase) |
| Helper copy | `<p class="help">` — 12px, `--dfms-grey-500` |
| Form layout row | `<div class="form-row">` |
| Sub-section heading inside generated HTML | `h4` with inline styles (`font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--dfms-grey-600)`) — matches LD admin sub-section pattern; **not `h3`** |

#### Status chips

All per-assignment status values shown in any panel or changelist column **must** use `dfms-badge dfms-badge--{modifier}`, not plain text. Modifiers available in `custom.css`:

| Assignment status | Modifier |
|------------------|----------|
| Not started | `dfms-badge--neutral` |
| In progress | `dfms-badge--in-progress` |
| Completed | `dfms-badge--fulfilled` |
| Cancelled | `dfms-badge--cancelled` |

Icons use Bootstrap Icons (`bi bi-*`) sized at `font-size:10px` inline — consistent with all other `dfms-badge` usage in the CC admin.

#### Changelist action links (`cc_actions`)

"Assign loading/unloading point" and "Add loading/unloading point" links follow the existing `cc_actions` column pattern — plain `<a href="…">` links with no custom button class, consistent with the current "Assign bay" link rendering. No `dfms-btn-*` class on changelist row-action links.

#### In-panel tables

| Requirement | Rule |
|------------|------|
| Class | `grp-table` + semantic `cc-*` modifier (`cc-assignment-list-table`, `cc-lup-lines-table`) — matching `grp-table cc-lup-traffic-table` pattern |
| `grp-table` note | Legacy Grappelli class; zero project CSS; renders with browser defaults. Add column-width rules to `custom.css` under `.cc-assignment-list-table` only if layout requires it |
| Waiting Serial cell | `<strong>` — matches LUP traffic table serial rendering |
| Empty state | `<p class="help">` — matches LUP traffic empty message pattern (`cc-lup-traffic-empty`) |

#### `assignments_progress` changelist column

Render as plain text (`"0/1 done"`, `"2/2 done"`) when in progress. When all done (`done == total > 0`), wrap in `dfms-badge dfms-badge--fulfilled` to signal completion visually — consistent with other completion state indicators in the CC changelist.

---

## 10. REST API (when CC-01-5 lands)

| Endpoint | FB-001 note |
|----------|-------------|
| `POST …/command-center/assignments` | Multiple calls per `queue_entry_id` (distinct LUPs) |
| `GET …/assignments?queue_entry_id=` | List all assignments for visit |
| Load/unload event APIs | **Unchanged** — still `{ bay_assignment_id, … }` |

---

## 11. Story mapping

### CC-01 (FB-001 — primary)

| Sub-task | Scope |
|----------|-------|
| FB-001-1 | Migration: FK + unique constraint |
| FB-001-2 | `CCService`: `assign_bay`, eligibility, visit helpers, `mark_assignment_completed` |
| FB-001-3 | `QueueEntryAdmin`: changelist, progress column, Add point action |
| FB-001-4 | `BayAssignmentAdmin`: multi-row LUP formset, batch save, exclude assigned LUPs, visit panel, extended JS |

### LD-01 (minimal hook — not a flow story)

| Sub-task | Scope |
|----------|-------|
| FB-001-5 | `LDService.complete_*`: visit-aware complete hook (§4.2A) |
| FB-001-6 | `LDService.start_*`: parallel-work validation (§4.2B) — optional if ops rely on crew discipline |

### Supporting

| Sub-task | Scope |
|----------|-------|
| FB-001-7 | QC resample: cancel all active assignments |
| FB-001-8 | Scale-out + gate-out aggregate guards |

---

## 12. Suggested PR order

1. **Migration + CC service + visit helpers** (FB-001-1, FB-001-2).
2. **CC admin** (FB-001-3, FB-001-4) — **main user-visible deliverable**.
3. **LD complete/start hooks + scale/gate guards** (FB-001-5, FB-001-8) — small, no LD UX diff.
4. **QC resample cancel-all** (FB-001-7).

---

## 13. Out of scope (FB-001)

- Any redesign of LD loading/unloading start or complete admin flow.
- New LD fields, forms, templates, or JS for multi-point.
- Auto-split of quantity/weight across points.
- Assignment push notifications.
- REST LD API changes.

---

## 14. Baseline cross-reference index

| Baseline section | FB-001 effect |
|------------------|---------------|
| §1.2 BayAssignment OneToOne | **Superseded** — FK + unique (queue_entry, lup) |
| §3.2–3.4 CC assign flow | **Amended** — multi-row batch assign + queue repeat entry; §3 of this doc |
| §4.0–4.2 LD start/complete UX | **Unchanged** |
| §6.3–6.4 LoadEventAdmin / UnloadEventAdmin | **Unchanged** |
| §11.9 LD admin queue widget | **Unchanged** |
| LD `complete_*` → `mark_completed` | **Hook only** — §4.2A |
| Scale-out / gate guards | **Aligned** — §7 |

**Unchanged by FB-001:** CC queue serial, WaitingSerial / FB-005, LUP traffic panel, LD point-first UX, per-assignment Load/Unload events, product-line QC (FB-006), YARD-01 admin bases.

---

## 15. Implementation status

Ordered by suggested PR sequence (§12). Checked items are **implemented** in `apps/*` as of 2026-06-24.

---

### PR 1 — Migration + CC service (FB-001-1, FB-001-2) ✅

**FB-001-1 · `apps/operations/command_center/models.py` + migration**

- [x] Change `BayAssignment.queue_entry` from `OneToOneField` → `ForeignKey(QueueEntry, related_name='bay_assignments')`
- [x] Add `UniqueConstraint(fields=["queue_entry", "loading_unloading_point"], name="uq_bay_assignment_queue_entry_lup")`
- [x] Migration `0016_fb001_bayassignment_fk_multi_lup.py`
- [x] Reverse accessor audit — no remaining `queue_entry.bay_assignment` (singular) usages in app code

**FB-001-2 · `apps/operations/command_center/services.py`**

- [x] `assignments_for_visit`, `assignment_is_complete`, `all_assignments_complete_for_visit`, `visit_has_work_in_progress`
- [x] Extended `bay_assignable_queue_entries()` and `eligible_for_bay_assignment()`
- [x] `assign_bay` — multi-assign validation, idempotent `assigned` status, `IntegrityError` → validation error

---

### PR 2 — CC admin (FB-001-3, FB-001-4) ✅

**FB-001-3 · `QueueEntryAdmin`**

- [x] `get_queryset` — `status__in=[waiting, assigned]`; `prefetch_related` load/unload events on bay assignments
- [x] `assignments_progress` column with fulfilled badge when all done
- [x] `cc_actions` — Assign vs Add loading/unloading point links

**FB-001-4 · `BayAssignmentAdmin`**

- [x] `formfield_for_foreignkey` / `_lup_queryset_for_queue_entry` / `queue_entry_lups_view` — visit LUP exclusion
- [x] `changeform_view` — `cc_visit_is_assigned`, `lup_formset`
- [x] `BayAssignmentLupFormSet` + `build_bay_assignment_lup_formset` + batch `save_model`
- [x] `response_add` → CC queue changelist

**FB-001-4 · `admin_assignment_details.py`**

- [x] "Assignments for this visit" sub-table in `build_cc_assignment_to_details_html`

**FB-001-4 · `templates/admin/operations/bayassignment/change_form.html`**

- [x] `#cc-bay-assignment-lups` multi-row table, Add/Remove, Save assignments, `cc_visit_is_assigned` copy

**FB-001-4 · `static/admin/js/cc_queue_entry_details.js`**

- [x] Multi-row add/remove, cross-row LUP exclusion, traffic on row select (§9.2.4)

**FB-001-4 · `static/admin/css/custom.css`**

- [x] No extra column-width rules required for assignment/LUP line tables (browser defaults sufficient)

---

### PR 3 — LD hooks + scale/gate guards (FB-001-5, FB-001-6, FB-001-8) ✅

**FB-001-5 · `apps/operations/loading/services.py`**

- [x] Visit-aware complete hook in `complete_loading` / `complete_unloading`

**FB-001-6 · `apps/operations/loading/services.py`**

- [x] `visit_has_work_in_progress` validation on `start_loading` / `start_unloading`

**FB-001-8 · scale-out + gate-out**

- [x] `all_assignments_complete_for_visit` in `scaling/services.py` and `gate/clearance.py`

---

### PR 4 — QC resample cancel-all (FB-001-7) ✅

**FB-001-7 · `apps/quality/checkpoint/services.py`**

- [x] Resample / override-fail cancels **all** active `BayAssignment` rows for the visit

---

### Cross-cutting checks ✅

- [x] Reverse accessor audit
- [x] N+1 guard on progress column (`prefetch_related`)
- [x] `waiting_serial` via `select_related` in assignment details panel
- [x] Unique constraint race handled in `assign_bay` (`IntegrityError`)

---

**Last Updated:** 2026-06-24  
**Related:** [command-center-loading-sprint4.md](./command-center-loading-sprint4.md), [feedback-resolution.md](../../03-backlog/sprints/sprint-6/feedback-resolution.md)
