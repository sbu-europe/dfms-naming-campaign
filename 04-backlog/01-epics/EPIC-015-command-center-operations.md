---
title: Command Center Operations
epic_id: EPIC-015
epic_name: Command Center Operations
phase: phase-1
module_category: Monitoring
priority: P2
status: Planned
target_sprint: Sprint 11
duration: 2 Weeks
story_points: 18
progress: 0%
created: 2026-02-17
updated: 2026-02-27
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/epics-table.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/dependencies-table.md
dependencies: ["EPIC-009", "EPIC-014"]
blocks: []
tags: [monitoring, p2, standard]
---

# EPIC-015: Command Center Operations

## Epic Overview

**Priority**: P2  
**Sprint**: Sprint 11  
**Duration**: 2 Weeks  
**Story Points**: 18 SP  
**Status**: Planned  
**Progress**: 0%

**Module Category**: Monitoring  
**Epic Type**: Standard

---

## Business Context

Command Center Operations provides essential functionality for the DFMS platform. This epic includes 5 user stories covering key features and capabilities.

**Why This Epic Matters**:
- **Business Value**: Provides command center operations for centralized monitoring and vehicle assignment. Enables efficient operational coordination.
- **Key Benefits**:
  - Centralizes vehicle queue monitoring
  - Enables vehicle assignment to loading points
  - Provides waiting serial management
  - Sends alerts to operational teams
- **Impact on Operations**: No blocking - enables operational efficiency but not critical path. Important for operational coordination and efficiency.

---

## Epic Dependencies

### Depends On
- **EPIC-009**: [See EPIC-009](./EPIC-009-transport-order-to-management.md) - Dashboard monitors ops
- **EPIC-014**: [See EPIC-014](./EPIC-014-quality-control-and-quality-assurance-workflow.md) - Dashboard monitors ops

### Blocks
- **None** - This epic does not block other epics

---

## User Stories

This epic includes **5 user stories**:

| [US-026](../02-stories/US-026-realtime-map-dashboard.md) | Real-time Map Dashboard (Command Center) |
| [US-071](../02-stories/US-071-view-all-waiting-vehicles.md) | View All Waiting Vehicles |
| [US-072](../02-stories/US-072-assign-loading-unloading-point.md) | Assign Loading/Unloading Point |
| [US-073](../02-stories/US-073-assignment-alert.md) | Assignment Alert |
| [US-074](../02-stories/US-074-assign-waiting-serial.md) | Assign Waiting Serial |

**Note**: Real-time map dashboard story (US-026) has been consolidated from EPIC-007 (Product Transfer Requisition Management).

**Total**: 18 Story Points

---
---


**Last Updated**: 2026-02-27  
**Source**: `source-documents/04-wbs/epics-table.md` (WBS - Source of Truth)
