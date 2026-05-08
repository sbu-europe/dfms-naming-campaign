# Django Components Diagram

> Low-level Django component architecture diagram

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../)

- **[High-Level Diagrams](./architecture-overview.md)** - System context and container diagrams
- **[System Architecture](../architecture/system-architecture.md)** - Django system architecture

This document provides **Django component-level diagrams** (apps, models, views, services).

---

## Overview

This document contains component-level diagrams showing Django apps, models, views, and service interactions.

---

## Django Apps Structure

```
dfms-backend/
├── apps/
│   ├── core/                    # Core functionality
│   │   ├── models.py            # Base models
│   │   ├── views.py             # Base views
│   │   ├── services.py          # Core services
│   │   └── permissions.py       # Permission classes
│   │
│   ├── tenants/                 # Multi-tenancy
│   │   ├── models.py            # Tenant model
│   │   └── middleware.py        # Tenant middleware
│   │
│   ├── users/                   # User management
│   │   ├── models.py            # User, Role, Permission
│   │   ├── serializers.py      # User serializers
│   │   └── views.py             # User viewsets
│   │
│   ├── transport/               # Transport management
│   │   ├── models.py            # TransportOrder, TransportRequest
│   │   ├── serializers.py       # Transport serializers
│   │   ├── views.py             # Transport viewsets
│   │   ├── services.py          # Transport services
│   │   └── tasks.py             # Celery tasks
│   │
│   ├── fleet/                   # Fleet management
│   │   ├── models.py            # Vehicle, Driver
│   │   ├── serializers.py       # Fleet serializers
│   │   └── views.py             # Fleet viewsets
│   │
│   └── notifications/            # Notifications
│       ├── services.py          # Email, SMS, Push
│       └── tasks.py             # Notification tasks
│
└── config/                      # Configuration
    ├── settings/                # Settings modules
    ├── urls.py                  # URL routing
    └── wsgi.py                  # WSGI config
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
- **[System Architecture](../architecture/system-architecture.md)** - Django architecture

---

**Last Updated**: 2026-02-13

