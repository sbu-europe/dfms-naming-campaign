---
adr: M-002
status: Accepted
date: 2026-09-16
---

# ADR-M-002: No use-case layer

## Context

Some boilerplates insert a `use_case/` package between ViewModels and repositories.

## Decision

**ViewModels call repository interfaces directly.** Domain package holds models + repository contracts only.

## Consequences

- Faster feature delivery; orchestration lives in ViewModels.
- Shared multi-step workflows should be extracted carefully (helpers/services) if duplication grows.
