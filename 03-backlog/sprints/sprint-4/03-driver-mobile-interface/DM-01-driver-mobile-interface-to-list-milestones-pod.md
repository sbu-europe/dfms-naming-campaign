---
jira_key: DFS-053
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DM-01
title: Driver Mobile — TO List, Execution Milestones & POD
epic: Driver Mobile
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.16.1.1 Trip Management (Trip Assignment & Navigation) (Phase 1)"
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) — driver confirms delivery in app"
  - "§6.8.1.7 Fleet Availability Validation (Own Fleet) (Phase 1 — enforced on execution start)"
  - "Mobile Interface Requirements — Driver Mobile Interface (Technical)"
---

# DM-01 — Driver Mobile — TO List, Milestones & POD

## User Story

**As a** Driver  
**I want to** see **my assigned TOs** (once TDO sets **Ready for Dispatch**), record execution milestones, and capture POD  
**So that** operations have traceable execution evidence against the **TO** created in Sprint 3

## Business Context

Implements **§6.16.1.1** (Phase 1) **without** map, external navigation, or background GPS in **this sprint backlog** (explicitly deferred — see Sprint 4 README). **Mobile Interface Requirements** still apply where relevant: offline-safe **read** of assigned TO detail; photo compression for POD.

**§6.8.1.7**: re-validate vehicle/driver availability on **first driver execution action** (e.g. "execution started"), unless tech design chooses an earlier enforcement point coordinated with TLS-01.

**Out of Sprint 4 scope for DM-01:** fuel entry (**§6.6.2.x** Phase 2); **live map / turn-by-turn / background location**.

## Acceptance Criteria

### AC-1: TO list & detail
- [ ] Driver sees **only TOs assigned to them** with status **`Ready for Dispatch`** or downstream execution states (**TLS-01 / §6.8.5** naming)
- [ ] Detail shows: TO reference, pickup POI, drop POI, product type, quantity, urgency, special instructions (**from TO**)

### AC-2: Execution milestones
- [ ] Driver can record allowed milestones when **§6.8.5** / TLS-01 permits (e.g. execution started, arrived at source, arrived at destination — exact set reconciled with yard events; prefer **gate/scale as source of truth** for yard-bound arrivals when integrated)
- [ ] Milestone PATCH fails with stable error when **§6.8.1.7** fails (vehicle unavailable, driver on leave, vehicle under maintenance, etc.)

### AC-3: POD capture
- [ ] Driver submits **POD** with **photo** (optional signature if product confirms) **linked to the TO**

### AC-4: Technical NFRs (Sprint 4)
- [ ] Photo auto-compress before upload
- [ ] No map deep links, no continuous/background GPS in Sprint 4 deliverables

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DM-01-1 | `ProofOfDelivery` model + migration — FK to TO, photo (ImageField), optional signature, `submitted_by`, `submitted_at` | DFS-053-1 | Pending |
| DM-01-2 | `ExecutionMilestone` model + migration — FK to TO, `milestone_type` enum, `recorded_at`, `recorded_by`; reconcile with TLS-01 milestone set | DFS-053-2 | Pending |
| DM-01-3 | `ProofOfDeliveryAdmin` — read-only `list_display` (TO ref, driver, submitted_at), photo preview in change form; for support/debug | DFS-053-3 | Pending |
| DM-01-4 | `ExecutionMilestoneAdmin` — read-only `list_display`, `list_filter` (TO, milestone_type), search by TO number; for support/debug | DFS-053-4 | Pending |
| DM-01-5 | Driver TO list API — `GET /api/v1/driver/transport-orders` scoped to authenticated driver, status `Ready for Dispatch` + downstream | DFS-053-5 | Pending |
| DM-01-6 | Driver TO detail API — `GET /api/v1/driver/transport-orders/{to_id}` (pickup/drop POI, product, qty, urgency, instructions) | DFS-053-6 | Pending |
| DM-01-7 | Milestone record API — `PATCH /api/v1/driver/transport-orders/{to_id}/milestones` + §6.8.1.7 fleet availability validation | DFS-053-7 | Pending |
| DM-01-8 | POD upload API — `POST /api/v1/driver/transport-orders/{to_id}/pod` + media storage config (S3/local) | DFS-053-8 | Pending |
| DM-01-9 | §6.8.1.7 fleet availability validation service — re-validate vehicle + driver availability on first execution action | DFS-053-9 | Pending |
| DM-01-10 | Photo compression utility — auto-compress images before storage (max dimension + file size) | DFS-053-10 | Pending |
| DM-01-11 | Mobile/responsive UI — TO list, TO detail, milestone recording, POD capture form with camera/gallery | DFS-053-11 | Pending |
| DM-01-12 | Audit logging on milestone recordings and POD submissions | DFS-053-12 | Pending |

## API Endpoints

```
GET    /api/v1/driver/transport-orders                          # Driver's assigned TOs (Ready for Dispatch + downstream)
GET    /api/v1/driver/transport-orders/{to_id}                  # TO detail (pickup/drop POI, product, qty, instructions)
PATCH  /api/v1/driver/transport-orders/{to_id}/milestones       # Record execution milestone (type + timestamp)
GET    /api/v1/driver/transport-orders/{to_id}/milestones       # List milestones for a TO
POST   /api/v1/driver/transport-orders/{to_id}/pod              # Submit POD (photo upload, optional signature)
GET    /api/v1/driver/transport-orders/{to_id}/pod              # Retrieve POD detail (photo URL, timestamp)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View own assigned TOs | Driver |
| Record execution milestone | Driver |
| Submit POD | Driver |
| View POD / milestones (read-only, all TOs) | Driver Supervisor, TDO, Dispatch Manager |
| View POD / milestones in Django Admin | Support / Admin (read-only) |

## Dependencies

- **Requires**: TO-02 (assignment + TDO may set **Ready for Dispatch**), **TLS-01**
- **Parallel**: GT-01, SC-01 (yard may authoritatively set "at source" — document single source of truth)

## Definition of Done

- [ ] **POD model**: `ProofOfDelivery` stores photo, optional signature, FK to TO, `submitted_by`, `submitted_at` — migration applied cleanly
- [ ] **Milestone model**: `ExecutionMilestone` stores `milestone_type`, `recorded_at`, `recorded_by`, FK to TO — types reconciled with TLS-01
- [ ] **Driver TO list API**: returns only TOs assigned to authenticated driver with status `Ready for Dispatch` or downstream; returns 404 for non-owned TOs
- [ ] **TO detail API**: returns TO reference, pickup POI, drop POI, product type, quantity, urgency, special instructions
- [ ] **Milestone validation**: PATCH rejects with descriptive error when §6.8.1.7 fails (vehicle unavailable, driver on leave, vehicle under maintenance)
- [ ] **Milestone sequence enforced**: invalid milestone order rejected (e.g. cannot record "arrived at destination" before "execution started")
- [ ] **POD upload works**: compressed photo stored in configured media storage; optional signature accepted; linked to TO
- [ ] **Photo compression**: images auto-compressed before storage — max dimension and file size enforced by compression utility
- [ ] **Admin read-only views**: `ProofOfDeliveryAdmin` and `ExecutionMilestoneAdmin` provide read-only list + detail for support/debug; photo preview in POD change form
- [ ] **Security**: driver cannot access other drivers' TOs — API returns 404 for non-owned TOs; verified by automated tests
- [ ] **No GPS/map**: no map deep links, no continuous/background GPS in Sprint 4 deliverables
- [ ] **Audit trail**: every milestone recording and POD submission logged with user, timestamp, TO reference
- [ ] **Unit tests**: API authorization, §6.8.1.7 validation, milestone sequence enforcement, photo compression
- [ ] **UAT**: driver opens TO list → selects TO → records milestones in sequence → submits POD with photo → POD visible on TO timeline
