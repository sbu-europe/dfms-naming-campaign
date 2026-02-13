# ADR-200: Integration Patterns

**Status**: Accepted  
**Date**: 2026-02-13  
**Deciders**: Architecture Team, Technical Lead  
**Tags**: [integration, patterns, external-systems, resilience]

---

## Context

DFMS needs to integrate with multiple external systems:
- **GPS/VTS Provider**: Real-time vehicle tracking
- **ERP System**: Financial data synchronization
- **SMS Gateway**: Notification delivery
- **Maps Service**: Route planning, geocoding
- **IoT Devices**: Weighing scales, sensors, gate barriers
- **Payment Gateway**: Payment processing

Each integration has different characteristics:
- **Real-time vs Batch**: Some need immediate updates, others can be batched
- **Reliability**: Some are critical, others can fail gracefully
- **Direction**: Inbound (webhooks) vs Outbound (API calls)
- **Volume**: High-frequency (GPS) vs Low-frequency (ERP)

We need patterns that:
- Handle failures gracefully
- Support retries
- Provide observability
- Enable testing
- Support versioning

---

## Decision

We will use the following integration patterns:

### 1. **REST APIs** (Primary Pattern)
- **Use Cases**: GPS/VTS, Maps Service, SMS Gateway, Payment Gateway
- **Characteristics**: Synchronous, request-response
- **Pattern**: API Gateway → Service → External System
- **Resilience**: Circuit breaker, retry with exponential backoff
- **Monitoring**: Request/response logging, metrics

### 2. **Event-Driven** (Internal)
- **Use Cases**: Inter-service communication
- **Characteristics**: Asynchronous, publish-subscribe
- **Pattern**: Service → Event Bus → Consumer Services
- **Resilience**: Dead letter queue, retry mechanism
- **Monitoring**: Event tracking, consumer lag

### 3. **Batch Processing** (ERP Sync)
- **Use Cases**: ERP invoice synchronization
- **Characteristics**: Scheduled, bulk operations
- **Pattern**: Scheduled Job → Batch API → External System
- **Resilience**: Idempotency, partial failure handling
- **Monitoring**: Batch status, success/failure counts

### 4. **Webhooks** (Inbound)
- **Use Cases**: Payment Gateway callbacks, GPS alerts
- **Characteristics**: Push-based, asynchronous
- **Pattern**: External System → Webhook Endpoint → Event
- **Resilience**: Signature verification, idempotency
- **Monitoring**: Webhook delivery, processing time

### 5. **MQTT** (IoT Devices)
- **Use Cases**: IoT devices (weighing scales, sensors)
- **Characteristics**: Lightweight, pub-sub
- **Pattern**: IoT Device → MQTT Broker → Service
- **Resilience**: QoS levels, retained messages
- **Monitoring**: Device connectivity, message rates

### 6. **Adapter Pattern**
- **Purpose**: Abstract external system details
- **Implementation**: Adapter layer between service and external system
- **Benefits**: Easy to swap providers, testability, versioning

### Resilience Patterns
- **Circuit Breaker**: Prevent cascading failures
- **Retry with Exponential Backoff**: Handle transient failures
- **Timeout**: Prevent hanging requests
- **Bulkhead**: Isolate failures
- **Dead Letter Queue**: Handle failed messages

---

## Consequences

### Positive

- **Flexibility**: Right pattern for each integration type
- **Resilience**: Handles failures gracefully
- **Testability**: Adapters enable easy testing
- **Observability**: Monitoring at each integration point
- **Maintainability**: Clear patterns, easy to understand
- **Provider Independence**: Easy to swap providers

### Negative

- **Complexity**: Multiple patterns to maintain
- **Learning Curve**: Team needs to understand all patterns
- **Infrastructure**: Need multiple integration mechanisms

### Neutral

- **Initial Setup**: More configuration initially
- **Monitoring**: Need comprehensive monitoring

---

## Alternatives Considered

### Alternative 1: REST APIs Only

**Description**: Use REST APIs for all integrations

**Pros**:
- Single pattern
- Simpler to understand
- Standard HTTP

**Cons**:
- Not suitable for high-frequency (GPS)
- No push capability (webhooks)
- Synchronous only

**Why Not Chosen**: 
- Does not meet all integration needs
- Cannot handle IoT devices efficiently
- No webhook support

---

### Alternative 2: Message Queue for Everything

**Description**: Use message queue for all integrations

**Pros**:
- Decoupling
- Asynchronous
- Scalable

**Cons**:
- Overkill for simple integrations
- More complex
- Not all external systems support it

**Why Not Chosen**: 
- External systems expect REST APIs
- Too complex for simple integrations

---

## Related Decisions

- [ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md)
- [ADR-002: Event-Driven Communication](./adr-002-event-driven-communication.md)
- [Integration Patterns](../../01-architecture/integration/integration-patterns.md)
- [External Systems](../../01-architecture/integration/external-systems.md)
- [Integration Contracts](../../05-contracts/integration/)

---

## References

- [Integration Patterns](https://microservices.io/patterns/communication-style/messaging.html)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Adapter Pattern](https://refactoring.guru/design-patterns/adapter)
- [Resilience Patterns](https://microservices.io/patterns/reliability/)

---

**Last Updated**: 2026-02-13  
**Status**: Accepted

