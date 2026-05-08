---
section: 09-testing/backend/e2e-scenarios
title: E2E Testing Scenarios by Module Story Point
version: 1.0
last_updated: 2026-04-20
---

# 12 - E2E Testing

This section captures end-to-end testing scenarios aligned with module specifications and backlog story points.

## Purpose

- Define executable E2E scenarios before or alongside implementation.
- Ensure each module story point has scenario coverage.
- Align QA coverage with module-level business rules and API behavior.

## Structure

- `02-master-data/` - Master Data module scenarios.
- Additional module folders should be added following `05-modules` ordering.

## Scenario Planning Coverage Tracker

| Module | Story Points | Scenario Plan Status | Scenario File |
|--------|--------------|----------------------|---------------|
| Master Data - Supplier & Dealer Management | US-096, DFS-018 | Planned | [`02-master-data/supplier-dealer-management-e2e-scenarios.md`](./02-master-data/supplier-dealer-management-e2e-scenarios.md) |
| Users - User Invitation & Activation | US-005 | Planned | [`users/user-invitation-activation-e2e-scenarios.md`](./users/user-invitation-activation-e2e-scenarios.md) |
| Users - Account Deactivation | US-007 | Planned | [`users/account-deactivation-e2e-scenarios.md`](./users/account-deactivation-e2e-scenarios.md) |
| Foundation - Multi-Factor Auth | US-002 | Implemented | [`01-foundation/multi-factor-auth-us002-e2e-scenarios.md`](./01-foundation/multi-factor-auth-us002-e2e-scenarios.md) |
| Foundation - Session Control | US-003 | Implemented | [`01-foundation/session-control-us003-e2e-scenarios.md`](./01-foundation/session-control-us003-e2e-scenarios.md) |
| Foundation - User Login & Account Lockout | US-001 | Implemented | [`01-foundation/user-login-account-lockout-us001-e2e-scenarios.md`](./01-foundation/user-login-account-lockout-us001-e2e-scenarios.md) |

## Naming Convention

- File format: `<module-name>-e2e-scenarios.md`
- Scenario ID format: `E2E-<module>-<number>`
- Story mapping must include: Story ID, scenario objective, preconditions, steps, expected results.
