---
jira_key: ~
jira_type: Story
jira_sprint: ~
story_id: VRS-02
title: Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App)
epic: Vendor Rating System
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: ~
related_stories:
  - VRS-01-post-to-vendor-rating-admin.md
  - VRS-03-vendor-rating-visibility-admin.md
source_docs:
  - ../../../05-modules/07-vendor-management/vendor-rating.md
  - ../../../05-modules/09-mobile-apps/vendor-mobile.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
tdd_test_cases: ../../../09-testing/stories-phase-2/008-Vendor Rating System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/008-Vendor Rating System/00-all-test-cases.md
---

# VRS-02 — Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App)

## TDD Test Cases

| Link | What |
|------|------|
| [VRS-02 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md) | `VRS-02-TC01`…`TC19` + edge cases (`AC-N.x` mapped) |
| [Vendor Rating System TDD index](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) | All VRS-01…VRS-03 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) | README + recommended TDD order |

Write failing tests from the catalog **before** implementation.

## User Story

**As a** Vendor (via the Vendor Mobile App)  
**I want to** rate the tenant across structured criteria with Yes/No questions after completing a Transport Order  
**So that** my experience working with this tenant is properly documented and helps other vendors make informed decisions when requesting to join that tenant

## Business Context

The rating system is fully **symmetric**. Both directions use the same structural pattern: criteria-based rating (1–5 stars per criterion), predefined Yes/No questions per criterion, optional comments, and a computed average.

| Direction | Who rates | What is rated | Criteria | Trigger |
|-----------|-----------|---------------|----------|---------|
| **Tenant → Vendor** (VRS-01) | Tenant Super Admin / Tenant Admin / TDO | Vendor performance | Product Delivery · Driver Behaviour · Vehicle | TO → `COMPLETED` (admin portal) |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile) | Tenant experience | Payment & Commercial · Load Readiness · Communication & Support | Vendor ACKs completed trip (mobile) |

**Tenant ratings serve two purposes:**
1. **Internal self-assessment** — Tenant Super Admin / Tenant Admin sees their own aggregate rating from all vendors.
2. **Vendor join-decision tool** — When a vendor discovers a new tenant and considers requesting membership, they see the tenant's aggregate rating before joining.

---

## Rating Criteria (Vendor → Tenant)

Three criteria assess the tenant's quality as a business partner. Each criterion gets:
- A **1–5 star score** (required)
- **Predefined Yes/No questions** (from `RatingQuestion` seed, `rating_type = "TENANT"`)
- An **optional comment** (max 500 chars)

| # | Criterion | What it measures |
|---|-----------|-----------------|
| 1 | **Payment & Commercial** | Was payment released on time? Were agreed rates and terms honoured? |
| 2 | **Load Readiness** | Was the load ready on schedule? Were documents correct? Was product properly prepared? |
| 3 | **Communication & Support** | Was the tenant's team responsive? Were instructions clear? Were issues resolved promptly? |

### Average Calculation

```
average_rating = round((payment_commercial_score + load_readiness_score + communication_support_score) / 3, 2)

Tenant.vendor_rating (rolling) =
    ((current_vendor_rating × vendor_rating_count) + new_average) / (vendor_rating_count + 1)
```

---

## Predefined Yes/No Questions — v1 Seed (Vendor → Tenant)

| Criterion | Questions |
|-----------|-----------|
| **Payment & Commercial** | "Was payment released within the agreed timeline?" · "Were the agreed rates and commercial terms honoured?" · "Were payment-related documents (invoice, receipt) processed without issues?" |
| **Load Readiness** | "Was the load ready for pickup at the scheduled time?" · "Were all required shipping documents provided correctly?" · "Was the product properly packaged and prepared for transport?" |
| **Communication & Support** | "Was the tenant's coordination team reachable and responsive?" · "Were trip instructions and route details clearly communicated?" · "Were any issues or delays resolved promptly by the tenant's team?" |

Questions stored in `RatingQuestion` with `rating_type = "TENANT"`, `is_active = True`. Seeded at deployment.

---

## Acceptance Criteria

### AC-1: Rating Trigger — Mobile

Given the vendor has acknowledged trip completion on mobile,

when the completed-trip confirmation flow continues,

then a skippable **"Rate this Tenant"** step is shown, with later access from trip detail while pending, and one rating per TO.

- [ ] After the vendor acknowledges trip completion on the completed trip confirmation screen, a **"Rate this Tenant"** screen / bottom sheet is presented as the next step.
- [ ] Prompt is **skippable** (dismiss button visible) — vendor is never forced to rate.
- [ ] If skipped, a **"Rate Tenant"** action is accessible from completed trip detail at any time (while rating is still pending submission).
- [ ] One rating per TO per vendor — idempotent (re-opening shows existing draft or read-only submitted rating).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Rate this Tenant after ACK
  Given the vendor has acknowledged trip completion for TO "TO-2026-010"
  When the completed trip confirmation screen advances
  Then a "Rate this Tenant" screen or bottom sheet is shown

Scenario: AC-1.2 - Rating prompt is skippable
  Given the Rate this Tenant prompt is visible
  When the vendor taps dismiss / skip
  Then the rating is not submitted
  And the vendor can continue without rating

Scenario: AC-1.3 - Rate Tenant from trip detail after skip
  Given the vendor skipped the post-ACK rating prompt
  And the tenant rating is still unsubmitted
  When the vendor opens completed trip detail
  Then a "Rate Tenant" action is available

Scenario: AC-1.4 - One rating per TO — reopen shows existing
  Given a TenantRating already exists for this TO and vendor
  When the vendor re-opens Rate Tenant
  Then the existing draft or read-only submitted rating is shown
  And no second TenantRating row is created
```

### AC-2: Rating Form — 3 Criterion Panels

Given the vendor opens the tenant rating form,

when the form renders and they enter scores,

then three panels (Payment & Commercial · Load Readiness · Communication & Support) require 1–5 stars, support Y/N + comments, show live average, and keep submit disabled until all three scores are set.

- [ ] Form shows **3 criterion panels**: Payment & Commercial · Load Readiness · Communication & Support.
- [ ] Each panel contains:
  - Panel header with criterion name and brief description.
  - **1–5 star selector** (required — all 3 must be filled to submit).
  - **Predefined Yes/No question list** for that criterion (tappable toggle: Yes / No per question).
  - An optional **comment** field (max 500 chars).
- [ ] A global **overall comment** field (optional, max 1 000 chars) at the bottom.
- [ ] **Live running average** displayed as vendor fills in criteria scores (e.g. "Current average: ⭐ 3.7").
- [ ] Submit button remains disabled until all 3 criterion star scores are selected.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Three tenant-direction criterion panels
  Given the Rate Tenant form is open
  When the form renders
  Then panels Payment & Commercial, Load Readiness, and Communication & Support are shown
  And each has stars 1–5, Y/N toggles, and optional comment

Scenario: AC-2.2 - Submit disabled until all three scores
  Given only two criterion star scores are selected
  When the vendor views the form
  Then the submit button remains disabled

Scenario: AC-2.3 - Live running average
  Given scores 5, 4, and 3 are selected
  When the third score is set
  Then the live average shows round((5+4+3)/3, 2) = 4.00
```

### AC-3: Predefined Questions Loaded from API

Given the mobile form needs Y/N questions,

when it fetches rating questions for `rating_type=TENANT`,

then questions populate per criterion, and empty results collapse gracefully.

- [ ] Form populates Y/N questions by fetching `GET /api/v1/rating-questions/?rating_type=TENANT&criterion=<X>` per criterion.
- [ ] If no questions returned for a criterion, the panel still renders (questions section collapses gracefully).

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Questions loaded from API by criterion
  Given active RatingQuestion rows with rating_type TENANT
  When the form requests questions for each criterion
  Then Y/N questions populate for Payment & Commercial, Load Readiness, and Communication & Support

Scenario: AC-3.2 - Empty questions section collapses
  Given no active questions for criterion LOAD_READINESS
  When the form loads that panel
  Then the panel still renders with star selector
  And the questions section is collapsed / hidden
```

### AC-4: Submission & Immutability

Given the vendor submits a complete valid tenant rating,

when the API persists the rating,

then records are atomic, averages update, submission is immutable, duplicates return 400, and a success screen shows.

- [ ] On submit, `TenantRating` + 3 `TenantRatingCriterion` records + per-criterion `TenantRatingAnswer` records are persisted atomically.
- [ ] `average_rating` computed and stored on `TenantRating`.
- [ ] `Tenant.vendor_rating` rolling average updated; `Tenant.vendor_rating_count` incremented.
- [ ] Submission is **immutable** — no editing after submit.
- [ ] Duplicate protection: second submission for same TO is rejected (`400 Bad Request`).
- [ ] Success screen: "Thank you for your rating!" with average displayed.

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Atomic persist with average and rolling update
  Given valid scores 5, 4, 4 and Y/N answers
  When the vendor submits POST /api/v1/transport-orders/{id}/tenant-rating/
  Then TenantRating + 3 criteria + answers are stored
  And average_rating is 4.33
  And Tenant.vendor_rating and vendor_rating_count are updated

Scenario: AC-4.2 - Duplicate submission returns 400
  Given a submitted TenantRating already exists for this TO and vendor
  When the vendor POSTs tenant-rating again
  Then the response is 400 Bad Request
  And no second rating is created

Scenario: AC-4.3 - Submitted rating immutable
  Given a submitted TenantRating
  When the vendor attempts to change scores
  Then the change is rejected
  And stored values remain unchanged

Scenario: AC-4.4 - Success screen shows average
  Given a successful submit with average_rating 4.00
  When the response is shown on mobile
  Then "Thank you for your rating!" is displayed with the average
```

### AC-5: Tenant Rating Visibility — Join Tenant Flow

Given a vendor browses tenants to request membership,

when tenant cards / detail load,

then aggregate vendor-submitted rating, count, and per-criterion averages are shown (or "No ratings yet").

- [ ] When a vendor browses tenants to request membership (Join Tenant screen), each **tenant card** shows:
  - Aggregate vendor-submitted rating: e.g. ⭐⭐⭐⭐ 4.2 / 5.0
  - Rating count: "Based on 8 vendor ratings"
  - Per-criterion averages (expandable or shown in detail view): Payment & Commercial · Load Readiness · Communication & Support
- [ ] If no ratings yet: "No ratings yet" displayed (not hidden).

**Test Scenarios (AC-5):**

```gherkin
Scenario: AC-5.1 - Join Tenant card shows aggregate rating
  Given tenant "Nourish Foods" has vendor_rating 4.20 and vendor_rating_count 8
  When the vendor opens Join Tenant discovery
  Then the tenant card shows aggregate 4.2 / 5.0 and "Based on 8 vendor ratings"
  And per-criterion averages are available in expand/detail

Scenario: AC-5.2 - No ratings yet is explicit
  Given a tenant with vendor_rating_count 0
  When the vendor views that tenant card
  Then "No ratings yet" is displayed
```

### AC-6: Vendor Views Own Submitted Rating

Given the vendor has submitted a tenant rating for a TO,

when they open completed trip detail,

then their own rating is shown read-only with scores, answers, comments, date, and average.

- [ ] After submission, vendor can view their own submitted rating on the completed trip detail (read-only).
- [ ] Shows: per-criterion scores, Y/N answers, comments, submitted date, average.

**Test Scenarios (AC-6):**

```gherkin
Scenario: AC-6.1 - Own submitted rating read-only on trip detail
  Given the vendor submitted a TenantRating for TO "TO-2026-010"
  When the vendor opens completed trip detail
  Then per-criterion scores, Y/N answers, comments, submitted_at, and average are shown read-only
```

### AC-7: Tenant Super Admin / Tenant Admin — View Incoming Ratings

Given vendors have submitted tenant ratings,

when Tenant Super Admin or Tenant Admin opens the incoming ratings view,

then a list and summary card show vendor, TO, scores, average, comments, and aggregates.

- [ ] Tenant Super Admin / Tenant Admin can view a **list of all vendor-submitted ratings** for their tenant in the admin portal.
- [ ] Displays: vendor name, TO reference, per-criterion scores, average, comments, submitted date.
- [ ] Summary card at top: overall aggregate average, total count, per-criterion averages.

**Test Scenarios (AC-7):**

```gherkin
Scenario: AC-7.1 - Admin list of incoming vendor ratings
  Given multiple submitted TenantRating rows for the tenant
  When a tenant_super_admin or tenant_admin opens GET /api/v1/tenants/{id}/vendor-ratings/
  Then each row shows vendor name, TO reference, per-criterion scores, average, comments, submitted_at

Scenario: AC-7.2 - Summary card aggregates
  Given submitted tenant ratings exist
  When a tenant_super_admin or tenant_admin opens the incoming ratings view
  Then the summary card shows overall aggregate average, total count, and per-criterion averages
```

### AC-8: No Automated Decision Impact (v1)

Given a tenant has a low or high vendor-submitted rating,

when approval, bid, or access decisions run in v1,

then tenant rating is informational only and does not gate those decisions.

- [ ] Tenant rating does **not** gate any approval, bid, or access decision in v1.
- [ ] Used for **informational/display purposes only** in v1.

**Test Scenarios (AC-8):**

```gherkin
Scenario: AC-8.1 - Low tenant rating does not block join or bid flows
  Given a tenant with a low vendor_rating
  When a vendor requests to join or participates in bid/access flows
  Then no automated rejection is applied based on tenant rating in v1
```

---

## Edge Cases

### Trigger & skip
- Vendor ACKs offline then syncs: rating prompt should appear after successful ACK sync (or from trip detail).
- Skip then submit later: pending draft may be created on first open; must not update `Tenant.vendor_rating` until submit.

### Validation
- Star outside 1–5: API rejects.
- Comment length over limits: rejected.
- Vendor not assigned on the TO: submit denied.
- TO not completed / ACK not done: TODO(PO) — confirm whether submit is allowed only after ACK.

### Duplicates & concurrency
- Double-tap submit: second request returns 400; only one row; rolling count increments once.
- Unique constraint `(transport_order, vendor)` enforces one rating.

### Join Tenant display
- Partial criterion data should not appear — summary endpoint returns complete aggregates only from submitted ratings.
- Very large rating_count: copy still "Based on N vendor ratings".

---

## API Endpoints

```
# Vendor submits / views their rating for a completed TO
POST   /api/v1/transport-orders/{id}/tenant-rating/       # vendor submits tenant rating
GET    /api/v1/transport-orders/{id}/tenant-rating/       # vendor views own submitted rating

# Join Tenant discovery flow
GET    /api/v1/tenants/{id}/vendor-rating-summary/        # aggregate avg, count, per-criterion avgs (any authed vendor)

# Admin views
GET    /api/v1/tenants/{id}/vendor-ratings/               # paginated list of all vendor ratings (tenant_super_admin, tenant_admin)
GET    /api/v1/rating-questions/?rating_type=TENANT&criterion=LOAD_READINESS  # fetch questions for form
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit tenant rating | `vendor` (must be assigned on the TO) |
| View own submitted rating | `vendor` (own submission only) |
| View tenant aggregate rating summary | `vendor` (any — during join flow) |
| View all vendor-submitted ratings for tenant | `tenant_super_admin`, `tenant_admin` |
| View per-criterion rating breakdown in admin | `tenant_super_admin`, `tenant_admin` |

**Permission codes (proposed):** `tenant.rating.create`, `tenant.rating.view_own`, `tenant.rating.view_summary`, `tenant.rating.admin_view`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-02-1 | Data models + migrations | `TenantRating`, `TenantRatingCriterion`, `TenantRatingAnswer` + `Tenant.vendor_rating` fields | High | Not started |
| VRS-02-2 | Seed tenant rating questions | Default Y/N questions for Payment & Commercial, Load Readiness, Communication & Support | High | Not started |
| VRS-02-3 | Vendor mobile — rating screen | 3-criterion panels, star selectors, Y/N questions, comments, live avg, submit + confirm | High | Not started |
| VRS-02-4 | Average calculation + Tenant.vendor_rating update | Rolling average on submit; `vendor_rating_count` increment | High | Not started |
| VRS-02-5 | Submit + immutability | Atomic persist; `is_submitted` flag; duplicate rejection | High | Not started |
| VRS-02-6 | Tenant rating summary in Join Tenant flow | Aggregate ★ + count + per-criterion avgs on tenant card (mobile) | Medium | Not started |
| VRS-02-7 | Admin portal — incoming ratings view | List of vendor ratings for tenant + summary card | Medium | Not started |
| VRS-02-8 | Tests | Cover AC-1…AC-8 scenarios + Edge Cases (skip, duplicate 400, Join Tenant) | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Transport Order (`COMPLETED` state + vendor ACK screen) | Upstream | UI trigger point |
| `RatingQuestion` model + seed (VRS-01) | Sibling | Shared model — tenant questions use `rating_type = "TENANT"` |
| Join Tenant flow (vendor mobile) | Downstream | Tenant aggregate rating surfaced here |
| Tenant model | Upstream | Add `vendor_rating` + `vendor_rating_count` fields |

---

## Definition of Done

- [ ] `TenantRating`, `TenantRatingCriterion`, `TenantRatingAnswer` models created with migrations
- [ ] Seed data: 3 Y/N questions per criterion (9 total for tenant direction)
- [ ] `Tenant.vendor_rating` + `vendor_rating_count` fields added with migration
- [ ] Vendor mobile rating screen: 3-criterion panels, Y/N questions, live average, submit
- [ ] Rolling `Tenant.vendor_rating` updated correctly on each submission
- [ ] Submission immutable; duplicate submission rejected
- [ ] Tenant aggregate rating (avg + count + per-criterion) shown in Join Tenant flow
- [ ] Tenant Super Admin / Tenant Admin can view incoming vendor ratings in admin portal
- [ ] Unit/API/Maestro tests for scenarios AC-1.1…AC-8.1 (and listed edge cases in scope) — see [VRS-02 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md)
- [ ] TDD catalog statuses updated (`Planned` → `Failing` → `Passing`) for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-14*
