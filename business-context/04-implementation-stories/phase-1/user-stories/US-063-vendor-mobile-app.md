---
title: Vendor Mobile Application (Flutter - Bidding & TO View)
story_id: US-063
phase: phase-1
module: Mobile Applications
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
tags: [mobile, vendor, bidding, flutter, native-app, high-priority]
---

# US-063: Vendor Mobile Application (Flutter - Bidding & TO View)

## User Story

**As a** Vendor  
**I want to** access bidding opportunities and view Transport Orders via a native mobile application  
**So that** I can respond quickly and manage my transport operations on-the-go

## Business Context

**Note**: Per user clarification, the Vendor Mobile Application is a **native Flutter mobile app** (not a mobile-responsive web interface). This differs from Driver and QC Supervisor interfaces which are mobile-responsive web pages.

Vendor Flutter mobile app enables:
- **Quick Response**: Bid on TOs immediately via native mobile app
- **Mobility**: Manage operations from anywhere using mobile devices
- **Real-time Updates**: Instant push notifications via Firebase Cloud Messaging (FCM)
- **Competitive Advantage**: Faster bidding = more opportunities
- **Operational Efficiency**: Track fleet and trips
- **Offline Capability**: View cached data when offline

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

### AC-6: Push Notifications
- [ ] System SHALL send push notifications via Firebase Cloud Messaging (FCM) for:
  - New TO available for bidding
  - Bid accepted/rejected
  - TO awarded
  - Trip milestone reached
  - Payment processed
  - Performance alerts
- [ ] System SHALL allow notification preferences
- [ ] System SHALL register device for push notifications on app launch

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

### FR-001: Flutter Mobile App Platform
- [Critical] Native Flutter mobile app (iOS & Android)
- [Critical] Firebase Cloud Messaging (FCM) for push notifications
- [High] Offline mode (view cached data using local storage - SQLite/Hive)
- [High] Background sync when online
- [High] App store distribution (iOS App Store, Google Play)

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
// Local Storage (SQLite/Hive for Flutter)
// Reuses existing entities from US-024, US-031
// Flutter mobile app is a native client interface

VendorMobileSession {
  id: UUID (PK)
  vendor_id: UUID (FK)
  device_id: String
  device_type: Enum (Android, iOS)
  
  fcm_token: String (for Firebase Cloud Messaging)
  
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

// Push Notifications (FCM)
POST /api/v1/mobile/register-device
Body: {vendor_id, device_id, fcm_token, device_type}

POST /api/v1/mobile/notifications/mark-read
Body: {notification_id}
```

---

## Non-Functional Requirements

### Performance
- App launch time: < 2 seconds
- TO list load: < 1 second
- Offline mode: Full functionality for cached data
- Background sync: Automatic when online

### Compatibility
- iOS: 13.0+
- Android: 8.0+ (API level 26+)
- Screen sizes: 4.7" to 6.7"
- Languages: English, Bangla (Phase 3)

### Security
- Encrypted local storage (SQLite Cipher)
- HTTPS for all API calls
- Token-based authentication (JWT)
- Secure FCM token storage

### Usability
- Simple, vendor-friendly UI
- Large touch targets (min 48x48 dp)
- Offline-first design
- Push notification badges

### Reliability
- Offline mode: 100% functionality for cached data
- Auto-save: Every user action saved locally
- Crash recovery: Resume from last state
- Sync retry: Up to 3 attempts with exponential backoff

---

## Testing Scenarios

### Happy Path
1. Receive push notification → Open Flutter app
2. View available TOs → TO list displayed
3. Place bid → Bid submitted
4. Bid accepted → Notification received
5. Accept TO → Assign driver/vehicle
6. Track trip → Real-time updates

### Edge Cases
1. **Bidding deadline passed**: Cannot submit bid
2. **TO acceptance timeout**: TO reassigned
3. **Offline mode**: View cached data only, sync when online
4. **Push notification not received**: Fallback to in-app notification

### Error Scenarios
1. **Network failure**: Offline mode activated, data queued
2. **FCM registration fails**: Retry mechanism
3. **App crash**: Recovery from last saved state

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
- [ ] Flutter mobile app functional on iOS & Android
- [ ] TO listing and filtering working
- [ ] Bid submission functional
- [ ] Awarded TO management working
- [ ] Driver/vehicle assignment
- [ ] Trip tracking with GPS (optional)
- [ ] Push notifications working (Firebase Cloud Messaging)
- [ ] Payment tracking display
- [ ] Performance metrics display
- [ ] Offline mode for viewing (local storage)
- [ ] Background sync functional
- [ ] Unit tests > 75%
- [ ] UAT approved (on mobile devices)
- [ ] App store ready (iOS App Store, Google Play)

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Assigned To**: Mobile Team (Flutter developers)  
**Sprint**: Sprint 18  
**Priority**: High  
**Platform**: Flutter (iOS 13+, Android 8+)

---

**Source Documents**:
- PRD Section 6.9.3: Vendor Portal Access (Bidding & Trip Management)
- PRD Section 6.10: Vendor Mobile Application (Flutter)

**Last Updated**: February 13, 2026  
**Status**: Updated to reflect Flutter native mobile application (per user clarification)

