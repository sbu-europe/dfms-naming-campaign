---
jira_key: DFS-062
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: GT-02
title: Gate — On-Demand Transport Order (TO) Creation (Dealer DO & Supplier PO)
epic: Gate Operations
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.10.2.1 On Demand Third Party TO Creation against DO copy for Dealer Entry (Phase 1)"
  - "§6.10.2.2 On Demand Third Party TO Creation against PO copy for Supplier Entry (Phase 1)"
---

# GT-02 — On-Demand TO Creation at Gate (Dealer DO & Supplier PO)

## User Story

**As a** Gateman  
**I want to** create a **Transport Order** when a vehicle arrives with only a **DO** (dealer FG pickup) or **PO** (supplier RM delivery) and no pre-created TO  
**So that** scaling, loading/unloading, and QC workflows can proceed without waiting for a planner TO

## Business Context

PRD **§6.10.2.1** (Dealer / finished goods outbound) and **§6.10.2.2** (Supplier / raw material inbound). These TOs are **gate-originated**, tagged and classified for downstream routing (outbound FG vs inbound RM per PRD).

FG inbound (e.g., Port Consignment transfer from planner-created TO per PRD §6.8.1.3) is part of Sprint 4 execution lanes but is **not** created via GT-02 on-demand endpoints unless a dedicated business document type is added later.

**Relationship to [GT-01](GT-01-gate-in-out-remarks.md):** After GT-02 creates the TO, **gate-in** (PRD §6.10.1) should reference the new TO/challan context (same visit session as GT-01 or linked record).

**Relationship to Sprint 3:** Planner-created TOs remain **TO-01 / TO-02**. Gate-created TOs still need **fleet assignment** when the movement is own fleet: either **TDO assigns** vehicle/driver ([TO-02](../../sprint-3/05-transport/03-tdo-assignment.md)) after creation, or a **minimal gate-captured** vehicle/driver identity is stored on the TO until TDO confirms — **pick one rule in technical design** and document in API.

## Acceptance Criteria

### AC-1: Dealer (DO) — Finished goods outbound (§6.10.2.1)
- [ ] Gateman selects document path **Dealer (DO)**
- [ ] Captures: DO number, dealer name, finished goods product, planned quantity, driver name, driver contact, remarks (optional)
- [ ] System creates a **gate-created FG TO** with unique TO id; linked to **gate-in record** (or creates gate-in stub first — tech design)
- [ ] TO classified per PRD: **Source Gate**, transfer type **Finished Goods – Dealer Outbound** (or equivalent enum)
- [ ] TO is eligible for **scaling → loading → scale-out → gate-out** per PRD; **inventory deduction** only after loading & scale-out (business rule flag if inventory module not ready — document)

### AC-2: Supplier (PO) — Raw material inbound (§6.10.2.2)
- [ ] Gateman selects document path **Supplier (PO)**
- [ ] Captures: PO number, supplier name, raw material product, expected quantity, driver name, driver contact, remarks (optional)
- [ ] System creates a **gate-created RM TO**; links to gate session
- [ ] TO follows **inbound** path per PRD: scale-in → QC sampling → lab (as configured) → unloading → scale-out; **inventory update only after QC Pass** (align with existing QC policy flags)

### AC-3: Validation & safety
- [ ] **FG dealer path:** quantity validation against **available FG inventory** when stock service exists; otherwise stub with manual confirm + audit *(document)*
- [ ] **RM supplier path:** expected quantity captured; QC linkage flag set for inbound workflow
- [ ] All actions **audit-logged** (user, POI, timestamp)

### AC-4: Permissions
- [ ] Only **Gate** role (or role with explicit permission) can create on-demand TOs; Transport Planner read-only visibility on list/detail

### AC-5: Integration hooks
- [ ] Created TO appears in **Transport → Transport orders** (or equivalent) with source = `GATE` / `ON_DEMAND`
- [ ] **TLS-01** receives lifecycle events from creation onward (initial state defined in tech design, e.g. `Created` pending TDO if required)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| GT-02-1 | GateCreatedTO model extensions — `source=GATE` field, `transfer_type` enum (FG_DEALER_OUTBOUND, RM_SUPPLIER_INBOUND) + migration | DFS-062-1 | Pending |
| GT-02-2 | OnDemandTOAdmin — Dealer DO form: `save_model` creates FG TO with `transfer_type=FG_DEALER_OUTBOUND`, generates TO number, links to gate-in stub/session | DFS-062-2 | Pending |
| GT-02-3 | OnDemandTOAdmin — Supplier PO form: `save_model` creates RM TO with `transfer_type=RM_SUPPLIER_INBOUND`, sets QC linkage flag, links to gate session | DFS-062-3 | Pending |
| GT-02-4 | Dealer TO creation REST API (POST) — validates DO number, dealer, product, quantity; returns created TO with session linkage | DFS-062-4 | Pending |
| GT-02-5 | Supplier TO creation REST API (POST) — validates PO number, supplier, product, expected quantity; returns created TO | DFS-062-5 | Pending |
| GT-02-6 | On-demand TO list/detail REST API (GET with filters: source=GATE, transfer_type, date, search) | DFS-062-6 | Pending |
| GT-02-7 | Gate session ↔ TO linkage service — associates GateVisitSession with newly created TO; updates gate-in context | DFS-062-7 | Pending |
| GT-02-8 | TLS-01 event emission — emit `TO_CREATED` lifecycle event on gate-originated TO creation | DFS-062-8 | Pending |
| GT-02-9 | Inventory/QC hooks — feature-flagged stock check stub for Dealer path; QC linkage flag for Supplier path (stubs if downstream modules incomplete) | DFS-062-9 | Pending |
| GT-02-10 | Gateman wizard UI — Dealer vs Supplier path selection, form fields per path, validation messages, success confirmation with TO number | DFS-062-10 | Pending |
| GT-02-11 | GateOnDemandActivityLog — audit logging on TO creation, linkage, and validation overrides (user, POI, timestamp, action) | DFS-062-11 | Pending |

## API Endpoints

```
POST   /api/v1/gate/on-demand-to/dealer                        # Create FG TO from Dealer DO
POST   /api/v1/gate/on-demand-to/supplier                      # Create RM TO from Supplier PO
GET    /api/v1/gate/on-demand-to?source=GATE&transfer_type=&date=&search=
GET    /api/v1/gate/on-demand-to/{to_id}
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| Create on-demand TO (Dealer DO) | Gateman |
| Create on-demand TO (Supplier PO) | Gateman |
| View on-demand TO list/detail (read-only) | Transport Planner, Supervisor |

- Only Gate role (or role with explicit `gate.create_ondemand_to` permission) can create on-demand TOs
- Transport Planner has read-only visibility on gate-created TOs for fleet assignment follow-up

## Dependencies

- **Requires**: TO-01 domain patterns (TO model, numbering), tenant POI context for **current gate**; **TLS-01** for status events (can stub initial transition)
- **Parallel with**: GT-01 (gate-in/out); **before or after** gate-in per chosen UX (document)
- **Enables**: SC-01 / CC-01 / LD-01 for visits that started without planner TO

## Definition of Done

- [ ] GateCreatedTO model has `source=GATE` and `transfer_type` enum fields; migration applied cleanly
- [ ] Dealer DO path: Gateman submits DO number, dealer, product, quantity → system creates FG TO with unique TO number and `transfer_type=FG_DEALER_OUTBOUND`
- [ ] Supplier PO path: Gateman submits PO number, supplier, product, expected quantity → system creates RM TO with `transfer_type=RM_SUPPLIER_INBOUND` and QC linkage flag set
- [ ] Created TO is linked to GateVisitSession and gate-in context is updated
- [ ] Gate-created TO appears in Transport Orders list with `source=GATE` filter
- [ ] TLS-01 receives `TO_CREATED` lifecycle event from gate-originated TO creation
- [ ] FG dealer path runs stock check stub (manual confirm + audit) when inventory module is not ready; feature-flagged for real validation later
- [ ] Only Gate role can create on-demand TOs; Transport Planner gets read-only access; unrelated role receives 403
- [ ] Audit log records every on-demand TO creation with user, POI, timestamp, and document path chosen
- [ ] UAT: dealer vehicle with DO → gate TO created → proceeds through scale/load/gate-out path
- [ ] UAT: supplier vehicle with PO → gate TO created → inbound flags set → proceeds through QC chain
- [ ] RBAC unit tests: gate role can create; unrelated role cannot
