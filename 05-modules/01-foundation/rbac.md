---
module: 01-foundation
specification: Role-Based Access Control (RBAC)
version: 1.0
phase: Phase 1
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: 6.1.4, 6.1.5, 6.1.6
last_updated: 2026-09-22
related_stories: US-004, TUM-06
---

# Role-Based Access Control (RBAC) Specification

## Overview

The DFMS platform implements a comprehensive Role-Based Access Control (RBAC) system designed for multi-tenant SaaS environments with complex organizational hierarchies. The RBAC system provides hierarchical role structures, granular permission management, and strict tenant isolation to ensure users can only access features and data appropriate to their organizational role and department.

The system supports both predefined operational roles (for standardized workflows) and custom roles (via Dynamic Role Builder in Phase 2) to accommodate diverse organizational structures while maintaining security and auditability.

**Key Acceptance Criteria**:
- **AC-1**: System SHALL allow Tenant Admins to assign operational roles within their departments
- **AC-2**: Super Admin controls global configurations across all tenants

---

## 1. Role Hierarchy Architecture

### 1.1 Three-Tier Role Structure

The RBAC system implements a three-tier hierarchical structure:

```
┌──────────────────────────────────────────────────────────────┐
│ Tier 1: Super Admin                                         │
│ (Platform-level, cross-tenant)                              │
│ Example: Brainstation 23 (platform provider)                │
│ Created: Manually (database seed / CLI)                     │
│ Manages: Tenant Admins                                      │
└──────────────────────────────────────────────────────────────┘
              ↓ creates & manages
┌──────────────────────────────────────────────────────────────┐
│ Tier 2: Tenant Admin                                        │
│ (Organization-level, single tenant)                         │
│ Example: Nourish Poultry (client organization)              │
│ Created: By Super Admin                                     │
│ Manages: Operational Users                                  │
└──────────────────────────────────────────────────────────────┘
              ↓ creates & manages
┌──────────────────────────────────────────────────────────────┐
│ Tier 3: Operational User                                    │
│ (Task-level, day-to-day execution)                          │
│ Examples: Command Center Officer, Loading Person,           │
│           Unloading Person, Driver Supervisor, Driver Helper │
│ Created: By Tenant Admin                                    │
│ Manages: Nothing (execution-only)                           │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Management Chain

```
Super Admin (Brainstation 23)
 └─ creates → Tenant Admin (Nourish)
               ├─ creates → Operational Users (Depot / Feed Mill / Commercial)
               │             └─ Depot Officer, Feed Mill Officer, Commercial Officer
               ├─ creates → Operational Users (Procurement)
               │             └─ Procurement Officer
               ├─ creates → Operational Users (Distribution)
               │             └─ Distribution Officer, Distribution Manager
               ├─ creates → Operational Users (Transport)
               │             └─ Transport Planner, Transport Distribution Officer
               ├─ creates → Operational Users (QA / QC)
               │             └─ QC Inspector – Physical, QA Lab Technician
               └─ creates → Operational Users (Operations)
                             └─ Command Center Officer, Loading Personnel,
                                Unloading Personnel, Driver Supervisor, Driver Helper
```

### 1.3 Tier 1: Super Admin

- **Scope**: Cross-tenant, platform-wide access
- **Creation**: Manually via database seed or CLI (not through UI registration)
- **Example**: Brainstation 23 (the platform provider company)
- **Capabilities**:
  - Create, suspend, and manage Tenant Admins
  - Control global configurations across all tenants (AC-2)
  - Control subscription plans and billing
  - Access all tenant data (for support/compliance)
  - Monitor platform health and usage
  - Manage system-wide settings and feature flags
- **Restrictions**: Cannot be created through the UI; no self-registration
- **Typical Users**: Platform provider team (Brainstation 23 staff)
- **Authentication**: Super Admin login on the platform admin portal (`admin.dfms.com`) **MUST use 2FA** (OTP or authenticator app). Given cross-tenant, platform-wide access, this is the most sensitive account on the platform and is subject to the same MFA requirement as Tenant Admins. See US-002.

### 1.4 Tier 2: Tenant Admin

- **Scope**: Single tenant, organization-wide access
- **Creation**: Created by Super Admin during tenant onboarding
- **Example**: Nourish Poultry admin user
- **Capabilities**:
  - Manage all users within the tenant (Operational Users)
  - Configure master data (POIs, products, vehicles, vendors)
  - Access all modules and features per subscription tier
  - View organization-wide reports and analytics
  - Configure tenant-specific settings (business rules, workflows)
  - Assign operational roles (department-scoped) to users
- **Restrictions**: Cannot access other tenants' data; cannot create Super Admins
- **Typical Users**: Organization IT admin, System administrator, Operations Head

### 1.5 Departments and their operational roles

| Department | Operational Roles | Default Functional Role |
|-----------|-------------------|----------------------|
| **Depot / Feed Mill / Commercial** | Depot Officer, Feed Mill Officer, Commercial Officer | Requester |
| **Procurement** | Procurement Officer | Approver |
| **Distribution** | Distribution Officer (DO), Distribution Manager (DM) | DM = Approver |
| **Transport** | Transport Planner (TP), Transport Distribution Officer (TDO) | Executor |
| **QA / QC** | QC Inspector – Physical, QA Lab Technician | Executor |
| **Operations** | Command Center Officer, Unloading Personnel, Loading Personnel, Driver Supervisor, Driver Helper | Executor |

**Nominated Vendors** are external users managed separately through the Vendor Portal (see Vendor Management module).

### 1.6 Tier 3: Operational User

Operational users perform day-to-day execution and **cannot manage users or system configurations**.

**Depot / Feed Mill / Commercial**:
- Depot Officer – Create FG Transfer Requests (Requester)
- Feed Mill Officer – Create FG Transfer Requests (Requester)
- Commercial Officer – Create RM Transfer Requests from Port (Requester)

**Procurement**:
- Procurement Officer – Approve Port TRs, distribution breakdown (Approver)

**Distribution**:
- Distribution Officer (DO) – Create Transport Requisitions (TR)
- Distribution Manager (DM) – Approve TRs, validate capacity (Approver)

**Transport**:
- Transport Planner (TP) – Create TOs, assign fleet (Own/Vendor), manage trips
- Transport Distribution Officer (TDO) – Vehicle/driver/helper assignment, ETA management

**Quality Assurance / Quality Control (QA / QC)**:
- QC Inspector – Physical – Physical QC checks, sampling, approval
- QA Lab Technician – Lab testing, update test reports

**Operations**:
- Command Center Officer – Assign loading/unloading lines, manage bay queues
- Unloading Personnel – Log unloading start/end, quantity verification
- Loading Personnel – Log loading start/end, quantity, seal number
- Driver Supervisor – Driver availability, handover checklist, attendance
- Driver Helper – Assist driver during loading/unloading

**Nominated Vendors** (External):
- Vendor Admin – Bidding, vehicle info, invoice submission via Vendor Portal

### 1.7 Functional Role Types (Metadata Only)

Functional Role Type (Requester / Approver / Executor) is **role metadata** used for UI display, documentation, and filtering. It is **not** an independent runtime permission gate.

**Permission enforcement relies solely on the Role → Permission matrix (permission catalog) and Access Scope.**

| Functional Type | Meaning (metadata) | Typical Role Examples |
|----------------|-------------------|----------------------|
| **Requester** | Role primarily creates/initiates records | Depot Officer, Feed Mill Officer, Commercial Officer |
| **Approver** | Role primarily approves or rejects records | Procurement Officer, Distribution Manager |
| **Executor** | Role primarily executes tasks assigned to them | Transport Planner, TDO, Loading Personnel, Drivers |

**Notes**:
- Functional Type is a fixed attribute on the role definition — it is not overridden per user.
- Self-approval prevention is a **business rule** (`requester_id ≠ current_user_id`), not a permission code. See Section 8.1.
- The Permission Catalog rows (Role → Permission) are the authoritative source of what each role may do.

### 1.8 Access Scope Levels

Each operational role is assigned one of two access scope levels that determine the breadth of data visibility and action:

| Access Scope | Description | Data Access |
|-------------|-------------|-------------|
| **Global Access** | Role can access data and actions across all locations within the tenant | All departments, POIs, depots, feed mills, and operational units |
| **Local Access** | Role can access data only within assigned department, POI, depot, feed mill, or operational unit | Restricted to the user's assigned location |

**Operational Roles with Access Scope:**

| Department | Role | Functional Type | Access Scope |
|------------|------|-----------------|-------------|
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

**Administrative Roles with Access Scope:**

| Role | Access Scope | Description |
|------|-------------|-------------|
| Super Admin | System-Wide | Platform-level access across all tenants |
| Tenant Admin | Global | Full access within assigned tenant |

**Access Scope Enforcement:**
- **Local roles**: Row-level security filters records to the user's assigned location. API middleware validates location context on every request.
- **Global roles**: Can access records across all locations within the tenant. No location-based row-level filtering applied.
- **Permission calculation**: The system combines `Role + Access Scope` to determine effective permissions. The Role → Permission matrix defines *what* a user can do; Access Scope controls *which records* they can act on. Functional Type is metadata only and is not evaluated at runtime.

---

## 2. Permission Model

### 2.1 Permission Structure

Permissions are organized hierarchically:

```
Module → Feature → Action
```

**Example**:
```
Fleet Management → Vehicle Registration → Create
Fleet Management → Vehicle Registration → Read
Fleet Management → Vehicle Registration → Update
Fleet Management → Vehicle Registration → Delete
```

### 2.2 Module-Level Permissions

**System Modules**:
- User Management
- Role Management
- Master Data Configuration
- Product Requisition Management
- Transport Requisition Management
- Transport Order Management
- Trip Management
- Fleet Management
- Vendor Management
- Gate Management
- Scaling Management
- Command Center Operations
- QC Workflow
- Loading/Unloading Operations
- Reporting & Analytics

**Permission Actions** (CRUD + Custom):
- **Create**: Create new records
- **Read**: View records
- **Update**: Modify existing records
- **Delete**: Remove records (usually soft delete)
- **Approve**: Approve requisitions/requests
- **Assign**: Assign resources (vehicles, drivers)
- **Execute**: Execute operational tasks
- **Export**: Export data/reports

### 2.3 Permission Matrix Example

Permission codes follow the `Module.Feature.Action` format from the [Permission Catalog](permission-catalog-phase1.md).

```typescript
// Transport Planner — permissions per catalog
Role: "Transport Planner" {
  permissions: [
    "Requisition.TR.Read",           // view TR list (submitted by Distribution Officers)
    "Requisition.TR.Update",         // update number of vehicles, vehicle type, C&F approval
    "Transport.TO.Create",           // create Transport Orders
    "Transport.TO.Read",
    "Transport.TO.Update",
    "Transport.TO.Cancel",
    "Transport.TO.Assign",           // assign vehicles/drivers to TOs
    "Transport.Trip.Read",
    "Transport.Map.Read",            // Transport Dashboard map
    "Vendor.Bidding.Read",           // view bids
    "Vendor.Bidding.Approve",        // accept/reject bids
    "Fleet.Assignment.Create",       // fleet planning
    "Fleet.Assignment.Read",
    "Reports.Report.Read",           // Transport & Trip / Vendor / Fleet Performance reports
    "Reports.Report.Export"
  ],
  access_scope: "Global",
  functional_type: "Executor"        // metadata only
}
```

---

## 3. Role Assignment & Management

### 3.1 User-Role Assignment

**Assignment Flow**:
```
1. User invitation initiated by Tenant Super Admin or Tenant Admin
2. Admin selects one or more operational roles (multi-select, grouped by department; Super Admin hidden)
3. System validates the set (exclusive targets, assigner policy, at least one POI per local role)
4. User activates account — all selected roles are applied, and each local role receives the invite’s POI set
5. At runtime the user selects one working role (Select Role), then one working POI from **that role’s** assigned sites (Working site, hidden when the role has one site)
6. Permissions, menus, and landing follow that working role only (no union); queues follow the working POI
```

**Constraints** (TUM-06 — see [multi-role-assignment-implementation-plan.md](../03-users/multi-role-assignment-implementation-plan.md)):
- A user may hold **multiple operational** roles; there is no fixed cap. Duplicate `(user, role)` is rejected.
- **No permission union.** The user operates as the selected **working role**. Menus, queues, widgets, and API/admin checks use that role only.
- **Exclusive targets** (cannot combine with any other role): Tenant Super Admin, Tenant Admin, Driver, Helper (`driver_helper`). Super Admin is never assignable via invite/edit/CSV.
- Tenant Super Admin and Tenant Admin may **assign** multiple operational roles to others; they themselves hold **only one** role. Only Tenant Super Admin may grant Tenant Admin (alone).
- Operational users cannot assign roles.
- Each `UserRole` stores that role’s catalog department. Invite/edit is **not** locked to a single department (Gateman + Scaling Operator is a valid cross-department pair).
- Location assignment (`UserOperationalPOI`) is required **per POI-scoped role** (**at least one** site, no cap). Each local role has its own POI set (sets may overlap). Duplicate `(user, poi, role)` is rejected. Cleared for that role only when the role is global. Working site lists only the working role’s assigned POIs.
- Access scope (Global / Local) of the **working role** determines data row visibility (see Section 1.8).
- Self-approval prevention still applies in the working role (`requester_id ≠ current_user_id`). Switching role does not allow approving one’s own request.

### 3.1.1 Predefined Departments & Role Department Mapping

- Each **Operational Role** belongs to exactly one **Department** (predefined; not free-text).
- When creating/configuring a role (Phase 2 custom roles) the Admin MUST select **Department** from a dropdown of predefined departments.
- In user-facing assignment UIs (invite user / assign role), roles are listed in a **multi-select grouped by department**. Selecting roles from more than one department is allowed for operational dual-hats.
- Each assigned role MUST still belong to its catalog department (`UserRole.department` matches `Role.department`). The API MUST reject unknown / inactive codes and exclusive-set violations (even if UI is bypassed).

### 3.2 Self-Approval Prevention (Business Rule)

Self-approval prevention is enforced as a business rule — not as a functional type gate.

**Self-Approval Prevention Rule**:
```
IF user has permission 'Requisition.Approve' (or equivalent) AND
   requisition.requester_id == user.id:
    DENY approval action
    SHOW "Cannot approve own requisition"
```

This rule applies regardless of the role's Functional Type metadata. See Section 8.1 for the full implementation.

---

## 4. Permission Enforcement

### 4.1 Three-Layer Enforcement

The system enforces permissions at three layers for defense in depth:

**Layer 1: UI-Level Enforcement**
```typescript
// Menu visibility
IF !user.hasPermission('Fleet.Vehicle.Read'):
    hide_menu_item('Fleet Management → Vehicles')

// Button/action visibility
IF !user.hasPermission('TransportOrder.Approve'):
    disable_button('Approve TO')
```

> **UI menu mapping**: UI navigation items (menu/sub-menu) must map to stable permission codes from the Permission Catalog. The Jira menu matrix (captured in US-004) is treated as a UI-level projection of permissions — the UI must not implement “role-name checks”; it must implement permission checks (role → permissions → UI).

**Layer 2: API-Level Enforcement**
```typescript
@RequirePermission('TransportOrder.Create')
POST /api/v1/transport-orders {
    // Only executed if user has permission
}

// Middleware validates token permissions
```

**Layer 3: Database-Level Enforcement**
```sql
-- Row-Level Security (Postgres example)
CREATE POLICY tenant_isolation ON transport_orders
    USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- Permission-based views
CREATE VIEW fleet_read_only AS
    SELECT * FROM vehicles
    WHERE tenant_id = current_tenant_id()
    AND (has_permission('Fleet.Vehicle.Read'));
```

### 4.2 Permission Check Algorithm

```typescript
function hasPermission(user: User, permission: string): boolean {
    // 1. Load user's role permissions (cached)
    const rolePermissions = getRole(user.role_id).permissions;
    
    // 2. Check if permission exists
    if (rolePermissions.includes(permission)) {
        return true;
    }
    
    // 3. Check hierarchical permissions
    // Example: "Fleet.*" grants all Fleet permissions
    const permissionParts = permission.split('.');
    const wildcardPermission = permissionParts.slice(0, -1).join('.') + '.*';
    
    if (rolePermissions.includes(wildcardPermission)) {
        return true;
    }
    
    // 4. Check super-admin
    if (user.role.name === 'Super Admin') {
        return true;
    }
    
    return false;
}
```

---

## 5. Dynamic Role Builder (Phase 2)

### 5.1 Custom Role Creation

Tenant Admins can create custom roles beyond predefined system roles:

**Creation Flow**:
```
1. Admin navigates to Role Management
2. Clicks "Create Custom Role"
3. Enters role name (unique per tenant)
4. Selects Department (predefined dropdown)
5. Selects Access Scope (Global / Local)
6. Selects Functional Type metadata label (Requester / Approver / Executor — display only)
7. Selects permissions from permission matrix
8. System validates and saves role
9. Role immediately available for user assignment
```

**Permission Matrix UI** (conceptual):
```
┌─────────────────────────────────────────────────────┐
│ Create Custom Role: "Warehouse Manager"            │
├─────────────────────────────────────────────────────┤
│ Module               | Create | Read | Update | Delete |
│──────────────────────────────────────────────────────│
│ Master Data          |   ✓    |  ✓   |   ✓    |   ✗   │
│ Product Requisition  |   ✓    |  ✓   |   ✓    |   ✗   │
│ Transport Req (TR)   |   ✗    |  ✓   |   ✗    |   ✗   │
│ Fleet Management     |   ✗    |  ✓   |   ✗    |   ✗   │
│ Reporting            |   ✗    |  ✓   |   ✗    |   ✗   │
│──────────────────────────────────────────────────────│
│ [Clone Existing Role] [Save Role] [Cancel]          │
└─────────────────────────────────────────────────────┘
```

### 5.2 Role Management Rules

**Custom Role Constraints**:
- Role name must be unique per tenant
- Cannot modify predefined system roles
- Can only edit custom roles
- Cannot delete role if users are assigned
- Can deactivate role (users retain permissions until reassigned)

**Clone Functionality**:
```typescript
// Clone existing role's permissions
function cloneRole(sourceRoleId: UUID): CustomRole {
    const sourceRole = getRole(sourceRoleId);
    return {
        name: `${sourceRole.name} (Copy)`,
        permissions: [...sourceRole.permissions], // Deep copy
        department: sourceRole.department,
        access_scope: sourceRole.access_scope,
        functional_type: sourceRole.functional_type,  // metadata label, copied for display
        is_custom: true
    };
}
```

---

## 6. Multi-Tenant Isolation

### 6.1 Tenant-Scoped Roles

All roles (predefined and custom) are scoped to tenant level:

**Role Entity Structure**:
```typescript
Role {
  role_id: UUID
  role_name: string
  tenant_id: UUID | null        // null for system roles, UUID for custom roles
  is_system_role: boolean       // true for predefined roles
  permissions: JSON             // Array of permission strings — the authoritative permission grant
  department: Enum (Predefined Department) | null  // required for Operational roles; null for Administrative roles
  access_scope: enum ['Global', 'Local']  // See Section 1.8 — enforced at runtime
  functional_type: enum ['Requester', 'Approver', 'Executor'] | null  // metadata only — not a runtime permission gate
  created_by: UUID
  created_at: DateTime
  status: enum ['Active', 'Inactive']
}
```

**Database Schema Placement:**

The DFMS platform uses `django-tenants` with a schema-per-tenant architecture (see [Admin Schema Access Control](admin-schema-access-control.md)). Role and Permission models follow a split-schema strategy:

| Model | Schema | Rationale |
|-------|--------|-----------|
| `Role` (predefined system roles) | `public` (shared) | Predefined roles are identical across all tenants. Stored once in the shared schema and referenced by all tenant schemas. Managed via `PlatformOnlyAdminMixin` in Django admin. |
| `Permission` (permission definitions) | `public` (shared) | Permission codes are system-wide constants (e.g., `Fleet.Vehicle.Create`). Not tenant-specific. |
| `Role` (custom roles, Phase 2) | Tenant schema | Custom roles created via Dynamic Role Builder are tenant-specific. Stored in the tenant's own schema with `tenant_id` set. |
| `UserRole` (user-role assignment) | Tenant schema | User-to-role mappings are tenant-specific. Includes `department_id`, `poi_id` for Local access scope enforcement. |

This means:
- `tenant_id = null` on a Role indicates a **system role** in the shared `public` schema
- `tenant_id = <UUID>` on a Role indicates a **custom role** in a tenant schema (Phase 2)
- The `is_system_role` boolean distinguishes predefined from custom roles
- PostgreSQL's `search_path` mechanism ensures tenant schemas cannot access other tenants' custom roles

### 6.2 Tenant Context Validation

**Every permission check validates tenant context**:

```typescript
function checkPermission(user: User, resource: any, permission: string): boolean {
    // 1. Validate tenant match
    if (user.tenant_id !== resource.tenant_id) {
        throw new Error('Cross-tenant access denied');
    }
    
    // 2. Check permission
    if (!user.hasPermission(permission)) {
        throw new Error('Insufficient permissions');
    }
    
    // 3. Log access attempt
    auditLog({
        user_id: user.user_id,
        action: permission,
        resource_type: resource.constructor.name,
        resource_id: resource.id,
        tenant_id: user.tenant_id,
        granted: true
    });
    
    return true;
}
```

### 6.3 Cross-Tenant Prevention

**Enforced at multiple levels**:

1. **Application Level**:
   - All queries automatically filter by `tenant_id = current_user.tenant_id`
   - API endpoints validate tenant context before processing

2. **Database Level**:
   - Row-Level Security policies enforce tenant isolation
   - Foreign keys include tenant_id for referential integrity within tenant

3. **UI Level**:
   - User can only see and interact with own tenant's data
   - No cross-tenant role selection possible

**Example Query with Tenant Filter**:
```sql
SELECT * FROM transport_orders
WHERE tenant_id = :current_tenant_id
  AND status = 'Pending'
ORDER BY created_at DESC;
```

---

## 7. Permission Inheritance & Hierarchies

### 7.1 Hierarchical Permissions

Higher-level roles inherit lower-level permissions:

```
Super Admin (Brainstation 23)
    ↓ inherits all
Tenant Admin (Nourish)
    ↓ inherits all within tenant
Operational User (Command Center Officer, Loading Person, etc.)
```

**Inheritance Rules**:
- Super Admin: All permissions across all tenants (platform-wide)
- Tenant Admin: All permissions within their tenant
- Operational User: Specific task permissions only (no management access)

### 7.2 Wildcard Permissions

Support for wildcard permissions to simplify administration:

```typescript
"Fleet.*"              // All Fleet module permissions
"Fleet.Vehicle.*"      // All Vehicle feature permissions
"Fleet.*.Read"         // Read permission on all Fleet features
```

**Resolution Order**:
1. Exact match: `Fleet.Vehicle.Create`
2. Feature wildcard: `Fleet.Vehicle.*`
3. Module wildcard: `Fleet.*`
4. Global admin: `Super Admin` role

---

## 8. Self-Service Restrictions

### 8.1 Approval Workflow Rules

**Cannot Approve Own Requests**:
```typescript
function validateApproval(approverId: UUID, requisition: Requisition): boolean {
    // Check if approver is also requester
    if (requisition.requester_id === approverId) {
        throw new ValidationError(
            'Cannot approve own requisition',
            'SELF_APPROVAL_DENIED'
        );
    }
    
    // Check if approver has approval permission
    const approver = getUser(approverId);
    if (!approver.hasPermission('Requisition.Approve')) {
        throw new PermissionError('Insufficient approval permissions');
    }
    
    return true;
}
```

**Workflow Separation**:
- Requester and Approver must be different users
- System enforces separation of duties

---

## 9. Integration Points

### 9.1 Authentication Integration

RBAC integrates tightly with authentication system:

```
User Login → Auth Success → [2FA challenge if admin role] → Load Role → Load Permissions → Embed in Token
```

**2FA Enforcement by Role**:
- **Super Admin**: 2FA required on every login to `admin.dfms.com`
- **Tenant Admin**: 2FA required on every login to `<tenant>.dfms.com`
- **Operational Users**: 2FA not required in Phase 1

**JWT Token Payload with Permissions**:
```typescript
{
  user_id: UUID,
  tenant_id: UUID,
  role_id: UUID,
  role_name: string,
  permissions: string[],  // Embedded for fast validation (from Role → Permission matrix)
  department: string,
  access_scope: 'Global' | 'Local',
  functional_type: 'Requester' | 'Approver' | 'Executor',  // metadata only — UI display
  iat: number,
  exp: number
}
```

> `functional_type` in the JWT is display metadata only. Permission enforcement uses `permissions[]` and `access_scope`. The backend MUST NOT use `functional_type` as an access gate in middleware or service layers.

### 9.2 Module Integration

Every module checks permissions before operations:

- **Master Data**: CRUD permissions per entity type
- **Requisitions**: Requester/Approver workflow validation
- **Transport Orders**: Planner/TDO role validation
- **Fleet Management**: Vehicle/driver assignment permissions
- **Gate/QC Operations**: Operator-specific permissions
- **Reports**: Report-level read/export permissions

---

## 10. Related Documentation

- **[Permission Catalog (Phase 1)](permission-catalog-phase1.md)** - Complete enumeration of 135 permissions across 13 modules
- **[Authentication & Security](authentication-security.md)** - Login, session, MFA
- **[User & Tenant Management](user-tenant-management.md)** - User lifecycle, invitations
- **[System Foundation](system-foundation.md)** - Overall system architecture

**Related User Stories:**
- US-004: Role Hierarchy & RBAC

**Source**: DFMS_Product_Requirements_Document_v3.md - Sections 6.1.4, 6.1.5, 6.1.6
