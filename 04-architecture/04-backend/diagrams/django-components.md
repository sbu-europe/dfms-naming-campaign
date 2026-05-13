# Django Components Diagram

> Low-level Django component architecture diagram

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../)

- **[High-Level Diagrams](./architecture-overview.md)** - System context and container diagrams
- **[System Architecture](../django-system-architecture.md)** - Django system architecture

This document provides **Django component-level diagrams** (apps, models, views, services).

---

## Overview

This document contains component-level diagrams showing Django apps, models, views, and service interactions.

---

## Django Apps Structure

```
nourish-backend/
├── apps/
│   │
│   ├── core/              # RBAC, Auth, Middleware, Dashboard (SHARED_APPS)
│   │   ├── models.py      # Role, Permission, RolePermission, TenantAwareModel
│   │   ├── middleware.py  # TenantStatus, SessionControl, Audit, AdminTitle
│   │   ├── rbac_service.py
│   │   └── permissions.py
│   │
│   ├── tenants/           # Multi-tenancy (SHARED_APPS)
│   │   ├── models.py      # Tenant, Domain
│   │   └── admin.py
│   │
│   ├── users/             # User management (TENANT_APPS)
│   │   ├── models.py      # User, UserRole
│   │   └── views.py
│   │
│   ├── master_data/       # Products, POIs, Routes, Vehicles, Fleet, Fuel (TENANT_APPS)
│   │   ├── models.py      # Vehicle, VehicleBrand, Product, POI, Route, Zone…
│   │   └── services.py
│   │
│   ├── requisitions/      # Product Requisition Management (TENANT_APPS)
│   ├── transport/         # Transport Orders & Requests (TENANT_APPS)
│   ├── vendors/           # Vendor Management (TENANT_APPS)
│   ├── operations/        # Gate, Scaling, Loading, Command Center (TENANT_APPS)
│   │   ├── gate/
│   │   ├── scaling/
│   │   ├── loading/
│   │   └── command_center/
│   ├── quality/           # QC Inspections (TENANT_APPS)
│   ├── costing/           # Trip Costing & Finance (TENANT_APPS)
│   ├── tracking/          # Real-time Trip Tracking (TENANT_APPS)
│   ├── notifications/     # Alerts & Notifications (TENANT_APPS)
│   ├── reporting/         # Analytics & Reports (TENANT_APPS)
│   └── audit/             # Immutable Audit Log (TENANT_APPS)
│
└── config/
    ├── settings/          # base.py, development.py, production.py
    ├── celery.py
    ├── urls.py
    ├── wsgi.py
    └── asgi.py
```

---

## Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Django Application                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   URLs.py    │──────▶│   Viewsets   │                   │
│  └──────────────┘      └──────────────┘                   │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         │            │ Serializers  │                        │
│         │            └──────────────┘                        │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         │            │   Services   │                        │
│         │            └──────────────┘                        │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         └───────────▶│    Models    │                        │
│                      └──────────────┘                        │
│                            │                                 │
│                            ▼                                 │
│                    ┌──────────────┐                         │
│                    │  PostgreSQL   │                         │
│                    └──────────────┘                         │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                   │
│  │   Celery     │──────▶│    Tasks     │                   │
│  └──────────────┘      └──────────────┘                   │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         │            │   Services   │                        │
│         │            └──────────────┘                        │
│         │                    │                               │
│         │                    ▼                               │
│         │            ┌──────────────┐                        │
│         └───────────▶│    Redis     │                        │
│                      └──────────────┘                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Model Relationships

```
┌─────────────────┐
│     Tenant      │
└─────────────────┘
        │
        │ 1:N
        │
        ├─────────────────┬─────────────────┬──────────────┐
        │                 │                 │              │
        ▼                 ▼                 ▼              ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐
│     User     │  │ Transport    │  │   Vehicle    │  │  Driver  │
│              │  │   Request    │  │              │  │          │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────┘
        │                 │                 │              │
        │                 │                 │              │
        │                 │ 1:N             │              │
        │                 │                 │              │
        │                 ▼                 │              │
        │          ┌──────────────┐         │              │
        │          │ Transport    │         │              │
        │          │   Order     │─────────┼──────────────┘
        │          └──────────────┘         │
        │                 │                 │
        │                 │ N:1             │
        │                 │                 │
        │                 ▼                 │
        │          ┌──────────────┐         │
        │          │     Trip     │─────────┘
        │          └──────────────┘
        │
        │
        ▼
┌──────────────┐
│   Role       │
└──────────────┘
```

---

## Request Flow

```
HTTP Request
    │
    ▼
┌──────────────┐
│  Middleware  │  (Authentication, Tenant, CORS)
└──────────────┘
    │
    ▼
┌──────────────┐
│   URL Router │
└──────────────┘
    │
    ▼
┌──────────────┐
│   ViewSet    │  (Permission check)
└──────────────┘
    │
    ▼
┌──────────────┐
│  Serializer  │  (Validation)
└──────────────┘
    │
    ▼
┌──────────────┐
│   Service    │  (Business logic)
└──────────────┘
    │
    ▼
┌──────────────┐
│    Model     │  (Database)
└──────────────┘
    │
    ▼
HTTP Response
```

---

## Related Documentation

- **[Architecture Overview](./architecture-overview.md)** - High-level diagrams
- **[System Architecture](../django-system-architecture.md)** - Django architecture

---

**Last Updated**: 2026-02-13

