# Phase 1 — Sprint-wise Deliverables

**Timeline**: 18–22 weeks (15 sprints)  
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
| [Route, Supplier & Dealer Master Data](sprints/sprint-2/01-master-data-management/MDM-02-route-supplier-dealer.md) | MDM-02 | DFS-018 | Pending | 5 |
| [Vendor Master Data (Admin CRUD & Bulk Upload)](sprints/sprint-2/01-master-data-management/MDM-03-vendor-master-data.md) | MDM-03 | DFS-019 | Pending | 5 |
| [Vehicle Registration & Master Data](sprints/sprint-2/01-master-data-management/MDM-05-vehicle-master-data.md) | MDM-05 | DFS-021 | Pending | 5 |
| [Driver Master Data Management](sprints/sprint-2/01-master-data-management/MDM-06-driver-master-data.md) | MDM-06 | DFS-022 | Pending | 5 |
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

## Sprint 3 — Transfer Requisition, Transport Planning & Transport Orders

> Full breakdown (stories, sub-tasks, pending items): [sprints/sprint-3/](sprints/sprint-3/README.md)

### Epic: Transfer Requisition

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [Finished Goods (FG) Transfer Requisition](sprints/sprint-3/01-transfer-requisition/TR-01-fg-transfer-requisition.md) | TR-01 | DFS-032 | Pending | 5 |
| [Port Consignment / RM Transfer Requisition](sprints/sprint-3/01-transfer-requisition/TR-02-port-rm-transfer-requisition.md) | TR-02 | DFS-033 | Pending | 5 |
| [Stock & Capacity Validation](sprints/sprint-3/01-transfer-requisition/TR-03-stock-capacity-validation.md) | TR-03 | DFS-034 | Pending | 3 |
| [Distribution Approval Workflow (FG TR)](sprints/sprint-3/01-transfer-requisition/TR-04-distribution-approval.md) | TR-04 | DFS-035 | Pending | 5 |
| [Procurement Approval Workflow (Port / RM TR)](sprints/sprint-3/01-transfer-requisition/TR-05-procurement-approval.md) | TR-05 | DFS-036 | Pending | 5 |

### Epic: Transport Planning

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [TR Assessment by Transport Planner](sprints/sprint-3/02-transport-planning/TP-01-tr-assessment.md) | TP-01 | DFS-037 | Pending | 5 |
| [Fleet Availability & Transport Planning](sprints/sprint-3/02-transport-planning/TP-02-fleet-availability-planning.md) | TP-02 | DFS-038 | Pending | 5 |

### Epic: Transport Order

| Story | Task ID | Jira | Status | SP |
|-------|---------|------|--------|----|
| [TO Creation — Single & Multi-TO per TR](sprints/sprint-3/03-transport-order/TO-01-to-creation.md) | TO-01 | DFS-039 | Pending | 8 |
| [TO — Own Fleet Vehicle & Driver Assignment](sprints/sprint-3/03-transport-order/TO-02-to-own-fleet-assignment.md) | TO-02 | DFS-040 | Pending | 8 |
| [TO — Vendor Fleet Direct Assignment](sprints/sprint-3/03-transport-order/TO-03-vendor-direct-assignment.md) | TO-03 | DFS-041 | Pending | 5 |

| **Total** | | | | **49** |

---

## Sprint 4 — Trip Execution

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-020 | TO Execution — Own Fleet (Vehicle/Driver Assignment) | EPIC-009 | 8 |
| US-021 | Trip Lifecycle Management (12 States) | EPIC-009 | 13 |
| US-023 | Incident Management & Exception Handling | EPIC-009 | 5 |
| **Total** | | | **26** |

---

## Sprint 5 — Trip Closure & Vendor Onboarding

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-022 | Partial Delivery Handling | EPIC-009 | 5 |
| US-025 | Trip Closure with Proof of Delivery (POD) | EPIC-009 | 8 |
| US-026 | Real-time Map & Tracking Dashboard | EPIC-015 | 8 |
| US-027 | Vendor Registration & Verification Workflow | EPIC-010 | 8 |
| **Total** | | | **29** |

---

## Sprint 6 — Vendor Operations & QC Config

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-024 | Vendor Bidding Portal (Non-Contractual TOs) | EPIC-010 | 8 |
| US-028 | Vendor Performance Tracking & Metrics | EPIC-010 | 5 |
| US-029 | Vendor Payment Management | EPIC-010 | 8 |
| US-044 | QC Lab Testing Workflow | EPIC-014 | 5 |
| US-046 | QC Test Configuration & Checklist Management | EPIC-014 | 3 |
| **Total** | | | **29** |

---

## Sprint 7 — Vendor Portal & Gate Setup

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-030 | Vendor Fleet Management | EPIC-010 | 3 |
| US-031 | Vendor Portal (Self-Service) | EPIC-010 | 8 |
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | 8 |
| US-064 | On-Demand TO Creation — Dealer Entry | EPIC-011 | 8 |
| **Total** | | | **27** |

---

## Sprint 8 — Vendor Compliance & Weighing

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-032 | Vendor Rating & Reviews | EPIC-010 | 3 |
| US-033 | Vendor Contract Management | EPIC-010 | 5 |
| US-034 | Vendor Blacklist & Suspension | EPIC-010 | 3 |
| US-065 | On-Demand TO Creation — Supplier Entry | EPIC-011 | 8 |
| US-068 | Weight Entry (Scale-In) | EPIC-012 | 8 |
| US-069 | Queue Token Generation | EPIC-012 | 5 |
| **Total** | | | **32** |

---

## Sprint 9 — Gate Operations & QC Prep

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-035 | Gate-In at Source POI | EPIC-011 | 5 |
| US-036 | Gate-Out at Source POI | EPIC-011 | 3 |
| US-066 | Gate-Out Entry | EPIC-011 | 5 |
| US-067 | Remarks Logging | EPIC-011 | 3 |
| US-070 | Weight Exit (Scale-Out) | EPIC-012 | 8 |
| US-051 | QC Checklist Management (Visual Inspection) | EPIC-014 | 3 |
| **Total** | | | **27** |

---

## Sprint 10 — Destination Gate, Scaling & Loading

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-037 | Gate-In at Destination POI | EPIC-011 | 5 |
| US-038 | Gate-Out at Destination POI | EPIC-011 | 3 |
| US-039 | Scaling/Weighing at Source POI | EPIC-012 | 5 |
| US-040 | Scaling/Weighing at Destination POI | EPIC-012 | 5 |
| US-041 | Loading Operations Management | EPIC-013 | 5 |
| US-052 | Driver Mobile Interface | EPIC-016 | 8 |
| **Total** | | | **31** |

---

## Sprint 11 — Unloading & Command Center

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-042 | Unloading Operations Management | EPIC-013 | 5 |
| US-043 | Command Center Operations Monitoring | EPIC-009 | 8 |
| US-045 | QC Sample Collection | EPIC-014 | 5 |
| US-073 | Assignment Alert/Notification | EPIC-015 | 2 |
| US-074 | Assign Waiting Serial | EPIC-015 | 2 |
| **Total** | | | **22** |

---

## Sprint 12 — QC Sampling Workflow

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-075 | Load Start/End Time Entry | EPIC-013 | 3 |
| US-076 | Unload Start/End Time Entry | EPIC-013 | 3 |
| US-077 | Pre-QC Context Display | EPIC-014 | 3 |
| US-078 | Sample Creation | EPIC-014 | 5 |
| US-079 | Sample Labeling | EPIC-014 | 3 |
| US-080 | Exception Recording | EPIC-014 | 3 |
| US-081 | QC Context Display | EPIC-014 | 3 |
| US-082 | Sample Collection Event | EPIC-014 | 4 |
| US-083 | Configurable Form/Checklist for Sampling | EPIC-014 | 5 |
| US-084 | QR/Barcode Label | EPIC-014 | 3 |
| US-085 | Sampling Timestamp | EPIC-014 | 2 |
| **Total** | | | **37** |

---

## Sprint 13 — Lab Testing & QC Decisions

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-086 | Create Lab Request | EPIC-014 | 5 |
| US-087 | Lab Estimated Completion Time | EPIC-014 | 2 |
| US-088 | Lab Report Upload | EPIC-014 | 3 |
| US-089 | Lab Status Monitoring | EPIC-014 | 3 |
| US-048 | QC Report Generation | EPIC-014 | 3 |
| US-090 | QC Pass/Fail/Auto-Pass Tracking | EPIC-014 | 5 |
| US-091 | Escalation Workflow | EPIC-014 | 5 |
| US-049 | QC Rejection Workflow | EPIC-014 | 5 |
| **Total** | | | **31** |

---

## Sprint 14 — QC Compliance & Mobile Applications

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-050 | QC Dashboard & Analytics | EPIC-014 | 5 |
| US-053b | QC Certificate Management | EPIC-014 | 2 |
| US-054 | QC Audit Trail & History | EPIC-014 | 2 |
| US-055 | QC Vendor Quality Tracking | EPIC-014 | 3 |
| US-056 | QC Compliance & Regulatory Reporting | EPIC-014 | 3 |
| US-092 | Trip Management — Driver Interface | EPIC-016 | 8 |
| US-093 | QC Supervisor Mobile Interface | EPIC-016 | 8 |
| US-094 | Vendor Mobile Application Access | EPIC-017 | 8 |
| **Total** | | | **39** |

---

## Sprint 15 — Financial Management & Reporting

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-058 | Fuel Management & Tracking | EPIC-006 | 3 |
| US-059 | Trip Cost Calculation & Analysis | EPIC-018 | 5 |
| US-060 | Trip Profitability Analysis | EPIC-018 | 3 |
| **Total** | | | **11** |

---

## Summary

| Sprint Group | Sprints | Story Points |
|---|---|---|
| Foundation | Sprint 1–2 | ~182 SP |
| Transport Core | Sprint 3–5 | ~104 SP |
| Vendor & Gate | Sprint 6–9 | ~117 SP |
| Operations & QC | Sprint 10–13 | ~121 SP |
| Compliance & Mobile | Sprint 14–15 | ~50 SP |
| **Total** | **15 sprints** | **~574 SP** |

> ⚠️ Sprint 12 (37 SP) and Sprint 14 (39 SP) are heavier than the target — consider splitting if team velocity is < 35 SP/sprint.

---

**Last Updated**: 2026-04-03
**Phase**: Phase 1 — Core Foundation & Operational Enablement (MVP)
**Status**: In Progress — Sprint 1 done, Sprint 2–3 planned
