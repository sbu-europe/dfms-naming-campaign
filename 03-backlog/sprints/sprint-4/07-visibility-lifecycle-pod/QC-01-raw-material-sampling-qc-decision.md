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

**As a** QC Supervisor
**I want to** capture sampling and a simple QC outcome against the TO after Command Center flags it for QC  
**So that** Command Center is unblocked to assign the unloading point only after QC passes, and TO closure enforces a clear quality gate in Sprint 4

## Business Context

This story creates a dedicated Sprint 4 QC checkpoint for the **raw-material** execution thread. The QC Supervisor owns the quality gate between scale-in and unloading assignment:

1. **CC flags for QC** — after scale-in, Command Center flags the RM inbound TO as requiring QC; CC does **not** assign an unloading point at this stage
2. **Sample creation** — QC Supervisor creates a sample record against the TO
3. **QC decision** — Pass or Fail
4. **Unloading gate** — a QC Pass unlocks the TO back in the Command Center queue, where the **CC Officer assigns the unloading point**. QC Supervisor does **not** assign the unloading point.
5. **Resample / revoke during unloading** — QC Supervisor can trigger a resample or change the decision to failed while unloading is in progress, which cancels the active CC-01 unloading assignment

Sprint 4 keeps the model simple:
- no physical-vs-lab branch workflow
- recheck/escalation handled via resample + override flow (AC-4, AC-5)
- no push notification dependency (Phase 3)
- no Auto-pass option

## Acceptance Criteria

### AC-1: Entry condition
- [ ] QC action is available only after Command Center updates the raw-material TO status for QC (CC-01 AC-6 trigger)
- [ ] QC UI/API loads context: TO ref, vehicle, POI from/to, product

### AC-2: Sample creation
- [ ] QC Supervisor can **create a sample** record linked to the TO with:
  - **Physical analysis** input (text/structured field for inspection observations)
  - **Remarks** (free text)
  - Timestamp and sample identifier (auto-generated)
- [ ] System blocks QC decision until at least one sample is created
- [ ] Sample creation event is written to TO timeline (TLS-01)

### AC-3: QC decision
- [ ] QC Supervisor selects **QC final result** from a dropdown: **Pass** or **Fail**
- [ ] Decision requires timestamp; optional remarks
- [ ] On **Pass**, the TO is marked QC-passed and becomes available in the **Command Center queue** for unloading point assignment (CC-01). QC Supervisor does **not** assign the unloading point.
- [ ] On **Fail**, the TO is blocked: Command Center cannot assign an unloading point, unloading cannot start, scale-out is blocked, gate-out is blocked

### AC-4: Resample during unloading
- [ ] While unloading is in progress, QC Supervisor can trigger a **resample** on the TO
- [ ] Resample resets the QC state (clears previous decision) and **cancels the active unloading assignment** in CC-01
- [ ] TO returns to the QC queue; QC Supervisor must create a new sample and record a new decision before unloading can be re-assigned
- [ ] Resample event is written to TO timeline with reason/remarks

### AC-5: QC override to failed during unloading
- [ ] While unloading is in progress, QC Supervisor can change the QC decision to **failed**
- [ ] Changing to failed **cancels the active unloading assignment** in CC-01
- [ ] TO is flagged with `qc_passed = No`; CC cannot re-assign an unloading point until a new sample + pass decision is recorded by QC
- [ ] Override event is written to TO timeline with reason/remarks and previous decision audit

### AC-6: TLS / POD integration
- [ ] All QC events (sample creation, decision, resample, override) are written to TO timeline (TLS-01) with auditable payload
- [ ] POD-01 closure gate reads **latest** QC decision for raw-material TOs: pass allows closure, fail blocks closure

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| QC-01-1 | QCSample + QCDecision models + migration (FK to TO, auto-gen sample_id, physical_analysis, remarks, decision enum Pass/Fail — **no unloading_point FK on QCDecision**) | DFS-064-1 | Pending |
| QC-01-2 | QCSampleAdmin — Django Admin form with readonly TO context (TO ref, vehicle, POI), save_model auto-generates sample ID | DFS-064-2 | Pending |
| QC-01-3 | QCDecisionAdmin — decision form with Pass/Fail dropdown; on Pass, marks TO as QC-passed and makes it available in CC-01 queue for unloading point assignment; no unloading point FK on this form | DFS-064-3 | Pending |
| QC-01-4 | Resample custom admin action — clears previous decision, cancels active CC-01 unloading assignment via service call, returns TO to QC queue | DFS-064-4 | Pending |
| QC-01-5 | Override-to-failed custom admin action — sets decision to Fail, cancels active CC-01 unloading assignment, blocks CC from re-assigning until new QC Pass | DFS-064-5 | Pending |
| QC-01-6 | QC sample creation API (POST) — create sample linked to TO with physical analysis + remarks | DFS-064-6 | Pending |
| QC-01-7 | QC decision API (POST) — record Pass/Fail; on Pass mark TO as qc_passed=True (CC then assigns unloading point) | DFS-064-7 | Pending |
| QC-01-8 | Resample API (POST) — reset QC state, cancel active CC-01 unloading assignment | DFS-064-8 | Pending |
| QC-01-9 | Override API (POST) — change decision to failed, cancel active CC-01 unloading assignment | DFS-064-9 | Pending |
| QC-01-10 | QC capture UI (web/responsive) — sample creation, Pass/Fail decision, resample/override actions | DFS-064-10 | Pending |
| QC-01-11 | CC-01 unloading cancellation integration service — callable from resample and override flows | DFS-064-11 | Pending |
| QC-01-12 | TLS-01 event emission + POD-01 closure gate integration — emit timeline events on all QC actions, expose latest decision for POD-01 | DFS-064-12 | Pending |

## API Endpoints

```
POST   /api/v1/transport-orders/{to_id}/qc/samples                # Create QC sample
GET    /api/v1/transport-orders/{to_id}/qc/samples                # List samples for TO
POST   /api/v1/transport-orders/{to_id}/qc/decision               # Record QC decision (Pass/Fail)
GET    /api/v1/transport-orders/{to_id}/qc/decision               # Get latest QC decision
POST   /api/v1/transport-orders/{to_id}/qc/resample               # Trigger resample (reset + cancel unloading)
POST   /api/v1/transport-orders/{to_id}/qc/override               # Override decision to failed
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| Create QC sample | QC Supervisor, QC Inspector |
| Record QC decision (Pass/Fail) | QC Supervisor |
| Trigger resample during unloading | QC Supervisor |
| Override decision to failed | QC Supervisor |
| Assign unloading point (after QC Pass) | CC Officer (CC-01 — not QC) |
| View QC status for a TO | QC Supervisor, QC Inspector, Transport Planner, TDO, CC Officer |

- QC actions are only available after CC-01 flags the TO for QC
- Decision requires at least one sample record to exist
- QC Supervisor records Pass/Fail only; the unloading point is assigned by the CC Officer in CC-01 after a QC Pass is recorded

## Dependencies

- **Requires**: CC-01, LD-01, TLS-01
- **Blocks**: POD-01 raw-material closure path

## Definition of Done

- [ ] QCSample and QCDecision models store sample data (physical_analysis, remarks, auto-gen sample_id) and decision (Pass/Fail enum); **no unloading_point FK on QCDecision**
- [ ] Django Admin QCSampleAdmin displays readonly TO context and auto-generates sample ID on save
- [ ] Django Admin QCDecisionAdmin records Pass or Fail only; on Pass, TO is marked `qc_passed=True` and the CC-01 queue reflects the TO as ready for unloading point assignment; QCDecisionAdmin does not include an unloading point field
- [ ] On Pass, CC Officer assigns the unloading point in CC-01 (not QC Supervisor)
- [ ] On Fail, CC-01 unloading point assignment is blocked
- [ ] Resample custom action clears previous decision and cancels active CC-01 unloading assignment; TO returns to QC queue
- [ ] Override-to-failed custom action sets decision to Fail and cancels active CC-01 unloading assignment; CC is blocked from re-assigning until a new QC Pass is recorded
- [ ] QC decision API blocks recording a decision until at least one sample exists for the TO
- [ ] All QC events (sample creation, decision, resample, override) are written to TO timeline via TLS-01
- [ ] POD-01 closure gate reads latest QC decision: Pass allows closure, Fail blocks closure
- [ ] UAT: sample → Pass → CC Officer assigns unloading point (not QC Supervisor)
- [ ] UAT: resample or override to Fail during unloading → CC-01 unloading assignment cancelled
- [ ] UAT: Fail blocks TO closure; Pass allows closure
