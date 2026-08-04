---
title: Password & Account Reset
story_id: US-008
phase: phase-1
module: User & Tenant Management
priority: Critical
status: Pending
epic: Security & Authentication
epic_id: EPIC-002
epic_name: User & Tenant Foundation
sprint: Sprint 3
story_points: 5
created: 2026-02-13
updated: 2026-07-28
source_documents:
  - ../../../../01-source/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-005-user-invitation-activation.md
  - US-006-otp-verification.md
  - US-007-account-deactivation.md
dependencies: []
tags: [security, password, reset, admin-assisted, self-service, otp, audit, authentication, critical, phone]
scope_note: Password reset functionality is also consolidated into US-005. This story provides the dedicated specification for password reset flows. CR-002 — single identifier field (email or phone); SMS delivery for phone identifiers.
---

# US-008: Password & Account Reset

## User Story

**As an** Admin User  
**I want to** reset my password securely using my email or phone  
**So that** I can regain access to my account

## Business Context

Password reset functionality is essential for:
- Users who forget their passwords
- Security incidents requiring password changes
- Account recovery
- Supporting users with low digital literacy through admin-assisted reset
- **Phone-invited / phone-only users** who have no email

The system must support both self-service and admin-assisted reset to accommodate all user types.

> **UI (CR-002)**: Forgot-password uses **one field** (“Email or phone”). Validation follows input shape (`@` → email; otherwise BD mobile). Delivery is email or SMS accordingly. Overview: [`staff-invite-login-password-channels.md`](../../05-modules/03-users/staff-invite-login-password-channels.md).

## Acceptance Criteria

### AC-0: Forgot Password / Change Password (All Users)

Given a user needs to reset a forgotten password or change their password,

when either **Forgot Password** (unauthenticated) or **Change Password** (authenticated) is initiated,

then the system shall:

- [ ] Accept a single **identifier** that is either a registered email or BD phone number (no separate Email/Phone tabs on forgot-password)
- [ ] Validate identifier format client- and server-side; reject malformed values without enumerating accounts
- [ ] Send a reset link (15 min) + 6-digit OTP (valid 10 minutes) to the matching channel (**email** or **SMS**)
- [ ] Require the user to enter the OTP for verification (where applicable)
- [ ] On successful verification, prompt the user to enter New Password and Confirm Password
- [ ] Validate password match + password policy compliance (complexity + last 3 password history)
- [ ] Update the user’s password and invalidate all active sessions
- [ ] Log the event with user ID, timestamp, IP address, device ID, method, and status
- [ ] For authenticated **Change Password**, do not require email/phone identifier (session-based)

**Test Scenarios (AC-0):**

```gherkin
Scenario: AC-0.1 - Forgot password via email requires OTP then sets new password
  Given a registered user on the login page
  When the user initiates "Forgot Password" using their email
  Then the system sends a reset link (15 minutes) and an OTP (10 minutes) by email
  When the user enters the received OTP successfully
  Then the system prompts for New Password and Confirm Password
  And updates the password on successful submission

Scenario: AC-0.1b - Forgot password via phone requires OTP then sets new password
  Given a phone-only registered user on the login page
  When the user initiates "Forgot Password" using their BD mobile
  Then the system sends a reset link and OTP by SMS (or logs SMS when disabled)
  When the user enters the received OTP successfully
  Then the system prompts for New Password and Confirm Password
  And updates the password on successful submission

Scenario: AC-0.2 - Authenticated change password requires match and complexity
  Given an authenticated user is on the Profile → Settings page
  When the user enters New Password and Confirm Password
  Then the system validates password match and complexity rules
  And updates the password on success
  And invalidates all active sessions

Scenario: AC-0.3 - Optional OTP verification for change password (high-risk)
  Given an authenticated user with a high-privilege role
  When the user initiates Change Password
  Then the system requires OTP verification before saving the new password
```

### AC-1: Admin-Assisted Password Reset

Given a user requires a password reset and cannot self-service (e.g., low digital literacy users such as Drivers, Helpers),

when an Admin initiates an assisted reset,

then the system shall:

- [ ] Allow Admin to verify the user's identity offline
- [ ] Generate a 6-digit OTP valid for 10 minutes
- [ ] Enable Admin to communicate the OTP to the user offline
- [ ] Allow the user to enter the OTP to reset the password
- [ ] Enforce password complexity rules during new password setup
- [ ] Log all assisted resets with Admin ID, User ID, timestamp, justification remarks, IP address
- [ ] Send notification to user about the assisted reset

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Admin initiates assisted password reset
  Given an Admin with "UserMgmt.User.ResetPassword" permission
  And a registered user "driver.ahmed" who cannot self-reset
  When the Admin navigates to the user's profile and clicks "Reset Password"
  Then the system displays the admin-assisted reset form
  And requires a justification remark (minimum 10 characters)
  And requires verification method selection (Phone, Email, In-Person)

Scenario: AC-1.2 - Admin generates and communicates OTP
  Given an Admin has completed identity verification for "driver.ahmed"
  And provided justification "User forgot password, verified via phone call"
  When the Admin clicks "Generate OTP"
  Then the system generates a 6-digit OTP valid for 10 minutes
  And displays the OTP to the Admin (not sent to user directly)
  And the Admin communicates the OTP offline to the user

Scenario: AC-1.3 - User completes reset with admin-provided OTP
  Given "driver.ahmed" has received the OTP from Admin
  When the user enters the OTP and sets a new password meeting complexity requirements
  Then the system validates the OTP (within 10-minute window)
  And updates the password in the database (hashed with bcrypt)
  And terminates all active sessions for the user
  And sends a confirmation email to the user

Scenario: AC-1.4 - Admin-assisted reset with expired OTP
  Given an Admin generated an OTP for "driver.ahmed" 11 minutes ago
  When the user attempts to enter the expired OTP
  Then the system rejects the OTP with "OTP expired. Contact your administrator for a new code."
  And does NOT reset the password

Scenario: AC-1.5 - Admin without permission attempts reset
  Given a user with role "Depot Officer" (no reset permission)
  When the user attempts to access the admin-assisted reset form
  Then the system returns HTTP 403 Forbidden

Scenario: AC-1.6 - Audit logging for admin-assisted reset
  Given an Admin has triggered a password reset for "driver.ahmed"
  When the reset is completed
  Then the system logs: Admin ID, User ID, timestamp, IP address, justification, verification method
  And the audit entry is immutable and accessible to Tenant Admin
```

### AC-2: Self-Service Password Reset

Given a registered user has forgotten their password,

when the user initiates a self-service reset from the login screen,

then the system shall:

- [ ] Provide a "Forgot Password" option on the login page
- [ ] Accept email or mobile number as identifier
- [ ] Send a reset link via email (valid 15 minutes) when email is available
- [ ] Send a 6-digit OTP via SMS or email (valid 10 minutes) based on identifier / available channel
- [ ] Prompt the user to complete the reset flow
- [ ] Enforce password complexity rules during new password setup
- [ ] Prevent reuse of last 3 passwords
- [ ] Log the password reset event with full details (user ID, timestamp, IP address)
- [ ] Send a confirmation email upon successful reset
- [ ] Terminate all active sessions upon successful reset
- [ ] Enforce rate limiting (max 3 reset requests per hour per user)

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - User initiates forgot password via email
  Given a registered user on the login page
  When the user clicks "Forgot Password"
  And enters their registered email "user@company.com"
  Then the system sends a password reset link to the email (valid 15 minutes)
  And sends a 6-digit OTP to the registered mobile number (valid 10 minutes)
  And displays "If an account exists, a reset link has been sent"

Scenario: AC-2.2 - User initiates forgot password via mobile
  Given a registered user on the login page
  When the user clicks "Forgot Password"
  And enters their registered mobile "+8801712345678"
  Then the system sends a 6-digit OTP to the mobile (valid 10 minutes)
  And sends a reset link to the registered email (valid 15 minutes)

Scenario: AC-2.3 - User completes self-service reset via email link
  Given a user clicked the password reset link from their email
  And the link is within the 15-minute validity window
  When the user enters the SMS OTP, sets a new password meeting complexity requirements, and confirms
  Then the system updates the password (hashed)
  And terminates all active sessions
  And sends a confirmation email
  And redirects to the login page

Scenario: AC-2.4 - Expired reset link rejected
  Given a user received a password reset link 16 minutes ago
  When the user clicks the expired link
  Then the system displays "Reset link expired. Please request a new one."
  And does NOT allow password change

Scenario: AC-2.5 - Rate limiting enforcement
  Given a user has requested 3 password resets within the last hour
  When the user attempts a 4th reset request
  Then the system returns HTTP 429 "Too many reset requests. Please try again later."

Scenario: AC-2.6 - Password history enforcement
  Given a user is resetting their password
  And their last 3 passwords were "Pass1!", "Pass2!", "Pass3!"
  When the user attempts to set password to "Pass1!"
  Then the system rejects with "Cannot reuse your last 3 passwords"

Scenario: AC-2.7 - Non-existent email returns same response
  Given a non-registered email "unknown@company.com"
  When someone enters this email in the forgot password form
  Then the system returns the same "If an account exists, a reset link has been sent" message
  And no email or OTP is actually sent (prevents enumeration)

Scenario: AC-2.8 - Password complexity validation
  Given a user is on the password reset page
  When the user enters "weak" as the new password
  Then the system rejects with complexity requirements displayed
  When the user enters "SecurePass123!" meeting all rules
  Then the system accepts the new password
```

## Functional Requirements

### FR-067-001: Forgot Password (Self-Service Reset Initiation)
- [Critical] The system SHALL provide a “Forgot Password” option on the login interface for all users
- [Critical] The system SHALL require the user to input a registered identifier: Email address or Mobile number
- [Critical] The system SHALL initiate identity verification based on the input method:
  - Send a password reset link via email (valid for 15 minutes), and/or
  - Send a 6-digit OTP via SMS/email (valid for 10 minutes)
- [Critical] The system SHALL require successful OTP verification (where applicable) prior to allowing password reset
- [High] The system SHALL display a password strength indicator during password creation
- [High] The system SHALL send a confirmation notification to the user upon successful password reset
- [High] The system SHALL support password reset via both web and mobile interfaces

### FR-067-002: Authenticated Password Change (Change Password)
- [Critical] The system SHALL allow authenticated users to change their password from their profile/settings section
- [Critical] The system SHALL prompt the user to enter New Password and Confirm Password
- [Critical] The system SHALL validate:
  - Password complexity requirements
  - Password confirmation matches
  - Prevent reuse of last 3 passwords
- [Critical] Upon successful validation:
  - The system SHALL update the password
  - The system SHALL invalidate all previous active sessions
- [High] The system SHALL optionally require OTP verification for password change based on security policy (e.g., high-risk roles or suspicious activity)
- [High] The system SHALL send a notification to the user upon successful password change
- [High] The system SHALL log password change activity including user ID, timestamp, and IP address

### FR-067-003: Admin-Assisted Password Reset
- [Critical] System SHALL allow Super Admin and Tenant Admin to trigger assisted reset
- [Critical] System SHALL require offline identity verification by admin
- [Critical] System SHALL generate 6-digit OTP valid for 10 minutes
- [Critical] System SHALL require admin to provide justification remarks
- [Critical] System SHALL communicate OTP to user (admin provides OTP)
- [Critical] System SHALL allow user to enter OTP to reset password
- [Critical] System SHALL log all assisted resets with:
  - Admin ID
  - User ID
  - Timestamp
  - Justification remarks
  - IP address
- [High] System SHALL require admin approval for sensitive accounts
- [High] System SHALL send notification to user about assisted reset

### FR-067-004: Self-Service Password Reset (Completion)
- [Critical] System SHALL provide "Forgot Password" link on login page
- [Critical] System SHALL require email or mobile number input
- [Critical] System SHALL send password reset link via email (valid 15 minutes)
- [Critical] System SHALL send password reset OTP via SMS (if mobile provided)
- [Critical] System SHALL require OTP verification before allowing password reset
- [Critical] System SHALL enforce password complexity rules:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- [Critical] System SHALL require password confirmation
- [High] System SHALL provide password strength meter
- [High] System SHALL support mobile app password reset

### FR-067-005: Password Reset Process
- [Critical] System SHALL validate reset link/OTP before allowing password change
- [Critical] System SHALL check reset link expiration (15 minutes)
- [Critical] System SHALL validate password complexity
- [Critical] System SHALL prevent reuse of last 3 passwords
- [Critical] System SHALL update password in database (hashed)
- [Critical] System SHALL terminate all active user sessions
- [Critical] System SHALL require user to login with new password
- [High] System SHALL send confirmation email after successful reset

### FR-067-006: Password Reset Logging
- [Critical] System SHALL log all password reset attempts:
  - User ID
  - Method (admin-assisted|self-service)
  - Timestamp
  - IP address
  - Device ID
  - Status (success|failure)
  - Failure reason (if applicable)
- [Critical] System SHALL log admin-assisted resets with admin ID and justification
- [High] System SHALL provide reset history per user
- [High] System SHALL generate audit reports

### FR-067-007: Rate Limiting & Security
- [Critical] System SHALL enforce rate limiting (max 3 reset requests per hour per user)
- [Critical] System SHALL block reset requests after rate limit exceeded
- [Critical] System SHALL validate reset link/OTP uniqueness
- [High] System SHALL detect suspicious reset patterns
- [High] System SHALL require additional verification for suspicious activity

## Business Rules

### BR-067-001: Admin-Assisted Reset
- Only Super Admin and Tenant Admin can trigger assisted reset
- Admin must verify user identity offline before reset
- OTP valid for 10 minutes
- Admin must provide justification remarks (mandatory)
- All assisted resets logged for audit

### BR-067-002: Self-Service Reset
- Reset link valid for 15 minutes
- OTP valid for 10 minutes
- Maximum 3 reset requests per hour per user
- Password must meet complexity requirements
- Cannot reuse last 3 passwords

### BR-067-003: Password Complexity
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### BR-067-004: Session Management
- All active sessions terminated on password reset
- User must login with new password
- Previous sessions cannot be used after reset

## Data Model

### Password Reset Entity
```yaml
PasswordReset:
  reset_id: string (unique)
  user_id: string (FK)
  reset_token: string (unique, hashed)
  otp_code: string (hashed, optional)
  reset_method: string (admin_assisted|self_service)
  admin_id: string (FK, optional - for admin-assisted)
  justification: string (optional - for admin-assisted)
  status: string (pending|completed|expired|cancelled)
  created_at: datetime
  expires_at: datetime
  completed_at: datetime (optional)
  ip_address: string
  device_id: string
```

### Password Reset Log Entity
```yaml
PasswordResetLog:
  log_id: string (unique)
  reset_id: string (FK)
  user_id: string (FK)
  reset_method: string
  admin_id: string (FK, optional)
  status: string (success|failure)
  ip_address: string
  device_id: string
  user_agent: string
  timestamp: datetime
  failure_reason: string (optional)
```

## UI/UX Requirements

### Forgot Password Page
- Email/mobile input field
- "Send Reset Link" button
- Instructions text
- Rate limit warning (if applicable)

### Password Reset Page
- Reset link validation
- OTP input fields (email + SMS)
- New password input with strength meter
- Password confirmation input
- "Reset Password" button
- Expiration countdown

### Admin-Assisted Reset Form
- User search/selection
- Identity verification checklist
- Justification textarea (mandatory)
- "Generate Reset OTP" button
- OTP display (for admin to communicate)
- Reset completion confirmation

### Change Password (Authenticated)
- Located under Profile/Settings
- New password input with strength meter
- Confirm password input
- (Optional) OTP prompt if required by security policy
- "Change Password" button
- Success notification and forced re-login (sessions invalidated)

## API Endpoints

### POST /api/v1/auth/password/reset/request
- Request password reset (self-service)
- Request body: email or mobile
- Response: reset_token, expires_at

### POST /api/v1/auth/password/reset/verify
- Verify reset OTP
- Request body: reset_token, email_otp, sms_otp
- Response: verified (boolean)

### POST /api/v1/auth/password/reset
- Reset password
- Request body: reset_token, new_password, password_confirm
- Response: success message

### POST /api/v1/auth/password/change
- Authenticated change password (Change Password)
- Requires: authenticated session
- Request body: new_password, confirm_password, otp? (optional, if policy requires)
- Response: success message (or 202 OTP required)

### POST /api/v1/admin/users/{user_id}/password/reset
- Admin-assisted password reset
- Request body: justification, verify_identity (boolean)
- Response: otp_code, expires_at

### GET /api/v1/admin/password-reset/logs
- Get password reset logs
- Query params: user_id, date_from, date_to, method
- Response: array of log entries

## Non-Functional Requirements

- **Performance**: Reset link generation < 200ms
- **Security**: Reset tokens must be cryptographically secure
- **Scalability**: Support 1000+ concurrent reset requests
- **Availability**: Password reset service must be 99.9% available
- **Rate Limiting**: Max 3 requests per hour per user

## Testing Scenarios

### TC-067-001: Self-Service Password Reset
1. User clicks "Forgot Password"
2. User enters email
3. Verify reset link sent
4. User clicks reset link
5. User verifies OTPs
6. User sets new password
7. Verify password updated
8. Verify all sessions terminated

### TC-067-002: Admin-Assisted Reset
1. Admin selects user for reset
2. Admin verifies identity offline
3. Admin provides justification
4. System generates OTP
5. Admin communicates OTP to user
6. User enters OTP and sets password
7. Verify password updated
8. Verify reset logged

### TC-067-003: Reset Link Expiration
1. Request password reset
2. Wait 15 minutes (or simulate)
3. Attempt to use reset link
4. Verify reset rejected (expired)

### TC-067-004: Rate Limiting
1. Request password reset 3 times within 1 hour
2. Attempt 4th reset request
3. Verify request blocked (rate limit)

### TC-067-005: Password Complexity
1. Attempt to set weak password
2. Verify validation error
3. Set password meeting complexity rules
4. Verify password accepted

---

## Unit Tests

### UT-PR-001: Self-Service Reset Initiation
```python
def test_forgot_password_with_email():
    user = create_active_user(email='user@company.com', mobile='+8801712345678')
    
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': 'user@company.com'
    })
    
    assert response.status_code == 200
    assert 'reset link has been sent' in response.json()['message']
    
    token = PasswordReset.objects.filter(user=user).first()
    assert token is not None
    assert token.reset_method == 'self_service'
    assert token.expires_at > datetime.now()

def test_forgot_password_with_mobile():
    user = create_active_user(mobile='+8801712345678')
    
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': '+8801712345678'
    })
    
    assert response.status_code == 200
    assert_sms_sent_to('+8801712345678')

def test_forgot_password_nonexistent_email():
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': 'nonexistent@company.com'
    })
    
    assert response.status_code == 200
    assert 'reset link has been sent' in response.json()['message']

def test_forgot_password_rate_limited():
    user = create_active_user(email='user@co.com')
    
    for _ in range(3):
        client.post('/api/v1/auth/password/reset/request', {'identifier': 'user@co.com'})
    
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': 'user@co.com'
    })
    
    assert response.status_code == 429
    assert 'Too many reset requests' in response.json()['message']
```

### UT-PR-002: Self-Service Reset Completion
```python
def test_self_service_reset_success():
    user = create_active_user(email='user@co.com')
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'NewSecurePass789!',
        'password_confirm': 'NewSecurePass789!'
    })
    
    assert response.status_code == 200
    assert Session.objects.filter(user=user, status='Active').count() == 0
    assert_email_sent_to('user@co.com', subject_contains='Password Reset Confirmation')

def test_self_service_reset_expired_link():
    user = create_active_user()
    token = create_password_reset_token(user, expires_at=datetime.now() - timedelta(minutes=1))
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'NewSecurePass789!',
        'password_confirm': 'NewSecurePass789!'
    })
    
    assert response.status_code == 410
    assert 'expired' in response.json()['message']

def test_self_service_reset_password_history():
    user = create_active_user()
    set_password_history(user, ['OldPass1!', 'OldPass2!', 'OldPass3!'])
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'OldPass1!',
        'password_confirm': 'OldPass1!'
    })
    
    assert response.status_code == 400
    assert 'Cannot reuse' in response.json()['message']

def test_self_service_reset_weak_password():
    user = create_active_user()
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'weak',
        'password_confirm': 'weak'
    })
    
    assert response.status_code == 400
    assert response.json()['code'] == 'PWD-400-COMPLEXITY'

def test_self_service_reset_mismatched_passwords():
    user = create_active_user()
    token = create_password_reset_token(user)
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'SecurePass123!',
        'password_confirm': 'DifferentPass456!'
    })
    
    assert response.status_code == 400
    assert 'do not match' in response.json()['message']
```

### UT-PR-003: OTP Verification
```python
def test_otp_verification_success():
    user = create_active_user()
    reset = create_password_reset_token(user, otp_code='123456')
    
    response = client.post('/api/v1/auth/password/reset/verify', {
        'reset_token': reset.reset_token,
        'otp': '123456'
    })
    
    assert response.status_code == 200
    assert response.json()['verified'] is True

def test_otp_verification_wrong_code():
    user = create_active_user()
    reset = create_password_reset_token(user, otp_code='123456')
    
    response = client.post('/api/v1/auth/password/reset/verify', {
        'reset_token': reset.reset_token,
        'otp': '999999'
    })
    
    assert response.status_code == 400
    assert response.json()['verified'] is False

def test_otp_max_attempts():
    user = create_active_user()
    reset = create_password_reset_token(user, otp_code='123456')
    
    for _ in range(3):
        client.post('/api/v1/auth/password/reset/verify', {
            'reset_token': reset.reset_token,
            'otp': '999999'
        })
    
    response = client.post('/api/v1/auth/password/reset/verify', {
        'reset_token': reset.reset_token,
        'otp': '123456'
    })
    
    assert response.status_code == 429
    assert 'Maximum attempts exceeded' in response.json()['message']
```

### UT-PR-004: Admin-Assisted Reset
```python
def test_admin_assisted_reset_initiation():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='driver@co.com')
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'User forgot password, verified via phone call to registered number',
        'verify_identity': True
    })
    
    assert response.status_code == 200
    assert 'otp_code' in response.json()
    assert len(response.json()['otp_code']) == 6
    assert 'expires_at' in response.json()

def test_admin_assisted_reset_missing_justification():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    client.force_authenticate(admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'short',
        'verify_identity': True
    })
    
    assert response.status_code == 400
    assert 'minimum 10 characters' in response.json()['message']

def test_admin_assisted_reset_no_permission():
    non_admin = create_user_with_role('Depot Officer')
    user = create_active_user()
    client.force_authenticate(non_admin)
    
    response = client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'User forgot password, verified in person',
        'verify_identity': True
    })
    
    assert response.status_code == 403

def test_admin_assisted_reset_audit_log():
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user()
    client.force_authenticate(admin)
    
    client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'Verified in person at depot office',
        'verify_identity': True
    })
    
    logs = PasswordResetLog.objects.filter(user=user, reset_method='admin_assisted')
    assert logs.count() == 1
    assert logs.first().admin_id == admin.id
    assert logs.first().justification is not None
```

### UT-PR-005: Session Termination
```python
def test_sessions_terminated_on_reset():
    user = create_active_user()
    create_session(user=user, status='Active', device='Chrome')
    create_session(user=user, status='Active', device='Mobile')
    
    assert Session.objects.filter(user=user, status='Active').count() == 2
    
    perform_password_reset(user, new_password='NewPass123!')
    
    assert Session.objects.filter(user=user, status='Active').count() == 0
    assert Session.objects.filter(user=user, status='Revoked').count() == 2

def test_old_token_rejected_after_reset():
    user = create_active_user()
    old_token = generate_access_token(user)
    perform_password_reset(user, new_password='NewPass123!')
    
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {old_token}')
    response = client.get('/api/v1/dashboard')
    
    assert response.status_code == 401
```

### UT-PR-006: Password Reset Logging
```python
def test_successful_reset_logged():
    user = create_active_user(email='user@co.com')
    perform_self_service_reset(user)
    
    logs = PasswordResetLog.objects.filter(user=user, status='success')
    assert logs.count() == 1
    assert logs.first().reset_method == 'self_service'
    assert logs.first().ip_address is not None
    assert logs.first().device_id is not None

def test_failed_reset_logged():
    user = create_active_user()
    token = create_password_reset_token(user, expires_at=datetime.now() - timedelta(minutes=1))
    
    client.post('/api/v1/auth/password/reset', {
        'reset_token': token.reset_token,
        'new_password': 'NewPass123!',
        'password_confirm': 'NewPass123!'
    })
    
    logs = PasswordResetLog.objects.filter(user=user, status='failure')
    assert logs.count() == 1
    assert logs.first().failure_reason == 'token_expired'

def test_reset_logs_queryable():
    admin = create_user_with_role('Tenant Admin')
    client.force_authenticate(admin)
    
    response = client.get('/api/v1/admin/password-reset/logs?method=self_service')
    assert response.status_code == 200
    assert all(l['method'] == 'self_service' for l in response.json()['results'])
```

---

## Additional Unit Tests: Authenticated Change Password

### UT-CP-001: Change Password Success (No OTP)
```python
def test_change_password_success_no_otp():
    user = create_active_user(email='user@co.com')
    token = authenticate_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    response = client.post('/api/v1/auth/password/change', {
        'new_password': 'NewSecurePass789!',
        'confirm_password': 'NewSecurePass789!'
    })

    assert response.status_code == 200
    assert response.json()['success'] is True
    assert Session.objects.filter(user=user, status='Active').count() == 0

def test_change_password_mismatch_rejected():
    user = create_active_user()
    token = authenticate_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    response = client.post('/api/v1/auth/password/change', {
        'new_password': 'SecurePass123!',
        'confirm_password': 'DifferentPass456!'
    })

    assert response.status_code == 400
    assert 'do not match' in response.json()['message']
```

### UT-CP-002: Optional OTP for High-Risk Roles
```python
def test_change_password_requires_otp_for_high_risk_role():
    admin = create_user_with_role('Tenant Admin')
    token = authenticate_user(admin)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    response = client.post('/api/v1/auth/password/change', {
        'new_password': 'NewSecurePass789!',
        'confirm_password': 'NewSecurePass789!'
    })

    assert response.status_code == 202
    assert response.json()['code'] == 'PWD-202-OTP-REQUIRED'
```

## UI Tests

### UI-PR-001: Forgot Password Page Tests
```javascript
describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.get('[data-testid="forgot-password-link"]').click();
  });

  it('should display forgot password form', () => {
    cy.get('[data-testid="identifier-input"]').should('be.visible');
    cy.get('[data-testid="send-reset-btn"]').should('be.visible');
    cy.get('[data-testid="instructions-text"]').should('be.visible');
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

  it('should show rate limit warning after 3 attempts', () => {
    for (let i = 0; i < 3; i++) {
      cy.get('[data-testid="identifier-input"]').clear().type('user@company.com');
      cy.get('[data-testid="send-reset-btn"]').click();
      cy.wait(500);
    }
    cy.get('[data-testid="identifier-input"]').clear().type('user@company.com');
    cy.get('[data-testid="send-reset-btn"]').click();
    cy.get('[data-testid="rate-limit-warning"]').should('be.visible');
  });

  it('should show same message for non-existent email', () => {
    cy.get('[data-testid="identifier-input"]').type('nonexistent@company.com');
    cy.get('[data-testid="send-reset-btn"]').click();
    cy.get('[data-testid="success-message"]')
      .should('contain', 'If an account exists, a reset link has been sent');
  });
});
```

### UI-PR-002: Password Reset Page Tests
```javascript
describe('Password Reset Page', () => {
  it('should display reset form fields', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').should('be.visible');
    cy.get('[data-testid="new-password-input"]').should('be.visible');
    cy.get('[data-testid="confirm-password-input"]').should('be.visible');
    cy.get('[data-testid="password-strength-meter"]').should('be.visible');
    cy.get('[data-testid="reset-password-btn"]').should('be.visible');
    cy.get('[data-testid="expiration-countdown"]').should('be.visible');
  });

  it('should show password strength meter', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="new-password-input"]').type('weak');
    cy.get('[data-testid="password-strength-meter"]').should('have.class', 'weak');
    
    cy.get('[data-testid="new-password-input"]').clear().type('SecurePass123!');
    cy.get('[data-testid="password-strength-meter"]').should('have.class', 'strong');
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
    cy.get('[data-testid="complexity-error"]').should('be.visible');
  });

  it('should validate password confirmation matches', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="new-password-input"]').type('SecurePass123!');
    cy.get('[data-testid="confirm-password-input"]').type('DifferentPass');
    cy.get('[data-testid="reset-password-btn"]').click();
    cy.get('[data-testid="mismatch-error"]').should('contain', 'do not match');
  });

  it('should reject reused password', () => {
    cy.visit('/reset-password?token=valid-reset-token');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="new-password-input"]').type('OldPassword1!');
    cy.get('[data-testid="confirm-password-input"]').type('OldPassword1!');
    cy.get('[data-testid="reset-password-btn"]').click();
    cy.get('[data-testid="history-error"]').should('contain', 'Cannot reuse');
  });
});
```

### UI-PR-003: Admin-Assisted Reset Interface Tests
```javascript
describe('Admin-Assisted Reset Interface', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="reset-password-btn"]').click();
  });

  it('should display assisted reset form', () => {
    cy.get('[data-testid="identity-verification-checklist"]').should('be.visible');
    cy.get('[data-testid="justification-textarea"]').should('be.visible');
    cy.get('[data-testid="generate-otp-btn"]').should('be.visible');
  });

  it('should require justification before OTP generation', () => {
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="justification-error"]').should('contain', 'minimum 10 characters');
  });

  it('should generate and display OTP', () => {
    cy.get('[data-testid="justification-textarea"]')
      .type('User forgot password, verified via phone call');
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="otp-display"]').should('be.visible');
    cy.get('[data-testid="otp-display"]').invoke('text').should('match', /\d{6}/);
    cy.get('[data-testid="otp-warning"]')
      .should('contain', 'Communicate this OTP to the user offline');
  });

  it('should show OTP expiry timer', () => {
    cy.get('[data-testid="justification-textarea"]')
      .type('Verified in person at depot');
    cy.get('[data-testid="generate-otp-btn"]').click();
    cy.get('[data-testid="otp-timer"]').should('contain', '10:00');
  });

  it('should show reset completion confirmation', () => {
    cy.get('[data-testid="justification-textarea"]')
      .type('Verified in person at depot');
    cy.get('[data-testid="generate-otp-btn"]').click();
    // Simulate user completing reset
    cy.get('[data-testid="reset-status"]').should('contain', 'Pending user action');
  });
});

describe('Admin-Assisted Reset - Permission Control', () => {
  it('should show reset button for admin users', () => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="reset-password-btn"]').should('be.visible');
  });

  it('should hide reset button for non-admin users', () => {
    cy.loginAs('depotOfficer');
    cy.visit('/admin/users/user-123');
    cy.get('[data-testid="reset-password-btn"]').should('not.exist');
  });
});
```

### UI-PR-004: Password Reset Logs View Tests
```javascript
describe('Password Reset Logs', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/admin/password-reset/logs');
  });

  it('should display reset log list', () => {
    cy.get('[data-testid="reset-log-table"]').should('be.visible');
    cy.get('[data-testid="col-user"]').should('be.visible');
    cy.get('[data-testid="col-method"]').should('be.visible');
    cy.get('[data-testid="col-status"]').should('be.visible');
    cy.get('[data-testid="col-timestamp"]').should('be.visible');
  });

  it('should filter by method', () => {
    cy.get('[data-testid="filter-method"]').select('admin_assisted');
    cy.get('[data-testid="reset-log-row"]').each(($row) => {
      cy.wrap($row).find('[data-testid="method-badge"]').should('contain', 'Admin-Assisted');
    });
  });

  it('should filter by date range', () => {
    cy.get('[data-testid="filter-date-from"]').type('2026-03-01');
    cy.get('[data-testid="filter-date-to"]').type('2026-04-07');
    cy.get('[data-testid="apply-filters-btn"]').click();
    cy.get('[data-testid="reset-log-row"]').should('have.length.greaterThan', 0);
  });
});
```

---

## UI Tests: Change Password

### UI-CP-001: Change Password Page (Authenticated)
```javascript
describe('Change Password (Authenticated)', () => {
  beforeEach(() => {
    cy.loginAs('tenantAdmin');
    cy.visit('/profile/settings/security');
  });

  it('should display change password form', () => {
    cy.get('[data-testid="new-password-input"]').should('be.visible');
    cy.get('[data-testid="confirm-password-input"]').should('be.visible');
    cy.get('[data-testid="password-strength-meter"]').should('be.visible');
    cy.get('[data-testid="change-password-btn"]').should('be.visible');
  });

  it('should change password successfully', () => {
    cy.get('[data-testid="new-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="confirm-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="change-password-btn"]').click();
    cy.get('[data-testid="success-message"]').should('contain', 'Password changed');
    cy.url().should('include', '/login'); // forced re-login after session invalidation
  });

  it('should require OTP for high-risk roles when policy enabled', () => {
    cy.loginAs('superAdmin');
    cy.visit('/profile/settings/security');
    cy.get('[data-testid="new-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="confirm-password-input"]').type('NewSecurePass789!');
    cy.get('[data-testid="change-password-btn"]').click();
    cy.get('[data-testid="otp-modal"]').should('be.visible');
  });
});
```

## Integration Tests

### IT-PR-001: End-to-End Self-Service Reset
```python
def test_e2e_self_service_reset():
    """Full flow: User forgot password → reset link → OTP → new password → sessions terminated."""
    user = create_active_user(email='user@co.com', mobile='+8801712345678')
    create_session(user=user, status='Active')
    old_password_hash = user.password
    
    # Step 1: Request reset
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': 'user@co.com'
    })
    assert response.status_code == 200
    assert_email_sent_to('user@co.com', subject_contains='Password Reset')
    assert_sms_sent_to('+8801712345678')
    
    # Step 2: Get token and OTP
    reset = PasswordReset.objects.get(user=user)
    
    # Step 3: Verify OTP
    verify_response = client.post('/api/v1/auth/password/reset/verify', {
        'reset_token': reset.reset_token,
        'otp': reset.otp_code
    })
    assert verify_response.status_code == 200
    
    # Step 4: Complete reset
    reset_response = client.post('/api/v1/auth/password/reset', {
        'reset_token': reset.reset_token,
        'new_password': 'BrandNewPass456!',
        'password_confirm': 'BrandNewPass456!'
    })
    assert reset_response.status_code == 200
    
    # Step 5: Verify
    user.refresh_from_db()
    assert user.password != old_password_hash
    assert Session.objects.filter(user=user, status='Active').count() == 0
    assert_email_sent_to('user@co.com', subject_contains='Password Reset Confirmation')
    
    log = PasswordResetLog.objects.get(user=user, status='success')
    assert log.reset_method == 'self_service'
```

### IT-PR-002: End-to-End Admin-Assisted Reset
```python
def test_e2e_admin_assisted_reset():
    """Full flow: Admin initiates → generates OTP → user resets → sessions terminated."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='driver@co.com')
    create_session(user=user, status='Active')
    old_password_hash = user.password
    client.force_authenticate(admin)
    
    # Step 1: Admin initiates
    init_response = client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'Driver forgot password, verified via phone call to registered number',
        'verify_identity': True
    })
    assert init_response.status_code == 200
    otp = init_response.json()['otp_code']
    
    # Step 2: User enters OTP and resets
    client.logout()
    reset_response = client.post('/api/v1/auth/password/reset', {
        'reset_token': PasswordReset.objects.get(user=user).reset_token,
        'otp': otp,
        'new_password': 'NewDriverPass123!',
        'password_confirm': 'NewDriverPass123!'
    })
    assert reset_response.status_code == 200
    
    # Step 3: Verify
    user.refresh_from_db()
    assert user.password != old_password_hash
    assert Session.objects.filter(user=user, status='Active').count() == 0
    
    log = PasswordResetLog.objects.get(user=user, reset_method='admin_assisted')
    assert log.admin_id == admin.id
    assert log.status == 'success'
```

### IT-PR-003: Rate Limiting Across Methods
```python
def test_rate_limiting_across_self_service():
    user = create_active_user(email='user@co.com')
    
    for _ in range(3):
        client.post('/api/v1/auth/password/reset/request', {'identifier': 'user@co.com'})
    
    response = client.post('/api/v1/auth/password/reset/request', {
        'identifier': 'user@co.com'
    })
    assert response.status_code == 429

def test_admin_assisted_bypasses_self_service_rate_limit():
    """Admin-assisted reset is a separate flow and not subject to self-service rate limits."""
    admin = create_user_with_role('Tenant Admin')
    user = create_active_user(email='user@co.com')
    
    for _ in range(3):
        client.post('/api/v1/auth/password/reset/request', {'identifier': 'user@co.com'})
    
    client.force_authenticate(admin)
    response = client.post(f'/api/v1/admin/users/{user.id}/password/reset', {
        'justification': 'User is rate-limited, admin assisting directly',
        'verify_identity': True
    })
    assert response.status_code == 200
```

### IT-PR-004: Token and OTP Uniqueness
```python
def test_only_latest_token_valid():
    user = create_active_user(email='user@co.com')
    
    client.post('/api/v1/auth/password/reset/request', {'identifier': 'user@co.com'})
    first_reset = PasswordReset.objects.filter(user=user).order_by('-created_at').first()
    
    client.post('/api/v1/auth/password/reset/request', {'identifier': 'user@co.com'})
    
    response = client.post('/api/v1/auth/password/reset', {
        'reset_token': first_reset.reset_token,
        'new_password': 'NewPass123!',
        'password_confirm': 'NewPass123!'
    })
    assert response.status_code == 400
    assert 'invalid' in response.json()['message'].lower()
```

---

## Integration Tests: Change Password

### IT-CP-001: End-to-End Change Password
```python
def test_e2e_change_password_invalidates_sessions():
    user = create_active_user(email='user@co.com')
    create_session(user=user, status='Active')
    token = authenticate_user(user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    response = client.post('/api/v1/auth/password/change', {
        'new_password': 'BrandNewPass456!',
        'confirm_password': 'BrandNewPass456!'
    })
    assert response.status_code == 200
    assert Session.objects.filter(user=user, status='Active').count() == 0
```

## Edge Cases

### Self-Service Reset Edge Cases
1. **Reset for deactivated account**: System returns same generic message (no account enumeration) but does not send email/OTP
2. **Reset during active session**: All sessions terminated immediately upon successful reset; in-progress API requests may complete
3. **Concurrent reset requests**: Only the most recent token/OTP is valid; previous ones are invalidated
4. **Reset link used twice**: Second use returns "Link already used" error
5. **Password complexity edge**: Password meets complexity but is still rejected due to mismatch confirmation or password history rules
6. **Reset with email that exists in multiple tenants**: Reset scoped to tenant context; each tenant account resets independently
7. **Unicode in password**: System accepts Unicode characters in passwords beyond the minimum requirements

### Admin-Assisted Reset Edge Cases
8. **Admin resets own password**: Allowed — admin can self-service OR use another admin for assisted reset
9. **Admin-assisted reset for locked account**: System allows reset and unlocks the account upon completion
10. **Multiple OTP generations in sequence**: Each new OTP invalidates the previous one; only the latest OTP works
11. **Admin-assisted reset while user is mid-self-service reset**: Admin-assisted reset takes precedence; self-service token invalidated
12. **OTP brute-force prevention**: After 3 incorrect OTP attempts, the reset token is invalidated; admin must generate a new one

### Session & Security Edge Cases
13. **Password change email delivery failure**: Reset still succeeds; email failure logged but does not block the action
14. **Reset from different IP than request**: Allowed — user may request from desktop and complete from mobile
15. **Reset token in URL manipulation**: Tokens are 64-char hex, cryptographically random; guessing is computationally infeasible

---

## Test Coverage Requirements

| Test Category | Target Coverage | Priority |
|---|---|---|
| Unit Tests - Self-Service Initiation | 95% | Critical |
| Unit Tests - Self-Service Completion | 95% | Critical |
| Unit Tests - OTP Verification | 95% | Critical |
| Unit Tests - Admin-Assisted Reset | 95% | Critical |
| Unit Tests - Session Termination | 90% | Critical |
| Unit Tests - Logging | 90% | High |
| UI Tests - Forgot Password Page | 90% | High |
| UI Tests - Password Reset Page | 90% | Critical |
| UI Tests - Admin-Assisted Interface | 90% | High |
| UI Tests - Reset Logs View | 85% | Medium |
| Integration Tests - E2E Flows | 85% | Critical |
| Integration Tests - Rate Limiting | 90% | High |
| Edge Case Coverage | 80% | High |

---

## Dependencies

- **US-005**: User Invitation & Activation (consolidated scope — password reset also in US-005)
- **US-006**: OTP Verification System (OTP generation and verification)
- **Email Service**: For reset link and confirmation email delivery
- **SMS Gateway**: For OTP delivery to mobile

## Definition of Done

### Functional Requirements
- [ ] Admin-assisted reset implemented (OTP generation, verification, justification, audit)
- [ ] Self-service reset implemented (forgot password, reset link, OTP, new password)
- [ ] Password complexity validation implemented (8+ chars, upper/lower/number/special)
- [ ] Password history enforcement implemented (last 3 passwords)
- [ ] Session termination on reset implemented (all active sessions revoked)
- [ ] Rate limiting implemented (max 3 self-service requests per hour per user)
- [ ] Reset logging and audit trail implemented
- [ ] Confirmation email sent after successful reset
- [ ] Password strength meter on reset page

### Test Requirements
- [ ] Unit tests written and passing (≥ 90% coverage)
- [ ] UI tests written and passing (Cypress)
- [ ] Integration tests written and passing (E2E flows)
- [ ] Edge case scenarios tested
- [ ] Rate limiting and OTP brute-force prevention tested

### Documentation & Review
- [ ] API documentation updated for all endpoints
- [ ] Module specifications aligned (`user-tenant-management.md`, `authentication-security.md`)
- [ ] Code reviewed and approved
- [ ] Security review completed for token generation and session termination

---

**Source Documents**:
- PRD Section 6.2.6: Password & Account Reset
- US-005: User Invitation & Activation (consolidated scope)

**Last Updated**: April 7, 2026  
**Status**: Pending Review

