# Cross-Reference Index

> Comprehensive index of all technical context documents

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document provides a comprehensive index of all technical context documents with cross-references to related documents.

---

## 📊 Document Index

### 00-overview/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [architecture-summary.md](../00-overview/architecture-summary.md) | High-level architecture overview | [system-overview.md](../01-system-design/system-overview.md), [container-view.md](../01-system-design/container-view.md) |
| [design-principles.md](../00-overview/design-principles.md) | Core design principles | [ADR-001](../03-decisions/adr-001-microservices-architecture.md), [ADR-003](../03-decisions/adr-003-api-first-design.md) |
| [technology-stack-overview.md](../00-overview/technology-stack-overview.md) | Technology stack overview | [ADR-100](../03-decisions/adr-100-technology-stack.md) |

### 01-system-design/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [system-overview.md](../01-system-design/system-overview.md) | C4 Level 1 system context | [container-view.md](../01-system-design/container-view.md), [architecture-summary.md](../00-overview/architecture-summary.md) |
| [container-view.md](../01-system-design/container-view.md) | C4 Level 2 container view | [system-overview.md](../01-system-design/system-overview.md), [module-boundaries.md](../01-system-design/modules/module-boundaries.md) |
| [modules/module-boundaries.md](../01-system-design/modules/module-boundaries.md) | Module boundaries | [module-interactions.md](../01-system-design/modules/module-interactions.md), [ADR-001](../03-decisions/adr-001-microservices-architecture.md) |
| [modules/module-interactions.md](../01-system-design/modules/module-interactions.md) | Module interactions | [module-boundaries.md](../01-system-design/modules/module-boundaries.md), [ADR-002](../03-decisions/adr-002-event-driven-communication.md) |
| [data-architecture/data-model-overview.md](../01-system-design/data-architecture/data-model-overview.md) | Data model overview | [common-entities.yaml](../06-contracts/data-models/common-entities.yaml), [data-flow.md](../01-system-design/data-architecture/data-flow.md) |
| [data-architecture/data-flow.md](../01-system-design/data-architecture/data-flow.md) | Data flow patterns | [data-model-overview.md](../01-system-design/data-architecture/data-model-overview.md), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [integration/integration-patterns.md](../01-system-design/integration/integration-patterns.md) | Integration patterns | [ADR-200](../03-decisions/adr-200-integration-patterns.md), [external-systems.md](../01-system-design/integration/external-systems.md) |
| [integration/external-systems.md](../01-system-design/integration/external-systems.md) | External systems | [integration-patterns.md](../01-system-design/integration/integration-patterns.md), [Integration Contracts](../06-contracts/integration/) |

### 02-workflows/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [operational-flows/01-product-requisition-flow.md](../02-workflows/operational-flows/01-product-requisition-flow.md) | Product Requisition flow | [product-requisition.yaml](../06-contracts/api/rest/product-requisition.yaml), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [operational-flows/02-transport-order-creation-flow.md](../02-workflows/operational-flows/02-transport-order-creation-flow.md) | Transport Order creation flow | [transport-management.yaml](../06-contracts/api/rest/transport-management.yaml), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [operational-flows/03-trip-execution-flow.md](../02-workflows/operational-flows/03-trip-execution-flow.md) | Trip execution flow | [transport-management.yaml](../06-contracts/api/rest/transport-management.yaml), [mobile.yaml](../06-contracts/api/rest/mobile.yaml) |
| [operational-flows/04-vendor-bidding-flow.md](../02-workflows/operational-flows/04-vendor-bidding-flow.md) | Vendor bidding flow | [vendor-management.yaml](../06-contracts/api/rest/vendor-management.yaml), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [operational-flows/05-gate-operations-flow.md](../02-workflows/operational-flows/05-gate-operations-flow.md) | Gate operations flow | [operations-management.yaml](../06-contracts/api/rest/operations-management.yaml), [iot-devices-integration.yaml](../06-contracts/integration/iot-devices-integration.yaml) |
| [operational-flows/06-qc-inspection-flow.md](../02-workflows/operational-flows/06-qc-inspection-flow.md) | QC inspection flow | [quality-control.yaml](../06-contracts/api/rest/quality-control.yaml), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [operational-flows/07-trip-costing-invoicing-flow.md](../02-workflows/operational-flows/07-trip-costing-invoicing-flow.md) | Trip costing and invoicing flow | [trip-costing.yaml](../06-contracts/api/rest/trip-costing.yaml), [erp-integration.yaml](../06-contracts/integration/erp-integration.yaml) |
| [user-workflows/01-logistics-coordinator-workflows.md](../02-workflows/user-workflows/01-logistics-coordinator-workflows.md) | Logistics coordinator workflows | [transport-management.yaml](../06-contracts/api/rest/transport-management.yaml), [reporting.yaml](../06-contracts/api/rest/reporting.yaml) |
| [user-workflows/02-driver-workflows.md](../02-workflows/user-workflows/02-driver-workflows.md) | Driver workflows | [mobile.yaml](../06-contracts/api/rest/mobile.yaml), [gps-vts-integration.yaml](../06-contracts/integration/gps-vts-integration.yaml) |
| [user-workflows/03-qc-supervisor-workflows.md](../02-workflows/user-workflows/03-qc-supervisor-workflows.md) | QC supervisor workflows | [quality-control.yaml](../06-contracts/api/rest/quality-control.yaml), [mobile.yaml](../06-contracts/api/rest/mobile.yaml) |
| [user-workflows/04-vendor-workflows.md](../02-workflows/user-workflows/04-vendor-workflows.md) | Vendor workflows | [vendor-management.yaml](../06-contracts/api/rest/vendor-management.yaml), [mobile.yaml](../06-contracts/api/rest/mobile.yaml) |
| [user-workflows/05-finance-team-workflows.md](../02-workflows/user-workflows/05-finance-team-workflows.md) | Finance team workflows | [trip-costing.yaml](../06-contracts/api/rest/trip-costing.yaml), [reporting.yaml](../06-contracts/api/rest/reporting.yaml) |
| [exception-handling/exception-scenarios.md](../02-workflows/exception-handling/exception-scenarios.md) | Exception scenarios | All operational flows, [event-catalog.md](../06-contracts/events/event-catalog.md) |

### 04-implementation/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [deployment-strategy/phase-1-deployment.md](../04-implementation/deployment-strategy/phase-1-deployment.md) | Phase 1 deployment plan | [rollout-plan.md](../04-implementation/rollout-plan.md), [migration-strategy.md](../04-implementation/migration-strategy.md) |
| [technology-considerations.md](../04-implementation/technology-considerations.md) | Technology considerations | [ADR-100](../03-decisions/adr-100-technology-stack.md), [technology-stack-overview.md](../00-overview/technology-stack-overview.md) |
| [testing-approach.md](../04-implementation/testing-approach.md) | Testing strategy | [ADR-003](../03-decisions/adr-003-api-first-design.md) |
| [migration-strategy.md](../04-implementation/migration-strategy.md) | Data migration strategy | [deployment-strategy/phase-1-deployment.md](../04-implementation/deployment-strategy/phase-1-deployment.md) |
| [rollout-plan.md](../04-implementation/rollout-plan.md) | Rollout plan | [deployment-strategy/phase-1-deployment.md](../04-implementation/deployment-strategy/phase-1-deployment.md) |

### 03-decisions/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [adr-template.md](../03-decisions/adr-template.md) | ADR template | All ADRs |
| [adr-001-microservices-architecture.md](../03-decisions/adr-001-microservices-architecture.md) | Microservices architecture decision | [container-view.md](../01-system-design/container-view.md), [module-boundaries.md](../01-system-design/modules/module-boundaries.md) |
| [adr-002-event-driven-communication.md](../03-decisions/adr-002-event-driven-communication.md) | Event-driven communication decision | [event-catalog.md](../06-contracts/events/event-catalog.md), [event-specifications.yaml](../06-contracts/events/event-specifications.yaml) |
| [adr-003-api-first-design.md](../03-decisions/adr-003-api-first-design.md) | API-first design decision | All API contracts, [REPOSITORY_PURPOSE.md](../../../02-REPOSITORY_PURPOSE.md) |
| [adr-100-technology-stack.md](../03-decisions/adr-100-technology-stack.md) | Technology stack decision | [technology-stack-overview.md](../00-overview/technology-stack-overview.md) |
| [adr-200-integration-patterns.md](../03-decisions/adr-200-integration-patterns.md) | Integration patterns decision | [integration-patterns.md](../01-system-design/integration/integration-patterns.md), All integration contracts |

### 06-contracts/
| Document | Description | Related Documents |
|----------|-------------|-------------------|
| [api/rest/master-data-management.yaml](../06-contracts/api/rest/master-data-management.yaml) | Master Data API | [common-entities.yaml](../06-contracts/data-models/common-entities.yaml) |
| [api/rest/product-requisition.yaml](../06-contracts/api/rest/product-requisition.yaml) | Product Requisition API | [01-product-requisition-flow.md](../02-workflows/operational-flows/01-product-requisition-flow.md), [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [api/rest/transport-management.yaml](../06-contracts/api/rest/transport-management.yaml) | Transport Management API | [02-transport-order-creation-flow.md](../02-workflows/operational-flows/02-transport-order-creation-flow.md), [03-trip-execution-flow.md](../02-workflows/operational-flows/03-trip-execution-flow.md) |
| [api/rest/vendor-management.yaml](../06-contracts/api/rest/vendor-management.yaml) | Vendor Management API | [04-vendor-bidding-flow.md](../02-workflows/operational-flows/04-vendor-bidding-flow.md) |
| [api/rest/operations-management.yaml](../06-contracts/api/rest/operations-management.yaml) | Operations Management API | [05-gate-operations-flow.md](../02-workflows/operational-flows/05-gate-operations-flow.md) |
| [api/rest/quality-control.yaml](../06-contracts/api/rest/quality-control.yaml) | Quality Control API | [06-qc-inspection-flow.md](../02-workflows/operational-flows/06-qc-inspection-flow.md) |
| [api/rest/trip-costing.yaml](../06-contracts/api/rest/trip-costing.yaml) | Trip Costing API | [07-trip-costing-invoicing-flow.md](../02-workflows/operational-flows/07-trip-costing-invoicing-flow.md), [erp-integration.yaml](../06-contracts/integration/erp-integration.yaml) |
| [api/rest/reporting.yaml](../06-contracts/api/rest/reporting.yaml) | Reporting API | [01-logistics-coordinator-workflows.md](../02-workflows/user-workflows/01-logistics-coordinator-workflows.md) |
| [api/rest/mobile.yaml](../06-contracts/api/rest/mobile.yaml) | Mobile APIs | [02-driver-workflows.md](../02-workflows/user-workflows/02-driver-workflows.md), [03-qc-supervisor-workflows.md](../02-workflows/user-workflows/03-qc-supervisor-workflows.md) |
| [api/rest/notifications.yaml](../06-contracts/api/rest/notifications.yaml) | Notifications API | [sms-gateway-integration.yaml](../06-contracts/integration/sms-gateway-integration.yaml) |
| [events/event-catalog.md](../06-contracts/events/event-catalog.md) | Event catalog | [event-specifications.yaml](../06-contracts/events/event-specifications.yaml), [ADR-002](../03-decisions/adr-002-event-driven-communication.md) |
| [events/event-specifications.yaml](../06-contracts/events/event-specifications.yaml) | AsyncAPI specification | [event-catalog.md](../06-contracts/events/event-catalog.md) |
| [data-models/common-entities.yaml](../06-contracts/data-models/common-entities.yaml) | Common entities | [data-model-overview.md](../01-system-design/data-architecture/data-model-overview.md) |
| [data-models/enums-constants.yaml](../06-contracts/data-models/enums-constants.yaml) | Enums and constants | [common-entities.yaml](../06-contracts/data-models/common-entities.yaml) |
| [data-models/value-objects.yaml](../06-contracts/data-models/value-objects.yaml) | Value objects | [common-entities.yaml](../06-contracts/data-models/common-entities.yaml) |
| [integration/gps-vts-integration.yaml](../06-contracts/integration/gps-vts-integration.yaml) | GPS/VTS integration | [external-systems.md](../01-system-design/integration/external-systems.md) |
| [integration/erp-integration.yaml](../06-contracts/integration/erp-integration.yaml) | ERP integration | [external-systems.md](../01-system-design/integration/external-systems.md), [07-trip-costing-invoicing-flow.md](../02-workflows/operational-flows/07-trip-costing-invoicing-flow.md) |
| [integration/sms-gateway-integration.yaml](../06-contracts/integration/sms-gateway-integration.yaml) | SMS gateway integration | [notifications.yaml](../06-contracts/api/rest/notifications.yaml) |
| [integration/maps-service-integration.yaml](../06-contracts/integration/maps-service-integration.yaml) | Maps service integration | [external-systems.md](../01-system-design/integration/external-systems.md) |
| [integration/iot-devices-integration.yaml](../06-contracts/integration/iot-devices-integration.yaml) | IoT devices integration | [05-gate-operations-flow.md](../02-workflows/operational-flows/05-gate-operations-flow.md) |
| [integration/payment-gateway-integration.yaml](../06-contracts/integration/payment-gateway-integration.yaml) | Payment gateway integration | [trip-costing.yaml](../06-contracts/api/rest/trip-costing.yaml) |

---

## 🔗 External References

- [Business Context](../../02-domain/)
- [Repository Purpose](../../../02-REPOSITORY_PURPOSE.md)
- [Product Vision](../../../01-PRODUCT_VISION.md)
- [Source Documents](../../../source-documents/)

---

**Last Updated**: February 13, 2026  
**Status**: ✅ Complete  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

