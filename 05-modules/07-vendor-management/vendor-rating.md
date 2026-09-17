# Vendor Rating System

**PRD Section:** 6.14.11  
**Phase:** Phase 2  
**Status:** Planned — Phase 2 (unscheduled; stories-phase-2/008)  
**Related Stories:** [VRS-01](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md), [VRS-02](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md), [VRS-03](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

## Overview

The Vendor Rating System introduces a **fully symmetric, bidirectional performance feedback loop** between tenants and vendors. Both directions share the same structural pattern:

**1 overall score (1–5 stars) + 3 randomly selected Yes/No questions (radio) + optional overall comment → rolling entity rating.**

| Direction | Who rates | What is rated | Trigger |
|-----------|-----------|---------------|---------|
| **Tenant → Vendor** (VRS-01) | Tenant Admin / TDO (admin portal) | Vendor performance | TO → `COMPLETED` / `closed` |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile app) | Tenant experience | Vendor acknowledges completed trip |

There is **no multi-criterion star breakdown** in v1. One star rating only; qualitative detail comes from the three random Yes/No questions.

**Visibility rules (v1):**
- Tenant-to-vendor ratings are **internal only** — not shown to vendors in v1.
- Vendor-to-tenant ratings are **visible to the vendor** (own submissions) and **visible to Tenant Admin** (all incoming). Aggregated summary visible to all vendors during the Join Tenant discovery flow.

---

## Design Principles

1. **Post-TO trigger** — ratings are always anchored to a specific completed Transport Order for traceability.
2. **Symmetric structure** — both directions use identical building blocks: single 1–5 score, 3 random Y/N questions, optional overall comment, rolling entity average.
3. **Single score** — one required star rating from 1 to 5 (not separate ratings per topic).
4. **Random questions** — on each form open (while still pending), the API returns **exactly 3** active questions randomly sampled from the direction’s question pool; the selected set is persisted with answers on submit.
5. **Yes/No via radio** — each question is answered with a mutually exclusive **Yes / No** radio control (admin portal and vendor mobile).
6. **Immutability** — submitted ratings cannot be edited (consistent with bid immutability pattern).
7. **Shared question store** — a single `RatingQuestion` model covers both directions via `rating_type` (`VENDOR` / `TENANT`).
8. **Rolling average** — entity ratings (`Vendor.rating`, `Tenant.vendor_rating`) are maintained as rolling averages of the single submitted scores.
9. **Theme continuity** — portal UI reuses existing Django admin-portal layout, components, and CSS tokens; mobile UI reuses existing Vendor App theme, typography, spacing, and control patterns (no new visual language).
10. **Internal by default** — vendor’s own performance rating deferred for vendor-facing exposure to Phase 3+.

---

## Rating Form Shape (both directions)

| Element | Rule |
|---------|------|
| **Overall score** | Required **1–5 star** selector (single control) |
| **Questions** | Exactly **3** randomly selected Yes/No questions from the active pool for that `rating_type` |
| **Answer UI** | **Radio buttons**: Yes · No (one selection per question; required on submit) |
| **Overall comment** | Optional, max 1 000 chars |
| **Per-criterion scores / panels** | **Not used in v1** |

### Average / rolling update

```
submitted_score = star_score   # integer 1–5

# Stored on the rating row (also as average_rating for API consistency)
average_rating = Decimal(submitted_score)   # e.g. 4.00

# Rolling entity average
new_entity_avg = round(
    ((current_rating × rating_count) + submitted_score) / (rating_count + 1),
    2
)
rating_count += 1
```

Draft / pending / skipped ratings **must not** update entity aggregates.

---

## Direction 1 — Tenant Rates Vendor

### Question pool (v1 seed, `rating_type=VENDOR`)

Questions are **not** grouped into separate star criteria. The pool below is sampled randomly (3 of N active) when the form loads.

| # | Question text |
|---|--------------|
| 1 | "Was the product delivered on time?" |
| 2 | "Was the product delivered in full quantity?" |
| 3 | "Was the product in good condition on arrival?" |
| 4 | "Was the driver professional and courteous?" |
| 5 | "Did the driver follow safety protocols?" |
| 6 | "Did the driver communicate proactively during the trip?" |
| 7 | "Was the vehicle in roadworthy condition?" |
| 8 | "Was the vehicle clean and appropriate for the load type?" |
| 9 | "Did the vehicle arrive on time for loading?" |

### Rolling update target

`Vendor.rating` + `Vendor.rating_count` (mirror to public `VendorRegistry` where applicable).

---

## Direction 2 — Vendor Rates Tenant

### Question pool (v1 seed, `rating_type=TENANT`)

| # | Question text |
|---|--------------|
| 1 | "Was payment released within the agreed timeline?" |
| 2 | "Were the agreed rates and commercial terms honoured?" |
| 3 | "Were payment-related documents (invoice, receipt) processed without issues?" |
| 4 | "Was the load ready for pickup at the scheduled time?" |
| 5 | "Were all required shipping documents provided correctly?" |
| 6 | "Was the product properly packaged and prepared for transport?" |
| 7 | "Was the tenant's coordination team reachable and responsive?" |
| 8 | "Were trip instructions and route details clearly communicated?" |
| 9 | "Were any issues or delays resolved promptly by the tenant's team?" |

### Rolling update target

`Tenant.vendor_rating` + `Tenant.vendor_rating_count`.

---

## Symmetric Comparison

| Aspect | Tenant → Vendor | Vendor → Tenant |
|--------|----------------|----------------|
| **Rater** | Tenant Admin / TDO | Vendor user (mobile) |
| **Platform** | Admin portal (web) | Vendor mobile app |
| **Star scores** | **One** overall 1–5 (required) | **One** overall 1–5 (required) |
| **Questions shown** | **3 random** from VENDOR pool | **3 random** from TENANT pool |
| **Answer control** | Yes/No **radio** | Yes/No **radio** |
| **Overall comment** | Optional, 1 000 chars | Optional, 1 000 chars |
| **Entity field updated** | `Vendor.rating` + `rating_count` | `Tenant.vendor_rating` + `vendor_rating_count` |
| **Immutable after submit** | ✅ Yes | ✅ Yes |
| **One per TO** | ✅ Yes | ✅ Yes |
| **Visible to rated entity** | ❌ No (v1) | ✅ Aggregate only (join flow) |
| **Audit event** | `VENDOR_RATING_SUBMITTED` | `TENANT_RATING_SUBMITTED` |
| **UI theme** | Existing portal theme / components | Existing vendor-app theme / components |

---

## Data Models

```python
# ── Vendor Rating (Tenant → Vendor) ──────────────────────────────────────────

class VendorRating(TenantScopedModel):
    """One rating record per completed TO — tenant rates vendor."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="ratings")
    rated_by        = ForeignKey("TenantUser", on_delete=SET_NULL, null=True)
    score           = PositiveSmallIntegerField(null=True, blank=True)  # 1–5 overall
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)  # mirrors score as x.00
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor", "tenant")]


class VendorRatingAnswer(models.Model):
    """Y/N answer to one of the three random questions on a VendorRating."""
    vendor_rating = ForeignKey(VendorRating, on_delete=CASCADE, related_name="answers")
    question      = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer        = BooleanField()      # True = Yes, False = No
    order         = PositiveSmallIntegerField(default=0)  # display order 1–3


# ── Tenant Rating (Vendor → Tenant) ──────────────────────────────────────────

class TenantRating(TenantScopedModel):
    """One rating record per completed TO — vendor rates tenant."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    rated_by        = ForeignKey("VendorUser", on_delete=SET_NULL, null=True)
    score           = PositiveSmallIntegerField(null=True, blank=True)  # 1–5 overall
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]


class TenantRatingAnswer(models.Model):
    """Y/N answer to one of the three random questions on a TenantRating."""
    tenant_rating = ForeignKey(TenantRating, on_delete=CASCADE, related_name="answers")
    question      = ForeignKey("RatingQuestion", on_delete=PROTECT)
    answer        = BooleanField()
    order         = PositiveSmallIntegerField(default=0)


# ── Shared Question Store ─────────────────────────────────────────────────────

class RatingQuestion(TenantScopedModel):
    """Predefined Yes/No question — covers both directions via rating_type."""
    RATING_TYPE_CHOICES = [
        ("VENDOR", "Vendor Rating"),   # Tenant → Vendor pool
        ("TENANT", "Tenant Rating"),   # Vendor → Tenant pool
    ]
    rating_type   = CharField(max_length=10, choices=RATING_TYPE_CHOICES)
    question_text = CharField(max_length=255)
    is_active     = BooleanField(default=True)
    order         = PositiveSmallIntegerField(default=0)  # seed ordering only; not a criterion key
```

> **Removed vs earlier drafts:** `VendorRatingCriterion` / `TenantRatingCriterion` and per-criterion star scores. Qualitative coverage is the random Y/N set only.

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

## Random Question Selection

```python
def pick_random_questions(rating_type: str, n: int = 3) -> list[RatingQuestion]:
    pool = list(
        RatingQuestion.objects.filter(rating_type=rating_type, is_active=True)
    )
    if len(pool) < n:
        raise BusinessRuleError("Insufficient active rating questions")
    return random.sample(pool, n)
```

**Rules**

- Form GET (while pending): return (or lock in) **3** question IDs for this rating attempt.
- Prefer locking the selected set on first form open so refresh does not reshuffle mid-fill (store on pending row or session-scoped draft answers without `answer` yet).
- Submit requires answers for **exactly those 3** question IDs; each `answer` is boolean (Yes/No).
- Historical answers remain readable if a question is later deactivated.
- If pool shrinks below 3 active questions after form open, submit validation still accepts the previously locked IDs if they were active at selection time (or re-pick only when pending has no locked set).

---

## Rolling Average Service Logic

```python
class VendorRatingService:
    @staticmethod
    def compute_and_save(vendor_rating: VendorRating) -> None:
        score = vendor_rating.score  # 1–5
        vendor_rating.average_rating = Decimal(score).quantize(Decimal("0.01"))
        vendor_rating.is_submitted = True
        vendor_rating.submitted_at = now()
        vendor_rating.save()

        vendor = vendor_rating.vendor
        new_rolling = round(
            ((vendor.rating * vendor.rating_count) + score) / (vendor.rating_count + 1), 2
        )
        vendor.rating = new_rolling
        vendor.rating_count += 1
        vendor.save(update_fields=["rating", "rating_count"])


class TenantRatingService:
    @staticmethod
    def compute_and_save(tenant_rating: TenantRating) -> None:
        score = tenant_rating.score
        tenant_rating.average_rating = Decimal(score).quantize(Decimal("0.01"))
        tenant_rating.is_submitted = True
        tenant_rating.submitted_at = now()
        tenant_rating.save()

        tenant = tenant_rating.tenant
        new_rolling = round(
            ((tenant.vendor_rating * tenant.vendor_rating_count) + score)
            / (tenant.vendor_rating_count + 1), 2
        )
        tenant.vendor_rating = new_rolling
        tenant.vendor_rating_count += 1
        tenant.save(update_fields=["vendor_rating", "vendor_rating_count"])
```

Use `@transaction.atomic` + `select_for_update` on the entity row when updating rolling averages.

---

## API Reference

### Vendor Rating (Tenant → Vendor)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Submit rating for completed TO |
| `GET` | `/api/v1/transport-orders/{id}/vendor-rating/` | Tenant Admin, TDO | Get pending/submitted rating (includes locked 3 questions) |
| `GET` | `/api/v1/vendors/{id}/ratings/` | Tenant Admin, TDO, TP | Paginated rating history |
| `GET` | `/api/v1/vendors/{id}/rating-summary/` | Tenant Admin, TDO, TP | Overall avg + count |
| `GET` | `/api/v1/rating-questions/?rating_type=VENDOR&random=3` | Tenant Admin, TDO | Active pool sample / form population helper |

**Submit payload (nested write):**

```json
{
  "score": 4,
  "overall_comment": "Optional note",
  "answers": [
    {"question_id": "...", "answer": true},
    {"question_id": "...", "answer": false},
    {"question_id": "...", "answer": true}
  ]
}
```

### Tenant Rating (Vendor → Tenant)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | Submit tenant rating (mobile) |
| `GET` | `/api/v1/transport-orders/{id}/tenant-rating/` | Vendor | View own pending/submitted rating for TO |
| `GET` | `/api/v1/tenants/{id}/vendor-rating-summary/` | Vendor (any) | Aggregate avg + count — join flow |
| `GET` | `/api/v1/tenants/{id}/vendor-ratings/` | Tenant Admin | All vendor-submitted ratings for tenant |
| `GET` | `/api/v1/rating-questions/?rating_type=TENANT&random=3` | Vendor (authed) | Active pool sample for mobile form |

---

## Permissions

| Permission Code | Granted To | Action |
|----------------|-----------|--------|
| `vendor.rating.create` | `tenant_admin`, `tdo` | Submit vendor rating |
| `vendor.rating.view` | `tenant_admin`, `tdo`, `transport_planner` | View vendor ratings & summary |
| `vendor.rating.configure` | `tenant_admin` | Manage rating questions (seed only in v1) |
| `tenant.rating.create` | `vendor` | Submit tenant rating |
| `tenant.rating.view_own` | `vendor` | View own submitted tenant rating |
| `tenant.rating.view_summary` | `vendor` | View tenant aggregate summary (join flow) |
| `tenant.rating.admin_view` | `tenant_admin` | View all incoming vendor ratings |

---

## Visibility Rules (v1)

| Actor | Sees | Does not see |
|-------|------|-------------|
| Tenant Admin / TDO | Full vendor rating: overall score, Y/N answers, history | — |
| Transport Planner | Vendor overall rating in bid/comparison views | Y/N answer detail (optional collapse) |
| Vendor (own mobile) | Own submitted tenant ratings (score + answers) | **Own vendor performance rating from tenants** |
| Vendor (join flow) | Tenant aggregate ★ avg + count | Individual rating entries by other vendors |

---

## Seed Data Summary

| Direction | Star scores | Question pool size | Shown per rating |
|-----------|-------------|--------------------|------------------|
| Tenant → Vendor | 1 overall (1–5) | **9** VENDOR questions | **3 random** |
| Vendor → Tenant | 1 overall (1–5) | **9** TENANT questions | **3 random** |
| **Total seed** | | **18** questions | |

---

## UI Surfaces & Theme

| Surface | Direction | What is shown | Story |
|---------|-----------|---------------|-------|
| Completed TO detail (admin) | Tenant → Vendor | "Rate Vendor" CTA or "Vendor Rated ★★★★ 4.0" | VRS-01, VRS-03 |
| Vendor rating form (admin) | Tenant → Vendor | Single star row + 3 Y/N radios + comment | VRS-01 |
| Vendor profile page (admin) | Tenant → Vendor | Summary avg + count + paginated history (score, answers, comment) | VRS-03 |
| Bid list / comparison (admin) | Tenant → Vendor | Rating column / panel (overall only) | VRS-03 |
| Vendor admin list | Tenant → Vendor | Rating column + min-rating filter | VRS-03 |
| Vendor mobile — post-TO | Vendor → Tenant | Single star + 3 Y/N radios + comment | VRS-02 |
| Vendor mobile — completed trip detail | Vendor → Tenant | Read-only own submitted rating | VRS-02 |
| Vendor mobile — Join Tenant | Vendor → Tenant | Tenant aggregate ★ + count | VRS-02 |
| Admin portal — tenant incoming ratings | Vendor → Tenant | List + summary card (overall avg/count) | VRS-02 |

### Theme rules (mandatory)

- **Admin portal (web):** Reuse existing portal templates, form controls, button styles, spacing, and star/rating display patterns already used in the Django tenant portal. Yes/No answers use native/styled **radio** groups consistent with other portal forms — do not introduce a separate rating design system.
- **Vendor mobile:** Reuse existing Flutter theme (`ThemeData` / design tokens), typography, colors, and shared widgets from the Vendor App. Star selector and Yes/No **radio** groups must match current app control language (Material/Cupertino patterns already in use) — no new palette, card chrome, or one-off rating visual language.

---

## Audit Events

| Event | Trigger | Actor |
|-------|---------|-------|
| `VENDOR_RATING_SUBMITTED` | `VendorRating` submitted | Tenant Admin / TDO |
| `TENANT_RATING_SUBMITTED` | `TenantRating` submitted | Vendor |

---

## Phase Roadmap

| Phase | Scope |
|-------|-------|
| **v1 (Phase 2)** | Bidirectional rating: single 1–5 score, 3 random Y/N radios, rolling averages, admin visibility, bid views wired, vendor join-flow summary |
| **Phase 3** | Auto-calculated vendor rating from trip metrics (on-time %, POD quality, claims ratio) |
| **Phase 3** | Configurable question pools / weights |
| **Phase 3** | Min-rating bid gate — `min_vendor_rating` threshold enforcement |
| **Phase 3** | Rating audit export, appeal workflow |
| **Future** | Vendor-facing exposure of own performance rating |

---

## Related Specifications

- [`vendor-bidding.md`](vendor-bidding.md) — `min_vendor_rating` on TO bid config; `vendor_rating_at_award` on BidAward
- [`vendor-portal.md`](vendor-portal.md) — Performance Rating widget (future live data)
- [`vendor-onboarding.md`](vendor-onboarding.md) — `Vendor.rating` field (decimal, default 0)
- Phase 2 stories: [VRS-01](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md) · [VRS-02](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md) · [VRS-03](../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

*Module: Vendor Management | PRD: 6.14.11 | Phase: 2 | Last Updated: 2026-09-17*
