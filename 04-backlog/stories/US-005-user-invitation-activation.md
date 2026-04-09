---
title: User Invitation & Activation
story_id: US-005
phase: phase-1
module: User & Tenant Management
priority: Critical
status: In Progress
epic: Client Portal
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
story_points: 5
completion: ~70%
pending:
  - Bulk invitation via CSV
  - Resend invitation endpoint (platform admin)
  - Invitation expiry cleanup task
created: 2026-02-13
updated: 2026-04-09
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-006-otp-verification.md
  - US-007-account-deactivation.md
  - US-008-password-account-reset.md
dependencies: []
tags: [user-management, invitation, activation, onboarding, critical]
---

# US-005: User Invitation & Activation

## User Story

**As a** Tenant Super Admin  
**I want to** invite users, activate accounts securely, and reset passwords through both self-service and admin-assisted methods  
**So that** user onboarding and account recovery are secure, flexible, and accessible for all types of users (including low-literacy users such as Drivers)

## Business Context

Organizations need to onboard multiple users with different roles and provide accessible account recovery. The system must support:
- Secure user onboarding via invitation and activation workflows
- Proper role assignment during invitation (18 operational roles across 6 departments)
- Email/mobile OTP verification before account activation
- Bulk user invitation via CSV upload
- Subscription plan limit enforcement during invitation
- Admin-assisted password reset for low-literacy users (e.g., Drivers, Helpers)
- Self-service password reset via forgot password flow
- Comprehensive audit logging for all account operations

This is critical for multi-tenant security, proper access control, and accommodating users with varying levels of digital literacy.

## Acceptance Criteria

Given a tenant Admin user accesses the "Invite User" functionality,

when the Admin fills out the invitation form with user details (Employee ID, First Name, Last Name, Email, Mobile Number, Role, Department, POI if applicable, and Functional Role Type),

then the system shall:

- [ ] Allow admin to invite users via Email (all roles) or via Mobile Number (**Drivers only**)
- [ ] Enforce unique **email or mobile number** per tenant (based on the chosen invitation channel)
- [ ] Require the Admin to select a **Department** first (from predefined departments), then select a **Role** under that Department
- [ ] Role dropdown SHALL be filtered based on selected Department; the system SHALL reject role selections that do not belong to the selected Department
- [ ] Provide an invitation form field **OTP type** with options: `None`, `Email`, `SMS`
- [ ] Default **OTP type** is `None` (no OTP required for activation for non-Driver users)
- [ ] If **OTP type = Email**, system sends a 6-digit OTP via email and requires OTP verification before credential setup
- [ ] If **OTP type = SMS**, system sends a 6-digit OTP via SMS and requires OTP verification before credential setup
- [ ] Allow role assignment during invitation with the following roles:
  - Distribution Officer
  - Distribution Manager
  - Procurement Officer
  - Commercial Officer
  - Depot Officer
  - Feed Mill Officer
  - Transport Planner
  - Transport Distribution Officer
  - Command Center Officer
  - Gate man
  - Scaling Personnel
  - Loading Personnel
  - Unloading Personnel
  - QC Inspector - Physical
  - QA Lab Technician
  - Driver Supervisor
  - Driver
  - Helper
- [ ] **Restrict Super Admin role assignment**: The `Super Admin` role SHALL NOT be selectable during user invitation. The system SHALL reject any invitation attempt where `role_ids` contains a Super Admin role, returning HTTP 403 with error code `ROLE-403-SUPER-ADMIN-RESTRICTED`
- [ ] Allow Functional Role Type assignment during invitation:
  - Requester
  - Approver
  - Executor
- [ ] Bulk user invitation via CSV upload for each role
- [ ] Validate role permissions against tenant plan limits
- [ ] Allow invitation resend (with cooldown period)
- [ ] Expires invitations after 7 days
- [ ] Allow the Admin to resend the invitation if it has expired
- [ ] Allow custom invitation message
- [ ] Support invitation templates
- [ ] Allow invitation scheduling
- [ ] **Send invitation email immediately** upon form submission — the invitation email SHALL be dispatched in the same request/transaction cycle as the invitation record creation (synchronous dispatch or immediate async task). The `invitation_status` SHALL be set to `sent` as soon as the email is queued/dispatched
- [ ] Track the invitation status as: **Sent → Pending → Activated/Expired/Cancelled**

#### Department → Role mapping (Phase 1)

| Department | Allowed Roles (dropdown options) |
|---|---|
| Depot / Feed Mill / Commercial | Depot Officer, Feed Mill Officer, Commercial Officer |
| Procurement | Procurement Officer |
| Distribution | Distribution Officer, Distribution Manager |
| Transport | Transport Planner, Transport Distribution Officer, Driver Supervisor, Driver, Helper |
| QA / QC | QC Inspector - Physical, QA Lab Technician |
| Operations | Command Center Officer, Gate man, Scaling Personnel, Loading Personnel, Unloading Personnel |

#### Driver users (SMS-based invitation + low literacy quick login)

- [ ] System SHALL send an SMS to the Driver containing:
  - A Mobile interface link
  - A 6-digit One-Time Password (OTP) valid for 10 minutes (**logged; not required for activation in Phase 1**)
  - A system-generated password
- [ ] Upon opening the mobile link:
  - Registered mobile number is auto-populated (read-only)
  - Driver enters the system-generated password received via SMS
  - On success, system authenticates the Driver and grants access
  - On invalid credentials, system displays an appropriate error message and denies access
- [ ] Driver activation/login does **not** require OTP verification in Phase 1

#### Other role users (Email-based invitation + OTP activation + credential setup)

- [ ] System SHALL send a user invitation email containing:
  - An invitation link
- [ ] If **OTP type = Email**, the invitation email includes a 6-digit OTP (valid 10 minutes)
- [ ] If **OTP type = SMS**, the system sends a 6-digit OTP via SMS (valid 10 minutes)
- [ ] If **OTP type = None**, no OTP is sent and the user proceeds directly to credential setup after opening the link
- [ ] Upon accessing the invitation link:
  - Registered email is automatically populated (read-only)
  - If OTP is required by the selected OTP type, user enters the received OTP
  - On successful OTP verification (or if OTP type = None), system prompts to set credentials (New Password + Confirm Password)
  - System ensures password match + password policy compliance
  - User accepts Terms & Conditions
  - System authenticates and logs the user into the platform
- [ ] Post activation, the user can access the system using registered email + configured password

- [ ] System logs audit events for invitation, activation, OTP operations, and driver quick login attempts

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Single user invitation
  Given a Tenant Admin accesses the "Invite User" form
  When the Admin fills out: Employee ID, First Name, Last Name, Email, Mobile, Role "Depot Officer", Department "Depot", OTP type "Email", Functional Role Type "Requester"
  Then the system validates email and mobile uniqueness within the tenant
  And immediately dispatches an invitation email with an activation link
  And sets invitation_status to "sent" upon email dispatch
  And the invitation expires after 7 days

Scenario: AC-1.2 - Bulk invitation via CSV
  Given a Tenant Admin uploads a CSV with 50 user records
  And the CSV contains columns: Employee ID, Email, Mobile, First Name, Last Name, Role, Department, POI, Functional Role Type, OTP type
  When the system processes the CSV
  Then valid rows create invitations and send emails
  And invalid rows are reported with specific error reasons
  And a summary shows success_count and failure_count

Scenario: AC-1.3 - User activation with OTP verification
  Given a user received an invitation email with an activation link
  When the user clicks the activation link within 7 days
  And the OTP type is "Email"
  And the user enters the email OTP
  And sets a password meeting complexity requirements
  And accepts Terms & Conditions
  Then the user account is created and activated
  And the invitation status changes to "Activated"
  And a welcome email is sent

Scenario: AC-1.3a - User activation with OTP type None
  Given a user received an invitation email with an activation link
  When the user clicks the activation link within 7 days
  And the OTP type is "None"
  Then the system does not request OTP verification
  And prompts the user to set a password and accept Terms & Conditions
  When the user submits valid credentials
  Then the user account is created and activated

Scenario: AC-1.3d - User activation with SMS OTP
  Given a user received an invitation email with an activation link
  And the user has a registered mobile number
  When the user clicks the activation link within 7 days
  And the OTP type is "SMS"
  Then the system sends a 6-digit OTP via SMS
  When the user enters the SMS OTP successfully
  Then the system prompts the user to set a password and accept Terms & Conditions

Scenario: AC-1.3b - Driver SMS quick login (no OTP required)
  Given a Driver user invitation was created with mobile "+8801712345678"
  When the system sends an SMS containing a mobile link and a system-generated password
  And the Driver opens the mobile link
  Then the mobile number is auto-populated and read-only
  When the Driver enters the system-generated password
  Then the system authenticates the Driver and grants access
  And logs the login attempt as success

Scenario: AC-1.3c - Driver SMS quick login invalid password
  Given a Driver opens the mobile link
  When the Driver enters an invalid system-generated password
  Then the system denies access with an appropriate error message
  And logs the login attempt as failure with reason "InvalidPassword"

Scenario: AC-1.4 - Plan limit enforcement
  Given a tenant is on the "Basic" plan with a limit of 5 users
  And the tenant already has 5 active users
  When the Admin attempts to invite a 6th user
  Then the system blocks the invitation
  And displays "User limit reached. Upgrade subscription to add more users."

Scenario: AC-1.5 - Invitation resend with cooldown
  Given an invitation was sent to "user@company.com" 1 minute ago
  When the Admin attempts to resend the invitation
  Then the system blocks the resend with "Please wait 2 minutes before resending"
  When the Admin waits and resends after 2 minutes
  Then a new invitation email is sent
  And the original activation link remains valid

Scenario: AC-1.6 - Expired invitation activation attempt
  Given an invitation was sent 8 days ago (past 7-day expiry)
  When the user clicks the activation link
  Then the system displays "Invitation expired. Contact your administrator."
  And the invitation status is "Expired"
  And the Admin can resend a new invitation

Scenario: AC-1.7 - Role assignment during invitation
  Given a Tenant Admin is inviting a user
  When the Admin selects Department "Transport"
  And selects role "Transport Planner"
  And selects Functional Role Type "Executor"
  Then the system validates the role exists and is assignable
  And validates role permissions against the tenant's subscription plan
  And assigns the role upon successful activation

Scenario: AC-1.7b - Role dropdown filtered by department
  Given a Tenant Admin is inviting a user
  When the Admin selects Department "QA / QC"
  Then the role dropdown shows only: "QC Inspector - Physical", "QA Lab Technician"
  And does not show: "Transport Planner", "Depot Officer"

Scenario: AC-1.7c - Reject role not in department
  Given a Tenant Admin is inviting a user
  And the Admin selected Department "Procurement"
  When the Admin attempts to select role "Distribution Officer"
  Then the system rejects the selection with "Role does not belong to selected department"

Scenario: AC-1.7d - Reject Super Admin role assignment
  Given a Tenant Admin is inviting a user
  When the Admin attempts to assign the "Super Admin" role
  Then the system rejects the request with HTTP 403
  And returns error code "ROLE-403-SUPER-ADMIN-RESTRICTED"
  And displays "Super Admin role cannot be assigned through invitation. Super Admins are provisioned manually."
  And the "Super Admin" role SHALL NOT appear in the role dropdown

Scenario: AC-1.8 - Unique mobile number enforcement
  Given a user with mobile "+8801712345678" already exists in the tenant
  When the Admin attempts to invite another user with the same mobile number
  Then the system rejects with "Mobile number already registered in this organization"

Scenario: AC-1.9 - Custom invitation message
  Given a Tenant Admin fills out the invitation form
  When the Admin adds a custom message "Welcome to the Distribution team!"
  Then the invitation email includes the custom message
  And the standard invitation template elements are preserved

Scenario: AC-1.10 - Invitation scheduling
  Given a Tenant Admin fills out the invitation form
  When the Admin schedules the invitation for a future date/time
  Then the system queues the invitation
  And sends it at the scheduled time
  And the 7-day expiry begins from the scheduled send time
```

### AC-2: Admin-Assisted Password Reset

Given a user is unable to self-reset their password, when an Admin performs an assisted password reset, then the system shall:

- [ ] Allow Admin to verify the user's identity offline before initiating the reset
- [ ] Enable Admin to communicate an OTP to the user through an offline channel
- [ ] Generate a 6-digit OTP with 10-minute validity for admin-assisted reset
- [ ] Allow the user to enter the OTP provided by Admin to proceed with the reset
- [ ] Enforce password complexity rules during the new password setup
- [ ] Log all admin-assisted resets with full audit details (Admin ID, timestamp, user affected, IP address)
- [ ] Require Admin to provide justification remarks before completing the assisted reset
- [ ] Send notification to user about the admin-assisted reset

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Admin initiates assisted password reset
  Given an Admin with "User.ResetPassword" permission
  And a registered user "john.doe" who cannot self-reset
  When the Admin navigates to the user's profile and clicks "Reset Password"
  Then the system displays the admin-assisted reset form
  And requires a justification remark (minimum 10 characters)
  And requires verification method selection (Phone, Email, In-Person)

Scenario: AC-2.2 - Admin generates and communicates OTP
  Given an Admin has completed identity verification for user "john.doe"
  And provided justification "User forgot password, verified via phone call"
  When the Admin clicks "Generate OTP"
  Then the system generates a 6-digit OTP valid for 10 minutes
  And displays the OTP to the Admin (not sent to user directly)
  And the Admin communicates the OTP offline to the user

Scenario: AC-2.3 - User completes reset with admin-provided OTP
  Given a user "john.doe" has received the OTP from Admin
  When the user enters the OTP and sets a new password
  Then the system validates the OTP (within 10-minute window)
  And enforces password complexity rules
  And updates the password in the database (hashed)
  And terminates all active sessions for the user
  And sends a confirmation email

Scenario: AC-2.4 - Audit logging for admin-assisted reset
  Given an Admin has triggered a password reset for user "john.doe"
  When the reset is completed
  Then the system logs: Admin ID, User ID, timestamp, IP address, justification remarks, verification method
  And the audit entry is immutable and accessible to Tenant Admin

Scenario: AC-2.5 - Admin-assisted reset with expired OTP
  Given an Admin generated an OTP for user "john.doe" 11 minutes ago
  When the user attempts to enter the expired OTP
  Then the system rejects the OTP with message "OTP expired. Contact your administrator for a new code."
  And does NOT reset the password
```

### AC-3: Self-Service Password Reset

Given a registered user has forgotten their password, when the user initiates a self-service reset from the login screen, then the system shall:

- [ ] Provide a "Forgot Password" option on the login page
- [ ] Accept email or mobile number as identifier
- [ ] Generate a 6-digit OTP with 10-minute validity and deliver it to the user's registered mobile number
- [ ] Generate a reset link that is valid for 15 minutes and send via email
- [ ] Prompt the user on mobile to complete the reset flow
- [ ] Enforce password complexity rules during the new password setup:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- [ ] Prevent reuse of last 3 passwords
- [ ] Log the password reset event with full details (user ID, timestamp, IP address)
- [ ] Send a confirmation email to the user upon successful password reset
- [ ] Terminate all active sessions upon successful password reset
- [ ] Enforce rate limiting (max 3 reset requests per hour per user)

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - User initiates forgot password
  Given a registered user on the login page
  When the user clicks "Forgot Password"
  And enters their registered email "user@company.com"
  Then the system sends a password reset link to the email (valid 15 minutes)
  And sends a 6-digit OTP to the registered mobile number (valid 10 minutes)

Scenario: AC-3.2 - User completes self-service reset via email link
  Given a user clicked the password reset link from their email
  And the link is within the 15-minute validity window
  When the user enters a new password meeting complexity requirements
  And confirms the password
  Then the system updates the password (hashed)
  And terminates all active sessions
  And sends a confirmation email
  And redirects to the login page

Scenario: AC-3.3 - User completes self-service reset via mobile OTP
  Given a user received a 6-digit OTP on their mobile
  When the user enters the OTP on the reset page
  And sets a new password meeting complexity requirements
  Then the system validates the OTP
  And updates the password
  And terminates all active sessions

Scenario: AC-3.4 - Expired reset link rejected
  Given a user received a password reset link 16 minutes ago
  When the user clicks the expired link
  Then the system displays "Reset link expired. Please request a new one."
  And does NOT allow password change

Scenario: AC-3.5 - Rate limiting enforcement
  Given a user has requested 3 password resets within the last hour
  When the user attempts a 4th reset request
  Then the system returns "Too many reset requests. Please try again later."
  And blocks the request

Scenario: AC-3.6 - Password history enforcement
  Given a user is resetting their password
  And their last 3 passwords were "Pass1!", "Pass2!", "Pass3!"
  When the user attempts to set password to "Pass1!"
  Then the system rejects with "Cannot reuse your last 3 passwords"
```

## Functional Requirements

### FR-065-001: User Invitation Creation
- [Critical] System SHALL provide form to invite users with:
  - Employee ID
  - Email address (mandatory)
  - Mobile number (mandatory)
  - First Name (mandatory)
  - Last Name (mandatory)
  - Role assignment (from predefined list of 18 operational roles)
  - Department assignment (required; dropdown from predefined departments)
  - POI (if applicable)
  - Functional Role Type Assignment (Requester / Approver / Executor)
  - OTP type (None / Email / SMS) — default None
- [Critical] System SHALL validate email uniqueness within tenant
- [Critical] System SHALL validate mobile number uniqueness within tenant
- [Critical] System SHALL validate role exists and is assignable
- [Critical] System SHALL validate that selected role belongs to selected department
- [Critical] System SHALL **reject** any invitation where the selected role is `Super Admin` — Super Admin accounts are provisioned manually only, never through invitation
- [Critical] System SHALL check subscription plan user limit before invitation
- [High] System SHALL support bulk CSV upload with validation
- [High] System SHALL allow custom invitation message

### FR-065-002: Invitation Email
- [Critical] System SHALL **immediately dispatch** the invitation email at the time the user record is created — email send is triggered synchronously (or via an immediately-queued async task) within the same invitation creation flow
- [Critical] System SHALL set `invitation_status` to `sent` upon successful email dispatch (or `pending` if queueing fails, for retry)
- [Critical] System SHALL send invitation email with:
  - Activation link (unique token)
  - Organization name
  - Inviter name
  - Expiration date (7 days)
  - Getting started guide link
- [Critical] System SHALL generate unique activation token per invitation
- [Critical] System SHALL expire activation link after 7 days
- [High] System SHALL support email templates
- [High] System SHALL allow invitation resend (2-minute cooldown)

### FR-065-003: User Activation
- [Critical] For non-Driver users, OTP verification behavior SHALL be driven by **OTP type** selected during invitation:
  - OTP type = None → no OTP required for activation
  - OTP type = Email → email OTP required
  - OTP type = SMS → SMS OTP required
- [Critical] Driver users SHALL authenticate using the system-generated password received via SMS (no OTP required in Phase 1)
- [Critical] System SHALL require password setup during activation
- [Critical] System SHALL enforce password complexity rules
- [Critical] System SHALL require Terms & Conditions acceptance
- [Critical] System SHALL create user account upon successful activation
- [Critical] System SHALL assign role(s) as specified in invitation
- [Critical] System SHALL send welcome email after activation
- [High] System SHALL allow activation link reuse within validity period
- [High] System SHALL support activation via mobile app

### FR-065-004: Bulk Invitation
- [Critical] System SHALL support CSV upload with columns:
  - Employee ID, Email, Mobile, First Name, Last Name, Role, Department, POI, Functional Role Type
- [Critical] System SHALL validate CSV format and data
- [Critical] System SHALL process invitations in batch
- [Critical] System SHALL report success/failure for each row
- [High] System SHALL allow partial processing (continue on errors)
- [High] System SHALL provide CSV template download

### FR-065-005: Invitation Management
- [Critical] System SHALL track invitation status: Pending, Activated, Expired, Cancelled
- [Critical] System SHALL allow invitation cancellation (if not activated)
- [Critical] System SHALL allow invitation resend
- [High] System SHALL provide invitation dashboard with filters
- [High] System SHALL show invitation history per user

### FR-065-006: Admin-Assisted Password Reset
- [Critical] System SHALL allow Tenant Admin and Department Admin to trigger assisted password reset
- [Critical] System SHALL require offline identity verification by admin before reset
- [Critical] System SHALL generate 6-digit OTP valid for 10 minutes
- [Critical] System SHALL display OTP to admin (admin communicates offline to user)
- [Critical] System SHALL require admin to provide justification remarks (mandatory, minimum 10 characters)
- [Critical] System SHALL require admin to select verification method (Phone, Email, In-Person)
- [Critical] System SHALL allow user to enter admin-provided OTP to reset password
- [Critical] System SHALL log all assisted resets with: Admin ID, User ID, timestamp, IP address, justification, verification method
- [High] System SHALL send notification to user about admin-assisted reset
- [High] System SHALL require admin to have `UserMgmt.User.ResetPassword` permission

### FR-065-007: Self-Service Password Reset
- [Critical] System SHALL provide "Forgot Password" link on login page
- [Critical] System SHALL accept email or mobile number as identifier
- [Critical] System SHALL send password reset link via email (valid 15 minutes)
- [Critical] System SHALL send 6-digit OTP via SMS to registered mobile (valid 10 minutes)
- [Critical] System SHALL require OTP verification before allowing password change
- [Critical] System SHALL enforce password complexity rules:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- [Critical] System SHALL require password confirmation
- [Critical] System SHALL prevent reuse of last 3 passwords
- [High] System SHALL provide password strength meter
- [High] System SHALL support mobile app password reset

### FR-065-008: Password Reset Security & Logging
- [Critical] System SHALL enforce rate limiting (max 3 reset requests per hour per user)
- [Critical] System SHALL validate reset link/OTP uniqueness and expiration
- [Critical] System SHALL update password in database (hashed with bcrypt)
- [Critical] System SHALL terminate all active user sessions upon password reset
- [Critical] System SHALL require user to login with new password after reset
- [Critical] System SHALL send confirmation email after successful reset
- [Critical] System SHALL log all password reset attempts with: User ID, method (admin-assisted/self-service), timestamp, IP address, device ID, status (success/failure), failure reason
- [High] System SHALL detect suspicious reset patterns
- [High] System SHALL provide reset history per user

## Business Rules

### BR-065-001: Invitation Limits
- Invitation count must not exceed subscription plan user limit
- Maximum 100 invitations per batch (bulk upload)
- Invitation resend cooldown: 2 minutes
- Invitation expiration: 7 days from creation

### BR-065-001a: Invitation Status Lifecycle
- `sent` — set immediately when the invitation email is dispatched upon user creation
- `pending` — state while the user has received the email but has not yet clicked the activation link and completed activation
- `activated` — set when the user successfully completes activation (OTP verification + password set + T&C accepted)
- `expired` — set automatically when `expires_at` passes without activation (via scheduled cleanup job)
- `cancelled` — set when admin explicitly cancels a pending invitation before activation
- Status transitions: `sent` → `pending` → `activated` | `expired` | `cancelled`

### BR-065-002: Email and Mobile Validation
- Email must be unique within tenant
- Mobile number must be unique within tenant
- Email format must be valid
- Mobile number format must be valid
- Email domain validation (if domain restriction enabled)
- Cannot invite user with existing active account

### BR-065-003: Role Assignment
- Role must exist and be active
- Role must be assignable (not system-only)
- **Super Admin role is strictly forbidden in invitation flow** — `Super Admin` cannot be selected as a role during user invitation; it is provisioned exclusively via manual database seed or CLI. Any attempt returns HTTP 403 (`ROLE-403-SUPER-ADMIN-RESTRICTED`)
- User can have multiple roles
- Role permissions validated against tenant plan

### BR-065-004: Activation Requirements
- OTP verification requirement depends on **OTP type** selected during invitation:
  - OTP type = None → no OTP required
  - OTP type = Email → email OTP required
  - OTP type = SMS → SMS OTP required
- Password must meet complexity requirements
- Terms & Conditions must be accepted
- Activation link must be valid (not expired)
- User account created only after successful activation

### BR-065-005: Admin-Assisted Reset Rules
- Only Tenant Admin and Department Admin (with `UserMgmt.User.ResetPassword` permission) can trigger
- Admin must verify user identity offline before reset
- OTP valid for 10 minutes from generation
- Admin must provide justification remarks (mandatory, minimum 10 characters)
- Admin must select verification method: Phone, Email, or In-Person
- All assisted resets logged for audit with full details

### BR-065-006: Self-Service Reset Rules
- Reset link valid for 15 minutes
- OTP valid for 10 minutes
- Maximum 3 reset requests per hour per user
- Cannot reuse last 3 passwords
- All active sessions terminated upon successful reset
- Confirmation email sent after successful reset

### BR-065-007: Password Complexity
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Password hashed using bcrypt with tenant-specific salt
- Password history: Last 3 passwords cannot be reused
- Applies to both activation password setup and password reset

## Data Model

### User Invitation Entity
```yaml
UserInvitation:
  invitation_id: string (unique)
  tenant_id: string (FK)
  email: string (unique per tenant)
  mobile: string (unique per tenant)
  first_name: string
  last_name: string
  role_ids: array[string] (FK)  # Super Admin role is strictly forbidden
  department_id: string (FK, optional)
  employment_type: string
  poi_id: string (FK, optional)
  functional_role_type: string
  otp_type: string (none|email|sms)
  invitation_token: string (unique)
  invitation_status: string (sent|pending|activated|expired|cancelled)
    # sent       — invitation email dispatched immediately upon form submission
    # pending    — user has received email but has not yet activated
    # activated  — user completed activation successfully
    # expired    — invitation link passed 7-day window without activation
    # cancelled  — admin manually cancelled before activation
  invited_by: string (FK - user_id)
  invited_at: datetime
  expires_at: datetime
  activated_at: datetime (optional)
  activation_ip: string (optional)
  custom_message: string (optional)
```

### User Activation Entity
```yaml
UserActivation:
  activation_id: string (unique)
  invitation_id: string (FK)
  otp_type: string (none|email|sms)
  otp_code: string (6-digit, hashed; optional when otp_type=none)
  otp_verified: boolean
  otp_expires_at: datetime
  terms_accepted: boolean
  terms_accepted_at: datetime (optional)
  activation_attempts: integer
  activated_at: datetime (optional)
```

### Password Reset Token Entity
```yaml
PasswordResetToken:
  token_id: string (unique)
  user_id: string (FK)
  tenant_id: string (FK)
  token: string (unique, 64-char hex, hashed)
  otp_code: string (6-digit, hashed)
  method: string (self-service, admin-assisted)
  delivery_channel: string (email, sms, both)
  expires_at: datetime
  otp_expires_at: datetime
  status: string (pending, used, expired)
  attempts: integer (max 3)
  created_at: datetime
  used_at: datetime (optional)
  ip_address: string
```

### Admin-Assisted Reset Entity
```yaml
AdminAssistedReset:
  reset_id: string (unique)
  admin_id: string (FK)
  user_id: string (FK)
  tenant_id: string (FK)
  otp_code: string (6-digit, hashed)
  otp_expires_at: datetime
  verification_method: string (phone, email, in-person)
  justification: string (min 10 characters)
  status: string (initiated, otp_generated, completed, expired, failed)
  ip_address: string
  created_at: datetime
  completed_at: datetime (optional)
```

### Password Reset Audit Log Entity
```yaml
PasswordResetAuditLog:
  log_id: string (unique)
  user_id: string (FK)
  tenant_id: string (FK)
  method: string (admin-assisted, self-service)
  admin_id: string (FK, optional - for admin-assisted)
  justification: string (optional - for admin-assisted)
  verification_method: string (optional - for admin-assisted)
  status: string (success, failure)
  failure_reason: string (optional)
  ip_address: string
  device_id: string
  timestamp: datetime
```

## UI/UX Requirements

### Invitation Form
- Email input with validation
- Mobile number input with validation
- Employee ID input with validation
- First Name input (mandatory)
- Last Name input (mandatory)
- Department selection (dropdown from predefined departments)
- Role selection (dropdown filtered by selected Department; **Super Admin is not listed**)
- POI selection (dropdown, optional)
- Functional Role Type input (Requester / Approver / Executor)
- OTP type selector (None / Email / SMS) — default None
- Custom message textarea (optional)
- "Send Invitation" button — triggers user record creation **and** immediate email dispatch
- "Bulk Upload" option

### Bulk Upload Interface
- CSV file upload area
- Template download link (with columns: Employee ID, Email, Mobile, First Name, Last Name, Role, Department, POI, Functional Role Type)
- Validation results display
- Success/failure summary
- "Process Invitations" button

### Invitation Dashboard
- List of all invitations with status
- Filters: Status, Role, Department, Date Range
- Actions: Resend, Cancel, View Details
- Search functionality

### Activation Page
- Display organization name
- OTP input field (shown only when OTP type != None)
- Password setup form
- Password confirmation
- Terms & Conditions checkbox with link to T&C document
- "Activate Account" button
- Resend OTP links

### Driver Mobile Login Page (SMS-based)
- Mobile number auto-populated (read-only)
- System-generated password input
- "Login" button
- Error message on invalid password
- Link to "Contact Admin" for assistance

### Forgot Password Page
- Email or mobile number input
- "Send Reset Link" button
- Link to "Contact Admin for assisted reset"
- Success message: "If an account exists, a reset link has been sent"

### Password Reset Page (via link)
- OTP input field (6-digit)
- New password input with strength meter
- Confirm password input
- Password complexity requirements display
- "Reset Password" button
- "Resend OTP" link

### Admin-Assisted Reset Interface
```
┌─────────────────────────────────────────────┐
│ Reset Password: john.doe                     │
├─────────────────────────────────────────────┤
│ Verification Method: [Phone ▼]               │
│                                             │
│ Justification:                               │
│ [User forgot password, verified via phone   ]│
│ [call to registered number                  ]│
│                                             │
│ [Generate OTP]                               │
│                                             │
│ Generated OTP: 483921 (valid 10 minutes)    │
│ ⚠ Communicate this OTP to the user offline   │
│                                             │
│ [Complete Reset]  [Cancel]                   │
└─────────────────────────────────────────────┘
```

## API Endpoints

### POST /api/v1/tenants/{tenant_id}/users/invitations
- Create user invitation and **immediately dispatch invitation email**
- Request body: employee_id, email, mobile, first_name, last_name, role_ids (Super Admin role forbidden), department_id, poi_id, functional_role_type, otp_type, custom_message
- Response: invitation_id, invitation_token, invitation_status ("sent")
- Error: HTTP 403 `ROLE-403-SUPER-ADMIN-RESTRICTED` if Super Admin role is in role_ids

### POST /api/v1/tenants/{tenant_id}/users/invitations/bulk
- Bulk create user invitations via CSV
- Request: CSV file upload
- Response: processing_results (success_count, failure_count, errors)

### GET /api/v1/tenants/{tenant_id}/users/invitations
- List all invitations
- Query params: status, role_id, department_id, date_from, date_to
- Response: array of invitations

### POST /api/v1/users/invitations/{invitation_token}/resend
- Resend invitation email
- Response: success message

### DELETE /api/v1/users/invitations/{invitation_id}
- Cancel invitation
- Response: success message

### POST /api/v1/users/invitations/{invitation_token}/activate
- Activate user account
- Request body: otp_code? (required when otp_type != none), password, password_confirm, terms_accepted
- Response: user_id, access_token

### GET /m/driver/login/{invitation_token}
- Driver SMS-based mobile login page (auto-populates mobile)
- Response: HTML/mobile UI

### POST /api/v1/auth/driver/login
- Driver SMS-based login (no OTP required in Phase 1)
- Request body: invitation_token, mobile (read-only client-side), system_generated_password
- Response: user_id, access_token

### POST /api/v1/users/invitations/{invitation_token}/otp/resend
- Resend OTP (email or SMS)
- Request body: otp_type (email|sms) (must match invitation otp_type; rejected if otp_type=none)
- Response: success message

### POST /api/v1/auth/password/forgot
- Initiate self-service password reset
- Request body: identifier (email or mobile)
- Response: { message: "If an account exists, a reset link has been sent" }
- Note: Always returns success to prevent email enumeration

### POST /api/v1/auth/password/reset
- Complete self-service password reset
- Request body: token, otp, new_password, confirm_password
- Response: { success: true, message: "Password reset successful" }

### POST /api/v1/admin/users/{user_id}/password-reset
- Admin initiates assisted password reset
- Request body: verification_method, justification
- Response: { reset_id, otp_code, otp_expires_at }
- Requires permission: `UserMgmt.User.ResetPassword`

### POST /api/v1/auth/password/admin-reset
- User completes admin-assisted password reset
- Request body: reset_id, otp, new_password, confirm_password
- Response: { success: true, message: "Password reset successful" }

## Non-Functional Requirements

- **Performance**: Invitation email sent within 5 seconds
- **Security**: Invitation tokens must be cryptographically secure
- **Scalability**: Support 1000+ concurrent invitations
- **Availability**: Invitation service must be 99.9% available
- **Rate Limiting**: Max 10 invitations per minute per admin

## Testing Scenarios

### TC-065-001: Single User Invitation
1. Admin invites user with email and role
2. Verify invitation email sent
3. User clicks activation link
4. User verifies OTPs and sets password
5. Verify user account created and activated

### TC-065-002: Bulk Invitation
1. Admin uploads CSV with 50 users
2. Verify CSV validation
3. Verify invitations created
4. Verify invitation emails sent
5. Verify success/failure report

### TC-065-003: Invitation Expiration
1. Create invitation
2. Wait 7 days (or simulate)
3. Attempt activation
4. Verify activation rejected (expired)

### TC-065-004: Invitation Resend
1. Create invitation
2. Resend invitation (after cooldown)
3. Verify new email sent
4. Verify old link still valid

### TC-065-005: Plan Limit Enforcement
1. Tenant at user limit (e.g., 5/5)
2. Attempt to invite 6th user
3. Verify invitation blocked
4. Verify appropriate error message

### TC-065-006: Admin-Assisted Password Reset
1. Admin selects user and clicks "Reset Password"
2. Admin selects verification method and enters justification
3. Admin generates OTP and communicates offline
4. User enters OTP and sets new password
5. Verify password updated and sessions terminated

### TC-065-007: Self-Service Password Reset
1. User clicks "Forgot Password" on login page
2. User enters registered email
3. User receives reset link and OTP
4. User clicks link, enters OTP, sets new password
5. Verify password updated, sessions terminated, confirmation sent

---

## Unit Tests

### UT-INV-001: Invitation Creation & Validation
```python
def test_create_invitation_success():
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'employee_id': 'EMP-0001',
        'email': 'newuser@company.com',
        'mobile': '+8801712345678',
        'first_name': 'John',
        'last_name': 'Doe',
        'role_ids': [get_role_id('Depot Officer')],
        'department_id': 'depot-1',
        'functional_role_type': 'Requester'
    })
    
    assert response.status_code == 201
    assert 'invitation_id' in response.json()
    assert 'invitation_token' in response.json()
    assert response.json()['invitation_status'] == 'sent'

def test_create_invitation_sends_email_immediately():
    """Invitation email must be dispatched synchronously upon creation."""
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'employee_id': 'EMP-0002',
        'email': 'newuser2@company.com',
        'mobile': '+8801712345679',
        'first_name': 'Jane',
        'last_name': 'Smith',
        'role_ids': [get_role_id('Depot Officer')],
        'department_id': 'depot-1',
        'functional_role_type': 'Requester'
    })
    
    assert response.status_code == 201
    # Email must be sent within the same request lifecycle
    assert_email_sent_to('newuser2@company.com', subject_contains='Invitation')
    invitation = UserInvitation.objects.get(id=response.json()['invitation_id'])
    assert invitation.invitation_status == 'sent'

def test_create_invitation_super_admin_role_rejected():
    """Super Admin role must never be assignable via invitation."""
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'employee_id': 'EMP-0003',
        'email': 'superadmin@company.com',
        'mobile': '+8801700000010',
        'first_name': 'Super',
        'last_name': 'Admin',
        'role_ids': [get_role_id('Super Admin')],
        'department_id': 'depot-1',
        'functional_role_type': 'Requester'
    })
    
    assert response.status_code == 403
    assert response.json()['code'] == 'ROLE-403-SUPER-ADMIN-RESTRICTED'
    assert 'Super Admin role cannot be assigned' in response.json()['message']

def test_create_invitation_duplicate_email():
    create_invitation(email='existing@company.com', tenant='tenant-1')
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'email': 'existing@company.com',
        'mobile': '+8801799999999',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role_ids': [get_role_id('Depot Officer')]
    })
    
    assert response.status_code == 409
    assert response.json()['code'] == 'INV-409-DUPLICATE-EMAIL'
    assert 'already' in response.json()['message']

def test_create_invitation_duplicate_mobile():
    create_invitation(mobile='+8801712345678', tenant='tenant-1')
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'email': 'new@company.com',
        'mobile': '+8801712345678',
        'first_name': 'Jane',
        'last_name': 'Doe',
        'role_ids': [get_role_id('Depot Officer')]
    })
    
    assert response.status_code == 409
    assert response.json()['code'] == 'INV-409-DUPLICATE-MOBILE'

def test_create_invitation_invalid_role():
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'email': 'user@company.com',
        'mobile': '+8801700000000',
        'first_name': 'Test',
        'last_name': 'User',
        'role_ids': ['non-existent-role']
    })
    
    assert response.status_code == 404
    assert response.json()['code'] == 'ROLE-404'

def test_create_invitation_plan_limit_exceeded():
    tenant = create_tenant(plan='Basic', max_users=5)
    create_users(count=5, tenant=tenant.id)
    
    response = client.post(f'/api/v1/tenants/{tenant.id}/users/invitations', {
        'email': 'user6@company.com',
        'mobile': '+8801700000006',
        'first_name': 'User',
        'last_name': 'Six',
        'role_ids': [get_role_id('Depot Officer')]
    })
    
    assert response.status_code == 403
    assert response.json()['code'] == 'PLAN-403-LIMIT'
    assert 'User limit reached' in response.json()['message']

def test_create_invitation_for_active_user():
    create_active_user(email='active@company.com', tenant='tenant-1')
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'email': 'active@company.com',
        'mobile': '+8801700000000',
        'first_name': 'Active',
        'last_name': 'User',
        'role_ids': [get_role_id('Depot Officer')]
    })
    
    assert response.status_code == 409
    assert 'already active' in response.json()['message']

def test_invitation_token_uniqueness():
    inv1 = create_invitation(email='user1@co.com')
    inv2 = create_invitation(email='user2@co.com')
    assert inv1.invitation_token != inv2.invitation_token
    assert len(inv1.invitation_token) == 64

def test_invitation_expiry_set_to_7_days():
    inv = create_invitation(email='user@co.com')
    expected_expiry = inv.invited_at + timedelta(days=7)
    assert inv.expires_at == expected_expiry
```

### UT-INV-002: Bulk CSV Upload Validation
```python
def test_bulk_upload_valid_csv():
    csv_content = "Email,Mobile,First Name,Last Name,Role,Department\n"
    csv_content += "user1@co.com,+8801700000001,User,One,Depot Officer,Depot\n"
    csv_content += "user2@co.com,+8801700000002,User,Two,Transport Planner,Transport\n"
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations/bulk', 
                          files={'csv': csv_content})
    
    assert response.status_code == 200
    assert response.json()['success_count'] == 2
    assert response.json()['failure_count'] == 0

def test_bulk_upload_partial_failure():
    csv_content = "Email,Mobile,First Name,Last Name,Role,Department\n"
    csv_content += "user1@co.com,+8801700000001,User,One,Depot Officer,Depot\n"
    csv_content += "invalid-email,bad-phone,User,Two,InvalidRole,Bad\n"
    csv_content += "user3@co.com,+8801700000003,User,Three,QA Lab Technician,QC\n"
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations/bulk',
                          files={'csv': csv_content})
    
    assert response.status_code == 200
    assert response.json()['success_count'] == 2
    assert response.json()['failure_count'] == 1
    assert len(response.json()['errors']) == 1
    assert response.json()['errors'][0]['row'] == 2

def test_bulk_upload_exceeds_batch_limit():
    csv_content = generate_csv_rows(count=101)
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations/bulk',
                          files={'csv': csv_content})
    
    assert response.status_code == 400
    assert 'Maximum 100 invitations per batch' in response.json()['message']

def test_bulk_upload_invalid_format():
    response = client.post('/api/v1/tenants/tenant-1/users/invitations/bulk',
                          files={'csv': 'not,a,valid,csv,format'})
    
    assert response.status_code == 400
    assert response.json()['code'] == 'CSV-400-FORMAT'
```

### UT-INV-003: Activation Workflow
```python
def test_activation_success():
    invitation = create_invitation(email='user@co.com', mobile='+8801700000001')
    activation = create_activation(invitation_id=invitation.id)
    
    response = client.post(f'/api/v1/users/invitations/{invitation.token}/activate', {
        'otp_code': activation.otp_code,
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'terms_accepted': True
    })
    
    assert response.status_code == 200
    assert 'user_id' in response.json()
    
    invitation.refresh_from_db()
    assert invitation.status == 'activated'

def test_activation_expired_link():
    invitation = create_invitation(email='user@co.com', 
                                   expires_at=datetime.now() - timedelta(days=1))
    
    response = client.post(f'/api/v1/users/invitations/{invitation.token}/activate', {
        'otp_code': '123456',
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'terms_accepted': True
    })
    
    assert response.status_code == 410
    assert response.json()['code'] == 'INV-410-EXPIRED'

def test_activation_without_terms_acceptance():
    invitation = create_invitation(email='user@co.com')
    
    response = client.post(f'/api/v1/users/invitations/{invitation.token}/activate', {
        'otp_code': '123456',
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'terms_accepted': False
    })
    
    assert response.status_code == 400
    assert 'Terms & Conditions must be accepted' in response.json()['message']

def test_activation_weak_password():
    invitation = create_invitation(email='user@co.com')
    
    response = client.post(f'/api/v1/users/invitations/{invitation.token}/activate', {
        'otp_code': '123456',
        'password': 'weak',
        'password_confirm': 'weak',
        'terms_accepted': True
    })
    
    assert response.status_code == 400
    assert response.json()['code'] == 'PWD-400-COMPLEXITY'

def test_activation_mismatched_passwords():
    invitation = create_invitation(email='user@co.com')
    
    response = client.post(f'/api/v1/users/invitations/{invitation.token}/activate', {
        'otp_code': '123456',
        'password': 'SecurePass123!',
        'password_confirm': 'DifferentPass456!',
        'terms_accepted': True
    })
    
    assert response.status_code == 400
    assert 'Passwords do not match' in response.json()['message']
```

### UT-INV-004: OTP Verification During Activation
```python
def test_email_otp_verification_success():
    invitation = create_invitation(email='user@co.com')
    activation = create_activation(invitation_id=invitation.id, otp_type='email', otp_code='123456')
    
    result = verify_activation_otp(activation.id, 'email', '123456')
    assert result is True
    
    activation.refresh_from_db()
    assert activation.otp_verified is True

def test_sms_otp_verification_success():
    invitation = create_invitation(email='user@co.com', mobile='+8801700000001')
    activation = create_activation(invitation_id=invitation.id, otp_type='sms', otp_code='654321')
    
    result = verify_activation_otp(activation.id, 'sms', '654321')
    assert result is True

def test_otp_expired():
    activation = create_activation(
        otp_expires_at=datetime.now() - timedelta(minutes=1)
    )
    
    with pytest.raises(OTPExpiredError):
        verify_activation_otp(activation.id, 'email', '123456')

def test_otp_max_attempts_exceeded():
    activation = create_activation(activation_attempts=3)
    
    with pytest.raises(MaxAttemptsExceededError):
        verify_activation_otp(activation.id, 'email', 'wrong')

def test_otp_resend_cooldown():
    activation = create_activation(last_otp_sent_at=datetime.now())
    
    response = client.post(f'/api/v1/users/invitations/{activation.token}/otp/resend', {
        'otp_type': 'email'
    })
    
    assert response.status_code == 429
    assert 'Please wait' in response.json()['message']
```

### UT-INV-005: Admin-Assisted Password Reset
```python
def test_admin_assisted_reset_initiation():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='driver@co.com')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password-reset', {
        'verification_method': 'Phone',
        'justification': 'User forgot password, verified via phone call to registered number'
    })
    
    assert response.status_code == 200
    assert 'otp_code' in response.json()
    assert len(response.json()['otp_code']) == 6
    assert 'otp_expires_at' in response.json()

def test_admin_assisted_reset_missing_justification():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password-reset', {
        'verification_method': 'Phone',
        'justification': 'short'
    })
    
    assert response.status_code == 400
    assert 'minimum 10 characters' in response.json()['message']

def test_admin_assisted_reset_no_permission():
    non_admin = create_user_with_role('Depot Officer')
    user = create_active_user()
    client.force_authenticate(non_admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password-reset', {
        'verification_method': 'Phone',
        'justification': 'User forgot password, verified in person'
    })
    
    assert response.status_code == 403

def test_admin_assisted_reset_completion():
    reset = create_admin_assisted_reset(otp_code='483921')
    
    response = client.post('/api/v1/auth/password/admin-reset', {
        'reset_id': reset.id,
        'otp': '483921',
        'new_password': 'NewSecurePass456!',
        'confirm_password': 'NewSecurePass456!'
    })
    
    assert response.status_code == 200
    assert response.json()['success'] is True

def test_admin_assisted_reset_expired_otp():
    reset = create_admin_assisted_reset(
        otp_code='483921',
        otp_expires_at=datetime.now() - timedelta(minutes=1)
    )
    
    response = client.post('/api/v1/auth/password/admin-reset', {
        'reset_id': reset.id,
        'otp': '483921',
        'new_password': 'NewSecurePass456!',
        'confirm_password': 'NewSecurePass456!'
    })
    
    assert response.status_code == 410
    assert 'OTP expired' in response.json()['message']

def test_admin_assisted_reset_audit_log():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    perform_admin_assisted_reset(admin, user, justification='Verified in person at depot')
    
    logs = PasswordResetAuditLog.objects.filter(user=user, method='admin-assisted')
    assert logs.count() == 1
    assert logs.first().admin_id == admin.id
    assert logs.first().justification == 'Verified in person at depot'
    assert logs.first().status == 'success'
```

### UT-INV-006: Self-Service Password Reset
```python
def test_forgot_password_initiation():
    user = create_active_user(email='user@company.com', mobile='+8801712345678')
    
    response = client.post('/api/v1/auth/password/forgot', {
        'identifier': 'user@company.com'
    })
    
    assert response.status_code == 200
    # Always returns success to prevent enumeration
    assert 'reset link has been sent' in response.json()['message']
    
    # Verify reset token created
    token = PasswordResetToken.objects.filter(user=user).first()
    assert token is not None
    assert token.expires_at > datetime.now()

def test_forgot_password_nonexistent_email():
    response = client.post('/api/v1/auth/password/forgot', {
        'identifier': 'nonexistent@company.com'
    })
    
    # Same response to prevent email enumeration
    assert response.status_code == 200
    assert 'reset link has been sent' in response.json()['message']

def test_self_service_reset_success():
    user = create_active_user(email='user@company.com')
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'token': token.token,
        'otp': token.otp_code,
        'new_password': 'NewSecurePass789!',
        'confirm_password': 'NewSecurePass789!'
    })
    
    assert response.status_code == 200
    assert response.json()['success'] is True
    
    # Verify sessions terminated
    assert Session.objects.filter(user=user, status='Active').count() == 0

def test_self_service_reset_expired_link():
    user = create_active_user()
    token = create_password_reset_token(
        user, expires_at=datetime.now() - timedelta(minutes=1)
    )
    
    response = client.post('/api/v1/auth/password/reset', {
        'token': token.token,
        'otp': token.otp_code,
        'new_password': 'NewSecurePass789!',
        'confirm_password': 'NewSecurePass789!'
    })
    
    assert response.status_code == 410
    assert 'expired' in response.json()['message']

def test_self_service_reset_rate_limiting():
    user = create_active_user(email='user@company.com')
    
    for _ in range(3):
        client.post('/api/v1/auth/password/forgot', {'identifier': 'user@company.com'})
    
    # 4th request should be blocked
    response = client.post('/api/v1/auth/password/forgot', {
        'identifier': 'user@company.com'
    })
    
    assert response.status_code == 429
    assert 'Too many reset requests' in response.json()['message']

def test_password_history_enforcement():
    user = create_active_user()
    set_password_history(user, ['OldPass1!', 'OldPass2!', 'OldPass3!'])
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'token': token.token,
        'otp': token.otp_code,
        'new_password': 'OldPass1!',
        'confirm_password': 'OldPass1!'
    })
    
    assert response.status_code == 400
    assert 'Cannot reuse' in response.json()['message']

def test_password_reset_audit_logging():
    user = create_active_user(email='user@company.com')
    perform_self_service_reset(user)
    
    logs = PasswordResetAuditLog.objects.filter(user=user, method='self-service')
    assert logs.count() == 1
    assert logs.first().status == 'success'
    assert logs.first().ip_address is not None
```

## UI Tests

### UI-INV-001: Invitation Form Tests
```javascript
describe('Invitation Form', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/invite');
  });

  it('should display all required form fields', () => {
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="mobile-input"]').should('be.visible');
    cy.get('[data-testid="first-name-input"]').should('be.visible');
    cy.get('[data-testid="last-name-input"]').should('be.visible');
    cy.get('[data-testid="role-select"]').should('be.visible');
    cy.get('[data-testid="department-select"]').should('be.visible');
    cy.get('[data-testid="otp-type-select"]').should('be.visible');
    cy.get('[data-testid="send-invitation-btn"]').should('be.visible');
    cy.get('[data-testid="bulk-upload-btn"]').should('be.visible');
  });

  it('should not show Super Admin in role dropdown', () => {
    cy.get('[data-testid="role-select"]').click();
    cy.get('[data-testid="role-option"]').each(($opt) => {
      cy.wrap($opt).should('not.contain', 'Super Admin');
    });
  });

  it('should validate email format', () => {
    cy.get('[data-testid="email-input"]').type('invalid-email');
    cy.get('[data-testid="send-invitation-btn"]').click();
    cy.get('[data-testid="email-error"]').should('contain', 'valid email');
  });

  it('should validate mobile number format', () => {
    cy.get('[data-testid="mobile-input"]').type('123');
    cy.get('[data-testid="send-invitation-btn"]').click();
    cy.get('[data-testid="mobile-error"]').should('contain', 'valid mobile');
  });

  it('should show all 18 roles in dropdown', () => {
    cy.get('[data-testid="role-select"]').click();
    cy.get('[data-testid="role-option"]').should('have.length', 18);
    cy.get('[data-testid="role-option"]').should('contain', 'Depot Officer');
    cy.get('[data-testid="role-option"]').should('contain', 'Transport Planner');
    cy.get('[data-testid="role-option"]').should('contain', 'Driver Supervisor');
  });

  it('should allow custom invitation message', () => {
    cy.get('[data-testid="custom-message-textarea"]').type('Welcome to the team!');
    cy.get('[data-testid="custom-message-textarea"]').should('have.value', 'Welcome to the team!');
  });

  it('should submit invitation and show success, dispatching email immediately', () => {
    cy.fillInvitationForm({
      email: 'newuser@company.com',
      mobile: '+8801712345678',
      firstName: 'John',
      lastName: 'Doe',
      role: 'Depot Officer',
      department: 'Depot'
    });
    cy.get('[data-testid="send-invitation-btn"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'Invitation sent');
    // Invitation status badge should immediately reflect "sent"
    cy.get('[data-testid="invitation-status"]').should('contain', 'sent');
  });

  it('should show error for duplicate email', () => {
    cy.fillInvitationForm({ email: 'existing@company.com' });
    cy.get('[data-testid="send-invitation-btn"]').click();
    cy.get('[data-testid="error-toast"]').should('contain', 'already');
  });
});
```

### UI-INV-002: Bulk Upload Interface Tests
```javascript
describe('Bulk Upload Interface', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/invite');
    cy.get('[data-testid="bulk-upload-btn"]').click();
  });

  it('should display upload area and template download', () => {
    cy.get('[data-testid="csv-upload-area"]').should('be.visible');
    cy.get('[data-testid="template-download-link"]').should('be.visible');
  });

  it('should download CSV template', () => {
    cy.get('[data-testid="template-download-link"]').click();
    cy.readFile('cypress/downloads/invitation-template.csv')
      .should('contain', 'Email,Mobile,First Name,Last Name,Role,Department');
  });

  it('should upload valid CSV and show results', () => {
    cy.get('[data-testid="csv-upload-area"]').attachFile('valid-users.csv');
    cy.get('[data-testid="process-invitations-btn"]').click();
    cy.get('[data-testid="upload-summary"]').should('contain', 'Success: 5');
    cy.get('[data-testid="upload-summary"]').should('contain', 'Failed: 0');
  });

  it('should show validation errors for invalid CSV', () => {
    cy.get('[data-testid="csv-upload-area"]').attachFile('invalid-users.csv');
    cy.get('[data-testid="process-invitations-btn"]').click();
    cy.get('[data-testid="validation-errors"]').should('be.visible');
    cy.get('[data-testid="error-row"]').should('have.length.greaterThan', 0);
  });

  it('should reject CSV exceeding 100-row limit', () => {
    cy.get('[data-testid="csv-upload-area"]').attachFile('101-users.csv');
    cy.get('[data-testid="process-invitations-btn"]').click();
    cy.get('[data-testid="error-toast"]').should('contain', 'Maximum 100');
  });
});
```

### UI-INV-003: Invitation Dashboard Tests
```javascript
describe('Invitation Dashboard', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/invitations');
  });

  it('should display invitation list with status badges', () => {
    cy.get('[data-testid="invitation-table"]').should('be.visible');
    cy.get('[data-testid="status-badge-pending"]').should('exist');
    cy.get('[data-testid="status-badge-activated"]').should('exist');
  });

  it('should filter by status', () => {
    cy.get('[data-testid="filter-status"]').select('Pending');
    cy.get('[data-testid="invitation-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="status-badge"]').should('contain', 'Pending');
    });
  });

  it('should filter by role', () => {
    cy.get('[data-testid="filter-role"]').select('Depot Officer');
    cy.get('[data-testid="invitation-row"]').should('have.length.greaterThan', 0);
  });

  it('should allow resend action for pending invitations', () => {
    cy.get('[data-testid="invitation-row-pending"]').first()
      .find('[data-testid="resend-btn"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'Invitation resent');
  });

  it('should allow cancel action for pending invitations', () => {
    cy.get('[data-testid="invitation-row-pending"]').first()
      .find('[data-testid="cancel-btn"]').click();
    cy.get('[data-testid="confirm-dialog"]').find('[data-testid="confirm-btn"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'Invitation cancelled');
  });

  it('should show resend cooldown message', () => {
    cy.get('[data-testid="invitation-row-pending"]').first()
      .find('[data-testid="resend-btn"]').click();
    cy.get('[data-testid="invitation-row-pending"]').first()
      .find('[data-testid="resend-btn"]').click();
    cy.get('[data-testid="error-toast"]').should('contain', 'wait 2 minutes');
  });
});
```

### UI-INV-004: Activation Page Tests
```javascript
describe('Activation Page', () => {
  it('should display organization name and OTP field when required', () => {
    cy.visit('/activate?token=valid-token');
    cy.get('[data-testid="org-name"]').should('be.visible');
    cy.get('[data-testid="otp-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="password-confirm-input"]').should('be.visible');
    cy.get('[data-testid="terms-checkbox"]').should('be.visible');
    cy.get('[data-testid="activate-btn"]').should('be.visible');
  });

  it('should complete activation with valid inputs', () => {
    cy.visit('/activate?token=valid-token');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="password-input"]').type('SecurePass123!');
    cy.get('[data-testid="password-confirm-input"]').type('SecurePass123!');
    cy.get('[data-testid="terms-checkbox"]').check();
    cy.get('[data-testid="activate-btn"]').click();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('be.visible');
  });

  it('should show error for expired invitation', () => {
    cy.visit('/activate?token=expired-token');
    cy.get('[data-testid="expired-message"]').should('contain', 'Invitation expired');
    cy.get('[data-testid="contact-admin-link"]').should('be.visible');
  });

  it('should show password strength meter', () => {
    cy.visit('/activate?token=valid-token');
    cy.get('[data-testid="password-input"]').type('weak');
    cy.get('[data-testid="password-strength"]').should('have.class', 'weak');
    
    cy.get('[data-testid="password-input"]').clear().type('SecurePass123!');
    cy.get('[data-testid="password-strength"]').should('have.class', 'strong');
  });

  it('should validate password confirmation matches', () => {
    cy.visit('/activate?token=valid-token');
    cy.get('[data-testid="password-input"]').type('SecurePass123!');
    cy.get('[data-testid="password-confirm-input"]').type('DifferentPass');
    cy.get('[data-testid="activate-btn"]').click();
    cy.get('[data-testid="password-match-error"]').should('contain', 'do not match');
  });

  it('should allow OTP resend', () => {
    cy.visit('/activate?token=valid-token');
    cy.get('[data-testid="resend-email-otp"]').click();
    cy.get('[data-testid="success-toast"]').should('contain', 'OTP resent');
  });
});
```

### UI-INV-005: Password Reset Pages Tests
```javascript
describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="forgot-password-link"]').click();
  });

  it('should display forgot password form', () => {
    cy.get('[data-testid="identifier-input"]').should('be.visible');
    cy.get('[data-testid="send-reset-btn"]').should('be.visible');
    cy.get('[data-testid="contact-admin-link"]').should('be.visible');
  });

  it('should accept email and show success message', () => {
    cy.get('[data-testid="identifier-input"]').type('user@company.com');
    cy.get('[data-testid="send-reset-btn"]').click();
    cy.get('[data-testid="success-message"]')
      .should('contain', 'If an account exists, a reset link has been sent');
  });

  it('should accept mobile number', () => {
    cy.get('[data-testid="identifier-input"]').type('+8801712345678');
    cy.get('[data-testid="send-reset-btn"]').click();
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should show same message for non-existent email', () => {
    cy.get('[data-testid="identifier-input"]').type('nonexistent@company.com');
    cy.get('[data-testid="send-reset-btn"]').click();
    cy.get('[data-testid="success-message"]')
      .should('contain', 'If an account exists, a reset link has been sent');
  });
});

describe('Password Reset Page', () => {
  it('should display reset form with OTP and password fields', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').should('be.visible');
    cy.get('[data-testid="new-password-input"]').should('be.visible');
    cy.get('[data-testid="confirm-password-input"]').should('be.visible');
    cy.get('[data-testid="password-strength-meter"]').should('be.visible');
    cy.get('[data-testid="reset-password-btn"]').should('be.visible');
  });

  it('should complete password reset successfully', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="new-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="confirm-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="reset-password-btn"]').click();
    cy.get('[data-testid="success-message"]').should('contain', 'Password reset successful');
    cy.url().should('include', '/login');
  });

  it('should show error for expired link', () => {
    cy.visit('/reset-password?token=expired-token');
    cy.get('[data-testid="expired-message"]').should('contain', 'Reset link expired');
    cy.get('[data-testid="request-new-link"]').should('be.visible');
  });

  it('should enforce password complexity', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="new-password-input"]').type('weak');
    cy.get('[data-testid="reset-password-btn"]').click();
    cy.get('[data-testid="complexity-requirements"]').should('be.visible');
  });

  it('should reject reused password', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="new-password-input"]').type('OldPassword1!');
    cy.get('[data-testid="confirm-password-input"]').type('OldPassword1!');
    cy.get('[data-testid="reset-password-btn"]').click();
    cy.get('[data-testid="error-toast"]').should('contain', 'Cannot reuse');
  });
});

describe('Admin-Assisted Reset Interface', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="reset-password-btn"]').click();
  });

  it('should display assisted reset form', () => {
    cy.get('[data-testid="verification-method-select"]').should('be.visible');
    cy.get('[data-testid="justification-textarea"]').should('be.visible');
    cy.get('[data-testid="generate-otp-btn"]').should('be.visible');
  });

  it('should require justification before OTP generation', () => {
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="justification-error"]').should('contain', 'minimum 10 characters');
  });

  it('should generate and display OTP', () => {
    cy.get('[data-testid="verification-method-select"]').select('Phone');
    cy.get('[data-testid="justification-textarea"]')
      .type('User forgot password, verified via phone call');
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="otp-display"]').should('be.visible');
    cy.get('[data-testid="otp-display"]').invoke('text').should('match', /\d{6}/);
    cy.get('[data-testid="otp-warning"]')
      .should('contain', 'Communicate this OTP to the user offline');
  });

  it('should show OTP expiry timer', () => {
    cy.fillAssistedResetForm();
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="otp-timer"]').should('contain', '10:00');
  });
});
```

## Integration Tests

### IT-INV-001: End-to-End Invitation-to-Activation Flow
```python
def test_e2e_invitation_to_activation():
    """Full lifecycle: Admin invites user → email sent → user activates."""
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    # Step 1: Create invitation — email dispatched immediately
    inv_response = client.post('/api/v1/tenants/tenant-1/users/invitations', {
        'employee_id': 'EMP-0002',
        'email': 'newuser@company.com',
        'mobile': '+8801712345678',
        'first_name': 'New',
        'last_name': 'User',
        'role_ids': [get_role_id('Depot Officer')],
        'department_id': 'depot-1',
        'functional_role_type': 'Requester'
    })
    assert inv_response.status_code == 201
    assert inv_response.json()['invitation_status'] == 'sent'
    token = inv_response.json()['invitation_token']
    
    # Step 2: Email must already be sent at this point (immediate dispatch)
    assert_email_sent_to('newuser@company.com', subject_contains='Invitation')
    
    # Step 3: Retrieve activation OTPs
    invitation = UserInvitation.objects.get(invitation_token=token)
    activation = UserActivation.objects.get(invitation=invitation)
    
    # Step 4: Activate account
    client.logout()
    act_response = client.post(f'/api/v1/users/invitations/{token}/activate', {
        'otp_code': activation.otp_code,
        'password': 'SecurePass123!',
        'password_confirm': 'SecurePass123!',
        'terms_accepted': True
    })
    assert act_response.status_code == 200
    
    # Step 5: Verify user created with correct role
    user = User.objects.get(email='newuser@company.com')
    assert user.is_active is True
    assert user.roles.filter(name='Depot Officer').exists()
    assert_email_sent_to('newuser@company.com', subject_contains='Welcome')
```

### IT-INV-002: Bulk Invitation Processing
```python
def test_e2e_bulk_invitation():
    """Bulk CSV upload with mix of valid and invalid rows."""
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    csv = (
        "Email,Mobile,First Name,Last Name,Role,Department\n"
        "user1@co.com,+8801700000001,User,One,Depot Officer,Depot\n"
        "bad-email,invalid,User,Two,FakeRole,Dept\n"
        "user3@co.com,+8801700000003,User,Three,Transport Planner,Transport\n"
    )
    
    response = client.post('/api/v1/tenants/tenant-1/users/invitations/bulk',
                          files={'csv': csv})
    
    assert response.status_code == 200
    data = response.json()
    assert data['success_count'] == 2
    assert data['failure_count'] == 1
    assert data['errors'][0]['row'] == 2
    
    # Verify successful invitations sent
    assert UserInvitation.objects.filter(tenant_id='tenant-1').count() == 2
    assert_email_sent_to('user1@co.com')
    assert_email_sent_to('user3@co.com')
```

### IT-INV-003: Plan Limit Enforcement Across Flows
```python
def test_plan_limit_blocks_invitation():
    """Invitation blocked when tenant reaches subscription user limit."""
    tenant = create_tenant(plan='Basic', max_users=3)
    create_users(count=3, tenant=tenant.id)
    admin = get_tenant_admin(tenant.id)
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/tenants/{tenant.id}/users/invitations', {
        'email': 'overflow@co.com',
        'mobile': '+8801700000099',
        'first_name': 'Overflow',
        'last_name': 'User',
        'role_ids': [get_role_id('Depot Officer')]
    })
    
    assert response.status_code == 403
    assert 'User limit reached' in response.json()['message']

def test_plan_limit_blocks_bulk():
    """Bulk upload respects plan limit for total projected count."""
    tenant = create_tenant(plan='Basic', max_users=5)
    create_users(count=4, tenant=tenant.id)
    
    csv = generate_csv_rows(count=3)  # Would bring total to 7
    response = client.post(f'/api/v1/tenants/{tenant.id}/users/invitations/bulk',
                          files={'csv': csv})
    
    data = response.json()
    assert data['success_count'] == 1
    assert data['failure_count'] == 2
```

### IT-INV-004: Admin-Assisted Password Reset Flow
```python
def test_e2e_admin_assisted_reset():
    """Full flow: Admin initiates → generates OTP → user resets password."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='driver@co.com', mobile='+8801700000001')
    old_password_hash = user.password
    client.force_authenticate(admin)
    
    # Step 1: Admin initiates reset
    init_response = client.post(f'/api/v1/admin/users/{user.id}/password-reset', {
        'verification_method': 'Phone',
        'justification': 'Driver forgot password, verified via phone call to registered number'
    })
    assert init_response.status_code == 200
    otp = init_response.json()['otp_code']
    reset_id = init_response.json()['reset_id']
    
    # Step 2: User completes reset with admin-provided OTP
    client.logout()
    reset_response = client.post('/api/v1/auth/password/admin-reset', {
        'reset_id': reset_id,
        'otp': otp,
        'new_password': 'NewDriverPass123!',
        'confirm_password': 'NewDriverPass123!'
    })
    assert reset_response.status_code == 200
    
    # Step 3: Verify password changed and sessions terminated
    user.refresh_from_db()
    assert user.password != old_password_hash
    assert Session.objects.filter(user=user, status='Active').count() == 0
    
    # Step 4: Verify audit log
    log = PasswordResetAuditLog.objects.get(user=user, method='admin-assisted')
    assert log.admin_id == admin.id
    assert log.status == 'success'
```

### IT-INV-005: Self-Service Password Reset Flow
```python
def test_e2e_self_service_reset():
    """Full flow: User forgot password → OTP → reset → sessions terminated."""
    user = create_active_user(email='user@co.com', mobile='+8801712345678')
    create_session(user=user, status='Active')
    old_password_hash = user.password
    
    # Step 1: Initiate forgot password
    forgot_response = client.post('/api/v1/auth/password/forgot', {
        'identifier': 'user@co.com'
    })
    assert forgot_response.status_code == 200
    
    # Step 2: Get token and OTP
    token = PasswordResetToken.objects.get(user=user)
    
    # Step 3: Complete reset
    reset_response = client.post('/api/v1/auth/password/reset', {
        'token': token.token,
        'otp': token.otp_code,
        'new_password': 'BrandNewPass456!',
        'confirm_password': 'BrandNewPass456!'
    })
    assert reset_response.status_code == 200
    
    # Step 4: Verify
    user.refresh_from_db()
    assert user.password != old_password_hash
    assert Session.objects.filter(user=user, status='Active').count() == 0
    assert_email_sent_to('user@co.com', subject_contains='Password Reset Confirmation')
    
    log = PasswordResetAuditLog.objects.get(user=user, method='self-service')
    assert log.status == 'success'
```

---

## Edge Cases

### Invitation Edge Cases
1. **Invitation for already-active user**: System rejects with 409 Conflict and message "User already active"
2. **Concurrent activation attempts**: Only the first request succeeds; subsequent requests return "Account already activated"
3. **CSV with mixed valid/invalid rows**: Valid rows processed, invalid rows reported with row number and error detail
4. **Multiple pending invitations for same email**: Only one active invitation per email per tenant; resending replaces the previous one
5. **Invitation resend within cooldown**: Returns 429 with "Please wait 2 minutes" message
6. **Activation with OTP type mismatch**: If activation is attempted with an OTP type different from the invitation's OTP type, system rejects with "Invalid OTP type"
7. **Invitation scheduling past expiry**: System rejects if scheduled send time + 7 days is unreasonable (> 30 days out)
8. **Cross-tenant email uniqueness**: Same email can exist in different tenants but not within the same tenant
9. **Bulk upload with duplicate emails in same CSV**: Second occurrence flagged as duplicate within batch
10. **Invitation with Super Admin role**: System rejects with HTTP 403 `ROLE-403-SUPER-ADMIN-RESTRICTED` — "Super Admin role cannot be assigned through invitation. Super Admins are provisioned manually." The `Super Admin` role is also hidden from the role dropdown in the UI

### Password Reset Edge Cases
11. **Password reset during active session**: All sessions terminated immediately upon successful reset; user must re-authenticate
12. **Admin-assisted reset for locked/deactivated account**: System allows reset but re-activates only if admin explicitly confirms
13. **Self-service reset with expired OTP but valid link**: System requires both; expired OTP alone blocks the reset
14. **Concurrent password reset requests**: Only the most recent token/OTP is valid; previous ones are invalidated
15. **Admin-assisted reset without generating OTP first**: "Generate OTP" is required before "Complete Reset" becomes available
16. **Rate-limited user attempts admin-assisted reset**: Admin-assisted reset bypasses the self-service rate limit (separate flow)
17. **Password reset for user in multiple tenants**: Reset scoped to the specific tenant context; other tenant accounts unaffected
18. **OTP brute-force prevention**: After 3 incorrect OTP attempts, the token is invalidated; user must request a new reset

---

## Test Coverage Requirements

| Test Category | Target Coverage | Priority |
|---|---|---|
| Unit Tests - Invitation Creation | 95% | Critical |
| Unit Tests - Bulk CSV Upload | 90% | Critical |
| Unit Tests - Activation Workflow | 95% | Critical |
| Unit Tests - OTP Verification | 95% | Critical |
| Unit Tests - Admin-Assisted Reset | 95% | Critical |
| Unit Tests - Self-Service Reset | 95% | Critical |
| UI Tests - Invitation Form | 90% | High |
| UI Tests - Bulk Upload Interface | 85% | High |
| UI Tests - Invitation Dashboard | 85% | High |
| UI Tests - Activation Page | 90% | Critical |
| UI Tests - Password Reset Pages | 90% | Critical |
| Integration Tests - E2E Flows | 85% | Critical |
| Integration Tests - Plan Limits | 90% | High |
| Edge Case Coverage | 80% | High |

---

## Dependencies

- **US-007**: User and Role Management (roles must exist)
- **US-008**: Tenant Configuration (tenant must exist)
- **US-064**: Subscription Plan Selection (plan limits enforced)
- **US-006**: OTP Verification System (OTP functionality)

## Definition of Done

### Functional Requirements
- [ ] Invitation creation form implemented (single user)
- [ ] Invitation email/SMS sending implemented
- [ ] Bulk invitation CSV upload implemented with validation
- [ ] OTP verification integrated (email + SMS)
- [ ] User activation workflow implemented with T&C acceptance
- [ ] Invitation management dashboard implemented with filters
- [ ] Plan limit enforcement implemented
- [ ] Admin-assisted password reset implemented
- [ ] Self-service password reset implemented (forgot password + OTP + link)
- [ ] Password complexity rules enforced across all password flows
- [ ] Session termination on password reset implemented
- [ ] Audit logging for all password reset events implemented

### Test Requirements
- [ ] Unit tests written and passing (≥ 90% coverage)
- [ ] UI tests written and passing (Cypress)
- [ ] Integration tests written and passing (E2E flows)
- [ ] Edge case scenarios tested
- [ ] Rate limiting tested
- [ ] Cross-tenant isolation tested

### Documentation & Review
- [ ] API documentation updated for all new endpoints
- [ ] Module specification aligned (`user-tenant-management.md`)
- [ ] Code reviewed and approved
- [ ] Security review completed for password reset flows

---

**Source Documents**:
- PRD Section 6.2.3: User Invitation & Activation
- US-008: Password & Account Reset (consolidated into US-005)

**Last Updated**: April 9, 2026  
**Status**: Pending Review

