---
section: 09-testing/backend/e2e-scenarios/09-tracking
title: GPS Tracking — E2E Scenario Plans
version: 1.0
last_updated: 2026-08-04
---

# GPS Tracking — E2E Scenarios

Playwright MCP scenario plans for the **Live GPS / GT06 tracking** admin surface (`/admin/tracking/live-gps/`).

**Credentials:** `docs/testing/playwright-mcp-credentials.yaml`  
**Generic MCP guide:** `docs/guides/playwright-mcp-admin.md`  
**Product context:** [`GPS-01 Live GPS`](../../../../03-backlog/sprints/sprint-5/12-gps-maps-dashboard/GPS-01-maps-dashboard-gps-tracking.md)

## Plans

| Plan | Scope | File |
|------|--------|------|
| Live GPS | Fleet, ⋮ menu (no Send command), History, FG served-TO history | [`live-gps-e2e-scenarios.md`](./live-gps-e2e-scenarios.md) |

## Artifacts

`tests/e2e/playwright-mcp/live-gps-artifacts/`

## Wipe

Use MCP-prefixed vehicles/IMEIs only. For Part D (FG chain): `make wipe-mcp-fg RUN_ID=…`. Never delete `@yopmail.com` seed logins.
