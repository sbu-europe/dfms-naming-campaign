---
source_document: PRD_DFMS_v1.0.md
source_sections: Authentication & Security, Multi-Factor Authentication (2FA), Session Control
extracted_date: 2026-02-13
---

### Authentication & Security

**Version 1.0, Phase - 1**

**User Story:** _As a system user, I want to log in securely with my credentials so that I can access system features appropriate to my role while protecting against unauthorized access_.

**Acceptance Criteria:**

*   Login with unique credentials
*   Password field masked with show/hide toggle
*   Failed login attempts trigger lockout after 3 tries within 15 minutes
*   Account temporarily locked for 30 minutes after 3 failed attempts
*   Admin can access ‘Locked Users’ view listing all locked accounts
*   Admin can manually unlock user account after offline/phone verification
*   Upon unlock, failed-attempt counter resets to zero
*   User can immediately attempt login after admin unlock
*   All unlock actions logged in audit trail with admin ID and justification

**Functional Requirements:**

*   \[Critical\] System SHALL require unique username and password for all user logins
*   \[Critical\] System SHALL implement automatic account lockout after 3 consecutive failed login attempts
*   \[Critical\] Admin users SHALL have access to a "Locked Users" view listing all locked accounts with lock timestamp and reason.
*   \[High\] Admin users SHALL be able to unlock user accounts after offline identity verification, with mandatory remarks documenting verification method.
*   \[High\] Upon manual unlock, the system SHALL reset failed login attempt counters and allow immediate login.
*   \[Critical\] System SHALL log all login attempts (successful and failed) with timestamp, user ID, IP address, and device ID.


### Multi-Factor Authentication (2FA)

**Version 1.0, Phase - 1**

**User Story:** _As an Tenant Admin user, I want to use 2FA so that my account has an extra layer of security beyond just password_.

**Acceptance Criteria:**

*   Admin users are required to verify identity using one-time password (OTP)
*   2FA verification required after password validation

**Functional Requirements:**

*   \[Critical\] System SHALL require Multi-Factor Authentication (MFA) for Admin user roles.
*   \[Critical\] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.
*   \[High\] MFA verification SHALL be required after successful password validation.
*   \[Low\] The system SHALL remember trusted devices for 30 days to reduce MFA frequency.


### Session Control

**Version 1.0, Phase - 1**

**User Story:** _As an System Admin user, I want to control user sessions so that inactive sessions do not pose security risks_.

**Acceptance Criteria:**

*   System tracks active sessions (IP, Device) per user
*   System auto-logout idle users after 30 minutes of inactivity
*   Any user action (click, scroll, keyboard input) resets inactivity timer

**Functional Requirements:**

*   \[Critical\] System SHALL track all active user sessions with IP address and device identifier.
*   \[Critical\] System SHALL support OTP (One-Time Password) delivery via email or SMS for MFA.
