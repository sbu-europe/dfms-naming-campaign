---
section: 09-testing/backend/e2e-scenarios/sprint-8
title: Sprint 8 — Improvements E2E Scenario Plans
version: 1.0
last_updated: 2026-08-11
---

# Sprint 8 — E2E scenarios

Playwright MCP scenario plans for Sprint 8 improvements carried from Sprint 7 (`03-backlog/sprints/sprint-8/improvements/`).

### Improvements (carried from Sprint 7)

| Improvement | Plan | Status |
|-------------|------|--------|
| FB-001 — Phone normalization on bulk user & driver import | [fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md](./fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md) | **8/8 Pass** (2026-08-03) |
| FB-003 — Driver invitation bulk I/O: reference contacts & address | [fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md](./fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md) | **6/6 Pass** (2026-08-03) |
| FB-004 — Driver bulk I/O: accident history & last training assessment | [fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md](./fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md) | **6/6 Pass** (2026-08-03) |
| FB-005 — Loading/Unloading bulk import & export | [fb-013-loading-unloading-bulk-import-export-e2e-scenarios.md](./fb-013-loading-unloading-bulk-import-export-e2e-scenarios.md) | **11/11 Pass** (2026-08-04) |
| FB-006 — Product bulk: remove Amount column from template | [fb-014-product-bulk-remove-amount-column-e2e-scenarios.md](./fb-014-product-bulk-remove-amount-column-e2e-scenarios.md) | **6/6 Pass** (2026-08-04) |
| FB-007 — Product Sub-Category bulk import & export | [fb-015-product-sub-category-bulk-import-export-e2e-scenarios.md](./fb-015-product-sub-category-bulk-import-export-e2e-scenarios.md) | **11/11 Pass** (2026-08-04) |
| FB-008 — PR locked after submission (Depot / Feed Mill / Commercial) | [fb-008-pr-locked-after-submission-e2e-scenarios.md](./fb-008-pr-locked-after-submission-e2e-scenarios.md) | **8/8 Pass** (2026-08-07; TC09 Skip) |
| FB-009 — TR List: Total Weight (KG) instead of Total Quantity (DO / DM / PO) | [fb-009-tr-list-total-weight-kg-e2e-scenarios.md](./fb-009-tr-list-total-weight-kg-e2e-scenarios.md) | **5/5 Pass** (2026-08-07) |
| FB-010 — TR Details & line items: Total Weight (KG) + Total Quantity (DO / DM / PO) | [fb-010-tr-details-line-items-total-weight-kg-e2e-scenarios.md](./fb-010-tr-details-line-items-total-weight-kg-e2e-scenarios.md) | **6/6 Pass** (2026-08-07) |
| FB-011 — Transport Planner TR List: Remaining Weight (KG) | [fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md](./fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md) | **6/6 Pass** (2026-08-07) |
| FB-012 — TO Creation: Remaining Quantity on Allocate Quantities per Product | [fb-012-to-creation-remaining-quantity-e2e-scenarios.md](./fb-012-to-creation-remaining-quantity-e2e-scenarios.md) | **8/8 Pass** (2026-08-07) |
| FB-014 — My Trips details: Cargo Allocated Weight with Allocated Quantity | [fb-014-my-trips-cargo-allocated-weight-e2e-scenarios.md](./fb-014-my-trips-cargo-allocated-weight-e2e-scenarios.md) | Planned |
| FB-015 — TO Creation: Allocating TO Load live sum in MT (kg) | [fb-015-to-creation-allocating-to-load-e2e-scenarios.md](./fb-015-to-creation-allocating-to-load-e2e-scenarios.md) | **7/7 Pass** (2026-08-07) |
| FB-020 — On-Demand TO create: optional Gate-in date/time (Option A) | [fb-020-on-demand-to-optional-gate-in-e2e-scenarios.md](./fb-020-on-demand-to-optional-gate-in-e2e-scenarios.md) | Planned (7 TCs; run after impl) |
| FB-027 — TO fleet type interchange: Vendor ↔ Own before Ready for Dispatch | [fb-027-to-fleet-type-interchange-e2e-scenarios.md](./fb-027-to-fleet-type-interchange-e2e-scenarios.md) | **11/11 Pass** · 2 Skip (2026-08-11) |

> **Naming:** [`fb-009-phone-normalization-…`](./fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md) maps to improvements **FB-001** (legacy sprint-7 FB-009 id). Improvements **FB-009** (TR weight) uses [`fb-009-tr-list-total-weight-kg-e2e-scenarios.md`](./fb-009-tr-list-total-weight-kg-e2e-scenarios.md). Improvements **FB-011** (planner remaining weight) uses [`fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md`](./fb-011-transport-planner-tr-list-remaining-weight-kg-e2e-scenarios.md) — distinct from [`fb-011-driver-invitation-…`](./fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md) (improvements **FB-003**). Improvements **FB-012** uses [`fb-012-to-creation-remaining-quantity-e2e-scenarios.md`](./fb-012-to-creation-remaining-quantity-e2e-scenarios.md) — distinct from [`fb-012-driver-bulk-…`](./fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md) (improvements **FB-004**). Improvements **FB-014** (My Trips cargo weight) uses [`fb-014-my-trips-cargo-allocated-weight-e2e-scenarios.md`](./fb-014-my-trips-cargo-allocated-weight-e2e-scenarios.md) — distinct from [`fb-014-product-bulk-…`](./fb-014-product-bulk-remove-amount-column-e2e-scenarios.md) (improvements **FB-006**). Improvements **FB-015** (Allocating TO Load) uses [`fb-015-to-creation-allocating-to-load-e2e-scenarios.md`](./fb-015-to-creation-allocating-to-load-e2e-scenarios.md) — distinct from [`fb-015-product-sub-category-…`](./fb-015-product-sub-category-bulk-import-export-e2e-scenarios.md) (improvements **FB-007**). Improvements **FB-027** (fleet interchange) uses [`fb-027-to-fleet-type-interchange-e2e-scenarios.md`](./fb-027-to-fleet-type-interchange-e2e-scenarios.md).

Sprint 7 plans for FB-001–FB-008 and VM-09 remain under [`../sprint-7/`](../sprint-7/README.md).
