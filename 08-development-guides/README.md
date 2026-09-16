# Development Guides

> Implementation guides and knowledge bases for DFMS implementations

## Overview

Implementation-specific development guides organized by technology stack.

## Structure

### 01-backend/ (Django/Python)

Complete Django implementation guides (setup, API, database, security, services, testing, deployment, contributing).

### 02-mobile/ (Flutter — Vendor Mobile)

Vendor Mobile how-to for `nourish-vendor-app`:

- [README](./02-mobile/README.md)
- [Development setup](./02-mobile/01-setup/development-setup.md)
- [Local backend](./02-mobile/01-setup/local-backend.md)
- [Contributing](./02-mobile/02-guides/contributing.md)
- [Live vs seed](./02-mobile/02-guides/live-vs-seed.md)
- [Maestro](./02-mobile/03-testing/maestro.md)

Architecture SSOT: [`../04-architecture/09-mobile/`](../04-architecture/09-mobile/).

> No `02-frontend` folder for now. Frontend guides can be added later under a new index if needed.

## Documentation hierarchy

```
02-domain/               → Business domain knowledge
05-modules/              → Technical specifications (what to build)
04-architecture/         → System & implementation architecture
06-contracts/            → API/Event contracts
08-development-guides/   → HOW to implement (this folder)
```

## Quick links

### Backend

- [Development Setup](./01-backend/01-setup/development-setup.md)
- [Django Architecture](../04-architecture/04-backend/)

### Mobile (Vendor)

- [Mobile setup](./02-mobile/01-setup/development-setup.md)
- [Flutter Architecture](../04-architecture/09-mobile/)
- [Maestro testing](../09-testing/mobile/)

---

**Last Updated**: 2026-09-16
