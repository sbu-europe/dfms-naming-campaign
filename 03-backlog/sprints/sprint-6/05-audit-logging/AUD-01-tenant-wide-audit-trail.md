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
  - "§6.3 Master Data Management — audit logging mandates (CRUD, bulk, soft delete)"
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

> **As a Tenant Admin**, I want audit logs implemented consistently throughout my tenant so that I have full visibility of **who did what, when, and under which role** — across every module — from a single place.

---

## Context

Audit logging was delivered **piecemeal** across Sprints 3–5, each story wiring its own hooks: supervisor actions (DS-01-14), driver state/attendance/leave (DS-02-17), L/U point mutations (LUP-01-7), vendor registration and bid awards (VM-01-7, VM-06-7), TO closure attempts (POD-01-10), stock movements (STK-01-8), and Sprint 6 adds geofence config (GPS-02-3). The result is real coverage in pockets but **no tenant-wide guarantee and no single view**: a Tenant Admin cannot answer "what did this user do last Tuesday" without knowing which module-specific log to look in — and some mutating actions are not audited at all.

This story does three things: defines **one audit event standard**, runs a **coverage gap analysis** across every Phase 1 mutating action and closes the gaps, and gives the Tenant Admin a **single read-only audit viewer** with the filters PRD §6.2.7 requires. Existing module logs are mapped onto the standard — not rewritten — so Sprint 5 work is reused, not discarded.

The PRD's authentication-event logging (login/logout/failed attempts/lockout, §6.2.7) is included; the Phase 3 audit *reporting* suite (§6.19.5) is explicitly out of scope.

---

## Business Value

- **Accountability**: every sensitive action traceable to a person, their role at that moment, and a timestamp — the basis for resolving operational disputes (who overrode the capacity guard, who reopened a bid).
- **Compliance**: PRD §6.2.7 and §10.3 make immutable, retained, filterable audit logs a Phase 1 obligation — this story is the acceptance evidence.
- **UAT/Phase 1 readiness**: auditors and the customer get one demonstrable surface instead of a tour through module-specific logs.

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

*Epic: Audit & Compliance | Phase: 1 | Sprint 6: 5 SP | PRD: §6.2.7, §10.3, §6.3 | Jira: DFS-082 | Last Updated: 2026-06-12*
