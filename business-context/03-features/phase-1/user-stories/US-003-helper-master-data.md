---
title: Manage Helper Master Data
story_id: US-003
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
sprint: Sprint 1
story_points: 3
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
related_stories:
  - US-002-driver-master-data.md
  - US-018-to-execution-own-fleet.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, helper, registration, critical]
---

# US-003: Manage Helper Master Data

## User Story

**As a** Fleet Manager  
**I want to** register and manage helper profiles with their contact information and availability status  
**So that** I can assign helpers to transport orders for loading/unloading assistance

## Business Context

Helpers assist drivers with loading, unloading, and handling goods during transport. Proper helper management ensures:
- **Operational Efficiency**: Faster loading/unloading with trained helpers
- **Product Safety**: Proper handling reduces damage
- **Availability Tracking**: Know which helpers are available for assignment
- **Performance Monitoring**: Track helper productivity and reliability

---

## Acceptance Criteria

### AC-1: Helper Registration (per PRD 6.6.3)
- [ ] System SHALL allow Transport Distribution Officer (TDO) to create helper profile with:
  - Helper Name (required)
  - National ID (unique, required, per PRD: "Each helper MUST have a unique national ID")
  - Reference from known contacts (required, minimum 1 contact, per PRD)
  - Contact Phone (unique, optional)
  - Date of Birth (optional)
  - Current Address (optional)
  - Photo (optional)
  - Employment Type (Own Staff / Contractual / Vendor)
  - Join Date (optional)
  - Vendor ID (if vendor helper, nullable)
- [ ] System SHALL validate mandatory fields (Name, National ID, Reference Contact)
- [ ] System SHALL prevent duplicate NID (unique constraint)
- [ ] System SHALL allow helper profile update with audit logging (per PRD)

### AC-2: Helper Availability
- [ ] System SHALL maintain helper status:
  - Available, On Trip, On Leave, Terminated
- [ ] System SHALL auto-update status when assigned to trip
- [ ] System SHALL allow marking helper on leave

### AC-3: Helper Performance
- [ ] System SHALL track:
  - Total trips completed
  - Last trip date
  - Incident count
- [ ] System SHALL display performance on helper profile

### AC-4: Helper Management
- [ ] System SHALL provide helper list with search and filter
- [ ] System SHALL allow editing helper information
- [ ] System SHALL allow viewing helper trip history
- [ ] System SHALL prevent deleting helpers (soft delete only)

---

## Functional Requirements

### FR-001: Helper Registration
- [Critical] Simple registration form (fewer fields than driver)
- [Critical] Helper profile update with audit logging (per PRD)
- [High] Bulk import via Excel
- [Medium] Photo upload (optional)

### FR-004: Bulk Upload & Inline Management (per PRD 6.3.2)
- [Critical] Bulk upload option for helper master data
- [Critical] CSV file format (UTF-8 encoded)
- [Critical] Entity-specific CSV templates with mandatory fields marked
- [Critical] Append-only behavior (existing records not overwritten)
- [Critical] Row-level and column-level inline editing
- [Critical] Independent row validation with detailed error reports
- [Critical] Comprehensive audit logging for all bulk operations

### FR-002: Status Management
- [Critical] Auto-update status on trip assignment/completion
- [High] Leave management
- [Medium] Performance tracking

### FR-003: Integration
- [Critical] API for helper availability check
- [Critical] Link helper to trip records

---

## Business Rules

### BR-HM-001: Unique Identifiers
- NID and Phone must be unique
- **Enforcement**: Database constraints

### BR-HM-002: Status-Based Assignment
- Only "Available" helpers can be assigned
- **Enforcement**: API validation

### BR-HM-003: Vendor Helper Linkage
- Vendor helpers must be linked to verified vendor
- **Enforcement**: Foreign key constraint

---

## Data Model

```typescript
Helper {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  full_name: String
  national_id: String (unique)
  date_of_birth: Date
  phone: String (unique)
  address: Text
  emergency_contact_name: String
  emergency_contact_phone: String
  photo_url: String (nullable)
  
  employment_type: Enum (Own_Staff, Contractual, Vendor)
  join_date: Date
  vendor_id: UUID (FK, nullable)
  
  status: Enum (Available, On_Trip, On_Leave, Terminated)
  
  total_trips: Integer (default: 0)
  last_trip_date: Date (nullable)
  incident_count: Integer (default: 0)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
}
```

---

## UI/UX Requirements

### Helper Registration Form
```
┌─────────────────────────────────────────┐
│ Register New Helper                     │
├─────────────────────────────────────────┤
│ Full Name: *                            │
│ [_____________________________]         │
│                                         │
│ National ID: *                          │
│ [_____________________________]         │
│                                         │
│ Phone: *                                │
│ [_____________________________]         │
│                                         │
│ Employment Type: *                      │
│ [Own Staff                    ▼]        │
│                                         │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/helpers
GET /api/v1/helpers?status=Available
GET /api/v1/helpers/{helper_id}
PATCH /api/v1/helpers/{helper_id}
GET /api/v1/helpers/available

// Bulk Upload APIs
POST /api/v1/helpers/bulk-upload
Body: {file: CSV file}
Response: {upload_id, total_rows, successful_rows, failed_rows, errors}

GET /api/v1/helpers/bulk-upload/template
Response: CSV template download

PATCH /api/v1/helpers/{id}  - Inline edit (row/column level)
Body: {field_name: new_value}
```

---

## Testing Scenarios

### Happy Path
1. Register helper → Success
2. Assign to trip → Status = "On Trip"
3. Complete trip → Status = "Available"

### Edge Cases
1. Duplicate NID → Error
2. Helper on leave → Not in available list

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management

### Enables
- → US-018: TO Execution (helper assignment)

---

## Definition of Done
- [ ] CRUD operations functional
- [ ] Status management working
- [ ] Integration with trip assignment
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 1  
**Priority**: Critical

---

**Source Documents**:
- PRD Section 6.6.3: Helper Profile & Helper Assignment
- PRD Section 6.3.2: Bulk Upload & Inline Master Data Management

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

