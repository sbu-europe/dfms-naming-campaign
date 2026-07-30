---
module: sprint-7
specification: FB-003 — Bay Assignment add TO details — product line-item breakdown & allocated qty unit — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-003
source_spec: ../../../../03-backlog/sprints/sprint-7/feedback.md
last_updated: 2026-07-30
playwright_mcp: true
---

# Sprint 7 — FB-003 — Bay Assignment add: TO details (product lines & allocated qty unit) — E2E Scenario Plan (Django Admin SSR)

**Feedback:** [FB-003](../../../../03-backlog/sprints/sprint-7/feedback.md#fb-003--bay-assignment-add--to-details-missing-product-line-item-breakdown--allocated-qty-unit)

**AC (assert after fix):**

1. On Bay Assignment **add**, when a Transport Order (TO) is selected, the **TO details** panel shows the **product line-item breakdown**.
2. **Allocated qty** in that panel displays **with its unit** (not a bare number).

**Reference UI (same visit / TO context elsewhere):** Loading / Unloading start forms already render TO summary + **Product Lines** (`apps/operations/loading/admin.py` → `_build_to_details_panel`). Bay Assignment add should expose equivalent line-item visibility in `#cc-to-details-panel`.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites (before TC01)

Need at least one **bay-assignable** Command Center queue entry whose TO has line items. Prefer wipe-friendly `MCP-` fixtures under tenant **nourish**.

| Alias | Fields (minimum) |
|-------|------------------|
| **TO-MULTI** | Active in-yard TO with ≥2 `TOLineItem` rows (distinct products / allocated qty + UOM). Known `to_number` e.g. `MCP-FB003-TO-M` |
| **TO-SINGLE** | Same flow, exactly 1 product line; known `to_number` e.g. `MCP-FB003-TO-S` |
| **TO-EMPTY** | Bay-assignable TO with **zero** `TOLineItem` rows (edge); or skip TC06 if seed cannot create this safely |
| **QE-MULTI** / **QE-SINGLE** | `QueueEntry` in assignable CC queue for each TO (waiting or assigned-for-additional-point per CC rules), vehicle/token visible in **Select TO** label |
| **LUP** | In-scope loading or unloading point for the actor’s POI (needed only if a case continues to save; FB-003 cases stop at panel assert) |

**Select TO** option text shape (existing): `{to_number} — {vehicle} — {token}` (± serial).

Wipe prefix: `MCP-FB003-` / `MCP FB003`.

---

## A — Product line-item breakdown on TO select

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | TO details shows product line breakdown after select | As **Command Center Officer** (`command.center.officer1.nourish@yopmail.com`), log in at `/admin/login/`, set working site if prompted, open **Bay Assignment → Add** (`/admin/operations/bayassignment/add/`). Under **Select TO**, choose **QE-MULTI** / **TO-MULTI** in `#id_queue_entry`. Wait for `#cc-to-details-panel` to finish loading (not the “Loading transport order details…” placeholder). Assert the panel contains a **Product Lines** (or equivalent product line-item) section listing each TO line with product identity and allocated quantity (and UOM column or unit beside qty). Assert at least two distinct product rows for **TO-MULTI**. Do not require **Save assignments**. | P0 | Planned |
| TC02 | Deep-link from CC queue preloads TO details with lines | From **Command Center → Queue**, open **Assign Loading/Unloading Point** for **QE-MULTI** (URL `/admin/operations/bayassignment/add/?queue_entry=<uuid>`). Assert `#id_queue_entry` is pre-selected and `#cc-to-details-panel` shows the same product line-item breakdown as TC01 for **TO-MULTI** (no second manual select required beyond auto-change handler). | P0 | Planned |
| TC03 | Single-line TO still shows breakdown | On Bay Assignment add, select **QE-SINGLE** / **TO-SINGLE**. Assert **Product Lines** shows exactly one data row for that TO’s product and allocated qty. | P1 | Planned |
| TC04 | Changing TO refreshes line breakdown | On the same add form, select **QE-MULTI**, capture product labels in the panel, then change `#id_queue_entry` to **QE-SINGLE**. Assert panel updates to **TO-SINGLE** lines only (previous multi-line products no longer listed; TO number row matches **TO-SINGLE**). | P1 | Planned |
| TC05 | Empty product lines messaging | If **TO-EMPTY** / assignable queue entry is available: select it and assert `#cc-to-details-panel` shows an explicit empty state (e.g. help text that no product lines exist) and does **not** render a misleading populated product table. Skip with note if seed cannot provide a zero-line TO. | P2 | Planned |

## B — Allocated quantity with unit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Allocated qty row includes unit | As Command Center Officer on Bay Assignment add, select **QE-SINGLE** (or **QE-MULTI**). In `#cc-to-details-panel`, locate the **Allocated qty** (or **Allocated Qty**) summary row. Assert the value cell is **not** a bare number only — it includes a **unit** (align with Loading panel pattern: quantity + `MT`, or the TO’s quantity UOM if the fix uses a dynamic unit). Example shape: `{formatted_qty} MT`. | P0 | Planned |
| TC07 | Allocated qty unit visible via deep-link | Open add with `?queue_entry=` for **QE-SINGLE**. Assert the **Allocated qty** summary value includes the unit without changing the TO dropdown manually. | P1 | Planned |

## C — Panel baseline (no selection)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Placeholder before TO select | Open `/admin/operations/bayassignment/add/` with **no** `queue_entry` query and leave **Select TO** blank. Assert `#cc-to-details-panel` shows the help placeholder to select a transport order, and does **not** show a **Product Lines** table or a numeric **Allocated qty** for a real TO. | P1 | Planned |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Bay Assignment **add** only — `#cc-to-details-panel` content after `#id_queue_entry` change / deep-link; product line-item breakdown; allocated qty + unit.
- Out of scope: Saving LUP assignments; LUP traffic panel; Loading/Unload event forms (reference only); CC queue list columns; API.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Actor | `command.center.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` (`command_center_officer_1`) |

### Admin URLs & selectors

| Surface | Path / selector |
|---------|-----------------|
| Bay Assignment add | `/admin/operations/bayassignment/add/` |
| Deep-link | `/admin/operations/bayassignment/add/?queue_entry=<uuid>` |
| Select TO | `#id_queue_entry` (fieldset **Select TO**) |
| TO details panel | `#cc-to-details-panel` |
| Details AJAX | `admin:operations_bayassignment_queue_entry_details` → `/admin/operations/bayassignment/queue-entry-details/<uuid>/` |
| Config | `#cc-queue-entry-config` (`data-url-template`) |
| JS | `static/admin/js/cc_queue_entry_details.js` (loads panel on change) |

### Known implementation drift (pre-FB-003)

- Panel HTML is built in `apps/operations/command_center/admin_assignment_details.py` → `build_cc_assignment_to_details_html`.
- Today: summary includes **Allocated qty** via `format_qty(to.allocated_quantity)` **without** a unit suffix; **no** product line-item / **Product Lines** table.
- Loading reference already has `Allocated Qty (TO)` as `{qty} MT` and a **Product Lines** table (`#`, Product, Category, Packing, Alloc. Qty, UOM).
- FB-003 is **Open** in `feedback.md`; run these cases after the fix lands (or expect FAIL until then). Prefer asserting against the implemented labels/columns once FB-003-1 / FB-003-2 ship — update this plan’s wording if the fix uses different heading text than Loading’s **Product Lines**.

### Status

All cases **Planned** until first Playwright MCP suite run; then update Status column and MCP run history.
