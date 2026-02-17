---
title: User Invitation & Activation
story_id: US-065
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Tenant Onboarding
sprint: Sprint 2
story_points: 8
created: 2026-02-13
updated: 2026-02-13
source_documents:
  - ../../../../source-documents/requirements/PRD_DFMS_v1.0.md
related_stories:
  - US-007-user-role-management.md
  - US-008-tenant-configuration.md
  - US-064-subscription-plan-selection.md
  - US-066-otp-verification.md
dependencies: []
tags: [user-management, invitation, activation, onboarding, critical]
---

# US-065: User Invitation & Activation

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

### Must Have (Critical)
- [ ] System SHALL allow admin to invite users via email
- [ ] System SHALL send invitation email with activation link
- [ ] System SHALL require email and mobile OTP verification before activation
- [ ] System SHALL allow role assignment during invitation
- [ ] System SHALL support bulk user invitation via CSV upload
- [ ] System SHALL validate role permissions against tenant plan limits
- [ ] System SHALL enforce unique email per tenant
- [ ] System SHALL allow invitation resend (with cooldown period)
- [ ] System SHALL expire invitations after 7 days
- [ ] System SHALL log all invitation and activation events

### Should Have (High)
- [ ] System SHOULD support invitation via SMS (mobile number)
- [ ] System SHOULD allow custom invitation message
- [ ] System SHOULD show invitation status (Pending, Activated, Expired)
- [ ] System SHOULD allow invitation cancellation
- [ ] System SHOULD validate email domain (if domain restriction enabled)

### Nice to Have (Medium)
- [ ] System MAY support invitation templates
- [ ] System MAY allow invitation scheduling
- [ ] System MAY provide invitation analytics

## Functional Requirements

### FR-065-001: User Invitation Creation
- [Critical] System SHALL provide form to invite users with:
  - Email address (mandatory)
  - Mobile number (mandatory)
  - Full name
  - Role assignment
  - Department assignment (if applicable)
- [Critical] System SHALL validate email uniqueness within tenant
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
- [Critical] System SHALL create user account upon successful activation
- [Critical] System SHALL assign role(s) as specified in invitation
- [Critical] System SHALL send welcome email after activation
- [High] System SHALL allow activation link reuse within validity period
- [High] System SHALL support activation via mobile app

### FR-065-004: Bulk Invitation
- [Critical] System SHALL support CSV upload with columns:
  - Email, Mobile, Full Name, Role, Department
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

### BR-065-002: Email Validation
- Email must be unique within tenant
- Email format must be valid
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
- Activation link must be valid (not expired)
- User account created only after successful activation

## Data Model

### User Invitation Entity
```yaml
UserInvitation:
  invitation_id: string (unique)
  tenant_id: string (FK)
  email: string
  mobile: string
  full_name: string
  role_ids: array[string] (FK)
  department_id: string (FK, optional)
  invitation_token: string (unique)
  status: string (pending, activated, expired, cancelled)
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
  activation_attempts: integer
  activated_at: datetime (optional)
```

## UI/UX Requirements

### Invitation Form
- Email input with validation
- Mobile number input with validation
- Full name input
- Role selection (multi-select)
- Department selection (dropdown, optional)
- Custom message textarea (optional)
- "Send Invitation" button
- "Bulk Upload" option

### Bulk Upload Interface
- CSV file upload area
- Template download link
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
- "Activate Account" button
- Resend OTP links

## API Endpoints

### POST /api/v1/tenants/{tenant_id}/users/invitations
- Create user invitation
- Request body: email, mobile, full_name, role_ids, department_id, custom_message
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
- Request body: email_otp, sms_otp, password, password_confirm
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
- **US-066**: OTP Verification System (OTP functionality)

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

