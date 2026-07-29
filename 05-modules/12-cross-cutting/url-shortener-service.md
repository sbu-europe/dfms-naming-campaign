---
source_document: AUTH-01-phone-login-2fa-sms-invitation.md
source_sections: AC-3 Tenant-aware URL shortener, BR-AUTH-PHONE-003/004
extracted_date: 2026-07-27
last_updated: 2026-07-29
document_type: implementation_plan
related_modules: [01-foundation, 03-users, 12-cross-cutting]
related_stories: [AUTH-01, AUTH-01-3, AUTH-01-4, US-005, CP-03]
status: Service built + DFMS integration wired — audit webhook receiver and infrastructure outstanding (Sprint 7)
implementation_path: services/link-shortener/
---

# URL Shortener Service (`link-shortener`)

## Implementation Status

**The service is built and verified, and the DFMS side is now wired (2026-07-29).**

Steps 0, 6 and 8 were implemented on 2026-07-29, after PR #87
(`sprint-7/user-invitation-through-phone`) landed the phone invitation channel and
resolved Open Item 8. Verified end-to-end from the Django container against the running
sidecar: mint → idempotent replay → resend rotation (supersede) → stale-replay abort →
public 302 with byte-for-byte target → revoke-by-ref → 410.

- **Step 0**: `InvitationToken.resend_count` + `delivery_failed` (migration
  `users.0022`), `delivery_failed` exposed in `InvitationListSerializer`. The phone
  channel, invitee phone field and SMS dispatch already existed from PR #87.
- **Step 6**: `apps/core/shortlink_client.py` — per-attempt RS256 JWT, typed
  retryable/non-retryable exceptions, Redis-backed circuit breaker (shared Django cache),
  `SHORTLINK_*` settings in `config/settings/base.py`. `requests` and `cryptography`
  added to `requirements/base.txt` (**web image needs a rebuild**).
- **Step 8**: mint happens **inside** `users.send_invitation_sms` (same retry unit as the
  send); idempotency key `invitation:<token>:resend:<resend_count>` snapshotted at queue
  time; revoked replay aborts the SMS; `delivery_failed` set on final failure, cleared on
  success; `resend_count` incremented per admin resend; queued `revoke-by-ref` on
  activation (`activated`, NULLs the stored target) and cancel (`cancelled`).
- **Per PO decision (2026-07-29)**: Open Item 2 closed — resend does **not** extend the
  invitation window; the DFMS **audit webhook receiver stays deferred** (events remain
  pullable via `GET /api/v1/events`).
- Not integrated (pre-existing flow, out of scope): `resend_activation_otp()` SMS still
  carries the long activation URL.

**Still outstanding:** the DFMS audit webhook receiver (step 7 half), and all
infrastructure — short domain, DNS, TLS, aggregator allowlisting (Open Items 4-6). With
`SHORTLINK_ENABLED=false` (default) phone invitations keep the long URL, so nothing ships
until infrastructure lands and the flag is turned on.

### Original status (2026-07-28) — service-only build

`services/link-shortener/` was implemented on 2026-07-28: Build Order steps 1–5 plus the
service half of step 7. 103 tests pass against containerised Postgres 16 and Redis 7, the
Alembic migration applies cleanly, and an end-to-end run exercised CLI client registration →
signed mint → replay → supersede → revoked-replay → public 302 → 410 on the superseded code
→ sweeper draining events into the correct monthly partition.

**Nothing under `apps/` was changed.** Steps 0, 6 and 8 were deliberately deferred — they
commit to product decisions that are still open (Open Items 2 and 8), and Open Items 1, 7
and 11 were unacknowledged when the service was built.

| Step | Status | Where |
|---|---|---|
| **0** — DFMS schema prerequisites | **Done 2026-07-29** (phone channel came from PR #87; `resend_count` + `delivery_failed` in `users.0022`) | `apps/users/` |
| 1 — Service scaffold | **Done** | `linkshort/config.py`, `main.py`, `api/app.py`, `Dockerfile`, `docker-compose.yml` |
| 2 — Data layer | **Done** | `linkshort/storage/models.py`, `alembic/versions/0001_initial_schema.py` |
| 3 — Auth | **Done** | `linkshort/api/auth.py`, `linkshort/cli.py` |
| 4 — Core API | **Done** | `linkshort/api/links.py`, `resolve.py`, `events.py`, `cache.py`, `linkshort/domain/`, `linkshort/storage/repositories.py` |
| 5 — Security verification | **Done** | `tests/` — 103 tests |
| 6 — DFMS client | **Done 2026-07-29** | `apps/core/shortlink_client.py` |
| 7 — Audit + sweeper | **Half done** — sweeper built; DFMS webhook receiver deferred by PO decision 2026-07-29 | `linkshort/workers/sweeper.py` |
| 8 — Wire-up | **Done 2026-07-29** — behind `SHORTLINK_ENABLED` (default false); shipping still blocked on Open Item 6 infrastructure | `apps/users/invitation_service.py`, `apps/notifications/tasks.py` |

Infrastructure owned outside engineering — short domain, DNS, TLS, aggregator allowlisting
and warm-up — is **also not started**, and step 8 cannot ship without it.

### Implementation deviations

Four places where the built service departs from this document. Each is a deliberate
correction found while implementing; the relevant sections below have been updated to match
the code, and the same list is in `services/link-shortener/README.md`.

| # | Deviation | Why |
|---|---|---|
| V1 | **JWT signature is verified before the `jti` replay check**, reversing steps 1–2 of the mint read/write path | Checking `jti` first lets an unauthenticated caller burn arbitrary nonces and fill Redis with keys it chose. A replayed `jti` is still `401` — the observable contract is unchanged |
| V2 | **Redis loss on the authenticated path answers `503`, not `401`** | Fail-closed is preserved. `401` tells the Celery retry to give up on what is an infrastructure problem; `503` is the retryable status the D9 queue-and-retry design needs |
| V3 | **Unknown codes create no `cnt:*` key and no `resolve_event` row** | As specified, a scanner sweeping the keyspace would mint an unbounded number of Redis counters and audit rows. 404-rate alerting reads the Prometheus counter instead, which costs nothing and is the detection this design already relies on |
| V4 | **Non-ASCII targets are rejected at mint** (`reason=non_ascii`) | The target is emitted verbatim into a latin-1 `Location` header. An IRI has to arrive already percent-encoded and punycoded, or the mint succeeds and the resolve 500s days later, after the SMS has gone out |

### Found during implementation

- **`apps/users/invitation_service.py` defines `create_invitation` twice** (lines 370 and
  547). The first is a truncated stub that falls off the end of its body; the second
  shadows it at import time, so behaviour is correct today by accident. It should be
  deleted before step 8 touches this module. Owner: Backend.

---

## Overview

A **general-purpose URL shortener** deployed as a standalone service alongside the DFMS
Django backend. It exposes an authenticated API that accepts a long HTTPS URL and returns
a short URL, and a public endpoint that redirects a short code to its bound target.

Introduced for **SMS invitation links** (AUTH-01), where message length limits make the
long activation URL (~65 characters) impractical. Built as a genuine platform utility, not
an invitation-specific mechanism.

**Why a separate service rather than a Django app:** the redirect endpoint is the only
internet-facing path in the platform that serves unauthenticated traffic on a public
domain. Different threat model, different traffic shape, different availability
requirement — redirects must survive a Django deploy or outage, minting need not.
Isolating it keeps its blast radius outside tenant business data, and lets it scale and
fail independently of the monolith. Follows the existing sidecar precedent set by
`services/gt06-ingest/`.

> **The rationale is the public edge, not internal API consumption.** DFMS calling this over
> HTTP is a *cost* of the split. In-process, `mint → send SMS → revoke old` would be one
> `transaction.atomic()` block; the network hop is what makes the
> [mint contract](#post-apiv1links--mint) and the
> [Redis degradation policy](#redis-degradation-policy) mandatory. Budget for it explicitly.

### Short-link value

| | Length | Example |
|---|---|---|
| Long activation URL | **~77 chars** | `https://nourish.dfms.com/activate/?token=<uuid>` |
| Short URL | ~26 chars | `https://dfms.link/aB7xK2pQ` |

(41 chars of scheme + host + path + `?token=`, plus a 36-character UUID. Longer tenant
hostnames push it past 80.)

Keeps the invitation SMS inside a single 160-character segment — **but only in GSM-7.** A
single non-GSM character anywhere in the body (an accented tenant name, a curly quote)
switches the whole message to UCS-2 and drops the segment to **70 characters**, at which
point 26 chars of URL is over a third of the message. See
[SMS Deliverability](#sms-deliverability).

---

## The service is not tenant-aware — and does not need to be

AUTH-01 AC-3 specifies a "tenant-aware URL shortener". This implementation satisfies it
**structurally rather than through a tenant-scoped data model**: a code maps to exactly one
stored target URL, and that URL already contains the tenant
(`https://nourish.dfms.com/...`). No query in this service has a tenant filter that could
change its answer, so cross-tenant resolution is impossible by construction. The real
security boundary is the invitation token, validated by Django inside the owning tenant's
schema.

The service stores an opaque **`namespace`** instead — supplied by the caller, never
interpreted. DFMS passes `namespace = schema_name`, which buys scoped reads, bulk revoke and
audit attribution without the shortener knowing anything about DFMS multi-tenancy. See
[Deviation from AC-3](#deviation-from-ac-3) for the accepted tradeoff.

---

## Architectural Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Standalone FastAPI service** at `services/link-shortener/` | Matches `gt06-ingest` sidecar pattern; one language across the org. Go would be faster and produce a smaller image, but this workload is thousands of redirects/day — a second language is a permanent maintenance tax for no practical gain |
| D2 | **PostgreSQL (dedicated RDS instance)** | Links are durable business records needing unique constraints, transactions and revocation. Dedicated instance keeps a shortener incident off the DFMS database |
| D3 | **Redis** for resolve cache, rate limiting, JWT nonce, resolve counters | Redirect path must be O(1) and must never write to Postgres per request |
| D4 | **Management API private (VPC / compose network) only** | Only `GET /{code}` is public. Every consumer must live inside the VPC — a mobile client cannot call this service directly and must proxy through its own backend |
| D5 | **Opaque `namespace`, not a tenant model** | Gives scoped reads, bulk revoke and audit attribution without a tenant table, tenant sync, or per-tenant allowlist. Removes an entire distributed-sync mechanism and its most likely production failure mode (a newly provisioned tenant whose sync has not landed) |
| D6 | **Host allowlist is per API client, expressed as base domains** with an anchored suffix match — not an exact-host set | The security boundary is the consumer — tenants never call this API directly. Base domains are *derived*, not maintained: a tenant provisioned a second ago validates with no sync, no hook, no manual DB edit. An exact-host set would reintroduce the exact failure mode D5 removes. See [Open-redirect defense](#open-redirect-defense) |
| D7 | **Multi-consumer platform service** with RS256 service JWTs | DFMS Django is the first consumer; others follow. Asymmetric keys mean the service stores only public keys — full DB compromise yields no ability to mint links |
| D8 | **Random base58 codes**, never sequential | Sequential/counter-based codes make every invitation link in the platform enumerable. base58 (not base62) for read-aloud/screenshot safety — see [Short Code Generation](#short-code-generation) |
| D9 | **Queue + retry** on shortener unavailability | Invitation SMS is minted inside the Celery task; failure surfaces to the admin. No SMS ever goes out with a broken or oversized link |
| D10 | **Mint is idempotent on `Idempotency-Key`, arbitrated by Postgres**, and rotation is a single atomic `supersede` call | Celery retries + a network hop mean a mint may be replayed after its response was lost. A resend reuses the same invitation token, so only the key distinguishes replay from rotation. Doing revoke+mint as two API calls is unserialisable. The transaction takes an advisory lock on `external_ref`, without which two concurrent supersedes both insert and the partial index rejects one at random. See [mint](#post-apiv1links--mint) |
| D11 | **Split failure policy on Redis loss:** fail *open* on the public path, fail *closed* on the authenticated path | A legitimate invitee must never be blocked by an infra outage; replay protection must never disable itself silently. See [Redis degradation policy](#redis-degradation-policy) |
| D12 | **Target allowlist validated once, at mint** — not re-checked at resolve | The target is immutable after mint, so re-checking buys nothing, keeps a client-config read on the hot path, and lets an allowlist edit retroactively kill links already sitting in users' SMS inboxes |

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
  allowed_base_domains text[] NOT NULL,           -- e.g. {dfms.com} — host must equal a
                                                  -- base or be a subdomain of one (D6)
  allowed_link_types   text[] NOT NULL,           -- restricts who may mint invitation links
  active               boolean NOT NULL DEFAULT true
);

short_link (
  id             uuid PRIMARY KEY,
  code           varchar(16) NOT NULL UNIQUE,
  client_id      varchar(64) NOT NULL REFERENCES api_client,
  namespace      varchar(128) NOT NULL,      -- opaque; DFMS passes schema_name
  target_url     text,                       -- encrypted at rest; NULLed on activation
                                             -- and on soft-purge (see Token Exposure)
  link_type      varchar(40) NOT NULL DEFAULT 'generic',
  external_ref   varchar(160),               -- e.g. "invitation:<uuid>" — groups rotations
  idempotency_key varchar(200) NOT NULL,     -- e.g. "invitation:<uuid>:resend:2"
                                             -- distinguishes a Celery replay from a resend
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
CREATE UNIQUE INDEX uq_client_idem ON short_link (client_id, idempotency_key);
CREATE INDEX ON short_link (client_id, namespace);
CREATE INDEX ON short_link (expires_at) WHERE revoked_at IS NULL;

resolve_event (id, code, client_id, namespace, occurred_at, ip_hash, ua_hash, outcome)
  -- monthly partitions. ip_hash = HMAC(ip, monthly rotating salt) — still personal data
  -- under GDPR; 90-day retention, purged by the sweeper. The sweeper also CREATEs next
  -- month's partition on every run (IF NOT EXISTS) — a missing partition fails every
  -- insert and is the classic way this table takes the service down.
```

No `tenant` or `tenant_allowed_host` table. `namespace` is an opaque grouping key: the
service enforces that reads and bulk operations stay within `(client_id, namespace)`, and
never attaches meaning to its contents.

**As built** (`linkshort/storage/models.py`, `alembic/versions/0001_initial_schema.py`) —
the above, plus:

- `api_client.created_at` / `updated_at`.
- Indexes named explicitly — `uq_short_link_code`, `uq_client_idem`,
  `uq_short_link_live_ref` — because the mint path branches on which one a
  `UniqueViolation` names.
- Two extra read indexes: `ix_short_link_ref` for `revoke-by-ref`, and
  `ix_short_link_keyset (client_id, namespace, created_at, id)` for the keyset list.
- `resolve_event` primary key is `(id, occurred_at)` — Postgres requires the partition key
  in the PK — with `ix_resolve_event_cursor (occurred_at, id)` and
  `ix_resolve_event_client (client_id, occurred_at)`. The migration seeds the previous,
  current and next month's partitions so the table is insertable the moment it lands.
- `webhook_dead_letter (id, payload jsonb, attempts, last_error, next_attempt_at,
  created_at)` — an audit batch the receiver would not take, retried with exponential
  backoff up to `SHORTLINK_AUDIT_WEBHOOK_MAX_ATTEMPTS` and then left for
  `GET /api/v1/events?since=` to reconcile.

---

## API

| Method | Path | Purpose | Auth / scope | Port |
|---|---|---|---|---|
| `POST` | `/api/v1/links` | Mint (optionally superseding) | `links:write` | mgmt |
| `GET` | `/api/v1/links/{code}` | Single link metadata | `links:read`, namespace-scoped | mgmt |
| `GET` | `/api/v1/links` | List by `namespace` / `external_ref` | `links:read`, namespace-scoped | mgmt |
| `POST` | `/api/v1/links/{code}/revoke` | Revoke one link | `links:revoke` | mgmt |
| `POST` | `/api/v1/links/revoke-by-ref` | Revoke every live link for a ref | `links:revoke` | mgmt |
| `GET` | `/api/v1/events` | Resolve events since a cursor (audit reconciliation) | `links:read` | mgmt |
| `GET` | `/{code}` | 302 to target | **public**, rate-limited | public |
| `HEAD` | `/{code}` | Same headers, no body, `outcome=head` | **public**, rate-limited | public |
| `GET` | `/healthz` `/readyz` `/metrics` | Ops | none | **ops** |

The mgmt router is private (D4); only the public port is behind the ALB listener rule. Ops
binds a third port the ALB never exposes — `/metrics` must not be internet-reachable.

**As built:** three separate FastAPI applications on three binds in one process — public
`8000`, mgmt `8001`, ops `8002` (`linkshort/api/app.py`, served by `linkshort/main.py`).
Splitting by *bind* rather than by router makes D4 structural: the management API is not
merely unrouted on the public port, it is not mounted there. It also settles route
precedence for free — the root-level `/{code}` catch-all lives on an application that has
no `/api` routes to shadow, so "registered last" stops being something a future edit can
get wrong.

### Redis key map

Every Redis key used by the service, with its writer, reader and failure behaviour (D11):

| Key | Type / TTL | Written by | Read by | On Redis loss |
|---|---|---|---|---|
| `link:{code}` | string, `min(remaining_lifetime, 300s)` | resolve (on cache miss), `DEL` on revoke | resolve | fall through to Postgres |
| `idem:{client_id}:{key}` | string → `code`, 24h | mint | mint | fall through to `uq_client_idem` |
| `jti:{jti}` | string, TTL = `exp − now` | JWT verify (`SET NX`) | JWT verify | **fail closed** — reject |
| `rl:resolve:{ip}:{minute}` | counter, 120s | resolve | resolve | **fail open** + alert |
| `cnt:{code}` | counter, no TTL | resolve (`INCR`) — **known codes only** (V3) | sweeper (flush → Postgres) | drop + metric |
| `evt:pending` | list | resolve (`RPUSH`) — **known codes only** (V3) | sweeper (batch → `resolve_event` + webhook) | drop + metric |

`link:{code}` stores the target **as ciphertext**, decrypted per request — a Redis snapshot
must not be a plaintext token store any more than a Postgres dump is
([token exposure](#token-exposure-at-rest)). The value is a packed record
`{target_ct, expires_at, link_type, client_id, namespace}` — the last two are carried so a
cache hit can still attribute its resolve event without a Postgres read; revoked links are
never cached, they are `DEL`ed.

The ciphertext additionally binds the short code as AES-GCM **additional authenticated
data**, so a ciphertext lifted from one row cannot be opened under another row's code
(`linkshort/domain/crypto.py`). A collision retry changes the code and therefore
re-encrypts.

Implemented in `linkshort/api/cache.py` and `linkshort/storage/redis_client.py`. Every
Redis call returns a `RedisOutcome` rather than raising, so "key absent" and "Redis
unreachable" cannot be confused and each caller states its own policy at the call site
instead of inheriting one by accident.

---

### `POST /api/v1/links` — mint

```http
POST /api/v1/links
Authorization: Bearer <RS256 JWT>
Idempotency-Key: invitation:9f2c1a...:resend:2      # required
Content-Type: application/json

{
  "url":          "https://nourish.dfms.com/activate/?token=9f2c1a...",
  "namespace":    "nourish",
  "link_type":    "invitation_activation",
  "external_ref": "invitation:9f2c1a...",
  "expires_at":   "2026-08-03T10:00:00Z",
  "created_by":   "user:4d81...",
  "supersede":    true
}
```

| Field | Rules |
|---|---|
| `url` | required; https (unless `REQUIRE_HTTPS_TARGETS=false`); host must match the client's `allowed_base_domains`; no embedded credentials; stored and emitted byte-for-byte |
| `namespace` | required, ≤128 chars, opaque to the service |
| `link_type` | must be in the client's `allowed_link_types` |
| `external_ref` | optional; groups rotations. With `supersede`, required |
| `expires_at` | required for invitation links; future; ≤ `now + SHORTLINK_MAX_TTL_DAYS`. Absent ⇒ `SHORTLINK_DEFAULT_TTL_DAYS` (generic links only) |
| `supersede` | revoke the live link for this `external_ref` in the same transaction |

```jsonc
// 201 Created (minted) and 200 OK (idempotent replay) return the same shape, so a
// client reads one response body for both statuses.
{
  "code":           "aB7xK2pQ",
  "short_url":      "https://dfms.link/aB7xK2pQ",
  "expires_at":     "2026-08-03T10:00:00Z",
  "created_at":     "2026-07-27T10:00:00Z",
  "replay":         false,   // true on 200
  "revoked":        false,   // may be true on a replay — see below
  "revoked_reason": null     // "superseded" | "activated" | "cancelled" | "expired"
}
```

| Status | Condition |
|---|---|
| `201` | Minted |
| `200` | Replay of a prior `Idempotency-Key` — identical `code`, plus live/revoked state |
| `400` | Bad `url`, disallowed host or scheme, `expires_at` in the past or over the ceiling |
| `401` / `403` | JWT invalid, expired, replayed `jti`, or scope / `link_type` not granted |
| `409` | Concurrent supersede on the same `external_ref` — caller retries |
| `422` | Missing `Idempotency-Key`, or `supersede` without `external_ref` |
| `503` | Redis unreachable, so `jti` replay protection cannot be enforced — **retryable** (V2) |

**Read / write path** — as built, `linkshort/api/links.py` + `linkshort/storage/repositories.py`

```
1. DB     SELECT api_client          → per-process 60s cache; miss is the only client read
          verify RS256 signature by kid, aud, iss, exp, lifetime ceiling
2. Redis  SET NX jti:{jti} TTL=exp-now  → already present ⇒ 401 replay
                                          Redis down    ⇒ 503 (fail closed, retryable)
3.        validate target host, link_type, expires_at   (pure, no I/O)
4. Redis  GET  idem:{client}:{key}   → hit ⇒ DB SELECT that row, return 200 replay
5. DB     BEGIN
            pg_advisory_xact_lock(hashtext(client||namespace||external_ref))   ← if supersede
            UPDATE short_link SET revoked_at=now(), revoked_reason='superseded'
              WHERE client_id=:c AND namespace=:n AND external_ref=:r AND revoked_at IS NULL
            INSERT short_link (code, target_url=encrypt(url), idempotency_key, ...)
          COMMIT
          ├─ UniqueViolation(uq_client_idem)         ⇒ SELECT by key, return 200 replay
          ├─ UniqueViolation(uq_short_link_code)     ⇒ regenerate ×3, then widen to 10 chars
          └─ UniqueViolation(uq_short_link_live_ref) ⇒ 409 (lock lost / lock not taken)
6. Redis  SETEX idem:{client}:{key} 24h → code        (best-effort)
          DEL link:{code} for every superseded code   (after the commit, never before)
7.        no link:{code} write — the cache is populated on first resolve, not at mint
```

**Signature before nonce (V1).** The order of steps 1 and 2 is reversed from the original
plan. Verifying the signature first is what stops an unauthenticated caller writing
`jti:*` keys of its choosing into Redis. A replayed `jti` is still `401`.

**Index names are load-bearing**, not cosmetic: the mint path branches on which constraint
a `UniqueViolation` names, so `uq_short_link_code`, `uq_client_idem` and
`uq_short_link_live_ref` are created explicitly in the migration and read back off the
asyncpg error (`_constraint_name`, with a string fallback if either library changes shape).

The advisory lock is what makes concurrent supersedes serialise. Without it, under READ
COMMITTED the `UPDATE` does not see a row inserted by a concurrent transaction after its
snapshot, so both transactions insert and the partial unique index rejects one at random.
Verified by `tests/test_api_mint.py::test_concurrent_supersedes_serialise_on_the_advisory_lock`,
which asserts the invariant that survives any interleaving: **exactly one live link per
`external_ref`**.

**Idempotency is arbitrated by Postgres, not Redis.** `uq_client_idem` is the authority;
`idem:*` only saves a round trip. Any design whose correctness depends on that cache
surviving is broken by definition.

| Situation | What DFMS wants | Distinguished by |
|---|---|---|
| Celery **retried** a task whose response was lost | the *same* link back | same `Idempotency-Key` |
| Admin **resent** the invitation | a *new, rotated* code | new `Idempotency-Key` |

A resend reuses the **same invitation token** — `resend_invitation()` does not reissue it —
so `external_ref` and `target_url` are byte-identical across resends. `Idempotency-Key` is
the only signal, which is why it is required. DFMS derives it from
`invitation:{token}:resend:{invitation.resend_count}`; `last_resent_at` cannot be used, as
it is rewritten on failed attempts and would turn a retry into a rotation. **`resend_count`
does not exist on `InvitationToken` today** — see [Open Items](#open-items).

**A replay may return a revoked link.** If `…:resend:1` is retried after `…:resend:2`
superseded it, the `200` carries `"revoked": true`. The client **must not send an SMS on a
revoked replay** — abort and let the newer link stand. Rotation is otherwise one call:
`supersede` makes revoke+insert atomic, so revoke-then-mint (no live link if the mint fails)
and mint-then-revoke (violates the index) both disappear rather than being mitigated.
Ordering at the caller is **mint → dispatch SMS**; an SMS failure leaves a live unused link
and flags the invitation, which is the existing failure path.

---

### `GET /api/v1/links/{code}` — metadata

Returns `code, namespace, link_type, external_ref, expires_at, revoked_at, revoked_reason,
resolve_count, first/last_resolved_at, created_by, created_at`. **Never the target URL** —
it holds a live token and the caller already knows what it minted.

**Read / write path:** JWT (`jti` `SET NX`) → `SELECT … WHERE code = :code`, then assert
`client_id` and `namespace` match the token's consumer. A mismatch returns **404, not 403**,
so the endpoint is not an existence oracle. No Redis read — `link:{code}` is the redirect
cache and does not carry metadata. No writes.

`namespace` is an **optional `?namespace=` query parameter**: the client scope always
applies, and supplying a namespace narrows it further. The consumer's identity comes from
the JWT, so a caller can never widen its own scope by omitting it.

### `GET /api/v1/links` — list

`?namespace=&external_ref=&link_type=&active_only=&limit=&cursor=`. `namespace` is
**required** (a missing one is `422`); results are hard-filtered to `(client_id, namespace)`
regardless of what the query asks for. Served by `INDEX (client_id, namespace)`,
keyset-paginated on `(created_at, id)` — never `OFFSET`. Read-only, no Redis.

`cursor` is an opaque base64 of `(created_at, id)`; the response carries `next_cursor`,
null on the last page. Keyset rather than offset because this list is read by a
reconciliation job walking forward while new rows arrive, and `OFFSET` silently skips rows
when that happens.

### `POST /api/v1/links/{code}/revoke` — revoke

```json
{ "reason": "activated", "namespace": "nourish" }   // namespace optional; reason is one of
                                                    // activated | cancelled | expired | superseded
```

**Read / write path**

```
1. DB     UPDATE short_link
             SET revoked_at = now(), revoked_reason = :reason,
                 target_url = CASE WHEN :reason = 'activated' THEN NULL ELSE target_url END
           WHERE code = :code AND client_id = :c AND namespace = :n AND revoked_at IS NULL
          → 0 rows ⇒ 404 (wrong scope) or 200 (already revoked, same reason — idempotent)
2. Redis  DEL link:{code}        ← must follow the commit, never precede it
```

`activated` NULLs `target_url` in the same statement, collapsing the token's exposure window
from the retention period to "until the invitee uses it". Revoke is idempotent: repeating it
with the same reason is `200`, with a different reason is `409` — the first reason is the
true one. The `DEL` after commit is the ordering that matters; deleting first leaves a
window where a concurrent resolve repopulates the cache from the pre-commit row.

### `POST /api/v1/links/revoke-by-ref` — bulk revoke

`{ "namespace": "...", "external_ref": "invitation:9f2c1a...", "reason": "cancelled" }` →
one `UPDATE … WHERE external_ref = :r AND revoked_at IS NULL` returning the affected codes,
then `DEL` each `link:{code}`. Returns `{ "revoked": ["aB7xK2pQ", …] }`. Used on invitation
cancellation, where several rotations may still be live in users' inboxes.

### `GET /{code}` — public redirect

The only unauthenticated path, and the only one on the hot path.

```
1. Redis  INCR rl:resolve:{ip}:{minute}  (EXPIRE 120) → over limit ⇒ 429
                                          Redis down ⇒ fail open, alert
2.        shape check: length 8–10, base58 charset — rejects /favicon.ico, /robots.txt
          and scanner noise before touching any datastore. Must accept the full range;
          an `== 8` check would 404 every collision-widened code
3. Redis  GET link:{code}
            miss → DB SELECT code, target_url, expires_at, revoked_at WHERE code = :code
                   not found ⇒ 404, no analytics written (V3)
                   live      ⇒ SETEX link:{code} min(remaining, 300) {ciphertext record}
4.        revoked_at set?      ⇒ 410, copy from revoked_reason
          now >= expires_at?   ⇒ 410 expired      (server-side UTC; client clocks unused)
          target_url NULL?     ⇒ 410 (soft-purged, or NULLed on activation)
5.        decrypt target in memory (AAD = code)
6. Redis  INCR cnt:{code}; RPUSH evt:pending {...}      ← both non-blocking, both droppable
7.        302, Location: <target, byte-for-byte>
```

**Analytics are written only for codes that exist (V3).** A scanner sweeping the keyspace
would otherwise create one `cnt:*` key and one `resolve_event` row per guess — unbounded,
never expiring, and driven entirely by an unauthenticated attacker. Unknown and malformed
codes increment `linkshort_resolves_total{outcome="not_found"|"malformed"}` and nothing
else, which is the same signal the 404-rate alert already reads.

Implemented in `linkshort/api/resolve.py`. The `Location` header is set directly rather
than through Starlette's `RedirectResponse`, which re-quotes the URL — that re-encoding is
exactly the "invalid invitation that reproduces on no developer's machine" this design
warns about.

No target re-validation (D12): the target is immutable after mint, so re-checking buys
nothing, puts a client-config read on the hot path, and would let an allowlist edit
retroactively kill links already sitting in users' SMS inboxes.

The Postgres fallback in step 3 uses a **small dedicated pool with a statement timeout**, so
a Redis outage degrades resolve latency instead of exhausting RDS connections and taking
minting down with it. Budget: Redis hit ≈ 1 ms, Postgres fallback ≈ 5 ms, target < 20 ms p99
at the edge. Nothing on this path fans out, and nothing on it writes to Postgres.

**Never log the `Location` header or the decrypted target.** It carries a live activation
token; access logs have wider read access and no retention policy. Scrub at the uvicorn
access-log formatter and disable ALB access logs on this listener.

### `GET /api/v1/events` — audit reconciliation

`?since=<cursor>&limit=` over `resolve_event`. The webhook is the primary channel; this is
the pull-based backstop so an audit gap is always recoverable. Reads the current and
previous monthly partitions only.

### Ops endpoints

`/healthz` is process-liveness and touches nothing. `/readyz` does `SELECT 1` and Redis
`PING`, reporting Redis degradation without failing the check — the service is still able to
resolve from Postgres. `/metrics` is Prometheus text.

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
| No open redirect | Target host validated against the client's `allowed_base_domains` **once, at mint** (D12) |
| Bounded lifetime | `expires_at` required at mint and mirrored from the invitation — see [Link Lifecycle & Expiry Control](#link-lifecycle--expiry-control) |
| Revocable | `revoked_at` + immediate Redis `DEL`; bulk revoke by `external_ref` |
| Scoped access | Reads and bulk operations constrained to `(client_id, namespace)`; a mismatch returns **404, not 403** — no existence oracle |
| Enumeration resistant | 46.9 bits of CSPRNG entropy is the actual defence; unknown codes return a generic 404, and **detection is via 404-rate alerting**, not a tight rate limit — see [Rate limiting](#rate-limiting--detect-rather-than-block) |
| Token exposure bounded | `target_url` encrypted at rest and NULLed the moment the invitation is activated — see [Token exposure at rest](#token-exposure-at-rest) |

**Every row above is implemented and has a test.** Build Order step 5 named five cases
explicitly; all five are covered — open-redirect (`tests/test_targets.py`, plus the mint-level
`test_disallowed_targets_are_refused_at_mint`), namespace scoping
(`test_metadata_from_another_namespace_is_404_not_403`,
`test_listing_is_hard_filtered_to_the_namespace`), concurrent supersede
(`test_concurrent_supersedes_serialise_on_the_advisory_lock`), replay-after-supersede
(`test_replaying_a_superseded_key_reports_it_as_revoked`), and no token in logs or Redis
(`test_the_target_never_reaches_the_logs`, `test_the_cache_holds_ciphertext_not_the_token`).

### Open-redirect defense

Generic targets are accepted, so the host check is the only barrier. Without it, an
attacker mints `https://dfms.link/xY3kP9qR → https://phish-dfms.example/login` and your
short domain — the one the invitation SMS trained users to tap — lends its reputation to a
credential-harvesting page.

As built — `linkshort/domain/targets.py`:

```python
def validate_target(url: str, allowed_base_domains: list[str], *, require_https: bool) -> str:
    if not url or url.strip() != url:          reject("malformed")
    if not url.isascii():                      reject("non_ascii")   # V4

    u = urlparse(url)
    if u.scheme not in ("https", "http"):      reject("scheme")   # javascript:, data:
    if require_https and u.scheme != "https":  reject("scheme")
    if u.username or u.password:               reject("credentials")

    host = (u.hostname or "").lower().rstrip(".")
    for base in allowed_base_domains:
        b = base.strip().lower().lstrip(".").rstrip(".")
        if host == b or host.endswith("." + b):
            return url      # returned byte-for-byte; never parsed and rebuilt
    reject("host")
```

`allowed_base_domains` for `dfms-django` is `{dfms.com, <FRONTEND_URL host>}`.
`require_https = ENV != "local"`.

**Why the non-ASCII rejection (V4).** The target is emitted verbatim into a `Location`
header, which is latin-1 on the wire. A URL carrying a raw accented character would mint
successfully and then raise at resolve time — days later, after the SMS has gone out, on the
one path with no recovery. An IRI has to arrive already percent-encoded and punycoded.

Covered by `tests/test_targets.py`: the base and its subdomains, byte-for-byte return,
`dfms.com.evil.io`, `evil.com@nourish.dfms.com`, `evildfms.com`, non-https, `javascript:`,
`data:`, `file:`, protocol-relative, case folding, trailing dot, explicit port, non-ASCII,
and an empty allowlist accepting nothing.

**Why base domains, not an exact host set.** `_build_activation_url()`
(`apps/users/invitation_service.py:75`) resolves the tenant's primary domain from the
database at send time, so valid target hosts are runtime data that grows with every customer
onboarded. An exact-match array is static config: provision `acme.dfms.com` and every
invitation for that tenant 400s at mint until someone edits the shortener's database — the
failure mode D5 eliminates, reproduced by hand.

**Why the suffix match is safe.** The hazard is a *hardcoded* `endswith(".dfms.com")`, which
`dfms.com.evil.io` defeats. Here the dot is concatenated to the **configured base**, so that
host fails both branches. Three details keep it correct: (1) lowercase before comparing;
(2) use `hostname`, never `netloc`, which carries port and credentials; (3) reject embedded
credentials explicitly, or `https://evil.com@nourish.dfms.com` passes the host check while
browsers navigate to `evil.com`.

**Residual risk:** the permitted set widens to "any subdomain of a domain we own".
Exploiting it needs a dangling `dfms.com` subdomain — a takeover scenario you defend against
anyway. Mitigation is dangling-CNAME monitoring, not a hand-maintained array.

**Local and CI:** `TENANT_DOMAIN_SCHEME` defaults to `http`, so an unconditional https
requirement rejects every mint outside production. Scope the rule to the environment; do not
weaken it in production to make dev work.

### Token exposure at rest

`target_url` contains a live activation token, so a dump of the shortener database yields
the activation token for **every pending invitation in every tenant** — direct account
takeover, no DFMS compromise required. D7's claim that a full DB compromise "yields no
ability to mint links" is true and beside this point. Inherent to a shortener that stores
its targets; bounded, not eliminated, and the bound has to hold in **all four** places the
token appears:

| Where | Control |
|---|---|
| Postgres `short_link.target_url` | KMS-backed AES-GCM at the application layer (or `pgcrypto`); decrypted only on resolve |
| Redis `link:{code}` | **cache the ciphertext**, decrypt per request — a Redis RDB snapshot must not be a plaintext token store either |
| Access logs (`Location`, uvicorn + ALB) | scrub at the log formatter; disable ALB access logs on the public listener. Logs have wider read access and no retention policy |
| After use | **NULLed on activation** — `revoked_reason='activated'` clears the column in the same `UPDATE`, collapsing the window from 37 days to "until the invitee taps it". Soft-purge NULLs everything else at `expires_at + retention` |

Accepted risk, recorded rather than omitted: between mint and activation, a pending
invitation's token exists in two databases instead of one.

**As built.** AES-GCM at the application layer (`linkshort/domain/crypto.py`), key from
`TARGET_URL_ENCRYPTION_KEY` with `TARGET_URL_ENCRYPTION_KEY_PREVIOUS` for rotation without a
bulk re-encrypt; an absent key is a startup failure, never a plaintext fallback. The short
code is the AAD. Log scrubbing is `linkshort/logging_setup.py` — uvicorn's access log is
disabled on all three binds, a filter redacts `token=`/`Bearer` shapes on every record, and
the service's own request log carries method, path and status only. The ALB half is
configuration, not code: **access logs must still be disabled on the public listener**.
Asserted by `tests/test_api_resolve.py::test_the_target_never_reaches_the_logs` and
`::test_the_cache_holds_ciphertext_not_the_token`.

### Deviation from AC-3

AC-3 asks for a tenant-scoped data model with per-tenant allowlists and cross-tenant
isolation checks. This design drops that in favour of an opaque namespace. **Requires PO
acknowledgement** — recorded here rather than changed silently.

**Isolation still holds.** A code resolves to exactly one stored URL carrying the tenant
host; no tenant filter could change that outcome. Even a link deliberately pointed at
another tenant's host is inert — activation needs a valid invitation token, which Django
validates in that tenant's schema and the shortener can neither read nor forge.

**What is given up:** a consumer could mint under namespace A a link targeting tenant B's
host. Negligible — the target stays allowlist-bound and the token check is the real
boundary. For a genuinely untrusted consumer, add a per-client `allowed_namespaces` and
derive the expected host from the namespace: additive, not a rewrite.

**Where the opacity claim stops.** `namespace` is opaque to *this service*, but the audit
webhook hands it to `schema_context()` on the DFMS side — a schema name from
consumer-supplied data. The receiver must validate against registered tenants and drop
unknown values, or a hostile value writes into `public` or another tenant's schema. ~15
lines against a cached list, not a tenant-sync subsystem. See
[DFMS Integration](#dfms-integration).

**What this removes:** the `tenant` and `tenant_allowed_host` tables, the sync endpoint, the
nightly reconcile, the provisioning hook, the per-tenant allowlist cache on the hot path and
the RLS policies — roughly a third of the service, including its most likely production
failure mode (a newly provisioned tenant whose sync had not landed).

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
> (`apps/users/invitation_service.py:664`) resets the cooldown but never reassigns
> `expires_at`, and it refuses to run once `is_valid()` is false. So a resend on day 6
> produces a link with **1 day** of life, not 7. AUTH-01 AC-2 states resend gives a
> "new window" — that is not current behaviour.
>
> **Recommendation:** the shortener mirrors whatever the invitation says, in both cases. If
> the PO wants a genuine fresh window, that is a one-line change to `resend_invitation()`
> (`invitation.expires_at = now + timedelta(days=US005_INVITATION_EXPIRY_DAYS)`, plus the
> field in `update_fields`) and the shortener needs **no** change — because it never owns
> the policy. Flag the mismatch, don't paper over it in the shortener.

> **Finding — there is no phone branch in resend at all.** `resend_invitation()` regenerates
> the OTP only when `otp_type == EMAIL` (line 685) and dispatches exclusively through
> `_queue_staff_invitation_email`. Build-order step 8 is therefore **writing the SMS resend
> path**, not adding a call to an existing one. Size it accordingly.

> **Finding — a resend reuses the same invitation token.** `_build_activation_url()` is
> called with `invitation.token`, which resend does not reissue, so the target URL is
> byte-identical across resends. This is why `Idempotency-Key` — not `external_ref` or
> `target_url` — is the only thing that can distinguish a Celery replay from a genuine
> resend. See [mint](#post-apiv1links--mint).

> **Finding — the key that contract needs does not exist.** `InvitationToken` has
> `last_resent_at` but **no resend counter** (`apps/users/models.py:695-758`), so
> `…:resend:N` cannot be constructed. `last_resent_at` is not a substitute: it is rewritten
> on every attempt including failed ones (`invitation_service.py:717`), so a Celery retry
> would produce a *different* key and mint a rotation instead of replaying — inverting the
> distinction the contract exists to make. Needs `resend_count =
> PositiveSmallIntegerField(default=0)`, incremented once per admin-initiated resend in the
> same transaction. Migration, not wiring — see [Build Order](#build-order) step 0.

### Early termination (before expiry)

`revoked_at` is checked **before** `expires_at`, so the specific message always wins over
the generic one. `revoked_reason` drives the copy:

| `revoked_reason` | Trigger | User sees (410) |
|------------------|---------|-----------------|
| `superseded` | Invitation resent | "A newer invitation link was sent — please use the latest SMS" |
| `activated` | Activation completed | "This account is already activated — sign in" — **also NULLs `target_url` in the same statement** ([token exposure](#token-exposure-at-rest)) |
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

Step ④ — rate limit, shape check, cache-or-Postgres lookup, state check, 302 — is specified
step by step under [`GET /{code}`](#get-code--public-redirect).

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

### Rate limiting — detect rather than block

A tight per-IP bucket is the wrong instrument: carriers put thousands of subscribers behind
a handful of CGNAT addresses, so a limit strict enough to stop enumeration will 429 real
invitees. The real defence is **46.9 bits of entropy**, not the bucket.

- `RESOLVE_RATE_LIMIT` generous — order of **60/min/IP**. Absurd for a human, still caps a
  scanner, survives CGNAT.
- **Alert on the 404 rate.** A scanner produces near-100% 404s, a carrier NAT near-100%
  302s. Same detection, no false positives on invitees.

### Redis degradation policy

Redis carries five jobs (D3), so its failure mode must be chosen per job rather than
inherited. The split: **fail open on the public path, fail closed on the authenticated
path.**

| Function | On Redis loss | Why |
|----------|---------------|-----|
| Resolve cache | fall through to Postgres | Correct but slower |
| Rate limiter | **fail open**, alert loudly | A legitimate invitee must never be blocked by an infra outage; entropy is the real defence anyway |
| JWT nonce (replay) | **fail closed** — reject mints | A security control must never disable itself silently. Minting is not time-critical; the Celery retry absorbs it |
| Idempotency cache | fall through to the Postgres unique index | Already the design ([mint](#post-apiv1links--mint)) — no correctness dependency |
| Resolve counters / events | drop, emit a metric | Analytics, not correctness |

The claim that "an outage blocks minting, not resolving" holds only with this table in
place. Add a **statement timeout and a small dedicated connection pool** on the resolve
path's Postgres fallback, so a Redis outage degrades latency instead of exhausting RDS
connections and taking minting down with it.

**As built.** Two engines (`linkshort/storage/db.py`): the main pool, and a resolve pool of
`SHORTLINK_RESOLVE_POOL_SIZE` (5) with `statement_timeout` and
`application_name=linkshort-resolve` set as asyncpg server settings, `max_overflow=0` on
both. Redis clients carry a 250 ms socket timeout so a *hung* Redis degrades like a dead one
rather than stalling the hot path. The rejection status for the fail-closed case is `503`
(V2), not `401`. Both directions are tested:
`test_redirects_survive_a_redis_outage` (public path still 302s) and
`test_minting_fails_closed_when_the_nonce_store_is_gone` (mint 503s).

---

## DFMS Integration

> **Status: not started.** Everything in this section is Build Order steps 6, 7 (receiver
> half) and 8, none of which exists yet. The service side of each contract below is built
> and tested — what is missing is the Django code that calls it. Step 8 is additionally
> blocked on step 0 and on Open Item 6 (aggregator policy).

| Concern | Detail |
|---------|--------|
| Client | `apps/core/shortlink_client.py` — signs the service JWT, passes `namespace=connection.schema_name`, retries with backoff, circuit breaker so a sustained outage fails fast instead of tying up workers. **Breaker state in Redis**, not per-process, or each Celery worker trips independently and the breaker never does its job |
| Mint | `apps/users/invitation_service.py` — after `_build_activation_url()` (lines 502 create, 693 resend), branch on channel: phone → mint short link → SMS. Runs **inside** the Celery task, not the request path. JWTs are `exp = now + 120s`, so **sign per attempt** — a retry must never replay a stale token |
| Idempotency key | `invitation:{token}:resend:{invitation.resend_count}`, read from the row the task was handed. **Never `last_resent_at`** — rewritten on failed attempts, so it would turn a retry into a rotation. Requires the `resend_count` migration |
| Replay handling | A `200` with `"revoked": true` means a newer link already superseded this one. **Abort the send** — do not SMS a link that will 410. A `409` means a concurrent supersede, and a `503` means the shortener's Redis is down; let the Celery retry pick both up |
| Revoke | Explicit `POST /links/{code}/revoke` on activate and cancel — **queued, not inline in the request path**. Activation must not depend on shortener latency; the token is already `is_used`, so revocation is load-bearing only for the token-exposure window, not for security. **Resend does not call revoke** — it mints with `"supersede": true` (AC-2 "new or rotated"). See [mint](#post-apiv1links--mint) |
| Expiry | `expires_at = invitation.expires_at` — copied **verbatim, never `min()`**. The shortener does not own expiry policy; see [Link Lifecycle](#the-shortener-never-owns-expiry-policy). `SHORTLINK_DEFAULT_TTL_DAYS` applies only to generic links with no explicit `expires_at` |
| Audit | Shortener batches `resolve_event` rows and POSTs them HMAC-signed to a DFMS internal endpoint. The receiver **validates `namespace` against registered tenant schemas (cached from the public schema) and drops unknown values** before calling `schema_context` — never pass a consumer-supplied string to `schema_context` unchecked. Dead-letter table with backoff, plus `GET /api/v1/events?since=` for reconciliation — an audit gap is always recoverable |
| Failure | Celery retries 3× with backoff; on final failure the invitation stays `Sent` with a `delivery_failed` flag visible in the Users list (AC-5 "no silent success"). **`InvitationStatus` has no such value and there is no flag field today** — schema + serializer + list-column change, see [Build Order](#build-order) step 0 |
| Email path | Unchanged — email invitations keep the long activation URL (AC-3, AC-6 non-regression) |

No tenant provisioning hook is required: a namespace needs no registration, so a tenant
created a second ago can mint links immediately. With `allowed_base_domains` (D6) the same
is true of the host check — no allowlist edit either.

---

## SMS Deliverability

**This is the risk most likely to sink the feature after everything else is built
correctly**, and it is not a DNS ticket. A newly registered domain used for bulk SMS is a
textbook spam signal: EU/UK aggregators and 10DLC-style filtering routinely block unknown
link domains, and public shorteners are frequently banned by policy outright. If links are
silently filtered, nothing in the current failure model notices — every send reports
success.

| Requirement | Detail |
|---|---|
| Aggregator allowlisting | Register the short domain with the SMS provider **before** wire-up, not after. Confirm their policy on shortened links at all — some reject them regardless of ownership |
| Warm-up | Ramp volume gradually; do not cut all invitations over on day one |
| Delivery receipts | Ingest DLRs and alert on drop rate. A filtered SMS currently surfaces nowhere — the failure model only covers send-time errors (AC-5 "no silent success" is not satisfied without this) |
| GSM-7 enforcement | The template must reject or transliterate non-GSM characters. Accented tenant names are near-certain in a European deployment, and one such character halves the segment to 70 chars — at which point the 26-char URL is over a third of the message |
| Length assertion | Assert single-segment length in tests at template-build time, so an over-length body fails loudly rather than silently costing two segments |

---

## Deployment

As built:

```
services/link-shortener/
  linkshort/
    api/
      app.py        three app factories — public / mgmt / ops
      auth.py       RS256 verification, client cache, scope dependency
      links.py      mint, list, metadata, revoke, revoke-by-ref
      events.py     audit reconciliation
      resolve.py    the public redirect
      cache.py      Redis caches, counters, rate limiting
      cursor.py     opaque keyset cursors
      ops.py        /healthz /readyz /metrics
      pages.py      tenant-neutral 404 / 410 / 429 pages
      schemas.py    Pydantic v2 request/response models
    domain/
      codes.py      base58 generation + shape check
      targets.py    open-redirect defense
      crypto.py     AES-GCM for target_url, code bound as AAD
      lifecycle.py  revoke reasons, expiry policy, user-facing copy
      hashing.py    monthly-rotating HMAC for ip_hash / ua_hash
      errors.py
    storage/
      models.py         SQLAlchemy 2.0, named indexes
      repositories.py   every transaction boundary in the service
      db.py             main pool + resolve pool
      redis_client.py   key map, RedisOutcome, per-job failure policy
    workers/sweeper.py  partitions, counter flush, expiry, purge, webhook retry
    cli.py        linkshort clients add / rotate-key / deactivate-key /
                  deactivate / activate / list, plus keygen
    config.py  main.py  metrics.py  logging_setup.py
  alembic/versions/0001_initial_schema.py
  tests/         103 tests: unit run anywhere, integration skip without
                 SHORTLINK_TEST_DATABASE_URL
  Dockerfile  docker-compose.yml  alembic.ini  requirements.txt
  pyproject.toml  .env.example  README.md
```

**Not built:** the sweeper's *orphan-rotation reconcile*. The partial unique index makes an
orphaned rotation unrepresentable, so there is nothing for it to reconcile; it should be
added only if a concrete case for it appears.

- Own `docker-compose.yml` (api + postgres + redis + sweeper), mirroring `gt06-ingest`.
  Local dev and CI use containerised Postgres; `DATABASE_URL` is the only environment
  difference.
- Production slots into `deploy/compose/` with an nginx/ALB host rule for the short domain.
- RDS security group accepts traffic only from the shortener's SG. Automated backups +
  PITR. Multi-AZ optional — Redis absorbs reads, and an outage blocks minting, not resolving.
- Size `pool_size × replicas + sweeper` well under `max_connections`, or front with
  PgBouncer in transaction mode.
- API is stateless — scale horizontally; Redis holds all shared state.
- **`api_client` management is a CLI, not an HTTP surface.** `linkshort clients add /
  rotate-key / deactivate` writes directly to Postgres. No admin endpoint, no bootstrap
  chicken-and-egg. Key rotation: append `{kid, pem, active: true}` → deploy DFMS signing
  with the new `kid` → flip the old to `active: false`. The overlap window is exactly what
  the `kid` header exists for.
- Ops port (`/healthz`, `/readyz`, `/metrics`) bound separately and excluded from the ALB
  listener rule.

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
| `RESOLVE_RATE_LIMIT` | Per-IP token bucket on the public endpoint. Deliberately loose (~60/min) — CGNAT makes a tight bucket a false-positive machine; detection is via 404-rate alerting |
| `REQUIRE_HTTPS_TARGETS` | Default `true`; `false` only in local/CI, where `TENANT_DOMAIN_SCHEME` is `http` |
| `TARGET_URL_ENCRYPTION_KEY` | KMS-backed key for `target_url` at rest (secret store). Absent ⇒ the service refuses to start |
| `RESOLVE_EVENT_RETENTION_DAYS` | 90 — `ip_hash` is personal data under GDPR |
| `OPS_PORT` | Separate bind for `/healthz` `/readyz` `/metrics`, not exposed by the ALB |

Added during implementation (`linkshort/config.py`, all with defaults — see `.env.example`):

| Variable | Purpose |
|----------|---------|
| `SHORTLINK_ENV` | `local` / `ci` / `production`; drives the `REQUIRE_HTTPS_TARGETS` default |
| `SHORTLINK_PUBLIC_PORT` / `SHORTLINK_MGMT_PORT` | The other two binds (8000 / 8001) |
| `SHORTLINK_TRUST_PROXY_HEADERS` | Take the client IP from `X-Forwarded-For` — true behind the ALB |
| `TARGET_URL_ENCRYPTION_KEY_PREVIOUS` | Decrypt-only key, so a rotation needs no bulk re-encrypt |
| `SHORTLINK_IP_HASH_SECRET` | Seeds the monthly rotating salt for `ip_hash` / `ua_hash` |
| `SHORTLINK_WIDE_CODE_LENGTH` | The collision-widened length (10) |
| `SHORTLINK_CACHE_TTL_SECONDS` | Ceiling on the `link:{code}` TTL (300) |
| `SHORTLINK_DB_POOL_SIZE` / `SHORTLINK_RESOLVE_POOL_SIZE` | The two pools, sized separately on purpose |
| `SHORTLINK_RESOLVE_STATEMENT_TIMEOUT_MS` | Statement timeout on the hot-path fallback (250) |
| `SHORTLINK_REDIS_TIMEOUT_SECONDS` | Socket timeout, so a hung Redis degrades like a dead one (0.25) |
| `JWT_MAX_LIFETIME_SECONDS` | Rejects tokens minted with a long `exp` — these are `now + 120s` |
| `SHORTLINK_CLIENT_CACHE_SECONDS` | Per-process `api_client` cache (60) |
| `SHORTLINK_SWEEPER_INTERVAL_SECONDS` / `_EVENT_BATCH_SIZE` | Sweeper pacing (60 / 500) |
| `SHORTLINK_AUDIT_WEBHOOK_URL` / `_SECRET` / `_TIMEOUT_SECONDS` / `_MAX_ATTEMPTS` | Audit delivery; empty URL disables it and events stay pullable |

Consumer-side (DFMS), added 2026-07-29 in `config/settings/base.py`: `SHORTLINK_ENABLED`
(default false — phone invitations keep the long URL until infrastructure lands),
`SHORTLINK_API_URL` (mgmt bind), `SHORTLINK_CLIENT_ID`, `SHORTLINK_PRIVATE_KEY_PATH`
(secret store, never committed), `SHORTLINK_JWT_KID`, `SHORTLINK_JWT_AUDIENCE`,
`SHORTLINK_TIMEOUT_SECONDS`, and the `SHORTLINK_BREAKER_*` trio.

---

## Build Order

Steps 1–5 are independent of all phone/SMS work in AUTH-01 and can start immediately. **Step
0 is DFMS-side and blocks step 8** — three prerequisites the original plan assumed already
existed. Land it as one changeset early in the sprint, not alongside the wire-up.

| # | Step | Deliverable | Status |
|---|------|-------------|--------|
| **0** | **DFMS schema prerequisites** | `InvitationToken.resend_count` (idempotency key); a `delivery_failed` flag/status + serializer + Users-list column (AC-5); invitee phone storage and a `phone` channel discriminator | **Done 2026-07-29** — phone channel landed via PR #87; `resend_count` + `delivery_failed` in migration `users.0022` |
| 1 | Service scaffold | FastAPI app, config, Dockerfile, compose, `/healthz` `/readyz` | **Done** — three binds, ops on its own port |
| 2 | Data layer | Models, Alembic migrations | **Done** — `0001_initial_schema`, applies clean; `resolve_event` partitioned with prev/current/next months seeded |
| 3 | Auth | JWT verification middleware, `api_client` registry **+ management CLI**, scope + link-type enforcement, nonce replay cache | **Done** — signature verified before the nonce (V1); Redis loss answers 503 (V2) |
| 4 | Core API | Mint (idempotency key + advisory-locked `supersede` transaction + revoked-replay response), resolve, revoke, revoke-by-ref, list, events, Redis cache **of ciphertext**, rate limiting, base-domain validator, target encryption, log scrubbing | **Done** — all seven endpoints |
| 5 | Security verification | Open-redirect coverage (incl. `dfms.com.evil.io`, `evil.com@nourish.dfms.com`, non-https, widened 10-char codes); namespace scoping; concurrent supersede on one `external_ref`; replay-after-supersede returns `revoked: true`; no token in access logs or Redis plaintext | **Done** — every listed case covered; 103 tests green against real Postgres + Redis |
| 6 | DFMS client | `shortlink_client.py` with retry, per-attempt JWT signing, Redis-backed circuit breaker | **Done 2026-07-29** — `apps/core/shortlink_client.py`; breaker state in the shared Redis cache |
| 7 | Audit + sweeper | Webhook receiver in DFMS **with namespace validation**; sweeper for expiry, counter flush, retries, partition create-ahead + purge | **Half done** — sweeper built and verified. **The DFMS receiver is deferred by PO decision (2026-07-29)**; events stay pullable via `GET /api/v1/events` |
| 8 | Wire-up | Invitation create mints short URL; phone resend path (landed with PR #87, now supersedes on resend); revoke hooks on activate/cancel | **Done 2026-07-29** — mint inside `users.send_invitation_sms`, gated by `SHORTLINK_ENABLED` (default false); shipping still blocked on Open Item 6 infrastructure |

Run in parallel with 1–8, owned outside the service: **short domain registration, DNS, TLS,
and aggregator allowlisting + warm-up** ([SMS Deliverability](#sms-deliverability)). Steps
1–5 do not depend on it; step 8 cannot ship without it. Start it first — lead times here are
external and unpredictable. **Status: not started, and now the longest pole.**

### What remains, in dependency order

1. **Open Items 2 and 8 answered** (PO) — the phone channel discriminator, where the
   invitee's number is captured, and whether resend opens a new window. Nothing DFMS-side
   can start until these land.
2. **Step 0** — one migration on `InvitationToken`, plus `import_configs.py`, the admin
   form, the serializer and the Users-list column.
3. **Step 6** — `apps/core/shortlink_client.py`. Contract is fixed and testable against the
   running service today; note the breaker state belongs in Redis, not per-process, or each
   Celery worker trips independently.
4. **Step 7 receiver** — the audit endpoint, with `namespace` validated against registered
   tenant schemas before it reaches `schema_context()`.
5. **Step 8** — mint on create, the SMS resend path, revoke hooks on activate and cancel.
6. **Domain, DNS, TLS, aggregator allowlisting** — in parallel from now, blocking 5.

---

## Open Items

**All eleven are still open.** The service was built without waiting on them because steps
1–5 are reversible in a way the DFMS-side steps are not: nothing under `apps/` was touched,
so items 1, 7 and 11 can still be decided against the service without unwinding a migration
or a changed invitation flow. Items 2, 6 and 8 block the remaining work outright.

| # | Item | Owner | Blocks |
|---|------|-------|--------|
| 1 | **PO acknowledgement of the AC-3 deviation** (namespace instead of tenant model) | PO / Architecture | Nothing today — but the built service assumes it. Reversing means adding `allowed_namespaces` + host-from-namespace derivation, which is additive, not a rewrite |
| 2 | ~~Resend window mismatch~~ — **Closed 2026-07-29**: PO confirmed resend does **not** extend `expires_at`; a day-6 resend produces a link with 1 day of life. The shortener mirrors the invitation | PO / Backend | Nothing — resolved |
| 3 | **Dead config** — `INVITATION_EXPIRY_HOURS = 72` (`config/settings/base.py:477`) is unread; live value is `US005_INVITATION_EXPIRY_DAYS = 7`. Remove or align before it misleads someone | Backend | Nothing — but fix it before someone "fixes" the shortener against the wrong number |
| 4 | Short domain hostname and DNS ownership (AUTH-01 Open Question 4) | PO / DevOps | **Step 8.** `SHORTLINK_BASE_URL` is the only place it appears in the service |
| 5 | TLS certificate for the short domain (separate cert or SAN) | DevOps | **Step 8** |
| 6 | **Aggregator policy on shortened links** — confirm the SMS provider permits them at all, and allowlist the domain before wire-up. External lead time | DevOps / PO | **Step 8** |
| 7 | Second consumer's scopes, base domains and `allowed_link_types` once identified. **If DFMS Django remains the only consumer**, the RS256/`api_client` layer guards a caller inside our own VPC — decide whether it is worth keeping | Architecture | Nothing — it is built and costs nothing to keep; the decision is now whether to *remove* it, not whether to build it |
| 8 | ~~No phone channel exists on the invitation~~ — **Closed 2026-07-29**: PR #87 (`sprint-7/user-invitation-through-phone`) added `invite_channel`, `phone_number`, `OtpType.PHONE` and the SMS send/resend paths | Backend / PO | Nothing — resolved |
| 9 | Dangling-CNAME monitoring on the `dfms.com` zone — the residual risk accepted by base-domain matching (D6) | DevOps / Security | Nothing — but it is the mitigation the built suffix match relies on |
| 10 | Whether the expired-link page offers self-service "request a new invitation" | PO | Nothing — the 410 page is built and tenant-neutral; adding a link is a copy change in `linkshort/api/pages.py` |
| 11 | **Rejected alternative on record:** a 10-char single-use activation code on `InvitationToken` gives `https://nourish.dfms.com/a/aB7xK2pQ` (~36 chars vs ~26) with no new service, no new domain, no aggregator allowlisting, and no token stored in a second database. It loses the multi-consumer platform argument — which Open Item 7 already treats as unproven | Architecture / PO | Nothing yet. **This is the last cheap moment to take it**: the service exists but nothing depends on it, so choosing the alternative costs one deleted directory rather than an unwind. Items 4, 5 and 6 — the external, slow, unstarted ones — disappear with it |

---

## Related Documents

- [AUTH-01 — Phone Login, Phone 2FA & SMS Invitation](../../03-backlog/sprints/sprint-7/01-auth-phone-channel/AUTH-01-phone-login-2fa-sms-invitation.md)
- [user-tenant-management.md](../01-foundation/user-tenant-management.md) — invitation lifecycle, multi-tenancy
- [authentication-security.md](../01-foundation/authentication-security.md) — OTP, MFA
- [security-compliance.md](security-compliance.md) — tenant isolation standards
- [integration-requirements.md](integration-requirements.md) — SMS gateway integration
- [`services/link-shortener/README.md`](../../../services/link-shortener/README.md) —
  operational detail for the built service: running it, the CLI, key rotation, and the same
  deviation list

---

**Last Updated**: 2026-07-28 — reconciled with the implementation. Build Order steps 1–5 and
the sweeper half of step 7 are built and verified at `services/link-shortener/`; steps 0, 6,
8 and the DFMS webhook receiver are not started. Four implementation deviations recorded
(V1 signature-before-nonce, V2 `503` on Redis loss, V3 no analytics for unknown codes, V4
non-ASCII targets rejected), and the API, config, Redis key map and deployment sections
updated to match the code. Open Items regained a "blocks" column — all eleven are still
open, and Item 11 is called out as now-or-never.

Prior revision (same day) — engineering review: per-endpoint API spec with explicit
Postgres/Redis read-write paths and a Redis key map; advisory lock on `supersede`;
revoked-replay contract; `resend_count`-derived idempotency key; ciphertext caching and log
scrubbing for `target_url`; DFMS schema prerequisites promoted to Build Order step 0.

**Status**: Service built and verified — DFMS integration outstanding (Sprint 7,
AUTH-01-3, AUTH-01-4)
