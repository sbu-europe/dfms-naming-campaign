---
title: Driver Mobile Interface
story_id: US-052
phase: phase-1
module: Mobile Interfaces
priority: High
status: Pending
epic: Mobile Interface (Driver / QC)
epic_id: EPIC-016
epic_name: Mobile Interface (Driver / QC)
sprint: Sprint 9
story_points: 8
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/07-mobile-interfaces/driver-mobile.md
  - ../../../../source-documents/discovery-phase/meeting-minutes/Meeting_Minutes_NOURISH_DFMS_Transport_Operations_2025-09-29.docx
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-020-to-execution-own-fleet.md
  - US-026-trip-lifecycle-management.md
dependencies:
  - US-026-trip-lifecycle-management.md (Must have trip states defined)
tags: [mobile, driver, responsive-web, field-operations, high-priority]
---

# US-052: Driver Mobile Interface

## User Story

**As a** Driver  
**I want to** view my assigned trips, navigate to destinations, update trip status, and record incidents via a mobile-responsive web interface  
**So that** I can efficiently execute deliveries while providing real-time updates to the command center

## Business Context

Drivers are **field personnel** who operate vehicles and execute transport orders. They need a **mobile-responsive web interface** that works on mobile devices and provides essential trip information at a glance.

**Note**: Per PRD, "Mobile Interface" refers to mobile-responsive web pages accessible via mobile browsers, not native mobile applications.

**Driver Challenges Without Mobile Interface**:
- Rely on paper-based TO documents (risk of loss/damage)
- Cannot update trip status in real-time → Command center has no visibility
- Manual incident reporting via phone calls → Delayed, incomplete information
- No GPS navigation → Drivers unfamiliar with routes get lost
- Difficulty proving delivery completion (no POD capture)

**Business Benefits of Mobile Interface**:
- ✅ **Real-time visibility**: Command center sees live trip progress
- ✅ **Reduced errors**: Digital status updates eliminate miscommunication
- ✅ **Faster incident resolution**: Photo/video evidence speeds up claims
- ✅ **Improved delivery accuracy**: GPS navigation reduces delays
- ✅ **Digital POD**: Photo-based proof of delivery replaces paper
- ✅ **Driver accountability**: Timestamped actions create audit trail

**Target Users**:
- Own Fleet Drivers (primary)
- Vendor Fleet Drivers (secondary, limited access)

---

## Acceptance Criteria

### AC-1: Trip Assignment View

#### AC-1.1: View Assigned Trips
- [ ] System SHALL display list of trips assigned to logged-in driver
- [ ] System SHALL show trip status: Upcoming, In Progress, Completed
- [ ] System SHALL sort trips by delivery date (earliest first)
- [ ] System SHALL display trip card with key information:
  - TO Number
  - Product Name & Quantity
  - Source POI → Destination POI
  - Planned Delivery Date & Time
  - Current Trip Status
  - Distance (calculated)
- [ ] System SHALL allow filtering by status (Upcoming, In Progress, Completed)
- [ ] System SHALL refresh trip list on pull-down gesture

#### AC-1.2: Trip Details View
- [ ] System SHALL display comprehensive trip details when driver taps trip card:
  - Full TO information
  - Vehicle assigned (registration number)
  - Helper assigned (if any)
  - Delivery instructions (if any)
  - Contact person at destination
  - Expected route (map preview)
  - Documents attached to TO
- [ ] System SHALL provide "Start Trip" button for upcoming trips
- [ ] System SHALL provide "Navigate" button for in-progress trips
- [ ] System SHALL show trip timeline with completed checkpoints

### AC-2: Trip Lifecycle Actions

#### AC-2.1: Start Trip
- [ ] System SHALL allow driver to start trip only when status = "Dispatched"
- [ ] System SHALL capture trip start timestamp
- [ ] System SHALL update trip status to "In Transit"
- [ ] System SHALL send notification to Command Center
- [ ] System SHALL enable GPS tracking (background mode)
- [ ] System SHALL display "Trip Started" confirmation

#### AC-2.2: Update Trip Status
- [ ] System SHALL allow driver to update status at checkpoints:
  - "Arrived at Source" (gate-in)
  - "Loading in Progress"
  - "Departed from Source" (gate-out)
  - "In Transit"
  - "Arrived at Destination" (gate-in)
  - "Unloading in Progress"
  - "Completed" (after POD)
- [ ] System SHALL timestamp each status update
- [ ] System SHALL allow adding remarks per status update
- [ ] System SHALL sync status to backend in real-time (if online)
- [ ] System SHALL queue status updates if offline, sync when online

#### AC-2.3: Complete Trip
- [ ] System SHALL require Proof of Delivery (POD) before completing trip:
  - Photo of delivered goods (mandatory)
  - Recipient signature (mandatory, captured via touchpad)
  - Recipient name (text input)
  - Recipient phone (optional)
- [ ] System SHALL validate all mandatory POD fields
- [ ] System SHALL upload POD to server
- [ ] System SHALL mark trip as "Completed"
- [ ] System SHALL display "Trip Completed" confirmation

### AC-3: GPS Navigation & Tracking

#### AC-3.1: Route Navigation
- [ ] System SHALL integrate with Google Maps or OSM for navigation
- [ ] System SHALL display "Navigate to Source" and "Navigate to Destination" buttons
- [ ] System SHALL launch turn-by-turn navigation in external map app
- [ ] System SHALL show estimated time of arrival (ETA)
- [ ] System SHALL suggest alternate routes if available

#### AC-3.2: Live GPS Tracking
- [ ] System SHALL enable GPS tracking when trip starts
- [ ] System SHALL send GPS coordinates to backend every 30 seconds (configurable)
- [ ] System SHALL continue tracking in background mode (app closed/minimized)
- [ ] System SHALL stop tracking when trip is completed
- [ ] System SHALL handle GPS permission denial gracefully
- [ ] System SHALL work in low-signal areas (store coordinates, sync later)

### AC-4: Incident Reporting

#### AC-4.1: Report Incident
- [ ] System SHALL provide "Report Incident" action on trip details screen
- [ ] System SHALL display incident type selection:
  - Vehicle Breakdown
  - Accident
  - Product Damage
  - Theft/Security Issue
  - Route Blockage
  - Delay
  - Other
- [ ] System SHALL capture incident details:
  - Incident Type (dropdown)
  - Description (text, mandatory)
  - Incident Location (auto-capture GPS)
  - Photos/Videos (up to 5 files, optional)
  - Timestamp (auto-captured)
- [ ] System SHALL allow driver to add multiple incidents per trip
- [ ] System SHALL immediately notify Command Center and TDO
- [ ] System SHALL mark trip status as "Incident Reported"

#### AC-4.2: View Reported Incidents
- [ ] System SHALL display list of reported incidents per trip
- [ ] System SHALL show incident status: Reported, Under Review, Resolved
- [ ] System SHALL allow driver to add follow-up comments
- [ ] System SHALL display resolution notes from Command Center

### AC-5: Offline Mode

#### AC-5.1: Offline Data Access
- [ ] System SHALL cache assigned trips locally when online
- [ ] System SHALL allow viewing trip details offline
- [ ] System SHALL allow status updates offline (queued for sync)
- [ ] System SHALL allow incident reporting offline (queued for sync)
- [ ] System SHALL display "Offline Mode" indicator
- [ ] System SHALL show count of pending sync items

#### AC-5.2: Data Synchronization
- [ ] System SHALL automatically sync when connectivity restored
- [ ] System SHALL display sync progress indicator
- [ ] System SHALL retry failed syncs up to 3 times
- [ ] System SHALL notify driver of sync conflicts (if any)
- [ ] System SHALL prioritize critical updates (POD, incidents)

---

## Functional Requirements

### FR-001: User Authentication
- [Critical] System SHALL authenticate driver via phone number + OTP
- [Critical] System SHALL maintain login session for 30 days
- [High] System SHALL support browser-based authentication (no app installation required)
- [High] System SHALL allow logout and session invalidation

### FR-002: Trip Data Loading
- [Critical] System SHALL fetch trips via API: `GET /api/v1/drivers/me/trips?status=active`
- [Critical] System SHALL cache trips locally using browser storage (localStorage/IndexedDB)
- [High] System SHALL refresh trips on page load
- [High] System SHALL support manual refresh (pull-to-refresh or refresh button)

### FR-003: Status Update API
- [Critical] System SHALL POST status updates to backend
- [Critical] System SHALL include: `trip_id, new_status, timestamp, gps_location, remarks`
- [High] System SHALL queue updates if offline, batch sync when online (using Service Worker)
- [High] System SHALL handle duplicate status updates (idempotency)

### FR-004: GPS Tracking Service
- [Critical] System SHALL use browser Geolocation API for GPS tracking
- [Critical] System SHALL request location permission from user
- [High] System SHALL track location when page is active (foreground tracking)
- [High] System SHALL adjust tracking frequency based on battery level (if available via Battery API):
  - > 50%: Every 30 seconds
  - 20-50%: Every 60 seconds
  - < 20%: Every 120 seconds
- [Medium] System SHALL warn user about battery usage for continuous tracking

### FR-005: POD Capture
- [Critical] System SHALL capture photos using device camera via HTML5 camera API
- [Critical] System SHALL capture digital signature on HTML5 canvas
- [Critical] System SHALL compress images before upload (max 500 KB per image)
- [High] System SHALL allow retaking photo if blurry
- [Medium] System SHALL overlay timestamp on photo

### FR-006: Incident Reporting
- [Critical] System SHALL POST incidents to: `POST /api/v1/trips/{trip_id}/incidents`
- [Critical] System SHALL upload photos/videos to secure storage
- [High] System SHALL validate file size (max 10 MB per file)
- [High] System SHALL allow incident drafts (save to localStorage without submitting)

### FR-007: Browser Notifications
- [High] System SHALL use browser Push API for notifications (if supported):
  - New trip assignment
  - Trip cancellation
  - Route change
  - Urgent alerts from Command Center
- [High] System SHALL display in-page notification badge
- [Medium] System SHALL support notification actions (e.g., "View Trip")

---

## Business Rules

### BR-MOB-001: Trip Visibility
- Drivers can only view trips assigned to them
- **Enforcement**: API filters trips by `driver_id`

### BR-MOB-002: Trip Start Prerequisite
- Trip can only be started if status = "Dispatched"
- **Enforcement**: Frontend validation + backend check

### BR-MOB-003: Sequential Status Updates
- Status updates must follow valid state transitions
- **Enforcement**: State machine validation (see Trip Lifecycle)

### BR-MOB-004: POD Requirement
- Trip cannot be marked "Completed" without POD (photo + signature)
- **Enforcement**: Frontend validation, backend rejects incomplete POD

### BR-MOB-005: GPS Tracking Consent
- GPS tracking requires user consent
- **Enforcement**: Request permission on first trip start

### BR-MOB-006: Incident Photo Limit
- Maximum 5 photos/videos per incident
- **Enforcement**: Frontend validation

### BR-MOB-007: Offline Sync Limit
- Maximum 50 offline actions queued
- **Enforcement**: Warn user if queue full, force sync

---

## Data Model

```typescript
// Local Storage (Browser localStorage/IndexedDB)
DriverTrip {
  id: UUID
  to_number: String
  driver_id: UUID
  vehicle_id: UUID
  helper_id: UUID (nullable)
  
  // Trip details
  source_poi: POI
  destination_poi: POI
  product: Product
  quantity: Decimal
  uom: String
  
  // Dates
  planned_delivery_date: Date
  actual_start_time: Timestamp (nullable)
  actual_end_time: Timestamp (nullable)
  
  // Status
  status: Enum (Dispatched, In_Transit, Arrived, Loading, Unloading, Completed, Incident)
  
  // Sync
  is_synced: Boolean
  last_synced_at: Timestamp
}

TripStatusUpdate {
  id: UUID (local)
  trip_id: UUID
  old_status: String
  new_status: String
  timestamp: Timestamp
  gps_location: {lat: Float, lng: Float}
  remarks: String
  is_synced: Boolean
}

GPSTrackingPoint {
  id: UUID (local)
  trip_id: UUID
  latitude: Float
  longitude: Float
  timestamp: Timestamp
  accuracy: Float
  speed: Float
  is_synced: Boolean
}

ProofOfDelivery {
  id: UUID (local)
  trip_id: UUID
  photo_path: String (local file path)
  signature_path: String (local file path)
  recipient_name: String
  recipient_phone: String
  delivery_timestamp: Timestamp
  is_synced: Boolean
}

TripIncident {
  id: UUID (local)
  trip_id: UUID
  incident_type: Enum
  description: String
  gps_location: {lat: Float, lng: Float}
  photos: Array<String> (local file paths)
  reported_at: Timestamp
  is_synced: Boolean
}
```

---

## UI/UX Requirements

### Mobile-Responsive Web Interface Design

#### Home Screen - Trip List
```
┌─────────────────────────────────────┐
│  🚛 My Trips          [Menu]  [🔔3] │
├─────────────────────────────────────┤
│  Filters: [All ▼] [Today ▼]         │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ TO-20260211-0042     🟢 Active│ │
│  │ Live Birds (500 KG)            │ │
│  │ Farm A → Distribution Center   │ │
│  │ 📍 15 km | ⏱️ 2:30 PM          │ │
│  │ [Start Trip] [View Details]   │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ TO-20260211-0038     🔵 Upcoming│
│  │ Feed (1000 KG)                 │ │
│  │ Warehouse → Farm B             │ │
│  │ 📍 45 km | ⏱️ Tomorrow 8:00 AM │ │
│  │ [View Details]                 │ │
│  └───────────────────────────────┘ │
│                                     │
│  Completed Today: 2 trips ✅       │
└─────────────────────────────────────┘
```

#### Trip Details Screen
```
┌─────────────────────────────────────┐
│  ← TO-20260211-0042                 │
│  Status: In Transit 🟢              │
├─────────────────────────────────────┤
│  📦 Product: Live Birds (500 KG)    │
│  🚛 Vehicle: Dhaka-Metro-11-1234    │
│  👤 Helper: Karim Ahmed             │
│                                     │
│  📍 Route:                           │
│  ├─ Farm A (Bhaluka)               │
│  └─ Distribution Center (Mirpur)   │
│                                     │
│  ⏱️ Timeline:                        │
│  ✅ Dispatched: 1:00 PM             │
│  ✅ Started: 1:15 PM                │
│  🔵 In Transit (current)            │
│  ⏹️ Arrive at Destination           │
│  ⏹️ Complete Delivery               │
│                                     │
│  [🗺️ Navigate] [📍 Update Status]  │
│  [⚠️ Report Incident]              │
│                                     │
│  Incidents: None                    │
│  Delivery Notes: Handle with care   │
└─────────────────────────────────────┘
```

#### Update Status Modal
```
┌─────────────────────────────────────┐
│  Update Trip Status                 │
├─────────────────────────────────────┤
│  Current: In Transit                │
│                                     │
│  New Status:                        │
│  ⚪ Arrived at Destination           │
│  ⚪ Unloading in Progress            │
│  ⚪ Completed (requires POD)         │
│                                     │
│  Remarks (optional):                │
│  ┌─────────────────────────────────┐│
│  │ Arrived on time, no delays      ││
│  └─────────────────────────────────┘│
│                                     │
│  Current Location: Mirpur, Dhaka    │
│  📍 GPS: 23.8103° N, 90.4125° E     │
│                                     │
│  [Cancel]              [Confirm]    │
└─────────────────────────────────────┘
```

#### POD Capture Screen
```
┌─────────────────────────────────────┐
│  Proof of Delivery                  │
├─────────────────────────────────────┤
│  1. Take Photo of Delivered Goods * │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │    [📷 CAPTURED PHOTO]          ││
│  │                                 ││
│  └─────────────────────────────────┘│
│  [Retake Photo] [✓ Photo OK]       │
│                                     │
│  2. Recipient Signature *           │
│  ┌─────────────────────────────────┐│
│  │  [Signature Canvas]             ││
│  │                                 ││
│  └─────────────────────────────────┘│
│  [Clear] [✓ Signature OK]          │
│                                     │
│  3. Recipient Name *                │
│  [________________________]         │
│                                     │
│  4. Recipient Phone (optional)      │
│  [________________________]         │
│                                     │
│  [Cancel]       [Complete Delivery] │
└─────────────────────────────────────┘
```

#### Incident Report Screen
```
┌─────────────────────────────────────┐
│  Report Incident                    │
├─────────────────────────────────────┤
│  Incident Type: *                   │
│  [Vehicle Breakdown        ▼]       │
│                                     │
│  Description: *                     │
│  ┌─────────────────────────────────┐│
│  │ Engine overheating issue        ││
│  │ Stopped at Tongi, need mechanic ││
│  └─────────────────────────────────┘│
│                                     │
│  Location: Tongi, Gazipur           │
│  📍 23.8975° N, 90.4028° E (auto)   │
│                                     │
│  Add Photos: (0/5)                  │
│  [📷 Take Photo] [🖼️ Choose from Gallery] │
│                                     │
│  [Save as Draft]        [Submit]    │
└─────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Authentication
POST /api/v1/drivers/auth/send-otp
Body: {phone: string}

POST /api/v1/drivers/auth/verify-otp
Body: {phone: string, otp: string}
Response: {token: string, driver: Driver}

// Get assigned trips
GET /api/v1/drivers/me/trips
Query: ?status=active&date=2026-02-11
Response: {trips: DriverTrip[]}

// Update trip status
POST /api/v1/trips/{trip_id}/status
Body: {
  new_status: string,
  timestamp: ISO8601,
  gps_location: {lat: number, lng: number},
  remarks?: string
}

// Upload GPS tracking points (batch)
POST /api/v1/trips/{trip_id}/gps-track
Body: {
  tracking_points: [
    {lat: number, lng: number, timestamp: ISO8601, accuracy: number}
  ]
}

// Submit POD
POST /api/v1/trips/{trip_id}/pod
Body: FormData {
  photo: File,
  signature: File,
  recipient_name: string,
  recipient_phone?: string,
  delivery_timestamp: ISO8601
}

// Report incident
POST /api/v1/trips/{trip_id}/incidents
Body: FormData {
  incident_type: string,
  description: string,
  gps_location: {lat: number, lng: number},
  photos?: File[]
}

// Get driver notifications
GET /api/v1/drivers/me/notifications
Response: {notifications: Notification[]}
```

---

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds on 3G/4G
- Trip list load: < 1 second
- GPS tracking battery impact: Minimized (foreground tracking only)
- Offline mode: Full functionality for cached trips using Service Worker

### Compatibility
- Mobile browsers: Chrome, Safari, Firefox (latest 2 versions)
- Screen sizes: 4.7" to 6.7" (responsive design)
- Operating Systems: Android 8.0+, iOS 13.0+
- Languages: English, Bangla (Phase 3)

### Security
- Encrypted local storage (browser localStorage/IndexedDB)
- HTTPS for all API calls
- Token-based authentication (JWT)
- Secure session management

### Usability
- Simple, driver-friendly UI (minimal training required)
- Large touch targets (min 48x48 px)
- High contrast for outdoor visibility
- Progressive Web App (PWA) features for app-like experience

### Reliability
- Offline mode: 100% functionality for active trips using Service Worker
- Auto-save: Every user action saved locally
- Page refresh recovery: Resume from last state
- Sync retry: Up to 3 attempts with exponential backoff

---

## Testing Scenarios

### Happy Path
1. Driver logs in → Sees assigned trips
2. Driver starts trip → GPS tracking begins
3. Driver updates status at checkpoints → Real-time sync
4. Driver arrives at destination → Captures POD → Trip completed

### Edge Cases
1. **No network coverage**: App works offline, syncs later
2. **Low battery**: Reduces GPS frequency, warns driver
3. **GPS permission denied**: Shows warning, allows manual location entry
4. **Photo capture fails**: Allows retry, fallback to gallery

### Error Scenarios
1. **Invalid OTP**: Clear error message, resend option
2. **POD upload fails**: Retry mechanism, queued upload
3. **Trip not found**: Refresh trips, show error
4. **Sync conflict**: Show conflict resolution options

---

## Dependencies

### Prerequisites
- ✅ US-026: Trip Lifecycle Management (defines trip states)
- ✅ US-020: TO Execution - Own Fleet (creates trips)

### Enables
- → Real-time trip tracking in Command Center
- → Digital POD archive for compliance
- → Incident data for analytics

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Mobile-responsive web interface functional on iOS & Android browsers
- [ ] Authentication (phone + OTP)
- [ ] Trip list, details, status update flows complete
- [ ] GPS tracking (foreground via Geolocation API)
- [ ] POD capture (photo + signature via HTML5 APIs)
- [ ] Incident reporting (text + photos)
- [ ] Offline mode: Full functionality for cached data (Service Worker)
- [ ] Sync queue: Automatic background sync when online
- [ ] Browser notifications: Push API integrated (if supported)
- [ ] Unit tests: coverage > 75%
- [ ] Field testing: 10 drivers, 50+ trips
- [ ] Performance: Optimized for mobile browsers
- [ ] PWA features: Installable, offline-capable
- [ ] User manual: Driver onboarding guide

---

**Story Points**: 8  
**Estimated Hours**: 80 hours  
**Assigned To**: Frontend Team (Responsive Web Developers)  
**Sprint**: Sprint 9  
**Priority**: High (Critical for field operations)  
**Platform**: Mobile-Responsive Web (iOS Safari 13+, Android Chrome 8+)

---

**Source Documents**:
- PRD Section 6.9.1: Driver Mobile Interface - Trip Management (Trip Assignment & Navigation)

**Last Updated**: February 13, 2026  
**Status**: Updated to reflect mobile-responsive web interface (not native app) per PRD clarification

