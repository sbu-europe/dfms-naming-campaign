---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: VRS-03
title: Vendor Rating Visibility — Admin Portal (Profile + Bid Views)
epic: Vendor Rating System
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
design_ref: ~
related_stories:
  - VRS-01-post-to-vendor-rating-admin.md
  - VRS-02-vendor-rates-tenant-mobile.md
source_docs:
  - ../../../../05-modules/07-vendor-management/vendor-rating.md
  - ../../../../05-modules/07-vendor-management/vendor-bidding.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/008-Vendor Rating System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/008-Vendor Rating System/00-all-test-cases.md
---

# VRS-03 — Vendor Rating Visibility — Admin Portal (Profile + Bid Views)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VRS-03 TDD catalog** (`AC-N.x` mapped) | [VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) |
| **Vendor Rating System TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, or Transport Planner  
**I want to** see a vendor's current overall rating and full rating history across the admin portal  
**So that** I can make well-informed decisions when awarding bids, managing vendor relationships, and filtering the vendor pool

## Business Context

Once `VendorRating` records exist (from VRS-01), they must be surfaced in the relevant admin views. Each rating is a **single overall score (1–5)** plus three optional Yes/No answers — there is **no per-criterion star breakdown** to display. Profile, bid, and list averages use the rolling `Vendor.rating`, which is the average of blended `average_rating` values (70% stars, up to 30% questions). History still shows the raw stars and each answer as Yes, No, or skipped.

Rating visibility surfaces in **four places**:

| Location | What is shown |
|----------|---------------|
| **Vendor Profile page** | Star summary (avg + count), rating history (score, answers, comment) |
| **Bid List / Comparison view** | Rating column / panel (overall only) |
| **Vendor Admin List** | Rating column + filter by minimum rating |
| **Completed TO Detail** | Rating summary or "Rate this vendor" CTA |

All surfaces reuse the **existing admin portal theme**. Rating is **internal only** — vendor portal and vendor mobile do **not** expose the vendor's own rating in v1.

---

## Acceptance Criteria

> **Test scenarios:** see [VRS-03 TDD catalog](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) · [Vendor Rating System index](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md)

### AC-1: Vendor Profile — Rating Section

Given an authorized admin opens a vendor profile,

when the Performance Rating section loads,

then overall stars, count, paginated history (score + Y/N answers + comment), Rate Vendor for unrated completed TOs, and an empty state when no ratings exist are shown.

- [ ] Vendor admin profile page has a **"Performance Rating"** section showing:
  - Overall star display: e.g. ⭐⭐⭐⭐ 4.2 / 5.0
  - Rating count: "Based on 12 ratings"
  - **Rating History** table (paginated, newest first):

    | Date | Transport Order | Rated By | Score | Answers (Y/N) | Comment |
    |------|----------------|----------|-------|---------------|---------|
    | ... | TO-2026-001 | Jane D. | ⭐⭐⭐⭐ 4 | Q1 Yes · Q2 No · Q3 Yes | Good service |

- [ ] **"Rate Vendor"** button shown for any completed TO that has no rating yet (links to VRS-01 form: `/vendors/<id>/rate/<to_id>/`).
- [ ] If vendor has no ratings: "No ratings yet — complete a transport order to rate this vendor."
- [ ] No per-criterion average table (not applicable in v1).

### AC-2: Bid List — Rating Column

Given Transport Planner / TDO views bid submissions,

when the bid list renders and an award is made,

then a sortable Rating column shows stars + value (or "–"), and `vendor_rating_at_award` is populated from `Vendor.rating` at award time.

- [ ] Bid submission table includes a **Rating** column (star + numeric).
- [ ] Column sortable ascending/descending.
- [ ] If vendor has no rating: shows "–".
- [ ] `vendor_rating_at_award` populated from `Vendor.rating` at award time.

### AC-3: Bid Comparison View — Rating Panel

Given side-by-side bid comparison is open,

when vendors with ratings are compared,

then each vendor shows star + numeric rating and the highest rating is highlighted.

- [ ] Side-by-side comparison shows each vendor's overall star rating with numeric value.
- [ ] "Highest rating" highlighted (highlight **all** ties).

### AC-4: Vendor Admin List — Rating Filter & Column

Given the vendor admin list,

when rating column and minimum-rating filter are used,

then star + numeric display, sort by rating, and min-rating filter options work.

- [ ] Vendor admin list shows a **Rating** column.
- [ ] **Filter by minimum rating**: Any / ≥ 1.0 / ≥ 2.0 / ≥ 3.0 / ≥ 4.0 / ≥ 4.5.
- [ ] Vendor list sortable by rating.

### AC-5: Completed TO Detail — Rating Summary

Given a completed TO detail view,

when the TO has or has not been rated,

then either "Vendor Rated" with View Rating, or "Rate this Vendor" CTA, is shown.

- [ ] If rated: "Vendor Rated: ⭐⭐⭐⭐ 4" with **"View Rating"** (score + 3 Y/N answers + comment).
- [ ] If not yet rated: **"Rate this Vendor"** CTA (links to VRS-01 form).

### AC-6: Not Visible to Vendor (v1 Enforcement)

Given vendor-authenticated access,

when vendor rating history / summary / profile rating APIs are called,

then the response is 403 and vendor portal/mobile UI does not expose own rating.

- [ ] Vendor portal (web) does **not** expose the vendor's own rating in v1.
- [ ] Vendor mobile app does **not** show the vendor their own rating in v1.
- [ ] Vendor authentication returns `403` on vendor rating history / summary endpoints.

---

## Edge Cases

### Profile & history
- Only pending (unsubmitted) ratings: profile empty state for submitted aggregates; Rate Vendor remains for those TOs.
- Pagination beyond last page: empty page, not error.

### Bid & award
- Vendor.rating changes after award: `vendor_rating_at_award` remains the snapshot at award time.
- All compared vendors unrated: no "Highest rating" highlight.
- Tie for highest rating: highlight **all** tied vendors.

### List filter
- Unrated vendors (`rating_count` 0): excluded when min filter ≥ 1.0; included under Any.
- Filter ≥ 4.5 with no matches: empty list / empty state.

### RBAC
- Role without `vendor.rating.view`: rating sections hidden or 403 on APIs.

---

## API Endpoints

> Actual endpoints implemented in `apps/vendors/urls.py` (VRS-01 APIs consumed here):

```
GET    /api/v1/vendors/<vendor_id>/rating-summary/    # overall avg + count (Vendor.Rating.View)
GET    /api/v1/vendors/<vendor_id>/ratings/           # paginated rating history (Vendor.Rating.View)
GET    /api/v1/vendor-ratings/                        # admin list of all VendorRatings (Vendor.Rating.View)
```

*(Endpoints defined in VRS-01 — this story adds the UI surfaces that consume them.)*

---

## Access & Permissions

| Action | Role |
|--------|------|
| View vendor rating profile section | `tenant_super_admin`, `tenant_admin`, `tdo`, `transport_planner` |
| View rating in bid list / comparison | `tenant_super_admin`, `tenant_admin`, `tdo`, `transport_planner` |
| Filter vendor list by minimum rating | `tenant_super_admin`, `tenant_admin`, `tdo`, `transport_planner` |
| View own rating (vendor role) | **Denied in v1** |

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-03-1 | Vendor profile — rating section | Star summary + history (score / answers / comment); portal theme | High | Not started |
| VRS-03-2 | Bid list — rating column + sort | Rating column; populate `vendor_rating_at_award` on award | High | Not started |
| VRS-03-3 | Bid comparison — rating highlight | Overall rating panel; highlight all highest ties | Medium | Not started |
| VRS-03-4 | Vendor admin list — rating filter + column | Min-rating filter + rating column + sort | Medium | Not started |
| VRS-03-5 | TO detail — rating CTA / summary | "Vendor Rated" or "Rate this Vendor" on completed TO | Medium | Not started |
| VRS-03-6 | Tests | Cover AC-1…AC-6 + edge cases | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VRS-01 (`VendorRating` records + API) | Upstream | Data source for all views |
| Vendor profile admin view | Upstream | Add rating section |
| Bid list / comparison views | Upstream | Add rating column and highlights |
| Vendor admin list | Upstream | Add rating column + filter |
| `BidAward.vendor_rating_at_award` field | Upstream | Existing field in vendor-bidding spec — now populated |

---

## Definition of Done

- [ ] Vendor profile shows rating section (summary + history; no criterion table)
- [ ] Bid list shows rating column; bid comparison shows rating panel
- [ ] Vendor admin list filterable by minimum rating
- [ ] TO detail shows "Vendor Rated" or "Rate this Vendor"
- [ ] `vendor_rating_at_award` populated on bid award
- [ ] Vendor portal / mobile confirmed to **not** expose vendor's own rating
- [ ] API/E2E tests for AC-1…AC-6 — see [VRS-03 TDD catalog](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 | 3 SP | Status: Pending | Last Updated: 2026-09-17*
