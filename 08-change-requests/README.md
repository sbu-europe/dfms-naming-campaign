# Change Requests

> Centralized management of change requests for DFMS Product Context

**Purpose**: Track, review, and manage changes to the product context repository.

**Quick links**: [**CR Index**](./CR-INDEX.md) (all CRs) · [**Template**](./CR-TEMPLATE.md) (new CR) · **Next number**: [CR-INDEX.md](./CR-INDEX.md#-summary-statistics) → use next sequential (e.g. CR-002)

---

## 📋 Overview

This folder contains all change requests (CRs) submitted for modifications to the DFMS Product Context repository. Change requests document proposed changes, their rationale, impact, and implementation status.

---

## 📁 Structure

```
change-requests/
├── README.md                    # This file – process and overview
├── CR-INDEX.md                 # Index of all CRs (update when adding/ changing CRs)
├── CR-TEMPLATE.md              # Template for creating new CRs
├── CR-001-phase-based-architecture.md
├── CR-001-UPDATE-CHECKLIST.md  # Optional: follow-up checklist for CR-001
└── CR-XXX-description.md       # Future CRs
```

---

## 🔢 Naming Convention

Change requests follow this naming pattern:
- **Format**: `CR-XXX-short-description.md`
- **XXX**: Sequential number (001, 002, 003...)
- **short-description**: Kebab-case description (e.g., `phase-based-architecture`)

**Examples**:
- `CR-001-phase-based-architecture.md`
- `CR-002-api-contract-updates.md`
- `CR-003-business-rule-changes.md`

---

## 📊 CR Statuses

| Status | Description |
|--------|-------------|
| **📝 Draft** | CR is being prepared, not yet submitted |
| **⏳ Pending Review** | CR submitted, awaiting review |
| **👀 In Review** | CR is being reviewed by stakeholders |
| **✅ Approved** | CR approved, ready for implementation |
| **🚧 In Progress** | CR approved and implementation started |
| **✅ Implemented** | CR fully implemented and verified |
| **❌ Rejected** | CR rejected, will not be implemented |
| **📦 Superseded** | CR superseded by another CR |

---

## 🎯 CR Categories

Change requests are categorized by their primary impact area:

- **🏗️ Architecture**: System architecture, design patterns, technology choices
- **📋 Business**: Business rules, requirements, user stories
- **🔌 Contracts**: API contracts, event schemas, data models
- **📚 Documentation**: Documentation structure, content, format
- **🔧 Technical**: Technical implementation details, workflows
- **🌐 Integration**: External system integrations

---

## 📝 Creating a New Change Request

1. **Get next number**: Check [CR-INDEX.md](./CR-INDEX.md) for the highest CR number; use next (e.g. 002).
2. **Copy the template**:
   ```bash
   cp change-requests/CR-TEMPLATE.md change-requests/CR-002-your-description.md
   ```
3. **Fill in the template** (title, rationale, impact, proposed changes, affected documents).
4. **Update [CR-INDEX.md](./CR-INDEX.md)**:
   - Add row in "Change Requests" table
   - Add to "By Category" and "By Status"
   - Add to "Recent Changes" if desired
5. **Set status** to "Pending Review" when ready for review.

---

## 🔍 Review Process

1. **Submission**: CR created with status "Pending Review"
2. **Review**: Stakeholders review the CR
3. **Decision**: CR approved, rejected, or returned for revision
4. **Implementation**: If approved, implementation begins
5. **Verification**: Implementation verified and CR marked "Implemented"

---

## ✅ Keeping CRs Manageable

| Do | Don't |
|----|--------|
| Update **CR-INDEX.md** whenever you add or change a CR | Create a CR without adding it to the index |
| Use the next sequential number from the index | Reuse numbers or skip without documenting |
| If a CR affects `01-source/`, say so and get alignment | Change WBS/PRD without a CR or traceability |
| Optionally add "Implemented: commit abc123" when done | Leave implemented CRs without a trace to code/docs |

---

## 📚 Related Documents

- [Repository Purpose](../02-REPOSITORY_PURPOSE.md)
- [Architecture Decisions](../05-architecture/03-decisions/README.md)
- [Version History](../07-reference/archive/version-history.md)
- [Source documents](../01-source/README.md) (source of truth; CRs that change scope should reference these)

---

**Last Updated**: 2026-02-13  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

