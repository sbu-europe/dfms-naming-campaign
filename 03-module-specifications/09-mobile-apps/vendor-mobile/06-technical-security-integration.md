---
last_updated: 2026-05-05
---

# Vendor Mobile Application — Technical, Security, and Integration

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

**Tenant Scope (Vendor Membership):**
- Vendor can only view bids, TOs, and trips for tenants where the vendor membership is approved
- All list/detail endpoints enforce `(vendor_id, tenant_id)` scope, not just `vendor_id`

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

