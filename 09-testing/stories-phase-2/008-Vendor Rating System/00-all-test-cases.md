---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: Vendor Rating System — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-29
---

# Vendor Rating System — All TDD test cases (index)

Master index. Detail + asserts live in per-story files.

**v1 shape:** single 1–5 score + 3 optional random Yes/No radios (bidirectional). `average_rating` is 70% stars and up to 30% questions (Yes = 5, No = 1). A skip is not a No. No multi-criterion star panels.

**Automation (2026-09-29):** **Passing** means an automated test exists and has been run successfully. **Partial** means a test exists but only covers part of the assert. **Planned** means there is no automated test. Vendor-app rating flows `01`–`04` passed on emulator-5554. Bid-list rating, award snapshot, vendor-list sort, and the minimum-rating filter are not built, so those VRS-03 rows stay Planned.

Unit: `nourish-backend/tests/unit/test_vendors/test_vendor_rating_*.py`, vendor-app `domain/test/rating_blend_test.dart`, `data/test/repository/tenant_rating_repository_impl_test.dart`. Portal (run, 3 passed): `nourish-backend/tests/e2e/modules/vendors/test_vendor_rating_portal_e2e.py`. Phone (written, not run): `nourish-vendor-app/.maestro/flows/ratings/`.

## VRS-01 — Post-TO vendor rating (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-01-TC01 | AC-1.1 | API | COMPLETED/closed → pending VendorRating | P0 | Planned |
| VRS-01-TC02 | AC-1.2 | E2E/API | Rate Vendor CTA on TO detail | P0 | Passing |
| VRS-01-TC03 | AC-1.3 | API | One rating per TO — reopen existing | P0 | Planned |
| VRS-01-TC04 | AC-1.4 | E2E | Rate from Vendor Profile history | P1 | Planned |
| VRS-01-TC05 | AC-2.1 | E2E | Single star + 3 Y/N radios | P0 | Passing |
| VRS-01-TC06 | AC-2.2 | E2E/API | Score required; answers optional | P0 | Passing |
| VRS-01-TC07 | AC-2.3 | E2E | Locked question set on refresh | P1 | Planned |
| VRS-01-TC08 | AC-3.1 | API | Seed pool + random 3 | P0 | Partial |
| VRS-01-TC09 | AC-3.2 | API | RatingQuestion API random=3 | P1 | Planned |
| VRS-01-TC10 | AC-4.1 | Unit | Blended average_rating (70/30, skips) | P0 | Passing |
| VRS-01-TC11 | AC-4.2 | Unit | Rolling Vendor.rating uses blend | P0 | Passing |
| VRS-01-TC12 | AC-4.3 | Unit | First rating sets Vendor.rating from blend | P0 | Passing |
| VRS-01-TC13 | AC-5.1 | API | Submit persists score + 3 answers | P0 | Planned |
| VRS-01-TC14 | AC-5.2 | API | Immutable after submit | P0 | Partial |
| VRS-01-TC15 | AC-5.3 | API | Audit VENDOR_RATING_SUBMITTED | P0 | Planned |
| VRS-01-TC16 | AC-6.1 | API | Vendor 403 on own rating | P0 | Planned |
| VRS-01-TC17 | AC-6.2 | API | Admin roles can view | P0 | Planned |

→ [VRS-01 detail](./VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md)

## VRS-02 — Vendor rates tenant (mobile / API)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-02-TC01 | AC-1.1 | Maestro | Rate this Tenant after ACK | P0 | Planned |
| VRS-02-TC02 | AC-1.2 | Maestro | Prompt skippable | P0 | Passing |
| VRS-02-TC03 | AC-1.3 | Maestro | Rate from trip detail after skip | P0 | Passing |
| VRS-02-TC04 | AC-1.4 | API/Maestro | One rating per TO idempotent | P0 | Planned |
| VRS-02-TC05 | AC-2.1 | Maestro | Single star + 3 Y/N radios | P0 | Passing |
| VRS-02-TC06 | AC-2.2 | Maestro | Submit disabled until stars; answers optional | P0 | Passing |
| VRS-02-TC07 | AC-2.3 | Maestro | Theme continuity (existing app theme) | P2 | Planned |
| VRS-02-TC08 | AC-3.1 | API/Maestro | Three random questions loaded | P0 | Passing |
| VRS-02-TC09 | AC-3.2 | Maestro/API | Pool &lt; 3 error | P1 | Partial |
| VRS-02-TC10 | AC-4.1 | API | Atomic submit + rolling Tenant.vendor_rating on blend | P0 | Partial |
| VRS-02-TC11 | AC-4.2 | API | Duplicate submit → 400 | P0 | Partial |
| VRS-02-TC12 | AC-4.3 | API | Immutable after submit | P0 | Partial |
| VRS-02-TC13 | AC-4.4 | Maestro | Success screen with score | P1 | Passing |
| VRS-02-TC14 | AC-5.1 | Maestro/API | Join Tenant aggregate (overall only) | P0 | Passing |
| VRS-02-TC15 | AC-5.2 | Maestro | No ratings yet copy | P0 | Passing |
| VRS-02-TC16 | AC-6.1 | Maestro/API | Own submitted rating read-only | P0 | Passing |
| VRS-02-TC17 | AC-7.1 | API/E2E | Admin incoming ratings list | P0 | Planned |
| VRS-02-TC18 | AC-7.2 | E2E/API | Admin summary card (avg + count) | P1 | Planned |
| VRS-02-TC19 | AC-8.1 | API | No automated decision gating | P0 | Planned |

→ [VRS-02 detail](./VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md)

## VRS-03 — Rating visibility surfaces

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-03-TC01 | AC-1.1 | E2E/API | Profile summary overall only (no criteria) | P0 | Planned |
| VRS-03-TC02 | AC-1.2 | E2E/API | History newest first (score + answers) | P0 | Partial |
| VRS-03-TC03 | AC-1.3 | E2E | Rate Vendor for unrated TO | P1 | Planned |
| VRS-03-TC04 | AC-1.4 | E2E | Empty state no ratings | P1 | Planned |
| VRS-03-TC05 | AC-2.1 | E2E/API | Bid list rating column | P0 | Planned |
| VRS-03-TC06 | AC-2.2 | E2E | Rating column sortable | P1 | Planned |
| VRS-03-TC07 | AC-2.3 | API | vendor_rating_at_award snapshot | P0 | Planned |
| VRS-03-TC08 | AC-3.1 | E2E | Comparison highest rating highlight (all ties) | P0 | Planned |
| VRS-03-TC09 | AC-4.1 | E2E/API | Vendor list column + sort | P0 | Planned |
| VRS-03-TC10 | AC-4.2 | E2E/API | Min rating filter | P0 | Planned |
| VRS-03-TC11 | AC-5.1 | E2E | TO detail rated summary | P0 | Planned |
| VRS-03-TC12 | AC-5.2 | E2E | TO detail Rate CTA | P0 | Passing |
| VRS-03-TC13 | AC-6.1 | API | Vendor 403 on rating APIs | P0 | Planned |
| VRS-03-TC14 | AC-6.2 | E2E/Maestro | Vendor UI hides own rating | P0 | Planned |

→ [VRS-03 detail](./VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| VRS-01 | 17 | ~8 |
| VRS-02 | 19 | ~6 |
| VRS-03 | 14 | ~4 |
| **Total** | **~50** | **~18** |
