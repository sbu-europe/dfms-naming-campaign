---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: VRS-01
title: Post-TO Vendor Rating — Tenant Super Admin / Tenant Admin / TDO (Admin Portal)
epic: Vendor Rating System
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: ~
related_stories:
  - VRS-02-vendor-rates-tenant-mobile.md
  - VRS-03-vendor-rating-visibility-admin.md
source_docs:
  - ../../../05-modules/07-vendor-management/vendor-rating.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
tdd_test_cases: ../../../09-testing/stories-phase-2/008-Vendor Rating System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/008-Vendor Rating System/00-all-test-cases.md
---

# VRS-01 — Post-TO Vendor Rating — Tenant Super Admin / Tenant Admin / TDO (Admin Portal)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VRS-01 TDD catalog** (`AC-N.x` mapped) | [VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) |
| **Vendor Rating System TDD index** (all stories) | [00-all-test-cases.md](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, or Transport Distribution Officer (TDO)  
**I want to** rate a vendor on completion of a Transport Order across standardised criteria  
**So that** vendor performance is tracked internally and informs future bid/award decisions

## Business Context

When a Transport Order (TO) is marked `COMPLETED`, the system prompts the responsible Tenant Super Admin, Tenant Admin, or TDO to provide a structured rating for the vendor. Ratings are **internal only** — not visible to vendors in v1.

Rating is structured around **three core criteria**:

| Criterion | Description |
|-----------|-------------|
| **Product Delivery** | Was the product delivered correctly, on time, and intact? |
| **Driver Behaviour** | Was the driver professional and route-compliant? |
| **Vehicle** | Was the vehicle in suitable, roadworthy condition? |

Each criterion has:
- A **1–5 star score** (required)
- **Predefined Yes/No questions** (configurable; seeded defaults in v1)
- An optional **comment** (max 500 chars)

The system computes the **average rating** across all three criteria and updates the vendor's rolling overall rating field (`Vendor.rating`).

> **Note:** Criteria set may grow based on internal discussion — the model is designed to be criterion-agnostic via `VendorRatingCriterion` records.

---

## Acceptance Criteria

> **Test scenarios:** see [VRS-01 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) · [Vendor Rating System index](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md)

### AC-1: Rating Trigger

Given a Transport Order transitions to `COMPLETED`,

when the system processes the status change (and an authorized admin opens the completed TO or Vendor Profile rating entry),

then a pending `VendorRating` exists for that TO/vendor, and only one rating per TO is allowed.

- [ ] When a TO status transitions to `COMPLETED`, the system creates a **pending** `VendorRating` record for that TO (linked to TO and vendor).
- [ ] Tenant Super Admin / Tenant Admin / TDO with `vendor.rating.create` permission sees a **"Rate Vendor"** button or prompt on the completed TO detail view.
- [ ] Only **one rating per TO** is allowed — re-opening the prompt shows the existing (submitted or draft) rating.
- [ ] Rating prompt is also accessible from **Vendor Profile → Rating History → Rate** (for past unrated TOs).

### AC-2: Rating Form — Criteria Panels

Given an authorized admin opens the vendor rating form for a completed TO,

when they fill criterion panels,

then three panels (Product Delivery · Driver Behaviour · Vehicle) require 1–5 stars each, show Y/N questions and optional comments, and display a live average preview.

- [ ] Form shows **3 criterion panels**: Product Delivery · Driver Behaviour · Vehicle.
- [ ] Each panel contains:
  - A **1–5 star selector** (required — form cannot submit without all 3 scores).
  - **Predefined Yes/No question list** for that criterion (min 1; from `RatingQuestion` seed).
  - An optional **comment** field (max 500 chars).
- [ ] A global **overall comment** field (optional, max 1 000 chars) at the bottom of the form.
- [ ] Live preview: running average shown as the user fills in criteria scores.

### AC-3: Predefined Questions — v1 Seed Data

Given the rating form loads questions for each criterion,

when seed data is present,

then the v1 default Y/N questions for Product Delivery, Driver Behaviour, and Vehicle are available from `RatingQuestion`.

- [ ] **Product Delivery:** "Was the product delivered on time?", "Was the product delivered in full quantity?", "Was the product in good condition on arrival?"
- [ ] **Driver Behaviour:** "Was the driver professional and courteous?", "Did the driver follow safety protocols?", "Did the driver communicate proactively during the trip?"
- [ ] **Vehicle:** "Was the vehicle in roadworthy condition?", "Was the vehicle clean and appropriate for the load type?", "Did the vehicle arrive on time for loading?"
- [ ] Questions stored in `RatingQuestion` model — seeded, admin-configurable in a future sprint.

### AC-4: Average Calculation & Vendor Rating Update

Given all three criterion scores are submitted,

when the rating is persisted,

then `average_rating = round((s1+s2+s3)/3, 2)` and `Vendor.rating` / `rating_count` update as a rolling average.

- [ ] `average_rating = round((product_delivery_score + driver_behaviour_score + vehicle_score) / 3, 2)`.
- [ ] `Vendor.rating` updated to reflect **rolling average** across all submitted ratings:  
  `new_avg = ((current_rating × rating_count) + new_average) / (rating_count + 1)`.
- [ ] `Vendor.rating_count` (or computed aggregate) incremented on each submission.

### AC-5: Submission & Immutability

Given an admin submits a complete valid rating,

when persistence succeeds,

then the `VendorRating` stores all fields, becomes immutable, and an audit log entry is written.

- [ ] On submit, `VendorRating` record persisted with: `to_id`, `vendor_id`, `tenant_id`, `rated_by` (user), `submitted_at`, per-criterion scores + Y/N answers + comments, `average_rating`, `overall_comment`.
- [ ] Submission is **immutable** — rating cannot be edited after submit (consistent with bid immutability pattern).
- [ ] Audit log entry created on submission (`VENDOR_RATING_SUBMITTED` action).

### AC-6: Not Visible to Vendor (v1)

Given vendor users access portal or mobile APIs,

when they request their own vendor rating data,

then access is denied in v1; only Tenant Super Admin, Tenant Admin, TDO, and Transport Planner see ratings via internal admin views.

- [ ] Vendor portal and vendor mobile app do **not** expose the vendor's own rating in v1.
- [ ] Rating data is accessible only to Tenant Super Admin, Tenant Admin, TDO, and Transport Planner via internal admin views.

---

## Edge Cases

### Trigger & uniqueness
- TO completed with no assigned vendor: TODO(PO) — confirm whether pending rating is skipped or blocked.
- Re-complete / status flicker: creating pending rating must be idempotent (unique on TO+vendor+tenant).
- Draft abandoned: pending `VendorRating` remains until submitted; does not update `Vendor.rating`.

### Form & validation
- Star score outside 1–5: rejected.
- Criterion comment > 500 chars or overall comment > 1000: rejected.
- Missing Y/N answers: TODO(PO) — confirm whether all seeded questions are required or optional in v1.
- Inactive `RatingQuestion` rows: not shown on form; already-answered inactive questions remain on historical ratings.

### Average & rolling update
- Non-terminating decimal (e.g. 5, 4, 4 → 4.33): must use `round(..., 2)` consistently in unit and API.
- Concurrent submits for different TOs on same vendor: rolling average must not lose increments (transaction / lock strategy).

### Visibility
- Vendor user with dual tenant role: still must not see vendor-direction ratings via vendor-scoped endpoints in v1.

---

## API Endpoints

```
POST   /api/v1/transport-orders/{id}/vendor-rating/     # submit rating (Tenant Super Admin / Tenant Admin / TDO)
GET    /api/v1/transport-orders/{id}/vendor-rating/     # get rating for TO (admin only)
GET    /api/v1/vendors/{id}/ratings/                    # paginated rating history (admin only)
GET    /api/v1/vendors/{id}/rating-summary/             # avg, count, per-criterion avgs (admin only)
GET    /api/v1/rating-questions/?criterion=VEHICLE      # fetch active questions for form population
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit vendor rating (post-TO) | `tenant_super_admin`, `tenant_admin`, `tdo` |
| View vendor rating history | `tenant_super_admin`, `tenant_admin`, `tdo`, `transport_planner` |
| View rating in bid/award views | `tenant_super_admin`, `tenant_admin`, `tdo`, `transport_planner` |
| Configure / add rating questions | `tenant_super_admin`, `tenant_admin` |
| View own vendor rating (as vendor) | **Denied in v1** |

**Permission codes (proposed):** `vendor.rating.create`, `vendor.rating.view`, `vendor.rating.configure`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-01-1 | Data models + migrations | `VendorRating`, `VendorRatingCriterion`, `VendorRatingAnswer`, `RatingQuestion` | High | Not started |
| VRS-01-2 | Seed rating questions | Default Y/N questions for each of the 3 criteria | High | Not started |
| VRS-01-3 | Rating form (admin portal) | 3-criterion panels, star selector, Y/N questions, comments, live avg preview | High | Not started |
| VRS-01-4 | Average calculation + Vendor.rating update | Rolling average on submit; `rating_count` increment | High | Not started |
| VRS-01-5 | Submit + immutability + audit log | `is_submitted` flag; audit `VENDOR_RATING_SUBMITTED` | High | Not started |
| VRS-01-6 | TO completion rating prompt | "Rate Vendor" CTA on completed TO detail view | Medium | Not started |
| VRS-01-7 | Tests | Cover AC-1…AC-6 scenarios + Edge Cases (avg, immutability, RBAC) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Transport Order (`COMPLETED` status) | Upstream | Rating triggered on TO completion |
| Vendor model (`rating` + `rating_count` fields) | Upstream | Existing `rating` field updated; add `rating_count` |
| Audit log service | Upstream | Existing pattern |
| `RatingQuestion` seed | Internal | Required before form can render |

---

## Definition of Done

- [ ] `VendorRating` and related models created with migrations
- [ ] Seed data for default rating questions per criterion (3 × 3 min)
- [ ] Admin rating form renders all 3 criterion panels, submits correctly
- [ ] Average rating calculated and `Vendor.rating` + `rating_count` updated on submit
- [ ] Rating immutable after submission; audit log entry created
- [ ] Vendor portal / mobile does **not** expose vendor's own rating in v1
- [ ] Unit/API tests for scenarios AC-1.1…AC-6.2 (and listed edge cases in scope) — see [VRS-01 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md)
- [ ] TDD catalog statuses updated (`Planned` → `Failing` → `Passing`) for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
