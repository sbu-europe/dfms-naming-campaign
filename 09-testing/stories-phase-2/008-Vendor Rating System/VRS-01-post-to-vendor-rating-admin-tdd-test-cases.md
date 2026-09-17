---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: VRS-01 Post-TO Vendor Rating — Tenant Admin / TDO — TDD test cases
version: 1.0
phase: Phase 2
tdd: true
related_stories: VRS-01
source_spec: ../../../../03-backlog/stories-phase-2/008-Vendor Rating System/VRS-01-post-to-vendor-rating-admin.md
module_spec: ../../../../05-modules/07-vendor-management/vendor-rating.md
suggested_impl:
  unit: apps/vendor/services/ (VendorRatingService — avg + rolling Vendor.rating)
  api: POST/GET /api/v1/transport-orders/{id}/vendor-rating/; GET /api/v1/vendors/{id}/ratings/
  e2e: Playwright admin — Rate Vendor form + TO detail CTA
last_updated: 2026-09-14
---

# VRS-01 — Post-TO Vendor Rating (Admin) — TDD test cases

**Story:** [VRS-01](../../../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md)  
**Approach:** Write failing unit tests for avg/rolling/immutability first → API → admin E2E → mark Passing.  
**Depends on:** TO `COMPLETED` transition; Vendor `rating` / `rating_count`; RatingQuestion seed.

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `tenant_admin`, `tdo`, `transport_planner`; negative: vendor user; role without `vendor.rating.create` |
| Data | ≥1 completed TO with vendor; ≥1 pending VendorRating; ≥1 submitted rating; RatingQuestion seed (3×3 VENDOR) |
| Vendor | Known `rating` + `rating_count` for rolling-avg asserts |

---

## A — Rating trigger (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC01 | AC-1.1 | API | COMPLETED creates pending VendorRating | Transition TO to `COMPLETED`. Assert pending `VendorRating` linked to TO+vendor; `is_submitted=false`. | P0 | Planned |
| VRS-01-TC02 | AC-1.2 | E2E / API | Rate Vendor CTA on completed TO | As Tenant Admin with `vendor.rating.create`, open completed TO detail. Assert "Rate Vendor" CTA visible. | P0 | Planned |
| VRS-01-TC03 | AC-1.3 | API | One rating per TO | Pending/submitted rating exists. Re-open/create path. Assert same row returned; no second unique TO+vendor+tenant row. | P0 | Planned |
| VRS-01-TC04 | AC-1.4 | E2E | Rate from Vendor Profile history | Completed unrated TO for vendor. Open Profile → Rating History → Rate. Assert VRS-01 form opens for that TO. | P1 | Planned |

## B — Form criteria panels (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC05 | AC-2.1 | E2E | Three criterion panels | Open rating form. Assert Product Delivery, Driver Behaviour, Vehicle panels; stars 1–5; optional comments; overall comment. | P0 | Planned |
| VRS-01-TC06 | AC-2.2 | E2E / API | Submit blocked without all 3 scores | Omit one criterion score. Assert submit blocked / 4xx validation. | P0 | Planned |
| VRS-01-TC07 | AC-2.3 | E2E / Unit | Live average preview | Scores 5, 4, 3. Assert preview average `4.00`. | P1 | Planned |

## C — Seed questions (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC08 | AC-3.1 | API | Seed questions per criterion | With VENDOR seed loaded, open/form-fetch questions. Assert 3 default Y/N texts per Product Delivery, Driver Behaviour, Vehicle. | P0 | Planned |
| VRS-01-TC09 | AC-3.2 | API | RatingQuestion API | `GET /api/v1/rating-questions/?criterion=VEHICLE`. Assert active question texts returned. | P1 | Planned |

## D — Average & rolling Vendor.rating (AC-4) — start here

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC10 | AC-4.1 | Unit | Avg round((s1+s2+s3)/3, 2) | Scores 5, 4, 3 → `average_rating=4.00`; scores 5, 4, 4 → `4.33`. | P0 | Planned |
| VRS-01-TC11 | AC-4.2 | Unit | Rolling Vendor.rating | Current rating 4.00 count 1; new avg 5.00 → rating `4.50`, count `2`. | P0 | Planned |
| VRS-01-TC12 | AC-4.3 | Unit | First rating sets Vendor.rating | count 0; new avg 3.67 → rating `3.67`, count `1`. | P0 | Planned |

## E — Submit & immutability (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-01-TC13 | AC-5.1 | API | Submit full payload | POST valid 3 criteria + answers + comments. Assert `is_submitted`, `rated_by`, `submitted_at`, `average_rating`, criterion rows. | P0 | Planned |
| VRS-01-TC14 | AC-5.2 | API | Immutable after submit | PATCH/re-POST changed scores on submitted rating. Assert reject; stored scores unchanged. | P0 | Planned |
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
| VRS-01-EC01 | API | COMPLETED create pending idempotent | Second COMPLETED/signal does not create duplicate row | P0 | Planned |
| VRS-01-EC02 | API | Star score outside 1–5 | Rejected | P0 | Planned |
| VRS-01-EC03 | API | Comment over max length | Criterion >500 or overall >1000 rejected | P0 | Planned |
| VRS-01-EC04 | Unit | Draft pending does not update Vendor.rating | `rating`/`rating_count` unchanged until submit | P0 | Planned |
| VRS-01-EC05 | API | Inactive RatingQuestion hidden on form | Inactive not returned in active question list | P1 | Planned |
| VRS-01-EC06 | — | TO completed with no vendor | TODO(PO) — Blocked until PO decides | P2 | Blocked (PO) |
| VRS-01-EC07 | — | Y/N answers required vs optional | TODO(PO) — Blocked until PO decides | P2 | Blocked (PO) |

---

## Suggested code test targets (TDD)

```
tests/unit/.../test_vendor_rating_average.py          # TC10–12, EC04
tests/api/.../test_vendor_rating_submit.py            # TC01, TC03, TC08, TC13–17, EC01–03
tests/e2e/.../test_vendor_rating_admin_e2e.py         # TC02, TC04–07
```
