---
title: Sprint 9 Improvements — Bulk Import Validation Status Filter
module: 02-bulk-import-validation-filter
menu: Master Data · Users · Drivers · Bulk I/O
parent: ./README.md
---

# Bulk Import — Validation Status Filter

**Admin menu / area:** Master Data · Users · Drivers · Bulk I/O  
**Tracker index:** [README.md](./README.md)

> **Resolution Status values**: `Open` → `In Progress` → `Resolved`

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| [FB-004](#fb-004--filter-valid-and-invalid-records-after-excel--bulk-import) | Filter Valid and Invalid records after Excel / bulk import | Medium | Open |

---

## FB-004 — Filter Valid and Invalid records after Excel / bulk import

| Field | Value |
|-------|-------|
| **Source** | Internal improvement — 2026-08-21 |
| **Affected Stories** | Master Data Excel / bulk import; User bulk import; Driver bulk import |
| **Closing Sub-tasks** | FB-004-1 — Status filter (Valid / Invalid) on Master Data import result / imported-record list · FB-004-2 — Same Status filter on User bulk import result / imported-record list · FB-004-3 — Same Status filter on Driver bulk import result / imported-record list · FB-004-4 — Clear / reset filter restores all imported records · FB-004-5 — Filter available to Tenant Admin and Tenant Super Admin |
| **AC Amendment** | After an Excel / bulk file is uploaded and imported (Master Data, User import, and Driver import), each imported record SHALL have a validation status. The system SHALL provide a **Status** filter with options **Valid** and **Invalid**. **Valid** SHALL show only records that passed required validation checks. **Invalid** SHALL show only records that failed one or more validation checks. Users SHALL be able to clear / reset the filter to view all imported records. The filter SHALL be available to **Tenant Admin** and **Tenant Super Admin**. |
| **Status** | Open |
| **Priority** | Medium |
| **Notes** | Scope is **not** Master Data only — same Valid / Invalid Status filter behaviour applies to **User** and **Driver** import flows as well. |

### Improvement observation

After Excel / bulk import, imported rows carry a validation status (valid vs failed checks), but there is no Status filter to isolate Valid or Invalid records. Admins need that filter on Master Data, User, and Driver import results so they can review failures without scanning the full list.

### Current vs expected behaviour

| Aspect | Current | Expected (FB-004) |
|--------|---------|-------------------|
| Post-import record list | All imported rows; no Valid / Invalid Status filter | **Status** filter with **Valid** and **Invalid** |
| Filter = Valid | N/A | Only records that passed validation |
| Filter = Invalid | N/A | Only records that failed one or more checks |
| Clear / reset filter | N/A | Show **all** imported records again |
| Roles | N/A | **Tenant Admin** and **Tenant Super Admin** |
| Scope | N/A | Master Data **and** User import **and** Driver import |

### Closing checklist

- [ ] FB-004-1 — Master Data: Status filter Valid / Invalid on imported records
- [ ] FB-004-2 — User import: same Status filter
- [ ] FB-004-3 — Driver import: same Status filter
- [ ] FB-004-4 — Clear / reset filter shows all imported records
- [ ] FB-004-5 — Available to Tenant Admin and Tenant Super Admin
