# DFMS Container View

> High-level technical building blocks (C4 Level 2)

**Status**: Active  
**Last Updated**: March 2026  
**Architecture Level**: C4 Level 2 - Container View

---

## 📋 Document Purpose

This document provides a **container view** of the DFMS system, showing the high-level technical building blocks and how they interact. A "container" in C4 terms represents a separately runnable/deployable unit (application, database, file system, etc.).

**Abstraction Level**: This is C4 Level 2 - showing containers, not detailed components.

---

## 🏗️ Container Architecture

### Overview

DFMS consists of the following containers:

1. **Web Application** (Django Templates + Bootstrap 5 in Phase 1; Vue.js SPA in Phase 2+)
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

**Technology**: Python + Django + Django REST Framework + `django-tenants`

**Purpose**: Core business logic and API endpoints

**Multi-Tenancy**: The `django-tenants` middleware is the first middleware in the Django stack. On each incoming request it:
1. Reads the subdomain (or `X-Tenant-Domain` header for mobile/API clients)
2. Looks up the matching tenant in the `public.tenants` table
3. Sets `search_path = <tenant_schema>, public` on the database connection
4. All subsequent ORM queries within the request automatically target the correct tenant schema — no `tenant_id` filtering needed in application code

**Responsibilities**:
- REST API endpoints
- Business logic execution
- Authentication (3-step: OTP → JWT issuance with `tenant_schema` embedded in token)
- Authorization (RBAC middleware — role/permission check on every request)
- Request validation
- Data persistence (via Django ORM + `django-tenants`)
- Event publishing
- Real-time updates (WebSocket / Django Channels in Phase 2)

**Modules** (Logical Organization):
```
api_server/
├── core/                 # User Management, Auth, RBAC
├── master_data/          # Master Data Management (vehicles, drivers, helpers, vendors, suppliers, dealers, routes, zones, POIs, products)
├── product_requisition/  # Product Requisition
├── transport/            # Transport Management
├── vendor/               # Vendor Management
├── operations/           # Gate & Weighing Operations
├── quality_control/      # Quality Control
├── fleet/                # Fleet Management (Phase 2)
├── fuel/                 # Fuel Management (Phase 2)
├── costing/              # Trip Costing & Finance
├── reporting/            # Reporting & Analytics
├── mobile/               # Mobile-specific APIs
└── notifications/        # Notifications & Alerts
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

**Architecture Decision**: Schema-per-tenant via `django-tenants` (all subscription tiers)
```
PostgreSQL Server
├── public                  -- shared platform entities
│   ├── tenants             -- tenant registry
│   ├── subscription_plans  -- feature/limit tiers
│   └── audit_logs          -- cross-tenant audit trail (partitioned by month)
│
├── tenant_001              -- e.g., Nourish Poultry
│   ├── users, roles, permissions
│   ├── vehicles, drivers, helpers, vendors
│   ├── suppliers, dealers, routes, zones, pois, product_categories, products
│   ├── product_requisitions, transport_requests, transport_orders, trips
│   ├── gate_entries, scale_in_entries, scale_out_entries, gate_passes
│   ├── qc_events, qc_samples, qc_inspections
│   └── trip_costs, vendor_invoices, notifications
│
└── tenant_002              -- e.g., ABC Logistics
    └── (same table set, fully isolated)
```

**Why schema-per-tenant (not RLS)**:
- Complete data isolation at the PostgreSQL level — no application-level `tenant_id` filtering
- Independent backup and restore per tenant
- `django-tenants` library handles `search_path` routing automatically
- `migrate_schemas` management command applies Django migrations to every tenant schema
- No risk of cross-tenant data leakage at the query layer

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

**Phase 1**: Redis (used as Celery broker — shared with the Cache container)  
**Phase 2+**: RabbitMQ / AWS SQS

**Technology**: 
- Phase 1: Redis (shared with Cache container — see note below)
- Phase 2+: RabbitMQ / AWS SQS

**Purpose**: Asynchronous message passing

> **Note on Redis dual-role in Phase 1**: The same Redis instance serves as both the application cache (container 7) and the Celery task broker. This is acceptable in Phase 1 with low tenant counts but introduces a single point of failure for both caching and background task delivery. The Phase 2 migration to a dedicated message queue (RabbitMQ/SQS) eliminates this risk.

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

See [container-diagram.mmd](../05-diagrams/architecture/container-diagram.mmd) for visual representation.

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
- [System Architecture Overview](../05-diagrams/architecture/system-architecture-overview.mmd) - Full-stack overview ⭐
- [System Context Diagram](../05-diagrams/architecture/system-context-diagram.mmd) - C4 Level 1
- [Container Diagram](../05-diagrams/architecture/container-diagram.mmd) - C4 Level 2

---

## 📝 Source Documents

This container view was created by analyzing:
- `source-documents/requirements/PRD_DFMS_v1.0.docx`
- `source-documents/business-proposal/BS23_Proposal_Nourish_LFMS_v1.3.1_No_Commercial.docx`
- `02-domain/00-overview/project-summary.md`
- Industry best practices for cloud-native architecture

---

**Document Status**: Active  
**Last Updated**: March 2026  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

