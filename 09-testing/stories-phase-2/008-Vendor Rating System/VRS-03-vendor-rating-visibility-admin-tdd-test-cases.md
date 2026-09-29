---
section: 09-testing/stories-phase-2/008-Vendor Rating System
specification: VRS-03 Vendor Rating Visibility — Admin Portal — TDD test cases
version: 1.1
phase: Phase 2
tdd: true
related_stories: VRS-03
source_spec: ../../../../03-backlog/stories-phase-2/008-Vendor Rating System/VRS-03-vendor-rating-visibility-admin.md
module_spec: ../../../../05-modules/07-vendor-management/vendor-rating.md
suggested_impl:
  api: GET /api/v1/vendors/{id}/rating-summary/; GET /api/v1/vendors/{id}/ratings/; BidAward.vendor_rating_at_award
  e2e: Playwright admin — profile, bid list/comparison, vendor list filter, TO detail
  maestro: Vendor mobile — confirm own rating not shown
last_updated: 2026-09-17
---

# VRS-03 — Vendor Rating Visibility (Admin) — TDD test cases

**Story:** [VRS-03](../../../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)  
**Approach:** API summary/history + award snapshot → admin E2E surfaces → vendor 403/UI denial → mark Passing.  
**Depends on:** VRS-01 submitted `VendorRating` data + rating APIs (single score + 3 answers).

## Seed prerequisites (when implementing)

| Item | Notes |
|------|--------|
| Roles | `tenant_admin`, `tdo`, `transport_planner`; negative: vendor auth |
| Data | Vendor with ≥2 submitted ratings; vendor with zero ratings; bid set with mixed ratings; completed TO rated + unrated |
| Award | Bid award path that sets `vendor_rating_at_award` |

---

## A — Vendor profile (AC-1)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC01 | AC-1.1 | E2E / API | Profile summary (overall only) | Open Performance Rating. Assert overall stars/numeric + count. Assert **no** per-criterion average table. | P0 | Planned |
| VRS-03-TC02 | AC-1.2 | E2E / API | History newest first | Multiple ratings. Assert paginated history newest first with TO, rated by, score, Y/N answers, comment. | P0 | Planned |
| VRS-03-TC03 | AC-1.3 | E2E | Rate Vendor for unrated TO | Completed TO without submitted rating. Assert Rate Vendor links to VRS-01 form. | P1 | Planned |
| VRS-03-TC04 | AC-1.4 | E2E | Empty state | Zero submitted ratings. Assert "No ratings yet — complete a transport order to rate this vendor." | P1 | Planned |

## B — Bid list & award snapshot (AC-2)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC05 | AC-2.1 | E2E / API | Bid list rating column | Mixed rated/unrated vendors. Assert star+numeric or "–". | P0 | Planned |
| VRS-03-TC06 | AC-2.2 | E2E | Rating column sortable | Sort asc/desc by Rating. Assert order follows `Vendor.rating`. | P1 | Planned |
| VRS-03-TC07 | AC-2.3 | API | vendor_rating_at_award populated | Award when `Vendor.rating=4.20`. Assert `BidAward.vendor_rating_at_award=4.20`. | P0 | Planned |

## C — Bid comparison (AC-3)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC08 | AC-3.1 | E2E | Highest rating highlight (all ties) | Ratings 3.5, 4.8, 4.8. Assert both 4.8 marked "Highest rating". | P0 | Planned |

## D — Vendor admin list (AC-4)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC09 | AC-4.1 | E2E / API | Rating column + sort | Assert Rating column star+numeric; sort by rating works. | P0 | Planned |
| VRS-03-TC10 | AC-4.2 | E2E / API | Min rating filter | Vendors 2.0, 3.5, 4.6; filter ≥ 4.0. Assert only ≥ 4.0 remain. | P0 | Planned |

## E — Completed TO detail (AC-5)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC11 | AC-5.1 | E2E | Rated TO summary | Submitted score 4. Assert "Vendor Rated" + View Rating (score + 3 answers). | P0 | Planned |
| VRS-03-TC12 | AC-5.2 | E2E | Unrated TO CTA | No submitted rating. Assert "Rate this Vendor" CTA to VRS-01. | P0 | Planned |

## F — Vendor denied (AC-6)

| Test Case ID | Story AC | Layer | Test Scenario | Test Description / Assert | Priority | Status |
|--------------|----------|-------|---------------|---------------------------|----------|--------|
| VRS-03-TC13 | AC-6.1 | API | Vendor 403 on rating APIs | Vendor auth GET `/vendors/{id}/ratings/` or `rating-summary`. Assert `403`. | P0 | Planned |
| VRS-03-TC14 | AC-6.2 | E2E / Maestro | Vendor UI hides own rating | Vendor portal/mobile. Assert no own Performance Rating / history surface. | P0 | Planned |

---

## Edge cases (from story)

| Test Case ID | Layer | Scenario | Assert | Priority | Status |
|--------------|-------|----------|--------|----------|--------|
| VRS-03-EC01 | API | Award snapshot immutable to later rating changes | After award, Vendor.rating changes; `vendor_rating_at_award` unchanged | P0 | Planned |
| VRS-03-EC02 | E2E | All vendors unrated in comparison | Ratings show "–"; no Highest rating highlight | P1 | Planned |
| VRS-03-EC03 | E2E / API | Min filter excludes unrated when ≥ 1.0 | Unrated not listed under ≥ 1.0; included under Any | P0 | Planned |
| VRS-03-EC04 | API | Role without vendor.rating.view | 403 / section hidden | P0 | Planned |

---

## Suggested code test targets (TDD)

```
tests/api/.../test_vendor_rating_visibility.py        # TC01–02, TC05, TC07, TC09–10, TC13, EC01, EC03–04
tests/e2e/.../test_vendor_rating_surfaces_admin.py    # TC01–06, TC08–12, EC02
maestro/.../vendor_own_rating_hidden.yaml             # TC14
```
