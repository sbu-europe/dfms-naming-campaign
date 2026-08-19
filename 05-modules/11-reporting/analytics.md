---
source_document: DFMS_Product_Requirements_Document_v3.md
source_sections: Analytics Dashboards, KPI Monitoring
extracted_date: 2026-02-13
last_updated: 2026-02-26
document_type: domain_specification
related_modules: [reporting, command-center, trip-management]
---

# Analytics & Dashboards (Phase 3)

## Overview

The Analytics & Dashboards module provides **real-time and historical analytics visualizations** for executives, managers, and operational teams to monitor key performance indicators (KPIs), identify trends, and make data-driven decisions for transport optimization.

Unlike static reports, analytics dashboards offer **interactive visualizations** (charts, graphs, heatmaps) with drill-down capability, enabling users to explore data dynamically and uncover actionable insights.

**Note:** This is a **Phase 3** feature, building upon mature operational data and reporting infrastructure from Phases 1-2.

### Purpose

- **Executive Dashboard:** High-level KPIs for C-level and senior leadership (trip volume, on-time %, cost trends)
- **Operations Dashboard:** Real-time operational metrics for Transport/Distribution Managers (active trips, delays, POI congestion)
- **Vendor Analytics:** Vendor performance trends, bid competitiveness, cost analysis
- **Fleet Analytics:** Vehicle utilization trends, maintenance forecasts, fuel efficiency (Phase 2+)
- **QC Analytics:** Quality trends, defect rates, inspection throughput
- **Predictive Analytics:** (Phase 4) ML-based ETA predictions, demand forecasting, route optimization

---

## Core Dashboards

### 1. Executive Dashboard

**Purpose:** Provide C-level executives (CEO, COO, CFO) with high-level visibility into transport operations performance and strategic KPIs.

#### Key Metrics (KPI Cards)

```typescript
interface ExecutiveDashboardKPIs {
  // Trip Volume
  total_trips_this_month: number;
  total_trips_last_month: number;
  trips_growth_percentage: number;  // % change month-over-month
  
  // Delivery Performance
  on_time_delivery_rate: number;    // % trips delivered on-time (this month)
  on_time_delivery_trend: 'UP' | 'DOWN' | 'STABLE'; // Compared to last month
  
  // Cost Efficiency
  average_cost_per_trip: number;    // BDT (if cost data available)
  cost_per_km: number;              // BDT/km
  cost_trend: 'UP' | 'DOWN' | 'STABLE';
  
  // Fleet Utilization
  fleet_utilization_rate: number;   // % (active vehicles / total vehicles)
  utilization_trend: 'UP' | 'DOWN' | 'STABLE';
  
  // Quality Assurance
  qc_pass_rate: number;             // % trips passed QC
  qc_pass_trend: 'UP' | 'DOWN' | 'STABLE';
}
```

#### Visualizations

**1. Trip Volume Trend (Line Chart)**
- **X-Axis:** Date (last 12 months)
- **Y-Axis:** Number of trips
- **Purpose:** Identify seasonal trends, growth patterns

**2. On-Time Delivery Rate (Gauge Chart)**
- **Value:** 85% (this month)
- **Target:** 90% (configurable benchmark)
- **Color Coding:** 
  - Green (>90%): Excellent
  - Yellow (80-90%): Needs Attention
  - Red (<80%): Critical

**3. Cost Per Trip (Bar Chart)**
- **X-Axis:** Month
- **Y-Axis:** Average cost (BDT)
- **Purpose:** Monitor cost trends, validate efficiency initiatives

**4. Fleet Utilization (Donut Chart)**
- **Segments:**
  - Active (on trips): 60%
  - Idle (available): 25%
  - Under Maintenance: 10%
  - Inactive: 5%
- **Purpose:** Identify underutilized assets

#### Filters

- **Date Range:** This Month, Last 3 Months, Last 12 Months, Custom
- **POI:** All, Select POI (multi-select)
- **Vehicle Type:** All, Own Fleet, Vendor Fleet

---

### 2. Operations Dashboard

**Purpose:** Provide Transport and Distribution Managers with real-time operational visibility for day-to-day execution monitoring and intervention.

#### Real-Time Metrics

```typescript
interface OperationsDashboardMetrics {
  // Current Status
  active_trips_count: number;       // Trips in progress right now
  pending_gate_in_count: number;    // Vehicles waiting at gate
  delayed_trips_count: number;      // Trips exceeding SLA
  
  // Today's Performance
  trips_completed_today: number;
  trips_on_time_today: number;
  on_time_rate_today: number;       // %
  
  // POI Congestion
  poi_congestion_map: POICongestion[];
  
  // Alerts
  critical_alerts: Alert[];         // Vehicle breakdowns, QC failures, accidents
}

interface POICongestion {
  poi_name: string;
  vehicles_waiting: number;
  average_wait_time_minutes: number;
  congestion_level: 'LOW' | 'MODERATE' | 'HIGH';
}
```

#### Visualizations

**1. Active Trips Map (Geographic Map)**
- **Map:** Real-time GPS locations of all active trips (pins on map)
- **Color Coding:**
  - Green: On-time
  - Yellow: Slightly delayed (1-2 hours)
  - Red: Critical delay (>2 hours)
- **Hover:** Shows trip details (vehicle, driver, route, ETA)
- **Click:** Drills down to trip detail page

**2. Delayed Trips Table (Data Table)**
- **Columns:** Trip ID, Vehicle, Route, Delay Hours, Current Location, Action
- **Sortable:** By delay hours (descending, most delayed first)
- **Action Button:** "Contact Driver" (one-tap call)

**3. POI Congestion Heatmap (Bar Chart)**
- **X-Axis:** POI Name
- **Y-Axis:** Vehicles Waiting
- **Color:** Red (high congestion), Yellow (moderate), Green (low)
- **Purpose:** Dispatch optimization (avoid congested POIs)

**4. Hourly Trip Completion (Line Chart)**
- **X-Axis:** Hour of Day (0-23)
- **Y-Axis:** Trips Completed
- **Purpose:** Identify peak hours, staff scheduling

#### Alerts (Notification Panel)

**Critical Alerts:**
- "Vehicle BDX-1234 breakdown on Route A → B. ETA delayed 3 hours."
- "QC Failure at Depot X. Trip 2026-00456 held for recheck."
- "Gate congestion at POI Y. 12 vehicles waiting."

**Alert Actions:**
- Dismiss
- View Details
- Assign to User (escalate)

---

### 3. Vendor Analytics Dashboard

**Purpose:** Analyze vendor performance trends, bid competitiveness, and cost effectiveness to inform vendor strategy.

#### Key Metrics

```typescript
interface VendorAnalyticsDashboard {
  // Performance Trends
  vendor_performance_trend: VendorPerformanceTrendLine[];
  
  // Bid Analysis
  average_bid_amount_by_vendor: VendorBidComparison[];
  bid_win_rates: VendorBidWinRate[];
  
  // Cost Analysis
  cost_per_km_by_vendor: VendorCostComparison[];
  
  // Quality Metrics
  qc_pass_rates_by_vendor: VendorQCPassRate[];
}

interface VendorPerformanceTrendLine {
  vendor_name: string;
  date: Date;
  on_time_rate: number;             // % for that period
}
```

#### Visualizations

**1. Vendor Performance Comparison (Multi-Line Chart)**
- **X-Axis:** Month
- **Y-Axis:** On-Time Delivery Rate (%)
- **Lines:** One line per vendor (top 10 vendors by volume)
- **Purpose:** Identify consistently high-performing vendors

**2. Bid Competitiveness (Scatter Plot)**
- **X-Axis:** Average Bid Amount (BDT)
- **Y-Axis:** Bid Win Rate (%)
- **Points:** Each vendor
- **Purpose:** Identify vendors with optimal pricing (high win rate, reasonable cost)

**3. Cost Per Km by Vendor (Bar Chart)**
- **X-Axis:** Vendor Name
- **Y-Axis:** Cost Per Km (BDT)
- **Sorted:** Ascending (cheapest first)
- **Purpose:** Identify cost-effective vendors

**4. QC Pass Rate by Vendor (Horizontal Bar Chart)**
- **X-Axis:** QC Pass Rate (%)
- **Y-Axis:** Vendor Name
- **Color:** Green (>95%), Yellow (85-95%), Red (<85%)
- **Purpose:** Identify quality issues by vendor

#### Filters

- **Vendor Type:** All, Contractual, Non-Contractual
- **Date Range:** Last 3 Months, Last 6 Months, Last Year
- **Minimum Trips:** Show only vendors with >= X trips (e.g., 20)

---

### 4. Fleet Analytics Dashboard

**Purpose:** Monitor vehicle utilization trends, maintenance forecasts, and fuel efficiency (Phase 2+) for fleet optimization.

#### Key Metrics

```typescript
interface FleetAnalyticsDashboard {
  // Utilization Trends
  utilization_rate_trend: UtilizationTrendLine[];
  
  // Maintenance Forecasts
  vehicles_due_for_maintenance: Vehicle[];
  average_maintenance_downtime_days: number;
  
  // Fuel Efficiency (Phase 2)
  average_fuel_efficiency_kmpl: number;
  fuel_efficiency_by_vehicle: VehicleFuelEfficiency[];
  
  // Trip Distribution
  trips_per_vehicle: VehicleTripDistribution[];
}
```

#### Visualizations

**1. Fleet Utilization Trend (Line Chart)**
- **X-Axis:** Month
- **Y-Axis:** Utilization Rate (%)
- **Lines:** 
  - Overall Fleet Utilization
  - Target Utilization (75% benchmark)
- **Purpose:** Monitor if fleet is underutilized or overutilized

**2. Maintenance Forecast (Table + Alert)**
- **Columns:** Vehicle, Last Maintenance Date, Days Since Maintenance, Next Due Date
- **Sort:** By Next Due Date (ascending, most urgent first)
- **Alert:** Highlight vehicles overdue for maintenance (red)

**3. Trips Per Vehicle (Bar Chart)**
- **X-Axis:** Vehicle Registration
- **Y-Axis:** Number of Trips (this month)
- **Sorted:** Descending (most trips first)
- **Purpose:** Identify workhorses vs underutilized vehicles

**4. Fuel Efficiency Comparison (Phase 2) (Bar Chart)**
- **X-Axis:** Vehicle Registration
- **Y-Axis:** Fuel Efficiency (km/liter)
- **Benchmark Line:** Expected fuel efficiency for vehicle type
- **Purpose:** Identify vehicles with poor fuel economy (maintenance needed)

---

### 5. QC Analytics Dashboard

**Purpose:** Monitor quality assurance trends, defect rates, and inspection efficiency to ensure product quality standards.

#### Key Metrics

```typescript
interface QCAnalyticsDashboard {
  // Quality Trends
  qc_pass_rate_trend: QCPassRateTrendLine[];
  
  // Defect Analysis
  common_defects: DefectCategory[];
  
  // Inspection Efficiency
  average_qc_duration_minutes: number;
  qc_throughput_per_hour: number;   // Inspections completed per hour
  
  // Product-Specific QC
  qc_pass_rate_by_product: ProductQCPassRate[];
}

interface DefectCategory {
  defect_type: string;              // e.g., "Packaging Damage", "Moisture Excess"
  defect_count: number;
  percentage_of_total_defects: number;
}
```

#### Visualizations

**1. QC Pass Rate Trend (Line Chart)**
- **X-Axis:** Week
- **Y-Axis:** QC Pass Rate (%)
- **Target Line:** 95% (benchmark)
- **Purpose:** Identify quality degradation trends

**2. Common Defects (Pie Chart)**
- **Segments:** Defect categories (Packaging Damage 40%, Moisture Excess 25%, etc.)
- **Purpose:** Focus quality improvement efforts on most common issues

**3. QC Duration by Product (Box Plot)**
- **X-Axis:** Product Category
- **Y-Axis:** QC Duration (minutes)
- **Purpose:** Identify products requiring longer inspections (complex QC requirements)

**4. QC Pass Rate by Product (Horizontal Bar Chart)**
- **X-Axis:** QC Pass Rate (%)
- **Y-Axis:** Product Name
- **Color:** Green (>95%), Yellow (85-95%), Red (<85%)
- **Purpose:** Identify problematic products (low pass rates)

---

## Dashboard Access Control (RBAC)

**Role-Based Dashboard Access:**
- **CEO/COO:** Executive Dashboard (full access)
- **Transport Manager:** Operations Dashboard, Fleet Analytics, Vendor Analytics
- **Distribution Manager:** Operations Dashboard
- **Procurement Manager:** Vendor Analytics
- **Fleet Manager:** Fleet Analytics
- **QC Manager:** QC Analytics
- **Operations Executive:** Operations Dashboard (own POI only, limited metrics)

---

## Technical Implementation

### Data Refresh Frequency

**Real-Time Dashboards (WebSocket Updates):**
- **Operations Dashboard:** Refresh every 30 seconds (active trips, alerts)
- **Executive Dashboard:** Refresh every 5 minutes (KPI cards)

**Batch-Updated Dashboards:**
- **Vendor Analytics:** Refresh daily at midnight (historical trends)
- **Fleet Analytics:** Refresh daily at 1 AM

### Performance Optimization

**Caching Strategy:**
- **KPI Calculations:** Pre-calculated daily and stored in cache (Redis)
- **Historical Charts:** Generated once per day, served from cache
- **Real-Time Data:** Fetched directly from database (no caching)

**Data Aggregation:**
- Use pre-aggregated summary tables for fast dashboard loading
- Avoid on-the-fly aggregation of millions of trip records

---

## Key Design Decisions

### Why Dashboards Instead of Reports?
**Rationale:**
- **Interactivity:** Dashboards allow drill-down, filters, real-time updates (reports are static)
- **Visual Communication:** Charts and graphs easier to interpret than tables
- **Executive Preference:** C-level users prefer visual KPIs (at-a-glance insights)

### Why Separate Operations and Executive Dashboards?
**Rationale:**
- **Different Audiences:** Executives need strategic KPIs; Managers need operational details
- **Cognitive Load:** Single dashboard with all metrics is overwhelming
- **Customization:** Each role needs tailored views

### Why Pre-Calculated KPIs (Not Real-Time Aggregation)?
**Rationale:**
- **Performance:** Real-time aggregation of millions of rows is slow (5-10 seconds)
- **User Experience:** Dashboard must load in <2 seconds
- **Cost:** Pre-calculation reduces database load (cheaper)

---

## Related User Stories (Phase 3)
- US-103: Executive Dashboard
- US-104: Operations Dashboard
- US-105: Vendor Analytics Dashboard
- US-106: Fleet Analytics Dashboard
- US-107: QC Analytics Dashboard

---

## Summary

The Analytics & Dashboards module provides:
- **Executive Dashboard:** Strategic KPIs (trip volume, on-time %, cost trends) for C-level
- **Operations Dashboard:** Real-time operational metrics (active trips, delays, POI congestion)
- **Vendor Analytics:** Performance trends, bid competitiveness, cost analysis
- **Fleet Analytics:** Utilization trends, maintenance forecasts, fuel efficiency
- **QC Analytics:** Quality trends, defect analysis, inspection efficiency
- **Interactive Visualizations:** Charts, graphs, heatmaps with drill-down capability
- **Role-Based Access:** Customized dashboards per organizational role

The analytics module enables data-driven decision-making with visual, interactive insights for transport optimization.
