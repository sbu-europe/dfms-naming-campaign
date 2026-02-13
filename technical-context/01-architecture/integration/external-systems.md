# DFMS External Systems

> Detailed specifications for external system integrations

**Status**: 🚧 Draft  
**Last Updated**: February 13, 2026

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

## 1. GPS/VTS (Vehicle Tracking System) Providers

### Purpose
Real-time vehicle location tracking and trip monitoring.

### Integration Pattern
**Real-Time API** + **WebSocket** (for continuous updates)

### Use Cases
- Real-time vehicle location tracking
- Trip route tracking
- Geofence alerts
- Historical route playback
- Vehicle speed monitoring

### API Operations

**Get Vehicle Location**:
```http
GET /api/v1/vehicles/{vehicle_id}/location
Authorization: Bearer {api_key}

Response 200:
{
  "vehicle_id": "ABC123",
  "latitude": 23.8103,
  "longitude": 90.4125,
  "speed": 45.5,
  "heading": 180,
  "timestamp": "2026-02-13T10:30:00Z",
  "ignition_status": "on"
}
```

**Get Trip Route**:
```http
GET /api/v1/trips/{trip_id}/route
Authorization: Bearer {api_key}

Response 200:
{
  "trip_id": "TRIP-001",
  "route_points": [
    {
      "latitude": 23.8103,
      "longitude": 90.4125,
      "timestamp": "2026-02-13T10:00:00Z"
    },
    ...
  ]
}
```

### Data Flow
```
DFMS → GPS Provider: Request location
GPS Provider → DFMS: Current location
DFMS → Database: Store location
DFMS → Cache (Redis): Update real-time cache
DFMS → WebSocket: Push to dashboard
```

### Error Handling
- **Timeout (5s)**: Return cached location
- **API Down**: Use last known location
- **Invalid Data**: Log error, skip update

### Providers
- Local GPS device providers
- Fleet management system APIs
- Custom GPS hardware integrations

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

**Document Status**: 🚧 Draft  
**Next Steps**: Finalize provider selection, implement adapters  
**Contact**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

