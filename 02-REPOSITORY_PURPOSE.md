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
│   ├── 02-domain/
│   ├── 04-architecture/
│   ├── 05-modules/
│   └── 06-contracts/
├── src/
├── tests/
└── requirements.txt

# Frontend repo structure
DFMS-frontend/
├── domain/  (git submodule → DFMS-product-context)
│   ├── 06-contracts/
│   ├── 07-design-system/
│   └── 05-modules/
├── src/
└── package.json

# Mobile repo structure (actual)
nourish-vendor-app/
├── DFMS-product-context/   (git submodule in nourish-vendor-app → this repo)
├── lib/                    # Flutter presentation
├── domain/
├── data/
└── .maestro/
```

> Historical placeholder names `DFMS-backend` / `DFMS-frontend` / `DFMS-mobile` above may still appear in older examples. **Current repos:** `nourish-backend`, `nourish-vendor-app` (Vendor Flutter). There is no separate Driver/QC Flutter repo in Phase 1.
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
├── README.md
├── 00-START-HERE.md               # Navigation guide (start here!)
├── 01-PRODUCT_VISION.md           # Product vision and strategy
├── 02-REPOSITORY_PURPOSE.md       # This file
│
├── 01-source/                     # Original source documents (do not modify)
├── 02-domain/                     # Business domain context
├── 03-backlog/                    # Product backlog (sprints + stories)
├── 04-architecture/               # System architecture, ADRs, deployment
│   ├── 01-system-design/          # C4 Level 1-2 diagrams
│   ├── 03-decisions/              # Architecture Decision Records
│   ├── 04-backend/                # Django/Python architecture
│   ├── 06-deployment/             # AWS strategy & environments
│   └── 07-implementation/         # Implementation planning
├── 05-modules/                    # Technical module specifications
├── 06-contracts/                  # THE INTERFACE LAYER
│   ├── 01-apis/rest/              # OpenAPI 3.0 specs (14 specs)
│   ├── 02-data-models/            # Shared data schemas
│   ├── 03-events/                 # Event contracts
│   └── 04-integration/            # External integration contracts
├── 07-design-system/              # UI/UX design system
├── 08-development-guides/         # Backend implementation runbooks
├── 09-testing/                    # Testing strategy & E2E scenarios
├── 10-reference/                  # Data dictionaries & reference
├── 11-change-requests/            # Change management
└── _meta/                         # Internal plans, reports, tracking
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

- [01-PRODUCT_VISION.md](01-PRODUCT_VISION.md) - Product strategy and vision
- [00-START-HERE.md](00-START-HERE.md) - Navigation guide for all roles
- [04-architecture/01-system-design/](04-architecture/01-system-design/) - High-level architecture (C4 Level 1-2)
- [04-architecture/03-decisions/](04-architecture/03-decisions/) - Architecture Decision Records (ADRs)
- [04-architecture/06-deployment/](04-architecture/06-deployment/) - AWS deployment strategy & environments
- [06-contracts/](06-contracts/) - API & Event contracts (OpenAPI 3.0)
- [08-development-guides/01-backend/](08-development-guides/01-backend/) - Backend implementation runbooks

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
**Last Updated**: May 2026  
**Architecture & Technical Lead**: Md. Mahfuzur Rahman (Mahfuzur.rahman@brainstation-23.com)

