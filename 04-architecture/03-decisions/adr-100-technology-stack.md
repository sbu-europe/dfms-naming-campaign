# ADR-100: Technology Stack

**Status**: Accepted  
**Date**: 2026-02-13  
**Deciders**: Architecture Team, Technical Lead  
**Tags**: [technology, stack, backend, frontend, mobile, database]

---

## Context

DFMS requires a technology stack that:
- **Phase 1**: Supports cost-optimized modular monolith
- **Phase 2+**: Evolves to microservices architecture
- Enables rapid development
- Scales horizontally (Phase 2+)
- Supports multiple client types (web, mobile)
- Integrates with external systems
- Has good ecosystem and community support
- Team has expertise or can learn quickly

Key requirements:
- **Backend**: REST APIs, event processing, background jobs
- **Frontend**: Web dashboard, real-time updates
- **Mobile**: Driver, QC Supervisor, Vendor apps
- **Database**: Relational data, transactions, reporting
- **Caching**: Session management, performance
- **Message Queue**: Event distribution
- **Infrastructure**: Cloud deployment, containerization

---

## Decision

We will use the following technology stack, with phase-based variations:

### Backend
- **Python 3.11+**: Main programming language
- **Django**: Admin panel, ORM, authentication
- **Django REST Framework**: REST APIs (Phase 1)
- **FastAPI**: High-performance REST APIs (Phase 2+)
- **Celery**: Background job processing
- **Pydantic**: Data validation

### Frontend

**Phase 1: Django Templates + Bootstrap 5**
- **Django Templates**: Server-side rendering
- **Bootstrap 5**: UI components
- **Vanilla JavaScript + Alpine.js**: Reactivity
- **Django Compressor**: Asset optimization

**Phase 2+: Vue.js 3 SPA**
- **Vue.js 3**: Web application framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Pinia**: State management
- **Vuetify**: UI component library

**See**: [ADR-005: Phase 1 Frontend Approach](./adr-005-phase-1-frontend-approach.md)

### Mobile
- **Flutter**: Cross-platform mobile framework
- **Dart**: Programming language
- **Provider/Riverpod**: State management
- **Phase**: Available in Phase 1

### Database
- **PostgreSQL**: Primary relational database
- **Redis**: Caching, session storage
- **Phase 1**: Redis also used as Celery broker
- **Phase 2+**: Redis for cache only

### Message Queue

**Phase 1: Redis**
- Used as Celery broker
- Basic event distribution
- Shared with cache (cost-effective)

**Phase 2+: RabbitMQ / AWS SQS**
- **RabbitMQ**: Event bus (primary, self-hosted)
- **AWS SQS**: Alternative (managed service)
- **Kafka**: Alternative for high-throughput scenarios

### Infrastructure

**Phase 1: Docker Compose**
- **Docker**: Containerization
- **Docker Compose**: Local development and single EC2 deployment
- **AWS**: Cloud provider (EC2, RDS, ElastiCache, S3)
- **Nginx**: Reverse proxy (no separate API Gateway)

**Phase 2+: Kubernetes**
- **Docker**: Containerization
- **Kubernetes**: Orchestration (production)
- **AWS**: Cloud provider (EKS, ECS)
- **Kong / AWS API Gateway**: API management
- **GitLab CI/CD**: Continuous integration/deployment

**See**: [ADR-004: Phase 1 Modular Monolith](./adr-004-phase-1-modular-monolith.md)

### Monitoring & Observability

**Phase 1: CloudWatch**
- **AWS CloudWatch**: Metrics and logging
- Basic monitoring

**Phase 2+: Full Observability**
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **ELK Stack**: Logging (optional)

---

## Consequences

### Positive

**Phase 1 Benefits**:
- **Python Ecosystem**: Rich libraries and frameworks
- **Django Admin**: Quick admin interface
- **Django Templates**: Faster development, no separate build
- **Redis**: Cost-effective (shared with cache)
- **Docker Compose**: Simple deployment
- **Lower Infrastructure Costs**: ~$107/month

**Phase 2+ Benefits**:
- **Vue.js**: Modern, reactive frontend (SPA)
- **FastAPI Performance**: High performance for APIs
- **RabbitMQ**: Reliable message broker
- **Kubernetes**: Industry-standard containerization
- **API Gateway**: Better API management

**Common Benefits**:
- **Flutter**: Single codebase for mobile
- **PostgreSQL**: Robust, feature-rich database
- **Team Familiarity**: Technologies align with team expertise

### Negative

**Phase 1 Limitations**:
- **Python Performance**: Slower than compiled languages (acceptable)
- **Django Templates**: Less separation of concerns
- **Redis**: Limited message routing capabilities
- **Single EC2**: Cannot scale independently

**Phase 2+ Challenges**:
- **Flutter Learning Curve**: Team may need training
- **Microservices Overhead**: More operational complexity
- **Multiple Technologies**: More to learn and maintain
- **Higher Infrastructure Costs**: ~$500+/month

### Neutral

- **Vendor Lock-in**: AWS-specific features (acceptable)
- **Technology Evolution**: Need to keep up with updates

---

## Alternatives Considered

### Alternative 1: Node.js Backend

**Description**: Use Node.js/Express for backend

**Pros**:
- Single language (JavaScript) for frontend and backend
- Fast I/O
- Large ecosystem

**Cons**:
- Less mature for complex business logic
- Callback/async complexity
- Team has more Python expertise

**Why Not Chosen**: 
- Team has stronger Python expertise
- Django admin provides significant value
- Python better for data processing

---

### Alternative 2: Java/Spring Boot

**Description**: Use Java with Spring Boot

**Pros**:
- Enterprise-grade
- Strong typing
- Excellent tooling

**Cons**:
- More verbose
- Slower development
- Team has less Java expertise
- Heavier runtime

**Why Not Chosen**: 
- Team has more Python expertise
- Faster development with Python
- Sufficient for our requirements

---

### Alternative 3: React Frontend (Phase 2+)

**Description**: Use React instead of Vue.js for Phase 2+ SPA

**Pros**:
- Larger ecosystem
- More job market
- More components available

**Cons**:
- More complex
- Steeper learning curve
- Team preference for Vue.js

**Why Not Chosen**: 
- Team preference for Vue.js
- Vue.js sufficient for requirements
- Simpler mental model
- Note: Phase 1 uses Django Templates, not SPA

---

### Alternative 4: Native Mobile Apps

**Description**: Separate iOS (Swift) and Android (Kotlin) apps

**Pros**:
- Native performance
- Platform-specific features
- Better UX

**Cons**:
- Two codebases to maintain
- Slower development
- More resources needed

**Why Not Chosen**: 
- Flutter provides sufficient performance
- Single codebase is more efficient
- Cross-platform is priority

---

### Alternative 5: MongoDB

**Description**: Use MongoDB instead of PostgreSQL

**Pros**:
- Flexible schema
- Horizontal scaling
- JSON-native

**Cons**:
- No ACID transactions (until recently)
- Less mature for complex queries
- Team has more SQL expertise

**Why Not Chosen**: 
- Need ACID transactions
- Complex relational queries
- Team has PostgreSQL expertise

---

## Related Decisions

- [ADR-001: Microservices Architecture](./adr-001-microservices-architecture.md) - Phase 2+ vision
- [ADR-004: Phase 1 Modular Monolith](./adr-004-phase-1-modular-monolith.md) - Phase 1 architecture
- [ADR-005: Phase 1 Frontend Approach](./adr-005-phase-1-frontend-approach.md) - Phase 1 frontend
- [Technology Stack Overview](../../00-overview/technology-stack-overview.md)

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Django Documentation](https://docs.djangoproject.com/)
- [Vue.js Documentation](https://vuejs.org/)
- [Flutter Documentation](https://flutter.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated**: 2026-02-13  
**Status**: Accepted

