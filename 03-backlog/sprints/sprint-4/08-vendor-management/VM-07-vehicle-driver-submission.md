---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Bid/TO requirement visibility + vehicle–driver confirmation (+ updates, audit)
prd_context:
  - ../../09-to-execution-vendor-fleet/TEVF-03-vendor-execution-confirmation.md
epic: Vendor Portal & Operations
status: Pending
story_points: 8
assignee: ~
---

# VM-07 — Bid/TO requirement visibility + vehicle–driver confirmation (+ updates, audit)

## User Story

**As a** vendor  
**I want to** receive bid requirement details and confirm vehicle and driver assignment  
**So that** I can execute the trip

## Business Context

After a vendor **wins a bid** (non-contractual) or **receives assignment** (contractual), they must **see the relevant requirement context** for that Transport Order (TO)—at minimum what was published or agreed (e.g. route, vehicle type/capacity expectations from **VM-04** / TO data)—then **confirm** concrete vehicle, driver, and helper execution details before trip start. That confirmation is the operational handoff for dispatch readiness. Later changes stay controlled via **audit trail** and **reason**.

## Phase 1 Simplification (no vendor fleet/driver master data)

In Phase 1, vendors do **not** pre-create vehicles/drivers in a profile. Instead, after award/assignment the vendor **confirms** execution resources as a **one-off capture** against the specific TO, aligned to visible TO/bid requirements. This confirmed data is what Transport/TDO uses for dispatch readiness.

## Acceptance Criteria

### AC-1: Requirements visible + confirmation required (before trip start)
- [ ] Vendor can view **TO/bid-aligned requirement details** for the awarded/assigned TO (at minimum: data needed to know what they are confirming against—vehicle type/capacity expectations, route/slot context as available from publish/TO)
- [ ] System requires a **confirmed** vehicle/driver/helper capture after award/assignment and **before** trip start (no trip start without it)

### AC-2: Fields & documents (vendor)
- [ ] **On confirmation (before trip start),** vendor provides the following fields. Mandatory vs optional is enforced server-side:
  - **Mandatory:**
    - Vehicle number
    - Vehicle type (must match TO required vehicle type — AC-2 validation)
    - Vehicle capacity (must be ≥ TO required capacity — AC-2 validation)
    - Driver name
    - Driver contact information (phone)
  - **Optional:**
    - **Driver NID/License** *(optional — may be left blank at confirmation; can be added later via the update flow in AC-3)*
    - **Helper details with NID** *(optional — zero or more helpers; each helper, if provided, captures name + NID)*
- [ ] **All three vendor-uploaded artifacts (POD, GRN copy, Invoice) are gated to "after trip/TO is Completed"**. Server **MUST block** uploads of all three before the TO reaches the `COMPLETED` (or product-defined terminal "completed") state. Each is uploadable independently after that.
  - [ ] **POD** — Proof of Delivery (vendor copy): vendor uploads POD artifact (file/image; formats/limits TBD) **only after** trip/TO is **Completed**. Required when TO/tenant policy mandates a POD upload from the vendor (presence/absence is a tenant-policy concern; gating is unconditional).
  - [ ] **GRN copy** — Goods Receipt Note copy: vendor uploads GRN document (file/image) **only after** trip/TO is **Completed**. Required when applicable to the delivery flow.
  - [ ] **Invoice** — vendor uploads invoice **only after** trip/TO is **Completed**.

> **Driver-side POD (DM-01 / POD-01) is a separate artifact** captured by the driver inside their own mobile app at closure — that flow gates TO closure. This AC governs the **vendor's** record-copy upload from the Vendor Mobile app, which happens after the TO is already Completed.

### AC-3: Update/Change with Reason + Audit Trail
- [x] Vendor can update vehicle and driver details with **audit trail**
- [x] Vendor can edit vehicle/driver information in case of accidents or uncertain conditions against the same TO
- [x] Updates require a **reason** and are logged (who/when/what changed)

### AC-4: Substitution Visibility
- [ ] Vendor substitution requires **Transport Department visibility** (at least an internal event/log/notification)

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL surface TO/bid-aligned requirement context to the vendor for the awarded/assigned TO and SHALL require **confirmed** vehicle/driver/helper capture after award/assignment and before trip start.
- [x] **[Critical]** System SHALL allow update with reasoning of driver and vehicle information with audit trails.
- [x] **[Critical]** System SHALL allow vendor uploads of **POD, GRN copy, and Invoice only when the trip/TO has reached `COMPLETED`** (or equivalent terminal state). Uploads of any of these MUST be rejected before that state regardless of TO/tenant policy.
- [ ] **[High]** System SHALL still apply per-document tenant-policy rules (e.g. whether POD/GRN are required versus optional artifacts) on top of the Completed gate.

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-07-1 | `GET` requirement context for TO — merge TO + publish params (VM-04) visible to assigned/winner vendor only | ~ | **Partial** |
| VM-07-2 | Trip-start gate — block dispatch/start until vehicle–driver **confirmation** record exists | ~ | **Partial** |
| VM-07-3 | `POST .../vehicle-driver` — mandatory fields + **vehicle type match** + **capacity ≥ TO requirement**; optional helper list + optional driver NID | ~ | **Partial** |
| VM-07-4 | `PATCH .../vehicle-driver` — reason required; field-level audit (who/when/old→new) | ~ | **Done** |
| VM-07-5 | Internal event/notification — **substitution** visible to Transport (per AC-4) | ~ | **Not done** |
| VM-07-6 | `POST .../documents` — multipart `doc_type`: `POD` \| `GRN_COPY` \| `INVOICE`; **409 if TO status ≠ `COMPLETED`** for all three types | ~ | **Done** |
| VM-07-7 | Tenant policy hooks — after Completed gate, enforce required-vs-optional per doc type | ~ | **Not done** |
| VM-07-8 | Vendor Mobile — confirmation form, update-with-reason flow, post-Completed uploads | ~ | **Done** |

## API Endpoints (suggested)

```
POST  /api/v1/vendor/transport-orders/{to_id}/vehicle-driver
PATCH /api/v1/vendor/transport-orders/{to_id}/vehicle-driver   Body: { ..., reason }

// Vendor document uploads — ALL THREE doc types gated to to_status = COMPLETED server-side.
POST  /api/v1/vendor/transport-orders/{to_id}/documents        Body: multipart; doc_type: POD | GRN_COPY | INVOICE
  // Returns 409 if to_status != COMPLETED (or equivalent terminal "completed" state), regardless of doc_type.
```

## Dependencies

- **Requires**: VM-06 award decision (or contractual assignment trigger), TO/bid publication data (**VM-04** / TO domain), transport order/trip entity, file storage for uploads, authoritative trip/TO status for invoice gating.
- **Enables**: Trip execution readiness; transport ops can proceed with dispatch/trip lifecycle.

## Definition of Done

- [ ] Winning vendor cannot start trip until requirement context is available and vehicle/driver/helper **confirmation** is recorded
- [x] Updates require reason and produce audit logs
- [x] **POD, GRN copy, and Invoice uploads are all blocked until the trip/TO reaches `COMPLETED`** (server-enforced for all three doc types); once Completed, each can be uploaded independently subject to tenant-policy requirements

