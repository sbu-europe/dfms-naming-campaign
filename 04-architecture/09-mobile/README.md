# Mobile Architecture

> Flutter implementation architecture for DFMS mobile clients

**Last Updated**: 2026-09-16  
**Status**: Active  
**Primary implementation**: Vendor Mobile (`nourish-vendor-app`)

---

## Overview

This folder documents **how** DFMS mobile clients are built. It complements technology-agnostic C4 docs and product screen specs.

| Layer | Location | Role |
|-------|----------|------|
| C4 system design | [`../01-system-design/`](../01-system-design/) | What containers exist |
| **This folder** | `09-mobile/` | Flutter packages, session gating, API client, flavors |
| Product UX / flows | [`../../05-modules/15-mobile-apps/vendor-mobile/`](../../05-modules/15-mobile-apps/vendor-mobile/) | Screen IA and business rules |
| How-to guides | [`../../08-development-guides/02-mobile/`](../../08-development-guides/02-mobile/) | Setup, Maestro, contribution |
| Backend APIs | [`../04-backend/`](../04-backend/) + vendor endpoints | Server implementation |

---

## Current vs planned clients

| Client | Status (Phase 1) | Repo / surface |
|--------|------------------|----------------|
| **Vendor Mobile** | Implemented Flutter | `nourish-vendor-app` |
| **Driver** | Responsive Django Admin (not Flutter) | See [`../../05-modules/03-users/driver-interface-sprint4.md`](../../05-modules/03-users/driver-interface-sprint4.md) |
| **QC** | Spec / future; not an implemented Flutter app | [`../../05-modules/15-mobile-apps/qc-mobile.md`](../../05-modules/15-mobile-apps/qc-mobile.md) (aspirational) |

> Do not treat Driver/QC PRD Flutter docs as current implementation SSOT.

---

## Contents

### 00-overview/

| File | Description |
|------|-------------|
| [purpose-and-scope.md](00-overview/purpose-and-scope.md) | Vendor ops client vs portal vs Driver/QC |
| [architecture-summary.md](00-overview/architecture-summary.md) | Three packages, MVVM, no use-case layer |
| [technology-stack.md](00-overview/technology-stack.md) | Flutter 3.35.4 / Dart 3.9.2 / http / FVM |

### 01-application-structure/

| File | Description |
|------|-------------|
| [package-boundaries.md](01-application-structure/package-boundaries.md) | `lib` / `domain` / `data` deps |
| [presentation-conventions.md](01-application-structure/presentation-conventions.md) | Feature folder pattern |
| [navigation-and-session-gating.md](01-application-structure/navigation-and-session-gating.md) | Splash → MainShell |
| [state-and-di.md](01-application-structure/state-and-di.md) | ValueNotifier, DiModule |

### 02-environments-and-build/

| File | Description |
|------|-------------|
| [flavors.md](02-environments-and-build/flavors.md) | dev / test / staging / prod |
| [secrets-and-env.md](02-environments-and-build/secrets-and-env.md) | Encrypted env, key names |

### 03-backend-integration/

| File | Description |
|------|-------------|
| [api-client.md](03-backend-integration/api-client.md) | JWT, Host header, refresh |
| [endpoint-map.md](03-backend-integration/endpoint-map.md) | `/api/v1/vendor/*` map |
| [tenancy-and-vendor-types.md](03-backend-integration/tenancy-and-vendor-types.md) | Tenant scope, contractual fork |

### Root

| File | Description |
|------|-------------|
| [04-feature-map.md](04-feature-map.md) | Code folders ↔ product specs ↔ Maestro |
| [05-decisions/](05-decisions/) | Mobile ADRs |

---

## Related

- Product SSOT: [`vendor-mobile/`](../../05-modules/15-mobile-apps/vendor-mobile/)
- Testing: [`../../09-testing/mobile/`](../../09-testing/mobile/)
- Contracts note: [`../../06-contracts/01-apis/rest/README.md`](../../06-contracts/01-apis/rest/README.md) (vendor APIs — prefer endpoint-map + backend)
