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
| SC-01-1 | WeighingSession + ScaleIn + ScaleOut models + migration (FK to GateVisitSession, TO; weight fields, discrepancy flags, operator, timestamps) | DFS-055-1 | Pending |
| SC-01-2 | ScaleInAdmin — change form with vehicle number lookup, gate-in validation in `save_model` (rejects if no completed gate-in for session), weight capture fields, discrepancy flag checkboxes | DFS-055-2 | Pending |
| SC-01-3 | ScaleOutAdmin — change form with net weight auto-calculation in `save_model` (loaded − empty), immutability enforcement via `get_readonly_fields` for completed sessions | DFS-055-3 | Pending |
| SC-01-4 | QueueToken model + auto-generation in `ScaleInAdmin.save_model` — unique P.C. code serial, FK to WeighingSession | DFS-055-4 | Pending |
| SC-01-5 | Scale-in REST API (POST) — create scale-in with gate-in prerequisite check, weight capture, returns queue token | DFS-055-5 | Pending |
| SC-01-6 | Scale-in list/detail REST API (GET with filters: date, vehicle, TO number, status) | DFS-055-6 | Pending |
| SC-01-7 | Scale-out REST API (POST) — record remaining weight, auto-calculate net weight, lock records | DFS-055-7 | Pending |
| SC-01-8 | Scale-out detail REST API (GET) — includes net weight, gate pass data | DFS-055-8 | Pending |
| SC-01-9 | Queue token print template — browser print CSS for desk printer (vehicle number, product type, P.C. code serial, weights, TO reference) | DFS-055-9 | Pending |
| SC-01-10 | Gate pass print template — browser print CSS for scale-out (vehicle number, item name, net weight, P.C. code) | DFS-055-10 | Pending |
| SC-01-11 | CC-01 queue feed integration — webhook/signal on scale-in completion to push new queue entry to Command Center | DFS-055-11 | Pending |
| SC-01-12 | Scaling operator UI — scale-in form, scale-out form, session list with status indicators | DFS-055-12 | Pending |
| SC-01-13 | TLS-01 event emission — emit `SCALE_IN` / `SCALE_OUT` timeline events on save | DFS-055-13 | Pending |

## API Endpoints

```
POST   /api/v1/scaling/scale-in                                 # Create scale-in (gate-in prerequisite enforced)
GET    /api/v1/scaling/scale-in?date=&vehicle=&to_number=&status=&search=
GET    /api/v1/scaling/scale-in/{scale_in_id}
POST   /api/v1/scaling/scale-out                                # Create scale-out (net weight auto-calculated, records locked)
GET    /api/v1/scaling/scale-out/{scale_out_id}
GET    /api/v1/scaling/queue-tokens?status=waiting&poi=          # Active queue for CC-01 feed
GET    /api/v1/scaling/queue-tokens/{token_id}/print             # Printable queue token
GET    /api/v1/scaling/scale-out/{scale_out_id}/gate-pass        # Printable gate pass
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| Create scale-in | Scaling Operator |
| Create scale-out | Scaling Operator |
| View scale-in/out list (own POI) | Scaling Operator, Supervisor, Command Center Operator |
| Print queue token | Scaling Operator |
| Print gate pass | Scaling Operator |
| View queue feed (read-only) | Command Center Operator |

- Scaling Operator operates within their assigned POI context
- Scale-out records are immutable after completion; no role can edit locked records

## Dependencies

- **Requires**: GT-01
- **Enables**: CC-01

## Definition of Done

- [ ] WeighingSession, ScaleIn, and ScaleOut models created with all PRD fields (weights, discrepancy flags, operator, timestamps); migration applied cleanly
- [ ] ScaleInAdmin save_model rejects scale-in if no completed gate-in exists for the visit session
- [ ] ScaleOutAdmin save_model auto-calculates net weight (loaded − empty) and locks all weight fields via `get_readonly_fields` after scale-out
- [ ] QueueToken auto-generated on scale-in with unique P.C. code serial; includes vehicle number, product type, and serial
- [ ] Queue token printable via browser print CSS on desk printer
- [ ] Gate pass printable after scale-out with vehicle number, item name, net weight, and P.C. code
- [ ] CC-01 queue feed receives new entry on scale-in completion (webhook or signal)
- [ ] Scale-in and scale-out REST APIs enforce gate-in prerequisite and return correct HTTP status codes
- [ ] Weight records are immutable after scale-out; PATCH/PUT returns 403 on locked sessions
- [ ] `SCALE_IN` / `SCALE_OUT` timeline events emitted to TLS-01 with timestamps
- [ ] Weighing session linked to TO and POI (source vs destination visit)
- [ ] UAT: scale-in → token printed → CC sees vehicle in queue → scale-out → net weight correct → records locked → gate pass printed
- [ ] Unit tests cover immutability enforcement after scale-out and gate-in prerequisite validation
