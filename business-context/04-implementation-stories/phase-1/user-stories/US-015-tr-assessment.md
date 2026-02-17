---
title: Transport Requisition (TR) Assessment by Transport Planner
story_id: US-015
phase: phase-1
module: Transport Management
priority: Critical
status: Pending
epic: Transport Planning
sprint: Sprint 3
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-prd-reference/03-core-operations/transport-order-management.md
  - ../../../03-prd-reference/03-core-operations/transport-requisition-management.md
related_stories:
  - US-011-distribution-approval.md
  - US-017-to-creation.md
  - US-016-fleet-availability.md
dependencies:
  - US-011-distribution-approval.md
tags: [transport, tr-assessment, planning, critical]
---

# US-015: Transport Requisition (TR) Assessment by Transport Planner

## User Story

**As a** transport Planner  
**I want to** view and access all approved Transport Requisitions (TRs) so that I can plan transport execution and create appropriate Transport Orders (TOs)

## Business Context

TR Assessment is the bridge between requisition approval and transport execution:

**Workflow**:
```
Approved TR → TR Assessment → TO Creation → Trip Execution
```

**Assessment Activities**:
- Review TR details (route, quantity, delivery date)
- Check fleet availability (own fleet vs vendor fleet)
- Validate route feasibility
- Determine transport strategy (single TO vs multiple TOs)
- Identify any constraints or risks

**Without Assessment**:
- Inefficient TO creation (wrong vehicle type, poor planning)
- Missed delivery deadlines
- Unnecessary vendor usage when own fleet available
- Poor resource utilization

---

## Acceptance Criteria

### AC-1: TR Assessment Queue
- [ ] System SHALL display list of approved TRs with status "Available for Planning"
- [ ] System SHALL filter TRs by:
  - Delivery Date (urgent first)
  - Priority (Critical, High, Normal)
  - Route (source/destination)
  - Transfer Type (FG/Port)
- [ ] System SHALL sort by: Delivery Date, Priority, TR Number
- [ ] System SHALL show TR summary: Number, Route, Quantity, Delivery Date, Priority

### AC-2: TR Assessment View
- [ ] System SHALL display comprehensive TR details:
  - TR information (number, type, dates, priority)
  - Route details (source → destination, distance, map)
  - Product line items (product, quantity, weight, handling instructions)
  - Requester and approver information
  - Special instructions
- [ ] System SHALL show route on map with source/destination markers
- [ ] System SHALL display estimated transport requirements

### AC-3: Fleet Availability Check
- [ ] System SHALL display fleet availability summary:
  - Own Fleet: Available vehicles by type
  - Vendor Fleet: Active verified vendors
- [ ] System SHALL show vehicle suitability for TR:
  - Vehicle type matches product requirements
  - Vehicle capacity vs TR quantity
  - Vehicle availability on delivery date
- [ ] System SHALL recommend fleet type (Own vs Vendor)

### AC-4: Transport Strategy Planning
- [ ] System SHALL help planner determine:
  - Single TO vs Multiple TOs
  - Vehicle type selection
  - Fleet type selection (Own/Vendor)
  - Delivery scheduling
- [ ] System SHALL calculate:
  - Number of vehicles needed
  - Estimated cost (own fleet vs vendor)
  - Load efficiency per vehicle
- [ ] System SHALL show similar past TRs for reference

### AC-5: Assessment Actions
- [ ] System SHALL allow Transport Planner to:
  - Mark TR as "Assessed" (ready for TO creation)
  - Flag TR for discussion (if constraints found)
  - Request TR modification (if infeasible)
  - Add assessment notes
- [ ] System SHALL update TR status based on action
- [ ] System SHALL notify relevant stakeholders

### AC-6: Assessment Notes
- [ ] System SHALL allow planner to add assessment notes:
  - Transport strategy
  - Vehicle recommendations
  - Constraints identified
  - Special considerations
- [ ] System SHALL display notes during TO creation
- [ ] System SHALL maintain assessment history

---

## Functional Requirements

### FR-001: Assessment Dashboard
- [Critical] TR list with filtering and sorting
- [Critical] TR detail view with map
- [High] Fleet availability widget
- [High] Assessment notes editor

### FR-002: Route Analysis
- [Critical] Display route on map
- [Critical] Calculate distance and duration
- [High] Show route conditions (if available)
- [Medium] Suggest optimal route

### FR-003: Fleet Recommendation Engine
- [High] Analyze fleet availability
- [High] Match vehicle types to product requirements
- [High] Calculate cost comparison (own vs vendor)
- [Medium] ML-based recommendation (future)

### FR-004: Assessment Workflow
- [Critical] Status transition (Available for Planning → Assessed)
- [Critical] Assessment notes capture
- [High] Notification on assessment completion
- [Medium] Assessment templates for common scenarios

---

## Business Rules

### BR-ASSESS-001: Assessment Authority
- Only Transport Planner role can assess TRs
- **Enforcement**: RBAC

### BR-ASSESS-002: Assessment Prerequisite
- Only approved TRs can be assessed
- **Enforcement**: Status check

### BR-ASSESS-003: Fleet Availability
- If no suitable fleet available, flag for discussion
- **Enforcement**: Validation check

### BR-ASSESS-004: Delivery Date Feasibility
- If delivery date < today + 2 days, mark as urgent
- **Enforcement**: Date calculation

### BR-ASSESS-005: Assessment Completeness
- Assessment notes mandatory for flagged TRs
- **Enforcement**: Form validation

---

## Data Model

```typescript
TransferRequisition {
  // ... existing fields ...
  
  // Assessment fields
  assessment_status: Enum (
    Pending_Assessment,
    Assessed,
    Flagged_For_Discussion,
    Modification_Requested
  )
  assessed_by: UUID (FK to User, nullable)
  assessed_at: Timestamp (nullable)
  assessment_notes: Text (nullable)
  
  recommended_fleet_type: Enum (Own_Fleet, Vendor_Fleet, Mixed) (nullable)
  recommended_vehicle_type: String (nullable)
  estimated_vehicle_count: Integer (nullable)
  estimated_cost: Decimal (nullable)
}

TRAssessment {
  id: UUID (PK)
  tr_id: UUID (FK)
  
  assessed_by: UUID (FK to User)
  assessed_at: Timestamp
  
  transport_strategy: Text
  fleet_recommendation: Enum (Own_Fleet, Vendor_Fleet, Mixed)
  vehicle_type_recommendation: String
  estimated_vehicles: Integer
  estimated_cost_own: Decimal (nullable)
  estimated_cost_vendor: Decimal (nullable)
  
  constraints_identified: JSON (array of constraint objects)
  special_considerations: Text (nullable)
  
  assessment_result: Enum (Feasible, Requires_Discussion, Infeasible)
}
```

---

## UI/UX Requirements

### TR Assessment Queue
```
┌──────────────────────────────────────────────────────────────┐
│ TR Assessment Queue                                          │
├──────────────────────────────────────────────────────────────┤
│ Filter: [Urgent ▼] Priority: [All ▼] Route: [All ▼]         │
│                                                              │
│ TR Number       Route            Qty     Delivery  Action   │
│ ──────────────────────────────────────────────────────────  │
│ TR-FG-20260211  Bhaluka → Mirpur 500 KG  🔴 Feb 13  [Assess]│
│ -0042           45 km            Critical (2 days)          │
│                                                              │
│ TR-FG-20260210  Warehouse → Depot 1000KG  🟡 Feb 15 [Assess]│
│ -0038           30 km            High     (4 days)          │
└──────────────────────────────────────────────────────────────┘
```

### TR Assessment View
```
┌─────────────────────────────────────────────────────────────┐
│ Assess TR: TR-FG-20260211-0042                        [×]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─ TR Details ──────────────────────────────────────────┐   │
│ │ Route: Bhaluka Warehouse → Mirpur Depot (45 km)      │   │
│ │ Product: Live Broiler (500 KG)                        │   │
│ │ Delivery: Feb 13, 2026 (⚠️ 2 days - URGENT)          │   │
│ │ Priority: 🔴 Critical                                 │   │
│ │ Special: Handle with care - live birds               │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Route Map ───────────────────────────────────────────┐   │
│ │ [MAP: Source marker → Route → Destination marker]     │   │
│ │ Distance: 45 km | Est. Duration: 1.5 hours            │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Fleet Availability ──────────────────────────────────┐   │
│ │ Own Fleet:                                            │   │
│ │ • Covered Van (5 MT): 12 available ✅                 │   │
│ │ • Open Truck (10 MT): 5 available                     │   │
│ │                                                       │   │
│ │ Vendor Fleet:                                         │   │
│ │ • Active Vendors: 15                                  │   │
│ │ • Avg Bid Response: 2 hours                           │   │
│ │                                                       │   │
│ │ Recommendation: Own Fleet (Covered Van)               │   │
│ │ Estimated Cost: BDT 4,500 (Own) vs 5,500 (Vendor)    │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─ Transport Strategy ──────────────────────────────────┐   │
│ │ Vehicles Needed: 1 (Covered Van, 5 MT)                │   │
│ │ Load Efficiency: 10% (Low - consider combining)       │   │
│ │ Strategy: Single TO, Own Fleet                        │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ Assessment Notes:                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Urgent delivery - prioritize. Use own fleet covered    │ │
│ │ van. Low load efficiency but critical priority.        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [🚩 Flag for Discussion] [✅ Mark as Assessed] [➡️ Create TO]│
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Get TRs for assessment
GET /api/v1/transfer-requisitions/for-assessment
Query: ?priority=Critical&delivery_date_from=2026-02-11

// Get TR assessment details
GET /api/v1/transfer-requisitions/{tr_id}/assessment-details
Response: {
  tr, route_analysis, fleet_availability,
  transport_requirements, similar_trs
}

// Save assessment
POST /api/v1/transfer-requisitions/{tr_id}/assess
Body: {
  assessment_notes, recommended_fleet_type,
  recommended_vehicle_type, estimated_vehicles,
  estimated_cost, assessment_result
}

// Mark as assessed
POST /api/v1/transfer-requisitions/{tr_id}/mark-assessed
Body: {notes: string}
Response: {tr, status: 'Assessed'}

// Flag for discussion
POST /api/v1/transfer-requisitions/{tr_id}/flag
Body: {reason: string, notes: string}

// Get fleet availability
GET /api/v1/fleet/availability
Query: ?date=2026-02-13&vehicle_type=Covered_Van
Response: {own_fleet: {...}, vendor_fleet: {...}}
```

---

## Testing Scenarios

### Happy Path
1. Planner views assessment queue → TRs displayed
2. Planner assesses TR → Fleet availability shown
3. Planner marks as assessed → Status updated
4. Planner creates TO → Assessment notes visible

### Edge Cases
1. **No fleet available**: Flag for discussion
2. **Urgent delivery (< 2 days)**: Highlighted
3. **Large shipment (> 5 vehicles)**: Special note
4. **Infeasible route**: Request modification

---

## Dependencies

### Prerequisites
- ✅ US-011: Distribution Approval (approved TRs)
- ✅ US-001: Vehicle Master Data (fleet info)

### Enables
- → US-017: TO Creation (assessed TRs)
- → US-016: Fleet Availability Validation

---

## Definition of Done
- [ ] Assessment queue functional
- [ ] TR detail view with map
- [ ] Fleet availability display
- [ ] Assessment notes capture
- [ ] Mark as assessed working
- [ ] Notifications sent
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 3  
**Priority**: Critical

