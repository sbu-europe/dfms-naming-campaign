# Architecture Decision Records (ADRs)

> Documented architecture decisions

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This folder contains Architecture Decision Records (ADRs) documenting key technical decisions for DFMS. ADRs capture the context, decision, and consequences of important architectural choices.

---

## 📁 ADR Documents

### **[ADR Template](./adr-template.md)**
Template for creating new ADRs.

### **Core Architecture Decisions**

- **[ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md)**
  - Decision to adopt microservices architecture
  - Module-based services, independent deployment
  - Database per service pattern

- **[ADR-002: Event-Driven Communication](./adr-002-event-driven-communication.md)**
  - Event-driven inter-service communication
  - AsyncAPI contracts, event bus
  - Hybrid approach (events + REST)

- **[ADR-003: API-First Design](./adr-003-api-first-design.md)**
  - Contract-first API design
  - OpenAPI/AsyncAPI specifications
  - Centralized contracts repository

- **[ADR-004: Phase 1 Modular Monolith](./adr-004-phase-1-modular-monolith.md)**
  - Phase 1 cost-optimized monolithic implementation
  - Django modular monolith with clear boundaries
  - Single EC2 deployment, ~$107/month
  - Migration path to microservices

- **[ADR-005: Phase 1 Frontend Approach](./adr-005-phase-1-frontend-approach.md)**
  - Django Templates + Bootstrap 5 for Phase 1
  - Server-side rendering, no separate build
  - Migration path to Vue.js 3 SPA in Phase 2

### **Technology Decisions**

- **[ADR-100: Technology Stack](./adr-100-technology-stack.md)**
  - Backend: Python/Django/FastAPI
  - Frontend: Vue.js
  - Mobile: Flutter
  - Database: PostgreSQL
  - Message Queue: RabbitMQ

### **Integration Decisions**

- **[ADR-200: Integration Patterns](./adr-200-integration-patterns.md)**
  - REST APIs, Events, Batch, Webhooks, MQTT
  - Resilience patterns
  - Adapter pattern

---

## 📊 ADR Index

| ADR | Title | Status | Tags |
|-----|-------|--------|------|
| [ADR-001](./adr-001-microservices-architecture.md) | Microservices Architecture | ✅ Accepted | architecture, scalability |
| [ADR-002](./adr-002-event-driven-communication.md) | Event-Driven Communication | ✅ Accepted | architecture, events |
| [ADR-003](./adr-003-api-first-design.md) | API-First Design | ✅ Accepted | api, contracts |
| [ADR-004](./adr-004-phase-1-modular-monolith.md) | Phase 1 Modular Monolith | ✅ Accepted | architecture, phase-1, implementation |
| [ADR-005](./adr-005-phase-1-frontend-approach.md) | Phase 1 Frontend Approach | ✅ Accepted | frontend, phase-1, implementation |
| [ADR-100](./adr-100-technology-stack.md) | Technology Stack | ✅ Accepted | technology, stack |
| [ADR-200](./adr-200-integration-patterns.md) | Integration Patterns | ✅ Accepted | integration, patterns |

---

## 🎯 ADR Principles

1. **Document Important Decisions**: Only document decisions with significant impact
2. **Context First**: Always explain the "why" before the "what"
3. **Alternatives Considered**: Document alternatives and why they weren't chosen
4. **Consequences**: Document both positive and negative consequences
5. **Status Tracking**: Keep ADR status up to date (Proposed, Accepted, Deprecated, Superseded)

---

## 🔗 Related Documents

- [Design Principles](../00-overview/design-principles.md)
- [Architecture Summary](../00-overview/architecture-summary.md)
- [Technology Stack](../00-overview/technology-stack-overview.md)
- [Integration Patterns](../01-system-design/integration/integration-patterns.md)

---

**Last Updated**: February 13, 2026  
**Status**: ✅ Complete  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

