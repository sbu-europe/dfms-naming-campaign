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
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
related_stories:
  - US-008-tenant-configuration.md
  - US-064-subscription-plan-selection.md
  - US-065-user-invitation-activation.md
  - US-066-otp-verification.md
tags: [master-data, user, role, rbac, security, critical]
---

# US-007: User and Role Management

## User Story

**As a** System Administrator  
**I want to** create and manage user accounts with role-based access control  
**So that** different stakeholders can access the system with appropriate permissions

## Business Context

DFMS implements a hierarchical role-based access control (RBAC) system with two main role categories:

### Administrative Roles
- **Super Admin**: Manages global configurations, plans, billing, subscription plans, and tenant-level controls across all organizations
- **Tenant Admin (Organization Admin)**: Manages users, roles, master data, depots, Product Catalogue, Vehicle, Driver and Helper, vendors within their organization
- **Department Admin**: Department-level admin for Transport, Distribution, QA/QC, Fleet, Accounts, Commercial, Procurement, Depot, and Feed Mill departments

### Operational Roles
Operational roles perform day-to-day execution and cannot manage users or system configurations:
- **Product Transfer Requester** (Depot/Feed Mill/Commercial): Create transfer requisitions
- **Distribution Officer (DO)**: Creates Transport Request (TR) and forwards to Distribution Manager
- **Distribution Manager (DM)**: Approves TRs and validates capacity per POI
- **Procurement Officer**: Creates TR and approves Port Transfer requisition with distribution breakdown plan
- **Transport Planner (TP)**: Creates TOs, assigns fleet (Own vs Vendor), manages trips
- **Transport Distribution Officer (TDO)**: Manages Vehicle, Driver, and Helper Assignment and ETA
- **Gate Operation (Gate man)**: Manages gate-in/gate-out entries
- **Scaling Operator**: Enters Scale-in/Scale-out weights and prints queue token
- **Command Center Officer**: Assigns loading/unloading lines based on product type and urgency
- **Loading/Unloading Operators**: Logs loading/unloading start/end times
- **QC Inspector - Physical**: Performs physical QC checks, sampling and approval
- **QC Lab Technician**: Performs lab testing and updates reports
- **Driver Supervisor**: Manages driver-vehicle handover checklist, driver and helper attendance
- **Driver**: Uses mobile interface for trip updates
- **Helper**: Optional – associated with drivers
- **Vendors**: Manages bidding, vehicle information submission, invoice submissions
- **Accounts/Finance Officer**: Utilizes platform reports like trip costing, vendor invoices & billings

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
- [ ] System SHALL provide hierarchical role structure with pre-defined roles:
  - Administrative roles: Super Admin, Tenant Admin, Department Admin
  - Operational roles: Distribution Officer, Transport Planner, QC Inspector, etc.
- [ ] System SHALL categorize roles into Administrative and Operational
- [ ] System SHALL define permissions per role:
  - Module access (which screens)
  - Action permissions (create, read, update, delete)
  - Data access (own data, department data, all data)
- [ ] System SHALL support multi-role assignment per user
- [ ] System SHALL support role flags: Requester, Approver, Executor
- [ ] System SHALL enforce task-specific access for operational roles (e.g., Gate Operator only access gate operations)
- [ ] System SHALL prevent same user from approving their own requisition
- [ ] System SHALL scope all roles to tenant level (multi-tenant isolation)

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
- [ ] System SHALL lock account after 3 failed login attempts within 15 minutes
- [ ] System SHALL temporarily lock account for 30 minutes after 3 failed attempts
- [ ] System SHALL require Multi-Factor Authentication (MFA) for Admin user roles
- [ ] System SHALL support OTP delivery via email or SMS for MFA
- [ ] System SHALL require MFA verification after successful password validation
- [ ] System SHALL remember trusted devices for 30 days to reduce MFA frequency

### AC-5: User Profile Management
- [ ] System SHALL allow users to view/edit their profile
- [ ] System SHALL allow users to change password
- [ ] System SHALL allow users to upload profile photo
- [ ] System SHALL display user's role and permissions

### AC-6: Session Control
- [ ] System SHALL track all active user sessions with IP address and device identifier
- [ ] System SHALL auto-logout idle users after 30 minutes of inactivity
- [ ] System SHALL reset inactivity timer on any user action (click, scroll, keyboard input)
- [ ] System SHALL display active sessions to user
- [ ] System SHALL allow users to terminate specific sessions

### AC-7: Multi-Tenant RBAC Isolation
- [ ] System SHALL scope all roles (pre-defined and custom) to tenant level
- [ ] System SHALL automatically validate tenant ID in all permission checks
- [ ] System SHALL prevent cross-tenant role assignments (User from Tenant A cannot be assigned role from Tenant B)
- [ ] System SHALL filter role-based queries by tenant context
- [ ] System SHALL ensure Tenant Admin can only view/manage roles within their tenant
- [ ] System SHALL allow Super Admin to view roles across all tenants for platform management

---

## Functional Requirements

### FR-001: User Registration
- [Critical] User registration form with validation
- [Critical] Password encryption (bcrypt, min 10 rounds)
- [High] Email verification (optional)
- [High] Bulk user import (Excel)

### FR-002: Role & Permission Management
- [Critical] Hierarchical role structure with pre-defined roles (Administrative and Operational)
- [Critical] Role creation with permission assignment
- [Critical] Permission matrix UI (checkboxes per module/action)
- [Critical] Role flags: Requester, Approver, Executor
- [Critical] Department assignment during user creation
- [Critical] Task-specific access enforcement for operational roles
- [Critical] Tenant-level role scoping (multi-tenant isolation)
- [High] Role cloning (create role from existing)
- [Medium] Permission inheritance (role hierarchy)
- [Future Phase 2] Dynamic Role Builder for custom roles with granular permissions

### FR-003: Authentication
- [Critical] JWT token generation and validation
- [Critical] Token refresh mechanism
- [Critical] Multi-Factor Authentication (MFA) required for Admin roles
- [Critical] OTP delivery via email or SMS for MFA
- [Critical] MFA verification after password validation
- [High] Session management (logout, timeout)
- [High] Trusted device memory (30 days) to reduce MFA frequency
- [High] Account lockout after 3 failed attempts within 15 minutes
- [High] Admin unlock capability with offline verification

### FR-004: Authorization
- [Critical] Middleware for API authorization
- [Critical] Frontend route guards
- [Critical] Tenant ID validation in all permission checks
- [Critical] Permission enforcement at UI level (menu visibility, button access)
- [Critical] Permission enforcement at API level (endpoint access validation)
- [Critical] Permission enforcement at database level (row-level security)
- [Critical] Self-approval prevention (user cannot approve own requisition)
- [High] Data-level access control (row-level security)
- [High] Department-level data filtering

### FR-005: Session Control
- [Critical] Active session tracking (IP address, device identifier)
- [Critical] Auto-logout after 30 minutes of inactivity
- [Critical] Inactivity timer reset on user actions
- [High] Session management UI (view active sessions, terminate sessions)
- [High] Concurrent session control

### FR-006: Multi-Tenant RBAC Isolation
- [Critical] Tenant-level role scoping
- [Critical] Tenant ID auto-appended to all role queries
- [Critical] Cross-tenant role assignment prevention
- [Critical] Tenant context validation in permission checks
- [High] Tenant ID tampering prevention through request validation

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
- Lock after 3 failed login attempts within 15 minutes
- Temporary lock for 30 minutes after 3 failed attempts
- Admin can unlock after offline/phone verification
- Failed-attempt counter resets to zero upon unlock
- **Enforcement**: Login logic

### BR-UM-004: Role Requirement
- Every user must have at least one role
- **Enforcement**: Validation during user creation

### BR-UM-005: Admin Protection
- At least one Admin user must exist (cannot delete last admin)
- **Enforcement**: Delete validation

### BR-UM-006: Multi-Factor Authentication
- MFA required for Admin user roles (Super Admin, Tenant Admin)
- OTP delivery via email or SMS
- MFA verification required after password validation
- Trusted devices remembered for 30 days
- **Enforcement**: Authentication flow

### BR-UM-007: Session Control
- Auto-logout after 30 minutes of inactivity
- Any user action (click, scroll, keyboard input) resets inactivity timer
- Active sessions tracked with IP and device ID
- **Enforcement**: Session management middleware

### BR-UM-008: Role Hierarchy
- Roles categorized into Administrative and Operational
- Operational roles have task-specific access only
- Department Admin can assign operational roles under their department
- Role flags: Requester, Approver, Executor
- Same user cannot approve their own requisition
- **Enforcement**: RBAC logic

### BR-UM-009: Multi-Tenant Isolation
- All roles scoped to tenant level
- Tenant ID validated in all permission checks
- Cross-tenant role assignments prevented
- Tenant Admin can only view/manage roles within their tenant
- Super Admin can view roles across all tenants
- **Enforcement**: Tenant context validation

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
  
  role_category: Enum (Administrative, Operational)
  role_type: Enum (Super_Admin, Tenant_Admin, Department_Admin, Operational)
  functional_type: Enum (Requester, Approver, Executor, nullable)
  department: String (nullable, for Department Admin and Operational roles)
  
  is_system_role: Boolean (default: false, system roles cannot be deleted or modified)
  is_custom_role: Boolean (default: false, Phase 2: Dynamic Role Builder)
  
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

Session {
  id: UUID (PK)
  user_id: UUID (FK to User)
  tenant_id: UUID (FK)
  
  token: String (JWT token)
  refresh_token: String
  ip_address: String
  device_id: String
  user_agent: String
  location: String (optional)
  
  is_active: Boolean
  last_activity_at: Timestamp
  expires_at: Timestamp
  created_at: Timestamp
}

TrustedDevice {
  id: UUID (PK)
  user_id: UUID (FK to User)
  device_id: String
  device_name: String (optional)
  
  trusted_until: Timestamp (30 days from first MFA)
  created_at: Timestamp
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
Response: {token, user, roles, permissions, requires_mfa: boolean}

POST /api/v1/auth/mfa/verify
Body: {otp, device_id}
Response: {token, user, roles, permissions, trusted_device: boolean}

POST /api/v1/auth/logout
Body: {session_id} (optional, logout specific session)

POST /api/v1/auth/logout-all
Logout all sessions for user

POST /api/v1/auth/refresh-token
Body: {refresh_token}

POST /api/v1/auth/forgot-password
Body: {email}

POST /api/v1/auth/reset-password
Body: {token, new_password}

GET /api/v1/auth/sessions
Get all active sessions for current user

DELETE /api/v1/auth/sessions/{session_id}
Terminate specific session

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

// Admin Unlock
POST /api/v1/admin/users/{user_id}/unlock
Body: {verification_method, remarks}
Response: {success: boolean, message}

GET /api/v1/admin/users/locked
Get all locked user accounts
```

---

## Testing Scenarios

### Happy Path
1. Admin creates user → User created, welcome email sent
2. User logs in → JWT token returned
3. User accesses authorized page → Access granted
4. User attempts unauthorized action → Access denied

### Edge Cases
1. **3 failed login attempts**: Account locked for 30 minutes
2. **Admin unlock**: Account unlocked after offline verification
3. **MFA required**: Admin user must complete MFA after password
4. **Trusted device**: MFA skipped for 30 days on trusted device
5. **30-minute inactivity**: User auto-logged out
6. **Duplicate email**: Error
7. **Weak password**: Validation error
8. **Delete last admin**: Blocked
9. **Cross-tenant role assignment**: Blocked
10. **Self-approval**: User cannot approve own requisition
11. **Inactive session access**: Token expired, re-authentication required

---

## Dependencies

### Prerequisites
- None (foundation module)

### Enables
- → ALL other user stories (authentication required)

---

## Definition of Done
- [ ] User CRUD operations
- [ ] Hierarchical role structure (Administrative and Operational)
- [ ] Role & permission management with tenant isolation
- [ ] JWT authentication
- [ ] Multi-Factor Authentication (MFA) for Admin roles
- [ ] OTP delivery (email/SMS) for MFA
- [ ] Session control (tracking, auto-logout after 30 min inactivity)
- [ ] Trusted device management
- [ ] Account lockout mechanism (3 attempts, 30 min lock)
- [ ] Admin unlock capability
- [ ] RBAC middleware with tenant validation
- [ ] Frontend route guards
- [ ] Self-approval prevention
- [ ] Password encryption
- [ ] Multi-tenant role isolation
- [ ] Unit tests > 90%
- [ ] Security audit passed
- [ ] UAT approved

## Future Enhancements (Phase 2)

### Dynamic Role Builder
- [ ] Super Admin can create custom roles with granular permissions
- [ ] Permission matrix organized by modules
- [ ] Role cloning functionality
- [ ] Custom role deactivation/deletion (only if no users assigned)
- [ ] System role protection (cannot modify pre-defined roles)

**Source**: PRD Section 6.1.5 (Dynamic Role Builder - Version 2.0)

---

**Story Points**: 13 (increased due to MFA, Session Control, Multi-Tenant RBAC)  
**Estimated Hours**: 104 hours  
**Sprint**: Sprint 2  
**Priority**: Critical (Foundation for all access control)

---

**Source Documents**:
- PRD Section 6.1.1: Authentication & Security
- PRD Section 6.1.2: Multi-Factor Authentication (2FA)
- PRD Section 6.1.3: Session Control
- PRD Section 6.1.4: Role-based Access Control (Role Hierarchy)
- PRD Section 6.1.5: Dynamic Role Builder (Phase 2)
- PRD Section 6.1.6: Multi-Tenant Separation in RBAC

**Last Updated**: February 13, 2026  
**Status**: Updated to align with PRD v1.0

