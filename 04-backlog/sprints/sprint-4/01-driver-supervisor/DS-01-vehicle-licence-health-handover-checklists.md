---
jira_key: DFS-050
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
story_id: DS-01
title: Driver Supervisor — Vehicle Licence, Health & Handover Checklists
epic: Driver Supervisor & Crew
status: Pending
story_points: 5
assignee: ~
prd_refs:
  - "§6.6.1.2 Vehicle License and Health Management (Phase 1)"
---

# DS-01 — Vehicle Licence, Health & Handover Checklists

## User Story

**As a** Driver Supervisor  
**I want to** assign and review vehicle handover and inspection checklists, and set vehicle to Under Maintenance when needed  
**So that** only compliant vehicles enter **TO execution** and audit evidence exists for inspections

## Business Context

PRD §6.6.1.2 (Phase 1) separates **operational readiness** from master registration (MDM-05, Sprint 2). Checklists may gate **driver execution start** on a **TO** when the product policy requires supervisor approval or driver pre-trip completion.

## Acceptance Criteria

### AC-1: Checklist templates
- [ ] System supports admin-configurable templates for: long-distance trip inspection, short-distance trip inspection, monthly extensive checkup (categories per PRD)
- [ ] Each template supports **8–10** inspection points (configurable upper bound)

### AC-2: Driver completion & supervisor review
- [ ] Driver can complete assigned checklist for a **vehicle + TO** context: fuel level reading, vehicle condition (text), driver acknowledgement of TO assignment
- [ ] Supervisor can **approve** or **reject** submitted checklist with remarks
- [ ] Each submission stores: vehicle ID, checklist type, inspection category, date/time, responsible user, remarks; full history retained

### AC-3: Handover between drivers
- [ ] System enforces: **driver handover checklist completed** before vehicle is treated as handed over to a new primary driver (policy flag per tenant acceptable)

### AC-4: Vehicle status — Under Maintenance
- [ ] Supervisor can set vehicle status to **Under Maintenance** from checklist workflow
- [ ] Vehicle in Under Maintenance is **excluded** from new TDO assignment (aligns with TO-02 rules) and surfaced in supervisor list

### AC-5: Read-only status lens
- [ ] Supervisor view shows PRD Phase 1 status set: Available; Active – On the Way (Laden/Empty); Active – Waiting to Load; Active – Waiting to Unload; Idle; Scheduled/Parked; Under Maintenance *(read from **TO**/yard integration when TLS-01 lands — stub acceptable until integrated)*

## Sub-tasks

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| DS-01-1 | Checklist template model + admin API | DFS-050-1 | Pending |
| DS-01-2 | Driver checklist submit API + attachment to TO/vehicle | DFS-050-2 | Pending |
| DS-01-3 | Supervisor approve/reject API + audit | DFS-050-3 | Pending |
| DS-01-4 | Vehicle → Under Maintenance action + assignment guard integration | DFS-050-4 | Pending |
| DS-01-5 | Supervisor UI — queue of pending reviews + vehicle status board | DFS-050-5 | Pending |

## Access & Permissions

| Action | Role |
|--------|------|
| Configure templates | Tenant Admin (or delegated) |
| Submit driver checklist | Driver |
| Approve / reject; set Under Maintenance | Driver Supervisor |

## Dependencies

- **Requires**: MDM-05 (vehicles), TO-02 (assigned TO + vehicle link)
- **Enables**: DM-01 (optional policy: checklist approved before **first driver execution action** on TO)

## Definition of Done

- [ ] PRD §6.6.1.2 acceptance criteria met for template, capture, approval, history, Under Maintenance
- [ ] Audit log on all supervisor decisions
- [ ] Unit tests for status transition guards
- [ ] UAT: supervisor rejects checklist → driver resubmits → supervisor approves
