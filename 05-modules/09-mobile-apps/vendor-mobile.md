---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Vendor Mobile Application, Vendor Portal Access (Bidding & Trip Management)
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [vendor-portal, vendor-bidding, trip-management]
---

# Vendor Mobile Application

## Overview

The Vendor Mobile Application is the **vendor-facing mobile interface** that enables third-party transport vendors to participate in DFMS operations. It provides access to available bidding opportunities, assigned transport orders, active trip tracking, and profile management—empowering vendors to manage their transport business on-the-go.

The app complements the desktop-based Vendor Portal, offering mobile convenience for time-sensitive actions like bid submission and trip updates.

### Purpose

- **Bid Management:** View available TOs for bidding, submit competitive bids
- **TO Management:** View assigned TOs (won bids or contractual allocations)
- **Post-Award Actions:** Assign drivers, vehicles, and helpers to awarded TOs
- **Trip Tracking:** Monitor active trip progress and status
- **Trip History:** Review completed trips for invoicing and performance analysis
- **Profile Management:** Update vendor profile, add/edit drivers and vehicles
- **Notifications:** Real-time alerts for new bids, TO assignments, trip updates

---

## Core Features

### 1. Available Bids View

**Purpose:** Enable vendors to discover transport opportunities and submit competitive bids for non-contractual TOs.

#### Bid List View

```typescript
interface BidOpportunity {
  bid_id: string;
  to_number: string;
  
  // Route Details
  pickup_poi: {
    name: string;
    address: string;
  };
  
  drop_poi: {
    name: string;
    address: string;
  };
  
  distance_km: number;
  
  // Product Details
  product_name: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  quantity: number;
  unit: string;
  
  // Vehicle Requirements
  required_vehicle_type: string;    // e.g., "HEAVY_TRUCK"
  required_capacity_tons: number;
  
  // Bidding Details
  bid_open_date: Date;
  bid_close_date: Date;
  time_remaining: string;           // e.g., "2 hours 15 mins"
  
  // Bid Status
  vendor_bid_submitted: boolean;    // Has this vendor already bid?
  vendor_bid_amount?: number;       // If already bid
  
  // Metadata
  urgency: 'URGENT' | 'NORMAL';
}
```

**UI Components:**
- **List View:** All open bids sorted by urgency and bid close time
- **Filter Buttons:**
  - All Bids
  - Bids I've Submitted
  - Urgent Only
- **Search:** By TO number, pickup/drop POI, product name
- **Bid Card:** Tap to view full TO details and submit bid

**Notifications:**
- **New Bid Published:** Push notification "New bidding opportunity: TO-2026-00456"
- **Bid Closing Soon:** Alert when 1 hour remaining

---

### 2. Bid Submission

**Purpose:** Allow vendors to submit competitive bids with pricing and vehicle details.

#### Bid Submission Workflow

```
1. Vendor taps bid from Available Bids list
2. App displays full TO details:
   - Route (pickup → drop POI)
   - Product (name, quantity, category)
   - Vehicle requirements (type, capacity)
   - Special instructions
   - Distance, estimated duration
3. Vendor taps "Submit Bid" button
4. App displays bid submission form:
   - Bid amount (currency: BDT)
   - Proposed vehicle registration (dropdown of vendor's vehicles)
   - Estimated delivery date
   - Additional notes (optional)
5. Vendor confirms bid
6. App validates:
   - Bid amount > 0
   - Vehicle meets TO requirements (type, capacity)
   - Bid submitted before close time
7. App submits bid via API
8. Confirmation: "Bid submitted! You'll be notified if you win."
```

**Bid Data Model:**
```typescript
interface VendorBidSubmission {
  bid_id: string;
  to_id: string;
  vendor_id: string;
  
  // Bid Details
  bid_amount: number;
  bid_currency: 'BDT';
  proposed_vehicle_id: string;
  proposed_driver_id?: string;      // Optional at bid stage
  estimated_delivery_date: Date;
  additional_notes?: string;
  
  // Submission Metadata
  submitted_at: Date;
  submitted_via: 'MOBILE_APP' | 'WEB_PORTAL';
  
  // Status
  bid_status: 'SUBMITTED' | 'AWARDED' | 'REJECTED' | 'WITHDRAWN';
}
```

**Business Rules:**
- **One Bid Per TO:** Vendor can only submit one bid per TO (no re-bidding after submission)
- **Immutable Bids:** Once submitted, bid amount cannot be changed (ensures fairness)
- **Blind Bidding:** Vendors cannot see competitors' bid amounts

---

### 3. Assigned TOs

**Purpose:** Display all TOs assigned to the vendor (either won bids or contractual allocations).

#### Assigned TO List View

```typescript
interface AssignedTO {
  to_number: string;
  to_id: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  distance_km: number;
  
  // Product
  product_name: string;
  quantity: number;
  unit: string;
  
  // Assignment Type
  assignment_type: 'BID_WON' | 'CONTRACTUAL';
  
  // Status
  to_status: 'ASSIGNED' | 'DRIVER_ASSIGNED' | 'VEHICLE_ASSIGNED' | 'READY_FOR_DISPATCH' | 'IN_PROGRESS' | 'COMPLETED';
  
  // Post-Award Requirements
  requires_driver_assignment: boolean;
  requires_vehicle_assignment: boolean;
  
  // Dates
  assigned_date: Date;
  expected_pickup_date: Date;
  
  // Bid Details (If BID_WON)
  winning_bid_amount?: number;
}
```

**UI Components:**
- **List View:** All assigned TOs sorted by expected pickup date
- **Filter Buttons:**
  - All / Pending Assignment / In Progress / Completed
- **TO Card:** Shows status, route, product, action buttons
- **Action Buttons:**
  - "Assign Driver & Vehicle" (if pending)
  - "View Trip" (if in progress)

**Notifications:**
- **Bid Won:** "Congratulations! You won the bid for TO-2026-00456. Assign driver and vehicle."
- **Contractual TO Assigned:** "New TO assigned: TO-2026-00789. Review details."

---

### 4. Post-Award Actions: Driver & Vehicle Assignment

**Purpose:** After winning a bid or receiving a contractual TO, vendor must assign a specific driver, vehicle, and helpers (if required) before trip can be dispatched.

#### Assignment Workflow

```
1. Vendor taps "Assign Driver & Vehicle" on assigned TO
2. App displays assignment form:
   - Driver (dropdown of vendor's registered drivers)
   - Vehicle (dropdown of vendor's registered vehicles)
   - Helpers (multi-select, optional)
3. Vendor selects driver and vehicle
4. App validates:
   - Driver status = ACTIVE, not on another trip
   - Vehicle status = ACTIVE, not under maintenance
   - Vehicle capacity >= TO quantity
   - Vehicle type matches TO requirements
5. Vendor submits assignment
6. App updates TO status → 'READY_FOR_DISPATCH'
7. Trip created and assigned to driver
8. Driver receives notification: "New trip assigned: Trip-2026-01234"
```

**Assignment Data Model:**
```typescript
interface PostAwardAssignment {
  to_id: string;
  vendor_id: string;
  
  // Assignments
  assigned_driver_id: string;
  assigned_vehicle_id: string;
  assigned_helper_ids?: string[];
  
  // Metadata
  assigned_by: string;              // Vendor user ID
  assigned_at: Date;
  assigned_via: 'MOBILE_APP' | 'WEB_PORTAL';
}
```

---

### 5. Active Trip Tracking

**Purpose:** Enable vendors to monitor their drivers' trip progress in real-time, ensuring visibility into operational execution.

#### Trip Tracking View

```typescript
interface ActiveTrip {
  trip_id: string;
  to_number: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  
  // Status
  trip_status: 'ASSIGNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED_AT_PICKUP' | 'LOADING' | 'IN_TRANSIT_TO_DROP' | 'ARRIVED_AT_DROP' | 'UNLOADING' | 'COMPLETED';
  
  // Driver & Vehicle
  driver_name: string;
  driver_phone: string;
  vehicle_registration: string;
  
  // Real-Time Location
  current_location?: { lat: number; lng: number };
  distance_from_pickup_km?: number;
  distance_from_drop_km?: number;
  estimated_arrival_time?: Date;
  
  // Timestamps
  dispatched_at?: Date;
  pickup_completed_at?: Date;
  drop_completed_at?: Date;
}
```

**UI Components:**
- **Map View:** Shows driver's current location (GPS pin) with route polyline
- **Trip Card:** Status, driver, vehicle, ETA
- **Call Driver Button:** One-tap phone call to assigned driver
- **Status Timeline:** Visual timeline showing completed and pending milestones

**Real-Time Updates:**
- Trip status updated via push notifications or polling (every 30 seconds)
- GPS location refreshed every 1 minute

---

### 6. Completed Trip History

**Purpose:** Provide vendors with access to historical trip data for invoicing, performance analysis, and record-keeping.

#### Trip History View

```typescript
interface CompletedTrip {
  trip_id: string;
  to_number: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  
  // Product
  product_name: string;
  quantity_delivered: number;
  unit: string;
  
  // Driver & Vehicle
  driver_name: string;
  vehicle_registration: string;
  
  // Financial
  bid_amount: number;
  payment_status: 'PENDING' | 'INVOICED' | 'PAID';
  
  // Performance
  trip_duration_hours: number;
  on_time_delivery: boolean;
  qc_result?: 'PASS' | 'FAIL';
  
  // Dates
  dispatched_at: Date;
  completed_at: Date;
}
```

**UI Components:**
- **List View:** All completed trips sorted by completion date (recent first)
- **Filter:**
  - By Date Range (Last 7 Days, Last 30 Days, Custom)
  - By Payment Status (All, Pending Payment, Paid)
- **Trip Card:** Tap to view full trip details and POD
- **Download POD:** Button to download proof of delivery PDF

**Use Cases:**
- **Invoicing:** Vendor exports completed trips to create invoices
- **Performance Review:** Analyze on-time delivery rate, QC pass rate
- **Dispute Resolution:** Access POD and trip details for claims

---

### 7. Vendor Profile Management

**Purpose:** Allow vendors to update their profile, add/edit drivers, vehicles, and helpers for operational flexibility.

#### Profile Sections

**1. Vendor Information**
- Company Name
- Contact Person
- Email, Phone
- Address
- Vendor Type (Contractual / Non-Contractual)

**2. Driver Management**
- **List View:** All registered drivers
- **Add Driver:** Name, Phone, License Number, License Expiry
- **Edit Driver:** Update details, mark Active/Inactive
- **Validation:** License number unique, expiry date > today

**3. Vehicle Management**
- **List View:** All registered vehicles
- **Add Vehicle:** Registration, Type, Capacity, Fitness Expiry
- **Edit Vehicle:** Update details, mark Active/Under Maintenance
- **Validation:** Registration unique, fitness valid

**4. Helper Management** (Phase 2)
- **List View:** All registered helpers
- **Add Helper:** Name, Phone, National ID
- **Edit Helper:** Update details, mark Active/Inactive

---

## Technical Requirements

### Platform Support

**Mobile App:**
- **Android:** Minimum Android 8.0 (API 26), Target Android 14+
- **iOS:** Minimum iOS 13.0, Target iOS 17+
- **Distribution:** Google Play Store, Apple App Store

### Notifications

**Push Notifications (Critical):**
- New bid opportunities
- Bid awards
- TO assignments
- Trip status updates

**Implementation:**
- **Android:** Firebase Cloud Messaging (FCM)
- **iOS:** Apple Push Notification Service (APNs)

### Offline Capability

**Limited Offline (Read-Only):**
- View cached assigned TOs and active trips
- View completed trip history

**Online Required:**
- Bid submission
- Driver/vehicle assignment
- Profile updates

---

## Security & Compliance

### Authentication

**Login Methods:**
- Email/Password
- Phone Number + OTP

**Session Management:**
- JWT token with 7-day expiry
- Refresh token for seamless re-authentication

### Data Access Control

**Vendor Isolation:**
- Vendors can only view/edit their own data (bids, TOs, trips, drivers, vehicles)
- Strict `vendor_id` filtering on all API endpoints

### Audit Trail

**Logged Actions:**
- Bid submissions
- Driver/vehicle assignments
- Profile updates

---

## Integration Points

### Upstream: Vendor Portal Module
- Mobile app syncs with web-based vendor portal (shared backend)

### Upstream: Vendor Bidding Module
- Bid opportunities fetched from bidding system
- Bid submissions processed by bidding workflow

### Downstream: Trip Management Module
- Assigned TOs convert to trips upon driver/vehicle assignment
- Real-time trip status updates

---

## Key Design Decisions

### Why Mobile App (Not Just Web)?
**Rationale:**
- Push notifications critical for time-sensitive bid alerts
- Mobile convenience for on-the-go vendor management
- Better UX for driver/vehicle assignment (dropdowns, camera access)

### Why Limited Offline (Not Full Offline)?
**Rationale:**
- Bid submission requires real-time validation (bid window open, no duplicates)
- Post-award actions require immediate backend updates (trip creation)
- Most vendors have reliable connectivity (office/warehouse environments)

### Why Blind Bidding?
**Rationale:**
- Prevents collusion (vendors cannot see competitors' bids)
- Ensures fair competition
- Industry best practice for procurement

---

## Related User Stories
- US-076: Available Bids View (Vendor Mobile)
- US-077: Bid Submission (Vendor Mobile)
- US-078: Assigned TOs View (Vendor Mobile)
- US-079: Post-Award Driver/Vehicle Assignment (Vendor Mobile)
- US-080: Active Trip Tracking (Vendor Mobile)
- US-081: Completed Trip History (Vendor Mobile)

---

## Summary

The Vendor Mobile Application provides:
- **Bid Management:** View opportunities, submit competitive bids
- **TO Management:** Assigned TOs (won bids + contractual)
- **Post-Award Actions:** Assign drivers, vehicles, helpers
- **Real-Time Tracking:** Monitor active trip progress with GPS
- **Trip History:** Completed trips for invoicing and analysis
- **Profile Management:** Update vendor, driver, vehicle information
- **Push Notifications:** Real-time alerts for bids and TOs

The app empowers vendors to manage transport operations efficiently from mobile devices, ensuring timely participation in bidding and seamless trip execution.
