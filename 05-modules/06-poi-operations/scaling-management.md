---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Scaling/Weighing Management, Scale-In (Weight Entry), Scale-Out (Weight Exit)
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [gate-management, trip-management, command-center]
---

# Scaling / Weighing Management

## Overview

Scaling Management (also called Weighing Management) is the **weight verification layer** that captures vehicle weights at entry (scale-in) and exit (scale-out) from POIs. It enables accurate **net load calculation** by measuring gross weight (vehicle + load) and tare weight (empty vehicle), providing the foundation for inventory tracking, billing, and quality control.

The weighing process is a **critical control point** in the logistics workflow, ensuring that declared quantities (from documents like PO, TO, DO) match actual loaded/unloaded quantities, detecting discrepancies, and preventing fraud.

### Purpose

- Record vehicle gross weight (scale-in) and tare weight (scale-out)
- Calculate net weight (actual product weight)
- Validate declared quantity vs actual weight
- Generate gate pass token after scale-out
- Detect and log discrepancies (quantity mismatch, driver mismatch)
- Notify Command Center of scaling events
- Provide weight data for billing, stock updates, and trip costing

### Workflow Position

```
Gate-In Complete
    ↓
Scale-In (Gross Weight) → Vehicle + Load weighed
    ↓
Operational Process:
  - Inbound: QC Inspection → Unloading
  - Outbound: Loading
    ↓
Scale-Out (Tare Weight) → Empty/Loaded vehicle weighed
    ↓
Net Weight Calculated → (Gross - Tare)
    ↓
Gate Pass Generated → Vehicle cleared for gate-out
    ↓
Gate-Out Complete
```

---

## Scale-In (Weight Entry)

### Purpose

Scale-In captures the **gross weight** of the vehicle (vehicle + load) at POI entry. This measurement serves as the baseline for calculating net load after unloading (for inbound vehicles) or verifying loaded quantity (for outbound vehicles after loading).

### Workflow

```
1. Vehicle completes gate-in registration
2. Gate operator directs vehicle to weighbridge
3. Vehicle parks on weighbridge scale
4. Scaling operator records:
   - Vehicle number
   - Material name and code (from gate-in record)
   - Challan/Document number
   - Gross weight (from scale reading)
   - Scale-in date/time
5. System validates:
   - Gate-in record exists
   - Vehicle not already scaled-in (no duplicate)
   - Weight > 0 and within reasonable range (e.g., 1,000 kg - 50,000 kg)
6. System stores scale-in record with operator ID and timestamp
7. System notifies Command Center: "Vehicle [XXX-1234] scaled-in, gross weight: 25,000 kg"
8. Scaling operator directs vehicle to next station:
   - Inbound: QC station or unloading bay
   - Outbound: Loading bay
```

### Data Model

```typescript
interface ScaleInEntry {
  scale_in_id: string;              // Auto-generated (e.g., SI-2026-00123)
  gate_in_id: string;               // Reference to gate-in record
  poi_id: string;                   // Weighbridge location
  
  // Vehicle Details
  vehicle_number: string;
  
  // Weight Details
  gross_weight_kg: number;          // Vehicle + Load
  weight_unit: 'KG' | 'TON';        // Default: KG
  
  // Product Details (from gate-in)
  material_code: string;
  material_name: string;
  challan_number?: string;          // Document reference
  
  // Timestamps
  scale_in_time: Date;
  scale_in_date: Date;
  
  // Operator Details
  operator_id: string;              // Scaling operator user ID
  operator_name: string;
  
  // Discrepancy Logging
  discrepancy_flag: boolean;        // True if issue detected
  discrepancy_type?: 'WRONG_QUANTITY' | 'DRIVER_MISMATCH' | 'DAMAGED_PRODUCT' | 'OTHER';
  discrepancy_remarks?: string;
  
  // Status
  status: 'RECORDED' | 'DISCREPANCY_LOGGED' | 'VOIDED';
  
  // Linked Records
  to_id?: string;
  trip_id?: string;
  
  // Metadata
  created_at: Date;
  tenant_id: string;
}
```

### Weight Validation Rules

**Weight Range Validation:**
```typescript
const MIN_GROSS_WEIGHT_KG = 1000;   // 1 ton (empty small truck)
const MAX_GROSS_WEIGHT_KG = 50000;  // 50 tons (fully loaded large truck)

if (gross_weight_kg < MIN_GROSS_WEIGHT_KG || gross_weight_kg > MAX_GROSS_WEIGHT_KG) {
  triggerWarning('Weight outside expected range. Please verify scale reading.');
}
```

**Duplicate Scale-In Check:**
```typescript
const existingScaleIn = await findScaleInByVehicle(vehicle_number, poi_id);
if (existingScaleIn && !existingScaleIn.scale_out_id) {
  triggerWarning('Vehicle already scaled-in. Possible duplicate entry or re-weighing.');
}
```

### Discrepancy Logging

**Purpose:** Record issues detected during scale-in for investigation and resolution.

**Common Discrepancies:**
1. **Wrong Quantity:** Gross weight significantly different from declared quantity (e.g., document says 20 tons, weight shows 15 tons)
2. **Driver Mismatch:** Driver at weighbridge differs from driver registered at gate-in
3. **Damaged Product:** Visible damage to bags/packaging during weighing
4. **Other:** Miscellaneous issues (vehicle damage, scale malfunction)

**Workflow:**
```
1. Scaling operator detects issue during weighing
2. Operator clicks "Log Discrepancy" button
3. Operator selects discrepancy type and enters remarks
4. System flags scale-in record: discrepancy_flag = true
5. System notifies:
   - Command Center (immediate alert)
   - QC team (if product-related)
   - Operations Manager (if significant quantity variance)
6. Investigation triggered:
   - If weight variance > threshold (e.g., 10%), hold vehicle for re-weighing
   - If driver mismatch, verify identity and update gate-in record
7. Resolution:
   - If resolved, operator updates discrepancy status
   - If unresolved, escalate to management
```

### Command Center Notification

**Notification Payload:**
```typescript
interface ScaleInNotification {
  event: 'SCALE_IN_COMPLETE' | 'SCALE_IN_DISCREPANCY';
  scale_in_id: string;
  vehicle_number: string;
  gross_weight_kg: number;
  material_name: string;
  discrepancy_flag: boolean;
  discrepancy_type?: string;
  timestamp: Date;
  next_station: 'QC_STATION' | 'UNLOADING_BAY' | 'LOADING_BAY';
}
```

**Command Center Action:**
- Updates vehicle queue dashboard
- Assigns vehicle to next station (QC, loading, unloading)
- If discrepancy, alerts relevant personnel

### UI/UX Behavior

**Scale-In Entry Form:**

**Section 1: Vehicle Lookup**
- Vehicle Number (text input or barcode scan)
- "Fetch Gate-In Details" button → Loads gate-in record

**Section 2: Gate-In Summary** (read-only)
- Document Number, Product Name, Declared Quantity
- Driver Name, Party Name

**Section 3: Weight Entry**
- Gross Weight (number input, unit: KG or TON)
- "Capture from Scale" button (if digital scale integrated)
- Scale-In Date/Time (auto-filled, editable if needed)

**Section 4: Discrepancy Logging** (optional)
- "Log Discrepancy" toggle
- Discrepancy Type (dropdown)
- Remarks (text area)

**Action Buttons:**
- **Record Scale-In** (validates, saves, notifies Command Center)
- **Print Weight Slip** (optional, for driver copy)
- **Cancel**

**Real-Time Feedback:**
- Green checkmark: "Scale-In recorded. Gross weight: 25,000 kg. Vehicle directed to QC Station."
- Yellow warning: "Weight (15,000 kg) is 25% lower than declared quantity (20 tons). Discrepancy logged."
- Red error: "Weight outside valid range. Please re-weigh."

---

## Scale-Out (Weight Exit)

### Purpose

Scale-Out captures the **tare weight** (empty vehicle or loaded vehicle after operation) at POI exit. This measurement, combined with scale-in gross weight, enables **net weight calculation** and validates actual loaded/unloaded quantity.

### Workflow

```
1. Vehicle completes operational process:
   - Inbound: Unloading complete
   - Outbound: Loading complete
2. Vehicle returns to weighbridge for scale-out
3. Scaling operator records:
   - Vehicle number (lookup scale-in record)
   - Tare weight (from scale reading)
   - Scale-out date/time
4. System validates:
   - Scale-in record exists
   - Tare weight > 0 and < gross weight (for unloading flows)
   - No existing scale-out (prevent duplicate)
5. System calculates net weight:
   - Net Weight = |Gross Weight - Tare Weight|
6. System generates gate pass token:
   - Vehicle number, Item name, P.C. Code, Net Weight
   - Printable format with QR code
7. System notifies Command Center: "Vehicle [XXX-1234] scaled-out, net weight: 18,000 kg"
8. Scaling operator hands gate pass to driver
9. Driver proceeds to gate for gate-out
```

### Data Model

```typescript
interface ScaleOutEntry {
  scale_out_id: string;             // Auto-generated (e.g., SO-2026-00123)
  scale_in_id: string;              // Reference to scale-in record
  gate_in_id: string;
  poi_id: string;
  
  // Vehicle Details
  vehicle_number: string;
  
  // Weight Details
  tare_weight_kg: number;           // Empty vehicle (or loaded, for outbound)
  net_weight_kg: number;            // Auto-calculated: |gross - tare|
  weight_unit: 'KG' | 'TON';
  
  // Product Details
  material_code: string;
  material_name: string;
  pc_code: string;                  // Product category code
  
  // Timestamps
  scale_out_time: Date;
  scale_out_date: Date;
  
  // Operator Details
  operator_id: string;
  operator_name: string;
  
  // Discrepancy Logging
  discrepancy_flag: boolean;
  discrepancy_type?: 'WRONG_QUANTITY' | 'WEIGHT_VARIANCE' | 'OTHER';
  discrepancy_remarks?: string;
  
  // Gate Pass
  gate_pass_token: string;          // Unique token (e.g., GP-2026-00123)
  gate_pass_issued_at: Date;
  gate_pass_printable: boolean;     // True
  gate_pass_qr_code: string;        // QR code data
  
  // Status
  status: 'RECORDED' | 'GATE_PASS_ISSUED' | 'DISCREPANCY_LOGGED' | 'VOIDED';
  
  // Linked Records
  to_id?: string;
  trip_id?: string;
  
  // Metadata
  created_at: Date;
  tenant_id: string;
}
```

### Net Weight Calculation

**For Inbound Vehicles (Unloading):**
```typescript
net_weight_kg = gross_weight_kg - tare_weight_kg;
// Net weight = Product unloaded
// Example: 25,000 kg (gross) - 7,000 kg (tare) = 18,000 kg (net product)
```

**For Outbound Vehicles (Loading):**
```typescript
net_weight_kg = tare_weight_kg - gross_weight_kg;
// Net weight = Product loaded (if scale-in captured empty vehicle)
// Or: net_weight_kg = tare_weight_kg (if no scale-in, only scale-out)
```

**Weight Variance Check:**
```typescript
const declared_quantity_kg = gate_in_record.declared_quantity * uom_conversion_factor;
const variance_percentage = ((net_weight_kg - declared_quantity_kg) / declared_quantity_kg) * 100;

if (Math.abs(variance_percentage) > VARIANCE_THRESHOLD) {  // e.g., 5%
  discrepancy_flag = true;
  discrepancy_type = 'WEIGHT_VARIANCE';
  discrepancy_remarks = `Net weight (${net_weight_kg} kg) differs from declared (${declared_quantity_kg} kg) by ${variance_percentage.toFixed(2)}%`;
}
```

### Gate Pass Generation

**Purpose:** Issue physical/digital clearance document authorizing vehicle gate-out.

**Gate Pass Format:**
```typescript
interface GatePass {
  token_id: string;                 // Unique token (e.g., GP-2026-00123)
  vehicle_number: string;
  item_name: string;                // Product name
  pc_code: string;                  // Product category code (for classification)
  net_weight_kg: number;
  gross_weight_kg: number;
  tare_weight_kg: number;
  scale_out_time: Date;
  issued_by: string;                // Scaling operator
  qr_code: string;                  // QR code for gate scanning
  printable: true;
}
```

**Gate Pass Template (Printable):**
```
╔═══════════════════════════════════════════╗
║       GATE PASS - CLEARANCE TOKEN         ║
╠═══════════════════════════════════════════╣
║ Token:        GP-2026-00123               ║
║ Vehicle:      ABC-1234                    ║
║ Item:         Chicken Feed (50kg Bag)     ║
║ P.C. Code:    FG-001                      ║
║ Net Weight:   18,000 kg                   ║
║ Gross Weight: 25,000 kg                   ║
║ Tare Weight:  7,000 kg                    ║
║ Date/Time:    2026-02-26 14:30            ║
║ Issued By:    John Doe (Scaling Operator) ║
╠═══════════════════════════════════════════╣
║         [QR CODE]                         ║
║                                           ║
╚═══════════════════════════════════════════╝
```

**Gate Pass Workflow:**
1. Scale-out complete → System generates gate pass
2. Gate pass printed automatically (if printer configured)
3. Scaling operator hands gate pass to driver
4. Driver presents gate pass at gate for gate-out
5. Gate operator scans QR code → Validates token → Allows gate-out

### Immutability of Weight Entries

**Business Rule:** Weight entries (scale-in and scale-out) are **immutable** after scale-out is recorded.

**Rationale:**
- Prevents fraud (weight manipulation after fact)
- Ensures audit trail integrity
- Supports billing and stock tracking accuracy

**Exception:** Authorized users (e.g., Operations Manager) can **void** incorrect entries and create new ones (with full audit logging).

**Voiding Workflow:**
```
1. User with VOID_WEIGHT_ENTRY permission requests void
2. User provides reason (e.g., "Scale malfunction, incorrect reading")
3. System voids scale-out and scale-in records (status → VOIDED)
4. Audit log created with user, timestamp, reason
5. User creates new scale-in and scale-out entries
6. New gate pass issued
```

### UI/UX Behavior

**Scale-Out Entry Form:**

**Section 1: Vehicle Lookup**
- Vehicle Number (text input or barcode scan)
- "Fetch Scale-In Details" button → Loads scale-in record

**Section 2: Scale-In Summary** (read-only)
- Gross Weight, Material Name, Scale-In Time
- Declared Quantity (from gate-in)

**Section 3: Weight Entry**
- Tare Weight (number input, unit: KG or TON)
- "Capture from Scale" button (if digital scale integrated)
- Net Weight (auto-calculated, read-only)
- Scale-Out Date/Time (auto-filled, editable)

**Section 4: Weight Variance Check** (auto-displayed if variance detected)
- Declared Quantity: 20,000 kg
- Net Weight: 18,000 kg
- Variance: -10% (2,000 kg short)
- Warning: "Weight variance exceeds 5% threshold. Log discrepancy?"

**Section 5: Discrepancy Logging** (conditional)
- Discrepancy Type (dropdown)
- Remarks (text area)

**Action Buttons:**
- **Record Scale-Out & Generate Gate Pass** (validates, saves, prints gate pass)
- **Log Discrepancy & Generate Gate Pass** (if variance detected)
- **Cancel**

**Real-Time Feedback:**
- Green checkmark: "Scale-Out recorded. Net weight: 18,000 kg. Gate pass issued: GP-2026-00123."
- Yellow warning: "Weight variance detected (-10%). Discrepancy logged. Gate pass issued."
- Red error: "Tare weight (30,000 kg) exceeds gross weight (25,000 kg). Please verify."

---

## Discrepancy Management

### Common Discrepancies

**1. Weight Variance:**
- **Description:** Net weight differs significantly from declared quantity
- **Threshold:** Typically 5-10% (configurable per product category)
- **Action:** Log discrepancy, notify QC team for inspection, issue gate pass (if within acceptable range)

**2. Wrong Quantity:**
- **Description:** Product quantity mismatch (e.g., document says 500 bags, actual count 480 bags)
- **Action:** Hold vehicle, re-count product, update document, issue revised gate pass

**3. Driver Mismatch:**
- **Description:** Driver at weighbridge differs from driver at gate-in
- **Action:** Verify driver identity, update gate-in record if legitimate change, investigate if suspicious

**4. Damaged Product:**
- **Description:** Visible damage to bags, packaging, or product during weighing
- **Action:** Document damage, photograph evidence, route to QC for inspection, adjust quantity

### Discrepancy Resolution Workflow

```
1. Discrepancy logged during scale-in or scale-out
2. System flags record and notifies:
   - Command Center (immediate alert)
   - Operations Manager (if critical)
   - QC Team (if product-related)
3. Investigation initiated:
   - Physical inspection (re-count, re-weigh, photograph)
   - Document verification (check PO, TO, DO against actual)
   - Driver interview (if driver mismatch or fraud suspected)
4. Resolution actions:
   - Adjust Quantity: Update gate-in/scale records with correct quantity
   - Re-Weigh: Void existing scale entries, re-weigh vehicle
   - Reject Shipment: If quality issue or fraud detected, reject and return
   - Accept with Penalty: Accept shipment with adjustment (for suppliers/vendors)
5. Documentation:
   - Discrepancy report generated (includes photos, weights, timeline)
   - Audit log updated with resolution actions
6. Notification:
   - Finance (if billing adjustment needed)
   - Procurement/Distribution (if supplier/dealer issue)
7. Closure:
   - Discrepancy status updated to RESOLVED or ESCALATED
```

---

## Integration Points

### Upstream: Gate Management

**Gate-In → Scale-In:**
- Gate-in record provides vehicle, product, and document details
- Scale-in queue auto-populated from gate-in events

### Downstream: QC Workflow

**Scale-In → QC Inspection:**
- Inbound vehicles (supplier/port) routed to QC after scale-in
- QC uses net weight (from scale-out) to validate received quantity

### Downstream: Command Center

**Scale Events → Queue Management:**
- Scale-in complete → Vehicle added to QC or loading/unloading queue
- Scale-out complete → Vehicle added to gate-out queue

**Gate Pass Issuance:**
- Scale-out generates gate pass → Command Center notified
- Gate operator retrieves gate pass for vehicle exit clearance

### Downstream: Stock Management

**Net Weight → Stock Updates:**
- Inbound scale-out (after unloading) → Stock +net_weight
- Outbound scale-out (after loading) → Stock -net_weight

### Downstream: Trip Costing

**Net Weight → Trip Billing:**
- Net weight used for vendor billing (if weight-based pricing)
- Weight variance impacts cost reconciliation

---

## Performance & Scalability

### Expected Volume (Phase 1)

- **Daily scale operations:** 100-300 vehicles per POI
- **Peak weighing hours:** 9am-12pm, 2pm-5pm
- **Average weighing time:** 3-5 minutes per vehicle

### Query Optimization

```sql
-- Scale-In by Vehicle (lookup)
CREATE INDEX idx_scale_in_vehicle ON scale_in_entries(vehicle_number, scale_in_time DESC);

-- Scale-Out by Scale-In (net weight calculation)
CREATE INDEX idx_scale_out_scale_in ON scale_out_entries(scale_in_id);

-- Discrepancy Tracking
CREATE INDEX idx_scale_discrepancy ON scale_in_entries(discrepancy_flag, poi_id, scale_in_time DESC)
WHERE discrepancy_flag = true;

-- Gate Pass Lookup
CREATE INDEX idx_gate_pass_token ON scale_out_entries(gate_pass_token);
```

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All scale entries filtered by `tenant_id`
- **POI-Based Access:** Scaling operators can only access scales at their assigned POI
- **Role-Based Permissions:**
  - Scaling Operator: Create scale-in/scale-out entries, log discrepancies
  - Operations Manager: Void entries, resolve discrepancies
  - Admin: All operations, audit logs

### Audit Requirements

**Mandatory Audit Events:**
- Scale-in entry
- Scale-out entry
- Discrepancy logging
- Weight entry void/edit (if allowed)
- Gate pass generation
- Net weight calculation

**Immutability:**
- Weight entries cannot be edited after scale-out (unless voided by authorized user)
- All voids and edits fully audit-logged

---

## Key Design Decisions

### Why Separate Scale-In and Scale-Out?

**Rationale:**
- Gross weight (scale-in) and tare weight (scale-out) captured at different times
- Allows operational processes (loading, unloading, QC) to occur between weighings
- Enables net weight calculation only after both measurements complete

### Why Auto-Calculate Net Weight?

**Rationale:**
- Eliminates manual calculation errors
- Ensures consistency (single source of truth)
- Simplifies operator workflow (no mental math required)

### Why Immutable Weight Entries?

**Rationale:**
- Prevents fraud (weight manipulation post-facto)
- Ensures billing accuracy (weights used for invoicing)
- Maintains audit integrity (historical records preserved)

### Why Generate Gate Pass at Scale-Out?

**Rationale:**
- Scale-out confirms all operational processes complete (loading/unloading done)
- Net weight validated (quantity confirmed)
- Gate pass serves as final clearance document for gate-out

---

## Related User Stories

- **US-045:** Scale-In Entry
- **US-046:** Scale-Out Entry
- **US-047:** Net Weight Calculation
- **US-048:** Gate Pass Generation
- **US-049:** Discrepancy Logging
- **US-050:** Weight Variance Detection

---

## Summary

Scaling/Weighing Management is the **weight verification layer** that provides:

- **Accurate Weight Capture:** Gross weight (scale-in) and tare weight (scale-out) with operator accountability
- **Net Weight Calculation:** Automatic calculation of actual product weight (gross - tare)
- **Weight Validation:** Detect variances between declared and actual quantities
- **Discrepancy Management:** Log, investigate, and resolve weight and quantity issues
- **Gate Pass Generation:** Issue clearance documents for vehicle exit
- **Immutable Records:** Prevent weight fraud with audit-logged, immutable entries
- **Command Center Integration:** Real-time notifications and queue management

Scaling Management ensures that product quantities are accurately measured, validated, and documented, providing the foundation for inventory tracking, billing accuracy, and operational control.
