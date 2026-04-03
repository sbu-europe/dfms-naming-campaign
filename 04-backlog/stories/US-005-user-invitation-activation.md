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
updated: 2026-02-13
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

**As a** Tenant Admin  
**I want to** invite users to join the organization and activate their accounts  
**So that** they can access the system with appropriate roles and permissions

## Business Context

Organizations need to onboard multiple users with different roles. The invitation and activation workflow ensures:
- Secure user onboarding
- Proper role assignment
- Email/mobile verification
- Controlled access to system

This is critical for multi-tenant security and proper access control.

## Acceptance Criteria

Given a tenant Admin user accesses the "Invite User" functionality,

when the Admin fills out the invitation form with user details (Full Name, Email, Mobile Number, Role, Department, Employment Type, POI if applicable, and Workflow Responsibility),

then the system shall:

- [ ] Allow admin to invite users via Email or mobile number
- [ ] Send an invitation link via Email or mobile phone number
- [ ] Requires Email or mobile OTP verification before activation
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
- [ ] Bulk user invitation via CSV upload for each role
- [ ] Validate role permissions against tenant plan limits
- [ ] Enforce unique mobile number per tenant
- [ ] Allow invitation resend (with cooldown period)
- [ ] Expires invitations after 7 days
- [ ] Allow the invited user to complete verification by:
  - Inputting phone OTP
  - Setting a password
  - Verifying OTP
  - Accepting Terms & Conditions
- [ ] Activate the user account only after successful OTP verification
- [ ] Allow the Admin to resend the invitation if it has expired
- [ ] Allow custom invitation message
- [ ] Support invitation templates
- [ ] Allow invitation scheduling
- [ ] Completes verification by verifying phone OTP, set password, accept T&C
- [ ] Track the invitation status as: **Sent → Pending → Activated/Expired**

## Functional Requirements

### FR-065-001: User Invitation Creation
- [Critical] System SHALL provide form to invite users with:
  - Email address (mandatory)
  - Mobile number (mandatory)
  - Full name
  - Role assignment (from predefined list of 18 roles)
  - Department assignment (if applicable)
  - Employment Type
  - POI (if applicable)
  - Workflow Responsibility
- [Critical] System SHALL validate email uniqueness within tenant
- [Critical] System SHALL validate mobile number uniqueness within tenant
- [Critical] System SHALL validate role exists and is assignable
- [Critical] System SHALL check subscription plan user limit before invitation
- [High] System SHALL support bulk CSV upload with validation
- [High] System SHALL allow custom invitation message

### FR-065-002: Invitation Email
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
- [Critical] System SHALL require OTP verification (email + SMS) before activation
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
  - Email, Mobile, Full Name, Role, Department, Employment Type, POI, Workflow Responsibility
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

## Business Rules

### BR-065-001: Invitation Limits
- Invitation count must not exceed subscription plan user limit
- Maximum 100 invitations per batch (bulk upload)
- Invitation resend cooldown: 2 minutes
- Invitation expiration: 7 days from creation

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
- User can have multiple roles
- Role permissions validated against tenant plan

### BR-065-004: Activation Requirements
- Both email and SMS OTP must be verified
- Password must meet complexity requirements
- Terms & Conditions must be accepted
- Activation link must be valid (not expired)
- User account created only after successful activation

## Data Model

### User Invitation Entity
```yaml
UserInvitation:
  invitation_id: string (unique)
  tenant_id: string (FK)
  email: string (unique per tenant)
  mobile: string (unique per tenant)
  full_name: string
  role_ids: array[string] (FK)
  department_id: string (FK, optional)
  employment_type: string
  poi_id: string (FK, optional)
  workflow_responsibility: string
  invitation_token: string (unique)
  status: string (sent, pending, activated, expired, cancelled)
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
  email_otp: string
  sms_otp: string
  email_otp_verified: boolean
  sms_otp_verified: boolean
  email_otp_expires_at: datetime
  sms_otp_expires_at: datetime
  terms_accepted: boolean
  terms_accepted_at: datetime (optional)
  activation_attempts: integer
  activated_at: datetime (optional)
```

## UI/UX Requirements

### Invitation Form
- Email input with validation
- Mobile number input with validation
- Full name input
- Role selection (dropdown from 18 predefined roles)
- Department selection (dropdown, optional)
- Employment Type input
- POI selection (dropdown, optional)
- Workflow Responsibility input
- Custom message textarea (optional)
- "Send Invitation" button
- "Bulk Upload" option

### Bulk Upload Interface
- CSV file upload area
- Template download link (with columns: Email, Mobile, Full Name, Role, Department, Employment Type, POI, Workflow Responsibility)
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
- Email OTP input
- SMS OTP input
- Password setup form
- Password confirmation
- Terms & Conditions checkbox with link to T&C document
- "Activate Account" button
- Resend OTP links

## API Endpoints

### POST /api/v1/tenants/{tenant_id}/users/invitations
- Create user invitation
- Request body: email, mobile, full_name, role_ids, department_id, employment_type, poi_id, workflow_responsibility, custom_message
- Response: invitation_id, invitation_token

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
- Request body: email_otp, sms_otp, password, password_confirm, terms_accepted
- Response: user_id, access_token

### POST /api/v1/users/invitations/{invitation_token}/otp/resend
- Resend OTP (email or SMS)
- Request body: otp_type (email|sms)
- Response: success message

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

## Dependencies

- **US-007**: User and Role Management (roles must exist)
- **US-008**: Tenant Configuration (tenant must exist)
- **US-064**: Subscription Plan Selection (plan limits enforced)
- **US-006**: OTP Verification System (OTP functionality)

## Definition of Done

- [ ] Invitation creation form implemented
- [ ] Invitation email sending implemented
- [ ] Bulk invitation CSV upload implemented
- [ ] OTP verification integrated
- [ ] User activation workflow implemented
- [ ] Invitation management dashboard implemented
- [ ] Plan limit enforcement implemented
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Documentation updated
- [ ] Code reviewed and approved

---

**Source Documents**:
- PRD Section 6.2.3: User Invitation & Activation

**Last Updated**: February 13, 2026  
**Status**: Pending Review

