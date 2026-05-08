---
module: 03-users
specification: Tenant Operational User & Role Management
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
sprint: Sprint 2
last_updated: 2026-04-22
related_stories: US-004, US-005, US-007, US-008, US-009, DFS-024, DFS-026, DFS-027, DFS-028
jira_epic: DFS-029
---

# Tenant Operational User & Role Management Specification

## Overview

This specification covers how a **Tenant Admin** manages their organisation's operational users and role assignments within the DFMS platform. It is written from the Tenant Admin's perspective — the day-to-day user management screens — not from the platform auth/session layer (which is in `01-foundation/user-tenant-management.md`).

The Tenant Admin is responsible for:
- Inviting operational users to the tenant (all roles below Tenant Admin)
- Assigning predefined operational roles and department scopes
- Managing user lifecycle (active, suspended, deactivated)
- Viewing and auditing user activity

**Module path**: `apps/users/`
**Django App**: `apps/users/`
**Dependencies**: `01-foundation` (auth, RBAC, invitation mechanics), `02-master-data` (POI for user's assigned location)

---

## 0. Menu Structure & Navigation

```
Tenant Admin sidebar (tenant.dfms.com/admin)
└── Users                         — list all operational users; invite; filter; bulk actions
      ├── User List
      ├── Invite User              (single invitation form — reached via "Invite user" button on User List)
      └── User Detail / Edit       (role dropdown, deactivate/reactivate, admin-assisted password reset)
```

> **Roles & Permissions are NOT managed by the Tenant Admin.**
> `Role`, `Permission`, and `Department` records live in the **public (shared) schema** and are managed exclusively via the **Platform Admin** (`admin.dfms.com`). The tenant admin only sees a read-only role dropdown when inviting or editing a user — it cannot create, edit, or delete roles.

### Admin Portal Separation

| Concern | Portal | Who | Django models |
|---------|--------|-----|---------------|
| User list, invite, deactivate, password reset | Tenant Admin (`{tenant}.dfms.com/admin`) | Tenant Admin | `User`, `UserRole`, `InvitationToken` — in tenant schema |
| Role catalog (create/edit/delete roles + permissions) | Platform Admin (`admin.dfms.com`) | Super Admin | `Role`, `Permission`, `RolePermission` — in public schema |
| Department catalog (view) | Platform Admin only | Super Admin | `DepartmentCatalog` (virtual, managed=False) |

This separation is enforced by `PlatformOnlyAdminMixin` on `RoleAdmin` and `PermissionAdmin` (hidden from all tenant admins), and `TenantOnlyAdminMixin` on `UserAdmin` (hidden from platform admin).

---

## 1. Operational Roles Reference

All roles below are **predefined system roles**. Tenant Admin assigns them during invitation — custom role creation is a Phase 2 feature.

### 1.1 Role → Department → Access Scope

| Department | Role | Functional Type | Access Scope |
|-----------|------|----------------|-------------|
| Depot / Feed Mill / Commercial | Depot Officer | Requester | Local |
| | Feed Mill Officer | Requester | Local |
| | Commercial Officer | Requester | Local |
| Procurement | Procurement Officer | Approver | Global |
| Distribution | Distribution Officer (DO) | Executor | Local |
| | Distribution Manager (DM) | Approver | Global |
| Transport | Transport Planner (TP) | Executor | Global |
| | Transport Distribution Officer (TDO) | Executor | Global |
| QA / QC | QC Inspector – Physical | Executor | Local |
| | QA Lab Technician | Executor | Local |
| Operations | Command Center Officer | Executor | Local |
| | Loading Personnel | Executor | Local |
| | Unloading Personnel | Executor | Local |
| | Driver Supervisor | Executor | Local |
| | Driver Helper | Executor | Local |

> **Drivers** and **Helpers** are also operational users invited via the same flow but their profiles are managed in `03-users/driver-user-profiles.md` and `03-users/helper-master-data.md` respectively — they have separate entity records beyond the User account.

### 1.2 Access Scope Definitions

| Scope | Data Visible | Actions Scoped To |
|-------|-------------|-------------------|
| **Local** | User's assigned POI / department only | Own POI or department records |
| **Global** | All POIs and departments within the tenant | Tenant-wide records |

---

## 2. Data Model

### 2.1 User

```typescript
User {
  user_id: UUID
  tenant_id: UUID
  email: string                        // Unique per tenant; invitation channel
  first_name: string
  last_name: string
  employee_id: string (nullable)       // Optional; set during invitation or later

  // Role & Department
  role_id: UUID                        // FK → OperationalRole
  department: string                   // Derived from role; displayed for context
  functional_role_type: enum ['Requester', 'Approver', 'Executor']  // Metadata; from role
  access_scope: enum ['Local', 'Global']  // From role definition

  // Location assignment (for Local-scoped roles)
  assigned_poi_id: UUID (nullable)     // FK → POI — required for Local-scoped roles

  // Account status
  status: enum ['Invited', 'Active', 'Suspended', 'Deactivated']
  invitation_status: enum ['sent', 'pending', 'activated', 'expired', 'cancelled']

  // Deactivation metadata
  deactivation_type: enum ['Temporary', 'Permanent'] (nullable)
  deactivation_reason: string (nullable)
  deactivation_remarks: string (nullable)
  deactivated_at: DateTime (nullable)
  deactivated_by: UUID (nullable)      // FK → User (Admin)

  // Metadata
  created_at: DateTime
  updated_at: DateTime
  last_login_at: DateTime (nullable)
}
```

### 2.2 OperationalRole (System-defined)

```typescript
OperationalRole {
  role_id: UUID
  role_name: string                    // e.g. "Distribution Manager"
  department: string                   // e.g. "Distribution"
  functional_type: enum ['Requester', 'Approver', 'Executor']
  access_scope: enum ['Local', 'Global']
  is_assignable: boolean               // Always true for operational roles; false for Super Admin
  permissions: string[]               // List of permission codes from permission catalog
}
```

---

## 3. User Invitation

### 3.1 Single User Invitation

The Tenant Admin invites a user by email. The invitation is dispatched immediately on submission.

**Invite User form fields:**

| Field | Notes |
|-------|-------|
| First Name | Required |
| Last Name | Required |
| Email | Required; unique per tenant |
| Employee ID | Optional |
| Role | Dropdown of assignable operational roles; Super Admin hidden |
| Assigned POI | Required if role has Local access scope; hidden for Global roles |

**Validation rules:**
```
Email must be unique within the tenant
Role must be a valid operational role (not Super Admin)
Assigned POI required if role.access_scope = 'Local'
Role assignment validated against tenant subscription plan limits
```

**On submit:**
```
1. User record created with status = 'Invited', invitation_status = 'sent'
2. Invitation email dispatched immediately (synchronous)
3. Email contains time-limited activation link (expires 7 days)
4. Audit log entry: action=InvitationSent, inviter, invitee email, role, timestamp
```

### 3.2 Invitation Lifecycle

```
sent → pending (user opens link) → activated (password set + T&C accepted)
                                 → expired   (7-day expiry, no action taken)
                                 → cancelled (admin cancels)
```

**Resend invitation**: Available for `sent` and `expired` invitations. 2-minute cooldown between resends.

**Cancel invitation**: Admin can cancel any `sent` or `pending` invitation. User is notified. Audit logged.

### 3.3 Bulk User Invitation (CSV)

| CSV Column | Required | Notes |
|-----------|----------|-------|
| Employee ID | Optional | |
| Email | Yes | Unique per tenant |
| First Name | Yes | |
| Last Name | Yes | |
| Role | Yes | Must match an assignable role name exactly |
| Assigned POI | Conditional | Required if role is Local-scoped |

**Behaviour:**
- Per-row validation — invalid rows reported with reason; valid rows invited
- Batch audit log entry for the bulk operation
- Error report downloadable after upload

---

## 4. User Account Activation

The activation flow is handled in `01-foundation/user-tenant-management.md`. Summary for reference:

```
User receives invitation email
  → Opens activation link
  → (If OTP type = Email) Enters OTP code
  → Sets password (complexity rules enforced)
  → Accepts Terms & Conditions
  → Account status: Invited → Active
```

Phase 1: Email invitation only. No SMS/phone invitation channel.

---

## 5. User List View

### 5.1 Columns

| Column | Notes |
|--------|-------|
| Name | First + Last name |
| Email | |
| Role | Operational role name |
| Department | From role |
| Assigned POI | For Local-scoped users |
| Status | Active / Invited / Suspended / Deactivated — badge |
| Last Login | `last_login_at` — "Never" if not yet logged in |
| Actions | View / Edit / Suspend / Deactivate |

### 5.2 Filters & Search

| Filter | Options |
|--------|---------|
| Status | Active / Invited / Suspended / Deactivated |
| Department | All departments |
| Role | All operational roles |
| Access Scope | Local / Global |
| Assigned POI | POI dropdown |
| Search | Name, email, employee ID |

### 5.3 Invitation Queue Sub-tab

A separate sub-tab within Users showing all pending invitations:

| Column | Notes |
|--------|-------|
| Email | Invitee |
| Role | Assigned role |
| Invitation Status | sent / pending / expired / cancelled |
| Invited On | Timestamp |
| Expires On | invited_at + 7 days |
| Actions | Resend / Cancel |

---

## 6. User Detail & Edit

### 6.1 Viewable Fields

All user fields. Read-only for activated users except safe-to-edit fields.

### 6.2 Editable Fields (post-activation)

| Field | Notes |
|-------|-------|
| First Name | |
| Last Name | |
| Employee ID | |
| Assigned POI | Editable for Local-scoped roles; POI dropdown |
| Role | Role change triggers audit log; sessions not immediately invalidated (takes effect on next login) |

**Restricted updates:**
- Email cannot be changed (primary identity key)
- Access Scope and Department are derived from role — not editable directly

---

## 7. Account Deactivation & Reactivation

### 7.1 Deactivation Types

| Type | Behaviour |
|------|-----------|
| **Temporary Suspension** | Account inactive; data preserved; reactivatable |
| **Permanent Deactivation** | Account permanently disabled; data archived; not reactivatable |

### 7.2 Deactivation Process

```typescript
DeactivationRequest {
  user_id: UUID
  type: 'Temporary' | 'Permanent'
  reason: enum [
    'Employment Terminated', 'Role Change', 'Security Incident',
    'Long-term Leave', 'Compliance', 'Other'
  ]
  custom_reason: string (nullable)    // Required if reason = 'Other'
  effective_date: Date                // Default: immediate (today)
  admin_remarks: string               // Required; captures context
}
```

**On deactivation:**
```
1. All active sessions terminated immediately (tokens invalidated)
2. New logins blocked
3. User excluded from all assignment dropdowns (TOs, trips, approvals)
4. Email notification sent to deactivated user
5. Audit log entry: immutable, includes all DeactivationRequest fields + admin IP
```

**Warning gate** — if user has active assignments:
```
IF user has active TOs assigned | active trips | pending approvals:
  SHOW warning modal:
    "This user has X active assignments. Deactivation will not cancel them.
     You must reassign before or after deactivation."
  Admin must enter mandatory override remarks to proceed
  Deactivation proceeds — existing assignments must be manually reassigned
```

### 7.3 Reactivation

- Only `Temporary` suspensions can be reactivated
- Permanently deactivated accounts cannot be reactivated
- Requires Admin to provide reactivation reason
- User notified by email on reactivation
- All sessions must be re-established by the user logging in fresh

### 7.4 Deactivation History View

```
Admin → User Detail → Deactivation History tab

Columns: Date | Type | Reason | Remarks | Admin | Action (Reactivate if eligible)
```

---

## 8. Password & Account Reset

Covered in `01-foundation/user-tenant-management.md` (US-008/US-005). Summary:

| Reset Type | Who triggers | Flow |
|-----------|-------------|------|
| Self-service password reset | User | "Forgot password" → email OTP → new password |
| Admin-assisted reset | Tenant Admin | Admin generates reset link → sent to user email |
| Force password reset | Tenant Admin | Admin forces; user must reset on next login |

---

## 9. User Activity & Audit Logs

### 9.1 Audit Events Logged

| Event | Logged Fields |
|-------|--------------|
| Invitation sent | Inviter, invitee email, role, timestamp |
| Invitation resent | Admin, invitee, timestamp |
| Invitation cancelled | Admin, invitee, reason, timestamp |
| Account activated | User, timestamp, IP |
| Login | User, timestamp, IP, device |
| Failed login | User, timestamp, IP, attempt count |
| Password reset | User, admin (if assisted), timestamp |
| Role changed | User, old role, new role, changed by, timestamp |
| Assigned POI changed | User, old POI, new POI, changed by, timestamp |
| Account suspended | Admin, user, type, reason, remarks, timestamp |
| Account reactivated | Admin, user, reason, timestamp |
| Account deactivated | Admin, user, type, reason, remarks, timestamp |

### 9.2 Activity Log View (per user)

```
Admin → User Detail → Activity Log tab

Columns: Timestamp | Event | Details | IP Address | Performed By
Filters: Event type, Date range
Export: CSV
```

---

## 10. Role Management — Platform Admin Only

Roles, permissions, and departments are **not managed by Tenant Admins**. They are managed exclusively by the Super Admin via the Platform Admin portal (`admin.dfms.com`).

### 10.1 Where roles live

```
public schema (shared across all tenants)
  roles               — Role catalog (role_code, role_name, department, is_active)
  permissions         — Permission codes (Module.Feature.Action format)
  role_permissions    — M2M junction: which permissions each role has
  (DepartmentCatalog) — Virtual model; renders PREDEFINED_DEPARTMENT_CHOICES; no DB table
```

### 10.2 Platform Admin screens for roles

| Screen | Access | Capability |
|--------|--------|------------|
| Role list | Super Admin only | View all roles; create / edit / delete; assign permissions inline |
| Permission list | Super Admin only | View all permission codes; filter by module |
| Department catalog | Super Admin only | View predefined department slugs (read-only virtual model) |

All three use `PlatformOnlyAdminMixin` — they return zero permissions to any non-platform request and are **completely invisible** in tenant admin sidebars.

### 10.3 How the Tenant Admin interacts with roles

The Tenant Admin sees roles only as a **dropdown** on the Invite User and User Edit forms. This dropdown is populated at runtime by querying `Role.objects.filter(is_active=True)` from the public schema via `public_schema_context()`, excluding forbidden role codes (e.g. `super_admin`, `tenant_admin`).

```python
# From apps/users/admin.py — how roles appear in tenant admin
def _role_choices():
    with public_schema_context():
        qs = Role.objects.filter(is_active=True).exclude(
            role_code__in=FORBIDDEN_INVITATION_ROLE_CODES
        ).order_by("role_name")
    return [(str(r.pk), r.role_name) for r in qs]
```

The Tenant Admin **cannot**:
- Create, rename, or delete roles
- Add or remove permissions from roles
- See the permission matrix for a role
- See the DepartmentCatalog list

### 10.4 Role seeding

Predefined operational roles are seeded via the `seed_dfms_rbac` management command (`apps/core/management/commands/seed_dfms_rbac.py`). This is a Super Admin / DevOps operation run once per environment. Role data in `apps/core/role_seed_data.py` defines all Phase 1 roles with their departments and permission assignments.

> Custom role creation via the Tenant Admin portal is a **Phase 2** feature.

---

## 11. API Endpoints

All endpoints require Tenant Admin authentication. Scoped to the authenticated tenant.

### 11.1 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/users` | List users with filters |
| `GET` | `/api/v1/users/{user_id}` | User detail |
| `PATCH` | `/api/v1/users/{user_id}` | Update safe fields (name, employee ID, assigned POI, role) |
| `POST` | `/api/v1/users/{user_id}/deactivate` | Suspend or permanently deactivate |
| `POST` | `/api/v1/users/{user_id}/reactivate` | Reactivate suspended user |
| `GET` | `/api/v1/users/{user_id}/activity-log` | User activity audit trail |
| `GET` | `/api/v1/users/{user_id}/deactivation-history` | Deactivation history |

### 11.2 Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/users/invitations` | Invite single user |
| `POST` | `/api/v1/users/invitations/bulk` | Bulk CSV invitation |
| `GET` | `/api/v1/users/invitations` | List invitations (filter by status) |
| `POST` | `/api/v1/users/invitations/{token}/resend` | Resend (2-min cooldown) |
| `DELETE` | `/api/v1/users/invitations/{id}` | Cancel invitation |

### 11.3 Roles

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/roles` | List all assignable operational roles |
| `GET` | `/api/v1/roles/{role_id}` | Role detail with full permission list |

### 11.4 Query Parameters

```
GET /api/v1/users
  ?status=Active|Invited|Suspended|Deactivated
  &role=<role_id>
  &department=<string>
  &access_scope=Local|Global
  &assigned_poi=<uuid>
  &search=<string>        # name, email, employee_id
  &page=<int>
  &per_page=<int>          # default 20
```

---

## 12. Business Rules

### 12.1 Super Admin Cannot Be Assigned

```
Tenant Admin cannot invite a user with the Super Admin role.
API returns: 403 ROLE-403-SUPER-ADMIN-RESTRICTED
Super Admin role is hidden from all role dropdowns in the Tenant Admin UI.
```

### 12.2 Assigned POI Required for Local-Scoped Roles

```
IF role.access_scope = 'Local':
  assigned_poi_id is REQUIRED on invitation and user edit
IF role.access_scope = 'Global':
  assigned_poi_id is optional (ignored for access control; may be set for display)
```

### 12.3 Role Change Behaviour

```
Admin changes a user's role:
  - Change takes effect on the user's NEXT login
  - Active sessions are NOT immediately invalidated (trade-off: low-friction for operational roles)
  - Role change audit logged with old + new role
  - If new role has different access_scope (Local → Global or vice versa), assigned_poi requirement changes accordingly
```

### 12.4 Deactivated Users Excluded from Dropdowns

```
All workflow dropdowns that reference users (TR approval, TO assignment, driver assignment, etc.)
MUST filter out users with status IN ['Suspended', 'Deactivated'].

API contract: user selection endpoints always apply:
  WHERE status = 'Active'
```

### 12.5 Tenant User Limits

```
Subscription plan enforces max_users limit.
On invitation:
  active_user_count = count(users WHERE status IN ['Invited', 'Active'])
  IF active_user_count >= tenant.max_users:
    BLOCK invitation
    RETURN 402 Payment Required:
      { "error": "User limit reached", "current": X, "limit": Y }
```

---

## 13. Unit Testing Strategy

### 13.1 Coverage Targets
- **Models / Business Logic**: 90%+
- **API / Views**: 85%+

### 13.2 Core Test Cases

**Invitation Tests**
- Invite user with valid role → invitation_status = 'sent', email dispatched
- Invite with Super Admin role → 403
- Invite with Local-scoped role without assigned_poi → 400
- Invite beyond tenant user limit → 402
- Bulk CSV: valid rows invited; invalid rows reported with per-row errors
- Resend within 2-min cooldown → 429

**Role Assignment Tests**
- All 15 operational roles are assignable via invitation
- Role permissions match permission catalog entries

**Deactivation Tests**
- Temporary suspension: user blocked from login; sessions invalidated; excluded from dropdowns
- Permanent deactivation: cannot be reactivated
- Deactivation with active assignments: warning shown; admin must provide remarks; proceeds
- Reactivation of temporarily suspended user: succeeds with reason

**Access Scope Tests**
- Local-scoped user: API only returns records from their assigned POI
- Global-scoped user: API returns all tenant records
- Role change Local → Global: access scope updated on next login

**Audit Log Tests**
- Each event type generates an immutable audit log entry with correct fields
- Activity log queryable by event type and date range

---

## 14. Integration Points

### 14.1 Upstream
- `01-foundation/authentication-security.md` — login, session, OTP
- `01-foundation/user-tenant-management.md` — invitation mechanics, activation flow, password reset
- `01-foundation/rbac.md` — role definitions, permission matrix
- `01-foundation/permission-catalog-phase1.md` — authoritative permission codes per role
- `02-master-data/poi-management.md` — POI list for assigned_poi dropdown

### 14.2 Downstream Consumers

| Module | Dependency |
|--------|-----------|
| `04-requisitions` | `requested_by`, `approved_by` on PRs and TRs resolved to active users |
| `05-transport` | `created_by`, `assigned_driver`, `assigned_tdo` on TOs/Trips |
| `06-poi-operations` | Gate operator, QC inspector, loading personnel user references |
| All modules | Deactivated user gate — filter from all assignment dropdowns |

---

## 15. Related Documentation

- **[RBAC Specification](../01-foundation/rbac.md)** — Three-tier role hierarchy, role definitions, access scope
- **[Permission Catalog Phase 1](../01-foundation/permission-catalog-phase1.md)** — Full permission matrix per role
- **[User & Tenant Management](../01-foundation/user-tenant-management.md)** — Invitation mechanics, activation, session, password reset (auth layer)
- **[Driver User Profiles](driver-user-profiles.md)** — Driver-specific profile beyond User account
- **[Helper Master Data](helper-master-data.md)** — Helper-specific profile beyond User account
- **[Sprint 2 — TUM Stories](../../../03-backlog/sprints/sprint-2/02-tenant-user-management/README.md)** — TUM-01 through TUM-05

**Related Jira Keys**:
- DFS-024 (US-005) — User Invitation & Activation
- DFS-026 (US-007) — Account Deactivation & Reactivation
- DFS-027 (US-008) — Password & Account Reset
- DFS-028 (US-009) — User Activity & Audit Logs
- DFS-029 — Tenant User Management Epic
