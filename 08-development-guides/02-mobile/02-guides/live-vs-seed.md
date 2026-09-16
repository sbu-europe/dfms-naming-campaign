---
last_updated: 2026-09-16
---

# Vendor Mobile — Live API vs Seed

## Flag

`USE_LIVE_API` (dart-define and/or encrypted env). Default in code: **`true`**.

| Value | Behavior |
|-------|----------|
| `true` | `*RepositoryApiImpl` → real `/api/v1/vendor/*` |
| `false` | Seed/offline `*RepositoryImpl` for prototyping without backend |

`LocationRepository` is always device-based.

## When to use seed

- UI work without backend
- Demo without network

Prefer **live + seeded backend accounts** for Maestro and integration validation.
