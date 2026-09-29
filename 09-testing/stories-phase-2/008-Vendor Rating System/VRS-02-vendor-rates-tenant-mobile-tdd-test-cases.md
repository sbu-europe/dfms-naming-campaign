---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: VRS-02 Vendor Rates Tenant — Mobile — TDD test cases
version: 1.1
phase: Phase 2
tdd: true
related_stories: VRS-02
source_spec: ../../../03-backlog/phase-2/stories-phase-2/008-Vendor Rating System/VRS-02-vendor-rates-tenant-mobile.md
module_spec: ../../../../05-modules/07-vendor-management/vendor-rating.md
suggested_impl:
  unit: apps/vendors/ (TenantRatingService — score + rolling Tenant.vendor_rating)
  api: POST/GET /api/v1/transport-orders/{id}/tenant-rating/; GET /api/v1/tenants/{id}/vendor-rating-summary/
  maestro: Vendor mobile — Rate Tenant after ACK (single star + 3 Y/N radios); Join Tenant card
  e2e: Playwright admin — incoming vendor ratings list
last_updated: 2026-09-17
---

# VRS-02 — Vendor Rates Tenant (Mobile) — TDD test cases

**Story:** [VRS-02](../../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md)  
**Approach:** API submit/duplicate/avg first → Maestro mobile flows → admin incoming list → mark Passing.  
**Depends on:** VRS-01 `RatingQuestion` model; vendor ACK completed trip; Join Tenant discovery screen.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | Vendor user assigned on TO; `tenant_admin` for incoming list; other vendors for Join Tenant summary |
| Data | Completed + ACK'd TO; TENANT RatingQuestion seed (9); tenant with and without prior `vendor_rating` |
| Mobile | Maestro flows for Rate Tenant + Join Tenant |

---

## A — Mobile trigger (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC01 | AC-1.1 | Maestro | Rate this Tenant after ACK | After vendor ACK completion, assert "Rate this Tenant" screen/bottom sheet shown. | P0 | Planned |
| VRS-02-TC02 | AC-1.2 | Maestro | Prompt skippable | Tap dismiss/skip. Assert no submit; flow continues. | P0 | Planned |
| VRS-02-TC03 | AC-1.3 | Maestro | Rate from trip detail after skip | After skip with unsubmitted rating, open completed trip detail. Assert "Rate Tenant" action available. | P0 | Planned |
| VRS-02-TC04 | AC-1.4 | API / Maestro | One rating per TO | Existing draft/submitted. Re-open. Assert same rating; no duplicate row. | P0 | Planned |

## B — Form: single score + radios (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC05 | AC-2.1 | Maestro | Single star + 3 Y/N radios | Assert one 1–5 star control; exactly 3 questions with Yes/No radios; optional comment. No multi-criterion panels. | P0 | Planned |
| VRS-02-TC06 | AC-2.2 | Maestro | Submit disabled until score + answers | Score missing or one radio unanswered. Assert submit disabled. | P0 | Planned |
| VRS-02-TC07 | AC-2.3 | Maestro | Theme continuity | Assert rating controls use existing app theme (shared widgets / theme tokens) — no one-off palette. | P2 | Planned |

## C — Questions API (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC08 | AC-3.1 | API / Maestro | Three random questions loaded | GET tenant-rating / rating-questions. Assert exactly 3 TENANT questions populate form. | P0 | Planned |
| VRS-02-TC09 | AC-3.2 | Maestro / API | Pool &lt; 3 error | Fewer than 3 active TENANT questions. Assert clear error / cannot submit. | P1 | Planned |

## D — Submit, duplicate, immutability (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC10 | AC-4.1 | API | Atomic submit + rolling update | POST score 4 + 3 answers. Assert TenantRating+3 answers; `average_rating=4.00`; `Tenant.vendor_rating` / count updated. | P0 | Planned |
| VRS-02-TC11 | AC-4.2 | API | Duplicate submit → 400 | Second POST for same TO+vendor. Assert `400`; single row; count incremented once. | P0 | Planned |
| VRS-02-TC12 | AC-4.3 | API | Immutable after submit | Attempt edit after submit. Assert rejected; values unchanged. | P0 | Planned |
| VRS-02-TC13 | AC-4.4 | Maestro | Success screen | After success, assert "Thank you for your rating!" + score shown. | P1 | Planned |

## E — Join Tenant visibility (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC14 | AC-5.1 | Maestro / API | Join Tenant aggregate | Tenant with rating 4.2 count 8. Assert card shows 4.2/5.0 + count copy (no per-criterion). | P0 | Planned |
| VRS-02-TC15 | AC-5.2 | Maestro | No ratings yet | `vendor_rating_count=0`. Assert "No ratings yet" displayed. | P0 | Planned |

## F — Own submitted rating (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC16 | AC-6.1 | Maestro / API | Own rating read-only on trip detail | After submit, open trip detail. Assert score, 3 Y/N, comment, date read-only. | P0 | Planned |

## G — Admin incoming ratings (AC-7)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC17 | AC-7.1 | API / E2E | Admin list of incoming ratings | As Tenant Admin, `GET /api/v1/tenants/{id}/vendor-ratings/`. Assert vendor, TO, score, answers, comment, date. | P0 | Planned |
| VRS-02-TC18 | AC-7.2 | E2E / API | Summary card | Assert overall aggregate avg + total count (no per-criterion). | P1 | Planned |

## H — No automated gating (AC-8)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC19 | AC-8.1 | API | Low rating does not gate decisions | Tenant with low `vendor_rating`. Assert join/bid/access APIs do not auto-reject based on tenant rating in v1. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| VRS-02-EC01 | API | Star outside 1–5 | Rejected | P0 | Planned |
| VRS-02-EC02 | API | Vendor not on TO | Submit denied | P0 | Planned |
| VRS-02-EC03 | API | Double-tap duplicate | Second → 400; count +1 once | P0 | Planned |
| VRS-02-EC04 | Unit | Skip/draft does not update Tenant.vendor_rating | Aggregates unchanged until submit | P0 | Planned |
| VRS-02-EC05 | API | Comment over max length | Rejected | P1 | Planned |
| VRS-02-EC06 | API | Missing radio answers | Rejected | P0 | Planned |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_tenant_rating_average.py          # TC10 rolling, EC04
tests/api/.../test_tenant_rating_submit.py            # TC04, TC08, TC10–12, TC14, TC17–19, EC01–03, EC06
maestro/.../vendor_rate_tenant.yaml                   # TC01–07, TC09, TC13, TC15–16
tests/e2e/.../test_tenant_incoming_ratings_admin.py   # TC17–18
```
