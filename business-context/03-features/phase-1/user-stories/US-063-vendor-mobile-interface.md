---
title: Vendor Mobile Interface (Bidding & TO View)
story_id: US-063
phase: phase-1
module: Mobile Interfaces
priority: High
status: Pending
epic: Mobile User Experiences
sprint: Sprint 18
story_points: 8
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
related_stories:
  - US-024-vendor-bidding-portal.md
  - US-031-vendor-portal.md
dependencies:
  - US-024-vendor-bidding-portal.md
tags: [mobile, vendor, bidding, responsive-web, high-priority]
---

# US-063: Vendor Mobile Interface (Bidding & TO View)

## User Story

**As a** Vendor  
**I want to** access bidding opportunities and view Transport Orders via a mobile-responsive web interface  
**So that** I can respond quickly and manage my transport operations on-the-go

## Business Context

**Note**: Per PRD Section 6.9.3, "Mobile Interface" refers to a responsive web application accessible on mobile devices via web browsers, not a native mobile application.

Vendor mobile-responsive web interface enables:
- **Quick Response**: Bid on TOs immediately via mobile browser
- **Mobility**: Manage operations from anywhere using mobile devices
- **Real-time Updates**: Instant notifications via browser Push API
- **Competitive Advantage**: Faster bidding = more opportunities
- **Operational Efficiency**: Track fleet and trips

**Key Features**:
- View available TOs for bidding
- Submit bids
- View awarded TOs
- Assign drivers/vehicles
- Track trip status
- View payment status
- Receive push notifications

---

## Acceptance Criteria

### AC-1: Vendor Dashboard (Mobile)
- [ ] System SHALL display vendor dashboard showing:
  - Available TOs for bidding (count)
  - Active bids (count)
  - Awarded TOs (count)
  - Ongoing trips (count)
  - Pending payments
  - Performance score
- [ ] System SHALL allow quick navigation to each section

### AC-2: TO Listing & Details
- [ ] System SHALL display available TOs:
  - TO number
  - Route (source → destination)
  - Product & quantity
  - Pickup date/time
  - Distance
  - Bidding deadline
  - Current bid count
- [ ] System SHALL allow filtering by:
  - Route
  - Product type
  - Date range
  - Distance
- [ ] System SHALL show TO details on tap

### AC-3: Bidding (Mobile)
- [ ] System SHALL allow submitting bid with:
  - Bid amount *
  - Vehicle type offered
  - Estimated delivery time
  - Additional notes
- [ ] System SHALL validate bid amount (min/max)
- [ ] System SHALL show bid submission confirmation
- [ ] System SHALL allow editing bid before deadline

### AC-4: Awarded TO Management
- [ ] System SHALL display awarded TOs
- [ ] System SHALL allow:
  - Viewing TO details
  - Assigning driver/vehicle
  - Accepting/rejecting TO (within time limit)
  - Viewing trip progress
- [ ] System SHALL require driver/vehicle assignment before trip start

### AC-5: Trip Tracking
- [ ] System SHALL display ongoing trips:
  - Trip status
  - Current location (if GPS enabled)
  - ETA
  - Checkpoints completed
- [ ] System SHALL show trip history

### AC-6: Browser Notifications
- [ ] System SHALL send browser push notifications (via Push API) for:
  - New TO available for bidding
  - Bid accepted/rejected
  - TO awarded
  - Trip milestone reached
  - Payment processed
  - Performance alerts
- [ ] System SHALL allow notification preferences
- [ ] System SHALL request notification permission from user

### AC-7: Payment Tracking
- [ ] System SHALL display:
  - Completed trips
  - Payment status (Pending/Processed/Paid)
  - Payment amount
  - Payment date
- [ ] System SHALL show payment history

### AC-8: Performance Metrics
- [ ] System SHALL display vendor performance:
  - Overall rating
  - On-time delivery rate
  - QC pass rate
  - Total trips completed
  - Recent feedback

---

## Functional Requirements

### FR-001: Mobile-Responsive Web Platform
- [Critical] Responsive web interface (mobile-first design)
- [Critical] Browser Push API for notifications (if supported)
- [High] Offline mode (view cached data using Service Worker)
- [High] Progressive Web App (PWA) features for app-like experience

### FR-002: Bidding Features
- [Critical] TO listing and filtering
- [Critical] Bid submission
- [High] Bid history
- [Medium] Bid analytics

### FR-003: Trip Management
- [Critical] Awarded TO management
- [Critical] Driver/vehicle assignment
- [High] Trip tracking
- [Medium] GPS integration

### FR-004: Communication
- [High] Push notifications
- [Medium] In-app messaging
- [Medium] Support chat

---

## Business Rules

### BR-VEND-MOB-001: Bid Submission Deadline
- Bids cannot be submitted after deadline
- **Enforcement**: Deadline validation

### BR-VEND-MOB-002: TO Acceptance Time
- Vendor must accept/reject awarded TO within 2 hours
- **Enforcement**: Timeout mechanism

### BR-VEND-MOB-003: Driver Assignment Requirement
- Driver/vehicle must be assigned before trip start time
- **Enforcement**: Pre-trip validation

---

## Data Model

```typescript
// Reuses existing entities from US-024, US-031
// Mobile-responsive web interface is a client interface

VendorMobileSession {
  id: UUID (PK)
  vendor_id: UUID (FK)
  browser_user_agent: String
  device_type: Enum (Mobile, Tablet, Desktop)
  
  push_subscription_endpoint: String (for browser Push API, nullable)
  
  session_start: Timestamp
  last_active: Timestamp
  
  notification_preferences: JSON
}

PushNotification {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  notification_type: Enum (
    New_TO_Available,
    Bid_Accepted,
    Bid_Rejected,
    TO_Awarded,
    Trip_Milestone,
    Payment_Processed,
    Performance_Alert
  )
  
  title: String
  message: Text
  data: JSON
  
  sent_at: Timestamp
  read_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

### Vendor Dashboard (Mobile)
```
┌─────────────────────────────────────────┐
│ ☰  Vendor Portal      🔔 (5)  [Vendor]  │
├─────────────────────────────────────────┤
│ Welcome, ABC Logistics!                 │
│ Performance Score: 4.5 ⭐               │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚛 Available TOs for Bidding        │ │
│ │ 12 opportunities                    │ │
│ │ [View All →]                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 Active Bids                      │ │
│ │ 5 bids pending                      │ │
│ │ [View All →]                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✅ Awarded TOs                      │ │
│ │ 3 TOs awaiting action               │ │
│ │ [View All →]                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🚚 Ongoing Trips                    │ │
│ │ 8 trips in progress                 │ │
│ │ [Track →]                           │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 💰 Pending Payments: BDT 125,000        │
└─────────────────────────────────────────┘
```

### TO Listing (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Available TOs for Bidding             │
├─────────────────────────────────────────┤
│ [🔍 Search] [⚙️ Filters]                │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TO-20260211-0042                    │ │
│ │ Bhaluka → Mirpur (45 km)            │ │
│ │ Live Broiler • 515 KG               │ │
│ │ Pickup: Feb 12, 8:00 AM             │ │
│ │ Deadline: Feb 11, 6:00 PM (5h left) │ │
│ │ 3 bids submitted                    │ │
│ │                                     │ │
│ │ [View Details] [Place Bid]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ TO-20260211-0050                    │ │
│ │ Chittagong → Dhaka (250 km)         │ │
│ │ Feed • 2,000 KG                     │ │
│ │ [View Details] [Place Bid]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Load More]                             │
└─────────────────────────────────────────┘
```

### Place Bid (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Place Bid: TO-20260211-0042           │
├─────────────────────────────────────────┤
│ Route: Bhaluka → Mirpur (45 km)         │
│ Product: Live Broiler (515 KG)          │
│ Pickup: Feb 12, 8:00 AM                 │
│                                         │
│ Your Bid Amount: *                      │
│ [2,500] BDT                             │
│ Min: 2,000 | Max: 3,500                 │
│                                         │
│ Vehicle Type: *                         │
│ [Covered Van           ▼]               │
│                                         │
│ Estimated Delivery Time: *              │
│ [Feb 12, 11:00 AM]                      │
│                                         │
│ Additional Notes:                       │
│ ┌─────────────────────────────────────┐ │
│ │ Experienced driver, refrigerated    │ │
│ │ vehicle available                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]              [Submit Bid]      │
└─────────────────────────────────────────┘
```

### Awarded TO (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Awarded TO: TO-20260211-0042          │
├─────────────────────────────────────────┤
│ ✅ Congratulations! TO Awarded          │
│                                         │
│ Route: Bhaluka → Mirpur (45 km)         │
│ Product: Live Broiler (515 KG)          │
│ Pickup: Feb 12, 8:00 AM                 │
│ Your Bid: BDT 2,500                     │
│                                         │
│ ⚠️ Action Required:                     │
│ Accept within 2 hours                   │
│                                         │
│ Assign Driver: *                        │
│ [Select Driver          ▼]              │
│                                         │
│ Assign Vehicle: *                       │
│ [Select Vehicle         ▼]              │
│                                         │
│ [Reject TO]           [Accept & Assign] │
└─────────────────────────────────────────┘
```

### Trip Tracking (Mobile)
```
┌─────────────────────────────────────────┐
│ ← Trip Tracking: TRIP-20260211-0042     │
├─────────────────────────────────────────┤
│ Route: Bhaluka → Mirpur                 │
│ Driver: Kamal Hossain                   │
│ Vehicle: DM-11-1234                     │
│                                         │
│ Status: 🚚 In Transit                   │
│ ETA: 11:00 AM (30 min)                  │
│                                         │
│ [Map View showing current location]     │
│                                         │
│ Checkpoints:                            │
│ ✅ Gate-In at Source (9:00 AM)          │
│ ✅ Loading Complete (9:30 AM)           │
│ ✅ Gate-Out from Source (9:45 AM)       │
│ ⏳ Gate-In at Destination (Pending)     │
│ ⏳ Unloading (Pending)                  │
│ ⏳ POD Capture (Pending)                │
│                                         │
│ [Call Driver] [View Details]            │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Vendor Mobile Dashboard
GET /api/v1/mobile/vendor/dashboard
Response: {
  available_tos_count, active_bids_count,
  awarded_tos_count, ongoing_trips_count,
  pending_payments, performance_score
}

// TO Listing (same as US-024)
GET /api/v1/transport-orders/available-for-bidding
Query: ?vendor_id={id}&filters={...}

// Place Bid (same as US-024)
POST /api/v1/transport-order-bids
Body: {to_id, vendor_id, bid_amount, vehicle_type, ...}

// Awarded TOs
GET /api/v1/vendors/{vendor_id}/awarded-tos
Query: ?status=Pending_Acceptance

// Accept/Reject TO
POST /api/v1/transport-orders/{to_id}/accept
Body: {driver_id, vehicle_id}

POST /api/v1/transport-orders/{to_id}/reject
Body: {rejection_reason}

// Trip Tracking
GET /api/v1/vendors/{vendor_id}/trips
Query: ?status=In_Progress

// Browser Push Notifications
POST /api/v1/mobile/register-push-subscription
Body: {vendor_id, push_subscription: {endpoint, keys}}

POST /api/v1/mobile/notifications/mark-read
Body: {notification_id}
```

---

## Testing Scenarios

### Happy Path
1. Receive push notification → Open app
2. View available TOs → TO list displayed
3. Place bid → Bid submitted
4. Bid accepted → Notification received
5. Accept TO → Assign driver/vehicle
6. Track trip → Real-time updates

### Edge Cases
1. **Bidding deadline passed**: Cannot submit bid
2. **TO acceptance timeout**: TO reassigned
3. **Offline mode**: View cached data only

---

## Dependencies

### Prerequisites
- ✅ US-024: Vendor Bidding Portal
- ✅ US-031: Vendor Portal

### Enables
- → Faster vendor response
- → Improved vendor engagement
- → Better operational efficiency

---

## Definition of Done
- [ ] Mobile-responsive web interface functional on mobile browsers
- [ ] TO listing and filtering working
- [ ] Bid submission functional
- [ ] Awarded TO management working
- [ ] Driver/vehicle assignment
- [ ] Trip tracking with GPS (via Geolocation API)
- [ ] Browser push notifications working (if supported)
- [ ] Payment tracking display
- [ ] Performance metrics display
- [ ] Offline mode for viewing (Service Worker)
- [ ] PWA features: Installable, offline-capable
- [ ] Unit tests > 85%
- [ ] UAT approved (on mobile devices)

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 18  
**Priority**: High

---

**Source Documents**:
- PRD Section 6.9.3: Vendor Portal Access (Bidding & Trip Management)

**Last Updated**: February 13, 2026  
**Status**: Updated to reflect mobile-responsive web interface (not native app) per PRD clarification

