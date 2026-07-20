# testing-plan — Test tooling & fixture implementation plans

Cross-cutting **implementation plans** for local/dev test tooling that span multiple domain modules (requisitions, transport, yard, fleet). Scenario cases themselves live under [`09-testing/`](../../09-testing/); this folder holds **how to build** seed/wipe and related harnesses in the backend repo.

## Contents

| File | Description |
|------|-------------|
| [mcp-playwright-fg-fixture-seed.md](./mcp-playwright-fg-fixture-seed.md) | Isolated Playwright MCP Finished Goods sandbox — **exact data catalog** (POIs, FG products, stock, LUPs, vehicle, MCP driver, UOP) + wipe (`MCP-S/D-<RUN_ID>`) |

## Related

| Doc | Path |
|-----|------|
| FG E2E scenario index | [`../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/README.md`](../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/README.md) |
| FG Playwright MCP runbook | [`../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md`](../../09-testing/backend/e2e-scenarios/04-requisitions/finished-goods-workflow/playwright-mcp-runbook.md) |
| MCP admin guide | [`../../../docs/guides/playwright-mcp-admin.md`](../../../docs/guides/playwright-mcp-admin.md) |
