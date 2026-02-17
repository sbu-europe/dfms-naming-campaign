---
title: DFMS Business Constraints
category: business
phase: requirements
status: approved
created: 2026-02-13
updated: 2026-02-13
source_documents:
  # PRD Source
  - ../../../source-documents/requirements/PRD_DFMS_v1.0.md
  # Discovery Phase Sources
  - ../../../source-documents/meeting-minutes/2025-09/Transport_Operations_2025-09-29.docx
  - ../../../source-documents/meeting-minutes/2025-10/Distribution_Sales_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Procurement_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/QA_QC_Operations_2025-10-06.docx
  - ../../../source-documents/meeting-minutes/2025-10/Accounts_Finance_2025-10-08.docx
  # ... (additional discovery sources in original files)
content_source:
  prd_based: "PRD Section 2.5: Assumptions & Dependencies (simple lists)"
  discovery_based: "Detailed constraints (Business, Technical, Operational) sourced from discovery phase materials"

tags: [constraints-assumptions, business, constraints]
---

# DFMS Business Constraints

## Business Constraints

### 1.1 Timeline Constraints

**Constraints**:
- **Phase 1 (MVP) must be delivered within 26 weeks** from project start
- **Phase 2 must be completed within 14 weeks** after Phase 1
- **Phase 3 must be completed within 14 weeks** after Phase 2
- **Total project duration: 52 weeks** (1 year)

**Impact**:
- Feature scope must be carefully managed to meet deadlines
- Trade-offs may be required between features and timeline
- Aggressive testing and deployment schedule required

**Mitigation**:
- Phased delivery approach reduces risk
- MVP focuses on core features only
- Regular sprint reviews to track progress

---

### 1.2 Budget Constraints

**Constraints**:
- Fixed-price contract for Nourish implementation
- SaaS pricing model must be competitive for future clients
- Infrastructure costs must scale linearly with tenant growth

**Impact**:
- Technology choices influenced by cost considerations
- Limited budget for third-party services and APIs
- Need to optimize infrastructure usage

**Mitigation**:
- Use open-source technologies where possible
- Cloud infrastructure with auto-scaling
- Efficient resource utilization

---

### 1.3 Scope Constraints

**Constraints**:
- **Phase 1 scope is fixed** (63 user stories)
- **No custom development for Nourish** beyond product roadmap
- **Product must serve multiple clients** (not Nourish-specific)

**Impact**:
- Nourish-specific requests may be deferred
- Generic solution may not address all edge cases
- Configuration over customization approach required

**Mitigation**:
- Clear scope documentation and change control process
- Configurable features to accommodate variations
- Regular stakeholder communication on scope boundaries

---

### 1.4 Resource Constraints

**Constraints**:
- **Development team size**: Fixed (as per contract)
- **Client availability**: Limited for UAT and feedback
- **Subject matter experts**: Limited availability from Nourish operations team

**Impact**:
- Parallel development may be limited
- Delays in requirement clarification possible
- Extended UAT cycles if client unavailable

**Mitigation**:
- Efficient team structure and task allocation
- Asynchronous communication channels
- Detailed documentation to reduce dependency on SMEs

---



## Related Documents

- [Constraints & Assumptions Overview](./constraints-assumptions.md) - Complete constraints index

---

**Last Updated**: 2026-02-13  
**Status**: Approved - Aligned with PRD v1.0  
**Maintained By**: Business Context Team

---

## 📝 Content Source

**PRD-Based Content:**
- PRD Section 2.5: Assumptions & Dependencies (simple lists)

**Discovery-Based Content:**
- Detailed constraints (Business, Technical, Operational) sourced from discovery phase materials

> **Note**: This document combines PRD content with detailed information gathered during the discovery phase (meeting minutes, questionnaires, business proposals). PRD provides high-level role names and objectives, while discovery phase materials provide detailed profiles, pain points, and operational context.

