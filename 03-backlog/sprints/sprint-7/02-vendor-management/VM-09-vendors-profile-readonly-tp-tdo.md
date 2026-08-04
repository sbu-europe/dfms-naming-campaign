---
jira_key: ~
jira_type: Story
jira_sprint: "Sprint 7"
story_id: VM-09
title: Vendors Profile — TP & TDO Read-Only Vendor List
epic: Vendor Management — Vendors Profile
status: New — Sprint 7 Scope
story_points: 3
assignee: ~
prd_refs:
  - "Vendors Profile Version 1.0, Phase 1"
phase: Phase 1
version: "1.0"
related_stories:
  - VM-02 (Vendor ↔ Tenant Join & Approval)
  - Sprint 6 FB-027 (Tenant Admin multi-select accept/reject vendors)
---

# VM-09 — Vendors Profile: TP & TDO Read-Only Vendor List

## User Story

**As a** Transport Planner (TP) or TDO (Vendor Fleet)  
**I want to** view the vendor list in **read-only** mode  
**So that** I can review vendor information and status without being able to create, edit, or delete vendor records.

---

## Business Context

Tenant Admin owns vendor management actions (approve, reject, suspend, create/edit/delete as applicable). TP and TDO need visibility into approved / tenant vendor profiles for planning and assignment context, but must not mutate vendor records.

---

## Acceptance Criteria

### AC-1 — Access to Vendor List

- [ ] **TDO** and **TP** can access the **Vendor List** view page.
- [ ] Users can **view** vendor details and **status**.
- [ ] Users can **search** the vendor list.

### AC-2 — Read-only enforcement

- [ ] Users **cannot** create, edit, approve, reject, suspend, or delete vendor records.
- [ ] All vendor management actions are **hidden or disabled** for TDO and TP users.

---

## Functional Requirements

| Priority | Requirement |
|----------|-------------|
| **Critical** | System SHALL provide **read-only** access to the Vendor List for **TDO** and **TP** roles. |
| **Critical** | System SHALL prevent TDO and TP users from performing any vendor management actions. |
| **High** | System SHALL allow users to **search**, **filter**, and **sort** the vendor list. |
| **High** | System SHALL display the **latest** vendor information and status in real time. |

---

## Sub-tasks

| # | Sub-task | Status | Priority |
|---|----------|--------|----------|
| VM-09-1 | RBAC — grant Vendor List **view** (menu + read) to `transport_planner` and `tdo_vendor_fleet`; do **not** grant write / approve / reject / suspend / delete | Pending | Critical |
| VM-09-2 | Admin Vendor List — TP/TDO can open list, view details & status; search / filter / sort work | Pending | Critical |
| VM-09-3 | Hide or disable all management actions (Add, Change, Approve, Reject, Suspend, Delete, bulk actions) for TP/TDO | Pending | Critical |
| VM-09-4 | Server-side permission guards — block mutating vendor endpoints / admin actions even if UI is bypassed | Pending | Critical |
| VM-09-5 | Tests — TP/TDO can list/search/view; cannot mutate; Tenant Admin management path unchanged | Pending | High |

---

## Current vs expected behaviour

| Aspect | Current (assumed) | Expected (VM-09) |
|--------|-------------------|------------------|
| TP / TDO Vendor List access | Missing or incomplete | Can open Vendor List |
| View details & status | — | Allowed (read-only) |
| Search / filter / sort | — | Allowed |
| Create / edit / approve / reject / suspend / delete | May be exposed or blocked inconsistently | **Hidden/disabled** + server-side blocked for TP/TDO |
| Tenant Admin vendor management | Unchanged | Unchanged |

---

## Out of Scope

- Changing Tenant Admin vendor approval / reject / suspend workflows
- Vendor Mobile self-service profile editing
- Granting TP/TDO any write or lifecycle actions on vendors

---

## Definition of Done

- [ ] TP and TDO can open Vendor List, view details/status, and search/filter/sort
- [ ] TP and TDO cannot create, edit, approve, reject, suspend, or delete vendors (UI + server)
- [ ] Vendor management actions are hidden or disabled for TP and TDO
- [ ] Latest vendor information and status are shown on list/detail
- [ ] Unit / permission tests cover read-only vs Tenant Admin write path
- [ ] AC-1 and AC-2 checkboxes above are satisfied
