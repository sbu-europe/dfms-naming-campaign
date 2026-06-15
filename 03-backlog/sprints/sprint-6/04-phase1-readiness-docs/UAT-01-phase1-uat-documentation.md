---
jira_key: DFS-076
jira_type: Story
jira_sprint: "Sprint 6"
story_id: UAT-01
title: Phase 1 UAT Documentation
epic: Phase 1 Readiness & Documentation
status: New — Sprint 6 Scope
story_points: 5
assignee: ~
related_stories:
  - E2E-01 (shared seed data; E2E pass is a UAT entry criterion)
  - DOC-01 (user manual — testers' reference during UAT)
---

# UAT-01 — Phase 1 UAT Documentation

## User Stories

**As a** Product Owner / customer stakeholder
**I want** role-based UAT scripts traceable directly to PRD acceptance criteria
**So that** I can formally verify that the system does what was specified, and sign off Phase 1 acceptance with documented evidence — not just a verbal "it works."

**As a** UAT coordinator
**I want** agreed entry/exit criteria, a defect severity model, and triage cadence decided **before** UAT starts
**So that** UAT runs to schedule without mid-session disputes about what counts as a blocking defect or whether a cosmetic issue should hold acceptance.

---

## Business Context

### UAT as the formal customer acceptance gate for Phase 1

DFMS Phase 1 will close with customer-facing User Acceptance Testing. Unlike internal sprint demos, UAT is run by the customer's own staff (or designated testers), following scripted scenarios, and producing a signed acceptance record. This is a contractual gate — UAT pass is the trigger for Phase 1 go-live.

If UAT starts without:
- A written test plan with entry/exit criteria → sessions run without a definition of "done."
- Role-based scenario scripts → testers improvise, miss coverage, and raise inconsistent defects.
- A traceability matrix → the customer cannot verify that every PRD acceptance criterion was tested.
- An agreed defect workflow → mid-UAT disputes over severity block progress.

This story produces the **complete UAT documentation package** before UAT execution begins (execution itself is post-sprint with the customer). It is the documentation-and-preparation story; E2E-01 is the internal evidence gate.

### UAT and E2E are parallel quality layers

E2E-01 (Sprint 6 internal testing) verifies that the system works end-to-end against a staging environment with automated/scripted tests. UAT-01 produces the scripts that customer testers will use against the same (or production) environment with live user sessions.

The **seed data pack** is shared: UAT-01-4 derives its seed specification from E2E-01-1, so both layers test against the same known world. Scenario steps in UAT scripts will mirror E2E journey assertions — the difference is audience (customer tester following a script vs automated runner).

### Scope boundary

UAT execution — actual testing sessions with the customer, raising defects, retesting, sign-off — is a **post-sprint activity** not in Sprint 6 scope. UAT-01 delivers only the documentation and preparation. The E2E-01 coverage report is a UAT **entry criterion**: UAT does not begin until the coverage report shows all critical journeys passing.

### Traceability: why it matters for acceptance

A PRD with 50+ acceptance criteria spread across 20 modules must be systematically traced to UAT scenarios. Without a traceability matrix:
- The customer cannot verify completeness ("was PR-module AC-3 actually tested?").
- Deferred Phase 2 items may be inadvertently included in UAT scope, causing confusion when they "don't work."
- Phase 1 acceptance scope is ambiguous.

The UAT-01-3 traceability matrix explicitly lists: every Phase 1 PRD AC → the UAT scenario that covers it → the owning story. Deferred items (Phase 2/3) appear in the matrix with a deferral reference — no ambiguity.

---

## Acceptance Criteria

### AC-1 — UAT Test Plan

- Plan document covering: scope (all Phase 1 modules incl. GPS-01 dashboard, vendor app on the VAPP-01 release build), participating roles and named testers, environment, schedule/sessions, and responsibilities (coordinator, scribe, dev support).
- **Entry criteria** defined — at minimum: E2E-01 coverage report published with journeys passing, UAT environment seeded, DOC-01 manual available, VAPP-01 smoke record green.
- **Exit criteria** defined — at minimum: all critical/high scenarios passed, no open critical defects, agreed disposition for every open medium/low defect, sign-off sheets complete.

### AC-2 — Scenario Catalog

- Role-based UAT scripts for every Phase 1 module, written as business scenarios (precondition → numbered steps → expected result), executable by a non-developer following the DOC-01 manual.
- Coverage includes the cross-module journeys (mirroring E2E-01-2 … E2E-01-8): FG outbound own-fleet end-to-end, RM inbound port shipment with QC pass/fail, on-demand TO, vendor non-contractual bid-to-closure, contractual assignment, stock lifecycle, dashboard KPI verification, and GPS dashboard (POI layer, arrival/departure events, dwell flags).
- Negative/permission scenarios included per role (e.g. gateman cannot access maps dashboard; vendor cannot see contracted rate).

### AC-3 — Traceability Matrix

- Matrix linking **PRD §6.x acceptance criteria ↔ UAT scenario ID ↔ owning story** for all Phase 1 PRD sections in scope; gaps (PRD items deferred to Phase 2/3) explicitly listed with their deferral reference so acceptance scope is unambiguous.

### AC-4 — UAT Environment & Seed Data

- UAT environment defined (instance, access, reset procedure) and a seed data pack specified: demo tenant, all roles with named test users, ≥2 POIs with L/U points + geofences + stock baselines, vehicles/drivers, contractual + non-contractual vendors, product master data.
- Seed pack is shared with / derived from the E2E-01-1 pack so UAT and E2E verify the same world.

### AC-5 — Defect Workflow

- Defect log template (ID, scenario ref, severity, evidence, status) and severity definitions (critical/high/medium/low) agreed with PO **before** UAT starts; triage cadence and re-test rule documented.

### AC-6 — Sign-off Package

- Per-module sign-off sheet (scenarios run, pass/fail counts, open defects, signature block) plus an overall **Phase 1 Acceptance Record** template referencing the traceability matrix and E2E-01 coverage report.

---

## Access & Permissions

UAT-01 is a **documentation story** — no new API endpoints or system RBAC changes. Access considerations are about who authors, reviews, and uses the UAT package.

| Role | Involvement |
|------|-------------|
| Product Owner | Approves entry/exit criteria (AC-1), defect severity definitions (AC-5), and the sign-off package template (AC-6) |
| UAT Coordinator (BA or Sprint Lead) | Authors the test plan (AC-1), scenario catalog (AC-2), traceability matrix (AC-3), and sign-off package (AC-6) |
| Module-owning developers | Provide precondition setup steps and expected results for scenarios in their module |
| Customer/stakeholder testers | Execute UAT scenarios during the post-sprint UAT sessions (not Sprint 6 scope) |
| Tenant Admin (named UAT user) | Has full read access in the UAT environment including the audit viewer |
| All other named UAT test users | Access scoped to their role (Gateman UAT user can only access gate screens; vendor UAT account only vendor screens) |

### UAT environment RBAC (seeded test users)

The seed data pack (UAT-01-4) must include named test users for each of the following roles. RBAC must be verified during UAT by logging in as each test user and confirming access scope:

| UAT test user | Role | Access scope verified in UAT |
|---------------|------|------------------------------|
| `uat_depot_officer` | Depot/Feed Mill Officer | PR creation, stock view at their POI |
| `uat_distribution_manager` | Distribution Manager | TR approval, capacity warnings |
| `uat_transport_planner` | Transport Planner | TO/Trip creation, GPS dashboard, assignment |
| `uat_tdo_own` | TDO — Own Fleet | Own-fleet vehicle assignment, bid creation |
| `uat_tdo_vendor` | TDO — Vendor Fleet | Vendor-fleet Bid creation, evaluation, award |
| `uat_gateman` | Gateman | Gate-in/out, on-demand TO; NO maps dashboard |
| `uat_scaling` | Scaling Operator | Scale-in/out; NO TR approval |
| `uat_cc_officer` | Command Center Officer | CC queue, bay assignment |
| `uat_qc_inspector` | QC Inspector | QC sampling, pass/fail |
| `uat_driver_supervisor` | Driver Supervisor | Checklist, maintenance queue |
| `uat_driver` | Driver | Trip Start/Complete (driver mobile only) |
| `uat_vendor_admin` | Vendor Admin | Registration, vehicle-driver submission |
| `uat_vendor` | Vendor (operator) | Bid discovery, submission, withdrawal |
| `uat_tenant_admin` | Tenant Admin | Full read + configuration + audit viewer |

> **Negative access tests must be scripted**: the scenario catalog (AC-2) must include at least one scenario per role that verifies a forbidden action returns an appropriate error (e.g. Gateman attempts to open GPS dashboard → should see 403/no menu item; Vendor attempts to view contracted rate → should not appear in any screen or API response).

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| UAT-01-1 | UAT test plan | AC-1: scope, roles, schedule, entry/exit criteria | High | Not started |
| UAT-01-2 | Scenario catalog | AC-2: role-based scripts per module + cross-module journeys + negative cases | High | Not started |
| UAT-01-3 | Traceability matrix | AC-3: PRD AC ↔ scenario ↔ story, with explicit deferral list | High | Not started |
| UAT-01-4 | Environment + seed data pack | AC-4: UAT instance, reset procedure, seed spec shared with E2E-01-1 | High | Not started |
| UAT-01-5 | Defect workflow | AC-5: log template, severity definitions, triage cadence — agreed with PO | Medium | Not started |
| UAT-01-6 | Sign-off package | AC-6: per-module sheets + Phase 1 Acceptance Record template | High | Not started |

---

## Definition of Done

- [ ] Test plan with entry/exit criteria approved by PO (AC-1)
- [ ] Scenario catalog complete for all Phase 1 modules and journeys; dry-run of at least one office, one yard, and one mobile script by a non-author (AC-2)
- [ ] Traceability matrix complete with explicit deferral list (AC-3)
- [ ] UAT environment + seed pack specified and provisioned once successfully (AC-4)
- [ ] Defect workflow agreed with PO (AC-5)
- [ ] Sign-off package templates delivered (AC-6)

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| E2E-01 | Upstream | Coverage report is a UAT entry criterion; seed pack shared via E2E-01-1 |
| DOC-01 | Parallel | Scripts reference manual chapters; align terminology and screenshots |
| GPS-05 / VAPP-01 | Upstream | GPS dashboard and vendor-app release scenarios depend on Sprint 6 delivery |
| PO / customer availability | External | Entry/exit criteria, severity definitions, and schedule need PO agreement mid-sprint |

---

*Epic: Phase 1 Readiness & Documentation | Phase: 1 | Sprint 6: 5 SP | Jira: DFS-076 | Last Updated: 2026-06-15*
