# 01-foundation - System Foundation

## Module Overview

This module defines the foundational layer of the DFMS platform, including authentication, security, role-based access control (RBAC), and user/tenant management. All other modules depend on this foundation.

**Purpose**: Provide secure authentication, authorization, and multi-tenant infrastructure  
**PRD Sections**: 6.1, 6.2  
**Phase**: Phase 1 (Critical)  
**Dependencies**: None (foundation layer)

---

## Module Contents

### 📄 Specifications

**Note**: All specification files are written in **domain knowledge format**, explaining how the system works conceptually with technical details, data models, and implementation guidance. They maintain traceability to user stories while focusing on architecture and mechanisms rather than requirements.

| File | Description | PRD Section | Related Stories | Lines |
|------|-------------|-------------|-----------------|-------|
| [authentication-security.md](authentication-security.md) | Authentication architecture, account lockout, MFA/2FA, session management, security features | 6.1.1-6.1.3 | US-001, US-002, US-003 | 446 |
| [rbac.md](rbac.md) | Role hierarchy, permission model, enforcement layers, dynamic role builder, multi-tenant isolation | 6.1.4-6.1.6 | US-004 | 592 |
| [user-tenant-management.md](user-tenant-management.md) | Multi-tenancy architecture, org onboarding, user lifecycle, OTP system, account management, audit logging | 6.2.1-6.2.8 | US-005, US-006, US-007, US-008 | 861 |
| [system-foundation.md](system-foundation.md) | Foundation layer overview, component integration, security standards, performance targets | 6.1, 6.2.7 | US-009 | 459 |

**Total Documentation**: ~2,400 lines of comprehensive technical specifications

---

## Key Features

### Authentication & Security
- **User Login**: Unique credentials, password masking, show/hide toggle
- **Account Lockout**: 3 failed attempts → 30-minute lock
- **Admin Override**: Manual unlock with audit trail
- **Multi-Factor Authentication**: OTP via email/SMS for admin roles
- **Session Control**: Concurrent session limits, manual logout, idle timeout

### Role-Based Access Control (RBAC)
- **Predefined Roles**: Admin, Transport Planner, Distribution Officer, Gate Operator, QC Supervisor, etc.
- **Role Hierarchy**: Hierarchical permissions and inheritance
- **Dynamic Role Builder**: Create custom roles with module-level permissions
- **Multi-Tenant Isolation**: Strict tenant data separation

### User & Tenant Management
- **Organization Onboarding**: Self-service signup with tenant creation
- **User Invitation**: Email-based invitation with activation workflow
- **OTP Verification**: Phone/email verification with retry logic
- **Account Management**: Activation, deactivation, password reset
- **Audit Logging**: Comprehensive activity tracking

---

## Dependencies

### Upstream
None - This is the foundation layer

### Downstream
**All modules depend on this foundation**:
- `02-master-data/` - Requires auth/RBAC for data access
- `03-core-operations/` - Requires user context and permissions
- `04-operations-support/` - Requires role-based access for gate, QC
- `05-vendor-management/` - Requires vendor user authentication
- `06-fleet-management/` - Requires role-based fleet access
- `07-mobile-interfaces/` - Requires mobile authentication
- `08-reporting-analytics/` - Requires role-based report access

### Cross-Module References
- **User Roles** defined here are referenced by all modules
- **Audit Logging** captures actions from all modules
- **Multi-Tenant Context** applies to all data operations

---

## Related User Stories

| Story ID | Title | Feature Area |
|----------|-------|--------------|
| US-001 | User Login & Account Lockout | Authentication |
| US-002 | Multi-Factor Authentication | Security |
| US-003 | Session Control | Security |
| US-004 | Role Hierarchy & RBAC | Authorization |
| US-005 | User Invitation & Activation | User Management |
| US-006 | OTP Verification | Security |
| US-007 | Account Deactivation | User Management |
| US-008 | Password & Account Reset | Security |
| US-009 | User Activity & Audit Logs | Compliance |

**Location**: `../../04-phase-backlog/phase-1/user-stories/US-001-*.md` through `US-009-*.md`

---

## Data Model Highlights

### User
```typescript
User {
  user_id: UUID
  username: string (unique)
  email: string
  phone: string
  password_hash: string
  role_id: UUID
  tenant_id: UUID
  status: enum [Active, Inactive, Locked, Pending]
  failed_login_count: Integer
  locked_until: DateTime (nullable)
  last_login_at: DateTime
  created_at: DateTime
  updated_at: DateTime
}
```

### Role
```typescript
Role {
  role_id: UUID
  role_name: string
  tenant_id: UUID
  permissions: JSON (module: [actions])
  is_system_role: Boolean
  created_at: DateTime
}
```

### Tenant
```typescript
Tenant {
  tenant_id: UUID
  organization_name: string
  subscription_tier: enum [Basic, Starter, Growth, Enterprise]
  status: enum [Active, Suspended, Trial]
  created_at: DateTime
}
```

---

## API Endpoints

### Authentication
```typescript
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/verify-otp
POST /api/v1/auth/request-password-reset
POST /api/v1/auth/reset-password
```

### User Management
```typescript
GET /api/v1/users
POST /api/v1/users/invite
PUT /api/v1/users/{user_id}
DELETE /api/v1/users/{user_id}
POST /api/v1/users/{user_id}/deactivate
POST /api/v1/admin/users/{user_id}/unlock
```

### RBAC
```typescript
GET /api/v1/roles
POST /api/v1/roles
GET /api/v1/roles/{role_id}/permissions
PUT /api/v1/roles/{role_id}/permissions
```

---

## Security Considerations

### Authentication
- Passwords must meet complexity requirements (8+ chars, mixed case, numbers, special chars)
- Password hashing using bcrypt with salt
- Account lockout after 3 failed attempts within 15 minutes
- 30-minute lockout period (configurable)

### Session Management
- JWT-based authentication with refresh tokens
- Session timeout: 30 minutes idle, 8 hours absolute
- Concurrent session limit: 2 per user
- Secure session storage (HttpOnly cookies)

### Multi-Tenancy
- Strict tenant ID validation on all queries
- Row-level security for tenant data isolation
- No cross-tenant data access
- Admin users scoped to single tenant

---

## Implementation Priority

**Phase 1 - Critical**:
1. User Login & Account Lockout (US-001) ⭐⭐⭐
2. Role Hierarchy & RBAC (US-004) ⭐⭐⭐
3. User Invitation & Activation (US-005) ⭐⭐⭐
4. Multi-Factor Authentication (US-002) ⭐⭐
5. Session Control (US-003) ⭐⭐
6. OTP Verification (US-006) ⭐⭐
7. Password & Account Reset (US-008) ⭐
8. Account Deactivation (US-007) ⭐
9. User Activity & Audit Logs (US-009) ⭐

---

## Testing Scenarios

### Authentication
- Valid login with correct credentials
- Failed login with incorrect password
- Account lockout after 3 failed attempts
- Admin unlock of locked account
- 2FA verification flow
- Session timeout and forced logout

### RBAC
- Permission check for different roles
- Role hierarchy inheritance
- Deny access for insufficient permissions
- Multi-tenant data isolation

### User Management
- User invitation and activation
- OTP verification and retry
- Password reset workflow
- Account deactivation and reactivation

---

## Quick Links

- **[Module Index](../README.md)** - Back to module specifications index
- **[Complete Index](../INDEX.md)** - Full content index
- **[Source PRD](../../../01-source/01-prd/PRD_DFMS_v1.0.md)** - Original PRD document
- **[User Stories](../../04-phase-backlog/phase-1/user-stories/)** - Implementation stories

---

**Last Updated**: 2026-02-26  
**Status**: Complete  
**Previous Module**: [00-overview/](../00-overview/README.md) - Product Overview  
**Next Module**: [02-master-data/](../02-master-data/README.md) - Master Data Management
