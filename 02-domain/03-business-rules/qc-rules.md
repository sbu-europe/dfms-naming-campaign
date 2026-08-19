---
title: DFMS Quality Control Rules
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md
tags: [business-rules, qc, rules]
---

# DFMS Quality Control Rules

## Quality Control Rules

### 6.1 QC Context Rules

**QCR-001: Context Before Sampling**
- **Rule**: QC Context must be displayed before sample creation
- **Validation**: System SHALL show context before allowing sampling
- **Impact**: QC workflow

**QCR-002: Context Data Mandatory**
- **Rule**: QC actions blocked if mandatory context data missing
- **Validation**: System SHALL validate context completeness
- **Impact**: QC workflow

---

### 6.2 Sampling Rules

**SMR-001: Sampling After Event Creation**
- **Rule**: Sampling must occur after QC Sampling event creation
- **Validation**: System SHALL enforce event creation before sampling
- **Impact**: QC workflow

**SMR-002: Sequential Timestamps**
- **Rule**: Sampling timestamps must be sequential (End Time > Start Time)
- **Validation**: System SHALL validate timestamp sequence
- **Impact**: Time tracking

**SMR-003: QR Code Uniqueness**
- **Rule**: One QR code per sample
- **Validation**: System SHALL generate unique QR per sample
- **Impact**: Sample tracking

**SMR-004: QR Code Immutability**
- **Rule**: QR code tied to sample, cannot be changed
- **Validation**: System SHALL lock QR code after generation
- **Impact**: Traceability

---

### 6.3 Lab Testing Rules

**LTR-001: QR Scan Triggers Start**
- **Rule**: QR scan by lab personnel automatically triggers lab test start time
- **Validation**: Automatic timestamp capture on scan
- **Impact**: Lab workflow

**LTR-002: Lab Start Time Authority**
- **Rule**: QR scan time is authoritative lab start time
- **Validation**: System SHALL use scan timestamp as start time
- **Impact**: Lab timing

---

### 6.4 QC Decision Rules

**QDR-001: QC Pass Required for Closure**
- **Rule**: Trip closure requires QC Pass
- **Validation**: System SHALL validate QC status before closure
- **Impact**: Trip closure

**QDR-002: QC Fail Blocks Closure**
- **Rule**: QC Fail blocks trip closure
- **Validation**: System SHALL prevent closure if QC status = Fail
- **Impact**: Trip closure

**QDR-003: Recheck Remarks Mandatory**
- **Rule**: Recheck/resampling requires mandatory remarks
- **Validation**: System SHALL enforce remarks entry for recheck
- **Impact**: QC escalation

**QDR-004: Inventory Update on QC Pass**
- **Rule**: Destination inventory updates only after QC Pass (for inbound)
- **Validation**: System SHALL update inventory based on QC result
- **Impact**: Inventory accuracy

---



## Related Documents

- [Business Rules Overview](./business-rules.md) - Complete rules index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team
