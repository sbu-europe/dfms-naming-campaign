# Vendor Rating System

**PRD Section:** 6.14.11  
**Phase:** Phase 2  
**Status:** Planned — Phase 2 (unscheduled; stories-phase-2/008)  
**Related Stories:** [VRS-01](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md), [VRS-02](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md), [VRS-03](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

## Overview

The Vendor Rating System introduces a **fully symmetric, bidirectional performance feedback loop** between tenants and vendors. Both directions share the same structural pattern: **3 criteria × (1–5 stars + predefined Yes/No questions + optional comment) → computed average → rolling entity rating update.**

| Direction | Who rates | What is rated | Criteria | Trigger |
|-----------|-----------|---------------|----------|---------|
| **Tenant → Vendor** (VRS-01) | Tenant Admin / TDO (admin portal) | Vendor performance | Product Delivery · Driver Behaviour · Vehicle | TO → `COMPLETED` |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile app) | Tenant experience | Payment & Commercial · Load Readiness · Communication & Support | Vendor acknowledges completed trip |

**Visibility rules (v1):**
- Tenant-to-vendor ratings are **internal only** — not shown to vendors in v1.
- Vendor-to-tenant ratings are **visible to the vendor** (own submissions) and **visible to Tenant Admin** (all incoming). Aggregated summary visible to all vendors during the Join Tenant discovery flow.

---

## Design Principles

1. **Post-TO trigger** — ratings are always anchored to a specific completed Transport Order for traceability.
2. **Symmetric structure** — both directions use identical building blocks: 3 criteria, per-criterion Y/N questions, per-criterion comment, computed average.
3. **Immutability** — submitted ratings cannot be edited (consistent with bid immutability pattern).
4. **Shared question store** — a single `RatingQuestion` model covers both directions via `rating_type` (`VENDOR` / `TENANT`), keeping question management unified.
5. **Rolling average** — entity ratings (`Vendor.rating`, `Tenant.vendor_rating`) are maintained as rolling averages, updated atomically on each submission.
6. **Configurable** — questions are seeded but Tenant Admin can manage them without code changes (future sprint).
7. **Internal by default** — vendor's own performance rating deferred for vendor-facing exposure to Phase 3+.

---

## Direction 1 — Tenant Rates Vendor

### Criteria

| # | Criterion key | Display name | What it measures |
|---|--------------|--------------|-----------------|
| 1 | `PRODUCT_DELIVERY` | Product Delivery | On-time, correct quantity, good arrival condition |
| 2 | `DRIVER_BEHAVIOUR` | Driver Behaviour | Professionalism, safety compliance, communication |
| 3 | `VEHICLE` | Vehicle | Roadworthiness, cleanliness, suitability for load |

### Average Calculation (Vendor rating)

```
criterion_avg = round((product_delivery_score + driver_behaviour_score + vehicle_score) / 3, 2)

Vendor.rating (rolling avg) =
    ((Vendor.rating × Vendor.rating_count) + criterion_avg) / (Vendor.rating_count + 1)

Vendor.rating_count += 1
```

### Predefined Yes/No Questions — Vendor Direction (v1 Seed)

| Criterion | Question text |
|-----------|--------------|
| **Product Delivery** | "Was the product delivered on time?" |
| **Product Delivery** | "Was the product delivered in full quantity?" |
| **Product Delivery** | "Was the product in good condition on arrival?" |
| **Driver Behaviour** | "Was the driver professional and courteous?" |
| **Driver Behaviour** | "Did the driver follow safety protocols?" |
| **Driver Behaviour** | "Did the driver communicate proactively during the trip?" |
| **Vehicle** | "Was the vehicle in roadworthy condition?" |
| **Vehicle** | "Was the vehicle clean and appropriate for the load type?" |
| **Vehicle** | "Did the vehicle arrive on time for loading?" |

---

## Direction 2 — Vendor Rates Tenant

### Criteria

| # | Criterion key | Display name | What it measures |
|---|--------------|--------------|-----------------|
| 1 | `PAYMENT_COMMERCIAL` | Payment & Commercial | Payment timeliness, rate accuracy, commercial fairness |
| 2 | `LOAD_READINESS` | Load Readiness | Load prepared on time, documentation correct, product packaged |
| 3 | `COMMUNICATION_SUPPORT` | Communication & Support | Responsiveness, instruction clarity, issue resolution |

### Average Calculation (Tenant rating)

```
criterion_avg = round((payment_commercial_score + load_readiness_score + communication_support_score) / 3, 2)

Tenant.vendor_rating (rolling avg) =
    ((Tenant.vendor_rating × Tenant.vendor_rating_count) + criterion_avg) / (Tenant.vendor_rating_count + 1)

Tenant.vendor_rating_count += 1
```

### Predefined Yes/No Questions — Tenant Direction (v1 Seed)

| Criterion | Question text |
|-----------|--------------|
| **Payment & Commercial** | "Was payment released within the agreed timeline?" |
| **Payment & Commercial** | "Were the agreed rates and commercial terms honoured?" |
| **Payment & Commercial** | "Were payment-related documents (invoice, receipt) processed without issues?" |
| **Load Readiness** | "Was the load ready for pickup at the scheduled time?" |
| **Load Readiness** | "Were all required shipping documents provided correctly?" |
| **Load Readiness** | "Was the product properly packaged and prepared for transport?" |
| **Communication & Support** | "Was the tenant's coordination team reachable and responsive?" |
| **Communication & Support** | "Were trip instructions and route details clearly communicated?" |
| **Communication & Support** | "Were any issues or delays resolved promptly by the tenant's team?" |

---

## Symmetric Comparison

| Aspect | Tenant → Vendor | Vendor → Tenant |
|--------|----------------|----------------|
| **Rater** | Tenant Admin / TDO | Vendor user (mobile) |
| **Platform** | Admin portal | Vendor mobile app |
| **Criteria count** | 3 | 3 |
| **Stars per criterion** | 1–5 (required) | 1–5 (required) |
| **Y/N questions** | 3 per criterion (9 total) | 3 per criterion (9 total) |
| **Per-criterion comment** | Optional, 500 chars | Optional, 500 chars |
| **Overall comment** | Optional, 1 000 chars | Optional, 1 000 chars |
| **Computed average** | Mean of 3 criteria | Mean of 3 criteria |
| **Entity field updated** | `Vendor.rating` + `rating_count` | `Tenant.vendor_rating` + `vendor_rating_count` |
| **Immutable after submit** | ✅ Yes | ✅ Yes |
| **One per TO** | ✅ Yes | ✅ Yes |
| **Visible to rated entity** | ❌ No (v1) | ✅ Aggregate only (join flow) |
| **Audit event** | `VENDOR_RATING_SUBMITTED` | `TENANT_RATING_SUBMITTED` |

---

## Data Models

```python
# ── Vendor Rating (Tenant → Vendor) ──────────────────────────────────────────

class VendorRating(TenantScopedModel):
    """One rating record per completed TO — tenant rates vendor."""
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
    """Y/N answer to a predefined question within a VendorRatingCriterion."""
    criterion = ForeignKey(VendorRatingCriterion, on_delete=CASCADE, related_name="answers")
    question  = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer    = BooleanField()      # True = Yes, False = No


# ── Tenant Rating (Vendor → Tenant) ──────────────────────────────────────────

class TenantRating(TenantScopedModel):
    """One rating record per completed TO — vendor rates tenant."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    rated_by        = ForeignKey("VendorUser", on_delete=SET_NULL, null=True)
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)  # 1.00–5.00
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

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
    """Y/N answer to a predefined question within a TenantRatingCriterion."""
    criterion = ForeignKey(TenantRatingCriterion, on_delete=CASCADE, related_name="answers")
    question  = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer    = BooleanField()      # True = Yes, False = No


# ── Shared Question Store ─────────────────────────────────────────────────────

class RatingQuestion(TenantScopedModel):
    """Predefined Yes/No question — covers both directions via rating_type."""
    RATING_TYPE_CHOICES = [
        ("VENDOR", "Vendor Rating"),   # used in VendorRatingCriterion
        ("TENANT", "Tenant Rating"),   # used in TenantRatingCriterion
    ]
    # Criterion choices depend on rating_type — validated at service layer
    rating_type   = CharField(max_length=10, choices=RATING_TYPE_CHOICES)
    criterion     = CharField(max_length=30)    # matches choices of relevant Criterion model
    question_text = CharField(max_length=255)
    is_active     = BooleanField(default=True)
    order         = PositiveSmallIntegerField(default=0)
```

### Entity model additions

```python
# Vendor model — updated by VendorRatingService:
rating         = DecimalField(max_digits=3, decimal_places=2, default=0)   # existing field
rating_count   = PositiveIntegerField(default=0)                           # NEW

# Tenant model — updated by TenantRatingService:
vendor_rating       = DecimalField(max_digits=3, decimal_places=2, default=0)  # NEW
vendor_rating_count = PositiveIntegerField(default=0)                          # NEW
```

---

## Rolling Average Service Logic

Both directions share the same algorithm, implemented in their respective service classes:

```python
class VendorRatingService:
    @staticmethod
    def compute_and_save(vendor_rating: VendorRating) -> None:
        scores = [c.score for c in vendor_rating.criteria.all()]
        avg = round(sum(scores) / len(scores), 2)
        vendor_rating.average_rating = avg
        vendor_rating.is_submitted = True
        vendor_rating.submitted_at = now()
        vendor_rating.save()

        vendor = vendor_rating.vendor
        new_rolling = round(
            ((vendor.rating * vendor.rating_count) + avg) / (vendor.rating_count + 1), 2
        )
        vendor.rating = new_rolling
        vendor.rating_count += 1
        vendor.save(update_fields=["rating", "rating_count"])


class TenantRatingService:
    @staticmethod
    def compute_and_save(tenant_rating: TenantRating) -> None:
        scores = [c.score for c in tenant_rating.criteria.all()]
        avg = round(sum(scores) / len(scores), 2)
        tenant_rating.average_rating = avg
        tenant_rating.is_submitted = True
        tenant_rating.submitted_at = now()
        tenant_rating.save()

        tenant = tenant_rating.tenant
        new_rolling = round(
            ((tenant.vendor_rating * tenant.vendor_rating_count) + avg)
            / (tenant.vendor_rating_count + 1), 2
        )
        tenant.vendor_rating = new_rolling
        tenant.vendor_rating_count += 1
        tenant.save(update_fields=["vendor_rating", "vendor_rating_count"])
```

---

## API Reference

### Vendor Rating (Tenant → Vendor)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Submit rating for completed TO |
| `GET` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Get submitted rating for TO |
| `GET` | `/api/v1/vendors/{id}/ratings/` | Tenant Admin, TDO, TP | Paginated rating history |
| `GET` | `/api/v1/vendors/{id}/rating-summary/` | Tenant Admin, TDO, TP | Overall avg, count, per-criterion avgs |
| `GET` | `/api/v1/rating-questions/?rating_type=VENDOR&criterion=VEHICLE` | Tenant Admin, TDO | Active questions for form population |

### Tenant Rating (Vendor → Tenant)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | Submit tenant rating (mobile) |
| `GET` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | View own submitted rating for TO |
| `GET` | `/api/v1/tenants/{id}/vendor-rating-summary/` | Vendor (any) | Aggregate avg, count, per-criterion avgs — join flow |
| `GET` | `/api/v1/tenants/{id}/vendor-ratings/` | Tenant Admin | All vendor-submitted ratings for tenant |
| `GET` | `/api/v1/rating-questions/?rating_type=TENANT&criterion=LOAD_READINESS` | Vendor (authed) | Active questions for mobile form |

---

## Permissions

| Permission Code | Granted To | Action |
|----------------|-----------|--------|
| `vendor.rating.create` | `tenant_admin`, `tdo` | Submit vendor rating |
| `vendor.rating.view` | `tenant_admin`, `tdo`, `transport_planner` | View vendor ratings & summary |
| `vendor.rating.configure` | `tenant_admin` | Manage rating questions |
| `tenant.rating.create` | `vendor` | Submit tenant rating |
| `tenant.rating.view_own` | `vendor` | View own submitted tenant rating |
| `tenant.rating.view_summary` | `vendor` | View tenant aggregate summary (join flow) |
| `tenant.rating.admin_view` | `tenant_admin` | View all incoming vendor ratings |

---

## Visibility Rules (v1)

| Actor | Sees | Does not see |
|-------|------|-------------|
| Tenant Admin / TDO | Full vendor rating: per-criterion scores, Y/N answers, history | — |
| Transport Planner | Vendor rating in bid/comparison views | Y/N answer detail |
| Vendor (own mobile) | Own submitted tenant ratings (all detail) | **Own vendor performance rating from tenants** |
| Vendor (join flow) | Tenant aggregate ★ avg + count + per-criterion avgs | Individual rating entries by other vendors |

---

## Seed Data Summary

| Direction | Criteria | Questions per criterion | Total questions |
|-----------|----------|------------------------|----------------|
| Tenant → Vendor | Product Delivery · Driver Behaviour · Vehicle | 3 each | **9** |
| Vendor → Tenant | Payment & Commercial · Load Readiness · Communication & Support | 3 each | **9** |
| **Total** | **6 criteria** | | **18 seed questions** |

---

## UI Surfaces

| Surface | Direction | What is shown | Story |
|---------|-----------|---------------|-------|
| Completed TO detail (admin) | Tenant → Vendor | "Rate Vendor" CTA or "Vendor Rated ★★★★ 4.3" | VRS-01, VRS-03 |
| Vendor profile page (admin) | Tenant → Vendor | Summary + per-criterion avgs + paginated history | VRS-03 |
| Bid list / comparison (admin) | Tenant → Vendor | Rating column, sortable; bid comparison panel | VRS-03 |
| Vendor admin list | Tenant → Vendor | Rating column + min-rating filter | VRS-03 |
| Vendor mobile — post-TO | Vendor → Tenant | 3-criterion rating form + Y/N questions + live avg | VRS-02 |
| Vendor mobile — completed trip detail | Vendor → Tenant | Read-only view of own submitted rating | VRS-02 |
| Vendor mobile — Join Tenant | Vendor → Tenant | Tenant aggregate ★ + count + per-criterion avgs | VRS-02 |
| Admin portal — tenant incoming ratings | Vendor → Tenant | List of vendor-submitted ratings + summary card | VRS-02 |

---

## Audit Events

| Event | Trigger | Actor |
|-------|---------|-------|
| `VENDOR_RATING_SUBMITTED` | `VendorRating` submitted (any criterion) | Tenant Admin / TDO |
| `TENANT_RATING_SUBMITTED` | `TenantRating` submitted (any criterion) | Vendor |

---

## Phase Roadmap

| Phase | Scope |
|-------|-------|
| **v1 (Sprint 10)** | Full symmetric bidirectional rating: 3 criteria each, Y/N questions, rolling averages, admin visibility, bid views wired, vendor join-flow summary |
| **Phase 3** | Auto-calculated vendor rating from trip metrics (on-time %, POD quality, claims ratio) |
| **Phase 3** | Configurable framework — Tenant Admin defines criteria, weights, and questions |
| **Phase 3** | Min-rating bid gate — `min_vendor_rating` threshold enforcement on bid visibility |
| **Phase 3** | Rating audit export, appeal workflow |
| **Future** | Vendor-facing exposure of own performance rating |
| **Future** | Tenant-admin-defined criteria for vendor → tenant direction |

---

## Related Specifications

- [`vendor-bidding.md`](vendor-bidding.md) — `min_vendor_rating` on TO bid config; `vendor_rating_at_award` on BidAward
- [`vendor-portal.md`](vendor-portal.md) — Performance Rating widget (future live data)
- [`vendor-onboarding.md`](vendor-onboarding.md) — `Vendor.rating` field (decimal, default 0)
- Phase 2 stories: [VRS-01](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md) · [VRS-02](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md) · [VRS-03](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

*Module: Vendor Management | PRD: 6.14.11 | Phase: 2 | Last Updated: 2026-09-08*
