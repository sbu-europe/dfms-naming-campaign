# DFMS Product Context

> Comprehensive documentation repository for the Distribution and Fleet Management System (DFMS)

**Organization**: Brain Station 23  
**Product**: DFMS - A flexible distribution and fleet management product  
**Launch Client**: Nourish

📖 **[Read Product Vision](PRODUCT_VISION.md)** - Understand our product vision, approach, and strategy

---

## 📁 Repository Structure

### `source-documents/`
Original documentation from Business Analyst team (DOCX, XLSX, DrawIO).

**Do not modify these files** - they are preserved as received for reference and audit trail.

```
source-documents/
├── requirements/           # Product requirements and specifications
├── discovery-phase/        # Discovery phase materials (questionnaires, workflows, samples)
├── business-proposal/      # BS23 business proposals (v1.2.1, v1.3.1)
├── planning/              
│   ├── feature-lists/     # Feature lists across versions
│   └── work-breakdown/    # Work breakdown structure by phase
├── meeting-minutes/       # Stakeholder meetings organized by date
│   ├── 2025-07/
│   ├── 2025-09/
│   ├── 2025-10/
│   ├── 2025-11/
│   └── 2025-12/
└── reviews/               # Review documents and feedback
```

### `business-context/` & `technical-context/` *(Coming Soon)*
Structured, markdown-based knowledge repositories built from source documents.

**📋 Generation Plans:**
- **[BUSINESS_CONTEXT_PLAN.md](BUSINESS_CONTEXT_PLAN.md)** - Plan for building business domain knowledge (5 weeks, ~60 files)
- **[TECHNICAL_CONTEXT_PLAN.md](TECHNICAL_CONTEXT_PLAN.md)** - Plan for building technical architecture & contracts (6 weeks, ~90 files)

**Primary documentation for:**
- **Engineers**: IDE-friendly markdown, mermaid diagrams, API contracts
- **Business Stakeholders**: Clear business context, processes, and features  
- **AI/LLM**: Structured context for AI-assisted development
- **All Teams**: Single source of truth via git submodule

## 🎯 Purpose

This repository serves as the **domain context and interface contract layer** for DFMS:

### Repository Role
- **Domain Knowledge Layer**: Business + High-level technical context
- **Interface Contracts**: APIs, Events, Data Models for system integration
- **Git Submodule**: Imported by all implementation repos (backend, frontend, mobile, devops)

### Product Development
- **Product Vision**: Building a flexible, multi-tenant distribution and fleet management system
- **Launch Client**: Nourish - our first client helping us build a robust, market-ready product
- **Approach**: Requirements from Nourish, architecture for scalability

### Documentation Scope
- **Business Context**: Requirements, features, stakeholder insights, business processes
- **Technical Context**: High-level architecture (C4 Level 1-2), workflows, ADRs, interface contracts

> 💡 See [PRODUCT_VISION.md](PRODUCT_VISION.md) for product strategy and [REPOSITORY_PURPOSE.md](REPOSITORY_PURPOSE.md) for architecture

## 📖 Navigation

### For Business Stakeholders
- [Business Context Plan](BUSINESS_CONTEXT_PLAN.md) - Plan for business domain knowledge
- [Business Proposals](source-documents/business-proposal/) - BS23 proposals for the system
- [Meeting Minutes](source-documents/meeting-minutes/) - Chronological record of stakeholder discussions
- [Feature Lists](source-documents/planning/feature-lists/) - Feature specifications by version
- [Product Requirements](source-documents/requirements/) - Core business requirements

### For Engineers
- [Technical Context Plan](TECHNICAL_CONTEXT_PLAN.md) - Plan for architecture, workflows, and contracts
- Start with source documents to understand raw requirements
- Technical context (coming soon) will provide architecture and API contracts

### For Project Managers
- [Work Breakdown Structure](source-documents/planning/work-breakdown/) - Phase-wise project breakdown
- [Meeting Minutes](source-documents/meeting-minutes/) - Stakeholder engagement history

## 🔍 Quick Search

```bash
# Search all documents for a keyword
grep -r "transport" source-documents/

# Find specific file types
find source-documents/ -name "*.docx"
find source-documents/ -name "*.xlsx"
```

## 📝 Document Conventions

### Source Documents
- **Naming**: `Category_Description_Version.ext`
- **Dates**: `YYYY-MM-DD` format in filenames
- **Versions**: `v1.0`, `v1.1`, `v1.2` etc.
- **No spaces**: Use underscores for readability

### Business & Technical Context *(Coming Soon)*
- **Format**: Markdown (`.md`), Mermaid (`.mmd`), YAML contracts
- **Structure**: Numbered folders for reading order
- **Cross-references**: Linked documents
- **Metadata**: Frontmatter in each document
- **Contracts**: OpenAPI 3.0 specs for APIs, AsyncAPI for events

## 🤝 Contributing

This repository is maintained by the DFMS project team.

- **Source documents**: Only add new documents as received from BA team
- **Business context**: Follow [BUSINESS_CONTEXT_PLAN.md](BUSINESS_CONTEXT_PLAN.md)
- **Technical context**: Follow [TECHNICAL_CONTEXT_PLAN.md](TECHNICAL_CONTEXT_PLAN.md)

## 📞 Contact

For questions about documentation:
- Business requirements: Contact BA team
- Technical questions: Contact development team
- Documentation structure: Contact project lead

---

**Last Updated**: February 2026  
**Product**: DFMS - Distribution and Fleet Management System  
**Developed by**: Brain Station 23  
**Launch Client**: Nourish
