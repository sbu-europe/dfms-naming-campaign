# 03-users — User & Role Management

## Overview

The `03-users` module covers all user management concerns within a tenant — from the Tenant Admin managing operational users and role assignments, to the specialised profiles for Drivers and Helpers who have entity records beyond their User account.

**PRD Sections**: 6.2 (User Management), 6.3.2 (Driver), 6.3.3 (Helper)
**Phase**: Phase 1 (Critical)
**Sprint Coverage**: Sprint 2
**Dependencies**: `01-foundation` (auth, RBAC, invitation mechanics), `02-master-data` (POI for user location assignment)
**Django App**: `apps/users/`

---

## Module Contents

| File | Description | Sprint | Related Stories |
|------|-------------|--------|-----------------|
| [staff-invite-login-password-channels.md](staff-invite-login-password-channels.md) | **Channel overview** — staff email vs phone invitation, admin login (`+88` + 11-digit local), forgot-password single identifier field, SMS gating | Sprint 2+ | US-005, US-008 · [CR-002](../../11-change-requests/CR-002-staff-phone-invite-login-password.md) |
| [mandatory-onboarding-otp.md](mandatory-onboarding-otp.md) | **Draft spec (pre-implementation)** — makes onboarding OTP unconditional (independent of `otp_type`) for all invitations; single-file change to `invitation_service.py` only; `otp_type` and login 2FA untouched | Sprint 8 | US-005 · [CR-003](../../11-change-requests/CR-003-mandatory-onboarding-otp.md) |
| [optional-last-name-fb002.md](optional-last-name-fb002.md) | **Sprint 8 FB-002** — User & Driver `last_name` optional on invite, create, change, activation, and bulk import; first name stays required | Sprint 8 | US-005, US-057 · [FB-002](../../03-backlog/phase-1/sprints/sprint-8/feedback-resolution.md#fb-002--user--driver--last_name-optional) |
| [tenant-user-management.md](tenant-user-management.md) | Tenant Admin's user & role management — invite users, assign operational roles, manage user lifecycle (active/suspended/deactivated), roles & permissions view, audit trail, deactivation with session termination | Sprint 2 | US-004, US-005, US-007, US-008, US-009 |
| [multi-role-assignment-implementation-plan.md](multi-role-assignment-implementation-plan.md) | **Sprint 10 TUM-06** — multiple operational roles on one user; Select Role (working role, no permission union); exclusive admin/driver/helper targets | Sprint 10 | TUM-06 |
| [driver-user-profiles.md](driver-user-profiles.md) | Driver entity beyond User account — compliance documents, license validity, state tracking; `/api/v1/drivers`; linked User account with Driver role | Sprint 2 | US-004, US-057 |
| [helper-master-data.md](helper-master-data.md) | Helper entity model — optional `user_id` FK to User, availability state machine, trip assignment, lifecycle | Sprint 2 | US-061 |

---

## Menu Structure

```
Tenant Admin sidebar ({tenant}.dfms.com/admin)
└── Users                            — list; invite; filter; bulk deactivate/reactivate
      ├── User List                   — email, name, role, department, status, last login
      ├── Invite User                 — reached via "Invite user" button on User List
      └── User Detail / Edit          — role multi-select (TUM-06), deactivate/reactivate, password reset

Platform Admin sidebar (admin.dfms.com) — Super Admin only
└── Core
      ├── Roles                       — create / edit / delete roles; assign permissions inline
      ├── Permissions                 — view / manage permission codes (Module.Feature.Action)
      └── Departments                 — view predefined department slugs (read-only)
```

> The Tenant Admin has **no** Roles or Permissions screen. Role management is a **Platform Admin** (Super Admin) concern only.

---

## Operational Roles Quick Reference

| Department | Role | Access Scope |
|-----------|------|-------------|
| Depot / Feed Mill / Commercial | Depot Officer, Feed Mill Officer, Commercial Officer | Local |
| Procurement | Procurement Officer | Global |
| Distribution | Distribution Officer, Distribution Manager | Local / Global |
| Transport | Transport Planner, TDO | Global |
| QA / QC | QC Inspector – Physical, QA Lab Technician | Local |
| Operations | Command Center Officer, Loading/Unloading Personnel, Driver Supervisor, Driver Helper | Local |

> Full role definitions and permission matrix: [01-foundation/rbac.md](../01-foundation/rbac.md) and [01-foundation/permission-catalog-phase1.md](../01-foundation/permission-catalog-phase1.md)

---

## Dependencies

### Upstream
- `01-foundation`: Authentication, RBAC role definitions, invitation/activation mechanics, permission catalog
- `02-master-data`: POI list for `assigned_poi` dropdown (Local-scoped roles)

### Downstream
- `04-requisitions`: `requested_by`, `approved_by` on PRs and TRs
- `05-transport`: `created_by`, TDO and driver assignment on TOs/Trips
- `06-poi-operations`: Gate operator, QC inspector, loading personnel references
- All modules: Deactivated user exclusion from all assignment dropdowns

---

**Last Updated**: 2026-09-22
**Previous Module**: [02-master-data/](../02-master-data/README.md) — Master Data Management
**Next Module**: [04-requisitions/](../04-requisitions/README.md) — Requisition & Distribution Management
