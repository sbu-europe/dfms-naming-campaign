---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Vendor Mobile Application, Vendor Portal Access (Bidding & Trip Management)
extracted_date: 2026-02-13
last_updated: 2026-05-13
document_type: domain_specification
related_modules: [vendor-portal, vendor-bidding, trip-management]
---

# Vendor Mobile Application — Split Context Index

This directory is the **source-of-truth index** for the Vendor Mobile Application specification (split into focused context files).

## Contents

- [00-navigation-and-information-architecture.md](00-navigation-and-information-architecture.md) — IA, gating, navigation flow, vendor-type branching
- [01-onboarding-and-verification.md](01-onboarding-and-verification.md) — entry paths, no-platform-verification model
- [02-tenant-membership.md](02-tenant-membership.md) — tenant join + tenant sets per-tenant vendor type
- [03-bid-opportunities-list.md](03-bid-opportunities-list.md) — *(Non-Contractual only)*
- [04-bid-submission.md](04-bid-submission.md) — *(Non-Contractual only)* rate + offered vehicle count
- [05-assigned-tos-list.md](05-assigned-tos-list.md) — *(both)* convergence point for BID_WON + CONTRACTUAL
- [06-post-award-driver-vehicle-submission.md](06-post-award-driver-vehicle-submission.md) — *(both)* VM-07 common leg
- [07-active-trip-tracking.md](07-active-trip-tracking.md) — *(both)* trip status + map
- [08-completed-trip-history.md](08-completed-trip-history.md) — *(both)* rate hidden for Contractual
- [09-profile-management.md](09-profile-management.md) — vendor profile + tenant memberships
- [10-security-and-access-control.md](10-security-and-access-control.md) — auth + vendor isolation + tenant scope
- [11-integration-and-design-decisions.md](11-integration-and-design-decisions.md) — integration + rationale
- [12-vendor-type-flows.md](12-vendor-type-flows.md) — **canonical Contractual vs Non-Contractual journey map**

## Quick reference

- **The vendor-type fork is documented end-to-end in [`12-vendor-type-flows.md`](12-vendor-type-flows.md).** Start there to understand which screens / fields each vendor type sees.
- The sprint-folder entrypoint that maps these specs to backlog items is [`VENDOR-MOBILE-CONTEXT.md`](../../../03-backlog/sprints/sprint-4/08-vendor-management/VENDOR-MOBILE-CONTEXT.md).

