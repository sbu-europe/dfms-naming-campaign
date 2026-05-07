---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Self-Registration (web/mobile) + Tenant Isolation
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# VM-01 — Vendor Self-Registration (web/mobile) + Tenant Isolation

## User Story

**As a** transport vendor  
**I want to** register my company on DFMS  
**So that** I can participate in transport bidding and execute trips for the organization

## Business Context

Vendor onboarding is the entry gate to the vendor ecosystem. Registration must be possible from **web/mobile** and must not activate vendors until verification completes.

Vendors can be created in two ways:

- **Self-registration** by the vendor
- **Invitation-based onboarding** where a **Platform Admin** creates a vendor and sends an invite

Vendor verification is a **platform-level** step. Separately, vendors must **join tenant(s)** to see and act on tenant-specific bids/trips.

## Acceptance Criteria

### AC-1: Self-Registration Form (company + type + contacts)
- [ ] System provides a vendor registration form that captures:
  - Company details
  - Vendor type: **Contractual (Fixed Rate)** or **Non-Contractual**
  - Contact information
  - Testimonial / reference from Truck Association

### AC-2: Platform Admin Can Create & Invite Vendor
- [ ] Platform Admin can create a vendor profile and invite the vendor (email/SMS link or equivalent)
- [ ] Invited vendor can complete missing registration fields and submit for verification

### AC-2: Vendor Type Capture + Meaning
- [ ] Vendor must select one of:
  - **Contractual**: eligible for direct TO assignment by TDO (no bidding requirement)
  - **Non-Contractual**: eligible to receive bid notifications and submit bids (after approval)

### AC-3: Pending Verification Gate (platform-level)
- [ ] On submission, vendor profile is saved in **Pending Verification** state
- [ ] Submitted vendor profile remains **inactive until admin approval**
- [ ] Vendors cannot access tenant bids or tenant TO details before verification is complete

### AC-4: Vendor Is Not Tenant-Active Until Join Approved
- [ ] After verification, vendor can see a list of **active tenants**
- [ ] Vendor can submit a **join request** to one or more tenants
- [ ] Vendor cannot see bids/trips for a tenant until the tenant approves the join request

### AC-5: Audit Logging (registration/invite)
- [ ] All vendor registration attempts are logged for audit (who/when/what status)
- [ ] Platform-admin invite actions are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide a vendor self-registration interface (web/mobile).

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-01-1 | Vendor registration endpoint + validation | ~ | Pending |
| VM-01-2 | Vendor type gating rules (contractual/non-contractual) | ~ | Pending |
| VM-01-3 | Platform admin vendor-create + invite flow | ~ | Pending |
| VM-01-4 | Registration/invite audit log events | ~ | Pending |

## API Endpoints (suggested)

```
POST /api/v1/vendors/registrations
GET  /api/v1/vendors/registrations/{id}

POST /api/v1/platform/vendors
POST /api/v1/platform/vendors/{vendor_id}/invite
```

## Data (minimum)

- Vendor profile status: `PENDING_VERIFICATION`, `APPROVED`, `REJECTED`
- Vendor type: `CONTRACTUAL`, `NON_CONTRACTUAL`

## Dependencies

- **Requires**: Auth model capable of representing a vendor identity (or a pre-user registration record).
- **Enables**: VM-02 (docs/profile), VM-03 (platform verification), VM-09 (tenant join), VM-04+ (portal/bidding visibility per joined tenant).

## Definition of Done

- [ ] Vendor can submit registration (web/mobile) and receives a confirmation response
- [ ] Record is tenant-isolated and stored as `PENDING_VERIFICATION`
- [ ] Vendor cannot access bidding/TO details prior to approval
- [ ] Audit entry created for registration submission

