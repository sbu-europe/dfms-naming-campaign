---
title: Source Document Mapping
category: reference
phase: documentation
status: active
created: 2026-02-10
updated: 2026-02-10
tags: [reference, source-mapping, traceability]
---

# Source Document Mapping

> Complete mapping of business-context documents to their source materials

## Overview

This document provides a comprehensive mapping between all business-context documentation and the original source documents from which information was extracted. This ensures full traceability and allows readers to verify information or dive deeper into specific topics.

---

## Document Mapping

### 00-overview/ Documents

#### project-summary.md
**Primary Sources**:
- `../../source-documents/07-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx` ✅ **Main source** (archived)
- `../../01-PRODUCT_VISION.md`

> ⚠️ **Note**: Business proposal documents have been archived. Historical references preserved for traceability.

**Content Extracted**:
- Product overview and vision
- Problem statement and solution
- Three-phase deployment model (52 weeks)
- Pricing structure (onboarding + subscription tiers)
- Technology specifications
- Success criteria and timeline

---

#### business-context.md
**Primary Sources**:
- `../../source-documents/07-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx` ✅ **Main source** (archived)
- `../../source-documents/02-flow-diagram/` - Flow diagrams for process understanding
- `../../01-PRODUCT_VISION.md`

> ⚠️ **Note**: Discovery phase documents have been archived. Flow diagrams moved to `02-flow-diagram/`.

**Content Extracted**:
- Industry context and market trends
- Core business processes (7 processes detailed)
- Business entities and relationships
- Business rules and constraints
- Operational workflows
- KPIs and integration points
- Compliance requirements

**Flow Diagrams Used**:
- `02-flow-diagram/DFMS_End_to_End_Operational_Flow_FG_v1.6.png` (latest)
- `02-flow-diagram/DFMS_Operational_Workflow_Port_Consignment_v1.6.png` (latest)

---

#### glossary.md
**Primary Sources**:
- `../../source-documents/01-prd/PRD_DFMS_v1.0.md` ✅ **Main source**
- `../../source-documents/01-prd/PRD_DFMS_v1.0.docx` (Word format)

> ✅ **Updated**: PRD moved from `requirements/` to `01-prd/`.

**Content Extracted**:
- 50+ domain terms and definitions
- 25+ acronyms (DFMS, TR, TO, POI, QC, etc.)
- Technical terminology
- Business process terminology

---

#### stakeholders.md
**Primary Sources**:
- `../../source-documents/03-sow/user-roles.md` ✅ **Main source** (current)
- Historical: Meeting minutes and discovery phase documents (archived)

> ✅ **Updated**: User roles now documented in `03-sow/user-roles.md` with 19 roles.

**Content Extracted**:
- Primary stakeholders (BS23, Nourish)
- 19 user roles (Super Admin, Tenant Admin, Department Admin, and 16 operational roles)
- Department breakdown (Transport, Fleet, QC, Vendor, Finance, etc.)
- External stakeholders (GPS, ERP, SMS providers)
- Role descriptions and responsibilities

---

### 02-requirements/ Documents

#### business-objectives.md
**Primary Sources**:
- `../../source-documents/01-prd/PRD_DFMS_v1.0.md` ✅ **Main source**
- `../../source-documents/03-sow/SOW Phase-1.md` - Phase 1 objectives
- `../../source-documents/03-sow/SOW Phase-2.md` - Phase 2 objectives
- `../../source-documents/03-sow/SOW Phase-3.md` - Phase 3 objectives
- Historical: Business proposal and meeting minutes (archived)
- `../../01-PRODUCT_VISION.md`

> ✅ **Updated**: PRD moved to `01-prd/`. SOW documents added for phase-specific objectives.

**Content Extracted**:
- 8 primary business objectives with success metrics
- Phase-specific objectives (Phase 1-3) from SOW documents
- Stakeholder-specific objectives (Nourish, BS23, Future Clients)
- Detailed KPIs (Operational, Financial, System)
- Success criteria per phase
- Risk mitigation objectives
- Long-term vision

---

#### user-personas.md
**Primary Sources**:
- `../../source-documents/01-prd/PRD_DFMS_v1.0.md` ✅ **Main source**
- `../../source-documents/03-sow/user-roles.md` ✅ **Role definitions**
- Historical: Meeting minutes and questionnaires (archived)

> ✅ **Updated**: PRD moved to `01-prd/`. User roles consolidated in `03-sow/user-roles.md`.

**Content Extracted**:
- 21 detailed user personas
- 19 user roles from `user-roles.md`
- Profile information (age, education, experience, tech proficiency)
- Roles and responsibilities per persona
- Primary goals and pain points
- System usage patterns
- Success metrics per persona
- Persona usage matrix
- Accessibility considerations

---

## Source Document Categories

> ⚠️ **Important**: Source documents have been reorganized. Old folders (business-proposal, discovery-phase, meeting-minutes, planning, reviews, requirements) have been archived. Current structure uses numbered folders (01-prd, 02-flow-diagram, 03-sow, 04-wbs).

### 1. Product Requirements Documents (PRD)
**Location**: `source-documents/01-prd/`

**Files**:
- `PRD_DFMS_v1.0.md` ⭐ **Most comprehensive** (Markdown format)
- `PRD_DFMS_v1.0.docx` (Word format)

**Used For**:
- Detailed functional requirements (all modules)
- Non-functional requirements
- User stories and acceptance criteria
- System constraints and assumptions
- Phase-wise feature breakdown
- Glossary and terminology
- User personas and roles

> ✅ **Updated**: Moved from `requirements/` to `01-prd/`.

---

### 2. Flow Diagrams
**Location**: `source-documents/02-flow-diagram/`

**Files**:
- `DFMS_End_to_End_Operational_Flow_FG_v1.6.png` ⭐ **Latest**
- `DFMS_End_to_End_Operational_Flow_FG_v1.5.png`
- `DFMS_End_to_End_Operational_Flow_v1.1.jpg`
- `DFMS_Operation_Workflow_FG_Transfer_v1.4.png`
- `DFMS_Operation_Workflow_Port_Shipment_v1.4.png`
- `DFMS_Operation_Workflow_v1.3.drawio.png`
- `DFMS_Operational_Flow_End_to_End_v1.2.drawio.png`
- `DFMS_Operational_Workflow_Port_Consignment_v1.5.png`
- `DFMS_Operational_Workflow_Port_Consignment_v1.6.png` ⭐ **Latest**
- `Flow_Diagrams.drawio` (source file)

**Used For**:
- Process flow understanding
- Workflow visualization
- State transitions
- Integration points
- End-to-end operational flows

> ✅ **Updated**: Moved from `discovery-phase/flow-diagrams/` to `02-flow-diagram/`.

---

### 3. Statement of Work (SOW) Documents
**Location**: `source-documents/03-sow/`

#### 3.1 Phase Documents
**Files**:
- `SOW Phase-1.md` ⭐ **MVP (P1)** - Core Foundation & Operational Flow
- `SOW Phase-2.md` - P2 - Intermediate Enhancements
- `SOW Phase-3.md` - P2 & P3 - Intermediate & Advanced Features

**Used For**:
- Phase-specific feature breakdown
- Portal type specifications (Web/Mobile)
- Feature descriptions and sub-features
- Timeline and scope definition
- Phase objectives and success criteria

#### 3.2 Supporting Documents
**Files**:
- `user-roles.md` ⭐ **19 user roles** - Role definitions and permissions
- `DFMS - Feature List version_1.xlsx` - Feature specifications spreadsheet

**Used For**:
- User role definitions (Super Admin, Tenant Admin, Department Admin, 16 operational roles)
- Feature categorization and prioritization
- Role-based access control (RBAC) specifications

> ✅ **New**: SOW documents provide phase-specific requirements and user role definitions.

---

### 4. Work Breakdown Structure (WBS)
**Location**: `source-documents/04-wbs/`

#### 4.1 Planning Tables
**Files**:
- `epics-table.md` ⭐ **17 epics** - Epic-level breakdown
- `stories-table.md` ⭐ **94+ stories** - User stories table
- `timeline-table.md` - Sprint timeline (12 sprints, 26-week baseline)
- `dependencies-table.md` - Epic dependencies and critical path
- `dashboard-table.md` - Project tracker and metrics
- `risks-table.md` ⭐ **17 risks** - Risk register with mitigation
- `release-table.md` ⭐ **5 releases** - Release plan (R1-R5)

**Used For**:
- Epic and story breakdown
- Sprint planning and timeline
- Dependency analysis
- Risk management
- Release planning
- Project tracking

#### 4.2 Supporting Documents
**Files**:
- `WBS_Nourish_DFMS Phase 1 v1.xlsx` - Detailed WBS spreadsheet
- `README.md` - WBS documentation overview

**Used For**:
- Detailed work breakdown
- Task estimation
- Resource planning

> ✅ **Updated**: Moved from `planning/work-breakdown/` to `04-wbs/`. Enhanced with detailed tables.

---

### 5. Archived Documents (Historical Reference)

> ⚠️ **Note**: The following document categories have been archived but are referenced in historical mappings:

#### 5.1 Business Proposal Documents
**Historical Location**: `source-documents/business-proposal/` (archived)

**Files** (historical):
- `BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
- `BS23_Proposal_Nourish_LFMS_v1.2.1_Internal.docx`

**Used For** (historical):
- Project overview and vision
- Problem statement and solution approach
- Deployment phases and timeline
- Pricing and business model

#### 5.2 Meeting Minutes
**Historical Location**: `source-documents/meeting-minutes/` (archived)

**Used For** (historical):
- Stakeholder identification
- Department-specific workflows
- Pain points and challenges
- User expectations

#### 5.3 Discovery Phase Documents
**Historical Location**: `source-documents/discovery-phase/` (archived)

**Used For** (historical):
- Questionnaires and feedback
- Client resources and observations
- Master data samples
- Feature lists evolution

> 📖 **See**: [Source Documents README](../../so../../01-source/README.md) for current structure

---

## Usage Guidelines

### For Engineers
When implementing features, refer to:
1. **PRD** (`01-prd/PRD_DFMS_v1.0.md`) for detailed requirements
2. **SOW Documents** (`03-sow/SOW Phase-1.md`, etc.) for phase-specific features
3. **Flow Diagrams** (`02-flow-diagram/`) for process understanding
4. **WBS Stories** (`04-wbs/stories-table.md`) for story details and acceptance criteria
5. **User Roles** (`03-sow/user-roles.md`) for RBAC requirements

### For Business Analysts
When analyzing requirements, refer to:
1. **PRD** (`01-prd/PRD_DFMS_v1.0.md`) for comprehensive requirements
2. **SOW Documents** (`03-sow/`) for phase-specific scope
3. **Feature List** (`03-sow/DFMS - Feature List version_1.xlsx`) for feature specifications
4. **WBS Epics** (`04-wbs/epics-table.md`) for epic-level breakdown

### For Product Managers
When making decisions, refer to:
1. **Business Objectives** (from business-context) for alignment with goals
2. **User Roles** (`03-sow/user-roles.md`) for user-centric decisions
3. **SOW Documents** (`03-sow/`) for phase scope and timeline
4. **WBS Timeline** (`04-wbs/timeline-table.md`) for sprint planning
5. **WBS Risks** (`04-wbs/risks-table.md`) for risk assessment
6. **Release Plan** (`04-wbs/release-table.md`) for release strategy

### For QA/Testers
When creating test cases, refer to:
1. **PRD** (`01-prd/PRD_DFMS_v1.0.md`) for acceptance criteria
2. **WBS Stories** (`04-wbs/stories-table.md`) for detailed acceptance criteria
3. **Flow Diagrams** (`02-flow-diagram/`) for test scenarios
4. **User Roles** (`03-sow/user-roles.md`) for role-based testing
5. **SOW Documents** (`03-sow/`) for feature descriptions

### For Project Managers
When planning and tracking, refer to:
1. **WBS Dashboard** (`04-wbs/dashboard-table.md`) for project metrics
2. **WBS Timeline** (`04-wbs/timeline-table.md`) for sprint schedule
3. **WBS Dependencies** (`04-wbs/dependencies-table.md`) for critical path
4. **WBS Risks** (`04-wbs/risks-table.md`) for risk management
5. **Release Plan** (`04-wbs/release-table.md`) for release milestones

---

## Document Freshness

### Most Current Documents (as of 2026-02-17)

**Requirements**:
- ✅ `01-prd/PRD_DFMS_v1.0.md` (Latest version - Markdown)
- ✅ `01-prd/PRD_DFMS_v1.0.docx` (Latest version - Word)

**Statement of Work**:
- ✅ `03-sow/SOW Phase-1.md` (MVP - P1)
- ✅ `03-sow/SOW Phase-2.md` (P2 - Intermediate)
- ✅ `03-sow/SOW Phase-3.md` (P2 & P3 - Advanced)
- ✅ `03-sow/user-roles.md` (19 roles defined)
- ✅ `03-sow/DFMS - Feature List version_1.xlsx` (Current feature list)

**Flow Diagrams**:
- ✅ `02-flow-diagram/DFMS_End_to_End_Operational_Flow_FG_v1.6.png` (Latest)
- ✅ `02-flow-diagram/DFMS_Operational_Workflow_Port_Consignment_v1.6.png` (Latest)

**Work Breakdown Structure**:
- ✅ `04-wbs/epics-table.md` (17 epics)
- ✅ `04-wbs/stories-table.md` (94+ stories)
- ✅ `04-wbs/timeline-table.md` (26-week baseline)
- ✅ `04-wbs/risks-table.md` (17 risks identified)
- ✅ `04-wbs/release-table.md` (5 releases planned)

---

## Traceability Matrix

| Business Context Document | Primary Source | Secondary Sources | Confidence |
|---------------------------|----------------|-------------------|------------|
| project-summary.md | Business Proposal v1.3.1 | Product Vision | High |
| business-context.md | Business Proposal v1.3.1 | Discovery Phase, Product Vision | High |
| glossary.md | PRD v1.0 | Business Proposal, Discovery | High |
| stakeholders.md | Meeting Minutes | Discovery Phase, Business Proposal | High |
| business-objectives.md | PRD v1.0 | Business Proposal, Meeting Minutes | High |
| user-personas.md | PRD v1.0 | Meeting Minutes, Questionnaires | High |

**Confidence Levels**:
- **High**: Direct extraction from authoritative source
- **Medium**: Synthesized from multiple sources
- **Low**: Inferred or assumed (requires validation)

---

## How to Read Binary Source Files

### For DOCX Files
```bash
# Method 1: Using unzip and sed (extract text)
unzip -p "filename.docx" word/document.xml | sed 's/<[^>]*>//g'

# Method 2: Using pandoc (if available)
pandoc -f docx -t plain "filename.docx"

# Method 3: Using textutil (macOS)
textutil -convert txt "filename.docx" -output -
```

### For XLSX Files
```bash
# Method 1: Using unzip and grep (extract sheet names)
unzip -l "filename.xlsx" | grep xl/worksheets

# Method 2: Using Python (recommended)
python3 << EOF
import openpyxl
wb = openpyxl.load_workbook('filename.xlsx')
for sheet in wb.sheetnames:
    print(f"Sheet: {sheet}")
    ws = wb[sheet]
    for row in ws.iter_rows(values_only=True):
        print(row)
EOF
```

### For PPTX Files
```bash
# Using unzip and sed
unzip -p "filename.pptx" ppt/slides/*.xml | sed 's/<[^>]*>//g'
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-02-10 | Initial source mapping created | AI Assistant |

---

## Related Documents

- **[Source Documents README](../../so../../01-source/README.md)** - Overview of all source materials (updated structure)
- **[WBS README](../../so../../01-source/04-wbs/README.md)** - Work Breakdown Structure documentation
- **[SOW Documents](../../source-documents/03-sow/)** - Statement of Work for all phases
- **[Product Vision](../../01-PRODUCT_VISION.md)** - Strategic context

---

**Last Updated**: 2026-02-17  
**Maintained By**: Documentation Team  
**Review Frequency**: Monthly or when new source documents added  
**Structure Updated**: Reflects new source-documents organization (01-prd, 02-flow-diagram, 03-sow, 04-wbs)

