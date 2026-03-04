# Epic-Wise Story List - All 94 Stories

> **Complete mapping of 94 unique story IDs to 17 epics**

**Last Updated**: February 27, 2026  
**Total Epics**: 17  
**Total Stories**: 94 unique IDs (97 files including variants/duplicates)

---

## Quick Navigation

- [EPIC-001: System Foundation](#epic-001-system-foundation) (4 stories)
- [EPIC-002: User & Tenant Foundation](#epic-002-user--tenant-foundation) (5 stories)
- [EPIC-003: Master Data & Configuration](#epic-003-master-data--configuration) (4 stories)
- [EPIC-004: POI Management & Geofencing](#epic-004-poi-management--geofencing) (8 stories)
- [EPIC-005: Product Inventory Management (PIM)](#epic-005-product-inventory-management-pim) (3 stories)
- [EPIC-006: Fleet & Vehicle Management](#epic-006-fleet--vehicle-management) (11 stories)
- [EPIC-007: Product Transfer Requisition Management](#epic-007-product-transfer-requisition-management) (4 stories)
- [EPIC-008: Distribution & Procurement Management](#epic-008-distribution--procurement-management) (5 stories)
- [EPIC-009: Transport Order (TO) Management](#epic-009-transport-order-to-management) (12 stories)
- [EPIC-010: Vendor Management](#epic-010-vendor-management) (6 stories)
- [EPIC-011: Gate Management](#epic-011-gate-management) (5 stories)
- [EPIC-012: Scaling / Weight Management](#epic-012-scaling--weight-management) (3 stories)
- [EPIC-013: Loading & Unloading Operations](#epic-013-loading--unloading-operations) (4 stories)
- [EPIC-014: Quality Control & Quality Assurance](#epic-014-quality-control--quality-assurance) (14 stories)
- [EPIC-015: Command Center Operations](#epic-015-command-center-operations) (2 stories)
- [EPIC-016: Mobile Interface (Driver & QC)](#epic-016-mobile-interface-driver--qc) (2 stories)
- [EPIC-017: Mobile Applications (Vendor)](#epic-017-mobile-applications-vendor) (2 stories)

---

## EPIC-001: System Foundation
**4 stories** | Phase 1 | Critical Priority

Core authentication, security, and session management.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-001 | User Login & Account Lockout | Phase 1 | [Link](../../02-stories/US-001-user-login-account-lockout.md) |
| US-002 | Multi-Factor Auth (2FA) | Phase 1 | [Link](../../02-stories/US-002-multi-factor-auth.md) |
| US-003 | Session Control | Phase 1 | [Link](../../02-stories/US-003-session-control.md) |
| US-004 | Role Hierarchy | Phase 1 | [Link](../../02-stories/US-004-role-hierarchy.md) |

---

## EPIC-002: User & Tenant Foundation
**5 stories** | Phase 1 | Critical Priority

User lifecycle management, tenant setup, and audit logging.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-005 | User Invitation & Activation | Phase 1 | [Link](../../02-stories/US-005-user-invitation-activation.md) |
| US-006 | OTP Verification System | Phase 1 | [Link](../../02-stories/US-006-otp-verification.md) |
| US-007 | Account Deactivation | Phase 1 | [Link](../../02-stories/US-007-account-deactivation.md) |
| US-008 | Password & Account Reset | Phase 1 | [Link](../../02-stories/US-008-password-account-reset.md) |
| US-009 | User Activity & Audit Logs | Phase 1 | [Link](../../02-stories/US-009-user-activity-audit-logs.md) |

---

## EPIC-003: Master Data & Configuration
**4 stories** | Phase 1 | Critical Priority

Core master data setup for operations (TR, stock, capacity).

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-010 | Create Port Consignment Transfer Requisition (TR) | Phase 1 | [Link](../../02-stories/US-010-port-transfer-requisition.md) |
| US-011 | Distribution Approval Workflow (FG TR) | Phase 1 | [Link](../../02-stories/US-011-distribution-approval.md) |
| US-012 | Procurement Approval Workflow (Port TR) | Phase 1 | [Link](../../02-stories/US-012-procurement-approval.md) |
| US-013 | Stock Validation (Source & Destination) | Phase 1 | [Link](../../02-stories/US-013-stock-validation.md) |

---

## EPIC-004: POI Management & Geofencing
**8 stories** | Phase 1 | Critical Priority

POI setup, geofencing, capacity checking, and transport planning.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-014 | Capacity Checking and Warnings | Phase 1 | [Link](../../02-stories/US-014-capacity-checking.md) |
| US-015 | Transport Requisition (TR) Assessment by Transport Planner | Phase 1 | [Link](../../02-stories/US-015-tr-assessment.md) |
| US-016 | Fleet Availability Validation | Phase 1 | [Link](../../02-stories/US-016-fleet-availability.md) |
| US-017 | Transport Order (TO) Creation - Multiple TOs per TR | Phase 1 | [Link](../../02-stories/US-017-to-creation-multiple.md) |
| US-018 | Transport Order (TO) Creation by Transport Planner | Phase 1 | [Link](../../02-stories/US-018-to-creation-transport-planner.md) |
| US-019 | TO Execution - Vendor Fleet (Direct Assignment) | Phase 1 | [Link](../../02-stories/US-019-to-execution-vendor-direct.md) |
| US-020 | TO Execution - Own Fleet (Vehicle/Driver Assignment) | Phase 1 | [Link](../../02-stories/US-020-to-execution-own-fleet.md) |
| US-021 | Trip Lifecycle Management (12 States, Sub-states) | Phase 1 | [Link](../../02-stories/US-021-trip-lifecycle.md) |

---

## EPIC-005: Product Inventory Management (PIM)
**3 stories** | Phase 1 | High Priority

Product transfer, vendor bidding, and delivery workflows.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-022 | Partial Delivery Handling | Phase 1 | [Link](../../02-stories/US-022-partial-delivery.md) |
| US-023 | Incident Management | Phase 1 | [Link](../../02-stories/US-023-incident-management.md) |
| US-024 | Vendor Bidding Portal for Non-Contractual TOs | Phase 1 | [Link](../../02-stories/US-024-vendor-bidding-portal.md) |
| US-025 | Trip Closure with Proof of Delivery (POD) | Phase 1 | [Link](../../02-stories/US-025-trip-closure-pod.md) |

**Note**: Listed as 3 stories in epic file, but 4 stories mapped here. Epic file may need update.

---

## EPIC-006: Fleet & Vehicle Management
**11 stories** | Phase 1 | Critical Priority

Vehicle, driver, helper registration, fuel tracking, trip costing.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-053 | Vehicle Master Data Management | Phase 1 | [Link](../../02-stories/US-053-vehicle-registration-master-data.md) |
| US-053b | QC Certificate Management *(variant)* | Phase 1 | [Link](../../02-stories/US-053b-qc-certificate-management.md) |
| US-054 | QC Audit Trail & History | Phase 1 | [Link](../../02-stories/US-054-qc-audit-trail.md) |
| US-055 | QC Vendor Quality Tracking | Phase 1 | [Link](../../02-stories/US-055-qc-vendor-quality-tracking.md) |
| US-056 | QC Compliance & Regulatory Reporting | Phase 1 | [Link](../../02-stories/US-056-qc-compliance-reporting.md) |
| US-057 | Manage Driver Master Data | Phase 1 | [Link](../../02-stories/US-057-driver-master-data.md) |
| US-058 | Fuel Management & Tracking | Phase 1 | [Link](../../02-stories/US-058-fuel-management.md) |
| US-059 | Trip Cost Calculation & Analysis | Phase 1 | [Link](../../02-stories/US-059-trip-cost-calculation.md) |
| US-060 | Trip Profitability Analysis & Revenue Tracking | Phase 1 | [Link](../../02-stories/US-060-profitability-analysis.md) |
| US-061 | Manage Helper Master Data | Phase 1 | [Link](../../02-stories/US-061-helper-profile.md) |
| US-062 | Helper Assignment | Phase 1 | [Link](../../02-stories/US-062-helper-assignment.md) |

**Note**: Stories US-054 to US-056 appear QC-related but are mapped to Fleet Management epic in frontmatter.

---

## EPIC-007: Product Transfer Requisition Management
**4 stories** | Phase 1 | High Priority

Command center dashboard, vendor registration, performance tracking.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-026 | Real-time Map Dashboard (Command Center) | Phase 1 | [Link](../../02-stories/US-026-realtime-map-dashboard.md) |
| US-027 | Vendor Registration & Verification Workflow | Phase 1 | [Link](../../02-stories/US-027-vendor-registration-verification.md) |
| US-028 | Vendor Performance Tracking & Metrics | Phase 1 | [Link](../../02-stories/US-028-vendor-performance-tracking.md) |
| US-029 | Vendor Payment Management | Phase 1 | [Link](../../02-stories/US-029-vendor-payment-management.md) |

---

## EPIC-008: Distribution & Procurement Management
**5 stories** | Phase 1 | High Priority

Vendor fleet, portal, contracts, ratings, and blacklisting.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-030 | Vendor Fleet Management | Phase 1 | [Link](../../02-stories/US-030-vendor-fleet-management.md) |
| US-031 | Vendor Portal (Self-Service) | Phase 1 | [Link](../../02-stories/US-031-vendor-portal.md) |
| US-032 | Vendor Rating & Reviews | Phase 1 | [Link](../../02-stories/US-032-vendor-rating-reviews.md) |
| US-033 | Vendor Contract Management | Phase 1 | [Link](../../02-stories/US-033-vendor-contract-management.md) |
| US-034 | Vendor Blacklist Management | Phase 1 | [Link](../../02-stories/US-034-vendor-blacklist.md) |

---

## EPIC-009: Transport Order (TO) Management
**12 stories** | Phase 1 | Critical Priority

Gate-in/out, scaling, loading, unloading, command center monitoring.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-035 | Gate-In Entry at Source POI | Phase 1 | [Link](../../02-stories/US-035-gate-in-source.md) |
| US-036 | Gate-Out Entry at Source POI | Phase 1 | [Link](../../02-stories/US-036-gate-out-source.md) |
| US-037 | Gate-In Entry at Destination POI | Phase 1 | [Link](../../02-stories/US-037-gate-in-destination.md) |
| US-038 | Gate-Out Entry at Destination POI | Phase 1 | [Link](../../02-stories/US-038-gate-out-destination.md) |
| US-039 | Scaling/Weighing at Source POI | Phase 1 | [Link](../../02-stories/US-039-scaling-source.md) |
| US-040 | Scaling/Weighing at Destination POI | Phase 1 | [Link](../../02-stories/US-040-scaling-destination.md) |
| US-041 | Loading Operations Management | Phase 1 | [Link](../../02-stories/US-041-loading-operations.md) |
| US-042 | Unloading Operations Management | Phase 1 | [Link](../../02-stories/US-042-unloading-operations.md) |
| US-043 | Command Center Operations Monitoring | Phase 1 | [Link](../../02-stories/US-043-command-center-monitoring.md) |
| US-044 | QC Lab Testing Workflow | Phase 1 | [Link](../../02-stories/US-044-qc-lab-testing.md) |
| US-045 | QC Sample Collection | Phase 1 | [Link](../../02-stories/US-045-qc-sample-collection.md) |
| US-046 | QC Test Configuration & Checklist Management | Phase 1 | [Link](../../02-stories/US-046-qc-test-configuration.md) |

**Note**: Last 3 stories (US-044 to US-046) appear QC-related but are mapped to TO Management epic.

---

## EPIC-010: Vendor Management
**6 stories** | Phase 1 | High Priority

Vendor master data, QC workflows, reports, and driver mobile interface.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-047 | Manage Vendor Master Data | Phase 1 | [Link](../../02-stories/US-047-vendor-registration.md) |
| US-048 | QC Report Generation | Phase 1 | [Link](../../02-stories/US-048-qc-report-generation.md) |
| US-049 | QC Rejection Workflow | Phase 1 | [Link](../../02-stories/US-049-qc-rejection-workflow.md) |
| US-050 | QC Dashboard & Analytics | Phase 1 | [Link](../../02-stories/US-050-qc-dashboard.md) |
| US-051 | QC Checklist Management (Visual Inspection) | Phase 1 | [Link](../../02-stories/US-051-qc-checklist-management.md) |
| US-052 | Driver Mobile Interface | Phase 1 | [Link](../../02-stories/US-052-driver-mobile-interface.md) |

**Note**: US-052 appears mobile-related but mapped to Vendor Management. Possible duplicate with US-092.

---

## EPIC-011: Gate Management
**5 stories** | Phase 1 | Critical Priority

Gate operations: challan lookup, on-demand TO creation, gate-out, remarks.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-063 | Gate-in TO/Challan Lookup | Phase 1 | [Link](../../02-stories/US-063-gate-in-challan-lookup.md) |
| US-064 | On Demand Third Party TO Creation against DO copy for Dealer Entry | Phase 1 | [Link](../../02-stories/US-064-on-demand-to-dealer-entry.md) |
| US-065 | On Demand Third Party TO Creation against PO copy for Supplier Entry | Phase 1 | [Link](../../02-stories/US-065-on-demand-to-supplier-entry.md) |
| US-066 | Gate-Out Entry | Phase 1 | [Link](../../02-stories/US-066-gate-out-entry.md) |
| US-067 | Remarks Logging | Phase 1 | [Link](../../02-stories/US-067-remarks-logging.md) |

---

## EPIC-012: Scaling / Weight Management
**3 stories** | Phase 1 | Critical Priority

Weight entry, queue management, weight exit operations.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-068 | Weight Entry | Phase 1 | [Link](../../02-stories/US-068-weight-entry.md) |
| US-069 | Queue Token Generation | Phase 1 | [Link](../../02-stories/US-069-queue-token-generation.md) |
| US-070 | Weight Exit | Phase 1 | [Link](../../02-stories/US-070-weight-exit.md) |

---

## EPIC-013: Loading & Unloading Operations
**4 stories** | Phase 2 | High Priority

Enhanced loading/unloading operations with time tracking and point assignment.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-072 | Assign Loading/Unloading Point ⚠️ | Phase 2 | [Link](../../02-stories/US-072-assign-loading-unloading-point.md) |
| US-072 | TR Conjoinment ⚠️ | Phase 2 | [Link](../../02-stories/US-072-tr-conjoinment.md) |
| US-075 | Load Start/End Date & Time Entry | Phase 2 | [Link](../../02-stories/US-075-load-start-end-time-entry.md) |
| US-076 | Unload Start/End Date & Time Entry | Phase 2 | [Link](../../02-stories/US-076-unload-start-end-time-entry.md) |

⚠️ **Critical Issue**: US-072 has 2 different stories with the same ID. Requires resolution.

---

## EPIC-014: Quality Control & Quality Assurance
**14 stories** | Phase 2 & 3 | High Priority

Advanced QC workflows, sampling, lab integration, tracking.

### Phase 2 (9 stories)

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-077 | Pre-QC Context Display | Phase 2 | [Link](../../02-stories/US-077-pre-qc-context-display.md) |
| US-078 | Sample Creation | Phase 2 | [Link](../../02-stories/US-078-sample-creation.md) |
| US-079 | Sample Labeling | Phase 2 | [Link](../../02-stories/US-079-sample-labeling.md) |
| US-080 | Exception Recording | Phase 2 | [Link](../../02-stories/US-080-exception-recording.md) |
| US-081 | QC Context Display | Phase 2 | [Link](../../02-stories/US-081-qc-context-display.md) |
| US-082 | Sample Collection Event | Phase 2 | [Link](../../02-stories/US-082-sample-collection-event.md) |
| US-083 | Configurable Form (Checklist & Sampling) | Phase 2 | [Link](../../02-stories/US-083-configurable-form-checklist-sampling.md) |
| US-084 | QR/Barcode Label | Phase 2 | [Link](../../02-stories/US-084-qr-barcode-label.md) |
| US-085 | Sampling Timestamp | Phase 2 | [Link](../../02-stories/US-085-sampling-timestamp.md) |

### Phase 3 (5 stories)

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-086 | Create Lab Request | Phase 3 | [Link](../../02-stories/US-086-create-lab-request.md) |
| US-087 | Lab Estimated Completion | Phase 3 | [Link](../../02-stories/US-087-lab-estimated-completion.md) |
| US-088 | Lab Report Upload | Phase 3 | [Link](../../02-stories/US-088-lab-report-upload.md) |
| US-089 | Lab Status Monitoring | Phase 3 | [Link](../../02-stories/US-089-lab-status-monitoring.md) |
| US-090 | QC Pass/Fail/Auto-pass Tracking | Phase 3 | [Link](../../02-stories/US-090-qc-pass-fail-aut-pass-tracking.md) |

---

## EPIC-015: Command Center Operations
**2 stories** | Phase 2 | High Priority

Enhanced command center features for vehicle management and dispatch planning.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-071 | TO Dispatch Planning (Calendar View) ⚠️ | Phase 2 | [Link](../../02-stories/US-071-to-dispatch-planning-calendar-view.md) |
| US-071 | View All Waiting Vehicles ⚠️ | Phase 2 | [Link](../../02-stories/US-071-view-all-waiting-vehicles.md) |
| US-074 | Assign Waiting Serial | Phase 2 | [Link](../../02-stories/US-074-assign-waiting-serial.md) |

⚠️ **Critical Issue**: US-071 has 2 different stories with the same ID. Requires resolution.

**Note**: Listed as 2 stories in epic, but 3 files mapped (due to US-071 duplicate).

---

## EPIC-016: Mobile Interface (Driver & QC)
**2 stories** | Phase 3 | High Priority

Mobile applications for driver trip management and QC interface.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-092 | Trip Management - Driver Interface | Phase 3 | [Link](../../02-stories/US-092-trip-management-driver-interface.md) |
| US-093 | QC Interface | Phase 3 | [Link](../../02-stories/US-093-qc-interface.md) |

**Note**: US-092 may duplicate US-052 (Driver Mobile Interface in EPIC-010).

---

## EPIC-017: Mobile Applications (Vendor)
**2 stories** | Phase 3 | Medium Priority

Vendor mobile application access and escalation workflows.

| ID | Title | Phase | File |
|----|-------|-------|------|
| US-091 | Escalation Workflow | Phase 3 | [Link](../../02-stories/US-091-escalation-workflow.md) |
| US-094 | Vendor Application Access | Phase 3 | [Link](../../02-stories/US-094-vendor-application-access.md) |

---

## Summary Statistics by Epic

| Epic ID | Epic Name | Phase | Story Count | Status |
|---------|-----------|-------|-------------|--------|
| EPIC-001 | System Foundation | Phase 1 | 4 | ✅ Complete mapping |
| EPIC-002 | User & Tenant Foundation | Phase 1 | 5 | ✅ Complete mapping |
| EPIC-003 | Master Data & Configuration | Phase 1 | 4 | ✅ Complete mapping |
| EPIC-004 | POI Management & Geofencing | Phase 1 | 8 | ✅ Complete mapping |
| EPIC-005 | Product Inventory Management | Phase 1 | 4 | ⚠️ Epic shows 3 |
| EPIC-006 | Fleet & Vehicle Management | Phase 1 | 11 | ⚠️ Includes QC stories |
| EPIC-007 | Product Transfer Requisition | Phase 1 | 4 | ✅ Complete mapping |
| EPIC-008 | Distribution & Procurement | Phase 1 | 5 | ✅ Complete mapping |
| EPIC-009 | Transport Order Management | Phase 1 | 12 | ⚠️ Includes QC stories |
| EPIC-010 | Vendor Management | Phase 1 | 6 | ⚠️ Includes US-052 |
| EPIC-011 | Gate Management | Phase 1 | 5 | ✅ Complete mapping |
| EPIC-012 | Scaling / Weight Management | Phase 1 | 3 | ✅ Complete mapping |
| EPIC-013 | Loading & Unloading Ops | Phase 2 | 4 | ⚠️ US-072 duplicate |
| EPIC-014 | Quality Control & QA | Phase 2-3 | 14 | ✅ Complete mapping |
| EPIC-015 | Command Center Operations | Phase 2 | 3 | ⚠️ US-071 duplicate |
| EPIC-016 | Mobile Interface (Driver/QC) | Phase 3 | 2 | ⚠️ US-092 vs US-052 |
| EPIC-017 | Mobile Apps (Vendor) | Phase 3 | 2 | ✅ Complete mapping |
| **TOTAL** | **17 Epics** | **All** | **96** | **94 unique + 2 dups** |

---

## Known Issues

### Duplicate Story IDs (Critical)

1. **US-071** - 2 files with same ID:
   - TO Dispatch Planning (Calendar View)
   - View All Waiting Vehicles
   - **Recommendation**: Renumber one to US-095

2. **US-072** - 2 files with same ID:
   - Assign Loading/Unloading Point
   - TR Conjoinment
   - **Recommendation**: Renumber one to US-096

### Epic Mapping Issues

1. **QC Stories Split Across Epics**: QC-related stories appear in EPIC-006, EPIC-009, EPIC-010, and EPIC-014
2. **Driver Mobile Duplicate**: US-052 (EPIC-010) vs US-092 (EPIC-016) - possible duplicate
3. **Story Count Mismatch**: EPIC-005 shows 3 stories but has 4 mapped

See `10-meta/reports/duplicate-story-ids-investigation.md` for detailed analysis.

---

## Related Documentation

- **Complete Story List**: [complete-story-list.md](complete-story-list.md) - All stories organized by phase
- **Phase-Specific Lists**:
  - [Phase 1 Story List](phase-1/story-list.md) - 70 stories
  - [Phase 2 Story List](phase-2/story-list.md) - 16+ stories
  - [Phase 3 Story List](phase-3/story-list.md) - 8 stories
- **Epic Definitions**: `../01-epics/` - 17 epic files with detailed descriptions
- **Module Specifications**: `../../03-module-specifications/INDEX.md` - Technical specifications
- **Alignment Report**: `../../10-meta/reports/specs-backlog-alignment-analysis.md`

---

**Generated**: February 27, 2026  
**Method**: Extracted from story YAML frontmatter (`epic_id` field)  
**Validation**: All 97 file links verified (94 unique IDs + 3 variants/duplicates)  
**Coverage**: 100% of backlog stories mapped to epics
