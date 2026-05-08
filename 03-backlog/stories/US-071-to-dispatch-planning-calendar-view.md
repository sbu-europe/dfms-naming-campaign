---
title: TO Dispatch Planning (Calendar View)
story_id: US-071
phase: phase-2
module: Transport Order Management
priority: High
status: Pending
epic: Transport Planning Optimization
sprint: Sprint 5
story_points: 13
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
related_stories:
  - US-020-to-execution-own-fleet.md
  - US-021-to-execution-vendor-fleet.md
  - US-072-tr-conjoinment.md
dependencies: []
tags: [transport-planning, calendar-view, dispatch, phase-2]
---

# US-071: TO Dispatch Planning (Calendar View)

## User Story

**As a** Transport Planner  
**I want to** view Transport Orders (TOs) in a calendar view  
**So that** I can plan trips by date, fleet type, and urgency, and see vehicle/driver assignments

## Business Context

Transport Planners need visual planning tools to:
- View all TOs scheduled for specific dates
- See vehicle and driver assignments at a glance
- Identify unassigned TOs
- Group TOs by their parent TR (Transport Requisition)
- View vehicle-wise timelines to avoid overbooking
- Plan efficient dispatch schedules

A calendar view provides intuitive visualization of TO scheduling and resource allocation.

## Acceptance Criteria

### Must Have (Critical)
- [ ] System SHALL display all created and planning-eligible TOs in calendar view
- [ ] System SHALL support daily, weekly, and monthly calendar views
- [ ] System SHALL support date navigation (previous/next, date picker)
- [ ] System SHALL load only approved TOs (post-TR approval)
- [ ] Each TO SHALL be displayed as calendar block showing:
  - TO ID
  - TR Reference
  - Transfer Type (FG / Port)
  - Fleet Type (Own Fleet / Vendor Fleet)
  - Vehicle Number (if assigned)
  - Driver Name (if assigned)
  - Source POI
  - Destination POI
  - Urgency
  - Planned Date
- [ ] System SHALL visually group/tag TOs belonging to same TR
- [ ] System SHALL display assigned vehicle, driver, helper once assignment completed
- [ ] System SHALL flag unassigned TOs as 'Unassigned'
- [ ] System SHALL provide vehicle-wise calendar view (each vehicle as row)

### Should Have (High)
- [ ] System SHOULD allow filtering by date, vehicle category, urgency, fleet type
- [ ] System SHOULD highlight idle gaps between TOs for vehicles
- [ ] System SHOULD visually differentiate Own Fleet vs Vendor Fleet TOs (color/label/icon)
- [ ] System SHOULD support TO blocks as read-only (no status/quantity changes in calendar)

### Nice to Have (Medium)
- [ ] System MAY support drag-and-drop TO reassignment
- [ ] System MAY provide capacity utilization indicators

## Functional Requirements

### FR-071-001: Calendar Views
- [Critical] System SHALL support three view modes:
  - Daily view: Single day with hourly breakdown
  - Weekly view: 7-day week with daily columns
  - Monthly view: Full month grid
- [Critical] System SHALL support date navigation:
  - Previous/Next buttons
  - Date picker for quick navigation
  - Today button
- [Critical] System SHALL load only approved TOs (status: Approved, Planned, Assigned)
- [High] System SHALL support view persistence (remember last selected view)

### FR-071-002: TO Block Display
- [Critical] Each TO SHALL be displayed as calendar block with:
  - TO ID (prominent)
  - TR Reference (parent TR)
  - Transfer Type badge (FG/Port)
  - Fleet Type indicator (Own/Vendor)
  - Vehicle Number (if assigned)
  - Driver Name (if assigned)
  - Source → Destination POI
  - Urgency indicator (color-coded)
  - Planned Date/Time
- [Critical] TO blocks SHALL be read-only in calendar view
- [High] System SHALL allow clicking TO block to view details
- [High] System SHALL show tooltip on hover with full TO details

### FR-071-003: TR Grouping
- [Critical] System SHALL visually group TOs belonging to same TR
- [Critical] System SHALL display TR reference with grouped TOs
- [High] System SHALL allow expand/collapse TR groups
- [High] System SHALL highlight TR groups with distinct color/border

### FR-071-004: Assignment Display
- [Critical] System SHALL display:
  - Assigned vehicle (if assigned)
  - Assigned driver (if assigned)
  - Assigned helper (if assigned)
- [Critical] System SHALL flag unassigned TOs clearly
- [High] System SHALL show assignment status (Pending/Assigned/Confirmed)

### FR-071-005: Vehicle-Wise Calendar View
- [Critical] System SHALL provide vehicle-wise calendar view
- [Critical] Each vehicle SHALL appear as calendar row
- [Critical] Assigned TOs SHALL appear in vehicle's timeline
- [High] System SHALL highlight idle gaps between TOs
- [High] System SHALL show vehicle availability status

### FR-071-006: Filtering & Search
- [Critical] System SHALL support filters:
  - Date range
  - Vehicle category/type
  - Urgency level
  - Fleet type (Own/Vendor)
  - Transfer type (FG/Port)
  - Assignment status
- [High] System SHALL support search by TO ID, TR ID, Vehicle Number, Driver Name

## Business Rules

### BR-071-001: TO Eligibility
- Only approved TOs appear in calendar
- TOs must have status: Approved, Planned, Assigned, Dispatched
- Draft or cancelled TOs excluded

### BR-071-002: Display Rules
- TO blocks positioned based on planned date/time
- Multiple TOs on same date/time stacked or grouped
- Unassigned TOs visually distinct (different color/icon)

### BR-071-003: Fleet Type Differentiation
- Own Fleet TOs: One color/style
- Vendor Fleet TOs: Different color/style
- Visual distinction must be clear

### BR-071-004: Read-Only Mode
- Calendar view is read-only for TO details
- Status changes must be done in TO detail view
- Quantity changes must be done in TO detail view

## Data Model

### Calendar View Configuration
```yaml
CalendarViewConfig:
  view_type: string (daily|weekly|monthly)
  date_range_start: date
  date_range_end: date
  filters: json (fleet_type, urgency, assignment_status, etc)
  user_id: string (FK)
```

### TO Calendar Display
```yaml
TOCalendarDisplay:
  to_id: string (FK)
  tr_id: string (FK)
  planned_date: datetime
  fleet_type: string (own|vendor)
  transfer_type: string (fg|port)
  vehicle_id: string (FK, optional)
  driver_id: string (FK, optional)
  urgency: string (normal|high|critical)
  assignment_status: string (unassigned|assigned|confirmed)
  source_poi: string
  destination_poi: string
```

## UI/UX Requirements

### Calendar Interface
- View selector (Daily/Weekly/Monthly tabs)
- Date navigation controls (Previous, Next, Today, Date Picker)
- Filter panel (collapsible)
- Calendar grid with TO blocks
- Legend (Fleet types, Urgency levels, Assignment status)
- Vehicle-wise toggle button

### TO Block Design
- Color-coded by fleet type
- Urgency indicator (icon or border)
- Assignment status badge
- Hover tooltip with full details
- Click to open TO detail view

### Vehicle-Wise View
- Vehicle list (rows)
- Date columns
- TO blocks in vehicle timeline
- Idle gaps highlighted
- Vehicle availability status

## API Endpoints

### GET /api/v1/transport/calendar/to
- Get TOs for calendar view
- Query params: view_type, date_start, date_end, filters
- Response: array of TO calendar display objects

### GET /api/v1/transport/calendar/vehicle-wise
- Get vehicle-wise calendar view
- Query params: date_start, date_end, vehicle_ids
- Response: vehicle timeline data

### GET /api/v1/transport/calendar/filters
- Get available filter options
- Response: filter options (fleet types, urgencies, etc)

## Non-Functional Requirements

- **Performance**: Calendar load within 2 seconds for 1000+ TOs
- **Scalability**: Support 10,000+ TOs in calendar view
- **Usability**: Intuitive calendar interface, responsive design

## Testing Scenarios

### TC-071-001: Daily View Display
1. Select daily view
2. Navigate to specific date
3. Verify TOs for that date displayed
4. Verify TO blocks show required information
5. Click TO block
6. Verify TO detail view opens

### TC-071-002: TR Grouping
1. View calendar with multiple TOs from same TR
2. Verify TOs visually grouped
3. Verify TR reference displayed
4. Expand/collapse group
5. Verify grouping works correctly

### TC-071-003: Vehicle-Wise View
1. Switch to vehicle-wise view
2. Verify vehicles listed as rows
3. Verify TOs appear in vehicle timelines
4. Verify idle gaps highlighted
5. Verify overbooking detection

### TC-071-004: Filtering
1. Apply filters (fleet type, urgency)
2. Verify calendar updates
3. Clear filters
4. Verify all TOs displayed

## Dependencies

- **US-020**: TO Execution (Own Fleet) - for assignment data
- **US-021**: TO Execution (Vendor Fleet) - for assignment data
- **US-072**: TR Conjoinment - related feature

## Definition of Done

- [ ] Calendar views implemented (daily/weekly/monthly)
- [ ] TO block display implemented
- [ ] TR grouping implemented
- [ ] Assignment display implemented
- [ ] Vehicle-wise view implemented
- [ ] Filtering implemented
- [ ] Date navigation implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.8.3: TO Dispatch Planning (Calendar View)

**Last Updated**: February 13, 2026  
**Status**: Pending Review  
**Phase**: Phase 2

