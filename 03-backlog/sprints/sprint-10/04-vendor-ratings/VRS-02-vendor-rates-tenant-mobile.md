---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VRS-02
title: Vendor Rates Tenant — Post-TO Rating (Vendor Mobile App)
epic: Vendor Rating System
status: Pending
story_points: 5
assignee: ~
phase: Phase 2
design_ref: ~
related_stories:
  - VRS-01-post-to-vendor-rating-admin.md
  - VRS-03-vendor-rating-visibility-admin.md
source_docs:
  - ../../../../05-modules/07-vendor-management/vendor-rating.md
  - ../../../../05-modules/09-mobile-apps/vendor-mobile.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
---

# VRS-02 — Vendor Rates Tenant — Post-TO Rating (Vendor Mobile App)

## User Story

**As a** Vendor (via the Vendor Mobile App)  
**I want to** rate the tenant after completing a Transport Order  
**So that** my experience working with this tenant is recorded and helps me decide whether to continue or join new tenants in future

## Business Context

The Vendor Rating System is **bidirectional**:

| Direction | Who rates | What is rated | When |
|-----------|-----------|---------------|------|
| **Tenant → Vendor** (VRS-01) | Tenant Admin / TDO | Vendor performance | After TO → `COMPLETED` |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile) | Tenant experience | After vendor ACKs completed trip |

Vendor-to-tenant ratings serve a specific purpose: when a vendor **searches for and requests to join a new tenant**, they can see the tenant's aggregate rating (stars + count) before committing to a join request. This empowers vendors with transparency.

In v1:
- Rating is **1–5 stars overall** + optional comment.
- Detailed per-criterion sub-ratings are **deferred** (TBD based on internal discussion).
- One rating per TO per vendor.
- Vendor sees their **own** submitted rating; tenant admin sees all vendor-submitted ratings.

---

## Acceptance Criteria

### AC-1: Rating Trigger — Mobile

- [ ] After a TO is acknowledged as completed by the vendor (completed trip confirmation screen), a **"Rate this Tenant"** prompt appears as the next screen / bottom sheet.
- [ ] Prompt is **skippable** (dismissible) — vendor is not forced to rate.
- [ ] If dismissed, a **"Rate"** action remains accessible from the completed trip detail page.
- [ ] One rating per TO — re-opening the flow shows the vendor's previously submitted rating (read-only if submitted).

### AC-2: Rating Form (Mobile)

- [ ] **Overall star rating:** 1–5 star selector (required to submit).
- [ ] **Comment:** optional text field, max 500 characters.
- [ ] Submit button disabled until a star is selected.
- [ ] Confirmation: "Thank you for your feedback!" toast / success screen on submit.

> **Future (deferred):** Per-criterion sub-ratings (e.g. Professionalism, Payment Timeliness, Load Quality) may be added in a later sprint after internal criteria discussion.

### AC-3: Submission & Immutability

- [ ] `TenantRating` record persisted with: `to_id`, `tenant_id`, `vendor_id`, `submitted_at`, `stars`, `comment`, `is_submitted = True`.
- [ ] Submission is **immutable** — rating cannot be edited after submit.
- [ ] Duplicate protection: second submission for the same TO is rejected (`400 Bad Request`).

### AC-4: Tenant Rating Summary — Join Tenant Flow

- [ ] When a vendor **searches for tenants** to request joining, the tenant card / detail screen shows:
  - Aggregate star rating: e.g. ⭐⭐⭐⭐ 4.2/5.0
  - Rating count: e.g. "Based on 8 ratings from vendors"
- [ ] If no ratings yet: "No ratings yet" shown (not hidden).
- [ ] This summary is computed from all `TenantRating` records for that tenant.

### AC-5: Admin — Tenant Rating View

- [ ] Tenant Admin can view a list of all vendor-submitted ratings for their tenant in the admin portal (read-only).
- [ ] Displays: vendor name, TO reference, stars, comment, submitted date.

### AC-6: No Bid Eligibility Impact (v1)

- [ ] Tenant rating does **not** gate bid eligibility, vendor approval, or any automated decision in v1.
- [ ] Used for **informational/display purposes only** in v1.

---

## Data Models

```python
class TenantRating(TenantScopedModel):
    """Vendor rates tenant post-TO completion. One per TO per vendor."""
    transport_order = ForeignKey("TransportOrder", on_delete=PROTECT)
    vendor          = ForeignKey("Vendor", on_delete=PROTECT, related_name="tenant_ratings")
    stars           = PositiveSmallIntegerField()          # 1–5
    comment         = TextField(blank=True, max_length=500)
    submitted_at    = DateTimeField(auto_now_add=True)
    is_submitted    = BooleanField(default=False)

    class Meta:
        unique_together = [("transport_order", "vendor")]
```

Tenant aggregate summary is computed on-demand (or cached):

```python
# Computed:
TenantRating.objects.filter(tenant=tenant, is_submitted=True).aggregate(
    avg_stars=Avg("stars"),
    count=Count("id")
)
```

---

## API Endpoints

```
POST   /api/v1/transport-orders/{id}/tenant-rating/     # vendor submits tenant rating
GET    /api/v1/transport-orders/{id}/tenant-rating/     # vendor views own submitted rating for TO
GET    /api/v1/tenants/{id}/rating-summary/             # public summary (avg stars + count) — used in Join flow
GET    /api/v1/tenants/{id}/tenant-ratings/             # admin views all vendor ratings for their tenant
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit tenant rating | `vendor` (authenticated; must be assigned on the TO) |
| View own submitted rating | `vendor` (own submission only) |
| View tenant rating summary (join flow) | `vendor` (any authenticated vendor) |
| View all tenant ratings | `tenant_admin` |

**Permission codes (proposed):** `tenant.rating.create` (vendor), `tenant.rating.view_summary` (vendor), `tenant.rating.admin_view` (tenant_admin)

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-02-1 | `TenantRating` model + migration | stars, comment, TO/vendor link, unique constraint | High | Not started |
| VRS-02-2 | Vendor mobile — rating screen | Post-TO acknowledgment → rating prompt → form → confirm | High | Not started |
| VRS-02-3 | Rating API endpoints | POST + GET (vendor); GET summary (join flow); GET list (admin) | High | Not started |
| VRS-02-4 | Tenant rating summary in Join Tenant flow | Aggregate ★ + count on tenant card / detail in mobile | Medium | Not started |
| VRS-02-5 | Admin portal — tenant ratings list | Read-only list of vendor ratings for tenant admin | Low | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Transport Order (`COMPLETED` state) | Upstream | Rating trigger point |
| Vendor Mobile — completed trip acknowledgment screen | Upstream | UI entry point for rating prompt |
| Join Tenant flow (vendor mobile) | Downstream | Rating summary surfaced here |
| VRS-01 (VendorRating) | Sibling | Different direction; shares `RatingQuestion` model structure |

---

## Definition of Done

- [ ] `TenantRating` model created with migration and unique constraint
- [ ] Vendor mobile rating screen implemented (post-TO completion acknowledgment)
- [ ] Rating stored immutably; re-access shows read-only view
- [ ] Tenant rating summary (avg stars + count) shown in Join Tenant flow
- [ ] Unit tests: submission, idempotency (duplicate rejection), star range validation
- [ ] E2E scenario stub in `09-testing/`

---

*Epic: Vendor Rating System | Phase: 2 | Sprint 10: 5 SP | Last Updated: 2026-09-07*
