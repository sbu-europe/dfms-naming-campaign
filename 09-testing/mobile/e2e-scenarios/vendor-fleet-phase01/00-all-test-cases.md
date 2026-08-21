---
section: 09-testing/mobile/e2e-scenarios/vendor-fleet-phase01
title: All Vendor Fleet Test Cases (Master Index)
version: 2.0
source_document: DFMS UAT Test Suite.pdf + Phase01 admin extras
last_updated: 2026-08-20
---

# All Vendor Fleet Test Cases — Master Index

Single inventory of **all** documented cases and current status.

| Suite | IDs | Count | Source |
|-------|-----|------:|--------|
| **Mobile UAT** | TC_001–TC_116 | 116 | `DFMS UAT Test Suite.pdf` |
| **Admin / Phase01 extras** | TC_117–TC_160 | 44 | Prior Phase01 admin/TDO/RBAC not in UAT PDF |
| **Total** | TC_001–TC_160 | **160** | |

## Status summary

| Status | Count | Meaning |
|--------|------:|---------|
| **Covered** | 43 | see legend in README |
| **Pass** | 58 | see legend in README |
| **Partial** | 3 | blockers only: TC_020, TC_032, TC_129 |
| **Skipped** | 15 | see legend in README |
| **Not Started** | 29 | see legend in README |
| **N/A** | 8 | see legend in README |
| **Skip** | 4 | see legend in README |

> **Note:** PDF UAT labels say **Tracks**; current app tab is **Trips**. Context uses Trips.
>
> **OTP (TC_011–018):** Skipped in Maestro until stable stub/inbox path.
>
> **Login TC_020:** UAT expects Mobile + Password; current Maestro flow is Phone OTP tab.

> **2026-08-21:** Moved unblocked Partial cases to Covered/Pass after Maestro flow updates (`auth/07,14,15`, `tos/03,06`, `trips/02,03`, `bids/03,05,08`) + existing Playwright.
> Still **Partial** (blockers): TC_020 (OTP vs password login), TC_032 (file-type picker), TC_129 (bid-open optional in UI).

## Mobile UAT — TC_001–TC_116

| TC | Module | Title | Scope | Status | Automation | Notes |
|----|--------|-------|-------|--------|------------|-------|
| TC_001 | Create Account | Create Account access | Vendor App | **Covered** | `auth/06_…` | Passed |
| TC_002 | Create Account | All mandatory fields | Vendor App | **Covered** | `auth/07_…` | Maestro asserts Company/Contact/Email/Mobile/Password labels + empty submit |
| TC_003 | Create Account | Company Name required | Vendor App | **Covered** | `auth/07_…` | Passed |
| TC_004 | Create Account | Contact Person required | Vendor App | **Not Started** | — | Missing from prior Phase01 context; add Maestro assert |
| TC_005 | Create Account | Email format | Vendor App | **Covered** | `auth/11_…` | Passed |
| TC_006 | Create Account | Duplicate email | Vendor App | **Covered** | `auth/12_…` | Passed |
| TC_007 | Create Account | Mobile format | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_008 | Create Account | Duplicate mobile | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_009 | Create Account | Password complexity | Vendor App | **Covered** | `auth/13_…` | Passed |
| TC_010 | Create Account | Email AND mobile required | Vendor App | **Not Started** | — | UAT: both channels required (not OR) |
| TC_011 | Email Verification | Send email verification code | Vendor App | **Skipped** | `auth/10_…` | OTP automation out of scope |
| TC_012 | Email Verification | Email before mobile | Vendor App | **Skipped** | — | OTP out of scope |
| TC_013 | Email Verification | Email locked after code | Vendor App | **Skipped** | — | OTP out of scope |
| TC_014 | Mobile Verification | Nav to mobile after email | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_015 | Mobile Verification | Send SMS OTP | Vendor App | **Skipped** | — | OTP out of scope |
| TC_016 | Mobile Verification | Valid mobile OTP | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_017 | Mobile Verification | Cannot skip mobile verify | Vendor App | **Skipped** | — | OTP out of scope |
| TC_018 | Mobile Verification | Both channels required | Vendor App | **Skipped** | `auth/10_…` | OTP out of scope |
| TC_019 | Login | Login email + password | Vendor App | **Covered** | `auth/04_…` | Passed |
| TC_020 | Login | Login mobile + password | Vendor App | **Partial** | `auth/05_…` | App/Maestro currently Phone OTP tab (no password) — product conflict vs UAT |
| TC_021 | Login | Wrong password (email) | Vendor App | **Covered** | `auth/03_…` | Fixed 2026-08-19 |
| TC_022 | Login | Wrong password (mobile) | Vendor App | **Not Started** | — | Depends on mobile+password login |
| TC_023 | Login | Unregistered email | Vendor App | **Covered** | `auth/14_…` | Dedicated unregistered-email login flow |
| TC_024 | Login | Unregistered mobile | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_025 | Login | Incomplete registration blocked | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_026 | Login | Login routing by progress | Vendor App | **Covered** | `auth/15_…` | Onboarding → docs; join → Tenants; approved → shell |
| TC_027 | Documents | Trade License required | Vendor App | **Covered** | `onboarding/03_…` | Passed |
| TC_028 | Documents | BIN required | Vendor App | **Covered** | `onboarding/04_…` | Passed |
| TC_029 | Documents | TIN required | Vendor App | **Covered** | `onboarding/05_…` | Passed |
| TC_030 | Documents | Truck Assoc required | Vendor App | **Covered** | `onboarding/06_…` | Passed |
| TC_031 | Documents | All 4 docs formats | Vendor App | **Covered** | `onboarding/07_…` | Passed (PNG via Maestro) |
| TC_032 | Documents | Unsupported format | Vendor App | **Partial** | code review picker | No dedicated Maestro negative flow |
| TC_033 | Documents | Oversized file | Vendor App | **Not Started** | — | Size not enforced in app picker path |
| TC_034 | Documents | Upload fail retry | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_035 | Documents | Proceed to Tenants | Vendor App | **Covered** | `onboarding/07_…` | Passed |
| TC_036 | Tenant Join | Tenant list | Vendor App | **Covered** | `tenants/01_…` | Passed |
| TC_037 | Tenant Join | Join request | Vendor App | **Covered** | `tenants/03_…` | Passed |
| TC_038 | Tenant Join | Requested state | Vendor App | **Covered** | `tenants/03_…` | Passed |
| TC_039 | Tenant Join | Multi-tenant join | Vendor App | **Covered** | `tenants/05_…` | Passed |
| TC_040 | Tenant Join | Locked before approval | Vendor App | **Covered** | `tenants/03_…` | Passed (Trips tab) |
| TC_041 | Tenant Join | Requested persists | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_042 | Tenant Join | No duplicate join | Vendor App | **Not Started** | — | New from UAT PDF |
| TC_043 | Tenant Approval | Pending visible admin | Tenant Admin | **Pass** | Playwright `run-vendor-tenant-approval.mjs` | Pass |
| TC_044 | Tenant Approval | Docs visible admin | Tenant Admin | **Pass** | Playwright | Pass |
| TC_045 | Tenant Approval | Decision options | Tenant Admin | **Pass** | Playwright | Pass |
| TC_046 | Tenant Approval | Approve Contractual | Tenant Admin | **Pass** | Playwright | Pass |
| TC_047 | Tenant Approval | Approve Non-Contractual | Tenant Admin | **Pass** | Playwright | Pass |
| TC_048 | Tenant Approval | Reject join | Tenant Admin | **Pass** | Playwright | Pass |
| TC_049 | Tenant Approval | Resubmit after reject | Mixed | **Pass** | Playwright + `tenants/06_…` | Pass |
| TC_050 | Tenant Approval | Full menu after approve | Vendor App | **Covered** | `tenants/04_…` | Passed |
| TC_051 | Contractual TO | Contractual sees assigned TO | Vendor App | **Pass** | Playwright + `tos/05_…` | Pass |
| TC_052 | Contractual TO | Initial Action Required | Vendor App | **Pass** | Playwright / Maestro tos | Pass |
| TC_053 | Contractual TO | Multi TO assign contractual | TDO | **Pass** | Playwright + Maestro tos list | Admin multi-assign via Playwright; vendor list shows independent TOs |
| TC_054 | Contractual TO | TO Details sections | Vendor App | **Covered** | `tos/03_…` | Asserts Route / Products / Planned Schedule / Vehicle requirements |
| TC_055 | Contractual TO | Cannot see other vendor TO | Vendor App | **Pass** | Playwright | Pass |
| TC_056 | Contractual TO | Tenant isolation TOs | Vendor App | **Pass** | Playwright / DB | Pass |
| TC_057 | Contractual TO | No manual status change | Vendor App | **Pass** | Playwright | Pass |
| TC_058 | Contractual TO | Realtime TO status | Vendor App | **Pass** | Playwright | Pass |
| TC_059 | Driver & Vehicle | Driver Name required | Vendor App | **Covered** | `tos/04_…` | Passed |
| TC_060 | Driver & Vehicle | Driver Phone required | Vendor App | **Covered** | `tos/04_…` | Passed (empty submit) |
| TC_061 | Driver & Vehicle | Vehicle Number required | Vendor App | **Covered** | `tos/04_…` | Passed |
| TC_062 | Driver & Vehicle | Helper optional | Vendor App | **Pass** | Playwright | Pass |
| TC_063 | Driver & Vehicle | Submit → Submitted | Vendor App | **Pass** | Playwright | Pass |
| TC_064 | Driver & Vehicle | Edit after submit | Vendor App | **Covered** | `tos/06_…` + Playwright | Edit driver & vehicle → Reason for update required |
| TC_065 | Driver & Vehicle | Edit reflected admin | Mixed | **Pass** | Playwright | Updated driver/vehicle reflected via API/admin path |
| TC_066 | Driver & Vehicle | Driver Phone format | Vendor App | **Not Started** | — | Beyond empty-required assert |
| TC_067 | Driver & Vehicle | Independent per TO | Vendor App | **Pass** | Playwright | Pass |
| TC_068 | RFD & Trips | Admin Ready for Dispatch | Tenant Admin | **Pass** | Playwright | Pass |
| TC_069 | RFD & Trips | Trip visible after RFD | Vendor App | **Covered** | `trips/02_…` | Passed (Trips; PDF says Tracks) |
| TC_070 | RFD & Trips | Start trip from Trips | Vendor App | **Covered** | `trips/04_…` | Passed |
| TC_071 | RFD & Trips | Start blocked early | Vendor App | **Pass** | Playwright | Pass |
| TC_072 | RFD & Trips | Status Driving Towards Source | Vendor App | **Pass** | Playwright + Maestro | Pass |
| TC_073 | RFD & Trips | Planned schedule on Trips | Vendor App | **Covered** | `trips/02_…` | Active trip detail shows Planned Schedule / Route |
| TC_074 | Yard FG | FG yard workflow | Vendor App | **Skipped** | — | Full FG chain out of scope / Skip |
| TC_075 | Yard FG | Yard status realtime | Vendor App | **Skipped** | — | Out of scope |
| TC_076 | Yard FG | Auto-close after gate-out | Vendor App | **Skipped** | — | Out of scope |
| TC_077 | Yard FG | No manual Complete Trip | Vendor App | **Not Started** | — | Assert absence of CTA |
| TC_078 | Yard FG | Closed → Completed section | Vendor App | **Covered** | `trips/03_…` | Completed tab accessible; full yard auto-close remains Skipped elsewhere |
| TC_079 | Yard FG | In-progress → Pending | Vendor App | **Covered** | `trips/02_…` | In-progress stays under Active (not Completed) |
| TC_080 | Yard RM | RM QC-gated workflow | Vendor App | **Skipped** | — | Out of scope |
| TC_081 | Yard RM | RM auto-close | Vendor App | **Skipped** | — | Out of scope |
| TC_082 | Yard RM | Cannot skip yard stage | Vendor App | **Skipped** | — | Out of scope |
| TC_083 | Published Bids | Bid visible approved | Vendor App | **Covered** | `bids/01_…` | Passed |
| TC_084 | Published Bids | Bid hidden pending | Vendor App | **Covered** | `tenants/08_…` | Passed |
| TC_085 | Published Bids | Bid hidden contractual | Vendor App | **Covered** | `tenants/07_…` | Passed |
| TC_086 | Published Bids | Multi-TO single bid entry | Vendor App | **Covered** | `bids/03_…` | One BID entry for session; needs seed-vendor-bids-pw |
| TC_087 | Published Bids | Bidding window display | Vendor App | **Covered** | `bids/03_…` | Open / Time remaining / Closed cues on list or details |
| TC_088 | Bid Details | Bid details content | Vendor App | **Covered** | `bids/03_…` | Bid details + vehicle requirements / Submit |
| TC_089 | Bid Details | Both TOs in bid | Vendor App | **Covered** | `bids/03_…` | TO rows in bid details; prefer multi-TO seed |
| TC_090 | Bid Details | Per-TO independent details | Vendor App | **Not Started** | — | New depth from UAT |
| TC_091 | Bid Details | Per-TO source/dest | Vendor App | **Not Started** | — | New from UAT |
| TC_092 | Bid Details | Per-TO schedule | Vendor App | **Not Started** | — | New from UAT |
| TC_093 | Bid Details | Per-TO vehicle reqs | Vendor App | **Not Started** | — | New from UAT |
| TC_094 | Bidding | Bid both TOs | Vendor App | **Pass** | Playwright + Maestro partial | Pass (API); Maestro optional |
| TC_095 | Bidding | Bid single TO | Vendor App | **Pass** | Playwright + Maestro | Pass |
| TC_096 | Bidding | Bid remaining later | Vendor App | **Not Started** | — | New from UAT |
| TC_097 | Bidding | Update bid while open | Vendor App | **Not Started** | — | UAT allows edit; older Phase01 said lock — follow UAT |
| TC_098 | Bidding | Closed window blocked | Mixed | **Pass** | Playwright + `bids/07_…` | Pass (API); Maestro graceful skip |
| TC_099 | Bidding | Bid amount validation | Vendor App | **Covered** | `bids/05_…` | Blank / 0 / -50 / abc keep Submit disabled |
| TC_100 | Bidding | Update visible to TDO | TDO | **Not Started** | — | New from UAT |
| TC_101 | Bidding | Bid price privacy | Vendor App | **Pass** | Playwright | Pass |
| TC_102 | Award & Won | Won under Bids | Vendor App | **Not Started** | — | Won section — new UAT module |
| TC_103 | Award & Won | Sibling TO still open | Vendor App | **Pass** | Playwright + `bids/08_…` | Partial-award API + Won filter on mobile |
| TC_104 | Award & Won | Won TO on TOs tab | Vendor App | **Covered** | `tos/01_…` | Passed |
| TC_105 | Award & Won | Won TO Action Required | Vendor App | **Covered** | `tos/03_…` | Passed |
| TC_106 | Award & Won | Won same downstream | Vendor App | **Pass** | Playwright + `trips/04_…` | Driver→Submitted→RFD→Start (yard chain still Skipped) |
| TC_107 | Award & Won | Non-winner isolation | Vendor App | **Pass** | Playwright | Pass |
| TC_108 | Award & Won | Bid after winning one | Vendor App | **Not Started** | — | New from UAT |
| TC_109 | Award & Won | Winning amount read-only | Vendor App | **Not Started** | — | New from UAT |
| TC_110 | Award & Won | Win both independent | Vendor App | **Pass** | Playwright + `bids/08_…` | Independent TO progress via API; Won list on mobile |
| TC_111 | Won Section | Won section access | Vendor App | **Not Started** | — | New UAT module |
| TC_112 | Won Section | Won list + status | Vendor App | **Not Started** | — | New from UAT |
| TC_113 | Won Section | Bid while managing Won | Vendor App | **Not Started** | — | New from UAT |
| TC_114 | Won Section | Won independent metadata | Vendor App | **Not Started** | — | New from UAT |
| TC_115 | Won Section | Second award independent | Vendor App | **Not Started** | — | New from UAT |
| TC_116 | Won Section | Won realtime status | Vendor App | **Not Started** | — | New from UAT |

## Admin / Phase01 extras — TC_117–TC_160

| TC | Module | Title | Scope | Status | Automation | Notes |
|----|--------|-------|-------|--------|------------|-------|
| TC_117 | TO Creation (Admin) | Multiple TOs per TR | TP | **N/A** | — | Admin/TP — not mobile |
| TC_118 | TO Creation (Admin) | Exact batch TO count | TP | **N/A** | — | Admin |
| TC_119 | TO Creation (Admin) | Fleet type & status | TP | **N/A** | — | Admin |
| TC_120 | TO Creation (Admin) | Planned delivery date batch | TP | **N/A** | — | Admin |
| TC_121 | TO Creation (Admin) | Quantity cap | TP | **N/A** | — | Admin |
| TC_122 | TO Creation (Admin) | TDO queue routing | TDO | **N/A** | — | Admin |
| TC_123 | TO Creation (Admin) | Invalid TO count | TP | **N/A** | — | Admin |
| TC_124 | TO Creation (Admin) | TO creation audit | TP | **Skip** | — | PDF Skip |
| TC_125 | TO Creation (Admin) | Independent TO records | TP | **N/A** | — | Admin |
| TC_126 | Bid Publishing (Admin) | View Vendor Fleet TOs | TDO | **Pass** | Playwright bid-publishing | Pass |
| TC_127 | Bid Publishing (Admin) | Multi-select TOs for bid | TDO | **Pass** | Playwright | Pass |
| TC_128 | Bid Publishing (Admin) | NC Bidding form | TDO | **Pass** | Playwright | Pass |
| TC_129 | Bid Publishing (Admin) | Bid Open Date rule | TDO | **Partial** | Playwright | UI open optional; defaults now |
| TC_130 | Bid Publishing (Admin) | Bid Close Date rules | TDO | **Pass** | Playwright | Pass |
| TC_131 | Bid Publishing (Admin) | Reference budget optional | TDO | **Pass** | Playwright | Pass |
| TC_132 | Bid Publishing (Admin) | Locked auto fields | TDO | **Pass** | Playwright | Pass |
| TC_133 | Bid Publishing (Admin) | Publish bidding | TDO | **Pass** | Playwright | Pass |
| TC_134 | Bid Publishing (Admin) | Bid lists member TOs | TDO | **Pass** | Playwright | Pass |
| TC_135 | Bid Publishing (Admin) | Publish needs ≥1 TO | TDO | **Pass** | Playwright | Pass |
| TC_136 | Bid Publishing (Admin) | Same TR constraint | TDO | **Pass** | Playwright | Pass |
| TC_137 | Bid Publishing (Admin) | Bid window min/max | TDO | **Pass** | Playwright | Pass |
| TC_138 | Bid Publishing (Admin) | Extend close date | TDO | **Pass** | Playwright | Pass |
| TC_139 | Bid Publishing (Admin) | No duplicate active bid | TDO | **Pass** | Playwright | Pass |
| TC_140 | Bid Publishing (Admin) | One vehicle per TO (publish) | TDO | **Pass** | Playwright | Pass |
| TC_141 | Award (Admin) | TDO view responded bids | TDO | **Pass** | Playwright tos | Pass |
| TC_142 | Award (Admin) | Award any vendor | TDO | **Pass** | Playwright | Pass |
| TC_143 | Award (Admin) | Split awards | TDO | **Pass** | Playwright | Pass |
| TC_144 | Award (Admin) | Award locked | TDO | **Pass** | Playwright | Pass |
| TC_145 | Award (Admin) | Close bid without award | TDO | **Pass** | Playwright | Pass |
| TC_146 | Award (Admin) | PARTIALLY_AWARDED | TDO | **Pass** | Playwright | Pass when multi-TO OPEN fixture seeded each run |
| TC_147 | Award (Admin) | Reject all bids for TO | TDO | **Pass** | Playwright | Pass |
| TC_148 | Contractual Assign (Admin) | Contractual assign TO | TDO | **Pass** | Playwright | Pass |
| TC_149 | Contractual Assign (Admin) | Contractual dropdown only | TDO | **Pass** | Playwright | Pass |
| TC_150 | Contractual Assign (Admin) | Rate hidden from vendor | Vendor App | **Covered** | `tos/05_…` | Passed |
| TC_151 | Dispatch & RBAC | RFD gated on confirm | TDO | **Pass** | Playwright | Pass |
| TC_152 | Dispatch & RBAC | Own Fleet TDO blocked | TDO | **Pass** | Playwright | Pass |
| TC_153 | Dispatch & RBAC | VF TDO Own Fleet blocked | TDO | **Pass** | Playwright | Pass |
| TC_154 | Dispatch & RBAC | TP access restricted | TP | **Pass** | Playwright | Pass |
| TC_155 | Dispatch & RBAC | Revoked vendor blocked | TDO | **Pass** | Playwright | Pass |
| TC_156 | Dispatch & RBAC | Early RFD blocked | TDO | **Pass** | Playwright | Pass |
| TC_157 | Trips (Mobile) | POD submission E2E | Vendor App | **Skipped** | — | POD still prototype / not automated |
| TC_158 | Audit | Bid publish audit | TDO | **Skip** | — | PDF Skip |
| TC_159 | Audit | Award audit | Backend | **Skip** | — | PDF Skip |
| TC_160 | Load | Concurrent bid load | Backend | **Skip** | — | Not Playwright |

## Feature file map

| File | TC range |
|------|----------|
| [02-registration-auth.md](./02-registration-auth.md) | TC_001–TC_026 |
| [03-onboarding-documents.md](./03-onboarding-documents.md) | TC_027–TC_035 |
| [04-tenant-join.md](./04-tenant-join.md) | TC_036–TC_042 |
| [05-tenant-approval-admin.md](./05-tenant-approval-admin.md) | TC_043–TC_050 |
| [08-transport-orders-vendor-app.md](./08-transport-orders-vendor-app.md) | TC_051–TC_067 |
| [09-trips-vendor-app.md](./09-trips-vendor-app.md) | TC_068–TC_082, TC_157 |
| [07-bids-vendor-app.md](./07-bids-vendor-app.md) | TC_083–TC_116 |
| [01-to-creation-vendor-fleet.md](./01-to-creation-vendor-fleet.md) | TC_117–TC_125 |
| [06-bid-publishing-admin.md](./06-bid-publishing-admin.md) | TC_126–TC_140 |
| [10-contractual-assignment-admin.md](./10-contractual-assignment-admin.md) | TC_148–TC_150 |
| [11-post-award-dispatch-rbac.md](./11-post-award-dispatch-rbac.md) | TC_141–TC_147, TC_151–TC_156, TC_158–TC_160 |

## Not Started (gap list — add Maestro / docs next)

- **TC_004** — Contact Person required (Create Account)
- **TC_007** — Mobile format (Create Account)
- **TC_008** — Duplicate mobile (Create Account)
- **TC_010** — Email AND mobile required (Create Account)
- **TC_022** — Wrong password (mobile) (Login)
- **TC_024** — Unregistered mobile (Login)
- **TC_025** — Incomplete registration blocked (Login)
- **TC_033** — Oversized file (Documents)
- **TC_034** — Upload fail retry (Documents)
- **TC_041** — Requested persists (Tenant Join)
- **TC_042** — No duplicate join (Tenant Join)
- **TC_066** — Driver Phone format (Driver & Vehicle)
- **TC_077** — No manual Complete Trip (Yard FG)
- **TC_090** — Per-TO independent details (Bid Details)
- **TC_091** — Per-TO source/dest (Bid Details)
- **TC_092** — Per-TO schedule (Bid Details)
- **TC_093** — Per-TO vehicle reqs (Bid Details)
- **TC_096** — Bid remaining later (Bidding)
- **TC_097** — Update bid while open (Bidding)
- **TC_100** — Update visible to TDO (Bidding)
- **TC_102** — Won under Bids (Award & Won)
- **TC_108** — Bid after winning one (Award & Won)
- **TC_109** — Winning amount read-only (Award & Won)
- **TC_111** — Won section access (Won Section)
- **TC_112** — Won list + status (Won Section)
- **TC_113** — Bid while managing Won (Won Section)
- **TC_114** — Won independent metadata (Won Section)
- **TC_115** — Second award independent (Won Section)
- **TC_116** — Won realtime status (Won Section)

