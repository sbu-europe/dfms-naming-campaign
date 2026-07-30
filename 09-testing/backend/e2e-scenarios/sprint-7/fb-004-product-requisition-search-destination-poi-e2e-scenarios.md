---
module: sprint-7
specification: FB-004 — Product Requisition list search includes destination POI — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-004
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
last_updated: 2026-07-30
playwright_mcp: true
---

# Sprint 7 — FB-004 — Product Requisition list: search by destination POI — E2E Scenario Plan (Django Admin SSR)

**Feedback:** [FB-004](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-004--product-requisition-list--search-should-include-destination-poi)

**AC (assert after fix):**

1. On the Finished Goods **Product Requisition** changelist, the admin search box SHALL match **destination POI** in addition to **PR number**.
2. Searching by POI **name** and/or **poi_code** (as shown in the Destination POI column) returns matching PRs.

**Current code (pre-fix):** `ProductRequisitionAdmin.search_fields = ("pr_number", "requester_name")` — no `destination_poi__*` lookups. (`requester_name` is already searchable; feedback wording “PR number only” is slightly incomplete.)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites (before TC01)

Prefer wipe-friendly `MCP-` fixtures under tenant **nourish**. Destination POI must appear distinctly in list column `__str__`: `{name} ({poi_code})`.

| Alias | Fields (minimum) |
|-------|------------------|
| **POI-A** | Active POI with unique searchable name + code, e.g. name `MCP FB004 Dest Alpha`, `poi_code` `MCP-FB004-A` |
| **POI-B** | Active POI with different name/code, e.g. name `MCP FB004 Dest Beta`, `poi_code` `MCP-FB004-B` |
| **PR-A** | FG `ProductRequisition` with `destination_poi` = **POI-A**, known `pr_number` (or discoverable after create), status visible to actor (for Distribution Officer: not draft-only queue — prefer `submitted` / in queue statuses) |
| **PR-B** | FG PR with `destination_poi` = **POI-B**, distinct `pr_number` |

Wipe prefix: `MCP-FB004-` / `MCP FB004`.

If seeding via admin is heavy, reuse two existing PRs whose destination POIs have distinct names/codes and record them in RESULTS.md.

---

## A — Search by destination POI

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Search by destination POI name returns PR | As **Distribution Officer** (`distribution.officer1.nourish@yopmail.com`), log in at `/admin/login/`, set working site if prompted, open **Requisition → Finished Goods → Product Requisitions** (`/admin/requisitions/productrequisition/`). In the changelist search box (`#searchbar` / `input[name="q"]`), enter a distinctive substring of **POI-A** name (e.g. `MCP FB004 Dest Alpha` or `FB004 Dest Alpha`). Submit search. Assert `#result_list` contains **PR-A** (by `pr_number` or Destination POI cell showing **POI-A**). Assert **PR-B** is not shown (unless its POI name also matches the query). | P0 | Planned |
| TC02 | Search by destination POI code returns PR | On the same changelist, search for **POI-A** `poi_code` (e.g. `MCP-FB004-A`). Assert **PR-A** appears in results with Destination POI matching **POI-A**. | P0 | Planned |
| TC03 | Search by PR number still works | Search for the exact (or unique prefix of) **PR-A** `pr_number`. Assert **PR-A** is returned. Confirms FB-004 does not regress PR-number search. | P0 | Planned |

## B — Negative / isolation

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Unrelated POI query excludes PR-A | Search for a string unique to **POI-B** only (name or code). Assert **PR-B** appears and **PR-A** does not. | P1 | Planned |
| TC05 | Nonsense query returns empty | Search for a string that matches no PR number, requester name, or destination POI (e.g. `MCP-FB004-ZZZZ-NOMATCH`). Assert empty results / “0 product requisitions” (or equivalent empty changelist message) and no **PR-A**/**PR-B** rows. | P1 | Planned |

## C — Cross-role (optional smoke)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Depot Officer can search own PRs by destination POI | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), open the Product Requisition changelist. Ensure at least one of **their** PRs has destination **POI-A** (create/submit if needed, or use an existing owned PR). Search by **POI-A** name. Assert that owned PR appears. (Scoped queryset: requesters only see own PRs — do not assert other users’ PRs.) | P1 | Planned |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: FG Product Requisition **changelist search** (`admin:requisitions_productrequisition_changelist`) matching destination POI (name and/or code) plus existing PR number behaviour.
- Out of scope: Port Shipment changelist search; Transport Requisition search; status filters (FB-005); creating/editing PR fields beyond seed setup; API `search_fields`.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `distribution.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Secondary actor | `depot.officer1.nourish@yopmail.com` / `Nourish@1234!` (TC06) |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| FG PR changelist | `/admin/requisitions/productrequisition/` |
| Search input | `#searchbar` or `input[name="q"]` |
| Results table | `#result_list` |
| Destination column | cell under **Destination poi** / `field-destination_poi` (Django FK column) |

### Expected implementation alignment

- Likely fix: extend `ProductRequisitionAdmin.search_fields` with `destination_poi__name` and `destination_poi__poi_code` (Django admin OR + `icontains`).
- List column already shows `POI.__str__` → `{name} ({poi_code})`.
- DO queryset filters to queue-visible statuses (`PR_QUEUE_VISIBLE_STATUSES`); seed **PR-A**/**PR-B** accordingly for TC01–TC05.
- Unit alternative (not this plan): assert `ModelAdmin.get_search_results` includes destination POI matches.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Not run yet (scenarios planned; fix Open). |
