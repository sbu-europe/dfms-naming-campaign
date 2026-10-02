---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: VRS-01 Post-TO Vendor Rating — Tenant Admin / TDO — TDD test cases
version: 1.1
phase: Phase 2
tdd: true
related_stories: VRS-01
source_spec: ../../../03-backlog/phase-2/stories-phase-2/008-Vendor Rating System/VRS-01-post-to-vendor-rating-admin.md
module_spec: ../../../../05-modules/07-vendor-management/vendor-rating.md
suggested_impl:
  unit: apps/vendors/ (VendorRatingService — score + rolling Vendor.rating)
  api: POST/GET /api/v1/transport-orders/{id}/vendor-rating/; GET /api/v1/vendors/{id}/ratings/
  e2e: Playwright admin — Rate Vendor form (single star + 3 Y/N radios) + TO detail CTA
last_updated: 2026-09-29
---

# VRS-01 — Post-TO Vendor Rating (Admin) — TDD test cases

**Story:** [VRS-01](../../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md)  
**Approach:** Write failing unit tests for score/rolling/immutability first → API → admin E2E → mark Passing.  
**Depends on:** TO `COMPLETED`/`closed` transition; Vendor `rating` / `rating_count`; RatingQuestion VENDOR pool (≥9).

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `tenant_admin`, `tdo`, `transport_planner`; negative: vendor user; role without `vendor.rating.create` |
| Data | ≥1 completed TO with vendor; ≥1 pending VendorRating; ≥1 submitted rating; RatingQuestion seed (9 VENDOR) |
| Vendor | Known `rating` + `rating_count` for rolling-avg asserts |

---

## A — Rating trigger (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC01 | AC-1.1 | API | COMPLETED/closed creates pending VendorRating | Transition TO to terminal. Assert pending `VendorRating` linked to TO+vendor; `is_submitted=false`. | P0 | Planned |
| VRS-01-TC02 | AC-1.2 | E2E / API | Rate Vendor CTA on completed TO | As Tenant Admin with `vendor.rating.create`, open completed TO detail. Assert "Rate Vendor" CTA visible. Playwright passed. | P0 | Passing |
| VRS-01-TC03 | AC-1.3 | API | One rating per TO | Pending/submitted rating exists. Re-open/create path. Assert same row; no second unique TO+vendor+tenant row. | P0 | Planned |
| VRS-01-TC04 | AC-1.4 | E2E | Rate from Vendor Profile history | Completed unrated TO for vendor. Open Profile → Rating History → Rate. Assert VRS-01 form opens for that TO. | P1 | Planned |

## B — Form: single score + random radios (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC05 | AC-2.1 | E2E | Single star + 3 Y/N radios | Open rating form. Assert one 1–5 star control; exactly 3 questions each with Yes/No radio; optional overall comment. No multi-criterion star panels. Playwright passed. | P0 | Passing |
| VRS-01-TC06 | AC-2.2 | E2E / API | Score required; answers optional | Omit score → submit stays disabled. Omit every radio → accepted; `average_rating` equals the star score. Playwright passed (5 stars, no answers → 5.00). Serializer covers a null skip. | P0 | Passing |
| VRS-01-TC07 | AC-2.3 | E2E | Locked question set on refresh | Open form (3 questions). Refresh. Assert same 3 question IDs (no mid-fill reshuffle). | P1 | Planned |

## C — Seed question pool (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC08 | AC-3.1 | API | Seed pool + random 3 | With VENDOR seed loaded, form-fetch questions. Assert pool ≥9; returned set size = 3; all from active pool. Unit covers sample size and `is_active=True` only. | P0 | Partial |
| VRS-01-TC09 | AC-3.2 | API | RatingQuestion API | `GET /api/v1/rating-questions/?rating_type=VENDOR&random=3`. Assert 3 active question texts returned. | P1 | Planned |

## D — Score & rolling Vendor.rating (AC-4) — start here

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC10 | AC-4.1 | Unit | Blended average_rating | All skipped or 3 Yes on 5 stars → `5.00`. 5 stars + 3 Nos → `3.80`. 5 stars + 1 No and 2 skips → `4.60`. 4 stars + 2 Yes + 1 No → `3.90`. | P0 | Passing |
| VRS-01-TC11 | AC-4.2 | Unit | Rolling Vendor.rating uses blend | Current rating 4.00 count 1; new blend 3.80 (5 stars, 3 Nos) → rating `3.90`, count `2`. All skipped on 5 stars → blend `5.00`, rating `4.50`. | P0 | Passing |
| VRS-01-TC12 | AC-4.3 | Unit | First rating sets Vendor.rating from blend | count 0; 4 stars, all skipped → rating `4.00`, count `1`. | P0 | Passing |

## E — Submit & immutability (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC13 | AC-5.1 | API | Submit full payload | POST score + 3 answers + comment. Assert `is_submitted`, `rated_by`, `submitted_at`, `average_rating`, 3 answer rows. | P0 | Planned |
| VRS-01-TC14 | AC-5.2 | API | Immutable after submit | PATCH/re-POST changed score on submitted rating. Assert reject; stored values unchanged. Service raises today; HTTP status not covered. | P0 | Partial |
| VRS-01-TC15 | AC-5.3 | API | Audit on submit | Successful submit. Assert audit action `VENDOR_RATING_SUBMITTED`. | P0 | Planned |

## F — Vendor visibility denied (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC16 | AC-6.1 | API | Vendor 403 on own rating | Vendor auth GET TO vendor-rating or vendor ratings history. Assert `403`. | P0 | Planned |
| VRS-01-TC17 | AC-6.2 | API | Admin roles can view | As `tenant_admin` / `tdo` / `transport_planner`, GET rating. Assert 200 + payload. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| VRS-01-EC01 | API | Terminal create pending idempotent | Second signal does not create duplicate row | P0 | Planned |
| VRS-01-EC02 | API | Star score outside 1–5 | Rejected | P0 | Passing |
| VRS-01-EC03 | API | Comment over max length | Overall >1000 rejected | P0 | Passing |
| VRS-01-EC04 | Unit | Draft pending does not update Vendor.rating | `rating`/`rating_count` unchanged until submit | P0 | Passing |
| VRS-01-EC05 | API | Inactive RatingQuestion not sampled | Inactive not in random active set | P1 | Partial |
| VRS-01-EC06 | API | Wrong/extra question IDs | Not locked set → rejected | P0 | Passing |
| VRS-01-EC07 | API | Active pool &lt; 3 | Business error / cannot submit | P1 | Passing |
| VRS-01-EC08 | API | No assigned vendor / own fleet | Pending skipped (no row) | P0 | Passing |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_vendor_rating_average.py          # TC10–12, EC04
tests/api/.../test_vendor_rating_submit.py            # TC01, TC03, TC08, TC13–17, EC01–03, EC06–08
tests/e2e/.../test_vendor_rating_admin_e2e.py         # TC02, TC04–07
```
