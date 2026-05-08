---
title: Vendor Portal (Self-Service)
story_id: US-031
phase: phase-1
module: Vendor Management
priority: High
status: Pending
epic: Vendor Management
epic_id: EPIC-010
epic_name: Vendor Management
sprint: Sprint 9
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/05-vendor-management/vendor-bidding.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-024-vendor-bidding-portal.md
  - US-030-vendor-fleet-management.md
dependencies:
  - US-027-vendor-registration-verification.md
tags: [vendor, portal, self-service, high-priority]
---

# US-031: Vendor Portal (Self-Service)

## User Story

**As a** Vendor  
**I want to** access a self-service portal  
**So that** I can manage my profile, view assignments, submit bids, and track payments independently

## Business Context

Vendor portal provides:
- **Self-Service**: Reduce admin workload
- **Transparency**: Real-time visibility into assignments and payments
- **Efficiency**: Quick bid submission and acknowledgment
- **Communication**: Direct channel with transport team

**Portal Features**:
- Dashboard with key metrics
- Active bids and assignments
- Fleet management
- Payment history
- Performance tracking
- Document management
- Notifications

---

## Acceptance Criteria

### AC-1: Vendor Dashboard
- [ ] System SHALL display vendor dashboard showing:
  - Active TOs assigned
  - Pending bids
  - Upcoming trips
  - Payment summary (paid, pending, overdue)
  - Performance score
  - Recent notifications
- [ ] System SHALL update dashboard in real-time

### AC-2: Bid Management (per PRD)
- [ ] System SHALL display available bid opportunities (for non-contractual vendors only)
- [ ] System SHALL allow vendor to view:
  - Active bids
  - Active trips
  - Completed Trips
- [ ] System SHALL allow vendor to submit structured bids with:
  - Rate
  - Vehicle availability
  - Number of vehicles available
- [ ] System SHALL record bid timestamp and rate validity
- [ ] System SHALL show bid status (Submitted, Won, Lost)
- [ ] System SHALL notify vendor of bid results

### AC-3: Assignment Management
- [ ] System SHALL display assigned TOs
- [ ] System SHALL allow vendor to:
  - Acknowledge assignment
  - Reject assignment (with reason)
  - View TO details
  - Assign vehicle/driver
- [ ] System SHALL show trip status in real-time

### AC-4: Payment Tracking
- [ ] System SHALL display payment history
- [ ] System SHALL show:
  - Invoices (paid/unpaid)
  - Payment dates
  - Outstanding balance
  - Payment method
- [ ] System SHALL allow downloading invoices (PDF)

### AC-5: Profile Management
- [ ] System SHALL allow vendor to update:
  - Contact information
  - Bank details
  - Service areas
  - Fleet information (US-030)
- [ ] System SHALL require verification for critical changes

### AC-6: Performance View
- [ ] System SHALL display vendor's own performance metrics
- [ ] System SHALL show:
  - On-time delivery rate
  - Trip completion rate
  - Average rating
  - Performance tier
- [ ] System SHALL show performance trends

### AC-7: Notifications
- [ ] System SHALL display notifications for:
  - New bid opportunities
  - TO assignments
  - Payment processed
  - Document expiry alerts
  - Performance alerts
- [ ] System SHALL support email and SMS notifications

---

## Functional Requirements

### FR-001: Portal UI
- [Critical] Responsive web portal (desktop + mobile)
- [Critical] Secure login (username/password + 2FA optional)
- [High] Dashboard with widgets
- [High] Navigation menu

### FR-002: Real-time Updates
- [High] WebSocket for live notifications
- [High] Auto-refresh for assignments
- [Medium] Push notifications (mobile)

### FR-003: Document Management
- [High] Upload/update documents
- [High] View document status
- [Medium] Document expiry calendar

---

## Business Rules

### BR-PORTAL-001: Access Control
- Only verified vendors can access portal
- **Enforcement**: Authentication + verification status check

### BR-PORTAL-002: Data Visibility
- Vendors can only see their own data
- **Enforcement**: Row-level security

---

## Data Model

```typescript
VendorPortalSession {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  login_timestamp: Timestamp
  logout_timestamp: Timestamp (nullable)
  ip_address: String
  user_agent: String
}

VendorNotification {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  notification_type: Enum (
    New_Bid_Opportunity,
    TO_Assignment,
    Payment_Processed,
    Document_Expiry,
    Performance_Alert
  )
  
  title: String
  message: Text
  link_url: String (nullable)
  
  is_read: Boolean
  read_at: Timestamp (nullable)
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### Vendor Portal Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ DFMS Vendor Portal                    [🔔 5] [👤 ABC Logistics]│
├──────────────────────────────────────────────────────────────┤
│ Dashboard                                                    │
│                                                              │
│ ┌─ Quick Stats ────────────────────────────────────────────┐│
│ │ Active TOs: 3  │  Pending Bids: 2  │  Pending Payment: 5 ││
│ │ Performance: 85% (Gold Tier) │  This Month Earnings: 450K││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Active Assignments ─────────────────────────────────────┐│
│ │ TO-001  Bhaluka → Mirpur  500 KG  Feb 13  [View Details] ││
│ │ TO-002  Warehouse → Depot  1000KG Feb 14  [View Details] ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Pending Bids ───────────────────────────────────────────┐│
│ │ BID-101  Dhaka → Chittagong  Closes in 2 hours  [View]   ││
│ │ BID-102  Mirpur → Gazipur    Closes in 5 hours  [View]   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌─ Recent Notifications ───────────────────────────────────┐│
│ │ • New bid opportunity available (2 min ago)              ││
│ │ • Payment processed for INV-001 (1 hour ago)             ││
│ │ • Vehicle DM-11-1234 insurance expiring in 30 days       ││
│ └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get vendor dashboard data
GET /api/v1/vendor-portal/dashboard

// Get vendor notifications
GET /api/v1/vendor-portal/notifications
Query: ?unread_only=true

// Mark notification as read
PATCH /api/v1/vendor-portal/notifications/{notification_id}/read

// Get vendor assignments
GET /api/v1/vendor-portal/assignments
Query: ?status=Active

// Get vendor payment history
GET /api/v1/vendor-portal/payments
Query: ?from_date=2026-01-01
```

---

## Testing Scenarios

### Happy Path
1. Vendor logs in → Dashboard displayed
2. Vendor views assignments → List shown
3. Vendor submits bid → Bid recorded
4. Vendor checks payments → History displayed

### Edge Cases
1. **Unverified vendor login**: Access denied
2. **Session timeout**: Auto-logout after 30 min inactivity

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration & Verification

### Enables
- → Vendor self-service
- → Reduced admin workload

---

## Definition of Done
- [ ] Portal UI functional
- [ ] Dashboard widgets working
- [ ] Bid management integrated
- [ ] Assignment view working
- [ ] Payment history display
- [ ] Notifications working
- [ ] Mobile responsive
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 9  
**Priority**: High

