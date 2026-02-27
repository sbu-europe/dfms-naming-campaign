---
title: Sample Collection Event
story_id: US-082
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
phase: phase-1
module: Quality Control
priority: Medium
status: Pending
sprint: Sprint 10-11
story_points: 4
created: 2026-02-17
updated: 2026-02-17
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-078-sample-creation.md
  - US-085-sampling-timestamp.md
dependencies:
  - US-078-sample-creation.md (Sample must exist)
tags: [qc, quality-control, sampling, multi-side-sampling, phase-1]
---

# US-082: Sample Collection Event

## User Story

**As a** QC Supervisor  
**I want to** collect samples from multiple sides and record comments  
**So that** quality consistency is ensured

## Business Context

For certain products (e.g., bulk materials), samples must be collected from multiple sides:
- Top, Middle, Bottom sampling
- Moisture content recording per sample
- Average moisture calculation
- Quality consistency verification

**Key Requirements**:
- Record sampling side (Top/Middle/Bottom)
- Record moisture content per sample
- Calculate average moisture content
- Associate with vehicle and TO/Challan

---

## Acceptance Criteria

### AC-1: Multi-Side Sampling

#### AC-1.1: Sampling Side Recording
- [ ] System SHALL allow recording of sampling sides per sample (Top, Middle, or Bottom)
- [ ] System SHALL support multiple samples from same vehicle
- [ ] System SHALL link each sample to its sampling side
- [ ] System SHALL allow comments per sample

#### AC-1.2: Moisture Content Recording
- [ ] System SHALL allow recording moisture content values for multiple samples
- [ ] System SHALL store moisture content per sample
- [ ] System SHALL validate moisture content format (numeric)

### AC-2: Average Calculation

#### AC-2.1: Moisture Average
- [ ] System SHALL automatically calculate average moisture content across all samples for specific vehicle
- [ ] System SHALL associate calculated average with vehicle and TO/Challan record
- [ ] System SHALL display average moisture content

#### AC-2.2: Data Retention
- [ ] System SHALL retain data for QC evaluation and audit purposes
- [ ] System SHALL maintain sample-to-side mapping
- [ ] System SHALL store individual and average values

---

## Functional Requirements

### FR-1: Sampling Side Management
- System SHALL support Top/Middle/Bottom selection
- System SHALL allow multiple samples per side
- System SHALL track sampling side per sample

### FR-2: Moisture Calculation
- System SHALL calculate average: Sum(moisture values) / Count(samples)
- System SHALL round average to configured decimal places
- System SHALL validate calculation accuracy

---

## Business Rules

- Multiple samples allowed per vehicle
- Sampling side must be recorded
- Moisture content mandatory for certain products
- Average calculated automatically

---

## Dependencies

- **US-078**: Sample Creation (samples must exist)
- **US-076**: Unload Start/End Date & Time Entry (unloading must complete)

---

## Technical Notes

- Sampling side stored as enum (Top/Middle/Bottom)
- Moisture content stored as decimal
- Average calculation performed on save

---

## Testing Scenarios

1. **Scenario 1**: Record samples from multiple sides → All recorded correctly
2. **Scenario 2**: Enter moisture content → Values saved per sample
3. **Scenario 3**: Calculate average → Average computed correctly
4. **Scenario 4**: Multiple vehicles → Averages calculated independently

---

## Definition of Done

- [ ] Multi-side sampling working
- [ ] Moisture content recorded per sample
- [ ] Average moisture calculated automatically
- [ ] Data associated with vehicle/TO
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Code reviewed
- [ ] UAT approved

---

**Last Updated**: 2026-02-17  
**Source**: `source-documents/04-wbs/stories-table.md` (WBS - Source of Truth)

