---
area: to-execution-vendor-fleet
sprint: Sprint 4
status: Draft
feature_themes:
  - "TO Execution – Vendor Fleet (TDO – Vendor Fleet)"
  - "Contractual Vendor Assignment"
  - "Non-Contractual Vendor (Bidding Workflow)"
  - "Vendor Execution & Confirmation"
  - "Fleet Availability Validation (Own Fleet)"
related_vendor_stories: VM-01 … VM-09
related_own_fleet: TLS-01, DM-01, DS-01, DS-02
last_updated: 2026-05-12
---

# Sprint 4 — TO Execution: Vendor Fleet & Own-Fleet Availability

> **Purpose:** Canonical **feature context** for Transport Department Officer (**TDO – Vendor Fleet**) TO execution: contractual assignment vs non-contractual bidding, vendor execution handoff (TEVF-03), and **own-fleet** availability validation (TEVF-04), cross-linked to [`../08-vendor-management/`](../08-vendor-management/README.md) and own-fleet yard/driver stories in this sprint.

This folder does **not** replace implementation tickets in `08-vendor-management`; it **scopes and traces** those vendor-fleet themes to VM stories (and to own-fleet execution where TEVF-04 aligns with the own-fleet availability narrative in the [Sprint 4 README](../README.md)).

## Pack index

| Theme | Backlog doc | Primary VM / sprint linkage |
|-------|-------------|-----------------------------|
| Contractual vendor assignment | [TEVF-01 — Contractual vendor assignment](TEVF-01-contractual-vendor-assignment.md) | VM-03 (tenant vendor type), VM-04/VM-09 (visibility); **direct assignment** path (no VM-05–07) |
| Non-contractual bidding | [TEVF-02 — Non-contractual bidding](TEVF-02-non-contractual-bidding.md) | VM-05, VM-06, VM-07 |
| Vendor execution & confirmation | [TEVF-03 — Vendor execution & confirmation](TEVF-03-vendor-execution-confirmation.md) | VM-08, VM-09; notifications **Phase 3** for full channel parity |
| Fleet availability (own fleet) | [TEVF-04 — Fleet availability validation (own fleet)](TEVF-04-fleet-availability-own-fleet.md) | Own-fleet availability hook in Sprint 4 README; DS-01/DS-02, DM-01, TLS-01 |

## Role model

| Role | Responsibility in this context |
|------|--------------------------------|
| **TDO – Vendor Fleet** | Marks TO as contractual-eligible, assigns contractual vendors without bidding, publishes and closes non-contractual bids, selects winner(s), assigns TOs to winners |
| **Vendor** | Receives bid or assignment context, submits bids (non-contractual), confirms vehicle/driver, uploads POD / GRN / invoice per rules |
| **Transport Planner** | Own-fleet planning; system enforces **TEVF-04** vehicle status eligibility for assignment |

## Dependency sketch

```
VM-01/02 (vendor registered) → VM-03 (join + Contractual | Non-Contractual per tenant)
        │
        ├── Contractual path (TEVF-01) → direct TO assignment → VM-08 / VM-09
        │
        └── Non-contractual path (TEVF-02) → VM-05 → VM-06 → VM-07 → VM-08 / VM-09
```

Own-fleet **TEVF-04** validation runs in parallel conceptually with vendor paths: eligibility is evaluated when **internal** vehicles are offered for TO assignment / first execution action (see TEVF-04 and [Sprint 4 README](../README.md)).

## Consistency with vendor-management folder

- **Contractual vs non-contractual** is determined per **tenant membership** (VM-03); see [08-vendor-management/README.md](../08-vendor-management/README.md) notes on vendor type gating.
- **Bidding:** publish parameters, bid window, immutable bid after submit, **price + vehicle count**, multi-winner selection, and audit timestamps are specified in TEVF-02 and reflected in VM-05 / VM-06 / VM-07.
- **Post-publish bid session mutability:** TDO can only update the **bidding window timeline** (`bid_open_date` and/or `bid_close_date`); all other published parameters are immutable. Any other change requires **cancel + republish** (see VM-04 AC-6 / TEVF-02).
- **Post-award / assignment execution** (vehicle, driver, POD, GRN, invoice gating) is owned by **VM-08**, elaborated in **TEVF-03**.
