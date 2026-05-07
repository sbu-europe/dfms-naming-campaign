---
sprint: Sprint 3
title: Product Requisition, Transport Requests & Transport Orders
phase: phase-1
start_date: ~
end_date: ~
total_story_points: 68
status: Complete
jira_board: https://your-org.atlassian.net/jira/software/projects/DFS/boards
---

# Sprint 3 — Requisition (FG), Port Shipments, Transport Requests & Transport Orders

> Full sprint backlog with stories, sub-tasks, and status.
> Source story specs: [`04-backlog/stories/`](../../stories/)

## Sprint Summary

| Metric | Value |
|--------|-------|
| Total Stories | 11 |
| Total Story Points | 73 |
| Status | ✅ Complete |
| Epics | Dashboard, Requisition (FG), Port Shipments, Distribution, Procurement, Transport, QA & Testing, DevOps & Infrastructure |

---

## Epic: Dashboard (Universal Landing Page)

> Every tenant user lands on a **role-scoped dashboard** at `/admin/`. The page and its KPI widgets are dynamically filtered based on the user's role — no blank screens, no 403s for operational staff.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Role-Based Dashboard](09-dashboard/DB-01-role-based-dashboard.md) | DB-01 | DFS-043 | 5 | Pending |

**Key rules:**
- `/admin/` is the universal landing page for **all** tenant roles after login
- Dashboard content (KPI widgets) is **role-scoped** — depot officer sees own PR counts, distribution manager sees pending TR approvals, transport planner sees available TRs, etc.
- Roles with no specific KPIs (e.g. `gateman`) see a minimal welcome screen
- A new `Menu.Dashboard.View` permission code is added and assigned to every operational role
- Tenant Admin retains the existing full Django admin index behaviour

**Sub-total**: 5 SP

---

## Menu Structure & Role Access


### Requisition *(Finished Goods only)*

> **Requisition** in the product means **internal FG demand** (Depot / Feed Mill). **Port Shipments** use a **separate top-level menu** — do not place import registration under Requisition.

| Sub-menu | Can View | Can Create | Can Edit (Draft) | Can Cancel |
|----------|----------|------------|------------------|------------|
| Finished Goods | Depot / Feed Mill Officer (own PRs) | Depot / Feed Mill Officer | Depot / Feed Mill Officer | Depot / Feed Mill Officer (before TR created) |

**Key rules:**
- **Destination POI** pre-filled from user's assigned POI (editable); **Source POI** not on PR — defined by Distribution at TR creation
- Depot / Feed Mill Officers **only** see **Requisition → Finished Goods** (no access to **Port Shipments**)

### Port Shipments *(import / inbound cargo — single top-level menu, role-based)*

| Role | List / detail | Can Create | Can Edit (Draft) | Can Cancel | Notes |
|------|---------------|------------|------------------|------------|--------|
| Commercial Officer | **Own** Port Shipments | ✓ | ✓ (Draft) | ✓ (before TR) | Register import data from external systems; ref `PS-PORT-…` |
| Procurement Officer | **All submitted** (tenant) | — | — | — | **Same top-level menu** — org-wide read/planning view, no second “queue” screen under Procurement; open shipment detail → create TR (PC-02) |

**Key rules:**
- **Not a requisition** — one **Port Shipments** area in the shell; **RBAC** determines Commercial (own) vs Procurement (all submitted, read-only).
- **No separate “Inbound shipment queue” menu** under Procurement — that would duplicate navigation.
- **Source Port** and **destination POIs** are **not** on the shipment record; Procurement sets them per TR (PC-02).
- Commercial **only** has **Port Shipments** + no **Requisition (FG)**; mandatory LC/shipment + Arrival Notice on submit.
- **Procurement** also uses **Port Shipments** (top-level) to review shipments; **Procurement → Transport requests** is the **own-TR** worklist (Port consignment) — *not* a second org-wide **Port Shipments** screen under Procurement.

### Distribution

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| **Product requisitions** (FG) | Distribution Officer, Distribution Manager | — | — | — |
| **Transport requests** (FG) | Distribution Officer (own TRs), Distribution Manager (all) | Distribution Officer | Distribution Manager | Distribution Manager |

**Key rules:**
- **Product requisitions (FG):** Distribution **Officer** and **Manager** both see all submitted FG PRs; the Officer creates TRs from this view, the Manager uses the same context for TR approval
- Distribution Officer creates TRs against a PR — source POI selected per TR; destination inherited from the PR (read-only)
- Multiple TRs can be created for one PR (different source POIs); total TR quantity must not exceed PR quantity — overflow is blocked
- Distribution Manager can approve as-is, approve with modification (qty, date, priority, vehicle requirements), reject with reason, or request clarification
- Approved TRs transition to `Available for Transport Planning`

### Procurement

| Sub-menu | Can View | Can Create | Can Approve / Modify | Can Reject |
|----------|----------|------------|----------------------|------------|
| **Transport requests** (Port consignment) | Procurement Officer (own TRs) | Procurement Officer | — | — |

**Key rules:**
- **Port Shipment review** happens under the **top-level Port Shipments** menu (see above) — not here.
- Each TR specifies: Source POI (Port), Destination POI (any active POI — per-TR allocation), and quantity for that destination
- Multiple TRs can be created for one Port Shipment (typically one per destination); total TR quantity must not exceed shipment line totals — overflow is blocked
- **No manager approval step** — submitted TRs are immediately `Available for Transport Planning`

### Transport

| Sub-menu / area | Primary roles | What happens here |
|----------|---------------|-------------------|
| **Transport requests** → Finished Goods | Transport Planner | TR queue; **planning inputs** (vehicles, type) before TOs; see TRQ-01 (`type=FG`) |
| **Transport requests** → **Port Consignment** *(import / Port Shipment–linked — `type=PORT_CONSIGNMENT`)* | Transport Planner | TR queue; planning + **Raw C&F** (Port path only) |
| **Transport orders (TO)** | Transport Planner, TDO, Driver | **TO-01** — create/manage TOs vs TR; list all. **TO-02** — TDO assigns vehicle, driver, helper, ETA; own-fleet or vendor. Driver: **my assigned** TOs only (same TO entity) |

**Key rules:**
- **Two sibling areas under Transport (like Distribution’s PR queue + TRs):** **Transport requests** = *planning on the TR*; **Transport orders** = *execution* (TO). Flow: TR → planning inputs → then create/manage under **Transport orders** (TRQ-01 → TO-01 → TO-02).
- Transport Planner: unified **TR** queue — **Finished Goods** and **Port Consignment** tabs; status `Available for Transport Planning` or `Under Planning` (TRQ-01; `type=FG` vs `type=PORT_CONSIGNMENT`)
- **TR planning inputs** (before TOs): vehicle qty, vehicle type; **Port Consignment** only: **Raw C&F** Clearance — then **Transport orders** for TO work
- Submitting planning details sets TR to `Under Planning`
- **Transport orders:** sum of TO qty per TR ≤ TR qty (overflow blocked). Own Fleet: vehicle/driver from MDM; Vendor Fleet: vendor + manual vehicle/driver
- TDO works in **Transport orders** (own-fleet / vendor queues) — not a separate TO “list” product
- Driver: only **Transport orders** (my assignments) for their TOs

---

## Implementation Status

### Django Modules & Admin

| Django App | Admin Class | Menu Heading | Sub-menu Label | Roles |
|-----------|-------------|--------------|----------------|-------|
| `apps.requisitions` | `ProductRequisitionAdmin` | Requisition | Finished Goods | Depot / Feed Mill Officer |
| `apps.requisitions` | `PortShipmentAdmin` (proxy) | Port Shipments | Port Shipments | Commercial Officer |
| `apps.requisitions` | `TransportRequisitionAdmin` (Distribution) | Distribution | Transport Requests | Distribution Officer / Manager |
| `apps.requisitions` | `TransportRequisitionAdmin` (Procurement) | Procurement | Transport Requests | Procurement Officer |
| `apps.transport` | `TransportOrderAdmin` ✅ | Transport | Transport orders | Transport Planner / TDO Own Fleet / TDO Vendor Fleet / Driver |

### Portal Navigation (`apps/core/portal_navigation.py`)

| Section heading | Item id | URL | Permission / role access |
|-----------------|---------|-----|--------------------------|
| **Requisition** | `requisition_fg` | `/requisitions/finished-goods/` | `permission_any: Menu.Requisition.FG.View` |
| **Port Shipments** | `port_shipments` | `/port-shipments/` | `permission_any: Menu.PortShipments.View` |
| **Distribution** | `distribution_pr_queue` | `/distribution/product-requisitions/` | `permission_any: Menu.Distribution.PRQueue.View` |
| **Distribution** | `distribution_transport_requests` | `/distribution/transport-requests/` | `permission_any: Menu.Distribution.TR.View` |
| **Procurement** | `procurement_transport_requests` | `/procurement/transport-requests/` | `permission_any: Menu.Procurement.TR.View` |
| **Transport** | `transport_requests` | `/transport/transport-requests/` | `permission_any: Menu.Transport.FG.TR.View, Menu.Transport.Port.TR.View` |
| **Transport** | `transport_orders` | `/transport-orders/` | `permission_any: Menu.Transport.TO.View` OR `role_any: tdo_own_fleet, tdo_vendor_fleet, driver` |
| **Master Data** | `vehicles` | `/master-data/vehicles/` | `permission_any: ...` OR `role_any: tdo_own_fleet` |
| **People & Access** | `drivers` | `/users/drivers/` | `permission_any: ...` OR `role_any: tdo_own_fleet` |
| **People & Access** | `helpers` | `/users/helpers/` | `permission_any: ...` OR `role_any: tdo_own_fleet` |

> **Implementation note**: `role_any` acts as an OR path alongside `permission_any` — a user satisfying either condition sees the menu item. This allows TDO roles to access Transport Orders and read-only master data without needing explicit DB permission codes.

### RBAC Permission Codes (`apps/core/constants_rbac.py`)

| Code | Role(s) | Notes |
|------|---------|-------|
| `Menu.Requisition.FG.View` | depot_officer, feed_mill_officer | FG PR creation; no Port Shipments access |
| `Menu.PortShipments.View` | commercial_officer, procurement_officer | Shared top-level menu; Commercial sees own, Procurement sees all submitted |
| `Menu.Distribution.PRQueue.View` | distribution_officer, distribution_manager | All submitted FG PRs |
| `Menu.Distribution.TR.View` | distribution_officer (own), distribution_manager (all) | FG TRs; manager approval |
| `Menu.Procurement.TR.View` | procurement_officer | Own Port Consignment TRs; NOT a duplicate Port Shipments screen |
| `Menu.Transport.FG.TR.View` | transport_planner | FG TR tab in unified queue |
| `Menu.Transport.Port.TR.View` | transport_planner | Port Consignment TR tab in unified queue |
| `Menu.Transport.TO.View` | transport_planner | Transport Orders via permission code; TDO/driver via `role_any` |

### Django Admin Separation — FG vs Port Shipments

Both `ProductRequisitionAdmin` and `PortShipmentAdmin` manage the **same underlying `ProductRequisition` model** but use different proxy models to appear as separate entries in the Django Admin:

```
Requisitions ──┬── Product Requisitions   → ProductRequisitionAdmin
               │   (pr_type=FINISHED_GOODS)
               └── Port Shipments         → PortShipmentAdmin (via PortShipmentProxy)
                   (pr_type=PORT_CONSIGNMENT)
```

Key admin behaviours:
- `save_model` auto-fills `requested_by`, `created_by`, `requester_name`, `requester_department` from the logged-in user on creation.
- **Add form** shows only editable fields; read-only metadata (PR number, status, timestamps) appear only on the change form.
- `PRLineItemInline` with `extra=1` is attached to both.
- **Port Shipments add form** includes LC/shipping document fields (`lc_number`, `bl_number`, `vessel_name`, `arrival_notice`) that are absent from the FG form.

### Migrations Applied

| File | Description |
|------|-------------|
| `apps/requisitions/0003_pr_core.py` | `ProductRequisition` Sprint 3 fields (FG demand model) |
| `apps/requisitions/0004_tr_sprint3.py` | `TransportRequisition` Sprint 3 fields |
| `apps/requisitions/0005_port_shipment_proxy.py` | `PortShipmentProxy` proxy model registration |
| `apps/transport/0006_to_sprint3.py` | Transport model Sprint 3 updates |

---

## Epic: Requisition (Finished Goods)

> **Requisition** menu: **FG Product Requisitions** only — internal demand from Depot/Feed Mill Officers → Distribution.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [FG Product Requisition](01-requisition/PR-01-fg-product-requisition.md) | PR-01 | DFS-032 | 5 | Pending |

**Sub-total**: 5 SP

---

## Epic: Port Shipments

> **Port Shipments** is a **single top-level menu** (sibling to Requisition). Commercial registers cargo (PR-02); Procurement uses the **same menu** for org-wide read + planning (PC-01) — no duplicate queue under Procurement. TR/TO follow.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Port Shipment (Import) Registration](02-port-shipments/PR-02-port-shipment.md) | PR-02 | DFS-033 | 5 | Pending |
| 2 | [Port Shipments — org-wide list & detail (Procurement role)](04-procurement/PC-01-rm-product-requisitions.md) | PC-01 | DFS-036 | 2 | Pending |

**Sub-total**: 7 SP

---

## Epic: Distribution

> **Officers** view the submitted **FG** product requisition queue and create **FG** TRs (source POI per TR; destination from PR). **Manager** has the same PR read access and sees **all** TRs, then **approves** (or modifies / rejects) TRs before they reach **Transport** planning. **Overflow** rules: TR totals vs PR quantity.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Distribution — FG Product Requisitions View](03-distribution/DR-01-fg-product-requisitions.md) | DR-01 | DFS-034 | 2 | Pending |
| 2 | [Distribution — Transport Request Creation & Manager Approval](03-distribution/DR-02-transport-requests.md) | DR-02 | DFS-035 | 8 | Pending |

**Sub-total**: 10 SP

---

## Epic: Procurement

> Procurement Officers open **top-level Port Shipments** to review (PC-01) and create **Transport Requests** from shipment detail (PC-02) — typically one TR per destination POI. Source POI is always a Port (per TR). Destination **per TR** (any active POI). **No manager approval** — TRs go to Transport Planning; **TOs** later (TO-01).

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Procurement — Transport Request Creation](04-procurement/PC-02-transport-requests.md) | PC-02 | DFS-037 | 6 | Pending |

**Sub-total**: 6 SP

---

## Epic: Transport

> In **Transport → Transport requests**: Planners work a unified **FG** + **Port Consignment** TR queue, submit planning inputs (and for **Port Consignment** TRs: Raw C&F). In **Transport → Transport orders (TO)**: Planners create TOs against each TR (TO-01). TDOs assign vehicle, driver, helpers, and ETA (TO-02). Drivers work **my assigned** TOs under the same **Transport orders** area.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Transport Requests Queue (FG & Port Consignment)](05-transport/01-transport-requests-queue.md) | TRQ-01 | DFS-038 | 3 | Pending |
| 2 | [Transport Order Creation](05-transport/02-transport-orders.md) | TO-01 | DFS-039 | 8 | Pending |
| 3 | [TDO Vehicle, Driver, Helper & ETA Assignment](05-transport/03-tdo-assignment.md) | TO-02 | DFS-040 | 8 | Pending |

**Sub-total**: 19 SP

---

## End-to-End Flow This Sprint Delivers

```
┌──────────────────────────────────────────────────────────────────────────────────────────────┐
│  REQUISITION (FG)                    PORT SHIPMENTS (one top-level menu — role-based)         │
│                                                                                              │
│  Depot/Feed Mill Officer      Commercial Officer          Procurement Officer                │
│  └── Finished Goods           Port Shipments (own)        Port Shipments (all submitted)     │
│      Create FG PR             Register shipment            List/detail (PC-01) → create TR (PC-02) │
│      (dest…; no source)       LC + RM lines                                                │
└──────────────────────────────┬───────────────────────────────┬──────────────────────────────┘
                               │                               │
                   FG PR submitted                   Port Shipment submitted
                       │                                       │
         ┌─────────────▼──────┐              ┌────────────────▼───────────────────┐
         │  DISTRIBUTION      │              │  PROCUREMENT (TR workspace)          │
         │  Distribution      │              │  Procurement Officer                │
         │  Officer           │              │  └── Transport requests (own; PC-02) │
         │  ├── Product Reqs  │              │      Create TR(s) from shipment     │
         │  │   (view FG PRs) │              │      (same Port Shipment entity)    │
         │  └── Transport reqs│              │      Source: Port POI               │
         │      (FG) create   │              │      Dest: per-TR (any active POI)  │
         │      Source: POIs  │              │      [qty overflow → ✗]             │
         │      Dest: from PR │              │      ↓                              │
         │      [qty overflow]│              │  No approval step                   │
         │      ↓             │              │  TR → Available for                 │
         │  Distribution Mgr  │              │  Transport Planning                 │
         │  Approve / Modify  │              └─────────────────────────────────────┘
         │  Reject / Clarify  │
         │      ↓             │
         │  TR → Available    │
         │  for Transport     │
         └─────────┬──────────┘
                   │
                   └──────────────────────────┐
                                              │
         ┌────────────────────────────────────▼────────────────────────────┐
         │  TRANSPORT MODULE                                                │
         │  Transport Planner + TDO + Driver                                │
         │  ├── Transport requests > Finished Goods  (FG TRs)               │
         │  ├── Transport requests > Port Consignment  (Port Shipment TRs)  │
         │  │   Planning → TR Under Planning; [PC] Raw C&F                  │
         │  └── Transport orders (TO)  — list / create vs TR (TO-01)         │
         │        Own Fleet or Vendor; qty per TO  [overflow → ✗]            │
         │      TDO (TO-02): vehicle, driver, helper, ETA (own or vendor)   │
         │      → TO Assigned → Ready for Dispatch                           │
         │      Driver: my assigned TOs (Transport orders)                    │
         └─────────────────────────────────────────────────────────────────┘
                   ↓
         (Sprint 4: Dispatch → In-Transit → POD → Trip Closure)
```

---

## Dependency Map

```
DB-01 (Role-Based Dashboard) ── prerequisite: all roles have a landing page

PR-01 (FG PR)     ──→  DR-01 (Distribution PR queue)
                        └──→  DR-02 (FG TR creation + DM approval)
                                └──→  TRQ-01 (unified TR queue: FG + Port Consignment)

PR-02 (Port Shipment) ──→  PC-01 (org view in same Port Shipments menu)
                        └──→  PC-02 (Port Consignment TR creation, no approval)
                                └──→  TRQ-01 (unified TR queue: FG + Port Consignment)

TRQ-01            ──→  TO-01 (TO creation)
                        └──→  TO-02 (TDO assignment + Driver view)
```

**Prerequisites from Sprint 2**:
- MDM-04 (POI) — source/destination POI selection in PR and TR forms
- MDM-01 (Product) — product selection (FG / RM type gating)
- MDM-02 (Route) — route distance/duration shown in TR assessment, ETA suggestion in TO-02
- MDM-03 (Vendor) — vendor selection in TO-02 vendor fleet assignment
- MDM-05 / MDM-06 / MDM-07 (Vehicle / Driver / Helper) — fleet assignment in TO-02

---

## Epic: QA & Testing

> Automated test suite covering all Sprint 1 & 2 features — unit tests (pytest), API integration tests, Playwright UI end-to-end tests, code coverage enforcement, and SonarQube static analysis setup.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [Automated Test Suite — Sprint 1 & 2 Features](06-qa-testing/QA-01-automated-test-suite-sprint-1-2.md) | QA-01 | DFS-041 | 13 | Pending |

**Sub-total**: 13 SP

---

## Epic: DevOps & Infrastructure

> AWS shared dev environment — full stack deployed on AWS with Terraform IaC, CI/CD pipeline, HTTPS, S3, SES, and CloudWatch observability.

| # | Story | Task ID | Jira | SP | Status |
|---|-------|---------|------|----|--------|
| 1 | [AWS Dev Environment — Up & Running](07-devops/DEVOPS-01-aws-dev-environment.md) | DEVOPS-01 | DFS-042 | 8 | Pending |

**Sub-total**: 8 SP

---

## Pending Items

> No carry-overs into Sprint 3 at planning time.

---

## Demo Feedback

> No demo feedback recorded for Sprint 3 yet. Full feedback log: [`08-feedback/README.md`](08-feedback/README.md)

---

## Quantity Overflow Rules

| Level | Rule | Behaviour |
|-------|------|-----------|
| TR creation against FG PR | Sum of all TRs for a PR must not exceed PR total quantity | Creation blocked with error if overflow |
| TR creation against Port Shipment | Sum of all TR allocations must not exceed shipment line quantities | Creation blocked with error if overflow |
| TO creation against TR | Sum of all TOs for a TR must not exceed TR total quantity | Creation blocked with error if overflow |

---

## Role Summary

> Cross-check: **Menu structure & role access** (section above) is authoritative; this table is a compact matrix of the same **Sprint 3** access. All roles have **Dashboard** as their landing page.

| Role | Dashboard widgets | Module access | List / read scope | Create / act |
|------|-------------------|--------------|-------------------|-------------|
| Depot / Feed Mill Officer | Draft / Submitted / In-Progress own PRs | Requisition → **Finished Goods** | Own PRs | Create, edit, cancel own PRs (cancel before any TR from PR); **no** Port Shipments |
| Commercial Officer | Draft / Submitted own shipments | **Port Shipments** (top-level) | **Own** shipments (tenant) | Register, edit (draft), cancel (before any TR); **no** Requisition (FG) |
| Distribution Officer | Pending FG PRs, own active TRs | **Distribution** | **Product requisitions** — all submitted FG PRs; **Transport requests** — own TRs | Create TRs against FG PRs (source POI per TR; dest from PR) |
| Distribution Manager | Pending FG PRs, pending TR approvals | **Distribution** | **Product requisitions** — all submitted FG PRs; **Transport requests** — **all** FG TRs | Approve, modify, reject, or request clarification (pending **FG** TRs) |
| Procurement Officer | Port Shipments awaiting TR, own Port TRs | **Port Shipments** (all submitted, read) + **Procurement → Transport requests** | Shipment list/detail (PC-01); **own** Port Consignment TRs in Procurement | Create TR from shipment / list (PC-02) — no approval; **no** create/edit of shipment (Commercial) |
| Transport Planner | FG + Port TRs available for planning, open TOs | **Transport** | **Transport requests** — all FG + Port Consignment in scope (unified queue); **Transport orders (TO)** — all TOs | TR planning inputs (TRQ-01); create and manage TOs (TO-01) |
| Transport Distribution Officer (TDO) | Open TOs (own queue) | **Transport** | **Transport orders (TO)** — own-fleet and/or vendor queue per assignment | Assign vehicle, driver, helpers, ETA (TO-02) |
| Driver | My assigned TOs | **Transport** (driver) | **Transport orders** — *my assigned* TOs only | View assigned TOs (execution handoff; dispatch in Sprint 4) |
| Tenant Admin | Full tenant KPI summary | All modules | All tenant data | Full admin CRUD |

---

## Notes

- **Navigation**: **Requisition** = **Finished Goods only**. **Port Shipments** = **one top-level menu** — Commercial (own) and Procurement (all, read) share it; no duplicate queue under Procurement. **Transport** = **Transport requests** (TR, planning — FG + Port Consignment) + **Transport orders (TO)** (create TO-01, assign TO-02, driver execution). **TR** from Distribution vs FG PRs, or from **Port Shipment** / **Procurement → Transport requests**.
- **Menu structure alignment (FG vs Port)**: **Distribution** keeps both **Product requisitions** and **FG transport requests** under one module. The **Port** path uses the same idea (entity + TRs) but lists **Port Shipments** at **top level** (shared with Commercial) and only **Procurement → Transport requests** under **Procurement** — so the shipment list is not repeated as a Procurement sub-menu; it is the same pattern with a different shell shape.
- **FG TRs**: Destination is inherited from the PR (read-only on TR form). Source POI is selected per TR — enabling multi-source fulfillment of one PR.
- **Port Consignment TRs** (transport type): Destination is defined per TR by Procurement (any active POI) — not on the shipment record. Source is always a Port POI. **TOs** are created by the Transport Planner after planning inputs (TRQ-01 / TO-01).
- **Quantity overflow guard**: TR allocations vs parent FG PR or Port Shipment totals; TO quantities vs TR totals.
- **No Procurement Manager approval** for Port Consignment TRs — unlike FG TRs which require Distribution Manager approval, Procurement TRs go directly to Transport Planning on submission.
- **Raw C&F Clearance Note/Approval** applies to **Port Consignment** TRs (port import from **Port Shipments**); the Transport Planner confirms at planning input submission (before TO creation), Yes/No.
- **TDO assigns all physical resources** (vehicle, driver, helpers, ETA) — this is a separate step from the Transport Planner creating the TO structure.
- **Driver mobile view** delivers assigned TO list visibility — dispatch and trip lifecycle features follow in Sprint 4.
- Jira Epics: `DFS-043` (Requisition), `DFS-044` (Distribution), `DFS-045` (Procurement), `DFS-046` (Transport) — **note**: story IDs `DFS-032`–`DFS-042` are individual story/task keys; epic keys above are separate.
- Story IDs in Transport table: TRQ-01=DFS-038, TO-01=DFS-039, TO-02=DFS-040 are story-level keys, not epic keys.
