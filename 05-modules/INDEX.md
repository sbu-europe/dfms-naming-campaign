# DFMS Module Specifications - Complete Index

This index provides a comprehensive mapping of all module specifications, cross-references, dependencies, and user story mappings.

**Last Updated**: 2026-07-24 (added Module 09 — GPS Tracking SSOT)

---

## 📊 Overview Statistics

- **Total Modules**: 11
- **Total Specification Files**: 36 specification files + 11 README files = 47 markdown files (driver spec lives under `01-foundation/`; removed from `02-master-data/`)
- **Module README Files**: 11 (one per module)
- **Source**: DFMS_Product_Requirements_Document_v3.md (5,362 lines)
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
- (Moved to 03-users/driver-user-profiles.md)
- [system-foundation.md](01-foundation/system-foundation.md) - System Foundation overview, audit logging
- [permission-catalog-phase1.md](01-foundation/permission-catalog-phase1.md) - Complete permission catalog for Phase 1 (all roles & modules)
- (Moved to 03-users/helper-master-data.md)

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
- US-061: Helper Profile
- US-052: Driver Mobile Interface (authenticates as Driver user)
- US-057: Driver user profiles & compliance
- US-098: Tenant Onboarding & Schema Provisioning

#### Cross-References
- **Required by**: All operational modules
- **Provides**: User context, authentication, authorization, audit trail
- **Helper identity**: [helper-master-data.md](03-users/helper-master-data.md) defines optional `user_id` → User for helpers who are also system users

---

### [02-master-data/](02-master-data/README.md) - Master Data Management
**Purpose**: Core master data configuration and management  
**PRD Sections**: 6.3, 6.4, 6.5  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `01-foundation/`

#### Specifications
- [product-master-data-management.md](02-master-data/product-master-data-management.md) - Product Master Data Management
- [poi-management.md](02-master-data/poi-management.md) - POI Management & Geofencing
- [vehicle-master-data.md](02-master-data/vehicle-master-data.md) - Vehicle Master Data Management

#### Related User Stories
- US-014: Capacity Checking and Warnings
- US-053: Vehicle Registration & Master Data
- US-057: Driver user profiles — see [`03-users/driver-user-profiles.md`](03-users/driver-user-profiles.md)
- US-061: Helper Profile
- US-047: Vendor Registration

#### Cross-References
- **Depends on**: `01-foundation/` (RBAC, audit)
- **Referenced by**: `03-operations/`, `04-poi-operations/`, `05-vendor-management/`, `06-fleet-management/`
- **Provides**: POI, Product, Vehicle, Vendor master data; **`Driver`** (+ User on create) in `03-users/driver-user-profiles.md`

---

### [03-users/](03-users/README.md) - User Profiles
**Purpose**: Driver and Helper user profiles and domain logic  
**PRD Sections**: 6.3.3  
**Phase**: Phase 1 (Critical)  
**Sprint Coverage**: Sprint 2  
**Dependencies**: `01-foundation/`  
**Django App**: `apps/users/`

#### Specifications
- [driver-user-profiles.md](03-users/driver-user-profiles.md) — Driver profile, compliance, user account link
- [optional-last-name-fb002.md](03-users/optional-last-name-fb002.md) — Sprint 8 FB-002: User & Driver last name optional
- [helper-master-data.md](03-users/helper-master-data.md) — Helper entity model, optional `user_id` FK to User

#### Related User Stories
- US-057: Driver user profiles & compliance
- US-061: Helper Master Data Management

#### Cross-References
- **Depends on**: `01-foundation/` (User & Tenant Management, RBAC)
- **Referenced by**: `08-fleet-management/`, `05-transport/`

---

### [04-requisitions/](04-requisitions/README.md) - Requisition, Distribution & Procurement Management
**Purpose**: Product Requisition origination and Distribution/Procurement TR workflow  
**PRD Sections**: 6.6 (Requisitions, Distribution, Procurement)  
**Phase**: Phase 1 (Critical)  
**Sprint Coverage**: Sprint 3  
**Dependencies**: `01-foundation/`, `02-master-data/`, `03-users/`  
**Django App**: `apps/requisitions/`

#### Specifications
- [product-requisition-management.md](04-requisitions/product-requisition-management.md) — FG PR + Port Shipment (import) + Procurement org list (PC-01, top-level **Port Shipments**): data model, menu structure, status lifecycle, role gates, LC/shipment docs, product item code lookup, overflow rules, audit trail *(DFS-032, DFS-033, DFS-036)*
- [distribution-management.md](04-requisitions/distribution-management.md) — FG PR queue, TR creation by Distribution Officer, Distribution Manager approval (approve / modify / reject), capacity snapshots, notifications *(DFS-034, DFS-035)*
- [procurement-management.md](04-requisitions/procurement-management.md) — Procurement **Transport Requests** (PC-02) and TR lifecycle; **Port Shipment** triage is **top-level** (PC-01 in `product-requisition-management` / Port Shipments module) — Port-only source gate, per-destination allocation, overflow guard, no approval — TRs immediately Available for Planning *(DFS-037)*

#### Related User Stories
- DFS-032: FG Product Requisition
- DFS-033: Port Shipment (Import) Registration
- DFS-034: Distribution FG PR Queue
- DFS-035: Distribution TR Creation & Manager Approval
- DFS-036: Port Shipments — org-wide list & detail (Procurement role)
- DFS-037: Procurement Destination Breakdown & TR Creation

#### Cross-References
- **Depends on**: `01-foundation/` (RBAC), `02-master-data/` (POI, Product)
- **Drives**: `05-transport/` (approved/submitted TRs — both Distribution and Procurement)
- **Provides**: PR and TR entities, Distribution workflow, Procurement destination breakdown workflow

---

### [05-transport/](05-transport/README.md) - Transport Management
**Purpose**: Transport Request planning inputs, Transport Order creation and TDO resource assignment, Trip lifecycle  
**PRD Sections**: 6.7, 6.8  
**Phase**: Phase 1 (Critical)  
**Sprint Coverage**: Sprint 3 (TR queue + planning inputs + TO creation + TDO assignment), Sprint 4 (Trip lifecycle)  
**Dependencies**: `04-requisitions/`, `02-master-data/`, `07-vendor-management/`  
**Django App**: `apps/transport/` (TR model in `apps/requisitions/`)

#### Specifications
- [transport-requisition-management.md](05-transport/transport-requisition-management.md) — TR queue (FG tab + Port Consignment tab), Transport Planner planning inputs (vehicle qty, type, C&F clearance), fleet availability counts, urgency/overdue flags, `UNDER_PLANNING` gate before TO creation *(TRQ-01, DFS-038)*
- [transport-order-management.md](05-transport/transport-order-management.md) — TO creation against TRs (own fleet / vendor fleet), TR quantity allocation + overflow guard, multi-TO per TR, auto-routing to TDO queue by fleet type, `TO-YYYYMMDD-XXXX` numbering, TR status auto-update (Partially → Fully Allocated) *(TO-01, DFS-039)*
- [trip-management.md](05-transport/trip-management.md) — TDO Own Fleet assignment (vehicle, driver, helpers, ETA — with conflict checks), TDO Vendor Fleet assignment (contractual vendor, auto-rate application), driver account assigned TO list, Trip 17-state machine (Sprint 4), `TripStatusHistory`, `TripIncident` *(TO-02, DFS-040)*

#### Related User Stories
- DFS-038 (TRQ-01): Transport Requests Queue & Planning Input
- DFS-039 (TO-01): Transport Order Creation
- DFS-040 (TO-02): TDO Vehicle, Driver, Helper & ETA Assignment

#### Cross-References
- **Depends on**: `04-requisitions/` (approved FG TRs + submitted Port TRs), `02-master-data/` (Vehicle, Driver, Helper, Route, POI), `07-vendor-management/` (contractual vendors + rates)
- **Drives**: `06-poi-operations/` (gate, QC, scale triggered by Trip state transitions in Sprint 4)
- **Provides**: TO/Trip entities, TDO assignment workflow, driver account visibility

---

### [06-poi-operations/](06-poi-operations/README.md) - POI Operations
**Purpose**: Supporting operational workflows (gate, scaling, QC, command center)  
**PRD Sections**: 6.9, 6.10, 6.13  
**Phase**: Phase 1 (Critical)  
**Dependencies**: `05-transport/`

#### Specifications
- [gate-management.md](06-poi-operations/gate-management.md) - Gate-In, Gate-Out, On-Demand TO Creation
- [scaling-management.md](06-poi-operations/scaling-management.md) - Scale-In, Scale-Out, Queue Token
- [command-center.md](06-poi-operations/command-center.md) - Command Center Operations
- [qc-workflow.md](06-poi-operations/qc-workflow.md) - Quality Control Workflow

#### Related User Stories
- US-026, US-035-046: Gate, Scaling, Loading operations
- US-044-056, US-077-090: QC workflows
- US-063-070: Gate & Scaling management
- US-071-076: Command Center, Loading/Unloading

#### Cross-References
- **Depends on**: `05-transport/` (Trip entity and state)
- **Integrates with**: `02-master-data/` (POI), `08-fleet-management/` (Vehicle)
- **Provides**: Gate logs, weight data, QC results, loading/unloading timestamps

---

### [07-vendor-management/](07-vendor-management/README.md) - Vendor Management
**Purpose**: Vendor ecosystem and lifecycle management  
**PRD Sections**: 6.11  
**Phase**: Phase 1 (High)  
**Dependencies**: `03-operations/`, `02-master-data/`

#### Specifications
- [vendor-onboarding.md](07-vendor-management/vendor-onboarding.md) - Vendor Onboarding & Registration
- [vendor-bidding.md](07-vendor-management/vendor-bidding.md) - Vendor Bidding Portal, Bid Evaluation
- [vendor-portal.md](07-vendor-management/vendor-portal.md) - Vendor Portal, Real-time TO Updates

#### Related User Stories
- US-024: Vendor Bidding Portal
- US-027-034: Vendor operations (registration, performance, payment, contracts)
- US-047: Vendor Registration
- US-094: Vendor Application Access

#### Cross-References
- **Depends on**: `05-transport/` (TO entity), `02-master-data/` (Vendor master)
- **Integrates with**: `09-mobile-apps/` (Vendor mobile app)
- **Provides**: Vendor bidding, TO assignment, vendor performance tracking

---

### [08-fleet-management/](08-fleet-management/README.md) - Fleet Management
**Purpose**: Fleet, vehicle, driver, and helper lifecycle management  
**PRD Sections**: 6.6 (partial), 6.10 (partial)  
**Phase**: Phase 1 (High)  
**Dependencies**: `02-master-data/`

#### Specifications
- [vehicle-management.md](08-fleet-management/vehicle-management.md) - Fleet & Vehicle Management
- [helper-management.md](08-fleet-management/helper-management.md) - Helper Profile & Assignment
- [fuel-management.md](08-fleet-management/fuel-management.md) - Fuel Management System

#### Related User Stories
- US-053: Vehicle Registration & Master Data
- US-057: Driver user profiles ([`03-users/driver-user-profiles.md`](03-users/driver-user-profiles.md))
- US-058: Fuel Management
- US-061-062: Helper Profile & Assignment

#### Cross-References
- **Depends on**: `02-master-data/` (Vehicle, Helper masters), `01-foundation/`, `03-users/` (Driver + Helper profiles)
- **Referenced by**: `05-transport/` (TO/Trip assignment)
- **Provides**: Fleet availability, vehicle/driver assignment, fuel tracking

---

### [09-tracking/](09-tracking/README.md) - GPS Tracking (product SSOT)
**Purpose**: Live GPS, providers, geofencing, dwell, maps surfaces  
**PRD Sections**: 6.5.4–6.5.10, 6.9.2, 9.1  
**Phase**: Phase 1 (Critical/High); §6.5.10 Phase 2  
**Sprint Coverage**: Sprint 5–6  
**Dependencies**: `01-foundation/`, `02-master-data/` (POI, Vehicle), `05-transport/` (TO, Trip)  
**Django App**: `apps/tracking` · Ingest: `services/gt06-ingest`

#### Specifications
- [README.md](09-tracking/README.md) — Module hub
- [providers/README.md](09-tracking/providers/README.md) — GPS devices / providers (all in one file)
- Live GPS (§6.5.5): [GPS-01](../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md) — not a separate module doc
- Arrival / departure (§6.5.6 / §6.5.8): [GPS-03](../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-03-vehicle-arrival-departure.md) — not a separate module doc
- Maps Dashboard (§6.5.4 / §6.9.2): [GPS-05](../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-05-maps-dashboard-integration.md) — not a separate module doc
- POI geofence radius (§6.5.7): [GPS-02](../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-02-poi-geofence-boundary-management.md)
- Dwell (§6.5.9): [GPS-04](../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-04-dwell-time-tracking.md)

Engineering (not BA SSOT): `apps/tracking/GT06_IMPLEMENTATION.md`, `apps/tracking/PRD_AS_BUILT.md`

#### Related Stories
- Sprint 6 GPS-01…GPS-05; Sprint 5 DFS-070 (demo MVP)
- US-026 (Command Center map — separate surface); US-097 (POI geofencing)

#### Cross-References
- **Depends on**: `02-master-data/` (POI radius, `gps_tracker_id`), `05-transport/` (TO origin/destination, Trip)
- **Related ops dwell**: `06-poi-operations/` (gate dwell ≠ geofence dwell)
- **Provides**: Live GPS map, geofence events, dwell timeline, GPS trail/history APIs

---

### [09-mobile-apps/](09-mobile-apps/README.md) - Mobile Interfaces
**Purpose**: Mobile applications for drivers, vendors, and QC supervisors  
**PRD Sections**: 11, 12  
**Phase**: Phase 1 (High)  
**Dependencies**: `03-operations/`, `04-poi-operations/`, `05-vendor-management/`

#### Specifications
- [driver-mobile.md](09-mobile-apps/driver-mobile.md) - Driver Mobile Interface
- [qc-mobile.md](09-mobile-apps/qc-mobile.md) - QC Supervisor Mobile Interface
- [vendor-mobile.md](09-mobile-apps/vendor-mobile.md) - Vendor Mobile Application

#### Related User Stories
- US-052: Driver Mobile Interface
- US-092: Trip Management Driver Interface
- US-093: QC Interface
- US-094: Vendor Application Access

#### Cross-References
- **Depends on**: `05-transport/` (Trip), `06-poi-operations/` (QC, Gate), `07-vendor-management/` (Vendor TO)
- **Provides**: Mobile access for field users

---

### [11-reporting/](11-reporting/README.md) - Reporting & Analytics
**Purpose**: Business intelligence, reports, dashboards, and KPIs  
**PRD Sections**: 6.13 (Reporting)  
**Phase**: Phase 1-2 (Medium)  
**Dependencies**: All operational modules

#### Specifications
- [reporting.md](11-reporting/reporting.md) - Standard Reports
- [analytics.md](11-reporting/analytics.md) - Dashboards, KPIs, Analytics

#### Related User Stories
- Integrated across operational modules (no dedicated stories)

#### Cross-References
- **Depends on**: All operational modules (data sources)
- **Provides**: Reports, dashboards, KPIs for decision-making

---

### [12-cross-cutting/](12-cross-cutting/README.md) - Cross-Cutting Concerns
**Purpose**: System-wide quality attributes, security standards, testing architecture, DevOps/infrastructure  
**PRD Sections**: 7, 9, 10  
**Phase**: Phase 1 (Critical)  
**Dependencies**: Cross-cutting (applies to all modules)

#### Specifications
- [non-functional-requirements.md](12-cross-cutting/non-functional-requirements.md) — Performance (3s page load, 500ms API), scalability (100+ tenants), availability SLA (99.5%), security standards
- [security-compliance.md](12-cross-cutting/security-compliance.md) — Layered security, AES-256, RBAC least-privilege, ISO 27001, incident response
- [integration-requirements.md](12-cross-cutting/integration-requirements.md) — GPS/VTS (30s tracking, geofencing), map APIs, ERP connectors, payment gateways
- [testing-strategy.md](12-cross-cutting/testing-strategy.md) — Automated test suite: pytest unit + API integration (Sprint 1 & 2), Playwright E2E (POM), coverage ≥ 80%, SonarQube Quality Gate, CI pipeline *(DFS-041, QA-01)*
- [aws-dev-environment.md](../08-development-guides/01-backend/07-deployment/aws-dev-environment.md) — AWS dev environment: EC2 t3.micro (ap-south-1), Docker Compose (Django + Celery + PG + Redis), Terraform IaC, HTTPS, S3, SES, CloudWatch, CI/CD deploy pipeline, ~$0.50/mo *(DFS-042, DEVOPS-01)*

#### Related User Stories
- Cross-cutting NFRs integrated into all modules
- Security: US-001–009
- Testing: DFS-041 (QA-01) — Sprint 3
- DevOps: DFS-042 (DEVOPS-01) — Sprint 3

#### Cross-References
- **Applies to**: All modules
- **Provides**: Performance standards, security requirements, integration patterns, test infrastructure, shared dev environment

---

### [13-phases/](13-phases/README.md) - Implementation Phases
**Purpose**: Phase-wise feature rollout plan and roadmap  
**PRD Sections**: Phase-wise Feature Structure  
**Phase**: All Phases  
**Dependencies**: All modules (organizational)

#### Specifications
- [phase-1.md](13-phases/phase-1.md) - Phase 1: Core Foundation & Operational Enablement (MVP)
- [phase-2.md](13-phases/phase-2.md) - Phase 2: Intermediate Enhancements & Analytics
- [phase-3.md](13-phases/phase-3.md) - Phase 3: Workshop, Advanced Analytics, Alerts

#### Related User Stories
- Phase 1: US-001 to US-094
- Phase 2-3: Future enhancements

#### Cross-References
- **Organizes**: All modules by implementation phase
- **Referenced by**: Project planning, roadmap documentation

---

### [14-reference/](14-reference/README.md) - Reference Materials
**Purpose**: Glossary, terminology, acronyms, and reference documentation  
**PRD Sections**: Glossary & Terminology, Appendix A  
**Phase**: All Phases (Reference)  
**Dependencies**: None (reference only)

#### Specifications
- [glossary.md](14-reference/glossary.md) - Glossary, Domain Terms, Acronyms

#### Cross-References
- **Referenced by**: All modules for terminology

---

### [03-users/](03-users/README.md) - User Profiles
**Purpose**: Driver and Helper user profiles and domain logic  
**PRD Sections**: 6.3.3  
**Phase**: Phase 1 (Critical)  
**Sprint Coverage**: Sprint 2  
**Dependencies**: `01-foundation/`

#### Specifications
- [tenant-user-management.md](03-users/tenant-user-management.md) — Tenant Admin user & role management: invite, assign roles, lifecycle, deactivation, audit trail *(US-004, US-005, US-007, US-008, US-009)*
- [optional-last-name-fb002.md](03-users/optional-last-name-fb002.md) — Sprint 8 FB-002: User & Driver last name optional *(US-005, US-057)*
- [driver-user-profiles.md](03-users/driver-user-profiles.md) — Driver entity beyond User account: compliance, license, state tracking *(US-057)*
- [helper-master-data.md](03-users/helper-master-data.md) — Helper entity model, optional `user_id` FK to User, availability state machine, trip assignment *(US-061)*

#### Related User Stories
- US-004: Role Hierarchy & RBAC
- US-005: User Invitation & Activation
- US-007: Account Deactivation & Reactivation
- US-008: Password & Account Reset
- US-009: User Activity & Audit Logs
- US-057: Driver user profiles & compliance
- US-061: Helper Master Data Management

#### Cross-References
- **Depends on**: `01-foundation/` (User & Tenant Management, RBAC)
- **Referenced by**: `08-fleet-management/`, `05-transport/`, `02-master-data/`

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
All stories are located in: `../03-backlog/stories/README.md`

### By Phase
See `10-phases/` for phase-wise organization of features.

### By PRD Section
Each specification file includes PRD section references in frontmatter.

---

## 📊 Dependency Matrix

| Module | Depends On | Required By | Sprint |
|--------|-----------|-------------|--------|
| 01-foundation | None | All modules | Sprint 1 |
| 02-master-data | 01 | 03, 04, 05, 06, 07, 08 | Sprint 2 |
| 03-users | 01 | 04, 05, 08 | Sprint 2 |
| 04-requisitions | 01, 02, 03 | 05, 11 | Sprint 3 |
| 05-transport | 04, 02, 07 | 06, 09, 11 | Sprint 3–4 |
| 06-poi-operations | 05 | 11 | Sprint 4 |
| 07-vendor-management | 02, 05 | 09, 11 | Sprint 4 |
| 08-fleet-management | 02, 03 | 05, 11 | Sprint 4 |
| 09-mobile-apps | 05, 06, 07 | — | Sprint 5 |
| 10-audit | Cross-cutting | All | Sprint 2+ |
| 11-reporting | All operational | — | Phase 2 |
| 12-cross-cutting | Cross-cutting | All | All phases |
| 13-phases | All (organizational) | — | Reference |
| 14-reference | None | All | Reference |

---

## 🔗 Related Documentation

- **[Main README](README.md)** - Module specifications overview
- **[Product Overview](../02-domain/01-overview/)** - Business context (vision, scope, objectives, personas)
- **[Phase Backlog](../03-backlog/README.md)** - Implementation user stories
- **[User Stories by Epic](../03-backlog/user-stories-by-epic.md)** - All 98 stories mapped to epics
- **[Sprint Plan](../03-backlog/phase-1-sprint-plan.md)** - Phase 1 sprint-wise delivery plan

---

## 🎯 Quick Reference

### Critical Path Modules (Phase 1)
1. **01-foundation** - Authentication, RBAC (US-001-009)
2. **02-master-data** - POI, Products, Master config (US-014, US-047, US-053, US-057); helper detail spec in **01-foundation** (US-061)
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

**Last Updated**: 2026-04-09  
**Total Modules**: 12  
**Total Specifications**: 36 spec files + 12 README files = 48 files  
**Coverage**: 100% of PRD Phase-1 features  
**User Stories**: 98 (US-001 to US-098)

