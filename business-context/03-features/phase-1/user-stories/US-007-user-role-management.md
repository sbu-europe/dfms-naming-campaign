---
title: User and Role Management
story_id: US-007
phase: phase-1
module: Master Data Management
priority: Critical
status: Pending
epic: Master Data Foundation
sprint: Sprint 2
story_points: 8
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.docx
related_stories:
  - US-008-tenant-configuration.md
tags: [master-data, user, role, rbac, security, critical]
---

# US-007: User and Role Management

## User Story

**As a** System Administrator  
**I want to** create and manage user accounts with role-based access control  
**So that** different stakeholders can access the system with appropriate permissions

## Business Context

DFMS serves multiple user roles:
- **Admin**: System configuration, user management
- **Transport Planner**: TR assessment, TO creation
- **TDO (Own Fleet)**: Own fleet TO assignment
- **TDO (Vendor Fleet)**: Vendor fleet TO assignment, bidding management
- **Fleet Manager**: Vehicle, driver, helper management
- **Vendor Manager**: Vendor onboarding, verification
- **Gate Operator**: Gate-in/out operations
- **Scale Operator**: Weighing operations
- **Command Center**: Queue monitoring, dashboard
- **QC Supervisor**: Sample creation, physical inspection
- **Lab Technician**: Lab testing
- **QC Manager**: QC decision (pass/fail)
- **Finance Manager**: Trip costing, vendor payments
- **Driver**: Mobile app (trip execution, POD)
- **Vendor**: Vendor portal (bidding, TO view)

---

## Acceptance Criteria

### AC-1: User Registration
- [ ] System SHALL allow Admin to create user with:
  - Full Name
  - Email (unique)
  - Phone (unique)
  - Username (unique)
  - Password (encrypted)
  - Role(s) (multi-role support)
  - Department
  - Employee ID
  - Status (Active/Inactive)
- [ ] System SHALL validate email format
- [ ] System SHALL enforce strong password policy
- [ ] System SHALL send welcome email with credentials

### AC-2: Role Management
- [ ] System SHALL provide predefined roles with permissions
- [ ] System SHALL allow Admin to create custom roles
- [ ] System SHALL define permissions per role:
  - Module access (which screens)
  - Action permissions (create, read, update, delete)
  - Data access (own data, department data, all data)
- [ ] System SHALL support multi-role assignment per user

### AC-3: Permission Matrix
- [ ] System SHALL enforce role-based access control (RBAC)
- [ ] System SHALL hide unauthorized menu items
- [ ] System SHALL block unauthorized API calls
- [ ] System SHALL log unauthorized access attempts

### AC-4: User Authentication
- [ ] System SHALL provide login with username/email + password
- [ ] System SHALL implement JWT token-based authentication
- [ ] System SHALL support "Remember Me" (30-day session)
- [ ] System SHALL provide "Forgot Password" workflow
- [ ] System SHALL lock account after 5 failed login attempts

### AC-5: User Profile Management
- [ ] System SHALL allow users to view/edit their profile
- [ ] System SHALL allow users to change password
- [ ] System SHALL allow users to upload profile photo
- [ ] System SHALL display user's role and permissions

---

## Functional Requirements

### FR-001: User Registration
- [Critical] User registration form with validation
- [Critical] Password encryption (bcrypt, min 10 rounds)
- [High] Email verification (optional)
- [High] Bulk user import (Excel)

### FR-002: Role & Permission Management
- [Critical] Role creation with permission assignment
- [Critical] Permission matrix UI (checkboxes per module/action)
- [High] Role cloning (create role from existing)
- [Medium] Permission inheritance (role hierarchy)

### FR-003: Authentication
- [Critical] JWT token generation and validation
- [Critical] Token refresh mechanism
- [High] Session management (logout, timeout)
- [Medium] Two-factor authentication (2FA) - optional

### FR-004: Authorization
- [Critical] Middleware for API authorization
- [Critical] Frontend route guards
- [High] Data-level access control (row-level security)

---

## Business Rules

### BR-UM-001: Unique Credentials
- Email, Phone, Username must be unique
- **Enforcement**: Database constraints

### BR-UM-002: Password Policy
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special char
- **Enforcement**: Input validation

### BR-UM-003: Account Lockout
- Lock after 5 failed login attempts
- Auto-unlock after 30 minutes or admin unlock
- **Enforcement**: Login logic

### BR-UM-004: Role Requirement
- Every user must have at least one role
- **Enforcement**: Validation during user creation

### BR-UM-005: Admin Protection
- At least one Admin user must exist (cannot delete last admin)
- **Enforcement**: Delete validation

---

## Data Model

```typescript
User {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  full_name: String
  email: String (unique)
  phone: String (unique)
  username: String (unique)
  password_hash: String
  
  employee_id: String (nullable)
  department: String (nullable)
  profile_photo_url: String (nullable)
  
  status: Enum (Active, Inactive, Locked)
  failed_login_attempts: Integer (default: 0)
  locked_until: Timestamp (nullable)
  
  last_login_at: Timestamp (nullable)
  password_changed_at: Timestamp
  
  created_at: Timestamp
  created_by: UUID (FK to User, nullable)
  updated_at: Timestamp
  updated_by: UUID (FK to User, nullable)
}

Role {
  id: UUID (PK)
  tenant_id: UUID (FK)
  
  role_name: String (unique per tenant)
  role_code: String (unique per tenant)
  description: Text
  
  is_system_role: Boolean (default: false, system roles cannot be deleted)
  
  created_at: Timestamp
  created_by: UUID (FK)
}

Permission {
  id: UUID (PK)
  
  permission_code: String (unique, e.g., "vehicle.create", "to.assign")
  permission_name: String
  module: String (e.g., "Master Data", "Transport")
  description: Text
}

RolePermission {
  id: UUID (PK)
  role_id: UUID (FK to Role)
  permission_id: UUID (FK to Permission)
  
  UNIQUE(role_id, permission_id)
}

UserRole {
  id: UUID (PK)
  user_id: UUID (FK to User)
  role_id: UUID (FK to Role)
  
  assigned_at: Timestamp
  assigned_by: UUID (FK to User)
  
  UNIQUE(user_id, role_id)
}
```

---

## UI/UX Requirements

### User Registration Form
```
┌─────────────────────────────────────────┐
│ Create New User                         │
├─────────────────────────────────────────┤
│ Full Name: *                            │
│ [_____________________________]         │
│                                         │
│ Email: *                                │
│ [_____________________________]         │
│                                         │
│ Phone: *                                │
│ [_____________________________]         │
│                                         │
│ Username: *                             │
│ [_____________________________]         │
│                                         │
│ Password: *                             │
│ [_____________________________]         │
│ Strength: ████░░░░ Medium               │
│                                         │
│ Assign Roles: *                         │
│ ☑ Transport Planner                     │
│ ☐ TDO (Own Fleet)                       │
│ ☐ Fleet Manager                         │
│ ☐ Admin                                 │
│                                         │
│ Department:                             │
│ [Operations                   ▼]        │
│                                         │
│ [Cancel]              [Create User]     │
└─────────────────────────────────────────┘
```

### Role & Permission Matrix
```
┌──────────────────────────────────────────────────────────────┐
│ Role: Transport Planner                          [Edit] [Save]│
├──────────────────────────────────────────────────────────────┤
│ Module              Create  Read  Update  Delete  Special    │
│ ──────────────────────────────────────────────────────────  │
│ Master Data         ☐       ☑     ☐      ☐                  │
│ Product Requisition ☐       ☑     ☐      ☐                  │
│ Transport Mgmt      ☑       ☑     ☑      ☐      Assign TOs  │
│ Vendor Mgmt         ☐       ☑     ☐      ☐                  │
│ Operations          ☐       ☑     ☐      ☐                  │
│ Quality Control     ☐       ☑     ☐      ☐                  │
│ Fleet Mgmt          ☐       ☑     ☐      ☐                  │
│ Reporting           ☐       ☑     ☐      ☐                  │
└──────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Authentication
POST /api/v1/auth/login
Body: {username, password}
Response: {token, user, roles, permissions}

POST /api/v1/auth/logout

POST /api/v1/auth/refresh-token
Body: {refresh_token}

POST /api/v1/auth/forgot-password
Body: {email}

POST /api/v1/auth/reset-password
Body: {token, new_password}

// User Management
POST /api/v1/users
GET /api/v1/users
GET /api/v1/users/{user_id}
PATCH /api/v1/users/{user_id}
DELETE /api/v1/users/{user_id}

// Role Management
POST /api/v1/roles
GET /api/v1/roles
GET /api/v1/roles/{role_id}
PATCH /api/v1/roles/{role_id}
DELETE /api/v1/roles/{role_id}

// Permission Management
GET /api/v1/permissions
POST /api/v1/roles/{role_id}/permissions
Body: {permission_ids: UUID[]}

// User Role Assignment
POST /api/v1/users/{user_id}/roles
Body: {role_ids: UUID[]}

// Check Permission
GET /api/v1/auth/check-permission
Query: ?permission_code=vehicle.create
Response: {has_permission: boolean}
```

---

## Testing Scenarios

### Happy Path
1. Admin creates user → User created, welcome email sent
2. User logs in → JWT token returned
3. User accesses authorized page → Access granted
4. User attempts unauthorized action → Access denied

### Edge Cases
1. **5 failed login attempts**: Account locked
2. **Duplicate email**: Error
3. **Weak password**: Validation error
4. **Delete last admin**: Blocked

---

## Dependencies

### Prerequisites
- None (foundation module)

### Enables
- → ALL other user stories (authentication required)

---

## Definition of Done
- [ ] User CRUD operations
- [ ] Role & permission management
- [ ] JWT authentication
- [ ] RBAC middleware
- [ ] Frontend route guards
- [ ] Password encryption
- [ ] Account lockout mechanism
- [ ] Unit tests > 90%
- [ ] Security audit passed
- [ ] UAT approved

---

**Story Points**: 8  
**Estimated Hours**: 64 hours  
**Sprint**: Sprint 2  
**Priority**: Critical (Foundation for all access control)

