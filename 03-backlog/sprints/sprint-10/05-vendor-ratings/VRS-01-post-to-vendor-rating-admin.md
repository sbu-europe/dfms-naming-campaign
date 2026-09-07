---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VRS-01
title: Post-TO Vendor Rating — Tenant Admin / TDO (Admin Portal)
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
  - ../../../../05-modules/07-vendor-management/vendor-rating.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
---

# VRS-01 — Post-TO Vendor Rating — Tenant Admin / TDO (Admin Portal)

## User Story

**As a** Tenant Admin or Transport Dispatcher/Officer (TDO)  
**I want to** rate a vendor on completion of a Transport Order across standardised criteria  
**So that** vendor performance is tracked internally and informs future bid/award decisions

## Business Context

When a Transport Order (TO) is marked `COMPLETED`, the system prompts the responsible Tenant Admin or TDO to provide a structured rating for the vendor. Ratings are **internal only** — not visible to vendors in v1.

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

- [ ] When a TO status transitions to `COMPLETED`, the system creates a **pending** `VendorRating` record for that TO (linked to TO and vendor).
- [ ] Tenant Admin / TDO with `vendor.rating.create` permission sees a **"Rate Vendor"** button or prompt on the completed TO detail view.
- [ ] Only **one rating per TO** is allowed — re-opening the prompt shows the existing (submitted or draft) rating.
- [ ] Rating prompt is also accessible from **Vendor Profile → Rating History → Rate** (for past unrated TOs).

### AC-2: Rating Form — Criteria Panels

- [ ] Form shows **3 criterion panels**: Product Delivery · Driver Behaviour · Vehicle.
- [ ] Each panel contains:
  - A **1–5 star selector** (required — form cannot submit without all 3 scores).
  - **Predefined Yes/No question list** for that criterion (min 1; from `RatingQuestion` seed).
  - An optional **comment** field (max 500 chars).
- [ ] A global **overall comment** field (optional, max 1 000 chars) at the bottom of the form.
- [ ] Live preview: running average shown as the user fills in criteria scores.

### AC-3: Predefined Questions — v1 Seed Data

- [ ] **Product Delivery:** "Was the product delivered on time?", "Was the product delivered in full quantity?", "Was the product in good condition on arrival?"
- [ ] **Driver Behaviour:** "Was the driver professional and courteous?", "Did the driver follow safety protocols?", "Did the driver communicate proactively during the trip?"
- [ ] **Vehicle:** "Was the vehicle in roadworthy condition?", "Was the vehicle clean and appropriate for the load type?", "Did the vehicle arrive on time for loading?"
- [ ] Questions stored in `RatingQuestion` model — seeded, admin-configurable in a future sprint.

### AC-4: Average Calculation & Vendor Rating Update

- [ ] `average_rating = round((product_delivery_score + driver_behaviour_score + vehicle_score) / 3, 2)`.
- [ ] `Vendor.rating` updated to reflect **rolling average** across all submitted ratings:  
  `new_avg = ((current_rating × rating_count) + new_average) / (rating_count + 1)`.
- [ ] `Vendor.rating_count` (or computed aggregate) incremented on each submission.

### AC-5: Submission & Immutability

- [ ] On submit, `VendorRating` record persisted with: `to_id`, `vendor_id`, `tenant_id`, `rated_by` (user), `submitted_at`, per-criterion scores + Y/N answers + comments, `average_rating`, `overall_comment`.
- [ ] Submission is **immutable** — rating cannot be edited after submit (consistent with bid immutability pattern).
- [ ] Audit log entry created on submission (`VENDOR_RATING_SUBMITTED` action).

### AC-6: Not Visible to Vendor (v1)

- [ ] Vendor portal and vendor mobile app do **not** expose the vendor's own rating in v1.
- [ ] Rating data is accessible only to Tenant Admin, TDO, and Transport Planner via internal admin views.

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
POST   /api/v1/transport-orders/{id}/vendor-rating/     # submit rating (Tenant Admin / TDO)
GET    /api/v1/transport-orders/{id}/vendor-rating/     # get rating for TO (admin only)
GET    /api/v1/vendors/{id}/ratings/                    # paginated rating history (admin only)
GET    /api/v1/vendors/{id}/rating-summary/             # avg, count, per-criterion avgs (admin only)
GET    /api/v1/rating-questions/?criterion=VEHICLE      # fetch active questions for form population
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit vendor rating (post-TO) | `tenant_admin`, `tdo` |
| View vendor rating history | `tenant_admin`, `tdo`, `transport_planner` |
| View rating in bid/award views | `tenant_admin`, `tdo`, `transport_planner` |
| Configure / add rating questions | `tenant_admin` |
| View own vendor rating (as vendor) | **Denied in v1** |

**Permission codes (proposed):** `vendor.rating.create`, `vendor.rating.view`, `vendor.rating.configure`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-01-1 | Data models + migrations | `VendorRating`, `VendorRatingCriterion`, `VendorRatingAnswer`, `RatingQuestion` | High | Not started |
| VRS-01-2 | Seed rating questions | Default Y/N questions for each of the 3 criteria | High | Not started |
| VRS-01-3 | Rating form (admin portal) | 3-criterion panels, star selector, Y/N questions, comments, live avg preview | High | Not started |
| VRS-01-4 | Average calculation + Vendor.rating update | Rolling average on submit; `rating_count` increment | High | Not started |
| VRS-01-5 | Submit + immutability + audit log | `is_submitted` flag; audit `VENDOR_RATING_SUBMITTED` | High | Not started |
| VRS-01-6 | TO completion rating prompt | "Rate Vendor" CTA on completed TO detail view | Medium | Not started |

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
- [ ] Unit tests: average calculation, idempotency, immutability
- [ ] E2E scenario stub in `09-testing/backend/e2e-scenarios/sprint-10/`

---

*Epic: Vendor Rating System | Phase: 2 | Sprint 10: 8 SP | Last Updated: 2026-09-07*
