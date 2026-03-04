# Phase 1 - User Stories

> **70 stories (US-001 to US-070) + 1 variant (US-053b)** - Core platform foundation and essential operations

**Last Updated**: February 27, 2026  
**Status**: Active development (26 weeks, Sprint 1-13)

---

## Overview

Phase 1 delivers the **minimum viable product (MVP)** with core platform capabilities:
- Authentication & user management
- Complete transport lifecycle (Requisition → TO → Trip → Delivery)
- POI operations (Gate, Scaling, Loading/Unloading, QC)
- Vendor & fleet management
- Mobile interfaces for drivers and QC staff
- Real-time monitoring and command center

---

## Complete Story List (US-001 to US-070)

### Foundation & Security (US-001 to US-009)

- [US-001](../../02-stories/US-001-user-login-account-lockout.md) - User Login & Account Lockout
- [US-002](../../02-stories/US-002-multi-factor-auth.md) - Multi-Factor Auth (2FA)
- [US-003](../../02-stories/US-003-session-control.md) - Session Control
- [US-004](../../02-stories/US-004-role-hierarchy.md) - Role Hierarchy
- [US-005](../../02-stories/US-005-user-invitation-activation.md) - User Invitation & Activation
- [US-006](../../02-stories/US-006-otp-verification.md) - OTP Verification System
- [US-007](../../02-stories/US-007-account-deactivation.md) - Account Deactivation
- [US-008](../../02-stories/US-008-password-account-reset.md) - Password & Account Reset
- [US-009](../../02-stories/US-009-user-activity-audit-logs.md) - User Activity & Audit Logs

### Transport Requisition & Order Management (US-010 to US-025)

- [US-010](../../02-stories/US-010-port-transfer-requisition.md) - Create Port Consignment Transfer Requisition (TR)
- [US-011](../../02-stories/US-011-distribution-approval.md) - Distribution Approval Workflow (FG TR)
- [US-012](../../02-stories/US-012-procurement-approval.md) - Procurement Approval Workflow (Port TR)
- [US-013](../../02-stories/US-013-stock-validation.md) - Stock Validation (Source & Destination)
- [US-014](../../02-stories/US-014-capacity-checking.md) - Capacity Checking and Warnings
- [US-015](../../02-stories/US-015-tr-assessment.md) - Transport Requisition (TR) Assessment by Transport Planner
- [US-016](../../02-stories/US-016-fleet-availability.md) - Fleet Availability Validation
- [US-017](../../02-stories/US-017-to-creation-multiple.md) - Transport Order (TO) Creation - Multiple TOs per TR
- [US-018](../../02-stories/US-018-to-creation-transport-planner.md) - Transport Order (TO) Creation by Transport Planner
- [US-019](../../02-stories/US-019-to-execution-vendor-direct.md) - TO Execution - Vendor Fleet (Direct Assignment)
- [US-020](../../02-stories/US-020-to-execution-own-fleet.md) - TO Execution - Own Fleet (Vehicle/Driver Assignment)
- [US-021](../../02-stories/US-021-trip-lifecycle.md) - Trip Lifecycle Management (12 States, Sub-states)
- [US-022](../../02-stories/US-022-partial-delivery.md) - Partial Delivery Handling
- [US-023](../../02-stories/US-023-incident-management.md) - Incident Management
- [US-024](../../02-stories/US-024-vendor-bidding-portal.md) - Vendor Bidding Portal for Non-Contractual TOs
- [US-025](../../02-stories/US-025-trip-closure-pod.md) - Trip Closure with Proof of Delivery (POD)

### Command Center & Vendor Management (US-026 to US-034)

- [US-026](../../02-stories/US-026-realtime-map-dashboard.md) - Real-time Map Dashboard (Command Center)
- [US-027](../../02-stories/US-027-vendor-registration-verification.md) - Vendor Registration & Verification Workflow
- [US-028](../../02-stories/US-028-vendor-performance-tracking.md) - Vendor Performance Tracking & Metrics
- [US-029](../../02-stories/US-029-vendor-payment-management.md) - Vendor Payment Management
- [US-030](../../02-stories/US-030-vendor-fleet-management.md) - Vendor Fleet Management
- [US-031](../../02-stories/US-031-vendor-portal.md) - Vendor Portal (Self-Service)
- [US-032](../../02-stories/US-032-vendor-rating-reviews.md) - Vendor Rating & Reviews
- [US-033](../../02-stories/US-033-vendor-contract-management.md) - Vendor Contract Management
- [US-034](../../02-stories/US-034-vendor-blacklist.md) - Vendor Blacklist Management

### POI Operations - Gate, Scaling, Loading (US-035 to US-043)

- [US-035](../../02-stories/US-035-gate-in-source.md) - Gate-In Entry at Source POI
- [US-036](../../02-stories/US-036-gate-out-source.md) - Gate-Out Entry at Source POI
- [US-037](../../02-stories/US-037-gate-in-destination.md) - Gate-In Entry at Destination POI
- [US-038](../../02-stories/US-038-gate-out-destination.md) - Gate-Out Entry at Destination POI
- [US-039](../../02-stories/US-039-scaling-source.md) - Scaling/Weighing at Source POI
- [US-040](../../02-stories/US-040-scaling-destination.md) - Scaling/Weighing at Destination POI
- [US-041](../../02-stories/US-041-loading-operations.md) - Loading Operations Management
- [US-042](../../02-stories/US-042-unloading-operations.md) - Unloading Operations Management
- [US-043](../../02-stories/US-043-command-center-monitoring.md) - Command Center Operations Monitoring

### Quality Control Workflow (US-044 to US-056)

- [US-044](../../02-stories/US-044-qc-lab-testing.md) - QC Lab Testing Workflow
- [US-045](../../02-stories/US-045-qc-sample-collection.md) - QC Sample Collection
- [US-046](../../02-stories/US-046-qc-test-configuration.md) - QC Test Configuration & Checklist Management
- [US-047](../../02-stories/US-047-vendor-registration.md) - Vendor Registration
- [US-048](../../02-stories/US-048-qc-report-generation.md) - QC Report Generation
- [US-049](../../02-stories/US-049-qc-rejection-workflow.md) - QC Rejection Workflow
- [US-050](../../02-stories/US-050-qc-dashboard.md) - QC Dashboard & Analytics
- [US-051](../../02-stories/US-051-qc-checklist-management.md) - QC Checklist Management (Visual Inspection)
- [US-052](../../02-stories/US-052-driver-mobile-interface.md) - Driver Mobile Interface
- [US-053](../../02-stories/US-053-vehicle-registration-master-data.md) - Vehicle Registration & Master Data Management
- [US-053b](../../02-stories/US-053b-qc-certificate-management.md) - QC Certificate Management *(variant)*
- [US-054](../../02-stories/US-054-qc-audit-trail.md) - QC Audit Trail & History
- [US-055](../../02-stories/US-055-qc-vendor-quality-tracking.md) - QC Vendor Quality Tracking
- [US-056](../../02-stories/US-056-qc-compliance-reporting.md) - QC Compliance & Regulatory Reporting

### Fleet Management & Costing (US-057 to US-062)

- [US-057](../../02-stories/US-057-driver-master-data.md) - Manage Driver Master Data
- [US-058](../../02-stories/US-058-fuel-management.md) - Fuel Management & Tracking
- [US-059](../../02-stories/US-059-trip-cost-calculation.md) - Trip Cost Calculation & Analysis
- [US-060](../../02-stories/US-060-profitability-analysis.md) - Trip Profitability Analysis & Revenue Tracking
- [US-061](../../02-stories/US-061-helper-profile.md) - Helper Profile
- [US-062](../../02-stories/US-062-helper-assignment.md) - Helper Assignment

### Gate Operations & Weight Management (US-063 to US-070)

- [US-063](../../02-stories/US-063-gate-in-challan-lookup.md) - Gate-in TO/Challan Lookup
- [US-064](../../02-stories/US-064-on-demand-to-dealer-entry.md) - On Demand TO Creation - Dealer Entry
- [US-065](../../02-stories/US-065-on-demand-to-supplier-entry.md) - On Demand TO Creation - Supplier Entry
- [US-066](../../02-stories/US-066-gate-out-entry.md) - Gate-Out Entry
- [US-067](../../02-stories/US-067-remarks-logging.md) - Remarks Logging
- [US-068](../../02-stories/US-068-weight-entry.md) - Weight Entry
- [US-069](../../02-stories/US-069-queue-token-generation.md) - Queue Token Generation
- [US-070](../../02-stories/US-070-weight-exit.md) - Weight Exit

---

## Story Count Summary

| Category | Count | Story Range |
|----------|-------|-------------|
| Foundation & Security | 9 | US-001 to US-009 |
| Transport & Orders | 16 | US-010 to US-025 |
| Command Center & Vendor | 9 | US-026 to US-034 |
| POI Operations | 9 | US-035 to US-043 |
| Quality Control | 13 (+1 variant) | US-044 to US-056 |
| Fleet & Costing | 6 | US-057 to US-062 |
| Gate & Weight | 8 | US-063 to US-070 |
| **Total** | **70 + 1** | **US-001 to US-070 + US-053b** |

---

## Known Issues

### Duplicate Story IDs

⚠️ **Note**: Some story IDs have duplicate files that need resolution:

- **US-071**: Two files exist (both outside Phase 1 range)
  - `US-071-to-dispatch-planning-calendar-view.md`
  - `US-071-view-all-waiting-vehicles.md`

- **US-072**: Two files exist (both outside Phase 1 range)
  - `US-072-assign-loading-unloading-point.md`
  - `US-072-tr-conjoinment.md`

- **US-073**: File exists outside Phase 1 range
  - `US-073-assignment-alert.md`

See `10-meta/reports/duplicate-story-ids-investigation.md` for resolution plan.

---

## Related Documentation

- **Epic Definitions**: `../01-epics/` - 17 epic files
- **Phase 2 Stories**: `../phase-2/` - Advanced features (US-071+)
- **Phase 3 Stories**: `../phase-3/` - Enterprise features (US-087+)
- **Module Specifications**: `../../../03-module-specifications/` - Technical details
- **Story Mapping**: `../../../03-module-specifications/INDEX.md` - Story-to-module mapping

---

**Generated**: February 27, 2026  
**Method**: Auto-generated from actual story files in `02-stories/`  
**Validation**: All links verified to point to existing files
