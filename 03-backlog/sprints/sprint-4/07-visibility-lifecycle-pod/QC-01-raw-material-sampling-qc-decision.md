---
jira_key: DFS-064
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: QC-01
title: Raw-Material QC — Sampling & Pass/Fail Decision
epic: Lifecycle
status: Pending
story_points: 5
assignee: ~
prd_refs:
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 3 notification deferred; in-app trigger retained)"
  - "§6.15.1.2 Sample Creation (Phase 1)"
  - "§6.15.4.1 QC Pass/Fail/Auto-Pass Tracking (Phase 1; Sprint 4 uses Pass/Fail only)"
  - "§7.1.9 Gate, Weighing, Command Center & QC Operations"
  - "§7.1.10 Quality Control (QC) Workflow"
---

# QC-01 — Raw-Material QC — Sampling & Pass/Fail Decision

## User Story

**As a** QC Supervisor / Inspector  
**I want to** capture sampling and a simple QC outcome against the TO after unloading assignment  
**So that** TO closure can enforce a clear quality gate in Sprint 4

## Business Context

This story creates a dedicated Sprint 4 QC checkpoint for **raw-material** execution thread:
- sampling recorded (`sampling_done`)
- QC result recorded (`qc_passed = Yes/No`)

To keep Sprint 4 delivery simple and aligned with locked scope:
- no physical-vs-lab branch workflow
- no recheck/escalation chain
- no push notification dependency (Phase 3)

QC context is fetched from TO/unloading references and must be visible before saving QC action.

## Acceptance Criteria

### AC-1: Entry condition
- [ ] QC action is available only after unloading assignment/event context exists for the TO (CC-01 + LD-01 path)
- [ ] QC UI/API loads context: TO ref, vehicle, POI from/to, product, unload reference

### AC-2: Sampling capture
- [ ] User can record sampling checkpoint (`sampling_done = yes`) with timestamp and remarks
- [ ] System blocks QC decision when sampling is not recorded

### AC-3: QC decision (simplified)
- [ ] User records `qc_passed` as **Yes** or **No** only
- [ ] QC decision requires timestamp and optional remarks
- [ ] No Auto-pass option in Sprint 4 implementation scope

### AC-4: TLS / POD integration
- [ ] QC events are written to TO timeline (TLS-01) with auditable payload
- [ ] POD-01 closure gate reads QC decision for raw-material TOs: pass allows closure, fail blocks closure

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| QC-01-1 | QC checkpoint APIs (context fetch + sampling + decision) | DFS-064-1 | Pending |
| QC-01-2 | QC capture UI (web/responsive) | DFS-064-2 | Pending |
| QC-01-3 | TLS-01 event emit + POD-01 closure gate integration | DFS-064-3 | Pending |

## Dependencies

- **Requires**: CC-01, LD-01, TLS-01
- **Blocks**: POD-01 raw-material closure path

## Definition of Done

- [ ] UAT: raw-material TO shows sampling record and QC pass/fail on timeline
- [ ] UAT: `qc_passed = no` blocks closure; `qc_passed = yes` allows closure (with POD/gate-out conditions)
- [ ] Audit includes actor, timestamp, and decision payload
