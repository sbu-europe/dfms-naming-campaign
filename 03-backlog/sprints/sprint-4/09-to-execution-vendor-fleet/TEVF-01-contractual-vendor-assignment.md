---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Contractual Vendor Assignment (TDO – Vendor Fleet)"
version: "1.0"
phase: "Phase 1"
status: Draft
aligned_stories:
  - ../08-vendor-management/VM-02-vendor-tenant-join-and-approval.md
  - ../08-vendor-management/VM-03-vendor-portal-views.md
  - ../08-vendor-management/VM-07-vehicle-driver-submission.md
  - ../08-vendor-management/VM-08-realtime-to-updates.md
last_updated: 2026-05-12
---

# TEVF-01 — Contractual Vendor Assignment

## User story

**As a** Transport Department Officer (**TDO – Vendor Fleet**)  
**I want** to assign a Transport Order (TO) to a **contractual** vendor according to my preference  
**So that** execution can proceed **without** a price-bid round, using **tenant-controlled contractual rates**

## Business context

**TO Execution – Vendor Fleet** splits into contractual vs non-contractual paths. This document covers the **contractual** branch only. Vendor eligibility as “contractual” for a tenant is set on **vendor ↔ tenant join approval** ([VM-02](../08-vendor-management/VM-02-vendor-tenant-join-and-approval.md)).

## Acceptance criteria (product-aligned)

- [ ] **TDO identifies TO as contractual-vendor eligible** (business rules / TO type / tenant policy — exact rule set TBD in design; flag or filter in TDO UI).
- [ ] **TDO assigns one or more contractual vendors against the TO** (capacity split / multi-vendor assignment rules as agreed in transport design).
- [ ] **Vendors do not submit price bids** for this path; contractual **rates apply automatically from backend** (rate tables / contracts — source of truth backend-controlled).
- [ ] **Contractual rates are system-controlled** (vendors cannot edit rate; TDO views per policy; **vendor portal hides rate** from contractual vendor view where required).
- [ ] **Assignment is audited** (who/when/which vendor/which TO).

## Functional requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System **SHALL** allow assignment of TOs to contractual vendors (TDO – Vendor Fleet). |
| **Critical** | System **SHALL** hide contractual **price rates** from the **contractual vendor** portal view (show assignment and operational context without exposing rate). |

## Implementation traceability

| Concern | Story / note |
|---------|--------------|
| Vendor marked contractual per tenant | VM-03 |
| Vendor sees assigned TO without rate | VM-04 visibility rules; extend with “hide rate” for contractual |
| Post-assignment vehicle/driver + documents | VM-08 |
| TO status visibility | VM-09 |

## Out of scope (Phase 1 clarification)

- Non-contractual **bidding** flows — use [TEVF-02](TEVF-02-non-contractual-bidding.md).
- **Platform** negotiation of contract rates — assumed maintained outside this sprint or via separate admin capability (document when introduced).
