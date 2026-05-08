# System Design

> High-level system architecture (C4 Level 1-2)

**Status**: ✅ Complete  
**Last Updated**: February 27, 2026  
**Architecture Levels**: C4 Level 1 (System Context) & C4 Level 2 (Container View)

---

## 📖 Overview

This folder contains the high-level system architecture for DFMS, following the C4 model for visualizing software architecture. The documentation is **technology-agnostic** and focuses on the conceptual design, not implementation details.

**C4 Model Levels Covered**:
- **Level 1**: System Context - DFMS and its relationships with users and external systems
- **Level 2**: Container View - High-level technical building blocks (applications, databases, services)

---

## 📁 Folder Structure

### Core Architecture (C4 Diagrams & Documentation)

| File | Type | Description |
|------|------|-------------|
| **system-overview.md** | Documentation | C4 Level 1 - System context, actors, external systems |
| **container-view.md** | Documentation | C4 Level 2 - 10 containers, technology stack, phase evolution |
| **diagrams/** | Visual Diagrams | Mermaid C4 diagrams (system context, container) |

### Supporting Architecture Documentation

| Folder | Files | Description |
|--------|-------|-------------|
| **data-architecture/** | 3 files | Data models, data flow, entity relationships |
| **modules/** | 3 files | 12 module boundaries, interactions, communication patterns |
| **integration/** | 3 files | External system integrations, patterns |

---

## 🏗️ C4 Architecture Documents

### Level 1: System Context
**Documentation**: [system-overview.md](./system-overview.md) (415 lines)  
**Diagram**: [diagrams/system-context-diagram.mmd](./diagrams/system-context-diagram.mmd)

**Shows**:
- DFMS system and its purpose
- 21 user personas (admin, field, management)
- 6+ external systems (ERP, GPS/VTS, payment gateway, SMS, email, maps, lab)
- System boundaries and responsibilities
- Integration points

### Level 2: Container View
**Documentation**: [container-view.md](./container-view.md) (634 lines)  
**Diagram**: [diagrams/container-diagram.mmd](./diagrams/container-diagram.mmd)

**Shows**:
- 10 technical containers (web app, mobile apps, API server, etc.)
- Technology choices (Django, PostgreSQL, Redis, Flutter)
- Phase evolution (Phase 1: Monolith, Phase 2+: Microservices)
- Container responsibilities and communication
- Deployment architecture

---

## 📊 Key Architectural Decisions

### Multi-Tenancy Strategy
- **Approach**: Schema-per-tenant (PostgreSQL)
- **Isolation**: Complete data separation
- **Scalability**: Designed for 100+ tenants

### Phase Evolution
- **Phase 1**: Modular Monolith (Django + Django Templates)
- **Phase 2+**: Microservices + SPA (Vue.js)
- **Rationale**: See [ADR-004](../03-decisions/adr-004-phase-1-modular-monolith.md)

### Technology Stack
- **Backend**: Django + Django REST Framework + PostgreSQL
- **Frontend**: Phase 1 (Django Templates), Phase 2+ (Vue.js)
- **Mobile**: Flutter (iOS + Android)
- **Infrastructure**: AWS (EC2, RDS, ElastiCache, S3)

---

## 🔗 Related Documentation

### Architecture Documents
- **[Design Principles](../00-overview/design-principles.md)** - Core architectural principles
- **[Technology Stack](../00-overview/technology-stack-overview.md)** - Complete tech stack
- **[Architecture Summary](../00-overview/architecture-summary.md)** - Executive summary

### Decisions & Implementation
- **[Architecture Decisions](../03-decisions/)** - ADRs explaining key choices
- **[Implementation Strategy](../07-implementation/)** - How to build it
- **[Backend Architecture](../04-backend/)** - Django implementation details

### Specifications
- **[Module Specifications](../../05-modules/)** - Detailed module specs
- **[API Contracts](../../06-contracts/README.md)** - REST API & event contracts

---

## 📐 Architecture Principles Applied

This architecture follows DFMS core principles:
- ✅ **Multi-Tenancy First**: Every component designed for multi-tenant operation
- ✅ **API-First Design**: All functionality exposed via REST APIs
- ✅ **Modularity**: 12 loosely coupled modules with clear boundaries
- ✅ **Scalability**: Designed to scale from 10 to 1000+ users per tenant
- ✅ **Security-by-Design**: Authentication, authorization, encryption at every layer
- ✅ **Cloud-Native**: Built for AWS, containerizable, microservices-ready

---

## 🎯 Quick Navigation

### For Architects
- Start with [system-overview.md](./system-overview.md) for big picture
- Review [container-view.md](./container-view.md) for technical architecture
- Read [Architecture Decisions](../03-decisions/) for rationale

### For Developers
- Review [container-view.md](./container-view.md) for technology stack
- Check [modules/](./modules/) for module boundaries
- See [Backend Architecture](../04-backend/) for implementation

### For Stakeholders
- Read [system-overview.md](./system-overview.md) for system capabilities
- Review [Architecture Summary](../00-overview/architecture-summary.md) for overview

---

**Total Files**: 17 files  
**Documentation**: ~10,000 lines  
**Diagrams**: 2 Mermaid C4 diagrams  
**Status**: ✅ Complete and production-ready
