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
**I want to** rate a vendor on completion of a Transport Order with a single score and a few quick Yes/No questions  
**So that** vendor performance is tracked internally and informs future bid/award decisions

## Business Context

When a Transport Order (TO) is marked completed/closed, the system prompts the responsible Tenant Super Admin, Tenant Admin, or TDO to rate the vendor. Ratings are **internal only** — not visible to vendors in v1.

Rating shape (v1):

| Element | Rule |
|---------|------|
| **Overall score** | One required **1–5 star** rating |
| **Questions** | Exactly **3 randomly selected** Yes/No questions from the VENDOR question pool |
| **Answer UI** | **Radio buttons** (Yes / No) — portal theme |
| **Comment** | Optional overall comment (max 1 000 chars) |

There are **no separate star ratings per topic** (no Product Delivery / Driver Behaviour / Vehicle score panels). Qualitative coverage comes only from the three random questions.

The submitted score updates the vendor’s rolling overall rating (`Vendor.rating`).

---

## Acceptance Criteria

> **Test scenarios:** see [VRS-01 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) · [Vendor Rating System index](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md)

### AC-1: Rating Trigger

Given a Transport Order transitions to `COMPLETED` (or live terminal `closed`),

when the system processes the status change (and an authorized admin opens the completed TO or Vendor Profile rating entry),

then a pending `VendorRating` exists for that TO/vendor, and only one rating per TO is allowed.

- [ ] When a TO status transitions to `COMPLETED` / `closed`, the system creates a **pending** `VendorRating` record for that TO (linked to TO and vendor).
- [ ] Tenant Super Admin / Tenant Admin / TDO with `Vendor.Rating.Create` permission sees a **"Rate Vendor"** button or prompt on the completed TO detail view.
- [ ] Only **one rating per TO** is allowed — re-opening the prompt shows the existing (submitted or draft) rating.
- [ ] Rating prompt is also accessible from **Vendor Profile → Rating History → Rate** (for past unrated TOs).

### AC-2: Rating Form — Single Score + Random Questions

Given an authorized admin opens the vendor rating form for a completed TO,

when the form renders,

then it shows one 1–5 star control, exactly three Yes/No radio questions, and an optional overall comment — using existing portal theme/components.

- [ ] Form shows a **single 1–5 star selector** (required — cannot submit without a score).
- [ ] Form shows **exactly 3 Yes/No questions**, randomly selected from the active VENDOR `RatingQuestion` pool and locked for this pending rating (refresh does not reshuffle mid-fill).
- [ ] Each question uses a **radio button** group: **Yes** · **No** (mutually exclusive; both options required to answer before submit).
- [ ] An optional **overall comment** field (max 1 000 chars).
- [ ] UI reuses **existing admin portal** layout, controls, spacing, and star display patterns — no new visual language.

### AC-3: Predefined Questions — v1 Seed Pool

Given the rating form loads questions,

when seed data is present,

then the VENDOR Yes/No pool is available and the form samples three of them.

- [ ] Seed pool includes the nine default VENDOR questions (delivery, driver, vehicle topics) listed in [`vendor-rating.md`](../../../05-modules/07-vendor-management/vendor-rating.md).
- [ ] Questions stored in `RatingQuestion` with `rating_type=VENDOR` — seeded; admin-configurable in a future sprint.
- [ ] Form / API returns **3 random active** questions for the pending rating (not all nine at once).

### AC-4: Score Persistence & Vendor Rating Update

Given a valid overall score is submitted,

when the rating is persisted,

then `average_rating` mirrors the score and `Vendor.rating` / `rating_count` update as a rolling average.

- [ ] `score` ∈ [1, 5]; `average_rating = Decimal(score)` (e.g. `4.00`).
- [ ] `Vendor.rating` updated as rolling average:  
  `new_avg = ((current_rating × rating_count) + score) / (rating_count + 1)` (rounded to 2 dp).
- [ ] `Vendor.rating_count` incremented on each submission.
- [ ] Exactly three `VendorRatingAnswer` rows persisted with boolean Yes/No values.

### AC-5: Submission & Immutability

Given an admin submits a complete valid rating,

when persistence succeeds,

then the `VendorRating` stores all fields, becomes immutable, and an audit log entry is written.

- [ ] On submit, `VendorRating` persisted with: `to_id`, `vendor_id`, `tenant_id`, `rated_by`, `submitted_at`, `score`, three Y/N answers, `average_rating`, `overall_comment`.
- [ ] Submission is **immutable** — cannot be edited after submit.
- [ ] Audit log entry created (`AuditEventType.CREATE` / `action="VendorRating.Submit"`).

### AC-6: Not Visible to Vendor (v1)

Given vendor users access portal or mobile APIs,

when they request their own vendor rating data,

then access is denied in v1; only Tenant Super Admin, Tenant Admin, TDO, and Transport Planner see ratings via internal admin views.

- [ ] Vendor portal and vendor mobile app do **not** expose the vendor's own rating in v1.
- [ ] Rating data is accessible only to Tenant Super Admin, Tenant Admin, TDO, and Transport Planner via internal admin views.

---

## Edge Cases

### Trigger & uniqueness
- TO completed with no assigned vendor: skip pending rating (no row).
- Re-complete / status flicker: creating pending rating must be idempotent (unique on TO+vendor+tenant).
- Draft abandoned: pending `VendorRating` remains until submitted; does not update `Vendor.rating`.

### Form & validation
- Star score outside 1–5: rejected.
- Overall comment > 1000: rejected.
- Missing any of the 3 radio answers: rejected (all three required).
- Wrong / extra question IDs (not the locked set): rejected.
- Inactive `RatingQuestion` rows: not sampled for new forms; already-answered inactive questions remain on historical ratings.
- Active pool size &lt; 3: form/API returns a clear business error until pool is restored.

### Average & rolling update
- Concurrent submits for different TOs on same vendor: rolling average must not lose increments (`select_for_update`).

### Visibility
- Vendor user with dual tenant role: still must not see vendor-direction ratings via vendor-scoped endpoints in v1.

---

## API Endpoints

> Actual endpoints implemented in `apps/vendors/urls.py` and `apps/core/web_urls.py`:

```
# Admin API (DRF)
GET    /api/v1/vendors/<vendor_id>/rate/<to_id>/form/    # init/return pending rating + 3 locked questions
POST   /api/v1/vendors/<vendor_id>/rate/<to_id>/submit/  # submit score + answers
GET    /api/v1/vendors/<vendor_id>/ratings/              # paginated rating history
GET    /api/v1/vendors/<vendor_id>/rating-summary/       # overall avg + count
GET    /api/v1/rating-questions/?type=VENDOR&random=3    # active VENDOR pool sample

# Admin Portal (Django SSR)
GET/POST  /vendors/<vendor_id>/rate/<to_id>/    # rate_vendor.html (Bootstrap 5 + Alpine.js)
GET       /vendors/<vendor_id>/ratings/         # vendor_rating_history.html
```

**Submit body:** `{ "transport_order_id": "<uuid>", "score": 1-5, "overall_comment": "...", "answers": [{ "question_id": "<uuid>", "answer": true|false } ×3] }`

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit vendor rating (post-TO) | `tenant_super_admin`, `tenant_admin`, `tdo_vendor_fleet` |
| View vendor rating history | `tenant_super_admin`, `tenant_admin`, `tdo_vendor_fleet`, `transport_planner` |
| View rating in bid/award views | `tenant_super_admin`, `tenant_admin`, `tdo_vendor_fleet`, `transport_planner` |
| Configure / add rating questions | `tenant_super_admin`, `tenant_admin` |
| View own vendor rating (as vendor) | **Denied in v1** |

**Permission codes:** `Vendor.Rating.Create`, `Vendor.Rating.View`, `Vendor.Rating.Configure`  
*(defined in `apps/core/constants_rbac.py`; seeded via `apps/core/role_seed_data.py`)*

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-01-1 | Data models + migrations | `VendorRating`, `VendorRatingAnswer`, `RatingQuestion` (no criterion score models) | High | Not started |
| VRS-01-2 | Seed rating question pool | 9 VENDOR Yes/No questions | High | Not started |
| VRS-01-3 | Rating form (admin portal) | Single star + 3 random Y/N radios + comment; existing portal theme | High | Not started |
| VRS-01-4 | Score + Vendor.rating update | Rolling average on submit; `rating_count` increment | High | Not started |
| VRS-01-5 | Submit + immutability + audit log | `is_submitted` flag; audit `action="VendorRating.Submit"` | High | Not started |
| VRS-01-6 | TO completion rating prompt | `VendorRatingService.ensure_pending_on_to_terminal()` hook in `transition_service.py` | Medium | Not started |
| VRS-01-7 | Tests | Cover AC-1…AC-6 + edge cases | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Transport Order (`COMPLETED` / `closed` status) | Upstream | Rating triggered on TO terminal status |
| Vendor model (`rating` + `rating_count` fields) | Upstream | Existing `rating` field updated; add `rating_count` |
| Audit log service | Upstream | Existing pattern |
| `RatingQuestion` seed | Internal | Required before form can render |

---

## Definition of Done

- [ ] `VendorRating` + `VendorRatingAnswer` + `RatingQuestion` created with migrations
- [ ] Seed data: VENDOR question pool (≥ 9, show 3 random)
- [ ] Admin rating form: single 1–5 score, 3 Yes/No radios, optional comment; portal theme
- [ ] Score persisted; `Vendor.rating` + `rating_count` updated on submit
- [ ] Rating immutable after submission; audit log entry created
- [ ] Vendor portal / mobile does **not** expose vendor's own rating in v1
- [ ] Unit/API tests for AC-1…AC-6 — see [VRS-01 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md)
- [ ] TDD catalog statuses updated (`Planned` → `Failing` → `Passing`) for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 | 8 SP | Status: Pending | Last Updated: 2026-09-17*
