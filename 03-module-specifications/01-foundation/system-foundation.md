---
module: 01-foundation
specification: System Foundation Overview
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.1, 6.2
last_updated: 2026-04-07
related_stories: US-001 through US-009
---

# System Foundation Overview

## Overview

This document provides a high-level overview of the DFMS platform's foundational layer, which encompasses all core system capabilities required for secure, multi-tenant SaaS operations. The foundation layer serves as the bedrock upon which all operational modules are built, providing authentication, authorization, user management, and compliance capabilities.

For detailed specifications, refer to the individual foundation module documents.

---

## 1. Foundation Layer Architecture

### 1.1 Core Components

The foundation layer consists of three primary components:

```
┌─────────────────────────────────────────────────────┐
│                 Foundation Layer                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────┐  ┌────────────────────┐  │
│  │ Authentication &     │  │ Role-Based Access  │  │
│  │ Security            │  │ Control (RBAC)     │  │
│  │ - Login/Logout      │  │ - Role Hierarchy   │  │
│  │ - Account Lockout   │  │ - Permissions      │  │
│  │ - MFA (2FA)         │  │ - Authorization    │  │
│  │ - Session Mgmt      │  │ - Dynamic Roles    │  │
│  └──────────────────────┘  └────────────────────┘  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ User & Tenant Management                    │   │
│  │ - Organization Onboarding                   │   │
│  │ - Tenant Provisioning                       │   │
│  │ - User Invitation & Activation              │   │
│  │ - OTP Verification                          │   │
│  │ - Account Lifecycle                         │   │
│  │ - Audit Logging                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
└─────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────┐
        │ All Operational Modules Depend  │
        │ on Foundation Layer              │
        └─────────────────────────────────┘
```

### 1.2 Dependency Model

**Foundation Layer is Required By**:
- Master Data Management (02-master-data)
- Core Operations (03-core-operations)
- Operations Support (04-operations-support)
- Vendor Management (05-vendor-management)
- Fleet Management (06-fleet-management)
- Mobile Interfaces (07-mobile-interfaces)
- Reporting & Analytics (08-reporting-analytics)

**Foundation Layer Depends On**:
- None (this is the base layer)
- External services: Email gateway, SMS gateway, Payment processor

---

## 2. Authentication & Security

### 2.1 Capabilities

**User Authentication (3-Step Login)**:
- Step 1: Enter email or phone number (identity verification)
- Step 2: OTP verification (6-digit code via email/SMS)
- Step 3: Enter password
- Account lockout after failed attempts (3 attempts → 30 min lock)
- Admin override for unlocking accounts

**OTP Verification (Built into Login)**:
- OTP delivery via email/SMS, mandatory for all users on every login
- 10-minute validity, 3 verification attempts max
- Trusted device management (30-day remember)

**Session Management**:
- JWT-based access tokens (30 min validity)
- Refresh tokens (7-day validity)
- Idle timeout (30 minutes)
- Concurrent session limits (2 per user)
- Manual logout and logout-all-devices

**Security Features**:
- Password masking with show/hide toggle
- CSRF protection
- Rate limiting
- Security headers (HSTS, X-Frame-Options, CSP)

### 2.2 Key Workflows

**Login Flow (3-Step)**:
```
Email/Phone → OTP Verification → Password →
Session Creation → Token Generation → Dashboard
```

**Account Lockout Flow**:
```
Failed Login (3x in 15 min) → Account Locked (30 min) →
Admin Dashboard Alert → Offline Verification → Admin Unlock
```

---

## 3. Role-Based Access Control (RBAC)

### 3.1 Role Hierarchy

**Three-Tier Structure**:
1. **Super Admin** (e.g., Brainstation 23): Platform-level access, cross-tenant, manages Tenant Admins
2. **Tenant Admin** (e.g., Nourish): Organization-wide access, single tenant, manages users and role assignments across departments (with department scoping where applicable)
3. **Operational User** (e.g., Command Center Officer, Driver Supervisor): Task-level access, execution-only

### 3.2 Permission Model

**Module-Level Permissions**:
```
Module → Feature → Action (Create, Read, Update, Delete, Approve, etc.)
```

**Example**:
- `Fleet.Vehicle.Create`
- `TransportOrder.Approve`
- `Reports.Export`

**Permission Enforcement**:
- **UI Level**: Hide/disable unauthorized features
- **API Level**: Validate permissions on every request
- **Database Level**: Row-level security policies

### 3.3 Predefined Roles (Phase 1)

**Administrative**:
- Super Admin
- Tenant Admin (Organization Admin)

**Operational** (by department):
- **Distribution**: Distribution Officer, Distribution Manager
- **Procurement**: Procurement Officer
- **Transport**: Transport Planner, Transport Distribution Officer
- **QC**: QC Inspector, QC Lab Technician
- **Operations**: Gate Operator, Scaling Operator, Command Center Officer, Loading/Unloading Operator
- **Fleet**: Driver Supervisor, Driver, Helper
- **Vendor**: Vendor Admin
- **Finance**: Accounts Officer

### 3.4 Dynamic Role Builder (Phase 2)

- Create custom roles beyond predefined roles
- Granular permission selection from matrix
- Clone existing roles
- Deactivate/delete custom roles

---

## 4. User & Tenant Management

### 4.1 Multi-Tenancy

**Tenant Isolation**:
- Dedicated PostgreSQL schema per tenant (all tiers)
- Shared `public` schema for platform-level entities only
- django-tenants library manages schema routing
- No cross-tenant query risk at the database level

**Subscription Tiers**:
- **Basic**: 5 users, 100 trips/month
- **Starter**: 15 users, 500 trips/month
- **Growth**: 50 users, 2,000 trips/month
- **Enterprise**: Unlimited users/trips, dedicated infrastructure

### 4.2 Organization Onboarding (by Super Admin)

**Onboarding Flow**:
```
Super Admin fills Organization Details → Sets Subscription Plan →
System provisions Tenant (schema creation) → Super Admin creates Tenant Admin →
System sends invitation email → Tenant Admin activates account
```

**Tenant Admin First Login**:
- Receives Admin Portal URL and temporary password via email
- Logs in using 3-step flow (email → OTP → temporary password)
- System forces password change on first login

### 4.3 User Lifecycle

**Invitation**:
- Admin invites users with role, department, employment type, POI, workflow responsibility
- Single invitation via form or bulk invitation via CSV upload (max 100 per batch)
- Invitation email sent with 7-day activation link and optional custom message
- Invitation scheduling supported for deferred sends
- User completes profile, sets password, verifies OTP (email + SMS)
- Account activated after T&C acceptance
- Subscription plan user limit enforced before invitation

**Deactivation** (US-007):
- **Temporary Suspension**: `Suspended` status, data preserved, roles retained, can be reactivated with admin approval
- **Permanent Deactivation**: `Inactive` status, data archived, cannot be reactivated
- Requires mandatory fields: reason, effective date, admin remarks
- Active critical assignment check before deactivation (TOs, trips, approvals, QC inspections) with override option
- Immediate session termination and login blocking
- Bulk deactivation supported with per-user validation
- Scheduled (future date) deactivation supported
- Assignment prevention: deactivated users excluded from all dropdowns and assignment workflows
- Email notification sent to user and admin upon deactivation/reactivation
- Reactivation checks subscription plan user limit before restoring access

**Password Reset** (consolidated into US-005 from US-008):
- **Admin-Assisted**: For low-literacy users (e.g., Drivers, Helpers); admin verifies identity offline, generates 6-digit OTP (10 min), communicates to user offline; mandatory justification logged
- **Self-Service**: User requests reset link via email (15 min) + SMS OTP (10 min); rate limited to 3 requests/hour/user
- **Password Complexity**: 8+ chars, upper/lower/number/special, last 3 passwords not reusable
- **Session Termination**: All active sessions revoked immediately on successful reset
- **Suspicious Activity Detection**: Unusual reset patterns trigger additional verification and admin alerts
- **Post-Reset**: All active sessions terminated, confirmation email sent, audit logged


### 4.4 OTP Verification System

**Specifications**:
- 6-digit numeric code
- 10-minute validity
- Email and SMS delivery
- 2-minute resend cooldown
- Max 5 OTPs per hour per user
- 3 verification attempts max

### 4.5 Audit Logging (US-009)

**Authentication Event Logging**:
- All login/logout attempts (success/failure with failure reason)
- Account lockouts and unlocks
- Session timeouts
- Password resets (admin-assisted and self-service, with method and admin ID)

**User Action Logging**:
- CRUD operations on all entities (create, read, update, delete)
- Before/after values captured for update operations
- Entity snapshots captured for delete operations

**OTP Operation Logging**:
- OTP generation (delivery method, operation type)
- OTP verification (success/failure, attempt count)
- OTP resend (resend count)

**Admin Action Logging**:
- User invitation and activation
- Account deactivation and reactivation (with justification)
- Role and permission changes

**Each Log Entry Includes**: User ID, Event Type, Timestamp, IP Address, Device ID, User Agent, Location (if available), Status, Failure Reason (if applicable)

**Retention**:
- Minimum: 2 years (mandatory for all tenants)
- Extended: Up to 7 years (configurable per tenant for regulatory compliance)

**Audit Log Properties**:
- **Immutable**: Append-only storage; no modification or deletion within retention period
- **Encrypted**: AES-256 at rest; key rotation every 90 days
- **Tenant-Isolated**: Admins can only view logs from their own tenant
- **Performant**: < 50ms write overhead; supports 1000+ log entries/second

**Audit Dashboard** (Security Admin, Tenant Admin only):
- Real-time log feed with auto-refresh
- Filters: Date range, User, Event Type, Status, IP Address
- Full-text search across log entries
- Export to CSV and JSON (with filters applied)
- All dashboard access and exports are themselves logged (meta-auditing)

---

## 5. Security & Compliance

### 5.1 Security Standards

**Password Security**:
- Minimum 8 characters
- Complexity requirements (uppercase, lowercase, number, special char)
- Bcrypt hashing with tenant-specific salt
- Password history (last 3 cannot be reused)
- 90-day expiration (configurable)

**Session Security**:
- JWT tokens with short expiry
- Refresh token rotation
- Session binding to IP/device
- Secure cookie storage (HttpOnly, Secure flags)

**Data Security**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- PII encryption
- Secure key management

### 5.2 Compliance Features

**Audit Trail**:
- Complete action history
- Immutable logs
- Timestamp and actor tracking
- Exportable for compliance reporting

**Data Privacy**:
- GDPR-ready architecture
- User data export
- Right to deletion (with retention rules)
- Data minimization

**Access Control**:
- Principle of least privilege
- Separation of duties (cannot approve own requests)
- Regular access reviews

---

## 6. Integration Points

### 6.1 Internal Integrations

The foundation layer provides services to all modules:

**Authentication Service**:
```
authenticate(credentials) → { user, token, permissions }
validateToken(token) → { user, permissions }
refreshToken(refresh_token) → { new_access_token }
```

**Authorization Service**:
```
hasPermission(user, permission) → boolean
getRolePermissions(role_id) → permissions[]
validateTenantAccess(user, resource) → boolean
```

**Audit Service**:
```
logEvent(event_type, user_id, details) → audit_log_id
queryAuditLogs(filters) → audit_logs[]
```

### 6.2 External Integrations

**Email Gateway**:
- Invitation emails
- OTP delivery
- Password reset links
- Notification emails

**SMS Gateway**:
- OTP delivery
- Alert notifications

**Payment Processor** (Phase 2):
- Subscription billing
- Payment processing
- Invoice generation

---

## 7. Performance & Scalability

### 7.1 Performance Targets

**Authentication**:
- Login response: < 500ms
- Token validation: < 50ms
- Session refresh: < 200ms

**Authorization**:
- Permission check: < 10ms (cached)
- Role load: < 100ms

**User Management**:
- User invitation: < 2s
- OTP generation: < 1s
- Account activation: < 3s

### 7.2 Scalability

**Horizontal Scaling**:
- Stateless authentication (JWT)
- Distributed session storage (Redis)
- Load-balanced API servers

**Caching Strategy**:
- User permissions cached (5 min TTL)
- Role definitions cached (1 hour TTL)
- Tenant configuration cached (15 min TTL)

**Database Optimization**:
- Indexed tenant_id on all tables
- Partitioned audit logs by month
- Read replicas for reporting

---

## 8. Phase-wise Implementation

### Phase 1 (MVP - Current)
✅ User Login & Account Lockout  
✅ Multi-Factor Authentication  
✅ Session Control  
✅ Role Hierarchy (Predefined Roles)  
✅ User Invitation & Activation  
✅ OTP Verification  
✅ Account Deactivation  
✅ Password Reset (Admin-Assisted + Self-Service)  
✅ User Activity & Audit Logs  
✅ Tenant Data Isolation  

### Phase 2 (Enhancements)
🔄 Dynamic Role Builder  
🔄 Custom Permissions  
🔄 Advanced Audit Analytics  
🔄 SAML/SSO Integration  
🔄 Advanced MFA (Authenticator apps)  

### Phase 3 (Advanced)
⏳ Passwordless Authentication  
⏳ Biometric Authentication  
⏳ Risk-Based Authentication  
⏳ Advanced Threat Detection  

---

## 9. Related Documentation

### Foundation Module Specifications
- **[Authentication & Security](authentication-security.md)** - Detailed authentication spec
- **[RBAC](rbac.md)** - Complete RBAC specification
- **[User & Tenant Management](user-tenant-management.md)** - User lifecycle management

### Related User Stories
- US-001: User Login & Account Lockout
- US-002: Multi-Factor Authentication
- US-003: Session Control
- US-004: Role Hierarchy & RBAC
- US-005: User Invitation, Activation & Password Reset (consolidated scope)
- US-006: OTP Verification
- US-007: Account Deactivation
- US-008: Password & Account Reset (scope consolidated into US-005)
- US-009: User Activity & Audit Logs

### Downstream Modules
- [02-master-data](../02-master-data/README.md) - Master data management
- [03-core-operations](../03-operations/README.md) - Core business operations
- All other operational modules

---

## 10. Key Design Decisions

### Multi-Tenancy Approach
**Decision**: Schema-per-tenant for all tiers (PostgreSQL dedicated schemas)  
**Rationale**: Strong data isolation, independent backup/restore, no cross-tenant leakage risk, managed via django-tenants

### Authentication Method
**Decision**: JWT-based stateless authentication  
**Rationale**: Horizontal scalability, microservices-friendly

### Permission Model
**Decision**: Hierarchical module-feature-action structure  
**Rationale**: Granular control with manageable complexity

### Admin-Assisted Reset
**Decision**: Support both self-service and admin-assisted password reset  
**Rationale**: Accommodate users with varying digital literacy levels

### Audit Retention
**Decision**: 2-year standard, 7-year for compliance  
**Rationale**: Balance storage costs with regulatory requirements

---

**Source**: PRD_DFMS_v1.0.md - Sections 6.1, 6.2  
**Last Updated**: 2026-02-26  
**Status**: Phase 1 - Core Foundation Complete
