---
jira_key: DFS-075
jira_type: Story
jira_sprint: "Sprint 6"
story_id: DOC-01
title: Phase 1 User Manual Readiness
epic: Phase 1 Readiness & Documentation
status: New — Sprint 6 Scope
story_points: 5
assignee: ~
related_stories:
  - UAT-01 (UAT documentation — shared module inventory and role matrix)
---

# DOC-01 — Phase 1 User Manual Readiness

## User Stories

> **As an operational user (Gateman, Scaling Operator, CC Officer, …)**, I want a manual for my role with screenshots of my actual screens so that I can perform my daily tasks without supervision.

> **As a Product Owner**, I want a reviewed, versioned Phase 1 manual so that training and acceptance are based on a single source of truth.

---

## Context

Phase 1 spans every module delivered in Sprints 1–5: master data and tenant administration, requisition (PR), port shipments, distribution (TR), procurement, transport planning (TO/Trip), gate, scaling, command center, loading/unloading, QC, POD/closure, driver supervisor, driver mobile, vendor portal/app, stock validation, role dashboards, and the GPS maps dashboard (landing in Sprint 6 as GPS-01 production).

This story produces the **Phase 1 User Manual** — role-based, screenshot-backed, and reviewed — so that UAT participants and go-live users have an authoritative reference. The manual is organized **by role** (what a Gateman needs, end to end) rather than by module, because Phase 1 users are single-role operators.

---

## Business Value

- UAT efficiency: testers follow the manual rather than asking the dev team how each screen works; manual gaps found in UAT double as documentation QA.
- Go-live enablement: training and support for yard operators, office roles, drivers, and vendors run off this manual.
- Contractual readiness: a delivered user manual is a standard Phase 1 acceptance artifact.

---

## Acceptance Criteria

### AC-1 — Structure & Template

- Manual structure approved by PO before content writing starts: per-role chapters, common conventions (login, navigation, dashboard), glossary using current product terminology (**Trip**, not "Transport Order", per the Sprint 5 rename).
- Template defines: screenshot convention (annotated, current UI, seeded demo tenant), step-numbering style, callout style for warnings/permissions, and version header.

### AC-2 — Role Coverage (complete Phase 1 matrix)

Each role chapter covers login → dashboard → every workflow the role can perform → error/edge guidance:

| Audience | Chapters |
|----------|----------|
| Office roles | Depot/Feed Mill Officer (PR), Commercial (Port Shipments), Distribution Officer + Manager (TR, approvals, capacity warnings), Procurement, Transport Planner (TO/Trip creation, assignment, closure dashboard), TDO Own-Fleet & Vendor-Fleet (publish, Bid creation, evaluation, award) |
| Yard roles | Gateman (gate-in/out, on-demand TO), Gate Supervisor, Scaling Operator (scale-in/out, queue token), Command Center Officer (queue, bay assignment, waiting serial), Loading/Unloading Personnel, QC Inspector (sampling, pass/fail, resample), Driver Supervisor (checklists, maintenance, attendance/leave) |
| Mobile | Driver app (TO list, Trip Start, transitions), Vendor app (registration/OTP, bids, vehicle-driver submission, Start/Complete Trip, profile/account) |
| Admin | Tenant Admin (users/roles, POI + geofence + dwell threshold, L/U points, stock, vehicle/driver master), GPS Maps Dashboard (map layers, vehicle panel, dwell/geofence events) |

### AC-3 — Accuracy

- Every documented step verified against the current staging build (post Sprint 6 merges); screenshots taken from the seeded demo tenant — no developer data, no stale UI.
- Permissions stated per workflow match the implemented RBAC (cross-checked with the role-permission matrix).

### AC-4 — Review & Publication

- Each chapter reviewed by a module SME (the implementing developer or BA); corrections applied.
- PO review of the assembled manual; sign-off recorded.
- Published as versioned **v1.0** in an agreed location/format (repository `docs/` + exported PDF, or the agreed alternative), with a change-log section for post-UAT corrections.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| DOC-01-1 | Structure + template | AC-1: chapter map, conventions, glossary; PO approval | High | Not started |
| DOC-01-2 | Office-role chapters | PR, Port Shipments, TR/approvals, Procurement, TO/Trip planning, TDO publish/bid/award | High | Not started |
| DOC-01-3 | Yard-role chapters | Gate, Scaling, CC, Loading/Unloading, QC, Driver Supervisor | High | Not started |
| DOC-01-4 | Mobile chapters | Driver app + Vendor app (aligned to VAPP-01 release build screens) | High | Not started |
| DOC-01-5 | Admin chapters | Tenant Admin master data/config + GPS Maps Dashboard | Medium | Not started |
| DOC-01-6 | Review & publish v1.0 | SME reviews, PO sign-off, versioned publication | High | Not started |

---

## Definition of Done

- [ ] Structure/template approved before bulk writing (DOC-01-1)
- [ ] All role chapters in AC-2 complete with current screenshots
- [ ] Steps verified against staging; permissions match implemented RBAC (AC-3)
- [ ] SME + PO reviews done; v1.0 published with change-log (AC-4)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Sprint 6 functional scope | Upstream | GPS-05 dashboard and VAPP-02 design changes alter screenshots — schedule those chapters late in the sprint |
| UAT-01 seed data / demo tenant | Shared | Screenshots and UAT scripts should show the same seeded data |
| SME availability | Review | One reviewer per module booked at sprint start |

---

*Epic: Phase 1 Readiness & Documentation | Phase: 1 | Sprint 6: 5 SP | Jira: DFS-075 | Last Updated: 2026-06-12*
