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
updated: 2026-02-23
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
| | Transport Distribution Officer (TDO) | Executor | Global |
| QA / QC | QC Inspector – Physical | Executor | Local |
| | QA Lab Technician | Executor | Local |
| Operations | Command Center Officer | Executor | Local |
| | Loading Personnel | Executor | Local |
| | Unloading Personnel | Executor | Local |
| | Driver Supervisor | Executor | Local |
| | Driver Helper | Executor | Local |

- [ ] System SHALL ensure Local roles only access records within their assigned location
- [ ] System SHALL ensure Global roles can access requests across all locations within the tenant

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
- **Administrative roles**: Super Admin, Tenant Admin, Department Admin
- **Operational roles**: 15 pre-defined roles across 5 departments (see AC-1 table)
- Each role has a Functional Type: Requester, Approver, or Executor
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
  department: string (nullable)
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

---

## Dependencies

### Prerequisites
- ✅ US-001: User Login & Account Lockout

### Enables
- → US-005: User Invitation & Activation (role assignment)
- → All operational workflows (permission enforcement)

---

## Definition of Done
- [ ] Role hierarchy defined with 15 operational roles (see AC-1 table)
- [ ] Functional types (Requester, Approver, Executor) implemented
- [ ] Access scope (Global, Local) enforced at database level
- [ ] Permission enforcement at UI, API, and database layers
- [ ] Self-approval prevention with functional type validation
- [ ] Row-level security for Local vs Global access
- [ ] Unit tests > 80%
- [ ] Integration tests for approval constraints
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
