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
  - ../../../05-modules/07-vendor-management/vendor-rating.md
  - ../../../05-modules/07-vendor-management/vendor-bidding.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
tdd_test_cases: ../../../09-testing/stories-phase-2/008-Vendor Rating System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/008-Vendor Rating System/00-all-test-cases.md
---

# VRS-03 — Vendor Rating Visibility — Admin Portal (Profile + Bid Views)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VRS-03 TDD catalog** (`AC-N.x` mapped) | [VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) |
| **Vendor Rating System TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, or Transport Planner  
**I want to** see a vendor's current rating, criterion breakdown, and full rating history across the admin portal  
**So that** I can make well-informed decisions when awarding bids, managing vendor relationships, and filtering the vendor pool

## Business Context

Once `VendorRating` records exist (from VRS-01), they must be surfaced in the relevant admin views. The `vendor-bidding.md` spec already references vendor rating in bid tables, bid comparison, and bid award — this story wires those references to live data.

Rating visibility surfaces in **four places**:

| Location | What is shown |
|----------|---------------|
| **Vendor Profile page** | Star summary, per-criterion averages, rating history table |
| **Bid List / Comparison view** | Rating column alongside bid rate |
| **Vendor Admin List** | Rating column + filter by minimum rating |
| **Completed TO Detail** | Rating summary or "Rate this vendor" CTA |

Rating is **internal only** — vendor portal and vendor mobile app do **not** expose the vendor's own rating in v1.

---

## Acceptance Criteria

> **Test scenarios:** see [VRS-03 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) · [Vendor Rating System index](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md)

### AC-1: Vendor Profile — Rating Section

Given an authorized admin opens a vendor profile,

when the Performance Rating section loads,

then overall stars, count, per-criterion averages, paginated history, Rate Vendor for unrated completed TOs, and an empty state when no ratings exist are shown.

- [ ] Vendor admin profile page has a **"Performance Rating"** section showing:
  - Overall star display: e.g. ⭐⭐⭐⭐ 4.2 / 5.0
  - Rating count: "Based on 12 ratings"
  - Per-criterion averages table:

    | Criterion | Average | Ratings |
    |-----------|---------|---------|
    | Product Delivery | ⭐⭐⭐⭐⭐ 4.6 | 12 |
    | Driver Behaviour | ⭐⭐⭐⭐ 4.1 | 12 |
    | Vehicle | ⭐⭐⭐⭐ 3.9 | 12 |

  - **Rating History** table (paginated, newest first):

    | Date | Transport Order | Rated By | Prod. Del. | Driver Beh. | Vehicle | Avg | Comment |
    |------|----------------|----------|-----------|------------|---------|-----|---------|
    | ... | TO-2026-001 | Jane D. | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 4.3 | Good service |

- [ ] **"Rate Vendor"** button shown for any completed TO that has no rating yet (links to VRS-01 rating form).
- [ ] If vendor has no ratings: "No ratings yet — complete a transport order to rate this vendor."

### AC-2: Bid List — Rating Column

Given Transport Planner / TDO views bid submissions,

when the bid list renders and an award is made,

then a sortable Rating column shows stars + value (or "–"), and `vendor_rating_at_award` is populated from `Vendor.rating` at award time.

- [ ] Bid submission table (Transport Planner / TDO view) includes a **Rating** column showing star display + numeric value (e.g. ⭐⭐⭐⭐ 4.2).
- [ ] Column sortable ascending/descending.
- [ ] If vendor has no rating: shows "–" (unrated).
- [ ] `vendor_rating_at_award` field on `BidAward` record is **populated** from `Vendor.rating` at the time of award (wires up the existing field referenced in `vendor-bidding.md`).

### AC-3: Bid Comparison View — Rating Panel

Given side-by-side bid comparison is open,

when vendors with ratings are compared,

then each vendor shows star + numeric rating and the highest rating is highlighted.

- [ ] Side-by-side bid comparison shows each vendor's star rating with numeric value.
- [ ] Comparison highlights: "Highest rating" highlighted in gold (alongside lowest rate / fastest submission).

### AC-4: Vendor Admin List — Rating Filter & Column

Given the vendor admin list,

when rating column and minimum-rating filter are used,

then star + numeric display, sort by rating, and min-rating filter options work.

- [ ] Vendor admin list table shows a **Rating** column (star + numeric).
- [ ] **Filter by minimum rating** available: dropdown (Any / ≥ 1.0 / ≥ 2.0 / ≥ 3.0 / ≥ 4.0 / ≥ 4.5).
- [ ] Vendor list sortable by rating.

### AC-5: Completed TO Detail — Rating Summary

Given a completed TO detail view,

when the TO has or has not been rated,

then either "Vendor Rated" with View Rating, or "Rate this Vendor" CTA, is shown.

- [ ] Completed TO detail view shows:
  - If rated: "Vendor Rated: ⭐⭐⭐⭐ 4.3" with a **"View Rating"** link.
  - If not yet rated: **"Rate this Vendor"** CTA (links to VRS-01 form).

### AC-6: Not Visible to Vendor (v1 Enforcement)

Given vendor-authenticated access,

when vendor rating history / summary / profile rating APIs are called,

then the response is 403 and vendor portal/mobile UI does not expose own rating.

- [ ] Vendor portal (web) does **not** expose the vendor's own rating in v1.
- [ ] Vendor mobile app does **not** show the vendor their own rating in v1.
- [ ] All rating endpoints are protected — vendor authentication returns `403` on vendor rating history / profile rating section.

---

## Edge Cases

### Profile & history
- Only pending (unsubmitted) ratings: profile empty state still applies for submitted aggregates; Rate Vendor remains for those TOs.
- Pagination beyond last page: empty page, not error.
- Deleted/archived TO reference: history still shows TO id/reference per existing TO retention rules.

### Bid & award
- Vendor.rating changes after award: `vendor_rating_at_award` remains the snapshot at award time.
- All compared vendors unrated: no "Highest rating" highlight (or none eligible — show ratings as "–").
- Tie for highest rating: TODO(PO) — highlight all tied or first only.

### List filter
- Unrated vendors (`rating_count` 0): excluded when min filter ≥ 1.0; included under Any.
- Filter ≥ 4.5 with no matches: empty list / empty state.

### RBAC
- Role without `vendor.rating.view`: rating sections hidden or 403 on APIs.

---

## API Endpoints

```
GET    /api/v1/vendors/{id}/rating-summary/     # overall avg, count, per-criterion avgs (admin only)
GET    /api/v1/vendors/{id}/ratings/            # paginated rating history (admin only)
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
| VRS-03-1 | Vendor profile — rating section | Star summary, per-criterion table, rating history list | High | Not started |
| VRS-03-2 | Bid list — rating column + sort | Rating column on bid submission table; populate `vendor_rating_at_award` on award | High | Not started |
| VRS-03-3 | Bid comparison — rating highlight | Rating in side-by-side comparison; "Highest rating" highlight | Medium | Not started |
| VRS-03-4 | Vendor admin list — rating filter + column | Min-rating filter + rating column + sort | Medium | Not started |
| VRS-03-5 | TO detail — rating CTA / summary | "Vendor Rated" or "Rate this Vendor" on completed TO | Medium | Not started |
| VRS-03-6 | Tests | Cover AC-1…AC-6 scenarios + Edge Cases (surfaces, award snapshot, vendor 403) | High | Not started |

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

- [ ] Vendor profile page shows rating section (summary + per-criterion + history table)
- [ ] Bid list shows rating column; bid comparison shows rating panel
- [ ] Vendor admin list filterable by minimum rating
- [ ] TO detail shows "Vendor Rated" or "Rate this Vendor"
- [ ] `vendor_rating_at_award` populated on bid award
- [ ] Vendor portal / mobile confirmed to **not** expose vendor's own rating
- [ ] API/E2E tests for scenarios AC-1.1…AC-6.2 (and listed edge cases in scope) — see [VRS-03 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md)
- [ ] TDD catalog statuses updated (`Planned` → `Failing` → `Passing`) for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
