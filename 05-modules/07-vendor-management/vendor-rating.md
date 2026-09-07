# Vendor Rating System

**PRD Section:** 6.14.11  
**Phase:** Phase 2  
**Status:** Planned — Sprint 10  
**Related Stories:** [VRS-01](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-01-post-to-vendor-rating-admin.md), [VRS-02](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-02-vendor-rates-tenant-mobile.md), [VRS-03](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-03-vendor-rating-visibility-admin.md)

---

## Overview

The Vendor Rating System introduces a **bidirectional performance feedback loop** between tenants and vendors, triggered at Transport Order completion.

| Direction | Rater | Subject | Trigger |
|-----------|-------|---------|---------|
| **Tenant → Vendor** | Tenant Admin / TDO | Vendor performance across 3 criteria | TO → `COMPLETED` |
| **Vendor → Tenant** | Vendor (mobile) | Tenant experience (overall) | Vendor acknowledges completed trip |

Rating is **internal only in v1** — vendors do not see their own performance rating from tenants. Vendor-to-tenant ratings are visible to vendors only in aggregate (during the Join Tenant discovery flow).

---

## Design Principles

1. **Post-TO trigger** — ratings are always anchored to a specific completed Transport Order, ensuring context and traceability.
2. **Structured criteria** — vendor ratings use three defined criteria (Product Delivery, Driver Behaviour, Vehicle) with predefined Yes/No sub-questions. Criteria are extensible via model design.
3. **Immutability** — submitted ratings cannot be edited, consistent with the bid immutability pattern.
4. **Bidirectional** — vendors rate tenants; results used in vendor join-tenant decision flow.
5. **Configurable** — rating questions are stored in `RatingQuestion` and can be updated by Tenant Admin without code changes (future sprint).
6. **Internal by default** — vendor-facing exposure of performance ratings deferred to Phase 3+ (may gate bid visibility when configurable min-rating threshold is implemented).

---

## Rating Criteria (Tenant → Vendor)

Three criteria are assessed for every completed TO. Each criterion receives:
- **1–5 star score** (required)
- **Predefined Yes/No answers** (from `RatingQuestion` seed)
- **Optional comment** (max 500 chars)

| # | Criterion | Key aspect measured |
|---|-----------|---------------------|
| 1 | **Product Delivery** | On-time, correct quantity, good condition |
| 2 | **Driver Behaviour** | Professionalism, safety compliance, communication |
| 3 | **Vehicle** | Roadworthiness, cleanliness, appropriate for load |

> **Extensibility note:** The `VendorRatingCriterion.criterion` field uses a choices list. Additional criteria (e.g. POD Quality, Claims) can be added after internal discussion without model restructure.

### Average Calculation

```
average_rating = round((product_delivery_score + driver_behaviour_score + vehicle_score) / 3, 2)

Vendor.rating (rolling) = ((current_rating × rating_count) + new_average) / (rating_count + 1)
```

---

## Rating Criteria (Vendor → Tenant)

Simple overall rating in v1:
- **1–5 star score** (required)
- **Optional comment** (max 500 chars)

Per-criterion sub-ratings for tenant (e.g. Payment Timeliness, Professionalism, Load Readiness) are **deferred** pending internal criteria discussion.

---

## Predefined Questions (v1 Seed)

| Criterion | Questions |
|-----------|-----------|
| **Product Delivery** | Was the product delivered on time? · Was the product delivered in full quantity? · Was the product in good condition on arrival? |
| **Driver Behaviour** | Was the driver professional and courteous? · Did the driver follow safety protocols? · Did the driver communicate proactively during the trip? |
| **Vehicle** | Was the vehicle in roadworthy condition? · Was the vehicle clean and appropriate for the load type? · Did the vehicle arrive on time for loading? |

Questions are stored in `RatingQuestion` with `is_active=True`. Tenant Admin can deactivate or reorder in a future sprint.

---

## Data Models

```python
# apps/vendor_management/models.py  (or apps/ratings/)

class VendorRating(TenantScopedModel):
    """One rating per completed TO — tenant rates vendor."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="ratings")
    rated_by        = ForeignKey("TenantUser", on_delete=SET_NULL, null=True)
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor", "tenant")]


class VendorRatingCriterion(models.Model):
    """Score + Y/N answers for one criterion within a VendorRating."""
    CRITERION_CHOICES = [
        ("PRODUCT_DELIVERY", "Product Delivery"),
        ("DRIVER_BEHAVIOUR", "Driver Behaviour"),
        ("VEHICLE",          "Vehicle"),
    ]
    vendor_rating = ForeignKey(VendorRating, on_delete=CASCADE, related_name="criteria")
    criterion     = CharField(max_length=30, choices=CRITERION_CHOICES)
    score         = PositiveSmallIntegerField()      # 1–5
    comment       = TextField(blank=True, max_length=500)

    class Meta:
        unique_together = [("vendor_rating", "criterion")]


class VendorRatingAnswer(models.Model):
    """Y/N answer to a predefined question within a criterion."""
    criterion = ForeignKey(VendorRatingCriterion, on_delete=CASCADE, related_name="answers")
    question  = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer    = BooleanField()          # True = Yes, False = No


class RatingQuestion(TenantScopedModel):
    """Predefined Yes/No question, criterion-scoped."""
    RATING_TYPE_CHOICES = [
        ("VENDOR", "Vendor Rating"),
        ("TENANT", "Tenant Rating"),
    ]
    CRITERION_CHOICES = VendorRatingCriterion.CRITERION_CHOICES

    rating_type   = CharField(max_length=10, choices=RATING_TYPE_CHOICES, default="VENDOR")
    criterion     = CharField(max_length=30, choices=CRITERION_CHOICES, null=True, blank=True)
    question_text = CharField(max_length=255)
    is_active     = BooleanField(default=True)
    order         = PositiveSmallIntegerField(default=0)


class TenantRating(TenantScopedModel):
    """One rating per completed TO — vendor rates tenant."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    stars           = PositiveSmallIntegerField()    # 1–5
    comment         = TextField(blank=True, max_length=500)
    submitted_at    = DateTimeField(auto_now_add=True)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]
```

### Vendor model additions

```python
# Existing field — updated by rating service:
rating = DecimalField(max_digits=3, decimal_places=2, default=0)

# New field:
rating_count = PositiveIntegerField(default=0)
```

---

## API Reference

### Vendor Rating (Tenant → Vendor)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Submit rating for TO |
| `GET` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Get rating for TO |
| `GET` | `/api/v1/vendors/{id}/ratings/` | Tenant Admin, TDO, TP | Paginated rating history |
| `GET` | `/api/v1/vendors/{id}/rating-summary/` | Tenant Admin, TDO, TP | Avg, count, per-criterion avgs |
| `GET` | `/api/v1/rating-questions/?criterion=VEHICLE` | Tenant Admin, TDO | Active questions for form |

### Tenant Rating (Vendor → Tenant)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | Vendor submits tenant rating |
| `GET` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | View own rating for TO |
| `GET` | `/api/v1/tenants/{id}/rating-summary/` | Vendor (any) | Aggregate summary for join flow |
| `GET` | `/api/v1/tenants/{id}/tenant-ratings/` | Tenant Admin | All vendor ratings for tenant |

---

## Permissions

| Permission Code | Granted To | Action |
|----------------|-----------|--------|
| `vendor.rating.create` | `tenant_admin`, `tdo` | Submit vendor rating |
| `vendor.rating.view` | `tenant_admin`, `tdo`, `transport_planner` | View vendor ratings |
| `vendor.rating.configure` | `tenant_admin` | Manage rating questions |
| `tenant.rating.create` | `vendor` | Submit tenant rating |
| `tenant.rating.view_summary` | `vendor` | View tenant rating summary (join flow) |
| `tenant.rating.admin_view` | `tenant_admin` | View all vendor ratings for tenant |

---

## Visibility Rules (v1)

| Actor | Sees | Does not see |
|-------|------|-------------|
| Tenant Admin / TDO | Full vendor rating history + criteria | Vendor portal view of ratings |
| Transport Planner | Vendor rating in bid/comparison views | Criterion-level breakdown |
| Vendor (own portal/mobile) | Their own submitted tenant ratings | **Their own vendor performance rating** |
| Vendor (join flow) | Tenant aggregate star rating | Individual rating entries |

---

## UI Surfaces

| Surface | What is shown | Story |
|---------|---------------|-------|
| Completed TO detail (admin) | "Rate Vendor" CTA or "Vendor Rated ★★★★" | VRS-01, VRS-03 |
| Vendor profile page (admin) | Rating section: summary + per-criterion + history | VRS-03 |
| Bid list table | Rating column (star + numeric), sortable | VRS-03 |
| Bid comparison view | Rating panel per vendor; "Highest Rating" highlight | VRS-03 |
| Vendor admin list | Rating column + min-rating filter | VRS-03 |
| Vendor mobile — post-TO | "Rate this Tenant" prompt | VRS-02 |
| Vendor mobile — Join Tenant | Tenant aggregate rating shown on tenant card | VRS-02 |

---

## Audit Events

| Event | Trigger | Actor |
|-------|---------|-------|
| `VENDOR_RATING_SUBMITTED` | VendorRating submitted | Tenant Admin / TDO |
| `TENANT_RATING_SUBMITTED` | TenantRating submitted | Vendor |

---

## Phase Roadmap

| Phase | Scope |
|-------|-------|
| **v1 (Sprint 10)** | Manual rating by admin post-TO; 3 criteria + Y/N questions; vendor rates tenant; admin visibility; bid views wired up |
| **Phase 3** | Auto-calculation from trip performance metrics (on-time %, POD quality, claims ratio) |
| **Phase 3** | Configurable rating framework — Tenant Admin defines criteria + weights |
| **Phase 3** | Min-rating bid gate — bid visibility filtered by `min_vendor_rating` threshold on TO |
| **Phase 3** | Rating history audit export; rating appeal workflow |
| **Future** | Per-criterion vendor → tenant ratings |

---

## Related Specifications

- [`vendor-bidding.md`](vendor-bidding.md) — `min_vendor_rating` on TO bid config; `vendor_rating_at_award` on BidAward
- [`vendor-portal.md`](vendor-portal.md) — Performance Rating widget (future live data)
- [`vendor-onboarding.md`](vendor-onboarding.md) — `Vendor.rating` field (decimal, default 0)
- Sprint stories: [VRS-01](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-01-post-to-vendor-rating-admin.md), [VRS-02](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-02-vendor-rates-tenant-mobile.md), [VRS-03](../../03-backlog/sprints/sprint-10/05-vendor-ratings/VRS-03-vendor-rating-visibility-admin.md)

---

*Module: Vendor Management | PRD: 6.14.11 | Phase: 2 | Last Updated: 2026-09-07*
