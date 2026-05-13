---
area: vendor-management
sprint: Sprint 4
status: Draft
source_specs:
  - ../../../05-modules/07-vendor-management/vendor-onboarding.md
  - ../../../05-modules/07-vendor-management/vendor-portal.md
  - ../../../05-modules/07-vendor-management/vendor-bidding.md
last_updated: 2026-05-12
---

# Sprint 4 — Vendor Management (Context Template)

> Use this as the Sprint 4 vendor-management context sheet. It mirrors the sprint README style: summary → epic table → E2E flow → dependencies → notes.  
> **TDO – Vendor Fleet, vendor execution, and own-fleet availability** are traced in **[`../09-to-execution-vendor-fleet/README.md`](../09-to-execution-vendor-fleet/README.md)** (TEVF-01…04).

## Mobile app context (quick entrypoint)

- Sprint 4 entrypoint (this folder): [`VENDOR-MOBILE-CONTEXT.md`](VENDOR-MOBILE-CONTEXT.md)
- Source-of-truth specs: [`05-modules/09-mobile-apps/vendor-mobile/`](../../../../05-modules/09-mobile-apps/README.md)

## Sprint Goal (Vendor Management)

Deliver the **Phase 1 baseline** of Vendor Management so vendors can onboard, complete registration, view/pursue bids, submit vehicle/driver details post-award, and receive real-time TO updates through the vendor portal.

## In Scope (Sprint 4)

- Vendor onboarding & registration: vendor self-registration via **Vendor Mobile** (initial scope; web deferred) **and** platform-admin invite flow; **tenant-assigned vendor type on join approval (VM-03)**; testimonial/reference capture, mandatory document uploads (Trade License, BIN, TIN), company profile only (**no** vehicle/driver master data at registration — VM-02); **no** Platform Admin verification queue after sign-up; audit logging, profile/doc update support.
- Vendor directory (platform): **Platform menu → Vendors** contains all vendors (self-registered + invited).
- Vendor ↔ tenant membership: vendor with **completed registration** can see all active tenants, request to join, and tenants can approve/reject vendor join.
- Vendor bidding portal: vendor can view active bids + submit competitive bids **only for tenants the vendor has joined and been approved for**. Bid lifecycle includes: bid windows + late-bid prevention, **one-bid-per-vendor-per-TO**, **mandatory offered rate + offered vehicle count** (VM-06), **no bid edit after submit** (withdraw before deadline only if enabled), and manual close/cancel (VM-05/06).
- Bid evaluation (TDO): side-by-side bid comparison; sortable views; **select one or more winners** when the TO model requires split award (VM-07); reject-all with reason; **winning log with user + timestamp**; basic statistics (min/avg/max) and optional recommendation logic.
- **Contractual vendors:** direct TO assignment without bidding; **contractual rates** backend-controlled and **hidden from vendor portal** (see [TEVF-01](../09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md)).
- Vehicle & driver information submission: **Phase 1 simplified** — vendors provide vehicle/driver/helper details **only after award/assignment** (before trip start), via a one-off submission per TO; updates require **reason + audit trail**; substitutions must be visible to Transport.
- Real-time TO updates (vendor portal): vendor portal reflects TO status changes (Assigned/Completed/Closed); vendor cannot modify TO status.
- Notifications: vendors + TDO receive in-app/email notifications for publish, new bids, deadline reminders, award/rejection, cancel/close events.

## Out of Scope (Sprint 4)

- Bid position & probability indicator (Phase 3)
- Vendor billing & claims management (Phase 2)
- Vendor trip cost, billing & claims management (Phase 2)
- Vendor rating system (Phase 2)

---

## Epic: Vendor Onboarding & Verification

> Establish the vendor lifecycle entry point; **tenant join (VM-02)** gates tenant bids/TOs. There is **no** Platform Admin verification queue after vendor sign-up. Backlog files are numbered **VM-01 … VM-08** in delivery order.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Vendor Mobile Onboarding (Self-registration/invite + compliance docs + company profile)](VM-01-vendor-mobile-onbiorading.md) | VM-01/02 | ~ | ~ | Pending |

---

## Epic: Vendor Portal & Operations

> Provide the vendor-facing interface to view bids/TOs/trips, submit bids, submit vehicle/driver details post-award, and receive real-time TO updates.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Vendor ↔ Tenant Join + approval + tenant-assigned vendor type + visibility](VM-02-vendor-tenant-join-and-approval.md) | VM-02 | ~ | ~ | Pending |
| 2 | [Vendor Portal — Tenants list + Active Bids/Trips/Completed Trips views + visibility rules](VM-03-vendor-portal-views.md) | VM-03 | ~ | ~ | Pending |
| 3 | [Bid Submission — windowing + structured bid payload + late-bid prevention](VM-05-bid-submission.md) | VM-05 | ~ | ~ | Pending |
| 4 | [Bid/TO requirements + vehicle–driver confirmation (post-award, + audit)](VM-07-vehicle-driver-submission.md) | VM-07 | ~ | ~ | Pending |
| 5 | [Real-time TO status updates in vendor portal (Assigned/Completed/Closed)](VM-08-realtime-to-updates.md) | VM-08 | ~ | ~ | Pending |

---

## Epic: TDO Bid Evaluation

> Enable Transport Distribution Officer (TDO) to compare bids and select winners for a TO.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Publish TO to Bidding Portal (deadline + eligibility + notify)](VM-04-tdo-publish-to-bidding-portal.md) | VM-04 | ~ | ~ | Pending |
| 2 | [Bid Comparison + select winner(s) + reject-all + winning log](VM-06-bid-evaluation.md) | VM-06 | ~ | ~ | Pending |

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

The flow **forks at tenant-join approval (VM-02)** based on the **per-tenant vendor type** the Tenant Admin assigns. Everything from VM-07 onward is **identical for both paths**.

```mermaid
flowchart TD
  D[Vendor discovers DFMS] --> O[VM-01 Onboarding<br/>self-register on Vendor Mobile OR platform-admin invite]
  O --> DOC[Mandatory docs + profile complete<br/>Trade License + BIN + TIN + testimonial]
  DOC --> PA[Vendor is PLATFORM-ACTIVE<br/>no platform-admin approval step]
  PA --> TJ[VM-02 Request to join tenant(s)]
  TJ --> AP{Tenant Admin approves?}
  AP -- Reject + remarks --> NO[Vendor cannot see tenant bids/TOs]
  AP -- Approve + sets vendor_type<br/>per (vendor, tenant) --> FORK{vendor_type<br/>for this tenant}

  FORK -- CONTRACTUAL --> CA[TDO directly assigns TO<br/>TEVF-01<br/>contractual rate applied server-side<br/>rate HIDDEN from vendor]
  FORK -- NON_CONTRACTUAL --> PUB[TDO publishes TO to bidding portal<br/>VM-04 / TEVF-02<br/>deadline + required_vehicle_count + vehicle type + reference rate?]

  PUB --> SUB[Vendor submits bid VM-05<br/>proposed_cost + offered_vehicle_count + remarks?<br/>immutable after submit; withdraw before close if policy]
  SUB --> EV[TDO evaluates bids VM-06<br/>side-by-side compare; sort; min/avg/max stats]
  EV -- Reject-all + reason --> END1[Bidding session closed<br/>all bidders notified]
  EV -- Award 1 or more winners<br/>per-vendor awarded_vehicle_count --> WIN[Winning bid(s) ACCEPTED<br/>non-winning REJECTED/CLOSED<br/>winning log audited]

  CA --> CONF[VM-07 vehicle/driver/helper confirmation<br/>before trip start<br/>updates require reason + audit]
  WIN --> CONF
  CONF --> RDY[TO -> READY_FOR_DISPATCH]
  RDY --> RT[VM-08 real-time TO status<br/>Assigned -> Completed -> Closed<br/>vendor cannot modify status]
  RT --> POD[POD + GRN copy uploads when required]
  POD --> INV[After Completed: vendor uploads invoice]
```

### Path comparison (side-by-side)

| Aspect | Contractual (TEVF-01) | Non-Contractual (TEVF-02) |
|---|---|---|
| TO assignment trigger | TDO direct assignment | TDO publishes bidding session (VM-04) |
| Vendor must submit a bid? | No | Yes (VM-05) |
| Rate source | Backend contractual rate tables | Vendor-submitted `proposed_cost` |
| Rate shown in vendor mobile | **Hidden** | Visible (vendor's own bid amount) |
| Mobile screens **shown** | Assigned TOs, Trips, Profile, Tenants | Bids, Assigned TOs, Trips, Profile, Tenants |
| Mobile screens **hidden** for this tenant | Bid Opportunities + Bid Submission | — |
| Selection / split capacity | Multi-vendor direct assignment | Multi-winner award per `awarded_vehicle_count` (VM-06) |
| Cancellation | TDO reassign / cancel (audited) | TDO reject-all + reason; vendor withdraw (policy) |
| Common from this point on | **VM-07** (vehicle/driver/helper confirmation) → **VM-08** (status) → POD / GRN / invoice gating | same |

---

## Dependency Map (Vendor Management)

```
Auth/RBAC  ──→  Vendor onboarding forms (VM-01/VM-02) + platform admin invite only
Master Data (vendor core) ──→  Vendor profile + portal identity
Notifications service  ──→  tenant join + bidding + action-required alerts
Tenant membership  ──→  vendor visibility for bids/trips per tenant
Transport Orders / Trips  ──→  real-time TO status updates + active/completed trip lists
Vendor Bidding  ──→  publish → bid windows + bid submission (immutable after submit; withdraw optional) + TDO evaluation + award/reject-all
```

---

## Traceability — Sprint 4 ↔ Vendor Mobile App

This maps Sprint 4 vendor-management backlog items to the Vendor Mobile App split specs and the main backend touchpoints. **Vendor-type applicability** is called out so engineers know which screens/endpoints are conditional on `(vendor, tenant).vendor_type`.

| Sprint item | Applies to | Mobile app context file(s) | Backend touchpoints (high-level) |
|------------|------------|-----------------------------|----------------------------------|
| **VM-01** Vendor onboarding (self/invite + docs/profile) | Both | `01-onboarding-and-verification.md`, `09-profile-management.md` | Vendor registration, invite acceptance, auth bootstrap, document upload (Trade License/BIN/TIN), testimonial; no vehicle/driver master |
| **VM-02** Vendor ↔ tenant join + tenant sets per-tenant `vendor_type` | Both (decides fork) | `02-tenant-membership.md` | Active tenants list, join request create, tenant approve (with `vendor_type`) / reject; membership record `(vendor_id, tenant_id, status, vendor_type)` |
| **VM-03** Vendor portal views — gated by per-tenant `vendor_type` | Both (gated) | `03-bid-opportunities-list.md` (NC only), `05-assigned-tos-list.md`, `07-active-trip-tracking.md`, `08-completed-trip-history.md` | Vendor-scoped lists for bids/TOs/trips with `(vendor_id, tenant_id)` scope + `vendor_type` filter on bid surfaces |
| **VM-04** TDO publish TO to bidding portal | Non-Contractual only | *(admin/TDO surface; mobile consumes publish via bid opportunities list)* | Publish session + eligibility + notifications (TEVF-02) |
| **VM-05** Bid submission | Non-Contractual only | `04-bid-submission.md` | Bid submit endpoint + bid window validation; immutable after submit; withdraw (policy) |
| **VM-06** Bid evaluation (TDO surface) | Non-Contractual only | *(mobile sees outcomes via status changes in lists/details)* | Award endpoint (per-vendor `awarded_vehicle_count`) + winning log + reject-all (with reason) |
| **VM-07** Bid/TO requirements + vehicle–driver confirmation | Both | `06-post-award-driver-vehicle-submission.md` | Post-award confirmation endpoint; update-with-reason + audit; POD/GRN upload; invoice gated to Completed |
| **VM-08** Real-time TO updates | Both | `07-active-trip-tracking.md`, `10-security-and-access-control.md` | TO/trip status event feed (polling/websocket); vendor read-only on TO status |

---

## Notes / Decisions Log

- Vendors **cannot access tenant bidding or TO details** until **tenant join** is approved (**VM-02**).
- Platform Admin controls vendor directory and invite; **does not** run a registration verification queue after sign-up.
- Tenant Admin cannot invite vendors and cannot see the global vendor list; tenant-side approval is only for vendor join requests to that tenant.
- **Per-tenant vendor type (VM-02):** Tenant Admin sets **Contractual** vs **Non-Contractual** when approving a vendor join request; this is the **fork** that drives portal feature gating and the TO-assignment path:
  - **Contractual**: direct TO assignment (no bidding); contractual rate applied server-side; **rate hidden** from vendor mobile + portal ([TEVF-01](../09-to-execution-vendor-fleet/TEVF-01-contractual-vendor-assignment.md)).
  - **Non-Contractual**: bid submission required (rate + offered vehicle count); vendor sees their own bid amount ([TEVF-02](../09-to-execution-vendor-fleet/TEVF-02-non-contractual-bidding.md)).
- **Vendor type is scoped per (vendor, tenant)** — a single vendor can be Contractual for Tenant A and Non-Contractual for Tenant B; gating evaluates independently per tenant.
- **Common execution leg:** Once the TO reaches `ASSIGNED` (either path), the downstream flow is identical — **VM-07** (vehicle/driver/helper confirmation) → **VM-08** (real-time status) → POD / GRN / invoice (invoice gated to `Completed`). See [TEVF-03](../09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md).
- **Mobile screen visibility rules** (source of truth: [`VENDOR-MOBILE-CONTEXT.md`](VENDOR-MOBILE-CONTEXT.md)):
  - Bid Opportunities + Bid Submission screens are **only** populated for tenants where the vendor is `NON_CONTRACTUAL`.
  - Rate fields (TO Details, Assigned TOs, Completed Trip History) are **hidden** when `assignment_type=CONTRACTUAL`.
- **Own-fleet availability (TEVF-04):** not vendor-bidding scope — see [TEVF-04](../09-to-execution-vendor-fleet/TEVF-04-fleet-availability-own-fleet.md). Do not conflate vendor `offered_vehicle_count` with own-fleet MDM status.
- Phase 2/3 capabilities are listed under **Out of Scope** to avoid scope creep.

