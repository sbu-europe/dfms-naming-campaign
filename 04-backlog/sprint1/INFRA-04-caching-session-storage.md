---
task_id: INFRA-04
title: Caching and Session Storage (Redis-backed)
epic: System Foundation Infrastructure
sprint: Sprint 1 — Infrastructure, Onboarding & Secure Login
type: Task
priority: High
status: Done
story_points: 1
assignee: ~
---

# INFRA-04 — Caching and Session Storage (Redis-backed)

## Summary

Configure Redis as the session backend and cache so user sessions are fast, stateless across workers, and survive web container restarts.

## Description

Django's default in-process or database-backed session store does not work well across multiple workers. Redis provides a shared, fast session store that all web worker processes can access. OTP state (pending OTP codes, signed cookies) is also stored in Redis.

## Acceptance Criteria

- [ ] Django sessions are stored in Redis (not the database or in-memory)
- [ ] Session survives a web container restart (data persists in Redis)
- [ ] OTP state and signed cookies are stored in Redis
- [ ] Cache read/write latency is sub-millisecond for typical keys
- [ ] `django-redis` is the cache backend

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| INFRA-04-1 | Install `django-redis`; add to `requirements.txt` | Done |
| INFRA-04-2 | Configure `CACHES['default']` in `config/settings/base.py` — use `django_redis.cache.RedisCache` with location `redis://redis:6379/1` | Done |
| INFRA-04-3 | Set `SESSION_ENGINE = 'django.contrib.sessions.backends.cache'` and `SESSION_CACHE_ALIAS = 'default'` | Done |
| INFRA-04-4 | Set `SESSION_COOKIE_AGE`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY` to appropriate values | Done |
| INFRA-04-5 | Verify session persistence: login → restart `web` container → confirm session is still active | Done |

## Technical Notes

- Redis DB indexes: `0` = Celery broker, `1` = session/cache, `2` = Celery task results
- OTP pending state for the admin portal is stored as a signed cookie (`dfms_admin_pending`) — Redis is used for session data, while the signed cookie tracks the in-progress 2FA state without requiring a session write

## Definition of Done

- Login, navigate, restart `web` container, refresh — user remains logged in
- `docker exec redis redis-cli -n 1 keys "*"` shows session keys
