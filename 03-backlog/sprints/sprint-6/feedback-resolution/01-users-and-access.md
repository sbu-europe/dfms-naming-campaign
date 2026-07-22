---
title: Sprint 6 Feedback — Users & Access
module: 01-users-and-access
menu: Users / Tenant Admin
parent: ./README.md
---

# Users & Access

**Admin menu / area:** Users / Tenant Admin  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-016](#fb-016--tenant-super-admin-at-provisioning-delegated-tenant-admin-cannot-mint-admins) | Tenant Super Admin at provisioning; delegated Tenant Admin cannot mint admins | High | Resolved |
| [FB-025](#fb-025--user-menu-status-filter-shows-incorrect-status) | User menu status filter shows incorrect status | Medium | Resolved |
| [FB-026](#fb-026--password-reset-admin-justification-field-required) | Password reset: admin justification field required | Medium | Resolved |
| [FB-030](#fb-030--user-bulk-import-feature-not-working) | User bulk import feature not working | High | Resolved |

---

## FB-016 — Tenant Super Admin at provisioning; delegated Tenant Admin cannot mint admins

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-08 |
| **Affected Stories** | US-005 (staff invitation), US-006 (user activation), US-007 (user management), PAP-05 / PAP-06 (tenant provisioning); role model ([`user-roles.md`](../../../../01-source/03-sow/user-roles.md)) |
| **Reference docs** | [`user-tenant-management.md`](../../../../05-modules/01-foundation/user-tenant-management.md) §2.1 / §2.3; [`tenant-user-management-v2.md`](../../../../05-modules/03-users/tenant-user-management-v2.md) |
| **Closing Sub-tasks** | FB-016-1 … FB-016-10 — see [tenant-user-management-v2.md](../../../../05-modules/03-users/tenant-user-management-v2.md) §12 |
| **AC Amendment** | Split today's single platform-provisioned **Tenant Admin** into two personas. **(1) Tenant Super Admin** (`tenant_super_admin`) — created **only** during **tenant invitation / provisioning** by the Platform Super Admin (same lifecycle as today's first tenant admin; not available via staff invite). **(2) Tenant Admin (delegate)** (`tenant_admin`) — the Tenant Super Admin may invite **one or more** delegates via the existing US-005 staff-invite flow. Delegates receive the **same org-wide permission catalog** as the Tenant Super Admin (master data, users, configuration, yard supervisor bypass, etc.) but **cannot** invite, assign, or elevate users to `tenant_admin` or `tenant_super_admin`. Tenant Admin delegates **may** invite operational users and POI-Admin ([FB-014](./04-yard-and-stock.md#fb-014--poi-admin-role-poi-scoped-yard-operations-super-user)) — only the **mint-admin** action is restricted to Tenant Super Admin. Remove the hard-coded **one tenant admin per schema** rule. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Current implementation provisions exactly one `tenant_admin` per tenant (`UserAdminForm.clean()` enforces single admin; `InviteUserForm` blocks `tenant_admin` assignment). `is_tenant_admin=True` is the full-access bypass (~60 call sites). No `tenant_super_admin` role or `is_tenant_super_admin` flag exists today. **Implementation plan:** [`tenant-user-management-v2.md`](../../../../05-modules/03-users/tenant-user-management-v2.md). Coordinate with FB-014 — both Tenant Super Admin and Tenant Admin delegates may invite POI-Admin with mandatory POI. E2E out of scope. |

### Client feedback observation

When a tenant is onboarded, the **first org-wide administrator** should be a **Tenant Super Admin**, created as part of tenant provisioning — not a delegate. That super admin can then create **multiple Tenant Admin** users for day-to-day org management. Those delegated Tenant Admins should have the same operational powers as the super admin **except** they must **not** be able to create additional Tenant Admins (or another Tenant Super Admin).

### Current vs expected behaviour

| Aspect | Current | Expected (FB-016) |
|--------|---------|-------------------|
| First admin at tenant provision | Single **Tenant Admin** (`tenant_admin`) | **Tenant Super Admin** (`tenant_super_admin`) |
| Tenant admins per tenant | Exactly **one** (admin form enforcement) | **One super** + **N delegates** |
| Invite `tenant_admin` | Blocked in staff invite / role assignment | **Allowed** when inviter is Tenant Super Admin only |
| Invite `tenant_super_admin` | N/A | **Blocked** — platform provisioning only |
| Tenant Admin delegate powers | N/A (only one admin exists) | Same org-wide catalog as super admin |
| Delegate creates Tenant Admin | N/A | **Forbidden** — elevation restricted to Tenant Super Admin |
| `is_tenant_admin` bypass | On provisioned admin | On **both** super and delegate |
| Elevation flag | Does not exist | `is_tenant_super_admin=True` on provisioned user only |

### Implementation plan

See full plan: [`tenant-user-management-v2.md`](../../../../05-modules/03-users/tenant-user-management-v2.md).

| Phase | Scope |
|-------|--------|
| **1** | `tenant_super_admin` role seed; `is_tenant_super_admin` on `User`; provisioning targets super admin |
| **2** | Remove single-admin constraint; invite/assign guards (super only may mint `tenant_admin`) |
| **3** | Migration: existing provisioned admin → super admin |
| **4** | Platform tenant list / activation sync; unit + integration tests (no E2E) |

---

---

## FB-025 — User menu status filter shows incorrect status

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-007 (user management); [`tenant-user-management.md`](../../../../05-modules/03-users/tenant-user-management.md) |
| **Closing Sub-tasks** | FB-025-1 — User changelist status filter corrected |
| **AC Amendment** | Under the **Users** admin menu, the **status filter** SHALL show and filter by the **correct user status** values (active / inactive / invited / locked / etc. as implemented). Filtering a status returns only users whose displayed status matches that filter option — no mismatched labels or wrong queryset mapping. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Client reported the User menu status filter was not reflecting the correct status. Fixed so filter options and list results align with the user status shown on the changelist. |

### Client feedback observation

The status filter under the User menu did not show or apply the correct user status, making it hard for Tenant Admins to find users by lifecycle state.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-025) |
|--------|----------------------|-------------------|
| Status filter options | Incorrect / mismatched vs displayed status | Options match real user status values |
| Filter results | Wrong users returned for a selected status | Only users with that status |

---

---

## FB-026 — Password reset: admin justification field required

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-006 / password reset & unlock ([`tenant-user-management.md`](../../../../05-modules/03-users/tenant-user-management.md)); PRD §Security — password reset audit |
| **Closing Sub-tasks** | FB-026-1 — Admin justification on password-reset action |
| **AC Amendment** | When a Tenant Admin (or privileged admin) triggers a **password reset** for a user, the form/action SHALL require an **admin justification** field. Reset cannot submit with a blank justification. The justification is persisted on the password-reset audit log (admin ID, timestamp, target user, remarks). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | PRD requires justification remarks on admin unlock/reset-style actions. Client reported the justification field was missing from the Password Reset admin flow; field is now present and required. |

### Client feedback observation

Admin-initiated password reset had no justification field, so resets could not be audited with a clear reason.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-026) |
|--------|----------------------|-------------------|
| Justification on password reset | Missing | Required text field |
| Audit | Incomplete / no admin remarks | Justification stored with reset audit entry |

---

---

## FB-030 — User bulk import feature not working

| Field | Value |
|-------|-------|
| **Source** | Client feedback — 2026-07-22 |
| **Affected Stories** | US-005 / user bulk import ([`tenant-user-management.md`](../../../../05-modules/03-users/tenant-user-management.md)); E2E [`user-bulk-import-e2e-scenarios.md`](../../../../09-testing/backend/e2e-scenarios/users/user-bulk-import-e2e-scenarios.md) |
| **Closing Sub-tasks** | FB-030-1 — Restore working User bulk import (template, validate, create) |
| **AC Amendment** | **User Bulk Import** SHALL work end-to-end for Tenant Admin: download/upload template, validate rows, create/invite users per import rules, and surface clear success/error feedback. Previously broken import paths (template, parsing, or create) are fixed so the feature is usable in Admin. |
| **Status** | Resolved |
| **Priority** | High |
| **Notes** | Client reported User Bulk Import was not functional. Fixed and covered by Playwright MCP / e2e scenarios under `users/user-bulk-import-e2e-scenarios.md`. |

### Client feedback observation

The User Bulk Import admin feature was not working — Tenant Admins could not successfully import users from the bulk CSV/template flow.

### Current vs expected behaviour

| Aspect | Current (before fix) | Expected (FB-030) |
|--------|----------------------|-------------------|
| Bulk import | Broken / non-functional | Working template → validate → create/invite flow |
| Error feedback | Missing or opaque | Clear row/field errors on failure |

---
