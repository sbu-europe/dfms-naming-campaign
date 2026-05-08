# DFMS System Overview

> High-level system architecture and context (C4 Level 1)

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026  
**Architecture Level**: C4 Level 1 - System Context

---

## 📋 Document Purpose

This document provides a **high-level system context** for the Distribution and Fleet Management System (DFMS). It defines:
- What DFMS is and what it does
- Who uses the system (actors)
- What external systems it integrates with
- System boundaries and scope

**Abstraction Level**: This is a **system context view** (C4 Level 1) - showing the big picture without internal details.

---

## 🎯 System Purpose

### What is DFMS?

**DFMS (Distribution and Fleet Management System)** is a comprehensive SaaS platform that enables organizations to manage their distribution logistics, fleet operations, and vendor networks efficiently.

### Core Value Proposition

DFMS provides:
- **Centralized Operations**: Single platform for all logistics operations
- **Real-time Visibility**: Live tracking of vehicles, trips, and operations
- **Process Automation**: Automated workflows for requisitions, orders, and quality control
- **Data-Driven Decisions**: Analytics and reporting for operational insights
- **Multi-stakeholder Collaboration**: Seamless coordination between internal teams, vendors, and drivers

### Business Capabilities

| Capability | Description |
|------------|-------------|
| **Transport Management** | End-to-end management of transport requests, orders, and trip execution |
| **Fleet Management** | Vehicle lifecycle, maintenance, utilization tracking |
| **Vendor Management** | Vendor onboarding, bidding, performance tracking, invoicing |
| **Quality Control** | Inspection workflows, sampling, lab testing, compliance |
| **Operations Management** | Gate management, weighing, command center, loading/unloading |
| **Cost Management** | Trip costing, vendor billing, invoice processing, ERP integration |
| **Analytics & Reporting** | Real-time dashboards, operational reports, performance metrics |

---

## 👥 System Actors

### Primary Users (Internal)

#### 1. Administrative Users (Web Portal)
- **Logistics Coordinator**: Creates TRs, manages TOs, assigns vehicles
- **Dispatcher**: Monitors trips in real-time, handles exceptions
- **Fleet Manager**: Manages vehicles, maintenance, utilization
- **Procurement Manager**: Manages product requisitions, approvals
- **Finance Team**: Processes invoices, manages trip costing
- **QA/QC Manager**: Monitors quality compliance, reviews reports
- **System Administrator**: User management, system configuration

#### 2. Field Users (Mobile Apps)
- **Drivers**: Receive trip assignments, navigate routes, update status
- **QC Supervisors**: Conduct inspections, capture evidence, submit reports
- **Vendors**: Bid on trips, manage assignments, submit invoices

#### 3. Management Users (Web Portal)
- **Operations Manager**: Oversees all operations, reviews performance
- **Commercial Manager**: Manages vendor contracts, pricing
- **Distribution Manager**: Plans distribution, monitors deliveries

### External Actors

#### 1. Third-Party Vendors
- **Contractual Vendors**: Pre-contracted fleet providers
- **Non-Contractual Vendors**: Spot market vendors bidding on trips
- **Role**: Provide vehicles and drivers for transport operations

#### 2. Customers/Consignees
- **Role**: Receive deliveries at destination points (POIs)
- **Interaction**: Confirm deliveries, provide feedback

---

## 🔗 External Systems Integration

### 1. GPS/VTS (Vehicle Tracking System) Providers

**Purpose**: Real-time vehicle location tracking

**Integration Type**: Real-time API (REST/WebSocket)

**Data Flow**:
- **Inbound**: Vehicle location updates, trip tracking data, historical routes
- **Outbound**: Trip start/end notifications, geofence configurations

**Frequency**: Real-time (every 30-60 seconds)

**Examples**: 
- GPS tracking device providers
- Fleet management system APIs

---

### 2. ERP / Accounting Systems

**Purpose**: Financial data synchronization

**Integration Type**: Batch sync + API

**Data Flow**:
- **Outbound**: Trip costs, vendor invoices, payment requests
- **Inbound**: Payment confirmations, GL account codes, cost centers

**Frequency**: 
- Real-time: Invoice creation, payment status
- Batch: Daily financial reconciliation

**Examples**:
- SAP, Oracle ERP
- Custom accounting systems

---

### 3. Mapping Services

**Purpose**: Route planning and geocoding

**Integration Type**: API

**Data Flow**:
- **Outbound**: Origin/destination coordinates, route requests
- **Inbound**: Optimized routes, distance calculations, ETAs

**Frequency**: On-demand

**Examples**:
- Google Maps API
- OpenStreetMap (OSM)

---

### 4. SMS Gateway

**Purpose**: Notifications and alerts

**Integration Type**: API

**Data Flow**:
- **Outbound**: SMS notifications (trip assignments, alerts, OTPs)
- **Inbound**: Delivery status confirmations

**Frequency**: Event-driven

**Examples**:
- Twilio
- Local SMS gateway providers

---

### 5. IoT Device Providers

**Purpose**: Vehicle health and sensor data

**Integration Type**: Real-time API / MQTT

**Data Flow**:
- **Inbound**: Fuel consumption, engine diagnostics, temperature sensors
- **Outbound**: Device configuration, alerts

**Frequency**: Real-time (every 1-5 minutes)

**Examples**:
- Fuel monitoring devices
- Temperature sensors (for cold chain)
- Vehicle diagnostics systems

---

### 6. Payment Gateways (Phase 3)

**Purpose**: Online vendor payments

**Integration Type**: API

**Data Flow**:
- **Outbound**: Payment requests, vendor bank details
- **Inbound**: Payment confirmations, transaction status

**Frequency**: On-demand

**Examples**:
- Stripe, PayPal
- Local payment gateways

---

## 🏗️ System Context Diagram

See [system-context-diagram.mmd](./diagrams/system-context-diagram.mmd) for visual representation.

**Key Elements**:
- **DFMS Platform** (center) - The system being built
- **Internal Users** - Employees using web portal and mobile apps
- **External Users** - Vendors, drivers, QC supervisors
- **External Systems** - GPS, ERP, Maps, SMS, IoT
- **Data Flows** - How information moves between systems

---

## 🔐 System Boundaries

### What's Inside DFMS

✅ **Included in DFMS Platform**:
- Web portal (administrative interface)
- Mobile applications (driver, QC, vendor)
- Business logic and workflows
- Data storage and management
- User authentication and authorization
- Analytics and reporting engine
- Integration adapters for external systems
- Notification service
- File storage (documents, photos, videos)

### What's Outside DFMS

❌ **External to DFMS Platform**:
- GPS tracking devices (hardware)
- Vehicle hardware (IoT sensors)
- ERP/Accounting systems
- Mapping services
- SMS gateway infrastructure
- Payment gateway infrastructure
- Customer-facing delivery tracking (future consideration)

---

## 📊 System Characteristics

### Deployment Model
- **Type**: Multi-tenant SaaS
- **Hosting**: Cloud-based (AWS)
- **Access**: Web browser + Mobile apps (iOS/Android)

### Scale Expectations (Launch Client - Nourish)
- **Users**: ~100-150 concurrent users
- **Vehicles**: ~200-300 vehicles tracked
- **Trips**: ~500-1000 trips/day
- **Vendors**: ~50-100 active vendors
- **Data Volume**: ~10-20 GB/month (including photos/videos)

### Non-Functional Characteristics
- **Availability**: 99.9% uptime (SLA target)
- **Performance**: <2s page load, <500ms API response
- **Scalability**: Horizontal scaling for multi-tenant growth
- **Security**: Role-based access control, data encryption, audit logging
- **Compliance**: Data privacy regulations, industry standards

---

## 🔄 Key Workflows (High-Level)

### 1. Transport Request to Delivery Flow
```
Product Requisition → Transport Request → Transport Order → 
Vehicle Assignment → Trip Execution → Gate In/Out → 
Weighing → Loading/Unloading → QC Inspection → Trip Completion → 
Costing → Invoice Processing
```

### 2. Vendor Bidding Flow
```
TO Creation → Vendor Notification → Vendor Bidding → 
Bid Evaluation → Vendor Selection → Trip Assignment → 
Trip Execution → Invoice Submission → Payment Processing
```

### 3. Quality Control Flow
```
Unloading Start → QC Inspection Request → Physical Inspection → 
Sampling → Lab Testing → QC Pass/Fail Decision → 
Report Generation → Escalation (if fail)
```

---

## 🎯 Design Principles

### 1. Multi-Tenancy
- Single platform serving multiple organizations
- Data isolation between tenants
- Tenant-specific configurations

### 2. Modularity
- Loosely coupled modules
- Clear module boundaries
- Independent deployment capability (future)

### 3. API-First
- All functionality exposed via APIs
- Enables multiple client types (web, mobile, integrations)
- Contract-driven development

### 4. Event-Driven
- Asynchronous communication between modules
- Event sourcing for audit trail
- Real-time notifications

### 5. Scalability
- Horizontal scaling capability
- Stateless application tier
- Distributed caching

### 6. Security-First
- Authentication and authorization at every layer
- Data encryption (at rest and in transit)
- Comprehensive audit logging

---

## 📦 Technology Stack Overview

> **Note**: This is high-level technology direction. Specific versions and libraries are defined in implementation repositories.

### Backend
- **Language**: Python
- **Framework**: Django (REST APIs)
- **API Style**: RESTful + GraphQL (for complex queries)

### Frontend
- **Phase 1**: Django Templates + Bootstrap 5 (server-side rendering)
  - Server-side rendering with Django Templates
  - Bootstrap 5 for UI components
  - Vanilla JavaScript + Alpine.js for reactivity
- **Phase 2+**: Vue.js 3 SPA
  - Modern Single Page Application
  - UI Components: Modern component library
  - State Management: Pinia/Vuex

**See**: [ADR-005: Phase 1 Frontend Approach](../03-decisions/adr-005-phase-1-frontend-approach.md)

### Mobile
- **Framework**: Flutter
- **Platforms**: iOS + Android (single codebase)
- **Phase**: Available in Phase 1

### Infrastructure
- **Cloud Provider**: AWS
- **Containerization**: Docker
- **Phase 1**: Docker Compose, Single EC2 instance
- **Phase 2+**: Kubernetes (for scaling and orchestration)

**See**: [Phase 1 Deployment](../04-implementation/deployment-strategy/phase-1-deployment.md)

### Data
- **Primary Database**: PostgreSQL (relational data)
- **Cache**: Redis (sessions, real-time data)
- **File Storage**: S3-compatible object storage
- **Search**: 
  - **Phase 1**: PostgreSQL full-text search
  - **Phase 2+**: Elasticsearch (for advanced search and log aggregation)

### Integration
- **Message Queue**: 
  - **Phase 1**: Redis (used as Celery broker)
  - **Phase 2+**: RabbitMQ / AWS SQS (async processing)
- **API Gateway**: 
  - **Phase 1**: Nginx (reverse proxy)
  - **Phase 2+**: Kong / AWS API Gateway
- **Event Bus**: Event-driven architecture for module communication
  - **Phase 1**: Basic event distribution via Redis
  - **Phase 2+**: Full event bus via RabbitMQ/SQS

**See**: [ADR-004: Phase 1 Modular Monolith](../03-decisions/adr-004-phase-1-modular-monolith.md)

---

## 🔗 Related Documents

### Architecture Documents
- [Container View](./container-view.md) - C4 Level 2 (internal modules)
- [Module Boundaries](./modules/module-boundaries.md) - Module definitions
- [Integration Patterns](./integration/integration-patterns.md) - How systems connect

### Workflow Documents
- [Operational Flows](../02-workflows/operational-flows/) - Detailed workflows
- [User Workflows](../02-workflows/user-workflows/) - User journeys

### Business Context
- [Business Context Overview](../../02-domain/00-overview/business-context.md)
- [Stakeholders](../../02-domain/00-overview/stakeholders.md)
- [Business Processes](../../02-domain/01-business-domain/business-processes/)

---

## 📝 Source Documents

This document was created by analyzing:
- `source-documents/requirements/PRD_DFMS_v1.0.docx`
- `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
- `02-domain/00-overview/project-summary.md`
- `02-domain/00-overview/stakeholders.md`
- `02-domain/03-backlog/feature-overview.md`

---

**Document Status**: 🚧 Draft - Sample for review  
**Next Steps**: Review and approve approach, then create remaining architecture documents  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

