---
title: Vendor Rating & Reviews
story_id: US-032
phase: phase-1
module: Vendor Management
priority: Medium
status: Pending
epic: Vendor Performance
epic_id: EPIC-008
epic_name: Distribution & Procurement Management
sprint: Sprint 10
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-028-vendor-performance-tracking.md
dependencies:
  - US-025-trip-closure-pod.md
tags: [vendor, rating, reviews, feedback, medium-priority]
---

# US-032: Vendor Rating & Reviews

## User Story

**As a** TDO / Driver  
**I want to** rate and review vendor performance after trip completion  
**So that** vendor quality is tracked and future assignments are optimized

## Business Context

Rating system enables:
- **Quality Feedback**: Capture service quality
- **Vendor Improvement**: Identify areas for improvement
- **Selection Optimization**: Prioritize high-rated vendors
- **Accountability**: Transparent performance tracking

**Rating Criteria**:
- Vehicle condition
- Driver behavior
- Timeliness
- Communication
- Overall service

---

## Acceptance Criteria

### AC-1: Rating Submission
- [ ] System SHALL allow rating vendor after trip completion
- [ ] System SHALL capture:
  - Overall rating (1-5 stars) *
  - Vehicle condition (1-5 stars)
  - Driver behavior (1-5 stars)
  - Timeliness (1-5 stars)
  - Communication (1-5 stars)
  - Written review (optional)
- [ ] System SHALL allow rating by TDO or Driver
- [ ] System SHALL allow one rating per trip

### AC-2: Rating Display
- [ ] System SHALL display average rating on vendor profile
- [ ] System SHALL show rating breakdown by criteria
- [ ] System SHALL display recent reviews
- [ ] System SHALL calculate rating from last 90 days

### AC-3: Review Moderation
- [ ] System SHALL allow vendor to respond to reviews
- [ ] System SHALL flag inappropriate reviews for moderation
- [ ] System SHALL allow admin to hide/delete reviews

---

## Functional Requirements

### FR-001: Rating Form
- [Critical] Star rating interface
- [High] Review text field
- [Medium] Photo upload (optional)

### FR-002: Rating Analytics
- [High] Average rating calculation
- [High] Rating trends over time
- [Medium] Sentiment analysis (future)

---

## Business Rules

### BR-RATE-001: One Rating Per Trip
- Each trip can be rated only once
- **Enforcement**: Unique constraint (trip_id)

### BR-RATE-002: Rating Window
- Rating can be submitted within 7 days of trip completion
- **Enforcement**: Date validation

---

## Data Model

```typescript
VendorRating {
  id: UUID (PK)
  vendor_id: UUID (FK)
  trip_id: UUID (FK)
  
  overall_rating: Integer (1-5)
  vehicle_condition_rating: Integer (1-5)
  driver_behavior_rating: Integer (1-5)
  timeliness_rating: Integer (1-5)
  communication_rating: Integer (1-5)
  
  review_text: Text (nullable)
  photos: JSON (nullable)
  
  rated_by: UUID (FK to User)
  rated_at: Timestamp
  
  vendor_response: Text (nullable)
  vendor_responded_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

### Rating Form
```
┌─────────────────────────────────────────┐
│ Rate Vendor: ABC Logistics              │
│ Trip: TRIP-20260211-0042                │
├─────────────────────────────────────────┤
│ Overall Rating: *                       │
│ ⭐⭐⭐⭐⭐                                │
│                                         │
│ Vehicle Condition:                      │
│ ⭐⭐⭐⭐☆                                │
│                                         │
│ Driver Behavior:                        │
│ ⭐⭐⭐⭐⭐                                │
│                                         │
│ Timeliness:                             │
│ ⭐⭐⭐⭐☆                                │
│                                         │
│ Communication:                          │
│ ⭐⭐⭐⭐⭐                                │
│                                         │
│ Review: (optional)                      │
│ ┌─────────────────────────────────────┐ │
│ │ Excellent service, on-time delivery │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]              [Submit Rating]   │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/vendors/{vendor_id}/ratings
Body: {
  trip_id, overall_rating,
  vehicle_condition_rating, driver_behavior_rating,
  timeliness_rating, communication_rating,
  review_text?
}

GET /api/v1/vendors/{vendor_id}/ratings
Query: ?period=last_90_days
```

---

## Testing Scenarios

### Happy Path
1. Trip completed → Rating form shown
2. TDO submits rating → Rating saved
3. Vendor views rating → Average updated

### Edge Cases
1. **Rating after 7 days**: Not allowed
2. **Duplicate rating**: Prevented

---

## Dependencies

### Prerequisites
- ✅ US-025: Trip Closure with POD

### Enables
- → US-028: Vendor Performance Tracking

---

## Definition of Done
- [ ] Rating form functional
- [ ] Average rating calculation
- [ ] Rating display on vendor profile
- [ ] Vendor response capability
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 10  
**Priority**: Medium

