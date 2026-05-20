---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Contractual Vendor Assignment (TDO – Vendor Fleet)"
story_points: 3
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

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TEVF-01-1 | Product rules — TO flag / filter for **contractual-eligible** TOs in TDO – Vendor Fleet UI (align tenant policy) | ~ | Pending |
| TEVF-01-2 | Assignment persistence — TO↔vendor link(s) with **capacity split** / multi-vendor rows; FK integrity vs `required_vehicle_count` | ~ | Pending |
| TEVF-01-3 | Contractual **rate resolution** service — read-only to vendor; source = rate tables / contract backend (no vendor edit endpoint) | ~ | Pending |
| TEVF-01-4 | TDO assign API — e.g. `POST /api/v1/tdo/transport-orders/{to_id}/contractual-assignments` with vendor allocation payload; guard **membership `vendor_type=CONTRACTUAL`** (VM-02) | ~ | Pending |
| TEVF-01-5 | Vendor portal + mobile — assigned TO detail **omits** rate fields; show operational context only (extends VM-03 visibility) | ~ | Pending |
| TEVF-01-6 | TO status transitions + audit — assign/reassign actor, timestamp, vendors, quantities | ~ | Pending |
| TEVF-01-7 | Handoff to execution — trigger VM-07 confirmation requirement + VM-08 status stream for assigned vendor | ~ | Pending |

## Implementation traceability

| Concern | Story / note |
|---------|--------------|
| Vendor marked contractual per tenant | VM-02 |
| Vendor portal lists + gating | VM-03 |
| Vendor sees assigned TO without rate | VM-03 + TEVF-01 serializers / mobile DTOs omit rate |
| Post-assignment vehicle/driver + documents | VM-07 |
| TO status visibility | VM-08 |

## Out of scope (Phase 1 clarification)

- Non-contractual **bidding** flows — use [TEVF-02](TEVF-02-non-contractual-bidding.md).
- **Platform** negotiation of contract rates — assumed maintained outside this sprint or via separate admin capability (document when introduced).
