---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Vendor Bidding Portal, Bid Evaluation
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [transport-order-management, vendor-onboarding, vendor-portal]
---

# Vendor Bidding System

## Overview

Vendor Bidding System is the **competitive procurement layer** that enables **Non-Contractual vendors** to compete for Transport Orders (TOs) by submitting rate proposals. It facilitates transparent, fair, and efficient vendor selection through structured bid submission, evaluation, and award workflows.

The bidding system creates a **marketplace dynamic** where vendors compete on price, vehicle availability, and service quality, allowing Transport Planners to optimize costs while maintaining service standards.

### Purpose

- Enable Non-Contractual vendors to view and bid on open TOs
- Provide transparent bidding windows with clear submission deadlines
- Facilitate structured bid submission (rate, vehicle count, availability)
- Support side-by-side bid comparison for Transport Planners
- Enable bid evaluation based on rate, vehicle type, vendor performance
- Track bid history with timestamps and winning logs
- Enforce bid validity and prevent post-deadline submissions
- Support manual bid closure/cancellation

### Workflow Position

```
Transport Order (TO) Created → TO Published for Bidding
    ↓
Vendors Notified → View TO details (route, product, quantity, vehicle type, urgency)
    ↓
Bidding Window Opens → Vendors submit bids (rate, vehicle count)
    ↓
Bidding Window Closes → No more submissions allowed
    ↓
Transport Planner (TP) Evaluates Bids → Side-by-side comparison
    ↓
TP Selects Winner → Bid approved
    ↓
Vendor Notified (Winner) → Adds vehicle/driver details
    ↓
Trip Created → Execution begins
```

---

## Bid Publication by Transport Planner

### Purpose

Transport Planners publish TOs for bidding when **Non-Contractual vendors** are needed (own fleet unavailable, cost optimization, overflow capacity).

### TO Publication Workflow

```
1. TP creates TO from approved TR
2. TP selects allocation strategy: "Vendor Bidding (Non-Contractual)"
3. TP configures bidding parameters:
   - Bidding window start time (e.g., immediately or scheduled)
   - Bidding window end time (e.g., 12 hours, 24 hours)
   - Expected bid rate (optional, as reference for vendors)
   - Required vehicle type and count
   - Minimum vendor rating (e.g., ≥ 3.5 stars)
4. TP publishes TO for bidding
5. System:
   - Updates TO status → 'OPEN_FOR_BIDDING'
   - Notifies eligible vendors (email, SMS, push notification)
   - Displays TO in Vendor Portal "Available Bids" section
```

### Bidding Parameters

```typescript
interface BiddingParameters {
  to_id: string;
  
  // Bidding Window
  window_start_time: Date;          // When bidding opens
  window_end_time: Date;            // Submission deadline
  window_duration_hours: number;    // e.g., 12, 24, 48
  
  // TO Details (for vendors)
  route: {
    source_poi: string;
    destination_poi: string;
    distance_km: number;
  };
  product_details: {
    product_name: string;
    quantity: number;
    uom: string;
    weight_tonnage: number;
  };
  delivery_date: Date;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
  
  // Vehicle Requirements
  required_vehicle_type: string;    // Truck, Covered Van, Container
  required_vehicle_count: number;
  vehicle_capacity_min_kg: number;  // Minimum capacity per vehicle
  
  // Bid Evaluation Criteria
  expected_bid_rate?: number;       // Reference rate (optional, not binding)
  rate_type: 'PER_TRIP' | 'PER_KM';
  min_vendor_rating?: number;       // e.g., 3.5 (5-star scale)
  
  // Vendor Eligibility
  eligible_vendor_ids?: string[];   // If restricted to specific vendors
  blacklisted_vendor_ids?: string[]; // Exclude specific vendors
  
  // Publication Metadata
  published_by: string;             // Transport Planner user ID
  published_at: Date;
  
  // Bidding Status
  bidding_status: BiddingStatus;
}

type BiddingStatus = 
  | 'SCHEDULED'                     // Bidding window not yet open
  | 'OPEN'                          // Accepting bids
  | 'CLOSED'                        // Window closed, no more bids
  | 'AWARDED'                       // Winner selected
  | 'CANCELLED';                    // Bidding cancelled (no award)
```

### Vendor Notification

**Notification Channels:**
- **Email:** "New Bid Available: [Route] - [Product] - [Quantity]"
- **SMS:** "New bid: Dhaka→Chittagong, 20 tons Maize. Submit by [time]. Login: [URL]"
- **Push Notification:** Mobile app alert (if vendor app installed)
- **Vendor Portal:** Badge notification on "Available Bids" tab

**Notification Content:**
```
New Transport Order Available for Bidding

TO ID: TO-2026-00456
Route: Depot A (Dhaka) → Factory B (Chittagong)
Product: Maize (Raw Material)
Quantity: 20 tons (400 bags × 50 kg)
Vehicle Type Required: Covered Van
Vehicle Count: 2 vehicles
Delivery Date: 2026-03-01
Urgency: HIGH

Expected Rate: 15,000 BDT per trip (reference only)
Bidding Window: 2026-02-26 10:00 AM - 2026-02-26 10:00 PM (12 hours)

Submit your bid now: [Portal Link]
```

---

## Bid Submission by Vendor

### Purpose

Vendors submit competitive bids specifying their **rate, vehicle availability, and delivery commitment** within the bidding window.

### Bid Submission Workflow

```
1. Vendor logs into Vendor Portal
2. Vendor navigates to "Available Bids" tab
3. Vendor views open TOs:
   - Filters by route, urgency, product type
   - Clicks on TO to view full details
4. Vendor reviews TO requirements:
   - Route, distance, product, quantity
   - Vehicle type, count
   - Delivery date, urgency
   - Expected rate (if provided)
5. Vendor clicks "Submit Bid"
6. Vendor enters bid details:
   - Bid Rate (per trip or per km)
   - Number of vehicles available
   - Vehicle registration numbers (optional at bid stage)
   - Bid validity period (e.g., 7 days)
   - Additional remarks (optional)
7. System validates:
   - Bidding window still open
   - Vendor not already submitted bid for this TO
   - Bid rate > 0
   - Vehicle count matches TO requirement
8. Vendor confirms and submits
9. System:
   - Stores bid with timestamp
   - Updates TO bid count
   - Notifies TP: "New bid received for TO [ID]"
10. Vendor sees confirmation: "Bid submitted successfully. You'll be notified if selected."
```

### Data Model

```typescript
interface VendorBid {
  bid_id: string;                   // Auto-generated (e.g., BID-2026-00789)
  to_id: string;                    // Transport Order
  vendor_id: string;                // Submitting vendor
  
  // Bid Details
  bid_rate: number;                 // Proposed rate
  rate_type: 'PER_TRIP' | 'PER_KM'; // Matches TO rate type
  bid_currency: 'BDT' | 'USD';      // Default: BDT
  
  // Vehicle Details
  vehicle_count_offered: number;    // Number of vehicles vendor can provide
  vehicle_type_offered: string;     // Must match TO requirement
  vehicle_registrations?: string[]; // Optional: Specific vehicles (can add later if win)
  
  // Availability
  availability_confirmed: boolean;  // Vendor confirms vehicles available
  bid_validity_days: number;        // How long bid is valid (e.g., 7 days)
  earliest_pickup_date?: Date;      // If vendor needs lead time
  
  // Additional Information
  remarks?: string;                 // e.g., "Can start immediately", "Experienced with fragile goods"
  special_conditions?: string;      // e.g., "Require advance payment"
  
  // Submission Details
  submitted_at: Date;               // Timestamp (for sorting, tie-breaking)
  submitted_by: string;             // Vendor user ID
  
  // Bid Status
  status: BidStatus;
  
  // Evaluation & Award
  evaluated_by?: string;            // TP user ID
  evaluated_at?: Date;
  evaluation_score?: number;        // Calculated score (rate + performance)
  award_reason?: string;            // Why this bid won
  rejection_reason?: string;        // Why bid rejected (if not selected)
  
  // Metadata
  tenant_id: string;
}

type BidStatus = 
  | 'SUBMITTED'                     // Bid submitted, awaiting evaluation
  | 'UNDER_REVIEW'                  // TP actively reviewing
  | 'SHORTLISTED'                   // Included in shortlist
  | 'AWARDED'                       // Winning bid
  | 'REJECTED'                      // Not selected
  | 'WITHDRAWN'                     // Vendor withdrew bid
  | 'EXPIRED';                      // Bid validity expired
```

### Bid Validation Rules

**Pre-Submission Validation:**
1. **Bidding Window Open:** Current time between `window_start_time` and `window_end_time`
2. **No Duplicate Bids:** Vendor can only submit **one bid per TO** (no multiple bids from same vendor)
3. **Vendor Eligible:** Vendor status = APPROVED, not blacklisted
4. **Vehicle Type Match:** Offered vehicle type matches TO requirement
5. **Vehicle Count Adequate:** Offered count ≥ required count
6. **Minimum Rating:** Vendor rating ≥ TO's `min_vendor_rating` (if specified)

**Post-Submission Rules:**
- **Bid Immutable:** Once submitted, bid rate and details **cannot be edited** (prevents gaming)
- **Bid Withdrawal:** Vendor can withdraw bid before window closes (penalty: reduced quality score)

---

## Bid Evaluation by Transport Planner

### Purpose

Transport Planners review submitted bids, compare rates and vendor quality, and select the winning bid based on cost, reliability, and service fit.

### Bid Evaluation Workflow

```
1. Bidding window closes (automatic at deadline or manual by TP)
2. TP receives notification: "Bidding closed for TO [ID]. [X] bids received."
3. TP navigates to TO detail page → "Bids" tab
4. TP views submitted bids in table:
   - Vendor name, Bid rate, Vehicle count, Submitted time, Vendor rating, Status
5. TP applies filters/sorting:
   - Sort by rate (lowest first)
   - Filter by vehicle type
   - Filter by vendor rating (≥ 4 stars)
6. TP clicks "Compare Bids" → Side-by-side comparison view
7. TP reviews bid details:
   - Rate comparison (chart showing all bid rates)
   - Vendor performance history (past trips, QC pass rate, on-time delivery)
   - Vehicle availability confirmation
   - Remarks/special conditions
8. TP selects winning bid:
   - Clicks "Award Bid" button on chosen bid
   - Enters award reason (optional): e.g., "Lowest rate + excellent performance history"
9. System:
   - Updates winning bid status → 'AWARDED'
   - Updates other bids status → 'REJECTED'
   - Updates TO status → 'BID_APPROVED'
   - Notifies winning vendor: "Congratulations! Your bid for TO [ID] has been accepted."
   - Notifies losing vendors: "Thank you for bidding. Your bid for TO [ID] was not selected."
10. Winning vendor adds vehicle/driver details (mandatory before trip creation)
11. TP creates Trip from TO
```

### Side-by-Side Bid Comparison

**Comparison Criteria:**

**1. Rate (Primary):**
- Bid rate (per trip or per km)
- Total cost (rate × distance or rate × vehicle count)
- Variance from expected rate (if provided)

**2. Vendor Performance (Secondary):**
- Vendor rating (average from past trips: 1-5 stars)
- Completed trips count
- On-time delivery rate (% of trips delivered on schedule)
- QC pass rate (% of trips without quality issues)
- Cancellation rate (% of trips cancelled by vendor)

**3. Vehicle Availability (Tertiary):**
- Vehicle count offered (meets/exceeds requirement)
- Vehicle type (exact match or better)
- Vehicle registrations provided (reduces uncertainty)

**4. Bid Timing (Tie-Breaker):**
- Submission timestamp (earlier bids preferred if all else equal)

### Bid Evaluation Score (Automated Ranking)

**Purpose:** Assist TP decision by calculating a **composite score** combining rate and performance.

**Formula:**
```typescript
function calculateBidScore(bid: VendorBid, vendor: Vendor): number {
  // Weights (configurable)
  const RATE_WEIGHT = 0.60;         // 60% weight on price
  const PERFORMANCE_WEIGHT = 0.30;  // 30% weight on quality
  const AVAILABILITY_WEIGHT = 0.10; // 10% weight on availability
  
  // Normalize rate (lower is better)
  const minRate = Math.min(...allBids.map(b => b.bid_rate));
  const rateScore = (minRate / bid.bid_rate) * 100; // 100 = lowest rate
  
  // Performance score (from vendor history)
  const performanceScore = (
    (vendor.rating / 5.0) * 40 +                    // 40% from rating
    (vendor.on_time_delivery_rate) * 30 +           // 30% from on-time
    (vendor.qc_pass_rate) * 30                      // 30% from QC pass
  );
  
  // Availability score
  const availabilityScore = (
    (bid.vehicle_count_offered >= requiredCount ? 50 : 0) +
    (bid.vehicle_registrations?.length > 0 ? 50 : 0) // Bonus if vehicles specified
  );
  
  // Composite score
  const totalScore = (
    rateScore * RATE_WEIGHT +
    performanceScore * PERFORMANCE_WEIGHT +
    availabilityScore * AVAILABILITY_WEIGHT
  );
  
  return totalScore; // 0-100 scale
}
```

**Display:**
- Bids ranked by score (highest first)
- TP can override automated ranking (manual selection)

### UI/UX Behavior

**Bid Evaluation Dashboard:**

**Table View:**
| Rank | Vendor | Bid Rate | Total Cost | Vehicle Count | Rating | Score | Actions |
|------|--------|----------|------------|---------------|--------|-------|---------|
| 1 | ABC Transport | 14,500 BDT | 29,000 BDT | 2 | ⭐⭐⭐⭐⭐ (4.8) | 92 | Award, Compare |
| 2 | XYZ Logistics | 15,000 BDT | 30,000 BDT | 2 | ⭐⭐⭐⭐ (4.2) | 88 | Award, Compare |
| 3 | DEF Movers | 16,000 BDT | 32,000 BDT | 3 | ⭐⭐⭐⭐⭐ (4.9) | 85 | Award, Compare |

**Side-by-Side Comparison View:**
- Left panel: Bid 1 details
- Center panel: Bid 2 details
- Right panel: Bid 3 details
- Comparison highlights: Lowest rate (green), Highest rating (gold), Fastest submission (blue)

**Award Modal:**
- "Are you sure you want to award this bid to [Vendor Name]?"
- Award reason (optional text area)
- Checkbox: "Notify losing vendors"
- Buttons: "Confirm Award", "Cancel"

---

## Bid Award & Post-Award Actions

### Award Notification

**Winning Vendor Notification:**
```
Subject: Congratulations! Bid Awarded for TO-2026-00456

Dear [Vendor Name],

Your bid for Transport Order TO-2026-00456 has been accepted!

TO Details:
- Route: Depot A (Dhaka) → Factory B (Chittagong)
- Product: Maize, 20 tons
- Delivery Date: 2026-03-01
- Your Winning Bid: 14,500 BDT per trip

Next Steps:
1. Log in to Vendor Portal
2. Navigate to "Assigned TOs" tab
3. Add vehicle and driver details (mandatory within 2 hours)
4. Await trip creation confirmation

Important: Failure to provide vehicle/driver details within 2 hours may result in bid cancellation and penalty.

[Login to Vendor Portal]
```

**Losing Vendor Notification:**
```
Subject: Bid Result for TO-2026-00456

Dear [Vendor Name],

Thank you for submitting your bid for TO-2026-00456.

After careful evaluation, we regret to inform you that your bid was not selected for this transport order. We encourage you to participate in future bidding opportunities.

Your bid: 16,000 BDT per trip
Winning bid: 14,500 BDT per trip

We appreciate your interest and look forward to working with you on future orders.

[View Other Available Bids]
```

### Post-Award Workflow

```
1. Winning vendor receives award notification
2. Vendor logs into portal → "Assigned TOs" tab
3. Vendor clicks on awarded TO
4. Vendor adds:
   - Vehicle registration number(s)
   - Driver name(s), license number(s), contact(s)
   - Helper name(s) (if applicable)
5. Vendor submits vehicle/driver details
6. System validates:
   - Vehicle(s) exist in vendor profile
   - Driver(s) exist and have valid licenses
   - No conflicting assignments (vehicle/driver not in another active trip)
7. System notifies TP: "Vendor [Name] submitted vehicle/driver details for TO [ID]"
8. TP reviews and creates Trip
9. Trip status → 'ASSIGNED'
10. Vendor receives Trip details in portal and mobile app
```

---

## Bid Closure & Cancellation

### Manual Bid Closure (Before Deadline)

**Use Case:** TP wants to close bidding early (e.g., received sufficient bids, urgency changed).

**Workflow:**
```
1. TP navigates to TO → "Bids" tab
2. TP clicks "Close Bidding Early"
3. System:
   - Updates TO bidding_status → 'CLOSED'
   - Prevents new bid submissions
   - Notifies vendors: "Bidding window closed early for TO [ID]"
4. TP proceeds with bid evaluation
```

### Bid Cancellation (No Award)

**Use Case:** TO cancelled, requirement changed, or no acceptable bids received.

**Workflow:**
```
1. TP cancels TO bidding:
   - Clicks "Cancel Bidding"
   - Enters cancellation reason (required)
2. System:
   - Updates TO bidding_status → 'CANCELLED'
   - Updates all submitted bids status → 'REJECTED' (or 'CANCELLED')
   - Notifies vendors: "Bidding cancelled for TO [ID]. Reason: [...]"
3. TO marked as 'CANCELLED' (no trip created)
```

---

## Bid History & Audit Trail

### Purpose

Maintain complete **audit trail** of all bidding activities for compliance, dispute resolution, and performance analysis.

### Bid History Tracking

```typescript
interface BidAuditLog {
  log_id: string;
  to_id: string;
  bid_id?: string;
  
  // Event Details
  event_type: BidEventType;
  event_description: string;
  performed_by: string;             // User ID (vendor or TP)
  performed_at: Date;
  
  // Event Data
  event_data?: {
    old_value?: any;
    new_value?: any;
  };
  
  // Metadata
  ip_address?: string;
  user_agent?: string;
}

type BidEventType = 
  | 'TO_PUBLISHED_FOR_BIDDING'
  | 'BIDDING_WINDOW_OPENED'
  | 'BIDDING_WINDOW_CLOSED'
  | 'BID_SUBMITTED'
  | 'BID_WITHDRAWN'
  | 'BID_EVALUATED'
  | 'BID_AWARDED'
  | 'BID_REJECTED'
  | 'BIDDING_CANCELLED';
```

### Bid Winning Log

**Purpose:** Track which vendor won, at what rate, and when, for financial reconciliation and performance benchmarking.

```typescript
interface BidWinningLog {
  log_id: string;
  to_id: string;
  bid_id: string;
  vendor_id: string;
  
  // Award Details
  winning_bid_rate: number;
  rate_type: 'PER_TRIP' | 'PER_KM';
  total_cost: number;               // Calculated final cost
  
  // Evaluation Context
  total_bids_received: number;
  lowest_bid_rate: number;
  highest_bid_rate: number;
  average_bid_rate: number;
  
  // Award Decision
  awarded_by: string;               // TP user ID
  awarded_at: Date;
  award_reason?: string;
  
  // Performance Tracking
  vendor_rating_at_award: number;   // Vendor rating when bid won
  vendor_completed_trips_count: number; // Historical performance
  
  // Metadata
  tenant_id: string;
}
```

---

## Integration Points

### Upstream: Transport Order (TO) Management

**TO Creation → Bidding Publication:**
- TO allocation strategy = 'VENDOR_BIDDING' → TO published for bidding
- Bidding parameters configured by TP

### Downstream: Trip Management

**Bid Award → Trip Creation:**
- Winning vendor adds vehicle/driver details → TP creates Trip
- Trip inherits TO and bid details (vendor, rate)

### Lateral: Vendor Performance Tracking

**Bid Evaluation → Performance History:**
- Vendor rating, on-time rate, QC pass rate used in bid evaluation
- Winning vendor's performance tracked post-trip completion

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily TOs published for bidding:** 10-30 TOs
- **Average bids per TO:** 3-8 vendors
- **Bid evaluation time:** 1-4 hours (TP review + award)

### Query Optimization

```sql
-- Open Bids (vendor view)
CREATE INDEX idx_to_bidding_status ON transport_orders(bidding_status, window_end_time DESC)
WHERE bidding_status = 'OPEN';

-- Bids by TO (TP evaluation)
CREATE INDEX idx_bid_to_id ON vendor_bids(to_id, bid_rate ASC, submitted_at ASC);

-- Bid History (audit)
CREATE INDEX idx_bid_audit_log ON bid_audit_logs(to_id, performed_at DESC);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** Vendors can only view/bid on TOs from own tenant
- **Bid Confidentiality:** Vendors **cannot see other vendors' bid rates** (blind bidding)
- **TP Access:** Transport Planners can view all bids for evaluation

### Audit Requirements

**Mandatory Audit Events:**
- TO publication for bidding
- Bid submission
- Bid evaluation
- Bid award
- Bidding cancellation

---

## Key Design Decisions

### Why Blind Bidding?

**Rationale:**
- Prevents bid collusion (vendors can't see competitors' rates)
- Ensures genuine competitive pricing
- Protects vendor confidentiality

### Why Immutable Bids?

**Rationale:**
- Prevents gaming (vendors can't adjust bids after seeing others)
- Ensures fairness (all vendors compete on equal terms)
- Simplifies evaluation (TP compares static bids)

### Why Track Bid Winning Log?

**Rationale:**
- Financial audit trail (billing reconciliation)
- Performance benchmarking (compare rates over time)
- Vendor performance tracking (win rate, cost trends)

---

## Related User Stories

- **US-070:** TO Publication for Bidding
- **US-071:** Vendor Bid Submission
- **US-072:** Bid Evaluation by TP
- **US-073:** Bid Award & Notification
- **US-074:** Bid History & Audit Log

---

## Summary

Vendor Bidding System is the **competitive procurement layer** that provides:

- **Transparent Bid Publication:** TPs publish TOs with clear requirements and deadlines
- **Structured Bid Submission:** Vendors submit competitive rates with vehicle availability
- **Side-by-Side Evaluation:** TPs compare bids based on rate, performance, and availability
- **Automated Ranking:** Composite score calculation assists TP decision
- **Blind Bidding:** Vendors cannot see competitors' rates (fairness)
- **Immutable Bids:** Once submitted, bids cannot be edited (prevents gaming)
- **Award Notifications:** Winning and losing vendors notified promptly
- **Audit Trail:** Complete bid history for compliance and analysis

Vendor Bidding System enables cost-effective, transparent, and fair vendor selection, optimizing transport costs while maintaining service quality.
