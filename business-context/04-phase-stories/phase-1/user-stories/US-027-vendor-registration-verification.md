---
title: Vendor Registration & Verification Workflow
story_id: US-027
phase: phase-1
module: Vendor Management
priority: Critical
status: Pending
epic: Vendor Onboarding
sprint: Sprint 8
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/05-vendor-management/vendor-onboarding.md
related_stories:
  - US-004-vendor-master-data.md
  - US-024-vendor-bidding-portal.md
dependencies:
  - US-004-vendor-master-data.md
tags: [vendor, registration, verification, onboarding, critical]
---

# US-027: Vendor Registration & Verification Workflow

## User Story

**As a** transport vendor  
**I want to** register my company and vehicles on DFMS so that I can participate in transport bidding and execute trips for the organization

## Business Context

Vendor verification ensures:
- **Quality Control**: Only qualified vendors in network
- **Risk Mitigation**: Reduce fraud and poor service
- **Compliance**: Meet regulatory requirements
- **Trust Building**: Establish reliable vendor partnerships

**Vendor Types**:
1. **Contractual Vendors**: Long-term contracts with fixed rates
2. **Non-Contractual Vendors**: Participate in bidding, market rates

**Verification Process**:
```
Registration → Document Submission → Verification → Approval/Rejection
```

---

## Acceptance Criteria

### AC-1: Vendor Self-Registration
- [ ] System SHALL provide public vendor registration form
- [ ] System SHALL capture:
  - Company name *
  - Trade license number *
  - Owner/Contact person name *
  - Phone * and Email *
  - Business address *
  - Vendor type (Contractual/Non-Contractual) *
  - Fleet size and types
  - Service areas (districts/regions)
  - Bank account details
- [ ] System SHALL validate:
  - Unique trade license number
  - Valid phone and email format
  - Required fields completed
- [ ] System SHALL send verification email/SMS

### AC-2: Document Submission
- [ ] System SHALL require uploading documents:
  - Trade License * (PDF/Image)
  - TIN Certificate *
  - Bank Account Statement *
  - Vehicle Registration Certificates (for each vehicle)
  - Driver Licenses (for each driver)
  - Insurance Certificates
  - Tax Clearance Certificate
- [ ] System SHALL validate file types and sizes
- [ ] System SHALL store documents securely (encrypted)
- [ ] System SHALL track document expiry dates

### AC-3: Verification Workflow
- [ ] System SHALL create verification task for Vendor Manager
- [ ] System SHALL display vendor details and documents for review
- [ ] System SHALL allow Vendor Manager to:
  - Verify each document (mark as verified/rejected)
  - Add verification notes
  - Request additional documents
  - Approve or reject vendor registration
- [ ] System SHALL track verification status:
  - Pending Verification
  - Documents Under Review
  - Additional Documents Requested
  - Verified
  - Rejected

### AC-4: Vendor Contract Type Selection (per PRD)
- [ ] System SHALL allow vendor to select contract type during registration:
  - **Contractual (Fixed Rate)**: Can be directly assigned TOs by TDO without bidding
  - **Non-Contractual**: Must participate in bidding to receive TOs
- [ ] System SHALL enforce contract type in TO assignment workflow
- [ ] Contractual vendors SHALL NOT see bidding opportunities (direct assignment only)
- [ ] Non-contractual vendors SHALL receive bidding notifications

### AC-5: Approval/Rejection (per PRD)
- [ ] System SHALL update vendor status to "Verified" (active) after admin approval
- [ ] System SHALL send approval notification to vendor
- [ ] System SHALL grant vendor portal access after approval
- [ ] System SHALL send rejection notification with reason if rejected
- [ ] System SHALL allow rejected vendors to resubmit corrected information
- [ ] All vendor registration attempts SHALL be logged for audit

---

## Functional Requirements

### FR-001: Registration Form (per PRD)
- [Critical] Vendor self-registration interface (web/mobile)
- [Critical] Multi-step form capturing:
  - Company details
  - Vendor type (Contractual/Non-Contractual)
  - Contact Information
  - Testimonial/reference from Truck Association
  - Vehicle, driver, and compliance data
- [Critical] Document uploads (trade license, BIN, TIN) required before submission
- [High] Form validation and error messages
- [High] Allow vendors to manage multiple vehicles under one profile
- [Medium] Auto-save draft (session storage)

### FR-002: Document Management
- [Critical] Secure document upload (S3/cloud storage)
- [Critical] Document viewer for verification
- [High] Document expiry tracking
- [Medium] OCR for automatic data extraction (future)

### FR-003: Verification Dashboard
- [Critical] Vendor verification queue for Vendor Manager
- [Critical] Document review interface
- [High] Verification checklist
- [Medium] Bulk verification actions

### FR-004: Notification System
- [Critical] Email and SMS notifications at each stage
- [High] In-app notifications for vendor portal
- [Medium] Reminder notifications for pending verifications

---

## Business Rules

### BR-VEN-001: Unique Trade License
- Trade license number must be unique in system
- **Enforcement**: Database unique constraint

### BR-VEN-002: Mandatory Documents (per PRD)
- Trade License, BIN, TIN are mandatory
- Documents must be uploaded before submission
- **Enforcement**: Form validation

### BR-VEN-003: Document Expiry
- Documents with expiry dates must be valid for at least 30 days
- **Enforcement**: Date validation

### BR-VEN-004: Verification Authority
- Only Vendor Manager role can verify vendors
- Senior Manager approval required for final verification
- **Enforcement**: RBAC

### BR-VEN-005: Reapplication Period (per PRD)
- Rejected vendors can resubmit corrected information immediately
- All registration attempts are logged for audit
- **Enforcement**: System logging

---

## Data Model

```typescript
Vendor {
  // ... existing fields from US-004 ...
  
  // Registration fields
  registration_status: Enum (
    Draft,
    Pending_Verification,  // Default status per PRD
    Under_Review,
    Verified,  // Active, can bid/receive TOs
    Rejected  // Can resubmit
  )
  
  vendor_type: Enum (
    Contractual,  // Fixed Rate, direct assignment
    Non_Contractual  // Bidding required
  )
  
  registered_at: Timestamp
  submitted_at: Timestamp (nullable)
  verified_at: Timestamp (nullable)
  verified_by: UUID (FK to User, nullable)
  rejection_reason: Text (nullable)
  rejected_at: Timestamp (nullable)
  
  profile_completion_percentage: Integer (computed)
}

VendorDocument {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  document_type: Enum (
    Trade_License,
    TIN_Certificate,
    Bank_Statement,
    Vehicle_Registration,
    Driver_License,
    Insurance_Certificate,
    Tax_Clearance,
    Other
  )
  
  file_name: String
  file_url: String (encrypted)
  file_size: Integer
  
  expiry_date: Date (nullable)
  is_expired: Boolean (computed)
  
  verification_status: Enum (Pending, Verified, Rejected, Expired)
  verified_by: UUID (FK to User, nullable)
  verified_at: Timestamp (nullable)
  verification_notes: Text (nullable)
  
  uploaded_at: Timestamp
}

VendorVerificationHistory {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  action: Enum (
    Submitted,
    Documents_Reviewed,
    Additional_Docs_Requested,
    Approved,
    Rejected
  )
  
  action_by: UUID (FK to User)
  action_at: Timestamp
  notes: Text (nullable)
}
```

---

## UI/UX Requirements

### Vendor Registration Form (Public)
```
┌─────────────────────────────────────────┐
│ Vendor Registration                     │
│ Step 1 of 3: Company Information        │
├─────────────────────────────────────────┤
│ Company Name: *                         │
│ [ABC Logistics Ltd.]                    │
│                                         │
│ Trade License Number: *                 │
│ [TL-123456789]                          │
│                                         │
│ Owner/Contact Person: *                 │
│ [Karim Ahmed]                           │
│                                         │
│ Phone: *                                │
│ [01711-123456]                          │
│                                         │
│ Email: *                                │
│ [karim@abclogistics.com]                │
│                                         │
│ Business Address: *                     │
│ ┌─────────────────────────────────────┐ │
│ │ 123 Main Street, Dhaka              │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Vendor Type: *                          │
│ ⚪ Contractual  ⚪ Non-Contractual      │
│                                         │
│ [Back]                    [Next Step]   │
└─────────────────────────────────────────┘
```

### Verification Dashboard (Vendor Manager)
```
┌──────────────────────────────────────────────────────────────┐
│ Vendor Verification Queue                                    │
├──────────────────────────────────────────────────────────────┤
│ Vendor Name      Trade License  Status            Action     │
│ ──────────────────────────────────────────────────────────  │
│ ABC Logistics    TL-123456789   📄 Documents Ready  [Review] │
│ Submitted: 2 days ago                                        │
│                                                              │
│ XYZ Transport    TL-987654321   ⏳ Pending Docs    [View]   │
│ Submitted: 5 days ago                                        │
└──────────────────────────────────────────────────────────────┘
```

### Document Verification Interface
```
┌─────────────────────────────────────────┐
│ Verify Vendor: ABC Logistics            │
├─────────────────────────────────────────┤
│ Documents Checklist:                    │
│                                         │
│ ✅ Trade License                         │
│    [View] Valid until: Dec 2026         │
│    Status: Verified ✓                   │
│                                         │
│ ✅ TIN Certificate                       │
│    [View] No expiry                     │
│    Status: Verified ✓                   │
│                                         │
│ ⏳ Bank Statement                        │
│    [View] Uploaded: Feb 10              │
│    Status: Pending Review               │
│    [✓ Verify] [✗ Reject]                │
│                                         │
│ ❌ Insurance Certificate                 │
│    Status: Not Uploaded                 │
│                                         │
│ Verification Notes:                     │
│ ┌─────────────────────────────────────┐ │
│ │ All documents verified. Approved.   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Request More Docs] [Reject] [Approve]  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Vendor self-registration
POST /api/v1/vendors/register
Body: {
  company_name, trade_license_number,
  owner_name, phone, email, address,
  vendor_type
}
Response: {vendor_id, registration_token}

// Upload document
POST /api/v1/vendors/{vendor_id}/documents
Body: FormData (file, document_type, expiry_date?)
Response: {document_id, file_url}

// Submit for verification
POST /api/v1/vendors/{vendor_id}/submit-for-verification
Response: {vendor, status: 'Submitted'}

// Get vendors pending verification
GET /api/v1/vendors/pending-verification
Response: {vendors: Vendor[]}

// Verify document
PATCH /api/v1/vendor-documents/{document_id}/verify
Body: {verified: boolean, notes?: string}

// Approve vendor
POST /api/v1/vendors/{vendor_id}/approve
Body: {approved_by_user_id, notes?: string}
Response: {vendor, status: 'Verified'}

// Reject vendor
POST /api/v1/vendors/{vendor_id}/reject
Body: {reason: string}
Response: {vendor, status: 'Rejected'}
```

---

## Testing Scenarios

### Happy Path
1. Vendor registers → Registration submitted
2. Vendor uploads documents → Documents stored
3. Vendor submits for verification → Verification task created
4. Vendor Manager reviews → Documents verified
5. Vendor Manager approves → Vendor status = "Verified"
6. Vendor receives approval notification → Portal access granted

### Edge Cases
1. **Duplicate trade license**: Validation error
2. **Expired document uploaded**: Warning, request new document
3. **Missing mandatory documents**: Cannot submit for verification
4. **Rejected vendor reapplies within 30 days**: Blocked

---

## Dependencies

### Prerequisites
- ✅ US-004: Vendor Master Data

### Enables
- → US-024: Vendor Bidding Portal (verified vendors only)
- → US-031: Vendor Portal (verified vendors get access)
- → All vendor-related features

---

## Definition of Done
- [ ] Registration form functional
- [ ] Document upload working
- [ ] Verification workflow complete
- [ ] Approval/rejection working
- [ ] Notifications sent at each stage
- [ ] Document expiry tracking
- [ ] Vendor portal access granted on approval
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 8  
**Priority**: Critical (Blocker for vendor operations)

