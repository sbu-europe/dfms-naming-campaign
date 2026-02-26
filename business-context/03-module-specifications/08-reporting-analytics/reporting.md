---
source_document: PRD_DFMS_v1.0.md
source_sections: Reporting & Analytics, Transport & Trip Reports
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [trip-management, gate-management, scaling-management, analytics]
---

# Reporting System (Phase 3)

## Overview

The Reporting System provides **pre-built operational reports** for transport managers, operations teams, and senior leadership to monitor daily transport execution, analyze trip performance, track delays, measure turnaround efficiency, and ensure SLA compliance.

Reports are generated from transactional data captured across trip management, gate tracking, scaling, QC workflows, and vendor operations—offering comprehensive visibility into the end-to-end transport lifecycle.

**Note:** This is a **Phase 3** feature, building upon mature operational data from Phases 1-2.

### Purpose

- **Trip Summary Reports:** Comprehensive trip list with status, route, product, vehicle, driver
- **Trip Delay Reports:** Identify trips exceeding expected timelines for proactive intervention
- **Trip Turnaround Reports:** Detailed breakdown of time spent at each milestone (gate-in, loading, scale-out, gate-out)
- **Vendor Performance Reports:** Evaluate vendor delivery quality, on-time rates, bid participation
- **Fleet Utilization Reports:** Monitor vehicle usage, idle time, maintenance status
- **QC Performance Reports:** Track QC pass rates, inspection times, quality trends
- **Filterable Views:** Drill down by date, POI, vehicle, driver, product, status
- **Export Capability:** CSV/Excel/PDF exports for offline analysis

---

## Core Report Types

### 1. Trip Summary Report

**Purpose:** Provide comprehensive visibility into all trips within a selected period, enabling operations teams to monitor execution status.

#### Report Columns

```typescript
interface TripSummaryReport {
  trip_id: string;
  to_number: string;
  
  // Status
  trip_status: 'ASSIGNED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  trip_result?: 'SUCCESS' | 'FAILED' | 'PARTIAL_DELIVERY';
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  route_distance_km: number;
  
  // Vehicle & Driver
  vehicle_registration: string;
  vehicle_type: string;
  driver_name: string;
  
  // Product
  product_name: string;
  product_category: 'FINISHED_GOODS' | 'RAW_MATERIAL';
  planned_quantity: number;
  delivered_quantity: number;
  unit: string;
  
  // Dates & Duration
  trip_assigned_date: Date;
  trip_dispatched_date: Date;
  trip_completed_date: Date;
  total_trip_duration_hours: number;
  
  // Performance Indicators
  on_time: boolean;
  delay_hours?: number;
  qc_result?: 'PASS' | 'FAIL';
}
```

#### Filters

- **Date Range:** Start Date - End Date (default: Last 7 Days)
- **POI:** Pickup POI, Drop POI, or Both (multi-select)
- **Status:** All, Completed, In Progress, Cancelled
- **Vehicle Type:** Light, Medium, Heavy, All
- **Driver:** Multi-select driver dropdown
- **Product:** Multi-select product dropdown
- **On-Time Only:** Checkbox to show only trips delivered on time

#### Sorting

- **Default:** Trip Completed Date (descending, most recent first)
- **Options:** 
  - Trip ID
  - Vehicle Registration
  - Trip Duration (ascending/descending)
  - Delay Hours (descending, longest delays first)

#### Export Formats

- **CSV:** For data analysis in Excel/Google Sheets
- **Excel:** Pre-formatted spreadsheet with filters
- **PDF:** Printable report with company logo and date range

---

### 2. Trip Delay Report

**Purpose:** Identify trips exceeding expected timelines (SLA breaches) for proactive escalation and root cause analysis.

#### Delay Calculation Logic

```typescript
interface TripDelayCalculation {
  trip_id: string;
  
  // Planned vs Actual
  planned_pickup_time: Date;
  actual_pickup_time: Date;
  planned_drop_time: Date;
  actual_drop_time: Date;
  
  // Delay Metrics
  pickup_delay_hours: number;       // Actual - Planned (pickup)
  drop_delay_hours: number;         // Actual - Planned (drop)
  total_delay_hours: number;        // Max(pickup_delay, drop_delay)
  
  // SLA Status
  sla_threshold_hours: number;      // Configured SLA (e.g., 4 hours)
  sla_breached: boolean;            // delay > threshold
  
  // Delay Reason
  delay_reason?: 'TRAFFIC' | 'VEHICLE_BREAKDOWN' | 'DRIVER_ISSUE' | 'POI_CONGESTION' | 'QC_FAILURE' | 'OTHER';
  delay_notes?: string;
}
```

**Delay Categorization:**
- **Minor Delay:** 1-2 hours late
- **Moderate Delay:** 2-4 hours late
- **Critical Delay:** >4 hours late (SLA breach)

#### Report Columns

```typescript
interface TripDelayReport {
  trip_id: string;
  to_number: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  
  // Planned Timeline
  planned_pickup_time: Date;
  planned_drop_time: Date;
  
  // Actual Timeline
  actual_pickup_time: Date;
  actual_drop_time: Date;
  
  // Delay Metrics
  delay_hours: number;
  delay_category: 'MINOR' | 'MODERATE' | 'CRITICAL';
  sla_breached: boolean;
  
  // Root Cause
  delay_reason: string;
  
  // Responsible Party
  vehicle_registration: string;
  driver_name: string;
  vendor_name?: string;             // If vendor vehicle
}
```

#### Filters

- **Delay Category:** All, Minor, Moderate, Critical
- **SLA Breached Only:** Checkbox
- **Delay Reason:** Multi-select (Traffic, Breakdown, etc.)
- **Date Range:** Last 7 Days, Last 30 Days, Custom

#### Use Cases

- **Daily Operations Review:** Morning meeting to discuss previous day's delays
- **Root Cause Analysis:** Identify recurring delay patterns (e.g., specific route, POI congestion)
- **Vendor Performance:** Flag vendors with frequent delays

---

### 3. Trip Turnaround Time Report

**Purpose:** Analyze time spent at each trip milestone (gate-in, loading, scale-out, gate-out) to identify bottlenecks and optimize POI operations.

#### Turnaround Time Breakdown

```typescript
interface TripTurnaroundReport {
  trip_id: string;
  to_number: string;
  vehicle_registration: string;
  poi_name: string;                 // Pickup or Drop POI
  
  // Milestone Timestamps
  gate_in_time: Date;
  scale_in_time?: Date;             // Optional (not all POIs have scales)
  loading_start_time: Date;
  loading_end_time: Date;
  qc_start_time?: Date;             // Optional (only if QC required)
  qc_end_time?: Date;
  scale_out_time?: Date;
  gate_out_time: Date;
  
  // Duration Metrics (in minutes)
  gate_to_scale_in_duration: number;
  scale_in_to_loading_duration: number;
  loading_duration: number;
  loading_to_qc_duration?: number;
  qc_duration?: number;
  qc_to_scale_out_duration?: number;
  scale_out_to_gate_out_duration: number;
  total_turnaround_time: number;    // Gate-in to Gate-out
  
  // Dwell Time Analysis
  idle_time: number;                // Time vehicle stationary but not actively loading/QC
  
  // Benchmarks
  expected_turnaround_time: number; // Configured benchmark for this POI/product
  turnaround_variance: number;      // Actual - Expected (positive = slower than expected)
}
```

#### Turnaround Time Calculation Rules

**Important:** Only use **actual event timestamps**. Do not estimate or interpolate missing data.

```typescript
function calculateTurnaroundTime(trip: Trip): number {
  if (!trip.gate_in_time || !trip.gate_out_time) {
    throw new Error('Cannot calculate turnaround time: missing gate timestamps');
  }
  
  const turnaround_ms = trip.gate_out_time.getTime() - trip.gate_in_time.getTime();
  const turnaround_minutes = turnaround_ms / (1000 * 60);
  
  return turnaround_minutes;
}
```

#### Report Visualizations

**Table View:**
- List of trips with all milestone timestamps and durations
- Sortable by total turnaround time (descending, slowest first)

**Chart View:**
- **Stacked Bar Chart:** Breakdown of turnaround time by activity (gate, loading, QC, scale)
- **Trend Line:** Average turnaround time over date range

#### Filters

- **POI:** Select specific POI (pickup or drop)
- **Date Range:** Last 7 Days, Last 30 Days, Custom
- **Product:** Filter by product category
- **Turnaround Threshold:** Show only trips exceeding X minutes

#### Use Cases

- **Bottleneck Identification:** If QC duration consistently high, allocate more QC staff
- **POI Capacity Planning:** If gate-in to loading duration long, indicates congestion
- **Benchmark Validation:** Refine expected turnaround times based on actual data

---

### 4. Vendor Performance Report

**Purpose:** Evaluate vendor delivery quality, on-time performance, and bid participation to inform vendor selection and contract renewals.

#### Vendor Performance Metrics

```typescript
interface VendorPerformanceReport {
  vendor_id: string;
  vendor_name: string;
  vendor_type: 'CONTRACTUAL' | 'NON_CONTRACTUAL';
  
  // Trip Volume
  total_trips_assigned: number;
  total_trips_completed: number;
  trip_completion_rate: number;     // % completed / assigned
  
  // Delivery Performance
  on_time_deliveries: number;
  delayed_deliveries: number;
  on_time_delivery_rate: number;    // % on-time / completed
  average_delay_hours: number;      // For delayed trips
  
  // Quality Performance
  qc_pass_trips: number;
  qc_fail_trips: number;
  qc_pass_rate: number;             // % pass / (pass + fail)
  
  // Bidding Performance (Non-Contractual Only)
  total_bids_submitted: number;
  total_bids_won: number;
  bid_win_rate: number;             // % won / submitted
  average_bid_amount: number;
  
  // Financial
  total_revenue_earned: number;     // Sum of winning bids
  
  // Incidents
  total_incidents: number;          // Accidents, breakdowns, disputes
}
```

#### Report Columns

```typescript
interface VendorPerformanceRow {
  vendor_name: string;
  trips_completed: number;
  on_time_rate: number;             // % (e.g., 87.5%)
  qc_pass_rate: number;             // % (e.g., 95.2%)
  avg_delay_hours: number;
  incidents_count: number;
  total_revenue: number;
  performance_rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}
```

**Performance Rating Logic:**
```typescript
function calculateVendorRating(vendor: VendorPerformanceReport): string {
  if (vendor.on_time_rate >= 90 && vendor.qc_pass_rate >= 95) return 'EXCELLENT';
  if (vendor.on_time_rate >= 80 && vendor.qc_pass_rate >= 85) return 'GOOD';
  if (vendor.on_time_rate >= 70 && vendor.qc_pass_rate >= 75) return 'AVERAGE';
  return 'POOR';
}
```

#### Filters

- **Vendor Type:** All, Contractual, Non-Contractual
- **Date Range:** Last 30 Days, Last 90 Days, Last Year
- **Performance Rating:** All, Excellent, Good, Average, Poor
- **Minimum Trips:** Show only vendors with >= X trips (e.g., 10) for statistical relevance

#### Use Cases

- **Vendor Contract Renewals:** Evaluate vendor performance before renewal decision
- **Bid Award Decisions:** Prioritize vendors with excellent performance history
- **Dispute Management:** Reference on-time rates and QC pass rates during disputes

---

### 5. Fleet Utilization Report

**Purpose:** Monitor vehicle usage, identify underutilized assets, and optimize fleet allocation.

#### Fleet Utilization Metrics

```typescript
interface FleetUtilizationReport {
  // Vehicle Summary
  total_vehicles: number;
  active_vehicles: number;          // Currently in trips
  idle_vehicles: number;            // Active but no trips assigned
  under_maintenance_vehicles: number;
  inactive_vehicles: number;        // Decommissioned/sold
  
  // Per-Vehicle Metrics
  vehicles: VehicleUtilizationRow[];
}

interface VehicleUtilizationRow {
  vehicle_id: string;
  vehicle_registration: string;
  vehicle_type: string;
  vehicle_status: 'ACTIVE' | 'IDLE' | 'UNDER_MAINTENANCE' | 'INACTIVE';
  
  // Utilization Metrics
  total_trips: number;
  total_distance_km: number;
  total_operational_hours: number;
  
  // Utilization Rate
  utilization_rate: number;         // % of available time spent on trips
  idle_time_hours: number;
  
  // Maintenance
  last_maintenance_date?: Date;
  days_since_maintenance: number;
  
  // Cost Efficiency
  cost_per_km?: number;             // If fuel data available (Phase 2)
}
```

#### Utilization Rate Calculation

```typescript
function calculateUtilizationRate(vehicle: Vehicle, period_days: number): number {
  const total_available_hours = period_days * 24;
  const operational_hours = vehicle.total_operational_hours;
  const maintenance_hours = vehicle.maintenance_downtime_hours;
  
  const net_available_hours = total_available_hours - maintenance_hours;
  const utilization_rate = (operational_hours / net_available_hours) * 100;
  
  return utilization_rate;
}
```

**Utilization Benchmarks:**
- **High Utilization:** >75% (optimal, asset well-used)
- **Moderate Utilization:** 50-75% (acceptable)
- **Low Utilization:** <50% (underutilized, consider redeployment or disposal)

#### Filters

- **Vehicle Type:** All, Light, Medium, Heavy
- **Vehicle Status:** All, Active, Idle, Under Maintenance
- **Utilization Rate:** High, Moderate, Low, All
- **Date Range:** Last 30 Days, Last 90 Days, Custom

#### Use Cases

- **Fleet Optimization:** Identify underutilized vehicles for reassignment or sale
- **Capacity Planning:** Determine if new vehicle purchases needed (all vehicles >80% utilized)
- **Maintenance Scheduling:** Flag vehicles idle due to delayed maintenance

---

## Report Generation & Distribution

### Report Scheduling

**Scheduled Report Delivery (Phase 3):**
- **Daily:** Trip Summary Report (emailed at 6 AM to Transport Manager)
- **Weekly:** Vendor Performance Report (emailed every Monday to Procurement Manager)
- **Monthly:** Fleet Utilization Report (emailed 1st of month to Fleet Manager)

### Report Access Control (RBAC)

**Role-Based Report Access:**
- **Transport Manager:** All reports
- **Distribution Manager:** Trip Summary, Trip Delay, Trip Turnaround
- **Procurement Manager:** Vendor Performance
- **Fleet Manager:** Fleet Utilization, Vehicle Performance
- **QC Manager:** QC Performance Reports
- **Operations Executive:** Limited (own POI trips only)

---

## Key Design Decisions

### Why Phase 3?
**Rationale:**
- Reports require mature operational data (6-12 months of trips)
- Phase 1-2 focus on data capture; Phase 3 on analysis
- Allows refinement of report definitions based on initial operations

### Why Pre-Built Reports (Not Ad-Hoc Query Tool)?
**Rationale:**
- Pre-built reports optimized for specific use cases (faster performance)
- Reduces user training (no SQL/BI tool knowledge required)
- Ensures consistent KPI definitions across organization

### Why Turnaround Time Uses Only Actual Timestamps?
**Rationale:**
- Prevents data integrity issues (no guessing missing milestones)
- Forces operational rigor (must capture all timestamps)
- Accurate bottleneck analysis (only real data)

---

## Related User Stories (Phase 3)
- US-098: Trip Summary Report
- US-099: Trip Delay Report
- US-100: Trip Turnaround Time Report
- US-101: Vendor Performance Report
- US-102: Fleet Utilization Report

---

## Summary

The Reporting System (Phase 3) provides:
- **Trip Summary Reports:** Comprehensive trip visibility with filters and exports
- **Trip Delay Reports:** SLA breach identification for proactive intervention
- **Trip Turnaround Reports:** Milestone-based time analysis for bottleneck detection
- **Vendor Performance Reports:** On-time rates, QC pass rates, bid participation
- **Fleet Utilization Reports:** Vehicle usage, idle time, maintenance tracking
- **Role-Based Access:** Report access aligned with organizational responsibilities
- **Export Capability:** CSV/Excel/PDF for offline analysis

The reporting system enables data-driven decision-making for transport optimization, vendor management, and fleet planning.
