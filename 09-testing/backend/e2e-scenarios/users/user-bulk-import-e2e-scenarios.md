---
module: 12-users
specification: User Bulk CSV Import (Django Admin) — Playwright E2E Scenario Plan
version: 1.1
phase: Phase 1
related_stories: US-005, YARD-01
source_spec: ../../05-modules/02-master-data/bulk-import-export.md
implementation_reference:
  - ../../../apps/users/admin.py (UserBulkImportAdmin, BulkImportExportMixin)
  - ../../../apps/users/import_configs.py (UserImportConfig)
  - ../../../apps/users/invitation_service.py (_resolve_invitation_poi)
  - ../../../apps/users/yard_constants.py (POI_SCOPED_ROLE_CODES)
  - ../../../templates/admin/master_data/bulk_import_upload.html
  - ../../../templates/admin/master_data/bulk_import_preview.html
  - ../../../templates/admin/master_data/bulk_import_status.html
last_updated: 2026-07-21
playwright_mcp: true
---

# Users — Bulk CSV Import — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Users → **Users** → **Import**

Scope: Tenant Admin (or Super Admin) bulk-importing users via Django Admin CSV upload → Celery validate → preview → confirm → execute. Covers RBAC gating, template/columns, preview validation, non–POI-scoped happy path, and POI-scoped roles via optional CSV column `poi_code`.

Target runner: **Playwright MCP** against seeded Nourish tenant (`docs/guides/playwright-mcp-admin.md`).

## Access & upload page

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Tenant Admin opens Users Import | As **Tenant Admin** (`admin.nourish@yopmail.com`), log in at `/admin/login/`, open **Users → Users** (`/admin/users/user/`). Assert changelist shows **Import** link. Click **Import**. Assert upload page at `/admin/users/user/import/` with heading **Import users**, **CSV File** input (`#csv_file`), **Upload and Validate**, **Download CSV Template**, and **Download Sample CSV**. | P0 | Planned |
| TC02 | Non-admin denied Users Import | As **Depot Officer** (`depot.officer1.nourish@yopmail.com`), open `/admin/users/user/import/` directly. Assert redirect to Users changelist (or non-operable import) and error message **You do not have permission to import users.** Import must not create a `BulkImportJob`. | P0 | Planned |
| TC03 | Required / optional columns listed | As **Tenant Admin** on `/admin/users/user/import/`, assert **Required Columns** lists `email`, `employee_id`, `first_name`, `last_name`, `role`. Assert **Optional Columns** include `department`, `phone_number`, `otp_type`, `poi_code`. Assert Field Rules note that `poi_code` is required for POI-scoped roles when creating invites. | P0 | Planned |
| TC04 | CSV template headers match config | As **Tenant Admin** on Import page, click **Download CSV Template** (`?template=1`). Assert downloaded CSV header row is exactly: `email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code`. | P1 | Planned |

## Preview validation (negatives)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC05 | Missing required field invalid at preview | As **Tenant Admin**, upload a 1-row CSV with blank `email` (other columns filled with unique `MCP-` / `RUN_ID` values and `role=transport_planner`). Click **Upload and Validate**. Wait until status leaves **Validating CSV...** / `validating` and **Import Preview** loads (`preview_ready`). Assert summary **Invalid** ≥ 1, row status **Invalid**, and Errors contain `email: This field is required.` Confirm button **Import 0 Valid Rows** is disabled. | P0 | Planned |
| TC06 | Unknown role invalid at preview | As **Tenant Admin**, upload CSV with unique email/`employee_id` and `role=not_a_real_role`. After preview ready, assert row **Invalid** with error mentioning unknown / not a valid choice for `role`. No user created for that email. | P0 | Planned |
| TC07 | Invalid email rejected at preview | As **Tenant Admin**, upload CSV with `email=not-an-email` and otherwise valid `transport_planner` row. Assert preview row **Invalid** with `email` validation error. | P1 | Planned |

## Happy path (non–POI-scoped role)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC08 | Import transport_planner succeeds end-to-end | As **Tenant Admin**, upload 1-row CSV: `email=mcp.bulk.tp.<RUN_ID>@yopmail.com`, `employee_id=MCP-EMP-TP-<RUN_ID>`, names, `role=transport_planner`, `otp_type=none` (leave `poi_code` blank). Wait for **Import Preview** with **Valid** = 1. Click **Import 1 Valid Rows**. Wait until status shows **Import Complete** (`completed`) and **Records Imported** ≥ 1. On `/admin/users/user/?q=mcp.bulk.tp.<RUN_ID>`, assert inactive/invited user exists for that email. | P0 | Planned |

## POI-scoped role — Site (POI)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC09 | POI-scoped role without poi_code invalid at preview | As **Tenant Admin**, upload 1-row CSV: `email=mcp.bulk.depot.<RUN_ID>@yopmail.com`, `employee_id=MCP-EMP-DO-<RUN_ID>`, names, `role=depot_officer`, `otp_type=none`, blank `poi_code`. Assert **Import Preview** shows **Invalid** ≥ 1 and Errors contain `poi_code: Site (POI) is required for this role.` Confirm button disabled (**Import 0 Valid Rows**). No user created for that email. | P0 | Planned |
| TC10 | POI-scoped role with valid poi_code imports | As **Tenant Admin**, upload 1-row CSV for `depot_officer` with unique `mcp.bulk.depot.ok.<RUN_ID>@yopmail.com` / `MCP-EMP-DO-OK-<RUN_ID>` and `poi_code` set to an **active** seeded POI (e.g. `CTG-001` or session MCP POI). Assert preview **Valid** = 1; click **Import 1 Valid Rows**; wait for **Import Complete**. Assert inactive/invited user exists; invitation (or activation path) carries that Site (POI). | P0 | Planned |
| TC11 | Gateman without poi_code invalid at preview | Repeat TC09 with `role=gateman` and unique `mcp.bulk.gate.<RUN_ID>@yopmail.com` / `MCP-EMP-GT-<RUN_ID>`. Assert preview **Invalid** with Site (POI) / `poi_code` required message. | P1 | Planned |
| TC12 | Non–POI-scoped role rejects poi_code | As **Tenant Admin**, upload `transport_planner` row with `poi_code` set to a valid POI. Assert preview **Invalid** with `poi_code: POI must not be set for this role.` | P1 | Planned |

## Upload guards

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC13 | Upload without file blocked | As **Tenant Admin** on Import page, submit **Upload and Validate** without selecting a file. Assert stay on upload page with error **Please select a CSV file to upload.** (or browser `required` on `#csv_file`) and no new preview job. | P1 | Planned |
| TC14 | Non-CSV rejected | As **Tenant Admin**, upload a `.txt` (or other non-`.csv`) file. Assert error **Only .csv files are accepted** and no successful validate redirect to a completed preview. | P1 | Planned |

## Implementation Notes (Playwright MCP + Django Admin SSR)

### Scope guardrails

- In scope: Users changelist **Import** flow for `model_name=user` (`UserImportConfig`), RBAC for tenant/super admin, preview validation (including `poi_code`), confirm/execute outcome, wipe-friendly MCP emails.
- Out of scope: Driver/Helper bulk import, supplier/dealer `site_poi_code`, REST `/bulk-imports/` API, activation SSR (`/activate/`), email delivery of invitations, subscription seat limits.

### Role & environment fixtures

| Item | Value |
|------|--------|
| Tenant | `http://nourish.dev.dfms.local:8000` |
| Login | `/admin/login/` |
| Primary actor | `admin.nourish@yopmail.com` / `NourishAdmin@1234!` (`nourish_tenant_admin`) |
| Denied actor (TC02) | `depot.officer1.nourish@yopmail.com` / `Nourish@1234!` |
| Credentials registry | `docs/testing/playwright-mcp-credentials.yaml` |
| Celery | Worker must be running — validate/execute are async (`validate_bulk_import` / `execute_bulk_import`) |
| Artifacts | `tests/e2e/playwright-mcp/user-bulk-import-artifacts/` (`RESULTS.md`, failure screenshots) |
| Active POI for TC10 | Seeded `CTG-001` or any active tenant POI code visible in Master Data |

### CSV fixture conventions

Use one `RUN_ID` (8 hex) per MCP session. Example row (happy path):

```csv
email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code
mcp.bulk.tp.<RUN_ID>@yopmail.com,MCP-EMP-TP-<RUN_ID>,Bulk,Planner,transport_planner,,,none,
```

POI-scoped success row (TC10):

```csv
email,employee_id,first_name,last_name,role,department,phone_number,otp_type,poi_code
mcp.bulk.depot.ok.<RUN_ID>@yopmail.com,MCP-EMP-DO-OK-<RUN_ID>,Bulk,Depot,depot_officer,,,none,CTG-001
```

Playwright MCP: write CSV to a temp path under the artifacts folder, then use file upload on `#csv_file`.

### Admin URLs & UI labels (stable)

| Action | Path / control |
|--------|----------------|
| Users changelist | `/admin/users/user/` |
| Import upload | `/admin/users/user/import/` (`admin:users_user_import_upload`) |
| Import preview/status | `/admin/users/user/import/<job_id>/` |
| Import confirm | POST `/admin/users/user/import/<job_id>/confirm/` |
| Template download | `/admin/users/user/import/?template=1` |
| Sample download | `/admin/users/user/import/?template=sample` |
| Status JSON | `/admin/users/user/import/<job_id>/status.json` |
| Import button (changelist) | **Import** (`has_bulk_import_export`) |
| Upload submit | **Upload and Validate** |
| Confirm | **Import N Valid Rows** |
| Re-upload | **Fix & Re-Upload** |

Prefer accessibility snapshots. After upload/confirm, poll until page leaves **Validating CSV...** / **Importing Records...** (status template meta refresh every 3s) or use `status.json` (`preview_ready` / `completed` / `failed`).

### POI-scoped roles (YARD-01)

Roles that require Site (POI) when **creating** an invitation (`role_requires_operational_poi`):  
`gateman`, `scaling_operator`, `command_center_officer`, `loading_personnel`, `unloading_personnel`, `qc_inspector_physical`, `depot_officer`, `feed_mill_officer`, `poi_admin`.

Non–POI-scoped examples safe for TC08: `transport_planner`, `distribution_officer`, `commercial_officer` (confirm role exists and is active in public `Role` table before run). Providing `poi_code` for these roles must fail preview (TC12).

### Implementation alignment

| Topic | Behaviour |
|-------|-----------|
| CSV `poi_code` | Optional column; required at preview for POI-scoped `create_invite` rows |
| Execute | `perform_batch_import` passes resolved `poi_id` into `create_invitation_for_provisioned_user` |
| Single-user invite | Admin **Invite user** form **Site (POI)** (`operational_poi`) — same rule as bulk `poi_code` |
| Spec drift | Product bulk-import doc lists `driver`/`helper`; code also registers **`user`** |

### Wipe notes

- Prefer emails / employee IDs prefixed `mcp.bulk.` / `MCP-EMP-` + `RUN_ID`.
- After suite: wipe MCP users / pending invitations / `BulkImportJob` rows for the session via detect-wipe skill / manual admin delete.

### Suggested run order

1. TC01 → TC03 → TC04 (smoke UI)  
2. TC05 → TC06 → TC07 (preview negatives)  
3. TC08 (non–POI happy path)  
4. TC09 → TC10 → TC11 → TC12 (Site POI rules)  
5. TC02, TC13, TC14 (RBAC / upload guards)  
