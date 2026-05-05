---
area: vendor-management
sprint: Sprint 4
status: Draft
source_specs:
  - ../../../03-module-specifications/07-vendor-management/vendor-onboarding.md
  - ../../../03-module-specifications/07-vendor-management/vendor-portal.md
  - ../../../03-module-specifications/07-vendor-management/vendor-bidding.md
last_updated: 2026-05-05
---

# Sprint 4 — Vendor Management (Context Template)

> Use this as the Sprint 4 vendor-management context sheet. It mirrors the sprint README style: summary → epic table → E2E flow → dependencies → notes.

## Sprint Goal (Vendor Management)

Deliver the **Phase 1 baseline** of Vendor Management so vendors can onboard, be verified, view/pursue bids, submit vehicle/driver details post-award, and receive real-time TO updates through the vendor portal.

## In Scope (Sprint 4)

- Vendor onboarding & registration: vendor self-registration (web/mobile) **and** platform-admin invite flow, vendor type (Contractual vs Non-Contractual), testimonial/reference capture, mandatory document uploads (Trade License, BIN, TIN), pending verification gate, audit logging, resubmission support, multiple vehicles per vendor profile.
- Vendor directory (platform): **Platform menu → Vendors** contains all vendors (self-registered + invited).
- Vendor verification workflow (platform): platform admin verification queue, approve/reject with mandatory remarks, real-time status updates.
- Vendor ↔ tenant membership: verified vendor can see all active tenants, request to join, and tenants can approve/reject vendor join.
- Vendor bidding portal: vendor can view active bids + submit structured bids (rate + vehicle availability) **only for tenants the vendor has joined and been approved for**, bid windows, prevent late bids, allow manual close/cancel.
- Bid evaluation (TDO): side-by-side bid comparison; select a single winner; winning log with user + timestamp.
- Vehicle & driver information submission: post-award submission; editable with reasoning + audit trail; substitution visibility to Transport.
- Real-time TO updates (vendor portal): vendor portal reflects TO status changes (Assigned/Completed/Closed); vendor cannot modify TO status.

## Out of Scope (Sprint 4)

- Bid position & probability indicator (Phase 3)
- Vendor billing & claims management (Phase 2)
- Vendor trip cost, billing & claims management (Phase 2)
- Vendor rating system (Phase 2)

---

## Epic: Vendor Onboarding & Verification

> Establish the vendor lifecycle entry point and gate portal access by compliance + admin approval.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Vendor Self-Registration (web/mobile) + platform invite onboarding](VM-01-vendor-onboarding-entry.md) | VM-01 | ~ | ~ | Pending |
| 2 | [Compliance Docs + Testimonial/Reference + multi-vehicle profile](VM-02-compliance-docs-and-profile.md) | VM-02 | ~ | ~ | Pending |
| 3 | [Platform Verification Queue + Approve/Reject (mandatory remarks) + resubmission](VM-03-admin-verification-workflow.md) | VM-03 | ~ | ~ | Pending |

---

## Epic: Vendor Portal & Operations

> Provide the vendor-facing interface to view bids/TOs/trips, submit bids, submit vehicle/driver details post-award, and receive real-time TO updates.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Vendor Portal — Tenants list + Active Bids/Trips/Completed Trips views + visibility rules](VM-04-vendor-portal-views.md) | VM-04 | ~ | ~ | Pending |
| 2 | [Vendor ↔ Tenant Join Requests + Tenant Approval + Visibility Scoping](VM-09-vendor-tenant-join-and-approval.md) | VM-09 | ~ | ~ | Pending |
| 3 | [Bid Submission — windowing + structured bid payload + late-bid prevention](VM-05-bid-submission.md) | VM-05 | ~ | ~ | Pending |
| 4 | [Vehicle & Driver Submission after award + editable with reasoning + audit trail](VM-06-vehicle-driver-submission.md) | VM-06 | ~ | ~ | Pending |
| 5 | [Real-time TO status updates in vendor portal (Assigned/Completed/Closed)](VM-07-realtime-to-updates.md) | VM-07 | ~ | ~ | Pending |

---

## Epic: TDO Bid Evaluation

> Enable Transport Distribution Officer (TDO) to compare bids and select winners for a TO.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Bid Comparison (side-by-side) + select single winner + winning log](VM-08-bid-evaluation.md) | VM-08 | ~ | ~ | Pending |

---

## Acceptance Criteria Template (per story)

Use this checklist under each VM story file (or inline here if you keep one file):

- **User / role**:
- **Preconditions**:
- **Happy path**:
- **Validations**:
- **State transitions**:
- **Audit log**:
- **Notifications**:
- **Error states**:
- **Security / RBAC**:
- **Tenant isolation**:
- **Test notes**:

---

## End-to-End Flow This Context Enables

```
Vendor discovers DFMS
  ↓
Onboarding entry:
  - Self-registration (company + vendor type + contact + testimonial/reference + docs)
  - Platform-admin invite → vendor completes profile (missing fields + docs)
  ↓
Status: PENDING_VERIFICATION
  ↓
Platform admin review
  ├─ Approve → Status: APPROVED → Vendor can access portal + bidding list
  └─ Reject (reason) → Status: REJECTED → Vendor can resubmit
  ↓
Vendor selects tenant(s):
  - View all active tenants
  - Request to join one or more tenants
  - Tenant approves vendor join request(s)
  ↓
Vendor portal (per joined tenant):
  - View bids (if Non-Contractual) within submission window → Submit bid
  - View TO/trip lists (active/completed) for joined tenants
  ↓
TDO evaluates bids → selects winner (single winner per TO) → winning log
  ↓
Vendor submits vehicle + driver + helper details (required after win, before trip start)
  ↓
Vendor sees real-time TO status updates (Assigned/Completed/Closed)
```

---

## Dependency Map (Vendor Management)

```
Auth/RBAC  ──→  Vendor onboarding forms + platform admin review actions
Master Data (vendor core) ──→  Vendor profile + portal identity
Notifications service  ──→  approve/reject + action-required alerts
Tenant membership  ──→  vendor visibility for bids/trips per tenant
Transport Orders / Trips  ──→  real-time TO status updates + active/completed trip lists
Vendor Bidding  ──→  bid windows + bid submission + TDO evaluation + award
```

---

## Notes / Decisions Log

- Vendors **cannot access bidding or TO details before approval**.
- Platform Admin controls vendor directory, invite, and verification.
- Tenant Admin cannot invite vendors and cannot see the global vendor list; tenant-side approval is only for vendor join requests to that tenant.
- Contractual vs Non-Contractual must be captured at onboarding and used for portal feature gating:
  - **Contractual**: direct TO assignment (no bidding).
  - **Non-Contractual**: bidding notifications + bid submission.
- Phase 2/3 capabilities are listed under **Out of Scope** to avoid scope creep.

