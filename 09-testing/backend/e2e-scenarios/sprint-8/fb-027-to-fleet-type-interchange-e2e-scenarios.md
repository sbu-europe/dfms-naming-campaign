---
module: sprint-8
specification: FB-027 — TO fleet type interchange Vendor ↔ Own before Ready for Dispatch — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: FB-027, TO-01, TOR-005
source_spec: ../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md
implementation_reference:
  - ../../../../../apps/transport/admin.py (TransportOrderAdmin — fleet_type readonly / save_model)
  - ../../../../../apps/transport/planned_milestones.py (initial_to_status_for_fleet_type / vendor handoff sync)
  - ../../../../../apps/transport/services.py (TDOAssignmentService; interchange helper TBD)
  - ../../../../../templates/admin/transport/transportorder/change_form.html
last_updated: 2026-08-11
last_mcp_run: ~
last_mcp_verdict: ~
artifacts: tests/e2e/playwright-mcp/fb-027-to-fleet-type-interchange-artifacts/
playwright_mcp: true
---

# Sprint 8 — FB-027 — TO Fleet Type Interchange (Vendor ↔ Own) — E2E Scenario Plan (Django Admin SSR)

**Improvement:** [FB-027](../../../../03-backlog/sprints/sprint-8/improvements/05-transport-planner.md#fb-027--to-fleet-type-interchange--vendor--own-before-ready-for-dispatch)

**Story / rules:** [TO-01](../../../../03-backlog/sprints/sprint-3/05-transport/02-transport-orders.md) · [TOR-005](../../../../02-domain/03-business-rules/transport-rules.md)

**AC (assert after FB-027 impl):**

1. TP can change **Vendor** TO in `under_planning` or `created` → **Own Fleet**; status becomes **`created`**; vendor assignment cleared; Planning Required until vehicle/driver (+ milestones) complete.
2. TP can change **Own** TO in any status **before** `ready_for_dispatch` → **Vendor Fleet**; status becomes **`under_planning`**; vehicle/driver/helpers cleared.
3. At/after **Ready for Dispatch**, `fleet_type` remains readonly / switch rejected.
4. TDO Vendor Fleet and Driver cannot change `fleet_type`.
5. Gate on-demand TOs cannot interchange fleet type.
6. Active bid / vendor bundle: switch blocked with a clear validation message (default product rule).

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

> **Pre-impl note:** Today `fleet_type` is editable only while `status=created` and changing it does not remap status or clear opposite-fleet fields. TCs below are **Planned** against FB-027 AC; run after admin/service changes land.

---

## Seed prerequisites

| Item | Notes |
|------|--------|
| Actor (happy path) | **Transport Planner** `transport.planner1.nourish@yopmail.com` (password `Nourish@1234!`) |
| Negative roles | **TDO Vendor Fleet** `tdo.vendor1.nourish@yopmail.com` (or seeded equivalent); **Driver** `driver1.nourish@yopmail.com` |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Upstream | DM-approved FG TR **Available for Transport Planning** (or reuse existing planned TR with remaining qty) |
| Own fleet resources | Active vehicle + driver for assignment cases (TC06–TC07); free them after Own→Vendor |
| Vendor path | Vehicle type required; milestones for `under_planning` → `created` handoff where needed |
| Unique data | Prefix notes / allocations with `MCP-FB027-<RUN_ID>-…` for wipe friendliness |
| Wipe | Prefer MCP-prefixed fixtures; do not leave TOs at/after RFD holding vehicles |

### Key URLs

| Action | Path |
|--------|------|
| Create from TR | `/admin/transport/transportorder/create-from-tr/<tr_uuid>/` |
| TO changelist | `/admin/transport/transportorder/` |
| TO change | `/admin/transport/transportorder/<uuid>/change/` |

---

## A — Vendor → Own (created / under_planning)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Vendor Under Planning → Own → Created + Planning Required | As **Transport Planner**, create (or open) a **Vendor Fleet** TO in **Under Planning** (`under_planning`) with incomplete or complete milestones but **no** `assigned_vendor`. On change form, set **Fleet type** = **Own Fleet**, save. Assert success; **Fleet type** = Own; status badge **Created** (`created`); vendor fields empty; Own Fleet Assignment shows empty vehicle/driver (or readiness panel lists missing fields — Planning Required). | P0 | Planned |
| TC02 | Vendor Created → Own → Created + vendor cleared | As TP, take a **Vendor Fleet** TO already in **Created** (`created`) after milestone handoff (not yet vendor-assigned). Change **Fleet type** to **Own Fleet**, save. Assert status remains/becomes **Created** (`created`); `assigned_vendor` / vendor vehicle / driver name cleared if any were set; Own planning required. | P0 | Planned |
| TC03 | After Vendor→Own, complete own planning → Assigned | After TC01, assign **Vehicle**, **Driver**, and all five **Planned Milestones**; save. Assert status promotes to **Assigned** (`assigned`) via existing own-fleet sync (regression that interchange did not break FB-008 path). | P1 | Planned |

## B — Own → Vendor (pre Ready for Dispatch)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC04 | Own Created → Vendor → Under Planning | As TP, open an **Own Fleet** TO in **Created** (`created`) with no vehicle/driver (or clear them). Set **Fleet type** = **Vendor Fleet**, save. Assert **Fleet type** = Vendor; status **Under Planning** (`under_planning`); Own Fleet vehicle/driver/helpers empty. | P0 | Planned |
| TC05 | Own Assigned (pre-RFD) → Vendor → Under Planning + resources released | As TP, open an **Own Fleet** TO in **Assigned** (`assigned`) with vehicle + driver set (not yet released by Driver Supervisor / not `ready_for_dispatch`). Change **Fleet type** to **Vendor Fleet**, save. Assert status **Under Planning** (`under_planning`); **Vehicle** and **Driver** cleared; previous vehicle no longer shows this TO as blocking operational status (or is free for reassignment). | P0 | Planned |
| TC06 | After Own→Vendor, complete milestones → Created (TDO handoff) | After TC04 or TC05, fill all required **Planned Milestones** for vendor path; save again. Assert status promotes to **Created** (`created`) per normal vendor handoff (TDO-visible); still no own vehicle. | P1 | Planned |

## C — Hard stops (RFD+, gate on-demand, RBAC)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC07 | Ready for Dispatch — fleet type locked | As TP, open an Own (or Vendor) TO in **Ready for Dispatch** (`ready_for_dispatch`). Assert **Fleet type** is readonly (not editable). If POST forged, assert no change / revert. | P0 | Planned |
| TC08 | Gate on-demand TO — fleet type locked | As TP (or role that can view), open a gate-sourced on-demand TO. Assert **Fleet type** cannot be interchanged (readonly / blocked). | P1 | Planned |
| TC09 | TDO Vendor Fleet cannot change fleet type | As **TDO Vendor Fleet**, open a Vendor TO in `created`. Assert **Fleet type** readonly; cannot switch to Own. | P0 | Planned |
| TC10 | Driver cannot change fleet type | As **Driver**, open an assigned Own Fleet TO (My Trips / TO change if reachable). Assert **Fleet type** readonly or page denied for write. | P1 | Planned |

## D — Blocks: bid / bundle (if seeded)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC11 | Active bid blocks Vendor→Own | As TP, open a Vendor TO with an **active bidding session**. Attempt **Fleet type** → Own; save. Assert validation error / message that bid must be closed/cancelled; fleet type unchanged. *Skip if bid seed unavailable — note Skip in RESULTS.* | P1 | Planned |
| TC12 | Bundle child blocks Vendor→Own | As TP, open a Vendor TO that is part of a **bundle**. Attempt switch to Own. Assert blocked with clear message; fleet type unchanged. *Skip if no bundle seed.* | P2 | Planned |

## E — List / display smoke

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Changelist reflects fleet + status after interchange | After TC01, open **Transport → Transport orders**. Assert the TO row shows **Own Fleet** and **Created**. After TC04, assert **Vendor Fleet** and **Under Planning**. | P1 | Planned |

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| — | — | Not run — waiting on FB-027 implementation |

---

## Implementation Notes (Playwright + Django Admin SSR)

### Scope guardrails

- In scope: Django Admin TO **change** form fleet interchange for Transport Planner; status remapping; assignment field cleanup; RFD/RBAC/gate-on-demand locks; bid/bundle block messages when seedable.
- Out of scope: REST PATCH fleet type; Driver Supervisor release-to-RFD flow (except using a pre-RFD `assigned` TO); full vendor contractual assign → RFD; mobile vendor app.

### Role fixtures

| Role | Seed user (typical) |
|------|---------------------|
| Transport Planner | `transport.planner1.nourish@yopmail.com` |
| TDO Vendor Fleet | seeded `tdo.vendor*` / role from credentials yaml |
| Driver | `driver1.nourish@yopmail.com` |

### Selectors / assertions

- Prefer `#id_fleet_type`, status badge / `#content-main`, `.messagelist`, Own vs Vendor fieldsets toggled by change_form JS.
- Assert persisted status via badge text **and** reload (UI label vs enum: **Created** → `created`, **Under Planning** → `under_planning`, **Assigned** → `assigned`, **Ready for Dispatch** → `ready_for_dispatch`).
- After Own→Vendor, confirm Own Fleet fieldset hidden / empty and Vendor planning fieldset visible.

### Known drift (pre-impl)

| Topic | Today | FB-027 target |
|-------|-------|---------------|
| Editable statuses | `created` only | Vendor→Own: `under_planning` + `created`; Own→Vendor: all pre-RFD |
| Status on switch | Unchanged / inconsistent | Remap per AC |
| Leftover vendor assign | Can auto-jump status in `save_model` | Must clear on interchange |
| TOR-005 | Immutable after assignment | Immutable at/after RFD |

### Suggested next step

Implement FB-027 service + admin gates, then run this plan via Playwright MCP; artifacts under `tests/e2e/playwright-mcp/fb-027-to-fleet-type-interchange-artifacts/RESULTS.md`.
