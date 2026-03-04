---
module: 01-foundation
specification: Authentication & Security
version: 1.0
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
source_sections: 6.1.1, 6.1.2, 6.1.3
last_updated: 2026-02-26
related_stories: US-001, US-002, US-003
---

# Authentication & Security Specification

## Overview

The DFMS platform implements a comprehensive authentication and security framework designed for multi-tenant SaaS environments. The system provides secure user authentication, multi-factor authentication for privileged users, session management, and comprehensive audit logging to protect against unauthorized access while maintaining usability for users with varying technical literacy.

---

## 1. Authentication Architecture

### 1.1 Authentication Flow

The authentication system follows a layered security approach:

1. **Primary Authentication**: Username/password validation against securely hashed credentials
2. **Multi-Factor Authentication**: OTP verification for admin and privileged roles
3. **Session Creation**: JWT-based session token generation with refresh tokens
4. **Authorization**: Role-based access control (RBAC) validation

### 1.2 Credential Management

**Username Requirements:**
- Unique per tenant
- 3-50 characters
- Alphanumeric with allowed special characters: underscore, hyphen, dot
- Case-insensitive for login (stored as lowercase)

**Password Requirements:**
- Minimum 8 characters
- Must contain: uppercase letter, lowercase letter, number, special character
- Hashed using bcrypt with tenant-specific salt
- Password history: Last 3 passwords cannot be reused
- Expiration: 90 days (configurable per tenant)

**Password Storage:**
```typescript
{
  password_hash: string,        // bcrypt hash
  password_salt: string,        // tenant-specific salt
  last_password_change: DateTime,
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

## 3. Multi-Factor Authentication (MFA/2FA)

### 3.1 MFA Overview

Multi-Factor Authentication adds an additional security layer for privileged roles by requiring a time-based one-time password (OTP) after successful password validation.

**Applicability:**
- **Required for**: Super Admin, Tenant Admin, Department Admin
- **Optional for**: Operational Users (configurable per tenant by Tenant Admin)
- **Delivery Methods**: Email, SMS

### 3.2 OTP Generation

**OTP Specifications:**
- **Algorithm**: Time-based OTP (TOTP) - RFC 6238
- **Code Length**: 6 digits
- **Validity**: 5 minutes (300 seconds)
- **Hash Function**: HMAC-SHA256
- **Delivery**: Email (primary), SMS (fallback/secondary)

**OTP Generation Logic:**
```
OTP = TOTP(secret_key, current_timestamp, validity_window)
```

### 3.3 MFA Flow

1. User enters username/password
2. System validates credentials
3. If user role requires MFA:
   - Generate 6-digit OTP
   - Send OTP via email/SMS
   - Present OTP verification screen
4. User enters OTP within 5 minutes
5. System validates OTP
6. On success: Create session, redirect to dashboard
7. On failure (3 attempts): Restart from step 1

**Retry Policy:**
- Maximum 3 OTP attempts per session
- User can request OTP resend (max 3 resends per 10 minutes)
- After 3 failed attempts: Return to login screen

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

## 8. Related Documentation

- **[RBAC Specification](rbac.md)** - Role-based access control details
- **[User Management](user-tenant-management.md)** - User lifecycle management
- **[System Foundation](system-foundation.md)** - Overall system architecture

**Related User Stories:**
- US-001: User Login & Account Lockout
- US-002: Multi-Factor Authentication
- US-003: Session Control

**Source**: PRD_DFMS_v1.0.md - Sections 6.1.1, 6.1.2, 6.1.3
