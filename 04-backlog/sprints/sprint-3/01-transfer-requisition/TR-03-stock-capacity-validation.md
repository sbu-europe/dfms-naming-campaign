---
jira_key: DFS-034
jira_type: Story
jira_epic: DFS-040
jira_sprint: "Sprint 3"
story_id: US-013
title: Stock & Capacity Validation on TR Creation
epic: Transfer Requisition
status: Pending
story_points: 3
assignee: ~
spec_file: ../../../../stories/US-013-stock-validation.md
---

# TR-03 — Stock & Capacity Validation on TR Creation

## User Story

**As a** Distribution / Procurement Officer  
**I want** stock availability and destination capacity shown as I fill in a TR — with threshold warnings where relevant  
**So that** I can make informed decisions before submitting and avoid trips that fail due to stock or space issues

## Business Context

Validation is **informational, not blocking** per PRD — stock situations can change before transport executes. The goal is to give the officer visibility and warnings, not to prevent submission.

Works in tandem with capacity data from MDM-04 (POI capacity tracking) and an ERP/WMS stock feed.

## Acceptance Criteria

### AC-1: Source Stock Display
- [ ] On TR form, when source POI + product selected, show stock widget:
  - Available stock at source POI for selected product
  - Reserved stock (pending other TRs)
  - Stock after this TR (Available − Requested Quantity)
  - Warning if stock after TR < 20% safety stock threshold (yellow)
  - Warning if requested quantity > available stock (red)
- [ ] Stock widget refreshable on demand (Refresh button)
- [ ] Last updated timestamp shown

### AC-2: Destination Capacity Display
- [ ] When destination POI selected, show capacity widget:
  - Total capacity, current utilization, available capacity
  - Available capacity after this TR
  - Warning if destination utilization > 80% after TR (yellow)
  - Warning if destination has insufficient space (red)

### AC-3: Non-blocking Submission
- [ ] Warnings displayed but TR submission not blocked
- [ ] If warnings present, officer must acknowledge (checkbox: "I have reviewed the warnings")
- [ ] Warning acknowledgement recorded on TR record

### AC-4: ERP Integration Fallback
- [ ] If ERP unavailable: show "Stock data unavailable — manual verification required" banner
- [ ] TR submission still allowed with ERP unavailable warning

### AC-5: Capacity at Approval Stage
- [ ] Re-validate stock & capacity at approval time (TR-04, TR-05)
- [ ] Approver sees current snapshot at time of approval decision

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TR-03-1 | POIStockLevel model + ERP stock sync API (GET stock by POI + product) | DFS-034-1 | Pending |
| TR-03-2 | Stock validation service — compare requested qty vs available, compute post-TR stock | DFS-034-2 | Pending |
| TR-03-3 | Capacity validation service — compute destination utilization after TR | DFS-034-3 | Pending |
| TR-03-4 | Validate TR endpoint (POST /transfer-requisitions/validate) — used by form on-the-fly | DFS-034-4 | Pending |
| TR-03-5 | Warning acknowledgement field on TR model | DFS-034-5 | Pending |
| TR-03-6 | Stock widget UI component (available, reserved, after-TR, warning badges) | DFS-034-6 | Pending |
| TR-03-7 | Capacity widget UI component (utilization bar, available, warning badges) | DFS-034-7 | Pending |
| TR-03-8 | ERP unavailability graceful fallback (banner, allow proceed) | DFS-034-8 | Pending |

## API Endpoints

```
POST  /api/v1/transfer-requisitions/validate-stock
Body: { source_poi_id, destination_poi_id, line_items: [{product_id, quantity}] }
Response: { source_validation, destination_validation, warnings[] }

GET   /api/v1/pois/{poi_id}/stock/{product_id}     # Real-time stock snapshot
GET   /api/v1/pois/{poi_id}/capacity               # Real-time capacity snapshot
```

## Dependencies

- **Requires**: MDM-04 (POI capacity), MDM-01 (Product), TR-01/TR-02 (TR model)
- **Feeds into**: TR-04 (Distribution Approval), TR-05 (Procurement Approval) — re-validates at approval time

## Definition of Done

- [ ] Stock and capacity widgets displayed on TR creation form
- [ ] Warnings shown (informational) with acknowledge gate
- [ ] ERP fallback handling
- [ ] Re-validation at approval time
- [ ] Unit tests > 80%
- [ ] UAT: Officer sees correct stock warning when requesting > available stock
