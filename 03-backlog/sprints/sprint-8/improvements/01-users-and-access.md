---
title: Sprint 8 Improvements — Users & Access
module: 01-users-and-access
menu: Users / Drivers · Invite · Bulk I/O
parent: ./README.md
---

# Users & Access

**Admin menu / area:** Users / Drivers · Invite · Bulk I/O  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-001](#fb-001--phone-number-normalization-on-bulk-user-upload--driver-import) | Phone number normalization on bulk user upload & driver import | Medium | Resolved |
| [FB-002](#fb-002--invitation-channel-email--single-email-field-on-manual-add-and-import) | Invitation channel email: single email field on manual add and import | Medium | Resolved |
| [FB-003](#fb-003--driver-invitation-bulk-importexport--add-reference-contacts--address) | Driver invitation bulk import/export: add reference contacts & address | Medium | Resolved |
| [FB-004](#fb-004--driver-bulk-upload--optional-accident-history--last-training-assessment-info) | Driver bulk upload: optional accident history & last training assessment info | Medium | Resolved |

---

## FB-001 — Phone number normalization on bulk user upload & driver import

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Bulk User Upload; Driver bulk import (phone validation) |
| **Closing Sub-tasks** | FB-001-1 — Strip hyphens from phone numbers on bulk user upload and driver import · FB-001-2 — Prefix leading `0` when missing · FB-001-3 — Validate normalized phone is exactly **11 digits** after hyphen strip and optional leading-`0` add |
| **AC Amendment** | On **Bulk User Upload** and **Driver** bulk import, the system SHALL **exclude hyphens** from phone data when present, SHALL **add a leading `0`** when missing, and SHALL require the normalized phone number to be **11 digits** (after stripping hyphens and adding the leading `0` if needed). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Implemented via `apps.core.phone.normalize_bd_mobile` (`coerce_bd_mobile` / `validate_bd_mobile_import`) on `UserImportConfig.phone_number` and `DriverImportConfig.contact_number`. Hyphens/spaces stripped; missing leading `0` accepted (10-digit national); invalid length rejected; persisted as E.164 `+8801XXXXXXXXX`. E2E: [`fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md`](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-009-phone-normalization-bulk-user-driver-import-e2e-scenarios.md) **8/8 Pass** (2026-08-03). |

### Improvement observation

Phone number validation fails during Bulk User Upload and driver import when numbers include hyphens or omit the leading zero. The system should normalize before validate: strip hyphens, add leading `0` if missing, then require 11 digits.

### Current vs expected behaviour

| Aspect | Current (after FB-001) | Expected (FB-001) |
|--------|------------------------|-------------------|
| Hyphen in phone | Stripped before validate; import succeeds | **Exclude (strip) hyphen** from data |
| Missing leading `0` | Accepted; normalized to E.164 | **Add leading `0`** when missing |
| Length after normalize | Invalid local length rejected; valid → E.164 | Exactly **11 digits** (local); persist E.164 |

### Closing checklist

- [x] FB-001-1 — Strip hyphens from phone on bulk user upload & driver import
- [x] FB-001-2 — Add leading `0` when missing
- [x] FB-001-3 — Normalized phone must be 11 digits

---

## FB-002 — Invitation channel email: single email field on manual add and import

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Manual user/driver add (invitation); bulk import when invitation channel is email |
| **Closing Sub-tasks** | FB-002-1 — When invitation channel is **email**, email is mandatory and collected **once** on manual add (aligned with backend) · FB-002-2 — Apply the same single-email behaviour on **import** (do not require / present a second email entry) |
| **AC Amendment** | When **invitation channel** is **email**, **email SHALL be mandatory** and SHALL be entered **once** on manual add, matching backend behaviour. The same **single-email** rule SHALL apply on **import** (email typed once on add must not be duplicated or left unchanged incorrectly during import). |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Backend already treats email as a single field; UI / import path should match. Driver import drops second `email` column; `user_email` mirrors onto `Driver.email` (manual-add parity). |

### Improvement observation

On manual add, when invitation channel is email, email is mandatory and is typed once as the backend expects. That single-email behaviour has not been applied correctly on import — import should also use email once, consistent with the backend.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-002) |
|--------|---------|-------------------|
| Manual add (channel = email) | Email mandatory; typed once (backend-aligned) | Unchanged — email once, mandatory |
| Import (channel = email) | Single-email behaviour not applied | Email **once**, same as backend / manual add |

### Closing checklist

- [x] FB-002-1 — Manual add: email mandatory once when invitation channel is email (confirm parity with backend)
- [x] FB-002-2 — Import: apply same single-email behaviour

---

## FB-003 — Driver invitation bulk import/export: add reference contacts & address

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Driver invitation bulk import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-003-1 — Add **reference contact 1**, **reference contact 2**, and **address** columns to driver invitation bulk import · FB-003-2 — Include the same columns on driver invitation bulk export |
| **AC Amendment** | Driver invitation **bulk import** and **bulk export** SHALL include columns for **reference contact 1**, **reference contact 2**, and **address**. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | Extends driver invitation bulk I/O template / export columns. E2E: [`fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md`](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-011-driver-invitation-bulk-import-export-reference-address-e2e-scenarios.md). |

### Improvement observation

Driver invitation bulk import/export is missing reference and address fields needed for onboarding. Add columns for reference contact 1, reference contact 2, and address.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-003) |
|--------|---------|-------------------|
| Reference contact 1 | Not in bulk I/O | Column on import **and** export |
| Reference contact 2 | Not in bulk I/O | Column on import **and** export |
| Address | Not in bulk I/O | Column on import **and** export |

### Closing checklist

- [x] FB-003-1 — Import template / validate / import include reference contact 1, reference contact 2, address
- [x] FB-003-2 — Export includes the same columns

---

## FB-004 — Driver bulk upload: optional accident history & last training assessment info

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-03 |
| **Affected Stories** | Driver bulk upload / import / export (template, validate, import, export) |
| **Closing Sub-tasks** | FB-004-1 — Add optional **accident_history** column to driver bulk upload · FB-004-2 — Add optional **last_training_assessment_info** column to driver bulk upload · FB-004-3 — Include the same optional columns on driver bulk export |
| **AC Amendment** | Driver **bulk upload** (import) and **export** SHALL include optional columns for **accident_history** and **last_training_assessment_info**. Empty values are allowed. |
| **Status** | Resolved |
| **Priority** | Medium |
| **Notes** | `DriverImportConfig`: optional `accident_history` + `last_training_assessment_info` on import/export. E2E: [`fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md`](../../../../09-testing/backend/e2e-scenarios/sprint-8/fb-012-driver-bulk-import-export-accident-history-training-assessment-e2e-scenarios.md) **6/6 Pass** (2026-08-03). |

### Improvement observation

Driver bulk upload should also carry **accident_history** and **last_training_assessment_info**. Both columns are **optional**.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| accident_history | Optional on import **and** export | Optional column on import **and** export |
| last_training_assessment_info | Optional on import **and** export | Optional column on import **and** export |

### Closing checklist

- [x] FB-004-1 — Import template / validate / import include optional `accident_history`
- [x] FB-004-2 — Import template / validate / import include optional `last_training_assessment_info`
- [x] FB-004-3 — Export includes the same optional columns
