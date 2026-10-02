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
last_updated: 2026-09-29
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
| VRS-02-TC02 | AC-1.2 | Maestro | Prompt skippable | Open Rate tenant from completed trip details, leave with Back before submit. Assert no rating is stored and the trip detail returns. `01_skip_then_rate_from_details.yaml` passed on emulator-5554 (2026-09-29). Skip for now is the post-complete prompt; this flow covers dismiss from trip details. | P0 | Passing |
| VRS-02-TC03 | AC-1.3 | Maestro | Rate from trip detail after skip | After leaving the form unsubmitted, completed trip detail still shows Rate tenant. Same flow; passed on emulator-5554 (2026-09-29). | P0 | Passing |
| VRS-02-TC04 | AC-1.4 | API / Maestro | One rating per TO | Existing draft/submitted. Re-open. Assert same rating; no duplicate row. | P0 | Planned |

## B — Form: single score + radios (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC05 | AC-2.1 | Maestro | Single star + 3 Y/N radios | One 1–5 star control, exactly 3 Yes/No questions, optional comment. `02_submit_stars_only.yaml` and `03_three_nos_lower_average.yaml` passed on emulator-5554 (2026-09-29). | P0 | Passing |
| VRS-02-TC06 | AC-2.2 | Maestro | Submit disabled until stars | Submit rating stays disabled with no stars (`01`). Stars only, questions left blank, counts as 5.00 with each question Skipped (`02`). Passed on emulator-5554 (2026-09-29). | P0 | Passing |
| VRS-02-TC07 | AC-2.3 | Maestro | Theme continuity | Assert rating controls use existing app theme (shared widgets / theme tokens) — no one-off palette. | P2 | Planned |

## C — Questions API (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC08 | AC-3.1 | API / Maestro | Three random questions loaded | Form shows exactly 3 TENANT questions. `03_three_nos_lower_average.yaml` taps all three and passed on emulator-5554 (2026-09-29). | P0 | Passing |
| VRS-02-TC09 | AC-3.2 | Maestro / API | Pool &lt; 3 error | Fewer than 3 active TENANT questions. Assert clear error / cannot submit. Unit covers `pick_random_questions` only. | P1 | Partial |

## D — Submit, duplicate, immutability (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC10 | AC-4.1 | API | Atomic submit + rolling update | POST uses the same blend as VRS-01. 4 stars, all skipped → `average_rating=4.00` and that value rolls `Tenant.vendor_rating`. 5 stars + 3 Nos → blend `3.80`; prior 4.00 count 1 becomes `3.90` count 2. HTTP not covered. | P0 | Partial |
| VRS-02-TC11 | AC-4.2 | API | Duplicate submit → 400 | Second POST for same TO+vendor. Assert `400`; single row; count incremented once. Service rejects resubmit; HTTP not covered. | P0 | Partial |
| VRS-02-TC12 | AC-4.3 | API | Immutable after submit | Attempt edit after submit. Assert rejected; values unchanged. Service rejects; HTTP not covered. | P0 | Partial |
| VRS-02-TC13 | AC-4.4 | Maestro | Success screen | After submit, "Thank you for your rating!" and the blend are shown. `02_submit_stars_only.yaml` passed on emulator-5554 (2026-09-29). | P1 | Passing |

## E — Join Tenant visibility (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC14 | AC-5.1 | Maestro / API | Join Tenant aggregate | Tenants tab shows an overall score and "Based on N vendor ratings" (no per-criterion breakdown). After the stars and three-No submits, Nourish Poultry showed 4.40 from 2 ratings. `04_join_tenant_shows_rating.yaml` passed on emulator-5554 (2026-09-29). | P0 | Passing |
| VRS-02-TC15 | AC-5.2 | Maestro | No ratings yet | A tenant with no ratings shows "No ratings yet". Same flow; passed on emulator-5554 (2026-09-29). | P0 | Passing |

## F — Own submitted rating (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-02-TC16 | AC-6.1 | Maestro / API | Own rating read-only on trip detail | After submit, trip detail shows the blend, the three answers (Skipped or No), and the date, with no Rate tenant action. `02` and `03` passed on emulator-5554 (2026-09-29). | P0 | Passing |

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
| VRS-02-EC01 | API | Star outside 1–5 | Rejected | P0 | Passing |
| VRS-02-EC02 | API | Vendor not on TO | Submit denied | P0 | Planned |
| VRS-02-EC03 | API | Double-tap duplicate | Second → 400; count +1 once | P0 | Planned |
| VRS-02-EC04 | Unit | Skip/draft does not update Tenant.vendor_rating | Aggregates unchanged until submit. Covered for the app in-memory repository. | P0 | Partial |
| VRS-02-EC05 | API | Comment over max length | Rejected | P1 | Planned |
| VRS-02-EC06 | API | Missing radio answers | Allowed. Zero answers → `average_rating` equals the star score. Null answer is a skip. Non-boolean rejected. | P0 | Passing |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_tenant_rating_average.py          # TC10 rolling, EC04
tests/api/.../test_tenant_rating_submit.py            # TC04, TC08, TC10–12, TC14, TC17–19, EC01–03, EC06
maestro/.../vendor_rate_tenant.yaml                   # TC01–07, TC09, TC13, TC15–16
tests/e2e/.../test_tenant_incoming_ratings_admin.py   # TC17–18
```
