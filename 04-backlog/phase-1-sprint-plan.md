# Phase 1 — Sprint-wise Deliverables

**Timeline**: 24–28 weeks (18 sprints)  
**Objective**: Deliver a fully usable DFMS platform covering end-to-end transport execution, gate operations, QC, vendor handling, and basic costing with secure multi-tenant access.

---

## Sprint 1 — Platform Security Foundation

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-001 | User Login & Account Lockout | EPIC-001 | 10 |
| US-002 | Multi-Factor Authentication (2FA) | EPIC-001 | 10 |
| US-003 | Session Control & Management | EPIC-001 | 10 |
| US-004 | Role Hierarchy & Permission Management | EPIC-001 | 10 |
| **Total** | | | **40** |

---

## Sprint 2 — Master Data Foundation

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-095 | Product Master Data Management (CRUD) | EPIC-005 | 13 |
| US-096 | Route, Supplier & Dealer Master Data | EPIC-003 | 5 |
| US-047 | Vendor Master Data (Admin CRUD & Bulk Upload) | EPIC-006 | 5 |
| US-053 | Vehicle Master Data Management | EPIC-006 | 5 |
| US-057 | Driver Master Data Management | EPIC-006 | 5 |
| US-061 | Helper Master Data Management | EPIC-006 | 3 |
| **Total** | | | **36** |

---

## Sprint 3 — User Management & POI

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-005 | User Invitation & Activation | EPIC-002 | 8 |
| US-006 | OTP Verification System | EPIC-002 | 5 |
| US-007 | Account Deactivation & Reactivation | EPIC-002 | 5 |
| US-008 | Password & Account Reset | EPIC-002 | 5 |
| US-009 | User Activity & Audit Logs | EPIC-002 | 8 |
| US-097 | POI Management & Geofencing | EPIC-004 | 13 |
| **Total** | | | **44** |

---

## Sprint 4 — Requisition & Fleet Planning

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

## Sprint 5 — Transport Order Creation

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-015 | TR Assessment by Transport Planner | EPIC-009 | 5 |
| US-017 | TO Creation — Multiple TOs per TR | EPIC-009 | 8 |
| US-018 | TO Creation by Transport Planner | EPIC-009 | 8 |
| US-019 | TO Execution — Vendor Fleet (Direct Assignment) | EPIC-009 | 5 |
| **Total** | | | **26** |

---

## Sprint 6 — Trip Execution

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-020 | TO Execution — Own Fleet (Vehicle/Driver Assignment) | EPIC-009 | 8 |
| US-021 | Trip Lifecycle Management (12 States) | EPIC-009 | 13 |
| US-023 | Incident Management & Exception Handling | EPIC-009 | 5 |
| **Total** | | | **26** |

---

## Sprint 7 — Trip Closure & Vendor Onboarding

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-022 | Partial Delivery Handling | EPIC-009 | 5 |
| US-025 | Trip Closure with Proof of Delivery (POD) | EPIC-009 | 8 |
| US-026 | Real-time Map & Tracking Dashboard | EPIC-015 | 8 |
| US-027 | Vendor Registration & Verification Workflow | EPIC-010 | 8 |
| **Total** | | | **29** |

---

## Sprint 8 — Vendor Operations & QC Config

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-024 | Vendor Bidding Portal (Non-Contractual TOs) | EPIC-010 | 8 |
| US-028 | Vendor Performance Tracking & Metrics | EPIC-010 | 5 |
| US-029 | Vendor Payment Management | EPIC-010 | 8 |
| US-044 | QC Lab Testing Workflow | EPIC-014 | 5 |
| US-046 | QC Test Configuration & Checklist Management | EPIC-014 | 3 |
| **Total** | | | **29** |

---

## Sprint 9 — Vendor Portal & Gate Setup

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-030 | Vendor Fleet Management | EPIC-010 | 3 |
| US-031 | Vendor Portal (Self-Service) | EPIC-010 | 8 |
| US-063 | Gate-in TO/Challan Lookup | EPIC-011 | 8 |
| US-064 | On-Demand TO Creation — Dealer Entry | EPIC-011 | 8 |
| **Total** | | | **27** |

---

## Sprint 10 — Vendor Compliance & Weighing

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

## Sprint 11 — Gate Operations & QC Prep

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

## Sprint 12 — Destination Gate, Scaling & Loading

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

## Sprint 13 — Unloading & Command Center

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-042 | Unloading Operations Management | EPIC-013 | 5 |
| US-043 | Command Center Operations Monitoring | EPIC-009 | 8 |
| US-045 | QC Sample Collection | EPIC-014 | 5 |
| US-073 | Assignment Alert/Notification | EPIC-015 | 2 |
| US-074 | Assign Waiting Serial | EPIC-015 | 2 |
| **Total** | | | **22** |

---

## Sprint 14 — QC Sampling Workflow

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

## Sprint 15 — Lab Testing

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

## Sprint 16 — QC Decisions & Compliance

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

## Sprint 17 — Mobile Applications

| Story | Title | Epic | SP |
|-------|-------|------|----|
| US-092 | Trip Management — Driver Interface | EPIC-016 | 8 |
| US-093 | QC Supervisor Mobile Interface | EPIC-016 | 8 |
| US-094 | Vendor Mobile Application Access | EPIC-017 | 8 |
| **Total** | | | **24** |

---

## Sprint 18 — Financial Management & Reporting

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
| Foundation | Sprint 1–3 | 21 | 120 |
| Transport Core | Sprint 4–7 | 18 | 110 |
| Vendor & Weighing | Sprint 8–10 | 15 | 88 |
| Gate & Operations | Sprint 11–13 | 17 | 80 |
| QC Workflow | Sprint 14–16 | 23 | 80 |
| Mobile & Finance | Sprint 17–18 | 7 | 38 |
| **Total** | **18 sprints** | **101** | **516** |

---

**Last Updated**: 2026-03-06  
**Phase**: Phase 1 — Core Foundation & Operational Enablement (MVP)  
**Status**: Planning
