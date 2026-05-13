---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Mobile Onboarding — Self-Registration, Tenant Isolation, Compliance Docs & Company Profile
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# Vendor Mobile Onboarding — Self-Registration, Tenant Isolation, Compliance Docs & Company Profile

Vendor mobile onboarding covers self-registration/invite onboarding plus required compliance documents and company profile completion.

## User Story

**As a** transport vendor  
**I want to** register my company and complete required onboarding (company profile + compliance documents) on DFMS  
**So that** I can join tenant(s) and participate in transport bidding and execution for those tenants

## Business Context

Vendor onboarding is the entry gate to the vendor ecosystem.

- **Primary channel (Sprint 4 scope)**: **Self-registration is delivered first on the Vendor Mobile app** (web self-registration is out of initial scope).
- **No Platform Admin verification step** after sign-up. There is **no** platform-level reject/approve gate in current scope.
- **Platform-active rule**: once **registration** and **mandatory compliance inputs** are complete (documents + profile), the vendor is treated as **platform-active** and can proceed to **tenant join** (VM-03).

Vendors can be created in two ways:

- **Self-registration** by the vendor (Vendor Mobile)
- **Invitation-based onboarding** where a **Platform Admin** creates a vendor and sends an invite

Tenant access is separate from platform registration:

- Vendors must **join tenant(s)** to see and act on tenant-specific bids/trips.
- Vendor is **not tenant-active** until the tenant approves the join request (VM-03).

Vendor classification:

- **Vendor type (Contractual vs Non-Contractual)** is **not** collected at self-registration or invite completion.
- Only a **Tenant Admin** may set vendor type **when approving a vendor’s join request** for that tenant (VM-03).

Onboarding scope boundaries:

- Vendors **do not** configure **vehicle master data** or **driver master data** during onboarding.
- Fleet and driver capture belong to **post-award / execution** flows (e.g. VM-08), not onboarding.

## Acceptance Criteria

### AC-1: Self-Registration Form (Vendor Mobile — company + contacts)

- [ ] Vendor Mobile app provides a vendor registration form that captures:
  - Company details
  - Contact information
  - Testimonial / reference from Truck Association

### AC-2: Platform Admin Can Create & Invite Vendor

- [ ] Platform Admin can create a vendor profile and invite the vendor (email/SMS link or equivalent)
- [ ] Invited vendor can complete missing registration fields and submit (without selecting vendor type)

### AC-3: Mandatory Compliance Document Upload

- [ ] Vendor must upload all mandatory documents before submission:
  - Trade License
  - BIN
  - TIN
- [ ] Submission is blocked until all mandatory documents are provided

### AC-4: Reference/Testimonial Capture

- [ ] Vendor can provide a testimonial/reference from Truck Association as part of the registration profile

### AC-5: Vendor Is Not Tenant-Active Until Join Approved (type set by tenant — VM-03)

- [ ] After **successful platform registration** (including mandatory documents), vendor can see a list of **active tenants**
- [ ] Vendor can submit a **join request** to one or more tenants
- [ ] Vendor cannot see bids/trips for a tenant until the tenant approves the join request
- [ ] **Tenant-scoped** vendor type (Contractual vs Non-Contractual) is assigned **only** when the tenant approves the join — not by the vendor at registration (VM-03)

### AC-6: Resubmission-Friendly Data Model

- [ ] Vendor can update registration documents / profile fields after initial submission without losing the prior audit trail (e.g. corrections or renewed documents)

### AC-7: Audit Trail for Data Changes

- [ ] All changes to registration data (documents, company profile fields, testimonial) are logged for audit

### AC-8: Audit Logging (registration/invite)

- [ ] All vendor registration attempts are logged for audit (who/when/what status)
- [ ] Platform-admin invite actions are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide a vendor self-registration flow in the **Vendor Mobile** app (web deferred).
- [ ] **[Critical]** System SHALL require document uploads (trade license, BIN, TIN) before submission.
- [ ] **[High]** Vendor registration SHALL capture company profile and compliance data **only** (no vehicle or driver master registration in this story).
- [ ] **[High]** System SHALL allow vendors to update registration documents/profile with full audit trail (no platform-admin reject loop in current scope).
- [ ] **[High]** All vendor registration attempts SHALL be logged for audit.

## API Endpoints (suggested)

Registration + invitation:

```
POST /api/v1/vendors/registrations
GET  /api/v1/vendors/registrations/{id}

POST /api/v1/platform/vendors
POST /api/v1/platform/vendors/{vendor_id}/invite
```

Documents + profile update:

```
POST   /api/v1/vendors/registrations/{id}/documents
PATCH  /api/v1/vendors/registrations/{id}
```

## Data (minimum)

- Vendor platform status after successful registration + onboarding completeness: **`ACTIVE`** (no `PENDING_VERIFICATION` / no platform-admin approval step)
- Per-tenant membership (VM-03): `vendor_type` ∈ {`CONTRACTUAL`, `NON_CONTRACTUAL`} — set only by Tenant Admin on join approval
- Registration/profile schema must **exclude** vendor-managed vehicle/driver master payloads (aligned with VM-08 for execution-time capture)

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| ONB-1 | Vendor registration API + mobile client validation | ~ | Pending |
| ONB-2 | Registration + invite-completion APIs exclude vendor type (tenant assigns on join — VM-03) | ~ | Pending |
| ONB-3 | Platform admin vendor-create + invite flow | ~ | Pending |
| ONB-4 | Registration/invite audit log events | ~ | Pending |
| ONB-5 | Document upload storage + validation (required docs) | ~ | Pending |
| ONB-6 | Registration profile schema (company, contacts, testimonial, documents) — **exclude** vehicle/driver master payloads | ~ | Pending |
| ONB-7 | Audit logging for document/profile changes + resubmissions | ~ | Pending |

## Dependencies

- **Requires**: Auth model capable of representing a vendor identity (or a pre-user registration record).
- **Requires**: file storage mechanism; tenant scoping; audit log framework.
- **Enables**: VM-03 (tenant join), VM-04+ (portal/bidding visibility per joined tenant), VM-08 (execution-time vehicle/driver submission).

## Definition of Done

- [ ] Vendor can submit registration from **Vendor Mobile** and receives a confirmation response
- [ ] Registration submission blocked without required docs
- [ ] Record is tenant-isolated; vendor platform state becomes **`ACTIVE`** when registration + mandatory docs path is satisfied (no platform-admin approval step)
- [ ] Registration payloads do **not** require or persist vendor-managed vehicle/driver master data (aligned with VM-08 for execution-time capture)
- [ ] Vendor cannot access **tenant** bids/TO details until tenant join is approved (VM-03)
- [ ] All mutations produce audit log entries (registration, invite, documents/profile updates/resubmissions)

