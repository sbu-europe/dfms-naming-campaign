---
jira_key: DFS-045
jira_type: Story
jira_epic: DFS-046
jira_sprint: "Sprint 4"
story_id: US-022
title: Partial Delivery Handling
epic: Trip Closure & Tracking
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-022-partial-delivery.md
---

# TC-01 — Partial Delivery Handling

## User Story

**As a** Delivery Officer / Transport Planner  
**I want to** record and manage partial deliveries when a vehicle delivers less than the TO quantity  
**So that** the shortfall is tracked, the remaining quantity is re-planned, and the TO is not closed with discrepancies

## Business Context

Partial deliveries occur due to damage in transit, load rejection at destination, weight variance, or vehicle breakdown causing offloading before destination. The system must differentiate between a normal delivery and a partial one, record the reason, and trigger the right follow-up flow for the shortfall.

## Acceptance Criteria

### AC-1: Partial Delivery Recording
- [ ] During `Unloading` state, delivery officer can mark delivery as Partial
- [ ] Inputs required:
  - Delivered quantity
  - Shortfall reason (enum): Cargo Damage, Load Rejected, Weight Variance, Vehicle Breakdown, Other
  - Shortfall notes (free text)
  - Evidence photos (optional)
- [ ] System calculates shortfall quantity = TO quantity − Delivered quantity

### AC-2: TO Status on Partial Delivery
- [ ] TO status updated to `Partially Delivered`
- [ ] Parent TR's delivered quantity updated; TR status recalculated (e.g., `Partially Fulfilled`)
- [ ] Shortfall quantity visible on TR detail page

### AC-3: Shortfall Re-planning
- [ ] Planner notified of shortfall with details
- [ ] Option to:
  - Create a new TO for the shortfall quantity (re-plan from existing TR)
  - Write off the shortfall (with approver justification)
- [ ] Write-off requires Manager approval with reason

### AC-4: POD on Partial Delivery
- [ ] Proof of Delivery still collected for the delivered portion (see TC-02)
- [ ] POD notes must mention partial nature

### AC-5: Audit Trail
- [ ] Partial delivery event logged — actor, quantity delivered, shortfall, reason, timestamp

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TC-01-1 | Delivery record model — TO FK, delivered_qty, shortfall_qty, reason, notes, photos | DFS-045-1 | Pending |
| TC-01-2 | Partial delivery API (POST /trips/{id}/partial-delivery) | DFS-045-2 | Pending |
| TC-01-3 | TR delivered quantity update + TR status recalculation service | DFS-045-3 | Pending |
| TC-01-4 | Shortfall re-planning — create new TO from existing TR shortfall | DFS-045-4 | Pending |
| TC-01-5 | Shortfall write-off API with manager approval workflow | DFS-045-5 | Pending |
| TC-01-6 | Planner notification on partial delivery | DFS-045-6 | Pending |
| TC-01-7 | Partial delivery UI — quantity input, shortfall reason, photo upload | DFS-045-7 | Pending |

## API Endpoints

```
POST  /api/v1/trips/{id}/partial-delivery
Body: { delivered_qty, shortfall_reason, notes, photo_ids }

POST  /api/v1/transport-orders/{to_id}/shortfall/re-plan
Body: { quantity, fleet_type, requested_dispatch_date }

POST  /api/v1/transport-orders/{to_id}/shortfall/write-off
Body: { reason, approver_notes }
```

## Dependencies

- **Requires**: TE-02 (Trip state `Unloading`), TO-01 (TR quantity model)
- **Enables**: TC-02 (POD still required for delivered portion)

## Definition of Done

- [ ] Partial delivery recording with shortfall calculation
- [ ] TR delivered quantity updated and status recalculated
- [ ] Shortfall re-plan or write-off (with approval) working
- [ ] Unit tests > 80%
- [ ] UAT: TO delivers 80% of quantity → system records shortfall → Planner creates new TO for remaining 20%
