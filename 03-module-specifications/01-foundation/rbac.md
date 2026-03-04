---
module: 01-foundation
specification: Role-Based Access Control (RBAC)
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.1.4, 6.1.5, 6.1.6
last_updated: 2026-02-26
related_stories: US-004
---

# Role-Based Access Control (RBAC) Specification

## Overview

The DFMS platform implements a comprehensive Role-Based Access Control (RBAC) system designed for multi-tenant SaaS environments with complex organizational hierarchies. The RBAC system provides hierarchical role structures, granular permission management, and strict tenant isolation to ensure users can only access features and data appropriate to their organizational role and department.

The system supports both predefined operational roles (for standardized workflows) and custom roles (via Dynamic Role Builder in Phase 2) to accommodate diverse organizational structures while maintaining security and auditability.

**Key Acceptance Criteria**:
- **AC-1**: System SHALL allow Department Admins to assign operational roles within their departments
- **AC-2**: Super Admin controls global configurations across all tenants

---

## 1. Role Hierarchy Architecture

### 1.1 Four-Tier Role Structure

The RBAC system implements a four-tier hierarchical structure:

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
│ Manages: Department Admins + Operational Users              │
└──────────────────────────────────────────────────────────────┘
              ↓ creates & manages
┌──────────────────────────────────────────────────────────────┐
│ Tier 3: Department Admin                                    │
│ (Department-level, within tenant)                           │
│ Examples: Depot, Procurement, Distribution, Transport, QC   │
│ Created: By Tenant Admin                                    │
│ Manages: Operational Users within department                │
└──────────────────────────────────────────────────────────────┘
              ↓ oversees
┌──────────────────────────────────────────────────────────────┐
│ Tier 4: Operational User                                    │
│ (Task-level, day-to-day execution)                          │
│ Examples: Command Center Officer, Loading Person,           │
│           Unloading Person, Driver Supervisor, Driver Helper │
│ Created: By Tenant Admin or Department Admin                │
│ Manages: Nothing (execution-only)                           │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Management Chain

```
Super Admin (Brainstation 23)
 └─ creates → Tenant Admin (Nourish)
               ├─ creates → Dept Admin (Depot / Feed Mill / Commercial)
               │             └─ Depot Manager, Feed Mill Manager, Commercial Officer
               ├─ creates → Dept Admin (Procurement)
               │             └─ Procurement Officer
               ├─ creates → Dept Admin (Distribution)
               │             └─ Distribution Officer, Distribution Manager
               ├─ creates → Dept Admin (Transport)
               │             └─ Transport Planner, Transport Distribution Officer
               ├─ creates → Dept Admin (QA / QC)
               │             └─ QC Inspector – Physical, QA Lab Technician
               └─ creates → Dept Admin (Operations)
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

### 1.4 Tier 2: Tenant Admin

- **Scope**: Single tenant, organization-wide access
- **Creation**: Created by Super Admin during tenant onboarding
- **Example**: Nourish Poultry admin user
- **Capabilities**:
  - Manage all users within the tenant (Department Admins + Operational Users)
  - Create and assign Department Admins
  - Configure master data (POIs, products, vehicles, vendors)
  - Access all modules and features per subscription tier
  - View organization-wide reports and analytics
  - Configure tenant-specific settings (business rules, workflows)
  - Assign Functional Role Types (Requester / Approver / Executor) to users
- **Restrictions**: Cannot access other tenants' data; cannot create Super Admins
- **Typical Users**: Organization IT admin, System administrator, Operations Head

### 1.5 Tier 3: Department Admin

- **Scope**: Single department within tenant
- **Creation**: Created by Tenant Admin
- **Capabilities**:
  - Assign operational roles within their department (AC-1)
  - Assign Functional Role Types (Requester / Approver / Executor) to department members
  - Manage Operational Users within assigned department
  - Configure department-specific settings
  - View department-level reports
  - Approve department-specific workflows
- **Restrictions**: Cannot access other departments' data; cannot create Tenant Admins or other Department Admins

**Departments and their operational roles:**

| Department | Operational Roles | Default Functional Role |
|-----------|-------------------|----------------------|
| **Depot / Feed Mill / Commercial** | Depot Manager, Feed Mill Manager, Commercial Officer | Requester |
| **Procurement** | Procurement Officer | Approver |
| **Distribution** | Distribution Officer (DO), Distribution Manager (DM) | DM = Approver |
| **Transport** | Transport Planner (TP), Transport Distribution Officer (TDO) | Executor |
| **QA / QC** | QC Inspector – Physical, QA Lab Technician | Executor |
| **Operations** | Command Center Officer, Unloading Personnel, Loading Personnel, Driver Supervisor, Driver Helper | Executor |

**Nominated Vendors** are external users managed separately through the Vendor Portal (see Vendor Management module).

### 1.6 Tier 4: Operational User

Operational users perform day-to-day execution and **cannot manage users or system configurations**.

**Depot / Feed Mill / Commercial**:
- Depot Manager – Create FG Transfer Requests (Requester)
- Feed Mill Manager – Create FG Transfer Requests (Requester)
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

### 1.7 Functional Role Types

Admin (Tenant Admin or Department Admin) can assign one or more functional role types to any operational user:

| Functional Role | Description | Workflow Behavior |
|----------------|-------------|-------------------|
| **Requester** | Can create requisitions and requests | Subject to approval workflow; cannot approve own requests |
| **Approver** | Can approve or reject requests | Cannot approve own requests (separation of duties enforced) |
| **Executor** | Executes approved tasks | Cannot modify approval status; task-specific permissions only |

**Assignment Rules**:
- A user can hold multiple functional roles (e.g., Requester + Executor)
- Requester and Approver for the same request must be different users
- Department Admin without Approver flag cannot approve workflows
- Functional role assignment is scoped to the user's department

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

```typescript
Role: Transport Planner {
  permissions: {
    "TransportRequisition": ["Read", "Update"],
    "TransportOrder": ["Create", "Read", "Update"],
    "Trip": ["Create", "Read", "Update", "Assign"],
    "Fleet": ["Read"],
    "Vehicle": ["Read"],
    "Driver": ["Read"],
    "Vendor": ["Read"],
    "Reports.Transport": ["Read", "Export"]
  }
}
```

---

## 3. Role Assignment & Management

### 3.1 User-Role Assignment

**Assignment Flow**:
```
1. User invitation initiated by Admin
2. Admin selects role during invitation
3. Admin assigns department (if applicable)
4. Admin assigns workflow type: Requester/Approver/Executor
5. System validates role against tenant subscription tier
6. User activates account
7. Permissions loaded on first login
```

**Constraints**:
- One primary role per user
- Optional secondary roles (future enhancement)
- Department must match role's department scope
- Workflow type (Requester/Approver/Executor) flags specific permissions

### 3.2 Functional Role Types

See Section 1.7 for full Functional Role Type definitions (Requester / Approver / Executor).

**Self-Approval Prevention Rule**:
```
IF user.role.has_flag('Approver') AND
   requisition.requester_id == user.id:
    DENY approval action
    SHOW "Cannot approve own requisition"
```

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
4. Selects permissions from permission matrix
5. Configures department assignment (optional)
6. Sets workflow flags (Requester/Approver/Executor)
7. System validates and saves role
8. Role immediately available for user assignment
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
        workflow_flags: sourceRole.workflow_flags,
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
  tenant_id: UUID | null  // null for system roles, UUID for custom roles
  is_system_role: boolean  // true for predefined roles
  permissions: JSON        // Array of permission strings
  department: string | null
  workflow_flags: {
    is_requester: boolean
    is_approver: boolean
    is_executor: boolean
  }
  created_by: UUID
  created_at: DateTime
  status: enum ['Active', 'Inactive']
}
```

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
Department Admin (Depot, Procurement, Distribution, Transport, QC)
    ↓ inherits department-specific
Operational User (Command Center Officer, Loading Person, etc.)
```

**Inheritance Rules**:
- Super Admin: All permissions across all tenants (platform-wide)
- Tenant Admin: All permissions within their tenant
- Department Admin: All permissions within their department
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
- Department Admin without Approver flag cannot approve
- System enforces separation of duties

---

## 9. Integration Points

### 9.1 Authentication Integration

RBAC integrates tightly with authentication system:

```
User Login → Auth Success → Load Role → Load Permissions → Embed in Token
```

**JWT Token Payload with Permissions**:
```typescript
{
  user_id: UUID,
  tenant_id: UUID,
  role_id: UUID,
  role_name: string,
  permissions: string[],  // Embedded for fast validation
  department: string,
  workflow_flags: {
    is_requester: boolean,
    is_approver: boolean,
    is_executor: boolean
  },
  iat: number,
  exp: number
}
```

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

- **[Authentication & Security](authentication-security.md)** - Login, session, MFA
- **[User & Tenant Management](user-tenant-management.md)** - User lifecycle, invitations
- **[System Foundation](system-foundation.md)** - Overall system architecture

**Related User Stories:**
- US-004: Role Hierarchy & RBAC

**Source**: PRD_DFMS_v1.0.md - Sections 6.1.4, 6.1.5, 6.1.6
