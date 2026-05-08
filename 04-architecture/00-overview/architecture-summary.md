# DFMS Architecture Summary

> High-level overview of DFMS system architecture and technical approach

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026  
**Version**: 0.1.0

---

## 📋 Executive Summary

DFMS (Distribution and Fleet Management System) is architected as a **multi-tenant SaaS platform** following **modern cloud-native principles**. The architecture emphasizes **modularity**, **scalability**, **API-first design**, and **event-driven communication** to support multiple organizations with varying operational scales.

### Key Architectural Characteristics

| Characteristic | Approach |
|----------------|----------|
| **Deployment Model** | Multi-tenant SaaS (cloud-hosted) |
| **Architecture Style** | Modular monolith (Phase 1) → Microservices-ready |
| **Communication** | REST APIs + Event-driven (async) |
| **Data Strategy** | Tenant-isolated, PostgreSQL primary |
| **Scalability** | Horizontal scaling, stateless services |
| **Integration** | API Gateway + Message Queue |
| **Mobile Strategy** | Flutter (cross-platform) |

---

## 🏗️ Architecture Approach

### C4 Model Levels

This repository documents architecture at **C4 Level 1-2** only:

#### **Level 1: System Context**
- **What**: DFMS as a black box
- **Shows**: Users, external systems, data flows
- **Document**: [System Overview](../01-system-design/system-overview.md)
- **Diagram**: [System Context Diagram](../01-system-design/diagrams/system-context-diagram.mmd)

#### **Level 2: Container View**
- **What**: High-level technical building blocks
- **Shows**: Web app, mobile apps, API layer, database, message queue
- **Document**: [Container View](../01-system-design/container-view.md)
- **Diagram**: [Container Diagram](../01-system-design/diagrams/container-diagram.mmd)

#### **Level 3-4: Components & Code**
- **What**: Detailed implementation
- **Where**: Implementation repositories (backend, frontend, mobile)
- **Why Not Here**: Too detailed for domain context layer

---

## 🎯 Architectural Goals

### 1. Multi-Tenancy
**Goal**: Single platform serving multiple organizations

**Approach**:
- Tenant isolation at data layer
- Tenant-specific configurations
- Shared infrastructure for cost efficiency
- Tenant-aware authentication and authorization

**Benefits**:
- Lower operational costs
- Faster onboarding of new clients
- Centralized updates and maintenance

---

### 2. Modularity
**Goal**: Loosely coupled, highly cohesive modules

**Approach**:
- Clear module boundaries (12 business modules)
- Well-defined interfaces between modules
- Module-level APIs and events
- Independent module evolution

**Modules**:
1. Master Data Management
2. Product Requisition Management
3. Transport Management
4. Vendor Management
5. Operations Management (Gate, Scaling, Command Center, Loading/Unloading)
6. Quality Control
7. Fleet & Vehicle Management
8. Fuel Management
9. Trip Costing & Finance
10. Reporting & Analytics
11. Mobile Applications
12. Notifications & Alerts

**Benefits**:
- Easier to understand and maintain
- Parallel development by teams
- Future microservices migration path

---

### 3. Scalability
**Goal**: Handle growth from 1 to 100+ tenants

**Approach**:
- Stateless application tier (horizontal scaling)
- Database read replicas for reporting
- Distributed caching (Redis)
- Asynchronous processing for heavy operations
- CDN for static assets

**Scale Targets**:
- **Phase 1**: 1-5 tenants, 500-1000 concurrent users
- **Phase 2**: 10-20 tenants, 2000-5000 concurrent users
- **Phase 3**: 50+ tenants, 10,000+ concurrent users

---

### 4. API-First Design
**Goal**: All functionality accessible via APIs

**Approach**:
- REST APIs for CRUD operations
- GraphQL for complex queries (Phase 2)
- WebSocket for real-time updates
- OpenAPI specifications for all endpoints

**Benefits**:
- Multiple client types (web, mobile, integrations)
- Third-party integrations
- Automated API documentation
- Contract-driven development

---

### 5. Event-Driven Architecture
**Goal**: Loose coupling and asynchronous processing

**Approach**:
- Domain events for module communication
- Message queue (RabbitMQ/AWS SQS)
- Event sourcing for audit trail
- Pub/sub for notifications

**Use Cases**:
- Trip status changes → Notifications
- TO creation → Vendor notifications
- QC completion → Finance updates
- Real-time dashboard updates

---

### 6. Security-First
**Goal**: Protect data and ensure compliance

**Approach**:
- Role-based access control (RBAC)
- Tenant-aware authorization
- Data encryption (at rest and in transit)
- Comprehensive audit logging
- API rate limiting
- Input validation and sanitization

**Compliance**:
- Data privacy regulations
- Industry standards
- Audit trail for all operations

---

## 🚀 Implementation Phases

DFMS architecture evolves through distinct phases to balance cost, complexity, and scalability:

### Phase 1: Modular Monolith (Current - DFMS Launch)
**Approach**: Cost-optimized monolithic implementation

**Characteristics**:
- **Architecture**: Modular monolith (Django apps with clear boundaries)
- **Frontend**: Django Templates + Bootstrap 5 (server-side rendering)
- **Infrastructure**: Single EC2 instance, Nginx reverse proxy
- **Message Queue**: Redis (Celery broker)
- **Deployment**: Docker Compose, manual deployment
- **Target**: Single tenant, 200-300 users
- **Cost**: ~$107/month

**Rationale**:
- Faster time-to-market
- Lower infrastructure costs
- Simpler operations
- Clear module boundaries for future extraction

**See**: [ADR-004: Phase 1 Modular Monolith](../03-decisions/adr-004-phase-1-modular-monolith.md)

---

### Phase 2: Microservices-Ready
**Approach**: Extract high-traffic modules to microservices

**Characteristics**:
- **Architecture**: Hybrid (some modules as services)
- **Frontend**: Vue.js 3 SPA
- **Infrastructure**: Kubernetes/ECS, API Gateway
- **Message Queue**: RabbitMQ/AWS SQS
- **Deployment**: CI/CD, auto-scaling
- **Target**: Multi-tenant, 1000+ users

**Migration Strategy**:
- Extract high-traffic modules first
- Maintain API contracts for smooth transition
- Gradual migration path

**See**: [ADR-001: Microservices Architecture](../03-decisions/adr-001-microservices-architecture.md)

---

### Phase 3: Full Microservices
**Approach**: Complete microservices architecture

**Characteristics**:
- **Architecture**: All modules as independent services
- **Infrastructure**: Kubernetes, service mesh
- **Target**: 50+ tenants, 10,000+ users

**Benefits**:
- Independent scaling per module
- Technology flexibility
- Complete separation of concerns

---

### Phase Comparison

| Characteristic | Phase 1 | Phase 2+ |
|----------------|---------|----------|
| **Architecture Style** | Modular Monolith | Microservices-ready → Microservices |
| **Frontend** | Django Templates + Bootstrap 5 | Vue.js 3 SPA |
| **API Gateway** | Nginx (reverse proxy) | Kong/AWS API Gateway |
| **Message Queue** | Redis (Celery broker) | RabbitMQ/AWS SQS |
| **Deployment** | Single EC2, Docker Compose | Kubernetes/ECS, auto-scaling |
| **Multi-Tenancy** | Schema-per-tenant | Schema-per-tenant → Row-level security (optional) |
| **Cost** | ~$107/month | ~$500+/month |
| **Target Users** | 200-300 | 1000+ → 10,000+ |

---

## 🔧 Technical Building Blocks

### Application Layer

#### **Web Portal**
- **Phase 1**: Django Templates + Bootstrap 5 (server-side rendering)
- **Phase 2+**: Vue.js 3 (SPA)
- **Purpose**: Administrative interface for internal users
- **Users**: Logistics coordinators, dispatchers, fleet managers, finance team
- **Features**: Full DFMS functionality

**See**: [ADR-005: Phase 1 Frontend Approach](../03-decisions/adr-005-phase-1-frontend-approach.md)

#### **Mobile Applications**
- **Technology**: Flutter (iOS + Android)
- **Purpose**: Field operations
- **Apps**:
  - **Driver App**: Trip management, navigation, status updates
  - **QC Supervisor App**: Inspections, photo/video capture, reports
  - **Vendor App**: Bidding, trip management, invoicing

#### **API Gateway**
- **Phase 1**: Nginx reverse proxy (basic routing, SSL termination)
- **Phase 2+**: API Gateway (Kong/AWS API Gateway)
- **Purpose**: Single entry point for all API requests

**Phase 1 Features**:
- Basic request routing
- SSL termination
- Static file serving

**Phase 2+ Features**:
- Authentication and authorization (JWT validation)
- Rate limiting (per tenant)
- Request routing
- Request/response transformation
- API versioning
- Logging and monitoring
- CORS handling

---

### Data Layer

#### **Primary Database**
- **Technology**: PostgreSQL
- **Purpose**: Transactional data, master data
- **Phase 1 Strategy**: Schema-per-tenant isolation
  - Complete data isolation
  - Simpler security model
  - Easier backup/restore per tenant
  - Clear tenant boundaries
- **Phase 2+ Consideration**: Row-Level Security (optional)
  - Single schema with tenant_id column
  - RLS policies for isolation
  - May be considered if schema-per-tenant becomes limiting
- **Features**: ACID compliance, relational integrity

#### **Cache Layer**
- **Technology**: Redis
- **Purpose**: Session management, frequently accessed data
- **Use Cases**:
  - User sessions
  - Real-time trip tracking data
  - Dashboard aggregations

#### **File Storage**
- **Technology**: S3-compatible object storage
- **Purpose**: Documents, photos, videos
- **Use Cases**:
  - QC inspection photos/videos
  - Driver documents
  - Vehicle documents
  - Invoice attachments

#### **Search Engine**
- **Technology**: Elasticsearch (Phase 2)
- **Purpose**: Advanced search and analytics
- **Use Cases**:
  - Full-text search across trips, vehicles, vendors
  - Log aggregation and analysis

---

### Integration Layer

#### **Message Queue**
- **Phase 1**: Redis (used as Celery broker)
- **Phase 2+**: RabbitMQ / AWS SQS
- **Purpose**: Asynchronous processing, event distribution

**Phase 1 Use Cases**:
- Celery task queue (background jobs)
- Basic event distribution

**Phase 2+ Use Cases**:
- Task Queue: Background jobs for Celery
- Event Bus: Domain events between modules
- Integration Queue: External system messages

#### **External Integrations**
- **GPS/VTS**: Real-time vehicle tracking
- **ERP**: Financial data synchronization
- **Maps**: Route planning and geocoding
- **SMS Gateway**: Notifications
- **IoT Devices**: Vehicle sensors, fuel monitoring
- **Payment Gateway**: Vendor payments (Phase 3)

---

## 📊 Module Architecture

### Module Organization

```
┌─────────────────────────────────────────────────────────────┐
│                     DFMS Platform                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Master     │  │   Product    │  │  Transport   │     │
│  │    Data      │  │ Requisition  │  │  Management  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Vendor     │  │  Operations  │  │   Quality    │     │
│  │ Management   │  │  Management  │  │   Control    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Fleet     │  │     Fuel     │  │     Trip     │     │
│  │  Management  │  │  Management  │  │   Costing    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Reporting   │  │    Mobile    │  │Notifications │     │
│  │  & Analytics │  │     Apps     │  │  & Alerts    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│              Shared Services & Infrastructure                │
│  (Auth, Logging, Monitoring, File Storage, Cache)          │
└─────────────────────────────────────────────────────────────┘
```

### Module Communication

**Synchronous** (REST APIs):
- Direct module-to-module calls for immediate responses
- Example: Transport Management → Master Data (get vehicle details)

**Asynchronous** (Events):
- Loosely coupled communication via events
- Example: TO Created → Vendor Management (notify vendors)

---

## 🚀 Deployment Architecture

### Phase 1: Modular Monolith
**Approach**: Single deployable unit with clear module boundaries

**Rationale**:
- Faster initial development
- Simpler deployment and operations
- Lower infrastructure costs
- Easier debugging and testing

**Structure**:
- Single codebase with module separation
- Shared database with module-specific schemas
- Single deployment pipeline

---

### Phase 2-3: Microservices-Ready
**Approach**: Prepare for future microservices migration

**Strategy**:
- Clear module boundaries (already established)
- Module-level APIs and events
- Independent data models per module
- Service mesh preparation

**Migration Path**:
- Extract high-traffic modules first (Transport, Trip Tracking)
- Keep low-traffic modules in monolith
- Gradual migration based on need

---

## 🔐 Security Architecture

### Authentication & Authorization

**Authentication**:
- JWT-based authentication
- Session management (Redis)
- Multi-factor authentication (Phase 2)
- SSO integration (Phase 3)

**Authorization**:
- Role-based access control (RBAC)
- Tenant-aware permissions
- Fine-grained resource-level permissions
- API-level authorization checks

### Data Security

**Encryption**:
- TLS/SSL for data in transit
- Database encryption at rest
- Encrypted file storage
- Encrypted backups

**Audit Logging**:
- All user actions logged
- System events logged
- Immutable audit trail
- Compliance reporting

---

## 📈 Performance & Scalability

### Performance Targets

| Metric | Target | Phase |
|--------|--------|-------|
| **API Response Time** | < 500ms (p95) | Phase 1 |
| **Page Load Time** | < 2s | Phase 1 |
| **Concurrent Users** | 500-1000 | Phase 1 |
| **Database Queries** | < 100ms (p95) | Phase 1 |
| **Real-time Updates** | < 1s latency | Phase 1 |

### Scalability Strategy

**Horizontal Scaling**:
- Stateless application servers
- Load balancer distribution
- Auto-scaling based on metrics

**Database Scaling**:
- Read replicas for reporting
- Connection pooling
- Query optimization
- Partitioning (Phase 2)

**Caching Strategy**:
- Application-level caching
- Database query caching
- CDN for static assets
- Redis for session and real-time data

---

## 🔄 Integration Patterns

### External System Integration

**Pattern 1: Real-Time API Integration**
- **Use Case**: GPS tracking, Maps
- **Approach**: REST API calls, WebSocket
- **Frequency**: Real-time (seconds)

**Pattern 2: Batch Synchronization**
- **Use Case**: ERP financial sync
- **Approach**: Scheduled batch jobs
- **Frequency**: Hourly/Daily

**Pattern 3: Event-Driven Integration**
- **Use Case**: Notifications (SMS, Email)
- **Approach**: Async events via message queue
- **Frequency**: Event-triggered

**Pattern 4: Webhook Integration**
- **Use Case**: Payment gateway callbacks
- **Approach**: HTTP webhooks
- **Frequency**: Event-triggered

---

## 🛠️ Technology Stack (High-Level)

### Backend
- **Language**: Python 3.x
- **Framework**: Django + Django REST Framework
- **API Style**: REST (Phase 1), GraphQL (Phase 2)
- **Task Queue**: Celery

### Frontend
- **Framework**: Vue.js 3.x
- **State Management**: Pinia/Vuex
- **UI Library**: Modern component library
- **Build Tool**: Vite

### Mobile
- **Framework**: Flutter
- **Platforms**: iOS + Android (single codebase)
- **State Management**: Provider/Riverpod

### Infrastructure
- **Cloud**: AWS
- **Containers**: Docker
- **Orchestration**: Kubernetes (Phase 2)
- **CI/CD**: GitHub Actions / GitLab CI

### Data
- **Database**: PostgreSQL 14+
- **Cache**: Redis 6+
- **File Storage**: AWS S3 / MinIO
- **Search**: Elasticsearch 8+ (Phase 2)
- **Message Queue**: RabbitMQ / AWS SQS

---

## 📋 Architectural Decisions

Key architectural decisions are documented as Architecture Decision Records (ADRs):

1. **[ADR-001](../03-decisions/adr-001-microservices-architecture.md)**: Microservices Architecture
2. **[ADR-002](../03-decisions/adr-002-event-driven-communication.md)**: Event-Driven Communication
3. **[ADR-003](../03-decisions/adr-003-api-first-design.md)**: API-First Design
4. **[ADR-004](../03-decisions/adr-004-phase-1-modular-monolith.md)**: Phase 1 Modular Monolith
5. **[ADR-005](../03-decisions/adr-005-phase-1-frontend-approach.md)**: Phase 1 Frontend Approach
6. **[ADR-100](../03-decisions/adr-100-technology-stack.md)**: Technology Stack
7. **[ADR-200](../03-decisions/adr-200-integration-patterns.md)**: Integration Patterns

---

## 🔗 Related Documents

### Architecture Details
- [System Overview](../01-system-design/system-overview.md) - C4 Level 1
- [Container View](../01-system-design/container-view.md) - C4 Level 2
- [Module Boundaries](../01-system-design/modules/module-boundaries.md)
- [Integration Patterns](../01-system-design/integration/integration-patterns.md)

### Design & Implementation
- [Design Principles](./design-principles.md)
- [Technology Stack Overview](./technology-stack-overview.md)
- [Implementation Approach](../07-implementation/)

### Business Context
- [Business Processes](../../02-domain/01-business-domain/business-processes/)
- [User Stories](../../02-domain/03-backlog/phase-1/user-stories/)
- [Business Rules](../../02-domain/03-business-rules/business-rules.md)

---

## 📝 Source Documents

This architecture summary was created by analyzing:
- `source-documents/requirements/PRD_DFMS_v1.0.docx`
- `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
- `02-domain/00-overview/project-summary.md`
- `02-domain/03-backlog/feature-overview.md`
- `02-domain/01-business-domain/business-processes/`

---

**Document Status**: 🚧 Draft  
**Next Steps**: Review and refine, create detailed architecture documents  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

