---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: QC Supervisor Interface, Mobile QC Inspection Interface
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [qc-workflow, gate-management, command-center]
---

# QC Mobile Application

## Overview

The QC Mobile Application is the **mobile inspection interface** for Quality Control (QC) Supervisors and Lab Personnel to conduct product inspections, manage sample collection, complete inspection checklists, request lab tests, record test results, and make pass/fail decisions—all from tablets or mobile devices at the point of inspection.

The app enables field-based quality assurance, eliminating paperwork and providing real-time QC status visibility to operations teams.

### Purpose

- **QC Event Management:** View pending QC events linked to trips/gate entries
- **Inspection Checklist:** Complete configurable checklists (visual inspection, physical tests)
- **Sample Management:** Create QC samples with QR code labeling for traceability
- **Lab Test Tracking:** Request lab tests, record results, track turnaround time
- **Evidence Capture:** Take high-quality photos/videos with GPS metadata
- **Pass/Fail Decision:** Make QC decisions (Pass, Fail, Recheck) with justification
- **Time Tracking:** Log time spent on sampling, inspection, lab testing for performance analysis
- **Offline Support:** Entry QC data offline, sync when connectivity restored

---

## Core Features

### 1. QC Event List & Queue Management

**Purpose:** Enable QC supervisors to view all pending QC events (trips awaiting inspection) and prioritize work.

#### QC Event Data Model

```typescript
interface QCEventListItem {
  qc_event_id: string;
  trip_id: string;
  vehicle_registration: string;
  
  // Product Details
  product_name: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  quantity: number;
  unit: string;
  
  // Location & Status
  poi_name: string;                 // Where QC is happening
  qc_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  qc_result?: 'PASS' | 'FAIL' | 'RECHECK';
  
  // Timing
  created_at: Date;
  waiting_time_minutes: number;     // Time since QC event created
  
  // Priority
  is_urgent: boolean;
  auto_pass_eligible: boolean;      // If product qualifies for auto-pass
}
```

**UI Components:**
- **List View:** All QC events at current POI sorted by waiting time (oldest first)
- **Filter Buttons:** 
  - All / Pending / In Progress / Completed
  - Urgent Only
- **Event Card:** Tap to open QC inspection screen
- **Status Badge:** Color-coded (Pending = Yellow, In Progress = Blue, Completed = Green/Red)

**Auto-Refresh:**
- List auto-refreshes every 30 seconds (when online) to show new QC events

---

### 2. QC Inspection Checklist

**Purpose:** Guide QC supervisors through standardized inspection procedures using configurable checklists tailored to product category.

#### Checklist Configuration

**Checklist Structure:**
```typescript
interface QCChecklist {
  checklist_id: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  checklist_name: string;
  
  // Checklist Items
  items: QCChecklistItem[];
}

interface QCChecklistItem {
  item_id: string;
  inspection_point: string;         // e.g., "Visual Inspection - Packaging Integrity"
  item_type: 'YES_NO' | 'PASS_FAIL' | 'NUMERIC_RANGE' | 'FREE_TEXT';
  
  // For YES_NO or PASS_FAIL
  expected_value?: 'YES' | 'NO' | 'PASS' | 'FAIL';
  
  // For NUMERIC_RANGE
  numeric_range?: {
    min_value: number;
    max_value: number;
    unit: string;                   // e.g., "kg", "cm", "%"
  };
  
  // Failure Handling
  failure_action: 'FAIL_QC' | 'REQUIRE_RECHECK' | 'ALERT_ONLY';
  
  // Mandatory vs Optional
  is_mandatory: boolean;
}
```

**Example Checklist Items (Finished Goods - Cement):**
1. **Packaging Integrity** (YES_NO): Bags intact, no tears?
2. **Labeling Accuracy** (YES_NO): Correct product name and batch number on bag?
3. **Moisture Level** (NUMERIC_RANGE): 0-2% (Pass if within range)
4. **Color Consistency** (PASS_FAIL): Visual inspection
5. **Weight Verification** (NUMERIC_RANGE): 49.5-50.5 kg per bag

#### Checklist Completion Workflow

```
1. QC Supervisor taps QC event from list
2. App loads configured checklist for product category
3. Supervisor completes each checklist item:
   - For YES_NO: Tap Yes/No
   - For PASS_FAIL: Tap Pass/Fail
   - For NUMERIC_RANGE: Enter measured value
   - For FREE_TEXT: Type notes
4. App auto-calculates checklist score:
   - All mandatory items passed → Checklist Pass
   - Any mandatory item failed → Checklist Fail
5. Supervisor can add photos/notes per item
6. Supervisor taps "Complete Checklist"
7. App validates all mandatory items completed
8. Checklist result saved (Pass/Fail)
```

**Visual Feedback:**
- **Green Checkmark:** Item passed
- **Red X:** Item failed
- **Progress Bar:** X/Y items completed

---

### 3. Sample Creation & QR Labeling

**Purpose:** Create physical QC samples for lab testing, generate unique QR codes for sample tracking, and ensure traceability.

#### Sample Creation Workflow

```
1. QC Supervisor taps "Create Sample" button
2. App generates unique sample_id (e.g., SAMPLE-2026-00123)
3. Supervisor enters:
   - Sample type (e.g., "Bag #3 from Truck Load")
   - Sample quantity (e.g., 1 kg)
   - Sampling location (auto-filled from POI)
4. App generates QR code with sample_id
5. Supervisor prints QR label (portable printer) or displays on screen
6. Supervisor attaches QR label to physical sample
7. App saves sample record linked to QC event
```

**Sample Data Model:**
```typescript
interface QCSample {
  sample_id: string;
  qc_event_id: string;
  trip_id: string;
  product_name: string;
  
  // Sample Details
  sample_type: string;
  sample_quantity: number;
  sample_unit: string;
  
  // Traceability
  collected_by: string;             // QC Supervisor user ID
  collected_at: Date;
  collection_location: string;      // POI name
  
  // QR Code
  qr_code_data: string;             // Encoded sample_id
  qr_code_image_url: string;        // Generated QR image
  
  // Lab Test Linkage
  lab_test_requested: boolean;
  lab_test_id?: string;
}
```

**QR Code Usage:**
- **Lab Test Request:** Scan QR to link sample to lab test
- **Result Entry:** Scan QR to enter test results for correct sample
- **Audit Trail:** Track sample journey from collection to disposal

---

### 4. Lab Test Request & Result Tracking

**Purpose:** Enable QC supervisors to request lab tests for collected samples and track test progress until results are available.

#### Lab Test Request Workflow

```
1. QC Supervisor creates sample (see previous section)
2. Supervisor taps "Request Lab Test"
3. App displays form:
   - Sample ID (auto-filled from scan or selection)
   - Test type (dropdown: Chemical Analysis, Moisture Test, Strength Test, etc.)
   - Priority (Normal / Urgent)
   - Special instructions (optional)
4. Supervisor submits request
5. App creates lab test request record
6. Lab Personnel receives notification (mobile or desktop)
7. Lab conducts test, enters results in system
8. QC Supervisor receives notification: "Lab test results available"
9. Supervisor reviews results, makes pass/fail decision
```

**Lab Test Data Model:**
```typescript
interface LabTestRequest {
  lab_test_id: string;
  sample_id: string;
  qc_event_id: string;
  
  // Test Details
  test_type: string;                // e.g., "Moisture Test", "Chemical Analysis"
  test_parameters: string[];        // e.g., ["Moisture %", "pH", "Density"]
  priority: 'NORMAL' | 'URGENT';
  special_instructions?: string;
  
  // Lifecycle
  requested_by: string;
  requested_at: Date;
  test_started_at?: Date;
  test_completed_at?: Date;
  
  // Results
  test_results?: LabTestResult[];
  overall_result?: 'PASS' | 'FAIL';
  
  // Turnaround Time
  expected_turnaround_hours: number;
  actual_turnaround_hours?: number;
}

interface LabTestResult {
  parameter_name: string;           // e.g., "Moisture %"
  measured_value: number;
  expected_range: { min: number; max: number };
  unit: string;
  result: 'PASS' | 'FAIL';
}
```

**Lab Test Dashboard (QC Supervisor View):**
- **Pending Tests:** Requested but not started
- **In Progress:** Lab actively testing
- **Completed Tests:** Results available for review
- **Overdue Tests:** Exceeded expected turnaround time (alert icon)

---

### 5. Evidence Capture (Photo/Video)

**Purpose:** Capture high-quality visual evidence of product condition, defects, or inspection findings for documentation and dispute resolution.

#### Photo/Video Capture Features

**Photo Capture:**
- **High Resolution:** 12 MP+ (4000x3000) for clear defect visibility
- **GPS Metadata:** Embedded lat/lng coordinates
- **Timestamp:** Date and time burned into photo metadata
- **Annotations:** Add text/arrows to highlight defects (Phase 2)

**Video Capture:**
- **Resolution:** 1080p (Full HD)
- **Duration:** Max 60 seconds per video
- **Use Cases:** 
  - Product unloading process
  - Leaking/damaged containers
  - Conveyor belt operations

**Capture Workflow:**
```
1. Supervisor taps "Add Photo/Video" button
2. Camera opens (native device camera)
3. Supervisor takes photo or records video
4. App auto-compresses (JPEG 80% quality for photos)
5. App embeds GPS coordinates and timestamp
6. Photo/video attached to QC event
7. Upload queued (immediate if online, later if offline)
```

**Storage:**
- **Cloud Storage:** AWS S3 or Google Cloud Storage
- **CDN:** CloudFront for fast retrieval
- **Retention:** 2 years for compliance

---

### 6. QC Pass/Fail Decision

**Purpose:** Empower QC supervisors to make final quality determination (Pass, Fail, Recheck) based on checklist results, lab test results, and visual evidence.

#### Decision Workflow

```
1. QC Supervisor completes inspection checklist
2. (Optional) Lab test results reviewed
3. Supervisor reviews evidence photos
4. Supervisor taps "Make QC Decision"
5. App displays decision form:
   - Decision: Pass / Fail / Recheck (radio buttons)
   - Justification: Text field (mandatory for Fail/Recheck)
   - Recommendation: (For Fail) - Reject Load, Conditional Accept, Return to Sender
6. Supervisor submits decision
7. App updates QC event status → 'COMPLETED'
8. App triggers workflow:
   - If PASS: Trip can proceed (gate-out approved)
   - If FAIL: Trip blocked, load rejected, notification sent to Transport Planner
   - If RECHECK: New QC event created for re-inspection
```

**Decision Logic:**
```typescript
function determineQCDecision(checklist_result: 'PASS' | 'FAIL', lab_result?: 'PASS' | 'FAIL'): 'PASS' | 'FAIL' {
  // Both checklist and lab (if required) must pass
  if (checklist_result === 'FAIL') return 'FAIL';
  if (lab_result && lab_result === 'FAIL') return 'FAIL';
  
  return 'PASS';
}
```

**QC Decision Data Model:**
```typescript
interface QCDecision {
  decision_id: string;
  qc_event_id: string;
  
  // Decision
  decision: 'PASS' | 'FAIL' | 'RECHECK';
  justification: string;
  recommendation?: 'REJECT_LOAD' | 'CONDITIONAL_ACCEPT' | 'RETURN_TO_SENDER';
  
  // Evidence
  checklist_result: 'PASS' | 'FAIL';
  lab_test_result?: 'PASS' | 'FAIL';
  evidence_photos: string[];        // Photo URLs
  
  // Decision Maker
  decided_by: string;               // QC Supervisor user ID
  decided_at: Date;
  decision_location: { lat: number; lng: number };
}
```

---

### 7. Time Tracking

**Purpose:** Track time spent on each QC activity (sampling, inspection, lab testing) to measure QC efficiency and identify bottlenecks.

#### Time Tracking Mechanism

**Auto-Tracking:**
```typescript
interface QCTimeTracking {
  qc_event_id: string;
  
  // Time Milestones
  qc_started_at: Date;              // Supervisor taps "Start QC"
  sampling_started_at?: Date;
  sampling_completed_at?: Date;
  inspection_started_at?: Date;
  inspection_completed_at?: Date;
  lab_test_started_at?: Date;
  lab_test_completed_at?: Date;
  qc_completed_at: Date;
  
  // Calculated Durations
  sampling_duration_minutes: number;
  inspection_duration_minutes: number;
  lab_test_duration_minutes: number;
  total_qc_duration_minutes: number;
}
```

**UI Indicators:**
- **Timer:** Visible during inspection (shows elapsed time)
- **Performance Dashboard:** Average QC times per product category (weekly/monthly)

---

## Technical Requirements

### Platform Support

**Responsive Web Application (Tablet-Optimized):**
- **Tablets:** iPad (10.2" or larger), Android tablets (10" or larger)
- **Browsers:** Chrome, Safari (latest 2 versions)
- **Orientation:** Landscape mode recommended for checklist view

**Why Web (Not Native App)?**
- QC supervisors work at fixed POI locations (warehouse, factory) with WiFi
- Tablets shared across shifts (no personal device requirement)
- Easier updates (no app store approval needed)

### Offline Capability

**Offline Features:**
- **Checklist Completion:** Stored locally, synced when online
- **Photo Capture:** Queued for upload
- **Sample Creation:** QR codes generated offline (sequential IDs)

**Sync Priority:**
- QC decisions synced first (high priority)
- Photos synced in background (low priority)

### Camera Integration

**Requirements:**
- **Resolution:** Minimum 8 MP rear camera
- **Flash:** Auto-flash for low-light environments
- **Focus:** Auto-focus with tap-to-focus override

**Photo Quality:**
- **Compression:** JPEG 85% quality (balance quality and file size)
- **Max File Size:** 2 MB per photo

---

## Security & Compliance

### Role-Based Access

**QC Supervisor:**
- View all QC events at assigned POI
- Complete checklists, create samples
- Make pass/fail decisions

**Lab Personnel:**
- View lab test requests
- Enter test results
- Cannot make final QC decisions (supervisor only)

### Audit Trail

**All QC actions logged:**
- Checklist completion
- Sample creation
- Lab test requests
- QC decisions
- Time tracking data

---

## Integration Points

### Upstream: QC Workflow Module
- QC events created by gate-in or command center
- QC checklist templates configured in backend

### Downstream: Command Center
- QC status visible in command center dashboard
- Failed QC events trigger alerts

### Downstream: Trip Management
- QC pass required before trip can proceed to gate-out
- QC fail blocks trip progression

---

## Key Design Decisions

### Why Tablet Instead of Smartphone?
**Rationale:**
- Larger screen better for checklist viewing (10+ items)
- High-quality camera for defect photography
- Shared devices (no personal phone requirement)

### Why Web App Instead of Native?
**Rationale:**
- Fixed POI locations with WiFi (offline less critical than driver app)
- Easier maintenance (update once, deploy everywhere)
- No app store approval delays

### Why GPS Metadata in Photos?
**Rationale:**
- Proves photo taken at POI location (prevents fraud)
- Useful for dispute resolution (evidence authenticity)
- Compliance with ISO 9001 traceability requirements

---

## Related User Stories
- US-070: QC Event List View (QC Mobile)
- US-071: QC Inspection Checklist (QC Mobile)
- US-072: Sample Creation & QR Labeling (QC Mobile)
- US-073: Lab Test Request & Tracking (QC Mobile)
- US-074: Evidence Capture (QC Mobile)
- US-075: QC Pass/Fail Decision (QC Mobile)

---

## Summary

The QC Mobile Application provides:
- **QC Event Management:** Pending inspection queue with prioritization
- **Inspection Checklists:** Configurable checklists by product category
- **Sample Management:** QR-labeled samples for traceability
- **Lab Test Tracking:** Request, monitor, and review test results
- **Evidence Capture:** High-quality photos/videos with GPS metadata
- **Pass/Fail Decisions:** Final quality determination with justification
- **Time Tracking:** Performance metrics for QC efficiency
- **Offline Support:** Core features work without connectivity

The app enables paperless, real-time quality assurance with full traceability and accountability.
