---
jira_key: DFS-055
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: SC-01
title: Scaling — Scale-In, P.C. Code Capture & Scale-Out
epic: Scaling / Weighing
status: In Progress
story_points: 8
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.11.1 Scale-In (Weight Entry) (Phase 1)"
  - "§6.11.2 Queue / Waiting Code (Phase 1)"
  - "§6.11.3 Scale-Out (Weight Exit) (Phase 1)"
---

# SC-01 — Scale-In, P.C. Code & Scale-Out

## User Story

**As a** Scaling Operator  
**I want to** enter the physical **P.C. code** at scale-in, record loaded and empty vehicle weights, have the system auto-calculate net weight, and complete scale-out with printable gate pass data  
**So that** command center and loading teams can queue vehicles using the same waiting code printed or issued at the yard, with traceable weights

## Business Context

Implements §6.11.1–§6.11.3. Scale-in **after** gate-in. Weight entries **immutable after scale-out** (per PRD). The **P.C. code is supplied by the operator** at scale-in (from the physical waiting slip or yard issue) — the system **does not generate** P.C. codes or serial numbers. Operator inputs **loaded vehicle weight** and **empty vehicle weight** at the two weigh steps; system auto-calculates **net weight** = loaded weight − empty vehicle weight.

Supports outbound and inbound TO visits by `yard_leg` (FG outbound source + destination legs, FG inbound and RM inbound at destination). See [scaling-operations-sprint4.md](../../../05-modules/06-poi-operations/scaling-operations-sprint4.md) §2.

## Acceptance Criteria

### AC-1: Scale-in
- [ ] Requires vehicle number; must follow completed **gate-in** for same visit session
- [ ] **P.C. code** — optional text field on scale-in; when provided: trimmed; max length per spec; **unique at POI** among active queue tokens (`waiting` / `assigned`)
- [ ] Captures: weight ID, material name/code, challan number, scale-in datetime, operator ID, timestamp
- [x] Records **empty vehicle weight** if vehicle arrives empty, or **loaded vehicle weight** if vehicle arrives loaded
- [ ] Optional discrepancy flags (wrong quantity / driver mismatch) per PRD

### AC-2: Command Center notification
- [x] On scale-in completion, Command Center queue receives new entry (linked to `pc_code` when provided); operator refreshes the queue manually (no websocket / polling auto-refresh in MVP)

### AC-3: P.C. code (waiting code) — operator input, not system-generated
- [x] Operator **enters** P.C. code on scale-in; system validates and persists on `ScaleIn` and `QueueToken`
- [x] **No** auto-generated `PC-{POI}-{date}-{seq}` or similar serial logic
- [x] Printable slip after scale-in (browser print CSS acceptable for MVP) **reprints** the entered code plus visit summary
- [ ] Slip / CC queue entry SHALL include: **Vehicle Number**, **Product Type** (RM or FG), **P.C. code** (as entered)
- [ ] Each queue entry SHALL display:
  - Vehicle Number
  - P.C. Code (Waiting Code)
  - Item (Product Type – FG / RM)
  - Scale-in Date & Time
  - Loaded Vehicle Weight (scale-in gross)
  - Empty Vehicle Weight (scale-out tare, when available)
  - TO / Challan Reference
- [x] Queue updates on manual reload or navigation (no automatic refresh in MVP)

### AC-4: Scale-out
- [x] Records the remaining weight: **loaded vehicle weight** if vehicle was empty at scale-in, or **empty vehicle weight** if vehicle was loaded at scale-in
- [x] System auto-calculates **net weight** = loaded vehicle weight − empty vehicle weight once both weights are available
- [x] Generates **printable gate pass** including vehicle number, item name, net weight, **P.C. code** (from scale-in)
- [x] After scale-out, scale-in row **locked** from edits (including P.C. code)

### AC-5: TO linkage
- [x] Weighing session linked to **TO** and POI (`yard_leg` = source vs destination visit)

### AC-6: Operator site and command center handoff (YARD-01)
- [x] Scaling operator only sees vehicles at **their assigned site**; if unassigned, sees an empty list and guidance to contact admin
- [x] When scale-in completes, the vehicle **always** appears on the command center queue at that site in the same action — if scale-in fails, the vehicle does not appear on the queue

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| SC-01-1 | WeighingSession + ScaleIn (`pc_code`) + ScaleOut + QueueToken models + migration | DFS-055-1 | Done |
| SC-01-2 | Scale-in screen — P.C. code field, vehicle lookup limited to operator’s site; `validate_pc_code` in service | DFS-055-2 | Done |
| SC-01-3 | ScaleOutAdmin — net weight auto-calculation, immutability via `get_readonly_fields` | DFS-055-3 | Done |
| SC-01-4 | QueueToken created in `ScaleInService` with operator `pc_code` (read-only QueueTokenAdmin + print) | DFS-055-4 | Done |
| SC-01-5 | Scale-in REST API (POST) — body includes `pc_code`; gate-in + leg eligibility; returns queue token | DFS-055-5 | Partial |
| SC-01-6 | Scale-in list/detail REST API (GET with filters: date, vehicle, TO number, pc_code, status) | DFS-055-6 | Not done |
| SC-01-7 | Scale-out REST API (POST) — record remaining weight, auto-calculate net weight, lock records | DFS-055-7 | Done |
| SC-01-8 | Scale-out detail REST API (GET) — includes net weight, gate pass data | DFS-055-8 | Partial |
| SC-01-9 | Queue token print template — entered P.C. code, vehicle, product type, weights, TO reference | DFS-055-9 | Pending |
| SC-01-10 | Gate pass print template — vehicle, item name, net weight, P.C. code from scale-in | DFS-055-10 | Done |
| SC-01-11 | Command center queue updated in the same step as scale-in (no separate background step that can fail silently) | DFS-055-11 | Done |
| SC-01-12 | Scaling operator UI — scale-in form (with P.C. code), scale-out form, session list with status indicators | DFS-055-12 | Done |
| SC-01-13 | TLS-01 event emission — emit `SCALE_IN` / `SCALE_OUT` with leg-specific sub-states | DFS-055-13 | Done |

## API Endpoints

```
POST   /api/v1/scaling/scale-in                                 # Body includes pc_code; gate-in prerequisite enforced
GET    /api/v1/scaling/scale-in?date=&vehicle=&to_number=&pc_code=&status=&search=
GET    /api/v1/scaling/scale-in/{scale_in_id}
POST   /api/v1/scaling/scale-out                                # Create scale-out (net weight auto-calculated, records locked)
GET    /api/v1/scaling/scale-out/{scale_out_id}
GET    /api/v1/scaling/queue-tokens?status=waiting&poi=          # Active queue for CC-01 feed (pc_code column)
GET    /api/v1/scaling/queue-tokens/{token_id}/print             # Printable slip (entered P.C. code)
GET    /api/v1/scaling/scale-out/{scale_out_id}/gate-pass        # Printable gate pass
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| Create scale-in (enter P.C. code) | Scaling Operator |
| Create scale-out | Scaling Operator |
| View scale-in/out list (own POI) | Scaling Operator, Supervisor, Command Center Operator |
| Print queue slip | Scaling Operator |
| Print gate pass | Scaling Operator |
| View queue feed (read-only) | Command Center Operator |

- Scaling Operator operates within their assigned POI context
- Scale-out records are immutable after completion; no role can edit locked records
- P.C. code cannot be changed after scale-in is saved

## Dependencies

- **Requires**: GT-01, **YARD-01**
- **Enables**: CC-01

## Definition of Done

- [x] WeighingSession, ScaleIn (`pc_code`), and ScaleOut models created with all PRD fields; migration applied cleanly
- [ ] ScaleInAdmin accepts optional `pc_code` on create; when provided, rejects duplicate active P.C. code at same POI
- [x] ScaleOutAdmin save_model auto-calculates net weight (loaded − empty) and locks all fields via `get_readonly_fields` after scale-out
- [x] QueueToken created on scale-in with operator-entered `pc_code` (not auto-generated)
- [x] Queue slip printable via browser print CSS; shows entered P.C. code
- [x] Gate pass printable after scale-out with vehicle number, item name, net weight, and P.C. code from scale-in
- [x] Command center queue updated together with scale-in; failure on either step rolls back both (AC-6)
- [x] Scaling operator without site assignment sees no vehicles from other depots (AC-6)
- [ ] Scale-in and scale-out REST APIs enforce gate-in prerequisite and return correct HTTP status codes (409 on duplicate P.C. code at POI)
- [ ] Weight records and P.C. code immutable after scale-out; PATCH/PUT returns 403 on locked sessions
- [ ] `SCALE_IN` / `SCALE_OUT` timeline events emitted to TLS-01 with timestamps and `yard_leg`
- [x] Weighing session linked to TO and POI (`yard_leg` on visit)
- [ ] UAT: scale-in with entered P.C. code → slip printed → CC sees vehicle in queue → scale-out → net weight correct → records locked → gate pass printed
- [ ] Unit tests cover P.C. code validation (optional; duplicate at POI when provided), immutability after scale-out, and gate-in prerequisite validation
