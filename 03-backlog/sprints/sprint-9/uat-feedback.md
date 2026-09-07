---
title: Sprint 9 — UAT Feedback
source_sprint: Sprint 9
total_items: 1
resolved: 1
in_progress: 0
open: 0
---

# Sprint 9 — UAT Feedback

Client feedback captured during UAT.

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

## All items

| ID | Title | Menu / area | Priority | Status |
|----|-------|-------------|----------|--------|
| [UAT-001](#uat-001--type-rm-must-display-as-raw-materials) | Type RM shows "Port Consignment" instead of "Raw Materials" | TR / PR Type | High | Resolved |

## Resolution Summary

| Priority | Total | Resolved | Open |
|----------|-------|----------|------|
| High | 1 | 1 | 0 |
| **Total** | **1** | **1** | **0** |

---

## UAT-001 — Type RM must display as Raw Materials

| Field | Value |
|-------|-------|
| **Source** | UAT — 2026-09-07 |
| **Affected Stories** | TR / PR type labels (`PRType` / `TRType` in `apps/requisitions/constants.py`); Transport Request list, detail, filters, and TO-from-TR |
| **Closing Sub-tasks** | UAT-001-1 — User-facing Type for RM SHALL display **Raw Materials** (not "Port Consignment") · UAT-001-2 — Same label on list, detail, filters, and related create/select screens |
| **AC Amendment** | Wherever Type is shown for RM (`PORT_CONSIGNMENT` stored value), the **visible label SHALL be "Raw Materials"**. Do not show "Port Consignment". |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Stored enum value can stay `PORT_CONSIGNMENT`. This is a **display-label** change for ops. Verified 2026-09-07 on Nourish admin (Transport Planner): TR list Type column, Type filter, TR detail, and TO-from-TR Type (`get_tr_type_display`) all show **Raw Materials**. |

### Client feedback observation

Type RM is not showing correctly — it is showing **"Port Consignment"** instead of **Raw Materials**.

Ops need: Type RM must read **Raw Materials**.

### Current vs expected behaviour

| Aspect | Current (UAT) | Expected (UAT-001) |
|--------|---------------|-------------------|
| Type label for RM | **Port Consignment** | **Raw Materials** |

### Closing checklist

- [x] UAT-001-1 — Type RM displays as **Raw Materials** (not "Port Consignment")
- [x] UAT-001-2 — List, detail, filters, and related screens use the same **Raw Materials** label
