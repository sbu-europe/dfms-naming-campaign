---
module: 03-users
specification: Driver Interface (Sprint 4 — TO Execution, Responsive Web)
version: 1.0
phase: Phase 1
sprint: Sprint 4
last_updated: 2026-05-06
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
    → Calls `POST /api/v1/driver/transport-orders/{to_id}/milestones/`
    → Success: refresh TO detail, timeline updates

**POD Section**:
- Visible only after all milestones completed (or configurable per lane — e.g., FG outbound after Gate Out Source + Loading)
- Button: [Capture POD]
  → Opens POD capture form:
    - **Photo** (required): tap to open camera, or select from gallery
    - **Signature** (optional): canvas widget (finger drawing)
    - **Notes** (optional): text area
    - [Submit POD] button
      → Calls `POST /api/v1/driver/transport-orders/{to_id}/pod/`
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

### 2.1 TOMilestone (new model in `apps/transport/`)

```python
TOMilestone {
    milestone_id: UUID
    transport_order: FK → TransportOrder
    
    # Milestone definition
    milestone_type: enum                # ['execution_started', 'gate_in_source', 'loading_done', 'gate_out_source', 
                                        #  'gate_in_destination', 'unloading_done', 'gate_out_destination']
    
    # Recorded data
    recorded_at: DateTime               # When driver recorded this milestone
    actual_timestamp: DateTime          # Actual event time (default = recorded_at; editable if driver adjusts)
    
    # Context
    recorded_by: FK → User (Driver)
    notes: text (nullable)
    photo: ImageField (nullable)        # Evidence photo (compressed)
    
    # Geolocation (Phase 2)
    latitude: Decimal (nullable)
    longitude: Decimal (nullable)
    
    # Metadata
    tenant_id: UUID
    created_at: DateTime
}
```

**Constraints**:
- Unique: `(transport_order, milestone_type)` — one milestone record per type per TO
- `milestone_type` values align with TO execution flow (lane-specific)

### 2.2 TOPOD (new model in `apps/transport/pod/`)

```python
TOPOD {
    pod_id: UUID
    transport_order: OneToOne → TransportOrder  # One POD per TO
    
    # POD artifacts
    photo: ImageField                   # Required: delivery evidence (compressed on upload)
    signature: ImageField (nullable)    # Optional: canvas signature image
    notes: text (nullable)              # Driver remarks
    
    # Submission
    submitted_by: FK → User (Driver)
    submitted_at: DateTime
    
    # Metadata
    tenant_id: UUID
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
    
    # Execution timestamps (denormalized from TOMilestone for fast queries)
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

### 3.1 Driver TO List

```http
GET    /api/v1/driver/transport-orders/
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
GET    /api/v1/driver/transport-orders/{to_id}/
       → Detailed TO view for driver
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
POST   /api/v1/driver/transport-orders/{to_id}/milestones/
       → Driver records a milestone
       → Body: {
           milestone_type: "gate_in_source",
           actual_timestamp: "2026-05-06T09:30:00Z" (optional, defaults to now),
           notes: "Gate entry smooth",
           photo: base64 or multipart file (optional)
         }
       → Side effects:
           - Create TOMilestone record
           - Update TransportOrder.execution_state (via service)
           - Update denormalized timestamp fields
           - Write TOExecutionEvent (TLS-01 timeline)
       → Response: {
           milestone_id,
           transport_order: {execution_state, next_milestone}
         }
```

**Validations**:
- Driver must be assigned to this TO
- Milestone must be next in sequence (cannot skip steps)
- TO must not be closed

### 3.4 Submit POD

```http
POST   /api/v1/driver/transport-orders/{to_id}/pod/
       → Driver submits POD
       → Body: multipart/form-data
           - photo: file (required, max 5MB)
           - signature: file (optional, canvas output)
           - notes: text (optional)
       → Side effects:
           - Create TOPOD record
           - Update TransportOrder.pod_submitted_at
           - Trigger closure engine (POD-01 service)
           - If closure conditions met: execution_state = 'closed', closed_at = now
       → Response: {
           pod_id,
           transport_order: {execution_state, closed_at}
         }
```

**Validations**:
- Driver must be assigned to this TO
- All required milestones must be completed (per flow_type)
- POD not already submitted (OneToOne enforced)

---

## 4. Django Admin Configuration

### 4.1 TOMilestone Admin

**List View**:
- Columns: TO Number, Milestone Type, Recorded At, Driver, Status
- Filters: `milestone_type`, `recorded_at` (date range), `transport_order__status`
- Search: TO number, Driver name
- Actions: Bulk export CSV

**Detail View**:
- Read-only: TO (link), Milestone Type, Recorded At, Actual Timestamp, Driver
- Editable: Notes, Photo (image preview)
- Custom admin action: **"View on Timeline"** (redirects to TO detail with TLS-01 timeline)

### 4.2 TOPOD Admin

**List View**:
- Columns: TO Number, Submitted By, Submitted At, Photo (thumbnail), Signature (yes/no)
- Filters: `submitted_at` (date range), `submitted_by` (driver FK)
- Search: TO number
- Actions: Bulk download POD photos (ZIP)

**Detail View**:
- Read-only: TO (link), Submitted By, Submitted At
- Image preview widgets: Photo (large), Signature (if present)
- Notes: read-only text area
- Custom admin action: **"Verify POD"** (manual review flag — Phase 2)

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
    
    # 4. Fleet readiness check on FIRST execution action (§6.8.1.7)
    if milestone_type == 'started':
        validate_execution_readiness(transport_order)  # DS-02 guards
    
    # 5. Create milestone record
    milestone = TOMilestone.objects.create(...)
    
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

### 6.2 Photo Capture

**Compression**:
- Client-side: resize to max 1920px width, JPEG quality 85%
- Server-side: further compress to max 1MB (lossy)
- Store in `media/pod_photos/` and `media/milestone_photos/`

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
- POD submission triggers closure engine (POD-01)
- If closure conditions not met (e.g., QC pending), TO stays in `pod_submitted` state until closure unblocked

### 7.4 Execution Readiness Enforcement

On first milestone (`started`), validate:
- Vehicle not under maintenance (DS-01)
- Driver not on leave (DS-02)
- Optional: pre-movement checklist approved (if policy enabled)

---

## 8. Integration Points

### 8.1 With Transport Lifecycle (TLS-01)

**Milestone recording writes to timeline**:
- Every milestone creates a `TOExecutionEvent` record (see TLS-01 spec)
- `event_type = milestone_type`, `actor_user = driver`, `source_module = 'driver_mobile'`

### 8.2 With POD Closure (POD-01)

**POD submission triggers closure**:
- Driver submits POD → `TOPOD` created
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
3. Taps [Mark as Started] → milestone recorded, execution_state = 'started'
4. Arrives at source gate → taps [Record Gate In] → execution_state = 'gate_in_source'
5. Loading completes → taps [Record Loading Done] → execution_state = 'loading'
6. Exits gate → taps [Record Gate Out] → execution_state = 'gate_out_source'
7. [Capture POD] button enabled → taps → uploads photo, signs, taps [Submit]
8. POD-01 closure engine evaluates → all gates passed → TO closed
9. TO moves to "Completed" tab

### 10.2 Blocked Execution (Driver on Leave)

1. Driver logs in, sees TO in "Ready for Dispatch"
2. Taps [Mark as Started] → API returns 400: "Driver is on leave"
3. Error banner: "You are on leave until {date}. Cannot start execution."
4. Driver contacts supervisor

### 10.3 POD Submission Before Milestones Complete

1. Driver tries to tap [Capture POD] before recording "Gate Out" milestone
2. Button disabled (grayed out)
3. Tooltip: "Complete all milestones first"

### 10.4 Offline Scenario (Phase 2)

1. Driver loses network after marking "Started"
2. Records "Gate In" milestone → saved to local queue
3. Reconnects → auto-sync triggered → milestone submitted
4. Success notification

---

## 11. Dependencies

### Upstream
- `05-transport`: TransportOrder model, execution_state field
- `08-fleet-management`: Execution readiness guards (DS-01, DS-02)
- `01-foundation`: Auth, RBAC

### Downstream
- `05-transport/lifecycle`: TLS-01 timeline, POD-01 closure engine
- `06-poi-operations`: Yard event complementarity (GT-01, SC-01, LD-01)

---

## 12. Sprint 4 Story Mapping

| Story | Scope | Implementation Focus |
|-------|-------|----------------------|
| **DM-01** | TO list, execution milestones & POD capture | TOMilestone model + TOPOD model + mobile UI + API endpoints + milestone sequencing service + POD-01 closure trigger |

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

**Last Updated**: 2026-05-06  
**Implementation Note**: This is a **responsive web interface** accessed via mobile browsers, not a native mobile app. No app store deployment required.  
**Related Modules**: [05-transport](../05-transport/README.md), [08-fleet-management](../08-fleet-management/README.md), [06-poi-operations](../06-poi-operations/README.md)
