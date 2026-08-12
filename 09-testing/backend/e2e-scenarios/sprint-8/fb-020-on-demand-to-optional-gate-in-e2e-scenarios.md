---
module: sprint-8
specification: FB-020 — On-Demand TO create optional Gate-in date/time (Option A) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-020, GT-02, GT-01
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/07-gate-operations.md
implementation_reference:
  - ../../../../../apps/operations/gate/admin.py (GateOnDemandTORequestAdmin)
  - ../../../../../apps/operations/gate/forms.py (GateOnDemandTOAdminForm)
  - ../../../../../apps/operations/gate/gate_services.py (create_on_demand_to / gate_in_on_demand_to / orchestrator)
  - ../../../../../templates/admin/operations/gateondemandtorequest/change_form.html
last_updated: 2026-08-09
last_mcp_run: ~
last_mcp_verdict: ~
artifacts: tests/e2e/playwright-mcp/fb-020-on-demand-to-optional-gate-in-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-020 — On-Demand TO optional Gate-in date/time — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-020](../../../../03-backlog/sprints/sprint-8/improvements/07-gate-operations.md#fb-020--on-demand-to-create--optional-gate-in-datetime-option-a)

**Story:** [GT-02](../../../../03-backlog/sprints/sprint-4/04-gate/GT-02-on-demand-to-creation-gate.md)

**AC (assert after FB-020 impl):**

1. On-Demand TO **Add** shows optional **Gate-in date/time** (default empty).
2. Submit **without** datetime → TO status **`created`**; no gate visit / gate-in; success message TO-created only.
3. Submit **with** datetime → gate-in at that time; dealer FG → **`at_source`**; supplier RM → **`at_destination`**; success message includes gate-in.
4. After create **without** gate-in, On-Demand change view shows editable **Gate-in date/time** + **Record Gate-In** (Option B). After gate-in (or create-with-gate-in), change view is read-only.
5. Deferred dealer FG gate-in → TO status **`at_source`**.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Pre-impl note:** Until FB-020 ships, create always gate-ins with `now()`. TCs below are **Planned** against the Option A AC; run after service/admin changes land.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor | **Gateman** `gateman1.nourish@yopmail.com` (password `Nourish@1234!`) — needs On-Demand dealer + supplier write. Fallback: **POI Admin** `poi.admin1.nourish@yopmail.com` with scoped gate POI. |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Gate POI | Actor’s scoped / selectable **Gate POI** on the Add form |
| Dealer path | Active **Dealer**; active **Finished Goods** product for product lines |
| Supplier path | Active **Supplier**; active **Raw Material** product for product lines |
| Unique data | Prefix docs / plates with `MCP-FB020-<RUN_ID>-…` for wipe friendliness |
| Wipe | Prefer MCP-prefixed dealers/products already seeded; do not leave open yard visits for reuse — use unique plates per create |

---

## A — Field presence (Add form)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gate-in date/time field present and optional | As **Gateman**, open **Gate → On-Demand TO → Add** (`/admin/operations/gateondemandtorequest/add/`). Assert a **Gate-in date/time** (or equivalent label) control is visible, empty by default, and the form can be submitted without filling it (no HTML `required` / client block solely for this field). | P0 | Planned |

## B — Create without gate-in (TO stays `created`)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | Dealer FG — blank datetime → Created, no gate-in | As **Gateman**, on On-Demand TO Add: set **Product** = **Finished Goods**, fill **Gate POI**, **Document number** (`MCP-FB020-<RUN_ID>-DO`), **Dealer**, ≥1 product line (qty &gt; 0), **Driver name/contact**, **Vehicle registration** (`MCPFB0201`), leave **Gate-in date/time** empty, save. Assert success message like **On-demand TO … created.** (not “gate-in recorded”). Open the created TO (from message / request detail **Transport order** link). Assert **TO Status** / status display is **Created** (`created`). Assert no active gate visit for that plate at the POI (or request detail shows no visit / gate-in). | P0 | Planned |
| TC03 | Supplier RM — blank datetime → Created, no gate-in | Same as TC02 with **Product** = **Raw Material**, **Supplier** + PO document `MCP-FB020-<RUN_ID>-PO`, unique plate `MCPFB0202`. Assert TO **Created**; no gate-in / visit linked on the On-Demand request detail. | P0 | Planned |

## C — Create with gate-in (status advances)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Dealer FG — filled datetime → At Source + gate-in | As **Gateman**, create On-Demand dealer FG TO as in TC02 with unique plate `MCPFB0203`, fill **Gate-in date/time** with a valid past/now datetime, save. Assert success mentions **gate-in recorded**. Assert TO status **At Source** (`at_source`). On On-Demand request detail, assert **Transport order** and **gate visit** / gate-in context present; if gate-in time is shown, it matches the submitted value (timezone-tolerant). | P0 | Planned |
| TC05 | Supplier RM — filled datetime → At Destination + gate-in | Same as TC04 for supplier RM path, plate `MCPFB0204`. Assert TO status **At Destination** (`at_destination`) and gate-in recorded. | P0 | Planned |

## D — Deferred gate-in on change (Option B)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Created-only request can record gate-in on change | After TC02 (TO still `created`), open the **On-Demand TO Request** change page. Assert editable **Gate-in date/time** and **Record Gate-In** submit. Fill datetime, save. Assert success mentions gate-in; TO status **At Source** (`at_source`); visit linked on the request. | P0 | Planned |
| TC06b | Already gated request has no deferred gate-in | After TC04 (already gated), open On-Demand change. Assert no editable gate-in / no **Record Gate-In** button (read-only). | P1 | Planned |

## E — Messaging & list smoke

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Changelist shows new request after TO-only create | After TC02, open On-Demand TO changelist (`/admin/operations/gateondemandtorequest/`). Assert the new document number / TO appears in `#result_list`. | P1 | Planned |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Not run — waiting on FB-020 implementation |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: On-Demand TO **Add** optional gate-in datetime; deferred gate-in on change (Option B); TO status and gate-in presence for dealer FG + supplier RM.
- Out of scope: REST `gate_in_at` API contract; loading / QC / scale / gate-out after create; changing supplier target status to `at_source`; normal Gate-In picker for `source=GATE`.

### Admin URLs & selectors

| Item | Value |
|------|--------|
| On-Demand Add | `/admin/operations/gateondemandtorequest/add/` |
| On-Demand changelist | `/admin/operations/gateondemandtorequest/` |
| Portal nav | Gate → **On-Demand TO** |
| Product type | `#id_product_type` (Finished Goods / Raw Material) |
| Gate POI | `#id_gate_poi` |
| Document | `#id_document_number` |
| Dealer / Supplier | `#id_dealer` / `#id_supplier` (autocomplete) |
| Vehicle | `#id_vehicle_registration` |
| Gate-in datetime (post-impl) | `#id_gate_in_at` (confirm label/id after admin fieldset land) |
| Product lines | `#gate-on-demand-lines` · `.dynamic-lines` |
| Save | default admin Save (`_save`) |
| Messages | `.messagelist` |
| TO detail (cross-check) | `/admin/transport/transportorder/<uuid>/change/` — assert status badge / field |

### Status assertion note

- UI may show **Created** / **At Source** / **At Destination**; persist enums are `created`, `at_source`, `at_destination`.
- Supplier with gate-in → **`at_destination`** (existing `GATE_IN_SUCCESS_TO_STATUS`), not `at_source`.

### Known story ↔ code alignment

- Pre-FB-020: `create_on_demand_to_and_gate_in` always gate-ins → TC02/TC03 will **fail** until Option A ships.
- Post-FB-020: empty `gate_in_at` → TO-only; filled → `create_gate_in(..., gate_in_at=…)` + status advance.
- Help text on Add template currently says create TO and gate-in “in one step” — update copy when implementing FB-020-2 so it matches optional behaviour.

### Suggested next step

1. Implement FB-020-1…4 per [07-gate-operations.md](../../../../03-backlog/sprints/sprint-8/improvements/07-gate-operations.md#fb-020--on-demand-to-create--optional-gate-in-datetime-option-a).  
2. Run this plan via Playwright MCP; write `tests/e2e/playwright-mcp/fb-020-on-demand-to-optional-gate-in-artifacts/RESULTS.md`.  
3. Mark TC Status Pass/Fail and update this file’s MCP run history.
