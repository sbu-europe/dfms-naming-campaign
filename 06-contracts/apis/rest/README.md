# REST API Contracts

> OpenAPI 3.0 specifications for DFMS REST APIs

---

## 📋 Overview

This directory contains OpenAPI 3.0 specifications for all DFMS REST API endpoints. Each module has its own API contract file.

---

## 📁 API Contracts

### Core Modules (Phase 1)

1. **[Master Data Management](./master-data-management.yaml)**
   - Vehicle management
   - Driver management
   - Vendor master data
   - POI management
   - Product management

2. **[Product Requisition](./product-requisition.yaml)**
   - PR creation and management
   - Approval workflows
   - TR generation

3. **[Transport Management](./transport-management.yaml)** ✅
   - Transport Request (TR) management
   - Transport Order (TO) management
   - Trip lifecycle

4. **[Vendor Management](./vendor-management.yaml)**
   - Vendor onboarding
   - Bidding portal
   - Vendor assignment

5. **[Operations Management](./operations-management.yaml)**
   - Gate management
   - Weighing operations
   - Loading/unloading

6. **[Quality Control](./quality-control.yaml)**
   - QC inspections
   - Sampling and lab tests
   - Pass/fail decisions

7. **[Trip Costing](./trip-costing.yaml)**
   - Cost calculation
   - Invoice generation
   - ERP synchronization

### Supporting Modules

8. **[Reporting](./reporting.yaml)**
   - Dashboards
   - Reports
   - KPIs

9. **[Mobile APIs](./mobile.yaml)**
   - Driver mobile APIs
   - QC mobile APIs
   - Vendor mobile APIs

10. **[Notifications](./notifications.yaml)**
    - Notification management
    - Preferences
    - Alerts

---

## 🔧 Common Patterns

### Authentication
All APIs use JWT Bearer tokens:
```yaml
security:
  - bearerAuth: []
```

### Pagination
Standard pagination parameters:
```yaml
parameters:
  - name: page
    in: query
    schema:
      type: integer
      default: 1
  - name: page_size
    in: query
    schema:
      type: integer
      default: 20
      maximum: 100
```

### Error Responses
Standard error response format:
```yaml
ErrorResponse:
  type: object
  properties:
    error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
```

---

## 📝 Usage

### Code Generation
Generate client SDKs from OpenAPI specs:
```bash
# Python client
openapi-generator generate -i transport-management.yaml -g python -o python-client

# TypeScript client
openapi-generator generate -i transport-management.yaml -g typescript-axios -o typescript-client
```

### Validation
Validate API requests/responses:
```python
from openapi_core import validate_request, validate_response

# Validate request
validate_request(request, spec)

# Validate response
validate_response(response, spec)
```

---

## 🔗 Related Documents

- [Common Schemas](../schemas/)
- [Module Boundaries](../../../01-architecture/modules/module-boundaries.md)

---

**Last Updated**: February 13, 2026  
**Status**: 🚧 In Progress

