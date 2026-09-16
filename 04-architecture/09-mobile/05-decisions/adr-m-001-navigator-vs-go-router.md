---
adr: M-001
status: Accepted
date: 2026-09-16
---

# ADR-M-001: Navigator + typed RoutePath (not go_router)

## Context

`go_router` is listed in pubspec, but session gating and feature routes are built around `AppRouter` / `RoutePath` and Flutter `Navigator`.

## Decision

Keep **Navigator + typed routes** as the navigation SSOT until a deliberate migration ADR replaces it.

## Consequences

- Docs and new features should not assume go_router APIs.
- Consider removing unused `go_router` dependency in a cleanup PR.
