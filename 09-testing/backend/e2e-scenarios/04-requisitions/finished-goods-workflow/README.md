---
section: 09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow
title: Finished Goods Workflow — E2E Scenario Plans
version: 1.0
last_updated: 2026-07-20
---

# Finished Goods Workflow — E2E Scenarios

End-to-end scenario plans for the Finished Goods (FG) requisition-to-delivery workflow, grouped by workflow section. Each section folder maps to a PRD / test-suite section and is targeted at **Playwright MCP** against Django Admin SSR unless noted otherwise.

## Sections

| Section | Folder | Actors | Scenario plan |
|---------|--------|--------|---------------|
| 1 — Product Requisition (PR) Creation | [`01-pr-creation/`](./01-pr-creation/) | Depot Officer, Feed Mill Officer | [`fg-depot-feed-mill-officer-product-requisition-pr-creation-e2e-scenarios.md`](./01-pr-creation/fg-depot-feed-mill-officer-product-requisition-pr-creation-e2e-scenarios.md) |

Additional FG workflow sections (Distribution TR, Transport Order, yard operations, etc.) remain in sibling module folders (`04-requisitions/`, `05-transport/`, `06-yard-operations/`) until migrated here.

## Naming convention

- Section folder: `NN-<short-name>/` (e.g. `01-pr-creation/`)
- File: `fg-<actor(s)>-<feature>-e2e-scenarios.md`
- Internal IDs: `TC01`, `TC02`, … with legacy spreadsheet IDs preserved in **Original ID map** inside each plan.
