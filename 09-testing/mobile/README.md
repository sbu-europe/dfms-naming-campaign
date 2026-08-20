---
section: 09-testing/mobile
title: Mobile Testing — DFMS Vendor App (Maestro)
version: 1.1
last_updated: 2026-08-19
implementation_reference: ../../../nourish-vendor-app/.maestro/
---

# Mobile Testing

Maestro end-to-end test documentation and Phase 01 vendor-fleet test-case
specifications for the **DFMS Vendor Flutter app** (`nourish-vendor-app`).

Test **flows** (YAML) live in the app repo; test **specifications and results
tracking** live here — aligned with [`../backend/`](../backend/) backend e2e
scenario docs.

## Structure

| Path | Contents |
|------|----------|
| [`maestro-setup-and-run.md`](./maestro-setup-and-run.md) | Install Maestro, seed (`make seed-vendor-mobile`), emulator, run commands |
| [`e2e-scenarios/`](./e2e-scenarios/) | Vendor-app E2E scenario index |
| [`e2e-scenarios/vendor-fleet-phase01/`](./e2e-scenarios/vendor-fleet-phase01/) | TC_001–TC_160 (UAT + admin) — master: [`00-all-test-cases.md`](./e2e-scenarios/vendor-fleet-phase01/00-all-test-cases.md) |

## Tooling

| Tool | Role |
|------|------|
| **Maestro** | Vendor Flutter app UI (`nourish-vendor-app/.maestro/`) |
| **Playwright** (pytest-playwright) | Django Admin / portal (`nourish-backend/tests/e2e/`) — not mobile |
| **`make seed-vendor-mobile`** | Maestro-aligned vendor accounts + approved membership |


## App repo (automation assets)

| Asset | Location |
|-------|----------|
| Maestro flows | `nourish-vendor-app/.maestro/flows/` |
| Maestro helpers | `nourish-vendor-app/.maestro/helpers/` |
| Local env template | `nourish-vendor-app/.maestro/.env.example` |
| Flow runner README | `nourish-vendor-app/.maestro/README.md` |

## One-command full suite (Cursor Skill)

Run **all** Maestro + Playwright tests locally with a single command:

```bash
bash .cursor/skills/run-vendor-mobile-tests/scripts/run-all.sh
```

Skill: `.cursor/skills/run-vendor-mobile-tests/SKILL.md` — seeds backend,
builds APK, runs full Maestro suite (51 flows), Playwright admin smoke, and
the tenant join→approve→full-menu loop. Produces a JUnit XML report.

Quick re-run (skip seed & build): `--skip-seed --skip-build`
Single wave: `--wave bids`

## Workflow

1. Read scenario specs under `e2e-scenarios/vendor-fleet-phase01/`.
2. Implement or run matching flows in `nourish-vendor-app/.maestro/`.
3. Update **Maestro Status** and **Maestro Flow** columns in the feature file
   after each run.

## Related

- Backend e2e scenarios → [`../backend/e2e-scenarios/`](../backend/e2e-scenarios/)
- Testing strategy → [`../strategy/testing-strategy.md`](../strategy/testing-strategy.md)
- Backend how-to → [`../../08-development-guides/01-backend/06-testing/`](../../08-development-guides/01-backend/06-testing/)
