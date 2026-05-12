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

Vendor onboarding is the entry gate to the vendor ecosystem. **Self-registration is delivered first on the Vendor Mobile app** (web self-registration is out of initial scope). **There is no Platform Admin verification step** after sign-up; once registration and mandatory compliance inputs are complete (**VM-02**), the vendor is active at platform level for **tenant join** and downstream flows.

Vendors can be created in two ways:

- **Self-registration** by the vendor
- **Invitation-based onboarding** where a **Platform Admin** creates a vendor and sends an invite

Separately, vendors must **join tenant(s)** to see and act on tenant-specific bids/trips.

**Vendor type (Contractual vs Non-Contractual)** is **not** collected at self-registration or invite completion. Only a **Tenant Admin** may set vendor type **when approving a vendor’s join request** for that tenant (see VM-03).

## Acceptance Criteria

### AC-1: Self-Registration Form (Vendor Mobile — company + contacts)
- [ ] Vendor Mobile app provides a vendor registration form that captures:
  - Company details
  - Contact information
  - Testimonial / reference from Truck Association

### AC-2: Platform Admin Can Create & Invite Vendor
- [ ] Platform Admin can create a vendor profile and invite the vendor (email/SMS link or equivalent)
- [ ] Invited vendor can complete missing registration fields and submit (without selecting vendor type)

### AC-3: Vendor Is Not Tenant-Active Until Join Approved (type set by tenant — VM-03)
- [ ] After **successful platform registration** (including VM-02 mandatory documents), vendor can see a list of **active tenants**
- [ ] Vendor can submit a **join request** to one or more tenants
- [ ] Vendor cannot see bids/trips for a tenant until the tenant approves the join request
- [ ] **Tenant-scoped** vendor type (Contractual vs Non-Contractual) is assigned **only** when the tenant approves the join — not by the vendor at registration (VM-03)

### AC-4: Audit Logging (registration/invite)
- [ ] All vendor registration attempts are logged for audit (who/when/what status)
- [ ] Platform-admin invite actions are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide a vendor self-registration flow in the **Vendor Mobile** app (web deferred).

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-01-1 | Vendor registration API + mobile client validation | ~ | Pending |
| VM-01-2 | Registration + invite-completion APIs exclude vendor type (tenant assigns on join — VM-03) | ~ | Pending |
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

- Vendor platform status after successful registration + VM-02 completeness: **`ACTIVE`** (no `PENDING_VERIFICATION` / no platform-admin approval step)
- Per-tenant membership (VM-03): `vendor_type` ∈ {`CONTRACTUAL`, `NON_CONTRACTUAL`} — set only by Tenant Admin on join approval

## Dependencies

- **Requires**: Auth model capable of representing a vendor identity (or a pre-user registration record).
- **Enables**: VM-02 (docs/profile), VM-03 (tenant join), VM-04+ (portal/bidding visibility per joined tenant).

## Definition of Done

- [ ] Vendor can submit registration from **Vendor Mobile** and receives a confirmation response
- [ ] Record is tenant-isolated; vendor platform state becomes **`ACTIVE`** when registration + mandatory docs path is satisfied (**VM-02**), without a platform-admin approval step
- [ ] Vendor cannot access **tenant** bids/TO details until tenant join is approved (**VM-03**)
- [ ] Audit entry created for registration submission
