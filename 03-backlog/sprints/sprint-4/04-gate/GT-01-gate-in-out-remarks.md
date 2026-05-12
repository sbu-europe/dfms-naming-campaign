---
jira_key: DFS-054
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: GT-01
title: Gate — Gate-In, Gate-Out & Remarks (TO-Linked + Document Categories)
epic: Gate Operations
status: Pending
story_points: 8
assignee: ~
prd_refs:
  - "§6.10.1 Gate-In Entry (Phase 1)"
  - "§6.10.3 Gate-Out Entry (Phase 1)"
  - "§6.10.4 Discrepancy & Remarks Logging (Phase 1)"
---

# GT-01 — Gate-In, Gate-Out & Remarks

## User Story

**As a** Gateman  
**I want to** register gate-in and gate-out against a vehicle with TO/challan context and optional remarks  
**So that** yard, scaling, and command center workflows have an auditable entry record

## Business Context

PRD §6.10.1 captures document categories (Supplier PO, Internal TO/Challan, Dealer DO, etc.). **Sprint 4 E2E** prioritises **Internal Transfer (TO/Challan)** for planner-created TOs. Other categories remain in scope per PRD but can be toggled by feature flag.

**§6.10.2.x** on-demand TO creation (Dealer DO / Supplier PO) is **[GT-02](GT-02-on-demand-to-creation-gate.md)**.

## Acceptance Criteria

### AC-1: Gate-in
- [ ] Gate-in requires **vehicle registration number**; cannot save without it
- [ ] Fields per PRD: document category, challan/TO/PO/DO number (as applicable), product details (gate-in item), quantity (nullable for empty vehicles), date/time, driver name & contact, party name, project/from info, remarks
- [ ] For **TO-linked** flow: lookup TO by number; validate vehicle matches assigned vehicle on TO *(or warn + supervisor override policy — document)*

### AC-2: Routing to operational flow
- [ ] At gate-in, the **document category** captured in AC-1 (per PRD §6.10.1) determines the operational flow the record is routed to — `[High]`:
  - `Supplier (PO)` / Port → **Inbound QC Workflow**
  - `Dealer (DO)` → **Outbound FG Workflow**
  - `Distributor (PO/DO)` → **Outbound FG Workflow** *(same lane as Dealer per PRD §6.10.1 intent)*
  - `Internal Transfer (TO/Challan)` → **TO-Linked Workflow**
- [ ] Sprint 4 E2E prioritises the **Internal Transfer → TO-Linked Workflow** path (aligns with TLS-01/POD-01); Supplier and Dealer/Distributor flows are toggled by feature flag per Business Context

### AC-3: Gate-out
- [ ] Gate-out allowed only when business rules satisfied: **after scale-out** for flows that use scaling
- [ ] Minimum Sprint 4 guard matrix (to align TLS-01/POD-01):
  - FG outbound: scale-out completed + loading completed
  - FG inbound: scale-out completed + unloading completed
  - RM inbound: scale-out completed + unloading completed + QC not failed

### AC-4: Remarks / discrepancy
- [ ] Free-text remarks on gate-in and gate-out events; audit who/when

### AC-5: Linkage to TO
- [ ] Gate events update **TO timeline** (TLS-01) with timestamps

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| GT-01-1 | GateIn / GateOut models + APIs | DFS-054-1 | Pending |
| GT-01-2 | TO lookup + validation service | DFS-054-2 | Pending |
| GT-01-3 | Gateman UI (fast entry, barcode later = out of scope) | DFS-054-3 | Pending |
| GT-01-4 | TLS-01 timeline event emission | DFS-054-4 | Pending |

## Dependencies

- **Requires**: **TLS-01**; **TO** exists and is in a state that permits gate-in (**§6.8.5**, post–Ready for Dispatch as per technical design)
- **Before**: SC-01 (scale-in after gate-in)

## Definition of Done

- [ ] UAT: vehicle arrives → gate-in → scale-in → … → gate-out happy path
- [ ] Audit trail complete
- [ ] Unit tests for gate-out guard rules
