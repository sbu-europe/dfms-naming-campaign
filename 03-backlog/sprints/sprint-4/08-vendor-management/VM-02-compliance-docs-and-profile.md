---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Compliance Docs + Reference + Vehicles/Drivers under Vendor Profile
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# VM-02 — Compliance Docs + Reference + Vehicles/Drivers under Vendor Profile

## User Story

**As a** transport vendor  
**I want to** register my company and vehicles on DFMS  
**So that** I can participate in transport bidding and execute trips for the organization

## Business Context

Registration is only valid if the vendor provides required **compliance documents** and enough profile data to support later operations (vehicle/driver management under one vendor profile).

## Acceptance Criteria

### AC-1: Mandatory Compliance Document Upload
- [ ] Vendor must upload all mandatory documents before submission:
  - Trade License
  - BIN
  - TIN
- [ ] Submission is blocked until all mandatory documents are provided

### AC-2: Reference/Testimonial Capture
- [ ] Vendor can provide a testimonial/reference from Truck Association as part of the registration profile

### AC-3: Vehicle & Driver Capture (Phase 1)
- [ ] Vendor registration captures vehicle and driver data (minimum set for onboarding)
- [ ] System allows vendors to manage **multiple vehicles** under one profile

### AC-4: Resubmission-Friendly Data Model
- [ ] If a vendor is rejected, vendor can resubmit corrected information without losing the prior audit trail

### AC-5: Audit Trail for Data Changes
- [ ] All changes to registration data (documents, vehicles/drivers) are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL require document uploads (trade license, BIN, TIN) before submission.
- [ ] **[High]** Vendor registration form SHALL capture company, vehicle, driver, and compliance data.
- [ ] **[High]** System SHALL allow vendors to manage multiple vehicles under one profile.
- [ ] **[High]** System SHALL allow rejected vendors to resubmit corrected information.
- [ ] **[High]** All vendor registration attempts SHALL be logged for audit.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-02-1 | Document upload storage + validation (required docs) | ~ | Pending |
| VM-02-2 | Registration payload schema for vehicles/drivers | ~ | Pending |
| VM-02-3 | Multi-vehicle CRUD under vendor profile | ~ | Pending |
| VM-02-4 | Audit logging for changes + resubmissions | ~ | Pending |

## API Endpoints (suggested)

```
POST   /api/v1/vendors/registrations/{id}/documents
POST   /api/v1/vendors/registrations/{id}/vehicles
POST   /api/v1/vendors/registrations/{id}/drivers
PATCH  /api/v1/vendors/registrations/{id}
```

## Dependencies

- **Requires**: file storage mechanism; tenant scoping; audit log framework.
- **Enables**: VM-03 admin verification decisions rely on completeness/validity of these docs and profile data.

## Definition of Done

- [ ] Registration submission blocked without required docs
- [ ] Vendor can attach multiple vehicles (and related drivers) under one profile
- [ ] All mutations produce audit log entries

