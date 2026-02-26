---
source_document: PRD_DFMS_v1.0.md
source_sections: Trip Closure & Proof of Delivery (POD), Trip Costing, Vendor Trip Cost & Billing & Claims Management, Trip Management (Trip Assignment & Navigation), Vendor Portal Access (Bidding & Trip Management), Trip Management & Tracking, GPS Tracking & Basic Trip Costing
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [transport-order-management, gate-operations, qc-inspection]
---

# Trip Management & Tracking

## Overview

Trip Management is the **field execution layer** that tracks the physical movement of vehicles from pickup to delivery. A Trip represents the operational record of a **single vehicle journey**, capturing gate entries/exits, loading/unloading activities, GPS tracking, delivery confirmation, and QC validation.

The Trip is the fundamental unit of **operational monitoring** and **cost tracking** in DFMS. It provides real-time visibility to all stakeholders (planners, drivers, vendors, management) and serves as the foundation for proof of delivery (POD), billing, and performance analytics.

### Purpose

- Track vehicle journey lifecycle (assigned → in-transit → delivered → completed)
- Capture gate-in/gate-out timestamps at source and destination POIs
- Record loading and unloading activities with personnel confirmation
- Enable GPS tracking and geofencing (POI entry/exit detection)
- Manage proof of delivery (POD) with driver and unloading personnel confirmation
- Support automatic trip closure (QC pass + POD)
- Enable trip-level cost tracking (own fleet vs vendor)
- Provide vendor trip visibility for billing and claims

### Workflow Position

```
Transport Order (TO) → [Allocated]
    ↓
Trip Created → [Assigned to Driver]
    ↓
Trip Started → [Gate-in, Loading, Gate-out (Source)]
    ↓
In Transit → [GPS tracking, Geofence events]
    ↓
Arrived → [Gate-in (Destination)]
    ↓
Unloading → [Quantity confirmation, Gate-out]
    ↓
QC Inspection → [Pass/Fail]
    ↓
POD Confirmation → [Driver attachment]
    ↓
Trip Auto-Closed → [Completed]
```

---

## Trip Lifecycle States

| State | Actor | Description |
|-------|-------|-------------|
| **Assigned** | System | Trip created from TO, driver receives assignment |
| **Started** | Driver | Driver initiates trip (en route to source POI) |
| **At Source** | System/Gate | Vehicle entered source POI geofence / gate-in |
| **Loading** | Loading Personnel | Loading in progress |
| **Departed Source** | System/Gate | Vehicle exited source POI geofence / gate-out |
| **In Transit** | System | Vehicle en route to destination POI |
| **At Destination** | System/Gate | Vehicle entered destination POI geofence / gate-in |
| **Unloading** | Unloading Personnel | Unloading in progress |
| **Departed Destination** | System/Gate | Vehicle exited destination POI geofence / gate-out |
| **Awaiting QC** | System | Unloading complete, pending QC inspection |
| **QC Passed** | QC Inspector | Product quality validated |
| **POD Pending** | Driver | QC passed, driver must attach POD |
| **Completed** | System | Auto-closed (QC pass + POD received + gate-out) |
| **QC Failed** | QC Inspector | Quality issues detected, trip on hold |
| **Incident** | Driver/TP | Issue reported (accident, breakdown, delay) |
| **Cancelled** | TP/TM | Trip cancelled before completion |

---

## Trip Creation from TO

### Trigger

When a Transport Order (TO) status = `READY_FOR_TRIP` (vehicle/driver assigned, allocation complete), Transport Planner (TP) creates a Trip.

### Workflow

```
1. TP clicks "Create Trip" on TO detail page
2. System generates Trip record:
   - Trip ID (auto-generated)
   - Inherits TO details (route, product, quantity, vehicle, driver, helper)
   - Trip status = 'ASSIGNED'
3. Driver receives push notification (Driver App):
   - "New trip assigned: [Trip ID]"
   - Trip details visible in Driver App
4. TO status → 'TRIP_CREATED'
```

### Data Model

```typescript
interface Trip {
  trip_id: string;                  // Auto-generated (e.g., TRIP-2026-00789)
  to_id: string;                    // Source Transport Order
  tr_id: string;                    // Source Transport Requisition (via TO)
  pr_id: string;                    // Source Product Requisition (via TR)
  
  // Route
  source_poi_id: string;            // Loading point
  destination_poi_id: string;       // Unloading point
  route_distance_km?: number;       // Planned distance
  actual_distance_km?: number;      // GPS-tracked distance
  
  // Product Details
  product_code: string;
  product_category: string;
  planned_quantity: number;         // From TO
  loaded_quantity?: number;         // Confirmed by loading personnel
  delivered_quantity?: number;      // Confirmed by unloading personnel
  uom: string;
  
  // Vehicle & Resources
  vehicle_id?: string;              // Own fleet vehicle ID
  vehicle_number: string;           // Or vendor vehicle number
  vehicle_type: string;
  driver_id?: string;               // Own fleet driver ID
  driver_name: string;              // Or vendor driver name
  helper_id?: string;
  helper_name?: string;
  vendor_id?: string;               // If vendor trip
  
  // Schedule
  planned_pickup_date: Date;
  planned_delivery_date: Date;
  actual_start_time?: Date;         // Driver starts trip
  actual_pickup_time?: Date;        // Gate-out from source
  actual_delivery_time?: Date;      // Gate-in at destination
  actual_completion_time?: Date;    // Trip closed
  
  // Gate Tracking
  source_gate_in_time?: Date;
  source_gate_out_time?: Date;
  destination_gate_in_time?: Date;
  destination_gate_out_time?: Date;
  
  // Loading/Unloading
  loading_start_time?: Date;
  loading_end_time?: Date;
  loading_personnel?: string;       // Name/ID of loading staff
  unloading_start_time?: Date;
  unloading_end_time?: Date;
  unloading_personnel?: string;     // Name/ID of unloading staff
  
  // QC & POD
  qc_status?: 'PENDING' | 'PASSED' | 'FAILED' | 'SKIPPED';
  qc_inspector?: string;
  qc_completed_at?: Date;
  qc_remarks?: string;
  pod_url?: string;                 // Proof of Delivery (image/PDF upload)
  pod_submitted_at?: Date;
  pod_submitted_by?: string;        // Driver
  
  // GPS Tracking
  gps_tracking_enabled: boolean;
  gps_device_id?: string;
  current_location?: { lat: number; lng: number };
  last_location_update?: Date;
  geofence_events?: GeofenceEvent[];
  
  // Trip Status
  status: TripStatus;
  incident_reported?: boolean;
  incident_details?: TripIncident;
  
  // Costing
  trip_cost?: TripCost;
  
  // Metadata
  created_by: string;               // Transport Planner
  created_at: Date;
  completed_at?: Date;
  tenant_id: string;
}

type TripStatus = 
  | 'ASSIGNED'
  | 'STARTED'
  | 'AT_SOURCE'
  | 'LOADING'
  | 'DEPARTED_SOURCE'
  | 'IN_TRANSIT'
  | 'AT_DESTINATION'
  | 'UNLOADING'
  | 'DEPARTED_DESTINATION'
  | 'AWAITING_QC'
  | 'QC_PASSED'
  | 'POD_PENDING'
  | 'COMPLETED'
  | 'QC_FAILED'
  | 'INCIDENT'
  | 'CANCELLED';
```

---

## Driver Trip Assignment & Navigation

### Purpose

Drivers view assigned trips, initiate trip start, and navigate routes. Driver App provides trip details, navigation support, and action buttons for trip lifecycle management.

### Driver App Features (Phase 1)

**Trip List View:**
- Assigned trips (status = ASSIGNED)
- In-progress trips (status = STARTED, IN_TRANSIT, etc.)
- Completed trips (last 7 days)

**Trip Detail View:**
- TO ID, Trip ID
- Pickup POI (name, address, contact)
- Drop POI (name, address, contact)
- Product type, quantity, UOM
- Urgency badge (Normal / High / Critical)
- Planned pickup and delivery date/time

**Action Buttons:**
- **Start Trip:** Initiates trip (status → STARTED)
- **Navigate:** Opens navigation app (Google Maps, Waze integration)
- **Report Incident:** Opens incident reporting form
- **Attach POD:** Upload delivery proof (photo/document)

### Driver Workflow

```
1. Driver logs into Driver App
2. Driver sees "Assigned" trips
3. Driver taps "Start Trip":
   - Trip status → 'STARTED'
   - System logs actual start time
4. Driver taps "Navigate" → External navigation app opens
5. Driver arrives at source POI:
   - System detects geofence entry (if GPS enabled)
   - Trip status → 'AT_SOURCE'
6. Driver waits for loading (loading personnel actions)
7. Gate-out from source POI:
   - Gate operator logs gate-out
   - Trip status → 'DEPARTED_SOURCE'
8. Driver en route to destination:
   - GPS tracking active (real-time location updates)
   - System updates "current_location" every 30 seconds
9. Driver arrives at destination POI:
   - System detects geofence entry
   - Trip status → 'AT_DESTINATION'
10. Driver waits for unloading (unloading personnel actions)
11. Driver attaches POD:
    - Takes photo of signed delivery note
    - Uploads via Driver App
    - Trip status → 'POD_PENDING' → 'COMPLETED' (if QC passed)
```

### Data Restrictions (Driver View)

**Drivers can only view:**
- Trips assigned to them (vehicle_id or driver_id matches)
- Own completed trips (last 30 days)

**Drivers cannot see:**
- Other drivers' trips
- Trip costing information
- Vendor bid rates (if vendor driver)
- TO/TR details (read-only summary only)

---

## Gate Tracking (Gate-In / Gate-Out)

### Purpose

Gate operations at source and destination POIs capture vehicle entry/exit timestamps. This enables:
- Accurate dwell time calculation (time spent at POI)
- Gate operator accountability
- Geofencing validation (GPS vs manual gate logs)

### Gate Workflow (Manual Entry)

**Source POI - Gate-In:**
```
1. Vehicle arrives at source POI gate
2. Gate operator scans/enters:
   - Vehicle number
   - Trip ID (or TO ID)
3. System validates:
   - Trip exists and status allows gate-in (STARTED, AT_SOURCE)
   - Vehicle number matches Trip record
4. System logs:
   - source_gate_in_time = current timestamp
   - Trip status → 'AT_SOURCE'
```

**Source POI - Gate-Out:**
```
1. Vehicle departs source POI gate (post-loading)
2. Gate operator logs gate-out:
   - Vehicle number, Trip ID
3. System validates:
   - Gate-in timestamp exists (cannot gate-out before gate-in)
   - Loading completed (loading_end_time exists)
4. System logs:
   - source_gate_out_time = current timestamp
   - Trip status → 'DEPARTED_SOURCE' → 'IN_TRANSIT'
```

**Destination POI - Gate-In:**
```
1. Vehicle arrives at destination POI gate
2. Gate operator logs gate-in:
   - Vehicle number, Trip ID
3. System logs:
   - destination_gate_in_time = current timestamp
   - Trip status → 'AT_DESTINATION'
```

**Destination POI - Gate-Out:**
```
1. Vehicle departs destination POI gate (post-unloading + QC)
2. Gate operator logs gate-out:
   - Vehicle number, Trip ID
3. System validates:
   - Unloading completed (unloading_end_time exists)
   - QC passed (qc_status = 'PASSED')
   - POD received (pod_url exists)
4. System logs:
   - destination_gate_out_time = current timestamp
   - Trip status → 'COMPLETED' (if all closure criteria met)
```

### Geofencing Integration (Automatic)

**If GPS tracking enabled and geofences configured:**
- System auto-detects POI entry/exit based on GPS coordinates
- Gate logs serve as **validation** (GPS vs manual entry)
- Discrepancies flagged for review (e.g., GPS entry but no gate log)

**Geofence Event Logging:**
```typescript
interface GeofenceEvent {
  trip_id: string;
  poi_id: string;
  event_type: 'ENTRY' | 'EXIT';
  detected_at: Date;
  gps_location: { lat: number; lng: number };
  gate_log_time?: Date;             // Manual gate entry (if exists)
  discrepancy: boolean;             // True if GPS vs gate log differ > threshold
}
```

---

## Loading & Unloading Confirmation

### Purpose

Loading and unloading personnel confirm product quantities and activity timestamps. This provides:
- Quantity traceability (planned vs loaded vs delivered)
- Personnel accountability
- Variance detection (quantity discrepancies)

### Loading Workflow (Source POI)

```
1. Loading personnel (at source POI) logs:
   - Trip ID
   - Number of bags/pieces/tons loaded
   - Weight (if applicable)
   - Loading start time (manual or auto-captured)
2. Loading complete:
   - Loading personnel confirms completion
   - System logs loading_end_time
3. System compares:
   - Loaded quantity vs planned quantity
   - If variance > threshold (e.g., 5%), warning flag raised
4. Gate operator allows gate-out (post-loading confirmation)
```

**Data Model:**
```typescript
interface LoadingConfirmation {
  trip_id: string;
  loaded_quantity: number;
  uom: string;
  weight_kg?: number;
  loading_start_time: Date;
  loading_end_time: Date;
  loading_personnel: string;        // User ID or name
  remarks?: string;
  variance_flag: boolean;           // True if loaded ≠ planned
}
```

### Unloading Workflow (Destination POI)

```
1. Unloading personnel (at destination POI) logs:
   - Trip ID
   - Number of bags/pieces/tons unloaded
   - Weight (if applicable)
   - Unloading start time
2. Unloading complete:
   - Unloading personnel confirms completion
   - System logs unloading_end_time
3. System compares:
   - Unloaded quantity vs loaded quantity
   - If variance detected → incident flag (partial delivery or damage)
4. System triggers QC inspection (if configured)
```

**Data Model:**
```typescript
interface UnloadingConfirmation {
  trip_id: string;
  delivered_quantity: number;
  uom: string;
  weight_kg?: number;
  unloading_start_time: Date;
  unloading_end_time: Date;
  unloading_personnel: string;
  remarks?: string;
  variance_flag: boolean;           // True if delivered ≠ loaded
}
```

---

## Trip Closure & Proof of Delivery (POD)

### Auto-Closure Criteria

A trip **auto-closes** when **all** of the following conditions are met:

1. ✅ **Unloading complete:** `unloading_end_time` exists
2. ✅ **QC passed:** `qc_status = 'PASSED'` (or SKIPPED if QC not required)
3. ✅ **POD received:** `pod_url` exists (driver uploaded proof)
4. ✅ **Gate-out (destination):** `destination_gate_out_time` exists

**Auto-Closure Workflow:**
```
1. System monitors trip status (event-driven or scheduled checks)
2. If all 4 criteria met:
   - Trip status → 'COMPLETED'
   - actual_completion_time = current timestamp
   - TO status → 'COMPLETED'
   - TR's allocated quantity marked as fulfilled
3. Notifications sent:
   - Transport Planner: "Trip [ID] completed"
   - Vendor (if applicable): "Trip [ID] completed, ready for billing"
```

### Proof of Delivery (POD)

**POD Requirements:**
- **Document Type:** Photo (JPEG, PNG) or PDF
- **Content:** Signed delivery note, goods receipt, or unloading confirmation
- **Submitter:** Driver (via Driver App)
- **Timing:** After unloading, before trip closure

**POD Submission Workflow:**
```
1. Driver completes delivery (unloading done)
2. Driver takes photo of signed delivery note (customer/receiver signature)
3. Driver uploads POD via Driver App:
   - Trip detail page → "Attach POD" button
   - Camera capture or file upload
4. System validates:
   - File size < 5MB
   - File type = image or PDF
5. System stores POD:
   - pod_url = cloud storage path (S3, Azure Blob)
   - pod_submitted_at = current timestamp
   - pod_submitted_by = driver_id
6. System checks auto-closure criteria:
   - If QC passed + gate-out done → Trip status → 'COMPLETED'
```

### Trip Cannot Close If:

- ❌ **POD not received:** Driver must attach POD (mandatory)
- ❌ **QC failed:** Trip status = 'QC_FAILED', pending resolution (rework or rejection)
- ❌ **Gate-out missing:** Vehicle must exit destination POI gate

**Manual Closure Override (TP/TM authority):**
- Allowed if business justification exists (e.g., POD lost, QC bypass authorized)
- Requires mandatory remarks
- Audit logged

---

## GPS Tracking & Geofencing

### GPS Tracking (Phase 1: Read-Only)

**Purpose:** Real-time vehicle location monitoring for trip visibility and ETA calculation.

**Implementation:**
- GPS device installed in vehicles (own fleet)
- GPS data pushed to DFMS backend (API integration)
- Current location updated every 30 seconds
- Location history stored for route replay

**Data Model:**
```typescript
interface GPSTracking {
  trip_id: string;
  gps_device_id: string;
  current_location: {
    lat: number;
    lng: number;
    timestamp: Date;
    speed_kmh?: number;
    heading_degrees?: number;
  };
  location_history: {
    lat: number;
    lng: number;
    timestamp: Date;
  }[];
  total_distance_km?: number;       // GPS-calculated distance
}
```

**UI/UX:**
- Live map view (TP dashboard)
- Trip route visualization (planned route vs actual route)
- ETA calculation (based on current location + distance remaining)

### Geofencing & Dwell Time Tracking

**Purpose:** Detect POI entry/exit events and calculate time spent at POIs.

**Geofence Configuration:**
- Each POI has a geofence (circular or polygonal boundary)
- Geofence radius configurable (e.g., 200m for depots, 500m for factories)

**Geofence Event Detection:**
```
1. GPS device sends location update
2. System checks if location is within any POI geofence
3. If entry detected:
   - Log geofence event (type = ENTRY)
   - Compare with gate-in log (validation)
4. If exit detected:
   - Log geofence event (type = EXIT)
   - Compare with gate-out log (validation)
   - Calculate dwell time (entry timestamp - exit timestamp)
```

**Dwell Time Applications:**
- **Loading/Unloading efficiency:** Time spent at source/destination POI
- **Delay detection:** Excessive dwell time (> threshold) triggers alert
- **Performance analytics:** Average dwell time per POI, vehicle, driver

**Data Model:**
```typescript
interface DwellTime {
  trip_id: string;
  poi_id: string;
  poi_type: 'SOURCE' | 'DESTINATION';
  entry_time: Date;
  exit_time: Date;
  dwell_duration_minutes: number;
  threshold_minutes: number;        // Configured per POI
  delay_flag: boolean;              // True if dwell > threshold
}
```

---

## Trip Costing

### Purpose

Record and track trip-level costs for:
- Financial accounting (trip expense tracking)
- Cost comparison (own fleet vs vendor)
- Invoice preparation (vendor billing)

### Cost Types

**Own Fleet Costs:**
- **Distance-based cost:** Calculated (distance_km × rate_per_km)
- **Fuel cost:** Manual entry (actual fuel expense)
- **Maintenance allocation:** Manual entry (pro-rated maintenance cost)
- **Toll / Ferry / Parking:** Manual entry (actual expense)
- **Other operational charges:** Manual entry (miscellaneous)

**Vendor Fleet Costs:**
- **Vendor trip charge:** Locked bid rate (from approved bid) or contractual rate
- **Additional charges:** Detention (if delay caused by DFMS), claims (if applicable)

### Data Model

```typescript
interface TripCost {
  trip_id: string;
  fleet_type: 'OWN_FLEET' | 'VENDOR';
  
  // Distance-based
  total_distance_km: number;        // GPS-tracked or manual
  cost_per_km: number;              // Configured per vehicle type
  distance_based_cost: number;      // Calculated
  
  // Own Fleet Manual Costs
  fuel_cost?: number;
  fuel_liters?: number;
  fuel_rate_per_liter?: number;
  maintenance_allocation?: number;
  toll_ferry_parking?: number;
  other_operational_charges?: number;
  
  // Vendor Costs
  vendor_trip_charge?: number;      // From approved bid
  vendor_additional_charges?: number; // Detention, claims
  
  // Total
  total_trip_cost: number;          // Sum of all costs
  
  // Entry Metadata
  entered_by: string;               // Accounts Officer or TP
  entered_at: Date;
  approved_by?: string;             // Financial Manager (if required)
  approved_at?: Date;
}
```

### Cost Entry Workflow

**Own Fleet:**
```
1. Trip completed (status = 'COMPLETED')
2. Accounts Officer or TP opens Trip Cost Sheet
3. System pre-fills:
   - Distance (from GPS or manual entry)
   - Distance-based cost (distance × rate_per_km)
4. User enters manual costs:
   - Fuel, Maintenance, Toll, Other
5. System calculates total_trip_cost
6. User saves → Cost locked (editable only by authorized roles)
```

**Vendor Fleet:**
```
1. Trip completed (status = 'COMPLETED')
2. System auto-populates:
   - vendor_trip_charge (from approved bid rate)
3. Accounts Officer can add:
   - Additional charges (detention, claims)
4. System calculates total_trip_cost
5. Vendor views trip cost in Vendor Portal (ready for invoicing)
```

### Cost History & Audit

- All cost entries audit-logged (user, timestamp, field changes)
- Cost modifications require approval (if configured)
- Cost summary available at Trip, TO, TR, PR levels (aggregated)

---

## Vendor Portal Access (Bidding & Trip Management)

### Purpose

Vendors access DFMS to:
- View available bids (TOs open for bidding)
- Submit bids
- Track assigned trips (post-bid approval)
- View completed trips and costs (for invoicing)
- Add driver and helper details (post-winning bid)
- Add vehicle details (post-winning bid)

### Vendor Dashboard

**Tabs:**
1. **Available Bids:** TOs open for bidding
2. **Active Trips:** Trips in progress (assigned to vendor)
3. **Completed Trips:** Trips completed (ready for invoicing)
4. **Invoices:** Submitted invoices and payment status (Phase 2)

**Available Bids View:**
- TO ID, Route, Product, Quantity, Delivery Date, Urgency
- "Submit Bid" button → Opens bid form

**Active Trips View:**
- Trip ID, TO ID, Vehicle Number, Driver Name, Route, Status
- Real-time status updates (In Transit, At Destination, etc.)

**Completed Trips View:**
- Trip ID, TO ID, Completion Date, Distance, Trip Cost
- "Generate Invoice" button (Phase 2)

### Vendor Post-Bid Actions

**After Bid Approval:**
```
1. Vendor receives notification: "Bid approved for TO [ID]"
2. Vendor logs into Vendor Portal
3. Vendor adds:
   - Vehicle Number (from vendor's fleet)
   - Vehicle Type (must match TO requirement)
   - Driver Name, License Number, Contact
   - Helper Name, Contact (if applicable)
4. Vendor submits → TP receives notification
5. TP validates and creates Trip
```

**Data Access Control:**
- Vendor can only view **own assigned TOs and Trips**
- Vendor cannot see other vendors' bids or rates
- Vendor cannot modify trip status (read-only monitoring)

---

## Trip Incident Management

### Purpose

Capture and track trip issues (accidents, breakdowns, delays, partial deliveries) for resolution and audit.

### Incident Types

- **Accident:** Vehicle collision, damage
- **Breakdown:** Vehicle mechanical failure
- **Delay:** Significant delay (> threshold)
- **Partial Delivery:** Quantity delivered < loaded quantity (damage, theft, spillage)
- **Route Deviation:** Vehicle deviated from planned route
- **Other:** Miscellaneous issues

### Incident Reporting Workflow

```
1. Driver or TP reports incident:
   - Driver: "Report Incident" button in Driver App
   - TP: Incident flag on Trip detail page
2. User fills incident form:
   - Incident type (dropdown)
   - Description (text area)
   - Location (GPS or manual)
   - Photos (upload)
   - Estimated delay (if applicable)
3. User submits → Trip status → 'INCIDENT'
4. System notifies:
   - Transport Manager (TM)
   - Transport Planner (TP)
5. TM reviews and assigns resolution action:
   - Investigate, Arrange alternate vehicle, Adjust TO, Cancel trip
6. Incident resolved:
   - TM marks incident as "Resolved"
   - Trip status → previous state (or CANCELLED if unresolved)
```

### Data Model

```typescript
interface TripIncident {
  incident_id: string;
  trip_id: string;
  
  // Incident Details
  incident_type: 'ACCIDENT' | 'BREAKDOWN' | 'DELAY' | 'PARTIAL_DELIVERY' | 'ROUTE_DEVIATION' | 'OTHER';
  description: string;
  location?: { lat: number; lng: number };
  photos?: string[];                // Cloud storage URLs
  estimated_delay_minutes?: number;
  
  // Reporting
  reported_by: string;              // Driver or TP
  reported_at: Date;
  
  // Resolution
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  assigned_to?: string;             // TM or TP
  resolution_notes?: string;
  resolved_at?: Date;
}
```

---

## Business Rules

### Trip Creation Constraints

1. **TO status must be READY_FOR_TRIP or ALLOCATED**
2. **Vehicle/Driver assignment must exist** (own fleet or vendor)
3. **Planned delivery date ≥ current date**

### Trip Start Constraints

1. **Driver must be logged in** (authentication)
2. **Trip status = ASSIGNED** (cannot start if already started)

### Gate-Out Constraints (Source)

1. **Loading must be completed** (loading_end_time exists)
2. **Gate-in must exist** (cannot gate-out before gate-in)

### Trip Closure Constraints

1. **QC status = PASSED or SKIPPED**
2. **POD must be attached** (pod_url exists)
3. **Gate-out (destination) must be logged**
4. **Unloading must be completed**

---

## Integration Points

### Upstream: Transport Order (TO)

**TO-to-Trip Linkage:**
- Each Trip references exactly one TO (`to_id`)
- Trip creation triggered by TP action (manual "Create Trip")
- TO status updates based on Trip lifecycle (IN_PROGRESS, COMPLETED)

### Downstream: QC Inspection

**Trip-to-QC Linkage:**
- Unloading complete → QC inspection triggered (if configured)
- QC result (PASSED/FAILED) updates Trip status
- QC FAILED → Trip cannot close, incident/rework required

### Lateral: Gate Operations

**Gate Logs:**
- Gate-in/gate-out timestamps recorded by gate operators
- Gate logs validate geofence events (GPS vs manual)
- Dwell time calculated from gate logs

### Lateral: POI Capacity Tracking

**Stock Updates:**
- Trip completion (QC passed) → Destination POI stock +delivered_quantity
- Source POI stock -loaded_quantity (at loading confirmation)

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Active trips:** 50-150 concurrent trips
- **Daily trip completions:** 100-300 trips
- **GPS updates:** 50-150 updates/second (if all trips have GPS)

### Query Optimization

```sql
-- Active Trips Dashboard (TP view)
CREATE INDEX idx_trip_status_date ON trips(status, planned_delivery_date);

-- Trip by Vehicle/Driver
CREATE INDEX idx_trip_vehicle_driver ON trips(vehicle_id, driver_id, status);

-- Trip by TO (traceability)
CREATE INDEX idx_trip_to_id ON trips(to_id);

-- GPS Tracking
CREATE INDEX idx_trip_gps_location ON trips(trip_id, last_location_update DESC);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All Trip queries filtered by `tenant_id`
- **Role-Based Filtering:**
  - Driver: Own trips only (`driver_id = current_user`)
  - Vendor: Own trips only (`vendor_id = current_vendor`)
  - TP: All trips (tenant-wide)

### Audit Requirements

**Mandatory Audit Events:**
- Trip creation
- Trip start (driver action)
- Gate-in/gate-out (all POIs)
- Loading/unloading confirmation
- QC result
- POD submission
- Trip closure
- Incident reporting

---

## Key Design Decisions

### Why Auto-Close Trips?

**Rationale:**
- Reduces manual overhead (no TP action needed)
- Ensures consistency (all closure criteria validated)
- Speeds up billing (vendor trips auto-ready for invoicing)

### Why Mandatory POD?

**Rationale:**
- Proof of delivery is legally required (dispute resolution)
- Ensures driver accountability (delivery confirmation)
- Supports billing (vendor invoicing requires POD)

### Why Read-Only GPS in Phase 1?

**Rationale:**
- GPS infrastructure (devices, integration) takes time
- Read-only mode provides visibility without complex logic
- Phase 2 will add geofence automation, route optimization

---

## Related User Stories

- **US-025:** Trip Creation from TO
- **US-026:** Driver Trip Assignment & Navigation
- **US-027:** Gate-In/Gate-Out Tracking
- **US-028:** Loading/Unloading Confirmation
- **US-029:** Trip Closure & POD
- **US-030:** Trip Costing
- **US-031:** Vendor Trip Tracking
- **US-032:** GPS Tracking & Geofencing

---

## Summary

Trip Management & Tracking is the **field execution layer** that monitors vehicle journeys from pickup to delivery. It provides:

- **Real-Time Visibility:** Live trip status, GPS tracking, ETA calculation
- **Operational Control:** Gate tracking, loading/unloading confirmation, incident management
- **Automatic Closure:** Auto-close trips when QC passed + POD received
- **Cost Tracking:** Trip-level cost capture (own fleet vs vendor)
- **Vendor Integration:** Vendor portal access for trip monitoring and billing preparation
- **Geofencing:** POI entry/exit detection, dwell time tracking

Trip Management ensures that transport operations are executed efficiently, monitored in real-time, and closed with full compliance and accountability.
