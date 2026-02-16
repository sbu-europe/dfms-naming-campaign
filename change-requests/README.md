# Change Requests

> Centralized management of change requests for DFMS Product Context

**Purpose**: Track, review, and manage changes to the product context repository

---

## 📋 Overview

This folder contains all change requests (CRs) submitted for modifications to the DFMS Product Context repository. Change requests document proposed changes, their rationale, impact, and implementation status.

---

## 📁 Structure

```
change-requests/
├── README.md                    # This file
├── CR-TEMPLATE.md              # Template for creating new CRs
├── CR-INDEX.md                 # Index of all change requests
├── CR-001-phase-based-architecture.md  # Example CR
└── [future CRs...]
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

1. **Copy the template**:
   ```bash
   cp change-requests/CR-TEMPLATE.md change-requests/CR-XXX-your-description.md
   ```

2. **Fill in the template** with:
   - CR number (next sequential number)
   - Title and description
   - Rationale and impact
   - Proposed changes
   - Affected documents

3. **Update CR-INDEX.md** to add the new CR

4. **Submit for review** by updating status to "Pending Review"

---

## 🔍 Review Process

1. **Submission**: CR created with status "Pending Review"
2. **Review**: Stakeholders review the CR
3. **Decision**: CR approved, rejected, or returned for revision
4. **Implementation**: If approved, implementation begins
5. **Verification**: Implementation verified and CR marked "Implemented"

---

## 📚 Related Documents

- [Repository Purpose](../02-REPOSITORY_PURPOSE.md)
- [Architecture Decisions](../technical-context/03-decisions/README.md)
- [Version History](../technical-context/06-reference/version-history.md)

---

**Last Updated**: 2026-02-13  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

