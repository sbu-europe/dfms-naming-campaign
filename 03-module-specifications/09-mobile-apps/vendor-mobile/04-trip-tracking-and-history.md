---
last_updated: 2026-05-05
---

# Vendor Mobile Application — Trip Tracking and Trip History

## Active Trip Tracking

**Purpose:** Enable vendors to monitor their drivers' trip progress in real-time, ensuring visibility into operational execution.

### Trip Tracking View

```typescript
interface ActiveTrip {
  trip_id: string;
  to_number: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  
  // Status
  trip_status: 'ASSIGNED' | 'DISPATCHED' | 'IN_TRANSIT' | 'ARRIVED_AT_PICKUP' | 'LOADING' | 'IN_TRANSIT_TO_DROP' | 'ARRIVED_AT_DROP' | 'UNLOADING' | 'COMPLETED';
  
  // Driver & Vehicle
  driver_name: string;
  driver_phone: string;
  vehicle_registration: string;
  
  // Real-Time Location
  current_location?: { lat: number; lng: number };
  distance_from_pickup_km?: number;
  distance_from_drop_km?: number;
  estimated_arrival_time?: Date;
  
  // Timestamps
  dispatched_at?: Date;
  pickup_completed_at?: Date;
  drop_completed_at?: Date;
}
```

**UI Components:**
- **Map View:** Shows driver's current location (GPS pin) with route polyline
- **Trip Card:** Status, driver, vehicle, ETA
- **Call Driver Button:** One-tap phone call to assigned driver
- **Status Timeline:** Visual timeline showing completed and pending milestones

**Real-Time Updates:**
- Trip status updated via push notifications or polling (every 30 seconds)
- GPS location refreshed every 1 minute

---

## Completed Trip History

**Purpose:** Provide vendors with access to historical trip data for invoicing, performance analysis, and record-keeping.

### Trip History View

```typescript
interface CompletedTrip {
  trip_id: string;
  to_number: string;
  
  // Route
  pickup_poi: string;
  drop_poi: string;
  
  // Product
  product_name: string;
  quantity_delivered: number;
  unit: string;
  
  // Driver & Vehicle
  driver_name: string;
  vehicle_registration: string;
  
  // Financial
  bid_amount: number;
  payment_status: 'PENDING' | 'INVOICED' | 'PAID';
  
  // Performance
  trip_duration_hours: number;
  on_time_delivery: boolean;
  qc_result?: 'PASS' | 'FAIL';
  
  // Dates
  dispatched_at: Date;
  completed_at: Date;
}
```

**UI Components:**
- **List View:** All completed trips sorted by completion date (recent first)
- **Filter:**
  - By Date Range (Last 7 Days, Last 30 Days, Custom)
  - By Payment Status (All, Pending Payment, Paid)
- **Trip Card:** Tap to view full trip details and POD
- **Download POD:** Button to download proof of delivery PDF

**Use Cases:**
- **Invoicing:** Vendor exports completed trips to create invoices
- **Performance Review:** Analyze on-time delivery rate, QC pass rate
- **Dispute Resolution:** Access POD and trip details for claims

