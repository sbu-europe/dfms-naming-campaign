---
source_document: PRD_DFMS_v1.0.md
source_sections: Quality Assurance/QC Workflow, Physical Inspection (Quality Control – QC), Quality Control (QC) Workflow
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [gate-management, scaling-management, trip-management]
---

# Quality Control (QC) Workflow

## Overview

Quality Control (QC) Workflow is the **product quality assurance layer** that validates inbound products (raw materials, port consignments) before they enter inventory. It ensures that received products meet quality standards, specifications, and regulatory requirements through systematic inspection, testing, and evidence capture.

The QC system acts as a **quality gate** preventing substandard materials from contaminating stock, protecting production processes, and maintaining product integrity. It provides traceability from sample collection through inspection results to acceptance/rejection decisions.

### Purpose

- Validate inbound product quality before stock entry
- Perform physical inspections (visual, dimensional, packaging)
- Conduct lab tests (moisture, protein, contamination, etc.)
- Document evidence (photos, videos, test results)
- Enable pass/fail/recheck decisions with remarks
- Block gate-out for failed QC (enforce quality standards)
- Provide audit trail for quality assurance and compliance

### Workflow Position

```
Inbound Vehicle (Supplier/Port)
    ↓
Gate-In Complete
    ↓
Scale-In Complete
    ↓
QC Event Auto-Created → QC Inspector assigned
    ↓
Sample Collection → QR-labeled sample created
    ↓
Physical Inspection → Checklist-based visual/dimensional checks
    ↓
Lab Test (Optional) → Sample sent to lab, results tracked
    ↓
QC Decision:
  - PASS → Unloading allowed → Stock updated
  - FAIL → Vehicle held/rejected → No stock entry
  - RECHECK → Re-inspection required
    ↓
Evidence Captured → Photos, videos, timestamps
    ↓
Gate-Out Clearance (if PASS)
```

---

## QC Lifecycle

| State | Actor | Description |
|-------|-------|-------------|
| **Event Created** | System | QC event auto-generated from scale-in (inbound vehicles) |
| **Sample Collected** | QC Inspector | Physical sample taken, QR-labeled, logged |
| **Inspection In Progress** | QC Inspector | Physical checklist inspection underway |
| **Lab Test Requested** | QC Inspector | Sample sent to lab for testing |
| **Lab Test In Progress** | Lab Technician | Tests being conducted |
| **Lab Results Received** | System | Test results uploaded, linked to QC event |
| **QC Pass** | QC Inspector | Product approved for stock entry |
| **QC Fail** | QC Inspector | Product rejected, vehicle held/returned |
| **QC Recheck** | QC Inspector | Re-inspection required (borderline results) |
| **QC Complete** | System | Final decision recorded, gate-out clearance issued (if pass) |

---

## QC Event Auto-Creation

### Trigger

When an **inbound vehicle** (supplier or port consignment) completes **scale-in**, the system automatically creates a QC event.

### Auto-Creation Logic

```typescript
// After scale-in complete for inbound vehicles
if (gate_in_record.document_category === 'SUPPLIER_PO' || 
    gate_in_record.document_category === 'PORT_CONSIGNMENT') {
  
  createQCEvent({
    qc_event_id: generateQCEventId(),
    gate_in_id: gate_in_record.gate_in_id,
    scale_in_id: scale_in_record.scale_in_id,
    vehicle_number: vehicle_number,
    product_code: product_code,
    product_category: product_category,
    net_weight_kg: scale_in_record.gross_weight_kg, // Estimate (final after scale-out)
    supplier_name: gate_in_record.party_name,
    status: 'EVENT_CREATED',
    created_at: new Date()
  });
  
  // Notify QC team
  notifyQCTeam({
    event: 'NEW_QC_EVENT',
    vehicle_number: vehicle_number,
    product: product_name,
    priority: urgency  // NORMAL, HIGH, CRITICAL
  });
}
```

### QC Event Routing

- **QC Inspector Assignment:** Auto-assigned (round-robin) or manually assigned by QC Supervisor
- **Priority:** Inherited from gate-in urgency (NORMAL / HIGH / CRITICAL)
- **QC Type:** Physical inspection only, or Physical + Lab test (configurable per product category)

---

## Sample Creation & QR Labeling

### Purpose

Create a **physical sample** of the inbound product for inspection and testing. Each sample is labeled with a **unique QR code** for traceability throughout the QC process.

### Workflow

```
1. QC Inspector receives QC event notification
2. Inspector proceeds to vehicle location (unloading bay or parking)
3. Inspector collects sample:
   - Opens random bags/containers (as per sampling protocol)
   - Extracts representative sample (e.g., 500g of grain, 1 bag of feed)
4. Inspector creates sample record in system:
   - QC Event ID
   - Sample Type (e.g., Grain, Feed Pellet, Packaging)
   - Sample Quantity
   - Collection timestamp
5. System generates unique Sample ID and QR code
6. Inspector prints QR label and attaches to sample container
7. Sample stored in designated area (QC station or lab)
8. QC Event status → 'SAMPLE_COLLECTED'
```

### Data Model

```typescript
interface QCSample {
  sample_id: string;                // Auto-generated (e.g., QCS-2026-00123)
  qc_event_id: string;              // Parent QC event
  
  // Sample Details
  sample_type: string;              // Grain, Feed Pellet, Packaging, etc.
  sample_quantity: number;          // Amount collected
  sample_uom: string;               // Grams, Pieces, Bags
  
  // QR Code
  qr_code: string;                  // Unique QR data (sample_id encoded)
  qr_label_printed: boolean;
  
  // Collection Details
  collected_by: string;             // QC Inspector user ID
  collected_at: Date;
  collection_location: string;      // Vehicle bay, Unloading area
  
  // Sample Status
  status: 'COLLECTED' | 'IN_INSPECTION' | 'SENT_TO_LAB' | 'DISPOSED';
  
  // Storage
  storage_location?: string;        // QC Station, Lab Room 1
  
  // Metadata
  tenant_id: string;
}
```

### QR Code Generation

**QR Code Data:**
```typescript
const qrCodeData = {
  sample_id: 'QCS-2026-00123',
  qc_event_id: 'QC-2026-00456',
  product_code: 'RM-MAIZE-001',
  collection_date: '2026-02-26',
  collected_by: 'Inspector-789'
};

const qrCodeString = JSON.stringify(qrCodeData);
// Generate QR image using library (e.g., qrcode.js)
```

**QR Label Template:**
```
╔═══════════════════════════════════╗
║   QC SAMPLE - DO NOT DISCARD      ║
╠═══════════════════════════════════╣
║ Sample ID:  QCS-2026-00123        ║
║ Product:    Maize (RM-MAIZE-001)  ║
║ Date:       2026-02-26 10:30      ║
║ Inspector:  John Doe              ║
╠═══════════════════════════════════╣
║       [QR CODE]                   ║
║                                   ║
╚═══════════════════════════════════╝
```

---

## Physical Inspection Checklist

### Purpose

Conduct systematic visual, dimensional, and packaging inspections using a **standardized checklist** configured per product category.

### Workflow

```
1. QC Inspector scans sample QR code (or selects from queue)
2. System loads physical inspection checklist (configured per product)
3. Inspector performs checks:
   - Visual: Color, texture, foreign matter, damage
   - Dimensional: Bag weight, pellet size, moisture feel
   - Packaging: Bag integrity, labeling correctness, seal quality
4. Inspector marks each checklist item:
   - ✅ PASS
   - ❌ FAIL (with remarks: reason for failure)
   - ⚠️ WARNING (borderline, requires supervisor review)
5. Inspector uploads evidence:
   - Photos of product, packaging, defects
   - Short videos (if applicable)
6. System calculates checklist score:
   - Score = (Passed Items / Total Items) × 100
7. If score < threshold (e.g., 80%), status → 'QC_FAIL'
8. If score ≥ threshold and no critical fails, status → 'INSPECTION_COMPLETE'
9. Inspector submits inspection → System updates QC Event
```

### Data Model

```typescript
interface PhysicalInspectionChecklist {
  inspection_id: string;
  qc_event_id: string;
  sample_id: string;
  
  // Checklist Items (configured per product category)
  checklist_items: ChecklistItem[];
  
  // Inspection Results
  total_items: number;
  passed_items: number;
  failed_items: number;
  warning_items: number;
  score_percentage: number;         // (passed / total) × 100
  
  // Evidence
  photos: string[];                 // Cloud storage URLs
  videos: string[];
  
  // Inspector
  inspected_by: string;
  inspected_at: Date;
  
  // Status
  status: 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';
  
  // Metadata
  tenant_id: string;
}

interface ChecklistItem {
  item_id: string;
  item_name: string;                // e.g., "Bag Integrity"
  item_category: 'VISUAL' | 'DIMENSIONAL' | 'PACKAGING';
  item_description: string;         // e.g., "Check for tears, holes, or damage"
  is_critical: boolean;             // If true, failure blocks QC pass
  
  // Result
  result: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_CHECKED';
  remarks?: string;                 // Reason for fail/warning
  photo_evidence?: string;          // Photo URL (if failure documented)
}
```

### Checklist Configuration (Per Product Category)

**Example: Raw Maize Inspection Checklist**
```typescript
const maizeChecklist: ChecklistItem[] = [
  {
    item_name: 'Color Uniformity',
    item_category: 'VISUAL',
    item_description: 'Check for consistent yellow/golden color, no discoloration',
    is_critical: false
  },
  {
    item_name: 'Moisture Content (Feel Test)',
    item_category: 'DIMENSIONAL',
    item_description: 'Grain should feel dry, not damp or sticky',
    is_critical: true  // Critical: Wet grain indicates storage risk
  },
  {
    item_name: 'Foreign Matter',
    item_category: 'VISUAL',
    item_description: 'Check for stones, sticks, dirt, insects',
    is_critical: true  // Critical: Foreign matter unacceptable
  },
  {
    item_name: 'Bag Weight Accuracy',
    item_category: 'DIMENSIONAL',
    item_description: 'Weigh random bags, verify against declared weight (±2% tolerance)',
    is_critical: false
  },
  {
    item_name: 'Bag Integrity',
    item_category: 'PACKAGING',
    item_description: 'Check for tears, holes, weak seams',
    is_critical: false
  },
  {
    item_name: 'Labeling Correctness',
    item_category: 'PACKAGING',
    item_description: 'Verify product name, weight, batch number on label',
    is_critical: false
  }
];
```

---

## Lab Test Request & Result Tracking

### Purpose

For products requiring laboratory testing (e.g., moisture analysis, protein content, contamination tests), QC inspectors can **request lab tests** and track results.

### Workflow

```
1. Inspector completes physical inspection
2. If lab test required (per product QC configuration):
   - Inspector clicks "Request Lab Test"
   - Selects test types: Moisture, Protein, Aflatoxin, etc.
3. System creates Lab Test Request:
   - Links to QC Event and Sample
   - Test types, priority, due date
4. Sample sent to lab (physical transfer with QR label)
5. Lab Technician:
   - Scans sample QR code
   - Performs tests
   - Enters results in system
6. Results uploaded:
   - Test name, result value, unit, pass/fail status
   - Test report PDF (optional)
7. System links results to QC Event
8. QC Inspector reviews results:
   - If all tests PASS → QC Event → 'QC_PASS'
   - If any test FAIL → QC Event → 'QC_FAIL'
9. Evidence attached (lab report PDF, test certificates)
```

### Data Model

```typescript
interface LabTestRequest {
  test_request_id: string;
  qc_event_id: string;
  sample_id: string;
  
  // Test Details
  test_types: LabTestType[];        // e.g., ['MOISTURE', 'PROTEIN', 'AFLATOXIN']
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  requested_by: string;             // QC Inspector
  requested_at: Date;
  due_date: Date;                   // Expected result date
  
  // Status
  status: 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  
  // Results
  test_results: LabTestResult[];
  
  // Lab Assignment
  assigned_lab_technician?: string;
  lab_location?: string;            // Lab Room 1, External Lab
  
  // Metadata
  tenant_id: string;
}

interface LabTestResult {
  test_type: LabTestType;
  test_name: string;                // e.g., "Moisture Content"
  result_value: number;             // e.g., 14.5
  result_unit: string;              // e.g., "%"
  pass_fail_status: 'PASS' | 'FAIL';
  threshold_min?: number;           // Acceptable range minimum
  threshold_max?: number;           // Acceptable range maximum
  tested_by: string;                // Lab Technician
  tested_at: Date;
  report_pdf_url?: string;          // Lab report attachment
}

type LabTestType = 
  | 'MOISTURE'
  | 'PROTEIN'
  | 'AFLATOXIN'
  | 'FOREIGN_MATTER'
  | 'BULK_DENSITY'
  | 'BROKEN_GRAIN_PERCENTAGE'
  | 'PESTICIDE_RESIDUE'
  | 'OTHER';
```

### Lab Test Configuration (Per Product)

**Example: Maize Lab Test Configuration**
```typescript
const maizeLabTests = {
  product_code: 'RM-MAIZE-001',
  required_tests: [
    {
      test_type: 'MOISTURE',
      threshold_min: 0,
      threshold_max: 14,            // Max 14% moisture
      is_mandatory: true
    },
    {
      test_type: 'AFLATOXIN',
      threshold_min: 0,
      threshold_max: 20,            // Max 20 ppb (parts per billion)
      is_mandatory: true
    },
    {
      test_type: 'FOREIGN_MATTER',
      threshold_min: 0,
      threshold_max: 2,             // Max 2% foreign matter
      is_mandatory: false
    }
  ]
};
```

---

## QC Pass / Fail / Recheck Decision

### QC Pass

**Criteria:**
- Physical inspection score ≥ threshold (e.g., 80%)
- No critical checklist items failed
- Lab test results (if required) all PASS
- No quality concerns noted by inspector

**Workflow:**
```
1. Inspector reviews inspection checklist and lab results
2. Inspector clicks "QC Pass"
3. Inspector enters pass remarks (optional)
4. System:
   - Updates QC Event status → 'QC_PASS'
   - Updates Gate-In record → QC clearance granted
   - Notifies Command Center: "QC passed for vehicle [XXX-1234]"
   - Enables unloading workflow
5. Product can be unloaded and added to stock
6. Gate-out clearance enabled (after unloading + scale-out)
```

### QC Fail

**Criteria:**
- Physical inspection score < threshold
- Critical checklist item(s) failed
- Lab test result(s) FAIL (e.g., moisture > 14%, aflatoxin > 20 ppb)
- Significant quality issue observed (contamination, spoilage, damage)

**Workflow:**
```
1. Inspector reviews inspection checklist and lab results
2. Inspector clicks "QC Fail"
3. Inspector enters failure remarks (mandatory):
   - Reason: e.g., "Moisture content 18% (exceeds 14% limit)"
   - Recommended action: e.g., "Reject shipment", "Dry grain and retest"
4. System:
   - Updates QC Event status → 'QC_FAIL'
   - Blocks gate-out (vehicle cannot exit)
   - Notifies Command Center, Operations Manager, Procurement Team
   - Creates incident record (linked to QC Event)
5. Resolution options:
   - Reject shipment: Vehicle returns to supplier (with rejection note)
   - Conditional acceptance: Accept with penalty/discount (management approval)
   - Rework: Dry grain, remove foreign matter, retest (QC Recheck)
```

### QC Recheck

**Criteria:**
- Borderline results (score near threshold, e.g., 75-80%)
- Lab test result close to limit (requires confirmation)
- Corrective action taken (e.g., grain dried, repackaged)

**Workflow:**
```
1. Inspector clicks "QC Recheck"
2. Inspector enters recheck reason:
   - e.g., "Moisture 14.5%, slightly above limit. Recommend drying and retest."
3. System:
   - Updates QC Event status → 'QC_RECHECK'
   - Creates new sample and inspection cycle
4. Corrective action performed (if applicable)
5. New physical inspection and/or lab test conducted
6. New QC decision: PASS or FAIL
```

---

## Evidence Capture (Photo, Video, Timestamp)

### Purpose

Document quality issues, defects, and inspection evidence for audit, dispute resolution, and continuous improvement.

### Evidence Types

**1. Photos:**
- Product appearance (color, texture, defects)
- Packaging damage (tears, holes, weak seams)
- Foreign matter (stones, insects, contamination)
- Sample collection (before/after)

**2. Videos:**
- Unloading process (documenting condition upon arrival)
- QC inspection process (time-lapse or highlights)
- Defect demonstration (e.g., moldy grain, leaking bags)

**3. Timestamps:**
- All evidence automatically timestamped (GPS + system time)
- Location metadata (GPS coordinates of photo/video capture)

### Data Model

```typescript
interface QCEvidence {
  evidence_id: string;
  qc_event_id: string;
  inspection_id?: string;
  sample_id?: string;
  
  // Evidence Details
  evidence_type: 'PHOTO' | 'VIDEO' | 'DOCUMENT';
  file_url: string;                 // Cloud storage path
  file_name: string;
  file_size_kb: number;
  
  // Metadata
  caption?: string;                 // Description (e.g., "Foreign matter detected in sample")
  tags?: string[];                  // e.g., ['defect', 'foreign_matter', 'bag_damage']
  
  // Capture Details
  captured_by: string;              // Inspector user ID
  captured_at: Date;
  gps_location?: { lat: number; lng: number };
  
  // Linked Checklist Item (if specific to checklist failure)
  checklist_item_id?: string;
  
  // Metadata
  tenant_id: string;
}
```

### Evidence Upload Workflow

```
1. Inspector performing inspection/test
2. Inspector encounters issue (defect, damage, contamination)
3. Inspector:
   - Taps "Capture Evidence" button
   - Selects camera (photo/video)
   - Captures image/video
   - Adds caption/tags
4. System:
   - Uploads file to cloud storage (S3, Azure Blob)
   - Auto-captures timestamp and GPS location
   - Links evidence to QC Event/Inspection/Sample
5. Evidence displayed in QC report and audit logs
```

---

## QC Auto-Pass Logic (Phase 2+)

**Purpose:** For routine shipments from trusted suppliers with consistent quality history, enable **auto-pass** to reduce inspection overhead.

**Criteria for Auto-Pass:**
- Supplier has quality score > 95% (last 50 shipments)
- Product category = LOW_RISK (e.g., standard feed ingredients)
- No recent QC failures (last 3 months)
- Shipment quantity within normal range

**Workflow:**
```
1. QC Event created
2. System checks auto-pass criteria
3. If eligible:
   - QC Event → 'QC_AUTO_PASS'
   - No physical inspection required
   - Sample collected for random audit (10% sampling)
   - Unloading immediately allowed
4. If not eligible:
   - Normal QC workflow (physical + lab tests)
```

---

## Integration Points

### Upstream: Gate Management & Scaling

**Gate-In + Scale-In → QC Event Creation:**
- Inbound vehicles (supplier/port) auto-trigger QC events
- Vehicle, product, and document details passed to QC system

### Downstream: Unloading Operations

**QC Pass → Unloading Enabled:**
- QC pass clearance allows unloading to proceed
- Stock update occurs post-unloading

**QC Fail → Unloading Blocked:**
- Failed QC prevents stock entry
- Vehicle held or rejected

### Downstream: Stock Management

**QC Pass → Stock Update:**
- Net weight (from scale-out) + QC pass → Stock +quantity
- QC metadata (sample ID, test results) linked to stock record

### Downstream: Supplier Performance

**QC Results → Supplier Scorecard:**
- QC pass/fail history tracked per supplier
- Supplier quality score calculated (e.g., 95% pass rate)
- Poor performance triggers supplier review

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily QC events:** 20-50 inbound vehicles per POI
- **Lab tests:** 10-20% of QC events require lab testing
- **Average QC duration:** 30-60 minutes (physical inspection + lab test)

### Query Optimization

```sql
-- QC Events Queue (pending inspections)
CREATE INDEX idx_qc_status_priority ON qc_events(status, priority, created_at)
WHERE status IN ('EVENT_CREATED', 'SAMPLE_COLLECTED', 'INSPECTION_IN_PROGRESS');

-- QC Events by Product (quality trend analysis)
CREATE INDEX idx_qc_product ON qc_events(product_code, status, inspected_at);

-- QC Events by Supplier (supplier performance)
CREATE INDEX idx_qc_supplier ON qc_events(supplier_id, status, inspected_at);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All QC records filtered by `tenant_id`
- **Role-Based Access:**
  - QC Inspector: Create samples, perform inspections, upload evidence
  - Lab Technician: View samples, enter lab test results
  - QC Supervisor: Override decisions, approve rechecks
  - Operations Manager: View all QC reports

### Audit Requirements

**Mandatory Audit Events:**
- QC event creation
- Sample collection
- Inspection submission
- Lab test request
- Lab result entry
- QC decision (pass/fail/recheck)
- Evidence upload

---

## Key Design Decisions

### Why Auto-Create QC Events?

**Rationale:**
- Eliminates manual QC event creation overhead
- Ensures all inbound shipments inspected (no bypassing)
- Streamlines workflow (QC team sees events immediately)

### Why QR-Labeled Samples?

**Rationale:**
- Traceability (sample → QC event → vehicle → supplier)
- Prevents sample mix-ups (unique ID per sample)
- Enables lab result linkage (scan QR → auto-populate data)

### Why Block Gate-Out on QC Fail?

**Rationale:**
- Quality enforcement (prevents substandard products from entering stock)
- Forces resolution (supplier/ops must address issue before exit)
- Protects production (contaminated/damaged materials don't reach factory)

---

## Related User Stories

- **US-051:** QC Event Auto-Creation
- **US-052:** Sample Collection & QR Labeling
- **US-053:** Physical Inspection Checklist
- **US-054:** Lab Test Request & Tracking
- **US-055:** QC Decision (Pass/Fail/Recheck)
- **US-056:** Evidence Capture (Photo/Video)

---

## Summary

Quality Control (QC) Workflow is the **product quality assurance layer** that provides:

- **Auto-Event Creation:** Automatic QC event generation for all inbound vehicles
- **Sample Traceability:** QR-labeled samples with unique IDs for tracking
- **Checklist-Based Inspection:** Standardized physical inspections (visual, dimensional, packaging)
- **Lab Test Integration:** Request, track, and link lab test results to QC events
- **Pass/Fail/Recheck Decisions:** Systematic quality gates with evidence-based decisions
- **Evidence Documentation:** Photo/video capture with timestamps and GPS metadata
- **Gate-Out Enforcement:** Failed QC blocks vehicle exit, protecting inventory integrity

QC Workflow ensures that only quality-validated products enter inventory, protecting production processes, maintaining product standards, and providing comprehensive quality audit trails.
