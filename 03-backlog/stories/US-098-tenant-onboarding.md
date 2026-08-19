---
title: Tenant Onboarding & Schema Provisioning
story_id: US-098
phase: phase-1
module: User & Tenant Management
priority: Critical
status: In Progress
epic: Platform Admin Portal
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
story_points: 13
created: 2026-03-11
updated: 2026-03-31
completion: ~80%
pending:
  - Resend welcome email endpoint
  - Tenant reactivation endpoint
  - Full audit log writes on provisioning events
  - Trial auto-suspension
source_documents:
  - ../../../../01-source/01-prd/DFMS_Product_Requirements_Document_v3.md
  - ../../../05-modules/01-foundation/user-tenant-management.md
related_stories:
  - US-001-user-login-account-lockout.md
  - US-004-role-hierarchy.md
  - US-005-user-invitation-activation.md
dependencies:
  - US-001-user-login-account-lockout.md
  - US-004-role-hierarchy.md
tags: [tenant, onboarding, provisioning, schema, super-admin, critical, platform]
---

# US-098: Tenant Onboarding & Schema Provisioning

## User Story

**As a** Super Admin (Brainstation-23 platform operator)  
**I want to** onboard a new client organisation as a tenant on the DFMS platform  
**So that** the organisation gets a fully isolated, provisioned environment with a Tenant Admin account ready to use

---

## Business Context

Every DFMS customer is a distinct **tenant**. Before a single user from a client organisation can log in, the platform must:

1. Create the tenant record in the shared `public` schema
2. Provision a dedicated PostgreSQL schema (via `django-tenants`) so the tenant's data is fully isolated
3. Run schema migrations into the new tenant schema
4. Apply the selected subscription plan limits
5. Create the initial Tenant Admin user account
6. Send an activation invitation to the Tenant Admin

This story covers the **full Super Admin provisioning workflow**, including the Tenant Admin welcome email and forced first-login password change. The Tenant Admin's account is created in `active` state with a temporary password — there is no separate activation step. The invitation/activation flow in **US-005** applies to users invited by the Tenant Admin, not to the Tenant Admin themselves. The 4-tier role hierarchy that the Tenant Admin will use is covered by **US-004**.

This story is a **Sprint 1 prerequisite** — nothing else in the system can be tested end-to-end without at least one provisioned tenant.

---

## Acceptance Criteria

### Must Have (Critical)

- [ ] Super Admin SHALL be able to create a new tenant via the platform admin panel form
- [ ] Form SHALL collect: Organisation Name, Business Category, Industry Type, Subscription Plan, Tenant Admin Name, Tenant Admin Email, Tenant Admin Phone, Organisation Address
- [ ] System SHALL validate Organisation Name is unique (platform-wide, 3–100 chars)
- [ ] System SHALL validate Tenant Admin Email is unique and MX record resolves
- [ ] System SHALL automatically provision a dedicated PostgreSQL schema on submission (`django-tenants` `create_tenant` management command or equivalent)
- [ ] System SHALL run all Django migrations against the new tenant schema immediately after provisioning
- [ ] System SHALL create the tenant record in `public.tenants` with the selected subscription plan limits (`max_users`, `max_monthly_trips`, `storage_limit_gb`, `enabled_modules`)
- [ ] System SHALL create the Tenant Admin user record in the new tenant schema with status `active` and `password_must_change = true`
- [ ] System SHALL auto-generate a 12-character temporary password (mixed case + digit + special char) for the Tenant Admin
- [ ] System SHALL send a welcome email to the Tenant Admin containing: the tenant login URL with email pre-filled as a query param, the temporary password, and step-by-step login instructions
- [ ] Temporary password SHALL expire 72 hours after provisioning
- [ ] System SHALL enforce a forced password change on first login: after the Tenant Admin successfully enters the temporary password, the system MUST redirect to a "Set New Password" screen before creating the session — this screen cannot be skipped
- [ ] Login page SHALL read the `email` query parameter from the URL and pre-populate the email/identifier field
- [ ] System SHALL log the full provisioning event to `public.audit_logs`
- [ ] Super Admin SHALL be able to list all tenants with their status and subscription tier
- [ ] Super Admin SHALL be able to view a single tenant's details and edit subscription plan
- [ ] Super Admin SHALL be able to suspend or reactivate a tenant (cascades to blocking all tenant user logins)

### Should Have (High)

- [ ] System SHOULD show provisioning progress (schema creation can take 2–5 seconds)
- [ ] System SHOULD allow Super Admin to resend the welcome email with a fresh temporary password (resets the 72-hour expiry window)
- [ ] System SHOULD enforce subdomain uniqueness (each tenant gets `<slug>.dfms.app`)
- [ ] System SHOULD auto-generate the subdomain slug from the organisation name (editable before save)

### Nice to Have (Medium)

- [ ] System MAY support a trial period end date with automatic suspension
- [ ] System MAY send a Slack/email notification to the DFMS ops team on each new tenant provisioned

---

## Functional Requirements

### FR-098-001: Tenant Creation Form (Super Admin Panel)

**Required Fields**:
- `organization_name` — 3–100 chars, unique, alphanumeric + `&.,()-` allowed
- `business_category` — enum: `Manufacturing`, `Distribution`, `FMCG`, `Agro`, `Other`
- `industry_type` — free text
- `subscription_plan` — enum: `Basic`, `Starter`, `Growth`, `Enterprise`
- `admin_name` — Tenant Admin full name
- `admin_email` — unique platform-wide, valid format, MX verified
- `admin_phone` — E.164 format, unique platform-wide
- `address` — street, city, state, postal_code, country

**Auto-generated**:
- `tenant_id` — UUID
- `schema_name` — derived from `organization_name` (e.g., `nourish_poultry` → `tenant_nourish_poultry`)
- `subdomain` — editable slug

### FR-098-002: Tenant Provisioning Steps

Executed atomically (rollback on any failure):

```
Step 1: Validate all form inputs (uniqueness, format)
Step 2: Create record in public.tenants with status = Active
Step 3: Run: python manage.py create_tenant --schema=<schema_name>
Step 4: Run: python manage.py migrate_schemas --schema=<schema_name>
Step 5: Create Tenant Admin user in <schema_name>.users
          - status = active (account is ready; no separate activation needed)
          - password_hash = bcrypt(auto_generated_temp_password)
          - password_must_change = true
Step 6: Send welcome email to admin_email (see FR-098-006)
Step 7: Write audit log to public.audit_logs
```

### FR-098-006: Tenant Admin Welcome Email & First Login Flow

**Email content**:

```
Subject: Your DFMS Admin Account is Ready — [Organisation Name]

Welcome to DFMS!

Your organisation [Organisation Name] has been set up on the DFMS platform.

Login Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL : https://<subdomain>.dfms.app/login?email=<encoded_admin_email>
Email      : <admin_email>
Temporary Password: <auto_generated_password>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To log in:
1. Click the Portal URL above (your email will be pre-filled)
2. Enter the OTP sent to your email/phone
3. Enter the temporary password above
4. You will be immediately prompted to set a new permanent password

This temporary password expires in 72 hours.
If you did not request this account, please contact support@dfms.app.
```

**Login URL construction**:
- Base: `https://<tenant_subdomain>.dfms.app/login`
- Query param: `?email=<url_encoded_admin_email>` — pre-fills the email field on the login page
- The login page reads the `email` query param on load and populates the identifier field; the user does not need to type it
- The URL does not contain the password or any session token (the pre-fill is a UX convenience only)

**First Login Flow** (after clicking the URL in the email):

```
Step 1 — Identity (pre-filled from URL param)
  → Email field pre-populated with admin_email
  → User clicks "Send OTP"

Step 2 — OTP Verification
  → System sends 6-digit OTP to admin_email (and/or phone)
  → User enters OTP

Step 3 — Password
  → User enters the temporary password from the email

Step 4 — Forced Password Change (triggered by password_must_change = true)
  → System intercepts the session creation
  → Redirects to "Set New Password" screen (cannot skip)
  → User enters new password + confirmation
  → Password must satisfy complexity rules (≥8 chars, upper, lower, digit, special char)
  → System updates password_hash, sets password_must_change = false, records last_password_change
  → Session created → Redirect to Tenant Admin Dashboard
```

**Temporary password rules**:
- Auto-generated: 12 characters, mixed case + digit + special char
- Stored as bcrypt hash; the plaintext is included once in the welcome email and never stored
- Expires 72 hours after provisioning; after expiry the Super Admin must resend the welcome email with a new temporary password
- Cannot be reused after the Tenant Admin sets their permanent password (enforced by password history check)

### FR-098-003: Subscription Plan Limits

Limits are sourced from `user-tenant-management.md §3.1` (technically authoritative) and must match the `public.subscription_plans` seed data:

| Plan | Max Users | Max Monthly Trips | Storage | Key Features | Indicative Price |
|------|-----------|-------------------|---------|--------------|-----------------|
| Basic | 5 | 100 | 1 GB | TR/TO, Fleet basics, GPS tracking | $49/month |
| Starter | 15 | 500 | 5 GB | All Basic + Vendor portal, QC module | $149/month |
| Growth | 50 | 2,000 | 20 GB | All Starter + Analytics, Cost management, PR/PO | $499/month |
| Enterprise | Unlimited | Unlimited | Unlimited | All features + White-label, ERP integration | Custom |

> **Note**: `project-summary.md` uses vehicles as the scalability metric (8/25/100 vehicles) rather than users. This reflects a business/commercial framing of plan tiers. The module spec limits above are what the system enforces at runtime and must be used when seeding `public.subscription_plans`. The two views are complementary — vehicle limits may be added as a separate enforcement dimension in a future story.

### FR-098-004: Tenant Suspension

- Suspending a tenant sets `public.tenants.status = Suspended`
- `django-tenants` middleware returns HTTP 403 for all requests routed to a suspended tenant's schema
- All active JWT sessions for the tenant's users are invalidated (via Redis blacklist or short TTL)
- Tenant data is preserved; no schema deletion

### FR-098-005: Tenant Listing (Super Admin Dashboard)

- Table: Organisation Name, Subdomain, Plan, Status, Users Count, Created At, Actions
- Filters: Status (Active/Suspended/Trial), Plan
- Search: by organisation name or admin email

---

## Business Rules

| Rule | Description |
|------|-------------|
| BR-098-001 | Organisation Name must be globally unique across all tenants |
| BR-098-002 | Tenant Admin Email must be unique across the entire platform (not just the tenant) |
| BR-098-003 | Schema provisioning must complete before the activation email is sent |
| BR-098-004 | If any provisioning step fails, all previous steps in the transaction must be rolled back |
| BR-098-005 | Super Admin cannot create tenants via the regular Django admin — only via the platform admin panel |
| BR-098-006 | A suspended tenant's schema is never deleted automatically; deletion requires a manual ops action |
| BR-098-007 | Trial tenants auto-suspend after `trial_ends_at` date (background Celery task) |

---

## Data Model

### `public.tenants` (key fields)

```sql
CREATE TABLE tenants (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_name           VARCHAR(63) UNIQUE NOT NULL,    -- PostgreSQL schema name
    name                  VARCHAR(200) UNIQUE NOT NULL,   -- Organisation display name
    subdomain             VARCHAR(100) UNIQUE NOT NULL,   -- <subdomain>.dfms.app
    business_category     VARCHAR(50),
    industry_type         VARCHAR(100),
    subscription_plan_id  UUID REFERENCES subscription_plans(id),
    admin_email           VARCHAR(254) UNIQUE NOT NULL,
    admin_phone           VARCHAR(20) UNIQUE NOT NULL,
    address               JSONB,
    status                VARCHAR(20) DEFAULT 'active',   -- active | suspended | trial
    trial_ends_at         TIMESTAMPTZ,
    -- Tenant Admin user is provisioned separately in the tenant schema:
    -- users.password_must_change = true until first login password change completes
    -- users.temp_password_expires_at = created_at + 72h
    created_by            UUID,                           -- Super Admin user ID (platform-level)
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);
```

---

## API Endpoints (Super Admin Panel)

```
POST   /platform-admin/api/tenants                    — Create & provision tenant
GET    /platform-admin/api/tenants                    — List all tenants
GET    /platform-admin/api/tenants/{id}               — Get tenant details
PUT    /platform-admin/api/tenants/{id}               — Update subscription plan / metadata
POST   /platform-admin/api/tenants/{id}/suspend       — Suspend tenant
POST   /platform-admin/api/tenants/{id}/reactivate    — Reactivate suspended tenant
POST   /platform-admin/api/tenants/{id}/resend-welcome — Resend Tenant Admin welcome email with fresh temporary password
```

> Note: All `/platform-admin/` endpoints require a Super Admin JWT and are served from a separate URL prefix not accessible to tenant users.

---

## Non-Functional Requirements

- **Performance**: Full schema provisioning (schema create + migrations) must complete within 30 seconds
- **Atomicity**: Provisioning is fully transactional — no partial tenant state on failure
- **Security**: `/platform-admin/` routes are not exposed via the tenant subdomain; served only from `admin.dfms.app`
- **Auditability**: Every tenant create / suspend / reactivate event is logged to `public.audit_logs` with actor, timestamp, and before/after state

---

## Testing Scenarios

### TC-098-001: Happy Path — New Tenant Provisioning
1. Super Admin submits valid tenant creation form
2. Verify `public.tenants` record created
3. Verify PostgreSQL schema `tenant_<slug>` exists
4. Verify all tables exist in the new schema (run `\dt tenant_<slug>.*`)
5. Verify Tenant Admin user in `<schema>.users` with status `pending`
6. Verify activation email sent to Tenant Admin email
7. Verify audit log entry in `public.audit_logs`

### TC-098-002: Duplicate Organisation Name
1. Create tenant "Nourish Poultry"
2. Attempt to create another tenant "Nourish Poultry"
3. Verify validation error returned before any provisioning

### TC-098-003: Provisioning Failure Rollback
1. Simulate schema migration failure (e.g., DB disk full)
2. Verify `public.tenants` record rolled back
3. Verify no orphaned PostgreSQL schema exists

### TC-098-004: Tenant Suspension
1. Super Admin suspends active tenant
2. Tenant user attempts login
3. Verify 403 Forbidden returned
4. Verify existing JWT sessions invalidated

### TC-098-005: Tenant Reactivation
1. Reactivate suspended tenant
2. Tenant user logs in successfully
3. Verify all tenant data intact

### TC-098-006: Tenant Admin Welcome Email & Pre-filled Login URL
1. Super Admin provisions new tenant (admin_email = "admin@nourish.com", subdomain = "nourish")
2. Verify welcome email sent to admin@nourish.com
3. Verify email contains login URL: `https://nourish.dfms.app/login?email=admin%40nourish.com`
4. Verify email contains a 12-character temporary password
5. Open the URL in a browser — verify email field is pre-populated with "admin@nourish.com"

### TC-098-007: Forced Password Change on First Login
1. Tenant Admin opens pre-filled login URL from email
2. OTP sent to admin@nourish.com — enters OTP
3. Enters the temporary password from the email — password accepted
4. Verify system does NOT create a session and does NOT redirect to dashboard
5. Verify system redirects to "Set New Password" screen
6. Tenant Admin sets a new password meeting complexity rules
7. Verify session created and redirect to Admin Dashboard
8. Verify `password_must_change = false` in the users table
9. Attempt to log in again with the old temporary password — verify rejected

### TC-098-008: Temporary Password Expiry
1. Provision tenant; simulate 73 hours elapsed
2. Tenant Admin attempts login with the temporary password
3. Verify login rejected with message "Temporary password has expired"
4. Super Admin resends welcome email with a fresh temporary password
5. Verify Tenant Admin can log in with the new temporary password

---

## Dependencies

- **US-001**: Authentication system must exist to secure the Super Admin panel
- **US-004**: Default roles (Tenant Admin, etc.) must be seeded into each new tenant schema at provisioning time

## Definition of Done

- [ ] Tenant creation form implemented in Super Admin panel
- [ ] Schema provisioning via `django-tenants` integrated and tested
- [ ] Migrations auto-applied to new tenant schemas
- [ ] Activation email sent to Tenant Admin on provisioning
- [ ] Tenant list, detail, suspend, and reactivate endpoints implemented
- [ ] Rollback on provisioning failure verified with tests
- [ ] Audit log written for all tenant lifecycle events
- [ ] Unit and integration tests written and passing
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.1: Multi-Tenant Architecture
- Module Spec: `05-modules/01-foundation/user-tenant-management.md` §2.3–2.4

**Last Updated**: March 2026  
**Status**: Pending
