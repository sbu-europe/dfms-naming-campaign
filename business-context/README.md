# Business Context

> **⚠️ IMPORTANT**: **`source-documents/` is the source of truth**. This folder contains derived documentation based on source documents. Always refer to `source-documents/` for authoritative information.

This folder contains comprehensive business context documentation for the DFMS (Distribution and Fleet Management System) product, derived from and aligned with `source-documents/`.

## 📁 Folder Structure

### `00-overview/` - Project Overview
- Project summary, business context, glossary, stakeholders
- High-level business objectives and vision

### `01-business-domain/` - Business Domain
- Business processes, business rules, industry context
- Domain-specific information and workflows

### `02-requirements/` - Requirements
- Business objectives, user personas
- Functional and non-functional requirements
- Constraints and assumptions

### `03-module-specifications/` - Module Specifications
- Business context extracted directly from PRD v1.0
- Organized by functional modules (00-overview through 11-reference)
- Contains PRD content with embedded user stories, acceptance criteria, and functional requirements
- See [03-module-specifications/README.md](03-module-specifications/README.md) for details

### `04-phase-backlog/` - Phase Backlog
- Feature overview and dependencies
- Phase 1, 2, 3 summaries
- Detailed user stories organized by phase (implementation-ready)
- **Source**: Based on `source-documents/04-wbs/stories-table.md` (94 stories: US-001 to US-094)
- **Epic Mapping**: Stories mapped to 17 epics from `source-documents/04-wbs/epics-table.md`
- See [04-phase-backlog/README.md](04-phase-backlog/README.md) for details

### `05-data-reference/` - Data Reference
- Data dictionary
- Master data and transactional data overviews

### `06-reference/` - Reference Materials
- Cross-reference index
- Source document mapping
- Version history
- Quick reference guides

## 📊 Content Overview

### Original Business Context
- **User Stories**: 94 stories total (US-001 to US-094) from WBS, 70 stories in Phase 1
- **Epics**: 17 epics (EPIC-001 to EPIC-017) from WBS
- **Business Rules**: 112+ validation rules
- **User Personas**: 21 detailed stakeholder profiles
- **Data Entities**: 10+ complete data dictionaries
- **Source**: `source-documents/04-wbs/stories-table.md` and `source-documents/04-wbs/epics-table.md`

### Module Specifications (`03-module-specifications/`)
- **Modules**: 12 modules (00-overview through 11-reference)
- **Content**: PRD content with embedded user stories, acceptance criteria, and functional requirements
- **Source**: Direct extraction from PRD_DFMS_v1.0.md

## 🔍 Navigation

### By Content Type
- **Overview**: `00-overview/`
- **Requirements**: `02-requirements/`
- **Module Specifications**: `03-module-specifications/` (module-organized, PRD traceability)
- **Phase Backlog**: `04-phase-backlog/` (phase-organized, detailed)
- **Data**: `05-data-reference/`
- **Reference**: `06-reference/`

### By Source
- **Original Analysis**: Main folders (00-overview, 01-business-domain, 02-requirements, 04-phase-backlog, 05-data-reference, 06-reference)
- **Module Specifications**: `03-module-specifications/` folder

## 📝 Documentation Status

- ✅ Original business context: Complete
- ✅ Module specifications: Complete (in `03-module-specifications/` folder)
- ✅ User stories: Available in both formats (detailed in `04-phase-backlog/`, embedded in `03-module-specifications/`)

## 🔗 Related Documentation

### Source Documents (Source of Truth)
- **[Source Documents](../../source-documents/README.md)** - **SOURCE OF TRUTH**: Original BA documents (PRD, SOW, WBS, Flow Diagrams)
- **[PRD](../../source-documents/01-prd/PRD_DFMS_v1.0.md)** - Product Requirements Document
- **[WBS Epics](../../source-documents/04-wbs/epics-table.md)** - 17 Epics (EPIC-001 to EPIC-017)
- **[WBS Stories](../../source-documents/04-wbs/stories-table.md)** - 94 Stories (US-001 to US-094)
- **[WBS Timeline](../../source-documents/04-wbs/timeline-table.md)** - Sprint timeline and schedule
- **[SOW Documents](../../source-documents/03-sow/)** - Statement of Work for Phase 1, 2, 3

### Derived Documentation
- **[PRD Reference Content](03-module-specifications/README.md)** - PRD-extracted content organized by module
- **[Phase Backlog](04-phase-backlog/README.md)** - Epics and user stories organized by phase (derived from WBS)
- **[Verification Report](VERIFICATION_REPORT.md)** - Verification of business-context against source-documents

## 📊 Analysis & Alignment

Historical alignment documents are archived in [`06-reference/`](./06-reference/):
- **[PRD Alignment Plan](./06-reference/PRD_ALIGNMENT_PLAN.md)** - Module-by-module alignment plan (archived)
- **[PRD Alignment Summary](./06-reference/PRD_ALIGNMENT_SUMMARY.md)** - Overview of alignment work (archived)

---

## ⚠️ Source of Truth Priority

**`source-documents/` takes precedence over `business-context/`**

1. **For authoritative information**: Always refer to `source-documents/`
   - PRD: `source-documents/01-prd/PRD_DFMS_v1.0.md`
   - WBS: `source-documents/04-wbs/` (epics-table.md, stories-table.md, timeline-table.md)
   - SOW: `source-documents/03-sow/`

2. **For derived documentation**: Use `business-context/`
   - Module specifications (PRD-extracted)
   - Phase stories (WBS-derived)
   - Business analysis and context

3. **Verification**: See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md) for alignment status

---

**Last Updated**: 2026-02-17  
**Structure**: Original analysis + PRD-based content  
**Source of Truth**: `source-documents/`

