---
module: 03-users
specification: Driver Interface (Sprint 4 — TO Execution, Responsive Web)
version: 2.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-12
related_stories: DFS-053 (DM-01)
jira_epic: DFS-071
---

# Driver Interface Specification (Sprint 4 — Responsive Web)

## Overview

The **Driver Interface** provides field drivers with a **mobile-responsive web application** (not a native mobile app) to view assigned Transport Orders, record execution milestones, and capture Proof of Delivery (POD). Drivers access this interface through their mobile browser (Chrome, Safari) or tablet. **Sprint 4 scope explicitly excludes map, turn-by-turn navigation, and background GPS tracking** — these are deferred to a later sprint.

The driver sees **only TOs assigned to them** (via Sprint 3 TDO assignment) that are in **Ready for Dispatch** status. The TO becomes the single execution container — **no separate Trip entity is used in Sprint 4**.

**Technology**: Responsive web application (mobile-first design) — no native mobile app in Sprint 4.

**Module path**: `apps/users/driver_mobile/` (new sub-package under `apps/users/`)  
**Dependencies**: `05-transport` (TransportOrder model, TO execution state), `08-fleet-management` (checklist submission — optional), `01-foundation` (auth)  
**Enables**: Driver field execution, milestone tracking, POD capture, TO closure trigger

---

## 0. Menu Structure & Navigation

```
Responsive Web Interface (Driver-only, accessed via mobile browser)
└── My Transport Orders                     — driver's assigned TO list
      ├── TO List (default view)            — filterable by status (Ready / In Progress / Completed)
      │     └── [TO card click] ──► TO Detail
      │
      └── TO Detail
            ├── Header: TO Number, Status badge, Route (Source → Destination)
            ├── Product Summary: Item code, name, quantity (MT), vehicle/driver/helper assigned
            ├── Timeline: visual progress (Ready → Started → Gate In → Loading → Gate Out → POD → Closed)
            ├── Milestones Section:
            │     ├── [Mark as Started] (if status = Ready for Dispatch)
            │     ├── Checkpoint list: Gate In (Source), Loading Done, Gate Out (Source), Gate In (Dest), Unloading Done, Gate Out (Dest)
            │     └── Each checkpoint: timestamp (if completed), [Record Milestone] button (if pending)
            ├── POD Section:
            │     ├── [Capture POD] button (enabled after last milestone)
            │     └── Form: Photo upload, Signature canvas, Notes
            │           └── [Submit POD] ──► TO closure triggered
            │
            └── [View Details] ──► Full TO read-only (source POI, dest POI, product lines, TR reference)
```

### Role → access mapping

| Role | My Transport Orders | View TO Detail | Record Milestones | Submit POD |
|------|:-------------------:|:--------------:|:-----------------:|:----------:|
| Driver | ✓ (own TOs only) | ✓ (own TOs) | ✓ | ✓ |
| Driver Supervisor | Read-only (all drivers) | ✓ | — | — |
| TDO | — | — | — | — |

---

## 1. User Flow

### 1.1 Login & Home Screen

```
Driver opens web browser on mobile device (Chrome, Safari, Firefox)
  └─► Navigate to: https://[tenant].dfms.com/driver/
  └─► Login with credentials (or session from desktop)
        └─► Redirect to: My Transport Orders (default = In Progress tab)
              └─► Empty state: "No active TOs. Check Ready for Dispatch tab."
```

### 1.2 TO List View

**Tabs**:
- **Ready for Dispatch** (status = `confirmed`, TDO-assigned, not yet started by driver)
- **In Progress** (execution_state in [`started`, `gate_in_source`, `loading`, `in_transit`, `gate_in_destination`, `unloading`])
- **Completed** (execution_state = `closed` or `completed`)

**Card format** (per TO):
```
┌─────────────────────────────────────────┐
│ TO-20260506-0042            🔵 In Progress│
│ FG - Poultry Feed (Broiler Starter)      │
│ 50 MT                                     │
│                                           │
│ 📍 Depot A → Feed Mill B                  │
│ 🚛 Truck: DHK-1234 | Driver: You          │
│ ⏱️ Started: 2026-05-06 08:15              │
│ 📌 Next: Loading Done                     │
└─────────────────────────────────────────┘
```

Tap card → TO Detail screen

### 1.3 TO Detail Screen

**Header Section**:
- TO Number, Status badge (color-coded)
- Route: Source POI → Destination POI (with icons)
- Product: Item code, name, quantity (MT), bags (if available)

**Vehicle & Crew Section**:
- Vehicle: registration, type
- Driver: name (self)
- Helpers: names (if assigned)
- ETA: planned delivery datetime

**Timeline Section** (visual progress bar):
```
[✓] Ready ──► [✓] Started ──► [●] Gate In ──► [ ] Loading ──► [ ] Gate Out ──► [ ] POD ──► [ ] Closed
```
Current step highlighted; completed steps have checkmark; pending steps grayed out.

**Milestones Section**:
Table or accordion list:

| Milestone | Status | Timestamp | Action |
|-----------|--------|-----------|--------|
| Execution Started | ✓ Done | 2026-05-06 08:15 | — |
| Gate In (Source) | Pending | — | [Record Now] |
| Loading Done | Pending | — | (disabled until Gate In) |
| Gate Out (Source) | Pending | — | (disabled until Loading) |
| Gate In (Destination) | Pending | — | (disabled until Gate Out Source) |
| Unloading Done | Pending | — | (disabled until Gate In Dest) |
| Gate Out (Destination) | Pending | — | (disabled until Unloading) |

**Milestone Recording**:
- Tap [Record Now] → Modal:
  - Milestone name (read-only)
  - Timestamp (pre-filled with now, editable if needed)
  - Notes (optional text area)
  - Photo upload (optional)
  - [Submit] button
    → Calls `PATCH /api/v1/driver/transport-orders/{to_id}/milestones`
    → Success: refresh TO detail, timeline updates
    → On §6.8.1.7 failure: stable error message (vehicle unavailable, driver on leave, vehicle under maintenance)

**POD Section**:
- Visible only after all milestones completed (or configurable per lane — e.g., FG outbound after Gate Out Source + Loading)
- Button: [Capture POD]
  → Opens POD capture form:
    - **Photo** (required): tap to open camera, or select from gallery
    - **Signature** (optional): canvas widget (finger drawing)
    - **Notes** (optional): text area
    - [Submit POD] button
      → Calls `POST /api/v1/driver/transport-orders/{to_id}/pod`
      → Backend triggers closure engine (POD-01)
      → Success: TO moves to Completed tab

**Pre-Movement Checklist Entry** (optional, if DS-01 policy enabled):
- Banner at top: "Pre-Movement Checklist Required" (if not yet submitted)
- [Fill Checklist] button → redirects to checklist submission form (see DS-01 spec)

**Offline Considerations** (Phase 2):
- Sprint 4: **online-only** (requires network)
- Future: cache TO list + allow offline milestone recording; sync on reconnect

---

## 2. Data Model

### 2.1 ExecutionMilestone (new model in `apps/transport/`)

```python
ExecutionMilestone(TenantAwareModel) {
    milestone_id: UUID
    transport_order: FK → TransportOrder
    
    # Milestone definition
    milestone_type: enum                # ['execution_started', 'gate_in_source', 'loading_done', 'gate_out_source', 
                                        #  'gate_in_destination', 'unloading_done', 'gate_out_destination']
                                        # Reconciled with TLS-01 milestone set
    
    # Recorded data
    recorded_at: DateTime               # When driver recorded this milestone
    actual_timestamp: DateTime          # Actual event time (default = recorded_at; editable if driver adjusts)
    
    # Context
    recorded_by: FK → User (Driver)
    notes: text (nullable)
    photo: ImageField (nullable)        # Evidence photo (auto-compressed via compression utility)
    
    # Geolocation (Phase 2)
    latitude: Decimal (nullable)
    longitude: Decimal (nullable)
    
    # Metadata (inherited from TenantAwareModel)
    created_at: DateTime
}
```

**Constraints**:
- Unique: `(transport_order, milestone_type)` — one milestone record per type per TO
- `milestone_type` values reconciled with TLS-01 event types

### 2.2 ProofOfDelivery (new model in `apps/transport/`)

```python
ProofOfDelivery(TenantAwareModel) {
    pod_id: UUID
    transport_order: OneToOne → TransportOrder  # One POD per TO
    
    # POD artifacts
    photo: ImageField                   # Required: delivery evidence (auto-compressed via compression utility)
    signature: ImageField (nullable)    # Optional: canvas signature image
    notes: text (nullable)              # Driver remarks
    
    # Submission
    submitted_by: FK → User (Driver)
    submitted_at: DateTime
    
    # Metadata (inherited from TenantAwareModel)
}
```

### 2.3 Extensions to TransportOrder (existing model in `apps/transport/`)

New fields for Sprint 4 execution:

```python
TransportOrder {
    # ... existing fields ...
    
    # Sprint 4 execution fields
    execution_state: enum               # ['ready_for_dispatch', 'started', 'gate_in_source', 'loading', 
                                        #  'gate_out_source', 'in_transit', 'gate_in_destination', 
                                        #  'unloading', 'gate_out_destination', 'pod_submitted', 'closed']
    
    flow_type: enum                     # ['fg_outbound', 'fg_inbound', 'rm_inbound', 'internal_transfer']
                                        # Determines milestone sequence and closure rules
    
    source_channel: enum                # ['planner', 'gate_on_demand']
                                        # Sprint 3 TOs = 'planner'; GT-02 TOs = 'gate_on_demand'
    
    # Execution timestamps (denormalized from ExecutionMilestone for fast queries)
    execution_started_at: DateTime (nullable)
    gate_in_source_at: DateTime (nullable)
    loading_done_at: DateTime (nullable)
    gate_out_source_at: DateTime (nullable)
    gate_in_destination_at: DateTime (nullable)
    unloading_done_at: DateTime (nullable)
    gate_out_destination_at: DateTime (nullable)
    pod_submitted_at: DateTime (nullable)
    closed_at: DateTime (nullable)
}
```

---

## 3. API Endpoints

**Security**: All driver endpoints scope queries to the authenticated driver. Requests for TOs not assigned to the authenticated driver return **404** (not 403), preventing enumeration of other drivers' TOs.

### 3.1 Driver TO List

```http
GET    /api/v1/driver/transport-orders
       → List TOs assigned to authenticated driver
       → Filters: ?status=ready_for_dispatch | in_progress | completed
       → Response: [
           {
             to_id, to_number, status, execution_state,
             product: {item_code, name, quantity_mt},
             route: {source_poi, destination_poi},
             vehicle: {registration, type},
             helpers: [{name}],
             eta: datetime,
             next_milestone: "gate_in_source" | null,
             progress_percent: 40
           }
         ]
```

### 3.2 Driver TO Detail

```http
GET    /api/v1/driver/transport-orders/{to_id}
       → Detailed TO view for driver (404 if not owned)
       → Response: {
           to_id, to_number, status, execution_state, flow_type,
           product: {...},
           route: {...},
           vehicle: {...},
           driver: {...},
           helpers: [...],
           milestones: [
             {milestone_type, status: "done"/"pending", recorded_at, notes, photo_url},
             ...
           ],
           pod: {photo_url, signature_url, notes, submitted_at} | null,
           timeline: [
             {state: "ready_for_dispatch", timestamp: "2026-05-06 07:00", completed: true},
             {state: "started", timestamp: "2026-05-06 08:15", completed: true},
             {state: "gate_in_source", timestamp: null, completed: false},
             ...
           ]
         }
```

### 3.3 Record Milestone

```http
PATCH  /api/v1/driver/transport-orders/{to_id}/milestones
       → Driver records a milestone
       → Body: {
           milestone_type: "gate_in_source",
           actual_timestamp: "2026-05-06T09:30:00Z" (optional, defaults to now),
           notes: "Gate entry smooth",
           photo: base64 or multipart file (optional)
         }
       → Side effects:
           - §6.8.1.7 fleet availability validation on first execution action
           - Create ExecutionMilestone record
           - Update TransportOrder.execution_state (via service)
           - Update denormalized timestamp fields
           - Write TOExecutionEvent (TLS-01 timeline)
           - Audit log entry (DM-01-12)
       → Response: {
           milestone_id,
           transport_order: {execution_state, next_milestone}
         }
       → Error (§6.8.1.7 failure): 400 {
           error: "fleet_availability_failed",
           detail: "Vehicle DHK-1234 is under maintenance" | "Driver is on leave until 2026-05-15"
         }
```

**Validations**:
- Driver must be assigned to this TO (404 if not owned)
- Milestone must be next in sequence (cannot skip steps)
- TO must not be closed
- **§6.8.1.7**: On first execution action, fleet availability validation must pass (vehicle available, driver not on leave, vehicle not under maintenance)

### 3.4 List Milestones

```http
GET    /api/v1/driver/transport-orders/{to_id}/milestones
       → List all milestones recorded for this TO (404 if not owned)
       → Response: [
           {
             milestone_id, milestone_type, recorded_at, actual_timestamp,
             recorded_by: {id, name},
             notes, photo_url
           },
           ...
         ]
```

### 3.5 Submit POD

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod
       → Driver submits POD
       → Body: multipart/form-data
           - photo: file (required, auto-compressed before storage)
           - signature: file (optional, canvas output)
           - notes: text (optional)
       → Side effects:
           - Create ProofOfDelivery record
           - Update TransportOrder.pod_submitted_at
           - Trigger closure engine (POD-01 service)
           - If closure conditions met: execution_state = 'closed', closed_at = now
           - Audit log entry (DM-01-12)
       → Response: {
           pod_id,
           transport_order: {execution_state, closed_at}
         }
```

**Validations**:
- Driver must be assigned to this TO (404 if not owned)
- All required milestones must be completed (per flow_type)
- POD not already submitted (OneToOne enforced)

### 3.6 Retrieve POD

```http
GET    /api/v1/driver/transport-orders/{to_id}/pod
       → Retrieve POD detail for this TO (404 if not owned or no POD submitted)
       → Response: {
           pod_id,
           photo_url, signature_url,
           notes,
           submitted_by: {id, name},
           submitted_at
         }
```

---

## 4. Django Admin Configuration

### 4.1 ExecutionMilestoneAdmin (read-only)

Uses `TenantOnlyAdminMixin`. All fields are **read-only** (support/debug use only).

**List View**:
- `list_display`: TO Number, Milestone Type, Recorded At, Driver
- `list_filter`: `transport_order`, `milestone_type`
- `search_fields`: TO number
- Read-only — no add/edit/delete actions

**Detail View** (change form):
- Read-only: TO (link), Milestone Type, Recorded At, Actual Timestamp, Driver, Notes
- Photo preview (if present)

### 4.2 ProofOfDeliveryAdmin (read-only)

Uses `TenantOnlyAdminMixin`. All fields are **read-only** (support/debug use only).

**List View**:
- `list_display`: TO Number (ref), Driver, Submitted At
- `list_filter`: `submitted_at` (date range)
- `search_fields`: TO number
- Read-only — no add/edit/delete actions

**Detail View** (change form):
- Read-only: TO (link), Submitted By, Submitted At, Notes
- Photo preview (large image widget)
- Signature preview (if present)

---

## 5. Milestone Sequencing & Guards

### 5.1 Milestone Sequence per Flow Type

**FG Outbound** (`fg_outbound`):
```
ready_for_dispatch
  → started (driver initiates)
    → gate_in_source (yard system or driver)
      → loading_done (loading personnel or driver)
        → gate_out_source (yard system or driver)
          → [POD capture] → closed
```

**FG Inbound** (`fg_inbound`):
```
ready_for_dispatch
  → started
    → gate_in_destination (yard system)
      → unloading_done (unloading personnel)
        → gate_out_destination (yard system)
          → [POD capture] → closed
```

**RM Inbound** (`rm_inbound`):
```
ready_for_dispatch
  → started
    → gate_in_destination
      → unloading_done
        → [QC sampling + decision] (yard/QC personnel — not driver milestone)
          → gate_out_destination
            → [POD capture] → closed
```

### 5.2 Milestone Recording Guards

**Service validation** (`apps/transport/services/milestone_service.py`):

```python
def record_milestone(transport_order, milestone_type, driver):
    # 1. Driver must be assigned
    if transport_order.assigned_driver != driver:
        raise PermissionDenied("Not assigned to this TO.")
    
    # 2. TO must be in active execution
    if transport_order.execution_state in ['closed', 'cancelled']:
        raise ValidationError("TO is closed or cancelled.")
    
    # 3. Milestone must be next in sequence
    expected_next = get_next_milestone(transport_order)
    if milestone_type != expected_next:
        raise ValidationError(f"Expected milestone: {expected_next}, got: {milestone_type}")
    
    # 4. §6.8.1.7 Fleet availability validation on first execution action
    if is_first_execution_action(transport_order, milestone_type):
        validate_fleet_availability(transport_order)
        # Raises ValidationError with stable error codes:
        #   "vehicle_unavailable", "driver_on_leave", "vehicle_under_maintenance"
    
    # 5. Create milestone record
    milestone = ExecutionMilestone.objects.create(...)
    
    # 6. Advance execution state
    transport_order.execution_state = milestone_type_to_state(milestone_type)
    transport_order.save()
    
    # 7. Write timeline event (TLS-01)
    TOExecutionEvent.objects.create(
        transport_order=transport_order,
        event_type=milestone_type,
        to_state=transport_order.execution_state,
        actor_user=driver,
        ...
    )
    
    # 8. Audit log (DM-01-12)
    log_milestone_recording(transport_order, milestone, driver)
```

### 5.3 §6.8.1.7 Fleet Availability Validation Service

**Service** (`apps/transport/services/fleet_availability_service.py`):

Re-validates vehicle and driver availability on the **first driver execution action** (typically `execution_started`). If validation fails, the milestone PATCH returns a stable error.

```python
def validate_fleet_availability(transport_order):
    """
    §6.8.1.7 — re-validate vehicle/driver availability at execution start.
    Raises ValidationError with stable error code on failure.
    """
    vehicle = transport_order.assigned_vehicle
    driver = transport_order.assigned_driver
    
    # Vehicle not under maintenance
    if vehicle.is_under_maintenance():
        raise ValidationError(
            code="vehicle_under_maintenance",
            detail=f"Vehicle {vehicle.registration} is under maintenance."
        )
    
    # Vehicle not already dispatched on another active TO
    if vehicle.is_dispatched_elsewhere(exclude_to=transport_order):
        raise ValidationError(
            code="vehicle_unavailable",
            detail=f"Vehicle {vehicle.registration} is assigned to another active TO."
        )
    
    # Driver not on leave
    if driver.is_on_leave():
        raise ValidationError(
            code="driver_on_leave",
            detail=f"Driver is on leave until {driver.leave_end_date}."
        )
```

---

## 6. UI/UX Considerations

### 6.1 Mobile-Responsive Design

**Layout**:
- Mobile-first (320px–768px)
- Touch-optimized buttons (min 44px tap target)
- Swipe gestures for tab navigation (Ready / In Progress / Completed)
- Pull-to-refresh on TO list

**Accessibility**:
- WCAG 2.1 AA compliance
- High-contrast status badges (colorblind-safe)
- Screen reader labels for icons

### 6.2 Photo Capture & Compression

**Photo Compression Utility** (`apps/transport/utils/image_compression.py`):
- Auto-compress images **before storage** (both milestone photos and POD photos)
- Max dimension: configurable (default 1920px longest edge)
- Max file size: configurable (default 1MB after compression)
- Format: JPEG, quality 85%
- Applied server-side on upload via utility function

**Client-side** (optional pre-compression):
- Resize to max 1920px width, JPEG quality 85%

**Storage paths**:
- POD photos: `media/pod_photos/`
- Milestone photos: `media/milestone_photos/`

**Camera Integration**:
- HTML5 `<input type="file" capture="environment">` for mobile camera
- Fallback to file picker for desktop

### 6.3 Signature Canvas

**Implementation**:
- HTML5 `<canvas>` with touch/mouse drawing
- Library: `signature_pad` (open-source)
- Export as PNG, base64-encode for API submission
- Clear/redo buttons

### 6.4 Native Mobile App vs Responsive Web (Sprint 4: Responsive Web Only)

**Sprint 4 Approach**: Mobile-responsive web application
- Works in any mobile browser (no app store download required)
- Responsive design (mobile-first CSS, Bootstrap/Tailwind)
- Touch-optimized UI (large buttons, swipe gestures)
- Camera access via HTML5 APIs (for POD photo capture)

**Future (Phase 2)**: Native mobile app considerations
- Dedicated iOS/Android apps (React Native, Flutter)
- Offline support with Service Worker (for web) or local DB (for native)
- Background GPS tracking
- Push notifications
- Better performance for offline scenarios

---

## 7. Business Rules

### 7.1 TO Visibility

- Driver sees only TOs where `assigned_driver = driver` AND `status != 'cancelled'`
- Non-owned TO requests return **404** (not 403) to prevent enumeration
- "Ready for Dispatch" tab: `execution_state = 'ready_for_dispatch'`
- "In Progress" tab: `execution_state IN (started, gate_in_source, loading, ...)`
- "Completed" tab: `execution_state = 'closed'`

### 7.2 Milestone Recording

- Milestones must be recorded in order (enforced by service)
- Driver cannot skip milestones
- Driver cannot edit milestone after submission (admin can delete if needed)
- Timestamp defaults to "now" but editable within ±2 hours (for minor clock adjustments)

### 7.3 POD Submission

- POD can only be submitted after all required milestones completed
- Photo is mandatory; signature and notes are optional
- Photos auto-compressed before storage via compression utility
- POD submission triggers closure engine (POD-01)
- If closure conditions not met (e.g., QC pending), TO stays in `pod_submitted` state until closure unblocked

### 7.4 §6.8.1.7 Fleet Availability Enforcement

On **first driver execution action** (typically `execution_started` milestone), re-validate:
- Vehicle not under maintenance
- Vehicle not dispatched on another active TO
- Driver not on leave

Milestone PATCH fails with **stable error codes** (`vehicle_unavailable`, `driver_on_leave`, `vehicle_under_maintenance`) when validation fails. Driver sees descriptive error message and must contact supervisor.

---

## 8. Integration Points

### 8.1 With Transport Lifecycle (TLS-01)

**Milestone recording writes to timeline**:
- Every milestone creates a `TOExecutionEvent` record (see TLS-01 spec)
- `event_type = milestone_type`, `actor_user = driver`, `source_module = 'driver_mobile'`
- `ExecutionMilestone.milestone_type` values reconciled with TLS-01 event types

### 8.2 With POD Closure (POD-01)

**POD submission triggers closure**:
- Driver submits POD → `ProofOfDelivery` created
- Service calls `apps/transport/closure/closure_engine.py:evaluate_closure_conditions(transport_order)`
- If all gates passed (per flow_type): `execution_state = 'closed'`, `closed_at = now()`
- If gates blocked (e.g., QC pending): `execution_state = 'pod_submitted'`, closure deferred

### 8.3 With Yard Operations (GT-01, SC-01, LD-01)

**Dual recording**:
- Gate, scale, and loading/unloading personnel record events via their admin interfaces (GT-01, SC-01, LD-01)
- Driver records milestones via mobile (DM-01)
- Both flows write to `TOExecutionEvent` timeline (TLS-01)
- Milestone and yard events are **complementary**, not duplicate — driver records "I'm at gate", gate records "Vehicle checked in"

**Conflict resolution**:
- If gate records `gate_in_source` before driver records milestone, driver milestone creation is no-op (already recorded)
- Timeline service deduplicates by `event_type` + `transport_order` within 5-minute window

### 8.4 With Fleet Availability (§6.8.1.7)

**First-execution-action validation**:
- Fleet availability validation service (`apps/transport/services/fleet_availability_service.py`) called on first driver execution action
- Queries vehicle maintenance status and driver leave status from `08-fleet-management` models
- Returns stable error codes consumed by the milestone API (see §5.3)

---

## 9. Permissions & RBAC

### 9.1 Permission Codes (add to `apps/core/constants_rbac.py`)

```python
Transport.TO.Read                       # Driver can read own TOs
Transport.TO.Milestone.Write            # Driver can record milestones
Transport.POD.Submit                    # Driver can submit POD
Transport.POD.Read                      # Driver can view own POD
```

### 9.2 Menu Permissions (add to `apps/core/portal_navigation.py`)

```python
Menu.DriverMobile.View
```

### 9.3 Role → Permission Mapping

**Driver**:
- `Transport.TO.Read` (own TOs only — enforced by view queryset filter)
- `Transport.TO.Milestone.Write`
- `Transport.POD.Submit`
- `Transport.POD.Read`

**Driver Supervisor**:
- `Transport.TO.Read` (all TOs for supervised drivers)
- `Transport.TO.Milestone.Write` (can record on behalf of driver — Phase 2)

**Transport Planner / TDO**:
- `Transport.TO.Read` (all TOs)
- Read-only milestone/POD visibility

---

## 10. Testing Scenarios

### 10.1 Happy Path (FG Outbound)

1. Driver logs in → sees TO in "Ready for Dispatch" tab
2. Taps TO card → TO detail screen
3. Taps [Mark as Started] → §6.8.1.7 fleet validation passes → milestone recorded, execution_state = 'started'
4. Arrives at source gate → taps [Record Gate In] → execution_state = 'gate_in_source'
5. Loading completes → taps [Record Loading Done] → execution_state = 'loading'
6. Exits gate → taps [Record Gate Out] → execution_state = 'gate_out_source'
7. [Capture POD] button enabled → taps → uploads photo (auto-compressed), signs, taps [Submit]
8. POD-01 closure engine evaluates → all gates passed → TO closed
9. TO moves to "Completed" tab

### 10.2 Blocked Execution — §6.8.1.7 Failure (Vehicle Under Maintenance)

1. Driver logs in, sees TO in "Ready for Dispatch"
2. Taps [Mark as Started] → API returns 400: `{"error": "vehicle_under_maintenance", "detail": "Vehicle DHK-1234 is under maintenance."}`
3. Error banner: "Vehicle is under maintenance. Cannot start execution."
4. Driver contacts supervisor

### 10.3 Blocked Execution — §6.8.1.7 Failure (Driver on Leave)

1. Driver logs in, sees TO in "Ready for Dispatch"
2. Taps [Mark as Started] → API returns 400: `{"error": "driver_on_leave", "detail": "Driver is on leave until 2026-05-15."}`
3. Error banner: "You are on leave until 2026-05-15. Cannot start execution."
4. Driver contacts supervisor

### 10.4 POD Submission Before Milestones Complete

1. Driver tries to tap [Capture POD] before recording "Gate Out" milestone
2. Button disabled (grayed out)
3. Tooltip: "Complete all milestones first"

### 10.5 Security — Access to Another Driver's TO

1. Driver A attempts GET `/api/v1/driver/transport-orders/{to_id}` for a TO assigned to Driver B
2. API returns **404** (not 403)
3. No information about the TO is leaked

### 10.6 Offline Scenario (Phase 2)

1. Driver loses network after marking "Started"
2. Records "Gate In" milestone → saved to local queue
3. Reconnects → auto-sync triggered → milestone submitted
4. Success notification

---

## 11. Dependencies

### Upstream
- `05-transport`: TransportOrder model, execution_state field
- `08-fleet-management`: Fleet availability validation (§6.8.1.7 — vehicle maintenance, driver leave)
- `01-foundation`: Auth, RBAC

### Downstream
- `05-transport/lifecycle`: TLS-01 timeline, POD-01 closure engine
- `06-poi-operations`: Yard event complementarity (GT-01, SC-01, LD-01)

---

## 12. Sprint 4 Story Mapping

| Story | Scope |
|-------|-------|
| **DM-01** | TO list, execution milestones & POD capture |

### DM-01 Sub-tasks

| # | Sub-task | Jira | Focus |
|---|----------|------|-------|
| DM-01-1 | `ProofOfDelivery` model + migration | DFS-053-1 | FK to TO, photo (ImageField), optional signature, `submitted_by`, `submitted_at` |
| DM-01-2 | `ExecutionMilestone` model + migration | DFS-053-2 | FK to TO, `milestone_type` enum, `recorded_at`, `recorded_by`; reconcile types with TLS-01 |
| DM-01-3 | `ProofOfDeliveryAdmin` (read-only) | DFS-053-3 | Read-only `list_display` (TO ref, driver, submitted_at), photo preview in change form |
| DM-01-4 | `ExecutionMilestoneAdmin` (read-only) | DFS-053-4 | Read-only `list_display`, `list_filter` (TO, milestone_type), search by TO number |
| DM-01-5 | Driver TO list API | DFS-053-5 | `GET /api/v1/driver/transport-orders` scoped to authenticated driver |
| DM-01-6 | Driver TO detail API | DFS-053-6 | `GET /api/v1/driver/transport-orders/{to_id}` — pickup/drop POI, product, qty, instructions |
| DM-01-7 | Milestone record API + §6.8.1.7 validation | DFS-053-7 | `PATCH /api/v1/driver/transport-orders/{to_id}/milestones` + fleet availability validation |
| DM-01-8 | POD upload API + media storage config | DFS-053-8 | `POST /api/v1/driver/transport-orders/{to_id}/pod` + S3/local media config |
| DM-01-9 | Fleet availability validation service | DFS-053-9 | §6.8.1.7 — re-validate vehicle + driver availability on first execution action |
| DM-01-10 | Photo compression utility | DFS-053-10 | Auto-compress images before storage (max dimension + file size enforced) |
| DM-01-11 | Mobile/responsive UI | DFS-053-11 | TO list, TO detail, milestone recording, POD capture form with camera/gallery |
| DM-01-12 | Audit logging | DFS-053-12 | Audit trail on milestone recordings and POD submissions |

---

## 13. Future Enhancements (Phase 2)

- **Native Mobile Apps**: Dedicated iOS/Android apps for better performance and offline capability
- **Map & Navigation**: Real-time location tracking, turn-by-turn navigation, geofence-based milestone auto-recording
- **Offline Mode**: Service Worker (web) or local database (native apps), sync queue on reconnect
- **Push Notifications**: TO assignment alerts, milestone reminders (requires native app or PWA)
- **Voice Commands**: Hands-free milestone recording
- **Fuel Logging**: Photo capture of fuel receipts (linked to TO)
- **Progressive Web App (PWA)**: Install-to-homescreen capability, app-like experience in browser

---

**Last Updated**: 2026-05-12  
**Implementation Note**: This is a **responsive web interface** accessed via mobile browsers, not a native mobile app. No app store deployment required.  
**Related Modules**: [05-transport](../05-transport/README.md), [08-fleet-management](../08-fleet-management/README.md), [06-poi-operations](../06-poi-operations/README.md)
