---
module: 12-users
specification: Driver Domain (User on Create)
version: 1.3
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
related_stories: US-004, US-005, US-052, US-057
last_updated: 2026-04-09
---

# Driver Domain Specification

## Overview

Fleet and compliance features use a **`Driver`** aggregate (outside `apps.master_data`). **On every driver creation**, the system **persists a row in the tenant `users` table** with a fixed operational profile, then links **`Driver.user_id`** to that user. Field-level detail for `User` lives in [User & Tenant Management](user-tenant-management.md) and [RBAC](rbac.md); this spec defines **what must be written at driver-create time** and **what stays on `Driver`**.

**Out of scope here**: **Invitation**, activation tokens, OTP, resend, and expiry—those follow a **separate invitation implementation plan** (US-005 / TUM) and are **not** part of the driver creation contract below.

**Separation of concerns**

| Concern | Owned by |
|--------|----------|
| **`User` row** on create: name, role, department, phone, employee id | **Identity / users** module — invoked in the **same transaction** as `Driver` insert |
| License, documents, fleet state, trip FKs | **`Driver`** module & `Driver` model |
| Invitation & activation workflows | **Separate implementation plan** (not this document) |

---

## 1. User row written when creating a driver

When **`Driver`** is created (single `POST` or bulk row), the implementation **must** insert (or delegate to) a **`User`** with at least:

| Field | Value / rule |
|-------|----------------|
| `first_name` | From request (or parsed from bulk row) |
| `last_name` | From request (or parsed from bulk row) |
| **Role** | **Driver** (system role id or slug per RBAC) |
| **Department** | **Operations** (fixed for drivers unless product later allows overrides) |
| `phone_number` | Same as driver contact channel; E.164 where applicable |
| `employee_id` | Unique per tenant; enforced with `Driver` / HR rules |

Additional user fields (email, status `Pending` vs `Active`, etc.) follow the global user model and **invitation plan**—this spec does **not** mandate invitation timing or email delivery on create.

**Transactional rule**: **`Driver.user_id`** is set to the new user’s id in the **same database transaction** as the `User` insert and `Driver` insert (or fail all). No “driver without user” state for the happy path.

---

## 2. Driver entity

The **`Driver`** record holds US-057 compliance and fleet fields. Naming: model/table **`Driver`**.

```typescript
Driver {
  driver_id: UUID
  tenant_id: UUID

  // Required link — set when User row is created
  user_id: UUID

  // Contact (align with User.phone_number; duplicate allowed for read-only denorm or single source of truth on User)
  contact_number: string              // E.164; unique per tenant
  email: string | null

  // Employment / HR (employee_id may live on User only; if duplicated here, keep in sync)
  driver_type: enum ['Permanent', 'Temporary', 'Own', 'Vendor']

  // License & compliance
  driving_license_number: string   // Unique per tenant
  license_type: string
  license_expiry_date: Date
  national_id_number: string | null

  reference_contact_1: string | null
  reference_contact_2: string | null
  accident_history: string | null
  last_training_assessment_info: string | null
  address: string | null

  experience_certificate: Attachment | null
  biodata: Attachment | null
  medical_certificate: Attachment | null
  medical_certificate_expiry_date: Date | null

  is_active: boolean
  current_state: enum ['Available', 'Assigned', 'On Leave']

  created_by: UUID
  created_at: DateTime
  updated_by: UUID
  updated_at: DateTime
}
```

**Rules**

1. **Uniqueness** (per tenant): `contact_number`, `driving_license_number`, `national_id_number` (when set), and **`employee_id`** on **`User`**.
2. **Foreign keys** from trips, gate, and vehicle assignment use **`driver_id`**.
3. **`user_id`** is **mandatory** after successful create; resolve display name via **`User.first_name` / `User.last_name`** (or a read model).

---

## 3. Creation workflow (single + bulk)

### 3.1 Single create

1. Client sends **driver + user** payload: `first_name`, `last_name`, `phone_number`, `employee_id`, plus `Driver` fields (license, type, etc.).
2. **Service layer** (single use-case):
   - Validate tenant, RBAC, uniqueness.
   - **Create `User`** with Role = Driver, Department = Operations, and the fields above.
   - **Create `Driver`** with `user_id` set and compliance fields.
   - Commit transaction.
3. **Invitation** (if any) is **not** triggered here unless the separate invitation plan explicitly hooks post-create; default is **user record exists, invitation handled elsewhere**.

### 3.2 Bulk create

- CSV or batch API: each row maps to the same **User + Driver** pair per row.
- Row-level validation; failed rows reported without aborting valid rows if product allows partial success.

---

## 4. Invitation (out of scope — separate plan)

Sending activation email, SMS, or in-app invite, **resend**, **revoke**, and token lifecycle are documented under **User invitation & activation** (e.g. TUM / US-005) and **not** repeated here. Driver APIs may later expose **“Invite”** actions that only invoke that plan by `user_id`—implementation belongs to the invitation workstream.

---

## 5. State, Vehicle Assignment, Performance

- **State machine** and **vehicle assignment** use **`driver_id`**.
- **Assignment history**: `driver_id`, `vehicle_id`, start/end, `assigned_by`.
- **Performance metrics**: By `driver_id`.

See [Master Data Configuration](../02-master-data/master-data-configuration.md) §3.

---

## 6. Documents & Expiry Alerts

- Documents attach to **`Driver`** (or `DriverDocument` keyed by `driver_id`).
- **Cron**: license and medical expiry queries on `Driver`.

---

## 7. API design (implementation plan)

**Primary surface**: `/api/v1/drivers`. Create payload **includes** user fields required for the `User` row (`first_name`, `last_name`, `phone_number`, `employee_id`) plus driver/compliance fields.

### 7.1 Driver CRUD & list

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers` | Create **`User`** (Driver role, Operations dept) + **`Driver`** in one transaction |
| `GET` | `/api/v1/drivers` | List; include `first_name`/`last_name` from join or nested `user` |
| `GET` | `/api/v1/drivers/{driver_id}` | Detail + linked `user` summary |
| `PATCH` | `/api/v1/drivers/{driver_id}` | Update driver fields; **user** name/phone/employee_id updates if policy allows (same service or delegated) |
| `PATCH` | `/api/v1/drivers/{driver_id}/status` | `is_active`, `current_state` |

### 7.2 Bulk import

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/import` | Each row creates **User + Driver** as in §3.2 |
| `GET` | `/api/v1/drivers/import/template` | Headers for user + driver columns |

### 7.3 Documents, leave, performance, compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/{driver_id}/documents` | Multipart upload |
| `GET` | `/api/v1/drivers/{driver_id}/documents` | List / metadata |
| `DELETE` | `/api/v1/drivers/{driver_id}/documents/{document_id}` | Remove attachment |
| `POST` | `/api/v1/drivers/{driver_id}/leave` | On Leave |
| `GET` | `/api/v1/drivers/{driver_id}/performance` | Aggregates |
| `GET` | `/api/v1/drivers/expiring-documents` | `days` query param |

---

## 8. Integration points

| Area | Integration |
|------|-------------|
| RBAC (US-004) | **Driver** role and **Operations** department set on **User** at create |
| Invitation (US-005) | **Separate** implementation plan; may reference `user_id` created here |
| Trips / TO / Gate | FK **`driver_id`** |
| Driver mobile (US-052) | Authenticates as **`User`** linked via `Driver.user_id` |
| Audit | Driver + user create audited per platform rules |

---

## 9. Unit & integration testing strategy

### 9.1 Unit tests (driver + user create)

- **Transaction**: Mock **User** repository and **Driver** repository; assert **both** called once, `user_id` wired on `Driver`.
- **Validation**: Duplicate `employee_id`, `phone_number`, license across tenant; invalid formats.
- **Defaults**: Role = Driver, Department = Operations on every create path.

### 9.2 Unit tests (bulk import)

- Row failures: duplicate employee on row 3; rows 1–2 succeed with two user+driver pairs.
- Partial commit policy matches product.

### 9.3 Non-goals in driver module tests

- **Invitation** flows, OTP, email templates — tested under **invitation implementation plan**.

---

## 10. Related documentation

- [User & Tenant Management](user-tenant-management.md)
- [RBAC](rbac.md)
- [Master Data Configuration](../02-master-data/master-data-configuration.md)
- [US-057 — Driver story](../../../04-backlog/stories/US-057-driver-master-data.md)
- Invitation implementation (separate): tenant user management / TUM backlog

---

**Source**: Driver creation **creates `User`** (first/last name, Driver role, Operations department, phone, employee id) **with** `Driver`; invitation is **not** specified here.
