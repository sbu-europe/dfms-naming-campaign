---
title: Phase 2 — 008 Vendor Rating System
sprint: ~
phase: Phase 2
status: Planning
epic: Vendor Rating System
story_points_estimated: 19
---

# 008 — Vendor Rating System

Bidirectional (vice versa) post-TO ratings: tenant rates vendor (admin); vendor rates tenant (mobile). Each rating is a **single 1–5 score** plus **3 random Yes/No radio questions** (no multi-criterion star panels). Admin visibility + bid views. UI follows existing portal and Vendor App themes.

Previously planned under Sprint 10 (`03-backlog/phase-1/sprints/sprint-10/04-vendor-ratings/`). Moved to Phase 2 unscheduled backlog.

| File | Role | TDD test cases |
|------|------|----------------|
| [VRS-01](./VRS-01-post-to-vendor-rating-admin.md) | Story — Post-TO Vendor Rating — Tenant Super Admin / Tenant Admin / TDO (Admin Portal) (8 SP) | [VRS-01 TDD](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) |
| [VRS-02](./VRS-02-vendor-rates-tenant-mobile.md) | Story — Vendor Rates Tenant — Post-TO Structured Rating (Vendor Mobile App) (8 SP) | [VRS-02 TDD](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md) |
| [VRS-03](./VRS-03-vendor-rating-visibility-admin.md) | Story — Vendor Rating Visibility — Admin Portal (Profile + Bid Views) (3 SP) | [VRS-03 TDD](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) |

**Module spec:** [`05-modules/07-vendor-management/vendor-rating.md`](../../../../05-modules/07-vendor-management/vendor-rating.md)

**Story AC format:** Each story uses **Given–When–Then** acceptance criteria and an **Edge Cases** section. **Gherkin / TDD scenarios** (`AC-N.x`) live in `09-testing` (linked from each story) — not inline under AC.

**TDD test catalogs:**  
- Feature folder: [`09-testing/stories-phase-2/008-Vendor Rating System/`](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/)  
- Master index: [`00-all-test-cases.md`](../../../../09-testing/stories-phase-2/008-Vendor%20Rating%20System/00-all-test-cases.md) (`VRS-0x-TC##` ↔ story `AC-N.x`)

**Stories:** VRS-01 – VRS-03 · **Estimated:** ~19 SP

**Phase 2 index:** [../README.md](../README.md)
