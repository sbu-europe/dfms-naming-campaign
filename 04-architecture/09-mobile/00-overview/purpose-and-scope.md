---
last_updated: 2026-09-16
document_type: architecture
---

# Mobile — Purpose and Scope

## Role in DFMS

**Vendor Mobile** is the field/ops client for **transport vendors**. Vendors self-register, join tenants, bid (non-contractual), manage assigned transport orders, advance trip status, and maintain profile data.

It complements:

| Surface | Audience | Role |
|---------|----------|------|
| Django Admin / portal | Tenant ops, planners, admins | Planning, award, master data |
| **Vendor Mobile** | External vendors | Bids, assigned TOs, trips, membership |
| Driver interface (Phase 1) | Drivers | Responsive admin “My Trips” — not Flutter |
| Vendor Portal (web) | Vendors (future/partial) | Overlaps domain; mobile is Phase 1 vendor entry |

## In scope (this architecture folder)

- Flutter app structure for `nourish-vendor-app`
- Session gating, tenancy headers, vendor JWT
- Mapping to product specs and Maestro tests

## Out of scope

- Backend domain rules (see `05-modules/` transport / vendor)
- Full Driver/QC Flutter architecture (not implemented)
- Pixel-level UI specs (see design system + product specs)

## Repo

| Item | Value |
|------|-------|
| Implementation | `nourish-vendor-app` |
| Product context submodule | `DFMS-product-context` |
| Backend | `nourish-backend` (`/api/v1/vendor/*`) |
