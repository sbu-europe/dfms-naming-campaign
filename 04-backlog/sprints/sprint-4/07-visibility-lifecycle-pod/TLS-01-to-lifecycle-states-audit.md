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
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 1)"
  - "§6.15.4.1 QC Pass/Fail/Auto-Pass Tracking (Phase 1)"
---

# TLS-01 — TO Lifecycle (§6.8.5) — Execution, Yard & Closure

## User Story

**As** Transport operations staff  
**I want** a single, rule-driven **TO** status model with full history  
**So that** gate, scale, command center, driver, and closure handoffs stay consistent **without a separate Trip record**

## Business Context

Sprint 4 extends **§6.8.5** with **execution**, **yard**, and **closure** substates on the **Transport Order** only. Sprint 3 / TO-02 delivers assignment and may set **`Ready for Dispatch`** (TDO); that status makes the TO **driver-visible** (DM-01).

**§6.8.6** (halt / re-delivery) is **Phase 2** — design transitions so a **halt** state can be added later without migration pain.

**§6.8.2** map / live tracking is **not** Sprint 4 backlog; timeline APIs are data-only for mobile and ops views.

## Acceptance Criteria

### AC-1: States & sub-states
- [ ] Model **TO** lifecycle per **§6.8.5**: reconcile with Sprint 3 TO statuses already shipped; add forward-only **execution** (post–Ready for Dispatch), **yard** (gate, scale, queue, load/unload per PRD naming), and **closure** substates in technical design
- [ ] **One TO = one execution thread** (Phase 1)
- [ ] Include raw-material checkpoint states/events for QC-01 (sampling + QC decision; Sprint 4 simplified yes/no outcome only)

### AC-2: Transition rules
- [ ] Enforce valid graph: e.g. cannot enter yard steps before **Ready for Dispatch** (and any policy gates such as DS-01 checklist, if enabled); rules for gate-in vs driver milestones documented to avoid double truth
- [ ] **§6.8.1.7** invoked on **first driver execution action** (or agreed alternative — document)

### AC-3: Actors
- [ ] TP, TDO, Driver (limited), Gate, Scale, Command Center, Load/Unload roles trigger **allowed** transitions only

### AC-4: Audit
- [ ] Every transition stores: from, to, user/service, timestamp, optional payload JSON
- [ ] Sampling/QC checkpoint events store explicit outcome payload (`sampling_done`, `qc_passed`)

### AC-5: Read APIs
- [ ] **TO timeline** API for driver app and ops (no map requirement in Sprint 4)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TLS-01-1 | State machine service (code-first rules table) | DFS-059-1 | Pending |
| TLS-01-2 | Migration from existing TO statuses (TO-01/02) | DFS-059-2 | Pending |
| TLS-01-3 | Event ingest from GT-01, SC-01, CC-01, LD-01, QC-01, DM-01 | DFS-059-3 | Pending |
| TLS-01-4 | Admin/debug timeline UI (internal or support role) | DFS-059-4 | Pending |

## Dependencies

- **Requires**: TO-02 baseline statuses (**Ready for Dispatch** set by TDO in Sprint 3 flow)
- **Blocks**: DM-01, yard chain, QC-01, POD-01

## Definition of Done

- [ ] Golden-path transitions covered by automated tests
- [ ] Invalid transition returns stable error code
- [ ] UAT: operations signs off on state names vs training deck
