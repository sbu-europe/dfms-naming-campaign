---
module: 02-master-data
specification: Drivers (MD_DRV) — Playwright E2E Scenario Plan
version: 2.0
phase: Phase 1
related_stories: US-005 / Driver profiles
source_spec: ../../05-modules/02-master-data/
last_updated: 2026-07-22
playwright_mcp: true
suite: master-data-phase1-v2
---
# Drivers — E2E Scenario Plan

**URL:** `/admin/users/driver/` (Users & Access)

## Test cases

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| MD_DRV_001 | Navigate Add Driver | Open `/admin/users/driver/` Add. Assert invite+driver fields (email/name/employee, contact, license*, driver_type). | P2 | Planned |
| MD_DRV_002 | Employee ID | If required on form, blank fails; else document optional employee_id behaviour. | P0 | Planned |
| MD_DRV_003 | Full Name mandatory | Blank first/last name blocked. | P0 | Planned |
| MD_DRV_004 | Contact mandatory | Blank contact_number blocked. | P0 | Planned |
| MD_DRV_005 | Contact format | Invalid phone rejected. | P1 | Planned |
| MD_DRV_006 | Email optional on driver profile | Driver email optional if separate from user invite email — assert per form. Invite path typically needs user email. | P2 | Planned |
| MD_DRV_007 | Email format | Invalid email rejected. | P1 | Planned |
| MD_DRV_008 | License number mandatory | Blank driving_license_number blocked. | P0 | Planned |
| MD_DRV_009 | License type mandatory | Blank license_type blocked. | P0 | Planned |
| MD_DRV_010 | License expiry mandatory | Blank expiry blocked. | P0 | Planned |
| MD_DRV_011 | Past expiry | Past date rejected or warned per validators. | P1 | Planned |
| MD_DRV_012 | NID optional | Blank NID; succeeds. | P2 | Planned |
| MD_DRV_013 | Driver type mandatory | Blank driver_type blocked. | P0 | Planned |
| MD_DRV_014 | Driver type choices | Assert Permanent/Temporary/Own/Vendor (code has 4; suite PDF said 2 only). | P2 | Planned |
| MD_DRV_015 | Experience cert optional | Skip upload; succeeds. | P3 | Planned |
| MD_DRV_016 | Experience cert file types | Invalid .docx rejected if upload validated. | P2 | Planned |
| MD_DRV_017 | Biodata optional + types | Blank OK; bad type rejected. | P3 | Planned |
| MD_DRV_018 | Reference contacts optional | Both blank; succeeds. | P2 | Planned |
| MD_DRV_019 | Accident/training/address optional | Blank; succeeds. | P3 | Planned |
| MD_DRV_020 | Medical cert optional + types | Blank OK; bad type rejected. | P3 | Planned |
| MD_DRV_021 | Active default | Observe is_active default (invite may start inactive until activation). | P2 | Planned |
| MD_DRV_022 | Mandatory-only create | Create with required fields; appears on list. | P0 | Planned |
| MD_DRV_023 | Activation email when email present | With valid invite email, invitation created/sent path triggered (assert invitation record; email delivery optional). | P0 | Planned |
| MD_DRV_024 | Create without optional driver email | If user email required for invite, skip; else assert no crash without optional driver email. | P1 | Planned |
| MD_DRV_025 | Bulk import emails | Import drivers with emails; invitations created for valid rows. | P0 | Planned |
| MD_DRV_026 | Import template | Download driver CSV template. | P2 | Planned |
| MD_DRV_027 | Import missing license fails | Row missing license fails. | P0 | Planned |
| MD_DRV_028 | Export CSV | Export drivers. | P2 | Planned |
| MD_DRV_029 | Search/filter/pagination | Exercise list ops. | P2 | Planned |
| MD_DRV_030 | Update license/medical | Edit expiry/docs; save. | P1 | Planned |
| MD_DRV_031 | Deactivate excludes from TO | Inactive driver not in TO planning. | P0 | Planned |
| MD_DRV_032 | Soft delete via Edit → Inactive | Open **Edit**, uncheck **Is active?**, Save. Assert retained as Inactive. | P0 | Planned |
| MD_DRV_033 | Delete blocked by TO/User PROTECT | Attempt delete with trip history / linked user; assert blocked or protected. | P0 | Planned |
| MD_DRV_034 | Depot Officer RBAC | Cannot mutate drivers. | P0 | Planned |
## Implementation Notes (Playwright MCP + Django Admin SSR)

- URL: `/admin/users/driver/`
- Creates User+invitation; not master_data hard-delete mixin.
- Wipe prefix: `MCP-MD-<RUN_ID>-`
- Delete SSOT: **Soft delete** = Edit → Inactive; **Hard delete** = Delete + reason when no deps (see delete-operations plan).

### Known drift (suite PDF → code)

| Topic | Suite v2 | Code / this plan |
|-------|----------|------------------|
| Driver Type options | Permanent/Temporary only | **permanent/temporary/own/vendor** |
| Email | Optional always | Invite flow needs user email |
