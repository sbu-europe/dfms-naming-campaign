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
- Enforce role-based permissions at UI, API, and database levels
- Allow Department Admins to assign operational roles within their departments
- Prevent users from approving their own requisitions

---

## Acceptance Criteria

### AC-1: Role Structure
- [ ] System SHALL define hierarchical role structure with pre-defined roles
- [ ] System SHALL categorize roles as Administrative and Operational
- [ ] System SHALL assign each role a specific permission scope and access rights
- [ ] System SHALL allow Department Admins to assign operational roles within their departments

### AC-2: Permission Enforcement
- [ ] System SHALL enforce permissions at UI level (menu/button visibility)
- [ ] System SHALL enforce permissions at API level (endpoint access validation)
- [ ] System SHALL enforce permissions at database level (row-level security where applicable)

### AC-3: Approval Constraints
- [ ] System SHALL prevent users from approving their own requisitions
- [ ] System SHALL enforce Requester vs Approver role separation

### AC-4: Role Types
- [ ] System SHALL support functional role types (Requester, Approver, Executor)
- [ ] System SHALL scope all roles to tenant level (multi-tenant isolation)

---

## Functional Requirements

### FR-001: RBAC
- [Critical] Hierarchical role structure
- [Critical] Permission scope per role
- [Critical] Department-level role assignment

### FR-002: Access Control
- [Critical] UI-level permission enforcement
- [Critical] API-level permission enforcement
- [High] Row-level security for sensitive data

---

## Business Rules

### BR-RBAC-001: Role Hierarchy
- Administrative roles: Super Admin, Tenant Admin, Department Admin
- Operational roles: Transport Planner, TDO, QC Inspector, etc.
- **Enforcement**: RBAC service

### BR-RBAC-002: Self-Approval Prevention
- Users cannot approve their own requisitions
- **Enforcement**: Approval workflow validation

### BR-RBAC-003: Tenant Isolation
- All roles scoped to tenant
- **Enforcement**: Multi-tenant middleware

---

## Data Model

```typescript
Role {
  role_id: UUID
  tenant_id: UUID
  name: string
  category: Enum (Administrative, Operational)
  permissions: JSON (array of permission codes)
}

UserRole {
  user_id: UUID
  role_id: UUID
  department_id: UUID (nullable)
  assigned_by: UUID
  assigned_at: DateTime
}

Permission {
  permission_code: string
  resource: string
  action: string
  scope: Enum (tenant, department, self)
}
```

---

## UI/UX Requirements

### Role Assignment (Admin)
```
┌─────────────────────────────────────────┐
│ Assign Role: john.doe                   │
├─────────────────────────────────────────┤
│ Department: [Transport ▼]                │
│ Role:      [Transport Planner ▼]         │
│                                         │
│ Permissions: (read-only summary)         │
│ • View TOs, Create TOs, Assign Fleet     │
│ • Cannot approve own requisitions        │
│                                         │
│ [Assign]  [Cancel]                       │
└─────────────────────────────────────────┘
```

### Menu/Button Visibility
- UI elements hidden based on permission scope
- Disabled state with tooltip when action not permitted

---

## API Endpoints

```typescript
GET /api/v1/roles
Response: { roles: [{ role_id, name, category, permissions }] }

GET /api/v1/users/{user_id}/roles
Response: { roles: [{ role_id, department_id }] }

POST /api/v1/admin/users/{user_id}/roles
Body: { role_id, department_id? }
Response: { success }

GET /api/v1/permissions/check
Query: resource, action
Response: { permitted: boolean }
```

---

## Testing Scenarios

### Happy Path
1. Department Admin assigns Transport Planner role → User sees TO menu
2. User creates requisition → Cannot approve own requisition (button hidden)

### Edge Cases
1. **Self-approval attempt**: API returns 403
2. **Cross-tenant role access**: Denied
3. **Permission escalation**: Validation prevents higher scope assignment

---

## Dependencies

### Prerequisites
- ✅ US-001: User Login & Account Lockout

### Enables
- → US-005: User Invitation & Activation (role assignment)
- → All operational workflows (permission enforcement)

---

## Definition of Done
- [ ] Role hierarchy defined
- [ ] Permission enforcement at UI and API
- [ ] Self-approval prevention
- [ ] Unit tests > 80%
- [ ] UAT approved

---

**Story Points**: 10  
**Estimated Hours**: 80 hours  
**Sprint**: Sprint 1  
**Priority**: Critical
