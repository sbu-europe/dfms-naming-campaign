---
title: Vendor Trip Management — Lifecycle & Status Model
sprint: Sprint 5
last_updated: 2026-06-09
code_refs:
  - nourish-backend/apps/transport/constants.py
  - nourish-backend/apps/vendors/services.py (VendorFleetTOLifecycleService)
  - nourish-backend/apps/vendors/serializers.py (vendor_lifecycle_phase_for_status)
  - nourish-vendor-app/data/lib/mapper/transport_order/tls_status_mapper.dart
  - nourish-vendor-app/domain/lib/model/trips/trip_status.dart
stories:
  - VM-03
  - VM-07
  - VM-08
  - TEVF-03
---

# Vendor Trip Management — Lifecycle & Status Model

Canonical reference for **vendor-app trip management** in Sprint 5. Applies equally to **Contractual** and **Non-Contractual** vendors once a TO is assigned or bid-awarded.

---

## 1. Architecture — two layers

| Layer | Field | Purpose |
|-------|-------|---------|
| **TLS-01 execution** (backend source of truth) | `TransportOrder.status` | Canonical lifecycle on the TO (`driving_towards_source`, `at_source`, `delivered_unloaded`, …) |
| **Yard sub-state** (backend overlay) | `TransportOrder.sub_state` | Yard-step detail (`loading_started`, `unloading_started`, `qc_passed`, …); does not replace canonical status |
| **Vendor lifecycle bucket** (API + UI tabs) | `lifecycle_phase` | Coarse grouping for lists: `assigned` / `in_progress` / `completed` / `closed` |
| **Vendor trip display** (mobile UI) | `TripStatus` (9 values) | Simplified progress chip + milestone bar derived from TLS-01 status + sub_state |

Vendor Mobile also keeps `executionStatus` (raw backend `status` string) for precise status chips.

---

## 2. Vendor lifecycle phases (list / tab grouping)

Mapped in `vendor_lifecycle_phase_for_status()`:

| `lifecycle_phase` | Backend `status` values | Vendor Mobile tab |
|-------------------|-------------------------|-------------------|
| `assigned` | `created`, `assigned`, `under_planning` | Active Trips |
| `in_progress` | `ready_for_dispatch`, `driving_towards_source`, `at_source`, `loaded_pickup_completed`, `driving_towards_destination`, `at_destination`, `delivered_unloaded`, `in_progress` (legacy) | Active Trips |
| `completed` | `completed` | Completed Trips |
| `closed` | `closed` | Completed Trips |
| `cancelled` | `cancelled` | Completed Trips (or hidden per policy) |

---

## 3. Vendor-initiated status changes (only two actions)

Vendors **cannot** skip yard steps or set arbitrary TLS-01 statuses. They may only call:

`POST /api/v1/vendor/tenants/{tenant_schema}/transport-orders/{to_id}/advance-status/`

| Vendor action | When enabled | Request body | Backend transition | Gate |
|---------------|--------------|--------------|-------------------|------|
| **Start Trip** | `status == ready_for_dispatch` and VM-07 confirmation exists | `{ "status": "in_progress" }` (alias) or `driving_towards_source` / `driving_towards_destination` | Lane-aware first driver leg via `execute_trip_start()` | Vehicle–driver confirmation required (VM-07-2) |
| **Complete Trip** | `can_complete_vendor_trip == true` (`status == delivered_unloaded`) | `{ "status": "completed" }` | `delivered_unloaded` → `completed` | Yard chain must have finished unloading |

**Lane-aware trip start** (`FIRST_DRIVER_TRANSITION`):

| `flow_lane` | First status after Start Trip |
|-------------|------------------------------|
| `fg_outbound` | `driving_towards_source` |
| `fg_inbound` | `driving_towards_destination` |
| `rm_inbound` | `driving_towards_destination` |

All other TLS-01 transitions are **read-only for the vendor** — driven by driver mobile (driving legs), yard modules (gate, scale, loading, QC), and system hooks.

---

## 4. Full execution sequence (vendor perspective)

```
ASSIGNED (TDO assigns vendor / bid awarded)
  └── VM-07 vehicle–driver confirmation ──► READY_FOR_DISPATCH
        └── Vendor taps "Start Trip" ──► DRIVING_TOWARDS_SOURCE | DRIVING_TOWARDS_DESTINATION
              └── [driver + yard chain — vendor observes only]
                    AT_SOURCE → (loading sub_states) → LOADED_PICKUP_COMPLETED
                    → DRIVING_TOWARDS_DESTINATION → AT_DESTINATION
                    → (unloading sub_states) → DELIVERED_UNLOADED
        └── Vendor taps "Complete Trip" ──► COMPLETED
              └── Vendor may upload POD / GRN / Invoice (VM-07 post-completion)
                    → CLOSED (TDO / POD-01 closure — vendor observes)
```

---

## 5. TLS-01 status → vendor `TripStatus` display map

From `TlsStatusMapper.mapToTripStatus()` (sub_state overrides when it contains `loading` or `unloading`):

| Backend `status` | Typical `sub_state` | `TripStatus` (mobile) |
|------------------|----------------------|------------------------|
| `assigned`, `ready_for_dispatch` | — | `assigned` |
| `driving_towards_source` | — | `inTransit` |
| `at_source` | `loading_*` | `loading` |
| `at_source` | other | `arrivedAtPickup` |
| `loaded_pickup_completed` | — | `inTransitToDrop` |
| `driving_towards_destination` | — | `inTransitToDrop` |
| `at_destination` | `unloading_*` | `unloading` |
| `at_destination` | other | `arrivedAtDrop` |
| `delivered_unloaded` | — | `unloading` |
| `completed`, `closed` | — | `completed` |

---

## 6. Four-milestone progress bar (vendor mobile)

| Index | Milestone label | `TripStatus` values included |
|-------|-----------------|------------------------------|
| 0 | Assigned | `assigned`, `dispatched` |
| 1 | Loaded | `inTransit`, `arrivedAtPickup`, `loading` |
| 2 | In transit | `inTransitToDrop`, `arrivedAtDrop` |
| 3 | Delivered | `unloading`, `completed` |

---

## 7. Vendor API fields (trip / TO detail)

`GET /api/v1/vendor/transport-orders/` and detail responses include:

| Field | Description |
|-------|-------------|
| `status` | Raw TLS-01 status (snake_case) |
| `lifecycle_phase` | Vendor bucket (`assigned` / `in_progress` / `completed` / `closed`) |
| `sub_state` | Yard sub-state when set |
| `flow_lane` | Lane for trip-start target |
| `can_complete_vendor_trip` | `true` only when `status == delivered_unloaded` |
| `vendor_execution_confirmed` | VM-07 confirmation recorded |

---

## 8. Real-time updates (VM-08)

- Vendor Mobile polls active trip detail (~30s) and refreshes on foreground / tab switch (VM-03-10, VM-08-3).
- Status changes from yard/driver/system appear in vendor views without vendor action.
- VM-08-4: TLS-01 transition events must propagate to vendor portal lifecycle views so lists stay in sync.

---

## 9. Story ownership

| Concern | Story |
|---------|-------|
| Active / Completed trip lists, lifecycle screens | VM-03 |
| Vehicle–driver confirmation + trip-start gate | VM-07 |
| Polling, lifecycle event sync | VM-08 |
| Advance-status API + execution umbrella | TEVF-03 |
| TLS-01 canonical status model | TLS-01 |
