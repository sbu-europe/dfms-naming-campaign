---
jira_key: DFS-074
jira_type: Story
jira_sprint: "Sprint 6"
story_id: VAPP-02
title: Vendor App — Design & UX Improvements
epic: Vendor Mobile App
status: New — Sprint 6 Scope
story_points: 5
assignee: ~
related_stories:
  - VAPP-01 (release readiness — same release train)
  - VM-03, VM-05 (vendor portal views, bid submission UX — Sprint 5)
source_docs:
  - ../../sprint-5/08-vendor-management/VENDOR-TRIP-LIFECYCLE.md
  - ../../sprint-5/08-vendor-management/TO-BID-FLOW-REVISION.md
---

# VAPP-02 — Vendor App Design & UX Improvements

## User Stories

> **As a Vendor**, I want a clean, consistent app where the state of every bid and trip is obvious at a glance, so that I can act quickly and trust what I see.

---

## Acceptance Criteria

### AC-1 — Design System Consistency

- A documented mini design system (color palette incl. status colors, typography scale, spacing units, core components: buttons, cards, chips, inputs, dialogs) is applied across **all** screens.
- Status colors are consistent everywhere a status appears (bid status, trip status, document status) — same state, same color, same label wording.
- No screen mixes legacy and new component styles after the pass.

### AC-2 — Loading / Empty / Error States

- Every list screen (bids, trips, documents, notifications if present) has: a loading state (skeleton or spinner), a designed empty state with explanatory text and next-step hint, and an error state with retry.
- Every detail screen handles not-found/permission-denied with a designed state, not a blank screen.
- Pull-to-refresh available on all list screens, consistent with the tab auto-refresh behaviour (VM-03-10).

### AC-3 — Bid Screens

- Bid card hierarchy: `bid_number`, route (source → destination), TO count, bidding window with **countdown/closed label**, and own-bid status visible without opening the card.
- Winner/awarded state clearly badged; withdrawn state visually distinct from rejected.
- Bid submission screen: per-TO selection (`participating_to_ids`) with per-TO cost entry laid out for one-handed mobile use; review step before submit.

### AC-4 — Trip Lifecycle Screens

- Milestone timeline readable at a glance: completed / current / upcoming steps visually distinct; yard sub-states grouped under their milestone.
- Primary action (**Start Trip** / **Complete Trip**) rendered as a single prominent button only when actionable; disabled state explains why when not actionable.
- Lifecycle buckets (`assigned` / `in_progress` / `completed` / `closed`) use consistent tab styling and counts.

### AC-5 — Forms & Input UX

- Inline validation on all forms (registration, vehicle-driver submission, bid entry): field-level errors adjacent to the field, shown on blur/submit, cleared on correction.
- OTP entry uses a dedicated code-entry control with resend cooldown countdown.
- Document upload shows file name, size, upload progress, and a designed failure/retry state.

### AC-6 — App Identity

- Final app icon, splash screen, and display name applied; store listing assets (screenshots, short/long description) prepared for the release train (publication itself is post-UAT).

---

## Sub-tasks — Sprint 6

| # | Sub-task | Description | Priority | Status |
|---|----------|-------------|----------|--------|
| VAPP-02-1 | Design system pass | AC-1: palette, typography, spacing, core components applied app-wide | High | Not started |
| VAPP-02-2 | Loading/empty/error states | AC-2: all list + detail screens, pull-to-refresh | High | Not started |
| VAPP-02-3 | Bid screens refinement | AC-3: card hierarchy, window countdown, winner/withdrawn states, submission review step | Medium | Not started |
| VAPP-02-4 | Trip lifecycle refinement | AC-4: timeline readability, action button states, bucket tabs | Medium | Not started |
| VAPP-02-5 | Forms & input UX | AC-5: inline validation, OTP control, upload affordances | Medium | Not started |
| VAPP-02-6 | App identity | AC-6: icon, splash, name, store listing assets | Low | Not started |

---

## Definition of Done

- [ ] Design system documented and applied; no mixed-style screens remain (AC-1)
- [ ] All loading/empty/error states implemented and demonstrable by toggling network (AC-2)
- [ ] Bid and trip screens pass a PO walkthrough against AC-3/AC-4
- [ ] Form validation and OTP/upload UX verified on a physical device (AC-5)
- [ ] App identity assets final and included in the VAPP-01 release build (AC-6)
- [ ] No functional/API behaviour changes introduced — verified by re-running the VAPP-01 smoke checklist on the post-design build

---

## Dependencies

| Dependency | Direction | Note |
|------------|-----------|------|
| VAPP-01 release train | Coupled | Design changes must merge before the final VAPP-01 smoke record, or be explicitly excluded |
| PO availability | Review | AC-3/AC-4 walkthrough mid-sprint to avoid late rework |
| Design assets | External | Icon/brand assets needed for AC-6; request at sprint start |

---

*Epic: Vendor Mobile App | Phase: 1 | Sprint 6: 5 SP | Jira: DFS-074 | Last Updated: 2026-06-12*
