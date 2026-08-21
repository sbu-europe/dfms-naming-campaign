# Tenant Approval — Admin (TC_043–TC_050)

**Source:** DFMS UAT Test Suite — Vendor Approval (Tenant Admin).
**Automation:** Playwright + Maestro (`tenants/06`, `tenants/04`).

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_043 | Pending visible admin | Admin sees Pending join | Tenant Admin | **Pass** | Playwright `run-vendor-tenant-approval.mjs` | Pass |
| TC_044 | Docs visible admin | Admin sees all documents | Tenant Admin | **Pass** | Playwright | Pass |
| TC_045 | Decision options | Approve Contractual / Non-Contractual / Reject | Tenant Admin | **Pass** | Playwright | Pass |
| TC_046 | Approve Contractual | Approve as Contractual → Approved | Tenant Admin | **Pass** | Playwright | Pass |
| TC_047 | Approve Non-Contractual | Approve as Non-Contractual → Approved | Tenant Admin | **Pass** | Playwright | Pass |
| TC_048 | Reject join | Admin can Reject join request | Tenant Admin | **Pass** | Playwright | Pass |
| TC_049 | Resubmit after reject | Rejected vendor can resubmit | Mixed | **Pass** | Playwright + `tenants/06_…` | Pass |
| TC_050 | Full menu after approve | Full tabs after approval | Vendor App | **Pass** | `tenants/04_…` | Passed |
