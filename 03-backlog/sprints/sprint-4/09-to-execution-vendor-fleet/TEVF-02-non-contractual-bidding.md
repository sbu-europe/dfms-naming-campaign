---
jira_key: ~
jira_type: Feature-context
jira_sprint: "Sprint 4"
title: "Non-Contractual Vendor (Bidding Workflow)"
story_points: 3
version: "1.0"
phase: "Phase 1"
status: Draft
aligned_stories:
  - ../08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md
  - ../08-vendor-management/VM-05-bid-submission.md
  - ../08-vendor-management/VM-06-bid-evaluation.md
last_updated: 2026-05-12
---

# TEVF-02 — Non-Contractual Bidding

## User story

**As a** Transport Department Officer (**TDO – Vendor Fleet**)  
**I want** to initiate **vendor bidding** for TOs  
**So that** competitive rates and vehicle availability can be obtained from **non-contractual** vendors

## Business context

Non-contractual vendors (**VM-02** membership type) participate via a **published bidding session** ([VM-04](../08-vendor-management/VM-04-tdo-publish-to-bidding-portal.md)), submit structured bids ([VM-05](../08-vendor-management/VM-05-bid-submission.md)), and are selected by TDO ([VM-06](../08-vendor-management/VM-06-bid-evaluation.md)).

## Acceptance criteria (product-aligned)

- [ ] **TDO publishes** bidding requirements including: **required number of vehicles**, **vehicle type**, and **optional reference rate** (guidance only) for bidding.
- [ ] **Vendors receive** bid notification on the **vendor portal** (full multi-channel notifications per product roadmap; **Phase 3** for notification subsystem depth — see [TEVF-03](TEVF-03-vendor-execution-confirmation.md)).
- [ ] **TDO can select winner(s)** — including **multiple winning vendors** when the TO / capacity model requires split award (VM-06 implements selection rules).
- [ ] **TDO assigns TOs** (or capacity slices) **to winning vendors** after decision.
- [ ] **TDO collects** vendor **offered rate** and **number of vehicles offered** after vendors submit bids.
- [ ] **TDO can close** an open bid with controlled **open and close time** and controlled vendor selection workflow.
- [ ] **TDO can view** submitted **price** and **vehicle count** per vendor bid.
- [ ] **System records bid timestamp** on each submission (immutable record).
- [ ] **Bidding window is configurable** (within policy min/max — see VM-04).
- [ ] **TDO can only update the bidding window timeline** (open and/or close **date + time**) during an active bidding session. **All other published parameters are immutable post-publish** — `required_vehicle_count`, `required_vehicle_type`, `required_capacity`, `reference_rate`, eligibility filters. Any other change requires **cancel-and-republish** (see VM-04).
- [ ] **Bids cannot be edited after submission** (corrections = withdraw-if-policy + resubmit before close, or new bid version disallowed — **default Phase 1: no PATCH after submit**; see VM-05).
- [ ] **Vendor selection is final once approved** (award approval locks selection; audit log).

## Functional requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System **SHALL** support bidding for non-contractual vendors. |
| **Critical** | Vendor **SHALL** submit **price** and **vehicle count** (capacity offered) for the bid. |
| **Critical** | System **SHALL** restrict TDO post-publish edits to the **bidding window timeline (open and/or close date+time)** only. All other publish parameters **SHALL** be immutable post-publish; any other change requires **cancel + republish**. |
| **High** | System **SHALL** allow TDO to select **winning vendor(s)** per operational preference (including multi-vendor outcomes where supported). |

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| TEVF-02-1 | **Publish** — VM-04: session create, TO → open bidding, immutable non-timeline params, deadline policy, eligibility (join + non-contractual) | ~ | Pending |
| TEVF-02-2 | **Window lifecycle** — VM-04: `PATCH` timeline-only rules, shrink/extend limits, auto-close scheduler, cancel + republish path | ~ | Pending |
| TEVF-02-3 | **Vendor bid** — VM-05: structured payload (rate + `offered_vehicle_count`), immutability, window enforcement, optional withdraw, TDO notifications | ~ | Pending |
| TEVF-02-4 | **Evaluation & award** — VM-06: compare/sort, multi-vendor award math, winning log, reject-all, terminal bid states | ~ | Pending |
| TEVF-02-5 | **Notifications & audit** — publish/close/award/reject-all events; bid timestamp evidence chain | ~ | Pending |
| TEVF-02-6 | **Execution handoff** — post-award vendor sees outcome + enters VM-07 / VM-08 tracks (TEVF-03 umbrella) | ~ | Pending |
| TEVF-02-7 | **E2E validation** — scripted journey publish → N bids → window update → award/reject-all; align with [TESTING-FLOW.md](TESTING-FLOW.md) | ~ | Pending |

## Traceability to VM stories

| Capability / need | VM story |
|-------------------|----------|
| Publish requirements + window + notify | VM-05 (extend body with **required vehicle count**, optional reference rate) |
| Bid payload: rate + vehicle count; timestamp; no post-submit edit | VM-06 |
| Compare, approve, multi-winner, assign, finalization | VM-07 |

## Definition of done (feature-context level)

- End-to-end: publish → bid(s) with rate + vehicle count + timestamp → TDO review → **approved** winner set → vendor sees outcome → handoff to [TEVF-03](TEVF-03-vendor-execution-confirmation.md) / VM-08.
