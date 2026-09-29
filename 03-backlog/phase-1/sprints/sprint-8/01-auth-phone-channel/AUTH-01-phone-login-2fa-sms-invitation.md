---

## jira_key: ~

jira_type: Story
jira_sprint: "Sprint 8"
story_id: AUTH-01
title: Phone Login Method, Phone 2FA & SMS Invitation with URL Shortener
epic: Auth — Phone Channel & SMS Invitation
status: Carry-over from Sprint 7 — Sprint 8 Scope
story_points: 13
assignee: ~
prd_refs:

- "§6.2 User & Access Management — invitation, activation, MFA"
- "US-002 Multi-Factor Auth (OTP via email or SMS)"
- "US-005 User Invitation & Activation"
- "US-006 OTP Verification"
phase: Phase 1
related_stories:
- US-002 (Multi-Factor Authentication)
- US-005 (User Invitation & Activation)
- US-006 (OTP Verification)
- CP-03 (Email OTP 2FA login) — FB-005 OTP channel email|SMS (Open)
- CP-04 (Account activation via invitation link)
- BUG-05 (Email 2FA verification screen)
- Sprint 6 tenant Super Admin / Tenant Admin split (FB users-and-access)



# AUTH-01 — Phone Login Method, Phone 2FA & SMS Invitation with URL Shortener



## User Story

**As a** Tenant Super Admin or Tenant Admin  
**I want to** choose **Phone** as a user’s **login method** and **Login 2FA** channel (in addition to today’s Email / None options)  
**So that** invitees who primarily use mobile can be onboarded and authenticated via phone with the same security and lifecycle as the email path.

**As an** invited user (when Phone channel is selected)  
**I want to** receive an **SMS invitation** containing a **short activation link**, then complete activation / OTP / password setup the same way as email invitees  
**So that** I can activate my account from my phone without dealing with long URLs that break in SMS.

**As the** DFMS platform  
**I want** a **first-party URL shortener**, delivered as a **standalone DFMS service**, that turns long activation (and related auth) URLs into short, resolvable links  
**So that** SMS messages stay within length limits while preserving the same secure destination and token semantics as email links.

---



## Business Context



### Today (email-only for admin invitation & 2FA)

Phase 1 admin onboarding and login security are **email-centric**:


| Capability                      | Current state                                       |
| ------------------------------- | --------------------------------------------------- |
| Invitation delivery             | Email with full activation URL (CP-04 / US-005)     |
| Login identifier (Admin portal) | Email + password                                    |
| Login 2FA options               | `None`, `Email` (OTP via email)                     |
| Activation OTP                  | `None` / `Email` on invitation                      |
| SMS invitation                  | Explicitly **out of scope** in US-005 Phase 1 notes |
| Configurable OTP channel        | Client feedback **CP-03 FB-005** (email             |


Tenant Super Admin and Tenant Admin need a **Phone** option so field-oriented or mobile-first users can be invited and challenged via SMS, without inventing a second activation product.

### What AUTH-01 delivers

1. **Selectable Phone channel** on invite / user security settings — Login Method = Phone; Login 2FA = Phone (alongside existing Email / None).
2. **SMS invitation** that mirrors the email invitation lifecycle (token, 7-day expiry, resend + cooldown, status Sent → Pending → Activated / Expired / Cancelled, same activation pages and password rules).
3. **URL shortener** — a **standalone, separately deployed DFMS service** (own datastore, own short domain, exposing a create-link API and a public redirect endpoint) used for SMS invitation links, and reusable for other SMS auth links such as phone-2FA deep links, so the message body carries a **short** URL that resolves 1:1 to the long secure activation URL.
4. **Phone login + phone 2FA** behaviour that is **parity with email**: same OTP length, TTL, resend cooldown, lockout, and verification screen pattern (see BUG-05 for email UX expectations).



### Principle: “same flow as email”

Wherever the email path already defines behaviour (token single-use, expiry messaging, OTP verify before set-password when 2FA/OTP = channel, resend, audit), the phone path **reuses** that behaviour and only swaps:

- **Delivery channel** → SMS  
- **Primary identifier** (when Login Method = Phone) → phone number  
- **Link representation in SMS** → shortened URL

---



## Assumptions (explicit)


| #   | Assumption                                                                                                                                                                                                                                                                                      | If wrong                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| A1  | **Actors who configure** Phone login / Phone 2FA: **Tenant Super Admin** and **Tenant Admin (delegate)** for users they are allowed to invite or edit (same minting rules as today / Sprint 6 admin split).                                                                                     | Narrow or widen RBAC in AC-1              |
| A2  | **Platform Super Admin** tenant-provisioning invite for the first Tenant Super Admin **may** also offer Phone in a follow-on; Sprint 8 **minimum** is tenant-side staff invite + user edit.                                                                                                     | Add PAP sub-task if required              |
| A3  | When channel = Phone, **phone number is mandatory** and **unique within the tenant**; **E.164 / BD mobile** validation matches existing phone helpers.                                                                                                                                          | Align format with PO                      |
| A4  | **Email** may still be stored on the user record when available, but **invitation delivery** for Phone channel is **SMS-only** (not dual-send).                                                                                                                                                 | Change to dual-channel if client requires |
| A5  | **Login Method = Phone** means sign-in identifier is **phone number + password** on the organisation Admin login screen (user can still have an email on file).                                                                                                                                 | Clarify dual-login if required            |
| A6  | **Login 2FA = Phone** means after password, OTP is sent by **SMS** to the user’s phone; verification UX matches email 2FA (dedicated screen, resend, expiry).                                                                                                                                   | —                                         |
| A7  | URL shortener is **first-party** (DFMS-owned and DFMS-hosted) and runs as a **standalone service** — its own deployable, datastore and short domain, called by the Admin backend over an authenticated internal API. Not a public third-party brand in SMS; target URL remains on DFMS domains. | Confirm short domain                      |
| A8  | Short links are **single-purpose**, bound to the invitation (or auth) token and to the inviting tenant, respect invitation expiry, and **never** resolve across tenants.                                                                                                                        | —                                         |
| A10 | The shortener is **operated as platform infrastructure**: it can be deployed, scaled, and released independently of the Admin backend, and other DFMS products may consume it later without a new shortener.                                                                                    | Fold into the monolith if ops prefers     |
| A9  | Existing **Email** and **None** paths remain the default and must not regress.                                                                                                                                                                                                                  | —                                         |


---



## In Scope

- Admin invite + user edit: select **Login Method** and **Login 2FA** including **Phone**
- SMS invitation with shortened activation link
- First-party URL shortener **as a standalone service** — create, resolve, expire/revoke, plus its deployment and short-domain configuration
- Phone-based Admin login when Login Method = Phone
- Phone OTP for activation (when configured) and for login 2FA
- Audit events for invite SMS, short-link resolve, phone OTP success/failure
- Regression protection for email invite + email 2FA



## Out of Scope

- Vendor Mobile registration / phone login (separate module)
- TOTP / authenticator apps; backup codes
- Trusted device skip-OTP (CP-03 FB-004)
- Marketing / arbitrary URL shortening outside auth & invitation use cases (shortener API may be generic; product scope this sprint is auth/invitation)
- Changing Tenant Super Admin vs Tenant Admin permission catalog

---



## Acceptance Criteria



### AC-1 — Admins can choose Phone login method & Phone 2FA

- [ ] On **Invite User** and **Edit User** (security / invitation settings), Tenant Super Admin and Tenant Admin can select:
  - **Login Method**: `Email` (existing) | `Phone` (**new**)
  - **Login 2FA** (OTP type): `None` | `Email` (existing) | `Phone` (**new**)
- [ ] Selecting **Login Method = Phone** or **Login 2FA = Phone** requires a valid **phone number** before save / send invite; blank or invalid phone is blocked with a clear field error.
- [ ] Phone number uniqueness is enforced **per tenant** (same uniqueness spirit as email).
- [ ] Users who are not allowed to mint a given role today remain blocked; Phone options do **not** bypass invitation role guards.
- [ ] Defaults remain **Login Method = Email**, **Login 2FA = None** unless product decides otherwise (document chosen defaults in implementation notes).



### AC-2 — SMS invitation mirrors email invitation lifecycle

- [ ] When invitation delivery channel is Phone (Login Method = Phone **or** explicit invite channel = Phone — see A4), the system **creates the same invitation token / placeholder user** as email invite.
- [ ] System **sends an SMS** (not email) containing:
  - Organisation / inviter context (short copy)
  - **Shortened activation URL** (AC-3)
  - Expiry guidance consistent with email copy (7-day invitation window)
  - If activation OTP type = Phone: OTP handling consistent with email OTP rules (code in SMS and/or collected on activation screen — **same policy as email OTP**; prefer one clear pattern and document it)
- [ ] Opening the (resolved) activation link runs the **same** activation UI/API as email: validate token → optional OTP → set password → activate → status transitions.
- [ ] Invitation status tracking remains: **Sent → Pending → Activated / Expired / Cancelled**.
- [ ] **Resend invitation** regenerates/resets per existing email rules (cooldown, new window) and sends a **new SMS** with a **new or rotated short link** bound to the current token.
- [ ] Expired / used / cancelled tokens show the **same** user-facing errors as email activation.



### AC-3 — Standalone tenant-aware URL shortener service for SMS-safe links

- [ ] DFMS provides a **standalone, first-party URL shortener service** — deployed separately from the Admin backend, with its own datastore and short domain — that:
  - Exposes an **authenticated internal API** the Admin backend calls to create a short link, and a **public redirect endpoint** the invitee’s device calls
  - Accepts a long HTTPS target URL (activation / auth URL on an allowed DFMS host) **scoped to the current tenant**
  - Persists each short link with an explicit **tenant identifier** (schema / tenant id) at create time
  - Returns a **short URL** on a configured short base (e.g. `https://{short_domain}/{code}`)
  - On `GET` of the short URL, **HTTP redirects** (or equivalent resolve) to the original long URL **without** dropping query/token semantics, after resolving the code **within that tenant’s binding**
- [ ] Short codes are unguessable (cryptographic randomness), collision-safe, and **tenant-isolated**: a code created for tenant A must **never** resolve to tenant B’s invitation, activation URL, or any other tenant’s data.
- [ ] Create / revoke / invalidate short-link operations run only in the owning tenant’s context (same isolation model as invitation tokens).
- [ ] Short links **expire** no later than the bound invitation / token expiry; resolving an expired/revoked code shows a clear error (aligned with “link expired” activation messaging).
- [ ] Short links used for invitations are **invalidated** when the invitation is activated, cancelled, or superseded by resend (as applicable).
- [ ] SMS invitation **must** use the tenant-scoped short URL in the message body (not the long activation URL).
- [ ] Email invitations **continue to use the long (or existing) activation URL**; shortener is not required for email in this story unless product chooses consistency.
- [ ] Shortener configuration (base domain, default TTL, allowlisted target hosts) is environment-configurable; no hardcoded production secrets in repo. Tenant isolation is **not** optional configuration — it is mandatory behaviour.



### AC-4 — Phone login (when Login Method = Phone)

- [ ] On the organisation Admin sign-in screen, a user with **Login Method = Phone** authenticates with **phone number + password** (identifier field accepts phone; validation/normalisation applied).
- [ ] Successful password check follows the same branching as today:
  - If Login 2FA = None → session issued
  - If Login 2FA = Phone → pending session + SMS OTP + verification screen (AC-5)
  - If Login 2FA = Email → existing email OTP path (unchanged)
- [ ] Users with Login Method = Email continue to sign in with email + password (no regression).
- [ ] Failed attempts, lockout, and audit logging follow the same policies as email login (US-001 / existing lockout).



### AC-5 — Phone 2FA OTP (login & activation) parity with email OTP

- [ ] OTP is **6 digits**, stored with TTL (**10 minutes** unless config says otherwise), verified on the dedicated verification screen.
- [ ] Correct OTP completes the step (login session or activation progression); incorrect/expired OTP shows clear errors **on the verification screen** (same bar as BUG-05 for email).
- [ ] Resend OTP respects the same cooldown as email OTP (e.g. 30–60 seconds — match current email implementation).
- [ ] Too many failures trigger the same lockout behaviour as email OTP.
- [ ] OTP SMS delivery failure is logged; user sees a recoverable error (retry / contact admin) — no silent success.
- [ ] Tenant Admin / Tenant Super Admin mandatory-2FA rules (if any remain from CP-03 / US-002) honour **Phone** when that is the configured channel for that user.



### AC-6 — Access control, audit & non-regression

- [ ] Only authorised admins can set Phone login / Phone 2FA / send phone invitations (same RBAC as invite/edit user today).
- [ ] Audit (or auth event log) records at least: invitation SMS sent / failed; short link created / resolved / expired; phone OTP sent / verified / failed; phone login success / failure.
- [ ] Email invitation, email 2FA, and Login 2FA = None paths behave as before (manual + automated regression).
- [ ] Closing this story **satisfies CP-03 FB-005** for Admin portal OTP channel configuration (**email | phone/SMS**), or explicitly documents any remaining FB-005 gap (e.g. SMS→email fallback).

---

## Functional Flows



### Flow A — Invite via Phone (mirrors email)

```
Tenant Super Admin / Tenant Admin
  → Invite User: Login Method = Phone, phone number required,
                 Login 2FA = None | Email | Phone
  → System creates invitation token + placeholder user (same as email)
  → System builds long activation URL (same as email)
  → Admin backend calls the shortener service API → short code bound to this tenant → short URL
  → SMS gateway sends SMS with short URL (+ OTP copy if policy requires)
  → Invitee opens short URL → shortener resolves in tenant context → redirect to long activation URL
  → Same activation journey as email (OTP if configured → set password → active)
```



### Flow B — Login with Phone + Phone 2FA (mirrors email 2FA)

```
User (Login Method = Phone, Login 2FA = Phone)
  → Sign-in: phone + password
  → Password OK → SMS OTP dispatched → verification screen
  → Correct OTP → session / Admin home
  → Wrong / expired OTP → error on verification screen; resend per cooldown
```



### Flow C — Short link resolve (handled entirely by the shortener service)

```
GET https://{short_domain}/{code}          → shortener service (not the Admin backend)
  → Lookup code with tenant binding
  → If valid, not expired, and tenant match → redirect to bound long HTTPS URL for that tenant
  → If expired / revoked / unknown / cross-tenant mismatch → clear error page
    (no open redirect; no cross-tenant activation)
```

---



## Business Rules


| ID                | Rule                                                                                                                                                                                           |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BR-AUTH-PHONE-001 | Phone channel requires validated phone number before invite send or 2FA=Phone save                                                                                                             |
| BR-AUTH-PHONE-002 | Phone unique per tenant among active / invited users (document collision with archived numbers)                                                                                                |
| BR-AUTH-PHONE-003 | SMS invitation uses a **tenant-aware** shortened URL only — short link is created, stored, resolved, and invalidated in the inviting tenant’s context; never shared or resolved across tenants |
| BR-AUTH-PHONE-004 | Shortener may only redirect to allowlisted DFMS hosts / paths for the owning tenant                                                                                                            |
| BR-AUTH-PHONE-008 | The shortener runs as a **standalone DFMS-hosted service**; its create-link API is reachable only by authorised DFMS services, never publicly. Only the redirect endpoint is public            |
| BR-AUTH-PHONE-009 | If the shortener service is unavailable, the phone invitation is **retried and reported as failed to the admin** — an SMS is never sent with a long or broken link                             |
| BR-AUTH-PHONE-005 | Invitation and OTP TTLs for phone match email equivalents                                                                                                                                      |
| BR-AUTH-PHONE-006 | Email-channel behaviour remains default and unchanged unless admin selects Phone                                                                                                               |
| BR-AUTH-PHONE-007 | Role / department / plan-limit / POI invitation guards unchanged                                                                                                                               |


---



## Sub-tasks — Sprint 7


| #         | Sub-task                            | Description                                                                                                                                                                          | Priority | Status      |
| --------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------- |
| AUTH-01-1 | Admin configuration UI & validation | AC-1: Login Method + Login 2FA include Phone; mandatory phone; uniqueness; RBAC                                                                                                      | High     | Not started |
| AUTH-01-2 | SMS invitation parity               | AC-2: create/send/resend/expire/activate via SMS; status machine unchanged                                                                                                           | High     | Not started |
| AUTH-01-3 | Standalone URL shortener service    | AC-3: separate deployable + datastore; create/resolve/revoke API, allowlist, TTL, config, cross-tenant isolation tests                                                               | High     | Not started |
| AUTH-01-4 | Wire SMS invite → shortener         | AC-3 + AC-2: Admin backend calls the shortener API; SMS body uses the short URL; invalidate on activate/cancel/resend; retry + admin-visible failure when the service is unreachable | High     | Not started |
| AUTH-01-5 | Phone login                         | AC-4: Admin sign-in with phone + password when Login Method = Phone                                                                                                                  | High     | Not started |
| AUTH-01-6 | Phone OTP (login & activation)      | AC-5: SMS OTP generate/store/verify/resend/lockout; verification screen parity                                                                                                       | High     | Not started |
| AUTH-01-7 | Audit, failures, regression         | AC-6: audit events; SMS failure handling; email path regression                                                                                                                      | Medium   | Not started |
| AUTH-01-8 | Test coverage                       | Unit/integration (+ E2E scenarios): invite SMS → short link → activate → phone login → phone 2FA                                                                                     | Medium   | Not started |


---



## Dependencies


| Dependency                         | Notes                                                                                                                        |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| SMS gateway / notification channel | Provider selection (Twilio, AWS SNS, or approved local gateway); credentials via env                                         |
| Short domain DNS / TLS             | Configurable short base URL must resolve in each environment                                                                 |
| Shortener service hosting          | Standalone deployable with its own datastore, provisioned in each environment; internal API reachable from the Admin backend |
| Existing invitation + OTP services | Extend `otp_type` / login-method model; do not fork a second activation stack                                                |
| CP-03 / BUG-05 verification UX     | Reuse verification screen patterns for phone OTP                                                                             |


---



## Open Questions (for PO / client)

1. **Email on Phone invites** — keep email optional, recommended, or still mandatory for account recovery?
2. **Platform provisioning** — should Platform Super Admin’s first Tenant Super Admin invite also support Phone in Sprint 8?
3. **SMS copy & language** — English only vs tenant locale; max segments (1 SMS vs multi-part)?
4. **Short domain** — production hostname and who owns DNS?
5. **FB-005 fallback** — if SMS fails, fall back to email OTP/invite or fail closed?
6. **Login Method vs 2FA independence** — allow Login Method = Email with Login 2FA = Phone (and vice versa)? **Recommendation: allow any combination** where Phone appears, as long as phone number is present when any Phone option is selected.

---



## Test Plan

- [ ] Invite with Login Method = Phone → SMS received with **short** URL → open link → lands on activation → set password → active user
- [ ] Invite with Login 2FA / activation OTP = Phone → OTP via SMS → verify → complete activation
- [ ] Resend phone invitation → new SMS; old short link behaviour per AC-3 (invalid or superseded)
- [ ] Expired invitation short link → clear expired messaging
- [ ] Login Method = Phone, 2FA = None → phone + password → Admin home
- [ ] Login Method = Phone, 2FA = Phone → verification screen → correct/wrong/expired/resend cases (mirror BUG-05)
- [ ] Login Method = Email, 2FA = Email → unchanged (regression)
- [ ] Shortener rejects non-allowlisted target URLs
- [ ] Cross-tenant: short code from tenant A never activates tenant B user
- [ ] Unauthorised role cannot set Phone options / send invite

---



## Definition of Done

- [ ] All acceptance criteria AC-1–AC-6 met
- [ ] Sub-tasks AUTH-01-1 … AUTH-01-8 completed or explicitly deferred with PO sign-off
- [ ] URL shortener **deployed as its own service** in target environments, configurable, with documented ops notes
- [ ] SMS provider wired behind a channel abstraction; secrets not committed
- [ ] Test plan executed; results recorded
- [ ] CP-03 FB-005 status updated (Done or residual gap documented)
- [ ] No regression on email invitation or email 2FA login
- [ ] Story status updated for Sprint 8 tracking

---



## Notes

- This story **extends** Phase 1 email-only invitation (US-005) rather than replacing it.
- The URL shortener is a **standalone, tenant-aware platform service** introduced here primarily for SMS invitation UX: every short link belongs to exactly one tenant. Because it is a separate deployable, it can be released and scaled independently and reused by other DFMS products later — but **do not** expand product scope beyond auth/invitation without a new story.
- Prefer extending existing `InvitationToken.otp_type` / login-2FA setting and invitation services over a parallel phone-only codebase path.

