---
title: Phase 1 Sprint Plan
category: planning
phase: phase-1
sprints: 18
duration: Weeks 1-36 (36 weeks)
sprint_duration: 2 weeks
total_stories: 96
total_story_points: 504
target_velocity: 28
status: planned
created: 2026-02-23
updated: 2026-02-23
---

# Phase 1: Sprint Plan

> **Timeline**: 18 sprints (36 weeks)  
> **Sprint Duration**: 2 weeks  
> **Stories**: 96 | **Story Points**: 504  
> **Target Velocity**: 28 SP/sprint  
> **Team Size**: 5-6 developers (3 backend, 2 frontend, 1 QA)

---

## Sprint Summary

| Sprint | Weeks | Focus | Stories | SP | Epics |
|--------|-------|-------|--------:|---:|-------|
| 1 | 1-2 | System Foundation | 4 | 40 | EPIC-001 |
| 2 | 3-4 | Master Data Foundation | 5 | 31 | EPIC-005, EPIC-006, EPIC-010 |
| 3 | 5-6 | User Management | 5 | 31 | EPIC-002 |
| 4 | 7-8 | Requisition & Validation | 7 | 29 | EPIC-006, EPIC-007, EPIC-008 |
| 5 | 9-10 | Transport Order Creation | 4 | 26 | EPIC-009 |
| 6 | 11-12 | TO Execution & Trip Core | 3 | 26 | EPIC-009 |
| 7 | 13-14 | Trip Closure & Command Center | 4 | 29 | EPIC-009, EPIC-010, EPIC-015 |
| 8 | 15-16 | Vendor Ecosystem & QC Setup | 5 | 29 | EPIC-010, EPIC-014 |
| 9 | 17-18 | Gate Management & Vendor Portal | 4 | 27 | EPIC-010, EPIC-011 |
| 10 | 19-20 | Gate, Weight & Vendor Completion | 6 | 32 | EPIC-010, EPIC-011, EPIC-012 |
| 11 | 21-22 | Weight Exit, POI Gate Source & QC | 6 | 27 | EPIC-011, EPIC-012, EPIC-014 |
| 12 | 23-24 | POI Destination, Scaling & Mobile | 6 | 31 | EPIC-011, EPIC-012, EPIC-013, EPIC-016 |
| 13 | 25-26 | Unloading, Command Center & QC | 7 | 28 | EPIC-013, EPIC-014, EPIC-015 |
| 14 | 27-28 | QC Sampling Workflow | 9 | 29 | EPIC-013, EPIC-014 |
| 15 | 29-30 | QC Lab Processing | 7 | 24 | EPIC-014 |
| 16 | 31-32 | QC Decision & Advanced | 7 | 27 | EPIC-014 |
| 17 | 33-34 | Mobile Applications | 3 | 24 | EPIC-016, EPIC-017 |
| 18 | 35-36 | Trip Costing & Final Polish | 4 | 14 | EPIC-006, EPIC-014 |

---

## Velocity Chart

```
SP  |
 40 | ##
 35 |
 32 |                                        ##
 31 |       ##    ##                                ##
 29 |                   ##              ##    ##              ##
 28 |                                                    ##
 27 |                               ##          ##                ##
 26 |                         ##    ##
 24 |                                                          ##    ##
 14 |                                                                      ##
    +----------------------------------------------------------------------
      S1   S2   S3   S4   S5   S6   S7   S8   S9  S10  S11  S12  S13  S14  S15  S16  S17  S18
                                                                          Target: 28 SP/sprint
```

---

## Sprint Detail

---

### Sprint 1 (Weeks 1-2): System Foundation — 40 SP

**Goal**: Establish authentication, authorization, session management, and RBAC infrastructure

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-001 | User Login & Account Lockout | EPIC-001 | 10 | Critical | — |
| US-002 | Multi-Factor Auth (2FA) | EPIC-001 | 10 | Critical | US-001 |
| US-003 | Session Control | EPIC-001 | 10 | Critical | US-001 |
| US-004 | Role Hierarchy | EPIC-001 | 10 | Critical | US-001 |

**Deliverables**: JWT auth, RBAC engine, session management, account lockout  
**Infrastructure**: PostgreSQL + django-tenants, Redis, CI/CD pipeline, project skeleton  
**Notes**: High SP justified — single domain, parallelizable (US-002/003/004 are independent after US-001)

**Exit Criteria**:
- [ ] Login/logout with JWT tokens working
- [ ] 2FA/OTP flow functional
- [ ] Session management with concurrent limits
- [ ] 4-tier role hierarchy implemented
- [ ] CI/CD pipeline operational

---

### Sprint 2 (Weeks 3-4): Master Data Foundation — 31 SP

**Goal**: CRUD operations for all core master data entities

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-047 | Vendor Master Data | EPIC-010 | 5 | Critical | US-004 |
| US-053 | Vehicle Master Data | EPIC-006 | 5 | Critical | — |
| US-057 | Driver Master Data | EPIC-006 | 5 | Critical | US-004 |
| US-061 | Helper Master Data | EPIC-006 | 3 | Critical | US-004 |
| US-095 | Product Master Data (CRUD) | EPIC-005 | 13 | Critical | — |

**Deliverables**: Vendor, Vehicle, Driver, Helper, Product CRUD APIs with bulk upload  
**Notes**: Centralized `master_data` Django app; shared patterns for CRUD, validation, audit

**Exit Criteria**:
- [ ] All 5 master data entities with full CRUD
- [ ] Bulk CSV import/export for each entity
- [ ] Tenant-scoped data isolation verified
- [ ] Admin UI for master data management

---

### Sprint 3 (Weeks 5-6): User Management — 31 SP

**Goal**: Complete user lifecycle: invitation, activation, OTP, deactivation, audit

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-005 | User Invitation & Activation | EPIC-002 | 8 | Critical | — |
| US-006 | OTP Verification System | EPIC-002 | 5 | Critical | — |
| US-007 | Account Deactivation | EPIC-002 | 5 | Critical | — |
| US-008 | Password & Account Reset | EPIC-002 | 5 | Critical | — |
| US-009 | User Activity & Audit Logs | EPIC-002 | 8 | Critical | — |

**Deliverables**: Invitation flow, OTP service, account lifecycle, audit logging  
**Notes**: All stories independent — fully parallelizable across developers

**Exit Criteria**:
- [ ] Email/SMS invitation with token-based activation
- [ ] OTP generation, verification, cooldown
- [ ] Soft-delete deactivation with data retention
- [ ] Audit log capture for all user actions

---

### Sprint 4 (Weeks 7-8): Requisition & Validation — 29 SP

**Goal**: Transfer requisition workflows with approval chains and validation

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-010 | Create Port Transfer Requisition (TR) | EPIC-007 | 5 | Critical | US-005 |
| US-011 | Distribution Approval Workflow (FG TR) | EPIC-008 | 5 | Critical | US-009 |
| US-012 | Procurement Approval Workflow (Port TR) | EPIC-008 | 5 | Critical | US-010 |
| US-013 | Stock Validation (Source & Destination) | EPIC-007 | 3 | High | US-009 |
| US-014 | Capacity Checking and Warnings | EPIC-007 | 3 | High | US-009, US-053 |
| US-016 | Fleet Availability Validation | EPIC-009 | 3 | High | US-053, US-057 |
| US-062 | Helper Assignment | EPIC-006 | 5 | High | US-061 |

**Deliverables**: TR creation, multi-level approval, stock/capacity/fleet validation  
**Notes**: US-010/011/012 form the approval chain; US-013/014/016 are independent validations

**Exit Criteria**:
- [ ] Port consignment TR creation functional
- [ ] FG distribution approval workflow (multi-level)
- [ ] Procurement approval workflow
- [ ] Real-time stock and capacity validation
- [ ] Fleet availability checking against master data

---

### Sprint 5 (Weeks 9-10): Transport Order Creation — 26 SP

**Goal**: TR assessment, TO creation, and vendor fleet assignment

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-015 | TR Assessment by Transport Planner | EPIC-009 | 5 | Critical | US-011 |
| US-017 | TO Creation — Multiple TOs per TR | EPIC-009 | 8 | Critical | — |
| US-018 | TO Creation by Transport Planner | EPIC-009 | 8 | Critical | — |
| US-019 | TO Execution — Vendor Fleet (Direct Assignment) | EPIC-009 | 5 | Critical | — |

**Deliverables**: TR review interface, TO splitting, planner-driven TO creation, vendor assignment

**Exit Criteria**:
- [ ] Transport Planner can assess and approve TRs
- [ ] Single TR can generate multiple TOs
- [ ] TO creation with route, vehicle type, timeline
- [ ] Direct vendor fleet assignment for contractual TOs

---

### Sprint 6 (Weeks 11-12): TO Execution & Trip Core — 26 SP

**Goal**: Own fleet vehicle/driver assignment, trip state machine, incident handling

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-020 | TO Execution — Own Fleet (Vehicle/Driver Assignment) | EPIC-009 | 8 | Critical | US-017, US-053, US-057 |
| US-021 | Trip Lifecycle Management (12 States, Sub-states) | EPIC-009 | 13 | Critical | — |
| US-023 | Incident Management | EPIC-009 | 5 | High | — |

**Deliverables**: Fleet assignment, 12-state trip lifecycle, incident reporting  
**Notes**: US-021 is the largest single story — trip state machine is a critical-path item

**Exit Criteria**:
- [ ] Own fleet assignment (vehicle + driver matching)
- [ ] Trip state machine with 12 states and sub-states
- [ ] State transitions with validation and audit
- [ ] Incident creation, categorization, resolution

---

### Sprint 7 (Weeks 13-14): Trip Closure & Command Center — 29 SP

**Goal**: Delivery completion, vendor registration, real-time tracking

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-022 | Partial Delivery Handling | EPIC-009 | 5 | High | US-021 |
| US-025 | Trip Closure with Proof of Delivery (POD) | EPIC-009 | 8 | Critical | US-021 |
| US-026 | Real-time Map Dashboard (Command Center) | EPIC-015 | 8 | High | US-021 |
| US-027 | Vendor Registration & Verification | EPIC-010 | 8 | Critical | US-047 |

**Deliverables**: Partial delivery, POD upload, GPS map dashboard, vendor onboarding  
**Notes**: US-027 placed here to enable vendor bidding (US-024) in Sprint 8

**Exit Criteria**:
- [ ] Partial delivery with quantity reconciliation
- [ ] Trip closure with POD (photo, signature, ePOD)
- [ ] Real-time map with vehicle positions
- [ ] Vendor registration with document verification

---

### Sprint 8 (Weeks 15-16): Vendor Ecosystem & QC Setup — 29 SP

**Goal**: Vendor bidding, performance, payments; QC test configuration

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-024 | Vendor Bidding Portal for Non-Contractual TOs | EPIC-010 | 8 | High | US-027 |
| US-028 | Vendor Performance Tracking & Metrics | EPIC-010 | 5 | High | US-027 |
| US-029 | Vendor Payment Management | EPIC-010 | 8 | High | — |
| US-044 | QC Lab Testing Workflow | EPIC-014 | 5 | Critical | — |
| US-046 | QC Test Configuration & Checklist Management | EPIC-014 | 3 | Medium | — |

**Deliverables**: Bidding portal, KPI dashboards, payment processing, QC lab config

**Exit Criteria**:
- [ ] Vendor bidding with auto-ranking
- [ ] Performance scorecards (on-time, damage, compliance)
- [ ] Payment reconciliation and invoice management
- [ ] QC test types and parameters configured
- [ ] Lab testing workflow defined

---

### Sprint 9 (Weeks 17-18): Gate Management & Vendor Portal — 27 SP

**Goal**: Gate-in operations, on-demand TO creation, vendor self-service

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | 8 | Critical | — |
| US-064 | On Demand Third Party TO — Dealer Entry | EPIC-011 | 8 | High | US-063 |
| US-031 | Vendor Portal (Self-Service) | EPIC-010 | 8 | High | US-027 |
| US-030 | Vendor Fleet Management | EPIC-010 | 3 | Medium | US-027 |

**Deliverables**: Gate-in lookup interface, on-demand TO for dealers, vendor self-service portal

**Exit Criteria**:
- [ ] Gate-in search by TO number, challan, vehicle
- [ ] On-demand TO creation for third-party dealer entries
- [ ] Vendor portal with trip history, payments, fleet
- [ ] Vendor fleet registration and tracking

---

### Sprint 10 (Weeks 19-20): Gate, Weight & Vendor Completion — 32 SP

**Goal**: Gate-out, weight management, vendor contract/rating features

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-065 | On Demand Third Party TO — Supplier Entry | EPIC-011 | 8 | High | US-063 |
| US-068 | Weight Entry | EPIC-012 | 8 | Critical | US-063 |
| US-069 | Queue Token Generation | EPIC-012 | 5 | Critical | US-068 |
| US-032 | Vendor Rating & Reviews | EPIC-010 | 3 | Medium | US-025 |
| US-033 | Vendor Contract Management | EPIC-010 | 5 | Medium | US-027 |
| US-034 | Vendor Blacklist Management | EPIC-010 | 3 | Medium | US-027 |

**Deliverables**: Supplier on-demand TO, weighbridge integration, queue management, vendor contracts  
**Notes**: Highest SP sprint (32) — vendor stories are lightweight CRUD; weight stories need hardware integration

**Exit Criteria**:
- [ ] On-demand TO for supplier entries
- [ ] Weighbridge integration for automated weight capture
- [ ] Queue token with serial number generation
- [ ] Vendor contracts with terms and renewal tracking
- [ ] Rating system with trip-based scoring

---

### Sprint 11 (Weeks 21-22): Weight Exit, POI Gate Source & QC Prep — 27 SP

**Goal**: Weight exit, gate-out, POI gate operations at source, QC checklist setup

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-070 | Weight Exit | EPIC-012 | 8 | Critical | US-068 |
| US-066 | Gate-Out Entry | EPIC-011 | 5 | Critical | US-063, US-070 |
| US-067 | Remarks Logging | EPIC-011 | 3 | High | US-066 |
| US-035 | Gate-In Entry at Source POI | EPIC-011 | 5 | Critical | US-021 |
| US-036 | Gate-Out Entry at Source POI | EPIC-011 | 3 | Critical | US-035 |
| US-051 | QC Checklist Management (Visual Inspection) | EPIC-014 | 3 | Medium | — |

**Deliverables**: Weight exit recording, gate-out process, source POI gate ops, QC checklists  
**Notes**: US-070 → US-066 → US-067 must be sequential within the sprint

**Exit Criteria**:
- [ ] Weight exit with gross/tare/net calculation
- [ ] Gate-out with departure timestamp and seal verification
- [ ] Remarks logging per gate transaction
- [ ] Source POI gate-in/out operations
- [ ] Visual inspection checklists defined

---

### Sprint 12 (Weeks 23-24): POI Destination, Scaling & Mobile — 31 SP

**Goal**: Destination gate ops, scaling, loading operations, driver mobile app

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-037 | Gate-In Entry at Destination POI | EPIC-011 | 5 | Critical | US-036 |
| US-038 | Gate-Out Entry at Destination POI | EPIC-011 | 3 | High | — |
| US-039 | Scaling/Weighing at Source POI | EPIC-012 | 5 | High | — |
| US-040 | Scaling/Weighing at Destination POI | EPIC-012 | 5 | High | — |
| US-041 | Loading Operations Management | EPIC-013 | 5 | Critical | US-035 |
| US-052 | Driver Mobile Interface | EPIC-016 | 8 | High | US-026 |

**Deliverables**: Full destination gate cycle, POI scaling, loading management, driver app MVP  
**Notes**: Driver mobile starts here — uses trip lifecycle APIs from Sprint 6

**Exit Criteria**:
- [ ] Destination POI gate-in/gate-out working
- [ ] Scaling at both source and destination
- [ ] Loading operations with bay assignment
- [ ] Driver mobile: trip list, navigation, status updates

---

### Sprint 13 (Weeks 25-26): Unloading, Command Center & QC Sample — 28 SP

**Goal**: Unloading operations, command center dashboard, QC sample collection

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-042 | Unloading Operations Management | EPIC-013 | 5 | Critical | US-037 |
| US-043 | Command Center Operations Monitoring | EPIC-015 | 8 | High | US-021, US-035, US-037 |
| US-071 | View All Waiting Vehicles | EPIC-015 | 3 | Low | US-068 |
| US-072 | Assign Loading/Unloading Point | EPIC-015 | 3 | Low | US-071 |
| US-073 | Assignment Alert | EPIC-015 | 2 | Low | US-072 |
| US-074 | Assign Waiting Serial | EPIC-015 | 2 | Low | US-072 |
| US-045 | QC Sample Collection | EPIC-014 | 5 | High | US-042 |

**Deliverables**: Unloading workflow, command center live dashboard, queue management, QC sampling

**Exit Criteria**:
- [ ] Unloading operations with bay management
- [ ] Command center: real-time operations overview
- [ ] Vehicle queue with auto-serial assignment
- [ ] Loading/unloading point assignment with alerts
- [ ] QC sample collection at destination

---

### Sprint 14 (Weeks 27-28): QC Sampling Workflow — 29 SP

**Goal**: End-to-end QC sampling: context, creation, labeling, collection

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-075 | Load Start/End Date & Time Entry | EPIC-013 | 3 | Medium | US-072 |
| US-076 | Unload Start/End Date & Time Entry | EPIC-013 | 3 | Medium | US-075 |
| US-077 | Pre-QC Context Display | EPIC-014 | 3 | Medium | US-076 |
| US-078 | Sample Creation | EPIC-014 | 5 | Medium | US-077 |
| US-079 | Sample Labeling | EPIC-014 | 3 | Medium | US-078 |
| US-080 | Exception Recording | EPIC-014 | 3 | Medium | US-078 |
| US-081 | QC Context Display | EPIC-014 | 3 | Medium | US-077 |
| US-082 | Sample Collection Event | EPIC-014 | 4 | Medium | US-078 |
| US-085 | Sampling Timestamp | EPIC-014 | 2 | Medium | US-078 |

**Deliverables**: Loading/unloading timestamps, QC context views, sample lifecycle  
**Notes**: Tight dependency chain (US-075 → 076 → 077 → 078 → multiple). Small stories enable rapid sequencing.

**Exit Criteria**:
- [ ] Loading/unloading timestamps captured
- [ ] Pre-QC context with shipment details
- [ ] Sample creation with unique identifiers
- [ ] Sample labeling and QR code generation
- [ ] Exception recording for anomalies

---

### Sprint 15 (Weeks 29-30): QC Lab Processing — 24 SP

**Goal**: Lab request management, report processing, configurable QC forms

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-083 | Configurable Form (Checklist & Sampling) | EPIC-014 | 5 | Medium | US-081, US-051 |
| US-084 | QR/Barcode Label | EPIC-014 | 3 | Medium | US-078 |
| US-086 | Create Lab Request | EPIC-014 | 5 | Medium | US-078, US-084 |
| US-087 | Lab Estimated Completion | EPIC-014 | 2 | Medium | US-086 |
| US-088 | Lab Report Upload | EPIC-014 | 3 | Medium | US-086 |
| US-089 | Lab Status Monitoring | EPIC-014 | 3 | Medium | US-086 |
| US-048 | QC Report Generation | EPIC-014 | 3 | Medium | US-044 |

**Deliverables**: Configurable QC forms, lab request workflow, report upload, monitoring dashboard

**Exit Criteria**:
- [ ] Dynamic QC forms with configurable fields
- [ ] QR/barcode label printing
- [ ] Lab request submission with sample tracking
- [ ] Lab ETA calculation and display
- [ ] Lab report upload with result parsing
- [ ] QC report generation (PDF/Excel)

---

### Sprint 16 (Weeks 31-32): QC Decision & Advanced — 27 SP

**Goal**: QC pass/fail decisions, escalation, rejection workflows, advanced QC features

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-090 | QC Pass/Fail/Auto-pass Tracking | EPIC-014 | 5 | Medium | US-088 |
| US-091 | Escalation Workflow | EPIC-014 | 5 | High | US-090 |
| US-049 | QC Rejection Workflow | EPIC-014 | 5 | High | US-044 |
| US-050 | QC Dashboard & Analytics | EPIC-014 | 5 | Medium | US-044 |
| US-053b | QC Certificate Management | EPIC-014 | 2 | Low | US-044 |
| US-054 | QC Audit Trail & History | EPIC-014 | 2 | Medium | US-044 |
| US-055 | QC Vendor Quality Tracking | EPIC-014 | 3 | Medium | US-044 |

**Deliverables**: QC decision engine, escalation rules, rejection handling, QC analytics

**Exit Criteria**:
- [ ] Automated pass/fail based on lab results
- [ ] Auto-pass rules for trusted vendors
- [ ] Escalation to supervisor for borderline results
- [ ] Rejection workflow with hold/return/dispose options
- [ ] QC analytics dashboard

---

### Sprint 17 (Weeks 33-34): Mobile Applications — 24 SP

**Goal**: Mobile interfaces for drivers, QC supervisors, and vendors

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-092 | Trip Management — Driver Interface | EPIC-016 | 8 | Medium | US-021 |
| US-093 | QC Interface | EPIC-016 | 8 | Medium | US-078 |
| US-094 | Vendor Application Access | EPIC-017 | 8 | Medium | US-050 |

**Deliverables**: Driver trip management, QC mobile inspection, vendor mobile portal  
**Notes**: Flutter apps. Driver mobile MVP started in Sprint 12 (US-052); this sprint adds trip management features.

**Exit Criteria**:
- [ ] Driver app: trip management with GPS tracking
- [ ] QC app: sample collection, checklist execution
- [ ] Vendor app: bidding, trip monitoring, payments

---

### Sprint 18 (Weeks 35-36): Trip Costing & Final Polish — 14 SP

**Goal**: Trip financial analysis, compliance reporting, fuel tracking, UAT support

| ID | Story | Epic | SP | Priority | Dependencies |
|----|-------|------|----|----------|--------------|
| US-056 | QC Compliance & Regulatory Reporting | EPIC-014 | 3 | Medium | US-044 |
| US-058 | Fuel Management & Tracking | EPIC-006 | 3 | Medium | US-053, US-021 |
| US-059 | Trip Cost Calculation & Analysis | EPIC-006 | 5 | High | US-025 |
| US-060 | Trip Profitability Analysis & Revenue Tracking | EPIC-006 | 3 | Medium | US-059 |

**Deliverables**: Fuel tracking, trip costing, profitability analysis, compliance reports  
**Notes**: Lighter sprint intentionally — buffer for integration testing, UAT, bug fixes, go-live preparation

**Exit Criteria**:
- [ ] Fuel consumption tracking per trip
- [ ] Trip cost breakdown (fuel, tolls, driver, vendor)
- [ ] Profitability analysis (revenue vs. cost)
- [ ] Regulatory compliance reports (QC, safety)
- [ ] All integration tests passing
- [ ] UAT sign-off on critical workflows

---

## Critical Path

The longest sequential dependency chain determines the minimum project duration:

```
Sprint 1       Sprint 2       Sprint 3       Sprint 4       Sprint 5       Sprint 6
US-001 ──────► US-047 ──────► US-005 ──────► US-010 ──────► US-015 ──────► US-020
(Login)        (Vendor MD)    (User Inv.)    (TR Create)    (TR Assess)    (Own Fleet)
   │                                            │              │
   ├─► US-004 ─► US-053 ─► US-016              │              ├─► US-017 ─► US-018
   │            (Vehicle)   (Fleet Val.)        │                 (TO Create)
   │                                            │
   └─► US-009 ─► US-011 ───────────────────────►┘
      (Audit)   (Approval)

Sprint 6       Sprint 7       Sprint 8       Sprint 9       Sprint 10
US-021 ──────► US-025 ──────► US-024                          US-068
(Trip Life.)   (Trip Close)   (Bidding)                       (Weight In)
   │              │                                              │
   ├─► US-022     ├─► US-027 ─► US-028                          ├─► US-069
   │              │   (Vendor Reg)                               │
   └─► US-026     └─► US-063 ──────────────► US-065             └──────────►
      (Map)           (Gate-in)              (Supplier TO)

Sprint 11      Sprint 12      Sprint 13      Sprint 14      Sprint 15      Sprint 16
US-070 ──────► US-037 ──────► US-042 ──────► US-076 ──────► US-086 ──────► US-090
(Weight Out)   (Gate Dest)    (Unloading)    (Unload Time)  (Lab Request)  (QC Pass/Fail)
   │              │              │              │              │              │
   └─► US-066     └─► US-041    └─► US-045     └─► US-077     └─► US-088    └─► US-091
      (Gate-out)     (Loading)     (QC Sample)    (Pre-QC)       (Lab Report)   (Escalation)
                                                    │
                                                    └─► US-078 ─► US-079/080/082/084/085
                                                       (Sample Creation)
```

---

## Dependency Matrix

| Sprint | Depends On (must complete before) | Enables (must complete for) |
|--------|-----------------------------------|-----------------------------|
| 1 | — | All subsequent sprints |
| 2 | Sprint 1 (US-004 for role-based MD) | Sprint 4 (validations need MD) |
| 3 | — | Sprint 4 (US-005 for TR, US-009 for approvals) |
| 4 | Sprint 2, Sprint 3 | Sprint 5 (US-011 for TR assessment) |
| 5 | Sprint 4 | Sprint 6 (TO execution needs TO creation) |
| 6 | Sprint 5 | Sprint 7 (trip closure needs trip lifecycle) |
| 7 | Sprint 6 | Sprint 8 (bidding needs vendor registration) |
| 8 | Sprint 7 | Sprint 9 (gate ops), Sprint 15 (QC reports) |
| 9 | Sprint 8 (US-063 for gate lookup) | Sprint 10 (weight needs gate-in) |
| 10 | Sprint 9 | Sprint 11 (weight exit needs weight entry) |
| 11 | Sprint 10 | Sprint 12 (destination gate needs source gate) |
| 12 | Sprint 11 | Sprint 13 (unloading needs destination gate) |
| 13 | Sprint 12 | Sprint 14 (QC sampling needs unloading) |
| 14 | Sprint 13 | Sprint 15 (lab requests need samples) |
| 15 | Sprint 14 | Sprint 16 (QC decisions need lab reports) |
| 16 | Sprint 15 | Sprint 17 (mobile QC needs QC APIs) |
| 17 | Sprint 6, Sprint 14, Sprint 16 | — |
| 18 | Sprint 7 (trip closure for costing) | — |

---

## Story Cross-Reference by Epic

| Epic | Stories | Total SP | Sprints |
|------|---------|----------|---------|
| EPIC-001: System Foundation | US-001, US-002, US-003, US-004 | 40 | 1 |
| EPIC-002: User & Tenant Foundation | US-005, US-006, US-007, US-008, US-009 | 31 | 3 |
| EPIC-005: Product Inventory Mgmt | US-095 | 13 | 2 |
| EPIC-006: Fleet & Vehicle Mgmt | US-053, US-057, US-061, US-062, US-058, US-059, US-060 | 29 | 2, 4, 18 |
| EPIC-007: Product Transfer Requisition | US-010, US-013, US-014 | 11 | 4 |
| EPIC-008: Distribution & Procurement | US-011, US-012 | 10 | 4 |
| EPIC-009: Transport Order Mgmt | US-015, US-016, US-017, US-018, US-019, US-020, US-021, US-022, US-023 | 60 | 4-7 |
| EPIC-010: Vendor Management | US-047, US-024, US-027, US-028, US-029, US-030, US-031, US-032, US-033, US-034 | 56 | 2, 7-10 |
| EPIC-011: Gate Management | US-035, US-036, US-037, US-038, US-063, US-064, US-065, US-066, US-067 | 48 | 9-12 |
| EPIC-012: Scaling / Weight Mgmt | US-068, US-069, US-070, US-039, US-040 | 31 | 10-12 |
| EPIC-013: Loading / Unloading | US-041, US-042, US-075, US-076 | 16 | 12-14 |
| EPIC-014: Quality Control & QA | US-044, US-045, US-046, US-048, US-049, US-050, US-051, US-053b, US-054, US-055, US-056, US-077-US-091 | 109 | 8, 11, 13-16, 18 |
| EPIC-015: Command Center | US-025, US-026, US-043, US-071, US-072, US-073, US-074 | 31 | 7, 13 |
| EPIC-016: Mobile (Driver / QC) | US-052, US-092, US-093 | 24 | 12, 17 |
| EPIC-017: Mobile (Vendor) | US-094 | 8 | 17 |

---

## Priority Distribution per Sprint

| Sprint | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| 1 | 4 | — | — | — |
| 2 | 5 | — | — | — |
| 3 | 5 | — | — | — |
| 4 | 3 | 4 | — | — |
| 5 | 4 | — | — | — |
| 6 | 2 | 1 | — | — |
| 7 | 2 | 2 | — | — |
| 8 | 1 | 2 | 2 | — |
| 9 | 1 | 1 | 1 | — |
| 10 | 2 | — | 3 | — |
| 11 | 3 | 1 | 1 | — |
| 12 | 2 | 2 | — | — |
| 13 | 1 | 1 | — | 4 |
| 14 | — | — | 9 | — |
| 15 | — | — | 7 | — |
| 16 | — | 2 | 4 | 1 |
| 17 | — | — | 3 | — |
| 18 | — | 1 | 3 | — |

---

## Risks & Mitigations per Sprint

| Sprint | Key Risk | Mitigation |
|--------|----------|------------|
| 1 | 40 SP overcommitment | Stories parallelizable; infrastructure tasks shared across team |
| 6 | US-021 (13 SP) complexity | Spike for state machine design in Sprint 5; incremental state delivery |
| 10 | Weighbridge hardware integration | Start vendor coordination in Sprint 8; mock interface for testing |
| 12 | Driver mobile (Flutter) first sprint | Use Flutter starter template; API contracts finalized in Sprint 6 |
| 14-15 | Long QC dependency chain | Small stories (2-5 SP) enable rapid sequencing; daily standups to unblock |
| 17 | Three mobile apps in one sprint | Shared Flutter codebase; common navigation/auth module |
| 18 | Light sprint before go-live | Use buffer for integration testing, UAT, performance tuning |

---

## Velocity Tracking Template

| Sprint | Planned SP | Committed SP | Completed SP | Velocity | Carryover |
|--------|-----------|-------------|-------------|----------|-----------|
| 1 | 40 | | | | |
| 2 | 31 | | | | |
| 3 | 31 | | | | |
| 4 | 29 | | | | |
| 5 | 26 | | | | |
| 6 | 26 | | | | |
| 7 | 29 | | | | |
| 8 | 29 | | | | |
| 9 | 27 | | | | |
| 10 | 32 | | | | |
| 11 | 27 | | | | |
| 12 | 31 | | | | |
| 13 | 28 | | | | |
| 14 | 29 | | | | |
| 15 | 24 | | | | |
| 16 | 27 | | | | |
| 17 | 24 | | | | |
| 18 | 14 | | | | |

---

## Related Documents

- [Phase 1 Summary](./phase-1-summary.md)
- [Story List](./story-list.md)
- [Epic-Wise Story List](../epic-wise-story-list.md)
- [Complete Story List](../complete-story-list.md)
- [Feature Dependencies](../feature-dependencies.md)

---

**Last Updated**: February 23, 2026  
**Status**: Planned  
**Version**: 1.0
