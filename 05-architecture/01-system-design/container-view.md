# DFMS Container View

> High-level technical building blocks (C4 Level 2)

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026  
**Architecture Level**: C4 Level 2 - Container View

---

## 📋 Document Purpose

This document provides a **container view** of the DFMS system, showing the high-level technical building blocks and how they interact. A "container" in C4 terms represents a separately runnable/deployable unit (application, database, file system, etc.).

**Abstraction Level**: This is C4 Level 2 - showing containers, not detailed components.

---

## 🏗️ Container Architecture

### Overview

DFMS consists of the following containers:

1. **Web Application** (Vue.js SPA)
2. **Mobile Applications** (Flutter - iOS/Android)
3. **API Server** (Django REST Framework)
4. **Background Worker** (Celery)
5. **API Gateway** (Kong/AWS API Gateway)
6. **Database** (PostgreSQL)
7. **Cache** (Redis)
8. **Message Queue** (RabbitMQ/AWS SQS)
9. **File Storage** (AWS S3)
10. **Search Engine** (Elasticsearch - Phase 2)

---

## 📦 Container Details

### 1. Web Application

**Phase 1**: Django Templates + Bootstrap 5 (server-side rendering)  
**Phase 2+**: Vue.js 3 (Single Page Application)

**Technology**: 
- Phase 1: Django Templates + Bootstrap 5
- Phase 2+: Vue.js 3 (SPA)

**Purpose**: Administrative web portal for internal users

**See**: [ADR-005: Phase 1 Frontend Approach](../03-decisions/adr-005-phase-1-frontend-approach.md)

**Users**:
- Logistics Coordinators
- Dispatchers
- Fleet Managers
- Procurement Managers
- Finance Team
- QA/QC Managers
- System Administrators

**Phase 1 Responsibilities**:
- Server-side rendering (Django Templates)
- Handle form submissions
- Server-side validation
- Session management (Django sessions)
- Static asset serving

**Phase 2+ Responsibilities**:
- Render user interface (SPA)
- Handle user interactions
- Make API calls to backend
- Real-time updates via WebSocket
- Client-side validation
- Session management (JWT tokens)

**Communication**:
- **Phase 1**: Direct to API Server (same Django app)
- **Phase 2+**: → API Gateway (HTTPS REST calls, WebSocket)

**Deployment**:
- **Phase 1**: Part of Django application (no separate deployment)
- **Phase 2+**: Static files served via CDN (CloudFront), SPA hosted on S3 or web server

---

### 2. Mobile Applications

**Technology**: Flutter (iOS + Android)

**Apps**:
1. **Driver App**
2. **QC Supervisor App**
3. **Vendor App**

**Responsibilities**:
- Native mobile UI
- Offline capability (Phase 2)
- Camera/GPS access
- Push notifications
- Background location tracking (Driver App)

**Communication**:
- **→ API Gateway**: HTTPS REST calls
- **→ Push Notification Service**: FCM/APNS

**Deployment**:
- iOS: App Store
- Android: Google Play Store

---

### 3. API Server

**Technology**: Python + Django + Django REST Framework

**Purpose**: Core business logic and API endpoints

**Responsibilities**:
- REST API endpoints
- Business logic execution
- Authentication & authorization
- Request validation
- Data persistence (via ORM)
- Event publishing
- Real-time updates (WebSocket)

**Modules** (Logical Organization):
```
api_server/
├── master_data/          # Master Data Management
├── product_requisition/  # Product Requisition
├── transport/            # Transport Management
├── vendor/               # Vendor Management
├── operations/           # Operations Management
├── quality_control/      # Quality Control
├── fleet/                # Fleet Management
├── fuel/                 # Fuel Management
├── costing/              # Trip Costing
├── reporting/            # Reporting & Analytics
├── mobile/               # Mobile-specific APIs
└── notifications/        # Notifications
```

**Communication**:
- **← API Gateway**: Receives HTTP requests
- **→ Database**: Read/write operations
- **→ Cache**: Read/write cached data
- **→ Message Queue**: Publish events, enqueue jobs
- **→ File Storage**: Upload/download files
- **→ External APIs**: GPS, ERP, Maps, SMS

**Deployment**:
- Docker containers
- Horizontal scaling (multiple instances)
- Load balanced

**Performance**:
- Stateless (for horizontal scaling)
- Connection pooling (database)
- Async operations (via Celery)

---

### 4. Background Worker

**Technology**: Python + Celery

**Purpose**: Asynchronous task processing

**Responsibilities**:
- Background job execution
- Scheduled tasks (cron-like)
- Heavy computations
- External API calls (with retry)
- Report generation
- Email/SMS sending
- Data synchronization

**Task Types**:
- **Periodic Tasks**: Daily reports, data sync
- **Event-Driven Tasks**: Notifications, invoice generation
- **Heavy Tasks**: Report generation, data exports

**Communication**:
- **← Message Queue**: Receive tasks
- **→ Database**: Read/write operations
- **→ File Storage**: Store generated reports
- **→ External APIs**: Send emails, SMS

**Deployment**:
- Docker containers
- Multiple workers for scalability
- Task prioritization

---

### 5. API Gateway

**Phase 1**: Nginx reverse proxy (basic routing, SSL termination)  
**Phase 2+**: API Gateway (Kong/AWS API Gateway)

**Technology**: 
- Phase 1: Nginx (reverse proxy)
- Phase 2+: Kong / AWS API Gateway

**Purpose**: Single entry point for all API requests

**Phase 1 Responsibilities**:
- Basic request routing
- SSL termination
- Static file serving
- Load balancing (if multiple Django instances)

**Phase 2+ Responsibilities**:
- Request routing
- Authentication (JWT validation)
- Rate limiting (per tenant)
- Request/response transformation
- API versioning
- Logging and monitoring
- CORS handling

**Phase 2+ Features**:
- **Authentication**: JWT token validation
- **Authorization**: Route-level permissions
- **Rate Limiting**: Prevent abuse
- **Caching**: Response caching (optional)
- **Load Balancing**: Distribute requests
- **SSL Termination**: HTTPS handling

**Communication**:
- **Phase 1**: ← Web App (Django Templates), ← Mobile Apps → API Server
- **Phase 2+**: ← Web App (SPA), ← Mobile Apps → API Server

**Deployment**:
- **Phase 1**: Nginx on same EC2 instance or separate container
- **Phase 2+**: Managed service (AWS API Gateway) or Self-hosted (Kong in containers)

---

### 6. Database

**Technology**: PostgreSQL 14+

**Purpose**: Primary data store

**Data Types**:
- **Transactional Data**: TRs, TOs, Trips, Invoices
- **Master Data**: Vehicles, Drivers, Vendors, POIs
- **User Data**: Users, roles, permissions
- **Audit Logs**: All system actions

**Schema Organization**:

**Phase 1 (Current)**: Schema per Tenant
```
- tenant_1 schema
- tenant_2 schema
- shared schema (for system data)
```

**Rationale for Phase 1**:
- Complete data isolation
- Simpler security model
- Easier backup/restore per tenant
- Clear tenant boundaries

**Future Consideration (Phase 2+)**: Row-Level Security
- Single schema with tenant_id column
- RLS policies for isolation
- May be considered if schema-per-tenant becomes limiting

**Features Used**:
- ACID transactions
- Foreign keys for integrity
- Indexes for performance
- JSONB for flexible data
- Full-text search
- Partitioning (Phase 2)

**Communication**:
- **← API Server**: Read/write operations
- **← Background Worker**: Read/write operations

**Deployment**:
- Managed service (AWS RDS)
- Primary + Read replicas
- Automated backups
- Point-in-time recovery

**Performance**:
- Connection pooling
- Query optimization
- Read replicas for reporting

---

### 7. Cache

**Technology**: Redis 6+

**Purpose**: In-memory caching and session storage

**Use Cases**:
- **Session Storage**: User sessions (JWT refresh tokens)
- **API Response Caching**: Frequently accessed data
- **Real-time Data**: Trip tracking, vehicle locations
- **Rate Limiting**: API rate limit counters
- **Pub/Sub**: Real-time notifications

**Data Types Cached**:
- User sessions (TTL: 24 hours)
- Master data (vehicles, drivers) (TTL: 1 hour)
- Dashboard aggregations (TTL: 5 minutes)
- Real-time trip data (TTL: 30 seconds)

**Communication**:
- **← API Server**: Read/write cache
- **← Background Worker**: Pub/sub

**Deployment**:
- Managed service (AWS ElastiCache)
- Redis Cluster for HA
- Persistence enabled

---

### 8. Message Queue

**Phase 1**: Redis (used as Celery broker)  
**Phase 2+**: RabbitMQ / AWS SQS

**Technology**: 
- Phase 1: Redis (shared with cache)
- Phase 2+: RabbitMQ / AWS SQS

**Purpose**: Asynchronous message passing

**Phase 1 Use Cases**:
- Celery task queue (background jobs)
- Basic event distribution

**Phase 2+ Use Cases**:
- Task Queue: Background jobs for Celery
- Event Bus: Domain events between modules
- Integration Queue: External system messages

**Queues**:
```
- celery_default        # General background tasks
- celery_priority       # High-priority tasks
- events_transport      # Transport-related events
- events_qc             # QC-related events
- events_vendor         # Vendor-related events
- notifications         # Notification delivery
- integrations          # External system messages
```

**Communication**:
- **← API Server**: Publish events, enqueue tasks
- **→ Background Worker**: Consume tasks
- **→ External Systems**: Integration messages

**Deployment**:
- Managed service (AWS SQS) or
- Self-hosted (RabbitMQ in containers)
- Durable queues
- Dead-letter queues for failures

---

### 9. File Storage

**Technology**: AWS S3 / MinIO

**Purpose**: Object storage for files

**File Types**:
- **Documents**: Driver licenses, vehicle registration, invoices
- **Photos**: QC inspection photos, vehicle photos
- **Videos**: QC inspection videos
- **Reports**: Generated PDF/Excel reports
- **Exports**: Data exports

**Organization**:
```
s3://dfms-files/
├── tenants/
│   ├── tenant-1/
│   │   ├── documents/
│   │   ├── photos/
│   │   ├── videos/
│   │   └── reports/
│   └── tenant-2/
│       └── ...
└── system/
    └── templates/
```

**Features**:
- Versioning enabled
- Lifecycle policies (archive old files)
- Pre-signed URLs for secure access
- CDN integration (CloudFront)

**Communication**:
- **← API Server**: Upload/download files
- **← Background Worker**: Store generated reports

**Deployment**:
- Managed service (AWS S3)
- Bucket policies for security
- Encryption at rest

---

### 10. Search Engine (Phase 2)

**Technology**: Elasticsearch 8+

**Purpose**: Full-text search and log aggregation

**Use Cases**:
- **Full-text Search**: Search across trips, vehicles, vendors
- **Log Aggregation**: Centralized logging (ELK stack)
- **Analytics**: Real-time analytics queries
- **Audit Trail**: Searchable audit logs

**Indexes**:
```
- trips_index           # Trip data
- vehicles_index        # Vehicle data
- vendors_index         # Vendor data
- logs_index            # Application logs
- audit_index           # Audit trail
```

**Communication**:
- **← API Server**: Index data, search queries
- **← Background Worker**: Bulk indexing

**Deployment**:
- Managed service (AWS OpenSearch) or
- Self-hosted (Elasticsearch cluster)
- Multiple nodes for HA

---

## 🔄 Container Interactions

### User Request Flow

```
1. User (Web/Mobile)
   ↓ HTTPS
2. API Gateway
   ↓ Validate JWT, Route
3. API Server
   ↓ Query
4. Database / Cache
   ↓ Response
5. API Server
   ↓ JSON Response
6. API Gateway
   ↓ HTTPS
7. User (Web/Mobile)
```

### Background Job Flow

```
1. API Server
   ↓ Publish Task
2. Message Queue
   ↓ Consume Task
3. Background Worker
   ↓ Execute
4. Database / External API
   ↓ Result
5. Background Worker
   ↓ Store Result
6. Database / File Storage
```

### Event-Driven Flow

```
1. API Server (Module A)
   ↓ Publish Event
2. Message Queue
   ↓ Distribute
3. API Server (Module B, C)
   ↓ Process Event
4. Database
```

---

## 📊 Container Diagram

See [container-diagram.mmd](./diagrams/container-diagram.mmd) for visual representation.

**Key Elements**:
- All 10 containers
- Communication protocols (HTTPS, TCP, etc.)
- Data flows
- External systems

---

## 🔐 Security Considerations

### Network Security
- **Web/Mobile → API Gateway**: HTTPS only
- **API Gateway → API Server**: Internal network (VPC)
- **API Server → Database**: Encrypted connection
- **API Server → External APIs**: HTTPS only

### Authentication & Authorization
- **API Gateway**: JWT validation
- **API Server**: Role-based access control (RBAC)
- **Database**: Application-level credentials (not user credentials)

### Data Security
- **In Transit**: TLS/SSL for all communications
- **At Rest**: Database encryption, S3 encryption
- **Secrets**: Stored in AWS Secrets Manager / HashiCorp Vault

---

## 📈 Scalability Strategy

### Horizontal Scaling

**Stateless Containers** (can scale horizontally):
- ✅ Web Application (CDN)
- ✅ API Server (multiple instances)
- ✅ Background Worker (multiple workers)

**Stateful Containers** (scale vertically or with replication):
- Database (read replicas)
- Cache (Redis cluster)
- Message Queue (clustered)

### Load Distribution

```
                    Load Balancer
                         |
        +----------------+----------------+
        |                |                |
   API Server 1    API Server 2    API Server 3
        |                |                |
        +----------------+----------------+
                         |
                    Database
              (Primary + Read Replicas)
```

---

## 🚀 Deployment Architecture

### Phase 1: Simplified Deployment

```
AWS Cloud
├── VPC
│   ├── Public Subnet
│   │   ├── Load Balancer
│   │   └── API Gateway
│   ├── Private Subnet
│   │   ├── API Server (ECS/EC2)
│   │   ├── Background Worker (ECS/EC2)
│   │   ├── RDS (PostgreSQL)
│   │   └── ElastiCache (Redis)
│   └── NAT Gateway
├── S3 (File Storage)
├── SQS (Message Queue)
└── CloudFront (CDN)
```

### Phase 2: Kubernetes Deployment

```
Kubernetes Cluster (EKS)
├── Ingress Controller (API Gateway)
├── API Server Pods (auto-scaling)
├── Background Worker Pods (auto-scaling)
├── External Services
│   ├── RDS (PostgreSQL)
│   ├── ElastiCache (Redis)
│   ├── S3 (File Storage)
│   └── SQS (Message Queue)
└── Monitoring
    ├── Prometheus
    └── Grafana
```

---

## 🔗 Related Documents

### Architecture
- [System Overview](./system-overview.md) - C4 Level 1
- [Module Boundaries](./modules/module-boundaries.md) - Module organization
- [Integration Patterns](./integration/integration-patterns.md) - How containers integrate

### Design
- [Design Principles](../00-overview/design-principles.md)
- [Technology Stack](../00-overview/technology-stack-overview.md)

### Diagrams
- [System Context Diagram](./diagrams/system-context-diagram.mmd) - C4 Level 1
- [Container Diagram](./diagrams/container-diagram.mmd) - C4 Level 2

---

## 📝 Source Documents

This container view was created by analyzing:
- `source-documents/requirements/PRD_DFMS_v1.0.docx`
- `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
- `02-domain/00-overview/project-summary.md`
- Industry best practices for cloud-native architecture

---

**Document Status**: 🚧 Draft  
**Next Steps**: Create container diagram, review with team  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

