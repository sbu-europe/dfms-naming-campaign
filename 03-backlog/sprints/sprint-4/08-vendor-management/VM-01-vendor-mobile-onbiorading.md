---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Vendor Mobile Onboarding — Self-Registration, Tenant Isolation, Compliance Docs & Company Profile
epic: Vendor Onboarding & Verification
status: In progress
story_points: 8
assignee: ~
---

# Vendor Mobile Onboarding — Self-Registration, Tenant Isolation, Compliance Docs & Company Profile

Vendor mobile onboarding covers **self-registration** on the Vendor Mobile app plus required compliance documents and company profile completion.

## User Story

**As a** transport vendor  
**I want to** register my company and complete required onboarding (company profile + compliance documents) on DFMS  
**So that** I can join tenant(s) and participate in transport bidding and execution for those tenants

## Business Context

Vendor onboarding is the entry gate to the vendor ecosystem.

- **Primary channel (Sprint 4 scope)**: **Self-registration is delivered first on the Vendor Mobile app** (web self-registration is out of initial scope).
- **No Platform Admin onboarding path:** Platform Admin **does not** create vendors and **does not** send onboarding invites. The sole onboarding path in Phase 1 is **vendor self-registration on the Vendor Mobile app**.
- **No Platform Admin verification step** after sign-up. There is **no** platform-level reject/approve gate in current scope.
- **Platform-active rule**: once **registration** and **mandatory compliance inputs** are complete (documents + profile), the vendor is treated as **platform-active** and can proceed to **tenant join** (VM-02).

Tenant access is separate from platform registration:

- Vendors must **join tenant(s)** to see and act on tenant-specific bids/trips.
- Vendor is **not tenant-active** until the tenant approves the join request (VM-02).

Vendor classification:

- **Vendor type (Contractual vs Non-Contractual)** is **not** collected at self-registration.
- Only a **Tenant Admin** may set vendor type **when approving a vendor's join request** for that tenant (VM-02).

Onboarding scope boundaries:

- Vendors **do not** configure **vehicle master data** or **driver master data** during onboarding.
- Fleet and driver capture belong to **post-award / execution** flows (VM-07), not onboarding.

## Acceptance Criteria

### AC-1: Self-Registration Form (Vendor Mobile — company + contacts)

- [ ] Vendor Mobile app provides a vendor registration form that captures:
  - Company details
  - Contact information
  - Testimonial / reference from Truck Association

### AC-2: Mandatory Compliance Document Upload

- [x] Vendor must upload all mandatory documents before submission:
  - Trade License
  - BIN
  - TIN
- [x] Submission is blocked until all mandatory documents are provided

### AC-3: Reference/Testimonial Capture

- [x] Vendor can provide a testimonial/reference from Truck Association as part of the registration profile

### AC-4: Vendor Is Not Tenant-Active Until Join Approved (type set by tenant — VM-02)

- [x] After **successful platform registration** (including mandatory documents), vendor can see a list of **active tenants**
- [x] Vendor can submit a **join request** to one or more tenants
- [x] Vendor cannot see bids/trips for a tenant until the tenant approves the join request
- [x] **Tenant-scoped** vendor type (Contractual vs Non-Contractual) is assigned **only** when the tenant approves the join — not by the vendor at registration (VM-02)

### AC-5: Resubmission-Friendly Data Model

- [ ] Vendor can update registration documents / profile fields after initial submission without losing the prior audit trail (e.g. corrections or renewed documents)

### AC-6: Audit Trail for Data Changes

- [ ] All changes to registration data (documents, company profile fields, testimonial) are logged for audit

### AC-7: Audit Logging (registration)

- [ ] All vendor registration attempts are logged for audit (who/when/what status)

## Functional Requirements (from PRD)

- [x] **[Critical]** System SHALL provide a vendor self-registration flow in the **Vendor Mobile** app (web deferred).
- [ ] **[Critical]** System SHALL require document uploads (trade license, BIN, TIN) before submission.
- [x] **[Critical]** System SHALL NOT provide a platform-admin "create vendor" or "invite vendor" path in Phase 1. Vendor onboarding is **self-service via the Vendor Mobile app only**.
- [x] **[High]** Vendor registration SHALL capture company profile and compliance data **only** (no vehicle or driver master registration in this story).
- [ ] **[High]** System SHALL allow vendors to update registration documents/profile with full audit trail (no platform-admin reject loop in current scope).
- [ ] **[High]** All vendor registration attempts SHALL be logged for audit.

## API Endpoints (suggested)

Registration:

```
POST /api/v1/vendors/registrations
GET  /api/v1/vendors/registrations/{id}
```

Documents + profile update:

```
POST   /api/v1/vendors/registrations/{id}/documents
PATCH  /api/v1/vendors/registrations/{id}
```

> **No** `/platform/vendors` create or `/invite` endpoints in Phase 1.

## Data (minimum)

- Vendor platform status after successful registration + onboarding completeness: **`ACTIVE`** (no `PENDING_VERIFICATION` / no platform-admin approval step)
- Per-tenant membership (VM-02): `vendor_type` ∈ {`CONTRACTUAL`, `NON_CONTRACTUAL`} — set only by Tenant Admin on join approval
- Registration/profile schema must **exclude** vendor-managed vehicle/driver master payloads (aligned with VM-07 for execution-time capture)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-01-1 | Vendor identity / pre-user model + auth hook for self-registration | ~ | **Done** |
| VM-01-2 | `POST/GET /api/v1/vendors/registrations` — create + retrieve registration; server validation mirrors mobile required fields | ~ | **Partial** |
| VM-01-3 | Registration payload **excludes** `vendor_type` (tenant assigns on join — VM-02) | ~ | **Done** |
| VM-01-4 | `POST /api/v1/vendors/registrations/{id}/documents` — Trade License, BIN, TIN mandatory before first complete submit; storage + MIME/size policy | ~ | **Done** |
| VM-01-5 | `PATCH /api/v1/vendors/registrations/{id}` — company + contacts + testimonial; resubmission-friendly versioning / history | ~ | **Partial** |
| VM-01-6 | Vendor Mobile — registration wizard (company, contacts, Truck Association testimonial) + blocked submit until mandatory docs | ~ | **Partial** |
| VM-01-7 | Audit: registration attempts (who/when/outcome) + structured audit for document/profile mutations | ~ | **Partial** |
| VM-01-8 | Post-registration: vendor **platform-active** state; surface **active tenants** + join-request entry (handoff to VM-02) | ~ | **Done** |
| VM-01-9 | Vendor OTP verification — send/verify OTP on registration or sensitive account actions (mobile + backend) | ~ | **Pending** |
| VM-01-10 | Forgot password + password reset — request link/OTP, reset token expiry, set new password (Vendor Mobile + auth API) | ~ | **Pending** |
| VM-01-11 | Delete account — Profile section flow; confirmation, soft-delete or deactivation policy, audit trail | ~ | **Pending** |

## Dependencies

- **Requires**: Auth model capable of representing a vendor identity (or a pre-user registration record).
- **Requires**: file storage mechanism; tenant scoping; audit log framework.
- **Enables**: VM-02 (tenant join), VM-03+ (portal/bidding visibility per joined tenant), VM-07 (execution-time vehicle/driver submission).

## Definition of Done

- [x] Vendor can submit registration from **Vendor Mobile** and receives a confirmation response
- [ ] Registration submission blocked without required docs
- [x] Record is tenant-isolated; vendor platform state becomes **`ACTIVE`** when registration + mandatory docs path is satisfied (no platform-admin approval step)
- [x] **No** platform-admin onboarding/invite endpoints are exposed; self-registration via Vendor Mobile is the sole onboarding path
- [x] Registration payloads do **not** require or persist vendor-managed vehicle/driver master data (aligned with VM-07 for execution-time capture)
- [x] Vendor cannot access **tenant** bids/TO details until tenant join is approved (VM-02)
- [ ] All mutations produce audit log entries (registration, documents/profile updates/resubmissions)

