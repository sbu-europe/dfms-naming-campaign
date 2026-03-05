# Submodule Update — Documentation Adjustments Required

> Adjustments to `docs/` based on updated DFMS-product-context submodule structure

**Date**: 2026-02-23  
**Submodule**: DFMS-product-context (updated)

---

## Summary of Changes in Submodule

The submodule structure has evolved. Key path differences:

| What | Old path (in docs) | Correct path (in submodule) |
|------|--------------------|-----------------------------|
| Testing approach | `03-implementation/testing-approach.md` | `03-implementation/strategies/testing-approach.md` |
| Design principles | `01-architecture/design-principles/` | `00-overview/design-principles.md` |

---

## Required Adjustments

### 1. Testing Approach Path

**Correct path**: `DFMS-product-context/05-architecture/04-implementation/strategies/testing-approach.md`

**Files to update** (replace `03-implementation/testing-approach` with `03-implementation/strategies/testing-approach`):

- `docs/testing/testing-strategy.md`
- `docs/testing/unit-tests.md`
- `docs/testing/integration-tests.md`
- `docs/testing/e2e-tests.md`
- `docs/testing/test-fixtures.md`
- `docs/services/background-tasks.md`
- `docs/architecture/system-architecture.md`
- `docs/README.md`
- `docs/TECHNICAL_DOCUMENTATION_PLAN.md`

### 2. Design Principles Path

**Correct path**: `DFMS-product-context/05-architecture/00-overview/design-principles.md`

**Files to update** (replace `01-architecture/design-principles/` with `00-overview/design-principles.md`):

- `docs/guides/code-style.md` — currently points to `01-architecture/design-principles/` (folder); should be `00-overview/design-principles.md` (file)

**Already correct** (reference `00-overview/design-principles.md`):

- `docs/architecture/error-handling.md`
- `docs/guides/contributing.md`

---

## Submodule Structure (Current)

```
DFMS-product-context/
├── business-context/
├── 05-architecture/
│   ├── 00-overview/
│   │   ├── architecture-summary.md
│   │   ├── design-principles.md      ← file, not folder
│   │   ├── technology-stack-overview.md
│   │   └── README.md
│   ├── 01-architecture/
│   ├── 02-workflows/
│   ├── 03-implementation/
│   │   ├── deployment-strategy/
│   │   ├── strategies/
│   │   │   ├── testing-approach.md   ← testing approach lives here
│   │   │   ├── migration-strategy.md
│   │   │   └── ...
│   │   ├── phase-1-breakdown/
│   │   └── planning/
│   ├── 03-decisions/
│   ├── 04-diagrams/
│   ├── 05-contracts/
│   └── 06-reference/
└── ...
```

---

## Verification

After applying adjustments:

1. All links to submodule documents should resolve to existing paths.
2. No references to `03-implementation/testing-approach.md` (use `03-implementation/strategies/testing-approach.md`).
3. No references to `01-architecture/design-principles/` (use `00-overview/design-principles.md`).

---

**Last Updated**: 2026-02-23
