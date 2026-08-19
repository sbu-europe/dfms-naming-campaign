# DFMS Phase 1 - Epic Breakdown

> Epic-level implementation breakdown for DFMS Phase 1 (MVP)

**Source**: Based on `source-documents/04-wbs/epics-table.md`, `source-documents/03-sow/SOW Phase-1.md`, and `source-documents/01-prd/DFMS_Product_Requirements_Document_v3.md`  
**Status**: Planned  
**Total Epics**: 17  
**Total Story Points**: 946 SP  
**Duration**: 26 weeks (12 sprints)

---

## 📊 Epic Summary

| Epic ID | Epic Name | Module Category | Priority | Target Sprint | Duration | Story Points | Status |
|---------|-----------|-----------------|----------|---------------|----------|--------------|--------|
| EPIC-001 | System Foundation | Foundation | P0 | Sprint 1 | 2 Weeks | 40 | Planned |
| EPIC-002 | User & Tenant Foundation | Foundation | P0 | Sprint 1 | 2 Weeks | 40 | Planned |
| EPIC-003 | Master Data & Configuration | Foundation | P0 | Sprint 2 | 2 Weeks | 50 | Planned |
| EPIC-004 | POI Management & Geofencing | Core Data | P1 | Sprint 3 | 2 Weeks | 65 | Planned |
| EPIC-005 | Product Inventory Management (PIM) | Core Data | P1 | Sprint 4 | 3 Weeks | 30 | Planned |
| EPIC-006 | Fleet & Vehicle Management | Operations | P1 | Sprint 4 | 3 Weeks | 80 | Planned |
| EPIC-007 | Product Transfer Requisition Management | Operations | P1 | Sprint 5 | 3 Weeks | 50 | Planned |
| EPIC-008 | Distribution & Procurement Management | Operations | P1 | Sprint 5 | 3 Weeks | 45 | Planned |
| EPIC-009 | Transport Order (TO) Management | Operations | P1 | Sprint 6-7 | 3 Weeks | 90 | Planned |
| EPIC-010 | Vendor Management | Vendor | P2 | Sprint 8 | 3 Weeks | 55 | Planned |
| EPIC-011 | Gate Management | Operations | P2 | Sprint 8 | 3 Weeks | 35 | Planned |
| EPIC-012 | Scaling / Weight Management | Operations | P2 | Sprint 9 | 3 Weeks | 25 | Planned |
| EPIC-013 | Loading / Unloading Operations | Operations | P2 | Sprint 9 | 3 Weeks | 20 | Planned |
| EPIC-014 | Quality Control & Quality Assurance Workflow | Quality | P1 | Sprint 10-11 | 2 Weeks | 110 | Planned |
| EPIC-015 | Command Center Operations | Monitoring | P2 | Sprint 11 | 2 Weeks | 35 | Planned |
| EPIC-016 | Mobile Interface (Driver / QC) | Mobile | P1 | Sprint 11 | 2 Weeks | 90 | Planned |
| EPIC-017 | Mobile Applications (Vendor) | Mobile | P1 | Sprint 11 | 2 Weeks | 90 | Planned |

---

## 🔗 Epic Dependencies

### Dependency Table

| Epic ID | Depends On | Reason | Sprint | Blocking Impact |
|---------|------------|--------|--------|-----------------|
| EPIC-001 | None | Foundation - No dependencies | Sprint 1 | BLOCKS: All other EPICs |
| EPIC-002 | EPIC-001 | User management requires authentication | Sprint 1 | BLOCKS: EPIC-003 |
| EPIC-003 | EPIC-001, EPIC-002 | Master data needs user access | Sprint 2 | BLOCKS: EPIC-004, 005, 006, 007 |
| EPIC-004 | EPIC-003 | POI requires master data structure | Sprint 3 | BLOCKS: EPIC-007 |
| EPIC-005 | EPIC-003 | Products require master data | Sprint 4 | BLOCKS: EPIC-007, 014 |
| EPIC-006 | EPIC-001, EPIC-003 | Fleet requires master data | Sprint 4 | BLOCKS: EPIC-009 |
| EPIC-007 | EPIC-003, EPIC-004, EPIC-005 | PR needs POI + Products | Sprint 5 | BLOCKS: EPIC-008 (Critical Path) |
| EPIC-008 | EPIC-007 | Approves requisitions | Sprint 5 | BLOCKS: EPIC-009 (Critical Path) |
| EPIC-009 | EPIC-006, EPIC-007, EPIC-008 | TO needs TR + Fleet | Sprint 6-7 | BLOCKS: EPIC-011, 012, 013, 014 |
| EPIC-010 | EPIC-003 | Vendor requires master data | Sprint 8 | BLOCKS: EPIC-017 |
| EPIC-011 | EPIC-009 | Gate tracks TOs | Sprint 8 | BLOCKS: EPIC-012 |
| EPIC-012 | EPIC-009, EPIC-011 | Weighing after gate | Sprint 9 | BLOCKS: EPIC-013 |
| EPIC-013 | EPIC-009, EPIC-011, EPIC-012 | Loading after gate+weigh | Sprint 9 | BLOCKS: EPIC-014 |
| EPIC-014 | EPIC-005, EPIC-009, EPIC-013 | QC after loading | Sprint 10-11 | BLOCKS: EPIC-016 |
| EPIC-015 | EPIC-009, EPIC-014 | Dashboard monitors ops | Sprint 11 | No blocking |
| EPIC-016 | EPIC-009, EPIC-014 | Mobile for TO + QC | Sprint 11 | No blocking |
| EPIC-017 | EPIC-010, EPIC-009 | Vendor mobile for TO | Sprint 11 | No blocking |

---

## 🗺️ Epic Dependency Graph

```mermaid
graph TD
    subgraph Foundation["Foundation Layer"]
        EPIC-001[EPIC-001: System Foundation<br/>Sprint 1 | 40 SP]
        EPIC-002[EPIC-002: User & Tenant Foundation<br/>Sprint 1 | 40 SP]
        EPIC-003[EPIC-003: Master Data & Configuration<br/>Sprint 2 | 50 SP]
    end

    subgraph CoreData["Core Data Layer"]
        EPIC-004[EPIC-004: POI Management & Geofencing<br/>Sprint 3 | 65 SP]
        EPIC-005[EPIC-005: Product Inventory Management<br/>Sprint 4 | 30 SP]
    end

    subgraph Operations["Operations Layer"]
        EPIC-006[EPIC-006: Fleet & Vehicle Management<br/>Sprint 4 | 80 SP]
        EPIC-007[EPIC-007: Product Transfer Requisition<br/>Sprint 5 | 50 SP]
        EPIC-008[EPIC-008: Distribution & Procurement<br/>Sprint 5 | 45 SP]
        EPIC-009[EPIC-009: Transport Order Management<br/>Sprint 6-7 | 90 SP]
        EPIC-011[EPIC-011: Gate Management<br/>Sprint 8 | 35 SP]
        EPIC-012[EPIC-012: Scaling / Weight Management<br/>Sprint 9 | 25 SP]
        EPIC-013[EPIC-013: Loading / Unloading<br/>Sprint 9 | 20 SP]
    end

    subgraph Vendor["Vendor Layer"]
        EPIC-010[EPIC-010: Vendor Management<br/>Sprint 8 | 55 SP]
    end

    subgraph Quality["Quality Layer"]
        EPIC-014[EPIC-014: Quality Control & QA<br/>Sprint 10-11 | 110 SP]
    end

    subgraph Monitoring["Monitoring Layer"]
        EPIC-015[EPIC-015: Command Center Operations<br/>Sprint 11 | 35 SP]
    end

    subgraph Mobile["Mobile Layer"]
        EPIC-016[EPIC-016: Mobile Interface Driver/QC<br/>Sprint 11 | 90 SP]
        EPIC-017[EPIC-017: Mobile Applications Vendor<br/>Sprint 11 | 90 SP]
    end

    %% Foundation dependencies
    EPIC-001 --> EPIC-002
    EPIC-001 --> EPIC-003
    EPIC-002 --> EPIC-003

    %% Core Data dependencies
    EPIC-003 --> EPIC-004
    EPIC-003 --> EPIC-005

    %% Operations dependencies
    EPIC-001 --> EPIC-006
    EPIC-003 --> EPIC-006
    EPIC-003 --> EPIC-007
    EPIC-004 --> EPIC-007
    EPIC-005 --> EPIC-007
    EPIC-007 --> EPIC-008
    EPIC-006 --> EPIC-009
    EPIC-007 --> EPIC-009
    EPIC-008 --> EPIC-009
    EPIC-009 --> EPIC-011
    EPIC-009 --> EPIC-012
    EPIC-011 --> EPIC-012
    EPIC-009 --> EPIC-013
    EPIC-011 --> EPIC-013
    EPIC-012 --> EPIC-013

    %% Vendor dependencies
    EPIC-003 --> EPIC-010

    %% Quality dependencies
    EPIC-005 --> EPIC-014
    EPIC-009 --> EPIC-014
    EPIC-013 --> EPIC-014

    %% Monitoring dependencies
    EPIC-009 --> EPIC-015
    EPIC-014 --> EPIC-015

    %% Mobile dependencies
    EPIC-009 --> EPIC-016
    EPIC-014 --> EPIC-016
    EPIC-010 --> EPIC-017
    EPIC-009 --> EPIC-017

    %% Styling
    classDef foundation fill:#e1f5ff,stroke:#01579b,stroke-width:2px
    classDef coreData fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef operations fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef vendor fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px
    classDef quality fill:#fce4ec,stroke:#880e4f,stroke-width:2px
    classDef monitoring fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    classDef mobile fill:#e0f2f1,stroke:#004d40,stroke-width:2px

    class EPIC-001,EPIC-002,EPIC-003 foundation
    class EPIC-004,EPIC-005 coreData
    class EPIC-006,EPIC-007,EPIC-008,EPIC-009,EPIC-011,EPIC-012,EPIC-013 operations
    class EPIC-010 vendor
    class EPIC-014 quality
    class EPIC-015 monitoring
    class EPIC-016,EPIC-017 mobile
```

---

## 🎯 Critical Path Analysis

### Critical Path (Must Not Be Delayed)

**Path**: `EPIC-001 → EPIC-002 → EPIC-003 → EPIC-007 → EPIC-008 → EPIC-009 → EPIC-014`

**Sprint Sequence**: `Sprint 1 → Sprint 1 → Sprint 2 → Sprint 5 → Sprint 5 → Sprint 6-7 → Sprint 10-11`

**Total Duration**: 18 weeks (70% of timeline)

**Impact**: Any delay in this path will delay the entire project completion.

**Mitigation**:
- Assign best developers to critical path epics
- Daily standup for critical path team
- No other work for critical path team
- Weekly PM review
- Pre-build parallel epics (EPIC-004, EPIC-005, EPIC-006) where possible

---

## 📋 Epic Details by Module Category

### Foundation (3 Epics, 130 SP)

#### EPIC-001: System Foundation
- **Priority**: P0 (Critical)
- **Sprint**: Sprint 1
- **Duration**: 2 weeks
- **Story Points**: 40 SP
- **Dependencies**: None
- **Stories**: US-001 to US-004
- **Key Features**:
  - User Login & Account Lockout
  - Multi-Factor Auth (2FA)
  - Session Control
  - Role-Based Access Control (RBAC)

#### EPIC-002: User & Tenant Foundation
- **Priority**: P0 (Critical)
- **Sprint**: Sprint 1
- **Duration**: 2 weeks
- **Story Points**: 40 SP
- **Dependencies**: EPIC-001
- **Stories**: US-005 to US-009
- **Key Features**:
  - User Invitation & Activation
  - OTP Verification
  - Account Deactivation
  - Password & Account Reset
  - User Activity & Audit Logs

#### EPIC-003: Master Data & Configuration
- **Priority**: P0 (Critical)
- **Sprint**: Sprint 2
- **Duration**: 2 weeks
- **Story Points**: 50 SP
- **Dependencies**: EPIC-001, EPIC-002
- **Stories**: US-010 to US-013
- **Key Features**:
  - Master Entity Registration
  - Bulk Upload & Inline Master Data Management
  - Master CRUD Operations
  - Data Consistency Referential Control

### Core Data (2 Epics, 95 SP)

#### EPIC-004: POI Management & Geofencing
- **Priority**: P1 (High)
- **Sprint**: Sprint 3
- **Duration**: 2 weeks
- **Story Points**: 65 SP
- **Dependencies**: EPIC-001, EPIC-003
- **Stories**: US-014 to US-022
- **Key Features**:
  - POI Definition & CRUD Operations
  - POI Classification (Type Tagging)
  - Map Layer Integration
  - Real-time Location Tracking
  - Geofencing & POI Tracking
  - Vehicle Arrival Tracking
  - Dwell Time Tracking

#### EPIC-005: Product Inventory Management (PIM)
- **Priority**: P1 (High)
- **Sprint**: Sprint 4
- **Duration**: 3 weeks
- **Story Points**: 30 SP
- **Dependencies**: EPIC-003
- **Stories**: US-023 to US-025
- **Key Features**:
  - Product Master Data
  - Catalogue Design
  - Product Configuration – Transport & QC Attribute Mapping

### Operations (7 Epics, 341 SP)

#### EPIC-006: Fleet & Vehicle Management
- **Priority**: P1 (High)
- **Sprint**: Sprint 4
- **Duration**: 3 weeks
- **Story Points**: 80 SP
- **Dependencies**: EPIC-001, EPIC-003
- **Stories**: US-026 to US-035 (estimated)
- **Key Features**:
  - Vehicle Registration & Management
  - Driver Registration & Management
  - Helper Profile & Assignment
  - Fleet Availability Management

#### EPIC-007: Product Transfer Requisition Management
- **Priority**: P1 (High)
- **Sprint**: Sprint 5
- **Duration**: 3 weeks
- **Story Points**: 50 SP
- **Dependencies**: EPIC-003, EPIC-004, EPIC-005
- **Stories**: US-026 to US-029
- **Key Features**:
  - Requisition Transfer Type Configuration
  - Unified Product Requisition (PR) Creation
  - Finished Goods Transfer Requisition
  - Port Consignment Transfer Requisition

#### EPIC-008: Distribution & Procurement Management
- **Priority**: P1 (High)
- **Sprint**: Sprint 5
- **Duration**: 3 weeks
- **Story Points**: 45 SP
- **Dependencies**: EPIC-007
- **Stories**: US-030 to US-034 (estimated)
- **Key Features**:
  - Distribution Approval Workflow
  - Procurement Approval Workflow
  - Stock Validation
  - Capacity Checking

#### EPIC-009: Transport Order (TO) Management
- **Priority**: P1 (High)
- **Sprint**: Sprint 6-7
- **Duration**: 3 weeks
- **Story Points**: 90 SP
- **Dependencies**: EPIC-006, EPIC-007, EPIC-008
- **Stories**: US-035 to US-046 (estimated)
- **Key Features**:
  - Transport Requisition (TR) Assessment
  - TO Creation (Multiple TOs per TR)
  - TO Execution (Own Fleet & Vendor Fleet)
  - Trip Lifecycle Management
  - Partial Delivery Handling
  - Incident Management
  - Trip Closure with POD

#### EPIC-011: Gate Management
- **Priority**: P2 (Medium)
- **Sprint**: Sprint 8
- **Duration**: 3 weeks
- **Story Points**: 35 SP
- **Dependencies**: EPIC-009
- **Stories**: US-063 to US-067
- **Key Features**:
  - Gate-In Entry (Source & Destination)
  - Gate-Out Entry
  - On-Demand Third Party TO Creation
  - Remarks Logging

#### EPIC-012: Scaling / Weight Management
- **Priority**: P2 (Medium)
- **Sprint**: Sprint 9
- **Duration**: 3 weeks
- **Story Points**: 25 SP
- **Dependencies**: EPIC-009, EPIC-011
- **Stories**: US-068 to US-070
- **Key Features**:
  - Weight Entry (Scale-In)
  - Queue Token Generation
  - Weight Exit (Scale-Out)

#### EPIC-013: Loading / Unloading Operations
- **Priority**: P2 (Medium)
- **Sprint**: Sprint 9
- **Duration**: 3 weeks
- **Story Points**: 20 SP
- **Dependencies**: EPIC-009, EPIC-011, EPIC-012
- **Stories**: US-075 to US-076
- **Key Features**:
  - Loading Operations
  - Unloading Operations

### Vendor (1 Epic, 55 SP)

#### EPIC-010: Vendor Management
- **Priority**: P2 (Medium)
- **Sprint**: Sprint 8
- **Duration**: 3 weeks
- **Story Points**: 55 SP
- **Dependencies**: EPIC-003, EPIC-009
- **Stories**: US-047 to US-052 (estimated)
- **Key Features**:
  - Vendor Registration & Verification
  - Vendor Bidding Portal
  - Bid Evaluation & Winner Selection
  - Vendor TO Dashboard
  - Vendor Invoice Submission

### Quality (1 Epic, 110 SP)

#### EPIC-014: Quality Control & Quality Assurance Workflow
- **Priority**: P1 (High)
- **Sprint**: Sprint 10-11
- **Duration**: 2 weeks
- **Story Points**: 110 SP
- **Dependencies**: EPIC-005, EPIC-009, EPIC-013
- **Stories**: US-077 to US-091
- **Key Features**:
  - QC Sample Collection
  - QC Lab Testing
  - QC Test Configuration
  - QC Pass/Fail/Auto-pass Tracking
  - Escalation Workflow
  - QC Report Generation
  - QC Checklist Management

### Monitoring (1 Epic, 35 SP)

#### EPIC-015: Command Center Operations
- **Priority**: P2 (Medium)
- **Sprint**: Sprint 11
- **Duration**: 2 weeks
- **Story Points**: 35 SP
- **Dependencies**: EPIC-009, EPIC-014
- **Stories**: US-071 to US-074
- **Key Features**:
  - View All Waiting Vehicles
  - Assign Loading/Unloading Point
  - Command Center Dashboard
  - Operational Monitoring

### Mobile (2 Epics, 180 SP)

#### EPIC-016: Mobile Interface (Driver / QC)
- **Priority**: P1 (High)
- **Sprint**: Sprint 11
- **Duration**: 2 weeks
- **Story Points**: 90 SP
- **Dependencies**: EPIC-009, EPIC-014
- **Stories**: US-092 to US-093
- **Key Features**:
  - Trip Management - Driver Interface
  - QC Interface (Mobile-responsive web)

#### EPIC-017: Mobile Applications (Vendor)
- **Priority**: P1 (High)
- **Sprint**: Sprint 11
- **Duration**: 2 weeks
- **Story Points**: 90 SP
- **Dependencies**: EPIC-010, EPIC-009
- **Stories**: US-094
- **Key Features**:
  - Vendor Application Access
  - TO List for Bidding
  - Trip Execution History

---

## 📊 Module Category Summary

| Module Category | Epic Count | Total Story Points | % of Total |
|----------------|------------|-------------------|------------|
| Foundation | 3 | 130 | 14% |
| Core Data | 2 | 95 | 10% |
| Operations | 7 | 341 | 36% |
| Vendor | 1 | 55 | 6% |
| Quality | 1 | 110 | 12% |
| Monitoring | 1 | 35 | 4% |
| Mobile | 2 | 180 | 19% |
| **Total** | **17** | **946** | **100%** |

---

## 🎯 Epic Priority Distribution

| Priority | Epic Count | Story Points | Epics |
|----------|------------|--------------|-------|
| **P0 (Critical)** | 3 | 130 | EPIC-001, EPIC-002, EPIC-003 |
| **P1 (High)** | 8 | 555 | EPIC-004, EPIC-005, EPIC-006, EPIC-007, EPIC-008, EPIC-009, EPIC-014, EPIC-016, EPIC-017 |
| **P2 (Medium)** | 6 | 261 | EPIC-010, EPIC-011, EPIC-012, EPIC-013, EPIC-015 |

---

## 📅 Sprint Assignment

| Sprint | Duration | Epics | Total SP | Priority |
|--------|----------|-------|----------|----------|
| Sprint 1 | 2 weeks | EPIC-001, EPIC-002 | 80 | Critical |
| Sprint 2 | 2 weeks | EPIC-003 | 50 | Critical |
| Sprint 3 | 2 weeks | EPIC-004 | 65 | High |
| Sprint 4 | 3 weeks | EPIC-005, EPIC-006 | 110 | High |
| Sprint 5 | 3 weeks | EPIC-007, EPIC-008 | 95 | High |
| Sprint 6-7 | 3 weeks | EPIC-009 | 90 | High |
| Sprint 8 | 3 weeks | EPIC-010, EPIC-011 | 90 | Medium |
| Sprint 9 | 3 weeks | EPIC-012, EPIC-013 | 45 | Medium |
| Sprint 10-11 | 2 weeks | EPIC-014 | 110 | High |
| Sprint 11 | 2 weeks | EPIC-015, EPIC-016, EPIC-017 | 215 | Mixed |

---

## 🔗 Related Documents

- **[WBS Epics Table](../../../01-source/04-wbs/epics-table.md)** - Source epic breakdown
- **[WBS Dependencies](../../../01-source/04-wbs/dependencies-table.md)** - Epic dependencies
- **[Stories Breakdown](./STORIES.md)** - Detailed story-level breakdown
- **[Implementation Timeline](./TIMELINE.md)** - Sprint-by-sprint timeline
- **[SOW Phase 1](../../../01-source/README.md)** - Statement of Work

---

**Last Updated**: February 17, 2026  
**Status**: Planned  
**Maintained By**: DFMS Implementation Team

