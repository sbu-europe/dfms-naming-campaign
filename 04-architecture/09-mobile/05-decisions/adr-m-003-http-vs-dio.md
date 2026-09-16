---
adr: M-003
status: Accepted
date: 2026-09-16
---

# ADR-M-003: package:http (not Dio)

## Context

App docs historically mentioned Dio; implementation uses `package:http` via `ApiClient`.

## Decision

Standardize on **`http` + custom `ApiClient`** (auth retry, Host header, multipart).

## Consequences

- Interceptors/plugins differ from Dio ecosystem.
- Keep client behavior documented in `03-backend-integration/api-client.md`.
