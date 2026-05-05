---
jira_key: DFS-057
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: LD-01
title: Loading & Unloading — Start/End Timestamps (E2E)
epic: Command Center
status: Pending
story_points: 5
assignee: ~
prd_refs:
  - "§6.13.1 Loading Monitoring – Load Start/End Date & Time Entry (Phase 1)"
  - "§6.14.1 Unload Monitoring – Unload Start/End Date & Time Entry (Phase 1)"
  - "§6.14.2 QC Trigger on Unloading – Notify QC Department (Phase 1 handoff context)"
---

# LD-01 — Load / Unload Start–End Timestamps

## User Story

**As** Loading or Unloading Personnel  
**I want to** record start and end times, quantities, and seal information  
**So that** **TO** KPIs and PRD closure rules have accurate operational timestamps

## Business Context

**§6.13.2** loading notifications = Phase 3 — excluded. This story is **data capture** at source (load) and destination (unload) for E2E.

For raw-material TOs, this story provides the unloading event context consumed by **QC-01**.  
Sampling/QC decision capture is intentionally kept in a separate story.

## Acceptance Criteria

### AC-1: Loading
- [ ] Operator selects vehicle assigned for loading at a bay
- [ ] Enter **load start** datetime
- [ ] Enter **load end** datetime with: number of bags loaded, weight, seal number
- [ ] Validate end ≥ start; link to **TO**

### AC-2: Unloading
- [ ] Enter **unload start** and **unload end** with bags unloaded + weight
- [ ] Chronological validation; link to **TO**

### AC-3: QC handoff context (raw-material path)
- [ ] After unload event capture, TO has enough context for **QC-01** to run sampling + QC decision
- [ ] Handoff reference (TO/unload event id) is persisted and auditable

### AC-4: TLS / gate integration
- [ ] Events feed TLS-01 sub-states (Loading Started/Completed; Unloading Started/Completed)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| LD-01-1 | Load/unload event APIs | DFS-057-1 | Pending |
| LD-01-2 | Operator UI (web; mobile later) | DFS-057-2 | Pending |
| LD-01-3 | TLS-01 sub-state transitions + QC-01 handoff context | DFS-057-3 | Pending |

## Dependencies

- **Requires**: CC-01 (assignment), TLS-01, **LUP-01**
- **Feeds**: QC-01

## Definition of Done

- [ ] UAT: load start/end captured at source POI; unload at destination for full E2E
- [ ] Data visible on **TO** timeline (TLS-01)
