---
module: 04-requisitions
specification: Finished Goods Transport Request Approval (Distribution Manager) - Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: TR-01, DFS-032
source_spec: ../../05-modules/04-requisitions/product-requisition-management.md
last_updated: 2026-07-15
playwright_mcp: true
---

# Finished Goods — Distribution Manager Transport Request Approval - E2E Scenario Plan (Django Admin SSR)

Scope: **Distribution Manager** reviewing and approving/rejecting **Finished Goods** Transport Requests (TRs) via Django Admin portal navigation. Distribution Officer TR create is prerequisite only; Transport Order creation is out of scope except planner-queue visibility after approval.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Navigation & queue

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | DM sees FG TRs pending approval | Prerequisite: at least one FG TR with status `pending_approval` (create via Distribution Officer plan if needed). As **Distribution Manager** (`distribution.manager1@yopmail.com`), log in at `/admin/login/`, select working site if prompted, open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG`). Apply **Status** filter **Pending Approval**. Assert pending TRs are listed with DM columns: **TR number**, **Status**, **Urgency**, **Source PR**, **Source POI**, **Destination POI**, **Delivery date**, **Total Qty**, **Requested by**. Open one pending row and assert **Distribution Manager Review** actions: **Approve**, **Approve with Modifications**, **Reject**. | P0 | Planned |
| TC02 | TR queue filters by Status and Urgency | As **Distribution Manager** on the FG TR changelist with multiple rows, apply **Status** filter and **Urgency** filter (implemented `list_filter`). Assert the list updates for each. Do **not** assert POI or Product Category sidebar filters — those are not implemented on this admin. Optional: search by `tr_number` / source PR number. | P1 | Planned |

## Direct approve

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Approve TR directly without modification | As **Distribution Manager**, open a `pending_approval` FG TR. Click **Approve**. On the approve form, leave **Remarks** blank (optional), click **Approve**. Assert success message (approved / sent for transport planning), TR status badge **Available for Planning** (`available_for_transport_planning`), and **Approve** / **Reject** / **Approve with Modifications** no longer shown for this TR. | P0 | Planned |
| TC04 | Remarks not required on direct Approve | As **Distribution Manager**, open a different `pending_approval` FG TR. Click **Approve**, submit with empty Remarks. Assert approval succeeds without remarks; status `available_for_transport_planning`. | P0 | Planned |

## Approve with Modifications

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Modify allocated quantity and approve with mandatory remarks | As **Distribution Manager**, open a `pending_approval` FG TR. Click **Approve with Modifications**. Change a line **New Qty** (**Allocated quantity**) to a valid positive value different from Current Qty. Attempt submit with blank **Remarks** → Expected: blocked (required Remarks validation / stay on form). Enter remarks (e.g. `MCP DM qty mod <RUN_ID>`), click **Approve with Modifications**. Assert success; modified quantity persisted on TR lines; status `available_for_transport_planning`; approval record action **Approved with Modification**. | P0 | Planned |
| TC06 | Modify delivery date and approve with remarks | As **Distribution Manager**, open a `pending_approval` FG TR. Click **Approve with Modifications**. Change **Revised delivery date** to a different valid future date, enter mandatory **Remarks**, click **Approve with Modifications**. Assert updated delivery date saved and status `available_for_transport_planning`. | P0 | Planned |

## Reject

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Reject TR with mandatory rejection reason | As **Distribution Manager**, open a `pending_approval` FG TR. Click **Reject**. Attempt submit with blank **Rejection reason** → Expected: blocked. Enter a rejection reason (e.g. `MCP DM reject <RUN_ID>`), click **Reject**. Assert success (rejected / returned to Distribution Officer), status badge **Rejected** (`rejected`). Log out; log in as creating **Distribution Officer** (`distribution.officer1@yopmail.com`); open the same TR (own list). Assert status **Rejected** and **TR approval records** inline shows action **Rejected** with remarks / performer. | P0 | Planned |

## Post-approval lock

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Approved TR locked for Distribution Officer | After TC03 (or equivalent approved TR owned by DO), log in as **Distribution Officer**. Open the approved TR. Assert core fields (source/destination POI, delivery date, line allocated quantities) are not meaningfully editable; no **Approve** / **Approve with Modifications** / **Reject** actions; Distribution Officer cannot change status. | P0 | Planned |
| TC09 | DM cannot re-approve or open modify flow after approval | As **Distribution Manager**, open a TR already in `available_for_transport_planning`. Assert **Approve**, **Approve with Modifications**, and **Reject** are **not** shown. Attempting direct URLs `…/<tr_id>/approve/` (or reject / approve-with-modify) should error / redirect with not-pending message. *Known gap:* change-form fields `urgency` and/or `remarks` may still appear editable — treat unexpected persistable mutation of locked identity/delivery/qty fields as FAIL; documenting remaining editable non-lifecycle fields is informational. | P0 | Planned |

## Routing

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC10 | Approved TR visible to Transport Planner | After TC03, note `tr_number`. Log out; log in as **Transport Planner** (`transport.planner1@yopmail.com`). Open **Transport → Transport requests** (`/admin/requisitions/transportrequisition/`). Assert the approved TR is listed with status **Available for Planning** (`available_for_transport_planning`). | P0 | Planned |

## Audit trail (admin)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Approve and reject recorded on TR approval records inline | Using one approved and one rejected TR from this suite, as **Distribution Manager** open each TR change view. Assert **TR approval records** inline shows the expected action (**Approved** or **Rejected** / **Approved with Modification**), **Performed by** (DM user), **Remarks** when provided, and **Created at**. Do **not** require the global **Audit Logs** menu (`/admin/audit/auditlog/`) — TR approve/reject writes `TRApprovalRecord` + Django admin `log_change`, not necessarily US-009 `AuditLog`. | P1 | Planned |

## Capacity (known gap)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC12 | Source/destination capacity on DM review screen | As **Distribution Manager**, open a `pending_approval` TR change view (and optionally Approve / Approve with Modifications pages). Expected product intent: Source POI and Destination POI stock/capacity snapshots (current stock, free capacity) visible. *Known gap:* current Django Admin change/approve templates do **not** render capacity panels (capacity exists on TR **create** and REST serializers only). Treat unexpected absence as FAIL against AC if product still requires it; mark PASS only if panels are implemented. | P2 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: DM FG TR queue, Status/Urgency filters, direct Approve, Approve with Modifications (qty + delivery date + mandatory remarks), Reject with mandatory reason, post-approval lock for DO/DM, Transport Planner queue visibility, TRApprovalRecord audit on change form.
- Out of scope: DO TR create happy path (sibling plan); Vehicle Type / vehicles on TR; Port Consignment / Procurement Officer TR; Transport Order create; bulk approve/reject actions (optional later); REST API; notification/email AC; XSS/SQLi.
- Out of scope (not on TR admin list): POI filter, Product Category filter.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `distribution.manager1@yopmail.com` / `Nourish@1234!` |
| Fixture TR creator | `distribution.officer1@yopmail.com` / `Nourish@1234!` (create FG TRs via DO plan) |
| PR fixture creator | `depot.officer1@yopmail.com` / `Nourish@1234!` (submit FG PR before DO TR create) |
| Cross-role routing (TC10) | `transport.planner1@yopmail.com` / `Nourish@1234!` |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Working site | Select seed POI when prompted (e.g. `ctg-depot`) |

### Master data prerequisites

- One or more FG TRs in `pending_approval` owned by DO (need **≥4** pending TRs for parallel happy/negative paths, or recreate between cases).
- Active Source ≠ Destination POIs already set on those TRs.
- Prefer TRs with at least one line item so Approve with Modifications qty edits are possible.

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| DM FG TR queue | `/admin/requisitions/transportrequisition/?tr_type=FG` — menu **Distribution → Transport requests** |
| Planner TR queue | `/admin/requisitions/transportrequisition/` — menu **Transport → Transport requests** |
| Change view | `/admin/requisitions/transportrequisition/<uuid>/change/` |
| Approve | `/admin/requisitions/transportrequisition/<uuid>/approve/` — button **Approve**; remarks optional |
| Reject | `…/<uuid>/reject/` — button **Reject**; field **Rejection reason** required |
| Approve with Modifications | `…/<uuid>/approve-with-modify/` — **Revised delivery date**, line **New Qty** / Allocated quantity, **Remarks** required; submit **Approve with Modifications** |
| Change-form actions (pending only) | **Approve**, **Approve with Modifications**, **Reject** under **Distribution Manager Review** |
| Audit surface | Inline **TR approval records** on change form (`action`, `performed_by`, `remarks`, `created_at`) |

Prefer accessibility snapshot selectors over brittle CSS. Hide Django Debug Toolbar overlays before clicking submit if they intercept pointer events.

### Status & wipe notes

- Pending: UI badge **Pending Approval** / enum `pending_approval`.
- Approved for planning: badge **Available for Planning** (admin badge label); enum `available_for_transport_planning` (verbose name may say *Available for Transport Planning*).
- Rejected: badge **Rejected** / enum `rejected`.
- `tr_number` is system-generated (`TR-FG-…`); cannot use `MCP-` code prefix. Track by number / session remarks for wipe via `.cursor/skills/detect-wipe-mcp-test-data/SKILL.md`.
- Prefer one `RUN_ID` per MCP session for free-text Remarks / Rejection reason (`MCP DM <RUN_ID>`).

### Known implementation alignment / gaps

| Topic | Older FG_DM expectation | Current admin |
|-------|---------------------------|---------------|
| Queue name | "TR Review queue" | **Distribution → Transport requests** (`?tr_type=FG`) |
| Filters | POI + Product Category | `list_filter = ("tr_type", "status", "urgency")` — use Status + Urgency |
| Direct approve | Open TR → Approve | Change form link → `approve/` form; optional Remarks |
| Modify qty label | Transfer Quantity | Per-line **Allocated quantity** / New Qty on approve-with-modify |
| Modify delivery | Delivery Date | **Revised delivery date** on approve-with-modify |
| Remarks on modify / reject | Mandatory | Enforced on forms + `TRService` |
| Remarks on direct approve | Not required | `TRApproveForm.remarks` optional |
| Capacity on review | Source + Dest snapshots | *Known gap* — not on change/approve templates |
| Audit Log | Global Audit Logs with DM ID | Use **TR approval records** inline; US-009 AuditLog not written by `TRService` |
| Post-approve DM lock | All fields locked | Actions gated to `pending_approval`; most fields readonly; urgency/remarks may still be editable |

### Original ID map (FG_DM → this plan)

| Legacy | This file | Change |
|--------|-----------|--------|
| FG_DM_001 | TC01 | Rewrote navigation to Distribution → Transport requests + Status filter + DM columns/actions |
| FG_DM_002 | TC02 | Status + Urgency only; dropped POI/Product Category |
| FG_DM_003 | TC03 | Direct Approve path + `available_for_transport_planning` / badge wording |
| FG_DM_004 | TC05 | Approve with Modifications + Allocated quantity + mandatory remarks |
| FG_DM_005 | TC06 | Revised delivery date on modify form |
| FG_DM_006 | TC04 | Kept (optional remarks on direct Approve) |
| FG_DM_007 | TC07 | Reject + DO visibility via status + approval records (rejection_reason not on fieldsets) |
| FG_DM_008 | TC08 | DO lock aligned to no change permission / no DM actions |
| FG_DM_009 | TC09 | Actions gated; known gap on urgency/remarks |
| FG_DM_010 | TC12 | Demoted P2 known gap (no capacity on DM review SSR) |
| FG_DM_011 | TC10 | Transport Planner menu URL |
| FG_DM_012 | TC11 | Rewrote to TRApprovalRecord inline; dropped global Audit Logs requirement |

### Suggested next step

Run Playwright MCP against this file (seed pending TRs via DO plan first; then TC01 → TC03/TC04 → TC05–TC07 → TC08–TC10 → TC11; TC12 last), persist results under `tests/e2e/playwright-mcp/fg-dm-tr-artifacts/RESULTS.md`, screenshot failures as `<TC-ID>-failure.png`.
