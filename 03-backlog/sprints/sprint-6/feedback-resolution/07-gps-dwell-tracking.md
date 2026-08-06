---
title: Sprint 6 Feedback — GPS, Maps & Dwell Time
module: 07-gps-dwell-tracking
menu: GPS / Maps / Tracking / Dwell
parent: ./README.md
---

# GPS, Maps & Dwell Time

**Admin menu / area:** GPS / Maps / Tracking / Dwell  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-031](#fb-031--dwell-time-planned-data-actual-gate-inout-geofence-inout) | Dwell time: planned data, actual gate-in/out, geofence in/out | High | Resolved |

---

## FB-031 — Dwell time: planned data, actual gate-in/out, geofence in/out

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | GPS / trip dwell ([`dwell-time-tracking.md`](../../../../05-modules/09-tracking/dwell-time-tracking.md)); gate timestamps (GT-01/GT-02); planned milestones ([FB-006](./05-transport-orders.md#fb-006--tdo-own-fleet-planned-milestone-times-fg-four-rm-two-replace-single-eta) / [FB-008](./05-transport-orders.md#fb-008--tdo-own-fleet-role-removed-transport-planner-owns-own-fleet-to-creation-assignment-and-planned-milestone-times)) |
| **Closing Sub-tasks** | FB-031-1 — Surface planned vs actual dwell inputs (plan, gate-in/out, geofence in/out) |
| **AC Amendment** | Dwell-time visibility SHALL include **(1) Planned data** (lane-applicable planned milestone times), **(2) Actual gate-in / gate-out** timestamps, and **(3) Geofence in / out** events. Operators and reports can compare planned vs actual yard presence using these three sources together — not planned alone or GPS alone. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Ties planned milestones, gate timestamp records, and geofence entry/exit (dwell engine) into the dwell-time operational view / reporting contract. |

### Client feedback observation

Operations need dwell analysis that combines **planned** milestone times with **actual gate-in/out** and **geofence in/out**, so planned vs actual presence at the POI is visible in one place.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-031) |
|--------|----------------------|-------------------|
| Planned times | Partial / not tied to dwell view | Included in dwell-time data set |
| Gate-in / gate-out | Captured but not always shown with dwell | Included as actual yard timestamps |
| Geofence in / out | Engine events exist | Included alongside plan + gate for dwell comparison |

---
