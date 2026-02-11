# Business Context Generation Plan

> Plan for extracting and structuring business domain knowledge from source documents

## 📘 Overview

This plan focuses on building the **business-context/** folder, which contains all business domain knowledge for the DFMS product. This context will be consumable by both technical and non-technical stakeholders.

**Related Plans:**
- [TECHNICAL_CONTEXT_PLAN.md](TECHNICAL_CONTEXT_PLAN.md) - High-level technical architecture and contracts
- [REPOSITORY_PURPOSE.md](REPOSITORY_PURPOSE.md) - Overall repository purpose and architecture

---

## 🎯 Objective

Extract and structure business domain knowledge from source documents (DOCX, XLSX) into markdown format, creating a comprehensive, navigable, and LLM-friendly business context that serves as the foundation for product understanding.

### Target Audience
- **Primary**: Product managers, business analysts, stakeholders
- **Secondary**: Developers, architects, QA team
- **Tertiary**: LLMs for context understanding

---

## 📋 Scope

### What's Included
- ✅ Business processes and rules
- ✅ Requirements (functional and non-functional)
- ✅ Features and user stories
- ✅ Stakeholder insights and pain points
- ✅ Master data and business entities
- ✅ Business terminology and glossary

### What's NOT Included
- ❌ Technical architecture (see TECHNICAL_CONTEXT_PLAN.md)
- ❌ Implementation details
- ❌ Code or frameworks
- ❌ Infrastructure decisions

---

## 🏗️ Folder Structure

```
business-context/
├── 00-overview/
│   ├── README.md
│   ├── project-summary.md
│   ├── business-context.md
│   ├── stakeholders.md
│   └── glossary.md
│
├── 01-business-domain/
│   ├── README.md
│   ├── industry-context/
│   │   ├── distribution-logistics-overview.md
│   │   ├── fleet-management-basics.md
│   │   └── regulatory-compliance.md
│   ├── business-processes/
│   │   ├── README.md
│   │   ├── procurement-process.md
│   │   ├── quality-assurance-process.md
│   │   ├── distribution-process.md
│   │   ├── transport-logistics-process.md
│   │   ├── sales-process.md
│   │   └── financial-process.md
│   └── business-rules/
│       ├── README.md
│       ├── operational-rules.md
│       ├── quality-standards.md
│       └── compliance-requirements.md
│
├── 02-requirements/
│   ├── README.md
│   ├── business-objectives.md
│   ├── user-personas.md
│   ├── functional-requirements/
│   │   ├── README.md
│   │   ├── core-modules.md
│   │   ├── transport-management.md
│   │   ├── fleet-management.md
│   │   ├── quality-control.md
│   │   ├── vendor-management.md
│   │   └── reporting-analytics.md
│   ├── non-functional-requirements/
│   │   ├── README.md
│   │   ├── performance.md
│   │   ├── security.md
│   │   ├── scalability.md
│   │   └── usability.md
│   └── constraints.md
│
├── 03-features/
│   ├── README.md
│   ├── feature-overview.md
│   ├── phase-1/
│   │   ├── README.md
│   │   ├── mvp-features.md
│   │   ├── user-stories-summary.md        # Table with all stories + links
│   │   └── user-stories/                  # Individual story files
│   │       ├── README.md                  # Index and navigation
│   │       ├── US-001-story-title.md
│   │       ├── US-002-story-title.md
│   │       └── ...
│   ├── phase-2/
│   │   ├── README.md
│   │   ├── advanced-features.md
│   │   ├── user-stories-summary.md
│   │   └── user-stories/
│   │       ├── README.md
│   │       └── ...
│   ├── phase-3/
│   │   ├── README.md
│   │   ├── intelligence-automation.md
│   │   ├── user-stories-summary.md
│   │   └── user-stories/
│   │       ├── README.md
│   │       └── ...
│   └── feature-dependencies.md
│
├── 04-stakeholder-insights/
│   ├── README.md
│   ├── discovery-summary.md
│   ├── departments/
│   │   ├── transport-operations.md
│   │   ├── procurement-operations.md
│   │   ├── distribution-sales.md
│   │   ├── accounts-finance.md
│   │   ├── commercial-operations.md
│   │   ├── qa-qc-operations.md
│   │   └── mis-operations.md
│   ├── pain-points.md
│   ├── expectations.md
│   └── success-criteria.md
│
├── 05-data-reference/
│   ├── README.md
│   ├── master-data/
│   │   ├── README.md
│   │   ├── vehicles.md
│   │   ├── drivers.md
│   │   ├── vendors.md
│   │   ├── locations.md
│   │   ├── products.md
│   │   └── zones.md
│   ├── transactional-data/
│   │   ├── README.md
│   │   ├── transport-requests.md
│   │   ├── transport-orders.md
│   │   ├── trips.md
│   │   └── quality-checks.md
│   └── data-dictionary.md
│
└── 06-reference/
    ├── README.md
    ├── acronyms.md
    ├── terminology.md
    └── appendix/
        ├── source-document-mapping.md
        └── version-history.md
```

---

## 📊 Source-to-Business-Context Mapping

### From `source-documents/requirements/`

**Source**: `PRD_DFMS_v1.0.docx`

**Extract To**:
- Business objectives → `business-context/02-requirements/business-objectives.md`
- User personas → `business-context/02-requirements/user-personas.md`
- Functional requirements → `business-context/02-requirements/functional-requirements/`
- Non-functional requirements → `business-context/02-requirements/non-functional-requirements/`

**Method**:
```bash
unzip -p "PRD_DFMS_v1.0.docx" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' > prd_extracted.txt
```

### From `source-documents/business-proposal/`

**Source**: `BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`

**Extract To**:
- Feature modules → `business-context/03-features/`
- Business context → `business-context/00-overview/business-context.md`
- Client profile → `business-context/00-overview/stakeholders.md`

### From `source-documents/discovery-phase/questionnaires/`

**Sources**: All questionnaire DOCX files

**Extract To**:
- Discovery questions → `business-context/04-stakeholder-insights/discovery-summary.md`
- Requirements gaps → `business-context/02-requirements/`

### From `source-documents/discovery-phase/client-resources/`

**Extract To**:
- Business processes → `business-context/01-business-domain/business-processes/`
- Pain points → `business-context/04-stakeholder-insights/pain-points.md`
- Sample data structures → `business-context/05-data-reference/`

### From `source-documents/discovery-phase/feature-lists/`

**Source**: `DFMS_Feature_List_v1.2.xlsx` (latest version)

**Extract To**:
- Phase-wise features → `business-context/03-features/phase-1/`, `phase-2/`, `phase-3/`
- Feature dependencies → `business-context/03-features/feature-dependencies.md`

**Method**:
```bash
unzip -p "DFMS_Feature_List_v1.2.xlsx" xl/sharedStrings.xml 2>/dev/null | \
  grep -o '<t[^>]*>[^<]*</t>' | \
  sed 's/<[^>]*>//g' > features_extracted.txt
```

### From `source-documents/discovery-phase/client-resources/master-data/`

**Sources**: All master data XLSX files

**Extract To**:
- Vehicle data → `business-context/05-data-reference/master-data/vehicles.md`
- Driver data → `business-context/05-data-reference/master-data/drivers.md`
- Zone data → `business-context/05-data-reference/master-data/zones.md`
- Location data → `business-context/05-data-reference/master-data/locations.md`
- Vendor data → `business-context/05-data-reference/master-data/vendors.md`
- Product data → `business-context/05-data-reference/master-data/products.md`

### From `source-documents/meeting-minutes/`

**Sources**: All meeting minute DOCX files

**Extract To**:
- Department-specific requirements → `business-context/04-stakeholder-insights/departments/`
- Pain points → `business-context/04-stakeholder-insights/pain-points.md`
- Success criteria → `business-context/04-stakeholder-insights/success-criteria.md`

---

## 🔄 Extraction Process

### Step 1: Extract Raw Content

For each source document:
1. Use extraction commands (see methods above)
2. Save raw text to temporary files
3. Review for completeness

### Step 2: Parse and Structure

For each extracted content:
1. Identify logical sections
2. Group related information
3. Create hierarchical structure
4. Note cross-references

### Step 3: Transform to Markdown

For each section:
1. Apply document template (see below)
2. Add frontmatter metadata
3. Format content appropriately
4. Add cross-reference links

### Step 4: Generate Indexes

For each folder:
1. Create comprehensive README.md
2. Add navigation links
3. Include summary tables
4. Add search keywords

---

## 📝 Document Templates

### User Story Summary Template

**File**: `user-stories-summary.md`

```markdown
---
title: Phase 1 User Stories Summary
phase: phase-1
status: draft
created: YYYY-MM-DD
updated: YYYY-MM-DD
---

# Phase 1: MVP User Stories

## Overview
This document provides a summary of all user stories for Phase 1 (MVP). Click on story IDs to view detailed information.

## Statistics
- **Total Stories**: 45
- **Completed**: 0
- **In Progress**: 15
- **Pending**: 30

## Stories by Module

### Transport Request & Order Management

| ID | User Story | Priority | Status | Details |
|----|------------|----------|--------|---------|
| US-001 | As a logistics coordinator, I want to create transport requests... | High | 🚧 In Progress | [View](user-stories/US-001-create-transport-request.md) |
| US-002 | As an admin, I want to convert TRs to TOs... | High | 📋 Pending | [View](user-stories/US-002-convert-tr-to-to.md) |

## Status Legend
- ✅ Completed
- 🚧 In Progress
- 📋 Pending
- ❌ Blocked
- 🔄 Under Review
```

### Individual User Story Template

**File**: `user-stories/US-XXX-title.md`

```markdown
---
title: [Story Title]
story_id: US-XXX
phase: phase-1
module: [Transport Management | Fleet Management | QC | Vendor | etc.]
priority: [High | Medium | Low]
status: [Pending | In Progress | Completed | Blocked]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_documents:
  - ../../source-documents/planning/feature-lists/DFMS_Feature_List_v1.2.xlsx
related_stories:
  - US-XXX-related-story.md
tags: [tag1, tag2, tag3]
---

# US-XXX: [Story Title]

## User Story

**As a** [user role]  
**I want** [goal/desire]  
**So that** [benefit/value]

## Description

[Detailed description]

## Acceptance Criteria

1. **Given** [context]  
   **When** [action]  
   **Then** [outcome]

## Business Rules

- [Rule 1]
- [Rule 2]

## Examples

### Example 1: [Scenario]
```
Input: ...
Process: ...
Output: ...
```

## References

- Source: [Link to feature list]
- Related Requirements: [Link to requirements]
- Meeting Minutes: [Link to stakeholder discussions]

---

**Story Points**: [Estimate]  
**Sprint**: [Sprint number]  
**Last Updated**: YYYY-MM-DD
```

### Standard Business Document Template

```markdown
---
title: [Document Title]
category: business
phase: [discovery|phase-1|phase-2|phase-3]
status: [draft|review|approved]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source_documents:
  - path/to/source.docx
related_docs:
  - ../path/to/related.md
tags: [tag1, tag2]
---

# [Document Title]

## Overview
[High-level summary understandable by business stakeholders]

## Business Context
[Why this matters to the business, what problem it solves]

## Details
[Main content - business processes, rules, requirements]

## Stakeholder Impact
[How this affects different departments, users, or stakeholders]

## Success Criteria
[How to measure success of this]

## References
- Source documents: [link]
- Meeting minutes: [link]
- Related features: [link]

---

**Last Updated**: YYYY-MM-DD  
**Status**: [Current status]
```

---

## 🔍 Quality Criteria

### Completeness
- [ ] All source documents processed
- [ ] No critical business information missing
- [ ] All stakeholder insights captured

### Accuracy
- [ ] Business terms used correctly
- [ ] Requirements accurately represented
- [ ] No misinterpretation of business rules

### Clarity
- [ ] Non-technical language where possible
- [ ] Business jargon explained
- [ ] Examples provided for complex concepts

### Navigation
- [ ] Clear folder structure
- [ ] Comprehensive READMEs
- [ ] Cross-references between related documents

### LLM-Friendly
- [ ] Consistent frontmatter metadata
- [ ] Semantic structure
- [ ] Clear section headers
- [ ] Searchable keywords

---

## 📅 Execution Timeline

### Week 1: Foundation & Overview
**Focus**: Core structure and project context

- [ ] Create folder structure
- [ ] Extract project summary from business proposal
- [ ] Create stakeholder overview
- [ ] Build glossary from all sources
- [ ] Create comprehensive READMEs

**Deliverables**: `00-overview/` (complete)

### Week 2: Requirements & Business Domain
**Focus**: Business objectives and domain knowledge

- [ ] Extract business objectives from PRD
- [ ] Create user personas
- [ ] Document business processes
- [ ] Extract business rules
- [ ] Document functional requirements
- [ ] Document non-functional requirements

**Deliverables**: `01-business-domain/`, `02-requirements/` (complete)

### Week 3: Features & User Stories
**Focus**: Feature breakdown and user stories

- [ ] Process all feature list versions
- [ ] Create phase-wise feature documents
- [ ] Extract user stories
- [ ] Create user stories summary tables
- [ ] Create individual user story files
- [ ] Map feature dependencies

**Deliverables**: `03-features/` (complete with all user stories)

### Week 4: Stakeholder Insights & Data
**Focus**: Discovery insights and master data

- [ ] Process all meeting minutes
- [ ] Extract department-specific insights
- [ ] Document pain points and expectations
- [ ] Process questionnaires
- [ ] Extract master data from XLSX files
- [ ] Create data dictionary

**Deliverables**: `04-stakeholder-insights/`, `05-data-reference/` (complete)

### Week 5: Polish & Cross-Reference
**Focus**: Quality and navigation

- [ ] Add cross-references throughout
- [ ] Enhance all READMEs
- [ ] Complete reference materials
- [ ] Quality review all documents
- [ ] Ensure consistency
- [ ] Verify completeness

**Deliverables**: `06-reference/` (complete), all cross-referencing done

---

## 🛠️ Tools & Scripts

### Required Tools
- `unzip` - Extract content from DOCX/XLSX
- `grep`, `sed` - Text processing
- Markdown editor
- (Optional) `pandoc` - Advanced document conversion

### Extraction Scripts

**Extract DOCX**:
```bash
#!/bin/bash
# scripts/extract-docx.sh
INPUT_FILE=$1
OUTPUT_FILE=$2
unzip -p "$INPUT_FILE" word/document.xml 2>/dev/null | \
  grep -o '<w:t[^>]*>[^<]*</w:t>' | \
  sed 's/<[^>]*>//g' > "$OUTPUT_FILE"
```

**Extract XLSX**:
```bash
#!/bin/bash
# scripts/extract-xlsx.sh
INPUT_FILE=$1
OUTPUT_FILE=$2
unzip -p "$INPUT_FILE" xl/sharedStrings.xml 2>/dev/null | \
  grep -o '<t[^>]*>[^<]*</t>' | \
  sed 's/<[^>]*>//g' > "$OUTPUT_FILE"
```

---

## 📈 Success Metrics

### Quantitative
- **Coverage**: 100% of business documents processed
- **User Stories**: All stories documented with complete templates
- **Cross-references**: Average 3-5 links per document
- **Completeness**: All template sections filled

### Qualitative
- **Stakeholder Readability**: Business stakeholders can understand without tech knowledge
- **Discoverability**: Can find any business concept in < 2 navigation steps
- **Maintainability**: Easy to update when requirements change
- **LLM Context**: AI can effectively retrieve and understand business context

---

## 🔄 Maintenance Plan

### Ongoing Updates
- When source documents change, update affected business context docs
- Maintain version history
- Keep source document mapping current

### Review Cycle
- **Weekly**: Check for new business documents
- **Bi-weekly**: Review and update cross-references
- **Monthly**: Quality audit
- **Per Phase**: Major update when moving to next deployment phase

---

## 📚 Related Documents

- [TECHNICAL_CONTEXT_PLAN.md](TECHNICAL_CONTEXT_PLAN.md) - Technical architecture plan
- [PRODUCT_VISION.md](PRODUCT_VISION.md) - Product vision and strategy
- [source-documents/README.md](source-documents/README.md) - Instructions for reading binary files

---

## 📦 Deliverables Summary

At completion, `business-context/` will contain:

- **~60+ markdown files** covering all business domain knowledge
- **Comprehensive user stories** with summary tables and individual files
- **Stakeholder insights** from all discovery sessions
- **Master data reference** extracted from client resources
- **Complete cross-referencing** for easy navigation
- **LLM-optimized structure** for context retrieval

---

**Plan Version**: 1.0  
**Created**: February 2026  
**Status**: Ready for execution  
**Timeline**: 5 weeks  
**Next Step**: Begin Week 1 - Foundation & Overview

