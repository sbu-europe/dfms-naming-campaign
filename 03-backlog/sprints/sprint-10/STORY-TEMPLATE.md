# Sprint 10 — Story file template

Sprint 10 story files follow the same structure as Sprint 6 stories (e.g. [`VAPP-01`](../../sprint-6/03-vendor-app/VAPP-01-release-readiness-live-api.md)).

## Required sections (per story `.md`)

1. **YAML frontmatter** — `jira_key`, `jira_type`, `jira_sprint`, `story_id`, `title`, `epic`, `status`, `story_points`, `phase`, `related_stories`, `source_docs`, `module_spec`
2. **User Story** (or User Stories for multi-persona)
3. **Business Context**
4. **Acceptance Criteria** — `AC-1`, `AC-2`, …
5. **API Endpoints** — existing backend routes the story calls or adds
6. **Access & Permissions** — role matrix
7. **Sub-tasks — Sprint 10** — table with `#`, Priority, Status (mirrors sprint `README.md` index)
8. **Dependencies** — upstream/downstream table
9. **Definition of Done** — checklist
10. **Footer** — `*Epic: … | Phase: … | Sprint 10: X SP | Last Updated: …*`

## Epic folders

| Folder | Stories |
|--------|---------|
| `01-fuel-management/` | FM-01 – FM-05 |
| `02-vehicle-parts/` | VP-01 – VP-03 |
| `03-vehicle-reports/` | VR-01 – VR-03 |

Sprint-level sub-task index remains in [`../README.md`](../README.md) for cross-epic overview.
