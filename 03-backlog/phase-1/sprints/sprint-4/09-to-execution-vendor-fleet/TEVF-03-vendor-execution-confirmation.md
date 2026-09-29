---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Vendor Execution & Confirmation"
story_points: 3
version: "1.0"
phase: "Phase 1"
status: In Progress
aligned_stories:
  - ../08-vendor-management/VM-07-vehicle-driver-submission.md
  - ../08-vendor-management/VM-08-realtime-to-updates.md
last_updated: 2026-05-25
---

# TEVF-03 — Vendor Execution & Confirmation

## User story

**As a** vendor  
**I want** to receive **TO / bid requirement** details and **confirm vehicle and driver assignment**  
**So that** I can **execute the trip** and submit **POD**, **GRN copy**, and **invoice** at the correct lifecycle points

## Business context

Execution handoff for **vendor-assigned** TOs is implemented in **[VM-07](../08-vendor-management/VM-07-vehicle-driver-submission.md)** (vehicle, driver, helper, documents, invoice gating). This TEVF is the **feature umbrella**; VM-07 remains the sprint backlog **source of truth** for fields and APIs.

## Acceptance Criteria

### AC-1: Vendor TO Notification (Assigned / Awarded)

- [ ] Assigned or winning vendor receives **TO / bid requirement** notification
- [ ] Phase 1: **in-app** (+ email where wired) per [08-vendor-management/README.md](../08-vendor-management/README.md)
- [ ] Comprehensive multi-channel notifications deferred to **Phase 3** (notification program)

### AC-2: Vehicle and Driver Assignment (Execution Confirmation — VM-07)

- [ ] Vendor can confirm execution by assigning vehicle and driver details:
  - **Mandatory:**
    - **Vehicle number**
    - **Driver name** and **driver phone number**
  - **Optional:**
    - **Driver NID/License**
    - **Helper details with NID**
- [ ] Full field contract (validations, vehicle type/capacity match, update-with-reason, trip-start gate) is owned by **[VM-07](../08-vendor-management/VM-07-vehicle-driver-submission.md)**

### AC-3: Post-Completion Document Upload (POD, GRN, Invoice — VM-07)

- [ ] Vendor can upload the following **only after** trip/TO reaches `COMPLETED`:
  - **POD** (vendor record-copy)
  - **GRN copy**
  - **Invoice**
- [ ] Server **MUST** reject uploads of any of these three document types before the TO reaches `COMPLETED`
- [ ] **Driver-side POD** (DM-01 / POD-01) is a separate artifact captured by the driver at closure and gates **TO closure**; vendor POD here is a **record-copy after** the TO is already `COMPLETED`

### AC-4: TO Status Visibility (VM-08)

- [ ] Vendor can see TO status updates (e.g. Assigned / Completed / Closed) via vendor portal list and realtime/polling path (VM-08)

### AC-5: Contractual Rate Not Exposed on Execution Surfaces (TEVF-01)

- [ ] Vendor assignment and execution UI **does not** expose resolved contractual rate on the contractual path (TEVF-01 + VM-03)

## Functional requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System **SHALL** notify winning / assigned vendors (in-app minimum in Phase 1; extend per notification roadmap). |
| **Critical** | System **SHALL** allow vendor to submit **POD**, **GRN**, and **Invoice only after the trip/TO has reached `COMPLETED`**; uploads of any of the three before that state MUST be rejected (per VM-07). |

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TEVF-03-1 | **VM-07** — requirement surface + `POST` / `PATCH` vehicle–driver confirmation; trip-start gate; substitution visibility | ~ | **Done** |
| TEVF-03-2 | **VM-08** — vendor TO list + delta / `since` polling or push; statuses Assigned / Completed / Closed | ~ | **Done** |
| TEVF-03-3 | **Contractual path** — ensure vendor assignment UI never exposes resolved contractual rate (TEVF-01 + VM-03) | ~ | Pending |
| TEVF-03-4 | **Vendor portal TO lifecycle** — lifecycle screens + tab-change refresh (VM-03-9, VM-03-10, VM-08-4) | ~ | Pending |
| TEVF-03-5 | E2E test coverage — validate vendor execution confirmation, contractual / non-contractual handoffs, lifecycle refresh, and completed-trip visibility in next sprint | ~ | **Pending** |

## Traceability

| Topic | Owner |
|-------|--------|
| Confirmation payload, updates with reason, POD/GRN/invoice | VM-07 |
| TO status visibility to vendor | VM-08 |
| Contractual rate hidden from vendor | TEVF-01 + VM-03 visibility |
