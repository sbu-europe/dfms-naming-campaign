---
module: 01-foundation
specification: Role Hierarchy (US-004) - Playwright E2E Implementation Plan
version: 1.0
phase: Phase 1
related_stories: US-004
source_spec: ../../03-module-specifications/01-foundation/rbac.md
test_implementation_reference: ../../../tests/e2e/modules/test_rbac_role_hierarchy_e2e.py
last_updated: 2026-04-24
---

# US-004 Role Hierarchy - Playwright E2E Implementation Plan

This document tracks the **implemented** Playwright E2E coverage for the US-004 role hierarchy / RBAC admin workflows.

## Test Cases (Aligned with Implemented Playwright E2E)

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Invite user + assign role via Users admin (single-role UX) | From `Users → Add user`, create an invited user, select a predefined role from the dropdown (no free-text), verify department is auto-derived from role, and verify the created user appears in Users changelist. | P0 | Implemented (Pass) |
| TC02 | Change existing user role and verify persistence | Open the created user from changelist, change the role via the `Role` dropdown, save, and verify the changelist reflects the updated role assignment. | P0 | Implemented (Pass) |

## What This Automation Validates (US-004 alignment)

- **Role catalog enforcement (predefined roles)**: Role selection is dropdown-driven; tests do not rely on role-name string checks in code, only UI outcomes.
- **Department derivation**: Department is derived from `Role.department` and submitted as a hidden field in invitation flow.
- **Single-role assignment behavior**: The user ends up with one effective operational role in the admin UX and is visible in the Users list.

## Implementation Notes

- Automated suite: `tests/e2e/modules/test_rbac_role_hierarchy_e2e.py`
- Test data is generated dynamically to avoid collisions in shared environments.
- Admin UI actions use resilient interactions (DOM form submit + keyboard search) to reduce flakiness under debug toolbar overlays.

