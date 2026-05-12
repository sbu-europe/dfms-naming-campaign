---
jira_key: ~
jira_type: Story
jira_epic: ~
jira_sprint: "Sprint 4"
title: Compliance Docs + Testimonial/Reference + Company Profile (no vehicle/driver master data)
epic: Vendor Onboarding & Verification
status: Pending
story_points: ~
assignee: ~
---

# VM-02 — Compliance Docs + Testimonial/Reference + Company Profile

## User Story

**As a** transport vendor  
**I want to** complete my company registration with required compliance documents on DFMS  
**So that** I can complete onboarding and later participate in transport operations for tenants I join

## Business Context

Registration is only valid if the vendor provides required **compliance documents** and **company profile** data. There is **no** separate Platform Admin verification gate; completeness here is what allows the vendor to be treated as **platform-active** and proceed to tenant join (**VM-03**). Vendors **do not** configure **vehicle master data** or **driver master data** during onboarding; fleet and driver capture belong to **post-award / execution** flows (for example VM-08), not VM-02.

## Acceptance Criteria

### AC-1: Mandatory Compliance Document Upload
- [ ] Vendor must upload all mandatory documents before submission:
  - Trade License
  - BIN
  - TIN
- [ ] Submission is blocked until all mandatory documents are provided

### AC-2: Reference/Testimonial Capture
- [ ] Vendor can provide a testimonial/reference from Truck Association as part of the registration profile

### AC-3: Resubmission-Friendly Data Model
- [ ] Vendor can update registration documents / profile fields after initial submission without losing the prior audit trail (e.g. corrections or renewed documents)

### AC-4: Audit Trail for Data Changes
- [ ] All changes to registration data (documents, company profile fields, testimonial) are logged for audit

## Functional Requirements (from PRD)

- [ ] **[Critical]** System SHALL require document uploads (trade license, BIN, TIN) before submission.
- [ ] **[High]** Vendor registration SHALL capture company profile and compliance data **only** (no vehicle or driver master registration in this story).
- [ ] **[High]** System SHALL allow vendors to update registration documents/profile with full audit trail (no platform-admin reject loop in current scope).
- [ ] **[High]** All vendor registration attempts SHALL be logged for audit.

## Sub-tasks (implementation checklist)

| # | Sub-task | Jira | Status |
|---|----------|------|--------|
| VM-02-1 | Document upload storage + validation (required docs) | ~ | Pending |
| VM-02-2 | Registration profile schema (company, contacts, testimonial, documents) — **exclude** vehicle/driver master payloads | ~ | Pending |
| VM-02-3 | Audit logging for document/profile changes + resubmissions | ~ | Pending |

## API Endpoints (suggested)

```
POST   /api/v1/vendors/registrations/{id}/documents
PATCH  /api/v1/vendors/registrations/{id}
```

## Dependencies

- **Requires**: file storage mechanism; tenant scoping; audit log framework.
- **Enables**: Platform-active vendor record + audit trail; tenant join (**VM-03**) and portal visibility assume mandatory docs + profile are present per product rules.

## Definition of Done

- [ ] Registration submission blocked without required docs
- [ ] Registration payloads do **not** require or persist vendor-managed vehicle/driver master data (aligned with VM-08 for execution-time capture)
- [ ] All mutations produce audit log entries
