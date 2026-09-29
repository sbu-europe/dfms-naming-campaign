---
jira_key: ~
jira_type: Story
jira_sprint: ~
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
tdd_test_cases: ../../../../09-testing/stories-phase-2/006-Vehicle Reports/VR-01-reports-menu-navigation-tdd-test-cases.md
tdd_index: ../../../../09-testing/stories-phase-2/006-Vehicle Reports/00-all-test-cases.md
---

# VR-01 — Reports Menu — Vehicle Report Navigation & RBAC

## Test cases

Gherkin / TDD scenarios live under `09-testing` (not inline in this story).

| Navigate | Link |
|----------|------|
| **VR-01 TDD catalog** (`AC-N.x` mapped) | [VR-01-reports-menu-navigation-tdd-test-cases.md](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md) |
| **Vehicle Reports TDD index** (all stories) | [00-all-test-cases.md](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md) |
| **Feature TDD folder** | [README](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/README.md) |

Write failing tests from the catalog **before** implementation.


## User Story

**As a** Tenant Super Admin, Tenant Admin, Transport Planner, or Driver Supervisor  
**I want** a **Reports** section in the portal menu with a **Vehicle Report** submenu  
**So that** fuel, health, and parts information is separate from Vehicle Planning (TO assignment)

## Business Context

Fuel, compliance, and parts visibility moves to **Reports → Vehicle Report** — a dedicated read-only reporting surface (prototype Fleet Dashboard pattern).

---

## Acceptance Criteria

> **Test scenarios:** see [VR-01 TDD catalog](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md) · [Vehicle Reports index](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md)

### AC-1: Portal navigation

Given an authorized user opens the admin portal,

when they use the main navigation,

then a **Reports** section exposes **Vehicle Report**, and Vehicle Planning stays unchanged.

- [ ] New top-level portal section: **Reports** (folder/drawer).
- [ ] Submenu item: **Vehicle Report** → `/admin/reports/vehicle-report/` (or equivalent).
- [ ] **Vehicle Planning** under Transport section is **unchanged** (no fuel/health panels added).

### AC-2: RBAC

Given roles with or without `MENU_VEHICLE_REPORT_VIEW`,

when they load the portal menu,

then only granted roles see Reports → Vehicle Report.

- [ ] New permission: `MENU_VEHICLE_REPORT_VIEW`.
- [ ] Granted to: `tenant_super_admin`, `tenant_admin`, `transport_planner`, `driver_supervisor`.
- [ ] Other roles do not see Reports → Vehicle Report unless explicitly granted.

### AC-3: Breadcrumbs

Given the user is on Vehicle Report overview or detail,

when the page renders,

then breadcrumbs follow Home → Reports → Vehicle Report [→ registration].

- [ ] Home → Reports → Vehicle Report (and detail: → `{registration}`).

---

## Edge Cases

- Permission granted later: menu appears on next load without redeploy.
- Deep-link to Vehicle Report without permission: 403 / redirect, not empty page with data leak.
- Super-admin / custom role: only sees item if `MENU_VEHICLE_REPORT_VIEW` assigned.

---

## Access & Permissions

| Action | Role |
|--------|------|
| See Reports → Vehicle Report menu | `tenant_super_admin`, `tenant_admin`, `transport_planner`, `driver_supervisor` |
| Vehicle Planning (unchanged) | `transport_planner` (`MENU_VEHICLE_PLANNING_VIEW`) |

**Permission codes (proposed):** `MENU_VEHICLE_REPORT_VIEW`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-01-1 | Reports menu section | `PORTAL_NAV_SECTIONS` + Vehicle Report item | High | Not started |
| VR-01-2 | Permission seed | `MENU_VEHICLE_REPORT_VIEW` for TSA, TA, TP, DS | High | Not started |
| VR-01-3 | Tests | Cover AC-1…AC-3 + Edge Cases (RBAC) | High | Not started |

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
- [ ] Tests for AC-1.1…AC-3.2 — see [VR-01 TDD catalog](../../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vehicle Reports | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
