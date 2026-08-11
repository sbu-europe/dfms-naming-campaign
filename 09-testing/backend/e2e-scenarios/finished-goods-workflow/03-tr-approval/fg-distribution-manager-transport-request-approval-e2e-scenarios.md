---
module: 04-requisitions
specification: Finished Goods Workflow — Section 3 — Transport Request (TR) Approval (Distribution Manager) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: DR-02, FB-018
source_spec: ../../../../../05-modules/04-requisitions/product-requisition-management-v2.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 11/11 Pass (TC09 Dropped)
artifacts: tests/e2e/playwright-mcp/03-tr-approval-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 3 — Distribution Manager — TR Approval — E2E Scenario Plan (Django Admin SSR)

> **2026-08-11 — All 11 test cases passed** (TC01–TC08, TC10–TC12). Suite signed off via Playwright MCP against Nourish admin.

**Last MCP run:** 2026-08-11 · **11/11 Pass (TC09 Dropped)** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/03-tr-approval-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/03-tr-approval-artifacts/RESULTS.md)  
**Accounts:** `distribution.manager1.nourish@yopmail.com`.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **11/11** | All executable TR-approval cases passed (Playwright MCP). TC09 remains Dropped. |


**Navigation:** Distribution → **Transport requests** (`?tr_type=FG`) → filter **Pending Approval** → open TR → **Distribution Manager Review**

Scope: **Distribution Manager** reviewing, approving, rejecting, or approving-with-modification FG TRs in `pending_approval`. TR creation and Transport Order flows are out of scope except cross-role visibility (TC10).

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## TR review & pending queue

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | DM can view TR details submitted by DO | As **Distribution Manager** (`distribution.manager1@yopmail.com`), open **Distribution → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG&status__exact=pending_approval`). Open a **Pending Approval** TR. Assert change view / review screens show: `tr_number`, **Source PR**, **Source POI**, **Destination POI**, line-item quantities (Product / Qty / UoM), **Delivery date**, **Total Qty**, **Requested by**. *Rewrite from FG_DM_001: no vehicle count/type on TR — field removed (`vehicles_required` migration 0009).* | P0 | Pass |

## Approve paths

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC02 | DM can Approve a TR without modification | On a **Pending Approval** TR, click **Approve** (`/admin/requisitions/transportrequisition/<uuid>/approve/`). Optional **Remarks**, submit **Approve**. Assert success message `approved and sent for transport planning`; status badge **Available for Transport Planning** (`available_for_transport_planning`). | P0 | Pass |
| TC03 | DM can Approve with Modification | On **Pending Approval** TR, open **Approve with Modifications**. Change **Revised delivery date** and/or line **New Qty** values; enter required **Remarks**; submit **Approve with Modifications**. Assert TR saved with modified values; status **Available for Transport Planning**; remarks persisted on `TRApprovalRecord`. | P0 | Pass |
| TC04 | Mandatory remarks on Approve with Modification | On approve-with-modify form, change a line quantity or delivery date, leave **Remarks** blank, submit. Expected: field error on **Remarks** (required); TR stays **Pending Approval**. | P0 | Pass |

## Reject paths

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | DM can Reject a TR with mandatory remarks | On **Pending Approval** TR, click **Reject**. Enter **Rejection reason** (required), submit **Reject**. Assert status **Rejected** (`rejected`); remarks saved. As DO, TR visible in FG TR list with rejected status (notification/email out of MCP scope). | P0 | Pass |
| TC06 | Reject blocked without remarks | On reject form, leave **Rejection reason** blank, submit **Reject**. Expected: validation error; TR remains **Pending Approval**. | P0 | Pass |

## Capacity, post-approval lock & cross-role

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Capacity snapshot visible during DM review | On approve/reject/approve-with-modify screens, assert **POI Stock & Capacity** section with **Source POI — Stock & Capacity** and **Destination POI — Stock & Capacity** panels (Total capacity / Current stock / Free capacity — FB-018). | P0 | Pass |
| TC08 | Approved TR read-only for Distribution Officer | After TC02, log in as **Distribution Officer**. Open approved TR change view. Assert no **Approve/Reject** actions; TR fields read-only (DM `has_change_permission`; DO view-only). Attempt edit/save — blocked or no editable fields. | P0 | Pass |
| TC09 | Dropped — vehicle count/type on TR | *Legacy FG_DM_009 — **Drop**: `vehicles_required`, `num_vehicles_required`, and TR-level vehicle type are not on admin TR review. Vehicle planning happens at TO creation (`05-transport/`). | — | Dropped |
| TC10 | Approved TR visible to Transport Planner | After TC02, log in as **Transport Planner** (`transport.planner1@yopmail.com`). Open **Transport → Transport requests** (`/admin/requisitions/transportrequisition/?tr_type=FG&status=available_for_transport_planning`). Assert approved `tr_number` listed with status **Available for Transport Planning**. | P0 | Pass |

## RBAC & audit

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | RBAC — DM cannot create TR | As **Distribution Manager**, assert **Transport requests → Add** is absent or redirects without create-from-PR access; PR changelist has no working **Create TR** for DM (`has_add_permission` false; `create_tr_view` DO-only). Direct URL to `create-from-pr/` shows error redirect. | P0 | Pass |
| TC12 | Audit trail for approval/rejection | After TC02 or TC05, as **Tenant Admin**, open TR change view **History** (`/admin/requisitions/transportrequisition/<pk>/history/`) and **TR Approval Records** inline (`action`, `performed_by`, `remarks`, `created_at`). Assert approve/reject/modify entry with DM user and timestamp. *Rewrite from FG_DM_012: tenant **Audit Logs** menu is API-oriented; admin SSR uses `LogEntry` + `TRApprovalRecord`.* | P1 | Pass |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: DM approve / reject / approve-with-modify, pending queue filter, capacity panels, DO read-only after approval, TP queue visibility, DM cannot create TR.
- Out of scope: TR vehicle count fields, email/notification to DO, bulk approve/reject (optional P1 extension), REST API.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Primary actor | `distribution.manager1@yopmail.com` / `Nourish@1234!` |
| DO (TC08) | `distribution.officer1@yopmail.com` / `Nourish@1234!` |
| TP (TC10) | `transport.planner1@yopmail.com` / `Nourish@1234!` |
| Tenant Admin (TC12) | `admin@yopmail.com` / `NourishAdmin@1234!` |
| Pending TR fixture | Create via Section 2 DO plan or reuse `TR-FG-…` in `pending_approval` |

### Admin URLs & UI labels

| Action | Path / control |
|--------|----------------|
| FG TR queue | `/admin/requisitions/transportrequisition/?tr_type=FG` |
| Pending filter | `&status__exact=pending_approval` |
| Approve | **Approve** → `/approve/` |
| Reject | **Reject** → `/reject/` |
| Approve with modify | **Approve with Modifications** → `/approve-with-modify/` |

### Original ID map (FG_DM → this plan)

| Legacy | This file | Verdict |
|--------|-----------|---------|
| FG_DM_001 | TC01 | Rewrite (no vehicle count) |
| FG_DM_002 | TC02 | Keep |
| FG_DM_003 | TC03 | Keep |
| FG_DM_004 | TC04 | Keep |
| FG_DM_005 | TC05 | Keep |
| FG_DM_006 | TC06 | Keep |
| FG_DM_007 | TC07 | Keep |
| FG_DM_008 | TC08 | Keep |
| FG_DM_009 | TC09 | Drop (field removed) |
| FG_DM_010 | TC10 | Keep |
| FG_DM_011 | TC11 | Keep |
| FG_DM_012 | TC12 | Rewrite (History + TRApprovalRecord) |

### Suggested next step

Run MCP TC01–TC08 after a Section 2 pending TR fixture; artifacts under `tests/e2e/playwright-mcp/fg-dm-tr-artifacts/RESULTS.md`.
