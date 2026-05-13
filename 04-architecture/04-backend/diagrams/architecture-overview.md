# Architecture Diagrams

> Django implementation-specific diagrams — updated to reflect Phase 1 implementation

## 📖 High-Level Architecture Diagrams

> **Source of Truth**: [`04-architecture/05-diagrams/`](../../05-diagrams/)

The high-level architecture diagrams are maintained in the DFMS Product Context submodule:

- **[System Architecture Overview](../../05-diagrams/architecture/system-architecture-overview.mmd)** - Single-page full-stack overview ⭐
- **[System Context Diagram](../../05-diagrams/architecture/system-context-diagram.mmd)** - C4 Level 1
- **[Container Diagram](../../05-diagrams/architecture/container-diagram.mmd)** - C4 Level 2
- **[Deployment Diagram](../../05-diagrams/deployment/deployment-diagram.mmd)** - Infrastructure architecture
- **[Sequence Diagrams](../../05-diagrams/sequences/)** - Interaction flows
- **[State Diagrams](../../05-diagrams/states/)** - State machines
- **[ER Diagram](../../05-diagrams/data/entity-relationship-diagram.mmd)** - Entity relationships
- **[Integration Diagram](../../05-diagrams/integration/integration-architecture-diagram.mmd)** - External integrations
- **[Diagrams Index](../../05-diagrams/diagrams-index.md)** - Complete list of all diagrams

This document contains **Django-specific component diagrams** showing implementation details.

---

## 1. System Architecture Overview

> Phase 1: Modular monolith on a single EC2, Docker Compose stack, Nginx + Gunicorn (prod) / runserver (dev).
> S3 storage is active in production (`USE_S3=True`); local media volume is used in dev/QA.

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>Django Templates + Bootstrap 5]
        MOBILE[Mobile Apps<br/>Flutter — planned]
    end

    subgraph "Web Server Layer"
        NGINX[Nginx 1.25<br/>Reverse Proxy<br/>Static & Media files<br/>SSL termination]
    end

    subgraph "Application Layer"
        DJANGO[Django Application<br/>Gunicorn WSGI — prod<br/>runserver — dev]
        DRF[Django REST Framework<br/>REST API Endpoints]
        RBAC[RBAC / Auth Layer<br/>JWT + Session + OTP]
        AUDIT[Audit Middleware<br/>Immutable action log]
    end

    subgraph "Background Tasks"
        CELERY[Celery Workers<br/>concurrency=4]
        BEAT[Celery Beat<br/>DatabaseScheduler]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL 15<br/>django_tenants<br/>Multi-Schema)]
        REDIS[(Redis 7<br/>Broker db/0<br/>Cache db/1<br/>Results db/2)]
    end

    subgraph "Storage"
        S3[AWS S3<br/>Media & Static — prod]
        LOCAL[Local Volume<br/>Media & Static — dev/QA]
    end

    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> DJANGO
    DJANGO --> DRF
    DJANGO --> RBAC
    DJANGO --> AUDIT
    DJANGO --> CELERY
    CELERY --> REDIS
    BEAT --> REDIS
    DJANGO --> PG
    DJANGO --> REDIS
    DJANGO --> S3
    DJANGO --> LOCAL

    style WEB fill:#e1f5fe
    style MOBILE fill:#e1f5fe
    style NGINX fill:#fff3e0
    style DJANGO fill:#c8e6c9
    style DRF fill:#c8e6c9
    style RBAC fill:#c8e6c9
    style AUDIT fill:#c8e6c9
    style CELERY fill:#f3e5f5
    style BEAT fill:#f3e5f5
    style PG fill:#ffebee
    style REDIS fill:#ffebee
    style S3 fill:#fce4ec
    style LOCAL fill:#fce4ec
```

---

## 2. Multi-Tenant Architecture

> `django-tenants` with schema-per-tenant isolation.
> `SHARED_APPS` (public schema): tenants, core/RBAC, auth, DRF, Celery Beat.
> `TENANT_APPS` (per-tenant schema): all business modules + users + audit.

```mermaid
graph TB
    subgraph "Request Flow"
        REQ[Incoming Request<br/>subdomain.dfms.com]
        MW[TenantMainMiddleware<br/>Resolves tenant from subdomain]
        STATUS[TenantStatusMiddleware<br/>Blocks suspended tenants]
        CTX[Tenant Context Set<br/>Schema activated]
    end

    subgraph "PostgreSQL — Public Schema"
        PUBLIC[public schema<br/>- tenants.Tenant<br/>- tenants.Domain<br/>- core.Role / Permission<br/>- django_celery_beat<br/>- sessions]
    end

    subgraph "PostgreSQL — Tenant Schemas"
        T1[tenant_abc schema<br/>- users / UserRole<br/>- master_data<br/>- transport / requisitions<br/>- vendors / operations<br/>- quality / costing<br/>- tracking / notifications<br/>- reporting / audit]
        T2[tenant_xyz schema<br/>- same tables, isolated data]
    end

    REQ --> MW
    MW --> STATUS
    STATUS --> CTX
    CTX --> PUBLIC
    CTX --> T1
    CTX --> T2

    style PUBLIC fill:#e3f2fd
    style T1 fill:#f3e5f5
    style T2 fill:#e8f5e9
```

---

## 3. Authentication & Authorization Flow

> JWT stored in `localStorage` (web portal SPA calls) + Django session (server-side portal pages).
> OTP-based MFA available (`admin_otp.py`). Concurrent session limit enforced by `SessionControlMiddleware`.

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Browser)
    participant N as Nginx
    participant D as Django
    participant RBAC as RBAC / JWT Service
    participant DB as PostgreSQL
    participant R as Redis (Session Cache)

    U->>F: Login Credentials
    F->>N: POST /api/v1/auth/login
    N->>D: Forward request
    D->>DB: Validate credentials + tenant
    DB-->>D: User & role data
    D->>RBAC: Generate JWT (access + refresh)
    D->>R: Store session (SESSION_ENGINE=cache)
    D-->>F: Access token + Refresh token
    F->>F: Store in localStorage

    Note over F,D: Subsequent API Requests
    F->>D: API Request + Bearer Token
    D->>RBAC: Validate JWT + check Permission
    RBAC-->>D: Allowed / Denied
    D->>DB: Fetch tenant-scoped data
    DB-->>D: Response Data
    D-->>F: JSON Response

    Note over F,D: Token Refresh
    F->>D: POST /api/v1/auth/token/refresh
    D->>RBAC: Validate Refresh Token (blacklist check)
    RBAC-->>D: New Access Token
    D-->>F: New Access Token
```

---

## 4. RBAC (Role-Based Access Control) Architecture

> Four-tier role hierarchy. 135 permissions across 13 modules in `Module.Feature.Action` dot-notation.
> Roles and Permissions live in the public schema (`SHARED_APPS`); UserRole assignments are per-tenant.

```mermaid
graph TD
    subgraph "Public Schema — Shared"
        PERM[Permission<br/>Module.Feature.Action<br/>e.g. Fleet.Vehicle.Create]
        ROLE[Role<br/>name, access_scope<br/>department]
        ROLEPERM[RolePermission<br/>role ↔ permission]
    end

    subgraph "Tenant Schema — Per Tenant"
        USER[User<br/>tenant-scoped]
        USERROLE[UserRole<br/>user ↔ role<br/>location scope]
    end

    subgraph "Runtime Check"
        MW2[RBACPermission<br/>DRF permission class]
        RBAC_SVC[rbac_service.py<br/>has_permission()]
    end

    ROLE --> ROLEPERM
    PERM --> ROLEPERM
    USER --> USERROLE
    ROLE --> USERROLE
    MW2 --> RBAC_SVC
    RBAC_SVC --> USERROLE
    RBAC_SVC --> ROLEPERM

    style PERM fill:#ffcdd2
    style ROLE fill:#ffcdd2
    style ROLEPERM fill:#ffcdd2
    style USER fill:#c8e6c9
    style USERROLE fill:#c8e6c9
```

---

## 5. Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        WEB_FORM[Django Template<br/>Web Forms]
        API_POST[DRF API<br/>JSON Requests]
        MOBILE_INPUT[Mobile API<br/>Flutter clients]
    end

    subgraph "Validation Layer"
        DJANGO_VALID[Django Forms<br/>ModelForms]
        DRF_SERIAL[DRF Serializers<br/>Validation + Deserialization]
    end

    subgraph "Business Logic"
        SERVICES[Service Layer<br/>services.py per app]
        SIGNALS[Django Signals<br/>Post-save hooks]
        AUDIT_MW[AuditMiddleware<br/>Log every mutation]
    end

    subgraph "Data Access"
        ORM[Django ORM<br/>Tenant-scoped QuerySets]
        CACHE[Redis Cache<br/>django_redis]
    end

    subgraph "Storage"
        PG[(PostgreSQL<br/>Tenant Schemas)]
        REDIS[(Redis)]
    end

    WEB_FORM --> DJANGO_VALID
    API_POST --> DRF_SERIAL
    MOBILE_INPUT --> DRF_SERIAL

    DJANGO_VALID --> SERVICES
    DRF_SERIAL --> SERVICES

    SERVICES --> SIGNALS
    SERVICES --> ORM
    SERVICES --> CACHE
    SERVICES --> AUDIT_MW

    ORM --> PG
    CACHE --> REDIS
    CACHE --> PG

    style SERVICES fill:#c8e6c9
    style ORM fill:#e1f5fe
    style AUDIT_MW fill:#fff3e0
```

---

## 6. Module Dependencies

> Reflects actual implemented Django apps. Fleet/Fuel data lives in `master_data` (no separate app in Phase 1).

```mermaid
graph TD
    subgraph "Shared — Public Schema"
        AUTH[core — RBAC<br/>Role / Permission]
        TENANT[tenants<br/>Schema Management]
        AUDIT_APP[audit<br/>Immutable Action Log]
    end

    subgraph "Tenant — Master Data"
        USERS[users]
        MASTER[master_data<br/>Products / POI / Routes<br/>Vehicles / Fleet / Fuel]
    end

    subgraph "Tenant — Business Modules"
        REQUISITIONS[requisitions<br/>Product Requisitions]
        TRANSPORT[transport<br/>Transport Orders]
        VENDORS[vendors<br/>Vendor Management]
        OPERATIONS[operations<br/>Gate / Scale / Loading<br/>Command Center]
        QUALITY[quality<br/>QC Inspections]
        COSTING[costing<br/>Trip Costing & Finance]
        TRACKING[tracking<br/>Real-time Trip Tracking]
    end

    subgraph "Tenant — Support Modules"
        NOTIFICATIONS[notifications<br/>Alerts & Notifications]
        REPORTING[reporting<br/>Analytics & Reports]
    end

    TENANT --> AUTH
    AUTH --> USERS
    USERS --> MASTER

    MASTER --> REQUISITIONS
    MASTER --> TRANSPORT
    MASTER --> VENDORS

    REQUISITIONS --> TRANSPORT
    TRANSPORT --> OPERATIONS
    TRANSPORT --> TRACKING

    VENDORS --> TRANSPORT
    OPERATIONS --> QUALITY
    OPERATIONS --> COSTING

    TRANSPORT --> NOTIFICATIONS
    TRANSPORT --> REPORTING
    TRANSPORT --> COSTING

    AUDIT_APP -.->|"Logs all modules"| USERS

    style AUTH fill:#ffcdd2
    style TENANT fill:#ffcdd2
    style AUDIT_APP fill:#ffcdd2
```

---

## 7. Deployment Architecture — Phase 1 (Current)

> Single EC2 instance, Docker Compose. S3 + RDS + ElastiCache in production.
> Dev/QA: local PostgreSQL + Redis containers, local media volume.

```mermaid
graph TB
    subgraph "Internet"
        USERS[Users<br/>Web & Mobile]
    end

    subgraph "AWS — Production"
        subgraph "EC2 t3.large"
            subgraph "Docker Compose"
                NGINX_C[Nginx 1.25<br/>Port 80/443]
                DJANGO_C[Django + Gunicorn<br/>Port 8000]
                CELERY_C[Celery Worker<br/>concurrency=4]
                BEAT_C[Celery Beat<br/>DatabaseScheduler]
            end
        end

        subgraph "AWS Managed Services"
            RDS[(RDS PostgreSQL 15<br/>db.t3.small)]
            ELASTICACHE[(ElastiCache Redis 7<br/>cache.t3.micro)]
            S3_MEDIA[S3 — Media Uploads]
            S3_STATIC[S3 — Static Files]
        end

        subgraph "DNS / Routing"
            R53[Route 53<br/>*.dfms.com wildcard]
        end

        subgraph "Monitoring"
            CW[CloudWatch<br/>Logs & Metrics]
        end
    end

    USERS --> R53
    R53 --> NGINX_C
    NGINX_C --> DJANGO_C
    DJANGO_C --> RDS
    DJANGO_C --> ELASTICACHE
    DJANGO_C --> S3_MEDIA
    DJANGO_C --> S3_STATIC
    CELERY_C --> RDS
    CELERY_C --> ELASTICACHE
    CELERY_C --> S3_MEDIA
    DJANGO_C -.->|Logs| CW
    CELERY_C -.->|Logs| CW

    style NGINX_C fill:#fff3e0
    style DJANGO_C fill:#c8e6c9
    style CELERY_C fill:#f3e5f5
    style BEAT_C fill:#f3e5f5
    style RDS fill:#e1f5fe
    style ELASTICACHE fill:#ffebee
    style S3_MEDIA fill:#fce4ec
    style S3_STATIC fill:#fce4ec
```

---

## 8. API Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant TM as TenantMainMiddleware
    participant SM as SessionControlMiddleware
    participant AM as AuditMiddleware
    participant V as View / DRF ViewSet
    participant RBAC as RBACPermission
    participant S as Serializer
    participant SVC as Service Layer
    participant DB as PostgreSQL (tenant schema)
    participant R as Redis Cache

    C->>N: HTTPS Request
    N->>TM: Forward (proxy_pass :8000)
    TM->>TM: Resolve tenant from subdomain
    TM->>SM: Activate tenant schema
    SM->>SM: Enforce session limits / inactivity
    SM->>AM: Pass request
    AM->>V: Route to ViewSet
    V->>RBAC: Check JWT + permission
    RBAC-->>V: Allowed
    V->>S: Validate input

    alt Cache Hit
        V->>R: Check Cache
        R-->>V: Cached Data
    else Cache Miss
        V->>SVC: Call service method
        SVC->>DB: ORM query (tenant schema)
        DB-->>SVC: Result
        SVC-->>V: Domain object
        V->>R: Update Cache
    end

    AM->>DB: Write audit log entry
    V->>S: Serialize response
    S-->>N: JSON Response
    N-->>C: HTTPS Response
```

---

## 9. Scaling Strategy

```mermaid
graph LR
    subgraph "Phase 1 — Current (200-300 users)"
        SINGLE[Single EC2 t3.large<br/>Docker Compose<br/>RDS db.t3.small<br/>Redis cache.t3.micro]
    end

    subgraph "Phase 2 — 500-1000 users"
        EC2_LARGE[Larger EC2 t3.xlarge<br/>+ RDS Read Replica<br/>+ Redis cluster]
    end

    subgraph "Phase 3 — 1000-5000 users"
        ALB[Application Load Balancer]
        EC2_1[EC2 Instance 1]
        EC2_2[EC2 Instance 2]
        EC2_3[EC2 Instance 3]
        ALB --> EC2_1
        ALB --> EC2_2
        ALB --> EC2_3
    end

    subgraph "Phase 4 — 5000+ users"
        ASG[ECS Fargate<br/>Auto Scaling Group]
        AURORA[(Aurora PostgreSQL<br/>Serverless v2)]
    end

    SINGLE --> EC2_LARGE
    EC2_LARGE --> ALB
    EC2_1 --> ASG

    style SINGLE fill:#c8e6c9
    style EC2_LARGE fill:#fff9c4
    style ALB fill:#ffe0b2
    style ASG fill:#ffccbc
```

---

## How to View These Diagrams

1. **GitHub**: Mermaid diagrams render automatically in `.md` files
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Use [Mermaid Live Editor](https://mermaid.live/)
4. **Documentation Sites**: MkDocs, Docusaurus, Notion — all support Mermaid natively
