---
jira_key: DFS-059
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: TLS-01
title: TO Lifecycle — Execution, Yard & Closure Substates (+ Audit)
epic: Lifecycle
status: Pending
story_points: 13
assignee: ~
prd_refs:
  - "§6.8.5 TO Lifecycle Management (Phase 1)"
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) (Phase 1 — closure substates only; POD rules in POD-01)"
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 3 notification deferred; in-app event retained)"
  - "§6.15.4.1 QC Pass/Fail/Auto-Pass Tracking (Phase 1)"
---

# TLS-01 — TO Lifecycle (§6.8.5) — Execution, Yard & Closure

## User Story

**As** Transport operations staff  
**I want** a single, rule-driven **TO** status model with full history  
**So that** gate, scale, command center, driver, and closure handoffs stay consistent **without a separate Trip record**

## Business Context

Sprint 4 extends **§6.8.5** with **execution**, **yard**, and **closure** substates on the **Transport Order** only. Sprint 3 / TO-02 delivers assignment and may set **`Ready for Dispatch`** (TDO); that status makes the TO **driver-visible** (DM-01).

The PRD defines the full TO lifecycle as: **Draft → Planned → Assigned → Dispatched → In Transit – Source → At Source → Loaded / Pickup Completed → In Transit – Destination → At Destination → Delivered / Unloaded → Completed → Closed**. Sprint 3 covers Draft through Dispatched; this story covers **In Transit – Source** onward.

**§6.8.6** (halt / re-delivery management workflow) is **Phase 2** — design transitions so a **Halted** sub-state can be added later without migration pain. Note: the PRD includes `Halted` as a sub-state under In Transit states in Phase 1; Sprint 4 reserves the sub-state value but does not implement the halt trigger or re-delivery flow.

**§6.8.7** closure rules (QC Pass + POD + gate-out → auto-close) are consumed by **POD-01**; this story defines the closure *substates* and *transition hooks* that POD-01 calls.

**§6.8.2** map / live tracking is **not** Sprint 4 backlog; timeline APIs are data-only for mobile and ops views.

## Acceptance Criteria

### AC-1: States & sub-states (per §6.8.5)
- [ ] Model **TO** lifecycle per **§6.8.5** — full state chain with defined sub-states:

| PRD State | Sub-states (per PRD) | Sprint 4 scope |
|---|---|---|
| **Draft** | — | Sprint 3 shipped (TO-01) |
| **Planned** | Fleet Decided, Awaiting Assignment | Sprint 3 shipped (TO-01) |
| **Assigned** | Vehicle Assigned, Driver Assigned, Helper Assigned, Assignment Confirmed | Sprint 3 shipped (TO-02) |
| **Dispatched** | Dispatch Approved, Vehicle Departed | Sprint 3 shipped (TO-02) |
| **In Transit – Source** | En Route to Source, Delayed, Halted | Halted reserved; no trigger in Sprint 4 (§6.8.6 Phase 2) |
| **At Source** | Gate-in Recorded, Scale-in, Waiting / Parked | Yard entry states driven by GT-01, SC-01 |
| **Loaded / Pickup Completed** | Loading Started, Loading Completed, Scale-out, Assigned to Loading Point, Pick-up Confirmed/Gate-out | CC-01 + LD-01 + SC-01 + GT-01 events |
| **In Transit – Destination** | En Route to Destination, Delayed, Halted | Halted reserved; no trigger in Sprint 4 |
| **At Destination** | Gate-in Recorded, Scale-in, Waiting / Parked, Assigned to Unloading Point, Sampling Started, QC Started (Physical Inspection), Lab Analysis In Progress | QC sub-states simplified in Sprint 4 (QC-01: sampling_done + qc_passed only) |
| **Delivered / Unloaded** | Unloading Started, Unloading Completed, Scale-out, POD Submitted, Receiver Confirmation | POD capture via DM-01 |
| **Completed** | QC Passed, QC Failed | QC-01 outcome drives sub-state |
| **Closed** | Closed (QC Pass + POD Uploaded, Gate-out recorded) | Auto-close rule in POD-01; this story provides the transition hook |

- [ ] **One TO = one execution thread** (Phase 1)
- [ ] Include explicit flow-lane mapping in lifecycle rules:
  - FG outbound lane (loading path)
  - FG inbound lane (unloading path)
  - RM inbound lane (unloading + QC checkpoint path)
- [ ] Include raw-material checkpoint states/events for QC-01 (sampling + QC decision; Sprint 4 simplified yes/no outcome only)

### AC-2: Transition rules
- [ ] Enforce valid forward-only graph per PRD: "State Transitions can only occur according to allowed workflow rules (e.g., TO cannot be dispatched before assignment is confirmed)"
- [ ] Cannot enter yard steps before **Ready for Dispatch** (and any policy gates such as DS-01 checklist, if enabled)
- [ ] Rules for gate-in vs driver milestones documented to avoid double truth
- [ ] **§6.8.1.7** Fleet Availability Validation invoked on **first driver execution action** (or agreed alternative — document)

### AC-3: Actors & visibility
- [ ] Per PRD: TP, TDO, and Driver can **view** current TO status and sub-states based on activity completion
- [ ] TP, TDO, Driver (limited), Gate, Scale, Command Center, Load/Unload roles trigger **allowed** transitions only (role-gated)

### AC-4: Audit
- [ ] Every transition stores: from, to, user/service, timestamp, optional payload JSON (per PRD: "System logs all state transitions for audit purposes")
- [ ] Sampling/QC checkpoint events store explicit outcome payload (`sampling_done`, `qc_passed`)

### AC-5: Read APIs
- [ ] **TO timeline** API for driver app and ops views (no map requirement in Sprint 4)
- [ ] Status and sub-state viewable per actor role (TP, TDO, operations staff per §6.8.5 functional requirements)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TLS-01-1 | TOStatus + TOSubState + TOStatusTransitionLog models + migration (status enum, sub_state enum, transition log with from/to/actor/timestamp/payload) | DFS-059-1 | Pending |
| TLS-01-2 | State machine service — code-first rules table defining valid transitions per flow lane (FG outbound, FG inbound, RM inbound) | DFS-059-2 | Pending |
| TLS-01-3 | TOStatusAdmin — Django Admin read-only timeline view showing all transitions for a TO, filterable by TO, status, date range (support/debug) | DFS-059-3 | Pending |
| TLS-01-4 | TOTimelineInline — TabularInline under TransportOrderAdmin showing status transition history | DFS-059-4 | Pending |
| TLS-01-5 | Migration from existing Sprint 3 TO statuses (TO-01/02) to new expanded status + sub-state set | DFS-059-5 | Pending |
| TLS-01-6 | Event ingest service — receives events from GT-01, SC-01, CC-01, LD-01, QC-01, DM-01 and triggers appropriate state transitions | DFS-059-6 | Pending |
| TLS-01-7 | TO timeline REST API (GET) — returns ordered transition history for a TO | DFS-059-7 | Pending |
| TLS-01-8 | TO status/sub-state REST API (GET) — returns current status + sub-state, role-filtered per actor | DFS-059-8 | Pending |
| TLS-01-9 | §6.8.1.7 Fleet Availability Validation service — invoked on first driver execution action to validate fleet readiness | DFS-059-9 | Pending |
| TLS-01-10 | Audit logging service — logs every transition with from/to/user/timestamp/payload; QC events include sampling_done + qc_passed payload | DFS-059-10 | Pending |

## API Endpoints

```
GET    /api/v1/transport-orders/{to_id}/timeline                  # TO transition history (ordered)
GET    /api/v1/transport-orders/{to_id}/status                    # Current status + sub-state (role-filtered)
POST   /api/v1/transport-orders/{to_id}/transitions               # Trigger a state transition (used by event ingest)
GET    /api/v1/transport-orders/{to_id}/transitions/validate      # Dry-run: check if a transition is valid
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View TO timeline (full history) | Transport Planner, TDO, Operations Manager, Support |
| View current TO status + sub-state | Transport Planner, TDO, Driver, Gate Operator, Scale Operator, CC Operator |
| Trigger state transition | System (event ingest), role-gated per transition type |
| View admin debug timeline | Support, Operations Manager |

- TP, TDO, and Driver can view current status and sub-states per §6.8.5
- State transitions are role-gated: only the actor permitted for that transition type can trigger it
- Admin timeline view is read-only for support/debug purposes

## Dependencies

- **Requires**: TO-02 baseline statuses (**Ready for Dispatch** set by TDO in Sprint 3 flow)
- **Blocks**: DM-01, yard chain, QC-01, POD-01

## Definition of Done

- [ ] TOStatus, TOSubState, and TOStatusTransitionLog models store the full lifecycle with from/to/actor/timestamp/payload per transition
- [ ] State machine service enforces forward-only transitions per flow lane (FG outbound, FG inbound, RM inbound)
- [ ] Invalid transition attempt returns a stable error code with descriptive message
- [ ] Halted sub-state value is reserved in the enum but no trigger is implemented (§6.8.6 Phase 2 placeholder)
- [ ] Migration maps existing Sprint 3 TO statuses (TO-01/02) to the new expanded status set without data loss
- [ ] Event ingest service receives events from GT-01, SC-01, CC-01, LD-01, QC-01, DM-01 and triggers the correct transitions
- [ ] §6.8.1.7 Fleet Availability Validation fires on first driver execution action
- [ ] TO timeline API returns ordered transition history; status API returns current status + sub-state filtered by actor role
- [ ] Django Admin TOStatusAdmin shows read-only transition timeline per TO, filterable by TO, status, and date
- [ ] Every transition is audit-logged with from/to/user/timestamp/payload; QC events include sampling_done and qc_passed
- [ ] Golden-path transitions covered by automated tests
- [ ] UAT: operations signs off on state names vs training deck
- [ ] UAT: TP, TDO, and Driver can view current TO status and sub-states (§6.8.5 FR)
