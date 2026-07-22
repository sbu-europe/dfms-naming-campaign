# Trips — Vendor App (Start, Status, POD)

**Module:** Vendor Management — Trip Start  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 — all 4 trips flows **Passed** (emulator-5554)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_168 | Trip visible after dispatch | Trip in Vendor App > Trips after Ready for Dispatch. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/02_active_trips_empty_or_list.yaml` | Tabs/list **Passed**; strict Ready-for-Dispatch seed not asserted |
| TC_169 | Start Trip status | FG → Driving Towards Source; RM → Destination. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | **Passed** (optional start/complete steps) |
| TC_170 | Start unavailable early | Start disabled before Ready for Dispatch. | High | Vendor App | Not Started | — | |
| TC_171 | No manual status change | Vendor cannot manually change TO status. | Critical | Vendor App | Not Started | — | |
| TC_172 | Real-time status updates | Status reflected in app. | High | Vendor App | Not Started | — | |
| TC_186 | Contractual start trip | Contractual Start Trip for TO-004. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | |
| TC_187 | Contractual same transition | Same status transition as Non-Contractual. | Medium | Vendor App | Not Started | — | |
| TC_200 | Cannot start before ready | Start unavailable while Assigned. | Critical | Vendor App | Not Started | — | |
| TC_215 | POD submission E2E | Upload 3 POD docs after Gate-Out → Completed. | Critical | Vendor App | Not Started | — | Full ops chain |

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `trips/01_trips_tabs_and_search.yaml` | **Passed** |
| `trips/02_active_trips_empty_or_list.yaml` | **Passed** |
| `trips/03_completed_trips_payment_filters.yaml` | **Passed** |
| `trips/04_active_trip_start_and_complete.yaml` | **Passed** |
