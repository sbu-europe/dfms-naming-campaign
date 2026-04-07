---
source_document: PRD_DFMS_v1.0.md
source_sections: Driver Registration & Management
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [vehicle-management, trip-management, helper-management]
---

# Driver Management

## Overview

Driver Management is the **driver resource registry and assignment system** that maintains driver master data, tracks driver availability, manages vehicle-driver pairing, monitors work hours, and enables performance tracking. It ensures that only verified, licensed, and available drivers operate vehicles, while providing visibility into driver utilization and compliance with work hour regulations.

The system supports both own drivers (permanent/temporary employees) and vendor drivers (third-party), tracking critical information like license validity, experience, training, medical fitness, and operational status for safe and compliant transport operations.

### Purpose

- Register and maintain driver profiles with complete credentials
- Track driver license validity and compliance documents
- Manage driver-vehicle assignments with availability checks
- Monitor driver operational status (Available, Assigned, On Leave, On Trip)
- Track work hours and attendance for compliance
- Calculate driver utilization and performance metrics
- Prevent double-booking and enforce work hour limits
- Support driver safety and training tracking
- Provide audit trail for all driver-related activities

---

## Driver Registration

### Driver Profile Data Model

```typescript
interface Driver {
  driver_id: string;                // Auto-generated (e.g., DRV-2026-00123)
  
  // Personal Information
  full_name: string;
  date_of_birth: Date;
  national_id: string;              // Unique
  phone: string;
  email?: string;
  address?: string;
  photo_url?: string;
  
  // License Information
  license_number: string;           // Unique driving license
  license_type: 'LIGHT_VEHICLE' | 'HEAVY_VEHICLE' | 'SPECIAL_VEHICLE';
  license_issue_date: Date;
  license_expiry_date: Date;
  license_document_url?: string;
  
  // Driver Type
  driver_type: 'OWN_PERMANENT' | 'OWN_TEMPORARY' | 'VENDOR';
  vendor_id?: string;               // If driver_type = VENDOR
  
  // Experience & Credentials
  years_of_experience: number;
  experience_certificate_url?: string;
  last_training_date?: Date;
  last_training_type?: string;
  last_assessment_date?: Date;
  assessment_score?: number;
  
  // Safety & Compliance
  medical_certificate_url?: string;
  medical_certificate_expiry?: Date;
  accident_history?: AccidentRecord[];
  
  // Reference Contacts (Minimum 2)
  reference_contacts: ReferenceContact[];
  
  // Operational Status
  status: DriverStatus;
  availability: DriverAvailability;
  current_vehicle_id?: string;      // Currently assigned vehicle
  current_trip_id?: string;         // Currently on trip
  
  // Utilization Metrics
  total_trips_count: number;
  total_distance_km: number;
  total_driving_hours: number;
  utilization_rate_percentage: number;
  
  // Metadata
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tenant_id: string;
}

type DriverStatus = 
  | 'ACTIVE'                        // Operational, can be assigned
  | 'ON_LEAVE'                      // Temporary absence
  | 'INACTIVE'                      // Terminated/resigned, or permanently deactivated (US-007)
  | 'SUSPENDED'                     // Disciplinary action, or temporarily suspended (US-007)
  | 'PENDING_VERIFICATION';         // Vendor driver pending approval

type DriverAvailability = 
  | 'AVAILABLE'                     // Not assigned, ready for work
  | 'ASSIGNED_TO_VEHICLE'           // Paired with vehicle (default driver)
  | 'ON_TRIP'                       // Active trip in progress
  | 'ON_BREAK';                     // Short break during shift

interface ReferenceContact {
  name: string;
  relationship: string;             // e.g., "Previous Employer", "Family Member"
  phone: string;
  verified: boolean;
}

interface AccidentRecord {
  date: Date;
  description: string;
  severity: 'MINOR' | 'MAJOR' | 'FATAL';
  fault_determination?: 'DRIVER_FAULT' | 'NO_FAULT' | 'PARTIAL_FAULT';
  police_report_number?: string;
}
```

---

## Driver-Vehicle Assignment

### Purpose

Manage the pairing of drivers with vehicles, enabling default assignments for routine operations and ensuring availability validation during trip planning.

### Assignment Types

**1. Default Assignment (Long-Term Pairing)**
- Driver assigned as **default operator** for a specific vehicle
- Used for routine trips, simplifies dispatch
- One driver can be default for one vehicle only
- One vehicle can have one default driver

**2. Trip-Specific Assignment**
- Driver assigned to specific trip (may override default)
- Flexible for workload balancing, driver substitution
- Multiple drivers can operate same vehicle over time (different trips)

### Assignment Workflow

```
1. Transport Planner or Fleet Manager initiates assignment
2. System validates:
   - Driver status = ACTIVE
   - Driver availability = AVAILABLE or ASSIGNED_TO_VEHICLE
   - Driver not on another active trip
   - Driver license type matches vehicle type (Heavy/Light)
   - Driver not on leave
   - Vehicle status = ACTIVE
   - Vehicle not under maintenance
3. System creates assignment record
4. Driver availability → 'ASSIGNED_TO_VEHICLE'
5. Vehicle assigned_driver_id updated
6. Assignment logged with timestamp
```

### Data Model

```typescript
interface DriverVehicleAssignment {
  assignment_id: string;
  driver_id: string;
  vehicle_id: string;
  
  // Assignment Type
  assignment_type: 'DEFAULT' | 'TRIP_SPECIFIC';
  trip_id?: string;                 // If trip-specific
  
  // Dates
  assignment_start_date: Date;
  assignment_end_date?: Date;       // Null = ongoing
  
  // Assignment Context
  assigned_by: string;              // User who made assignment
  assignment_reason?: string;
  
  // Status
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  
  // Metadata
  created_at: Date;
}
```

### Assignment Rules

**Validation Rules:**
1. **No Double-Booking:** Driver cannot be assigned to multiple vehicles simultaneously
2. **License Match:** Heavy vehicle requires Heavy Vehicle license
3. **Status Check:** Both driver and vehicle must be ACTIVE
4. **Availability:** Driver must be AVAILABLE or already assigned to this vehicle
5. **Leave Check:** Driver not on leave during assignment period

**Auto-Unassignment:**
- Trip completion → Driver availability → 'AVAILABLE'
- Manual reassignment → Previous assignment ends, new begins
- Driver goes on leave → Assignment suspended

**User-Level Account Deactivation (US-007):**
When a driver's user account is deactivated through the account deactivation workflow:
- **Temporary Suspension**: Driver status → `SUSPENDED`; driver excluded from all assignment dropdowns and new trip assignments; existing default vehicle pairing suspended
- **Permanent Deactivation**: Driver status → `INACTIVE`; driver permanently excluded from assignments; vehicle pairing removed; historical trip records preserved
- **Reactivation**: Driver status → `ACTIVE` upon user account reactivation; admin must manually reassign vehicle pairing if needed

> See [User & Tenant Management - Section 6](../01-foundation/user-tenant-management.md) and [US-007: Account Deactivation](../../04-backlog/stories/US-007-account-deactivation.md) for the full deactivation workflow.

---

## Driver State Tracking

### Purpose

Monitor real-time driver operational status to enable efficient trip assignment and ensure compliance with work regulations.

### Driver States

**AVAILABLE (Default - Unassigned)**
- Driver checked in, ready for work
- Not assigned to vehicle or trip
- Can be assigned immediately

**ASSIGNED_TO_VEHICLE**
- Driver paired with vehicle (default assignment)
- Can start trip when vehicle scheduled
- Transition: AVAILABLE → Vehicle assignment → ASSIGNED_TO_VEHICLE

**ON_TRIP**
- Driver actively operating vehicle on trip
- Cannot be assigned to another trip
- Highest priority state (overrides all others)
- Transition: ASSIGNED_TO_VEHICLE → Trip start → ON_TRIP

**ON_LEAVE**
- Driver temporarily absent (sick leave, vacation, personal)
- Cannot be assigned to any vehicle/trip
- Transition: Any state → Manual leave entry → ON_LEAVE

**ON_BREAK**
- Short break during shift (lunch, rest)
- Expected to return soon (< 2 hours)
- May be assigned if break ends

### State Transitions

```typescript
const STATE_TRANSITIONS = {
  'AVAILABLE': ['ASSIGNED_TO_VEHICLE', 'ON_LEAVE', 'ON_BREAK'],
  'ASSIGNED_TO_VEHICLE': ['ON_TRIP', 'AVAILABLE', 'ON_LEAVE'],
  'ON_TRIP': ['ASSIGNED_TO_VEHICLE', 'AVAILABLE'],
  'ON_LEAVE': ['AVAILABLE'],
  'ON_BREAK': ['AVAILABLE', 'ASSIGNED_TO_VEHICLE']
};

function transitionDriverState(driver_id: string, new_state: DriverAvailability): boolean {
  const driver = getDriver(driver_id);
  const allowedTransitions = STATE_TRANSITIONS[driver.availability];
  
  if (!allowedTransitions.includes(new_state)) {
    throw new Error(`Invalid state transition: ${driver.availability} → ${new_state}`);
  }
  
  updateDriver(driver_id, { availability: new_state, updated_at: new Date() });
  logStateTransition(driver_id, driver.availability, new_state);
  
  return true;
}
```

### Automatic State Updates

**Trip-Based Updates:**
- **Trip Assignment:** Driver → 'ON_TRIP'
- **Trip Start:** Confirm 'ON_TRIP' (GPS movement detected)
- **Trip Completion:** Driver → 'AVAILABLE' or 'ASSIGNED_TO_VEHICLE'

**Manual Updates:**
- **Leave Entry:** Supervisor sets 'ON_LEAVE' with start/end dates
- **Break:** Driver marks self 'ON_BREAK' (mobile app)
- **Check-In:** Driver marks self 'AVAILABLE' at shift start

---

## Driver Attendance & Work Hours

### Purpose

Track driver work time for compliance with labor regulations, payroll processing, and utilization analysis.

### Attendance Tracking

**Attendance Entry Types:**

**1. Manual Entry (Supervisor)**
```typescript
interface ManualAttendance {
  attendance_id: string;
  driver_id: string;
  poi_id: string;                   // Where driver checked in
  
  entry_date_time: Date;            // Clock-in
  exit_date_time?: Date;            // Clock-out (null if ongoing)
  
  work_hours: number;               // Calculated: exit - entry
  break_hours?: number;             // Deducted from work hours
  net_work_hours: number;           // work_hours - break_hours
  
  recorded_by: string;              // Supervisor user ID
  remarks?: string;
}
```

**2. GPS-Derived Attendance (Automated)**
```typescript
interface GPSDerivedAttendance {
  attendance_id: string;
  driver_id: string;
  trip_id: string;
  
  trip_start_time: Date;
  trip_end_time: Date;
  
  total_trip_duration: number;      // End - Start (hours)
  driving_hours: number;            // Excludes idle, parked time
  idle_hours: number;               // Vehicle stationary with engine on
  
  derived_by: 'GPS_TRACKER';
}
```

**3. Consolidated Attendance**
- System merges manual + GPS data for complete picture
- Priority: GPS data (more accurate) > Manual entry
- Used for payroll, compliance reporting

### Work Hour Compliance

**Maximum Work Hours:**
- **Default Limit:** 12 hours per day (configurable)
- **Weekly Limit:** 72 hours per week (configurable)

**Compliance Checks:**
```typescript
function checkWorkHourCompliance(driver_id: string, date: Date): ComplianceStatus {
  const todayHours = getDriverWorkHours(driver_id, date);
  const weekHours = getDriverWorkHours(driver_id, getWeekRange(date));
  
  const violations: string[] = [];
  
  if (todayHours > MAX_DAILY_HOURS) {
    violations.push(`Daily limit exceeded: ${todayHours} hours (max: ${MAX_DAILY_HOURS})`);
  }
  
  if (weekHours > MAX_WEEKLY_HOURS) {
    violations.push(`Weekly limit exceeded: ${weekHours} hours (max: ${MAX_WEEKLY_HOURS})`);
  }
  
  return {
    compliant: violations.length === 0,
    violations: violations,
    todayHours: todayHours,
    weekHours: weekHours
  };
}
```

**Compliance Enforcement:**
- **Alert:** Warning when driver approaches limit (90% of max)
- **Block:** Prevent trip assignment if limit exceeded
- **Report:** Weekly compliance report to Operations Manager

---

## Driver Leave Management

### Leave Types

- **Sick Leave:** Medical illness/injury
- **Annual Leave:** Vacation, personal days
- **Emergency Leave:** Urgent family matters
- **Unpaid Leave:** Extended absence without pay

### Leave Workflow

```
1. Driver requests leave (mobile app or verbal to supervisor)
2. Supervisor logs leave in system:
   - Driver, Leave Type, Start Date, End Date
3. System validates:
   - No overlapping leave periods
   - Driver not on active trip
4. System updates driver status → 'ON_LEAVE'
5. Driver removed from available pool (cannot be assigned)
6. Leave end date reached:
   - System auto-updates status → 'AVAILABLE' (or manual supervisor action)
7. Driver returns to work, check-in resumes
```

### Data Model

```typescript
interface DriverLeave {
  leave_id: string;
  driver_id: string;
  
  leave_type: 'SICK' | 'ANNUAL' | 'EMERGENCY' | 'UNPAID';
  leave_start_date: Date;
  leave_end_date: Date;
  
  total_leave_days: number;
  reason?: string;
  supporting_document_url?: string; // Medical certificate, etc.
  
  approved_by: string;
  approved_at: Date;
  
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
}
```

---

## Driver Performance Tracking (Phase 3)

### Purpose

Monitor driver efficiency, safety, and service quality to enable coaching, incentives, and operational improvements.

### Performance Metrics

```typescript
interface DriverPerformance {
  driver_id: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  
  // Trip Performance
  total_trips: number;
  completed_trips: number;
  cancelled_trips: number;
  average_trip_duration_hours: number;
  
  // Delivery Performance
  on_time_deliveries: number;
  delayed_deliveries: number;
  on_time_rate_percentage: number;
  average_delay_minutes: number;
  
  // Safety
  incidents_count: number;
  accident_count: number;
  safety_violations_count: number;
  
  // Efficiency
  idle_time_percentage: number;     // % of work time idle
  fuel_efficiency_kmpl: number;     // Average fuel consumption
  average_speed_kmph: number;
  
  // Quality
  qc_pass_trips: number;
  qc_fail_trips: number;
  customer_complaints: number;
  
  // Overall Rating
  performance_score: number;        // 0-100 composite score
  rating_stars: number;             // 1-5 stars
}
```

**Performance Dashboard:**
- **Top Performers:** Drivers with highest scores (incentive programs)
- **Training Needs:** Drivers with safety issues, delays
- **Utilization Leaders:** Highest trip counts, distance covered

---

## Integration Points

### Upstream: Vehicle Management
- Drivers assigned to vehicles (driver-vehicle pairing)
- Vehicle type validates driver license type

### Downstream: Trip Management
- Drivers assigned to trips
- Trip status updates driver availability
- GPS data updates driving hours

### Downstream: Helper Management
- Drivers paired with helpers for trips
- Helper assignment linked to driver

---

## Security & Compliance

### Data Access Control
- **Tenant Isolation:** All driver records filtered by `tenant_id`
- **Role-Based Access:**
  - Fleet Manager: All drivers (create, edit, leave management)
  - Transport Planner: View drivers, assign to trips (read + assign)
  - Driver Supervisor: View drivers, attendance, leave management
  - Driver: View own profile, mark availability (read-only + self-service)

### Audit Requirements
- Driver registration
- License updates/renewals
- Assignment changes
- Leave entries
- Status changes
- Performance reviews

---

## Key Design Decisions

### Why Track Both Manual and GPS Attendance?
**Rationale:**
- GPS not always available (device issues, coverage gaps)
- Manual entry provides backup
- GPS more accurate for driving hours (excludes idle time)

### Why Prevent Double-Booking?
**Rationale:**
- Safety (driver cannot operate two vehicles simultaneously)
- Compliance (work hour limits enforced)
- Data integrity (trip assignment clarity)

### Why Automatic State Transitions?
**Rationale:**
- Reduces manual overhead (no supervisor intervention)
- Real-time accuracy (driver status always current)
- Prevents human error (forgot to update status)

---

## Related User Stories
- US-087: Driver Registration
- US-088: Driver-Vehicle Assignment
- US-089: Driver State Tracking
- US-090: Driver Attendance
- US-091: Driver Leave Management
- US-092: Driver Performance Tracking

---

## Summary

Driver Management provides:
- **Driver Master Data:** Complete credentials, license, experience, compliance
- **Assignment Management:** Driver-vehicle pairing with validation
- **State Tracking:** Real-time availability (Available, Assigned, On Trip, On Leave)
- **Work Hour Monitoring:** Attendance tracking, compliance enforcement
- **Leave Management:** Structured leave workflows with status updates
- **Performance Tracking:** Metrics for coaching, incentives, safety
- **Audit Trail:** Complete history of assignments, status changes

Driver Management ensures safe, compliant, and efficient driver operations across the transport network.
