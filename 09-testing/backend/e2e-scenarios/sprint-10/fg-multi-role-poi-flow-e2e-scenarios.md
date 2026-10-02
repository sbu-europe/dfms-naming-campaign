---
module: 04-requisitions
specification: Sprint 10 — Multi-role users complete the Finished Goods flow inside one POI — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 2
related_stories: TUM-06, PR-01, FB-007, FB-017
source_spec: ../../../../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role Tenant Users/TUM-06-multi-role-assignment.md
implementation_reference:
  - apps/users/yard_constants.py (POI_SCOPED_ROLE_CODES)
  - apps/users/working_role.py (Select Role; one working role, no permission union)
  - apps/operations/yard_poi.py (Working site lists only the working role’s sites; unset site fails closed)
  - apps/requisitions/role_access.py (scope_prs_for_local_role; distribution queue is not POI-scoped)
  - apps/requisitions/admin.py (Destination POI disabled to the requester’s primary site)
  - templates/admin/includes/role_profile_switcher.html (#dfms-role-select)
  - templates/admin/includes/poi_profile_switcher.html (#dfms-poi-select)
last_updated: 2026-10-02
last_mcp_run: 2026-10-02
last_mcp_verdict: 25/25 Pass
artifacts: tests/e2e/playwright-mcp/fg-multi-role-poi-flow-artifacts/
playwright_mcp: true
---

# Multi-role Finished Goods flow — POI fence — E2E Scenario Plan (Django Admin SSR)

**Story:** [TUM-06 — Assign Multiple Operational Roles to One User](../../../../../03-backlog/phase-2/sprints/sprint-10/01-Multi-role%20Tenant%20Users/TUM-06-multi-role-assignment.md)

Target runner: **Playwright MCP** against seeded Nourish (`docs/guides/playwright-mcp-admin.md`).  
Credentials: `docs/testing/playwright-mcp-credentials.yaml`.

**2026-10-02 — All 25 test cases passed** (TC01–TC25). Suite signed off via Playwright MCP against Nourish admin. RUN_ID `26ED230F`. TC08 rechecked after Finished Goods create was limited to the selected working role.

**Last MCP run:** 2026-10-02 · [RESULTS.md](../../../../../tests/e2e/playwright-mcp/fg-multi-role-poi-flow-artifacts/RESULTS.md)  
Accounts: `superadmin.nourish@yopmail.com`, `mcp-fgmr-dest-26ed230f@yopmail.com`, `mcp-fgmr-src-26ed230f@yopmail.com`, fixture driver `mcp.drv.26ed230f@example.com`.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-10-02 | **25/25** | TC08 recheck Pass. Distribution Officer add is 403. Earlier cases the same day stayed Pass. |
| 2026-10-02 | **24/25** | TC08 Fail — Distribution Officer could still open Submit Requisition. |

Sibling plans (do not re-test their field validation here):

- Assignment UX: [tum-06-multi-role-assignment-e2e-scenarios.md](./tum-06-multi-role-assignment-e2e-scenarios.md)
- Single-role FG chain: [finished-goods-workflow/README.md](../finished-goods-workflow/README.md)

This plan seeds **two multi-role users**. Every **local** role on a user is bound to **one** POI, and the two users use **different** POIs. One user creates the Finished Goods product requisition while **Depot Officer** is selected, then both users finish the FG chain by switching role. While a local role is selected, that user can operate that role’s screens for the selected site and cannot see or act on the other POI.

**Global hats are not POI-fenced.** Distribution Officer, Distribution Manager, Transport Planner, and Driver Supervisor see tenant-wide queues. The fence is asserted only after **Select Role** is a local role and **Working site** is that role’s POI.

**Driver** cannot be combined with another role (`Driver cannot be combined with any other role.`). Trip start uses the FG fixture driver, not these two accounts.

## Seed prerequisites

Create both users as **Tenant Super Admin** (`superadmin.nourish@yopmail.com`) via **Users & Access → Users → Add user** (`/admin/users/invitationtoken/add/`). Per-role **Sites** chips (not one shared site). `otp_type=none`. Activate at `/activate/?token=...`. Do not edit seed `depot.officer1`, `gateman1`, `distribution.officer1`, or `distribution.manager1`.

POIs and products come from `make seed-mcp-fg RUN_ID=…`: destination `MCP-D-<RUN_ID>`, source `MCP-S-<RUN_ID>`, products `MCP-FG-<RUN_ID>-1` / `-2`. Each local role below has **exactly one** site, and that row is the primary `UserOperationalPOI`.

| Account | Email | Local roles (one site) | Global roles (no site) |
|---------|--------|------------------------|------------------------|
| Destination multi-role | `mcp-fgmr-dest-<RUN_ID>@yopmail.com` | **Depot Officer**, **Gateman**, **Scaling Operator**, **Command Center Officer**, **Unloading Personnel** — all @ `MCP-D-<RUN_ID>` | **Distribution Officer (DO)** |
| Source multi-role | `mcp-fgmr-src-<RUN_ID>@yopmail.com` | **Feed Mill Officer**, **Gateman**, **Scaling Operator**, **Command Center Officer**, **Loading Personnel** — all @ `MCP-S-<RUN_ID>` | **Distribution Manager (DM)**, **Transport Planner (TP)**, **Driver Supervisor** |
| Trip start only | FG fixture driver from the same `RUN_ID` | — | **Driver** (exclusive; not on the two accounts) |

Wipe emails `mcp-fgmr-*@yopmail.com` and special instructions `MCP FGMR <RUN_ID>`.

## A — Two users, two POIs

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Destination user has local roles only at the destination POI | As **Tenant Super Admin**, open the destination user at `/admin/users/user/<uuid>/change/`. Assert **Select Role** candidates saved on the user are **Depot Officer**, **Gateman**, **Scaling Operator**, **Command Center Officer**, **Unloading Personnel**, and **Distribution Officer (DO)**. Assert each local role’s Sites chips contain only `MCP-D-<RUN_ID>` (not `MCP-S-<RUN_ID>`, not the rest of the catalog). Assert **Distribution Officer (DO)** has no Sites chips. | P0 | Pass |
| TC02 | Source user has local roles only at the source POI | On the source user change form, assert local roles **Feed Mill Officer**, **Gateman**, **Scaling Operator**, **Command Center Officer**, and **Loading Personnel** each have Sites = `MCP-S-<RUN_ID>` only. Assert **Distribution Manager (DM)**, **Transport Planner (TP)**, and **Driver Supervisor** have no Sites chips. Assert **Driver** is not assigned. | P0 | Pass |

## B — Selected local role creates the PR inside its POI

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC03 | Depot Officer menu is the requester menu; list stays empty until Working site is the destination | Log in as `mcp-fgmr-dest-<RUN_ID>@yopmail.com` at `/admin/login/`. Open the profile menu and set **Select Role** (`#dfms-role-select`) to **Depot Officer**. Assert **Working site** (`#dfms-poi-select`) lists only `MCP-D-<RUN_ID>`. Before a site is chosen, open **Requisition → Finished Goods** (`/admin/requisitions/productrequisition/`) and assert `#result_list` has no PR rows. Select **Working site** = destination. Assert the sidebar shows **Dashboard** and **Requisition** (child **Finished Goods** only). Assert **Distribution**, **Gate**, **Scaling**, **Command Center**, **Loading**, **Unloading**, **Transport**, and **Fleet** are absent. | P0 | Pass |
| TC04 | Multi-role user submits an FG PR locked to the destination POI | Stay as **Depot Officer** with **Working site** = `MCP-D-<RUN_ID>`. Click **Add Product Requisition**. Assert **Destination POI** (`#id_destination_poi`) is disabled and shows `MCP-D-<RUN_ID>` only. Add one Finished Goods line (`MCP-FG-<RUN_ID>-1`) with a positive **Product quantity**, set **Preferred delivery date & time** in the future, set **Special instructions** to `MCP FGMR <RUN_ID>`, and click **Submit Requisition** (`name="_submit_requisition"`). Assert the success message, a generated `pr_number` (`PR-FG-…`), and status badge **Submitted** (`submitted`). Assert the Finished Goods changelist shows this PR and no PR whose destination is `MCP-S-<RUN_ID>`. | P0 | Pass |
| TC05 | Feed Mill Officer at the source POI cannot see or target the destination PR | Log in as `mcp-fgmr-src-<RUN_ID>@yopmail.com`. Set **Select Role** to **Feed Mill Officer** and **Working site** to `MCP-S-<RUN_ID>`. Open **Requisition → Finished Goods**. Assert the destination user’s `pr_number` from TC04 is not listed. Open **Add Product Requisition** and assert **Destination POI** is disabled on `MCP-S-<RUN_ID>`. Submit a second PR (product `MCP-FG-<RUN_ID>-2`, future delivery, special instructions `MCP FGMR <RUN_ID> SRC`) with **Submit Requisition**. Assert status **Submitted** and destination `MCP-S-<RUN_ID>`. Do not create a TR from this PR; it exists only to prove the fence. | P0 | Pass |
| TC06 | Each requester still sees only their own POI after both PRs exist | As the destination user, **Select Role** = **Depot Officer**, **Working site** = `MCP-D-<RUN_ID>`. Assert Finished Goods lists the TC04 PR and does not list the TC05 PR. Open `/admin/requisitions/productrequisition/<tc05-uuid>/change/` and assert permission denied or the record is not shown. As the source user, **Feed Mill Officer** @ `MCP-S-<RUN_ID>`, assert the reverse: TC05 is listed, TC04 is not, and the TC04 change URL is denied. | P0 | Pass |
| TC07 | Depot Officer cannot open distribution or the other site’s gate | As the destination user still on **Depot Officer**, open `/admin/requisitions/transportrequisition/add/` and `/admin/operations/gatein/add/`. Assert permission denied or a non-operable admin (no **Create Transport Request**, no Gate-In save). Assert **Create TR** is absent on the Finished Goods row. | P0 | Pass |

## C — Same users finish TR, approval, TO, and dispatch

Global roles hide **Working site**. They are allowed to see both POIs. Approval must be the other user.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Switching to Distribution Officer drops the POI fence and the requester menu | As the destination user, set **Select Role** to **Distribution Officer (DO)** without logging out. Assert **Working site** is hidden. Assert **Distribution → Product requisitions** (`/admin/requisitions/productrequisition/?pr_type=FINISHED_GOODS`) lists **both** TC04 and TC05 with status **Submitted**. Assert **Create TR** is on the TC04 row and **Approve** is absent. Assert **Requisition → Finished Goods** add is not offered as the depot requester form (no **Submit Requisition** for a new depot PR). | P0 | Pass |
| TC09 | Distribution Officer on the destination user creates the TR from that user’s PR | On the TC04 PR, click **Create TR**. Assert `/admin/requisitions/transportrequisition/create-from-pr/<pr_uuid>/`. Set **Source POI** to `MCP-S-<RUN_ID>` (not the destination), set **Delivery Date** in the future, allocate the full remaining quantity, remarks `MCP FGMR <RUN_ID>`. Click **Create Transport Request**. Assert `tr_number` (`TR-FG-…`) and status **Pending Approval** (`pending_approval`). Stay on this user and assert **Approve** and **Reject** are absent on the TR. | P0 | Pass |
| TC10 | Source user approves as Distribution Manager; the creator still cannot | Log in as the source user. Set **Select Role** to **Distribution Manager (DM)**. Assert **Working site** is hidden. Open the TC09 TR and click **Approve** (`/admin/requisitions/transportrequisition/<uuid>/approve/`), then submit **Approve**. Assert status **Available for Transport Planning** (`available_for_transport_planning`). Log back in as the destination user on **Distribution Officer (DO)** and assert **Approve** is still absent on that TR. | P0 | Pass |
| TC11 | Source user plans the transport order as Transport Planner | As the source user, set **Select Role** to **Transport Planner (TP)**. Open the approved TR and create one TO: **Number of TOs** = 1, **Fleet type** = **Own Fleet**, choose the FG fixture vehicle type, vehicle, and driver, allocate the full remaining quantity, set a future **Planned delivery date/time**, click **Create Transport Order**. Assert `to_number` and status **Created** (`created`), then complete own-fleet assignment until status **Assigned**. Assert **Working site** stays hidden on this role. | P0 | Pass |
| TC12 | Source user dispatches as Driver Supervisor | As the source user, set **Select Role** to **Driver Supervisor**. Open **Fleet → Dispatch queue** (`/admin/fleet_supervisor/vehicleinspection/dispatch-queue/`). Assert the TC11 TO is listed at **Assigned**. Run **Ready for dispatch**. Assert status **Ready for Dispatch** (`ready_for_dispatch`). | P0 | Pass |
| TC13 | Driver trip start stays on the exclusive driver account | Log in as the FG fixture **Driver** (not either multi-role user). Open **My Trips** (`/admin/transport/drivertransportorder/`) and record **Trip start** on the TC12 TO. Assert status **Driving Towards Source**. As **Tenant Super Admin**, confirm neither multi-role user has **Driver** in **Select Role**. | P0 | Pass |

## D — Source local roles operate the source site only

On every row, the source user sets **Select Role** to the named local role and **Working site** to `MCP-S-<RUN_ID>` before acting. The destination user, on the same local role with **Working site** = `MCP-D-<RUN_ID>`, must not see the source visit and must not be able to save the source action.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC14 | Gateman at the source records Gate-In; destination Gateman cannot | TO is **Driving Towards Source**. As the source user on **Gateman** @ `MCP-S-<RUN_ID>`, open **Gate → Vehicle Entry (Gate-In) → Add** (`/admin/operations/gatein/add/`), select the TO, complete mandatory fields, and save. Assert TO status **At Source**. Assert **Working site** options are only `MCP-S-<RUN_ID>`. As the destination user on **Gateman** @ `MCP-D-<RUN_ID>`, assert this visit is absent from Gate-In and the source Gate-In change URL is denied. Assert the destination user’s **Working site** list does not include `MCP-S-<RUN_ID>`. | P0 | Pass |
| TC15 | Scaling Operator at the source records Scale-In only for that site | As the source user, set **Select Role** to **Scaling Operator** and **Working site** to `MCP-S-<RUN_ID>`. Open **Scaling → Scale-In → Add**, select the TC14 visit, enter a positive `scale_in_weight_mt` and a unique P.C. code, and save. Assert sub-state **Scale In (Source)** / queue **Waiting for Command Center**. As the destination user on **Scaling Operator** @ `MCP-D-<RUN_ID>`, assert this weighing session is not listed and Scale-In add does not offer the source visit. | P0 | Pass |
| TC16 | Command Center at the source assigns a loading point | As the source user on **Command Center Officer** @ `MCP-S-<RUN_ID>`, open **Command Center → Queue** (`?status__exact=waiting`). Click **Assign loading point**, select the source loading point, and save. Assert sub-state **Assigned Loading Point**. As the destination user on **Command Center Officer** @ `MCP-D-<RUN_ID>`, assert this queue row is absent. | P0 | Pass |
| TC17 | Loading Personnel at the source completes loading; unloading is not available | As the source user on **Loading Personnel** @ `MCP-S-<RUN_ID>`, open **Loading → Start Loading** (`/admin/operations/loadevent/add/`), start the assigned point, then end it with line quantities. Assert sub-state **Loading Completed**. Assert the sidebar is the loading menu. Open `/admin/operations/unloadevent/add/` and assert it is denied. As the destination user on **Unloading Personnel** @ `MCP-D-<RUN_ID>`, assert **Start Loading** for this source visit is not available. | P0 | Pass |
| TC18 | Scaling Operator at the source records Scale-Out | As the source user on **Scaling Operator** @ `MCP-S-<RUN_ID>`, open **Scaling → Scale-Out → Add** for the same visit and save a positive scale-out weight. Assert source scale-out is recorded. As the destination user on **Scaling Operator** @ `MCP-D-<RUN_ID>`, assert this scale-out is not listed. | P0 | Pass |
| TC19 | Gateman at the source records Gate-Out | As the source user on **Gateman** @ `MCP-S-<RUN_ID>`, open **Gate → Vehicle Exit (Gate-Out) → Add** (`/admin/operations/gateout/add/`), select the active visit, pass clearance, and save. Assert TO status **Driving Towards Destination**. As the destination user on **Gateman** @ `MCP-D-<RUN_ID>`, assert this source Gate-Out is not listed. | P0 | Pass |

## E — Destination local roles operate the destination site only

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC20 | Gateman at the destination records Gate-In; source Gateman cannot | TO is **Driving Towards Destination**. As the destination user on **Gateman** @ `MCP-D-<RUN_ID>`, **Gate → Vehicle Entry (Gate-In) → Add**, select the TO, save. Assert TO status **At Destination**. As the source user on **Gateman** @ `MCP-S-<RUN_ID>`, assert this destination visit is absent and the change URL is denied. | P0 | Pass |
| TC21 | Scaling Operator at the destination records Scale-In | As the destination user on **Scaling Operator** @ `MCP-D-<RUN_ID>`, **Scaling → Scale-In → Add** for the TC20 visit. Assert the destination queue is **Waiting for Command Center**. As the source user on **Scaling Operator** @ `MCP-S-<RUN_ID>`, assert the destination weighing session is not listed. | P0 | Pass |
| TC22 | Command Center at the destination assigns an unloading point | As the destination user on **Command Center Officer** @ `MCP-D-<RUN_ID>`, open **Command Center → Queue**, click **Assign unloading point**, save the destination unloading point. Assert sub-state **Assigned Unloading Point**. As the source user on **Command Center Officer** @ `MCP-S-<RUN_ID>`, assert this queue row is absent. | P0 | Pass |
| TC23 | Unloading Personnel at the destination completes unloading | As the destination user on **Unloading Personnel** @ `MCP-D-<RUN_ID>`, open **Unloading → Start Unloading** (`/admin/operations/unloadevent/add/`), start the assigned point, then end it. Assert sub-state **Unloading Completed**. Assert **Working site** lists only `MCP-D-<RUN_ID>`. Open `/admin/operations/loadevent/add/` and `/admin/operations/gateout/add/` and assert both are denied. As the source user on **Loading Personnel** @ `MCP-S-<RUN_ID>`, assert this unload is not listed. | P0 | Pass |
| TC24 | Scaling Operator at the destination records Scale-Out | As the destination user on **Scaling Operator** @ `MCP-D-<RUN_ID>`, **Scaling → Scale-Out → Add** for the destination visit and save. Assert destination scale-out is recorded. As the source user on **Scaling Operator** @ `MCP-S-<RUN_ID>`, assert it is not listed. | P0 | Pass |
| TC25 | Gateman at the destination records Gate-Out and the TO closes | As the destination user on **Gateman** @ `MCP-D-<RUN_ID>`, **Gate → Vehicle Exit (Gate-Out) → Add**, select the active destination visit, pass clearance, and save. Assert TO status **Closed** (`closed`) with no separate **Close TO** action. As the source user on **Gateman** @ `MCP-S-<RUN_ID>`, assert this Gate-Out is not listed. Re-open the TO as **Transport Planner (TP)** on the source user and assert the closed TO is read-only. | P0 | Pass |

## Implementation Notes (Playwright + Django Admin SSR)

- Automation drives Django admin SSR only. No REST calls. No email or OTP (`otp_type=none`, activate like TUM-06).
- **Select Role** is `#dfms-role-select` inside `#dfms-role-profile` (profile menu). **Working site** is `#dfms-poi-select` inside `#dfms-poi-profile`. Changing either control submits its form; do not assume a second login.
- A local working role shows **Working site** even when that role has one site. Yard queues and the Finished Goods list for a local role are empty until a site is selected (`get_working_poi_for_request` returns none). After a role switch, re-select **Working site** if the control is visible; a role change does not pick a site.
- **Destination POI** on Add PR uses the working requester role’s primary `UserOperationalPOI`, and the control is `disabled`. These users have one site per local role, so that site and **Working site** are the same POI. Do not assign a second site to **Depot Officer** or **Feed Mill Officer** in this plan.
- Distribution Officer and Distribution Manager see submitted FG PRs for every destination (`user_sees_fg_queue`). Seeing both TC04 and TC05 while **Distribution Officer (DO)** is selected is expected. The POI fence applies again only after switching back to a local role.
- The source user’s Feed Mill PR (TC05) must not be turned into a TR. The chain is TC04 → TC09 → TC25.
- Self-approval: the destination user creates the TR; the source user approves it. Do not put **Distribution Manager (DM)** on the destination user.
- **Driver** is exclusive. TC13 uses the driver created by `make seed-mcp-fg` for this `RUN_ID`.
- Stable paths: FG changelist `/admin/requisitions/productrequisition/`; submit `name="_submit_requisition"`; TR create `/admin/requisitions/transportrequisition/create-from-pr/<uuid>/`; approve `/admin/requisitions/transportrequisition/<uuid>/approve/`; dispatch queue `/admin/fleet_supervisor/vehicleinspection/dispatch-queue/`; My Trips `/admin/transport/drivertransportorder/`; Gate-In `/admin/operations/gatein/add/`; Gate-Out `/admin/operations/gateout/add/`; Scale-In / Scale-Out under **Scaling**; load `/admin/operations/loadevent/add/`; unload `/admin/operations/unloadevent/add/`.
- Selectors: `#content-main`, `#result_list`, `.messagelist`, `.errorlist`. Hide the Django Debug Toolbar before **Submit Requisition** if it covers the button.
- Status badges to persist: PR `submitted`; TR `pending_approval` then `available_for_transport_planning`; TO `created` → `assigned` → `ready_for_dispatch` → `driving_towards_source` → `at_source` → `driving_towards_destination` → `at_destination` → `closed`.
- Scope guardrail: this plan does not repeat PR line validation, TR past-date rules, partial allocation, multi-point bays, stock math, or live GPS. Those stay in the section plans under `finished-goods-workflow/`. It does not cover permission union, CSV import, or REST invite.
- Known alignment: TUM-06 TC21b said a single assigned POI hides **Working site**. Current `user_needs_poi_switcher` shows it whenever the local role has at least one site. Follow this plan, not TC21b, for these users.
- Suggested next step: seed `RUN_ID` with `make seed-mcp-fg`, create the two `mcp-fgmr-*` users, then run TC01–TC25. Section-level field checks stay on the existing FG plans.
