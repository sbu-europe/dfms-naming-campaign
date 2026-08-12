---
module: 06-yard-operations
specification: Finished Goods Workflow — Section 7 — Gate In (Source POI) — Playwright E2E Scenario Plan
version: 1.0
phase: Phase 1
related_stories: GT-01, FB-004
source_spec: ../../../../../05-modules/06-yard-operations/gate-operations.md
last_updated: 2026-08-11
last_mcp_run: 2026-08-11
last_mcp_verdict: 5/5 Pass · 3 Planned
artifacts: tests/e2e/playwright-mcp/07-12-source-yard-artifacts/
playwright_mcp: true
---

# Finished Goods Workflow — Section 7 — Gate In (Source POI) — E2E Scenario Plan (Django Admin SSR)

**Last MCP run:** 2026-08-11 · **5/5 Pass · 3 Planned** · `RUN_ID=BE16C49E`  
**Artifacts:** [`../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md`](../../../../../../tests/e2e/playwright-mcp/07-12-source-yard-artifacts/RESULTS.md)  
**Accounts:** `gateman1.nourish@yopmail.com` @ MCP-S-BE16C49E.

### MCP run history

| Date | Pass / Total | Notes |
|------|--------------|-------|
| 2026-08-11 | **5/5** | Source Gate-In happy path + RBAC 403. Premature/mismatch/blank Planned. |


**Navigation:** Gate → **Vehicle Entry (Gate-In)** → Add (`/admin/operations/gatein/add/`)

Scope: **Gateman** (source POI) recording gate-in for FG outbound TO in **Driving Towards Source**.

| Test Case ID | Test Scenario | Test Description | Priority | Status |
|--------------|---------------|------------------|----------|--------|
| TC01 | Gateman records Gate-In at source | TO **Driving Towards Source** at source POI. As **Gateman** (`gateman1@yopmail.com`, working site = source POI), open **Gate → Vehicle Entry (Gate-In) → Add**. Select TO via autocomplete, complete mandatory fields (`gate_in_at`, document category, etc.), submit. Assert success; TO status **At Source**; active `GateVisitSession` created. | P0 | Pass |
| TC02 | Gate-In blocked before Driving Towards Source | TO **Assigned** or **Ready for Dispatch** only. Attempt Gate-In add for TO. Expected: TO not in eligible queryset / validation blocks save. | P0 | Planned |
| TC03 | Vehicle registration validated against assigned vehicle | Gate-In form: enter registration mismatching TO assigned vehicle. Expected: validation error before save. *If supervisor override role, use gateman without override.* | P1 | Planned |
| TC04 | Driver and document details captured | Complete **party_name**, driver/document fields on Gate-In; submit. Assert values on Gate-In change view / visit session. | P1 | Pass |
| TC05 | Mandatory field validation | Submit Gate-In with blank required field. Expected: Django `errorlist`; no visit created. | P0 | Planned |
| TC06 | Discrepancy remarks at Gate-In | Enter **remarks** describing discrepancy; submit. Assert remarks persisted on Gate-In record. | P1 | Pass |
| TC07 | RBAC — Driver cannot Gate-In | As **Driver** (`driver1@yopmail.com`), assert **Gate** menu absent; `/admin/operations/gatein/add/` denied. | P0 | Pass |
| TC08 | Audit — Gate-In event logged | After TC01, supervisor/tenant admin opens **Gate → Visit History** or Gate-In record; assert created_by, timestamp, TO reference. *Rewrite FG_GATEIN_S_008 — yard uses GateActivityLog / admin log, not tenant Audit Logs.* | P1 | Pass |

## Implementation Notes

- **Working site:** Gateman requires POI context (`UserOperationalPOI` or session switcher).
- **Eligible statuses:** `driving_towards_source` (FG outbound source leg).
- **Stock:** No stock mutation at gate-in.
- **Original ID map:** FG_GATEIN_S_001–008 → TC01–TC08.
