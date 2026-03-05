---
title: QC Lab Testing Workflow
story_id: US-044
phase: phase-1
module: Quality Control
priority: Critical
status: Pending
epic: Quality Control & Quality Assurance Workflow
epic_id: EPIC-014
epic_name: Quality Control & Quality Assurance Workflow
sprint: Sprint 8
story_points: 5
created: 2026-02-11
updated: 2026-02-11
source_documents:
  - ../../../../source-documents/01-prd/PRD_DFMS_v1.0.md
  - ../../../03-module-specifications/04-poi-operations/qc-workflow.md
  - ../../../../source-documents/discovery-phase/questionnaires/Questionnaires_DFMS_BN_2025-09-25.docx
  - ../../../../source-documents/discovery-phase/meeting-minutes/Meeting_Minutes_NOURISH_DFMS_Distribution_2025-09-30.docx
  - ../../../source-documents/04-wbs/stories-table.md
  - ../../../source-documents/04-wbs/epics-table.md
related_stories:
  - US-042-qc-sampling-creation.md
  - US-045-qc-pass-fail-decision.md
dependencies:
  - US-042-qc-sampling-creation.md (Must have samples created)
tags: [qc, lab-testing, quality, workflow, critical]
---

# US-044: QC Lab Testing Workflow

## User Story

**As a** Lab Technician  
**I want to** scan sample QR codes, conduct lab tests, record results, and upload reports  
**So that** quality decisions can be made based on accurate, traceable laboratory analysis

## Business Context

Lab testing is a **critical quality gate** for certain product categories (e.g., live birds, raw materials, temperature-sensitive goods). Unlike physical inspection which happens at the loading/unloading site, lab tests require specialized equipment and controlled environments.

**Key Business Requirements**:
- **Traceability**: Every sample must be traceable from collection → testing → results → decision
- **QR Code Tracking**: Physical samples tagged with QR codes ensure no mix-ups
- **Configurable Tests**: Different products require different tests (microbiological, chemical, physical)
- **Report Archival**: Lab reports must be stored for compliance and audit trails
- **Time-bound Results**: Testing SLAs must be met to avoid transport delays

**Example Scenario**:
- **Product**: Live Bird consignment from supplier
- **Sample Created**: QC Supervisor creates sample at gate
- **Sample Sent**: Physical sample sent to lab with QR code label
- **Lab Test**: Technician scans QR, conducts health tests, uploads report
- **Decision**: QC Manager reviews report and approves/rejects consignment

---

## Acceptance Criteria

### AC-1: Sample QR Code Scanning

#### AC-1.1: QR Code Scan
- [ ] System SHALL provide QR code scanner interface (camera-based or manual entry)
- [ ] System SHALL validate QR code belongs to an active sample
- [ ] System SHALL retrieve sample details upon successful scan
- [ ] System SHALL display error if QR code is invalid or sample not found
- [ ] System SHALL prevent scanning samples with status "Testing Complete" or "Archived"

#### AC-1.2: Sample Details Display
- [ ] System SHALL display retrieved sample information:
  - Sample ID
  - TO Number
  - Product Name & Category
  - Sample Collection Date & Time
  - Sample Collector (QC Supervisor name)
  - Sampling Location (POI)
  - Sample Type (e.g., Random, Composite, Stratified)
  - Number of Sub-samples
  - Expected Tests (pre-configured for product category)
  - Current Status
- [ ] System SHALL allow Lab Technician to verify sample physically matches details
- [ ] System SHALL provide "Confirm Sample" and "Report Discrepancy" actions

### AC-2: Test Configuration Selection

#### AC-2.1: Auto-Load Test Checklist
- [ ] System SHALL auto-load required tests based on product category
- [ ] System SHALL display test checklist with:
  - Test Name
  - Test Method/Standard (e.g., ISO 17025)
  - Expected Parameters (e.g., pH range, microbial count limits)
  - Mandatory vs Optional flag
  - Estimated Time
- [ ] System SHALL allow Lab Technician to add additional tests if needed
- [ ] System SHALL mark mandatory tests with visual indicator (e.g., asterisk)

#### AC-2.2: Test Parameter Configuration
- [ ] System SHALL display input fields for each test parameter:
  - Numerical values (with unit of measurement)
  - Dropdowns (e.g., Pass/Fail, Color ranges)
  - Text fields (for observations)
- [ ] System SHALL show acceptable ranges per parameter
- [ ] System SHALL validate entered values are within possible ranges
- [ ] System SHALL highlight values outside acceptable range (yellow/red)

### AC-3: Test Execution & Data Entry

#### AC-3.1: Test Recording
- [ ] System SHALL allow Lab Technician to record test results per parameter
- [ ] System SHALL timestamp each parameter entry
- [ ] System SHALL support multi-device input (desktop, tablet)
- [ ] System SHALL auto-save progress periodically
- [ ] System SHALL allow saving partial results as "In Progress"

#### AC-3.2: Test Result Validation
- [ ] System SHALL validate all mandatory tests are completed before submission
- [ ] System SHALL calculate overall test result: PASS / FAIL / INCONCLUSIVE
- [ ] System SHALL flag any parameters outside acceptable limits
- [ ] System SHALL require remarks if any test fails

#### AC-3.3: Test Report Upload
- [ ] System SHALL allow uploading lab test report documents
- [ ] System SHALL support file formats: PDF, DOCX, XLSX, JPG, PNG
- [ ] System SHALL limit file size to 10 MB per file
- [ ] System SHALL allow multiple file uploads (e.g., multiple test reports)
- [ ] System SHALL thumbnail preview for uploaded files
- [ ] System SHALL store files securely with sample reference

### AC-4: Lab Status Management

#### AC-4.1: Status Updates
- [ ] System SHALL update sample status automatically:
  - "Sample Received in Lab" (on first scan)
  - "Testing In Progress" (on first parameter entry)
  - "Testing Complete" (on final submission)
- [ ] System SHALL timestamp each status change
- [ ] System SHALL notify QC Supervisor when status changes
- [ ] System SHALL prevent editing after "Testing Complete" (allow view-only)

#### AC-4.2: Lab Workflow Tracking
- [ ] System SHALL display lab queue dashboard:
  - Samples "Pending Testing"
  - Samples "In Progress"
  - Samples "Completed Today"
  - Average testing time per sample
- [ ] System SHALL sort samples by priority and arrival time
- [ ] System SHALL highlight overdue samples (exceeded SLA)

### AC-5: Test Result Submission

#### AC-5.1: Final Submission
- [ ] System SHALL require Lab Technician to review all results before submission
- [ ] System SHALL display summary:
  - All test results
  - Pass/Fail status per test
  - Overall recommendation (Pass / Fail / Retest)
  - Uploaded documents count
- [ ] System SHALL require digital signature or approval from Lab Technician
- [ ] System SHALL forward results to QC Manager for decision (next user story)
- [ ] System SHALL lock sample editing after submission

#### AC-5.2: Retest Scenario
- [ ] System SHALL allow marking sample for "Retest" with reason
- [ ] System SHALL reset sample status to "Pending Testing"
- [ ] System SHALL maintain history of previous test attempts
- [ ] System SHALL generate new QR code for retest sample (optional)

---

## Functional Requirements

### FR-001: QR Code Scanning
- [Critical] System SHALL integrate with device camera for QR scanning (mobile/tablet)
- [Critical] System SHALL support manual QR code entry (keyboard input)
- [Critical] System SHALL validate QR format: `SAMPLE-YYYYMMDD-XXXX`
- [High] System SHALL provide "Scan Next" quick action after completing a sample
- [Medium] System SHALL maintain scan history log

### FR-002: Sample Retrieval
- [Critical] System SHALL fetch sample data via API: `GET /api/v1/qc/samples/{qr_code}`
- [Critical] System SHALL handle error cases:
  - QR not found → "Invalid QR code"
  - Sample already tested → "Sample testing complete, cannot retest"
  - Sample archived → "Sample archived, contact QC Manager"
- [High] System SHALL cache sample data for offline access

### FR-003: Test Checklist Auto-Load
- [Critical] System SHALL load test templates based on: `product_category_id`
- [Critical] System SHALL populate test parameters from master configuration
- [High] System SHALL allow Lab Admin to configure test templates
- [Medium] System SHALL support versioning of test templates

**Test Template Example**:
```json
{
  "product_category": "Live Birds",
  "tests": [
    {
      "test_name": "Health Inspection",
      "mandatory": true,
      "parameters": [
        {"name": "Disease Symptoms", "type": "dropdown", "options": ["None", "Mild", "Severe"]},
        {"name": "Weight (kg)", "type": "number", "min": 0.5, "max": 3.0},
        {"name": "Visual Observations", "type": "text"}
      ]
    },
    {
      "test_name": "Microbial Test",
      "mandatory": true,
      "parameters": [
        {"name": "Salmonella Count (CFU)", "type": "number", "max_acceptable": 100},
        {"name": "E.coli Count (CFU)", "type": "number", "max_acceptable": 50}
      ]
    }
  ]
}
```

### FR-004: Test Data Entry
- [Critical] System SHALL provide responsive form for test result entry
- [Critical] System SHALL validate input types (number, text, dropdown)
- [Critical] System SHALL enforce mandatory fields
- [Critical] System SHALL highlight out-of-range values
- [High] System SHALL auto-calculate overall pass/fail per test
- [High] System SHALL support copy-paste for bulk parameter entry
- [Medium] System SHALL support voice input (future enhancement)

### FR-005: File Upload
- [Critical] System SHALL validate file types: `.pdf, .docx, .xlsx, .jpg, .png`
- [Critical] System SHALL validate file size ≤ 10 MB
- [Critical] System SHALL upload files to secure storage (S3 / Azure Blob)
- [Critical] System SHALL store file metadata: name, size, upload_time, uploader
- [High] System SHALL generate thumbnail for images
- [High] System SHALL support drag-and-drop upload
- [Medium] System SHALL scan files for viruses

### FR-006: Lab Dashboard
- [High] System SHALL display real-time lab queue metrics
- [High] System SHALL filter by: Date, Product Category, Status, Technician
- [High] System SHALL sort by: Priority, Arrival Time, SLA
- [High] System SHALL export lab performance reports
- [Medium] System SHALL visualize testing trends (charts)

### FR-007: Notification System
- [High] System SHALL send notification on status change:
  - To QC Supervisor: "Sample [ID] testing started"
  - To QC Manager: "Sample [ID] testing complete, awaiting decision"
- [High] System SHALL send SLA breach alerts
- [Medium] System SHALL send daily summary email to Lab Manager

---

## Business Rules

### BR-QC-048: QR Code Uniqueness
- Each sample QR code must be unique across all samples
- Format: `SAMPLE-YYYYMMDD-XXXX`
- **Enforcement**: Database unique constraint

### BR-QC-049: Sample Status Progression
- Status flow: `Created → Sample Sent → Sample Received → Testing In Progress → Testing Complete → Archived`
- **Enforcement**: State machine validation

### BR-QC-050: Mandatory Test Completion
- All tests marked "mandatory" must be completed before submission
- **Enforcement**: Frontend + backend validation

### BR-QC-051: Parameter Range Validation
- Numeric parameters outside acceptable range trigger "Out of Range" warning
- **Action**: Flag for review, require remarks

### BR-QC-052: Lab Testing SLA
- Lab testing must be completed within:
  - Critical priority: 4 hours
  - High priority: 8 hours
  - Normal priority: 24 hours
- **Enforcement**: Dashboard alerts, notifications

### BR-QC-053: Test Result Immutability
- Once submitted, test results cannot be edited
- **Exception**: Lab Manager can unlock for corrections with audit log

### BR-QC-054: Retest Limit
- Maximum 2 retests allowed per sample
- **Enforcement**: System validation

### BR-QC-055: Report Upload Requirement
- At least one lab report document must be uploaded for critical products
- **Enforcement**: Backend validation before submission

---

## Data Model

```typescript
QCSample {
  id: UUID (PK)
  sample_number: String (unique, format: SAMPLE-YYYYMMDD-XXXX)
  qr_code: String (unique, same as sample_number)
  
  // References
  to_id: UUID (FK)
  product_id: UUID (FK)
  tenant_id: UUID (FK)
  
  // Sample metadata
  sample_type: Enum (Random, Stratified, Composite)
  collection_date: Timestamp
  collection_location: UUID (FK to POI)
  collected_by: UUID (FK to User)
  sub_sample_count: Integer
  
  // Lab workflow
  lab_received_date: Timestamp (nullable)
  lab_technician_id: UUID (FK to User, nullable)
  testing_started_at: Timestamp (nullable)
  testing_completed_at: Timestamp (nullable)
  
  // Status
  status: Enum (
    Created,
    Sample_Sent,
    Sample_Received_In_Lab,
    Testing_In_Progress,
    Testing_Complete,
    Archived
  )
  
  // Results
  overall_result: Enum (PASS, FAIL, INCONCLUSIVE, PENDING)
  retest_count: Integer (default: 0)
  retest_reason: Text (nullable)
  
  // Timestamps
  created_at: Timestamp
  updated_at: Timestamp
}

QCTestResult {
  id: UUID (PK)
  sample_id: UUID (FK to QCSample)
  test_template_id: UUID (FK to TestTemplate)
  
  // Test identification
  test_name: String
  test_method: String (e.g., "ISO 17025")
  is_mandatory: Boolean
  
  // Result
  test_status: Enum (Pending, In_Progress, Complete)
  test_result: Enum (PASS, FAIL, INCONCLUSIVE)
  test_started_at: Timestamp
  test_completed_at: Timestamp
  tested_by: UUID (FK to User)
  
  // Remarks
  remarks: Text (nullable)
  
  created_at: Timestamp
  updated_at: Timestamp
}

QCTestParameter {
  id: UUID (PK)
  test_result_id: UUID (FK to QCTestResult)
  
  // Parameter definition
  parameter_name: String
  parameter_type: Enum (Number, Text, Dropdown, Boolean)
  unit_of_measurement: String (nullable, e.g., "CFU", "pH", "°C")
  
  // Acceptable ranges (for validation)
  min_value: Decimal (nullable)
  max_value: Decimal (nullable)
  acceptable_values: JSON (for dropdowns)
  
  // Recorded value
  recorded_value: String
  is_within_range: Boolean
  
  // Metadata
  entered_at: Timestamp
  entered_by: UUID (FK to User)
}

QCLabReport {
  id: UUID (PK)
  sample_id: UUID (FK to QCSample)
  
  // File metadata
  file_name: String
  file_size: Integer (bytes)
  file_type: String
  file_url: String (S3/Azure path)
  
  // Upload metadata
  uploaded_at: Timestamp
  uploaded_by: UUID (FK to User)
}
```

---

## UI/UX Requirements

### Mobile Lab Interface (Tablet Optimized)

#### QR Scan Screen
```
┌──────────────────────────────────────┐
│  🔍 Scan Sample QR Code              │
│                                      │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │     [QR CODE CAMERA VIEW]      │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                      │
│  OR                                  │
│  [______________________]  [Scan]   │
│   Enter QR Code Manually             │
│                                      │
│  Recent Scans:                       │
│  ◉ SAMPLE-20260211-0042 (5 min ago) │
│  ◉ SAMPLE-20260211-0041 (1 hr ago)  │
└──────────────────────────────────────┘
```

#### Test Entry Screen
```
┌──────────────────────────────────────┐
│ Sample: SAMPLE-20260211-0042    [X]  │
│ Product: Live Birds (Broiler)        │
│ Collected: 2026-02-11 08:30 AM       │
├──────────────────────────────────────┤
│ Test 1: Health Inspection * 🟢       │
│ ├─ Disease Symptoms: [None     ▼]    │
│ ├─ Weight (kg): [2.1    ] ✓          │
│ └─ Observations: [_____________]     │
│                                      │
│ Test 2: Microbial Test * 🔴          │
│ ├─ Salmonella (CFU): [150  ] ⚠️     │
│ │  (Max: 100) OUT OF RANGE           │
│ ├─ E.coli (CFU): [20   ] ✓          │
│ └─ Remarks: [High salmonella...]    │
│                                      │
│ Lab Report Upload:                   │
│ [📄 lab_report_001.pdf] [+]          │
│                                      │
│ [Save Progress] [Submit Results]     │
└──────────────────────────────────────┘

* = Mandatory test
🟢 = All params in range
🔴 = Some params out of range
```

### Lab Dashboard (Desktop)
```
┌────────────────────────────────────────────────────────────┐
│ Lab Testing Queue                        📊 Dashboard      │
├────────────────────────────────────────────────────────────┤
│ Filters: [Today ▼] [All Products ▼] [All Technicians ▼]   │
│                                                            │
│ ┌──────────────┬──────────────┬──────────────┬──────────┐ │
│ │ Pending (8)  │ In Progress  │ Completed    │ Overdue  │ │
│ │              │ (3)          │ Today (12)   │ (2)      │ │
│ └──────────────┴──────────────┴──────────────┴──────────┘ │
│                                                            │
│ Sample ID         Product      Status       SLA    Action │
│ ─────────────────────────────────────────────────────────│
│ SAMPLE-...-0042  Live Birds   In Progress  2h rem  [Open] │
│ SAMPLE-...-0041  Raw Material Testing...   1h rem  [Open] │
│ SAMPLE-...-0040  Feed         Pending      OVERDUE [Open] │
│ ...                                                        │
└────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

```typescript
// Scan QR code
GET /api/v1/qc/samples/scan/{qr_code}
Response: {
  sample: QCSample,
  tests: QCTestTemplate[],
  status: 'success' | 'error'
}

// Load test checklist
GET /api/v1/qc/samples/{sample_id}/tests
Response: {
  tests: QCTestResult[],
  parameters: QCTestParameter[]
}

// Save test progress
PATCH /api/v1/qc/samples/{sample_id}/tests/{test_id}
Body: {
  parameters: [
    {parameter_id: UUID, recorded_value: string}
  ],
  status: 'In_Progress'
}

// Upload lab report
POST /api/v1/qc/samples/{sample_id}/reports
Body: FormData (file upload)
Response: {
  report_id: UUID,
  file_url: string
}

// Submit test results
POST /api/v1/qc/samples/{sample_id}/submit
Body: {
  overall_result: 'PASS' | 'FAIL' | 'INCONCLUSIVE',
  remarks: string
}
Response: {
  sample: QCSample (with updated status),
  notification_sent: boolean
}

// Lab queue dashboard
GET /api/v1/qc/lab/queue
Query: ?status=Pending&date=2026-02-11&technician_id=UUID
Response: {
  pending: number,
  in_progress: number,
  completed_today: number,
  overdue: number,
  samples: QCSample[]
}
```

---

## Non-Functional Requirements

### Performance
- QR code scan response: < 1 second
- Test data auto-save: Every 30 seconds
- Dashboard load time: < 2 seconds for 100 samples

### Security
- Only Lab Technician role can access lab testing interface
- Lab Manager can view all results, edit locked results (with audit)
- File uploads scanned for malware

### Usability
- Mobile-first design (tablet optimized)
- Offline mode: Save data locally, sync when online
- Large touch targets for lab environment (gloves)

### Reliability
- Auto-save prevents data loss
- Transaction-based submission
- Retry mechanism for file uploads

---

## Testing Scenarios

### Happy Path
1. Scan valid QR code → Sample details load
2. Enter all test parameters → All within range
3. Upload lab report PDF
4. Submit results → QC Manager notified

### Edge Cases
1. **Out of range parameter**: Warning displayed, remarks required
2. **Partial test completion**: Save as draft, resume later
3. **QR code scan fail**: Manual entry fallback
4. **File upload fail**: Retry with clear error message

### Error Scenarios
1. **Invalid QR code**: Error message, suggest re-scan
2. **Sample already tested**: Display results, prevent editing
3. **Network failure during submission**: Retry queue, data preserved
4. **Mandatory test missing**: Validation error, highlight missing tests

---

## Dependencies

### Prerequisites
- ✅ US-042: QC Sampling Creation (must have samples to test)
- ✅ Master data: Product categories, test templates configured

### Enables
- → US-045: QC Pass/Fail Decision (receives test results)
- → US-026: Trip Lifecycle (QC results affect trip status)

---

## Definition of Done
- [ ] All acceptance criteria met
- [ ] QR code scanning functional (camera + manual)
- [ ] Test checklist auto-loads correctly
- [ ] All test parameter types supported (number, text, dropdown)
- [ ] File upload functional with virus scanning
- [ ] Lab dashboard displays real-time queue
- [ ] Notifications sent on status change
- [ ] Offline mode tested (save locally, sync later)
- [ ] Unit tests: coverage > 80%
- [ ] UAT: Lab technician sign-off
- [ ] Performance: QR scan < 1s, dashboard < 2s
- [ ] Documentation: Lab testing SOP updated

---

**Story Points**: 5  
**Estimated Hours**: 40 hours  
**Assigned To**: Backend (20h) + Mobile (15h) + QA (5h)  
**Sprint**: Sprint 7  
**Priority**: Critical (Quality gate for consignments)

