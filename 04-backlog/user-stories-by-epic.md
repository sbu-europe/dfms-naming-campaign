# User Stories Grouped by Epic

> **Last Updated**: 2026-04-20  
> **Source of truth**: [`phase-1-sprint-plan.md`](phase-1-sprint-plan.md) and [`sprints/`](sprints/) folder  
> Sprint assignments reflect the current 10-sprint Phase 1 plan.

---

## EPIC-001: System Foundation (Infrastructure)

**Epic ID:** EPIC-001

### User Stories:

- **INFRA-01**: Local Development Environment Setup
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **INFRA-02**: Isolated Database per Client (Schema-per-Tenant)
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **INFRA-03**: Background Job Processing (Celery + Redis)
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **INFRA-04**: Caching and Session Storage (Redis-backed)
  - Sprint: Sprint 1 | Status: Done | SP: 1

- **INFRA-05**: Production-Ready Configuration & Onboarding Docs
  - Sprint: Sprint 1 | Status: Done | SP: 2

---

## EPIC-002: Platform Admin Portal

**Epic ID:** EPIC-002 (Platform Admin)

### User Stories:

- **PAP-01**: Custom-Branded Admin Interface (DFMS Design System)
  - Sprint: Sprint 1 | Status: Done | SP: 5

- **PAP-02**: Platform Admin Login (Username & Password)
  - Sprint: Sprint 1 | Status: Done | SP: 2

- **PAP-03**: Platform Admin 2FA — Email OTP Challenge
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **PAP-04**: Platform Admin Dashboard — Key Metrics
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **PAP-05**: Tenant Onboarding — Register a New Client Organisation
  - Sprint: Sprint 1 | Status: ~80% | SP: 13

- **PAP-06**: Tenant Management — View, Update, and Suspend Accounts
  - Sprint: Sprint 1 | Status: Done | SP: 3

---

## EPIC-003: Client Portal

**Epic ID:** EPIC-003 (Client Portal)

### User Stories:

- **CP-01**: Custom-Branded Client Portal Interface
  - Sprint: Sprint 1 | Status: Done | SP: 3

- **CP-02**: Branded Login Page Served on the Client's Domain
  - Sprint: Sprint 1 | Status: Done | SP: 2

- **CP-03**: 2FA — Email OTP (3-Step Secure Login)
  - Sprint: Sprint 1 | Status: Done | SP: 8

- **CP-04**: Account Activation Flow via Invitation Link
  - Sprint: Sprint 1 | Status: ~70% | SP: 5

- **CP-05**: Tenant Dashboard — Basic Live Operational Metrics
  - Sprint: Sprint 1 | Status: Done | SP: 3

---

## EPIC-004: Master Data Management

**Epic ID:** EPIC-004

### User Stories:

- **MDM-04 / US-097**: POI Setup & Management
  - Sprint: Sprint 2 | Status: Pending | SP: 8

- **MDM-01 / US-095**: Product Master Data Management (CRUD)
  - Sprint: Sprint 2 | Status: Pending | SP: 13

- **MDM-02 / US-096**: Route, Supplier & Dealer Master Data
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **MDM-03 / US-047**: Vendor Master Data (Admin CRUD & Bulk Upload)
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **MDM-05 / US-053**: Vehicle Registration & Master Data
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **MDM-06 / US-057**: Driver Master Data Management
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **MDM-07 / US-061**: Helper Master Data Management
  - Sprint: Sprint 2 | Status: Pending | SP: 3

---

## EPIC-005: Tenant User Management

**Epic ID:** EPIC-005

### User Stories:

- **TUM-01 / US-005**: User Invitation & Activation
  - Sprint: Sprint 2 | Status: In Progress (~70%) | SP: 5

- **TUM-02 / US-006**: OTP Verification System
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **TUM-03 / US-007**: Account Deactivation & Reactivation
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **TUM-04 / US-008**: Password & Account Reset
  - Sprint: Sprint 2 | Status: Pending | SP: 5

- **TUM-05 / US-009**: User Activity & Audit Logs
  - Sprint: Sprint 2 | Status: Pending | SP: 8

---

## EPIC-006: Vehicle Tracking & Geofencing

**Epic ID:** EPIC-006

### User Stories:

- **VTG-01**: Geofencing Engine — Arrival & Departure Detection
  - Sprint: Sprint 2 | Status: Pending | SP: 8

---

## EPIC-007: Requisition & Port Shipments (Sprint 3)

**Epic ID:** EPIC-007 (two top-level menus: **Requisition** = FG only; **Port Shipments** = import registration)

### Requisition (Finished Goods) — `Requisition` menu

- **PR-01**: FG Product Requisition
  - Sprint: Sprint 3 | Status: Pending | SP: 5

### Port Shipments (import) — separate **`Port Shipments` top-level menu** (not under Requisition)

- **PR-02**: Port Shipment (Import) Registration
  - Sprint: Sprint 3 | Status: Pending | SP: 5

---

## EPIC-008: Distribution

**Epic ID:** EPIC-008

### User Stories:

- **DR-01**: Distribution — FG Product Requisitions View
  - Sprint: Sprint 3 | Status: Pending | SP: 2

- **DR-02**: Distribution — Transport Request Creation & Manager Approval
  - Sprint: Sprint 3 | Status: Pending | SP: 8

---

## EPIC-009: Procurement

**Epic ID:** EPIC-009

### User Stories:

- **PC-01**: Procurement — RM Product Requisitions View
  - Sprint: Sprint 3 | Status: Pending | SP: 2

- **PC-02**: Procurement — Transport Request Creation
  - Sprint: Sprint 3 | Status: Pending | SP: 6

---

## EPIC-010: Transport Order (TO) Management

**Epic ID:** EPIC-010

### User Stories:

- **TRQ-01**: Transport Requests Queue (FG & Port Consignment)
  - Sprint: Sprint 3 | Status: Pending | SP: 3

- **TO-01**: Transport Order Creation
  - Sprint: Sprint 3 | Status: Pending | SP: 8

- **TO-02**: TDO Vehicle, Driver, Helper & ETA Assignment
  - Sprint: Sprint 3 | Status: Pending | SP: 8

- **TE-01 / US-020**: TO Execution — Own Fleet (Vehicle/Driver Assignment)
  - Sprint: Sprint 4 | Status: Pending | SP: 8

- **TE-02 / US-021**: Trip Lifecycle Management (12 States)
  - Sprint: Sprint 4 | Status: Pending | SP: 13

- **TE-03 / US-023**: Incident Management & Exception Handling
  - Sprint: Sprint 4 | Status: Pending | SP: 5

- **US-043**: Command Center Operations Monitoring
  - Sprint: Sprint 7 | Status: Pending | SP: 8

---

## EPIC-011: Trip Closure & Tracking

**Epic ID:** EPIC-011

### User Stories:

- **TC-01 / US-022**: Partial Delivery Handling
  - Sprint: Sprint 4 | Status: Pending | SP: 5

- **TC-02 / US-025**: Trip Closure with Proof of Delivery (POD)
  - Sprint: Sprint 4 | Status: Pending | SP: 8

- **TC-03 / US-026**: Real-time Map & Tracking Dashboard
  - Sprint: Sprint 4 | Status: Pending | SP: 8

---

## EPIC-012: Vendor Management

**Epic ID:** EPIC-012

### User Stories:

- **US-027**: Vendor Registration & Verification Workflow
  - Sprint: Sprint 5 | Status: Pending | SP: 8

- **US-024**: Vendor Bidding Portal (Non-Contractual TOs)
  - Sprint: Sprint 5 | Status: Pending | SP: 8

- **US-030**: Vendor Fleet Management
  - Sprint: Sprint 5 | Status: Pending | SP: 3

- **US-031**: Vendor Portal (Self-Service)
  - Sprint: Sprint 5 | Status: Pending | SP: 8

- **US-028**: Vendor Performance Tracking & Metrics
  - Sprint: Sprint 5 | Status: Pending | SP: 5

- **US-029**: Vendor Payment Management
  - Sprint: Sprint 5 | Status: Pending | SP: 8

- **US-032**: Vendor Rating & Reviews
  - Sprint: Sprint 5 | Status: Pending | SP: 3

- **US-033**: Vendor Contract Management
  - Sprint: Sprint 5 | Status: Pending | SP: 5

- **US-034**: Vendor Blacklist & Suspension
  - Sprint: Sprint 5 | Status: Pending | SP: 3

---

## EPIC-013: Gate Management

**Epic ID:** EPIC-013

### User Stories:

- **US-063**: Gate-in TO/Challan Lookup
  - Sprint: Sprint 6 | Status: Pending | SP: 8

- **US-064**: On-Demand TO Creation — Dealer Entry
  - Sprint: Sprint 6 | Status: Pending | SP: 8

- **US-065**: On-Demand TO Creation — Supplier Entry
  - Sprint: Sprint 6 | Status: Pending | SP: 8

- **US-035**: Gate-In at Source POI
  - Sprint: Sprint 6 | Status: Pending | SP: 5

- **US-036**: Gate-Out at Source POI
  - Sprint: Sprint 6 | Status: Pending | SP: 3

- **US-066**: Gate-Out Entry
  - Sprint: Sprint 6 | Status: Pending | SP: 5

- **US-067**: Remarks Logging
  - Sprint: Sprint 6 | Status: Pending | SP: 3

- **US-037**: Gate-In at Destination POI
  - Sprint: Sprint 7 | Status: Pending | SP: 5

- **US-038**: Gate-Out at Destination POI
  - Sprint: Sprint 7 | Status: Pending | SP: 3

---

## EPIC-014: Scaling / Weight Management

**Epic ID:** EPIC-014

### User Stories:

- **US-068**: Weight Entry (Scale-In)
  - Sprint: Sprint 6 | Status: Pending | SP: 8

- **US-069**: Queue Token Generation
  - Sprint: Sprint 6 | Status: Pending | SP: 5

- **US-070**: Weight Exit (Scale-Out)
  - Sprint: Sprint 6 | Status: Pending | SP: 8 (note: listed as 5 SP in phase plan — verify)

- **US-039**: Scaling/Weighing at Source POI
  - Sprint: Sprint 7 | Status: Pending | SP: 5

- **US-040**: Scaling/Weighing at Destination POI
  - Sprint: Sprint 7 | Status: Pending | SP: 5

---

## EPIC-015: Loading / Unloading Operations

**Epic ID:** EPIC-015

### User Stories:

- **US-041**: Loading Operations Management
  - Sprint: Sprint 7 | Status: Pending | SP: 5

- **US-042**: Unloading Operations Management
  - Sprint: Sprint 7 | Status: Pending | SP: 5

- **US-075**: Load Start/End Time Entry
  - Sprint: Sprint 7 | Status: Pending | SP: 3

- **US-076**: Unload Start/End Time Entry
  - Sprint: Sprint 7 | Status: Pending | SP: 3

- **US-073**: Assignment Alert/Notification
  - Sprint: Sprint 7 | Status: Pending | SP: 2

- **US-074**: Assign Waiting Serial
  - Sprint: Sprint 7 | Status: Pending | SP: 2

---

## EPIC-016: Quality Control & QA Workflow

**Epic ID:** EPIC-016

### User Stories:

- **US-051**: QC Checklist Management (Visual Inspection)
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-046**: QC Test Configuration & Checklist Management
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-044**: QC Lab Testing Workflow
  - Sprint: Sprint 8 | Status: Pending | SP: 5

- **US-045**: QC Sample Collection
  - Sprint: Sprint 8 | Status: Pending | SP: 5

- **US-077**: Pre-QC Context Display
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-078**: Sample Creation
  - Sprint: Sprint 8 | Status: Pending | SP: 5

- **US-079**: Sample Labeling
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-083**: Configurable Form/Checklist for Sampling
  - Sprint: Sprint 8 | Status: Pending | SP: 5

- **US-084**: QR/Barcode Label
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-080**: Exception Recording
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-081**: QC Context Display
  - Sprint: Sprint 8 | Status: Pending | SP: 3

- **US-082**: Sample Collection Event
  - Sprint: Sprint 8 | Status: Pending | SP: 4

- **US-085**: Sampling Timestamp
  - Sprint: Sprint 8 | Status: Pending | SP: 2

- **US-086**: Create Lab Request
  - Sprint: Sprint 9 | Status: Pending | SP: 5

- **US-087**: Lab Estimated Completion Time
  - Sprint: Sprint 9 | Status: Pending | SP: 2

- **US-088**: Lab Report Upload
  - Sprint: Sprint 9 | Status: Pending | SP: 3

- **US-089**: Lab Status Monitoring
  - Sprint: Sprint 9 | Status: Pending | SP: 3

- **US-090**: QC Pass/Fail/Auto-Pass Tracking
  - Sprint: Sprint 9 | Status: Pending | SP: 5

- **US-091**: Escalation Workflow
  - Sprint: Sprint 9 | Status: Pending | SP: 5

- **US-049**: QC Rejection Workflow
  - Sprint: Sprint 9 | Status: Pending | SP: 5

- **US-048**: QC Report Generation
  - Sprint: Sprint 9 | Status: Pending | SP: 3

- **US-050**: QC Dashboard & Analytics
  - Sprint: Sprint 9 | Status: Pending | SP: 5

- **US-053b**: QC Certificate Management
  - Sprint: Sprint 9 | Status: Pending | SP: 2

- **US-054**: QC Audit Trail & History
  - Sprint: Sprint 9 | Status: Pending | SP: 2

- **US-055**: QC Vendor Quality Tracking
  - Sprint: Sprint 9 | Status: Pending | SP: 3

- **US-056**: QC Compliance & Regulatory Reporting
  - Sprint: Sprint 9 | Status: Pending | SP: 3

---

## EPIC-017: Mobile Applications

**Epic ID:** EPIC-017

### User Stories:

- **US-052**: Driver Mobile Interface
  - Sprint: Sprint 10 | Status: Pending | SP: 8

- **US-092**: Trip Management — Driver Interface
  - Sprint: Sprint 10 | Status: Pending | SP: 8

- **US-093**: QC Supervisor Mobile Interface
  - Sprint: Sprint 10 | Status: Pending | SP: 8

- **US-094**: Vendor Mobile Application Access
  - Sprint: Sprint 10 | Status: Pending | SP: 8

---

## EPIC-018: Financial Management

**Epic ID:** EPIC-018

### User Stories:

- **US-058**: Fuel Management & Tracking
  - Sprint: Sprint 10 | Status: Pending | SP: 3

- **US-059**: Trip Cost Calculation & Analysis
  - Sprint: Sprint 10 | Status: Pending | SP: 5

- **US-060**: Trip Profitability Analysis
  - Sprint: Sprint 10 | Status: Pending | SP: 3

---

## Summary Statistics

### Stories by Epic

| Epic ID | Epic Name | Stories | SP |
|---------|-----------|---------|-----|
| EPIC-001 | System Foundation (Infrastructure) | 5 | 12 |
| EPIC-002 | Platform Admin Portal | 6 | 29 |
| EPIC-003 | Client Portal | 5 | 21 |
| EPIC-004 | Master Data Management | 7 | 44 |
| EPIC-005 | Tenant User Management | 5 | 28 |
| EPIC-006 | Vehicle Tracking & Geofencing | 1 | 8 |
| EPIC-007 | Requisition | 2 | 10 |
| EPIC-008 | Distribution | 2 | 10 |
| EPIC-009 | Procurement | 2 | 8 |
| EPIC-010 | Transport Order Management | 7 | 53 |
| EPIC-011 | Trip Closure & Tracking | 3 | 21 |
| EPIC-012 | Vendor Management | 9 | 51 |
| EPIC-013 | Gate Management | 9 | 48 |
| EPIC-014 | Scaling / Weight Management | 5 | 31 |
| EPIC-015 | Loading / Unloading Operations | 6 | 20 |
| EPIC-016 | Quality Control & QA Workflow | 26 | 92 |
| EPIC-017 | Mobile Applications | 4 | 32 |
| EPIC-018 | Financial Management | 3 | 11 |
| **Total** | | **107** | **~529** |

### Sprint Distribution

| Sprint | Theme | Stories | SP |
|--------|-------|---------|-----|
| Sprint 1 | Infrastructure, Onboarding & Secure Login | 16 | ~62 |
| Sprint 2 | Master Data, User Management & Vehicle Tracking | 13 | 83 |
| Sprint 3 | Requisition, Transport Requests & Orders | 10 | 68 |
| Sprint 4 | Trip Execution & Closure | 6 | 47 |
| Sprint 5 | Vendor Management | 9 | 51 |
| Sprint 6 | Gate Management & Weighing | 10 | 61 |
| Sprint 7 | Destination Operations & Loading/Unloading | 11 | 46 |
| Sprint 8 | QC Sampling & Lab Workflow | 13 | 47 |
| Sprint 9 | QC Lab Results, Decisions & Compliance | 13 | 46 |
| Sprint 10 | Mobile Applications & Financial Reporting | 7 | 43 |
