# Admin Schema Access Control

## Overview

DFMS uses `django-tenants` for multi-tenancy. Every HTTP request is routed to
either the **platform admin** (`admin.dfms.com`) or a **tenant admin**
(`<tenant>.dfms.com`). PostgreSQL's `search_path` ensures queries are isolated
to the active schema — a tenant admin can never read another tenant's data.

Django's admin interface runs on both schemas. To prevent confusion and
accidental cross-schema exposure, every `ModelAdmin` is tagged with one of two
mixins that control visibility based on the active schema at request time.

---

## Schema Architecture

It is important to understand the distinction between the **shared schema**
and the **platform tenant schema**:

| Schema | Role | Domain | Contents |
|--------|------|--------|----------|
| `public` | django-tenants shared schema | `localhost` | `Tenant` & `Domain` tables + all `SHARED_APPS` models (Permission, Role, auth.Group, celery_beat schedules) |
| `platform` | Platform admin tenant | `admin.dfms.com` | `TENANT_APPS` tables for platform staff (users, etc.) |
| `nourish` | Tenant | `nourish.dfms.com` | `TENANT_APPS` tables for Nourish Poultry |
| `<name>` | Any tenant | `<name>.dfms.com` | `TENANT_APPS` tables for that tenant |

**search_path behaviour:** When `admin.dfms.com` is accessed, django-tenants
sets `search_path = 'platform', 'public'`. This means:
- `TENANT_APPS` tables are resolved in `platform`
- `SHARED_APPS` tables (Tenant, Domain, Permission, etc.) fall through to
  `public` automatically — no special queryset override needed

The `PLATFORM_SCHEMA = "platform"` constant in `apps/core/admin.py` correctly
identifies the platform admin context. Do **not** change it to `"public"`.

---

## The Two Mixins

Both mixins live in `apps/core/admin.py`.

### `PlatformOnlyAdminMixin`

Hides a model **everywhere except the platform admin**.

```python
class PlatformOnlyAdminMixin:
    # Returns all-False perms on any non-platform schema
    def get_model_perms(self, request): ...
    def has_view_permission(self, request, obj=None): ...
    # ... + add / change / delete / get_queryset
```

Apply to: models that live in `SHARED_APPS` (platform schema only) and should
only be managed by the platform super admin.

### `TenantOnlyAdminMixin`

Hides a model **on the platform admin**, visible only in tenant admins.

```python
class TenantOnlyAdminMixin:
    # Returns all-False perms on the platform schema
    def get_model_perms(self, request): ...
    def has_view_permission(self, request, obj=None): ...
    # ... + add / change / delete / get_queryset
```

Apply to: models that live in `TENANT_APPS` (each tenant's schema) and should
only be managed within that tenant's admin.

---

## Access Matrix

| App | Model | Schema | Mixin | Visible in |
|-----|-------|--------|-------|------------|
| `apps.tenants` | `Tenant` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `apps.tenants` | `Domain` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `apps.core` | `Permission` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `apps.core` | `Role` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `django.contrib.auth` | `Group` | SHARED | Unregistered | Hidden everywhere — DFMS uses `core.Role` instead |
| `django_celery_beat` | `PeriodicTask` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `django_celery_beat` | `ClockedSchedule` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `django_celery_beat` | `CrontabSchedule` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `django_celery_beat` | `IntervalSchedule` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `django_celery_beat` | `SolarSchedule` | SHARED | `PlatformOnlyAdminMixin` | Platform admin only |
| `apps.users` | `User` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `POI` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Product` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Vehicle` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Driver` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Zone` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Route` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `ProductCategory` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Helper` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Supplier` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `apps.master_data` | `Dealer` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `token_blacklist` | `OutstandingToken` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `token_blacklist` | `BlacklistedToken` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `django_celery_results` | `TaskResult` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |
| `django_celery_results` | `GroupResult` | TENANT | `TenantOnlyAdminMixin` | Tenant admin only |

---

## How Third-Party Models Are Patched

Third-party apps (`django.contrib.auth`, `django_celery_beat`,
`django_celery_results`, `rest_framework_simplejwt`) register their own
`ModelAdmin` classes. We cannot modify them directly, so they are patched at
startup in `apps/core/apps.py → CoreConfig.ready()` via
`_patch_third_party_admin()`.

This function iterates `admin.site._registry` after all apps are loaded and
dynamically subclasses each matching `ModelAdmin` to prepend the appropriate
mixin, then re-registers it in place. This is safe because `ready()` runs
once at startup before any request is served.

---

## Adding New Models — Checklist

When registering a new `ModelAdmin`, determine which mixin to use:

1. **Is the model in `SHARED_APPS`?**
   - Yes → use `PlatformOnlyAdminMixin`
   - No (in `TENANT_APPS`) → use `TenantOnlyAdminMixin`

2. **Is it a third-party model you can't modify?**
   - Add its `(app_label, model_name)` tuple to the appropriate set in
     `_patch_third_party_admin()` in `apps/core/apps.py`.

3. **Is it a first-party model?**
   - Add the mixin directly to the `ModelAdmin` class definition.

Example for a new first-party tenant model:
```python
# apps/requisitions/admin.py
from apps.core.admin import TenantOnlyAdminMixin

@admin.register(Requisition)
class RequisitionAdmin(TenantOnlyAdminMixin, admin.ModelAdmin):
    ...
```

Example for a new first-party platform model:
```python
# apps/billing/admin.py
from apps.core.admin import PlatformOnlyAdminMixin

@admin.register(Invoice)
class InvoiceAdmin(PlatformOnlyAdminMixin, admin.ModelAdmin):
    ...
```

---

## Future Apps (Phase 2+)

The following `TENANT_APPS` will need `TenantOnlyAdminMixin` when their admin
registrations are added:

| App | Models (examples) |
|-----|-------------------|
| `apps.requisitions` | `Requisition`, `RequisitionItem` |
| `apps.transport` | `TransportOrder`, `Trip`, `TransportRequisition` |
| `apps.vendors` | `Vendor`, `VendorBid` |
| `apps.operations` | `GateEntry`, `QCRecord` |
| `apps.quality` | `QCInspection` |
| `apps.costing` | `TripCost` |
| `apps.tracking` | `VehicleLocation` |
| `apps.notifications` | `Notification` |
| `apps.reporting` | `Report` |

---

## Security Note

The mixin restriction is an **admin UI concern only** — it prevents models from
appearing in the wrong admin interface. The underlying database isolation is
enforced at the PostgreSQL level by `django-tenants` setting
`search_path = '<schema>', 'public'` on every connection. Even if the mixin
were bypassed, a tenant schema query cannot physically reach another tenant's
tables.
