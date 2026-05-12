---
last_updated: 2026-05-12
---

# Vendor Mobile — Onboarding & Verification

## Entry paths

- **Self-registration** *(initial scope: Vendor Mobile only; web self-registration deferred)*: Vendor signs up and submits required profile + documents. **Vendor type (Contractual vs Non-Contractual) is not collected here** — Tenant Admin sets it when approving a tenant join (**VM-03**).
- **Invite-based onboarding**: Platform admin creates vendor and sends an invite; vendor completes missing details + documents and submits.

## Access after registration (no Platform Admin verification)

There is **no** Platform Admin approve/reject queue after sign-up.

- After **registration is complete** (VM-01 + mandatory docs/profile per **VM-02**), the vendor is **platform-active** for listing tenants and submitting **tenant join** requests.
- **Tenant-scoped** access to bids, TOs, and trips requires **VM-03** join approval (and tenant-assigned vendor type on approve).

## Verification (naming note)

The word “verification” in older PRD text meant **platform admin document review**. That step is **not** in the current model; **completeness** of mandatory uploads is enforced at submission time (**VM-02**), and **tenants** gate operational access via join approval.
