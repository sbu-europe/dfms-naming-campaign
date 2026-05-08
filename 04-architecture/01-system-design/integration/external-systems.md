# DFMS External Systems

> Detailed specifications for external system integrations

**Status**: Active — Partial (GPS/VTS provider confirmed; API access pending)
**Last Updated**: March 16, 2026

---

## 📋 Overview

This document provides detailed specifications for each external system that DFMS integrates with. For each system, we define:
- Purpose and use cases
- Integration pattern
- API specifications (high-level)
- Data exchanged
- Error handling
- Fallback strategies

---

## 1. GPS/VTS (Vehicle Tracking System) — GPSWOX + Concox GT06-ND

> **Provider confirmed**: Meeting with Nourish on 16 March 2026.
> See full meeting notes: [`06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md`](../../../../06-contracts/04-integration/meeting-notes/2026-03-16-gpswox-integration.md)
> API contract: [`06-contracts/04-integration/gps-vts-integration.yaml`](../../../../06-contracts/04-integration/gps-vts-integration.yaml)

### Confirmed Provider Stack

| Component | Detail |
|-----------|--------|
| **Software** | GPSWOX — https://www.gpswox.com/ |
| **Hardware** | Concox GT06-ND |
| **Dashboard** | http://206.189.141.206 (Nourish-managed) |
| **Data path** | Concox GT06-ND → GSM/GPRS → GPSWOX platform → REST API → DFMS |

### Integration Scope Boundary

Nourish retains full ownership of device management and GPSWOX platform configuration. DFMS is a **read-only consumer** of GPS data only.

| Nourish owns | DFMS consumes |
|--------------|---------------|
| Device installation & configuration | Live vehicle location |
| GPSWOX dashboard & device management | Speed and overspeed flag |
| SIM card and GSM connectivity | Breadcrumb trail (trip history) |
| Speed threshold configuration in GPSWOX | Geofence event detection |

### Integration Pattern

**Celery periodic poll** (every 30 seconds) — not WebSocket from GPSWOX.

```
Concox GT06-ND → [GSM/GPRS] → GPSWOX Platform
                                      ↓  REST API (every 30s)
                              Celery Worker (DFMS)
                                      ↓
                              Redis Cache (TTL: 30s)
                                      ↓
                              Django API Server
                                      ↓
                  Phase 1: HTTP polling  |  Phase 2+: WebSocket
                                      ↓
                          Command Centre Dashboard
```

### Confirmed Map Display Fields

Required fields confirmed in the 16 March 2026 meeting:

| Field | Type | Source |
|-------|------|--------|
| `latitude` | `float` | GPSWOX API |
| `longitude` | `float` | GPSWOX API |
| `speed` | `float` (km/h) | GPSWOX API |
| `overspeed` | `boolean` | GPSWOX API (threshold set in GPSWOX platform) |
| `heading` | `float` (degrees) | GPSWOX API |
| `timestamp` | `datetime` (UTC) | GPSWOX API |
| `ignition_status` | `on` / `off` | Concox GT06-ND via GPSWOX |

> **Overspeed in Phase 1**: Display only. Does not trigger automatic trip state changes.

### Map Configuration Requirements

| Setting | Value |
|---------|-------|
| Map type | **Terrain view** |
| Initial zoom | **~100 km radius** (regional fleet visibility) |
| Update frequency | 30 seconds |

### API Operations

**Get current vehicle location**:
```http
GET /api/v1/vehicles/{vehicle_id}/location
X-Api-Key: {gpswox_api_key}

Response 200:
{
  "vehicle_id": "GT06-00123",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "speed": 62.5,
  "overspeed": false,
  "heading": 180,
  "timestamp": "2026-03-16T08:30:00Z",
  "ignition_status": "on"
}
```

**Get vehicle location history (breadcrumb trail)**:
```http
GET /api/v1/vehicles/{vehicle_id}/location/history
    ?start_time=2026-03-16T06:00:00Z&end_time=2026-03-16T14:00:00Z
X-Api-Key: {gpswox_api_key}

Response 200:
{
  "vehicle_id": "GT06-00123",
  "route_points": [
    {"latitude": 23.8103, "longitude": 90.4125, "speed": 0, "overspeed": false, "timestamp": "..."},
    ...
  ]
}
```

> **API access status**: PENDING — Antu (Nourish GPS Operator) is contacting GPSWOX to request API credentials. Exact endpoint paths subject to update. Store credentials as `GPSWOX_API_KEY` and `GPSWOX_BASE_URL` in Django environment settings.

### Data Flow

```
DFMS Celery Task → GPSWOX API: GET /vehicles/{id}/location  (every 30s per active trip)
GPSWOX API → DFMS: {latitude, longitude, speed, overspeed, heading, timestamp}
DFMS → Redis: Cache location (TTL: 30s)
DFMS → PostgreSQL: Persist GPS point to trip_gps_data table
DFMS → Django API: Serve cached data to dashboard
```

### Error Handling

| Condition | Handling |
|-----------|----------|
| Timeout (5s) | Return Redis cached location; log warning |
| GPSWOX API down | Use last known location from Redis; show "last seen" timestamp |
| Invalid / missing data | Log error, skip update, retain last valid value |
| Rate limit (429) | Exponential backoff; alert ops team if sustained |
| Vehicle not found (404) | Log; check vehicle_id mapping between DFMS and GPSWOX |

### Fallback Strategy

**Primary**: GPSWOX REST API (preferred).

**Fallback**: If GPSWOX API access is denied or rate-limited:
- The Concox GT06-ND supports direct TCP/UDP data push to a custom server
- Mahfuz (BS23 Tech Lead) to confirm hardware capability and implementation effort
- This would require running a lightweight TCP listener as an additional DFMS service
- Decision pending API credential response from GPSWOX

### Django Settings Required

```python
# settings/base.py (values from environment variables)
GPSWOX_API_KEY  = env('GPSWOX_API_KEY')   # Pending Antu's email to GPSWOX
GPSWOX_BASE_URL = env('GPSWOX_BASE_URL', default='http://206.189.141.206/api/v1')
GPSWOX_TIMEOUT  = 5   # seconds
GPSWOX_POLL_INTERVAL = 30  # seconds
```

### Celery Task (Poll Schedule)

```python
# Periodic task — one per active trip, or single bulk poll
CELERY_BEAT_SCHEDULE = {
    'poll-gps-locations': {
        'task': 'apps.tracking.tasks.poll_active_vehicle_locations',
        'schedule': 30.0,  # every 30 seconds
    },
}
```

---

### Suggested Features (From Sadman — Nourish, 16 Mar 2026)

These were raised during the meeting. Both are **deferred** — not in current sprint scope. Do not implement until API access is confirmed and feasibility is validated.

#### A. Vehicle Assignment Optimisation

**Description**: At the time of assigning a vehicle to a transport requisition, sort the available vehicle list by real-time distance from the pickup POI rather than by default order.

**Approach**:
1. Fetch current location of all available vehicles from GPSWOX (single call per assignment action or from Redis cache)
2. Calculate Haversine distance from each vehicle to the pickup POI coordinates
3. Return sorted vehicle list to the assignment UI

**Dependencies**: GPSWOX API access, Redis cache populated with recent locations, Haversine distance utility (already used in geofencing module)

**Risk**: API rate limits if many vehicles queried simultaneously. Consider Redis-cached last-known location (30s staleness acceptable for assignment decisions).

**Status**: Deferred — add to backlog once GPSWOX API is live and rate limits are known.

#### B. Upcoming Vehicle Availability Forecasting

**Description**: Show a forecast of when vehicles currently in transit will become available, to support trip planning and scheduling.

**Approach**:
- Current vehicle location (GPSWOX) + destination POI coordinates → Maps API ETA
- Combined with trip state and expected remaining operations (unloading, QC, scale-out)
- Surface as "Available at ~{time}" on the vehicle assignment screen

**Dependencies**: GPSWOX API, Maps API (ETA), trip state data from DFMS, historical dwell time data per POI

**Status**: Phase 2+ candidate — requires data dependency validation and historical dwell time modelling.

---

## 2. ERP / Accounting Systems

### Purpose
Financial data synchronization for invoices, payments, and cost tracking.

### Integration Pattern
**Batch Synchronization** (daily) + **Real-Time API** (for critical updates)

### Use Cases
- Invoice synchronization
- Payment status updates
- Cost center mapping
- GL account integration
- Financial reporting data

### API Operations

**Sync Invoices (Batch)**:
```http
POST /api/v1/invoices/batch
Authorization: Bearer {api_key}
Content-Type: application/json

Request:
{
  "invoices": [
    {
      "invoice_number": "INV-001",
      "vendor_id": "V001",
      "amount": 15000.00,
      "currency": "BDT",
      "invoice_date": "2026-02-13",
      "line_items": [...]
    },
    ...
  ]
}

Response 200:
{
  "processed": 50,
  "failed": 0,
  "errors": []
}
```

**Get Payment Status**:
```http
GET /api/v1/payments/{payment_id}/status
Authorization: Bearer {api_key}

Response 200:
{
  "payment_id": "PAY-001",
  "status": "completed",
  "transaction_id": "TXN-12345",
  "completed_at": "2026-02-13T15:00:00Z"
}
```

### Data Flow
```
DFMS → Background Worker: Daily batch job
Background Worker → ERP: Sync invoices
ERP → Background Worker: Confirmation
Background Worker → DFMS: Update sync status
DFMS → Notifications: Alert finance team
```

### Error Handling
- **Batch Failure**: Retry individual invoices
- **Validation Error**: Log and skip, notify finance
- **API Down**: Queue for next batch

### ERP Systems
- SAP
- Oracle ERP
- Custom accounting systems
- QuickBooks (for smaller clients)

---

## 3. Mapping Services

### Purpose
Route planning, geocoding, and distance calculations.

### Integration Pattern
**Real-Time API** (on-demand)

### Use Cases
- Route optimization
- Distance calculation
- ETA estimation
- Geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)

### API Operations

**Get Route**:
```http
GET /api/directions?origin={lat},{lng}&destination={lat},{lng}
Authorization: Bearer {api_key}

Response 200:
{
  "routes": [
    {
      "distance": {
        "value": 120000,
        "text": "120 km"
      },
      "duration": {
        "value": 14400,
        "text": "4 hours"
      },
      "polyline": "encoded_polyline_string",
      "steps": [...]
    }
  ]
}
```

**Geocode Address**:
```http
GET /api/geocode?address={address}
Authorization: Bearer {api_key}

Response 200:
{
  "results": [
    {
      "formatted_address": "Bhaluka, Mymensingh, Bangladesh",
      "geometry": {
        "location": {
          "lat": 24.3917,
          "lng": 90.6500
        }
      }
    }
  ]
}
```

### Data Flow
```
DFMS → Maps API: Request route
Maps API → DFMS: Route details
DFMS → Database: Store route
DFMS → Mobile App: Display route
```

### Error Handling
- **API Down**: Use cached routes or manual distance
- **Invalid Address**: Prompt user for correction
- **Rate Limit**: Queue requests, use alternative provider

### Providers
- Google Maps API
- OpenStreetMap (OSM)
- Mapbox
- Local mapping services

---

## 4. SMS Gateway

### Purpose
Send SMS notifications to users (drivers, vendors, stakeholders).

### Integration Pattern
**Real-Time API** (event-driven)

### Use Cases
- Trip assignment notifications
- TO update alerts
- OTP for authentication
- Emergency alerts
- Delivery confirmations

### API Operations

**Send SMS**:
```http
POST /api/v1/sms/send
Authorization: Bearer {api_key}
Content-Type: application/json

Request:
{
  "to": "+8801712345678",
  "message": "Your trip TRIP-001 has been assigned. Check app for details.",
  "sender_id": "DFMS"
}

Response 200:
{
  "message_id": "MSG-12345",
  "status": "sent",
  "cost": 0.50
}
```

**Get Delivery Status**:
```http
GET /api/v1/sms/{message_id}/status
Authorization: Bearer {api_key}

Response 200:
{
  "message_id": "MSG-12345",
  "status": "delivered",
  "delivered_at": "2026-02-13T10:31:00Z"
}
```

### Data Flow
```
DFMS → Event Bus: TripAssigned event
Notifications Module → SMS Gateway: Send SMS
SMS Gateway → Notifications: Delivery status
Notifications → Database: Log notification
```

### Error Handling
- **Send Failure**: Retry 3 times with backoff
- **Invalid Number**: Log error, notify admin
- **Gateway Down**: Queue for later delivery

### Providers
- Twilio
- Local SMS gateway providers
- Telecom operator APIs

---

## 5. IoT Device Providers

### Purpose
Vehicle health monitoring, fuel tracking, temperature sensors.

### Integration Pattern
**Real-Time API** + **MQTT** (for sensor data streams)

### Use Cases
- Fuel consumption monitoring
- Engine diagnostics
- Temperature monitoring (cold chain)
- Vehicle health metrics
- Predictive maintenance alerts

### API Operations

**Get Vehicle Metrics**:
```http
GET /api/v1/devices/{device_id}/metrics
Authorization: Bearer {api_key}

Response 200:
{
  "device_id": "DEV-001",
  "vehicle_id": "ABC123",
  "metrics": {
    "fuel_level": 75.5,
    "engine_temp": 85.0,
    "battery_voltage": 12.6,
    "odometer": 45230.5
  },
  "timestamp": "2026-02-13T10:30:00Z"
}
```

**Subscribe to Sensor Stream (MQTT)**:
```
Topic: devices/{device_id}/metrics
Payload:
{
  "fuel_level": 75.5,
  "engine_temp": 85.0,
  "timestamp": "2026-02-13T10:30:00Z"
}
```

### Data Flow
```
IoT Device → MQTT Broker: Publish metrics
DFMS → MQTT Broker: Subscribe to topics
DFMS → Database: Store metrics
DFMS → Analytics: Process for insights
```

### Error Handling
- **Connection Lost**: Reconnect automatically
- **Invalid Data**: Log and skip
- **Device Offline**: Use last known values

### Providers
- Fuel monitoring device manufacturers
- Temperature sensor providers
- Vehicle diagnostics systems

---

## 6. Payment Gateway (Phase 3)

### Purpose
Online vendor payments and transaction processing.

### Integration Pattern
**Real-Time API** + **Webhook** (for payment confirmations)

### Use Cases
- Vendor invoice payments
- Online payment processing
- Payment status tracking
- Refund processing

### API Operations

**Initiate Payment**:
```http
POST /api/v1/payments
Authorization: Bearer {api_key}
Content-Type: application/json

Request:
{
  "amount": 15000.00,
  "currency": "BDT",
  "vendor_id": "V001",
  "invoice_id": "INV-001",
  "callback_url": "https://dfms.example.com/webhooks/payment"
}

Response 200:
{
  "payment_id": "PAY-12345",
  "status": "pending",
  "payment_url": "https://gateway.example.com/pay/PAY-12345"
}
```

**Webhook (Payment Confirmation)**:
```http
POST /webhooks/payment
X-Webhook-Signature: {signature}
Content-Type: application/json

Payload:
{
  "payment_id": "PAY-12345",
  "status": "completed",
  "transaction_id": "TXN-67890",
  "completed_at": "2026-02-13T15:00:00Z"
}
```

### Data Flow
```
DFMS → Payment Gateway: Initiate payment
Payment Gateway → Vendor: Payment page
Vendor → Payment Gateway: Complete payment
Payment Gateway → DFMS (Webhook): Confirmation
DFMS → Database: Update payment status
DFMS → Notifications: Notify finance team
```

### Error Handling
- **Payment Failed**: Notify vendor, allow retry
- **Webhook Missed**: Poll payment status
- **Gateway Down**: Queue payments, process later

### Providers
- Stripe
- PayPal
- Local payment gateways
- Bank payment APIs

---

## 📊 Integration Summary Matrix

| System | Pattern | Frequency | Criticality | Fallback |
|--------|---------|-----------|-------------|----------|
| **GPS/VTS** | Real-Time API | 30-60s | High | Cached location |
| **ERP** | Batch + API | Daily + On-demand | High | Queue for retry |
| **Maps** | Real-Time API | On-demand | Medium | Cached routes |
| **SMS** | Real-Time API | Event-driven | Medium | Queue for retry |
| **IoT** | MQTT + API | Real-time | Low | Last known values |
| **Payment** | API + Webhook | On-demand | Medium (Phase 3) | Manual processing |

---

## 🔗 Related Documents

- [Integration Patterns](./integration-patterns.md) - Implementation patterns
- [System Overview](../system-overview.md) - External systems context
- [Container View](../container-view.md) - Integration architecture

---

**Document Status**: Active — Partial (GPS/VTS provider confirmed 2026-03-16; API credentials pending; other integrations remain draft)
**Next Steps**: Confirm GPSWOX API credentials → update endpoint paths in contract → implement `GPSService` polling task
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

