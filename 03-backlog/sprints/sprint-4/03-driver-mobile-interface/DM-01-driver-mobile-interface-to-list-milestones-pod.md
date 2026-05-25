---
jira_key: DFS-053
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DM-01
title: Driver Mobile — TO List, Execution Milestones & POD
epic: Driver Mobile
status: In Progress
story_points: 8
assignee: Farhan Tanvir(farhanT23)
prd_refs:
  - "§6.16.1.1 Trip Management (Trip Assignment & Navigation) (Phase 1)"
  - "§6.8.7 Trip Closure & Proof of Delivery (POD) — driver confirms delivery in app"
  - "§6.8.1.7 Fleet Availability Validation (Own Fleet) (Phase 1 — enforced on execution start)"
  - "§6.8.5 TO Lifecycle Management (Phase 1 — driver-triggered transitions post-Dispatch)"
  - "Mobile Interface Requirements — Driver Mobile Interface (Technical)"
---

# DM-01 — Driver Mobile — TO List, Milestones & POD

## User Story

**As a** Driver  
**I want to** see **my assigned TOs** once they are **Ready for Dispatch**, advance execution only after **Driver Supervisor** has **Dispatched** the TO (per **DS-01** / TLS-01), record **TLS-01** lifecycle transitions along the **flow lane** for the TO (FG outbound vs raw-material inbound), and upload POD when the TO reaches **Completed**  
**So that** operations have traceable execution evidence against the **TO** created in Sprint 3, with a clear handoff from supervisor dispatch to field execution

## Business Context

Implements **§6.16.1.1** (Phase 1) **without** map, external navigation, or background GPS in **this sprint backlog** (explicitly deferred — see Sprint 4 README). **Mobile Interface Requirements** still apply where relevant: offline-safe **read** of assigned TO detail; photo compression for POD image uploads.

### Visibility vs execution (dispatch gate)

| Phase | TO status (TLS-01) | Driver can… |
|-------|-------------------|-------------|
| TDO has assigned resources | **Ready for Dispatch** | **View** TO in list and detail (read-only execution actions) |
| Driver Supervisor completes **DS-01** (skip inspection or checklist → dispatch) | **Dispatched** | **Begin** driver-allowed lifecycle transitions (see below) |
| Execution through delivery | Lane-dependent (see below) → **Delivered / Unloaded** | Record next allowed transition per TLS-01 state machine |
| Delivery complete (ops/QC path) | **Completed** | **Upload POD** (up to three files) |
| Closure | **Closed** | Read-only (POD already submitted if required) |

Sprint 3 / **TO-02** delivers assignment and **Ready for Dispatch** (TDO). **DS-01** moves the TO to **Dispatched**. **TLS-01** owns the canonical status names and transition graph; the **driver-visible path depends on flow lane** (product type / TO lane on the TO):

| Flow lane | Driver path after **Dispatched** (driver-triggered PRD states) |
|-----------|------------------------------------------------------------------|
| **FG outbound** | **In Transit – Source** → **At Source** → **Loaded / Pickup Completed** → **In Transit – Destination** → **At Destination** → **Delivered / Unloaded** |
| **FG inbound** | **In Transit – Destination** → **At Destination** → **Delivered / Unloaded** (no source-side loading path — inbound delivery to mill/warehouse) |
| **RM inbound** (raw materials) | **In Transit – Destination** → **At Destination** → **Delivered / Unloaded** (driver **skips** **In Transit – Source**, **At Source**, and **Loaded / Pickup Completed**; supplier/port pickup is outside this lane’s driver steps) |

Common tail for all lanes: **… → Completed → Closed** (POD at **Completed** per AC-3).

The driver app does **not** invent statuses; each driver action maps to an **allowed TLS-01 transition** for the TO’s resolved flow lane. The detail API returns **`flow_lane`** and **`allowed_next_transitions`** so the UI only offers valid next statuses (e.g. RM inbound never shows **At Source**). Yard-integrated steps (gate-in, scale, loading/unloading point, QC) may be set authoritatively by **GT-01**, **SC-01**, **CC-01**, **LD-01**, **QC-01** — document single source of truth per transition in TLS-01; driver actions apply only where TLS-01 permits a **Driver** actor.

**§6.8.1.7**: re-validate vehicle/driver availability on **first driver execution transition** after **Dispatched** (e.g. **In Transit – Source** for FG outbound, or **In Transit – Destination** for RM/FG inbound), unless tech design chooses an earlier enforcement point coordinated with TLS-01.

**POD timing**: Driver may upload POD only when the TO is in **Completed** (not before). Closure substates and auto-close rules remain in **POD-01** / TLS-01; DM-01 delivers capture and storage.

**Out of Sprint 4 scope for DM-01:** fuel entry (**§6.6.2.x** Phase 2); **live map / turn-by-turn / background location**.

## Acceptance Criteria

### AC-1: TO list & detail (assigned, Ready for Dispatch onward)
- [ ] Driver sees **only TOs assigned to them** with status **`Ready for Dispatch`** or any **downstream** TLS-01 execution state through **Closed**
- [x] TOs in **`Ready for Dispatch`** appear in the driver list/detail as **awaiting supervisor dispatch** — execution transition controls are **disabled** with clear messaging (e.g. “Awaiting dispatch by supervisor”)
- [x] After **DS-01** sets the TO to **`Dispatched`**, the driver sees the TO as **ready to start execution** and enabled actions per AC-2
- [ ] Detail shows: TO reference, **flow lane** (FG outbound / FG inbound / RM inbound), current status + sub-state (TLS-01), pickup POI, drop POI, product type, quantity, urgency, special instructions (**from TO**)

### AC-2: Execution status transitions (post-Dispatch, TLS-01, lane-aware)
- [x] Driver **cannot** trigger TLS-01 transitions while status is **`Ready for Dispatch`**; attempts return a stable error referencing the dispatch gate
- [ ] Driver **can** trigger **only** TLS-01 transitions where the actor is **Driver** and the TO is **`Dispatched`** or later, per **flow lane** (reconciled in TLS-01):
  - **FG outbound**: full source leg then destination leg — **In Transit – Source** → **At Source** → **Loaded / Pickup Completed** → **In Transit – Destination** → **At Destination** → **Delivered / Unloaded**
  - **FG inbound**: destination leg only — **In Transit – Destination** → **At Destination** → **Delivered / Unloaded** (no driver transitions through source-side states)
  - **RM inbound** (raw materials): same as FG inbound for driver — after **Dispatched**, driver may advance directly to **In Transit – Destination** and onward; **In Transit – Source**, **At Source**, and **Loaded / Pickup Completed** are **not** offered and **reject** if attempted
- [x] Each driver action invokes TLS-01 (event ingest / transition API) — app displays PRD status names; UI shows only statuses valid for the TO’s lane
- [x] Invalid transitions fail with stable error (wrong order, wrong lane, wrong actor, yard-owned step already set, etc.)
- [x] First driver transition after **Dispatched** runs **§6.8.1.7** (lane-specific first step: source leg for FG outbound, **In Transit – Destination** for RM/FG inbound); failure returns stable error (vehicle unavailable, driver on leave, vehicle under maintenance, etc.)
- [x] Prefer **gate/scale/yard/QC** as source of truth for yard-bound and QC steps when integrated — driver does not duplicate transitions when TLS-01 marks them system/yard-owned (notably **At Destination** sub-states and unloading on **RM inbound**)

### AC-3: POD capture (at Completed)
- [x] POD upload is **enabled only** when TO status is **`Completed`**; disabled with clear messaging for earlier statuses
- [x] Driver may attach **up to three** POD files per TO: **JPEG**, **PNG**, or **PDF** (at least one required to submit; validate MIME/extension and max size per tech design)
- [x] POD records are **linked to the TO** with `submitted_by`, `submitted_at`; optional signature remains product-optional unless POD-01 mandates it
- [x] Image uploads (JPEG/PNG) use auto-compress before storage; PDF stored as-is within size limits

### AC-4: Technical NFRs (Sprint 4)
- [x] Photo auto-compress before upload (JPEG/PNG only)
- [x] No map deep links, no continuous/background GPS in Sprint 4 deliverables

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DM-01-1 | `ProofOfDelivery` + `ProofOfDeliveryFile` models + migration — FK to TO; up to **3** files per submission (JPEG/PNG/PDF); optional signature; `submitted_by`, `submitted_at` | DFS-053-1 | Done |
| DM-01-2 | Driver transition integration — call TLS-01 transition/event ingest for driver-allowed states (post-**Dispatched**); no parallel ad-hoc status enum in driver app | DFS-053-2 | Done |
| DM-01-3 | `ProofOfDeliveryAdmin` — read-only `list_display` (TO ref, driver, submitted_at), file previews in change form; for support/debug | DFS-053-3 | Done |
| DM-01-4 | Driver TO list API — `GET /api/v1/driver/transport-orders` scoped to authenticated driver; statuses **Ready for Dispatch** through **Closed**; flag `can_execute` / `awaiting_supervisor_dispatch` per row | DFS-053-4 | Done |
| DM-01-5 | Driver TO detail API — `GET /api/v1/driver/transport-orders/{to_id}` (`flow_lane`, status/sub-state, pickup/drop POI, product, qty, urgency, instructions, `allowed_next_transitions` lane-filtered) | DFS-053-5 | Partial |
| DM-01-6 | Driver status transition API — `POST /api/v1/driver/transport-orders/{to_id}/transitions` (target status/sub-state per TLS-01) + §6.8.1.7 on first post-Dispatch action | DFS-053-6 | Done |
| DM-01-7 | POD upload API — `POST /api/v1/driver/transport-orders/{to_id}/pod` (multipart, 1–3 files, JPEG/PNG/PDF) + media storage; reject if status ≠ **Completed** | DFS-053-7 | Done |
| DM-01-8 | §6.8.1.7 fleet availability validation — invoked on first driver transition after **Dispatched** (coordinate with TLS-01-9) | DFS-053-8 | Done |
| DM-01-9 | Photo compression utility — auto-compress JPEG/PNG before storage (max dimension + file size) | DFS-053-9 | Done |
| DM-01-10 | Mobile/responsive UI — TO list (tabs/filters: awaiting dispatch vs in progress vs completed), detail, transition actions, POD upload (3 slots) | DFS-053-10 | Done |
| DM-01-11 | Audit logging on driver transitions and POD submissions | DFS-053-11 | Done |
| DM-01-12 | Trip start button for state transition of TO while starting trip | DFS-053-12 | Pending |

## API Endpoints

```
GET    /api/v1/driver/transport-orders                          # Driver's assigned TOs (Ready for Dispatch → Closed)
GET    /api/v1/driver/transport-orders/{to_id}                  # TO detail + current TLS-01 status + allowed next transitions
POST   /api/v1/driver/transport-orders/{to_id}/transitions    # Driver-triggered TLS-01 transition (blocked until Dispatched)
GET    /api/v1/driver/transport-orders/{to_id}/timeline         # Read-only transition history (delegates to TLS-01 timeline)
POST   /api/v1/driver/transport-orders/{to_id}/pod              # Submit POD: 1–3 files (image/jpeg, image/png, application/pdf); TO must be Completed
GET    /api/v1/driver/transport-orders/{to_id}/pod              # Retrieve POD detail (file URLs, timestamps)
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View own assigned TOs | Driver |
| Trigger driver-allowed TLS-01 transitions (post-Dispatch) | Driver |
| Set TO to **Dispatched** (DS-01 dispatch gate) | Driver Supervisor |
| Submit POD (TO in **Completed**) | Driver |
| View POD / timeline (read-only, all TOs) | Driver Supervisor, TDO, Dispatch Manager |
| View POD / timeline in Django Admin | Support / Admin (read-only) |

## Dependencies

- **Requires**: TO-02 (assignment + TDO **Ready for Dispatch**), **DS-01** (supervisor → **Dispatched**), **TLS-01** (lifecycle graph + transition APIs)
- **Parallel**: GT-01, SC-01, CC-01, LD-01 (yard/CC may authoritatively set steps — single source of truth per TLS-01)
- **Related**: POD-01 (closure rules after POD uploaded)

## Definition of Done

- [x] **POD models**: `ProofOfDelivery` + file attachments store up to **3** files (JPEG/PNG/PDF), optional signature, FK to TO, `submitted_by`, `submitted_at` — migration applied cleanly
- [x] **Dispatch gate**: driver list shows **Ready for Dispatch** TOs; transition API returns stable error until TO is **Dispatched** via DS-01
- [ ] **Driver transitions**: POST transitions call TLS-01; only valid post-**Dispatched** driver transitions succeed; PRD status names shown in API/UI
- [ ] **Driver TO list API**: returns only TOs assigned to authenticated driver from **Ready for Dispatch** through **Closed**; 404 for non-owned TOs
- [ ] **TO detail API**: returns TO reference, `flow_lane`, TLS-01 status/sub-state, pickup/drop POI, product type, quantity, urgency, special instructions, `allowed_next_transitions` (lane-filtered; RM inbound excludes source-leg statuses)
- [x] **§6.8.1.7 validation**: first driver transition after **Dispatched** rejects with descriptive error when fleet unavailable
- [x] **POD upload**: accepts 1–3 files (JPEG/PNG/PDF); rejects when status ≠ **Completed**; images compressed; PDF within size limit
- [x] **Admin read-only views**: POD admin shows list + file previews for support/debug
- [ ] **Security**: driver cannot access other drivers' TOs — API returns 404 for non-owned TOs; verified by automated tests
- [x] **No GPS/map**: no map deep links, no continuous/background GPS in Sprint 4 deliverables
- [x] **Audit trail**: every driver transition and POD submission logged with user, timestamp, TO reference
- [ ] **Unit tests**: authorization, dispatch gate, lane-specific transition matrix (FG outbound full path; RM inbound **Dispatched** → **In Transit – Destination** without source leg; reject source-leg transitions on RM), §6.8.1.7, POD status gate + file type/count limits, photo compression
- [ ] **UAT**: (1) FG outbound: Ready for Dispatch → Dispatched → full source + destination chain → Completed → POD; (2) RM inbound: Ready for Dispatch → Dispatched → **In Transit – Destination** (no source-leg steps) → … → Completed → POD (up to 3 files)
