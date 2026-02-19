---
title: Vendor Contract Management
story_id: US-033
phase: phase-1
module: Vendor Management
priority: Medium
status: Pending
epic: Vendor Financial Management
epic_id: EPIC-008
epic_name: Distribution & Procurement Management
sprint: Sprint 10
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/05-vendor-management/vendor-onboarding.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-027-vendor-registration-verification.md
  - US-019-to-execution-vendor-direct.md
dependencies:
  - US-027-vendor-registration-verification.md
tags: [vendor, contract, agreement, medium-priority]
---

# US-033: Vendor Contract Management

## User Story

**As a** Vendor Manager  
**I want to** manage vendor contracts with terms, rates, and validity periods  
**So that** contractual vendors have predefined rates and terms for direct assignment

## Business Context

Contract management enables:
- **Fixed Rates**: Predefined pricing for contractual vendors
- **Terms & Conditions**: Clear agreement on service levels
- **Compliance**: Track contract validity and renewals
- **Cost Predictability**: Budget planning with fixed rates

**Contract Types**:
- **Annual Contract**: 1-year fixed rates
- **Quarterly Contract**: 3-month fixed rates
- **Route-specific Contract**: Fixed rates for specific routes
- **Volume-based Contract**: Rates based on volume commitment

---

## Acceptance Criteria

### AC-1: Contract Creation (per PRD)
- [ ] System SHALL allow creating vendor contract for Contractual vendors with:
  - Contract number (auto-generated)
  - Vendor * (must be marked as Contractual type)
  - Contract type: Contractual (Fixed Rate)
  - Start date *
  - End date *
  - Fixed rate structure (pre-configured, hidden from vendor)
  - Routes covered (if route-specific)
  - Terms and conditions
  - Contract document upload (PDF)
- [ ] System SHALL validate start date < end date
- [ ] System SHALL prevent overlapping contracts for same vendor/route
- [ ] Contractual vendors SHALL be directly assigned TOs by TDO without bidding
- [ ] Contractual rates SHALL be hidden from vendor (pre-configured by admin)

### AC-2: Rate Management
- [ ] System SHALL allow defining rates:
  - Per km rate (e.g., BDT 100/km)
  - Per trip flat rate
  - Route-specific rates
  - Vehicle type-specific rates
- [ ] System SHALL allow rate revisions (with version history)
- [ ] System SHALL apply correct rate based on TO details

### AC-3: Contract Status Tracking
- [ ] System SHALL track contract status:
  - Draft
  - Active
  - Expiring Soon (30 days before end)
  - Expired
  - Terminated
- [ ] System SHALL send alerts for expiring contracts
- [ ] System SHALL prevent using expired contracts

### AC-4: Contract Renewal
- [ ] System SHALL allow renewing contracts
- [ ] System SHALL copy terms from previous contract
- [ ] System SHALL allow updating rates during renewal
- [ ] System SHALL maintain contract history

### AC-5: Contract Termination
- [ ] System SHALL allow early termination with reason
- [ ] System SHALL require approval for termination
- [ ] System SHALL notify vendor of termination

---

## Functional Requirements

### FR-001: Contract CRUD
- [Critical] Create/update/view contracts
- [High] Contract document upload
- [High] Rate structure definition
- [Medium] Contract templates

### FR-002: Rate Application
- [Critical] Auto-apply contract rates during TO assignment
- [High] Rate version control
- [Medium] Rate comparison (contract vs market)

### FR-003: Expiry Management
- [High] Expiry alerts (30, 15, 7 days before)
- [High] Auto-status update on expiry
- [Medium] Renewal workflow

---

## Business Rules

### BR-CONT-001: Contract Validity
- Only active contracts can be used for direct assignment
- **Enforcement**: Status check

### BR-CONT-002: Rate Application Priority
- Contract rate > Market rate (for contractual vendors)
- **Enforcement**: Rate selection logic

### BR-CONT-003: Overlapping Contracts
- No overlapping active contracts for same vendor/route
- **Enforcement**: Date range validation

---

## Data Model

```typescript
VendorContract {
  id: UUID (PK)
  contract_number: String (unique)
  vendor_id: UUID (FK)
  
  contract_type: Enum (Annual, Quarterly, Route_Specific, Volume_Based)
  start_date: Date
  end_date: Date
  
  rate_structure_type: Enum (Per_KM, Per_Trip, Custom)
  default_rate_per_km: Decimal (nullable)
  default_rate_per_trip: Decimal (nullable)
  
  routes_covered: JSON (array of {source_poi_id, destination_poi_id, rate})
  vehicle_type_rates: JSON (array of {vehicle_type, rate})
  
  terms_and_conditions: Text
  contract_document_url: String (nullable)
  
  status: Enum (Draft, Active, Expiring_Soon, Expired, Terminated)
  termination_reason: Text (nullable)
  terminated_at: Timestamp (nullable)
  
  created_by: UUID (FK to User)
  created_at: Timestamp
  approved_by: UUID (FK, nullable)
  approved_at: Timestamp (nullable)
}

ContractRateHistory {
  id: UUID (PK)
  contract_id: UUID (FK)
  
  rate_version: Integer
  rate_structure: JSON
  effective_from: Date
  effective_to: Date (nullable)
  
  updated_by: UUID (FK to User)
  updated_at: Timestamp
}
```

---

## UI/UX Requirements

### Contract Creation Form
```
┌─────────────────────────────────────────┐
│ Create Vendor Contract                  │
├─────────────────────────────────────────┤
│ Vendor: *                               │
│ [ABC Logistics            ▼]            │
│                                         │
│ Contract Type: *                        │
│ ⚪ Annual  ⚪ Quarterly  ⚪ Route-Specific│
│                                         │
│ Contract Period: *                      │
│ Start: [2026-03-01]                     │
│ End:   [2027-02-28]                     │
│                                         │
│ Rate Structure: *                       │
│ ⚪ Per KM  ⚪ Per Trip  ⚪ Custom         │
│                                         │
│ Rate per KM: *                          │
│ [100] BDT/km                            │
│                                         │
│ Vehicle Type Rates: (optional)          │
│ • Covered Van (5 MT): 100 BDT/km        │
│ • Open Truck (10 MT): 90 BDT/km         │
│ [+ Add Vehicle Type]                    │
│                                         │
│ Upload Contract Document:               │
│ [📄 Choose File]                        │
│                                         │
│ [Cancel]              [Create Contract] │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
POST /api/v1/vendor-contracts
Body: {
  vendor_id, contract_type, start_date, end_date,
  rate_structure, terms_and_conditions
}

GET /api/v1/vendor-contracts
Query: ?vendor_id={id}&status=Active

GET /api/v1/vendor-contracts/expiring
Query: ?days=30

PATCH /api/v1/vendor-contracts/{contract_id}/renew
Body: {new_end_date, updated_rates?}

PATCH /api/v1/vendor-contracts/{contract_id}/terminate
Body: {termination_reason}
```

---

## Testing Scenarios

### Happy Path
1. Create contract → Contract active
2. Assign TO → Contract rate applied
3. Contract expires → Status = "Expired"
4. Renew contract → New contract created

### Edge Cases
1. **Overlapping contracts**: Validation error
2. **Expired contract used**: Prevented
3. **Rate revision**: Version history maintained

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration

### Enables
- → US-019: TO Execution - Vendor Direct (contract rates)

---

## Definition of Done
- [ ] Contract CRUD functional
- [ ] Rate application working
- [ ] Expiry alerts sent
- [ ] Renewal workflow
- [ ] Contract history maintained
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Sprint**: Sprint 10  
**Priority**: Medium

