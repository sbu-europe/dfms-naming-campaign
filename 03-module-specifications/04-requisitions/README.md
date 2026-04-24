# 04-requisitions — Requisition, Distribution & Procurement Management

## Overview

The `04-requisitions` module covers demand origination and the distribution/procurement workflow layer — **FG Product Requisitions**, **Port Shipment** (import) registration, Transport Request (TR) creation, Distribution Manager approval where applicable, and handoff to Transport Planning.

It maps directly to `apps/requisitions/` in the backend codebase.

**PRD Sections**: 6.6 (Requisitions, Distribution, Procurement)
**Phase**: Phase 1 (Critical)
**Sprint Coverage**: Sprint 3
**Sprint 3 backlog (stories, menu order)**: [Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md) — on-disk layout is `01-requisition` → `02-port-shipments` → `03-distribution` → `04-procurement` → `05-transport` → `06-qa-testing` → `07-devops` → `08-feedback`, matching Requisition-first epic ordering.
**Dependencies**: `01-foundation` (auth/RBAC), `02-master-data` (Product MDM-01, POI MDM-04), `03-users` (role assignment)
**Django App**: `apps/requisitions/`

---

## Module Contents

| File | Description | Sprint | Related Stories |
|------|-------------|--------|-----------------|
| [product-requisition-management.md](product-requisition-management.md) | FG PR and Port Shipment (import) registration — data model, status lifecycle, role gates, LC/shipment fields, product item code lookup, menu structure, API endpoints, overflow rules, audit trail | Sprint 3 | DFS-032, DFS-033 |
| [distribution-management.md](distribution-management.md) | FG PR queue for Distribution team, TR creation (source POI, quantity allocation, overflow guard), Distribution Manager approval (approve / modify / reject), capacity snapshots, notifications, menu structure | Sprint 3 | DFS-034, DFS-035 |
| [procurement-management.md](procurement-management.md) | TR creation vs Port Shipment (PC-02), **Procurement → Transport requests** list; shipment review uses **top-level Port Shipments** (no duplicate queue under Procurement) | Sprint 3 | DFS-036, DFS-037 |

---

## Module Dependency Graph

```
01-foundation  ·  RBAC · Auth · Tenant
       │
02-master-data  ·  Product (MDM-01) · POI (MDM-04)
       │
03-users  ·  Role assignment (Depot/Feed Mill/Commercial/Distribution/Procurement Officers)
       │
04-requisitions  (this module)                        apps/requisitions/
  │
  ├── product-requisition-management — FG PR (Depot / Feed Mill)
  │     └── Submitted FG PRs ──► distribution-management (TR + DM approval)
  │
  ├── Port Shipments (PR-02) — top-level menu, Commercial Officer (separate from Requisition)
  │     └── Submitted shipments ──► procurement-management (TR, no approval)
  │
  ├── distribution-management
  │     └── Approved FG TRs ──► 05-transport
  │
  ├── procurement-management
  │     └── Submitted Port TRs ──► 05-transport
  │
  ▼
05-transport  (TRQ-01 TR **Transport requests** queue · TO-01 / TO-02 **Transport orders** · trip — see [05-transport README](../05-transport/README.md))
```

### Spec-to-spec cross-references

| Spec | Reads from | Writes / triggers |
|------|-----------|-------------------|
| `product-requisition-management` | `02-master-data` MDM-01 (product lookup), MDM-04 (POI + capacity) | Submitted FG PRs → `distribution-management`; Port Shipments → `procurement-management` |
| `distribution-management` | `product-requisition-management` (FG PRs), MDM-04 (capacity snapshots) | Approved TRs → `05-transport/transport-requisition-management` |
| `procurement-management` | `product-requisition-management` (Port Shipments), MDM-04 (POI Port-type filter, capacity snapshots) | Submitted TRs (no approval) → `05-transport/transport-requisition-management` |

---

## Menu Structure

```
Sidebar
│
├── Requisition                              [product-requisition-management — FG only]
│     └── Finished Goods                     Depot Officer / Feed Mill Officer only
│           ├── PR List
│           ├── Create FG PR
│           └── PR Detail  (Edit / Submit / Cancel)
│
├── Port Shipments                           [PR-02 — top-level; not under Requisition]
│     (Commercial Officer only)
│     ├── Shipment List
│     ├── Register Port Shipment  (+ LC fields + Arrival Notice)
│     └── Shipment Detail  (Edit / Submit / Cancel / Upload Document)
│
├── Distribution                             [distribution-management]
│     ├── Product Requisitions               Distribution Officer, Distribution Manager
│     │     └── PR Detail → [Create Transport Request]
│     └── Transport requests (FG)
│           ├── TR List  (DO: own TRs; DM: all Pending Approval)
│           └── TR Detail  (Approve / Approve-with-modify / Reject)
│
└── Procurement                              [procurement-management]
      └── Transport requests (Port consignment)   Procurement Officer — own TR list / create (triage: **top-level Port Shipments**, not a duplicate queue here)
```

Downstream, **Transport** (05-transport) uses sibling areas **Transport requests** (unified TR queue + planning) and **Transport orders** (TO create + TDO + driver) — see **Menu structure & role access → Transport** in the [Sprint 3 README](../../04-backlog/sprints/sprint-3/README.md).

---

## Django App Mapping

| Spec file | Django app | Key models |
|-----------|-----------|------------|
| `product-requisition-management.md` | `apps/requisitions` | `ProductRequisition`, `PRLineItem`, `PRApprovalRecord` |
| `distribution-management.md` | `apps/requisitions` | `TransportRequisition` (Distribution role views) |
| `procurement-management.md` | `apps/requisitions` | `TransportRequisition` (`tr_type=PORT_CONSIGNMENT`), `TRLineItem` (qty allocation per destination) |

---

## Dependencies

### Upstream
- `01-foundation`: Authentication, RBAC, tenant isolation
- `02-master-data`: Product (MDM-01) for item code lookup; POI (MDM-04) for destination/source dropdowns and capacity snapshots
- `03-users`: Role-based access (Depot Officer, Feed Mill Officer, Commercial Officer, Distribution Officer, Distribution Manager, Procurement Officer)

### Downstream
- `05-transport`: Approved/submitted TRs consumed by Transport Planning queue
- `11-reporting`: PR/TR metrics and fulfilment KPIs

---

**Last Updated**: 2026-04-22
**Previous Module**: [03-users/](../03-users/README.md) — User Management
**Next Module**: [05-transport/](../05-transport/README.md) — Transport Management
