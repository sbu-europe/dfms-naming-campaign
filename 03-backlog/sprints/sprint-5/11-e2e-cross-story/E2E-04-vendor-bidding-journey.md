---
journey_id: E2E-04
title: Vendor Bidding Journey — Registration → Tenant Join → Bid → Award → Execution
sprint: Sprint 5
stories_involved:
  - VM-01
  - VM-02
  - VM-04
  - VM-05
  - VM-06
  - VM-07
  - TEVF-01
  - TEVF-02
  - TEVF-03
feedback_items:
  - FB-013
  - FB-015
  - FB-016
  - FB-018
owner: QA Lead
status: Pending
---

# E2E-04 — Vendor Bidding Journey

## Why This Journey Exists

The vendor management module spans 9 stories from onboarding through to execution. FB-013 requires the vendor portal to show TO lifecycle management; FB-015 requires clear winner indication across bid surfaces; FB-016 enforces one vehicle per TO through the full publish-bid-award chain. **FB-018 is reframed (2026-06-09):** see [TO-BID-FLOW-REVISION.md](../08-vendor-management/TO-BID-FLOW-REVISION.md) — Multiple TO tab → Create Bid from TO list → vendor Bid ID + per-TO award. No single story tests these feedback items together — they only manifest when the full journey runs.

Two sub-paths are scripted: **Non-Contractual (bidding)** and **Contractual (direct assignment)**.

---

## Pre-conditions

- A vendor has no existing account (fresh registration test)
- Tenant Admin account exists
- TDO account exists with a TR (Transport Requirement) ready
- One planner TO exists for contractual path testing

---

## Sub-Path A — Non-Contractual Bidding

### Step 1 — Vendor self-registration with OTP

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Opens Vendor Mobile; starts registration | Registration form available |
| Vendor | Fills company details, contact, password | Form accepts input |
| Vendor | Receives OTP; verifies OTP (FB-010 resolution) | OTP verified; registration proceeds |
| Vendor | Uploads mandatory compliance documents | Document gating: cannot proceed without required docs |
| Vendor | Submits | Vendor account created in `pending_docs` or `registered` state |

### Step 2 — Tenant join request

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Browses tenant directory; selects tenant; sends join request | Join request created with `NON_CONTRACTUAL` type hint |

### Step 3 — Tenant Admin approves with exactly one vendor type

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Tenant Admin | Sees join request; opens approval form | Vendor type selector shows `CONTRACTUAL` and `NON_CONTRACTUAL` as mutually exclusive options |
| Tenant Admin | Attempts to select both types | UI/API rejects; only one type allowed (FB-017) |
| Tenant Admin | Selects `NON_CONTRACTUAL`; approves | Vendor approved; vendor type = `NON_CONTRACTUAL` for this tenant; vendor sees Active Bids tab in portal |

### Step 4 — TDO captures bid requirement form and publishes TO

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| TDO | Opens bid requirement form before TO creation (FB-018) | Captures transport need, route, vehicle type, bidding window |
| TDO | Attempts to add more than one route to the session | System rejects; single-route constraint enforced (FB-019) |
| TDO | Creates/links TO; publishes with `required_vehicle_count = 1` (FB-016) | Bidding session created; TO published to bidding portal; non-contractual vendors notified in-app |

### Step 5 — Vendor submits bid

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Opens Active Bids tab; tab refreshes from server (FB-014) | Published TO visible with window labels and TDO context |
| Vendor | Submits bid with `offered_vehicle_count = 1` | Bid accepted; one-bid-per-vendor guard active |
| Vendor | Attempts to submit `offered_vehicle_count = 2` | API rejects; capped at 1 aligned with publish rule (FB-016) |

### Step 6 — TDO evaluates and awards

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| TDO | Opens bid evaluation; views side-by-side comparison | Min/avg/max rates highlighted; lowest bid indicated |
| TDO | Awards to winning vendor | Single-winner default applies (required = 1); award recorded in winning log |
| Vendor | Checks bid detail | Winner indication visible on bid detail in Vendor Mobile (FB-015) |
| TDO | Checks evaluation screen | Winner badge and window timeline display clear (FB-015) |

### Step 7 — Vendor confirms vehicle and driver

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Submits vehicle-driver confirmation (VM-07) | Confirmation record created; TO reaches `ready_for_dispatch`; trip-start gate armed |

### Step 8 — Vendor starts trip (TLS-01 execution)

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Opens Active Trips → TO detail; taps **Start Trip** | `POST …/advance-status/` with `in_progress`; TO transitions lane-aware to `driving_towards_source` (FG outbound) or `driving_towards_destination` (FG/RM inbound) |
| Vendor | Attempts Start Trip without VM-07 confirmation | API returns 409; trip-start gate enforced |
| Vendor | Observes in-progress execution | Status chips reflect TLS-01 progress (`at_source`, loading sub_states, `driving_towards_destination`, `delivered_unloaded`, …) via polling/refresh — vendor does not set these |

### Step 9 — Vendor portal TO lifecycle management

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Opens Active Trips tab; tab refreshes on switch (FB-014) | TO visible with `lifecycle_phase` = `assigned` or `in_progress` per [`VENDOR-TRIP-LIFECYCLE.md`](../08-vendor-management/VENDOR-TRIP-LIFECYCLE.md) |
| Vendor | Views TO detail during yard execution | 4-milestone timeline advances; raw `status` + `sub_state` shown; **Complete Trip** disabled until `delivered_unloaded` |
| System | Yard chain completes unloading | `can_complete_vendor_trip` becomes `true`; **Complete Trip** enabled |
| Vendor | Taps **Complete Trip** | `POST …/advance-status/` with `completed`; TO moves to Completed Trips tab |
| Vendor | TO reaches `closed` (TDO/POD-01) | Completed Trips shows `lifecycle_phase` = `closed` (FB-013) |

---

## Sub-Path B — Contractual Vendor Assignment

### Step 1 — Tenant Admin approves vendor as Contractual

*(Same as Sub-Path A Step 3 but select `CONTRACTUAL`)*

### Step 2 — TDO directly assigns contractual vendor to TO

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| TDO | Opens contractual assignment; selects vendor from approved list | Rate is **hidden** from vendor-facing screens (TEVF-01 rate-hiding rule) |
| TDO | Completes assignment | TO assigned to vendor; vendor notified in-app |

### Step 3 — Vendor lifecycle visibility

| Actor | Action | Expected Outcome |
|-------|--------|-----------------|
| Vendor | Opens Vendor Portal | TO visible in Active Trips with `lifecycle_phase`; contractual rate not exposed |
| Vendor | Confirms vehicle/driver → Start Trip | Same TLS-01 flow as Sub-Path A Steps 7–9; lane-aware trip start after `ready_for_dispatch` |

---

## Negative Cases

| Scenario | Expected Outcome |
|----------|-----------------|
| Vendor attempts registration without OTP verification | Registration blocked |
| Vendor attempts to submit bid after bidding window closes | API rejects with window-closed error |
| Tenant Admin selects both vendor types on approval | UI/API rejects |
| TDO publishes with `required_vehicle_count > 1` | API rejects with one-vehicle constraint error |
| Vendor attempts Start Trip before VM-07 confirmation | API returns 409 |
| Vendor attempts Complete Trip before `delivered_unloaded` | API returns 409; `can_complete_vendor_trip` is false |
| Vendor attempts arbitrary status via advance-status (e.g. `at_source`) | API returns 409 unsupported transition |

---

## Definition of Done

- [ ] Sub-Path A (non-contractual bidding) Steps 1–9 complete without error in staging
- [ ] Sub-Path B (contractual assignment) Steps 1–3 complete
- [ ] OTP on registration verified (FB-010)
- [ ] One vendor type per approval enforced (FB-017)
- [ ] Bid requirement form before TO creation (FB-018)
- [ ] One-vehicle rule enforced at publish and bid (FB-016)
- [ ] Winner indication visible on bid surfaces (FB-015)
- [ ] Vendor portal TO lifecycle management visible — TLS-01 execution, Start/Complete Trip, milestone timeline (FB-013)
- [ ] Tab auto-refresh verified (FB-014)
- [ ] All negative cases return stable errors
- [ ] No regression in VM-01-12, VM-02-9, VM-04-13, VM-05-11, VM-06-10, VM-07-6, VM-08-5, TEVF-01-8, TEVF-02-6, TEVF-03-5

---

*Stories: VM-01 · VM-02 · VM-04 · VM-05 · VM-06 · VM-07 · TEVF-01 · TEVF-02 · TEVF-03 | Feedback: FB-013, FB-015, FB-016, FB-018 | Sprint 5*
