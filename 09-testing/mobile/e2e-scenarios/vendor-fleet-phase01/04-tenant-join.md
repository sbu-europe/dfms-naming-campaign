# Tenant Discovery & Join Request (TC_036–TC_042)

**Source:** DFMS UAT Test Suite — Vendor Tenant Join Request.
**Scope:** Vendor mobile app. Tab 3 label is **Trips** (PDF may say Tracks).

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_036 | Tenant list | Tenants page shows available tenants | Vendor App | **Pass** | `tenants/01_…` | Passed |
| TC_037 | Join request | Send Join Request to a tenant | Vendor App | **Pass** | `tenants/03_…` | Passed |
| TC_038 | Requested state | Join → Requested | Vendor App | **Pass** | `tenants/03_…` | Passed |
| TC_039 | Multi-tenant join | Join multiple tenants | Vendor App | **Pass** | `tenants/05_…` | Passed |
| TC_040 | Locked before approval | No TOs/Bids/Trips before approval | Vendor App | **Pass** | `tenants/03_…` | Passed (Trips tab) |
| TC_041 | Requested persists | Requested persists across sessions | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_042 | No duplicate join | Cannot duplicate Join when already Requested | Vendor App | **Not Started** | — | New from UAT PDF |

## Join loop

See README / `make seed-vendor-mobile` → Maestro `tenants/03` → `make approve-vendor-join` → `tenants/04`.
