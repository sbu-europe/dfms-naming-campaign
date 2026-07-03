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

**As an** operational user (Gateman, Scaling Operator, CC Officer, Driver Supervisor, Transport Planner, …)
**I want** a manual that covers every workflow I can perform — with screenshots of my actual screens, step-by-step instructions, and clear permission callouts
**So that** I can perform my daily tasks without supervision and without calling the DFMS support team.

**As a** Product Owner
**I want** a reviewed, versioned Phase 1 user manual signed off before UAT begins
**So that** UAT testers have a single source of truth and any manual gap found during UAT also counts as a documentation defect.

---

## Business Context

### Why a user manual is a Phase 1 acceptance artifact

DFMS Phase 1 spans every module delivered in Sprints 1–6: master data and tenant administration, requisition (PR), port shipments, distribution (TR), procurement, transport planning (TO/Trip), gate, scaling, command center, loading/unloading, QC, POD/closure, driver supervisor, driver mobile, vendor portal/app, stock validation, role dashboards, and the GPS maps dashboard.

The customer's operational staff — many of whom are yard workers, drivers, and gate operators with limited digital literacy — will be trained and onboarded based on this manual. A manual that misses a screen, describes the wrong permission, or uses a deprecated term ("Transport Order" instead of "Trip" for the driver-facing milestone) will generate support calls and undermine go-live confidence.

The manual also serves as a **contractual deliverable**: customer acceptance of Phase 1 typically requires delivered training documentation alongside a working system. Publishing the manual before UAT allows UAT testers to follow it as a reference — any step that differs from the actual system is simultaneously a manual defect and a potential system defect.

### Organization: by role, not by module

The manual is organized **by role** (what a Gateman does, end to end) rather than by module (everything the gate module can do). DFMS Phase 1 users are single-role operators — a Gateman does not need to know how TR approval works. A role-organized manual reduces cognitive load and makes training faster.

### Screenshot discipline

Screenshots must come from the **seeded demo tenant** on the current staging build (post Sprint 6 merges). Developer data, test GUIDs, or stale Sprint 3 UI captures are not acceptable. The demo tenant should be the same one used for UAT-01 seed data — consistency between manual screenshots and UAT environment reduces "the app looks different than the manual" objections.

### Terminology

The manual must use current product terminology throughout. Key terms locked in Sprint 5:
- **Trip** (not "Transport Order" in driver/execution context)
- **Bid** / **Bid Number** (not "vendor assignment" in vendor context)
- **POI** (not "depot" or "location" in general — POI is the product term)
- **Under Maintenance** (exact spelling for vehicle status — DS-01)

Glossary approved as part of DOC-01-1 (structure and template sub-task) before bulk writing begins.

### Chapters that must wait for Sprint 6 deliverables

GPS Maps Dashboard screenshots (AC-2, Admin chapter) and Vendor App screens (AC-2, Mobile chapter) depend on GPS-05 and VAPP-02 landing first. These chapters should be written last in the sprint, after GPS-05 and VAPP-02 are merged to staging.

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

## Access & Permissions

DOC-01 is a **documentation story** — it produces a user manual artifact, not a system feature with its own API or RBAC. There are no new endpoints. The access considerations below relate to who authors, reviews, and receives the manual.

| Action | Who |
|--------|-----|
| Author manual chapters | BA / Developer (per module) assigned by Sprint Lead |
| Review chapters (SME review) | Module-owning developer or designated SME per chapter |
| PO sign-off | Product Owner |
| Receive v1.0 published manual | All operational users (training / reference); customer stakeholders |
| Access the digital version (repository) | Internal team — standard repo access; customer receives PDF or agreed delivery format |

> The manual must accurately reflect RBAC — for example, the Gateman chapter must state explicitly what a Gateman **cannot** do (cannot access the maps dashboard, cannot approve TRs). Incorrect permission statements in the manual are documentation defects and will be raised as such in UAT review.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| DOC-01-1 | Structure + template | AC-1: chapter map, conventions, glossary; PO approval | High | Not started |
| DOC-01-2 | Office-role chapters | PR, Port Shipments, TR/approvals, Procurement, TO/Trip planning, TDO publish/bid/award | High | Not started |
| DOC-01-3 | Yard-role chapters | Gate, Scaling, CC, Loading/Unloading, QC, Driver Supervisor | High | Not started |
| DOC-01-4 | Mobile chapters | Driver app + Vendor app (aligned to VAPP-01 release build screens — schedule after VAPP-02 merge) | High | Not started |
| DOC-01-5 | Admin chapters | Tenant Admin master data/config + GPS Maps Dashboard (schedule after GPS-05 merge) | Medium | Not started |
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

*Epic: Phase 1 Readiness & Documentation | Phase: 1 | Sprint 6: 5 SP | Jira: DFS-075 | Last Updated: 2026-06-15*
