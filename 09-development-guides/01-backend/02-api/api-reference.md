# API Reference

> Django REST Framework implementation details

## 📖 API Contracts

> **Source of Truth**: [`06-contracts/api/`](../../../06-contracts/api/)

All API endpoints follow the OpenAPI 3.0 contracts defined in the DFMS Product Context submodule:

- **[Transport Management API](../../../06-contracts/api/rest/transport-management.yaml)**
- **[Product Requisition API](../../../06-contracts/api/rest/product-requisition.yaml)**
- **[Vendor Management API](../../../06-contracts/api/rest/vendor-management.yaml)**
- **[Operations Management API](../../../06-contracts/api/rest/operations-management.yaml)**
- **[Quality Control API](../../../06-contracts/api/rest/quality-control.yaml)**
- **[Master Data Management API](../../../06-contracts/api/rest/master-data-management.yaml)**
- **[Trip Costing API](../../../06-contracts/api/rest/trip-costing.yaml)**
- **[Reporting API](../../../06-contracts/api/rest/reporting.yaml)**
- **[Notifications API](../../../06-contracts/api/rest/notifications.yaml)**
- **[Mobile API](../../../06-contracts/api/rest/mobile.yaml)**

This document provides **Django REST Framework implementation details** for these APIs.

## Overview

DFMS REST API built with Django REST Framework provides comprehensive endpoints for managing distribution and fleet operations. All APIs follow RESTful principles with JSON request/response format and JWT authentication.

**Implementation**: Django REST Framework (DRF)  
**API Contracts**: OpenAPI 3.0 (see submodule)

## Base URL
```
Production: https://api.dfms.com/api/v1
Staging: https://staging.dfms.com/api/v1
Development: http://localhost:8000/api/v1
```

## Authentication

### JWT Token Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for all authenticated requests.

### Login
```http
POST /api/v1/auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response: 200 OK
{
  "access": "eyJhbGciOiJIUzI1NiIs...",
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "username": "johndoe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "manager",
    "tenant": "tenant_001",
    "permissions": [
      "fleet.view_vehicle",
      "fleet.add_vehicle",
      "transport.view_trip",
      "transport.add_trip"
    ]
  }
}
```

### Refresh Token
```http
POST /auth/refresh
Authorization: Bearer {refresh_token}

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 900
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer {access_token}

Response: 204 No Content
```

## Common Headers
```http
Authorization: Bearer {access_token}
X-Tenant-ID: 123e4567-e89b-12d3-a456-426614174000
X-Request-ID: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json
Accept: application/json
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Pagination
```http
GET /vehicles?page=1&limit=20&sort=-createdAt

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering
```http
GET /vehicles?status=active&type=covered_van&vendor=vendor-123
```

## Core Endpoints

### Users

#### List Users
```http
GET /users
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- role: string (admin|manager|operator|viewer)
- status: string (active|inactive|suspended)
- department: string
- search: string (searches name, email)

Response: 200 OK
{
  "data": [
    {
      "id": "user-123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "manager",
      "department": "logistics",
      "status": "active",
      "createdAt": "2024-01-15T08:00:00Z"
    }
  ],
  "pagination": {...}
}
```

#### Get User
```http
GET /users/{userId}

Response: 200 OK
{
  "id": "user-123",
  "email": "john@example.com",
  "name": "John Doe",
  "role": "manager",
  "department": "logistics",
  "permissions": [...],
  "mfaEnabled": true,
  "lastLogin": "2024-01-20T10:00:00Z",
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-20T10:00:00Z"
}
```

#### Create User
```http
POST /users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "New User",
  "password": "SecureP@ss123",
  "role": "operator",
  "department": "warehouse",
  "permissions": ["vehicle:read", "trip:read"]
}

Response: 201 Created
```

#### Update User
```http
PATCH /users/{userId}
Content-Type: application/json

{
  "name": "Updated Name",
  "department": "transport",
  "status": "active"
}

Response: 200 OK
```

#### Delete User
```http
DELETE /users/{userId}

Response: 204 No Content
```

### Vehicles

#### List Vehicles
```http
GET /vehicles

Query Parameters:
- status: available|in_use|maintenance|retired
- type: covered_van|open_truck|refrigerated
- vendor: string (vendor ID)
- capacity_min: number
- capacity_max: number

Response: 200 OK
{
  "data": [
    {
      "id": "veh-789",
      "registrationNo": "DK-11-1234",
      "type": "covered_van",
      "status": "available",
      "capacity": {
        "weight": 5000,
        "volume": 25
      },
      "vendor": {
        "id": "vendor-123",
        "name": "ABC Transport"
      },
      "currentLocation": {
        "lat": 23.7104,
        "lng": 90.4074
      }
    }
  ]
}
```

#### Track Vehicle
```http
GET /vehicles/{vehicleId}/track

Response: 200 OK
{
  "vehicleId": "veh-789",
  "currentLocation": {
    "lat": 23.7104,
    "lng": 90.4074,
    "timestamp": "2024-01-20T10:30:00Z"
  },
  "speed": 45,
  "heading": 180,
  "engineStatus": "on",
  "fuel": 75,
  "driver": {
    "id": "driver-456",
    "name": "John Driver"
  },
  "currentTrip": {
    "id": "trip-001",
    "status": "in_progress"
  }
}
```

### Trips

#### Create Trip
```http
POST /trips
Content-Type: application/json

{
  "vehicleId": "veh-789",
  "driverId": "driver-456",
  "helperId": "helper-123",
  "transportOrderIds": ["to-001", "to-002"],
  "route": [
    {
      "poiId": "poi-001",
      "type": "pickup",
      "sequence": 1,
      "estimatedArrival": "2024-01-20T09:00:00Z"
    },
    {
      "poiId": "poi-002",
      "type": "delivery",
      "sequence": 2,
      "estimatedArrival": "2024-01-20T11:00:00Z"
    }
  ],
  "plannedStart": "2024-01-20T08:00:00Z",
  "plannedEnd": "2024-01-20T18:00:00Z"
}

Response: 201 Created
```

#### Start Trip
```http
POST /trips/{tripId}/start
Content-Type: application/json

{
  "odometerReading": 45678,
  "fuelLevel": 85,
  "driverChecklistCompleted": true,
  "startLocation": {
    "lat": 23.7104,
    "lng": 90.4074
  }
}

Response: 200 OK
```

#### Update Trip Location
```http
POST /trips/{tripId}/location
Content-Type: application/json

{
  "lat": 23.7204,
  "lng": 90.4174,
  "timestamp": "2024-01-20T10:30:00Z",
  "speed": 45,
  "heading": 180
}

Response: 204 No Content
```

#### Complete Trip
```http
POST /trips/{tripId}/complete
Content-Type: application/json

{
  "odometerReading": 45778,
  "fuelLevel": 60,
  "actualEnd": "2024-01-20T17:30:00Z",
  "expenses": [
    {
      "type": "toll",
      "amount": 100,
      "receipt": "receipt-url"
    }
  ]
}

Response: 200 OK
```

### Transport Orders

#### Create Transport Order
```http
POST /transport-orders
Content-Type: application/json

{
  "requisitionId": "tr-001",
  "type": "standard",
  "priority": "high",
  "products": [
    {
      "productId": "prod-001",
      "quantity": 100,
      "unit": "pcs"
    }
  ],
  "origin": {
    "poiId": "poi-001",
    "loadingTime": 30
  },
  "destination": {
    "poiId": "poi-002",
    "unloadingTime": 45
  },
  "requestedDate": "2024-01-22",
  "instructions": "Handle with care"
}

Response: 201 Created
```

#### Approve Transport Order
```http
POST /transport-orders/{orderId}/approve
Content-Type: application/json

{
  "comments": "Approved for immediate dispatch",
  "vehicleId": "veh-789",
  "driverId": "driver-456"
}

Response: 200 OK
```

### POI (Points of Interest)

#### List POIs
```http
GET /pois

Query Parameters:
- type: warehouse|customer|vendor|hub
- status: active|inactive
- city: string
- search: string

Response: 200 OK
```

#### Create POI
```http
POST /pois
Content-Type: application/json

{
  "name": "New Warehouse",
  "type": "warehouse",
  "address": {
    "street": "123 Main St",
    "city": "Dhaka",
    "postalCode": "1212",
    "country": "BD"
  },
  "location": {
    "lat": 23.7104,
    "lng": 90.4074
  },
  "geofence": {
    "type": "circle",
    "radius": 100
  },
  "operatingHours": {...},
  "contacts": [...]
}

Response: 201 Created
```

### Geofencing

#### Check Geofence Status
```http
GET /geofences/{poiId}/check?lat=23.7104&lng=90.4074

Response: 200 OK
{
  "inside": true,
  "distance": 50,
  "poi": {
    "id": "poi-001",
    "name": "Central Warehouse"
  }
}
```

#### Geofence Events
```http
POST /geofences/events
Content-Type: application/json

{
  "vehicleId": "veh-789",
  "poiId": "poi-001",
  "event": "entry",
  "timestamp": "2024-01-20T10:30:00Z",
  "location": {
    "lat": 23.7104,
    "lng": 90.4074
  }
}

Response: 201 Created
```

### Quality Control

#### Submit QC Check
```http
POST /qc/checks
Content-Type: application/json

{
  "type": "loading",
  "tripId": "trip-001",
  "vehicleId": "veh-789",
  "items": [
    {
      "productId": "prod-001",
      "expectedQty": 100,
      "actualQty": 98,
      "condition": "good",
      "issues": ["2 items damaged"]
    }
  ],
  "photos": ["url1", "url2"],
  "inspectorId": "user-789",
  "location": "poi-001"
}

Response: 201 Created
```

### Reports

#### Trip Report
```http
GET /reports/trips?startDate=2024-01-01&endDate=2024-01-31

Response: 200 OK
{
  "summary": {
    "totalTrips": 250,
    "completedTrips": 240,
    "onTimeDelivery": 95.5,
    "totalDistance": 15000,
    "avgTripDuration": 6.5
  },
  "byStatus": {...},
  "byVehicle": {...},
  "byDriver": {...}
}
```

#### Fleet Utilization
```http
GET /reports/fleet-utilization?date=2024-01-20

Response: 200 OK
{
  "totalVehicles": 50,
  "activeVehicles": 35,
  "utilizationRate": 70,
  "breakdown": {
    "in_use": 35,
    "available": 10,
    "maintenance": 3,
    "retired": 2
  }
}
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.dfms.com/ws');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'Bearer {access_token}'
}));
```

### Subscribe to Events
```javascript
// Subscribe to vehicle tracking
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'vehicle',
  vehicleId: 'veh-789'
}));

// Subscribe to trip updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'trip',
  tripId: 'trip-001'
}));
```

### Event Messages
```javascript
// Vehicle location update
{
  "type": "vehicle_location",
  "vehicleId": "veh-789",
  "data": {
    "lat": 23.7104,
    "lng": 90.4074,
    "speed": 45,
    "timestamp": "2024-01-20T10:30:00Z"
  }
}

// Geofence event
{
  "type": "geofence_event",
  "vehicleId": "veh-789",
  "poiId": "poi-001",
  "event": "entry",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid or expired token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## Rate Limiting

- **Default**: 1000 requests per hour
- **Authenticated**: 5000 requests per hour
- **Headers**:
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## API Versioning

- Current version: `v1`
- Version in URL: `/v1/endpoint`
- Deprecation notice: 6 months
- End of life: 12 months after deprecation