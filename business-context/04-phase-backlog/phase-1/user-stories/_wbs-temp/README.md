# WBS Temp Storage

This directory contains user stories that were moved during WBS alignment process.

## Overview

These files were either:
1. **Duplicate story IDs** - Multiple files with conflicting IDs
2. **Misaligned with WBS** - Story content didn't match WBS definition for that ID
3. **Old versions** - Replaced by WBS-aligned versions

---

## Misaligned Stories (Moved with -old suffix)

These stories had content that didn't match the WBS definition for their story ID. They've been moved here and new placeholder stories matching WBS have been created.

### EPIC-003 (Master Data & Configuration)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-010-port-transfer-requisition-old.md | Port Transfer Requisition | Master Entity Registration |
| US-011-distribution-approval-old.md | Distribution Approval | Bulk Upload & Inline Master Data Management |
| US-012-procurement-approval-old.md | Procurement Approval | Master CRUD Operations |
| US-013-stock-validation-old.md | Stock Validation | Data Consistency Referential Control |

### EPIC-004 (POI Management & Geofencing)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-014-capacity-checking-old.md | Capacity Checking | POI Definition |
| US-015-tr-assessment-old.md | TR Assessment | POI CRUD Operation |
| US-016-fleet-availability-old.md | Fleet Availability | POI Classification |
| US-017-to-creation-multiple-old.md | TO Creation Multiple | Map Layer Integration |
| US-018-to-creation-transport-planner-old.md | TO Creation | Real-time Location Tracking |
| US-019-to-execution-vendor-direct-old.md | TO Execution Vendor | Geofencing & POI Tracking |
| US-020-to-execution-own-fleet-old.md | TO Execution Own Fleet | Geofencing Boundary |
| US-021-trip-lifecycle-old.md | Trip Lifecycle | Vehicle Arrival Tracking |
| US-022-partial-delivery-old.md | Partial Delivery | Dwell Time Tracking |

### EPIC-005 (Product Inventory Management)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-023-incident-management-old.md | Incident Management | Product Master Data |
| US-024-vendor-bidding-portal-old.md | Vendor Bidding Portal | Catalogue Design |
| US-025-trip-closure-pod-old.md | Trip Closure POD | Product Configuration |

### EPIC-007 (Product Transfer Requisition Management)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-026-realtime-map-dashboard-old.md | Real-time Map Dashboard | Requisition Transfer Type Configuration |
| US-027-vendor-registration-verification-old.md | Vendor Registration | Unified PR Creation |
| US-028-vendor-performance-tracking-old.md | Vendor Performance | FG Transfer Requisition Creation |
| US-029-vendor-payment-management-old.md | Vendor Payment | Port Transfer Requisition Creation |

### EPIC-008 (Distribution & Procurement Management)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-030-vendor-fleet-management-old.md | Vendor Fleet Management | TR Creation by Distribution Officer |
| US-031-vendor-portal-old.md | Vendor Portal | TR Approval by Distribution Manager |
| US-032-vendor-rating-reviews-old.md | Vendor Rating | TR Creation by Procurement |
| US-033-vendor-contract-management-old.md | Vendor Contract | Source Stock Validation |
| US-034-vendor-blacklist-old.md | Vendor Blacklist | Destination Capacity Validation |

### EPIC-009 (Transport Order Management)
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-035-gate-in-source-old.md | Gate-In Source | TR Assessment |
| US-036-gate-out-source-old.md | Gate-Out Source | Create TO for FG Transfer |
| US-037-gate-in-destination-old.md | Gate-In Destination | Create TO for Port Consignment |
| US-038-gate-out-destination-old.md | Gate-Out Destination | TO Execution - Own Fleet |
| US-039-scaling-source-old.md | Scaling Source | TO Execution - Vendor Fleet (Contractual) |
| US-040-scaling-destination-old.md | Scaling Destination | TO Execution - Vendor Fleet (Non-Contractual) |
| US-041-loading-operations-old.md | Loading Operations | Vendor Execution & Confirmation |
| US-042-unloading-operations-old.md | Unloading Operations | Fleet Availability Validation |
| US-043-command-center-monitoring-old.md | Command Center | TO Lifecycle Management |
| US-044-qc-lab-testing-old.md | QC Lab Testing | Transport Dashboard |
| US-045-qc-sample-collection-old.md | QC Sample Collection | Trip Closure POD |
| US-046-qc-test-configuration-old.md | QC Test Configuration | Trip Costing |

### EPIC-010 (Vendor Management) & Others
| Moved File | Old Title | WBS Title |
|------------|-----------|-----------|
| US-048-qc-report-generation-old.md | QC Report Generation | Vendor Verification Workflow |
| US-049-qc-rejection-workflow-old.md | QC Rejection Workflow | Vendor Bidding Portal |
| US-050-qc-dashboard-old.md | QC Dashboard | Vendor Bid Evaluation |
| US-051-qc-checklist-management-old.md | QC Checklist | Vehicle/Driver Information Submission |
| US-052-driver-mobile-interface-old.md | Driver Mobile Interface | Real-time TO Updates (Vendor Portal) |
| US-053b-qc-certificate-management-old.md | QC Certificate Management | N/A (was duplicate) |
| US-054-qc-audit-trail-old.md | QC Audit Trail | Vehicle License & Health Management |
| US-055-qc-vendor-quality-tracking-old.md | QC Vendor Quality | Vehicle Status Matrix |
| US-056-qc-compliance-reporting-old.md | QC Compliance | Vehicle and Resource Assignment |
| US-058-fuel-management-old.md | Fuel Management | Driver-Vehicle Assignment |
| US-059-trip-cost-calculation-old.md | Trip Cost Calculation | Driver State Tracking |
| US-060-profitability-analysis-old.md | Profitability Analysis | Driver Availability Status Tracking |

---

## Duplicate Story IDs (Original conflicts)

These files had duplicate story IDs and were moved during initial alignment:

| Original File | Suggested WBS Mapping | Notes |
|---------------|----------------------|-------|
| US-002-driver-master-data.md | US-057 (EPIC-006) | Driver Master Data |
| US-003-helper-master-data.md | US-061 (EPIC-006) | Helper Profile |
| US-004-vendor-master-data.md | US-047 (EPIC-010) | Vendor Registration |
| US-005-poi-master-data.md | US-014 (EPIC-004) | POI Definition |
| US-006-product-master-data.md | US-023 (EPIC-005) | Product Master Data |
| US-007-user-role-management.md | Part of US-004 (EPIC-001) | Role Hierarchy |
| US-008-tenant-configuration.md | Part of EPIC-002 | Tenant setup |
| US-009-fg-transfer-requisition.md | US-028 (EPIC-007) | FG Transfer Requisition |
| US-047-qc-pass-fail-decision.md | Part of EPIC-014 | QC workflow |
| US-057-vehicle-maintenance.md | Part of EPIC-006 | Vehicle maintenance |
| US-061-qc-supervisor-mobile.md | Part of EPIC-016 | QC Supervisor Mobile |
| US-063-vendor-mobile-app.md | Part of EPIC-017 | Vendor Mobile App |
| US-064-subscription-plan-selection.md | Not in Phase-1 WBS | Phase-2 feature |
| US-070-on-demand-third-party-to-creation.md | Related to US-064-065 | On-demand TO creation |
| US-073-requisition-transfer-type-configuration.md | US-026 (EPIC-007) | Transfer Type Configuration |

---

## Action Required

These files contain detailed requirements and should be:
1. **Reviewed** for valuable content
2. **Merged** into appropriate WBS-aligned stories
3. **Referenced** in new stories where applicable
4. **Archived** once content is integrated

---

## Notes

- Files with `-old` suffix: Content didn't match WBS for that ID
- Files without suffix: Original duplicate ID conflicts
- New placeholder stories have been created matching WBS definitions
- All epic story tables updated to point to new files

**Last Updated**: 2026-02-23  
**Total Files**: 49 with -old suffix, 16 original duplicates = 65 files
