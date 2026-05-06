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
| GT-02-1 | POST gate-to dealer (DO) — TO create API + classification | DFS-062-1 | Pending |
| GT-02-2 | POST gate-to supplier (PO) — TO create API + classification | DFS-062-2 | Pending |
| GT-02-3 | Gateman UI — wizard (Dealer vs Supplier) + validation messages | DFS-062-3 | Pending |
| GT-02-4 | Link gate session ↔ TO; emit TLS / notification (in-app) | DFS-062-4 | Pending |
| GT-02-5 | Inventory/QC hooks (feature-flagged if downstream modules incomplete) | DFS-062-5 | Pending |

## Dependencies

- **Requires**: TO-01 domain patterns (TO model, numbering), tenant POI context for **current gate**; **TLS-01** for status events (can stub initial transition)
- **Parallel with**: GT-01 (gate-in/out); **before or after** gate-in per chosen UX (document)
- **Enables**: SC-01 / CC-01 / LD-01 for visits that started without planner TO

## Definition of Done

- [ ] UAT: dealer vehicle with DO → gate TO created → proceeds through scale/load path per tenant config
- [ ] UAT: supplier vehicle with PO → gate TO created → inbound flags set for QC chain
- [ ] RBAC tests: gate role can create; unrelated role cannot
