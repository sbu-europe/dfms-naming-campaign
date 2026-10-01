---
module: 01-foundation
specification: User & Tenant Management
version: 1.0
phase: Phase 1
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: 6.2.1-6.2.8
last_updated: 2026-10-01
phase1_note: Staff users are invited by email or phone (BD mobile). Invite creates a placeholder User (account_status=invited) plus an InvitationToken. Activation OTP is always required for new invitations; otp_type is login 2FA only. See 03-users/staff-invite-login-password-channels.md.
related_stories: US-005, US-006, US-007, US-008, US-009, PAP-05, PAP-06, BUG-01, BUG-02
scope_note: US-005 now consolidates password reset functionality from US-008 (self-service + admin-assisted). Channel-aware invite/login/reset — CR-002.
---

# User & Tenant Management Specification

## Overview

The DFMS platform implements comprehensive user and tenant lifecycle management designed for multi-tenant SaaS environments. This specification covers organization onboarding, tenant creation and ongoing tenant management (view, edit, suspend), user invitation and activation workflows, OTP verification, account management, and audit logging.

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
  
  // Contact (organisation — persisted on the Tenant record)
  contact_email: string
  contact_phone: string   // optional; E.164 when provided
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

Super Admins are **never created through the UI or invitation flow**. They are provisioned manually via database seed or CLI only. The `Super Admin` role is explicitly blocked from the user invitation form — any API request attempting to assign the Super Admin role during invitation will be rejected with HTTP 403 (`ROLE-403-SUPER-ADMIN-RESTRICTED`).

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
- Tenant Admin Phone (international format with country code)
- Tenant Admin Full Name (first and last name)
- Contact Email (optional; auto-populated from Tenant Admin Email when left blank)
- Contact Phone (optional; international format with country code)
- Organization Address (full address fields)

**Validation Rules** (create form):

| Field | Required | Rules |
|-------|----------|-------|
| Organization Name | Yes | 3–100 chars, unique, alphanumeric + `& . , ( ) -` |
| Tenant Admin Email | Yes | Valid email, unique platform-wide |
| Tenant Admin Phone | No | E.164 when provided (e.g. `+8801XXXXXXXXX`); normalised on save |
| Contact Email | No | Valid email when provided |
| Contact Phone | No | **Same E.164 rules as Tenant Admin Phone** when provided; normalised on save |

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
    format: 'email'
  },
  admin_phone: {
    format: 'E.164'  // +8801XXXXXXXXX; optional
  },
  contact_email: {
    format: 'email'  // optional; defaults to admin_email on create
  },
  contact_phone: {
    format: 'E.164'  // +8801XXXXXXXXX; optional; same validator as admin_phone
  }
}
```

Invalid phone values (letters, special characters, wrong digit count, missing leading `+`) **must be rejected** with a clear field-level message before save.

Duplicate Tenant Admin Email addresses (already assigned to another organisation's admin) **must be rejected** on create with a clear field-level message before save (see **BUG-02** in §2.4.1).

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
        contact_email: tenantData.contact_email ?? tenantData.admin_email,
        contact_phone: tenantData.contact_phone,
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
        first_name: tenantData.admin_first_name,
        last_name: tenantData.admin_last_name,
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

### 2.4.1 Platform Admin Interface — Tenant Create & Edit (PAP-05, PAP-06)

Super Admin manages tenants exclusively from the **platform admin** (`admin.dfms.com`). The `Tenant` and `Domain` models use `PlatformOnlyAdminMixin` — they are not visible in tenant-scoped admin sites.

**List & search (PAP-06)**:
- List all client tenants: organisation name, schema, subscription tier, status, modules, created date
- Filter by status, tier, business category; search by name, schema, contact email
- Bulk actions: activate, suspend, cancel, set trial, reinvite tenant admin

**Create (PAP-05)** — add form includes Organisation, Tenant Admin, Contact, Address, Subscription, and Enabled Modules fieldsets. Extra create-only fields (`admin_full_name`, `admin_email`, `admin_phone`) provision the initial Tenant Admin user asynchronously after save.

**Edit (PAP-06)** — change form includes Organisation, Contact, Address, Subscription, Enabled Modules, and Status & Domains. The Tenant Admin fieldset is **not** shown on edit (admin user is managed inside the tenant schema).

**Editable on change**:
- Organisation name, business category, industry type
- Contact email, **contact phone**
- Address fields
- Subscription tier, status, limits, enabled modules, active flag

**Contact Phone validation — create and edit (BUG-01)**:

Contact Phone must be validated **identically** on tenant **create** and **edit**. A value that is rejected when adding a tenant must also be rejected when updating an existing tenant.

| Rule | Create | Edit |
|------|--------|------|
| Blank Contact Phone allowed | Yes | Yes |
| Valid E.164 accepted | Yes | Yes |
| Invalid format rejected with field error | Yes | **Yes** (required — see BUG-01) |
| Value normalised to E.164 on save | Yes | Yes |

**Implementation (admin forms)**:
- Shared base form applies `contact_phone` E.164 validation for both add and change views.
- Create-only form extends the base form with Tenant Admin fields (`admin_phone` uses the same E.164 validator).
- Do **not** rely on the default model form for the change view — it does not enforce phone rules.

**User-visible error** (invalid Contact Phone):

> Enter a valid international phone number starting with + (e.g. +8801XXXXXXXXX).

**API update parity (recommended)**:

When `contact_phone` is supplied on `PATCH /api/v1/tenants/{id}/`, apply the same E.164 validation before persisting. Reject invalid values with a 400 response and a clear validation message.

**Admin Email uniqueness on create (BUG-02)**:

Each organisation's initial **Admin Email** must be **unique platform-wide**. A Super Admin must not be able to create a new organisation using an address that is already the Tenant Admin email for another organisation.

| Rule | Create |
|------|--------|
| New, unused Admin Email accepted | Yes |
| Admin Email already used by another organisation's Tenant Admin | **Rejected** with field error (required — see BUG-02) |
| Comparison case-insensitive | Yes (`Admin@Example.com` = `admin@example.com`) |
| Edit screen (Tenant Admin fieldset absent) | Out of scope for this rule |

**What counts as “already registered”**:

An address is treated as a duplicate if it is already assigned as the **Tenant Admin** for any existing client organisation (checked across all organisation schemas), or is already stored as that organisation's **contact email** from onboarding when Contact Email was left blank.

**Implementation (admin forms)**:
- The create-only add form validates `admin_email` before save using a **shared platform-wide lookup** (same logic used everywhere tenant provisioning runs).
- Normalise the submitted address to lowercase before comparing and before persisting.
- Reject the save on the **Admin Email** field — do not create the organisation record or queue admin provisioning when a duplicate is detected.

**User-visible error** (duplicate Admin Email):

> Email already registered.

**API create parity (recommended)**:

When `admin_email` is supplied on `POST /api/v1/tenants/`, apply the same platform-wide uniqueness rules before provisioning. Reject duplicate values with a 400 response and the same validation message on `admin_email`.

**Audit**:

Subscription, tier, module, and status changes on edit are written to `PlatformAuditLog` in the public schema.

### 2.5 User Creation (by Tenant Admin)

Once the Tenant Admin activates their account, they can create Operational Users across departments (department-scoped where applicable):

```
Tenant Admin → User Management → Invite User →
  Select Role (Department Admin / Operational User) →
  Select Department (predefined dropdown) →
  Select Role (dropdown filtered by selected Department) →
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

Staff onboarding as implemented in `apps/users/`. Channel, OTP, and password detail: [staff-invite-login-password-channels.md](../03-users/staff-invite-login-password-channels.md). Tenant Admin screens: [tenant-user-management.md](../03-users/tenant-user-management.md).

### 4.1 Invitation workflow

```
Tenant Admin → Invite user →
  Placeholder User (account_status = invited, unusable password) +
  InvitationToken (user FK, status = sent, 7-day expiry, activation OTP always generated) →
  Email or SMS dispatched →
  stored status = pending when send succeeds; stays sent when send fails →
Invitee opens /activate/?token=… →
  Verify activation OTP (invite channel) →
  Set password + accept T&C →
  User account_status = active, invitation_status = activated
```

- **Email channel**: email required; phone optional. Link is the full `/activate/?token=` URL. OTP is in the same email.
- **Phone channel**: BD mobile required; `User.email` may be null. SMS carries the OTP and a shortened activation URL (`shorten_for_sms`).
- **Reinvite** uses the stored `invite_channel`, regenerates the OTP, and keeps the token unless the channel or identity changed.
- **`otp_type` (admin label 2FA)** is login 2FA. It does not enable or skip the activation OTP. Allowed values must match the channel: email invites `none`/`email`; phone invites `none`/`phone`.
- Create API response body returns `invitation_status: "sent"` even after the row has moved to `pending`.

**Who can invite**: a Tenant Admin invites operational roles. Staff invite cannot assign `super_admin`, `tenant_super_admin`, `driver`, or `driver_helper`. `tenant_admin` is listed only for a Tenant Super Admin or platform Super Admin. Super Admin accounts are seeded, not invited.

### 4.2 Invitation form

**Fields** (Django admin `InviteUserForm` and `POST /api/v1/tenants/{tenant_id}/users/invitations/`):

| Field | Required | Rules |
|-------|----------|-------|
| Invite channel | Yes | `email` or `phone` |
| Email | Email channel | Unique among active users; normalized |
| Phone | Phone channel | BD mobile → E.164 `+8801…`; unique among active users |
| First name | Yes | |
| Last name | No | |
| Employee ID | Yes | Unique when non-blank |
| Role | Yes | One role. API field is `role_ids` (list); only the first id is applied. Department must allow that role. |
| Site (POI) | POI-scoped roles | Required for those roles; must be omitted for the others |
| 2FA (`otp_type`) | Yes (has a default) | Default `none`. Login 2FA only |

There is no custom invitation message, scheduled send, functional role type, or per-tenant email template editor.

**Plan limit**: when the tenant `max_users` is set, invite is rejected with `PLAN-403-LIMIT` once the active-user count has reached it.

### 4.2.1 Bulk invitation (CSV)

`POST /api/v1/tenants/{tenant_id}/users/invitations/bulk/` with multipart `file` or `csv`.

**Columns**: `employee_id`, `invite_channel`, `email`, `phone_number`, `first_name`, `last_name`, `role_code`, `department`, `poi_code`, `otp_type`.

- Maximum **100** rows.
- One `role_code` per row. Department must match that role.
- Valid rows are invited; invalid rows are reported with a row number and reason.
- Each success follows the same placeholder-user + token + OTP path as a single invite.

### 4.3 Invitation message and token

**Email** includes the inviter name, organisation name, the activation URL, the 6-digit OTP, and the 7-day expiry.

**SMS** uses the short URL and the same OTP. When `SMS_ENABLED` is false the body is logged and the invitation still becomes `pending`.

**Resend**:

- Cooldown 2 minutes (`last_resent_at`), including when dispatch fails.
- Same activation token, new OTP, same channel.
- Expired invitations are renewed for another 7 days and `otp_verified` is cleared.
- Identity or channel change rotates the token and revokes short links.

```typescript
InvitationToken {
  token: UUID
  user_id: UUID | null          // placeholder User; set on create
  email: string                 // blank for phone-only
  phone_number: string
  invite_channel: 'email' | 'phone'
  role_id: UUID
  department: string
  employee_id: string
  invitee_first_name: string
  invitee_last_name: string
  poi_id: UUID | null
  invited_by: UUID
  expires_at: DateTime          // 7 days from creation
  invitation_status: 'sent' | 'pending' | 'activated' | 'expired' | 'cancelled'
    // sent      — created; delivery not confirmed
    // pending   — email/SMS dispatch succeeded
    // activated — password set and T&C accepted
    // expired   — expiry passed (set when activation is attempted late)
    // cancelled — API cancel
  otp_type: 'none' | 'email' | 'phone'   // login 2FA, not the activation gate
  activation_otp_hash: string            // SHA-256; always set for new invites
  activation_otp_expires_at: DateTime    // 10 minutes
  activation_otp_attempts: number        // max 3
  otp_verified: boolean
  is_used: boolean
  used_at: DateTime | null
}
```

Pending uniqueness: one unused, non-terminal invitation per email, per phone, per employee ID, and per user.

### 4.4 Account activation steps

Page: `GET/POST /activate/?token={uuid}` on the tenant host.

**Step 1 — Open the link**

- Token must be unused, not cancelled/expired/activated, and before `expires_at`. The page rejects the link once that clock has passed.
- Submitting activation after expiry (`activate_invitation`) stores `invitation_status=expired`.

**Step 2 — Activation OTP**

- Shown when `activation_otp_hash` is set and `otp_verified` is false. That is every new invitation.
- Code was already delivered with the invite (email or SMS). The page masks the destination.
- 10-minute validity, 3 attempts, then the invitee must resend (`POST …/otp/resend/` or the page resend, 2-minute cooldown).
- Success sets `otp_verified` and the page moves to the password step.
- Legacy rows with an empty hash skip this step until someone resends them.

**Step 3 — Password and terms**

- Password and confirmation. Rules: 8+ characters, uppercase, lowercase, digit, special character.
- Terms & Conditions checkbox is required.
- No profile photo on this page. First and last name are taken from the invitation (API may override them).

**Step 4 — Complete**

- Placeholder user is updated: password set, `account_status=active`, `is_staff=true`, `is_email_verified=true` when an email exists.
- Role assignment is refreshed from the invitation; POI-scoped roles get `UserOperationalPOI`.
- Invitation `is_used=true`, status `activated`; short links revoked.
- Welcome email when the user has an email.
- Audit action `User.Activate`.
- `/activate/success/` logs out any previous portal session and issues a new JWT pair.

---

## 5. OTP Verification System

Activation OTP for staff onboarding is stored on `InvitationToken` (`activation_otp_hash`, 10-minute expiry, 3 attempts), not in a separate OTP table. New invitations always generate one, delivered on `invite_channel`. `otp_type` on the same row is login 2FA and is not the activation gate. Login and password-reset OTPs are separate records. The shapes below describe that family of checks (hash compare, expiry, attempt cap, resend cooldown).

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
  otp_type: enum ['None', 'Email', 'Phone']  // must match invite_channel
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

> **Related Story**: [US-007: Account Deactivation](../../03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/US-007-account-deactivation.md)

### 6.1 Deactivation Types

| Type | Status | Data | Reactivation | Use Cases |
|------|--------|------|--------------|-----------|
| **Temporary Suspension** | `Suspended` | Preserved, permissions retained | Yes (admin approval) | Leave of absence, security incident investigation, role transition |
| **Permanent Deactivation** | `Inactive` | Archived (not deleted, for audit) | No | Employee termination, account closure, compliance action |

**Rules**:
- Deactivation type **cannot be changed** after confirmation
- Only Platform Super Admin and Tenant Super Admin can deactivate users
- Admin cannot deactivate their own account
- At least one active Tenant Admin must remain per tenant

### 6.2 Deactivation Process

**Required Fields**:
- Deactivation type (Temporary / Permanent)
- Reason (predefined dropdown or custom text)
- Effective date (default: Immediate; supports future scheduling)
- Admin remarks (mandatory text area)

**Admin-Initiated Deactivation**:
```typescript
async function deactivateUser(
    userId: UUID,
    deactivationType: 'Temporary' | 'Permanent',
    reason: string,
    adminRemarks: string,
    effectiveDate: DateTime,
    adminId: UUID,
    overrideActiveAssignments: boolean = false,
    overrideRemarks?: string
): Promise<DeactivationResult> {
    // 1. Validate admin has permission
    await checkPermission(adminId, 'UserMgmt.User.Deactivate');
    
    // 2. Prevent self-deactivation
    if (userId === adminId) {
        throw new Error('Cannot deactivate your own account.');
    }
    
    // 3. Ensure at least one active Tenant Admin remains
    if (await isLastActiveTenantAdmin(userId)) {
        throw new Error('At least one active Tenant Admin required.');
    }
    
    // 4. Check for active critical assignments
    const activeAssignments = await getActiveAssignments(userId);
    // Checks: Active TOs, active trips, pending approvals, active QC inspections
    if (activeAssignments.length > 0 && !overrideActiveAssignments) {
        return {
            status: 'blocked',
            code: 'DA-409-ACTIVE-ASSIGNMENTS',
            active_assignments: activeAssignments,
            message: 'User has active critical assignments. Override required.'
        };
    }
    
    // 5. If future date, schedule deactivation instead
    if (effectiveDate > NOW()) {
        return await scheduleDeactivation(userId, deactivationType, reason, adminRemarks, effectiveDate, adminId);
    }
    
    // 6. Terminate all active sessions immediately
    await terminateAllSessions(userId);
    
    // 7. Update user status
    await updateUser(userId, {
        status: deactivationType === 'Temporary' ? 'Suspended' : 'Inactive',
        deactivation_reason: reason,
        deactivated_at: effectiveDate,
        deactivated_by: adminId
    });
    
    // 8. Send notification email to user
    await sendDeactivationEmail(userId, deactivationType, reason, effectiveDate);
    
    // 9. Send notification to admin who performed deactivation
    await sendAdminDeactivationConfirmation(adminId, userId, deactivationType);
    
    // 10. Archive data (if permanent)
    if (deactivationType === 'Permanent') {
        await archiveUserData(userId);
    }
    
    // 11. Audit log (immutable)
    await auditLog({
        event: 'UserDeactivated',
        user_id: userId,
        actor_id: adminId,
        ip_address: request.ip,
        details: {
            type: deactivationType,
            reason,
            admin_remarks: adminRemarks,
            effectiveDate,
            override_used: overrideActiveAssignments,
            override_remarks: overrideRemarks,
            active_assignments_at_time: activeAssignments.length
        }
    });
    
    return { status: 'success', deactivation_id: generateUUID() };
}
```

### 6.2.1 Bulk Deactivation

```typescript
async function bulkDeactivateUsers(
    userIds: UUID[],
    deactivationType: 'Temporary' | 'Permanent',
    reason: string,
    adminRemarks: string,
    effectiveDate: DateTime,
    adminId: UUID
): Promise<BulkDeactivationResult> {
    await checkPermission(adminId, 'UserMgmt.User.Deactivate');
    
    if (userIds.length === 0) {
        throw new Error('At least one user required.');
    }
    
    // Deduplicate and exclude admin's own account
    const uniqueIds = [...new Set(userIds)].filter(id => id !== adminId);
    
    const results: DeactivationResult[] = [];
    
    for (const userId of uniqueIds) {
        try {
            const result = await deactivateUser(
                userId, deactivationType, reason, adminRemarks,
                effectiveDate, adminId, false
            );
            results.push({ user_id: userId, ...result });
        } catch (error) {
            results.push({ user_id: userId, status: 'failed', error: error.message });
        }
    }
    
    return {
        success_count: results.filter(r => r.status === 'success').count(),
        failure_count: results.filter(r => r.status !== 'success').count(),
        results
    };
}
```

### 6.3 Assignment Prevention

Deactivated users (`Suspended` or `Inactive` status) are excluded from all operational workflows:

| Prevention Area | Behavior |
|---|---|
| User selection dropdowns | Deactivated users filtered out (only `Active` shown) |
| Transport Order assignment | API rejects assignment with HTTP 400 |
| Trip assignment | API rejects with "Cannot assign to deactivated user" |
| Vehicle-driver pairing | Deactivated driver excluded from pairing |
| Task/approval assignment | Deactivated user cannot receive new approvals |
| Historical records | Deactivated user shown with "Deactivated" badge; data preserved |

### 6.4 Reactivation (Temporary Suspension Only)

```typescript
async function reactivateUser(
    userId: UUID,
    adminId: UUID,
    reactivationReason: string
): Promise<void> {
    // 1. Validate admin permission
    await checkPermission(adminId, 'UserMgmt.User.Reactivate');
    
    const user = await getUser(userId);
    
    // 2. Only temporarily suspended users can be reactivated
    if (user.status !== 'Suspended') {
        throw new Error('Only suspended users can be reactivated. Permanently deactivated accounts cannot be reactivated.');
    }
    
    // 3. Check subscription plan limit
    if (await isOverPlanLimit(user.tenant_id)) {
        throw new Error('User limit reached. Upgrade subscription before reactivating.');
    }
    
    // 4. Update status and restore roles
    await updateUser(userId, {
        status: 'Active',
        reactivated_at: NOW(),
        reactivated_by: adminId
    });
    
    // 5. Send notification to user
    await sendReactivationEmail(userId);
    
    // 6. Audit log
    await auditLog({
        event: 'UserReactivated',
        user_id: userId,
        actor_id: adminId,
        ip_address: request.ip,
        details: { reactivation_reason: reactivationReason }
    });
}

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
User clicks "Forgot Password" → Enters email OR phone (single field) →
System sends reset link + OTP on matching channel (email or SMS) →
User clicks link (15 min validity) → Verifies OTP → Sets new password → Confirmation
```

> Channel overview: [staff-invite-login-password-channels.md](../03-users/staff-invite-login-password-channels.md).
> Admin login phone UX: fixed prefix **`+88`** + 11-digit local starting with `0`. Forgot-password UI uses one combined field (no Email/Phone tabs).

### 7.2 Admin-Assisted Reset

**Prerequisites**:
- Admin must have `UserMgmt.User.ResetPassword` permission (Tenant Admin or Department Admin)
- Admin must verify user's identity offline before initiating the reset
- Justification remarks are mandatory (minimum 10 characters)
- Verification method must be selected: Phone, Email, or In-Person

**Workflow**:
```typescript
async function adminAssistedReset(
    userId: UUID,
    adminId: UUID,
    verificationMethod: 'Phone' | 'Email' | 'InPerson',
    justification: string
): Promise<string> {
    // 1. Validate admin permission
    await checkPermission(adminId, 'UserMgmt.User.ResetPassword');
    
    // 2. Validate justification
    if (justification.length < 10) {
        throw new Error('Justification must be at least 10 characters');
    }
    
    // 3. Generate 6-digit OTP
    const resetOTP = generateOTP();
    
    // 4. Store OTP with metadata
    await createPasswordResetOTP({
        user_id: userId,
        otp_code: await bcrypt.hash(resetOTP, 10),
        expires_at: NOW() + 10 * 60 * 1000,  // 10 minutes
        assisted_by: adminId,
        verification_method: verificationMethod,
        justification: justification
    });
    
    // 5. Audit log (immutable)
    await auditLog({
        event: 'AdminAssistedPasswordReset',
        user_id: userId,
        actor_id: adminId,
        details: { verificationMethod, justification },
        ip_address: request.ip
    });
    
    // 6. Send notification to user about admin-assisted reset
    await notifyUser(userId, 'PasswordResetInitiated', { method: 'admin-assisted' });
    
    // 7. Return OTP to admin (display on screen, not sent to user)
    return resetOTP;
}
```

### 7.3 Self-Service Reset

**Rate Limiting**: Maximum 3 reset requests per hour per user. Exceeding this returns HTTP 429.

**Reset Link Generation**:
```typescript
async function generateResetLink(identifier: string): Promise<string> {
    // Identifier: email (contains @) or BD phone; invalid format → validation error
    const user = await findUserByEmailOrPhone(identifier);
    
    if (!user) {
        // Don't reveal if account exists (prevent enumeration)
        return 'success';
    }
    
    // Check rate limit
    const recentResets = await countResetRequestsLastHour(user.user_id);
    if (recentResets >= 3) {
        throw new RateLimitError('Too many reset requests. Please try again later.');
    }
    
    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Generate 6-digit OTP for verification
    const otp = generateOTP();
    
    // Store token and OTP
    await createPasswordResetToken({
        user_id: user.user_id,
        token: await bcrypt.hash(token, 10),
        otp_code: await bcrypt.hash(otp, 10),
        expires_at: NOW() + 15 * 60 * 1000,  // Reset link: 15 minutes
        otp_expires_at: NOW() + 10 * 60 * 1000,  // OTP: 10 minutes
        ip_address: request.ip
    });
    
    // Deliver on the channel matching the identifier
    if (identifier.includes('@')) {
        await sendPasswordResetEmail(user.email, { token, otp });
    } else {
        await sendPasswordResetSms(user.phone_number, { token, otp });
    }
    
    return 'success';
}
```

### 7.4 Password Change Enforcement

**Password Complexity Rules** (applies to activation, password reset, and password change):
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot reuse last 3 passwords
- Hashed using bcrypt with tenant-specific salt

**Suspicious Activity Detection**:
- System detects unusual reset patterns (e.g., multiple resets across different users from same IP)
- Suspicious patterns trigger additional verification or alert to Tenant Admin
- All suspicious activity logged for security review

**Post-Reset Actions**:
```typescript
async function completePasswordReset(
    userId: UUID,
    newPassword: string,
    method: 'self-service' | 'admin-assisted'
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
        method: method,
        ip_address: request.ip,
        device_id: request.headers['x-device-id']
    });
}
```

### 7.5 Authenticated Change Password (Change Password)

Authenticated users can change their password from Profile/Settings.

**Policy**:
- Enforce the same password complexity rules
- Prevent reuse of last 3 passwords
- Invalidate all active sessions after successful change (force re-login)
- Optional OTP verification can be required based on security policy (high-risk roles or suspicious activity)

```typescript
async function changePassword(
    userId: UUID,
    newPassword: string,
    confirmPassword: string,
    otp?: string
): Promise<void> {
    if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
    }

    // Optional OTP step (policy-driven)
    if (requiresOtpForPasswordChange(userId)) {
        if (!otp) throw new Error('OTP required');
        await verifyOTP(userId, otp);
    }

    validatePasswordStrength(newPassword);
    await checkPasswordHistory(userId, newPassword);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(userId, passwordHash);

    await terminateAllSessions(userId);
    await sendPasswordChangedEmail(userId);

    await auditLog({
        event: 'PasswordChanged',
        user_id: userId,
        method: 'change-password',
        ip_address: request.ip,
        device_id: request.headers['x-device-id']
    });
}
```

---

## 8. Audit Logging (US-009)

### 8.1 Audit Log Entity

```typescript
AuditLog {
  log_id: UUID
  tenant_id: UUID
  user_id: UUID | null          // null for system-generated events
  actor_id: UUID | null         // Admin who performed the action
  event_type: enum [
    'LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'ACCOUNT_LOCKOUT',
    'ACCOUNT_UNLOCK', 'SESSION_TIMEOUT',
    'PASSWORD_RESET', 'PASSWORD_CHANGED',
    'OTP_GENERATION', 'OTP_VERIFICATION', 'OTP_RESEND',
    'USER_INVITED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_REACTIVATED',
    'ROLE_CHANGED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED',
    'CREATE', 'READ', 'UPDATE', 'DELETE',
    'AUDIT_LOG_ACCESS', 'AUDIT_LOG_EXPORT'
  ]
  entity_type: string | null    // e.g., 'User', 'Vehicle', 'Trip'
  entity_id: string | null
  action: string                // e.g., 'Vehicle.Create', 'User.Deactivate'
  status: enum ['success', 'failure']
  failure_reason: string | null
  details: JSON                 // Before/after values, justification, error messages
  ip_address: string
  device_id: string
  user_agent: string
  location: string | null
  timestamp: DateTime
  session_id: UUID | null
}
```

**Audit Log Access Entity** (meta-auditing):
```typescript
AuditLogAccess {
  access_id: UUID
  log_id: UUID | null           // Specific log entry viewed, or null for list/export
  accessed_by: UUID
  access_type: enum ['view', 'export']
  filters_applied: JSON | null  // Filters used during query/export
  export_format: string | null  // 'csv' or 'json'
  ip_address: string
  accessed_at: DateTime
}
```

### 8.2 Logged Events

**Authentication Events**:
- Login attempts (success/failure with failure reason: `InvalidPassword`, `AccountLocked`, `AccountInactive`)
- Logout (user-initiated and forced)
- Account lockouts (`MaxAttemptsExceeded`)
- Account unlocks (with admin ID and justification)
- Session creation, termination, and timeout (with session duration)

**OTP Operation Events**:
- OTP generation (delivery method: `email`/`sms`, operation type: `login`/`activation`/`password_reset`)
- OTP verification (success/failure, attempt count)
- OTP resend (resend count, cooldown status)

**Password Events**:
- Self-service password reset (initiation, completion, failure with reason)
- Admin-assisted password reset (admin ID, justification, verification method)
- Password change (during activation, forced change, voluntary change)

**User Lifecycle Events**:
- User invitation sent (with role, department)
- User activation completed
- User deactivated (type: temporary/permanent, reason, admin remarks)
- User reactivated (admin ID, timestamp)

**CRUD Operation Events**:
- **Create**: Entity type, Entity ID, created data snapshot
- **Read**: Entity type, Entity ID, access timestamp (logged for sensitive entities only to manage volume)
- **Update**: Entity type, Entity ID, old values, new values, changed fields list
- **Delete**: Entity type, Entity ID, full deleted entity snapshot

**Administrative Actions**:
- Role assigned/changed (user, old role, new role)
- Permission granted/revoked
- Bulk operations (each entity logged individually)

### 8.3 Log Immutability & Storage

- **Immutable**: Logs stored in append-only tables; database-level constraints prevent UPDATE and DELETE
- **No API modification**: No PUT, PATCH, or DELETE endpoints for audit logs (HTTP 405 on attempts)
- **Encrypted at rest**: AES-256 with key rotation every 90 days
- **Performance**: Log writes < 50ms; async write path ensures no impact on user-facing operations

### 8.4 Audit Dashboard & Export

**Dashboard** (requires `UserMgmt.AuditLog.Read` permission):
- Real-time log feed with auto-refresh
- Filters: Date range, User, Event Type, Status, IP Address
- Full-text search across log entries
- Log detail view with before/after comparison for UPDATE events
- Related logs (same user, same entity)
- Pagination: 25/50/100 per page

**Export** (requires `UserMgmt.AuditLog.Export` permission):
- CSV and JSON formats
- Filters applied before export
- Bulk export for compliance reporting
- Streaming for large datasets (100k+ records)

**Meta-Auditing**: All dashboard access and export operations are themselves logged in `AuditLogAccess`

### 8.5 Retention Policy

- **Minimum**: 2 years (mandatory for all tenants)
- **Extended**: Configurable up to 7 years per tenant
- **Archival**: Logs beyond active retention window compressed and moved to cold storage; remain queryable
- **Purge**: Only logs past the configured retention period may be purged (automated job)

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
- US-005: User Invitation, Activation & Password Reset (consolidated scope — includes password reset from US-008)
- US-006: OTP Verification
- US-007: Account Deactivation (temporary suspension, permanent deactivation, bulk, assignment prevention, reactivation)
- US-008: Password & Account Reset (scope consolidated into US-005)
- US-009: User Activity & Audit Logs

**Source**: DFMS_Product_Requirements_Document_v3.md - Sections 6.2.1-6.2.8
