---
title: Vendor Blacklist Management
story_id: US-034
phase: phase-1
module: Vendor Management
priority: Medium
status: Pending
epic: Vendor Compliance
sprint: Sprint 10
story_points: 3
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
related_stories:
  - US-028-vendor-performance-tracking.md
dependencies:
  - US-027-vendor-registration-verification.md
tags: [vendor, blacklist, compliance, medium-priority]
---

# US-034: Vendor Blacklist Management

## User Story

**As a** Vendor Manager  
**I want to** blacklist vendors with poor performance or compliance issues  
**So that** unreliable vendors are prevented from receiving future assignments

## Business Context

Blacklist management protects against:
- **Poor Service**: Repeatedly failing vendors
- **Fraud**: Dishonest or fraudulent vendors
- **Compliance Violations**: Vendors violating terms
- **Safety Issues**: Vendors with safety incidents

**Blacklist Reasons**:
- Repeated poor performance (< 60% score for 3 months)
- Fraud or dishonesty
- Safety violations
- Contract breaches
- Legal issues

---

## Acceptance Criteria

### AC-1: Blacklist Addition
- [ ] System SHALL allow adding vendor to blacklist with:
  - Reason *
  - Supporting evidence (documents, photos)
  - Blacklist duration (temporary/permanent)
  - Effective date
- [ ] System SHALL require senior manager approval
- [ ] System SHALL notify vendor of blacklisting
- [ ] System SHALL update vendor status to "Blacklisted"

### AC-2: Blacklist Enforcement
- [ ] System SHALL prevent blacklisted vendors from:
  - Receiving bid invitations
  - Being assigned TOs
  - Accessing vendor portal (read-only access)
- [ ] System SHALL show blacklist warning on vendor profile
- [ ] System SHALL block all vendor operations

### AC-3: Blacklist Review
- [ ] System SHALL allow vendor to appeal blacklisting
- [ ] System SHALL track appeal status
- [ ] System SHALL allow reviewing appeals
- [ ] System SHALL allow removing from blacklist after review

### AC-4: Temporary Blacklist
- [ ] System SHALL support temporary blacklist (e.g., 3 months)
- [ ] System SHALL auto-remove after duration expires
- [ ] System SHALL send notification before removal
- [ ] System SHALL allow extending blacklist period

### AC-5: Blacklist History
- [ ] System SHALL maintain blacklist history
- [ ] System SHALL track:
  - Blacklist date
  - Reason
  - Duration
  - Removed date (if applicable)
  - Approver
- [ ] System SHALL prevent re-blacklisting without new reason

---

## Functional Requirements

### FR-001: Blacklist Management
- [Critical] Add/remove from blacklist
- [Critical] Approval workflow
- [High] Appeal management
- [Medium] Blacklist analytics

### FR-002: Enforcement
- [Critical] Block bid invitations
- [Critical] Block TO assignments
- [High] Portal access restriction
- [Medium] Auto-removal for temporary blacklist

---

## Business Rules

### BR-BLACK-001: Approval Required
- Blacklisting requires senior manager approval
- **Enforcement**: Approval workflow

### BR-BLACK-002: Notification Mandatory
- Vendor must be notified of blacklisting with reason
- **Enforcement**: Notification trigger

### BR-BLACK-003: Auto-Blacklist Trigger
- Vendor with performance score < 60% for 3 consecutive months → Auto-flagged for review
- **Enforcement**: Automated check

---

## Data Model

```typescript
VendorBlacklist {
  id: UUID (PK)
  vendor_id: UUID (FK)
  
  reason: Text
  reason_category: Enum (
    Poor_Performance,
    Fraud,
    Safety_Violation,
    Contract_Breach,
    Legal_Issue,
    Other
  )
  
  supporting_evidence: JSON (array of document URLs)
  
  blacklist_type: Enum (Temporary, Permanent)
  duration_months: Integer (nullable, for temporary)
  
  effective_from: Date
  effective_to: Date (nullable, for temporary)
  
  status: Enum (Pending_Approval, Active, Appealed, Removed)
  
  requested_by: UUID (FK to User)
  requested_at: Timestamp
  approved_by: UUID (FK, nullable)
  approved_at: Timestamp (nullable)
  
  appeal_reason: Text (nullable)
  appeal_submitted_at: Timestamp (nullable)
  appeal_reviewed_by: UUID (FK, nullable)
  appeal_decision: Enum (Approved, Rejected) (nullable)
  
  removed_at: Timestamp (nullable)
  removal_reason: Text (nullable)
}
```

---

## UI/UX Requirements

### Blacklist Vendor Form
```
┌─────────────────────────────────────────┐
│ Blacklist Vendor: ABC Logistics         │
├─────────────────────────────────────────┤
│ ⚠️ This action will prevent the vendor  │
│ from receiving any future assignments.  │
│                                         │
│ Reason Category: *                      │
│ [Poor Performance          ▼]           │
│                                         │
│ Detailed Reason: *                      │
│ ┌─────────────────────────────────────┐ │
│ │ Vendor has maintained performance   │ │
│ │ score < 60% for 3 consecutive       │ │
│ │ months. Multiple incidents and      │ │
│ │ delays reported.                    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Supporting Evidence:                    │
│ [📄 Upload Documents]                   │
│ • Performance Report Q1 2026.pdf        │
│ • Incident Reports.pdf                  │
│                                         │
│ Blacklist Type: *                       │
│ ⚪ Temporary  ⚪ Permanent               │
│                                         │
│ Duration: (if temporary)                │
│ [6] months                              │
│                                         │
│ ⚠️ Requires Senior Manager Approval     │
│                                         │
│ [Cancel]              [Submit Request]  │
└─────────────────────────────────────────┘
```

### Blacklist Warning on Vendor Profile
```
┌─────────────────────────────────────────┐
│ ⛔ BLACKLISTED VENDOR                   │
├─────────────────────────────────────────┤
│ This vendor is blacklisted and cannot   │
│ receive assignments.                    │
│                                         │
│ Reason: Poor Performance                │
│ Effective: Mar 1, 2026                  │
│ Type: Temporary (6 months)              │
│ Expires: Sep 1, 2026                    │
│                                         │
│ [View Blacklist Details]                │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/vendors/{vendor_id}/blacklist
Body: {
  reason, reason_category, supporting_evidence,
  blacklist_type, duration_months?
}

POST /api/v1/vendor-blacklists/{blacklist_id}/approve
Body: {approved_by_user_id}

POST /api/v1/vendor-blacklists/{blacklist_id}/appeal
Body: {appeal_reason}

DELETE /api/v1/vendor-blacklists/{blacklist_id}
Body: {removal_reason}

GET /api/v1/vendors/blacklisted
Response: {vendors: Vendor[]}
```

---

## Testing Scenarios

### Happy Path
1. Request blacklist → Approval required
2. Senior manager approves → Vendor blacklisted
3. Vendor appeals → Appeal reviewed
4. Temporary blacklist expires → Auto-removed

### Edge Cases
1. **Blacklisted vendor receives bid**: Blocked
2. **Temporary blacklist expires**: Auto-removed, vendor notified
3. **Appeal approved**: Removed from blacklist

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration

### Enables
- → Vendor quality control
- → Risk mitigation

---

## Definition of Done
- [ ] Blacklist CRUD functional
- [ ] Approval workflow working
- [ ] Enforcement (bid/TO blocking)
- [ ] Appeal management
- [ ] Temporary blacklist auto-removal
- [ ] Notifications sent
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 3  
**Estimated Hours**: 24 hours  
**Sprint**: Sprint 10  
**Priority**: Medium

