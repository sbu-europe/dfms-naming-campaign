# ADR-004: Phase 1 - Modular Monolith Implementation

**Status**: Accepted  
**Date**: 2026-02-13  
**Deciders**: Architecture Team, Technical Lead  
**Tags**: [architecture, phase-1, implementation]

---

## Context

For Phase 1 implementation (initial launch with single tenant - Nourish), we need a cost-optimized, rapid-development approach that:
- Minimizes infrastructure costs
- Enables faster time-to-market
- Maintains clear module boundaries for future extraction
- Supports 200-300 internal users

---

## Decision

We will implement Phase 1 as a **Modular Monolith** with the following characteristics:

1. **Single Deployable Unit**: Django application with clear module boundaries
2. **Shared Database**: PostgreSQL with schema-per-tenant isolation
3. **Module Organization**: Django apps organized by business domain
4. **Clear Interfaces**: Module-level APIs and events (preparing for extraction)
5. **Cost-Optimized**: Single EC2 instance, no API Gateway initially

---

## Consequences

### Positive

- **Faster Initial Development**: Single codebase, simpler deployment
- **Lower Infrastructure Costs**: ~$107/month (single EC2, RDS, Redis)
- **Simpler Deployment and Operations**: Docker Compose, manual deployment
- **Easier Debugging and Testing**: All code in one place
- **Clear Module Boundaries**: Django apps organized by domain (ready for extraction)

### Negative

- **Cannot Scale Modules Independently**: Single deployment unit in Phase 1
- **Technology Lock-in**: Django/Python only
- **Single Point of Failure**: One deployment unit
- **Limited Horizontal Scaling**: Cannot scale individual modules

### Neutral

- **Migration Path**: Clear evolution path to microservices
- **Module Boundaries**: Well-defined for future extraction

---

## Migration Path

- **Phase 2**: Extract high-traffic modules to microservices
  - Start with modules that need independent scaling
  - Maintain API contracts for smooth transition
- **Phase 3**: Full microservices architecture when multi-tenancy requires it
  - All modules as independent services
  - Complete separation of concerns

---

## Alternatives Considered

### Alternative 1: Full Microservices from Phase 1

**Description**: Start with microservices architecture from day one

**Pros**:
- Independent scaling from start
- Technology flexibility per service
- Better separation of concerns

**Cons**:
- Higher infrastructure costs (~$500+/month)
- More complex deployment and operations
- Slower initial development
- Overkill for single tenant, 200-300 users

**Why Not Chosen**: 
- Cost-prohibitive for Phase 1
- Unnecessary complexity for initial launch
- Can evolve to microservices when needed

---

### Alternative 2: Traditional Monolith

**Description**: Single codebase without clear module boundaries

**Pros**:
- Simplest to develop initially
- Lowest infrastructure costs

**Cons**:
- Hard to extract modules later
- Tight coupling
- Difficult migration path

**Why Not Chosen**: 
- No clear migration path
- Would require complete rewrite for Phase 2
- Does not align with long-term vision

---

## Related Decisions

- [ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md) - Long-term microservices vision
- [ADR-005: Phase 1 Frontend Approach](./adr-005-phase-1-frontend-approach.md) - Phase 1 frontend approach
- [ADR-100: Technology Stack](./adr-100-technology-stack.md) - Technology choices

---

## References

- [Modular Monolith Pattern](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)
- [Container View](../../01-architecture/container-view.md)
- [Phase 1 Deployment](../../03-implementation/deployment-strategy/phase-1-deployment.md)

---

**Last Updated**: 2026-02-13  
**Status**: Accepted

