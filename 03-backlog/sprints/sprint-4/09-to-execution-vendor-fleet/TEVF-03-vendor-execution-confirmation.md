---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Vendor Execution & Confirmation"
version: "1.0"
phase: "Phase 1"
status: Draft
aligned_stories:
  - ../08-vendor-management/VM-07-vehicle-driver-submission.md
  - ../08-vendor-management/VM-08-realtime-to-updates.md
last_updated: 2026-05-12
---

# TEVF-03 — Vendor Execution & Confirmation

## User story

**As a** vendor  
**I want** to receive **TO / bid requirement** details and **confirm vehicle and driver assignment**  
**So that** I can **execute the trip** and submit **POD**, **GRN copy**, and **invoice** at the correct lifecycle points

## Business context

Execution handoff for **vendor-assigned** TOs is implemented in **[VM-07](../08-vendor-management/VM-07-vehicle-driver-submission.md)** (vehicle, driver, helper, documents, invoice gating). This TEVF is the **feature umbrella**; VM-07 remains the sprint backlog **source of truth** for fields and APIs.

## Acceptance criteria (product-aligned)

- [ ] **Vendor receives TO notification** — *product note:* comprehensive notification channels are **Phase 3**; Phase 1 uses **in-app / email** as per [08-vendor-management/README.md](../08-vendor-management/README.md) until the notification program lands.
- [ ] **Vendor assigns** for execution. Required vs optional fields:
  - **Mandatory:**
    - **Vehicle number**
    - **Driver name** and **driver phone number**
  - **Optional:**
    - **Driver NID/License** *(optional)*
    - **Helper details with NID** *(optional)*
  - Full field contract (validations, vehicle type/capacity match, update-with-reason) is owned by **[VM-07](../08-vendor-management/VM-07-vehicle-driver-submission.md)**.
- [ ] **After TO completion**, vendor may submit:
  - **POD**
  - **GRN copy**
  - **Invoice** — **only after** trip / TO completion (enforced in VM-08)

## Functional requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System **SHALL** notify winning / assigned vendors (in-app minimum in Phase 1; extend per notification roadmap). |
| **High** | System **SHALL** allow vendor to submit **POD**, **GRN**, and **invoice** subject to lifecycle rules. |

## Traceability

| Topic | Owner |
|-------|--------|
| Confirmation payload, updates with reason, POD/GRN/invoice | VM-08 |
| TO status visibility to vendor | VM-09 |
| Contractual rate hidden from vendor | TEVF-01 + VM-04 visibility |
