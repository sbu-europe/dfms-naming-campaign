---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: Vendor Rating System — all TDD test cases (index)
phase: Phase 2
tdd: true
last_updated: 2026-09-14
---

# Vendor Rating System — All TDD test cases (index)

Master index. Detail + asserts live in per-story files. Status defaults to **Planned** until code exists.

## VRS-01 — Post-TO vendor rating (unit-first)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-01-TC01 | AC-1.1 | API | COMPLETED → pending VendorRating | P0 | Planned |
| VRS-01-TC02 | AC-1.2 | E2E/API | Rate Vendor CTA on TO detail | P0 | Planned |
| VRS-01-TC03 | AC-1.3 | API | One rating per TO — reopen existing | P0 | Planned |
| VRS-01-TC04 | AC-1.4 | E2E | Rate from Vendor Profile history | P1 | Planned |
| VRS-01-TC05 | AC-2.1 | E2E | Three criterion panels render | P0 | Planned |
| VRS-01-TC06 | AC-2.2 | E2E/API | Submit blocked without all 3 scores | P0 | Planned |
| VRS-01-TC07 | AC-2.3 | E2E/Unit | Live average preview | P1 | Planned |
| VRS-01-TC08 | AC-3.1 | API | Seed questions load per criterion | P0 | Planned |
| VRS-01-TC09 | AC-3.2 | API | RatingQuestion API population | P1 | Planned |
| VRS-01-TC10 | AC-4.1 | Unit | Avg round((s1+s2+s3)/3, 2) | P0 | Planned |
| VRS-01-TC11 | AC-4.2 | Unit | Rolling Vendor.rating update | P0 | Planned |
| VRS-01-TC12 | AC-4.3 | Unit | First rating sets Vendor.rating | P0 | Planned |
| VRS-01-TC13 | AC-5.1 | API | Submit persists full payload | P0 | Planned |
| VRS-01-TC14 | AC-5.2 | API | Immutable after submit | P0 | Planned |
| VRS-01-TC15 | AC-5.3 | API | Audit VENDOR_RATING_SUBMITTED | P0 | Planned |
| VRS-01-TC16 | AC-6.1 | API | Vendor 403 on own rating | P0 | Planned |
| VRS-01-TC17 | AC-6.2 | API | Admin roles can view | P0 | Planned |

→ [VRS-01 detail](./VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md)

## VRS-02 — Vendor rates tenant (mobile / API)

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-02-TC01 | AC-1.1 | Maestro | Rate this Tenant after ACK | P0 | Planned |
| VRS-02-TC02 | AC-1.2 | Maestro | Prompt skippable | P0 | Planned |
| VRS-02-TC03 | AC-1.3 | Maestro | Rate from trip detail after skip | P0 | Planned |
| VRS-02-TC04 | AC-1.4 | API/Maestro | One rating per TO idempotent | P0 | Planned |
| VRS-02-TC05 | AC-2.1 | Maestro | Three tenant criterion panels | P0 | Planned |
| VRS-02-TC06 | AC-2.2 | Maestro | Submit disabled until 3 scores | P0 | Planned |
| VRS-02-TC07 | AC-2.3 | Maestro/Unit | Live running average | P1 | Planned |
| VRS-02-TC08 | AC-3.1 | API/Maestro | Questions from API | P0 | Planned |
| VRS-02-TC09 | AC-3.2 | Maestro | Empty questions collapse | P1 | Planned |
| VRS-02-TC10 | AC-4.1 | API | Atomic submit + rolling Tenant.vendor_rating | P0 | Planned |
| VRS-02-TC11 | AC-4.2 | API | Duplicate submit → 400 | P0 | Planned |
| VRS-02-TC12 | AC-4.3 | API | Immutable after submit | P0 | Planned |
| VRS-02-TC13 | AC-4.4 | Maestro | Success screen with average | P1 | Planned |
| VRS-02-TC14 | AC-5.1 | Maestro/API | Join Tenant aggregate | P0 | Planned |
| VRS-02-TC15 | AC-5.2 | Maestro | No ratings yet copy | P0 | Planned |
| VRS-02-TC16 | AC-6.1 | Maestro/API | Own submitted rating read-only | P0 | Planned |
| VRS-02-TC17 | AC-7.1 | API/E2E | Admin incoming ratings list | P0 | Planned |
| VRS-02-TC18 | AC-7.2 | E2E/API | Admin summary card | P1 | Planned |
| VRS-02-TC19 | AC-8.1 | API | No automated decision gating | P0 | Planned |

→ [VRS-02 detail](./VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md)

## VRS-03 — Rating visibility surfaces

| TC ID | AC | Layer | Scenario | Priority | Status |
|-------|-----|-------|----------|----------|--------|
| VRS-03-TC01 | AC-1.1 | E2E/API | Profile summary + criterion avgs | P0 | Planned |
| VRS-03-TC02 | AC-1.2 | E2E/API | History newest first | P0 | Planned |
| VRS-03-TC03 | AC-1.3 | E2E | Rate Vendor for unrated TO | P1 | Planned |
| VRS-03-TC04 | AC-1.4 | E2E | Empty state no ratings | P1 | Planned |
| VRS-03-TC05 | AC-2.1 | E2E/API | Bid list rating column | P0 | Planned |
| VRS-03-TC06 | AC-2.2 | E2E | Rating column sortable | P1 | Planned |
| VRS-03-TC07 | AC-2.3 | API | vendor_rating_at_award snapshot | P0 | Planned |
| VRS-03-TC08 | AC-3.1 | E2E | Comparison highest rating highlight | P0 | Planned |
| VRS-03-TC09 | AC-4.1 | E2E/API | Vendor list column + sort | P0 | Planned |
| VRS-03-TC10 | AC-4.2 | E2E/API | Min rating filter | P0 | Planned |
| VRS-03-TC11 | AC-5.1 | E2E | TO detail rated summary | P0 | Planned |
| VRS-03-TC12 | AC-5.2 | E2E | TO detail Rate CTA | P0 | Planned |
| VRS-03-TC13 | AC-6.1 | API | Vendor 403 on rating APIs | P0 | Planned |
| VRS-03-TC14 | AC-6.2 | E2E/Maestro | Vendor UI hides own rating | P0 | Planned |

→ [VRS-03 detail](./VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md)

## Totals

| Story | Primary TCs | Edge rows (in detail files) |
|-------|-------------|------------------------------|
| VRS-01 | 17 | ~6 |
| VRS-02 | 19 | ~6 |
| VRS-03 | 14 | ~5 |
| **Total** | **~50** | **~17** |
