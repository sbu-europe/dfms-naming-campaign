---
title: Vendor Fleet Management
story_id: US-030
phase: phase-1
module: Vendor Management
priority: Medium
status: Pending
epic: Vendor Operations
sprint: Sprint 9
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-prd-reference/05-vendor-management/vendor-onboarding.md
related_stories:
  - US-027-vendor-registration-verification.md
  - US-019-to-execution-vendor-direct.md
dependencies:
  - US-027-vendor-registration-verification.md
tags: [vendor, fleet, vehicles, drivers, medium-priority]
---

# US-030: Vendor Fleet Management

## User Story

**As a** Vendor  
**I want to** manage my fleet (vehicles and drivers) in the system  
**So that** I can keep my fleet information up-to-date and receive appropriate trip assignments

## Business Context

Vendor fleet management enables:
- **Accurate Capacity Planning**: Know vendor fleet availability
- **Proper Assignment**: Match TOs to suitable vendor vehicles
- **Compliance Tracking**: Ensure vehicle/driver documents valid
- **Performance Tracking**: Link trips to specific vehicles/drivers

---

## Acceptance Criteria

### AC-1: Vehicle Management
- [ ] System SHALL allow vendor to add vehicles:
  - Registration number *
  - Vehicle type *
  - Capacity (weight) *
  - Year of manufacture
  - Insurance details
  - Fitness certificate
  - Tax token
  - Photos
- [ ] System SHALL validate registration number uniqueness
- [ ] System SHALL track document expiry dates
- [ ] System SHALL allow vendor to update/deactivate vehicles

### AC-2: Driver Management
- [ ] System SHALL allow vendor to add drivers:
  - Name *
  - Phone *
  - License number *
  - License expiry date *
  - Photo
  - NID number
- [ ] System SHALL validate license uniqueness
- [ ] System SHALL send expiry alerts (30 days before)
- [ ] System SHALL allow vendor to update/deactivate drivers

### AC-3: Fleet Availability
- [ ] System SHALL allow vendor to mark vehicles/drivers as:
  - Available
  - On Trip
  - Under Maintenance
  - Unavailable
- [ ] System SHALL auto-update status when assigned to trip
- [ ] System SHALL show fleet utilization statistics

### AC-4: Document Expiry Tracking
- [ ] System SHALL track expiry dates for:
  - Vehicle insurance
  - Vehicle fitness certificate
  - Tax token
  - Driver license
- [ ] System SHALL send alerts 30 days before expiry
- [ ] System SHALL prevent assignment if critical documents expired

---

## Functional Requirements

### FR-001: Fleet Management Interface
- [Critical] Vehicle CRUD operations
- [Critical] Driver CRUD operations
- [High] Document upload and tracking
- [Medium] Fleet availability calendar

### FR-002: Validation & Compliance
- [High] Document expiry validation
- [High] Registration/license uniqueness check
- [Medium] Integration with govt. databases (future)

---

## Business Rules

### BR-FLEET-001: Unique Registration
- Vehicle registration number must be unique across all vendors
- **Enforcement**: Database unique constraint

### BR-FLEET-002: Document Validity
- Vehicles with expired insurance/fitness cannot be assigned
- Drivers with expired licenses cannot be assigned
- **Enforcement**: Validation check during assignment

---

## Data Model

```typescript
VendorVehicle {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  registration_number: String (unique)
  vehicle_type: Enum
  capacity_kg: Decimal
  year_of_manufacture: Integer
  
  insurance_expiry: Date
  fitness_expiry: Date
  tax_token_expiry: Date
  
  status: Enum (Available, On_Trip, Under_Maintenance, Unavailable)
  is_active: Boolean
  
  photos: JSON (array of URLs)
  
  created_at: Timestamp
}

VendorDriver {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  name: String
  phone: String
  license_number: String (unique)
  license_expiry: Date
  nid_number: String
  
  photo_url: String (nullable)
  
  status: Enum (Available, On_Trip, On_Leave, Unavailable)
  is_active: Boolean
  
  created_at: Timestamp
}
```

---

## UI/UX Requirements

### Vendor Fleet Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│ My Fleet                                                     │
├──────────────────────────────────────────────────────────────┤
│ Vehicles (12)  [+ Add Vehicle]                               │
│ Registration    Type         Capacity  Status               │
│ ──────────────────────────────────────────────────────────  │
│ DM-11-1234     Covered Van   5 MT      ✅ Available  [Edit] │
│ DM-11-5678     Open Truck    10 MT     🚛 On Trip    [View] │
│ DM-11-9012     Covered Van   5 MT      🔧 Maintenance [Edit] │
│                                                              │
│ Drivers (15)  [+ Add Driver]                                 │
│ Name           License       Expiry     Status               │
│ ──────────────────────────────────────────────────────────  │
│ Rahim Ahmed    DL-123456     Dec 2026   ✅ Available  [Edit] │
│ Karim Mia      DL-654321     Mar 2026   🚛 On Trip    [View] │
│ Jalal Uddin    DL-789012     Jan 2027   ✅ Available  [Edit] │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Vehicle CRUD
POST /api/v1/vendors/me/vehicles
GET /api/v1/vendors/me/vehicles
PATCH /api/v1/vendors/me/vehicles/{vehicle_id}
DELETE /api/v1/vendors/me/vehicles/{vehicle_id}

// Driver CRUD
POST /api/v1/vendors/me/drivers
GET /api/v1/vendors/me/drivers
PATCH /api/v1/vendors/me/drivers/{driver_id}
DELETE /api/v1/vendors/me/drivers/{driver_id}

// Get expiring documents
GET /api/v1/vendors/me/expiring-documents
Query: ?days=30
```

---

## Testing Scenarios

### Happy Path
1. Vendor adds vehicle → Vehicle created
2. Vendor adds driver → Driver created
3. Document expires → Alert sent

### Edge Cases
1. **Duplicate registration**: Validation error
2. **Expired license**: Cannot assign to trip

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration

### Enables
- → US-019: TO Execution - Vendor Direct

---

## Definition of Done
- [ ] Vehicle/driver CRUD functional
- [ ] Document expiry tracking
- [ ] Alerts sent before expiry
- [ ] Fleet availability status
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 9  
**Priority**: Medium

