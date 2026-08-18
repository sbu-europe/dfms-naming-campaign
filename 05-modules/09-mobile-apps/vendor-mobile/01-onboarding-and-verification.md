last_updated: 2026-08-18
---

# Vendor Mobile — Onboarding & Verification

## Entry path (single)

- **Self-registration on Vendor Mobile** *(initial scope: Vendor Mobile only; web self-registration deferred)*: Vendor signs up and submits required profile + documents (Trade License, BIN, TIN, testimonial/reference). **Vendor type (Contractual vs Non-Contractual) is not collected here** — Tenant Admin sets it when approving a tenant join (**VM-02**).
- **Registration gate sequence:** `Register (step 1/3)` -> `Email OTP verify (step 2/3)` -> `Phone verification with OTP (step 3/3)` -> `Profile/documents onboarding`.

> **No platform-admin invite / create-vendor path in Phase 1.** Platform Admin does not onboard vendors. The only way a vendor enters DFMS is by self-registering through the Vendor Mobile app.

## Access after registration (no Platform Admin verification)

There is **no** Platform Admin approve/reject queue after sign-up.

- After **registration and phone verification are complete** (VM-01 + mandatory docs/profile), the vendor is **platform-active** for listing tenants and submitting **tenant join** requests.
- **Tenant-scoped** access to bids, TOs, and trips requires **VM-02** join approval (and tenant-assigned vendor type on approve).

## Verification (naming note)

The word "verification" in older PRD text meant **platform admin document review**. That step is **not** in the current model; **completeness** of mandatory uploads is enforced at submission time (**VM-01**), and **tenants** gate operational access via join approval (**VM-02**).
