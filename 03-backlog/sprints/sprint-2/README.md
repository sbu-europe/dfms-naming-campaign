---
sprint: Sprint 2
title: Master Data, User Management & Vehicle Tracking
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 78
status: Not Started
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 2 — Master Data, User Management & Vehicle Tracking

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`03-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 12 |
| Total Story Points | 78 |
| Status | Not Started |
| Epics | Master Data Management, Tenant User Management, Vehicle Tracking & Geofencing |

---

## Epic: Master Data Management

> Foundational reference data required by all operational workflows (Requisitions, TOs, Gate, QC, Costing).

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [POI Setup & Management](01-master-data-management/MDM-04-poi-management.md) | MDM-04 | DFS-020 | 8 | Pending |
| 2 | [Product Master Data Management (CRUD)](01-master-data-management/MDM-01-product-master-data.md) | MDM-01 | DFS-017 | 13 | Pending |
| 3 | [Route, Supplier & Dealer Master Data](01-master-data-management/MDM-02-route-supplier-dealer.md) | MDM-02 | DFS-018 | 5 | Pending |
| 4 | [Vendor Master Data (Admin CRUD & Bulk Upload)](01-master-data-management/MDM-03-vendor-master-data.md) | MDM-03 | DFS-019 | 5 | Pending |
| 5 | [Vehicle Registration & Master Data](01-master-data-management/MDM-05-vehicle-master-data.md) | MDM-05 | DFS-021 | 5 | Pending |
| 6 | [Helper Master Data Management](01-master-data-management/MDM-07-helper-master-data.md) | MDM-07 | DFS-023 | 3 | Pending |

**Sub-total**: 39 SP

> **US-057 (Driver)** — tracked in [`stories/US-057-driver-master-data.md`](../../stories/US-057-driver-master-data.md) and [`05-modules/03-users/driver-user-profiles.md`](../../../05-modules/03-users/driver-user-profiles.md); not under the master data MDM backlog folder.

---

## Epic: Tenant User Management

> User lifecycle management within a tenant — invitation, activation, deactivation, password reset, and audit logging.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [User Invitation & Activation](02-tenant-user-management/TUM-01-user-invitation-activation.md) | TUM-01 | DFS-024 | 5 | In Progress (~70%) |
| 2 | [OTP Verification System](02-tenant-user-management/TUM-02-otp-verification.md) | TUM-02 | DFS-025 | 5 | Pending |
| 3 | [Account Deactivation & Reactivation](02-tenant-user-management/TUM-03-account-deactivation-reactivation.md) | TUM-03 | DFS-026 | 5 | Pending |
| 4 | [Password & Account Reset](02-tenant-user-management/TUM-04-password-account-reset.md) | TUM-04 | DFS-027 | 5 | Pending |
| 5 | [User Activity & Audit Logs](02-tenant-user-management/TUM-05-user-activity-audit-logs.md) | TUM-05 | DFS-028 | 8 | Pending |

**Sub-total**: 28 SP

---

## Epic: Vehicle Tracking & Geofencing

> Runtime GPS event processing — geofence boundary evaluation, vehicle arrival/departure detection, and dwell time tracking.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Geofencing Engine — Arrival & Departure Detection](03-vehicle-tracking-geofencing/VTG-01-geofencing-arrival-departure.md) | VTG-01 | DFS-031 | 8 | Pending |

> More stories (live GPS map, trip timeline integration, dwell time reporting) planned for later sprints.

**Sub-total**: 8 SP (Sprint 2 scope) + 3 SP pending carry-over (TUM-01) = **78 SP total**

---

## Dependency Map

```
MDM-04 (POI)
  ├── MDM-02 (Route) ............. depends on POI for source/dest FK
  ├── MDM-05 (Vehicle) ........... depends on POI for assigned POI FK
  └── VTG-01 (Geofencing) ........ reads geofence_radius_meters from POI

MDM-03 (Vendor)
  └── US-057 (Driver) ............ vendor drivers linked to vendor profile; see driver-user-profiles.md

TUM-02 (OTP)
  ├── TUM-01 (Invitation) ........ uses OTP for activation
  └── TUM-04 (Password Reset) .... uses OTP for verification

VTG-01 (Geofencing Engine)
  ├── MDM-04 (POI) ............... reads POI coords + radius
  └── MDM-05 (Vehicle) ........... reads vehicle identity + GPS tracker ID
```

> **Recommended delivery order within sprint**:
> 1. MDM-04 (POI) — unblocks Routes, Vehicles, Geofencing engine
> 2. MDM-01 (Product) — must complete before Sprint 3 requisition stories
> 3. MDM-02, MDM-03 in parallel after MDM-04
> 4. MDM-05, MDM-07 in parallel after MDM-04 (US-057 Driver in parallel per dependency on TUM/identity)
> 5. VTG-01 after MDM-04 + MDM-05
> 6. TUM stories can run in parallel with all MDM stories

---

## Pending Items

### Carry-over from Sprint 1 (TUM-01 / US-005 ~70% done)

| # | Item | Story | Priority | Status |
|---|------|-------|----------|--------|
| 1 | Bulk user invitation via CSV | [TUM-01](02-tenant-user-management/TUM-01-user-invitation-activation.md) | High | Pending |
| 2 | Resend invitation endpoint (platform admin) | [TUM-01](02-tenant-user-management/TUM-01-user-invitation-activation.md) | High | Pending |
| 3 | Invitation expiry cleanup task (Celery beat) | [TUM-01](02-tenant-user-management/TUM-01-user-invitation-activation.md) | Medium | Pending |

---

## Demo Feedback

> No demo feedback recorded for Sprint 2 yet.

---

## Notes

- **MDM-04 (POI)** is the highest-priority story — unblocks Routes, Vehicles, and the Geofencing engine
- **VTG-01** covers only the geofencing runtime engine; POI CRUD and geofence radius configuration live in MDM-04
- **MDM-01 (Product)** must complete before Sprint 3 requisition stories (US-010+)
- **TUM-01** is ~70% complete from Sprint 1 carry-over; 3 remaining sub-tasks (bulk invite, resend, expiry task) close it out
- Jira Epics: `DFS-030` (Master Data Management), `DFS-029` (Tenant User Management), `DFS-032` (Vehicle Tracking & Geofencing)
