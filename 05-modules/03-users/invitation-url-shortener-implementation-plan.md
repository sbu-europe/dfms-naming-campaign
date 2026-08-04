---
module: 03-users
specification: SMS invitation URL shortener — lean in-process implementation plan
version: 1.0
phase: Phase 1
last_updated: 2026-08-04
related_stories: AUTH-01, US-005, US-006
implementation_reference:
  - nourish-backend/apps/users/invitation_service.py
  - nourish-backend/apps/users/models.py (InvitationToken)
  - nourish-backend/apps/notifications/sms.py
  - nourish-backend/apps/notifications/tasks.py
  - nourish-backend/config/urls.py
  - nourish-backend/config/settings/base.py
---

# SMS invitation URL shortener — implementation plan

> **Purpose**: Proposed design for shortening the long invitation activation URL carried
> in SMS invites (AUTH-01), without standing up a new deployable service. Companion to
> [staff-invite-login-password-channels.md](./staff-invite-login-password-channels.md).

---

## 1. Background & deviation from AUTH-01

[AUTH-01](../../03-backlog/sprints/sprint-8/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md)
(assumptions **A7**, **A10**) specifies the URL shortener as a **standalone, separately
deployed DFMS service** with its own datastore and short domain.

A first pass at that design was built on branch `feat-sprint-7/url-shortener-system`
(`services/link-shortener/` — FastAPI, own Postgres, Alembic migrations, RS256 JWT
between services, Redis-backed circuit breaker) plus a Django client
(`apps/core/shortlink_client.py`). It is **not merged to `dev`** and remains gated behind
`SHORTLINK_ENABLED=false` pending short-domain DNS/TLS.

**This plan proposes an in-process alternative**: one Django model + one redirect view,
living inside `nourish-backend` itself, in the public/shared schema. It satisfies the
same functional requirement (short, resolvable, revocable, tenant-safe activation links)
without a second deployable, a second datastore, or cross-service auth.

**Open item for PO**: A7/A10 explicitly call for a standalone service (reusable by other
DFMS products later). This plan trades that reusability for zero operational overhead now.
If a second product needs shortening later, the in-process model can be extracted into a
standalone service at that point — nothing here blocks that path. **Needs sign-off before
implementation**, since it deviates from the accepted story assumptions.

---

## 2. Design summary

```
invitation_service.py                s.dfms.app (public schema)         acme.dfms.app (tenant schema)
──────────────────────               ─────────────────────────          ──────────────────────────────
1. build long activation URL
2. generate 7-char base62 code
3. ShortLink.objects.create(...)  →
4. send SMS with short URL
                                      5. GET /<code>/
                                         lookup ShortLink
                                         valid → 302 target_url  ───────→ 6. GET /activate/?token=<uuid>
                                         invalid/expired → 410              (existing view, unchanged)
```

No new service, no new datastore, no new domain purchase (see §6).

---

## 3. Data model

New model in a **shared/public-schema app** (e.g. `apps/core/models.py`), so it resolves
before tenant context is known:

| field | type | notes |
|---|---|---|
| `code` | `CharField`, unique, indexed | 7-char base62 (`0-9a-zA-Z`), ~3.5 × 10¹² space |
| `target_url` | `URLField` | the existing long tenant activation URL, unchanged |
| `invitation_token` | `UUIDField` | reference to `InvitationToken.token`, not a cross-schema FK |
| `expires_at` | `DateTimeField` | mirrors `InvitationToken.expires_at` |
| `is_active` | `BooleanField`, default `True` | flipped `False` on revoke |
| `created_at` | `DateTimeField(auto_now_add=True)` | |

No hit-count/analytics fields — out of scope, adds nothing to the core requirement.

---

## 4. Generation flow

In `apps/users/invitation_service.py::_build_activation_url` (and the resend path),
after building the long URL as today:

1. Generate a random ~42-bit integer, encode as base62 → 7-char `code`.
2. `ShortLink.objects.create(code=code, target_url=long_url, invitation_token=token.token, expires_at=token.expires_at)`.
   - On unique-constraint collision (rare), retry with a new random value, 2–3 attempts.
3. Return `https://s.dfms.app/<code>` instead of the long URL to whatever dispatches the
   SMS (`apps/notifications/sms.py::send_staff_invitation_sms`, queued via
   `apps/notifications/tasks.py`).

Gated behind the same style of flag as today's rollout, e.g. `SHORTLINK_ENABLED`, so the
long URL remains the fallback if disabled.

---

## 5. Redirect flow

1. New route in the **public-schema urlconf** (django-tenants `PUBLIC_SCHEMA_URLCONF`,
   parallel to `config/urls.py` / `apps/core/web_urls.py`): `path("<code>/", resolve_short_link)`.
2. View logic:
   - `ShortLink.objects.get(code=code)` → not found → 404/410 "link not found."
   - `is_active is False` or `expires_at < now()` → render simple "invitation link
     expired" page.
   - Otherwise → `HttpResponseRedirect(target_url)` (302).
3. Browser follows the 302 to `https://acme.dfms.app/activate/?token=<uuid>`, which now
   resolves through normal tenant middleware — `activate/` view is **unchanged**.

Security boundary stays at `InvitationToken` (single-use, expiry, revocation) exactly as
today — the short link is a redirector, not an auth artifact.

---

## 6. Hosting `s.dfms.app`

No domain purchase required — use a **subdomain of a domain already owned**:

1. **DNS**: one CNAME/A record, `s.dfms.app` → existing load balancer/ingress (same one
   serving `*.dfms.app`).
2. **TLS**: covered by existing wildcard cert (`*.dfms.app`) or one additional SAN — no
   new cert purchase/process.
3. **Django**: add `s.dfms.app` to `ALLOWED_HOSTS`; register it in django-tenants as the
   **public** domain (not a tenant domain) so it always resolves to the public schema.
4. **Runtime**: same Gunicorn/containers/deploy pipeline as every other DFMS host — no
   new service to provision, scale, or monitor.

---

## 7. Revocation & cleanup

- When `invitation_service` marks a token `activated` or `cancelled`, also set
  `ShortLink.objects.filter(invitation_token=token.token).update(is_active=False)`.
- Expired rows swept by existing Celery beat (reuse, no new sweeper process).

---

## 8. What this avoids vs. the standalone-service design

| | Standalone service (AUTH-01 A7/A10, `services/link-shortener/`) | This plan |
|---|---|---|
| New deployable | Yes (FastAPI app) | No |
| New datastore | Yes (own Postgres + Alembic) | No — one table in existing DB |
| Cross-service auth | Yes (RS256 JWT, key rotation) | No |
| Failure isolation needed | Yes (Redis circuit breaker) | No — same process as caller |
| New domain | Implied by "own short domain" | Subdomain of existing domain |
| Reusable by other products later | Yes, by design | Only via future extraction |

---

## 9. Rollout steps

1. PO sign-off on deviation from A7/A10 (§1).
2. Migration: add `ShortLink` model to a shared app, `python manage.py makemigrations && migrate_schemas --shared`.
3. Implement `resolve_short_link` view + public urlconf route.
4. Wire code generation + short-URL substitution into `invitation_service.py` and resend path.
5. Wire revoke-on-activate/cancel.
6. DNS + TLS for `s.dfms.app`; add to `ALLOWED_HOSTS` + django-tenants public domain config.
7. E2E: mint → SMS → tap → redirect → activate; expired code → 410; revoked code → 410.
8. Flip `SHORTLINK_ENABLED=true` once verified.

---

## 10. Local testing (no real domain / DNS / TLS required)

The real `s.dfms.app` domain is only needed for the prod DNS/TLS step (§6). Everything
else is testable locally today, reusing the dev conventions already in this repo.

### 10.1 Automated tests — no host setup needed

Django's test client sets the `Host` header directly, bypassing DNS entirely:

```python
response = self.client.get(f"/{code}/", HTTP_HOST="s.dev.dfms.local")
```

Covers redirect-on-valid, 410-on-expired, 410-on-revoked, and 404-on-unknown-code as
ordinary unit/integration tests — no local domain, DNS, or TLS involved.

### 10.2 Manual/browser testing — reuse the existing `*.dev.dfms.local` setup

This repo already maps local subdomains via `make setup-hosts`
(`scripts/setup-hosts.sh`), which writes `/etc/hosts` entries for `*.dev.dfms.local` →
`127.0.0.1`. `admin.dev.dfms.local` already resolves to the **public schema**
(`docs/guides/setup.md`).

Two options:

- **Fastest**: mount the short-link route under the existing `admin.dev.dfms.local` host
  for local testing — `http://admin.dev.dfms.local:8000/<code>/`. No `/etc/hosts` change
  needed.
- **Prod-accurate**: add one more entry the same way the script adds `admin`/`nourish`
  (`127.0.0.1 s.dev.dfms.local`), plus a `tenants.Domain` row (schema=`public`,
  domain=`s.dev.dfms.local`), so it resolves exactly like `s.dfms.app` will in prod —
  `http://s.dev.dfms.local:8000/<code>/`.

`ALLOWED_HOSTS="*"` is already the dev default (`config/settings/development.py`), so no
change needed there.

### 10.3 Getting a short URL to test with, without sending real SMS

`SMS_ENABLED=false` is already the local default — invitation SMS bodies (including the
short URL) are **logged**, not sent. Mint an invitation, read the short URL from the log
output, paste it into the browser. No SMS provider or phone required for full local E2E
(mint → short URL in logs → tap → 302 → real `activate/` page).

### 10.4 TLS

Not needed locally — everything runs over plain `http://...:8000`, same as the rest of
local dev.

---

## 11. Deployment

Rides the **existing deploy pipeline** — no new service definition, no new container.

### 11.1 Nginx — no change needed

`deploy/nginx.conf` uses a single wildcard `server_name _;` block proxying everything to
`web:8000`. There are no per-subdomain server blocks to add — a new short subdomain just
needs DNS pointed at the same target every other host resolves to; nginx passes it
through unchanged.

### 11.2 DNS

One record per environment, short subdomain → same load balancer target
`*.dfms.com`/`*.qa.dfms.com`/`*.stg.dfms.com` already resolve to
(`config/settings/production.py:35-41`). No new infra target.

### 11.3 Django config (per-environment `.env`, not committed)

- Add the short subdomain to `ALLOWED_HOSTS` (pattern in `.env.example:49-82`).
- Add it to `CSRF_TRUSTED_ORIGINS` if/when that setting is introduced (not currently set
  explicitly anywhere in this codebase — only `CSRF_COOKIE_DOMAIN` is).
- Register it as the **public**-schema domain in django-tenants — a `tenants.Domain` row
  with `schema=public` — same mechanism already used for `admin.<env>.dfms.com`.

### 11.4 Migration

`ShortLink` lives in a shared/public-schema app, so it ships via the standard
`migrate_schemas --shared` step already wired into every deploy path
(`scripts/entrypoint.sh:50-57` on container start; `scripts/pipeline.sh:386-392`; CI's
`deploy-dev` job). No special-casing required.

### 11.5 Which pipeline runs it, per environment

- **Dev**: fully automated — `.github/workflows/ci.yml`'s `deploy-dev` job SSHes to EC2,
  runs `migrate_schemas --shared` then `migrate_schemas`, restarts containers.
- **QA / Staging / Production**: `deploy-qa`, `deploy-staging`, `deploy-production` CI
  jobs are currently unimplemented stubs (`echo "TODO: configure secrets"`) — a
  pre-existing gap, not introduced by this feature. Until wired, these environments
  deploy via `scripts/pipeline.sh` (build → push to ECR → SSH deploy →
  `migrate_schemas --shared` → `migrate_schemas --tenant` → health-check `/health/` →
  restart web/celery).

### 11.6 Deployment checklist for this feature

1. DNS record for the short subdomain (per env).
2. `.env` update on that server: `ALLOWED_HOSTS` (+ `CSRF_TRUSTED_ORIGINS` if used).
3. `tenants.Domain` row for the subdomain → public schema.
4. Ship code + migration through whichever deploy path is available for that environment
   today (CI for dev, `scripts/pipeline.sh` for QA/staging/prod).
5. Verify `/{code}/` resolves and 302s correctly on the real host, and `/health/` still
   passes.

---

## 12. Code-level implementation steps

Confirmed against current `dev`: no `ShortLink`/shortlink code exists anywhere in the
repo today (`grep -ri "shortlink\|short_link\|shorturl"` across `*.py` — zero matches).
`apps.core` is **already in `SHARED_APPS`** (`config/settings/base.py:46-64`, comment
"Role, Permission models — shared across tenants") and already has `models.py`, so the
new model belongs there — no new Django app needed. There is **no
`PUBLIC_SCHEMA_URLCONF`**; all schemas share `config/urls.py` (`ROOT_URLCONF =
"config.urls"`, `base.py:113`), so the redirect route is added directly to the top-level
`urlpatterns`, not nested under `api_v1_urlpatterns`.

### 12.1 Files to add

| file | purpose |
|---|---|
| `apps/core/models.py` | add `ShortLink` model (§3) — append to existing file |
| `apps/core/migrations/00XX_shortlink.py` | generated via `makemigrations` |
| `apps/core/shortlink.py` *(new)* | `generate_code()` (base62, collision-retry), `mint_short_link(target_url, invitation_token, expires_at) -> ShortLink`, `revoke_short_links(invitation_token)` |
| `apps/core/shortlink_views.py` *(new)* | `resolve_short_link(request, code)` — lookup, 302 or 410 |
| `templates/core/short_link_expired.html` *(new)* | minimal "link expired" page for the 410 case |

### 12.2 Files to modify

| file | change |
|---|---|
| `config/urls.py` | add `path("s/<str:code>/", resolve_short_link)` to the main `urlpatterns` list (near the existing `path("", include("apps.core.web_urls"))` line), importing from `apps.core.shortlink_views` |
| `apps/users/invitation_service.py` | in `_build_activation_url(token, schema_name)` (lines 223-237): after building `invite_url` as today, if `settings.SHORTLINK_ENABLED`, call `mint_short_link(target_url=invite_url, invitation_token=token, expires_at=...)` and return the short URL instead — keeps all three call sites (line 690 `_create_token_and_dispatch`, line 969 `resend_invitation`, line 1135 OTP dispatch) unchanged, since they all go through this one function |
| `apps/users/invitation_service.py` | `cancel_invitation` (line 1050-1054): after `invitation.save(...)`, call `revoke_short_links(invitation.token)` |
| `apps/users/invitation_service.py` | wherever `invitation_status = InvitationToken.InvitationStatus.ACTIVATED` is set (line 1367, inside `activate_invitation`): call `revoke_short_links(invitation.token)` alongside |
| `config/settings/base.py` | add `SHORTLINK_ENABLED` (env-driven bool, default `False`) and `SHORT_LINK_BASE_URL` (e.g. `https://s.dfms.app`, env-driven, mirrors how `FRONTEND_URL`/`TENANT_DOMAIN_BASE` are already read at `base.py:444-467`) |
| `.env.example` | document the two new settings alongside existing `TENANT_DOMAIN_BASE`/`ALLOWED_HOSTS` entries (`.env.example:49-82`) |

### 12.3 Why no changes needed elsewhere

- `apps/notifications/sms.py::send_staff_invitation_sms` and
  `apps/notifications/tasks.py::send_invitation_sms` take `activation_url` as a plain
  string — since the short/long URL swap happens inside `_build_activation_url`, these
  keep receiving "the URL to put in the SMS" unchanged.
- No `PUBLIC_SCHEMA_URLCONF` split exists, and `apps.core` models already live in the
  public Postgres schema — because django-tenants keeps `public` in every schema's
  `search_path`, `ShortLink` lookups succeed regardless of which tenant's domain the
  request arrived on, so the view needs no schema-switching logic itself. A `Domain` row
  for the short subdomain is still required (deployment §11.3) so `TenantMainMiddleware`
  doesn't reject the unrecognized host outright.

### 12.4 Implementation order

1. `apps/core/models.py` — add `ShortLink`; `python manage.py makemigrations core`.
2. `apps/core/shortlink.py` — code generation + mint/revoke helpers.
3. `apps/core/shortlink_views.py` + `templates/core/short_link_expired.html`.
4. `config/urls.py` — wire the route.
5. `config/settings/base.py` + `.env.example` — add `SHORTLINK_ENABLED`, `SHORT_LINK_BASE_URL`.
6. `apps/users/invitation_service.py` — wire mint into `_build_activation_url`, wire revoke into `cancel_invitation` and `activate_invitation`.
7. Local `migrate_schemas --shared`; manual test per §10.
8. Unit tests: code generation collision handling, redirect view (valid/expired/revoked/unknown), revoke-on-activate, revoke-on-cancel.
9. Deploy per §11.

---

**Last Updated**: 2026-08-04
