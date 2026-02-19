---
title: Manage Vendor Master Data
story_id: US-004
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
sprint: Sprint 1
story_points: 5
created: 2026-02-11
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/05-vendor-management/vendor-onboarding.md
related_stories:
  - US-027-vendor-registration.md
  - US-029-vendor-verification.md
dependencies:
  - US-007-user-role-management.md
tags: [master-data, vendor, registration, critical]
---

# US-004: Manage Vendor Master Data

## User Story

**As a** transport vendor  
**I want to** register my company and vehicles on DFMS so that I can participate in transport bidding and execute trips for the organization

## Business Context

Vendors are external transport providers who supplement the own fleet. Proper vendor management enables:
- **Fleet Expansion**: Access to additional vehicles without capital investment
- **Cost Optimization**: Competitive pricing through vendor bidding
- **Risk Mitigation**: Diversified transport provider base
- **Compliance**: Track vendor licenses, insurance, certifications

---

## Acceptance Criteria

### AC-1: Vendor Registration (per PRD)
- [ ] System SHALL provide vendor self-registration interface (web/mobile)
- [ ] System SHALL capture vendor registration form with:
  - Company details
  - Vendor type: Contractual (Fixed Rate) or Non-Contractual
  - Contact Information
  - Testimonial / reference from Truck Association
- [ ] System SHALL require mandatory compliance document uploads:
  - Trade License
  - BIN
  - TIN
- [ ] System SHALL allow vendor contract type selection:
  - **Contractual Vendor**: Can be directly assigned to TOs by TDO (Transport Distribution Officer) instead of bidding
  - **Non-Contractual Vendor**: Sent bidding notification with vehicle requirement, route information, optional expected bid price. After approval/winning, vendors add vehicle and driver information with the TO
- [ ] Vendor profile SHALL be saved in **Pending Verification** status
- [ ] Submitted vendor profile SHALL remain inactive until admin approval
- [ ] Vendors SHALL NOT access bidding or TO details before approval
- [ ] Vendor registration data SHALL be tenant-specific and isolated
- [ ] System SHALL allow vendors to manage multiple vehicles under one profile
- [ ] System SHALL allow rejected vendors to resubmit corrected information
- [ ] All vendor registration attempts SHALL be logged for audit

### AC-2: Vendor Verification Status (per PRD)
- [ ] System SHALL maintain verification status:
  - **Pending Verification** (default after registration)
  - Under Review
  - Verified (active, can bid/receive TOs)
  - Rejected (can resubmit)
  - Suspended
- [ ] System SHALL allow only verified vendors to bid/receive TOs
- [ ] System SHALL track verification date and verifier
- [ ] System SHALL prevent vendor access to bidding or TO details before approval

### AC-3: Vendor Document Management
- [ ] System SHALL allow uploading vendor documents:
  - Trade License
  - TIN Certificate
  - Insurance Certificate
  - Bank Statement
- [ ] System SHALL track document expiry dates
- [ ] System SHALL generate expiry alerts

### AC-4: Vendor Fleet Linkage
- [ ] System SHALL link vendor to their vehicles (US-001)
- [ ] System SHALL link vendor to their drivers (US-002)
- [ ] System SHALL display vendor's available fleet

### AC-5: Vendor Performance Tracking
- [ ] System SHALL track:
  - Total TOs completed
  - On-time delivery %
  - Average cost per trip
  - Incident count
  - Rating (if enabled)
- [ ] System SHALL calculate metrics from trip data

---

## Functional Requirements

### FR-001: Vendor Registration (per PRD)
- [Critical] System SHALL provide vendor self-registration interface (web/mobile)
- [Critical] System SHALL require document uploads (trade license, BIN, TIN) before submission
- [High] Vendor registration form SHALL capture company, vehicle, driver, and compliance data
- [High] System SHALL allow vendors to manage multiple vehicles under one profile
- [High] System SHALL allow rejected vendors to resubmit corrected information
- [High] All vendor registration attempts SHALL be logged for audit

### FR-002: Verification Workflow
- [Critical] Admin approval workflow
- [Critical] Status transition tracking
- [High] Rejection reason capture

### FR-003: Performance Tracking
- [High] Auto-calculate performance metrics
- [High] Performance dashboard per vendor
- [Medium] Comparative vendor analysis

### FR-004: Bulk Upload & Inline Management (per PRD 6.3.2)
- [Critical] Bulk upload option for vendor master data
- [Critical] CSV file format (UTF-8 encoded)
- [Critical] Entity-specific CSV templates with mandatory fields marked
- [Critical] Append-only behavior (existing records not overwritten)
- [Critical] Row-level and column-level inline editing
- [Critical] Independent row validation with detailed error reports
- [Critical] Comprehensive audit logging for all bulk operations

---

## Business Rules

### BR-VM-001: Unique Identifiers
- Trade License and TIN must be unique
- **Enforcement**: Database constraints

### BR-VM-002: Verification Requirement
- Only verified vendors can bid or receive direct assignments
- **Enforcement**: API validation

### BR-VM-003: Contractual Vendor Rates
- Contractual vendors have pre-agreed rates (no bidding)
- **Enforcement**: Business logic in TO assignment

### BR-VM-004: Document Expiry
- Vendors with expired critical documents cannot receive new TOs
- **Enforcement**: Validation during assignment

---

## Data Model

```typescript
Vendor {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  company_name: String
  trade_license_number: String (unique)
  tin_number: String (unique)
  company_address: Text
  
  contact_person_name: String
  contact_phone: String (unique)
  contact_email: String
  
  vendor_type: Enum (Contractual, Non_Contractual)
  contract_start_date: Date (nullable)
  contract_end_date: Date (nullable)
  agreed_rate_per_km: Decimal (nullable, for contractual)
  
  bank_account_number: String
  bank_name: String
  bank_branch: String
  
  fleet_size: Integer
  
  verification_status: Enum (
    Pending,
    Under_Review,
    Verified,
    Rejected,
    Suspended
  )
  verification_date: Date (nullable)
  verified_by: UUID (FK to User, nullable)
  rejection_reason: Text (nullable)
  
  total_tos_completed: Integer (default: 0)
  on_time_delivery_percentage: Decimal (nullable)
  average_cost_per_trip: Decimal (nullable)
  incident_count: Integer (default: 0)
  average_rating: Decimal (nullable)
  
  created_at: Timestamp
  created_by: UUID (FK)
  updated_at: Timestamp
  updated_by: UUID (FK)
}

VendorDocument {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  document_type: Enum (
    Trade_License,
    TIN_Certificate,
    Insurance_Certificate,
    Bank_Statement,
    Other
  )
  
  file_name: String
  file_url: String
  issue_date: Date (nullable)
  expiry_date: Date (nullable)
  
  uploaded_at: Timestamp
}
```

---

## UI/UX Requirements

### Vendor Registration Form
```
┌─────────────────────────────────────────┐
│ Register New Vendor                     │
├─────────────────────────────────────────┤
│ Company Name: *                         │
│ [_____________________________]         │
│                                         │
│ Trade License: *                        │
│ [_____________________________]         │
│                                         │
│ TIN Number: *                           │
│ [_____________________________]         │
│                                         │
│ Vendor Type: *                          │
│ ⚪ Contractual  ⚪ Non-Contractual       │
│                                         │
│ Contact Person: *                       │
│ [_____________________________]         │
│                                         │
│ Phone: *                                │
│ [_____________________________]         │
│                                         │
│ [Cancel]              [Save]            │
└─────────────────────────────────────────┘
```

### Vendor List View
```
┌──────────────────────────────────────────────────────────────┐
│ Vendor Management                [+ Add Vendor]              │
├──────────────────────────────────────────────────────────────┤
│ Company         Type          Status      Rating    Action   │
│ ──────────────────────────────────────────────────────────  │
│ ABC Logistics   Contractual   ✅ Verified  ⭐4.5    [View]  │
│ XYZ Transport   Non-Contract  ⏳ Pending   -        [View]  │
│ QuickMove Ltd   Non-Contract  ✅ Verified  ⭐4.2    [View]  │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/vendors
GET /api/v1/vendors?status=Verified&type=Non_Contractual
GET /api/v1/vendors/{vendor_id}
PATCH /api/v1/vendors/{vendor_id}
POST /api/v1/vendors/{vendor_id}/documents
PATCH /api/v1/vendors/{vendor_id}/verification-status
GET /api/v1/vendors/{vendor_id}/performance

// Bulk Upload APIs
POST /api/v1/vendors/bulk-upload
Body: {file: CSV file}
Response: {upload_id, total_rows, successful_rows, failed_rows, errors}

GET /api/v1/vendors/bulk-upload/template
Response: CSV template download

PATCH /api/v1/vendors/{id}  - Inline edit (row/column level)
Body: {field_name: new_value}
```

---

## Testing Scenarios

### Happy Path
1. Register vendor → Pending status
2. Admin verifies → Verified status
3. Vendor receives TO → Performance tracked

### Edge Cases
1. Duplicate Trade License → Error
2. Unverified vendor tries to bid → Blocked
3. Expired insurance → Cannot receive new TOs

---

## Dependencies

### Prerequisites
- ✅ US-007: User & Role Management

### Enables
- → US-027-029: Vendor onboarding workflow
- → US-020: Vendor bidding
- → US-019: Direct vendor assignment

---

## Definition of Done
- [ ] CRUD operations functional
- [ ] Verification workflow working
- [ ] Document management complete
- [ ] Performance tracking implemented
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 1  
**Priority**: Critical

---

**Source Documents**:
- PRD Section 6.7: Vendor Management (Vendor Onboarding & Registration, Vendor Verification Workflow)
- PRD Section 6.3.2: Bulk Upload & Inline Master Data Management

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

