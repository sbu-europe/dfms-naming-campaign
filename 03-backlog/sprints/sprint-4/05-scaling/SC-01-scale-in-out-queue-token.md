---
jira_key: DFS-055
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: SC-01
title: Scaling — Scale-In, Queue Token (P.C. Code) & Scale-Out
epic: Scaling / Weighing
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.11.1 Scale-In (Weight Entry) (Phase 1)"
  - "§6.11.2 Queue Token Generation (Phase 1)"
  - "§6.11.3 Scale-Out (Weight Exit) (Phase 1)"
---

# SC-01 — Scale-In, Queue Token & Scale-Out

## User Story

**As a** Scaling Operator  
**I want to** record loaded vehicle weight and empty vehicle weight, have the system auto-calculate net weight, issue a queue token, and complete scale-out with printable gate pass data  
**So that** command center and loading teams can manage vehicles in FIFO order with traceable weights

## Business Context

Implements §6.11.1–§6.11.3. Scale-in **after** gate-in. Weight entries **immutable after scale-out** (per PRD). Operator inputs **loaded vehicle weight** and **empty vehicle weight**; system auto-calculates **net weight** = loaded weight − empty vehicle weight.
Supports both outbound and inbound TO visits (FG outbound loading lane, FG inbound unloading lane, RM inbound unloading lane).

## Acceptance Criteria

### AC-1: Scale-in
- [ ] Requires vehicle number; must follow completed **gate-in** for same visit session
- [ ] Captures: weight ID, material name/code, challan number, scale-in datetime, operator ID, timestamp
- [ ] Records **empty vehicle weight** if vehicle arrives empty, or **loaded vehicle weight** if vehicle arrives loaded
- [ ] Optional discrepancy flags (wrong quantity / driver mismatch) per PRD

### AC-2: Command Center notification
- [ ] On scale-in completion, Command Center queue receives new entry; queue SHALL refresh automatically (websocket / polling)

### AC-3: Queue token (P.C. code)
- [ ] System generates **unique** waiting queue token after scale-in; printable format for desk printer (browser print CSS acceptable for MVP)
- [ ] Token SHALL include: **Vehicle Number**, **Product Type** (RM or FG), **P.C. code serial number**
- [ ] Each queue entry SHALL display:
  - Vehicle Number
  - P.C. Code (Waiting Code) — ⚠️ **Needs clarification from client on P.C. Code format**
  - Item (Product Type – FG / RM)
  - Scale-in Date & Time
  - Loaded Vehicle Weight
  - Empty Vehicle Weight
  - TO / Challan Reference
- [ ] Queue SHALL refresh automatically without manual reload

### AC-4: Scale-out
- [ ] Records the remaining weight: **loaded vehicle weight** if vehicle was empty at scale-in, or **empty vehicle weight** if vehicle was loaded at scale-in
- [ ] System auto-calculates **net weight** = loaded vehicle weight − empty vehicle weight once both weights are available
- [ ] Generates **printable gate pass** including vehicle number, item name, net weight, P.C. code (per PRD §6.11.3)
- [ ] After scale-out, scale-in row **locked** from edits

### AC-5: TO linkage
- [ ] Weighing session linked to **TO** and POI (source vs destination visit)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| SC-01-1 | Weighing visit session model (gate-in → scale-in → scale-out) | DFS-055-1 | Pending |
| SC-01-2 | Scale-in / scale-out APIs + immutability rules | DFS-055-2 | Pending |
| SC-01-3 | P.C. code generator + print template | DFS-055-3 | Pending |
| SC-01-4 | Scaling operator UI | DFS-055-4 | Pending |
| SC-01-5 | CC-01 queue feed integration | DFS-055-5 | Pending |

## Dependencies

- **Requires**: GT-01
- **Enables**: CC-01

## Definition of Done

- [ ] UAT: scale-in → token printed → CC sees vehicle → scale-out net weight (loaded − empty) correct → records locked
- [ ] Tests for immutability after scale-out
