---
last_updated: 2026-05-13
---

# Vendor Mobile — Tenant Membership (Join & Approval)

> This screen is where the **Contractual vs Non-Contractual fork** is recorded for each (vendor, tenant) pair. See [`12-vendor-type-flows.md`](12-vendor-type-flows.md) for the full downstream consequence map.

## Tenant join approval (after platform onboarding)

- Vendor with **completed onboarding** (VM-01) can view all **active tenants** (Tenant Directory).
- Vendor can request to join one or more tenants. Status: `PENDING` → `APPROVED` or `REJECTED`.
- A **Tenant Admin** approves or rejects the join request.
- **On approve, the Tenant Admin MUST set `vendor_type`** for this vendor **within this tenant**: `CONTRACTUAL` or `NON_CONTRACTUAL`. The vendor never picks `vendor_type` — not at registration, not in the join request, not after.
- Until `status=APPROVED` (and `vendor_type` set), the vendor cannot:
  - View bid opportunities for that tenant
  - View assigned TOs / trips for that tenant
  - Submit bids for that tenant

## Per-tenant vendor type (after approval) — what changes for the vendor

| | `CONTRACTUAL` | `NON_CONTRACTUAL` |
|---|---|---|
| TO assignment | TDO directly assigns (TEVF-01); no bid round | TDO publishes bids; vendor bids; TDO awards (TEVF-02) |
| Bids tab content for this tenant | None | Populated |
| Bid submission for this tenant | Not reachable | Reachable |
| Assigned TOs tab | Populated (`assignment_type=CONTRACTUAL`) | Populated on win (`assignment_type=BID_WON`) |
| Rate visibility in mobile | **Hidden** (contractual rate is server-side) | Vendor sees their own `bid_amount` |
| Tenant card label | "Approved — Contractual" | "Approved — Non-Contractual" |

## Multi-tenant + mixed types

A single vendor MAY hold different `vendor_type` values across tenants. Gating evaluates **per tenant** in every API/screen. Example:

- Tenant A: `APPROVED, NON_CONTRACTUAL` → Bids tab shows opportunities, bid submission allowed.
- Tenant B: `APPROVED, CONTRACTUAL` → no bids visible for Tenant B; assigned TOs land directly with rate hidden.
- Tenant C: `PENDING` → no bids/TOs/trips visible.

The **Bids** tab is shown in the bottom tab bar as long as the vendor has **at least one** `NON_CONTRACTUAL` approved membership.

## Backlog

- **VM-02** — [`VM-02-vendor-tenant-join-and-approval.md`](../../../03-backlog/phase-1/sprints/sprint-4/08-vendor-management/VM-02-vendor-tenant-join-and-approval.md).
- The `vendor_type` field is stored on the membership record `(vendor_id, tenant_id, status, vendor_type)`; required when `status=APPROVED`.

## Code map

| Concern | Code | APIs |
|---------|------|------|
| Tenant directory / join | `lib/presentation/feature/tenant_directory/` | `vendor/tenants/available/`, `vendor/memberships/`, `vendor/tenants/{schema}/join-requests/` |

Maestro: `.maestro/flows/tenants/`.
