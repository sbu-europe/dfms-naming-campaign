---
jira_key: DFS-046
jira_type: Story
jira_epic: DFS-046
jira_sprint: "Sprint 4"
story_id: US-025
title: Trip Closure with Proof of Delivery (POD)
epic: Trip Closure & Tracking
status: Pending
story_points: 8
assignee: ~
spec_file: ../../../../stories/US-025-trip-closure-pod.md
---

# TC-02 — Trip Closure with Proof of Delivery (POD)

## User Story

**As a** Delivery Officer / Planner  
**I want to** close a trip by capturing Proof of Delivery (POD) and finalising delivery records  
**So that** the delivery is formally acknowledged, the TR is marked fulfilled, and billing/costing can proceed

## Business Context

POD is the authoritative evidence that goods arrived and were accepted at the destination. Without POD, the trip cannot move to `Completed`, the TR cannot be marked `Fulfilled`, and invoicing to client / payment to vendor cannot be initiated. This story covers POD capture (digital signature, photos, receiver details) and formal trip closure.

## Acceptance Criteria

### AC-1: POD Capture
- [ ] Delivery officer records POD at destination after unloading is complete
- [ ] POD must include:
  - Receiver name
  - Receiver designation / company
  - Digital signature (drawn on mobile or web)
  - Delivery timestamp (auto-stamped)
  - Delivered quantity (confirmed, may differ from TO if partial — links to TC-01)
  - POD photos (challan / delivery note, up to 5)
- [ ] POD number auto-generated: `POD-YYYYMMDD-XXXX`

### AC-2: POD Validation
- [ ] Delivered quantity must be ≤ TO quantity
- [ ] If delivered quantity < TO quantity without prior TC-01 partial delivery record → system prompts to create partial delivery first
- [ ] POD cannot be submitted without receiver signature

### AC-3: Trip Closure
- [ ] On successful POD submission, trip transitions: `Gate-Out Destination → Delivery Confirmed`
- [ ] TO status → `Delivered`
- [ ] TR delivery tally updated; if all TOs delivered → TR → `Fulfilled`
- [ ] Vehicle status → `Returning` (if own fleet), Driver status remains `On Trip` until `Returned`

### AC-4: POD Document Generation
- [ ] System generates a PDF POD document containing:
  - Trip reference, TO reference, TR reference
  - Vehicle, driver, route
  - Delivered quantity, receiver details, signature
  - Delivery timestamp
- [ ] PDF stored and downloadable from trip detail page
- [ ] PDF emailed to: Delivery Officer, Planner, Client (if configured)

### AC-5: Rejection at Destination
- [ ] Delivery officer can mark delivery as `Rejected at Destination`
- [ ] Reason required (enum + notes): Wrong Product, Damaged, Over/Under Quantity, Rejected by Receiver, Other
- [ ] Trip enters `Delivery Rejected` state
- [ ] Planner notified; re-planning or return journey initiated

### AC-6: Audit Trail
- [ ] POD submission, trip closure, and any rejection — all logged with actor + timestamp

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TC-02-1 | POD model — trip FK, TO FK, receiver_name, signature_file, delivered_qty, photos, pod_number | DFS-046-1 | Pending |
| TC-02-2 | POD creation API (POST /trips/{id}/pod) with validation | DFS-046-2 | Pending |
| TC-02-3 | POD number auto-generation: `POD-YYYYMMDD-XXXX` | DFS-046-3 | Pending |
| TC-02-4 | Trip closure on POD — state transition to `Delivery Confirmed`, TO → Delivered, TR → Fulfilled | DFS-046-4 | Pending |
| TC-02-5 | PDF POD document generation (WeasyPrint / ReportLab) + S3 storage | DFS-046-5 | Pending |
| TC-02-6 | PDF email dispatch (Celery task) to configured recipients | DFS-046-6 | Pending |
| TC-02-7 | Delivery rejection API (POST /trips/{id}/reject-delivery) | DFS-046-7 | Pending |
| TC-02-8 | POD capture UI — signature pad, photo upload, receiver details form | DFS-046-8 | Pending |

## API Endpoints

```
POST  /api/v1/trips/{id}/pod
Body: { receiver_name, receiver_designation, signature_file_id, delivered_qty, photo_ids, notes }
Response: 201 + POD object + PDF URL

GET   /api/v1/trips/{id}/pod
GET   /api/v1/pods/{pod_id}/download  → PDF file

POST  /api/v1/trips/{id}/reject-delivery
Body: { reason_code, reason_notes }
```

## Dependencies

- **Requires**: TE-02 (Trip state `Unloaded` / `Gate-Out Destination`), TC-01 (Partial delivery handled before POD if applicable)
- **Enables**: Sprint 15 Financial (TC-02 `Delivered` status triggers cost calculation)

## Definition of Done

- [ ] POD capture with signature and photos
- [ ] PDF POD generation and email dispatch
- [ ] Trip → TO → TR status chain updated on POD
- [ ] Rejection at destination with re-planning trigger
- [ ] Unit tests > 80%
- [ ] UAT: Delivery officer captures POD → PDF generated → emailed → TR marked Fulfilled
