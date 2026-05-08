---
last_updated: 2026-05-06
---

# Vendor Mobile — Security & Access Control

## Authentication

**Login methods:**
- Email/Password
- Phone Number + OTP

**Session management:**
- JWT token with 7-day expiry
- Refresh token for seamless re-authentication

## Data access control

**Vendor isolation:**
- Vendor can only view/edit their own data (bids, TOs, trips, post-award submissions)
- Strict `vendor_id` filtering on all API endpoints

**Tenant scope (vendor membership):**
- Vendor can only view bids, TOs, and trips for tenants where the vendor membership is approved
- All list/detail endpoints enforce `(vendor_id, tenant_id)` scope, not just `vendor_id`

## Audit trail

**Logged actions:**
- Bid submissions
- Post-award driver/vehicle submissions
- Profile updates

