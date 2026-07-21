---
module: 06-yard-operations
specification: Raw Materials Workflow — Section 7 — Gate In (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-07-21
playwright_mcp: true
---

# Raw Materials Workflow — Section 7 — Gate In (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (`/admin/operations/gatein/add/`)

Scope: **Gateman** (source POI / port) recording gate-in for RM TO in **Driving Towards Source**.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Source Gateman records Gate-In | RM TO **Driving Towards Source** at source POI. As **Gateman** (`gateman1.nourish@yopmail.com`, working site = source/port POI), **Gate → Vehicle Entry (Gate-In) → Add**. Select TO, complete mandatory fields, submit. Assert TO **At Source** (`at_source`); `GateVisitSession` created. | P0 | Planned |
| TC02 | Gate-In blocked before Driving Towards Source | TO **Assigned** or **Ready for Dispatch**. Gate-In add blocked / TO not in eligible queryset. | P0 | Planned |
| TC03 | Vehicle registration validated against TO | Enter registration mismatching assigned vehicle. Expected: validation error. | P1 | Planned |
| TC04 | Mandatory field validation | Submit Gate-In with blank required field. `.errorlist`; no visit. | P0 | Planned |
| TC05 | Discrepancy remarks at Gate-In | Enter **remarks**; submit. Assert remarks on Gate-In / visit history. | P1 | Planned |
| TC06 | RBAC — Driver cannot Gate-In | **Driver** role: **Gate** menu absent; direct add URL denied. | P0 | Planned |
| TC07 | Audit Gate-In event | After TC01, Gate-In record / admin log shows user, timestamp, TO ref. | P1 | Planned |
| TC08 | Gate-In displays TO details | Gate-In form shows product, quantity, source/destination POI matching RM TO. | P1 | Planned |

## Implementation Notes

- Mirror FG §7; eligible status `driving_towards_source` for `rm_inbound` source leg.
- **Original ID map:** RM_067–RM_074 → TC01–TC08.
