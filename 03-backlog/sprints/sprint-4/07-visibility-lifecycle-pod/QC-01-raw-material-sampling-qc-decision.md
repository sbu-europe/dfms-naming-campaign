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
**I want to** capture sampling and a simple QC outcome against the TO after Command Center flags it for QC  
**So that** unloading point assignment is gated on QC pass and TO closure enforces a clear quality gate in Sprint 4

## Business Context

This story creates a dedicated Sprint 4 QC checkpoint for the **raw-material** execution thread. The QC Supervisor owns the quality gate between scale-in and unloading:

1. **Sample creation** — QC Supervisor creates a sample record against the TO
2. **QC decision** — Pass or Fail
3. **Unloading gate** — only a passed QC unlocks unloading point assignment in CC-01
4. **Resample / revoke during unloading** — QC Supervisor can trigger a resample or change the decision to failed while unloading is in progress, which cancels the active unloading assignment

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
- [ ] On **Pass**, QC Supervisor assigns the **unloading point** directly for the TO (no handoff back to CC-01)
- [ ] On **Fail**, unloading point assignment remains blocked

### AC-4: Resample during unloading
- [ ] While unloading is in progress, QC Supervisor can trigger a **resample** on the TO
- [ ] Resample resets the QC state (clears previous decision) and **cancels the active unloading assignment** in CC-01
- [ ] TO returns to the QC queue; QC Supervisor must create a new sample and record a new decision before unloading can be re-assigned
- [ ] Resample event is written to TO timeline with reason/remarks

### AC-5: QC override to failed during unloading
- [ ] Whidle unloading is in progress, QC Supervisor can change the QC decision to **failed**
- [ ] Changing to failed **cancels the active unloading assignment** in CC-01
- [ ] TO is flagged with `qc_passed = No`; unloading point re-assignment is blocked until a new sample + pass decision is recorded
- [ ] Override event is written to TO timeline with reason/remarks and previous decision audit

### AC-6: TLS / POD integration
- [ ] All QC events (sample creation, decision, resample, override) are written to TO timeline (TLS-01) with auditable payload
- [ ] POD-01 closure gate reads **latest** QC decision for raw-material TOs: pass allows closure, fail blocks closure

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| QC-01-1 | QC sample + decision APIs (create sample, record decision, resample, override) | DFS-064-1 | Pending |
| QC-01-2 | QC capture UI (web/responsive) — sample creation, decision, resample/override actions | DFS-064-2 | Pending |
| QC-01-3 | Resample/override → cancel unloading assignment integration with CC-01 | DFS-064-3 | Pending |
| QC-01-4 | TLS-01 event emit + POD-01 closure gate integration | DFS-064-4 | Pending |
d
## Dependencies

- **Requires**: CC-01, LD-01, TLS-01
- **Blocks**: POD-01 raw-material closure path

## Definition of Done

- [ ] UAT: sample → pass → QC Supervisor assigns unloading point
- [ ] UAT: resample or override to fail during unloading → unloading cancelled
- [ ] UAT: fail blocks TO closure; pass allows closure
- [ ] Audit trail on all QC events in TO timeline
