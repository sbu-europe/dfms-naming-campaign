---
title: Vehicle Maintenance Management
story_id: US-057
phase: phase-1
module: Fleet Management
priority: High
status: Pending
epic: Fleet Maintenance
sprint: Sprint 17
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/06-fleet-management/vehicle-management.md
related_stories:
  - US-001-vehicle-master-data.md
  - US-058-fuel-management.md
dependencies:
  - US-001-vehicle-master-data.md
tags: [fleet, maintenance, vehicle, high-priority]
---

# US-057: Vehicle Maintenance Management

## User Story

**As a** Fleet Manager  
**I want to** manage vehicle maintenance schedules and records  
**So that** vehicles are properly maintained and downtime is minimized

## Business Context

Maintenance management ensures:
- **Vehicle Reliability**: Reduce breakdowns
- **Safety**: Ensure vehicles are roadworthy
- **Compliance**: Meet regulatory inspection requirements
- **Cost Control**: Preventive maintenance vs reactive repairs
- **Asset Longevity**: Extend vehicle lifespan

**Maintenance Types**:
- Preventive (scheduled based on km/time)
- Corrective (breakdown repairs)
- Inspection (regulatory compliance)

---

## Acceptance Criteria

### AC-1: Maintenance Schedule
- [ ] System SHALL allow defining maintenance schedules per vehicle:
  - Schedule type (Preventive, Inspection)
  - Frequency (km-based, time-based, or both)
  - Service items (oil change, tire rotation, etc.)
  - Estimated cost
  - Preferred service center
- [ ] System SHALL auto-calculate next maintenance due date/km

### AC-2: Maintenance Alerts
- [ ] System SHALL trigger alerts when:
  - Maintenance due within 7 days or 500 km
  - Maintenance overdue
  - Inspection expiry approaching
- [ ] System SHALL notify Fleet Manager
- [ ] System SHALL prevent trip assignment if maintenance overdue

### AC-3: Maintenance Execution
- [ ] System SHALL allow recording maintenance with:
  - Vehicle *
  - Maintenance type *
  - Service date *
  - Odometer reading *
  - Service center
  - Service items performed
  - Cost
  - Next service due (km/date)
  - Invoice/receipt upload
- [ ] System SHALL update vehicle status to "Under Maintenance"

### AC-4: Maintenance History
- [ ] System SHALL maintain complete maintenance history per vehicle
- [ ] System SHALL display:
  - All past maintenance records
  - Total maintenance cost
  - Maintenance frequency
  - Common issues
- [ ] System SHALL allow exporting maintenance reports

### AC-5: Service Center Management
- [ ] System SHALL maintain service center directory
- [ ] System SHALL track service center performance
- [ ] System SHALL allow rating service centers

---

## Functional Requirements

### FR-001: Schedule Management
- [Critical] Maintenance schedule CRUD
- [Critical] Auto-calculation of due dates
- [High] Alert generation
- [Medium] Bulk schedule creation

### FR-002: Maintenance Recording
- [Critical] Maintenance entry form
- [Critical] Document upload
- [High] Cost tracking
- [Medium] Parts inventory integration

### FR-003: Reporting
- [High] Maintenance history reports
- [High] Cost analysis
- [Medium] Predictive maintenance (ML)

---

## Business Rules

### BR-MAINT-001: Preventive Maintenance Frequency
- Light vehicles: Every 5,000 km or 3 months
- Heavy vehicles: Every 10,000 km or 6 months
- **Enforcement**: Schedule configuration

### BR-MAINT-002: Overdue Maintenance Block
- Vehicles with overdue maintenance cannot be assigned to trips
- **Enforcement**: Availability check

### BR-MAINT-003: Inspection Validity
- Annual fitness inspection required
- **Enforcement**: Document expiry tracking

---

## Data Model

```typescript
MaintenanceSchedule {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  
  schedule_type: Enum (Preventive, Inspection)
  frequency_km: Integer (nullable)
  frequency_days: Integer (nullable)
  
  service_items: JSON (array)
  estimated_cost: Decimal
  
  last_service_date: Date (nullable)
  last_service_km: Integer (nullable)
  next_service_due_date: Date (computed)
  next_service_due_km: Integer (computed)
  
  is_active: Boolean
}

MaintenanceRecord {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  maintenance_schedule_id: UUID (FK, nullable)
  
  maintenance_type: Enum (Preventive, Corrective, Inspection)
  service_date: Date
  odometer_reading: Integer
  
  service_center: String
  service_items_performed: JSON
  cost: Decimal
  
  next_service_due_km: Integer (nullable)
  next_service_due_date: Date (nullable)
  
  invoice_url: String (nullable)
  notes: Text (nullable)
  
  recorded_by: UUID (FK to User)
  created_at: Timestamp
}

MaintenanceAlert {
  id: UUID (PK)
  vehicle_id: UUID (FK)
  maintenance_schedule_id: UUID (FK)
  
  alert_type: Enum (Due_Soon, Overdue)
  alert_message: Text
  
  triggered_at: Timestamp
  acknowledged_at: Timestamp (nullable)
}
```

---

## UI/UX Requirements

### Maintenance Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ Fleet Maintenance Dashboard                                  │
├──────────────────────────────────────────────────────────────┤
│ ⚠️ Alerts (3):                                               │
│ • DM-11-1234: Maintenance overdue (500 km overdue)           │
│ • DM-11-5678: Service due in 3 days                          │
│ • DM-11-9012: Fitness inspection expires in 15 days          │
│                                                              │
│ Upcoming Maintenance (Next 7 Days):                          │
│ Vehicle      Type           Due Date    Due KM    Action    │
│ ──────────────────────────────────────────────────────────  │
│ DM-11-5678   Preventive    Feb 14      45,000    [Schedule] │
│ DM-11-9012   Inspection    Feb 18      N/A       [Schedule] │
│                                                              │
│ Maintenance Statistics:                                      │
│ • Total Cost (This Month): BDT 45,000                        │
│ • Vehicles Under Maintenance: 2                              │
│ • Avg Downtime: 1.5 days                                     │
└──────────────────────────────────────────────────────────────┘
```

### Record Maintenance Form
```
┌─────────────────────────────────────────┐
│ Record Maintenance                      │
├─────────────────────────────────────────┤
│ Vehicle: *                              │
│ [DM-11-1234 (Covered Van)   ▼]          │
│                                         │
│ Maintenance Type: *                     │
│ ⚪ Preventive  ⚪ Corrective  ⚪ Inspection│
│                                         │
│ Service Date: * [2026-02-11]            │
│ Odometer Reading: * [45,250] KM         │
│                                         │
│ Service Center:                         │
│ [ABC Auto Service         ▼]            │
│                                         │
│ Service Items:                          │
│ ☑ Oil Change                            │
│ ☑ Oil Filter                            │
│ ☑ Air Filter                            │
│ ☑ Tire Rotation                         │
│                                         │
│ Cost: [5,500] BDT                       │
│                                         │
│ Next Service Due:                       │
│ KM: [50,250] (in 5,000 KM)              │
│ Date: [May 11, 2026] (in 3 months)      │
│                                         │
│ Upload Invoice: [📄 Choose File]        │
│                                         │
│ [Cancel]              [Record Service]  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Maintenance Schedules
POST /api/v1/maintenance-schedules
GET /api/v1/vehicles/{vehicle_id}/maintenance-schedules

// Maintenance Records
POST /api/v1/maintenance-records
GET /api/v1/vehicles/{vehicle_id}/maintenance-history

// Maintenance Alerts
GET /api/v1/maintenance-alerts
Query: ?status=Active&vehicle_id={id}

// Maintenance Dashboard
GET /api/v1/fleet/maintenance-dashboard
Response: {
  alerts, upcoming_maintenance,
  vehicles_under_maintenance, statistics
}
```

---

## Testing Scenarios

### Happy Path
1. Create maintenance schedule → Schedule active
2. Maintenance due → Alert triggered
3. Record maintenance → History updated, next due calculated
4. Vehicle available for trips

### Edge Cases
1. **Maintenance overdue**: Vehicle blocked from trips
2. **Multiple schedules**: All tracked independently
3. **Emergency repair**: Corrective maintenance recorded

---

## Dependencies

### Prerequisites
- ✅ US-001: Vehicle Master Data

### Enables
- → Vehicle reliability
- → Reduced breakdowns
- → Compliance

---

## Definition of Done
- [ ] Schedule management functional
- [ ] Maintenance recording working
- [ ] Alerts triggered correctly
- [ ] History tracking complete
- [ ] Trip assignment blocking for overdue maintenance
- [ ] Reports generation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 17  
**Priority**: High

