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
---

# VRS-02 — Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App)

## User Story

**As a** Vendor (via the Vendor Mobile App)  
**I want to** rate the tenant across structured criteria with Yes/No questions after completing a Transport Order  
**So that** my experience working with this tenant is properly documented and helps other vendors make informed decisions when requesting to join that tenant

## Business Context

The rating system is fully **symmetric**. Both directions use the same structural pattern: criteria-based rating (1–5 stars per criterion), predefined Yes/No questions per criterion, optional comments, and a computed average.

| Direction | Who rates | What is rated | Criteria | Trigger |
|-----------|-----------|---------------|----------|---------|
| **Tenant → Vendor** (VRS-01) | Tenant Admin / TDO | Vendor performance | Product Delivery · Driver Behaviour · Vehicle | TO → `COMPLETED` (admin portal) |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile) | Tenant experience | Payment & Commercial · Load Readiness · Communication & Support | Vendor ACKs completed trip (mobile) |

**Tenant ratings serve two purposes:**
1. **Internal self-assessment** — Tenant Admin sees their own aggregate rating from all vendors.
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

- [ ] After the vendor acknowledges trip completion on the completed trip confirmation screen, a **"Rate this Tenant"** screen / bottom sheet is presented as the next step.
- [ ] Prompt is **skippable** (dismiss button visible) — vendor is never forced to rate.
- [ ] If skipped, a **"Rate Tenant"** action is accessible from completed trip detail at any time (while rating is still pending submission).
- [ ] One rating per TO per vendor — idempotent (re-opening shows existing draft or read-only submitted rating).

### AC-2: Rating Form — 3 Criterion Panels

- [ ] Form shows **3 criterion panels**: Payment & Commercial · Load Readiness · Communication & Support.
- [ ] Each panel contains:
  - Panel header with criterion name and brief description.
  - **1–5 star selector** (required — all 3 must be filled to submit).
  - **Predefined Yes/No question list** for that criterion (tappable toggle: Yes / No per question).
  - An optional **comment** field (max 500 chars).
- [ ] A global **overall comment** field (optional, max 1 000 chars) at the bottom.
- [ ] **Live running average** displayed as vendor fills in criteria scores (e.g. "Current average: ⭐ 3.7").
- [ ] Submit button remains disabled until all 3 criterion star scores are selected.

### AC-3: Predefined Questions Loaded from API

- [ ] Form populates Y/N questions by fetching `GET /api/v1/rating-questions/?rating_type=TENANT&criterion=<X>` per criterion.
- [ ] If no questions returned for a criterion, the panel still renders (questions section collapses gracefully).

### AC-4: Submission & Immutability

- [ ] On submit, `TenantRating` + 3 `TenantRatingCriterion` records + per-criterion `TenantRatingAnswer` records are persisted atomically.
- [ ] `average_rating` computed and stored on `TenantRating`.
- [ ] `Tenant.vendor_rating` rolling average updated; `Tenant.vendor_rating_count` incremented.
- [ ] Submission is **immutable** — no editing after submit.
- [ ] Duplicate protection: second submission for same TO is rejected (`400 Bad Request`).
- [ ] Success screen: "Thank you for your rating!" with average displayed.

### AC-5: Tenant Rating Visibility — Join Tenant Flow

- [ ] When a vendor browses tenants to request membership (Join Tenant screen), each **tenant card** shows:
  - Aggregate vendor-submitted rating: e.g. ⭐⭐⭐⭐ 4.2 / 5.0
  - Rating count: "Based on 8 vendor ratings"
  - Per-criterion averages (expandable or shown in detail view): Payment & Commercial · Load Readiness · Communication & Support
- [ ] If no ratings yet: "No ratings yet" displayed (not hidden).

### AC-6: Vendor Views Own Submitted Rating

- [ ] After submission, vendor can view their own submitted rating on the completed trip detail (read-only).
- [ ] Shows: per-criterion scores, Y/N answers, comments, submitted date, average.

### AC-7: Tenant Admin — View Incoming Ratings

- [ ] Tenant Admin can view a **list of all vendor-submitted ratings** for their tenant in the admin portal.
- [ ] Displays: vendor name, TO reference, per-criterion scores, average, comments, submitted date.
- [ ] Summary card at top: overall aggregate average, total count, per-criterion averages.

### AC-8: No Automated Decision Impact (v1)

- [ ] Tenant rating does **not** gate any approval, bid, or access decision in v1.
- [ ] Used for **informational/display purposes only** in v1.

---

## Data Models

```python
class TenantRating(TenantScopedModel):
    """One rating per completed TO — vendor rates tenant."""
    transport_order   = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor            = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    rated_by          = ForeignKey("VendorUser", on_delete=SET_NULL, null=True)
    submitted_at      = DateTimeField(null=True, blank=True)
    average_rating    = DecimalField(max_digits=3, decimal_places=2, null=True)   # 1.00–5.00
    overall_comment   = TextField(blank=True, max_length=1000)
    is_submitted      = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]


class TenantRatingCriterion(models.Model):
    """Score + Y/N answers for one criterion within a TenantRating."""
    CRITERION_CHOICES = [
        ("PAYMENT_COMMERCIAL",    "Payment & Commercial"),
        ("LOAD_READINESS",        "Load Readiness"),
        ("COMMUNICATION_SUPPORT", "Communication & Support"),
    ]
    tenant_rating = ForeignKey(TenantRating, on_delete=CASCADE, related_name="criteria")
    criterion     = CharField(max_length=30, choices=CRITERION_CHOICES)
    score         = PositiveSmallIntegerField()      # 1–5
    comment       = TextField(blank=True, max_length=500)

    class Meta:
        unique_together = [("tenant_rating", "criterion")]


class TenantRatingAnswer(models.Model):
    """Y/N answer to a predefined question for a tenant-rating criterion."""
    criterion = ForeignKey(TenantRatingCriterion, on_delete=CASCADE, related_name="answers")
    question  = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer    = BooleanField()      # True = Yes, False = No
```

### Tenant model additions

```python
# New fields on Tenant — updated by TenantRatingService on each submission:
vendor_rating       = DecimalField(max_digits=3, decimal_places=2, default=0)
vendor_rating_count = PositiveIntegerField(default=0)
```

### RatingQuestion — shared model (already defined in VRS-01)

```python
# The existing RatingQuestion model supports TENANT-direction questions
# via rating_type = "TENANT" and criterion from TenantRatingCriterion.CRITERION_CHOICES
```

---

## API Endpoints

```
# Vendor submits / views their rating for a completed TO
POST   /api/v1/transport-orders/{id}/tenant-rating/       # vendor submits tenant rating
GET    /api/v1/transport-orders/{id}/tenant-rating/       # vendor views own submitted rating

# Join Tenant discovery flow
GET    /api/v1/tenants/{id}/vendor-rating-summary/        # aggregate avg, count, per-criterion avgs (any authed vendor)

# Admin views
GET    /api/v1/tenants/{id}/vendor-ratings/               # paginated list of all vendor ratings (tenant_admin)
GET    /api/v1/rating-questions/?rating_type=TENANT&criterion=LOAD_READINESS  # fetch questions for form
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit tenant rating | `vendor` (must be assigned on the TO) |
| View own submitted rating | `vendor` (own submission only) |
| View tenant aggregate rating summary | `vendor` (any — during join flow) |
| View all vendor-submitted ratings for tenant | `tenant_admin` |
| View per-criterion rating breakdown in admin | `tenant_admin` |

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
- [ ] Tenant Admin can view incoming vendor ratings in admin portal
- [ ] Unit tests: average calculation, rolling update, idempotency, star range (1–5)
- [ ] E2E scenario stub in `09-testing/backend/e2e-scenarios/` (when scheduled)

---

*Epic: Vendor Rating System | Phase: 2 (unscheduled) | 8 SP | Last Updated: 2026-09-08*
