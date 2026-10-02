# Vendor Rating System

**PRD Section:** 6.14.11  
**Phase:** Phase 2  
**Status:** ✅ **Implemented — Phase 2** (migration `0019_vendor_rating_system`, `0004_tenant_vendor_rating_fields`; story set: `phase-2/stories-phase-2/008`)  
**Related Stories:** [VRS-01](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md), [VRS-02](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md), [VRS-03](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

## Overview

The Vendor Rating System introduces a **fully symmetric, bidirectional performance feedback loop** between tenants and vendors. Both directions share the same structural pattern:

**1 overall score (1–5 stars) + 3 optional randomly selected Yes/No questions (radio) + optional overall comment → blended score → rolling entity rating.**

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
5. **Yes/No via radio** — each question is answered with a mutually exclusive **Yes / No** radio control (admin portal and vendor mobile). Answers are **optional**. A skip is not a No.
6. **Immutability** — submitted ratings cannot be edited (consistent with bid immutability pattern).
7. **Shared question store** — a single `RatingQuestion` model covers both directions via `rating_type` (`VENDOR` / `TENANT`).
8. **Rolling average** — entity ratings (`Vendor.rating`, `Tenant.vendor_rating`) are rolling averages of `average_rating`: **70% stars and up to 30% questions**. Skipped questions return their share to the stars.
9. **Theme continuity** — portal UI reuses existing Django admin-portal layout, components, and CSS tokens; mobile UI reuses existing Vendor App theme, typography, spacing, and control patterns (no new visual language).
10. **Internal by default** — vendor’s own performance rating deferred for vendor-facing exposure to Phase 3+.

---

## Rating Form Shape (both directions)

| Element | Rule |
|---------|------|
| **Overall score** | Required **1–5 star** selector (single control) |
| **Questions** | Exactly **3** randomly selected Yes/No questions from the active pool for that `rating_type`. **Optional** |
| **Answer UI** | **Radio buttons**: Yes · No (one selection per question; unselected = skipped) |
| **Overall comment** | Optional, max 1 000 chars |
| **Per-criterion scores / panels** | **Not used in v1** |

### Average / rolling update

```
star_score = integer 1–5          # stored as score
# Yes = 5, No = 1. Each of the 3 questions is 10% (30% / 3).
# A skipped question is omitted — its 10% stays on the star score.
# 0 answers → average_rating = star_score.

question_weight = 0.30 * (answered_count / 3)
star_weight     = 1 - question_weight
question_score  = mean(5 if yes else 1 for each answered question)
average_rating  = round(star_weight * star_score + question_weight * question_score, 2)

# Rolling entity average uses the blend, not the raw stars
new_entity_avg = round(
    ((current_rating × rating_count) + average_rating) / (rating_count + 1),
    2
)
rating_count += 1
```

Examples: 5 stars, all skipped → `5.00`. 5 stars, three Yes → `5.00`. 5 stars, three No → `3.80`. 4 stars, two Yes and one No → `3.90`.

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

class VendorRating(TenantAwareModel):
    """One rating record per completed TO — tenant rates vendor."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT, related_name="vendor_ratings")
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="ratings")
    rated_by        = ForeignKey(settings.AUTH_USER_MODEL, on_delete=SET_NULL, null=True,
                                 related_name="vendor_ratings_submitted")
    score           = PositiveSmallIntegerField(null=True, blank=True)  # 1–5 overall
    submitted_at    = DateTimeField(null=True, blank=True)
    average_rating  = DecimalField(max_digits=3, decimal_places=2, null=True)  # blended score (70% stars, up to 30% questions)
    overall_comment = TextField(blank=True, max_length=1000)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]  # one per TO per vendor in this tenant schema


class VendorRatingAnswer(TenantAwareModel):
    """Y/N answer to one of the three random questions on a VendorRating."""
    vendor_rating = ForeignKey(VendorRating, on_delete=CASCADE, related_name="answers")
    question      = ForeignKey("RatingQuestion", on_delete=PROTECT, related_name="vendor_answers")
    answer        = BooleanField(null=True, blank=True)  # None = locked in / pending; True=Yes, False=No
    display_order = PositiveSmallIntegerField(default=0)  # 1–3


# ── Tenant Rating (Vendor → Tenant) ──────────────────────────────────────────

class TenantRating(TenantAwareModel):
    """One rating record per completed TO — vendor rates tenant. Lives in rated tenant's schema."""
    transport_order          = ForeignKey("TransportOrder", on_delete=PROTECT, related_name="tenant_ratings")
    vendor                   = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    rated_by_vendor_account_id = UUIDField(null=True, blank=True)  # VendorPortalAccount.id (public schema)
    score                    = PositiveSmallIntegerField(null=True, blank=True)
    submitted_at             = DateTimeField(null=True, blank=True)
    average_rating           = DecimalField(max_digits=3, decimal_places=2, null=True)
    overall_comment          = TextField(blank=True, max_length=1000)
    is_submitted             = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]


class TenantRatingAnswer(TenantAwareModel):
    """Y/N answer to one of the three random questions on a TenantRating."""
    tenant_rating = ForeignKey(TenantRating, on_delete=CASCADE, related_name="answers")
    question      = ForeignKey("RatingQuestion", on_delete=PROTECT, related_name="tenant_answers")
    answer        = BooleanField(null=True, blank=True)
    display_order = PositiveSmallIntegerField(default=0)


# ── Shared Question Store ─────────────────────────────────────────────────────

class RatingQuestion(TenantAwareModel):
    """Predefined Yes/No question — covers both directions via rating_type."""

    class RatingType(models.TextChoices):
        VENDOR = "VENDOR", "Vendor Rating"   # Tenant → Vendor pool
        TENANT = "TENANT", "Tenant Rating"   # Vendor → Tenant pool

    rating_type   = CharField(max_length=10, choices=RatingType.choices, db_index=True)
    question_text = CharField(max_length=255)
    is_active     = BooleanField(default=True, db_index=True)
    order         = PositiveSmallIntegerField(default=0)  # seed ordering hint only; not a criterion key
```

> **Removed vs earlier drafts:** `VendorRatingCriterion` / `TenantRatingCriterion` and per-criterion star scores. Qualitative coverage is the random Y/N set only.

> **Key difference from spec draft:** `VendorRatingAnswer.answer` is **nullable** (allows `null` while the form is pending / questions locked in but not yet answered). The `display_order` field replaces `order` on the answer models for clarity.

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
- Submit requires the star score. Answers for the locked question IDs are optional (0–3). Each provided `answer` is boolean (Yes/No) or null/omitted (skip). Unknown question IDs are rejected.
- Historical answers remain readable if a question is later deactivated.
- If pool shrinks below 3 active questions after form open, submit validation still accepts the previously locked IDs if they were active at selection time (or re-pick only when pending has no locked set).

---

## Rolling Average Service Logic

```python
class VendorRatingService:
    """apps/vendors/rating_services.py — VRS-01"""

    @staticmethod
    @transaction.atomic
    def submit(rating, *, score, answer_map, overall_comment="", rated_by=None):
        """
        Validate and persist a VendorRating.
        answer_map: {question_id_str: bool} — subset of the 3 locked question IDs.
        Omitted IDs are skips. average_rating is the 70/30 blend.
        Updates Vendor.rating + rating_count from average_rating.
        Mirrors updated rating to public VendorRegistry.
        """
        if rating.is_submitted:
            raise BusinessRuleError("This rating has already been submitted and cannot be changed.")
        # validate score (1–5), comment length (≤1000), answer IDs + boolean types …
        
        # Persist answers + rating row
        rating.score = score
        rating.average_rating = effective_rating(score, answered_bools)
        rating.is_submitted = True
        rating.submitted_at = now()
        rating.save(...)

        # Rolling average — row-locked
        vendor = Vendor.objects.select_for_update().get(pk=rating.vendor_id)
        new_avg = rating.average_rating if vendor.rating_count == 0 else round(
            (vendor.rating * vendor.rating_count + rating.average_rating) / (vendor.rating_count + 1), 2
        )
        vendor.rating = new_avg
        vendor.rating_count += 1
        vendor.save(update_fields=["rating", "rating_count", "updated_at"])
        
        # Mirror to public schema VendorRegistry
        # (uses schema_context(get_public_schema_name()) pattern)

    @staticmethod
    def ensure_pending_on_to_terminal(transport_order) -> None:
        """
        Called from transition_service.apply_to_status_transition on CLOSED/COMPLETED.
        Creates a pending VendorRating if the TO is VENDOR fleet and has an assigned vendor.
        Best-effort: never raises (failure is logged, primary transition continues).
        """


class TenantRatingService:
    """apps/vendors/rating_services.py — VRS-02"""

    @staticmethod
    @transaction.atomic
    def submit(rating, *, score, answer_map, overall_comment="", rated_by_vendor_account_id=None):
        """
        Validate and persist a TenantRating.
        Updates Tenant.vendor_rating + vendor_rating_count in the public schema
        (uses schema_context to switch to public schema + select_for_update on Tenant row).
        """
```

Both services use `@transaction.atomic` + `select_for_update()` on the entity row to prevent lost-increment race conditions.

---

## API Reference

> All endpoints are mounted under `/api/v1/` via `apps/vendors/urls.py` (tenant admin) and `apps/vendors/vendor_portal_urls.py` (vendor mobile).

### Vendor Rating (Tenant → Vendor) — VRS-01

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/rating-questions/?type=VENDOR&random=3` | `Vendor.Rating.Create` | Return 3 randomly-sampled active questions; locks the set for form rendering |
| `GET` | `/api/v1/vendors/<vendor_id>/rate/<to_id>/form/` | `Vendor.Rating.Create` | Init (or return existing) pending VendorRating + 3 locked questions |
| `POST` | `/api/v1/vendors/<vendor_id>/rate/<to_id>/submit/` | `Vendor.Rating.Create` | Submit score and 0–3 optional answers; rolling average uses the blend |
| `GET` | `/api/v1/vendors/<vendor_id>/ratings/` | `Vendor.Rating.View` | Paginated rating history for a vendor |
| `GET` | `/api/v1/vendors/<vendor_id>/rating-summary/` | `Vendor.Rating.View` | Overall avg + count (profile card) |
| `GET` | `/api/v1/vendor-ratings/` | `Vendor.Rating.View` | Admin list of all VendorRatings in tenant |

**Submit payload:**

```json
{
  "transport_order_id": "<uuid>",
  "score": 4,
  "overall_comment": "Optional note.",
  "answers": [
    {"question_id": "<uuid>", "answer": true},
    {"question_id": "<uuid>", "answer": false},
    {"question_id": "<uuid>", "answer": true}
  ]
}
```

**Portal pages (Django SSR):**

| URL | View | Template |
|-----|------|----------|
| `/vendors/<vendor_id>/rate/<to_id>/` | `vendor_rate_page()` | `vendors/rate_vendor.html` |
| `/vendors/<vendor_id>/ratings/` | `vendor_rating_history_page()` | `vendors/vendor_rating_history.html` |

---

### Tenant Rating (Vendor → Tenant) — VRS-02

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/v1/vendor/transport-orders/<to_id>/rate-tenant/form/` | Vendor JWT | Init (or return existing) pending TenantRating + 3 locked questions |
| `POST` | `/api/v1/vendor/transport-orders/<to_id>/rate-tenant/submit/` | Vendor JWT | Submit score and 0–3 optional answers; tenant aggregate uses the blend |
| `GET` | `/api/v1/vendor/transport-orders/<to_id>/rate-tenant/` | Vendor JWT | Read own submitted rating (read-only after submit) |
| `GET` | `/api/v1/vendor/tenants/<schema>/rating-summary/` | Vendor JWT | Tenant aggregate avg + count (Join Tenant discovery flow) |
| `GET` | `/api/v1/vendor/tenants/<schema>/rating-questions/` | Vendor JWT | Active TENANT pool sample (mobile form population) |
| `GET` | `/api/v1/tenant-ratings/` | `Tenant.Rating.AdminView` | Admin list of all TenantRatings submitted for this tenant |

**Scoped (multi-tenant) variants** also available at `tenants/<schema>/transport-orders/<to_id>/rate-tenant/...`

**Submit payload (tenant rating):**

```json
{
  "score": 3,
  "overall_comment": "Optional.",
  "answers": [
    {"question_id": "<uuid>", "answer": true},
    {"question_id": "<uuid>", "answer": false},
    {"question_id": "<uuid>", "answer": true}
  ]
}
```

---

## Permissions

> Codes match `apps/core/constants_rbac.py — PermissionCodes`. Seeded via `apps/core/role_seed_data.py`.

| Permission Code | Granted To | Action |
|----------------|-----------|--------|
| `Vendor.Rating.Create` | `tenant_admin`, `tenant_super_admin`, `tdo_vendor_fleet` | Submit vendor rating (VRS-01) |
| `Vendor.Rating.View` | `tenant_admin`, `tenant_super_admin`, `tdo_vendor_fleet`, `transport_planner` | View vendor ratings, history, summary (VRS-03) |
| `Tenant.Rating.Create` | Vendor (JWT) | Submit tenant rating from mobile (VRS-02) |
| `Tenant.Rating.ViewOwn` | Vendor (JWT) | View own submitted tenant rating |
| `Tenant.Rating.AdminView` | `tenant_admin`, `tenant_super_admin` | View all incoming vendor ratings |

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

> The audit service (`apps/audit/services.py`) uses `AuditEventType.CREATE` with a specific `action` string (no new top-level event types needed).

| `action` string | `entity_type` | Trigger | Actor |
|-----------------|---------------|---------|-------|
| `"VendorRating.Submit"` | `"VendorRating"` | `VendorRating` submitted | Tenant Admin / TDO |
| `"TenantRating.Submit"` | `"TenantRating"` | `TenantRating` submitted | Vendor (vendor_account_id in details) |

Audit rows are written after commit via `write_audit_log()` (best-effort; never blocks primary operation).

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

## Implementation Files

| File | Purpose |
|------|---------|
| `apps/vendors/models.py` | `RatingQuestion`, `VendorRating`, `VendorRatingAnswer`, `TenantRating`, `TenantRatingAnswer` |
| `apps/vendors/rating_services.py` | `VendorRatingService`, `TenantRatingService`, `pick_random_questions()` |
| `apps/vendors/rating_serializers.py` | DRF serializers for all rating shapes |
| `apps/vendors/rating_views.py` | 10 API views (question pool, form init, submit, history, summary, admin lists) |
| `apps/vendors/urls.py` | URL wiring for tenant admin rating endpoints |
| `apps/vendors/vendor_portal_urls.py` | URL wiring for vendor mobile rating endpoints |
| `apps/vendors/portal_views.py` | SSR portal views (`vendor_rate_page`, `vendor_rating_history_page`) |
| `apps/core/web_urls.py` | Portal route `/vendors/<id>/rate/<to_id>/` + `/vendors/<id>/ratings/` |
| `apps/transport/lifecycle/transition_service.py` | Hook: `VendorRatingService.ensure_pending_on_to_terminal()` on CLOSED/COMPLETED |
| `apps/core/constants_rbac.py` | `VENDOR_RATING_*` + `TENANT_RATING_*` permission codes |
| `apps/core/role_seed_data.py` | Permission assignment to `tdo_vendor_fleet`, `transport_planner`, `PERMISSION_DEFINITIONS` |
| `apps/vendors/admin.py` | Django admin registration for `RatingQuestion`, `VendorRating`, `TenantRating` |
| `apps/vendors/management/commands/seed_rating_questions.py` | `seed_rating_questions` management command |
| `apps/vendors/migrations/0019_vendor_rating_system.py` | DB migration for all rating models + `Vendor.rating_count` |
| `apps/tenants/migrations/0004_tenant_vendor_rating_fields.py` | DB migration for `Tenant.vendor_rating` + `vendor_rating_count` |
| `templates/vendors/rate_vendor.html` | Bootstrap 5 + Alpine.js star + Y/N radio form (VRS-01 portal) |
| `templates/vendors/vendor_rating_history.html` | Rating history table + rolling avg card (VRS-03 portal) |
| `tests/unit/test_vendors/test_vendor_rating_service.py` | **25 unit tests** — rolling avg, immutability, validation, pick_random |

---

## Related Specifications

- [`vendor-bidding.md`](vendor-bidding.md) — `min_vendor_rating` on TO bid config; `vendor_rating_at_award` on BidAward
- [`vendor-portal.md`](vendor-portal.md) — Performance Rating widget (future live data)
- [`vendor-onboarding.md`](vendor-onboarding.md) — `Vendor.rating` field (decimal, default 0)
- Phase 2 stories: [VRS-01](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md) · [VRS-02](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md) · [VRS-03](../../03-backlog/phase-2/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)

---

*Module: Vendor Management | PRD: 6.14.11 | Phase: 2 | Status: Implemented | Last Updated: 2026-09-17*
