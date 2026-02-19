---
title: DFMS Financial Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/PRD_DFMS_v1.0.md
tags: [business-rules, financial, rules]
---

# DFMS Financial Rules

## Financial Rules

### 7.1 Cost Calculation Rules

**CR-001: Cost Record Creation**
- **Rule**: Trip cost record generated when trip created
- **Validation**: Automatic record creation
- **Impact**: Cost tracking

**CR-002: Manual Entry Authorization**
- **Rule**: Manual cost entry allowed only for authorized roles
- **Validation**: System SHALL enforce role-based access for cost entry
- **Impact**: Cost management

**CR-003: Cost Audit**
- **Rule**: Cost history audit-logged
- **Validation**: Automatic audit logging for all cost changes
- **Impact**: Financial audit

**CR-004: Cost Summary After Closure**
- **Rule**: Trip cost summary available after trip closure
- **Validation**: System SHALL generate summary after closure
- **Impact**: Financial reporting

---

### 7.2 Vendor Cost Rules

**VCR-001: Cost Linkage**
- **Rule**: Vendor cost linked to TO ID, Trip ID, Vendor ID
- **Validation**: System SHALL maintain linkage
- **Impact**: Cost tracking

**VCR-002: Cost Locking**
- **Rule**: Vendor cost locked after Bid approval (non-contractual) or at assignment (contractual)
- **Validation**: System SHALL prevent cost modification after locking
- **Impact**: Cost integrity

**VCR-003: Invoice-TO Mapping**
- **Rule**: System SHALL support one invoice per TO or consolidated invoice
- **Validation**: Flexible mapping
- **Impact**: Invoice management

**VCR-004: Supporting Documents**
- **Rule**: POD and GRN mandatory before invoice submission
- **Validation**: System SHALL block invoice without documents
- **Impact**: Invoice verification

---



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
