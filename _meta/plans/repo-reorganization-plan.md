# Repository Reorganization Plan

> Complete structural refactoring plan for `DFMS-product-context/`

**Status**: 📋 Planned  
**Created**: May 8, 2026  
**Author**: Discussed and finalized in [Repo Reorganization](../README.md)  
**Priority**: Medium — execute before next sprint onboarding

---

## 🎯 Goals

1. Establish a clear, intuitive folder structure that matches how the team actually works
2. Eliminate content overlap between `04-architecture/` and `05-modules/`
3. Surface the most-used sections (dev guides, design system) near the top of the VS Code sidebar
4. Consolidate scattered deployment, testing, and planning content into the right homes
5. Remove internal AI artifacts from the main documentation tree

---

## 🧭 Governing Principles

### Logical reading order
Numbers reflect knowledge dependencies — you read lower-numbered sections to understand context before higher-numbered sections.

### Daily-use sections get low numbers
Since VS Code sidebar sorts alphabetically, the number IS the position. Sections used every day should be near the top.

### The folder-to-concern mapping rule

| Concern | Folder |
|---|---|
| Raw inputs (PRD, SOW) | `01-source/` |
| Business context, requirements | `02-domain/` |
| Sprint planning, user stories | `03-backlog/` |
| System-wide design decisions | `04-architecture/` |
| Per-module technical specs | `05-modules/` |
| API contracts, data models | `06-contracts/` |
| UI/UX design tokens (admin portal + mobile) | `07-design-system/` |
| Daily developer runbooks | `08-development-guides/` |
| Test strategy, scenarios (all platforms) | `09-testing/` |
| Reference lookups | `10-reference/` |
| Change requests | `11-change-requests/` |
| Internal AI/process artifacts | `_meta/` |

### Testing is top-level
Testing is elevated to its own top-level folder (`08-testing/`) because:
- Mobile testing is coming soon — it cannot live inside `07-development-guides/01-backend/`
- Test strategy and e2e scenarios are cross-cutting concerns spanning backend, mobile, and future frontend
- A dedicated QA engineer would not look inside a backend dev guide
- `07-development-guides/06-testing/` retains only backend how-to content (how to run tests, pytest config)

### Architecture before modules
Architecture sets system-wide constraints (multi-tenancy, security, deployment). Module specs must operate within those constraints. Therefore architecture is numbered before modules.

### The how-to / why split (architecture vs dev-guides)
- `04-architecture/` answers **what** and **why** — decisions, diagrams, environment blueprints
- `07-development-guides/` answers **how** — step-by-step commands, config values, runbooks

---

## 📋 Final Target Structure

```
DFMS-product-context/
│
├── README.md                          ← update navigation index
├── 00-START-HERE.md                   ← update all links
├── 01-PRODUCT_VISION.md
├── 02-REPOSITORY_PURPOSE.md
│
├── 01-source/                         ← NO CHANGE
│   ├── 01-prd/
│   ├── 02-flow-diagram/
│   ├── 03-sow/
│   ├── 04-wbs/
│   └── 05-proposals/
│
├── 02-domain/                         ← NO CHANGE
│   ├── 01-overview/
│   ├── 02-requirements/
│   ├── 03-business-rules/
│   ├── 04-business-processes/
│   └── 05-industry-context/
│
├── 03-backlog/                        ← RENAME from 03-backlog/
│   ├── README.md
│   ├── user-stories-by-epic.md
│   ├── phase-1-sprint-plan.md
│   ├── stories/
│   └── sprints/
│       ├── sprint-1/
│       ├── sprint-2/
│       ├── sprint-3/
│       └── sprint-4/
│
├── 04-architecture/                   ← RENAME from 04-architecture/ + restructured internally
│   ├── README.md
│   ├── 00-overview/
│   ├── 01-system-design/
│   ├── 02-workflows/
│   ├── 03-decisions/                  ← ADRs, no change
│   ├── 04-backend/                    ← RENAME from 05-backend-architecture/
│   ├── 05-diagrams/                   ← RENAME from 06-diagrams/
│   ├── 06-deployment/                 ← RESTRUCTURE from 04-implementation/deployment-strategy/
│   │   ├── README.md
│   │   ├── environments/
│   │   │   ├── dev.md                 ← extracted from phase-1-deployment.md
│   │   │   └── production.md          ← extracted from phase-1-deployment.md
│   │   ├── aws/
│   │   │   ├── deployment-strategy.md
│   │   │   └── scalability-plan.md
│   │   └── cost/
│   │       ├── cost-estimation.md
│   │       └── billing-safeguards.md
│   ├── 07-implementation/             ← ABSORB from 04-implementation/ remainder
│   │   ├── strategies/
│   │   │   ├── migration-strategy.md
│   │   │   ├── rollout-plan.md
│   │   │   └── technology-considerations.md
│   │   └── planning/
│   │       ├── IMPLEMENTATION_TIMELINE.md
│   │       ├── TIMELINE_VALIDATION.md
│   │       ├── EPICS.md
│   │       ├── STORIES.md
│   │       ├── TASKS.md
│   │       └── TIMELINE.md
│   └── 08-reference/                  ← ABSORB from 04-architecture/08-reference/
│       ├── cross-reference-index.md
│       ├── source-document-mapping.md
│       └── version-history.md
│
├── 05-modules/                        ← RENAME from 05-modules/
│   ├── README.md
│   ├── INDEX.md
│   ├── 01-foundation/
│   ├── 02-master-data/
│   ├── 03-users/
│   ├── 04-requisitions/
│   ├── 05-transport/
│   ├── 06-poi-operations/
│   ├── 07-vendor-management/
│   ├── 08-fleet-management/
│   ├── 15-mobile-apps/
│   ├── 10-audit/
│   ├── 11-reporting/
│   ├── 12-cross-cutting/              ← remove aws-dev-environment.md (moved)
│   └── 13-phases/
│
├── 06-contracts/                      ← NO CHANGE
│   ├── 01-apis/
│   ├── 02-data-models/
│   ├── 03-events/
│   └── 04-integration/
│
├── 07-design-system/                  ← RENAME from 07-design-system/ (moved up, daily use for admin portal)
│   ├── README.md
│   ├── preview.html
│   ├── 01-foundation/
│   ├── 02-components/
│   ├── 03-patterns/
│   └── 04-platforms/
│
├── 08-development-guides/             ← RENAME from 08-development-guides/ (renumbered)
│   └── 01-backend/
│       ├── 01-setup/
│       ├── 02-api/
│       ├── 03-database/
│       ├── 04-security/
│       ├── 05-services/
│       ├── 06-testing/                ← backend how-to only (running tests, pytest config)
│       │   ├── how-to-run-tests.md
│       │   ├── unit-tests.md
│       │   ├── integration-tests.md
│       │   ├── e2e-tests.md
│       │   └── test-fixtures.md
│       ├── 07-deployment/
│       │   ├── aws-setup.md
│       │   ├── docker.md
│       │   ├── environment-variables.md
│       │   ├── monitoring.md
│       │   ├── backup-recovery.md
│       │   ├── aws-dev-environment.md      ← MOVED from 05-modules/12-cross-cutting/
│       │   └── pre-production-checklist.md ← MOVED from 04-architecture/06-deployment/
│       ├── 08-guides/
│       └── 09-reference/
│
├── 09-testing/                        ← NEW top-level (replaces 09-testing/backend/e2e-scenarios/ + absorbs from dev-guides)
│   ├── README.md
│   ├── strategy/
│   │   └── testing-strategy.md        ← MOVED from 07-development-guides/06-testing/
│   ├── backend/
│   │   ├── README.md
│   │   └── e2e-scenarios/             ← ABSORB from 09-testing/backend/e2e-scenarios/
│   │       ├── 01-foundation/
│   │       ├── 02-master-data/
│   │       └── users/
│   └── mobile/                        ← PLACEHOLDER for upcoming mobile testing
│       └── README.md
│
├── 10-reference/                      ← RENAME from 10-reference/ (renumbered)
│   ├── README.md
│   ├── archive/
│   └── data-reference/
│
├── 11-change-requests/                ← RENAME from 11-change-requests/ (renumbered)
│   ├── README.md
│   ├── CR-INDEX.md
│   ├── CR-TEMPLATE.md
│   └── CR-001-*.md
│
└── _meta/                             ← RENAME from _meta/ (prefix _ sorts last)
    ├── README.md
    ├── archive/
    ├── plans/
    ├── reports/
    └── tracking/
```

---

## 🔄 Complete Move Manifest

### Folder renames (bulk `git mv`)

| From | To |
|---|---|
| `03-backlog/` | `03-backlog/` |
| `04-architecture/` | `04-architecture/` |
| `04-architecture/04-backend/` | `04-architecture/04-backend/` |
| `04-architecture/05-diagrams/` | `04-architecture/05-diagrams/` |
| `04-architecture/08-reference/` | `04-architecture/08-reference/` |
| `05-modules/` | `05-modules/` |
| `07-design-system/` | `07-design-system/` |
| `08-development-guides/` | `08-development-guides/` |
| `09-testing/backend/e2e-scenarios/` | `09-testing/backend/e2e-scenarios/` |
| `10-reference/` | `10-reference/` |
| `11-change-requests/` | `11-change-requests/` |
| `_meta/` | `_meta/` |

### New folders to create

| New folder | Contents |
|---|---|
| `09-testing/` | New top-level testing home |
| `09-testing/strategy/` | Testing strategy (moved from dev-guides) |
| `09-testing/backend/` | Backend e2e scenarios |
| `09-testing/mobile/` | Placeholder for upcoming mobile tests |

### Internal restructuring (within architecture)

| From | To |
|---|---|
| `04-architecture/06-deployment/` | `04-architecture/06-deployment/` |
| `04-architecture/07-implementation/strategies/` | `04-architecture/07-implementation/strategies/` |
| `04-architecture/07-implementation/planning/` | `04-architecture/07-implementation/planning/` |
| `04-architecture/07-implementation/planning/` | `04-architecture/07-implementation/planning/` |

### Individual file moves

| From | To | Reason |
|---|---|---|
| `04-architecture/06-deployment/aws-pre-production-checklist.md` | `07-development-guides/01-backend/07-deployment/pre-production-checklist.md` | Checklist = runbook, not arch doc |
| `05-modules/12-cross-cutting/aws-dev-environment.md` | `07-development-guides/01-backend/07-deployment/aws-dev-environment.md` | Dev environment setup = dev guide |
| `09-testing/strategy/testing-strategy.md` | `09-testing/strategy/testing-strategy.md` | Strategy is cross-platform, not backend-only |
| `09-testing/backend/e2e-scenarios/**` | `09-testing/backend/e2e-scenarios/` | Consolidate all testing in top-level testing folder |
| `04-architecture/06-deployment/phase-1-deployment.md` | Split into `04-architecture/06-deployment/environments/dev.md` + `production.md` | File mixes two concerns |

### Files deleted after move

| Folder | Reason |
|---|---|
| `09-testing/backend/e2e-scenarios/` | Eliminated as top-level — contents moved to `08-testing/backend/e2e-scenarios/` |

---

## 📝 Batch 4 — Link Fix Tasks

> **Scope**: 292 total file references across 9 old path patterns.
> Every task below is a find-and-replace of the old path → new path across the listed files.
> Execute with: `sed -i '' 's|OLD|NEW|g' file` or editor bulk replace.

---

### TASK-L01 — Replace `05-modules` → `05-modules`
**Affected files**: 93  
**Find**: `05-modules`  
**Replace**: `05-modules`

Files to update (all files that contain this string):
- `README.md` (root)
- `00-START-HERE.md`
- `02-REPOSITORY_PURPOSE.md`
- `02-domain/**/*.md` (6 files)
- `05-modules/**/*.md` → after rename, all internal READMEs and spec files (35 files)
- `03-backlog/stories/US-*.md` (multiple — stories link to module specs)
- `04-architecture/**/*.md` (multiple — arch links to specs)
- `06-contracts/01-apis/README.md`
- `08-development-guides/**/*.md` (multiple)
- `_meta/**/*.md` (multiple)

---

### TASK-L02 — Replace `03-backlog` → `03-backlog`
**Affected files**: 88  
**Find**: `03-backlog`  
**Replace**: `03-backlog`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `02-REPOSITORY_PURPOSE.md`
- `02-domain/**/*.md` (4 files)
- `05-modules/**/*.md` (multiple — specs link back to stories)
- `03-backlog/**/*.md` → after rename, all internal sprint/story files (75 files — self-referencing relative links)
- `04-architecture/**/*.md` (multiple)
- `_meta/**/*.md` (multiple)

---

### TASK-L03 — Replace `04-architecture` → `04-architecture`
**Affected files**: 64  
**Find**: `04-architecture`  
**Replace**: `04-architecture`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `02-REPOSITORY_PURPOSE.md`
- `02-domain/**/*.md` (3 files)
- `05-modules/**/*.md` (multiple — specs reference arch decisions)
- `03-backlog/sprints/sprint-3/07-devops/DEVOPS-01-aws-dev-environment.md`
- `04-architecture/**/*.md` → after rename, all internal README and cross-refs (35 files)
- `06-contracts/**/*.md` (2 files)
- `08-development-guides/**/*.md` (multiple — dev guides reference arch)
- `_meta/**/*.md` (multiple)

Sub-replacements needed within `04-architecture/` internal files:

| Find | Replace |
|---|---|
| `04-architecture/04-backend` | `04-architecture/04-backend` |
| `04-architecture/05-diagrams` | `04-architecture/05-diagrams` |
| `04-architecture/08-reference` | `04-architecture/08-reference` |
| `04-architecture/06-deployment` | `04-architecture/06-deployment` |
| `04-architecture/07-implementation/planning` | `04-architecture/07-implementation/planning` |
| `04-architecture/07-implementation/planning` | `04-architecture/07-implementation/planning` |
| `04-architecture/07-implementation/strategies` | `04-architecture/07-implementation/strategies` |

---

### TASK-L04 — Replace `08-development-guides` → `08-development-guides`
**Affected files**: 15  
**Find**: `08-development-guides`  
**Replace**: `08-development-guides`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `04-architecture/**/*.md` (multiple — arch links to dev guides)
- `05-modules/12-cross-cutting/README.md`
- `08-development-guides/**/*.md` → after rename, internal READMEs (8 files)
- `_meta/**/*.md` (2 files)

---

### TASK-L05 — Replace `10-reference` → `10-reference`
**Affected files**: 9  
**Find**: `../10-reference` and `../../10-reference` and absolute `10-reference`  
**Replace**: `../10-reference` / `../../10-reference` / `10-reference`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `10-reference/**/*.md` → after rename, internal README and archive files (6 files)
- `_meta/README.md`

---

### TASK-L06 — Replace `11-change-requests` → `11-change-requests`
**Affected files**: 4  
**Find**: `11-change-requests`  
**Replace**: `11-change-requests`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `11-change-requests/README.md` → after rename
- `11-change-requests/CR-001-UPDATE-CHECKLIST.md` → after rename

---

### TASK-L07 — Replace `07-design-system` → `07-design-system`
**Affected files**: 5  
**Find**: `07-design-system`  
**Replace**: `07-design-system`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `07-design-system/README.md` → after rename
- `07-design-system/01-foundation/colors.md` → after rename
- `_meta/**/*.md` (1 file)

---

### TASK-L08 — Replace `_meta` → `_meta`
**Affected files**: 10  
**Find**: `_meta`  
**Replace**: `_meta`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `_meta/**/*.md` → after rename, internal README and plan files (8 files)

---

### TASK-L09 — Replace `09-testing/backend/e2e-scenarios` → `09-testing/backend/e2e-scenarios`
**Affected files**: 4  
**Find**: `09-testing/backend/e2e-scenarios`  
**Replace**: `09-testing/backend/e2e-scenarios`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- `09-testing/backend/e2e-scenarios/README.md` → after move, the new location README
- `04-architecture/07-implementation/strategies/testing-approach.md`

---

### TASK-L10 — Update testing-strategy.md move reference
**Affected files**: ~3  
**Find**: `09-testing/strategy/testing-strategy.md` and `09-testing/strategy/testing-strategy.md`  
**Replace**: `09-testing/strategy/testing-strategy.md`

Files to update:
- `README.md` (root)
- `00-START-HERE.md`
- Any file linking to the old testing strategy location

---

### TASK-L11 — Update moved individual files' internal links

These files move to a different depth in the tree, so their **relative links** shift:

| File (new location) | Links that change |
|---|---|
| `08-development-guides/01-backend/07-deployment/pre-production-checklist.md` | All `../04-architecture/` → `../../../04-architecture/` |
| `08-development-guides/01-backend/07-deployment/aws-dev-environment.md` | All `../05-modules/` → `../../../05-modules/` |
| `09-testing/strategy/testing-strategy.md` | Update depth — was 4 deep, now 3 deep |
| `09-testing/backend/e2e-scenarios/**` | All parent links shift from `../../09-testing/backend/e2e-scenarios` context |
| `04-architecture/06-deployment/environments/dev.md` | All links (extracted from `phase-1-deployment.md`, new file) |
| `04-architecture/06-deployment/environments/production.md` | All links (extracted from `phase-1-deployment.md`, new file) |

---

### TASK-L12 — Update all README index files in moved folders

Every folder that moves needs its own `README.md` updated with correct relative paths to siblings and parents:

| README file (new path) | Links to fix |
|---|---|
| `03-backlog/README.md` | Parent link `../` still valid; sibling links to `04-architecture/`, `05-modules/` |
| `04-architecture/README.md` | All internal subfolder links; links to `05-modules/`, `03-backlog/` |
| `04-architecture/04-backend/README.md` | Was `05-backend-architecture/` — parent path changed |
| `04-architecture/05-diagrams/README.md` | Was `06-diagrams/` — parent path changed |
| `04-architecture/06-deployment/README.md` | New folder — write fresh |
| `04-architecture/07-implementation/README.md` | New folder — write fresh |
| `04-architecture/08-reference/README.md` | Was `10-reference/` inside architecture — parent path changed |
| `05-modules/README.md` | Was `05-modules/` — all arch links shift |
| `05-modules/12-cross-cutting/README.md` | Remove `aws-dev-environment.md` entry |
| `06-contracts/01-apis/README.md` | Links to `05-modules/` → `05-modules/`; links to `04-architecture/` → `04-architecture/` |
| `07-design-system/README.md` | Was `07-design-system/` — parent path changed |
| `08-development-guides/README.md` | Was `08-development-guides/` |
| `08-development-guides/01-backend/06-testing/README.md` | Remove `testing-strategy.md`, add link to `09-testing/` |
| `08-development-guides/01-backend/07-deployment/README.md` | Add 2 new files entries |
| `09-testing/README.md` | New folder — write fresh with sections for strategy, backend, mobile |
| `10-reference/README.md` | Was `10-reference/` — parent path changed |
| `11-change-requests/README.md` | Was `11-change-requests/` — parent path changed |
| `_meta/README.md` | Was `_meta/` — update all self-references |

---

### Summary by effort

| Task | Files affected | Effort |
|---|---|---|
| TASK-L01 `05-modules` → `05-modules` | 93 | High |
| TASK-L02 `03-backlog` → `03-backlog` | 88 | High |
| TASK-L03 `04-architecture` → `04-architecture` + sub-paths | 64 | High |
| TASK-L04 `08-development-guides` → `08-development-guides` | 15 | Medium |
| TASK-L05 `10-reference` → `10-reference` | 9 | Low |
| TASK-L06 `11-change-requests` → `11-change-requests` | 4 | Low |
| TASK-L07 `07-design-system` → `07-design-system` | 5 | Low |
| TASK-L08 `_meta` → `_meta` | 10 | Low |
| TASK-L09 `09-testing/backend/e2e-scenarios` → `09-testing/backend/e2e-scenarios` | 4 | Low |
| TASK-L10 `testing-strategy.md` new home | 3 | Low |
| TASK-L11 Individual moved files — relative links | 6 files | Medium |
| TASK-L12 README index files in moved folders | 18 READMEs | Medium |
| **Total** | **~295 references** | |

---

## ⚠️ Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Broken cross-reference links | Run `grep -r "04-architecture" .` etc. after each batch move to find and fix broken links |
| Git history confusion | Use `git mv` (not OS move) so git tracks the rename correctly |
| Submodule pointer | `DFMS-product-context` is a git submodule — all moves happen inside it, commit separately |
| Large PR hard to review | Execute in batches: (1) folder renames, (2) internal restructuring, (3) individual file moves, (4) link fixes |

---

## 🚀 Execution Order

Execute in this order to minimize broken-link windows:

1. **Batch 1 — Simple renames** (no content changes, just folder renames)
   - `03-backlog/` → `03-backlog/`
   - `05-modules/` → `05-modules/`
   - `07-design-system/` → `07-design-system/`
   - `08-development-guides/` → `08-development-guides/`
   - `10-reference/` → `10-reference/`
   - `11-change-requests/` → `11-change-requests/`
   - `_meta/` → `_meta/`

2. **Batch 2 — Architecture internal restructuring**
   - Rename `04-architecture/` → `04-architecture/`
   - Rename subfolders within it
   - Restructure `04-implementation/` into `06-deployment/` + `07-implementation/`

3. **Batch 3 — Create `08-testing/` and move testing content**
   - Create `09-testing/` with subfolders (`strategy/`, `backend/`, `mobile/`)
   - Move `09-testing/backend/e2e-scenarios/` contents → `09-testing/backend/e2e-scenarios/`
   - Move `testing-strategy.md` → `09-testing/strategy/`
   - Write `09-testing/README.md` (fresh)
   - Write `09-testing/mobile/README.md` (placeholder)

4. **Batch 4 — Individual file moves**
   - Move `aws-pre-production-checklist.md`
   - Move `aws-dev-environment.md`

5. **Batch 5 — Link fixes**
   - Update `README.md`, `00-START-HERE.md`
   - Fix all broken cross-references (TASK-L01 through TASK-L10)
   - Update relative links in moved files (TASK-L11)
   - Update all `README.md` index files in moved folders (TASK-L12)

6. **Batch 6 — Commit**
   - Single commit per batch for clean git history

---

**Next step**: Approve this plan, then execute starting with Batch 1.
