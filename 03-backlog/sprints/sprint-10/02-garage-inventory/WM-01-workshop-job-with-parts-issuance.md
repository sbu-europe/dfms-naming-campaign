---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 10"
story_id: WM-01
title: Workshop Job with Parts Issuance
epic: Garage Inventory & Workshop
status: Pending
story_points: 8
assignee: ~
phase: Phase 2
design_ref: example-prototypes/fuel-management.html (Workshop Job Entry)
related_stories:
  - INV-03-garage-stock-and-movements.md
  - WM-02-workshop-job-complete-and-part-installations.md
  - MDM-05-vehicle-master-data.md (Sprint 2)
source_docs:
  - ../../../../05-modules/08-fleet-management/inventory-management.md
  - ../../../../example-prototypes/fuel-management.html
module_spec: 05-modules/08-fleet-management/inventory-management.md
---

# WM-01 — Workshop Job with Parts Issuance

## User Story

**As a** Workshop Supervisor  
**I want to** create a workshop job for a vehicle and issue parts from my garage stock  
**So that** the vehicle enters maintenance with parts tracked and inventory is reduced automatically

## Business Context

Internal workshop jobs issue parts at **job creation** (not at completion). External workshop jobs record outsourced cost only — no stock movement. On create, vehicle `operational_status` becomes `under_maintenance` and the vehicle is excluded from TR/TO assignment.

---

## Acceptance Criteria

### AC-1: Models

- [ ] `WorkshopJob` with fields per module spec (`job_ref`, vehicle, garage, category, problem, datetime in, estimates, status, costs).
- [ ] `WorkshopJobPartLine`: `inventory_item_id`, `quantity_issued`.

### AC-2: Workshop Job Entry UI (internal)

- [ ] Select Garage POI (assigned garages only), Vehicle, category, datetime in, problem description.
- [ ] Estimated repair duration (hours) and estimated cost (BDT) required at intake.
- [ ] **Parts table:** item dropdown from **this garage's** available stock, qty, available qty shown.
- [ ] **Hard block** if issued qty > available stock.
- [ ] At least one part line required for internal jobs.

### AC-3: External workshop

- [ ] Workshop type = External — external location name (no Garage POI).
- [ ] No part lines; outsourced + misc cost fields available.
- [ ] Vehicle still → `under_maintenance` on create.

### AC-4: On job create

- [ ] `ISSUE_TO_JOB` movement per part line.
- [ ] Job status `IN_PROGRESS`; unique `job_ref` generated.
- [ ] `Vehicle.operational_status = under_maintenance`.
- [ ] Audit: `entered_by` = current Workshop Supervisor.

### AC-5: Workshop Jobs list

- [ ] List active and completed jobs with ref, vehicle, category, garage/location, parts summary, status.
- [ ] Stats: active count, completed count, total maintenance cost.

### AC-6: API

- [ ] `POST /api/v1/workshop-jobs/`
- [ ] `GET /api/v1/workshop-jobs/?garage_poi_id=&status=`

---

## API Endpoints

```
POST   /api/v1/workshop-jobs/
GET    /api/v1/workshop-jobs/?garage_poi_id=&status=&vehicle_id=
GET    /api/v1/workshop-jobs/{id}/
```

---

## Access & Permissions

| Action | Role |
|--------|------|
| Create workshop job | `workshop_supervisor` (assigned garage) |
| View workshop jobs | `workshop_supervisor` (assigned), `tenant_admin`, `transport_planner` |
| Issue parts from stock | `workshop_supervisor` (assigned garage) |

**Permission codes (proposed):** `workshop.job.manage`, `workshop.job.view`

---

## Sub-tasks — Sprint 10

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| WM-01-1 | `WorkshopJob` + part lines | Models + create service | High | Not started |
| WM-01-2 | Parts issuance | `ISSUE_TO_JOB` movements on create | High | Not started |
| WM-01-3 | Vehicle under maintenance | Operational status update + assignment block | High | Not started |
| WM-01-4 | Workshop Job Entry UI | Form + parts table (prototype) | High | Not started |
| WM-01-5 | Workshop Jobs list | Active/completed list + stats | Medium | Not started |

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| INV-03 | Upstream | Stock balance for issuance |
| WM-02 | Downstream | Job completion flow |
| MDM-05 Vehicle | Upstream | Vehicle picker + operational status |

---

## Definition of Done

- [ ] Internal job creates movements and sets vehicle under maintenance
- [ ] Insufficient stock blocks job creation
- [ ] External job path without stock issue
- [ ] E2E scenario stub for happy path

---

*Epic: Garage Inventory & Workshop | Phase: 2 | Sprint 10: 8 SP | Last Updated: 2026-09-01*
