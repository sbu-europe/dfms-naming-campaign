---
task_id: DEVOPS-01-03
title: Local Environment Setup — STG (Staging Mirror)
epic: DevOps & Infrastructure
type: Task
priority: Medium
status: ~80% Done
story_points: 2
environment: local-stg
assignee: ~
---

# DEVOPS-01-03 — Local Environment Setup — STG (Staging Mirror)

## Summary

Run the application locally in production mode (Gunicorn, `runtime` Dockerfile target, `DEBUG=False`) to validate production behaviour before pushing to AWS staging.

## What's Already Built

The production Docker image and compose override are **fully implemented**:

| File | Purpose |
|------|---------|
| `Dockerfile` (`runtime` stage) | Lean Python 3.12-slim, non-root `dfms` user, Gunicorn entrypoint |
| `docker-compose.prod.yml` | Overrides `web`, `celery_worker`, `celery_beat` to use `runtime` target + `production` settings |
| `config/settings/production.py` | `DEBUG=False`, strict security headers, S3 storage, Sentry |
| `scripts/entrypoint.sh` | DB wait → `migrate_schemas --shared` → `collectstatic` → `exec "$@"` (Gunicorn) |

**To run local STG:**
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Acceptance Criteria

- [x] `Dockerfile` `runtime` stage builds cleanly — lean image, non-root `dfms` user
- [x] `docker-compose.prod.yml` overrides `web` to `runtime` target + `production` settings + Gunicorn (4 workers, `--timeout 120`)
- [x] `celery_worker` uses `runtime` target with `--concurrency=8` in prod
- [x] `scripts/entrypoint.sh` runs DB wait, `migrate_schemas --shared`, `collectstatic`, then `exec gunicorn`
- [x] `config/settings/production.py` — `DEBUG=False`, all security headers, S3 conditional, Sentry init
- [ ] `.env.stg.example` documenting staging-specific variable overrides *(pending)*
- [ ] Custom `403`/`404`/`500` error templates tested under `DEBUG=False` *(pending)*
- [ ] Startup command documented in `docs/development.md` *(pending)*

## Sub-tasks

| # | Sub-task | Status |
|---|----------|--------|
| DEVOPS-01-03-1 | `Dockerfile` `runtime` stage — multi-stage build: `builder` installs deps into `/install`, `runtime` copies from builder; non-root `dfms` user; `ENTRYPOINT ["scripts/entrypoint.sh"]` | Done |
| DEVOPS-01-03-2 | `docker-compose.prod.yml` — overrides `web`, `celery_worker`, `celery_beat` to `target: runtime` + `DJANGO_SETTINGS_MODULE: config.settings.production` | Done |
| DEVOPS-01-03-3 | `config/settings/production.py` — `DEBUG=False`, `SECURE_SSL_REDIRECT=True`, `HSTS`, `SESSION_COOKIE_SECURE`, S3 storage conditional, Sentry init | Done |
| DEVOPS-01-03-4 | `nginx.conf` — already production-ready: upstream keepalive, proxy buffering, static/media aliases, GPS endpoint timeout override | Done |
| DEVOPS-01-03-5 | Create `.env.stg.example` — document which variables differ from `.env.example` for staging (e.g. `DEBUG=False`, `USE_S3=False`, `ALLOWED_HOSTS`) | Pending |
| DEVOPS-01-03-6 | Create custom `templates/403.html`, `404.html`, `500.html` error pages — tested under `DEBUG=False` | Pending |
| DEVOPS-01-03-7 | Document local STG startup command in `docs/development.md` | Pending |

## Key Differences from DEV

| Setting | DEV (`docker-compose.yml`) | Local STG (`+ docker-compose.prod.yml`) |
|---------|----------------------------|----------------------------------------|
| Dockerfile stage | `dev` | `runtime` |
| Server | `runserver` | Gunicorn 4 workers |
| `DEBUG` | `True` | `False` |
| Source mount | Yes (live reload) | No (baked into image) |
| Celery concurrency | 4 | 8 |
| Static files | Django dev server | Nginx from volume |
| Settings file | `development.py` | `production.py` |
| User | root (container) | non-root `dfms` |

## Definition of Done

- `docker compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d` starts cleanly
- `curl -I http://localhost/` response includes `X-Frame-Options: DENY`
- `curl http://localhost/nonexistent` → custom 404 (not Django debug page)
