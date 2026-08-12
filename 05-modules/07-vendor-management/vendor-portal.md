---
source_document: PRD_DFMS_v1.0.md
source_sections: Vendor Bidding Portal, Real-time TO Updates (Vendor Portal), Vendor Portal Access (Bidding & Trip Management)
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [vendor-bidding, vendor-onboarding, trip-management, transport-order-management]
---

# Vendor Portal

## Overview

Vendor Portal is the **vendor-facing web/mobile interface** that provides approved vendors with self-service access to view, bid on, and manage Transport Orders (TOs) and Trips. It serves as the **primary operational interface** for vendors to interact with DFMS, enabling them to participate in bidding, track assignments, manage resources (vehicles/drivers), and monitor performance.

The portal differentiates access and functionality based on vendor type (Contractual vs Non-Contractual), ensuring appropriate workflows and information visibility for each vendor category.

### Purpose

- Provide centralized dashboard for vendor operations
- Enable Non-Contractual vendors to view and bid on open TOs
- Enable Contractual vendors to view assigned TOs (no bidding)
- Support real-time TO and Trip status tracking
- Allow post-bid vehicle/driver assignment
- Provide trip history and performance metrics
- Enable invoice and payment tracking (Phase 2+)
- Support document management and profile updates

### Workflow Position

```
Vendor Logs into Portal
    ↓
Dashboard → View active bids, assigned TOs, active trips, completed trips
    ↓
Actions:
  - View Available Bids (Non-Contractual) → Submit Bid
  - View Assigned TOs (Contractual/Won Bids) → Add Vehicle/Driver
  - Track Active Trips → View status, upload POD
  - View Completed Trips → Check invoices, performance
```

---

## Vendor Portal Dashboard

### Purpose

Provide **at-a-glance visibility** of vendor's current operational state, pending actions, and key metrics.

### Dashboard Sections

**1. Summary Cards (Top Row)**
```
╔══════════════════════╗  ╔══════════════════════╗  ╔══════════════════════╗
║ Available Bids       ║  ║ Active Trips         ║  ║ Completed Trips      ║
║ 5 Open               ║  ║ 12 In Progress       ║  ║ 47 This Month        ║
║ Ends in 4h 23m       ║  ║ 2 Require Action     ║  ║ 94% On-Time Rate     ║
╚══════════════════════╝  ╚══════════════════════╝  ╚══════════════════════╝

╔══════════════════════╗  ╔══════════════════════╗  ╔══════════════════════╗
║ Pending Invoices     ║  ║ Performance Rating   ║  ║ Fleet Utilization    ║
║ 3 Invoices           ║  ║ ⭐⭐⭐⭐⭐ 4.8/5.0      ║  ║ 8 of 12 Vehicles     ║
║ $12,500 Total        ║  ║ Top 10% Vendor       ║  ║ 67% Utilization      ║
╚══════════════════════╝  ╚══════════════════════╝  ╚══════════════════════╝
```

**2. Quick Actions Bar**
- **View Available Bids** (Non-Contractual vendors only)
- **View Assigned TOs** (Contractual vendors or won bids)
- **Track Trips** (All vendors)
- **Manage Vehicles** (Add/edit vehicles)
- **Manage Drivers** (Add/edit drivers)
- **View Invoices** (Phase 2+)

**3. Recent Activity Feed**
- "Bid awarded for TO-2026-00456 (Dhaka → Chittagong)" - 2 hours ago
- "Trip TRIP-2026-00789 completed. POD uploaded." - 5 hours ago
- "New bid available: TO-2026-00460 (Sylhet → Dhaka)" - 1 day ago
- "Invoice INV-2026-00123 approved. Payment processed." - 2 days ago

**4. Alerts & Notifications**
- ⚠️ "Add vehicle/driver details for TO-2026-00456 (deadline: 2 hours)"
- ⚠️ "Trip TRIP-2026-00789 delayed. Expected delivery: 14:30, Current ETA: 16:00"
- 🔴 "Driver license expiring in 7 days: Ahmed Khan (DL-12345)"

---

## Available Bids (Non-Contractual Vendors)

### Purpose

Allow Non-Contractual vendors to **discover and bid on** open TOs published by Transport Planners.

### Bids Listing View

**Table Columns:**
| TO ID | Route | Product | Quantity | Vehicle Type | Delivery Date | Urgency | Bid Deadline | Actions |
|-------|-------|---------|----------|--------------|---------------|---------|--------------|---------|
| TO-2026-00456 | Dhaka → Chittagong | Maize | 20 tons | Covered Van | 2026-03-01 | HIGH | 4h 23m | View, Bid |
| TO-2026-00457 | Sylhet → Dhaka | Feed Pellets | 15 tons | Truck | 2026-03-02 | NORMAL | 18h 45m | View, Bid |
| TO-2026-00458 | Chittagong → Dhaka | Soybean | 25 tons | Container | 2026-03-03 | CRITICAL | 2h 10m | View, Bid |

**Filters:**
- Route (dropdown: All, Dhaka, Chittagong, Sylhet, etc.)
- Product Type (dropdown: All, Raw Materials, Finished Goods)
- Urgency (checkboxes: Normal, High, Critical)
- Vehicle Type (checkboxes: Truck, Covered Van, Container)
- Bid Deadline (slider: Next 4 hours, Next 24 hours, All)

**Sorting:**
- Bid deadline (soonest first)
- Delivery date (earliest first)
- Urgency (critical first)
- Distance (shortest first)

### Bid Detail View

**TO Information:**
- TO ID, Route (source → destination), Distance
- Product name, category, quantity, UOM
- Vehicle type required, vehicle count
- Delivery date, urgency
- Expected bid rate (if provided, as reference)

**Bidding Form:**
```
Your Bid Rate: [______] BDT per trip
Vehicle Count Available: [2] (minimum required: 2)
Vehicle Type: [Covered Van ▼]
Vehicles to Assign: [Select from your fleet ▼] (optional now, mandatory if win)
Bid Validity: [7] days
Additional Remarks: [Optional text area]

[Submit Bid] [Cancel]
```

**Bid Submission Confirmation:**
```
Bid Submitted Successfully!

Your bid has been recorded. You will be notified if your bid is selected.

Bid Summary:
- TO ID: TO-2026-00456
- Your Rate: 14,500 BDT per trip
- Vehicle Count: 2
- Bid Submitted: 2026-02-26 10:30 AM

[View My Bids] [Back to Dashboard]
```

---

## Assigned TOs (Contractual & Winning Vendors)

### Purpose

Display TOs **assigned directly** (Contractual vendors) or **won through bidding** (Non-Contractual winners), requiring vehicle/driver assignment before trip creation.

### Assigned TOs Listing

**Table Columns:**
| TO ID | Route | Product | Quantity | Delivery Date | Status | Actions |
|-------|-------|---------|----------|---------------|--------|---------|
| TO-2026-00450 | Dhaka → Sylhet | Chicken Feed | 18 tons | 2026-02-28 | Awaiting Vehicle Assignment | Add Details |
| TO-2026-00456 | Dhaka → Chittagong | Maize | 20 tons | 2026-03-01 | Vehicle Assigned | View Trip |
| TO-2026-00459 | Chittagong → Dhaka | Soybean | 25 tons | 2026-03-03 | Trip In Progress | Track Trip |

**Status Badges:**
- 🟡 **Awaiting Vehicle Assignment:** Vendor must add vehicle/driver details
- 🟢 **Vehicle Assigned:** TP creating trip
- 🔵 **Trip In Progress:** Active trip, tracking available
- ✅ **Completed:** Delivery done, POD submitted

### Add Vehicle/Driver Details (Post-Award)

**Purpose:** After winning bid or direct assignment, vendor must **specify exact vehicles and drivers** before trip can be created.

**Workflow:**
```
1. Vendor clicks "Add Details" on assigned TO
2. System displays form:
   - TO summary (route, product, quantity, delivery date)
   - Required: Vehicle count, vehicle type
3. Vendor selects vehicles:
   - Dropdown: "Select Vehicle 1" → Shows vendor's active vehicles
   - Vehicle details displayed: Registration, Type, Capacity
4. Vendor assigns driver:
   - Dropdown: "Select Driver 1" → Shows vendor's active drivers
   - Driver details displayed: Name, License, Contact
5. Vendor assigns helper (optional):
   - Dropdown: "Select Helper 1"
6. Vendor repeats for each required vehicle
7. Vendor confirms:
   - Reviews summary: Vehicles, Drivers, Helpers assigned
   - Clicks "Submit Vehicle/Driver Details"
8. System validates:
   - All required vehicles assigned
   - Vehicle types match TO requirement
   - Drivers have valid licenses
   - No double-booking (vehicle/driver not in another active trip)
9. System updates TO status → 'VEHICLE_ASSIGNED'
10. System notifies TP: "Vendor [Name] assigned vehicles for TO [ID]"
11. TP creates Trip
```

**Data Model:**
```typescript
interface TOVehicleDriverAssignment {
  assignment_id: string;
  to_id: string;
  vendor_id: string;
  
  // Assignments (one per required vehicle)
  assignments: {
    vehicle_id: string;
    driver_id: string;
    helper_id?: string;
  }[];
  
  // Submission
  submitted_by: string;             // Vendor user ID
  submitted_at: Date;
  
  // TP Review
  reviewed_by?: string;
  approved_at?: Date;
  rejection_reason?: string;        // If TP rejects assignment
}
```

---

## Active Trips Tracking

### Purpose

Provide **real-time visibility** of trips assigned to vendor vehicles, enabling proactive monitoring and issue resolution.

### Active Trips Listing

**Table Columns:**
| Trip ID | TO ID | Route | Vehicle | Driver | Status | Current Location | ETA | Actions |
|---------|-------|-------|---------|--------|--------|------------------|-----|---------|
| TRIP-2026-00789 | TO-2026-00456 | Dhaka → Chittagong | TRK-001 | Ahmed Khan | In Transit | Near Comilla | 14:30 | Track, Contact Driver |
| TRIP-2026-00790 | TO-2026-00457 | Sylhet → Dhaka | VAN-005 | Karim Mia | At Destination | Factory B Gate | - | View Details |

**Status Badges:**
- 🟡 **Assigned:** Trip created, awaiting driver start
- 🔵 **In Transit:** Vehicle en route to destination
- 🟢 **At Destination:** Vehicle arrived, unloading in progress
- ⚠️ **Delayed:** Vehicle behind schedule
- 🔴 **Incident:** Issue reported (breakdown, accident)

### Trip Detail View

**Trip Information:**
- Trip ID, TO ID (linkable)
- Route (source → destination), Distance
- Product, Quantity
- Vehicle: Registration, Type, Driver, Helper
- Planned Pickup Date/Time, Planned Delivery Date/Time

**Trip Timeline (Visual Progress Bar):**
```
✅ Assigned (2026-02-26 08:00) → ✅ Started (08:30) → ✅ At Source (09:00) → 
✅ Loading (09:15-10:30) → ✅ Departed Source (11:00) → 🔵 In Transit (Current) → 
⏳ At Destination → ⏳ Unloading → ⏳ Completed
```

**Real-Time Status Updates:**
- **Last Update:** 2 minutes ago
- **Current Location:** Near Comilla (GPS coordinates)
- **Distance Covered:** 85 km / 260 km (33%)
- **ETA:** 14:30 (On Time) or 16:00 (Delayed by 1.5 hours)

**Actions:**
- **Contact Driver:** Opens phone/SMS/WhatsApp
- **View Map:** Shows live location on map
- **Report Issue:** Opens incident reporting form
- **Upload POD:** (Available after unloading) Upload proof of delivery

### Real-Time TO & Trip Updates

**Purpose:** Vendors receive **push notifications** for critical status changes, ensuring timely responses.

**Notification Triggers:**

**TO Status Changes:**
- TO Assigned (Contractual vendors)
- Bid Awarded (Non-Contractual winners)
- Vehicle/Driver Assignment Deadline (2 hours remaining)
- Trip Created from TO

**Trip Status Changes:**
- Trip Started (Driver began journey)
- Arrived at Destination
- Unloading Completed
- QC Passed
- Trip Completed
- Incident Reported
- Trip Delayed (ETA changed)

**Notification Channels:**
- **In-App:** Badge notification in Vendor Portal
- **Email:** Summary of status change
- **SMS:** Critical updates (trip started, completed, incident)
- **Push Notification:** Mobile app alert (if vendor app installed)

**Example Notifications:**
```
SMS: "Trip TRIP-2026-00789 started. Driver: Ahmed Khan, Vehicle: TRK-001. Track: [URL]"

Email: "Trip TRIP-2026-00789 completed successfully. POD received. Invoice generation in progress."

Push: "⚠️ Trip TRIP-2026-00790 delayed. New ETA: 16:00 (was 14:30). Reason: Traffic congestion."
```

---

## Completed Trips History

### Purpose

Provide **historical record** of completed trips for invoicing, performance review, and dispute resolution.

### Completed Trips Listing

**Table Columns:**
| Trip ID | TO ID | Route | Vehicle | Completion Date | Net Weight | Trip Cost | Invoice Status | Actions |
|---------|-------|-------|---------|-----------------|------------|-----------|----------------|---------|
| TRIP-2026-00785 | TO-2026-00450 | Dhaka → Sylhet | TRK-001 | 2026-02-25 | 18,000 kg | 22,500 BDT | Invoiced | View Invoice, Download POD |
| TRIP-2026-00786 | TO-2026-00451 | Chittagong → Dhaka | VAN-003 | 2026-02-24 | 15,500 kg | 28,000 BDT | Paid | View Receipt |

**Filters:**
- Date Range (last 7 days, last 30 days, custom range)
- Route
- Vehicle
- Invoice Status (Pending, Invoiced, Paid)

**Trip Performance Metrics:**
- **On-Time Delivery Rate:** 92% (44 of 48 trips delivered on schedule)
- **Average Trip Duration:** 6 hours 30 minutes
- **QC Pass Rate:** 96% (46 of 48 trips passed QC)
- **Total Earnings (This Month):** 485,000 BDT

### Trip Detail View (Completed)

**Trip Summary:**
- Trip ID, TO ID, Route, Distance
- Vehicle, Driver, Helper
- Actual Pickup Date/Time, Actual Delivery Date/Time
- Trip Duration (pickup to delivery)

**Weight & Quantity:**
- Planned Quantity: 20 tons
- Loaded Quantity (Scale-In): 20,200 kg
- Delivered Quantity (Scale-Out): 20,150 kg
- Net Weight: 20,150 kg
- Variance: +0.75% (acceptable)

**Proof of Delivery (POD):**
- POD Image(s): [Thumbnails, click to view full]
- POD Uploaded By: Driver (Ahmed Khan)
- POD Upload Time: 2026-02-26 14:45
- [Download POD]

**QC Results:**
- QC Status: ✅ PASSED
- QC Inspector: Inspector-123
- QC Completion Time: 2026-02-26 15:00
- QC Remarks: "Product quality excellent. No issues detected."

**Trip Costing:**
- Bid Rate: 14,500 BDT per trip
- Distance: 260 km
- Rate Type: Per Trip
- **Total Trip Cost:** 14,500 BDT
- Additional Charges: 0 BDT
- **Final Cost:** 14,500 BDT
- Invoice Status: Invoiced (INV-2026-00123)

---

## Vendor Profile Management

### Purpose

Allow vendors to **maintain up-to-date** profile information, vehicles, drivers, and documents.

### Profile Sections

**1. Company Profile:**
- Company Name, Type, Registration Number
- Office Address, Contact Details
- Edit button (opens editable form)

**2. Contact Person:**
- Primary Contact: Name, Designation, Phone, Email
- Additional Contacts (if any)
- Add/Edit/Remove contacts

**3. Vehicles:**
- List of vehicles (registration, type, capacity, status)
- [Add New Vehicle] button
- Edit/Deactivate actions per vehicle

**4. Drivers:**
- List of drivers (name, license, status, current assignment)
- [Add New Driver] button
- Edit/Deactivate actions per driver

**5. Documents:**
- Trade License (Expiry: 2027-12-31) ✅ Valid [Renew]
- BIN Certificate ✅ Valid
- TIN Certificate ✅ Valid
- Truck Association Testimonial ✅ Valid
- Insurance Certificate (Expiry: 2026-06-30) ⚠️ Expiring Soon [Upload Renewed]

**6. Performance Dashboard:**
- Overall Rating: ⭐⭐⭐⭐⭐ 4.8/5.0
- Total Completed Trips: 147
- On-Time Delivery Rate: 94%
- QC Pass Rate: 96%
- Average Trip Duration: 6h 30m

---

## Vendor Portal Access Control

### Pre-Approval Access

**Status:** `PENDING_VERIFICATION` or `REJECTED`
- **Access:** Login allowed, but limited view
- **Features Available:**
  - View registration status
  - Update profile/documents (if rejected, resubmit)
  - Contact support
- **Features Restricted:**
  - Cannot view bids
  - Cannot view TOs
  - Cannot view trips

### Post-Approval Access (Contractual Vendors)

**Status:** `APPROVED`, Type: `CONTRACTUAL`
- **Dashboard:** Summary cards, assigned TOs, active trips, completed trips
- **Available Features:**
  - View assigned TOs (no bidding)
  - Add vehicle/driver details for assigned TOs
  - Track active trips
  - View completed trips
  - Manage vehicles/drivers
  - View invoices/payments
- **Restricted Features:**
  - **Cannot view Available Bids tab** (not applicable for contractual)

### Post-Approval Access (Non-Contractual Vendors)

**Status:** `APPROVED`, Type: `NON_CONTRACTUAL`
- **Dashboard:** Summary cards, available bids, assigned TOs (won bids), active trips, completed trips
- **Available Features:**
  - View available bids
  - Submit bids
  - View assigned TOs (won bids only)
  - Add vehicle/driver details for won TOs
  - Track active trips
  - View completed trips
  - Manage vehicles/drivers
  - View invoices/payments

---

## Mobile Responsiveness

### Purpose

Ensure vendors can access portal from **mobile devices** (smartphones, tablets) for on-the-go operations.

### Mobile-Optimized Views

**Dashboard (Mobile):**
- Single-column card layout
- Swipe gestures for navigation
- Bottom navigation bar (Dashboard, Bids, Tracks, Profile)

**Bid Submission (Mobile):**
- Simplified form fields
- Large touch targets
- Auto-complete for vehicle/driver selection

**Trip Tracking (Mobile):**
- Map view (full screen)
- Quick actions (Call Driver, Report Issue)
- Real-time location updates

---

## Integration Points

### Upstream: Vendor Onboarding

**Vendor Approval → Portal Access:**
- Vendor status = APPROVED → Portal login enabled
- Credentials sent via email

### Upstream: Vendor Bidding

**Bid Submission → Portal:**
- Vendors submit bids via "Available Bids" tab
- Bid status tracked in "My Bids" section

### Upstream: Transport Order Management

**TO Assignment → Portal:**
- TOs assigned to vendors appear in "Assigned TOs" tab
- Real-time status updates (TO status changes)

### Upstream: Trip Management

**Trip Creation → Portal:**
- Trips appear in "Active Trips" tab
- Real-time trip status updates (in-transit, delivered, completed)

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** Vendors can only view TOs/Trips from own tenant
- **Vendor-Specific Data:** Vendors can only view own TOs, trips, invoices (no access to other vendors' data)
- **Read-Only Trip Status:** Vendors can view but cannot modify trip status (only TP/drivers can update)

### Session Management

- **Session Timeout:** 30 minutes of inactivity
- **Concurrent Login:** Allow 1 active session per user (prevent credential sharing)
- **Login Audit:** Log all login attempts (timestamp, IP address, user agent)

---

## Key Design Decisions

### Why Differentiate Contractual vs Non-Contractual Access?

**Rationale:**
- Different workflows (direct assignment vs bidding)
- Prevents confusion (contractual vendors don't need bidding features)
- Tailored UX (show only relevant features)

### Why Read-Only Trip Status for Vendors?

**Rationale:**
- Ensures data integrity (only authorized users update trip status)
- Prevents fraud (vendors can't falsely mark trips complete)
- Single source of truth (TP/drivers control status)

### Why Real-Time Notifications?

**Rationale:**
- Timely responses (vendors act on critical events immediately)
- Reduces portal polling (push notifications vs manual refresh)
- Improves service quality (faster vehicle/driver assignment, issue resolution)

---

## Related User Stories

- **US-075:** Vendor Portal Dashboard
- **US-076:** Available Bids View & Bid Submission
- **US-077:** Assigned TOs & Vehicle/Driver Assignment
- **US-078:** Active Trips Tracking
- **US-079:** Completed Trips History
- **US-080:** Real-Time TO/Trip Notifications
- **US-081:** Vendor Profile Management

---

## Summary

Vendor Portal is the **vendor-facing interface** that provides:

- **Centralized Dashboard:** At-a-glance view of bids, TOs, trips, and performance
- **Available Bids (Non-Contractual):** Discover and bid on open TOs
- **Assigned TOs:** View directly assigned TOs (Contractual) or won bids (Non-Contractual)
- **Post-Award Vehicle/Driver Assignment:** Add vehicle/driver details for trip creation
- **Real-Time Trip Tracking:** Monitor active trips with live status updates
- **Completed Trips History:** Review past trips, invoices, and performance
- **Profile Management:** Update company details, vehicles, drivers, documents
- **Real-Time Notifications:** Push alerts for critical TO/Trip status changes
- **Mobile Responsive:** Access from any device (web, mobile)

Vendor Portal empowers vendors with self-service capabilities, real-time visibility, and streamlined operations, enhancing collaboration between DFMS and transport vendors.
