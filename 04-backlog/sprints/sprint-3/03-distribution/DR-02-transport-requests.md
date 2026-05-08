---
jira_key: DFS-035
jira_type: Story
jira_epic: DFS-041
jira_sprint: "Sprint 3"
story_id: ~
title: Distribution — Transport Request Creation & Manager Approval
epic: Distribution
status: Delivered
story_points: 8
assignee: ~
delivered: 2026-05-07
---

# DR-02 — Distribution: Transport Request Creation & Manager Approval

## User Story

**As a** Distribution Officer  
**I want to** create one or more Transport Requests (TRs) against a Finished Goods Product Requisition, specifying source POI and quantity per TR  
**So that** each TR represents a concrete shipment plan that a Distribution Manager can review and approve before handover to Transport

**As a** Distribution Manager  
**I want to** review, optionally modify, and approve Transport Requests created by Distribution Officers  
**So that** only validated and capacity-aligned TRs proceed to Transport Planning

## Business Context

A single FG PR can be fulfilled by multiple TRs — e.g., sourcing from two different depots. The Distribution Officer defines each TR with a specific source POI and quantity; the destination is inherited from the parent PR. The sum of all TR quantities must not exceed the PR quantity.

The Transport Planner (not the Distribution Officer) defines the number of vehicles and vehicle type — this is captured in the Transport module when the TR is assessed (TRQ-01). The TR captures only the logistics intent: source, destination, quantity, and delivery date.

**TR flow**:
```
DO creates TR(s) against PR → Quantity validation → DM reviews + modifies if needed → Approves → TR available for Transport Planning
```

## Acceptance Criteria

### AC-1: TR Creation Form
- [x] Distribution Officer creates a TR from a specific FG PR with:
  - **Parent PR**: Pre-filled and read-only (PR Number, Destination POI, product line items)
  - **Source POI**: Dropdown of active POIs (depots, feed mills, factories — cannot be same as Destination)
  - **Destination POI**: Inherited from PR — read-only
  - **Transfer Quantity**: Per product line item (must not exceed remaining PR quantity for that line)
  - **Delivery Date**: Pre-filled from PR; editable
  - **Remarks** (optional — mandatory if any override or deviation from PR)
- [x] System auto-generates TR number: `TR-FG-YYYYMMDD-XXXX`
- [ ] Only active POIs selectable as Source — carry-forward (is_active filter)
- [ ] Capacity snapshots for Source and Destination POI — carry-forward (inventory module)

### AC-2: Quantity Validation
- [x] System tracks per PR: Total PR Quantity, Total Allocated across all TRs, Remaining
- [x] TR quantity overflow → blocked with clear error
- [x] Remaining quantity shown on the TR creation form in real time
- [x] Partial allocation allowed — Officer can create a TR for part of the PR and add more TRs later

### AC-3: Multi-TR per PR
- [x] Multiple TRs per PR supported available on PR detail (if remaining qty > 0)
- [x] Each TR can have a different Source POI
- [x] All TRs share the same Destination POI (inherited from PR)

### AC-4: TR Status Lifecycle
- [x] Status: `Submitted` → `Pending Approval` → `Approved` / `Rejected`
- [x] Submitted TR is locked from editing by DO (until rejected back)
- [x] No Draft state — TR submitted directly on creation

### AC-5: TR List View (Distribution Officer)
- [x] DO sees TRs they created with PR reference, status, source/dest, and quantity
- [x] Filters: status, date available

### AC-6: Distribution Manager Approval Queue
- [x] Distribution Manager sees all TRs with status `Pending Approval` (FG type)
- [x] Filters: delivery date, urgency, status
- [x] Sort: delivery date, urgency
- [x] Columns: TR Number, Parent PR, Source POI, Destination POI, Quantity, Urgency, Submitted By, Submitted Date
- [ ] Capacity snapshots on DM review — carry-forward (inventory module)

### AC-7: TR Approval Actions
- [x] **Approve**: TR status → `Available for Transport Planning` → auto-transitions to `Available for Transport Planning`
- [x] **Approve with Modification**: DM can modify Transfer Quantity, Delivery Date, before approving — **mandatory remarks required when modifying**
- [x] **Reject**: Required rejection reason; TR status → `Rejected`, returned to DO with remarks
- [x] All approval actions audit logged with approver ID, timestamp, and remarks

### AC-8: Notifications
- [ ] In-app notifications — carry-forward (notification service) (in-app) on Approved / Rejected
- [ ] Transport Planner notifications — carry-forward when TR becomes `Available for Transport Planning`

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DR-02-1 | TransportRequest model + migration (PR FK, source/dest POI, qty per line, status, remarks, audit) | DFS-035-1 | Pending |
| DR-02-2 | TR creation API (POST) — PR quantity allocation validation (overflow prevention) | DFS-035-2 | Pending |
| DR-02-3 | TR number auto-generation: `TR-FG-YYYYMMDD-XXXX` | DFS-035-3 | Pending |
| DR-02-4 | PR quantity tracking service — allocated, remaining, overflow guard | DFS-035-4 | Pending |
| DR-02-5 | Real-time capacity snapshot service for Source POI and Destination POI (used on TR form and DM review) | DFS-035-5 | Pending |
| DR-02-6 | TR list API for Distribution Officer (GET with POI + product category + status filters) | DFS-035-6 | Pending |
| DR-02-7 | TR approval API: POST /{tr_id}/approve, POST /{tr_id}/reject | DFS-035-7 | Pending |
| DR-02-8 | Approve-with-modification: DM can edit qty and delivery date; mandatory remarks gate | DFS-035-8 | Pending |
| DR-02-9 | Approval record stored on TR (approver, timestamp, action, remarks) | DFS-035-9 | Pending |
| DR-02-10 | TR status auto-transition: Approved → Available for Transport Planning | DFS-035-10 | Pending |
| DR-02-11 | Notifications — in-app on Approve / Reject | DFS-035-11 | Pending |
| DR-02-12 | TR creation form UI — source POI picker, qty input per line, delivery date, capacity snapshot widgets (source + dest), remaining qty indicator | DFS-035-12 | Pending |
| DR-02-13 | TR list UI for Distribution Officer | DFS-035-13 | Pending |
| DR-02-14 | DM approval queue UI (list with POI + category filters, sort) | DFS-035-14 | Pending |
| DR-02-15 | DM approval detail view UI (full TR info + capacity snapshots + modification panel with mandatory remarks) | DFS-035-15 | Pending |

## API Endpoints

```
POST   /api/v1/transport-requests
Body:  { pr_id, source_poi_id, quantity_lines[], delivery_date, remarks? }
Response: 201 Created + TR object

GET    /api/v1/transport-requests?pr_id=&type=FG&status=&poi=&product_category=&page=
GET    /api/v1/transport-requests/{tr_id}
POST   /api/v1/transport-requests/{tr_id}/cancel
POST   /api/v1/transport-requests/{tr_id}/approve               # DM: { remarks? }
POST   /api/v1/transport-requests/{tr_id}/reject                # DM: { remarks (mandatory) }
POST   /api/v1/transport-requests/{tr_id}/approve-with-modify   # DM: { quantity_lines?, delivery_date?, remarks (mandatory) }
```

## Access & Permissions

> Full menu structure and role-access matrix: [`README.md`](../README.md)

| Action | Role |
|--------|------|
| View TR list (own) | Distribution Officer |
| Create TR against a FG PR | Distribution Officer |
| Cancel TR | Distribution Officer |
| View all pending approval TRs | Distribution Manager |
| Approve TR | Distribution Manager |
| Approve with modification (mandatory remarks) | Distribution Manager |
| Reject TR (mandatory remarks) | Distribution Manager |

- Source POI selected per TR from active POI dropdown; Destination inherited from PR (read-only)
- Total TR quantity across all TRs for one PR must not exceed PR quantity — overflow blocked
- Vehicle count and vehicle type are **not** set here — captured by Transport Planner at TR assessment (TRQ-01)
- Remarks are mandatory whenever DM modifies or rejects a TR

## Dependencies

- **Requires**: PR-01 (FG Product Requisition), MDM-04 (POI + capacity), US-004 (RBAC — Distribution Officer + Distribution Manager roles)
- **Enables**: TRQ-01 (Transport Planning queue — approved TRs become visible)

## Definition of Done

- [x] TR creation: Source POI, quantity per line, delivery date, remarks
- [ ] Capacity snapshots on TR form — carry-forward (inventory module)
- [x] Quantity overflow validation — blocked
- [ ] Multi-TR per PR workflow
- [ ] TR number auto-generation
- [ ] Submit → Pending Approval → Approved/Rejected workflow (no Draft state)
- [ ] DM can Approve / Approve-with-modification (mandatory remarks) / Reject (mandatory remarks)
- [ ] Status auto-transitions; notifications sent
- [ ] Audit logging
- [ ] Unit tests > 80%
- [ ] UAT: DO creates 2 TRs from one PR (different sources); DM modifies one with remarks and approves both
