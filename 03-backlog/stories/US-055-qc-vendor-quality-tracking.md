---
title: QC Vendor Quality Tracking
story_id: US-055
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
epic: Quality Control & Quality Assurance Workflow
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
sprint: Sprint 16
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/04-poi-operations/qc-workflow.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-028-vendor-performance-tracking.md
  - US-050-qc-dashboard.md
dependencies:
  - _wbs-temp/US-047-qc-pass-fail-decision.md
tags: [qc, vendor, quality-tracking, medium-priority]
---

# US-055: QC Vendor Quality Tracking

## User Story

**As a** QC Manager  
**I want to** track quality performance by vendor  
**So that** vendor quality issues can be identified and addressed

## Business Context

Vendor quality tracking enables:
- **Vendor Accountability**: Hold vendors responsible for quality
- **Vendor Selection**: Choose vendors with better quality records
- **Quality Improvement**: Work with vendors to improve quality
- **Contract Decisions**: Inform vendor contract renewals

---

## Acceptance Criteria

### AC-1: Vendor Quality Metrics
- [ ] System SHALL calculate per vendor:
  - QC pass rate
  - QC fail rate
  - Common failure reasons
  - Quality trend (improving/declining)
  - Number of rejections
  - Financial impact of rejections

### AC-2: Vendor Quality Dashboard
- [ ] System SHALL display vendor quality dashboard
- [ ] System SHALL show:
  - Vendor ranking by quality
  - Quality comparison chart
  - Failure reason breakdown per vendor
  - Quality trend over time

### AC-3: Quality Alerts
- [ ] System SHALL trigger alerts when:
  - Vendor quality drops below threshold (< 80%)
  - Repeated failures for same reason
  - High rejection rate (> 10%)
- [ ] System SHALL notify Vendor Manager

### AC-4: Quality Reports
- [ ] System SHALL generate vendor quality reports
- [ ] System SHALL allow sharing reports with vendors

---

## Functional Requirements

### FR-001: Vendor Quality Analytics
- [Critical] Quality metrics calculation per vendor
- [High] Trend analysis
- [High] Comparative analytics
- [Medium] Predictive quality scoring

---

## Business Rules

### BR-VEND-QC-001: Quality Threshold
- Vendor quality < 80% triggers alert
- **Enforcement**: Threshold check

---

## Data Model

```typescript
VendorQualityMetrics {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  period_start: Date
  period_end: Date
  
  total_qc_tests: Integer
  passed_tests: Integer
  failed_tests: Integer
  qc_pass_rate_percentage: Decimal
  
  common_failure_reasons: JSON
  total_rejections: Integer
  financial_impact_rejections: Decimal
  
  quality_trend: Enum (Improving, Stable, Declining)
  
  calculated_at: Timestamp
}
```

---

## UI/UX Requirements

```
┌──────────────────────────────────────────────────────────────┐
│ Vendor Quality Dashboard                                     │
├──────────────────────────────────────────────────────────────┤
│ Vendor Rankings (Last 90 Days):                              │
│                                                              │
│ 1. ABC Logistics      QC Pass Rate: 98% ✅ (49/50 tests)    │
│ 2. XYZ Transport      QC Pass Rate: 95% ✅ (38/40 tests)    │
│ 3. DEF Carriers       QC Pass Rate: 85% ⚠️ (34/40 tests)    │
│ 4. GHI Logistics      QC Pass Rate: 75% 🔴 (30/40 tests)    │
│                                                              │
│ ⚠️ Alert: GHI Logistics quality below 80% threshold          │
│                                                              │
│ [View Detailed Report] [Share with Vendors]                  │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
GET /api/v1/vendors/{vendor_id}/quality-metrics
Query: ?period=last_90_days

GET /api/v1/qc/vendor-quality-dashboard
Query: ?date_from=2026-01-01&date_to=2026-02-11

GET /api/v1/qc/vendor-quality-alerts
Response: {alerts: [...]}
```

---

## Testing Scenarios

### Happy Path
1. Calculate vendor metrics → Metrics displayed
2. Quality drops → Alert triggered
3. Generate report → PDF created

---

## Dependencies

### Prerequisites
- ✅ US-047: QC Pass/Fail Decision

### Enables
- → US-028: Vendor Performance Tracking (quality component)

---

## Definition of Done
- [ ] Vendor quality metrics calculation
- [ ] Dashboard functional
- [ ] Alerts triggered
- [ ] Reports generated
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 16  
**Priority**: Medium

