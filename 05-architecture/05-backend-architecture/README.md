# Backend Architecture

> Django/Python implementation-specific architecture

## 📖 Overview

This folder contains Django-specific architectural documentation that complements the high-level system architecture.

**Relationship to High-Level Architecture**:
- **[System Design](../01-system-design/)** - Technology-agnostic architecture (C4 Level 1-2)
- **This folder** - Django/Python implementation details

## 📁 Contents

| File | Description |
|------|-------------|
| **django-system-architecture.md** | Django modular monolith structure, apps, and components |
| **authentication-implementation.md** | JWT authentication with Django middleware |
| **authorization-implementation.md** | RBAC implementation with Django permissions |
| **code-organization.md** | Django app structure and module boundaries |
| **database-implementation.md** | PostgreSQL schemas, Django ORM, migrations |
| **error-handling.md** | Error handling patterns in Django |

## 🎯 Purpose

This documentation focuses on **how** the high-level architecture is implemented using Django/Python:

- **High-Level (../01-system-design/)**: What the system does, why we made decisions
- **Implementation (here)**: How we implement it with Django, code patterns, configurations

## 🔗 Related Documentation

- **[High-Level Architecture](../01-system-design/)** - System overview and container view
- **[Development Guides](../../09-development-guides/01-backend/)** - Setup, deployment, testing guides
- **[Architecture Decisions](../03-decisions/)** - ADRs explaining architectural choices
- **[Django Implementation Diagrams](../06-diagrams/07-django-implementation/)** - Visual diagrams

---

**Last Updated**: February 27, 2026
