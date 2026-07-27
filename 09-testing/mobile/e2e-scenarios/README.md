---
section: 09-testing/mobile/e2e-scenarios
title: Mobile E2E Scenarios
version: 1.0
last_updated: 2026-07-20
---

# Mobile E2E Scenarios

End-to-end scenario documentation for DFMS mobile apps. Maestro YAML flows are
implemented in the corresponding app repository; this folder tracks scenarios,
coverage, and run status.

## Scenario folders

| Folder | App | TC range | Status |
|--------|-----|----------|--------|
| [`vendor-fleet-phase01/`](./vendor-fleet-phase01/) | Vendor Fleet (`nourish-vendor-app`) | TC_075–TC_215 | In progress |

## Naming convention

- Folder: `<module-or-phase>-<descriptor>/`
- File: `<order>-<feature-area>.md`
- Columns: **Maestro Status**, **Maestro Flow** (path under `nourish-vendor-app/.maestro/`)

## Maestro status legend

| Status | Meaning |
|--------|---------|
| **Not Started** | Documented only |
| **Partial** | Related flow exists; TC not fully covered |
| **Covered** | Maestro flow passing |
| **Manual** | Requires admin/backend seed; not pure mobile automation |
| **N/A** | Out of scope for vendor mobile app |
