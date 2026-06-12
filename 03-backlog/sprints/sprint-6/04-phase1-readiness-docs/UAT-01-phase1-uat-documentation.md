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

> **As a Product Owner / customer stakeholder**, I want role-based UAT scripts traceable to the PRD so that I can verify the system does what was specified and formally accept Phase 1.

> **As a UAT coordinator**, I want entry/exit criteria, a defect workflow, and a sign-off package agreed in advance so that UAT runs to schedule.

---

## Context

Phase 1 closes with customer-facing User Acceptance Testing across all modules delivered in Sprints 1–6. This story produces the **complete UAT package** — plan, role-based scenario scripts traceable to PRD acceptance criteria, environment/seed-data definition, defect workflow, and sign-off sheets — so that UAT execution (scheduled after Sprint 6) starts with zero documentation gaps.

This story is the documentation and preparation; **UAT execution itself is a separate post-sprint activity** with the customer. The E2E-01 coverage report is the internal evidence gate before UAT begins.

---

## Business Value

- A traceable UAT package converts Phase 1 acceptance from opinion into evidence: every PRD AC maps to a scenario, every scenario to a result, every result to a sign-off.
- Pre-agreed defect severity and triage rules prevent mid-UAT disputes about what blocks acceptance.

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

*Epic: Phase 1 Readiness & Documentation | Phase: 1 | Sprint 6: 5 SP | Jira: DFS-076 | Last Updated: 2026-06-12*
