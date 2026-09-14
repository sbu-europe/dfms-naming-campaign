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

## TDD Test Cases

| Link | What |
|------|------|
| [VRS-01 TDD catalog](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) | `VRS-01-TC01`…`TC17` + edge cases (`AC-N.x` mapped) |
| [Vendor Rating System TDD index](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) | All VRS-01…VRS-03 test cases |
| [Feature TDD folder](../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) | README + recommended TDD order |

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

### AC-1: Rating Trigger

Given a Transport Order transitions to `COMPLETED`,

when the system processes the status change (and an authorized admin opens the completed TO or Vendor Profile rating entry),

then a pending `VendorRating` exists for that TO/vendor, and only one rating per TO is allowed.

- [ ] When a TO status transitions to `COMPLETED`, the system creates a **pending** `VendorRating` record for that TO (linked to TO and vendor).
- [ ] Tenant Super Admin / Tenant Admin / TDO with `vendor.rating.create` permission sees a **"Rate Vendor"** button or prompt on the completed TO detail view.
- [ ] Only **one rating per TO** is allowed — re-opening the prompt shows the existing (submitted or draft) rating.
- [ ] Rating prompt is also accessible from **Vendor Profile → Rating History → Rate** (for past unrated TOs).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - COMPLETED TO creates pending VendorRating
  Given a Transport Order assigned to vendor "V-ACME" is in progress
  When the TO status transitions to COMPLETED
  Then a pending VendorRating exists linked to that TO and vendor
  And is_submitted is false

Scenario: AC-1.2 - Rate Vendor CTA on completed TO detail
  Given a completed TO with a pending VendorRating
  And a Tenant Super Admin, Tenant Admin, or TDO with vendor.rating.create permission
  When the admin opens the completed TO detail view
  Then a "Rate Vendor" button or prompt is shown

Scenario: AC-1.3 - One rating per TO — reopen shows existing
  Given a VendorRating already exists for TO "TO-2026-001"
  When the admin opens the Rate Vendor prompt again
  Then the existing draft or submitted rating is shown
  And no second VendorRating row is created

Scenario: AC-1.4 - Rate from Vendor Profile for past unrated TOs
  Given a completed TO for vendor "V-ACME" with a pending (unsubmitted) rating
  When the admin opens Vendor Profile → Rating History → Rate
  Then the rating form for that TO is accessible
```

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

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - Three criterion panels with required stars
  Given the vendor rating form is open for a completed TO
  When the form renders
  Then panels Product Delivery, Driver Behaviour, and Vehicle are shown
  And each has a 1–5 star selector and optional comment (max 500)
  And an overall comment field (max 1000) is shown

Scenario: AC-2.2 - Submit blocked until all three scores set
  Given the form is open
  When only two criterion star scores are selected
  Then submit remains blocked
  And a clear validation indicates all three scores are required

Scenario: AC-2.3 - Live average preview updates
  Given scores Product Delivery=5, Driver Behaviour=4, Vehicle unset
  When the admin sets Vehicle=3
  Then the live preview shows average round((5+4+3)/3, 2) = 4.00
```

### AC-3: Predefined Questions — v1 Seed Data

Given the rating form loads questions for each criterion,

when seed data is present,

then the v1 default Y/N questions for Product Delivery, Driver Behaviour, and Vehicle are available from `RatingQuestion`.

- [ ] **Product Delivery:** "Was the product delivered on time?", "Was the product delivered in full quantity?", "Was the product in good condition on arrival?"
- [ ] **Driver Behaviour:** "Was the driver professional and courteous?", "Did the driver follow safety protocols?", "Did the driver communicate proactively during the trip?"
- [ ] **Vehicle:** "Was the vehicle in roadworthy condition?", "Was the vehicle clean and appropriate for the load type?", "Did the vehicle arrive on time for loading?"
- [ ] Questions stored in `RatingQuestion` model — seeded, admin-configurable in a future sprint.

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Seed questions load per criterion
  Given RatingQuestion seed data for rating_type VENDOR
  When the admin opens the rating form
  Then Product Delivery, Driver Behaviour, and Vehicle each show their three default Y/N questions

Scenario: AC-3.2 - Questions come from RatingQuestion model
  Given an active RatingQuestion for criterion VEHICLE
  When GET /api/v1/rating-questions/?criterion=VEHICLE is called
  Then the active question text is returned for form population
```

### AC-4: Average Calculation & Vendor Rating Update

Given all three criterion scores are submitted,

when the rating is persisted,

then `average_rating = round((s1+s2+s3)/3, 2)` and `Vendor.rating` / `rating_count` update as a rolling average.

- [ ] `average_rating = round((product_delivery_score + driver_behaviour_score + vehicle_score) / 3, 2)`.
- [ ] `Vendor.rating` updated to reflect **rolling average** across all submitted ratings:  
  `new_avg = ((current_rating × rating_count) + new_average) / (rating_count + 1)`.
- [ ] `Vendor.rating_count` (or computed aggregate) incremented on each submission.

**Test Scenarios (AC-4):**

```gherkin
Scenario: AC-4.1 - Average rounds to two decimal places
  Given criterion scores 5, 4, and 3
  When the rating is submitted
  Then average_rating is 4.00

Scenario: AC-4.2 - Rolling Vendor.rating update
  Given Vendor.rating is 4.00 with rating_count 1
  And a new submitted average_rating of 5.00
  When the rolling update runs
  Then Vendor.rating becomes 4.50
  And rating_count becomes 2

Scenario: AC-4.3 - First submitted rating sets Vendor.rating
  Given Vendor.rating_count is 0
  And a new average_rating of 3.67
  When the rating is submitted
  Then Vendor.rating is 3.67
  And rating_count is 1
```

### AC-5: Submission & Immutability

Given an admin submits a complete valid rating,

when persistence succeeds,

then the `VendorRating` stores all fields, becomes immutable, and an audit log entry is written.

- [ ] On submit, `VendorRating` record persisted with: `to_id`, `vendor_id`, `tenant_id`, `rated_by` (user), `submitted_at`, per-criterion scores + Y/N answers + comments, `average_rating`, `overall_comment`.
- [ ] Submission is **immutable** — rating cannot be edited after submit (consistent with bid immutability pattern).
- [ ] Audit log entry created on submission (`VENDOR_RATING_SUBMITTED` action).

**Test Scenarios (AC-5):**

```gherkin
Scenario: AC-5.1 - Submit persists full rating payload
  Given a valid three-criterion rating with Y/N answers and comments
  When the admin submits
  Then VendorRating is submitted with rated_by, submitted_at, average_rating, and overall_comment
  And three VendorRatingCriterion rows and answers are stored

Scenario: AC-5.2 - Submitted rating cannot be edited
  Given a submitted VendorRating for TO "TO-2026-001"
  When the admin attempts to PATCH or re-submit changed scores
  Then the change is rejected
  And stored scores remain unchanged

Scenario: AC-5.3 - Audit log on submission
  Given a valid rating submit
  When persistence succeeds
  Then an audit log entry with action VENDOR_RATING_SUBMITTED exists
```

### AC-6: Not Visible to Vendor (v1)

Given vendor users access portal or mobile APIs,

when they request their own vendor rating data,

then access is denied in v1; only Tenant Super Admin, Tenant Admin, TDO, and Transport Planner see ratings via internal admin views.

- [ ] Vendor portal and vendor mobile app do **not** expose the vendor's own rating in v1.
- [ ] Rating data is accessible only to Tenant Super Admin, Tenant Admin, TDO, and Transport Planner via internal admin views.

**Test Scenarios (AC-6):**

```gherkin
Scenario: AC-6.1 - Vendor cannot read own rating via API
  Given a submitted VendorRating for vendor "V-ACME"
  When a vendor-authenticated user GET vendor rating history or TO vendor-rating
  Then the response is 403

Scenario: AC-6.2 - Admin roles can view rating
  Given a submitted VendorRating
  When a tenant_super_admin, tenant_admin, tdo, or transport_planner requests rating history
  Then the rating is returned
```

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

## Data Models

```python
class VendorRating(TenantScopedModel):
    """One rating record per completed TO."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="ratings")
    rated_by        = ForeignKey("TenantUser", on_delete=SET_NULL, null=True)
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)  # 1.00–5.00
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor", "tenant")]


class VendorRatingCriterion(models.Model):
    """Score + answers for one criterion within a VendorRating."""
    CRITERION_CHOICES = [
        ("PRODUCT_DELIVERY", "Product Delivery"),
        ("DRIVER_BEHAVIOUR", "Driver Behaviour"),
        ("VEHICLE",          "Vehicle"),
    ]
    vendor_rating = ForeignKey(VendorRating, on_delete=CASCADE, related_name="criteria")
    criterion     = CharField(max_length=30, choices=CRITERION_CHOICES)
    score         = PositiveSmallIntegerField()          # 1–5
    comment       = TextField(blank=True, max_length=500)

    class Meta:
        unique_together = [("vendor_rating", "criterion")]


class VendorRatingAnswer(models.Model):
    """Y/N answer to a predefined question for a criterion."""
    criterion = ForeignKey(VendorRatingCriterion, on_delete=CASCADE, related_name="answers")
    question  = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer    = BooleanField()  # True = Yes, False = No


class RatingQuestion(TenantScopedModel):
    """Predefined Y/N question, scoped to a criterion."""
    CRITERION_CHOICES = VendorRatingCriterion.CRITERION_CHOICES
    RATING_TYPE_CHOICES = [
        ("VENDOR", "Vendor Rating"),
        ("TENANT", "Tenant Rating"),
    ]
    rating_type   = CharField(max_length=10, choices=RATING_TYPE_CHOICES, default="VENDOR")
    criterion     = CharField(max_length=30, choices=CRITERION_CHOICES, null=True, blank=True)
    question_text = CharField(max_length=255)
    is_active     = BooleanField(default=True)
    order         = PositiveSmallIntegerField(default=0)
```

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
