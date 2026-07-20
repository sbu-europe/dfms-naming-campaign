# Tenant Discovery & Join Request

**Module:** Vendor Management — Vendor Tenant Join Request  
**Scope:** Vendor mobile app — **Maestro target**

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_102 | Tenant list displayed | Tenant Selection page shows available tenants (e.g. Nourish Poultry Admin). | High | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tenants/01_tenant_directory_search_and_join.yaml` | |
| TC_103 | Join request submit | Click Join for a tenant → request submitted successfully. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tenants/01_tenant_directory_search_and_join.yaml` | |
| TC_104 | Join → Requested state | After Join, button changes to "Requested". | High | Vendor App | Not Started | — | |
| TC_105 | Locked before approval | Before tenant approval, TOs/Bids/Trips menus blocked or unavailable. | Critical | Vendor App | Not Started | — | Needs pending-approval account |
| TC_106 | Multiple tenant requests | Join requests to Tenant A and Tenant B independently; each shows Requested. | Low | Vendor App | Not Started | — | |
| TC_107 | Tenant data isolation | Vendor approved for Tenant A not visible in Tenant B admin view. | Critical | Backend | Manual | — | Admin verification |
| TC_117 | Full menu after approval | After tenant admin approval, app shows TOs, Bids, Trips, Tenants, Profile. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/smoke/01_bottom_nav_all_tabs.yaml` | Requires approved vendor |

## Related Maestro flows

| Flow | Covers |
|------|--------|
| `nourish-vendor-app/.maestro/flows/tenants/02_tenant_directory_search_empty.yaml` | Search empty state |

## Test data

- Pending vendor: not approved for any tenant (for TC_105)
- Approved vendor: `VENDOR_EMAIL` / `VENDOR_PASSWORD` (for TC_117)
