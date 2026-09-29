# 15-mobile-apps — Mobile Interfaces

## Module Overview

Mobile and field interfaces for DFMS users.

**Purpose**: Document Vendor Mobile (implemented Flutter) and clarify Driver/QC status  
**Phase**: Phase 1 — Vendor Mobile active  
**Architecture**: [`../../04-architecture/09-mobile/`](../../04-architecture/09-mobile/)  
**Dev guides**: [`../../08-development-guides/02-mobile/`](../../08-development-guides/02-mobile/)

---

## Status by client

| Client | Phase 1 status | Spec SSOT |
|--------|----------------|-----------|
| **Vendor Mobile** | Implemented Flutter (`nourish-vendor-app`) | **[`vendor-mobile/`](vendor-mobile/)** (split files) |
| **Driver** | Responsive Django Admin — **not Flutter** | [`../03-users/driver-interface-sprint4.md`](../03-users/driver-interface-sprint4.md); PRD-era [`driver-mobile.md`](driver-mobile.md) is aspirational |
| **QC** | Not an implemented Flutter app | [`qc-mobile.md`](qc-mobile.md) aspirational / future |

---

## Specifications

| File / folder | Description | Status |
|---------------|-------------|--------|
| [`vendor-mobile/`](vendor-mobile/) | Split Vendor Mobile product SSOT (navigation, onboarding, bids, TOs, trips, profile, security) | **Current** |
| [`vendor-mobile.md`](vendor-mobile.md) | Legacy monolith | **Deprecated** — redirect only |
| [`driver-mobile.md`](driver-mobile.md) | Flutter driver PRD-era spec | **Not Phase 1 implementation** |
| [`qc-mobile.md`](qc-mobile.md) | QC tablet/mobile PRD-era spec | **Not Phase 1 Flutter** |

---

## Related

- Backlog entrypoint: [`../../03-backlog/phase-1/sprints/sprint-4/08-vendor-management/VENDOR-MOBILE-CONTEXT.md`](../../03-backlog/phase-1/sprints/sprint-4/08-vendor-management/VENDOR-MOBILE-CONTEXT.md)
- Testing: [`../../09-testing/mobile/`](../../09-testing/mobile/)
- Endpoint map: [`../../04-architecture/09-mobile/03-backend-integration/endpoint-map.md`](../../04-architecture/09-mobile/03-backend-integration/endpoint-map.md)

---

**Last Updated**: 2026-09-16  
**Status**: Active (Vendor Mobile)
