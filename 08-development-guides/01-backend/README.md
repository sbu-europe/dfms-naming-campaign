# Backend Documentation

> Implementation-specific documentation for DFMS Backend (Django/Python)

## 📖 Documentation Structure

### High-Level Architecture & Contracts
> **Source of Truth**: [`04-architecture/`](../04-architecture/)

The high-level architecture, contracts, workflows, and architectural decisions are maintained in the DFMS Product Context submodule:

- **[Architecture Summary](../../04-architecture/00-overview/architecture-summary.md)** - Overall system architecture
- **[Container View](../../04-architecture/01-system-design/container-view.md)** - High-level technical building blocks
- **[Architecture Decision Records (ADRs)](../04-architecture/03-decisions/)** - Why we chose specific approaches
  - [ADR-004: Phase 1 Modular Monolith](../../04-architecture/03-decisions/adr-004-phase-1-modular-monolith.md)
  - [ADR-005: Phase 1 Frontend Approach](../../04-architecture/03-decisions/adr-005-phase-1-frontend-approach.md)
- **[API Contracts (OpenAPI 3.0)](../../06-contracts/01-apis/README.md)** - Complete API specifications
- **[Event Contracts (AsyncAPI 2.6.0)](../../06-contracts/03-events/README.md)** - Domain events
- **[Data Models](../../06-contracts/02-data-models/README.md)** - Shared data entities
- **[Technical Workflows](../04-architecture/02-workflows/)** - Operational and user workflows
- **[Deployment Strategy](../04-architecture/03-implementation/deployment-strategy/)** - Phase 1 deployment approach

### Implementation-Specific Documentation
> **Source**: This `docs/` directory

This directory contains Django/Python implementation-specific documentation:

- **[Django System Architecture](./architecture/system-architecture.md)** - Django-specific implementation details
- **[Database Design](./architecture/database-design.md)** - PostgreSQL schemas, migrations, and Django ORM models
- **[API Implementation](./02-api/api-reference.md)** - Django REST Framework implementation details
- **[Architecture Diagrams](../../04-architecture/04-backend/diagrams/architecture-overview.md)** - Django component diagrams
- **[Development Setup](./01-setup/development-setup.md)** - Local development guide
- **[Security Testing](./08-guides/security-testing.md)** - Django security implementation

## 🎯 Quick Links

### Architecture
- **High-Level**: [Architecture Summary](../../04-architecture/00-overview/architecture-summary.md)
- **Django Implementation**: [System Architecture](./architecture/system-architecture.md)
- **Phase 1 ADR**: [ADR-004: Phase 1 Modular Monolith](../../04-architecture/03-decisions/adr-004-phase-1-modular-monolith.md)

### APIs & Contracts
- **API Contracts**: [OpenAPI Specifications](../../06-contracts/01-apis/README.md)
- **Django API Implementation**: [API Reference](./02-api/api-reference.md)
- **Event Contracts**: [AsyncAPI Specifications](../../06-contracts/03-events/README.md)

### Development
- **Development Setup**: [Development Guide](./01-setup/development-setup.md)
- **Database Schema**: [Database Design](./architecture/database-design.md)
- **Testing**: [Testing Approach](../../04-architecture/07-implementation/strategies/testing-approach.md)

### Deployment
- **Deployment Strategy**: [Phase 1 Deployment](../../04-architecture/06-deployment/phase-1-deployment.md)

## 📋 Documentation Principles

### Single Source of Truth

**Submodule (`04-architecture/`)** contains:
- ✅ High-level architecture (C4 Level 1-2)
- ✅ Architecture Decision Records (ADRs)
- ✅ API contracts (OpenAPI 3.0)
- ✅ Event contracts (AsyncAPI)
- ✅ Technical workflows
- ✅ Deployment strategy (high-level)

**Backend Docs (`docs/`)** contains:
- ✅ Django-specific implementation details
- ✅ PostgreSQL database schemas
- ✅ Django REST Framework details
- ✅ Development setup guides
- ✅ Implementation-specific deployment configs

### When to Update Documentation

- **High-level architecture changes**: Update submodule (requires change request)
- **Django implementation changes**: Update backend docs
- **API contract changes**: Update submodule OpenAPI specs (requires change request)
- **Django-specific API implementation**: Update backend API reference

## 🔗 Related Documentation

- **[Repository README](../README.md)** - Project overview and submodule information
- **[DFMS Product Context](../DFMS-product-context/)** - Complete submodule documentation

---

**Last Updated**: 2026-02-13

