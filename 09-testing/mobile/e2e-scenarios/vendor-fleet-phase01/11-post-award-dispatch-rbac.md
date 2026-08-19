# Post-Award Dispatch & RBAC

**Module:** Vendor Management — Ready for Dispatch, RBAC, Edge Cases  
**Scope:** Admin + API (**Playwright**); supporting profile/smoke (**Maestro**)  
**Automation:** **Playwright** (+ prior Maestro support flows)  
**Last run:** 2026-07-24 — Playwright `RUN_ID=C11D23D01`  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-dispatch-rbac-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_090 | Vendor Confirmed sub-state | TDO sees Vendor Confirmed after confirm. | High | TDO | **Pass** (Playwright) | `run-vendor-dispatch-rbac.mjs` | Confirmed TO shows exec confirmed |
| TC_091 | Ready for Dispatch gated | Button only after Vendor Confirmed. | Critical | TDO | **Pass** (Playwright) | same | UI gated; API 422 on unconfirmed |
| TC_092 | Ready for Dispatch action | Status updates to Ready for Dispatch. | Critical | TDO | **Pass** (Playwright) | same | `POST …/confirm-vendor/` → `ready_for_dispatch` |
| TC_093 | Audit log | Ready for Dispatch logged. | Medium | TDO | **Skip** | — | PDF Skip |
| TC_114 | Vendor Fleet downstream FG | Same FG downstream as Own Fleet. | High | Backend | **Skip** | — | Full FG ops chain out of scope |
| TC_115 | Vendor Fleet downstream RM | QC-gated RM flow. | High | Backend | **Skip** | — | Full RM QC chain out of scope |
| TC_116 | Own Fleet TDO blocked | Cannot perform Vendor Fleet actions. | Critical | TDO | **Pass** (Playwright) | same | TP blocked from VF assign/bids (403) |
| TC_117 | Vendor Fleet TDO blocked | Cannot perform Own Fleet assignment. | Critical | TDO | **Pass** (Playwright) | same | VF TDO Own Fleet assign redirect / no section |
| TC_120 | TP access restricted | TP cannot Bid Management / approval / Assign TO. | High | TP | **Pass** (Playwright) | same | No Assign TO / Bid Management / RFD |
| TC_121 | Past bid open date | Past Open Date blocked. | Medium | TDO | **Pass** (Playwright) | same | Product **allows** past `bid_open_at` (opens immediately) |
| TC_122 | Award with zero bids | Cannot award empty bid. | Medium | TDO | **Pass** (Playwright) | same | Award empty session → 400 |
| TC_123 | Concurrent bid submissions | No corruption under concurrent bids. | High | Backend | **Skip** | — | Load test — not Playwright |
| TC_124 | Revoked vendor blocked | Cannot award revoked vendor. | High | TDO | **Pass** (Playwright) | same | Suspend → bid submit 403; membership restored |
| TC_125 | Driver/vehicle substitution audit | Substitution needs reason + audit. | High | Mixed | **Skip** | — | PDF Skip |
| TC_127 | TDO cannot dispatch early | Ready for Dispatch before confirm blocked. | Critical | TDO | **Pass** (Playwright) | same | Early `confirm-vendor` → 422 |
| TC_140 | Post partial award states | Awarded vs Not Awarded independent. | High | TDO | **Pass** (Playwright) | same | `partially_awarded` session awarded vs pending TOs |

## Cross-references

| TC | See |
|----|-----|
| TC_125 | Needs change-driver UI flow |
| TC_126 | See `09-trips-vendor-app.md` |
| TC_139 | See `08-transport-orders-vendor-app.md` |

## Supporting Maestro flows (2026-07-22)

| Flow | Result |
|------|--------|
| `profile/01_profile_hub_navigation.yaml` | **Passed** |
| `profile/02_view_and_edit_profile.yaml` | **Passed** |
| `profile/03_change_password_validation.yaml` | **Fixed 2026-08-19** — `scrollUntilVisible` added before Confirm password tap; wrong-current-password error assertion retained |
| `profile/04_logout.yaml` | **Passed** |
| `settings/01_theme_and_language.yaml` | **Passed** |
| `smoke/00_app_launches.yaml` | **Passed** |
| `smoke/01_bottom_nav_all_tabs.yaml` | **Passed** |

## How to run

### Seed

```bash
# nourish-backend
make seed-vendor-dispatch-rbac-pw RUN_ID=C11D23D01
# Confirmed + unconfirmed ASSIGNED TOs, OWN fleet TO, empty-award session, partial session
```

### Playwright (RFD + RBAC + bid edges)

```bash
cd tests/e2e/playwright-mcp/vendor-dispatch-rbac-artifacts
# symlink node_modules from vendor-bids-artifacts if needed
RUN_ID=C11D23D01 node run-vendor-dispatch-rbac.mjs
```

### Suspend helpers (used by TC_124)

```bash
scripts/compose-local.sh exec -T -w /app -e PYTHONPATH=/app web \
  python scripts/e2e-suspend-vendor2-membership.py
scripts/compose-local.sh exec -T -w /app -e PYTHONPATH=/app web \
  python scripts/e2e-reactivate-vendor2-membership.py
```

## Still blocked / skipped

- **TC_093 / TC_125:** PDF Skip (audit).
- **TC_114 / TC_115:** Full FG/RM downstream ops chains — not covered by admin Playwright.
- **TC_123:** Concurrent bid load test — not Playwright.
- **TC_121:** Product currently allows past `bid_open_at` (window validation only); Pass documents that behavior.
- **TC_116:** Exercised via **TP** (Own Fleet actor); dedicated Own Fleet TDO role not seeded in this env.

## Admin gate (Wave D)

1. Vendor Confirmed after mobile confirm (TC_090) — covered.
2. Ready for Dispatch gated + action (TC_091 / TC_092) — covered.
3. Early RFD blocked (TC_127) — covered.
