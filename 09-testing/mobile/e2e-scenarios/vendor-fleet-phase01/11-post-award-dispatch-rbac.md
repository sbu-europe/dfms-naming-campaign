# Post-Award, Dispatch, RBAC & Edge Cases

**Module:** Vendor Management — Ready for Dispatch, RBAC, Edge Cases, Post-Award  
**Scope:** Mixed — admin TDO + vendor app visibility

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_164 | Vendor Confirmed sub-state | After vendor confirms, TDO sees sub-state Vendor Confirmed. | High | TDO | Manual | — | |
| TC_165 | Ready for Dispatch gated | Button only available after Vendor Confirmed. | Critical | TDO | Manual | — | |
| TC_166 | Ready for Dispatch action | Click Ready for Dispatch → TO status updates. | Critical | TDO | Manual | — | |
| TC_167 | Audit log | Ready for Dispatch logged with TDO ID, timestamp. | Medium | TDO | Manual | — | Skip |
| TC_188 | Vendor Fleet downstream FG | Vendor Fleet FG TO follows same downstream as Own Fleet after trip start. | High | Backend | Manual | — | Operational chain |
| TC_189 | Vendor Fleet downstream RM | Vendor Fleet RM TO follows QC-gated RM flow. | High | Backend | Manual | — | Operational chain |
| TC_190 | Own Fleet TDO blocked | Own Fleet TDO cannot publish bids, award, or mark Ready for Dispatch. | Critical | TDO | Manual | — | |
| TC_191 | Vendor Fleet TDO blocked | Vendor Fleet TDO cannot perform Own Fleet assignment. | Critical | TDO | Manual | — | |
| TC_194 | TP access restricted | Transport Planner cannot access Bid Management, vendor approval, Assign TO. | High | TP | Manual | — | |
| TC_195 | Past bid open date | Bid Open Date in past blocked or flagged. | Medium | TDO | Manual | — | |
| TC_196 | Award with zero bids | Cannot award bid with no vendor responses. | Medium | TDO | Manual | — | |
| TC_197 | Concurrent bid submissions | Simultaneous bids from multiple vendors — no corruption. | High | Backend | Manual | — | |
| TC_198 | Revoked vendor blocked | Cannot award TO to vendor whose approval was revoked. | High | TDO | Manual | — | |
| TC_199 | Driver/vehicle substitution audit | Substitution after confirm requires reason and audit log. | High | Mixed | Not Started | — | Skip in PDF |
| TC_201 | TDO cannot dispatch early | TDO cannot mark Ready for Dispatch before vendor confirmation. | Critical | TDO | Manual | — | |
| TC_214 | Post partial award states | Awarded TO progresses; non-awarded TO shows Not Awarded and is inactive. | High | TDO | Manual | — | |

## Vendor app cases in this section

| TC ID | Notes |
|-------|-------|
| TC_199 | Vendor app may need "change driver/vehicle with reason" flow |
| TC_200 | See [09-trips-vendor-app.md](./09-trips-vendor-app.md) |
| TC_213 | See [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) |

## Profile & settings (supporting flows — not in TC_075–215 PDF range)

These Maestro flows support general app quality but are not mapped to Phase 01 PDF IDs:

| Flow | Feature |
|------|---------|
| `nourish-vendor-app/.maestro/flows/profile/01_profile_hub_navigation.yaml` | Profile hub |
| `nourish-vendor-app/.maestro/flows/profile/02_view_and_edit_profile.yaml` | Edit profile |
| `nourish-vendor-app/.maestro/flows/profile/03_change_password_validation.yaml` | Change password |
| `nourish-vendor-app/.maestro/flows/profile/04_logout.yaml` | Logout |
| `nourish-vendor-app/.maestro/flows/settings/01_theme_and_language.yaml` | Theme & language |
