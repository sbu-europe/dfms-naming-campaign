# Data Flow Diagrams

> Low-level Django data flow diagrams

## 📖 High-Level Context

> **Source of Truth**: [`04-architecture/`](../../)

- **[High-Level Diagrams](./architecture-overview.md)** - System context and container diagrams
- **[System Architecture](../django-system-architecture.md)** - Django system architecture

This document provides **data flow diagrams** (API requests, background tasks, notifications).

---

## Overview

This document contains data flow diagrams showing how data moves through the Django application for various operations.

---

## Transport Order Creation Flow

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ POST /api/v1/transport-orders/
       │ {transport_request_id, status}
       ▼
┌─────────────────────────────────────┐
│         Django Application          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │  ViewSet      │                  │
│  │  create()     │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │ Serializer   │                  │
│  │ validate()   │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  Service     │                  │
│  │  create()    │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │   Model      │                  │
│  │  save()      │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  PostgreSQL  │                  │
│  │  INSERT      │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │   Celery     │                  │
│  │   Task       │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │ Notification │                  │
│  │   Service    │                  │
│  └──────────────┘                  │
│                                     │
└─────────────────────────────────────┘
       │
       │ Response: {id, to_number, status}
       ▼
┌──────────────┐
│   Client     │
└──────────────┘
```

---

## Vehicle Assignment Flow

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ POST /api/v1/transport-orders/{id}/assign_vehicle/
       │ {vehicle_id, driver_id}
       ▼
┌─────────────────────────────────────┐
│         Django Application          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │  ViewSet     │                  │
│  │  assign_     │                  │
│  │  vehicle()   │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  Permission  │                  │
│  │  Check       │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  Service     │                  │
│  │  assign_     │                  │
│  │  vehicle()    │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ├───────────────────────────┤
│         │                           │
│         ▼                           │
│  ┌──────────────┐  ┌──────────────┐
│  │   Vehicle    │  │    Driver    │
│  │   Model      │  │    Model     │
│  └──────┬───────┘  └──────┬───────┘
│         │                 │
│         └────────┬────────┘
│                  │
│                  ▼
│         ┌──────────────┐
│         │ Transport    │
│         │ Order Model  │
│         │ update()     │
│         └──────┬───────┘
│                │
│                ▼
│         ┌──────────────┐
│         │  PostgreSQL  │
│         │  UPDATE      │
│         └──────┬───────┘
│                │
│                ▼
│         ┌──────────────┐
│         │   Celery     │
│         │   Task       │
│         └──────┬───────┘
│                │
│                ▼
│         ┌──────────────┐
│         │ Notification │
│         │   Service    │
│         └──────────────┘
│                                     │
└─────────────────────────────────────┘
       │
       │ Response: {id, status: 'assigned', vehicle, driver}
       ▼
┌──────────────┐
│   Client     │
└──────────────┘
```

---

## Background Task Flow

```
┌──────────────┐
│   Model      │
│   save()     │
└──────┬───────┘
       │ Signal
       ▼
┌──────────────┐
│   Celery     │
│   Task       │
│   delay()    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Redis      │
│   Broker     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Celery     │
│   Worker     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Service    │
│   Method     │
└──────┬───────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Email      │  │     SMS      │  │     Push      │
│   Service    │  │   Service    │  │   Service    │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Authentication Flow

```
┌──────────────┐
│   Client     │
└──────┬───────┘
       │ POST /api/v1/auth/login/
       │ {email, password}
       ▼
┌─────────────────────────────────────┐
│         Django Application          │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────┐                  │
│  │  Auth View   │                  │
│  │  login()     │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  User        │                  │
│  │  authenticate│                  │
│  └──────┬───────┘                  │
│         │                           │
│         ▼                           │
│  ┌──────────────┐                  │
│  │  JWT Service │                  │
│  │  generate_   │                  │
│  │  tokens()    │                  │
│  └──────┬───────┘                  │
│         │                           │
│         ├──────────────┬────────────┤
│         │              │            │
│         ▼              ▼            │
│  ┌──────────────┐ ┌──────────────┐
│  │ Access Token │ │Refresh Token │
│  └──────────────┘ └──────────────┘
│                                     │
└─────────────────────────────────────┘
       │
       │ Response: {access, refresh}
       ▼
┌──────────────┐
│   Client     │
│   (Store     │
│   tokens)    │
└──────────────┘
```

---

## Related Documentation

- **[Architecture Overview](./architecture-overview.md)** - High-level diagrams
- **[System Architecture](../django-system-architecture.md)** - Django architecture

---

**Last Updated**: 2026-02-13

