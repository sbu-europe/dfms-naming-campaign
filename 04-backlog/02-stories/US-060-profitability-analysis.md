---
title: Trip Profitability Analysis & Revenue Tracking
story_id: US-060
phase: phase-1
module: Trip Costing
priority: Medium
status: Pending
epic: Financial Management
epic_id: EPIC-006
epic_name: Fleet & Vehicle Management
sprint: Sprint 17
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/03-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-059-trip-cost-calculation.md
dependencies:
  - US-059-trip-cost-calculation.md
tags: [costing, profitability, revenue, medium-priority]
---

# US-060: Trip Profitability Analysis & Revenue Tracking

## User Story

**As a** Finance Manager  
**I want to** analyze trip profitability  
**So that** I can identify profitable routes and optimize pricing

## Business Context

Profitability analysis enables:
- **Revenue Tracking**: Monitor income per trip
- **Profit Margin**: Calculate profit/loss per trip
- **Route Optimization**: Identify most profitable routes
- **Pricing Strategy**: Set competitive yet profitable rates
- **Business Decisions**: Data-driven strategic planning

**Profitability Formula**:
```
Revenue = Customer Payment
Cost = Total Trip Cost (from US-059)
Profit = Revenue - Cost
Margin % = (Profit / Revenue) × 100
```

---

## Acceptance Criteria

### AC-1: Revenue Recording
- [ ] System SHALL allow recording trip revenue:
  - Customer/client
  - Revenue amount
  - Revenue type (per trip, per km, per kg)
  - Invoice reference
  - Payment status
- [ ] System SHALL link revenue to trip

### AC-2: Profitability Calculation
- [ ] System SHALL auto-calculate:
  - Revenue
  - Cost (from US-059)
  - Profit/Loss
  - Profit margin %
- [ ] System SHALL classify trips:
  - Highly Profitable (margin > 20%)
  - Profitable (margin 10-20%)
  - Break-even (margin 0-10%)
  - Loss-making (margin < 0%)

### AC-3: Profitability Dashboard
- [ ] System SHALL display dashboard showing:
  - Total revenue (period)
  - Total cost (period)
  - Total profit (period)
  - Average profit margin
  - Profitable vs loss-making trips count
  - Top profitable routes
  - Top loss-making routes

### AC-4: Route Profitability Analysis
- [ ] System SHALL analyze profitability by:
  - Route (source-destination pair)
  - Product type
  - Vehicle type
  - Fleet type (own vs vendor)
  - Customer
- [ ] System SHALL show average profit margin per category

### AC-5: Profitability Reports
- [ ] System SHALL generate reports:
  - Trip-wise profitability
  - Route-wise profitability
  - Customer-wise profitability
  - Period comparison (month-over-month)
  - Profitability trends

---

## Functional Requirements

### FR-001: Revenue Management
- [Critical] Revenue recording
- [High] Invoice integration
- [Medium] Payment tracking

### FR-002: Profitability Analytics
- [Critical] Profit calculation
- [High] Margin analysis
- [High] Route profitability
- [Medium] Predictive profitability

### FR-003: Reporting
- [High] Standard profitability reports
- [High] Trend analysis
- [Medium] Benchmarking

---

## Business Rules

### BR-PROFIT-001: Profitability Classification
- Highly Profitable: margin > 20%
- Profitable: margin 10-20%
- Break-even: margin 0-10%
- Loss-making: margin < 0%
- **Enforcement**: Classification logic

### BR-PROFIT-002: Loss Alert
- Alert if route consistently loss-making (> 3 consecutive trips)
- **Enforcement**: Alert trigger

---

## Data Model

```typescript
TripRevenue {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  customer_name: String
  revenue_amount: Decimal
  revenue_type: Enum (Per_Trip, Per_KM, Per_KG)
  
  invoice_number: String (nullable)
  payment_status: Enum (Pending, Paid, Overdue)
  
  recorded_by: UUID (FK to User)
  recorded_at: Timestamp
}

TripProfitability {
  id: UUID (PK)
  trip_id: UUID (FK)
  
  revenue: Decimal
  cost: Decimal (from TripCost)
  profit: Decimal (computed)
  profit_margin_percentage: Decimal (computed)
  
  profitability_classification: Enum (
    Highly_Profitable,
    Profitable,
    Break_Even,
    Loss_Making
  )
  
  calculated_at: Timestamp
}

RouteProfitability {
  id: UUID (PK)
  source_poi_id: UUID (FK)
  destination_poi_id: UUID (FK)
  
  period_start: Date
  period_end: Date
  
  total_trips: Integer
  total_revenue: Decimal
  total_cost: Decimal
  total_profit: Decimal
  avg_profit_margin_percentage: Decimal
  
  profitable_trips_count: Integer
  loss_making_trips_count: Integer
  
  calculated_at: Timestamp
}
```

---

## UI/UX Requirements

### Profitability Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Profitability Dashboard (February 2026)                      │
├──────────────────────────────────────────────────────────────┤
│ FINANCIAL SUMMARY:                                           │
│ Revenue:  BDT 500,000  │  Cost: BDT 400,000  │  Profit: 100K│
│ Profit Margin: 20% ✅                                        │
│                                                              │
│ TRIP BREAKDOWN:                                              │
│ • Highly Profitable: 45 trips (38%)                          │
│ • Profitable: 50 trips (42%)                                 │
│ • Break-even: 15 trips (13%)                                 │
│ • Loss-making: 10 trips (8%) ⚠️                              │
│                                                              │
│ TOP PROFITABLE ROUTES:                                       │
│ Route                    Trips  Avg Margin  Total Profit    │
│ ──────────────────────────────────────────────────────────  │
│ Bhaluka → Mirpur         25     25%         BDT 50,000      │
│ Chittagong → Dhaka       15     22%         BDT 35,000      │
│                                                              │
│ LOSS-MAKING ROUTES: ⚠️                                       │
│ Gazipur → Sylhet         5      -5%         BDT -5,000      │
│                                                              │
│ [View Detailed Report] [Export to Excel]                     │
└──────────────────────────────────────────────────────────────┘
```

### Trip Profitability Detail
```
┌─────────────────────────────────────────┐
│ Trip Profitability: TRIP-20260211-0042  │
├─────────────────────────────────────────┤
│ Route: Bhaluka → Mirpur                 │
│ Customer: ABC Company                   │
│                                         │
│ FINANCIAL BREAKDOWN:                    │
│ Revenue:      BDT 2,500                 │
│ Cost:         BDT 2,008                 │
│ ─────────────────────────              │
│ Profit:       BDT 492 ✅                │
│ Margin:       19.7% (Profitable)        │
│                                         │
│ Classification: 🟢 Profitable           │
│                                         │
│ [View Cost Breakdown] [View Invoice]    │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Record revenue
POST /api/v1/trip-revenue
Body: {
  trip_id, customer_name, revenue_amount,
  revenue_type, invoice_number?
}

// Calculate profitability
POST /api/v1/trip-profitability/calculate
Body: {trip_id}
Response: {profitability, profit, margin}

// Get profitability dashboard
GET /api/v1/profitability/dashboard
Query: ?period=last_30_days

// Get route profitability
GET /api/v1/profitability/routes
Query: ?date_from=2026-01-01&date_to=2026-02-11

// Get profitability reports
GET /api/v1/profitability/reports
Query: ?report_type=route_wise&format=pdf
```

---

## Testing Scenarios

### Happy Path
1. Record revenue → Revenue saved
2. Calculate profitability → Profit = 492, Margin = 19.7%
3. View dashboard → Metrics displayed

### Edge Cases
1. **Loss-making trip**: Flagged, alert sent
2. **Route consistently unprofitable**: Alert to review pricing

---

## Dependencies

### Prerequisites
- ✅ US-059: Trip Cost Calculation

### Enables
- → Pricing optimization
- → Route planning
- → Business strategy

---

## Definition of Done
- [ ] Revenue recording functional
- [ ] Profitability calculation accurate
- [ ] Dashboard display working
- [ ] Route profitability analysis
- [ ] Reports generation
- [ ] Loss alerts triggered
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 17  
**Priority**: Medium

