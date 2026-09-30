---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Vendor Mobile Application, Vendor Portal Access (Bidding & Trip Management)
extracted_date: 2026-02-13
last_updated: 2026-09-16
document_type: domain_specification
related_modules: [vendor-portal, vendor-bidding, trip-management]
source_of_truth: true
---

# Vendor Mobile Application — Split Context Index

This directory is the **source-of-truth** for Vendor Mobile **product** behavior (screens, gates, vendor-type rules).

| Layer | Location |
|-------|----------|
| Product (this folder) | UX / business rules |
| Flutter architecture | [`../../../04-architecture/09-mobile/`](../../../04-architecture/09-mobile/) |
| How-to | [`../../../08-development-guides/02-mobile/`](../../../08-development-guides/02-mobile/) |
| Code | `nourish-vendor-app` |
| E2E | [`../../../09-testing/mobile/`](../../../09-testing/mobile/) + `.maestro/` |

> Legacy monolith [`../vendor-mobile.md`](../vendor-mobile.md) is **deprecated**.

## Contents

- [00-navigation-and-information-architecture.md](00-navigation-and-information-architecture.md) — IA, gating, navigation flow, vendor-type branching
- [01-onboarding-and-verification.md](01-onboarding-and-verification.md) — entry paths, phone gate, registration
- [02-tenant-membership.md](02-tenant-membership.md) — tenant join + tenant sets per-tenant vendor type
- [03-bid-opportunities-list.md](03-bid-opportunities-list.md) — *(Non-Contractual only)*
- [04-bid-submission.md](04-bid-submission.md) — *(Non-Contractual only)* rate + offered vehicle count
- [05-assigned-tos-list.md](05-assigned-tos-list.md) — *(both)* convergence point for BID_WON + CONTRACTUAL
- [06-post-award-driver-vehicle-submission.md](06-post-award-driver-vehicle-submission.md) — *(both)* VM-07 common leg
- [07-active-trip-tracking.md](07-active-trip-tracking.md) — *(both)* trip status + map
- [08-completed-trip-history.md](08-completed-trip-history.md) — *(both)* rate hidden for Contractual; **VRS-02 post-trip tenant rating** (Phase 2)
- [09-profile-management.md](09-profile-management.md) — vendor profile + settings
- [10-security-and-access-control.md](10-security-and-access-control.md) — auth + vendor isolation + tenant scope
- [11-integration-and-design-decisions.md](11-integration-and-design-decisions.md) — integration + rationale
- [12-vendor-type-flows.md](12-vendor-type-flows.md) — **canonical Contractual vs Non-Contractual journey map**

## Code ↔ spec map (summary)

Full table: [`../../../04-architecture/09-mobile/04-feature-map.md`](../../../04-architecture/09-mobile/04-feature-map.md).

| Spec | Feature folder |
|------|----------------|
| 00, shell | `main_shell/`, `splash/` |
| 01 | `auth/`, `onboarding/` |
| 02 | `tenant_directory/` |
| 03–04 | `bids/` |
| 05–06 | `assigned_tos/` |
| 07–08 | `trips/` |
| 09 | `vendor_profile/`, `settings/` |

## Quick reference

- Start with [`12-vendor-type-flows.md`](12-vendor-type-flows.md) for Contractual vs Non-Contractual.
- Sprint entrypoint: [`VENDOR-MOBILE-CONTEXT.md`](../../../03-backlog/phase-1/sprints/sprint-4/08-vendor-management/VENDOR-MOBILE-CONTEXT.md).
