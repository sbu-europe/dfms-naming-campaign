---
section: 09-testing/stories-phase-2/008-Vendor Rating System
phase: Phase 2
epic: Vendor Rating System
tdd: true
last_updated: 2026-09-14
source_stories: ../../../03-backlog/stories-phase-2/008-Vendor Rating System/
module_spec: ../../../05-modules/07-vendor-management/vendor-rating.md
---

# 008 — Vendor Rating System — TDD test catalogs

Derived from story **Given–When–Then** scenarios (`AC-N.x`). Write failing tests first; implement until green.

| File | Story | Preferred first layer | P0 focus |
|------|-------|----------------------|----------|
| [00-all-test-cases.md](./00-all-test-cases.md) | Index | — | Full TC matrix |
| [VRS-01](./VRS-01-post-to-vendor-rating-admin-tdd-test-cases.md) | Post-TO vendor rating (admin) | **Unit** (avg + immutability) → API | Pending on COMPLETED, rolling avg, 403 vendor |
| [VRS-02](./VRS-02-vendor-rates-tenant-mobile-tdd-test-cases.md) | Vendor rates tenant (mobile) | API + Maestro | Skip, duplicate 400, Join Tenant |
| [VRS-03](./VRS-03-vendor-rating-visibility-admin-tdd-test-cases.md) | Rating visibility surfaces | API + Admin E2E | Profile/bid/list/TO, award snapshot, 403 |

## Recommended TDD order

1. **VRS-01** unit (`average_rating` + rolling `Vendor.rating` + immutability)  
2. **VRS-01** API (pending on COMPLETED, submit, vendor 403)  
3. **VRS-02** API + Maestro (mobile submit, skip, duplicate 400, Join Tenant)  
4. **VRS-03** visibility surfaces (profile, bid list/comparison, vendor list, TO detail)

## ID convention

| ID | Meaning |
|----|---------|
| `VRS-0x-TC##` | Primary test case for story VRS-0x |
| `AC-N.x` | Source scenario on the story file |
| `VRS-0x-EC##` | Edge-case row from story Edge Cases |

**Status values:** `Planned` · `Failing` · `Passing` · `Blocked (PO)`

## Story links

- [VRS-01](../../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-01-post-to-vendor-rating-admin.md)
- [VRS-02](../../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-02-vendor-rates-tenant-mobile.md)
- [VRS-03](../../../03-backlog/stories-phase-2/008-Vendor%20Rating%20System/VRS-03-vendor-rating-visibility-admin.md)
