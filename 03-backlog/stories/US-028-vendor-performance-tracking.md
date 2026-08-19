---
title: Vendor Performance Tracking & Metrics
story_id: US-028
phase: phase-1
module: Vendor Management
priority: High
status: Pending
epic: Vendor Management
epic_id: EPIC-010
epic_name: Vendor Management
sprint: Sprint 8
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../05-modules/05-vendor-management/vendor-onboarding.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-027-vendor-registration-verification.md
  - US-032-vendor-rating-reviews.md
dependencies:
  - US-027-vendor-registration-verification.md
  - US-021-trip-lifecycle.md
tags: [vendor, performance, metrics, kpi, high-priority]
---

# US-028: Vendor Performance Tracking & Metrics

## User Story

**As a** Vendor Manager  
**I want to** track vendor performance metrics automatically  
**So that** I can identify top performers, address issues, and make data-driven vendor selection decisions

## Business Context

Performance tracking enables:
- **Objective Evaluation**: Data-driven vendor assessment
- **Quality Improvement**: Identify and address performance issues
- **Vendor Incentives**: Reward top performers
- **Risk Management**: Early warning for poor performance
- **Contract Decisions**: Inform renewal/termination decisions

**Key Performance Indicators (KPIs)**:
1. On-Time Delivery Rate
2. Trip Completion Rate
3. Incident Rate
4. Customer Rating
5. Response Time (bid acknowledgment)
6. Cost Competitiveness
7. Compliance Score

---

## Acceptance Criteria

### AC-1: Automatic Performance Calculation
- [ ] System SHALL automatically calculate vendor KPIs:
  - **On-Time Delivery Rate**: % of trips delivered on time
  - **Trip Completion Rate**: % of trips completed vs assigned
  - **Incident Rate**: Incidents per 100 trips
  - **Average Rating**: From customer/driver ratings
  - **Bid Response Time**: Avg time to respond to bids
  - **Cost Index**: Vendor cost vs market average
  - **Compliance Score**: Document validity, policy adherence
- [ ] System SHALL update KPIs in real-time after each trip
- [ ] System SHALL calculate KPIs for different time periods:
  - Last 7 days, Last 30 days, Last 90 days, All time

### AC-2: Performance Dashboard
- [ ] System SHALL display vendor performance dashboard showing:
  - Overall performance score (0-100)
  - Individual KPI scores
  - Trend graphs (improving/declining)
  - Comparison with average vendor performance
  - Performance tier (Excellent, Good, Average, Poor)
- [ ] System SHALL allow filtering by:
  - Time period
  - Route
  - Product type

### AC-3: Performance Alerts
- [ ] System SHALL trigger alerts when:
  - On-time delivery rate < 80%
  - Incident rate > 5 per 100 trips
  - Average rating < 3.5/5
  - Compliance score < 70%
- [ ] System SHALL notify Vendor Manager
- [ ] System SHALL send warning to vendor

### AC-4: Performance Tiers
- [ ] System SHALL classify vendors into performance tiers:
  - **Platinum** (90-100): Top performers
  - **Gold** (80-89): Good performers
  - **Silver** (70-79): Average performers
  - **Bronze** (60-69): Below average
  - **Probation** (< 60): Poor performers
- [ ] System SHALL display tier badge on vendor profile
- [ ] System SHALL adjust tier monthly based on rolling 90-day performance

### AC-5: Performance History
- [ ] System SHALL maintain historical performance data
- [ ] System SHALL display performance trends over time
- [ ] System SHALL allow comparing vendor performance
- [ ] System SHALL export performance reports (PDF/Excel)

---

## Functional Requirements

### FR-001: KPI Calculation Engine
- [Critical] Automated KPI calculation after each trip
- [Critical] Real-time performance score updates
- [High] Configurable KPI weights
- [Medium] Predictive performance analytics (ML)

### FR-002: Performance Dashboard
- [High] Vendor-specific performance dashboard
- [High] Comparative analytics (vendor vs average)
- [Medium] Performance trend visualization
- [Medium] Drill-down to trip-level details

### FR-003: Alert System
- [High] Configurable performance thresholds
- [High] Multi-channel alerts (email, SMS, in-app)
- [Medium] Escalation workflow

---

## Business Rules

### BR-PERF-001: On-Time Delivery Definition
- On-time if delivered within planned time + 30 min buffer
- **Enforcement**: Timestamp comparison

### BR-PERF-002: Minimum Trips for Tier
- Vendor must complete minimum 10 trips for tier classification
- **Enforcement**: Trip count check

### BR-PERF-003: Performance Score Calculation
- Overall Score = Weighted average of KPIs
- Default weights: On-time (30%), Completion (25%), Rating (20%), Incident (15%), Compliance (10%)
- **Enforcement**: Calculation formula

### BR-PERF-004: Probation Period
- Vendors on Probation tier for 2 consecutive months → Review for blacklist
- **Enforcement**: Tier history check

---

## Data Model

```typescript
VendorPerformance {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  // KPIs
  on_time_delivery_rate: Decimal (percentage)
  trip_completion_rate: Decimal (percentage)
  incident_rate: Decimal (per 100 trips)
  average_rating: Decimal (out of 5)
  avg_bid_response_time_minutes: Integer
  cost_index: Decimal (100 = market average)
  compliance_score: Decimal (percentage)
  
  // Aggregate metrics
  total_trips_assigned: Integer
  total_trips_completed: Integer
  total_trips_on_time: Integer
  total_incidents: Integer
  
  // Overall performance
  overall_performance_score: Decimal (0-100)
  performance_tier: Enum (Platinum, Gold, Silver, Bronze, Probation)
  
  // Time period
  period_start: Date
  period_end: Date
  period_type: Enum (Weekly, Monthly, Quarterly, All_Time)
  
  calculated_at: Timestamp
}

VendorPerformanceAlert {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  alert_type: Enum (
    Low_OnTime_Rate,
    High_Incident_Rate,
    Low_Rating,
    Low_Compliance
  )
  
  kpi_name: String
  current_value: Decimal
  threshold_value: Decimal
  severity: Enum (Warning, Critical)
  
  triggered_at: Timestamp
  acknowledged_at: Timestamp (nullable)
  resolved_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

### Vendor Performance Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Vendor Performance: ABC Logistics            🏆 Gold Tier    │
├──────────────────────────────────────────────────────────────┤
│ Overall Score: 85/100                        Period: Last 90d│
│ ████████████████████░░░░░░░░░                                │
│                                                              │
│ ┌─ Key Performance Indicators ───────────────────────────┐  │
│ │ On-Time Delivery:  88% ████████████████████░░  Target: 90%│
│ │ Trip Completion:   95% ███████████████████████ ✅         │
│ │ Incident Rate:     2.5 per 100 trips ✅                   │
│ │ Average Rating:    4.2/5 ⭐⭐⭐⭐                          │
│ │ Response Time:     45 min ✅                              │
│ │ Cost Index:        98 (2% below market) ✅                │
│ │ Compliance:        92% ████████████████████░░ ✅          │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ ┌─ Performance Trend ─────────────────────────────────────┐  │
│ │ [Line graph showing score over time]                    │  │
│ │ 85 ─────────────────────────────────────────            │  │
│ │ 80 ─────────────────────────────                        │  │
│ │ 75 ─────────────────                                    │  │
│ │    Jan    Feb    Mar    (Improving ↗)                   │  │
│ └────────────────────────────────────────────────────────┘  │
│                                                              │
│ Trip Statistics:                                             │
│ • Total Trips: 120                                           │
│ • Completed: 114 (95%)                                       │
│ • On-Time: 100 (88%)                                         │
│ • Incidents: 3                                               │
│                                                              │
│ [View Detailed Report] [Compare with Others] [Export PDF]   │
└──────────────────────────────────────────────────────────────┘
```

### Performance Alert
```
┌─────────────────────────────────────────┐
│ ⚠️ Performance Alert                    │
├─────────────────────────────────────────┤
│ Vendor: XYZ Transport                   │
│                                         │
│ Alert: Low On-Time Delivery Rate        │
│ Current: 75%                            │
│ Threshold: 80%                          │
│ Severity: Warning                       │
│                                         │
│ Triggered: Feb 11, 2026                 │
│                                         │
│ Recent Issues:                          │
│ • 5 delayed trips in last 7 days        │
│ • Average delay: 2 hours                │
│                                         │
│ Recommended Actions:                    │
│ • Contact vendor to discuss issues      │
│ • Review trip assignments               │
│ • Consider probation if persists        │
│                                         │
│ [Contact Vendor] [View Details] [Dismiss]│
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get vendor performance
GET /api/v1/vendors/{vendor_id}/performance
Query: ?period=last_90_days

// Calculate performance (triggered after trip completion)
POST /api/v1/vendors/{vendor_id}/calculate-performance

// Get performance alerts
GET /api/v1/vendor-performance/alerts
Query: ?severity=Critical&status=Active

// Acknowledge alert
POST /api/v1/vendor-performance/alerts/{alert_id}/acknowledge

// Get performance comparison
GET /api/v1/vendor-performance/comparison
Query: ?vendor_ids=uuid1,uuid2,uuid3

// Export performance report
GET /api/v1/vendors/{vendor_id}/performance/export
Query: ?format=pdf&period=last_90_days
Response: PDF file
```

---

## Testing Scenarios

### Happy Path
1. Trip completed on-time → KPIs updated, score increases
2. Vendor maintains 85% score → Gold tier maintained
3. Performance improves → Tier upgraded

### Edge Cases
1. **First trip**: Insufficient data for tier classification
2. **Score drops below 60%**: Alert triggered, probation tier
3. **No trips in 30 days**: Mark as "Inactive", exclude from tier

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration
- ✅ US-021: Trip Lifecycle (trip completion data)

### Enables
- → US-032: Vendor Rating & Reviews
- → Vendor selection optimization

---

## Definition of Done
- [ ] KPI calculation engine functional
- [ ] Performance dashboard working
- [ ] Tier classification accurate
- [ ] Performance alerts triggered
- [ ] Trend visualization working
- [ ] Export functionality
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 8  
**Priority**: High

