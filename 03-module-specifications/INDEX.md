# DFMS Module Specifications - Complete Index

This index provides a comprehensive mapping of all module specifications, cross-references, dependencies, and user story mappings.

**Last Updated**: 2026-03-16

---

## 📊 Overview Statistics

- **Total Modules**: 11
- **Total Specification Files**: 35 specification files + 11 README files = 46 markdown files
- **Module README Files**: 11 (one per module)
- **Source**: PRD_DFMS_v1.0.md (5,362 lines)
- **Related User Stories**: 98 stories in Phase-1 backlog (US-001 to US-098)

---

## 🗂️ Complete Module Structure

> **Product overview & business context** is maintained in `02-domain/` (not in this folder).
> See [`02-domain/01-overview/`](../02-domain/01-overview/) for product vision, scope, objectives, and user personas.

### [01-foundation/](01-foundation/README.md) - System Foundation
**Purpose**: Authentication, security, RBAC, tenant management  
**PRD Sections**: 6.1, 6.2  
**Phase**: Phase 1 (Critical)  
**Dependencies**: None (foundation layer)

#### Specifications
- [authentication-security.md](01-foundation/authentication-security.md) - Authentication, 2FA, Session Control
- [rbac.md](01-foundation/rbac.md) - Role-based Access Control, Dynamic Role Builder
- [user-tenant-management.md](01-foundation/user-tenant-management.md) - User & Tenant Management
- [system-foundation.md](01-foundation/system-foundation.md) - System Foundation overview, audit logging
- [permission-catalog-phase1.md](01-foundation/permission-catalog-phase1.md) - Complete permission catalog for Phase 1 (all roles & modules)

#### Related User Stories
- US-001: User Login & Account Lockout
- US-002: Multi-Factor Authentication
- US-003: Session Control
- US-004: Role Hierarchy & RBAC
- US-005: User Invitation & Activation
- US-006: OTP Verification
- US-007: Account Deactivation
- US-008: Password & Account Reset
- US-009: User Activity & Audit Logs
- US-098: Tenant Onboarding & Schema Provisioning

#### Cross-References
- **Required by**: All operational modules
- **Provides**: User context, authentication, authorization, audit trail

---

### [02-master-data/](02-master-data/README.md) - Master Data Management
**Purpose**: Core master data configuration and management  
**PRD Sections**: 6.3, 6.4, 6.5  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/`

#### Specifications
- [master-data-configuration.md](02-master-data/master-data-configuration.md) - Master Data Configuration
- [product-inventory-management.md](02-master-data/product-inventory-management.md) - Product Inventory Management (PIM)
- [poi-management.md](02-master-data/poi-management.md) - POI Management & Geofencing

#### Related User Stories
- US-014: Capacity Checking and Warnings
- US-053: Vehicle Registration & Master Data
- US-057: Driver Master Data
- US-061: Helper Profile
- US-047: Vendor Registration

#### Cross-References
- **Depends on**: `01-foundation/` (RBAC, audit)
- **Referenced by**: `03-operations/`, `04-poi-operations/`, `05-vendor-management/`, `06-fleet-management/`
- **Provides**: POI, Product, Vehicle, Driver, Vendor master data

---

### [03-operations/](03-operations/README.md) - Core Business Operations
**Purpose**: End-to-end transport and logistics workflow management  
**PRD Sections**: 6.6, 6.7, 6.8  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/`, `02-master-data/`

#### Specifications
- [product-requisition-management.md](03-operations/product-requisition-management.md) - Product Requisition Management
- [transport-requisition-management.md](03-operations/transport-requisition-management.md) - Transport Requisition (TR) Management
- [transport-order-management.md](03-operations/transport-order-management.md) - Transport Order (TO) Management
- [trip-management.md](03-operations/trip-management.md) - Trip Management, Trip Closure, Trip Costing

#### Related User Stories
- US-010 to US-025: PR, TR, TO, Trip workflows
- Key workflows: Requisition → Approval → TR → TO → Trip → Closure

#### Cross-References
- **Depends on**: `01-foundation/` (RBAC), `02-master-data/` (POI, Product, Vehicle)
- **Drives**: `04-poi-operations/` (gate, scaling, QC), `05-vendor-management/` (bidding), `06-fleet-management/` (fleet assignment)
- **Provides**: PR/TR/TO/Trip entities and workflows

---

### [04-poi-operations/](04-poi-operations/README.md) - Operations Support
**Purpose**: Supporting operational workflows (gate, scaling, QC, command center)  
**PRD Sections**: 6.9, 6.10, 6.13  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `03-operations/`

#### Specifications
- [gate-management.md](04-poi-operations/gate-management.md) - Gate-In, Gate-Out, On-Demand TO Creation
- [scaling-management.md](04-poi-operations/scaling-management.md) - Scale-In, Scale-Out, Queue Token
- [command-center.md](04-poi-operations/command-center.md) - Command Center Operations
- [qc-workflow.md](04-poi-operations/qc-workflow.md) - Quality Control Workflow

#### Related User Stories
- US-026, US-035-046: Gate, Scaling, Loading operations
- US-044-056, US-077-090: QC workflows
- US-063-070: Gate & Scaling management
- US-071-076: Command Center, Loading/Unloading

#### Cross-References
- **Depends on**: `03-operations/` (Trip entity and state)
- **Integrates with**: `02-master-data/` (POI), `06-fleet-management/` (Vehicle)
- **Provides**: Gate logs, weight data, QC results, loading/unloading timestamps

---

### [05-vendor-management/](05-vendor-management/README.md) - Vendor Management
**Purpose**: Vendor ecosystem and lifecycle management  
**PRD Sections**: 6.11  
**Phase**: Phase 1 (High)  
**Dependencies**: `03-operations/`, `02-master-data/`

#### Specifications
- [vendor-onboarding.md](05-vendor-management/vendor-onboarding.md) - Vendor Onboarding & Registration
- [vendor-bidding.md](05-vendor-management/vendor-bidding.md) - Vendor Bidding Portal, Bid Evaluation
- [vendor-portal.md](05-vendor-management/vendor-portal.md) - Vendor Portal, Real-time TO Updates

#### Related User Stories
- US-024: Vendor Bidding Portal
- US-027-034: Vendor operations (registration, performance, payment, contracts)
- US-047: Vendor Registration
- US-094: Vendor Application Access

#### Cross-References
- **Depends on**: `03-operations/` (TO entity), `02-master-data/` (Vendor master)
- **Integrates with**: `07-mobile-apps/` (Vendor mobile app)
- **Provides**: Vendor bidding, TO assignment, vendor performance tracking

---

### [06-fleet-management/](06-fleet-management/README.md) - Fleet Management
**Purpose**: Fleet, vehicle, driver, and helper lifecycle management  
**PRD Sections**: 6.6 (partial), 6.10 (partial)  
**Phase**: Phase 1 (High)  
**Dependencies**: `02-master-data/`

#### Specifications
- [vehicle-management.md](06-fleet-management/vehicle-management.md) - Fleet & Vehicle Management
- [driver-management.md](06-fleet-management/driver-management.md) - Driver Registration & Management
- [helper-management.md](06-fleet-management/helper-management.md) - Helper Profile & Assignment
- [fuel-management.md](06-fleet-management/fuel-management.md) - Fuel Management System

#### Related User Stories
- US-053: Vehicle Registration & Master Data
- US-057: Driver Master Data
- US-058: Fuel Management
- US-061-062: Helper Profile & Assignment

#### Cross-References
- **Depends on**: `02-master-data/` (Vehicle, Driver, Helper masters)
- **Referenced by**: `03-operations/` (TO/Trip assignment)
- **Provides**: Fleet availability, vehicle/driver assignment, fuel tracking

---

### [07-mobile-apps/](07-mobile-apps/README.md) - Mobile Interfaces
**Purpose**: Mobile applications for drivers, vendors, and QC supervisors  
**PRD Sections**: 11, 12  
**Phase**: Phase 1 (High)  
**Dependencies**: `03-operations/`, `04-poi-operations/`, `05-vendor-management/`

#### Specifications
- [driver-mobile.md](07-mobile-apps/driver-mobile.md) - Driver Mobile Interface
- [qc-mobile.md](07-mobile-apps/qc-mobile.md) - QC Supervisor Mobile Interface
- [vendor-mobile.md](07-mobile-apps/vendor-mobile.md) - Vendor Mobile Application

#### Related User Stories
- US-052: Driver Mobile Interface
- US-092: Trip Management Driver Interface
- US-093: QC Interface
- US-094: Vendor Application Access

#### Cross-References
- **Depends on**: `03-operations/` (Trip), `04-poi-operations/` (QC, Gate), `05-vendor-management/` (Vendor TO)
- **Provides**: Mobile access for field users

---

### [08-reporting/](08-reporting/README.md) - Reporting & Analytics
**Purpose**: Business intelligence, reports, dashboards, and KPIs  
**PRD Sections**: 6.13 (Reporting)  
**Phase**: Phase 1-2 (Medium)  
**Dependencies**: All operational modules

#### Specifications
- [reporting.md](08-reporting/reporting.md) - Standard Reports
- [analytics.md](08-reporting/analytics.md) - Dashboards, KPIs, Analytics

#### Related User Stories
- Integrated across operational modules (no dedicated stories)

#### Cross-References
- **Depends on**: All operational modules (data sources)
- **Provides**: Reports, dashboards, KPIs for decision-making

---

###  [09-cross-cutting/](09-cross-cutting/README.md) - Non-Functional Requirements
**Purpose**: Cross-cutting concerns (performance, security, integration)  
**PRD Sections**: 7, 9, 10  
**Phase**: Phase 1 (Critical)  
**Dependencies**: Cross-cutting (applies to all modules)

#### Specifications
- [non-functional-requirements.md](09-cross-cutting/non-functional-requirements.md) - Performance, Scalability, Availability
- [security-compliance.md](09-cross-cutting/security-compliance.md) - Security & Compliance
- [integration-requirements.md](09-cross-cutting/integration-requirements.md) - GPS/VTS Integration, Map APIs

#### Related User Stories
- Cross-cutting requirements integrated into all modules
- Security: US-001-009
- Integration: Embedded in operational stories

#### Cross-References
- **Applies to**: All modules
- **Provides**: Performance standards, security requirements, integration patterns

---

### [10-phases/](10-phases/README.md) - Implementation Phases
**Purpose**: Phase-wise feature rollout plan and roadmap  
**PRD Sections**: Phase-wise Feature Structure  
**Phase**: All Phases  
**Dependencies**: All modules (organizational)

#### Specifications
- [phase-1.md](10-phases/phase-1.md) - Phase 1: Core Foundation & Operational Enablement (MVP)
- [phase-2.md](10-phases/phase-2.md) - Phase 2: Intermediate Enhancements & Analytics
- [phase-3.md](10-phases/phase-3.md) - Phase 3: Workshop, Advanced Analytics, Alerts

#### Related User Stories
- Phase 1: US-001 to US-094
- Phase 2-3: Future enhancements

#### Cross-References
- **Organizes**: All modules by implementation phase
- **Referenced by**: Project planning, roadmap documentation

---

### [11-reference/](11-reference/README.md) - Reference Materials
**Purpose**: Glossary, terminology, acronyms, and reference documentation  
**PRD Sections**: Glossary & Terminology, Appendix A  
**Phase**: All Phases (Reference)  
**Dependencies**: None (reference only)

#### Specifications
- [glossary.md](11-reference/glossary.md) - Glossary, Domain Terms, Acronyms

#### Cross-References
- **Referenced by**: All modules for terminology

---

## 🔍 Navigation Guide

### By Module
Each module folder contains:
- **README.md** - Module overview, specifications list, dependencies
- **Specification files** - Detailed technical specifications

### By Dependency
Use the dependency information in each module's README to understand:
- **Upstream**: What this module depends on
- **Downstream**: What depends on this module
- **Cross-module**: How modules interact

### By User Story
Use the "Related User Stories" sections to map stories to specifications.  
All stories are located in: `../04-backlog/02-stories/`

### By Phase
See `10-phases/` for phase-wise organization of features.

### By PRD Section
Each specification file includes PRD section references in frontmatter.

---

## 📊 Dependency Matrix

| Module | Depends On | Required By |
|--------|-----------|-------------|
| 01-foundation | None | All operational modules |
| 02-master-data | 01-foundation | 03, 04, 05, 06 |
| 03-operations | 01, 02 | 04, 05, 06, 07, 08 |
| 04-poi-operations | 03 | 08 |
| 05-vendor-management | 02, 03 | 07, 08 |
| 06-fleet-management | 02 | 03, 08 |
| 07-mobile-apps | 03, 04, 05 | - |
| 08-reporting | All operational | - |
| 09-cross-cutting | Cross-cutting | All |
| 10-phases | All (organizational) | - |
| 11-reference | None | All (reference) |

---

## 🔗 Related Documentation

- **[Main README](README.md)** - Module specifications overview
- **[Product Overview](../02-domain/01-overview/)** - Business context (vision, scope, objectives, personas)
- **[Phase Backlog](../04-backlog/README.md)** - Implementation user stories
- **[User Stories by Epic](../04-backlog/user-stories-by-epic.md)** - All 98 stories mapped to epics
- **[Sprint Plan](../04-backlog/phase-1-sprint-plan.md)** - Phase 1 sprint-wise delivery plan

---

## 🎯 Quick Reference

### Critical Path Modules (Phase 1)
1. **01-foundation** - Authentication, RBAC (US-001-009)
2. **02-master-data** - POI, Products, Master config (US-014, US-047, US-053, US-057, US-061)
3. **03-operations** - PR, TR, TO, Trip (US-010-025)
4. **04-poi-operations** - Gate, Scaling, QC, Command Center (US-026, US-035-090)
5. **09-cross-cutting** - Security, Performance, Integration

### High Priority Modules (Phase 1)
6. **05-vendor-management** - Vendor onboarding, bidding (US-024, US-027-034, US-047, US-094)
7. **06-fleet-management** - Fleet, Vehicle, Driver (US-053, US-057-062)
8. **07-mobile-apps** - Driver, QC, Vendor apps (US-052, US-092-094)

### Medium Priority (Phase 1-2)
9. **08-reporting** - Reports, Dashboards

---

**Last Updated**: 2026-03-16  
**Total Modules**: 11  
**Total Specifications**: 35 spec files + 11 README files = 46 files  
**Coverage**: 100% of PRD Phase-1 features  
**User Stories**: 98 (US-001 to US-098)

