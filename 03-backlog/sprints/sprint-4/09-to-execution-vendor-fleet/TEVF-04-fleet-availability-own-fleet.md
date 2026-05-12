---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Fleet Availability Validation (Own Fleet)"
version: "1.0"
phase: "Phase 1"
status: Draft
aligned_stories:
  - ../01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md
  - ../01-driver-supervisor/DS-02-driver-state-attendance-leave.md
  - ../03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md
  - ../07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md
related_own_fleet: "TO Execution – Own Fleet; fleet availability hook (Sprint 4 README)"
last_updated: 2026-05-12
---

# TEVF-04 — Fleet Availability Validation — Own Fleet

## User story

**As a** Transport Planner  
**I want** the system to **validate fleet availability**  
**So that** only **eligible** vehicles are assigned to TOs

## Business context

This document describes **real-time vehicle status** checks for **own fleet**. It aligns with the Sprint 4 narrative for **own-fleet fleet availability validation** on **internal** vehicles (see [Sprint 4 README](../README.md): hook on assignment or first driver execution action unless design moves earlier).

**Vendor fleet** does not use this master-vehicle eligibility matrix in Phase 1 the same way (vendors capture vehicle at confirmation — VM-08); do not conflate vendor **offered vehicle count** in bidding with **owned fleet** MDM status.

## Acceptance criteria — vehicle statuses (system checks)

The system SHALL evaluate vehicle operational status including at least:

| Status | Assignable for new TO? (target) |
|--------|----------------------------------|
| **Available** | Yes |
| **Active – On the Way (Laden / Empty)** | No |
| **Active – Waiting to Load** | No |
| **Active – Waiting to Unload** | No |
| **Idle** | No (unless product defines Idle as assignable — **default: no**) |
| **Scheduled / Parked** | No |
| **Under Maintenance** | No |

- [ ] **Only vehicles in an assignable state (default: Available)** appear in **assignment** pickers for own fleet.
- [ ] Status transitions feed from **supervisor / yard / driver / TLS** work packages ([DS-01](../01-driver-supervisor/DS-01-vehicle-licence-health-handover-checklists.md), [DS-02](../01-driver-supervisor/DS-02-driver-state-attendance-leave.md), [DM-01](../03-driver-mobile-interface/DM-01-driver-mobile-interface-to-list-milestones-pod.md), [TLS-01](../07-visibility-lifecycle-pod/TLS-01-to-lifecycle-execution-yard-closure.md)).

## Functional requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System **SHALL** enforce availability rules so **ineligible** vehicles are **not** assignable to TOs (own fleet). |

## Notes

- Exact **status enum** mapping to database fields is an implementation task; this document captures **business-visible states** from the product definition for own-fleet availability.
- **TDO – Vendor Fleet** path (TEVF-01 / TEVF-02) uses vendor-supplied assets; **TEVF-04** applies to **tenant-owned / managed fleet** selection UX.
