# DFMS Product Context

> Comprehensive documentation repository for the Distribution and Fleet Management System (DFMS)

**Organization**: Brain Station 23  
**Product**: DFMS - A flexible distribution and fleet management product  
**Launch Client**: Nourish

🚀 **[START HERE](00-START-HERE.md)** - New to this repo? Start with this guide!  
📖 **[Product Vision](01-PRODUCT_VISION.md)** - Understand our product vision, approach, and strategy

---

## 📁 Repository Structure

- **`01-source/`** - Source documents (PRD, WBS, SOW, flow diagrams, proposals) - Do not modify
- **`02-domain/`** - Business domain context (overview, requirements, rules, processes, industry)
- **`05-modules/`** - Technical module specifications (34 files, ~20,000 lines)
- **`03-backlog/`** - Product backlog (epics, stories, phases)
- **`04-architecture/`** - System & implementation architecture (high-level + Django)
- **`06-contracts/`** - API contracts & integration specifications
- **`10-reference/`** - Reference materials, data dictionaries
- **`11-change-requests/`** - Change request management
- **`08-development-guides/`** - Implementation guides (backend, frontend, mobile)
- **`_meta/`** - Repository meta-documentation (plans, reports, tracking)
- **`07-design-system/`** - UI design system (colors, typography, spacing, components, platform guides)
- **`09-testing/backend/e2e-scenarios/`** - E2E testcase and scenario planning by module story points

> 📖 See [00-START-HERE.md](00-START-HERE.md) for detailed structure and navigation

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
- **Business Context**: Requirements, features, business processes
- **Technical Context**: High-level architecture (C4 Level 1-2), workflows, ADRs, interface contracts
- **Implementation Guides**: Django/Python development, testing, deployment guides

> 💡 See [01-PRODUCT_VISION.md](01-PRODUCT_VISION.md) for product strategy and [02-REPOSITORY_PURPOSE.md](02-REPOSITORY_PURPOSE.md) for architecture

## 📖 Quick Links

- **[00-START-HERE.md](00-START-HERE.md)** - Navigation guide for all roles
- **[01-PRODUCT_VISION.md](01-PRODUCT_VISION.md)** - Product strategy
- **[02-REPOSITORY_PURPOSE.md](02-REPOSITORY_PURPOSE.md)** - Repository architecture
- **[Module Specifications](05-modules/)** - Technical documentation (~20,500 lines)
- **[Product Backlog](03-backlog/)** - 97 stories, 17 epics, organized by phase
- **[E2E Scenario Plans](09-testing/backend/e2e-scenarios/)** - Module-wise E2E testcase planning mapped to stories

## 📊 Status

| Section | Status | Files | Lines |
|---------|--------|-------|-------|
| **Module Specifications** | ✅ Complete | 34 | ~20,000 |
| **Domain Context** | ✅ Complete | 60+ | ~15,000 |
| **Product Backlog** | ✅ Complete | 114 | ~25,000 |
| **Architecture** | ✅ Complete | 91 | ~12,000 |
| **Development Guides** | ✅ Complete | 46 | ~8,000 |
| **Source Documents** | ✅ Current | 40+ | - |

### Repository metrics (source of truth: [01-source/04-wbs/README.md](01-source/04-wbs/README.md))
- **Stories**: 97 (US-001 to US-094+)
- **Epics**: 17 (EPIC-001 to EPIC-017)
- **Phase 1**: 70 stories, 26 weeks

## 📝 Change Requests

Change requests are managed in [`11-change-requests/`](11-change-requests/CR-INDEX.md).  
**Current**: 1 CR implemented (CR-001: Phase-Based Architecture Documentation)

## 📞 Contact

**Architecture & Technical Lead**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

---

**Last Updated**: February 27, 2026  
**Product**: DFMS - Distribution and Fleet Management System  
**Developed by**: Brain Station 23  
**Launch Client**: Nourish  
**Repository Status**: Restructured & Optimized for LLM and Human Navigation
