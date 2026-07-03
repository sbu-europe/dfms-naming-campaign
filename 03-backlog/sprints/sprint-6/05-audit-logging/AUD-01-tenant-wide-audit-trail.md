---
jira_key: DFS-082
jira_type: Story
jira_sprint: "Sprint 6"
story_id: AUD-01
title: Tenant-Wide Audit Trail — Unified Audit Logging & Tenant Admin Visibility
epic: Audit & Compliance
status: New — Sprint 6 Scope
story_points: 5
assignee: ~
prd_refs:
  - "§6.2.7 User Activity & Audit Logs"
  - "§10.3 Audit & Compliance"
  - "§6.3 Master Data Configuration — audit logging mandates (CRUD, bulk, soft delete)"
phase: Phase 1
related_stories:
  - DS-01-14 / DS-01-17 (supervisor action + return-to-service audit — Sprint 5)
  - DS-02-17 (driver state / attendance / leave audit — Sprint 5)
  - LUP-01-7 (L/U point mutation audit — Sprint 5)
  - VM-01-7 / VM-06-7 (vendor registration + bid award audit — Sprint 5)
  - POD-01-10 (closure attempt audit — Sprint 5)
  - STK-01-8 (POIStockMovementLog — Sprint 5)
  - GPS-02-3 (geofence config audit — Sprint 6)
---

# AUD-01 — Tenant-Wide Audit Trail & Tenant Admin Visibility

## User Story

**As a** Tenant Admin
**I want** a single, filterable, read-only audit log view covering every action taken by every user in my tenant — from login events to transport order approvals to geofence configuration changes
**So that** I can answer "who did what, when, and under which role" without navigating to module-specific logs that may not even exist for some actions.

**As a** Tenant Admin
**I want** the audit log to be immutable, retained for at least 2 years, and exportable as CSV
**So that** I have defensible compliance evidence for any operational dispute, regulatory inquiry, or customer audit.

*(PRD §6.2.7, §10.3)*

---

## Business Context

### The problem: fragmented, incomplete audit logging

Phase 1 of DFMS spans 19+ stories and 10+ operational modules. Each story that shipped in Sprints 3–5 wired its own audit hooks independently:

| Story | What was logged |
|-------|----------------|
| DS-01 | Vehicle under-maintenance action (partial) |
| DS-02 | Driver state / attendance / leave changes |
| LUP-01 | Loading/unloading point mutations |
| VM-01 | Vendor registration |
| VM-06 | Bid award |
| POD-01 | Closure attempts |
| STK-01 | Stock movement log (`POIStockMovementLog`) |

The result: real coverage in pockets, but **no tenant-wide guarantee**. A Tenant Admin cannot answer "what did this user do last Tuesday?" without knowing which module log to search — and some high-sensitivity actions (login failures, role changes, TO approvals, gate overrides) are not audited at all.

PRD §6.2.7 and §10.3 make this a **Phase 1 obligation**, not a Phase 2 improvement. A Tenant Admin asking "who approved this Transport Order at 02:30 AM?" must be answerable from a single screen before UAT sign-off.

### What AUD-01 does — three things

1. **Defines a unified audit event standard** — one schema, one `AuditLog` store (or normalized read model), capturing who/what/when/where for every event. Existing Sprint 4/5 logs are **mapped onto** this standard, not rewritten — Sprint 5 work is reused, not discarded.
2. **Closes coverage gaps** — runs a documented gap analysis per module, wires all High-classified gaps (auth events, TO approvals, role changes, deletions, overrides) in this sprint.
3. **Gives Tenant Admin a single audit viewer** — filtered, paginated, detail-view, CSV exportable — so compliance is demonstrable from one screen.

### What "role at time of action" means

Roles in DFMS can change — a user may be promoted, have a role removed, or be deactivated. The audit log must capture the **role held at the time the action was performed**, not the user's current role. If a user was a Distribution Manager when they approved a TR, the audit record must say "Distribution Manager" even if they have since been deactivated. This is a PRD §6.2.7 requirement and is the primary reason why the unified standard requires storing role on every audit event rather than resolving it later.

### System-actor events

Some high-value actions are triggered by the system rather than a user — Celery tasks closing TOs, TLS-01 auto-transitions, geofence engine events. These are logged with `actor = system` plus the triggering context (task name, triggering event type). This provides a complete trail even for automated actions.

### Authentication events (§6.2.7 mandatory list)

The following auth events are explicitly mandated by PRD §6.2.7 and are currently not covered:
- Login (success and failure)
- Logout
- Password reset (self-service and admin-assisted)
- Failed login attempts (count leading to lockout)
- Account lockout event
- Session timeout

AUD-01 wires these in the auth/session layer as part of AC-2 High-gap closure.

### Integrity and retention

PRD §10.3 mandates:
- **Immutable audit records** — no update, delete, or soft-delete on audit rows; corrections as new events only.
- **2-year minimum retention** — configurable per tenant; archival/purge behaviour beyond retention documented.
- **Tamper-proof** (§10.3 language): guard against ORM accidental updates; tested.

---

## Acceptance Criteria

### AC-1 — Unified audit event standard

- A single tenant-scoped audit event standard (central `AuditLog` store, or a normalized read model over existing logs — decision recorded) capturing for every event:
  - **Who**: user ID + display name, and the **role held at the time of the action** (stored on the event, not resolved later — roles change).
  - **What**: action verb, entity type + ID, human-readable summary, and old → new values for field-level changes.
  - **When**: timestamp (timezone-explicit).
  - **Where/How**: source module, POI/site context where applicable, origin (admin UI / API / system), IP address and device identifier where the request context provides them (§6.2.7).
- System-initiated actions (auto-transitions, Celery tasks, TLS-01 hooks) logged with `actor = system` and the triggering context.
- Existing Sprint 4/5 audit writes (DS, LUP, VM, POD, STK et al.) **map onto or emit** the standard — no duplicate parallel logging, no loss of already-captured history.

### AC-2 — Coverage gap analysis & closure

- A documented audit coverage matrix lists every Phase 1 **mutating action** per module (authentication events; user/role/permission administration; master data CRUD incl. bulk; PR/TR/TO transitions and approvals; gate/scale/CC/loading/QC/POD actions; vendor onboarding, bidding, award, execution; stock; geofence/dwell config) with its audit status: covered / gap.
- All gaps classified **High** (sensitive: approvals, overrides, role changes, deletions, auth events) are wired in this sprint; remaining gaps get a recorded owner and target.
- Login, logout, failed attempts, lockout, and password reset events logged per §6.2.7.

### AC-3 — Tenant Admin audit viewer

- A read-only audit log view for Tenant Admin: filters for **date range, user, role, module, entity type, action type** (per §6.2.7 / §6.19.5 filter mandates), free-text search on summary, and a detail view showing old → new values.
- Pagination performs acceptably at expected volumes (define and test against a seeded high-volume dataset).
- Export of a filtered result set (CSV) for compliance reporting (§10.3).

### AC-4 — Access control

- Only **Tenant Admin** (and platform admin) can access the viewer; all other roles receive 403 — enforced and unit-tested.
- Tenant isolation: a Tenant Admin sees only their tenant's events, verified in the multi-tenant test setup.
- Access to the audit viewer is itself an audited event.

### AC-5 — Integrity & retention

- Audit records are **append-only and immutable**: no update/delete via admin, API, or ORM convention (guard tested); corrections happen as new events.
- Retention policy implemented: **2-year minimum** default, configurable per tenant (§6.2.7, §10.3); archival/purge behaviour beyond retention documented.
- Audit write failures must not break the business operation (Sprint 5 "audit helpers swallow failures" decision retained) — but failures are logged and surfaced in monitoring, so silent audit loss is detectable.

---

## API Endpoints

```
# Tenant Admin audit viewer — read-only
GET   /api/v1/audit-log/
      ?date_from=ISO8601&date_to=ISO8601
      &user_id={uuid}
      &role={role_slug}
      &module={module_slug}                   # e.g. transport_orders, vendor_management, auth, master_data
      &entity_type={type}                     # e.g. TransportOrder, Vehicle, Vendor, User
      &action_type={verb}                     # e.g. approved, created, deleted, login_failed
      &q={free_text_search}
      &page={n}&page_size={n}
      Response: paginated list of AuditEvent { id, timestamp, actor_user_id, actor_display_name,
                actor_role_at_time, action_verb, entity_type, entity_id, entity_summary,
                module, poi_id, origin (admin_ui|api|system), ip_address, device_id,
                old_values (JSON), new_values (JSON), summary }

# Audit event detail
GET   /api/v1/audit-log/{event_id}/
      Response: full AuditEvent as above

# CSV export of filtered result set
GET   /api/v1/audit-log/export/?{same_filter_params}
      Response: Content-Type: text/csv; attachment

# No write endpoints — audit records are created only by the internal audit service,
# never by a user-facing API call. No PATCH, PUT, or DELETE on any audit-log resource.
```

> **Access to `GET /api/v1/audit-log/`** itself generates an audit event (`action_verb: audit_log_accessed`, `actor: Tenant Admin user`). This is the AC-4 "viewer access audited" requirement.

---

## Access & Permissions

| Action | Role |
|--------|------|
| View the tenant-wide audit log (read-only viewer) | Tenant Admin only |
| Filter, search, paginate the audit log | Tenant Admin only |
| View audit event detail (old → new values) | Tenant Admin only |
| Export filtered audit log as CSV | Tenant Admin only |
| Access any `/api/v1/audit-log/**` endpoint | Tenant Admin only — 403 for all other roles |
| Write / create audit events | **System only** — internal audit service; no user-facing write endpoint |
| Edit or delete any audit event | **Nobody** — append-only; immutable; no admin override |
| View platform-wide audit (all tenants) | Super Admin / Platform Admin (separate platform-level surface, not in DFMS tenant scope) |

> **Tenant isolation is enforced**: `GET /api/v1/audit-log/` returns only events scoped to the authenticated Tenant Admin's tenant. Cross-tenant leakage is a critical security defect. Verified by the multi-tenant test case (AC-4).

> **What other roles see**: Operational roles (TP, TDO, Gate Staff, Driver Supervisor, etc.) do not have access to the audit viewer. They can see status history and timeline events for their own workflows (e.g. `GET /api/v1/transport-orders/{id}/timeline`), but not the global audit trail. This is intentional — the audit trail is a compliance tool for admins, not an operational tool for staff.

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| AUD-01-1 | Audit event standard | AC-1: schema/model decision, role-at-time-of-action capture, system-actor convention | High | Not started |
| AUD-01-2 | Coverage matrix + gap closure | AC-2: per-module matrix; wire all High-classified gaps incl. auth events | High | Not started |
| AUD-01-3 | Legacy log mapping | AC-1: map Sprint 4/5 module logs onto the standard without duplication or history loss | High | Not started |
| AUD-01-4 | Tenant Admin viewer | AC-3: filtered read-only changelist, detail view, CSV export, volume test | High | Not started |
| AUD-01-5 | Access control | AC-4: Tenant Admin-only RBAC, tenant isolation test, audited access | High | Not started |
| AUD-01-6 | Integrity & retention | AC-5: immutability guard, retention config, audit-failure monitoring | Medium | Not started |

---

## Definition of Done

- [ ] Audit standard implemented; role-at-time-of-action captured on every event (AC-1)
- [ ] Coverage matrix published; all High gaps closed, remaining gaps owned and targeted (AC-2)
- [ ] Sprint 4/5 module logs visible through the unified surface without duplication (AC-1, AC-3)
- [ ] Tenant Admin can answer "who did what, when, as which role" from one screen with filters + export (AC-3)
- [ ] RBAC and tenant isolation verified by tests; viewer access audited (AC-4)
- [ ] Immutability and retention demonstrated; audit-failure monitoring in place (AC-5)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| Sprint 4/5 audit hooks | Reuses | DS/LUP/VM/POD/STK logs map onto the standard (AUD-01-3) |
| GPS-02 geofence config audit | Aligns | New Sprint 6 audit writes should emit the AUD-01 standard directly |
| Auth/session layer | Integration | Login/logout/lockout event capture (AC-2) |
| E2E-01 harness | Shared | Audit assertions piggyback on journey scenarios (events present after each journey step) |
| UAT-01 / DOC-01 | Consumers | UAT scenario + Tenant Admin manual chapter for the audit viewer |

---

*Epic: Audit & Compliance | Phase: 1 | Sprint 6: 5 SP | PRD: §6.2.7, §10.3, §6.3 | Jira: DFS-082 | Last Updated: 2026-06-15*
