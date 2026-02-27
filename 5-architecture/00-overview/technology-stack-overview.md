# DFMS Technology Stack Overview

> High-level technology choices and rationale

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026  
**Version**: 0.1.0

---

## 📋 Overview

This document outlines the high-level technology direction for DFMS. **Note**: This defines technology categories and principles, not specific versions or libraries. Implementation repositories will specify exact versions and configurations.

**Purpose**:
- Guide technology selection
- Ensure consistency across modules
- Communicate technical direction
- Support architectural goals

---

## 🎯 Technology Selection Principles

### 1. **Proven & Mature**
- Use battle-tested technologies
- Prefer stable over bleeding-edge
- Strong community support

### 2. **Cloud-Native**
- Designed for cloud deployment
- Horizontal scaling capability
- Container-friendly

### 3. **Open Source Preferred**
- Avoid vendor lock-in
- Community-driven development
- Cost-effective

### 4. **Developer Productivity**
- Good documentation
- Rich ecosystem
- Rapid development capability

---

## 🏗️ Technology Stack

### Phase 1 vs Phase 2+ Overview

| Component | Phase 1 | Phase 2+ |
|-----------|---------|----------|
| **Frontend** | Django Templates + Bootstrap 5 | Vue.js 3 SPA |
| **API Gateway** | Nginx (reverse proxy) | Kong/AWS API Gateway |
| **Message Queue** | Redis (Celery broker) | RabbitMQ/AWS SQS |
| **Deployment** | Docker Compose, Single EC2 | Kubernetes/ECS |
| **Search** | PostgreSQL full-text | Elasticsearch |
| **Multi-Tenancy** | Schema-per-tenant | Schema-per-tenant → Row-level security (optional) |

**See**: [ADR-004: Phase 1 Modular Monolith](../03-decisions/adr-004-phase-1-modular-monolith.md) for Phase 1 rationale

---

### Backend Technologies

#### **Programming Language: Python 3.x**

**Rationale**:
- ✅ Rapid development
- ✅ Rich ecosystem (Django, Celery, etc.)
- ✅ Strong data processing libraries
- ✅ Good for API development
- ✅ Team expertise

**Use Cases**:
- REST API development
- Business logic implementation
- Background job processing
- Data processing and analytics

---

#### **Web Framework: Django + Django REST Framework**

**Rationale**:
- ✅ Batteries-included framework
- ✅ Built-in admin panel
- ✅ ORM for database abstraction
- ✅ Strong security features
- ✅ REST API support (DRF)

**Features Used**:
- Django ORM for database operations
- Django REST Framework for APIs
- Django Admin for internal tools
- Django Auth for authentication
- Django Celery for async tasks

**Alternatives Considered**:
- FastAPI (lighter, but less batteries-included)
- Flask (too minimal for enterprise needs)

---

#### **Task Queue: Celery**

**Rationale**:
- ✅ Asynchronous task processing
- ✅ Scheduled tasks (cron-like)
- ✅ Distributed task execution
- ✅ Good Django integration

**Use Cases**:
- Background report generation
- Email/SMS sending
- Data synchronization with ERP
- Batch processing

---

### Frontend Technologies

#### **Phase 1: Django Templates + Bootstrap 5**

**Rationale**:
- ✅ Faster development (no separate build)
- ✅ Lower complexity
- ✅ Cost-effective (no separate hosting)
- ✅ Good for small teams
- ✅ Tight integration with Django backend

**Technology Stack**:
- Django Templates (server-side rendering)
- Bootstrap 5 (UI components)
- Vanilla JavaScript + Alpine.js (reactivity)
- Django Compressor (asset optimization)

**See**: [ADR-005: Phase 1 Frontend Approach](../03-decisions/adr-005-phase-1-frontend-approach.md)

---

#### **Phase 2+: Vue.js 3 SPA**

**Rationale**:
- ✅ Better separation of concerns
- ✅ Modern SPA architecture
- ✅ Better for multiple client types
- ✅ Industry standard
- ✅ Better user experience

**Technology Stack**:
- Vue.js 3.x
- Pinia/Vuex (state management)
- Modern component library
- Vite (build tool)

**Features Used**:
- Vue Router for navigation
- Pinia/Vuex for state management
- Vue Composition API
- Vite for build tooling

**Alternatives Considered**:
- React (more complex, JSX learning curve)
- Angular (too heavyweight)

---

#### **UI Component Library: TBD**

**Options**:
- Vuetify (Material Design)
- Element Plus (Enterprise UI)
- Ant Design Vue (Rich components)
- Custom components (Full control)

**Selection Criteria**:
- Component richness
- Customization capability
- Performance
- Documentation quality

---

#### **Build Tool: Vite**

**Rationale**:
- ✅ Fast development server
- ✅ Lightning-fast HMR
- ✅ Optimized production builds
- ✅ Modern tooling

---

### Mobile Technologies

#### **Framework: Flutter**

**Rationale**:
- ✅ Single codebase for iOS + Android
- ✅ Native performance
- ✅ Rich widget library
- ✅ Hot reload for rapid development
- ✅ Growing ecosystem

**Apps**:
1. **Driver App**: Trip management, navigation, status updates
2. **QC Supervisor App**: Inspections, photo/video capture, reports
3. **Vendor App**: Bidding, trip management, invoicing

**Alternatives Considered**:
- React Native (less performant)
- Native (iOS + Android) (2x development cost)

---

### Data Technologies

#### **Primary Database: PostgreSQL 14+**

**Rationale**:
- ✅ ACID compliance
- ✅ Relational integrity
- ✅ JSON support (flexibility)
- ✅ Full-text search
- ✅ Mature and stable
- ✅ Excellent performance

**Use Cases**:
- Transactional data
- Master data
- User data
- Audit logs

**Features Used**:
- Row-level security (multi-tenancy)
- JSONB fields (flexible data)
- Full-text search
- Partitioning (Phase 2)

---

#### **Cache: Redis 6+**

**Rationale**:
- ✅ In-memory speed
- ✅ Multiple data structures
- ✅ Pub/sub for real-time
- ✅ Session storage
- ✅ Distributed caching

**Use Cases**:
- Session management
- API response caching
- Real-time trip tracking data
- Rate limiting
- Pub/sub for notifications

---

#### **File Storage: AWS S3 / MinIO**

**Rationale**:
- ✅ Scalable object storage
- ✅ S3-compatible API
- ✅ Cost-effective
- ✅ High availability

**Use Cases**:
- QC inspection photos/videos
- Driver documents
- Vehicle documents
- Invoice attachments
- Report files

---

#### **Search Engine: Elasticsearch 8+ (Phase 2)**

**Rationale**:
- ✅ Full-text search
- ✅ Log aggregation
- ✅ Analytics
- ✅ Scalable

**Use Cases**:
- Advanced search across trips, vehicles, vendors
- Log aggregation and analysis
- Real-time analytics
- Audit trail search

---

### Infrastructure Technologies

#### **Cloud Provider: AWS**

**Rationale**:
- ✅ Comprehensive service offering
- ✅ Global infrastructure
- ✅ Mature and reliable
- ✅ Good documentation

**Services Used**:
- **EC2/ECS**: Application hosting
- **RDS**: Managed PostgreSQL
- **ElastiCache**: Managed Redis
- **S3**: Object storage
- **CloudFront**: CDN
- **SQS**: Message queue
- **CloudWatch**: Monitoring
- **Route 53**: DNS
- **ELB**: Load balancing

**Alternatives**:
- Google Cloud Platform (GCP)
- Microsoft Azure
- On-premise (higher operational cost)

---

#### **Containerization: Docker**

**Rationale**:
- ✅ Consistent environments
- ✅ Easy deployment
- ✅ Isolation
- ✅ Portability

**Use Cases**:
- Development environments
- CI/CD pipelines
- Production deployment

---

#### **Orchestration: Kubernetes (Phase 2)**

**Rationale**:
- ✅ Container orchestration
- ✅ Auto-scaling
- ✅ Self-healing
- ✅ Rolling updates

**Phase 1**: Docker Compose / ECS  
**Phase 2+**: Kubernetes (EKS)

---

### Integration Technologies

#### **Message Queue**

**Phase 1**: Redis (used as Celery broker)  
**Phase 2+**: RabbitMQ / AWS SQS

**Phase 1 Rationale**:
- ✅ Shared with cache (cost-effective)
- ✅ Sufficient for Celery tasks
- ✅ Simple setup
- ✅ Lower infrastructure costs

**Phase 1 Use Cases**:
- Celery task queue (background jobs)
- Basic event distribution

**Phase 2+ Rationale**:
- ✅ Reliable message delivery
- ✅ Asynchronous processing
- ✅ Event-driven architecture
- ✅ Scalable

**Phase 2+ Use Cases**:
- Event distribution between modules
- Background job queue
- Integration with external systems
- Notification delivery

**Phase 2+ Options**:
- **RabbitMQ**: Self-hosted, feature-rich
- **AWS SQS**: Managed, simpler, cost-effective

---

#### **API Gateway**

**Phase 1**: Nginx (reverse proxy)  
**Phase 2+**: Kong / AWS API Gateway

**Phase 1 Rationale**:
- ✅ Simple reverse proxy
- ✅ SSL termination
- ✅ Basic routing
- ✅ Cost-effective (no separate service)

**Phase 1 Features**:
- Basic request routing
- SSL termination
- Static file serving
- Load balancing (if multiple instances)

**Phase 2+ Rationale**:
- ✅ Single entry point
- ✅ Authentication & authorization
- ✅ Rate limiting
- ✅ Request routing
- ✅ API versioning

**Phase 2+ Features**:
- JWT authentication
- Rate limiting per tenant
- Request/response transformation
- API analytics
- Load balancing

---

### Development & Operations

#### **Version Control: Git (GitHub/GitLab)**

**Rationale**:
- ✅ Industry standard
- ✅ Distributed
- ✅ Branching and merging
- ✅ CI/CD integration

---

#### **CI/CD: GitHub Actions / GitLab CI**

**Rationale**:
- ✅ Automated testing
- ✅ Automated deployment
- ✅ Quality gates
- ✅ Fast feedback

**Pipeline Stages**:
1. Lint & Format check
2. Unit tests
3. Integration tests
4. Build Docker image
5. Deploy to staging
6. E2E tests
7. Deploy to production

---

#### **Monitoring: Prometheus + Grafana**

**Rationale**:
- ✅ Metrics collection
- ✅ Alerting
- ✅ Visualization
- ✅ Open source

**Metrics Tracked**:
- Request rate
- Error rate
- Response time
- Database performance
- Cache hit rate
- Queue depth

---

#### **Logging: ELK Stack (Elasticsearch, Logstash, Kibana)**

**Rationale**:
- ✅ Centralized logging
- ✅ Log aggregation
- ✅ Search and analysis
- ✅ Visualization

**Logs Collected**:
- Application logs
- API access logs
- Error logs
- Security logs
- Audit logs

---

#### **Error Tracking: Sentry**

**Rationale**:
- ✅ Real-time error tracking
- ✅ Stack traces
- ✅ User context
- ✅ Alerting

---

## 📊 Technology Matrix

| Layer | Phase 1 | Phase 2+ | Purpose |
|-------|---------|----------|---------|
| **Backend** | Python + Django | Python + Django | API & Business Logic |
| **Frontend** | Django Templates + Bootstrap 5 | Vue.js 3 SPA | Web Portal |
| **Mobile** | Flutter | Flutter | iOS + Android Apps |
| **Database** | PostgreSQL | PostgreSQL | Primary Data Store |
| **Cache** | Redis | Redis | Session & Caching |
| **File Storage** | AWS S3 | AWS S3 | Object Storage |
| **Message Queue** | Redis (Celery broker) | RabbitMQ/SQS | Async Processing |
| **API Gateway** | Nginx (reverse proxy) | Kong/AWS API Gateway | API Management |
| **Deployment** | Docker Compose, Single EC2 | Kubernetes/ECS | Container Orchestration |
| **Search** | PostgreSQL full-text | Elasticsearch | Full-text Search |
| **Monitoring** | CloudWatch | Prometheus + Grafana | Metrics & Alerts |
| **Logging** | CloudWatch Logs | ELK Stack | Log Management |
| **CI/CD** | GitHub Actions | GitHub Actions | Automation |
| **Error Tracking** | Sentry | Sentry | Error Monitoring |

---

## 🔒 Security Technologies

### **Authentication & Authorization**

**JWT (JSON Web Tokens)**:
- Stateless authentication
- Token-based API access
- Refresh token mechanism

**OAuth 2.0 (Phase 2)**:
- Third-party integrations
- SSO capability

---

### **Encryption**

**TLS/SSL**:
- HTTPS for all communications
- Certificate management (Let's Encrypt / AWS ACM)

**Database Encryption**:
- Encryption at rest (AWS RDS encryption)
- Encrypted backups

**Application-Level Encryption**:
- Sensitive data encryption (bcrypt for passwords)
- Field-level encryption for PII

---

## 🧪 Testing Technologies

### **Backend Testing**

**pytest**:
- Unit tests
- Integration tests
- Fixtures and factories

**pytest-django**:
- Django-specific testing utilities

**Factory Boy**:
- Test data generation

---

### **Frontend Testing**

**Vitest**:
- Unit tests for Vue components
- Fast test execution

**Cypress / Playwright**:
- End-to-end testing
- User journey testing

---

### **API Testing**

**Postman / Newman**:
- API testing
- Automated API tests in CI/CD

---

## 📦 Dependency Management

### **Backend**
- **pip** + **requirements.txt** / **Poetry**
- Virtual environments (venv)

### **Frontend**
- **npm** / **yarn**
- **package.json** for dependencies

### **Mobile**
- **pub** (Flutter package manager)
- **pubspec.yaml** for dependencies

---

## 🔗 Related Documents

- [Architecture Summary](./architecture-summary.md)
- [Design Principles](./design-principles.md)
- [System Overview](../01-architecture/system-overview.md)

---

## 📝 Notes

**Version Pinning**:
- Implementation repos will specify exact versions
- This document provides technology direction only
- Versions will be updated based on security and feature needs

**Technology Evolution**:
- Technologies may evolve across phases
- ADRs will document significant technology changes
- Backward compatibility will be maintained

---

**Document Status**: 🚧 Draft  
**Next Steps**: Review with team, validate technology choices  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

