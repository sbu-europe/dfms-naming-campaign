---
section: 09-testing/backend/e2e-scenarios
title: E2E Testing Scenarios by Module Story Point
version: 1.1
last_updated: 2026-07-20
---

# 12 - E2E Testing

This section captures end-to-end testing scenarios aligned with module specifications and backlog story points.

## Purpose

- Define executable E2E scenarios before or alongside implementation.
- Ensure each module story point has scenario coverage.
- Align QA coverage with module-level business rules and API behavior.

## Structure

- `01-foundation/` — Auth / session scenarios.
- `02-master-data/` — Master Data module scenarios.
- `04-requisitions/` — Product / Transport Requisitions; Finished Goods workflow index under [`04-requisitions/finished-goods-workflow/`](./04-requisitions/finished-goods-workflow/).
- `05-transport/`, `06-yard-operations/`, `08-fleet-management/` — FG downstream scenario plans linked from the FG index.
- Additional module folders follow `05-modules` ordering.

## Finished Goods (Playwright MCP)

| Doc | Path |
|-----|------|
| Scenario index (§1–18) | [`04-requisitions/finished-goods-workflow/README.md`](./04-requisitions/finished-goods-workflow/README.md) |
| MCP runbook (run order, artifacts, OTP, wipe) | [`04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md`](./04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md) |
| Credentials | `docs/testing/playwright-mcp-credentials.yaml` |
| Generic MCP guide | `docs/guides/playwright-mcp-admin.md` |

Artifact root for RESULTS / screenshots: `tests/e2e/playwright-mcp/<suite>-artifacts/`.

## Scenario Planning Coverage Tracker

| Module | Story Points | Scenario Plan Status | Scenario File |
|--------|--------------|----------------------|---------------|
| Finished Goods Workflow (§1–18) | FG PR→TR→TO→yard | Planned | [`04-requisitions/finished-goods-workflow/README.md`](./04-requisitions/finished-goods-workflow/README.md) |
| Master Data - Supplier & Dealer Management | US-096, DFS-018 | Planned | [`02-master-data/supplier-dealer-management-e2e-scenarios.md`](./02-master-data/supplier-dealer-management-e2e-scenarios.md) |
| Users - User Invitation & Activation | US-005 | Planned | [`users/user-invitation-activation-e2e-scenarios.md`](./users/user-invitation-activation-e2e-scenarios.md) |
| Users - Account Deactivation | US-007 | Planned | [`users/account-deactivation-e2e-scenarios.md`](./users/account-deactivation-e2e-scenarios.md) |
| Foundation - Multi-Factor Auth | US-002 | Implemented | [`01-foundation/multi-factor-auth-us002-e2e-scenarios.md`](./01-foundation/multi-factor-auth-us002-e2e-scenarios.md) |
| Foundation - Session Control | US-003 | Implemented | [`01-foundation/session-control-us003-e2e-scenarios.md`](./01-foundation/session-control-us003-e2e-scenarios.md) |
| Foundation - User Login & Account Lockout | US-001 | Implemented | [`01-foundation/user-login-account-lockout-us001-e2e-scenarios.md`](./01-foundation/user-login-account-lockout-us001-e2e-scenarios.md) |

## Naming Convention

- File format: `<module-name>-e2e-scenarios.md`
- Scenario ID format: `E2E-<module>-<number>` (FG plans also use sequential `TC01`… with legacy IDs in Original ID map)
- Story mapping must include: Story ID, scenario objective, preconditions, steps, expected results.
