# Phase 1 Epics

> Epic-level documentation for DFMS Phase 1 (MVP)

**⚠️ IMPORTANT**: **`source-documents/04-wbs/` is the source of truth**. All epic information is derived from WBS tables. Always refer to source documents for authoritative information.

---

## 📊 Epic Overview

| Epic ID | Epic Name | Module Category | Priority | Sprint | Stories | Story Points | Status |
|---------|-----------|-----------------|----------|--------|---------|--------------|--------|
| [EPIC-001](./EPIC-001-system-foundation.md) | System Foundation | Foundation | P0 | Sprint 1 | 4 | 40 SP | Planned |
| [EPIC-002](./EPIC-002-user-and-tenant-foundation.md) | User & Tenant Foundation | Foundation | P0 | Sprint 1 | 5 | 40 SP | Planned |
| [EPIC-003](./EPIC-003-master-data-and-configuration.md) | Master Data & Configuration | Foundation | P0 | Sprint 2 | 4 | 50 SP | Planned |
| [EPIC-004](./EPIC-004-poi-management-and-geofencing.md) | POI Management & Geofencing | Core Data | P1 | Sprint 3 | 9 | 65 SP | Planned |
| [EPIC-005](./EPIC-005-product-inventory-management-pim.md) | Product Inventory Management (PIM) | Core Data | P1 | Sprint 4 | 3 | 30 SP | Planned |
| [EPIC-006](./EPIC-006-fleet-and-vehicle-management.md) | Fleet & Vehicle Management | Operations | P1 | Sprint 4 | 10 | 80 SP | Planned |
| [EPIC-007](./EPIC-007-product-transfer-requisition-management.md) | Product Transfer Requisition Management | Operations | P1 | Sprint 5 | 4 | 50 SP | Planned |
| [EPIC-008](./EPIC-008-distribution-and-procurement-management.md) | Distribution & Procurement Management | Operations | P1 | Sprint 5 | 5 | 45 SP | Planned |
| [EPIC-009](./EPIC-009-transport-order-to-management.md) | Transport Order (TO) Management | Operations | P1 | Sprint 6-7 | 12 | 90 SP | Planned |
| [EPIC-010](./EPIC-010-vendor-management.md) | Vendor Management | Vendor | P2 | Sprint 8 | 6 | 55 SP | Planned |
| [EPIC-011](./EPIC-011-gate-management.md) | Gate Management | Operations | P2 | Sprint 8 | 5 | 35 SP | Planned |
| [EPIC-012](./EPIC-012-scaling---weight-management.md) | Scaling / Weight Management | Operations | P2 | Sprint 9 | 3 | 25 SP | Planned |
| [EPIC-013](./EPIC-013-loading---unlodaing-operations.md) | Loading / Unloading Operations | Operations | P2 | Sprint 9 | 2 | 20 SP | Planned |
| [EPIC-014](./EPIC-014-quality-control-and-quality-assurance-workflow.md) | Quality Control & Quality Assurance Workflow | Quality | P1 | Sprint 10-11 | 15 | 110 SP | Planned |
| [EPIC-015](./EPIC-015-command-center-operations.md) | Command Center Operations | Monitoring | P2 | Sprint 11 | 4 | 35 SP | Planned |
| [EPIC-016](./EPIC-016-mobile-interface-driver---qc.md) | Mobile Interface (Driver / QC) | Mobile | P1 | Sprint 11 | 2 | 90 SP | Planned |
| [EPIC-017](./EPIC-017-mobile-applications-vendor.md) | Mobile Applications (Vendor) | Mobile | P1 | Sprint 11 | 1 | 90 SP | Planned |

**Total**: 17 Epics | 94 Stories | 946 Story Points

---

## 🔗 Critical Path

The critical path epics (must not be delayed):

**EPIC-001 → EPIC-002 → EPIC-003 → EPIC-007 → EPIC-008 → EPIC-009 → EPIC-014**

**Sprint Sequence**: Sprint 1 → Sprint 1 → Sprint 2 → Sprint 5 → Sprint 5 → Sprint 6-7 → Sprint 10-11

---

## 📁 Epic Files

Each epic file contains:

- **Epic Overview**: Priority, sprint, duration, story points, status
- **Business Context**: Why the epic matters and its business value
- **Epic Dependencies**: What this epic depends on and what it blocks
- **User Stories**: Complete list of stories in this epic
- **Epic Acceptance Criteria**: High-level acceptance criteria
- **Functional Requirements**: Epic-level functional requirements
- **Business Rules**: Epic-specific business rules
- **Success Criteria**: Definition of epic success
- **Technical Notes**: Technical considerations
- **Testing Strategy**: Testing approach for the epic
- **Definition of Done**: Epic completion checklist

---

## 📚 Source Documents

All epic information is derived from:

- [`source-documents/04-wbs/epics-table.md`](../../../../source-documents/04-wbs/epics-table.md) - Epic metadata
- [`source-documents/04-wbs/stories-table.md`](../../../../source-documents/04-wbs/stories-table.md) - Story-to-epic mapping
- [`source-documents/04-wbs/dependencies-table.md`](../../../../source-documents/04-wbs/dependencies-table.md) - Epic dependencies
- [`source-documents/01-prd/PRD_DFMS_v1.0.md`](../../../../source-documents/01-prd/PRD_DFMS_v1.0.md) - Product requirements

---

## 🔍 How to Use Epic Files

### For Product Managers
1. Review epic overview for sprint planning
2. Check dependencies before scheduling
3. Monitor critical path epics closely
4. Use epic acceptance criteria for epic-level validation

### For Developers
1. Read epic file for context before starting stories
2. Understand epic dependencies
3. Review technical notes for architecture guidance
4. Check related epics for integration points

### For QA/Testers
1. Use epic acceptance criteria for epic-level test planning
2. Review testing strategy section
3. Understand epic dependencies for integration testing
4. Check definition of done for epic completion

---

## 📊 Epic Distribution

### By Module Category

- **Foundation** (3 epics, 130 SP): EPIC-001, EPIC-002, EPIC-003
- **Core Data** (2 epics, 95 SP): EPIC-004, EPIC-005
- **Operations** (7 epics, 345 SP): EPIC-006, EPIC-007, EPIC-008, EPIC-009, EPIC-011, EPIC-012, EPIC-013
- **Vendor** (1 epic, 55 SP): EPIC-010
- **Quality** (1 epic, 110 SP): EPIC-014
- **Monitoring** (1 epic, 35 SP): EPIC-015
- **Mobile** (2 epics, 180 SP): EPIC-016, EPIC-017

### By Priority

- **P0 (Critical)**: 3 epics (EPIC-001, EPIC-002, EPIC-003)
- **P1 (High)**: 7 epics (EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, EPIC-009, EPIC-014, EPIC-016, EPIC-017)
- **P2 (Medium)**: 7 epics (EPIC-010, EPIC-011, EPIC-012, EPIC-013, EPIC-015)

---

## 🔄 Epic Dependencies

See individual epic files for detailed dependency information. Key dependencies:

- **EPIC-001** blocks all other epics (foundation)
- **EPIC-009** blocks EPIC-011, EPIC-012, EPIC-013, EPIC-014 (critical path)
- **EPIC-014** blocks EPIC-016 (QC workflow required for mobile QC)

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/` (WBS - Source of Truth)

