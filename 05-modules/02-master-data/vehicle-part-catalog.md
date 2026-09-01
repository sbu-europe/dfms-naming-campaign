---
module: 02-master-data
specification: Vehicle Part Catalog (SUPERSEDED)
version: 1.0
status: superseded
superseded_by: ../08-fleet-management/inventory-management.md
last_updated: 2026-09-01
---

# Vehicle Part Catalog — SUPERSEDED

> **This spec is superseded.** Use **[inventory-management.md](../08-fleet-management/inventory-management.md)** instead.

Sprint 10 Epic 02 was revised from standalone vehicle parts catalog (VP-01–03) to **Garage Inventory & Workshop** (INV-01–03, WM-01–02).

| Old concept | New concept |
|-------------|-------------|
| `VehiclePartType` catalog | `InventoryItem` (multi-type: parts, machinery, consumables) |
| Manual part install on vehicle | Part install on **workshop job complete** |
| No stock tracking | `GarageStock` per Garage POI |

**Stories:** See [`02-garage-inventory/`](../../03-backlog/sprints/sprint-10/02-garage-inventory/) and [`inventory-management.md`](../08-fleet-management/inventory-management.md).
