---
section: 09-testing/mobile/e2e-scenarios/vendor-fleet-phase01
title: Vendor Fleet Test Cases (TC_001–TC_160)
version: 2.0
source_document: DFMS UAT Test Suite.pdf (+ Phase01 admin extras)
implementation_reference: ../../../../nourish-vendor-app/.maestro/
last_updated: 2026-08-21
---

# DFMS Vendor Fleet — Test Cases (TC_001–TC_160)

**Primary source (mobile):** `DFMS UAT Test Suite.pdf` → **TC_001–TC_116** (116 cases).  
**Admin extras (not in UAT PDF):** Phase01 TDO/TP/RBAC → **TC_117–TC_160** (44 cases).

> **Start here for the full list:** [`00-all-test-cases.md`](./00-all-test-cases.md) — every case + status in one file.

## Numbering (2026-08-20)

| Range | Content |
|-------|---------|
| **TC_001–TC_116** | Mobile UAT suite (aligned to UAT PDF serials) |
| **TC_117–TC_160** | Admin / Playwright / RBAC extras kept from Phase01 |

Older Phase01 IDs (formerly TC_075–215, then a temporary renumber) are **replaced** by this scheme. Do not mix old IDs with this folder.

## Status snapshot (2026-08-21)

| Status | Count | Meaning |
|--------|------:|---------|
| **Pass** | **123** | Automated (Playwright and/or Maestro) and verified |
| **Partial** | **4** | TC_020, TC_032, TC_066, TC_129 |
| **Skipped** | **15** | OTP or yard E2E out of current automation scope |
| **Skip** | **9** | Blocked / harness gaps |
| **N/A** | **8** | Admin-only / out of vendor-mobile scope |
| **Failed** | **1** | TC_008 |
| **Not Started** | **0** | — |

> **Covered** was merged into **Pass** (single green status).

**2026-08-21:** Unblocked Partials moved to Pass via Maestro + Playwright. Remaining Partial = product/spec blockers + flaky TC_066.

## Feature files

| File | Feature area | TC range |
|------|--------------|----------|
| [**00-all-test-cases.md**](./00-all-test-cases.md) | **Master index (all cases + status)** | TC_001–TC_160 |
| [01-to-creation-vendor-fleet.md](./01-to-creation-vendor-fleet.md) | TO creation (admin) | TC_117–TC_125 |
| [02-registration-auth.md](./02-registration-auth.md) | Create account, verify, login | TC_001–TC_026 |
| [03-onboarding-documents.md](./03-onboarding-documents.md) | Profile documents | TC_027–TC_035 |
| [04-tenant-join.md](./04-tenant-join.md) | Tenant join | TC_036–TC_042 |
| [05-tenant-approval-admin.md](./05-tenant-approval-admin.md) | Tenant approval | TC_043–TC_050 |
| [06-bid-publishing-admin.md](./06-bid-publishing-admin.md) | Bid publish (TDO) | TC_126–TC_140 |
| [07-bids-vendor-app.md](./07-bids-vendor-app.md) | Bids, award, Won section | TC_083–TC_116 |
| [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) | TO list + driver/vehicle | TC_051–TC_067 |
| [09-trips-vendor-app.md](./09-trips-vendor-app.md) | RFD, Trips, yard | TC_068–TC_082, TC_157 |
| [10-contractual-assignment-admin.md](./10-contractual-assignment-admin.md) | Contractual assign | TC_148–TC_150 |
| [11-post-award-dispatch-rbac.md](./11-post-award-dispatch-rbac.md) | Award admin, RFD, RBAC | TC_141–TC_147, TC_151–TC_160 |

## Product notes (UAT vs current app)

1. **Tracks → Trips** — UAT PDF still says Tracks; app + Maestro use **Trips**.
2. **OTP** — TC_011–018 Skipped in Maestro until stub OTP is reliable.
3. **TC_020** — UAT: Mobile + Password; Maestro `auth/05` currently asserts Phone **OTP** tab.
4. **TC_097** — UAT allows bid update while window open (follow UAT; older Phase01 “lock after submit” is obsolete for this suite).

## Run automation

```bash
# Full local suite (Maestro + optional Playwright)
bash .cursor/skills/run-vendor-mobile-tests/scripts/run-all.sh
```

See also: [Maestro setup and run](../../maestro-setup-and-run.md).

## Status legend

| Status | Meaning |
|--------|---------|
| **Pass** | Automated (Playwright and/or Maestro) and verified |
| **Partial** | Related flow exists; does not fully satisfy UAT |
| **Not Started** | Documented from UAT; automation / assert not built yet |
| **Skipped** | Intentionally not run (OTP, yard chain) |
| **Failed** | Automation ran; assertion failed |
| **N/A** | Out of scope for vendor mobile |
| **Skip** | Blocked / harness gap / PDF skip |
