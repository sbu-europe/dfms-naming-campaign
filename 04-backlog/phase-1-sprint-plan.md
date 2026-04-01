# Phase 1 — Sprint-wise Deliverables

**Timeline**: 22–26 weeks (17 sprints)  
**Objective**: Deliver a fully usable DFMS platform covering end-to-end transport execution, gate operations, QC, vendor handling, and basic costing with secure multi-tenant access.

---

## Sprint 1 — Infrastructure, Onboarding & Secure Login

> Full task breakdown: [sprint1/](sprint1/README.md)

### Epic: System Foundation Infrastructure

| Story | Status | SP |
|-------|--------|----|
| [Local development environment — all services running with a single command](sprint1/INFRA-01-local-dev-environment.md) | Done | 3 |
| [Isolated database per client — each organisation's data in a separate, secure schema](sprint1/INFRA-02-multi-tenant-schema-isolation.md) | Done | 3 |
| [Background job processing — emails and async tasks run without blocking the web app](sprint1/INFRA-03-background-job-processing.md) | Done | 3 |
| [Caching and session storage — fast, Redis-backed user session management](sprint1/INFRA-04-caching-session-storage.md) | Done | 1 |
| [Production-ready setup — multi-environment config, deployment config, and onboarding docs](sprint1/INFRA-05-production-ready-setup.md) | Done | 2 |
| **Subtotal** | | **12** |

---

### Epic: Platform Admin Portal *(DFMS team — internal)*

| Story | Status | SP |
|-------|--------|----|
| [Custom-branded admin interface (DFMS design system, dark/light theme)](sprint1/PAP-01-custom-branded-admin-interface.md) | Done | 5 |
| [Platform admin login (username & password)](sprint1/PAP-02-platform-admin-login.md) | Done | 2 |
| [Platform admin 2FA — email OTP challenge](sprint1/PAP-03-platform-admin-2fa-otp.md) | Done | 3 |
| [Platform admin dashboard showing key metrics](sprint1/PAP-04-platform-admin-dashboard.md) | Done | 3 |
| [Tenant Onboarding — register a new client organisation](sprint1/PAP-05-tenant-onboarding.md) | ~80% | 13 |
| [Tenant Management — view, update, and suspend client accounts](sprint1/PAP-06-tenant-management.md) | Done | 3 |
| **Subtotal** | | **29** |

**Pending under Tenant Onboarding**: resend welcome email, tenant reactivation after suspension.

---

### Epic: Client Portal *(for Nourish / end-client users)*

| Story | Status | SP |
|-------|--------|----|
| [Custom-branded interface](sprint1/CP-01-custom-branded-client-interface.md) | Done | 3 |
| [Branded login page served on the client's domain](sprint1/CP-02-branded-login-page-on-tenant-domain.md) | Done | 2 |
| [2FA — Email OTP (3-step secure login)](sprint1/CP-03-2fa-email-otp-login.md) | Done | 8 |
| [Account activation flow for new users via invitation link](sprint1/CP-04-account-activation-invitation.md) | ~70% | 5 |
| [Dashboard showing basic live operational metrics](sprint1/CP-05-tenant-dashboard.md) | Done | 3 |
| **Subtotal** | | **21** |

**Pending under Account activation**: bulk invitation via file upload, resend invitation.

---

| **Sprint 1 Total** | **~62 SP** |
|---|---|
| Done | ~52 SP |
| Pending | ~10 SP |

---

## Sprint 2 — Master Data, User Management & POI

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-095 | Product Master Data Management (CRUD) | EPIC-005 | 13 |
| US-096 | Route, Supplier & Dealer Master Data | EPIC-003 | 5 |
| US-047 | Vendor Master Data (Admin CRUD & Bulk Upload) | EPIC-006 | 5 |
| US-053 | Vehicle Master Data Management | EPIC-006 | 5 |
| US-057 | Driver Master Data Management | EPIC-006 | 5 |
| US-061 | Helper Master Data Management | EPIC-006 | 3 |
| US-005 | User Invitation & Activation | EPIC-002 | 8 |
| US-006 | OTP Verification System | EPIC-002 | 5 |
| US-007 | Account Deactivation & Reactivation | EPIC-002 | 5 |
| US-008 | Password & Account Reset | EPIC-002 | 5 |
| US-009 | User Activity & Audit Logs | EPIC-002 | 8 |
| US-097 | POI Management & Geofencing | EPIC-004 | 13 |
| **Total** | | | **80** |

---

## Sprint 3 — Requisition & Fleet Planning

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-062 | Helper Assignment to Trips | EPIC-006 | 5 |
| US-010 | Create Port Consignment Transfer Requisition (TR) | EPIC-007 | 5 |
| US-013 | Stock Validation (Source & Destination) | EPIC-007 | 3 |
| US-014 | Capacity Checking & Warnings | EPIC-007 | 3 |
| US-011 | Distribution Approval Workflow (FG TR) | EPIC-008 | 5 |
| US-012 | Procurement Approval Workflow (Port TR) | EPIC-008 | 5 |
| US-016 | Fleet Availability Validation | EPIC-009 | 3 |
| **Total** | | | **29** |

---

## Sprint 4 — Transport Order Creation

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-015 | TR Assessment by Transport Planner | EPIC-009 | 5 |
| US-017 | TO Creation — Multiple TOs per TR | EPIC-009 | 8 |
| US-018 | TO Creation by Transport Planner | EPIC-009 | 8 |
| US-019 | TO Execution — Vendor Fleet (Direct Assignment) | EPIC-009 | 5 |
| **Total** | | | **26** |

---

## Sprint 5 — Trip Execution

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-020 | TO Execution — Own Fleet (Vehicle/Driver Assignment) | EPIC-009 | 8 |
| US-021 | Trip Lifecycle Management (12 States) | EPIC-009 | 13 |
| US-023 | Incident Management & Exception Handling | EPIC-009 | 5 |
| **Total** | | | **26** |

---

## Sprint 6 — Trip Closure & Vendor Onboarding

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-022 | Partial Delivery Handling | EPIC-009 | 5 |
| US-025 | Trip Closure with Proof of Delivery (POD) | EPIC-009 | 8 |
| US-026 | Real-time Map & Tracking Dashboard | EPIC-015 | 8 |
| US-027 | Vendor Registration & Verification Workflow | EPIC-010 | 8 |
| **Total** | | | **29** |

---

## Sprint 7 — Vendor Operations & QC Config

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-024 | Vendor Bidding Portal (Non-Contractual TOs) | EPIC-010 | 8 |
| US-028 | Vendor Performance Tracking & Metrics | EPIC-010 | 5 |
| US-029 | Vendor Payment Management | EPIC-010 | 8 |
| US-044 | QC Lab Testing Workflow | EPIC-014 | 5 |
| US-046 | QC Test Configuration & Checklist Management | EPIC-014 | 3 |
| **Total** | | | **29** |

---

## Sprint 8 — Vendor Portal & Gate Setup

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-030 | Vendor Fleet Management | EPIC-010 | 3 |
| US-031 | Vendor Portal (Self-Service) | EPIC-010 | 8 |
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | 8 |
| US-064 | On-Demand TO Creation — Dealer Entry | EPIC-011 | 8 |
| **Total** | | | **27** |

---

## Sprint 9 — Vendor Compliance & Weighing

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

## Sprint 10 — Gate Operations & QC Prep

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

## Sprint 11 — Destination Gate, Scaling & Loading

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

## Sprint 12 — Unloading & Command Center

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-042 | Unloading Operations Management | EPIC-013 | 5 |
| US-043 | Command Center Operations Monitoring | EPIC-009 | 8 |
| US-045 | QC Sample Collection | EPIC-014 | 5 |
| US-073 | Assignment Alert/Notification | EPIC-015 | 2 |
| US-074 | Assign Waiting Serial | EPIC-015 | 2 |
| **Total** | | | **22** |

---

## Sprint 13 — QC Sampling Workflow

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
| US-085 | Sampling Timestamp | EPIC-014 | 2 |
| **Total** | | | **29** |

---

## Sprint 14 — Lab Testing

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-083 | Configurable Form/Checklist for Sampling | EPIC-014 | 5 |
| US-084 | QR/Barcode Label | EPIC-014 | 3 |
| US-086 | Create Lab Request | EPIC-014 | 5 |
| US-087 | Lab Estimated Completion Time | EPIC-014 | 2 |
| US-088 | Lab Report Upload | EPIC-014 | 3 |
| US-089 | Lab Status Monitoring | EPIC-014 | 3 |
| US-048 | QC Report Generation | EPIC-014 | 3 |
| **Total** | | | **24** |

---

## Sprint 15 — QC Decisions & Compliance

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-090 | QC Pass/Fail/Auto-Pass Tracking | EPIC-014 | 5 |
| US-091 | Escalation Workflow | EPIC-014 | 5 |
| US-049 | QC Rejection Workflow | EPIC-014 | 5 |
| US-050 | QC Dashboard & Analytics | EPIC-014 | 5 |
| US-053b | QC Certificate Management | EPIC-014 | 2 |
| US-054 | QC Audit Trail & History | EPIC-014 | 2 |
| US-055 | QC Vendor Quality Tracking | EPIC-014 | 3 |
| **Total** | | | **27** |

---

## Sprint 16 — Mobile Applications

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-092 | Trip Management — Driver Interface | EPIC-016 | 8 |
| US-093 | QC Supervisor Mobile Interface | EPIC-016 | 8 |
| US-094 | Vendor Mobile Application Access | EPIC-017 | 8 |
| **Total** | | | **24** |

---

## Sprint 17 — Financial Management & Reporting

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-058 | Fuel Management & Tracking | EPIC-006 | 3 |
| US-059 | Trip Cost Calculation & Analysis | EPIC-018 | 5 |
| US-060 | Trip Profitability Analysis | EPIC-018 | 3 |
| US-056 | QC Compliance & Regulatory Reporting | EPIC-014 | 3 |
| **Total** | | | **14** |

---

## Summary

| Sprint Group | Sprints | Stories | Story Points |
|---|---|---|---|
| Foundation | Sprint 1–2 | 22 | 133 |
| Transport Core | Sprint 3–6 | 18 | 110 |
| Vendor & Weighing | Sprint 7–9 | 15 | 88 |
| Gate & Operations | Sprint 10–12 | 17 | 80 |
| QC Workflow | Sprint 13–15 | 23 | 80 |
| Mobile & Finance | Sprint 16–17 | 7 | 38 |
| **Total** | **17 sprints** | **102** | **529** |

---

**Last Updated**: 2026-03-31
**Phase**: Phase 1 — Core Foundation & Operational Enablement (MVP)
**Status**: In Progress — Sprint 1 ~70% complete
