# Architecture Diagrams

> Django implementation-specific diagrams

## 📖 High-Level Architecture Diagrams

> **Source of Truth**: [`04-architecture/05-diagrams/`](../../04-diagrams/)

The high-level architecture diagrams are maintained in the DFMS Product Context submodule:

- **[System Context Diagram](../../01-system-design/diagrams/system-context-diagram.mmd)** - C4 Level 1
- **[Container Diagram](../../01-system-design/diagrams/container-diagram.mmd)** - C4 Level 2
- **[Deployment Diagram](../../04-diagrams/deployment/deployment-diagram.mmd)** - Infrastructure architecture
- **[Sequence Diagrams](../../04-diagrams/sequences/)** - Interaction flows
- **[State Diagrams](../../04-diagrams/states/)** - State machines
- **[ER Diagram](../../04-diagrams/data/entity-relationship-diagram.mmd)** - Entity relationships
- **[Integration Diagram](../../04-diagrams/integration/integration-architecture-diagram.mmd)** - External integrations
- **[Diagrams Index](../../04-diagrams/diagrams-index.md)** - Complete list of all diagrams

This document contains **Django-specific component diagrams** showing implementation details.

## Django Implementation Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Browser<br/>Django Templates + Bootstrap]
        MOBILE[Mobile Apps<br/>Flutter]
    end

    subgraph "Web Server Layer"
        NGINX[Nginx<br/>Reverse Proxy<br/>Static Files]
    end

    subgraph "Application Layer"
        DJANGO[Django Application<br/>Gunicorn WSGI]
        DRF[Django REST Framework<br/>API Endpoints]
        JWT[JWT Authentication<br/>PyJWT]
    end

    subgraph "Background Tasks"
        CELERY[Celery Workers]
        BEAT[Celery Beat<br/>Scheduled Tasks]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Multi-Schema)]
        REDIS[(Redis Cache)]
    end

    subgraph "Storage"
        S3[AWS S3<br/>Documents & Media]
    end

    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> DJANGO
    DJANGO --> DRF
    DRF --> JWT
    DJANGO --> CELERY
    CELERY --> REDIS
    BEAT --> REDIS
    DJANGO --> PG
    DJANGO --> REDIS
    DJANGO --> S3

    style WEB fill:#e1f5fe
    style MOBILE fill:#e1f5fe
    style NGINX fill:#fff3e0
    style DJANGO fill:#c8e6c9
    style DRF fill:#c8e6c9
    style JWT fill:#c8e6c9
    style CELERY fill:#f3e5f5
    style BEAT fill:#f3e5f5
    style PG fill:#ffebee
    style REDIS fill:#ffebee
    style S3 fill:#fce4ec
```

## 2. Multi-Tenant Architecture

```mermaid
graph TB
    subgraph "Request Flow"
        REQ[Incoming Request]
        MW[Tenant Middleware]
        CTX[Tenant Context]
    end

    subgraph "PostgreSQL Database"
        PUBLIC[Public Schema<br/>- tenants<br/>- plans<br/>- system_config]
        T1[tenant_001 Schema<br/>- users<br/>- vehicles<br/>- trips<br/>- orders]
        T2[tenant_002 Schema<br/>- users<br/>- vehicles<br/>- trips<br/>- orders]
        T3[tenant_003 Schema<br/>- users<br/>- vehicles<br/>- trips<br/>- orders]
    end

    REQ --> MW
    MW --> CTX
    CTX --> PUBLIC
    CTX --> T1
    CTX --> T2
    CTX --> T3

    style PUBLIC fill:#e3f2fd
    style T1 fill:#f3e5f5
    style T2 fill:#e8f5e9
    style T3 fill:#fff3e0
```

## 3. Authentication & Authorization Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant J as JWT Service
    participant DB as PostgreSQL
    participant R as Redis

    U->>F: Login Credentials
    F->>A: POST /api/v1/auth/login
    A->>DB: Validate Credentials
    DB-->>A: User Data
    A->>J: Generate Tokens
    J-->>A: Access & Refresh Token
    A->>R: Store Session
    A-->>F: Return Tokens
    F->>F: Store in LocalStorage

    Note over F,A: Subsequent Requests
    F->>A: API Request + Bearer Token
    A->>J: Validate Token
    J-->>A: Token Valid
    A->>DB: Fetch Data
    DB-->>A: Response Data
    A-->>F: JSON Response

    Note over F,A: Token Refresh
    F->>A: POST /api/v1/auth/refresh
    A->>J: Validate Refresh Token
    J-->>A: New Access Token
    A-->>F: New Access Token
```

## 4. Data Flow Architecture

```mermaid
graph LR
    subgraph "Input Layer"
        WEB_FORM[Web Forms]
        API_POST[API Requests]
        MOBILE_INPUT[Mobile Input]
    end

    subgraph "Validation Layer"
        DJANGO_VALID[Django Forms]
        DRF_SERIAL[DRF Serializers]
    end

    subgraph "Business Logic"
        SERVICES[Service Layer]
        SIGNALS[Django Signals]
    end

    subgraph "Data Access"
        ORM[Django ORM]
        CACHE[Cache Layer]
    end

    subgraph "Storage"
        PG[(PostgreSQL)]
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

    ORM --> PG
    CACHE --> REDIS
    CACHE --> PG

    style SERVICES fill:#c8e6c9
    style ORM fill:#e1f5fe
```

## 5. Transport Order Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Create Order
    Draft --> PendingApproval: Submit
    PendingApproval --> Approved: Approve
    PendingApproval --> Rejected: Reject
    Rejected --> Draft: Revise
    Approved --> Assigned: Assign Vehicle/Driver
    Assigned --> InTransit: Start Trip
    InTransit --> Delivered: Complete Delivery
    Delivered --> [*]: Close Order

    Approved --> Cancelled: Cancel
    Assigned --> Cancelled: Cancel
    Cancelled --> [*]
```

## 6. Deployment Architecture (AWS)

```mermaid
graph TB
    subgraph "Internet"
        USERS[Users]
    end

    subgraph "AWS Cloud"
        subgraph "Network Layer"
            R53[Route 53<br/>DNS]
            CF[CloudFront CDN<br/>Static Assets]
        end

        subgraph "Compute Layer"
            EC2[EC2 Instance<br/>t3.large]
            subgraph "Docker Containers"
                NGINX_C[Nginx]
                DJANGO_C[Django + Gunicorn]
                CELERY_C[Celery Workers]
            end
        end

        subgraph "Data Layer"
            RDS[(RDS PostgreSQL<br/>db.t3.small)]
            ELASTICACHE[(ElastiCache Redis<br/>cache.t3.micro)]
        end

        subgraph "Storage Layer"
            S3_STATIC[S3 Bucket<br/>Static Files]
            S3_MEDIA[S3 Bucket<br/>User Uploads]
            S3_BACKUP[S3 Bucket<br/>Backups]
        end

        subgraph "Monitoring"
            CW[CloudWatch<br/>Logs & Metrics]
        end
    end

    USERS --> R53
    R53 --> EC2
    USERS --> CF
    CF --> S3_STATIC

    EC2 --> RDS
    EC2 --> ELASTICACHE
    EC2 --> S3_MEDIA
    EC2 --> CW

    RDS --> S3_BACKUP

    style EC2 fill:#fff3e0
    style RDS fill:#e1f5fe
    style ELASTICACHE fill:#ffebee
```

## 7. Module Dependencies

```mermaid
graph TD
    subgraph "Core Modules"
        AUTH[Authentication<br/>JWT + Permissions]
        TENANT[Multi-tenancy<br/>Schema Management]
    end

    subgraph "Master Data"
        USERS[Users]
        POI[Points of Interest]
        PRODUCTS[Products]
    end

    subgraph "Fleet Management"
        VEHICLES[Vehicles]
        DRIVERS[Drivers]
        VENDORS[Vendors]
    end

    subgraph "Transport Operations"
        REQUISITION[Transport Requisition]
        ORDERS[Transport Orders]
        TRIPS[Trip Management]
    end

    subgraph "Execution"
        GATE[Gate Management]
        SCALE[Weighing]
        QC[Quality Control]
        GPS[GPS Tracking]
    end

    subgraph "Analytics"
        COMMAND[Command Center]
        REPORTS[Reports]
        COSTING[Trip Costing]
    end

    AUTH --> TENANT
    TENANT --> USERS
    USERS --> POI
    USERS --> PRODUCTS

    USERS --> VEHICLES
    USERS --> DRIVERS
    VENDORS --> VEHICLES

    POI --> REQUISITION
    PRODUCTS --> REQUISITION
    REQUISITION --> ORDERS

    VEHICLES --> TRIPS
    DRIVERS --> TRIPS
    ORDERS --> TRIPS

    TRIPS --> GATE
    GATE --> SCALE
    SCALE --> QC
    TRIPS --> GPS

    TRIPS --> COMMAND
    TRIPS --> REPORTS
    TRIPS --> COSTING

    style AUTH fill:#ffcdd2
    style TENANT fill:#ffcdd2
```

## 8. Database Schema Overview

```mermaid
erDiagram
    TENANTS ||--o{ USERS : has
    USERS ||--o{ VEHICLES : manages
    USERS ||--o{ DRIVERS : manages
    VENDORS ||--o{ VEHICLES : provides
    VENDORS ||--o{ DRIVERS : provides

    USERS ||--o{ TRANSPORT_ORDERS : creates
    TRANSPORT_ORDERS ||--|| TRIPS : generates
    VEHICLES ||--o{ TRIPS : assigned_to
    DRIVERS ||--o{ TRIPS : assigned_to

    TRIPS ||--o{ GPS_TRACKING : tracks
    TRIPS ||--o{ GATE_ENTRIES : has
    TRIPS ||--o{ QC_CHECKS : undergoes

    POI ||--o{ TRANSPORT_ORDERS : origin
    POI ||--o{ TRANSPORT_ORDERS : destination
    PRODUCTS ||--o{ TRANSPORT_ORDERS : contains

    TENANTS {
        uuid id PK
        string schema_name
        string name
        string subdomain
        boolean is_active
    }

    USERS {
        uuid id PK
        string email
        string username
        string role
        string department
        boolean is_active
    }

    VEHICLES {
        uuid id PK
        string registration_no
        string type
        decimal capacity_weight
        string status
        uuid vendor_id FK
    }

    DRIVERS {
        uuid id PK
        string employee_id
        string license_number
        string status
        uuid vendor_id FK
    }

    TRIPS {
        uuid id PK
        string trip_number
        uuid vehicle_id FK
        uuid driver_id FK
        string status
        timestamp planned_start
        timestamp actual_start
    }
```

## 9. API Request Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant D as Django
    participant M as Middleware
    participant V as View
    participant S as Serializer
    participant DB as Database
    participant R as Redis Cache

    C->>N: HTTPS Request
    N->>D: Forward to Django
    D->>M: Process Middleware
    M->>M: Authentication Check
    M->>M: Tenant Resolution
    M->>V: Route to View
    V->>S: Validate Data

    alt Cache Hit
        V->>R: Check Cache
        R-->>V: Cached Data
    else Cache Miss
        V->>DB: Query Database
        DB-->>V: Result Set
        V->>R: Update Cache
    end

    V->>S: Serialize Response
    S-->>D: JSON Response
    D-->>N: HTTP Response
    N-->>C: HTTPS Response
```

## 10. Scaling Strategy

```mermaid
graph LR
    subgraph "Current (200-300 users)"
        SINGLE[Single EC2<br/>t3.large]
    end

    subgraph "Phase 2 (500+ users)"
        EC2_LARGE[Larger EC2<br/>t3.xlarge]
        READ_REPLICA[(RDS Read Replica)]
    end

    subgraph "Phase 3 (1000+ users)"
        ALB[Application<br/>Load Balancer]
        EC2_1[EC2 Instance 1]
        EC2_2[EC2 Instance 2]
        EC2_3[EC2 Instance 3]
    end

    subgraph "Phase 4 (5000+ users)"
        ASG[Auto Scaling Group]
        FARGATE[ECS Fargate]
        AURORA[(Aurora PostgreSQL)]
    end

    SINGLE --> EC2_LARGE
    EC2_LARGE --> ALB
    ALB --> ASG
    ASG --> FARGATE

    style SINGLE fill:#c8e6c9
    style EC2_LARGE fill:#fff9c4
    style ALB fill:#ffe0b2
    style FARGATE fill:#ffccbc
```

---

## How to View These Diagrams

1. **GitHub**: These Mermaid diagrams will render automatically when viewed on GitHub
2. **VS Code**: Install the "Markdown Preview Mermaid Support" extension
3. **Online**: Use [Mermaid Live Editor](https://mermaid.live/)
4. **Documentation Sites**: Most modern documentation tools support Mermaid (MkDocs, Docusaurus, etc.)