---
module: 03-users
specification: SMS invitation URL shortener — lean in-process implementation plan
version: 1.1
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

> **v1.1 changes** (post-review): shortening moved from `_build_activation_url` to the
> three SMS-only branches so email links stay long (§4); the dedicated `s.dfms.app`
> subdomain is dropped in favour of the tenant's existing host, removing the entire
> DNS/TLS workstream (§6); code length raised 7 → 12 characters (§3); mint failure now
> degrades to the long URL (§4); resend reuses the existing code (§7).

---

## 1. Background & deviation from AUTH-01

[AUTH-01](../../03-backlog/phase-1/sprints/sprint-8/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md)
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
without a second deployable, a second datastore, cross-service auth, or any new DNS.

### 1.1 Why this is worth doing — SMS segment cost

The invitation SMS body (`apps/notifications/sms.py:100-106`) is:

```
{inviter} invited you to join {org} on DFMS. Activate within 7 days: {url}
```

- Long URL — `https://acme.dfms.app/activate/?token=<36-char uuid>` ≈ **75 chars**.
  Total body lands at **~155-165 characters**, straddling the 160-character GSM-7
  single-segment boundary. Depending on inviter/org name length, the same feature bills
  **1 or 2 segments unpredictably**.
- Short URL — `https://acme.dfms.app/s/<12-char code>` ≈ **36 chars**. Total body
  ~115-125 characters — **reliably one segment**.

So the business case is: *halves worst-case SMS cost per invitation and makes it
deterministic*. That is the justification for the A7/A10 deviation, not operational
convenience alone.

### 1.2 Open item for PO

A7/A10 explicitly call for a standalone service (reusable by other DFMS products later).
This plan trades that reusability for zero operational overhead now. If a second product
needs shortening later, the in-process model can be extracted into a standalone service at
that point — nothing here blocks that path. **Needs sign-off before implementation**,
since it deviates from the accepted story assumptions.

---

## 2. Design summary

```
invitation_service.py                   acme.dfms.app (existing tenant host)
──────────────────────                  ────────────────────────────────────
1. build long activation URL
   (unchanged — email uses this as-is)
2. SMS branch only:
   generate 12-char base62 code
3. ShortLink.objects.create(...)   →
4. send SMS with short URL
                                        5. GET /s/<code>/   (public-schema model,
                                           resolves on any host)
                                           valid   → 302 target_url  ─┐
                                           expired → 410 page          │
                                           unknown → 404               │
                                                                       ▼
                                        6. GET /activate/?token=<uuid>
                                           (existing view, unchanged)
```

No new service, no new datastore, **no new domain or subdomain** (see §6).

---

## 3. Data model

New model in a **shared/public-schema app** (`apps/core/models.py`), so it resolves
regardless of which host the request arrived on:

| field | type | notes |
|---|---|---|
| `code` | `CharField(max_length=12)`, unique, indexed | 12-char base62 (`0-9a-zA-Z`), ~3.2 × 10²¹ space (~71 bits) |
| `target_url` | `URLField(max_length=500)` | the existing long tenant activation URL, unchanged |
| `invitation_token` | `UUIDField`, indexed | reference to `InvitationToken.token`, not a cross-schema FK |
| `expires_at` | `DateTimeField` | mirrors `InvitationToken.expires_at` |
| `is_active` | `BooleanField`, default `True` | flipped `False` on revoke |
| `created_at` | `DateTimeField(auto_now_add=True)` | |

**On code length**: 12 characters, not 7. A 7-char code is ~42 bits, which drops the
effective entropy protecting an activation token from a UUID's 122 bits to 42 — scannable
without a rate limiter, and this codebase has **no throttle infrastructure today**
(`config/settings/base.py` configures none). 12 characters costs 5 extra SMS characters,
keeps essentially all of the segment saving in §1.1, and makes the endpoint defensible
with no limiter, no new failure mode, and no rate-tuning argument.

**On `max_length=500`**: `URLField` defaults to 200. Current activation URLs are ~75 chars
so the default would not bite today, but the failure mode if it ever did is a hard
`DataError` on invitation creation. Set it explicitly.

No hit-count/analytics fields — out of scope, adds nothing to the core requirement.

---

## 4. Generation flow — SMS branches only

**Do not hook `_build_activation_url`.** That function
(`apps/users/invitation_service.py:223`) is channel-agnostic and its return value feeds
**both** SMS and email dispatch. Shortening there would silently replace every *emailed*
activation link with an opaque short URL — a deliverability and trust regression (short
links in transactional email are a standard spam-filter signal, and the recipient loses
the ability to see they are being sent to their own org's domain). Email has no
160-character constraint, so there is no upside. It also has no access to `expires_at` —
it receives only `token: uuid.UUID` and `schema_name: str`.

Instead, shorten inside the three **PHONE-only branches**, where the `InvitationToken`
object is already in scope:

| call site | branch | object in scope |
|---|---|---|
| `invitation_service.py:706` | `if invite_channel == InviteChannel.PHONE` | `inv` |
| `invitation_service.py:975` | `if channel == InviteChannel.PHONE` | `invitation` |
| `invitation_service.py:1137` | `if invitation.otp_type == OtpType.PHONE` | `invitation` |

Helper (`apps/core/shortlink.py`):

```python
def shorten_for_sms(*, target_url: str, token: uuid.UUID, expires_at) -> str:
    """Return a short URL for SMS, or target_url unchanged on any failure."""
    if not getattr(settings, "SHORTLINK_ENABLED", False):
        return target_url
    try:
        link = mint_short_link(
            target_url=target_url, invitation_token=token, expires_at=expires_at
        )
    except Exception:
        logger.exception(
            "Short link mint failed for token=%s; falling back to long URL", token
        )
        return target_url
    return f"{settings.SHORT_LINK_BASE_URL.rstrip('/')}/s/{link.code}"
```

Call site pattern:

```python
# invitation_service.py:706
if invite_channel == InvitationToken.InviteChannel.PHONE:
    sms_url = shorten_for_sms(
        target_url=invite_url, token=inv.token, expires_at=inv.expires_at
    )
    # pass sms_url (not invite_url) to _dispatch/_queue_staff_invitation_sms
```

Code generation:

```python
_ALPHABET = string.ascii_letters + string.digits

def generate_code(n: int = 12) -> str:
    return "".join(secrets.choice(_ALPHABET) for _ in range(n))
```

On unique-constraint collision, retry with a new random value, 2-3 attempts. At 12
characters this is effectively dead code, but keep it — it costs nothing and makes the
invariant explicit.

### 4.1 Why not hook `_dispatch_staff_invitation_sms`

It looks like a single choke point but is not: it is *also* the fallback inside
`_queue_staff_invitation_sms` when `is_sms_enabled()` is false
(`invitation_service.py:344-352`), while the true-async path goes straight to the Celery
task `apps.notifications.tasks.send_invitation_sms`. Minting there would either
double-mint on the sync path or miss the async path. The PHONE branch is hit exactly once
per dispatch on both.

### 4.2 Failure policy

A shortener problem must never block an invitation. `shorten_for_sms` swallows every
exception and returns the long URL — the SMS still sends, it just costs two segments.
Gated behind `SHORTLINK_ENABLED`, so the long URL is also the fallback when disabled.

---

## 5. Redirect flow

1. New route in `config/urls.py`'s top-level `urlpatterns`:
   `path("s/<str:code>/", resolve_short_link)`.

   **The `s/` prefix is required.** A bare top-level `path("<code>/", ...)` would collide
   with `apps/core/web_urls.py:23-36` (`login/`, `activate/`, `dashboard/`,
   `reset-password/`, …) — registered before them it swallows the entire SSR portal;
   registered after them it is a silent trap for every route added later.

2. View logic:
   - `ShortLink.objects.get(code=code)` → not found → **404** "link not found."
   - `is_active is False` or `expires_at < now()` → **410** + simple "invitation link
     expired, ask your administrator to resend" page.
   - Otherwise → `HttpResponseRedirect(target_url)` (302).

   Keeping 404 and 410 distinct gives the better UX. At 71 bits (§3) there is no
   enumeration oracle to protect against, so a uniform response buys nothing.

3. Browser follows the 302 to `https://acme.dfms.app/activate/?token=<uuid>` — the
   `activate/` view is **unchanged**.

Security boundary stays at `InvitationToken` (single-use, expiry, revocation) exactly as
today — the short link is a redirector, not an auth artifact.

---

## 6. Hosting — no new domain, no new subdomain

Earlier drafts specified a dedicated `s.dfms.app` short domain. **Dropped.** Count the
characters:

| host strategy | example | length | infra required |
|---|---|---|---|
| `s.dfms.app` subdomain | `https://s.dfms.app/s/<12-char>` | 33 | DNS + TLS SAN + `ALLOWED_HOSTS` + `tenants.Domain` row, **per environment** |
| existing tenant host | `https://acme.dfms.app/s/<12-char>` | 36 | **none** |

A four-step-per-environment infra workstream to save three characters is not worth it —
and it is the same DNS/TLS dependency that left `services/link-shortener/` parked on an
unmerged branch.

Serving from the tenant's own host works for free because of the mechanism in §12.3:
`ROOT_URLCONF = "config.urls"` is shared across all schemas, and `ShortLink` lives in
`public`, which django-tenants keeps in every schema's `search_path`. So `/s/<code>/`
resolves correctly on **any** host that already routes to Django.

**Implementation**: `SHORT_LINK_BASE_URL` defaults to the tenant's own primary host —
reuse the `tenant.domains.filter(is_primary=True)` lookup `_build_activation_url` already
performs (`invitation_service.py:226-233`). A dedicated short host stays available as an
optional env override if it is ever wanted later; that would be a one-line `.env` change
with zero code impact.

**Secondary benefit**: the short link now lives on the same origin as the activation page,
so the 302 is same-origin and the `CSRF_TRUSTED_ORIGINS` question disappears entirely.

---

## 7. Revocation & cleanup

- **One code per invitation for its whole lifetime.** `mint_short_link` reuses a live link
  rather than minting a second one on resend — simpler than minting per dispatch, makes
  revocation unambiguous, and lets support match a code to an invite one-to-one:

  ```python
  def mint_short_link(*, target_url, invitation_token, expires_at):
      existing = ShortLink.objects.filter(
          invitation_token=invitation_token,
          is_active=True,
          expires_at__gt=timezone.now(),
      ).first()
      if existing and existing.target_url == target_url:
          return existing
      ...  # generate + create
  ```

- When `invitation_service` marks a token `activated` or `cancelled`, also set
  `ShortLink.objects.filter(invitation_token=token).update(is_active=False)`.
  (Revoke-on-activate is belt-and-braces — `InvitationToken` is already single-use — but
  it is cheap and keeps the table honest.)
- Expired rows swept by existing Celery beat (reuse, no new sweeper process).

---

## 8. What this avoids vs. the standalone-service design

| | Standalone service (AUTH-01 A7/A10, `services/link-shortener/`) | This plan |
|---|---|---|
| New deployable | Yes (FastAPI app) | No |
| New datastore | Yes (own Postgres + Alembic) | No — one table in existing DB |
| Cross-service auth | Yes (RS256 JWT, key rotation) | No |
| Failure isolation needed | Yes (Redis circuit breaker) | No — same process as caller |
| New domain / DNS / TLS | Yes — the blocker today | **No — existing tenant host** |
| Affects email links | n/a | No — SMS branches only |
| Reusable by other products later | Yes, by design | Only via future extraction |

---

## 9. Rollout steps

1. PO sign-off on deviation from A7/A10 (§1.2), with the segment-cost case from §1.1.
2. Migration: add `ShortLink` to `apps.core`, `makemigrations core` +
   `migrate_schemas --shared`.
3. Implement `resolve_short_link` view + `s/<str:code>/` route.
4. Wire `shorten_for_sms` into the three PHONE branches (§4).
5. Wire revoke-on-activate/cancel.
6. *(No DNS/TLS/`Domain`-row step — see §6.)*
7. E2E: mint → SMS → tap → redirect → activate; expired code → 410; revoked code → 410;
   unknown code → 404; **email invite still carries the long URL**.
8. Flip `SHORTLINK_ENABLED=true` once verified.

---

## 10. Local testing (no real domain / DNS / TLS required)

Everything is testable locally today, reusing the dev conventions already in this repo.

### 10.1 Automated tests — no host setup needed

```python
response = self.client.get(f"/s/{code}/", HTTP_HOST="acme.dev.dfms.local")
```

Covers redirect-on-valid, 410-on-expired, 410-on-revoked, and 404-on-unknown-code as
ordinary unit/integration tests — no local domain, DNS, or TLS involved.

### 10.2 Manual/browser testing — existing `*.dev.dfms.local` setup, unchanged

Because the route is served from the tenant's own host (§6), **no `/etc/hosts` change and
no extra `tenants.Domain` row are needed**. `make setup-hosts` (`scripts/setup-hosts.sh`)
already maps `*.dev.dfms.local` → `127.0.0.1`, so
`http://<tenant>.dev.dfms.local:8000/s/<code>/` works out of the box — and unlike earlier
drafts, this local path is now *identical* to the production path.

`ALLOWED_HOSTS="*"` is already the dev default (`config/settings/development.py`).

### 10.3 Getting a short URL to test with, without sending real SMS

`SMS_ENABLED=false` is already the local default — invitation SMS bodies (including the
short URL) are **logged**, not sent. Mint an invitation, read the short URL from the log
output, paste it into the browser. No SMS provider or phone required for full local E2E
(mint → short URL in logs → tap → 302 → real `activate/` page).

Also mint an **email**-channel invitation in the same session and confirm the logged email
body still contains the full `/activate/?token=…` URL — that is the §4 regression guard.

### 10.4 TLS

Not needed locally — everything runs over plain `http://...:8000`, same as the rest of
local dev.

---

## 11. Deployment

Rides the **existing deploy pipeline** — no new service definition, no new container, and
(unlike earlier drafts) **no per-environment infra work at all**.

### 11.1 Nginx, DNS, hosts — no change needed

`deploy/nginx.conf` uses a single wildcard `server_name _;` block proxying everything to
`web:8000`, and the route is served from hosts that already resolve. No new DNS record, no
new TLS SAN, no `ALLOWED_HOSTS` change, no new `tenants.Domain` row.

### 11.2 Django config (per-environment `.env`, not committed)

- `SHORTLINK_ENABLED` — bool, default `False`.
- `SHORT_LINK_BASE_URL` — **optional**; leave unset to use the tenant's own primary host
  (§6). Only set it if a dedicated short host is introduced later, in which case that host
  additionally needs `ALLOWED_HOSTS` + a public-schema `tenants.Domain` row.

### 11.3 Migration

`ShortLink` lives in `apps.core` (shared), so it ships via the standard
`migrate_schemas --shared` step already wired into every deploy path
(`scripts/entrypoint.sh:50-57` on container start; `scripts/pipeline.sh:386-392`; CI's
`deploy-dev` job). No special-casing required.

### 11.4 Which pipeline runs it, per environment

- **Dev**: fully automated — `.github/workflows/ci.yml`'s `deploy-dev` job SSHes to EC2,
  runs `migrate_schemas --shared` then `migrate_schemas`, restarts containers.
- **QA / Staging / Production**: `deploy-qa`, `deploy-staging`, `deploy-production` CI
  jobs are currently unimplemented stubs (`echo "TODO: configure secrets"`) — a
  pre-existing gap, not introduced by this feature. Until wired, these environments
  deploy via `scripts/pipeline.sh` (build → push to ECR → SSH deploy →
  `migrate_schemas --shared` → `migrate_schemas --tenant` → health-check `/health/` →
  restart web/celery).

### 11.5 Deployment checklist for this feature

1. Ship code + migration through whichever deploy path is available for that environment
   today (CI for dev, `scripts/pipeline.sh` for QA/staging/prod).
2. `.env`: set `SHORTLINK_ENABLED=true` once verified.
3. Verify `/s/<code>/` resolves and 302s correctly on a real tenant host, and `/health/`
   still passes.

*(Steps for DNS, TLS, `ALLOWED_HOSTS` and `Domain` rows present in v1.0 are removed — see
§6.)*

---

## 12. Code-level implementation steps

Confirmed against current `dev`: no `ShortLink`/shortlink code exists anywhere in the
repo today (`grep -ri "shortlink\|short_link\|shorturl"` across `*.py` — zero matches).
`apps.core` is **in `SHARED_APPS` only and not in `TENANT_APPS`**
(`config/settings/base.py:46-64` vs `67-85`), so `ShortLink` gets exactly one table, in
`public` — no shadow copy per tenant. There is **no `PUBLIC_SCHEMA_URLCONF`**; all schemas
share `config/urls.py` (`ROOT_URLCONF = "config.urls"`, `base.py:113`), so the redirect
route is added directly to the top-level `urlpatterns`, not nested under
`api_v1_urlpatterns`.

### 12.1 Files to add

| file | purpose |
|---|---|
| `apps/core/models.py` | add `ShortLink` model (§3) — append to existing file |
| `apps/core/migrations/00XX_shortlink.py` | generated via `makemigrations` |
| `apps/core/shortlink.py` *(new)* | `generate_code()` (12-char base62, collision-retry), `mint_short_link(...)` (reuse-if-live, §7), `shorten_for_sms(...)` (flag + failure fallback, §4), `revoke_short_links(invitation_token)` |
| `apps/core/shortlink_views.py` *(new)* | `resolve_short_link(request, code)` — lookup, 302 / 410 / 404 |
| `templates/core/short_link_expired.html` *(new)* | minimal "link expired" page for the 410 case |

### 12.2 Files to modify

| file | change |
|---|---|
| `config/urls.py` | add `path("s/<str:code>/", resolve_short_link)` to the main `urlpatterns` list (near the existing `path("", include("apps.core.web_urls"))` line), importing from `apps.core.shortlink_views` |
| `apps/users/invitation_service.py` | **line 706 PHONE branch** (`_create_token_and_dispatch`): `sms_url = shorten_for_sms(target_url=invite_url, token=inv.token, expires_at=inv.expires_at)`; pass `sms_url` to `_dispatch_staff_invitation_sms` / `_queue_staff_invitation_sms` |
| `apps/users/invitation_service.py` | **line 975 PHONE branch** (`resend_invitation`): same, using `invitation.token` / `invitation.expires_at` |
| `apps/users/invitation_service.py` | **line 1137 PHONE branch** (OTP dispatch): same, passing the short URL as `activation_url` to `send_activation_otp_sms` |
| `apps/users/invitation_service.py` | `_build_activation_url` (lines 223-237): **unchanged** — email must keep the long URL (§4) |
| `apps/users/invitation_service.py` | `cancel_invitation` (line 1050-1054): after `invitation.save(...)`, call `revoke_short_links(invitation.token)` |
| `apps/users/invitation_service.py` | wherever `invitation_status = InvitationToken.InvitationStatus.ACTIVATED` is set (line 1367, inside `activate_invitation`): call `revoke_short_links(invitation.token)` alongside |
| `config/settings/base.py` | add `SHORTLINK_ENABLED` (env-driven bool, default `False`) and optional `SHORT_LINK_BASE_URL` (unset → tenant's own host, §6; mirrors how `FRONTEND_URL`/`TENANT_DOMAIN_BASE` are read at `base.py:444-467`) |
| `.env.example` | document the two new settings alongside existing `TENANT_DOMAIN_BASE`/`ALLOWED_HOSTS` entries (`.env.example:49-82`) |

### 12.3 Why no changes needed elsewhere

- `apps/notifications/sms.py::send_staff_invitation_sms`,
  `send_activation_otp_sms`, and `apps/notifications/tasks.py::send_invitation_sms` take
  `activation_url` as a plain string — the call sites now hand them the short URL, so the
  notification layer is untouched.
- No `PUBLIC_SCHEMA_URLCONF` split exists, and `apps.core` models live only in the public
  Postgres schema — because django-tenants keeps `public` in every schema's `search_path`,
  `ShortLink` lookups (and inserts) succeed regardless of which tenant's domain the
  request arrived on, so the view needs no schema-switching logic. And because the route
  is served from hosts that already have `tenants.Domain` rows, `TenantMainMiddleware`
  resolves them as it does today — no new host registration (§6).
- Minting happens on the tenant connection inside the invitation's transaction, so a
  rolled-back invitation rolls back its short link too.

### 12.4 Implementation order

1. `apps/core/models.py` — add `ShortLink`; `python manage.py makemigrations core`.
2. `apps/core/shortlink.py` — `generate_code`, `mint_short_link`, `shorten_for_sms`,
   `revoke_short_links`.
3. `apps/core/shortlink_views.py` + `templates/core/short_link_expired.html`.
4. `config/urls.py` — wire the `s/<str:code>/` route.
5. `config/settings/base.py` + `.env.example` — add `SHORTLINK_ENABLED`,
   `SHORT_LINK_BASE_URL`.
6. `apps/users/invitation_service.py` — wire `shorten_for_sms` into the three PHONE
   branches; wire `revoke_short_links` into `cancel_invitation` and `activate_invitation`.
7. Local `migrate_schemas --shared`; manual test per §10 (**including the email-stays-long
   check in §10.3**).
8. Deploy per §11.

---

**Last Updated**: 2026-08-04
