---
module: 12-cross-cutting
specification: Role-wise Portal Menu Stability — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: US-004
source_spec: ../../05-modules/03-users/tenant-user-management-v2.md
implementation_reference:
  - ../../../apps/core/role_seed_data.py (SEED_ROLES)
  - ../../../apps/core/portal_navigation.py (PORTAL_NAV_SECTIONS / build_portal_navigation)
  - ../../../templates/admin/nav_sidebar.html (#dfms-nav-sidebar)
  - ../../../tests/unit/test_core/test_role_menu_stability.py (unit matrix SSOT for item ids)
last_updated: 2026-08-04
playwright_mcp: true
artifacts: tests/e2e/playwright-mcp/role-wise-portal-menu-stability-artifacts/
suite: role-wise-portal-menu-stability
---

# Role-wise Portal Menu Stability — E2E Scenario Plan (Django Admin SSR)

**Surface:** Tenant admin sidebar `#dfms-nav-sidebar` (RBAC portal nav), not Platform admin.

**Goal:** For every operational seed role, the **exact** set of sidebar section headings + item labels matches the locked matrix (same contract as unit test `EXPECTED_ROLE_MENUS`, asserted on **visible labels**).

**Companion (fast gate):** `tests/unit/test_core/test_role_menu_stability.py` — id-level matrix; update both when menus change intentionally.

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).

---

## Seed prerequisites

1. Stack up: `make local` (or compose equivalent); hosts resolve for `nourish.dev.dfms.local`.
2. `make seed` so operational role logins exist.
3. Credentials: `docs/testing/playwright-mcp-credentials.yaml` (domain `yopmail.com`).
4. No FG/RM sandbox required — menu visibility only.
5. Working-site picker: ignore / dismiss if present; do **not** change assertions based on POI.

| Role code | Login email | Password |
|-----------|-------------|----------|
| `depot_officer` | `depot.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `feed_mill_officer` | `feed.mill.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `commercial_officer` | `commercial.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `procurement_officer` | `procurement.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `distribution_officer` | `distribution.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `distribution_manager` | `distribution.manager1.nourish@yopmail.com` | `Nourish@1234!` |
| `transport_planner` | `transport.planner1.nourish@yopmail.com` | `Nourish@1234!` |
| `tdo_vendor_fleet` | `tdo.vendor.fleet1.nourish@yopmail.com` | `Nourish@1234!` |
| `poi_admin` | `poi.admin1.nourish@yopmail.com` | `Nourish@1234!` |
| `command_center_officer` | `command.center.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `gateman` | `gateman1.nourish@yopmail.com` | `Nourish@1234!` |
| `scaling_operator` | `scaling.operator1.nourish@yopmail.com` | `Nourish@1234!` |
| `loading_personnel` | `loading.personnel1.nourish@yopmail.com` | `Nourish@1234!` |
| `unloading_personnel` | `unloading.personnel1.nourish@yopmail.com` | `Nourish@1234!` |
| `qc_inspector_physical` | `qc.inspector.physical1.nourish@yopmail.com` | `Nourish@1234!` |
| `qa_lab_technician` | `qa.lab.technician1.nourish@yopmail.com` | `Nourish@1234!` |
| `driver_supervisor` | `driver.supervisor1.nourish@yopmail.com` | `Nourish@1234!` |
| `account_officer` | `account.officer1.nourish@yopmail.com` | `Nourish@1234!` |
| `driver` | `driver1@yopmail.com` (**not** `driver1.nourish@…`) | `Nourish@1234!` |

---

## Expected menu matrix (visible labels)

Assert **exact ordered** flat list: scrape each `.dfms-nav-group` → heading = `.dfms-nav-group-label`, items = `.dfms-nav-item-label` textContent (trim). Compare case-insensitively **or** normalize whitespace; prefer exact match to labels below (as rendered).

| Role | Expected `Section › Item` (ordered) |
|------|-------------------------------------|
| `depot_officer` | Overview › Dashboard; Requisition › Finished Goods |
| `feed_mill_officer` | Overview › Dashboard; Requisition › Finished Goods |
| `commercial_officer` | Overview › Dashboard; Port Shipments › Port Shipments |
| `procurement_officer` | Overview › Dashboard; Procurement › Port Shipments; Procurement › Transport requests |
| `distribution_officer` | Overview › Dashboard; Distribution › Product requisitions; Distribution › Transport requests |
| `distribution_manager` | Overview › Dashboard; Distribution › Product requisitions; Distribution › Transport requests |
| `transport_planner` | Overview › Dashboard; Transport › Live GPS; Transport › Transport requests; Transport › Transport orders; Transport › Vehicle planning; Master Data › Vehicle Brands; Master Data › Vehicles; Master Data › Helpers; Vendors › Vendors; Users & Access › Drivers |
| `tdo_vendor_fleet` | Overview › Dashboard; Transport › Live GPS; Transport › Transport orders; Transport › Bids management; Vendors › Vendors |
| `poi_admin` | Overview › Dashboard; Gate › Vehicle Entry (Gate-In); Gate › Vehicle Exit (Gate-Out); Gate › Active Visits; Gate › Visit History; Gate › On-Demand TO; Command Center › Queue; Command Center › Bay Assignments; Command Center › Waiting Serials; Loading › Load Events; Loading › Start Loading; Unloading › Unload Events; Unloading › Start Unloading; QC Checkpoint › QC Queue; QC Checkpoint › New Sample; QC Checkpoint › Decisions; Scaling › Scale-In; Scaling › Scale-Out; Scaling › Queue Tokens; Scaling › Gate Passes; Users & Access › Drivers |
| `command_center_officer` | Overview › Dashboard; Command Center › Queue; Command Center › Bay Assignments; Command Center › Waiting Serials |
| `gateman` | Overview › Dashboard; Gate › Vehicle Entry (Gate-In); Gate › Vehicle Exit (Gate-Out); Gate › Active Visits; Gate › Visit History; Gate › On-Demand TO |
| `scaling_operator` | Overview › Dashboard; Scaling › Scale-In; Scaling › Scale-Out; Scaling › Queue Tokens; Scaling › Gate Passes |
| `loading_personnel` | Overview › Dashboard; Loading › Load Events; Loading › Start Loading |
| `unloading_personnel` | Overview › Dashboard; Unloading › Unload Events; Unloading › Start Unloading |
| `qc_inspector_physical` | Overview › Dashboard; QC Checkpoint › QC Queue; QC Checkpoint › New Sample; QC Checkpoint › Decisions |
| `qa_lab_technician` | Overview › Dashboard; Requisition › Finished Goods |
| `driver_supervisor` | Overview › Dashboard; Fleet operations › Dispatch queue; Fleet operations › Under Maintenance; Fleet operations › Inspection records; Driver Management › Driver Attendance; Driver Management › Driver Leave Management; Users & Access › Drivers |
| `account_officer` | Overview › Dashboard; Requisition › Finished Goods |
| `driver` | Overview › Dashboard; Transport › Transport orders; Trips › My Trips; Trips › POD Records |

**Must never appear for any operational role above (except as listed):** Tenant Admin–only groups such as full Master Data catalog (POIs, Dealers, Suppliers, Products, …), Users (user admin), Audit Logs — unless the role’s row includes them.

---

## A — Exact matrix per operational role

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Depot Officer menu matrix | Clear cookies. Open `http://nourish.dev.dfms.local:8000/admin/login/`. Sign in as **Depot Officer** (`depot.officer1.nourish@yopmail.com` / `Nourish@1234!`). Land on `/admin/` (not login/OTP). Hide `#djDebug*`. Scrape `#dfms-nav-sidebar` flat `Section › Item` list. Assert **exact** match to matrix row `depot_officer`. Assert sections **Gate**, **Transport**, **Master Data**, **Vendors**, **Users & Access** are absent. | P0 | Planned |
| TC02 | Feed Mill Officer menu matrix | As **Feed Mill Officer** (`feed.mill.officer1.nourish@yopmail.com`), login and scrape sidebar. Assert exact match to `feed_mill_officer` (Overview › Dashboard; Requisition › Finished Goods only). | P0 | Planned |
| TC03 | Commercial Officer menu matrix | As **Commercial Officer**, assert exact match to `commercial_officer` (Overview › Dashboard; Port Shipments › Port Shipments). Assert **Requisition › Finished Goods** and **Procurement** are absent. | P0 | Planned |
| TC04 | Procurement Officer menu matrix | As **Procurement Officer**, assert exact match to `procurement_officer` (Dashboard + Procurement › Port Shipments + Transport requests). Assert top-level **Port Shipments** group (Commercial-only) is absent. | P0 | Planned |
| TC05 | Distribution Officer menu matrix | As **Distribution Officer**, assert exact match to `distribution_officer`. Assert **Transport**, **Gate**, **Vendors** absent. | P0 | Planned |
| TC06 | Distribution Manager menu matrix | As **Distribution Manager**, assert exact match to `distribution_manager` (same distribution menus as DO). | P0 | Planned |
| TC07 | Transport Planner menu matrix | As **Transport Planner**, assert exact match to `transport_planner` including **Vendors › Vendors**, Master Data (Vehicle Brands, Vehicles, Helpers), Users & Access › Drivers, Transport (Live GPS, Transport requests, Transport orders, Vehicle planning). Assert **Gate** and **Command Center** sections absent. | P0 | Planned |
| TC08 | TDO Vendor Fleet menu matrix | As **TDO Vendor Fleet**, assert exact match to `tdo_vendor_fleet` (Dashboard; Live GPS; Transport orders; Bids management; Vendors). Assert **Master Data**, **Trips**, **Users & Access**, **Fleet operations** absent. | P0 | Planned |
| TC09 | POI-Admin yard menu matrix | As **POI-Admin**, assert exact match to `poi_admin` (Gate + Command Center + Loading + Unloading + QC Checkpoint + Scaling + Drivers). Assert **Requisition**, **Master Data** (POIs/etc.), **Distribution** absent. | P0 | Planned |
| TC10 | Command Center Officer menu matrix | As **Command Center Officer**, assert exact match to `command_center_officer` only. Assert **Gate**, **Loading**, **Scaling**, **Transport** absent. | P0 | Planned |
| TC11 | Gateman menu matrix | As **Gateman**, assert exact match to `gateman`. Assert **Command Center**, **Master Data**, **Scaling** absent. | P0 | Planned |
| TC12 | Scaling Operator menu matrix | As **Scaling Operator**, assert exact match to `scaling_operator`. Assert **Gate**, **Master Data**, **Command Center** absent. | P0 | Planned |
| TC13 | Loading Personnel menu matrix | As **Loading Personnel**, assert exact match to `loading_personnel`. Assert **Unloading**, **Gate**, **Command Center** absent. | P0 | Planned |
| TC14 | Unloading Personnel menu matrix | As **Unloading Personnel**, assert exact match to `unloading_personnel`. Assert **Loading**, **Gate**, **Command Center** absent. | P0 | Planned |
| TC15 | QC Inspector Physical menu matrix | As **QC Inspector – Physical**, assert exact match to `qc_inspector_physical`. Assert **Command Center**, **Requisition** absent. | P0 | Planned |
| TC16 | QA Lab Technician menu matrix | As **QA Lab Technician**, assert exact match to `qa_lab_technician` (Dashboard + Finished Goods only). | P0 | Planned |
| TC17 | Driver Supervisor menu matrix | As **Driver Supervisor**, assert exact match to `driver_supervisor` (Fleet operations + Driver Management + Drivers). Assert **Transport**, **Trips › My Trips / POD Records** absent. | P0 | Planned |
| TC18 | Account Officer menu matrix | As **Account Officer**, assert exact match to `account_officer` (Dashboard + Finished Goods). Assert dedicated **Finance / Costing** sidebar group absent (not implemented in portal nav). | P0 | Planned |
| TC19 | Driver menu matrix | Clear cookies. Sign in as **Driver** (`driver1@yopmail.com` / `Nourish@1234!`). Assert exact match to `driver` (Dashboard; Transport › Transport orders; Trips › My Trips; Trips › POD Records). Assert **Vendors**, **Fleet operations**, **Master Data** absent. | P0 | Planned |

---

## B — Cross-role smoke (optional regression)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC20 | Narrow roles never see Users admin | For **gateman**, **scaling_operator**, and **loading_personnel** (reuse sessions from A or re-login): assert sidebar has **no** **Users & Access › Users** and **no** **Audit Logs**. | P1 | Planned |
| TC21 | TP and TDO both see Vendors only as listed | As **TP** and **TDO**, assert **Vendors › Vendors** present; assert no Vendor **management** items beyond that single hub link in the sidebar (detail CRUD is out of scope — see VM-09). | P1 | Planned |

---

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Automation procedure (every TC in A)

1. `page.context().clearCookies()` then `GET /admin/login/`.
2. Fill `#id_username` / `#id_password`; click `#login-form input[type="submit"]` (**Sign in** only — avoid DJDT submit buttons).
3. Confirm URL is `/admin/` (not login / OTP). Stop and report if OTP.
4. Neutralize Debug Toolbar: hide `#djDebug*` / `pointer-events: none`.
5. Wait for `#dfms-nav-sidebar`.
6. Evaluate:

```js
() => [...document.querySelectorAll('#dfms-nav-sidebar .dfms-nav-group')].flatMap(g => {
  const h = g.querySelector('.dfms-nav-group-label')?.textContent.trim();
  return [...g.querySelectorAll('.dfms-nav-item-label')].map(i => `${h} › ${i.textContent.trim()}`);
})
```

7. Assert deep equality to expected list for that role (order matters).
8. On FAIL: full-page screenshot → `tests/e2e/playwright-mcp/role-wise-portal-menu-stability-artifacts/TC##-failure.png`.

### Prefer suite runner

Optional: one `run-role-menu-stability.js` looping all accounts (same pattern as prior MCP menu crawl) writing `RESULTS.md`.

### Scope guardrails — this plan does NOT cover

- Tenant Admin / Tenant Super Admin full catalog (separate if needed).
- Platform (`admin.dev.dfms.local`) nav.
- Clicking each menu item / deep page ACL (sidebar visibility only).
- Non-menu permission codes (write/delete) beyond what the sidebar exposes.
- `driver_helper` (no seeded MCP account in credentials YAML).

### Alignment

- Labels must match `apps/core/portal_navigation.py` item `label` / section `heading` (code wins over marketing copy).
- Unit matrix uses **item ids**; E2E uses **visible labels**. Intentional menu change → update **both** this plan’s matrix table and `EXPECTED_ROLE_MENUS`.
- Driver seed email drift: YAML lists `driver1.nourish@yopmail.com`; live seed that authenticates is `driver1@yopmail.com` — TC19 uses the working address.

### Artifacts

| Item | Path |
|------|------|
| Suite folder | `tests/e2e/playwright-mcp/role-wise-portal-menu-stability-artifacts/` |
| Summary | `…/RESULTS.md` |
| Failure shots | `…/TC##-failure.png` |

### Suggested next step

Run TC01–TC19 via Playwright MCP (`browser_run_code_unsafe` loop or suite runner); write `RESULTS.md`; set Status column Pass/Fail; append MCP run history.
