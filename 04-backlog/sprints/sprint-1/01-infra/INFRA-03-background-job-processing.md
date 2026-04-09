---
jira_key: DFS-003
jira_type: Story
jira_epic: DFS-010
jira_sprint: "Sprint 1"
task_id: INFRA-03
title: Background Job Processing (Celery + Redis)
epic: System Foundation Infrastructure
status: Done
story_points: 3
assignee: ~
---

# INFRA-03 — Background Job Processing (Celery + Redis)

## User Story

**As a** developer  
**I want** Celery tasks to execute in the correct tenant schema  
**So that** async operations (emails, notifications) do not fail with `ProgrammingError`

## Description

Emails (OTP, invitations, welcome mails) and future async tasks (report generation, bulk imports) must not block HTTP responses. Celery workers process tasks from a Redis queue, and Celery Beat handles scheduled/periodic tasks. The result backend is Redis (not `django-db`) to avoid multi-tenant schema conflicts.

## Acceptance Criteria

- [x] Tasks decorated with `@shared_task` execute asynchronously in the worker container
- [x] Calling `task.delay(...)` returns immediately in the web process
- [x] Celery Beat is running and can execute periodic tasks
- [x] OTP email is dispatched via Celery (not inline) on every login
- [x] Worker logs show successful task execution

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| INFRA-03-1 | Install `celery`, `redis`, and `django-celery-beat` packages; add to `requirements.txt` | DFS-003-1 | Done |
| INFRA-03-2 | Create `config/celery.py` — initialise Celery app, configure autodiscovery, bind to Django settings | DFS-003-2 | Done |
| INFRA-03-3 | Set `CELERY_BROKER_URL = redis://redis:6379/0` and `CELERY_RESULT_BACKEND = redis://redis:6379/2` in `config/settings/base.py` | DFS-003-3 | Done |
| INFRA-03-4 | Add `celery_worker` service to `docker-compose.yml` (`command: celery -A config worker -l info`) | DFS-003-4 | Done |
| INFRA-03-5 | Add `celery_beat` service to `docker-compose.yml` (`command: celery -A config beat -l info`) | DFS-003-5 | Done |
| INFRA-03-6 | Hardcode `CELERY_RESULT_BACKEND: redis://redis:6379/2` in `docker-compose.yml` `environment` — prevents stale `.env` overrides | DFS-003-6 | Done |
| INFRA-03-7 | Create `apps/notifications/tasks.py` — implement `send_otp_notification` accepting `user_id` and `schema_name` | DFS-003-7 | Done |
| INFRA-03-8 | Wrap `User.objects.get()` inside `schema_context(schema_name)` in all notification tasks | DFS-003-8 | Done |
| INFRA-03-9 | Implement `send_password_reset_email` task in `apps/notifications/tasks.py` | DFS-003-9 | Done |

## Technical Notes

- **Why Redis result backend?** `django-db` backend stores task results in tenant-scoped tables. Celery workers run without HTTP context so they default to `public` schema where these tables do not exist. Redis avoids this entirely.
- Redis DB indexes: `0` = broker, `1` = session cache, `2` = task results
- `CELERY_RESULT_BACKEND` is pinned in `docker-compose.yml` to prevent developer `.env` files from accidentally overriding to `django-db`

## Definition of Done

- `send_otp_notification.delay(...)` called in web process; email arrives without blocking the HTTP response
- `docker compose logs celery_worker` shows `Task succeeded`
