---
title: Incident Management
story_id: US-023
phase: phase-1
module: Transport Management
priority: High
status: Pending
epic: Transport Order Management
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 6
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../05-modules/03-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-021-trip-lifecycle.md
  - US-052-driver-mobile-interface.md
dependencies:
  - US-021-trip-lifecycle.md
tags: [transport, incident, trip, high-priority]
---

# US-023: Incident Management

## User Story

**As a** Driver / Command Center Operator  
**I want to** report and track incidents during trip execution  
**So that** issues are documented, resolved quickly, and don't impact future operations

## Business Context

**Incident Types**:
- Vehicle Breakdown
- Accident
- Product Damage
- Theft/Security Issue
- Route Blockage
- Delay (> 2 hours)
- Weather/Natural Disaster
- Driver Health Issue

**Incident Impact**:
- Trip delays
- Product loss
- Vehicle damage
- Insurance claims
- Customer dissatisfaction

---

## Acceptance Criteria

### AC-1: Incident Reporting
- [ ] System SHALL allow reporting incident from:
  - Driver mobile interface
  - Command center dashboard
  - TDO interface
- [ ] System SHALL capture:
  - Incident type
  - Description
  - GPS location (auto-captured)
  - Photos/videos (up to 5)
  - Timestamp (auto-captured)
  - Severity (Minor, Major, Critical)
- [ ] System SHALL update trip status to "Incident"

### AC-2: Incident Workflow
- [ ] System SHALL create incident record linked to trip
- [ ] System SHALL assign incident ID
- [ ] System SHALL notify:
  - TDO (immediate)
  - Command Center
  - Fleet Manager (if vehicle issue)
  - Insurance team (if accident)
- [ ] System SHALL track incident status:
  - Reported → Under Review → Action Taken → Resolved

### AC-3: Incident Resolution
- [ ] System SHALL allow adding resolution notes
- [ ] System SHALL allow uploading resolution documents
- [ ] System SHALL allow marking incident as resolved
- [ ] System SHALL allow trip to resume after resolution
- [ ] System SHALL calculate incident duration

### AC-4: Incident History & Analytics
- [ ] System SHALL maintain incident history per:
  - Trip
  - Driver
  - Vehicle
  - Route
- [ ] System SHALL calculate incident metrics:
  - Incident rate per driver
  - Incident rate per vehicle
  - Most common incident types
  - Average resolution time

---

## Functional Requirements

### FR-001: Incident Reporting Form
- [Critical] Quick incident report (mobile-optimized)
- [Critical] Photo/video upload
- [High] GPS auto-capture
- [High] Offline mode (queue for sync)

### FR-002: Incident Dashboard
- [High] Active incidents list
- [High] Incident detail view
- [Medium] Incident map view
- [Medium] Incident analytics

### FR-003: Notification System
- [Critical] Real-time alerts for critical incidents
- [High] Escalation if not acknowledged
- [Medium] SMS alerts for critical incidents

---

## Business Rules

### BR-INC-001: Severity Classification
- Minor: No trip impact, continue
- Major: Trip delayed, requires action
- Critical: Trip cannot continue
- **Enforcement**: Severity selection

### BR-INC-002: Critical Incident Escalation
- Critical incidents escalate to manager if not acknowledged in 15 minutes
- **Enforcement**: Cron job

### BR-INC-003: Incident Photo Requirement
- Critical incidents require at least 1 photo
- **Enforcement**: Form validation

---

## Data Model

```typescript
TripIncident {
  id: UUID (PK)
  incident_number: String (unique)
  trip_id: UUID (FK)
  
  incident_type: Enum (
    Vehicle_Breakdown,
    Accident,
    Product_Damage,
    Theft,
    Route_Blockage,
    Delay,
    Weather,
    Driver_Health,
    Other
  )
  
  severity: Enum (Minor, Major, Critical)
  description: Text
  
  gps_latitude: Decimal
  gps_longitude: Decimal
  location_description: String
  
  photos: JSON (array of URLs)
  videos: JSON (array of URLs)
  
  status: Enum (Reported, Under_Review, Action_Taken, Resolved)
  
  reported_by: UUID (FK to User)
  reported_at: Timestamp
  acknowledged_by: UUID (FK, nullable)
  acknowledged_at: Timestamp (nullable)
  resolved_by: UUID (FK, nullable)
  resolved_at: Timestamp (nullable)
  resolution_notes: Text (nullable)
  
  incident_duration_minutes: Integer (nullable, computed)
}
```

---

## UI/UX Requirements

### Incident Report Form (Mobile)
```
┌─────────────────────────────────────────┐
│ Report Incident                         │
├─────────────────────────────────────────┤
│ Incident Type: *                        │
│ [Vehicle Breakdown            ▼]        │
│                                         │
│ Severity: *                             │
│ ⚪ Minor  ⚪ Major  ⚪ Critical          │
│                                         │
│ Description: *                          │
│ ┌─────────────────────────────────────┐ │
│ │ Engine overheating, stopped at      │ │
│ │ Tongi. Need mechanic.               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Location: (auto-captured)               │
│ 📍 Tongi, Gazipur                       │
│ 23.8975° N, 90.4028° E                  │
│                                         │
│ Photos: (0/5)                           │
│ [📷 Take Photo] [🖼️ Gallery]           │
│                                         │
│ [Submit Incident]                       │
└─────────────────────────────────────────┘
```

### Incident Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Active Incidents (3)                                         │
├──────────────────────────────────────────────────────────────┤
│ INC-001  🔴 Critical  Vehicle Breakdown  Tongi    [View]    │
│ Reported: 10 min ago | Status: Under Review                  │
│                                                              │
│ INC-002  🟡 Major     Product Damage     Mirpur   [View]    │
│ Reported: 1 hour ago | Status: Action Taken                  │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/trips/{trip_id}/incidents
Body: {
  incident_type, severity, description,
  gps_location, photos?
}

GET /api/v1/incidents?status=Reported&severity=Critical

PATCH /api/v1/incidents/{incident_id}/resolve
Body: {resolution_notes, resolved_by}

GET /api/v1/incidents/analytics
Query: ?driver_id={id}&date_from=2026-01-01
```

---

## Testing Scenarios

### Happy Path
1. Driver reports incident → Incident created
2. TDO acknowledges → Status updated
3. Issue resolved → Trip resumes

### Edge Cases
1. **Critical incident, no photo**: Validation error
2. **No GPS signal**: Allow manual location entry
3. **Offline mode**: Queue incident, sync when online

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle

### Enables
- → US-052: Driver Mobile Interface (incident reporting)
- → Insurance claims
- → Performance analytics

---

## Definition of Done
- [ ] Incident reporting functional
- [ ] Photo/video upload working
- [ ] Incident workflow complete
- [ ] Notifications sent
- [ ] Incident dashboard functional
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 6  
**Priority**: High

