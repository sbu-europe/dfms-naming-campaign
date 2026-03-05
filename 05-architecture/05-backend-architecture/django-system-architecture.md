# Django System Architecture

> Implementation-specific architecture for DFMS Backend (Django/Python)

## 📖 High-Level Architecture

> **Source of Truth**: [`05-architecture/`](../)

This Django backend implementation follows the high-level architecture defined in the DFMS Product Context submodule:

- **[Architecture Summary](../00-overview/architecture-summary.md)** - Overall system architecture
- **[Container View](../01-system-design/container-view.md)** - High-level technical building blocks
- **[ADR-004: Phase 1 Modular Monolith](../03-decisions/adr-004-phase-1-modular-monolith.md)** - Phase 1 architecture decision
- **[Phase 1 Deployment Strategy](../04-implementation/deployment-strategy/phase-1-deployment.md)** - Deployment approach

**Current Phase**: **Phase 1 - Modular Monolith** (as per ADR-004)

This document focuses on **Django-specific implementation details**. For high-level architecture, workflows, and contracts, see the submodule documentation.

## Django Implementation Architecture

### Multi-Tenancy Implementation

**High-Level Strategy**: See [Architecture Summary](../00-overview/architecture-summary.md#1-multi-tenancy)

**Django Implementation**:
- **Schema Separation**: Each tenant gets isolated schema in PostgreSQL
- **Shared Database**: Single PostgreSQL instance with multiple schemas
- **Tenant Identification**: Subdomain or header-based routing (Django middleware)
- **Data Isolation**: Complete separation at schema level
- **Django App**: `tenants` app manages schema routing and tenant context

### Django Modular Monolith Structure

**Architecture Decision**: See [ADR-004: Phase 1 Modular Monolith](../03-decisions/adr-004-phase-1-modular-monolith.md)

This Django implementation maintains clear module boundaries using Django apps, enabling future extraction to microservices (Phase 2+).
```
┌──────────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                     │
│                         Port 80/443                          │
├──────────────────────────────────────────────────────────────┤
│                  Django Application Server                    │
│                    Gunicorn (Port 8000)                      │
├──────────────────────────────────────────────────────────────┤
│                    Django REST Framework                      │
│                  JWT Authentication (PyJWT)                   │
├───────────┬─────────────┬─────────────┬───────────┬──────────┤
│   Auth    │  Transport  │    Fleet    │  Product  │ Command  │
│   Apps    │    Apps     │    Apps     │   Apps    │  Center  │
├───────────┴─────────────┴─────────────┴───────────┴──────────┤
│                      Django ORM Layer                         │
├──────────────────────────┬───────────────────────────────────┤
│        PostgreSQL         │         Redis Cache               │
│      (Port 5432)         │         (Port 6379)              │
└──────────────────────────┴───────────────────────────────────┘
```

### 3. Application Structure

#### Django Apps Organization
- **core**: Authentication, permissions, middleware
- **tenants**: Multi-tenancy management
- **users**: User management and profiles
- **fleet**: Vehicle, driver, vendor management
- **transport**: Orders, requisitions, trips
- **products**: Product catalog, inventory
- **tracking**: GPS tracking, geofencing
- **quality**: QC processes
- **reports**: Analytics and reporting
- **notifications**: Email/SMS services

## Technology Stack

> **High-Level Technology Stack**: See [Technology Stack Overview](../00-overview/technology-stack-overview.md)

### Django-Specific Stack

**Backend Framework**:
- **Language**: Python 3.12+
- **Framework**: Django 5.0+
- **API**: Django REST Framework 3.14+
- **Authentication**: PyJWT for token management
- **Task Queue**: Celery with Redis broker
- **Testing**: pytest-django, Playwright

**Frontend (Phase 1)**:
- **Templates**: Django Templates + Bootstrap 5 (server-side rendering)
- **JavaScript**: Vanilla JS with Alpine.js for reactivity
- **CSS**: Bootstrap 5 + Custom CSS
- **Build Tools**: Django Compressor for asset optimization

> **Note**: Phase 2 will migrate to Vue.js 3 SPA (see [ADR-005](../03-decisions/adr-005-phase-1-frontend-approach.md))

**Database**:
- **Primary**: PostgreSQL 15+
- **Cache**: Redis 7+ (also used as Celery broker)
- **Session Store**: Redis backend
- **File Storage**: Local filesystem (S3 for production)

**Infrastructure**:
- **Web Server**: Nginx (reverse proxy)
- **App Server**: Gunicorn (WSGI)
- **Container**: Docker + Docker Compose
- **AWS Services** (Phase 1 - Cost-Optimized):
  - Single EC2 instance (t3.large)
  - RDS PostgreSQL (db.t3.small)
  - ElastiCache Redis (cache.t3.micro)
  - S3 for static files and backups
  - CloudWatch for monitoring

> **Deployment Details**: See [Phase 1 Deployment Strategy](../04-implementation/deployment-strategy/phase-1-deployment.md)

## Deployment Architecture

> **High-Level Deployment Strategy**: See [Phase 1 Deployment Strategy](../04-implementation/deployment-strategy/phase-1-deployment.md)

### Django-Specific Deployment

**Development Environment**:
```yaml
# docker-compose.yml structure
services:
  web:
    Django + Gunicorn
  db:
    PostgreSQL
  redis:
    Redis (cache + Celery broker)
  nginx:
    Nginx reverse proxy
```

**Production Environment (AWS)**:
- See [Phase 1 Deployment Diagram](../04-implementation/deployment-strategy/phase-1-deployment.md#architecture-diagram)
- Single EC2 instance with Docker Compose
- Nginx as reverse proxy (no separate API Gateway in Phase 1)

## Security Architecture

### Application Security
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Django's permission system + custom RBAC
- **API Security**: Token validation, rate limiting
- **Data Encryption**: TLS 1.3 for transit, AES-256 for sensitive data
- **SQL Injection Prevention**: Django ORM parameterized queries
- **XSS Protection**: Django template auto-escaping
- **CSRF Protection**: Django CSRF middleware

### Security Checklist
#### Must Do:
- ✅ Use environment variables for secrets
- ✅ Enable Django security middleware
- ✅ Implement rate limiting (django-ratelimit)
- ✅ Use HTTPS in production
- ✅ Regular security updates
- ✅ Input validation on all forms
- ✅ Implement audit logging
- ✅ Use prepared statements (Django ORM)
- ✅ Implement proper CORS policies
- ✅ Session timeout configuration
- ✅ Password complexity requirements
- ✅ MFA for admin accounts

#### Must NOT Do:
- ❌ Store passwords in plain text
- ❌ Expose DEBUG mode in production
- ❌ Use default SECRET_KEY
- ❌ Trust user input without validation
- ❌ Store sensitive data in cookies
- ❌ Log sensitive information
- ❌ Use outdated dependencies
- ❌ Disable CSRF protection
- ❌ Expose database credentials in code

## Database Design

### PostgreSQL Schema Strategy
```sql
-- Tenant schema example
CREATE SCHEMA tenant_001;
CREATE SCHEMA tenant_002;

-- Shared tables in public schema
public.tenants
public.plans
public.system_settings

-- Tenant-specific tables in tenant schema
tenant_001.users
tenant_001.vehicles
tenant_001.trips
```

### Connection Pooling
- **PgBouncer**: For connection pooling
- **Max Connections**: 100 (for 200-300 users)
- **Pool Mode**: Transaction pooling

## Performance Optimization

### Caching Strategy
- **Page Cache**: Django cache middleware
- **Database Query Cache**: Redis with django-cachalot
- **Session Cache**: Redis backend
- **Static Files**: Nginx caching + CloudFront

### Database Optimization
- **Indexes**: Strategic indexing on foreign keys and filters
- **Query Optimization**: select_related and prefetch_related
- **Database Views**: For complex reports
- **Partitioning**: Date-based partitioning for large tables

## Testing Strategy

> **High-Level Testing Approach**: See [Testing Approach](../04-implementation/strategies/testing-approach.md)

### Django-Specific Testing

**Test Coverage Targets**:
```python
# Django test coverage
- Unit Tests: 80% coverage (pytest-django)
- Integration Tests: Critical paths (Django TestCase)
- E2E Tests: User workflows with Playwright
- Performance Tests: Load testing with Locust
```

**Django Testing Tools**:
- **pytest-django**: Unit and integration tests
- **Playwright**: E2E testing from day one
- **Django TestCase**: Database-backed tests
- **Factory Boy**: Test data factories

## Monitoring & Observability

### Application Monitoring
- **Django Debug Toolbar**: Development
- **Sentry**: Error tracking
- **CloudWatch**: Infrastructure metrics
- **Custom Metrics**: Business KPIs

### Logging
```python
LOGGING = {
    'version': 1,
    'handlers': {
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/dfms/app.log',
            'maxBytes': 10485760,  # 10MB
            'backupCount': 5,
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
        },
    },
}
```

## Architecture Evolution

> **High-Level Evolution Path**: See [Architecture Summary - Implementation Phases](../00-overview/architecture-summary.md#-implementation-phases)

### Django Implementation Evolution

**Phase 1 (Current)**: Modular Monolith
- Django apps with clear module boundaries
- See [ADR-004](../03-decisions/adr-004-phase-1-modular-monolith.md) for details

**Phase 2 Migration Considerations**:
- Extract Django apps to microservices
- Maintain API contracts (see [API Contracts](../../06-contracts/api/))
- Migrate to event-driven architecture (see [Event Contracts](../../06-contracts/events/))

### Django-Specific Scalability (Within Phase 1)
1. **Vertical scaling**: Larger EC2/RDS instances
2. **Read replicas**: PostgreSQL read replicas for reporting
3. **Horizontal scaling**: Multiple Gunicorn workers, multiple EC2 instances
4. **Database optimization**: Query optimization, indexing, connection pooling

## Development Workflow

### Git Strategy
```
main
├── develop
│   ├── feature/module-name
│   ├── bugfix/issue-description
│   └── hotfix/critical-fix
└── release/v1.0.0
```

### CI/CD Pipeline
```yaml
# GitHub Actions
- Lint (Black, isort, flake8)
- Test (pytest + coverage)
- E2E (Playwright)
- Build Docker image
- Deploy to staging
- Manual approval
- Deploy to production
```

## Cost Optimization

### Monthly AWS Estimate (200-300 users)
- **EC2 t3.large**: ~$60
- **RDS t3.small**: ~$25
- **ElastiCache t3.micro**: ~$12
- **S3 + Data Transfer**: ~$10
- **Total**: ~$107/month

### Cost Saving Strategies
- Reserved Instances for 30-50% savings
- Spot instances for development
- S3 lifecycle policies
- CloudWatch log retention limits
- No Load Balancer initially

## Backup & Disaster Recovery

### Backup Strategy
- **Database**: Daily automated RDS backups (7-day retention)
- **Application**: Git repository + Docker images
- **Files**: S3 versioning for uploaded files

### Recovery Targets
- **RTO**: 2 hours (manual intervention)
- **RPO**: 24 hours (daily backups)
- **Availability**: 99.5% (allows ~3.5 hours downtime/month)