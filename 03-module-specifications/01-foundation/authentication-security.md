---
module: 01-foundation
specification: Authentication & Security
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.1.1, 6.1.2, 6.1.3
last_updated: 2026-04-07
related_stories: US-001, US-002, US-003, US-005, US-008
---

# Authentication & Security Specification

## Overview

The DFMS platform implements a comprehensive authentication and security framework designed for multi-tenant SaaS environments. The system provides secure user authentication, multi-factor authentication for privileged users, session management, and comprehensive audit logging to protect against unauthorized access while maintaining usability for users with varying technical literacy.

---

## 1. Authentication Architecture

### 1.1 Login Flow (3-Step)

Most users authenticate using a **3-step login flow**: Identity → OTP Verification → Password.

**Exception (Phase 1): Driver SMS Quick Login (US-005)**  
Driver users may authenticate via a mobile interface link + system-generated password (no OTP required in Phase 1) to support low digital literacy users.

```
Step 1: Enter Email or Phone Number
    ↓ System validates identity exists
Step 2: OTP Verification
    ↓ System sends 6-digit OTP to email/SMS
    ↓ User enters OTP code
Step 3: Enter Password
    ↓ System validates password
    ↓ Session created → Redirect to dashboard
```

**Login Credentials**:
- **Identity**: Registered email address OR phone number (unique per tenant)
- **OTP**: 6-digit code sent to the registered email/phone
- **Password**: User's account password

**Why 3-Step?**
- OTP before password prevents brute-force password attacks
- Confirms the user has access to the registered email/phone
- Every login is inherently multi-factor (identity + OTP + password)

### 1.2 Login Flow Detail

```typescript
async function loginFlow(identifier: string): Promise<LoginSession> {
    // Step 1: Identify user by email or phone
    const user = await findUserByEmailOrPhone(identifier);
    if (!user) {
        throw new Error('No account found with this email/phone.');
    }
    if (user.status !== 'Active') {
        throw new Error('Account is inactive or suspended.');
    }

    // Step 2: Send OTP for verification
    const otp = generateOTP();  // 6-digit code
    await sendOTP(user, otp);   // Via email or SMS based on identifier type
    // User enters OTP on verification screen
    const otpValid = await verifyOTP(user.user_id, inputOTP);
    if (!otpValid) {
        throw new Error('Invalid OTP. Please try again.');
    }

    // Step 3: Validate password
    const passwordValid = await bcrypt.compare(inputPassword, user.password_hash);
    if (!passwordValid) {
        await incrementFailedAttempts(user.user_id);
        throw new Error('Invalid password.');
    }

    // Success: Create session
    return await createSession(user);
}
```

### 1.3 Tenant Admin First Login

When Super Admin creates a new tenant, the Tenant Admin receives:
1. **Admin Portal URL** (e.g., `https://admin.dfms.app`)
2. **Account credentials** via email:
   - Registered email address
   - Temporary password (must be changed on first login)

**First Login Flow**:
```
1. Tenant Admin opens Admin Portal URL from email
2. Enters registered email address
3. Receives OTP on the registered email
4. Enters OTP code
5. Enters temporary password (from email)
6. System prompts: "Change your password"
7. Sets new permanent password
8. Redirected to Admin Dashboard
```

**First Login Email Template**:
```
Subject: Your DFMS Admin Account is Ready

Welcome to DFMS!

Your organization [Organization Name] has been set up on the DFMS platform.

Login Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Portal URL: https://admin.dfms.app
Email: [admin@nourish.com]
Temporary Password: [auto-generated]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

To log in:
1. Open the portal URL above
2. Enter your email address
3. Enter the OTP sent to your email
4. Enter the temporary password above
5. You will be asked to set a new password

This temporary password expires in 72 hours.

If you did not request this account, please ignore this email.
```

### 1.4 Credential Management

**Identity (Email / Phone)**:
- Email or phone number serves as the login identifier
- Must be unique per tenant
- Case-insensitive for email (stored as lowercase)
- Phone format: E.164 (e.g., +8801XXXXXXXXX)

**Password Requirements:**
- Minimum 8 characters
- Must contain: uppercase letter, lowercase letter, number, special character
- Hashed using bcrypt with tenant-specific salt
- Password history: Last 3 passwords cannot be reused
- Expiration: 90 days (configurable per tenant)
- First login with temporary password forces immediate change

**Password Storage:**
```typescript
{
  password_hash: string,        // bcrypt hash
  password_salt: string,        // tenant-specific salt
  last_password_change: DateTime,
  password_must_change: boolean, // true for first login / admin reset
  password_history: Array<{hash: string, changed_at: DateTime}>
}
```

---

## 2. Account Lockout Mechanism

### 2.1 Failed Login Tracking

The system implements automatic account lockout to prevent brute-force attacks:

**Lockout Policy:**
- **Threshold**: 3 consecutive failed attempts within 15-minute window
- **Lockout Duration**: 30 minutes (1800 seconds)
- **Counter Reset**: On successful login or after 15-minute window expires

**Implementation Logic:**
```
IF failed_login_count >= 3 AND last_failed_login_at within last 15 minutes:
    locked_until = NOW() + 30 minutes
    account_status = 'Locked'
    send_notification(user.email, 'Account Locked')
```

### 2.2 Login Attempt Logging

Every login attempt (successful or failed) is logged with:
- Timestamp
- User ID / Username (attempted)
- IP Address
- Device ID / User Agent
- Success/Failure status
- Failure reason (if applicable)
- Geolocation (if available)

**Login Attempt Entity:**
```typescript
LoginAttempt {
  attempt_id: UUID
  user_id: UUID | null
  username: string
  ip_address: string
  device_id: string
  user_agent: string
  success: boolean
  failure_reason: enum ['InvalidPassword', 'AccountLocked', 'AccountInactive', 'InvalidUsername']
  attempted_at: DateTime
  geolocation: {country, city, lat, lng} | null
}
```

### 2.3 Admin Unlock

Administrators can manually unlock locked accounts after offline verification:

**Unlock Requirements:**
- Admin must have 'UserManagement.Unlock' permission
- Justification/remarks mandatory (minimum 10 characters)
- Verification method documented (Phone, Email, In-person)
- Unlocked user receives email notification

**Unlock Process:**
1. Admin searches locked accounts dashboard
2. Performs offline identity verification (phone/email/in-person)
3. Submits unlock request with justification
4. System resets `failed_login_count` to 0
5. System clears `locked_until` timestamp
6. System logs unlock action with admin ID
7. User can immediately attempt login

**Audit Log Entry:**
```typescript
{
  action: 'AccountUnlock',
  admin_id: UUID,
  affected_user_id: UUID,
  justification: string,
  verification_method: enum ['Phone', 'Email', 'InPerson'],
  unlocked_at: DateTime
}
```

---

## 3. OTP Verification (Built into Login)

### 3.1 OTP Overview

OTP verification is **mandatory for all users** as part of the 3-step login flow (see Section 1.1), except:
- **Driver SMS Quick Login** (US-005) where OTP is not required in Phase 1
- **Invitation activation flows** where OTP may be **optional** depending on the invitation’s selected **OTP type** (None / Email / SMS) as defined in US-005

**Applicability:**
- **Required for**: All user types (Super Admin, Tenant Admin, Department Admin, Operational User)
- **Delivery Methods**: Email (if logged in via email), SMS (if logged in via phone)

### 3.2 OTP Generation

**OTP Specifications:**
- **Code Length**: 6 digits
- **Validity**: 10 minutes (600 seconds)
- **Delivery**: Email (if identifier is email), SMS (if identifier is phone)
- **Resend Cooldown**: 2 minutes between resend requests
- **Max Resends**: 3 per login session

**OTP Generation Logic:**
```typescript
function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
```

### 3.3 OTP Verification Flow

```
1. User enters email/phone (Step 1 of login)
2. System generates 6-digit OTP
3. System sends OTP to email or SMS (based on identifier type)
4. User enters OTP within 10 minutes
5. If valid: Proceed to password step (Step 3)
6. If invalid: Decrement attempts, show error
7. After 3 failed OTP attempts: Block for 15 minutes
```

**Retry Policy:**
- Maximum 3 OTP verification attempts per login session
- User can request OTP resend after 2-minute cooldown (max 3 resends)
- After 3 failed attempts: 15-minute lockout before retry

### 3.4 Trusted Devices

To reduce MFA friction for regular users:

**Trusted Device Mechanism:**
- After successful MFA, option to "Remember this device for 30 days"
- Device identified by: Browser fingerprint + IP subnet
- Trusted device record expires after 30 days
- User can view/revoke trusted devices in profile settings

**Trusted Device Entity:**
```typescript
TrustedDevice {
  device_id: UUID
  user_id: UUID
  device_fingerprint: string  // browser + OS + screen resolution hash
  ip_subnet: string           // First 3 octets (xxx.xxx.xxx.0)
  device_name: string         // Chrome on Windows, Safari on MacOS
  trusted_since: DateTime
  expires_at: DateTime
  last_used_at: DateTime
}
```

---

## 4. Session Management

### 4.1 Session Architecture

The system uses JWT (JSON Web Tokens) for stateless session management:

**Token Types:**
1. **Access Token**: Short-lived token for API requests (30 minutes)
2. **Refresh Token**: Long-lived token for obtaining new access tokens (7 days)

**Access Token Payload:**
```typescript
{
  user_id: UUID,
  tenant_id: UUID,
  role_id: UUID,
  permissions: string[],
  session_id: UUID,
  iat: number,  // issued at
  exp: number   // expires at (30 min)
}
```

**Refresh Token Payload:**
```typescript
{
  user_id: UUID,
  session_id: UUID,
  device_id: string,
  iat: number,
  exp: number  // expires at (7 days)
}
```

### 4.2 Session Lifecycle

**Session Creation:**
- Created after successful authentication (password + optional MFA)
- Access token generated with 30-minute expiry
- Refresh token generated with 7-day expiry
- Session record stored in database for tracking

**Session Tracking:**
```typescript
Session {
  session_id: UUID
  user_id: UUID
  device_id: string
  ip_address: string
  user_agent: string
  created_at: DateTime
  last_activity_at: DateTime
  expires_at: DateTime
  status: enum ['Active', 'Expired', 'Revoked']
}
```

**Session Refresh:**
- When access token expires, client sends refresh token
- System validates refresh token
- If valid: Generate new access token, extend refresh token
- If invalid/expired: Force re-login

### 4.3 Idle Timeout

**Inactivity Detection:**
- **Idle Threshold**: 30 minutes of inactivity
- **Activity Definition**: Any user interaction (click, keyboard, scroll, API call)
- **Client-Side**: JavaScript tracks last activity timestamp
- **Server-Side**: `last_activity_at` updated on each API request

**Auto-Logout Process:**
```
IF (NOW() - last_activity_at) > 30 minutes:
    session_status = 'Expired'
    clear_client_tokens()
    redirect_to_login()
```

**Warning Mechanism:**
- At 25 minutes idle: Show warning popup ("Session expires in 5 minutes")
- User can click "Stay logged in" to reset timer
- At 30 minutes: Auto-logout

### 4.4 Concurrent Session Limits

**Session Limits:**
- **Default**: Maximum 2 concurrent sessions per user
- **Configurable**: Per tenant (1-5 sessions)
- **Enforcement**: FIFO (First In, First Out) - oldest session terminated

**Multi-Session Handling:**
```
IF user's active_sessions_count >= max_concurrent_sessions:
    revoke_oldest_session()
    create_new_session()
```

### 4.5 Manual Logout

**Explicit Logout:**
- User clicks "Logout" button
- Access token revoked (added to blacklist)
- Refresh token revoked
- Session status set to 'Revoked'
- Client tokens cleared from storage
- Redirect to login page

**Logout Across All Devices:**
- Option to "Logout from all devices"
- Revokes all active sessions for user
- Forces re-login on all devices

---

## 5. Security Features

### 5.1 Password Masking & Visibility Toggle

**UI Implementation:**
- Password field displays masked characters (•••••)
- "Show/Hide" icon (eye icon) toggles visibility
- Default state: Hidden
- Visibility state does not persist across page reloads

### 5.2 CSRF Protection

**Cross-Site Request Forgery Prevention:**
- CSRF tokens generated per session
- Token embedded in forms and AJAX headers
- Server validates token on state-changing requests
- Token rotation after sensitive actions

### 5.3 Rate Limiting

**Login Endpoint Rate Limits:**
- **Per IP**: 10 attempts per minute
- **Per Username**: 5 attempts per minute
- **Global**: 1000 requests per minute

**Throttling Response:**
```
HTTP 429 Too Many Requests
{
  error: "Rate limit exceeded",
  retry_after: 60 seconds
}
```

### 5.4 Security Headers

**HTTP Security Headers:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

---

## 6. Audit & Compliance

### 6.1 Audit Logging

All authentication events are logged for compliance and security auditing:

**Logged Events:**
- Login attempts (success/failure)
- Account lockouts
- Admin unlocks
- MFA verifications
- Session creation/termination
- Password changes
- Permission changes

**Audit Log Structure:**
```typescript
AuditLog {
  log_id: UUID
  event_type: enum ['Login', 'Logout', 'AccountLock', 'AccountUnlock', 'MFAVerify', ...]
  user_id: UUID
  actor_id: UUID      // For admin actions
  ip_address: string
  details: JSON       // Event-specific details
  timestamp: DateTime
  tenant_id: UUID
}
```

### 6.2 Compliance Considerations

**Data Retention:**
- Login attempt logs: 90 days
- Audit logs: 7 years (configurable per tenant)
- Session records: 30 days after expiry

**Privacy:**
- Passwords never logged (only hashes stored)
- PII encrypted at rest
- Audit logs accessible only to authorized admins

---

## 7. Integration Points

### 7.1 RBAC Integration

Authentication system integrates with RBAC module for authorization:
- User's role_id retrieved during authentication
- Permissions loaded and embedded in access token
- Every API request validates permissions against required access

**Permission Check Flow:**
```
authenticate() → get_user_role() → load_permissions() → embed_in_token()
```

### 7.2 Audit Log Integration

All authentication events sent to centralized audit logging system:
- Real-time event streaming
- Indexed for fast search/filtering
- Retention policy enforcement

---

## 8. Password Reset Integration

Password reset flows (both self-service and admin-assisted) directly interact with the authentication and session management systems:

**Session Termination on Password Reset**:
- When a password is reset (either method), **all active sessions for that user are immediately terminated**
- All access tokens are invalidated and refresh tokens revoked
- The user must re-authenticate with their new password

**Password Complexity Enforcement**:
- The same password complexity rules (Section 1.4) apply during both activation password setup and password reset
- Password history check (last 3 passwords) enforced at the authentication layer

**Rate Limiting for Self-Service Reset**:
- Maximum 3 reset requests per hour per user
- Standard rate limiting (Section 5.3) applies to the reset endpoint

**Audit Integration**:
- All password reset events logged via the audit system (Section 6.1)
- Admin-assisted resets include: Admin ID, justification, verification method
- Self-service resets include: User ID, IP address, device ID, timestamp

> For detailed password reset workflows and business rules, see [User & Tenant Management - Section 7](user-tenant-management.md#7-password--account-reset) and [US-005: User Invitation & Activation](../../04-backlog/stories/US-005-user-invitation-activation.md).

---

## 8.1 Driver SMS Quick Login Integration (US-005)

Driver users can authenticate using a **mobile interface link** and a **system-generated password** sent via SMS, to support low digital literacy users.

**Flow**:
1. Driver receives SMS containing mobile link + system-generated password
2. Driver opens link; mobile number is auto-populated (read-only)
3. Driver enters system-generated password
4. System validates password and creates session (JWT)

**Security Controls**:
- Allowed only for role `Driver` and only via the mobile interface
- Rate limited using the login endpoint policy
- Failed attempts contribute to the account lockout policy
- All attempts are audit logged with device ID, IP address, and status

**Note**: OTP may still be generated/sent for logging/compatibility, but it is not required for Driver quick login in Phase 1.

## 9. Related Documentation

- **[RBAC Specification](rbac.md)** - Role-based access control details
- **[User Management](user-tenant-management.md)** - User lifecycle management
- **[System Foundation](system-foundation.md)** - Overall system architecture

**Related User Stories:**
- US-001: User Login & Account Lockout
- US-002: Multi-Factor Authentication
- US-003: Session Control
- US-005: User Invitation, Activation & Password Reset
- US-008: Password & Account Reset (scope consolidated into US-005)

**Source**: PRD_DFMS_v1.0.md - Sections 6.1.1, 6.1.2, 6.1.3
