# ADR-003: API-First Design

**Status**: Accepted  
**Date**: 2026-02-13  
**Deciders**: Architecture Team, Technical Lead  
**Tags**: [api, contracts, design, integration]

---

## Context

DFMS will have multiple clients:
- **Web application**: 
  - Phase 1: Django Templates (server-side rendering)
  - Phase 2+: Vue.js 3 SPA
- **Mobile applications**: Flutter (Driver, QC Supervisor, Vendor) - Available in Phase 1
- **External systems**: ERP, GPS/VTS, SMS Gateway, etc.
- **Future integrations**: Additional clients as needed

We need to:
- Define clear contracts before implementation
- Enable parallel development (frontend/backend)
- Support multiple client types
- Ensure consistency across implementations
- Enable contract validation
- Support code generation

---

## Decision

We will adopt an **API-First Design** approach:

1. **Contract Definition First**: Define all APIs before implementation
   - OpenAPI 3.0 for REST APIs
   - AsyncAPI 2.6.0 for events
   - JSON Schema for data models

2. **Centralized Contracts**: All contracts in `../../../06-contracts/`
   - API contracts
   - Event contracts
   - Data models
   - Integration contracts

3. **Contract as Source of Truth**: Contracts define the interface
   - Implementation repos import this repo as submodule
   - Contracts drive code generation
   - Contracts enable validation

4. **Versioning**: Contracts are versioned
   - Semantic versioning
   - Backward compatibility considerations

5. **Documentation**: Contracts include comprehensive documentation
   - Request/response examples
   - Error codes
   - Authentication requirements

---

## Consequences

### Positive

- **Parallel Development**: Frontend and backend teams work simultaneously
- **Consistency**: Same contracts used across all implementations
- **Code Generation**: Generate client/server code from contracts
- **Validation**: Validate requests/responses against contracts
- **Documentation**: Self-documenting APIs
- **Testing**: Generate test cases from contracts
- **Multi-Client Support**: Same contracts for web, mobile, external systems
- **Submodule Architecture**: Implementation repos import contracts

### Negative

- **Upfront Design Time**: More time spent on design
- **Contract Maintenance**: Need to keep contracts in sync with implementation
- **Learning Curve**: Team needs to understand OpenAPI/AsyncAPI

### Neutral

- **Tooling**: Need tools for contract validation and code generation

---

## Alternatives Considered

### Alternative 1: Code-First Approach

**Description**: Implement APIs first, generate documentation from code

**Pros**:
- Faster initial development
- Documentation always matches code
- Less upfront design

**Cons**:
- Cannot work in parallel
- Contracts not available early
- Harder to coordinate across teams
- No contract validation
- Documentation may be incomplete

**Why Not Chosen**: 
- Does not support parallel development
- Cannot use contracts for validation
- Does not fit submodule architecture

---

### Alternative 2: Design-First (Informal)

**Description**: Design APIs informally (markdown, diagrams) before implementation

**Pros**:
- Faster than formal contracts
- Some upfront design

**Cons**:
- No machine-readable format
- Cannot generate code
- Cannot validate
- Ambiguity in specifications
- Harder to maintain

**Why Not Chosen**: 
- Cannot leverage tooling
- No code generation
- Ambiguity causes issues

---

## Related Decisions

- [ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md) - Phase 2+ vision
- [ADR-004: Phase 1 Modular Monolith](./adr-004-phase-1-modular-monolith.md) - Phase 1 approach
- [ADR-005: Phase 1 Frontend Approach](./adr-005-phase-1-frontend-approach.md) - Phase 1 frontend
- [ADR-002: Event-Driven Communication](./adr-002-event-driven-communication.md)
- [Repository Purpose](../../../02-REPOSITORY_PURPOSE.md)
- [API Contracts](../../../../06-contracts/01-apis/)

---

## References

- [OpenAPI Specification](https://swagger.io/specification/)
- [AsyncAPI Specification](https://www.asyncapi.com/)
- [API-First Design](https://swagger.io/resources/articles/adopting-an-api-first-approach/)
- [Contract Testing](https://martinfowler.com/articles/contractTest.html)

---

**Last Updated**: 2026-02-13  
**Status**: Accepted

