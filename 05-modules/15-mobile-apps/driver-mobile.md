---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Driver Mobile Interface, Trip Management (Trip Assignment & Navigation)
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [trip-management, driver-management, gate-management, scaling-management]
---

# Driver Mobile Application

## Overview

The Driver Mobile Application is the **field execution interface** for drivers operating company-owned and vendor vehicles. It provides real-time trip visibility, turn-by-turn navigation, trip status updates, proof of delivery capture, fuel logging, and emergency support—all optimized for mobile use in low-connectivity environments.

The app serves as the primary operational tool for drivers, bridging the gap between dispatched transport orders and physical delivery execution.

### Purpose

- **Trip Visibility:** View assigned trips with full TO details (pickup, drop, product, urgency)
- **Navigation:** Turn-by-turn routing from pickup to drop POI
- **Status Updates:** Mark trip milestones (Dispatched, In Transit, Arrived, Completed)
- **POD Capture:** Digital signature + photo evidence for delivery confirmation
- **Fuel Logging:** Record refueling events with receipt/odometer photos
- **Offline Operation:** Core features work without network connectivity
- **GPS Tracking:** Continuous background location tracking for real-time monitoring
- **Emergency Support:** Direct contact with transport planner or operations center

---

## Core Features

### 1. Trip Assignment & Visibility

**Purpose:** Enable drivers to view their assigned trips and understand delivery requirements before departure.

#### Trip List View

```typescript
interface TripListView {
  // Trip Identification
  trip_id: string;
  to_number: string;
  
  // Route Details
  pickup_poi: {
    name: string;
    address: string;
    distance_from_current_location_km: number;
    estimated_arrival_time: Date;
  };
  
  drop_poi: {
    name: string;
    address: string;
    distance_from_pickup_km: number;
    estimated_arrival_time: Date;
  };
  
  // Product Details
  product_name: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  quantity: number;
  unit: string;
  
  // Priority & Status
  urgency: 'URGENT' | 'NORMAL';
  trip_status: 'ASSIGNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED_AT_PICKUP' | 'LOADING' | 'IN_TRANSIT_TO_DROP' | 'ARRIVED_AT_DROP' | 'UNLOADING' | 'COMPLETED';
  
  // Vehicle & Helper
  vehicle_registration: string;
  helper_names?: string[];
  
  // Important Instructions
  special_instructions?: string;
}
```

**UI Components:**
- **List View:** All assigned trips sorted by urgency (Urgent first) and pickup time
- **Trip Card:** Tap to expand for full details
- **Status Badge:** Color-coded (Assigned = Gray, In Transit = Blue, Completed = Green)
- **Navigation Button:** Direct "Navigate to Pickup" or "Navigate to Drop" based on trip stage

**Filters:**
- **By Status:** Assigned, In Progress, Completed (Today)
- **By Urgency:** Urgent Only

**Notifications:**
- **New Trip Assigned:** Push notification with trip ID and pickup location
- **Trip Modified:** Alert when pickup time or route changes
- **Urgency Change:** Notification if trip marked urgent

---

### 2. Trip Status Updates

**Purpose:** Allow drivers to update trip progress at key milestones, providing real-time visibility to operations center.

#### Status Workflow

```
1. ASSIGNED (Initial state after TO dispatch)
   ↓ Driver action: "Start Trip"
2. DISPATCHED (Driver departed for pickup)
   ↓ GPS geofence: Arrived at pickup POI
3. ARRIVED_AT_PICKUP (Driver at pickup location)
   ↓ Driver action: "Start Loading"
4. LOADING (Product being loaded)
   ↓ Driver action: "Complete Loading"
5. IN_TRANSIT_TO_DROP (En route to drop location)
   ↓ GPS geofence: Arrived at drop POI
6. ARRIVED_AT_DROP (Driver at drop location)
   ↓ Driver action: "Start Unloading"
7. UNLOADING (Product being unloaded)
   ↓ Driver action: "Confirm Delivery" (POD capture)
8. COMPLETED (Trip finished, POD submitted)
```

**Manual Status Update:**
- **Button:** "Update Status" visible at each milestone
- **Confirmation:** "Are you sure you want to mark trip as [Status]?"
- **Timestamp:** All status updates logged with GPS coordinates and timestamp
- **Offline Support:** Updates queued locally, synced when connectivity restored

**Automatic Status Update (GPS-Triggered):**
- **Geofence Entry:** When driver enters pickup/drop POI geofence, app auto-prompts "You've arrived at [POI Name]. Mark as Arrived?"
- **User Confirmation:** Driver must confirm (prevents false positives)

---

### 3. Navigation & Routing

**Purpose:** Provide turn-by-turn directions from driver's current location to pickup POI, then to drop POI.

#### Navigation Integration

**Preferred Method: Google Maps / Apple Maps Integration**
```typescript
function navigateToPOI(poi_lat: number, poi_lng: number, poi_name: string) {
  const userPlatform = detectPlatform(); // Android or iOS
  
  if (userPlatform === 'Android') {
    openGoogleMaps(poi_lat, poi_lng, poi_name);
  } else if (userPlatform === 'iOS') {
    openAppleMaps(poi_lat, poi_lng, poi_name);
  }
}
```

**Alternative: In-App Maps (Phase 2)**
- Embedded map view with route polyline
- Voice-guided navigation
- Real-time traffic updates

**Navigation Features:**
- **Start Navigation:** Button on trip detail screen
- **POI Coordinates:** Pre-loaded from POI master data (lat/lng)
- **Waypoint Support:** Multi-stop routes (if multiple pickups)
- **ETA Display:** Estimated arrival time visible in trip list

---

### 4. Proof of Delivery (POD) Capture

**Purpose:** Digitally capture delivery confirmation to replace paper-based POD, ensuring accountability and traceability.

#### POD Components

**1. Recipient Signature**
- **Canvas:** Driver hands phone to recipient, who signs on touchscreen
- **Name Field:** Recipient's full name (mandatory)
- **Role Field:** Receiver's position (e.g., "Warehouse Manager", "Storekeeper")

**2. Delivery Photo**
- **Photo Capture:** Driver takes photo of delivered goods at drop location
- **GPS Metadata:** Photo embedded with GPS coordinates and timestamp
- **Multiple Photos:** Support 1-5 photos per delivery

**3. Delivery Notes**
- **Optional Field:** Driver can add notes (e.g., "Left with security guard", "Partial delivery due to space")

**4. Discrepancy Reporting**
- **Checkbox:** "Report discrepancy in quantity or condition"
- **Discrepancy Details:** Text field for explanation if checked

#### POD Submission Workflow

```
1. Driver taps "Complete Delivery" button
2. App presents POD capture screen:
   - Signature canvas
   - Recipient name/role fields
   - "Take Photo" button
   - Delivery notes (optional)
   - Discrepancy checkbox
3. Driver completes all mandatory fields
4. Driver taps "Submit POD"
5. App validates:
   - Signature present
   - Recipient name entered
   - At least 1 photo captured
6. App uploads POD to backend (queued if offline)
7. Trip status → 'COMPLETED'
8. Success message: "Delivery confirmed! POD submitted."
```

**Data Model:**
```typescript
interface ProofOfDelivery {
  pod_id: string;
  trip_id: string;
  
  // Recipient Details
  recipient_name: string;
  recipient_role: string;
  recipient_signature_image_url: string;
  
  // Delivery Evidence
  delivery_photos: DeliveryPhoto[];
  delivery_notes?: string;
  
  // Discrepancy
  discrepancy_reported: boolean;
  discrepancy_details?: string;
  
  // Metadata
  captured_at: Date;
  captured_location: { lat: number; lng: number };
  submitted_by: string;              // Driver user ID
}

interface DeliveryPhoto {
  photo_url: string;
  captured_at: Date;
  gps_coordinates: { lat: number; lng: number };
}
```

---

### 5. Fuel Logging (Phase 2)

**Purpose:** Enable drivers to record refueling events for fuel consumption tracking and cost analysis.

#### Fuel Entry Workflow

```
1. Driver refuels vehicle at gas station
2. Driver opens app → "Log Fuel Entry"
3. App displays form:
   - Vehicle (auto-selected from current assignment)
   - Fuel quantity (liters) - manual input
   - Fuel cost (amount) - manual input
   - Current odometer reading (km) - manual input
   - Photo of receipt
   - Photo of odometer reading
4. Driver completes form
5. App uploads entry (queued if offline)
6. Confirmation: "Fuel entry logged!"
```

**Validation:**
- Odometer reading must be > previous reading (no backdating)
- Fuel quantity > 0, cost > 0

---

### 6. Emergency Support

**Purpose:** Provide drivers with quick access to help in case of accidents, breakdowns, or urgent issues.

**Features:**
- **Emergency Contact:** One-tap call to Transport Planner or Operations Center
- **SOS Button:** Sends emergency alert with driver's current GPS location
- **Breakdown Reporting:** Form to report vehicle breakdown (issue description, photos)
- **Accident Reporting:** Form to log accident details (police report number, photos, description)

---

## Technical Requirements

### Platform Support

**Android:**
- **Minimum Version:** Android 8.0 (API 26)
- **Target Version:** Android 14+ (API 34)
- **Distribution:** Google Play Store

**iOS:**
- **Minimum Version:** iOS 13.0
- **Target Version:** iOS 17+
- **Distribution:** Apple App Store

### Offline Capability

**Why Offline?**
- Drivers operate in remote areas with poor cellular coverage
- Ensures app remains functional during network outages
- Reduces frustration and operational delays

**Offline Features:**
- **Trip List:** Previously synced trips viewable offline
- **Status Updates:** Queued locally, synced when online
- **POD Capture:** Stored locally, uploaded when connectivity restored
- **Fuel Logging:** Queued for later sync

**Sync Strategy:**
```typescript
// Background sync every 5 minutes when online
setInterval(() => {
  if (isOnline()) {
    syncPendingTripUpdates();
    syncPendingPODs();
    syncPendingFuelEntries();
  }
}, 300000); // 5 minutes
```

### Background GPS Tracking

**Purpose:** Continuously track driver location for real-time trip monitoring, ETA updates, and geofencing.

**Implementation:**
- **Android:** Foreground service with persistent notification ("DFMS tracking your trip")
- **iOS:** Background location updates with "Always Allow" permission
- **Battery Optimization:** GPS polling every 30 seconds (not continuous)
- **Data Transmission:** Location updates sent to backend every 2 minutes

**Location Data:**
```typescript
interface LocationUpdate {
  driver_id: string;
  trip_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  speed_kmh: number;
  timestamp: Date;
}
```

### Photo Compression

**Purpose:** Reduce data usage and upload times for POD photos, receipts, and odometer readings.

**Strategy:**
- **Resolution:** Auto-resize to max 1920x1080 (Full HD sufficient for documentation)
- **Quality:** JPEG compression at 80% quality
- **File Size:** Target <500 KB per photo

---

## User Interface Design

### Design Principles

**1. Simplicity**
- Large, tap-friendly buttons (min 44x44pt)
- Minimal text, focus on actions
- Clear visual hierarchy (most important actions at top)

**2. Readability**
- High-contrast text (black on white, white on dark)
- Font size: Minimum 16pt body text
- Sans-serif fonts (better readability on mobile)

**3. Visual Feedback**
- Loading spinners for network operations
- Success/error toasts ("Trip updated!", "Upload failed")
- Disabled state for unavailable actions

**4. One-Handed Use**
- Bottom navigation bar (thumb-reachable)
- Primary actions at bottom of screen
- Swipe gestures for common actions (swipe trip card to call planner)

### Key Screens

**1. Login Screen**
- Phone number + OTP authentication
- "Remember me" checkbox

**2. Trip List (Home Screen)**
- List of assigned trips
- Filter buttons at top
- Floating "Emergency Support" button

**3. Trip Detail Screen**
- Full trip information
- "Navigate" button (prominent)
- "Update Status" button
- Helper contact info
- Special instructions

**4. POD Capture Screen**
- Signature canvas (full width)
- Recipient name/role fields
- "Take Photo" button
- "Submit POD" button (bottom)

---

## Security & Permissions

### Required Permissions

**Android:**
- `ACCESS_FINE_LOCATION` (GPS tracking)
- `CAMERA` (POD photos, fuel receipts)
- `WRITE_EXTERNAL_STORAGE` (photo storage)
- `INTERNET` (API communication)

**iOS:**
- Location (Always)
- Camera
- Photo Library

### Data Security

**Authentication:**
- JWT token stored in secure storage (Keychain on iOS, EncryptedSharedPreferences on Android)
- Token refresh on expiry (no re-login required)

**Data Transmission:**
- HTTPS only (TLS 1.2+)
- Certificate pinning for API endpoints

**Local Data:**
- Sensitive data (tokens, user info) encrypted at rest
- Trip data cleared after 30 days of inactivity

---

## Integration Points

### Upstream: Trip Management Module
- App fetches assigned trips via `GET /api/trips/driver/{driver_id}`
- Trip status updates via `PUT /api/trips/{trip_id}/status`

### Upstream: Driver Management Module
- Driver authentication and profile
- Driver availability status updates

### Downstream: POD Storage
- POD submission via `POST /api/trips/{trip_id}/pod`
- Photos uploaded to cloud storage (S3/GCS)

### Downstream: GPS Tracking System
- Location updates via `POST /api/tracking/location`
- Real-time location visible in command center

---

## Key Design Decisions

### Why Mobile App Instead of Web?
**Rationale:**
- GPS background tracking requires native app (not reliable in web browsers)
- Offline capability more robust in native apps
- Better camera integration (metadata, compression)
- Push notifications for trip assignments

### Why Offline-First Architecture?
**Rationale:**
- Rural transport routes often lack cellular coverage
- Prevents drivers from being blocked during network outages
- Improves user experience (no "loading" delays for cached data)

### Why Manual Status Confirmation (Not Fully Automatic)?
**Rationale:**
- GPS geofencing can have false positives (driver near POI but not entered)
- Driver confirmation ensures accurate milestone tracking
- Provides driver accountability

---

## Related User Stories
- US-065: Trip Assignment View (Driver Mobile)
- US-066: Trip Status Update (Driver Mobile)
- US-067: POD Capture (Driver Mobile)
- US-068: Fuel Logging (Driver Mobile)
- US-069: Emergency Support (Driver Mobile)

---

## Summary

The Driver Mobile Application provides:
- **Trip Visibility:** Real-time view of assigned trips with full details
- **Navigation:** Turn-by-turn routing to pickup and drop POIs
- **Status Tracking:** Manual and GPS-triggered milestone updates
- **POD Capture:** Digital signature + photo evidence for accountability
- **Fuel Logging:** Refueling event recording with documentation
- **Offline Operation:** Core features work without connectivity
- **GPS Tracking:** Continuous background location monitoring
- **Emergency Support:** Quick access to help and incident reporting

The app is the primary operational tool for field execution, bridging dispatch and physical delivery.
