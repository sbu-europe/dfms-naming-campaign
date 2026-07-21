# Trips — Vendor App (Start, Status, POD)

**Module:** Vendor Management — Trip Start  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-21 evening full suite — all 4 trips flows **Passed** (list/tabs/soft start; no Ready-for-Dispatch seed)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_168 | Trip visible after dispatch | Trip in Vendor App > Trips after Ready for Dispatch. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/02_active_trips_empty_or_list.yaml` | Tabs/list covered; needs Ready-for-Dispatch seed |
| TC_169 | Start Trip status | FG → Driving Towards Source; RM → Destination. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | Flow **Passed** with optional steps (soft) |
| TC_170 | Start unavailable early | Start disabled before Ready for Dispatch. | High | Vendor App | Not Started | — | |
| TC_171 | No manual status change | Vendor cannot manually change TO status. | Critical | Vendor App | Not Started | — | |
| TC_172 | Real-time status updates | Status reflected in app. | High | Vendor App | Not Started | — | |
| TC_186 | Contractual start trip | Contractual Start Trip for TO-004. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | |
| TC_187 | Contractual same transition | Same status transition as Non-Contractual. | Medium | Vendor App | Not Started | — | |
| TC_200 | Cannot start before ready | Start unavailable while Assigned. | Critical | Vendor App | Not Started | — | |
| TC_215 | POD submission E2E | Upload 3 POD docs after Gate-Out → Completed. | Critical | Vendor App | Not Started | — | Full ops chain |

## Related Maestro flows

| Flow | Result 2026-07-21 |
|------|-------------------|
| `trips/01_trips_tabs_and_search.yaml` | **Passed** |
| `trips/02_active_trips_empty_or_list.yaml` | Failed then re-run pending tab selector fix |
| `trips/03_completed_trips_payment_filters.yaml` | Failed — tab selector (fixed) |
| `trips/04_active_trip_start_and_complete.yaml` | **Passed** (optional steps) |

## Admin gate (Wave D)

1. After vendor TO confirm → TDO Ready for Dispatch (TC_164–166).
2. Re-run `flows/trips`.
3. POD (TC_215) needs full gate/scale chain — Manual until fixture exists.
