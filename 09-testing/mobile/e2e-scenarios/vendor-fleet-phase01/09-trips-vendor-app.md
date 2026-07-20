# Trips — Vendor App (Start, Status, POD)

**Module:** Vendor Management — Trip Start (Non-Contractual & Contractual)  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_168 | Trip visible after dispatch | After Ready for Dispatch, trip appears in Vendor App > Trips. | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/02_active_trips_empty_or_list.yaml` | Needs active trip seed |
| TC_169 | Start Trip status | FG TO → "Driving Towards Source"; RM TO → "Driving Towards Destination". | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | |
| TC_170 | Start unavailable early | Start Trip disabled before Ready for Dispatch. | High | Vendor App | Not Started | — | |
| TC_171 | No manual status change | Vendor cannot manually change TO status. | Critical | Vendor App | Not Started | — | Negative test |
| TC_172 | Real-time status updates | Status changes (Assigned, Completed, Closed) reflected in vendor app. | High | Vendor App | Not Started | — | Needs backend progression |
| TC_186 | Contractual start trip | Contractual vendor sees trip and can Start Trip for TO-004. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | Contractual seed |
| TC_187 | Contractual same transition | Contractual trip status transition identical to Non-Contractual. | Medium | Vendor App | Not Started | — | |
| TC_200 | Cannot start before ready | Start Trip unavailable when TO still Assigned / Awaiting Confirmation. | Critical | Vendor App | Not Started | — | |
| TC_215 | POD submission E2E | After destination Gate-Out, vendor uploads 3 POD docs → Submit → status Completed. | Critical | Vendor App | Not Started | — | File upload + full chain |

## Related Maestro flows

| Flow | Covers |
|------|--------|
| `nourish-vendor-app/.maestro/flows/trips/01_trips_tabs_and_search.yaml` | Active/Completed tabs, search |
| `nourish-vendor-app/.maestro/flows/trips/02_active_trips_empty_or_list.yaml` | Empty or list state |
| `nourish-vendor-app/.maestro/flows/trips/03_completed_trips_payment_filters.yaml` | Payment filters on completed |
| `nourish-vendor-app/.maestro/flows/trips/04_active_trip_start_and_complete.yaml` | Start → Complete trip |

## Test data

- Trip in Ready for Dispatch or active state for `VENDOR_EMAIL`
- Full POD chain requires backend operational progression through gate/scale/load
