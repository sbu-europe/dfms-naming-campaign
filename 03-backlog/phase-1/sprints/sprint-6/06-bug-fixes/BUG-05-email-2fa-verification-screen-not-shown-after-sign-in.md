---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-05
title: Email verification code is sent but sign-in cannot be completed — verification screen is not shown
module: Authentication — Login & Two-Factor Authentication
severity: Critical
status: Done
story_points: 2
assignee: Farhan Tanvir (farhanT23)
reported_date: 2026-06-22
confirmed_date: 2026-06-22
fixed_date: 2026-06-22
related_stories:
  - US-002 (Multi-Factor Authentication)
  - User & Tenant Management — user profile and login security settings
affected_surfaces:
  - Organisation Admin — sign-in screen
  - Users with Login 2FA set to Email by a Tenant Admin
---

# BUG-05 — Email verification code is sent but sign-in cannot be completed — verification screen is not shown

## Summary

When a **Tenant Admin** sets a user’s **Login 2FA** to **Email**, that user should sign in with email and password first, then receive a **verification code by email**, then enter that code on a **dedicated verification screen** to finish signing in.

Previously, the **email with the verification code was delivered**, but the user was **returned to the sign-in screen** instead of seeing the screen where they enter the code. Sign-in **could not be completed**, so users with email-based login security were effectively **locked out** of the system.

**Status: Done** — fixed 2026-06-22 by Farhan Tanvir (farhanT23).

---

## Steps to Reproduce

1. Log in as **Tenant Admin**.
2. Open **Users** and select an active user (or create and activate one).
3. Set **Login 2FA** (or equivalent security setting) to **Email** and save.
4. Sign out (or use a separate browser).
5. Go to the organisation **sign-in** page.
6. Enter the user’s **correct email and password** and submit **Sign in**.
7. Check the user’s email inbox for the verification code.
8. Observe what appears on screen after sign-in.

### Actual result (before fix)

- The **verification code email arrives** (usually within a short time).
- The screen **returns to the sign-in page** (email and password fields).
- The **verification code entry screen never appears**.
- The user **cannot enter the code** and **cannot complete sign-in**, even with the correct code in hand.

### Expected result

- After correct email and password, the user is taken to a **verification screen** that clearly states a code was sent to their email.
- The user can **enter the 6-digit code** and submit it.
- If the code is **correct**, sign-in completes and the user reaches their intended destination (e.g. Admin home).
- If the code is **wrong or expired**, a **clear message** is shown on the verification screen (e.g. invalid or expired code) and the user can try again or return to sign-in — without losing the verification step entirely.

---

## Impact

- **Access blocked** — any user with **Login 2FA = Email** could not sign in after the setting was applied.
- **Security policy could not be enforced** — Tenant Admins enable email verification for stronger account protection, but the feature failed at the point of use.
- **Operational disruption** — affected users could not perform daily work in Admin until 2FA was removed or a workaround was applied.
- **Trust and support load** — users received a code by email but had nowhere to use it.
- **Compliance and audit risk** — multi-factor login for admin users was undermined by a broken second step.

---

## Root Cause (business view)

Sign-in with email-based 2FA is designed as a **two-step process**:

| Step | What should happen |
|------|-------------------|
| 1 | User proves identity with **email and password**. System sends a **verification code by email**. |
| 2 | User enters the **verification code** on a dedicated screen. System confirms the code and **completes sign-in**. |

**Step 1 completed successfully** — the code was generated and emailed.

**Step 2 never started for the user** — after step 1, the application did not keep the user in the “awaiting verification code” part of the journey. They were sent back to the **password sign-in screen** instead of the **verification code screen**.

In short: the **handover between “password accepted” and “enter your verification code” was broken**.

### Verification (2026-06-22 — before fix)

| Step | Expected | Observed (before fix) |
|------|----------|----------------------|
| Tenant Admin sets Login 2FA to Email | Setting saved | Works |
| User signs in with correct password | Verification email sent | Works |
| User sees verification code entry screen | Shown | **Not shown** |
| User enters correct code | Sign-in completes | **Not possible** |
| User told if code is wrong or expired | Message on verification screen | **Not possible** |

### Resolution (2026-06-22)

| Step | Expected | Observed (after fix) |
|------|----------|---------------------|
| User signs in with correct password | Verification email sent | Works |
| User sees verification code entry screen | Shown | **Shown** — Two-Factor Verification screen with masked email hint |
| User enters correct code | Sign-in completes | **Works** — user reaches Admin home |
| User enters wrong code | Error on verification screen | **Works** — clear invalid/expired message; user can retry |
| User requests new code | Resend available after 30 seconds | **Works** — resend button with countdown; new code emailed |
| User with Login 2FA = None | Password-only sign-in | **Unchanged** |

---

## Acceptance Criteria

### AC-1 — Verification screen is shown after password

- [x] After correct email and password for a user with **Login 2FA = Email**, the user is taken to a **verification code entry screen** (not back to the password sign-in screen).
- [x] The screen states that a code was sent to the user’s email (with a masked hint of the address where appropriate).
- [x] The screen explains that the code expires after the configured validity period (e.g. 10 minutes).

### AC-2 — Correct code completes sign-in

- [x] Entering the **correct, unused, non-expired** code completes sign-in and lands the user on the intended destination.
- [x] The user does not need to re-enter email and password if they are still within the allowed verification window.

### AC-3 — Incorrect or expired code is handled on the verification screen

- [x] An **incorrect** code shows a clear error on the **verification screen** (e.g. invalid code, try again).
- [x] An **expired** code shows a clear message and guidance to sign in again to receive a new code.
- [x] Failed attempts follow the organisation’s lockout policy where applicable, without silently dropping the user back to password sign-in without explanation.

### AC-4 — Users without email 2FA are unaffected

- [x] Users with **Login 2FA = None** (or not set to Email) continue to sign in with password only, as today.
- [x] No change to invitation, activation, or password-reset flows unless explicitly in scope.

### AC-5 — Setting controlled by Tenant Admin is honoured end-to-end

- [x] When a Tenant Admin sets **Login 2FA** to **Email** on a user record, that user’s **next and subsequent sign-ins** require the full two-step flow through to successful code verification.

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-05-1 | After password sign-in for email-2FA users, show verification code entry screen instead of returning to sign-in | Critical | Done |
| BUG-05-2 | Accept correct code and complete sign-in to Admin | Critical | Done |
| BUG-05-3 | Show clear errors on verification screen for wrong or expired codes | High | Done |
| BUG-05-4 | Confirm users without email 2FA and Tenant Admin 2FA setting behaviour unchanged | Medium | Done |
| BUG-05-5 | Add resend verification code on verification screen (30-second minimum wait) | Medium | Done |

---

## Test Plan

- [x] **Manual** — Tenant Admin sets Login 2FA to Email for a test user → user signs in with correct password → verification screen appears → correct code from email → sign-in succeeds.
- [x] **Manual** — Same setup → enter wrong code → error on verification screen; user can retry or return to sign-in via provided link.
- [x] **Manual** — Same setup → wait until code expires → clear message; user can restart sign-in and receive a new code.
- [x] **Manual** — User with Login 2FA = None → sign-in with password only → no verification screen (no regression).
- [x] **Manual** — Tenant Admin changes 2FA from None to Email → affected user’s next sign-in requires full email verification flow.
- [x] **Manual** — Resend verification code becomes available after 30 seconds; new code is delivered by email.

---

## Definition of Done

- [x] All acceptance criteria met.
- [x] Test plan completed and results recorded.
- [x] Users with Login 2FA = Email can sign in end-to-end without workaround.
- [x] Ticket status updated to **Done**.

---

## Notes

- **Login 2FA** is configured by the Tenant Admin on the user record (typically under user access / security settings). The value **Email** means a verification code must be entered at every sign-in after the password is accepted.
- This defect affected **organisation Admin sign-in** for tenant users when email-based login security was enabled.
- The verification screen includes a **Resend verification code** action, available **30 seconds** after the previous code was sent (countdown shown on screen).
