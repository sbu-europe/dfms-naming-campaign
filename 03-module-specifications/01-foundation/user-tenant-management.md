---
module: 01-foundation
specification: User & Tenant Management
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.2.1-6.2.8
last_updated: 2026-02-26
related_stories: US-005, US-006, US-007, US-008, US-009
---

# User & Tenant Management Specification

## Overview

The DFMS platform implements comprehensive user and tenant lifecycle management designed for multi-tenant SaaS environments. This specification covers organization onboarding, tenant creation, user invitation and activation workflows, OTP verification, account management, and audit logging.

The system balances security requirements with usability considerations, particularly for users with varying levels of digital literacy, through features like admin-assisted password resets and multiple verification methods.

---

## 1. Tenant Management Architecture

### 1.1 Multi-Tenancy Model

The platform uses a **schema-per-tenant** approach for all tenants:

**Tenant Isolation**:
- Dedicated PostgreSQL schema per tenant (e.g., `tenant_001`, `tenant_002`)
- Shared `public` schema for platform-level entities (tenants, subscription plans, system settings)
- All tenant-specific data (users, vehicles, trips, etc.) resides in the tenant's schema
- django-tenants library manages schema routing automatically

**Shared Public Schema**:
- `tenants` table (tenant registry, subscription info)
- `subscription_plans` table
- `system_settings` table

**Per-Tenant Schema** (e.g., `tenant_001`):
- `users`, `roles`, `permissions`
- All domain entities (vehicles, drivers, trips, etc.)
- Audit logs

**Benefits**:
- Strong data isolation without application-level filtering
- Independent backup and restore per tenant
- Easier compliance and data residency management
- No risk of cross-tenant data leakage at the query level

### 1.2 Tenant Entity Structure

```typescript
Tenant {
  tenant_id: UUID
  organization_name: string
  business_category: enum ['Manufacturing', 'Distribution', 'FMCG', 'Agro', 'Other']
  industry_type: string
  subscription_tier: enum ['Basic', 'Starter', 'Growth', 'Enterprise']
  subscription_status: enum ['Trial', 'Active', 'Suspended', 'Cancelled']
  
  // Contact
  admin_email: string
  admin_phone: string
  address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  
  // Subscription limits
  max_users: number
  max_monthly_trips: number
  storage_limit_gb: number
  enabled_modules: string[]
  
  // Metadata
  created_at: DateTime
  trial_ends_at: DateTime
  subscription_renews_at: DateTime
  last_billing_at: DateTime
  status: enum ['Active', 'Suspended', 'Trial']
}
```

---

## 2. User Hierarchy & Management Chain

### 2.1 System User Types

The DFMS platform has three distinct user types in a strict management hierarchy:

```
1. Super Admin (e.g., Brainstation 23)
   ├─ Created: Manually (database seed / CLI)
   ├─ Manages: Tenant Admins
   └─ Scope: Platform-wide, cross-tenant

2. Tenant Admin (e.g., Nourish)
   ├─ Created: By Super Admin
   ├─ Manages: Operational Users
   └─ Scope: Organization-wide, single tenant

3. Operational User (e.g., Command Center Officer, Loading Person,
                     Unloading Person, Driver Supervisor, Driver Helper)
   ├─ Created: By Tenant Admin
   ├─ Manages: Nothing (execution-only)
   └─ Scope: Assigned tasks/workflows only
```

### 2.2 Super Admin Creation

Super Admins are **never created through the UI**. They are provisioned manually:

```typescript
// Database seed or CLI command — executed during initial deployment
async function seedSuperAdmin(): Promise<void> {
    const superAdmin = await createUser({
        email: 'admin@brainstation-23.com',
        phone: '+8801XXXXXXXXX',
        role: 'Super Admin',
        status: 'Active',
        tenant_id: null,  // Platform-level, no tenant
        created_via: 'manual_seed'
    });

    await auditLog({
        event: 'SuperAdminCreated',
        user_id: superAdmin.user_id,
        details: { method: 'database_seed' }
    });
}
```

### 2.3 Tenant Onboarding (by Super Admin)

Super Admin creates a new tenant and its Tenant Admin through the platform admin panel:

```
Step 1: Super Admin fills Organization Details
    ↓
Step 2: Super Admin sets Subscription Plan & Limits
    ↓
Step 3: System provisions Tenant
    ↓
Step 4: Super Admin creates Tenant Admin account
    ↓
Step 5: System sends invitation to Tenant Admin (email + OTP)
    ↓
Step 6: Tenant Admin activates account and sets password
```

**Tenant Creation Form (Super Admin Panel)**:

**Required Fields**:
- Organization Name (3-100 characters, unique)
- Business Category (dropdown)
- Industry Type (text field)
- Subscription Plan (Basic / Starter / Growth / Enterprise)
- Tenant Admin Email (unique, valid format)
- Tenant Admin Phone (with country code)
- Tenant Admin Full Name
- Organization Address (full address fields)

**Validation Rules**:
```typescript
{
  organization_name: {
    min_length: 3,
    max_length: 100,
    unique: true,
    pattern: /^[a-zA-Z0-9\s\-&.,()]+$/
  },
  admin_email: {
    unique: true,
    format: 'email',
    verify_mx_record: true
  },
  admin_phone: {
    format: 'E.164',  // +8801XXXXXXXXX
    unique: true
  }
}
```

### 2.4 Tenant Provisioning

```typescript
async function provisionTenant(
    superAdminId: UUID,
    tenantData: TenantCreationForm
): Promise<Tenant> {
    // 1. Validate Super Admin permission
    await checkPermission(superAdminId, 'Tenant.Create');

    // 2. Generate unique tenant ID
    const tenant_id = generateUUID();

    // 3. Create tenant record
    const tenant = await createTenant({
        tenant_id,
        organization_name: tenantData.organization_name,
        subscription_tier: tenantData.subscription_plan,
        max_users: getSubscriptionLimits(tenantData.subscription_plan).max_users,
        max_monthly_trips: getSubscriptionLimits(tenantData.subscription_plan).max_trips,
        storage_limit_gb: getSubscriptionLimits(tenantData.subscription_plan).storage_gb,
        status: 'Active',
        created_by: superAdminId
    });

    // 4. Create dedicated database schema (all tenants get their own schema)
    await createTenantSchema(tenant_id);

    // 5. Create Tenant Admin user
    const tenantAdmin = await createUser({
        tenant_id,
        email: tenantData.admin_email,
        phone: tenantData.admin_phone,
        full_name: tenantData.admin_name,
        role: 'Tenant Admin',
        status: 'Pending',  // Pending until activation
        created_by: superAdminId
    });

    // 6. Send activation invitation to Tenant Admin
    await sendInvitationEmail(tenantAdmin.email, {
        organization_name: tenant.organization_name,
        activation_url: `https://dfms.app/activate/${generateActivationToken(tenantAdmin)}`,
        invited_by: 'DFMS Platform Admin'
    });

    // 7. Log provisioning event
    await auditLog({
        event: 'TenantProvisioned',
        tenant_id,
        actor_id: superAdminId,
        details: {
            subscription_tier: tenantData.subscription_plan,
            tenant_admin_email: tenantData.admin_email
        }
    });

    return tenant;
}
```

### 2.5 User Creation (by Tenant Admin)

Once the Tenant Admin activates their account, they can create Operational Users across departments (department-scoped where applicable):

```
Tenant Admin → User Management → Invite User →
  Select Department (predefined dropdown) →
  Select Role (filtered by Department) →
  Send Invitation → User Activates Account
```

**Who Can Create Whom**:

| Creator | Can Create | Notes |
|---------|-----------|-------|
| Super Admin | Tenant Admin | During tenant onboarding |
| Tenant Admin | Operational User | Direct creation for any department |

---

## 3. Subscription Management

### 3.1 Subscription Tiers

| Tier | Users | Trips/Month | Storage | Key Features | Price (indicative) |
|------|-------|-------------|---------|--------------|-------------------|
| **Basic** | 5 | 100 | 1 GB | TR/TO, Fleet basics, GPS tracking | $49/month |
| **Starter** | 15 | 500 | 5 GB | All Basic + Vendor portal, QC module | $149/month |
| **Growth** | 50 | 2,000 | 20 GB | All Starter + Analytics, Cost mgmt, PR/PO | $499/month |
| **Enterprise** | Unlimited | Unlimited | Unlimited | All features + White-label, ERP integration, Dedicated schema | Custom |

### 3.2 Subscription Enforcement

**Usage Limits Tracking**:
```typescript
TenantUsage {
  tenant_id: UUID
  current_month: string  // 'YYYY-MM'
  
  // Counters
  active_users_count: number
  trips_created_this_month: number
  storage_used_gb: number
  
  // Limits (from subscription tier)
  max_users: number
  max_monthly_trips: number
  max_storage_gb: number
  
  // Alerts
  users_warning_sent: boolean    // At 80%
  trips_warning_sent: boolean    // At 80%
  storage_warning_sent: boolean  // At 90%
}
```

**Limit Enforcement Logic**:
```typescript
function checkLimit(tenant: Tenant, limitType: string): boolean {
    const usage = getTenantUsage(tenant.tenant_id);
    
    switch(limitType) {
        case 'users':
            if (usage.active_users_count >= tenant.max_users) {
                throw new LimitExceededError(
                    'User limit reached. Upgrade subscription to add more users.'
                );
            }
            break;
            
        case 'trips':
            if (usage.trips_created_this_month >= tenant.max_monthly_trips) {
                throw new LimitExceededError(
                    'Monthly trip limit reached. Upgrade subscription or wait for next billing cycle.'
                );
            }
            break;
            
        case 'storage':
            if (usage.storage_used_gb >= tenant.max_storage_gb) {
                throw new LimitExceededError(
                    'Storage limit reached. Delete old data or upgrade subscription.'
                );
            }
            break;
    }
    
    return true;
}
```

---

## 4. User Invitation & Activation

### 4.1 Invitation Workflow

```
Admin (Tenant Admin) → Invite User Form → Send Email →
User Clicks Link → Complete Profile → Verify OTP → Accept T&C → Account Active
```

**Permission-Based Invitation**:
- **Tenant Admin** can invite: Operational Users (any department)

### 4.2 Invitation Form

**Required Fields**:
- Full Name
- Email Address
- Mobile Number
- Role (from available roles per user type)
- Department (Depot / Procurement / Distribution / Transport / QC)
- Employment Type (Permanent/Temporary/Contractor)
- POI Assignment (if applicable, e.g., Gate Operator → specific gate)
- Workflow Responsibility (Requester/Approver/Executor)

**Validation**:
```typescript
{
  email: {
    unique_per_tenant: true,
    format: 'email'
  },
  mobile: {
    unique_per_tenant: true,
    format: 'E.164'
  },
  role: {
    validate: (role, tenant) => {
      // Check if subscription tier allows this role
      return tenant.enabled_modules.includes(role.required_module);
    }
  }
}
```

### 4.3 Invitation Email

**Email Content**:
```
Subject: You're invited to join [Organization Name] on DFMS

Hi [Full Name],

[Admin Name] has invited you to join [Organization Name]'s DFMS account.

Your Role: [Role Name]
Department: [Department]

To activate your account:
1. Click the link below (valid for 72 hours)
2. Complete your profile and set a password
3. Verify your email and phone with OTP
4. Review and accept Terms & Conditions

[Activate Account Button: https://dfms.app/activate/[token]]

Need help? Reply to this email or contact your administrator.

This invitation expires on [Expiry DateTime].
```

**Invitation Token**:
```typescript
InvitationToken {
  token: string  // Unique, 64-char hex
  user_id: UUID
  email: string
  invited_by: UUID
  expires_at: DateTime  // 72 hours from creation
  status: enum ['Pending', 'Activated', 'Expired', 'Revoked']
  created_at: DateTime
}
```

### 4.4 Account Activation Steps

**Step 1: Click Activation Link**
- Validate token (not expired, not used, matches email)
- Load invitation details

**Step 2: Complete Profile**
- Set password (meet complexity requirements)
- Confirm password
- Optional: Upload profile photo

**Step 3: OTP Verification**
- System sends OTP to email and phone
- User enters both OTPs
- Validates against stored codes

**Step 4: Accept Terms**
- Display Terms & Conditions
- Display Privacy Policy
- Require explicit checkbox acceptance

**Step 5: Activation Complete**
- Set user status to 'Active'
- Mark invitation token as 'Activated'
- Send welcome email
- Log activation event
- Redirect to login or dashboard

---

## 5. OTP Verification System

### 5.1 OTP Generation

**Algorithm**:
```typescript
function generateOTP(): string {
    // 6-digit random number
    return Math.floor(100000 + Math.random() * 900000).toString();
}
```

**Storage**:
```typescript
OTPRecord {
  otp_id: UUID
  user_id: UUID
  otp_code: string  // Hashed for security
  otp_type: enum ['Email', 'SMS', 'Both']
  purpose: enum ['Registration', 'Activation', 'PasswordReset', 'MFA']
  generated_at: DateTime
  expires_at: DateTime  // 10 minutes
  attempts: number
  verified: boolean
  verified_at: DateTime | null
}
```

### 5.2 OTP Delivery

**Email Delivery**:
```
Subject: Your DFMS Verification Code

Your verification code is: [123456]

This code expires in 10 minutes.
Do not share this code with anyone.
```

**SMS Delivery**:
```
Your DFMS verification code is: 123456
Valid for 10 minutes. Do not share.
```

### 5.3 OTP Verification Logic

```typescript
async function verifyOTP(userId: UUID, inputOTP: string): Promise<boolean> {
    // 1. Load OTP record
    const otpRecord = await getLatestOTP(userId);
    
    // 2. Check if expired
    if (NOW() > otpRecord.expires_at) {
        throw new Error('OTP expired. Please request a new code.');
    }
    
    // 3. Check attempts
    if (otpRecord.attempts >= 3) {
        throw new Error('Maximum attempts exceeded. Please request a new code.');
    }
    
    // 4. Validate code
    const isValid = await bcrypt.compare(inputOTP, otpRecord.otp_code);
    
    if (!isValid) {
        // Increment attempt counter
        await incrementOTPAttempts(otpRecord.otp_id);
        return false;
    }
    
    // 5. Mark as verified
    await markOTPVerified(otpRecord.otp_id);
    
    // 6. Log success
    await auditLog({
        event: 'OTPVerified',
        user_id: userId,
        otp_type: otpRecord.otp_type,
        purpose: otpRecord.purpose
    });
    
    return true;
}
```

### 5.4 Resend Logic

**Cooldown Period**:
```typescript
async function resendOTP(userId: UUID): Promise<void> {
    const lastOTP = await getLatestOTP(userId);
    
    // Check 2-minute cooldown
    if (NOW() - lastOTP.generated_at < 2 * 60 * 1000) {
        const waitTime = 120 - Math.floor((NOW() - lastOTP.generated_at) / 1000);
        throw new Error(`Please wait ${waitTime} seconds before requesting new code.`);
    }
    
    // Check hourly limit (max 5 OTPs per hour)
    const hourlyCount = await countOTPsLastHour(userId);
    if (hourlyCount >= 5) {
        throw new Error('Maximum OTP requests exceeded. Please try again later.');
    }
    
    // Generate and send new OTP
    const newOTP = generateOTP();
    await sendOTP(userId, newOTP);
}
```

---

## 6. Account Deactivation

### 6.1 Deactivation Types

**Temporary Suspension**:
- User cannot login
- Data preserved
- Permissions retained
- Can be reactivated
- Use cases: Leave of absence, security incident investigation

**Permanent Deactivation**:
- User cannot login
- Data archived (not deleted, for audit)
- Cannot be reactivated
- Use cases: Employee termination, account closure

### 6.2 Deactivation Process

**Admin-Initiated Deactivation**:
```typescript
async function deactivateUser(
    userId: UUID,
    deactivationType: 'Temporary' | 'Permanent',
    reason: string,
    effectiveDate: DateTime,
    adminId: UUID
): Promise<void> {
    // 1. Validate admin has permission
    await checkPermission(adminId, 'User.Deactivate');
    
    // 2. Check for active assignments
    const activeAssignments = await getActiveAssignments(userId);
    if (activeAssignments.length > 0) {
        throw new Error(
            'Cannot deactivate user with active assignments. ' +
            'Reassign the following: ' + activeAssignments.map(a => a.description).join(', ')
        );
    }
    
    // 3. Terminate all active sessions
    await terminateAllSessions(userId);
    
    // 4. Update user status
    await updateUser(userId, {
        status: deactivationType === 'Temporary' ? 'Suspended' : 'Inactive',
        deactivation_reason: reason,
        deactivated_at: effectiveDate,
        deactivated_by: adminId
    });
    
    // 5. Send notification email
    await sendDeactivationEmail(userId, deactivationType, reason);
    
    // 6. Archive data (if permanent)
    if (deactivationType === 'Permanent') {
        await archiveUserData(userId);
    }
    
    // 7. Audit log
    await auditLog({
        event: 'UserDeactivated',
        user_id: userId,
        actor_id: adminId,
        details: { type: deactivationType, reason, effectiveDate }
    });
}
```

### 6.3 Reactivation (Temporary Suspension Only)

```typescript
async function reactivateUser(userId: UUID, adminId: UUID): Promise<void> {
    const user = await getUser(userId);
    
    // Can only reactivate temporarily suspended users
    if (user.status !== 'Suspended') {
        throw new Error('Only suspended users can be reactivated.');
    }
    
    // Update status
    await updateUser(userId, {
        status: 'Active',
        reactivated_at: NOW(),
        reactivated_by: adminId
    });
    
    // Send notification
    await sendReactivationEmail(userId);
    
    // Audit
    await auditLog({
        event: 'UserReactivated',
        user_id: userId,
        actor_id: adminId
    });
}
```

---

## 7. Password & Account Reset

### 7.1 Reset Methods

**Method 1: Admin-Assisted Reset** (Preferred for low-literacy users):
```
User contacts Admin → Admin verifies identity offline →
Admin generates reset OTP → Admin communicates OTP →
User enters OTP → User sets new password
```

**Method 2: Self-Service Reset**:
```
User clicks "Forgot Password" → Enters email/phone →
System sends reset link → User clicks link (15 min validity) →
User sets new password → Confirmation
```

### 7.2 Admin-Assisted Reset

**Workflow**:
```typescript
async function adminAssistedReset(
    userId: UUID,
    adminId: UUID,
    verificationMethod: 'Phone' | 'Email' | 'InPerson',
    justification: string
): Promise<string> {
    // 1. Validate admin permission
    await checkPermission(adminId, 'User.ResetPassword');
    
    // 2. Generate 6-digit OTP
    const resetOTP = generateOTP();
    
    // 3. Store OTP with metadata
    await createPasswordResetOTP({
        user_id: userId,
        otp_code: await bcrypt.hash(resetOTP, 10),
        expires_at: NOW() + 10 * 60 * 1000,  // 10 minutes
        assisted_by: adminId,
        verification_method: verificationMethod,
        justification: justification
    });
    
    // 4. Audit log
    await auditLog({
        event: 'AdminAssistedPasswordReset',
        user_id: userId,
        actor_id: adminId,
        details: { verificationMethod, justification }
    });
    
    // 5. Return OTP to admin (display on screen, not logged)
    return resetOTP;
}
```

### 7.3 Self-Service Reset

**Reset Link Generation**:
```typescript
async function generateResetLink(email: string): Promise<string> {
    const user = await getUserByEmail(email);
    
    if (!user) {
        // Don't reveal if email exists (security)
        return 'success';
    }
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Store token
    await createPasswordResetToken({
        user_id: user.user_id,
        token: await bcrypt.hash(token, 10),
        expires_at: NOW() + 15 * 60 * 1000,  // 15 minutes
        ip_address: request.ip
    });
    
    // Send email
    await sendPasswordResetEmail(user.email, token);
    
    return 'success';
}
```

### 7.4 Password Change Enforcement

**Post-Reset Actions**:
```typescript
async function completePasswordReset(
    userId: UUID,
    newPassword: string
): Promise<void> {
    // 1. Validate password complexity
    validatePasswordStrength(newPassword);
    
    // 2. Check password history (last 3 passwords)
    await checkPasswordHistory(userId, newPassword);
    
    // 3. Hash and store new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, passwordHash);
    
    // 4. Terminate all active sessions (force re-login)
    await terminateAllSessions(userId);
    
    // 5. Update password metadata
    await updateUser(userId, {
        last_password_change: NOW(),
        password_must_change: false
    });
    
    // 6. Send confirmation email
    await sendPasswordChangedEmail(userId);
    
    // 7. Audit log
    await auditLog({
        event: 'PasswordChanged',
        user_id: userId,
        method: 'Reset'
    });
}
```

---

## 8. Audit Logging

### 8.1 Audit Log Entity

```typescript
UserAuditLog {
  log_id: UUID
  tenant_id: UUID
  user_id: UUID | null
  actor_id: UUID | null  // For admin actions
  event_type: enum [
    'TenantRegistered', 'UserInvited', 'UserActivated',
    'Login', 'Logout', 'LoginFailed', 'AccountLocked',
    'PasswordReset', 'PasswordChanged', 'OTPGenerated',
    'OTPVerified', 'UserDeactivated', 'UserReactivated',
    'RoleChanged', 'PermissionGranted', 'PermissionRevoked'
  ]
  event_details: JSON
  ip_address: string
  user_agent: string
  timestamp: DateTime
  session_id: UUID | null
}
```

### 8.2 Logged Events

**User Lifecycle Events**:
- User invitation sent
- User activation completed
- User deactivated/reactivated
- Role assigned/changed

**Authentication Events**:
- Login attempts (success/failure)
- Account lockouts
- MFA verifications
- Session creation/termination

**Security Events**:
- Password resets (admin-assisted and self-service)
- Password changes
- OTP generations and verifications
- Permission changes

**Administrative Actions**:
- User management actions by admins
- Role assignments
- Permission modifications

### 8.3 Audit Log Query & Reporting

**Admin Dashboard Filters**:
- Date range
- User
- Event type
- Status (success/failure)
- IP address

**Retention Policy**:
- Standard: 2 years
- Financial/Compliance: 7 years
- Configurable per tenant

---

## 9. Data Isolation & Security

### 9.1 Tenant Data Isolation

**Schema-per-tenant isolation** ensures that each tenant's data resides in its own PostgreSQL schema. The `django-tenants` library automatically routes queries to the correct schema based on the current tenant context:

```python
# django-tenants automatically sets the schema search path
# All queries within a request are scoped to the tenant's schema
# No tenant_id filtering needed in application queries

# Example: This query only returns users from the current tenant's schema
User.objects.filter(email=email)
# Equivalent SQL: SET search_path TO tenant_001; SELECT * FROM users WHERE email = :email;
```

**Platform-level queries** (Super Admin operations) use the `public` schema:
```python
# Switch to public schema for cross-tenant operations
from django_tenants.utils import schema_context
with schema_context('public'):
    tenants = Tenant.objects.all()
```

### 9.2 Cross-Tenant Prevention

**Schema-level isolation** prevents cross-tenant access at the database level. Additional application-level checks provide defense-in-depth:

```typescript
function validateTenantContext(userId: UUID, resourceTenantId: UUID): void {
    const user = getUser(userId);
    
    if (user.tenant_id !== resourceTenantId) {
        throw new SecurityError('Cross-tenant access denied');
    }
}
```

---

## 10. Related Documentation

- **[Authentication & Security](authentication-security.md)** - Login, session, MFA
- **[RBAC](rbac.md)** - Role-based access control
- **[System Foundation](system-foundation.md)** - Overall architecture

**Related User Stories:**
- US-005: User Invitation & Activation
- US-006: OTP Verification
- US-007: Account Deactivation
- US-008: Password & Account Reset
- US-009: User Activity & Audit Logs

**Source**: PRD_DFMS_v1.0.md - Sections 6.2.1-6.2.8
