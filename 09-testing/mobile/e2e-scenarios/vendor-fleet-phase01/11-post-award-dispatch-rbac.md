# Post-Award Dispatch & RBAC

**Module:** Vendor Management — Ready for Dispatch, RBAC, Edge Cases  
**Scope:** Admin + vendor (Mixed)  
**Last Maestro run:** 2026-07-22 (supporting profile/smoke flows only)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_164 | Vendor Confirmed sub-state | TDO sees Vendor Confirmed after confirm. | High | TDO | Manual | — | **Admin gate Wave D** |
| TC_165 | Ready for Dispatch gated | Button only after Vendor Confirmed. | Critical | TDO | Manual | — | |
| TC_166 | Ready for Dispatch action | Status updates to Ready for Dispatch. | Critical | TDO | Manual | — | |
| TC_167 | Audit log | Ready for Dispatch logged. | Medium | TDO | Manual | — | Skip |
| TC_188 | Vendor Fleet downstream FG | Same FG downstream as Own Fleet. | High | Backend | Manual | — | Ops chain |
| TC_189 | Vendor Fleet downstream RM | QC-gated RM flow. | High | Backend | Manual | — | |
| TC_190 | Own Fleet TDO blocked | Cannot perform Vendor Fleet actions. | Critical | TDO | Manual | — | Playwright/admin |
| TC_191 | Vendor Fleet TDO blocked | Cannot perform Own Fleet assignment. | Critical | TDO | Manual | — | |
| TC_194 | TP access restricted | TP cannot Bid Management / approval / Assign TO. | High | TP | Manual | — | |
| TC_195 | Past bid open date | Past Open Date blocked. | Medium | TDO | Manual | — | |
| TC_196 | Award with zero bids | Cannot award empty bid. | Medium | TDO | Manual | — | |
| TC_197 | Concurrent bid submissions | No corruption under concurrent bids. | High | Backend | Manual | — | |
| TC_198 | Revoked vendor blocked | Cannot award revoked vendor. | High | TDO | Manual | — | |
| TC_199 | Driver/vehicle substitution audit | Substitution needs reason + audit. | High | Mixed | Not Started | — | Skip in PDF |
| TC_201 | TDO cannot dispatch early | Ready for Dispatch before confirm blocked. | Critical | TDO | Manual | — | |
| TC_214 | Post partial award states | Awarded vs Not Awarded independent. | High | TDO | Manual | — | |

## Cross-references

| TC | See |
|----|-----|
| TC_199 | Needs change-driver UI flow |
| TC_200 | See `09-trips-vendor-app.md` |
| TC_213 | See `08-transport-orders-vendor-app.md` |

## Supporting Maestro flows (not Phase 01 PDF IDs)

| Flow | Result 2026-07-22 |
|------|-------------------|
| `profile/01_profile_hub_navigation.yaml` | **Passed** |
| `profile/02_view_and_edit_profile.yaml` | **Passed** |
| `profile/03_change_password_validation.yaml` | **Failed** — wrong-current-password error toast not matched |
| `profile/04_logout.yaml` | **Passed** |
| `settings/01_theme_and_language.yaml` | **Passed** |
| `smoke/00_app_launches.yaml` | **Passed** |
| `smoke/01_bottom_nav_all_tabs.yaml` | **Passed** |
