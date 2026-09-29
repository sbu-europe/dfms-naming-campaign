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
  - ../../../../05-modules/07-vendor-management/vendor-rating.md
  - ../../../../05-modules/09-mobile-apps/vendor-mobile.md
module_spec: 05-modules/07-vendor-management/vendor-rating.md
tdd_test_cases: ../../../../09-testing/stories-phase-2/008-Vendor Rating System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/008-Vendor Rating System/00-all-test-cases.md
---

# VRS-02 — Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App)

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VRS-02 TDD catalog** (`AC-N.x` mapped) | [VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md) |
| **Vendor Rating System TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Vendor (via the Vendor Mobile App)  
**I want to** rate the tenant with a single score and a few Yes/No questions after completing a Transport Order  
**So that** my experience working with this tenant is documented and helps other vendors decide when requesting to join that tenant

## Business Context

The rating system is fully **symmetric (vice versa)**. Both directions use the same shape:

**1 overall score (1–5) + 3 randomly selected Yes/No questions (radio) + optional comment.**

| Direction | Who rates | What is rated | Trigger |
|-----------|-----------|---------------|---------|
| **Tenant → Vendor** (VRS-01) | Tenant Super Admin / Tenant Admin / TDO | Vendor performance | TO completed/closed (admin portal) |
| **Vendor → Tenant** (VRS-02) | Vendor (mobile) | Tenant experience | Vendor ACKs completed trip (mobile) |

There are **no multi-criterion star panels** (no Payment / Load / Communication separate scores). Qualitative coverage comes from the three random questions.

**Tenant ratings serve two purposes:**
1. **Internal self-assessment** — Tenant Super Admin / Tenant Admin sees aggregate rating from vendors.
2. **Vendor join-decision tool** — Join Tenant discovery shows tenant aggregate ★ + count.

---

## Rating Shape (Vendor → Tenant)

| Element | Rule |
|---------|------|
| **Overall score** | Required **1–5 star** selector (single) |
| **Questions** | Exactly **3 random** Yes/No questions from TENANT pool |
| **Answer UI** | **Radio buttons** Yes / No (existing app theme) |
| **Comment** | Optional overall comment (max 1 000 chars) |

### Rolling update

```
Tenant.vendor_rating (rolling) =
    ((current_vendor_rating × vendor_rating_count) + score) / (vendor_rating_count + 1)
```

---

## Predefined Yes/No Questions — v1 Seed Pool (Vendor → Tenant)

Nine-question pool (`rating_type=TENANT`); form shows **3 random** per rating attempt. Full list in [`vendor-rating.md`](../../../../05-modules/07-vendor-management/vendor-rating.md) (payment, load readiness, communication topics — pool only, not separate star criteria).

---

## Acceptance Criteria

> **Test scenarios:** see [VRS-02 TDD catalog](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md) · [Vendor Rating System index](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md)

### AC-1: Rating Trigger — Mobile

Given the vendor has acknowledged trip completion on mobile,

when the completed-trip confirmation flow continues,

then a skippable **"Rate this Tenant"** step is shown, with later access from trip detail while pending, and one rating per TO.

- [ ] After the vendor acknowledges trip completion, a **"Rate this Tenant"** screen / bottom sheet is presented as the next step.
- [ ] Prompt is **skippable** — vendor is never forced to rate.
- [ ] If skipped, a **"Rate Tenant"** action remains on completed trip detail while pending.
- [ ] One rating per TO per vendor — idempotent.

### AC-2: Rating Form — Single Score + Random Radios

Given the vendor opens the tenant rating form,

when the form renders,

then it shows one 1–5 star control, exactly three Yes/No radio questions, optional comment, and submit disabled until score + all three answers are set — matching existing Vendor App theme.

- [ ] **Single 1–5 star selector** (required).
- [ ] **Exactly 3 Yes/No questions** randomly selected from TENANT pool; locked for this pending rating.
- [ ] Each question: **radio** group Yes / No (mutually exclusive).
- [ ] Optional overall comment (max 1 000 chars).
- [ ] Submit disabled until score and all 3 radio answers are selected.
- [ ] UI reuses existing Vendor App theme tokens, typography, colors, and shared controls — no new visual language.

### AC-3: Predefined Questions Loaded from API

Given the mobile form needs Y/N questions,

when it fetches rating questions for `rating_type=TENANT`,

then exactly three random active questions are returned (or loaded via GET tenant-rating pending payload).

- [ ] Form populates from `GET /api/v1/vendor/transport-orders/<to_id>/rate-tenant/form/` (locked set; returns pending `TenantRating` + 3 locked questions) and/or `GET /api/v1/vendor/tenants/<schema>/rating-questions/`.
- [ ] If active pool &lt; 3, show a clear error / empty state (cannot submit).

### AC-4: Submission & Immutability

Given the vendor submits a complete valid tenant rating,

when the API persists the rating,

then records are atomic, rolling average updates, submission is immutable, duplicates return 400, and a success screen shows.

- [ ] On submit, `TenantRating` + exactly 3 `TenantRatingAnswer` rows persisted atomically.
- [ ] `score` / `average_rating` stored; `Tenant.vendor_rating` + `vendor_rating_count` updated (via `schema_context` to public schema).
- [ ] Submission **immutable**; duplicate submit → `400`.
- [ ] Success screen: "Thank you for your rating!" with score displayed.

### AC-5: Tenant Rating Visibility — Join Tenant Flow

Given a vendor browses tenants to request membership,

when tenant cards / detail load,

then aggregate vendor-submitted rating and count are shown (or "No ratings yet").

- [ ] Tenant card shows aggregate ★ avg + "Based on N vendor ratings" (overall only — no per-criterion breakdown).
- [ ] If no ratings yet: "No ratings yet" displayed.

### AC-6: Vendor Views Own Submitted Rating

Given the vendor has submitted a tenant rating for a TO,

when they open completed trip detail,

then their own rating is shown read-only with score, three Yes/No answers, comment, date.

- [ ] Read-only view on completed trip detail after submit.
- [ ] Shows: overall score, 3 Y/N answers, comment, submitted date.

### AC-7: Tenant Super Admin / Tenant Admin — View Incoming Ratings

Given vendors have submitted tenant ratings,

when Tenant Super Admin or Tenant Admin opens the incoming ratings view,

then a list and summary card show vendor, TO, score, answers, comment, and aggregates.

- [ ] Admin portal list of all vendor-submitted ratings for the tenant.
- [ ] Displays: vendor name, TO reference, overall score, Y/N answers, comment, submitted date.
- [ ] Summary card: overall aggregate average + total count.
- [ ] Portal UI uses existing admin theme/components.

### AC-8: No Automated Decision Impact (v1)

Given a tenant has a low or high vendor-submitted rating,

when approval, bid, or access decisions run in v1,

then tenant rating is informational only and does not gate those decisions.

- [ ] Tenant rating does **not** gate any approval, bid, or access decision in v1.

---

## Edge Cases

### Trigger & skip
- Vendor ACKs offline then syncs: rating prompt after successful ACK sync (or from trip detail).
- Skip then submit later: must not update `Tenant.vendor_rating` until submit.

### Validation
- Star outside 1–5: API rejects.
- Comment length over limit: rejected.
- Missing radio answers: reject.
- Vendor not assigned on the TO: submit denied.
- TO not completed / ACK not done: allow submit when TO is `closed`/`completed` and vendor is assigned (mobile prompt after ACK).

### Duplicates & concurrency
- Double-tap submit: second request returns 400; rolling count increments once.
- Unique constraint `(transport_order, vendor)` enforces one rating.

### Join Tenant display
- Very large rating_count: copy still "Based on N vendor ratings".

---

## API Endpoints

> Actual endpoints implemented in `apps/vendors/vendor_portal_urls.py`:

```
# Vendor mobile (JWT auth)
GET    /api/v1/vendor/transport-orders/<to_id>/rate-tenant/form/     # init / return pending TenantRating + locked 3 Qs
POST   /api/v1/vendor/transport-orders/<to_id>/rate-tenant/submit/   # submit score + answers
GET    /api/v1/vendor/transport-orders/<to_id>/rate-tenant/          # read own submitted rating
GET    /api/v1/vendor/tenants/<schema>/rating-summary/               # tenant aggregate avg + count
GET    /api/v1/vendor/tenants/<schema>/rating-questions/             # TENANT pool sample (mobile form)

# Multi-tenant scoped variants also available:
GET/POST /api/v1/vendor/tenants/<schema>/transport-orders/<to_id>/rate-tenant/...

# Admin API (tenant-scoped)
GET    /api/v1/tenant-ratings/    # all incoming vendor ratings (Tenant.Rating.AdminView)
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Submit tenant rating | `vendor` (must be assigned on the TO) |
| View own submitted rating | `vendor` (own submission only) |
| View tenant aggregate rating summary | `vendor` (any — during join flow) |
| View all vendor-submitted ratings for tenant | `tenant_super_admin`, `tenant_admin` |

**Permission codes:** `Tenant.Rating.Create`, `Tenant.Rating.ViewOwn`, `Tenant.Rating.ViewSummary`, `Tenant.Rating.AdminView`  
*(defined in `apps/core/constants_rbac.py`; seeded via `apps/core/role_seed_data.py`)*

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VRS-02-1 | Data models + migrations | `TenantRating`, `TenantRatingAnswer` + `Tenant.vendor_rating` fields | High | Not started |
| VRS-02-2 | Seed tenant rating question pool | 9 TENANT Yes/No questions | High | Not started |
| VRS-02-3 | Vendor mobile — rating screen | Single star + 3 Y/N radios + comment; existing app theme | High | Not started |
| VRS-02-4 | Score + Tenant.vendor_rating update | Rolling average on submit | High | Not started |
| VRS-02-5 | Submit + immutability | Atomic persist; duplicate rejection | High | Not started |
| VRS-02-6 | Tenant rating summary in Join Tenant flow | Aggregate ★ + count on tenant card | Medium | Not started |
| VRS-02-7 | Admin portal — incoming ratings view | List + summary card (portal theme) | Medium | Not started |
| VRS-02-8 | Tests | Cover AC-1…AC-8 + edge cases | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Transport Order (`COMPLETED`/`closed` + vendor ACK screen) | Upstream | UI trigger point |
| `RatingQuestion` model + seed (VRS-01) | Sibling | Shared model — `rating_type=TENANT` |
| Join Tenant flow (vendor mobile) | Downstream | Tenant aggregate rating surfaced here |
| Tenant model | Upstream | Add `vendor_rating` + `vendor_rating_count` |

---

## Definition of Done

- [ ] `TenantRating` + `TenantRatingAnswer` models created with migrations
- [ ] Seed data: TENANT question pool (≥ 9, show 3 random)
- [ ] `Tenant.vendor_rating` + `vendor_rating_count` fields added
- [ ] Vendor mobile rating screen: single score, 3 Yes/No radios, comment; app theme
- [ ] Rolling `Tenant.vendor_rating` updated on submit
- [ ] Submission immutable; duplicate rejected
- [ ] Tenant aggregate (avg + count) shown in Join Tenant flow
- [ ] Tenant Super Admin / Tenant Admin can view incoming ratings in admin portal
- [ ] Tests for AC-1…AC-8 — see [VRS-02 TDD catalog](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vendor Rating System | Phase: 2 | 8 SP | Status: Pending | Last Updated: 2026-09-17*
