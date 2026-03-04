---
title: Fleet & Vehicle Management
epic_id: EPIC-006
epic_name: Fleet & Vehicle Management
phase: phase-1
module_category: Operations
priority: P1
status: Planned
target_sprint: Sprint 4
duration: 3 Weeks
story_points: 29
progress: 0%
created: 2026-02-17
updated: 2026-02-27
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/epics-table.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/dependencies-table.md
dependencies: ["EPIC-001", "EPIC-003"]
blocks: ["EPIC-009"]
tags: [operations, p1, standard]
---

# EPIC-006: Fleet & Vehicle Management

## Epic Overview

**Priority**: P1  
**Sprint**: Sprint 4  
**Duration**: 3 Weeks  
**Story Points**: 29 SP  
**Status**: Planned  
**Progress**: 0%

**Module Category**: Operations  
**Epic Type**: Standard

---

## Business Context

Fleet & Vehicle Management provides essential functionality for the DFMS platform. This epic includes 7 user stories covering key features and capabilities.

**Why This Epic Matters**:
- **Business Value**: Manages fleet, vehicles, drivers, and helpers. Essential for transport order execution and fleet availability management.
- **Key Benefits**:
  - Centralizes vehicle and driver registration
  - Manages fleet availability for transport planning
  - Tracks vehicle assignments and driver profiles
  - Enables fleet-based transport order execution
- **Impact on Operations**: Blocks EPIC-009 (Transport Order Management) as TOs require fleet data. Critical for transport operations and fleet management.

---

## Epic Dependencies

### Depends On
- **EPIC-001**: [See EPIC-001](./EPIC-001-system-foundation.md) - Fleet requires master data
- **EPIC-003**: [See EPIC-003](./EPIC-003-master-data-and-configuration.md) - Fleet requires master data

### Blocks
- **EPIC-009**: [See EPIC-009](./EPIC-009-transport-order-to-management.md)

---

## User Stories

This epic includes **7 user stories**:

- [US-053](../02-stories/US-053-vehicle-registration-master-data.md) - Vehicle Master Data Management
- [US-057](../02-stories/US-057-driver-master-data.md) - Manage Driver Master Data
- [US-058](../02-stories/US-058-fuel-management.md) - Fuel Management & Tracking
- [US-059](../02-stories/US-059-trip-cost-calculation.md) - Trip Cost Calculation & Analysis
- [US-060](../02-stories/US-060-profitability-analysis.md) - Trip Profitability Analysis & Revenue Tracking
- [US-061](../02-stories/US-061-helper-profile.md) - Manage Helper Master Data
- [US-062](../02-stories/US-062-helper-assignment.md) - Helper Assignment

**Note**: QC-related stories (US-053b, US-054, US-055, US-056) have been moved to EPIC-014 (Quality Control & Quality Assurance).

**Total**: 29 Story Points

---
---


**Last Updated**: 2026-02-27  
**Source**: `source-documents/04-wbs/epics-table.md` (WBS - Source of Truth)
