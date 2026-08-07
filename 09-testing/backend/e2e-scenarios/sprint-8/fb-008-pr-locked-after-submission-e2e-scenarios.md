---
module: sprint-8
specification: FB-008 — PR locked from edit by Depot / Feed Mill / Commercial Officers after submission — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-008, PR-01, PR-02
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/03-product-requisition.md
implementation_reference:
  - ../../../../../apps/requisitions/admin.py (_PRBaseAdmin.get_readonly_fields, PRLineItemInline, ProductRequisitionAdmin, PortShipmentAdmin)
  - ../../../../../templates/admin/requisitions/productrequisition/change_form.html
  - ../../../../../templates/admin/requisitions/portshipmentproxy/change_form.html
  - ../../../../../apps/requisitions/role_access.py
last_updated: 2026-08-07
playwright_mcp: true
---

# Sprint 8 — FB-008 — PR / Port Shipment locked after submission — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-008](../../../../03-backlog/sprints/sprint-8/improvements/03-product-requisition.md#fb-008--pr-locked-from-edit-by-depot--feed-mill--commercial-officers-after-submission)

**AC (assert after fix):**

1. After an FG Product Requisition is **submitted**, **Depot Officer** and **Feed Mill Officer** SHALL NOT update or modify any PR field (including **Urgency** and line items) — view-only.
2. After a Port Shipment is **submitted**, **Commercial Officer** SHALL NOT update or modify the record (including **Urgency** and RM cargo line items) — view-only.
3. Change form SHALL hide edit affordances (**Save Changes** / editable widgets) for these roles on submitted records; **Cancel Requisition** (FG, existing cancel-before-TR policy) remains separate from field edit.
4. **Draft** records remain editable by the owning requester role (unchanged).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actors | **Depot Officer** `depot.officer1.nourish@yopmail.com` · **Feed Mill Officer** `feed.mill.officer1.nourish@yopmail.com` · **Commercial Officer** `commercial.officer1.nourish@yopmail.com` — password `Nourish@1234!` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Wipe prefix | `MCP-FB008-` / `RUN_ID` in remarks / vessel / special instructions where helpful |
| FG PR | Own Draft + own Submitted FG PR for depot (and one Submitted for feed mill). Use existing seed PRs or create via admin: **Save as Draft** then **Submit Requisition**. Submitted PR must have ≥1 line item. Prefer status `submitted` with **no** active TRs for cancel TC. |
| Port Shipment | Own Draft + own Submitted Port Shipment for commercial officer (≥1 RM cargo line). Create via **Port Shipments** → **Save as Draft** / **Submit Shipment**. |
| Working site | Set if prompted after login |

---

## A — FG Product Requisition (Depot / Feed Mill)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Draft FG PR still editable (Depot) | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), log in at `/admin/login/`, open **Requisition → Finished Goods → Product Requisitions** (`/admin/requisitions/productrequisition/`). Open (or create) a **Draft** own PR. Assert **Save as Draft** and **Submit Requisition** are visible; assert **Urgency** is an editable select (not `readonly`); assert line-item inline allows editing quantity (or add row) when Draft. | P0 | Planned |
| TC02 | Submitted FG PR — no Save Changes; Urgency locked (Depot) | Still as Depot Officer, open a **Submitted** own FG PR change form. Assert **Save Changes** is **not** present. Assert **Save as Draft** / **Submit Requisition** are absent. Assert **Urgency** is readonly / non-editable (no enabled `<select name="urgency">`, or field rendered as readonly text). Assert locked hint or equivalent view-only affordance if implemented (e.g. **Record is locked** / lock icon). | P0 | Planned |
| TC03 | Submitted FG PR — line items view-only (Depot) | On the same Submitted FG PR, assert line-item inline fields are not editable (no enabled product/quantity inputs; no usable **Add another** that persists). Optionally change a visible control if any remain and confirm no successful field save path exists (no **Save Changes**). | P0 | Planned |
| TC04 | Cancel Requisition still available on Submitted (no active TR) | On a **Submitted** FG PR with **no** active Transport Requests, assert **Cancel Requisition** link is visible (`admin:requisitions_productrequisition_cancel`). Click it; assert cancel-reason page loads (`Cancel Requisition — …`). Do **not** require completing cancel if wipe hygiene prefers leaving the PR; abort via back to list is fine after asserting the page. | P0 | Planned |
| TC05 | Submitted FG PR locked for Feed Mill Officer | As **Feed Mill Officer** (`feed.mill.officer1.nourish@yopmail.com`), open a **Submitted** own FG PR. Assert same locks as TC02–TC03: no **Save Changes**; **Urgency** and line items view-only. | P0 | Planned |

## B — Port Shipment (Commercial Officer)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC06 | Draft Port Shipment still editable | As **Commercial Officer** (`commercial.officer1.nourish@yopmail.com`), open **Port Shipments** (`/admin/requisitions/portshipmentproxy/`). Open/create a **Draft** own shipment. Assert **Save as Draft** and **Submit Shipment** are visible; assert header fields (e.g. **Urgency**, vessel/LC fields) are editable. | P0 | Planned |
| TC07 | Submitted Port Shipment — record locked | Still as Commercial Officer, open a **Submitted** own Port Shipment. Assert **Save as Draft** / **Submit Shipment** are absent; assert no **Save Changes** (or other `_save`) submit button; assert **Shipment submitted — record is locked** (`.dfms-ps-locked-hint`) is visible (when Create TR is not shown for this role). Assert **Urgency** and LC/shipping fields are readonly / non-editable. | P0 | Planned |
| TC08 | Submitted Port Shipment — RM cargo lines view-only | On the same Submitted Port Shipment, assert **RM Cargo Line Items** inline is view-only (no enabled quantity/product editors; add/delete not available for persistable edits). | P0 | Planned |

## C — Negative / regression (optional depth)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | Partially allocated FG PR also has no Save Changes | As Depot Officer, if a `partially_allocated` own PR exists (or create via Distribution TR allocation outside this suite), open its change form and assert **Save Changes** is absent and **Urgency** is locked (same as Submitted). Skip with note if no fixture available. | P1 | Planned |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin SSR for FG **Product Requisition** and **Port Shipment** change forms for Depot / Feed Mill / Commercial Officers after submit.
- Out of scope: REST API (already rejects non-Draft updates); Distribution Officer Create TR; Tenant Admin override edits; Procurement Officer read-only Port Shipments; notification side-effects; implementing Playwright scripts (this file is the plan only).

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` (or env equivalent) |
| Login | `/admin/login/` |
| Passwords | `Nourish@1234!` |
| Credentials file | `docs/testing/playwright-mcp-credentials.yaml` |

### Admin URLs & selectors

| Item | Value |
|------|--------|
| FG changelist | `/admin/requisitions/productrequisition/` · `admin:requisitions_productrequisition_changelist` |
| FG change | `/admin/requisitions/productrequisition/<id>/change/` |
| FG cancel | `/admin/requisitions/productrequisition/<id>/cancel/` · `admin:requisitions_productrequisition_cancel` |
| Port changelist | `/admin/requisitions/portshipmentproxy/` · `admin:requisitions_portshipmentproxy_changelist` |
| Port change | `/admin/requisitions/portshipmentproxy/<id>/change/` |
| Submit row | `.dfms-pr-submit-row` / `.dfms-ps-submit-row` |
| Save Changes | `button[name="_save"]` with text **Save Changes** (must be absent post-submit for requester roles after fix) |
| Locked hint (Port) | `.dfms-ps-locked-hint` — **Shipment submitted — record is locked** |
| Urgency | `#id_urgency` or `select[name="urgency"]` — must not be enabled post-submit |

### Known story ↔ code drift (pre-fix)

- `_PRBaseAdmin.get_readonly_fields` currently **keeps `urgency` editable** for non-admin requesters on non-Draft PRs (Sprint 3 FB-004 exception). FB-008 **removes** that exception.
- FG `change_form.html` shows **Save Changes** for `is_pr_owner_role` when status is `submitted` or `partially_allocated` — must be removed/hidden for FB-008.
- `PRLineItemInline` / `PRDocumentInline` `_is_readonly_role` today covers DO/DM/PO only — Depot / Feed Mill / Commercial can still edit inlines on submitted records until locked by status.
- Port Shipment template already omits **Save Changes** and shows locked hint for Commercial Officer; still verify **Urgency** and line widgets are truly readonly after the admin fix.
- PR-01 AC-3 text claims submitted PRs are locked for requesters; runtime still allows urgency + Save Changes — FB-008 is the corrective AC.

### Suggested next step

Implement FB-008 in `apps/requisitions/admin.py` + FG change_form template, then run this plan via `playwright-mcp-admin` / `run-playwright-mcp-scenarios`.
