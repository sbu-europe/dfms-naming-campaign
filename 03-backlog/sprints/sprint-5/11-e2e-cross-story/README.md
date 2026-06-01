---
title: Sprint 5 — Cross-Story E2E Coverage Index
sprint: Sprint 5
scope: cross-epic end-to-end scripted journeys
owner: QA Lead
---

# Cross-Story E2E — Sprint 5

This folder tracks **scripted journeys that cross multiple story boundaries**. Each journey validates that independently implemented stories function correctly when connected in sequence — catching the integration gaps that story-level E2E sub-tasks cannot.

Story-level E2E sub-tasks (DS-01-19, TLS-01-11, etc.) remain **owned by each story's developer** and are tracked in the individual story files. This folder is owned by the **QA Lead** and focuses only on multi-story journeys.

---

## Journey Index

| Journey | File | Stories Involved | Feedback Items | Status |
|---------|------|-----------------|----------------|--------|
| E2E-01 — TO State Sequence | [E2E-01-to-state-sequence.md](E2E-01-to-state-sequence.md) | DS-01 → DM-01 → TLS-01 | FB-004 | Pending |
| E2E-02 — Yard Execution Chain | [E2E-02-yard-execution-chain.md](E2E-02-yard-execution-chain.md) | GT-01 → SC-01 → CC-01 → LD-01 → QC-01 → POD-01 | FB-001, FB-005, FB-006 | Pending |
| E2E-03 — On-Demand TO QC Flow | [E2E-03-on-demand-to-qc-flow.md](E2E-03-on-demand-to-qc-flow.md) | GT-02 → LD-01 → QC-01 → CC-01 | FB-001, FB-006, FB-007 | Pending |
| E2E-04 — Vendor Bidding Journey | [E2E-04-vendor-bidding-journey.md](E2E-04-vendor-bidding-journey.md) | VM-01 → VM-02 → VM-04 → VM-05 → VM-06 → VM-07 → TEVF-01/02/03 | FB-013, FB-015, FB-016, FB-018 | Pending |

---

## What Is NOT in This Folder

- Story-level E2E sub-tasks (DS-01-19, SC-01-14, etc.) — tracked inside each story's `Sub-tasks` table
- Unit tests — tracked in individual story DoD checklists
- UAT sign-off — a separate UAT log will be created at sprint close

---

## Definition of Done for Cross-Story E2E

A journey is **Done** when:
1. All steps in the scripted path execute without error on the staging environment
2. TLS-01 timeline reflects every expected event in order
3. No regressions observed in adjacent story flows (verified by running neighboring story-level E2E sub-tasks before and after)
4. QA Lead marks status `Pass` in this index

---

*Owner: QA Lead | Sprint: 5 | Last Updated: 2026-06-01*
