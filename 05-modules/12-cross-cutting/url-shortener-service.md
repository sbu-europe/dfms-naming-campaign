---
source_document: AUTH-01-phone-login-2fa-sms-invitation.md
source_sections: AC-3 Tenant-aware URL shortener, BR-AUTH-PHONE-003/004
extracted_date: 2026-07-27
last_updated: 2026-07-27
document_type: implementation_plan
related_modules: [01-foundation, 03-users, 12-cross-cutting]
related_stories: [AUTH-01, AUTH-01-3, AUTH-01-4, US-005, CP-03]
status: Planned — Sprint 7
---

# URL Shortener Service (`link-shortener`)

## Overview

A **general-purpose URL shortener** deployed as a standalone service alongside the DFMS
Django backend. It exposes an authenticated API that accepts a long HTTPS URL and returns
a short URL, and a public endpoint that redirects a short code to its bound target.

Introduced for **SMS invitation links** (AUTH-01), where message length limits make the
long activation URL (~65 characters) impractical. Built as a genuine platform utility, not
an invitation-specific mechanism.

**Why a separate service rather than a Django app:** the redirect endpoint is the only
internet-facing path in the platform that serves unauthenticated traffic on a public
domain. Isolating it keeps its blast radius outside tenant business data, and lets it
scale and fail independently of the monolith. Follows the existing sidecar precedent set
by `services/gt06-ingest/`.

### Short-link value

| | Length | Example |
|---|---|---|
| Long activation URL | ~65 chars | `https://nourish.dfms.com/activate/?token=<uuid>` |
| Short URL | ~26 chars | `https://dfms.link/aB7xK2pQ` |

Keeps the invitation SMS inside a single 160-character segment.

---

## The service is not tenant-aware — and does not need to be

AUTH-01 AC-3 specifies a "tenant-aware URL shortener". This implementation satisfies that
requirement **structurally rather than through a tenant-scoped data model**, which is
simpler and carries the same security posture. See
[Deviation from AC-3](#deviation-from-ac-3) for the reasoning and the accepted tradeoff.

In short: a code maps to exactly one stored target URL, and that URL already contains the
tenant (`https://nourish.dfms.com/...`). There is no query in this service where a tenant
filter would change the answer, so cross-tenant resolution is impossible by construction.
The actual security boundary is the invitation token, which Django validates inside the
owning tenant's schema.

What the service stores instead is an opaque **`namespace`** string supplied by the caller
and never interpreted by the service. DFMS passes `namespace = schema_name`. This provides
scoped reads, bulk revoke, and audit attribution without the shortener knowing anything
about DFMS multi-tenancy.

---

## Architectural Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Standalone FastAPI service** at `services/link-shortener/` | Matches `gt06-ingest` sidecar pattern; one language across the org. Go would be faster and produce a smaller image, but this workload is thousands of redirects/day — a second language is a permanent maintenance tax for no practical gain |
| D2 | **PostgreSQL (dedicated RDS instance)** | Links are durable business records needing unique constraints, transactions and revocation. Dedicated instance keeps a shortener incident off the DFMS database |
| D3 | **Redis** for resolve cache, rate limiting, JWT nonce, resolve counters | Redirect path must be O(1) and must never write to Postgres per request |
| D4 | **Management API private (VPC / compose network) only** | Only `GET /{code}` is public. Every consumer must live inside the VPC — a mobile client cannot call this service directly and must proxy through its own backend |
| D5 | **Opaque `namespace`, not a tenant model** | Gives scoped reads, bulk revoke and audit attribution without a tenant table, tenant sync, or per-tenant allowlist. Removes an entire distributed-sync mechanism and its most likely production failure mode (a newly provisioned tenant whose sync has not landed) |
| D6 | **Host allowlist is per API client**, not per tenant | The security boundary is the consumer — tenants never call this API directly. Per-client patterns put the check where the trust actually varies |
| D7 | **Multi-consumer platform service** with RS256 service JWTs | DFMS Django is the first consumer; others follow. Asymmetric keys mean the service stores only public keys — full DB compromise yields no ability to mint links |
| D8 | **Random base62 codes**, never sequential | Sequential/counter-based codes make every invitation link in the platform enumerable |
| D9 | **Queue + retry** on shortener unavailability | Invitation SMS is minted inside the Celery task; failure surfaces to the admin. No SMS ever goes out with a broken or oversized link |

---

## Topology

```
                    ┌─────────────────────────────────────────┐
   invitee's phone  │  ALB / nginx host-based routing         │
        │           │  dfms.link      → link-shortener:8000   │
        └──────────▶│  *.dfms.com     → django web:8000       │
                    └──────────┬──────────────────┬───────────┘
                               │                  │
                  ┌────────────▼──────┐    ┌──────▼──────────┐
                  │ link-shortener    │    │ DFMS Django     │
                  │ FastAPI (private  │◀───│ mint / revoke   │
                  │ mgmt API)         │───▶│ audit webhook   │
                  └──┬─────────────┬──┘    └─────────────────┘
                     │             │
              ┌──────▼─────┐  ┌────▼─────┐
              │ RDS        │  │ Redis    │
              │ Postgres   │  │          │
              └────────────┘  └──────────┘
```

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Runtime | Python 3.12, FastAPI, uvicorn |
| Persistence | PostgreSQL 16 (dedicated RDS), SQLAlchemy 2.0 async + asyncpg |
| Migrations | Alembic — run as a one-shot deploy task, **never on API boot** (replicas race) |
| Cache / limits | Redis 7 |
| Auth | RS256 JWT verification (`pyjwt`) |
| Schemas | Pydantic v2 |

---

## Data Model

```sql
api_client (
  client_id            varchar(64) PRIMARY KEY,   -- "dfms-django", "vendor-app"
  public_keys          jsonb  NOT NULL,           -- [{kid, alg, pem, active}]
  scopes               text[] NOT NULL,           -- links:write, links:read, links:revoke
  allowed_host_patterns text[] NOT NULL,          -- exact hosts this client may target
  allowed_link_types   text[] NOT NULL,           -- restricts who may mint invitation links
  active               boolean NOT NULL DEFAULT true
);

short_link (
  id             uuid PRIMARY KEY,
  code           varchar(16) NOT NULL UNIQUE,
  client_id      varchar(64) NOT NULL REFERENCES api_client,
  namespace      varchar(128) NOT NULL,      -- opaque; DFMS passes schema_name
  target_url     text        NOT NULL,
  link_type      varchar(40) NOT NULL DEFAULT 'generic',
  external_ref   varchar(160),               -- e.g. "invitation:<uuid>"
  created_by     varchar(128),
  expires_at     timestamptz NOT NULL,
  revoked_at     timestamptz,
  revoked_reason varchar(64),
  resolve_count  integer NOT NULL DEFAULT 0,
  first_resolved_at timestamptz,
  last_resolved_at  timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ON short_link (client_id, namespace, external_ref) WHERE revoked_at IS NULL;
CREATE INDEX ON short_link (client_id, namespace);
CREATE INDEX ON short_link (expires_at) WHERE revoked_at IS NULL;

resolve_event (id, code, client_id, namespace, occurred_at, ip_hash, ua_hash, outcome)
  -- monthly partitions, retention-purged by the sweeper
```

No `tenant` or `tenant_allowed_host` table. `namespace` is an opaque grouping key: the
service enforces that reads and bulk operations stay within `(client_id, namespace)`, and
never attaches meaning to its contents.

---

## API

```
POST   /api/v1/links                    mint             (auth: links:write)
GET    /api/v1/links/{code}             metadata         (auth, scoped)
GET    /api/v1/links?namespace=&ref=    list             (auth: links:read, scoped)
POST   /api/v1/links/{code}/revoke      revoke           (auth: links:revoke)
POST   /api/v1/links/revoke-by-ref      bulk revoke      (auth: links:revoke)
GET    /{code}                          302 redirect     (public, rate-limited)
GET    /healthz  /readyz  /metrics      ops
```

### Mint

```http
POST /api/v1/links
Authorization: Bearer <RS256 JWT>
Idempotency-Key: invitation:9f2c1a...:resend:2

{
  "url":          "https://nourish.dfms.com/activate/?token=9f2c1a...",
  "namespace":    "nourish",
  "link_type":    "invitation_activation",
  "external_ref": "invitation:9f2c1a...",
  "expires_at":   "2026-08-03T10:00:00Z",
  "created_by":   "user:4d81..."
}
```
```http
201 Created
{
  "code":       "aB7xK2pQ",
  "short_url":  "https://dfms.link/aB7xK2pQ",
  "expires_at": "2026-08-03T10:00:00Z",
  "created_at": "2026-07-27T10:00:00Z"
}
```

`Idempotency-Key` is required in practice: invitation sends run through Celery with
retries, and without it a retried task mints a second live link for the same invitation.
Cached in Redis for 24h returning the identical response, backed by the partial unique
index on `(client_id, namespace, external_ref)`.

### Service JWT

```jsonc
// header includes "kid" for overlapping key rotation
{
  "iss":   "dfms-django",
  "aud":   "link-shortener",
  "exp":   1753600120,          // now + 120s
  "jti":   "b1f4...",           // nonce, cached in Redis until exp (replay protection)
  "scope": ["links:write", "links:revoke"]
}
```

The JWT establishes **consumer** identity. `namespace` is a request field, not a claim —
the service treats it as data belonging to that consumer, not as a security assertion.

---

## Security Model

Every guarantee below is a property of the shortener itself, independent of tenancy:

| Property | Mechanism |
|----------|-----------|
| Codes unguessable | CSPRNG base58, 8 chars (~46.9 bits), never sequential — see [Short Code Generation](#short-code-generation) |
| One code → one target | `code` globally unique, target stored at mint and never mutated |
| No open redirect | Target host validated against the client's `allowed_host_patterns` at mint **and** again at resolve |
| Bounded lifetime | `expires_at` required at mint and mirrored from the invitation — see [Link Lifecycle & Expiry Control](#link-lifecycle--expiry-control) |
| Revocable | `revoked_at` + immediate Redis `DEL`; bulk revoke by `external_ref` |
| Scoped access | Reads and bulk operations constrained to `(client_id, namespace)`; a mismatch returns **404, not 403** — no existence oracle |
| Enumeration resistant | Per-IP token bucket on the public endpoint; unknown codes return generic 404 |

### Open-redirect defense

Generic targets are accepted, so the host allowlist is the only barrier — it must be exact:

```python
u = urlparse(target_url)
if u.scheme != "https":            reject   # no http, javascript:, data:
if u.username or u.password:       reject   # https://evil.com@nourish.dfms.com
if u.hostname.lower() not in client.allowed_host_patterns: reject
```

Match on `hostname` (never `netloc`, which carries port and credentials), and compare
against a **set** — `endswith(".dfms.com")` is defeated by `dfms.com.evil.io`.

### Deviation from AC-3

AC-3 asks for a tenant-scoped data model with per-tenant allowlists and cross-tenant
isolation checks. This design drops that in favour of an opaque namespace. **Requires PO
acknowledgement** — recorded here rather than changed silently.

**Why the isolation requirement still holds.** A short code resolves to exactly one stored
URL, and that URL carries the tenant host. No tenant filter exists that could change a
resolution outcome, so "a code created for tenant A never resolves to tenant B" is
guaranteed by the data shape. Even a link deliberately pointed at another tenant's host is
inert: activation requires a valid invitation token, which Django validates in that
tenant's own schema, and which the shortener can neither read nor forge.

**What is genuinely given up.** A consumer could mint a link under namespace A that targets
a host belonging to tenant B. Impact is negligible — the target remains allowlist-bound to
DFMS hosts, and the token check is the real boundary. If a genuinely untrusted consumer is
ever onboarded, add a per-client `allowed_namespaces` list and derive the expected host
from the namespace. That is an additive change, not a rewrite.

**What this removes:** the `tenant` and `tenant_allowed_host` tables, the tenant sync
endpoint, the nightly reconcile job, the DFMS provisioning hook, the per-tenant allowlist
cache in the hot path, and the RLS policies — roughly a third of the service, including its
most likely production failure mode (a newly provisioned tenant whose sync had not yet
landed would have had its invitations rejected).

---

## Link Lifecycle & Expiry Control

### The shortener never owns expiry policy

For `invitation_activation` links, `short_link.expires_at` is set to **exactly**
`invitation.expires_at` — not `min()` with an independent shortener TTL.

DFMS sets that from `US005_INVITATION_EXPIRY_DAYS = 7`
(`apps/users/invitation_service.py:474`). Both mismatch directions are user-visible bugs:

- Link **longer** than invitation → link resolves fine, then the activation page rejects
  the token. The user sees two different errors for one cause.
- Link **shorter** than invitation → link dies while the invitation is still valid. The
  admin sees `Pending`, the user sees "expired", and resend is on a 2-minute cooldown.

`SHORTLINK_DEFAULT_TTL_DAYS` therefore applies **only** to generic links where the caller
supplies no explicit `expires_at`. Invitation links always mirror their invitation.

> **Note — `INVITATION_EXPIRY_HOURS = 72` in `config/settings/base.py:477` is dead config.**
> Nothing reads it; the live value is the 7-day constant. It should be removed or aligned
> to avoid someone "fixing" the shortener against the wrong number.

### Authority layers

| Layer | Value | Role |
|-------|-------|------|
| `InvitationToken.expires_at` | `created_at + 7 days` | **Authoritative** — DFMS owns it |
| `short_link.expires_at` | copied verbatim at mint | Mirrors; checked on every resolve |
| Redis cache TTL | `min(remaining_lifetime, 300s)` | Derived — cache can never outlive the link |
| Retention | `expires_at + SHORTLINK_RETENTION_DAYS` (30) | Soft-purge by the sweeper |

### Timeline (7-day invitation)

```
T+0      invite sent        link A  active   expires T+7d
T+2d     resend             link A  revoked (superseded)
                            link B  active   expires T+7d   ← same instant, NOT T+9d
T+7d     window closes      link B  → 410 "link expired"
T+37d    retention ends     link B  soft-purged: code kept, target_url nulled
```

> **Finding — resend does not extend the window.** `resend_invitation()`
> (`apps/users/invitation_service.py:664`) resets the OTP and the cooldown but never
> reassigns `expires_at`, and it refuses to run once `is_valid()` is false. So a resend on
> day 6 produces a link with **1 day** of life, not 7. AUTH-01 AC-2 states resend gives a
> "new window" — that is not current behaviour.
>
> **Recommendation:** the shortener mirrors whatever the invitation says, in both cases. If
> the PO wants a genuine fresh window, that is a one-line change to `resend_invitation()`
> and the shortener needs **no** change — because it never owns the policy. Flag the
> mismatch, don't paper over it in the shortener.

### Early termination (before expiry)

`revoked_at` is checked **before** `expires_at`, so the specific message always wins over
the generic one. `revoked_reason` drives the copy:

| `revoked_reason` | Trigger | User sees (410) |
|------------------|---------|-----------------|
| `superseded` | Invitation resent | "A newer invitation link was sent — please use the latest SMS" |
| `activated` | Activation completed | "This account is already activated — sign in" |
| `cancelled` | Admin cancelled the invitation | "This invitation is no longer valid — contact your administrator" |
| `expired` | Sweeper, or expiry reached at resolve | "This link has expired — ask your administrator to resend" |

`superseded` is worth the extra state: without it, a user who taps the older of two SMS
messages gets a dead-end instead of being pointed at the newer one.

### Five enforcement points

1. **Mint** — `expires_at` required, must be in the future, must be ≤ `now + SHORTLINK_MAX_TTL_DAYS`.
2. **Resolve** — `now() >= expires_at` evaluated server-side in UTC. Client clocks are never trusted.
3. **Cache** — Redis TTL bounded by remaining lifetime, so an expired link cannot be served from cache.
4. **Sweeper** — marks lapsed links, then soft-purges past retention.
5. **Django** — the activation view re-validates the invitation token in the tenant schema.

Point 5 is the architectural one: **the shortener's expiry is a UX optimisation, not the
security boundary.** If every check above failed, an expired invitation would still be
rejected at activation. The shortener is never the only thing enforcing the 7-day window.

---

## Short Code Generation

### Alphabet and length

**base58, 8 characters** — `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`
(base62 minus `0`, `O`, `I`, `l`).

Base62 would give marginally more keyspace, but SMS links get screenshotted, forwarded, and
read aloud to support staff. `0/O` and `I/l/1` ambiguity costs real support time; the
keyspace difference costs nothing at this volume.

| Length | Keyspace | Entropy | Collision chance per insert at 1M live links |
|--------|----------|---------|---------------------------------------------|
| 8 | 58⁸ = 1.28 × 10¹⁴ | ~46.9 bits | ~7.8 × 10⁻⁹ |
| 10 | 58¹⁰ = 4.31 × 10¹⁷ | ~58.6 bits | ~2.3 × 10⁻¹² |

### Generation rules

- **CSPRNG only** — `secrets.choice` per character. Never a counter, never a hash of the
  token or target. A derived code lets anyone who knows the target compute the code, and
  worse, lets anyone who sees a code infer the target.
- **Never sequential.** Counter-based base62 (the classic shortener design) would make every
  invitation link in the platform enumerable from any one observed code.
- **Global uniqueness**, single unique index on `code`. Not scoped per namespace — resolution
  receives only the code, with no namespace anywhere in the URL.
- **Collision handling:** INSERT and let the unique constraint arbitrate; retry ×3 on
  violation, then widen to 10 characters. At the probabilities above this is a correctness
  backstop that will effectively never fire — but it costs one `try` block.
- **Codes are never reused.** Soft-purge retains the row (code + timestamps) and nulls
  `target_url`, so a code can never be re-issued. Otherwise an old SMS could one day resolve
  to an unrelated new link. Volume makes this free: invitation links are thousands per year.

### One mint = one independent code

Codes are not derived from, and carry no relationship to, the invitation. Resending three
times produces three unrelated codes, all joined by `external_ref = "invitation:<uuid>"`,
with **at most one active** — enforced by the partial unique index on
`(client_id, namespace, external_ref) WHERE revoked_at IS NULL`.

```
invitation:9f2c1a...
  ├─ aB7xK2pQ   revoked (superseded)   T+0  → T+2d
  ├─ 7mQx4Kdz   revoked (superseded)   T+2d → T+4d
  └─ Rj9pW2nT   active                 T+4d → T+7d
```

---

## Resolve Path — External Device to Target

The requesting device is the invitee's phone: unauthenticated, no DFMS session, no prior
relationship with either service. Everything it needs is in the URL.

```
┌──────────┐  ① SMS: https://dfms.link/aB7xK2pQ
│  phone   │
└────┬─────┘  ② user taps → browser GET, Host: dfms.link, TLS 1.3
     │
     ▼  ③ DNS: dfms.link → ALB;  listener rule on Host → link-shortener:8000
┌──────────────────┐
│  link-shortener  │  ④ validate → look up → check → 302
└────┬─────────────┘
     │  ⑤ Location: https://nourish.dfms.com/activate/?token=9f2c1a...
     ▼
┌──────────────────┐  ⑥ TenantMainMiddleware resolves tenant from Host
│  DFMS Django     │     → search_path = nourish → /activate/ validates token
└──────────────────┘
```

### Step ④ in detail

```
1. rate limit          per-IP token bucket (Redis)
2. shape check         length + base58 charset — rejects /favicon.ico, /robots.txt,
                       and scanner noise before touching any datastore
3. lookup              Redis GET link:aB7xK2pQ
                         miss → Postgres SELECT → cache min(remaining, 300s)
4. state check         revoked_at set?  → 410 with revoked_reason copy
                       now >= expires_at? → 410 expired
5. target check        host ∈ client allowed_host_patterns  (re-checked, not trusted from mint)
6. accounting          Redis INCR counter; enqueue resolve_event  (both non-blocking)
7. respond             302
```

### The response

```http
HTTP/1.1 302 Found
Location: https://nourish.dfms.com/activate/?token=9f2c1a...
Cache-Control: no-store, no-cache, must-revalidate, private
Pragma: no-cache
Referrer-Policy: no-referrer
X-Robots-Tag: noindex, nofollow
Content-Length: 0
```

| Header | Why |
|--------|-----|
| `302`, never `301`/`308` | A permanent redirect is cached by browsers and proxies indefinitely. Revocation and expiry would stop working on any device that had already followed the link once — silently, and only for that user |
| `Cache-Control: no-store` | Keeps the token out of disk cache on a shared or lost phone |
| `Referrer-Policy: no-referrer` | The token sits in the query string; without this it leaks in `Referer` to anything the activation page subsequently loads |
| `X-Robots-Tag: noindex` | Prevents indexing if a short link ever leaks into a crawled page |
| HSTS on the short domain | The first hop carries the code; it must never be downgradable to HTTP |

**The target URL is stored and emitted byte-for-byte.** It is never parsed and rebuilt —
re-encoding a query string is an excellent way to corrupt a token and produce an
"invalid invitation" that reproduces on no developer's machine.

### Prefetch, HEAD, and non-consumption

Carriers, enterprise mail/SMS scanners, and iOS Messages link previews **fetch the URL
before the human does**. This is the single most common way SMS invitation features fail
in production.

- Resolving is **idempotent forever**. `resolve_count` is analytics, never a limit.
- `HEAD` is served with identical headers and no body, recorded as `outcome=head` so
  analytics can exclude it.
- Prefetchers are **never blocked**. Bot heuristics on this path would eventually reject a
  real invitee, and the failure mode ("the link doesn't work on my phone") is
  near-impossible to diagnose.

### Error responses

| Condition | Status | Page |
|-----------|--------|------|
| Unknown / malformed code | `404` | Generic "link not found" |
| Expired | `410` | "This link has expired — ask your administrator to resend" |
| Revoked | `410` | Copy driven by `revoked_reason` (see lifecycle table above) |
| Rate limited | `429` | Plain retry-after |

**Error pages are tenant-neutral and DFMS-branded.** An expired-link page that named the
organisation would turn any guessed or leaked code into a tenant-disclosure oracle — the
one genuine information leak available on this endpoint. Naming the tenant is only safe
*after* the redirect, on the tenant's own domain.

Expired links deliberately return `410`, not `404`: keeping the row through the retention
window means a late tap gets "this expired" instead of an alarming "not found".

### Budget

Redis hit ≈ 1 ms; Postgres fallback ≈ 5 ms. Target < 20 ms p99 at the edge. The redirect is
one cache read plus two non-blocking writes — nothing on this path fans out.

---

## DFMS Integration

| Concern | Detail |
|---------|--------|
| Client | `apps/core/shortlink_client.py` — signs the service JWT, passes `namespace=connection.schema_name`, retries with backoff, circuit breaker so a sustained outage fails fast instead of tying up workers |
| Mint | `apps/users/invitation_service.py` — after `_build_activation_url()` (lines 502 create, 693 resend), branch on channel: phone → mint short link → SMS. Runs **inside** the Celery task, not the request path |
| Revoke | Hooks on invitation activate / cancel / resend. Resend revokes the previous link and mints a new one (AC-2 "new or rotated") |
| Expiry | `expires_at = min(invitation.expires_at, SHORTLINK_DEFAULT_TTL)` — a short link must never outlive its invitation |
| Audit | Shortener batches `resolve_event` rows and POSTs them HMAC-signed to a DFMS internal endpoint, which writes them into the schema named by `namespace` via `schema_context`. Dead-letter table with backoff, plus `GET /api/v1/events?since=` for reconciliation — an audit gap is always recoverable |
| Failure | Celery retries 3× with backoff; on final failure the invitation stays `Sent` with a `delivery_failed` flag visible in the Users list (AC-5 "no silent success") |
| Email path | Unchanged — email invitations keep the long activation URL (AC-3, AC-6 non-regression) |

No tenant provisioning hook is required: a namespace needs no registration, so a tenant
created a second ago can mint links immediately.

---

## Deployment

```
services/link-shortener/
  linkshort/
    api/          routes, JWT dependency, rate limiting
    domain/       code generation, allowlist validation, link lifecycle
    storage/      SQLAlchemy models, repositories, Redis client
    workers/      sweeper: expiry, counter flush, webhook retry, partition purge
    config.py  main.py
  alembic/versions/
  tests/
  Dockerfile  docker-compose.yml  requirements.txt  pyproject.toml
  .env.example  README.md
```

- Own `docker-compose.yml` (api + postgres + redis + sweeper), mirroring `gt06-ingest`.
  Local dev and CI use containerised Postgres; `DATABASE_URL` is the only environment
  difference.
- Production slots into `deploy/compose/` with an nginx/ALB host rule for the short domain.
- RDS security group accepts traffic only from the shortener's SG. Automated backups +
  PITR. Multi-AZ optional — Redis absorbs reads, and an outage blocks minting, not resolving.
- Size `pool_size × replicas + sweeper` well under `max_connections`, or front with
  PgBouncer in transaction mode.
- API is stateless — scale horizontally; Redis holds all shared state.

### Configuration

| Variable | Purpose |
|----------|---------|
| `SHORTLINK_BASE_URL` | Public short base, e.g. `https://dfms.link` |
| `DATABASE_URL` / `REDIS_URL` | Backing services |
| `SHORTLINK_DEFAULT_TTL_DAYS` | Fallback lifetime for **generic** links only (7). Invitation links always mirror `invitation.expires_at` |
| `SHORTLINK_MAX_TTL_DAYS` | Hard ceiling rejected at mint (30) |
| `SHORTLINK_RETENTION_DAYS` | Days past expiry before soft-purge (30) — until then, expired links serve `410` rather than `404` |
| `SHORTLINK_CODE_LENGTH` | Default 8; widened to 10 only on repeated collision |
| `SHORTLINK_CODE_ALPHABET` | base58 (base62 minus `0`, `O`, `I`, `l`) |
| `JWT_AUDIENCE` / `JWT_MAX_SKEW_SECONDS` | Token verification |
| `RESOLVE_RATE_LIMIT` | Per-IP token bucket on the public endpoint |

Consumer-side (DFMS): `SHORTLINK_API_URL`, `SHORTLINK_CLIENT_ID`,
`SHORTLINK_PRIVATE_KEY` (secret store, never committed), `SHORTLINK_ENABLED`.

---

## Build Order

Steps 1–5 are independent of all phone/SMS work in AUTH-01 and can start immediately.

| # | Step | Deliverable |
|---|------|-------------|
| 1 | Service scaffold | FastAPI app, config, Dockerfile, compose, `/healthz` `/readyz` |
| 2 | Data layer | Models, Alembic migrations |
| 3 | Auth | JWT verification middleware, `api_client` registry, scope + host + link-type enforcement, nonce replay cache |
| 4 | Core API | Mint, resolve, revoke, revoke-by-ref, list, idempotency, Redis cache, rate limiting, allowlist validator |
| 5 | Security verification | Open-redirect and namespace-scoping coverage; confirm a code resolves to exactly one target regardless of caller |
| 6 | DFMS client | `shortlink_client.py` with retry + circuit breaker |
| 7 | Audit + sweeper | Webhook receiver in DFMS; sweeper worker for expiry, counter flush, retries, purging |
| 8 | Wire-up | Invitation create/resend mint short URL; revoke hooks on activate/cancel/resend |

---

## Open Items

| # | Item | Owner |
|---|------|-------|
| 1 | **PO acknowledgement of the AC-3 deviation** (namespace instead of tenant model) | PO / Architecture |
| 2 | **Resend window mismatch** — `resend_invitation()` does not extend `expires_at`, but AC-2 specifies a "new window". Confirm intended behaviour; the shortener mirrors either without change | PO / Backend |
| 3 | **Dead config** — `INVITATION_EXPIRY_HOURS = 72` (`config/settings/base.py:477`) is unread; live value is `US005_INVITATION_EXPIRY_DAYS = 7`. Remove or align before it misleads someone | Backend |
| 4 | Short domain hostname and DNS ownership (AUTH-01 Open Question 4) | PO / DevOps |
| 5 | TLS certificate for the short domain (separate cert or SAN) | DevOps |
| 6 | Second consumer's scopes, host patterns and `allowed_link_types` once identified | Architecture |
| 7 | `resolve_event` retention period, and whether the expired-link page offers self-service "request a new invitation" | PO / Compliance |

---

## Related Documents

- [AUTH-01 — Phone Login, Phone 2FA & SMS Invitation](../../03-backlog/sprints/sprint-7/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md)
- [user-tenant-management.md](../01-foundation/user-tenant-management.md) — invitation lifecycle, multi-tenancy
- [authentication-security.md](../01-foundation/authentication-security.md) — OTP, MFA
- [security-compliance.md](security-compliance.md) — tenant isolation standards
- [integration-requirements.md](integration-requirements.md) — SMS gateway integration

---

**Last Updated**: 2026-07-27
**Status**: Planned — Sprint 7 (AUTH-01-3, AUTH-01-4)
