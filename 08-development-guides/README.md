# Development Guides

> Implementation guides and knowledge bases for all DFMS implementations

## 📖 Overview

This folder contains **implementation-specific development guides** organized by technology stack. Each implementation (backend, frontend, mobile) has its own subfolder with setup guides, code examples, best practices, and deployment instructions.

## 🎯 Purpose

**What's here**:
- ✅ Development setup and environment configuration
- ✅ Code implementation guides and patterns
- ✅ Testing strategies and examples
- ✅ Deployment configurations and scripts
- ✅ Developer workflows and best practices

**What's NOT here** (see other folders):
- ❌ High-level architecture → See `04-architecture/`
- ❌ Business requirements → See `02-domain/`
- ❌ API contracts → See `06-contracts/`
- ❌ User stories → See `03-backlog/`

## 📁 Structure

### 01-backend/ (Django/Python)
Complete Django implementation guides:
- **01-setup/** - Development environment setup
- **02-api/** - Django REST Framework implementation
- **03-database/** - PostgreSQL, Django ORM, migrations
- **04-security/** - Authentication, authorization, encryption
- **05-services/** - Background tasks, caching, integrations
- **06-testing/** - Unit, integration, E2E tests
- **07-deployment/** - Docker, AWS, monitoring
- **08-guides/** - Contributing, code style, troubleshooting
- **09-reference/** - Quick reference materials

### 02-frontend/ (Future)
Frontend implementation guides (React/Vue/Angular)

### 03-mobile/ (Future)
Mobile implementation guides (Flutter/React Native)

## 📊 Documentation Hierarchy

```
02-domain/               → Business domain knowledge
05-modules/→ Technical specifications (what to build)
04-architecture/         → System & implementation architecture
06-contracts/            → API/Event contracts
08-development-guides/   → HOW to implement (this folder)
```

## 🔗 Quick Links

### Backend Developers
- **[Development Setup](./01-backend/01-setup/development-setup.md)** - Get started with Django development
- **[Django Architecture](../04-architecture/04-backend/)** - Understand Django structure
- **[API Implementation](./01-backend/02-api/)** - DRF guides
- **[Contributing Guide](./01-backend/08-guides/contributing.md)** - How to contribute

### DevOps Engineers
- **[Docker Setup](./01-backend/07-deployment/docker.md)** - Container configuration
- **[AWS Deployment](./01-backend/07-deployment/aws-setup.md)** - Cloud deployment
- **[Monitoring](./01-backend/07-deployment/monitoring.md)** - Observability setup

### QA Engineers
- **[Testing Strategy](../09-testing/strategy/testing-strategy.md)** - Overall testing approach
- **[Test Implementation](./01-backend/06-testing/)** - Unit, integration, E2E tests

## 💡 Key Principles

1. **Single Source of Truth**: Each implementation maintains its own knowledge base
2. **Reference High-Level**: Always link back to product context for "what" and "why"
3. **Focus on "How"**: Code examples, configurations, and practical guides
4. **Technology-Specific**: Each folder contains stack-specific best practices

---

**Last Updated**: February 27, 2026  
**Total Guides**: 46 files (Backend: 46, Frontend: 0, Mobile: 0)
