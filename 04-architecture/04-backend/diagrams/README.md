# Django Implementation Diagrams

> Visual diagrams specific to the Django backend implementation

## 📖 Why Two Diagram Folders?

There are two separate diagram locations in this repo — they serve different purposes:

| Folder | What it contains | Who it's for |
|--------|-----------------|--------------|
| **[`05-diagrams/`](../../05-diagrams/)** | Technology-agnostic `.mmd` files — system overview, C4 context/container, deployment, sequences, states, ERD, integrations | Architects, PMs, all engineers |
| **This folder (`04-backend/diagrams/`)** | Django-specific `.md` files — app structure, request/data flow through Django layers, component interactions | Backend engineers implementing the Django codebase |

> If you're looking for the **system architecture overview**, go to [`05-diagrams/architecture/`](../../05-diagrams/architecture/).

## 📁 Contents

| Diagram | Description |
|---------|-------------|
| **architecture-overview.md** | Complete Django system architecture with all components |
| **django-components.md** | Django apps, middleware, and component interactions |
| **data-flow.md** | Data flow through Django layers (views, serializers, models) |

## 🎯 Purpose

These diagrams show:
- Django app structure and boundaries
- Request/response flow through Django layers
- Component interactions (middleware, signals, tasks)
- Implementation-specific patterns

## 🔗 Related Documentation

- **[System-Level Diagrams](../../05-diagrams/architecture/)** - C4 Level 1-2 diagrams
- **[Backend Architecture](../)** - Django architecture documentation
- **[All Diagrams Index](../../05-diagrams/diagrams-index.md)** - Complete catalog of all diagrams

---

**Last Updated**: February 27, 2026
