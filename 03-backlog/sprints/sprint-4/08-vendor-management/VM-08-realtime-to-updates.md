---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Real-time TO Updates in Vendor Portal (Assigned/Completed/Closed)
epic: Vendor Portal & Operations
status: Pending
story_points: 5
assignee: ~
---

# VM-08 — Real-time TO Updates in Vendor Portal (Assigned/Completed/Closed)

## User Story

**As a** vendor  
**I want** real-time updates on my transport orders  
**So that** I can manage execution effectively

## Business Context

Vendor portal must reflect TO status changes to keep vendors aligned with operations. Vendors can observe status changes but must not be able to change TO status directly.

## Acceptance Criteria

### AC-1: Vendor Sees TO Status Changes
- [ ] Vendor portal shows TO status changes:
  - Assigned
  - Completed
  - Closed

### AC-2: Real-time Delivery
- [ ] System provides real-time TO updates to vendor portal (near-real-time acceptable if polling)

### AC-3: Vendor Cannot Modify TO Status
- [ ] Vendor SHALL not modify TO status directly

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL provide real-time TO updates to vendor portal.
- [ ] **[Critical]** Vendor SHALL not modify TO status directly.

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-08-1 | Vendor-scoped TO queryset — only TOs assigned/allotted to vendor via contractual path or bid award (VM-02/VM-06/TEVF-01) | ~ | **Done** |
| VM-08-2 | `GET /api/v1/vendor/transport-orders` + `GET .../{to_id}` — include status (`Assigned` / `Completed` / `Closed` per product enum) | ~ | **Done** |
| VM-08-3 | `GET .../updates?since=` — cursor / timestamp delta for **near-real-time** polling client | ~ | **Partial** |
| VM-08-4 | Optional **WebSocket/SSE** channel — push TO status change events to Vendor Mobile | ~ | **Not done** |
| VM-08-5 | Emit domain events on TO lifecycle transitions consumed by vendor channel | ~ | **Not done** |
| VM-08-6 | Authorisation — vendor **read-only** on status; reject mutating verbs on vendor TO status | ~ | **Not done** |
| VM-08-7 | Vendor Mobile — subscribe or poll strategy + in-app refresh on foreground | ~ | **Partial** |

## API Endpoints (suggested)

```
GET /api/v1/vendor/transport-orders
GET /api/v1/vendor/transport-orders/{to_id}
GET /api/v1/vendor/transport-orders/updates?since=...
```

## Dependencies

- **Requires**: TO lifecycle status source of truth; vendor-to-TO association.
- **Enables**: Operational transparency for vendors; reduces support queries.

## Definition of Done

- [ ] Vendors can see status updates for their TOs in near-real-time
- [ ] Vendors cannot change TO status (API + UI enforced)

