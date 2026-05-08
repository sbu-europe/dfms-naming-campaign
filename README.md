# DFMS Product Context

> Comprehensive documentation repository for the Distribution and Fleet Management System (DFMS)

**Organization**: Brain Station 23  
**Product**: DFMS - A flexible distribution and fleet management product  
**Launch Client**: Nourish

🚀 **[START HERE](00-START-HERE.md)** - New to this repo? Start with this guide!  
📖 **[Product Vision](01-PRODUCT_VISION.md)** - Understand our product vision, approach, and strategy

---

## 📁 Repository Structure

- **`01-source/`** — Source documents (PRD, WBS, SOW, flow diagrams, proposals) — do not modify
- **`02-domain/`** — Business domain context (overview, requirements, rules, processes, industry)
- **`03-backlog/`** — Product backlog (sprint tasks + flat user story list)
- **`04-architecture/`** — System architecture, ADRs, Django architecture, AWS deployment
- **`05-modules/`** — Technical module specifications (50+ files, ~20,000 lines)
- **`06-contracts/`** — API contracts & integration specifications (14 OpenAPI specs)
- **`07-design-system/`** — UI/UX design system (tokens, components, patterns, platform guides)
- **`08-development-guides/`** — Backend implementation runbooks (setup, API, DB, security, deployment)
- **`09-testing/`** — Testing strategy & E2E scenario plans (backend + mobile)
- **`10-reference/`** — Reference materials, data dictionaries
- **`11-change-requests/`** — Change request management
- **`_meta/`** — Repository meta-documentation (plans, reports, tracking) — internal

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
- **[Module Specifications](05-modules/)** — Technical documentation (~20,000 lines)
- **[Product Backlog](03-backlog/)** — Sprint tasks & user stories (98+)
- **[Architecture](04-architecture/)** — System design, ADRs, AWS deployment
- **[Development Guides](08-development-guides/01-backend/)** — Backend implementation runbooks
- **[Testing](09-testing/)** — Strategy & E2E scenario plans
- **[E2E Scenario Plans](09-testing/backend/e2e-scenarios/)** — Module-wise E2E testcase planning

## 📊 Status

| Section | Status | Files | Lines |
|---------|--------|-------|-------|
| **03-backlog** | ✅ Complete | 140+ | ~25,000 |
| **04-architecture** | ✅ Complete | 90+ | ~12,000 |
| **05-modules** | ✅ Complete | 50+ | ~20,000 |
| **02-domain** | ✅ Complete | 50+ | ~15,000 |
| **06-contracts** | ✅ Complete | 25+ | — |
| **07-design-system** | ✅ Complete | 12 | — |
| **08-development-guides** | ✅ Complete | 46 | ~8,000 |
| **09-testing** | ✅ Active | 17 | — |
| **01-source** | ✅ Current | 20+ | — |

### Repository metrics
- **Stories**: 98+ (US-001 to US-098+)
- **Sprints**: 4 completed (Phase 1)
- **Module Specifications**: 14 modules
- **API Contracts**: 14 OpenAPI specs + integration contracts
- **ADRs**: 7 architecture decision records

## 📝 Change Requests

Change requests are managed in [`11-change-requests/`](11-change-requests/CR-INDEX.md).  
**Current**: 1 CR implemented (CR-001: Phase-Based Architecture Documentation)

## 📞 Contact

**Architecture & Technical Lead**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

---

**Last Updated**: May 8, 2026  
**Product**: DFMS - Distribution and Fleet Management System  
**Developed by**: Brain Station 23  
**Launch Client**: Nourish  
**Repository Status**: Restructured & Optimized for LLM and Human Navigation
