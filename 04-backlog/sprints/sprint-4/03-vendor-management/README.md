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

## Mobile app context (quick entrypoint)

- Sprint 4 entrypoint (this folder): [`VENDOR-MOBILE-CONTEXT.md`](VENDOR-MOBILE-CONTEXT.md)
- Source-of-truth specs: [`03-module-specifications/09-mobile-apps/vendor-mobile/`](../../../03-module-specifications/09-mobile-apps/vendor-mobile/)

## Sprint Goal (Vendor Management)

Deliver the **Phase 1 baseline** of Vendor Management so vendors can onboard, be verified, view/pursue bids, submit vehicle/driver details post-award, and receive real-time TO updates through the vendor portal.

## In Scope (Sprint 4)

- Vendor onboarding & registration: vendor self-registration (web/mobile) **and** platform-admin invite flow, vendor type (Contractual vs Non-Contractual), testimonial/reference capture, mandatory document uploads (Trade License, BIN, TIN), pending verification gate, audit logging, resubmission support, multiple vehicles per vendor profile.
- Vendor directory (platform): **Platform menu → Vendors** contains all vendors (self-registered + invited).
- Vendor verification workflow (platform): platform admin verification queue, approve/reject with mandatory remarks, real-time status updates.
- Vendor ↔ tenant membership: verified vendor can see all active tenants, request to join, and tenants can approve/reject vendor join.
- Vendor bidding portal: vendor can view active bids + submit competitive bids **only for tenants the vendor has joined and been approved for**. Bid lifecycle includes: bid windows + late-bid prevention, **one-bid-per-vendor-per-TO** (edit/withdraw allowed until deadline), and manual close/cancel.
- Bid evaluation (TDO): side-by-side bid comparison; sortable views; select a single winner; reject-all with reason; **winning log with user + timestamp**; basic statistics (min/avg/max) and optional recommendation logic.
- Vehicle & driver information submission: vendors provide vehicle/driver/helper details for execution. **Default: submit at bid time** (select vehicle, driver, helper) and allow **post-award update with reason + audit trail**; substitutions must be visible to Transport.
- Real-time TO updates (vendor portal): vendor portal reflects TO status changes (Assigned/Completed/Closed); vendor cannot modify TO status.
- Notifications: vendors + TDO receive in-app/email notifications for publish, new bids, deadline reminders, award/rejection, cancel/close events.

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
| 1 | [Publish TO to Bidding Portal (deadline + eligibility + notify)](VM-10-tdo-publish-to-bidding-portal.md) | VM-10 | ~ | ~ | Pending |
| 2 | [Bid Comparison (side-by-side) + select single winner + reject-all + winning log](VM-08-bid-evaluation.md) | VM-08 | ~ | ~ | Pending |

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
  ├─ Approve → Status: APPROVED → Vendor can access portal + tenants list
  └─ Reject (reason) → Status: REJECTED → Vendor can resubmit
  ↓
Vendor selects tenant(s):
  - View all active tenants
  - Request to join one or more tenants
  - Tenant approves vendor join request(s)
  ↓
TDO publishes TO to bidding portal (per tenant) with deadline + eligibility criteria
  ↓
Vendor portal (per joined tenant):
  - View TOs open for bidding (Non-Contractual) within submission window → Submit/Update/Withdraw bid
  - View TO/trip lists (active/completed) for joined tenants
  ↓
TDO evaluates bids → selects winner (single winner per TO) OR reject-all → winning log + notifications
  ↓
Vendor confirms/updates vehicle + driver + helper details (required after win, before trip start; updates require reason)
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
Vendor Bidding  ──→  publish → bid windows + bid submission (edit/withdraw) + TDO evaluation + award/reject-all
```

---

## Traceability — Sprint 4 ↔ Vendor Mobile App

This maps Sprint 4 vendor-management backlog items to the Vendor Mobile App split specs and the main backend touchpoints.

| Sprint item | Mobile app context file(s) | Backend touchpoints (high-level) |
|------------|-----------------------------|----------------------------------|
| VM-01 Vendor onboarding entry (self/invite) | `03-module-specifications/09-mobile-apps/vendor-mobile/01-overview-and-gates.md` | Vendor registration, invite acceptance, auth bootstrap |
| VM-02 Compliance docs + profile | `03-module-specifications/09-mobile-apps/vendor-mobile/01-overview-and-gates.md`, `.../05-profile-management.md` | Document upload, vendor profile CRUD (vehicles/drivers) |
| VM-03 Platform verification | `03-module-specifications/09-mobile-apps/vendor-mobile/01-overview-and-gates.md` | Platform verification queue + approve/reject + status events |
| VM-09 Vendor ↔ tenant join | `03-module-specifications/09-mobile-apps/vendor-mobile/01-overview-and-gates.md` | Active tenants list, join request create, tenant approve/reject |
| VM-04 Vendor portal views | `03-module-specifications/09-mobile-apps/vendor-mobile/02-bids.md`, `.../03-assigned-tos-and-post-award.md`, `.../04-trip-tracking-and-history.md` | Vendor-scoped lists for bids/TOs/trips (tenant membership scoped) |
| VM-05 Bid submission | `03-module-specifications/09-mobile-apps/vendor-mobile/02-bids.md` | Bid submit endpoint + bid window validation |
| VM-08 Bid evaluation (TDO) | *(admin/TDO surface; affects mobile via status + notifications)* | Award endpoint + winning log + vendor notification trigger |
| VM-06 Vehicle/driver submission after award | `03-module-specifications/09-mobile-apps/vendor-mobile/03-assigned-tos-and-post-award.md`, `.../05-profile-management.md` | Post-award assignment endpoint; update-with-reason + audit |
| VM-07 Real-time TO updates | `03-module-specifications/09-mobile-apps/vendor-mobile/04-trip-tracking-and-history.md`, `.../06-technical-security-integration.md` | TO/trip status event feed (polling/push) |

---

## Notes / Decisions Log

- Vendors **cannot access bidding or TO details before approval**.
- Platform Admin controls vendor directory, invite, and verification.
- Tenant Admin cannot invite vendors and cannot see the global vendor list; tenant-side approval is only for vendor join requests to that tenant.
- Contractual vs Non-Contractual must be captured at onboarding and used for portal feature gating:
  - **Contractual**: direct TO assignment (no bidding).
  - **Non-Contractual**: bidding notifications + bid submission.
- Phase 2/3 capabilities are listed under **Out of Scope** to avoid scope creep.

