# Tenant Discovery & Join Request

**Module:** Vendor Management — Vendor Tenant Join Request  
**Scope:** Vendor mobile app — **Maestro target**  
**Last Maestro run:** 2026-07-22 (emulator-5554)

| TC ID | Scenario | Test description | Priority | Scope | Maestro Status | Maestro Flow | PDF Notes |
|-------|----------|------------------|----------|-------|----------------|--------------|-----------|
| TC_102 | Tenant list displayed | Tenant Selection / directory shows available tenants. | High | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/tenants/01_tenant_directory_search_and_join.yaml` | **Passed 2026-07-22** |
| TC_103 | Join request submit | Click Join for a tenant → request submitted. | Critical | Vendor App | Partial | `nourish-vendor-app/.maestro/flows/tenants/01_tenant_directory_search_and_join.yaml` | List covered; Join action not asserted |
| TC_104 | Join → Requested state | After Join, button changes to "Requested". | High | Vendor App | Not Started | — | |
| TC_105 | Locked before approval | Before approval, TOs/Bids/Trips blocked. | Critical | Vendor App | Not Started | — | Use pending membership account |
| TC_106 | Multiple tenant requests | Join A and B independently. | Low | Vendor App | Not Started | — | |
| TC_107 | Tenant data isolation | Vendor for Tenant A not visible in Tenant B admin. | Critical | Backend | Manual | — | Admin verification |
| TC_117 | Full menu after approval | After approval, TOs/Bids/Trips/Tenants/Profile accessible. | Critical | Vendor App | Covered | `nourish-vendor-app/.maestro/flows/smoke/01_bottom_nav_all_tabs.yaml` | **Passed 2026-07-22** |

## Related Maestro flows

| Flow | Result 2026-07-22 |
|------|-------------------|
| `tenants/01_tenant_directory_search_and_join.yaml` | **Passed** |
| `tenants/02_tenant_directory_search_empty.yaml` | **Passed** |

## Test data

- Approved vendor: `VENDOR_EMAIL` (`vendor2@gmail.com`, nourish membership approved)
