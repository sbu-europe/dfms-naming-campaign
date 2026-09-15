---
title: Phase 2 — 001 Odometer-Based Vehicle Maintenance Tracking
sprint: ~
phase: Phase 2
status: Planning
epic: Fleet & Vehicle Management — Maintenance
story_points_estimated: 8
---

# 001 — Odometer-Based Vehicle Maintenance Tracking

Remaining km from **Driver Supervisor** meter readings (GPS is not odometer-capable). Idle vs movement uses GPS speed (&lt; 3 km/h = idle).

| File | Role | TDD test cases |
|------|------|----------------|
| [FVM-01](./FVM-01-odometer-based-vehicle-maintenance-tracking.md) | Story — Odometer-Based Vehicle Maintenance Tracking (8 SP) | [FVM-01 TDD](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/FVM-01-odometer-based-vehicle-maintenance-tracking-tdd-test-cases.md) |

**Module spec:** [`05-modules/02-master-data/vehicle-master-data.md`](../../../05-modules/02-master-data/vehicle-master-data.md)

**Story AC format:** Each story uses **Given–When–Then** acceptance criteria. **Gherkin / TDD scenarios** (`AC-N.x`) live in `09-testing` (linked from each story) — not inline under AC.

**TDD test catalogs:**  
- Feature folder: [`09-testing/stories-phase-2/001-Odometer-Based Vehicle Maintenance Tracking/`](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/)  
- Master index: [`00-all-test-cases.md`](../../../09-testing/stories-phase-2/001-Odometer-Based%20Vehicle%20Maintenance%20Tracking/00-all-test-cases.md) (`FVM-01-TC##` ↔ story `AC-N.x`)

PRD §6.5.10 · SOW P2 row 104

**Stories:** FVM-01 · **Estimated:** 8 SP

**Phase 2 index:** [../README.md](../README.md)
