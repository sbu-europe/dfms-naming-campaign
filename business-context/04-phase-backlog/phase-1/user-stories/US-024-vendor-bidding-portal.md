---
title: Vendor Bidding Portal for Non-Contractual TOs
story_id: US-024
phase: phase-1
module: Vendor Management
priority: High
status: Pending
epic: Vendor Ecosystem
epic_id: EPIC-005
epic_name: Product Inventory Management (PIM)
sprint: Sprint 5
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/05-vendor-management/vendor-portal.md
  - ../../../03-module-specifications/03-core-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-021-to-execution-vendor-fleet.md
  - US-027-vendor-registration.md
  - US-029-vendor-verification.md
dependencies:
  - US-027-vendor-registration.md (Must have verified vendors)
  - US-021-to-execution-vendor-fleet.md (TO must be created)
tags: [vendor, bidding, procurement, workflow, high-priority]
---

# US-024: Vendor Bidding Portal for Non-Contractual TOs

## User Story

**As a** TDO (Vendor Fleet)  
**I want to** publish Transport Orders (TOs) to a bidding portal where non-contractual vendors can submit competitive bids  
**So that** we get the best market rates and ensure transport availability through competitive procurement

**As a** Vendor (Non-Contractual)  
**I want to** view available TOs, submit bids with my pricing, and track bid status  
**So that** I can compete for transport jobs and grow my business

## Business Context

### Vendor Types in DFMS
1. **Contractual Vendors**: Have pre-negotiated rates, get direct TO assignment
2. **Non-Contractual Vendors**: No fixed rates, must bid competitively for each TO

### Why Competitive Bidding?

**For Nourish (Client)**:
- 💰 **Cost optimization**: Market-driven pricing, avoid overpaying
- 🔄 **Vendor pool expansion**: Access to wider vendor base
- 📊 **Price transparency**: Compare multiple quotes for same job
- ⚖️ **Fair competition**: All vendors have equal opportunity
- 🛡️ **Risk mitigation**: Backup options if preferred vendor unavailable

**For Vendors**:
- 📈 **Business growth**: Access to transport opportunities
- 💼 **Flexible pricing**: Set rates based on availability and costs
- 🎯 **Targeted bidding**: Choose TOs matching their fleet capacity
- 📱 **Digital platform**: No manual quotation submission, instant updates

### Bidding Workflow Overview
```
TDO creates TO (Vendor Fleet) 
  ↓
TDO publishes TO to Bidding Portal
  ↓
Non-Contractual Vendors view available TOs
  ↓
Vendors submit bids (price + vehicle details)
  ↓
TDO evaluates bids (price, vendor rating, vehicle suitability)
  ↓
TDO selects winning bid
  ↓
TO assigned to winning vendor
  ↓
Other bidders notified (bid rejected)
```

---

## Acceptance Criteria

### AC-1: TDO - Publish TO to Bidding Portal

#### AC-1.1: Initiate Bidding
- [ ] System SHALL allow TDO to publish TOs with status "Planned" to bidding portal
- [ ] System SHALL require TDO to set bidding parameters:
  - Bidding deadline (date + time)
  - Estimated cost (optional, as reference)
  - Minimum vendor rating (e.g., ≥ 3.5 stars)
  - Required vehicle type
  - Required capacity
- [ ] System SHALL validate bidding deadline is at least 2 hours from current time
- [ ] System SHALL update TO status to "Open for Bidding"
- [ ] System SHALL send notification to all eligible vendors

#### AC-1.2: Manage Active Bidding
- [ ] System SHALL display list of TOs currently in bidding
- [ ] System SHALL show real-time bid count per TO
- [ ] System SHALL allow TDO to view all submitted bids
- [ ] System SHALL allow TDO to extend bidding deadline (before closing)
- [ ] System SHALL allow TDO to cancel bidding (with reason)

### AC-2: Vendor - View Available TOs

#### AC-2.1: Browse TO Listing
- [ ] System SHALL display list of TOs "Open for Bidding" to logged-in vendors
- [ ] System SHALL show TO card with key information:
  - TO Number
  - Source POI → Destination POI
  - Product & Quantity
  - Required Vehicle Type
  - Required Capacity
  - Distance (approx.)
  - Pickup Date & Time
  - Bidding Deadline
  - Current Bid Count
  - Estimated Cost (if TDO provided)
- [ ] System SHALL filter TOs by: Route, Vehicle Type, Date, Distance
- [ ] System SHALL sort TOs by: Bidding deadline, Pickup date, Distance
- [ ] System SHALL hide TOs not matching vendor's registered vehicle types

#### AC-2.2: View TO Details
- [ ] System SHALL display comprehensive TO details when vendor clicks TO card
- [ ] System SHALL show route map with source and destination markers
- [ ] System SHALL display delivery instructions (if any)
- [ ] System SHALL show estimated route distance and duration
- [ ] System SHALL display vendor's bid status:
  - "Not Bid" → Show "Submit Bid" button
  - "Bid Submitted" → Show bid amount and "Edit Bid" / "Withdraw Bid" buttons
  - "Bidding Closed" → Show "Bidding Ended" message

### AC-3: Vendor - Submit Bid

#### AC-3.1: Bid Submission Form
- [ ] System SHALL display bid submission form with fields:
  - Proposed Cost (mandatory, numeric)
  - Vehicle Registration Number (dropdown from vendor's fleet)
  - Driver Name & Phone (auto-filled from vehicle assignment)
  - Helper Name & Phone (optional)
  - Remarks (optional, e.g., special handling capabilities)
- [ ] System SHALL validate proposed cost > 0
- [ ] System SHALL validate vehicle capacity ≥ TO required capacity
- [ ] System SHALL validate vehicle type matches TO requirements
- [ ] System SHALL display warning if proposed cost > estimated cost by 20%
- [ ] System SHALL allow vendor to review and confirm bid

#### AC-3.2: Bid Submission Success
- [ ] System SHALL save bid to database with status "Submitted"
- [ ] System SHALL timestamp bid submission
- [ ] System SHALL send confirmation to vendor (in-app notification + email)
- [ ] System SHALL notify TDO of new bid submission
- [ ] System SHALL update TO's bid count
- [ ] System SHALL prevent bid submission after bidding deadline

#### AC-3.3: Edit or Withdraw Bid
- [ ] System SHALL allow vendor to edit bid before bidding deadline
- [ ] System SHALL allow vendor to withdraw bid before TDO evaluation
- [ ] System SHALL update bid status to "Withdrawn" (not deleted, for audit)
- [ ] System SHALL decrease TO's bid count if withdrawn

### AC-4: TDO - Evaluate Bids

#### AC-4.1: Bid Comparison View
- [ ] System SHALL display all bids for a TO in sortable table:
  - Vendor Name & Rating
  - Proposed Cost
  - Vehicle Details (type, registration, capacity)
  - Driver & Helper Info
  - Bid Submission Time
  - Remarks
  - Actions (Select, Reject, View Details)
- [ ] System SHALL sort bids by: Cost (low to high), Vendor rating, Submission time
- [ ] System SHALL highlight lowest bid with visual indicator
- [ ] System SHALL display vendor historical performance metrics (if available):
  - On-time delivery %
  - Previous TOs completed
  - Average rating

#### AC-4.2: Select Winning Bid
- [ ] System SHALL allow TDO to select exactly one winning bid
- [ ] System SHALL require confirmation: "Confirm [Vendor Name] at BDT [Cost]?"
- [ ] System SHALL update bid status to "Accepted" for selected bid
- [ ] System SHALL update all other bids to "Rejected"
- [ ] System SHALL assign TO to winning vendor
- [ ] System SHALL update TO status to "Assigned"
- [ ] System SHALL send notifications:
  - Winner: "Congratulations! Your bid for TO-XXX accepted"
  - Losers: "Your bid for TO-XXX was not selected. Thank you for participating."
- [ ] System SHALL close bidding for that TO

#### AC-4.3: Reject All Bids
- [ ] System SHALL allow TDO to reject all bids (if none suitable)
- [ ] System SHALL require rejection reason
- [ ] System SHALL close bidding
- [ ] System SHALL notify all bidders
- [ ] System SHALL allow TDO to re-publish TO or assign via contractual vendor

### AC-5: Notifications & Alerts

#### AC-5.1: Vendor Notifications
- [ ] System SHALL notify vendors when new TO matching their fleet is published
- [ ] System SHALL send reminder notification 1 hour before bidding deadline
- [ ] System SHALL notify vendor when their bid is accepted/rejected

#### AC-5.2: TDO Notifications
- [ ] System SHALL notify TDO when new bid is submitted
- [ ] System SHALL alert TDO when bidding deadline is approaching (1 hour before)
- [ ] System SHALL alert TDO if no bids received by 50% of bidding duration

---

## Functional Requirements

### FR-001: TO Publishing
- [Critical] System SHALL provide "Publish to Bidding Portal" action for TOs
- [Critical] System SHALL validate TO data completeness before publishing
- [Critical] System SHALL create bidding session with deadline
- [High] System SHALL support draft bidding session (save without publishing)

### FR-002: Vendor Eligibility
- [Critical] System SHALL filter vendors based on:
  - Account status = "Verified"
  - Has vehicles matching TO requirements
  - Vendor rating ≥ minimum (if set by TDO)
- [High] System SHALL hide TOs from vendors if:
  - Vehicle type mismatch
  - Vendor rating below minimum
  - Vendor blacklisted

### FR-003: Bid Validation
- [Critical] System SHALL validate bid data:
  - Cost > 0
  - Vehicle exists in vendor's fleet
  - Vehicle capacity ≥ TO requirement
  - Vehicle type matches TO requirement
  - Driver info provided
- [Critical] System SHALL enforce one bid per vendor per TO
- [High] System SHALL prevent duplicate bids (idempotency)

### FR-004: Bid Comparison
- [High] System SHALL calculate bid metrics:
  - Lowest bid
  - Average bid
  - Bid range (min-max)
  - Cost variance from estimated
- [High] System SHALL rank bids by weighted score:
  - Cost (60% weight)
  - Vendor rating (30% weight)
  - On-time delivery history (10% weight)
- [Medium] System SHALL suggest "Recommended Bid" based on ranking

### FR-005: Bidding Deadline Management
- [Critical] System SHALL auto-close bidding at deadline
- [Critical] System SHALL prevent bid submission after deadline
- [High] System SHALL send deadline reminders
- [High] System SHALL allow TDO to extend deadline (max 2 extensions)

### FR-006: Audit Trail
- [Critical] System SHALL log all bidding activities:
  - TO published
  - Bid submitted, edited, withdrawn
  - Bid accepted/rejected
  - Deadline extended
  - Bidding canceled
- [High] System SHALL maintain bid history for compliance
- [Medium] System SHALL generate audit reports

---

## Business Rules

### BR-VEN-015: Bidding Deadline
- Bidding deadline must be at least 2 hours from publication
- Maximum deadline: 7 days from publication
- **Enforcement**: Frontend + backend validation

### BR-VEN-016: Bid Submission Window
- Bids can only be submitted before deadline
- Exception: None
- **Enforcement**: Backend check on submission time

### BR-VEN-017: Vendor Eligibility
- Only verified vendors with matching vehicle types can bid
- **Enforcement**: API filters eligible TOs per vendor

### BR-VEN-018: One Bid Per Vendor
- Each vendor can submit only one bid per TO
- Vendor can edit or withdraw and resubmit
- **Enforcement**: Database unique constraint (to_id + vendor_id)

### BR-VEN-019: Winner Selection
- TDO can select only one winning bid
- All other bids automatically rejected
- **Enforcement**: Transaction-based bid status update

### BR-VEN-020: Cost Validation
- Proposed cost must be > 0
- Warning if > 120% of estimated cost
- **Enforcement**: Frontend validation + warning

### BR-VEN-021: Vehicle Capacity
- Vehicle capacity must be ≥ TO required capacity
- **Enforcement**: Backend validation

### BR-VEN-022: Bid Finality
- After TO assigned, bidding session cannot be reopened
- Exception: TO cancellation
- **Enforcement**: Status check before any bidding action

---

## Data Model

```typescript
BiddingSession {
  id: UUID (PK)
  tenant_id: UUID (FK)
  to_id: UUID (FK to TransportOrder, unique)
  
  // Bidding parameters
  bidding_deadline: Timestamp
  estimated_cost: Decimal (nullable, reference for vendors)
  min_vendor_rating: Decimal (default: 0)
  required_vehicle_type: String
  required_capacity: Decimal
  
  // Status
  status: Enum (
    Draft,
    Open,
    Closed,
    Winner_Selected,
    Cancelled
  )
  
  // Metrics
  total_bids: Integer
  lowest_bid: Decimal (nullable)
  average_bid: Decimal (nullable)
  
  // Audit
  published_at: Timestamp (nullable)
  published_by: UUID (FK to User)
  closed_at: Timestamp (nullable)
  closed_reason: Text (nullable, if cancelled)
  
  created_at: Timestamp
  updated_at: Timestamp
}

VendorBid {
  id: UUID (PK)
  bidding_session_id: UUID (FK to BiddingSession)
  vendor_id: UUID (FK to Vendor)
  
  // Bid details
  proposed_cost: Decimal
  vehicle_id: UUID (FK to Vehicle)
  driver_id: UUID (FK to Driver)
  helper_id: UUID (FK to Helper, nullable)
  remarks: Text (nullable)
  
  // Status
  status: Enum (
    Submitted,
    Withdrawn,
    Accepted,
    Rejected
  )
  
  // Audit
  submitted_at: Timestamp
  submitted_by: UUID (FK to User, vendor's user account)
  edited_at: Timestamp (nullable)
  evaluated_at: Timestamp (nullable)
  evaluated_by: UUID (FK to User, TDO, nullable)
  
  created_at: Timestamp
  updated_at: Timestamp
  
  // Unique constraint
  UNIQUE(bidding_session_id, vendor_id)
}

// Extend TransportOrder
TransportOrder {
  ...existing fields...
  bidding_session_id: UUID (FK to BiddingSession, nullable)
}
```

---

## UI/UX Requirements

### TDO - Publish TO to Bidding Portal

#### Publish TO Form
```
┌─────────────────────────────────────────┐
│ Publish TO to Bidding Portal            │
├─────────────────────────────────────────┤
│ TO: TO-20260211-0042                    │
│ Route: Farm A → Distribution Center     │
│ Product: Live Birds (500 KG)            │
│                                         │
│ Bidding Deadline: *                     │
│ [2026-02-11]  [6:00 PM]                │
│ (Minimum 2 hours from now)              │
│                                         │
│ Estimated Cost (BDT): (Optional)        │
│ [5000]                                  │
│ (Helps vendors with reference pricing)  │
│                                         │
│ Min Vendor Rating:                      │
│ [⭐⭐⭐⭐☆ 3.5 and above       ▼]        │
│                                         │
│ Required Vehicle Type:                  │
│ [Covered Van                  ▼]        │
│                                         │
│ Required Capacity (MT):                 │
│ [5]                                     │
│                                         │
│ [Save as Draft]        [Publish]        │
└─────────────────────────────────────────┘
```

### TDO - Bid Evaluation Dashboard

```
┌──────────────────────────────────────────────────────────────────┐
│ Bidding Session: TO-20260211-0042                                │
│ Status: Open | Bids: 8 | Deadline: Feb 11, 6:00 PM (2 hrs left) │
├──────────────────────────────────────────────────────────────────┤
│ Sort by: [Cost (Low to High) ▼]  [Export Bids]                  │
│                                                                  │
│ Vendor          Cost    Vehicle      Driver      Rating  Action │
│ ──────────────────────────────────────────────────────────────  │
│ 🥇 ABC Logistics  4,200  Covered Van  Rahim     ⭐4.5  [Select]│
│ 🥈 XYZ Transport  4,500  Covered Van  Karim     ⭐4.2  [Select]│
│    QuickMove Ltd  4,800  Truck        Salim     ⭐3.8  [Select]│
│    FleetPro       5,000  Covered Van  Jamal     ⭐4.0  [Select]│
│    ...                                                           │
│                                                                  │
│ Bid Statistics:                                                  │
│ Lowest: BDT 4,200 | Average: BDT 4,675 | Highest: BDT 5,200     │
│                                                                  │
│ Recommended: ABC Logistics (Best cost + rating)                  │
│                                                                  │
│ [Extend Deadline]  [Reject All]  [Cancel Bidding]               │
└──────────────────────────────────────────────────────────────────┘
```

### Vendor - Available TOs

```
┌─────────────────────────────────────────┐
│ Available Transport Orders (12)         │
│ Filters: [All Routes ▼] [Today ▼]      │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ TO-20260211-0042    💰 BDT ~5,000│   │
│ │ Farm A → Dist. Center (25 km)     │   │
│ │ Product: Live Birds (500 KG)      │   │
│ │ Vehicle: Covered Van (5 MT)       │   │
│ │ Pickup: Feb 12, 8:00 AM           │   │
│ │ ⏱️ Bidding closes in 2 hours      │   │
│ │ 📊 8 bids submitted                │   │
│ │                                   │   │
│ │ [View Details] [Submit Bid]       │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ TO-20260211-0038    💰 BDT ~8,000│   │
│ │ Warehouse → Farm B (45 km)        │   │
│ │ Product: Feed (1000 KG)           │   │
│ │ Vehicle: Open Truck (10 MT)       │   │
│ │ Pickup: Feb 13, 9:00 AM           │   │
│ │ ⏱️ Bidding closes in 1 day        │   │
│ │ 📊 3 bids submitted                │   │
│ │ ✅ You bid: BDT 7,500 (Submitted) │   │
│ │ [View Bid] [Edit Bid]             │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Vendor - Submit Bid

```
┌─────────────────────────────────────────┐
│ Submit Bid for TO-20260211-0042         │
├─────────────────────────────────────────┤
│ Route: Farm A → Distribution Center     │
│ Distance: ~25 km | Est. Cost: BDT 5,000 │
│                                         │
│ Your Bid Amount (BDT): *                │
│ [4200]                                  │
│ ✓ 16% lower than estimated              │
│                                         │
│ Select Vehicle: *                       │
│ [Dhaka-Metro-11-5678 (Covered Van, 5MT)▼]│
│                                         │
│ Driver: *                               │
│ Name: Rahim Ahmed (auto-filled)         │
│ Phone: 01711-123456                     │
│                                         │
│ Helper: (Optional)                      │
│ [Karim Mia                        ▼]    │
│                                         │
│ Remarks: (Optional)                     │
│ ┌─────────────────────────────────────┐ │
│ │ Experienced with live bird handling  │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Bid Summary:                            │
│ • Vehicle: Dhaka-Metro-11-5678          │
│ • Capacity: 5 MT (meets requirement)    │
│ • Proposed Cost: BDT 4,200              │
│ • Bidding deadline: Feb 11, 6:00 PM     │
│                                         │
│ [Cancel]              [Confirm Bid]     │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// TDO: Publish TO to bidding portal
POST /api/v1/transport-orders/{to_id}/bidding/publish
Body: {
  bidding_deadline: ISO8601,
  estimated_cost?: number,
  min_vendor_rating?: number
}
Response: {
  bidding_session: BiddingSession,
  eligible_vendor_count: number
}

// Vendor: Get available TOs for bidding
GET /api/v1/vendors/me/bidding/available-tos
Query: ?route=&vehicle_type=&date=
Response: {
  tos: [...],
  total_count: number
}

// Vendor: Submit bid
POST /api/v1/bidding-sessions/{session_id}/bids
Body: {
  proposed_cost: number,
  vehicle_id: UUID,
  driver_id: UUID,
  helper_id?: UUID,
  remarks?: string
}
Response: {
  bid: VendorBid,
  bid_rank: number (1 = lowest)
}

// Vendor: Edit bid
PATCH /api/v1/bidding-sessions/{session_id}/bids/{bid_id}
Body: {proposed_cost?: number, remarks?: string}

// Vendor: Withdraw bid
DELETE /api/v1/bidding-sessions/{session_id}/bids/{bid_id}

// TDO: Get all bids for a session
GET /api/v1/bidding-sessions/{session_id}/bids
Response: {
  bids: VendorBid[],
  statistics: {lowest, average, highest}
}

// TDO: Select winning bid
POST /api/v1/bidding-sessions/{session_id}/select-winner
Body: {bid_id: UUID}
Response: {
  to: TransportOrder (with assigned vendor),
  notifications_sent: number
}

// TDO: Reject all bids
POST /api/v1/bidding-sessions/{session_id}/reject-all
Body: {reason: string}
```

---

## Non-Functional Requirements

### Performance
- TO listing load time: < 2 seconds for 100 TOs
- Bid submission: < 1 second
- Real-time bid count updates: < 500 ms

### Scalability
- Support 500+ concurrent vendors
- Handle 100+ TOs in bidding simultaneously
- Process 1000+ bids per day

### Security
- Vendors can only see their own bids
- TDO can see all bids (role-based access)
- Bid data encrypted in transit and at rest

### Usability
- Simple bid submission (3-step flow)
- Clear deadline countdown timers
- Mobile-friendly bid portal

---

## Testing Scenarios

### Happy Path
1. TDO publishes TO → Eligible vendors notified
2. Vendor submits bid → Bid saved, TDO notified
3. Multiple vendors submit bids
4. TDO evaluates bids → Selects winner
5. Winning vendor gets TO → Other vendors notified

### Edge Cases
1. **No bids received**: TDO alerted, can extend deadline or cancel
2. **All bids above budget**: TDO rejects all, reassigns via contractual vendor
3. **Vendor withdraws bid**: Bid count updated, TDO notified
4. **Bid submitted at deadline**: Timestamp validation, reject if late

### Error Scenarios
1. **Bid submitted after deadline**: Error, "Bidding closed"
2. **Invalid vehicle (insufficient capacity)**: Validation error
3. **Duplicate bid**: Error, "You already bid on this TO"

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration (must have vendors)
- ✅ US-029: Vendor Verification (only verified vendors bid)
- ✅ US-021: TO Execution - Vendor Fleet (TO must exist)

### Enables
- → Competitive pricing for transport
- → Vendor performance tracking (bid-to-win ratio)
- → Market rate analytics

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] TO publishing flow complete (TDO)
- [ ] Vendor bidding portal functional
- [ ] Bid evaluation dashboard (TDO)
- [ ] Winner selection workflow
- [ ] Notifications (vendor + TDO)
- [ ] Deadline management (auto-close, extend)
- [ ] Audit trail logging
- [ ] Unit tests: coverage > 80%
- [ ] Integration tests: End-to-end bidding flow
- [ ] UAT: TDO + 5 vendors test
- [ ] Performance: < 2s load time for 100 TOs
- [ ] Documentation: Bidding SOP for vendors

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Assigned To**: Backend (35h) + Frontend (25h) + QA (4h)  
**Sprint**: Sprint 5  
**Priority**: High (Key differentiator for vendor ecosystem)

