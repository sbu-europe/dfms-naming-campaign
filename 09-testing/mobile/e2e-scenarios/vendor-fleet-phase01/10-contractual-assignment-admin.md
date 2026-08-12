# Contractual Vendor — TO Assignment (Admin)

**Module:** Vendor Management — Contractual Vendor TO Assignment  
**Scope:** Vendor Fleet TDO — **admin portal** (**Playwright**) + vendor rate visibility (**Maestro**)  
**Automation:** **Playwright** + **Maestro**  
**Last run:** 2026-07-24 — Playwright `RUN_ID=C10A23D01`; Maestro on `emulator-5554`  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-contractual-assign-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_173 | Assign TO-004 | TDO selects TO → Assign TO. | High | TDO | **Pass** (Playwright) | `run-vendor-contractual-assign.mjs` | Assign TO page (`create-bid/?to_ids=…`) for `TO-20260608-0002` |
| TC_174 | Contractual option available | Contractual + Non-Contractual Bidding options. | High | TDO | **Pass** (Playwright) | same | Both tabs present on Assign TO |
| TC_175 | Contractual vendor dropdown | Only Contractual vendors listed. | Critical | TDO | **Pass** (Playwright) | same | `/api/v1/vendors/contractual/` excludes `vendor2` |
| TC_176 | Direct assign no bidding | Assign without bidding step. | Critical | TDO | **Pass** (Playwright) | same | `PATCH /api/v1/transport-orders/{id}/vendor/` |
| TC_177 | Rate hidden from vendor | Rate not shown on vendor app. | Critical | Vendor App | **Pass** (Playwright + Maestro) | same + `tos/05_contractual_rate_hidden.yaml` | API strips rate; UI has no `1500` / Rate labels |
| TC_178 | Status after assign | Assigned / Awaiting Vendor Confirmation. | Critical | TDO | **Pass** (Playwright) | same | `status=assigned` after assign |
| TC_179 | Audit log | Assignment logged. | Medium | TDO | **Skip** | — | PDF Skip |
| TC_183 | Contractual confirm audit | Confirmation logged. | Low | Backend | **Skip** | — | PDF Skip |
| TC_184 | Vendor Confirmed sub-state | After confirm, Vendor Confirmed. | High | TDO | **Pass** (Playwright) | same | Vendor `vehicle-driver` confirm 201 |
| TC_185 | Ready for Dispatch contractual | Ready for Dispatch for TO. | Critical | TDO | **Pass** (Playwright) | same | `POST …/confirm-vendor/` → `ready_for_dispatch` |

## Related Maestro flows (2026-07-24)

| Flow | Result |
|------|--------|
| `tos/05_contractual_rate_hidden.yaml` | **Passed** (contractual login; Tracks Active detail; rate not visible) |

## How to run

### Seed

```bash
# nourish-backend
make seed-vendor-contractual-assign-pw RUN_ID=C10A23D01
# Picks a CREATED unassigned vendor TO; ensures contractual.test@example.com rate on membership
```

### Playwright (admin Assign TO + API)

```bash
cd tests/e2e/playwright-mcp/vendor-contractual-assign-artifacts
# symlink node_modules from vendor-bids-artifacts if needed
RUN_ID=C10A23D01 node run-vendor-contractual-assign.mjs
```

### Maestro (rate visibility)

```bash
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a
# Use TO from RESULTS / manifest after Playwright assign

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" \
  -e VENDOR_EMAIL="$CONTRACTUAL_VENDOR_EMAIL" \
  -e VENDOR_PASSWORD="$CONTRACTUAL_VENDOR_PASSWORD" \
  -e MAESTRO_CONTRACTUAL_TO_NUMBER=TO-20260608-0002 \
  .maestro/flows/tos/05_contractual_rate_hidden.yaml
```

## Still blocked / skipped

- **TC_179 / TC_183:** PDF Skip (audit).
- Assign TO list checkbox → action is covered by direct `create-bid/?to_ids=` URL (same page as admin Assign TO action).

## Admin gate (Wave E)

1. Approve Contractual vendor (TC_112) — precondition for seed.
2. Direct-assign TO (TC_176) — covered above.
3. Downstream contractual TO/trip cases — see `08` / `09`.
