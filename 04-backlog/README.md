# 04-backlog — Product Backlog

> **User stories, epics, sprint plans, and phase organisation for DFMS implementation**

## Overview

This folder contains the complete product backlog for DFMS:
- **18 epics** — High-level feature themes
- **104 user stories** — Detailed implementation tasks
- **18 sprints** across Phase 1

## Structure

### `stories/` — User Stories (Implementation Tasks)
**104 user stories** in a single flat folder for easy access.

**Format**: `US-XXX-feature-name.md`

**Benefits of flat structure**:
- Easy search: Find any story instantly
- LLM-optimised: Shorter paths = fewer tokens
- Simple references across documentation

### `sprints/` — Sprint Breakdown
Sprint-by-sprint backlog with stories, sub-tasks, status, and post-demo feedback.

| Sprint | Folder | Focus |
|--------|--------|-------|
| Sprint 1 | `sprints/sprint-1/` | Infrastructure, Platform Admin, Client Portal |
| Sprint 2 | `sprints/sprint-2/` | Master Data, User Management, Vehicle Tracking |
| Sprint 3 | `sprints/sprint-3/` | Requisition, Transport Requests & Orders |
| Sprint 4 | `sprints/sprint-4/` | Trip Execution & Closure |

### `phase-1-sprint-plan.md` — Phase 1 Sprint Overview
High-level sprint-by-sprint table of all 18 sprints with epics, story IDs, and story points.

---

## Quick Access

| I need… | Go to… |
|---------|--------|
| A specific user story | `stories/US-XXX-*.md` |
| Sprint 3 backlog | `sprints/sprint-3/README.md` |
| Full sprint plan | `phase-1-sprint-plan.md` |

---

**Last Updated**: 2026-04-20
**Total Stories**: 104
**Total Sprints**: 18 (Phase 1)
