# Broken Links Report

**Generated**: May 08, 2026  
**Total broken links**: 11  
**Affected files**: 7  

## Summary by Category

| Cat | Description | Count |
|-----|-------------|-------|
| A | Hardcoded OS absolute paths (`/home/`, `/Users/`) | 0 |
| B | `.cursor/` internal references | 0 |
| C | Paths going above repo root (depth error) | 0 |
| D | Old pre-reorganisation folder structure | 0 |
| E | Genuinely unwritten / missing content | 11 |

> **Note**: All path and structure issues have been resolved.
> Remaining broken links point to content that is planned but not yet authored.

---

## Broken Links by Source File

### `01-source/04-wbs/README.md`
- [E] `./WBS_Nourish_DFMS%20Phase%201%20v1.xlsx`

  > File exists as `WBS_Nourish_DFMS Phase 1 v1.xlsx` (URL-encoding issue in link — minor, browsers handle this).

### `04-architecture/07-implementation/planning/IMPLEMENTATION_TIMELINE.md`
- [E] `../../03-backlog/feature-dependencies.md`

  > `feature-dependencies.md` has not been authored yet.

### `05-modules/03-users/tenant-user-management.md`
- [E] `../../../03-backlog/phase-1/sprints/sprint-2/02-tenant-user-management/README.md`

  > README.md now created — this link should resolve. ✓

### `10-reference/data-reference/README.md`
- [E] `./master-data/vehicles.md`
- [E] `./master-data/drivers.md`
- [E] `./master-data/vendors.md`
- [E] `./master-data/locations.md`
- [E] `./master-data/products.md`
- [E] `./master-data/zones.md`
- [E] `./transactional-data/transport-requests.md`
- [E] `./transactional-data/transport-orders.md`
- [E] `./transactional-data/trips.md`
- [E] `./transactional-data/quality-checks.md`

  > Individual data entity files not yet written. Tracked in `.structure`.

### `_meta/reports/module-reorganization-report.md`
- [E] `README.md`

  > Self-referential or placeholder link in report file.

---

## Resolved in This Session (25 → 11)

| Fix | Files affected |
|-----|----------------|
| Depth errors: `../../../../` → `../../../` | `TASKS.md`, `planning/README.md` |
| Depth errors: `../../../03-backlog/` → `../../03-backlog/` | `data-reference/README.md`, `data-dictionary.md` |
| Depth errors: `../../../../03-backlog/` → `../../../03-backlog/` | `master-data-overview.md`, `transactional-data-overview.md` |
| Old deployment path → `06-deployment/README.md` | `08-development-guides/01-backend/README.md` |
| Wrong archive path → `../../02-domain/02-requirements/…` | `_meta/archive/phase-1-summary-old-2026-02-11.md` |
| Created `README.md` | `04-non-functional-requirements/`, `sprint-2/02-tenant-user-management/` |
