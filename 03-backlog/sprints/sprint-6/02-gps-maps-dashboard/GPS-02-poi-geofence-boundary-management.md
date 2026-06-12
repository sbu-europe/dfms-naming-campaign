---
jira_key: DFS-078
jira_type: Story
jira_sprint: "Sprint 6"
story_id: GPS-02
title: POI Geofencing Boundary Management — Tenant Admin Configuration
epic: GPS & Maps Dashboard
status: New — Sprint 6 Scope
story_points: 1
assignee: ~
prd_refs:
  - "§6.5.7 POI Geofencing Boundary Management"
phase: Phase 1
---

# GPS-02 — POI Geofencing Boundary Management

## User Story

> **As a Tenant Admin**, I want to define geofencing boundaries for each POI so that vehicle movement can be automatically tracked when entering or exiting facilities. *(PRD §6.5.7)*

---

## Context

The geofence engine (GPS-03) and dwell tracking (GPS-04) need a configured boundary per POI before they can detect anything. This story delivers the **configuration surface**: radius-based geofences on POI master data, managed by Tenant Admin, audited, and effective immediately. It also owns the **dwell threshold configuration** consumed by GPS-04, so all POI-level GPS configuration lives in one admin surface.

POI master data already carries `lat`/`lng` (Sprint 4) and an optional `geofence_radius_m` field was anticipated in the Sprint 5 dependency list — this story makes it real, validated, and governed.

---

## Business Value

- Operations can tune boundaries per facility (a port berth and a feed mill need different radii) without developer involvement.
- Audit + confirmation rules make geofence changes defensible when dwell-time exceptions are disputed.

---

## Acceptance Criteria

### AC-1 — Radius-based geofence definition

- Tenant Admin defines/edits a geofence **radius in meters** per POI from POI master data admin; validation enforces a sane range (min/max agreed with PO).
- Geofence is linked to the POI master record — **one active geofence per POI** at a time.

### AC-2 — Immediate effect

- Radius changes take effect **immediately for live trips** — the engine (GPS-03) reads the current radius at evaluation time; no restart, cache flush, or trip re-creation needed. Verified by changing a radius while a (mock) vehicle is near the boundary.

### AC-3 — Governance

- Only Tenant Admin / authorized configuration roles can create, modify, or remove a geofence; other roles see read-only values.
- Every change audit-logged: who, when, POI, old → new radius.
- Geofence **deletion (radius removal) requires explicit confirmation** and writes an audit entry; deletion stops new event detection but never deletes historical `GeofenceEvent` records.

### AC-4 — Dwell threshold configuration

- Configurable **dwell time threshold** per POI plus a tenant-level default; same RBAC and audit rules as the radius. Consumed by GPS-04 exception flagging.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| GPS-02-1 | Geofence radius admin | AC-1: radius field + validation on POI admin, one-active rule | High | Not started |
| GPS-02-2 | Immediate-effect verification | AC-2: engine reads live config; boundary-change test | Medium | Not started |
| GPS-02-3 | RBAC, audit & delete confirmation | AC-3: config-role gating, change audit, confirmed deletion | High | Not started |
| GPS-02-4 | Dwell threshold config | AC-4: per-POI threshold + tenant default | Medium | Not started |

---

## Definition of Done

- [ ] Radius configurable per POI with validation and one-active rule (AC-1)
- [ ] Live-trip immediate effect demonstrated (AC-2)
- [ ] All changes audited; deletion confirmed + audited; history preserved (AC-3)
- [ ] Dwell thresholds configurable and readable by GPS-04 (AC-4)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| POI master data | Extends | `lat`/`lng` exist (Sprint 4); radius + threshold fields added here |
| GPS-03 geofence engine | Consumer | Reads radius at evaluation time (AC-2 contract) |
| GPS-04 dwell tracking | Consumer | Reads thresholds (AC-4) |
| Audit framework | Integration | Existing central audit helpers (Sprint 5 pattern) |

---

*Epic: GPS & Maps Dashboard | Phase: 1 | Sprint 6: 1 SP | PRD: §6.5.7 | Jira: DFS-078 | Last Updated: 2026-06-12*
