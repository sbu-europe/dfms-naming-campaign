---
jira_key: DFS-036
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: ~
title: Port Shipments — org-wide list & detail (Procurement role)
epic: Port Shipments
status: Pending
story_points: 2
assignee: ~
---

# PC-01 — Port Shipments: org-wide list & detail (Procurement role)

## User Story

**As a** Procurement Officer  
**I want** the **top-level Port Shipments** area to show **all submitted** shipments (tenant scope) with full LC and line detail  
**So that** I can plan distribution and create **Transport Requests** (PC-02) without a separate “queue” menu under Procurement

## Business Context

There is **no** extra **Inbound shipment queue** (or similar) under **Procurement** in the nav. Procurement and Commercial both use **Port Shipments** at the top level; **role-based access** shows:

- **Commercial**: own shipments, create/edit/cancel (PR-02)
- **Procurement**: all submitted shipments, **read-only** on the shipment, with actions to open **TR / destination breakdown** (PC-02)

This story is the **Procurement** slice of the Port Shipments UX (list filters, org-wide `GET`, detail, “Create TR” entry point).

**Flow**:
```
PR-02 (Commercial submits) → Procurement opens Port Shipments (same menu) org view + detail → TR(s) via PC-02 → Transport Planning
```

## Acceptance Criteria

### AC-1: Org-wide Port Shipment list (Procurement)
- [ ] Under **top-level Port Shipments**, Procurement sees **all** Port Shipments with status `Submitted` or `In Progress` (not limited to “own”)
- [ ] Filters: Vessel Name, LC Number, ETA (date range), Urgency, Status, Entered By
- [ ] Sort: ETA (default asc), Urgency, Submission Date
- [ ] Columns: Shipment Ref (`PS-PORT-…`), LC, BL, Vessel, ETA, total weight, Urgency, Entered By, Status, Actions

### AC-2: Shipment detail — read/plan
- [ ] Full shipment reference, Arrival Notice download, RM lines, capacity snapshots (informational)
- [ ] TRs already created against this shipment; remaining qty per line
- [ ] **Create TR / destination breakdown** → PC-02; disabled if fully allocated or cancelled

### AC-3: Commercial unchanged
- [ ] Commercial still sees **own** list only in the same module (PR-02 rules)

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| PC-01-1 | List API — org-wide for Procurement role; own-only for Commercial | DFS-036-1 | Pending |
| PC-01-2 | Detail API + linked TRs + remaining qty | DFS-036-2 | Pending |
| PC-01-3 | Arrival Notice download | DFS-036-3 | Pending |
| PC-01-4 | List UI — role-based scope, filters, badges | DFS-036-4 | Pending |
| PC-01-5 | Detail UI + “Create TR” → PC-02 | DFS-036-5 | Pending |

## API Endpoints

```
GET  /api/v1/product-requisitions?type=PORT_CONSIGNMENT&scope=org|own&…
GET  /api/v1/product-requisitions/{id}
…
```

*(Exact query params follow RBAC; `scope` is illustrative.)*

## Access & Permissions

> [`../README.md`](../README.md)

| Action | Role |
|--------|------|
| List **all submitted** Port Shipments | Procurement Officer |
| Shipment detail (read); download Arrival Notice | Procurement Officer |
| Open TR creation (PC-02) | Procurement Officer |
| List **own** shipments; create/edit Draft | Commercial Officer |

- Procurement does not edit or cancel the shipment (Commercial ownership).

## Dependencies

- **Requires**: PR-02
- **Enables**: PC-02

## Definition of Done

- [ ] Procurement can complete planning using **only** top-level **Port Shipments** + **Procurement → Transport Requests** for TR lists — no duplicate shipment queue under Procurement
- [ ] Unit tests > 80%
- [ ] UAT: Procurement sees org-wide list in Port Shipments; creates TR from detail
