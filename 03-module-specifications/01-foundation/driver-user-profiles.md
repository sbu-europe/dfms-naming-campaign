---
module: 01-foundation
specification: Driver Domain (Create → Invite → User Link)
version: 1.1
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
related_stories: US-004, US-005, US-052, US-057
last_updated: 2026-04-09
---

# Driver Domain Specification

## Overview

Fleet and compliance features work with a first-class **`Driver`** aggregate in the application layer (implemented outside `apps.master_data`—e.g. `apps.drivers` or `apps.fleet` co-located with identity integration). **This specification does not define the `User` entity**; that remains in [User & Tenant Management](user-tenant-management.md) and [RBAC](rbac.md).

**Separation of concerns**

| Concern | Owned by |
|--------|----------|
| Driver master fields, documents, fleet state, trip FKs | **Driver** module & `Driver` model |
| Credentials, invitation tokens, activation, OTP, session | **Identity / users** module (invoked only from the invite step) |

**End state**: A driver who has completed invitation has a **linked tenant `User`** with the **Driver** role (US-004, US-052). Until invite completes, `Driver` exists **without** a user—transport planners can register data and invite later.

---

## 1. Driver Entity

The **`Driver`** record holds every field required by US-057 (personal, license, compliance, attachments, operational state). Naming in code: model/table **`Driver`** (not `DriverUserProfile`).

```typescript
Driver {
  driver_id: UUID
  tenant_id: UUID

  // Optional link after successful invitation (null until invited & linked)
  user_id: UUID | null

  // Identity & contact (stored on Driver; copied/synced to User on invite as needed)
  full_name: string
  contact_number: string              // E.164; unique per tenant
  email: string | null               // Used for invitation when provided

  // Employment / HR
  employee_id: string                // Unique per tenant
  driver_type: enum ['Permanent', 'Temporary', 'Own', 'Vendor']

  // License & compliance
  driving_license_number: string     // Unique per tenant
  license_type: string
  license_expiry_date: Date
  national_id_number: string | null // Unique per tenant when set

  // Optional text / refs
  reference_contact_1: string | null
  reference_contact_2: string | null
  accident_history: string | null
  last_training_assessment_info: string | null
  address: string | null

  // Attachments (storage keys / file FKs)
  experience_certificate: Attachment | null
  biodata: Attachment | null
  medical_certificate: Attachment | null
  medical_certificate_expiry_date: Date | null

  // Invitation & access
  invitation_status: enum ['NotInvited', 'Pending', 'Active', 'Expired']
    // NotInvited: no user / no invite sent
    // Pending: invite sent, user not yet activated
    // Active: user linked and can authenticate (when product requires it)
    // Expired: optional; invitation lapsed, may re-invite

  // Operational state (fleet)
  is_active: boolean                 // Eligible for dispatch when true
  current_state: enum ['Available', 'Assigned', 'On Leave']

  // Metadata
  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

**Rules**

1. **Uniqueness** (per tenant): `employee_id`, `contact_number`, `driving_license_number`, and `national_id_number` (when present)—enforced on `Driver`.
2. **Foreign keys** from trips, gate, and vehicle assignment use **`driver_id`** as the stable operational identifier.
3. **`user_id`** is set only by the **invite / provisioning service** after `User` creation; driver CRUD does not require identity knowledge beyond optional email/phone for the invite channel.

---

## 2. Lifecycle: Create → Invite (two phases)

### 2.1 Phase A — Create driver (no User)

**Who**: Transport Planner / Tenant Admin (per RBAC).

**How**

- **Single**: Multi-step or single form capturing all required story fields; `POST` creates `Driver` with `invitation_status = NotInvited`, `user_id = null`.
- **Bulk**: CSV import (`POST …/import`) creates many `Driver` rows with the same defaults; row-level validation and partial success policy as per product rules.

**Validation**: Domain validators only (formats, uniqueness, required fields, license expiry policy). **No** call to the identity service in this phase.

**Outcome**: Drivers appear in the **driver list**; they can be edited, deactivated, and assigned **subject to business rules** (e.g. some operations may require `invitation_status = Active` before mobile login—product decision; dispatch may use `driver_id` regardless).

### 2.2 Phase B — Invite (User creation in service layer)

**Who**: Same roles; action from **list** or **detail** screen.

**UI**

- Select **one** driver → **Invite**.
- **Bulk**: multi-select drivers → **Invite selected** (or equivalent).

**Service layer (orchestration)**

1. Load `Driver` rows; skip or fail those already `invitation_status = Active` with a clear per-id result (idempotent: re-invite may reset token only if product allows).
2. For each candidate, call **identity / user provisioning** (implementation detail—**not** specified here): create or resolve `User`, assign **Driver** role, set `Driver.user_id`, set `invitation_status` to `Pending`, trigger invitation channel per [User & Tenant Management](user-tenant-management.md) (US-005).
3. On activation completion (existing user pipeline), transition `invitation_status` → `Active`.

**Failure handling**: Partial failure on bulk invite returns per-`driver_id` errors (e.g. user limit, duplicate email in identity). **Do not** leave `Driver` half-linked without a defined transaction boundary.

**Idempotency**: `POST …/invite` with same `driver_id` should be safe (no duplicate users; optional resend of invitation).

---

## 3. State, Vehicle Assignment, Performance

- **State machine** and **vehicle assignment** reference **`driver_id`**.
- **Assignment history**: `driver_id`, `vehicle_id`, start/end, `assigned_by`.
- **Performance metrics**: Aggregated by `driver_id` (and optionally joined to `user_id` for reporting when present).

See [Master Data Configuration](../02-master-data/master-data-configuration.md) §3 and [Fleet Driver Management](../06-fleet-management/driver-management.md).

---

## 4. Documents & Expiry Alerts

- Documents attach to **`Driver`** (or normalized `DriverDocument` table keyed by `driver_id`).
- **Cron**: query `Driver` for license and medical expiry within threshold; notify roles per alert design.

---

## 5. API Design (Implementation Plan)

**Resource-oriented**: `/api/v1/drivers` as the primary surface. Identity remains under `/api/v1/users/...` for generic user management; **invite** may be exposed only as driver actions below.

### 5.1 Driver CRUD & list

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers` | Create Driver (Phase A); body = story fields; no User creation |
| `GET` | `/api/v1/drivers` | List with filters (`status`, `driver_type`, `invitation_status`, `search`, pagination) |
| `GET` | `/api/v1/drivers/{driver_id}` | Detail including documents metadata and optional `user_id` |
| `PATCH` | `/api/v1/drivers/{driver_id}` | Partial update (driver fields only) |
| `PATCH` | `/api/v1/drivers/{driver_id}/status` | `is_active`, `current_state` (RBAC-guarded) |

### 5.2 Bulk import (Phase A)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/import` | CSV bulk create; append-only; row-level errors in response |
| `GET` | `/api/v1/drivers/import/template` | CSV headers aligned to `Driver` |

### 5.3 Invitation (Phase B)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/{driver_id}/invite` | Triggers provisioning; identity service creates/links User + Driver role |
| `POST` | `/api/v1/drivers/invite` | Bulk invite: body `{ "driver_ids": UUID[] }` (or `POST …/bulk-invite` alias) |

**Response shape (bulk)**: e.g. `{ "results": [{ "driver_id", "status": "ok|error", "detail": "..." }] }`.

### 5.4 Documents, leave, performance, compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/{driver_id}/documents` | Multipart upload |
| `GET` | `/api/v1/drivers/{driver_id}/documents` | List / metadata |
| `DELETE` | `/api/v1/drivers/{driver_id}/documents/{document_id}` | Remove attachment |
| `POST` | `/api/v1/drivers/{driver_id}/leave` | On Leave with date range |
| `GET` | `/api/v1/drivers/{driver_id}/performance` | Aggregates |
| `GET` | `/api/v1/drivers/expiring-documents` | Query param `days` (e.g. 30) |

### 5.5 Implementation notes

- **Controllers** stay thin; **domain services** own `Driver` invariants; **invite** delegates to an **IdentityPort** / **UserProvisioningService** interface so unit tests mock identity.
- **No** requirement to expose raw `User` creation on driver APIs beyond what invite orchestrates.

---

## 6. Integration Points

| Area | Integration |
|------|-------------|
| RBAC (US-004) | Driver role assigned only during invite provisioning |
| Identity (US-005) | Invitation email/OTP flows; **not** duplicated in driver spec |
| Trips / TO / Gate | FK **`driver_id`** → `Driver` |
| Driver mobile (US-052) | Login as `User`; app resolves `Driver` via `user_id` when `invitation_status = Active` |
| Audit | Driver lifecycle events; invite events may duplicate user audit or cross-reference |

---

## 7. Unit & Integration Testing Strategy

### 7.1 Unit tests (Driver domain — no DB or mocked repos)

- **Create**: Required fields, uniqueness (`employee_id`, `contact_number`, `license`, NID), invalid formats, default `invitation_status` / `user_id`.
- **Update**: Partial patch; cannot set `user_id` via public API (only via provisioning hook or internal).
- **State**: `current_state` transitions; guards when `is_active = false`.
- **Bulk import**: Parse errors, row-level failures, tenant scoping.

### 7.2 Unit tests (Invite orchestration — mock IdentityPort)

- **Invite single**: Happy path sets `user_id`, `invitation_status`; identity failure rolls back or leaves driver unchanged per transaction policy.
- **Bulk invite**: Partial success array; skip already-`Active` drivers.
- **Idempotency**: Second invite does not create duplicate users (mock asserts single call).

### 7.3 Integration tests (optional layer)

- API → DB for `Driver` CRUD and import.
- Invite with **test double** or sandbox identity service.

### 7.4 Non-goals in driver module tests

- Do **not** implement or test full **User** entity, password hashing, or OTP in the driver module—those belong to identity/user tests.

---

## 8. Related Documentation

- [User & Tenant Management](user-tenant-management.md)
- [RBAC](rbac.md)
- [Master Data Configuration](../02-master-data/master-data-configuration.md)
- [US-057 — Driver story](../../../04-backlog/stories/US-057-driver-master-data.md)
- US-057: `04-backlog/stories/US-057-driver-master-data.md`

---

**Source**: Evolved from driver-as-user-only docs to **Driver-first** domain with **invite** as the bridge to identity (create → invite).
