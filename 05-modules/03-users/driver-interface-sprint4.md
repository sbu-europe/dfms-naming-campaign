---
module: 03-users
specification: Driver Interface (Sprint 4 — TO Execution, Responsive Web)
version: 3.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-15
related_stories: DFS-053 (DM-01)
jira_epic: DFS-071
---

# Driver Interface Specification (Sprint 4 — Responsive Web)

## Overview

The **Driver Interface** provides field drivers with a **mobile-responsive Django Admin web application** (not a native mobile app) to view assigned Transport Orders, record TLS-01 execution transitions, and capture Proof of Delivery (POD). Drivers access this interface through their mobile browser (Chrome, Safari) or tablet.

**Sprint 4 scope explicitly excludes**: map, turn-by-turn navigation, background GPS tracking — deferred to a later sprint.

The driver sees **only TOs assigned to them** that are in **Ready for Dispatch** status or any downstream TLS-01 execution state through **Closed**. Execution transition controls are **disabled** until the Driver Supervisor completes **DS-01** dispatch (TO moves to `Dispatched`). The TO is the single execution container — **no separate Trip entity in Sprint 4**.

**Technology**: Django Admin responsive web application (mobile-first CSS). No custom SPA or separate frontend framework.

**Module path**: `apps/transport/` (models, services) + `apps/transport/admin.py` (driver admin views)  
**App label**: `transport` (existing app — new models added here, not a separate sub-package)  
**Dependencies**: `05-transport` (TransportOrder, TLS-01 state machine), `08-fleet-management` (fleet availability — §6.8.1.7), `01-foundation` (auth)  
**Enables**: Driver field execution, TLS-01 milestone transitions, POD capture, TO closure trigger

---

## 0. Menu Structure & Navigation

### 0.1 Portal navigation entries

Add to `PORTAL_NAV_SECTIONS` in `apps/core/portal_navigation.py` under a **"Driver operations"** section (new section; append after Fleet operations):

| Item id | Label | Admin URL | `permission_any` | `role_any` |
|---------|-------|-----------|-----------------|------------|
| `driver_my_tos` | My Transport Orders | `/admin/transport/transportorder/?assigned_driver=me` | `TRANSPORT_DRIVER_TO_VIEW` | `driver` |
| `driver_pod_records` | POD Records | `/admin/transport/proofofdelivery/` | `TRANSPORT_DRIVER_POD_VIEW` | `driver`, `driver_supervisor`, `tdo` |

`/assigned_driver=me` is resolved server-side via a custom `ChangeList.get_queryset` override — the literal query param `me` maps to `request.user` in `DriverTransportOrderAdmin`.

### 0.2 Responsive Django Admin as driver UI

The driver mobile interface is delivered as **Django Admin custom views and templates** that are fully responsive (mobile-first). No separate SPA or REST-only frontend in Sprint 4.

```
Driver operations (portal)
├── My Transport Orders (portal)    — driver's own TO list; tabs via changelist filter
│     └── [row click] ──► TO Detail (custom admin change view, read + action buttons)
│           ├── Header: TO Number, Status badge, Flow lane, Route
│           ├── Dispatch gate banner: "Awaiting dispatch by supervisor" (if Ready for Dispatch)
│           ├── TLS-01 Status: current status + allowed next transitions (lane-filtered)
│           ├── Execution actions: [Advance to <Next Status>] button (disabled until Dispatched)
│           ├── Milestones timeline: completed steps ✓, current step ●, pending grayed
│           ├── POD Section (enabled only when status = Completed)
│           │     └── File upload form (1–3 files: JPEG/PNG/PDF)
│           └── [View full TO details] — read-only TO fields (product, POIs, qty, etc.)
│
└── POD Records (portal)            — read-only for support/supervisor; ProofOfDeliveryAdmin
```

### 0.3 Role → access mapping

| Role | My Transport Orders | TO Detail | Record Transitions | Submit POD |
|------|:-------------------:|:---------:|:-----------------:|:----------:|
| Driver | ✓ (own TOs only) | ✓ (own TOs) | ✓ (post-Dispatch) | ✓ (at Completed) |
| Driver Supervisor | Read-only (all drivers) | ✓ | — | — |
| TDO | — | — | — | — |
| Support / Admin | POD Records (read-only) | — | — | — |

---

## 1. User Flow

### 1.1 Login & Home Screen

```
Driver opens web browser on mobile device (Chrome, Safari, Firefox)
  └─► Navigate to: https://[tenant].dfms.com/admin/
  └─► Login with credentials
        └─► Redirect to: My Transport Orders
              Default filter: In Progress (Dispatched + later)
              └─► Empty state: "No active TOs. Check the Awaiting Dispatch filter."
```

### 1.2 TO List View

Django Admin changelist (`DriverTransportOrderAdmin`) with **custom filter tabs** rendered as a top bar in the changelist template. Tabs map to TLS-01 status groups:

| Tab | TO TLS-01 status filter |
|-----|------------------------|
| **Awaiting Dispatch** | `Ready for Dispatch` |
| **In Progress** | `Dispatched`, `In Transit – Source`, `At Source`, `Loaded / Pickup Completed`, `In Transit – Destination`, `At Destination`, `Delivered / Unloaded` |
| **Completed** | `Completed` |
| **Closed** | `Closed` |

**List columns** (`list_display`):
- TO Reference, Flow Lane badge, Current TLS-01 Status badge, Pickup POI, Drop POI, Product / Qty, Urgency, Updated At

**Card-style rendering on mobile** (custom `change_list.html` override for this admin): rows stack vertically on screens < 640px using CSS responsive table pattern from `custom.css` design tokens.

Tap/click a row → TO Detail page.

### 1.3 TO Detail Screen

Custom change-view template (`templates/admin/transport/transportorder/driver_detail.html`) extending base `change_form.html`:

**Header Section**:
- TO Reference (large), TLS-01 Status badge (color-coded per `dfms-*` design tokens), Flow Lane badge
- Route: Pickup POI → Drop POI
- Product: item code, name, quantity (MT), urgency, special instructions

**Dispatch Gate Banner** (shown when status = `Ready for Dispatch`):
```
⚠ Awaiting dispatch by supervisor — execution actions are disabled until this TO is dispatched.
```
All transition buttons are rendered but `disabled` with `aria-disabled="true"`.

**Execution Transitions Section** (shown when status = `Dispatched` or later):
- Current TLS-01 status
- `allowed_next_transitions` (lane-filtered per TLS-01): rendered as action buttons
  - Example (FG outbound, current = `Dispatched`): `[→ In Transit – Source]`
  - Example (RM inbound, current = `Dispatched`): `[→ In Transit – Destination]` (source-leg buttons absent)
- Each button POSTs to `driver-transition` action URL

**POD Section** (shown when status = `Completed`):
- File upload (1–3 files, JPEG/PNG/PDF, HTML5 `<input type="file" multiple accept=...>`)
- Notes textarea (optional)
- `[Submit POD]` button → POSTs to `driver-pod-upload` action URL

**Vehicle & Crew Section** (read-only):
- Vehicle registration + type, Driver name, Helpers

**Transition History** (read-only):
- Chronological list of TLS-01 events for this TO (from `TOStatusTransitionLog`)

---

## 2. Data Model

> All new models extend `TenantAwareModel` (provides `id` UUID pk, `created_at`, `updated_at`). Tenant isolation is at the PostgreSQL schema level — no `tenant_id` column.

### 2.1 ProofOfDelivery (new model in `apps/transport/`)

```python
class ProofOfDelivery(TenantAwareModel):
    transport_order = models.OneToOneField(
        "transport.TransportOrder",
        on_delete=models.PROTECT,
        related_name="proof_of_delivery",
    )
    notes = models.TextField(blank=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="pod_submissions",
    )
    submitted_at = models.DateTimeField()

    class Meta:
        app_label = "transport"
        db_table = "transport_proof_of_delivery"
        verbose_name = "Proof of Delivery"
        verbose_name_plural = "Proofs of Delivery"
```

**Constraint**: OneToOne on `transport_order` — one POD per TO.

### 2.2 ProofOfDeliveryFile (new model in `apps/transport/`)

```python
class ProofOfDeliveryFile(TenantAwareModel):
    POD_FILE_TYPES = [("jpeg", "JPEG"), ("png", "PNG"), ("pdf", "PDF")]

    proof_of_delivery = models.ForeignKey(
        ProofOfDelivery,
        on_delete=models.CASCADE,
        related_name="files",
    )
    file = models.FileField(upload_to="pod_files/%Y/%m/")
    file_type = models.CharField(max_length=4, choices=POD_FILE_TYPES)
    file_size_bytes = models.PositiveIntegerField()

    class Meta:
        app_label = "transport"
        db_table = "transport_proof_of_delivery_file"
```

**Constraints**:
- At most **3** files per `ProofOfDelivery` — enforced in `ProofOfDeliveryService.submit()` and the upload API.
- Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf` — validated in serializer and service.
- JPEG/PNG files are auto-compressed before storage (see §6.2). PDF stored as-is within size limit.

### 2.3 ExecutionMilestone (new model in `apps/transport/`)

> **Design note**: `ExecutionMilestone` records driver-captured evidence (photo, timestamp, notes) for milestones that the driver reports. It does **not** replace TLS-01 transitions — it is supplementary evidence. The canonical TO status lives in `TransportOrder.tls_status` and `TOStatusTransitionLog`. The milestone record is created *alongside* the TLS-01 transition call, not instead of it.

```python
class ExecutionMilestone(TenantAwareModel):
    MILESTONE_TYPES = [
        ("in_transit_source", "In Transit – Source"),
        ("at_source", "At Source"),
        ("loaded_pickup_completed", "Loaded / Pickup Completed"),
        ("in_transit_destination", "In Transit – Destination"),
        ("at_destination", "At Destination"),
        ("delivered_unloaded", "Delivered / Unloaded"),
    ]

    transport_order = models.ForeignKey(
        "transport.TransportOrder",
        on_delete=models.PROTECT,
        related_name="execution_milestones",
    )
    milestone_type = models.CharField(max_length=40, choices=MILESTONE_TYPES)
    recorded_at = models.DateTimeField(auto_now_add=True)
    actual_timestamp = models.DateTimeField()  # defaults to recorded_at; driver-editable
    recorded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="recorded_milestones",
    )
    notes = models.TextField(blank=True)
    photo = models.ImageField(upload_to="milestone_photos/%Y/%m/", null=True, blank=True)

    # Phase 2 geolocation — nullable
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        app_label = "transport"
        db_table = "transport_execution_milestone"
        unique_together = [("transport_order", "milestone_type")]
```

**Milestone types** map 1-to-1 to TLS-01 driver-allowed transitions (PRD status names). The `milestone_type` enum values are the canonical keys used when calling the TLS-01 transition API.

### 2.4 No parallel execution_state on TransportOrder

The existing `TransportOrder` model already carries TLS-01 status via `tls_status` (or equivalent — per TLS-01 spec). **Do not add a separate `execution_state` enum** to `TransportOrder` for driver milestones — it would create a parallel state machine diverging from TLS-01. The `flow_lane` field (`fg_outbound` / `fg_inbound` / `rm_inbound`) is the only driver-related field to add if not already present.

```python
# Add to TransportOrder only if not already present from Sprint 3 / TLS-01:
flow_lane = models.CharField(
    max_length=20,
    choices=[
        ("fg_outbound", "FG Outbound"),
        ("fg_inbound", "FG Inbound"),
        ("rm_inbound", "RM Inbound"),
    ],
    null=True, blank=True,
)
```

---

## 3. API Endpoints

**Security**: All driver endpoints scope queries to the authenticated driver. Non-owned TO requests return **404** (not 403) — prevents enumeration.

### 3.1 Driver TO List

```http
GET    /api/v1/driver/transport-orders
       → List TOs assigned to authenticated driver (Ready for Dispatch → Closed)
       → Query params: ?tab=awaiting_dispatch | in_progress | completed | closed
       → Response: [
           {
             to_id, to_number,
             tls_status,                               # PRD canonical status name (TLS-01)
             flow_lane,                                # fg_outbound | fg_inbound | rm_inbound
             can_execute: bool,                        # false when status = Ready for Dispatch
             awaiting_supervisor_dispatch: bool,       # true when status = Ready for Dispatch
             product: {item_code, name, quantity_mt},
             route: {source_poi_name, destination_poi_name},
             vehicle: {registration, type},
             urgency,
             updated_at
           }
         ]
```

### 3.2 Driver TO Detail

```http
GET    /api/v1/driver/transport-orders/{to_id}
       → Detailed TO view for driver (404 if not owned)
       → Response: {
           to_id, to_number,
           tls_status,                                # Current TLS-01 status (PRD name)
           flow_lane,
           can_execute: bool,
           awaiting_supervisor_dispatch: bool,
           allowed_next_transitions: [                # Lane-filtered; empty if not Dispatched yet
             {status_key, label, actor: "driver"}
           ],
           product: {item_code, name, quantity_mt, bags},
           route: {source_poi, destination_poi},
           vehicle: {registration, type},
           driver: {id, name},
           helpers: [{name}],
           eta: datetime,
           urgency,
           special_instructions,
           milestones: [
             {
               milestone_type, label,
               status: "completed" | "pending",
               actual_timestamp,
               notes, photo_url
             }
           ],
           pod: {
             pod_id, files: [{file_url, file_type}],
             notes, submitted_at
           } | null,
           timeline: [                                # From TOStatusTransitionLog (TLS-01)
             {status, timestamp, actor_name, completed: bool}
           ]
         }
```

### 3.3 Driver Transition (TLS-01)

```http
POST   /api/v1/driver/transport-orders/{to_id}/transitions
       → Driver triggers a TLS-01 transition
       → Body: {
           target_status: "in_transit_source",        # Must be in allowed_next_transitions
           actual_timestamp: "2026-05-06T09:30:00Z",  # Optional, defaults to now
           notes: "...",                              # Optional
           photo: <multipart file>                    # Optional (JPEG/PNG, auto-compressed)
         }
       → Side effects:
           1. Validate driver is assigned to TO (404 if not)
           2. Validate TO is Dispatched or later (400 with dispatch_gate error if Ready for Dispatch)
           3. Validate target_status is in allowed_next_transitions for TO's flow_lane (400 if invalid)
           4. On first post-Dispatch transition: §6.8.1.7 fleet availability validation
           5. Call TLS-01 transition service (sets canonical tls_status on TransportOrder)
           6. Create ExecutionMilestone record (evidence + photo if provided)
           7. Audit log entry
       → Response: {
           milestone_id,
           transport_order: {tls_status, allowed_next_transitions}
         }
       → Errors:
           400 {error: "dispatch_gate", detail: "TO is awaiting supervisor dispatch."}
           400 {error: "invalid_transition", detail: "Transition X not allowed for flow lane Y."}
           400 {error: "vehicle_under_maintenance", detail: "Vehicle DHK-1234 is under maintenance."}
           400 {error: "vehicle_unavailable", detail: "Vehicle DHK-1234 is assigned to another active TO."}
           400 {error: "driver_on_leave", detail: "Driver is on leave until 2026-05-15."}
```

### 3.4 POD Upload

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod
       → Driver submits Proof of Delivery
       → Body: multipart/form-data
           - files: 1 to 3 files (image/jpeg, image/png, application/pdf)
           - notes: text (optional)
       → Validations:
           - Driver must be assigned to TO (404 if not owned)
           - TO status must be Completed (400 if not)
           - 1–3 files required; reject if 0 or > 3
           - MIME type must be image/jpeg, image/png, or application/pdf
           - JPEG/PNG auto-compressed before storage; PDF within size limit
           - POD not already submitted (OneToOne enforced)
       → Side effects:
           1. Create ProofOfDelivery + ProofOfDeliveryFile records
           2. Trigger closure engine (POD-01)
           3. Audit log entry
       → Response: {
           pod_id,
           transport_order: {tls_status}
         }
```

### 3.5 POD Retrieve

```http
GET    /api/v1/driver/transport-orders/{to_id}/pod
       → Retrieve POD for this TO (404 if not owned or no POD submitted)
       → Response: {
           pod_id,
           files: [{file_url, file_type}],
           notes,
           submitted_by: {id, name},
           submitted_at
         }
```

### 3.6 Transition History

```http
GET    /api/v1/driver/transport-orders/{to_id}/timeline
       → Read-only TLS-01 transition history (delegates to TLS-01 timeline; 404 if not owned)
       → Response: [
           {status, timestamp, actor_name, actor_role, source_module}
         ]
```

---

## 4. Django Admin Configuration

> All admin classes use `TenantOnlyAdminMixin` (operational data lives in tenant schema). Follow the Sprint 4 admin contract from `SPRINT-4-IMPLEMENTATION-OVERVIEW.md §"Django Admin design language"`.

### 4.1 DriverTransportOrderAdmin (mobile-first driver view)

**Purpose**: Primary driver-facing interface. Scoped to authenticated driver's own TOs. Mobile-responsive via custom templates.

```python
class DriverTransportOrderAdmin(TenantOnlyAdminMixin, DynamicPaginationMixin, admin.ModelAdmin):
    # list_display — columns visible on changelist
    list_display = [
        "to_number", "flow_lane_badge", "tls_status_badge",
        "source_poi_name", "destination_poi_name", "product_summary", "urgency_badge", "updated_at"
    ]
    list_filter = ["tls_status_tab"]     # Custom SimpleListFilter mapping tabs to status groups
    search_fields = ["to_number"]
    ordering = ["-updated_at"]

    # Scoped to authenticated driver only
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.role == "driver":
            return qs.filter(assigned_driver=request.user)
        return qs  # supervisor/admin sees all

    def has_add_permission(self, request):
        return False  # drivers cannot create TOs

    def has_delete_permission(self, request, obj=None):
        return False
```

**Custom list filter** (`DriverTOTabFilter`): maps tab param to TLS-01 status groups (Awaiting Dispatch / In Progress / Completed / Closed).

**Custom change view** (`driver_detail.html`):
- Extends `templates/admin/change_form.html`
- Dispatch gate banner (when `tls_status = Ready for Dispatch`)
- TLS-01 transition action buttons (lane-filtered, disabled when awaiting dispatch)
- POD upload form section (enabled only when `tls_status = Completed`)
- Milestone timeline read-only section
- Uses `dfms-btn-*` CSS classes and Bootstrap Icons for all action buttons
- **Responsive**: CSS media queries stack columns on < 640px; touch targets ≥ 44px per WCAG 2.1 AA

**Custom action URLs** registered via `get_urls()`:
- `driver-transition/<to_id>/` — handles transition POST (calls `DriverTransitionService`)
- `driver-pod-upload/<to_id>/` — handles POD file upload POST (calls `ProofOfDeliveryService`)

### 4.2 ProofOfDeliveryAdmin (read-only, support/debug)

```python
class ProofOfDeliveryAdmin(TenantOnlyAdminMixin, DynamicPaginationMixin, admin.ModelAdmin):
    list_display = ["transport_order_ref", "submitted_by_name", "file_count", "submitted_at"]
    list_filter = ["submitted_at"]
    search_fields = ["transport_order__to_number", "submitted_by__username"]
    ordering = ["-submitted_at"]
    readonly_fields = ["transport_order", "submitted_by", "submitted_at", "notes", "file_previews"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
```

**`file_previews`** custom readonly field: renders inline `<img>` thumbnails for JPEG/PNG files and download links for PDF files in the change form.

### 4.3 ExecutionMilestoneAdmin (read-only, support/debug)

```python
class ExecutionMilestoneAdmin(TenantOnlyAdminMixin, DynamicPaginationMixin, admin.ModelAdmin):
    list_display = ["transport_order_ref", "milestone_type_display", "recorded_by_name", "actual_timestamp"]
    list_filter = ["milestone_type", "recorded_at"]
    search_fields = ["transport_order__to_number"]
    ordering = ["-actual_timestamp"]
    readonly_fields = [
        "transport_order", "milestone_type", "recorded_at", "actual_timestamp",
        "recorded_by", "notes", "photo_preview"
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
```

**`photo_preview`** custom readonly field: renders `<img>` thumbnail with max-width 400px if photo is present.

### 4.4 Admin registration and nav

```python
# apps/transport/admin.py
admin.site.register(TransportOrder, DriverTransportOrderAdmin)  # scoped view for drivers
admin.site.register(ProofOfDelivery, ProofOfDeliveryAdmin)
admin.site.register(ExecutionMilestone, ExecutionMilestoneAdmin)
```

> If `TransportOrder` is already registered (from Sprint 3 TDO admin), use `admin.site.unregister` + re-register with a unified admin class, or create a separate proxy model `DriverTransportOrder(TransportOrder)` with `class Meta: proxy = True` to maintain two independent admin registrations. Prefer the proxy approach to avoid disrupting existing TDO admin.

Portal nav entries are added to `PORTAL_NAV_SECTIONS` in `apps/core/portal_navigation.py` (see §0.1).

---

## 5. Service Layer

### 5.1 DriverTransitionService (`apps/transport/services/driver_transition_service.py`)

```python
def record_driver_transition(transport_order, target_status, driver, actual_timestamp=None, notes="", photo=None):
    """
    1. Assert driver is assigned to TO (raise PermissionDenied → 404).
    2. Assert TO tls_status is Dispatched or later (raise DispatchGateError → 400).
    3. Assert target_status is in allowed_next_transitions for TO's flow_lane (raise InvalidTransitionError → 400).
    4. If first post-Dispatch transition: call fleet_availability_service.validate(transport_order).
    5. Call TLS-01 transition service → updates TransportOrder.tls_status.
    6. Create ExecutionMilestone (evidence record; if photo provided: compress before save).
    7. Write audit log entry.
    """
```

**Lane-aware `allowed_next_transitions`**:

| Flow lane | Ordered driver-allowed transitions after Dispatched |
|-----------|-----------------------------------------------------|
| `fg_outbound` | In Transit – Source → At Source → Loaded / Pickup Completed → In Transit – Destination → At Destination → Delivered / Unloaded |
| `fg_inbound` | In Transit – Destination → At Destination → Delivered / Unloaded |
| `rm_inbound` | In Transit – Destination → At Destination → Delivered / Unloaded |

RM inbound and FG inbound: **source-leg transitions are rejected** with `invalid_transition` error if attempted.

**First post-Dispatch transition** (§6.8.1.7):
- FG outbound: first step = `In Transit – Source`
- FG inbound / RM inbound: first step = `In Transit – Destination`

### 5.2 ProofOfDeliveryService (`apps/transport/services/pod_service.py`)

```python
def submit_pod(transport_order, driver, files, notes=""):
    """
    1. Assert driver is assigned to TO (404 if not owned).
    2. Assert TO tls_status == Completed (400 if not).
    3. Assert 1 ≤ len(files) ≤ 3 (400 if violated).
    4. Validate MIME type for each file (jpeg/png/pdf).
    5. Compress JPEG/PNG files via image_compression utility.
    6. Create ProofOfDelivery + ProofOfDeliveryFile records.
    7. Call closure_engine.evaluate_closure_conditions(transport_order).
    8. Write audit log entry.
    """
```

### 5.3 FleetAvailabilityService (`apps/transport/services/fleet_availability_service.py`)

Called on first post-Dispatch driver transition (§6.8.1.7):

```python
def validate(transport_order):
    """
    Check vehicle not under maintenance.
    Check vehicle not already dispatched on another active TO.
    Check driver not on leave.
    Raise ValidationError with stable error code on failure.
    """
```

Error codes: `vehicle_under_maintenance`, `vehicle_unavailable`, `driver_on_leave`.

---

## 6. UI/UX — Responsive Admin Templates

### 6.1 Mobile-Responsive Design Constraints

The Django Admin shell already includes Bootstrap Icons and the `dfms-*` CSS design tokens (`static/admin/css/custom.css`). Driver-specific templates must:

- Use existing CSS variables (`--dfms-*`) — no new ad hoc inline styles
- Responsive table: for the TO list changelist, override `change_list.html` with a card-stack layout on < 640px using `@media` queries
- Touch targets: all action buttons min `44px` height (add `dfms-btn-touch-target` class or equivalent)
- Status badges: use existing `dfms-status-badge` classes for TLS-01 status display — do not introduce new badge styles
- Transition buttons: `dfms-btn-primary` style for the active next-transition button; `disabled` attribute + `dfms-btn-disabled` class when dispatch gate is active

**Templates to create**:
- `templates/admin/transport/transportorder/driver_detail.html` — custom change view for driver TO detail
- `templates/admin/transport/transportorder/driver_change_list.html` — mobile card-list changelist (optional; if full override needed)

Both extend `templates/admin/change_form.html` / `change_list.html` respectively.

### 6.2 Photo Capture & Compression

**Utility** (`apps/transport/utils/image_compression.py`):
- Input: uploaded `InMemoryUploadedFile` (JPEG or PNG)
- Max longest edge: 1920px (configurable via `settings.POD_MAX_IMAGE_DIMENSION`)
- Max file size after compression: 1 MB (configurable via `settings.POD_MAX_IMAGE_SIZE_BYTES`)
- Output format: JPEG, quality 85%
- Applied server-side in `ProofOfDeliveryService.submit_pod()` and `DriverTransitionService.record_driver_transition()`

**Mobile camera** (in driver detail template):
- `<input type="file" accept="image/jpeg,image/png,application/pdf" multiple capture="environment">` for direct camera access on mobile
- Fallback to file picker on desktop

### 6.3 POD Upload Form (in driver detail template)

- File slot display: shows 1–3 slots with `[Choose File]` inputs
- Accepted types label: "JPEG, PNG, or PDF (max 3 files)"
- `[Submit POD]` button: `dfms-btn-submit-primary` class; disabled with tooltip "POD can only be submitted when the TO is Completed" when status ≠ Completed

---

## 7. Business Rules

### 7.1 TO Visibility (Dispatch Gate)

- Driver sees TOs where `assigned_driver = request.user` AND `tls_status NOT IN (Cancelled)`
- TOs in `Ready for Dispatch`: visible in list and detail; **all transition controls disabled** with "Awaiting dispatch by supervisor" messaging
- TOs in `Dispatched` or later: transition controls enabled per flow lane
- Non-owned TO requests: **404** (not 403)

### 7.2 Execution Transitions (TLS-01, Lane-Aware)

- Driver can only trigger transitions where TLS-01 actor = Driver
- Valid transitions per lane defined in §5.1
- RM inbound and FG inbound: source-leg transitions (`In Transit – Source`, `At Source`, `Loaded / Pickup Completed`) are **never offered** and **rejected** if attempted
- Each transition calls TLS-01 service (canonical status update) and creates an `ExecutionMilestone` as evidence
- Invalid transition attempt (wrong order, wrong lane, wrong actor, yard-owned step): stable `invalid_transition` error

### 7.3 POD Submission

- Enabled **only** when `tls_status = Completed`; UI button disabled (with messaging) at all earlier states
- 1–3 files required; JPEG/PNG/PDF only
- JPEG/PNG auto-compressed before storage
- POD submission triggers closure engine (POD-01)
- POD is OneToOne per TO — second submission attempt returns 400

### 7.4 §6.8.1.7 Fleet Availability

On first driver transition after `Dispatched`:
- Vehicle not under maintenance
- Vehicle not dispatched on another active TO
- Driver not on leave

Failure: transition rejected with stable error code; driver sees descriptive message and must contact supervisor.

---

## 8. Integration Points

### 8.1 TLS-01 (Transport Lifecycle)

- Every driver transition calls TLS-01 transition service — canonical `tls_status` on `TransportOrder` is the source of truth
- `ExecutionMilestone` is supplementary evidence only — does not bypass TLS-01
- `allowed_next_transitions` is computed from TLS-01 state machine filtered by `flow_lane` and actor = Driver

### 8.2 POD-01 (Closure Engine)

- POD submission triggers `closure_engine.evaluate_closure_conditions(transport_order)`
- If all gates passed (per flow lane): TO moves to `Closed`
- If blocked (e.g., QC pending for RM inbound): TO stays; closure deferred

### 8.3 DS-01 (Supervisor Dispatch Gate)

- `DriverTransitionService` rejects all transitions while `tls_status = Ready for Dispatch`
- Dispatch gate is cleared exclusively by DS-01 supervisor action (TO → `Dispatched`)

### 8.4 Yard Operations (GT-01, SC-01, LD-01)

- Yard systems may authoritatively set certain TLS-01 states (gate-in, scale, unloading)
- Driver transition for a step already set by yard returns `invalid_transition` (TLS-01 deduplicates)
- `ExecutionMilestone` created by driver is complementary to yard events — both write to `TOStatusTransitionLog`

---

## 9. Permissions & RBAC

### 9.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
TRANSPORT_DRIVER_TO_VIEW = "Transport.Driver.TO.View"
TRANSPORT_DRIVER_TRANSITION_WRITE = "Transport.Driver.Transition.Write"
TRANSPORT_DRIVER_POD_SUBMIT = "Transport.Driver.POD.Submit"
TRANSPORT_DRIVER_POD_VIEW = "Transport.Driver.POD.View"
```

### 9.2 Role → Permission Mapping

**Driver**:
- `TRANSPORT_DRIVER_TO_VIEW` (own TOs only — enforced by queryset filter)
- `TRANSPORT_DRIVER_TRANSITION_WRITE`
- `TRANSPORT_DRIVER_POD_SUBMIT`
- `TRANSPORT_DRIVER_POD_VIEW`

**Driver Supervisor**:
- `TRANSPORT_DRIVER_TO_VIEW` (all drivers — queryset not scoped)
- `TRANSPORT_DRIVER_POD_VIEW`

**TDO / Dispatch Manager**:
- `TRANSPORT_DRIVER_POD_VIEW` (read-only POD/timeline)

Re-seed RBAC after permission changes: `python manage.py seed_dfms_rbac`. Users may need to log out and back in (permission cache TTL ~5 min).

---

## 10. Testing Scenarios

### 10.1 Happy Path — FG Outbound

1. Driver logs in → sees TO in "Awaiting Dispatch" tab (transition buttons disabled, banner shown)
2. Supervisor completes DS-01 → TO moves to `Dispatched`
3. Driver refreshes → "In Progress" tab; `[→ In Transit – Source]` button enabled
4. Driver taps button → §6.8.1.7 passes → milestone created, TLS-01 advances
5. Driver advances through: `At Source` → `Loaded / Pickup Completed` → `In Transit – Destination` → `At Destination` → `Delivered / Unloaded`
6. TLS-01 / yard/QC advance TO to `Completed`
7. Driver sees POD section enabled → uploads 1–3 files → [Submit POD]
8. Closure engine evaluates → TO → `Closed`; appears in "Closed" tab

### 10.2 Happy Path — RM Inbound

1. Driver sees TO in "Awaiting Dispatch", transitions disabled
2. After dispatch: `[→ In Transit – Destination]` button is the **first and only** option shown (source-leg absent)
3. Driver advances: `In Transit – Destination` → `At Destination` → `Delivered / Unloaded`
4. POD uploaded (up to 3 files) at `Completed`
5. TO closes after closure engine evaluation (QC + unloading gates cleared)

### 10.3 Dispatch Gate Rejection

1. Driver taps any transition while status = `Ready for Dispatch` (API path)
2. API returns 400: `{"error": "dispatch_gate", "detail": "TO is awaiting supervisor dispatch."}`
3. Admin UI: transition buttons are `disabled`; gate banner displayed

### 10.4 Source-Leg Rejection on RM Inbound

1. Driver (or API test) POSTs `target_status: "in_transit_source"` for RM inbound TO
2. API returns 400: `{"error": "invalid_transition", "detail": "Transition in_transit_source is not allowed for flow lane rm_inbound."}`

### 10.5 §6.8.1.7 Failure — Vehicle Under Maintenance

1. Driver taps first transition after Dispatch
2. API returns 400: `{"error": "vehicle_under_maintenance", "detail": "Vehicle DHK-1234 is under maintenance."}`
3. Admin UI shows error banner; driver contacts supervisor

### 10.6 POD Status Gate

1. Driver attempts POD upload while TO is `Delivered / Unloaded` (not yet `Completed`)
2. POD section in admin: upload form hidden / button disabled with tooltip "Awaiting TO Completion"
3. API: POST pod returns 400: `{"error": "pod_status_gate", "detail": "POD can only be submitted when the TO is Completed."}`

### 10.7 Security — Cross-Driver TO Access

1. Driver A GETs `/api/v1/driver/transport-orders/{to_id}` for Driver B's TO
2. API returns **404** — no information about the TO is leaked

### 10.8 POD File Validation

1. Driver uploads 4 files → 400: "Maximum 3 POD files allowed."
2. Driver uploads 0 files → 400: "At least 1 POD file required."
3. Driver uploads `.exe` file → 400: "Unsupported file type."

---

## 11. Sub-tasks (aligned with DM-01 story)

| # | Sub-task | Jira | Focus |
|---|----------|------|-------|
| DM-01-1 | `ProofOfDelivery` + `ProofOfDeliveryFile` models + migration | DFS-053-1 | FK to TO (OneToOne), up to 3 files, `submitted_by`, `submitted_at` |
| DM-01-2 | Driver TLS-01 transition integration | DFS-053-2 | `DriverTransitionService` — calls TLS-01; no parallel ad-hoc status enum; lane-aware guard |
| DM-01-3 | `ProofOfDeliveryAdmin` (read-only) | DFS-053-3 | `list_display` (TO ref, driver, file count, submitted_at), file previews in change form |
| DM-01-4 | Driver TO list API | DFS-053-4 | `GET /api/v1/driver/transport-orders` — scoped to driver; `can_execute` / `awaiting_supervisor_dispatch` flags |
| DM-01-5 | Driver TO detail API | DFS-053-5 | `GET /api/v1/driver/transport-orders/{to_id}` — `flow_lane`, `tls_status`, `allowed_next_transitions` (lane-filtered), POIs, product, qty, urgency, instructions |
| DM-01-6 | Driver transition API | DFS-053-6 | `POST /api/v1/driver/transport-orders/{to_id}/transitions` — dispatch gate + lane guard + §6.8.1.7 |
| DM-01-7 | POD upload API + media storage | DFS-053-7 | `POST /api/v1/driver/transport-orders/{to_id}/pod` — 1–3 files, MIME validation, status gate |
| DM-01-8 | §6.8.1.7 fleet availability validation | DFS-053-8 | `FleetAvailabilityService.validate()` — invoked on first post-Dispatch transition |
| DM-01-9 | Photo compression utility | DFS-053-9 | `apps/transport/utils/image_compression.py` — JPEG/PNG only; max dimension + size |
| DM-01-10 | Mobile/responsive admin UI | DFS-053-10 | `DriverTransportOrderAdmin` + custom templates — TO list tabs, detail with transition buttons, POD upload form; responsive ≥ 320px; touch targets 44px |
| DM-01-11 | Audit logging | DFS-053-11 | Audit trail on every driver transition and POD submission (user, timestamp, TO ref, action) |

---

## 12. Sprint 4 Story Mapping

| Story | Scope |
|-------|-------|
| **DM-01** | TO list, TLS-01 execution transitions, POD capture |

---

## 13. Dependencies

### Upstream
- `05-transport`: `TransportOrder` model, `tls_status` field, TLS-01 transition service, `TOStatusTransitionLog`
- `08-fleet-management`: fleet availability validation (§6.8.1.7 — vehicle maintenance, driver leave) via `FleetAvailabilityService`
- `01-foundation`: Auth, RBAC
- **DS-01** (Sprint 4): Supervisor dispatch gate — sets TO to `Dispatched`
- **TO-02** (Sprint 3): TDO assignment — sets TO to `Ready for Dispatch`, assigns `flow_lane`

### Downstream
- `05-transport/lifecycle`: TLS-01 timeline, POD-01 closure engine
- `06-poi-operations`: Yard events complement driver milestones (GT-01, SC-01, LD-01)

---

## 14. Future Enhancements (Phase 2)

- **Native Mobile Apps**: iOS/Android (React Native, Flutter) — offline support, push notifications
- **Map & Navigation**: Real-time GPS, turn-by-turn, geofence-based milestone auto-recording
- **Offline Mode**: Service Worker sync queue; offline milestone recording
- **Fuel Logging**: Photo capture of fuel receipts linked to TO
- **Voice Commands**: Hands-free milestone recording
- **PWA**: Install-to-homescreen, app-like experience in browser

---

**Last Updated**: 2026-05-15  
**Implementation Note**: Driver interface is a **mobile-responsive Django Admin web application** — custom templates with mobile-first CSS. No native mobile app or separate SPA in Sprint 4.  
**Related Modules**: [05-transport](../05-transport/README.md), [08-fleet-management](../08-fleet-management/README.md), [06-poi-operations](../06-poi-operations/README.md)
