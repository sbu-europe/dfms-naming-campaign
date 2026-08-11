---
title: Sprint 8 — Improvements Tracker
source_sprint: Sprint 8
carried_from: Sprint 7
total_items: 27
resolved: 26
in_progress: 1
open: 0
---

# Sprint 8 — Improvements Tracker

Bulk I/O and invitation-channel improvements carried from Sprint 7 (FB-001–FB-007), plus new Sprint 8 workflow / display improvements (FB-008–FB-027).
Items are split **by admin menu / module** for easier browsing.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

> **Origin:** Sprint 7 tracker retained [FB-001–FB-008](../../sprint-7/feedback.md). FB-001–FB-007 here are the Sprint 7 carry-over bulk I/O / invitation items. **FB-008–FB-027** are new Sprint 8 improvements (PR lock, TR weight columns, Transport Planner remaining qty/weight / Allocating TO Load, Driver My Trips cargo weight, Gate-In/Out form cleanup, Vehicle capacity unit MT/KG only, yard-ops TO labels + Allocated Weight, On-Demand TO optional gate-in datetime, CC Queue change-form visit/cargo details, Scaling kg input + MT (kg) display, LoadEvent/UnloadEvent live Loaded/Received weight from UOM × WPU, Scale-In/Out empty vehicle on both + Scale-Out list indicators, TO Execution timeline empty/loaded weight notes, Dwell time H.m.s display, TO Vendor↔Own fleet interchange before Ready for Dispatch).

## Modules

| Folder file | Menu / area | Items | Resolved | Open |
|-------------|-------------|-------|----------|------|
| [Users & Access](./01-users-and-access.md) | Users / Drivers · Invite · Bulk I/O | 4 | 4 | 0 |
| [Master Data](./02-master-data.md) | Master Data · Vehicles · Bulk I/O | 4 | 4 | 0 |
| [Product Requisition](./03-product-requisition.md) | Requisition / Product Requisitions · Port Shipments | 1 | 1 | 0 |
| [Transport Requests](./04-transport-requests.md) | Distribution / Procurement · Transport Requests | 2 | 2 | 0 |
| [Transport Planner](./05-transport-planner.md) | Transport · Transport Requests · Transport Orders | 5 | 5 | 0 |
| [Driver Mobile / My Trips](./06-driver-mobile.md) | Trips · My Trips · Driver Mobile | 1 | 1 | 0 |
| [Gate Operations](./07-gate-operations.md) | Gate · Vehicle Entry (Gate-In) · Vehicle Exit (Gate-Out) · On-Demand TO · Visit dwell | 4 | 3 | 1 |
| [Command Center](./08-command-center.md) | Command Center · Queue · Bay Assignment (CCO); Loading / Unloading line capture · Gate / QC panels | 3 | 3 | 0 |
| [Scaling](./09-scaling.md) | Scaling · Scale-In · Scale-Out; Gate Pass / Queue Token / CC·QC weight display | 3 | 3 | 0 |

## All items (quick index)

| ID | Title | Module | Menu | Priority | Status |
|----|-------|--------|------|----------|--------|
| [FB-001](./01-users-and-access.md#fb-001--phone-number-normalization-on-bulk-user-upload--driver-import) | Phone number normalization on bulk user upload & driver import | [Users & Access](./01-users-and-access.md) | Users · Drivers · Bulk I/O | Medium | Resolved |
| [FB-002](./01-users-and-access.md#fb-002--invitation-channel-email--single-email-field-on-manual-add-and-import) | Invitation channel email: single email field on manual add and import | [Users & Access](./01-users-and-access.md) | Users · Drivers · Invite | Medium | Resolved |
| [FB-003](./01-users-and-access.md#fb-003--driver-invitation-bulk-importexport--add-reference-contacts--address) | Driver invitation bulk import/export: add reference contacts & address | [Users & Access](./01-users-and-access.md) | Users / Drivers · Bulk I/O | Medium | Resolved |
| [FB-004](./01-users-and-access.md#fb-004--driver-bulk-upload--optional-accident-history--last-training-assessment-info) | Driver bulk upload: optional accident history & last training assessment info | [Users & Access](./01-users-and-access.md) | Users / Drivers · Bulk I/O | Medium | Resolved |
| [FB-005](./02-master-data.md#fb-005--loadingunloading-bulk-operation-missing) | Loading/Unloading: bulk operation missing for this menu | [Master Data](./02-master-data.md) | Master Data / Loading-Unloading · Bulk I/O | Medium | Resolved |
| [FB-006](./02-master-data.md#fb-006--product-bulk-operation--remove-redundant-amount-column-from-template) | Product bulk operation: remove redundant Amount column from template | [Master Data](./02-master-data.md) | Master Data / Products · Bulk I/O | Medium | Resolved |
| [FB-007](./02-master-data.md#fb-007--product-sub-category-bulk-operation-missing) | Product Sub-Category: bulk operation missing for this menu | [Master Data](./02-master-data.md) | Master Data / Product Sub-Categories · Bulk I/O | Medium | Resolved |
| [FB-008](./03-product-requisition.md#fb-008--pr-locked-from-edit-by-depot--feed-mill--commercial-officers-after-submission) | PR locked from edit by Depot / Feed Mill / Commercial Officers after submission | [Product Requisition](./03-product-requisition.md) | Requisition / PR · Port Shipments | High | Resolved |
| [FB-009](./04-transport-requests.md#fb-009--tr-list-show-total-weight-kg-instead-of-total-quantity-for-distribution--procurement-roles) | TR List: Total Weight (KG) instead of Total Quantity (DO / DM / PO) | [Transport Requests](./04-transport-requests.md) | Distribution / Procurement · TRs | Medium | Resolved |
| [FB-010](./04-transport-requests.md#fb-010--tr-details--line-items-show-total-weight-kg-and-total-quantity-for-distribution--procurement-roles) | TR Details & line items: Total Weight (KG) + Total Quantity (DO / DM / PO) | [Transport Requests](./04-transport-requests.md) | Distribution / Procurement · TRs | Medium | Resolved |
| [FB-011](./05-transport-planner.md#fb-011--transport-planner-tr-list--display-remaining-weight-kg-for-planning) | Transport Planner TR List: Remaining Weight (KG) for planning | [Transport Planner](./05-transport-planner.md) | Transport · TR queue | High | Resolved |
| [FB-012](./05-transport-planner.md#fb-012--to-creation-details--allocated-quantity-per-product-shall-show-remaining-quantity) | TO Creation: Allocated Quantity Per Product — Remaining Quantity column | [Transport Planner](./05-transport-planner.md) | Transport · TO creation | High | Resolved |
| [FB-013](./05-transport-planner.md#fb-013--to-details-after-creation--pr-line-items-table-not-showing) | TO details after creation: PR line items table not showing | [Transport Planner](./05-transport-planner.md) | Transport · TO details | High | Resolved |
| [FB-014](./06-driver-mobile.md#fb-014--my-trips-details--cargo-table-shall-show-allocated-weight-with-allocated-quantity) | My Trips Cargo table: Allocated Weight with Allocated Quantity | [Driver Mobile / My Trips](./06-driver-mobile.md) | Trips · My Trips | Medium | Resolved |
| [FB-015](./05-transport-planner.md#fb-015--to-creation--allocating-to-load-live-sum-in-mt-kg) | TO Creation: Allocating TO Load live sum in MT (kg) | [Transport Planner](./05-transport-planner.md) | Transport · TO creation | Medium | Resolved |
| [FB-016](./07-gate-operations.md#fb-016--gate-out-form--remove-non-updating-clearance-status-panel) | Gate-Out form: remove non-updating Clearance Status panel | [Gate Operations](./07-gate-operations.md) | Gate · Vehicle Exit (Gate-Out) | Medium | Resolved |
| [FB-017](./07-gate-operations.md#fb-017--gate-in-add--remove-project--from-from-to-snapshot--readonly-project-from-info) | Gate-In add: remove Project / From from TO snapshot; readonly Project From Info | [Gate Operations](./07-gate-operations.md) | Gate · Vehicle Entry (Gate-In) | Medium | Resolved |
| [FB-018](./02-master-data.md#fb-018--vehicle-master-data--capacity-unit-mt--kg-only-remove-bag) | Vehicle capacity unit: MT & KG only (remove Bag) | [Master Data](./02-master-data.md) | Master Data · Vehicles | Medium | Resolved |
| [FB-019](./08-command-center.md#fb-019--yard-ops-to-aligned-labels--allocated-weight-mt-kg) | Yard ops TO-aligned labels + Allocated Weight MT (kg) | [Command Center](./08-command-center.md) | CC · Loading · Gate · QC | Medium | Resolved |
| [FB-020](./07-gate-operations.md#fb-020--on-demand-to-create--optional-gate-in-datetime-option-a) | On-Demand TO create: optional Gate-in date/time (Option A) | [Gate Operations](./07-gate-operations.md) | Gate · On-Demand TO | High | In Progress |
| [FB-021](./08-command-center.md#fb-021--cc-queue-change-form--show-vehicle-scale-in-datetime-product-lines-type--weight) | CC Queue change form: Vehicle, Scale-in Date & Time, Product Lines, Product Type (FG/RM), Weight | [Command Center](./08-command-center.md) | CC · Queue | High | Resolved |
| [FB-022](./09-scaling.md#fb-022--scale-inout--kg-input--listnet-display-as-mt-kg-option-a) | Scale-In/Out: kg input + list/net display as MT (kg) (Option A) | [Scaling](./09-scaling.md) | Scaling · Scale-In · Scale-Out | Medium | Resolved |
| [FB-023](./08-command-center.md#fb-023--loadeventunloadevent--live-loadedreceived-weight-from-uom--wpu) | LoadEvent/UnloadEvent: live Loaded/Received weight from UOM × WPU | [Command Center](./08-command-center.md) | Loading · Unloading · line capture | Medium | Resolved |
| [FB-024](./09-scaling.md#fb-024--scale-inout--empty-vehicle-on-both--scale-out-list-indicators) | Scale-In/Out: empty vehicle on both + Scale-Out list indicators | [Scaling](./09-scaling.md) | Scaling · Scale-In · Scale-Out | Medium | Resolved |
| [FB-025](./09-scaling.md#fb-025--to-execution-timeline--empty--loaded-vehicle-weight-notes) | TO Execution timeline: empty / loaded vehicle weight notes | [Scaling](./09-scaling.md) | Scaling · TO Execution timeline | Medium | Resolved |
| [FB-026](./07-gate-operations.md#fb-026--dwell-time--show-hms-format-instead-of-minutes-only) | Dwell time: show H.m.s format instead of minutes only | [Gate Operations](./07-gate-operations.md) | Gate · Visit dwell · TO dwell matrix | Medium | Resolved |
| [FB-027](./05-transport-planner.md#fb-027--to-fleet-type-interchange--vendor--own-before-ready-for-dispatch) | TO fleet type interchange: Vendor ↔ Own before Ready for Dispatch | [Transport Planner](./05-transport-planner.md) | Transport · Transport Orders | High | Resolved |

## Resolution Summary

| Priority | Total | Resolved | In Progress | Open |
|----------|-------|----------|-------------|------|
| High | 7 | 6 | 1 | 0 |
| Medium | 20 | 20 | 0 | 0 |
| **Total** | **27** | **26** | **1** | **0** |
