# Source Document Mapping

> Mapping of technical context documents to source documents

**Status**: ✅ Complete  
**Last Updated**: February 13, 2026

---

## 📋 Overview

This document maps all technical context documents to their source documents (PRD, proposals, flow diagrams, etc.). This ensures traceability and helps identify where information originated.

---

## 📊 Mapping Table

| Technical Context Document | Source Document(s) | Notes |
|---------------------------|-------------------|-------|
| **00-overview/architecture-summary.md** | Business Proposal, PRD | High-level architecture overview |
| **00-overview/design-principles.md** | Business Proposal, PRD | Design principles extracted from requirements |
| **00-overview/technology-stack-overview.md** | Business Proposal, Team Expertise | Technology choices based on requirements and team |
| **01-system-design/system-overview.md** | Business Proposal, PRD | C4 Level 1 system context |
| **01-system-design/container-view.md** | PRD, Flow Diagrams | C4 Level 2 container view |
| **01-system-design/modules/module-boundaries.md** | PRD, Business Proposal | Module boundaries from PRD |
| **01-system-design/modules/module-interactions.md** | Flow Diagrams, PRD | Module interactions from flow diagrams |
| **01-system-design/data-architecture/data-model-overview.md** | PRD, Data Dictionary | Core entities from PRD |
| **01-system-design/data-architecture/data-flow.md** | Flow Diagrams, PRD | Data flow patterns |
| **01-system-design/integration/integration-patterns.md** | PRD, Business Proposal | Integration requirements |
| **01-system-design/integration/external-systems.md** | PRD, Business Proposal | External system requirements |
| **02-workflows/operational-flows/01-product-requisition-flow.md** | Flow Diagrams, PRD | Product Requisition flow |
| **02-workflows/operational-flows/02-transport-order-creation-flow.md** | Flow Diagrams, PRD | Transport Order creation flow |
| **02-workflows/operational-flows/03-trip-execution-flow.md** | Flow Diagrams, PRD | Trip execution flow |
| **02-workflows/operational-flows/04-vendor-bidding-flow.md** | Flow Diagrams, PRD | Vendor bidding flow |
| **02-workflows/operational-flows/05-gate-operations-flow.md** | Flow Diagrams, PRD | Gate operations flow |
| **02-workflows/operational-flows/06-qc-inspection-flow.md** | Flow Diagrams, PRD | QC inspection flow |
| **02-workflows/operational-flows/07-trip-costing-invoicing-flow.md** | Flow Diagrams, PRD | Trip costing and invoicing flow |
| **02-workflows/user-workflows/01-logistics-coordinator-workflows.md** | User Personas, PRD | Logistics coordinator workflows |
| **02-workflows/user-workflows/02-driver-workflows.md** | User Personas, PRD | Driver workflows |
| **02-workflows/user-workflows/03-qc-supervisor-workflows.md** | User Personas, PRD | QC supervisor workflows |
| **02-workflows/user-workflows/04-vendor-workflows.md** | User Personas, PRD | Vendor workflows |
| **02-workflows/user-workflows/05-finance-team-workflows.md** | User Personas, PRD | Finance team workflows |
| **02-workflows/exception-handling/exception-scenarios.md** | PRD, Flow Diagrams | Exception scenarios |
| **04-implementation/deployment-strategy/phase-1-deployment.md** | Business Proposal, PRD | Phase 1 deployment plan |
| **04-implementation/technology-considerations.md** | Business Proposal, Team Expertise | Technology considerations |
| **04-implementation/testing-approach.md** | PRD, Best Practices | Testing strategy |
| **04-implementation/migration-strategy.md** | Business Proposal, PRD | Data migration strategy |
| **04-implementation/rollout-plan.md** | Business Proposal, PRD | Rollout plan |
| **03-decisions/adr-001-microservices-architecture.md** | Architecture Analysis | Microservices decision |
| **03-decisions/adr-002-event-driven-communication.md** | Architecture Analysis | Event-driven decision |
| **03-decisions/adr-003-api-first-design.md** | Repository Purpose, Architecture Analysis | API-first decision |
| **03-decisions/adr-100-technology-stack.md** | Business Proposal, Team Expertise | Technology stack decision |
| **03-decisions/adr-200-integration-patterns.md** | PRD, Integration Requirements | Integration patterns decision |
| **06-contracts/api/rest/master-data-management.yaml** | PRD, Data Dictionary | Master data API contract |
| **06-contracts/api/rest/product-requisition.yaml** | PRD, User Stories | Product Requisition API contract |
| **06-contracts/api/rest/transport-management.yaml** | PRD, User Stories | Transport Management API contract |
| **06-contracts/api/rest/vendor-management.yaml** | PRD, User Stories | Vendor Management API contract |
| **06-contracts/api/rest/operations-management.yaml** | PRD, User Stories | Operations Management API contract |
| **06-contracts/api/rest/quality-control.yaml** | PRD, User Stories | Quality Control API contract |
| **06-contracts/api/rest/trip-costing.yaml** | PRD, User Stories | Trip Costing API contract |
| **06-contracts/api/rest/reporting.yaml** | PRD, Requirements | Reporting API contract |
| **06-contracts/api/rest/mobile.yaml** | PRD, User Stories | Mobile API contract |
| **06-contracts/api/rest/notifications.yaml** | PRD, Requirements | Notifications API contract |
| **06-contracts/events/event-catalog.md** | Flow Diagrams, PRD | Domain events catalog |
| **06-contracts/events/event-specifications.yaml** | Flow Diagrams, PRD | AsyncAPI event specifications |
| **06-contracts/data-models/common-entities.yaml** | PRD, Data Dictionary | Common entities |
| **06-contracts/data-models/enums-constants.yaml** | PRD, Data Dictionary | Enums and constants |
| **06-contracts/data-models/value-objects.yaml** | PRD, Data Dictionary | Value objects |
| **06-contracts/integration/gps-vts-integration.yaml** | PRD, Integration Requirements | GPS/VTS integration contract |
| **06-contracts/integration/erp-integration.yaml** | PRD, Integration Requirements | ERP integration contract |
| **06-contracts/integration/sms-gateway-integration.yaml** | PRD, Integration Requirements | SMS gateway integration contract |
| **06-contracts/integration/maps-service-integration.yaml** | PRD, Integration Requirements | Maps service integration contract |
| **06-contracts/integration/iot-devices-integration.yaml** | PRD, Integration Requirements | IoT devices integration contract |
| **06-contracts/integration/payment-gateway-integration.yaml** | PRD, Integration Requirements | Payment gateway integration contract |

---

## 📁 Source Documents

### Business Proposal
- **Location**: `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.2.1_Internal.docx`
- **Used For**: High-level requirements, business context, technology considerations

### PRD (Product Requirements Document)
- **Location**: `source-documents/discovery-phase/` (various files)
- **Used For**: Detailed requirements, user stories, functional requirements

### Flow Diagrams
- **Location**: `source-documents/discovery-phase/` (various files)
- **Used For**: Operational flows, user workflows, exception scenarios

### Data Dictionary
- **Location**: `source-documents/discovery-phase/` (various files)
- **Used For**: Data models, entities, enums

### User Personas
- **Location**: `02-domain/02-requirements/user-personas.md`
- **Used For**: User workflows, role-based features

### Meeting Minutes
- **Location**: `source-documents/discovery-phase/`
- **Used For**: Clarifications, additional requirements

---

## 🔗 Related Documents

- [Business Context Source Mapping](../../02-domain/06-reference/source-document-mapping.md)
- [Version History](./version-history.md)
- [Cross-Reference Index](./cross-reference-index.md)

---

**Last Updated**: February 13, 2026  
**Status**: ✅ Complete  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

