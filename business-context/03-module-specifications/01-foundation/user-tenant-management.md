---
source_document: PRD_DFMS_v1.0.md
source_sections: User & Tenant Management
extracted_date: 2026-02-13
---

## User & Tenant Management

### Organization Signup & Tenant Creation

**Version 2.0**

**User Story:** _As a new organization, I want to register for a DFMS account so that I can start managing my transport and logistics operations digitally_.

**Acceptance Criteria:**

*   System provides web registration form capturing:
    *   Organization Name
    *   Admin Email
    *   Contact Number
    *   Business Category
    *   Industry Type
    *   Address
*   Email and mobile number verified through OTP before account activation
*   System auto-generates a unique tenant ID upon successful registration
*   Tenant data stored in isolated schema/database ensuring multi-tenant separation
*   Registration confirmation email sent with activation link and getting started guide
*   OTP valid for 10 minutes with resend option after 2 minutes cooldown
*   Failed OTP attempts (>3) temporarily block registration for 15 minutes
*   All registration attempts logged with timestamp, IP address, device information
*   System validates email domain uniqueness to prevent duplicate registrations

**Functional Requirements:**

*   \[Critical\] System SHALL provide a public registration form for new organization signup.
*   \[Critical\] Registration form SHALL collect:
    *   Organization/Company name
    *   Admin email
    *   Contact number
    *   Business category
    *   Industry Type
    *   Address.
*   \[Critical\] Upon successful registration, system SHALL generate unique tenant ID and dedicated database schema.
*   \[Critical\] System SHALL send email and SMS OTP to verify admin contact details before account activation
*   \[High\] System SHALL create default admin user account upon OTP verification.
*   \[High\] Verification logs SHALL be stored with timestamp and IP address for audit purposes.

### Subscription Plan Selection

**Version 2.0**

**User Story:** _As an organization, I want to select a subscription plan that matches my business size so that I only pay for features I need_.

**Subscription Tiers:**

| Tier | Users | Trips/Month | Key Features |
| --- | --- | --- | --- |
| Basic | 5 | 100 | TR/TO, Fleet basics, GPS tracking |
| Starter | 15 | 500 | All Basic + Vendor portal, QC module |
| Growth | 50 | 2000 | All Starter + Analytics, Cost management, PR/PO |
| Enterprise | Unlimited | Unlimited | All features + White-label, ERP integration |

**Acceptance Criteria:**

*   System displays all four subscription tiers with feature comparison
*   Admin can select plans during registration or upgrade/downgrade from settings as a request (Served by Backend Engine)
*   System enforces plan limits on user count, trip creation, storage usage

**Functional Requirements:**

*   \[Critical\] System SHALL present four subscription tiers: Basic, Starter, Growth, Enterprise.
*   \[Critical\] Each tier SHALL define limits for: Active users, Monthly trip capacity, Data storage (GB), Available modules.
*   \[Critical\] System SHALL bind selected plan limits to tenant account and enforce usage metrics.

### User Invitation & Activation

**Version 1.0, Phase - 1**

**User Story:** _As an Tenant Admin, I want to invite team members so that they can access the system on assigned roles_.

**Acceptance Criteria:**

*   ‘Invite User’ form captures:
    *   Full Name
    *   Email address
    *   Mobile Number
    *   Role
        *   Distribution Officer
        *   Procurement Officer
        *   Depot Officer
        *   Feed Mill Officer
        *   Command Center Officer
        *   Gate Man
        *   Scaling Personnel
        *   Loading Personnel
        *   Unloading Personnel
    *   Department
    *   Employment type
    *   POI (Where applicable)
    *   Workflow Responsibility (Requester / Approver / Executor)
*   Invitation email with 72-hour activation link
*   User completes profile: Set password, verify OTP, accept T&C
*   Account active only after OTP verification
*   Status tracked: Sent → Pending → Activated/Expired
*   Admin can resend expired invitations
*   Welcome email upon activation

**Functional Requirements:**

*   \[Critical\] Admins SHALL invite users via email with role and department assignment.
*   \[Critical\] Invited users MUST activate account via OTP and activation link.
*   \[Critical\] System SHALL validate unique email per tenant for invited users.
*   \[High\] Activation link SHALL expire after 72 hours for security
*   \[High\] System SHALL log all invitation and activation events with user ID and timestamp.
*   \[High\] Admin SHALL be able to resend or revoke pending invitations
*   \[Medium\] System SHALL support bulk user invitation via CSV upload
*   \[Medium\] System SHALL validate role permissions against tenant plan limits

### OTP Verification System

**Version 1.0, Phase - 1**

**User Story:** _As a system administrator, I want to verify user identity through OTP so that only legitimate users can access the system_.

**Acceptance Criteria:**

*   Email OTP sent as 6-digit numeric code
*   SMS OTP sent as 6-digit numeric code
*   Both OTPs verified before account activation
*   OTP valid for 10 minutes
*   Resend after 2-minute cooldown
*   Maximum 3 verification attempts
*   Failed attempts (>3) trigger 15-minute lockout
*   All attempts logged with timestamp, IP, device ID
*   Logs exportable for audit
*   Rate limiting max 5 OTP requests per hour per user

### Account Deactivation

**Version 1.0, Phase - 1**

**User Story:** _As an Admin, I want to deactivate user accounts to maintain system security._

**Acceptance Criteria:**

*   Two deactivation options:
    *   Temporary Suspension: Inactive, preserve data, reactivatable
    *   Permanent: Disabled permanently, data archived
*   Mandatory fields: Reason, effective date, admin remarks
*   Immediate logout from all sessions
*   Historical data preserved in audit trail
*   Deactivation logged with full details
*   Temporary accounts reactivated with approval
*   Email notification sent to user
*   Deactivated users blocked from new assignments

**Functional Requirements:**

*   \[Critical\] Admins CAN deactivate user accounts temporarily or permanently.
*   \[Critical\] System SHALL preserve historical audit records for deactivated users.
*   \[Critical\] Deactivation SHALL log timestamp, admin ID, and reason.
*   \[High\] System SHALL prevent deactivation if user has active critical assignments.
*   \[High\] Temporary suspension SHALL allow reactivation without data loss.
*   \[Medium\] System SHALL support bulk deactivation with validation
*   \[Medium\] Admin SHALL be able to view deactivation history.

### Password & Account Reset

**Version 1.0, Phase - 1**

**User Story:** _As a Admin User, I want to rest my password securely to regain access_.

**Acceptance Criteria:**

*   Admin-Assisted Reset (Preferred for low literacy users of the platform):
    *   Admin verifies identity offline
    *   6-digit OTP generated (10-minute validity)
    *   Admin communicates OTP
    *   User enters OPT to reset
    *   All assisted resets logged
    *   Admin provides justification remarks
*   Self-Service Reset:
    *   Forgot password link or login
    *   Mobile prompt
    *   Reset link valid 15 minutes
    *   Password complexity enforced
    *   Reset logged with details
    *   Confirmation email sent
    *   All sessions are terminated

**_Note:_** _Assisted reset option provided to support users with low digital literacy._

**Functional Requirements:**

*   \[Critical\] System SHALL send secure password reset link valid for 10 minutes.
*   \[Critical\] All password resets SHALL be logged with timestamp, user ID, and IP address.
*   \[Critical\] Super Admin and Tenant admin CAN trigger assisted reset after offline verification.
*   \[Critical\] System SHALL generate reset OTP for admin-assisted process.
*   \[High\] Password reset SHALL terminate all active user sessions.
*   \[High\] Audit log SHALL include method, timestamp, IP/device, success/failure for all attempts.
*   \[Medium\] System SHALL rate-limit reset requests (max 3 per hour per user).
*   \[Medium\] Email notification SHALL be sent after successful password change.
*   \[Low\] System SHALL provide password strength meter during reset.

### User Activity & Audit Logs

**Version 1.0, Phase - 1**

**User Story:** _As a Security Admin, I want to track all user activities for security._

**Acceptance Criteria:**

*   System logs: Login, logout, Password reset, Failed attempts, Lockout, Timeout
*   Each log captures: User ID, Event Type, Timestamp, IP Address, Device ID, Location. Status
*   Admin dashboard with filters: Date range, User, Event Type, Status
*   Minimum 2-year retention for compliance

**Functional Requirements:**

*   \[Critical\] Each login, logout, password reset, and failed attempt SHALL be logged.
*   \[Critical\] Audit logs SHALL include Device ID, IP Address, timestamp, user ID.
*   \[Critical\] Audit logs SHALL be immutable and tamper-proof.
*   \[High\] System SHALL retain audit logs for 2 years minimum.
*   \[High\] System SHALL provide real-time audit dashboard with filtering capabilities.

### Tenant Data Isolation

**Version 2.0**

**User Story:** _As a platform provider, I want complete data isolation between organizations_.

**Acceptance Criteria:**

*   Each organization’s data (user, fleet, trips, vendors) logically and physically segregated
*   Each tenant has unique tenant ID and isolated database schema
*   Tenant ID auto-appended to all queries
*   No cross-tenant data in UI or API
*   Database foreign keys enforce boundaries
*   API endpoints validate tenant context
*   Tenant-specific file storage folders
*   Encrypted separate tenant backups

**Functional Requirements:**

*   \[Critical\] System SHALL implement logical and physical tenant data isolation
*   \[Critical\] Each tenant SHALL have a unique tenant ID and dedicated database schema.
*   \[Critical\] All user data (users, fleet, trips, vendors) SHALL be scoped to tenant ID
