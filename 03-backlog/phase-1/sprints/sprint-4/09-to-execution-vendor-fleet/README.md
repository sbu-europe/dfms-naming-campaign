---
area: to-execution-vendor-fleet
sprint: Sprint 4
status: In Progress
feature_themes:
  - "TO Execution – Vendor Fleet (TDO – Vendor Fleet)"
  - "Contractual Vendor Assignment"
  - "Non-Contractual Vendor (Bidding Workflow)"
  - "Vendor Execution & Confirmation"
related_vendor_stories: VM-01 … VM-09
last_updated: 2026-05-25
---

# Sprint 4 — TO Execution: Vendor Fleet

> **Purpose:** Canonical **feature context** for Transport Department Officer (**TDO – Vendor Fleet**) TO execution: contractual assignment vs non-contractual bidding, and vendor execution handoff (TEVF-03), cross-linked to [`../08-vendor-management/`](../08-vendor-management/README.md).

This folder does **not** replace implementation tickets in `08-vendor-management`; it **scopes and traces** those vendor-fleet themes to VM stories.

> **Own-fleet availability validation** (PRD §6.8.1.7) is **out of scope for this folder** — it lives inline in the [Sprint 4 README → Own-fleet availability (§6.8.1.7)](../README.md#own-fleet-availability--vehicle-eligibility-6817). Do not conflate vendor `offered_vehicle_count` (bidding) with own-fleet MDM status.

## Pack index

| Theme | Backlog doc | Primary VM / sprint linkage |
|-------|-------------|-----------------------------|
| Contractual vendor assignment | [TEVF-01 — Contractual vendor assignment](TEVF-01-contractual-vendor-assignment.md) | VM-03 (tenant vendor type), VM-04/VM-09 (visibility); **direct assignment** path (no VM-05–07) |
| Non-contractual bidding | [TEVF-02 — Non-contractual bidding](TEVF-02-non-contractual-bidding.md) | VM-05, VM-06, VM-07 |
| Vendor execution & confirmation | [TEVF-03 — Vendor execution & confirmation](TEVF-03-vendor-execution-confirmation.md) | VM-08, VM-09; notifications **Phase 3** for full channel parity |

## Role model

| Role | Responsibility in this context |
|------|--------------------------------|
| **TDO – Vendor Fleet** | Marks TO as contractual-eligible, assigns contractual vendors without bidding, publishes and closes non-contractual bids, selects winner(s), assigns TOs to winners |
| **Vendor** | Receives bid or assignment context, submits bids (non-contractual), confirms vehicle/driver, uploads POD / GRN / invoice per rules |

## Dependency sketch

```
VM-01/02 (vendor registered) → VM-03 (join + Contractual | Non-Contractual per tenant)
        │
        ├── Contractual path (TEVF-01) → direct TO assignment → VM-08 / VM-09
        │
        └── Non-contractual path (TEVF-02) → VM-05 → VM-06 → VM-07 → VM-08 / VM-09
```

Own-fleet eligibility (§6.8.1.7) is **not** part of this folder; it is owned by the [Sprint 4 README — Own-fleet availability section](../README.md#own-fleet-availability--vehicle-eligibility-6817).

## Consistency with vendor-management folder

- **Contractual vs non-contractual** is determined per **tenant membership** (VM-03); see [08-vendor-management/README.md](../08-vendor-management/README.md) notes on vendor type gating.
- **Bidding:** publish parameters, bid window, immutable bid after submit, **price + vehicle count**, multi-winner selection, and audit timestamps are specified in TEVF-02 and reflected in VM-05 / VM-06 / VM-07.
- **Post-publish bid session mutability:** TDO can only update the **bidding window timeline** (`bid_open_date` and/or `bid_close_date`); all other published parameters are immutable. Any other change requires **cancel + republish** (see VM-04 AC-6 / TEVF-02).
- **Post-award / assignment execution** (vehicle, driver, POD, GRN, invoice gating) is owned by **VM-08**, elaborated in **TEVF-03**.
