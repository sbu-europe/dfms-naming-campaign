---
module: 07-audit
document: Entity audit log — implementation plan
version: 0.1
status: Draft
---

# Entity audit log — implementation plan

**Scope:** Central, append-only audit table **per tenant** (PostgreSQL schema); no third-party audit packages; Django Admin first, REST API in a later phase.

---

## 1. Goals and non-goals

### Goals

- Persist **who** changed **what**, **when**, with **old/new** values for create, update, soft-delete (deactivate), and hard delete where applicable.
- **One logical table per tenant**, aligned with django-tenants schema isolation.
- **Single write path** for **Django Admin** and **future API** ViewSets (no duplicated audit logic).
- Extensible to **many entity types** (Supplier, Dealer, Helper, POI, Vehicle, Product, …) without a separate audit table per entity.

### Non-goals (initial phase)

- Cryptographic tamper-evidence (optional hardening later).
- Cross-tenant audit reporting in a single SQL query (platform analytics may aggregate separately).
- Replacing **platform** `PlatformAuditLog` (public schema) for super-admin tenant lifecycle events — that remains a separate concern.

---

## 2. Architecture summary

| Layer | Responsibility |
|--------|----------------|
| **`EntityAuditLog` model** | Append-only rows in **tenant schema** (`TENANT_APPS`). |
| **`audit` module** | `record()`, field diff, JSON-safe serialization. |
| **Domain services** | `create_*`, `update_*`, `delete_*` per audited model; call `record()` after successful DB write. |
| **Django Admin** | `ModelAdmin` delegates to services (`save_model`, `delete_model`). |
| **REST API (later)** | ViewSets call the **same** services. |
| **Bulk import (later)** | Job-level audit + optional row-level entries per policy. |

---

## 3. Data model

### 3.1 Placement

- Define the model in a **tenant app** (e.g. `apps.audit` in `TENANT_APPS`).
- Produces **one physical table per tenant schema** (e.g. `entity_audit_logs`).

### 3.2 Suggested fields

| Field | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | `default=uuid.uuid4`. |
| `created_at` | `DateTimeField(auto_now_add=True)` | Indexed; immutable. |
| `actor` | FK → `users.User`, `null=True` | Null only for system jobs with explicit `source`. |
| `action` | Char choices | `create`, `update`, `delete` (deactivate = `update` on `is_active`). |
| `entity_type` | `CharField` | Stable slug: `supplier`, `dealer`, `helper`, `poi`, `vehicle`, `product`, … |
| `object_id` | UUID | Primary key of the affected row. |
| `changes` | `JSONField` | Per-field `old` / `new`; or snapshot shape for create/delete. |
| `source` | `CharField`, optional | `admin`, `api`, `bulk_import`, `system`. |
| `request_id` | UUID or string, optional | Correlation with request middleware. |
| `metadata` | `JSONField`, optional | Bulk job id, filename, error summaries. |

### 3.3 Indexes

- `(entity_type, object_id, created_at DESC)` — history for one entity.
- `(actor_id, created_at DESC)` — activity by user.

### 3.4 Immutability

- Application code does not update or delete audit rows; Django Admin read-only for `EntityAuditLog`.

---

## 4. Audit module (code layout)

### 4.1 Responsibilities

1. **`snapshot(instance)`** — Dict of field → JSON-serializable value.
2. **`compute_diff(old, new)`** — `{"field": {"old": ..., "new": ...}}` for changed fields only.
3. **`serialize_value(value)`** — UUID, `Decimal`, dates, FK ids.
4. **`record(...)`** — Insert `EntityAuditLog`.

### 4.2 Excluded fields (policy)

- Optional: omit `updated_at` if it adds noise on every save.
- Omit secrets or large blobs from snapshots.

### 4.3 Registry (optional)

- Map `entity_type` → model class for validation and API documentation.

---

## 5. Request context (actor)

- Reuse or extend request-scoped middleware (e.g. alongside existing `request_id`).
- **Admin:** pass `request.user` explicitly from `save_model` / `delete_model`.
- **Celery / commands:** `actor=None`, `source=system`, or a service account user.

---

## 6. Domain services (single write path)

For each audited entity (prioritize **Supplier**, **Dealer**, then expand to **Helper**, **POI**, **Vehicle**, **Product**, etc.):

- `create_<entity>(*, actor, data, source=...)`
- `update_<entity>(*, object_id, actor, data, source=...)`
- `delete_<entity>(*, object_id, actor, source=...)` — per soft/hard delete rules.

Each function: load old state → persist → `audit.record()` with `action`, `entity_type`, `object_id`, `changes`.

**Rule:** Prefer services as the **only** place that writes audit rows for user-driven changes; avoid duplicate logging via signals unless migrations/shell are explicitly excluded.

---

## 7. Django Admin mapping

| Hook | Behavior |
|------|----------|
| `save_model` | `change` → `update_*`; else `create_*`. |
| `delete_model` | `delete_*` (or dedicated hard-delete if spec requires). |
| `EntityAuditLog` admin | Read-only; filters on `entity_type`, `action`, `actor`, `created_at`. |

---

## 8. REST API (later phase)

- ViewSets delegate to the **same** services.
- List/filter audit: `entity_type`, `object_id`, `actor`, date range; paginated.
- RBAC aligned with Tenant Admin / auditor roles.

---

## 9. Bulk upload

- **Minimum:** one audit row per job (`source=bulk_import`, `metadata` with counts and errors).
- **Stricter:** one row per created record — align with retention and performance.

---

## 10. Migrations and django-tenants

- Ship migration(s) for `EntityAuditLog` in the tenant app.
- Apply with **`migrate_schemas`** so **all tenant schemas** get the table.
- New-tenant onboarding must run tenant migrations per existing project process.

---

## 11. Testing

| Area | Focus |
|------|--------|
| Diff / serialization | Unit tests for edge types. |
| `record()` | Integration: row shape and JSON content. |
| Services | Create/update → business row + audit row. |
| Isolation | Audit rows visible only in correct tenant schema. |

Coverage target: align with module testing strategy (e.g. ≥85% for audit module and services).

---

## 12. Phased rollout

| Phase | Deliverables |
|--------|----------------|
| **P1** | `EntityAuditLog` model + migration + `record()` + diff helpers. |
| **P2** | Supplier + Dealer services + admin wiring + read-only audit admin. |
| **P3** | Deploy/CI notes for `migrate_schemas`; QA on multi-tenant DBs. |
| **P4** | Extend to other master data entities (Helper, POI, Vehicle, Product). |
| **P5** | REST API uses services; audit list endpoint + permissions. |
| **P6** | Bulk import audit (job-level + optional row-level). |

---

## 13. Risks and mitigations

| Risk | Mitigation |
|------|------------|
| Double logging | Single path via services; review for signal overlap. |
| Oversized JSON | Truncate or summarize long text in `changes` (policy). |
| Performance | Indexes on `object_id` / `created_at`; batch inserts for bulk if needed. |

---

## 14. Open decisions

- [ ] Hard delete: always log full "before" snapshot vs. soft-delete only in v1.
- [ ] Retention and archival (e.g. after N years).
- [ ] Whether `updated_at` is included in diffs.

---

## 15. Cross-module integration

This audit system will track changes for entities across multiple modules:

- **Master Data** (02): Supplier, Dealer, POI, Vehicle, Driver, Helper, Product, ProductCategory, Route, Zone
- **Requisitions** (03): Transport Requisitions (if audited)
- **Transport** (04): Transport Orders (if audited)
- **Quality** (05): QC records (if audited)
- **Operations** (06): Gate entries (if audited)

Each module's services will call `apps.audit.record()` with the appropriate `entity_type`.

---

## Document history

| Version | Date | Notes |
|---------|------|--------|
| 0.1 | 2026-04-09 | Initial plan as standalone audit module |
