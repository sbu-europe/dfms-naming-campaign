---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Command Center Operations, Gate, Weighing, Command Center & QC Operations
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [gate-management, scaling-management, qc-workflow, trip-management]
---

# Command Center Operations

## Overview

Command Center Operations is the **orchestration and monitoring hub** that coordinates all POI (Point of Interest) operational activities. It provides centralized visibility, queue management, task assignment, and real-time monitoring of vehicles, personnel, and processes across gate, weighing, loading/unloading, and QC stations.

The Command Center acts as the **operational brain** of each POI, ensuring smooth workflow progression, resolving bottlenecks, handling exceptions, and maintaining situational awareness for operations managers and supervisors.

### Purpose

- Centralized monitoring of all POI operations (gate, weighing, QC, loading/unloading)
- Real-time queue management and vehicle tracking
- Task assignment to operational staff (loaders, unloaders, QC inspectors)
- Queue token generation and printing
- On-demand operational actions (TO creation, urgent handling)
- Exception handling and incident management
- Performance dashboards and operational metrics
- Gate pass issuance and clearance management

### Workflow Position

```
Vehicle Enters POI
    ↓
Gate-In Registered → Command Center notified
    ↓
Command Center:
  - Assigns vehicle to station (weighbridge, QC, loading bay)
  - Generates queue token
  - Monitors progress
    ↓
Operational Stations (Gate, Weighing, QC, Loading/Unloading):
  - Execute assigned tasks
  - Report status to Command Center
    ↓
Command Center:
  - Tracks completion
  - Issues gate pass (after all clearances)
    ↓
Gate-Out Cleared → Vehicle Exits POI
```

---

## Command Center Dashboard

### Purpose

Provide real-time visibility of all POI operations through a **unified dashboard** showing vehicle status, queue lengths, station utilization, and pending tasks.

### Dashboard Sections

**1. Vehicle Queue Overview**
- **Active Vehicles:** Count of vehicles currently at POI (gate-in but not gate-out)
- **By Status:**
  - Awaiting Scale-In: 12
  - At QC Station: 5
  - Unloading: 8
  - Awaiting Scale-Out: 3
  - Awaiting Gate-Out: 2

**2. Station Status**
- **Weighbridge:** OPERATIONAL (2 vehicles in queue)
- **QC Station 1:** BUSY (Vehicle ABC-1234, estimated completion: 14:30)
- **QC Station 2:** IDLE
- **Loading Bay 1:** BUSY (Vehicle XYZ-5678, 60% complete)
- **Loading Bay 2:** IDLE
- **Unloading Bay 1:** BUSY (Vehicle DEF-9012, 40% complete)

**3. Urgent Alerts**
- ⚠️ Vehicle ABC-1234: Dwell time 4 hours (threshold: 3 hours)
- 🔴 QC Failed: Vehicle LMN-3456 (Moisture content 18%, rejected)
- ⚠️ Weighbridge 1: Scale calibration due (overdue by 2 days)

**4. Task Assignment Queue**
- **Pending QC Inspections:** 3 vehicles
- **Pending Unloading:** 5 vehicles
- **Pending Loading:** 2 vehicles

**5. Performance Metrics (Today)**
- **Total Gate-Ins:** 47
- **Total Gate-Outs:** 42
- **Average Dwell Time:** 2 hours 35 minutes
- **QC Pass Rate:** 94% (44 passed, 3 failed)
- **On-Time Delivery Rate:** 89% (based on planned delivery times)

---

## Queue Management

### Purpose

Manage vehicle progression through operational stations, prioritizing based on urgency, document type, and resource availability.

### Queue Types

**1. Scale-In Queue:**
- Vehicles awaiting weighing (post gate-in)
- Priority: CRITICAL > HIGH > NORMAL
- Display: Vehicle number, product, declared quantity, urgency, wait time

**2. QC Inspection Queue:**
- Inbound vehicles awaiting QC inspection (post scale-in)
- Priority: Port consignments > Suppliers > Internal
- Display: Vehicle number, product, supplier, sample ID, assigned inspector

**3. Loading Queue:**
- Outbound vehicles awaiting loading (dealer/distributor)
- Priority: Urgency, scheduled delivery time
- Display: Vehicle number, DO number, product, loading bay assigned

**4. Unloading Queue:**
- Inbound vehicles awaiting unloading (post QC pass)
- Priority: QC completion time (first-in-first-out)
- Display: Vehicle number, product, QC status, unloading bay assigned

**5. Scale-Out Queue:**
- Vehicles awaiting final weighing (post loading/unloading)
- Priority: Gate-out scheduled time
- Display: Vehicle number, process complete (loading/unloading), gate pass ready

**6. Gate-Out Queue:**
- Vehicles awaiting exit clearance (post scale-out + QC pass)
- Priority: Driver availability, gate pass issued time
- Display: Vehicle number, gate pass token, clearances (QC, Scale-out)

### Queue Token Generation

**Purpose:** Issue physical/digital tokens to vehicles for queue tracking and station identification.

**Queue Token Contents:**
```typescript
interface QueueToken {
  token_id: string;                 // Unique token (e.g., QT-2026-00123)
  gate_in_id: string;
  vehicle_number: string;
  document_number: string;
  queue_type: 'SCALE_IN' | 'QC' | 'LOADING' | 'UNLOADING' | 'SCALE_OUT';
  queue_position: number;           // e.g., 3 (3rd in queue)
  estimated_wait_time_minutes: number;
  next_station: string;             // "Weighbridge 1", "QC Station 2"
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  issued_at: Date;
  qr_code: string;                  // For scanning at stations
  printable: boolean;               // True
}
```

**Token Workflow:**
```
1. Vehicle completes gate-in
2. Command Center generates queue token
3. Token printed at gate (or sent to driver's mobile app)
4. Driver receives token with:
   - Queue position
   - Estimated wait time
   - Next station location
5. Driver proceeds to station and presents token
6. Station operator scans token → Auto-loads vehicle details
```

### Queue Prioritization Logic

```typescript
function prioritizeQueue(vehicles: Vehicle[]): Vehicle[] {
  return vehicles.sort((a, b) => {
    // Priority 1: Urgency (CRITICAL > HIGH > NORMAL)
    if (a.urgency !== b.urgency) {
      return urgencyScore[b.urgency] - urgencyScore[a.urgency];
    }
    
    // Priority 2: Document type (Port > Supplier > Internal)
    if (a.document_category !== b.document_category) {
      return docTypeScore[b.document_category] - docTypeScore[a.document_category];
    }
    
    // Priority 3: Wait time (FIFO - first in, first out)
    return a.gate_in_time.getTime() - b.gate_in_time.getTime();
  });
}
```

---

## Task Assignment

### Purpose

Assign operational tasks (QC inspection, loading, unloading) to available personnel based on workload, skill, and location.

### Task Types

**1. QC Inspection Assignment:**
```typescript
interface QCTaskAssignment {
  task_id: string;
  qc_event_id: string;
  vehicle_number: string;
  product_name: string;
  assigned_to: string;              // QC Inspector user ID
  assigned_at: Date;
  estimated_duration_minutes: number; // e.g., 45
  priority: 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}
```

**2. Loading Assignment:**
```typescript
interface LoadingTaskAssignment {
  task_id: string;
  to_id: string;                    // Transport Order or Delivery Order
  vehicle_number: string;
  product_name: string;
  quantity_to_load: number;
  uom: string;
  loading_bay: string;              // "Bay 1", "Bay 2"
  assigned_team: string[];          // Loader user IDs
  assigned_at: Date;
  estimated_duration_minutes: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}
```

**3. Unloading Assignment:**
```typescript
interface UnloadingTaskAssignment {
  task_id: string;
  gate_in_id: string;
  vehicle_number: string;
  product_name: string;
  quantity_to_unload: number;
  uom: string;
  unloading_bay: string;
  assigned_team: string[];          // Unloader user IDs
  assigned_at: Date;
  estimated_duration_minutes: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';
}
```

### Assignment Workflow

```
1. Vehicle enters queue (e.g., QC Inspection Queue)
2. Command Center operator:
   - Selects vehicle from queue
   - Clicks "Assign Task"
   - Selects available personnel (or auto-assign if configured)
   - Confirms assignment
3. System:
   - Creates task assignment record
   - Notifies assigned personnel (push notification, SMS)
   - Updates queue status (vehicle → "Assigned")
4. Personnel:
   - Receives task notification in mobile app or dashboard
   - Accepts task
   - Proceeds to station/bay
   - Starts task (status → "In Progress")
5. Task completion:
   - Personnel marks task complete
   - System updates queue, removes vehicle from queue
   - Command Center notified
```

### Auto-Assignment (Round-Robin)

**Purpose:** Automatically distribute tasks to available personnel to balance workload.

```typescript
function autoAssignTask(task: Task, availablePersonnel: User[]): User {
  // Filter personnel by:
  // 1. Role (QC Inspector, Loader, Unloader)
  // 2. Current workload (< max concurrent tasks)
  // 3. Location (at POI, not on break)
  
  const eligiblePersonnel = availablePersonnel.filter(user => 
    user.role === task.required_role &&
    user.current_tasks.length < MAX_CONCURRENT_TASKS &&
    user.status === 'AVAILABLE'
  );
  
  // Round-robin: Select least recently assigned
  const leastRecentlyAssigned = eligiblePersonnel.sort((a, b) => 
    a.last_assignment_time.getTime() - b.last_assignment_time.getTime()
  )[0];
  
  return leastRecentlyAssigned;
}
```

---

## On-Demand Operations

### On-Demand TO Creation at Gate

**Purpose:** Handle **unplanned or urgent** deliveries by allowing Command Center or gate operators to create Transport Orders (TO) on-the-fly.

**Use Cases:**
1. **Dealer Outbound (DO):** Walk-in dealer without pre-scheduled delivery
2. **Supplier Inbound (PO):** Emergency supplier delivery without advance notice
3. **Internal Transfer:** Urgent inter-POI transfer not in daily plan

**Workflow:**
```
1. Vehicle arrives at gate (unscheduled)
2. Gate operator checks system: No existing TO for this vehicle
3. Gate operator contacts Command Center
4. Command Center operator:
   - Verifies legitimacy (dealer/supplier credentials, document)
   - Creates on-demand TO:
     - Document type (DO/PO/Challan)
     - Product details
     - Quantity
     - Urgency = HIGH or CRITICAL
5. System generates TO with status = 'ON_DEMAND'
6. Gate-in proceeds with new TO reference
7. Operations continue normally (loading/unloading, QC, etc.)
8. Post-operation review:
   - Finance reviews on-demand TO for approval
   - If rejected, flagged for follow-up (but operations already complete)
```

**Data Model:**
```typescript
interface OnDemandTO {
  to_id: string;
  creation_context: 'ON_DEMAND_GATE';
  created_by: string;               // Command Center or Gate Operator
  created_at: Date;
  justification: string;            // "Emergency supplier delivery", "Urgent customer order"
  approved: boolean;                // Post-facto approval
  approved_by?: string;
  approved_at?: Date;
}
```

---

## Gate Pass Issuance

### Purpose

Issue **gate pass clearance tokens** after all operational processes complete, authorizing vehicle exit.

**Gate Pass Issuance Workflow:**
```
1. Vehicle completes all operations:
   - Inbound: Scale-In → QC (Pass) → Unloading → Scale-Out
   - Outbound: Loading → Scale-Out
2. Command Center monitors clearance status:
   - ✅ Scale-Out complete
   - ✅ QC Passed (if inbound)
   - ✅ Loading/Unloading complete
3. Command Center operator clicks "Issue Gate Pass"
4. System generates gate pass token:
   - Vehicle number, Net weight, Product details
   - QR code, Delivery note (printable)
5. Gate pass sent to:
   - Scaling station (printed with delivery note)
   - Driver's mobile app (digital copy)
   - Gate operator dashboard (for verification)
6. Driver receives gate pass and proceeds to gate
7. Gate operator verifies gate pass and allows gate-out
```

**Gate Pass Validation at Gate-Out:**
```
1. Driver presents gate pass (paper or QR code)
2. Gate operator scans QR code or enters token ID
3. System validates:
   - Token exists and not expired
   - Linked vehicle matches (vehicle number)
   - All clearances met (QC, scale-out)
4. If valid:
   - Gate-out entry allowed
   - Vehicle exits POI
5. If invalid:
   - Gate operator rejects (error message displayed)
   - Driver sent back to Command Center for resolution
```

---

## Exception Handling & Incident Management

### Purpose

Detect, escalate, and resolve operational exceptions (delays, QC failures, equipment issues) that disrupt normal workflow.

### Exception Types

**1. Excessive Dwell Time:**
- **Trigger:** Vehicle at POI > threshold time (e.g., 3 hours for outbound, 4 hours for inbound)
- **Alert:** ⚠️ Warning notification to Command Center
- **Action:** Investigate bottleneck, expedite processing, reassign resources

**2. QC Failure:**
- **Trigger:** QC status = FAIL
- **Alert:** 🔴 Critical alert to Operations Manager, Procurement Team
- **Action:** Hold vehicle, initiate rejection or rework process, notify supplier

**3. Equipment Malfunction:**
- **Trigger:** Manual report by operator (weighbridge scale, loading equipment)
- **Alert:** 🔴 Critical alert to Maintenance Team, Command Center
- **Action:** Redirect vehicles to alternate station, log downtime, request repair

**4. Driver/Vehicle Mismatch:**
- **Trigger:** Discrepancy logged at gate-in or weighbridge
- **Alert:** ⚠️ Warning to Security, Command Center
- **Action:** Verify identity, investigate potential fraud, hold vehicle if suspicious

**5. Document Missing/Invalid:**
- **Trigger:** Gate operator reports missing PO/TO/DO document
- **Alert:** ⚠️ Warning to Command Center, Procurement/Distribution
- **Action:** Verify legitimacy, request document upload, hold vehicle until resolved

### Incident Management Workflow

```
1. Exception detected (auto or manual report)
2. System creates incident record:
   - Incident type, severity (LOW/MEDIUM/HIGH/CRITICAL)
   - Affected vehicle, station, personnel
   - Description, timestamp
3. Incident assigned to resolver:
   - Operations Manager (high severity)
   - Supervisor (medium severity)
   - Command Center operator (low severity)
4. Resolver takes action:
   - Investigate (check logs, interview personnel)
   - Resolve (fix equipment, expedite process, approve exception)
   - Escalate (if unable to resolve)
5. Incident resolution:
   - Resolver logs resolution action and outcome
   - Incident closed
   - Vehicle operations resume
6. Post-incident review:
   - Root cause analysis (if recurring)
   - Process improvement (preventive measures)
```

---

## Real-Time Monitoring & Alerts

### Purpose

Provide **live operational visibility** and **proactive alerting** to prevent issues and optimize flow.

### Monitoring Dashboards

**1. Vehicle Location Tracker (Phase 2+):**
- Real-time GPS tracking of vehicles on POI premises
- Geofence zones (gate, weighbridge, QC, loading bay)
- Dwell time heatmap (identify bottleneck zones)

**2. Resource Utilization:**
- Weighbridge utilization (% time occupied)
- QC station occupancy
- Loading/Unloading bay utilization
- Personnel workload (tasks per person)

**3. Queue Analytics:**
- Average queue wait time (per station)
- Longest waiting vehicle (alert if > threshold)
- Queue length trend (hourly, daily)

### Alert Rules

```typescript
interface AlertRule {
  rule_id: string;
  rule_name: string;                // e.g., "Excessive Dwell Time"
  condition: string;                // e.g., "dwell_time > 180 minutes"
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  notification_channels: ('DASHBOARD' | 'EMAIL' | 'SMS' | 'PUSH')[];
  notify_users: string[];           // User IDs to notify
  auto_escalate: boolean;           // Escalate if unresolved in X minutes
  escalate_after_minutes?: number;
}
```

**Example Alert Rules:**
1. **Excessive Dwell Time:** If `dwell_time > 180 minutes` → Alert Operations Manager
2. **QC Failure:** If `qc_status = FAIL` → Alert Procurement Team, Operations Manager
3. **Queue Backlog:** If `scale_in_queue.length > 10` → Alert Command Center Supervisor
4. **Weighbridge Downtime:** If `weighbridge_status = OFFLINE` → Alert Maintenance Team

---

## Performance Dashboards & Operational Metrics

### Purpose

Track and visualize **key performance indicators (KPIs)** for operational efficiency and continuous improvement.

### KPIs Tracked

**1. Throughput Metrics:**
- **Vehicles Processed Today:** 47 gate-ins, 42 gate-outs
- **Hourly Throughput:** Average 5 vehicles/hour
- **Peak Hours:** 9am-11am (15 vehicles), 2pm-4pm (12 vehicles)

**2. Efficiency Metrics:**
- **Average Dwell Time:** 2 hours 35 minutes
- **Average QC Duration:** 45 minutes
- **Average Loading Time:** 1 hour 20 minutes
- **Average Unloading Time:** 1 hour 10 minutes

**3. Quality Metrics:**
- **QC Pass Rate:** 94% (44 passed, 3 failed)
- **Weight Variance:** Average 2.1% (net weight vs declared)
- **Damage Rate:** 1.5% (bags damaged during unloading)

**4. Timeliness Metrics:**
- **On-Time Delivery Rate:** 89% (vehicles gate-out within scheduled time)
- **SLA Compliance:** 92% (vehicles processed within SLA threshold)

**5. Resource Utilization:**
- **Weighbridge Utilization:** 78% (active time / total time)
- **QC Station Utilization:** 65%
- **Loading Bay Utilization:** 82%

### Dashboard Views

**Real-Time View (Today):**
- Current metrics, active vehicles, queue lengths, alerts

**Historical View (Last 7/30 days):**
- Trend charts (dwell time, throughput, QC pass rate)
- Comparative analysis (week-over-week, month-over-month)

**Predictive View (Phase 2+):**
- Forecasted arrival patterns (based on scheduled deliveries)
- Resource allocation recommendations (optimal staff scheduling)

---

## Integration Points

### Upstream: Gate Management

**Gate-In Events → Command Center:**
- Real-time gate-in notifications
- Vehicle added to queue tracking

### Upstream: Scaling Management

**Scale-In/Scale-Out Events → Command Center:**
- Queue progression updates
- Weight validation alerts

### Upstream: QC Workflow

**QC Events → Command Center:**
- QC inspection assignments
- QC pass/fail notifications
- Gate-out clearance (if QC pass)

### Downstream: Mobile Apps

**Command Center → Driver App:**
- Queue token with wait time
- Task completion notifications
- Gate pass issuance

**Command Center → Operator App:**
- Task assignments (loading, unloading, QC)
- Queue updates

---

## Security & Compliance

### Data Access Control

- **Tenant Isolation:** All Command Center data filtered by `tenant_id`
- **POI-Based Access:** Command Center operators can only manage own POI
- **Role-Based Permissions:**
  - Command Center Operator: Queue management, task assignment, gate pass issuance
  - Operations Manager: All operations + exception handling + performance dashboards
  - POI Admin: All operations + system configuration

### Audit Requirements

**Mandatory Audit Events:**
- Task assignment
- Gate pass issuance
- On-demand TO creation
- Exception/incident resolution
- Queue prioritization changes
- Equipment downtime logging

---

## Key Design Decisions

### Why Centralized Command Center?

**Rationale:**
- Single point of visibility for all POI operations
- Enables proactive bottleneck resolution
- Facilitates resource optimization (staff, equipment)
- Provides real-time decision-making capability

### Why Queue Token System?

**Rationale:**
- Provides drivers with wait time transparency
- Enables self-service navigation (drivers know where to go)
- Reduces confusion (clear queue position)
- Supports contactless operations (QR code scanning)

### Why On-Demand TO Creation?

**Rationale:**
- Handles urgent/unplanned deliveries flexibly
- Prevents operational delays (no need to wait for pre-approval)
- Enables business agility (capture walk-in opportunities)
- Post-facto approval ensures governance

---

## Related User Stories

- **US-057:** Command Center Queue Management
- **US-058:** Task Assignment (QC, Loading, Unloading)
- **US-059:** Queue Token Generation
- **US-060:** Gate Pass Issuance
- **US-061:** On-Demand TO Creation
- **US-062:** Exception Handling
- **US-063:** Performance Dashboards

---

## Summary

Command Center Operations is the **orchestration and monitoring hub** that provides:

- **Centralized Visibility:** Real-time monitoring of all POI operations (gate, weighing, QC, loading/unloading)
- **Queue Management:** Vehicle tracking, prioritization, and progression through operational stations
- **Task Assignment:** Automated or manual assignment of tasks to personnel (QC, loading, unloading)
- **Queue Tokens:** Printed/digital tokens with wait times and station directions
- **On-Demand Operations:** Flexible TO creation for urgent/unplanned deliveries
- **Gate Pass Issuance:** Clearance token generation after all operations complete
- **Exception Handling:** Proactive alerts and incident resolution for delays, failures, equipment issues
- **Performance Dashboards:** KPI tracking and operational analytics for continuous improvement

Command Center Operations ensures smooth workflow progression, resource optimization, and situational awareness across all POI activities, serving as the operational control tower for efficient logistics execution.
