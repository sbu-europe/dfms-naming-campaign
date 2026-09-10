---
title: Phase 2 — 003 Vehicle Utilization Analysis
sprint: ~
phase: Phase 2
status: Planning
prd: "§6.6.7 Vehicle Utilization Analytics"
---

# 003 — Vehicle Utilization Analysis

PRD §6.6.7 for **Transport Planner**. **Trips per vehicle** = completed **Plans** in the period (a Plan is one TO or Multi-TO on the same vehicle). A vehicle **may** serve multiple TOs at once. **Active vs idle** = **serving hours vs No-TO hours** (union of TO windows; overlapping Multi-TO hours are not double-counted). Not GPS speed (that is 001). Not 002’s snapshot status cards.

Previously planned as **AD-02**.

| File | Role |
|------|------|
| [003-Vehicle Utilization Analysis.md](./003-Vehicle%20Utilization%20Analysis.md) | Story — AC, sub-tasks, DoD |
| [US-vehicle-utilization-analysis.md](./US-vehicle-utilization-analysis.md) | Companion spec — formulas, UI, APIs, tests |

**Module implementation context** (`05-modules/`) is the next step after this story is accepted.

**Phase 2 index:** [../README.md](../README.md)
