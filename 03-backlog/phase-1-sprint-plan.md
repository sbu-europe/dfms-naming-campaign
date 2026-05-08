# Phase 1 — Sprint-wise Deliverables

**Timeline**: 12–14 weeks (10 sprints)  
**Objective**: Deliver a fully usable DFMS platform covering end-to-end transport execution, gate operations, QC, vendor handling, and basic costing with secure multi-tenant access.

---

## Sprint 1 — Infrastructure, Onboarding & Secure Login

> Full breakdown (stories, sub-tasks, pending items, client feedback): [sprints/sprint-1/](sprints/sprint-1/README.md)

### Epic: System Foundation Infrastructure

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Local development environment — all services running with a single command](sprints/sprint-1/01-infra/INFRA-01-local-dev-environment.md) | DFS-001 | Done | 3 |
| [Isolated database per client — each organisation's data in a separate, secure schema](sprints/sprint-1/01-infra/INFRA-02-multi-tenant-schema-isolation.md) | DFS-002 | Done | 3 |
| [Background job processing — emails and async tasks run without blocking the web app](sprints/sprint-1/01-infra/INFRA-03-background-job-processing.md) | DFS-003 | Done | 3 |
| [Caching and session storage — fast, Redis-backed user session management](sprints/sprint-1/01-infra/INFRA-04-caching-session-storage.md) | DFS-004 | Done | 1 |
| [Production-ready setup — multi-environment config, deployment config, and onboarding docs](sprints/sprint-1/01-infra/INFRA-05-production-ready-setup.md) | DFS-005 | Done | 2 |
| **Subtotal** | | | **12** |

---

### Epic: Platform Admin Portal *(DFMS team — internal)*

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Custom-branded admin interface (DFMS design system, dark/light theme)](sprints/sprint-1/02-platform-admin-portal/PAP-01-custom-branded-admin-interface.md) | DFS-006 | Done | 5 |
| [Platform admin login (username & password)](sprints/sprint-1/02-platform-admin-portal/PAP-02-platform-admin-login.md) | DFS-007 | Done | 2 |
| [Platform admin 2FA — email OTP challenge](sprints/sprint-1/02-platform-admin-portal/PAP-03-platform-admin-2fa-otp.md) | DFS-008 | Done | 3 |
| [Platform admin dashboard showing key metrics](sprints/sprint-1/02-platform-admin-portal/PAP-04-platform-admin-dashboard.md) | DFS-009 | Done | 3 |
| [Tenant Onboarding — register a new client organisation](sprints/sprint-1/02-platform-admin-portal/PAP-05-tenant-onboarding.md) | DFS-010 | ~80% | 13 |
| [Tenant Management — view, update, and suspend client accounts](sprints/sprint-1/02-platform-admin-portal/PAP-06-tenant-management.md) | DFS-011 | Done | 3 |
| **Subtotal** | | | **29** |

**Pending under Tenant Onboarding**: [resend welcome email (DFS-010-12)](sprints/sprint-1/04-feedback/PAP-05-feedback.md), [tenant reactivation (DFS-010-13)](sprints/sprint-1/04-feedback/PAP-05-feedback.md).

---

### Epic: Client Portal *(for Nourish / end-client users)*

| Story | Jira | Status | SP |
|-------|------|--------|----|
| [Custom-branded interface](sprints/sprint-1/03-client-portal/CP-01-custom-branded-client-interface.md) | DFS-012 | Done | 3 |
| [Branded login page served on the client's domain](sprints/sprint-1/03-client-portal/CP-02-branded-login-page-on-tenant-domain.md) | DFS-013 | Done | 2 |
| [2FA — Email OTP (3-step secure login)](sprints/sprint-1/03-client-portal/CP-03-2fa-email-otp-login.md) | DFS-014 | Done | 8 |
| [Account activation flow for new users via invitation link](sprints/sprint-1/03-client-portal/CP-04-account-activation-invitation.md) | DFS-015 | ~70% | 5 |
| [Dashboard showing basic live operational metrics](sprints/sprint-1/03-client-portal/CP-05-tenant-dashboard.md) | DFS-016 | Done | 3 |
| **Subtotal** | | | **21** |

**Pending under Account activation**: [bulk invitation via CSV (DFS-015-12)](sprints/sprint-1/04-feedback/CP-04-feedback.md), [resend invitation (DFS-015-11)](sprints/sprint-1/04-feedback/CP-04-feedback.md).

---

| **Sprint 1 Total** | **~62 SP** |
|---|---|
| Done | ~52 SP |
| Pending | ~10 SP |

---

## Sprint 2 — Master Data, User Management & Vehicle Tracking

> Full breakdown (stories, sub-tasks, pending items): [sprints/sprint-2/](sprints/sprint-2/README.md)

### Epic: Master Data Management

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [POI Setup & Management](sprints/sprint-2/01-master-data-management/MDM-04-poi-management.md) | MDM-04 | DFS-020 | Pending | 8 |
| [Product Master Data Management (CRUD)](sprints/sprint-2/01-master-data-management/MDM-01-product-master-data.md) | MDM-01 | DFS-017 | Pending | 13 |
| [Route, Supplier & Dealer Master Data](sprints/sprint-2/README.md) | MDM-02 | DFS-018 | Pending | 5 |
| [Vendor Master Data (Admin CRUD & Bulk Upload)](sprints/sprint-2/01-master-data-management/MDM-03-vendor-master-data.md) | MDM-03 | DFS-019 | Pending | 5 |
| [Vehicle Registration & Master Data](sprints/sprint-2/01-master-data-management/MDM-05-vehicle-master-data.md) | MDM-05 | DFS-021 | Pending | 5 |
| [Driver Master Data Management](sprints/sprint-2/README.md) | MDM-06 | DFS-022 | Pending | 5 |
| [Helper Master Data Management](sprints/sprint-2/01-master-data-management/MDM-07-helper-master-data.md) | MDM-07 | DFS-023 | Pending | 3 |

### Epic: Tenant User Management

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [User Invitation & Activation](sprints/sprint-2/02-tenant-user-management/TUM-01-user-invitation-activation.md) | TUM-01 | DFS-024 | In Progress | 5 |
| [OTP Verification System](sprints/sprint-2/02-tenant-user-management/TUM-02-otp-verification.md) | TUM-02 | DFS-025 | Pending | 5 |
| [Account Deactivation & Reactivation](sprints/sprint-2/02-tenant-user-management/TUM-03-account-deactivation-reactivation.md) | TUM-03 | DFS-026 | Pending | 5 |
| [Password & Account Reset](sprints/sprint-2/02-tenant-user-management/TUM-04-password-account-reset.md) | TUM-04 | DFS-027 | Pending | 5 |
| [User Activity & Audit Logs](sprints/sprint-2/02-tenant-user-management/TUM-05-user-activity-audit-logs.md) | TUM-05 | DFS-028 | Pending | 8 |

### Epic: Vehicle Tracking & Geofencing

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Geofencing Engine — Arrival & Departure Detection](sprints/sprint-2/03-vehicle-tracking-geofencing/VTG-01-geofencing-arrival-departure.md) | VTG-01 | DFS-031 | Pending | 8 |

| **Total** | | | | **83** |

---

## Sprint 3 — Product Requisition, Transport Requests & Transport Orders

> Full breakdown (stories, sub-tasks, pending items): [sprints/sprint-3/](sprints/sprint-3/README.md)

### Epic: Requisition (Finished Goods)

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [FG Product Requisition](sprints/sprint-3/01-requisition/PR-01-fg-product-requisition.md) | PR-01 | DFS-032 | Pending | 5 |

### Epic: Port Shipments

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Port Shipment (Import) Registration](sprints/sprint-3/02-port-shipments/PR-02-port-shipment.md) | PR-02 | DFS-033 | Pending | 5 |
| [Port Shipments — org-wide list & detail (Procurement role)](sprints/sprint-3/04-procurement/PC-01-rm-product-requisitions.md) | PC-01 | DFS-036 | Pending | 2 |

### Epic: Distribution

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Distribution — FG Product Requisitions View](sprints/sprint-3/03-distribution/DR-01-fg-product-requisitions.md) | DR-01 | DFS-034 | Pending | 2 |
| [Distribution — Transport Request Creation & Manager Approval](sprints/sprint-3/03-distribution/DR-02-transport-requests.md) | DR-02 | DFS-035 | Pending | 8 |

### Epic: Procurement

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Procurement — Transport Request Creation](sprints/sprint-3/04-procurement/PC-02-transport-requests.md) | PC-02 | DFS-037 | Pending | 6 |

### Epic: Transport

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Transport Requests Queue (FG & Port Consignment)](sprints/sprint-3/05-transport/01-transport-requests-queue.md) | TRQ-01 | DFS-038 | Pending | 3 |
| [Transport Order Creation](sprints/sprint-3/05-transport/02-transport-orders.md) | TO-01 | DFS-039 | Pending | 8 |
| [TDO Vehicle, Driver, Helper & ETA Assignment](sprints/sprint-3/05-transport/03-tdo-assignment.md) | TO-02 | DFS-040 | Pending | 8 |

### Epic: QA & Testing

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Automated Test Suite — Sprint 1 & 2 Features](sprints/sprint-3/06-qa-testing/QA-01-automated-test-suite-sprint-1-2.md) | QA-01 | DFS-041 | Pending | 13 |

### Epic: DevOps & Infrastructure

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [AWS Dev Environment — Up & Running](sprints/sprint-3/07-devops/DEVOPS-01-aws-dev-environment.md) | DEVOPS-01 | DFS-042 | Pending | 8 |

| **Total** | | | | **68** |

---

## Sprint 4 — Own-Fleet Yard & Field Execution

> Full breakdown (stories, sub-tasks, PRD traceability, build order): [sprints/sprint-4/](sprints/sprint-4/README.md)  
> **Sprint 3** delivers TO + assignment; **TDO** may set **`Ready for Dispatch`** → TO is **visible to assigned driver**. **Sprint 4** is **TO-centric** (no separate Trip backlog): **Driver Supervisor**, **driver mobile** (milestones & POD — **no map/GPS backlog**), **gate**, **scaling**, **command center**, **loading/unloading points per POI**, **§6.8.5 execution + yard + closure substates** (TLS-01), **POD closure** (**no §6.8.8 costing** in this sprint). **QA/E2E story** omitted until backlog finalized. **Own fleet**; vendor portal out of scope.

### Epic: Driver Supervisor & Crew

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Vehicle licence, health & handover checklists](sprints/sprint-4/01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md) | DS-01 | DFS-050 | Pending | 5 |
| [Driver state, attendance & leave (supervisor)](sprints/sprint-4/01-driver-supervisor/DS-02-driver-state-attendance-leave.md) | DS-02 | DFS-051 | Pending | 5 |

### Epic: Driver Mobile

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [TO list, execution milestones & POD](sprints/sprint-4/README.md) | DM-01 | DFS-053 | Pending | 8 |

### Epic: Gate

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Gate-in, gate-out & remarks](sprints/sprint-4/04-gate/GT-01-gate-in-out-remarks.md) | GT-01 | DFS-054 | Pending | 8 |
| [On-demand TO creation — Dealer DO & Supplier PO](sprints/sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md) | GT-02 | DFS-062 | Pending | 8 |

### Epic: Scaling

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Scale-in, queue token & scale-out](sprints/sprint-4/05-scaling/SC-01-scale-in-out-queue-token.md) | SC-01 | DFS-055 | Pending | 8 |

### Epic: Command Center & Load / Unload

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Loading & unloading points — per POI](sprints/sprint-4/06-command-center-loading/LUP-01-loading-unloading-points-per-poi.md) | LUP-01 | DFS-063 | Pending | 5 |
| [Queue monitoring, bay assignment & waiting serial](sprints/sprint-4/06-command-center-loading/CC-01-queue-assign-serial.md) | CC-01 | DFS-056 | Pending | 8 |
| [Load / unload start–end capture (E2E)](sprints/sprint-4/06-command-center-loading/LD-01-load-unload-timestamps.md) | LD-01 | DFS-057 | Pending | 5 |

### Epic: Lifecycle & POD

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [TO lifecycle — execution, yard & closure substates](sprints/sprint-4/07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md) | TLS-01 | DFS-059 | Pending | 13 |
| [TO closure — POD & gate-out linkage](sprints/sprint-4/07-visibility-lifecycle-pod/POD-01-to-closure-pod-gate-out-linkage.md) | POD-01 | DFS-060 | Pending | 5 |

| **Total** | | | | **78** |

---

## Sprint 5 — Vendor Management

> **Theme**: Full vendor lifecycle — onboarding, bidding, portal, fleet, compliance, performance, and payment.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-027 | Vendor Registration & Verification Workflow | EPIC-010 | 8 |
| US-024 | Vendor Bidding Portal (Non-Contractual TOs) | EPIC-010 | 8 |
| US-030 | Vendor Fleet Management | EPIC-010 | 3 |
| US-031 | Vendor Portal (Self-Service) | EPIC-010 | 8 |
| US-028 | Vendor Performance Tracking & Metrics | EPIC-010 | 5 |
| US-029 | Vendor Payment Management | EPIC-010 | 8 |
| US-032 | Vendor Rating & Reviews | EPIC-010 | 3 |
| US-033 | Vendor Contract Management | EPIC-010 | 5 |
| US-034 | Vendor Blacklist & Suspension | EPIC-010 | 3 |
| **Total** | | | **51** |

---

## Sprint 6 — Gate Management & Weighing

> **Theme**: Full gate operations at source and destination — vehicle check-in/out, on-demand TOs, scale-in/out, queue management.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | 8 |
| US-064 | On-Demand TO Creation — Dealer Entry | EPIC-011 | 8 |
| US-065 | On-Demand TO Creation — Supplier Entry | EPIC-011 | 8 |
| US-035 | Gate-In at Source POI | EPIC-011 | 5 |
| US-036 | Gate-Out at Source POI | EPIC-011 | 3 |
| US-066 | Gate-Out Entry | EPIC-011 | 5 |
| US-067 | Remarks Logging | EPIC-011 | 3 |
| US-068 | Weight Entry (Scale-In) | EPIC-012 | 8 |
| US-069 | Queue Token Generation | EPIC-012 | 5 |
| US-070 | Weight Exit (Scale-Out) | EPIC-012 | 8 |
| **Total** | | | **61** |

---

## Sprint 7 — Destination Operations & Loading/Unloading

> **Theme**: Destination gate, scaling, loading/unloading operations, command center monitoring, and dispatch management.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-037 | Gate-In at Destination POI | EPIC-011 | 5 |
| US-038 | Gate-Out at Destination POI | EPIC-011 | 3 |
| US-039 | Scaling/Weighing at Source POI | EPIC-012 | 5 |
| US-040 | Scaling/Weighing at Destination POI | EPIC-012 | 5 |
| US-041 | Loading Operations Management | EPIC-013 | 5 |
| US-042 | Unloading Operations Management | EPIC-013 | 5 |
| US-075 | Load Start/End Time Entry | EPIC-013 | 3 |
| US-076 | Unload Start/End Time Entry | EPIC-013 | 3 |
| US-073 | Assignment Alert/Notification | EPIC-015 | 2 |
| US-074 | Assign Waiting Serial | EPIC-015 | 2 |
| US-043 | Command Center Operations Monitoring | EPIC-009 | 8 |
| **Total** | | | **46** |

---

## Sprint 8 — QC Sampling & Lab Workflow

> **Theme**: Complete QC workflow — configuration, sample collection, lab requests, test results, and pass/fail decisions.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-051 | QC Checklist Management (Visual Inspection) | EPIC-014 | 3 |
| US-046 | QC Test Configuration & Checklist Management | EPIC-014 | 3 |
| US-044 | QC Lab Testing Workflow | EPIC-014 | 5 |
| US-045 | QC Sample Collection | EPIC-014 | 5 |
| US-077 | Pre-QC Context Display | EPIC-014 | 3 |
| US-078 | Sample Creation | EPIC-014 | 5 |
| US-079 | Sample Labeling | EPIC-014 | 3 |
| US-083 | Configurable Form/Checklist for Sampling | EPIC-014 | 5 |
| US-084 | QR/Barcode Label | EPIC-014 | 3 |
| US-080 | Exception Recording | EPIC-014 | 3 |
| US-081 | QC Context Display | EPIC-014 | 3 |
| US-082 | Sample Collection Event | EPIC-014 | 4 |
| US-085 | Sampling Timestamp | EPIC-014 | 2 |
| **Total** | | | **47** |

---

## Sprint 9 — QC Lab Results, Decisions & Compliance

> **Theme**: Lab result processing, QC pass/fail decisions, rejection workflow, audit, compliance reporting, and QC dashboard.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-086 | Create Lab Request | EPIC-014 | 5 |
| US-087 | Lab Estimated Completion Time | EPIC-014 | 2 |
| US-088 | Lab Report Upload | EPIC-014 | 3 |
| US-089 | Lab Status Monitoring | EPIC-014 | 3 |
| US-090 | QC Pass/Fail/Auto-Pass Tracking | EPIC-014 | 5 |
| US-091 | Escalation Workflow | EPIC-014 | 5 |
| US-049 | QC Rejection Workflow | EPIC-014 | 5 |
| US-048 | QC Report Generation | EPIC-014 | 3 |
| US-050 | QC Dashboard & Analytics | EPIC-014 | 5 |
| US-053b | QC Certificate Management | EPIC-014 | 2 |
| US-054 | QC Audit Trail & History | EPIC-014 | 2 |
| US-055 | QC Vendor Quality Tracking | EPIC-014 | 3 |
| US-056 | QC Compliance & Regulatory Reporting | EPIC-014 | 3 |
| **Total** | | | **46** |

---

## Sprint 10 — Mobile Applications & Financial Reporting

> **Theme**: Mobile interfaces for driver, QC supervisor, and vendor — plus trip costing, profitability, and fuel management.

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-052 | Driver Mobile Interface | EPIC-016 | 8 |
| US-092 | Trip Management — Driver Interface | EPIC-016 | 8 |
| US-093 | QC Supervisor Mobile Interface | EPIC-016 | 8 |
| US-094 | Vendor Mobile Application Access | EPIC-017 | 8 |
| US-058 | Fuel Management & Tracking | EPIC-006 | 3 |
| US-059 | Trip Cost Calculation & Analysis | EPIC-018 | 5 |
| US-060 | Trip Profitability Analysis | EPIC-018 | 3 |
| **Total** | | | **43** |

---

## Summary

| Sprint | Title | SP |
|--------|-------|----|
| Sprint 1 | Infrastructure, Onboarding & Secure Login | ~62 |
| Sprint 2 | Master Data, User Management & Vehicle Tracking | 83 |
| Sprint 3 | Transfer Requisition, Transport Planning & Transport Orders | 49 |
| Sprint 4 | TO execution, yard & closure (no map / costing / QA ticket) | 78 |
| Sprint 5 | Vendor Management | 51 |
| Sprint 6 | Gate Management & Weighing | 61 |
| Sprint 7 | Destination Operations & Loading/Unloading | 46 |
| Sprint 8 | QC Sampling & Lab Workflow | 47 |
| Sprint 9 | QC Lab Results, Decisions & Compliance | 46 |
| Sprint 10 | Mobile Applications & Financial Reporting | 43 |
| **Total** | **10 sprints** | **~569 SP** |

> ⚠️ **Sprint 5 (51 SP)** and **Sprint 6 (61 SP)** are above the typical 45 SP target.
> - Sprint 5 can be split: Vendor Onboarding + Bidding (Sprint 5a) / Portal + Compliance (Sprint 5b) if needed
> - Sprint 6 can be split: Gate Source + On-demand TOs (Sprint 6a) / Weighing + Gate Dest (Sprint 6b) if needed

---

**Last Updated**: 2026-04-03
**Phase**: Phase 1 — Core Foundation & Operational Enablement (MVP)
**Status**: In Progress — Sprint 1 done, Sprint 2–3 planned
