---
title: DFMS Vendor Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-rules, vendor, rules]
---

# DFMS Vendor Rules

## Vendor Rules

### 4.1 Bidding Rules

**BR-001: Bidding Window Enforcement**
- **Rule**: Bids cannot be submitted after bidding window closes
- **Validation**: System SHALL prevent bid submission after deadline
- **Impact**: Vendor bidding

**BR-002: Bid Immutability**
- **Rule**: Bids cannot be edited after submission
- **Validation**: System SHALL lock bid after submission
- **Impact**: Vendor bidding

**BR-003: Bid Timestamp Recording**
- **Rule**: System SHALL record bid submission timestamp
- **Validation**: Automatic timestamp capture
- **Impact**: Bid evaluation, audit

**BR-004: Winner Selection Finality**
- **Rule**: Vendor selection is final once approved
- **Validation**: System SHALL lock vendor assignment after approval
- **Impact**: Bid evaluation

**BR-005: Contractual Rate Hiding**
- **Rule**: Contractual rates must be hidden from vendor view
- **Validation**: System SHALL not display rates to contractual vendors
- **Impact**: Vendor portal

---

### 4.2 Invoice Rules

**IR-001: Completed Trips Only**
- **Rule**: Only completed trips are billable
- **Validation**: System SHALL allow invoice creation only for trips with status "Completed" or "Closed"
- **Impact**: Vendor invoicing

**IR-002: POD and GRN Mandatory**
- **Rule**: Invoice cannot be submitted without POD and GRN for each trip
- **Validation**: System SHALL block invoice submission if documents missing
- **Impact**: Vendor invoicing

**IR-003: Invoice Consolidation**
- **Rule**: System SHALL support one invoice per TO or consolidated invoice for multiple TOs
- **Validation**: Flexible invoice creation
- **Impact**: Vendor invoicing

**IR-004: Vendor Cost Locking**
- **Rule**: Vendor cost is locked after Bid approval (non-contractual) or at TO assignment (contractual)
- **Validation**: System SHALL prevent cost modification after locking
- **Impact**: Cost calculation, invoice verification

---



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
