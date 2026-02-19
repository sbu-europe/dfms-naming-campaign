---
title: QC Dashboard & Analytics
story_id: US-050
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
epic: QC Analytics
sprint: Sprint 15
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-operations-support/qc-workflow.md
related_stories:
  - US-044-qc-lab-testing.md
  - US-047-qc-pass-fail-decision.md
dependencies:
  - US-047-qc-pass-fail-decision.md
tags: [qc, dashboard, analytics, medium-priority]
---

# US-050: QC Dashboard & Analytics

## User Story

**As a** QC Manager  
**I want to** view QC dashboard with analytics  
**So that** I can monitor quality trends and make data-driven decisions

## Business Context

QC dashboard provides:
- **Real-time Monitoring**: Current QC status
- **Trend Analysis**: Quality trends over time
- **Performance Tracking**: QC team performance
- **Issue Identification**: Recurring quality issues

---

## Acceptance Criteria

### AC-1: Dashboard Overview
- [ ] System SHALL display QC dashboard showing:
  - Pending QC tests
  - Tests in progress
  - Completed tests (today)
  - Pass rate (today, week, month)
  - Rejection rate
  - Top failure reasons

### AC-2: Quality Metrics
- [ ] System SHALL calculate and display:
  - Overall pass rate
  - Pass rate by product
  - Pass rate by vendor
  - Pass rate by source location
  - Average test turnaround time
  - Rejection trend

### AC-3: Trend Charts
- [ ] System SHALL display charts:
  - Pass/fail trend (line chart)
  - Failure reasons (pie chart)
  - Product-wise quality (bar chart)
  - Vendor-wise quality (bar chart)

### AC-4: Alerts & Notifications
- [ ] System SHALL highlight:
  - Declining quality trends
  - High rejection rates
  - Overdue tests
  - Pending approvals

---

## Functional Requirements

### FR-001: Dashboard UI
- [Critical] Real-time metrics display
- [High] Interactive charts
- [High] Date range filtering
- [Medium] Export to Excel/PDF

### FR-002: Analytics Engine
- [High] Metric calculations
- [High] Trend analysis
- [Medium] Predictive analytics (future)

---

## Business Rules

### BR-DASH-001: Pass Rate Calculation
- Pass Rate = (Passed Tests / Total Tests) × 100
- **Enforcement**: Formula

---

## Data Model

```typescript
QCMetrics {
  id: UUID (PK)
  date: Date
  
  total_tests: Integer
  passed_tests: Integer
  failed_tests: Integer
  pass_rate_percentage: Decimal
  
  avg_turnaround_time_hours: Decimal
  
  calculated_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌──────────────────────────────────────────────────────────────┐
│ QC Dashboard                                                 │
├──────────────────────────────────────────────────────────────┤
│ ┌─ Today's Summary ────────────────────────────────────────┐ │
│ │ Pending: 5  │  In Progress: 3  │  Completed: 12         │ │
│ │ Pass Rate: 92% (11/12)  │  Rejection Rate: 8% (1/12)    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Pass Rate Trend (Last 30 Days) ─────────────────────────┐ │
│ │ [Line chart showing pass rate over time]                 │ │
│ │ 95% ─────────────────────────────────────────            │ │
│ │ 90% ─────────────────────────────                        │ │
│ │ 85% ─────────────────                                    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Top Failure Reasons ────────────────────────────────────┐ │
│ │ [Pie chart]                                              │ │
│ │ • Appearance Issues: 40%                                 │ │
│ │ • Weight Variance: 30%                                   │ │
│ │ • Health Issues: 20%                                     │ │
│ │ • Other: 10%                                             │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
GET /api/v1/qc/dashboard
Query: ?date_from=2026-01-01&date_to=2026-02-11

GET /api/v1/qc/metrics
Query: ?period=last_30_days

GET /api/v1/qc/trends
Query: ?metric=pass_rate&period=last_90_days
```

---

## Testing Scenarios

### Happy Path
1. Open dashboard → Metrics displayed
2. Filter by date → Charts updated
3. Export report → Excel downloaded

---

## Dependencies

### Prerequisites
- ✅ US-047: QC Pass/Fail Decision

### Enables
- → Quality monitoring
- → Data-driven decisions

---

## Definition of Done
- [ ] Dashboard UI functional
- [ ] Metrics calculation accurate
- [ ] Charts displaying correctly
- [ ] Date filtering working
- [ ] Export functionality
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 15  
**Priority**: Medium

