# Trips — Vendor App (Start, Status, POD)

**Module:** Vendor Management — Trip Start  
**Scope:** Vendor mobile app (**Maestro**) + trip lifecycle APIs (**Playwright**)  
**Automation:** **Maestro** + **Playwright**  
**Last run:** 2026-07-24 — Playwright `RUN_ID=C9T23D01`; Maestro on `emulator-5554` (4/4 flows)  
**Evidence:** `nourish-backend/tests/e2e/playwright-mcp/vendor-trips-artifacts/RESULTS.md`

| TC ID | Scenario | Test description | Priority | Scope | Maestro/Playwright Status | Runner / evidence | Notes |
|-------|----------|------------------|----------|-------|---------------------------|-------------------|-------|
| TC_094 | Trip visible after dispatch | Trip in Vendor App > Trips after Ready for Dispatch. | High | Vendor App | **Pass** (Playwright + Maestro) | `run-vendor-trips.mjs` + `trips/02` | Active list includes RFD TO; Maestro search finds `TO-20260605-0011` |
| TC_095 | Start Trip status | FG → Driving Towards Source; RM → Destination. | Critical | Vendor App | **Pass** (Playwright + Maestro) | same + `trips/04` | API: `ready_for_dispatch` → `driving_towards_source` (fg_outbound) |
| TC_096 | Start unavailable early | Start disabled before Ready for Dispatch. | High | Vendor App | **Pass** (Playwright) | `run-vendor-trips.mjs` | `advance-status` on Assigned → 409 |
| TC_097 | No manual status change | Vendor cannot manually change TO status. | Critical | Vendor App | **Pass** (Playwright) | same | Force `COMPLETED` blocked (409) |
| TC_098 | Real-time status updates | Status reflected in app. | High | Vendor App | **Pass** (Playwright) | same | Active list reflects post-start status |
| TC_112 | Contractual start trip | Contractual Start Trip for TO-004. | Critical | Vendor App | **Pass** (Playwright) | same | `TO-20260610-0004` → `driving_towards_source` |
| TC_113 | Contractual same transition | Same status transition as Non-Contractual. | Medium | Vendor App | **Pass** (Playwright) | same | Same lane transition as vendor2 |
| TC_126 | Cannot start before ready | Start unavailable while Assigned. | Critical | Vendor App | **Pass** (Playwright) | same | Same gate as TC_096 |
| TC_141 | POD submission E2E | Upload 3 POD docs after Gate-Out → Completed. | Critical | Vendor App | **Skip** | — | Full yard/Gate-Out chain + POD upload not automated; Download POD still prototype in app |

## Related Maestro flows (2026-07-24)

| Flow | Result |
|------|--------|
| `trips/01_trips_tabs_and_search.yaml` | **Passed** |
| `trips/02_active_trips_empty_or_list.yaml` | **Passed** (RFD TO search) |
| `trips/03_completed_trips_payment_filters.yaml` | **Passed** |
| `trips/04_active_trip_start_and_complete.yaml` | **Passed** — uses `MAESTRO_TRIP_TO_NUMBER` env var if set; falls back to first RFD list item. Updated 2026-08-19. |

## How to run

### Seed

```bash
# nourish-backend
make seed-vendor-trips-pw RUN_ID=C9T23D01
# Promotes confirmed ASSIGNED TOs → Ready for Dispatch (Maestro + API + contractual);
# leaves one confirmed ASSIGNED TO for start-blocked cases
```

### Maestro (vendor app) — run before Playwright if you need Start trip UI on the Maestro TO

```bash
cd ../nourish-vendor-app
set -a && source .maestro/.env.local && set +a

maestro --device emulator-5554 test \
  -e APP_ID="$APP_ID" -e VENDOR_EMAIL="$VENDOR_EMAIL" -e VENDOR_PASSWORD="$VENDOR_PASSWORD" \
  -e MAESTRO_TRIP_TO_NUMBER=TO-20260605-0011 \
  .maestro/flows/trips/01_trips_tabs_and_search.yaml \
  .maestro/flows/trips/02_active_trips_empty_or_list.yaml \
  .maestro/flows/trips/03_completed_trips_payment_filters.yaml \
  .maestro/flows/trips/04_active_trip_start_and_complete.yaml
```

### Playwright (API lifecycle)

```bash
cd tests/e2e/playwright-mcp/vendor-trips-artifacts
# symlink node_modules from vendor-bids-artifacts if needed
RUN_ID=C9T23D01 node run-vendor-trips.mjs
```

## Still blocked / skipped

- **TC_141:** Needs Gate-In/Out → Completed then multi-file POD; app POD download still prototype.
- Prefer **Maestro before Playwright** (or re-seed) so `rfd_maestro` stays Ready for Dispatch for Start trip UI.
- Set `MAESTRO_TRIP_TO_NUMBER` in `.maestro/.env.local` from the `rfd_maestro.to_number` value in the `seed-vendor-trips-pw` manifest for a reliable targeted search.

## Data note

Seed uses existing confirmed vendor TOs (`vendor_execution_confirmed=True`). Playwright starts `rfd_api` + contractual RFD; Maestro uses `rfd_maestro` (`TO-20260605-0011` this run).
