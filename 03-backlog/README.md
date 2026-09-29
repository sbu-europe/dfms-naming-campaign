# 03-backlog — Product Backlog

> **User stories, sub-tasks, improvements, and feedback resolution, organised sprint-wise**
> (plus unscheduled Phase 2 planning stories)

## Overview

This folder contains the DFMS product backlog, organised by sprint. Each
`phase-1/sprints/sprint-N/` folder is self-contained: stories, sub-task tables, status,
`improvements/` (UX/design polish work), and `feedback-resolution.md` (post-demo feedback
tracking) all live together for that sprint.

Unscheduled Phase 2 planning stories (not assigned to a sprint) live in
[`phase-2/stories-phase-2/`](phase-2/stories-phase-2/README.md).

## Structure

### `phase-1/sprints/` — Phase 1 sprint backlog (current source of truth)

See [`phase-1/sprints/README.md`](phase-1/sprints/README.md) for the full sprint index (Sprint 1–9+).

| Sprint | Folder | Focus |
|--------|--------|-------|
| Sprint 1 | `phase-1/sprints/sprint-1/` | Infrastructure, Platform Admin, Client Portal |
| Sprint 2 | `phase-1/sprints/sprint-2/` | Master Data, User Management, Vehicle Tracking |
| Sprint 3 | `phase-1/sprints/sprint-3/` | Requisition, Transport Requests & Orders |
| Sprint 4 | `phase-1/sprints/sprint-4/` | Trip Execution & Closure |
| Sprint 5–9+ | `phase-1/sprints/sprint-5/` … | See [`phase-1/sprints/README.md`](phase-1/sprints/README.md) for current scope |

### `phase-2/stories-phase-2/` — Phase 2 planning (unscheduled)

Stories that define Phase 2 scope but are not on a sprint board. See
[`phase-2/stories-phase-2/README.md`](phase-2/stories-phase-2/README.md).

### `phase-1-sprint-plan.md` — Phase 1 Sprint Overview

High-level sprint-by-sprint table from the original Phase 1 plan. Treat as historical
context — for current scope and status, use `phase-1/sprints/sprint-N/README.md`.

### Archived: `stories/` (flat pre-Sprint-2 backlog)

The original flat `US-XXX` story list has been retired. It's archived at
[`../_meta/archive/backlog-stories-pre-sprint2/`](../_meta/archive/backlog-stories-pre-sprint2/README.md)
for historical reference only — do not use it as current source of truth. Sprint 2's
breakdown still keeps nine of those stories alongside it (in `phase-1/sprints/sprint-2/.../US-XXX-*.md`)
because they hold the full data models/UI specs/test scenarios; everything else has either
been superseded by a self-contained sprint story or has no Phase 1 equivalent yet.

## Quick Access

| I need… | Go to… |
|---------|--------|
| Current sprint story/status | `phase-1/sprints/sprint-N/README.md` |
| Sprint index | `phase-1/sprints/README.md` |
| Phase 2 planning stories (unscheduled) | `phase-2/stories-phase-2/README.md` |
| Full sprint plan (historical) | `phase-1-sprint-plan.md` |
| An old pre-Sprint-2 story (reference only) | `../_meta/archive/backlog-stories-pre-sprint2/US-XXX-*.md` |

---

**Last Updated**: 2026-09-09
**Total Sprints**: 9+ (Phase 1, in progress)
