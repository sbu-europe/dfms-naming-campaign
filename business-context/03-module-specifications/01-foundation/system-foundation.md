---
module: 01-foundation
specification: System Foundation Overview
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.1, 6.2
last_updated: 2026-02-26
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

**User Authentication**:
- Secure login with username/password
- Password complexity enforcement
- Account lockout after failed attempts (3 attempts → 30 min lock)
- Admin override for unlocking accounts

**Multi-Factor Authentication**:
- OTP delivery via email/SMS
- Required for admin and privileged roles
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

**Login Flow**:
```
Username/Password → Validation → MFA (if required) →
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
1. **Super Admin**: Platform-level access (cross-tenant)
2. **Administrative Roles**: Tenant Admin, Department Admin
3. **Operational Roles**: Department-specific task roles

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
- Department Admin

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
- Unique tenant_id for each organization
- Logical data partitioning (shared database)
- Physical isolation for Enterprise tier (dedicated schema)
- Row-level security enforcement

**Subscription Tiers**:
- **Basic**: 5 users, 100 trips/month
- **Starter**: 15 users, 500 trips/month
- **Growth**: 50 users, 2,000 trips/month
- **Enterprise**: Unlimited users/trips, dedicated infrastructure

### 4.2 Organization Onboarding

**Registration Flow**:
```
Organization Details → Email/Phone Verification (OTP) →
Tenant Provisioning → Admin Account Creation →
Subscription Selection → Welcome Email
```

**Verification**:
- Dual OTP (email + SMS)
- 10-minute validity
- 3 attempts max
- 15-minute lockout after failed attempts

### 4.3 User Lifecycle

**Invitation**:
- Admin invites users with role, department, workflow type
- Invitation email sent with 72-hour activation link
- User completes profile, sets password, verifies OTP
- Account activated after T&C acceptance

**Deactivation**:
- **Temporary**: Suspended status, can be reactivated
- **Permanent**: Inactive status, data archived

**Password Reset**:
- **Admin-Assisted**: For low-literacy users, admin generates OTP after offline verification
- **Self-Service**: User requests reset link via email (15 min validity)

### 4.4 OTP Verification System

**Specifications**:
- 6-digit numeric code
- 10-minute validity
- Email and SMS delivery
- 2-minute resend cooldown
- Max 5 OTPs per hour per user
- 3 verification attempts max

### 4.5 Audit Logging

**Logged Events**:
- All login/logout attempts
- Account lockouts and unlocks
- Password resets and changes
- User invitation and activation
- Role and permission changes
- MFA and OTP verifications

**Retention**:
- Standard: 2 years
- Compliance: 7 years (configurable)

**Audit Log Access**:
- Admin dashboard with filters
- Export capabilities
- Immutable records
- Encrypted storage

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
- US-005: User Invitation & Activation
- US-006: OTP Verification
- US-007: Account Deactivation
- US-008: Password & Account Reset
- US-009: User Activity & Audit Logs

### Downstream Modules
- [02-master-data](../02-master-data/README.md) - Master data management
- [03-core-operations](../03-core-operations/README.md) - Core business operations
- All other operational modules

---

## 10. Key Design Decisions

### Multi-Tenancy Approach
**Decision**: Hybrid model (logical isolation + physical for Enterprise)  
**Rationale**: Balance between resource efficiency and data isolation needs

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
