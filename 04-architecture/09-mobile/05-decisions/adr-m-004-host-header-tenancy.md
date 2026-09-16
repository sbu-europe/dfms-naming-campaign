---
adr: M-004
status: Accepted
date: 2026-09-16
---

# ADR-M-004: Host header for django-tenants

## Context

Backend uses django-tenants. Vendor platform APIs must hit the vendor schema, not an arbitrary tenant host.

## Decision

Send **`Host: DFMS_TENANT_HOST`** on API calls (default `vendors.dfms.com`, rewritten for local). Tenant-scoped resources still include `{tenantSchema}` in the path.

## Consequences

- Misconfigured Host breaks all vendor APIs.
- Local emulator/simulator URL and Host rewrite rules are required for backend pairing.
