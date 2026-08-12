---
source_document: PRD_DFMS_v1.0.md
source_sections: Integration Requirements
extracted_date: 2026-02-13
last_updated: 2026-07-24
document_type: domain_specification
related_modules: [trip-management, gate-management, vendor-portal, 09-tracking]
---

# Integration Requirements

## Overview

Integration Requirements define the **external system integrations** that enable DFMS to connect with GPS/VTS providers, mapping services, ERP systems, payment gateways, and other third-party platforms for seamless data exchange and extended functionality.

### Purpose

- **GPS/VTS Integration:** Real-time vehicle location tracking
- **Map & Routing APIs:** Geocoding, navigation, ETA calculation
- **ERP Integration:** Sync master data, financial transactions
- **Payment Gateway Integration:** Vendor payments, driver incentives
- **SMS/Email Gateway:** Notifications, alerts, OTP delivery

---

## GPS/VTS Integration

> **As-built product SSOT:** [`../09-tracking/README.md`](../09-tracking/README.md) · [`../09-tracking/providers/README.md`](../09-tracking/providers/README.md)  
> **Engineering pipeline:** [`../../../apps/tracking/GT06_IMPLEMENTATION.md`](../../../apps/tracking/GT06_IMPLEMENTATION.md)  
> Phase 1 runtime = **GT06 TCP ingest** → Redis → Django. GPSWOX REST poller remains deferred (contract: `gps-vts-integration.yaml`).

### Purpose
Enable real-time vehicle tracking, geofencing, and historical route playback for trip monitoring.

### Integration Requirements

**Data Pull Frequency (product intent vs as-built):**
- **Product / PRD:** Location updates every ~30 seconds (configurable 30/60/120 TBD for UI refresh)
- **As-built:** Device packets ~10s into Redis; Live GPS UI poll **10s**; Celery sync check **30s**; Postgres trail gated (default 300s)

**Supported GPS Providers:**

| Provider | Status |
|----------|--------|
| **GT06 / Concox (direct TCP ingest)** | **Implemented** — `services/gt06-ingest/` |
| GPSWOX REST | Contracted / deferred adapter |
| Legacy Bangladesh market list (Track & Trace BD, etc.) | **Historical** — superseded by GT06 / GPSWOX decision path |

**Integration Method (as-built GT06):**

```text
GT06 device ──TCP :5023──► gt06-ingest ──► Redis (latest + history)
                                              │
                         Celery sync (30s) ───┴──► Postgres gps_tracking
                                              │
                         GET /api/v1/tracking/live-map/ ──► Live GPS UI
```

**Identity:** `Vehicle.gps_tracker_id` = device IMEI.

**Geofencing:** Evaluated in Django (`GeofenceService`) against TO origin/destination POIs — see [`GPS-03`](../../03-backlog/sprints/sprint-6/02-gps-maps-dashboard/GPS-03-vehicle-arrival-departure.md).

**Historical GPSWOX-oriented sketch (deferred):**
```typescript
interface GPSIntegration {
  // REST API pull
  endpoint: string;                 // e.g., https://gps-provider.com/api/v1/location
  auth_method: 'API_KEY' | 'OAUTH2';
  api_key?: string;
  
  // Webhook push (preferred)
  webhook_url: string;              // DFMS receives real-time updates
  
  // Data mapping
  field_mapping: {
    vehicle_id: string;             // GPS provider's vehicle identifier
    latitude: string;
    longitude: string;
    speed: string;
    timestamp: string;
  };
}}
```

**Geofence Sync:**
- DFMS sends POI geofence definitions to GPS devices
- GPS device triggers alert when vehicle enters/exits geofence

---

## Map & Routing APIs

### Purpose
Provide geocoding, route optimization, ETA calculation, and map visualization.

### Supported Providers

**Google Maps API:**
- Geocoding (address → lat/lng)
- Directions API (route calculation)
- Distance Matrix API (ETA calculation)

**OpenStreetMap (OSM):**
- Free alternative for cost optimization
- Suitable for Bangladesh road network

### Integration Features

**Route Optimization:**
```typescript
interface RouteOptimization {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  waypoints?: { lat: number; lng: number }[];
  
  optimization_factors: {
    distance: boolean;
    traffic: boolean;
    tolls: boolean;
  };
  
  // Response
  optimized_route: {
    distance_km: number;
    duration_minutes: number;
    polyline: string;               // Encoded route for map display
  };
}
```

**ETA Calculation:**
- Dynamic ETA updates based on real-time traffic
- Recalculate ETA every 5 minutes during trip

---

## ERP System Integration

### Purpose
Sync master data (products, POIs, cost centers) and financial transactions (trip costs, vendor invoices) between DFMS and enterprise ERP systems.

### Supported ERP Systems

**Pre-Built Connectors:**
- SAP Business One, SAP S/4HANA
- Oracle ERP Cloud, Oracle NetSuite
- Microsoft Dynamics 365

### Integration Methods

**1. REST API Integration:**
```typescript
interface ERPIntegration {
  sync_direction: 'BIDIRECTIONAL' | 'ERP_TO_DFMS' | 'DFMS_TO_ERP';
  
  // Master data sync (ERP → DFMS)
  sync_entities: ['products', 'cost_centers', 'vendors'];
  sync_frequency: 'DAILY' | 'HOURLY' | 'REAL_TIME';
  
  // Transaction sync (DFMS → ERP)
  export_entities: ['trip_costs', 'vendor_invoices'];
}
```

**2. File-Based Integration:**
- CSV/XML file exchange via SFTP
- Daily batch export/import

---

## Payment Gateway Integration

### Purpose
Enable digital payments for vendor settlements and driver incentives.

### Supported Gateways (Bangladesh)

- **bKash:** Mobile financial service
- **Nagad:** Digital wallet
- **Rocket:** Mobile banking

### Integration Flow

```
1. DFMS generates payment request (vendor invoice, driver incentive)
2. Payment request sent to gateway API
3. Gateway processes payment
4. Gateway sends webhook notification (success/failure)
5. DFMS updates payment status
```

---

## SMS/Email Gateway

### Purpose
Send notifications, alerts, and OTP codes to users.

### Providers

**SMS:** MiM SMS (Bangladesh) — `apps/notifications/sms.py`
**Email:** SendGrid, AWS SES

### Use Cases

- OTP delivery for login
- Trip assignment notifications to drivers
- Bid alerts to vendors
- Delay alerts to managers

---

## Summary

Integration Requirements provide:
- **GPS/VTS:** Real-time tracking, geofencing, historical playback
- **Maps & Routing:** Geocoding, route optimization, ETA calculation
- **ERP:** Master data sync, financial transaction export
- **Payment Gateway:** Digital payments for vendors/drivers
- **SMS/Email:** Notifications, alerts, OTP delivery
