---
jira_key: DFS-004
jira_type: Story
jira_epic: DFS-010
jira_sprint: "Sprint 1"
task_id: INFRA-04
title: Caching and Session Storage (Redis-backed)
epic: System Foundation Infrastructure
status: Done
story_points: 1
assignee: ~
sub_tasks:
  - id: DFS-004-6
    title: "FB-003: Extend session timeout from 30 min to 24 hours (sliding window)"
    status: Open
feedback_file: ../04-feedback/INFRA-04-feedback.md
---

# INFRA-04 — Caching and Session Storage (Redis-backed)

## User Story

**As a** developer  
**I want** sessions and OTP state backed by Redis  
**So that** user sessions persist reliably and OTP values are fast to read/write

## Description

Django's default in-process or database-backed session store does not work well across multiple workers. Redis provides a shared, fast session store that all web worker processes can access. OTP state (pending OTP codes, signed cookies) is also stored in Redis.

## Acceptance Criteria

- [x] Django sessions are stored in Redis (not the database or in-memory)
- [x] Session survives a web container restart (data persists in Redis)
- [x] OTP state and signed cookies are stored in Redis
- [x] Cache read/write latency is sub-millisecond for typical keys
- [x] `django-redis` is the cache backend

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| INFRA-04-1 | Install `django-redis`; add to `requirements.txt` | DFS-004-1 | Done |
| INFRA-04-2 | Configure `CACHES['default']` in `config/settings/base.py` — use `django_redis.cache.RedisCache` with location `redis://redis:6379/1` | DFS-004-2 | Done |
| INFRA-04-3 | Set `SESSION_ENGINE = 'django.contrib.sessions.backends.cache'` and `SESSION_CACHE_ALIAS = 'default'` | DFS-004-3 | Done |
| INFRA-04-4 | Set `SESSION_COOKIE_AGE`, `SESSION_COOKIE_SECURE`, `SESSION_COOKIE_HTTPONLY` to appropriate values | DFS-004-4 | Done |
| INFRA-04-5 | Verify session persistence: login → restart `web` container → confirm session is still active | DFS-004-5 | Done |

## Technical Notes

- Redis DB indexes: `0` = Celery broker, `1` = session/cache, `2` = Celery task results
- OTP pending state for the admin portal is stored as a signed cookie (`dfms_admin_pending`) — Redis is used for session data, while the signed cookie tracks the in-progress 2FA state without requiring a session write

## Definition of Done

- Login, navigate, restart `web` container, refresh — user remains logged in
- `docker exec redis redis-cli -n 1 keys "*"` shows session keys

## From Demo Feedback ([FB-003](../04-feedback/INFRA-04-feedback.md))

### FB-003 — Extend Session Timeout to 24 Hours
- [ ] `SESSION_COOKIE_AGE = 86400` (24 hours) set in `config/settings/base.py`
- [ ] `SESSION_SAVE_EVERY_REQUEST = True` to enable sliding window (session refreshes on activity)
- [ ] Session expiry confirmed in testing: idle for 24 hours logs the user out; active use keeps session alive
