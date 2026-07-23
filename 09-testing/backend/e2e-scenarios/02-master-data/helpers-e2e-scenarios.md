---
module: 02-master-data
specification: Helpers (MD_HLP) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: MDM Phase 1
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Helpers — E2E Scenario Plan

**URL:** `/admin/users/helper/`

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_HLP_001 | Navigate Add Helper | Open `/admin/users/helper/` Add. Assert employee_id, full_name, contact, NID, refs, status. | P2 | Planned |
| MD_HLP_002 | Employee ID mandatory | Blank employee_id blocked. | P0 | Planned |
| MD_HLP_003 | Full Name mandatory | Blank full_name blocked. | P0 | Planned |
| MD_HLP_004 | Contact mandatory | Blank contact blocked. | P0 | Planned |
| MD_HLP_005 | Contact format | Invalid phone rejected. | P1 | Planned |
| MD_HLP_006 | NID optional | Blank NID; succeeds. | P2 | Planned |
| MD_HLP_007 | Refs optional | Both refs blank; succeeds. | P2 | Planned |
| MD_HLP_008 | Active default | is_active defaults True. | P2 | Planned |
| MD_HLP_009 | Mandatory-only create | Create with employee_id, full_name, contact, active; on list. | P0 | Planned |
| MD_HLP_010 | Search/filter/pagination | Exercise list ops. | P2 | Planned |
| MD_HLP_011 | Update contact/refs | Edit; save; audit if available. | P1 | Planned |
| MD_HLP_012 | Deactivate excludes from TO | Inactive helper not in TO helper assignment. | P0 | Planned |
| MD_HLP_013 | Soft delete via Edit → Inactive | Open Helper **Edit**, uncheck **Is active?**, Save. Assert remains Inactive. (Prefer this over `deleted_at` delete path for suite soft delete.) | P0 | Planned |
| MD_HLP_014 | Hard delete / deps | If hard delete path exists with trip deps, assert block; else soft-delete only. | P0 | Planned |
| MD_HLP_015 | Depot Officer RBAC | Cannot mutate helpers. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/users/helper/`
- SoftDeleteMixin; bulk import available.
- Wipe prefix: `MCP-MD-<RUN_ID>-`
- Delete SSOT: **Soft delete** = Edit → Inactive; **Hard delete** = Delete + reason when no deps (see delete-operations plan).

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Module | Missing in v1 suite | Added MD_HLP_* |
