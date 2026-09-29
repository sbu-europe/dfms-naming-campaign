---
module: sprint-7
specification: VM-09 — Vendors Profile — TP & TDO Read-Only Vendor List — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: VM-09
source_spec: ../../../../03-backlog/phase-1/sprints/sprint-7/02-vendor-management/VM-09-vendors-profile-readonly-tp-tdo.md
last_updated: 2026-07-30
last_mcp_run: 2026-07-30
last_mcp_verdict: 12/12 Pass
artifacts: tests/e2e/playwright-mcp/vm-09-vendors-profile-readonly-tp-tdo-artifacts/
playwright_mcp: true
---

# Sprint 7 — VM-09 — Vendors Profile (TP & TDO read-only) — E2E Scenario Plan (Django Admin SSR)

> **2026-07-30 — All 12 test cases passed** (TC01–TC12). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-07-30 · **12/12 Pass** · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/vm-09-vendors-profile-readonly-tp-tdo-artifacts/RESULTS.md)  
**Accounts:** `transport.planner1`, `tdo.vendor.fleet1`, `admin.nourish` (`.nourish@yopmail.com`)  
**Seed:** `make seed-vendor-approval-pw RUN_ID=A09F30A1` + `make seed-vendor-approval-gaps`

**Story:** [VM-09](../../../../03-backlog/phase-1/sprints/sprint-7/02-vendor-management/VM-09-vendors-profile-readonly-tp-tdo.md)  
**Surface:** Tenant **Vendors** portal hub (`/vendors/`) — admin shell SSR + Alpine (`templates/admin/vendors/index.html`), not Platform `PlatformVendor` changelist.

**AC (assert after VM-09 implementation):**

1. **Transport Planner (TP)** and **TDO (Vendor Fleet)** can open the Vendor List, view details & **Join status** / platform status, and **search** / **filter**.
2. TP and TDO **cannot** create, edit, approve, reject, suspend, reactivate, or delete vendors — management actions **hidden/disabled** in UI; mutating APIs return **403**.
3. **Tenant Admin** vendor management path remains unchanged.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites (before TC01)

Under tenant **nourish**, ensure at least one membership row per join status (reuse seed / `make seed-vendor-approval-pw` or wipe-friendly `MCP-VM09-` fixtures):

| Alias | Join status | Notes |
|-------|-------------|--------|
| **V-PENDING** | `pending` | Visible under filter **Pending**; detail shows approve/reject for Tenant Admin only |
| **V-APPROVED** | `approved` | Prefer contractual; company name / `vendor_code` known for search |
| **V-SUSPENDED** | `suspended` | Optional but preferred for filter + reactivate UI asserts |
| **V-REJECTED** | `rejected` | Optional for filter **Rejected** |

Wipe prefix if creating fixtures: `MCP-VM09-` / `MCP ` / `mcp.join.` via `make wipe-vendor-approval-pw RUN_ID=…`.

---

## A — Access (AC-1)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | TP opens Vendor List via menu | As **Transport Planner** (`transport.planner1.nourish@yopmail.com`), log in at `/admin/login/`, set working site if prompted. Assert sidebar **Vendors → Vendors** (or navigate `/vendors/`). Assert page title/heading **Vendors**, `#result_list` / `#vm-vendors-tbody` loads without redirect to `/admin/`, and at least one vendor row or empty-state **No vendors found.** is shown. | P0 | Pass |
| TC02 | TDO opens Vendor List via menu | As **TDO Vendor Fleet** (`tdo.vendor.fleet1.nourish@yopmail.com`), log in and open `/vendors/` (or **Vendors** menu). Assert same hub loads with table/search/filter chrome; no permission bounce to home. | P0 | Pass |

## B — View list & details (AC-1)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | TP list shows status columns | As **TP** on `/vendors/`, with status filter **All**, assert table headers include **Vendor Code**, **Company Name**, **Join status**, **Platform account**, **Type**. Locate **V-APPROVED** (or any approved row) and assert **Join status** badge text **Approved** (and type badge if set). | P0 | Pass |
| TC04 | TP opens Vendor details read-only | As **TP**, click an approved row (**V-APPROVED**). Assert **Vendor details** dialog opens with company name, vendor code, **Join status** badge, **Contact** fields, and **Compliance documents** section (or **No documents uploaded.**). Assert footer has **Close**; assert **Save changes**, **Approve — Contractual**, **Approve — Non-Contractual**, **Reject**, **Suspend for this tenant**, and **Reactivate for this tenant** are **absent**. Close the dialog. | P0 | Pass |
| TC05 | TDO opens pending detail without actions | As **TDO**, open **V-PENDING** row. Assert **Vendor details** shows **Pending** status and contact/docs. Assert detail action buttons **Approve — Contractual**, **Approve — Non-Contractual**, and **Reject** are **absent**; only **Close** (or equivalent non-mutating control) remains. | P0 | Pass |

## C — Search & filter (AC-1 / FR)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | TP search by company / code | As **TP** on `/vendors/`, enter a distinctive fragment of **V-APPROVED** `company_name` or `vendor_code` in **Search…** (`#searchbar`), submit **Search**. Assert result count updates and the matching row is visible; unrelated vendors are absent (or fewer results). Clear search and assert broader list returns. | P0 | Pass |
| TC07 | TP filter By status | As **TP**, in `#changelist-filter` under **By status**, click **Pending**. Assert only pending rows (or empty). Click **Approved**, then **Suspended** (if **V-SUSPENDED** exists), then **All**. Assert selected filter state and row statuses match. | P1 | Pass |

## D — Read-only UI enforcement (AC-2)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | TP bulk toolbar actions hidden | As **TP** on `/vendors/` with **Pending** filter and at least one selectable pending row: if row checkboxes are hidden for read-only roles, assert no `#action-toggle` / `.action-select` selection path. If checkboxes remain visible, select a pending row and assert bulk **Approve — Contractual**, **Approve — Non-Contractual**, **Reject**, **Suspend**, and **Reactivate** are **not** shown (`x-show` / absent from `#dfms-selection-toolbar`). | P0 | Pass |
| TC09 | TDO cannot edit approved vendor fields | As **TDO**, open **V-APPROVED** detail. Assert contact fields are not editable inputs (read-only text / disabled inputs) **or** that **Save changes** is absent so edits cannot persist. Assert **Suspend for this tenant** is absent. | P0 | Pass |

## E — Server-side guards (AC-2 / VM-09-4)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | TP approve API blocked | As **TP** (authenticated session / portal JWT from `/vendors/`), from the page context `fetch` `POST /api/v1/tenant/vendors/join-requests/{V-PENDING.id}/approve/` with body `{"vendor_type":"non_contractual"}`. Assert response **403** (or equivalent permission denial). Reload list and assert **V-PENDING** still **Pending**. | P0 | Pass |
| TC11 | TDO patch / suspend APIs blocked | As **TDO**, `fetch` `PATCH /api/v1/tenant/vendors/{V-APPROVED.id}/` with a harmless company_name change, and `POST .../suspend/`. Assert both return **403**. Reload and assert join status still **Approved** and company name unchanged. | P0 | Pass |

## F — Tenant Admin path unchanged (VM-09-5)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC12 | Tenant Admin still manages vendors | As **Tenant Admin** (`admin.nourish@yopmail.com`), open `/vendors/`, open **V-PENDING**. Assert **Approve — Contractual**, **Approve — Non-Contractual**, and **Reject** are visible. Open **V-APPROVED** and assert **Suspend for this tenant** and **Save changes** are visible. Do **not** mutate production seed rows unless using wipe-friendly `MCP-VM09-` fixtures. | P0 | Pass |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-07-30 | **12/12** | All test cases passed (Playwright MCP). Seed `A09F30A1` + approval-gaps. |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: tenant Vendors hub `/vendors/` for **TP** and **TDO (Vendor Fleet)** read access + mutation denial; Tenant Admin contrast.
- Out of scope: Platform Admin `/admin/vendors/platformvendor/`; Vendor Mobile self-service; bidding / TO assignment; changing Tenant Admin approve/reject/suspend workflows beyond “still available”; column **sort** UI (FR lists sort — **not implemented** on this page; list is API-ordered by `-decided_at`, `-created_at` only).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| TP | `transport.planner1.nourish@yopmail.com` / `Nourish@1234!` |
| TDO | `tdo.vendor.fleet1.nourish@yopmail.com` / `Nourish@1234!` |
| Tenant Admin | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |

### URLs, APIs & selectors

| Item | Value |
|------|--------|
| Hub | `/vendors/` (`vendors_page` → `admin/vendors/index.html`) |
| List API | `GET /api/v1/tenant/vendors/?status=all\|pending\|approved\|suspended\|rejected&q=` |
| Detail API | `GET /api/v1/tenant/vendors/{membership_id}/` |
| Mutating APIs (admin-only) | `POST .../join-requests/{id}/approve\|reject/`, bulk approve/reject/suspend/reactivate, `PATCH .../{id}/`, `POST .../{id}/suspend\|reactivate/` |
| Search | `#searchbar`, submit **Search** (prefer type + Enter so Alpine `x-model` syncs) |
| Filter | `#changelist-filter` → **By status** links (**All**, **Pending**, **Approved**, **Suspended**, **Rejected**) |
| Table | `#result_list`, `#vm-vendors-tbody`, row `.vm-row-link` |
| Detail dialog | `.vm-dialog` containing **Vendor details** (not the Reject dialog) |
| Bulk toolbar | `#dfms-selection-toolbar` — **Approve — Contractual**, **Approve — Non-Contractual**, **Reject**, **Suspend**, **Reactivate** |

### Known implementation alignment

| Story expectation | Code |
|-------------------|------|
| Grant `Menu.Vendors.View` to `transport_planner` and `tdo_vendor_fleet` | Seeded in `role_seed_data` — re-run `seed_dfms_rbac` on existing envs |
| Hide management actions for non–Tenant Admin | `can_manage_vendors` from `vendors_page` gates Alpine UI |
| Server-side block on mutations | `IsTenantAdmin` on approve/reject/suspend/reactivate/bulk/PATCH |
| Search / filter | Implemented (`q` + status filter) |
| Sort | No column-sort UI — not asserted |

### Suggested next step

Optional wipe: `make wipe-vendor-approval-pw RUN_ID=A09F30A1`.
