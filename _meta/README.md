# _meta/ - Repository Meta-Documentation

> Operational documentation about repository management, planning, and reporting

**Last Updated**: February 27, 2026  
**Status**: ✅ Active

---

## 📋 Overview

This folder contains **meta-documentation** - documentation *about* the repository itself, rather than the DFMS product. This includes task plans, completion reports, status tracking, and operational documentation.

**Purpose**: Separate product documentation from repository management artifacts for better organization and LLM token efficiency.

---

## 📂 Folder Structure

```
_meta/
├── README.md                          # This file
├── plans/                             # Task plans and strategies
├── reports/                           # Completion reports and analysis
└── tracking/                          # Status tracking and progress logs
```

---

## 📁 Contents

### `plans/` - Task Plans & Strategies

Strategic plans for repository work, implementation approaches, and documentation initiatives.

**Files**:
- Implementation planning documents
- Documentation strategies
- Alignment plans
- Technical planning documents
- Transformation guides

### `reports/` - Completion Reports & Analysis

Reports documenting completed work, verification results, and analysis of repository operations.

**Files**:
- Phase completion reports
- Cleanup reports
- Verification reports
- Alignment reports (detailed & summary)
- Reorganization and transformation reports
- Submodule adjustment reports

### `tracking/` - Status & Progress

Ongoing status tracking, progress logs, and operational metrics.

**Files**:
- Documentation status
- Progress tracking
- Work logs

---

## 🎯 What Belongs Here

✅ **Include**:
- Task plans for repository work
- Completion reports for documentation milestones
- Status tracking for ongoing initiatives
- Verification and audit reports
- Repository cleanup and maintenance logs

❌ **Exclude**:
- Product documentation (belongs in `02-domain/`, `05-modules/`)
- Architecture documentation (belongs in `04-architecture/`)
- Development guides (belongs in `08-development-guides/`)
- Source documents (belongs in `01-source/`)

---

## 🔗 Related Documentation

- **Root README**: Main repository overview → [`README.md`](../README.md)
- **Start Here**: Navigation guide → [`00-START-HERE.md`](../00-START-HERE.md)
- **Repository Purpose**: Architecture → [`02-REPOSITORY_PURPOSE.md`](../02-REPOSITORY_PURPOSE.md)
- **Reference Materials**: Historical docs → [`10-reference/`](../10-reference/)

---

## 💡 Usage Guidelines

### When to Create Meta-Documentation

Create documents in `_meta/` when:
- Planning repository-wide changes or initiatives
- Documenting completion of major milestones
- Tracking ongoing documentation work
- Reporting on verification or cleanup activities

### Naming Conventions

- **Plans**: `{initiative}-plan.md` (e.g., `implementation-plan.md`)
- **Reports**: `{activity}-report.md` (e.g., `cleanup-report.md`)
- **Tracking**: `{area}-status.md` (e.g., `documentation-status.md`)

### Lifecycle

1. **Plans** → Created before work begins
2. **Tracking** → Updated during work
3. **Reports** → Created when work completes
4. **Archive** → Move to `10-reference/archive/` if no longer active

---

## 📊 Current Status

- **Plans**: Active planning documents
- **Reports**: Historical completion reports
- **Tracking**: Ongoing status monitoring

---

**Maintainer**: Md. Mahfuzur Rahman (mahfuz@brainstation-23.com)
