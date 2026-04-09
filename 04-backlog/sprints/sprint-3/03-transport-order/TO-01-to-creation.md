---
jira_key: DFS-039
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: US-017
title: Transport Order (TO) Creation — Single & Multi-TO per TR
epic: Transport Order
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-017-to-creation-multiple.md
---

# TO-01 — Transport Order (TO) Creation — Single & Multi-TO per TR

## User Story

**As a** Transport Planner  
**I want to** create one or multiple Transport Orders from a single approved Transfer Requisition  
**So that** I can flexibly split shipments, mix fleet types, and begin transport before full fleet is available

## Business Context

Transport Orders are the executable units of transport work. TRs define *what* to move; TOs define *how* to move it — which vehicles, which fleet type, how much per TO.

**Multi-TO capability**: A single 1000-ton TR can become two TOs — 600 tons via own fleet (2 trucks) + 400 tons via vendor fleet (1 truck) — enabling partial fulfillment, load balancing, and risk mitigation.

**See also**: TO-02 (detailed TO creation form with vehicle/driver assignment) — TO-01 focuses on TR-TO relationship management and quantity allocation, TO-02 covers the execution assignment details.

## Acceptance Criteria

### AC-1: TO Creation from TR
- [ ] Planner can create TOs only from TRs with status `Available for Planning` or `Under Planning`
- [ ] Pre-populated from TR: Source POI, Destination POI, Product, Route
- [ ] Planner specifies per TO: Quantity (partial or full remaining), Fleet Type (Own / Vendor), Vehicle Type, Requested Dispatch Date

### AC-2: TR Quantity Allocation
- [ ] System tracks: Total TR Quantity, Allocated (sum of TOs), Remaining
- [ ] TO quantity must not exceed Remaining TR quantity
- [ ] TR status auto-updates:
  - First TO created → `Partially Allocated`
  - All quantity allocated → `Fully Allocated`
- [ ] Planner warned if creating inefficiently small TOs (< 50% vehicle capacity)

### AC-3: Multi-TO Workflow
- [ ] After creating first TO, "Create Another TO" button available (remaining qty shown)
- [ ] Each TO gets independent fleet type, vehicle, and dispatch date
- [ ] Planner can mix Own Fleet and Vendor Fleet TOs against same TR

### AC-4: TO Reference & Numbering
- [ ] TO auto-number: `TO-YYYYMMDD-XXXX`
- [ ] TO references parent TR ID
- [ ] TR detail page shows all linked TOs with their statuses

### AC-5: TO Status Lifecycle
- [ ] Initial TO status: `Draft` → `Confirmed` → (execution statuses in Sprint 4+)
- [ ] Confirmed TO linked to fleet assignment (TO-02)

### AC-6: Audit Trail
- [ ] TO create / confirm / cancel logged with planner + timestamp

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TO-01-1 | TransportOrder model + migration (TR FK, quantity, fleet type, status, line items) | DFS-039-1 | Pending |
| TO-01-2 | TO creation API (POST /transport-orders) — TR quantity allocation validation | DFS-039-2 | Pending |
| TO-01-3 | TO number auto-generation: `TO-YYYYMMDD-XXXX` | DFS-039-3 | Pending |
| TO-01-4 | TR quantity tracking service — allocated, remaining, status auto-update | DFS-039-4 | Pending |
| TO-01-5 | Multi-TO workflow — "Create Another TO" flow with remaining quantity | DFS-039-5 | Pending |
| TO-01-6 | TO list API (GET /transport-orders with TR filter, status filter) | DFS-039-6 | Pending |
| TO-01-7 | TR detail view — linked TOs section with status | DFS-039-7 | Pending |
| TO-01-8 | TO creation form UI — quantity input, fleet type selector, dispatch date | DFS-039-8 | Pending |
| TO-01-9 | Efficiency warning modal (< 50% vehicle capacity) | DFS-039-9 | Pending |

## API Endpoints

```
POST  /api/v1/transport-orders
Body: { tr_id, quantity, fleet_type, vehicle_type, requested_dispatch_date, notes }
Response: 201 Created + TO object

GET   /api/v1/transport-orders?tr_id=&status=&fleet_type=&page=
GET   /api/v1/transport-orders/{to_id}
POST  /api/v1/transport-orders/{to_id}/confirm
POST  /api/v1/transport-orders/{to_id}/cancel
```

## Dependencies

- **Requires**: TP-01 (TR Assessment), TP-02 (Fleet Availability for fleet type counts)
- **Enables**: TO-02 (Vehicle/Driver assignment on confirmed TOs), TO-03 (Vendor Direct Assignment)

## Definition of Done

- [ ] TO creation from TR with quantity validation
- [ ] Multi-TO from single TR with fleet type mix
- [ ] TR status auto-updates (Partially / Fully Allocated)
- [ ] TO number generation and TR linking
- [ ] Unit tests > 80%
- [ ] UAT: Planner splits one TR into 2 TOs (own + vendor fleet) successfully
