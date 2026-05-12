---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Self-Registration (mobile) + Tenant Isolation
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# VM-01 — Vendor Self-Registration (mobile) + Tenant Isolation

## User Story

**As a** transport vendor  
**I want to** register my company on DFMS  
**So that** I can participate in transport bidding and execute trips for the organization

## Business Context

Vendor onboarding is the entry gate to the vendor ecosystem. **Self-registration is delivered first on the Vendor Mobile app** (web self-registration is out of initial scope). Registration must not activate vendors until verification completes.

Vendors can be created in two ways:

- **Self-registration** by the vendor
- **Invitation-based onboarding** where a **Platform Admin** creates a vendor and sends an invite

Vendor verification is a **platform-level** step. Separately, vendors must **join tenant(s)** to see and act on tenant-specific bids/trips.

**Vendor type (Contractual vs Non-Contractual)** is **not** collected at self-registration or invite completion. Only a **Tenant Admin** may set vendor type **when approving a vendor’s join request** for that tenant (see VM-09).

## Acceptance Criteria

### AC-1: Self-Registration Form (Vendor Mobile — company + contacts)
- [ ] Vendor Mobile app provides a vendor registration form that captures:
  - Company details
  - Contact information
  - Testimonial / reference from Truck Association

### AC-2: Platform Admin Can Create & Invite Vendor
- [ ] Platform Admin can create a vendor profile and invite the vendor (email/SMS link or equivalent)
- [ ] Invited vendor can complete missing registration fields and submit for verification (without selecting vendor type)

### AC-3: Pending Verification Gate (platform-level)
- [ ] On submission, vendor profile is saved in **Pending Verification** state
- [ ] Submitted vendor profile remains **inactive until admin approval**
- [ ] Vendors cannot access tenant bids or tenant TO details before verification is complete

### AC-4: Vendor Is Not Tenant-Active Until Join Approved (type set by tenant — VM-09)
- [ ] After verification, vendor can see a list of **active tenants**
- [ ] Vendor can submit a **join request** to one or more tenants
- [ ] Vendor cannot see bids/trips for a tenant until the tenant approves the join request
- [ ] **Tenant-scoped** vendor type (Contractual vs Non-Contractual) is assigned **only** when the tenant approves the join — not by the vendor at registration (VM-09)

### AC-5: Audit Logging (registration/invite)
- [ ] All vendor registration attempts are logged for audit (who/when/what status)
- [ ] Platform-admin invite actions are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide a vendor self-registration flow in the **Vendor Mobile** app (web deferred).

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-01-1 | Vendor registration API + mobile client validation | ~ | Pending |
| VM-01-2 | Registration + invite-completion APIs exclude vendor type (tenant assigns on join — VM-09) | ~ | Pending |
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
- Per-tenant membership (VM-09): `vendor_type` ∈ {`CONTRACTUAL`, `NON_CONTRACTUAL`} — set only by Tenant Admin on join approval

## Dependencies

- **Requires**: Auth model capable of representing a vendor identity (or a pre-user registration record).
- **Enables**: VM-02 (docs/profile), VM-03 (platform verification), VM-09 (tenant join), VM-04+ (portal/bidding visibility per joined tenant).

## Definition of Done

- [ ] Vendor can submit registration from **Vendor Mobile** and receives a confirmation response
- [ ] Record is tenant-isolated and stored as `PENDING_VERIFICATION`
- [ ] Vendor cannot access bidding/TO details prior to approval
- [ ] Audit entry created for registration submission

