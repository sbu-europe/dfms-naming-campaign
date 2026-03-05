---
title: Command Center Operations Monitoring
story_id: US-043
phase: phase-1
module: Operations (Command Center)
priority: High
status: Pending
epic: Command Center
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
sprint: Sprint 13
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/command-center.md
  - ../../../03-module-specifications/04-poi-operations/scaling-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-026-realtime-map-dashboard.md
  - US-021-trip-lifecycle.md
dependencies:
  - US-021-trip-lifecycle.md
  - US-035-gate-in-source.md
  - US-037-gate-in-destination.md
tags: [operations, command-center, monitoring, high-priority]
---

# US-043: Command Center Operations Monitoring

## User Story

**As a** Command Center Officer  
**I want to** assign loading/unloading lines based on product type and urgency so that operations are coordinated efficiently

## Business Context

Command Center provides:
- **Centralized Monitoring**: Single view of all operations
- **Real-time Visibility**: Live status of all activities
- **Bottleneck Detection**: Identify delays and congestion
- **Proactive Management**: Intervene before issues escalate
- **Performance Tracking**: Monitor operational KPIs

**Monitored Activities**:
- Gate operations (in/out at source/destination)
- Loading/unloading queues
- Scaling operations
- QC inspections
- Trip progress

---

## Acceptance Criteria

### AC-1: Operations Dashboard
- [ ] System SHALL display operations dashboard showing:
  - Active operations by POI
  - Loading queues (all sources)
  - Unloading queues (all destinations)
  - Trips in progress
  - Pending QC inspections
  - Operational alerts
- [ ] System SHALL update dashboard in real-time (every 30 seconds)

### AC-2: POI-wise Monitoring
- [ ] System SHALL display operations per POI:
  - Gate-in count (today)
  - Gate-out count (today)
  - Current queue length
  - Average wait time
  - Active loading/unloading
  - Capacity utilization
- [ ] System SHALL allow drilling down to POI details

### AC-3: Queue Management
- [ ] System SHALL display all queues:
  - Loading queues (by POI)
  - Unloading queues (by POI)
  - Queue position
  - Wait time
  - Priority trips
- [ ] System SHALL highlight long wait times (> 30 min)
- [ ] System SHALL allow reordering queue (priority override)

### AC-4: Operational Alerts
- [ ] System SHALL trigger alerts for:
  - Long queue (> 5 vehicles)
  - Long wait time (> 30 min)
  - Delayed operations
  - QC failures
  - Weight variances
  - Seal tampering
- [ ] System SHALL display alert panel
- [ ] System SHALL allow acknowledging alerts

### AC-5: Performance Metrics
- [ ] System SHALL display operational KPIs:
  - Avg loading time
  - Avg unloading time
  - Avg gate-to-gate time
  - Queue efficiency
  - On-time completion rate
- [ ] System SHALL show trends (today vs yesterday)

### AC-6: Intervention Actions
- [ ] System SHALL allow Command Center to:
  - Prioritize trips in queue
  - Reassign resources
  - Escalate issues
  - Communicate with field staff
  - Override workflows (with approval)

---

## Functional Requirements

### FR-001: Dashboard UI
- [Critical] Real-time operations dashboard
- [Critical] POI-wise breakdown
- [High] Queue visualization
- [High] Alert panel

### FR-002: Real-time Updates
- [Critical] WebSocket for live data
- [High] Auto-refresh every 30 seconds
- [Medium] Push notifications

### FR-003: Analytics
- [High] Operational KPIs
- [High] Trend analysis
- [Medium] Predictive analytics (future)

---

## Business Rules

### BR-CMD-001: Alert Thresholds
- Long queue: > 5 vehicles
- Long wait: > 30 minutes
- **Enforcement**: Threshold checks

### BR-CMD-002: Priority Override
- Command Center can override queue priority
- Requires reason and approval
- **Enforcement**: Approval workflow

---

## Data Model

```typescript
OperationalAlert {
  id: UUID (PK)
  
  alert_type: Enum (
    Long_Queue,
    Long_Wait_Time,
    Delayed_Operation,
    QC_Failure,
    Weight_Variance,
    Seal_Tampering,
    Other
  )
  
  poi_id: UUID (FK, nullable)
  trip_id: UUID (FK, nullable)
  
  severity: Enum (Info, Warning, Critical)
  message: Text
  
  triggered_at: Timestamp
  acknowledged_by: UUID (FK to User, nullable)
  acknowledged_at: Timestamp (nullable)
  resolved_at: Timestamp (nullable)
}

OperationalMetrics {
  id: UUID (PK)
  poi_id: UUID (FK, nullable)
  
  date: Date
  
  gate_in_count: Integer
  gate_out_count: Integer
  avg_loading_time_minutes: Decimal
  avg_unloading_time_minutes: Decimal
  avg_wait_time_minutes: Decimal
  max_queue_length: Integer
  
  calculated_at: Timestamp
}
```

---

## UI/UX Requirements

### Command Center Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ DFMS Command Center                      [🔔 5 Alerts]       │
├──────────────────────────────────────────────────────────────┤
│ ┌─ Operations Summary ─────────────────────────────────────┐ │
│ │ Active Trips: 45  │  Loading: 8  │  Unloading: 6        │ │
│ │ Pending QC: 3     │  Alerts: 5   │  Avg Wait: 12 min    │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ POI Operations ─────────────────────────────────────────┐ │
│ │ Location         Gate-In  Gate-Out  Queue  Avg Wait     │ │
│ │ ────────────────────────────────────────────────────────│ │
│ │ Bhaluka Warehouse   12       10      3     15 min  [View]│ │
│ │ Mirpur Depot         8        6      5     25 min⚠️[View]│ │
│ │ Chittagong Port      5        4      2     10 min  [View]│ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Active Queues ──────────────────────────────────────────┐ │
│ │ LOADING QUEUES:                                          │ │
│ │ • Bhaluka: 3 vehicles (max wait: 15 min)                │ │
│ │ • Chittagong: 2 vehicles (max wait: 10 min)             │ │
│ │                                                          │ │
│ │ UNLOADING QUEUES:                                        │ │
│ │ • Mirpur: 5 vehicles (max wait: 25 min) ⚠️              │ │
│ │ • Gazipur: 2 vehicles (max wait: 12 min)                │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Alerts ─────────────────────────────────────────────────┐ │
│ │ 🔴 Long wait time at Mirpur Depot (25 min)   [Acknowledge]│ │
│ │ 🟡 QC pending for 3 trips                    [View]      │ │
│ │ 🟡 Weight variance detected (TRIP-042)       [Investigate]│ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─ Performance Metrics (Today) ────────────────────────────┐ │
│ │ Avg Loading Time: 25 min (↓ 5 min vs yesterday)         │ │
│ │ Avg Unloading Time: 20 min (↑ 2 min vs yesterday)       │ │
│ │ On-Time Completion: 88% (↑ 3% vs yesterday)             │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get operations dashboard data
GET /api/v1/command-center/dashboard
Response: {
  active_trips, loading_count, unloading_count,
  pending_qc, alerts, poi_operations, queues,
  metrics
}

// WebSocket for real-time updates
WS /api/v1/command-center/realtime
Message: {type: 'gate_in', poi_id, trip_id, timestamp}
Message: {type: 'alert', alert}

// Get POI operations
GET /api/v1/command-center/poi-operations/{poi_id}

// Get operational alerts
GET /api/v1/command-center/alerts
Query: ?severity=Critical&status=Active

// Acknowledge alert
POST /api/v1/command-center/alerts/{alert_id}/acknowledge

// Get operational metrics
GET /api/v1/command-center/metrics
Query: ?date=2026-02-11&poi_id={id}
```

---

## Testing Scenarios

### Happy Path
1. Operator opens dashboard → Data displayed
2. Real-time updates arrive → Dashboard refreshes
3. Alert triggered → Displayed in alert panel
4. Operator acknowledges alert → Alert cleared

### Edge Cases
1. **WebSocket disconnected**: Fallback to polling
2. **High alert volume**: Prioritize critical alerts
3. **No operations**: Show empty state

---

## Dependencies

### Prerequisites
- ✅ US-021: Trip Lifecycle
- ✅ US-035: Gate-In at Source
- ✅ US-037: Gate-In at Destination

### Enables
- → Centralized operations control
- → Proactive issue management

---

## Definition of Done
- [ ] Operations dashboard functional
- [ ] Real-time updates working
- [ ] POI-wise monitoring
- [ ] Queue visualization
- [ ] Alert system working
- [ ] Performance metrics display
- [ ] WebSocket integration
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 13  
**Priority**: High

