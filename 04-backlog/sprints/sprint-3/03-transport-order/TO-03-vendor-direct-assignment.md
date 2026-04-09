---
jira_key: DFS-041
jira_type: Story
jira_epic: DFS-042
jira_sprint: "Sprint 3"
story_id: US-019
title: Transport Order — Vendor Fleet Direct Assignment
epic: Transport Order
status: Pending
story_points: 5
assignee: ~
spec_file: ../../../../stories/US-019-to-execution-vendor-direct.md
---

# TO-03 — Transport Order: Vendor Fleet Direct Assignment

## User Story

**As a** TDO (Vendor Fleet)  
**I want to** directly assign a Transport Order to a contractual vendor without going through a bidding process  
**So that** pre-agreed vendor relationships can be executed quickly and predictably

## Business Context

For **Contractual vendors** (from MDM-03) — vendors with pre-agreed rates and direct assignment eligibility. Non-contractual vendor assignment via bidding (US-024) is a later sprint.

**Two vendor assignment methods** in the platform:
1. **Direct Assignment** (this story) — fast path for trusted, contracted vendors
2. **Bidding** (Sprint 5+) — competitive process for non-contractual vendors

## Acceptance Criteria

### AC-1: Contractual Vendor Selection
- [ ] TDO selects a vendor from active Contractual vendors (MDM-03, vendor_type = CONTRACTUAL)
- [ ] Vendor list shows: Company Name, Fleet Info, Contact, Pre-agreed rate card if available
- [ ] Only Active vendors are shown

### AC-2: Vendor Vehicle & Driver Assignment
- [ ] TDO can specify the vendor's vehicle registration and driver name
- [ ] Vendor vehicle details may be entered manually (vendor manages their own fleet records)
- [ ] Or link to vendor fleet records if vendor has registered vehicles in MDM-03

### AC-3: Rate & Cost Recording
- [ ] TDO enters agreed rate for this TO (per trip or per ton, based on contract)
- [ ] Estimated cost calculated from rate + quantity/distance
- [ ] Rate and cost stored on TO for future payment reconciliation (US-029)

### AC-4: TO Dispatch to Vendor
- [ ] TO status → `Assigned to Vendor` → `Dispatched`
- [ ] Vendor notified (in-app / SMS / email — configurable)
- [ ] TO detail shows: Vendor name, assigned vehicle, driver, agreed rate

### AC-5: Vendor Acceptance (Optional for Sprint 3)
- [ ] Vendor can acknowledge TO assignment (marks TO as `Vendor Confirmed`)
- [ ] If not acknowledged within SLA window, alert raised for TDO

### AC-6: Audit
- [ ] All assignment, dispatch, and rate-entry actions audit logged

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TO-03-1 | Vendor assignment API (PATCH /transport-orders/{to_id}/vendor) — vendor_id, vehicle, driver, rate | DFS-041-1 | Pending |
| TO-03-2 | Contractual vendor filter (vendor_type = CONTRACTUAL, status = ACTIVE) | DFS-041-2 | Pending |
| TO-03-3 | Rate and estimated cost recording on TO | DFS-041-3 | Pending |
| TO-03-4 | Dispatch API for vendor TOs — status → DISPATCHED, vendor notification | DFS-041-4 | Pending |
| TO-03-5 | Vendor notification on assignment (in-app + email) | DFS-041-5 | Pending |
| TO-03-6 | Vendor TO assignment UI — vendor picker, vehicle/driver fields, rate input | DFS-041-6 | Pending |

## API Endpoints

```
PATCH  /api/v1/transport-orders/{to_id}/vendor
Body: { vendor_id, vehicle_registration, driver_name, agreed_rate, rate_type }
POST   /api/v1/transport-orders/{to_id}/dispatch
```

## Dependencies

- **Requires**: TO-01 (confirmed TO with fleet_type = VENDOR), MDM-03 (Vendor Master)
- **Enables**: Vendor payment tracking (US-029, later sprint)

## Definition of Done

- [ ] Contractual vendor assignment with rate recording
- [ ] Dispatch workflow with vendor notification
- [ ] TO status correctly tracks vendor assignment lifecycle
- [ ] Audit logging on all actions
- [ ] Unit tests > 80%
- [ ] UAT: TDO assigns TO to contractual vendor and dispatches
