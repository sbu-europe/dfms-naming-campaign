---
module: sprint-7
specification: FB-007 — Helpers delete should match other master data — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-007
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
implementation_reference:
  - ../../../../../apps/users/admin.py (HelperAdmin)
  - ../../../../../apps/master_data/admin.py (MasterEntityHardDeleteAdminMixin)
  - ../../../../../apps/master_data/deletion.py
  - ../../../../../templates/admin/master_data/delete_confirmation.html
  - ../../../../../DFMS-product-context/05-modules/02-master-data/master-data-delete-operations.md
last_updated: 2026-07-30
last_mcp_run: 2026-07-30
last_mcp_verdict: 6/6 Pass
artifacts: tests/e2e/playwright-mcp/fb-007-helpers-delete-match-master-data-artifacts/
playwright_mcp: true
---

# Sprint 7 — FB-007 — Helpers: delete should match other master data — E2E Scenario Plan (Django Admin SSR)

> **2026-07-30 — All 6 test cases passed** (TC01–TC06). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-30 · **6/6 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fb-007-helpers-delete-match-master-data-artifacts/RESULTS.md)  
**Accounts:** `admin.nourish@yopmail.com`

**Feedback:** [FB-007](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-007--helpers--delete-should-match-other-master-data)

**AC (assert after fix):**

1. Helper **delete** SHALL be functional and behave like other master-data delete (hard delete when zero deps + mandatory reason + audit).
2. When the helper has operational dependencies (e.g. Transport Order / Trip), hard delete SHALL be **blocked** with a friendly message; use **Inactive** instead.
3. Soft lifecycle remains **Edit → uncheck Is active? → Save** (not the Delete action).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

**SSOT:** [`master-data-delete-operations.md`](../../../../05-modules/02-master-data/master-data-delete-operations.md) — Soft delete = Inactive; Hard delete = Delete + reason when no deps.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Tenant Admin** (`admin.nourish@yopmail.com`) — Helper add / change / delete |
| Wipe prefix | `MCP7*` / `MCP FB007` (DB `employee_id` is **varchar(20)** — use short ids e.g. `MCP7I-<RUN_ID>`) |
| Unique ids | Use `RUN_ID` in `employee_id`, `full_name`, `contact_number` so rows never collide with seed helpers |
| Unused helper | Create via **Add helper** with no TO/Trip assignment (for hard-delete happy path) |
| In-use helper | Suite prep: create `MCP7U-<RUN_ID>` and `to.helpers.add(helper)` on any TransportOrder before TC04 |

---

## A — Soft lifecycle (not Delete)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Soft lifecycle via Inactive | As **Tenant Admin** (`admin.nourish@yopmail.com` / `NourishAdmin@1234!`), log in at `/admin/login/`, open **Master Data → Helpers** (`/admin/users/helper/`). **Add** helper `employee_id=MCP7I-<RUN_ID>`, unique name/contact, **Is active?** checked → Save. Re-open the change form, **uncheck Is active?**, Save. Assert changelist still shows the row as inactive (not removed). | P0 | Pass |

## B — Hard delete happy path (parity with other masters)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | Delete confirmation requires reason | As **Tenant Admin**, create unused helper `employee_id=MCP7D-<RUN_ID>` (no TO/Trip). Open its change form → click **Delete**. Assert confirmation page matches other masters: **Delete reason** field present. Leave reason blank → confirm → assert delete blocked and helper still on list. | P0 | Pass |
| TC03 | Unused helper hard-deletes with reason | Still as **Tenant Admin**, on the same unused helper, open **Delete**, enter a non-empty delete reason, confirm. Assert SUCCESS permanently deleted. Assert search for that `employee_id` shows **0** results. | P0 | Pass |

## C — Hard delete blocked by dependencies

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Hard delete blocked when helper on TO | As **Tenant Admin**, ensure helper `MCP7U-<RUN_ID>` is on a Transport Order. Open change form → **Delete**. Assert hard delete **blocked** (ERROR citing transport orders). Assert helper still exists. | P0 | Pass |
| TC05 | In-use helper can still be deactivated | On the same in-use helper, **Edit** → uncheck **Is active?** → Save. Assert Inactive. Assert Delete remains blocked while deps exist. | P1 | Pass |

## D — UX parity smoke

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Delete UX matches Vehicle pattern | As **Tenant Admin**, open a Vehicle delete path and a Helper delete path; assert shared hard-delete UX (delete-reason field and/or deps block message). | P2 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-30 | **6/6** | All test cases passed (Playwright MCP). RUN_ID=`FB007A01`. |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin Helper delete / deactivate at `/admin/users/helper/`; dependency block vs TO/Trip; delete-reason confirmation; parity with `MasterEntityHardDeleteAdminMixin`.
- Out of scope: REST `HelperViewSet` destroy; Driver hard-delete; Audit Log UI detail for reason (optional follow-up).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Helpers changelist | `/admin/users/helper/` |
| Helper delete | `/admin/users/helper/<uuid>/delete/` |
| Delete reason | `#id_delete_reason` |
| Confirm | `#content form input[type="submit"]` (not sidebar dropdown submits) |
| Is active | `#id_is_active` |

### Known implementation alignment (post-fix)

- `HelperAdmin` mixes in `MasterEntityHardDeleteAdminMixin`; soft-`deleted_at` Admin overrides removed.
- Bulk: `delete_selected` removed; `delete_permanently` action available.
- Legacy soft-deleted rows still hidden via `get_queryset` (`deleted_at__isnull=True`).

### Suggested artifacts

`tests/e2e/playwright-mcp/fb-007-helpers-delete-match-master-data-artifacts/` + `run-fb007.js`.
