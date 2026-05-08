# ADR-002: Event-Driven Communication

**Status**: Accepted  
**Date**: 2026-02-13  
**Deciders**: Architecture Team, Technical Lead  
**Tags**: [architecture, integration, events, loose-coupling]

---

## Context

In a microservices architecture, services need to communicate. We have several options:
- Synchronous REST APIs (request-response)
- Asynchronous messaging (events)
- Hybrid approach

Key requirements:
- **Loose Coupling**: Services should not depend on each other's availability
- **Scalability**: Handle high event volumes
- **Reliability**: Events should not be lost
- **Eventual Consistency**: Acceptable for cross-service updates
- **Audit Trail**: Track all business events

Examples of inter-service communication:
- Product Requisition approved → Transport Request created
- Trip completed → Trip Cost calculated
- QC Inspection completed → Trip status updated
- Invoice generated → ERP sync triggered

---

## Decision

We will use **event-driven communication** as the primary pattern for inter-service communication:

1. **Event Bus**: Central message broker for event distribution
   - **Phase 1**: Redis (used as Celery broker, basic event distribution)
   - **Phase 2+**: RabbitMQ / AWS SQS (full event bus capabilities)
   - **Alternative**: Kafka (for high-throughput scenarios in Phase 2+)

2. **Domain Events**: Services publish domain events when business events occur
   - ProductRequisitionApproved
   - TripCompleted
   - QCInspectionCompleted
   - InvoiceGenerated
   - etc.

3. **Event Consumers**: Services subscribe to relevant events

4. **AsyncAPI Contracts**: All events defined in AsyncAPI specifications

5. **Event Sourcing**: Critical state changes captured as events (for audit)

6. **Synchronous APIs**: Still used for:
   - Query operations
   - Real-time user interactions
   - External API calls

---

## Consequences

### Positive

- **Loose Coupling**: Services don't need to know about each other
- **Scalability**: Event bus handles high throughput
- **Resilience**: Services can be temporarily unavailable
- **Flexibility**: Easy to add new event consumers
- **Audit Trail**: All events logged for compliance
- **Performance**: Non-blocking, asynchronous processing
- **Decoupling**: Services evolve independently

### Negative

- **Eventual Consistency**: Data may be temporarily inconsistent
- **Complexity**: More complex than synchronous calls
- **Debugging**: Harder to trace distributed flows
- **Message Ordering**: Need to handle out-of-order events
- **Duplicate Handling**: Need idempotency mechanisms
- **Monitoring**: More complex observability

### Neutral

- **Learning Curve**: Team needs to understand event patterns
- **Infrastructure**: Requires message broker setup

---

## Alternatives Considered

### Alternative 1: Synchronous REST APIs Only

**Description**: All inter-service communication via REST APIs

**Pros**:
- Simpler to understand
- Immediate consistency
- Easier debugging
- Standard HTTP patterns

**Cons**:
- Tight coupling (services must be available)
- Cascading failures
- Cannot handle high load well
- No audit trail
- Blocking calls reduce performance

**Why Not Chosen**: 
- Does not meet scalability requirements
- Tight coupling conflicts with microservices goals
- No audit trail for compliance

---

### Alternative 2: Request-Reply Pattern

**Description**: Asynchronous request-reply pattern

**Pros**:
- Non-blocking
- Better scalability
- Some decoupling

**Cons**:
- Still requires requestor to wait for reply
- More complex than events
- No broadcast capability

**Why Not Chosen**: 
- Less flexible than pure events
- Still creates coupling

---

### Alternative 3: Hybrid (Events + REST)

**Description**: Use events for notifications, REST for queries

**Pros**:
- Best of both worlds
- Events for decoupling
- REST for queries

**Cons**:
- Two patterns to maintain
- More complexity

**Why Chosen**: 
- ✅ This is actually what we're doing (events for commands/notifications, REST for queries)

---

## Related Decisions

- [ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md) - Phase 2+ vision
- [ADR-004: Phase 1 Modular Monolith](./adr-004-phase-1-modular-monolith.md) - Phase 1 approach
- [ADR-003: API-First Design](./adr-003-api-first-design.md)
- [Event Catalog](../../06-contracts/03-events/event-catalog.md)
- [Event Specifications](../../06-contracts/03-events/event-specifications.yaml)

---

## References

- [Event-Driven Architecture Patterns](https://martinfowler.com/articles/201701-event-driven.html)
- [AsyncAPI Specification](https://www.asyncapi.com/)
- [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html)
- [Integration Patterns](../01-system-design/integration/integration-patterns.md)

---

**Last Updated**: 2026-02-13  
**Status**: Accepted

