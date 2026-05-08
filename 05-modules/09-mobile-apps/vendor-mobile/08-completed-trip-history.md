---
last_updated: 2026-05-06
---

# Vendor Mobile — Trips: Completed Trip History

## Completed trip history

**Purpose:** Provide vendors with access to historical trip data for invoicing, performance analysis, and record-keeping.

### Trip history view (example data model)

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

  // Driver & Vehicle (submitted post-award)
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

### UI components

- **List View:** Completed trips sorted by completion date (recent first)
- **Filters:**
  - By Date Range (Last 7 Days, Last 30 Days, Custom)
  - By Payment Status (All, Pending Payment, Paid)
- **Trip Card:** Tap for full trip details and POD
- **Download POD:** Download proof of delivery PDF

### Use cases

- **Invoicing:** Export completed trips to create invoices
- **Performance review:** Analyze on-time delivery rate, QC pass rate
- **Dispute resolution:** Access POD and trip details for claims

