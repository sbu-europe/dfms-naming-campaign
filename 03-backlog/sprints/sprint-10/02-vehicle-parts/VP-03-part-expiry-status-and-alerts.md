---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: VP-03
title: Part Expiry Status & Alerts
epic: Vehicle Parts Master Data
status: Pending
story_points: 3
assignee: ~
phase: Phase 2
related_stories:
  - VP-02-vehicle-part-installation-tracking.md
  - VR-03-vehicle-report-detail-view.md
source_docs:
  - ../../../../05-modules/02-master-data/vehicle-part-catalog.md
module_spec: 05-modules/02-master-data/vehicle-part-catalog.md
---

# VP-03 — Part Expiry Status & Alerts

## User Story

**As a** Transport Planner  
**I want to** see which vehicle parts are expired or expiring soon  
**So that** I can schedule maintenance before failures or compliance gaps

## Acceptance Criteria

### AC-1: Status computation (computed, not stored)

| Status | Rule |
|--------|------|
| **Valid** | Neither date nor mileage threshold breached |
| **Expiring soon** | ≤ 30 days to `expiry_date` **OR** ≤ 500 km to `expiry_odometer_km` |
| **Expired** | Past `expiry_date` **OR** `current_odometer ≥ expiry_odometer_km` |

- [ ] `PartExpiryService.status(installation, current_odometer)` — unit tested.
- [ ] Expired if **either** date or mileage threshold breached (whichever comes first).

### AC-2: Vehicle admin parts panel

- [ ] Active installations table: Part Name, Installed Date, Expires On, km Remaining, Status chip (Valid / Expiring soon / Expired).
- [ ] Filter vehicle list by “has expired parts” / “has expiring soon parts”.

### AC-3: API exposure

- [ ] Part status included in `VehicleReportDetail.parts` (VR-03).
- [ ] `GET /api/v1/vehicles/{id}/part-installations/` returns computed `status` per row.

### AC-4: Alerts (Sprint 10 scope)

- [ ] Visual flags only (chips/banners) — no push/email notifications in this sprint.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View expiry status on vehicle admin | `transport_planner`, `tenant_admin`, `driver_supervisor` |
| Filter vehicles by expired parts | `transport_planner`, `tenant_admin` |

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VP-03-1 | `PartExpiryService` | valid / expiring soon / expired computation | High | Not started |
| VP-03-2 | Vehicle admin parts panel | Status chips + list filters | Medium | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VP-02 | Upstream | Active installations |
| VR-03 | Downstream | Parts section on vehicle report |

---

## Definition of Done

- [ ] Expiry service with configurable thresholds (30 days / 500 km defaults)
- [ ] Vehicle admin panel with status chips
- [ ] Vehicle Report integration ready for VR-03

---

*Epic: Vehicle Parts Master Data | Phase: 2 | Sprint 10: 3 SP | Last Updated: 2026-09-01*
