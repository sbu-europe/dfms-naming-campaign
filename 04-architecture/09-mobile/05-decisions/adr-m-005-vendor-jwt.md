---
adr: M-005
status: Accepted
date: 2026-09-16
---

# ADR-M-005: Vendor JWT (not tenant-user JWT)

## Context

DFMS has multiple JWT audiences (tenant portal users vs vendor portal identities).

## Decision

Vendor Mobile authenticates with **vendor JWT** pair (access + refresh via `vendor/token/refresh/`). Do not reuse tenant-user tokens in this client.

## Consequences

- Refresh and logout paths are vendor-specific.
- Authorization on backend must enforce vendor identity + membership for tenant paths.
