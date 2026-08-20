# Contractual / Awarded TOs & Driver–Vehicle (TC_051–TC_067)

**Source:** DFMS UAT — Contractual TO List & Details + Driver & Vehicle Information.
**Also covers** won-TO Action Required path (shared form with non-contractual awards).

| TC ID | Title | Scenario | Scope | Status | Automation | Notes |
|-------|-------|----------|-------|--------|------------|-------|
| TC_051 | Contractual sees assigned TO | Contractual vendor sees assigned TOs | Vendor App | **Pass** | Playwright + `tos/05_…` | Pass |
| TC_052 | Initial Action Required | New assigned TO status = Action Required | Vendor App | **Pass** | Playwright / Maestro tos | Pass |
| TC_053 | Multi TO assign contractual | Admin assigns multiple TOs to same contractual vendor | TDO | **Partial** | Playwright assign | Explicit multi-assign mobile assert weak |
| TC_054 | TO Details sections | TO Details: route, schedule, products, vehicle, dates | Vendor App | **Partial** | `tos/03_…` | Opens details; full section checklist weak |
| TC_055 | Cannot see other vendor TO | Cannot view TO assigned to another vendor | Vendor App | **Pass** | Playwright | Pass |
| TC_056 | Tenant isolation TOs | TOs only for approved tenant | Vendor App | **Pass** | Playwright / DB | Pass |
| TC_057 | No manual status change | Vendor cannot manually change TO status | Vendor App | **Pass** | Playwright | Pass |
| TC_058 | Realtime TO status | Realtime status updates in app | Vendor App | **Pass** | Playwright | Pass |
| TC_059 | Driver Name required | Driver Name mandatory | Vendor App | **Covered** | `tos/04_…` | Passed |
| TC_060 | Driver Phone required | Driver Phone mandatory + format | Vendor App | **Covered** | `tos/04_…` | Passed (empty submit) |
| TC_061 | Vehicle Number required | Vehicle Number mandatory | Vendor App | **Covered** | `tos/04_…` | Passed |
| TC_062 | Helper optional | Helper optional | Vendor App | **Pass** | Playwright | Pass |
| TC_063 | Submit → Submitted | Mandatory fields → status Submitted | Vendor App | **Pass** | Playwright | Pass |
| TC_064 | Edit after submit | Can edit driver/vehicle after submit (with rules) | Vendor App | **Partial** | Playwright PATCH reason | UAT edit path; API requires reason |
| TC_065 | Edit reflected admin | Updated info visible to admin/TDO | Mixed | **Partial** | Playwright | Partial |
| TC_066 | Driver Phone format | Rejects non-numeric / wrong length | Vendor App | **Not Started** | — | Beyond empty-required assert |
| TC_067 | Independent per TO | Each TO needs own driver/vehicle submit | Vendor App | **Pass** | Playwright | Pass |
