---
area: vendor-management
artifact: mobile-app-context
sprint: Sprint 4
source_of_truth:
  - ../../../../05-modules/09-mobile-apps/vendor-mobile/
last_updated: 2026-05-12
---

# Sprint 4 — Vendor Management — Vendor Mobile App Context

This page exists so the Sprint 4 vendor-management backlog can be navigated **from the sprint folder** while keeping the **source-of-truth mobile specs** in:

- `DFMS-product-context/05-modules/09-mobile-apps/vendor-mobile/`

## Where to read the full Vendor Mobile App specs (source of truth)

- **Vendor Mobile App index**: [`vendor-mobile/README.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/README.md)
- **01 — Onboarding & verification**: [`01-onboarding-and-verification.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/01-onboarding-and-verification.md)
- **02 — Tenant membership**: [`02-tenant-membership.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/02-tenant-membership.md)
- **03 — Bid opportunities list**: [`03-bid-opportunities-list.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/03-bid-opportunities-list.md)
- **04 — Bid submission**: [`04-bid-submission.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/04-bid-submission.md)
- **05 — Assigned TOs list**: [`05-assigned-tos-list.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/05-assigned-tos-list.md)
- **06 — Post-award driver/vehicle submission**: [`06-post-award-driver-vehicle-submission.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/06-post-award-driver-vehicle-submission.md)
- **07 — Active trip tracking**: [`07-active-trip-tracking.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/07-active-trip-tracking.md)
- **08 — Completed trip history**: [`08-completed-trip-history.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/08-completed-trip-history.md)
- **09 — Profile management**: [`09-profile-management.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/09-profile-management.md)
- **10 — Security & access control**: [`10-security-and-access-control.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/10-security-and-access-control.md)
- **11 — Integration & design decisions**: [`11-integration-and-design-decisions.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/11-integration-and-design-decisions.md)

## Sprint 4 backlog ↔ Vendor Mobile App mapping (quick navigation)

Backlog files are numbered **VM-01 … VM-09** in delivery order (see [`README.md`](README.md)).

| Sprint item | Sprint 4 file | Vendor Mobile App context file(s) |
|---|---|---|
| VM-01 Vendor onboarding entry (self/invite) | [`VM-01-vendor-onboarding-entry.md`](VM-01-vendor-onboarding-entry.md) | [`01-onboarding-and-verification.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/01-onboarding-and-verification.md) |
| VM-02 Compliance docs + company profile | [`VM-02-compliance-docs-and-profile.md`](VM-02-compliance-docs-and-profile.md) | [`01-onboarding-and-verification.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/01-onboarding-and-verification.md), [`09-profile-management.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/09-profile-management.md) |
| VM-03 Vendor ↔ tenant join | [`VM-03-vendor-tenant-join-and-approval.md`](VM-03-vendor-tenant-join-and-approval.md) | [`02-tenant-membership.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/02-tenant-membership.md) |
| VM-04 Vendor portal views | [`VM-04-vendor-portal-views.md`](VM-04-vendor-portal-views.md) | [`03-bid-opportunities-list.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/03-bid-opportunities-list.md), [`05-assigned-tos-list.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/05-assigned-tos-list.md), [`07-active-trip-tracking.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/07-active-trip-tracking.md), [`08-completed-trip-history.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/08-completed-trip-history.md) |
| VM-05 TDO publish TO to bidding portal | [`VM-05-tdo-publish-to-bidding-portal.md`](VM-05-tdo-publish-to-bidding-portal.md) | *(admin/TDO surface; mobile consumes publish via bid opportunities)* |
| VM-06 Bid submission | [`VM-06-bid-submission.md`](VM-06-bid-submission.md) | [`04-bid-submission.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/04-bid-submission.md) |
| VM-07 Bid evaluation (TDO/admin surface) | [`VM-07-bid-evaluation.md`](VM-07-bid-evaluation.md) | *(mobile sees outcomes via status changes in lists/details)* |
| VM-08 Bid/TO requirements + vehicle–driver confirmation | [`VM-08-vehicle-driver-submission.md`](VM-08-vehicle-driver-submission.md) | [`06-post-award-driver-vehicle-submission.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/06-post-award-driver-vehicle-submission.md) |
| VM-09 Real-time TO updates | [`VM-09-realtime-to-updates.md`](VM-09-realtime-to-updates.md) | [`07-active-trip-tracking.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/07-active-trip-tracking.md), [`10-security-and-access-control.md`](../../../../05-modules/09-mobile-apps/vendor-mobile/10-security-and-access-control.md) |

## Sprint 4 note (tracking vs driver mobile)

Sprint 4 includes tracking backend + dashboard work that references a **Driver Mobile app** (separate from Vendor Mobile).
If you’re looking for that, start from:

- `../02-trip-closure-tracking/TC-03-realtime-map-tracking.md`
