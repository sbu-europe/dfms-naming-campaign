# Repository Purpose & Architecture

> Domain knowledge and interface contracts for the DFMS product ecosystem

## 🎯 Purpose

This repository serves as the **central domain knowledge and interface contract layer** for the DFMS (Distribution and Fleet Management System) product. It will be imported as a **git submodule** into all implementation repositories (backend, frontend, mobile, devops).

## 🏗️ What This Repository Contains

### ✅ **Included**

1. **Business Domain Knowledge**
   - Business processes and rules
   - Requirements and features
   - User stories and workflows
   - Stakeholder insights

2. **High-Level Technical Architecture**
   - System overview and context
   - Module boundaries and responsibilities
   - Integration patterns
   - Architectural principles and decisions

3. **Interface Contracts** (THE GLUE)
   - **API Contracts**: REST/GraphQL endpoint definitions
   - **Event Contracts**: Event schemas for async communication
   - **Data Contracts**: Shared data models and schemas
   - **Message Contracts**: Queue/pub-sub message formats
   - These define HOW different systems communicate

### ❌ **Not Included**

1. **Concrete Implementation**
   - Actual code (backend logic, frontend components, etc.)
   - Framework-specific details
   - Build configurations
   - Deployment scripts

2. **Implementation-Specific Architecture**
   - Detailed class diagrams
   - Internal service structure
   - Database migration files
   - Infrastructure as code

---

## 🔗 Repository Relationship

### This Repository as a Submodule

```bash
# Backend repo structure
DFMS-backend/
├── domain/  (git submodule → DFMS-product-context)
│   ├── business-context/
│   └── technical-context/
│       └── 05-contracts/
├── src/
├── tests/
└── package.json

# Frontend repo structure
DFMS-frontend/
├── domain/  (git submodule → DFMS-product-context)
│   ├── business-context/
│   └── technical-context/
│       └── 05-contracts/
├── src/
├── public/
└── package.json

# Mobile repo structure
DFMS-mobile/
├── domain/  (git submodule → DFMS-product-context)
│   ├── business-context/
│   └── technical-context/
│       └── 05-contracts/
├── src/
└── app.json
```

### How Implementation Repos Use This

```typescript
// Backend imports contracts from submodule
import { TransportOrderDTO } from '../domain/contracts/api/transport-order';
import { TripCreatedEvent } from '../domain/contracts/events/trip-events';

// Frontend imports contracts from submodule
import { TransportOrderDTO } from '../domain/contracts/api/transport-order';
import { ApiEndpoints } from '../domain/contracts/api/endpoints';

// Mobile imports contracts from submodule
import { TransportOrderDTO } from '../domain/contracts/api/transport-order';
import { TripStatusEnum } from '../domain/contracts/enums/trip-status';
```

---

## 📂 Repository Structure

```
DFMS-product-context/
│
├── README.md
├── REPOSITORY_PURPOSE.md          # This file
├── PRODUCT_VISION.md
├── BUSINESS_CONTEXT_PLAN.md       # Plan for business domain knowledge
├── TECHNICAL_CONTEXT_PLAN.md      # Plan for architecture & contracts
│
├── source-documents/              # Original BA documents
│   └── [All source materials]
│
├── business-context/              # Business Domain Knowledge
│   ├── 00-overview/
│   ├── 01-business-domain/
│   ├── 02-requirements/
│   ├── 03-features/
│   ├── 04-architecture/          # HIGH-LEVEL architecture only
│   │   ├── system-overview.md
│   │   ├── module-boundaries.md
│   │   ├── integration-patterns.md
│   │   └── architectural-decisions/
│   ├── 05-workflows/
│   ├── 06-data-reference/
│   ├── 07-stakeholder-insights/
│   ├── 08-implementation/        # High-level deployment strategy
│   └── 10-reference/
│
└── contracts/                     # THE INTERFACE LAYER (NEW)
    ├── README.md
    │
    ├── api/                       # API Contracts
    │   ├── README.md
    │   ├── openapi/
    │   │   ├── openapi-spec.yaml
    │   │   └── schemas/
    │   ├── rest/
    │   │   ├── transport-management.yaml
    │   │   ├── fleet-management.yaml
    │   │   ├── quality-control.yaml
    │   │   └── vendor-management.yaml
    │   └── graphql/
    │       └── schema.graphql
    │
    ├── events/                    # Event Contracts
    │   ├── README.md
    │   ├── trip-events.yaml
    │   ├── vehicle-events.yaml
    │   ├── qc-events.yaml
    │   └── notification-events.yaml
    │
    ├── data-models/              # Shared Data Contracts
    │   ├── README.md
    │   ├── entities/
    │   │   ├── transport-order.yaml
    │   │   ├── trip.yaml
    │   │   ├── vehicle.yaml
    │   │   └── driver.yaml
    │   ├── enums/
    │   │   ├── trip-status.yaml
    │   │   ├── vehicle-type.yaml
    │   │   └── order-status.yaml
    │   └── value-objects/
    │       ├── address.yaml
    │       ├── location.yaml
    │       └── contact-info.yaml
    │
    ├── messages/                 # Message Queue Contracts
    │   ├── README.md
    │   ├── commands/
    │   │   ├── create-trip.yaml
    │   │   └── assign-vehicle.yaml
    │   └── queries/
    │       ├── get-trip-details.yaml
    │       └── list-vehicles.yaml
    │
    └── integration/              # Integration Contracts
        ├── README.md
        ├── erp-integration.yaml
        ├── gps-device-integration.yaml
        └── sms-gateway-integration.yaml
```

---

## 🎯 Key Principles

### 1. **Single Source of Truth**
- Business domain knowledge lives here
- Interface contracts defined once, used everywhere
- All repos reference the same contracts

### 2. **High-Level Abstraction**
- Focus on WHAT and WHY, not HOW
- Module boundaries, not implementation details
- Contracts, not code

### 3. **Technology Agnostic**
- Contracts in YAML/JSON Schema (not language-specific)
- Can be consumed by any tech stack
- Backend (Node.js), Frontend (React), Mobile (React Native/Flutter)

### 4. **Version Controlled**
- Contract changes tracked in git
- All repos see contract updates via submodule
- Breaking changes require coordination

### 5. **Documentation First**
- Business requirements documented before contracts
- Contracts defined before implementation
- Implementation repos reference contracts

---

## 🔄 Development Workflow

### Phase 1: Business Context (Current)
1. ✅ Gather requirements from stakeholders
2. ✅ Organize source documents
3. ⏳ Build knowledge-base from source documents
4. ⏳ Document business processes and workflows

### Phase 2: High-Level Architecture
1. Define system context (C4 Level 1)
2. Define module boundaries (C4 Level 2)
3. Define integration patterns
4. Make architectural decisions (ADRs)

### Phase 3: Interface Contracts
1. Define API contracts (OpenAPI/GraphQL)
2. Define event contracts (async communication)
3. Define data models (shared entities)
4. Define message contracts (commands/queries)

### Phase 4: Implementation (In Separate Repos)
1. Create implementation repos (backend, frontend, mobile)
2. Add this repo as git submodule
3. Import contracts from submodule
4. Implement concrete logic

---

## 📋 Contract Example

### API Contract (YAML)

**File**: `contracts/api/rest/transport-order.yaml`

```yaml
openapi: 3.0.0
info:
  title: Transport Order API
  version: 1.0.0

paths:
  /api/v1/transport-orders:
    post:
      summary: Create a new transport order
      operationId: createTransportOrder
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTransportOrderRequest'
      responses:
        '201':
          description: Transport order created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TransportOrderResponse'

components:
  schemas:
    CreateTransportOrderRequest:
      type: object
      required:
        - transportRequestId
        - vehicleId
        - driverId
      properties:
        transportRequestId:
          type: string
          format: uuid
        vehicleId:
          type: string
          format: uuid
        driverId:
          type: string
          format: uuid
```

### Event Contract (YAML)

**File**: `contracts/events/trip-events.yaml`

```yaml
events:
  TripCreated:
    version: 1.0.0
    description: Emitted when a new trip is created
    payload:
      type: object
      required:
        - tripId
        - orderId
        - vehicleId
        - driverId
        - createdAt
      properties:
        tripId:
          type: string
          format: uuid
        orderId:
          type: string
          format: uuid
        vehicleId:
          type: string
          format: uuid
        driverId:
          type: string
          format: uuid
        createdAt:
          type: string
          format: date-time
```

### How Repos Use These Contracts

```typescript
// Backend (DFMS-backend/src/services/transport-order.service.ts)
import { CreateTransportOrderRequest } from '../domain/contracts/api/transport-order';
import { TripCreatedEvent } from '../domain/contracts/events/trip-events';

class TransportOrderService {
  async createOrder(request: CreateTransportOrderRequest) {
    // Implementation
    const order = await this.repository.create(request);
    
    // Emit event following contract
    await this.eventBus.publish<TripCreatedEvent>({
      tripId: order.tripId,
      orderId: order.id,
      // ... follows event contract
    });
  }
}

// Frontend (DFMS-frontend/src/api/transport-order.api.ts)
import { CreateTransportOrderRequest } from '../domain/contracts/api/transport-order';

class TransportOrderAPI {
  async createOrder(request: CreateTransportOrderRequest) {
    return await fetch('/api/v1/transport-orders', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}
```

---

## ✅ Benefits of This Approach

### 1. **Consistency**
- All systems speak the same language
- Same data structures everywhere
- No "translation" bugs between frontend/backend

### 2. **Contract-First Development**
- Define contracts before implementing
- Frontend and backend can develop in parallel
- Clear expectations for integrations

### 3. **Type Safety**
- Generate types from contracts (TypeScript, Java, etc.)
- Compile-time errors for contract violations
- Reduced runtime errors

### 4. **Documentation**
- Contracts are self-documenting
- Always up-to-date (part of code)
- Single source of truth

### 5. **Versioning**
- Track contract changes via git
- Coordinate breaking changes across repos
- Clear migration path

### 6. **Domain Knowledge**
- Business context alongside technical contracts
- New developers understand WHY and WHAT before HOW
- Reduces onboarding time

---

## 🔄 Updating This Repository

### When to Update

1. **New Feature**: Business requirement → Update knowledge-base → Define contracts
2. **API Change**: Update contract → Coordinate with implementation repos
3. **Architecture Decision**: Document in ADR → Update high-level architecture
4. **Business Rule Change**: Update business domain docs → May affect contracts

### Update Process

```bash
# In this repo
git checkout -b feature/add-vendor-rating-api
# Update contracts/api/rest/vendor-management.yaml
git commit -m "Add vendor rating API contract"
git push

# In implementation repos (after merge)
cd DFMS-backend
git submodule update --remote domain
# Now backend sees new contracts
```

---

## 📚 Related Documents

- [PRODUCT_VISION.md](PRODUCT_VISION.md) - Product strategy and vision
- [BUSINESS_CONTEXT_PLAN.md](BUSINESS_CONTEXT_PLAN.md) - Plan for building business domain knowledge
- [TECHNICAL_CONTEXT_PLAN.md](TECHNICAL_CONTEXT_PLAN.md) - Plan for building technical architecture & contracts
- [technical-context/01-architecture/](technical-context/01-architecture/) - High-level architecture (C4 Level 1-2)
- [technical-context/05-contracts/](technical-context/05-contracts/) - API & Event contracts (OpenAPI/AsyncAPI)
- [technical-context/03-decisions/](technical-context/03-decisions/) - Architecture Decision Records (ADRs)

---

## 🎯 Summary

**This repository is:**
- ✅ Business domain knowledge
- ✅ High-level technical architecture
- ✅ Interface contracts (APIs, Events, Data Models)
- ✅ The GLUE between all implementation repos
- ✅ A git submodule for backend, frontend, mobile, devops repos

**This repository is NOT:**
- ❌ Concrete implementation code
- ❌ Framework-specific details
- ❌ Infrastructure as code
- ❌ Build configurations

---

**Repository Type**: Domain Context + Interface Contracts  
**Usage**: Git submodule in all implementation repos  
**Audience**: Product managers, Business analysts, Architects, All developers  
**Purpose**: Single source of truth for domain knowledge and system integration  
**Architecture & Technical Lead**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

