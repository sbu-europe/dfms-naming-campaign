---

## module: 06-poi-operations
specification: YARD-01 — Yard Foundation Implementation Plan
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-19
related_stories: DFS-065 (YARD-01)
jira_epic: DFS-072

# YARD-01 — Implementation Plan: Yard Foundation

## Codebase baseline (May 2026)


| Component                                | Exists                             | Notes                                                                             |
| ---------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `GateVisitSession`                       | ✓ `apps/operations/gate/models.py` | No `yard_leg` field                                                               |
| `GateAdminBase`                          | ✓ `apps/operations/gate/admin.py`  | Gate-only; other roles have no equivalent                                         |
| `gate_poi.py`                            | ✓ `apps/operations/gate/`          | References `InvitationToken.invitee` (field does not exist — latent bug §5 below) |
| `UserOperationalPOI`                     | ✗                                  | Does not exist anywhere                                                           |
| `TransportOrder.sub_state`               | ✗                                  | `status` only; no yard step field                                                 |
| `TOSubState` constants                   | ✗                                  | Not in `apps/transport/constants.py`                                              |
| `apps/operations/scaling/admin.py`       | ✗                                  | Missing                                                                           |
| `apps/operations/loading/admin.py`       | ✗                                  | Missing                                                                           |
| `apps/operations/command_center/` models | ✗                                  | Stub views only                                                                   |
| `apps/quality/checkpoint/`               | ✗                                  | Does not exist; legacy QC under `apps/quality/` links to `GateEntry`              |


---

## Delivery order (strict — each step unblocks the next)

```
Step 1 — sub_state on TransportOrder          (TLS-01 coordinate)
Step 2 — UserOperationalPOI model             (users app)
Step 3 — yard_poi.py                          (operations shared)
Step 4 — yard_leg on GateVisitSession         (gate app)
Step 5 — YardAdminBase                        (operations shared)
Step 6 — YardContext / policy dict            (operations shared)
Step 7 — Cross-module schema fixes            (operations/scaling, command_center, loading)
```

No SC-01 / CC-01 / LD-01 / QC-01 admin may be started before Steps 1–6 are merged.

---

## Step 1 — `TransportOrder.sub_state` + `TOSubState`

### 1.1 Why

`command-center-loading-sprint4.md` §6.5 and `qc-operations-sprint4.md` §5.2 filter querysets with `latest_sub_state__in=[...]`. That annotation does not exist on the ORM. `TOStatusTransitionLog` covers audit; a denormalized `sub_state` column on `TransportOrder` is the correct query field (same pattern as the existing `qc_passed` boolean).

### 1.2 Migration

```python
# apps/transport/models.py  ← add field
sub_state = models.CharField(max_length=40, blank=True, default="", db_index=True)
```

Migration file: `apps/transport/migrations/XXXX_transport_order_sub_state.py`  
**No data migration needed** — default `""` is correct for all existing TOs.

### 1.3 Constants — add to `apps/transport/constants.py`

```python
class TOSubState(models.TextChoices):
    SCALE_IN                 = "scale_in",                 "Scale In"
    WAITING_CC               = "waiting_cc",               "Waiting for Command Center"
    FLAGGED_FOR_QC           = "flagged_for_qc",           "Flagged for QC"
    SAMPLING_STARTED         = "sampling_started",         "Sampling Started"
    QC_PASSED                = "qc_passed",                "QC Passed"
    QC_FAILED                = "qc_failed",                "QC Failed"
    RESAMPLING               = "resampling",               "Resampling"
    ASSIGNED_LOADING_POINT   = "assigned_loading_point",   "Assigned Loading Point"
    ASSIGNED_UNLOADING_POINT = "assigned_unloading_point", "Assigned Unloading Point"
    LOADING_STARTED          = "loading_started",          "Loading Started"
    LOADING_COMPLETED        = "loading_completed",        "Loading Completed"
    UNLOADING_STARTED        = "unloading_started",        "Unloading Started"
    UNLOADING_COMPLETED      = "unloading_completed",      "Unloading Completed"
```

Add also a constant dict for the reset rule:

```python
# sub_state is cleared when these canonical statuses are written
SUB_STATE_RESET_ON_STATUS: frozenset[str] = frozenset({
    TOStatus.IN_TRANSIT_DESTINATION,  # leaves source after loaded + scale-out + gate-out
    TOStatus.DELIVERED_UNLOADED,      # yard chain complete at destination
    TOStatus.COMPLETED,
    TOStatus.CLOSED,
    TOStatus.CANCELLED,
})
```

### 1.4 `record_transition` helper (TLS-01 coordinate)

When any yard service writes a `sub_state` it must also log to `TOStatusTransitionLog`. Add an optional parameter:

```python
# apps/transport/lifecycle/timeline_service.py  (create file if it doesn't exist)
def record_yard_sub_state(to: TransportOrder, sub_state: str, actor) -> None:
    """
    Set TransportOrder.sub_state and append a TOStatusTransitionLog row.
    Clear sub_state when canonical status is in SUB_STATE_RESET_ON_STATUS.
    """
    with transaction.atomic():
        to.sub_state = sub_state
        to.save(update_fields=["sub_state", "updated_at"])
        TOStatusTransitionLog.objects.create(
            transport_order=to,
            from_status=to.status,
            to_status=to.status,   # sub_state change; canonical status unchanged
            sub_state=sub_state,
            actor=actor,
        )
```

> If `TOStatusTransitionLog` does not yet have a `sub_state` column, add it in the same migration (nullable `CharField(max_length=40)`).

### 1.5 Backward compatibility

- All existing code that reads `TransportOrder.status` is unaffected.
- `sub_state=""` is the default — no existing queryset breaks.
- `GATE_IN_ELIGIBLE_TO_STATUSES`, `GATE_IN_SUCCESS_TO_STATUS`, `GATE_OUT_ELIGIBLE_TO_STATUSES` in `apps/transport/constants.py` are unchanged.

---

## Step 2 — `UserOperationalPOI` model

### 2.1 Model — `apps/users/models.py`

```python
class UserOperationalPOI(TenantAwareModel):
    """Runtime POI assignment for yard operators. One primary entry per user/role/POI."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="operational_pois",
    )
    poi = models.ForeignKey("master_data.POI", on_delete=models.PROTECT)
    role = models.ForeignKey("core.Role", on_delete=models.PROTECT)
    is_primary = models.BooleanField(default=True)
    valid_from = models.DateField(null=True, blank=True)
    valid_to   = models.DateField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "poi", "role"],
                name="uniq_user_poi_role",
            )
        ]
        verbose_name = "Operational POI Assignment"
        verbose_name_plural = "Operational POI Assignments"

    def __str__(self):
        return f"{self.user} @ {self.poi} ({self.role})"
```

### 2.2 POI-scoped role catalog

Roles that **must** have a working POI before yard screens show data. Supervisors (`gate_supervisor`, `tenant_admin`) are **not** in this set — they remain unscoped per `YardAdminBase.supervisor_role_codes`.

Add to `apps/users/yard_constants.py` (new file — keeps invitation and yard logic in one place):

```python
# apps/users/yard_constants.py
POI_SCOPED_ROLE_CODES: frozenset[str] = frozenset({
    "gateman",
    "scaling_operator",
    "command_center_officer",
    "loading_personnel",
    "unloading_personnel",
    "qc_inspector_physical",
})

def role_requires_operational_poi(role_code: str | None) -> bool:
    return bool(role_code) and role_code in POI_SCOPED_ROLE_CODES
```

| Role code | Department (invite picker) | POI required |
|-----------|---------------------------|--------------|
| `gateman` | Gate Operations | Yes |
| `scaling_operator` | Scaling & Weight | Yes |
| `command_center_officer` | Operations | Yes |
| `loading_personnel` | Operations | Yes |
| `unloading_personnel` | Operations | Yes |
| `qc_inspector_physical` | QA/QC | Yes |
| `gate_supervisor` | — | No (unscoped supervisor) |
| `tenant_admin` | — | No |

### 2.3 Invite user — POI selection (primary “add user” path)

**Context:** `UserAdmin.has_add_permission` is `False` — new staff are created via **Invite user** (`InviteUserAdmin` / `InvitationToken`). `InvitationToken.poi` already exists on the model and `create_invitation(..., poi_id=...)` accepts it, but the admin form **never collects POI** (`poi_id=None` is hard-coded in `save_model` today).

**Requirement (YARD-01 AC-1, AC-2):** When the selected role is POI-scoped, the invite form must show a **Site (POI)** field, require it on submit, persist it on `InvitationToken.poi`, and create `UserOperationalPOI` on activation (§2.6 below).

#### 2.3.1 `InviteUserForm` — conditional POI field

```python
# apps/users/admin.py — extend InviteUserForm
from apps.users.yard_constants import POI_SCOPED_ROLE_CODES, role_requires_operational_poi

class InviteUserForm(forms.ModelForm):
    operational_poi = forms.ModelChoiceField(
        queryset=POI.objects.filter(is_active=True).order_by("name"),
        required=False,
        label="Site (POI)",
        help_text="Required for gate, scale, command center, loading, unloading, and QC roles.",
    )

    class Meta:
        model = InvitationToken
        fields = (
            "email",
            "invitee_first_name",
            "invitee_last_name",
            "employee_id",
            "otp_type",
        )

    def clean(self):
        data = super().clean()
        role_id_str = data.get("role") or data.get("_role_id")
        role_map = _build_role_map()
        role_info = role_map.get(str(role_id_str)) if role_id_str else None
        role_code = (role_info or {}).get("role_code")

        if role_requires_operational_poi(role_code):
            poi = data.get("operational_poi")
            if not poi:
                self.add_error(
                    "operational_poi",
                    "Select the site where this operator will work.",
                )
            elif not poi.is_active:
                self.add_error("operational_poi", "Selected site is not active.")
        else:
            # Non–POI-scoped roles: do not store a stray POI on the token
            data["operational_poi"] = None

        return data
```

#### 2.3.2 `InviteUserAdmin` — fieldsets and `save_model`

- Add `operational_poi` to **add** fieldset (after `role`, before `otp_type`).
- Add `poi` to **change** fieldset (read-only) for audit.
- Pass POI into `create_invitation`:

```python
def save_model(self, request, obj, form, change):
    ...
    poi = d.get("operational_poi")
    inv = create_invitation(
        ...
        poi_id=poi.pk if poi else None,
        sync_email=True,
    )
```

#### 2.3.3 `create_invitation` service validation

Enforce server-side (admin and API must not diverge):

```python
# apps/users/invitation_service.py — inside create_invitation(), after role resolved
from apps.users.yard_constants import role_requires_operational_poi

if role_requires_operational_poi(role.role_code):
    if not poi_id:
        raise ValidationError(
            {"operational_poi": "Site (POI) is required for this role."},
            code="INV-400-POI-REQUIRED",
        )
elif poi_id:
    raise ValidationError(
        {"operational_poi": "POI must not be set for this role."},
        code="INV-400-POI-NOT-ALLOWED",
    )
```

#### 2.3.4 Invite form UX — show/hide POI by role (JS)

Mirror the existing department auto-fill script (`_AUTO_DEPT_JS_TMPL`): on `#id_role` change, show `#id_operational_poi` row only when `roleMap[roleId].role_code` is in `POI_SCOPED_ROLE_CODES`; set `required` attribute client-side for clarity (server `clean()` remains authoritative).

List display: add `poi` column to `InviteUserAdmin.list_display` so admins can verify site on pending invites.

### 2.4 User change form — assign or change POI for existing users

**Context:** Tenant admin maintains **activated** users on `UserAdmin` change view (role dropdown + `UserOperationalPOI` inline). This satisfies AC-1 (“assign each operator to a site”) for users already in the system.

#### 2.4.1 `UserOperationalPOIInline`

```python
class UserOperationalPOIInline(admin.TabularInline):
    model = UserOperationalPOI
    fk_name = "user"
    extra = 0
    min_num = 0
    fields = ("poi", "role", "is_primary", "valid_from", "valid_to")
    autocomplete_fields = ("poi", "role")

    def get_extra(self, request, obj=None, **kwargs):
        # Encourage first assignment when editing a user with no rows yet
        if obj and not obj.operational_pois.exists():
            return 1
        return 0

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "role":
            with public_schema_context():
                kwargs["queryset"] = (
                    Role.objects.filter(is_active=True, role_code__in=POI_SCOPED_ROLE_CODES)
                    .order_by("role_name")
                )
        if db_field.name == "poi":
            kwargs["queryset"] = POI.objects.filter(is_active=True).order_by("name")
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

# UserAdmin.inlines = [UserOperationalPOIInline]
```

**Inline rules:**

- At least one row with `is_primary=True` per `(user, role)` that is POI-scoped when that role is the user’s active yard role (validate in `UserOperationalPOIInline.clean()` or `UserAdmin.save_formset`).
- `role` dropdown limited to `POI_SCOPED_ROLE_CODES` so tenant admin cannot attach a POI to `transport_planner` by mistake.
- Deleting the last POI row for a user who still has a POI-scoped `UserRole` → warning on save; yard screens will show empty queue (fail-closed) until reassigned.

#### 2.4.2 Optional: single POI on `UserAdminForm` when role changes

For simpler UX (one role per user today), add optional `operational_poi` to `UserAdminForm` shown when selected `role` is POI-scoped (same JS pattern as invite). On `UserAdmin.save_model`, after `assign_role_to_user`:

```python
poi = form.cleaned_data.get("operational_poi")
role_id = form.cleaned_data.get("role")
if poi and role_id:
    with public_schema_context():
        role = Role.objects.filter(pk=role_id).first()
    if role and role_requires_operational_poi(role.role_code):
        UserOperationalPOI.objects.update_or_create(
            user=obj,
            poi=poi,
            role=role,
            defaults={"is_primary": True},
        )
```

Use **either** the inline (multi-site history) **or** the form field (single-site UX), not both as required paths — inline is the canonical store; form field is a convenience wrapper that upserts one row.

#### 2.4.3 Standalone admin (optional)

Register `UserOperationalPOI` on its own `ModelAdmin` for bulk audit (“all gatemen at Depot A”) — not required for YARD-01 MVP if inline is sufficient.

### 2.6 Invitation activation — `UserOperationalPOI` upsert

In `InvitationToken.activate()` (or wherever `is_used=True` is set), upsert `UserOperationalPOI`:

```python
if invitation.poi_id and invitation.role_id:
    UserOperationalPOI.objects.update_or_create(
        user=user,
        poi_id=invitation.poi_id,
        role_id=invitation.role_id,
        defaults={"is_primary": True},
    )
```

### 2.7 One-time data migration

```python
# Data migration: backfill from InvitationToken where poi is set
# Use InvitationToken.email to find the User, then create UserOperationalPOI
# Only backfill where no UserOperationalPOI already exists for that user + poi
```

Write as a separate `RunPython` data migration after the schema migration.

### 2.8 `InvitationToken.invitee` bug fix

`gate_poi.py` queries `InvitationToken.objects.filter(invitee=request.user, …)` but `InvitationToken` has no `invitee` FK — it has `email`. This currently silently fails (the `except Exception` swallows it).

**Fix:** once `UserOperationalPOI` exists, `default_gate_poi_for_user` reads from it instead. The `InvitationToken` fallback in `gate_poi.py` can be removed in the same PR (Step 3 below handles this).

---

## Step 3 — `yard_poi.py` (shared POI resolution)

New file: `apps/operations/yard_poi.py`

```python
"""
Shared working-POI resolution for all yard operator roles.
Replaces InvitationToken fallback used by gate_poi.py.
"""

import uuid
from django.http import HttpRequest
from apps.master_data.models import POI

SESSION_KEY = "dfms_active_poi_id"

# Roles that may see ALL POIs (no scoping)
YARD_UNSCOPED_ROLES = frozenset({"gate_supervisor", "tenant_admin"})


def get_working_poi_for_request(request: HttpRequest, *, role_code: str) -> POI | None:
    """
    Resolution order:
    1. Session key dfms_active_poi_id
    2. UserOperationalPOI primary for this role
    Fail-closed: returns None — caller must show empty queryset + banner.
    """
    poi_id = _poi_id_from_session(request)
    if poi_id:
        poi = POI.objects.filter(pk=poi_id, is_active=True).first()
        if poi:
            return poi

    from apps.users.models import UserOperationalPOI
    assignment = (
        UserOperationalPOI.objects
        .filter(
            user=request.user,
            role__role_code=role_code,
            is_primary=True,
            poi__is_active=True,
        )
        .select_related("poi")
        .first()
    )
    return assignment.poi if assignment else None


def get_working_poi_id_from_request(request: HttpRequest, *, role_code: str) -> uuid.UUID | None:
    poi = get_working_poi_for_request(request, role_code=role_code)
    return poi.pk if poi else None


def set_active_poi_session(request: HttpRequest, poi_id: uuid.UUID) -> None:
    request.session[SESSION_KEY] = str(poi_id)


def _poi_id_from_session(request: HttpRequest) -> uuid.UUID | None:
    raw = request.session.get(SESSION_KEY) or request.GET.get("active_poi")
    if not raw:
        return None
    try:
        return uuid.UUID(str(raw))
    except (TypeError, ValueError):
        return None
```

### 3.1 Refactor `gate_poi.py` for backward compatibility

`gate_poi.py` keeps its public API (`get_gate_poi_for_request`, `set_gate_poi_session`, `gate_poi_queryset_for_user`) intact so existing gate admin code requires zero changes. Internally, delegate to `yard_poi`:

```python
# apps/operations/gate/gate_poi.py  — keep old SESSION_KEY as alias
SESSION_KEY = "dfms_gate_poi_id"          # kept for backward compat

def default_gate_poi_for_user(request: HttpRequest) -> POI | None:
    # Try the new unified resolver first
    from apps.operations.yard_poi import get_working_poi_for_request
    poi = get_working_poi_for_request(request, role_code="gateman")
    if poi:
        return poi
    # Legacy session key fallback (one-release window)
    raw = request.session.get(SESSION_KEY)
    if raw:
        try:
            return POI.objects.filter(pk=uuid.UUID(raw), is_active=True).first()
        except (TypeError, ValueError):
            pass
    return None
```

**Remove** the `InvitationToken.invitee` query — it was a no-op due to the missing field anyway.

No functional regression for existing gateman or gate_supervisor sessions.

---

## Step 4 — `yard_leg` on `GateVisitSession`

### 4.1 Constants — add to `apps/operations/gate/constants.py`

```python
class YardLeg(models.TextChoices):
    SOURCE      = "source",      "Source (Origin)"
    DESTINATION = "destination", "Destination"
```

### 4.2 Model field

```python
# apps/operations/gate/models.py — GateVisitSession
yard_leg = models.CharField(
    max_length=15,
    choices=YardLeg.choices,
    blank=True,
    default="",
    db_index=True,
)
```

Migration: add nullable-then-default or `blank=True, default=""` — **no data loss**.

### 4.3 Set at gate-in time

In `gate_services.create_gate_in()`, inside the `atomic()` block that creates the session:

```python
from .constants import YardLeg

yard_leg = (
    YardLeg.SOURCE
    if to.origin_poi_id == poi.pk
    else YardLeg.DESTINATION
)
session.yard_leg = yard_leg
session.save(update_fields=["yard_leg"])
```

### 4.4 Backfill migration for existing sessions

```python
# RunPython data migration
def backfill_yard_leg(apps, schema_editor):
    GateVisitSession = apps.get_model("operations", "GateVisitSession")
    for session in GateVisitSession.objects.select_related("transport_order").iterator():
        if not session.transport_order_id:
            continue
        to = session.transport_order
        if session.poi_id == to.origin_poi_id:
            session.yard_leg = "source"
        elif session.poi_id == to.destination_poi_id:
            session.yard_leg = "destination"
        else:
            continue
        session.save(update_fields=["yard_leg"])
```

### 4.5 Backward compatibility

`yard_leg=""` for on-demand TOs where origin/destination may not match (e.g. GT-02 dealer delivery) — consuming code must handle blank gracefully with `if session.yard_leg:` guards.

---

## Step 5 — `YardAdminBase`

New file: `apps/operations/admin_base.py`

```python
"""
Shared base for all yard operator Django admin classes (YARD-01).
Gate admin is the reference implementation; all other yard roles subclass this.
"""
from __future__ import annotations
import uuid
from django.contrib import admin
from apps.core.admin import RequiredFieldMarkAdminMixin, TenantOnlyAdminMixin

NO_POI_MESSAGE = (
    "Your account has no site assigned for this role. "
    "Contact your Tenant Admin to be assigned to a site before using this screen."
)


class YardAdminBase(RequiredFieldMarkAdminMixin, TenantOnlyAdminMixin, admin.ModelAdmin):
    """
    POI-scoped base for gate, scale, CC, loading, unloading, and QC admins.

    Subclasses must declare:
        operator_role_code: str       — e.g. "scaling_operator"
        supervisor_role_codes: frozenset[str]
        read_perm: str                — PermissionCodes constant
        write_perm: str               — PermissionCodes constant
    """

    operator_role_code: str = ""
    supervisor_role_codes: frozenset[str] = frozenset()
    read_perm: str = ""
    write_perm: str = ""

    # ── POI resolution ────────────────────────────────────────────────────────

    def _scope_poi_id(self, request) -> uuid.UUID | None:
        """Return working POI id or None. None → supervisor (unscoped) or unassigned."""
        from apps.operations.yard_poi import get_working_poi_id_from_request
        role = self._yard_role(request)
        if role in self.supervisor_role_codes or getattr(request.user, "is_tenant_admin", False):
            return None  # supervisor: no scope restriction
        return get_working_poi_id_from_request(request, role_code=self.operator_role_code)

    def _yard_role(self, request) -> str | None:
        if request.user.has_role(self.operator_role_code):
            return self.operator_role_code
        for code in self.supervisor_role_codes:
            if request.user.has_role(code):
                return code
        return None

    # ── Queryset — fail-closed ────────────────────────────────────────────────

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        poi_id = self._scope_poi_id(request)
        role = self._yard_role(request)
        if role == self.operator_role_code:
            if poi_id is None:
                # Assigned operator but no POI resolved → empty + banner
                self.message_user(request, NO_POI_MESSAGE, level="warning")
                return qs.none()
            return qs.filter(poi_id=poi_id)
        # Supervisor / tenant admin: unscoped (or caller can add optional filter)
        return qs

    # ── Permissions ───────────────────────────────────────────────────────────

    def _has_perm(self, request, *, write: bool = False) -> bool:
        if self._is_platform(request):
            return False
        if self._yard_role(request):
            return True
        perms = request.user.get_all_permissions()
        if "*" in perms:
            return True
        code = self.write_perm if write else self.read_perm
        return code in perms

    def has_view_permission(self, request, obj=None):
        return self._has_perm(request, write=False)

    def has_add_permission(self, request):
        return self._has_perm(request, write=True)

    def has_change_permission(self, request, obj=None):
        return self._has_perm(request, write=True)

    def has_delete_permission(self, request, obj=None):
        return False
```

### 5.1 Gate admin migration to `YardAdminBase`

```python
# apps/operations/gate/admin.py
from apps.operations.admin_base import YardAdminBase

class GateAdminBase(YardAdminBase):
    operator_role_code = "gateman"
    supervisor_role_codes = frozenset({"gate_supervisor"})
    read_perm  = PermissionCodes.OPERATIONS_GATE_ENTRY_READ
    write_perm = PermissionCodes.OPERATIONS_GATE_ENTRY_CREATE

    # Keep _scope_poi_id override: gate uses get_gate_poi_for_request (session + URL)
    def _scope_poi_id(self, request):
        from .gate_poi import get_gate_poi_for_request
        poi = get_gate_poi_for_request(request)
        if poi:
            return poi.id
        if self._yard_role(request) in self.supervisor_role_codes or self._tenant_admin_allowed(request):
            return None
        return None
```

All existing `GateInAdmin`, `GateOutAdmin`, `GateVisitSessionAdmin`, `GateOnDemandTORequestAdmin` remain unchanged — they inherit through `GateAdminBase`.

**Regression test:** existing gate changelist scoping and permission checks must pass unchanged after this refactor.

---

## Step 6 — `YardContext` and allowed-operations policy

New file: `apps/operations/yard_context.py`

```python
"""
Yard context resolver and per-lane operation policy (YARD-01).
Used by SC-01, CC-01, LD-01, QC-01 admins and service layers.
"""
from dataclasses import dataclass, field
from typing import FrozenSet

from apps.transport.constants import FlowLane

# ── Policy table ──────────────────────────────────────────────────────────────
# Key: (flow_lane, yard_leg)  →  frozenset of allowed operation codes
OPERATIONS_BY_LEG_AND_LANE: dict[tuple, FrozenSet[str]] = {
    (FlowLane.FG_OUTBOUND,  "source"):      frozenset({"gate_in", "scale_in", "scale_out", "cc_assign_load", "loading", "gate_out"}),
    (FlowLane.FG_OUTBOUND,  "destination"): frozenset({"gate_in", "scale_in", "scale_out", "cc_assign_unload", "unloading", "gate_out"}),
    (FlowLane.FG_INBOUND,   "destination"): frozenset({"gate_in", "scale_in", "scale_out", "cc_assign_unload", "unloading", "gate_out"}),
    (FlowLane.RM_INBOUND,   "destination"): frozenset({"gate_in", "scale_in", "scale_out", "cc_flag_qc", "cc_assign_unload", "qc_sample", "qc_decision", "unloading", "gate_out"}),
}


@dataclass(frozen=True)
class YardContext:
    transport_order_id: object
    visit_session_id: object
    poi_id: object
    yard_leg: str          # "source" | "destination" | ""
    flow_lane: str         # FlowLane value
    allowed_operations: FrozenSet[str] = field(default_factory=frozenset)


def resolve_yard_context(*, visit) -> YardContext:
    """
    Given a GateVisitSession instance, return the YardContext.
    Returns allowed_operations=frozenset() if yard_leg is blank (GT-02 edge case).
    """
    to = visit.transport_order
    flow_lane = to.flow_lane if to else ""
    yard_leg = visit.yard_leg or ""
    allowed = OPERATIONS_BY_LEG_AND_LANE.get((flow_lane, yard_leg), frozenset())
    return YardContext(
        transport_order_id=to.pk if to else None,
        visit_session_id=visit.pk,
        poi_id=visit.poi_id,
        yard_leg=yard_leg,
        flow_lane=flow_lane,
        allowed_operations=allowed,
    )


def assert_operator_poi(user, poi_id) -> None:
    """
    Raise PermissionError if the user has no UserOperationalPOI for this poi_id.
    Used by service-layer guards (not only admin).
    """
    from apps.users.models import UserOperationalPOI
    if not UserOperationalPOI.objects.filter(
        user=user, poi_id=poi_id
    ).exists():
        raise PermissionError(f"User is not assigned to POI {poi_id}.")
```

---

## Step 7 — Cross-module schema fixes

These are schema corrections required before SC-01 / CC-01 / LD-01 / QC-01 migrations.

### 7.1 `QueueEntry.qc_passed`

Add to CC-01's `QueueEntry` model when it is created:

```python
qc_passed = models.BooleanField(
    null=True, blank=True,
    help_text="null=N/A (FG lanes); True=QC passed; False=failed/resampled"
)
```

**Not** a YARD-01 migration — include in CC-01 (DFS-056-1).

### 7.2 `UnloadEvent.cancelled_by_resample`

Add to LD-01's `UnloadEvent` model:

```python
cancelled_by_resample = models.BooleanField(
    default=False,
    help_text="True when QC-01 resample or override-to-fail cancelled this unload."
)
```

**Not** a YARD-01 migration — include in LD-01 (DFS-057-1).

### 7.3 `WaitingSerial` ↔ `BayAssignment` (circular FK fix)

In `command-center-loading-sprint4.md` §1.2–§1.3, both sides hold a OneToOne FK to each other. This creates a circular create-order deadlock.

**Fix:** only `WaitingSerial` holds the FK:

```python
class WaitingSerial(TenantAwareModel):
    bay_assignment = models.OneToOneField(
        BayAssignment, on_delete=models.CASCADE, related_name="waiting_serial"
    )
    ...
```

Remove `waiting_serial` FK from `BayAssignment`. Access via `assignment.waiting_serial` (reverse relation).

**Not** a YARD-01 migration — include in CC-01 (DFS-056-1).

---

## Backward compatibility summary


| Change                                      | Risk                                       | Mitigation                                                                                    |
| ------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `TransportOrder.sub_state` added            | Zero — blank default                       | No existing queryset filter touches this field                                                |
| `GateVisitSession.yard_leg` added           | Zero — blank default                       | All existing gate code reads `poi` directly; `yard_leg` only consumed by new SC/CC/LD/QC code |
| `gate_poi.py` refactored to call `yard_poi` | Low — session key preserved, API unchanged | Gate admin tests must pass unchanged; legacy `dfms_gate_poi_id` session key still resolved    |
| `UserOperationalPOI` model added            | Zero — new table                           | Existing `InvitationToken.poi` data untouched; invite activation gains a side-effect          |
| Invite form POI field for POI-scoped roles  | Low — new required field on invite         | Existing pending invites without POI remain valid until role is POI-scoped on reinvite          |
| `GateAdminBase` → inherits `YardAdminBase`  | Low — method signatures unchanged          | Existing gate admin tests validate no regression                                              |
| `InvitationToken.invitee` query removed     | Beneficial — was a latent bug              | Silently failed before; now replaced by correct `UserOperationalPOI` lookup                   |


---

## Django Admin UI — design system consistency (required for all yard modules)

YARD-01 establishes shared admin infrastructure; every downstream yard plan (GT, SC, CC/LD, QC) must render inside the **existing DFMS Django admin shell** (Sprint 1 PAP-01). `YardAdminBase` is the enforcement point — all subclasses inherit the same pagination, tenant scoping, and global styling automatically.

| Asset | Purpose |
|-------|---------|
| `static/admin/css/custom.css` | Full design system: `--dfms-*` tokens, `[data-theme="dark"]`, tables (`#result_list`), cards (`.module`), buttons (`dfms-btn-*`), pagination, forms, stat cards (`dfms-stat-card`) |
| `static/admin/js/dfms_theme.js` | Light/dark toggle (`localStorage` key `dfms-admin-theme`) |
| `templates/admin/base_site.html` | Shell; all operator pages load through this |
| `apps/core/admin.py` | `DynamicPaginationMixin`, `TenantOnlyAdminMixin`, `RequiredFieldMarkAdminMixin` |
| `apps/operations/gate/admin.py` | Reference for badge `format_html`, readonly panels, changelist columns |
| `DFMS-product-context/07-design-system/02-components/data-display.md` | Badge modifier catalogue — add new states here + `custom.css`, never inline |
| `.cursor/rules/django-admin-draft-submit.mdc` | Draft/submit, breadcrumbs, button classes |

**Rules for `YardAdminBase` and all subclasses**

1. **Do not override global theme assets** — no per-module CSS files; module-specific needs use `dfms-*` classes already in `custom.css`.
2. **Pagination**: `TenantOnlyAdminMixin` provides `DynamicPaginationMixin` and `admin/dynamic_pagination_changelist.html` — do not disable unless extending that template.
3. **Badges & icons**: `format_html` + `dfms-badge--{modifier}` + `bi-*` (10px); variables handle light/dark automatically.
4. **Buttons, tables, cards**: Same classes and DOM patterns as gate admin; POI warning banners use `message_user` + standard `messagelist` styling.
5. **Light/dark verification**: Any new `change_form.html` or readonly panel must be checked in both themes before merge.
6. **New UI components**: If a yard screen needs a pattern not in `custom.css` (e.g. a new dashboard card), extend `custom.css` and `data-display.md` once for all modules — not per-app overrides.

---

## Django admin best practices applied

1. **Fail-closed `get_queryset`**: operator without POI → `qs.none()` + `message_user` warning. Never leaks cross-tenant or cross-POI data.
2. `**save_model` → service layer only**: admin classes do not contain business logic. Each yard admin calls a named service method (e.g. `ScaleInService.record_scale_in(...)`).
3. **No `has_delete_permission`**: all yard records are immutable audit entries; delete returns `False`.
4. **Autocomplete FKs scoped at `formfield_for_foreignkey`**: visit/session autocompletes are filtered to `poi_id=_scope_poi_id(request)` before rendering the field, not only on save.
5. `**readonly_fields` after completion**: once a record is terminal (scale-out done, load completed), `get_readonly_fields` returns all fields.
6. `**message_user` over `ValidationError` for POI-scope issues**: field-level `ValidationError` in `save_model` does not display cleanly in Django admin; use `self.message_user(request, msg, level=messages.ERROR)` + `return` instead.
7. **Breadcrumbs**: link directly to model changelist, not `admin:app_list` (per project rule `django-admin-draft-submit.mdc`).

---

## Files to create / modify


| File                                                             | Action                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/transport/models.py`                                       | Add `sub_state` field                                             |
| `apps/transport/constants.py`                                    | Add `TOSubState`, `SUB_STATE_RESET_ON_STATUS`                     |
| `apps/transport/lifecycle/timeline_service.py`                   | Create / extend with `record_yard_sub_state`                      |
| `apps/transport/migrations/XXXX_transport_order_sub_state.py`    | New migration                                                     |
| `apps/users/models.py`                                           | Add `UserOperationalPOI` model                                    |
| `apps/users/migrations/XXXX_user_operational_poi.py`             | New schema migration                                              |
| `apps/users/migrations/XXXX_backfill_user_operational_poi.py`    | Data migration (RunPython)                                        |
| `apps/users/yard_constants.py`                                 | **Create** — `POI_SCOPED_ROLE_CODES`, `role_requires_operational_poi()` |
| `apps/users/admin.py`                                            | `InviteUserForm` POI field + JS; `InviteUserAdmin.save_model` passes `poi_id`; `UserOperationalPOIInline` on `UserAdmin` |
| `apps/users/invitation_service.py`                             | Require `poi_id` when role ∈ `POI_SCOPED_ROLE_CODES`; upsert `UserOperationalPOI` on activation |
| `apps/operations/yard_poi.py`                                    | **Create**                                                        |
| `apps/operations/yard_context.py`                                | **Create**                                                        |
| `apps/operations/admin_base.py`                                  | **Create** (`YardAdminBase`)                                      |
| `apps/operations/gate/constants.py`                              | Add `YardLeg`                                                     |
| `apps/operations/gate/models.py`                                 | Add `yard_leg` to `GateVisitSession`                              |
| `apps/operations/gate/gate_poi.py`                               | Refactor to delegate to `yard_poi`; remove broken `invitee` query |
| `apps/operations/gate/admin.py`                                  | `GateAdminBase` → inherits `YardAdminBase`                        |
| `apps/operations/gate/gate_services.py`                          | Set `yard_leg` in `create_gate_in()`                              |
| `apps/operations/migrations/XXXX_gate_visit_session_yard_leg.py` | Schema + data migration                                           |


---

## Test targets


| Test                                                                       | Type              | What to verify                                                      |
| -------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Gate changelist scoping unchanged after `YardAdminBase` refactor           | Admin unit        | Gateman sees only their POI; supervisor unscoped                    |
| `default_gate_poi_for_user` after `InvitationToken.invitee` removal        | Unit              | Returns POI from `UserOperationalPOI`; returns None when unassigned |
| Operator without `UserOperationalPOI` → `qs.none()` + warning              | Admin unit        | Any yard admin subclass of `YardAdminBase`                          |
| Cross-POI denial                                                           | Admin integration | Operator seeded at POI A does not see sessions at POI B             |
| `yard_leg` set correctly for FG outbound source and RM inbound destination | Unit              | `create_gate_in` service test                                       |
| `yard_leg` blank for GT-02 on-demand where origin=destination              | Edge case         | On-demand TO with same POI both ends                                |
| `resolve_yard_context` returns correct `allowed_operations` per lane×leg   | Unit              | Cover all four matrix cells                                         |
| Invite gateman without POI → validation error                              | Admin / API unit  | `InviteUserForm.clean` + `create_invitation` reject                 |
| Invite gateman with POI → token.poi set; activation creates assignment     | Integration       | `UserOperationalPOI` row matches invite POI + role                  |
| Change user role to `scaling_operator` without POI inline → yard empty     | Admin integration | Fail-closed queue after save                                          |
| User inline: add POI + role for existing user                              | Admin integration | `yard_poi.get_working_poi_for_request` returns assigned POI           |
| `record_yard_sub_state` writes both `TO.sub_state` and log row atomically  | Unit              | Rollback test: if log insert fails, TO field not written            |


