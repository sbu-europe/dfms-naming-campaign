---
title: Transport Order (TO) Management
epic_id: EPIC-009
epic_name: Transport Order (TO) Management
phase: phase-1
module_category: Operations
priority: P1
status: Planned
target_sprint: Sprint 6-7
duration: 3 Weeks
story_points: 68
progress: 0%
created: 2026-02-17
updated: 2026-02-27
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/epics-table.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/dependencies-table.md
dependencies: ["EPIC-006", "EPIC-007", "EPIC-008"]
blocks: ["EPIC-011", "EPIC-012", "EPIC-013", "EPIC-014"]
tags: [operations, p1, critical-path]
---

# EPIC-009: Transport Order (TO) Management

## Epic Overview

**Priority**: P1  
**Sprint**: Sprint 6-7  
**Duration**: 3 Weeks  
**Story Points**: 68 SP  
**Status**: Planned  
**Progress**: 0%

**Module Category**: Operations  
**Epic Type**: Critical Path

---

## Business Context

Transport Order (TO) Management provides essential functionality for the DFMS platform. This epic includes **10 user stories** covering key features and capabilities.

**Why This Epic Matters**:
- **Business Value**: Core transport order management epic. Enables creation, execution, and lifecycle management of transport orders. Central to all transport operations.
- **Key Benefits**:
  - Enables transport order creation from requisitions
  - Supports multiple TO execution modes (own fleet, vendor fleet)
  - Manages complete trip lifecycle
  - Handles partial deliveries and incidents
  - Provides trip closure with POD (Proof of Delivery)
- **Impact on Operations**: Blocks EPIC-011, EPIC-012, EPIC-013, EPIC-014 as these operations require transport orders. Critical path epic - central to all transport operations.

---

## Epic Dependencies

### Depends On
- **EPIC-006**: [See EPIC-006](./EPIC-006-fleet-and-vehicle-management.md) - TO needs TR + Fleet
- **EPIC-007**: [See EPIC-007](./EPIC-007-product-transfer-requisition-management.md) - TO needs TR + Fleet
- **EPIC-008**: [See EPIC-008](./EPIC-008-distribution-and-procurement-management.md) - TO needs TR + Fleet

### Blocks
- **EPIC-011**: [See EPIC-011](./EPIC-011-gate-management.md)
- **EPIC-012**: [See EPIC-012](./EPIC-012-scaling---weight-management.md)
- **EPIC-013**: [See EPIC-013](./EPIC-013-loading---unlodaing-operations.md)
- **EPIC-014**: [See EPIC-014](./EPIC-014-quality-control-and-quality-assurance-workflow.md)

### Critical Path
This epic is on the critical path: **EPIC-001 → EPIC-002 → EPIC-003 → EPIC-007 → EPIC-008 → EPIC-009 → EPIC-014**

Any delay in this epic will delay the entire project completion.

---

## User Stories

This epic includes **10 user stories**:

- [US-015](../02-stories/US-015-tr-assessment.md) - Transport Requisition (TR) Assessment by Transport Planner
- [US-016](../02-stories/US-016-fleet-availability.md) - Fleet Availability Validation
- [US-017](../02-stories/US-017-to-creation-multiple.md) - Transport Order (TO) Creation - Multiple TOs per TR
- [US-018](../02-stories/US-018-to-creation-transport-planner.md) - Transport Order (TO) Creation by Transport Planner
- [US-019](../02-stories/US-019-to-execution-vendor-direct.md) - TO Execution - Vendor Fleet (Direct Assignment)
- [US-020](../02-stories/US-020-to-execution-own-fleet.md) - TO Execution - Own Fleet (Vehicle/Driver Assignment)
- [US-021](../02-stories/US-021-trip-lifecycle.md) - Trip Lifecycle Management (12 States, Sub-states)
- [US-022](../02-stories/US-022-partial-delivery.md) - Partial Delivery Handling
- [US-023](../02-stories/US-023-incident-management.md) - Incident Management
- [US-025](../02-stories/US-025-trip-closure-pod.md) - Trip Closure with POD (Proof of Delivery)

**Note**: Operational stories (gate, scaling, loading, QC, command center) have been moved to their specialized epics (EPIC-011, EPIC-012, EPIC-013, EPIC-014, EPIC-015).

**Total**: 68 Story Points

---
---


**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/epics-table.md` (WBS - Source of Truth)
