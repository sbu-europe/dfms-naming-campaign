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
  - ../../../05-modules/11-reporting/vehicle-report.md
module_spec: 05-modules/11-reporting/vehicle-report.md
tdd_test_cases: ../../../09-testing/stories-phase-2/006-Vehicle Reports/VR-01-reports-menu-navigation-tdd-test-cases.md
tdd_index: ../../../09-testing/stories-phase-2/006-Vehicle Reports/00-all-test-cases.md
---

# VR-01 — Reports Menu — Vehicle Report Navigation & RBAC

## TDD Test Cases

| Link | What |
|------|------|
| [VR-01 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md) | `VR-01-TC##` ↔ `AC-N.x` |
| [Vehicle Reports TDD index](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/00-all-test-cases.md) | All VR-01…VR-03 |
| [Feature TDD folder](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/README.md) | README + TDD order |

Write failing tests from the catalog **before** implementation.

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

Given an authorized user opens the admin portal,

when they use the main navigation,

then a **Reports** section exposes **Vehicle Report**, and Vehicle Planning stays unchanged.

- [ ] New top-level portal section: **Reports** (folder/drawer).
- [ ] Submenu item: **Vehicle Report** → `/admin/reports/vehicle-report/` (or equivalent).
- [ ] **Vehicle Planning** under Transport section is **unchanged** (no fuel/health panels added).

**Test Scenarios (AC-1):**

```gherkin
Scenario: AC-1.1 - Reports → Vehicle Report menu exists
  Given a transport_planner is logged into the admin portal
  When they open the portal navigation
  Then a top-level Reports section is visible
  And Vehicle Report navigates to /admin/reports/vehicle-report/ (or equivalent)

Scenario: AC-1.2 - Vehicle Planning unchanged
  Given Vehicle Planning exists under Transport
  When the Reports menu is added
  Then Vehicle Planning still has no fuel/health panels
  And TO assignment UX is unchanged
```

### AC-2: RBAC

Given roles with or without `MENU_VEHICLE_REPORT_VIEW`,

when they load the portal menu,

then only granted roles see Reports → Vehicle Report.

- [ ] New permission: `MENU_VEHICLE_REPORT_VIEW`.
- [ ] Granted to: `transport_planner`, `driver_supervisor`, `tenant_admin`.
- [ ] Other roles do not see Reports → Vehicle Report unless explicitly granted.

**Test Scenarios (AC-2):**

```gherkin
Scenario: AC-2.1 - TP, DS, tenant_admin see Vehicle Report
  Given users with transport_planner, driver_supervisor, or tenant_admin
  When each opens the portal
  Then Reports → Vehicle Report is visible

Scenario: AC-2.2 - Ungranted role cannot see menu
  Given a role without MENU_VEHICLE_REPORT_VIEW
  When the user opens the portal
  Then Reports → Vehicle Report is not shown
  And direct URL access is denied (403) unless permission is later granted
```

### AC-3: Breadcrumbs

Given the user is on Vehicle Report overview or detail,

when the page renders,

then breadcrumbs follow Home → Reports → Vehicle Report [→ registration].

- [ ] Home → Reports → Vehicle Report (and detail: → `{registration}`).

**Test Scenarios (AC-3):**

```gherkin
Scenario: AC-3.1 - Overview breadcrumbs
  Given the user opens Vehicle Report overview
  When the page loads
  Then breadcrumbs are Home → Reports → Vehicle Report

Scenario: AC-3.2 - Detail breadcrumbs include registration
  Given the user opens detail for vehicle DHK-1234
  When the page loads
  Then breadcrumbs are Home → Reports → Vehicle Report → DHK-1234
```

---

## Edge Cases

- Permission granted later: menu appears on next load without redeploy.
- Deep-link to Vehicle Report without permission: 403 / redirect, not empty page with data leak.
- Super-admin / custom role: only sees item if `MENU_VEHICLE_REPORT_VIEW` assigned.

---

## Access & Permissions

| Action | Role |
|--------|------|
| See Reports → Vehicle Report menu | `transport_planner`, `driver_supervisor`, `tenant_admin` |
| Vehicle Planning (unchanged) | `transport_planner` (`MENU_VEHICLE_PLANNING_VIEW`) |

**Permission codes (proposed):** `MENU_VEHICLE_REPORT_VIEW`

---

## Sub-tasks

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VR-01-1 | Reports menu section | `PORTAL_NAV_SECTIONS` + Vehicle Report item | High | Not started |
| VR-01-2 | Permission seed | `MENU_VEHICLE_REPORT_VIEW` for TP, DS, tenant admin | High | Not started |
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
- [ ] Tests for AC-1.1…AC-3.2 — see [VR-01 TDD catalog](../../../09-testing/stories-phase-2/006-Vehicle%20Reports/VR-01-reports-menu-navigation-tdd-test-cases.md)
- [ ] TDD catalog statuses updated for P0 rows

---

*Epic: Vehicle Reports | Phase: 2 (unscheduled) | 3 SP | Last Updated: 2026-09-14*
