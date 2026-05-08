---
title: Vendor Payment Management
story_id: US-029
phase: phase-1
module: Vendor Management
priority: High
status: Pending
epic: Vendor Management
epic_id: EPIC-010
epic_name: Vendor Management
sprint: Sprint 8
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../05-modules/03-operations/trip-management.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-060-trip-costing.md
  - US-025-trip-closure-pod.md
dependencies:
  - US-027-vendor-registration-verification.md
  - US-025-trip-closure-pod.md
tags: [vendor, payment, billing, financial, high-priority]
---

# US-029: Vendor Payment Management

## User Story

**As an** Accounts Officer  
**I want** vendor trip to be finalized per trip so that invoices can be generated accurately without disputes

## Business Context

**Payment Process**:
```
Trip Completed → Invoice Generated → Invoice Approved → Payment Processed → Payment Confirmed
```

**Payment Methods**:
- Bank Transfer
- Mobile Banking (bKash, Nagad, Rocket)
- Cash (for small amounts)
- Cheque

**Payment Terms**:
- Immediate (cash on delivery)
- Net 7 days
- Net 15 days
- Net 30 days
- Custom terms (contractual vendors)

---

## Acceptance Criteria

### AC-1: Invoice Generation
- [ ] System SHALL auto-generate invoice after trip completion
- [ ] System SHALL calculate invoice amount based on:
  - Agreed rate (bid amount or contract rate)
  - Distance traveled
  - Additional charges (waiting time, helper, etc.)
  - Deductions (penalties, damages)
- [ ] System SHALL include in invoice:
  - Invoice number (unique)
  - Vendor details
  - Trip details (TO number, route, date)
  - Amount breakdown
  - Payment terms
  - Due date
- [ ] System SHALL allow manual invoice creation (for adjustments)

### AC-2: Invoice Submission Requirements (per PRD)
- [ ] System SHALL require mandatory documents before invoicing:
  - POD (Proof of Delivery)
  - GRN (Goods Receipt Note)
- [ ] System SHALL link invoices to corresponding TO
- [ ] System SHALL support one invoice per TO
- [ ] System SHALL allow consolidated invoice submission (multiple TOs)

### AC-3: Vendor Cost Locking (per PRD)
- [ ] Vendor Cost SHALL be linked to:
  - TO ID
  - Trip ID
  - Vendor ID
- [ ] Vendor Cost SHALL originate from:
  - Contractual rate (pre-configured, hidden from vendor)
  - Approved Bid Rate (non-contractual)
- [ ] Vendor Cost SHALL be locked after Bid approval
- [ ] System SHALL prevent cost modification after locking

### AC-4: Payment Processing
- [ ] System SHALL allow recording payment details:
  - Payment method
  - Payment date
  - Transaction reference
  - Amount paid
  - Bank/account details
- [ ] System SHALL support partial payments
- [ ] System SHALL calculate outstanding balance
- [ ] System SHALL update invoice status to "Paid"

### AC-5: Payment Tracking
- [ ] System SHALL track payment status:
  - Pending Approval
  - Approved (Awaiting Payment)
  - Payment Initiated
  - Paid
  - Partially Paid
  - Overdue
- [ ] System SHALL send payment reminders for overdue invoices
- [ ] System SHALL calculate aging (days overdue)

### AC-6: Vendor Payment History
- [ ] System SHALL display vendor payment history:
  - All invoices (paid/unpaid)
  - Total amount paid
  - Outstanding balance
  - Payment trends
- [ ] System SHALL allow filtering by date, status, amount

### AC-7: Payment Reports
- [ ] System SHALL generate payment reports:
  - Vendor-wise payment summary
  - Period-wise payment summary
  - Outstanding payments report
  - Payment aging report
- [ ] System SHALL export reports (PDF/Excel)

---

## Functional Requirements

### FR-001: Invoice Management (per PRD)
- [Critical] Invoice generation per TO (one invoice per TO)
- [Critical] Mandatory POD and GRN documents before invoicing
- [Critical] Link invoices to corresponding TO
- [High] Consolidated invoice submission (multiple TOs)
- [High] Vendor cost locking after bid approval

### FR-002: Payment Processing
- [Critical] Payment recording interface
- [High] Multiple payment methods support
- [High] Partial payment handling
- [Medium] Integration with accounting software (ERP)

### FR-003: Payment Dashboard
- [High] Pending payments queue
- [High] Payment history view
- [Medium] Payment analytics
- [Medium] Cash flow projections

---

## Business Rules

### BR-PAY-001: Invoice Generation Trigger
- Invoice auto-generated when trip status = "Completed" AND POD captured
- **Enforcement**: Trip completion event trigger

### BR-PAY-002: Payment Terms
- Default payment terms: Net 15 days
- Contractual vendors may have custom terms
- **Enforcement**: Vendor contract settings

### BR-PAY-003: Approval Authority
- Invoices < BDT 50,000: Finance Manager
- Invoices ≥ BDT 50,000: Senior Finance Manager
- **Enforcement**: Approval routing logic

### BR-PAY-004: Overdue Penalty
- 2% penalty per month for overdue payments (configurable)
- **Enforcement**: Penalty calculation

---

## Data Model

```typescript
VendorInvoice {
  id: UUID (PK)
  invoice_number: String (unique)
  vendor_id: UUID (FK)
  trip_id: UUID (FK)
  to_id: UUID (FK)
  
  // Amount breakdown
  base_amount: Decimal
  additional_charges: JSON (array of {type, amount})
  deductions: JSON (array of {type, amount})
  subtotal: Decimal
  tax_amount: Decimal (nullable)
  total_amount: Decimal
  
  // Payment details
  payment_terms: String (e.g., "Net 15 days")
  due_date: Date
  payment_status: Enum (
    Pending_Approval,
    Approved,
    Payment_Initiated,
    Paid,
    Partially_Paid,
    Overdue,
    Cancelled
  )
  
  // Approval
  approved_by: UUID (FK to User, nullable)
  approved_at: Timestamp (nullable)
  rejection_reason: Text (nullable)
  
  // Payment
  paid_amount: Decimal (default: 0)
  outstanding_balance: Decimal (computed)
  payment_method: Enum (Bank_Transfer, Mobile_Banking, Cash, Cheque) (nullable)
  payment_date: Date (nullable)
  transaction_reference: String (nullable)
  
  // Timestamps
  invoice_date: Date
  created_at: Timestamp
}

VendorPayment {
  id: UUID (PK)
  invoice_id: UUID (FK)
  vendor_id: UUID (FK)
  
  payment_amount: Decimal
  payment_method: Enum
  payment_date: Date
  transaction_reference: String
  
  bank_name: String (nullable)
  account_number: String (nullable)
  
  notes: Text (nullable)
  
  recorded_by: UUID (FK to User)
  recorded_at: Timestamp
}
```

---

## UI/UX Requirements

### Invoice Approval Queue
```
┌──────────────────────────────────────────────────────────────┐
│ Vendor Invoices - Pending Approval                          │
├──────────────────────────────────────────────────────────────┤
│ Invoice #    Vendor         Trip      Amount    Due    Action│
│ ──────────────────────────────────────────────────────────  │
│ INV-001      ABC Logistics  TRIP-042  45,000   Feb 20 [Review]│
│ INV-002      XYZ Transport  TRIP-038  32,500   Feb 18 [Review]│
└──────────────────────────────────────────────────────────────┘
```

### Invoice Detail & Approval
```
┌─────────────────────────────────────────┐
│ Invoice: INV-20260211-001               │
├─────────────────────────────────────────┤
│ Vendor: ABC Logistics                   │
│ Trip: TRIP-20260211-0042                │
│ TO: TO-20260211-0042                    │
│ Route: Bhaluka → Mirpur (45 km)         │
│                                         │
│ Amount Breakdown:                       │
│ Base Amount:        BDT 40,000          │
│ Waiting Time:       BDT  3,000          │
│ Helper Charge:      BDT  2,000          │
│ ─────────────────────────────           │
│ Subtotal:           BDT 45,000          │
│ Deductions:         BDT      0          │
│ ─────────────────────────────           │
│ Total Amount:       BDT 45,000          │
│                                         │
│ Payment Terms: Net 15 days              │
│ Due Date: Feb 26, 2026                  │
│                                         │
│ Adjustments: (optional)                 │
│ ┌─────────────────────────────────────┐ │
│ │ Deduct BDT 1,000 for minor delay    │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Reject] [Request Changes] [Approve]    │
└─────────────────────────────────────────┘
```

### Payment Recording
```
┌─────────────────────────────────────────┐
│ Record Payment                          │
│ Invoice: INV-20260211-001               │
├─────────────────────────────────────────┤
│ Total Amount: BDT 45,000                │
│ Paid Amount: BDT 0                      │
│ Outstanding: BDT 45,000                 │
│                                         │
│ Payment Amount: *                       │
│ [45000] BDT                             │
│ ⚪ Full Payment  ⚪ Partial Payment      │
│                                         │
│ Payment Method: *                       │
│ ⚪ Bank Transfer  ⚪ Mobile Banking      │
│ ⚪ Cash  ⚪ Cheque                       │
│                                         │
│ Payment Date: *                         │
│ [2026-02-20]                            │
│                                         │
│ Transaction Reference:                  │
│ [TXN-123456789]                         │
│                                         │
│ Bank/Account Details:                   │
│ Bank: [Dutch-Bangla Bank     ▼]         │
│ Account: [1234567890]                   │
│                                         │
│ Notes: (optional)                       │
│ ┌─────────────────────────────────────┐ │
│ │ Payment processed via bank transfer │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel]              [Record Payment]  │
└─────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Auto-generate invoice (triggered on trip completion)
POST /api/v1/vendor-invoices/generate
Body: {trip_id}
Response: {invoice}

// Get pending invoices
GET /api/v1/vendor-invoices/pending-approval

// Approve invoice
POST /api/v1/vendor-invoices/{invoice_id}/approve
Body: {approved_by_user_id, adjustments?: [...]}

// Record payment
POST /api/v1/vendor-invoices/{invoice_id}/payments
Body: {
  payment_amount, payment_method, payment_date,
  transaction_reference, bank_details?
}

// Get vendor payment history
GET /api/v1/vendors/{vendor_id}/payment-history
Query: ?from_date=2026-01-01&to_date=2026-02-11

// Get payment reports
GET /api/v1/vendor-payments/reports
Query: ?report_type=aging&format=pdf
```

---

## Testing Scenarios

### Happy Path
1. Trip completed → Invoice auto-generated
2. Finance Manager approves → Invoice approved
3. Payment recorded → Invoice status = "Paid"

### Edge Cases
1. **Partial payment**: Outstanding balance tracked
2. **Overdue invoice**: Reminder sent, penalty calculated
3. **Invoice rejected**: Vendor notified, can dispute

---

## Dependencies

### Prerequisites
- ✅ US-027: Vendor Registration
- ✅ US-025: Trip Closure with POD

### Enables
- → Vendor satisfaction
- → Financial reporting

---

## Definition of Done
- [ ] Invoice auto-generation working
- [ ] Approval workflow functional
- [ ] Payment recording working
- [ ] Payment history display
- [ ] Overdue tracking and reminders
- [ ] Payment reports generation
- [ ] Unit tests > 85%
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 9  
**Priority**: High

