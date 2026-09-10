---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VR-01
title: Reports Menu — Vehicle Report Navigation & RBAC
epic: Vehicle Reports
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
related_stories:
  - VR-02-vehicle-report-fleet-overview.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../../05-modules/11-reporting/vehicle-report.md
module_spec: 05-modules/11-reporting/vehicle-report.md
---

# VR-01 — Reports Menu — Vehicle Report Navigation & RBAC

## User Story

**As a** Transport Planner or Driver Supervisor  
**I want** a **Reports** section in the portal menu with a **Vehicle Report** submenu  
**So that** fuel, health, and parts information is separate from Vehicle Planning (TO assignment)

## Business Context

**Vehicle Planning** remains unchanged — TO-centric assignment only ([`vehicle-planning-view.md`](../../../05-modules/05-transport/vehicle-planning-view.md) v1).

Fuel, compliance, and parts visibility moves to **Reports → Vehicle Report** — a dedicated read-only reporting surface (prototype Fleet Dashboard pattern).

---

## Acceptance Criteria

### AC-1: Portal navigation

- [ ] New top-level portal section: **Reports** (folder/drawer).
- [ ] Submenu item: **Vehicle Report** → `/admin/reports/vehicle-report/` (or equivalent).
- [ ] **Vehicle Planning** under Transport section is **unchanged** (no fuel/health panels added).

### AC-2: RBAC

- [ ] New permission: `MENU_VEHICLE_REPORT_VIEW`.
- [ ] Granted to: `transport_planner`, `driver_supervisor`, `tenant_admin`.
- [ ] Other roles do not see Reports → Vehicle Report unless explicitly granted.

### AC-3: Breadcrumbs

- [ ] Home → Reports → Vehicle Report (and detail: → `{registration}`).

---

## Access & Permissions

| Action | Role |
|--------|------|
| See Reports → Vehicle Report menu | `transport_planner`, `driver_supervisor`, `tenant_admin` |
| Vehicle Planning (unchanged) | `transport_planner` (`MENU_VEHICLE_PLANNING_VIEW`) |

**Permission codes (proposed):** `MENU_VEHICLE_REPORT_VIEW`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-01-1 | Reports menu section | `PORTAL_NAV_SECTIONS` + Vehicle Report item | High | Not started |
| VR-01-2 | Permission seed | `MENU_VEHICLE_REPORT_VIEW` for TP, DS, tenant admin | High | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| `portal_navigation.py` | Upstream | Existing nav pattern |
| VR-02 | Downstream | Landing route content |

---

## Definition of Done

- [ ] `PORTAL_NAV_SECTIONS` updated with Reports block
- [ ] Permission seeded
- [ ] Empty landing route registered (content in VR-02)

---

*Epic: Vehicle Reports | Phase: 2 | Sprint 10: 3 SP | Last Updated: 2026-09-01*
