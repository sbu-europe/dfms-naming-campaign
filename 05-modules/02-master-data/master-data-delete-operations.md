---
module: 02-master-data
specification: Master Data Delete Operations (Django Admin)
version: 1.2
phase: Phase 1
source_document: PRD_DFMS_v1.0.md §6.3.3 Master Tables (CRUD Operation) — DELETE
last_updated: 2026-07-21
changelog: >
  v1.2 — No-dependency hard delete requires a mandatory delete reason;
    reason is persisted on the DELETE audit log and visible in Admin audit views.
  v1.1 — Django Admin only. Active/Inactive already implemented (out of scope).
  Delete = hard delete with dependency gate and user-friendly validation messages.
  v1.0 — Initial Admin-first plan (superseded scope).
related_stories: US-096, MDM-02, US-053
related_prd: ../../01-source/01-prd/PRD_DFMS_v1.0.md
baseline_code: apps/master_data/admin.py (_reverse_reference_labels, MasterEntityHardDeleteAdminMixin, delete_permanently)
---

# Master Data Delete Operations — Implementation Plan (Django Admin)

## Overview

This document is the **Django Admin–only** implementation plan for master-data **Delete**.

**Already done (out of scope):** Active / Inactive via `is_active` (activate / deactivate actions and form checkbox). That is **not** the delete path.

**This plan covers Delete only:**

| Condition | Behaviour |
|-----------|-----------|
| **Any dependency exists** | **Block** hard delete; show a clear, user-friendly validation message listing what references the record |
| **No dependency** | Admin **must enter a delete reason** → **execute hard delete** (row removed from the database); reason is written to the **audit log** |

**Primary path:** `apps/master_data/admin.py` (+ small shared helper)  
**Not in scope:** REST API delete changes, cascade delete, soft-delete-as-delete, two-step / Super Admin–only hard delete (unless product revisits later)

---

## 0. Scope boundary

| In scope | Out of scope |
|----------|--------------|
| Django Admin delete (single object + bulk) | REST / mobile / vendor delete APIs |
| Dependency scan before hard delete | Changing Active/Inactive behaviour |
| User-friendly Admin validation / flash messages when blocked | Cascade-deleting PR / TR / TO / Trip / QC / Gate rows |
| Hard delete when dependency list is empty **and** a delete reason is provided | Soft delete / `deleted_at` as the Delete action |
| Delete reason captured on confirmation and stored on the DELETE audit log | Redesigning list/search/filter CRUD |
| Start with Supplier + Dealer; reuse pattern for other masters | |

### Locked decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Active / Inactive | **Leave as implemented** | Soft lifecycle stays on `is_active`; not the Delete action |
| Delete action meaning | **Hard delete** (permanent row removal) only when **zero** reverse dependency history | Explicit product direction |
| Any dependency history | **Block hard delete**; friendly Admin ERROR; use Deactivate instead | Protect operational integrity (PR lines, gate visits, TOs, trips, …) |
| No dependency history | **Hard delete executes only after Admin enters a delete reason** | Accountability for irreversible removal of unused masters |
| Delete reason → audit | Reason is **required** and **shown on the DELETE audit log** (`details` / equivalent) | Auditors and Admins can see *why* the row was removed |
| Coverage | All `TenantMasterDataAdmin` models (Product, Vehicle, POI, Brand, Supplier, Dealer, …) | Same rule everywhere |
| Who can delete | Existing Admin delete permissions (`has_delete_permission` / RBAC) | Keep scope minimal |
| Message tone | `Cannot delete '{name}' ({code}) — {n} {labels} currently assigned. Deactivate it instead.` | Plain language; no Django protected-object dump |

---

## 1. Current vs expected

| Aspect | Current | Expected |
|--------|---------|----------|
| Active / Inactive | Activate / Deactivate actions on Supplier/Dealer (and similar on other masters) | **Unchanged** |
| Delete | Partial: `MasterEntityHardDeleteAdminMixin` + `delete_permanently`; messages uneven; default `delete_selected` removed for Supplier/Dealer | All Admin delete entry points run the same dependency check; blocked deletes show consistent friendly messages; clear deletes hard-remove the row |
| Delete reason | Not required on Admin hard delete | **Required** when dependency list is empty; blank reason blocks the delete with a validation ERROR |
| Audit on delete | `log_crud_delete` may already write deleted snapshot | DELETE audit entry **must include the Admin-provided reason** so it appears in audit log UI / API |
| Dependency scan | `_reverse_reference_labels` / reverse FK count | Keep / centralize; human-readable labels only |

---

## 2. Django Admin flow

### 2.1 Mental model

```
Active / Inactive  →  keep row, control pickers / workflows   (already shipped)
Delete             →  remove row IFF zero dependencies AND delete reason provided
                       → reason recorded on DELETE audit log
```

### 2.2 Entry points (wire the same rule everywhere)

1. **Change form** — Django “Delete” link → confirmation (with **reason** field) → `delete_model`
2. **Changelist bulk** — “Delete permanently” (or restored delete action) → confirmation with **shared reason** (or per-row if product prefers shared) → per-object check → `delete_queryset` / action loop

For each object:

```
collect dependencies
  → if any:  abort; ERROR message (object not deleted); no reason needed
  → if none:
       require non-empty delete reason
         → if missing/blank: abort; ERROR (“Delete reason is required.”)
         → else: instance.delete(); write DELETE audit with reason; SUCCESS message
```

Re-scan on confirm submit (avoid stale confirmation if a reference was created meanwhile).

### 2.3 Dependency sources (examples)

Any reverse FK / M2M pointing at the master counts as a dependency. Typical operational refs:

- Gate on-demand requests (Supplier / Dealer)
- Gate entries / visits, Transport Orders, Trips
- Transport Requisitions / PR line items
- QC / stock links where FKs exist

Use human `verbose_name_plural` + count, e.g. `Gate on-demand requests (2)` — never raw labels like `operations.GateOnDemandRequest`.

### 2.4 User-facing validation messages

| Event | Level | Message |
|-------|-------|---------|
| Blocked — has dependencies | ERROR | `"Cannot delete {entity} '{name}' ({code}) because it is already in use: {deps}. Deactivate it instead, or remove those references first."` |
| Blocked — missing delete reason | ERROR | `"Cannot delete {entity} '{name}' ({code}) — a delete reason is required."` |
| Bulk — some blocked | ERROR | `"Cannot delete: {name} ({code}) — in use: {deps}"` (one line per blocked row; successful rows may still be deleted if policy allows partial bulk — **prefer fail-closed: if any selected row has deps, delete none** unless product wants partial) |
| Bulk — missing reason | ERROR | `"Cannot delete — a delete reason is required."` |
| Success — single | SUCCESS | `"{Entity} '{name}' ({code}) was permanently deleted."` |
| Success — bulk | SUCCESS | `"{n} {entity}(s) permanently deleted."` |
| No delete permission | Django default / existing RBAC | Unchanged |

**Dependency fragment:** `"Gate on-demand requests (2); Transport orders (1)"`.

**Locked bulk policy for v1:** **Fail-closed** — if any selected row has dependencies, delete **none** of the selection and show all blocking messages. Safer for Admin users. One shared non-empty reason applies to every row that is deleted in that bulk action and is stored on each row’s DELETE audit entry.

### 2.5 Confirmation page (required for reason capture)

On Django’s delete confirmation template (or shared `templates/admin/master_data/delete_confirmation.html`):

- If dependencies exist: show the list **before** submit and disable confirm (or allow submit to re-validate and fail with the same ERROR). **No reason field needed** when blocked.
- If none: show standard “Are you sure?” **plus a required “Delete reason” text input / textarea**. Confirm is blocked client-side when empty; server still re-validates.

The submitted reason is passed into `delete_model` / `delete_queryset` / `delete_permanently` and into `log_crud_delete` (e.g. `details={"deleted_data": …, "delete_reason": "<text>"}` or equivalent field already used by audit UI).

Minimum viable without a custom template is **not** enough for this requirement — a confirmation UI that collects the reason is in scope for v1.2.

### 2.6 Audit log visibility

| Field / detail | Value |
|----------------|-------|
| Event type | `DELETE` (existing) |
| Entity | Master type + id / code / name snapshot as today |
| **Delete reason** | Exact text entered by Admin on confirmation |
| Actor / timestamp | Existing audit fields |

Admins viewing Audit Logs must be able to see the delete reason on the DELETE event (list/detail / `details` payload — whichever the current audit Admin already surfaces for CRUD details).

---

## 3. Implementation design

### 3.1 Shared helper

Centralize in `apps/master_data/deletion.py` (or keep helpers in `admin.py` if tiny — prefer one module once Brand/POI reuse it):

```python
def collect_dependency_labels(instance) -> list[str]:
    """Human-readable 'Label (count)' for every reverse relation with rows."""
    ...

def format_blocked_delete_message(instance, deps: list[str]) -> str:
    ...

def assert_deletable_or_raise(instance) -> None:
    deps = collect_dependency_labels(instance)
    if deps:
        raise ValidationError(format_blocked_delete_message(instance, deps))
        # or PermissionDenied / custom Admin-friendly error that message_user can show

def assert_delete_reason_or_raise(reason: str) -> str:
    cleaned = (reason or "").strip()
    if not cleaned:
        raise ValidationError("A delete reason is required.")
    return cleaned
```

Admin mixin:

```python
class MasterEntityHardDeleteAdminMixin:
    def delete_model(self, request, obj):
        deps = collect_dependency_labels(obj)
        if deps:
            self.message_user(request, format_blocked_delete_message(obj, deps), level=messages.ERROR)
            return  # do not delete
        reason = assert_delete_reason_or_raise(request.POST.get("delete_reason", ""))
        # hard delete + log_crud_delete(..., deleted_data={..., "delete_reason": reason})
        super().delete_model(request, obj)
        self.message_user(request, success_message(obj), level=messages.SUCCESS)

    def delete_queryset(self, request, queryset):
        # fail-closed: gather all blockers first; require one shared delete_reason
        ...
```

Replace duplicated `_reverse_reference_labels` + `delete_permanently` body with calls into this helper. Ensure every successful Admin hard delete path includes the reason on the audit payload.

### 3.2 Supplier / Dealer (first slice)

| Step | Work | Verify |
|------|------|--------|
| 1 | Extract `collect_dependency_labels` + message formatters | Unit: supplier with gate on-demand → non-empty deps; unused → `[]` |
| 2 | Confirmation template + reason field; `delete_model` / `delete_queryset` / `delete_permanently` use helper | Used supplier: ERROR, row remains; unused + reason: row gone + SUCCESS + audit has reason; unused without reason: ERROR, row remains |
| 3 | Confirm Active/Inactive actions untouched | Activate / Deactivate still work |
| 4 | Manual Admin checklist (§5) | Signed off |

### 3.3 Roll out to other masters (same Admin rule)

After Supplier/Dealer: Brand → Product / Category → POI → Vehicle → Driver / Helper — each ModelAdmin’s delete path calls the same helper. **Do not** change their Active/Inactive flows in this workstream.

---

## 4. File touch list (Supplier / Dealer first)

| File | Change |
|------|--------|
| `apps/master_data/deletion.py` | **New** — dependency collect + message helpers + delete-reason validation |
| `apps/master_data/admin.py` | Wire mixin / actions to helper; pass reason into audit; remove duplicate scan logic |
| `templates/admin/master_data/delete_confirmation.html` | **Required** — show dependency list when blocked; required delete-reason field when clear |
| `apps/audit/services.py` (if needed) | Ensure `log_crud_delete` / details can carry `delete_reason` visibly |
| `tests/unit/master_data/test_deletion.py` | **New** — deps present → blocked; deps absent + reason → hard delete + audit reason; deps absent without reason → blocked |

No ViewSet / API changes in this plan.

---

## 5. Testing & DoD

### Unit

- [ ] Unused Supplier/Dealer → `collect_dependency_labels` empty → hard delete removes row **when reason provided**.
- [ ] Unused Supplier/Dealer without reason → delete blocked; row remains; ERROR requires reason.
- [ ] Successful delete writes DELETE audit entry that includes the provided reason.
- [ ] Supplier/Dealer referenced by gate on-demand (or other FK) → delete blocked; exact friendly message contains name, code, and dependency labels (reason not required when blocked by deps).
- [ ] Fail-closed bulk: one used + one unused selected → neither deleted; ERROR lists the used one.
- [ ] Fail-closed bulk with unused rows but blank reason → none deleted.
- [ ] Activate / Deactivate still flip `is_active` only (smoke).

### Manual Admin checklist

- [ ] Deactivate / Activate unchanged.
- [ ] Delete unused master → confirmation asks for reason → record gone → SUCCESS flash → audit log shows reason.
- [ ] Delete unused master with empty reason → ERROR; record still in DB.
- [ ] Delete used master → ERROR flash with dependencies; record still in DB; suggest deactivate.
- [ ] Bulk delete with mixed selection → nothing deleted; clear ERROR.
- [ ] Bulk delete of unused rows with one shared reason → rows gone; each DELETE audit shows the reason.

### Definition of Done

- [ ] Admin Delete = hard delete only when dependency list is empty **and** a non-empty delete reason is provided.
- [ ] Delete reason is stored on / visible in the DELETE audit log.
- [ ] Any dependency → user-friendly ERROR validation message; no row removal.
- [ ] Active/Inactive behaviour unchanged.
- [ ] Supplier + Dealer Admin on shared helper; unit tests green.

---

## Related

| Doc | Path |
|-----|------|
| PRD §6.3.3 | [`../../01-source/01-prd/PRD_DFMS_v1.0.md`](../../01-source/01-prd/PRD_DFMS_v1.0.md) |
| MDM-02 Supplier/Dealer | [`../../03-backlog/sprints/sprint-2/01-master-data-management/MDM-02-supplier-dealer.md`](../../03-backlog/sprints/sprint-2/01-master-data-management/MDM-02-supplier-dealer.md) |
| Vehicle master | [`./vehicle-master-data.md`](./vehicle-master-data.md) |
