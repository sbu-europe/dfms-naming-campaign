---
title: Role Hierarchy
story_id: US-004
phase: phase-1
module: System Foundation
priority: Critical
status: Pending
epic: System Foundation
epic_id: EPIC-001
epic_name: System Foundation
sprint: Sprint 1
story_points: 10
created: 2026-02-23
updated: 2026-04-07
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../../source-documents/04-wbs/stories-table.md
  - ../../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-001-user-login-account-lockout.md
  - US-005-user-invitation-activation.md
dependencies:
  - US-001-user-login-account-lockout.md
tags: [foundation, rbac, roles, security, critical]
---

# US-004: Role Hierarchy

## User Story

**As a** system  
**I want to** enforce role-based permissions  
**So that** users can only access features relevant to their department

## Business Context

Role hierarchy defines permission scope and access rights. The system must:
- Define hierarchical role structure with Administrative and Operational categories
- Support two access scope levels: **Global Access** (across all locations) and **Local Access** (within assigned department/POI)
- Enforce role-based permissions at UI, API, and database levels
- Allow Tenant Admins to assign operational roles within their departments
- Prevent users from approving their own requisitions
- Enforce Requester vs Approver vs Executor role separation

---

## Acceptance Criteria

### AC-1: Role Structure
- [ ] System SHALL define a hierarchical role structure with pre-defined roles
- [ ] System SHALL categorize roles into: **Administrative Roles**, **Operational Roles**
- [ ] System SHALL assign each role:
  - a permission scope
  - access rights
- [ ] System SHALL require each **Operational Role** to be associated with exactly one **Department** (selected from a predefined department list)
- [ ] When creating or configuring a role, Admin SHALL select the role’s **Department** from a dropdown populated by the predefined department table (AC-1 operational roles table)
- [ ] System SHALL support two access scope levels:
  - **Global Access** – role can access data and actions across all locations within the tenant
  - **Local Access** – role can access data only within assigned department, POI, depot, feed mill, or operational unit
- [ ] System SHALL allow Tenant Admins to assign operational roles within their departments
- [ ] System SHALL support the following operational roles and access scope definitions:

| Department | Role | Functional Type | Access Scope |
|------------|------|-----------------|-------------|
| Depot / Feed Mill / Commercial | Depot Officer | Requester | Local |
| | Feed Mill Officer | Requester | Local |
| | Commercial Officer | Requester | Local |
| Procurement | Procurement Officer | Approver | Global |
| Distribution | Distribution Officer (DO) | Executor | Local |
| | Distribution Manager (DM) | Approver | Global |
| Transport | Transport Planner (TP) | Executor | Global |
| | Transport Distribution Officer (TDO) - Own Fleet | Executor | Global |
| | Transport Distribution Officer (TDO) - Vendor Fleet | Executor | Global |
| QA / QC | QC Inspector – Physical | Executor | Local |
| | QA Lab Technician | Executor | Local |
| Operations | Command Center Officer | Executor | Local |
| | Loading Personnel | Executor | Local |
| | Unloading Personnel | Executor | Local |
| | Driver Supervisor | Executor | Local |
| | Driver Helper | Executor | Local |
| Gate Operations | Gateman | Executor | Local |
| Scaling / Weight | Scaling Operator | Executor | Local |
| Costing & Finance | Account Officer | Approver | Global |
| Fleet / Driver Operations | Driver | Executor | Local |

- [ ] System SHALL support the following administrative roles and access scope definitions:

| Role | Functional Type | Access Scope | Description |
|------|-----------------|--------------|-------------|
| Super Admin | Administrator | System-Wide | Platform-level access across all tenants |
| Tenant Admin | Administrator | Global | Full access within assigned tenant |

- [ ] System SHALL ensure Local roles only access records within their assigned location
- [ ] System SHALL ensure Global roles can access requests across all locations within the tenant

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Local role access restriction
  Given a user with "Depot Officer" role assigned to "Depot-A"
  When the user attempts to view Transport Requests
  Then the user sees only Transport Requests from "Depot-A"
  And Transport Requests from other depots are not visible

Scenario: AC-1.2 - Global role cross-location access
  Given a user with "Distribution Manager" role (Global scope)
  When the user views Transport Requests
  Then the user sees Transport Requests from all locations within the tenant
  And can perform actions on requests from any location

Scenario: AC-1.3 - Tenant Admin assigns operational role
  Given a Tenant Admin for "Tenant-A"
  When the admin assigns "Depot Officer" role to a user
  And specifies department assignment as "Depot-1"
  Then the user is assigned the role with Local scope
  And the user can only access data within "Depot-1"

Scenario: AC-1.4 - Local role requires location assignment
  Given a Tenant Admin assigning "QC Inspector" role
  When the admin attempts to save without selecting a location
  Then the system displays error "Location assignment required for Local roles"
  And the role assignment is not saved

Scenario: AC-1.5 - Administrative role hierarchy
  Given a user with "Super Admin" role
  When the user accesses any tenant's data
  Then the user has full read/write access across all tenants
  And can manage Tenant Admin assignments

Scenario: AC-1.6 - Create operational role requires predefined department
  Given a Tenant Admin is creating an Operational role
  When the admin opens the "Department" dropdown
  Then the dropdown options match the predefined Department list from the Operational Roles table
  And free-text department entry is not allowed
```

### AC-2: Permission Enforcement
- [ ] System SHALL enforce permissions at multiple security layers

**UI Level**
- [ ] System SHALL control:
  - menu visibility
  - page access
  - button availability
  - based on user role and permission scope

**API Level**
- [ ] System SHALL validate permissions before allowing API endpoint access
- [ ] Unauthorized requests SHALL return HTTP 403 Forbidden

**Database Level**
- [ ] System SHALL enforce row-level security for sensitive data access
- [ ] Local roles SHALL only access records associated with their assigned department or operational location
- [ ] Global roles SHALL access records across all locations where the role permission applies

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - UI menu visibility based on role
  Given a user with "Depot Officer" role (Requester type)
  When the user logs into the system
  Then the "Approve Requests" menu item is not visible
  And the "Create Request" menu item is visible

Scenario: AC-2.2 - UI button availability based on role
  Given a user with "Executor" functional type
  When the user views a Transport Request detail page
  Then the "Approve" button is hidden
  And the "Execute" button is visible

Scenario: AC-2.3 - API unauthorized access returns 403
  Given a user with "Depot Officer" role assigned to "Depot-A"
  When the user calls GET /api/v1/transport-requests?location=Depot-B
  Then the API returns HTTP 403 Forbidden
  And the response body contains {"error": "PERMISSION_DENIED", "message": "Access denied - outside assigned location"}

Scenario: AC-2.4 - API authorized access succeeds
  Given a user with "Distribution Manager" role (Global scope)
  When the user calls GET /api/v1/transport-requests?location=Depot-B
  Then the API returns HTTP 200 OK
  And the response contains Transport Requests from "Depot-B"

Scenario: AC-2.5 - Database row-level security for Local role
  Given a user with "QC Inspector" role assigned to "Feed Mill-1"
  When the user queries the inspection_records table
  Then only records where location_id = "Feed Mill-1" are returned
  And records from other locations are filtered at database level

Scenario: AC-2.6 - Database allows Global role full access
  Given a user with "Transport Planner" role (Global scope)
  When the user queries the transport_orders table
  Then all records within the tenant are returned
  And no row-level filtering is applied based on location
```

### AC-3: Approval Constraints
- [ ] System SHALL prevent users from approving their own requisitions
- [ ] System SHALL enforce Requester vs Approver vs Executor role separation
- [ ] System SHALL ensure that:
  - A Requester cannot approve requests they created
  - Only roles flagged as Approver can approve requests
- [ ] System SHALL enforce approval rules regardless of Local or Global role scope

**Example:**
- Depot Manager (Requester – Local) → cannot approve requests
- Distribution Manager (Approver – Global) → can approve TR requests across all locations

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Self-approval prevention
  Given a user with "Distribution Manager" role (Approver type)
  And the user has created a Transport Request "TR-001"
  When the user attempts to approve "TR-001"
  Then the system returns error "Cannot approve own requisition"
  And the request status remains unchanged

Scenario: AC-3.2 - Requester cannot approve any request
  Given a user with "Depot Officer" role (Requester type)
  And another user has created a Transport Request "TR-002"
  When the Depot Officer attempts to approve "TR-002"
  Then the system returns HTTP 403 Forbidden
  And displays message "Only Approver roles can approve requests"

Scenario: AC-3.3 - Approver can approve others' requests
  Given a user with "Distribution Manager" role (Approver type)
  And another user has created a Transport Request "TR-003"
  When the Distribution Manager approves "TR-003"
  Then the request status changes to "Approved"
  And the approval is recorded with approver details

Scenario: AC-3.4 - Executor cannot approve requests
  Given a user with "Transport Planner" role (Executor type, Global scope)
  When the user views any Transport Request
  Then the "Approve" button is not available
  And attempting API approval returns HTTP 403

Scenario: AC-3.5 - Approval rules apply regardless of scope
  Given a user with "Procurement Officer" role (Approver type, Global scope)
  And the user created a Purchase Request "PR-001"
  When the user attempts to approve "PR-001"
  Then the system prevents self-approval
  And returns error "Cannot approve own requisition"
```

### AC-4: Role Types
- [ ] System SHALL support functional role types:
  - **Requester**
  - **Approver**
  - **Executor**
- [ ] System SHALL allow each operational role to be mapped to a functional role type
- [ ] System SHALL support multi-tenant architecture, where:
  - all roles are scoped to the tenant
  - users cannot access data from other tenants
- [ ] System SHALL combine Role + Functional Type + Access Scope to determine user permissions

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Functional type mapping
  Given the system has role "Depot Officer" configured
  When an administrator views role details
  Then the functional type is displayed as "Requester"
  And the access scope is displayed as "Local"

Scenario: AC-4.2 - Multi-tenant isolation
  Given a user with "Transport Planner" role in "Tenant-A"
  When the user attempts to access data from "Tenant-B"
  Then the system returns HTTP 403 Forbidden
  And logs the cross-tenant access attempt

Scenario: AC-4.3 - Tenant-scoped role assignment
  Given a Tenant Admin for "Tenant-A"
  When viewing available roles to assign
  Then only roles scoped to "Tenant-A" are displayed
  And roles from other tenants are not visible

Scenario: AC-4.4 - Combined permission calculation
  Given a user with role "Distribution Manager"
  And functional type "Approver"
  And access scope "Global"
  When the user requests permission check for "approve_transport_request"
  Then the system evaluates: Role + Functional Type + Access Scope
  And returns permitted = true for all locations within tenant

Scenario: AC-4.5 - Executor role permissions
  Given a user with role "Loading Personnel"
  And functional type "Executor"
  And access scope "Local" for "Depot-1"
  When the user attempts to execute loading operations
  Then permission is granted for "Depot-1" only
  And approval actions are denied regardless of location
```

---

## Functional Requirements

### FR-001: RBAC
- [Critical] Hierarchical role structure with Administrative and Operational categories
- [Critical] Permission scope per role (Global vs Local access)
- [Critical] Functional role types (Requester, Approver, Executor)
- [Critical] Tenant-level role assignment by Tenant Admins

### FR-002: Access Control
- [Critical] UI-level permission enforcement (menu/page/button visibility)
- [Critical] API-level permission enforcement (403 on unauthorized access)
- [Critical] Database-level row-level security for Local vs Global access
- [Critical] Multi-tenant data isolation

---

## Business Rules

### BR-RBAC-001: Role Hierarchy
- **Administrative roles**: Super Admin, Tenant Admin
- **Operational roles**: 15 pre-defined roles across 5 departments (see AC-1 table)
- Each role has a Functional Type: Requester, Approver, or Executor
- Each Operational Role belongs to exactly one predefined Department (used for role creation and role filtering in user assignment/invitation flows)
- **Enforcement**: RBAC service

### BR-RBAC-002: Access Scope Enforcement
- **Global Access**: User can access data across all locations within tenant
- **Local Access**: User can only access data within assigned department/POI/depot/feed mill
- Row-level security enforced at database layer
- **Enforcement**: Database RLS policies + API middleware

### BR-RBAC-003: Self-Approval Prevention
- Users cannot approve their own requisitions
- Requester role type cannot approve requests
- Only Approver role type can approve requests
- Approval rules apply regardless of Global or Local scope
- **Enforcement**: Approval workflow validation

### BR-RBAC-004: Tenant Isolation
- All roles scoped to tenant
- Users cannot access data from other tenants
- **Enforcement**: Multi-tenant middleware

---

## Data Model

```typescript
Role {
  role_id: UUID
  tenant_id: UUID
  name: string
  category: Enum (Administrative, Operational)
  functional_type: Enum (Requester, Approver, Executor)
  access_scope: Enum (Global, Local)
  department: Enum (Predefined Department; required for Operational roles; null for Administrative roles)
  permissions: JSON (array of permission codes)
}

UserRole {
  user_id: UUID
  role_id: UUID
  department_id: UUID (nullable, required for Local roles)
  poi_id: UUID (nullable, for Local roles)
  assigned_by: UUID
  assigned_at: DateTime
}

Permission {
  permission_code: string
  resource: string
  action: string
  scope: Enum (Global, Local, Self)
  requires_functional_type: Enum (Requester, Approver, Executor, null)
}
```

---

## UI/UX Requirements

### Role Assignment (Tenant Admin)
```
┌─────────────────────────────────────────────┐
│ Assign Role: john.doe                       │
├─────────────────────────────────────────────┤
│ Department: [Transport ▼]                    │
│ Role:      [Transport Planner ▼]             │
│                                             │
│ Role Details: (read-only)                    │
│ • Functional Type: Executor                  │
│ • Access Scope: Global                       │
│                                             │
│ Permissions:                                 │
│ • View TOs across all locations              │
│ • Create TOs, Assign Fleet                   │
│ • Cannot approve requisitions (Executor)     │
│                                             │
│ Location Assignment: (for Local roles only)  │
│ POI/Depot: [Not Required - Global Access]   │
│                                             │
│ [Assign]  [Cancel]                           │
└─────────────────────────────────────────────┘
```

### Menu/Button Visibility
- UI elements hidden based on role's functional type and access scope
- Approval buttons hidden for Requester and Executor roles
- Local roles see only records from their assigned location
- Global roles see records from all locations
- Disabled state with tooltip when action not permitted

---

## Role-Based Access of Menus (UI Matrix from Jira)

This table defines **UI menu visibility and CRUD/action capability** per role. It is used to implement:
- **Menu/sub-menu visibility** (UI routing + navigation)
- **Page access** (route guards)
- **Field-level enablement** (read-only vs editable controls)
- **Button-level actions** (Create/Update/Delete/Approve/Assign/Export)

> **Role naming note**: Jira uses **Tenant Super Admin**; this maps to the DFMS **Tenant Admin** role in this repository’s terminology.

### 1) Tenant Admin Dashboard & Master Data Configuration

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Tenant Admin (Tenant Super Admin) | Tenant Admin Dashboard | - | - | Read |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | Master Entities → Dealers | Dealer Master Data Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | Master Entities → Suppliers | Supplier Master Data Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | Master Entities → POIs | POI Master Data Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | PIM → Product Category | Product Category Master Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | PIM → Product Listing | Product Listing Master Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | Vehicles | Vehicle Master Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | Master Data Configuration | Helpers | Helper Master Data Fields | Create, Read, Update, Delete |
| Tenant Admin (Tenant Super Admin) | User Management | Drivers Master | All driver header fields while creating data; Phone OTP (Admin-Assisted registration) | Create, Read, Update, Deactivate |
| Tenant Admin (Tenant Super Admin) | User Management | Users | Role, Full Name, Email, Contact Number, Employee ID, POI, Global flag | Create, Read, Update, Deactivate |

### 2) Vendor Management (Vendor Portal)

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Tenant Admin (Tenant Super Admin) | Vendor Management | - | - | Approve, Update, Read |
| Vendor Admin | Vendor Portal (Contractual) | TO List | - | Read, Update |
| Vendor Admin | Vendor Portal (Non-Contractual) | Bid | - | Read, Update |

### 3) Requisition / Shipment / Planning

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Depot Officer / Feed Mill Officer / Commercial Officer | Product Shipments | Requisition (PR) | Reference PRD 6.7.1 | Create, Read, Update, Delete |
| Distribution Officer (DO) / Procurement Officer | Requisition (TR) | - | Reference PRD 6.7.3 | Create, Read, Update, Delete |
| Distribution Manager (DM) / Procurement Officer | Shipment Planning | - | - | Read, Approve, Update |

### 4) Transport Dashboard / Planning / TO

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Transport Planner (TP) / TDO – Own Fleet / TDO – Vendor Fleet | Transport Dashboard | Map | - | Read |
| TDO – Own Fleet / TDO – Vendor Fleet | Transport Planning | Fleet Management | Vehicle, Driver, Helper, ETA | Assign, Read, Update |
| TDO – Vendor Fleet | Bid Management | - | Required vehicles, initial bid rate (optional), source, destination, vehicle type | Create, Read, Update, Delete, Approve |
| Transport Planner (TP) | Transport Request (TR) | - | Number of Vehicles, Vehicle Type, C&F Clearance Approval | Read, Update |
| Transport Planner (TP) | Transport Order (TO) | - | Transport Mode | Create, Read, Update, Delete |

### 5) Gate / Scaling / Command Center / Loading-Unloading / QC

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Gateman | Gate Management | Entry | Reference PRD 6.10.1 | Create, Read, Update, Delete |
| Gateman | Gate Management | Exit | - | Read, Update |
| Scaling Operator | Scale Management | Scale In | Reference PRD 6.11.1 | Create, Read, Update, Delete |
| Scaling Operator | Scale Management | Scale Out | - | Read, Update |
| Command Center Officer | Command Center Operations | Vehicle Queue List | - | Read |
| Command Center Officer | Command Center Operations | Assign Loading Point | - | Assign, Read |
| Loading Personnel | Load & Unload Operations | Load Queue List | Loading Quantity, Unit, Seal Number, Date Timestamp | Read, Update |
| Unloading Personnel | Load & Unload Operations | Unload Queue List | Unloading Quantity, Unit, Date Timestamp | Read, Update |
| QC Inspector – Physical | QC & QA | Vehicle Queue List | - | Read |
| QC Inspector – Physical | QC & QA | Assign Unloading Point | - | Assign, Read |
| QC Inspector – Physical | QC & QA | Sampling | Vehicle Number, Material Name, Receiving Date, Product Item Code, Sample Send Time, Result Receiving time, Is Lab Test Required?, Physical Analysis, Nutritional Analysis, Remarks | Create, Read, Update, Delete |
| QC Inspector – Physical | QC & QA | Physical Analysis | - | Read, Update |
| QC Inspector – Physical | QC & QA | Nutritional Analysis | - | Read, Update |
| QC Inspector – Physical | QC & QA | Lab Report | - | Read |
| QA Lab Technician | QC & QA | Lab Test | - | Read, Update |

### 6) Costing, Reports, Workshop, Mobile, Settings

| Role | Menu | Sub-menu | Fields / Notes | Permission Set |
|---|---|---|---|---|
| Account Officer | Costing | Trip Costing | - | Read, Export, Approve (Bill Claims) |
| Transport Planner (TP) / TDO – Own Fleet / TDO – Vendor Fleet | Reports | Transport & Trip | - | Read, Export |
| Transport Planner (TP) / TDO – Own Fleet / TDO – Vendor Fleet | Reports | Vendor | - | Read, Export |
| Transport Planner (TP) / TDO – Own Fleet / TDO – Vendor Fleet | Reports | Fleet Performance | - | Read, Export |
| Account Officer | Reports | Costing & Finance | - | Read, Export |
| Driver Supervisor | Workshop Management | - | Reference PRD 6.6.1.8 | Create, Read, Update, Delete |
| Driver | Mobile Interface | Fuel Tracking | Fuel Intake, Fuel Receipt | Create, Read, Update, Delete |
| Driver | Mobile Interface | Trip List | - | Read, Update |
| All Users | Others | Settings | - | Read, Update |

---

## API Endpoints

```typescript
GET /api/v1/roles
Response: { 
  roles: [{ 
    role_id, 
    name, 
    category, 
    functional_type, 
    access_scope, 
    department, 
    permissions 
  }] 
}

GET /api/v1/users/{user_id}/roles
Response: { 
  roles: [{ 
    role_id, 
    department_id, 
    poi_id, 
    functional_type, 
    access_scope 
  }] 
}

POST /api/v1/admin/users/{user_id}/roles
Body: { 
  role_id, 
  department_id?, 
  poi_id? // Required for Local roles
}
Response: { success }

GET /api/v1/permissions/check
Query: resource, action, record_id?
Response: { 
  permitted: boolean, 
  reason?: string // e.g., "Local role cannot access this location"
}
```

---

## Testing Scenarios

### Happy Path
1. Tenant Admin assigns Transport Planner (Executor, Global) → User sees TO menu across all locations
2. Tenant Admin assigns Depot Officer (Requester, Local) → User sees only their depot's data
3. Distribution Manager (Approver, Global) approves TR → Success
4. Depot Officer creates requisition → Cannot approve (Requester type, button hidden)

### Edge Cases
1. **Self-approval attempt**: API returns 403 "Requester cannot approve own requisition"
2. **Local role accessing other location**: API returns 403 "Access denied - outside assigned location"
3. **Executor attempting approval**: API returns 403 "Only Approver roles can approve"
4. **Cross-tenant role access**: Denied at middleware level
5. **Local role without location assignment**: Assignment rejected at creation

### Extended Edge Cases

6. **User with multiple roles**:
   - User has both "Depot Officer" (Local, Requester) and "Distribution Manager" (Global, Approver)
   - System applies highest privilege: Global access, Approver capabilities
   - User can approve requests (from Approver role) across all locations (from Global scope)
   - Self-approval prevention still applies regardless of multiple roles

7. **Role assignment during active session**:
   - User is logged in with "Depot Officer" role
   - Admin assigns additional "Distribution Manager" role
   - System behavior: Permissions updated immediately OR on next request
   - Session cache invalidated; user sees expanded permissions without re-login

8. **Role revocation during active session**:
   - User has active session with "Distribution Manager" role
   - Admin revokes the role while user is in the middle of workflow
   - Ongoing API calls complete with existing permissions
   - Next request validates current role state and denies access
   - Any pending transactions are NOT automatically rolled back

9. **Role revocation during active transaction**:
   - User starts a multi-step approval workflow
   - Admin revokes Approver role mid-transaction
   - Step 1 (already completed): Remains committed
   - Step 2 (pending): Blocked with 403 "Role no longer assigned"
   - System logs partial completion for audit

10. **Concurrent role modifications**:
    - Admin A assigns "Role X" to User
    - Admin B simultaneously revokes "Role X" from User
    - System uses optimistic locking or last-write-wins
    - Final state determined by database transaction order
    - Audit log captures both operations with timestamps

11. **Orphaned role assignments (department deleted)**:
    - User assigned "Depot Officer" to "Depot-1"
    - Admin deletes "Depot-1" department
    - System behavior options:
      - Soft-delete: User retains role but location marked inactive
      - Cascade: User's role assignment is revoked
      - Orphan: User has role but no valid location (requires re-assignment)
    - API returns 403 "Assigned location no longer exists"

12. **Permission caching invalidation timing**:
    - Permission cache TTL = 5 minutes
    - Role changed at T=0
    - Cached permissions still valid until T=5min (stale read)
    - Critical operations force cache refresh
    - Approval operations ALWAYS validate fresh permissions (no cache)

13. **Conflicting role functional types**:
    - User has "Depot Officer" (Requester) and "QC Inspector" (Executor)
    - Neither role is Approver → User cannot approve
    - Multiple functional types do NOT combine to create new capabilities

14. **Global role with Local role combination**:
    - User has "Transport Planner" (Global, Executor) and "Depot Officer" (Local, Requester)
    - Access scope: Global (highest wins)
    - Functional types: Both Executor AND Requester capabilities
    - Cannot approve (no Approver role)

15. **Role assignment to inactive user**:
    - Admin attempts to assign role to deactivated user account
    - System rejects: "Cannot assign role to inactive user"
    - Role assignment only allowed for active users

16. **Bulk role assignment edge cases**:
    - Admin assigns role to 100 users simultaneously
    - 5 users are from different tenant → silently skipped (no error)
    - 3 users already have the role → no duplicate assignment
    - Partial success: 92 users assigned, response includes skip reasons

---

## Unit Tests

### UT-RBAC-001: Role Creation & Assignment
```python
def test_role_creation():
    # Test creating all 15 operational roles
    for role in OPERATIONAL_ROLES:
        role = Role.objects.create(**role_data)
        assert role.functional_type in ['Requester', 'Approver', 'Executor']
        assert role.access_scope in ['Global', 'Local']
        assert role.category == 'Operational'

def test_role_assignment():
    # Test assigning role to user
    user = create_test_user()
    role = Role.objects.get(name='Transport Planner')
    user_role = UserRole.objects.create(user=user, role=role, assigned_by=admin_user)
    assert user_role.user == user
    assert user_role.role == role

def test_local_role_requires_location():
    # Test Local roles require department_id or poi_id
    local_role = Role.objects.get(name='Depot Officer')
    with pytest.raises(ValidationError):
        UserRole.objects.create(user=user, role=local_role, department_id=None, poi_id=None)
```

### UT-RBAC-002: Permission Validation
```python
def test_global_role_access():
    # Test Global role can access all locations
    global_user = create_user_with_role('Distribution Manager')
    for location in ALL_LOCATIONS:
        assert has_permission(global_user, 'view_tr', location)
        assert has_permission(global_user, 'approve_tr', location)

def test_local_role_access():
    # Test Local role only accesses assigned location
    local_user = create_user_with_role('Depot Officer', department_id='depot-1')
    assert has_permission(local_user, 'view_pr', 'depot-1')
    assert not has_permission(local_user, 'view_pr', 'depot-2')

def test_requester_cannot_approve():
    # Test Requester functional type cannot approve
    requester = create_user_with_role('Depot Officer')
    assert not has_permission(requester, 'approve_tr', 'any-location')
    assert not has_permission(requester, 'approve_pr', 'any-location')

def test_approver_can_approve():
    # Test Approver functional type can approve
    approver = create_user_with_role('Distribution Manager')
    assert has_permission(approver, 'approve_tr', 'any-location')
    assert has_permission(approver, 'approve_pr', 'any-location')
```

### UT-RBAC-003: Self-Approval Prevention
```python
def test_self_approval_prevention():
    # Test user cannot approve own requisition
    user = create_user_with_role('Distribution Manager')
    requisition = create_requisition(created_by=user)
    
    with pytest.raises(PermissionDenied):
        approve_requisition(requisition.id, user)
    
    # Test other approver can approve
    other_approver = create_user_with_role('Distribution Manager')
    approve_requisition(requisition.id, other_approver)  # Should succeed

def test_requester_approval_blocked():
    # Test Requester role approval always blocked
    requester = create_user_with_role('Depot Officer')
    other_requisition = create_requisition(created_by=other_user)
    
    with pytest.raises(PermissionDenied):
        approve_requisition(other_requisition.id, requester)
```

### UT-RBAC-004: API Permission Middleware
```python
def test_api_permission_middleware():
    # Test API endpoint permission checking
    client = APIClient()
    
    # Test unauthorized access
    local_user = create_user_with_role('Depot Officer')
    client.force_authenticate(local_user)
    response = client.get('/api/v1/transport-orders/?location=other-depot')
    assert response.status_code == 403
    
    # Test authorized access
    response = client.get('/api/v1/transport-orders/?location=assigned-depot')
    assert response.status_code == 200

def test_tenant_isolation():
    # Test tenant isolation
    tenant1_user = create_user_with_role('Transport Planner', tenant='tenant-1')
    tenant2_data = create_transport_order(tenant='tenant-2')
    
    client.force_authenticate(tenant1_user)
    response = client.get(f'/api/v1/transport-orders/{tenant2_data.id}/')
    assert response.status_code == 403
```

### UT-RBAC-005: Database Row-Level Security
```python
def test_row_level_security():
    # Test database row-level security
    local_user = create_user_with_role('Depot Officer', department_id='depot-1')
    
    # Should only see records from assigned location
    depot1_requisitions = TransportRequest.objects.filter(created_by__userrole__department_id='depot-1')
    depot2_requisitions = TransportRequest.objects.filter(created_by__userrole__department_id='depot-2')
    
    user_queryset = get_filtered_queryset(TransportRequest, local_user)
    assert depot1_requisitions.count() == user_queryset.count()
    assert not user_queryset.filter(id__in=depot2_requisitions).exists()

def test_global_role_queryset():
    # Test Global role sees all records
    global_user = create_user_with_role('Distribution Manager')
    all_requisitions = TransportRequest.objects.all()
    
    user_queryset = get_filtered_queryset(TransportRequest, global_user)
    assert all_requisitions.count() == user_queryset.count()
```

---

## API Error Response Tests

### UT-API-ERR-001: Permission Denied Response Format
```python
def test_403_permission_denied_response_format():
    """Test standardized 403 response format for permission denial"""
    client = APIClient()
    local_user = create_user_with_role('Depot Officer', department_id='depot-1')
    client.force_authenticate(local_user)
    
    # Attempt to access other location
    response = client.get('/api/v1/transport-requests/?location=depot-2')
    
    assert response.status_code == 403
    assert response.json() == {
        "error": "PERMISSION_DENIED",
        "code": "RBAC-403-LOCATION",
        "message": "Access denied - outside assigned location",
        "details": {
            "required_scope": "Global",
            "user_scope": "Local",
            "user_location": "depot-1",
            "requested_location": "depot-2"
        }
    }

def test_403_approver_required_response_format():
    """Test 403 response for non-Approver attempting approval"""
    client = APIClient()
    requester = create_user_with_role('Depot Officer')
    tr = create_transport_request()
    client.force_authenticate(requester)
    
    response = client.post(f'/api/v1/transport-requests/{tr.id}/approve/')
    
    assert response.status_code == 403
    assert response.json() == {
        "error": "PERMISSION_DENIED",
        "code": "RBAC-403-FUNCTIONAL-TYPE",
        "message": "Only Approver roles can approve requests",
        "details": {
            "required_functional_type": "Approver",
            "user_functional_type": "Requester",
            "user_role": "Depot Officer"
        }
    }

def test_403_self_approval_response_format():
    """Test 403 response for self-approval attempt"""
    client = APIClient()
    approver = create_user_with_role('Distribution Manager')
    tr = create_transport_request(created_by=approver)
    client.force_authenticate(approver)
    
    response = client.post(f'/api/v1/transport-requests/{tr.id}/approve/')
    
    assert response.status_code == 403
    assert response.json() == {
        "error": "PERMISSION_DENIED",
        "code": "RBAC-403-SELF-APPROVAL",
        "message": "Cannot approve own requisition",
        "details": {
            "request_id": str(tr.id),
            "created_by": str(approver.id),
            "attempted_approver": str(approver.id)
        }
    }
```

### UT-API-ERR-002: Tenant Isolation Error Response
```python
def test_404_cross_tenant_access_response():
    """Test 404 response for cross-tenant access (no information disclosure)"""
    client = APIClient()
    tenant1_user = create_user_with_role('Distribution Manager', tenant='tenant-1')
    tenant2_record = create_transport_request(tenant='tenant-2')
    client.force_authenticate(tenant1_user)
    
    # Direct access returns 404 (not 403) to avoid information disclosure
    response = client.get(f'/api/v1/transport-requests/{tenant2_record.id}/')
    
    assert response.status_code == 404
    assert response.json() == {
        "error": "NOT_FOUND",
        "code": "RESOURCE-404",
        "message": "Transport request not found"
    }
    # Note: No details about tenant isolation to prevent enumeration

def test_403_explicit_tenant_injection_response():
    """Test 403 response when tenant_id parameter is explicitly injected"""
    client = APIClient()
    tenant1_user = create_user_with_role('Tenant Admin', tenant='tenant-1')
    client.force_authenticate(tenant1_user)
    
    response = client.get('/api/v1/transport-requests/?tenant_id=tenant-2')
    
    assert response.status_code == 403
    assert response.json() == {
        "error": "PERMISSION_DENIED",
        "code": "RBAC-403-TENANT",
        "message": "Cannot access other tenant's data",
        "details": {
            "user_tenant": "tenant-1",
            "attempted_tenant": "tenant-2"
        }
    }
```

### UT-API-ERR-003: Role Assignment Error Responses
```python
def test_400_local_role_missing_location_response():
    """Test 400 response when Local role assigned without location"""
    client = APIClient()
    admin = create_user_with_role('Tenant Admin')
    user = create_user()
    depot_officer_role = Role.objects.get(name='Depot Officer')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/roles', {
        'role_id': str(depot_officer_role.id)
        # Missing: department_id and poi_id
    })
    
    assert response.status_code == 400
    assert response.json() == {
        "error": "VALIDATION_ERROR",
        "code": "RBAC-400-LOCATION-REQUIRED",
        "message": "Location assignment required for Local roles",
        "details": {
            "role_name": "Depot Officer",
            "access_scope": "Local",
            "required_fields": ["department_id", "poi_id"]
        }
    }

def test_404_invalid_role_id_response():
    """Test 404 response for invalid role_id"""
    client = APIClient()
    admin = create_user_with_role('Tenant Admin')
    user = create_user()
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/roles', {
        'role_id': 'non-existent-role-id'
    })
    
    assert response.status_code == 404
    assert response.json() == {
        "error": "NOT_FOUND",
        "code": "ROLE-404",
        "message": "Role not found"
    }

def test_409_duplicate_role_assignment_response():
    """Test 409 response for duplicate role assignment"""
    client = APIClient()
    admin = create_user_with_role('Tenant Admin')
    user = create_user_with_role('Depot Officer', department_id='depot-1')
    depot_officer_role = Role.objects.get(name='Depot Officer')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/roles', {
        'role_id': str(depot_officer_role.id),
        'department_id': 'depot-1'
    })
    
    assert response.status_code == 409
    assert response.json() == {
        "error": "CONFLICT",
        "code": "RBAC-409-DUPLICATE",
        "message": "User already has this role assigned",
        "details": {
            "existing_assignment": {
                "role": "Depot Officer",
                "department": "depot-1"
            }
        }
    }
```

### UT-API-ERR-004: Permission Check Endpoint Responses
```python
def test_permission_check_permitted_response():
    """Test permission check endpoint - permitted response"""
    client = APIClient()
    global_user = create_user_with_role('Distribution Manager')
    client.force_authenticate(global_user)
    
    response = client.get('/api/v1/permissions/check', {
        'resource': 'transport_request',
        'action': 'approve',
        'record_id': 'tr-123'
    })
    
    assert response.status_code == 200
    assert response.json() == {
        "permitted": True,
        "user_role": "Distribution Manager",
        "functional_type": "Approver",
        "access_scope": "Global"
    }

def test_permission_check_denied_response():
    """Test permission check endpoint - denied response with reason"""
    client = APIClient()
    local_user = create_user_with_role('Depot Officer', department_id='depot-1')
    other_location_record = create_transport_request(location='depot-2')
    client.force_authenticate(local_user)
    
    response = client.get('/api/v1/permissions/check', {
        'resource': 'transport_request',
        'action': 'view',
        'record_id': str(other_location_record.id)
    })
    
    assert response.status_code == 200
    assert response.json() == {
        "permitted": False,
        "reason": "Local role cannot access this location",
        "user_role": "Depot Officer",
        "functional_type": "Requester",
        "access_scope": "Local",
        "user_location": "depot-1",
        "record_location": "depot-2"
    }
```

---

## UI Tests

### UI-RBAC-001: Role Assignment Interface
```javascript
describe('Role Assignment', () => {
  test('displays all 15 operational roles', () => {
    cy.visit('/admin/users/assign-role')
    cy.get('[data-testid="role-select"]').should('contain', 'Transport Planner')
    cy.get('[data-testid="role-select"]').should('contain', 'Depot Officer')
    cy.get('[data-testid="role-select"]').should('contain', 'Distribution Manager')
    // ... verify all 15 roles present
  })

  test('shows functional type and access scope for selected role', () => {
    cy.get('[data-testid="role-select"]').select('Transport Planner')
    cy.get('[data-testid="functional-type"]').should('contain', 'Executor')
    cy.get('[data-testid="access-scope"]').should('contain', 'Global')
    
    cy.get('[data-testid="role-select"]').select('Depot Officer')
    cy.get('[data-testid="functional-type"]').should('contain', 'Requester')
    cy.get('[data-testid="access-scope"]').should('contain', 'Local')
  })

  test('requires location assignment for Local roles', () => {
    cy.get('[data-testid="role-select"]').select('Depot Officer')
    cy.get('[data-testid="department-select"]').should('be.visible')
    cy.get('[data-testid="poi-select"]').should('be.visible')
    cy.get('[data-testid="assign-button"]').should('be.disabled')
    
    cy.get('[data-testid="department-select"]').select('Depot 1')
    cy.get('[data-testid="assign-button"]').should('not.be.disabled')
  })

  test('hides location assignment for Global roles', () => {
    cy.get('[data-testid="role-select"]').select('Distribution Manager')
    cy.get('[data-testid="department-select"]').should('not.be.visible')
    cy.get('[data-testid="poi-select"]').should('not.be.visible')
    cy.get('[data-testid="assign-button"]').should('not.be.disabled')
  })
})
```

### UI-RBAC-002: Menu and Button Visibility
```javascript
describe('Permission-based UI Visibility', () => {
  test('hides approval buttons for Requester roles', () => {
    cy.login_as('Depot Officer') // Requester role
    cy.visit('/transport-requests')
    cy.get('[data-testid="approve-button"]').should('not.exist')
    cy.get('[data-testid="reject-button"]').should('not.exist')
  })

  test('shows approval buttons for Approver roles', () => {
    cy.login_as('Distribution Manager') // Approver role
    cy.visit('/transport-requests')
    cy.get('[data-testid="approve-button"]').should('be.visible')
    cy.get('[data-testid="reject-button"]').should('be.visible')
  })

  test('Local role sees only assigned location data', () => {
    cy.login_as('Depot Officer', { department: 'Depot 1' })
    cy.visit('/transport-requests')
    cy.get('[data-testid="tr-row"]').should('contain', 'Depot 1')
    cy.get('[data-testid="tr-row"]').should('not.contain', 'Depot 2')
  })

  test('Global role sees all location data', () => {
    cy.login_as('Distribution Manager')
    cy.visit('/transport-requests')
    cy.get('[data-testid="tr-row"]').should('contain', 'Depot 1')
    cy.get('[data-testid="tr-row"]').should('contain', 'Depot 2')
    cy.get('[data-testid="tr-row"]').should('contain', 'Feed Mill 1')
  })

  test('disables buttons with tooltips for restricted actions', () => {
    cy.login_as('Depot Officer')
    cy.visit('/transport-orders/123')
    cy.get('[data-testid="approve-to-button"]').should('be.disabled')
    cy.get('[data-testid="approve-to-button"]').trigger('mouseover')
    cy.get('[data-testid="permission-tooltip"]').should('contain', 'Only Approver roles can approve')
  })
})
```

### UI-RBAC-003: Self-Approval Prevention in UI
```javascript
describe('Self-Approval Prevention', () => {
  test('cannot approve own requisition', () => {
    cy.login_as('Distribution Manager') // Approver role
    const requisition = cy.create_requisition({ created_by: 'current_user' })
    
    cy.visit(`/transport-requests/${requisition.id}`)
    cy.get('[data-testid="approve-button"]').should('be.disabled')
    cy.get('[data-testid="approve-button"]').trigger('mouseover')
    cy.get('[data-testid="permission-tooltip"]').should('contain', 'Cannot approve own requisition')
  })

  test('can approve others requisition', () => {
    cy.login_as('Distribution Manager')
    const other_requisition = cy.create_requisition({ created_by: 'other_user' })
    
    cy.visit(`/transport-requests/${other_requisition.id}`)
    cy.get('[data-testid="approve-button"]').should('be.enabled')
  })
})
```

### UI-RBAC-004: Cross-Tenant Access Prevention
```javascript
describe('Tenant Isolation', () => {
  test('cannot access other tenant data', () => {
    cy.login_as('Tenant1 Admin')
    cy.visit('/tenants/tenant2-data')
    cy.get('[data-testid="access-denied"]').should('contain', 'Access denied')
    cy.url().should('include', '/access-denied')
  })
})
```

---

## Integration Tests

### IT-RBAC-001: End-to-End Role Assignment Workflow
```python
@pytest.mark.integration
class TestRoleAssignmentWorkflow:
    def test_complete_role_assignment_flow(self, client, db):
        """Test full workflow: Admin assigns role → User gets permissions → Access validated"""
        # Setup
        tenant_admin = create_user_with_role('Tenant Admin', tenant='tenant-1')
        new_user = create_user(tenant='tenant-1')
        
        # Step 1: Tenant Admin logs in
        client.force_authenticate(tenant_admin)
        
        # Step 2: Admin assigns Depot Officer role with location
        response = client.post(f'/api/v1/admin/users/{new_user.id}/roles', {
            'role_id': get_role_id('Depot Officer'),
            'department_id': 'depot-1',
            'poi_id': 'poi-depot-1'
        })
        assert response.status_code == 201
        
        # Step 3: Verify role assignment persisted
        user_roles = UserRole.objects.filter(user=new_user)
        assert user_roles.count() == 1
        assert user_roles.first().role.name == 'Depot Officer'
        
        # Step 4: New user logs in and verifies permissions
        client.force_authenticate(new_user)
        
        # Step 5: User can access assigned location
        response = client.get('/api/v1/transport-requests/?location=depot-1')
        assert response.status_code == 200
        
        # Step 6: User cannot access other location
        response = client.get('/api/v1/transport-requests/?location=depot-2')
        assert response.status_code == 403
        
    def test_role_reassignment_updates_permissions(self, client, db):
        """Test that changing a user's role immediately updates their permissions"""
        user = create_user_with_role('Depot Officer', department_id='depot-1')
        admin = create_user_with_role('Tenant Admin')
        
        # Verify initial Local access
        client.force_authenticate(user)
        assert client.get('/api/v1/transport-requests/?location=depot-2').status_code == 403
        
        # Admin reassigns to Global role
        client.force_authenticate(admin)
        client.delete(f'/api/v1/admin/users/{user.id}/roles/{user.roles.first().id}')
        client.post(f'/api/v1/admin/users/{user.id}/roles', {
            'role_id': get_role_id('Distribution Manager')
        })
        
        # Verify new Global access
        client.force_authenticate(user)
        assert client.get('/api/v1/transport-requests/?location=depot-2').status_code == 200
```

### IT-RBAC-002: Permission Enforcement Across All Layers
```python
@pytest.mark.integration
class TestPermissionEnforcementLayers:
    def test_ui_api_db_permission_consistency(self, client, db, browser):
        """Verify permission enforcement is consistent across UI, API, and DB layers"""
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        
        # API Layer: Direct API call blocked
        client.force_authenticate(local_user)
        api_response = client.get('/api/v1/transport-requests/?location=depot-2')
        assert api_response.status_code == 403
        
        # DB Layer: Raw query filtered
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM transport_requests WHERE location_id = 'depot-2'",
                user_context={'user_id': local_user.id}
            )
            assert cursor.rowcount == 0  # RLS filters results
        
        # UI Layer: Selenium/Playwright verification
        browser.login_as(local_user)
        browser.visit('/transport-requests')
        visible_locations = browser.get_all('[data-testid="location-badge"]')
        assert all(loc.text == 'Depot 1' for loc in visible_locations)
        assert 'Depot 2' not in [loc.text for loc in visible_locations]
        
    def test_approval_button_hidden_and_api_blocked(self, client, browser):
        """Verify approval is blocked at both UI and API for Requester roles"""
        requester = create_user_with_role('Depot Officer')
        tr = create_transport_request()
        
        # UI: Button not visible
        browser.login_as(requester)
        browser.visit(f'/transport-requests/{tr.id}')
        assert not browser.is_visible('[data-testid="approve-button"]')
        
        # API: Request blocked
        client.force_authenticate(requester)
        response = client.post(f'/api/v1/transport-requests/{tr.id}/approve')
        assert response.status_code == 403
```

### IT-RBAC-003: Cross-Module Permission Consistency
```python
@pytest.mark.integration
class TestCrossModulePermissions:
    def test_local_role_restricted_across_all_modules(self, client, db):
        """Verify Local role restriction applies to all system modules"""
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        client.force_authenticate(local_user)
        
        modules_to_test = [
            '/api/v1/transport-requests/',
            '/api/v1/purchase-requisitions/',
            '/api/v1/quality-inspections/',
            '/api/v1/delivery-notes/',
        ]
        
        for module_endpoint in modules_to_test:
            # Can access own location
            response = client.get(f'{module_endpoint}?location=depot-1')
            assert response.status_code == 200, f"Failed for {module_endpoint}"
            
            # Cannot access other location
            response = client.get(f'{module_endpoint}?location=depot-2')
            assert response.status_code == 403, f"Should be blocked for {module_endpoint}"
            
    def test_global_role_access_across_all_modules(self, client, db):
        """Verify Global role can access all locations across all modules"""
        global_user = create_user_with_role('Distribution Manager')
        client.force_authenticate(global_user)
        
        locations = ['depot-1', 'depot-2', 'feedmill-1', 'commercial-1']
        
        for location in locations:
            response = client.get(f'/api/v1/transport-requests/?location={location}')
            assert response.status_code == 200, f"Global role should access {location}"
```

### IT-RBAC-004: Multi-Tenant Isolation Verification
```python
@pytest.mark.integration
class TestMultiTenantIsolation:
    def test_complete_tenant_isolation(self, client, db):
        """Verify complete data isolation between tenants"""
        # Setup two tenants with data
        tenant1_admin = create_user_with_role('Tenant Admin', tenant='tenant-1')
        tenant2_admin = create_user_with_role('Tenant Admin', tenant='tenant-2')
        
        tenant1_tr = create_transport_request(tenant='tenant-1')
        tenant2_tr = create_transport_request(tenant='tenant-2')
        
        # Tenant 1 admin cannot see Tenant 2 data
        client.force_authenticate(tenant1_admin)
        response = client.get('/api/v1/transport-requests/')
        request_ids = [r['id'] for r in response.json()['results']]
        assert str(tenant1_tr.id) in request_ids
        assert str(tenant2_tr.id) not in request_ids
        
        # Direct access to Tenant 2 record blocked
        response = client.get(f'/api/v1/transport-requests/{tenant2_tr.id}/')
        assert response.status_code == 404  # Not 403, to avoid information disclosure
        
    def test_tenant_role_scoping(self, client, db):
        """Verify roles are scoped to their tenant"""
        tenant1_admin = create_user_with_role('Tenant Admin', tenant='tenant-1')
        tenant2_user = create_user(tenant='tenant-2')
        
        # Tenant 1 admin cannot assign roles to Tenant 2 users
        client.force_authenticate(tenant1_admin)
        response = client.post(f'/api/v1/admin/users/{tenant2_user.id}/roles', {
            'role_id': get_role_id('Depot Officer', tenant='tenant-1')
        })
        assert response.status_code == 404  # User not found in tenant scope
```

### IT-RBAC-005: Session-Based Permission Caching and Invalidation
```python
@pytest.mark.integration
class TestPermissionCaching:
    def test_permission_cache_invalidation_on_role_change(self, client, cache, db):
        """Verify permission cache is invalidated when role changes"""
        user = create_user_with_role('Depot Officer', department_id='depot-1')
        admin = create_user_with_role('Tenant Admin')
        
        # Initial request populates cache
        client.force_authenticate(user)
        client.get('/api/v1/transport-requests/?location=depot-1')
        
        # Verify cache populated
        cache_key = f'permissions:{user.id}'
        assert cache.exists(cache_key)
        
        # Admin changes user's role
        client.force_authenticate(admin)
        client.post(f'/api/v1/admin/users/{user.id}/roles', {
            'role_id': get_role_id('Distribution Manager')
        })
        
        # Verify cache invalidated
        assert not cache.exists(cache_key)
        
        # User's next request reflects new permissions
        client.force_authenticate(user)
        response = client.get('/api/v1/transport-requests/?location=depot-2')
        assert response.status_code == 200  # Now has Global access
        
    def test_concurrent_permission_checks(self, client, db):
        """Verify permission system handles concurrent requests correctly"""
        import concurrent.futures
        
        user = create_user_with_role('Distribution Manager')
        
        def make_request(location):
            test_client = APIClient()
            test_client.force_authenticate(user)
            return test_client.get(f'/api/v1/transport-requests/?location={location}')
        
        locations = ['depot-1', 'depot-2', 'depot-3', 'feedmill-1', 'feedmill-2']
        
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            futures = [executor.submit(make_request, loc) for loc in locations]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed for Global role
        assert all(r.status_code == 200 for r in results)
```

---

## Security Tests

### SEC-RBAC-001: Permission Bypass Attempts
```python
@pytest.mark.security
class TestPermissionBypass:
    def test_direct_api_access_without_ui(self, client, db):
        """Test that direct API calls cannot bypass permission checks"""
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        other_location_record = create_transport_request(location='depot-2')
        
        client.force_authenticate(local_user)
        
        # Attempt direct access via various methods
        endpoints = [
            ('GET', f'/api/v1/transport-requests/{other_location_record.id}/'),
            ('PUT', f'/api/v1/transport-requests/{other_location_record.id}/'),
            ('PATCH', f'/api/v1/transport-requests/{other_location_record.id}/'),
            ('DELETE', f'/api/v1/transport-requests/{other_location_record.id}/'),
        ]
        
        for method, endpoint in endpoints:
            response = getattr(client, method.lower())(endpoint)
            assert response.status_code == 403, f"{method} {endpoint} should be blocked"
            
    def test_parameter_tampering_blocked(self, client, db):
        """Test that parameter tampering cannot escalate permissions"""
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        client.force_authenticate(local_user)
        
        # Attempt to inject different location in query params
        tampered_requests = [
            '/api/v1/transport-requests/?location=depot-2',
            '/api/v1/transport-requests/?department_id=depot-2',
            '/api/v1/transport-requests/?access_scope=Global',
        ]
        
        for endpoint in tampered_requests:
            response = client.get(endpoint)
            assert response.status_code == 403, f"Tampered request should be blocked: {endpoint}"
            
    def test_hidden_ui_elements_still_blocked_at_api(self, client, db):
        """Verify that hidden UI actions are also blocked at API level"""
        requester = create_user_with_role('Depot Officer')
        transport_request = create_transport_request()
        
        client.force_authenticate(requester)
        
        # Even though approve button is hidden, API should also block
        response = client.post(f'/api/v1/transport-requests/{transport_request.id}/approve/')
        assert response.status_code == 403
        assert 'Approver' in response.json().get('message', '')
```

### SEC-RBAC-002: Token Manipulation for Role Escalation
```python
@pytest.mark.security
class TestTokenManipulation:
    def test_jwt_role_claim_tampering_detected(self, client, db):
        """Test that JWT token role claim tampering is detected"""
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        
        # Get legitimate token
        legit_token = generate_token(local_user)
        
        # Attempt to tamper with role claims (simulate attacker)
        tampered_payload = decode_token(legit_token)
        tampered_payload['roles'] = ['Distribution Manager']
        tampered_payload['access_scope'] = 'Global'
        tampered_token = encode_token_unsigned(tampered_payload)
        
        # Tampered token should be rejected
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {tampered_token}')
        response = client.get('/api/v1/transport-requests/')
        assert response.status_code == 401  # Invalid signature
        
    def test_expired_token_rejected(self, client, db):
        """Test that expired tokens are rejected"""
        user = create_user_with_role('Distribution Manager')
        expired_token = generate_token(user, expires_in=-3600)  # Expired 1 hour ago
        
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')
        response = client.get('/api/v1/transport-requests/')
        assert response.status_code == 401
        
    def test_token_reuse_after_role_revocation(self, client, db):
        """Test that tokens become invalid after role revocation"""
        user = create_user_with_role('Distribution Manager')
        admin = create_user_with_role('Tenant Admin')
        
        # User gets token with Global access
        token = generate_token(user)
        
        # Admin revokes user's role
        client.force_authenticate(admin)
        client.delete(f'/api/v1/admin/users/{user.id}/roles/')
        
        # Old token should be invalidated or permissions should be re-evaluated
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = client.get('/api/v1/transport-requests/')
        # Either 401 (token invalidated) or 403 (no permissions)
        assert response.status_code in [401, 403]
```

### SEC-RBAC-003: Cross-Tenant Data Access Attempts
```python
@pytest.mark.security
class TestCrossTenantSecurity:
    def test_tenant_id_injection_blocked(self, client, db):
        """Test that tenant ID injection in requests is blocked"""
        tenant1_user = create_user_with_role('Distribution Manager', tenant='tenant-1')
        tenant2_record = create_transport_request(tenant='tenant-2')
        
        client.force_authenticate(tenant1_user)
        
        # Attempt to access via direct ID
        response = client.get(f'/api/v1/transport-requests/{tenant2_record.id}/')
        assert response.status_code == 404  # Not found in user's tenant scope
        
        # Attempt to inject tenant_id in query
        response = client.get('/api/v1/transport-requests/?tenant_id=tenant-2')
        assert response.status_code == 403
        
    def test_bulk_operations_tenant_isolated(self, client, db):
        """Test that bulk operations cannot cross tenant boundaries"""
        tenant1_user = create_user_with_role('Tenant Admin', tenant='tenant-1')
        tenant2_records = [create_transport_request(tenant='tenant-2') for _ in range(5)]
        
        client.force_authenticate(tenant1_user)
        
        # Attempt bulk update on other tenant's records
        response = client.patch('/api/v1/transport-requests/bulk-update/', {
            'ids': [str(r.id) for r in tenant2_records],
            'status': 'cancelled'
        })
        
        # Should either return 404 or process 0 records
        if response.status_code == 200:
            assert response.json()['updated_count'] == 0
        else:
            assert response.status_code in [403, 404]
            
    def test_cross_tenant_reference_blocked(self, client, db):
        """Test that creating records referencing other tenant's data is blocked"""
        tenant1_user = create_user_with_role('Depot Officer', tenant='tenant-1', department_id='depot-1')
        tenant2_vehicle = create_vehicle(tenant='tenant-2')
        
        client.force_authenticate(tenant1_user)
        
        # Attempt to create TR referencing other tenant's vehicle
        response = client.post('/api/v1/transport-requests/', {
            'vehicle_id': str(tenant2_vehicle.id),
            'origin': 'depot-1',
            'destination': 'feedmill-1'
        })
        
        assert response.status_code in [400, 404]  # Invalid reference
```

### SEC-RBAC-004: SQL Injection in Permission Queries
```python
@pytest.mark.security
class TestSQLInjection:
    def test_location_parameter_sql_injection(self, client, db):
        """Test that location parameters are sanitized against SQL injection"""
        user = create_user_with_role('Depot Officer', department_id='depot-1')
        client.force_authenticate(user)
        
        injection_attempts = [
            "depot-1' OR '1'='1",
            "depot-1; DROP TABLE users;--",
            "depot-1' UNION SELECT * FROM users--",
            "depot-1%27%20OR%20%271%27%3D%271",
        ]
        
        for injection in injection_attempts:
            response = client.get(f'/api/v1/transport-requests/?location={injection}')
            # Should either sanitize and return 403 or return error
            assert response.status_code in [400, 403, 404]
            # Verify database is intact
            assert User.objects.exists()
            
    def test_role_id_parameter_injection(self, client, db):
        """Test that role_id parameters are sanitized"""
        admin = create_user_with_role('Tenant Admin')
        user = create_user()
        
        client.force_authenticate(admin)
        
        injection_attempts = [
            "'; DELETE FROM roles;--",
            "1 OR 1=1",
            "${role_id}",
        ]
        
        for injection in injection_attempts:
            response = client.post(f'/api/v1/admin/users/{user.id}/roles', {
                'role_id': injection
            })
            assert response.status_code in [400, 404]
```

### SEC-RBAC-005: Session Hijacking Prevention
```python
@pytest.mark.security
class TestSessionSecurity:
    def test_session_bound_to_ip(self, client, db):
        """Test that sessions are optionally bound to IP address"""
        user = create_user_with_role('Distribution Manager')
        
        # Create session from IP 1
        client.defaults['REMOTE_ADDR'] = '192.168.1.100'
        token = login_and_get_token(client, user)
        
        # Attempt to use session from different IP
        client.defaults['REMOTE_ADDR'] = '10.0.0.50'
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        response = client.get('/api/v1/transport-requests/')
        
        # Based on security settings, may require re-authentication
        # This test documents expected behavior
        assert response.status_code in [200, 401, 403]
        
    def test_concurrent_session_limit(self, client, db):
        """Test that concurrent session limits are enforced"""
        user = create_user_with_role('Distribution Manager')
        
        # Create multiple sessions
        tokens = []
        for i in range(5):
            token = login_and_get_token(client, user, device_id=f'device-{i}')
            tokens.append(token)
        
        # Depending on policy, oldest sessions may be invalidated
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens[0]}')
        response = client.get('/api/v1/transport-requests/')
        
        # Document expected behavior based on session policy
        if response.status_code == 401:
            # Oldest session invalidated due to limit
            pass
        else:
            # All sessions allowed
            assert response.status_code == 200
            
    def test_session_invalidation_on_password_change(self, client, db):
        """Test that all sessions are invalidated when password changes"""
        user = create_user_with_role('Distribution Manager')
        old_token = login_and_get_token(client, user)
        
        # User changes password
        client.force_authenticate(user)
        client.post('/api/v1/auth/change-password/', {
            'old_password': 'old_password',
            'new_password': 'new_secure_password_123!'
        })
        
        # Old token should be invalidated
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_token}')
        response = client.get('/api/v1/transport-requests/')
        assert response.status_code == 401
```

---

## Performance Tests

### PERF-RBAC-001: Row-Level Security Query Performance
```python
@pytest.mark.performance
class TestRLSPerformance:
    def test_rls_query_performance_10k_records(self, client, db, benchmark):
        """Verify RLS query completes within 100ms for 10k records"""
        # Setup: Create 10,000 transport requests across multiple locations
        locations = ['depot-1', 'depot-2', 'depot-3', 'feedmill-1', 'feedmill-2']
        for i in range(10000):
            create_transport_request(location=locations[i % 5], batch=True)
        db.commit()
        
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        client.force_authenticate(local_user)
        
        # Benchmark the query with RLS applied
        def query_with_rls():
            return client.get('/api/v1/transport-requests/')
        
        result = benchmark(query_with_rls)
        
        # Assert performance requirements
        assert result.stats.mean < 0.100  # < 100ms average
        assert result.stats.max < 0.200   # < 200ms worst case
        assert result.response.status_code == 200
        # Should return only depot-1 records (~2000)
        assert len(result.response.json()['results']) <= 2000
        
    def test_rls_query_performance_100k_records(self, client, db, benchmark):
        """Verify RLS query scales for 100k records"""
        # Setup: Create 100,000 transport requests
        bulk_create_transport_requests(count=100000, locations=10)
        
        global_user = create_user_with_role('Distribution Manager')
        client.force_authenticate(global_user)
        
        def query_global_with_pagination():
            return client.get('/api/v1/transport-requests/?page_size=100')
        
        result = benchmark(query_global_with_pagination)
        
        assert result.stats.mean < 0.250  # < 250ms average for 100k
        assert result.stats.max < 0.500   # < 500ms worst case
        
    def test_rls_does_not_cause_n_plus_1_queries(self, client, db, django_assert_num_queries):
        """Verify RLS implementation doesn't cause N+1 query issues"""
        create_transport_requests(count=100, locations=['depot-1'])
        local_user = create_user_with_role('Depot Officer', department_id='depot-1')
        client.force_authenticate(local_user)
        
        # Should be constant number of queries regardless of result count
        with django_assert_num_queries(max=5):  # Base queries + RLS filter
            response = client.get('/api/v1/transport-requests/')
            assert response.status_code == 200
```

### PERF-RBAC-002: Permission Cache Effectiveness
```python
@pytest.mark.performance
class TestPermissionCachePerformance:
    def test_permission_cache_hit_rate(self, client, cache, db, benchmark):
        """Verify permission cache achieves >95% hit rate"""
        user = create_user_with_role('Distribution Manager')
        client.force_authenticate(user)
        
        cache_hits = 0
        cache_misses = 0
        
        # Warm up cache
        client.get('/api/v1/transport-requests/')
        
        # Make 1000 requests
        for _ in range(1000):
            before_hits = cache.info()['hits']
            client.get('/api/v1/transport-requests/')
            after_hits = cache.info()['hits']
            
            if after_hits > before_hits:
                cache_hits += 1
            else:
                cache_misses += 1
        
        hit_rate = cache_hits / (cache_hits + cache_misses)
        assert hit_rate > 0.95, f"Cache hit rate {hit_rate:.2%} below 95%"
        
    def test_permission_check_latency_cached_vs_uncached(self, client, cache, db):
        """Compare cached vs uncached permission check latency"""
        user = create_user_with_role('Distribution Manager')
        client.force_authenticate(user)
        
        # Uncached request (cold)
        cache.clear()
        start = time.perf_counter()
        client.get('/api/v1/permissions/check?resource=transport_request&action=view')
        uncached_latency = time.perf_counter() - start
        
        # Cached request (warm)
        start = time.perf_counter()
        client.get('/api/v1/permissions/check?resource=transport_request&action=view')
        cached_latency = time.perf_counter() - start
        
        # Cached should be at least 5x faster
        assert cached_latency < uncached_latency / 5
        # Cached should be < 5ms
        assert cached_latency < 0.005
        
    def test_cache_invalidation_latency(self, client, cache, db):
        """Verify cache invalidation completes quickly"""
        users = [create_user_with_role('Depot Officer', department_id=f'depot-{i}') 
                 for i in range(100)]
        
        # Populate cache
        for user in users:
            cache.set(f'permissions:{user.id}', user.get_permissions())
        
        # Measure bulk invalidation time
        start = time.perf_counter()
        for user in users:
            cache.delete(f'permissions:{user.id}')
        invalidation_time = time.perf_counter() - start
        
        # 100 invalidations should complete in < 50ms
        assert invalidation_time < 0.050
```

### PERF-RBAC-003: Concurrent Permission Validation
```python
@pytest.mark.performance
class TestConcurrentPermissions:
    def test_concurrent_permission_checks_under_load(self, client, db):
        """Verify permission system handles 100 concurrent requests"""
        import concurrent.futures
        
        users = [create_user_with_role('Distribution Manager') for _ in range(10)]
        
        def make_permission_check(user):
            test_client = APIClient()
            test_client.force_authenticate(user)
            start = time.perf_counter()
            response = test_client.get('/api/v1/transport-requests/')
            latency = time.perf_counter() - start
            return {
                'status': response.status_code,
                'latency': latency
            }
        
        # Run 100 concurrent requests (10 users x 10 requests each)
        with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
            futures = []
            for _ in range(10):
                for user in users:
                    futures.append(executor.submit(make_permission_check, user))
            
            results = [f.result() for f in concurrent.futures.as_completed(futures)]
        
        # All requests should succeed
        assert all(r['status'] == 200 for r in results)
        
        # P95 latency should be < 200ms
        latencies = sorted([r['latency'] for r in results])
        p95_latency = latencies[int(len(latencies) * 0.95)]
        assert p95_latency < 0.200
        
        # Average latency should be < 100ms
        avg_latency = sum(r['latency'] for r in results) / len(results)
        assert avg_latency < 0.100
        
    def test_permission_check_throughput(self, client, db, benchmark):
        """Verify permission system achieves minimum throughput"""
        user = create_user_with_role('Distribution Manager')
        client.force_authenticate(user)
        
        # Measure requests per second
        start = time.perf_counter()
        request_count = 0
        
        while time.perf_counter() - start < 1.0:  # Run for 1 second
            client.get('/api/v1/permissions/check?resource=tr&action=view')
            request_count += 1
        
        # Should handle at least 500 permission checks per second
        assert request_count >= 500, f"Throughput {request_count} rps below minimum 500 rps"
```

### PERF-RBAC-004: Role Assignment Performance
```python
@pytest.mark.performance
class TestRoleAssignmentPerformance:
    def test_bulk_role_assignment_performance(self, client, db, benchmark):
        """Verify bulk role assignment completes efficiently"""
        admin = create_user_with_role('Tenant Admin')
        users = [create_user() for _ in range(100)]
        role = Role.objects.get(name='Depot Officer')
        
        client.force_authenticate(admin)
        
        def bulk_assign():
            return client.post('/api/v1/admin/roles/bulk-assign', {
                'user_ids': [str(u.id) for u in users],
                'role_id': str(role.id),
                'department_id': 'depot-1'
            })
        
        result = benchmark(bulk_assign)
        
        # 100 role assignments should complete in < 2 seconds
        assert result.stats.mean < 2.0
        assert result.response.status_code == 200
        
    def test_role_lookup_performance_with_many_roles(self, client, db):
        """Verify role lookup remains fast with many custom roles"""
        admin = create_user_with_role('Tenant Admin')
        
        # Create 1000 custom roles
        for i in range(1000):
            Role.objects.create(
                name=f'Custom Role {i}',
                tenant_id='tenant-1',
                category='Operational',
                functional_type='Executor',
                access_scope='Local'
            )
        
        client.force_authenticate(admin)
        
        start = time.perf_counter()
        response = client.get('/api/v1/roles/')
        latency = time.perf_counter() - start
        
        # Should list 1000+ roles in < 100ms
        assert latency < 0.100
        assert response.status_code == 200
        assert len(response.json()['results']) >= 1000
```

### PERF-RBAC-005: Multi-Tenant Query Isolation Performance
```python
@pytest.mark.performance
class TestMultiTenantPerformance:
    def test_tenant_filter_performance_many_tenants(self, client, db):
        """Verify tenant filtering remains fast with many tenants"""
        # Setup: 100 tenants, 1000 records each
        tenants = [f'tenant-{i}' for i in range(100)]
        for tenant in tenants:
            bulk_create_transport_requests(count=1000, tenant=tenant)
        
        # Query as tenant-50 user
        user = create_user_with_role('Distribution Manager', tenant='tenant-50')
        client.force_authenticate(user)
        
        start = time.perf_counter()
        response = client.get('/api/v1/transport-requests/')
        latency = time.perf_counter() - start
        
        # Should filter to single tenant's 1000 records in < 100ms
        assert latency < 0.100
        assert response.status_code == 200
        
        # Verify only tenant-50 records returned
        results = response.json()['results']
        assert all(r['tenant_id'] == 'tenant-50' for r in results)
        
    def test_cross_tenant_query_blocked_without_performance_penalty(self, client, db):
        """Verify cross-tenant blocking doesn't add latency"""
        user = create_user_with_role('Distribution Manager', tenant='tenant-1')
        other_tenant_record = create_transport_request(tenant='tenant-2')
        
        client.force_authenticate(user)
        
        # Measure blocked request latency
        start = time.perf_counter()
        response = client.get(f'/api/v1/transport-requests/{other_tenant_record.id}/')
        blocked_latency = time.perf_counter() - start
        
        # Blocked requests should fail fast (< 20ms)
        assert blocked_latency < 0.020
        assert response.status_code == 404
```

---

## Test Coverage Requirements

### Unit Test Coverage
- [ ] Role creation and validation: 95% coverage
- [ ] Permission checking logic: 100% coverage
- [ ] Self-approval prevention: 100% coverage
- [ ] API middleware: 90% coverage
- [ ] Database row-level security: 95% coverage
- [ ] Tenant isolation: 100% coverage

### API Error Response Test Coverage
- [ ] Permission denied (403) response format: 100% coverage
- [ ] Tenant isolation error responses: 100% coverage
- [ ] Role assignment validation errors: 100% coverage
- [ ] Permission check endpoint responses: 100% coverage

### UI Test Coverage
- [ ] Role assignment interface: 90% coverage
- [ ] Menu/button visibility: 95% coverage
- [ ] Data filtering by access scope: 90% coverage
- [ ] Self-approval prevention: 100% coverage
- [ ] Cross-tenant access prevention: 100% coverage

### Integration Test Coverage
- [ ] End-to-end role assignment workflow: 100% coverage
- [ ] Permission enforcement across UI, API, and database layers: 100% coverage
- [ ] Self-approval prevention across all interfaces: 100% coverage
- [ ] Local vs Global access control across all modules: 100% coverage
- [ ] Multi-tenant isolation verification: 100% coverage
- [ ] Session-based permission caching: 90% coverage

### Security Test Coverage
- [ ] Permission bypass attempts: 100% coverage
- [ ] Token manipulation detection: 100% coverage
- [ ] Cross-tenant data access prevention: 100% coverage
- [ ] SQL injection prevention: 100% coverage
- [ ] Session hijacking prevention: 90% coverage

### Performance Test Coverage
- [ ] RLS query performance (< 100ms for 10k records): Pass/Fail
- [ ] Permission cache hit rate (> 95%): Pass/Fail
- [ ] Concurrent permission checks (100 concurrent): Pass/Fail
- [ ] Permission check throughput (> 500 rps): Pass/Fail
- [ ] Multi-tenant query isolation (< 100ms): Pass/Fail

---

## Dependencies

### Prerequisites
- ✅ US-001: User Login & Account Lockout

### Enables
- → US-005: User Invitation & Activation (role assignment)
- → All operational workflows (permission enforcement)

---

## Definition of Done

### Functional Requirements
- [ ] Role hierarchy defined with 15 operational roles + 3 administrative roles (see AC-1 tables)
- [ ] Functional types (Requester, Approver, Executor, Administrator) implemented
- [ ] Access scope (Global, Local, System-Wide) enforced at database level
- [ ] Permission enforcement at UI, API, and database layers
- [ ] Self-approval prevention with functional type validation
- [ ] Row-level security for Local vs Global access
- [ ] Multi-tenant isolation enforced

### Test Requirements
- [ ] Unit tests > 80% code coverage
- [ ] API error response tests: All error codes documented and tested
- [ ] Integration tests: All 5 scenarios passing
- [ ] Security tests: All 5 categories passing (no critical vulnerabilities)
- [ ] Performance tests: All benchmarks meeting SLA requirements
- [ ] UI tests: All role assignment and permission visibility scenarios passing

### Documentation & Review
- [ ] API documentation updated with error response formats
- [ ] Security review completed
- [ ] Code review approved
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
