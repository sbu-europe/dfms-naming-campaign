---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Tenancy and Vendor Types

## Platform vs tenant scope

| Scope | Mechanism |
|-------|-----------|
| Platform vendor identity | Vendor JWT + `Host: DFMS_TENANT_HOST` (vendor schema) |
| Tenant operations | Paths include `{tenantSchema}`; UI scoped by approved memberships / `selectedTenantId` |

Helpers in app code (e.g. `vendor_tenant_scope`, API merge utilities) combine multi-tenant lists where needed.

## Access gates (product + code)

1. Authenticated vendor account  
2. Phone verification + onboarding completeness  
3. **Approved** tenant membership before MainShell operational tabs are meaningful  

Vendor type (**Contractual** vs **Non-Contractual**) is set by **Tenant Admin on join approval**, not at self-registration.

## UX fork

| Type | Bids tab / bid flows | Assigned TOs / trips / post-award |
|------|----------------------|-----------------------------------|
| Non-Contractual | Yes | Yes (after award) |
| Contractual | Hidden / N/A | Yes (direct assignment) |

Canonical journey map: [`../../../05-modules/15-mobile-apps/vendor-mobile/12-vendor-type-flows.md`](../../../05-modules/15-mobile-apps/vendor-mobile/12-vendor-type-flows.md).

## Isolation rules

- Vendors only see their own bids/TOs/memberships.
- Tenant schema in URL prevents cross-tenant resource access; backend enforces authorization.
