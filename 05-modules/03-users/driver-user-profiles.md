---
module: 12-users
specification: Driver Domain (User on Create)
version: 1.4
phase: Phase 1
source_document: PRD_DFMS_v1.0.md
related_stories: US-004, US-005, US-052, US-057
last_updated: 2026-04-17
---

# Driver Domain Specification

## Overview

Fleet and compliance features use a **`Driver`** aggregate in **`apps.users`** (outside `apps.master_data`). **On every driver creation**, the system **persists a row in the tenant `users` table** with a fixed operational profile, then links **`Driver.user`** (OneToOne FK) to that user. Field-level detail for `User` lives in [User & Tenant Management](user-tenant-management.md) and [RBAC](rbac.md); this spec defines **what must be written at driver-create time** and **what stays on `Driver`**.

**Out of scope here**: **Invitation**, activation tokens, OTP, resend, and expiry—those follow a **separate invitation implementation plan** (US-005 / TUM) and are **not** part of the driver creation contract below.

**Separation of concerns**

| Concern | Owned by |
|--------|----------|
| **`User` row** on create: name, role, department, phone, employee id | **Identity / users** module — invoked in the **same transaction** as `Driver` insert |
| License, documents, fleet state, trip FKs | **`Driver`** module & `Driver` model |
| Invitation & activation workflows | **Separate implementation plan** (not this document) |

---

## Implementation status (nourish-backend)

| Topic | Behaviour in code |
|--------|---------------------|
| **Model** | **`users.Driver`**: `user` **OneToOne** to **`users.User`**; **`permanent_vehicle`** optional FK to **`master_data.Vehicle`**; compliance fields (`driving_license_number`, `license_type`, `license_expiry_date`, …); **`FileField`** document uploads; **`current_state`** / **`driver_type`** use **lowercase** enum values in DB (e.g. `available`, `permanent`). |
| **Admin create** | **`DriverAdmin.save_model`** creates **`User`** (inactive, unusable password), assigns **Driver** role + **Operations** department via **`UserRole`**, may send **invitation** (`create_invitation_for_provisioned_user`), then saves **`Driver`** linked to that user — **this is the primary “User + Driver in one transaction” path** today. |
| **REST API** | **`GET/POST/PATCH … /api/v1/drivers/`** via **`master_data.views.DriverViewSet`**; **`DriverSerializer`** is a thin **`ModelSerializer`** (`fields = "__all__"`). **List queryset** filters **`is_active=True`** only. **Nested User+Driver creation** as a single API payload is **not** implemented in the serializer — use **admin** or **CSV bulk import** for the full provisioning flow unless a dedicated create serializer is added later. |
| **Bulk CSV** | **`DriverImportConfig`** in **`apps/users/import_configs.py`** registers **`IMPORT_REGISTRY["driver"]`**. Columns include **`user_email`**, **`first_name`**, **`last_name`**, **`employee_id`**, **`contact_number`**, optional **`email`** (driver row), **`driver_type`**, **`driving_license_number`**, **`license_type`**, **`license_expiry_date`**, optional **`national_id_number`**, optional **`is_active`**. Upserts by license; creates/links **`User`** and may enqueue **invitation** per row rules. Django admin: **`/admin/users/driver/import/`**. Shared bulk API: **`/api/v1/bulk-imports/`** with `model_name=driver` — see **[bulk-import-export.md](../02-master-data/bulk-import-export.md)**. |
| **Search fields on ViewSet** | Declared as `full_name`, `employee_code`, … — align with model field names if you extend the API (Driver stores name on **`User`**, not `full_name` on **`Driver`**). |

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

**Transactional rule**: **`Driver.user_id`** (via **`Driver.user`**) is set to the new user’s id in the **same database transaction** as the `User` insert and `Driver` insert (or fail all). No “driver without user” state for the happy path.

---

## 2. Driver entity

The **`Driver`** record holds US-057 compliance and fleet fields. Naming: model/table **`Driver`**.

```typescript
Driver {
  id: UUID
  tenant_id: UUID

  // Required link — OneToOne User (column user_id)
  user_id: UUID

  // Optional fleet link (implementation)
  permanent_vehicle_id: UUID | null   // FK to master_data.Vehicle

  // Contact (align with User.phone_number)
  contact_number: string              // unique per tenant
  email: string | null

  driver_type: enum ['permanent', 'temporary', 'own', 'vendor']  // DB values; labels Title Case in UI

  driving_license_number: string   // Unique per tenant
  license_type: string
  license_expiry_date: Date
  national_id_number: string | null  // unique when set

  reference_contact_1: string | null
  reference_contact_2: string | null
  accident_history: string | null
  last_training_assessment_info: string | null
  address: string | null

  experience_certificate: File | null
  biodata: File | null
  medical_certificate: File | null
  medical_certificate_expiry_date: Date | null

  is_active: boolean
  current_state: enum ['available', 'assigned', 'on_leave']

  created_by: UUID | null
  created_at: DateTime
  updated_by: UUID | null
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

See **[bulk-import-export.md](../02-master-data/bulk-import-export.md)** (shared **`IMPORT_REGISTRY`**, **`driver`** key) and **[master-data-configuration.md](../02-master-data/master-data-configuration.md)**.

---

## 6. Documents & Expiry Alerts

- Documents attach to **`Driver`** (or `DriverDocument` keyed by `driver_id`).
- **Cron**: license and medical expiry queries on `Driver`.

---

## 7. API design (implementation plan)

**Read/list/create surface**: **`/api/v1/drivers/`** (`apps.master_data.views.DriverViewSet`). **Full User+Driver provisioning** is implemented in **Django admin** and **CSV import** (see **Implementation status** above), not necessarily as a single nested POST body on the ViewSet.

### 7.1 Driver CRUD & list

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/drivers/` | Creates **`Driver`** with **`user`** FK — typically requires an existing **`User`** id unless extended |
| `GET` | `/api/v1/drivers/` | List (**active drivers only** in current `get_queryset`) |
| `GET` | `/api/v1/drivers/{id}/` | Detail |
| `PATCH` | `/api/v1/drivers/{id}/` | Partial update |
| `DELETE` | `/api/v1/drivers/{id}/` | Per DRF / model behaviour |

### 7.2 Bulk import

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/bulk-imports/` | Multipart upload; body includes target model (e.g. **`model_name`: `driver`**) — see **[bulk-import-export.md](../02-master-data/bulk-import-export.md) §10** |
| Django admin | `/admin/users/driver/import/` | Same pipeline as other bulk-enabled models; template/sample CSV from import config |

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
- [US-057 — Driver story](../../../03-backlog/stories/US-057-driver-master-data.md)
- Invitation implementation (separate): tenant user management / TUM backlog

---

**Source**: Driver creation **creates `User`** (first/last name, Driver role, Operations department, phone, employee id) **with** `Driver`; invitation is **not** specified here.
