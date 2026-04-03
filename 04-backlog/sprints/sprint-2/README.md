---
sprint: Sprint 2
title: Master Data, User Management & POI
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 80
status: Not Started
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 2 — Master Data, User Management & POI

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`04-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 12 |
| Total Story Points | 80 |
| Status | Not Started |
| Epics | Master Data Management, Tenant User Management, POI & Geofencing |

---

## Epic: Master Data Management

> Foundational reference data required by all operational workflows (Requisitions, TOs, Gate, QC, Costing).

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [POI Management & Geofencing](03-poi-management/MDM-04-poi-management-geofencing.md) | MDM-04 | DFS-020 | 13 | Pending |
| 2 | [Product Master Data Management (CRUD)](01-master-data-management/MDM-01-product-master-data.md) | MDM-01 | DFS-017 | 13 | Pending |
| 3 | [Route, Supplier & Dealer Master Data](01-master-data-management/MDM-02-route-supplier-dealer.md) | MDM-02 | DFS-018 | 5 | Pending |
| 4 | [Vendor Master Data (Admin CRUD & Bulk Upload)](01-master-data-management/MDM-03-vendor-master-data.md) | MDM-03 | DFS-019 | 5 | Pending |
| 5 | [Vehicle Registration & Master Data](01-master-data-management/MDM-05-vehicle-master-data.md) | MDM-05 | DFS-021 | 5 | Pending |
| 6 | [Driver Master Data Management](01-master-data-management/MDM-06-driver-master-data.md) | MDM-06 | DFS-022 | 5 | Pending |
| 7 | [Helper Master Data Management](01-master-data-management/MDM-07-helper-master-data.md) | MDM-07 | DFS-023 | 3 | Pending |

**Sub-total**: 49 SP

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

## Dependency Map

```
MDM-04 (POI)
  ├── MDM-02 (Route) — depends on POI for source/dest FK
  └── MDM-05 (Vehicle) — depends on POI for assigned POI FK

MDM-03 (Vendor)
  └── MDM-06 (Driver) — vendor drivers linked to vendor profile

TUM-02 (OTP)
  ├── TUM-01 (Invitation) — uses OTP for activation
  └── TUM-04 (Password Reset) — uses OTP for verification
```

> **Recommended delivery order**: MDM-04 → MDM-01 → MDM-02, MDM-03 (parallel) → MDM-05, MDM-06, MDM-07 (parallel) → TUM stories (can run in parallel with MDM)

---

## Pending Items

### Carry-over from Sprint 1 (US-005)

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

- **MDM-04 (POI)** is the highest-priority story in this sprint as it unblocks MDM-02 (Routes), MDM-05 (Vehicles), and downstream Gate Management stories
- **MDM-01 (Product)** must complete before Sprint 3 requisition stories (US-010+)
- **TUM-01** is ~70% complete from Sprint 1 carry-over; remaining items (bulk invite, resend, expiry task) complete this story
- Jira Epic keys: `DFS-020` (Master Data), `DFS-029` (Tenant User Management)
