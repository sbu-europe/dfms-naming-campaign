---
jira_key: ~
jira_type: Bug
jira_sprint: "Sprint 6"
bug_id: BUG-06
title: Tenant Admin operational activities are not restricted to the selected POI
module: Access Control / Tenant Administration
severity: High
status: Done
story_points: 5
assignee: Farhan Tanvir (farhanT23)
reported_date: 2026-06-23
confirmed_date: 2026-06-23
fixed_date: 2026-06-23
related_stories:
  - YARD-01 — POI-scoped operational roles foundation
  - GT-01 / SC-01 / CC-01 / LD-01 — POI-scoped yard operations (Django admin)
  - TRQ-01 — Transport Request planning and creation workflows
affected_surfaces:
  - Tenant Admin — profile menu (working-site POI selector)
  - Gate, Scale, Command Center, Loading, Unloading — Django admin operational queues
  - Distribution / Procurement — Transport Request creation
  - Transport — Transport Request planning inputs and Transport Order creation
  - Dashboard — role-scoped widgets and operational statistics
---

# BUG-06 — Tenant Admin operational activities are not restricted to the selected POI

## Summary

**Tenant Admin** users could access operational modules (Transport Orders, Transport Requests, Gate, Loading, and related yard workflows) **without effective POI-based segregation**. Although a working-site selector was introduced, the system did not consistently **enforce** the selected POI as the operational context: data lists, autocompletes, and transactional actions could span **all POIs** in the tenant rather than the POI the admin had chosen.

This undermined data segregation, operational accuracy, and the product rule that a Tenant Admin performing yard or logistics work should do so **in the context of one selected site at a time**, while still being able to perform any role-based activity permitted within that POI.

**Status: Done** — fixed 2026-06-23 by Farhan Tanvir (farhanT23).

---

## Steps to Reproduce

1. Log in as **Tenant Admin** on a tenant portal (e.g. `nourish.dev.dfms.local`).
2. Open the **avatar / profile menu** and note the **Working site** control.
3. Either leave no site selected, or select **POI A** from the dropdown.
4. Navigate to operational modules, for example:
   - **Gate** — Vehicle Entry / Active Visits
   - **Scaling** — Scale-in / Scale-out queues
   - **Command Center** — Queue / Bay assignment
   - **Loading / Unloading** — operational queues
   - **Distribution / Procurement** — Transport Request creation
   - **Transport** — Transport Request planning, Transport Order lists
5. Observe available records, autocompletes, and actions.
6. Change working site to **POI B** (or clear selection) and repeat step 4.

### Actual result (before fix)

- Tenant Admin could open operational screens **without selecting a working site** and still see **tenant-wide** (all-POI) data merged in queues.
- After selecting a POI, **yard modules** (Scale, Command Center, Loading, Unloading) often **did not filter** to that POI; Gate partially respected session POI but inconsistently.
- **Transport Request** create and **planning input** flows allowed UI access for Tenant Admin but **service-layer role guards** blocked submission unless the user also held Distribution Officer / Procurement Officer / Transport Planner roles.
- Selected POI in the profile menu **did not persist reliably** after page refresh, so operational context was lost.
- Dashboard and downstream widgets did not consistently reflect the selected POI.

### Expected result

- Tenant Admin selects a **working site (POI)** from a dropdown in the **profile menu**.
- Selection **persists** across refresh and subsequent requests (session with cookie fallback).
- Until a site is selected, **POI-scoped operational screens** show **no POI-scoped data** and a clear prompt to select a site.
- After selection, **all POI-scoped operational data and actions** are limited to that POI only (gate, scale, command center, loading, unloading, related autocompletes and queues).
- Tenant Admin may perform **permitted operational activities** (including TR creation and planning inputs) **within the selected POI context**, without requiring separate operational role assignments.

---

## Impact

- **Security & segregation** — risk of viewing or acting on transactions belonging to other sites.
- **Operational accuracy** — gate, scale, and yard queues mixing vehicles from multiple POIs.
- **User confusion** — admins believe they are working at one site while the system shows all sites.
- **Broken admin override intent** — Tenant Admin is meant to substitute for operational roles **at a chosen POI**, not across the entire tenant.
- **Compliance & audit** — inability to demonstrate POI-level access boundaries for privileged users.

---

## Observed behaviour

| Scenario | Outcome (before fix) |
|----------|----------------------|
| Tenant Admin opens Gate / Scale / CC / Loading with no POI selected | Often sees **all POIs** merged or empty inconsistently |
| Tenant Admin selects POI A in profile menu | Selection **lost on refresh**; dropdown resets |
| Tenant Admin selects POI A, opens Scale or Command Center queue | Records from **other POIs still visible** |
| Tenant Admin selects POI A, opens Gate eligible TO autocomplete | Could still resolve **tenant-wide** eligible transport orders |
| Tenant Admin creates FG or Port TR from admin UI | Form visible but **submit fails** (service requires DO/PO role) |
| Tenant Admin submits TR planning inputs (vehicles required, vehicle type) | Fields editable but status may **not advance** to Under Planning |
| Gate Supervisor with no POI selected | Expected: all sites (oversight) — **unchanged by design** |

---

## Root cause (technical summary)

| Area | Cause |
|------|--------|
| POI selection UX | No durable profile-menu selector; later iterations did not persist session/cookie reliably |
| Yard admin scoping | `YardAdminBase` treated Tenant Admin as **unscoped supervisor** (`_is_supervisor` → all POIs) without honouring session POI |
| Gate module | Querysets and eligible-TO autocompletes explicitly **disabled POI filter** for Tenant Admin |
| Requisitions / TR | Admin UI permissive but **service-layer role guards** blocked Tenant Admin TR create and planning transition |
| Context resolution | No unified session POI read path across yard modules, dashboard, and profile menu |

---

## Resolution (2026-06-23)

| Scenario | Outcome (after fix) |
|----------|---------------------|
| Tenant Admin selects working site in **profile menu** dropdown | Selection saved to **session** and **HttpOnly cookie**; survives refresh |
| Tenant Admin clears working site | Session and cookie cleared; POI-scoped queues fail-closed |
| Tenant Admin with **no POI** opens Gate / Scale / CC / Loading / Unloading | **Empty queue** + warning to select a site from profile menu |
| Tenant Admin with **POI A** opens yard operational modules | Querysets, autocompletes, and actions **scoped to POI A** only |
| Tenant Admin creates **FG TR** or **Port Consignment TR** | Succeeds via **operational override** for tenant/super admin |
| Tenant Admin submits **planning inputs** on TR | Status advances to **Under Planning**; Create TO enabled |
| Gate Supervisor without POI selected | Still sees **all sites** (supervisor oversight — by design) |
| Dashboard for Tenant Admin with POI selected | Widgets scoped to selected POI where applicable |

### Implementation notes (for engineering reference)

- Profile-menu POI `<select>` POSTs to `/admin/set-active-poi/` (`dfms_active_poi_id` session + cookie).
- `YardAdminBase` and Gate admins honour session POI for Tenant Admin; fail-closed when unset.
- `TRService` operational override for Tenant Admin TR creation; planning `save_model` routes through `submit_planning_inputs`.

---

## Acceptance Criteria

### AC-1 — Working site selection in profile menu

- [x] Tenant Admin (and Gate Supervisor where applicable) can select a working site from a **dropdown in the avatar / profile menu**.
- [x] The current selection is visible in the profile header (site name or “No site selected” warning).

### AC-2 — POI selection persists

- [x] Selected POI **remains selected after page refresh** and subsequent navigation within the same tenant session.

### AC-3 — Fail-closed without POI (Tenant Admin)

- [x] When no working site is selected, **POI-scoped yard operational queues** (Gate, Scale, Command Center, Loading, Unloading) show **no cross-POI data** and prompt the user to select a site.

### AC-4 — Data scoped to selected POI

- [x] After selecting POI A, operational **lists, filters, and autocompletes** in yard modules only include records for **POI A**.
- [x] Changing selection to POI B updates visible data to **POI B** only.

### AC-5 — Tenant Admin operational workflows within POI context

- [x] Tenant Admin can **create FG and Port Consignment Transport Requests** from admin flows without holding Distribution Officer / Procurement Officer roles.
- [x] Tenant Admin can **submit planning inputs** and advance TR to Under Planning for TO creation.
- [x] Yard transactional actions (gate-in/out, scale, CC, load/unload) operate only on entities **at the selected POI**.

### AC-6 — Supervisor oversight unchanged

- [x] **Gate Supervisor** without a selected POI may still view **all sites** for oversight; with a selected POI, data is scoped to that site.

### AC-7 — Platform admin unchanged

- [x] Platform admin on `platform` schema remains **unable** to access tenant operational models (existing `TenantOnlyAdminMixin` behaviour).

---

## Sub-tasks

| Sub-task | Description | Priority | Status |
|----------|-------------|----------|--------|
| BUG-06-1 | Add profile-menu working-site POI dropdown and POST endpoint | High | Done |
| BUG-06-2 | Persist POI selection in session + cookie; restore on read | High | Done |
| BUG-06-3 | Enforce POI scoping in `YardAdminBase` and Gate admins for Tenant Admin | High | Done |
| BUG-06-4 | Fail-closed yard queues when Tenant Admin has no POI selected | High | Done |
| BUG-06-5 | Allow Tenant Admin TR create and planning via service operational override | High | Done |
| BUG-06-6 | Align dashboard scope with selected POI for Tenant Admin | Medium | Done |
| BUG-06-7 | Manual regression across Gate, Scale, CC, Loading, TR, TO | Medium | Done |

---

## Test Plan

- [x] **Manual** — Log in as Tenant Admin → open profile menu → select POI A → refresh → confirm POI A still selected.
- [x] **Manual** — With POI A selected → open Gate In add form → confirm eligible TOs and visits are for POI A only.
- [x] **Manual** — With POI A selected → open Scale / Command Center / Loading queues → confirm only POI A records appear.
- [x] **Manual** — Clear working site → open yard module → confirm empty queue and select-site warning.
- [x] **Manual** — Create FG TR and Port TR as Tenant Admin → confirm successful submission.
- [x] **Manual** — Submit planning inputs on approved TR → confirm status **Under Planning** and Create TO available.
- [x] **Manual** — Log in as Gate Supervisor without POI → confirm all-site visibility; select POI → confirm scoping.
- [x] **Manual** — Log in as platform admin → confirm operational modules remain inaccessible on platform schema.

---

## Definition of Done

- [x] All acceptance criteria met.
- [x] Test plan completed and results recorded.
- [x] No regression for POI-scoped operator roles (`gateman`, `scaling_operator`, etc.) with `UserOperationalPOI` assignments.
- [x] Ticket status updated to **Done**.

---

## Notes

- Tenant Admin POI enforcement applies to **tenant-schema operational surfaces** (Django admin SSR). REST API endpoints for some yard modules remain thinner; admin is the primary operational UI for Phase 1.
- **Vehicle registration numbers** are assigned at Transport Order / vendor fleet confirmation — not at TR planning input. Planning input scope is `vehicles_required` and `vehicle_type`.
- Product rule: Tenant Admin is an **unscoped privileged user** who must **opt in** to a working POI before performing site-specific operations — not an operator assigned via `UserOperationalPOI`.
